/**
 * Phase 10 Automator - Build Optimization
 * 
 * This module provides tools for optimizing project builds and minimizing bundle sizes
 * to achieve zero build errors and warnings.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Run the Phase 10 automator for build optimization
 * @param {Object} options Configuration options
 * @param {boolean} options.auditOnly Only audit the build without making changes
 * @param {boolean} options.fixErrors Fix build errors and warnings
 * @param {boolean} options.optimizeBuild Optimize build process
 * @param {boolean} options.minimizeBundle Minimize bundle sizes
 */
function runPhase10Automator(options = {}) {
  console.log('Running Phase 10 Automator - Build Optimization');
  console.log('===============================================');
  
  // Default options
  const config = {
    auditOnly: options.auditOnly || false,
    fixErrors: options.fixErrors !== false,
    optimizeBuild: options.optimizeBuild !== false,
    minimizeBundle: options.minimizeBundle !== false,
    outputDir: options.outputDir || '../build-verification',
    baseDir: options.baseDir || path.resolve(__dirname, '..'),
    timestamp: new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T')
  };

  console.log('Configuration:');
  console.log(`- Audit Only: ${config.auditOnly}`);
  console.log(`- Fix Errors: ${config.fixErrors}`);
  console.log(`- Optimize Build: ${config.optimizeBuild}`);
  console.log(`- Minimize Bundle: ${config.minimizeBundle}`);
  console.log(`- Output Directory: ${config.outputDir}`);
  console.log(`- Timestamp: ${config.timestamp}`);

  // Create output directory if it doesn't exist
  const outputDir = path.resolve(config.baseDir, config.outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Step 1: Run build audit
  const auditResults = runBuildAudit(config);
  
  // Step 2: Fix build errors (if enabled)
  if (!config.auditOnly && config.fixErrors && auditResults.errors.length > 0) {
    fixBuildErrors(auditResults.errors, config);
  }
  
  // Step 3: Optimize build process (if enabled)
  if (!config.auditOnly && config.optimizeBuild) {
    optimizeBuildProcess(config);
  }
  
  // Step 4: Minimize bundle sizes (if enabled)
  if (!config.auditOnly && config.minimizeBundle) {
    minimizeBundles(config);
  }
  
  // Step 5: Verify optimizations
  if (!config.auditOnly) {
    const finalResults = verifyOptimizations(config);
    generateSummaryReport(finalResults, config);
  }

  console.log('Build optimization complete!');
}

/**
 * Run build audit to detect errors and warnings
 * @param {Object} config Configuration options
 * @returns {Object} Audit results with errors and warnings
 */
function runBuildAudit(config) {
  console.log('\nRunning Build Audit...');
  
  // Save current directory to restore later
  const currentDir = process.cwd();
  
  try {
    // Change to project directory
    process.chdir(config.baseDir);
    
    // Create result structure
    const results = {
      errors: [],
      warnings: [],
      dependencies: [],
      metrics: {}
    };
    
    // Step 1: Run npm audit to check for package vulnerabilities
    console.log('Checking npm dependencies...');
    try {
      const npmAuditOutput = execSync('npm audit --json', { encoding: 'utf8' });
      const auditResults = JSON.parse(npmAuditOutput);
      
      results.dependencies = Object.entries(auditResults.vulnerabilities || {}).map(([name, info]) => ({
        name,
        severity: info.severity,
        isDirect: info.isDirect || false,
        path: info.effects || [],
        overview: info.overview || '',
        recommendation: info.recommendation || ''
      }));
      
      console.log(`Found ${results.dependencies.length} dependency issues`);
    } catch (auditError) {
      if (auditError.status === 1 && auditError.stdout) {
        // npm audit returns exit code 1 when vulnerabilities are found
        try {
          const auditResults = JSON.parse(auditError.stdout);
          results.dependencies = Object.entries(auditResults.vulnerabilities || {}).map(([name, info]) => ({
            name,
            severity: info.severity,
            isDirect: info.isDirect || false,
            path: info.effects || [],
            overview: info.overview || '',
            recommendation: info.recommendation || ''
          }));
          
          console.log(`Found ${results.dependencies.length} dependency issues`);
        } catch (parseError) {
          console.error('Error parsing npm audit results:', parseError.message);
        }
      } else {
        console.error('Error running npm audit:', auditError.message);
      }
    }
    
    // Step 2: Check for unused dependencies
    console.log('Checking for unused dependencies...');
    try {
      const depcheckResult = execSync('npx depcheck --json', { encoding: 'utf8' });
      const depcheckData = JSON.parse(depcheckResult);
      
      // Add unused dependencies to the results
      depcheckData.dependencies.forEach(dep => {
        results.dependencies.push({
          name: dep,
          severity: 'low',
          isDirect: true,
          path: [],
          overview: 'Unused dependency',
          recommendation: 'Remove this unused dependency'
        });
      });
      
      console.log(`Found ${depcheckData.dependencies.length} unused dependencies`);
    } catch (depcheckError) {
      console.error('Error checking for unused dependencies:', depcheckError.message);
    }
    
    // Step 3: Run a test build to collect errors and warnings
    console.log('Running test build to collect errors and warnings...');
    try {
      // Redirect output to a file to capture it
      const buildOutputFile = path.join(config.outputDir, `build-log-${config.timestamp}.txt`);
      try {
        execSync(`npm run build 2>&1 | tee ${buildOutputFile}`, { encoding: 'utf8' });
      } catch (buildError) {
        // Continue even if build fails - we want to collect the errors
        fs.writeFileSync(buildOutputFile, buildError.stdout || buildError.message);
      }
      
      // Read build output file to parse errors and warnings
      const buildOutput = fs.readFileSync(buildOutputFile, 'utf8');
      
      // Parse build output for errors and warnings
      results.errors = parseErrorsFromBuildOutput(buildOutput);
      results.warnings = parseWarningsFromBuildOutput(buildOutput);
      
      console.log(`Found ${results.errors.length} errors and ${results.warnings.length} warnings in build output`);
    } catch (error) {
      console.error('Error running test build:', error.message);
    }
    
    // Step 4: Collect bundle metrics if possible
    console.log('Collecting bundle metrics...');
    try {
      // Run bundle analyzer in static mode
      execSync('npx webpack-bundle-analyzer stats.json --mode static --report build-report.html --no-open', { 
        stdio: 'inherit'
      });
      
      // Extract bundle metrics from stats.json
      if (fs.existsSync('stats.json')) {
        const stats = JSON.parse(fs.readFileSync('stats.json', 'utf8'));
        
        results.metrics = {
          totalSize: stats.assets.reduce((total, asset) => total + asset.size, 0),
          jsSize: stats.assets.filter(asset => asset.name.endsWith('.js'))
            .reduce((total, asset) => total + asset.size, 0),
          cssSize: stats.assets.filter(asset => asset.name.endsWith('.css'))
            .reduce((total, asset) => total + asset.size, 0),
          chunkCount: stats.assets.length,
          entryPoints: Object.keys(stats.entrypoints || {}).length
        };
        
        console.log('Bundle metrics collected successfully');
      }
    } catch (error) {
      console.error('Error collecting bundle metrics:', error.message);
    }
    
    // Save audit results to file
    const auditResultFile = path.join(config.outputDir, `build-audit-${config.timestamp}.json`);
    fs.writeFileSync(auditResultFile, JSON.stringify(results, null, 2));
    console.log(`Audit results saved to: ${auditResultFile}`);
    
    // Generate audit report
    generateAuditReport(results, config);
    
    return results;
  } finally {
    // Restore original directory
    process.chdir(currentDir);
  }
}

/**
 * Parse build output for errors
 * @param {string} buildOutput Raw build output
 * @returns {Array} Array of error objects
 */
function parseErrorsFromBuildOutput(buildOutput) {
  const errors = [];
  
  // Common error patterns in build output
  const errorPatterns = [
    // Webpack errors
    /ERROR in (.*?)([\s\S]*?)(?=ERROR in|WARNING in|$)/gi,
    // TypeScript errors
    /error TS\d+:(.*)/gi,
    // ESLint errors
    /\d+ problems \(\d+ errors, \d+ warnings\)/i
  ];
  
  // Extract errors using patterns
  errorPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(buildOutput)) !== null) {
      const [fullMatch, file, details] = match;
      errors.push({
        type: 'build-error',
        file: file ? file.trim() : 'unknown',
        message: details ? details.trim() : fullMatch.trim(),
        raw: fullMatch.trim()
      });
    }
  });
  
  // Special handling for ESLint errors with a different format
  const eslintErrorBlocks = buildOutput.match(/(?:Errors|Warnings):[\s\S]*?(?=\n\n|\n$)/gi) || [];
  eslintErrorBlocks.forEach(block => {
    if (block.includes('Errors:')) {
      const lines = block.split('\n').slice(1); // Skip the "Errors:" line
      lines.forEach(line => {
        const eslintMatch = line.match(/^\s*(\d+):(\d+)\s+(.*)/);
        if (eslintMatch) {
          const [, line, column, message] = eslintMatch;
          errors.push({
            type: 'eslint-error',
            file: 'unknown', // File name not present in this format
            line: parseInt(line, 10),
            column: parseInt(column, 10),
            message: message.trim(),
            raw: line.trim()
          });
        }
      });
    }
  });
  
  return errors;
}

/**
 * Parse build output for warnings
 * @param {string} buildOutput Raw build output
 * @returns {Array} Array of warning objects
 */
function parseWarningsFromBuildOutput(buildOutput) {
  const warnings = [];
  
  // Common warning patterns in build output
  const warningPatterns = [
    // Webpack warnings
    /WARNING in (.*?)([\s\S]*?)(?=WARNING in|ERROR in|$)/gi,
    // TypeScript warnings
    /warning TS\d+:(.*)/gi,
    // Deprecation warnings
    /(DeprecationWarning: .*)/gi
  ];
  
  // Extract warnings using patterns
  warningPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(buildOutput)) !== null) {
      const [fullMatch, file, details] = match;
      warnings.push({
        type: 'build-warning',
        file: file ? file.trim() : 'unknown',
        message: details ? details.trim() : fullMatch.trim(),
        raw: fullMatch.trim()
      });
    }
  });
  
  // Special handling for ESLint warnings with a different format
  const eslintWarningBlocks = buildOutput.match(/(?:Warnings):[\s\S]*?(?=\n\n|\n$)/gi) || [];
  eslintWarningBlocks.forEach(block => {
    const lines = block.split('\n').slice(1); // Skip the "Warnings:" line
    lines.forEach(line => {
      const eslintMatch = line.match(/^\s*(\d+):(\d+)\s+(.*)/);
      if (eslintMatch) {
        const [, line, column, message] = eslintMatch;
        warnings.push({
          type: 'eslint-warning',
          file: 'unknown', // File name not present in this format
          line: parseInt(line, 10),
          column: parseInt(column, 10),
          message: message.trim(),
          raw: line.trim()
        });
      }
    });
  });
  
  return warnings;
}

/**
 * Generate audit report from results
 * @param {Object} results Audit results
 * @param {Object} config Configuration options
 */
function generateAuditReport(results, config) {
  console.log('\nGenerating audit report...');
  
  // Create output file paths
  const reportFile = path.join(config.outputDir, `build-audit-${config.timestamp}.md`);
  
  // Create report content
  let report = `# Build Audit Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Summary section
  report += `## Summary\n\n`;
  report += `- **Build Errors**: ${results.errors.length}\n`;
  report += `- **Build Warnings**: ${results.warnings.length}\n`;
  report += `- **Dependency Issues**: ${results.dependencies.length}\n`;
  
  if (results.metrics && Object.keys(results.metrics).length > 0) {
    report += `- **Total Bundle Size**: ${formatBytes(results.metrics.totalSize)}\n`;
    report += `- **JS Size**: ${formatBytes(results.metrics.jsSize)}\n`;
    report += `- **CSS Size**: ${formatBytes(results.metrics.cssSize)}\n`;
    report += `- **Chunk Count**: ${results.metrics.chunkCount}\n`;
    report += `- **Entry Points**: ${results.metrics.entryPoints}\n`;
  }
  
  // Build errors section
  if (results.errors.length > 0) {
    report += `\n## Build Errors\n\n`;
    results.errors.forEach((error, index) => {
      report += `### Error ${index + 1}\n\n`;
      report += `- **Type**: ${error.type}\n`;
      report += `- **File**: ${error.file}\n`;
      if (error.line) {
        report += `- **Location**: Line ${error.line}${error.column ? `, Column ${error.column}` : ''}\n`;
      }
      report += `- **Message**: ${error.message}\n`;
      report += `\n\`\`\`\n${error.raw}\n\`\`\`\n\n`;
    });
  }
  
  // Build warnings section
  if (results.warnings.length > 0) {
    report += `\n## Build Warnings\n\n`;
    results.warnings.forEach((warning, index) => {
      report += `### Warning ${index + 1}\n\n`;
      report += `- **Type**: ${warning.type}\n`;
      report += `- **File**: ${warning.file}\n`;
      if (warning.line) {
        report += `- **Location**: Line ${warning.line}${warning.column ? `, Column ${warning.column}` : ''}\n`;
      }
      report += `- **Message**: ${warning.message}\n`;
      report += `\n\`\`\`\n${warning.raw}\n\`\`\`\n\n`;
    });
  }
  
  // Dependency issues section
  if (results.dependencies.length > 0) {
    report += `\n## Dependency Issues\n\n`;
    
    // Group by severity
    const severitiesToShow = ['critical', 'high', 'moderate', 'low'];
    
    severitiesToShow.forEach(severity => {
      const deps = results.dependencies.filter(dep => dep.severity === severity);
      if (deps.length > 0) {
        report += `### ${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity Issues\n\n`;
        
        deps.forEach((dep, index) => {
          report += `#### ${index + 1}. ${dep.name}\n\n`;
          report += `- **Severity**: ${dep.severity}\n`;
          report += `- **Direct Dependency**: ${dep.isDirect ? 'Yes' : 'No'}\n`;
          
          if (dep.path && dep.path.length > 0) {
            report += `- **Dependency Path**: ${dep.path.join(' > ')}\n`;
          }
          
          if (dep.overview) {
            report += `- **Overview**: ${dep.overview}\n`;
          }
          
          if (dep.recommendation) {
            report += `- **Recommendation**: ${dep.recommendation}\n`;
          }
          
          report += `\n`;
        });
      }
    });
  }
  
  // Next steps section
  report += `\n## Recommended Actions\n\n`;
  
  if (results.errors.length > 0) {
    report += `### Fix Build Errors\n\n`;
    report += `1. Address all build errors before making other optimizations\n`;
    report += `2. Focus on fixing TypeScript and ESLint errors first\n`;
    report += `3. Run \`project-tools.js phase10 --fix-errors\` to attempt automatic fixes\n\n`;
  }
  
  if (results.dependencies.length > 0) {
    report += `### Dependency Management\n\n`;
    report += `1. Update packages with security vulnerabilities\n`;
    report += `2. Remove unused dependencies\n`;
    report += `3. Run \`npm audit fix\` to address security issues\n`;
    report += `4. Run \`project-tools.js phase10 --minimize\` to optimize dependencies\n\n`;
  }
  
  if (results.warnings.length > 0) {
    report += `### Address Build Warnings\n\n`;
    report += `1. Fix deprecation warnings to prevent future errors\n`;
    report += `2. Address performance warnings to improve build efficiency\n`;
    report += `3. Run \`project-tools.js phase10 --fix-errors\` to fix warnings too\n\n`;
  }
  
  report += `### Build Optimization\n\n`;
  report += `1. Run \`project-tools.js phase10 --optimize\` to improve build performance\n`;
  report += `2. Run \`project-tools.js phase10 --minimize\` to reduce bundle sizes\n\n`;
  
  // Save report to file
  fs.writeFileSync(reportFile, report);
  console.log(`Build audit report saved to: ${reportFile}`);
}

/**
 * Fix build errors identified in the audit
 * @param {Array} errors Array of build errors
 * @param {Object} config Configuration options
 */
function fixBuildErrors(errors, config) {
  console.log('\nFix build errors...');
  
  // Track successful and failed fixes
  const fixes = {
    success: [],
    failed: []
  };
  
  // Save current directory
  const currentDir = process.cwd();
  
  try {
    // Change to project directory
    process.chdir(config.baseDir);
    
    // Group errors by type for more efficient fixing
    const errorsByType = {};
    errors.forEach(error => {
      const type = error.type || 'unknown';
      if (!errorsByType[type]) {
        errorsByType[type] = [];
      }
      errorsByType[type].push(error);
    });
    
    // 1. Fix ESLint errors
    if (errorsByType['eslint-error']) {
      console.log(`Fixing ${errorsByType['eslint-error'].length} ESLint errors...`);
      
      try {
        execSync('npm run lint -- --fix', { stdio: 'inherit' });
        fixes.success.push({
          type: 'eslint-errors',
          count: errorsByType['eslint-error'].length,
          description: 'Fixed ESLint errors with automatic fixing'
        });
        console.log('ESLint errors fixed successfully!');
      } catch (error) {
        console.error('Error fixing ESLint errors:', error.message);
        fixes.failed.push({
          type: 'eslint-errors',
          count: errorsByType['eslint-error'].length,
          description: 'Failed to fix ESLint errors automatically',
          error: error.message
        });
      }
    }
    
    // 2. Fix TypeScript errors
    if (errorsByType['typescript-error']) {
      console.log(`Fixing ${errorsByType['typescript-error'].length} TypeScript errors...`);
      
      try {
        // Try to fix common TypeScript errors
        execSync('npx tsc --noEmit', { stdio: 'inherit' });
        fixes.success.push({
          type: 'typescript-errors',
          count: errorsByType['typescript-error'].length,
          description: 'Identified TypeScript errors for fixing'
        });
      } catch (error) {
        console.error('Error running TypeScript check:', error.message);
        fixes.failed.push({
          type: 'typescript-errors',
          count: errorsByType['typescript-error'].length,
          description: 'Failed to fix TypeScript errors automatically',
          error: error.message
        });
      }
    }
    
    // 3. Fix dependency issues
    console.log('Fixing dependency issues...');
    
    try {
      // Run npm audit fix to address security vulnerabilities
      execSync('npm audit fix', { stdio: 'inherit' });
      
      // Remove unused dependencies identified by depcheck
      try {
        const depcheckResult = execSync('npx depcheck --json', { encoding: 'utf8' });
        const depcheckData = JSON.parse(depcheckResult);
        
        if (depcheckData.dependencies && depcheckData.dependencies.length > 0) {
          console.log(`Found ${depcheckData.dependencies.length} unused dependencies, removing...`);
          
          const unusedDeps = depcheckData.dependencies.join(' ');
          execSync(`npm uninstall ${unusedDeps}`, { stdio: 'inherit' });
          
          fixes.success.push({
            type: 'unused-dependencies',
            count: depcheckData.dependencies.length,
            description: `Removed unused dependencies: ${unusedDeps}`
          });
        }
      } catch (depcheckError) {
        console.error('Error removing unused dependencies:', depcheckError.message);
        fixes.failed.push({
          type: 'unused-dependencies',
          description: 'Failed to remove unused dependencies',
          error: depcheckError.message
        });
      }
      
      fixes.success.push({
        type: 'dependencies',
        description: 'Fixed dependency issues with npm audit fix'
      });
    } catch (error) {
      console.error('Error fixing dependency issues:', error.message);
      fixes.failed.push({
        type: 'dependencies',
        description: 'Failed to fix dependency issues',
        error: error.message
      });
    }
    
    // 4. Fix webpack config issues
    console.log('Checking for webpack configuration issues...');
    
    try {
      // Attempt to validate webpack configuration
      execSync('npx webpack --config webpack.config.js --display-error-details', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      fixes.success.push({
        type: 'webpack-config',
        description: 'Webpack configuration validated successfully'
      });
    } catch (error) {
      console.error('Error validating webpack configuration:', error.message);
      fixes.failed.push({
        type: 'webpack-config',
        description: 'Failed to validate webpack configuration',
        error: error.message
      });
    }
    
    // Save fix results
    const fixResultsFile = path.join(config.outputDir, `fix-results-${config.timestamp}.json`);
    fs.writeFileSync(fixResultsFile, JSON.stringify(fixes, null, 2));
    console.log(`Fix results saved to: ${fixResultsFile}`);
    
    return fixes;
  } finally {
    // Restore original directory
    process.chdir(currentDir);
  }
}

/**
 * Optimize the build process
 * @param {Object} config Configuration options
 */
function optimizeBuildProcess(config) {
  console.log('\nOptimizing build process...');
  
  // Save current directory
  const currentDir = process.cwd();
  
  try {
    // Change to project directory
    process.chdir(config.baseDir);
    
    // Optimizations applied
    const optimizations = [];
    
    // 1. Enable persistent caching in webpack
    console.log('Enabling webpack persistent caching...');
    
    try {
      // Check for webpack.config.js
      const webpackConfigFile = findWebpackConfig(config.baseDir);
      
      if (webpackConfigFile) {
        // Read current webpack config
        let webpackConfig = fs.readFileSync(webpackConfigFile, 'utf8');
        
        // Check if cache is already configured
        if (!webpackConfig.includes('cache:') || !webpackConfig.includes('type: "filesystem"')) {
          // Add cache configuration to webpack config
          const cacheConfig = `
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    },
    name: 'production-cache'
  },`;
          
          // Find where to insert the cache configuration
          let modifiedConfig;
          if (webpackConfig.includes('module.exports = {')) {
            modifiedConfig = webpackConfig.replace('module.exports = {', `module.exports = {${cacheConfig}`);
          } else if (webpackConfig.includes('export default {')) {
            modifiedConfig = webpackConfig.replace('export default {', `export default {${cacheConfig}`);
          } else {
            throw new Error('Unable to find module.exports or export default in webpack config');
          }
          
          // Backup original config
          fs.writeFileSync(`${webpackConfigFile}.bak`, webpackConfig);
          
          // Write modified config
          fs.writeFileSync(webpackConfigFile, modifiedConfig);
          
          optimizations.push({
            type: 'webpack-cache',
            description: 'Enabled persistent filesystem cache in webpack configuration'
          });
          
          console.log('Webpack cache configuration updated successfully');
        } else {
          console.log('Webpack already has persistent cache configured');
          optimizations.push({
            type: 'webpack-cache',
            description: 'Webpack already has persistent cache configured'
          });
        }
      } else {
        console.log('No webpack configuration file found');
      }
    } catch (error) {
      console.error('Error updating webpack cache configuration:', error.message);
    }
    
    // 2. Configure parallel processing in babel/terser
    console.log('Configuring parallel processing...');
    
    try {
      // Look for babel configuration
      const babelConfigFile = findFileInDir(config.baseDir, /babel\.config\.(js|json|cjs)$/);
      
      if (babelConfigFile) {
        // Read current babel config
        let babelConfig = fs.readFileSync(babelConfigFile, 'utf8');
        
        // Check if already configured for parallel processing
        if (!babelConfig.includes('cacheDirectory')) {
          // Add cache configuration for babel-loader
          fs.writeFileSync(
            path.join(config.outputDir, 'babel-optimization.md'),
            `# Babel Optimization

Add the following configuration to your webpack config to enable parallel processing and caching in babel-loader:

\`\`\`js
{
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    cacheCompression: false
  }
}
\`\`\`
`
          );
          
          optimizations.push({
            type: 'babel-cache',
            description: 'Created recommendation for babel-loader cache configuration'
          });
        } else {
          console.log('Babel already has cache configuration');
          optimizations.push({
            type: 'babel-cache',
            description: 'Babel already has cache configuration'
          });
        }
      }
    } catch (error) {
      console.error('Error configuring parallel processing:', error.message);
    }
    
    // 3. Optimize image handling
    console.log('Optimizing image handling...');
    
    try {
      // Install image optimization dependencies if not already installed
      execSync('npm list imagemin-webpack-plugin || npm install --save-dev imagemin-webpack-plugin', { 
        stdio: 'inherit'
      });
      
      // Create example configuration for image optimization
      fs.writeFileSync(
        path.join(config.outputDir, 'image-optimization.md'),
        `# Image Optimization Configuration

Add the following to your webpack config to optimize images:

\`\`\`js
const ImageminPlugin = require('imagemin-webpack-plugin').default;

// Add to plugins array
plugins: [
  new ImageminPlugin({
    test: /\\.(jpe?g|png|gif|svg)$/i,
    pngquant: {
      quality: '80-90'
    },
    optipng: {
      optimizationLevel: 3
    },
    jpegtran: {
      progressive: true
    },
    gifsicle: {
      interlaced: true,
      optimizationLevel: 3
    }
  })
]
\`\`\`
`
      );
      
      optimizations.push({
        type: 'image-optimization',
        description: 'Added image optimization configuration'
      });
    } catch (error) {
      console.error('Error setting up image optimization:', error.message);
    }
    
    // 4. Create npm script for incremental builds
    console.log('Setting up incremental build script...');
    
    try {
      // Read package.json
      const packageJsonPath = path.join(config.baseDir, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Add incremental build script if it doesn't exist
        if (!packageJson.scripts || !packageJson.scripts['build:incremental']) {
          packageJson.scripts = packageJson.scripts || {};
          packageJson.scripts['build:incremental'] = 'WEBPACK_INCREMENTAL=true npm run build';
          
          // Backup original package.json
          fs.writeFileSync(`${packageJsonPath}.bak`, JSON.stringify(packageJson, null, 2));
          
          // Write modified package.json
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          
          optimizations.push({
            type: 'incremental-build',
            description: 'Added incremental build script'
          });
          
          console.log('Incremental build script added successfully');
        } else {
          console.log('Incremental build script already exists');
          optimizations.push({
            type: 'incremental-build',
            description: 'Incremental build script already exists'
          });
        }
      }
    } catch (error) {
      console.error('Error setting up incremental build script:', error.message);
    }
    
    // Save optimization results
    const optimizationResultsFile = path.join(config.outputDir, `optimization-results-${config.timestamp}.json`);
    fs.writeFileSync(optimizationResultsFile, JSON.stringify(optimizations, null, 2));
    console.log(`Optimization results saved to: ${optimizationResultsFile}`);
    
    return optimizations;
  } finally {
    // Restore original directory
    process.chdir(currentDir);
  }
}

/**
 * Minimize bundle sizes through optimization techniques
 * @param {Object} config Configuration options
 */
function minimizeBundles(config) {
  console.log('\nMinimizing bundle sizes...');
  
  // Save current directory
  const currentDir = process.cwd();
  
  try {
    // Change to project directory
    process.chdir(config.baseDir);
    
    // Optimizations applied
    const optimizations = [];
    
    // 1. Set up tree shaking improvements
    console.log('Enhancing tree shaking...');
    
    try {
      // Find webpack config
      const webpackConfigFile = findWebpackConfig(config.baseDir);
      
      if (webpackConfigFile) {
        // Read webpack config
        let webpackConfig = fs.readFileSync(webpackConfigFile, 'utf8');
        
        // Check if tree shaking is already configured
        if (!webpackConfig.includes('sideEffects') || !webpackConfig.includes('usedExports')) {
          // Create tree shaking optimization guide
          fs.writeFileSync(
            path.join(config.outputDir, 'tree-shaking-optimization.md'),
            `# Tree Shaking Optimization

Add the following configuration to your webpack config's optimization section:

\`\`\`js
optimization: {
  usedExports: true,
  providedExports: true,
  sideEffects: true,
  // Existing optimization settings...
}
\`\`\`

Also, mark packages without side effects in your package.json:

\`\`\`json
{
  "sideEffects": false,
  // or
  "sideEffects": ["*.css", "*.scss"]
}
\`\`\`
`
          );
          
          optimizations.push({
            type: 'tree-shaking',
            description: 'Created tree shaking optimization guide'
          });
        } else {
          console.log('Tree shaking already configured');
          optimizations.push({
            type: 'tree-shaking',
            description: 'Tree shaking already configured'
          });
        }
      }
      
      // Update package.json to mark sideEffects
      const packageJsonPath = path.join(config.baseDir, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (packageJson.sideEffects === undefined) {
          // Backup original package.json
          fs.writeFileSync(`${packageJsonPath}.bak`, JSON.stringify(packageJson, null, 2));
          
          // Update package.json with sideEffects
          packageJson.sideEffects = ["*.css", "*.scss", "*.less"];
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          
          optimizations.push({
            type: 'side-effects',
            description: 'Updated package.json with sideEffects configuration'
          });
          
          console.log('Package.json updated with sideEffects configuration');
        } else {
          console.log('sideEffects already configured in package.json');
          optimizations.push({
            type: 'side-effects',
            description: 'sideEffects already configured in package.json'
          });
        }
      }
    } catch (error) {
      console.error('Error enhancing tree shaking:', error.message);
    }
    
    // 2. Set up code splitting optimization
    console.log('Optimizing code splitting...');
    
    try {
      // Find webpack config
      const webpackConfigFile = findWebpackConfig(config.baseDir);
      
      if (webpackConfigFile) {
        // Create code splitting optimization guide
        fs.writeFileSync(
          path.join(config.outputDir, 'code-splitting-optimization.md'),
          `# Code Splitting Optimization

Add the following configuration to your webpack config's optimization section:

\`\`\`js
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
      // Other cache groups for specific large packages
      react: {
        test: /[\\\\/]node_modules[\\\\/](react|react-dom)[\\\\/]/,
        name: 'react',
        chunks: 'all',
        priority: 10,
      },
    },
  },
  // Other optimization settings...
}
\`\`\`

Also, implement dynamic imports for route-level code splitting:

\`\`\`js
// Instead of
import MyComponent from './MyComponent';

// Use
const MyComponent = React.lazy(() => import('./MyComponent'));
\`\`\`
`
        );
        
        optimizations.push({
          type: 'code-splitting',
          description: 'Created code splitting optimization guide'
        });
      }
    } catch (error) {
      console.error('Error optimizing code splitting:', error.message);
    }
    
    // 3. Set up bundle analysis and size limits
    console.log('Setting up bundle analysis tools...');
    
    try {
      // Install size-limit if not already installed
      execSync('npm list size-limit || npm install --save-dev size-limit @size-limit/preset-app', { 
        stdio: 'inherit'
      });
      
      // Create size limit configuration if it doesn't exist
      const sizeLimitConfigPath = path.join(config.baseDir, '.size-limit.json');
      
      if (!fs.existsSync(sizeLimitConfigPath)) {
        const sizeLimitConfig = [
          {
            "path": "build/static/js/*.js",
            "limit": "240 kB"
          },
          {
            "path": "build/static/css/*.css",
            "limit": "50 kB"
          },
          {
            "path": "build/static/media/*",
            "limit": "1 MB"
          }
        ];
        
        fs.writeFileSync(sizeLimitConfigPath, JSON.stringify(sizeLimitConfig, null, 2));
        
        // Update package.json with size-limit script
        const packageJsonPath = path.join(config.baseDir, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          
          if (!packageJson.scripts || !packageJson.scripts['size']) {
            packageJson.scripts = packageJson.scripts || {};
            packageJson.scripts['size'] = 'size-limit';
            
            // Add size-limit configuration if using package.json
            if (!fs.existsSync(sizeLimitConfigPath)) {
              packageJson['size-limit'] = sizeLimitConfig;
            }
            
            // Write updated package.json
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          }
        }
        
        optimizations.push({
          type: 'bundle-analysis',
          description: 'Added size-limit configuration for bundle size monitoring'
        });
        
        console.log('Bundle analysis tools set up successfully');
      } else {
        console.log('Bundle analysis configuration already exists');
        optimizations.push({
          type: 'bundle-analysis',
          description: 'Bundle analysis configuration already exists'
        });
      }
    } catch (error) {
      console.error('Error setting up bundle analysis tools:', error.message);
    }
    
    // 4. Remove legacy polyfills using the specialized tool
    console.log('Running legacy polyfill removal tool...');
    
    try {
      // Check if the polyfill remover script exists
      const polyfillRemoverPath = path.join(__dirname, 'legacy-polyfill-remover.js');
      
      if (fs.existsSync(polyfillRemoverPath)) {
        console.log('Running legacy polyfill analysis and removal...');
        
        // Import the polyfill remover
        const { analyzeAndRemovePolyfills } = require('./legacy-polyfill-remover');
        
        // Run the tool
        analyzeAndRemovePolyfills({
          dryRun: false, // Actually apply changes
          outputDir: config.outputDir,
          projectDir: config.baseDir
        });
        
        optimizations.push({
          type: 'legacy-polyfills',
          description: 'Ran legacy polyfill removal tool'
        });
      } else {
        console.log('Legacy polyfill remover tool not found, falling back to basic check...');
        
        // Read package.json
        const packageJsonPath = path.join(config.baseDir, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          
          // List of common legacy polyfills that may not be needed
          const legacyPolyfills = [
            'core-js',
            'es6-promise',
            'whatwg-fetch',
            'promise-polyfill',
            'babel-polyfill',
            'classlist-polyfill',
            'custom-event-polyfill',
            'element-closest-polyfill',
            'url-polyfill'
          ];
          
          const dependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
          };
          
          const foundPolyfills = legacyPolyfills.filter(polyfill => dependencies[polyfill]);
          
          if (foundPolyfills.length > 0) {
            fs.writeFileSync(
              path.join(config.outputDir, 'legacy-polyfills.md'),
              `# Legacy Polyfills Detection

The following legacy polyfills were found in your dependencies:

${foundPolyfills.map(p => `- ${p}`).join('\n')}

Consider removing them or using a more modern approach like 'core-js@3' with specific targeted imports or '@babel/preset-env' with 'useBuiltIns: "usage"'.

Many modern browsers no longer need these polyfills, and they add unnecessary weight to your bundles.
`
            );
            
            optimizations.push({
              type: 'legacy-polyfills',
              description: `Identified ${foundPolyfills.length} legacy polyfills for potential removal`
            });
          } else {
            console.log('No legacy polyfills detected');
            optimizations.push({
              type: 'legacy-polyfills',
              description: 'No legacy polyfills detected'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error running legacy polyfill remover:', error.message);
    }
    
    // 5. Reduce duplicate code using specialized tool
    console.log('Running duplicate code reducer tool...');
    
    try {
      // Check if the duplicate code reducer script exists
      const duplicateReducerPath = path.join(__dirname, 'duplicate-code-reducer.js');
      
      if (fs.existsSync(duplicateReducerPath)) {
        console.log('Running duplicate code analysis and reduction...');
        
        // Import the duplicate code reducer
        const { analyzeAndReduceDuplicateCode } = require('./duplicate-code-reducer');
        
        // Run the tool
        analyzeAndReduceDuplicateCode({
          dryRun: false, // Actually apply changes
          outputDir: config.outputDir,
          projectDir: config.baseDir
        });
        
        optimizations.push({
          type: 'duplicate-code',
          description: 'Ran duplicate code reducer tool'
        });
      } else {
        console.log('Duplicate code reducer tool not found, skipping...');
      }
    } catch (error) {
      console.error('Error running duplicate code reducer:', error.message);
    }
    
    // 6. Set up dynamic imports for large modules
    console.log('Setting up dynamic imports for large modules...');
    
    try {
      // Create guide for implementing dynamic imports
      fs.writeFileSync(
        path.join(config.outputDir, 'dynamic-imports.md'),
        `# Dynamic Imports Implementation Guide

Implement dynamic imports for large modules and non-critical components:

## React Router Example:

\`\`\`jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Replace static imports with dynamic imports
// Instead of: import Home from './Home';
const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Dashboard = lazy(() => import('./Dashboard'));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
    </Suspense>
  </Router>
);
\`\`\`

## For Large Libraries:

\`\`\`jsx
// Instead of importing the entire library
// import { Chart, Line, Bar, Pie } from 'chart.js';

// Use dynamic imports when needed
const loadChartJs = async () => {
  const ChartModule = await import('chart.js');
  return ChartModule.default;
};

// Use in component
useEffect(() => {
  loadChartJs().then(Chart => {
    // Initialize chart
  });
}, []);
\`\`\`

## Finding Large Modules:

Run bundle analyzer to identify large modules:

\`\`\`bash
npx webpack-bundle-analyzer stats.json
\`\`\`

Look for modules > 50KB and consider implementing dynamic imports for them.
`
      );
      
      optimizations.push({
        type: 'dynamic-imports',
        description: 'Created guide for implementing dynamic imports'
      });
    } catch (error) {
      console.error('Error setting up dynamic imports guide:', error.message);
    }
    
    // Save optimization results
    const optimizationResultsFile = path.join(config.outputDir, `bundle-optimization-results-${config.timestamp}.json`);
    fs.writeFileSync(optimizationResultsFile, JSON.stringify(optimizations, null, 2));
    console.log(`Bundle optimization results saved to: ${optimizationResultsFile}`);
    
    return optimizations;
  } finally {
    // Restore original directory
    process.chdir(currentDir);
  }
}

/**
 * Verify the optimizations by running a build and collecting metrics
 * @param {Object} config Configuration options
 * @returns {Object} Verification results
 */
function verifyOptimizations(config) {
  console.log('\nVerifying optimizations...');
  
  // Save current directory
  const currentDir = process.cwd();
  
  try {
    // Change to project directory
    process.chdir(config.baseDir);
    
    // Verification results
    const results = {
      buildSuccess: false,
      duration: 0,
      errors: [],
      warnings: [],
      metrics: {}
    };
    
    // Record start time
    const startTime = new Date();
    
    // Run production build
    console.log('Running production build...');
    
    try {
      // Redirect output to file
      const buildOutputFile = path.join(config.outputDir, `build-verify-log-${config.timestamp}.txt`);
      execSync(`npm run build 2>&1 | tee ${buildOutputFile}`, { stdio: 'inherit' });
      
      // Record end time and calculate duration
      const endTime = new Date();
      results.duration = endTime - startTime;
      results.buildSuccess = true;
      
      console.log(`Build completed in ${(results.duration / 1000).toFixed(2)} seconds`);
      
      // Parse build output for any remaining warnings
      const buildOutput = fs.readFileSync(buildOutputFile, 'utf8');
      results.warnings = parseWarningsFromBuildOutput(buildOutput);
      
      // Collect bundle metrics
      console.log('Collecting bundle metrics...');
      
      // Generate stats.json if it doesn't exist
      if (!fs.existsSync('stats.json')) {
        try {
          execSync('npx webpack --profile --json > stats.json', { 
            stdio: 'inherit',
            env: { ...process.env, NODE_ENV: 'production' }
          });
        } catch (error) {
          console.error('Error generating stats.json:', error.message);
        }
      }
      
      // Extract metrics from stats.json
      if (fs.existsSync('stats.json')) {
        const stats = JSON.parse(fs.readFileSync('stats.json', 'utf8'));
        
        results.metrics = {
          totalSize: stats.assets.reduce((total, asset) => total + asset.size, 0),
          jsSize: stats.assets.filter(asset => asset.name.endsWith('.js'))
            .reduce((total, asset) => total + asset.size, 0),
          cssSize: stats.assets.filter(asset => asset.name.endsWith('.css'))
            .reduce((total, asset) => total + asset.size, 0),
          chunkCount: stats.assets.length,
          entryPoints: Object.keys(stats.entrypoints || {}).length
        };
        
        console.log('Bundle metrics collected successfully');
      }
      
      // Run size-limit if available
      if (fs.existsSync(path.join(config.baseDir, '.size-limit.json')) || 
          (fs.existsSync(path.join(config.baseDir, 'package.json')) && 
           JSON.parse(fs.readFileSync(path.join(config.baseDir, 'package.json'), 'utf8'))['size-limit'])) {
        try {
          console.log('Running size-limit...');
          const sizeLimitOutput = execSync('npx size-limit', { encoding: 'utf8' });
          
          // Save size-limit output
          fs.writeFileSync(
            path.join(config.outputDir, `size-limit-output-${config.timestamp}.txt`),
            sizeLimitOutput
          );
          
          console.log('Size limit check completed');
        } catch (error) {
          console.error('Error running size-limit:', error.message);
          if (error.stdout) {
            fs.writeFileSync(
              path.join(config.outputDir, `size-limit-output-${config.timestamp}.txt`),
              error.stdout
            );
          }
        }
      }
    } catch (error) {
      console.error('Error running production build:', error.message);
      results.buildSuccess = false;
      results.errors.push({
        type: 'build-error',
        message: error.message
      });
      
      // Still calculate duration
      const endTime = new Date();
      results.duration = endTime - startTime;
    }
    
    // Save verification results
    const verificationResultsFile = path.join(config.outputDir, `build-verification-report-${config.timestamp}.json`);
    fs.writeFileSync(verificationResultsFile, JSON.stringify(results, null, 2));
    console.log(`Verification results saved to: ${verificationResultsFile}`);
    
    return results;
  } finally {
    // Restore original directory
    process.chdir(currentDir);
  }
}

/**
 * Generate a summary report of the optimization process
 * @param {Object} results Verification results
 * @param {Object} config Configuration options
 */
function generateSummaryReport(results, config) {
  console.log('\nGenerating summary report...');
  
  // Create report file path
  const reportFile = path.join(config.outputDir, `build-verification-report-${config.timestamp}.md`);
  
  // Create report content
  let report = `# Build Optimization Summary Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Overall status
  report += `## Overall Status\n\n`;
  report += `- **Build Success**: ${results.buildSuccess ? '✅ Yes' : '❌ No'}\n`;
  report += `- **Build Duration**: ${(results.duration / 1000).toFixed(2)} seconds\n`;
  
  if (results.errors.length > 0) {
    report += `- **Remaining Errors**: ${results.errors.length}\n`;
  }
  
  if (results.warnings.length > 0) {
    report += `- **Remaining Warnings**: ${results.warnings.length}\n`;
  }
  
  // Bundle metrics
  if (results.metrics && Object.keys(results.metrics).length > 0) {
    report += `\n## Bundle Metrics\n\n`;
    report += `- **Total Bundle Size**: ${formatBytes(results.metrics.totalSize)}\n`;
    report += `- **JavaScript Size**: ${formatBytes(results.metrics.jsSize)}\n`;
    report += `- **CSS Size**: ${formatBytes(results.metrics.cssSize)}\n`;
    report += `- **Chunk Count**: ${results.metrics.chunkCount}\n`;
    report += `- **Entry Points**: ${results.metrics.entryPoints}\n`;
  }
  
  // Errors section
  if (results.errors.length > 0) {
    report += `\n## Remaining Errors\n\n`;
    results.errors.forEach((error, index) => {
      report += `### Error ${index + 1}\n\n`;
      report += `- **Type**: ${error.type}\n`;
      if (error.file) {
        report += `- **File**: ${error.file}\n`;
      }
      report += `- **Message**: ${error.message}\n\n`;
    });
  }
  
  // Warnings section
  if (results.warnings.length > 0) {
    report += `\n## Remaining Warnings\n\n`;
    report += `The following warnings still exist in the build. These may not affect functionality but should be addressed in future iterations:\n\n`;
    
    results.warnings.forEach((warning, index) => {
      report += `### Warning ${index + 1}\n\n`;
      report += `- **Type**: ${warning.type}\n`;
      if (warning.file) {
        report += `- **File**: ${warning.file}\n`;
      }
      report += `- **Message**: ${warning.message.substring(0, 500)}${warning.message.length > 500 ? '...' : ''}\n\n`;
    });
  }
  
  // Next steps section
  report += `\n## Next Steps\n\n`;
  
  if (!results.buildSuccess) {
    report += `### Critical Items\n\n`;
    report += `1. Address remaining build errors preventing successful build\n`;
    report += `2. Run \`project-tools.js phase10 --fix-errors\` to attempt automatic fixes\n`;
    report += `3. Check the build-verify-log for detailed error information\n\n`;
  }
  
  if (results.warnings.length > 0) {
    report += `### Recommended Improvements\n\n`;
    report += `1. Address remaining build warnings\n`;
    report += `2. Run \`project-tools.js phase10 --fix-errors\` to fix warnings automatically\n`;
    report += `3. Prioritize fixing deprecation warnings to prevent future errors\n\n`;
  }
  
  if (results.buildSuccess) {
    report += `### Optimization Opportunities\n\n`;
    report += `1. Continue improving bundle size through code splitting and tree shaking\n`;
    report += `2. Implement dynamic imports for non-critical components\n`;
    report += `3. Set up performance monitoring to track build metrics over time\n`;
    report += `4. Run \`project-tools.js phase10 --minimize\` to further reduce bundle sizes\n\n`;
  }
  
  report += `### Maintenance Recommendations\n\n`;
  report += `1. Regularly run \`npm audit\` to check for security vulnerabilities\n`;
  report += `2. Use \`npx depcheck\` to identify and remove unused dependencies\n`;
  report += `3. Run bundle analyzer before adding new dependencies\n`;
  report += `4. Set up automated build monitoring in CI/CD pipeline\n\n`;
  
  // Save report to file
  fs.writeFileSync(reportFile, report);
  console.log(`Summary report saved to: ${reportFile}`);
}

/**
 * Find webpack configuration file in project directory
 * @param {string} baseDir Base directory to search
 * @returns {string|null} Path to webpack config, or null if not found
 */
function findWebpackConfig(baseDir) {
  const webpackConfigPatterns = [
    'webpack.config.js',
    'webpack.config.cjs',
    'webpack.config.mjs',
    'webpack.prod.js',
    'webpack.production.js',
    'config/webpack.config.js',
    'config/webpack.prod.js',
    'config/webpack/prod.js'
  ];
  
  for (const pattern of webpackConfigPatterns) {
    const configPath = path.join(baseDir, pattern);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }
  
  // Check for webpack config in nested directories
  const configDir = path.join(baseDir, 'config');
  if (fs.existsSync(configDir) && fs.statSync(configDir).isDirectory()) {
    const configFiles = fs.readdirSync(configDir);
    for (const file of configFiles) {
      if (file.includes('webpack') && (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs'))) {
        return path.join(configDir, file);
      }
    }
  }
  
  return null;
}

/**
 * Find file in directory matching a pattern
 * @param {string} baseDir Base directory to search
 * @param {RegExp} pattern Regular expression pattern to match
 * @returns {string|null} Path to file, or null if not found
 */
function findFileInDir(baseDir, pattern) {
  const files = fs.readdirSync(baseDir);
  
  for (const file of files) {
    if (pattern.test(file)) {
      return path.join(baseDir, file);
    }
  }
  
  return null;
}

/**
 * Format bytes to a human-readable string
 * @param {number} bytes Number of bytes
 * @param {number} decimals Number of decimal places
 * @returns {string} Formatted string
 */
function formatBytes(bytes, decimals = 2) {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = {
  runPhase10Automator
};