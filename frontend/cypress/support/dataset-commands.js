// cypress/support/dataset-commands.js

/**
 * Custom Cypress commands for dataset management testing
 * 
 * These commands provide abstracted functionality for:
 * - Dataset CRUD operations
 * - Schema management
 * - Dataset association with applications and integrations
 * - Dataset preview and validation
 */

// Create a new dataset
Cypress.Commands.add('createDataset', (datasetConfig) => {
  // Intercept dataset creation request
  cy.intercept('POST', '/api/datasets').as('createDataset');

  // Navigate to datasets page
  cy.visit('/admin/datasets');
  cy.get('[data-testid="create-dataset-button"]').click();

  // Fill out dataset form
  cy.get('[data-testid="dataset-name-input"]').type(datasetConfig.name);
  cy.get('[data-testid="dataset-description-input"]').type(datasetConfig.description);
  cy.get('[data-testid="dataset-type-select"]').select(datasetConfig.type);

  // Handle tags if provided
  if (datasetConfig.tags && datasetConfig.tags.length > 0) {
    datasetConfig.tags.forEach(tag => {
      cy.get('[data-testid="dataset-tags-input"]').type(`${tag}{enter}`);
    });
  }

  // Handle schema if provided
  if (datasetConfig.schema) {
    cy.get('[data-testid="dataset-schema-tab"]').click();
    cy.get('[data-testid="schema-editor"]').should('be.visible');

    // If schema is a string, type it directly (JSON)
    if (typeof datasetConfig.schema === 'string') {
      cy.get('[data-testid="schema-editor"]').type(datasetConfig.schema, { parseSpecialCharSequences: false });
    } else {
      // If schema is an object, convert to string and type
      const schemaString = JSON.stringify(datasetConfig.schema, null, 2);
      cy.get('[data-testid="schema-editor"]').type(schemaString, { parseSpecialCharSequences: false });
    }
  }

  // Submit form
  cy.get('[data-testid="save-dataset-button"]').click();
  
  // Wait for creation to complete
  cy.wait('@createDataset').then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    return cy.wrap(interception.response.body);
  });
});

// Get dataset by name
Cypress.Commands.add('getDataset', (datasetName) => {
  // Intercept datasets list request
  cy.intercept('GET', '/api/datasets*').as('getDatasets');
  
  // Navigate to datasets page
  cy.visit('/admin/datasets');
  cy.wait('@getDatasets');
  
  // Search for the dataset
  cy.get('[data-testid="dataset-search-input"]').clear().type(datasetName);
  cy.get('[data-testid="search-datasets-button"]').click();
  
  // Get the first matching dataset
  cy.get('[data-testid="dataset-row"]').first().then($row => {
    const datasetId = $row.attr('data-dataset-id');
    cy.intercept('GET', `/api/datasets/${datasetId}`).as('getDatasetDetails');
    cy.wrap($row).click();
    
    return cy.wait('@getDatasetDetails').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      return cy.wrap(interception.response.body);
    });
  });
});

// Update dataset
Cypress.Commands.add('updateDataset', (datasetId, updateConfig) => {
  // Intercept dataset update request
  cy.intercept('PUT', `/api/datasets/${datasetId}`).as('updateDataset');
  
  // Navigate to dataset detail page
  cy.visit(`/admin/datasets/${datasetId}`);
  cy.get('[data-testid="edit-dataset-button"]').click();
  
  // Update fields as needed
  if (updateConfig.name) {
    cy.get('[data-testid="dataset-name-input"]').clear().type(updateConfig.name);
  }
  
  if (updateConfig.description) {
    cy.get('[data-testid="dataset-description-input"]').clear().type(updateConfig.description);
  }
  
  if (updateConfig.type) {
    cy.get('[data-testid="dataset-type-select"]').select(updateConfig.type);
  }
  
  // Handle schema updates
  if (updateConfig.schema) {
    cy.get('[data-testid="dataset-schema-tab"]').click();
    cy.get('[data-testid="schema-editor"]').should('be.visible');
    cy.get('[data-testid="schema-editor"]').clear();
    
    // If schema is a string, type it directly (JSON)
    if (typeof updateConfig.schema === 'string') {
      cy.get('[data-testid="schema-editor"]').type(updateConfig.schema, { parseSpecialCharSequences: false });
    } else {
      // If schema is an object, convert to string and type
      const schemaString = JSON.stringify(updateConfig.schema, null, 2);
      cy.get('[data-testid="schema-editor"]').type(schemaString, { parseSpecialCharSequences: false });
    }
  }
  
  // Submit form
  cy.get('[data-testid="save-dataset-button"]').click();
  
  // Wait for update to complete
  cy.wait('@updateDataset').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});

// Delete dataset
Cypress.Commands.add('deleteDataset', (datasetId) => {
  // Intercept dataset delete request
  cy.intercept('DELETE', `/api/datasets/${datasetId}`).as('deleteDataset');
  
  // Navigate to dataset detail page
  cy.visit(`/admin/datasets/${datasetId}`);
  cy.get('[data-testid="delete-dataset-button"]').click();
  
  // Confirm deletion
  cy.get('[data-testid="confirm-delete-button"]').click();
  
  // Wait for delete to complete
  cy.wait('@deleteDataset').then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 204]);
    return cy.wrap(true);
  });
});

// Associate dataset with application
Cypress.Commands.add('associateDatasetWithApplication', (datasetId, applicationId) => {
  // Intercept dataset association request
  cy.intercept('POST', `/api/datasets/${datasetId}/applications`).as('associateApplication');
  
  // Navigate to dataset detail page
  cy.visit(`/admin/datasets/${datasetId}`);
  cy.get('[data-testid="dataset-applications-tab"]').click();
  
  // Click associate button
  cy.get('[data-testid="associate-application-button"]').click();
  
  // Select application
  cy.get('[data-testid="application-select"]').select(applicationId);
  
  // Confirm association
  cy.get('[data-testid="confirm-association-button"]').click();
  
  // Wait for association to complete
  cy.wait('@associateApplication').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});

// Discover schema from sample data
Cypress.Commands.add('discoverDatasetSchema', (datasetId, sampleData) => {
  // Intercept schema discovery request
  cy.intercept('POST', `/api/datasets/${datasetId}/discover-schema`).as('discoverSchema');
  
  // Navigate to dataset detail page
  cy.visit(`/admin/datasets/${datasetId}`);
  cy.get('[data-testid="edit-dataset-button"]').click();
  cy.get('[data-testid="dataset-schema-tab"]').click();
  
  // Go to discovery tab
  cy.get('[data-testid="schema-discovery-tab"]').click();
  
  // Paste sample data
  cy.get('[data-testid="sample-data-input"]').clear();
  
  // If sample data is object, convert to string
  if (typeof sampleData === 'object') {
    const dataString = JSON.stringify(sampleData, null, 2);
    cy.get('[data-testid="sample-data-input"]').type(dataString, { parseSpecialCharSequences: false });
  } else {
    cy.get('[data-testid="sample-data-input"]').type(sampleData, { parseSpecialCharSequences: false });
  }
  
  // Click discover button
  cy.get('[data-testid="discover-schema-button"]').click();
  
  // Wait for discovery to complete
  cy.wait('@discoverSchema').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    
    // Apply discovered schema
    cy.get('[data-testid="apply-discovered-schema-button"]').click();
    
    // Click save
    cy.get('[data-testid="save-dataset-button"]').click();
    
    return cy.wrap(interception.response.body.schema);
  });
});

// Preview dataset data
Cypress.Commands.add('previewDatasetData', (datasetId) => {
  // Intercept data preview request
  cy.intercept('GET', `/api/datasets/${datasetId}/preview`).as('previewData');
  
  // Navigate to dataset detail page
  cy.visit(`/admin/datasets/${datasetId}`);
  cy.get('[data-testid="dataset-preview-tab"]').click();
  
  // Wait for preview to load
  cy.wait('@previewData').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});

// Validate value exists in dataset preview
Cypress.Commands.add('validatePreviewField', (fieldName, expectedValue) => {
  cy.get('[data-testid="preview-data-table"] th').contains(fieldName)
    .invoke('index')
    .then(columnIndex => {
      cy.get('[data-testid="preview-data-table"] tbody tr')
        .first()
        .find('td')
        .eq(columnIndex)
        .invoke('text')
        .should('include', expectedValue);
    });
});

// Use dataset in integration flow
Cypress.Commands.add('addDatasetNodeToFlow', (integrationId, datasetId, position = { x: 300, y: 200 }) => {
  // Open integration builder
  cy.visit(`/integrations/${integrationId}/builder`);
  
  // Add dataset node
  cy.get('[data-testid="add-node-button"]').click();
  cy.get('[data-testid="node-type-DATASET"]').click();
  
  // Position node
  cy.get('[data-testid="flow-canvas"]').click(position.x, position.y);
  
  // Get the created node id
  cy.get('[data-node-type="DATASET"]').last().invoke('attr', 'data-node-id').then(nodeId => {
    // Configure dataset node
    cy.get(`[data-testid="node-${nodeId}"]`).click();
    cy.get('[data-testid="dataset-select"]').select(datasetId);
    cy.get('[data-testid="apply-node-config-button"]').click();
    
    // Return node id
    return cy.wrap(nodeId);
  });
});

// Add validation to dataset
Cypress.Commands.add('addDatasetValidation', (datasetId, validationRules) => {
  // Intercept validation update request
  cy.intercept('POST', `/api/datasets/${datasetId}/validations`).as('updateValidations');
  
  // Navigate to dataset detail page
  cy.visit(`/admin/datasets/${datasetId}`);
  cy.get('[data-testid="dataset-validations-tab"]').click();
  
  // Add validation rules
  validationRules.forEach((rule, index) => {
    if (index > 0) {
      cy.get('[data-testid="add-validation-rule-button"]').click();
    }
    
    cy.get('[data-testid="validation-field-select"]').last().select(rule.field);
    cy.get('[data-testid="validation-type-select"]').last().select(rule.type);
    
    if (rule.param !== undefined) {
      cy.get('[data-testid="validation-param-input"]').last().type(rule.param);
    }
  });
  
  // Save validations
  cy.get('[data-testid="save-validations-button"]').click();
  
  // Wait for update to complete
  cy.wait('@updateValidations').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});

// Test dataset validation against sample data
Cypress.Commands.add('testDatasetValidation', (datasetId, sampleData) => {
  // Intercept validation test request
  cy.intercept('POST', `/api/datasets/${datasetId}/validate`).as('validateData');
  
  // Navigate to dataset detail page
  cy.visit(`/admin/datasets/${datasetId}`);
  cy.get('[data-testid="dataset-validations-tab"]').click();
  
  // Go to test validation tab
  cy.get('[data-testid="test-validation-tab"]').click();
  
  // Paste sample data
  cy.get('[data-testid="test-data-input"]').clear();
  
  // If sample data is object, convert to string
  if (typeof sampleData === 'object') {
    const dataString = JSON.stringify(sampleData, null, 2);
    cy.get('[data-testid="test-data-input"]').type(dataString, { parseSpecialCharSequences: false });
  } else {
    cy.get('[data-testid="test-data-input"]').type(sampleData, { parseSpecialCharSequences: false });
  }
  
  // Click validate button
  cy.get('[data-testid="validate-data-button"]').click();
  
  // Wait for validation to complete
  cy.wait('@validateData').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});

// Get dataset history/versions
Cypress.Commands.add('getDatasetVersions', (datasetId) => {
  // Intercept versions request
  cy.intercept('GET', `/api/datasets/${datasetId}/versions`).as('getVersions');
  
  // Navigate to dataset detail page
  cy.visit(`/admin/datasets/${datasetId}`);
  cy.get('[data-testid="dataset-history-tab"]').click();
  
  // Wait for versions to load
  cy.wait('@getVersions').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});

// Restore dataset version
Cypress.Commands.add('restoreDatasetVersion', (datasetId, versionId) => {
  // Intercept restore request
  cy.intercept('POST', `/api/datasets/${datasetId}/versions/${versionId}/restore`).as('restoreVersion');
  
  // Navigate to dataset detail page
  cy.visit(`/admin/datasets/${datasetId}`);
  cy.get('[data-testid="dataset-history-tab"]').click();
  
  // Find version and click restore
  cy.get(`[data-version-id="${versionId}"]`).find('[data-testid="restore-version-button"]').click();
  
  // Confirm restore
  cy.get('[data-testid="confirm-restore-button"]').click();
  
  // Wait for restore to complete
  cy.wait('@restoreVersion').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});