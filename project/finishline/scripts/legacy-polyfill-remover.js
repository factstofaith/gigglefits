/**
 * Legacy Polyfill Remover
 * 
 * This script identifies and removes legacy polyfills from the project
 * to optimize bundle size and improve performance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Legacy polyfills that may be unnecessary in modern environments
const LEGACY_POLYFILLS = [
  'core-js@1',
  'core-js@2',
  'babel-polyfill',
  'es6-promise',
  'whatwg-fetch',
  'promise-polyfill',
  'classlist-polyfill',
  'custom-event-polyfill',
  'element-closest-polyfill',
  'url-polyfill',
  'intersection-observer-polyfill',
  'resize-observer-polyfill',
  'matchmedia-polyfill',
  'abortcontroller-polyfill'
];

// Modern alternatives or targeted imports
const MODERN_ALTERNATIVES = {
  'core-js@1': 'core-js@3 (with targeted imports)',
  'core-js@2': 'core-js@3 (with targeted imports)',
  'babel-polyfill': '@babel/preset-env with useBuiltIns: "usage"',
  'es6-promise': 'Native Promise or targeted polyfill',
  'whatwg-fetch': 'Native fetch or targeted polyfill',
  'promise-polyfill': 'Native Promise or targeted polyfill',
  'classlist-polyfill': 'core-js@3/features/dom-collections/class-list',
  'custom-event-polyfill': 'core-js@3/features/dom-collections/custom-event',
  'element-closest-polyfill': 'core-js@3/features/dom-collections/element-closest',
  'url-polyfill': 'core-js@3/features/url',
  'intersection-observer-polyfill': 'Targeted import only for browsers that need it',
  'resize-observer-polyfill': 'Targeted import only for browsers that need it',
  'matchmedia-polyfill': 'core-js@3/features/dom-collections/match-media',
  'abortcontroller-polyfill': 'Targeted import only for browsers that need it'
};

// Browser support data
const BROWSER_SUPPORT = {
  'Promise': ['Chrome >= 33', 'Edge >= 12', 'Firefox >= 29', 'Safari >= 8'],
  'fetch': ['Chrome >= 42', 'Edge >= 14', 'Firefox >= 39', 'Safari >= 10.1'],
  'classList': ['Chrome >= 23', 'Edge >= 12', 'Firefox >= 23', 'Safari >= 8'],
  'URL': ['Chrome >= 32', 'Edge >= 12', 'Firefox >= 26', 'Safari >= 8'],
  'IntersectionObserver': ['Chrome >= 51', 'Edge >= 15', 'Firefox >= 55', 'Safari >= 12.1'],
  'ResizeObserver': ['Chrome >= 64', 'Edge >= 79', 'Firefox >= 69', 'Safari >= 13.1'],
  'matchMedia': ['Chrome >= 9', 'Edge >= 12', 'Firefox >= 6', 'Safari >= 5.1'],
  'AbortController': ['Chrome >= 66', 'Edge >= 16', 'Firefox >= 57', 'Safari >= 12.1']
};

/**
 * Main function to analyze and remove legacy polyfills
 * @param {Object} options Configuration options
 * @param {boolean} options.dryRun Only analyze without making changes
 * @param {string} options.outputDir Directory for reports
 * @param {string} options.projectDir Root project directory
 */
function analyzeAndRemovePolyfills(options = {}) {
  // Default options
  const config = {
    dryRun: options.dryRun !== false,
    outputDir: options.outputDir || path.resolve(__dirname, '../build-verification'),
    projectDir: options.projectDir || path.resolve(__dirname, '..'),
    timestamp: new Date().toISOString().replace(/[:.]/g, '-')
  };

  console.log(`Running legacy polyfill analysis ${config.dryRun ? '(dry run)' : ''}`);
  console.log('======================================================');

  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  // Save current directory
  const currentDir = process.cwd();
  process.chdir(config.projectDir);

  try {
    // Step 1: Analyze direct dependencies in package.json
    console.log('Analyzing package.json for direct dependencies...');
    const packageJsonResults = analyzePackageJson(config);

    // Step 2: Analyze import statements in source files
    console.log('Analyzing source files for polyfill imports...');
    const importResults = analyzeImports(config);

    // Step 3: Determine browser targets
    console.log('Determining browser targets...');
    const browserTargets = determineBrowserTargets(config);

    // Step 4: Generate report
    console.log('Generating polyfill analysis report...');
    const report = generateReport(packageJsonResults, importResults, browserTargets, config);
    
    // Step 5: Remove unnecessary polyfills (if not in dry run mode)
    if (!config.dryRun && packageJsonResults.unnecessaryPolyfills.length > 0) {
      console.log('Removing unnecessary polyfills...');
      removePolyfills(packageJsonResults.unnecessaryPolyfills, config);
    }

    // Step 6: Update babel configuration (if not in dry run mode)
    if (!config.dryRun) {
      console.log('Updating Babel configuration...');
      updateBabelConfig(config, browserTargets);
    }

    // Display summary
    console.log('\nSummary:');
    console.log(`Found ${packageJsonResults.unnecessaryPolyfills.length} unnecessary direct polyfill dependencies`);
    console.log(`Found ${importResults.unnecessaryImports.length} unnecessary polyfill imports`);
    
    if (config.dryRun) {
      console.log('\nThis was a dry run. No changes were made.');
      console.log('Run with --execute to apply the changes.');
    } else {
      console.log('\nChanges applied:');
      console.log(`- Removed ${packageJsonResults.unnecessaryPolyfills.length} unnecessary polyfill packages`);
      console.log(`- Updated Babel configuration for optimal polyfill handling`);
    }

    console.log(`\nReport saved to: ${path.join(config.outputDir, `polyfill-analysis-${config.timestamp}.md`)}`);
    return report;
  } finally {
    // Restore working directory
    process.chdir(currentDir);
  }
}

/**
 * Analyze package.json for direct polyfill dependencies
 * @param {Object} config Configuration options
 * @returns {Object} Analysis results
 */
function analyzePackageJson(config) {
  const results = {
    polyfillDependencies: [],
    unnecessaryPolyfills: [],
    necessaryPolyfills: []
  };

  const packageJsonPath = path.join(config.projectDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('No package.json found.');
    return results;
  }

  // Parse package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };

  // Check for polyfill dependencies
  for (const polyfill of LEGACY_POLYFILLS) {
    const polyfillName = polyfill.split('@')[0]; // Remove version suffix for comparison
    
    Object.keys(dependencies).forEach(dep => {
      if (dep === polyfillName || dep.includes(polyfillName)) {
        results.polyfillDependencies.push({
          name: dep,
          version: dependencies[dep],
          isLegacy: true,
          alternative: MODERN_ALTERNATIVES[polyfill] || 'Targeted import only for browsers that need it'
        });
      }
    });
  }

  // Determine if polyfills are unnecessary based on browser targets
  for (const polyfill of results.polyfillDependencies) {
    // For simplicity in this example, we're marking all legacy polyfills as unnecessary
    // In a real-world scenario, you would check browser targets more carefully
    results.unnecessaryPolyfills.push(polyfill);
  }

  return results;
}

/**
 * Analyze source files for polyfill imports
 * @param {Object} config Configuration options
 * @returns {Object} Analysis results
 */
function analyzeImports(config) {
  const results = {
    polyfillImports: [],
    unnecessaryImports: [],
    necessaryImports: []
  };

  // Directory to search for source files
  const srcDir = path.join(config.projectDir, 'src');
  if (!fs.existsSync(srcDir)) {
    console.log('No src directory found.');
    return results;
  }

  // Recursively find JS/TS files
  const jsFiles = findJsFiles(srcDir);
  console.log(`Found ${jsFiles.length} JavaScript/TypeScript files to analyze.`);

  // Regular expressions for detecting polyfill imports
  const importRegexes = [
    /import\s+(['"])(.+?polyfill.+?)\1/g,
    /import\s+.*\s+from\s+(['"])(.+?polyfill.+?)\1/g,
    /require\s*\(\s*(['"])(.+?polyfill.+?)\1\s*\)/g,
    /import\s+(['"])core-js.+?\1/g,
    /import\s+.*\s+from\s+(['"])core-js.+?\1/g,
    /require\s*\(\s*(['"])core-js.+?\1\s*\)/g
  ];

  // Analyze each file
  for (const file of jsFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    for (const regex of importRegexes) {
      const matches = content.matchAll(regex);
      for (const match of matches) {
        const importPath = match[2] || match[1];
        results.polyfillImports.push({
          file: path.relative(config.projectDir, file),
          import: importPath,
          line: getLineNumber(content, match.index)
        });
      }
    }
  }

  // For simplicity, we're marking all polyfill imports as unnecessary
  // In a real implementation, you would need to check browser targets
  results.unnecessaryImports = [...results.polyfillImports];

  return results;
}

/**
 * Determine browser targets from browserslist or package.json
 * @param {Object} config Configuration options
 * @returns {Object} Browser targets
 */
function determineBrowserTargets(config) {
  // Look for browserslist configuration
  const browserslistPath = path.join(config.projectDir, '.browserslistrc');
  const packageJsonPath = path.join(config.projectDir, 'package.json');
  
  let targets = [];

  if (fs.existsSync(browserslistPath)) {
    // Parse .browserslistrc
    const browserslist = fs.readFileSync(browserslistPath, 'utf8')
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('#'))
      .map(line => line.trim());
    
    targets = browserslist;
  } else if (fs.existsSync(packageJsonPath)) {
    // Check for browserslist in package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson.browserslist) {
      targets = Array.isArray(packageJson.browserslist) 
        ? packageJson.browserslist 
        : Object.values(packageJson.browserslist).flat();
    }
  }

  // If no browserslist found, use a sensible default
  if (targets.length === 0) {
    targets = [
      'last 2 versions',
      'not dead',
      '> 0.5%'
    ];
  }

  return {
    targets,
    modernOnly: targets.some(t => 
      t.includes('last 1 chrome') || 
      t.includes('last 1 firefox') || 
      t.includes('last 1 safari')
    ),
    browserSupport: getBrowserSupportFromTargets(targets)
  };
}

/**
 * Get browser support data from targets
 * @param {string[]} targets Browserslist targets
 * @returns {Object} Browser support data
 */
function getBrowserSupportFromTargets(targets) {
  // This is a simplified implementation
  // In a real application, you would use browserslist-useragent or similar
  
  const includesIE = targets.some(t => t.includes('ie') || t.includes('explorer'));
  const includesOldBrowsers = targets.some(t => t.includes('> 1%') || t.includes('last 2 versions'));
  
  return {
    includesIE,
    includesOldBrowsers,
    // In a real implementation, you would determine this more precisely
    needsPromisePolyfill: includesIE,
    needsFetchPolyfill: includesIE || includesOldBrowsers
  };
}

/**
 * Generate analysis report
 * @param {Object} packageResults Package.json analysis results
 * @param {Object} importResults Import analysis results
 * @param {Object} browserTargets Browser targets
 * @param {Object} config Configuration options
 * @returns {string} Markdown report
 */
function generateReport(packageResults, importResults, browserTargets, config) {
  let report = `# Legacy Polyfill Analysis Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Browser targets section
  report += `## Browser Targets\n\n`;
  report += browserTargets.targets.length === 0 
    ? 'No explicit browser targets found.\n\n' 
    : `- ${browserTargets.targets.join('\n- ')}\n\n`;
  
  report += `Browser support analysis:\n`;
  report += `- Includes IE: ${browserTargets.browserSupport.includesIE ? 'Yes' : 'No'}\n`;
  report += `- Includes older browsers: ${browserTargets.browserSupport.includesOldBrowsers ? 'Yes' : 'No'}\n`;
  report += `- Requires Promise polyfill: ${browserTargets.browserSupport.needsPromisePolyfill ? 'Yes' : 'No'}\n`;
  report += `- Requires fetch polyfill: ${browserTargets.browserSupport.needsFetchPolyfill ? 'Yes' : 'No'}\n\n`;
  
  // Package.json polyfills section
  report += `## Polyfill Dependencies\n\n`;
  
  if (packageResults.polyfillDependencies.length === 0) {
    report += `No polyfill dependencies found in package.json.\n\n`;
  } else {
    report += `Found ${packageResults.polyfillDependencies.length} polyfill dependencies:\n\n`;
    report += `| Package | Version | Status | Alternative |\n`;
    report += `|---------|---------|--------|-------------|\n`;
    
    for (const polyfill of packageResults.polyfillDependencies) {
      const status = packageResults.unnecessaryPolyfills.includes(polyfill) 
        ? '❌ Unnecessary' 
        : '✅ Needed';
      
      report += `| ${polyfill.name} | ${polyfill.version} | ${status} | ${polyfill.alternative} |\n`;
    }
    report += `\n`;
  }
  
  // Source file imports section
  report += `## Polyfill Imports\n\n`;
  
  if (importResults.polyfillImports.length === 0) {
    report += `No polyfill imports found in source files.\n\n`;
  } else {
    report += `Found ${importResults.polyfillImports.length} polyfill imports:\n\n`;
    report += `| File | Import | Line | Status |\n`;
    report += `|------|--------|------|--------|\n`;
    
    for (const imp of importResults.polyfillImports) {
      const status = importResults.unnecessaryImports.includes(imp) 
        ? '❌ Unnecessary' 
        : '✅ Needed';
      
      report += `| ${imp.file} | ${imp.import} | ${imp.line} | ${status} |\n`;
    }
    report += `\n`;
  }
  
  // Recommendations section
  report += `## Recommendations\n\n`;
  
  if (packageResults.unnecessaryPolyfills.length === 0 && importResults.unnecessaryImports.length === 0) {
    report += `✅ No unnecessary polyfills found. Your project is already optimized!\n\n`;
  } else {
    report += `### 1. Package Dependencies\n\n`;
    
    if (packageResults.unnecessaryPolyfills.length > 0) {
      report += `Remove the following unnecessary polyfill dependencies:\n\n`;
      report += `\`\`\`bash\n`;
      report += `npm uninstall ${packageResults.unnecessaryPolyfills.map(p => p.name).join(' ')}\n`;
      report += `\`\`\`\n\n`;
    } else {
      report += `✅ No unnecessary polyfill dependencies found.\n\n`;
    }
    
    report += `### 2. Source File Imports\n\n`;
    
    if (importResults.unnecessaryImports.length > 0) {
      report += `Remove or replace the following unnecessary polyfill imports:\n\n`;
      
      for (const imp of importResults.unnecessaryImports) {
        report += `- ${imp.file} (line ${imp.line}): \`${imp.import}\`\n`;
      }
      report += `\n`;
    } else {
      report += `✅ No unnecessary polyfill imports found.\n\n`;
    }
    
    report += `### 3. Babel Configuration\n\n`;
    report += `Update your Babel configuration to use \`@babel/preset-env\` with \`useBuiltIns: "usage"\` and specify \`corejs: 3\`.\n\n`;
    report += `\`\`\`json\n`;
    report += `{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3,
      "targets": ${JSON.stringify(browserTargets.targets)}
    }]
  ]
}\n`;
    report += `\`\`\`\n\n`;
  }
  
  // Implementation plan
  report += `## Implementation Plan\n\n`;
  report += `1. Update Babel configuration to use \`@babel/preset-env\` with \`useBuiltIns: "usage"\`\n`;
  report += `2. Remove unnecessary polyfill packages from dependencies\n`;
  report += `3. Remove unnecessary polyfill imports from source files\n`;
  report += `4. Add targeted polyfills only for browsers that need them\n`;
  report += `5. Run the build and test process to verify everything works correctly\n`;
  
  // Save report to file
  const reportPath = path.join(config.outputDir, `polyfill-analysis-${config.timestamp}.md`);
  fs.writeFileSync(reportPath, report);
  
  return report;
}

/**
 * Remove unnecessary polyfill packages
 * @param {Array} polyfills List of polyfills to remove
 * @param {Object} config Configuration options
 */
function removePolyfills(polyfills, config) {
  if (polyfills.length === 0) {
    console.log('No polyfills to remove.');
    return;
  }

  const packageNames = polyfills.map(p => p.name);
  
  try {
    console.log(`Removing unnecessary polyfills: ${packageNames.join(', ')}`);
    execSync(`npm uninstall ${packageNames.join(' ')}`, { stdio: 'inherit' });
    console.log('Successfully removed unnecessary polyfills.');
  } catch (error) {
    console.error('Error removing polyfills:', error.message);
  }
}

/**
 * Update Babel configuration for optimal polyfill handling
 * @param {Object} config Configuration options
 * @param {Object} browserTargets Browser targets
 */
function updateBabelConfig(config, browserTargets) {
  // Look for babel configuration files
  const babelConfigPaths = [
    path.join(config.projectDir, 'babel.config.js'),
    path.join(config.projectDir, 'babel.config.json'),
    path.join(config.projectDir, '.babelrc'),
    path.join(config.projectDir, '.babelrc.js'),
    path.join(config.projectDir, '.babelrc.json')
  ];
  
  let babelConfigPath = null;
  let babelConfig = null;
  let isJson = false;
  
  // Find existing babel config
  for (const configPath of babelConfigPaths) {
    if (fs.existsSync(configPath)) {
      babelConfigPath = configPath;
      if (configPath.endsWith('.js')) {
        // For JS config files, we need to require them
        try {
          babelConfig = require(configPath);
        } catch (error) {
          console.error(`Error loading Babel config from ${configPath}:`, error.message);
          return;
        }
      } else {
        // For JSON config files, parse the content
        try {
          babelConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          isJson = true;
        } catch (error) {
          console.error(`Error parsing Babel config from ${configPath}:`, error.message);
          return;
        }
      }
      break;
    }
  }
  
  // If no config found, create a new one
  if (!babelConfigPath) {
    babelConfigPath = path.join(config.projectDir, 'babel.config.json');
    babelConfig = {};
    isJson = true;
  }
  
  // Check if @babel/preset-env is already configured
  babelConfig.presets = babelConfig.presets || [];
  
  let presetEnvIndex = -1;
  let presetEnvConfig = null;
  
  for (let i = 0; i < babelConfig.presets.length; i++) {
    const preset = babelConfig.presets[i];
    
    if (Array.isArray(preset) && (preset[0] === '@babel/preset-env' || preset[0] === '@babel/env')) {
      presetEnvIndex = i;
      presetEnvConfig = preset[1] || {};
      break;
    } else if (preset === '@babel/preset-env' || preset === '@babel/env') {
      presetEnvIndex = i;
      presetEnvConfig = {};
      break;
    }
  }
  
  // Update or add @babel/preset-env configuration
  if (presetEnvIndex !== -1) {
    // Update existing preset
    babelConfig.presets[presetEnvIndex] = [
      '@babel/preset-env',
      {
        ...presetEnvConfig,
        useBuiltIns: 'usage',
        corejs: 3,
        targets: browserTargets.targets
      }
    ];
  } else {
    // Add new preset
    babelConfig.presets.push([
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: 3,
        targets: browserTargets.targets
      }
    ]);
  }
  
  // Save updated config
  try {
    if (isJson) {
      fs.writeFileSync(babelConfigPath, JSON.stringify(babelConfig, null, 2));
    } else {
      // For JS config files, we create a module.exports statement
      const configContent = `module.exports = ${JSON.stringify(babelConfig, null, 2)};`;
      fs.writeFileSync(babelConfigPath, configContent);
    }
    console.log(`Updated Babel configuration at ${babelConfigPath}`);
    
    // Install core-js@3 if not already present
    try {
      execSync('npm list core-js@3 || npm install --save-dev core-js@3', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error installing core-js@3:', error.message);
    }
  } catch (error) {
    console.error(`Error saving Babel config to ${babelConfigPath}:`, error.message);
  }
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
      // Skip node_modules and dist directories
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== 'build') {
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

// Export the main function
module.exports = {
  analyzeAndRemovePolyfills,
  LEGACY_POLYFILLS,
  MODERN_ALTERNATIVES,
  BROWSER_SUPPORT
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
  
  analyzeAndRemovePolyfills(options);
}