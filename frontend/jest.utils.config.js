// jest.utils.config.js - Simplified configuration for utility-only tests
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/tests/utils/**/*.{test,spec}.{js,jsx}'
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!axios|lodash-es)/'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/tests/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/tests/utils/setup-utils-tests.js'
  ],
  resetMocks: true,
  testTimeout: 10000
};