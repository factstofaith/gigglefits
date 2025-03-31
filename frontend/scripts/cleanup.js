#!/usr/bin/env node

/**
 * Project Cleanup Script
 * 
 * This script organizes the frontend project structure by:
 * 1. Moving deprecated files to an archive directory
 * 2. Organizing logs and reports
 * 3. Cleaning up temporary files
 * 4. Standardizing directory structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Config
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ARCHIVE_DIR = path.join(PROJECT_ROOT, 'archive');
const LOGS_DIR = path.join(ARCHIVE_DIR, 'logs');
const BACKUPS_DIR = path.join(ARCHIVE_DIR, 'backups');
const REPORTS_DIR = path.join(ARCHIVE_DIR, 'reports');
const DEPRECATED_DIR = path.join(ARCHIVE_DIR, 'deprecated');

// Create directory structure if it doesn't exist
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Initialize directory structure
function initDirectories() {
  [ARCHIVE_DIR, LOGS_DIR, BACKUPS_DIR, REPORTS_DIR, DEPRECATED_DIR].forEach(ensureDirExists);
  
  // Create subdirectories for organization
  ensureDirExists(path.join(DEPRECATED_DIR, 'components'));
  ensureDirExists(path.join(DEPRECATED_DIR, 'design-system'));
  ensureDirExists(path.join(DEPRECATED_DIR, 'utils'));
  ensureDirExists(path.join(DEPRECATED_DIR, 'services'));
  ensureDirExists(path.join(DEPRECATED_DIR, 'contexts'));
  ensureDirExists(path.join(DEPRECATED_DIR, 'docs'));
}

// Move files matching patterns to archive directories
function moveFilesToArchive() {
  // Move build logs to logs directory
  moveFiles(PROJECT_ROOT, LOGS_DIR, /build_.*\.log$/);
  moveFiles(PROJECT_ROOT, LOGS_DIR, /build_.*\.txt$/);
  moveFiles(PROJECT_ROOT, LOGS_DIR, /.*_audit\.log$/);
  
  // Move backup files to backups directory
  moveFiles(PROJECT_ROOT, BACKUPS_DIR, /\.bak$/);
  moveFiles(PROJECT_ROOT, BACKUPS_DIR, /\.backup$/);
  
  // Move reports to reports directory
  moveFiles(PROJECT_ROOT, REPORTS_DIR, /report.*\.html$/);
  moveFiles(PROJECT_ROOT, REPORTS_DIR, /report.*\.json$/);
  moveFiles(PROJECT_ROOT, REPORTS_DIR, /analysis.*\.json$/);
  moveFiles(PROJECT_ROOT, REPORTS_DIR, /analysis.*\.txt$/);
  
  // Move content from cleanup-archive to deprecated directory
  if (fs.existsSync(path.join(PROJECT_ROOT, 'src', 'cleanup-archive'))) {
    moveDirectoryContents(
      path.join(PROJECT_ROOT, 'src', 'cleanup-archive', 'components'),
      path.join(DEPRECATED_DIR, 'components')
    );
    
    moveDirectoryContents(
      path.join(PROJECT_ROOT, 'src', 'cleanup-archive', 'design-system'),
      path.join(DEPRECATED_DIR, 'design-system')
    );
    
    moveDirectoryContents(
      path.join(PROJECT_ROOT, 'src', 'cleanup-archive', 'utils'),
      path.join(DEPRECATED_DIR, 'utils')
    );
    
    moveDirectoryContents(
      path.join(PROJECT_ROOT, 'src', 'cleanup-archive', 'services'),
      path.join(DEPRECATED_DIR, 'services')
    );
    
    moveDirectoryContents(
      path.join(PROJECT_ROOT, 'src', 'cleanup-archive', 'docs'),
      path.join(DEPRECATED_DIR, 'docs')
    );
  }
}

// Helper function to move files matching a pattern
function moveFiles(sourceDir, targetDir, pattern) {
  try {
    const files = fs.readdirSync(sourceDir);
    
    files.forEach(file => {
      const filePath = path.join(sourceDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile() && pattern.test(file)) {
        const targetPath = path.join(targetDir, file);
        fs.renameSync(filePath, targetPath);
        console.log(`Moved ${filePath} to ${targetPath}`);
      }
    });
  } catch (error) {
    console.error(`Error moving files: ${error.message}`);
  }
}

// Helper function to move directory contents
function moveDirectoryContents(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }
  
  ensureDirExists(targetDir);
  
  try {
    const items = fs.readdirSync(sourceDir);
    
    items.forEach(item => {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);
      
      const stats = fs.statSync(sourcePath);
      
      if (stats.isFile()) {
        fs.renameSync(sourcePath, targetPath);
        console.log(`Moved ${sourcePath} to ${targetPath}`);
      } else if (stats.isDirectory()) {
        ensureDirExists(targetPath);
        moveDirectoryContents(sourcePath, targetPath);
      }
    });
  } catch (error) {
    console.error(`Error moving directory contents: ${error.message}`);
  }
}

// Clean up temporary files
function cleanupTemporaryFiles() {
  const filesToRemove = [
    path.join(PROJECT_ROOT, 'fix_all_mui_imports.js'),
    path.join(PROJECT_ROOT, 'fix_duplicate_mui_imports.js')
  ];
  
  filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Removed temporary file: ${file}`);
    }
  });
}

// Create a README file in the archive directory
function createArchiveReadme() {
  const readmeContent = `# Archive Directory

This directory contains archived and deprecated files from the TAP Integration Platform project.

## Structure

- \`backups/\`: Backup files created during development
- \`deprecated/\`: Deprecated components, utilities, and code that has been replaced
- \`logs/\`: Build logs and error logs
- \`reports/\`: Analysis reports and test results

These files are kept for reference but are no longer actively used in the project.
`;

  fs.writeFileSync(path.join(ARCHIVE_DIR, 'README.md'), readmeContent);
  console.log(`Created README.md in ${ARCHIVE_DIR}`);
}

// Main execution
function main() {
  console.log('Starting project cleanup...');
  
  initDirectories();
  moveFilesToArchive();
  cleanupTemporaryFiles();
  createArchiveReadme();
  
  console.log('Project cleanup completed successfully!');
}

main();