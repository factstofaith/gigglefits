/**
 * Fix HTML Entity Escaping
 * 
 * This script automatically fixes HTML entity escaping issues in React components.
 * It replaces unescaped entities like ", ', etc. with their proper HTML entities.
 * 
 * Usage: node fix-html-entities.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const ENTITY_MAPPINGS = {
  '"': '&quot;',
  "'": '&apos;',
};

// Utility function to replace entities in JSX
function replaceEntities(content) {
  let updatedContent = content;
  
  // Find JSX attribute content with unescaped entities
  const jsxRegex = /(\s+\w+)=["']([^"']*?['"]+[^"']*?)["']/g;
  
  updatedContent = content.replace(jsxRegex, (match, attrName, attrValue) => {
    let newValue = attrValue;
    
    // Replace entities
    Object.entries(ENTITY_MAPPINGS).forEach(([char, entity]) => {
      // Only replace if not already part of another entity
      newValue = newValue.replace(new RegExp(char, 'g'), entity);
    });
    
    // If changes were made, return the updated attribute
    if (newValue !== attrValue) {
      return `${attrName}="${newValue}"`;
    }
    
    // Otherwise return original
    return match;
  });
  
  return updatedContent;
}

// Find all JSX files
const files = glob.sync(`${ROOT_DIR}/**/*.jsx`);
let fixedFiles = 0;

// Process each file
files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = replaceEntities(content);
    
    // If changes were made, write back to file
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Fixed entities in: ${path.relative(ROOT_DIR, filePath)}`);
      fixedFiles++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\nCompleted! Fixed ${fixedFiles} of ${files.length} files.`);