/**
 * ReleasesManager.jsx Fix Script
 * 
 * This script specifically fixes the malformed import issue in ReleasesManager.jsx
 * where there is an import statement that spans multiple lines incorrectly.
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = '/home/ai-dev/Desktop/tap-integration-platform/frontend/src/components/admin/ReleasesManager.jsx';

// Fix the specific import issue in ReleasesManager.jsx
const fixReleasesManagerImports = () => {
  console.log(`Fixing malformed imports in ${FILE_PATH}`);
  
  try {
    const content = fs.readFileSync(FILE_PATH, 'utf8');
    
    // First fix the problematic import statement
    // The issue is at lines 41-42 where there's a malformed import statement
    const fixedContent = content.replace(
      /import {(\s*)\nimport Tab/,
      `import {
  Tab,
  getReleases`
    );
    
    // Write the fixed content back to the file
    fs.writeFileSync(FILE_PATH, fixedContent, 'utf8');
    
    console.log('Successfully fixed ReleasesManager.jsx');
    return true;
  } catch (error) {
    console.error(`Error fixing ${FILE_PATH}:`, error);
    return false;
  }
};

// Main execution
const main = async () => {
  try {
    // Check if the file exists
    if (!fs.existsSync(FILE_PATH)) {
      console.error(`File not found: ${FILE_PATH}`);
      return;
    }
    
    // Fix the file
    const success = fixReleasesManagerImports();
    if (success) {
      console.log('Fix successful!');
    } else {
      console.log('Fix failed.');
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
};

main();