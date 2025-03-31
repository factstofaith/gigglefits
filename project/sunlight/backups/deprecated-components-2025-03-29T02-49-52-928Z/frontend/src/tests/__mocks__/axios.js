// Mock axios module for tests
const mockAxios = jest.createMockFromModule('axios');

// Mock the create method
mockAxios.create = jest.fn(() => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ status: 204 })),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

// Provide a mock defaults object
mockAxios.defaults = {
  headers: {
    common: {},
    get: {},
    post: {},
  },
};

// Export the mock
module.exports = mockAxios;
