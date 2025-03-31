// ***********************************************************
// This support file is processed and loaded automatically before your test files.
// 
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Import individual command files
import './admin-commands';
import './azure-commands';
import './chat-help-commands';
import './dataset-commands';
import './documentation-commands';
import './earnings-commands';
import './error-commands';
import './error-recovery-commands';
import './integration-commands';
import './invitation-commands';
import './mfa-commands';
import './oauth-commands';
import './security-commands';
import './storage-commands';
import './template-commands';
import './tenant-commands';
import './transformation-commands';
import './accessibility-commands';
import './visual-testing-commands';
import './performance-commands';

// Import accessibility testing support
import 'cypress-axe';

// Import Percy for visual testing
try {
  require('@percy/cypress');
} catch (e) {
  console.log('Percy not installed, continuing without Percy visual testing');
}

// Import code coverage support if enabled
if (Cypress.env('coverage')) {
  try {
    require('@cypress/code-coverage/support');
    console.log('Code coverage enabled for Cypress tests');
  } catch (e) {
    console.log('Code coverage plugin not installed, continuing without coverage');
  }
}

// Hide fetch/XHR requests from command log
const app = window.top;
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Log console errors during test execution
Cypress.on('window:console', (message) => {
  if (message.type === 'error') {
    cy.log(`Console error: ${message.message}`);
  }
});

// Global error handler
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log error to command log
  console.error('Uncaught exception:', err.message);
  
  // Return false to prevent tests from failing due to ResizeObserver errors
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  // Return false to prevent Cypress from failing the test for other errors
  // Comment this out if you want tests to fail on uncaught exceptions
  return false;
});

// Configure Axe for all tests
beforeEach(() => {
  cy.injectAxe();
});