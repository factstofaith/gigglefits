/**
 * Format check script
 * This script runs Prettier on specific files to validate formatting
 * It's more efficient than running on the entire codebase at once.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const BATCH_SIZE = 20; // Process files in batches to avoid memory issues

// Get all JS and JSX files recursively
function getJsFiles(dir, files = []) {
  const dirContents = fs.readdirSync(dir);
  
  dirContents.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getJsFiles(fullPath, files);
    } else if (/\.(js|jsx)$/.test(item)) {
      files.push(fullPath);
    }
  });
  
  return files;
}

// Process files in batches
function processBatches(files) {
  const batches = [];
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    batches.push(files.slice(i, i + BATCH_SIZE));
  }
  
  let totalIssues = 0;
  let issueFiles = [];
  
  console.log(`Processing ${files.length} files in ${batches.length} batches...`);
  
  batches.forEach((batch, index) => {
    console.log(`Batch ${index + 1}/${batches.length} (${batch.length} files)`);
    
    try {
      // Run Prettier check on the batch
      const filePaths = batch.join(' ');
      execSync(`npx prettier --check ${filePaths}`, { stdio: 'pipe' });
    } catch (error) {
      // Extract files with issues from the error output
      const output = error.stdout.toString();
      const issues = output.split('\n').filter(line => line.startsWith('[warn]'));
      
      totalIssues += issues.length;
      issues.forEach(issue => {
        const file = issue.replace('[warn] ', '').trim();
        issueFiles.push(file);
      });
    }
  });
  
  // Print summary
  if (totalIssues > 0) {
    console.log(`\nFound formatting issues in ${totalIssues} files:`);
    issueFiles.forEach(file => {
      console.log(`- ${file}`);
    });
    console.log(`\nRun 'npm run format' to fix these issues.`);
  } else {
    console.log(`\nAll files are properly formatted!`);
  }
  
  return totalIssues;
}

// Execute the script
try {
  console.log('Checking file formatting with Prettier...');
  const jsFiles = getJsFiles(SRC_DIR);
  console.log(`Found ${jsFiles.length} JS/JSX files.`);
  
  const issues = processBatches(jsFiles);
  process.exit(issues > 0 ? 1 : 0);
} catch (error) {
  console.error('Error running format check:', error);
  process.exit(1);
}