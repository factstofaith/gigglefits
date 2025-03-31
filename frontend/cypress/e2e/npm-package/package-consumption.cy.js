/**
 * Package Consumption Test
 * 
 * This test verifies that the built NPM package can be consumed 
 * correctly in different module systems.
 */

describe('NPM Package Consumption', () => {
  beforeEach(() => {
    // Setup test environment
    cy.visit('/npm-test.html');
  });

  it('should correctly load the package via CommonJS', () => {
    // Test CommonJS consumption
    cy.window().then((win) => {
      cy.exec('node cypress/test-modules/commonjs-consumer.js')
        .its('stdout')
        .should('contain', 'Button component loaded successfully')
        .should('contain', 'Card component loaded successfully');
    });
  });

  it('should correctly load the package via ESM', () => {
    // Test ESM consumption
    cy.window().then((win) => {
      cy.exec('node cypress/test-modules/esm-consumer.mjs')
        .its('stdout')
        .should('contain', 'Button component loaded successfully')
        .should('contain', 'Card component loaded successfully');
    });
  });

  it('should correctly load the package in browser environments', () => {
    // Test browser loading
    cy.window().then((win) => {
      // Interact with the button component loaded from our package
      cy.get('[data-testid="test-button"]')
        .should('exist')
        .should('have.text', 'Test Button')
        .click();
        
      // Verify the click was handled by our component
      cy.get('[data-testid="click-result"]')
        .should('exist')
        .should('have.text', 'Button clicked!');
    });
  });

  it('should load components with proper tree shaking', () => {
    // Test that tree shaking works
    cy.window().then((win) => {
      // Check if only the imported components are loaded
      cy.get('[data-testid="loaded-components"]')
        .should('exist')
        .should('contain', 'Button')
        .should('contain', 'Card')
        .should('not.contain', 'DataGrid'); // DataGrid wasn't imported
    });
  });

  it('should handle both default and named exports correctly', () => {
    // Test default and named exports
    cy.window().then((win) => {
      // Default export used for theme
      cy.get('[data-testid="theme-loaded"]')
        .should('exist')
        .should('have.text', 'Theme loaded: true');
        
      // Named export used for components
      cy.get('[data-testid="named-exports-loaded"]')
        .should('exist')
        .should('have.text', 'Named exports loaded: true');
    });
  });
});