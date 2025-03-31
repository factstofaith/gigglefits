// cypress/e2e/flows/integration-creation-execution.cy.js

/**
 * End-to-End Test for Integration Creation and Execution
 * 
 * This test verifies the integration creation and execution flow:
 * 1. Creating new integrations (from scratch and from templates)
 * 2. Building integration flows using the visual canvas
 * 3. Configuring data sources and destinations
 * 4. Testing transformation configurations
 * 5. Executing integrations and monitoring results
 */
describe('Integration Creation and Execution Flow', () => {
  // Test data - admin user
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!',
    fullName: 'Admin User'
  };
  
  // Test data - integration details
  const basicIntegration = {
    name: 'Test Basic Integration',
    description: 'A basic integration created by automated tests',
    type: 'FILE_TRANSFER',
    schedule: 'MANUAL'
  };
  
  const transformationIntegration = {
    name: 'Test Transformation Integration',
    description: 'An integration with data transformations created by automated tests',
    type: 'DATA_TRANSFORMATION',
    schedule: 'DAILY'
  };
  
  before(() => {
    // Clean the test database for integrations
    cy.request('POST', '/api/test/reset-db', { scope: 'integrations' });
    
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification for admin
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Navigate to integrations page
    cy.get('[data-testid="integrations-link"]').click();
    cy.url().should('include', '/integrations');
  });
  
  it('creates a basic integration from scratch', () => {
    // Use custom command to create a basic integration
    cy.createIntegration(basicIntegration).then(createdIntegration => {
      // Store integration ID for later use
      const integrationId = createdIntegration.id;
      cy.wrap(integrationId).as('basicIntegrationId');
      
      // Verify success message
      cy.get('[data-testid="notification-toast"]').should('contain', 'Integration created successfully');
      
      // Verify we're redirected to the integration detail page
      cy.url().should('include', `/integrations/${integrationId}`);
      
      // Verify integration details are displayed correctly
      cy.get('[data-testid="integration-name"]').should('contain', basicIntegration.name);
      cy.get('[data-testid="integration-description"]').should('contain', basicIntegration.description);
      cy.get('[data-testid="integration-type"]').should('contain', 'File Transfer');
      
      // Open integration builder to create the flow
      cy.get('[data-testid="edit-integration-button"]').click();
      
      // Verify the builder is loaded
      cy.get('[data-testid="integration-flow-canvas"]').should('be.visible');
      
      // Add source node (File Source)
      cy.addNode('FILE_SOURCE', { x: 200, y: 300 }).then($node => {
        const sourceNodeId = $node.attr('data-node-id');
        cy.wrap(sourceNodeId).as('sourceNodeId');
        
        // Configure source node
        cy.configureNode(sourceNodeId, {
          'source_type': 'LOCAL_FILE',
          'file_path': '/test/data/sample_input.csv',
          'file_format': 'CSV',
          'has_header': true
        });
      });
      
      // Add destination node (File Destination)
      cy.addNode('FILE_DESTINATION', { x: 600, y: 300 }).then($node => {
        const destNodeId = $node.attr('data-node-id');
        cy.wrap(destNodeId).as('destNodeId');
        
        // Configure destination node
        cy.configureNode(destNodeId, {
          'destination_type': 'LOCAL_FILE',
          'file_path': '/test/data/output.csv',
          'file_format': 'CSV',
          'include_header': true,
          'overwrite_existing': true
        });
      });
      
      // Connect source to destination
      cy.get('@sourceNodeId').then(sourceNodeId => {
        cy.get('@destNodeId').then(destNodeId => {
          cy.connectNodes(sourceNodeId, destNodeId);
        });
      });
      
      // Save the flow
      cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
      cy.get('[data-testid="save-flow-button"]').click();
      
      // Wait for save to complete
      cy.wait('@saveFlow').then(interception => {
        expect(interception.response.statusCode).to.eq(200);
      });
      
      // Verify success message
      cy.get('[data-testid="notification-toast"]').should('contain', 'Flow saved successfully');
      
      // Navigate back to integrations list to verify it appears there
      cy.navigateToIntegrations();
      
      // Verify integration appears in the list
      cy.get('[data-testid="integrations-list"]').should('contain', basicIntegration.name);
      cy.get(`[data-testid="integration-${integrationId}"]`).should('be.visible');
    });
  });
  
  it('creates an integration from a template', () => {
    // Define template customizations
    const templateCustomizations = {
      name: 'Template-Based Integration',
      description: 'Created from a CSV to Database template',
      parameters: {
        'source_file_path': '/test/data/employees.csv',
        'destination_table': 'employees',
        'batch_size': '100'
      }
    };
    
    // Use custom command to create integration from template
    cy.createIntegrationFromTemplate('csv-to-database', templateCustomizations).then(createdIntegration => {
      // Store integration ID for later use
      const templateIntegrationId = createdIntegration.id;
      cy.wrap(templateIntegrationId).as('templateIntegrationId');
      
      // Verify success message
      cy.get('[data-testid="notification-toast"]').should('contain', 'Integration created successfully');
      
      // Verify we're redirected to the integration detail page
      cy.url().should('include', `/integrations/${templateIntegrationId}`);
      
      // Verify integration details
      cy.get('[data-testid="integration-name"]').should('contain', templateCustomizations.name);
      cy.get('[data-testid="integration-description"]').should('contain', templateCustomizations.description);
      cy.get('[data-testid="integration-type"]').should('contain', 'Data Transformation');
      
      // Open integration to verify template was applied
      cy.get('[data-testid="edit-integration-button"]').click();
      
      // Verify canvas is loaded
      cy.get('[data-testid="integration-flow-canvas"]').should('be.visible');
      
      // Verify all template nodes are present
      cy.get('[data-testid="node-FILE_SOURCE-"]').should('be.visible');
      cy.get('[data-testid="node-TRANSFORM-"]').should('be.visible');
      cy.get('[data-testid="node-DATABASE_DESTINATION-"]').should('be.visible');
      
      // Verify source configuration
      cy.get('[data-testid="node-FILE_SOURCE-"]').click();
      cy.get('[data-testid="node-properties-panel"]').should('be.visible');
      cy.get('[data-testid="node-property-file_path"]').should('have.value', templateCustomizations.parameters.source_file_path);
      
      // Close properties panel
      cy.get('[data-testid="close-panel-button"]').click();
      
      // Verify destination configuration
      cy.get('[data-testid="node-DATABASE_DESTINATION-"]').click();
      cy.get('[data-testid="node-properties-panel"]').should('be.visible');
      cy.get('[data-testid="node-property-table_name"]').should('have.value', templateCustomizations.parameters.destination_table);
      cy.get('[data-testid="node-property-batch_size"]').should('have.value', templateCustomizations.parameters.batch_size);
      
      // Close properties panel
      cy.get('[data-testid="close-panel-button"]').click();
      
      // Verify connections between nodes
      cy.get('[data-testid="edge-"]').should('have.length', 2); // 2 connections in the template
      
      // Navigate back to integrations list
      cy.navigateToIntegrations();
      
      // Verify integration appears in the list
      cy.get('[data-testid="integrations-list"]').should('contain', templateCustomizations.name);
      cy.get(`[data-testid="integration-${templateIntegrationId}"]`).should('be.visible');
    });
  });
  
  it('configures data sources and destinations', function() {
    // Use the existing basic integration
    const integrationId = this.basicIntegrationId;
    
    // Open the integration builder
    cy.openIntegrationBuilder(integrationId);
    
    // Clear the canvas to start fresh
    cy.get('[data-testid="clear-canvas-button"]').click();
    cy.get('[data-testid="confirm-clear-button"]').click();
    
    // Verify canvas is empty
    cy.get('[data-testid="node-"]').should('not.exist');
    
    // Add an Azure Blob source node
    cy.addNode('AZURE_BLOB_SOURCE', { x: 200, y: 200 }).then($node => {
      const azureSourceNodeId = $node.attr('data-node-id');
      cy.wrap(azureSourceNodeId).as('azureSourceNodeId');
      
      // Configure Azure Blob source
      cy.configureNode(azureSourceNodeId, {
        'connection_string': 'DefaultEndpointsProtocol=https;AccountName=teststorage;AccountKey=testkey==;EndpointSuffix=core.windows.net',
        'container_name': 'testcontainer',
        'blob_path': 'data/employees.csv',
        'file_format': 'CSV',
        'has_header': true,
        'delimiter': ','
      });
    });
    
    // Add S3 destination node
    cy.addNode('S3_DESTINATION', { x: 600, y: 200 }).then($node => {
      const s3DestNodeId = $node.attr('data-node-id');
      cy.wrap(s3DestNodeId).as('s3DestNodeId');
      
      // Configure S3 destination
      cy.configureNode(s3DestNodeId, {
        'access_key': 'AKIATESTKEY123456789',
        'secret_key': 'testsecretkey123456789abcdef',
        'region': 'us-west-2',
        'bucket_name': 'testbucket',
        'object_key': 'output/employees_processed.json',
        'file_format': 'JSON',
        'compress': true
      });
    });
    
    // Connect the nodes
    cy.get('@azureSourceNodeId').then(sourceNodeId => {
      cy.get('@s3DestNodeId').then(destNodeId => {
        cy.connectNodes(sourceNodeId, destNodeId);
      });
    });
    
    // Save the flow
    cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
    cy.get('[data-testid="save-flow-button"]').click();
    
    // Wait for save to complete
    cy.wait('@saveFlow').then(interception => {
      expect(interception.response.statusCode).to.eq(200);
    });
    
    // Verify success message
    cy.get('[data-testid="notification-toast"]').should('contain', 'Flow saved successfully');
    
    // Reload the page to verify persistence
    cy.reload();
    
    // Wait for canvas to load
    cy.get('[data-testid="integration-flow-canvas"]').should('be.visible');
    cy.get('[data-testid="canvas-loading-indicator"]').should('not.exist');
    
    // Verify nodes are still present with correct configuration
    cy.get('[data-testid="node-AZURE_BLOB_SOURCE-"]').should('be.visible').click();
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    cy.get('[data-testid="node-property-container_name"]').should('have.value', 'testcontainer');
    
    // Close panel
    cy.get('[data-testid="close-panel-button"]').click();
    
    // Check S3 destination
    cy.get('[data-testid="node-S3_DESTINATION-"]').should('be.visible').click();
    cy.get('[data-testid="node-property-bucket_name"]').should('have.value', 'testbucket');
    cy.get('[data-testid="node-property-compress"]').should('be.checked');
    
    // Close panel
    cy.get('[data-testid="close-panel-button"]').click();
    
    // Verify connection is present
    cy.get('[data-testid="edge-"]').should('have.length', 1);
  });
  
  it('configures data transformations', function() {
    // Use the existing template integration which has transformation nodes
    const integrationId = this.templateIntegrationId;
    
    // Open the integration builder
    cy.openIntegrationBuilder(integrationId);
    
    // Find and select the transformation node
    cy.get('[data-testid="node-TRANSFORM-"]').should('be.visible').click();
    
    // Verify transformation panel is open
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    cy.get('[data-testid="transformation-editor-tab"]').click();
    
    // Configure field mappings
    cy.get('[data-testid="add-field-mapping-button"]').click();
    
    // Map source field to destination field
    cy.get('[data-testid="source-field-select"]').last().select('employee_id');
    cy.get('[data-testid="destination-field-input"]').last().type('id');
    
    // Add another mapping
    cy.get('[data-testid="add-field-mapping-button"]').click();
    cy.get('[data-testid="source-field-select"]').last().select('first_name');
    cy.get('[data-testid="destination-field-input"]').last().type('first_name');
    
    // Add another mapping
    cy.get('[data-testid="add-field-mapping-button"]').click();
    cy.get('[data-testid="source-field-select"]').last().select('last_name');
    cy.get('[data-testid="destination-field-input"]').last().type('last_name');
    
    // Add another mapping with transformation
    cy.get('[data-testid="add-field-mapping-button"]').click();
    cy.get('[data-testid="source-field-select"]').last().select('email');
    cy.get('[data-testid="destination-field-input"]').last().type('email_address');
    cy.get('[data-testid="add-transformation-button"]').last().click();
    cy.get('[data-testid="transformation-type-select"]').last().select('TO_LOWERCASE');
    
    // Add a combined field with multiple sources
    cy.get('[data-testid="add-field-mapping-button"]').click();
    cy.get('[data-testid="mapping-type-select"]').last().select('COMBINED');
    cy.get('[data-testid="destination-field-input"]').last().type('full_name');
    
    // Add source fields to combine
    cy.get('[data-testid="add-source-field-button"]').last().click();
    cy.get('[data-testid="source-field-select"]').last().select('first_name');
    
    cy.get('[data-testid="add-source-field-button"]').last().click();
    cy.get('[data-testid="source-field-select"]').last().select('last_name');
    
    // Set the combination format
    cy.get('[data-testid="combination-format-input"]').last().type('{selectall}{backspace}${first_name} ${last_name}');
    
    // Add a custom transformation with JavaScript
    cy.get('[data-testid="add-field-mapping-button"]').click();
    cy.get('[data-testid="mapping-type-select"]').last().select('CUSTOM');
    cy.get('[data-testid="destination-field-input"]').last().type('is_active');
    cy.get('[data-testid="custom-script-editor"]').last().type('return record.status === "ACTIVE" ? true : false;');
    
    // Request preview data to validate transformations
    cy.intercept('POST', `/api/integrations/${integrationId}/preview`).as('previewData');
    cy.get('[data-testid="preview-data-button"]').click();
    
    // Wait for preview data
    cy.wait('@previewData').then(interception => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('data');
    });
    
    // Verify preview data contains our transformations
    cy.get('[data-testid="preview-data-table"]').should('be.visible');
    cy.get('[data-testid="preview-data-table"]').should('contain', 'id');
    cy.get('[data-testid="preview-data-table"]').should('contain', 'email_address');
    cy.get('[data-testid="preview-data-table"]').should('contain', 'full_name');
    cy.get('[data-testid="preview-data-table"]').should('contain', 'is_active');
    
    // Save the transformation configuration
    cy.get('[data-testid="save-transformation-button"]').click();
    
    // Wait for the saving indicator to disappear
    cy.get('[data-testid="saving-indicator"]').should('not.exist');
    
    // Save the overall flow
    cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
    cy.get('[data-testid="save-flow-button"]').click();
    
    // Wait for save to complete
    cy.wait('@saveFlow').then(interception => {
      expect(interception.response.statusCode).to.eq(200);
    });
    
    // Verify success message
    cy.get('[data-testid="notification-toast"]').should('contain', 'Flow saved successfully');
    
    // Reload the page to verify persistence
    cy.reload();
    
    // Wait for canvas to load
    cy.get('[data-testid="integration-flow-canvas"]').should('be.visible');
    cy.get('[data-testid="canvas-loading-indicator"]').should('not.exist');
    
    // Verify transformations were saved
    cy.get('[data-testid="node-TRANSFORM-"]').should('be.visible').click();
    cy.get('[data-testid="transformation-editor-tab"]').click();
    
    // Verify our field mappings are still there
    cy.get('[data-testid="field-mapping-row"]').should('have.length.at.least', 6);
    cy.get('[data-testid="destination-field-input"]').should('contain.value', 'full_name');
    cy.get('[data-testid="destination-field-input"]').should('contain.value', 'email_address');
    cy.get('[data-testid="destination-field-input"]').should('contain.value', 'is_active');
  });
  
  it('executes integration and monitors results', function() {
    // Use the basic integration for this test
    const integrationId = this.basicIntegrationId;
    
    // Run the integration using our custom command
    cy.runIntegration(integrationId).then(executionId => {
      // Store execution ID for monitoring
      cy.wrap(executionId).as('executionId');
      
      // Verify success message for triggering the run
      cy.get('[data-testid="notification-toast"]').should('contain', 'Integration execution started');
      
      // Check execution monitoring page
      cy.visit(`/integrations/${integrationId}/executions`);
      
      // Verify execution appears in the list
      cy.get('[data-testid="executions-table"]').should('be.visible');
      cy.get(`[data-testid="execution-${executionId}"]`).should('be.visible');
      
      // Click on execution to view details
      cy.get(`[data-testid="execution-${executionId}"]`).click();
      
      // Verify execution details page
      cy.url().should('include', `/executions/${executionId}`);
      
      // Use our monitor command to wait for completion (with timeout)
      cy.monitorExecution(executionId, 60000).then(executionResult => {
        // Verify execution completed
        expect(executionResult.status).to.be.oneOf(['SUCCESS', 'FAILED', 'WARNING']);
        
        // If successful
        if (executionResult.status === 'SUCCESS') {
          // Verify success indicators
          cy.get('[data-testid="execution-status"]').should('contain', 'SUCCESS');
          cy.get('[data-testid="execution-status-icon"]').should('have.class', 'success-icon');
          
          // Check execution statistics
          cy.get('[data-testid="records-processed"]').should('be.visible');
          cy.get('[data-testid="execution-duration"]').should('be.visible');
        } else {
          // Handle failure case
          cy.get('[data-testid="execution-status"]').should('contain', executionResult.status);
          cy.get('[data-testid="execution-status-icon"]').should('have.class', 'error-icon');
        }
        
        // Check execution logs
        cy.get('[data-testid="logs-tab"]').click();
        cy.get('[data-testid="execution-logs"]').should('be.visible');
        cy.get('[data-testid="log-entry"]').should('have.length.at.least', 1);
        
        // Verify logs contain expected messages
        cy.get('[data-testid="execution-logs"]').should('contain', 'Execution started');
        cy.get('[data-testid="execution-logs"]').should('contain', 'Processing data');
        
        // Check metrics tab
        cy.get('[data-testid="metrics-tab"]').click();
        cy.get('[data-testid="metrics-panel"]').should('be.visible');
        cy.get('[data-testid="throughput-chart"]').should('be.visible');
        cy.get('[data-testid="memory-usage-chart"]').should('be.visible');
        
        // Navigate back to integration detail page
        cy.visit(`/integrations/${integrationId}`);
        
        // Verify last execution is displayed
        cy.get('[data-testid="last-execution-status"]').should('contain', executionResult.status);
        cy.get('[data-testid="last-execution-time"]').should('be.visible');
        
        // Check execution history
        cy.get('[data-testid="view-executions-button"]').click();
        cy.url().should('include', `/integrations/${integrationId}/executions`);
        
        // Verify our execution is in the list
        cy.get('[data-testid="executions-table"]').should('contain', executionId);
        
        // Test filtering executions by status
        cy.get('[data-testid="status-filter"]').select(executionResult.status);
        cy.get('[data-testid="apply-filters-button"]').click();
        
        // Verify our execution is still in the filtered list
        cy.get('[data-testid="executions-table"]').should('contain', executionId);
      });
    });
  });
  
  after(() => {
    // Clean up test integrations
    cy.request('POST', '/api/test/reset-db', { scope: 'integrations' });
    
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });
});