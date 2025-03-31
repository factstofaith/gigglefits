// setup-context-tests.js
// Special setup for context tests to handle module-level singletons

// Extend jest timeout for async operations
jest.setTimeout(10000);

// Mock console methods to reduce test noise
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Helper function to create mock services with reset capability
global.createMockServiceModule = (modulePath, mockImplementation) => {
  // Clear any existing mocks
  jest.resetModules();
  
  // Apply the mock before module initialization
  jest.doMock(modulePath, mockImplementation);
  
  // Return the mocked module
  return require(modulePath);
};

// Helper to reset all mocks between tests
global.resetAllMocks = () => {
  jest.resetAllMocks();
  jest.clearAllMocks();
  
  // Clear console mocks
  global.console.error.mockClear();
  global.console.warn.mockClear();
  global.console.log.mockClear();
};