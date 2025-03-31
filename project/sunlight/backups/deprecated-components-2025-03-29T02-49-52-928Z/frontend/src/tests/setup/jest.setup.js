// jest.setup.js
// Global setup for Jest tests

import { server } from '../mocks/server';

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    length: 0,
    key() {
      return null;
    },
  };
})();

// Setup localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.alert
window.alert = jest.fn();

// MSW Server setup
beforeAll(() => {
  // Start the MSW server before all tests
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  // Close the server when all tests are complete
  server.close();

  // Cleanup global mocks
  jest.clearAllMocks();
});
