// Mock server.js replacement for tests
// This avoids loading MSW which requires TextEncoder

// Create a mock server that simulates the MSW server behavior
const mockServer = {
  listen: () => {
    console.log('Mock server is listening');
    return { close: () => {} };
  },
  resetHandlers: () => {
    console.log('Mock server handlers reset');
  },
  close: () => {
    console.log('Mock server closed');
  },
  use: (...handlers) => {
    console.log(`Added ${handlers.length} handlers to mock server`);
  }
};

// Mock handlers that respond with test data
const mockHandlers = [
  {
    type: 'rest',
    method: 'get',
    path: '/api/admin/applications',
    handler: () => {
      return {
        status: 200,
        json: () => ([
          {
            id: 1,
            name: 'Salesforce',
            type: 'api',
            description: 'Salesforce CRM integration',
            status: 'active',
            created_at: '2025-01-15T12:00:00.000Z'
          },
          {
            id: 2,
            name: 'Azure Blob Storage',
            type: 'file',
            description: 'Microsoft Azure Blob Storage',
            status: 'active',
            created_at: '2025-01-20T14:30:00.000Z'
          }
        ])
      };
    }
  },
  {
    type: 'rest',
    method: 'get',
    path: '/api/auth/current-user',
    handler: () => {
      return {
        status: 200,
        json: () => ({
          id: 'user_1',
          username: 'testuser',
          email: 'testuser@example.com',
          name: 'Test User',
          role: 'admin',
          tenantId: 'tenant_1',
          createdAt: new Date().toISOString()
        })
      };
    }
  }
];

module.exports = {
  server: mockServer,
  handlers: mockHandlers
};