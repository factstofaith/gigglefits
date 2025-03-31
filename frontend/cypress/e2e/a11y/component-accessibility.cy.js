// cypress/e2e/a11y/component-accessibility.cy.js

/**
 * Component Accessibility Tests
 * 
 * Tests the accessibility of individual components in the TAP Integration Platform
 */
describe('Component Accessibility Tests', () => {
  let components;

  before(() => {
    // Load the component test data
    cy.fixture('accessibility/components.json').then((data) => {
      components = data;
    });
  });

  beforeEach(() => {
    cy.login('admin', 'password');
    cy.injectAxe();
  });

  describe('Common Components', () => {
    it('should test all common components for accessibility', () => {
      // Load home page to test most common components
      cy.visit('/');
      
      // Wait for page to fully load
      cy.get('[data-testid="main-navigation"]', { timeout: 10000 }).should('be.visible');
      
      // Test each common component
      components.commonComponents.forEach((component) => {
        if (component.requiresAction && component.actionSetup) {
          // Some components need special setup to be visible
          cy.log(`Setting up component: ${component.name}`);
          eval(component.actionSetup);
        }
        
        cy.log(`Testing component: ${component.name}`);
        cy.get(component.selector)
          .should('exist')
          .then($el => {
            if ($el.length > 0) {
              // Test the component for accessibility
              cy.testComponentA11y(component.selector, {
                checkContrast: component.checkContrast !== false,
                checkKeyboard: component.checkKeyboard !== false,
                checkScreenReader: true
              });
              
              // If the component needs focus trap testing
              if (component.checkFocusTrap) {
                cy.testFocusTrapping(component.selector);
              }
              
              // If the component has specific keyboard elements to test
              if (component.keyboardFocusElements && component.keyboardFocusElements.length > 0) {
                component.keyboardFocusElements.forEach((selector) => {
                  cy.get(selector).should('exist').focus().should('be.focused');
                });
              }
            } else {
              cy.log(`Component not found: ${component.name} (${component.selector})`);
            }
          });
      });
    });
  });

  describe('Integration Components', () => {
    it('should test integration-specific components for accessibility', () => {
      // Visit the integrations page
      cy.visit('/integrations');
      cy.get('[data-testid="integrations-page"]', { timeout: 10000 }).should('be.visible');
      
      // Test each integration component
      components.integrationComponents.forEach((component) => {
        if (component.requiresAction && component.actionSetup) {
          // Some components need special setup to be visible
          cy.log(`Setting up component: ${component.name}`);
          eval(component.actionSetup);
        }
        
        cy.log(`Testing component: ${component.name}`);
        cy.get(component.selector)
          .should('exist')
          .then($el => {
            if ($el.length > 0) {
              // Test the component for accessibility
              cy.testComponentA11y(component.selector, {
                checkContrast: component.checkContrast !== false,
                checkKeyboard: component.checkKeyboard !== false,
                checkScreenReader: true
              });
            } else {
              cy.log(`Component not found: ${component.name} (${component.selector})`);
            }
          });
      });
    });
  });

  describe('Admin Components', () => {
    it('should test admin-specific components for accessibility', () => {
      // Visit the admin dashboard
      cy.visit('/admin');
      cy.get('[data-testid="admin-dashboard"]', { timeout: 10000 }).should('be.visible');
      
      // Test each admin component
      components.adminComponents.forEach((component) => {
        if (component.requiresAction && component.actionSetup) {
          // Some components need special setup to be visible
          cy.log(`Setting up component: ${component.name}`);
          eval(component.actionSetup);
        }
        
        cy.log(`Testing component: ${component.name}`);
        cy.get(component.selector)
          .should('exist')
          .then($el => {
            if ($el.length > 0) {
              // Test the component for accessibility
              cy.testComponentA11y(component.selector, {
                checkContrast: component.checkContrast !== false,
                checkKeyboard: component.checkKeyboard !== false,
                checkScreenReader: true
              });
            } else {
              cy.log(`Component not found: ${component.name} (${component.selector})`);
            }
          });
      });
    });
  });

  describe('Forms and Inputs', () => {
    it('should test forms for accessibility and proper labeling', () => {
      // Test common forms
      cy.visit('/login');
      
      // Test login form
      cy.get('form').within(() => {
        // Check that all inputs have properly associated labels
        cy.get('input, select, textarea').each(($input) => {
          const id = $input.attr('id');
          if (id) {
            cy.get(`label[for="${id}"]`).should('exist');
          } else {
            // If no ID, check that the input has aria-label or aria-labelledby
            const hasAriaLabel = $input.attr('aria-label') !== undefined;
            const hasAriaLabelledBy = $input.attr('aria-labelledby') !== undefined;
            const isWrappedByLabel = $input.parents('label').length > 0;
            
            expect(hasAriaLabel || hasAriaLabelledBy || isWrappedByLabel, 
                   `Input should have accessible label: ${$input.attr('name')}`).to.be.true;
          }
        });
        
        // Check that required fields are properly marked
        cy.get('[required], [aria-required="true"]').each(($field) => {
          const id = $field.attr('id');
          if (id) {
            const label = cy.get(`label[for="${id}"]`);
            // Either the label should have an asterisk or there should be aria-describedby pointing to text about required fields
            label.should('contain', '*').or($field.should('have.attr', 'aria-describedby'));
          }
        });
        
        // Test form submission with errors
        cy.get('[type="submit"], button[type="submit"]').click();
        
        // Ensure error messages are properly associated with inputs
        cy.get('[aria-invalid="true"]').each(($field) => {
          const errorMessageId = $field.attr('aria-describedby');
          if (errorMessageId) {
            cy.get(`#${errorMessageId}`).should('exist');
          }
        });
      });
    });
  });

  describe('Interactive Elements', () => {
    it('should test interactive elements for keyboard accessibility', () => {
      cy.visit('/');
      
      // Test buttons
      cy.get('button:not([disabled]), [role="button"]:not([disabled])').each(($button, index) => {
        // Only test the first 10 to keep the test manageable
        if (index < 10) {
          cy.wrap($button).focus().should('be.focused');
          // Verify that Enter key works on buttons
          if (!$button.attr('type') || $button.attr('type') !== 'submit') {
            cy.wrap($button).type('{enter}', { force: true });
          }
        }
      });
      
      // Test links
      cy.get('a[href]:not([disabled])').each(($link, index) => {
        // Only test the first 10 to keep the test manageable
        if (index < 10) {
          cy.wrap($link).focus().should('be.focused');
        }
      });
    });
  });

  describe('Color Contrast', () => {
    it('should verify color contrast compliance throughout the app', () => {
      // Test main sections of the application
      const pagesToTest = [
        '/',
        '/integrations',
        '/admin',
        '/login'
      ];
      
      pagesToTest.forEach((page) => {
        cy.visit(page);
        // Wait for page to load
        cy.get('body', { timeout: 10000 }).should('be.visible');
        
        // Check color contrast for the whole page
        cy.checkColorContrast();
        
        // Test specific text elements
        const textSelectors = [
          'h1', 'h2', 'h3', 'p', 'a', 'button', 'label'
        ];
        
        textSelectors.forEach((selector) => {
          cy.get(selector).each(($el, index) => {
            // Only test first 3 of each type to keep tests manageable
            if (index < 3) {
              cy.log(`Testing contrast for ${selector} (${$el.text().substring(0, 20)})`);
              cy.wrap($el).then($wrapped => {
                cy.checkColorContrast($wrapped);
              });
            }
          });
        });
      });
    });
  });

  describe('Focus Management', () => {
    it('should verify focus is managed properly in modal dialogs', () => {
      // Test modal focus trapping
      cy.visit('/integrations');
      
      // Open a modal
      cy.contains('button', 'New Integration').click();
      
      // Test focus trapping in the modal
      cy.get('[role="dialog"]').should('be.visible');
      cy.testFocusTrapping('[role="dialog"]');
      
      // Close the modal
      cy.get('[aria-label="Close dialog"], [data-testid="close-modal"]').click();
      
      // Ensure focus returns to the triggering element
      cy.contains('button', 'New Integration').should('be.focused');
    });
  });
});