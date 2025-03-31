// cypress/e2e/templates/e2e.template.cy.js

/**
 * Template for a Cypress E2E test suite
 * 
 * How to use this template:
 * 1. Copy this file to the appropriate location in cypress/e2e
 * 2. Rename the file to match your feature (e.g., login.cy.js)
 * 3. Replace "Feature Name" with your feature name
 * 4. Add your test cases
 * 5. Remove these instructions and other comments as needed
 */
describe('Feature Name', () => {
  beforeEach(() => {
    // Visit the starting page
    cy.visit('/');
    
    // Setup any required state (login, etc.)
    // cy.login('testuser', 'password');
  });

  // Basic navigation test
  it('navigates through main flow', () => {
    // Click on navigation item
    cy.contains('Feature').click();
    
    // Verify page changed
    cy.url().should('include', '/feature');
    cy.contains('h1', 'Feature Title').should('be.visible');
    
    // Interact with page elements
    cy.get('[data-testid="feature-button"]').click();
    
    // Verify expected results
    cy.get('[data-testid="feature-result"]').should('contain', 'Success');
  });

  // Form submission test
  it('submits a form correctly', () => {
    // Navigate to form
    cy.contains('New Item').click();
    
    // Fill out form
    cy.get('[data-testid="name-input"]').type('Test Name');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="type-select"]').select('Option 1');
    
    // Submit form
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify successful submission
    cy.contains('Item created successfully').should('be.visible');
    cy.url().should('include', '/items/');
  });

  // Error handling test
  it('displays appropriate error messages', () => {
    // Navigate to form
    cy.contains('New Item').click();
    
    // Submit form without required fields
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify error messages
    cy.get('[data-testid="name-input"]').should('have.attr', 'aria-invalid', 'true');
    cy.contains('Name is required').should('be.visible');
    
    // Fill out form with invalid data
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify validation error
    cy.contains('Please enter a valid email').should('be.visible');
  });

  // Authentication test
  it('handles authentication correctly', () => {
    // Assuming we're not logged in
    cy.clearCookies();
    cy.visit('/protected-page');
    
    // Verify redirect to login
    cy.url().should('include', '/login');
    
    // Log in
    cy.get('[data-testid="username-input"]').type('testuser');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Verify redirect to protected page
    cy.url().should('include', '/protected-page');
    cy.contains('Protected Content').should('be.visible');
  });

  // Mobile viewport test
  it('displays correctly on mobile viewport', () => {
    // Set viewport to mobile size
    cy.viewport('iphone-x');
    
    // Verify mobile navigation is available
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible').click();
    
    // Verify menu items
    cy.get('[data-testid="mobile-menu"]').within(() => {
      cy.contains('Home').should('be.visible');
      cy.contains('Feature').should('be.visible');
    });
    
    // Navigate using mobile menu
    cy.contains('Feature').click();
    
    // Verify page layout adapts to mobile
    cy.get('[data-testid="feature-content"]').should('have.css', 'flex-direction', 'column');
  });
});