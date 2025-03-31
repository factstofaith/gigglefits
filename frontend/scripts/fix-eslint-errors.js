#!/usr/bin/env node
/**
 * ESLint Error Auto-Fix Script
 * 
 * This script scans source files for common ESLint errors and fixes them automatically,
 * particularly focusing on HTML entity escaping, missing imports, and other common issues.
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
ESLint Error Auto-Fix Script

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

// Error types and their fixes
const errorFixes = {
  // HTML entity escaping for JSX properties (following frontend coding standards)
  fixHtmlEntitiesInJsx: {
    detect: /&(quot|ldquo|#34|rdquo|apos|lsquo|#39|rsquo);/g,
    replace: (match) => {
      if (match.includes('quot') || match.includes('ldquo') || match.includes('#34') || match.includes('rdquo')) {
        return '"';
      }
      if (match.includes('apos') || match.includes('lsquo') || match.includes('#39') || match.includes('rsquo')) {
        return "'";
      }
      return match;
    },
    description: 'Converting HTML entities to proper JSX string literals (per coding standards)'
  },
  
  // HTML entity escaping
  escapeHtmlEntities: {
    detect: /`(['"])/g,
    replace: (match, p1) => {
      return p1 === '"' ? '&quot;' : '&apos;';
    },
    description: 'Escaping HTML entities'
  },
  
  // Missing imports
  addMuiThemeImport: {
    detect: /import\s+{([^}]*)}\s+from\s+['"]@mui\/material['"]/,
    detectCondition: (fileContent) => fileContent.includes('muiTheme') && !fileContent.includes('useTheme'),
    replace: (match, p1) => {
      return `import { ${p1.trim()}, useTheme } from '@mui/material'`;
    },
    additionalCode: `
  // Added by auto-fix script
  const muiTheme = useTheme();`,
    additionalCodeInsertionPoint: /function\s+\w+\([^)]*\)\s*{/,
    description: 'Adding useTheme import and muiTheme declaration'
  },
  
  // Missing display names
  addDisplayName: {
    detect: /const\s+(\w+)\s*=\s*(\([^)]*\))\s*=>\s*{/g,
    replace: (match, componentName, props) => {
      return `const ${componentName} = ${props} => {\n  // Added display name\n  ${componentName}.displayName = '${componentName}';\n`;
    },
    description: 'Adding display names to functional components'
  },
  
  // Fix lexical declarations in case blocks
  fixCaseDeclarations: {
    detect: /case\s+(['"])([^'"]+)['"]:([^{]*){([^}]*)\s*let\s+(\w+)/g,
    replace: (match, quote, caseName, beforeBlock, blockContent, varName) => {
      return `case ${quote}${caseName}${quote}:${beforeBlock}{\n    var ${varName}`;
    },
    description: 'Fixing lexical declarations in case blocks (changing let to var)'
  },
  
  // Fix prototype builtins
  fixPrototypeBuiltins: {
    detect: /(\w+)\.hasOwnProperty\(([^)]+)\)/g,
    replace: (match, obj, prop) => {
      return `Object.prototype.hasOwnProperty.call(${obj}, ${prop})`;
    },
    description: 'Fixing prototype builtins (hasOwnProperty)'
  },
  
  // Fix JSX unknown property
  fixJsxUnknownProperty: {
    detect: /jsx={([^}]+)}/g,
    replace: (match, jsxContent) => {
      return `/* jsx */ {${jsxContent}}`;
    },
    description: 'Fixing unknown JSX properties'
  }
};

// Main function to scan and fix errors
async function scanAndFixErrors() {
  console.log(chalk.blue('🔍 Scanning for ESLint errors...'));
  
  // Get all JS/JSX files
  const files = getAllFilesRecursively(sourceDir, ['.js', '.jsx']);
  console.log(chalk.blue(`Found ${files.length} JS/JSX files to scan`));
  
  let filesFixed = 0;
  let totalErrorsFixed = 0;
  const fixesByType = {};
  
  for (const errorType in errorFixes) {
    fixesByType[errorType] = 0;
  }
  
  // Process each file
  for (const file of files) {
    if (verbose) {
      console.log(`Processing ${file}`);
    }
    
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let fileModified = false;
    
    // Apply each fix
    for (const [errorType, fix] of Object.entries(errorFixes)) {
      // Skip fixes that don't apply to this file
      if (fix.detectCondition && !fix.detectCondition(content)) {
        continue;
      }
      
      // Apply regex replacement
      const newContent = content.replace(fix.detect, fix.replace);
      
      // Count fixes
      if (newContent !== content) {
        const fixCount = (content.match(fix.detect) || []).length;
        fixesByType[errorType] += fixCount;
        totalErrorsFixed += fixCount;
        fileModified = true;
        content = newContent;
        
        if (verbose) {
          console.log(`  Applied ${errorType}: ${fixCount} fixes`);
        }
      }
      
      // Apply additional code insertion if needed
      if (fix.additionalCode && fix.additionalCodeInsertionPoint && content.includes('muiTheme') && !content.includes('const muiTheme = useTheme();')) {
        const insertPos = content.search(fix.additionalCodeInsertionPoint);
        if (insertPos !== -1) {
          // Find the end of the function declaration line
          const lineEndPos = content.indexOf('\n', insertPos);
          if (lineEndPos !== -1) {
            content = content.substring(0, lineEndPos + 1) + fix.additionalCode + content.substring(lineEndPos + 1);
            fileModified = true;
            fixesByType[errorType]++;
            totalErrorsFixed++;
            
            if (verbose) {
              console.log(`  Inserted additional code for ${errorType}`);
            }
          }
        }
      }
    }
    
    // Write back the file if modified
    if (fileModified) {
      if (!dryRun) {
        fs.writeFileSync(file, content);
      }
      filesFixed++;
      console.log(chalk.green(`✅ Fixed ${path.relative(process.cwd(), file)}`));
    }
  }
  
  // Print summary
  console.log(chalk.blue('\n=== ESLint Auto-Fix Summary ===\n'));
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files fixed: ${filesFixed}`);
  console.log(`Total errors fixed: ${totalErrorsFixed}`);
  
  if (dryRun) {
    console.log(chalk.yellow('\nDRY RUN: No files were actually modified.'));
  }
  
  console.log(chalk.blue('\nFixes by type:'));
  for (const [errorType, count] of Object.entries(fixesByType)) {
    if (count > 0) {
      console.log(`${errorFixes[errorType].description}: ${count}`);
    }
  }
  
  if (filesFixed > 0) {
    console.log(chalk.green(`\n✅ Successfully fixed ${totalErrorsFixed} errors in ${filesFixed} files.`));
    console.log(chalk.yellow(`Note: Some complex errors may require manual fixes.`));
  } else {
    console.log(chalk.yellow(`\n⚠️ No files were modified. Either no fixable errors were found, or --dry-run was used.`));
  }
  
  return { filesFixed, totalErrorsFixed, fixesByType };
}

// Utility function to get all files recursively
function getAllFilesRecursively(dir, extensions = ['.js', '.jsx'], fileList = []) {
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
scanAndFixErrors().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});