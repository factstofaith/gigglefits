#!/usr/bin/env node

/**
 * Bulk Component Enhancer
 * 
 * A powerful utility for automatically enhancing multiple components with
 * accessibility and performance features in a single operation.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const babel = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Import our component generators
const { createA11yComponent, withA11y } = require('../src/utils/a11y/a11yComponentGenerator');
const { generateCompleteComponent } = require('../src/utils/tools/componentTemplateGenerator');

// Configuration
const config = {
  componentBasePath: path.resolve(__dirname, '../src/components'),
  backupPath: path.resolve(__dirname, '../backup-components'),
  enhancementTypes: ['a11y', 'performance', 'both'],
  defaultType: 'a11y',
  ignorePatterns: ['node_modules', 'dist', 'build', '.git', '__tests__', '__snapshots__']
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Process command line arguments
const args = process.argv.slice(2);
const flags = {
  help: args.includes('--help') || args.includes('-h'),
  force: args.includes('--force') || args.includes('-f'),
  verbose: args.includes('--verbose') || args.includes('-v'),
  dryRun: args.includes('--dry-run') || args.includes('-d'),
  noBackup: args.includes('--no-backup') || args.includes('-nb')
};

// Enhancement type
let enhancementType = config.defaultType;
if (args.includes('--performance') || args.includes('-p')) {
  enhancementType = 'performance';
} else if (args.includes('--both') || args.includes('-b')) {
  enhancementType = 'both';
}

// Extract arguments that aren't flags
const nonFlagArgs = args.filter(arg => !arg.startsWith('-'));

/**
 * Show help information
 */
function showHelp() {
  console.log(`
  Bulk Component Enhancer
  -----------------------
  A tool for automatically enhancing multiple components with accessibility and performance features.
  
  Usage:
    npm run bulk-enhance -- [options] <component-list.txt | component-directory>
  
  Options:
    --help, -h          : Show this help information
    --force, -f         : Force enhancement even if component is already enhanced
    --verbose, -v       : Show detailed enhancement information
    --dry-run, -d       : Show what would be enhanced without making changes
    --no-backup, -nb    : Skip creating backup files
    --a11y, -a          : Add accessibility features (default)
    --performance, -p   : Add performance optimizations
    --both, -b          : Add both accessibility and performance features
  
  Examples:
    npm run bulk-enhance -- component-list.txt
    npm run bulk-enhance -- src/components/integration --performance
    npm run bulk-enhance -- src/components/common --both --dry-run
  `);
  rl.close();
}

/**
 * Ask a question and get user input
 * 
 * @param {string} question - Question to ask
 * @param {string} defaultValue - Default value
 * @returns {Promise<string>} User response
 */
function askQuestion(question, defaultValue = '') {
  const defaultText = defaultValue ? ` (${defaultValue})` : '';
  
  return new Promise(resolve => {
    rl.question(`${question}${defaultText}: `, answer => {
      resolve(answer || defaultValue);
    });
  });
}

/**
 * Check if a file exists
 * 
 * @param {string} filePath - Path to check
 * @returns {boolean} Whether the file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

/**
 * Check if a path is a directory
 * 
 * @param {string} dirPath - Path to check
 * @returns {boolean} Whether the path is a directory
 */
function isDirectory(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * Get all component files in a directory
 * 
 * @param {string} dirPath - Directory to scan
 * @returns {Array<string>} Array of component file paths
 */
function getComponentFiles(dirPath) {
  if (!isDirectory(dirPath)) {
    if (dirPath.endsWith('.jsx') || dirPath.endsWith('.js') || dirPath.endsWith('.tsx')) {
      return [dirPath];
    }
    return [];
  }
  
  const files = [];
  const entries = fs.readdirSync(dirPath);
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    
    // Skip ignored patterns
    if (config.ignorePatterns.some(pattern => entry.includes(pattern))) {
      continue;
    }
    
    // If directory, scan recursively
    if (isDirectory(fullPath)) {
      files.push(...getComponentFiles(fullPath));
    } 
    // If React component file, add to list
    else if (
      (entry.endsWith('.jsx') || entry.endsWith('.js') || entry.endsWith('.tsx')) &&
      !entry.endsWith('.test.jsx') && 
      !entry.endsWith('.spec.jsx') &&
      !entry.endsWith('.test.js') && 
      !entry.endsWith('.spec.js') &&
      !entry.startsWith('A11y') &&
      !entry.includes('Performance')
    ) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Read component list from a file
 * 
 * @param {string} filePath - Path to the component list file
 * @returns {Array<Object>} Array of component configurations
 */
function readComponentList(filePath) {
  if (!fileExists(filePath)) {
    console.error(`Error: Component list file ${filePath} does not exist.`);
    return [];
  }
  
  // Read the file
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Parse component list
  return fileContent.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [componentName, componentType, componentPath] = line.split(',').map(s => s.trim());
      
      return {
        name: componentName,
        type: componentType || 'generic',
        path: componentPath ? path.join(config.componentBasePath, componentPath) : config.componentBasePath
      };
    });
}

/**
 * Create a backup of a component file
 * 
 * @param {string} filePath - Path to the component file
 * @returns {string|null} Path to the backup file, or null if backup failed
 */
function createBackup(filePath) {
  if (flags.noBackup) {
    return null;
  }
  
  try {
    const backupDir = path.join(config.backupPath, path.dirname(filePath).replace(config.componentBasePath, ''));
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Create timestamped backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${path.basename(filePath, path.extname(filePath))}-${timestamp}${path.extname(filePath)}`);
    
    // Copy the file
    fs.copyFileSync(filePath, backupPath);
    
    return backupPath;
  } catch (error) {
    console.error(`Error creating backup of ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Analyze a component and determine its type
 * 
 * @param {string} filePath - Path to the component file
 * @returns {Object} Component analysis
 */
function analyzeComponent(filePath) {
  const result = {
    name: path.basename(filePath, path.extname(filePath)),
    filePath,
    type: 'unknown',
    hooks: [],
    props: [],
    isAlreadyEnhanced: {
      a11y: false,
      performance: false
    }
  };
  
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Check if already enhanced
    result.isAlreadyEnhanced.a11y = fileContent.includes('useA11y') || 
                                   fileContent.includes('A11yButton') || 
                                   fileContent.includes('A11yDialog') ||
                                   result.name.startsWith('A11y');
                                   
    result.isAlreadyEnhanced.performance = fileContent.includes('useMemo') || 
                                         fileContent.includes('useCallback') || 
                                         fileContent.includes('React.memo') ||
                                         fileContent.includes('withOptimization');
    
    // Parse with babel to determine component type
    const ast = babel.parse(fileContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    // Traverse the AST
    traverse(ast, {
      // Find component declaration
      VariableDeclarator(path) {
        if (path.node.id.name && path.node.id.name[0] === path.node.id.name[0].toUpperCase()) {
          result.name = path.node.id.name;
          result.type = 'functional';
        }
      },
      
      // Find function component declaration
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name && path.node.id.name[0] === path.node.id.name[0].toUpperCase()) {
          result.name = path.node.id.name;
          result.type = 'functional';
        }
      },
      
      // Find React hooks
      CallExpression(path) {
        if (path.node.callee.name && path.node.callee.name.startsWith('use')) {
          result.hooks.push(path.node.callee.name);
        }
      },
      
      // Find component props
      ObjectPattern(path) {
        if (path.parent.params && path.parent.params[0] === path.node) {
          path.node.properties.forEach(prop => {
            if (prop.key && prop.key.name) {
              result.props.push(prop.key.name);
            }
          });
        }
      }
    });
    
    // Determine component type based on imports and content
    if (fileContent.includes('extends React.Component') || fileContent.includes('extends Component')) {
      result.type = 'class';
    } else if (fileContent.includes('function') && fileContent.includes('return') && fileContent.includes('jsx')) {
      result.type = 'functional';
    }
    
    // Infer component type by common UI elements
    if (fileContent.includes('<Button') || fileContent.includes('Button>')) {
      result.componentType = 'button';
    } else if (fileContent.includes('<Dialog') || fileContent.includes('Dialog>') || fileContent.includes('Modal')) {
      result.componentType = 'dialog';
    } else if (fileContent.includes('<form') || fileContent.includes('Form') || fileContent.includes('input')) {
      result.componentType = 'form';
    } else if (fileContent.includes('<Table') || fileContent.includes('Table>')) {
      result.componentType = 'table';
    } else {
      result.componentType = 'generic';
    }
    
    return result;
  } catch (error) {
    console.error(`Error analyzing component ${filePath}:`, error.message);
    return result;
  }
}

/**
 * Enhance a component with accessibility or performance features
 * 
 * @param {Object} component - Component to enhance
 * @param {string} type - Type of enhancement (a11y, performance, both)
 * @param {boolean} dryRun - Whether to actually make changes
 * @returns {Object} Result of the enhancement
 */
function enhanceComponent(component, type, dryRun = false) {
  const result = {
    name: component.name,
    enhanced: false,
    newFiles: [],
    errors: [],
    backupFile: null
  };
  
  try {
    // Create backup before making changes
    if (!dryRun) {
      result.backupFile = createBackup(component.filePath);
    }
    
    // A11y enhancement - create a new component
    if (type === 'a11y' || type === 'both') {
      const a11yComponentName = `A11y${component.name}`;
      const a11yComponentPath = path.join(path.dirname(component.filePath));
      
      if (!dryRun) {
        const genResult = generateCompleteComponent({
          componentName: a11yComponentName,
          componentPath: a11yComponentPath,
          componentDescription: `Accessibility-enhanced version of ${component.name}`,
          templateType: 'a11y',
          componentType: component.componentType,
          customProps: { props: component.props.join(', ') },
          generateTests: true
        });
        
        if (genResult.success) {
          result.newFiles.push(...genResult.files);
          result.enhanced = true;
        } else {
          result.errors.push(...genResult.errors);
        }
      } else {
        console.log(`Would create ${a11yComponentName} at ${a11yComponentPath}`);
        result.enhanced = true;
      }
    }
    
    // Performance enhancement - modify the existing component
    if (type === 'performance' || type === 'both') {
      if (!dryRun) {
        // Read the original file
        const fileContent = fs.readFileSync(component.filePath, 'utf8');
        
        // Parse with babel
        const ast = babel.parse(fileContent, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript']
        });
        
        // Track if we made changes
        let madeChanges = false;
        
        // Add imports for performance hooks
        let hasReactImport = false;
        let hasPerformanceImport = false;
        
        traverse(ast, {
          // Find React import
          ImportDeclaration(path) {
            if (path.node.source.value === 'react') {
              hasReactImport = true;
              
              // Add useMemo and useCallback to React import
              const existingSpecifiers = path.node.specifiers
                .filter(s => s.type === 'ImportSpecifier')
                .map(s => s.imported.name);
              
              if (!existingSpecifiers.includes('useMemo')) {
                path.node.specifiers.push(
                  t.importSpecifier(t.identifier('useMemo'), t.identifier('useMemo'))
                );
                madeChanges = true;
              }
              
              if (!existingSpecifiers.includes('useCallback')) {
                path.node.specifiers.push(
                  t.importSpecifier(t.identifier('useCallback'), t.identifier('useCallback'))
                );
                madeChanges = true;
              }
            }
            
            // Check for performance imports
            if (path.node.source.value.includes('utils/performance')) {
              hasPerformanceImport = true;
            }
          }
        });
        
        // Add React import if missing
        if (!hasReactImport) {
          ast.program.body.unshift(
            t.importDeclaration(
              [
                t.importDefaultSpecifier(t.identifier('React')),
                t.importSpecifier(t.identifier('useMemo'), t.identifier('useMemo')),
                t.importSpecifier(t.identifier('useCallback'), t.identifier('useCallback'))
              ],
              t.stringLiteral('react')
            )
          );
          madeChanges = true;
        }
        
        // Add performance utils import if missing
        if (!hasPerformanceImport) {
          ast.program.body.unshift(
            t.importDeclaration(
              [
                t.importSpecifier(t.identifier('withRenderTracking'), t.identifier('withRenderTracking')),
                t.importSpecifier(t.identifier('useRenderTracking'), t.identifier('useRenderTracking'))
              ],
              t.stringLiteral('../../utils/performance')
            )
          );
          madeChanges = true;
        }
        
        // Find the component and wrap it with memo
        traverse(ast, {
          // Find component export
          ExportDefaultDeclaration(path) {
            // Check if already wrapped with memo
            const isMemoized = 
              (path.node.declaration.type === 'CallExpression' && 
               (path.node.declaration.callee.name === 'memo' || 
                (path.node.declaration.callee.object && path.node.declaration.callee.object.name === 'React' && 
                 path.node.declaration.callee.property.name === 'memo')));
            
            if (!isMemoized) {
              const componentName = 
                path.node.declaration.name || 
                (path.node.declaration.type === 'Identifier' && path.node.declaration.name);
              
              if (componentName) {
                // Replace with React.memo
                path.node.declaration = t.callExpression(
                  t.memberExpression(t.identifier('React'), t.identifier('memo')),
                  [t.identifier(componentName)]
                );
                madeChanges = true;
              }
            }
          }
        });
        
        if (madeChanges) {
          // Generate modified code
          const output = generate(ast, { retainLines: true }, fileContent);
          
          // Add performance HOC at the end
          let updatedCode = output.code;
          
          // If this was successfully modified, save the file
          fs.writeFileSync(component.filePath, updatedCode);
          result.enhanced = true;
        }
      } else {
        console.log(`Would enhance ${component.name} with performance optimizations`);
        result.enhanced = true;
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Error enhancing component ${component.name}:`, error.message);
    result.errors.push(error.message);
    return result;
  }
}

/**
 * Process a single component
 * 
 * @param {Object} component - Component to process
 * @param {string} type - Type of enhancement
 * @param {boolean} dryRun - Whether to actually make changes
 * @returns {Object} Processing result
 */
function processComponent(component, type, dryRun = false) {
  // Analyze the component
  const analysis = analyzeComponent(component.filePath || path.join(component.path, `${component.name}.jsx`));
  
  // Check if component is already enhanced
  const skipA11y = analysis.isAlreadyEnhanced.a11y && type.includes('a11y') && !flags.force;
  const skipPerformance = analysis.isAlreadyEnhanced.performance && type.includes('performance') && !flags.force;
  
  if (skipA11y && skipPerformance) {
    return {
      name: analysis.name,
      skipped: true,
      reason: 'Already enhanced'
    };
  }
  
  // Determine enhancement type
  let enhancementType = type;
  if (skipA11y && type === 'both') {
    enhancementType = 'performance';
  } else if (skipPerformance && type === 'both') {
    enhancementType = 'a11y';
  }
  
  // Enhance the component
  return enhanceComponent(analysis, enhancementType, dryRun);
}

/**
 * Generate an HTML report of the enhancement process
 * 
 * @param {Array<Object>} results - Enhancement results
 * @param {string} type - Type of enhancement
 * @returns {string} Path to the generated report
 */
function generateReport(results, type) {
  const reportDate = new Date().toISOString().split('T')[0];
  const reportPath = path.join(config.componentBasePath, '..', `enhancement-report-${reportDate}.html`);
  
  // Count results
  const counts = {
    total: results.length,
    enhanced: results.filter(r => r.enhanced).length,
    skipped: results.filter(r => r.skipped).length,
    failed: results.filter(r => r.errors && r.errors.length > 0).length
  };
  
  // Generate HTML content
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Enhancement Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #0066cc;
    }
    .summary {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    .summary-card {
      background-color: #f5f5f5;
      border-radius: 5px;
      padding: 15px;
      flex: 1;
    }
    .component-list {
      border: 1px solid #ddd;
      border-radius: 5px;
      overflow: hidden;
    }
    .component-list-header {
      background-color: #f5f5f5;
      padding: 10px 15px;
      border-bottom: 1px solid #ddd;
      font-weight: bold;
    }
    .component-item {
      padding: 10px 15px;
      border-bottom: 1px solid #ddd;
    }
    .component-item:last-child {
      border-bottom: none;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 10px;
    }
    .badge-success {
      background-color: #e8f5e9;
      color: #388e3c;
    }
    .badge-warning {
      background-color: #fff3e0;
      color: #f57c00;
    }
    .badge-error {
      background-color: #ffebee;
      color: #d32f2f;
    }
    .files-list {
      margin-top: 5px;
      padding-left: 20px;
      font-size: 0.9em;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>Component Enhancement Report</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>
  <p>Enhancement type: <strong>${type}</strong></p>
  
  <div class="summary">
    <div class="summary-card">
      <h3>Components Processed</h3>
      <p><strong>${counts.total}</strong> components</p>
    </div>
    <div class="summary-card">
      <h3>Results</h3>
      <p>
        <span style="color: #388e3c;">${counts.enhanced} enhanced</span><br>
        <span style="color: #f57c00;">${counts.skipped} skipped</span><br>
        <span style="color: #d32f2f;">${counts.failed} failed</span>
      </p>
    </div>
  </div>
  
  <h2>Enhanced Components</h2>
  <div class="component-list">
    <div class="component-list-header">
      Component Name
    </div>
    ${results.filter(r => r.enhanced).map(result => `
      <div class="component-item">
        ${result.name}
        <span class="badge badge-success">Enhanced</span>
        ${result.newFiles && result.newFiles.length > 0 ? `
          <div class="files-list">
            New files:
            <ul>
              ${result.newFiles.map(file => `<li>${path.basename(file)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('') || '<div class="component-item">No components were enhanced.</div>'}
  </div>
  
  <h2>Skipped Components</h2>
  <div class="component-list">
    <div class="component-list-header">
      Component Name
    </div>
    ${results.filter(r => r.skipped).map(result => `
      <div class="component-item">
        ${result.name}
        <span class="badge badge-warning">Skipped</span>
        <div>Reason: ${result.reason}</div>
      </div>
    `).join('') || '<div class="component-item">No components were skipped.</div>'}
  </div>
  
  <h2>Failed Components</h2>
  <div class="component-list">
    <div class="component-list-header">
      Component Name
    </div>
    ${results.filter(r => r.errors && r.errors.length > 0).map(result => `
      <div class="component-item">
        ${result.name}
        <span class="badge badge-error">Failed</span>
        <div class="files-list">
          Errors:
          <ul>
            ${result.errors.map(error => `<li>${error}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('') || '<div class="component-item">No component enhancements failed.</div>'}
  </div>
</body>
</html>
  `;
  
  // Write the report
  fs.writeFileSync(reportPath, htmlContent);
  
  return reportPath;
}

/**
 * Main function
 */
async function main() {
  // Show help if requested
  if (flags.help) {
    showHelp();
    return;
  }
  
  // Get components to enhance
  let componentList = [];
  const sourcePath = nonFlagArgs[0];
  
  if (!sourcePath) {
    console.error('Error: No component source specified. Please provide a component list file or directory.');
    showHelp();
    return;
  }
  
  // Check if source is a directory or file
  if (isDirectory(sourcePath)) {
    // Find all components in directory
    console.log(`Scanning directory ${sourcePath} for components...`);
    const componentFiles = getComponentFiles(sourcePath);
    
    componentList = componentFiles.map(file => ({
      name: path.basename(file, path.extname(file)),
      filePath: file,
      path: path.dirname(file)
    }));
    
    console.log(`Found ${componentList.length} components to process.`);
  } else if (fileExists(sourcePath)) {
    // Read component list from file
    console.log(`Reading component list from ${sourcePath}...`);
    componentList = readComponentList(sourcePath);
    console.log(`Found ${componentList.length} components in list.`);
  } else {
    console.error(`Error: Source ${sourcePath} does not exist.`);
    rl.close();
    return;
  }
  
  if (componentList.length === 0) {
    console.error('Error: No components found to enhance.');
    rl.close();
    return;
  }
  
  // Confirm enhancement
  const enhancementDesc = {
    'a11y': 'accessibility features',
    'performance': 'performance optimizations',
    'both': 'both accessibility and performance features'
  }[enhancementType];
  
  if (!flags.force) {
    const confirm = await askQuestion(
      `Enhance ${componentList.length} components with ${enhancementDesc}? (y/n)`,
      'y'
    );
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('Operation cancelled.');
      rl.close();
      return;
    }
  }
  
  // Process each component
  console.log(`Enhancing ${componentList.length} components with ${enhancementDesc}...`);
  console.log(flags.dryRun ? '(Dry run - no changes will be made)' : '');
  
  const results = [];
  for (const component of componentList) {
    if (flags.verbose) {
      console.log(`Processing ${component.name}...`);
    }
    
    const result = processComponent(component, enhancementType, flags.dryRun);
    results.push(result);
    
    if (flags.verbose) {
      if (result.skipped) {
        console.log(`Skipped ${component.name}: ${result.reason}`);
      } else if (result.enhanced) {
        console.log(`Enhanced ${component.name} successfully.`);
      } else if (result.errors && result.errors.length > 0) {
        console.log(`Failed to enhance ${component.name}: ${result.errors.join(', ')}`);
      }
    }
  }
  
  // Generate report if not dry run
  if (!flags.dryRun) {
    const reportPath = generateReport(results, enhancementType);
    console.log(`Enhancement complete. Report saved to ${reportPath}`);
  } else {
    console.log('Dry run complete. No changes were made.');
  }
  
  // Summary of results
  const enhanced = results.filter(r => r.enhanced).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => r.errors && r.errors.length > 0).length;
  
  console.log(`\nSummary:`);
  console.log(`- ${enhanced} components enhanced`);
  console.log(`- ${skipped} components skipped`);
  console.log(`- ${failed} components failed`);
  
  rl.close();
}

// Start the program
main();