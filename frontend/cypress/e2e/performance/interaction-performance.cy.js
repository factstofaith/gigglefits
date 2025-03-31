// cypress/e2e/performance/interaction-performance.cy.js

/**
 * Interaction Performance Tests
 * 
 * Tests the performance of user interactions with the application
 */
describe('Interaction Performance Tests', () => {
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

  describe('Basic Interactions', () => {
    it('should measure button click performance', () => {
      cy.visit('/integrations');
      
      // Wait for page to load
      cy.get('[data-testid="integrations-page"]').should('be.visible');
      
      // Measure button click performance
      cy.measureInteraction(
        '[data-testid="create-integration-button"]',
        'click',
        'ButtonClick',
        {
          threshold: thresholds.interaction.ButtonClick,
          waitForSelector: '[role="dialog"]'
        }
      );
      
      // Close the modal
      cy.get('[aria-label="Close dialog"]').click();
    });

    it('should measure modal open/close performance', () => {
      cy.visit('/integrations');
      
      // Wait for page to load
      cy.get('[data-testid="integrations-page"]').should('be.visible');
      
      // Measure modal open performance
      cy.measureInteraction(
        '[data-testid="create-integration-button"]',
        'click',
        'ModalOpen',
        {
          threshold: thresholds.interaction.ModalOpen,
          waitForSelector: '[role="dialog"]'
        }
      );
      
      // Measure modal close performance
      cy.measureInteraction(
        '[aria-label="Close dialog"]',
        'click',
        'ModalClose',
        {
          threshold: thresholds.interaction.ModalClose,
          waitForSelector: 'body:not(:has([role="dialog"]))'
        }
      );
    });

    it('should measure dropdown performance', () => {
      cy.visit('/');
      
      // Check if there's a dropdown to test
      cy.get('body').then($body => {
        const hasDropdown = $body.find('[data-testid="dropdown"], select').length > 0;
        
        if (hasDropdown) {
          // Find the dropdown
          const selector = $body.find('[data-testid="dropdown"]').length > 0 
            ? '[data-testid="dropdown"]' 
            : 'select';
          
          // Measure dropdown open performance
          cy.measureInteraction(
            selector,
            'click',
            'DropdownOpen',
            {
              threshold: thresholds.interaction.DropdownOpen,
              waitForSelector: selector + '[aria-expanded="true"], select option'
            }
          );
        } else {
          cy.log('No dropdown found for testing');
        }
      });
    });

    it('should measure form submission performance', () => {
      // Visit login page to test form
      cy.window().then(win => {
        win.localStorage.removeItem('isLoggedIn');
        win.localStorage.removeItem('token');
      });
      
      cy.visit('/login');
      
      // Fill form fields
      cy.get('[data-testid="username"]').type('testuser');
      cy.get('[data-testid="password"]').type('password');
      
      // Measure form submission performance
      cy.measureInteraction(
        '[data-testid="submit-login"]',
        'click',
        'FormSubmit',
        {
          threshold: thresholds.interaction.FormSubmit,
          waitForSelector: '[data-testid="user-profile"]'
        }
      );
    });
  });

  describe('Integration Flow Interactions', () => {
    beforeEach(() => {
      // Visit the integration detail page
      cy.visit('/integrations/1');
      
      // Wait for page to load
      cy.get('[data-testid="integration-detail-page"]').should('be.visible');
    });

    it('should measure node dragging performance', () => {
      // Check if we can drag nodes
      cy.get('body').then($body => {
        const hasNodePalette = $body.find('[data-testid="node-palette"]').length > 0;
        
        if (hasNodePalette) {
          // Measure node drag performance
          cy.measureInteraction(
            '[data-testid="add-source-node"]',
            'click',
            'NodeDrag',
            {
              threshold: thresholds.interaction.NodeDrag,
              waitForSelector: '[data-testid="node-properties-panel"]'
            }
          );
        } else {
          cy.log('No node palette found for testing');
        }
      });
    });

    it('should measure node configuration performance', () => {
      // Find any existing node
      cy.get('[data-testid="node"]').first().then($node => {
        if ($node.length) {
          // Measure node configuration performance
          cy.measureInteraction(
            '[data-testid="node"]',
            'click',
            'NodeConfigure',
            {
              threshold: thresholds.interaction.NodeConfigure,
              waitForSelector: '[data-testid="node-properties-panel"]'
            }
          );
        } else {
          cy.log('No nodes found for testing');
        }
      });
    });
  });

  describe('Admin Dashboard Interactions', () => {
    beforeEach(() => {
      // Visit the admin dashboard
      cy.visit('/admin');
      
      // Wait for page to load
      cy.get('[data-testid="admin-dashboard"]').should('be.visible');
    });

    it('should measure tab switching performance', () => {
      // Find tabs if they exist
      cy.get('body').then($body => {
        const hasTabs = $body.find('[role="tab"]').length > 0;
        
        if (hasTabs) {
          // Get the second tab if it exists
          cy.get('[role="tab"]').eq(1).then($tab => {
            if ($tab.length) {
              // Measure tab switch performance
              cy.measureInteraction(
                '[role="tab"]',
                'click',
                'TabSwitch',
                {
                  threshold: thresholds.interaction.TabSwitch,
                  waitForSelector: '[role="tabpanel"]'
                }
              );
            } else {
              cy.log('Not enough tabs for testing');
            }
          });
        } else {
          cy.log('No tabs found for testing');
        }
      });
    });
  });

  describe('Interaction Performance Benchmark', () => {
    it('should benchmark key interactions for baseline performance', () => {
      // Define key interactions to benchmark
      const interactions = [
        { 
          name: 'ButtonClick', 
          url: '/integrations', 
          selector: '[data-testid="create-integration-button"]',
          action: 'click',
          waitForSelector: '[role="dialog"]',
          cleanup: () => cy.get('[aria-label="Close dialog"]').click()
        },
        { 
          name: 'ModalOpen', 
          url: '/integrations', 
          selector: '[data-testid="create-integration-button"]',
          action: 'click',
          waitForSelector: '[role="dialog"]',
          cleanup: () => cy.get('[aria-label="Close dialog"]').click()
        },
        { 
          name: 'FormInput', 
          url: '/login', 
          selector: '[data-testid="username"]',
          action: 'type',
          actionParams: ['testuser'],
          waitForSelector: null,
          cleanup: null
        }
      ];
      
      // Test each interaction
      interactions.forEach(interaction => {
        cy.visit(interaction.url);
        
        // Wait for page to load
        cy.wait(1000);
        
        // Measure interaction performance
        cy.measureInteraction(
          interaction.selector,
          interaction.action,
          interaction.name,
          {
            threshold: thresholds.interaction[interaction.name] || 200,
            actionParams: interaction.actionParams || [],
            waitForSelector: interaction.waitForSelector
          }
        );
        
        // Run cleanup if provided
        if (interaction.cleanup) {
          interaction.cleanup();
        }
      });
      
      // Generate performance report
      cy.generatePerformanceReport('Interaction Performance Benchmark');
    });
  });
});