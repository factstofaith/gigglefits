// ***********************************************
// Custom Cypress commands for TAP Integration Platform
// ***********************************************

/**
 * Enhanced accessibility testing command
 * Provides detailed reporting of accessibility violations
 */
Cypress.Commands.add('checkA11y', (context, options) => {
  cy.injectAxe();
  
  const reportViolations = (violations) => {
    const violationData = violations.map(
      ({ id, impact, description, nodes }) => ({
        id,
        impact,
        description,
        nodes: nodes.length
      })
    );

    // Print the violations to the command log
    if (violations.length > 0) {
      cy.log(`${violations.length} accessibility violation(s) detected`);
      
      // Create a more readable format for the violations
      violations.forEach(violation => {
        cy.log(`
          Rule: ${violation.id}
          Impact: ${violation.impact}
          Description: ${violation.description}
          Elements: ${violation.nodes.length}
        `);
      });
    }
  };

  // Call the standard checkA11y with our custom reporting
  return cy.axe(context, options).then(reportViolations);
});

/**
 * Login command for tests that require authentication
 * Uses data-testid selectors for more reliable targeting
 */
Cypress.Commands.add('login', (username = 'testuser', password = 'password') => {
  // Check if we're already logged in to avoid unnecessary logins
  cy.window().then(win => {
    const isLoggedIn = win.localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      cy.log('Already logged in, skipping login process');
      return;
    }
    
    // Mock the authentication API
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-token',
        user: {
          id: '123',
          username: username,
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin'
        }
      }
    }).as('loginRequest');
    
    cy.visit('/');
    cy.get('[data-testid="login-button"]').click();
    
    // If there's a dropdown for tenants, select the first one
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="tenant-select"]').length > 0) {
        cy.get('[data-testid="tenant-select"]').click();
        cy.get('[data-testid="tenant-option"]').first().click();
      }
    });
    
    cy.get('[data-testid="username"]').type(username);
    cy.get('[data-testid="password"]').type(password);
    cy.get('[data-testid="submit-login"]').click();
    
    // Wait for login API request to complete
    cy.wait('@loginRequest');
    
    // Wait for login to complete and verify user is logged in
    cy.get('[data-testid="user-profile"]', { timeout: 10000 }).should('be.visible');
    
    // Set a flag in localStorage to avoid logging in again
    cy.window().then(win => {
      win.localStorage.setItem('isLoggedIn', 'true');
    });
  });
});

/**
 * Custom command to take a Percy snapshot with better naming
 */
Cypress.Commands.add('takeSnapshot', (name) => {
  // Generate a unique name including device info
  const viewportWidth = Cypress.config('viewportWidth');
  const viewportHeight = Cypress.config('viewportHeight');
  const deviceInfo = `${viewportWidth}x${viewportHeight}`;
  const snapshotName = `${name} - ${deviceInfo}`;
  
  // Take the snapshot
  cy.percySnapshot(snapshotName);
});

/**
 * Custom command to test component rendering, accessibility and visual appearance
 */
Cypress.Commands.add('testComponent', (selector) => {
  // Check that the component renders
  cy.get(selector).should('be.visible');
  
  // Take a snapshot for visual testing
  cy.takeSnapshot(`Component - ${selector}`);
  
  // Check accessibility
  cy.get(selector).checkA11y();
});

/**
 * Custom command to test form submission
 */
Cypress.Commands.add('testForm', (formSelector, formData = {}) => {
  // Get the form
  cy.get(formSelector).within(() => {
    // Fill out each field
    Object.entries(formData).forEach(([field, value]) => {
      const selector = `[name="${field}"], [data-testid="${field}"]`;
      
      // Check if element exists
      cy.get('body').then($body => {
        if ($body.find(selector).length > 0) {
          // Handle different input types
          cy.get(selector).then($el => {
            const tagName = $el.prop('tagName').toLowerCase();
            const type = $el.attr('type');
            
            if (tagName === 'select') {
              cy.get(selector).select(value);
            } else if (type === 'checkbox') {
              if (value) {
                cy.get(selector).check();
              } else {
                cy.get(selector).uncheck();
              }
            } else if (type === 'radio') {
              cy.get(selector).check(value);
            } else if (tagName === 'textarea') {
              cy.get(selector).clear().type(value);
            } else {
              cy.get(selector).clear().type(value);
            }
          });
        } else {
          cy.log(`Field not found: ${field}`);
        }
      });
    });
    
    // Submit the form
    cy.get('button[type="submit"], [data-testid="submit-button"]').click();
  });
});

/**
 * Custom command to wait for API requests to complete
 */
Cypress.Commands.add('waitForApi', (method, url) => {
  cy.intercept(method, url).as('apiRequest');
  cy.wait('@apiRequest');
});

/**
 * Command to create test data via API
 */
Cypress.Commands.add('createTestData', (endpoint, data) => {
  cy.request('POST', endpoint, data);
});

/**
 * Command to clean up test data after tests
 */
Cypress.Commands.add('cleanupTestData', (endpoint, id) => {
  cy.request('DELETE', `${endpoint}/${id}`);
});

/**
 * Command to open notification center
 */
Cypress.Commands.add('openNotificationCenter', () => {
  cy.get('[data-testid="notification-button"]').click();
  cy.get('[data-testid="notification-center"]').should('be.visible');
});

/**
 * Command to simulate keyboard navigation
 */
Cypress.Commands.add('tabTo', (selector) => {
  // Start from the beginning of the page
  cy.focused().blur();
  cy.get('body').focus();
  
  // Keep pressing tab until we reach the desired element or time out
  const tryTab = () => {
    cy.focused().then($el => {
      if ($el.is(selector)) {
        // We've reached the element
        return;
      }
      
      cy.focused().type('{tab}', { force: true });
      
      // Recursively try again
      tryTab();
    });
  };
  
  tryTab();
});

/**
 * Command to test toast notifications
 */
Cypress.Commands.add('showToast', (message, type = 'info', title) => {
  cy.window().then(win => {
    win.showToast = (msg, typ, ttl) => {
      win.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: msg, type: typ, title: ttl } 
      }));
    };
    win.showToast(message, type, title);
  });
  
  // Return the toast element
  return cy.get('[data-testid="toast"]').contains(message);
});