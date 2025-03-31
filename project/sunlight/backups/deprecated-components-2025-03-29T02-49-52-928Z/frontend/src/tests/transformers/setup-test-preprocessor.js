/**
 * Setup file for Jest to handle HTML entities in test files
 * This file is included in all Jest test runs via setupFilesAfterEnv config
 */

// Patch the Jest environment to preprocess HTML entities in all JS/JSX content
beforeAll(() => {
  // Get the original transformFile method from Jest
  const originalTransformFile = require('@jest/transform').transformFile;
  
  // Check if we can monkey-patch transformFile
  if (typeof originalTransformFile === 'function') {
    // This is a workaround to preprocess all test files for HTML entities
    const patchedTransformFile = async (filename, config, ...args) => {
      try {
        const result = await originalTransformFile(filename, config, ...args);
        
        // If the file contains HTML entities, replace them
        if (result.code && (
          result.code.includes("'") || 
          result.code.includes('"') || 
          result.code.includes('&') || 
          result.code.includes('<') || 
          result.code.includes('>')
        )) {
          // Replace common HTML entities with their proper string equivalents
          result.code = result.code
            .replace(/'/g, "'")
            .replace(/"/g, '"')
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>');
        }
        
        return result;
      } catch (error) {
        // If patching fails, fall back to original transform
        console.warn('HTML entity preprocessor failed, using original transform:', error.message);
        return originalTransformFile(filename, config, ...args);
      }
    };
    
    // Replace the transformFile method with our patched version
    try {
      require('@jest/transform').transformFile = patchedTransformFile;
    } catch (error) {
      console.warn('Failed to patch Jest transformFile:', error.message);
    }
  }
});

// This is a workaround for any errors during the test setup
// The actual entity replacement will happen via Babel plugins
