// standalone-setup.js
// This is a completely independent test setup file for tests that don't use MSW

// jest-dom adds custom jest matchers for asserting on DOM nodes
import '@testing-library/jest-dom';

// Basic mocks only - no MSW or server imports
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock for ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock for window.alert
global.alert = jest.fn();

// Mock for window.matchMedia
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

// Mock for window.scrollTo
window.scrollTo = jest.fn();

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

// TextEncoder/TextDecoder polyfills
if (typeof global.TextEncoder === 'undefined') {
  class TextEncoder {
    encode(string) {
      const codeUnits = new Uint8Array(string.length);
      for (let i = 0; i < string.length; i++) {
        codeUnits[i] = string.charCodeAt(i);
      }
      return codeUnits;
    }
  }
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  class TextDecoder {
    decode(bytes) {
      let string = '';
      for (let i = 0; i < bytes.length; i++) {
        string += String.fromCharCode(bytes[i]);
      }
      return string;
    }
  }
  global.TextDecoder = TextDecoder;
}

// Clean up after all tests
afterAll(() => {
  jest.clearAllMocks();
});
