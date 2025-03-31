#!/usr/bin/env node

/**
 * Environment Variable Injection Script
 * 
 * This script replaces environment variable placeholders in the index.html file
 * with actual environment variables during the build process.
 */

const fs = require('fs');
const path = require('path');

// Get the build directory
const buildDir = path.resolve(__dirname, '../build');
const indexPath = path.join(buildDir, 'index.html');

// Create a function to inject environment variables
function injectEnvironmentVariables() {
  // Check if the build directory exists
  if (!fs.existsSync(buildDir)) {
    console.error('Build directory does not exist. Run the build command first.');
    process.exit(1);
  }

  // Check if the index.html file exists
  if (!fs.existsSync(indexPath)) {
    console.error('index.html file does not exist in the build directory.');
    process.exit(1);
  }

  // Read the index.html file
  let indexContent = fs.readFileSync(indexPath, 'utf8');

  // Define environment variables to inject
  const envVars = {
    REACT_APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || '/api',
    NODE_ENV: process.env.NODE_ENV || 'development',
    REACT_APP_MOCK_API: process.env.REACT_APP_MOCK_API || 'false',
    REACT_APP_AUTH_ENABLED: process.env.REACT_APP_AUTH_ENABLED || 'true'
  };

  // Replace placeholders with actual values
  Object.keys(envVars).forEach(key => {
    const placeholder = `%${key}%`;
    indexContent = indexContent.replace(new RegExp(placeholder, 'g'), envVars[key]);
  });

  // Write the updated content back to the file
  fs.writeFileSync(indexPath, indexContent);

  console.log('Environment variables injected successfully.');
}

// Execute the function
injectEnvironmentVariables();