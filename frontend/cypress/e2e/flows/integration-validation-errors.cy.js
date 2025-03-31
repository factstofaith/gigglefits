// cypress/e2e/flows/integration-validation-errors.cy.js

/**
 * End-to-End Test for Integration Validation and Error Handling
 * 
 * This test verifies the validation functionality of the integration builder:
 * 1. Form validation for integration creation
 * 2. Node configuration validation
 * 3. Flow validation (missing connections, incomplete configs)
 * 4. Execution validation
 * 5. Error handling and recovery
 */
describe('Integration Validation and Error Handling', () => {
  // Test data - admin user
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!',
    fullName: 'Admin User'
  };
  
  // Test integration data
  const testIntegration = {
    name: 'Validation Test Integration',
    description: 'Integration for testing validation and error handling',
    type: 'DATA_TRANSFORMATION',
    schedule: 'MANUAL'
  };
  
  before(() => {
    // Clean the test database for integrations
    cy.request('POST', '/api/test/reset-db', { scope: 'validation_tests' });
    
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
  
  /**
   * Section 1: Core Functionality - Form Validation
   * These tests verify the validation for integration creation form
   */
  describe('Integration Creation Form Validation', () => {
    beforeEach(() => {
      // Navigate to create integration page
      cy.get('[data-testid="create-integration-button"]').click();
      cy.url().should('include', '/integrations/create');
    });
    
    it('validates required fields in integration creation form', () => {
      // Click create without entering any data
      cy.get('[data-testid="save-integration-button"]').click();
      
      // Verify validation errors for required fields
      cy.get('[data-testid="name-error"]').should('be.visible');
      cy.get('[data-testid="name-error"]').should('contain', 'Name is required');
      
      cy.get('[data-testid="type-error"]').should('be.visible');
      cy.get('[data-testid="type-error"]').should('contain', 'Type is required');
      
      // Fill only name field
      cy.get('[data-testid="integration-name-input"]').type(testIntegration.name);
      cy.get('[data-testid="save-integration-button"]').click();
      
      // Verify name error is gone but type error remains
      cy.get('[data-testid="name-error"]').should('not.exist');
      cy.get('[data-testid="type-error"]').should('be.visible');
      
      // Now select type but clear name
      cy.get('[data-testid="integration-name-input"]').clear();
      cy.get(`[data-testid="integration-type-${testIntegration.type}"]`).click();
      cy.get('[data-testid="save-integration-button"]').click();
      
      // Verify type error is gone but name error is back
      cy.get('[data-testid="type-error"]').should('not.exist');
      cy.get('[data-testid="name-error"]').should('be.visible');
    });
    
    it('validates name uniqueness for integrations', () => {
      // First create an integration
      cy.get('[data-testid="integration-name-input"]').type(testIntegration.name);
      cy.get('[data-testid="integration-description-input"]').type(testIntegration.description);
      cy.get(`[data-testid="integration-type-${testIntegration.type}"]`).click();
      
      // Save the integration
      cy.intercept('POST', '/api/integrations').as('createIntegration');
      cy.get('[data-testid="save-integration-button"]').click();
      
      // Wait for API call to complete
      cy.wait('@createIntegration').then(interception => {
        expect(interception.response.statusCode).to.eq(201);
      });
      
      // Verify redirect to detail page
      cy.url().should('include', '/integrations/');
      
      // Create another integration with the same name
      cy.get('[data-testid="create-integration-button"]').click();
      cy.get('[data-testid="integration-name-input"]').type(testIntegration.name);
      cy.get('[data-testid="integration-description-input"]').type('Duplicate name integration');
      cy.get(`[data-testid="integration-type-${testIntegration.type}"]`).click();
      
      // Intercept duplicate name error
      cy.intercept('POST', '/api/integrations', {
        statusCode: 400,
        body: {
          error: 'Validation Error',
          message: 'Integration name already exists',
          details: {
            name: 'Integration name must be unique'
          }
        }
      }).as('duplicateNameError');
      
      // Try to save with duplicate name
      cy.get('[data-testid="save-integration-button"]').click();
      
      // Wait for API call
      cy.wait('@duplicateNameError');
      
      // Verify error is displayed
      cy.get('[data-testid="name-error"]').should('be.visible');
      cy.get('[data-testid="name-error"]').should('contain', 'Integration name must be unique');
      
      // Check that we're still on the create page
      cy.url().should('include', '/integrations/create');
    });
    
    it('validates max length constraints', () => {
      // Try to enter a very long name (more than 100 characters)
      const veryLongName = 'A'.repeat(101);
      cy.get('[data-testid="integration-name-input"]').type(veryLongName);
      
      // Check if input was truncated or validation error shown
      cy.get('[data-testid="integration-name-input"]').then($input => {
        const value = $input.val();
        expect(value.length).to.be.at.most(100);
      });
      
      // Or we might see a validation error immediately
      cy.get('body').then($body => {
        if ($body.find('[data-testid="name-error"]').length > 0) {
          cy.get('[data-testid="name-error"]').should('contain', 'maximum length');
        }
      });
      
      // Try to enter a very long description
      const veryLongDescription = 'A'.repeat(1001);
      cy.get('[data-testid="integration-description-input"]').type(veryLongDescription);
      
      // Check if input was truncated or validation error shown
      cy.get('[data-testid="integration-description-input"]').then($input => {
        const value = $input.val();
        expect(value.length).to.be.at.most(1000);
      });
      
      // Or we might see a validation error immediately
      cy.get('body').then($body => {
        if ($body.find('[data-testid="description-error"]').length > 0) {
          cy.get('[data-testid="description-error"]').should('contain', 'maximum length');
        }
      });
    });
  });
  
  /**
   * Section 2: Node Configuration Validation
   * These tests verify the validation for node configuration
   */
  describe('Node Configuration Validation', () => {
    let integrationId;
    
    before(() => {
      // Create a test integration via API to use for node testing
      cy.request('POST', '/api/integrations', {
        name: 'Node Validation Test',
        description: 'Integration for testing node validation',
        type: 'DATA_TRANSFORMATION',
        schedule: 'MANUAL'
      }).then(response => {
        integrationId = response.body.id;
        
        // Open the integration builder
        cy.visit(`/integrations/${integrationId}/builder`);
        cy.get('[data-testid="integration-flow-canvas"]').should('be.visible');
      });
    });
    
    it('validates required fields in source node configuration', () => {
      // Add source node (File Source)
      cy.addNode('FILE_SOURCE', { x: 200, y: 300 }).then($node => {
        const sourceNodeId = $node.attr('data-node-id');
        
        // Try to apply configuration without required fields
        cy.get('[data-testid="apply-node-config-button"]').click();
        
        // Verify validation errors
        cy.get('[data-testid="field-error-file_path"]').should('be.visible');
        cy.get('[data-testid="field-error-file_format"]').should('be.visible');
        
        // Fill one required field
        cy.get('[data-testid="node-property-file_path"]').type('/test/data/sample.csv');
        cy.get('[data-testid="apply-node-config-button"]').click();
        
        // Verify one error is gone but the other remains
        cy.get('[data-testid="field-error-file_path"]').should('not.exist');
        cy.get('[data-testid="field-error-file_format"]').should('be.visible');
        
        // Fill the other required field
        cy.get('[data-testid="node-property-file_format"]').select('CSV');
        cy.get('[data-testid="apply-node-config-button"]').click();
        
        // Verify node is now configured (no errors)
        cy.get('[data-testid="field-error-file_format"]').should('not.exist');
        cy.get('[data-testid="node-configured-indicator"]').should('be.visible');
      });
    });
    
    it('validates file path format for file nodes', () => {
      // Add a destination node
      cy.addNode('FILE_DESTINATION', { x: 600, y: 300 }).then($node => {
        const destNodeId = $node.attr('data-node-id');
        
        // Enter invalid file path (e.g., missing extension)
        cy.get('[data-testid="node-property-file_path"]').type('invalid/path/without/extension');
        cy.get('[data-testid="node-property-file_format"]').select('CSV');
        cy.get('[data-testid="apply-node-config-button"]').click();
        
        // Verify validation error for path format
        cy.get('[data-testid="field-error-file_path"]').should('be.visible');
        cy.get('[data-testid="field-error-file_path"]').should('contain', 'valid file path');
        
        // Fix the path and try again
        cy.get('[data-testid="node-property-file_path"]').clear().type('/valid/path/file.csv');
        cy.get('[data-testid="apply-node-config-button"]').click();
        
        // Verify error is gone
        cy.get('[data-testid="field-error-file_path"]').should('not.exist');
      });
    });
    
    it('validates credential format for connection nodes', () => {
      // Add an S3 destination node
      cy.addNode('S3_DESTINATION', { x: 400, y: 400 }).then($node => {
        const s3NodeId = $node.attr('data-node-id');
        
        // Enter invalid credentials
        cy.get('[data-testid="node-property-access_key"]').type('short');
        cy.get('[data-testid="node-property-secret_key"]').type('invalid');
        cy.get('[data-testid="node-property-region"]').select('us-west-2');
        cy.get('[data-testid="node-property-bucket_name"]').type('testbucket');
        cy.get('[data-testid="node-property-object_key"]').type('test/object.json');
        cy.get('[data-testid="apply-node-config-button"]').click();
        
        // Verify validation errors for credentials
        cy.get('[data-testid="field-error-access_key"]').should('be.visible');
        cy.get('[data-testid="field-error-access_key"]').should('contain', 'valid AWS access key');
        cy.get('[data-testid="field-error-secret_key"]').should('be.visible');
        cy.get('[data-testid="field-error-secret_key"]').should('contain', 'valid AWS secret key');
        
        // Fix the credentials with valid format values
        cy.get('[data-testid="node-property-access_key"]').clear().type('AKIATESTKEY123456789');
        cy.get('[data-testid="node-property-secret_key"]').clear().type('testsecretkey123456789abcdef');
        cy.get('[data-testid="apply-node-config-button"]').click();
        
        // Verify errors are gone
        cy.get('[data-testid="field-error-access_key"]').should('not.exist');
        cy.get('[data-testid="field-error-secret_key"]').should('not.exist');
      });
    });
  });
  
  /**
   * Section 3: Flow Validation
   * These tests verify the validation for the overall flow
   */
  describe('Flow Validation', () => {
    let integrationId;
    
    before(() => {
      // Create a test integration via API to use for flow validation testing
      cy.request('POST', '/api/integrations', {
        name: 'Flow Validation Test',
        description: 'Integration for testing flow validation',
        type: 'DATA_TRANSFORMATION',
        schedule: 'MANUAL'
      }).then(response => {
        integrationId = response.body.id;
        
        // Open the integration builder
        cy.visit(`/integrations/${integrationId}/builder`);
        cy.get('[data-testid="integration-flow-canvas"]').should('be.visible');
      });
    });
    
    it('validates node connectivity (missing connections)', () => {
      // Add source node
      cy.addNode('FILE_SOURCE', { x: 200, y: 300 }).then($node => {
        // Configure source node
        cy.configureNode($node.attr('data-node-id'), {
          'source_type': 'LOCAL_FILE',
          'file_path': '/test/data/sample_input.csv',
          'file_format': 'CSV',
          'has_header': true
        });
      });
      
      // Add destination node (but don't connect it)
      cy.addNode('FILE_DESTINATION', { x: 600, y: 300 }).then($node => {
        // Configure destination node
        cy.configureNode($node.attr('data-node-id'), {
          'destination_type': 'LOCAL_FILE',
          'file_path': '/test/data/output.csv',
          'file_format': 'CSV',
          'include_header': true,
          'overwrite_existing': true
        });
      });
      
      // Try to save the flow
      cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlowWithErrors');
      cy.get('[data-testid="save-flow-button"]').click();
      
      // Wait for save attempt
      cy.wait('@saveFlowWithErrors').then(interception => {
        // Server validates the flow and returns errors
        expect(interception.response.statusCode).to.eq(400);
      });
      
      // Verify validation errors are displayed
      cy.get('[data-testid="flow-validation-errors"]').should('be.visible');
      cy.get('[data-testid="flow-validation-error-item"]').should('contain', 'unconnected node');
      
      // Click on the error to highlight the issue
      cy.get('[data-testid="flow-validation-error-item"]').first().click();
      
      // Verify node is highlighted as problematic
      cy.get('[data-testid="node-error-highlight"]').should('be.visible');
    });
    
    it('validates missing nodes (source/destination required)', () => {
      // Clear the canvas
      cy.get('[data-testid="clear-canvas-button"]').click();
      cy.get('[data-testid="confirm-clear-button"]').click();
      
      // Add only a transformation node
      cy.addNode('TRANSFORM', { x: 400, y: 300 }).then($node => {
        // Configure transform node
        cy.configureNode($node.attr('data-node-id'), {
          'transformation_type': 'FIELD_MAPPING'
        });
      });
      
      // Try to save the flow
      cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlowWithErrors');
      cy.get('[data-testid="save-flow-button"]').click();
      
      // Wait for save attempt
      cy.wait('@saveFlowWithErrors').then(interception => {
        // Server validates the flow and returns errors
        expect(interception.response.statusCode).to.eq(400);
      });
      
      // Verify validation errors are displayed
      cy.get('[data-testid="flow-validation-errors"]').should('be.visible');
      cy.get('[data-testid="flow-validation-error-item"]').should('contain', 'source node');
      cy.get('[data-testid="flow-validation-error-item"]').should('contain', 'destination node');
    });
    
    it('validates incompatible node connections', () => {
      // Clear the canvas
      cy.get('[data-testid="clear-canvas-button"]').click();
      cy.get('[data-testid="confirm-clear-button"]').click();
      
      // Add two source nodes
      cy.addNode('FILE_SOURCE', { x: 200, y: 200 }).then($sourceNode1 => {
        // Configure first source node
        cy.configureNode($sourceNode1.attr('data-node-id'), {
          'source_type': 'LOCAL_FILE',
          'file_path': '/test/data/source1.csv',
          'file_format': 'CSV',
          'has_header': true
        });
        
        cy.wrap($sourceNode1.attr('data-node-id')).as('sourceNode1Id');
      });
      
      cy.addNode('DATABASE_SOURCE', { x: 200, y: 400 }).then($sourceNode2 => {
        // Configure second source node
        cy.configureNode($sourceNode2.attr('data-node-id'), {
          'connection_string': 'test-connection-string',
          'query': 'SELECT * FROM test_table'
        });
        
        cy.wrap($sourceNode2.attr('data-node-id')).as('sourceNode2Id');
      });
      
      // Try to connect source to source (incompatible)
      cy.get('@sourceNode1Id').then(sourceNode1Id => {
        cy.get('@sourceNode2Id').then(sourceNode2Id => {
          // This might fail depending on how the application handles invalid connections
          // We're testing that either the connection fails to be created, or it gets flagged as invalid
          cy.get(`[data-testid="node-${sourceNode1Id}"] [data-testid="output-port"]`).trigger('mousedown');
          cy.get(`[data-testid="node-${sourceNode2Id}"] [data-testid="output-port"]`).trigger('mousemove').trigger('mouseup');
          
          // Add a destination node
          cy.addNode('FILE_DESTINATION', { x: 600, y: 300 }).then($destNode => {
            // Configure destination node
            cy.configureNode($destNode.attr('data-node-id'), {
              'destination_type': 'LOCAL_FILE',
              'file_path': '/test/data/output.csv',
              'file_format': 'CSV'
            });
            
            // Connect first source to destination (valid)
            cy.get(`[data-testid="node-${sourceNode1Id}"] [data-testid="output-port"]`).trigger('mousedown');
            cy.get(`[data-testid="node-${$destNode.attr('data-node-id')}"] [data-testid="input-port"]`).trigger('mousemove').trigger('mouseup');
            
            // Try to save the flow
            cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlowWithWarnings');
            cy.get('[data-testid="save-flow-button"]').click();
            
            // Verify validation warnings about unused nodes
            cy.get('[data-testid="flow-validation-warnings"]').should('be.visible');
            cy.get('[data-testid="flow-validation-warning-item"]').should('contain', 'unused node');
          });
        });
      });
    });
  });
  
  /**
   * Section 4: Execution Validation
   * These tests verify the validation during integration execution
   */
  describe('Execution Validation', () => {
    let integrationId;
    
    before(() => {
      // Create a valid integration via API
      cy.request('POST', '/api/integrations', {
        name: 'Execution Validation Test',
        description: 'Integration for testing execution validation',
        type: 'DATA_TRANSFORMATION',
        schedule: 'MANUAL'
      }).then(response => {
        integrationId = response.body.id;
        
        // Open the integration builder and create a basic flow
        cy.visit(`/integrations/${integrationId}/builder`);
        cy.get('[data-testid="integration-flow-canvas"]').should('be.visible');
        
        // Add and configure source node
        cy.addNode('FILE_SOURCE', { x: 200, y: 300 }).then($node => {
          const sourceNodeId = $node.attr('data-node-id');
          cy.configureNode(sourceNodeId, {
            'source_type': 'LOCAL_FILE',
            'file_path': '/test/data/sample_input.csv',
            'file_format': 'CSV',
            'has_header': true
          });
          cy.wrap(sourceNodeId).as('sourceNodeId');
        });
        
        // Add and configure destination node
        cy.addNode('FILE_DESTINATION', { x: 600, y: 300 }).then($node => {
          const destNodeId = $node.attr('data-node-id');
          cy.configureNode(destNodeId, {
            'destination_type': 'LOCAL_FILE',
            'file_path': '/test/data/output.csv',
            'file_format': 'CSV',
            'include_header': true,
            'overwrite_existing': true
          });
          cy.wrap(destNodeId).as('destNodeId');
        });
        
        // Connect nodes
        cy.get('@sourceNodeId').then(sourceNodeId => {
          cy.get('@destNodeId').then(destNodeId => {
            cy.connectNodes(sourceNodeId, destNodeId);
          });
        });
        
        // Save the flow
        cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
        cy.get('[data-testid="save-flow-button"]').click();
        cy.wait('@saveFlow');
        
        // Navigate to integration detail page
        cy.visit(`/integrations/${integrationId}`);
      });
    });
    
    it('validates before execution and shows pre-execution checks', () => {
      // Click run button to start execution
      cy.get('[data-testid="run-integration-button"]').click();
      
      // Verify pre-execution validation dialog
      cy.get('[data-testid="pre-execution-validation"]').should('be.visible');
      cy.get('[data-testid="validation-check-item"]').should('have.length.at.least', 1);
      
      // All checks are passing in this case (valid flow)
      cy.get('[data-testid="validation-check-status"]').each($status => {
        expect($status.text()).to.include('Passed');
      });
      
      // Confirm execution
      cy.get('[data-testid="confirm-run-button"]').click();
      
      // Verify execution started
      cy.get('[data-testid="notification-toast"]').should('contain', 'Integration execution started');
    });
    
    it('blocks execution when critical validation fails', () => {
      // Create an invalid integration state first
      cy.visit(`/integrations/${integrationId}/builder`);
      
      // Clear the canvas
      cy.get('[data-testid="clear-canvas-button"]').click();
      cy.get('[data-testid="confirm-clear-button"]').click();
      
      // Add a source node only (no destination)
      cy.addNode('FILE_SOURCE', { x: 200, y: 300 }).then($node => {
        // Configure source node
        cy.configureNode($node.attr('data-node-id'), {
          'source_type': 'LOCAL_FILE',
          'file_path': '/test/data/sample_input.csv',
          'file_format': 'CSV',
          'has_header': true
        });
      });
      
      // Save the invalid flow
      cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveInvalidFlow');
      cy.get('[data-testid="save-flow-button"]').click();
      
      // In some applications, this might still save with warnings
      cy.wait('@saveInvalidFlow');
      
      // Navigate to integration detail page
      cy.visit(`/integrations/${integrationId}`);
      
      // Try to run the integration
      cy.get('[data-testid="run-integration-button"]').click();
      
      // Verify validation errors in pre-execution dialog
      cy.get('[data-testid="pre-execution-validation"]').should('be.visible');
      cy.get('[data-testid="validation-check-item"]').should('have.length.at.least', 1);
      
      // There should be at least one failing check
      cy.get('[data-testid="validation-check-status-failed"]').should('exist');
      cy.get('[data-testid="validation-error-message"]').should('contain', 'destination');
      
      // Confirm button should be disabled for critical errors
      cy.get('[data-testid="confirm-run-button"]').should('be.disabled');
      
      // Close dialog
      cy.get('[data-testid="close-dialog-button"]').click();
    });
  });
  
  /**
   * Section 5: Accessibility Testing
   * These tests verify accessibility of the validation UI
   */
  describe('Validation Accessibility', () => {
    it('has accessible validation error messages', () => {
      // Navigate to create integration page
      cy.visit('/integrations/create');
      
      // Inject axe for a11y testing
      cy.injectAxe();
      
      // Submit empty form to trigger validation errors
      cy.get('[data-testid="save-integration-button"]').click();
      
      // Check accessibility with validation errors visible
      cy.checkA11y();
      
      // Ensure errors are associated with their fields
      cy.get('[data-testid="name-error"]').should('have.attr', 'id');
      cy.get('[data-testid="integration-name-input"]').should($input => {
        const errorId = Cypress.$('[data-testid="name-error"]').attr('id');
        expect($input).to.have.attr('aria-errormessage', errorId);
        expect($input).to.have.attr('aria-invalid', 'true');
      });
    });
    
    it('provides keyboard accessible validation feedback', () => {
      // Navigate to a flow builder page
      cy.request('POST', '/api/integrations', {
        name: 'Keyboard Accessibility Test',
        description: 'Integration for testing keyboard accessibility',
        type: 'DATA_TRANSFORMATION',
        schedule: 'MANUAL'
      }).then(response => {
        const integrationId = response.body.id;
        cy.visit(`/integrations/${integrationId}/builder`);
      });
      
      // Add a node with tab navigation
      cy.get('[data-testid="show-node-palette-button"]').click();
      cy.get('[data-testid="node-type-FILE_SOURCE"]').focus().type('{enter}');
      
      // Tab to the first input field
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'node-property-source_type');
      
      // Tab to file path and enter invalid data
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'node-property-file_path');
      cy.focused().type('invalid');
      
      // Tab to apply button and press enter
      let applyButtonFound = false;
      for (let i = 0; i < 10; i++) {
        cy.focused().tab();
        cy.focused().then($el => {
          if ($el.attr('data-testid') === 'apply-node-config-button') {
            applyButtonFound = true;
            cy.wrap($el).type('{enter}');
          }
        });
        if (applyButtonFound) break;
      }
      
      // Focus should move to the first error field
      cy.focused().should('have.attr', 'aria-invalid', 'true');
      
      // Screen reader should announce the error
      cy.focused().should($input => {
        expect($input).to.have.attr('aria-errormessage');
      });
    });
  });
  
  after(() => {
    // Clean up test integrations
    cy.request('POST', '/api/test/reset-db', { scope: 'validation_tests' });
    
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });
});