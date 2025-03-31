#!/usr/bin/env node
/**
 * Build Error Fix Script
 * 
 * This script orchestrates the execution of all error fixing scripts in the correct order
 * to address build errors without breaking QA test compatibility.
 * 
 * Usage:
 *   node scripts/fix-build-errors.js [--dry-run]
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Default settings
let dryRun = false;
let verbose = false;
let specificErrors = [];

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  
  if (arg === '--dry-run') {
    dryRun = true;
  } else if (arg === '--verbose') {
    verbose = true;
  } else if (arg === '--error' && i + 1 < process.argv.length) {
    specificErrors.push(process.argv[++i]);
  } else if (arg === '--help') {
    console.log(`
Build Error Fix Script

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --dry-run             Just report changes without making them
  --verbose             Show detailed information
  --error <type>        Fix only specific error types (eslint, jsx, hooks)
  --help                Show this help message
`);
    process.exit(0);
  }
}

// Fix scripts to run in order
const fixScripts = [
  { 
    name: 'ESLint Errors', 
    script: 'fix-eslint-errors.js',
    type: 'eslint',
    description: 'Fixes common ESLint errors like HTML entities, missing imports, etc.'
  },
  { 
    name: 'JSX Syntax Errors', 
    script: 'fix-jsx-syntax.js',
    type: 'jsx',
    description: 'Fixes JSX syntax errors like missing closing tags and component references'
  },
  { 
    name: 'React Hooks Rules', 
    script: 'fix-react-hooks.js',
    type: 'hooks',
    description: 'Fixes React Hooks rules violations'
  }
];

// Main function to run all fix scripts
async function fixAllBuildErrors() {
  console.log(chalk.blue('🔧 Starting build error fixes...'));
  
  // Filter scripts based on specified errors
  const scriptsToRun = specificErrors.length > 0
    ? fixScripts.filter(script => specificErrors.includes(script.type))
    : fixScripts;
  
  console.log(chalk.blue(`Will run ${scriptsToRun.length} fix scripts`));
  
  // Create a backup directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'error_fix_backups', timestamp);
  
  if (!dryRun) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(chalk.blue(`Created backup directory: ${backupDir}`));
    
    // Create a log file
    const logFile = path.join(process.cwd(), `error_fix_log_${timestamp}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    console.log(chalk.blue(`Created log file: ${logFile}`));
    
    // Log script execution
    logStream.write(`Fix Build Errors - ${new Date().toLocaleString()}\n`);
    logStream.write(`Dry run: ${dryRun}\n`);
    logStream.write(`Verbose: ${verbose}\n`);
    logStream.write(`Specific errors: ${specificErrors.join(', ') || 'all'}\n\n`);
  }
  
  // Run each script in sequence
  for (const [index, script] of scriptsToRun.entries()) {
    console.log(chalk.blue(`\n[${index + 1}/${scriptsToRun.length}] Running ${script.name} fix...`));
    console.log(chalk.blue(`Description: ${script.description}`));
    
    try {
      // Construct the script path
      const scriptPath = path.join(process.cwd(), 'scripts', script.script);
      
      // Check if script exists
      if (!fs.existsSync(scriptPath)) {
        console.error(chalk.red(`❌ Script not found: ${scriptPath}`));
        continue;
      }
      
      // Execute the script
      const args = [scriptPath];
      if (dryRun) args.push('--dry-run');
      if (verbose) args.push('--verbose');
      
      await runScript('node', args);
      
      console.log(chalk.green(`✅ Completed ${script.name} fix`));
      
    } catch (error) {
      console.error(chalk.red(`❌ Error running ${script.name} fix: ${error.message}`));
    }
  }
  
  console.log(chalk.blue('\n=== Build Error Fix Summary ===\n'));
  console.log(`Scripts executed: ${scriptsToRun.length}`);
  
  if (dryRun) {
    console.log(chalk.yellow('\nDRY RUN: No files were actually modified.'));
  }
  
  console.log(chalk.green(`\n✅ Build error fix process completed.`));
  console.log(chalk.yellow(`Next steps: Run 'npm run build' to verify all errors have been fixed.`));
}

// Utility function to run a script as a child process
function runScript(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

// Execute the script
fixAllBuildErrors().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});