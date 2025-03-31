/**
 * Mock Factory Adapter for Cypress
 * 
 * This module adapts the shared test data generators for use in Cypress tests,
 * maintaining consistency with Jest tests while providing a Cypress-friendly API.
 * 
 * @version 1.0.0
 */

/**
 * This file dynamically imports shared generators at runtime.
 * 
 * Note: Due to Cypress bundling constraints, we can't directly import from outside
 * the Cypress directory. Cypress will bundle the required files when it processes
 * this adapter. We're using relative paths from the Cypress support directory.
 */

// Path to shared generators relative to Cypress support directory
const BASE_PATH = '../../../src/shared/testData/generators';
const VALIDATORS_PATH = '../../../src/shared/testData/validators';

/**
 * CypressMockFactory - Adapter for shared test data generators in Cypress environment
 */
class CypressMockFactory {
  constructor() {
    // Flag to check initialization
    this.initialized = false;
    
    // We'll load these generators dynamically when needed
    this.entityGenerators = null;
    this.uiStateGenerators = null;
    this.integrationGenerators = null;
    this.contextGenerators = null;
    this.validators = null;
  }
  
  /**
   * Ensure generators are loaded
   * @private
   */
  async _ensureInitialized() {
    if (this.initialized) return;
    
    // Use dynamic imports to load generators
    // This works because Cypress bundles the required files
    try {
      // Load module chunks
      this.entityGenerators = await import(`${BASE_PATH}/entityGenerators`);
      this.uiStateGenerators = await import(`${BASE_PATH}/uiStateGenerators`);
      this.integrationGenerators = await import(`${BASE_PATH}/integrationGenerators`);
      this.contextGenerators = await import(`${BASE_PATH}/contextGenerators`);
      
      // Load validators
      this.validators = await import(`${VALIDATORS_PATH}/index`);
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize mock factory:', error);
      
      // Provide fallback generator to avoid breaking tests
      this._provideFallbackGenerators();
    }
  }
  
  /**
   * Fallback generators if shared ones can't be loaded
   * @private
   */
  _provideFallbackGenerators() {
    console.warn('Using fallback generators - shared generators could not be loaded');
    
    // Define minimal generators based on the original entityGenerators.js
    const generateId = () => `id-${Math.random().toString(36).substr(2, 9)}`;
    
    // Basic entity generators
    this.entityGenerators = {
      generateId,
      generateUser: (overrides = {}) => ({
        id: generateId(),
        name: 'Test User',
        email: 'test.user@example.com',
        role: 'user',
        status: 'active',
        ...overrides
      }),
      generateTenant: (overrides = {}) => ({
        id: generateId(),
        name: 'Test Tenant',
        status: 'active',
        ...overrides
      }),
      generateIntegration: (overrides = {}) => ({
        id: generateId(),
        name: 'Test Integration',
        status: 'active',
        ...overrides
      }),
    };
    
    // Minimal UI state generators
    this.uiStateGenerators = {
      generateToast: (type = 'info', message = 'Test message') => ({
        id: generateId(),
        type,
        message,
        title: type.charAt(0).toUpperCase() + type.slice(1),
      }),
      generateNotifications: (type = 'info', count = 1) => {
        const notifications = [];
        for (let i = 0; i < count; i++) {
          notifications.push({
            id: generateId(),
            title: `Test ${type} notification`,
            message: `Test notification message ${i + 1}`,
            type,
            read: false,
          });
        }
        return notifications;
      },
    };
    
    // Set initialized flag to prevent repeated attempts
    this.initialized = true;
  }
  
  /**
   * Create a user
   * @param {Object} overrides Properties to override
   * @returns {Cypress.Chainable} Cypress chainable containing the user
   */
  createUser(overrides = {}) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const user = this.entityGenerators.generateUser(overrides);
      return cy.wrap(user);
    });
  }
  
  /**
   * Create an admin user
   * @param {Object} overrides Properties to override
   * @returns {Cypress.Chainable} Cypress chainable containing the admin user
   */
  createAdminUser(overrides = {}) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const adminUser = this.entityGenerators.generateAdminUser(overrides);
      return cy.wrap(adminUser);
    });
  }
  
  /**
   * Create a list of users
   * @param {number} count Number of users to create
   * @param {Object} overrides Properties to override
   * @returns {Cypress.Chainable} Cypress chainable containing the user list
   */
  createUserList(count = 3, overrides = {}) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const users = this.entityGenerators.generateUserList(count, overrides);
      return cy.wrap(users);
    });
  }
  
  /**
   * Create a tenant
   * @param {Object} overrides Properties to override
   * @returns {Cypress.Chainable} Cypress chainable containing the tenant
   */
  createTenant(overrides = {}) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const tenant = this.entityGenerators.generateTenant(overrides);
      return cy.wrap(tenant);
    });
  }
  
  /**
   * Create a list of tenants
   * @param {number} count Number of tenants to create
   * @param {Object} overrides Properties to override
   * @returns {Cypress.Chainable} Cypress chainable containing the tenant list
   */
  createTenantList(count = 3, overrides = {}) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const tenants = this.entityGenerators.generateTenantList(count, overrides);
      return cy.wrap(tenants);
    });
  }
  
  /**
   * Create an application
   * @param {Object} overrides Properties to override
   * @returns {Cypress.Chainable} Cypress chainable containing the application
   */
  createApplication(overrides = {}) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const application = this.entityGenerators.generateApplication(overrides);
      return cy.wrap(application);
    });
  }
  
  /**
   * Create a list of applications
   * @param {number} count Number of applications to create
   * @param {Object} overrides Properties to override
   * @returns {Cypress.Chainable} Cypress chainable containing the application list
   */
  createApplicationList(count = 3, overrides = {}) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const applications = this.entityGenerators.generateApplicationList(count, overrides);
      return cy.wrap(applications);
    });
  }
  
  /**
   * Create an integration
   * @param {Object} overrides Properties to override
   * @returns {Cypress.Chainable} Cypress chainable containing the integration
   */
  createIntegration(overrides = {}) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const integration = this.entityGenerators.generateIntegration(overrides);
      return cy.wrap(integration);
    });
  }
  
  /**
   * Create a list of integrations
   * @param {number} count Number of integrations to create
   * @param {Object} overrides Properties to override
   * @returns {Cypress.Chainable} Cypress chainable containing the integration list
   */
  createIntegrationList(count = 3, overrides = {}) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const integrations = this.entityGenerators.generateIntegrationList(count, overrides);
      return cy.wrap(integrations);
    });
  }
  
  /**
   * Create a toast notification
   * @param {string} type Toast type ('info', 'success', 'warning', 'error')
   * @param {string} message Toast message
   * @returns {Cypress.Chainable} Cypress chainable containing the toast
   */
  createToast(type = 'info', message = null) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const toast = this.uiStateGenerators.generateToast(type, message);
      return cy.wrap(toast);
    });
  }
  
  /**
   * Create a list of notifications
   * @param {string} type Notification type
   * @param {number} count Number of notifications to create
   * @returns {Cypress.Chainable} Cypress chainable containing the notifications
   */
  createNotifications(type = 'info', count = 1) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const notifications = this.uiStateGenerators.generateNotifications(type, count);
      return cy.wrap(notifications);
    });
  }
  
  /**
   * Create a simple integration flow
   * @param {Object} options Flow options
   * @returns {Cypress.Chainable} Cypress chainable containing the flow
   */
  createSimpleFlow(options = {}) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const flow = this.integrationGenerators.generateSimpleFlow(options);
      return cy.wrap(flow);
    });
  }
  
  /**
   * Create an API success response
   * @param {Object} data Response data
   * @returns {Object} Success response
   */
  createSuccessResponse(data) {
    return {
      statusCode: 200,
      body: data
    };
  }
  
  /**
   * Create an API error response
   * @param {number} status HTTP status code
   * @param {string} message Error message
   * @returns {Object} Error response
   */
  createErrorResponse(status = 400, message = 'Bad Request') {
    return {
      statusCode: status,
      body: {
        error: message
      },
      headers: {
        'content-type': 'application/json'
      }
    };
  }

  /**
   * Validation Methods
   */

  validateUser(user) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const result = this.validators.validateUser(user);
      return cy.wrap(result);
    });
  }

  validateTenant(tenant) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const result = this.validators.validateTenant(tenant);
      return cy.wrap(result);
    });
  }

  validateApplication(application) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const result = this.validators.validateApplication(application);
      return cy.wrap(result);
    });
  }

  validateDataset(dataset) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const result = this.validators.validateDataset(dataset);
      return cy.wrap(result);
    });
  }

  validateIntegration(integration) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const result = this.validators.validateIntegration(integration);
      return cy.wrap(result);
    });
  }

  validateUserWithRelationships(user, context = {}) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const result = this.validators.validateUserWithRelationships(user, context);
      return cy.wrap(result);
    });
  }

  validateAllRelationships(context) {
    return cy.wrap(this._ensureInitialized()).then(() => {
      const result = this.validators.validateAllRelationships(context);
      return cy.wrap(result);
    });
  }

  createValidTestContext() {
    return cy.wrap(this._ensureInitialized()).then(() => {
      // Create a set of entities with valid relationships
      const tenant = this.entityGenerators.generateTenant({ id: 'tenant-test-1' });
      const user = this.entityGenerators.generateUser({ 
        id: 'user-test-1', 
        tenantId: tenant.id
      });
      const application = this.entityGenerators.generateApplication({
        id: 'app-test-1',
        tenantId: tenant.id
      });
      const dataset = this.entityGenerators.generateDataset({
        id: 'dataset-test-1',
        tenantId: tenant.id,
        sourceId: application.id,
        source: 'application'
      });
      const integration = this.entityGenerators.generateIntegration({
        id: 'integration-test-1',
        tenantId: tenant.id,
        createdBy: user.id
      });
      
      const context = {
        tenants: [tenant],
        users: [user],
        applications: [application],
        datasets: [dataset],
        integrations: [integration]
      };
      
      return cy.wrap(context);
    });
  }
  
  /**
   * Set up an integration test environment with user, tenant, and integration
   * @returns {Cypress.Chainable} Cypress chainable containing the test data
   */
  setupIntegrationTestData() {
    return cy.wrap(this._ensureInitialized()).then(() => {
      // Generate coherent set of test data
      const tenant = this.entityGenerators.generateTenant();
      const user = this.entityGenerators.generateUser({ tenantId: tenant.id });
      const integration = this.entityGenerators.generateIntegration({ 
        tenantId: tenant.id,
        createdBy: user.id
      });
      
      // Set up API mocks
      cy.intercept('GET', '**/api/tenants/*', {
        statusCode: 200,
        body: tenant
      }).as('getTenant');
      
      cy.intercept('GET', '**/api/users/*', {
        statusCode: 200,
        body: user
      }).as('getUser');
      
      cy.intercept('GET', '**/api/integrations/*', {
        statusCode: 200,
        body: integration
      }).as('getIntegration');
      
      // Return the generated data
      return cy.wrap({ tenant, user, integration });
    });
  }
}

// Create singleton instance
const mockFactoryAdapter = new CypressMockFactory();

// Export the adapter
export default mockFactoryAdapter;