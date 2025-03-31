/**
 * Mock Factory for Jest Tests
 * 
 * This module provides a factory for creating consistent test data mocks 
 * across the codebase. It uses the shared test data generators to ensure
 * consistency between Jest and Cypress tests.
 * 
 * @version 1.0.0
 */

// Import from shared test data generators
import * as entityGenerators from '../../shared/testData/generators/entityGenerators';
import * as integrationGenerators from '../../shared/testData/generators/integrationGenerators';
import * as uiStateGenerators from '../../shared/testData/generators/uiStateGenerators';
import * as contextGenerators from '../../shared/testData/generators/contextGenerators';

// Import validators
import * as validators from '../../shared/testData/validators';

/**
 * Mock Factory class for generating consistent test data
 */
class MockFactory {
  /**
   * Entity Generators
   */
  
  // User
  createUser(overrides = {}) {
    return entityGenerators.generateUser(overrides);
  }
  
  createAdminUser(overrides = {}) {
    return entityGenerators.generateAdminUser(overrides);
  }
  
  createUserList(count = 3, overrides = {}) {
    return entityGenerators.generateUserList(count, overrides);
  }
  
  // Tenant
  createTenant(overrides = {}) {
    return entityGenerators.generateTenant(overrides);
  }
  
  createTenantList(count = 3, overrides = {}) {
    return entityGenerators.generateTenantList(count, overrides);
  }
  
  // Application
  createApplication(overrides = {}) {
    return entityGenerators.generateApplication(overrides);
  }
  
  createApplicationList(count = 3, overrides = {}) {
    return entityGenerators.generateApplicationList(count, overrides);
  }
  
  // Dataset
  createDataset(overrides = {}) {
    return entityGenerators.generateDataset(overrides);
  }
  
  createDatasetList(count = 3, overrides = {}) {
    return entityGenerators.generateDatasetList(count, overrides);
  }
  
  // Integration
  createIntegration(overrides = {}) {
    return entityGenerators.generateIntegration(overrides);
  }
  
  createIntegrationList(count = 3, overrides = {}) {
    return entityGenerators.generateIntegrationList(count, overrides);
  }
  
  // Other Entities
  createStorageConfig(overrides = {}) {
    return entityGenerators.generateStorageConfig(overrides);
  }
  
  createErrorLog(overrides = {}) {
    return entityGenerators.generateErrorLog(overrides);
  }
  
  createErrorLogList(count = 5, overrides = {}) {
    return entityGenerators.generateErrorLogList(count, overrides);
  }
  
  /**
   * Integration Flow Generators
   */
  
  createNode(options = {}) {
    return integrationGenerators.generateNode(options);
  }
  
  createEdge(options = {}) {
    return integrationGenerators.generateEdge(options);
  }
  
  createSimpleFlow(options = {}) {
    return integrationGenerators.generateSimpleFlow(options);
  }
  
  createBranchingFlow(options = {}) {
    return integrationGenerators.generateBranchingFlow(options);
  }
  
  createComplexFlow(options = {}) {
    return integrationGenerators.generateComplexFlow(options);
  }
  
  createIntegrationWithFlow(options = {}) {
    return integrationGenerators.generateIntegrationWithFlow(options);
  }
  
  createIntegrationWithFlowList(count = 3, options = {}) {
    return integrationGenerators.generateIntegrationWithFlowList(count, options);
  }
  
  /**
   * UI State Generators
   */
  
  createFormValidationErrors(fields = {}) {
    return uiStateGenerators.generateFormValidationErrors(fields);
  }
  
  createNotifications(type = 'info', count = 1) {
    return uiStateGenerators.generateNotifications(type, count);
  }
  
  createLoadingState(components = ['table', 'form', 'dashboard']) {
    return uiStateGenerators.generateLoadingState(components);
  }
  
  createPaginationState(totalItems = 100, itemsPerPage = 10, currentPage = 1) {
    return uiStateGenerators.generatePaginationState(totalItems, itemsPerPage, currentPage);
  }
  
  createSortState(column = 'name', direction = 'asc') {
    return uiStateGenerators.generateSortState(column, direction);
  }
  
  createFilterState(filters = {}) {
    return uiStateGenerators.generateFilterState(filters);
  }
  
  createNavigationState(activeItem = 'dashboard', isCollapsed = false) {
    return uiStateGenerators.generateNavigationState(activeItem, isCollapsed);
  }
  
  createFormState(values = {}) {
    return uiStateGenerators.generateFormState(values);
  }
  
  createDialogState(type = 'confirmation', isOpen = false) {
    return uiStateGenerators.generateDialogState(type, isOpen);
  }
  
  createToast(type = 'info', message = null) {
    return uiStateGenerators.generateToast(type, message);
  }
  
  createToastList(count = 3) {
    return uiStateGenerators.generateToastList(count);
  }
  
  createThemeState(mode = 'light', highContrast = false) {
    return uiStateGenerators.generateThemeState(mode, highContrast);
  }
  
  createDashboardState() {
    return uiStateGenerators.generateDashboardState();
  }
  
  /**
   * Context Generators
   */
  
  createUserContext(options = {}) {
    return contextGenerators.generateUserContext(options);
  }
  
  createTenantContext(options = {}) {
    return contextGenerators.generateTenantContext(options);
  }
  
  createNotificationContext(options = {}) {
    return contextGenerators.generateNotificationContext(options);
  }
  
  createIntegrationContext(options = {}) {
    return contextGenerators.generateIntegrationContext(options);
  }
  
  createApplicationContext(options = {}) {
    return contextGenerators.generateApplicationContext(options);
  }
  
  createDatasetContext(options = {}) {
    return contextGenerators.generateDatasetContext(options);
  }
  
  createThemeContext(options = {}) {
    return contextGenerators.generateThemeContext(options);
  }
  
  createSettingsContext(options = {}) {
    return contextGenerators.generateSettingsContext(options);
  }
  
  createTestContexts(options = {}) {
    return contextGenerators.generateTestContexts(options);
  }
  
  /**
   * Mock API Response Creation
   */
  
  createSuccessResponse(data) {
    return {
      data,
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json'
      }
    };
  }
  
  createErrorResponse(status = 400, message = 'Bad Request') {
    return {
      response: {
        data: {
          error: message
        },
        status,
        statusText: message,
        headers: {
          'content-type': 'application/json'
        }
      }
    };
  }
  
  /**
   * Validation Methods
   */
  
  validateUser(user) {
    return validators.validateUser(user);
  }
  
  validateTenant(tenant) {
    return validators.validateTenant(tenant);
  }
  
  validateApplication(application) {
    return validators.validateApplication(application);
  }
  
  validateDataset(dataset) {
    return validators.validateDataset(dataset);
  }
  
  validateIntegration(integration) {
    return validators.validateIntegration(integration);
  }
  
  validateUserWithRelationships(user, context = {}) {
    return validators.validateUserWithRelationships(user, context);
  }
  
  validateAllRelationships(context) {
    return validators.validateAllRelationships(context);
  }
  
  createValidTestContext() {
    // Create a set of entities with valid relationships
    const tenant = this.createTenant({ id: 'tenant-test-1' });
    const user = this.createUser({ 
      id: 'user-test-1', 
      tenantId: tenant.id
    });
    const application = this.createApplication({
      id: 'app-test-1',
      tenantId: tenant.id
    });
    const dataset = this.createDataset({
      id: 'dataset-test-1',
      tenantId: tenant.id,
      sourceId: application.id,
      source: 'application'
    });
    const integration = this.createIntegration({
      id: 'integration-test-1',
      tenantId: tenant.id,
      createdBy: user.id
    });
    
    return {
      tenants: [tenant],
      users: [user],
      applications: [application],
      datasets: [dataset],
      integrations: [integration]
    };
  }
  
  /**
   * Mock Service Worker (MSW) Response Handlers
   */
  
  createMswHandlers() {
    // This would be generated based on standard API patterns
    return {
      users: {
        getAll: () => this.createSuccessResponse(this.createUserList()),
        getById: (id) => this.createSuccessResponse(this.createUser({ id })),
        create: (data) => this.createSuccessResponse(this.createUser(data)),
        update: (id, data) => this.createSuccessResponse(this.createUser({ id, ...data })),
        delete: (id) => this.createSuccessResponse({ success: true })
      },
      integrations: {
        getAll: () => this.createSuccessResponse(this.createIntegrationList()),
        getById: (id) => this.createSuccessResponse(this.createIntegration({ id })),
        create: (data) => this.createSuccessResponse(this.createIntegration(data)),
        update: (id, data) => this.createSuccessResponse(this.createIntegration({ id, ...data })),
        delete: (id) => this.createSuccessResponse({ success: true }),
        execute: (id) => this.createSuccessResponse({ 
          id, 
          executionId: `exec-${Math.random().toString(36).substr(2, 9)}`,
          status: 'running'
        })
      },
      // Add additional handlers as needed
    };
  }
}

// Export singleton instance
export default new MockFactory();