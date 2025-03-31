/**
 * Script to archive outdated design system migration tests
 * 
 * This script moves all design system migration test files to an archive directory
 * to clean up the tests folder while preserving the history of migration tests.
 */

const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourceDir = path.join(__dirname, '..', 'src', 'tests', 'design-system');
const destDir = path.join(__dirname, '..', 'src', 'tests', 'archive', 'design-system');

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Get all files in the source directory
const files = fs.readdirSync(sourceDir);

// Move each file to the destination directory
let movedCount = 0;
files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);
  
  // Only move files, not directories
  if (fs.statSync(sourcePath).isFile()) {
    try {
      fs.renameSync(sourcePath, destPath);
      console.log(`Moved: ${file}`);
      movedCount++;
    } catch (err) {
      console.error(`Error moving ${file}: ${err.message}`);
    }
  }
});

console.log(`\nArchive complete! Moved ${movedCount} design system migration test files.`);
console.log(`Files are now in: ${destDir}`);
