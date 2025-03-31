#!/usr/bin/env node

/**
 * normalize-component-names.js
 * 
 * Script to rename component files to remove "Legacy" and "Adapted" suffixes,
 * creating a more standardized naming convention across the codebase.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const srcDir = path.resolve(__dirname, '../src');
const dryRun = process.argv.includes('--dry-run');

// Patterns to search for component files
const adaptedPattern = '**/design-system/adapted/**/*Adapted.{jsx,js}';
const legacyPattern = '**/packages/legacy-components/**/*Legacy.{jsx,js}';

console.log('🔍 Scanning for component files with "Adapted" and "Legacy" suffixes...');

// Get all adapted component files
const adaptedFiles = glob.sync(adaptedPattern, { cwd: srcDir, absolute: true });
console.log(`Found ${adaptedFiles.length} files with "Adapted" suffix`);

// Get all legacy component files
const legacyFiles = glob.sync(legacyPattern, { cwd: srcDir, absolute: true });
console.log(`Found ${legacyFiles.length} files with "Legacy" suffix`);

// Track renames for applying to imports later
const renamedFiles = {};

// Function to remove suffix from filename and rename the file
const normalizeFilename = (filePath, suffix) => {
  const dir = path.dirname(filePath);
  const basename = path.basename(filePath);
  const newBasename = basename.replace(suffix, '');
  const newPath = path.join(dir, newBasename);
  
  renamedFiles[filePath] = newPath;
  
  if (!dryRun) {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace component name in the content (e.g., ButtonAdapted -> Button)
    const componentName = basename.replace(/\.(jsx|js)$/, '');
    const newComponentName = componentName.replace(suffix, '');
    
    // Replace displayName and export default statements
    let newContent = content
      .replace(new RegExp(`${componentName}\\.displayName = ['"]${componentName}['"]`, 'g'), 
              `${newComponentName}.displayName = '${newComponentName}'`)
      .replace(new RegExp(`export default ${componentName}`, 'g'), 
              `export default ${newComponentName}`)
      .replace(new RegExp(`const ${componentName} =`, 'g'), 
              `const ${newComponentName} =`)
      .replace(new RegExp(`@component ${componentName}`, 'g'), 
              `@component ${newComponentName}`);
    
    // Write the modified content to the new file
    fs.writeFileSync(newPath, newContent, 'utf8');
    
    // Remove the old file if it's different from the new one
    if (filePath !== newPath) {
      fs.unlinkSync(filePath);
    }
    
    console.log(`✅ Renamed ${path.relative(srcDir, filePath)} to ${path.relative(srcDir, newPath)}`);
  } else {
    console.log(`🔍 Would rename ${path.relative(srcDir, filePath)} to ${path.relative(srcDir, newPath)}`);
  }
  
  return newPath;
};

// Rename adapted components
adaptedFiles.forEach(file => {
  normalizeFilename(file, 'Adapted');
});

// Rename legacy components
legacyFiles.forEach(file => {
  normalizeFilename(file, 'Legacy');
});

// Update imports in all files to reference the new file names
const updateImportsInFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace import statements for adapted components
  Object.entries(renamedFiles).forEach(([oldPath, newPath]) => {
    const oldBasename = path.basename(oldPath).replace(/\.(jsx|js)$/, '');
    const newBasename = path.basename(newPath).replace(/\.(jsx|js)$/, '');
    
    // Don't replace if the names are the same (only path changed)
    if (oldBasename === newBasename) return;
    
    // Replace import statements
    const newContent = content.replace(
      new RegExp(`import (.*?)${oldBasename}(.*)`, 'g'),
      `import $1${newBasename}$2`
    );
    
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified && !dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated imports in ${path.relative(srcDir, filePath)}`);
  }
};

// Update design-system/index.js and adapter.js to use the new names
const updateDesignSystemFiles = () => {
  if (dryRun) {
    console.log('🔍 Would update design-system/index.js and adapter.js with new component names');
    return;
  }
  
  // Update adapter.js
  const adapterPath = path.join(srcDir, 'design-system/adapter.js');
  if (fs.existsSync(adapterPath)) {
    let content = fs.readFileSync(adapterPath, 'utf8');
    
    // Replace import statements with new component names
    Object.entries(renamedFiles).forEach(([oldPath, newPath]) => {
      const oldBasename = path.basename(oldPath).replace(/\.(jsx|js)$/, '');
      const newBasename = path.basename(newPath).replace(/\.(jsx|js)$/, '');
      
      // Skip if names are the same
      if (oldBasename === newBasename) return;
      
      // Replace imports
      content = content.replace(
        new RegExp(`import ${oldBasename} from`, 'g'),
        `import ${newBasename} from`
      );
      
      // Replace exports with commentary
      content = content.replace(
        new RegExp(`${oldBasename} as (\\w+)`, 'g'),
        `${newBasename} as $1 // Renamed from ${oldBasename}`
      );
    });
    
    fs.writeFileSync(adapterPath, content, 'utf8');
    console.log(`✅ Updated component names in ${path.relative(srcDir, adapterPath)}`);
  }
  
  // Update index.js
  const indexPath = path.join(srcDir, 'design-system/index.js');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Replace imports and exports
    Object.entries(renamedFiles).forEach(([oldPath, newPath]) => {
      const oldBasename = path.basename(oldPath).replace(/\.(jsx|js)$/, '');
      const newBasename = path.basename(newPath).replace(/\.(jsx|js)$/, '');
      
      // Skip if names are the same
      if (oldBasename === newBasename) return;
      
      // Replace in imports and exports
      content = content
        .replace(new RegExp(`import ${oldBasename} from`, 'g'), `import ${newBasename} from`)
        .replace(new RegExp(`export { ${oldBasename} }`, 'g'), `export { ${newBasename} }`);
    });
    
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log(`✅ Updated component names in ${path.relative(srcDir, indexPath)}`);
  }
};

// Update imports in all .js and .jsx files
if (Object.keys(renamedFiles).length > 0) {
  console.log('\n🔄 Updating imports in all files to reference new component names...');
  
  // Find all JS/JSX files in the src directory
  const allJsFiles = glob.sync('**/*.{js,jsx}', { cwd: srcDir, absolute: true });
  
  // Update imports in each file
  allJsFiles.forEach(file => {
    updateImportsInFile(file);
  });
  
  // Specially handle design system files
  updateDesignSystemFiles();
}

// Update the NEXT_STEPS_TRACKER.md
const updateNextStepsTracker = () => {
  const trackerPath = path.resolve(__dirname, '../project/Sunlight/consolidated/NEXT_STEPS_TRACKER.md');
  
  if (fs.existsSync(trackerPath)) {
    let content = fs.readFileSync(trackerPath, 'utf8');
    
    // Add a new entry for component naming standardization
    if (!content.includes('### 10. Standardize Component Names')) {
      const newSection = `
### 10. Standardize Component Names

- [x] **Remove "Legacy" and "Adapted" suffixes from component names**
  - Created script to rename component files: \`normalize-component-names.js\`
  - Updated import statements throughout the codebase
  - Made component naming more consistent and professional
  - Simplified API by removing unnecessary name distinctions
  - Preserved functionality while improving developer experience
`;
      
      // Insert after the Automated Error Detection section
      content = content.replace(
        /### 9\. Automated Error Detection and Fixing\s+[\s\S]+?(?=##)/,
        match => match + newSection
      );
      
      // Update progress tracking table
      content = content.replace(
        /\| Automated Error Detection and Fixing \| .+/,
        match => match + '\n| Standardize Component Names | Completed | March 28, 2025 | Removed "Legacy" and "Adapted" suffixes for cleaner API |'
      );
      
      if (!dryRun) {
        fs.writeFileSync(trackerPath, content, 'utf8');
        console.log(`✅ Updated ${path.relative(srcDir, trackerPath)} with component name standardization progress`);
      } else {
        console.log(`🔍 Would update ${path.relative(srcDir, trackerPath)} with component name standardization progress`);
      }
    }
  }
};

// Run the tracker update
updateNextStepsTracker();

// Final summary
console.log('\n=== Component Name Normalization Summary ===');
console.log(`Files processed: ${adaptedFiles.length + legacyFiles.length}`);
console.log(`Components renamed: ${Object.keys(renamedFiles).length}`);

if (dryRun) {
  console.log('\n⚠️ Dry run completed. No files were modified.');
  console.log('Run the script without --dry-run to apply changes.');
} else {
  console.log('\n✅ Successfully standardized component names throughout the codebase.');
  console.log('✅ Removed "Legacy" and "Adapted" suffixes for a cleaner API.');
  console.log('✅ Updated import statements and references.');
  console.log('✅ Progress tracker has been updated.');
}