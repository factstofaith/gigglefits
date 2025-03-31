/**
 * Build Verification Script
 * 
 * This script verifies that the production build is working correctly by:
 * 1. Checking that all required files exist
 * 2. Validating the bundle sizes against thresholds
 * 3. Running basic checks on the generated files
 * 
 * Part of the zero technical debt approach to ensure quality builds
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
  'main.bundle.js': 1024 * 200, // 200KB
  'modern.bundle.js': 1024 * 200, // 200KB
  'runtime-main.bundle.js': 1024 * 10, // 10KB
  'runtime-modern.bundle.js': 1024 * 10, // 10KB
};

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
  
  for (const [file, threshold] of Object.entries(SIZE_THRESHOLDS)) {
    const filePath = path.join(JS_DIR, file);
    if (fileExists(filePath)) {
      const size = getFileSize(filePath);
      const formattedSize = formatBytes(size);
      const formattedThreshold = formatBytes(threshold);
      
      if (size <= threshold) {
        console.log(chalk.green(`✓ ${file}: ${formattedSize} (under threshold of ${formattedThreshold})`));
      } else {
        console.log(chalk.red(`✗ ${file}: ${formattedSize} (exceeds threshold of ${formattedThreshold})`));
        allSizesValid = false;
      }
    } else {
      console.log(chalk.yellow(`⚠ ${file} not found, skipping size check`));
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
    
    console.log(chalk.green('✓ index.html validation passed'));
    return true;
  } catch (err) {
    console.log(chalk.red(`✗ Error reading index.html: ${err.message}`));
    return false;
  }
}

// Main function
function main() {
  console.log(chalk.blue('Starting build verification...'));
  
  if (!fileExists(BUILD_DIR)) {
    console.log(chalk.red(`✗ Build directory not found: ${BUILD_DIR}`));
    console.log(chalk.yellow('⚠ Run "npm run build" to create the production build first'));
    process.exit(1);
  }
  
  const filesCheck = checkRequiredFiles();
  const sizesCheck = checkBundleSizes();
  const htmlCheck = validateHtmlFile();
  
  console.log('\n' + chalk.blue('Build verification summary:'));
  console.log(filesCheck ? chalk.green('✓ All required files exist') : chalk.red('✗ Some required files are missing'));
  console.log(sizesCheck ? chalk.green('✓ All bundle sizes are within thresholds') : chalk.red('✗ Some bundles exceed size thresholds'));
  console.log(htmlCheck ? chalk.green('✓ HTML validation passed') : chalk.red('✗ HTML validation failed'));
  
  const passed = filesCheck && sizesCheck && htmlCheck;
  console.log('\n' + (passed ? chalk.green('✓ BUILD VERIFICATION PASSED') : chalk.red('✗ BUILD VERIFICATION FAILED')));
  
  // Write report
  const reportPath = path.join(BUILD_DIR, '../build-verification/build_verification_result.json');
  const report = {
    timestamp: new Date().toISOString(),
    passed,
    checks: {
      requiredFiles: filesCheck,
      bundleSizes: sizesCheck,
      htmlValidation: htmlCheck
    }
  };
  
  try {
    const reportDir = path.dirname(reportPath);
    if (!fileExists(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.blue(`Report written to ${reportPath}`));
  } catch (err) {
    console.log(chalk.yellow(`⚠ Could not write report: ${err.message}`));
  }
  
  process.exit(passed ? 0 : 1);
}

// Run the main function
main();
