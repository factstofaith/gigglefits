// cypress/support/error-recovery-commands.js

/**
 * Custom Cypress commands for error recovery testing
 * 
 * These commands provide abstracted functionality for:
 * - Error simulation
 * - Error validation
 * - Error recovery testing
 * - Error logging analysis
 */

// Create an integration flow with validation errors
Cypress.Commands.add('createFlowWithValidationErrors', (integrationId) => {
  // Open integration builder
  cy.visit(`/integrations/${integrationId}/builder`);
  
  // Clear any existing nodes
  cy.get('[data-testid="clear-flow-button"]').click();
  cy.get('[data-testid="confirm-clear-button"]').click();
  
  // Add source node without configuration
  cy.get('[data-testid="add-node-button"]').click();
  cy.get('[data-testid="node-type-JSON_SOURCE"]').click();
  cy.get('[data-testid="flow-canvas"]').click(200, 200);
  
  // Add destination node without configuration
  cy.get('[data-testid="add-node-button"]').click();
  cy.get('[data-testid="node-type-JSON_DESTINATION"]').click();
  cy.get('[data-testid="flow-canvas"]').click(400, 200);
  
  // Add transform node without configuration
  cy.get('[data-testid="add-node-button"]').click();
  cy.get('[data-testid="node-type-TRANSFORM"]').click();
  cy.get('[data-testid="flow-canvas"]').click(300, 300);
  
  // Get node IDs
  cy.get('[data-node-type="JSON_SOURCE"]').first().invoke('attr', 'data-node-id').as('sourceNodeId');
  cy.get('[data-node-type="JSON_DESTINATION"]').first().invoke('attr', 'data-node-id').as('destNodeId');
  cy.get('[data-node-type="TRANSFORM"]').first().invoke('attr', 'data-node-id').as('transformNodeId');
  
  // Connect source to transform (correct)
  cy.get('@sourceNodeId').then(sourceNodeId => {
    cy.get('@transformNodeId').then(transformNodeId => {
      cy.connectNodes(sourceNodeId, transformNodeId);
    });
  });
  
  // Don't connect transform to destination (error)
  
  // Save the flow to trigger validation
  cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
  cy.get('[data-testid="save-flow-button"]').click();
  cy.wait('@saveFlow');
  
  // Return the node IDs
  return cy.get('@sourceNodeId').then(sourceNodeId => {
    return cy.get('@destNodeId').then(destNodeId => {
      return cy.get('@transformNodeId').then(transformNodeId => {
        return cy.wrap({
          sourceNodeId,
          destNodeId,
          transformNodeId
        });
      });
    });
  });
});

// Verify validation errors in the flow
Cypress.Commands.add('verifyFlowValidationErrors', () => {
  // Check for validation panel visibility
  cy.get('[data-testid="validation-panel"]').should('be.visible');
  
  // Check for error count
  cy.get('[data-testid="validation-error-count"]').should('contain.text');
  
  // Check for error indicators on nodes
  cy.get('[data-testid="node-error-indicator"]').should('exist');
  
  // Get error count for assertions
  return cy.get('[data-testid="validation-error-count"]').invoke('text').then(text => {
    const errorCount = parseInt(text.match(/\d+/)[0], 10);
    return cy.wrap(errorCount);
  });
});

// Fix flow validation errors
Cypress.Commands.add('fixFlowValidationErrors', (nodeIds) => {
  // Configure source node
  cy.get(`[data-testid="node-${nodeIds.sourceNodeId}"]`).click();
  cy.get('[data-testid="node-properties-panel"]').should('be.visible');
  
  // Add simple JSON source configuration
  cy.get('[data-testid="source-type-select"]').select('INLINE');
  cy.get('[data-testid="source-data-editor"]').type('{"test": "data"}');
  cy.get('[data-testid="apply-node-config-button"]').click();
  
  // Configure transform node
  cy.get(`[data-testid="node-${nodeIds.transformNodeId}"]`).click();
  cy.get('[data-testid="node-properties-panel"]').should('be.visible');
  
  // Add simple field mapping
  cy.get('[data-testid="add-field-mapping-button"]').click();
  cy.get('[data-testid="source-field-input"]').last().type('test');
  cy.get('[data-testid="target-field-input"]').last().type('result');
  cy.get('[data-testid="apply-node-config-button"]').click();
  
  // Configure destination node
  cy.get(`[data-testid="node-${nodeIds.destNodeId}"]`).click();
  cy.get('[data-testid="node-properties-panel"]').should('be.visible');
  
  // Add JSON destination configuration
  cy.get('[data-testid="destination-type-select"]').select('MEMORY');
  cy.get('[data-testid="destination-format-select"]').select('JSON');
  cy.get('[data-testid="apply-node-config-button"]').click();
  
  // Connect transform to destination
  cy.connectNodes(nodeIds.transformNodeId, nodeIds.destNodeId);
  
  // Save the flow
  cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
  cy.get('[data-testid="save-flow-button"]').click();
  cy.wait('@saveFlow');
});

// Create connection with errors
Cypress.Commands.add('createConnectionWithErrors', (connectionType = 'API') => {
  // Navigate to connections page
  cy.visit('/admin/connections');
  cy.get('[data-testid="add-connection-button"]').click();
  
  // Select connection type
  cy.get('[data-testid="connection-type-select"]').select(connectionType);
  
  // Fill out basic connection info
  cy.get('[data-testid="connection-name-input"]').type(`Test Invalid ${connectionType} Connection`);
  cy.get('[data-testid="connection-description-input"]').type(`Test connection with invalid credentials for ${connectionType}`);
  
  // Fill out connection-specific fields
  switch (connectionType) {
    case 'API':
      cy.get('[data-testid="api-url-input"]').type('https://invalid-api.example.com');
      cy.get('[data-testid="api-key-input"]').type('invalid_api_key');
      break;
      
    case 'DATABASE':
      cy.get('[data-testid="database-host-input"]').type('invalid-db.example.com');
      cy.get('[data-testid="database-name-input"]').type('test_db');
      cy.get('[data-testid="database-username-input"]').type('invalid_user');
      cy.get('[data-testid="database-password-input"]').type('invalid_password');
      break;
      
    case 'OAUTH':
      cy.get('[data-testid="oauth-provider-select"]').select('CUSTOM');
      cy.get('[data-testid="oauth-client-id-input"]').type('invalid_client_id');
      cy.get('[data-testid="oauth-client-secret-input"]').type('invalid_client_secret');
      cy.get('[data-testid="oauth-token-url-input"]').type('https://invalid-oauth.example.com/token');
      cy.get('[data-testid="oauth-auth-url-input"]').type('https://invalid-oauth.example.com/authorize');
      break;
  }
  
  // Save the connection
  cy.intercept('POST', '/api/connections').as('saveConnection');
  cy.get('[data-testid="save-connection-button"]').click();
  
  // Wait for save to complete
  cy.wait('@saveConnection').then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    return cy.wrap(interception.response.body);
  });
});

// Test connection validation and observe errors
Cypress.Commands.add('testInvalidConnection', (connectionId) => {
  // Navigate to connection details
  cy.visit(`/admin/connections/${connectionId}`);
  
  // Test connection
  cy.intercept('POST', `/api/connections/${connectionId}/test`).as('testConnection');
  cy.get('[data-testid="test-connection-button"]').click();
  
  // Wait for test to complete
  cy.wait('@testConnection');
  
  // Check for error messages
  cy.get('[data-testid="connection-error-message"]').should('be.visible');
  cy.get('[data-testid="connection-error-details"]').should('be.visible');
  
  // Return error details for assertions
  return cy.get('[data-testid="connection-error-details"]').invoke('text');
});

// Fix connection errors
Cypress.Commands.add('fixConnectionErrors', (connectionId, connectionType = 'API') => {
  // Navigate to connection edit page
  cy.visit(`/admin/connections/${connectionId}/edit`);
  
  // Update connection-specific fields with valid values
  switch (connectionType) {
    case 'API':
      cy.get('[data-testid="api-url-input"]').clear().type('https://valid-api.example.com');
      cy.get('[data-testid="api-key-input"]').clear().type('valid_api_key');
      break;
      
    case 'DATABASE':
      cy.get('[data-testid="database-host-input"]').clear().type('valid-db.example.com');
      cy.get('[data-testid="database-username-input"]').clear().type('valid_user');
      cy.get('[data-testid="database-password-input"]').clear().type('valid_password');
      break;
      
    case 'OAUTH':
      cy.get('[data-testid="oauth-client-id-input"]').clear().type('valid_client_id');
      cy.get('[data-testid="oauth-client-secret-input"]').clear().type('valid_client_secret');
      cy.get('[data-testid="oauth-token-url-input"]').clear().type('https://valid-oauth.example.com/token');
      cy.get('[data-testid="oauth-auth-url-input"]').clear().type('https://valid-oauth.example.com/authorize');
      break;
  }
  
  // Save the updated connection
  cy.intercept('PUT', `/api/connections/${connectionId}`).as('updateConnection');
  cy.get('[data-testid="save-connection-button"]').click();
  
  // Wait for update to complete
  cy.wait('@updateConnection').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});

// Create an integration with execution errors
Cypress.Commands.add('createIntegrationWithExecutionErrors', (integrationConfig) => {
  // Create basic integration
  cy.createIntegration(integrationConfig).then(createdIntegration => {
    // Store integration ID
    const integrationId = createdIntegration.id;
    
    // Open integration builder
    cy.visit(`/integrations/${integrationId}/builder`);
    
    // Add source node with invalid configuration
    cy.get('[data-testid="add-node-button"]').click();
    cy.get('[data-testid="node-type-API_SOURCE"]').click();
    cy.get('[data-testid="flow-canvas"]').click(200, 200);
    
    // Configure source with invalid API endpoint
    cy.get('[data-node-type="API_SOURCE"]').first().click();
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    cy.get('[data-testid="api-url-input"]').type('https://invalid-api.example.com/data');
    cy.get('[data-testid="apply-node-config-button"]').click();
    
    // Add destination node
    cy.get('[data-testid="add-node-button"]').click();
    cy.get('[data-testid="node-type-JSON_DESTINATION"]').click();
    cy.get('[data-testid="flow-canvas"]').click(400, 200);
    
    // Configure destination
    cy.get('[data-node-type="JSON_DESTINATION"]').first().click();
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    cy.get('[data-testid="destination-type-select"]').select('MEMORY');
    cy.get('[data-testid="destination-format-select"]').select('JSON');
    cy.get('[data-testid="apply-node-config-button"]').click();
    
    // Connect nodes
    cy.get('[data-node-type="API_SOURCE"]').first().invoke('attr', 'data-node-id').then(sourceNodeId => {
      cy.get('[data-node-type="JSON_DESTINATION"]').first().invoke('attr', 'data-node-id').then(destNodeId => {
        cy.connectNodes(sourceNodeId, destNodeId);
      });
    });
    
    // Save flow
    cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
    cy.get('[data-testid="save-flow-button"]').click();
    cy.wait('@saveFlow');
    
    // Return integration ID
    return cy.wrap(integrationId);
  });
});

// Run integration and observe execution errors
Cypress.Commands.add('runIntegrationAndObserveErrors', (integrationId) => {
  // Navigate to integration detail page
  cy.visit(`/integrations/${integrationId}`);
  
  // Run integration
  cy.intercept('POST', `/api/integrations/${integrationId}/execute`).as('executeIntegration');
  cy.get('[data-testid="run-integration-button"]').click();
  
  // Wait for execution to start
  cy.wait('@executeIntegration').then(interception => {
    const executionId = interception.response.body.executionId;
    
    // Check execution status until completion or timeout
    const checkExecution = () => {
      cy.request(`/api/executions/${executionId}`).then(response => {
        if (response.body.status === 'RUNNING') {
          // Still running, check again after a delay
          cy.wait(1000);
          checkExecution();
        } else {
          // Execution completed (likely with errors)
          cy.visit(`/executions/${executionId}`);
          
          // Check for error status
          cy.get('[data-testid="execution-status"]').should('contain', 'FAILED');
          
          // Check for error details
          cy.get('[data-testid="execution-error"]').should('be.visible');
          
          // Check logs for detailed errors
          cy.get('[data-testid="execution-logs-tab"]').click();
          cy.get('[data-testid="execution-logs"]').should('contain', 'ERROR');
          
          // Return execution ID for further analysis
          return cy.wrap(executionId);
        }
      });
    };
    
    checkExecution();
  });
});

// Fix integration execution errors
Cypress.Commands.add('fixIntegrationExecutionErrors', (integrationId) => {
  // Open integration builder
  cy.visit(`/integrations/${integrationId}/builder`);
  
  // Select source node with errors
  cy.get('[data-node-type="API_SOURCE"]').first().click();
  cy.get('[data-testid="node-properties-panel"]').should('be.visible');
  
  // Update with valid configuration
  cy.get('[data-testid="api-url-input"]').clear().type('https://valid-api.example.com/data');
  
  // Use mock data for testing
  cy.get('[data-testid="use-mock-data-checkbox"]').check();
  cy.get('[data-testid="mock-data-editor"]').type(JSON.stringify([
    { id: 1, name: "Test Item 1" },
    { id: 2, name: "Test Item 2" }
  ]));
  
  cy.get('[data-testid="apply-node-config-button"]').click();
  
  // Save flow
  cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
  cy.get('[data-testid="save-flow-button"]').click();
  cy.wait('@saveFlow');
});

// Create a form with validation errors
Cypress.Commands.add('submitFormWithErrors', (formType = 'user') => {
  // Navigate to appropriate form page
  switch (formType) {
    case 'user':
      cy.visit('/admin/users/new');
      
      // Submit empty form
      cy.get('[data-testid="create-user-button"]').click();
      
      // Verify validation errors
      cy.get('[data-testid="form-error-summary"]').should('be.visible');
      cy.get('[data-testid="field-error-message"]').should('have.length.at.least', 1);
      
      // Return error count
      return cy.get('[data-testid="field-error-message"]').its('length');
      
    case 'integration':
      cy.visit('/integrations/new');
      
      // Submit empty form
      cy.get('[data-testid="create-integration-button"]').click();
      
      // Verify validation errors
      cy.get('[data-testid="form-error-summary"]').should('be.visible');
      cy.get('[data-testid="field-error-message"]').should('have.length.at.least', 1);
      
      // Return error count
      return cy.get('[data-testid="field-error-message"]').its('length');
      
    case 'connection':
      cy.visit('/admin/connections/new');
      
      // Submit empty form
      cy.get('[data-testid="save-connection-button"]').click();
      
      // Verify validation errors
      cy.get('[data-testid="form-error-summary"]').should('be.visible');
      cy.get('[data-testid="field-error-message"]').should('have.length.at.least', 1);
      
      // Return error count
      return cy.get('[data-testid="field-error-message"]').its('length');
      
    default:
      throw new Error(`Unsupported form type: ${formType}`);
  }
});

// Fix form validation errors
Cypress.Commands.add('fixFormValidationErrors', (formType = 'user') => {
  // Fix validation errors on appropriate form
  switch (formType) {
    case 'user':
      // Fill required fields
      cy.get('[data-testid="user-email-input"]').type('test@example.com');
      cy.get('[data-testid="user-first-name-input"]').type('Test');
      cy.get('[data-testid="user-last-name-input"]').type('User');
      cy.get('[data-testid="user-role-select"]').select('USER');
      
      // Submit form
      cy.get('[data-testid="create-user-button"]').click();
      
      // Verify success
      cy.url().should('include', '/admin/users/');
      cy.get('[data-testid="success-message"]').should('be.visible');
      break;
      
    case 'integration':
      // Fill required fields
      cy.get('[data-testid="integration-name-input"]').type('Test Integration');
      cy.get('[data-testid="integration-type-select"]').select('DATA_SYNC');
      
      // Submit form
      cy.get('[data-testid="create-integration-button"]').click();
      
      // Verify success
      cy.url().should('include', '/integrations/');
      cy.get('[data-testid="success-message"]').should('be.visible');
      break;
      
    case 'connection':
      // Fill required fields
      cy.get('[data-testid="connection-name-input"]').type('Test Connection');
      cy.get('[data-testid="connection-type-select"]').select('API');
      cy.get('[data-testid="api-url-input"]').type('https://api.example.com');
      
      // Submit form
      cy.get('[data-testid="save-connection-button"]').click();
      
      // Verify success
      cy.url().should('include', '/admin/connections/');
      cy.get('[data-testid="success-message"]').should('be.visible');
      break;
      
    default:
      throw new Error(`Unsupported form type: ${formType}`);
  }
});

// Simulate API error and verify recovery
Cypress.Commands.add('simulateApiErrorAndVerifyRecovery', (apiEndpoint, statusCode, errorMessage) => {
  // Intercept API request and simulate error
  cy.intercept('GET', apiEndpoint, {
    statusCode: statusCode,
    body: {
      error: true,
      message: errorMessage,
      code: `ERROR_${statusCode}`
    },
    delayMs: 100
  }).as('apiError');
  
  // Navigate to page that will trigger the API call
  cy.visit('/');
  
  // Trigger API call (specific to page)
  if (apiEndpoint.includes('/integrations')) {
    cy.get('[data-testid="integrations-nav-link"]').click();
  } else if (apiEndpoint.includes('/users')) {
    cy.get('[data-testid="admin-nav-link"]').click();
    cy.get('[data-testid="users-nav-link"]').click();
  }
  
  // Wait for API error
  cy.wait('@apiError');
  
  // Verify error message is displayed
  cy.get('[data-testid="api-error-message"]').should('be.visible');
  cy.get('[data-testid="api-error-message"]').should('contain', errorMessage);
  
  // Verify retry button is available
  cy.get('[data-testid="retry-button"]').should('be.visible');
  
  // Now reset the intercept to allow the request to succeed
  cy.intercept('GET', apiEndpoint).as('apiSuccess');
  
  // Click retry button
  cy.get('[data-testid="retry-button"]').click();
  
  // Wait for successful API call
  cy.wait('@apiSuccess');
  
  // Verify page loaded successfully
  cy.get('[data-testid="api-error-message"]').should('not.exist');
  cy.get('[data-testid="retry-button"]').should('not.exist');
  
  // Depending on the page, verify some content is loaded
  if (apiEndpoint.includes('/integrations')) {
    cy.get('[data-testid="integrations-list"]').should('exist');
  } else if (apiEndpoint.includes('/users')) {
    cy.get('[data-testid="users-list"]').should('exist');
  }
});

// View error logs in admin dashboard
Cypress.Commands.add('viewErrorLogsInDashboard', () => {
  // Navigate to admin monitoring dashboard
  cy.visit('/admin/monitoring');
  
  // Click on error logs tab
  cy.get('[data-testid="error-logs-tab"]').click();
  
  // Verify error log list is visible
  cy.get('[data-testid="error-log-list"]').should('be.visible');
  
  // Get the number of error logs for assertions
  return cy.get('[data-testid="error-log-item"]').its('length');
});

// Analyze error details
Cypress.Commands.add('analyzeErrorDetails', (errorLogIndex = 0) => {
  // Click on specific error log to view details
  cy.get('[data-testid="error-log-item"]').eq(errorLogIndex).click();
  
  // Verify error details panel is visible
  cy.get('[data-testid="error-details-panel"]').should('be.visible');
  
  // Collect error details for assertions
  return cy.get('[data-testid="error-details-panel"]').within(() => {
    return cy.get('[data-testid="error-type"]').invoke('text').then(errorType => {
      return cy.get('[data-testid="error-message"]').invoke('text').then(errorMessage => {
        return cy.get('[data-testid="error-timestamp"]').invoke('text').then(errorTimestamp => {
          return cy.get('[data-testid="error-source"]').invoke('text').then(errorSource => {
            return cy.wrap({
              type: errorType,
              message: errorMessage,
              timestamp: errorTimestamp,
              source: errorSource
            });
          });
        });
      });
    });
  });
});

// Create data with validation errors
Cypress.Commands.add('createDataWithValidationErrors', (dataType = 'csv') => {
  // Navigate to data import page
  cy.visit('/admin/data/import');
  
  // Select data type
  cy.get('[data-testid="data-type-select"]').select(dataType.toUpperCase());
  
  // Upload invalid data file
  const fileName = `invalid_data.${dataType}`;
  const fileContent = dataType === 'csv' 
    ? 'id,name,value\n1,Test,invalid\na,Missing Column\n3,Extra,Column,Value'
    : dataType === 'json'
      ? '{"records": [{"id": 1, "name": "Valid"}, {"id": "invalid", "missing_name": true}, {"invalid_format": true}]}'
      : '<root><item><id>1</id><name>Valid</name></item><item><id>invalid</id></item><invalid_format>true</invalid_format></root>';
  
  cy.get('[data-testid="file-upload-input"]').attachFile({
    fileContent,
    fileName,
    mimeType: dataType === 'csv' ? 'text/csv' : dataType === 'json' ? 'application/json' : 'application/xml',
    encoding: 'utf8'
  });
  
  // Start import
  cy.get('[data-testid="start-import-button"]').click();
  
  // Verify validation errors are shown
  cy.get('[data-testid="data-validation-errors"]').should('be.visible');
  cy.get('[data-testid="validation-error-count"]').should('contain.text');
  
  // Return the number of validation errors
  return cy.get('[data-testid="validation-error-item"]').its('length');
});

// Fix data validation errors
Cypress.Commands.add('fixDataValidationErrors', (dataType = 'csv') => {
  // Navigate to data validation error page
  cy.get('[data-testid="fix-data-button"]').click();
  
  // Edit the data to fix errors
  if (dataType === 'csv') {
    cy.get('[data-testid="data-editor"]').clear().type('id,name,value\n1,Test,100\n2,Another,200\n3,Third,300');
  } else if (dataType === 'json') {
    cy.get('[data-testid="data-editor"]').clear().type('{"records": [{"id": 1, "name": "Valid"}, {"id": 2, "name": "Fixed"}, {"id": 3, "name": "Third"}]}');
  } else {
    cy.get('[data-testid="data-editor"]').clear().type('<root><item><id>1</id><name>Valid</name></item><item><id>2</id><name>Fixed</name></item><item><id>3</id><name>Third</name></item></root>');
  }
  
  // Validate fixed data
  cy.get('[data-testid="validate-data-button"]').click();
  
  // Verify validation passes
  cy.get('[data-testid="validation-success-message"]').should('be.visible');
  
  // Import fixed data
  cy.get('[data-testid="import-fixed-data-button"]').click();
  
  // Verify import success
  cy.get('[data-testid="import-success-message"]').should('be.visible');
});