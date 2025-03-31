/**
 * Test Adapter Configuration
 * 
 * This file configures the adapters for different test frameworks.
 */
module.exports = {
  // Jest adapter configuration
  jest: {
    command: 'jest',
    configFile: 'jest.config.js',
    outputFormat: 'json',
    resultParser: './src/utils/testRunner/parsers/jestResultParser.js',
    environmentSetup: {
      NODE_ENV: 'test'
    }
  },
  
  // Cypress adapter configuration
  cypress: {
    command: 'cypress',
    args: ['run'],
    configFile: 'cypress.config.js',
    outputFormat: 'json',
    resultParser: './src/utils/testRunner/parsers/cypressResultParser.js',
    environmentSetup: {
      CYPRESS_RECORD_KEY: process.env.CYPRESS_RECORD_KEY
    }
  },
  
  // Storybook test runner configuration
  'storybook-test-runner': {
    command: 'test-storybook',
    args: ['--coverage'],
    outputFormat: 'json',
    resultParser: './src/utils/testRunner/parsers/storybookResultParser.js',
    environmentSetup: {
      TEST_STORYBOOK_URL: 'http://localhost:6006'
    }
  },
  
  // Lighthouse adapter configuration
  lighthouse: {
    command: 'lighthouse',
    resultParser: './src/utils/testRunner/parsers/lighthouseResultParser.js',
    outputFormat: 'json',
    environmentSetup: {}
  },
  
  // Axe adapter configuration
  axe: {
    command: 'node',
    args: ['./src/utils/testRunner/runners/axeRunner.js'],
    outputFormat: 'json',
    resultParser: './src/utils/testRunner/parsers/axeResultParser.js',
    environmentSetup: {}
  }
};
