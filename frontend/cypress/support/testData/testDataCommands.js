/**
 * Test Data Commands for Cypress
 * 
 * These Cypress commands provide a consistent interface for using test data
 * in Cypress tests. They use the mockFactoryAdapter which connects to the
 * shared test data generators.
 * 
 * @version 1.0.0
 */

import mockFactoryAdapter from './mockFactoryAdapter';

// Backwards compatibility - use original entity generators
// This ensures existing tests continue to work
import { 
  generateUser, 
  generateAdminUser, 
  generateTenant, 
  generateApplication, 
  generateIntegration 
} from './entityGenerators';

/**
 * Entity Generation Commands - These provide consistent test data across tests
 */

// User commands
Cypress.Commands.add('mockUser', (overrides = {}) => {
  return mockFactoryAdapter.createUser(overrides);
});

Cypress.Commands.add('mockAdminUser', (overrides = {}) => {
  return mockFactoryAdapter.createAdminUser(overrides);
});

Cypress.Commands.add('mockUserList', (count = 3, overrides = {}) => {
  return mockFactoryAdapter.createUserList(count, overrides);
});

// Tenant commands
Cypress.Commands.add('mockTenant', (overrides = {}) => {
  return mockFactoryAdapter.createTenant(overrides);
});

Cypress.Commands.add('mockTenantList', (count = 3, overrides = {}) => {
  return mockFactoryAdapter.createTenantList(count, overrides);
});

// Application commands
Cypress.Commands.add('mockApplication', (overrides = {}) => {
  return mockFactoryAdapter.createApplication(overrides);
});

Cypress.Commands.add('mockApplicationList', (count = 3, overrides = {}) => {
  return mockFactoryAdapter.createApplicationList(count, overrides);
});

// Integration commands
Cypress.Commands.add('mockIntegration', (overrides = {}) => {
  return mockFactoryAdapter.createIntegration(overrides);
});

Cypress.Commands.add('mockIntegrationList', (count = 3, overrides = {}) => {
  return mockFactoryAdapter.createIntegrationList(count, overrides);
});

// UI State commands
Cypress.Commands.add('mockToast', (type = 'info', message = null) => {
  return mockFactoryAdapter.createToast(type, message);
});

Cypress.Commands.add('mockNotifications', (type = 'info', count = 1) => {
  return mockFactoryAdapter.createNotifications(type, count);
});

/**
 * API Intercept Commands - These mock API responses with consistent test data
 */

// User API intercepts
Cypress.Commands.add('mockUserApi', (statusCode = 200, overrides = {}) => {
  return mockFactoryAdapter.createUser(overrides).then(user => {
    cy.intercept('GET', '**/api/users/*', {
      statusCode,
      body: user
    }).as('getUser');
    
    return cy.wrap(user);
  });
});

Cypress.Commands.add('mockUsersListApi', (count = 3, statusCode = 200, overrides = {}) => {
  return mockFactoryAdapter.createUserList(count, overrides).then(users => {
    cy.intercept('GET', '**/api/users*', {
      statusCode,
      body: users
    }).as('getUsersList');
    
    return cy.wrap(users);
  });
});

// Integration API intercepts
Cypress.Commands.add('mockIntegrationApi', (statusCode = 200, overrides = {}) => {
  return mockFactoryAdapter.createIntegration(overrides).then(integration => {
    cy.intercept('GET', '**/api/integrations/*', {
      statusCode,
      body: integration
    }).as('getIntegration');
    
    return cy.wrap(integration);
  });
});

Cypress.Commands.add('mockIntegrationsListApi', (count = 3, statusCode = 200, overrides = {}) => {
  return mockFactoryAdapter.createIntegrationList(count, overrides).then(integrations => {
    cy.intercept('GET', '**/api/integrations*', {
      statusCode,
      body: integrations
    }).as('getIntegrationsList');
    
    return cy.wrap(integrations);
  });
});

// Authentication commands with generated data
Cypress.Commands.add('loginAsMockUser', (overrides = {}) => {
  return mockFactoryAdapter.createUser(overrides).then(user => {
    // Set auth token in local storage (adjust based on your auth implementation)
    window.localStorage.setItem('authToken', 'mock-auth-token');
    window.localStorage.setItem('user', JSON.stringify(user));
    
    // Mock the auth check endpoint
    cy.intercept('GET', '**/api/auth/verify', {
      statusCode: 200,
      body: { authenticated: true, user }
    }).as('verifyAuth');
    
    return cy.wrap(user);
  });
});

Cypress.Commands.add('loginAsMockAdmin', (overrides = {}) => {
  return mockFactoryAdapter.createAdminUser(overrides).then(admin => {
    // Set auth token in local storage (adjust based on your auth implementation)
    window.localStorage.setItem('authToken', 'mock-auth-token');
    window.localStorage.setItem('user', JSON.stringify(admin));
    
    // Mock the auth check endpoint
    cy.intercept('GET', '**/api/auth/verify', {
      statusCode: 200,
      body: { authenticated: true, user: admin }
    }).as('verifyAuth');
    
    return cy.wrap(admin);
  });
});

// Complex test data setup
Cypress.Commands.add('setupIntegrationTestData', () => {
  return mockFactoryAdapter.setupIntegrationTestData();
});

Cypress.Commands.add('createValidTestContext', () => {
  return mockFactoryAdapter.createValidTestContext();
});

/**
 * Validation Commands - These validate test data against schemas and relationships
 */

// Schema validation commands
Cypress.Commands.add('validateUser', (user) => {
  return mockFactoryAdapter.validateUser(user);
});

Cypress.Commands.add('validateTenant', (tenant) => {
  return mockFactoryAdapter.validateTenant(tenant);
});

Cypress.Commands.add('validateApplication', (application) => {
  return mockFactoryAdapter.validateApplication(application);
});

Cypress.Commands.add('validateDataset', (dataset) => {
  return mockFactoryAdapter.validateDataset(dataset);
});

Cypress.Commands.add('validateIntegration', (integration) => {
  return mockFactoryAdapter.validateIntegration(integration);
});

// Relationship validation commands
Cypress.Commands.add('validateUserWithRelationships', (user, context = {}) => {
  return mockFactoryAdapter.validateUserWithRelationships(user, context);
});

Cypress.Commands.add('validateAllRelationships', (context) => {
  return mockFactoryAdapter.validateAllRelationships(context);
});

// Notification API commands
Cypress.Commands.add('mockNotificationsApi', (count = 3, statusCode = 200, type = 'info') => {
  return mockFactoryAdapter.createNotifications(type, count).then(notifications => {
    cy.intercept('GET', '**/api/notifications*', {
      statusCode,
      body: notifications
    }).as('getNotifications');
    
    return cy.wrap(notifications);
  });
});

// Mark notifications as read API
Cypress.Commands.add('mockMarkNotificationsAsReadApi', (statusCode = 200) => {
  cy.intercept('POST', '**/api/notifications/mark-read*', {
    statusCode,
    body: { success: true }
  }).as('markAsRead');
});

// Clear notifications API
Cypress.Commands.add('mockClearNotificationsApi', (statusCode = 200) => {
  cy.intercept('POST', '**/api/notifications/clear-all*', {
    statusCode,
    body: { success: true }
  }).as('clearAll');
});