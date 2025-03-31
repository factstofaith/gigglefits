// cypress/e2e/flows/dataset-management.cy.js

/**
 * End-to-End Test for Dataset Management
 * 
 * This test verifies the dataset management capabilities:
 * 1. Creating, reading, updating, and deleting datasets
 * 2. Managing dataset schemas
 * 3. Associating datasets with applications
 * 4. Previewing dataset data
 * 5. Using datasets in integration flows
 * 6. Validating dataset data
 * 7. Managing dataset versions
 */
describe('Dataset Management', () => {
  // Test data - admin user
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!',
    fullName: 'Admin User'
  };
  
  // Test integration data
  const testIntegration = {
    name: 'Dataset Test Integration',
    description: 'Integration for testing dataset functionality',
    type: 'DATA_TRANSFORMATION',
    schedule: 'MANUAL',
    tags: ['test', 'dataset', 'e2e']
  };
  
  // Test application data
  const testApplication = {
    name: 'Dataset Test Application',
    description: 'Application for testing dataset associations',
    type: 'INTERNAL',
    status: 'ACTIVE'
  };
  
  before(() => {
    // Clean the test database
    cy.request('POST', '/api/test/reset-db', { scope: ['datasets', 'integrations', 'applications'] });
    
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification for admin
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Create a test integration for dataset usage
    cy.createIntegration(testIntegration).then(createdIntegration => {
      cy.wrap(createdIntegration.id).as('testIntegrationId');
    });
    
    // Create a test application for dataset associations
    cy.request('POST', '/api/applications', testApplication).then(response => {
      expect(response.status).to.equal(201);
      cy.wrap(response.body.id).as('testApplicationId');
    });
  });
  
  it('creates and views a basic dataset', function() {
    // Load test data from fixture
    cy.fixture('datasets/sample_datasets.json').then(datasets => {
      // Create a basic employee dataset
      cy.createDataset(datasets.basicDataset).then(createdDataset => {
        // Store the dataset ID for later use
        cy.wrap(createdDataset.id).as('basicDatasetId');
        
        // Verify dataset was created successfully
        cy.visit(`/admin/datasets/${createdDataset.id}`);
        
        // Check dataset details
        cy.get('[data-testid="dataset-name"]').should('contain', datasets.basicDataset.name);
        cy.get('[data-testid="dataset-description"]').should('contain', datasets.basicDataset.description);
        cy.get('[data-testid="dataset-type"]').should('contain', datasets.basicDataset.type);
        
        // Check tags are displayed
        datasets.basicDataset.tags.forEach(tag => {
          cy.get('[data-testid="dataset-tags"]').should('contain', tag);
        });
        
        // Check schema details
        cy.get('[data-testid="dataset-schema-tab"]').click();
        cy.get('[data-testid="schema-preview"]').should('be.visible');
        cy.get('[data-testid="schema-preview"]').should('contain', 'employee_id');
        cy.get('[data-testid="schema-preview"]').should('contain', 'first_name');
        cy.get('[data-testid="schema-preview"]').should('contain', 'email');
        
        // Check required field indicators
        cy.get('[data-testid="required-field-indicator"]').should('have.length.at.least', 6);
      });
    });
  });
  
  it('updates a dataset', function() {
    // Get the basic dataset ID from the previous test
    const datasetId = this.basicDatasetId;
    
    // Update dataset
    const updateData = {
      name: 'Updated Employee Dataset',
      description: 'Updated employee dataset with additional fields',
      schema: {
        type: 'object',
        properties: {
          employee_id: {
            type: 'string',
            description: 'Unique identifier for the employee'
          },
          first_name: {
            type: 'string',
            description: 'Employee\'s first name'
          },
          last_name: {
            type: 'string',
            description: 'Employee\'s last name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Employee\'s email address'
          },
          hire_date: {
            type: 'string',
            format: 'date',
            description: 'Date the employee was hired'
          },
          department: {
            type: 'string',
            description: 'Department the employee belongs to'
          },
          salary: {
            type: 'number',
            description: 'Employee\'s annual salary'
          },
          manager_id: {
            type: 'string',
            description: 'ID of the employee\'s manager'
          },
          performance_rating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            description: 'Employee\'s performance rating'
          }
        },
        required: ['employee_id', 'first_name', 'last_name', 'email', 'hire_date', 'department']
      }
    };
    
    cy.updateDataset(datasetId, updateData).then(updatedDataset => {
      // Verify dataset was updated successfully
      cy.visit(`/admin/datasets/${updatedDataset.id}`);
      
      // Check updated details
      cy.get('[data-testid="dataset-name"]').should('contain', updateData.name);
      cy.get('[data-testid="dataset-description"]').should('contain', updateData.description);
      
      // Check updated schema
      cy.get('[data-testid="dataset-schema-tab"]').click();
      cy.get('[data-testid="schema-preview"]').should('be.visible');
      cy.get('[data-testid="schema-preview"]').should('contain', 'manager_id');
      cy.get('[data-testid="schema-preview"]').should('contain', 'performance_rating');
    });
  });
  
  it('creates a complex dataset', function() {
    // Load test data from fixture
    cy.fixture('datasets/sample_datasets.json').then(datasets => {
      // Create a complex sales transaction dataset
      cy.createDataset(datasets.complexDataset).then(createdDataset => {
        // Store the dataset ID for later use
        cy.wrap(createdDataset.id).as('complexDatasetId');
        
        // Verify dataset was created successfully
        cy.visit(`/admin/datasets/${createdDataset.id}`);
        
        // Check dataset details
        cy.get('[data-testid="dataset-name"]').should('contain', datasets.complexDataset.name);
        cy.get('[data-testid="dataset-type"]').should('contain', datasets.complexDataset.type);
        
        // Check schema details for nested structure
        cy.get('[data-testid="dataset-schema-tab"]').click();
        cy.get('[data-testid="schema-preview"]').should('be.visible');
        cy.get('[data-testid="schema-preview"]').should('contain', 'transaction_id');
        cy.get('[data-testid="schema-preview"]').should('contain', 'customer');
        cy.get('[data-testid="schema-preview"]').should('contain', 'items');
        cy.get('[data-testid="schema-preview"]').should('contain', 'payment');
        
        // Check complex structure indicators
        cy.get('[data-testid="object-type-indicator"]').should('have.length.at.least', 4);
        cy.get('[data-testid="array-type-indicator"]').should('have.length.at.least', 2);
      });
    });
  });
  
  it('discovers schema from sample data', function() {
    // Create a blank dataset first
    const blankDataset = {
      name: 'Schema Discovery Test',
      description: 'Dataset for testing schema discovery',
      type: 'JSON',
      tags: ['discovery', 'test']
    };
    
    cy.createDataset(blankDataset).then(createdDataset => {
      // Store the dataset ID
      cy.wrap(createdDataset.id).as('discoveryDatasetId');
      
      // Load sample data from fixture
      cy.fixture('datasets/sample_datasets.json').then(datasets => {
        // Use employee data for schema discovery
        const sampleData = datasets.sampleData.employeeData;
        
        // Discover schema from sample data
        cy.discoverDatasetSchema(createdDataset.id, sampleData).then(discoveredSchema => {
          // Verify discovered schema
          cy.get('[data-testid="schema-preview"]').should('contain', 'employee_id');
          cy.get('[data-testid="schema-preview"]').should('contain', 'first_name');
          cy.get('[data-testid="schema-preview"]').should('contain', 'last_name');
          cy.get('[data-testid="schema-preview"]').should('contain', 'email');
          cy.get('[data-testid="schema-preview"]').should('contain', 'hire_date');
          cy.get('[data-testid="schema-preview"]').should('contain', 'department');
          cy.get('[data-testid="schema-preview"]').should('contain', 'salary');
          
          // Verify correct data types were detected
          cy.get('[data-testid="type-string"]').should('have.length.at.least', 5);
          cy.get('[data-testid="type-number"]').should('have.length.at.least', 1);
        });
      });
    });
  });
  
  it('associates dataset with application', function() {
    // Get the basic dataset ID and application ID
    const datasetId = this.basicDatasetId;
    const applicationId = this.testApplicationId;
    
    // Associate dataset with application
    cy.associateDatasetWithApplication(datasetId, applicationId).then(() => {
      // Verify association
      cy.visit(`/admin/datasets/${datasetId}`);
      cy.get('[data-testid="dataset-applications-tab"]').click();
      
      // Check application is listed
      cy.get('[data-testid="associated-applications-list"]').should('be.visible');
      cy.get('[data-testid="associated-applications-list"]').should('contain', 'Dataset Test Application');
      
      // Also verify from application side
      cy.visit(`/admin/applications/${applicationId}`);
      cy.get('[data-testid="application-datasets-tab"]').click();
      
      // Check dataset is listed
      cy.get('[data-testid="associated-datasets-list"]').should('be.visible');
      cy.get('[data-testid="associated-datasets-list"]').should('contain', 'Updated Employee Dataset');
    });
  });
  
  it('validates dataset data against schema', function() {
    // Get the basic dataset ID
    const datasetId = this.basicDatasetId;
    
    // Add validation rules to dataset
    const validationRules = [
      { field: 'email', type: 'format', param: 'email' },
      { field: 'salary', type: 'minimum', param: '0' },
      { field: 'hire_date', type: 'format', param: 'date' }
    ];
    
    cy.addDatasetValidation(datasetId, validationRules).then(() => {
      // Load validation test data from fixture
      cy.fixture('datasets/sample_datasets.json').then(datasets => {
        // Test valid data
        const validData = datasets.validationExamples.validEmployeeData;
        cy.testDatasetValidation(datasetId, validData).then(validationResult => {
          // Verify validation passed
          cy.get('[data-testid="validation-result-status"]').should('contain', 'VALID');
          cy.get('[data-testid="validation-passed-count"]').should('contain', '3');
          cy.get('[data-testid="validation-failed-count"]').should('contain', '0');
        });
        
        // Test invalid data
        const invalidData = datasets.validationExamples.invalidEmployeeData;
        cy.testDatasetValidation(datasetId, invalidData).then(validationResult => {
          // Verify validation failed
          cy.get('[data-testid="validation-result-status"]').should('contain', 'INVALID');
          cy.get('[data-testid="validation-passed-count"]').should('contain', '0');
          cy.get('[data-testid="validation-failed-count"]').should('contain', '3');
          
          // Check error details
          cy.get('[data-testid="validation-errors-list"]').should('contain', 'email');
          cy.get('[data-testid="validation-errors-list"]').should('contain', 'hire_date');
        });
      });
    });
  });
  
  it('previews dataset data', function() {
    // Get the basic dataset ID
    const datasetId = this.basicDatasetId;
    
    // Load sample data from fixture
    cy.fixture('datasets/sample_datasets.json').then(datasets => {
      // Preview dataset data
      cy.previewDatasetData(datasetId).then(previewData => {
        // Verify preview contains sample data fields
        cy.get('[data-testid="preview-data-table"]').should('be.visible');
        cy.get('[data-testid="preview-data-table"]').should('contain', 'employee_id');
        cy.get('[data-testid="preview-data-table"]').should('contain', 'first_name');
        cy.get('[data-testid="preview-data-table"]').should('contain', 'last_name');
        cy.get('[data-testid="preview-data-table"]').should('contain', 'email');
        cy.get('[data-testid="preview-data-table"]').should('contain', 'hire_date');
        cy.get('[data-testid="preview-data-table"]').should('contain', 'department');
        cy.get('[data-testid="preview-data-table"]').should('contain', 'salary');
        
        // Verify data formatting
        cy.get('[data-testid="data-format-selector"]').should('be.visible');
        
        // Check JSON format
        cy.get('[data-testid="data-format-selector"]').select('JSON');
        cy.get('[data-testid="json-preview"]').should('be.visible');
        
        // Check Table format
        cy.get('[data-testid="data-format-selector"]').select('TABLE');
        cy.get('[data-testid="preview-data-table"]').should('be.visible');
      });
    });
  });
  
  it('uses dataset in integration flow', function() {
    // Get the integration ID and dataset ID
    const integrationId = this.testIntegrationId;
    const datasetId = this.basicDatasetId;
    
    // Add dataset node to flow
    cy.addDatasetNodeToFlow(integrationId, datasetId).then(nodeId => {
      // Verify node is added to the flow
      cy.get(`[data-testid="node-${nodeId}"]`).should('be.visible');
      cy.get(`[data-testid="node-${nodeId}"]`).should('have.attr', 'data-node-type', 'DATASET');
      
      // Verify dataset is selected in node
      cy.get(`[data-testid="node-${nodeId}"]`).click();
      cy.get('[data-testid="node-properties-panel"]').should('be.visible');
      cy.get('[data-testid="dataset-select"]').should('have.value', datasetId);
      
      // Check dataset schema is displayed
      cy.get('[data-testid="dataset-schema-preview"]').should('be.visible');
      cy.get('[data-testid="dataset-schema-preview"]').should('contain', 'employee_id');
      cy.get('[data-testid="dataset-schema-preview"]').should('contain', 'first_name');
      
      // Add a destination node
      cy.addNode('JSON_DESTINATION', { x: 500, y: 200 }).then($destNode => {
        const destNodeId = $destNode.attr('data-node-id');
        
        // Configure destination node
        cy.configureNode(destNodeId, {
          'destination_type': 'MEMORY',
          'format': 'JSON'
        });
        
        // Connect dataset node to destination node
        cy.connectNodes(nodeId, destNodeId);
        
        // Save the flow
        cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
        cy.get('[data-testid="save-flow-button"]').click();
        cy.wait('@saveFlow');
        
        // Run the integration
        cy.runIntegration(integrationId).then(executionId => {
          // Monitor execution
          cy.monitorExecution(executionId, 30000).then(executionResult => {
            // Verify execution completed successfully
            expect(executionResult.status).to.equal('SUCCESS');
            
            // Verify the output contains dataset fields
            cy.visit(`/executions/${executionId}/output`);
            cy.get('[data-testid="execution-output"]').should('contain', 'employee_id');
            cy.get('[data-testid="execution-output"]').should('contain', 'first_name');
            cy.get('[data-testid="execution-output"]').should('contain', 'email');
          });
        });
      });
    });
  });
  
  it('creates and uses different dataset formats', function() {
    // Load test data from fixture
    cy.fixture('datasets/sample_datasets.json').then(datasets => {
      // Create a CSV dataset
      cy.createDataset(datasets.csvDataset).then(csvDataset => {
        // Store the dataset ID
        cy.wrap(csvDataset.id).as('csvDatasetId');
        
        // Verify CSV dataset schema
        cy.visit(`/admin/datasets/${csvDataset.id}`);
        cy.get('[data-testid="dataset-schema-tab"]').click();
        cy.get('[data-testid="schema-preview"]').should('contain', 'date');
        cy.get('[data-testid="schema-preview"]').should('contain', 'region');
        cy.get('[data-testid="schema-preview"]').should('contain', 'product_category');
        
        // Create an XML dataset
        cy.createDataset(datasets.xmlDataset).then(xmlDataset => {
          // Store the dataset ID
          cy.wrap(xmlDataset.id).as('xmlDatasetId');
          
          // Verify XML dataset schema
          cy.visit(`/admin/datasets/${xmlDataset.id}`);
          cy.get('[data-testid="dataset-schema-tab"]').click();
          cy.get('[data-testid="schema-preview"]').should('contain', 'inventory');
          cy.get('[data-testid="schema-preview"]').should('contain', 'product');
          cy.get('[data-testid="schema-preview"]').should('contain', 'sku');
        });
      });
    });
  });
  
  it('searches and filters datasets', function() {
    // Search for dataset by name
    cy.visit('/admin/datasets');
    cy.get('[data-testid="dataset-search-input"]').clear().type('Employee');
    cy.get('[data-testid="search-datasets-button"]').click();
    
    // Verify search results contain the employee dataset
    cy.get('[data-testid="dataset-list"]').should('contain', 'Updated Employee Dataset');
    
    // Filter by dataset type
    cy.get('[data-testid="dataset-type-filter"]').select('JSON');
    cy.get('[data-testid="apply-filters-button"]').click();
    
    // Verify only JSON datasets are displayed
    cy.get('[data-testid="dataset-list"]').should('contain', 'Updated Employee Dataset');
    cy.get('[data-testid="dataset-list"]').should('contain', 'Sales Transactions');
    
    // Clear filters
    cy.get('[data-testid="clear-filters-button"]').click();
    
    // Search for dataset by tag
    cy.get('[data-testid="dataset-tag-filter"]').type('complex{enter}');
    cy.get('[data-testid="apply-filters-button"]').click();
    
    // Verify complex dataset is displayed
    cy.get('[data-testid="dataset-list"]').should('contain', 'Sales Transactions');
    cy.get('[data-testid="dataset-list"]').should('not.contain', 'Updated Employee Dataset');
  });
  
  it('manages dataset versions', function() {
    // Get the basic dataset ID
    const datasetId = this.basicDatasetId;
    
    // Update dataset to create a new version
    const updateData = {
      description: 'Version 2 of the employee dataset',
      schema: {
        type: 'object',
        properties: {
          employee_id: {
            type: 'string',
            description: 'Unique identifier for the employee'
          },
          first_name: {
            type: 'string',
            description: 'Employee\'s first name'
          },
          last_name: {
            type: 'string',
            description: 'Employee\'s last name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Employee\'s email address'
          },
          hire_date: {
            type: 'string',
            format: 'date',
            description: 'Date the employee was hired'
          },
          department: {
            type: 'string',
            description: 'Department the employee belongs to'
          },
          salary: {
            type: 'number',
            description: 'Employee\'s annual salary'
          },
          manager_id: {
            type: 'string',
            description: 'ID of the employee\'s manager'
          },
          access_level: {
            type: 'string',
            enum: ['basic', 'admin', 'super_admin'],
            description: 'Employee\'s system access level'
          }
        },
        required: ['employee_id', 'first_name', 'last_name', 'email', 'hire_date', 'department']
      }
    };
    
    cy.updateDataset(datasetId, updateData).then(() => {
      // Get dataset versions
      cy.getDatasetVersions(datasetId).then(versions => {
        // Verify at least 2 versions exist
        cy.get('[data-testid="dataset-version-list"]').should('be.visible');
        cy.get('[data-testid="dataset-version-list"] [data-testid="dataset-version-item"]').should('have.length.at.least', 2);
        
        // Get the ID of the first (oldest) version
        cy.get('[data-testid="dataset-version-list"] [data-testid="dataset-version-item"]')
          .last()
          .invoke('attr', 'data-version-id')
          .then(versionId => {
            // Restore the older version
            cy.restoreDatasetVersion(datasetId, versionId).then(() => {
              // Verify restoration
              cy.get('[data-testid="dataset-schema-tab"]').click();
              cy.get('[data-testid="schema-preview"]').should('not.contain', 'access_level');
              
              // Verify a new version was created during restoration
              cy.get('[data-testid="dataset-history-tab"]').click();
              cy.get('[data-testid="dataset-version-list"] [data-testid="dataset-version-item"]').should('have.length.at.least', 3);
              cy.get('[data-testid="version-restore-indicator"]').should('be.visible');
            });
          });
      });
    });
  });
  
  it('deletes a dataset', function() {
    // Get the schema discovery dataset ID
    const datasetId = this.discoveryDatasetId;
    
    // Delete the dataset
    cy.deleteDataset(datasetId).then(() => {
      // Verify dataset is no longer in the list
      cy.visit('/admin/datasets');
      cy.get('[data-testid="dataset-search-input"]').clear().type('Schema Discovery Test');
      cy.get('[data-testid="search-datasets-button"]').click();
      
      // Should show no results
      cy.get('[data-testid="no-results-message"]').should('be.visible');
    });
  });
  
  after(() => {
    // Clean up test data
    cy.request('POST', '/api/test/reset-db', { scope: ['datasets', 'integrations', 'applications'] });
    
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });
});