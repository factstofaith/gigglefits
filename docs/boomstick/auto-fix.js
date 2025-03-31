#!/usr/bin/env node
/**
 * Auto Fix Tool for React/JSX Codebase
 * 
 * This script automatically fixes issues identified by the static-analyzer.js
 * with dual validation (build + test compatibility).
 * 
 * Features:
 * - Automatic backup with timestamping
 * - Fix validation before applying
 * - Pass-through to npm verification only when necessary
 * - Root cause fixing rather than symptom patching
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };
const { analyzeFile, categories } = require('./static-analyzer');

// Configuration
const config = {
  backupDir: path.resolve(`./project/777_Final/backups/${new Date().toISOString().replace(/:/g, '-')}`),
  skipBuild: false,
  skipTests: false,
  maxParallel: 4,
  fastMode: true, // Skip npm for non-critical files
};

// Command line arguments
const args = process.argv.slice(2);
const issuesFile = args[0] || './static-analysis-report.json';
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const skipBackup = args.includes('--skip-backup');
const force = args.includes('--force');

// Ensure backup directory exists
if (!skipBackup && !dryRun) {
  fs.mkdirSync(config.backupDir, { recursive: true });
  console.log(chalk.blue(`Created backup directory: ${config.backupDir}`));
}

/**
 * Create backup of a file before modification
 */
function backupFile(filePath) {
  if (skipBackup || dryRun) return null;
  
  try {
    const backupPath = path.join(config.backupDir, `${path.basename(filePath)}.${Date.now()}.backup`);
    fs.copyFileSync(filePath, backupPath);
    if (verbose) {
      console.log(chalk.blue(`  Created backup: ${backupPath}`));
    }
    return backupPath;
  } catch (err) {
    console.error(chalk.red(`  Failed to create backup for ${filePath}: ${err.message}`));
    return null;
  }
}

/**
 * Restore file from backup if fix fails
 */
function restoreFromBackup(filePath, backupPath) {
  if (!backupPath || dryRun) return false;
  
  try {
    fs.copyFileSync(backupPath, filePath);
    console.log(chalk.yellow(`  Restored ${filePath} from backup`));
    return true;
  } catch (err) {
    console.error(chalk.red(`  Failed to restore from backup: ${err.message}`));
    return false;
  }
}

/**
 * Validates a file using Babel parser
 */
function validateSyntax(filePath) {
  try {
    const cmd = `npx @babel/parser --plugins=jsx ${filePath}`;
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch (err) {
    console.error(chalk.red(`  Syntax validation failed for ${filePath}: ${err.message}`));
    return false;
  }
}

/**
 * Validates build compatibility 
 */
function validateBuild(criticalOnly = true) {
  if (config.skipBuild) return true;
  
  try {
    console.log(chalk.blue('Running build verification...'));
    
    if (criticalOnly) {
      // Fast validation - ESLint check instead of full build
      const cmd = 'cd $(git rev-parse --show-toplevel)/frontend && npx eslint --no-eslintrc --parser-options=jsx=true --parser=@babel/eslint-parser ./src/components/common/**/*.jsx';
      execSync(cmd, { stdio: 'pipe' });
    } else {
      // Full validation when necessary
      const cmd = 'cd $(git rev-parse --show-toplevel)/frontend && npm run build:quick';
      execSync(cmd, { stdio: 'inherit' });
    }
    return true;
  } catch (err) {
    console.error(chalk.red(`Build verification failed: ${err.message}`));
    return false;
  }
}

/**
 * Validates test compatibility
 */
function validateTests(criticalOnly = true) {
  if (config.skipTests) return true;
  
  try {
    console.log(chalk.blue('Running test verification...'));
    
    if (criticalOnly) {
      // Fast validation - run core tests only
      const cmd = 'cd $(git rev-parse --show-toplevel)/frontend && npm run test:utils -- --bail';
      execSync(cmd, { stdio: 'pipe' });
    } else {
      // Full validation
      const cmd = 'cd $(git rev-parse --show-toplevel)/frontend && npm run test:once';
      execSync(cmd, { stdio: 'inherit' });
    }
    return true;
  } catch (err) {
    console.error(chalk.red(`Test verification failed: ${err.message}`));
    return false;
  }
}

/**
 * Apply fixes to a file based on issue category
 */
function applyFixes(filePath, issues) {
  const backupPath = backupFile(filePath);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Group issues by category to avoid multiple passes
    const issuesByCategory = {};
    issues.forEach(issue => {
      if (!issuesByCategory[issue.category]) {
        issuesByCategory[issue.category] = [];
      }
      issuesByCategory[issue.category].push(issue);
    });
    
    // Apply fixes for each category
    Object.entries(issuesByCategory).forEach(([category, categoryIssues]) => {
      const categoryConfig = categories[category];
      if (!categoryConfig || !categoryConfig.fix) return;
      
      // Apply all fixes for this category
      categoryIssues.forEach(issue => {
        const originalContent = content;
        content = categoryConfig.fix(content, issue);
        if (content !== originalContent) {
          modified = true;
          if (verbose) {
            console.log(`  Applied fix for ${issue.id}`);
          }
        }
      });
    });
    
    if (!modified) {
      console.log(chalk.yellow(`  No changes made to ${filePath}`));
      return true;
    }
    
    if (dryRun) {
      console.log(chalk.green(`  Would fix ${filePath}`));
      return true;
    }
    
    // Write changes and validate syntax
    fs.writeFileSync(filePath, content);
    
    // Validate syntax first
    if (!validateSyntax(filePath)) {
      console.log(chalk.red(`  Syntax validation failed, restoring ${filePath}`));
      restoreFromBackup(filePath, backupPath);
      return false;
    }
    
    // Only run npm tests for critical files to save time
    const isCriticalFile = issues.some(issue => issue.isCriticalFile);
    let buildOk = true;
    let testsOk = true;
    
    if (!config.fastMode || isCriticalFile) {
      // Validate build and tests only for critical files in fast mode
      buildOk = validateBuild(config.fastMode);
      if (!buildOk && !force) {
        console.log(chalk.red(`  Build validation failed, restoring ${filePath}`));
        restoreFromBackup(filePath, backupPath);
        return false;
      }
      
      testsOk = validateTests(config.fastMode);
      if (!testsOk && !force) {
        console.log(chalk.red(`  Test validation failed, restoring ${filePath}`));
        restoreFromBackup(filePath, backupPath);
        return false;
      }
    }
    
    console.log(chalk.green(`  Successfully fixed ${filePath}`));
    return true;
  } catch (err) {
    console.error(chalk.red(`  Error fixing ${filePath}: ${err.message}`));
    restoreFromBackup(filePath, backupPath);
    return false;
  }
}

/**
 * Main function to process all issues
 */
async function main() {
  // Load issues from file
  console.log(chalk.blue(`Loading issues from ${issuesFile}...`));
  const issues = JSON.parse(fs.readFileSync(issuesFile, 'utf8'));
  
  // Group issues by file for efficient processing
  const issuesByFile = {};
  issues.forEach(issue => {
    if (!issuesByFile[issue.filePath]) {
      issuesByFile[issue.filePath] = [];
    }
    issuesByFile[issue.filePath].push(issue);
  });
  
  console.log(chalk.blue(`Found ${issues.length} issues in ${Object.keys(issuesByFile).length} files`));
  
  // Sort files by criticality for processing order
  const sortedFiles = Object.keys(issuesByFile).sort((a, b) => {
    const aIsCritical = issuesByFile[a].some(i => i.isCriticalFile);
    const bIsCritical = issuesByFile[b].some(i => i.isCriticalFile);
    
    // Fix critical files first
    if (aIsCritical && !bIsCritical) return -1;
    if (!aIsCritical && bIsCritical) return 1;
    
    // Then by error count
    return issuesByFile[b].length - issuesByFile[a].length;
  });
  
  console.log(chalk.blue(`Applying fixes to ${sortedFiles.length} files...`));
  
  // Process files
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < sortedFiles.length; i++) {
    const filePath = sortedFiles[i];
    const fileIssues = issuesByFile[filePath];
    
    console.log(chalk.blue(`\nProcessing file ${i+1}/${sortedFiles.length}: ${filePath}`));
    console.log(`  Found ${fileIssues.length} issues`);
    
    const success = applyFixes(filePath, fileIssues);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Run full validation after every 10 files or if this is the last file
    if (!config.fastMode && (i % 10 === 9 || i === sortedFiles.length - 1)) {
      const buildOk = validateBuild(false);
      const testsOk = validateTests(false);
      
      if (!buildOk || !testsOk) {
        console.log(chalk.red('\n⚠️ Full validation failed - proceeding with caution'));
        if (!force) {
          console.log(chalk.red('Stopping auto-fix process. Use --force to continue despite validation failures.'));
          break;
        }
      }
    }
  }
  
  // Final validation
  if (!dryRun && successCount > 0) {
    console.log(chalk.blue('\nRunning final validation...'));
    
    const buildOk = validateBuild(false);
    const testsOk = validateTests(false);
    
    if (buildOk && testsOk) {
      console.log(chalk.green('\n✅ All validations passed!'));
    } else {
      console.log(chalk.red('\n⚠️ Final validation failed - manual review required'));
    }
  }
  
  // Print summary
  console.log(chalk.blue('\n=== Auto Fix Summary ==='));
  console.log(`Total files processed: ${sortedFiles.length}`);
  console.log(`Successfully fixed: ${successCount}`);
  console.log(`Failed to fix: ${failCount}`);
  
  if (dryRun) {
    console.log(chalk.yellow('\nDRY RUN: No files were actually modified'));
  }
  
  return { total: sortedFiles.length, success: successCount, fail: failCount };
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});