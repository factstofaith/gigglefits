// ***********************************************************
// This support file is processed and loaded automatically before your component test files.
// 
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Import React component support
import { mount } from 'cypress/react18';
Cypress.Commands.add('mount', mount);

// Import accessibility testing support
import 'cypress-axe';

// Import image snapshot testing support if available
try {
  require('cypress-image-snapshot/command');
} catch (e) {
  console.log('Cypress-image-snapshot not installed, continuing without visual regression');
}

// Import code coverage support if enabled
if (Cypress.env('coverage')) {
  try {
    require('@cypress/code-coverage/support');
    console.log('Code coverage enabled for component tests');
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

// Global error handler
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log error to command log
  console.error('Uncaught exception:', err.message);
  
  // Return false to prevent tests from failing due to ResizeObserver errors
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  // Return false to prevent Cypress from failing the test for other errors
  return false;
});

// Configure Axe for all tests
beforeEach(() => {
  cy.injectAxe();
});

// Add custom command to check accessibility
Cypress.Commands.add('checkA11y', (context, options) => {
  const defaultContext = context || null;
  const defaultOptions = {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa'],
    },
    ...options,
  };
  
  return cy.axe(defaultContext, defaultOptions);
});

// Add custom component mount function with standard providers
Cypress.Commands.add('mountWithProviders', (component, options = {}) => {
  // Import necessary providers
  const { ThemeProvider } = require('@mui/material');
  const { BrowserRouter } = require('react-router-dom');
  const { theme } = require('../../src/theme');
  
  // Wrap component with providers
  const wrappedComponent = (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
  
  return cy.mount(wrappedComponent, options);
});