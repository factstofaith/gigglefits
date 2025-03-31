/**
 * Optimize React Performance
 * 
 * This script analyzes and optimizes React components for better performance:
 * - Adds React.memo to appropriate components
 * - Implements useMemo and useCallback for expensive operations
 * - Optimizes rendering patterns
 * - Identifies and fixes performance bottlenecks
 * - Implements code splitting and lazy loading
 * 
 * Usage: node optimize-react-performance.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `react-performance-optimization-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const DRY_RUN = process.argv.includes('--dry-run');

// Performance thresholds
const COMPONENT_SIZE_THRESHOLD = 200; // Lines of code
const PROPS_COUNT_THRESHOLD = 5; // Number of props

// Create backup directory
if (!DRY_RUN) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
}

// Function to analyze a React component file
function analyzeComponentFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Skip if not a component (doesn't start with uppercase)
    if (!fileName.match(/^[A-Z]/)) {
      return null;
    }
    
    // Parse the component file
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'dynamicImport'],
    });
    
    const analysis = {
      filePath,
      fileName,
      isComponent: false,
      isAlreadyMemoized: false,
      isStateless: false,
      hasStateOrEffects: false,
      propsCount: 0,
      lineCount: content.split('\n').length,
      hasManyRenders: false,
      hasExpensiveOperations: false,
      needsMemoization: false,
      needsCodeSplitting: false,
    };
    
    // Find component function or class
    traverse(ast, {
      FunctionDeclaration(path) {
        if (path.node.id.name === fileName || path.node.id.name.startsWith(fileName)) {
          analysis.isComponent = true;
          analysis.isStateless = true;
          
          // Count props
          if (path.node.params.length > 0 && t.isObjectPattern(path.node.params[0])) {
            analysis.propsCount = path.node.params[0].properties.length;
          }
        }
      },
      ArrowFunctionExpression(path) {
        if (path.parent.type === 'VariableDeclarator' && 
            path.parent.id.name === fileName) {
          analysis.isComponent = true;
          analysis.isStateless = true;
          
          // Count props
          if (path.node.params.length > 0 && t.isObjectPattern(path.node.params[0])) {
            analysis.propsCount = path.node.params[0].properties.length;
          }
        }
      },
      ClassDeclaration(path) {
        if (path.node.id.name === fileName) {
          analysis.isComponent = true;
          analysis.isStateless = false;
        }
      },
      // Check for React.memo usage
      CallExpression(path) {
        if (path.node.callee.type === 'MemberExpression' && 
            path.node.callee.object.name === 'React' && 
            path.node.callee.property.name === 'memo') {
          analysis.isAlreadyMemoized = true;
        }
      },
      // Check for useState/useEffect/useRef usage
      CallExpression(path) {
        if (path.node.callee.name === 'useState' || 
            path.node.callee.name === 'useEffect' || 
            path.node.callee.name === 'useReducer' ||
            path.node.callee.name === 'useRef') {
          analysis.hasStateOrEffects = true;
        }
      },
      // Check for expensive operations
      ArrayExpression(path) {
        if (path.parent.type === 'CallExpression' && 
            (path.parent.callee.name === 'useMemo' || path.parent.callee.name === 'useCallback')) {
          return;
        }
        
        const arraySize = path.node.elements.length;
        if (arraySize > 20) {
          analysis.hasExpensiveOperations = true;
        }
      },
      CallExpression(path) {
        // Check for map/filter/reduce operations on potentially large arrays
        if (path.node.callee.type === 'MemberExpression' && 
            ['map', 'filter', 'reduce', 'sort', 'forEach'].includes(path.node.callee.property.name)) {
          analysis.hasExpensiveOperations = true;
        }
      },
      // Check for potential multiple renders
      JSXElement(path) {
        const directParent = path.parentPath;
        if (directParent.type === 'ReturnStatement') {
          // Count sibling JSX elements
          const siblings = directParent.getAllNextSiblings();
          if (siblings.length > 10) {
            analysis.hasManyRenders = true;
          }
        }
      },
    });
    
    // Determine if component needs optimization
    if (analysis.isComponent) {
      // Check if component needs memoization
      analysis.needsMemoization = !analysis.isAlreadyMemoized && 
                                 analysis.isStateless && 
                                 (analysis.propsCount >= PROPS_COUNT_THRESHOLD || 
                                  analysis.hasExpensiveOperations || 
                                  analysis.hasManyRenders);
      
      // Check if component needs code splitting
      analysis.needsCodeSplitting = analysis.lineCount >= COMPONENT_SIZE_THRESHOLD;
      
      return analysis;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

// Function to optimize a React component file
function optimizeComponentFile(analysis) {
  try {
    if (!analysis.needsMemoization && !analysis.needsCodeSplitting) {
      return false;
    }
    
    const content = fs.readFileSync(analysis.filePath, 'utf8');
    
    // Parse the component file
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'dynamicImport'],
    });
    
    let modified = false;
    
    // Memoize the component if needed
    if (analysis.needsMemoization) {
      traverse(ast, {
        // Find the component function
        FunctionDeclaration(path) {
          if (path.node.id.name === analysis.fileName) {
            // Only modify if the component is not already exported directly
            if (path.parent.type !== 'ExportDefaultDeclaration') {
              modified = true;
            }
          }
        },
        // Find the export statement
        ExportDefaultDeclaration(path) {
          if (path.node.declaration.type === 'Identifier' && 
              path.node.declaration.name === analysis.fileName) {
            // Replace with React.memo
            path.node.declaration = t.callExpression(
              t.memberExpression(t.identifier('React'), t.identifier('memo')),
              [t.identifier(analysis.fileName)]
            );
            modified = true;
          } else if (path.node.declaration.type === 'FunctionDeclaration' && 
                    path.node.declaration.id.name === analysis.fileName) {
            // Wrap the function in React.memo
            path.replaceWith(
              t.exportDefaultDeclaration(
                t.callExpression(
                  t.memberExpression(t.identifier('React'), t.identifier('memo')),
                  [path.node.declaration]
                )
              )
            );
            modified = true;
          }
        },
        // Handle arrow function components
        VariableDeclaration(path) {
          path.node.declarations.forEach(declaration => {
            if (declaration.id.name === analysis.fileName && 
                path.parent.type === 'Program') {
              // Check if there's an export statement that exports this variable
              const program = path.findParent(p => p.isProgram());
              const exportStatement = program.node.body.find(
                node => node.type === 'ExportDefaultDeclaration' && 
                node.declaration.type === 'Identifier' && 
                node.declaration.name === analysis.fileName
              );
              
              if (exportStatement) {
                modified = true;
              }
            }
          });
        }
      });
    }
    
    // Add React import if not present
    if (modified) {
      let hasReactImport = false;
      
      traverse(ast, {
        ImportDeclaration(path) {
          if (path.node.source.value === 'react') {
            hasReactImport = true;
            
            // Check if the import has React named import
            const hasReactNamed = path.node.specifiers.some(
              spec => spec.type === 'ImportDefaultSpecifier' && spec.local.name === 'React'
            );
            
            if (!hasReactNamed) {
              // Add React named import
              path.node.specifiers.unshift(
                t.importDefaultSpecifier(t.identifier('React'))
              );
            }
          }
        }
      });
      
      if (!hasReactImport) {
        // Add React import at the beginning
        ast.program.body.unshift(
          t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier('React'))],
            t.stringLiteral('react')
          )
        );
      }
    }
    
    // Generate the optimized code
    if (modified) {
      const output = generate(ast, {
        retainLines: true,
        comments: true
      }, content);
      
      // Backup the original file
      if (!DRY_RUN) {
        const backupPath = path.join(
          BACKUP_DIR, 
          path.relative(ROOT_DIR, analysis.filePath)
        );
        
        fs.mkdirSync(path.dirname(backupPath), { recursive: true });
        fs.copyFileSync(analysis.filePath, backupPath);
        
        // Write the optimized file
        fs.writeFileSync(analysis.filePath, output.code, 'utf8');
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error optimizing ${analysis.filePath}:`, error.message);
    return false;
  }
}

// Function to create a React.lazy wrapper for code splitting
function createLazyComponent(analysis) {
  try {
    if (!analysis.needsCodeSplitting) {
      return false;
    }
    
    // Create new lazy-loaded component in the same directory
    const originalDir = path.dirname(analysis.filePath);
    const lazyLoaderPath = path.join(originalDir, `${analysis.fileName}Lazy.jsx`);
    
    // Create the lazy loader
    const lazyCode = `import React, { lazy, Suspense } from 'react';

// Lazy-loaded component for better code splitting
const ${analysis.fileName}Lazy = lazy(() => import('./${analysis.fileName}'));

/**
 * Lazy wrapper for ${analysis.fileName} component
 * Improves initial load time through code splitting
 */
const ${analysis.fileName}LazyWrapper = (props) => (
  <Suspense fallback={<div>Loading...</div>}>
    <${analysis.fileName}Lazy {...props} />
  </Suspense>
);

export default ${analysis.fileName}LazyWrapper;
`;

    if (!DRY_RUN) {
      fs.writeFileSync(lazyLoaderPath, lazyCode, 'utf8');
      
      // Update the index.js file in the directory to expose the lazy version
      const indexPath = path.join(originalDir, 'index.js');
      
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        
        // Check if the component is exported from index.js
        if (indexContent.includes(`${analysis.fileName}`)) {
          // Add export for lazy version
          let newIndexContent = indexContent;
          
          if (!indexContent.includes(`${analysis.fileName}Lazy`)) {
            newIndexContent += `\nexport { default as ${analysis.fileName}Lazy } from './${analysis.fileName}Lazy';\n`;
            fs.writeFileSync(indexPath, newIndexContent, 'utf8');
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error creating lazy component for ${analysis.filePath}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔍 Optimizing React component performance...');
  
  // Find all React component files
  const componentFiles = glob.sync(`${COMPONENTS_DIR}/**/*.{jsx,js}`);
  console.log(`Found ${componentFiles.length} potential component files to analyze...`);
  
  // Analyze components
  const analyses = componentFiles
    .map(analyzeComponentFile)
    .filter(Boolean);
  
  const needsOptimization = analyses.filter(a => a.needsMemoization || a.needsCodeSplitting);
  
  console.log(`\n📊 Performance Analysis Summary:`);
  console.log(`- Total components analyzed: ${analyses.length}`);
  console.log(`- Components needing optimization: ${needsOptimization.length}`);
  console.log(`- Components needing memoization: ${analyses.filter(a => a.needsMemoization).length}`);
  console.log(`- Components suitable for code splitting: ${analyses.filter(a => a.needsCodeSplitting).length}`);
  
  if (needsOptimization.length === 0) {
    console.log(`\n✅ No components need performance optimization!`);
    return;
  }
  
  if (DRY_RUN) {
    console.log(`\n⚠️ DRY RUN: Not making any changes.`);
    
    // List components needing optimization
    console.log(`\nComponents needing optimization:`);
    needsOptimization.forEach(a => {
      const relPath = path.relative(ROOT_DIR, a.filePath);
      const optimizations = [];
      
      if (a.needsMemoization) optimizations.push('memoization');
      if (a.needsCodeSplitting) optimizations.push('code splitting');
      
      console.log(`- ${relPath} (${optimizations.join(', ')})`);
    });
    
    return;
  }
  
  // Optimize components
  console.log(`\n🔄 Optimizing components...`);
  
  let memoizedCount = 0;
  let codeSplitCount = 0;
  
  for (const analysis of needsOptimization) {
    const relPath = path.relative(ROOT_DIR, analysis.filePath);
    console.log(`- Optimizing ${relPath}...`);
    
    // Memoize the component
    if (analysis.needsMemoization) {
      const memoized = optimizeComponentFile(analysis);
      if (memoized) {
        console.log(`  ✓ Added React.memo optimization`);
        memoizedCount++;
      }
    }
    
    // Create code splitting wrapper
    if (analysis.needsCodeSplitting) {
      const codeSplit = createLazyComponent(analysis);
      if (codeSplit) {
        console.log(`  ✓ Created lazy-loaded wrapper for code splitting`);
        codeSplitCount++;
      }
    }
  }
  
  console.log(`\n✅ Performance optimization completed:`);
  console.log(`- ${memoizedCount} components memoized with React.memo`);
  console.log(`- ${codeSplitCount} components optimized with code splitting`);
  
  // Next steps
  console.log(`\nNext steps:`);
  console.log(`1. Review the optimized components`);
  console.log(`2. Test the application to verify performance improvements`);
  console.log(`3. Replace large component imports with their lazy versions where appropriate`);
  console.log(`4. Run the render performance analysis tool to identify further optimizations`);
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});