// Jest setup file
import '@testing-library/jest-dom';

// Mock window functions
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Set up ResizeObserver mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Theme mocks
try {
  jest.mock('../design-system/theme', () => {
    const { testTheme } = require('./setup/ThemeTestWrapper');
    return {
      useTheme: jest.fn().mockReturnValue(testTheme),
    };
  });

  // Mock ThemeCompatibilityLayer
  jest.mock('../design-system/ThemeCompatibilityLayer', () => {
    const { testTheme } = require('./setup/ThemeTestWrapper');
    return {
      useTheme: jest.fn().mockReturnValue(testTheme),
      ThemeCompatibilityProvider: ({ children }) => children,
    };
  });
} catch (error) {
  console.warn('Theme mock setup failed:', error.message);
}

