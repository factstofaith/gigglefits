/**
 * Fix Component Display Names
 * 
 * This script adds displayName to React functional components that are missing it.
 * It helps with debugging in React DevTools and fixes ESLint react/display-name warnings.
 * 
 * Usage: node fix-component-display-names.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');

// Common patterns for functional components
const COMPONENT_PATTERNS = [
  // Arrow function component: const Component = () => { ... }
  {
    pattern: /const\s+([A-Z]\w+)\s*=\s*(?:\(\s*\{[^}]*\}\s*\)|\([^)]*\)|\w+)\s*=>\s*{/g,
    displayNameTemplate: (componentName) => `\n\n${componentName}.displayName = '${componentName}';`
  },
  // Arrow function component with React.memo: const Component = React.memo(() => { ... })
  {
    pattern: /const\s+([A-Z]\w+)\s*=\s*React\.memo\(\s*(?:\(\s*\{[^}]*\}\s*\)|\([^)]*\)|\w+)\s*=>\s*{/g,
    displayNameTemplate: (componentName) => `\n\n${componentName}.displayName = '${componentName}';`
  },
  // Function component: function Component() { ... }
  {
    pattern: /function\s+([A-Z]\w+)\s*\([^)]*\)\s*{/g,
    displayNameTemplate: (componentName) => `\n\n${componentName}.displayName = '${componentName}';`
  },
  // Anonymous function component in createElement or similar patterns
  {
    pattern: /(?:React\.createElement|render|createElement)\(\s*(?:function|\([^)]*\)\s*=>)/g,
    displayNameTemplate: (fullMatch, prefix) => {
      const uniqueName = `Component${Math.floor(Math.random() * 10000)}`;
      return `${prefix}(${uniqueName})`; 
    }
  }
];

// Function to add displayName to components
function addDisplayName(content, filePath) {
  let updatedContent = content;
  let hasChanges = false;
  const fileName = path.basename(filePath, path.extname(filePath));
  const displayNameRegex = /\.displayName\s*=\s*['"][^'"]+['"]/g;
  
  // Check each component pattern
  COMPONENT_PATTERNS.forEach(({ pattern, displayNameTemplate }) => {
    // Find all component declarations
    const matches = [...content.matchAll(pattern)];
    
    // For each match, check if display name is already set
    matches.forEach(match => {
      const componentName = match[1];
      
      // Skip if no component name was captured
      if (!componentName) return;
      
      // Skip if already has displayName
      const hasDisplayName = content.includes(`${componentName}.displayName`);
      if (hasDisplayName) return;
      
      // Find the closing brace of the component
      const componentStart = match.index;
      const componentBody = content.substring(componentStart);
      
      // Find the closing point for the component (usually before export)
      let insertPoint = -1;
      
      // Try to find the position before exports
      const exportMatch = componentBody.match(/\nexport\s+(?:default|{)/);
      if (exportMatch) {
        insertPoint = componentStart + exportMatch.index;
      } else {
        // Otherwise insert at the end
        insertPoint = content.length;
      }
      
      // Insert displayName
      if (insertPoint !== -1) {
        const beforeInsert = content.substring(0, insertPoint);
        const afterInsert = content.substring(insertPoint);
        updatedContent = beforeInsert + displayNameTemplate(componentName) + afterInsert;
        hasChanges = true;
      }
    });
  });
  
  return { updatedContent, hasChanges };
}

// Find all React component files
const files = glob.sync(`${ROOT_DIR}/**/*.{jsx,js}`);
let fixedFiles = 0;

// Process each file
files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't look like React components
    if (!content.includes('import React') && !content.includes('from "react"') && !content.includes("from 'react'")) {
      return;
    }
    
    const { updatedContent, hasChanges } = addDisplayName(content, filePath);
    
    // If changes were made, write back to file
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Added display names in: ${path.relative(ROOT_DIR, filePath)}`);
      fixedFiles++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\nCompleted! Added display names to ${fixedFiles} of ${files.length} files.`);