#!/usr/bin/env node
/**
 * JSX Syntax Error Fix Script
 * 
 * This script fixes JSX syntax errors in React component files, focusing on:
 * 1. Missing closing tags
 * 2. Unclosed JSX elements
 * 3. Invalid component references
 * 
 * Usage:
 *   node scripts/fix-jsx-syntax.js [--src-dir path/to/src]
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Default settings
let sourceDir = path.resolve('./src');
let dryRun = false;
let verbose = false;
let specificFiles = [];

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  
  if (arg === '--src-dir' && i + 1 < process.argv.length) {
    sourceDir = path.resolve(process.argv[++i]);
  } else if (arg === '--file' && i + 1 < process.argv.length) {
    specificFiles.push(path.resolve(process.argv[++i]));
  } else if (arg === '--dry-run') {
    dryRun = true;
  } else if (arg === '--verbose') {
    verbose = true;
  } else if (arg === '--help') {
    console.log(`
JSX Syntax Error Fix Script

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --src-dir <path>      Path to source directory (default: ./src)
  --file <path>         Specific file to fix (can be used multiple times)
  --dry-run             Just report changes without making them
  --verbose             Show detailed information
  --help                Show this help message
`);
    process.exit(0);
  }
}

// Known problematic files that need specific fixes
const knownIssues = {
  'src/components/integration/ScheduleConfiguration.jsx': {
    description: 'Missing closing tag for Grid component',
    syntaxFixer: (content) => {
      // Look for the unclosed <Grid> tag around line ~286
      const regex = /<Grid[^>]*>([^<]*)<\/FormControl>/g;
      return content.replace(regex, '<Grid$1></Grid></FormControl>');
    }
  },
  'src/components/integration/IntegrationFlowCanvas.jsx': {
    description: 'Duplicate identifier useMediaQuery',
    syntaxFixer: (content) => {
      // Find duplicate useMediaQuery import
      const regex = /import\s+{[^}]*useMediaQuery[^}]*}\s+from\s+['"]@mui\/material['"][;\n]/g;
      
      // If there are multiple matches, keep only the first one
      const matches = content.match(regex);
      if (matches && matches.length > 1) {
        let modifiedContent = content;
        let firstFound = false;
        
        modifiedContent = modifiedContent.replace(regex, (match) => {
          if (!firstFound) {
            firstFound = true;
            return match; // Keep the first occurrence
          }
          // For the second occurrence, remove useMediaQuery from the import
          return match.replace(/useMediaQuery,?\s*/, '');
        });
        
        return modifiedContent;
      }
      
      return content;
    }
  }
};

// Main function to fix JSX syntax errors
async function fixJsxSyntaxErrors() {
  console.log(chalk.blue('🔧 Fixing JSX syntax errors...'));
  
  // Get files to process
  const files = specificFiles.length > 0 
    ? specificFiles 
    : getAllFilesRecursively(sourceDir, ['.jsx']);
  
  console.log(chalk.blue(`Found ${files.length} JSX files to scan`));
  
  let filesFixed = 0;
  
  // Process each file
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    
    if (verbose) {
      console.log(`Processing ${relativePath}`);
    }
    
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let fileModified = false;
    
    // Check if this is a known issue file
    const normalizedPath = relativePath.replace(/\\/g, '/');
    const knownIssue = Object.keys(knownIssues).find(key => normalizedPath.endsWith(key));
    
    if (knownIssue) {
      console.log(chalk.yellow(`🔍 Found known issue in ${relativePath}: ${knownIssues[knownIssue].description}`));
      
      const newContent = knownIssues[knownIssue].syntaxFixer(content);
      if (newContent !== content) {
        content = newContent;
        fileModified = true;
        
        if (verbose) {
          console.log(`  Applied specific fix for ${knownIssue}`);
        }
      }
    }
    
    // Generic JSX syntax fixes
    
    // 1. Fix missing imports
    if (content.includes('LinearProgress') && !content.match(/import\s+[^{]*LinearProgress/)) {
      const importStatement = "import LinearProgress from '@mui/material/LinearProgress';\n";
      // Insert after the last import statement
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfImportLine = content.indexOf('\n', lastImportIndex) + 1;
        content = content.substring(0, endOfImportLine) + importStatement + content.substring(endOfImportLine);
        fileModified = true;
        
        if (verbose) {
          console.log(`  Added missing LinearProgress import`);
        }
      }
    }
    
    if (content.includes('<Tab') && !content.match(/import\s+[^{]*Tab/)) {
      const importStatement = "import Tab from '@mui/material/Tab';\n";
      // Insert after the last import statement
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfImportLine = content.indexOf('\n', lastImportIndex) + 1;
        content = content.substring(0, endOfImportLine) + importStatement + content.substring(endOfImportLine);
        fileModified = true;
        
        if (verbose) {
          console.log(`  Added missing Tab import`);
        }
      }
    }
    
    if (content.includes('<Box') && !content.match(/import\s+[^{]*Box/)) {
      const importStatement = "import Box from '@mui/material/Box';\n";
      // Insert after the last import statement
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfImportLine = content.indexOf('\n', lastImportIndex) + 1;
        content = content.substring(0, endOfImportLine) + importStatement + content.substring(endOfImportLine);
        fileModified = true;
        
        if (verbose) {
          console.log(`  Added missing Box import`);
        }
      }
    }
    
    // Write back the file if modified
    if (fileModified) {
      if (!dryRun) {
        fs.writeFileSync(file, content);
      }
      filesFixed++;
      console.log(chalk.green(`✅ Fixed ${relativePath}`));
    }
  }
  
  // Print summary
  console.log(chalk.blue('\n=== JSX Syntax Fix Summary ===\n'));
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files fixed: ${filesFixed}`);
  
  if (dryRun) {
    console.log(chalk.yellow('\nDRY RUN: No files were actually modified.'));
  }
  
  if (filesFixed > 0) {
    console.log(chalk.green(`\n✅ Successfully fixed JSX syntax errors in ${filesFixed} files.`));
  } else {
    console.log(chalk.yellow(`\n⚠️ No files were modified. Either no fixable errors were found, or --dry-run was used.`));
  }
  
  return { filesFixed };
}

// Utility function to get all files recursively
function getAllFilesRecursively(dir, extensions = ['.jsx'], fileList = []) {
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
fixJsxSyntaxErrors().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});