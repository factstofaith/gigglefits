/**
 * Babel configuration for TAP Integration Platform
 * This configuration is used for both the application build and Jest tests
 * Uses CommonJS format for compatibility with both ES Modules and CommonJS
 */

module.exports = function(api) {
  // Check if we're in test mode
  const isTest = api.env('test');
  
  // Cache the configuration for better performance
  api.cache(true);
  
  const presets = [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
        browsers: isTest ? ['last 1 version'] : ['last 2 versions', 'not dead']
      },
      modules: isTest ? 'auto' : false, // Use auto for tests, false to preserve ES modules in production
    }],
    '@babel/preset-react'
  ];
  
  const plugins = [
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
      useESModules: !isTest, // Don't use ES modules in test environment
    }]
  ];
  
  // Add module resolver for path aliases
  try {
    const path = require('path');
    const webpackAliasesPath = path.resolve(__dirname, './config/webpack.aliases.js');
    
    // We need to handle both CJS and ESM here
    let aliases = {};
    try {
      // Try to directly load if it's a CJS file
      aliases = require('./config/webpack.aliases.js');
    } catch (e) {
      // If ESM doesn't load, handle appropriately
      console.warn('Could not directly load webpack aliases, using empty object');
      aliases = {};
    }
    
    plugins.push([
      'module-resolver', 
      {
        root: ['./src'],
        alias: aliases
      }
    ]);
  } catch (e) {
    console.warn('Failed to set up module-resolver:', e.message);
  }
  
  // Add HTML entity transformation plugin in test environment
  if (isTest) {
    try {
      // For CommonJS, we can use require.resolve
      const htmlEntityPluginPath = require.resolve('./src/tests/transformers/babel-html-entity-plugin.cjs');
      plugins.push(htmlEntityPluginPath);
    } catch (e) {
      // Try a direct path approach
      plugins.push('./src/tests/transformers/babel-html-entity-plugin.cjs');
    }
  }
  
  return {
    presets,
    plugins,
    // Handle different environments
    env: {
      test: {
        // Test-specific settings with CommonJS modules for Jest compatibility
        presets: [
          ['@babel/preset-env', {
            targets: { node: 'current' },
            modules: 'auto', // Use CommonJS modules in test environment
          }]
        ],
        plugins: []
      },
      production: {
        // Production-specific optimizations
        plugins: [
          ['transform-react-remove-prop-types', {
            removeImport: true,
          }],
        ]
      },
      development: {
        // Development-specific settings
        plugins: []
      }
    }
  };
};