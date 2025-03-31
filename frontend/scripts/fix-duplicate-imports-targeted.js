#!/usr/bin/env node
/**
 * Targeted Duplicate Imports Fix Script - SAFE VERSION
 * 
 * This script specifically targets identified files with duplicate Material UI component imports
 * where components are imported from both the design system adapter and direct imports.
 * It only fixes known patterns to reduce the risk of unintended changes.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Default settings
let dryRun = true; // Default to dry run for safety
let verbose = false;
let targetComponentsOnly = true; // Only fix specific components by default
let logFile = null;

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  
  if (arg === '--run') {
    dryRun = false;
  } else if (arg === '--verbose') {
    verbose = true;
  } else if (arg === '--all-components') {
    targetComponentsOnly = false;
  } else if (arg === '--log' && i + 1 < process.argv.length) {
    logFile = path.resolve(process.argv[++i]);
  } else if (arg === '--help') {
    console.log(`
Targeted Duplicate Imports Fix Script - SAFE VERSION

This script specifically targets files with duplicate Material UI component imports
where the same component is imported from both the design-system/adapter and directly.

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --run                Apply fixes (without this flag, only a dry run is performed)
  --verbose            Show detailed information
  --all-components     Fix all duplicate MUI components, not just the target list
  --log <file>         Path to write detailed log file
  --help               Show this help message

Examples:
  # Run in dry mode (no changes) to see what would be fixed
  node scripts/fix-duplicate-imports-targeted.js --verbose
  
  # Apply fixes only to critical components (Box, Tab, LinearProgress)
  node scripts/fix-duplicate-imports-targeted.js --run
  
  # Apply fixes to all duplicate MUI component imports
  node scripts/fix-duplicate-imports-targeted.js --run --all-components
`);
    process.exit(0);
  }
}

// Targeted components that are known to cause build failures
const targetComponents = [
  'Box',
  'Tab',
  'LinearProgress',
];

// Configure logging
let logger = {
  log: console.log,
  info: (...args) => verbose && console.log(...args),
  warn: console.warn,
  error: console.error,
  changes: []
};

if (logFile) {
  const logStream = fs.createWriteStream(logFile, { flags: 'w' });
  const originalLog = logger.log;
  
  logger.log = (...args) => {
    const message = args.join(' ');
    logStream.write(message + '\n');
    originalLog(...args);
  };
  
  logger.logChanges = (file, removed) => {
    logger.changes.push({ file, removed });
  };
}

// Function to check if a file has duplicate imports
function hasDuplicateImports(content, component) {
  const adapterImportRegex = new RegExp(`import\\s+{[^}]*\\b${component}\\b[^}]*}\\s+from\\s+['"](?:@design-system/adapter|.*?design-system/adapter)['"]`, 'g');
  const directImportRegex = new RegExp(`import\\s+${component}\\s+from\\s+['"]@mui/material/${component}['"]`, 'g');
  
  return adapterImportRegex.test(content) && directImportRegex.test(content);
}

// Function to remove direct imports if adapter import exists
function fixDuplicateImport(content, component) {
  const directImportRegex = new RegExp(`import\\s+${component}\\s+from\\s+['"]@mui/material/${component}['"];?\\s*\\n?`, 'g');
  return content.replace(directImportRegex, '');
}

// Main function to fix duplicate imports
async function fixDuplicateImportsTargeted() {
  logger.log(chalk.blue('🔍 Finding and fixing targeted duplicate imports...'));
  logger.log(chalk.blue(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'APPLY FIXES'}`));
  
  const sourceDir = path.resolve('./src');
  
  // Get all JS/JSX files
  const files = getAllFilesRecursively(sourceDir, ['.js', '.jsx']);
  logger.log(chalk.blue(`Found ${files.length} JS/JSX files to scan`));
  
  let filesFixed = 0;
  let importsRemoved = 0;
  const componentsToCheck = targetComponentsOnly ? targetComponents : null;
  
  // Process each file
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    
    logger.info(`Processing ${relativePath}`);
    
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let fileModified = false;
    const removedImports = [];
    
    // Check components
    const components = componentsToCheck || findAllMuiComponentImports(content);
    
    for (const component of components) {
      if (hasDuplicateImports(content, component)) {
        logger.info(`  Found duplicate import for ${component}`);
        
        const newContent = fixDuplicateImport(content, component);
        if (newContent !== content) {
          content = newContent;
          fileModified = true;
          importsRemoved++;
          removedImports.push(component);
        }
      }
    }
    
    // Write back the file if modified
    if (fileModified) {
      if (!dryRun) {
        fs.writeFileSync(file, content);
      }
      filesFixed++;
      logger.log(chalk.green(`✅ ${dryRun ? 'Would fix' : 'Fixed'} ${relativePath} - Removed ${removedImports.join(', ')} direct imports`));
      if (logFile) {
        logger.logChanges(relativePath, removedImports);
      }
    }
  }
  
  // Print summary
  logger.log(chalk.blue('\n=== Targeted Duplicate Imports Fix Summary ===\n'));
  logger.log(`Files scanned: ${files.length}`);
  logger.log(`Files ${dryRun ? 'that would be fixed' : 'fixed'}: ${filesFixed}`);
  logger.log(`Imports ${dryRun ? 'that would be removed' : 'removed'}: ${importsRemoved}`);
  
  if (dryRun) {
    logger.log(chalk.yellow('\nDRY RUN: No files were actually modified.'));
    logger.log(chalk.yellow('To apply these changes, run with the --run flag.'));
  }
  
  if (filesFixed > 0) {
    logger.log(chalk.green(`\n✅ ${dryRun ? 'Would fix' : 'Successfully fixed'} ${importsRemoved} duplicate imports in ${filesFixed} files.`));
  } else {
    logger.log(chalk.yellow(`\n⚠️ No files ${dryRun ? 'would be modified' : 'were modified'}. Either no duplicate imports were found, or criteria were too restrictive.`));
  }
  
  return { filesFixed, importsRemoved };
}

// Find all MUI component imports in a file
function findAllMuiComponentImports(content) {
  const directImportRegex = /import\s+(\w+)\s+from\s+['"]@mui\/material\/\1['"]/g;
  const matches = [...content.matchAll(directImportRegex)];
  return matches.map(match => match[1]);
}

// Utility function to get all files recursively
function getAllFilesRecursively(dir, extensions = ['.js', '.jsx'], fileList = []) {
  if (!fs.existsSync(dir)) {
    logger.warn(`Warning: Directory ${dir} does not exist`);
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (file !== 'node_modules' && !file.startsWith('.')) {
        getAllFilesRecursively(filePath, extensions, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  
  return fileList;
}

// Execute the script
fixDuplicateImportsTargeted().catch(err => {
  logger.error('Unexpected error:', err);
  process.exit(1);
});