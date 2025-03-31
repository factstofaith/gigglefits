#!/usr/bin/env node

/**
 * Cleanup Executor
 * 
 * Automates file cleanup based on analysis results.
 * IMPORTANT: This script performs actual file modifications.
 * Always review changes and ensure adequate tests before running.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const CONFIG = {
  reportsDir: '../cleanup-reports',
  archiveDir: '../archive/cleanup-backups',
  backupDir: '../archive/pre-cleanup-backup',
  cleanupActions: ['remove-unused-imports', 'fix-formatting', 'archive-deprecated'],
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
 * Load cleanup analysis data from a report file
 */
function loadAnalysisData(reportFile) {
  console.log(`Loading analysis data from: ${reportFile}`);
  
  const absPath = path.resolve(__dirname, reportFile);
  
  if (!fs.existsSync(absPath)) {
    throw new Error(`Report file not found: ${absPath}`);
  }
  
  const jsonData = fs.readFileSync(absPath, 'utf8');
  return JSON.parse(jsonData);
}

/**
 * Remove unused imports from JavaScript/TypeScript files
 */
function removeUnusedImports(analysisData) {
  console.log('Removing unused imports...');
  
  const { unusedImports } = analysisData;
  
  if (!unusedImports || unusedImports.length === 0) {
    console.log('No unused imports to remove.');
    return [];
  }
  
  // Group unused imports by file
  const fileImports = {};
  
  unusedImports.forEach(imp => {
    if (!fileImports[imp.file]) {
      fileImports[imp.file] = [];
    }
    fileImports[imp.file].push(imp);
  });
  
  const modifiedFiles = [];
  
  // Process each file
  Object.entries(fileImports).forEach(([file, imports]) => {
    const absPath = path.resolve(__dirname, '../', file);
    
    if (!fs.existsSync(absPath)) {
      console.warn(`Warning: File not found: ${absPath}`);
      return;
    }
    
    let content = fs.readFileSync(absPath, 'utf8');
    const lines = content.split('\n');
    
    // Sort imports by line number in descending order to avoid offset issues
    imports.sort((a, b) => b.line - a.line);
    
    // Process each import
    let modified = false;
    
    imports.forEach(imp => {
      const lineIdx = imp.line - 1;
      
      if (lineIdx >= 0 && lineIdx < lines.length) {
        const line = lines[lineIdx];
        
        // Remove entire import statement if it's just for this import
        if (line.includes(`import ${imp.import} from`) || 
            line.includes(`import { ${imp.import} } from`)) {
          console.log(`${CONFIG.dryRun ? '[DRY RUN] ' : ''}Removing line: ${line.trim()}`);
          
          if (!CONFIG.dryRun) {
            lines.splice(lineIdx, 1);
            modified = true;
          }
        }
        // Remove import from destructured import list
        else if (line.includes(`{ ${imp.import},`) || line.includes(`, ${imp.import} }`) || line.includes(`, ${imp.import},`)) {
          const newLine = line
            .replace(`{ ${imp.import}, `, '{ ')
            .replace(`, ${imp.import} }`, ' }')
            .replace(`, ${imp.import},`, ',');
          
          console.log(`${CONFIG.dryRun ? '[DRY RUN] ' : ''}Modifying import line:`);
          console.log(`  From: ${line.trim()}`);
          console.log(`  To:   ${newLine.trim()}`);
          
          if (!CONFIG.dryRun) {
            lines[lineIdx] = newLine;
            modified = true;
          }
        }
      }
    });
    
    // Write changes back to file
    if (modified && !CONFIG.dryRun) {
      fs.writeFileSync(absPath, lines.join('\n'));
      modifiedFiles.push(file);
    }
  });
  
  console.log(`${CONFIG.dryRun ? '[DRY RUN] ' : ''}Removed unused imports from ${modifiedFiles.length} files.`);
  
  return modifiedFiles;
}

/**
 * Fix file formatting using ESLint/Prettier
 */
function fixFormatting(files) {
  console.log('Fixing file formatting...');
  
  if (!files || files.length === 0) {
    console.log('No files to format.');
    return [];
  }
  
  const modifiedFiles = [];
  
  // Process each file
  files.forEach(file => {
    const absPath = path.resolve(__dirname, '../', file);
    
    if (!fs.existsSync(absPath)) {
      console.warn(`Warning: File not found: ${absPath}`);
      return;
    }
    
    // Only format JS/TS files
    if (!file.endsWith('.js') && !file.endsWith('.jsx') && 
        !file.endsWith('.ts') && !file.endsWith('.tsx')) {
      return;
    }
    
    try {
      // Use ESLint to fix the file
      console.log(`${CONFIG.dryRun ? '[DRY RUN] ' : ''}Formatting: ${file}`);
      
      if (!CONFIG.dryRun) {
        execSync(`npx eslint --fix "${absPath}"`, { stdio: 'ignore' });
        modifiedFiles.push(file);
      }
    } catch (error) {
      console.warn(`Warning: Error formatting file ${file}:`, error.message);
    }
  });
  
  console.log(`${CONFIG.dryRun ? '[DRY RUN] ' : ''}Formatted ${modifiedFiles.length} files.`);
  
  return modifiedFiles;
}

/**
 * Archive deprecated files
 */
function archiveDeprecatedFiles(analysisData, confirmList) {
  console.log('Archiving deprecated files...');
  
  if (!confirmList || confirmList.length === 0) {
    console.log('No files to archive.');
    return [];
  }
  
  const archivedFiles = [];
  const archivePath = path.join(CONFIG.archiveDir, getFormattedDate());
  
  if (!CONFIG.dryRun) {
    fs.mkdirSync(archivePath, { recursive: true });
  }
  
  // Process each file
  confirmList.forEach(file => {
    const absPath = path.resolve(__dirname, '../', file);
    
    if (!fs.existsSync(absPath)) {
      console.warn(`Warning: File not found: ${absPath}`);
      return;
    }
    
    const archiveFilePath = path.join(archivePath, file);
    
    console.log(`${CONFIG.dryRun ? '[DRY RUN] ' : ''}Archiving: ${file}`);
    
    if (!CONFIG.dryRun) {
      // Create directory structure if needed
      const archiveDir = path.dirname(archiveFilePath);
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }
      
      // Copy file to archive
      fs.copyFileSync(absPath, archiveFilePath);
      
      // Remove original file
      fs.unlinkSync(absPath);
      
      archivedFiles.push(file);
    }
  });
  
  console.log(`${CONFIG.dryRun ? '[DRY RUN] ' : ''}Archived ${archivedFiles.length} files to: ${archivePath}`);
  
  return archivedFiles;
}

/**
 * Interactive CLI for confirming file archiving
 */
async function getArchiveConfirmation(analysisData) {
  const { unusedFiles } = analysisData;
  
  if (!unusedFiles) {
    return [];
  }
  
  const jsFiles = unusedFiles.jsFiles || [];
  const tsFiles = unusedFiles.tsFiles || [];
  const pyFiles = unusedFiles.pyFiles || [];
  
  const allFiles = [...jsFiles, ...tsFiles, ...pyFiles];
  
  if (allFiles.length === 0) {
    return [];
  }
  
  // Create interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  console.log('\nPotentially unused files that could be archived:');
  
  // Display files with numbers
  allFiles.forEach((file, index) => {
    console.log(`[${index + 1}] ${file}`);
  });
  
  try {
    console.log('\nEnter file numbers to archive (comma-separated), "all" to archive all, or "none" to skip:');
    const answer = await question('> ');
    
    if (answer.toLowerCase() === 'none') {
      return [];
    }
    
    if (answer.toLowerCase() === 'all') {
      return allFiles;
    }
    
    // Parse selected numbers
    const selected = answer.split(',')
      .map(num => num.trim())
      .filter(num => num.match(/^\d+$/))
      .map(num => parseInt(num, 10) - 1)
      .filter(index => index >= 0 && index < allFiles.length)
      .map(index => allFiles[index]);
    
    return selected;
  } finally {
    rl.close();
  }
}

/**
 * Generate execution report
 */
function generateReport(executionData) {
  console.log('Generating execution report...');
  
  const {
    timestamp,
    analysisFile,
    unusedImportsRemoved,
    formattedFiles,
    archivedFiles,
    backupPath
  } = executionData;
  
  const reportFile = path.join(CONFIG.reportsDir, `cleanup-execution-${timestamp}.md`);
  
  let report = `# File Cleanup Execution Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  report += `Analysis Data: ${path.basename(analysisFile)}\n`;
  report += `Backup: ${backupPath}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Unused imports removed: ${unusedImportsRemoved.length}\n`;
  report += `- Files reformatted: ${formattedFiles.length}\n`;
  report += `- Files archived: ${archivedFiles.length}\n\n`;
  
  report += `## Detailed Changes\n\n`;
  
  report += `### Removed Unused Imports\n\n`;
  if (unusedImportsRemoved.length > 0) {
    unusedImportsRemoved.forEach(file => {
      report += `- ${file}\n`;
    });
  } else {
    report += `No unused imports were removed.\n`;
  }
  
  report += `\n### Reformatted Files\n\n`;
  if (formattedFiles.length > 0) {
    formattedFiles.forEach(file => {
      report += `- ${file}\n`;
    });
  } else {
    report += `No files were reformatted.\n`;
  }
  
  report += `\n### Archived Files\n\n`;
  if (archivedFiles.length > 0) {
    archivedFiles.forEach(file => {
      report += `- ${file}\n`;
    });
  } else {
    report += `No files were archived.\n`;
  }
  
  fs.writeFileSync(reportFile, report);
  
  console.log(`Execution report generated: ${reportFile}`);
  
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
  
  // Get analysis data file path from arguments or use latest
  let analysisFile = process.argv.find(arg => arg.startsWith('--data='))?.substring(7);
  
  if (!analysisFile) {
    // Find the latest analysis data file
    const reportsDir = path.resolve(__dirname, CONFIG.reportsDir);
    
    if (!fs.existsSync(reportsDir)) {
      throw new Error(`Reports directory not found: ${reportsDir}`);
    }
    
    const dataFiles = fs.readdirSync(reportsDir)
      .filter(file => file.startsWith('cleanup-data-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (dataFiles.length === 0) {
      throw new Error('No analysis data files found. Run file-cleanup.js first.');
    }
    
    analysisFile = path.join(CONFIG.reportsDir, dataFiles[0]);
  }
  
  console.log(`Using analysis data: ${analysisFile}`);
  
  // Load analysis data
  const analysisData = loadAnalysisData(analysisFile);
  
  // Get confirmation for files to archive
  const filesToArchive = await getArchiveConfirmation(analysisData);
  
  // Collect all files that will be modified
  const filesToModify = [];
  
  // Add files with unused imports
  if (analysisData.unusedImports) {
    analysisData.unusedImports.forEach(imp => {
      if (!filesToModify.includes(imp.file)) {
        filesToModify.push(imp.file);
      }
    });
  }
  
  // Add files to archive
  filesToArchive.forEach(file => {
    if (!filesToModify.includes(file)) {
      filesToModify.push(file);
    }
  });
  
  // Create backup
  const backupPath = CONFIG.dryRun ? 'No backup created in dry run mode' : createBackup(filesToModify);
  
  // Execute cleanup actions
  const executionData = {
    timestamp: getFormattedDate(),
    analysisFile,
    unusedImportsRemoved: [],
    formattedFiles: [],
    archivedFiles: [],
    backupPath
  };
  
  // Execute selected actions
  if (CONFIG.cleanupActions.includes('remove-unused-imports')) {
    executionData.unusedImportsRemoved = removeUnusedImports(analysisData);
  }
  
  if (CONFIG.cleanupActions.includes('fix-formatting')) {
    executionData.formattedFiles = fixFormatting(executionData.unusedImportsRemoved);
  }
  
  if (CONFIG.cleanupActions.includes('archive-deprecated')) {
    executionData.archivedFiles = archiveDeprecatedFiles(analysisData, filesToArchive);
  }
  
  // Generate report
  const reportFile = generateReport(executionData);
  
  // Final output
  console.log('\nCleanup execution complete!');
  console.log(`Report: ${reportFile}`);
  
  if (CONFIG.dryRun) {
    console.log('\nThis was a DRY RUN. No actual changes were made.');
    console.log('To execute changes, run with --execute flag.');
  } else {
    console.log('\nChanges have been applied successfully.');
    console.log(`A backup was created at: ${backupPath}`);
  }
}

// Run the script
main().catch(error => {
  console.error('Error executing cleanup:', error);
  process.exit(1);
});