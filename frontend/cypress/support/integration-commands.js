// ***********************************************
// Custom Cypress commands for integration operations
// ***********************************************

/**
 * Command to navigate to integrations list
 */
Cypress.Commands.add('navigateToIntegrations', () => {
  // Navigate to integrations page
  cy.get('[data-testid="integrations-link"]').click();
  
  // Verify integrations page
  cy.url().should('include', '/integrations');
  cy.get('[data-testid="integrations-page"]').should('be.visible');
});

/**
 * Command to create a new integration
 */
Cypress.Commands.add('createIntegration', (integrationData) => {
  // Navigate to integrations page
  cy.navigateToIntegrations();
  
  // Click create integration button
  cy.get('[data-testid="create-integration-button"]').click();
  
  // Select integration type if specified
  if (integrationData.type) {
    cy.get(`[data-testid="integration-type-${integrationData.type}"]`).click();
  }
  
  // Fill out integration details
  cy.get('[data-testid="integration-name-input"]').type(integrationData.name);
  cy.get('[data-testid="integration-description-input"]').type(integrationData.description);
  
  // Select schedule if specified
  if (integrationData.schedule) {
    cy.get('[data-testid="integration-schedule-select"]').select(integrationData.schedule);
  }
  
  // Apply tags if specified
  if (integrationData.tags && integrationData.tags.length > 0) {
    integrationData.tags.forEach(tag => {
      cy.get('[data-testid="integration-tag-input"]').type(`${tag}{enter}`);
    });
  }
  
  // Save integration
  cy.intercept('POST', '/api/integrations').as('createIntegration');
  cy.get('[data-testid="save-integration-button"]').click();
  
  // Wait for integration creation
  return cy.wait('@createIntegration').then(interception => {
    expect(interception.response.statusCode).to.eq(201);
    return interception.response.body;
  });
});

/**
 * Command to create integration from template
 */
Cypress.Commands.add('createIntegrationFromTemplate', (templateId, customizations = {}) => {
  // Navigate to integrations page
  cy.navigateToIntegrations();
  
  // Click create from template button
  cy.get('[data-testid="create-from-template-button"]').click();
  
  // Select the template
  cy.get(`[data-testid="template-${templateId}"]`).click();
  cy.get('[data-testid="use-template-button"]').click();
  
  // Customize template parameters
  if (customizations.name) {
    cy.get('[data-testid="integration-name-input"]').clear().type(customizations.name);
  }
  
  if (customizations.description) {
    cy.get('[data-testid="integration-description-input"]').clear().type(customizations.description);
  }
  
  // Apply customizations to template parameters
  if (customizations.parameters) {
    Object.entries(customizations.parameters).forEach(([key, value]) => {
      cy.get(`[data-testid="param-${key}"]`).clear().type(value);
    });
  }
  
  // Save integration
  cy.intercept('POST', '/api/integrations/template').as('createFromTemplate');
  cy.get('[data-testid="create-integration-button"]').click();
  
  // Wait for integration creation
  return cy.wait('@createFromTemplate').then(interception => {
    expect(interception.response.statusCode).to.eq(201);
    return interception.response.body;
  });
});

/**
 * Command to open integration builder
 */
Cypress.Commands.add('openIntegrationBuilder', (integrationId) => {
  // Navigate to integration detail page
  cy.visit(`/integrations/${integrationId}`);
  
  // Click edit button to open builder
  cy.get('[data-testid="edit-integration-button"]').click();
  
  // Verify builder is open
  cy.url().should('include', `/integrations/${integrationId}/builder`);
  cy.get('[data-testid="integration-flow-canvas"]').should('be.visible');
  
  // Wait for canvas to fully load
  cy.get('[data-testid="canvas-loading-indicator"]').should('not.exist');
});

/**
 * Command to add a node to the canvas
 */
Cypress.Commands.add('addNode', (nodeType, position = { x: 300, y: 300 }) => {
  // Open node palette if not already open
  cy.get('body').then($body => {
    if ($body.find('[data-testid="node-palette-container"]').length === 0) {
      cy.get('[data-testid="show-node-palette-button"]').click();
    }
  });
  
  // Find node in palette
  cy.get(`[data-testid="node-type-${nodeType}"]`).trigger('mousedown');
  
  // Drop node on canvas
  cy.get('[data-testid="integration-flow-canvas"]')
    .trigger('mousemove', { clientX: position.x, clientY: position.y })
    .trigger('mouseup', { force: true });
  
  // Verify node was added
  cy.get(`[data-testid="node-${nodeType}-"]`).should('be.visible');
  
  // Return the node element
  return cy.get(`[data-testid="node-${nodeType}-"]`).first();
});

/**
 * Command to connect two nodes
 */
Cypress.Commands.add('connectNodes', (sourceNodeId, targetNodeId) => {
  // Find source node output port
  cy.get(`[data-testid="node-${sourceNodeId}"] [data-testid="output-port"]`)
    .trigger('mousedown');
  
  // Connect to target node input port
  cy.get(`[data-testid="node-${targetNodeId}"] [data-testid="input-port"]`)
    .trigger('mousemove')
    .trigger('mouseup');
  
  // Verify edge was created
  cy.get(`[data-testid="edge-${sourceNodeId}-${targetNodeId}"]`).should('exist');
});

/**
 * Command to configure a node
 */
Cypress.Commands.add('configureNode', (nodeId, configuration) => {
  // Open node properties panel
  cy.get(`[data-testid="node-${nodeId}"]`).click();
  
  // Verify properties panel is open
  cy.get('[data-testid="node-properties-panel"]').should('be.visible');
  
  // Configure node based on provided configuration
  Object.entries(configuration).forEach(([key, value]) => {
    const selector = `[data-testid="node-property-${key}"]`;
    
    // Handle different input types
    cy.get(selector).then($el => {
      if ($el.is('select')) {
        cy.wrap($el).select(value);
      } else if ($el.is('input[type="checkbox"]')) {
        if (value) {
          cy.wrap($el).check();
        } else {
          cy.wrap($el).uncheck();
        }
      } else if ($el.is('input[type="file"]')) {
        cy.wrap($el).attachFile(value);
      } else {
        cy.wrap($el).clear().type(value);
      }
    });
  });
  
  // Apply configuration
  cy.get('[data-testid="apply-node-config-button"]').click();
});

/**
 * Command to run an integration
 */
Cypress.Commands.add('runIntegration', (integrationId) => {
  // Open integration detail page
  cy.visit(`/integrations/${integrationId}`);
  
  // Click run button
  cy.intercept('POST', `/api/integrations/${integrationId}/run`).as('runIntegration');
  cy.get('[data-testid="run-integration-button"]').click();
  
  // Confirm run
  cy.get('[data-testid="confirm-run-button"]').click();
  
  // Wait for run to start
  return cy.wait('@runIntegration').then(interception => {
    expect(interception.response.statusCode).to.eq(202);
    return interception.response.body.execution_id;
  });
});

/**
 * Command to monitor integration execution
 */
Cypress.Commands.add('monitorExecution', (executionId, maxWaitTime = 30000) => {
  // Open execution monitoring page
  cy.visit(`/executions/${executionId}`);
  
  // Wait for execution to complete
  cy.get('[data-testid="execution-status"]', { timeout: maxWaitTime }).should('not.contain', 'RUNNING');
  
  // Get execution result
  return cy.get('[data-testid="execution-status"]').then($status => {
    const status = $status.text().trim();
    
    // Return execution details
    cy.get('[data-testid="execution-details"]').then($details => {
      return {
        status,
        details: $details.text(),
        executionId
      };
    });
  });
});