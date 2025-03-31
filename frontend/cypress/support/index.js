// Import commands.js, cypress-axe, and custom command files
import './commands';
import 'cypress-axe';
import './html-entity-processor'; // Process HTML entities consistently with Jest

// Import component-specific command files
import './admin-commands';
import './integration-commands'; 
import './invitation-commands';
import './mfa-commands';
import './oauth-commands';
import './transformation-commands';
import './earnings-commands';
import './azure-commands';
import './tenant-commands';
import './template-commands';
import './documentation-commands';
import './chat-help-commands';

// Global setup
beforeEach(() => {
  // Set up common mocks, API interceptions, etc.
  cy.intercept('GET', '/api/app-config', {
    statusCode: 200,
    body: {
      version: '1.0.0',
      environment: 'test',
      features: {
        mfa: true,
        oauth: true,
        documentation: true,
        templates: true
      }
    }
  }).as('getAppConfig');
});

// Handle uncaught exceptions to prevent test failures
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false prevents Cypress from failing the test
  console.error('Uncaught exception:', err.message);
  return false;
});

// Custom task for logging
Cypress.Commands.add('log', (message) => {
  console.log(message);
  return null;
});

// Accessibility testing configuration
Cypress.Commands.add('injectAxe', () => {
  cy.window({ log: false }).then(window => {
    if (!window.axe) {
      cy.readFile('node_modules/axe-core/axe.min.js').then(source => {
        window.eval(source);
      });
    }
  });
});

// Add a custom task for logging
Cypress.on('task', {
  log(message) {
    console.log(message);
    return null;
  },
});