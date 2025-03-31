// ***********************************************
// Custom Cypress commands for data transformation operations
// ***********************************************

/**
 * Command to add a transformation node
 */
Cypress.Commands.add('addTransformNode', (position = { x: 400, y: 200 }) => {
  // Add transform node to canvas
  cy.addNode('TRANSFORM', position).then($node => {
    const nodeId = $node.attr('data-node-id');
    return cy.wrap(nodeId);
  });
});

/**
 * Command to create a data transformation flow
 */
Cypress.Commands.add('createTransformationFlow', (integrationId, sourceNodeId, destNodeId) => {
  // Open integration builder
  cy.openIntegrationBuilder(integrationId);
  
  // Add transform node between source and destination
  cy.addTransformNode({ x: 400, y: 200 }).then(transformNodeId => {
    // Connect source to transform
    cy.connectNodes(sourceNodeId, transformNodeId);
    
    // Connect transform to destination
    cy.connectNodes(transformNodeId, destNodeId);
    
    // Return the transform node id
    return cy.wrap(transformNodeId);
  });
});

/**
 * Command to add a simple field mapping
 */
Cypress.Commands.add('addFieldMapping', (sourceField, destinationField, transformationType = null) => {
  // Add a new field mapping
  cy.get('[data-testid="add-field-mapping-button"]').click();
  
  // Select source field
  cy.get('[data-testid="source-field-select"]').last().select(sourceField);
  
  // Enter destination field
  cy.get('[data-testid="destination-field-input"]').last().type(destinationField);
  
  // Add transformation if specified
  if (transformationType) {
    cy.get('[data-testid="add-transformation-button"]').last().click();
    cy.get('[data-testid="transformation-type-select"]').last().select(transformationType);
  }
});

/**
 * Command to add a combined field mapping
 */
Cypress.Commands.add('addCombinedFieldMapping', (sourceFields, destinationField, format) => {
  // Add a new field mapping
  cy.get('[data-testid="add-field-mapping-button"]').click();
  
  // Select combined mapping type
  cy.get('[data-testid="mapping-type-select"]').last().select('COMBINED');
  
  // Enter destination field
  cy.get('[data-testid="destination-field-input"]').last().type(destinationField);
  
  // Add source fields
  sourceFields.forEach(field => {
    cy.get('[data-testid="add-source-field-button"]').last().click();
    cy.get('[data-testid="source-field-select"]').last().select(field);
  });
  
  // Set format template
  cy.get('[data-testid="combination-format-input"]').last().type('{selectall}{backspace}' + format);
});

/**
 * Command to add a conditional field mapping
 */
Cypress.Commands.add('addConditionalFieldMapping', (sourceField, destinationField, condition) => {
  // Add a new field mapping
  cy.get('[data-testid="add-field-mapping-button"]').click();
  
  // Select conditional mapping type
  cy.get('[data-testid="mapping-type-select"]').last().select('CONDITIONAL');
  
  // Select source field
  cy.get('[data-testid="source-field-select"]').last().select(sourceField);
  
  // Enter destination field
  cy.get('[data-testid="destination-field-input"]').last().type(destinationField);
  
  // Set condition
  cy.get('[data-testid="condition-input"]').last().type(condition);
});

/**
 * Command to add a custom script mapping
 */
Cypress.Commands.add('addScriptMapping', (destinationField, script) => {
  // Add a new field mapping
  cy.get('[data-testid="add-field-mapping-button"]').click();
  
  // Select custom mapping type
  cy.get('[data-testid="mapping-type-select"]').last().select('CUSTOM');
  
  // Enter destination field
  cy.get('[data-testid="destination-field-input"]').last().type(destinationField);
  
  // Enter script
  cy.get('[data-testid="custom-script-editor"]').last().type(script);
});

/**
 * Command to preview transformation results
 */
Cypress.Commands.add('previewTransformation', (integrationId) => {
  // Request preview data
  cy.intercept('POST', `/api/integrations/${integrationId}/preview`).as('previewData');
  cy.get('[data-testid="preview-data-button"]').click();
  
  // Wait for preview data
  return cy.wait('@previewData').then(interception => {
    expect(interception.response.statusCode).to.eq(200);
    
    // Verify preview data table is visible
    cy.get('[data-testid="preview-data-table"]').should('be.visible');
    
    // Return the preview data
    return interception.response.body.data;
  });
});

/**
 * Command to validate a field value in preview data
 */
Cypress.Commands.add('validatePreviewField', (fieldName, expectedValue) => {
  // Find the column with the field name
  cy.get('[data-testid="preview-data-table"] th').contains(fieldName)
    .invoke('index')
    .then(columnIndex => {
      // Get the first row value for this column
      cy.get('[data-testid="preview-data-table"] tbody tr')
        .first()
        .find('td')
        .eq(columnIndex)
        .invoke('text')
        .should('eq', expectedValue);
    });
});

/**
 * Command to save transformation configuration
 */
Cypress.Commands.add('saveTransformation', (integrationId) => {
  // Save the transformation
  cy.get('[data-testid="save-transformation-button"]').click();
  
  // Wait for the saving indicator to disappear
  cy.get('[data-testid="saving-indicator"]').should('not.exist');
  
  // Save the overall flow
  cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
  cy.get('[data-testid="save-flow-button"]').click();
  
  // Wait for save to complete
  return cy.wait('@saveFlow').then(interception => {
    expect(interception.response.statusCode).to.eq(200);
    
    // Verify success message
    cy.get('[data-testid="notification-toast"]').should('contain', 'Flow saved successfully');
  });
});