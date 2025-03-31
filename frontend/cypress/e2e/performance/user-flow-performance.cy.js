// cypress/e2e/performance/user-flow-performance.cy.js

/**
 * User Flow Performance Tests
 * 
 * Tests the performance of complete user flows in the application
 */
describe('User Flow Performance Tests', () => {
  let thresholds;

  before(() => {
    // Load performance thresholds
    cy.fixture('performance/thresholds.json').then((data) => {
      thresholds = data;
    });
  });

  describe('Authentication Flows', () => {
    it('should measure login flow performance', () => {
      // Clear any existing login state
      cy.window().then(win => {
        win.localStorage.removeItem('isLoggedIn');
        win.localStorage.removeItem('token');
      });
      
      // Define login flow
      const loginFlow = () => {
        return cy.visit('/login')
          .then(() => {
            cy.get('[data-testid="username"]').type('testuser');
            cy.get('[data-testid="password"]').type('password');
            cy.get('[data-testid="submit-login"]').click();
            
            // Wait for successful login
            return cy.get('[data-testid="user-profile"]', { timeout: 10000 }).should('be.visible');
          });
      };
      
      // Measure user flow performance
      cy.measureUserFlow(
        loginFlow,
        'Login',
        {
          threshold: thresholds.userFlow.Login
        }
      );
    });
  });

  describe('Integration Management Flows', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should measure integration creation flow performance', () => {
      // Define integration creation flow
      const createIntegrationFlow = () => {
        return cy.visit('/integrations')
          .then(() => {
            // Wait for page to load
            cy.get('[data-testid="integrations-page"]').should('be.visible');
            
            // Create new integration
            cy.get('[data-testid="create-integration-button"]').click();
            
            // Wait for modal to open
            cy.get('[role="dialog"]').should('be.visible');
            
            // Fill integration details
            cy.get('[data-testid="integration-name"]').type('Performance Test Integration');
            cy.get('[data-testid="integration-description"]').type('Testing integration creation performance');
            
            // Submit form
            cy.get('[data-testid="submit-button"]').click();
            
            // Wait for integration detail page
            return cy.get('[data-testid="integration-detail-page"]', { timeout: 10000 }).should('be.visible');
          });
      };
      
      // Measure user flow performance
      cy.measureUserFlow(
        createIntegrationFlow,
        'CreateIntegration',
        {
          threshold: thresholds.userFlow.CreateIntegration
        }
      );
    });

    it('should measure node configuration flow performance', () => {
      // Define node configuration flow
      const configureNodeFlow = () => {
        return cy.visit('/integrations/1')
          .then(() => {
            // Wait for page to load
            cy.get('[data-testid="integration-detail-page"]').should('be.visible');
            
            // Add a new node if none exists
            cy.get('body').then($body => {
              if ($body.find('[data-testid="node"]').length === 0) {
                cy.get('[data-testid="add-source-node"]').click();
              } else {
                cy.get('[data-testid="node"]').first().click();
              }
            });
            
            // Wait for node properties panel
            cy.get('[data-testid="node-properties-panel"]').should('be.visible');
            
            // Configure the node (will depend on node type)
            cy.get('[data-testid="node-properties-panel"] input').first().clear().type('Performance Test Node');
            
            // Save configuration
            return cy.get('[data-testid="save-button"]').click();
          });
      };
      
      // Measure user flow performance
      cy.measureUserFlow(
        configureNodeFlow,
        'ConfigureNode',
        {
          threshold: thresholds.userFlow.ConfigureNode
        }
      );
    });
  });

  describe('Data Management Flows', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should measure dataset creation flow performance', () => {
      // Define dataset creation flow, assuming we have a datasets page
      const createDatasetFlow = () => {
        return cy.visit('/datasets')
          .then(() => {
            // Wait for page to load
            cy.get('body').then($body => {
              if ($body.find('[data-testid="datasets-page"]').length > 0) {
                cy.get('[data-testid="datasets-page"]').should('be.visible');
                
                // Create new dataset
                cy.get('[data-testid="create-dataset-button"]').click();
                
                // Wait for modal or form
                cy.get('form, [role="dialog"]').should('be.visible');
                
                // Fill dataset details
                cy.get('[data-testid="dataset-name"]').type('Performance Test Dataset');
                cy.get('[data-testid="dataset-description"]').type('Testing dataset creation performance');
                
                // Submit form
                cy.get('[data-testid="submit-button"]').click();
                
                // Wait for dataset detail page
                return cy.get('[data-testid="dataset-detail"]', { timeout: 10000 }).should('be.visible');
              } else {
                cy.log('Dataset page not found, skipping test');
                return cy.wrap(null);
              }
            });
          });
      };
      
      // Measure user flow performance
      cy.visit('/').then(() => {
        cy.get('body').then($body => {
          // Only run test if datasets page is available
          if ($body.find('[href="/datasets"]').length > 0) {
            cy.measureUserFlow(
              createDatasetFlow,
              'CreateDataset',
              {
                threshold: thresholds.userFlow.CreateDataset
              }
            );
          } else {
            cy.log('Datasets feature not available, skipping test');
          }
        });
      });
    });
  });

  describe('Combined User Flows', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should measure end-to-end integration creation and configuration flow', () => {
      // Define complete flow
      const completeIntegrationFlow = () => {
        return cy.visit('/integrations')
          .then(() => {
            // Create new integration
            cy.get('[data-testid="create-integration-button"]').click();
            cy.get('[data-testid="integration-name"]').type('E2E Performance Test');
            cy.get('[data-testid="integration-description"]').type('Testing complete flow performance');
            cy.get('[data-testid="submit-button"]').click();
            
            // Wait for integration detail page
            cy.get('[data-testid="integration-detail-page"]').should('be.visible');
            
            // Add a source node
            cy.get('[data-testid="add-source-node"]').click();
            cy.get('[data-testid="node-properties-panel"]').should('be.visible');
            
            // Configure source node
            cy.get('[data-testid="node-properties-panel"] input').first().clear().type('Source Node');
            cy.get('[data-testid="save-button"]').click();
            
            // Add a transformation node
            cy.get('[data-testid="add-transform-node"]').click();
            cy.get('[data-testid="node-properties-panel"]').should('be.visible');
            
            // Configure transformation node
            cy.get('[data-testid="node-properties-panel"] input').first().clear().type('Transform Node');
            cy.get('[data-testid="save-button"]').click();
            
            // Connect nodes
            cy.get('[data-testid="connect-nodes"]').click();
            
            // Save integration
            return cy.get('[data-testid="save-integration"]').click();
          });
      };
      
      // Check if this flow is possible
      cy.visit('/integrations').then(() => {
        cy.get('body').then($body => {
          const hasCreateButton = $body.find('[data-testid="create-integration-button"]').length > 0;
          
          if (hasCreateButton) {
            // Measure user flow performance
            cy.measureUserFlow(
              completeIntegrationFlow,
              'CompleteIntegrationFlow',
              {
                threshold: 10000 // Higher threshold for complex flow
              }
            );
          } else {
            cy.log('Integration creation flow not available, skipping test');
          }
        });
      });
    });
  });

  describe('User Flow Performance Benchmark', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should benchmark key user flows for baseline performance', () => {
      // Generate performance report from previous tests
      cy.generatePerformanceReport('User Flow Performance Benchmark');
    });
  });
});