#!/usr/bin/env node

/**
 * create-missing-components.js
 * 
 * Script to create missing components in the design system that are needed
 * but not yet implemented.
 */

const fs = require('fs');
const path = require('path');

// Base directory for component files
const baseDir = path.resolve(__dirname, '../src/design-system/components');

// List of components to create with their categories
const componentsToCreate = [
  { name: 'Paper', category: 'layout' },
  { name: 'IconButton', category: 'core' },
  { name: 'DialogTitle', category: 'feedback' },
  { name: 'DialogContent', category: 'feedback' },
  { name: 'DialogContentText', category: 'feedback' },
  { name: 'DialogActions', category: 'feedback' },
  { name: 'MenuList', category: 'navigation' },
  { name: 'MenuItem', category: 'navigation' },
  { name: 'FormControlLabel', category: 'form' },
  { name: 'InputLabel', category: 'form' },
  { name: 'ListItemText', category: 'display' },
  { name: 'ListItemSecondaryAction', category: 'display' },
  { name: 'Divider', category: 'display' }
];

// Create a component file with basic implementation
const createComponentFile = (componentName, categoryName) => {
  const dirPath = path.join(baseDir, categoryName);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const filePath = path.join(dirPath, `${componentName}.jsx`);
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`⚠️ ${componentName}.jsx already exists in ${categoryName}`);
    return false;
  }
  
  // Create component template
  const componentTemplate = `/**
 * ${componentName} component
 * 
 * A design system wrapper around Material UI's ${componentName} component
 */
import React from 'react';
import PropTypes from 'prop-types';
import Mui${componentName} from '@mui/material/${componentName}';

const ${componentName} = React.forwardRef((props, ref) => {
  ${componentName}.displayName = '${componentName}';
  
  return <Mui${componentName} ref={ref} {...props} />;
});

${componentName}.propTypes = {
  children: PropTypes.node
};

export default ${componentName};
`;
  
  fs.writeFileSync(filePath, componentTemplate, 'utf8');
  console.log(`✅ Created ${componentName}.jsx in ${categoryName}`);
  
  return true;
};

// Update index files to export the new components
const updateIndexFiles = () => {
  // Group components by category
  const componentsByCategory = {};
  componentsToCreate.forEach(({ name, category }) => {
    if (!componentsByCategory[category]) {
      componentsByCategory[category] = [];
    }
    componentsByCategory[category].push(name);
  });
  
  // Update each category's index.js
  Object.entries(componentsByCategory).forEach(([category, components]) => {
    const indexPath = path.join(baseDir, category, 'index.js');
    let indexContent;
    
    if (fs.existsSync(indexPath)) {
      // Update existing index file
      indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Add export statements for new components
      components.forEach(name => {
        if (!indexContent.includes(`export { default as ${name} }`)) {
          indexContent += `export { default as ${name} } from './${name}';\n`;
        }
      });
    } else {
      // Create new index file
      indexContent = `/**
 * ${category} components index
 * Export all ${category} components for easy imports
 */

${components.map(name => `export { default as ${name} } from './${name}';`).join('\n')}
`;
    }
    
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log(`✅ Updated index.js in ${category}`);
  });
  
  // Update the main design-system index.js
  const mainIndexPath = path.join(path.dirname(baseDir), 'index.js');
  let mainIndexContent = fs.readFileSync(mainIndexPath, 'utf8');
  
  // Add imports for each category if needed
  Object.entries(componentsByCategory).forEach(([category, components]) => {
    components.forEach(name => {
      // Check if the component is already imported
      if (!mainIndexContent.includes(`import ${name} from`)) {
        // Find the imports section for this category
        const categoryComment = new RegExp(`\/\/ ${category.charAt(0).toUpperCase() + category.slice(1)} Components`);
        const match = categoryComment.exec(mainIndexContent);
        
        if (match) {
          // Add import after the category comment
          const position = match.index + match[0].length;
          mainIndexContent = 
            mainIndexContent.slice(0, position) + 
            `\nimport ${name} from './components/${category}/${name}';` +
            mainIndexContent.slice(position);
        }
      }
      
      // Check if the component is already exported
      if (!mainIndexContent.includes(`${name},`)) {
        // Find the exports section
        const exportSection = /export\s+{([^}]+)}/;
        const match = exportSection.exec(mainIndexContent);
        
        if (match) {
          // Add component to exports
          const exportList = match[1];
          const lastExport = exportList.trim().split('\n').pop();
          mainIndexContent = mainIndexContent.replace(
            lastExport,
            `${lastExport},\n  ${name}`
          );
        }
      }
    });
  });
  
  fs.writeFileSync(mainIndexPath, mainIndexContent, 'utf8');
  console.log(`✅ Updated main index.js with new components`);
};

// Create components
console.log('🔧 Creating missing design system components...');
let createdCount = 0;

componentsToCreate.forEach(({ name, category }) => {
  if (createComponentFile(name, category)) {
    createdCount++;
  }
});

// Update index files if any components were created
if (createdCount > 0) {
  updateIndexFiles();
}

console.log(`\n=== Component Creation Summary ===`);
console.log(`Components created: ${createdCount}/${componentsToCreate.length}`);
console.log(`✅ Missing design system components have been created`);
console.log(`✅ Run npm run build to test the changes`);