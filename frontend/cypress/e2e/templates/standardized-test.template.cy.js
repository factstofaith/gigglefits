// cypress/e2e/templates/standardized-test.template.cy.js
/**
 * Standardized Template for TAP Integration Platform E2E Tests
 * 
 * This template follows the established best practices for E2E testing:
 * - Consistent structure with setup/teardown
 * - Clear organization of test cases
 * - Built-in accessibility testing
 * - Support for different user roles and viewports
 * 
 * How to use:
 * 1. Copy this file to the appropriate directory (flows/, features/, etc.)
 * 2. Rename to match your feature (e.g., user-management.cy.js)
 * 3. Replace placeholders with actual test implementations
 * 4. Remove any sections that don't apply to your feature
 */

// Define test constants at the top
const TEST_USER = {
  username: 'testuser',
  password: 'password123',
  role: 'admin'
};

const TEST_DATA = {
  // Add test data specific to this feature
};

// Define the viewport sizes to test
const VIEWPORTS = {
  desktop: [1280, 720],
  tablet: [768, 1024],
  mobile: [375, 667]
};

describe('Feature Name', () => {
  /**
   * Shared setup for all tests in this suite
   */
  beforeEach(() => {
    // Reset state between tests
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Mock APIs as needed
    cy.intercept('GET', '/api/feature-data', { fixture: 'feature-data.json' }).as('getFeatureData');
    
    // Login as appropriate user role
    cy.login(TEST_USER.username, TEST_USER.password);
    
    // Navigate to feature page
    cy.visit('/feature-path');
    cy.url().should('include', '/feature-path');
    cy.contains('Feature Title').should('be.visible');
  });
  
  /**
   * Clean up after tests if needed
   */
  afterEach(() => {
    // Optional: Clean up any test data created
    cy.cleanupTestData('/api/feature-data', TEST_DATA.id);
  });
  
  /**
   * Section 1: Core Functionality - Happy Path
   * These tests verify that the primary use cases work as expected
   */
  describe('Core Functionality', () => {
    it('completes the primary workflow successfully', () => {
      // Arrange: Set up any specific conditions or data
      
      // Act: Perform the primary action
      cy.get('[data-testid="primary-action-button"]').click();
      
      // Assert: Verify the expected outcome
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="result-container"]').should('contain', 'Expected Result');
    });
    
    it('loads data correctly', () => {
      // Verify data loading and display
      cy.wait('@getFeatureData');
      cy.get('[data-testid="data-table"]').should('be.visible');
      cy.get('[data-testid="data-row"]').should('have.length.at.least', 1);
    });
    
    it('saves changes correctly', () => {
      // Verify save functionality
      cy.intercept('POST', '/api/feature-data', {
        statusCode: 200,
        body: { success: true, id: '123' }
      }).as('saveData');
      
      // Fill form or make changes
      cy.testForm('[data-testid="feature-form"]', {
        name: 'Test Name',
        description: 'Test Description'
      });
      
      // Verify save was successful
      cy.wait('@saveData');
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });
  });
  
  /**
   * Section 2: Error Handling & Edge Cases
   * These tests verify that the feature handles errors and edge cases gracefully
   */
  describe('Error Handling & Edge Cases', () => {
    it('handles validation errors', () => {
      // Submit with invalid data
      cy.get('[data-testid="primary-action-button"]').click();
      
      // Verify validation errors
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[aria-invalid="true"]').should('exist');
    });
    
    it('handles server errors gracefully', () => {
      // Mock server error
      cy.intercept('POST', '/api/feature-data', {
        statusCode: 500,
        body: { message: 'Internal Server Error' }
      }).as('serverError');
      
      // Perform action that triggers API call
      cy.testForm('[data-testid="feature-form"]', { name: 'Test' });
      cy.get('[data-testid="submit-button"]').click();
      
      // Verify error handling
      cy.wait('@serverError');
      cy.get('[data-testid="error-toast"]').should('be.visible');
      cy.get('[data-testid="error-details"]').should('contain', 'Please try again');
    });
    
    it('handles empty state correctly', () => {
      // Mock empty data response
      cy.intercept('GET', '/api/feature-data', { body: [] }).as('emptyData');
      cy.reload();
      
      // Verify empty state
      cy.wait('@emptyData');
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="create-new-button"]').should('be.visible');
    });
  });
  
  /**
   * Section 3: Permissions & Role-Based Access
   * These tests verify that features are accessible based on user roles
   */
  describe('Permissions & Access Control', () => {
    it('shows admin-only features for admin users', () => {
      // Already logged in as admin from beforeEach
      
      // Verify admin features are visible
      cy.get('[data-testid="admin-feature"]').should('be.visible');
    });
    
    it('hides admin features for non-admin users', () => {
      // Log out and login as non-admin
      cy.clearCookies();
      cy.login('regularuser', 'password123');
      cy.visit('/feature-path');
      
      // Verify admin features are not visible
      cy.get('[data-testid="admin-feature"]').should('not.exist');
    });
  });
  
  /**
   * Section 4: Accessibility Testing
   * These tests verify that the feature meets accessibility requirements
   */
  describe('Accessibility', () => {
    it('has no accessibility violations', () => {
      // Run accessibility check on the page
      cy.checkA11y();
    });
    
    it('is navigable via keyboard', () => {
      // Test keyboard navigation
      cy.get('body').focus();
      cy.tabTo('[data-testid="primary-action-button"]');
      cy.focused().should('have.attr', 'data-testid', 'primary-action-button');
      cy.focused().type('{enter}');
      
      // Verify action was triggered
      cy.get('[data-testid="action-result"]').should('be.visible');
    });
  });
  
  /**
   * Section 5: Responsive Design Testing
   * These tests verify that the feature works on different screen sizes
   */
  describe('Responsive Design', () => {
    Object.entries(VIEWPORTS).forEach(([device, [width, height]]) => {
      it(`displays correctly on ${device}`, () => {
        // Set viewport size
        cy.viewport(width, height);
        cy.reload();
        
        // Verify appropriate layout
        if (device === 'mobile') {
          // Mobile-specific checks
          cy.get('[data-testid="mobile-menu"]').should('be.visible');
          cy.get('[data-testid="desktop-menu"]').should('not.be.visible');
        } else {
          // Desktop-specific checks
          cy.get('[data-testid="desktop-menu"]').should('be.visible');
          cy.get('[data-testid="mobile-menu"]').should('not.exist');
        }
        
        // Take screenshot for visual reference
        cy.takeSnapshot(`Feature on ${device}`);
      });
    });
  });
});