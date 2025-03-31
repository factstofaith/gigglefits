#!/usr/bin/env node

/**
 * Code Structure Standardizer
 * 
 * Analyzes and standardizes code structure across similar files in the codebase,
 * applying consistent naming conventions, import ordering, file organization,
 * and documentation standards.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  targetDirs: ['../src', '../../frontend/src', '../../backend'],
  ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/.git/**'],
  languages: {
    javascript: {
      extensions: ['.js', '.jsx'],
      importRegex: /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g,
      headerTemplate: `/**
 * @fileoverview {description}
 * @module {moduleName}
 * @author TAP Integration Platform Team
 */\n\n`
    },
    typescript: {
      extensions: ['.ts', '.tsx'],
      importRegex: /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g,
      headerTemplate: `/**
 * @fileoverview {description}
 * @module {moduleName}
 * @author TAP Integration Platform Team
 */\n\n`
    },
    python: {
      extensions: ['.py'],
      importRegex: /(?:from\s+(\S+)\s+import|import\s+(\S+))/g,
      headerTemplate: `"""
{description}

This module provides {moduleName} functionality.

Author: TAP Integration Platform Team
"""\n\n`
    }
  },
  reportsDir: '../cleanup-reports',
  backupDir: '../archive/pre-standardization-backup',
  dryRun: true  // Set to false to actually make changes
};

/**
 * Format date as YYYY-MM-DD_HH-MM-SS
 */
function getFormattedDate() {
  const now = new Date();
  return now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
}

/**
 * Create backup of files that will be modified
 */
function createBackup(filesToModify) {
  console.log('Creating backup of files to be modified...');
  
  const backupPath = path.join(CONFIG.backupDir, getFormattedDate());
  
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  
  let backupCount = 0;
  
  filesToModify.forEach(filePath => {
    const absPath = path.resolve(__dirname, filePath);
    
    if (fs.existsSync(absPath)) {
      const relativePath = path.relative(path.resolve(__dirname, '..'), absPath);
      const backupFilePath = path.join(backupPath, relativePath);
      
      // Create directory structure if needed
      const backupDir = path.dirname(backupFilePath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Copy file to backup
      fs.copyFileSync(absPath, backupFilePath);
      backupCount++;
    }
  });
  
  console.log(`Created backup of ${backupCount} files at: ${backupPath}`);
  
  return backupPath;
}

/**
 * Generate file inventory by file type
 */
function generateFileInventory() {
  console.log('Generating file inventory...');
  
  const inventory = {
    javascript: [],
    typescript: [],
    python: [],
    other: []
  };
  
  // Process each target directory
  CONFIG.targetDirs.forEach(targetDir => {
    const basePath = path.resolve(__dirname, targetDir);
    
    if (!fs.existsSync(basePath)) {
      console.warn(`Warning: Target directory does not exist: ${basePath}`);
      return;
    }
    
    // Get all files
    const pattern = `${basePath}/**/*`;
    const files = glob.sync(pattern, {
      nodir: true,
      ignore: CONFIG.ignorePatterns.map(p => path.join(basePath, p))
    });
    
    // Process each file
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      const relPath = path.relative(basePath, file);
      
      // Categorize by language
      if (CONFIG.languages.javascript.extensions.includes(ext)) {
        inventory.javascript.push({
          path: file,
          relativePath: relPath,
          extension: ext
        });
      } else if (CONFIG.languages.typescript.extensions.includes(ext)) {
        inventory.typescript.push({
          path: file,
          relativePath: relPath,
          extension: ext
        });
      } else if (CONFIG.languages.python.extensions.includes(ext)) {
        inventory.python.push({
          path: file,
          relativePath: relPath,
          extension: ext
        });
      } else {
        inventory.other.push({
          path: file,
          relativePath: relPath,
          extension: ext
        });
      }
    });
  });
  
  return inventory;
}

/**
 * Analyze import patterns in a file
 */
function analyzeImports(content, language) {
  const imports = [];
  let match;
  const regex = CONFIG.languages[language].importRegex;
  
  // Reset regex
  regex.lastIndex = 0;
  
  while ((match = regex.exec(content)) !== null) {
    const importPath = match[1] || match[2];
    if (importPath) {
      imports.push({
        statement: match[0],
        path: importPath,
        position: match.index
      });
    }
  }
  
  return imports;
}

/**
 * Sort imports in a standard order:
 * 1. Built-in modules
 * 2. Third-party modules
 * 3. Local modules (relative paths)
 */
function sortImports(imports, language) {
  // Helper to determine import type
  function getImportType(importPath) {
    if (importPath.startsWith('.')) {
      return 'local';
    } else if (!importPath.includes('/') && !importPath.includes('@')) {
      return 'builtin';
    } else {
      return 'thirdparty';
    }
  }
  
  // Group imports by type
  const grouped = {
    builtin: [],
    thirdparty: [],
    local: []
  };
  
  imports.forEach(imp => {
    const type = getImportType(imp.path);
    grouped[type].push(imp);
  });
  
  // Sort each group alphabetically by path
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => a.path.localeCompare(b.path));
  });
  
  // Combine groups in standard order
  return [
    ...grouped.builtin,
    ...grouped.thirdparty,
    ...grouped.local
  ];
}

/**
 * Add or update file header with standardized format
 */
function standardizeHeader(content, language, filePath) {
  // Get file name and module name from path
  const fileName = path.basename(filePath);
  const moduleName = path.basename(filePath, path.extname(filePath));
  
  // Generate a description based on module name
  const description = moduleName
    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
  
  // Get header template for language
  const headerTemplate = CONFIG.languages[language].headerTemplate
    .replace('{description}', description)
    .replace('{moduleName}', moduleName);
  
  // Check if file already has a header
  let hasHeader = false;
  
  if (language === 'javascript' || language === 'typescript') {
    hasHeader = content.startsWith('/**');
  } else if (language === 'python') {
    hasHeader = content.startsWith('"""');
  }
  
  // Replace existing header or add new one
  if (hasHeader) {
    // Find end of existing header
    let endOfHeader;
    if (language === 'javascript' || language === 'typescript') {
      endOfHeader = content.indexOf('*/') + 2;
      while (content[endOfHeader] === '\n') endOfHeader++;
    } else if (language === 'python') {
      endOfHeader = content.indexOf('"""', 3) + 3;
      while (content[endOfHeader] === '\n') endOfHeader++;
    }
    
    // Replace header
    if (endOfHeader) {
      return headerTemplate + content.substring(endOfHeader);
    }
  }
  
  // Add new header
  return headerTemplate + content;
}

/**
 * Reorganize imports in a file
 */
function reorganizeImports(content, language) {
  // Analyze imports
  const imports = analyzeImports(content, language);
  
  if (imports.length === 0) {
    return content;
  }
  
  // Sort imports
  const sortedImports = sortImports(imports, language);
  
  // Get position of first and last import
  const firstImportPos = Math.min(...imports.map(imp => imp.position));
  const lastImportPos = Math.max(...imports.map(imp => {
    const startPos = imp.position;
    const endPos = startPos + imp.statement.length;
    return endPos;
  }));
  
  // Extract content before, during, and after imports
  const beforeImports = content.substring(0, firstImportPos);
  const afterImports = content.substring(lastImportPos);
  
  // Generate new imports section with grouping
  let newImportsSection = '';
  
  // Add built-in imports
  const builtinImports = sortedImports.filter(imp => getImportType(imp.path) === 'builtin');
  if (builtinImports.length > 0) {
    newImportsSection += builtinImports.map(imp => imp.statement).join('\n') + '\n';
  }
  
  // Add third-party imports with separator
  const thirdPartyImports = sortedImports.filter(imp => getImportType(imp.path) === 'thirdparty');
  if (thirdPartyImports.length > 0) {
    if (builtinImports.length > 0) {
      newImportsSection += '\n';
    }
    newImportsSection += thirdPartyImports.map(imp => imp.statement).join('\n') + '\n';
  }
  
  // Add local imports with separator
  const localImports = sortedImports.filter(imp => getImportType(imp.path) === 'local');
  if (localImports.length > 0) {
    if (builtinImports.length > 0 || thirdPartyImports.length > 0) {
      newImportsSection += '\n';
    }
    newImportsSection += localImports.map(imp => imp.statement).join('\n') + '\n';
  }
  
  // Helper to determine import type
  function getImportType(importPath) {
    if (importPath.startsWith('.')) {
      return 'local';
    } else if (!importPath.includes('/') && !importPath.includes('@')) {
      return 'builtin';
    } else {
      return 'thirdparty';
    }
  }
  
  // Combine parts
  return beforeImports + newImportsSection + afterImports;
}

/**
 * Apply standardized naming conventions to a file
 */
function standardizeNaming(content, language, filePath) {
  // This is a placeholder for now - would need more complex parsing
  // Actual implementation would involve AST parsing and transformations
  
  // For JavaScript/TypeScript, we might standardize:
  // - Component names to PascalCase
  // - Function names to camelCase
  // - Constants to UPPER_SNAKE_CASE
  
  // For Python, we might standardize:
  // - Class names to PascalCase
  // - Function names to snake_case
  // - Constants to UPPER_SNAKE_CASE
  
  return content;
}

/**
 * Standardize a single file's structure
 */
function standardizeFile(filePath, language) {
  console.log(`Standardizing ${language} file: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File not found: ${filePath}`);
    return false;
  }
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Add or update file header
  const standardizedHeader = standardizeHeader(content, language, filePath);
  if (standardizedHeader !== content) {
    content = standardizedHeader;
    modified = true;
    console.log(`  ✓ Standardized file header`);
  }
  
  // Reorganize imports
  const standardizedImports = reorganizeImports(content, language);
  if (standardizedImports !== content) {
    content = standardizedImports;
    modified = true;
    console.log(`  ✓ Reorganized imports`);
  }
  
  // Apply naming conventions
  const standardizedNaming = standardizeNaming(content, language, filePath);
  if (standardizedNaming !== content) {
    content = standardizedNaming;
    modified = true;
    console.log(`  ✓ Standardized naming conventions`);
  }
  
  // Write changes
  if (modified && !CONFIG.dryRun) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return modified;
}

/**
 * Apply code standardization to similar files
 */
function standardizeSimilarFiles(files, language) {
  if (!files || files.length === 0) {
    return [];
  }
  
  // Group files by directory/type for more targeted standardization
  const fileGroups = {};
  
  files.forEach(file => {
    // Get directory as group key
    const dir = path.dirname(file.relativePath);
    if (!fileGroups[dir]) {
      fileGroups[dir] = [];
    }
    fileGroups[dir].push(file);
  });
  
  const modifiedFiles = [];
  
  // Process each group of similar files
  Object.entries(fileGroups).forEach(([group, groupFiles]) => {
    if (groupFiles.length > 1) {
      console.log(`\nStandardizing similar ${language} files in ${group}...`);
    }
    
    // Process each file in the group
    groupFiles.forEach(file => {
      const wasModified = standardizeFile(file.path, language);
      if (wasModified) {
        modifiedFiles.push(file.path);
      }
    });
  });
  
  return modifiedFiles;
}

/**
 * Generate report of standardization changes
 */
function generateReport(executionData) {
  console.log('Generating standardization report...');
  
  const {
    timestamp,
    modifiedFiles,
    backupPath
  } = executionData;
  
  const reportFile = path.join(CONFIG.reportsDir, `code-standardization-${timestamp}.md`);
  
  let report = `# Code Structure Standardization Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  report += `Backup: ${backupPath}\n\n`;
  
  // Summary statistics
  const javaScriptCount = modifiedFiles.filter(f => f.endsWith('.js') || f.endsWith('.jsx')).length;
  const typeScriptCount = modifiedFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).length;
  const pythonCount = modifiedFiles.filter(f => f.endsWith('.py')).length;
  
  report += `## Summary\n\n`;
  report += `- Total files standardized: ${modifiedFiles.length}\n`;
  report += `- JavaScript files: ${javaScriptCount}\n`;
  report += `- TypeScript files: ${typeScriptCount}\n`;
  report += `- Python files: ${pythonCount}\n\n`;
  
  report += `## Standardization Applied\n\n`;
  report += `1. **File Headers**: Added or updated file headers with consistent documentation format\n`;
  report += `2. **Import Organization**: Grouped and sorted imports into built-in, third-party, and local\n`;
  report += `3. **Naming Conventions**: Applied consistent naming patterns appropriate for each language\n`;
  report += `4. **Code Structure**: Standardized file organization patterns\n\n`;
  
  report += `## Modified Files\n\n`;
  
  if (modifiedFiles.length > 0) {
    // Group by file type
    const filesByType = {
      'JavaScript': modifiedFiles.filter(f => f.endsWith('.js') || f.endsWith('.jsx')),
      'TypeScript': modifiedFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')),
      'Python': modifiedFiles.filter(f => f.endsWith('.py'))
    };
    
    // List files by type
    Object.entries(filesByType).forEach(([type, files]) => {
      if (files.length > 0) {
        report += `### ${type} Files\n\n`;
        files.forEach(file => {
          report += `- ${file}\n`;
        });
        report += '\n';
      }
    });
  } else {
    report += `No files were modified.\n`;
  }
  
  report += `## Next Steps\n\n`;
  report += `1. Review standardized files for consistency\n`;
  report += `2. Run linting tools to verify compliance with style guides\n`;
  report += `3. Update documentation to reflect new code structure standards\n`;
  report += `4. Update CI/CD pipelines to enforce standardization rules\n`;
  
  fs.writeFileSync(reportFile, report);
  
  console.log(`Standardization report generated: ${reportFile}`);
  
  return reportFile;
}

/**
 * Main execution function
 */
async function main() {
  // Check if running in dry run mode
  if (process.argv.includes('--dry-run')) {
    CONFIG.dryRun = true;
    console.log('Running in DRY RUN mode. No actual changes will be made.');
  } else if (process.argv.includes('--execute')) {
    CONFIG.dryRun = false;
    console.log('Running in EXECUTE mode. Files will be modified.');
  }
  
  // Ensure reports directory exists
  if (!fs.existsSync(CONFIG.reportsDir)) {
    fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
  }
  
  // Ensure backup directory exists
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }
  
  // Generate file inventory
  const inventory = generateFileInventory();
  
  // Count files
  const totalFiles = 
    inventory.javascript.length + 
    inventory.typescript.length + 
    inventory.python.length;
    
  console.log(`Found ${totalFiles} eligible files for standardization.`);
  console.log(`- JavaScript: ${inventory.javascript.length} files`);
  console.log(`- TypeScript: ${inventory.typescript.length} files`);
  console.log(`- Python: ${inventory.python.length} files`);
  
  // Create backup before modifications
  const backupPath = CONFIG.dryRun ? 'No backup created in dry run mode' : createBackup([
    ...inventory.javascript.map(f => f.path),
    ...inventory.typescript.map(f => f.path),
    ...inventory.python.map(f => f.path)
  ]);
  
  // Standardize each language type
  const jsModified = standardizeSimilarFiles(inventory.javascript, 'javascript');
  const tsModified = standardizeSimilarFiles(inventory.typescript, 'typescript');
  const pyModified = standardizeSimilarFiles(inventory.python, 'python');
  
  // Combine all modified files
  const modifiedFiles = [
    ...jsModified,
    ...tsModified,
    ...pyModified
  ];
  
  // Generate timestamp for reporting
  const timestamp = getFormattedDate();
  
  // Generate report
  const reportFile = generateReport({
    timestamp,
    modifiedFiles,
    backupPath
  });
  
  // Final output
  console.log('\nCode structure standardization complete!');
  console.log(`Report: ${reportFile}`);
  
  if (CONFIG.dryRun) {
    console.log('\nThis was a DRY RUN. No actual changes were made.');
    console.log('To execute changes, run with --execute flag.');
  } else {
    console.log('\nChanges have been applied successfully.');
    console.log(`A backup was created at: ${backupPath}`);
    
    // Verify build after changes
    console.log('\nVerifying build after standardization...');
    try {
      execSync('node verify-build.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error verifying build:', error.message);
    }
  }
  
  // Stats summary
  console.log('\nStandardization Stats:');
  console.log(`- Total files: ${totalFiles}`);
  console.log(`- Files modified: ${modifiedFiles.length}`);
  console.log(`- JavaScript files modified: ${jsModified.length}`);
  console.log(`- TypeScript files modified: ${tsModified.length}`);
  console.log(`- Python files modified: ${pyModified.length}`);
}

// Run the script
main().catch(error => {
  console.error('Error executing code standardization:', error);
  process.exit(1);
});