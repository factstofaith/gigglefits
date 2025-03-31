#!/usr/bin/env node

/**
 * fix-duplicate-identifiers.js
 * 
 * Detects and fixes duplicate identifier errors in React components.
 * This script analyzes import statements to find duplicate imports of the same module
 * and fixes them by removing duplicate imports, preserving the first occurrence.
 * 
 * ZERO TECHNICAL DEBT APPROACH:
 * - Performs root cause analysis to identify patterns of duplication
 * - Applies comprehensive fixes rather than symptom treatment
 * - Validates changes with parallel build/test verification
 * - Documents all changes and rationale
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '../..');
const srcDir = path.join(rootDir, 'src');
const componentsDir = path.join(srcDir, 'components');
const backupDir = path.join(rootDir, 'backups', `duplicate-identifiers-${new Date().toISOString().replace(/:/g, '-')}`);

// Command line arguments
const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');
const autoFix = process.argv.includes('--auto-fix');
const skipValidation = process.argv.includes('--skip-validation');
const targetFile = process.argv.find(arg => arg.startsWith('--file='))?.split('=')[1];

// Statistics
const stats = {
  filesScanned: 0,
  filesWithDuplicates: 0,
  duplicatesFound: 0,
  duplicatesFixed: 0,
  validationPassed: false,
  rootCauses: {}
};

// Create backup directory
if (!dryRun && !fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`Created backup directory: ${backupDir}`);
}

/**
 * Backup a file before modifying it
 */
function backupFile(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  const backupPath = path.join(backupDir, relativePath);
  const backupDirPath = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDirPath)) {
    fs.mkdirSync(backupDirPath, { recursive: true });
  }
  
  fs.copyFileSync(filePath, backupPath);
  if (verbose) {
    console.log(`Backed up: ${relativePath}`);
  }
}

/**
 * Parse import statements and detect duplicates
 */
function findDuplicateIdentifiers(content) {
  const importRegex = /import\s+(?:{([^}]*)}\s+from\s+['"]([^'"]+)['"]|([^{};]+)\s+from\s+['"]([^'"]+)['"])/g;
  const imports = {};
  const identifiers = new Set();
  const duplicates = [];
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    // Destructured imports like: import { Button, TextField } from '@mui/material'
    if (match[1]) {
      const moduleSource = match[2];
      const importedItems = match[1].split(',').map(item => {
        // Handle "as" syntax: Button as MuiButton
        const parts = item.trim().split(/\s+as\s+/);
        return {
          original: parts[0].trim(),
          alias: parts[1]?.trim() || parts[0].trim()
        };
      });
      
      if (!imports[moduleSource]) {
        imports[moduleSource] = [];
      }
      
      importedItems.forEach(item => {
        if (identifiers.has(item.alias)) {
          duplicates.push({
            identifier: item.alias,
            moduleSource,
            importString: match[0],
            type: 'destructured'
          });
        } else {
          identifiers.add(item.alias);
          imports[moduleSource].push(item);
        }
      });
    } 
    // Default imports like: import React from 'react'
    else if (match[3]) {
      const identifier = match[3].trim();
      const moduleSource = match[4];
      
      if (identifiers.has(identifier)) {
        duplicates.push({
          identifier,
          moduleSource,
          importString: match[0],
          type: 'default'
        });
      } else {
        identifiers.add(identifier);
        if (!imports[moduleSource]) {
          imports[moduleSource] = [];
        }
        imports[moduleSource].push({ original: identifier, alias: identifier, isDefault: true });
      }
    }
  }
  
  return { imports, duplicates };
}

/**
 * Fix duplicate identifiers in a file
 */
function fixDuplicateIdentifiers(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find duplicates
  const { imports, duplicates } = findDuplicateIdentifiers(content);
  
  if (duplicates.length === 0) {
    return { fixed: 0, duplicates: 0 };
  }
  
  stats.filesWithDuplicates++;
  stats.duplicatesFound += duplicates.length;
  
  console.log(`\nFile: ${relativePath}`);
  console.log(`Found ${duplicates.length} duplicate identifier(s)`);
  
  // Categorize duplicates for root cause analysis
  duplicates.forEach(duplicate => {
    const category = duplicate.moduleSource.includes('@mui') ? 'mui-component' :
                    duplicate.moduleSource.includes('react') ? 'react-import' :
                    duplicate.moduleSource.includes('design-system') ? 'design-system' :
                    'other';
    
    if (!stats.rootCauses[category]) {
      stats.rootCauses[category] = 0;
    }
    stats.rootCauses[category]++;
  });
  
  if (dryRun) {
    duplicates.forEach(duplicate => {
      console.log(`  - Duplicate: ${duplicate.identifier} from ${duplicate.moduleSource}`);
    });
    return { fixed: 0, duplicates: duplicates.length };
  }
  
  // Backup the file before making changes
  backupFile(filePath);
  
  // Fix duplicate identifiers
  let fixedCount = 0;
  
  duplicates.forEach(duplicate => {
    // Strategy 1: Remove the duplicate import entirely if it's a simple import
    if (duplicate.type === 'default') {
      const regex = new RegExp(`import\\s+${duplicate.identifier}\\s+from\\s+['"]${duplicate.moduleSource}['"];?\\n?`, 'g');
      const newContent = content.replace(regex, '// Removed duplicate import\n');
      
      if (newContent !== content) {
        content = newContent;
        fixedCount++;
        console.log(`  ✓ Removed duplicate default import: ${duplicate.identifier} from ${duplicate.moduleSource}`);
      }
    }
    // Strategy 2: For destructured imports, remove just the duplicate identifier
    else if (duplicate.type === 'destructured') {
      // This is more complex as we need to modify just part of the import statement
      // Find all imports from this module
      const moduleImportRegex = new RegExp(`import\\s+{([^}]*)}\s+from\\s+['"]${duplicate.moduleSource}['"];?`, 'g');
      let moduleImports = [];
      
      let importMatch;
      while ((importMatch = moduleImportRegex.exec(content)) !== null) {
        moduleImports.push({
          fullMatch: importMatch[0],
          importedItems: importMatch[1],
          start: importMatch.index,
          end: importMatch.index + importMatch[0].length
        });
      }
      
      // We need to keep the first occurrence and remove duplicates from later imports
      if (moduleImports.length > 1) {
        // Keep the first import as is
        const firstImport = moduleImports[0];
        
        // For each subsequent import, we need to remove the duplicate identifier
        for (let i = 1; i < moduleImports.length; i++) {
          const currentImport = moduleImports[i];
          const importedItems = currentImport.importedItems.split(',').map(item => item.trim());
          
          // Check if this import contains our duplicate
          const duplicateIndex = importedItems.findIndex(item => 
            item === duplicate.identifier || 
            item.startsWith(duplicate.identifier + ' as') ||
            item.endsWith('as ' + duplicate.identifier)
          );
          
          if (duplicateIndex !== -1) {
            // Remove the duplicate identifier
            importedItems.splice(duplicateIndex, 1);
            
            // If there are no more items, remove the entire import
            if (importedItems.length === 0) {
              content = content.slice(0, currentImport.start) + 
                       '// Removed duplicate import' + 
                       content.slice(currentImport.end);
            } else {
              // Otherwise, update the import with the remaining items
              const newImport = `import { ${importedItems.join(', ')} } from '${duplicate.moduleSource}';`;
              content = content.slice(0, currentImport.start) + 
                       newImport + 
                       content.slice(currentImport.end);
            }
            
            fixedCount++;
            console.log(`  ✓ Removed duplicate identifier: ${duplicate.identifier} from ${duplicate.moduleSource}`);
            break;
          }
        }
      }
    }
  });
  
  if (fixedCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    stats.duplicatesFixed += fixedCount;
    console.log(`  ✅ Fixed ${fixedCount} duplicate identifier(s) in ${relativePath}`);
  }
  
  return { fixed: fixedCount, duplicates: duplicates.length };
}

/**
 * Find files with potential duplicate identifiers
 */
function findFilesWithDuplicateIdentifiers() {
  // If a target file is specified, only scan that file
  if (targetFile) {
    const filePath = path.resolve(rootDir, targetFile);
    if (fs.existsSync(filePath)) {
      return [filePath];
    } else {
      console.error(`Target file not found: ${targetFile}`);
      return [];
    }
  }
  
  // Otherwise scan all JSX files in the components directory
  const pattern = path.join(componentsDir, '**', '*.jsx');
  return glob.sync(pattern);
}

/**
 * Validate changes by running build and tests in parallel
 */
async function validateChanges() {
  console.log('\n🧪 Validating changes...');
  
  try {
    // Run just a quick build to see if we've fixed the duplicate identifier errors
    console.log('Running build...');
    execSync('npm run build:quick', { cwd: rootDir });
    console.log('✅ Build passed!');
    
    // Only run tests if the build passes
    console.log('Running tests...');
    execSync('npm run test:once', { cwd: rootDir });
    console.log('✅ Tests passed!');
    
    stats.validationPassed = true;
    return true;
  } catch (error) {
    console.error('❌ Validation failed:');
    if (error.stdout) {
      console.error(error.stdout.toString());
    }
    if (error.stderr) {
      console.error(error.stderr.toString());
    }
    return false;
  }
}

/**
 * Print final report with statistics and root cause analysis
 */
function printReport() {
  console.log('\n📊 Fix Duplicate Identifiers Report');
  console.log('================================');
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files with duplicates: ${stats.filesWithDuplicates}`);
  console.log(`Duplicates found: ${stats.duplicatesFound}`);
  console.log(`Duplicates fixed: ${stats.duplicatesFixed}`);
  
  // Root cause analysis
  console.log('\n🔍 Root Cause Analysis');
  console.log('---------------------');
  
  if (Object.keys(stats.rootCauses).length > 0) {
    console.log('Duplicate identifier patterns:');
    
    // Sort root causes by frequency
    const sortedCauses = Object.entries(stats.rootCauses)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => {
        const percentage = ((count / stats.duplicatesFound) * 100).toFixed(1);
        return { category, count, percentage };
      });
    
    // Print each root cause with explanation
    sortedCauses.forEach(({ category, count, percentage }) => {
      console.log(`  - ${category}: ${count} (${percentage}%)`);
      
      switch (category) {
        case 'mui-component':
          console.log('    ROOT CAUSE: Multiple direct imports from Material UI instead of using design system.');
          console.log('    SOLUTION: Replace with design system components and standardize imports.');
          break;
        case 'react-import':
          console.log('    ROOT CAUSE: Multiple imports of React or React components.');
          console.log('    SOLUTION: Standardize React imports at the top of files.');
          break;
        case 'design-system':
          console.log('    ROOT CAUSE: Mixing direct MUI imports with design system components.');
          console.log('    SOLUTION: Fully migrate to design system components.');
          break;
        default:
          console.log('    ROOT CAUSE: General duplicate imports.');
          console.log('    SOLUTION: Use consistent import structure.');
      }
    });
    
    // Overall recommendation
    const primaryCause = sortedCauses[0].category;
    console.log('\n🛠️ Primary Recommendation:');
    
    if (primaryCause === 'mui-component') {
      console.log('  Create a design system migration plan to replace direct MUI imports with design system components.');
      console.log('  Consider running scripts/fixes/convert-to-design-system.js to automate this process.');
    } else if (primaryCause === 'react-import') {
      console.log('  Standardize React imports across all components.');
      console.log('  Consider adding an ESLint rule to enforce consistent React imports.');
    } else {
      console.log('  Implement consistent import patterns across the codebase.');
      console.log('  Consider using an import sorter or linter to maintain consistency.');
    }
  } else {
    console.log('No duplicate identifiers found for root cause analysis.');
  }
  
  // Validation results
  console.log('\n✅ Validation Results');
  console.log('-------------------');
  console.log(stats.validationPassed ? 
    '✅ Build and tests pass - duplicate identifiers fixed successfully!' : 
    '❌ Validation failed - check build and test logs for details.');
  
  // Next steps
  console.log('\n📝 Next Steps');
  console.log('-----------');
  
  if (stats.duplicatesFixed > 0) {
    if (stats.validationPassed) {
      console.log('1. Commit the changes');
      console.log('2. Address the root causes identified above');
      console.log('3. Consider running additional fix scripts to improve overall code quality');
    } else {
      console.log('1. Check build and test logs for remaining issues');
      console.log('2. Run this script with --dry-run to identify remaining duplicate identifiers');
      console.log('3. Consider manual fixes for complex cases');
    }
  } else if (stats.duplicatesFound > 0) {
    console.log('1. Run this script with --auto-fix to apply fixes');
    console.log('2. Review and commit the changes after validation');
  } else {
    console.log('No duplicate identifiers found. The codebase is clean in this aspect.');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Scanning for duplicate identifiers...');
  
  const files = findFilesWithDuplicateIdentifiers();
  stats.filesScanned = files.length;
  
  console.log(`Scanning ${files.length} files...`);
  
  if (dryRun) {
    console.log('Running in dry-run mode - no changes will be made');
  }
  
  let fixedSomething = false;
  
  // Process each file
  for (const file of files) {
    const result = fixDuplicateIdentifiers(file);
    
    if (result.fixed > 0) {
      fixedSomething = true;
    }
  }
  
  // Validate changes if fixes were applied and validation isn't skipped
  if (fixedSomething && !dryRun && !skipValidation) {
    await validateChanges();
  }
  
  // Print final report
  printReport();
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});