// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Load all test dependencies at the top level to avoid hook errors
import React from 'react';
import { configure } from '@testing-library/react';

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
  // Important: Set this to false to avoid act() warnings
  asyncUtilTimeout: 5000,
  // This ensures proper cleanup to avoid memory leaks
  asyncUtilsConfig: { suppressErrors: false }
});

// Import getters for version checks
let reactTestingLibVersion = 'not available';
let jestDomVersion = 'not available';

// Store server for later use
let mswServer = null;

// Safely import modules in ESM context
const safeImport = (modulePath) => {
  // Added display name
  safeImport.displayName = 'safeImport';

  // Added display name
  safeImport.displayName = 'safeImport';

  // Added display name
  safeImport.displayName = 'safeImport';

  // Added display name
  safeImport.displayName = 'safeImport';

  try {
    // Use dynamic import
    return import(modulePath).catch(() => null);
  } catch (e) {
    console.warn(`Failed to import ${modulePath}:`, e.message);
    return Promise.resolve(null);
  }
};

// Get versions asynchronously
const getVersions = async () => {
  try {
    const testingLib = await import('@testing-library/react');
    reactTestingLibVersion = testingLib.version || 'unknown';
  } catch (e) {}
  
  try {
    const jestDom = await import('@testing-library/jest-dom');
    jestDomVersion = jestDom.version || 'unknown';
  } catch (e) {}
};

// Start MSW server asynchronously
const startMswServer = async () => {
  try {
    const { server } = await import('./mocks/server.js');
    server.listen({
      onUnhandledRequest: 'warn'
    });
    mswServer = server;
  } catch (e) {
    console.warn('MSW server setup skipped or failed:', e.message);
  }
};

// Initialize async setup
Promise.all([getVersions(), startMswServer()]).catch(e => 
  console.error('Setup initialization failed:', e)
);

// Standard setup for tests
beforeAll(() => {
  // Mock window.matchMedia which isn't available in jsdom
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  
  // Mock ResizeObserver which isn't available in jsdom
  global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  
  // Set up fake timers for better control
  jest.useFakeTimers();
  
  // Log test environment setup
  
  // Setup FontSource mocks
  jest.mock('@fontsource/inter', () => ({}), { virtual: true });
  
  // Log package versions to help with debugging
});

// Make sure no unexpected warnings or errors appear in the console
// Especially for tests with theme or context providers
const originalWarn = console.warn;
const originalError = console.error;

// Helper function to safely check if a message includes a string
// Works with both string messages and objects
const messageIncludes = (message, searchString) => {
  // Added display name
  messageIncludes.displayName = 'messageIncludes';

  // Added display name
  messageIncludes.displayName = 'messageIncludes';

  // Added display name
  messageIncludes.displayName = 'messageIncludes';

  // Added display name
  messageIncludes.displayName = 'messageIncludes';

  if (!message) return false;
  if (typeof message === 'string') {
    return message.includes(searchString);
  }
  if (message.toString && typeof message.toString === 'function') {
    return message.toString().includes(searchString);
  }
  return false;
};

beforeEach(() => {
  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  if (mswServer) {
    mswServer.resetHandlers();
  }
  
  // Mock console methods to catch issues
  console.warn = (...args) => {
    // Filter out expected warnings
    const message = args[0];
    if (
      messageIncludes(message, 'Invalid prop') || 
      messageIncludes(message, 'Warning: React does not recognize') ||
      messageIncludes(message, 'forwardRef render') ||
      messageIncludes(message, 'useLayoutEffect does nothing on the server') ||
      messageIncludes(message, 'componentWillReceiveProps has been renamed') ||
      messageIncludes(message, 'componentWillMount has been renamed') ||
      messageIncludes(message, 'componentWillUpdate has been renamed')
    ) {
      return; // Skip these warnings
    }
    originalWarn(...args);
  };
  
  console.error = (...args) => {
    // Filter out expected errors
    const message = args[0];
    if (
      messageIncludes(message, 'React.createFactory') || 
      messageIncludes(message, 'Warning: Failed prop type') ||
      messageIncludes(message, 'act(...) is not supported in production') ||
      messageIncludes(message, 'Error: Not implemented: navigation')
    ) {
      return; // Skip these errors
    }
    originalError(...args);
  };
});

afterEach(() => {
  // Clean up any timers between tests
  jest.useRealTimers();
  
  // Restore console methods
  console.warn = originalWarn;
  console.error = originalError;
});

afterAll(() => {
  // Close the MSW server when tests are done
  if (mswServer) {
    mswServer.close();
  }
});