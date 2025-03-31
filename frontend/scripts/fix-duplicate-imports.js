#!/usr/bin/env node
/**
 * Duplicate Imports Fix Script
 * 
 * This script finds and fixes duplicate Material UI component imports.
 * Specifically, it looks for imports through both the design system adapter and direct imports,
 * and removes the direct imports to ensure all components come from the design system.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Default settings
let sourceDir = path.resolve('./src');
let dryRun = false;
let verbose = false;

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  
  if (arg === '--src-dir' && i + 1 < process.argv.length) {
    sourceDir = path.resolve(process.argv[++i]);
  } else if (arg === '--dry-run') {
    dryRun = true;
  } else if (arg === '--verbose') {
    verbose = true;
  } else if (arg === '--help') {
    console.log(`
Duplicate Imports Fix Script

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --src-dir <path>      Path to source directory (default: ./src)
  --dry-run             Just report changes without making them
  --verbose             Show detailed information
  --help                Show this help message
`);
    process.exit(0);
  }
}

// Components to check for duplicates
const componentsToCheck = [
  'Tab',
  'Box',
  'LinearProgress',
  'Card',
  'Button',
  'Menu',
  'MenuItem',
  'Paper',
  'Drawer',
  'IconButton',
  'Typography',
  'Dialog',
  'TextField',
  'Select',
  'Checkbox',
  'Tooltip',
  'Snackbar',
  'Alert',
  'Grid',
  'Container',
  'CircularProgress',
  'Tabs',
  'Divider',
  'List',
  'ListItem',
  'ListItemText',
  'ListItemIcon',
  'Badge',
  'Card',
  'CardContent',
  'CardHeader',
  'CardActions',
  'Switch',
  'FormControl'
];

// Regex patterns for different import styles
const adapterImportRegex = new RegExp(`import\\s+{[^}]*\\b(${componentsToCheck.join('|')})\\b[^}]*}\\s+from\\s+['"](@design-system/adapter|['\\.]+/design-system/adapter)['"]`, 'g');
const directImportRegex = new RegExp(`import\\s+(${componentsToCheck.join('|')})\\s+from\\s+['"]@mui/material/\\1['"];?\\s*`, 'g');

// Main function to fix duplicate imports
async function fixDuplicateImports() {
  console.log(chalk.blue('🔍 Finding and fixing duplicate imports...'));
  
  // Get all JS/JSX files
  const files = getAllFilesRecursively(sourceDir, ['.js', '.jsx']);
  console.log(chalk.blue(`Found ${files.length} JS/JSX files to scan`));
  
  let filesFixed = 0;
  let importsRemoved = 0;
  
  // Process each file
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    
    if (verbose) {
      console.log(`Processing ${relativePath}`);
    }
    
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Check if file has adapter imports and direct imports
    const hasAdapterImports = adapterImportRegex.test(content);
    adapterImportRegex.lastIndex = 0; // Reset regex
    
    if (hasAdapterImports) {
      // Find all direct component imports and remove them
      const directImports = [...content.matchAll(directImportRegex)];
      
      if (directImports.length > 0) {
        if (verbose) {
          console.log(`  Found ${directImports.length} direct imports to remove`);
        }
        
        // Remove direct imports
        content = content.replace(directImportRegex, '');
        
        // Count removed imports
        importsRemoved += directImports.length;
        
        // Write back the file if modified
        if (content !== originalContent) {
          if (!dryRun) {
            fs.writeFileSync(file, content);
          }
          filesFixed++;
          console.log(chalk.green(`✅ Fixed ${relativePath} - Removed ${directImports.length} direct imports`));
        }
      }
    }
  }
  
  // Print summary
  console.log(chalk.blue('\n=== Duplicate Imports Fix Summary ===\n'));
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files fixed: ${filesFixed}`);
  console.log(`Imports removed: ${importsRemoved}`);
  
  if (dryRun) {
    console.log(chalk.yellow('\nDRY RUN: No files were actually modified.'));
  }
  
  console.log(chalk.blue('\nFixes applied:'));
  console.log(`Removed direct MUI component imports duplicated in design system adapter: ${importsRemoved}`);
  
  if (filesFixed > 0) {
    console.log(chalk.green(`\n✅ Successfully fixed ${importsRemoved} duplicate imports in ${filesFixed} files.`));
  } else {
    console.log(chalk.yellow(`\n⚠️ No files were modified. Either no duplicate imports were found, or --dry-run was used.`));
  }
  
  return { filesFixed, importsRemoved };
}

// Utility function to get all files recursively
function getAllFilesRecursively(dir, extensions = ['.js', '.jsx'], fileList = []) {
  if (!fs.existsSync(dir)) {
    console.warn(`Warning: Directory ${dir} does not exist`);
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
fixDuplicateImports().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});