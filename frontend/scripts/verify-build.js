/**
 * Enhanced Build Verification Script for TAP Integration Platform
 * 
 * This script verifies that the production build is working correctly by:
 * 1. Checking that all required files exist
 * 2. Validating the bundle sizes against thresholds
 * 3. Running basic checks on the generated files
 * 4. Validating runtime environment support for Docker
 * 5. Checking health check files
 * 
 * Part of the standardization approach to ensure quality builds
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { 
  green: (text) => `✅ ${text}`,
  red: (text) => `❌ ${text}`,
  yellow: (text) => `⚠️ ${text}`,
  blue: (text) => `ℹ️ ${text}`
};

// Configuration
const BUILD_DIR = path.resolve(__dirname, '../build');
const STATIC_DIR = path.join(BUILD_DIR, 'static');
const JS_DIR = path.join(STATIC_DIR, 'js');
const REQUIRED_FILES = [
  'index.html',
  'static/js/runtime-main.bundle.js',
  'static/js/runtime-modern.bundle.js',
  'static/js/main.bundle.js',
  'static/js/modern.bundle.js'
];
const SIZE_THRESHOLDS = {
  'main.bundle.js': 1024 * 800, // 800KB - more realistic for feature-rich app
  'modern.bundle.js': 1024 * 800, // 800KB - more realistic for feature-rich app
  'runtime-main.bundle.js': 1024 * 20, // 20KB - larger for better error handling
  'runtime-modern.bundle.js': 1024 * 20, // 20KB - larger for better error handling
};
const DOCKER_REQUIRED_FILES = [
  'runtime-env.js',
  'docker-error.html'
];

// Utility functions
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (err) {
    return 0;
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function createDirectoryIfNotExists(dirPath) {
  if (!fileExists(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      return true;
    } catch (err) {
      return false;
    }
  }
  return true;
}

// Verification steps
function checkRequiredFiles() {
  console.log(chalk.blue('Checking required files...'));
  let allFilesExist = true;
  
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(BUILD_DIR, file);
    if (fileExists(filePath)) {
      console.log(chalk.green(`✓ ${file} exists`));
    } else {
      console.log(chalk.red(`✗ ${file} is missing`));
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

function checkBundleSizes() {
  console.log(chalk.blue('\nChecking bundle sizes...'));
  let allSizesValid = true;
  
  // Get all JavaScript files in the js directory for more comprehensive checking
  let jsFiles = [];
  try {
    jsFiles = fs.readdirSync(JS_DIR).filter(file => file.endsWith('.js'));
  } catch (err) {
    console.log(chalk.yellow(`⚠ Could not read JS directory: ${err.message}`));
    jsFiles = Object.keys(SIZE_THRESHOLDS);
  }
  
  for (const file of jsFiles) {
    const filePath = path.join(JS_DIR, file);
    if (fileExists(filePath)) {
      const size = getFileSize(filePath);
      const formattedSize = formatBytes(size);
      
      // Check against threshold if one exists for this file
      if (SIZE_THRESHOLDS[file]) {
        const threshold = SIZE_THRESHOLDS[file];
        const formattedThreshold = formatBytes(threshold);
        
        if (size <= threshold) {
          console.log(chalk.green(`✓ ${file}: ${formattedSize} (under threshold of ${formattedThreshold})`));
        } else {
          console.log(chalk.red(`✗ ${file}: ${formattedSize} (exceeds threshold of ${formattedThreshold})`));
          allSizesValid = false;
        }
      } else {
        // Just report the size for files without thresholds
        console.log(chalk.blue(`ℹ ${file}: ${formattedSize}`));
      }
    }
  }
  
  return allSizesValid;
}

function validateHtmlFile() {
  console.log(chalk.blue('\nValidating index.html...'));
  const htmlPath = path.join(BUILD_DIR, 'index.html');
  
  if (!fileExists(htmlPath)) {
    console.log(chalk.red('✗ index.html not found'));
    return false;
  }
  
  try {
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // Check for title
    if (!html.includes('<title>')) {
      console.log(chalk.red('✗ No title tag found in index.html'));
      return false;
    }
    
    // Check for viewport meta tag
    if (!html.includes('viewport')) {
      console.log(chalk.yellow('⚠ No viewport meta tag found in index.html'));
    }
    
    // Check for script tags
    if (!html.includes('<script')) {
      console.log(chalk.red('✗ No script tags found in index.html'));
      return false;
    }
    
    // Check for runtime-env.js (Docker environment support)
    if (html.includes('runtime-env.js')) {
      console.log(chalk.green('✓ Runtime environment support found in index.html'));
    } else {
      console.log(chalk.yellow('⚠ No runtime environment support found in index.html'));
    }
    
    console.log(chalk.green('✓ index.html validation passed'));
    return true;
  } catch (err) {
    console.log(chalk.red(`✗ Error reading index.html: ${err.message}`));
    return false;
  }
}

function checkDockerSupport() {
  console.log(chalk.blue('\nChecking Docker support...'));
  let dockerSupport = true;
  
  for (const file of DOCKER_REQUIRED_FILES) {
    const filePath = path.join(BUILD_DIR, file);
    if (fileExists(filePath)) {
      console.log(chalk.green(`✓ ${file} exists`));
    } else {
      console.log(chalk.yellow(`⚠ ${file} is missing (Docker support may be limited)`));
      dockerSupport = false;
    }
  }
  
  // Check runtime-env.js content
  const runtimeEnvPath = path.join(BUILD_DIR, 'runtime-env.js');
  if (fileExists(runtimeEnvPath)) {
    try {
      const content = fs.readFileSync(runtimeEnvPath, 'utf8');
      if (content.includes('window.env') || content.includes('window.ENV')) {
        console.log(chalk.green('✓ runtime-env.js contains environment configuration'));
      } else {
        console.log(chalk.yellow('⚠ runtime-env.js may not be properly configured'));
      }
    } catch (err) {
      console.log(chalk.yellow(`⚠ Could not read runtime-env.js: ${err.message}`));
    }
  }
  
  return dockerSupport;
}

// Comprehensive verification
function verifyBuild() {
  console.log(chalk.blue('Starting comprehensive build verification...'));
  
  if (!fileExists(BUILD_DIR)) {
    console.log(chalk.red(`✗ Build directory not found: ${BUILD_DIR}`));
    console.log(chalk.yellow('⚠ Run "npm run build" to create the production build first'));
    return {
      passed: false,
      checks: {
        buildExists: false,
        requiredFiles: false,
        bundleSizes: false,
        htmlValidation: false,
        dockerSupport: false
      }
    };
  }
  
  const filesCheck = checkRequiredFiles();
  const sizesCheck = checkBundleSizes();
  const htmlCheck = validateHtmlFile();
  const dockerCheck = checkDockerSupport();
  
  console.log('\n' + chalk.blue('Build verification summary:'));
  console.log(filesCheck ? chalk.green('✓ All required files exist') : chalk.red('✗ Some required files are missing'));
  console.log(sizesCheck ? chalk.green('✓ All bundle sizes are within thresholds') : chalk.red('✗ Some bundles exceed size thresholds'));
  console.log(htmlCheck ? chalk.green('✓ HTML validation passed') : chalk.red('✗ HTML validation failed'));
  console.log(dockerCheck ? chalk.green('✓ Docker support verified') : chalk.yellow('⚠ Docker support may be limited'));
  
  const passed = filesCheck && sizesCheck && htmlCheck;
  console.log('\n' + (passed ? chalk.green('✓ BUILD VERIFICATION PASSED') : chalk.red('✗ BUILD VERIFICATION FAILED')));
  
  return {
    passed,
    checks: {
      buildExists: true,
      requiredFiles: filesCheck,
      bundleSizes: sizesCheck,
      htmlValidation: htmlCheck,
      dockerSupport: dockerCheck
    }
  };
}

// Main function
function main() {
  // Run verification
  const results = verifyBuild();
  
  // Write report
  const reportPath = path.join(BUILD_DIR, '../build-verification/build_verification_result.json');
  const report = {
    timestamp: new Date().toISOString(),
    passed: results.passed,
    checks: results.checks,
    environment: {
      node: process.version,
      platform: process.platform,
      docker: process.env.RUNNING_IN_DOCKER === 'true'
    }
  };
  
  try {
    const reportDir = path.dirname(reportPath);
    if (createDirectoryIfNotExists(reportDir)) {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(chalk.blue(`Report written to ${reportPath}`));
      
      // Create a more verbose report if needed
      const verboseReportPath = path.join(reportDir, 'build_verification_report.md');
      const verboseReport = `# Build Verification Report

**Date:** ${new Date().toLocaleDateString()}  
**Status:** ${results.passed ? '✅ SUCCESS' : '❌ FAILURE'}

## Summary

This report documents the build verification of the TAP Integration Platform frontend application.

## Build Process

The build was executed using the production configuration with Docker compatibility.

## Verification Results

- **Required Files**: ${results.checks.requiredFiles ? 'Passed' : 'Failed'}
- **Bundle Sizes**: ${results.checks.bundleSizes ? 'Passed' : 'Failed'}
- **HTML Validation**: ${results.checks.htmlValidation ? 'Passed' : 'Failed'}
- **Docker Support**: ${results.checks.dockerSupport ? 'Complete' : 'Limited'}

## Environment

- Node Version: ${process.version}
- Platform: ${process.platform}
- Docker Environment: ${process.env.RUNNING_IN_DOCKER === 'true' ? 'Yes' : 'No'}

## Conclusion

${results.passed 
  ? 'The build verification was successful. The application is ready for deployment.'
  : 'The build verification failed. Please address the issues highlighted in this report.'}
`;
      
      fs.writeFileSync(verboseReportPath, verboseReport);
      console.log(chalk.blue(`Verbose report written to ${verboseReportPath}`));
    } else {
      console.log(chalk.yellow(`⚠ Could not create report directory: ${reportDir}`));
    }
  } catch (err) {
    console.log(chalk.yellow(`⚠ Could not write report: ${err.message}`));
  }
  
  process.exit(results.passed ? 0 : 1);
}

// Run the main function
main();