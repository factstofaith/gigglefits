#!/usr/bin/env node
/**
 * NPM Package Artifact Verification Script
 *
 * This script verifies the NPM package artifacts for structure, format compatibility,
 * and exports to ensure the package is correctly built and will work across environments.
 *
 * Usage:
 *   node scripts/verify-artifacts.js [--package-dir path/to/package] [--report-only]
 */

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Default settings
let packageDir = path.resolve('./build');
let reportOnly = false;
let verbose = false;

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  
  if (arg === '--package-dir' && i + 1 < process.argv.length) {
    packageDir = path.resolve(process.argv[++i]);
  } else if (arg === '--report-only') {
    reportOnly = true;
  } else if (arg === '--verbose') {
    verbose = true;
  } else if (arg === '--help') {
    console.log(`
NPM Package Artifact Verification Script

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --package-dir <path>    Path to package directory (default: ./build)
  --report-only           Just report issues without failing
  --verbose               Show detailed information
  --help                  Show this help message
`);
    process.exit(0);
  }
}

// Configuration
const requiredFiles = [
  'index.js',
  'index.d.ts',
  'package.json'
];

const requiredExports = [
  'default',
  'Button',
  'Card',
  'TextField',
  'Modal'
];

const moduleSystems = [
  'commonjs',
  'module',
  'types'
];

// Main validation function
async function validatePackage() {
  console.log(chalk.blue('🔍 Verifying NPM package artifacts...'));
  
  const issues = [];
  let passedChecks = 0;
  const totalChecks = 4; // Update this when adding new validation sections
  
  try {
    // Check if package directory exists
    if (!fs.existsSync(packageDir)) {
      console.error(chalk.red(`❌ Package directory not found at ${packageDir}`));
      console.error('Build the package first with: npm run build');
      process.exit(1);
    }
    
    // 1. Check required files
    console.log(chalk.blue('\n📂 Checking required files...'));
    const missingFiles = [];
    
    for (const file of requiredFiles) {
      const filePath = path.join(packageDir, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
        issues.push(`Missing required file: ${file}`);
      }
    }
    
    if (missingFiles.length === 0) {
      console.log(chalk.green(`✅ All required files present (${requiredFiles.length} files)`));
      passedChecks++;
    } else {
      console.log(chalk.red(`❌ Missing ${missingFiles.length} required files: ${missingFiles.join(', ')}`));
    }
    
    // 2. Verify package.json structure
    console.log(chalk.blue('\n📄 Verifying package.json structure...'));
    const packageJsonIssues = [];
    
    try {
      const packageJsonPath = path.join(packageDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check for required package.json fields
      if (!packageJson.name) {
        packageJsonIssues.push('Missing "name" field');
      }
      
      if (!packageJson.version) {
        packageJsonIssues.push('Missing "version" field');
      }
      
      // Check for module system entries
      let missingModuleSystems = [];
      
      for (const system of moduleSystems) {
        if (!packageJson[system]) {
          missingModuleSystems.push(system);
        }
      }
      
      if (missingModuleSystems.length > 0) {
        packageJsonIssues.push(`Missing module system entries: ${missingModuleSystems.join(', ')}`);
      }
      
      // Check peer dependencies
      if (!packageJson.peerDependencies || Object.keys(packageJson.peerDependencies).length === 0) {
        packageJsonIssues.push('Missing or empty peerDependencies');
      } else {
        if (!packageJson.peerDependencies.react) {
          packageJsonIssues.push('React not listed in peerDependencies');
        }
      }
      
      if (packageJsonIssues.length === 0) {
        console.log(chalk.green('✅ package.json structure is valid'));
        passedChecks++;
      } else {
        console.log(chalk.red(`❌ package.json has ${packageJsonIssues.length} issues:`));
        packageJsonIssues.forEach(issue => console.log(`  - ${issue}`));
        issues.push(...packageJsonIssues);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error reading or parsing package.json:'));
      console.error(error.message);
      issues.push('Failed to parse package.json');
    }
    
    // 3. Check exports
    console.log(chalk.blue('\n📦 Checking module exports...'));
    
    try {
      // Simple static analysis of index.js to check exports
      const indexPath = path.join(packageDir, 'index.js');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        const missingExports = [];
        
        for (const exportName of requiredExports) {
          // Simple regex to check exports - not foolproof but helps for quick validation
          const regex = new RegExp(`(?:export\\s+(?:const|function|class)\\s+${exportName}|export\\s+{[^}]*\\b${exportName}\\b[^}]*})`);
          if (!regex.test(content)) {
            missingExports.push(exportName);
          }
        }
        
        if (missingExports.length === 0) {
          console.log(chalk.green(`✅ All required exports present (${requiredExports.length} exports)`));
          passedChecks++;
        } else {
          console.log(chalk.red(`❌ Missing ${missingExports.length} required exports: ${missingExports.join(', ')}`));
          issues.push(`Missing exports: ${missingExports.join(', ')}`);
        }
      } else {
        console.log(chalk.red('❌ index.js not found, skipping exports check'));
        issues.push('Missing index.js file');
      }
    } catch (error) {
      console.error(chalk.red('❌ Error checking exports:'));
      console.error(error.message);
      issues.push('Failed to check exports');
    }
    
    // 4. Check bundle size and tree shaking
    console.log(chalk.blue('\n📊 Checking bundle size and tree shaking...'));
    
    try {
      // Get JS file sizes
      const jsFiles = getAllFiles(packageDir).filter(file => file.endsWith('.js'));
      
      if (jsFiles.length > 0) {
        const totalSize = jsFiles.reduce((acc, file) => {
          return acc + fs.statSync(file).size;
        }, 0);
        
        const sizeMB = totalSize / (1024 * 1024);
        const sizeFormatted = sizeMB.toFixed(2);
        
        // Arbitrary size threshold for demonstration
        const maxSizeMB = 1.0;
        
        if (sizeMB < maxSizeMB) {
          console.log(chalk.green(`✅ Bundle size is ${sizeFormatted} MB (below threshold of ${maxSizeMB} MB)`));
          passedChecks++;
        } else {
          console.log(chalk.yellow(`⚠️ Bundle size is ${sizeFormatted} MB (exceeds threshold of ${maxSizeMB} MB)`));
          issues.push(`Bundle size (${sizeFormatted} MB) exceeds threshold (${maxSizeMB} MB)`);
          
          if (verbose) {
            console.log('\nLargest files:');
            const sortedFiles = jsFiles.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
            sortedFiles.slice(0, 5).forEach(file => {
              const relPath = path.relative(packageDir, file);
              const fileSize = (fs.statSync(file).size / 1024).toFixed(2);
              console.log(`  - ${relPath}: ${fileSize} KB`);
            });
          }
        }
      } else {
        console.log(chalk.red('❌ No JavaScript files found in package'));
        issues.push('No JavaScript files found in package');
      }
    } catch (error) {
      console.error(chalk.red('❌ Error checking bundle size:'));
      console.error(error.message);
      issues.push('Failed to check bundle size');
    }
    
    // Print summary
    console.log(chalk.blue('\n=== Verification Summary ===\n'));
    console.log(`Checks passed: ${passedChecks}/${totalChecks}`);
    
    if (issues.length === 0) {
      console.log(chalk.green('✅ All checks passed! Package artifacts are valid.'));
      process.exit(0);
    } else {
      console.log(chalk.yellow(`⚠️ Found ${issues.length} issues with package artifacts.`));
      
      if (reportOnly) {
        console.log(chalk.yellow('Running in report-only mode, not failing the build.'));
        process.exit(0);
      } else {
        console.log(chalk.red('Verification failed. Fix the issues above to continue.'));
        process.exit(1);
      }
    }
    
  } catch (err) {
    console.error(chalk.red('Error during verification:'));
    console.error(err);
    process.exit(1);
  }
}

// Utility: Get all files recursively
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Execute the validation
validatePackage().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});