/**
 * MSW Handlers Example
 * 
 * This file demonstrates how to use the Mock Factory with MSW for API mocking
 * in tests.
 */

import { rest } from 'msw';
import mockFactory from '../utils/mockFactory';

// Create API base URL constant
const API_BASE_URL = 'https://api.example.com';

// Create standardized handler for each entity and operation
export const handlers = [
  // User endpoints
  rest.get(`${API_BASE_URL}/users`, (req, res, ctx) => {
    const users = mockFactory.createUserList();
    return res(ctx.status(200), ctx.json(users));
  }),
  
  rest.get(`${API_BASE_URL}/users/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const user = mockFactory.createUser({ id });
    return res(ctx.status(200), ctx.json(user));
  }),
  
  rest.post(`${API_BASE_URL}/users`, (req, res, ctx) => {
    const newUser = { ...req.body, id: `user-${Date.now()}` };
    return res(ctx.status(201), ctx.json(newUser));
  }),
  
  rest.put(`${API_BASE_URL}/users/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const updatedUser = { ...req.body, id };
    return res(ctx.status(200), ctx.json(updatedUser));
  }),
  
  rest.delete(`${API_BASE_URL}/users/:id`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),
  
  // Integration endpoints
  rest.get(`${API_BASE_URL}/integrations`, (req, res, ctx) => {
    const integrations = mockFactory.createIntegrationList();
    return res(ctx.status(200), ctx.json(integrations));
  }),
  
  rest.get(`${API_BASE_URL}/integrations/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const integration = mockFactory.createIntegrationWithFlow({
      integrationOverrides: { id }
    });
    return res(ctx.status(200), ctx.json(integration));
  }),
  
  rest.post(`${API_BASE_URL}/integrations`, (req, res, ctx) => {
    const newIntegration = { 
      ...mockFactory.createIntegration(),
      ...req.body, 
      id: `integration-${Date.now()}`
    };
    return res(ctx.status(201), ctx.json(newIntegration));
  }),
  
  rest.post(`${API_BASE_URL}/integrations/:id/execute`, (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.status(200), ctx.json({
      id,
      executionId: `exec-${Date.now()}`,
      status: 'running'
    }));
  }),
  
  // Application endpoints
  rest.get(`${API_BASE_URL}/applications`, (req, res, ctx) => {
    const applications = mockFactory.createApplicationList();
    return res(ctx.status(200), ctx.json(applications));
  }),
  
  // Dataset endpoints
  rest.get(`${API_BASE_URL}/datasets`, (req, res, ctx) => {
    const datasets = mockFactory.createDatasetList();
    return res(ctx.status(200), ctx.json(datasets));
  }),
  
  // Error scenarios
  rest.get(`${API_BASE_URL}/error/401`, (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({ error: 'Unauthorized' })
    );
  }),
  
  rest.get(`${API_BASE_URL}/error/500`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'Internal Server Error' })
    );
  })
];

// Creating handler with dynamic responses
export const createDynamicHandler = (
  method, 
  path, 
  responseFactory, 
  statusCode = 200
) => {
  // Added display name
  createDynamicHandler.displayName = 'createDynamicHandler';

  // Added display name
  createDynamicHandler.displayName = 'createDynamicHandler';

  // Added display name
  createDynamicHandler.displayName = 'createDynamicHandler';

  // Added display name
  createDynamicHandler.displayName = 'createDynamicHandler';

  return rest[method](`${API_BASE_URL}${path}`, (req, res, ctx) => {
    const responseData = responseFactory(req);
    return res(ctx.status(statusCode), ctx.json(responseData));
  });
};

// Example of creating a dynamic handler
export const createFilteredUsersHandler = (filterPredicate) => {
  // Added display name
  createFilteredUsersHandler.displayName = 'createFilteredUsersHandler';

  // Added display name
  createFilteredUsersHandler.displayName = 'createFilteredUsersHandler';

  // Added display name
  createFilteredUsersHandler.displayName = 'createFilteredUsersHandler';

  // Added display name
  createFilteredUsersHandler.displayName = 'createFilteredUsersHandler';

  return createDynamicHandler(
    'get',
    '/users/filtered',
    (req) => {
      const users = mockFactory.createUserList(10);
      return users.filter(filterPredicate);
    }
  );
};

// Usage example:
// const adminOnlyHandler = createFilteredUsersHandler(user => user.role === 'admin');
// server.use(adminOnlyHandler);