// template-commands.js
// -----------------------------------------------------------------------------
// Custom Cypress commands for testing the Template Management functionality

/**
 * Navigate to the template browser page
 * Assumes user is already logged in
 */
Cypress.Commands.add('navigateToTemplateBrowser', () => {
  cy.log('Navigating to Template Browser page');
  
  // Navigate to integrations first
  cy.get('a[href*="/integrations"]').click();
  cy.url().should('include', '/integrations');
  
  // Click on Templates in the sidebar or menu
  cy.contains('Templates').click();
  cy.url().should('include', '/integrations/templates');
  
  // Verify page loaded correctly
  cy.contains('h1', 'Integration Templates').should('be.visible');
});

/**
 * Create a new template with the provided data
 * @param {Object} templateData - The template data 
 */
Cypress.Commands.add('createTemplate', (templateData) => {
  cy.log(`Creating template: ${templateData.name}`);
  
  // Navigate to template browser if not already there
  cy.url().then((url) => {
    if (!url.includes('/integrations/templates')) {
      cy.navigateToTemplateBrowser();
    }
  });
  
  // Click create template button
  cy.contains('button', 'Create Template').click();
  
  // Fill in the form
  cy.get('input[name="name"]').type(templateData.name);
  
  if (templateData.description) {
    cy.get('textarea[name="description"]').type(templateData.description);
  }
  
  if (templateData.category) {
    cy.get('select[name="category"]').select(templateData.category);
  }
  
  if (templateData.industry) {
    cy.get('select[name="industry"]').select(templateData.industry);
  }
  
  if (templateData.complexity) {
    cy.get('select[name="complexity"]').select(templateData.complexity);
  }
  
  // For predefined flow structure, we'll select from options if available
  if (templateData.flowStructure) {
    cy.get('select[name="flowStructure"]').select(templateData.flowStructure);
  }
  
  // Add tags if included
  if (templateData.tags && templateData.tags.length > 0) {
    templateData.tags.forEach(tag => {
      cy.get('input[name="tags"]').type(tag);
      cy.get('button[aria-label="Add tag"]').click();
    });
  }
  
  // Configure connections if provided
  if (templateData.connections && templateData.connections.length > 0) {
    cy.contains('button', 'Configure Connections').click();
    
    templateData.connections.forEach((connection, index) => {
      if (index > 0) {
        cy.contains('button', 'Add Connection').click();
      }
      
      cy.get(`[data-testid="connection-type-${index}"]`).select(connection.type);
      cy.get(`[data-testid="connection-name-${index}"]`).type(connection.name);
    });
    
    cy.contains('button', 'Save Connections').click();
  }
  
  // Submit the form
  cy.contains('button', 'Create').click();
  
  // Verify success
  cy.contains('Template created successfully').should('be.visible');
  cy.contains(templateData.name).should('be.visible');
});

/**
 * Edit an existing template
 * @param {String} templateName - The name to identify the template
 * @param {Object} newData - The updated template data
 */
Cypress.Commands.add('editTemplate', (templateName, newData) => {
  cy.log(`Editing template: ${templateName}`);
  
  // Find the template card or row
  cy.contains('[data-testid="template-item"]', templateName)
    .within(() => {
      // Click the edit button
      cy.get('[aria-label="Edit template"]').click();
    });
  
  // Clear and update fields
  if (newData.name) {
    cy.get('input[name="name"]').clear().type(newData.name);
  }
  
  if (newData.description) {
    cy.get('textarea[name="description"]').clear().type(newData.description);
  }
  
  if (newData.category) {
    cy.get('select[name="category"]').select(newData.category);
  }
  
  if (newData.industry) {
    cy.get('select[name="industry"]').select(newData.industry);
  }
  
  if (newData.complexity) {
    cy.get('select[name="complexity"]').select(newData.complexity);
  }
  
  // Update tags if included
  if (newData.tags) {
    // Remove existing tags
    cy.get('.template-tag [aria-label="Remove tag"]').each(($el) => {
      cy.wrap($el).click();
    });
    
    // Add new tags
    newData.tags.forEach(tag => {
      cy.get('input[name="tags"]').type(tag);
      cy.get('button[aria-label="Add tag"]').click();
    });
  }
  
  // Submit the form
  cy.contains('button', 'Update').click();
  
  // Verify success
  cy.contains('Template updated successfully').should('be.visible');
});

/**
 * Delete a template
 * @param {String} templateName - The name to identify the template
 */
Cypress.Commands.add('deleteTemplate', (templateName) => {
  cy.log(`Deleting template: ${templateName}`);
  
  // Find the template card or row
  cy.contains('[data-testid="template-item"]', templateName)
    .within(() => {
      // Click the delete button
      cy.get('[aria-label="Delete template"]').click();
    });
  
  // Confirm deletion
  cy.contains('Confirm Delete').should('be.visible');
  cy.contains(`Are you sure you want to delete this template?`).should('be.visible');
  cy.contains('button', 'Delete').click();
  
  // Verify success
  cy.contains('Template deleted successfully').should('be.visible');
  cy.contains('[data-testid="template-item"]', templateName).should('not.exist');
});

/**
 * Filter templates by category
 * @param {String} category - The category to filter by
 */
Cypress.Commands.add('filterTemplatesByCategory', (category) => {
  cy.log(`Filtering templates by category: ${category}`);
  
  // Select the category from the filter dropdown
  cy.get('select[data-testid="category-filter"]').select(category);
  
  // Verify filter applied
  cy.get('select[data-testid="category-filter"]').should('have.value', category);
});

/**
 * Filter templates by industry
 * @param {String} industry - The industry to filter by
 */
Cypress.Commands.add('filterTemplatesByIndustry', (industry) => {
  cy.log(`Filtering templates by industry: ${industry}`);
  
  // Select the industry from the filter dropdown
  cy.get('select[data-testid="industry-filter"]').select(industry);
  
  // Verify filter applied
  cy.get('select[data-testid="industry-filter"]').should('have.value', industry);
});

/**
 * Filter templates by complexity
 * @param {String} complexity - The complexity to filter by (Simple, Moderate, Complex)
 */
Cypress.Commands.add('filterTemplatesByComplexity', (complexity) => {
  cy.log(`Filtering templates by complexity: ${complexity}`);
  
  // Select the complexity from the filter dropdown
  cy.get('select[data-testid="complexity-filter"]').select(complexity);
  
  // Verify filter applied
  cy.get('select[data-testid="complexity-filter"]').should('have.value', complexity);
});

/**
 * Search for templates
 * @param {String} searchTerm - The search term
 */
Cypress.Commands.add('searchTemplates', (searchTerm) => {
  cy.log(`Searching for templates with term: ${searchTerm}`);
  
  // Type in the search field
  cy.get('input[placeholder*="Search templates"]').type(searchTerm);
  
  // Verify search applied
  cy.get('input[placeholder*="Search templates"]').should('have.value', searchTerm);
});

/**
 * Preview a template
 * @param {String} templateName - The name to identify the template
 */
Cypress.Commands.add('previewTemplate', (templateName) => {
  cy.log(`Previewing template: ${templateName}`);
  
  // Find the template card or row
  cy.contains('[data-testid="template-item"]', templateName)
    .within(() => {
      // Click the preview button or the template itself
      cy.get('[aria-label="Preview template"]').click();
    });
  
  // Verify preview modal opened
  cy.contains('Template Preview').should('be.visible');
  cy.contains(templateName).should('be.visible');
  
  // Return focus to the main window (close modal)
  cy.contains('button', 'Close').click();
});

/**
 * Use a template to create a new integration
 * @param {String} templateName - The name of the template to use
 */
Cypress.Commands.add('useTemplate', (templateName) => {
  cy.log(`Using template: ${templateName} to create integration`);
  
  // Find the template card or row
  cy.contains('[data-testid="template-item"]', templateName)
    .within(() => {
      // Click the use template button
      cy.get('[aria-label="Use template"]').click();
    });
  
  // Verify new integration dialog opened
  cy.contains('New Integration from Template').should('be.visible');
});

/**
 * Create a new integration from a template
 * @param {String} templateName - The name of the template to use
 * @param {Object} integrationData - The integration configuration data
 */
Cypress.Commands.add('createIntegrationFromTemplate', (templateName, integrationData) => {
  cy.log(`Creating integration from template: ${templateName}`);
  
  // Use the template
  cy.useTemplate(templateName);
  
  // Fill in the integration creation form
  cy.get('input[name="name"]').type(integrationData.name);
  
  if (integrationData.description) {
    cy.get('textarea[name="description"]').type(integrationData.description);
  }
  
  // Configure parameters if provided
  if (integrationData.parameters && Object.keys(integrationData.parameters).length > 0) {
    // Move to parameters step if multi-step form
    cy.contains('button', 'Next').click();
    
    // Fill in the parameters
    Object.entries(integrationData.parameters).forEach(([key, value]) => {
      cy.get(`[name="parameter-${key}"]`).clear().type(value);
    });
  }
  
  // Configure connections if provided
  if (integrationData.connections && integrationData.connections.length > 0) {
    // Move to connections step if multi-step form and not already there
    if (!cy.contains('Configure Connections').should('be.visible')) {
      cy.contains('button', 'Next').click();
    }
    
    integrationData.connections.forEach((connection, index) => {
      cy.get(`[data-testid="connection-selector-${index}"]`).select(connection);
    });
  }
  
  // Submit the form
  cy.contains('button', 'Create Integration').click();
  
  // Verify success
  cy.contains('Integration created successfully').should('be.visible');
  cy.url().should('include', '/integrations/');
  cy.contains(integrationData.name).should('be.visible');
});

/**
 * Check page for accessibility issues
 * @param {String} context - The context for logging
 */
Cypress.Commands.add('checkTemplateA11y', (context = 'template browser page') => {
  cy.log(`Checking accessibility for: ${context}`);
  cy.injectAxe();
  cy.checkA11y(null, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa'],
    },
  }, (violations) => {
    cy.task('log', `${violations.length} accessibility violations found in ${context}`);
    violations.forEach((violation) => {
      cy.task('log', `Violation: ${violation.id} - ${violation.description}`);
    });
  });
});