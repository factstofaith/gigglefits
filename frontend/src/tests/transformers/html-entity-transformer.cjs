/**
 * Custom transformer for Jest to handle HTML entities in test files
 * 
 * This preprocesses files before they're transformed by Babel
 * Using CommonJS format for compatibility with Jest transformer system
 */

const transformHtmlEntities = code => {
  // Replace common HTML entities with their proper string equivalents
  return code
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>');
};

// Export using CommonJS syntax
module.exports = {
  // This function is called before a file is transformed by Jest
  process(sourceText, sourcePath, options) {
    // Transform the source code
    const transformedCode = transformHtmlEntities(sourceText);
    
    // Return the transformed code
    return {
      code: transformedCode,
    };
  },
};