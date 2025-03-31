// tenant-commands.js
// -----------------------------------------------------------------------------
// Custom Cypress commands for testing the Tenant Management functionality

/**
 * Navigate to the tenant management page
 * Assumes user is already logged in as admin
 */
Cypress.Commands.add('navigateToTenantManagement', () => {
  cy.log('Navigating to Tenant Management page');
  
  // Navigate to admin dashboard first
  cy.get('a[href*="/admin"]').click();
  cy.url().should('include', '/admin');
  
  // Click on Tenant Management in the sidebar
  cy.contains('Tenants').click();
  cy.url().should('include', '/admin/tenants');
  
  // Verify page loaded correctly
  cy.contains('h1', 'Tenant Management').should('be.visible');
});

/**
 * Create a new tenant with the provided data
 * @param {Object} tenantData - The tenant data 
 */
Cypress.Commands.add('createTenant', (tenantData) => {
  cy.log(`Creating tenant: ${tenantData.name}`);
  
  // Navigate to tenant management page if not already there
  cy.url().then((url) => {
    if (!url.includes('/admin/tenants')) {
      cy.navigateToTenantManagement();
    }
  });
  
  // Click create tenant button
  cy.contains('button', 'Create Tenant').click();
  
  // Fill in the form
  cy.get('input[name="name"]').type(tenantData.name);
  
  if (tenantData.identifier) {
    cy.get('input[name="identifier"]').type(tenantData.identifier);
  }
  
  if (tenantData.primaryDomain) {
    cy.get('input[name="primaryDomain"]').type(tenantData.primaryDomain);
  }
  
  if (tenantData.industry) {
    cy.get('select[name="industry"]').select(tenantData.industry);
  }
  
  if (tenantData.tier) {
    cy.get('select[name="tier"]').select(tenantData.tier);
  }
  
  if (tenantData.status) {
    cy.get('select[name="status"]').select(tenantData.status);
  }
  
  if (tenantData.description) {
    cy.get('textarea[name="description"]').type(tenantData.description);
  }
  
  // Submit the form
  cy.contains('button', 'Create').click();
  
  // Verify success
  cy.contains('Tenant created successfully').should('be.visible');
  cy.contains(tenantData.name).should('be.visible');
});

/**
 * Edit an existing tenant
 * @param {String} tenantIdentifier - The name or ID to identify the tenant
 * @param {Object} newData - The updated tenant data
 */
Cypress.Commands.add('editTenant', (tenantIdentifier, newData) => {
  cy.log(`Editing tenant: ${tenantIdentifier}`);
  
  // Find the tenant row
  cy.contains('td', tenantIdentifier)
    .parents('tr')
    .within(() => {
      // Click the edit button
      cy.get('[aria-label="Edit tenant"]').click();
    });
  
  // Clear and update fields
  if (newData.name) {
    cy.get('input[name="name"]').clear().type(newData.name);
  }
  
  if (newData.identifier) {
    cy.get('input[name="identifier"]').clear().type(newData.identifier);
  }
  
  if (newData.primaryDomain) {
    cy.get('input[name="primaryDomain"]').clear().type(newData.primaryDomain);
  }
  
  if (newData.industry) {
    cy.get('select[name="industry"]').select(newData.industry);
  }
  
  if (newData.tier) {
    cy.get('select[name="tier"]').select(newData.tier);
  }
  
  if (newData.status) {
    cy.get('select[name="status"]').select(newData.status);
  }
  
  if (newData.description) {
    cy.get('textarea[name="description"]').clear().type(newData.description);
  }
  
  // Submit the form
  cy.contains('button', 'Update').click();
  
  // Verify success
  cy.contains('Tenant updated successfully').should('be.visible');
  
  // Verify updated tenant appears
  if (newData.name) {
    cy.contains(newData.name).should('be.visible');
  }
});

/**
 * Delete a tenant
 * @param {String} tenantIdentifier - The name or ID to identify the tenant
 */
Cypress.Commands.add('deleteTenant', (tenantIdentifier) => {
  cy.log(`Deleting tenant: ${tenantIdentifier}`);
  
  // Find the tenant row
  cy.contains('td', tenantIdentifier)
    .parents('tr')
    .within(() => {
      // Click the delete button
      cy.get('[aria-label="Delete tenant"]').click();
    });
  
  // Confirm deletion
  cy.contains('Confirm Delete').should('be.visible');
  cy.contains(`Are you sure you want to delete this tenant?`).should('be.visible');
  cy.contains('button', 'Delete').click();
  
  // Verify success
  cy.contains('Tenant deleted successfully').should('be.visible');
  cy.contains('td', tenantIdentifier).should('not.exist');
});

/**
 * Change tenant status
 * @param {String} tenantIdentifier - The name or ID to identify the tenant
 * @param {String} newStatus - The new status (Active, Inactive, Suspended)
 */
Cypress.Commands.add('changeTenantStatus', (tenantIdentifier, newStatus) => {
  cy.log(`Changing tenant status for ${tenantIdentifier} to ${newStatus}`);
  
  // Find the tenant row
  cy.contains('td', tenantIdentifier)
    .parents('tr')
    .within(() => {
      // Click the status dropdown
      cy.get('[aria-label="Change status"]').click();
    });
  
  // Select the new status from the dropdown menu
  cy.get('.status-dropdown-menu')
    .contains(newStatus)
    .click();
  
  // Confirm status change
  cy.contains('Confirm Status Change').should('be.visible');
  cy.contains(`Are you sure you want to change the status to ${newStatus}?`).should('be.visible');
  cy.contains('button', 'Confirm').click();
  
  // Verify success
  cy.contains('Status updated successfully').should('be.visible');
  
  // Verify status tag shows new status
  cy.contains('td', tenantIdentifier)
    .parents('tr')
    .contains(newStatus)
    .should('be.visible');
});

/**
 * Navigate to tenant detail page
 * @param {String} tenantIdentifier - The name or ID to identify the tenant
 */
Cypress.Commands.add('navigateToTenantDetail', (tenantIdentifier) => {
  cy.log(`Navigating to details for tenant: ${tenantIdentifier}`);
  
  // Find the tenant row
  cy.contains('td', tenantIdentifier)
    .parents('tr')
    .within(() => {
      // Click the details button
      cy.get('[aria-label="View tenant details"]').click();
    });
  
  // Verify navigation
  cy.url().should('include', '/admin/tenants/');
  cy.contains('Tenant Details').should('be.visible');
  cy.contains(tenantIdentifier).should('be.visible');
});

/**
 * Select a tenant from the tenant switcher dropdown
 * @param {String} tenantName - The name of the tenant to select
 */
Cypress.Commands.add('selectTenant', (tenantName) => {
  cy.log(`Selecting tenant: ${tenantName}`);
  
  // Open tenant switcher dropdown
  cy.get('[aria-label="Switch tenant"]').click();
  
  // Click on the tenant name
  cy.get('.tenant-switcher-dropdown')
    .contains(tenantName)
    .click();
  
  // Verify tenant selection
  cy.get('[aria-label="Current tenant"]').should('contain', tenantName);
  
  // Wait for tenant context to update
  cy.waitUntil(() => cy.window()
    .then(win => {
      // Check if the tenant context has updated
      return win.tenantContext && win.tenantContext.currentTenant && win.tenantContext.currentTenant.name === tenantName;
    })
  );
});

/**
 * Navigate to tenant users page
 * @param {String} tenantIdentifier - The name or ID to identify the tenant
 */
Cypress.Commands.add('navigateToTenantUsers', (tenantIdentifier) => {
  cy.log(`Navigating to users for tenant: ${tenantIdentifier}`);
  
  // Navigate to tenant detail first
  cy.navigateToTenantDetail(tenantIdentifier);
  
  // Click on Users tab
  cy.contains('button', 'Users').click();
  
  // Verify correct tab is active
  cy.contains('h2', 'Tenant Users').should('be.visible');
});

/**
 * Associate a user with a tenant
 * @param {String} tenantIdentifier - The tenant name or ID
 * @param {Object} userData - User data including email and role
 */
Cypress.Commands.add('associateUserWithTenant', (tenantIdentifier, userData) => {
  cy.log(`Associating user ${userData.email} with tenant ${tenantIdentifier}`);
  
  // Navigate to tenant users
  cy.navigateToTenantUsers(tenantIdentifier);
  
  // Click add user button
  cy.contains('button', 'Add User').click();
  
  // Fill in the form
  cy.get('input[name="email"]').type(userData.email);
  
  if (userData.role) {
    cy.get('select[name="role"]').select(userData.role);
  }
  
  // Submit the form
  cy.contains('button', 'Add').click();
  
  // Verify success
  cy.contains('User added to tenant successfully').should('be.visible');
  cy.contains(userData.email).should('be.visible');
});

/**
 * Navigate to tenant resources page
 * @param {String} tenantIdentifier - The name or ID to identify the tenant
 */
Cypress.Commands.add('navigateToTenantResources', (tenantIdentifier) => {
  cy.log(`Navigating to resources for tenant: ${tenantIdentifier}`);
  
  // Navigate to tenant detail first
  cy.navigateToTenantDetail(tenantIdentifier);
  
  // Click on Resources tab
  cy.contains('button', 'Resources').click();
  
  // Verify correct tab is active
  cy.contains('h2', 'Tenant Resources').should('be.visible');
});

/**
 * Associate a resource with a tenant
 * @param {String} tenantIdentifier - The tenant name or ID
 * @param {Object} resourceData - Resource data including type and name
 */
Cypress.Commands.add('associateResourceWithTenant', (tenantIdentifier, resourceData) => {
  cy.log(`Associating resource ${resourceData.name} with tenant ${tenantIdentifier}`);
  
  // Navigate to tenant resources
  cy.navigateToTenantResources(tenantIdentifier);
  
  // Click add resource button
  cy.contains('button', 'Add Resource').click();
  
  // Fill in the form
  if (resourceData.type) {
    cy.get('select[name="resourceType"]').select(resourceData.type);
  }
  
  // Wait for resources to load based on type
  cy.wait('@getResourcesByType');
  
  // Select the resource
  cy.get('select[name="resourceId"]').select(resourceData.name);
  
  // Submit the form
  cy.contains('button', 'Add').click();
  
  // Verify success
  cy.contains('Resource associated successfully').should('be.visible');
  cy.contains(resourceData.name).should('be.visible');
});

/**
 * Filter tenants by status
 * @param {String} status - The status to filter by
 */
Cypress.Commands.add('filterTenantsByStatus', (status) => {
  cy.log(`Filtering tenants by status: ${status}`);
  
  // Select the status from the filter dropdown
  cy.get('select[data-testid="tenant-status-filter"]').select(status);
  
  // Verify filter applied
  cy.get('select[data-testid="tenant-status-filter"]').should('have.value', status);
});

/**
 * Search for tenants
 * @param {String} searchTerm - The search term
 */
Cypress.Commands.add('searchTenants', (searchTerm) => {
  cy.log(`Searching for tenants with term: ${searchTerm}`);
  
  // Type in the search field
  cy.get('input[placeholder*="Search tenants"]').type(searchTerm);
  
  // Verify search applied
  cy.get('input[placeholder*="Search tenants"]').should('have.value', searchTerm);
});

/**
 * Check page for accessibility issues
 * @param {String} context - The context for logging
 */
Cypress.Commands.add('checkTenantA11y', (context = 'tenant management page') => {
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