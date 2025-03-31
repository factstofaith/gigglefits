/**
 * Duplicate Code Reducer
 * 
 * This script identifies and reduces duplicate code in bundles to
 * optimize bundle size and improve performance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Main function to analyze and reduce duplicate code
 * @param {Object} options Configuration options
 * @param {boolean} options.dryRun Only analyze without making changes
 * @param {string} options.outputDir Directory for reports
 * @param {string} options.projectDir Root project directory
 */
function analyzeAndReduceDuplicateCode(options = {}) {
  // Default options
  const config = {
    dryRun: options.dryRun !== false,
    outputDir: options.outputDir || path.resolve(__dirname, '../build-verification'),
    projectDir: options.projectDir || path.resolve(__dirname, '..'),
    timestamp: new Date().toISOString().replace(/[:.]/g, '-')
  };

  console.log(`Running duplicate code analysis ${config.dryRun ? '(dry run)' : ''}`);
  console.log('======================================================');

  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  // Save current directory
  const currentDir = process.cwd();
  process.chdir(config.projectDir);

  try {
    // Step 1: Generate webpack bundle stats
    console.log('Generating webpack bundle stats...');
    const statsJson = generateWebpackStats(config);

    // Step 2: Analyze duplicate modules
    console.log('Analyzing duplicate modules...');
    const duplicateModules = analyzeDuplicateModules(statsJson, config);

    // Step 3: Analyze common code patterns
    console.log('Analyzing common code patterns...');
    const commonCodePatterns = analyzeCommonCodePatterns(config);

    // Step 4: Generate optimization recommendations
    console.log('Generating optimization recommendations...');
    const recommendations = generateOptimizationRecommendations(
      duplicateModules, 
      commonCodePatterns,
      config
    );

    // Step 5: Apply optimizations (if not in dry run mode)
    if (!config.dryRun && recommendations.length > 0) {
      console.log('Applying optimizations...');
      applyOptimizations(recommendations, config);
    }

    // Step 6: Generate report
    console.log('Generating report...');
    const report = generateReport(
      duplicateModules,
      commonCodePatterns,
      recommendations,
      config
    );

    console.log(`Analysis complete! Report saved to: ${path.join(config.outputDir, `duplicate-code-report-${config.timestamp}.md`)}`);
    return report;
  } finally {
    // Restore working directory
    process.chdir(currentDir);
  }
}

/**
 * Generate webpack bundle stats
 * @param {Object} config Configuration options
 * @returns {Object} Webpack stats JSON
 */
function generateWebpackStats(config) {
  const statsFile = path.join(config.projectDir, 'stats.json');
  
  try {
    // Try to generate new stats
    execSync('npm run build -- --stats', { stdio: 'inherit' });
    
    if (fs.existsSync(statsFile)) {
      return JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error generating webpack stats:', error.message);
    
    // Try to use existing stats file
    if (fs.existsSync(statsFile)) {
      console.log('Using existing stats.json file...');
      return JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    }
  }

  console.log('No stats file found, generating basic analysis...');
  return { modules: [], chunks: [], assets: [] };
}

/**
 * Analyze duplicate modules in webpack stats
 * @param {Object} stats Webpack stats JSON
 * @param {Object} config Configuration options
 * @returns {Array} Duplicate modules
 */
function analyzeDuplicateModules(stats, config) {
  const duplicates = [];
  const moduleMap = new Map();

  // Skip if no modules in stats
  if (!stats.modules || !Array.isArray(stats.modules)) {
    return duplicates;
  }

  // Group modules by name
  for (const mod of stats.modules) {
    if (!mod.name) continue;
    
    // Normalize name to handle different paths
    const normalizedName = mod.name
      .replace(/.*node_modules[/\\]/, '')  // Remove node_modules path
      .replace(/\\/g, '/');                // Normalize slashes
    
    if (!moduleMap.has(normalizedName)) {
      moduleMap.set(normalizedName, []);
    }
    
    moduleMap.get(normalizedName).push(mod);
  }

  // Find modules with multiple instances
  for (const [name, instances] of moduleMap.entries()) {
    if (instances.length > 1) {
      duplicates.push({
        name,
        count: instances.length,
        size: instances.reduce((sum, mod) => sum + (mod.size || 0), 0),
        instances: instances.map(mod => ({
          id: mod.id,
          size: mod.size || 0,
          chunks: mod.chunks || []
        }))
      });
    }
  }

  // Sort by total size (largest first)
  duplicates.sort((a, b) => b.size - a.size);
  
  return duplicates;
}

/**
 * Analyze common code patterns in source files
 * @param {Object} config Configuration options
 * @returns {Array} Common code patterns
 */
function analyzeCommonCodePatterns(config) {
  const patterns = [];
  
  // Get source files
  const srcDir = path.join(config.projectDir, 'src');
  if (!fs.existsSync(srcDir)) {
    console.log('No src directory found.');
    return patterns;
  }

  // Find all JS/TS files
  const jsFiles = findJsFiles(srcDir);
  console.log(`Found ${jsFiles.length} JavaScript/TypeScript files to analyze.`);

  // Patterns to look for
  const codePatterns = [
    {
      name: 'Common utility functions',
      regex: /export\s+(const|function)\s+(\w+)\s*=/g,
      type: 'utility'
    },
    {
      name: 'Duplicate imports across files',
      regex: /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g,
      type: 'import'
    },
    {
      name: 'Similar component patterns',
      regex: /(export\s+(?:default\s+)?(?:function|const)\s+\w+(?:\s*=\s*)?(?:\([^)]*\)|[^=]*=>))/g,
      type: 'component'
    },
    {
      name: 'Copy-pasted validators or formatters',
      regex: /(?:function|const)\s+(\w+(?:Validator|Formatter|Helper|Util))\s*=/g,
      type: 'helper'
    }
  ];

  // Maps to track occurrences
  const utilityMap = new Map();
  const importMap = new Map();
  const componentMap = new Map();
  const helperMap = new Map();

  // Analyze each file
  for (const file of jsFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(config.projectDir, file);
    
    for (const pattern of codePatterns) {
      const matches = content.matchAll(pattern.regex);
      
      for (const match of matches) {
        const [fullMatch, ...groups] = match;
        
        switch (pattern.type) {
          case 'utility': {
            const utilityName = groups[1]; // The name of the utility function
            if (!utilityMap.has(utilityName)) {
              utilityMap.set(utilityName, []);
            }
            utilityMap.get(utilityName).push({
              file: relativePath,
              line: getLineNumber(content, match.index),
              content: fullMatch
            });
            break;
          }
          
          case 'import': {
            const imports = groups[0]; // The imports
            const module = groups[1];  // The module path
            const key = `${imports} from ${module}`;
            
            if (!importMap.has(key)) {
              importMap.set(key, []);
            }
            importMap.get(key).push({
              file: relativePath,
              line: getLineNumber(content, match.index),
              content: fullMatch
            });
            break;
          }
          
          case 'component': {
            // Simplified component pattern detection
            const componentCode = fullMatch;
            const hash = hashString(componentCode.substring(0, 100)); // Use first 100 chars as signature
            
            if (!componentMap.has(hash)) {
              componentMap.set(hash, {
                code: componentCode,
                occurrences: []
              });
            }
            
            componentMap.get(hash).occurrences.push({
              file: relativePath,
              line: getLineNumber(content, match.index)
            });
            break;
          }
          
          case 'helper': {
            const helperName = groups[0]; // The helper function name
            if (!helperMap.has(helperName)) {
              helperMap.set(helperName, []);
            }
            helperMap.get(helperName).push({
              file: relativePath,
              line: getLineNumber(content, match.index),
              content: content.substring(match.index, content.indexOf('\n', match.index))
            });
            break;
          }
        }
      }
    }
  }

  // Collect results for duplicate utilities
  for (const [name, occurrences] of utilityMap.entries()) {
    if (occurrences.length > 1) {
      patterns.push({
        type: 'utility',
        name: name,
        count: occurrences.length,
        occurrences
      });
    }
  }

  // Collect results for duplicate imports
  for (const [importStatement, occurrences] of importMap.entries()) {
    if (occurrences.length > 3) { // Only report imports used in 3+ files
      patterns.push({
        type: 'import',
        name: importStatement,
        count: occurrences.length,
        occurrences
      });
    }
  }

  // Collect results for similar components
  for (const [hash, data] of componentMap.entries()) {
    if (data.occurrences.length > 1) {
      patterns.push({
        type: 'component',
        name: `Similar component pattern`,
        count: data.occurrences.length,
        code: data.code,
        occurrences: data.occurrences
      });
    }
  }

  // Collect results for duplicate helpers
  for (const [name, occurrences] of helperMap.entries()) {
    if (occurrences.length > 1) {
      patterns.push({
        type: 'helper',
        name: name,
        count: occurrences.length,
        occurrences
      });
    }
  }

  // Sort by occurrence count (highest first)
  patterns.sort((a, b) => b.count - a.count);
  
  return patterns;
}

/**
 * Generate optimization recommendations
 * @param {Array} duplicateModules Duplicate modules information
 * @param {Array} commonCodePatterns Common code patterns
 * @param {Object} config Configuration options
 * @returns {Array} Optimization recommendations
 */
function generateOptimizationRecommendations(duplicateModules, commonCodePatterns, config) {
  const recommendations = [];

  // 1. Webpack configuration recommendations
  recommendations.push({
    type: 'webpack',
    title: 'Optimize Webpack SplitChunks Configuration',
    description: 'Update your webpack configuration to better optimize code splitting and prevent duplication.',
    priority: 'high',
    implementation: {
      file: path.join(config.projectDir, 'config', 'webpack.config.js'),
      changes: [
        {
          description: 'Optimize splitChunks configuration',
          code: `
optimization: {
  splitChunks: {
    chunks: 'all',
    maxInitialRequests: Infinity,
    minSize: 20000,
    cacheGroups: {
      vendor: {
        test: /[\\\\/]node_modules[\\\\/]/,
        name(module) {
          // Get the name of the npm package
          const packageName = module.context.match(/[\\\\/]node_modules[\\\\/](.*?)([\\\\/]|$)/)[1];
          // Return a nice package name for better debugging
          return \`npm.\${packageName.replace('@', '')}\`;
        },
      },
      common: {
        name: 'common',
        minChunks: 2,
        priority: -10,
        reuseExistingChunk: true
      }
    },
  },
}`
        }
      ]
    }
  });

  // 2. Common patterns - create shared utilities
  const utilityPatterns = commonCodePatterns.filter(p => p.type === 'utility' && p.count > 1);
  if (utilityPatterns.length > 0) {
    const utilities = utilityPatterns.map(p => p.name).join(', ');
    
    recommendations.push({
      type: 'utility',
      title: 'Extract Common Utility Functions',
      description: `Create a shared utilities module for functions used in multiple places: ${utilities.length > 100 ? utilities.substring(0, 100) + '...' : utilities}`,
      priority: 'medium',
      implementation: {
        file: path.join(config.projectDir, 'src', 'utils', 'sharedUtils.js'),
        actions: [
          'Create a new shared utilities module',
          'Move duplicate utility functions to this module',
          'Update imports in all files using these utilities'
        ]
      },
      patterns: utilityPatterns
    });
  }

  // 3. Helper functions - extract to shared location
  const helperPatterns = commonCodePatterns.filter(p => p.type === 'helper' && p.count > 1);
  if (helperPatterns.length > 0) {
    const helpers = helperPatterns.map(p => p.name).join(', ');
    
    recommendations.push({
      type: 'helper',
      title: 'Consolidate Helper Functions',
      description: `Create specialized helper modules for duplicate validators, formatters, etc.: ${helpers.length > 100 ? helpers.substring(0, 100) + '...' : helpers}`,
      priority: 'medium',
      implementation: {
        file: path.join(config.projectDir, 'src', 'utils', 'helpers'),
        actions: [
          'Create specialized helper modules',
          'Move duplicate helper functions to appropriate modules',
          'Update imports in all files using these helpers'
        ]
      },
      patterns: helperPatterns
    });
  }

  // 4. Component patterns - create shared components or HOCs
  const componentPatterns = commonCodePatterns.filter(p => p.type === 'component' && p.count > 1);
  if (componentPatterns.length > 0) {
    recommendations.push({
      type: 'component',
      title: 'Extract Common Component Patterns',
      description: `Create higher-order components or shared base components for similar patterns used across multiple components.`,
      priority: 'medium',
      implementation: {
        file: path.join(config.projectDir, 'src', 'components', 'common'),
        actions: [
          'Create base components for common patterns',
          'Use composition or inheritance to share functionality',
          'Refactor similar components to use shared base components'
        ]
      },
      patterns: componentPatterns.slice(0, 5) // Limit to top 5 for manageability
    });
  }

  // 5. Duplicate modules from webpack analysis
  if (duplicateModules.length > 0) {
    const moduleNames = duplicateModules.slice(0, 5).map(m => m.name).join(', ');
    
    recommendations.push({
      type: 'module',
      title: 'Resolve Duplicate Node Modules',
      description: `Fix duplicate module instances in bundle: ${moduleNames}`,
      priority: 'high',
      implementation: {
        file: 'package.json',
        actions: [
          'Use npm/yarn dedupe to consolidate dependencies',
          'Add resolutions field to package.json for problematic packages',
          'Update indirect dependencies causing duplication'
        ]
      },
      modules: duplicateModules.slice(0, 10) // Limit to top 10 for manageability
    });
  }

  // 6. Babel optimization for code reduction
  recommendations.push({
    type: 'babel',
    title: 'Optimize Babel Configuration',
    description: 'Update Babel configuration to reduce code duplication in output.',
    priority: 'medium',
    implementation: {
      file: path.join(config.projectDir, 'babel.config.js'),
      changes: [
        {
          description: 'Add transform-runtime to avoid helper duplication',
          code: `
module.exports = {
  presets: [
    // existing presets...
  ],
  plugins: [
    // existing plugins...
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
        helpers: true,
        corejs: 3
      }
    ]
  ]
}`
        }
      ]
    }
  });

  // 7. Dynamic imports for code splitting
  recommendations.push({
    type: 'dynamic-import',
    title: 'Implement Dynamic Imports',
    description: 'Use dynamic imports for large, infrequently accessed features.',
    priority: 'medium',
    implementation: {
      description: 'Replace static imports with dynamic imports for better code splitting',
      examples: [
        {
          original: "import LargeFeature from './LargeFeature';",
          optimized: "const LargeFeature = React.lazy(() => import('./LargeFeature'));"
        },
        {
          original: "import { complexFunction } from './utils';",
          optimized: "// Only when needed:\nconst { complexFunction } = await import('./utils');"
        }
      ]
    }
  });

  return recommendations;
}

/**
 * Apply code optimizations based on recommendations
 * @param {Array} recommendations Optimization recommendations
 * @param {Object} config Configuration options
 */
function applyOptimizations(recommendations, config) {
  // Track successful changes
  const changes = [];
  
  // 1. Update webpack configuration
  const webpackRec = recommendations.find(r => r.type === 'webpack');
  if (webpackRec) {
    const webpackConfig = findWebpackConfig(config.projectDir);
    if (webpackConfig) {
      try {
        console.log(`Updating webpack configuration: ${webpackConfig}`);
        const content = fs.readFileSync(webpackConfig, 'utf8');
        
        // Make backup
        fs.writeFileSync(`${webpackConfig}.bak`, content);
        
        // Simple pattern replacement - in real implementation this would be more sophisticated
        let updated = content;
        
        // Look for existing splitChunks
        if (content.includes('splitChunks')) {
          console.log('Existing splitChunks configuration found, skipping update.');
        } else {
          // Find optimization section or create it
          if (content.includes('optimization')) {
            // Add to existing optimization
            updated = updated.replace(
              /optimization\s*:\s*{/,
              `optimization: {\n` + webpackRec.implementation.changes[0].code
            );
          } else {
            // Add new optimization section - simplified approach
            updated = updated.replace(
              /module\.exports\s*=\s*{/,
              `module.exports = {\n  optimization: ${webpackRec.implementation.changes[0].code},`
            );
          }
          
          // Write updated config
          fs.writeFileSync(webpackConfig, updated);
          changes.push(`Updated webpack configuration with optimized splitChunks`);
        }
      } catch (error) {
        console.error('Error updating webpack config:', error.message);
      }
    }
  }
  
  // 2. Create shared utilities module
  const utilityRec = recommendations.find(r => r.type === 'utility');
  if (utilityRec) {
    const utilsDir = path.dirname(utilityRec.implementation.file);
    const utilsFile = utilityRec.implementation.file;
    
    try {
      // Create utils directory if it doesn't exist
      if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
      }
      
      // Create or update shared utils file
      let utilsContent = '';
      if (fs.existsSync(utilsFile)) {
        utilsContent = fs.readFileSync(utilsFile, 'utf8');
      }
      
      // Add header if new file
      if (utilsContent === '') {
        utilsContent = `/**
 * Shared Utility Functions
 * 
 * Centralized utility functions used across multiple components.
 * Moving these here reduces code duplication and bundle size.
 */

`;
      }
      
      // Add utility function templates
      utilsContent += utilityRec.patterns.slice(0, 5).map(pattern => `
/**
 * ${pattern.name}
 * Extracted from ${pattern.occurrences.length} locations
 */
export const ${pattern.name} = () => {
  // TODO: Implement shared utility function
  // See: ${pattern.occurrences[0].file}:${pattern.occurrences[0].line}
};
`).join('\n');

      // Write file
      fs.writeFileSync(utilsFile, utilsContent);
      changes.push(`Created shared utilities module: ${path.relative(config.projectDir, utilsFile)}`);
      
      // Create README with instructions
      const readmePath = path.join(utilsDir, 'README.md');
      const readmeContent = `# Shared Utilities

This directory contains shared utility functions extracted from duplicate code.

## Usage Guide

1. **Copy implementation** from original files (noted in comments)
2. **Update imports** in all files using these utilities
3. **Remove duplicate code** once everything is working

## List of Utilities

${utilityRec.patterns.map(pattern => `- \`${pattern.name}\` (used in ${pattern.count} locations)`).join('\n')}
`;
      fs.writeFileSync(readmePath, readmeContent);
      
    } catch (error) {
      console.error('Error creating shared utilities:', error.message);
    }
  }
  
  // 3. Update Babel configuration with transform-runtime
  const babelRec = recommendations.find(r => r.type === 'babel');
  if (babelRec) {
    const babelConfig = findBabelConfig(config.projectDir);
    if (babelConfig) {
      try {
        console.log(`Updating Babel configuration: ${babelConfig}`);
        const content = fs.readFileSync(babelConfig, 'utf8');
        
        // Make backup
        fs.writeFileSync(`${babelConfig}.bak`, content);
        
        // Check if transform-runtime is already configured
        if (content.includes('@babel/plugin-transform-runtime')) {
          console.log('Babel transform-runtime already configured, skipping update.');
        } else {
          // Install needed dependencies
          try {
            console.log('Installing @babel/plugin-transform-runtime and @babel/runtime...');
            execSync('npm install --save-dev @babel/plugin-transform-runtime @babel/runtime', { stdio: 'inherit' });
          } catch (error) {
            console.error('Error installing Babel dependencies:', error.message);
          }
          
          // Update config - simplified approach
          let updated = content;
          
          // Find plugins array or create it
          if (content.includes('plugins')) {
            // Add to existing plugins
            updated = updated.replace(
              /plugins\s*:\s*\[/,
              `plugins: [\n    ['@babel/plugin-transform-runtime', { regenerator: true, helpers: true }],`
            );
          } else {
            // Add new plugins section - simplified approach
            if (content.includes('presets')) {
              updated = updated.replace(
                /presets\s*:\s*\[([^\]]*)\]/,
                `presets: [$1],\n  plugins: [\n    ['@babel/plugin-transform-runtime', { regenerator: true, helpers: true }]\n  ]`
              );
            } else {
              // No presets or plugins, create basic config
              updated = `module.exports = {\n  plugins: [\n    ['@babel/plugin-transform-runtime', { regenerator: true, helpers: true }]\n  ]\n};\n`;
            }
          }
          
          // Write updated config
          fs.writeFileSync(babelConfig, updated);
          changes.push(`Updated Babel configuration with transform-runtime plugin`);
        }
      } catch (error) {
        console.error('Error updating Babel config:', error.message);
      }
    } else {
      // Create new Babel config
      const newBabelConfig = path.join(config.projectDir, 'babel.config.js');
      try {
        console.log(`Creating new Babel configuration: ${newBabelConfig}`);
        
        // Install needed dependencies
        try {
          console.log('Installing @babel/plugin-transform-runtime and @babel/runtime...');
          execSync('npm install --save-dev @babel/plugin-transform-runtime @babel/runtime', { stdio: 'inherit' });
        } catch (error) {
          console.error('Error installing Babel dependencies:', error.message);
        }
        
        // Create basic config
        const configContent = `module.exports = {
  plugins: [
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
      helpers: true
    }]
  ]
};
`;
        fs.writeFileSync(newBabelConfig, configContent);
        changes.push(`Created new Babel configuration with transform-runtime plugin`);
      } catch (error) {
        console.error('Error creating Babel config:', error.message);
      }
    }
  }
  
  // 4. Create dynamic imports guide
  const dynamicImportRec = recommendations.find(r => r.type === 'dynamic-import');
  if (dynamicImportRec) {
    try {
      const guidePath = path.join(config.outputDir, 'dynamic-imports-guide.md');
      const guideContent = `# Dynamic Imports Guide

This guide provides examples of how to convert static imports to dynamic imports
to improve code splitting and reduce initial bundle size.

## Examples

### React Components

Before:
\`\`\`jsx
import LargeFeature from './LargeFeature';

function App() {
  return (
    <div>
      <LargeFeature />
    </div>
  );
}
\`\`\`

After:
\`\`\`jsx
import React, { Suspense, lazy } from 'react';

const LargeFeature = lazy(() => import('./LargeFeature'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LargeFeature />
      </Suspense>
    </div>
  );
}
\`\`\`

### Utility Functions

Before:
\`\`\`js
import { complexFunction } from './utils';

function processData() {
  return complexFunction(data);
}
\`\`\`

After:
\`\`\`js
async function processData() {
  // Import only when needed
  const { complexFunction } = await import('./utils');
  return complexFunction(data);
}
\`\`\`

## Recommended Targets for Dynamic Imports

1. Large component libraries (charts, tables, etc.)
2. Admin panels and dashboards
3. Feature-rich editors
4. Analytics and reporting tools
5. Complex form validation libraries

## Implementation Steps

1. Identify large modules in your bundle using webpack-bundle-analyzer
2. Convert static imports to dynamic imports for these modules
3. Add appropriate loading states (Suspense for React components)
4. Test to ensure functionality is preserved
`;

      fs.writeFileSync(guidePath, guideContent);
      changes.push(`Created dynamic imports guide: ${path.relative(config.projectDir, guidePath)}`);
    } catch (error) {
      console.error('Error creating dynamic imports guide:', error.message);
    }
  }
  
  // 5. Create package resolutions for duplicate modules
  const moduleRec = recommendations.find(r => r.type === 'module');
  if (moduleRec && moduleRec.modules && moduleRec.modules.length > 0) {
    const packageJsonPath = path.join(config.projectDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        console.log('Updating package.json with resolutions...');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Make backup
        fs.writeFileSync(`${packageJsonPath}.bak`, JSON.stringify(packageJson, null, 2));
        
        // Add resolutions field if it doesn't exist
        packageJson.resolutions = packageJson.resolutions || {};
        
        // Add resolutions for top duplicate modules
        let addedResolutions = 0;
        for (const mod of moduleRec.modules.slice(0, 5)) {
          // Extract package name from path (simplified)
          const name = mod.name.split('/')[0];
          if (name && !packageJson.resolutions[name] && name !== '.') {
            // Find the best version to use
            let bestVersion = null;
            
            // Try to find in dependencies
            if (packageJson.dependencies && packageJson.dependencies[name]) {
              bestVersion = packageJson.dependencies[name];
            } 
            // Try to find in devDependencies if not in dependencies
            else if (packageJson.devDependencies && packageJson.devDependencies[name]) {
              bestVersion = packageJson.devDependencies[name];
            }
            
            // If found a version, add resolution
            if (bestVersion) {
              packageJson.resolutions[name] = bestVersion;
              addedResolutions++;
            }
          }
        }
        
        // Write updated package.json
        if (addedResolutions > 0) {
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          changes.push(`Added ${addedResolutions} package resolutions to package.json`);
          
          // Run yarn or npm to apply resolutions
          try {
            console.log('Running package manager to apply resolutions...');
            if (fs.existsSync(path.join(config.projectDir, 'yarn.lock'))) {
              execSync('yarn', { stdio: 'inherit' });
            } else {
              execSync('npm dedupe', { stdio: 'inherit' });
            }
          } catch (error) {
            console.error('Error applying package resolutions:', error.message);
          }
        } else {
          console.log('No valid resolutions found to add.');
        }
      } catch (error) {
        console.error('Error updating package.json:', error.message);
      }
    }
  }
  
  console.log('\nSuccessfully applied changes:');
  for (const change of changes) {
    console.log(`- ${change}`);
  }
}

/**
 * Generate analysis report
 * @param {Array} duplicateModules Duplicate modules
 * @param {Array} commonCodePatterns Common code patterns
 * @param {Array} recommendations Optimization recommendations
 * @param {Object} config Configuration options
 * @returns {string} Markdown report
 */
function generateReport(duplicateModules, commonCodePatterns, recommendations, config) {
  let report = `# Duplicate Code Analysis Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Summary section
  report += `## Summary\n\n`;
  report += `- **Duplicate Modules**: ${duplicateModules.length}\n`;
  report += `- **Common Code Patterns**: ${commonCodePatterns.length}\n`;
  report += `- **Optimization Recommendations**: ${recommendations.length}\n\n`;
  
  // Recommendations section
  report += `## Optimization Recommendations\n\n`;
  for (const [index, rec] of recommendations.entries()) {
    report += `### ${index + 1}. ${rec.title}\n\n`;
    report += `**Priority**: ${rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}\n\n`;
    report += `${rec.description}\n\n`;
    
    // Implementation details
    if (rec.implementation) {
      report += `**Implementation**:\n\n`;
      
      if (rec.implementation.file) {
        report += `- File: \`${path.relative(config.projectDir, rec.implementation.file)}\`\n`;
      }
      
      if (rec.implementation.actions) {
        report += `- Actions:\n`;
        for (const action of rec.implementation.actions) {
          report += `  - ${action}\n`;
        }
      }
      
      if (rec.implementation.changes) {
        report += `- Changes:\n`;
        for (const change of rec.implementation.changes) {
          report += `  - ${change.description}\n`;
          if (change.code) {
            report += `\`\`\`js\n${change.code}\n\`\`\`\n`;
          }
        }
      }
      
      if (rec.implementation.examples) {
        report += `- Examples:\n`;
        for (const example of rec.implementation.examples) {
          report += `  - Original:\n\`\`\`js\n${example.original}\n\`\`\`\n`;
          report += `  - Optimized:\n\`\`\`js\n${example.optimized}\n\`\`\`\n`;
        }
      }
    }
    
    report += `\n`;
  }
  
  // Duplicate modules section
  if (duplicateModules.length > 0) {
    report += `## Duplicate Modules\n\n`;
    report += `The following modules appear multiple times in the bundle:\n\n`;
    report += `| Module | Count | Total Size (KB) |\n`;
    report += `|--------|-------|----------------|\n`;
    
    for (const mod of duplicateModules.slice(0, 20)) { // Limit to top 20
      report += `| ${mod.name} | ${mod.count} | ${formatSize(mod.size)} |\n`;
    }
    
    if (duplicateModules.length > 20) {
      report += `\n*...and ${duplicateModules.length - 20} more modules.*\n`;
    }
    
    report += `\n`;
  }
  
  // Common code patterns section
  if (commonCodePatterns.length > 0) {
    report += `## Common Code Patterns\n\n`;
    
    // Group by type
    const byType = {
      utility: commonCodePatterns.filter(p => p.type === 'utility'),
      helper: commonCodePatterns.filter(p => p.type === 'helper'),
      component: commonCodePatterns.filter(p => p.type === 'component'),
      import: commonCodePatterns.filter(p => p.type === 'import')
    };
    
    // Utility functions
    if (byType.utility.length > 0) {
      report += `### Common Utility Functions\n\n`;
      report += `| Function | Occurrences | Files |\n`;
      report += `|----------|-------------|-------|\n`;
      
      for (const pattern of byType.utility.slice(0, 10)) {
        const files = pattern.occurrences.map(o => path.basename(o.file)).join(', ');
        report += `| ${pattern.name} | ${pattern.count} | ${files.length > 50 ? files.substring(0, 50) + '...' : files} |\n`;
      }
      
      if (byType.utility.length > 10) {
        report += `\n*...and ${byType.utility.length - 10} more utility functions.*\n`;
      }
      
      report += `\n`;
    }
    
    // Helper functions
    if (byType.helper.length > 0) {
      report += `### Common Helper Functions\n\n`;
      report += `| Helper | Occurrences | Files |\n`;
      report += `|-------|-------------|-------|\n`;
      
      for (const pattern of byType.helper.slice(0, 10)) {
        const files = pattern.occurrences.map(o => path.basename(o.file)).join(', ');
        report += `| ${pattern.name} | ${pattern.count} | ${files.length > 50 ? files.substring(0, 50) + '...' : files} |\n`;
      }
      
      if (byType.helper.length > 10) {
        report += `\n*...and ${byType.helper.length - 10} more helper functions.*\n`;
      }
      
      report += `\n`;
    }
    
    // Common component patterns
    if (byType.component.length > 0) {
      report += `### Similar Component Patterns\n\n`;
      report += `| Pattern | Occurrences | Files |\n`;
      report += `|---------|-------------|-------|\n`;
      
      for (const pattern of byType.component.slice(0, 5)) {
        const files = pattern.occurrences.map(o => path.basename(o.file)).join(', ');
        const code = pattern.code.substring(0, 50).replace(/\n/g, ' ').trim() + '...';
        report += `| \`${code}\` | ${pattern.count} | ${files.length > 50 ? files.substring(0, 50) + '...' : files} |\n`;
      }
      
      if (byType.component.length > 5) {
        report += `\n*...and ${byType.component.length - 5} more component patterns.*\n`;
      }
      
      report += `\n`;
    }
  }
  
  // Implementation plan
  report += `## Implementation Plan\n\n`;
  report += `1. **Webpack Configuration**: Update splitChunks for better code organization\n`;
  report += `2. **Babel Configuration**: Add transform-runtime plugin to reduce helper code duplication\n`;
  report += `3. **Utility Functions**: Create shared modules for common utilities\n`;
  report += `4. **Component Refactoring**: Extract base components and use composition\n`;
  report += `5. **Dynamic Imports**: Convert large, infrequently used features to dynamic imports\n`;
  report += `6. **Package Resolutions**: Fix duplicate dependencies with package manager\n`;
  
  // Save report to file
  const reportPath = path.join(config.outputDir, `duplicate-code-report-${config.timestamp}.md`);
  fs.writeFileSync(reportPath, report);
  
  return report;
}

// Helper functions

/**
 * Find JavaScript and TypeScript files in directory
 * @param {string} dir Directory to search
 * @param {Array} files Accumulator for found files
 * @returns {Array} List of JS/TS files
 */
function findJsFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, dist, and other non-source directories
      if (entry.name !== 'node_modules' && 
          entry.name !== 'dist' && 
          entry.name !== 'build' && 
          entry.name !== 'coverage' &&
          !entry.name.startsWith('.')){
        findJsFiles(fullPath, files);
      }
    } else if (entry.isFile() && (
      entry.name.endsWith('.js') || 
      entry.name.endsWith('.jsx') || 
      entry.name.endsWith('.ts') || 
      entry.name.endsWith('.tsx')
    )) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Get line number for a position in text
 * @param {string} text Text content
 * @param {number} position Character position
 * @returns {number} Line number
 */
function getLineNumber(text, position) {
  const textUpToPosition = text.substring(0, position);
  return (textUpToPosition.match(/\n/g) || []).length + 1;
}

/**
 * Generate a hash string for content
 * @param {string} content Content to hash
 * @returns {string} Hash string
 */
function hashString(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes File size in bytes
 * @returns {string} Formatted file size
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Find webpack configuration file in project directory
 * @param {string} projectDir Project directory
 * @returns {string|null} Path to webpack config, or null if not found
 */
function findWebpackConfig(projectDir) {
  const configFiles = [
    path.join(projectDir, 'webpack.config.js'),
    path.join(projectDir, 'config', 'webpack.config.js'),
    path.join(projectDir, 'config', 'webpack.prod.js'),
    path.join(projectDir, 'config', 'webpack.common.js')
  ];
  
  for (const file of configFiles) {
    if (fs.existsSync(file)) {
      return file;
    }
  }
  
  // Search recursively in config directory
  const configDir = path.join(projectDir, 'config');
  if (fs.existsSync(configDir)) {
    const webpackFiles = findFilesRecursive(configDir, file => 
      file.endsWith('.js') && 
      (file.includes('webpack') || file.includes('bundle'))
    );
    
    if (webpackFiles.length > 0) {
      return webpackFiles[0];
    }
  }
  
  return null;
}

/**
 * Find Babel configuration file in project directory
 * @param {string} projectDir Project directory
 * @returns {string|null} Path to Babel config, or null if not found
 */
function findBabelConfig(projectDir) {
  const configFiles = [
    path.join(projectDir, 'babel.config.js'),
    path.join(projectDir, '.babelrc'),
    path.join(projectDir, '.babelrc.js'),
    path.join(projectDir, 'babel.config.json'),
    path.join(projectDir, '.babelrc.json')
  ];
  
  for (const file of configFiles) {
    if (fs.existsSync(file)) {
      return file;
    }
  }
  
  return null;
}

/**
 * Find files recursively in directory
 * @param {string} dir Directory to search
 * @param {Function} predicate Function to filter files
 * @param {Array} result Accumulator for found files
 * @returns {Array} List of matching files
 */
function findFilesRecursive(dir, predicate, result = []) {
  if (!fs.existsSync(dir)) {
    return result;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findFilesRecursive(fullPath, predicate, result);
    } else if (entry.isFile() && predicate(entry.name)) {
      result.push(fullPath);
    }
  }
  
  return result;
}

// Export the main function
module.exports = {
  analyzeAndReduceDuplicateCode
};

// Run directly if called from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: !args.includes('--execute'),
    outputDir: null, // Use default
    projectDir: null // Use default
  };
  
  // Parse output directory
  const outputDirArg = args.find(arg => arg.startsWith('--output-dir='));
  if (outputDirArg) {
    options.outputDir = outputDirArg.split('=')[1];
  }
  
  // Parse project directory
  const projectDirArg = args.find(arg => arg.startsWith('--project-dir='));
  if (projectDirArg) {
    options.projectDir = projectDirArg.split('=')[1];
  }
  
  analyzeAndReduceDuplicateCode(options);
}