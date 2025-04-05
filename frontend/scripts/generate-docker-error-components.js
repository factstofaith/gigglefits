/**
 * Generate Docker Error Handling Components
 * 
 * This script generates standardized Docker error handling components for the frontend.
 * It uses the docker-component-error-handling-generator to create a complete set of error
 * handling components needed for Docker compatibility.
 */

const path = require('path');
const fs = require('fs');
const { generateErrorHandlingComponentSet } = require('../../p_tools/docker/modules/docker-component-error-handling-generator');

// Define the output directory
const outputDir = path.resolve(__dirname, '../src/error-handling/docker');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate the Docker error handling components
console.log('Generating Docker error handling components...');
const result = generateErrorHandlingComponentSet(outputDir, { overwrite: true });

if (result.success) {
  console.log('Successfully generated the following components:');
  result.componentsGenerated.forEach(component => {
    console.log(`- ${component}`);
  });
  console.log(`All components have been written to ${outputDir}`);
} else {
  console.error('Failed to generate some components:');
  result.errors.forEach(({ component, error }) => {
    console.error(`- ${component}: ${error}`);
  });
  console.log(`Generated ${result.componentsGenerated.length} out of ${result.componentsGenerated.length + result.errors.length} components`);
}