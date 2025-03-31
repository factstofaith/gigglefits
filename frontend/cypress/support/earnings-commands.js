// earnings-commands.js
// -----------------------------------------------------------------------------
// Custom Cypress commands for testing the Earnings Management functionality

/**
 * Navigate to the earnings page
 * Assumes user is already logged in
 */
Cypress.Commands.add('navigateToEarnings', () => {
  cy.log('Navigating to Earnings Management page');
  cy.get('a[href*="/earnings"]').click();
  cy.url().should('include', '/earnings');
  cy.contains('h1', 'Earnings Management').should('be.visible');
  cy.contains('Employee Rosters').should('be.visible');
});

/**
 * Create a new employee roster with the provided data
 * @param {Object} rosterData - The roster data (name, source_id, destination_id, description)
 */
Cypress.Commands.add('createEmployeeRoster', (rosterData) => {
  cy.log(`Creating employee roster: ${rosterData.name}`);
  
  // Navigate to earnings page if not already there
  cy.url().then((url) => {
    if (!url.includes('/earnings')) {
      cy.navigateToEarnings();
    }
  });
  
  // Click create roster button
  cy.contains('button', 'Create Roster').click();
  
  // Fill in the form
  cy.get('input[name="name"]').type(rosterData.name);
  
  if (rosterData.source_id) {
    cy.get('input[name="source_id"]').type(rosterData.source_id);
  }
  
  if (rosterData.destination_id) {
    cy.get('input[name="destination_id"]').type(rosterData.destination_id);
  }
  
  if (rosterData.description) {
    cy.get('textarea[name="description"]').type(rosterData.description);
  }
  
  // Submit the form
  cy.contains('button', 'Create').click();
  
  // Verify success
  cy.contains('Employee roster created successfully').should('be.visible');
  cy.contains(rosterData.name).should('be.visible');
});

/**
 * Edit an existing employee roster
 * @param {String} currentName - The current roster name to find the roster
 * @param {Object} newData - The new roster data
 */
Cypress.Commands.add('editEmployeeRoster', (currentName, newData) => {
  cy.log(`Editing employee roster: ${currentName}`);
  
  // Find the roster row
  cy.contains('td', currentName)
    .parents('tr')
    .within(() => {
      // Click the edit button
      cy.get('[aria-label="Edit roster"]').click();
    });
  
  // Clear and update fields
  if (newData.name) {
    cy.get('input[name="name"]').clear().type(newData.name);
  }
  
  if (newData.source_id) {
    cy.get('input[name="source_id"]').clear().type(newData.source_id);
  }
  
  if (newData.destination_id) {
    cy.get('input[name="destination_id"]').clear().type(newData.destination_id);
  }
  
  if (newData.description) {
    cy.get('textarea[name="description"]').clear().type(newData.description);
  }
  
  // Submit the form
  cy.contains('button', 'Update').click();
  
  // Verify success
  cy.contains('Employee roster updated successfully').should('be.visible');
  
  if (newData.name) {
    cy.contains(newData.name).should('be.visible');
  }
});

/**
 * Delete an employee roster
 * @param {String} rosterName - The name of the roster to delete
 */
Cypress.Commands.add('deleteEmployeeRoster', (rosterName) => {
  cy.log(`Deleting employee roster: ${rosterName}`);
  
  // Find the roster row
  cy.contains('td', rosterName)
    .parents('tr')
    .within(() => {
      // Click the delete button
      cy.get('[aria-label="Delete roster"]').click();
    });
  
  // Confirm deletion
  cy.contains('Confirm Delete').should('be.visible');
  cy.contains(`Are you sure you want to delete the roster "${rosterName}"?`).should('be.visible');
  cy.contains('button', 'Delete').click();
  
  // Verify success
  cy.contains('Employee roster deleted successfully').should('be.visible');
  cy.contains('td', rosterName).should('not.exist');
});

/**
 * Navigate to roster employees
 * @param {String} rosterName - The name of the roster
 */
Cypress.Commands.add('navigateToRosterEmployees', (rosterName) => {
  cy.log(`Navigating to employees for roster: ${rosterName}`);
  
  // Find the roster row
  cy.contains('td', rosterName)
    .parents('tr')
    .within(() => {
      // Click the employees button
      cy.get('[aria-label="Manage employees"]').click();
    });
  
  // Verify navigation
  cy.url().should('include', '/employees');
  cy.contains(`Managing employees for roster`).should('be.visible');
});

/**
 * Navigate to roster earnings mappings
 * @param {String} rosterName - The name of the roster
 */
Cypress.Commands.add('navigateToRosterMappings', (rosterName) => {
  cy.log(`Navigating to mappings for roster: ${rosterName}`);
  
  // Find the roster row
  cy.contains('td', rosterName)
    .parents('tr')
    .within(() => {
      // Click the mappings button
      cy.get('[aria-label="View earnings mappings"]').click();
    });
  
  // Verify navigation
  cy.url().should('include', '/mappings');
  cy.contains(`Editing earnings mappings for roster`).should('be.visible');
});

/**
 * Sync a roster
 * @param {String} rosterName - The name of the roster to sync
 */
Cypress.Commands.add('syncRoster', (rosterName) => {
  cy.log(`Syncing roster: ${rosterName}`);
  
  // Find the roster row
  cy.contains('td', rosterName)
    .parents('tr')
    .within(() => {
      // Click the sync button
      cy.get('[aria-label="Sync roster"]').click();
    });
  
  // Verify success
  cy.contains('Roster sync started successfully').should('be.visible');
});

/**
 * Create a new employee in the current roster
 * @param {Object} employeeData - The employee data
 */
Cypress.Commands.add('createEmployee', (employeeData) => {
  cy.log(`Creating employee: ${employeeData.first_name} ${employeeData.last_name}`);
  
  // Click create employee button
  cy.contains('button', 'Add Employee').click();
  
  // Fill in the form
  cy.get('input[name="employee_id"]').type(employeeData.employee_id);
  cy.get('input[name="first_name"]').type(employeeData.first_name);
  cy.get('input[name="last_name"]').type(employeeData.last_name);
  
  if (employeeData.email) {
    cy.get('input[name="email"]').type(employeeData.email);
  }
  
  if (employeeData.department) {
    cy.get('input[name="department"]').type(employeeData.department);
  }
  
  if (employeeData.position) {
    cy.get('input[name="position"]').type(employeeData.position);
  }
  
  // Submit the form
  cy.contains('button', 'Create').click();
  
  // Verify success
  cy.contains('Employee created successfully').should('be.visible');
  cy.contains(`${employeeData.first_name} ${employeeData.last_name}`).should('be.visible');
});

/**
 * Navigate to the earnings codes tab
 */
Cypress.Commands.add('navigateToEarningsCodes', () => {
  cy.log('Navigating to Earnings Codes tab');
  
  // Click on Earnings Codes tab
  cy.contains('Earnings Codes').click();
  
  // Verify navigation
  cy.url().should('include', '/earnings/codes');
  cy.contains('Configure and manage earnings codes').should('be.visible');
});

/**
 * Create a new earnings code
 * @param {Object} codeData - The earnings code data
 */
Cypress.Commands.add('createEarningsCode', (codeData) => {
  cy.log(`Creating earnings code: ${codeData.code}`);
  
  // Click create earnings code button
  cy.contains('button', 'Create Code').click();
  
  // Fill in the form
  cy.get('input[name="code"]').type(codeData.code);
  cy.get('input[name="description"]').type(codeData.description);
  
  if (codeData.source_system) {
    cy.get('input[name="source_system"]').type(codeData.source_system);
  }
  
  if (codeData.destination_system) {
    cy.get('input[name="destination_system"]').type(codeData.destination_system);
  }
  
  if (codeData.category) {
    cy.get('select[name="category"]').select(codeData.category);
  }
  
  // Submit the form
  cy.contains('button', 'Create').click();
  
  // Verify success
  cy.contains('Earnings code created successfully').should('be.visible');
  cy.contains(codeData.code).should('be.visible');
});

/**
 * Create an earnings mapping
 * @param {Object} mappingData - The mapping data
 */
Cypress.Commands.add('createEarningsMapping', (mappingData) => {
  cy.log(`Creating earnings mapping from ${mappingData.source_code} to ${mappingData.destination_code}`);
  
  // Click create mapping button
  cy.contains('button', 'Add Mapping').click();
  
  // Fill in the form
  cy.get('select[name="source_code"]').select(mappingData.source_code);
  cy.get('select[name="destination_code"]').select(mappingData.destination_code);
  
  if (mappingData.multiplier) {
    cy.get('input[name="multiplier"]').type(mappingData.multiplier);
  }
  
  if (mappingData.conditions) {
    cy.get('textarea[name="conditions"]').type(mappingData.conditions);
  }
  
  // Submit the form
  cy.contains('button', 'Create').click();
  
  // Verify success
  cy.contains('Mapping created successfully').should('be.visible');
  cy.contains(`${mappingData.source_code} → ${mappingData.destination_code}`).should('be.visible');
});

/**
 * Filter earnings codes by system
 * @param {String} system - The system to filter by
 */
Cypress.Commands.add('filterEarningsCodesBySystem', (system) => {
  cy.log(`Filtering earnings codes by system: ${system}`);
  
  // Select the system from the filter dropdown
  cy.get('select[data-testid="system-filter"]').select(system);
  
  // Verify filter applied
  cy.get('select[data-testid="system-filter"]').should('have.value', system);
});

/**
 * Search for employees
 * @param {String} searchTerm - The search term
 */
Cypress.Commands.add('searchEmployees', (searchTerm) => {
  cy.log(`Searching for employees with term: ${searchTerm}`);
  
  // Type in the search field
  cy.get('input[placeholder*="Search employees"]').type(searchTerm);
  
  // Verify search applied
  cy.get('input[placeholder*="Search employees"]').should('have.value', searchTerm);
});

/**
 * Check page for accessibility issues
 * @param {String} context - The context for logging
 */
Cypress.Commands.add('checkA11y', (context = 'page') => {
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