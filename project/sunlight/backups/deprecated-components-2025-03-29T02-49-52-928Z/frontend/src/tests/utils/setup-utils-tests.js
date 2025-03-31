// Import Jest DOM extensions for assertion utilities
import '@testing-library/jest-dom';

// Store original properties that we might mock
const originals = {
  URL: { 
    createObjectURL: URL.createObjectURL,
    revokeObjectURL: URL.revokeObjectURL 
  },
  window: {
    matchMedia: window.matchMedia,
    scrollTo: window.scrollTo,
    IntersectionObserver: window.IntersectionObserver,
    Notification: window.Notification
  },
  navigator: {
    userAgent: navigator.userAgent,
    serviceWorker: navigator.serviceWorker,
    permissions: navigator.permissions,
    maxTouchPoints: navigator.maxTouchPoints
  },
  Element: {
    animate: Element.prototype.animate
  }
};

// Mock global browser APIs commonly used in utilities
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock window.matchMedia
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

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock IntersectionObserver
window.IntersectionObserver = jest.fn().mockImplementation(function(callback) {
  this.observe = jest.fn();
  this.unobserve = jest.fn();
  this.disconnect = jest.fn();
  this.root = null;
  this.rootMargin = '';
  this.thresholds = [];
  this.takeRecords = jest.fn();
});

// Helper function for mocking read-only navigator properties in tests
global.mockNavigatorProperty = (property, value) => {
  Object.defineProperty(global.navigator, property, {
    value,
    configurable: true,
    writable: true
  });
};

// Helper function for restoring navigator properties
global.restoreNavigatorProperty = (property) => {
  if (property in originals.navigator) {
    mockNavigatorProperty(property, originals.navigator[property]);
  }
};

// Helper to restore mocks after tests
global.restoreAllMocks = () => {
  // Restore URL methods
  URL.createObjectURL = originals.URL.createObjectURL;
  URL.revokeObjectURL = originals.URL.revokeObjectURL;
  
  // Restore window properties
  window.matchMedia = originals.window.matchMedia;
  window.scrollTo = originals.window.scrollTo;
  window.IntersectionObserver = originals.window.IntersectionObserver;
  
  // Clean up any remaining mocks
  jest.restoreAllMocks();
};

// Clean up after all tests
afterAll(() => {
  restoreAllMocks();
});