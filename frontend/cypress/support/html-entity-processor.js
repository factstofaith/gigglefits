/**
 * HTML Entity Processor for Cypress Tests
 * 
 * This module processes HTML entities in Cypress test files to ensure
 * consistency with Jest tests. It's imported in the support/index.js file.
 */

// Apply consistent HTML entity processing across test frameworks
Cypress.on('test:before:run', (test) => {
  // If the test contains HTML entities in its title or body, replace them
  if (test.title.includes('&apos;') || test.title.includes('&quot;')) {
    test.title = test.title
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }
});

// This can be used to preprocess the source content of Cypress test files
// if a custom webpack config is being used for component testing
window.htmlEntityProcessor = {
  process: (content) => {
    return content
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }
};