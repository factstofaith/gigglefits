// cypress/e2e/flows/error-recovery.cy.js

/**
 * End-to-End Test for Error Recovery
 * 
 * This test verifies the error recovery capabilities:
 * 1. Flow validation error recovery
 * 2. Connection error recovery
 * 3. Execution error recovery
 * 4. Form validation error recovery
 * 5. API error recovery
 * 6. Data validation error recovery
 * 7. Error logging and monitoring
 */
describe('Error Recovery', () => {
  // Test data - admin user
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!',
    fullName: 'Admin User'
  };
  
  before(() => {
    // Clean the test database for testing
    cy.request('POST', '/api/test/reset-db', { scope: ['integrations', 'connections', 'errors'] });
    
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification for admin
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
  });
  
  describe('Flow Validation Error Recovery', () => {
    it('detects and visualizes flow validation errors', function() {
      // Load test data from fixture
      cy.fixture('errors/flow_validation_errors.json').then(flowErrors => {
        // Create test integration
        cy.createIntegration(flowErrors.testIntegration).then(createdIntegration => {
          // Store the integration ID for later use
          const integrationId = createdIntegration.id;
          cy.wrap(integrationId).as('testIntegrationId');
          
          // Create a flow with validation errors
          cy.createFlowWithValidationErrors(integrationId).then(nodeIds => {
            // Store node IDs for later use
            cy.wrap(nodeIds).as('flowNodeIds');
            
            // Verify validation errors are detected and visualized
            cy.verifyFlowValidationErrors().then(errorCount => {
              // Should have at least one error
              expect(errorCount).to.be.at.least(1);
              
              // Check for specific error messages
              cy.get('[data-testid="validation-error-list"]').within(() => {
                cy.contains(flowErrors.expectedErrors.missingConnection.message);
                cy.contains(flowErrors.expectedErrors.missingConfiguration.message);
              });
              
              // Check for error indicators on nodes
              cy.get(`[data-testid="node-${nodeIds.transformNodeId}"]`).find('[data-testid="node-error-indicator"]').should('be.visible');
              cy.get(`[data-testid="node-${nodeIds.sourceNodeId}"]`).find('[data-testid="node-error-indicator"]').should('be.visible');
            });
          });
        });
      });
    });
    
    it('recovers from flow validation errors', function() {
      // Get the integration ID and node IDs from previous test
      const integrationId = this.testIntegrationId;
      const nodeIds = this.flowNodeIds;
      
      // Fix the flow validation errors
      cy.fixFlowValidationErrors(nodeIds);
      
      // Verify errors are resolved
      cy.get('[data-testid="validation-success-message"]').should('be.visible');
      cy.get('[data-testid="node-error-indicator"]').should('not.exist');
      
      // Verify validation panel shows no errors
      cy.get('[data-testid="validation-error-count"]').should('contain', '0');
      
      // Save the integration for later tests
      cy.wrap(integrationId).as('validIntegrationId');
    });
  });
  
  describe('Connection Error Recovery', () => {
    it('detects and visualizes connection errors', function() {
      // Load test data from fixture
      cy.fixture('errors/connection_errors.json').then(connectionErrors => {
        // Create API connection with errors
        cy.createConnectionWithErrors('API').then(createdConnection => {
          // Store the connection ID for later use
          cy.wrap(createdConnection.id).as('invalidApiConnectionId');
          
          // Test connection and observe errors
          cy.testInvalidConnection(createdConnection.id).then(errorDetails => {
            // Should contain expected error message
            expect(errorDetails).to.include(connectionErrors.invalidConnections.api.expectedError.details);
            
            // Verify error visualization
            cy.get('[data-testid="connection-error-message"]').should('contain', connectionErrors.invalidConnections.api.expectedError.message);
            cy.get('[data-testid="connection-error-icon"]').should('be.visible');
            
            // Verify error recovery guidance is shown
            cy.get('[data-testid="error-recovery-steps"]').should('be.visible');
            cy.get('[data-testid="edit-connection-button"]').should('be.visible');
          });
        });
      });
    });
    
    it('recovers from connection errors', function() {
      // Get the invalid connection ID from previous test
      const connectionId = this.invalidApiConnectionId;
      
      // Fix the connection errors
      cy.fixConnectionErrors(connectionId, 'API');
      
      // Test the fixed connection
      cy.testInvalidConnection(connectionId).then(errorDetails => {
        // Should not contain error messages
        expect(errorDetails).to.be.empty;
        
        // Verify success message
        cy.get('[data-testid="connection-success-message"]').should('be.visible');
        cy.get('[data-testid="connection-error-message"]').should('not.exist');
      });
    });
  });
  
  describe('Execution Error Recovery', () => {
    it('detects and visualizes execution errors', function() {
      // Load test data from fixture
      cy.fixture('errors/execution_errors.json').then(executionErrors => {
        // Create integration with execution errors
        cy.createIntegrationWithExecutionErrors(executionErrors.integrationWithExecutionErrors).then(integrationId => {
          // Store the integration ID for later use
          cy.wrap(integrationId).as('executionErrorIntegrationId');
          
          // Mock the execution API for error case
          cy.intercept('POST', `/api/integrations/${integrationId}/execute`, {
            statusCode: 200,
            body: { executionId: 'error-execution-id' }
          }).as('executeIntegration');
          
          // Mock execution status API for error case
          cy.intercept('GET', '/api/executions/error-execution-id', {
            statusCode: 200,
            body: executionErrors.executionResults.failed
          }).as('getExecutionStatus');
          
          // Run integration and observe execution errors
          cy.visit(`/integrations/${integrationId}`);
          cy.get('[data-testid="run-integration-button"]').click();
          
          // Wait for execution to start
          cy.wait('@executeIntegration');
          
          // Navigate to execution details
          cy.visit('/executions/error-execution-id');
          
          // Wait for execution status
          cy.wait('@getExecutionStatus');
          
          // Verify execution failed
          cy.get('[data-testid="execution-status"]').should('contain', 'FAILED');
          
          // Verify error details
          cy.get('[data-testid="execution-error"]').should('contain', executionErrors.expectedErrors.apiFailure.message);
          
          // Verify error visualization
          cy.get('[data-testid="error-node-indicator"]').should('be.visible');
          
          // Verify error recovery guidance
          cy.get('[data-testid="error-recovery-guidance"]').should('be.visible');
          cy.get('[data-testid="edit-integration-button"]').should('be.visible');
        });
      });
    });
    
    it('recovers from execution errors', function() {
      // Get the integration ID from previous test
      const integrationId = this.executionErrorIntegrationId;
      
      // Load test data from fixture
      cy.fixture('errors/execution_errors.json').then(executionErrors => {
        // Fix the integration execution errors
        cy.fixIntegrationExecutionErrors(integrationId);
        
        // Mock the execution API for success case
        cy.intercept('POST', `/api/integrations/${integrationId}/execute`, {
          statusCode: 200,
          body: { executionId: 'success-execution-id' }
        }).as('executeIntegration');
        
        // Mock execution status API for success case
        cy.intercept('GET', '/api/executions/success-execution-id', {
          statusCode: 200,
          body: executionErrors.executionResults.successful
        }).as('getExecutionStatus');
        
        // Run the fixed integration
        cy.visit(`/integrations/${integrationId}`);
        cy.get('[data-testid="run-integration-button"]').click();
        
        // Wait for execution to start
        cy.wait('@executeIntegration');
        
        // Navigate to execution details
        cy.visit('/executions/success-execution-id');
        
        // Wait for execution status
        cy.wait('@getExecutionStatus');
        
        // Verify execution succeeded
        cy.get('[data-testid="execution-status"]').should('contain', 'SUCCESS');
        
        // Verify no error indicators
        cy.get('[data-testid="execution-error"]').should('not.exist');
        cy.get('[data-testid="error-node-indicator"]').should('not.exist');
        
        // Verify execution details
        cy.get('[data-testid="items-processed"]').should('contain', '2');
      });
    });
  });
  
  describe('Form Validation Error Recovery', () => {
    it('detects and visualizes form validation errors', function() {
      // Load test data from fixture
      cy.fixture('errors/form_validation_errors.json').then(formErrors => {
        // Test user form validation
        cy.submitFormWithErrors('user').then(errorCount => {
          // Should have multiple errors
          expect(errorCount).to.be.at.least(1);
          
          // Verify specific error messages
          cy.get('[data-testid="form-error-summary"]').should('contain', formErrors.forms.user.expectedErrors.email);
          cy.get('[data-testid="form-error-summary"]').should('contain', formErrors.forms.user.expectedErrors.firstName);
          
          // Verify error field highlighting
          cy.get('[data-testid="user-email-input"]').should('have.class', 'error');
          cy.get('[data-testid="user-first-name-input"]').should('have.class', 'error');
          
          // Verify focus is set to first error field
          cy.focused().should('have.attr', 'data-testid', 'user-email-input');
        });
      });
    });
    
    it('recovers from form validation errors', function() {
      // Load test data from fixture
      cy.fixture('errors/form_validation_errors.json').then(formErrors => {
        // Fix form validation errors
        cy.fixFormValidationErrors('user');
        
        // Verify success message
        cy.get('[data-testid="success-message"]').should('be.visible');
        cy.get('[data-testid="form-error-summary"]').should('not.exist');
      });
    });
  });
  
  describe('API Error Recovery', () => {
    it('recovers from API errors', function() {
      // Load test data from fixture
      cy.fixture('errors/api_errors.json').then(apiErrors => {
        // Test server error recovery
        cy.simulateApiErrorAndVerifyRecovery(
          '/api/integrations', 
          apiErrors.endpoints.integrations.serverError.status,
          apiErrors.endpoints.integrations.serverError.message
        );
        
        // Test authentication error recovery
        cy.simulateApiErrorAndVerifyRecovery(
          '/api/users', 
          apiErrors.endpoints.users.authError.status,
          apiErrors.endpoints.users.authError.message
        );
        
        // Test timeout error recovery
        cy.simulateApiErrorAndVerifyRecovery(
          '/api/connections', 
          apiErrors.endpoints.connections.timeoutError.status,
          apiErrors.endpoints.connections.timeoutError.message
        );
      });
    });
  });
  
  describe('Data Validation Error Recovery', () => {
    it('detects and visualizes data validation errors', function() {
      // Load test data from fixture
      cy.fixture('errors/data_validation_errors.json').then(dataErrors => {
        // Test CSV data validation errors
        cy.createDataWithValidationErrors('csv').then(errorCount => {
          // Should have multiple errors
          expect(errorCount).to.be.at.least(1);
          
          // Verify error visualization
          cy.get('[data-testid="data-validation-errors"]').should('be.visible');
          cy.get('[data-testid="validation-error-count"]').should('contain', errorCount);
          
          // Verify specific error messages
          cy.get('[data-testid="validation-error-item"]').should('contain', dataErrors.csvData.expectedErrors[0].message);
          
          // Verify error recovery guidance
          cy.get('[data-testid="fix-data-button"]').should('be.visible');
        });
      });
    });
    
    it('recovers from data validation errors', function() {
      // Fix data validation errors
      cy.fixDataValidationErrors('csv');
      
      // Verify success message
      cy.get('[data-testid="import-success-message"]').should('be.visible');
      cy.get('[data-testid="data-validation-errors"]').should('not.exist');
    });
  });
  
  describe('Error Logging and Monitoring', () => {
    it('logs errors and provides monitoring tools', function() {
      // Mock error log API
      cy.fixture('errors/error_logs.json').then(errorLogs => {
        cy.intercept('GET', '/api/admin/error-logs*', {
          statusCode: 200,
          body: {
            logs: errorLogs.errorLogs,
            counts: {
              total: errorLogs.errorLogs.length,
              byType: errorLogs.errorCounts,
              bySeverity: errorLogs.severityCounts,
              bySource: errorLogs.sourceDistribution,
              byTime: errorLogs.timeDistribution
            }
          }
        }).as('getErrorLogs');
        
        // View error logs in dashboard
        cy.viewErrorLogsInDashboard().then(logCount => {
          // Verify log count
          expect(logCount).to.equal(errorLogs.errorLogs.length);
          
          // Verify error visualization
          cy.get('[data-testid="error-log-list"]').should('be.visible');
          cy.get('[data-testid="error-type-chart"]').should('be.visible');
          cy.get('[data-testid="error-severity-chart"]').should('be.visible');
          cy.get('[data-testid="error-source-chart"]').should('be.visible');
          cy.get('[data-testid="error-time-chart"]').should('be.visible');
          
          // Verify error filtering
          cy.get('[data-testid="error-type-filter"]').should('be.visible');
          cy.get('[data-testid="error-severity-filter"]').should('be.visible');
          cy.get('[data-testid="error-source-filter"]').should('be.visible');
          cy.get('[data-testid="error-time-filter"]').should('be.visible');
        });
      });
    });
    
    it('provides detailed error analysis', function() {
      // Analyze first error
      cy.analyzeErrorDetails(0).then(errorDetails => {
        // Verify error details
        expect(errorDetails.type).to.not.be.empty;
        expect(errorDetails.message).to.not.be.empty;
        expect(errorDetails.timestamp).to.not.be.empty;
        expect(errorDetails.source).to.not.be.empty;
        
        // Verify detailed error information
        cy.get('[data-testid="error-stack-trace"]').should('be.visible');
        cy.get('[data-testid="error-context-details"]').should('be.visible');
        
        // Verify error actions
        cy.get('[data-testid="mark-resolved-button"]').should('be.visible');
        cy.get('[data-testid="assign-error-button"]').should('be.visible');
      });
    });
  });
  
  after(() => {
    // Clean up test data
    cy.request('POST', '/api/test/reset-db', { scope: ['integrations', 'connections', 'errors'] });
    
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });
});