// cypress/e2e/performance/component-performance.cy.js

/**
 * Component Performance Tests
 * 
 * Tests the rendering performance of key components in the application
 */
describe('Component Performance Tests', () => {
  let thresholds;

  before(() => {
    // Load performance thresholds
    cy.fixture('performance/thresholds.json').then((data) => {
      thresholds = data;
    });
  });

  beforeEach(() => {
    cy.login('admin', 'password');
  });

  describe('Common Components', () => {
    beforeEach(() => {
      // Visit a page where we can test common components
      cy.visit('/');
    });

    it('should measure data table rendering performance', () => {
      // Navigate to a page with data table
      cy.visit('/integrations');
      
      // Wait for the table to load
      cy.get('[data-testid="data-table"]').should('be.visible');
      
      // Measure component render performance
      cy.measureComponentRender(
        '[data-testid="data-table"]',
        'DataTable',
        {
          threshold: thresholds.componentRender.DataTable,
          iterations: 3
        }
      );
    });

    it('should measure modal rendering performance', () => {
      // Navigate to a page where we can open a modal
      cy.visit('/integrations');
      
      // Open a modal
      cy.contains('button', 'New Integration').click();
      
      // Wait for the modal to open
      cy.get('[role="dialog"]').should('be.visible');
      
      // Measure component render performance
      cy.measureComponentRender(
        '[role="dialog"]',
        'Modal',
        {
          threshold: thresholds.componentRender.Modal,
          iterations: 3
        }
      );
      
      // Close the modal
      cy.get('[aria-label="Close dialog"]').click();
    });

    it('should measure form field rendering performance', () => {
      // Navigate to a page with form fields
      cy.visit('/login');
      
      // Wait for form to load
      cy.get('form').should('be.visible');
      
      // Measure component render performance
      cy.measureComponentRender(
        'input[type="text"]',
        'InputField',
        {
          threshold: thresholds.componentRender.InputField,
          iterations: 3
        }
      );
    });

    it('should measure button rendering performance', () => {
      // Check for primary button
      cy.get('button.primary, [data-testid="button-primary"]').then($button => {
        if ($button.length) {
          // Measure component render performance
          cy.measureComponentRender(
            'button.primary, [data-testid="button-primary"]',
            'Button',
            {
              threshold: thresholds.componentRender.Button,
              iterations: 3
            }
          );
        } else {
          cy.log('Primary button not found for testing');
        }
      });
    });
  });

  describe('Integration Components', () => {
    beforeEach(() => {
      // Visit the integration detail page
      cy.visit('/integrations/1');
      
      // Wait for page to load
      cy.get('[data-testid="integration-detail-page"]').should('be.visible');
    });

    it('should measure flow canvas rendering performance', () => {
      // Wait for flow canvas to load
      cy.get('[data-testid="flow-canvas"]').should('be.visible');
      
      // Measure component render performance
      cy.measureComponentRender(
        '[data-testid="flow-canvas"]',
        'FlowCanvas',
        {
          threshold: thresholds.componentRender.FlowCanvas,
          iterations: 3
        }
      );
    });

    it('should measure node palette rendering performance', () => {
      // Check if node palette exists
      cy.get('[data-testid="node-palette"]').then($palette => {
        if ($palette.length) {
          // Measure component render performance
          cy.measureComponentRender(
            '[data-testid="node-palette"]',
            'NodePalette',
            {
              threshold: thresholds.componentRender.NodePalette,
              iterations: 3
            }
          );
        } else {
          cy.log('Node palette not found for testing');
        }
      });
    });

    it('should measure node properties panel rendering performance', () => {
      // Click a node to open properties panel
      cy.get('[data-testid="node"]').first().click();
      
      // Wait for properties panel to appear
      cy.get('[data-testid="node-properties-panel"]').should('be.visible');
      
      // Measure component render performance
      cy.measureComponentRender(
        '[data-testid="node-properties-panel"]',
        'NodePropertiesPanel',
        {
          threshold: thresholds.componentRender.NodePropertiesPanel,
          iterations: 3
        }
      );
    });

    it('should measure validation panel rendering performance', () => {
      // Check if validation panel exists
      cy.get('[data-testid="validation-panel"]').then($panel => {
        if ($panel.length) {
          // Measure component render performance
          cy.measureComponentRender(
            '[data-testid="validation-panel"]',
            'ValidationPanel',
            {
              threshold: thresholds.componentRender.ValidationPanel,
              iterations: 3
            }
          );
        } else {
          cy.log('Validation panel not found for testing');
        }
      });
    });
  });

  describe('Admin Components', () => {
    beforeEach(() => {
      // Visit the admin dashboard
      cy.visit('/admin');
      
      // Wait for page to load
      cy.get('[data-testid="admin-dashboard"]').should('be.visible');
    });

    it('should measure dashboard card rendering performance', () => {
      // Check for dashboard cards
      cy.get('[data-testid="dashboard-card"]').then($cards => {
        if ($cards.length) {
          // Measure component render performance
          cy.measureComponentRender(
            '[data-testid="dashboard-card"]',
            'Card',
            {
              threshold: thresholds.componentRender.Card,
              iterations: 3
            }
          );
        } else {
          cy.log('Dashboard cards not found for testing');
        }
      });
    });
  });

  describe('Component Rendering Benchmark', () => {
    it('should benchmark key components for baseline performance', () => {
      // Define key components to benchmark
      const components = [
        { 
          name: 'DataTable', 
          url: '/integrations', 
          selector: '[data-testid="data-table"]',
          setup: null
        },
        { 
          name: 'FlowCanvas', 
          url: '/integrations/1', 
          selector: '[data-testid="flow-canvas"]',
          setup: null
        },
        { 
          name: 'Modal', 
          url: '/integrations', 
          selector: '[role="dialog"]',
          setup: () => cy.contains('button', 'New Integration').click()
        },
        { 
          name: 'Button', 
          url: '/', 
          selector: 'button.primary, [data-testid="button-primary"]',
          setup: null
        }
      ];
      
      // Test each component
      components.forEach(component => {
        cy.visit(component.url);
        
        // Run setup if provided
        if (component.setup) {
          component.setup();
        }
        
        // Wait for component to be visible
        cy.get(component.selector).should('be.visible');
        
        // Measure component render performance
        cy.measureComponentRender(
          component.selector,
          component.name,
          {
            threshold: thresholds.componentRender[component.name] || 200,
            iterations: 3
          }
        );
      });
      
      // Generate performance report
      cy.generatePerformanceReport('Component Rendering Performance Benchmark');
    });
  });
});