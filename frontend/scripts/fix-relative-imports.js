#!/usr/bin/env node

/**
 * fix-relative-imports.js
 * 
 * Script to fix incorrect relative imports with imports that use the webpack aliases
 * This addresses webpack build errors with imports outside the src directory
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const srcDir = path.resolve(__dirname, '../src');
const pattern = '**/*.{js,jsx,ts,tsx}';
const dryRun = process.argv.includes('--dry-run');

// Define common paths and their aliases
const pathMappings = [
  { path: 'utils', alias: '@utils' },
  { path: 'components', alias: '@components' },
  { path: 'contexts', alias: '@contexts' },
  { path: 'hooks', alias: '@hooks' },
  { path: 'services', alias: '@services' },
  { path: 'pages', alias: '@pages' },
  { path: 'design-system', alias: '@design-system' },
  { path: 'assets', alias: '@assets' },
  { path: 'config', alias: '@config' },
  { path: 'tests', alias: '@tests' }
];

// Find all matching files
const files = glob.sync(pattern, { cwd: srcDir, absolute: true });

console.log(`🔍 Scanning ${files.length} files for incorrect relative imports...`);

let fileCount = 0;
let importCount = 0;

// Process each file
files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Get the directory depth relative to src
  const relativePath = path.relative(srcDir, path.dirname(filePath));
  const depth = relativePath.split(path.sep).length;
  
  // Skip files in src root
  if (depth === 0) return;

  // Process each mapping
  pathMappings.forEach(({ path: dirPath, alias }) => {
    // Look for relative imports that go up to src and then to the mapped directory
    const backToSrc = '../'.repeat(depth);
    const pattern = new RegExp(`import\\s+(.+?)\\s+from\\s+(['\`"])${backToSrc}${dirPath}(/[^'"\`]+)\\2`, 'g');
    
    const newContent = content.replace(pattern, (match, importNames, quote, subPath) => {
      modified = true;
      importCount++;
      return `import ${importNames} from ${quote}${alias}${subPath}${quote}`;
    });

    if (newContent !== content) {
      content = newContent;
    }
  });

  // Also fix deep relative imports with a simpler pattern
  const deepRelativePattern = /(import\s+.+?\s+from\s+['"`])(\.\.\/){3,}([^'"`]+)(['"`])/g;
  const newContent = content.replace(deepRelativePattern, (match, importStart, dots, importPath, quote) => {
    // Try to match the import path with an alias
    for (const { path: dirPath, alias } of pathMappings) {
      if (importPath.startsWith(dirPath + '/')) {
        modified = true;
        importCount++;
        return `${importStart}${alias}/${importPath.substring(dirPath.length + 1)}${quote}`;
      }
    }
    return match; // No matching alias
  });

  if (newContent !== content) {
    content = newContent;
    modified = true;
  }

  // Write the changes back to the file
  if (modified) {
    fileCount++;
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in ${path.relative(srcDir, filePath)}`);
    } else {
      console.log(`🔍 Would fix imports in ${path.relative(srcDir, filePath)}`);
    }
  }
});

console.log('\n=== Relative Import Fix Summary ===');
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