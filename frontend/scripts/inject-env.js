/**
 * Environment Variable Injection Script for Docker
 * 
 * This script updates the runtime environment variables in index.html
 * It's used during the build process and in the Docker container at runtime
 */

/* Using fs.promises for async filesystem operations in Docker containers */
const fs = require('fs');
const path = require('path');

// Function to inject environment variables
async function injectEnvVars() {
  console.log('Injecting environment variables into index.html...');
  
  try {
    // Determine the build directory
    const buildDir = process.env.BUILD_DIR || path.resolve(__dirname, '../build');
    
    // Path to the index.html file
    const indexFile = path.join(buildDir, 'index.html');
    
    // Check if the file exists using async fs.promises.access
    try {
      await fs.promises.access(indexFile);
    } catch (error) {
      console.error(`Error: index.html not found at ${indexFile}`);
      process.exit(1);
    }
    
    // Read the index.html file
    let indexHtml = await fs.promises.readFile(indexFile, 'utf8');
    
    // Get all REACT_APP_ environment variables
    const envVars = {};
    
    // Add REACT_APP_ environment variables
    Object.keys(process.env)
      .filter(key => key.startsWith('REACT_APP_'))
      .forEach(key => {
        envVars[key] = process.env[key];
      });
    
    // Add common variables with defaults
    envVars['REACT_APP_VERSION'] = process.env.REACT_APP_VERSION || '1.0.0';
    envVars['REACT_APP_API_URL'] = process.env.REACT_APP_API_URL || '/api';
    envVars['REACT_APP_ENVIRONMENT'] = process.env.NODE_ENV || 'production';
    
    // Add Docker-specific variables for Docker environment
    if (process.env.REACT_APP_RUNNING_IN_DOCKER === 'true' || process.env.IS_DOCKER === 'true') {
      envVars['REACT_APP_RUNNING_IN_DOCKER'] = 'true';
      envVars['REACT_APP_CONTAINER_ID'] = process.env.HOSTNAME || 'unknown';
      envVars['REACT_APP_CONTAINER_VERSION'] = process.env.REACT_APP_CONTAINER_VERSION || '1.0.0';
      envVars['REACT_APP_DOCKER_ENVIRONMENT'] = process.env.REACT_APP_DOCKER_ENVIRONMENT || 'production';
      envVars['REACT_APP_HEALTH_CHECK_INTERVAL'] = process.env.REACT_APP_HEALTH_CHECK_INTERVAL || '60000';
      envVars['REACT_APP_ERROR_LOGGING_ENABLED'] = process.env.REACT_APP_ERROR_LOGGING_ENABLED || 'true';
      envVars['REACT_APP_ERROR_LOG_LEVEL'] = process.env.REACT_APP_ERROR_LOG_LEVEL || 'warn';
      envVars['REACT_APP_DOCKER_ERROR_HANDLING'] = process.env.REACT_APP_DOCKER_ERROR_HANDLING || 'enabled';
    }
    
    // Create the JavaScript code to inject
    const envScript = `window.env = ${JSON.stringify(envVars, null, 2)};`;
    
    // Replace the window.env object in index.html
    indexHtml = indexHtml.replace(/window\.env\s*=\s*{[^}]*};/, envScript);
    
    // Write the updated index.html file asynchronously
    await fs.promises.writeFile(indexFile, indexHtml);
    
    console.log('Environment variables injected successfully');
  } catch (error) {
    console.error(`Error injecting environment variables: ${error.message}`);
    process.exit(1);
  }
}

// Execute the function as an immediately invoked async function expression (IIFE)
(async () => {
  try {
    await injectEnvVars();
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
})();