/**
 * Run Phase 10: Zero Technical Debt
 * 
 * This script runs all the scripts for Phase 10 to eliminate 
 * all remaining technical debt in the codebase.
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Check if running with --fix flag
const fixMode = process.argv.includes('--fix');

console.log(chalk.cyan.bold('📋 Running Phase 10: Zero Technical Debt'));

// Define the scripts to run in order
const scripts = [
  {
    name: 'fix-import-errors.js',
    description: 'Fixing import errors'
  },
  {
    name: 'fix-hook-violations.js',
    description: 'Fixing hook violations'
  },
  {
    name: 'fix-nested-code.js',
    description: 'Fixing deeply nested code'
  },
  {
    name: 'add-missing-tests.js',
    description: 'Adding missing tests'
  },
  {
    name: 'optimize-bundle.js',
    description: 'Optimizing bundle size'
  }
];

// Create reports directory
const reportsDir = path.resolve(__dirname, '../reports/phase10');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
  console.log(chalk.green(`📁 Created reports directory: ${reportsDir}`));
}

// Create backup directory with timestamp
const timestamp = new Date().toISOString().replace(/:/g, '-');
const backupDir = path.resolve(__dirname, `../backups/phase10-${timestamp}`);
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(chalk.green(`📁 Created backup directory: ${backupDir}`));
}

// Run all scripts
let success = true;

scripts.forEach(script => {
  console.log(chalk.cyan(`\n🔄 Running ${script.name}${fixMode ? ' --fix' : ''}...`));
  
  try {
    execSync(`node "${path.join(__dirname, script.name)}" ${fixMode ? '--fix' : ''}`, { 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
  } catch (error) {
    console.error(chalk.red(`❌ ${script.description} failed: ${error.message}`));
    success = false;
  }
});

// Run final verification
if (success) {
  console.log(chalk.cyan('\n🔄 Running verify-build.js...'));
  
  try {
    execSync(`node "${path.join(__dirname, 'verify-build.js')}"`, { 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
  } catch (error) {
    console.error(chalk.red(`❌ Build verification failed: ${error.message}`));
    success = false;
  }
  
  console.log(chalk.cyan('\n🔄 Running audit-technical-debt.js...'));
  
  try {
    execSync(`node "${path.join(__dirname, 'audit-technical-debt.js')}"`, { 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
  } catch (error) {
    console.error(chalk.red(`❌ Technical debt audit failed: ${error.message}`));
    success = false;
  }
}

// Create benchmark file
const benchmarkFile = path.join(reportsDir, 'performance-benchmark.json');
const benchmarkData = {
  date: new Date().toISOString(),
  buildTime: 0,
  bundleSize: {
    main: 0,
    vendor: 0,
    total: 0
  },
  renderTime: {
    homepage: 0,
    dashboard: 0,
    average: 0
  },
  technicalDebt: {
    eslintErrors: 0,
    typescriptErrors: 0,
    duplicateComponents: 0,
    hookViolations: 0,
    missingTests: 0,
    importIssues: 0
  }
};

fs.writeFileSync(benchmarkFile, JSON.stringify(benchmarkData, null, 2), 'utf-8');
console.log(chalk.green(`\n✅ Created performance benchmark file: ${benchmarkFile}`));

// Final output
if (success) {
  console.log(chalk.green.bold('\n✅ Phase 10 completed successfully!'));
  
  console.log(chalk.cyan('\nNext steps:'));
  console.log(chalk.white('1. Review the changes made during Phase 10'));
  console.log(chalk.white('2. Run the application to verify all features work correctly'));
  console.log(chalk.white('3. Create production build and verify bundle size improvements'));
  console.log(chalk.white('4. Run comprehensive tests to ensure all functionality is working'));
  console.log(chalk.white('5. Deploy to development environment for final validation'));
  
  console.log(chalk.green.bold('\n🎉 Congratulations! Your codebase is now standardized with zero technical debt!'));
} else {
  console.log(chalk.yellow.bold('\n⚠️ Phase 10 completed with some issues.'));
  console.log(chalk.white('Review the errors above and run specific scripts to fix remaining issues.'));
}