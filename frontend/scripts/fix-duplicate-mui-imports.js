#!/usr/bin/env node

/**
 * fix-duplicate-mui-imports.js
 * 
 * Script to fix duplicate MUI imports by replacing direct MUI imports with
 * imports from our design system adapter.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const srcDir = path.resolve(__dirname, '../src');
const dryRun = process.argv.includes('--dry-run');

// Common MUI components that should be imported from the design system adapter
const componentsToReplace = [
  'LinearProgress',
  'Tab',
  'Tabs',
  'Box',
  'Card',
  'Button',
  'TextField',
  'Dialog',
  'Alert',
  'Chip',
  'Grid',
  'Stack',
  'Typography',
  'CircularProgress'
];

// Find all JavaScript/JSX files
const files = glob.sync('**/*.{js,jsx}', { cwd: srcDir, absolute: true });

console.log(`🔍 Scanning ${files.length} files for duplicate MUI imports...`);

let fixedFiles = 0;
let importsFixes = 0;

// Process each file
files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if the file imports from the design system adapter
  const hasDesignSystemImport = content.includes("from './design-system/adapter'") || 
                               content.includes("from '@design-system'");
  
  // Check for direct MUI imports that should use the adapter
  componentsToReplace.forEach(component => {
    // Look for direct imports of this component
    const directImportRegex = new RegExp(`import\\s+${component}\\s+from\\s+['"]@mui\\/material\\/${component}['"]`, 'g');
    
    if (directImportRegex.test(content) && hasDesignSystemImport) {
      // This is a duplicate - remove the direct import
      content = content.replace(directImportRegex, `// Removed duplicate import of ${component}`);
      modified = true;
      importsFixes++;
    }
  });
  
  // Handle destructured imports from @mui/material
  if (hasDesignSystemImport) {
    const destructuredImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@mui\/material['"]/g;
    let match;
    
    while ((match = destructuredImportRegex.exec(content)) !== null) {
      const importedComponents = match[1].split(',').map(s => s.trim());
      const duplicateComponents = [];
      
      // Find which components are duplicates (in design system adapter)
      importedComponents.forEach(imp => {
        // Extract the actual component name (handling aliases)
        const componentName = imp.split(' as ')[0].trim();
        if (componentsToReplace.includes(componentName)) {
          duplicateComponents.push(componentName);
        }
      });
      
      if (duplicateComponents.length > 0) {
        // There are duplicates to remove
        if (duplicateComponents.length === importedComponents.length) {
          // All components are duplicates, remove the whole import
          content = content.replace(match[0], `// Removed duplicate imports: ${duplicateComponents.join(', ')}`);
        } else {
          // Only some components are duplicates, remove just those
          let newImport = 'import {';
          importedComponents.forEach(imp => {
            const componentName = imp.split(' as ')[0].trim();
            if (!duplicateComponents.includes(componentName)) {
              newImport += ` ${imp},`;
            }
          });
          // Trim the trailing comma and close the import
          newImport = newImport.slice(0, -1) + ' } from \'@mui/material\'';
          content = content.replace(match[0], newImport);
        }
        
        modified = true;
        importsFixes += duplicateComponents.length;
      }
    }
  }
  
  // Write the changes back to the file
  if (modified) {
    fixedFiles++;
    
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed duplicate imports in ${path.relative(srcDir, filePath)}`);
    } else {
      console.log(`🔍 Would fix duplicate imports in ${path.relative(srcDir, filePath)}`);
    }
  }
});

console.log('\n=== Duplicate Import Fix Summary ===');
console.log(`Files processed: ${files.length}`);
console.log(`Files fixed: ${fixedFiles}`);
console.log(`Imports fixed: ${importsFixes}`);

if (dryRun) {
  console.log('\n⚠️ Dry run completed. No files were modified.');
  console.log('Run the script without --dry-run to apply changes.');
} else if (fixedFiles > 0) {
  console.log('\n✅ Successfully fixed duplicate imports.');
} else {
  console.log('\n✅ No duplicate imports found.');
}