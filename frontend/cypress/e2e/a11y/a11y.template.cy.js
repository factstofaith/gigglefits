// cypress/e2e/a11y/a11y.template.cy.js

/**
 * Template for Cypress accessibility tests
 * 
 * How to use this template:
 * 1. Copy this file to the appropriate location in cypress/e2e/a11y
 * 2. Rename the file to match your feature (e.g., homepage-a11y.cy.js)
 * 3. Replace "Page/Feature" with your page or feature name
 * 4. Add your test cases for specific pages or components
 * 5. Remove these instructions and other comments as needed
 */
describe('Page/Feature Accessibility', () => {
  beforeEach(() => {
    // Visit the page to test
    cy.visit('/');
    
    // Inject axe-core runtime
    cy.injectAxe();
    
    // Setup any required state (login, etc.)
    // cy.login('testuser', 'password');
  });

  // Test entire page
  it('has no detectable accessibility violations on load', () => {
    // Test the page with default configuration
    cy.checkA11y();
  });

  // Test specific element
  it('has no accessibility violations in navigation menu', () => {
    // Test only the navigation element
    cy.get('[data-testid="main-navigation"]')
      .checkA11y();
  });

  // Test with custom configuration
  it('passes accessibility checks with custom config', () => {
    // Test with custom axe configuration
    cy.checkA11y(null, {
      rules: {
        // Only check rules with specified tags
        includedTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        // Disable specific rules
        'color-contrast': { enabled: false },
      },
    });
  });

  // Test after interaction
  it('maintains accessibility after user interaction', () => {
    // Interact with the page
    cy.get('[data-testid="expand-button"]').click();
    
    // Check accessibility of expanded content
    cy.get('[data-testid="expanded-content"]')
      .should('be.visible')
      .checkA11y();
  });

  // Test different viewport
  it('is accessible on mobile viewport', () => {
    // Set viewport to mobile size
    cy.viewport('iphone-x');
    
    // Check a11y on mobile layout
    cy.checkA11y();
    
    // Open mobile menu
    cy.get('[data-testid="mobile-menu-button"]').click();
    
    // Check a11y of mobile menu
    cy.get('[data-testid="mobile-menu"]')
      .should('be.visible')
      .checkA11y();
  });

  // Test form accessibility
  it('has accessible forms', () => {
    // Navigate to form
    cy.contains('Contact Us').click();
    
    // Check form accessibility
    cy.get('form').checkA11y();
    
    // Fill out form with errors
    cy.get('[data-testid="submit-button"]').click();
    
    // Check accessibility of form with error states
    cy.get('form').checkA11y();
  });

  // Test modal accessibility
  it('has accessible modal dialogs', () => {
    // Open modal
    cy.get('[data-testid="open-modal"]').click();
    
    // Check modal accessibility
    cy.get('[role="dialog"]')
      .should('be.visible')
      .checkA11y();
    
    // Verify focus is trapped in modal
    cy.focused().should('have.attr', 'data-testid', 'modal-close-button');
    cy.realPress('Tab');
    cy.focused().should('be.visible').and('be.within', cy.get('[role="dialog"]'));
    
    // Close modal
    cy.get('[data-testid="modal-close-button"]').click();
    
    // Verify modal is closed
    cy.get('[role="dialog"]').should('not.exist');
  });
});