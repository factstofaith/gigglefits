// jest.contexts.config.js
// Specialized Jest configuration for testing context providers

module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/tests/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/tests/contexts/setup-context-tests.js'
  ],
  testMatch: [
    '**/__tests__/**/*.js?(x)',
    '**/?(*.)+(spec|test).js?(x)',
    '**/?(*.)+(spec|test).contexts.js?(x)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/public/',
    '/build/',
    '/coverage/',
    '/src/tests/archive/'
  ],
  verbose: true,
  // Remove watchPlugins that might be missing
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname'
  // ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.{js,jsx}',
    '!src/tests/**',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js'
  ],
  // Use a longer timeout for context tests that involve complex async operations
  testTimeout: 10000,
};