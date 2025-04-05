/**
 * Webpack aliases configuration
 * 
 * This file defines path aliases for webpack to make imports more consistent
 * and maintainable across the codebase.
 * Updated to support ES Modules
 */
const path = require('path');

// Define aliases
const aliases = {
  '@': path.resolve(__dirname, '../src'),
  '@components': path.resolve(__dirname, '../src/components'),
  '@design-system': path.resolve(__dirname, '../src/design-system'),
  '@contexts': path.resolve(__dirname, '../src/contexts'),
  '@hooks': path.resolve(__dirname, '../src/hooks'),
  '@services': path.resolve(__dirname, '../src/services'),
  '@utils': path.resolve(__dirname, '../src/utils'),
  '@assets': path.resolve(__dirname, '../src/assets'),
  '@tests': path.resolve(__dirname, '../src/tests'),
  '@config': path.resolve(__dirname, '../src/config'),
  '@pages': path.resolve(__dirname, '../src/pages')
};

// Export as CommonJS module
module.exports = aliases;