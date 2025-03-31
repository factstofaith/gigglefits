// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// TextEncoder/TextDecoder are not available in the test environment
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock server import
import { server } from './tests/mocks/server';

// Setup localStorage mock
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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
}
global.IntersectionObserver = MockIntersectionObserver;

// Setup auth tokens for tests before all tests
localStorage.setItem('auth_token', 'mock-token');
localStorage.setItem('refresh_token', 'mock-refresh-token');
localStorage.setItem('token_expiry', (Date.now() + 3600 * 1000).toString());

// Setup MSW server
beforeAll(() => {
  // Start MSW server
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers and localStorage after each test
afterEach(() => {
  server.resetHandlers();
});

// Clean up after tests
afterAll(() => {
  server.close();
});
