/**
 * Unified Jest configuration for the TAP Integration Platform frontend.
 * This configuration supports different test types through conditional configuration.
 * Updated to support CommonJS for consistent module system.
 */

// CommonJS imports
const path = require('path');
const aliases = require('./config/webpack.aliases.js');

// Convert webpack aliases to Jest moduleNameMapper format
const aliasesMapper = {};

// Process each alias and create proper Jest module mappings
Object.entries(aliases).forEach(([key, value]) => {
  // Fix for @ prefixed paths - previous implementation had issues
  if (key.startsWith('@')) {
    // Properly escape the @ symbol in the regex
    const escapedKey = key.replace('@', '\\@');
    aliasesMapper[`^${escapedKey}/(.*)$`] = `${value}/$1`;
  } else {
    aliasesMapper[`^${key}/(.*)$`] = `${value}/$1`;
  }
});

// Direct mappings for common prefixes
aliasesMapper['^@/(.*)$'] = '<rootDir>/src/$1';
aliasesMapper['^src/(.*)$'] = '<rootDir>/src/$1';

// Define environment variable for test type
const TEST_TYPE = process.env.TEST_TYPE || 'standard';

// Base configuration shared by all test types
const baseConfig = {
  testEnvironment: 'jsdom',
  // Transform files using Babel with proper module support
  transform: {
    '^.+\\.(js|jsx)$': [
      'babel-jest', 
      { 
        configFile: './babel.config.cjs'
      }
    ],
    // Add TS transformer for TypeScript support
    '^.+\\.(ts|tsx)$': [
      'babel-jest',
      {
        configFile: './babel.config.cjs',
        presets: ['@babel/preset-typescript', '@babel/preset-react', '@babel/preset-env'],
        plugins: ['@babel/plugin-transform-runtime']
      }
    ]
  },
  moduleNameMapper: {
    ...aliasesMapper,
    '\\.(css|less|scss|sass)$': '<rootDir>/src/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/public/',
    '/build/',
    '/coverage/',
    '/src/tests/archive/',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.{js,jsx}',
    '!src/index.js',
    '!src/polyfills.js',
    '!src/setupPolyfills.js',
    '!src/tests/**/*',
    '!src/tests/testUtils/**/*',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
  resetMocks: true,
  testTimeout: 10000,
  // Configure Jest to correctly parse modules
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
};

// Type-specific configurations
const typeSpecificConfigs = {
  // Standard tests (default)
  standard: {
    setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.js'],
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
      '<rootDir>/src/**/*.test.{js,jsx}',
      '<rootDir>/src/**/*.spec.{js,jsx}',
    ],
  },
  
  // Context tests
  contexts: {
    setupFilesAfterEnv: ['<rootDir>/src/tests/contexts/setup-context-tests.js'],
    testMatch: ['<rootDir>/src/**/*.contexts.test.{js,jsx}'],
  },
  
  // Utility tests
  utils: {
    setupFilesAfterEnv: ['<rootDir>/src/tests/utils/setup-utils-tests.js'],
    testMatch: ['<rootDir>/src/**/*.utils.test.{js,jsx}'],
  },
  
  // Integration tests
  integration: {
    setupFilesAfterEnv: ['<rootDir>/src/tests/integration/setup-integration-tests.js'],
    testMatch: ['<rootDir>/src/**/*.integration.test.{js,jsx}'],
    testTimeout: 15000, // Longer timeout for integration tests
  },
  
  // Accessibility tests
  a11y: {
    setupFilesAfterEnv: ['<rootDir>/src/tests/a11y/setup-a11y-tests.js'],
    testMatch: ['<rootDir>/src/**/*.a11y.test.{js,jsx}'],
  },
};

// Get the correct type-specific config based on TEST_TYPE
const typeConfig = typeSpecificConfigs[TEST_TYPE] || typeSpecificConfigs.standard;

// Make sure setupFilesAfterEnv merges properly
const setupFiles = Array.isArray(baseConfig.setupFilesAfterEnv) ? [...baseConfig.setupFilesAfterEnv] : [];
if (typeConfig.setupFilesAfterEnv) {
  setupFiles.push(...(Array.isArray(typeConfig.setupFilesAfterEnv) ? typeConfig.setupFilesAfterEnv : [typeConfig.setupFilesAfterEnv]));
}

// Merge base config with type-specific config
const config = {
  ...baseConfig,
  ...typeConfig,
  setupFilesAfterEnv: setupFiles,
  // Add conditional transformIgnorePatterns based on test type
  transformIgnorePatterns: 
    TEST_TYPE === 'integration' 
      ? ['node_modules/(?!(axios|lodash-es|msw)/)'] 
      : ['node_modules/(?!(axios|lodash-es)/)'],
};

// Export as CommonJS module
module.exports = config;