/**
 * Jest configuration
 */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/index.{js,jsx}',
    '!src/setupTests.js',
    '!src/polyfills.js',
  ],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 65,
      functions: 75,
      lines: 75,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/config/jest/fileMock.js',
    '\\.(css|scss)$': '<rootDir>/config/jest/styleMock.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@mui|react-syntax-highlighter)/)',
  ],
  testMatch: [
    '<rootDir>/src/__tests__/App.test.jsx',
    '<rootDir>/src/components/__tests__/A11yButton.test.jsx',
    '<rootDir>/src/components/common/__tests__/A11yForm.test.jsx',
    '<rootDir>/src/components/common/__tests__/A11yTable.test.jsx',
  ],
  resetMocks: true,
};