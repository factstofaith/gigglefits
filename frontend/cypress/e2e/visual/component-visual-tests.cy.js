// cypress/e2e/visual/component-visual-tests.cy.js

/**
 * Visual Regression Tests for UI Components
 * 
 * Tests the visual appearance of UI components to ensure visual consistency
 */
describe('Component Visual Regression Tests', () => {
  let components;

  before(() => {
    // Load the component test data
    cy.fixture('visual/components.json').then((data) => {
      components = data;
    });
  });

  beforeEach(() => {
    cy.login('admin', 'password');
  });

  describe('Common Components', () => {
    beforeEach(() => {
      // Visit the design system page where all components are showcased
      cy.visit('/');
    });

    it('should test visual appearance of all common components', () => {
      // Test each common component
      components.commonComponents.forEach((component) => {
        cy.log(`Testing component: ${component.name}`);
        
        // If the component needs setup
        if (component.setup) {
          eval(component.setup);
        }
        
        // Test the component
        cy.get('body').then($body => {
          // Skip if component not found
          if ($body.find(component.selector).length === 0) {
            cy.log(`Component not found: ${component.name} (${component.selector})`);
            return;
          }
          
          // Perform visual test with component options
          cy.visualTestComponent(
            component.selector, 
            component.name, 
            {
              testHover: component.testHover !== false,
              testFocus: component.testFocus !== false,
              testActive: component.testActive !== false,
              testResponsive: component.testResponsive !== false
            }
          );
          
          // If the component has specific states to test
          if (component.states && component.states.length > 0) {
            cy.visualDiffComponent(component.name, component.selector, {
              testStates: component.states,
              actions: component.actions || {}
            });
          }
        });
      });
    });

    it('should test buttons in different states', () => {
      // Test primary button
      cy.get('[data-testid="button-primary"]').then($button => {
        if ($button.length) {
          // Default state
          cy.visualSnapshot('Primary Button - Default');
          
          // Hover state
          cy.get('[data-testid="button-primary"]').trigger('mouseover');
          cy.wait(300); // Wait for hover effect
          cy.visualSnapshot('Primary Button - Hover');
          
          // Focus state
          cy.get('[data-testid="button-primary"]').focus();
          cy.wait(300); // Wait for focus effect
          cy.visualSnapshot('Primary Button - Focus');
          
          // Active state
          cy.get('[data-testid="button-primary"]').trigger('mousedown');
          cy.wait(300); // Wait for active effect
          cy.visualSnapshot('Primary Button - Active');
          cy.get('[data-testid="button-primary"]').trigger('mouseup');
        }
      });
    });

    it('should test form elements in different states', () => {
      // Test input field
      cy.get('input[type="text"]').first().then($input => {
        if ($input.length) {
          // Default state
          cy.visualSnapshot('Input Field - Default');
          
          // Focus state
          cy.get('input[type="text"]').first().focus();
          cy.wait(300); // Wait for focus effect
          cy.visualSnapshot('Input Field - Focus');
          
          // Filled state
          cy.get('input[type="text"]').first().type('Test Value');
          cy.wait(300); // Wait for typing
          cy.visualSnapshot('Input Field - Filled');
          
          // Error state - need to trigger validation
          cy.get('input[type="text"]').first().clear();
          cy.get('button[type="submit"]').first().click();
          cy.wait(300); // Wait for error state
          cy.visualSnapshot('Input Field - Error');
        }
      });
    });
  });

  describe('Integration Components', () => {
    it('should test visual appearance of integration components', () => {
      // Test each integration component
      components.integrationComponents.forEach((component) => {
        cy.log(`Testing component: ${component.name}`);
        
        // Setup is required for integration components
        if (component.setup) {
          eval(component.setup);
        } else {
          cy.visit('/integrations/1');
        }
        
        // Test the component
        cy.get('body').then($body => {
          // Skip if component not found
          if ($body.find(component.selector).length === 0) {
            cy.log(`Component not found: ${component.name} (${component.selector})`);
            return;
          }
          
          // Perform visual test with component options
          cy.visualTestComponent(
            component.selector, 
            component.name, 
            {
              testHover: component.testHover !== false,
              testFocus: component.testFocus !== false,
              testActive: component.testActive !== false,
              testResponsive: component.testResponsive !== false
            }
          );
        });
      });
    });

    it('should test flow canvas with nodes', () => {
      cy.visit('/integrations/1');
      
      // Wait for canvas to load
      cy.get('[data-testid="flow-canvas"]').should('be.visible');
      cy.wait(1000); // Wait for all canvas elements to render
      
      // Take snapshot of flow canvas
      cy.visualSnapshot('Flow Canvas - Default View');
      
      // Add a node to the canvas (if not already present)
      cy.get('body').then($body => {
        if ($body.find('[data-testid="node"]').length === 0) {
          cy.get('[data-testid="add-source-node"]').click();
          cy.wait(500); // Wait for node to appear
        }
      });
      
      // Take snapshot with node
      cy.visualSnapshot('Flow Canvas - With Node');
      
      // Select a node to show node properties panel
      cy.get('[data-testid="node"]').first().click();
      cy.get('[data-testid="node-properties-panel"]').should('be.visible');
      
      // Take snapshot with node properties panel
      cy.visualSnapshot('Flow Canvas - With Node Properties Panel');
    });
  });

  describe('Theme Testing', () => {
    it('should test components in both light and dark theme if available', () => {
      cy.visit('/settings');
      
      // Check if theme toggle exists
      cy.get('body').then($body => {
        const hasThemeToggle = $body.find('[data-testid="theme-toggle"]').length > 0;
        
        if (hasThemeToggle) {
          // Test a few key components
          const componentsToTest = [
            { name: 'Card', selector: '[data-testid="card"]' },
            { name: 'Button', selector: '[data-testid="button-primary"]' },
            { name: 'DataTable', selector: '[data-testid="data-table"]' }
          ];
          
          // Test each component in both themes
          componentsToTest.forEach(component => {
            cy.visualThemeTest(component.name, component.selector);
          });
        } else {
          cy.log('Theme toggle not found, skipping theme tests');
        }
      });
    });
  });
});