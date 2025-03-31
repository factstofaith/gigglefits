#!/usr/bin/env node

/**
 * File Cleanup Script
 * 
 * Analyzes project files to identify cleanup targets including:
 * - Deprecated files that are no longer referenced
 * - Duplicate code across files
 * - Unused imports
 * - Large files that could be modularized
 * - Inconsistent formatting
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  targetDirs: ['../src', '../../frontend/src', '../../backend'],
  ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/.git/**'],
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.py'],
  reportsDir: '../cleanup-reports',
  archiveDir: '../archive/cleanup-backups',
};

// Ensure reports directory exists
if (!fs.existsSync(CONFIG.reportsDir)) {
  fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
}

// Ensure archive directory exists
if (!fs.existsSync(CONFIG.archiveDir)) {
  fs.mkdirSync(CONFIG.archiveDir, { recursive: true });
}

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
 * Generate file inventory by directory
 */
function generateFileInventory() {
  console.log('Generating file inventory...');
  
  const inventory = {
    totalFiles: 0,
    byExtension: {},
    byDirectory: {},
    largeFiles: [],
    emptyFiles: [],
    oldFiles: []
  };
  
  // Process each target directory
  CONFIG.targetDirs.forEach(targetDir => {
    const basePath = path.resolve(__dirname, targetDir);
    
    if (!fs.existsSync(basePath)) {
      console.warn(`Warning: Target directory does not exist: ${basePath}`);
      return;
    }
    
    // Get all matching files
    const pattern = `${basePath}/**/*`;
    const files = glob.sync(pattern, {
      nodir: true,
      ignore: CONFIG.ignorePatterns.map(p => path.join(basePath, p))
    });
    
    // Process each file
    files.forEach(file => {
      const stats = fs.statSync(file);
      const ext = path.extname(file).toLowerCase();
      const relPath = path.relative(basePath, file);
      const dir = path.dirname(relPath);
      
      // Skip if not a target extension and not a config file
      if (!CONFIG.extensions.includes(ext) && 
          !file.includes('package.json') && 
          !file.includes('.eslintrc') && 
          !file.includes('.babelrc') &&
          !file.includes('tsconfig.json')) {
        return;
      }
      
      // Count files by extension
      inventory.byExtension[ext] = (inventory.byExtension[ext] || 0) + 1;
      
      // Count files by directory
      inventory.byDirectory[dir] = (inventory.byDirectory[dir] || 0) + 1;
      
      // Track large files (>1000 lines or >100KB)
      if (stats.size > 100 * 1024) {
        inventory.largeFiles.push({
          path: relPath,
          size: Math.round(stats.size / 1024) + ' KB'
        });
      } else if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx' || ext === '.py') {
        // Count lines for code files
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').length;
        
        if (lines > 1000) {
          inventory.largeFiles.push({
            path: relPath,
            lines,
            size: Math.round(stats.size / 1024) + ' KB'
          });
        }
        
        // Track empty or near-empty files
        if (lines < 5 && content.trim().length < 100) {
          inventory.emptyFiles.push({
            path: relPath,
            lines,
            size: Math.round(stats.size / 1024) + ' KB'
          });
        }
      }
      
      // Track old files (not modified in last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      if (stats.mtime < sixMonthsAgo) {
        inventory.oldFiles.push({
          path: relPath,
          lastModified: stats.mtime.toISOString().split('T')[0]
        });
      }
      
      inventory.totalFiles++;
    });
  });
  
  // Sort results
  inventory.largeFiles.sort((a, b) => {
    return (b.lines || 0) - (a.lines || 0); 
  });
  
  inventory.oldFiles.sort((a, b) => {
    return a.lastModified.localeCompare(b.lastModified);
  });
  
  return inventory;
}

/**
 * Detect potentially unused files
 */
function detectUnusedFiles() {
  console.log('Detecting potentially unused files...');
  
  const unused = {
    jsFiles: [],
    tsFiles: [],
    pyFiles: []
  };
  
  // Process each target directory
  CONFIG.targetDirs.forEach(targetDir => {
    const basePath = path.resolve(__dirname, targetDir);
    
    if (!fs.existsSync(basePath)) {
      return;
    }
    
    // Find JS/TS files
    const jsFiles = glob.sync(`${basePath}/**/*.{js,jsx,ts,tsx}`, {
      ignore: CONFIG.ignorePatterns.map(p => path.join(basePath, p))
    });
    
    // Find Python files
    const pyFiles = glob.sync(`${basePath}/**/*.py`, {
      ignore: CONFIG.ignorePatterns.map(p => path.join(basePath, p))
    });
    
    // Check JS/TS files for import/require usage
    jsFiles.forEach(file => {
      const relPath = path.relative(basePath, file);
      const fileName = path.basename(file);
      
      // Skip index files, config files, and test files
      if (fileName === 'index.js' || 
          fileName === 'index.ts' || 
          fileName.includes('.config.') || 
          fileName.includes('.test.') || 
          fileName.includes('.spec.')) {
        return;
      }
      
      // Skip main app files
      if (fileName === 'App.js' || 
          fileName === 'App.jsx' || 
          fileName === 'App.ts' || 
          fileName === 'App.tsx' || 
          fileName === 'main.js' || 
          fileName === 'index.js') {
        return;
      }
      
      // Get file name without extension for searching
      const baseName = path.basename(file).replace(/\.(js|jsx|ts|tsx)$/, '');
      
      // Skip if it's a common component name
      if (['Button', 'Input', 'Modal', 'Card', 'Table', 'Form'].includes(baseName)) {
        return;
      }
      
      // Search for imports/requires of this file
      let isUsed = false;
      
      const importPatterns = [
        `import.*from.*['"](\\.\\.?/)*${baseName}['"]`,
        `import.*['"]${fileName}['"]`,
        `require\\(['"](\\.\\./)*${baseName}['"]\\)`,
        `require\\(['"]${fileName}['"]\\)`
      ];
      
      // Check all files for imports
      for (const otherFile of jsFiles) {
        if (otherFile === file) continue;
        
        const content = fs.readFileSync(otherFile, 'utf8');
        
        for (const pattern of importPatterns) {
          if (new RegExp(pattern).test(content)) {
            isUsed = true;
            break;
          }
        }
        
        if (isUsed) break;
      }
      
      if (!isUsed) {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          unused.tsFiles.push(relPath);
        } else {
          unused.jsFiles.push(relPath);
        }
      }
    });
    
    // Check Python files for import usage (simplified)
    pyFiles.forEach(file => {
      const relPath = path.relative(basePath, file);
      const fileName = path.basename(file);
      
      // Skip __init__ files, test files
      if (fileName === '__init__.py' || 
          fileName.includes('test_') || 
          fileName.includes('conftest.py')) {
        return;
      }
      
      // Get module name
      const moduleName = fileName.replace('.py', '');
      
      // Check if this module is imported anywhere else
      let isUsed = false;
      
      for (const otherFile of pyFiles) {
        if (otherFile === file) continue;
        
        const content = fs.readFileSync(otherFile, 'utf8');
        
        if (content.includes(`import ${moduleName}`) || 
            content.includes(`from . import ${moduleName}`) ||
            content.includes(`from .. import ${moduleName}`) ||
            content.includes(`from ${moduleName} import`) ||
            content.includes(`import ${moduleName}.`)) {
          isUsed = true;
          break;
        }
      }
      
      if (!isUsed) {
        unused.pyFiles.push(relPath);
      }
    });
  });
  
  return unused;
}

/**
 * Detect duplicate code across files (simple detection)
 */
function detectDuplicateCode() {
  console.log('Detecting duplicate code segments...');
  
  const MIN_LINES = 5; // Minimum duplicate code block size
  const SIMILARITY_THRESHOLD = 0.95; // 95% similarity to count as duplicate
  
  const duplicates = [];
  
  // Process each target directory
  CONFIG.targetDirs.forEach(targetDir => {
    const basePath = path.resolve(__dirname, targetDir);
    
    if (!fs.existsSync(basePath)) {
      return;
    }
    
    // Find code files by extension group
    ['js,jsx', 'ts,tsx', 'py'].forEach(extGroup => {
      const files = glob.sync(`${basePath}/**/*.{${extGroup}}`, {
        ignore: CONFIG.ignorePatterns.map(p => path.join(basePath, p))
      });
      
      // Skip if less than 2 files
      if (files.length < 2) return;
      
      // Compare each file with every other file
      for (let i = 0; i < files.length; i++) {
        const fileContent = fs.readFileSync(files[i], 'utf8');
        const fileLines = fileContent.split('\n');
        
        // Skip very small files or files with mostly empty lines
        if (fileLines.length < MIN_LINES * 2) continue;
        
        // Process file in chunks
        for (let lineIdx = 0; lineIdx < fileLines.length - MIN_LINES; lineIdx += MIN_LINES) {
          const chunk = fileLines.slice(lineIdx, lineIdx + MIN_LINES).join('\n').trim();
          
          // Skip empty chunks or chunks with very little code
          if (chunk.length < 50) continue;
          
          // Check this chunk against other files
          for (let j = i + 1; j < files.length; j++) {
            const otherContent = fs.readFileSync(files[j], 'utf8');
            
            // Skip exact file duplicates
            if (fileContent === otherContent) continue;
            
            if (otherContent.includes(chunk)) {
              duplicates.push({
                file1: path.relative(basePath, files[i]),
                file2: path.relative(basePath, files[j]),
                lineNumber: lineIdx + 1,
                length: MIN_LINES,
                preview: chunk.substring(0, 100) + '...'
              });
              
              // Don't check this chunk against other files
              break;
            }
          }
        }
      }
    });
  });
  
  return duplicates;
}

/**
 * Detect unused imports in JS/TS files
 */
function detectUnusedImports() {
  console.log('Detecting unused imports...');
  
  const unusedImports = [];
  
  // Process each target directory
  CONFIG.targetDirs.forEach(targetDir => {
    if (targetDir.includes('backend')) {
      // Skip backend for now, as we'd need a Python-specific approach
      return;
    }
    
    const basePath = path.resolve(__dirname, targetDir);
    
    if (!fs.existsSync(basePath)) {
      return;
    }
    
    // Find JS/TS files
    const files = glob.sync(`${basePath}/**/*.{js,jsx,ts,tsx}`, {
      ignore: CONFIG.ignorePatterns.map(p => path.join(basePath, p))
    });
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      // Extract imports
      const importLines = [];
      const importedItems = [];
      
      lines.forEach((line, index) => {
        // Match import statements
        const importMatch = line.match(/^import\s+{([^}]+)}/);
        if (importMatch) {
          const items = importMatch[1].split(',').map(s => s.trim());
          
          importLines.push({ line, index });
          importedItems.push(...items);
        }
        
        // Match simple imports
        const simpleImportMatch = line.match(/^import\s+(\w+)\s+from/);
        if (simpleImportMatch) {
          importLines.push({ line, index });
          importedItems.push(simpleImportMatch[1]);
        }
      });
      
      // Check if each imported item is used
      importedItems.forEach(item => {
        // Clean up item if it has aliases
        const cleanItem = item.split(' as ')[0].trim();
        
        // Skip React as it's used implicitly
        if (cleanItem === 'React') return;
        
        // Count appearances in file (excluding the import line)
        const pattern = new RegExp(`\\b${cleanItem}\\b`, 'g');
        let count = 0;
        let importLineIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          // Skip the import lines themselves
          if (importLines.some(il => il.index === i)) {
            if (lines[i].includes(`import ${cleanItem}`) || lines[i].includes(`{ ${cleanItem}`)) {
              importLineIndex = i;
            }
            continue;
          }
          
          // Count matches in code
          const matches = lines[i].match(pattern);
          if (matches) {
            count += matches.length;
          }
        }
        
        // If imported item isn't used
        if (count === 0 && importLineIndex >= 0) {
          unusedImports.push({
            file: path.relative(basePath, file),
            line: importLineIndex + 1,
            import: cleanItem,
            statement: lines[importLineIndex].trim()
          });
        }
      });
    });
  });
  
  return unusedImports;
}

/**
 * Main execution function
 */
async function main() {
  console.log('Starting file cleanup analysis...');
  const timestamp = getFormattedDate();
  const reportFile = path.join(CONFIG.reportsDir, `cleanup-analysis-${timestamp}.md`);
  const jsonReportFile = path.join(CONFIG.reportsDir, `cleanup-data-${timestamp}.json`);
  
  // Generate inventory
  const inventory = generateFileInventory();
  
  // Detect unused files
  const unusedFiles = detectUnusedFiles();
  
  // Detect duplicate code
  const duplicateCode = detectDuplicateCode();
  
  // Detect unused imports
  const unusedImports = detectUnusedImports();
  
  // Compile report data
  const reportData = {
    timestamp,
    inventory,
    unusedFiles,
    duplicateCode,
    unusedImports
  };
  
  // Write JSON data for programmatic use
  fs.writeFileSync(jsonReportFile, JSON.stringify(reportData, null, 2));
  
  // Create markdown report
  let report = `# File Cleanup Analysis Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Total files: ${inventory.totalFiles}\n`;
  report += `- Potentially unused files: ${unusedFiles.jsFiles.length + unusedFiles.tsFiles.length + unusedFiles.pyFiles.length}\n`;
  report += `- Files with duplicate code segments: ${duplicateCode.length}\n`;
  report += `- Files with unused imports: ${unusedImports.length}\n`;
  report += `- Large files (>1000 lines or >100KB): ${inventory.largeFiles.length}\n`;
  report += `- Empty or near-empty files: ${inventory.emptyFiles.length}\n`;
  report += `- Files not modified in 6+ months: ${inventory.oldFiles.length}\n\n`;
  
  report += `## File Distribution\n\n`;
  report += `### By File Extension\n\n`;
  report += `| Extension | Count |\n`;
  report += `|-----------|-------|\n`;
  Object.entries(inventory.byExtension)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ext, count]) => {
      report += `| ${ext || '(none)'} | ${count} |\n`;
    });
  
  report += `\n### Top Directories by File Count\n\n`;
  report += `| Directory | Count |\n`;
  report += `|-----------|-------|\n`;
  Object.entries(inventory.byDirectory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([dir, count]) => {
      report += `| ${dir || '(root)'} | ${count} |\n`;
    });
  
  report += `\n## Cleanup Candidates\n\n`;
  
  report += `### Large Files (>1000 lines or >100KB)\n\n`;
  if (inventory.largeFiles.length > 0) {
    report += `| File | Lines | Size |\n`;
    report += `|------|-------|------|\n`;
    inventory.largeFiles.forEach(file => {
      report += `| ${file.path} | ${file.lines || 'N/A'} | ${file.size} |\n`;
    });
  } else {
    report += `No large files detected.\n`;
  }
  
  report += `\n### Potentially Unused JavaScript Files\n\n`;
  if (unusedFiles.jsFiles.length > 0) {
    report += `**Note**: False positives are possible. Please verify before deletion.\n\n`;
    report += unusedFiles.jsFiles.map(file => `- ${file}`).join('\n');
  } else {
    report += `No potentially unused JavaScript files detected.\n`;
  }
  
  report += `\n### Potentially Unused TypeScript Files\n\n`;
  if (unusedFiles.tsFiles.length > 0) {
    report += `**Note**: False positives are possible. Please verify before deletion.\n\n`;
    report += unusedFiles.tsFiles.map(file => `- ${file}`).join('\n');
  } else {
    report += `No potentially unused TypeScript files detected.\n`;
  }
  
  report += `\n### Potentially Unused Python Files\n\n`;
  if (unusedFiles.pyFiles.length > 0) {
    report += `**Note**: False positives are likely with Python imports. Verify carefully.\n\n`;
    report += unusedFiles.pyFiles.map(file => `- ${file}`).join('\n');
  } else {
    report += `No potentially unused Python files detected.\n`;
  }
  
  report += `\n### Files with Duplicate Code\n\n`;
  if (duplicateCode.length > 0) {
    report += `| File 1 | File 2 | Line Number | Preview |\n`;
    report += `|--------|--------|-------------|--------|\n`;
    duplicateCode.forEach(dup => {
      report += `| ${dup.file1} | ${dup.file2} | ${dup.lineNumber} | \`${dup.preview.substring(0, 50).replace(/\n/g, ' ')}\` |\n`;
    });
  } else {
    report += `No significant duplicate code detected.\n`;
  }
  
  report += `\n### Unused Imports\n\n`;
  if (unusedImports.length > 0) {
    report += `| File | Line | Import | Statement |\n`;
    report += `|------|------|--------|----------|\n`;
    unusedImports.forEach(imp => {
      report += `| ${imp.file} | ${imp.line} | ${imp.import} | \`${imp.statement}\` |\n`;
    });
  } else {
    report += `No unused imports detected.\n`;
  }
  
  report += `\n### Empty or Near-Empty Files\n\n`;
  if (inventory.emptyFiles.length > 0) {
    report += `| File | Lines | Size |\n`;
    report += `|------|-------|------|\n`;
    inventory.emptyFiles.forEach(file => {
      report += `| ${file.path} | ${file.lines} | ${file.size} |\n`;
    });
  } else {
    report += `No empty files detected.\n`;
  }
  
  report += `\n## Recommended Actions\n\n`;
  report += `1. **Verify and remove unused files**: Start with JS/TS files as they are easier to verify.\n`;
  report += `2. **Fix unused imports**: These are safe to remove and will clean up dependencies.\n`;
  report += `3. **Refactor large files**: Break them into smaller modules for better maintainability.\n`;
  report += `4. **Address duplicate code**: Extract repeated code into shared utilities.\n`;
  report += `5. **Remove empty files**: After verifying they aren't needed for scaffolding or placeholders.\n`;
  
  report += `\n## Next Steps\n\n`;
  report += `1. Run a more detailed analysis on specific directories identified as problematic\n`;
  report += `2. Implement automated testing to ensure cleanup doesn't break functionality\n`;
  report += `3. Create a priority cleanup plan based on technical debt impact\n`;
  report += `4. Set up linting rules to prevent future similar issues\n`;
  
  // Write report
  fs.writeFileSync(reportFile, report);
  
  console.log(`Analysis complete! Report saved to: ${reportFile}`);
  console.log(`JSON data saved to: ${jsonReportFile}`);
  console.log('\nSummary:');
  console.log(`- Total files analyzed: ${inventory.totalFiles}`);
  console.log(`- Potentially unused files: ${unusedFiles.jsFiles.length + unusedFiles.tsFiles.length + unusedFiles.pyFiles.length}`);
  console.log(`- Files with duplicate code: ${duplicateCode.length}`);
  console.log(`- Files with unused imports: ${unusedImports.length}`);
  console.log(`- Large files (>1000 lines or >100KB): ${inventory.largeFiles.length}`);
}

// Run the script
main().catch(error => {
  console.error('Error executing cleanup analysis:', error);
  process.exit(1);
});