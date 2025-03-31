// cypress/e2e/flows/error-handling-recovery.cy.js

/**
 * End-to-End Test for Error Handling and Recovery
 * 
 * This test verifies system-wide error handling capabilities:
 * 1. Network error detection and recovery
 * 2. API error handling and user feedback
 * 3. Validation error handling and resolution
 * 4. Authentication error recovery
 * 5. Resource access error handling
 */
describe('Error Handling and Recovery', () => {
  // Test data - admin user
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!',
    fullName: 'Admin User'
  };
  
  // Test data - regular user
  const regularUser = {
    email: 'user@tapplatform.test',
    password: 'User1234!'
  };
  
  // Setup test data and login before tests
  before(() => {
    // Reset test database to ensure clean state
    cy.request('POST', '/api/test/reset-db', { scope: 'error_tests' });
    
    // Login as admin user for initial setup
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification for admin
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Create test integration for error testing
    cy.createIntegration({
      name: 'Error Test Integration',
      description: 'Integration for testing error handling',
      type: 'DATA_TRANSFORMATION',
      schedule: 'MANUAL',
      tags: ['test', 'error', 'e2e']
    }).then(integration => {
      // Store the integration ID for later use
      cy.wrap(integration.id).as('testIntegrationId');
    });
  });
  
  it('handles network connectivity errors', function() {
    // Define UI elements that should display error state
    const errorDisplaySelector = '[data-testid="connection-error-message"]';
    const retryButtonSelector = '[data-testid="retry-connection-button"]';
    
    // Navigate to integrations page
    cy.navigateToIntegrations();
    
    // Simulate network timeout error for API calls
    cy.simulateNetworkError({
      url: '**/api/integrations**',
      errorType: 'timeout',
      duration: 5000
    });
    
    // Attempt to perform an action that requires API communication
    cy.get('[data-testid="refresh-button"]').click();
    
    // Verify error handling UI appears
    cy.verifyErrorHandling({
      selector: errorDisplaySelector,
      contains: 'connection'
    });
    
    // Verify retry mechanism works
    cy.testErrorRecovery({
      actionSelector: retryButtonSelector,
      waitForSelector: '[data-testid="integrations-table"]'
    });
    
    // Verify integrations list loaded correctly after recovery
    cy.get('[data-testid="integrations-table"]').should('be.visible');
    cy.get('[data-testid="integration-row"]').should('have.length.at.least', 1);
    
    // Simulate network disconnection
    cy.simulateNetworkError({
      errorType: 'offline',
      duration: 3000
    });
    
    // Try to create a new integration
    cy.get('[data-testid="create-integration-button"]').click();
    
    // Verify offline error is shown
    cy.verifyErrorHandling({
      selector: '[data-testid="offline-error-message"]',
      contains: 'offline'
    });
    
    // Wait for simulated connection to restore
    cy.wait(3500);
    
    // Verify automatic reconnection
    cy.get('[data-testid="create-integration-dialog"]').should('be.visible');
    
    // Close the dialog
    cy.get('[data-testid="cancel-button"]').click();
  });
  
  it('handles API error responses', function() {
    // Navigate to integrations page
    cy.navigateToIntegrations();
    
    // Get test integration ID
    const integrationId = this.testIntegrationId;
    
    // Simulate server error on specific API endpoint
    cy.simulateApiError({
      url: `**/api/integrations/${integrationId}`,
      statusCode: 500,
      body: { error: 'Internal server error', message: 'Unable to process your request' }
    });
    
    // Attempt to view the integration details
    cy.get(`[data-testid="integration-row-${integrationId}"]`).click();
    
    // Verify error handling UI appears
    cy.verifyErrorHandling({
      selector: '[data-testid="api-error-message"]',
      contains: 'Unable to process'
    });
    
    // Test error reporting
    cy.verifyErrorReporting({
      checkConsole: true,
      logSelector: '[data-testid="error-details"]',
      contains: 'Internal server error'
    });
    
    // Test retry mechanism
    cy.get('[data-testid="retry-button"]').click();
    
    // Remove error simulation to allow retry to succeed
    cy.intercept(`**/api/integrations/${integrationId}`).as('integrationRetry');
    
    // Wait for retry to complete
    cy.wait('@integrationRetry');
    
    // Verify successful recovery
    cy.get('[data-testid="integration-details"]').should('be.visible');
    cy.get('[data-testid="integration-name"]').should('contain', 'Error Test Integration');
  });
  
  it('handles validation errors', function() {
    // Navigate to create integration page
    cy.navigateToIntegrations();
    cy.get('[data-testid="create-integration-button"]').click();
    
    // Submit form with invalid data
    cy.get('[data-testid="integration-name-input"]').clear();
    cy.get('[data-testid="save-button"]').click();
    
    // Verify validation error handling
    cy.verifyErrorHandling({
      selector: '[data-testid="name-error-message"]',
      contains: 'required'
    });
    
    // Verify field-level error styling
    cy.get('[data-testid="integration-name-input"]').should('have.class', 'error');
    
    // Fix the validation error
    cy.get('[data-testid="integration-name-input"]').type('Validation Test Integration');
    
    // Verify error clears on input change
    cy.get('[data-testid="name-error-message"]').should('not.exist');
    cy.get('[data-testid="integration-name-input"]').should('not.have.class', 'error');
    
    // Submit valid form
    cy.get('[data-testid="save-button"]').click();
    
    // Verify successful submission
    cy.get('[data-testid="integration-created-message"]').should('be.visible');
    
    // Test complex validation in integration builder
    cy.get('[data-testid="open-builder-button"]').click();
    
    // Add nodes without proper configuration
    cy.addNode('SOURCE', { x: 200, y: 200 });
    cy.addNode('DESTINATION', { x: 600, y: 200 });
    
    // Try to save without configuring or connecting nodes
    cy.get('[data-testid="save-flow-button"]').click();
    
    // Verify validation errors for node configuration
    cy.verifyErrorHandling({
      selector: '[data-testid="validation-error-panel"]',
      contains: 'configuration required'
    });
    
    // Verify node-level error indicators
    cy.get('[data-testid="node-error-indicator"]').should('have.length', 2);
    
    // Test error navigation - clicking on error should focus the problematic node
    cy.get('[data-testid="validation-error-item"]').first().click();
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    
    // Navigate back to integrations list
    cy.navigateToIntegrations();
  });
  
  it('handles authentication errors', function() {
    // Test session timeout handling
    
    // First, navigate to a protected page
    cy.navigateToIntegrations();
    
    // Simulate token expiration
    cy.simulateAuthenticationError({
      type: 'expired-token'
    });
    
    // Attempt to perform an authenticated action
    cy.get('[data-testid="refresh-button"]').click();
    
    // Verify redirect to login page with appropriate message
    cy.url().should('include', '/login');
    cy.verifyErrorHandling({
      selector: '[data-testid="session-expired-message"]',
      contains: 'session has expired'
    });
    
    // Test re-authentication flow
    cy.get('[data-testid="email-input"]').should('be.visible').type(regularUser.email);
    cy.get('[data-testid="password-input"]').should('be.visible').type(regularUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Verify MFA verification dialog appears
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Verify redirect to original destination after re-authentication
    cy.url().should('include', '/integrations');
    cy.get('[data-testid="integrations-table"]').should('be.visible');
    
    // Test "remember me" persistence after authentication error
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Login with "remember me" checked
    cy.get('[data-testid="email-input"]').type(regularUser.email);
    cy.get('[data-testid="password-input"]').type(regularUser.password);
    cy.get('[data-testid="remember-me-checkbox"]').check();
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Simulate token refresh error
    cy.simulateAuthenticationError({
      type: 'invalid-token'
    });
    
    // Attempt action requiring authentication
    cy.get('[data-testid="refresh-button"]').click();
    
    // Verify silent token refresh attempt
    cy.get('[data-testid="authentication-refreshing"]').should('exist');
    
    // Remove error simulation to allow recovery
    cy.intercept('**/api/auth/refresh', {
      statusCode: 200,
      body: { token: 'new-valid-token', expires_in: 3600 }
    }).as('tokenRefresh');
    
    // Verify successful recovery without requiring re-login
    cy.get('[data-testid="integrations-table"]').should('be.visible');
  });
  
  it('handles resource access errors', function() {
    // Navigate to integrations list
    cy.navigateToIntegrations();
    
    // Create a new integration for permission testing
    cy.createIntegration({
      name: 'Permission Test Integration',
      description: 'Integration for testing permission errors',
      type: 'DATA_TRANSFORMATION',
      schedule: 'MANUAL'
    }).then(integration => {
      // Simulate forbidden error for specific resource
      cy.simulateResourceError({
        url: `**/api/integrations/${integration.id}/execute`,
        type: 'forbidden'
      });
      
      // Attempt to execute the integration
      cy.get(`[data-testid="integration-row-${integration.id}"]`).click();
      cy.get('[data-testid="run-integration-button"]').click();
      
      // Verify permission error handling
      cy.verifyErrorHandling({
        selector: '[data-testid="permission-error-message"]',
        contains: 'Access denied'
      });
      
      // Verify error logging and reporting
      cy.verifyErrorReporting({
        checkConsole: true,
        logSelector: '[data-testid="error-details"]',
        contains: 'permission'
      });
      
      // Test not found error
      cy.simulateResourceError({
        url: `**/api/integrations/nonexistent-id`,
        type: 'not-found'
      });
      
      // Attempt to navigate to nonexistent resource
      cy.visit('/integrations/nonexistent-id', { failOnStatusCode: false });
      
      // Verify not found error handling
      cy.verifyErrorHandling({
        selector: '[data-testid="not-found-message"]',
        contains: 'not found'
      });
      
      // Verify navigation fallback
      cy.get('[data-testid="return-to-list-button"]').click();
      cy.url().should('include', '/integrations');
      
      // Simulate resource conflict
      cy.simulateResourceError({
        url: `**/api/integrations/${integration.id}`,
        type: 'conflict'
      });
      
      // Attempt concurrent modification
      cy.get(`[data-testid="integration-row-${integration.id}"]`).click();
      cy.get('[data-testid="edit-button"]').click();
      cy.get('[data-testid="integration-name-input"]').clear().type('Updated Name');
      cy.get('[data-testid="save-button"]').click();
      
      // Verify conflict error handling
      cy.verifyErrorHandling({
        selector: '[data-testid="conflict-error-message"]',
        contains: 'conflict'
      });
      
      // Test conflict resolution - force save option
      cy.get('[data-testid="force-save-button"]').click();
      
      // Remove conflict simulation for resolution
      cy.intercept('PUT', `**/api/integrations/${integration.id}`, {
        statusCode: 200,
        body: { id: integration.id, name: 'Updated Name' }
      }).as('forceSave');
      
      // Verify successful resolution
      cy.wait('@forceSave');
      cy.get('[data-testid="save-success-message"]').should('be.visible');
    });
  });
  
  after(() => {
    // Clean up test data
    cy.request('POST', '/api/test/reset-db', { scope: 'error_tests' });
    
    // Logout
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });
});