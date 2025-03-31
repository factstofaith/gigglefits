#!/usr/bin/env node

/**
 * Build Verification Tool
 * 
 * Verifies that the project builds successfully across all formats.
 * Collects build metrics and provides a detailed verification report.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Verify a specific build configuration
 * 
 * @param {string} baseDir - Base project directory
 * @param {string} buildType - Build type (standard, cjs, esm)
 * @param {Object} options - Additional options
 * @returns {Object} Build results
 */
function verifyBuildTarget(baseDir, buildType, options = {}) {
  console.log(`Verifying ${buildType} build...`);
  
  const results = {
    buildType,
    success: false,
    startTime: Date.now(),
    endTime: null,
    duration: null,
    output: '',
    error: null,
    fileCount: 0,
    totalSize: 0,
    artifacts: [],
    metrics: {}
  };
  
  let buildCommand;
  
  switch (buildType) {
    case 'standard':
      buildCommand = 'npm run build';
      break;
    case 'cjs':
      buildCommand = 'npm run build:cjs';
      break;
    case 'esm':
      buildCommand = 'npm run build:esm';
      break;
    case 'all':
      buildCommand = 'npm run build:all';
      break;
    default:
      buildCommand = 'npm run build';
  }
  
  try {
    // Run build command
    const output = execSync(`cd ${baseDir} && ${buildCommand}`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    results.success = true;
    results.output = output;
    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    
    // Collect build artifacts info
    const outputDir = buildType === 'standard' ? 'build' : `dist/${buildType === 'all' ? '' : buildType}`;
    const outputPath = path.resolve(baseDir, outputDir);
    
    if (fs.existsSync(outputPath)) {
      // Get stats about the build artifacts
      results.artifacts = collectBuildArtifacts(outputPath);
      results.fileCount = results.artifacts.length;
      results.totalSize = results.artifacts.reduce((acc, file) => acc + file.size, 0);
    }
    
    // Collect additional metrics
    if (options.collectMetrics) {
      results.metrics = collectBuildMetrics(baseDir, buildType);
    }
  } catch (error) {
    results.success = false;
    results.error = error.message;
    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
  }
  
  return results;
}

/**
 * Collect information about build artifacts
 * 
 * @param {string} outputDir - Output directory
 * @returns {Array} Array of artifact objects
 */
function collectBuildArtifacts(outputDir) {
  const artifacts = [];
  
  function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        traverseDirectory(filePath);
      } else {
        artifacts.push({
          path: filePath,
          name: file,
          size: stats.size,
          extension: path.extname(file),
          created: stats.birthtime,
          modified: stats.mtime
        });
      }
    });
  }
  
  if (fs.existsSync(outputDir)) {
    traverseDirectory(outputDir);
  }
  
  return artifacts;
}

/**
 * Collect build metrics
 * 
 * @param {string} baseDir - Base project directory
 * @param {string} buildType - Build type
 * @returns {Object} Build metrics
 */
function collectBuildMetrics(baseDir, buildType) {
  const metrics = {
    bundleSize: 0,
    chunkCount: 0,
    jsSize: 0,
    cssSize: 0,
    compressedSize: 0
  };
  
  // Implementation varies based on build type
  const outputDir = buildType === 'standard' ? 'build' : `dist/${buildType === 'all' ? '' : buildType}`;
  const outputPath = path.resolve(baseDir, outputDir);
  
  if (fs.existsSync(outputPath)) {
    // Count JS and CSS files
    const files = collectBuildArtifacts(outputPath);
    
    const jsFiles = files.filter(f => f.extension === '.js');
    const cssFiles = files.filter(f => f.extension === '.css');
    const gzipFiles = files.filter(f => f.extension === '.gz');
    
    metrics.jsSize = jsFiles.reduce((acc, file) => acc + file.size, 0);
    metrics.cssSize = cssFiles.reduce((acc, file) => acc + file.size, 0);
    metrics.compressedSize = gzipFiles.reduce((acc, file) => acc + file.size, 0);
    metrics.chunkCount = jsFiles.length;
    metrics.bundleSize = files.reduce((acc, file) => acc + file.size, 0);
  }
  
  return metrics;
}

/**
 * Verify build for all build targets
 * 
 * @param {string} baseDir - Base project directory
 * @param {Object} options - Additional options
 * @returns {Object} Build verification results
 */
function verifyBuild(baseDir, options = {}) {
  console.log('Starting build verification...');
  
  const startTime = Date.now();
  const buildTypes = options.buildTypes || ['standard'];
  const results = {
    success: true,
    startTime,
    endTime: null,
    duration: null,
    builds: {}
  };
  
  // Verify package.json
  try {
    ensureValidPackageJson(baseDir);
  } catch (error) {
    console.error('Package.json validation failed:', error.message);
    return {
      success: false,
      error: `Package.json validation failed: ${error.message}`
    };
  }
  
  // Run builds for each target
  for (const buildType of buildTypes) {
    const buildResult = verifyBuildTarget(baseDir, buildType, options);
    results.builds[buildType] = buildResult;
    
    // If any build fails, the overall result is a failure
    if (!buildResult.success) {
      results.success = false;
    }
  }
  
  // Calculate overall stats
  results.endTime = Date.now();
  results.duration = results.endTime - startTime;
  
  return results;
}

/**
 * Ensure package.json is valid and has required build scripts
 * 
 * @param {string} baseDir - Base project directory
 */
function ensureValidPackageJson(baseDir) {
  const packageJsonPath = path.resolve(baseDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found');
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check for required fields
  if (!packageJson.name) {
    throw new Error('package.json missing required field: name');
  }
  
  if (!packageJson.version) {
    throw new Error('package.json missing required field: version');
  }
  
  // Check for build scripts
  if (!packageJson.scripts || !packageJson.scripts.build) {
    throw new Error('package.json missing required script: build');
  }
}

/**
 * Generate a build verification report
 * 
 * @param {Object} results - Build verification results
 * @param {string} baseDir - Base project directory
 * @returns {string} Report file path
 */
function generateBuildVerificationReport(results, baseDir) {
  const reportDir = path.resolve(baseDir, 'build-verification');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const reportPath = path.resolve(reportDir, `build-verification-report-${timestamp}.md`);
  
  let report = `# Build Verification Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Overall status
  const overallStatus = results.success ? '✅ PASSED' : '❌ FAILED';
  report += `## Overall Status: ${overallStatus}\n\n`;
  report += `Total Duration: ${(results.duration / 1000).toFixed(2)}s\n\n`;
  
  // Build summaries
  report += `## Build Summaries\n\n`;
  
  Object.entries(results.builds).forEach(([buildType, buildResult]) => {
    const status = buildResult.success ? '✅ PASSED' : '❌ FAILED';
    report += `### ${buildType} Build: ${status}\n\n`;
    report += `- Duration: ${(buildResult.duration / 1000).toFixed(2)}s\n`;
    
    if (buildResult.fileCount) {
      report += `- File Count: ${buildResult.fileCount}\n`;
      report += `- Total Size: ${formatBytes(buildResult.totalSize)}\n`;
    }
    
    if (buildResult.metrics && Object.keys(buildResult.metrics).length > 0) {
      report += `\n**Metrics:**\n`;
      report += `- JS Size: ${formatBytes(buildResult.metrics.jsSize)}\n`;
      report += `- CSS Size: ${formatBytes(buildResult.metrics.cssSize)}\n`;
      report += `- Chunk Count: ${buildResult.metrics.chunkCount}\n`;
      
      if (buildResult.metrics.compressedSize) {
        report += `- Compressed Size: ${formatBytes(buildResult.metrics.compressedSize)}\n`;
        
        // Compression ratio
        if (buildResult.metrics.bundleSize > 0) {
          const ratio = 1 - (buildResult.metrics.compressedSize / buildResult.metrics.bundleSize);
          report += `- Compression Ratio: ${(ratio * 100).toFixed(2)}%\n`;
        }
      }
    }
    
    if (!buildResult.success && buildResult.error) {
      report += `\n**Error:**\n\`\`\`\n${buildResult.error}\n\`\`\`\n\n`;
    }
    
    report += '\n';
  });
  
  // Detailed artifacts (only for successful builds)
  if (results.success) {
    report += `## Build Artifacts\n\n`;
    
    Object.entries(results.builds).forEach(([buildType, buildResult]) => {
      if (buildResult.success && buildResult.artifacts.length > 0) {
        report += `### ${buildType} Build Artifacts\n\n`;
        
        // Group artifacts by extension
        const groupedArtifacts = {};
        buildResult.artifacts.forEach(artifact => {
          const ext = artifact.extension || 'unknown';
          groupedArtifacts[ext] = groupedArtifacts[ext] || [];
          groupedArtifacts[ext].push(artifact);
        });
        
        // Sort extensions by total size
        const sortedExtensions = Object.keys(groupedArtifacts).sort((a, b) => {
          const aSize = groupedArtifacts[a].reduce((acc, file) => acc + file.size, 0);
          const bSize = groupedArtifacts[b].reduce((acc, file) => acc + file.size, 0);
          return bSize - aSize;
        });
        
        // Report on each extension
        sortedExtensions.forEach(ext => {
          const files = groupedArtifacts[ext];
          const totalSize = files.reduce((acc, file) => acc + file.size, 0);
          report += `- **${ext}**: ${files.length} files, ${formatBytes(totalSize)}\n`;
        });
        
        report += '\n';
      }
    });
  }
  
  // Next steps
  report += `## Next Steps\n\n`;
  
  if (!results.success) {
    report += `- Fix the build issues reported above\n`;
    report += `- Run the build verification again\n`;
  } else {
    report += `- All builds completed successfully\n`;
    report += `- Consider running performance tests on the build artifacts\n`;
    report += `- Proceed to the next phase of development\n`;
  }
  
  // Write report to file
  fs.writeFileSync(reportPath, report);
  console.log(`\nBuild verification report generated: ${reportPath}`);
  
  // Also save JSON version of results for programmatic use
  const jsonPath = reportPath.replace('.md', '.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  
  return reportPath;
}

/**
 * Format bytes into a human-readable string
 * 
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Run the build verification tool
 * 
 * @param {Object} options - Tool options
 */
function runBuildVerification(options = {}) {
  // Get base directory
  const baseDir = options.baseDir || path.resolve(__dirname, '..');
  
  // Define build types to verify
  const buildTypes = options.buildTypes || ['standard'];
  
  // Verify build
  const results = verifyBuild(baseDir, {
    buildTypes,
    collectMetrics: options.collectMetrics !== false
  });
  
  // Generate verification report
  const reportPath = generateBuildVerificationReport(results, baseDir);
  
  // Print completion message
  console.log('\n---------------------------------------------------------');
  const status = results.success ? '✅ PASSED' : '❌ FAILED';
  console.log(`🏗️  Build Verification: ${status}`);
  console.log('---------------------------------------------------------');
  
  if (results.success) {
    console.log('All builds completed successfully!');
  } else {
    console.log('Some builds failed. Check the report for details.');
  }
  
  console.log(`Verification Report: ${reportPath}`);
  console.log(`Duration: ${(results.duration / 1000).toFixed(2)}s`);
  
  return {
    success: results.success,
    reportPath
  };
}

// Parse command line arguments
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const options = {
    buildTypes: ['standard'],
    collectMetrics: true,
    baseDir: path.resolve(__dirname, '..')
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--types' || args[i] === '-t') {
      if (args[i + 1]) {
        options.buildTypes = args[i + 1].split(',');
        i++;
      }
    } else if (args[i] === '--all' || args[i] === '-a') {
      options.buildTypes = ['standard', 'cjs', 'esm'];
    } else if (args[i] === '--no-metrics' || args[i] === '-n') {
      options.collectMetrics = false;
    } else if (args[i] === '--dir' || args[i] === '-d') {
      if (args[i + 1]) {
        options.baseDir = path.resolve(process.cwd(), args[i + 1]);
        i++;
      }
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Build Verification Tool

Verifies that the project builds successfully across all formats.
Collects build metrics and provides a detailed verification report.

Usage:
  node verify-build.js [options]

Options:
  --types, -t <types>   Build types to verify, comma-separated (standard,cjs,esm)
  --all, -a             Verify all build types
  --no-metrics, -n      Do not collect additional metrics
  --dir, -d <dir>       Base directory to verify
  --help, -h            Show this help message
      `);
      process.exit(0);
    }
  }
  
  return options;
}

// If run directly
if (require.main === module) {
  const options = parseCommandLineArgs();
  runBuildVerification(options);
}

module.exports = {
  verifyBuild,
  verifyBuildTarget,
  collectBuildArtifacts,
  collectBuildMetrics,
  generateBuildVerificationReport,
  runBuildVerification
};