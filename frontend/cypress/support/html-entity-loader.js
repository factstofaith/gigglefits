/**
 * Webpack loader to process HTML entities in Cypress test files
 * This ensures consistency with Jest tests
 */

module.exports = function (source) {
  // Replace common HTML entities with their proper string equivalents
  const processedSource = source
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  
  return processedSource;
};