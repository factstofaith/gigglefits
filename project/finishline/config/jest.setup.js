// Jest setup file
import '@testing-library/jest-dom';

// Mock global variables
global.fetch = jest.fn();

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
