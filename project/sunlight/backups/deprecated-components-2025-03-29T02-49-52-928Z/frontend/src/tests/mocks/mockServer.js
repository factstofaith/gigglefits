// mockServer.js
// This is a simplified implementation of an API mocking server
// designed to replace MSW in tests without TextEncoder dependency

class MockServer {
  constructor() {
    this.handlers = new Map();
    this.active = false;

    // Save original fetch implementation
    this.originalFetch = global.fetch;

    // Mock implementation counter for debugging
    this.requestCount = 0;
  }

  // Add request handlers
  use(...handlers) {
    handlers.forEach(handler => {
      const key = `${handler.method.toUpperCase()}:${handler.path}`;
      this.handlers.set(key, handler);
    });
    return this;
  }

  // Start intercepting requests
  listen(options = {}) {
    this.active = true;

    // Replace global fetch
    global.fetch = this._handleFetch.bind(this);

    return {
      close: () => this.close(),
    };
  }

  // Stop intercepting requests
  close() {
    this.active = false;

    // Restore original fetch
    global.fetch = this.originalFetch;
  }

  // Reset all handlers
  resetHandlers() {
    this.handlers.clear();
  }

  // Internal fetch handler
  async _handleFetch(url, options = {}) {
    if (!this.active) {
      return this.originalFetch(url, options);
    }

    this.requestCount++;
    const method = (options.method || 'GET').toUpperCase();

    // Extract the path from the URL
    let path = url;
    if (url.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        path = urlObj.pathname;
      } catch (e) {
        // Keep original path if URL parsing fails
      }
    }

    // Match request to handler
    const key = `${method}:${path}`;
    const exactMatch = this.handlers.get(key);

    if (exactMatch) {
      const response = await exactMatch.handler(options);

      // Create mock response
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.statusText || '',
        json: async () => response.body || {},
        text: async () => JSON.stringify(response.body || {}),
        headers: new Headers(response.headers || {}),
      };
    }

    // Check for path params handler
    for (const [handlerKey, handler] of this.handlers.entries()) {
      const [handlerMethod, handlerPath] = handlerKey.split(':');

      if (method === handlerMethod && this._matchPathPattern(path, handlerPath)) {
          `[MockServer] Pattern matched request #${this.requestCount}: ${method} ${path} -> ${handlerPath}`
        );
        const params = this._extractPathParams(path, handlerPath);
        const response = await handler.handler({ ...options, params });

        // Create mock response
        return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          statusText: response.statusText || '',
          json: async () => response.body || {},
          text: async () => JSON.stringify(response.body || {}),
          headers: new Headers(response.headers || {}),
        };
      }
    }

    // No handler found
    console.warn(`[MockServer] Unhandled request #${this.requestCount}: ${method} ${path}`);
    return {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Not Found' }),
      text: async () => JSON.stringify({ error: 'Not Found' }),
      headers: new Headers(),
    };
  }

  // Helper to match path patterns with parameters (e.g. /users/:id)
  _matchPathPattern(actualPath, patternPath) {
    const actualParts = actualPath.split('/').filter(Boolean);
    const patternParts = patternPath.split('/').filter(Boolean);

    if (actualParts.length !== patternParts.length) {
      return false;
    }

    return patternParts.every((part, i) => {
      return part.startsWith(':') || part === actualParts[i];
    });
  }

  // Helper to extract path parameters
  _extractPathParams(actualPath, patternPath) {
    const params = {};
    const actualParts = actualPath.split('/').filter(Boolean);
    const patternParts = patternPath.split('/').filter(Boolean);

    patternParts.forEach((part, i) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = actualParts[i];
      }
    });

    return params;
  }
}

// Create handlers
const handlers = [
  {
    method: 'GET',
    path: '/api/admin/applications',
    handler: () => ({
      status: 200,
      body: [
        {
          id: 1,
          name: 'Salesforce',
          type: 'api',
          description: 'Salesforce CRM integration',
          status: 'active',
          is_public: true,
          auth_type: 'oauth2',
          created_at: '2025-01-15T12:00:00.000Z',
        },
        {
          id: 2,
          name: 'Azure Blob Storage',
          type: 'file',
          description: 'Microsoft Azure Blob Storage',
          status: 'active',
          is_public: true,
          auth_type: 'api_key',
          created_at: '2025-01-20T14:30:00.000Z',
        },
      ],
    }),
  },
  {
    method: 'GET',
    path: '/api/admin/applications/:id',
    handler: ({ params }) => {
      const id = parseInt(params.id, 10);

      if (id === 1) {
        return {
          status: 200,
          body: {
            id: 1,
            name: 'Salesforce',
            type: 'api',
            description: 'Salesforce CRM integration',
            status: 'active',
            is_public: true,
            auth_type: 'oauth2',
            created_at: '2025-01-15T12:00:00.000Z',
          },
        };
      }

      if (id === 2) {
        return {
          status: 200,
          body: {
            id: 2,
            name: 'Azure Blob Storage',
            type: 'file',
            description: 'Microsoft Azure Blob Storage',
            status: 'active',
            is_public: true,
            auth_type: 'api_key',
            created_at: '2025-01-20T14:30:00.000Z',
          },
        };
      }

      return { status: 404, body: { message: 'Application not found' } };
    },
  },
  {
    method: 'POST',
    path: '/api/admin/applications',
    handler: options => {
      const body = JSON.parse(options.body || '{}');
      return {
        status: 201,
        body: {
          ...body,
          id: 3,
          created_at: new Date().toISOString(),
        },
      };
    },
  },
  {
    method: 'POST',
    path: '/api/auth/token',
    handler: () => ({
      status: 200,
      body: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
      },
    }),
  },
  {
    method: 'GET',
    path: '/api/auth/current-user',
    handler: () => ({
      status: 200,
      body: {
        id: 'user_1',
        username: 'testuser',
        email: 'testuser@example.com',
        name: 'Test User',
        role: 'admin',
        tenantId: 'tenant_1',
        createdAt: new Date().toISOString(),
      },
    }),
  },
];

// Create and export server instance
const server = new MockServer();
server.use(...handlers);

module.exports = { server, handlers };
