/**
 * Comprehensive build issue fix script for the TAP Integration Platform
 * This script identifies and fixes several types of common build errors:
 * 
 * 1. Duplicate imports (MUI components imported both directly and via adapter)
 * 2. Duplicate exports in design system adapter
 * 3. HTML entity issues in JSX
 * 4. Syntax errors in template literals
 * 5. Single/double quote issues in string literals
 * 6. Missing display names
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const FIX_IMPORTS = !process.argv.includes('--skip-imports');
const FIX_EXPORTS = !process.argv.includes('--skip-exports');
const FIX_HTML_ENTITIES = !process.argv.includes('--skip-entities');
const FIX_TEMPLATE_LITERALS = !process.argv.includes('--skip-templates');
const FIX_DISPLAY_NAMES = !process.argv.includes('--skip-displaynames');

// Utility functions
function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌ ' : 
                 type === 'success' ? '✅ ' : 
                 type === 'warning' ? '⚠️ ' : 
                 type === 'info' ? 'ℹ️ ' : '';
  console.log(`${prefix}${message}`);
}

function logVerbose(message) {
  if (VERBOSE) {
    console.log(`   ${message}`);
  }
}

// Statistics tracking
const stats = {
  scannedFiles: 0,
  fixedImports: 0,
  fixedExports: 0,
  fixedHtmlEntities: 0,
  fixedTemplateLiterals: 0,
  fixedDisplayNames: 0,
  skippedFiles: 0,
  errorFiles: []
};

// 1. Fix duplicate imports
function fixDuplicateImports(content, filePath) {
  if (!FIX_IMPORTS) return { content, fixed: false };
  
  let fixed = false;
  const filename = path.basename(filePath);
  
  // Match Material UI imports
  const muiImportRegex = /import\s+{([^}]+)}\s+from\s+["']@mui\/material["'];/g;
  const adapterImportRegex = /import\s+{([^}]+)}\s+from\s+["']\.\.\/design-system\/adapter["'];/g;
  
  // Find all MUI and adapter imports
  const muiMatches = [...content.matchAll(muiImportRegex)];
  const adapterMatches = [...content.matchAll(adapterImportRegex)];
  
  if (muiMatches.length > 0 && adapterMatches.length > 0) {
    // Extract component names from both import types
    const muiComponents = muiMatches
      .flatMap(match => match[1].split(',').map(c => c.trim()))
      .filter(Boolean);
    
    const adapterComponents = adapterMatches
      .flatMap(match => match[1].split(',').map(c => c.trim()))
      .filter(Boolean);
    
    // Find duplicates (components imported from both sources)
    const duplicates = muiComponents.filter(comp => 
      adapterComponents.some(adapterComp => 
        adapterComp === comp || adapterComp.startsWith(comp + ' as ')
      )
    );
    
    if (duplicates.length > 0) {
      logVerbose(`Found ${duplicates.length} duplicate imports in ${filename}`);
      
      // For each duplicate, remove it from the MUI import
      duplicates.forEach(duplicate => {
        const escapedDuplicate = duplicate.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const duplicateRegex = new RegExp(`(\\s*|,\\s*)${escapedDuplicate}(\\s*,|\\s*)`, 'g');
        content = content.replace(duplicateRegex, '$2');
      });
      
      // Clean up any empty MUI imports that might be left
      content = content.replace(/import\s+{\s*}\s+from\s+["']@mui\/material["'];/g, '');
      
      fixed = true;
      stats.fixedImports += duplicates.length;
    }
  }
  
  return { content, fixed };
}

// 2. Fix duplicate exports in adapter file
function fixDuplicateExports(content, filePath) {
  if (!FIX_EXPORTS || !filePath.includes('design-system/adapter')) return { content, fixed: false };
  
  let fixed = false;
  const filename = path.basename(filePath);
  
  // Create a map to track all exports
  const exports = new Map();
  const exportLines = content.split('\n').filter(line => line.trim().startsWith('export {'));
  
  if (exportLines.length > 1) {
    logVerbose(`Found ${exportLines.length} export statements in ${filename}`);
    
    // Collect all exports
    const allExports = [];
    
    exportLines.forEach(line => {
      const match = line.match(/export\s+{([^}]+)}\s+from\s+["']([^"']+)["'];/);
      if (match) {
        const components = match[1].split(',').map(c => c.trim());
        const source = match[2];
        
        components.forEach(comp => {
          const name = comp.includes(' as ') ? comp.split(' as ')[1].trim() : comp;
          allExports.push({ name, component: comp, source });
        });
      }
    });
    
    // Find duplicates (same name exported multiple times)
    const uniqueExports = new Map();
    const duplicates = [];
    
    allExports.forEach(exp => {
      if (uniqueExports.has(exp.name)) {
        duplicates.push(exp.name);
      } else {
        uniqueExports.set(exp.name, exp);
      }
    });
    
    if (duplicates.length > 0) {
      logVerbose(`Found ${duplicates.length} duplicate exports in ${filename}`);
      
      // Build a new content with unique exports only
      const nonExportLines = content.split('\n').filter(line => !line.trim().startsWith('export {'));
      
      // Group exports by source
      const exportsBySource = new Map();
      
      uniqueExports.forEach(exp => {
        if (!exportsBySource.has(exp.source)) {
          exportsBySource.set(exp.source, []);
        }
        exportsBySource.get(exp.source).push(exp.component);
      });
      
      // Generate new export statements
      const newExportLines = [];
      
      exportsBySource.forEach((components, source) => {
        newExportLines.push(`export { ${components.join(', ')} } from '${source}';`);
      });
      
      // Combine everything back together
      content = [...nonExportLines, ...newExportLines].join('\n');
      
      fixed = true;
      stats.fixedExports += duplicates.length;
    }
  }
  
  return { content, fixed };
}

// 3. Fix HTML entity issues
function fixHtmlEntities(content, filePath) {
  if (!FIX_HTML_ENTITIES) return { content, fixed: false };
  
  let fixed = false;
  const filename = path.basename(filePath);
  
  // Replace common HTML entities with their proper string equivalents
  const originalContent = content;
  
  content = content
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  
  if (content !== originalContent) {
    logVerbose(`Fixed HTML entities in ${filename}`);
    fixed = true;
    stats.fixedHtmlEntities++;
  }
  
  return { content, fixed };
}

// 4. Fix template literal syntax errors
function fixTemplateLiterals(content, filePath) {
  if (!FIX_TEMPLATE_LITERALS) return { content, fixed: false };
  
  let fixed = false;
  const filename = path.basename(filePath);
  
  // Fix incorrect template literal syntax
  const wrongTemplateLiteralRegex = /["']\${(.*)}["']\`/g;
  
  if (wrongTemplateLiteralRegex.test(content)) {
    logVerbose(`Found template literal syntax errors in ${filename}`);
    
    content = content.replace(wrongTemplateLiteralRegex, '`${$1}`');
    
    fixed = true;
    stats.fixedTemplateLiterals++;
  }
  
  return { content, fixed };
}

// 5. Fix missing display names
function fixMissingDisplayNames(content, filePath) {
  if (!FIX_DISPLAY_NAMES) return { content, fixed: false };
  
  let fixed = false;
  const filename = path.basename(filePath);
  
  // First remove any duplicate display name additions
  const duplicateDisplayNameRegex = /(\/\/ Added display name\n\s+)([a-zA-Z0-9_]+)\.displayName = ['"][a-zA-Z0-9_]+['"];\n\n\s+(\/\/ Added display name\n\s+)([a-zA-Z0-9_]+)\.displayName = ['"][a-zA-Z0-9_]+['"];\n/g;
  
  if (duplicateDisplayNameRegex.test(content)) {
    content = content.replace(duplicateDisplayNameRegex, (match, prefix, funcName1, comment, funcName2) => {
      return `${prefix}${funcName1}.displayName = '${funcName1}';\n\n`;
    });
    fixed = true;
  }
  
  // Find function declarations without display names
  const functionRegex = /function\s+([A-Za-z][A-Za-z0-9_]*)\s*\(/g;
  const arrowFunctionRegex = /const\s+([A-Za-z][A-Za-z0-9_]*)\s*=\s*(?:React\.)?(?:useCallback|useMemo)?\s*\(\s*(?:\([^)]*\)|[^=]*)\s*=>\s*{/g;
  
  let functionMatches = [...content.matchAll(functionRegex)];
  let arrowFunctionMatches = [...content.matchAll(arrowFunctionRegex)];
  
  // Combine all function names
  const allFunctions = [
    ...functionMatches.map(m => m[1]),
    ...arrowFunctionMatches.map(m => m[1])
  ];
  
  // Check which ones don't have displayName set
  const functionsWithoutDisplayName = allFunctions.filter(funcName => {
    const displayNameRegex = new RegExp(`${funcName}\\.displayName\\s*=`, 'g');
    return !displayNameRegex.test(content);
  });
  
  if (functionsWithoutDisplayName.length > 0) {
    logVerbose(`Found ${functionsWithoutDisplayName.length} functions without display names in ${filename}`);
    
    // For each function, insert a display name
    functionsWithoutDisplayName.forEach(funcName => {
      // Find the function declaration
      const functionDeclarationRegex = new RegExp(`(function\\s+${funcName}\\s*\\([^)]*\\)\\s*{)`, 'g');
      const arrowFunctionDeclarationRegex = new RegExp(`(const\\s+${funcName}\\s*=\\s*(?:React\\.)?(?:useCallback|useMemo)?\\s*\\([^=]*\\s*=>\\s*{)`, 'g');
      
      if (functionDeclarationRegex.test(content)) {
        content = content.replace(functionDeclarationRegex, (match, declaration) => {
          return `${declaration}\n  // Added display name\n  ${funcName}.displayName = '${funcName}';\n`;
        });
      } else if (arrowFunctionDeclarationRegex.test(content)) {
        // For arrow functions, insert the display name after the opening brace
        content = content.replace(arrowFunctionDeclarationRegex, (match, declaration) => {
          return `${declaration}\n  // Added display name\n  ${funcName}.displayName = '${funcName}';\n`;
        });
      }
    });
    
    fixed = true;
    stats.fixedDisplayNames += functionsWithoutDisplayName.length;
  }
  
  return { content, fixed };
}

// Process a single file with all fixers
function processFile(filePath) {
  try {
    stats.scannedFiles++;
    
    // Skip node_modules
    if (filePath.includes('node_modules')) {
      stats.skippedFiles++;
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Apply all fixers in sequence
    let currentContent = content;
    let anyFixes = false;
    
    // Apply each fixer
    const importResult = fixDuplicateImports(currentContent, filePath);
    currentContent = importResult.content;
    anyFixes = anyFixes || importResult.fixed;
    
    const exportResult = fixDuplicateExports(currentContent, filePath);
    currentContent = exportResult.content;
    anyFixes = anyFixes || exportResult.fixed;
    
    const entityResult = fixHtmlEntities(currentContent, filePath);
    currentContent = entityResult.content;
    anyFixes = anyFixes || entityResult.fixed;
    
    const templateResult = fixTemplateLiterals(currentContent, filePath);
    currentContent = templateResult.content;
    anyFixes = anyFixes || templateResult.fixed;
    
    const displayNameResult = fixMissingDisplayNames(currentContent, filePath);
    currentContent = displayNameResult.content;
    anyFixes = anyFixes || displayNameResult.fixed;
    
    // Write back the file if any changes were made
    if (anyFixes) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, currentContent, 'utf8');
        log(`Fixed issues in ${path.relative(rootDir, filePath)}`, 'success');
      } else {
        log(`Would fix issues in ${path.relative(rootDir, filePath)} (dry run)`, 'info');
      }
    }
  } catch (error) {
    log(`Error processing ${filePath}: ${error.message}`, 'error');
    stats.errorFiles.push(filePath);
  }
}

// Main execution
function main() {
  log(`Starting build issue fix script (${DRY_RUN ? 'DRY RUN' : 'LIVE RUN'})`, 'info');
  
  // Get all JavaScript and JSX files
  const jsFiles = glob.sync(`${rootDir}/src/**/*.{js,jsx}`);
  
  // Process each file
  jsFiles.forEach(processFile);
  
  // Also process specific test files
  const testFiles = glob.sync(`${rootDir}/src/tests/**/*.{js,jsx}`);
  testFiles.forEach(processFile);
  
  // Print summary
  log('\nFix Summary:', 'info');
  log(`Scanned files: ${stats.scannedFiles}`);
  log(`Fixed imports: ${stats.fixedImports} in ${stats.fixedImports > 0 ? 'multiple' : '0'} files`);
  log(`Fixed exports: ${stats.fixedExports} in ${stats.fixedExports > 0 ? 'adapter.js' : '0'}`);
  log(`Fixed HTML entities: ${stats.fixedHtmlEntities} files`);
  log(`Fixed template literals: ${stats.fixedTemplateLiterals} files`);
  log(`Fixed display names: ${stats.fixedDisplayNames} functions`);
  
  if (stats.errorFiles.length > 0) {
    log(`\nErrors occurred in ${stats.errorFiles.length} files:`, 'warning');
    stats.errorFiles.forEach(file => {
      log(`  - ${path.relative(rootDir, file)}`, 'warning');
    });
  }
  
  log(`\nDone ${DRY_RUN ? '(dry run)' : ''}`, 'success');
}

// Run the script
main();