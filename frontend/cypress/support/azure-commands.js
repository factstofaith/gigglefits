// azure-commands.js
// -----------------------------------------------------------------------------
// Custom Cypress commands for testing the Azure Configuration functionality

/**
 * Navigate to the Azure configuration page
 * Assumes user is already logged in as admin
 */
Cypress.Commands.add('navigateToAzureConfig', () => {
  cy.log('Navigating to Azure Configuration page');
  
  // Navigate to admin dashboard first
  cy.get('a[href*="/admin"]').click();
  cy.url().should('include', '/admin');
  
  // Click on Azure Configuration in the sidebar
  cy.contains('Azure Configuration').click();
  cy.url().should('include', '/admin/azure');
  
  // Verify page loaded correctly
  cy.contains('h1', 'Azure Configuration').should('be.visible');
});

/**
 * Create a new Azure configuration with the provided data
 * @param {Object} configData - The Azure configuration data
 */
Cypress.Commands.add('createAzureConfig', (configData) => {
  cy.log(`Creating Azure configuration with tenant ID: ${configData.tenantId}`);
  
  // Navigate to Azure config page if not already there
  cy.url().then((url) => {
    if (!url.includes('/admin/azure')) {
      cy.navigateToAzureConfig();
    }
  });
  
  // Click create configuration button
  cy.contains('button', 'Create Configuration').click();
  
  // Fill in the form
  cy.get('input[name="tenantId"]').type(configData.tenantId);
  cy.get('input[name="clientId"]').type(configData.clientId);
  cy.get('input[name="clientSecret"]').type(configData.clientSecret);
  
  if (configData.name) {
    cy.get('input[name="name"]').type(configData.name);
  }
  
  if (configData.description) {
    cy.get('textarea[name="description"]').type(configData.description);
  }
  
  // Submit the form
  cy.contains('button', 'Create').click();
  
  // Verify success
  cy.contains('Azure configuration created successfully').should('be.visible');
  
  // Verify created configuration appears
  if (configData.name) {
    cy.contains(configData.name).should('be.visible');
  } else {
    cy.contains(configData.tenantId).should('be.visible');
  }
});

/**
 * Edit an existing Azure configuration
 * @param {String} configIdentifier - The name or tenant ID to identify the config
 * @param {Object} newData - The updated configuration data
 */
Cypress.Commands.add('editAzureConfig', (configIdentifier, newData) => {
  cy.log(`Editing Azure configuration: ${configIdentifier}`);
  
  // Find the configuration row
  cy.contains('td', configIdentifier)
    .parents('tr')
    .within(() => {
      // Click the edit button
      cy.get('[aria-label="Edit configuration"]').click();
    });
  
  // Clear and update fields
  if (newData.name) {
    cy.get('input[name="name"]').clear().type(newData.name);
  }
  
  if (newData.description) {
    cy.get('textarea[name="description"]').clear().type(newData.description);
  }
  
  if (newData.clientId) {
    cy.get('input[name="clientId"]').clear().type(newData.clientId);
  }
  
  if (newData.clientSecret) {
    cy.get('input[name="clientSecret"]').clear().type(newData.clientSecret);
  }
  
  // Submit the form
  cy.contains('button', 'Update').click();
  
  // Verify success
  cy.contains('Azure configuration updated successfully').should('be.visible');
  
  // Verify updated configuration appears
  if (newData.name) {
    cy.contains(newData.name).should('be.visible');
  }
});

/**
 * Delete an Azure configuration
 * @param {String} configIdentifier - The name or tenant ID to identify the config
 */
Cypress.Commands.add('deleteAzureConfig', (configIdentifier) => {
  cy.log(`Deleting Azure configuration: ${configIdentifier}`);
  
  // Find the configuration row
  cy.contains('td', configIdentifier)
    .parents('tr')
    .within(() => {
      // Click the delete button
      cy.get('[aria-label="Delete configuration"]').click();
    });
  
  // Confirm deletion
  cy.contains('Confirm Delete').should('be.visible');
  cy.contains(`Are you sure you want to delete this Azure configuration?`).should('be.visible');
  cy.contains('button', 'Delete').click();
  
  // Verify success
  cy.contains('Azure configuration deleted successfully').should('be.visible');
  cy.contains('td', configIdentifier).should('not.exist');
});

/**
 * Select an Azure subscription from the dropdown
 * @param {String} subscriptionId - The subscription ID or name
 */
Cypress.Commands.add('selectAzureSubscription', (subscriptionId) => {
  cy.log(`Selecting Azure subscription: ${subscriptionId}`);
  
  // Click on the subscription dropdown
  cy.get('select[name="subscriptionId"]').click();
  
  // Select the subscription
  cy.get('select[name="subscriptionId"]').select(subscriptionId);
  
  // Verify selection
  cy.get('select[name="subscriptionId"]').should('have.value', subscriptionId);
});

/**
 * Select a resource group or create a new one
 * @param {String} resourceGroupName - The resource group name
 * @param {Boolean} createNew - Whether to create a new resource group
 * @param {String} location - The location for a new resource group
 */
Cypress.Commands.add('selectResourceGroup', (resourceGroupName, createNew = false, location = null) => {
  cy.log(`${createNew ? 'Creating' : 'Selecting'} resource group: ${resourceGroupName}`);
  
  if (createNew) {
    // Click create new resource group option
    cy.contains('label', 'Create new').click();
    
    // Fill in resource group name
    cy.get('input[name="newResourceGroupName"]').type(resourceGroupName);
    
    // Select location if provided
    if (location) {
      cy.get('select[name="location"]').select(location);
    }
    
    // Click create button
    cy.contains('button', 'Create Resource Group').click();
    
    // Verify success
    cy.contains(`Resource group ${resourceGroupName} created successfully`).should('be.visible');
  } else {
    // Click existing resource group option
    cy.contains('label', 'Use existing').click();
    
    // Select from dropdown
    cy.get('select[name="resourceGroupId"]').select(resourceGroupName);
    
    // Verify selection
    cy.get('select[name="resourceGroupId"]').should('have.value', resourceGroupName);
  }
});

/**
 * Discover Azure resources of specific types
 * @param {Array} resourceTypes - Array of resource types to discover
 */
Cypress.Commands.add('discoverAzureResources', (resourceTypes = []) => {
  cy.log(`Discovering Azure resources: ${resourceTypes.join(', ')}`);
  
  // Check resource type checkboxes
  resourceTypes.forEach(type => {
    cy.get(`input[type="checkbox"][value="${type}"]`).check();
  });
  
  // Click discover button
  cy.contains('button', 'Discover Resources').click();
  
  // Verify resources are loaded
  cy.contains('Resources discovered successfully').should('be.visible');
  cy.get('table.resource-table').should('be.visible');
  
  // Verify resource types are present
  resourceTypes.forEach(type => {
    cy.contains('td', type).should('exist');
  });
});

/**
 * Select specific Azure resources
 * @param {Array} resourceNames - Array of resource names to select
 */
Cypress.Commands.add('selectAzureResources', (resourceNames = []) => {
  cy.log(`Selecting Azure resources: ${resourceNames.join(', ')}`);
  
  // Select each resource
  resourceNames.forEach(name => {
    cy.contains('td', name)
      .parents('tr')
      .within(() => {
        cy.get('input[type="checkbox"]').check();
      });
  });
  
  // Verify correct number of resources selected
  cy.get('.selected-count').should('contain', resourceNames.length);
});

/**
 * Test the Azure connection
 * @param {Boolean} expectSuccess - Whether the connection test should succeed
 */
Cypress.Commands.add('testAzureConnection', (expectSuccess = true) => {
  cy.log('Testing Azure connection');
  
  // Click test connection button
  cy.contains('button', 'Test Connection').click();
  
  if (expectSuccess) {
    // Verify success
    cy.contains('Connection successful').should('be.visible');
  } else {
    // Verify failure
    cy.contains('Connection failed').should('be.visible');
  }
});

/**
 * Filter Azure resources by type
 * @param {String} resourceType - The resource type to filter by
 */
Cypress.Commands.add('filterResourcesByType', (resourceType) => {
  cy.log(`Filtering resources by type: ${resourceType}`);
  
  // Select the resource type from the filter dropdown
  cy.get('select[data-testid="resource-type-filter"]').select(resourceType);
  
  // Verify filter applied
  cy.get('select[data-testid="resource-type-filter"]').should('have.value', resourceType);
  
  // Verify only resources of that type are shown
  cy.get('table.resource-table tbody tr').each(($row) => {
    cy.wrap($row).contains('td', resourceType).should('be.visible');
  });
});

/**
 * Search for Azure resources
 * @param {String} searchTerm - The search term
 */
Cypress.Commands.add('searchAzureResources', (searchTerm) => {
  cy.log(`Searching for Azure resources with term: ${searchTerm}`);
  
  // Type in the search field
  cy.get('input[placeholder*="Search resources"]').type(searchTerm);
  
  // Verify search applied
  cy.get('input[placeholder*="Search resources"]').should('have.value', searchTerm);
});

/**
 * Check page for accessibility issues
 * @param {String} context - The context for logging
 */
Cypress.Commands.add('checkAzureA11y', (context = 'Azure configuration page') => {
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