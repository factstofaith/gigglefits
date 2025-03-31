/**
 * Standardized API mocking for frontend tests.
 * 
 * This module provides a consistent approach to mocking API endpoints
 * using Mock Service Worker (MSW). It includes factory functions
 * for common API response patterns.
 * 
 * Usage:
 * 1. Import the factory functions
 * 2. Create handler definitions
 * 3. Set up the server with the handlers
 * 
 * Example:
 * ```
 * import { createGetHandler, createPostHandler, setupMockServer } from './api-mocking-standard';
 * 
 * const handlers = [
 *   createGetHandler('/api/items', createSuccessResponse([{ id: 1, name: 'Item 1' }])),
 *   createPostHandler('/api/items', createSuccessResponse({ id: 2, name: 'Item 2' }))
 * ];
 * 
 * const server = setupMockServer(handlers);
 * ```
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

/**
 * Create a standardized success response.
 * 
 * @param {any} data - The data to include in the response
 * @param {number} status - The HTTP status code (default: 200)
 * @returns {Function} Response resolver function for MSW
 */
export const createSuccessResponse = (data, status = 200) => {
  // Added display name
  createSuccessResponse.displayName = 'createSuccessResponse';

  // Added display name
  createSuccessResponse.displayName = 'createSuccessResponse';

  // Added display name
  createSuccessResponse.displayName = 'createSuccessResponse';

  // Added display name
  createSuccessResponse.displayName = 'createSuccessResponse';

  // Added display name
  createSuccessResponse.displayName = 'createSuccessResponse';


  return (req, res, ctx) => {
    return res(
      ctx.status(status),
      ctx.json(data)
    );
  };
};

/**
 * Create a standardized error response.
 * 
 * @param {string} message - The error message
 * @param {number} status - The HTTP status code (default: 400)
 * @returns {Function} Response resolver function for MSW
 */
export const createErrorResponse = (message, status = 400) => {
  // Added display name
  createErrorResponse.displayName = 'createErrorResponse';

  // Added display name
  createErrorResponse.displayName = 'createErrorResponse';

  // Added display name
  createErrorResponse.displayName = 'createErrorResponse';

  // Added display name
  createErrorResponse.displayName = 'createErrorResponse';

  // Added display name
  createErrorResponse.displayName = 'createErrorResponse';


  return (req, res, ctx) => {
    return res(
      ctx.status(status),
      ctx.json({
        error: {
          message,
          status,
          timestamp: new Date().toISOString()
        }
      })
    );
  };
};

/**
 * Create a standardized validation error response.
 * 
 * @param {Object} errors - Validation errors object
 * @returns {Function} Response resolver function for MSW
 */
export const createValidationErrorResponse = (errors) => {
  // Added display name
  createValidationErrorResponse.displayName = 'createValidationErrorResponse';

  // Added display name
  createValidationErrorResponse.displayName = 'createValidationErrorResponse';

  // Added display name
  createValidationErrorResponse.displayName = 'createValidationErrorResponse';

  // Added display name
  createValidationErrorResponse.displayName = 'createValidationErrorResponse';

  // Added display name
  createValidationErrorResponse.displayName = 'createValidationErrorResponse';


  return (req, res, ctx) => {
    return res(
      ctx.status(422),
      ctx.json({
        error: {
          message: 'Validation error',
          status: 422,
          errors,
          timestamp: new Date().toISOString()
        }
      })
    );
  };
};

/**
 * Create a standardized unauthorized response.
 * 
 * @param {string} message - Error message (default: 'Unauthorized')
 * @returns {Function} Response resolver function for MSW
 */
export const createUnauthorizedResponse = (message = 'Unauthorized') => {
  // Added display name
  createUnauthorizedResponse.displayName = 'createUnauthorizedResponse';

  // Added display name
  createUnauthorizedResponse.displayName = 'createUnauthorizedResponse';

  // Added display name
  createUnauthorizedResponse.displayName = 'createUnauthorizedResponse';

  // Added display name
  createUnauthorizedResponse.displayName = 'createUnauthorizedResponse';

  // Added display name
  createUnauthorizedResponse.displayName = 'createUnauthorizedResponse';


  return (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({
        error: {
          message,
          status: 401,
          timestamp: new Date().toISOString()
        }
      })
    );
  };
};

/**
 * Create a standardized not found response.
 * 
 * @param {string} message - Error message (default: 'Resource not found')
 * @returns {Function} Response resolver function for MSW
 */
export const createNotFoundResponse = (message = 'Resource not found') => {
  // Added display name
  createNotFoundResponse.displayName = 'createNotFoundResponse';

  // Added display name
  createNotFoundResponse.displayName = 'createNotFoundResponse';

  // Added display name
  createNotFoundResponse.displayName = 'createNotFoundResponse';

  // Added display name
  createNotFoundResponse.displayName = 'createNotFoundResponse';

  // Added display name
  createNotFoundResponse.displayName = 'createNotFoundResponse';


  return (req, res, ctx) => {
    return res(
      ctx.status(404),
      ctx.json({
        error: {
          message,
          status: 404,
          timestamp: new Date().toISOString()
        }
      })
    );
  };
};

/**
 * Create a standardized internal server error response.
 * 
 * @param {string} message - Error message (default: 'Internal server error')
 * @returns {Function} Response resolver function for MSW
 */
export const createServerErrorResponse = (message = 'Internal server error') => {
  // Added display name
  createServerErrorResponse.displayName = 'createServerErrorResponse';

  // Added display name
  createServerErrorResponse.displayName = 'createServerErrorResponse';

  // Added display name
  createServerErrorResponse.displayName = 'createServerErrorResponse';

  // Added display name
  createServerErrorResponse.displayName = 'createServerErrorResponse';

  // Added display name
  createServerErrorResponse.displayName = 'createServerErrorResponse';


  return (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: {
          message,
          status: 500,
          timestamp: new Date().toISOString()
        }
      })
    );
  };
};

/**
 * Create a GET handler for the specified endpoint.
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Function} responseResolver - The response resolver function
 * @returns {RestHandler} MSW rest handler
 */
export const createGetHandler = (endpoint, responseResolver) => {
  // Added display name
  createGetHandler.displayName = 'createGetHandler';

  // Added display name
  createGetHandler.displayName = 'createGetHandler';

  // Added display name
  createGetHandler.displayName = 'createGetHandler';

  // Added display name
  createGetHandler.displayName = 'createGetHandler';

  // Added display name
  createGetHandler.displayName = 'createGetHandler';


  return rest.get(endpoint, responseResolver);
};

/**
 * Create a POST handler for the specified endpoint.
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Function} responseResolver - The response resolver function
 * @returns {RestHandler} MSW rest handler
 */
export const createPostHandler = (endpoint, responseResolver) => {
  // Added display name
  createPostHandler.displayName = 'createPostHandler';

  // Added display name
  createPostHandler.displayName = 'createPostHandler';

  // Added display name
  createPostHandler.displayName = 'createPostHandler';

  // Added display name
  createPostHandler.displayName = 'createPostHandler';

  // Added display name
  createPostHandler.displayName = 'createPostHandler';


  return rest.post(endpoint, responseResolver);
};

/**
 * Create a PUT handler for the specified endpoint.
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Function} responseResolver - The response resolver function
 * @returns {RestHandler} MSW rest handler
 */
export const createPutHandler = (endpoint, responseResolver) => {
  // Added display name
  createPutHandler.displayName = 'createPutHandler';

  // Added display name
  createPutHandler.displayName = 'createPutHandler';

  // Added display name
  createPutHandler.displayName = 'createPutHandler';

  // Added display name
  createPutHandler.displayName = 'createPutHandler';

  // Added display name
  createPutHandler.displayName = 'createPutHandler';


  return rest.put(endpoint, responseResolver);
};

/**
 * Create a PATCH handler for the specified endpoint.
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Function} responseResolver - The response resolver function
 * @returns {RestHandler} MSW rest handler
 */
export const createPatchHandler = (endpoint, responseResolver) => {
  // Added display name
  createPatchHandler.displayName = 'createPatchHandler';

  // Added display name
  createPatchHandler.displayName = 'createPatchHandler';

  // Added display name
  createPatchHandler.displayName = 'createPatchHandler';

  // Added display name
  createPatchHandler.displayName = 'createPatchHandler';

  // Added display name
  createPatchHandler.displayName = 'createPatchHandler';


  return rest.patch(endpoint, responseResolver);
};

/**
 * Create a DELETE handler for the specified endpoint.
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Function} responseResolver - The response resolver function
 * @returns {RestHandler} MSW rest handler
 */
export const createDeleteHandler = (endpoint, responseResolver) => {
  // Added display name
  createDeleteHandler.displayName = 'createDeleteHandler';

  // Added display name
  createDeleteHandler.displayName = 'createDeleteHandler';

  // Added display name
  createDeleteHandler.displayName = 'createDeleteHandler';

  // Added display name
  createDeleteHandler.displayName = 'createDeleteHandler';

  // Added display name
  createDeleteHandler.displayName = 'createDeleteHandler';


  return rest.delete(endpoint, responseResolver);
};

/**
 * Create common CRUD handlers for a resource.
 * 
 * @param {string} baseEndpoint - The base API endpoint for the resource
 * @param {Array} items - Array of items for GET responses
 * @param {Object} singleItem - Single item for POST/PUT responses
 * @returns {Array} Array of MSW rest handlers
 */
export const createCrudHandlers = (baseEndpoint, items, singleItem) => {
  // Added display name
  createCrudHandlers.displayName = 'createCrudHandlers';

  // Added display name
  createCrudHandlers.displayName = 'createCrudHandlers';

  // Added display name
  createCrudHandlers.displayName = 'createCrudHandlers';

  // Added display name
  createCrudHandlers.displayName = 'createCrudHandlers';

  // Added display name
  createCrudHandlers.displayName = 'createCrudHandlers';


  const idPattern = `${baseEndpoint}/:id`;
  
  return [
    createGetHandler(baseEndpoint, createSuccessResponse(items)),
    createGetHandler(idPattern, (req, res, ctx) => {
      const { id } = req.params;
      const item = items.find(item => item.id === id);
      
      if (item) {
        return res(ctx.status(200), ctx.json(item));
      } else {
        return res(
          ctx.status(404),
          ctx.json({
            error: {
              message: 'Resource not found',
              status: 404,
              timestamp: new Date().toISOString()
            }
          })
        );
      }
    }),
    createPostHandler(baseEndpoint, createSuccessResponse(singleItem, 201)),
    createPutHandler(idPattern, createSuccessResponse(singleItem)),
    createPatchHandler(idPattern, createSuccessResponse(singleItem)),
    createDeleteHandler(idPattern, (req, res, ctx) => {
      return res(ctx.status(204));
    })
  ];
};

/**
 * Set up a mock server with the provided handlers.
 * 
 * @param {Array} handlers - Array of MSW rest handlers
 * @returns {SetupServerApi} MSW server instance
 */
export const setupMockServer = (handlers) => {
  // Added display name
  setupMockServer.displayName = 'setupMockServer';

  // Added display name
  setupMockServer.displayName = 'setupMockServer';

  // Added display name
  setupMockServer.displayName = 'setupMockServer';

  // Added display name
  setupMockServer.displayName = 'setupMockServer';

  // Added display name
  setupMockServer.displayName = 'setupMockServer';


  const server = setupServer(...handlers);
  
  // Configure the server
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  
  return server;
};

/**
 * Standard mock data factory for common entities.
 */
export const mockData = {
  createUser: (overrides = {}) => ({
    id: 'user-123',
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    tenantId: 'tenant-123',
    isActive: true,
    ...overrides
  }),
  
  createTenant: (overrides = {}) => ({
    id: 'tenant-123',
    name: 'Test Tenant',
    domain: 'test.com',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides
  }),
  
  createIntegration: (overrides = {}) => ({
    id: 'integration-123',
    name: 'Test Integration',
    description: 'Test integration description',
    status: 'active',
    tenantId: 'tenant-123',
    createdBy: 'user-123',
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides
  }),
  
  createApplication: (overrides = {}) => ({
    id: 'app-123',
    name: 'Test Application',
    description: 'Test application description',
    status: 'active',
    tenantId: 'tenant-123',
    createdBy: 'user-123',
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides
  }),
};