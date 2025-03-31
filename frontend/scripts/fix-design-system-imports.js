#!/usr/bin/env node

/**
 * fix-design-system-imports.js
 * 
 * Script to fix incorrect design system imports from ../design-system/adapter to ./design-system
 * This addresses the webpack build error with imports outside the src directory
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const srcDir = path.resolve(__dirname, '../src');
const pattern = '**/*.{js,jsx,ts,tsx}';
const dryRun = process.argv.includes('--dry-run');

// Find all matching files
const files = glob.sync(pattern, { cwd: srcDir, absolute: true });

console.log(`🔍 Scanning ${files.length} files for incorrect design system imports...`);

let fileCount = 0;
let importCount = 0;

// Process each file
files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has the incorrect import pattern
  if (content.includes('../design-system/adapter')) {
    const originalContent = content;
    
    // Calculate the relative path to src/design-system based on the file's location
    const relativePath = path.relative(path.dirname(filePath), srcDir);
    const designSystemPath = path.join(relativePath, 'design-system').replace(/\\/g, '/');
    
    // Replace the incorrect imports with the correct path
    content = content.replace(
      /import\s+(.+?)\s+from\s+(['"]).+?\/design-system\/adapter\2/g,
      `import $1 from $2${designSystemPath}$2`
    );
    
    content = content.replace(
      /import\s+(.+?)\s+from\s+(['"]).+?\/design-system\/adapter\.js\2/g,
      `import $1 from $2${designSystemPath}$2`
    );
    
    // Write the changes back to the file
    if (content !== originalContent) {
      fileCount++;
      importCount += (originalContent.match(/(\.\.\/design-system\/adapter)/g) || []).length;
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed imports in ${path.relative(srcDir, filePath)}`);
      } else {
        console.log(`🔍 Would fix imports in ${path.relative(srcDir, filePath)}`);
      }
    }
  }
});

console.log('\n=== Import Fix Summary ===');
console.log(`Files processed: ${files.length}`);
console.log(`Files fixed: ${fileCount}`);
console.log(`Import statements fixed: ${importCount}`);

if (dryRun) {
  console.log('\n⚠️ Dry run completed. No files were modified.');
  console.log('Run the script without --dry-run to apply changes.');
} else if (fileCount > 0) {
  console.log('\n✅ Successfully fixed imports in all files.');
} else {
  console.log('\n✅ No files needed fixing.');
}