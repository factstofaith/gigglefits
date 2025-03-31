/**
 * Transform Components Script
 * 
 * This script transforms React components to use the standardized design system adapter.
 * It replaces direct Material UI imports with centralized adapter imports.
 * 
 * Usage: node transform-components.js [component-path]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const DESIGN_SYSTEM_PATH = '@design-system/optimized';
const ADAPTER_PATH = path.resolve(__dirname, '../src/design-system/adapter.js');

// Load available components from the adapter
const adapterContent = fs.readFileSync(ADAPTER_PATH, 'utf8');
const availableComponents = [];

// Extract exported components from adapter
const exportMatch = adapterContent.match(/export\s*\{([^}]+)\}/);
if (exportMatch && exportMatch[1]) {
  const exportedComponents = exportMatch[1]
    .split(',')
    .map(c => c.trim())
    .filter(c => c && !c.includes('//'));
  
  availableComponents.push(...exportedComponents);
}

console.log(`🔍 Found ${availableComponents.length} components in the design system adapter.`);

// Function to check if a component is available in the adapter
function isComponentAvailable(componentName) {
  // Remove "Icon" suffix if present for checking icon components
  const baseName = componentName.endsWith('Icon') ? componentName : componentName.replace(/Icon$/, '');
  return availableComponents.includes(baseName) || availableComponents.includes(componentName);
}

// Regex patterns for imports
const MUI_IMPORT_PATTERNS = [
  // Destructured imports: import { Button, TextField } from '@mui/material';
  { 
    pattern: /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@mui\/material['"]/g,
    replacement: (match, components) => {
      const componentsList = components.split(',').map(c => c.trim());
      const availableInAdapter = componentsList.filter(c => {
        // Extract actual component name (handles "X as Y" imports)
        const actualName = c.includes(' as ') ? c.split(' as ')[0].trim() : c;
        return isComponentAvailable(actualName);
      });
      
      const notInAdapter = componentsList.filter(c => {
        const actualName = c.includes(' as ') ? c.split(' as ')[0].trim() : c;
        return !isComponentAvailable(actualName);
      });
      
      if (availableInAdapter.length === 0) {
        return match; // No components to replace
      }
      
      let result = '';
      
      // Add adapter imports
      if (availableInAdapter.length > 0) {
        result += `import { ${availableInAdapter.join(', ')} } from '${DESIGN_SYSTEM_PATH}';\n`;
      }
      
      // Keep remaining MUI imports if any
      if (notInAdapter.length > 0) {
        result += `import { ${notInAdapter.join(', ')} } from '@mui/material';`;
      }
      
      return result;
    }
  },
  
  // Direct imports: import Button from '@mui/material/Button';
  {
    pattern: /import\s+([A-Z][a-zA-Z0-9]*)\s+from\s+['"]@mui\/material\/([a-zA-Z0-9]+)['"]/g,
    replacement: (match, componentName) => {
      if (isComponentAvailable(componentName)) {
        return `import { ${componentName} } from '${DESIGN_SYSTEM_PATH}';`;
      }
      return match;
    }
  },
  
  // Icon imports: import AddIcon from '@mui/icons-material/Add';
  {
    pattern: /import\s+([A-Z][a-zA-Z0-9]*)\s+from\s+['"]@mui\/icons-material\/([a-zA-Z0-9]+)['"]/g,
    replacement: (match, iconName) => {
      if (isComponentAvailable(iconName)) {
        return `import { ${iconName} } from '${DESIGN_SYSTEM_PATH}';`;
      }
      return match;
    }
  }
];

// Function to transform a file
function transformFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // Apply each pattern
    MUI_IMPORT_PATTERNS.forEach(({ pattern, replacement }) => {
      const newContent = updatedContent.replace(pattern, replacement);
      if (newContent !== updatedContent) {
        hasChanges = true;
        updatedContent = newContent;
      }
    });
    
    // Fix duplicate design system imports
    if (hasChanges) {
      // Collect all design system imports
      const dsImportRegex = new RegExp(`import\\s+\\{\\s*([^}]+)\\s*\\}\\s+from\\s+['"]${DESIGN_SYSTEM_PATH.replace('/', '\\/')}['"]`, 'g');
      const dsImports = [];
      let dsImportMatch;
      
      while ((dsImportMatch = dsImportRegex.exec(updatedContent)) !== null) {
        const components = dsImportMatch[1].split(',').map(c => c.trim());
        dsImports.push(...components);
      }
      
      // If multiple design system imports, combine them
      if (dsImports.length > 0) {
        // Remove all design system imports
        updatedContent = updatedContent.replace(dsImportRegex, '');
        
        // Add combined import
        const uniqueImports = [...new Set(dsImports)].filter(c => c && c.length > 0);
        updatedContent = `import { ${uniqueImports.join(', ')} } from '${DESIGN_SYSTEM_PATH}';\n` + updatedContent;
      }
    }
    
    // Write changes if needed
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Transformed: ${path.relative(ROOT_DIR, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process specific component or all components
const targetPath = process.argv[2] ? path.resolve(process.argv[2]) : null;

if (targetPath && fs.existsSync(targetPath)) {
  // Process specific component file or directory
  if (fs.statSync(targetPath).isDirectory()) {
    const files = glob.sync(`${targetPath}/**/*.{js,jsx}`);
    console.log(`🔍 Processing ${files.length} files in ${targetPath}...`);
    
    let transformedCount = 0;
    files.forEach(filePath => {
      if (transformFile(filePath)) {
        transformedCount++;
      }
    });
    
    console.log(`\n🎉 Transformation complete! Transformed ${transformedCount} of ${files.length} files.`);
  } else {
    console.log(`🔍 Processing file: ${targetPath}`);
    if (transformFile(targetPath)) {
      console.log(`\n🎉 Transformation complete!`);
    } else {
      console.log(`\n⚠️ No changes needed for this file.`);
    }
  }
} else {
  // Process all component files
  const componentDirs = [
    `${ROOT_DIR}/components`,
    `${ROOT_DIR}/pages`,
  ];
  
  let allFiles = [];
  let transformedCount = 0;
  
  componentDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = glob.sync(`${dir}/**/*.{js,jsx}`);
      allFiles.push(...files);
    }
  });
  
  console.log(`🔍 Processing ${allFiles.length} files...`);
  
  allFiles.forEach(filePath => {
    if (transformFile(filePath)) {
      transformedCount++;
    }
  });
  
  console.log(`\n🎉 Transformation complete! Transformed ${transformedCount} of ${allFiles.length} files.`);
}

// Provide suggestions for next steps
console.log('\nNext steps:');
console.log('1. Run the build to verify changes');
console.log('2. Check for any remaining import issues');
console.log('3. Update the Technical Debt Elimination Tracker in ClaudeContext.md');