/**
 * Error Handling Script Fix
 * 
 * This script specifically fixes the template literal issues in errorHandling.js.
 * The file has multiple nested template literals with backticks inside backticks,
 * which are malformed.
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = '/home/ai-dev/Desktop/tap-integration-platform/frontend/src/utils/errorHandling.js';

// Fix the specific template literal issues in errorHandling.js
const fixErrorHandling = () => {
  console.log(`Fixing template literals in ${FILE_PATH}`);
  
  try {
    const content = fs.readFileSync(FILE_PATH, 'utf8');
    
    // Create a new content where we fix all the nested template literals
    let fixedContent = content;
    
    // Fix the SCHEMA_MISMATCH template literal
    fixedContent = fixedContent.replace(
      /SCHEMA_MISMATCH: `Schema validation failed\${params\.field \? ` for field `\${params\.field}` : ''}`/,
      'SCHEMA_MISMATCH: `Schema validation failed${params.field ? ` for field ${params.field}` : ""}`'
    );
    
    // Fix the REQUIRED_FIELD template literal
    fixedContent = fixedContent.replace(
      /REQUIRED_FIELD: `Required field\${params\.field \? ` `\${params\.field}` : ''} is missing`/,
      'REQUIRED_FIELD: `Required field${params.field ? ` ${params.field}` : ""} is missing`'
    );
    
    // Fix the TYPE_MISMATCH template literal
    fixedContent = fixedContent.replace(
      /TYPE_MISMATCH: `Type mismatch\${params\.field \? ` for field `\${params\.field}` : ''}\${params\.expected \? `, expected \${params\.expected}` : ''}`/,
      'TYPE_MISMATCH: `Type mismatch${params.field ? ` for field ${params.field}` : ""}${params.expected ? `, expected ${params.expected}` : ""}`'
    );
    
    // Fix the PATTERN_MISMATCH template literal
    fixedContent = fixedContent.replace(
      /PATTERN_MISMATCH: `Format validation failed\${params\.field \? ` for field `\${params\.field}` : ''}`/,
      'PATTERN_MISMATCH: `Format validation failed${params.field ? ` for field ${params.field}` : ""}`'
    );
    
    // Fix the ENUM_MISMATCH template literal
    fixedContent = fixedContent.replace(
      /ENUM_MISMATCH: `Value\${params\.field \? ` for `\${params\.field}` : ''} not in allowed list`/,
      'ENUM_MISMATCH: `Value${params.field ? ` for ${params.field}` : ""} not in allowed list`'
    );
    
    // Fix the FIELD_MAPPING_ERROR template literal
    fixedContent = fixedContent.replace(
      /FIELD_MAPPING_ERROR: `Error mapping field\${params\.field \? ` `\${params\.field}` : ''}`/,
      'FIELD_MAPPING_ERROR: `Error mapping field${params.field ? ` ${params.field}` : ""}`'
    );
    
    // Fix the TYPE_CONVERSION_ERROR template literal
    fixedContent = fixedContent.replace(
      /TYPE_CONVERSION_ERROR: `Type conversion failed\${params\.field \? ` for field `\${params\.field}` : ''}`/,
      'TYPE_CONVERSION_ERROR: `Type conversion failed${params.field ? ` for field ${params.field}` : ""}`'
    );
    
    // Fix the NODE_EXECUTION_ERROR template literal
    fixedContent = fixedContent.replace(
      /NODE_EXECUTION_ERROR: `Error executing node\${params\.nodeType \? ` of type `\${params\.nodeType}` : ''}`/,
      'NODE_EXECUTION_ERROR: `Error executing node${params.nodeType ? ` of type ${params.nodeType}` : ""}`'
    );
    
    // Write the fixed content back to the file
    fs.writeFileSync(FILE_PATH, fixedContent, 'utf8');
    
    console.log('Successfully fixed errorHandling.js');
    return fixedContent !== content; // Return true if changes were made
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
    const success = fixErrorHandling();
    if (success) {
      console.log('Fix successful!');
    } else {
      console.log('No changes needed or fix failed.');
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
};

main();