/**
 * Template Literal and Import Fix Script
 * 
 * This script fixes common TypeScript errors in the codebase:
 * 1. Malformed template literals - Converting single-quoted template literals to backticks
 * 2. Malformed import statements - Fixing broken import statements in JSX files
 * 3. Missing commas in object literals
 * 
 * Based on our Golden Approach methodology to systematically fix build errors.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Get list of files with TypeScript errors
const getErrorFiles = () => {
  return new Promise((resolve, reject) => {
    const cmd = 'cd /home/ai-dev/Desktop/tap-integration-platform/frontend && npx tsc --noEmit';
    
    exec(cmd, (error, stdout, stderr) => {
      const lines = stdout.split('\n');
      const errorFiles = new Set();
      
      for (const line of lines) {
        if (line.includes('error TS')) {
          const file = line.split('(')[0];
          if (file) {
            errorFiles.add(file);
          }
        }
      }
      
      resolve(Array.from(errorFiles));
    });
  });
};

// Fix template literals in a file (change single-quoted template literals to backticks)
const fixTemplateLiterals = (filePath) => {
  console.log(`Fixing template literals in ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace single-quoted template literals with backtick literals
    // Pattern: '${...}' -> `${...}`
    const fixedContent = content.replace(/'(\${[^}]+})'/g, '`$1`');
    
    // Match cases where there might be multiple variables in one string
    // This is more complex and might need multiple passes
    let multiFixContent = fixedContent;
    const multiVarPattern = /'([^']*\${[^}]+}[^']*)'/g;
    let match;
    
    while ((match = multiVarPattern.exec(multiFixContent)) !== null) {
      const origStr = match[0];
      const fixedStr = '`' + match[1] + '`';
      multiFixContent = multiFixContent.replace(origStr, fixedStr);
    }
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, multiFixContent, 'utf8');
    
    return multiFixContent !== content; // Return true if changes were made
  } catch (error) {
    console.error(`Error fixing template literals in ${filePath}:`, error);
    return false;
  }
};

// Fix malformed import statements in JSX files
const fixMalformedImports = (filePath) => {
  console.log(`Fixing malformed imports in ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    
    // Pattern 1: Breaking line in an import statement
    const importPattern = /import\s+{([^}]+)}\s+from\s+['"][^'"]+['"];?/g;
    let match;
    
    while ((match = importPattern.exec(content)) !== null) {
      const importStr = match[0];
      const importItems = match[1];
      
      // Check if there are line breaks or other issues in the import items
      if (importItems.includes('\n') || importItems.includes('import')) {
        // This is a potentially problematic import - needs manual inspection
        console.log(`  WARNING: Complex import pattern detected in ${filePath}:`, importStr);
      }
    }
    
    // Fix specifically for the issue in ReleasesManager.jsx
    if (filePath.includes('ReleasesManager.jsx')) {
      // Fix for line 42-43: import { followed by import Tab
      fixedContent = fixedContent.replace(
        /{\s*\n\s*import Tab/,
        '{\nTab'
      );
      
      // Fix any unclosed import statements
      fixedContent = fixedContent.replace(
        /import\s+{([^}]+)(?!\})/g,
        (match, p1) => {
          // If the import is not closed properly
          return `import {${p1}}`;
        }
      );
    }
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    
    return fixedContent !== content; // Return true if changes were made
  } catch (error) {
    console.error(`Error fixing malformed imports in ${filePath}:`, error);
    return false;
  }
};

// Fix specific issues in errorHandling.js
const fixErrorHandlingFile = () => {
  const filePath = '/home/ai-dev/Desktop/tap-integration-platform/frontend/src/utils/errorHandling.js';
  console.log(`Fixing issues in ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all instances of template literals with single quotes to backticks
    let fixedContent = content.replace(
      /SCHEMA_MISMATCH: `Schema validation failed\${params\.field \? ` for field `\${params\.field}` : ''}`/,
      'SCHEMA_MISMATCH: `Schema validation failed${params.field ? ` for field ${params.field}` : ""}`'
    );
    
    fixedContent = fixedContent.replace(
      /REQUIRED_FIELD: `Required field\${params\.field \? ` `\${params\.field}` : ''} is missing`/,
      'REQUIRED_FIELD: `Required field${params.field ? ` ${params.field}` : ""} is missing`'
    );
    
    fixedContent = fixedContent.replace(
      /TYPE_MISMATCH: `Type mismatch\${params\.field \? ` for field `\${params\.field}` : ''}\${params\.expected \? `, expected \${params\.expected}` : ''}`/,
      'TYPE_MISMATCH: `Type mismatch${params.field ? ` for field ${params.field}` : ""}${params.expected ? `, expected ${params.expected}` : ""}`'
    );
    
    fixedContent = fixedContent.replace(
      /PATTERN_MISMATCH: `Format validation failed\${params\.field \? ` for field `\${params\.field}` : ''}`/,
      'PATTERN_MISMATCH: `Format validation failed${params.field ? ` for field ${params.field}` : ""}`'
    );
    
    fixedContent = fixedContent.replace(
      /ENUM_MISMATCH: `Value\${params\.field \? ` for `\${params\.field}` : ''} not in allowed list`/,
      'ENUM_MISMATCH: `Value${params.field ? ` for ${params.field}` : ""} not in allowed list`'
    );
    
    fixedContent = fixedContent.replace(
      /FIELD_MAPPING_ERROR: `Error mapping field\${params\.field \? ` `\${params\.field}` : ''}`/,
      'FIELD_MAPPING_ERROR: `Error mapping field${params.field ? ` ${params.field}` : ""}`'
    );
    
    fixedContent = fixedContent.replace(
      /TYPE_CONVERSION_ERROR: `Type conversion failed\${params\.field \? ` for field `\${params\.field}` : ''}`/,
      'TYPE_CONVERSION_ERROR: `Type conversion failed${params.field ? ` for field ${params.field}` : ""}`'
    );
    
    fixedContent = fixedContent.replace(
      /NODE_EXECUTION_ERROR: `Error executing node\${params\.nodeType \? ` of type `\${params\.nodeType}` : ''}`/,
      'NODE_EXECUTION_ERROR: `Error executing node${params.nodeType ? ` of type ${params.nodeType}` : ""}`'
    );
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    
    return fixedContent !== content; // Return true if changes were made
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
    return false;
  }
};

// Main execution
const main = async () => {
  try {
    console.log('Getting files with TypeScript errors...');
    const errorFiles = await getErrorFiles();
    console.log(`Found ${errorFiles.length} files with TypeScript errors.`);
    
    let filesFixed = 0;
    
    // First fix the errorHandling.js file specifically
    if (fs.existsSync('/home/ai-dev/Desktop/tap-integration-platform/frontend/src/utils/errorHandling.js')) {
      const changed = fixErrorHandlingFile();
      if (changed) filesFixed++;
    }
    
    // Fix ReleasesManager.jsx specifically for import issues
    if (fs.existsSync('/home/ai-dev/Desktop/tap-integration-platform/frontend/src/components/admin/ReleasesManager.jsx')) {
      const changed = fixMalformedImports('/home/ai-dev/Desktop/tap-integration-platform/frontend/src/components/admin/ReleasesManager.jsx');
      if (changed) filesFixed++;
    }
    
    // Process all error files for template literals
    for (const file of errorFiles) {
      // Skip files we've already specifically fixed
      if (file.includes('errorHandling.js') || file.includes('ReleasesManager.jsx')) {
        continue;
      }
      
      // Fix template literals
      const changedLiterals = fixTemplateLiterals(file);
      
      // Fix malformed imports for JSX files
      let changedImports = false;
      if (file.endsWith('.jsx')) {
        changedImports = fixMalformedImports(file);
      }
      
      if (changedLiterals || changedImports) {
        filesFixed++;
      }
    }
    
    console.log(`Completed. Fixed issues in ${filesFixed} files.`);
  } catch (error) {
    console.error('Error in main execution:', error);
  }
};

main();