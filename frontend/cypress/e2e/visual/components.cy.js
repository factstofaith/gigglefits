/// <reference types="cypress" />
/// <reference types="@percy/cypress" />

/**
 * Visual regression tests for common components
 * 
 * These tests capture screenshots of components in different states
 * for visual regression testing with Percy.
 */
describe('Visual Regression Tests', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
  });
  
  it('should match visual snapshot of button variants', () => {
    // Visit the component demo page
    cy.visit('/component-demo');
    
    // Wait for components to load
    cy.get('[data-testid="button-demo-section"]').should('be.visible');
    
    // Take Percy snapshot
    cy.percySnapshot('Button Variants');
  });
  
  it('should match visual snapshot of card component', () => {
    cy.visit('/component-demo');
    
    // Wait for components to load
    cy.get('[data-testid="card-demo-section"]').should('be.visible');
    
    // Take Percy snapshot
    cy.percySnapshot('Card Component');
  });
  
  it('should match visual snapshot of toast notifications', () => {
    cy.visit('/component-demo');
    
    // Trigger various toast notifications
    cy.get('[data-testid="show-info-toast"]').click();
    cy.get('[data-testid="show-success-toast"]').click();
    cy.get('[data-testid="show-warning-toast"]').click();
    cy.get('[data-testid="show-error-toast"]').click();
    
    // Wait for all toasts to be visible
    cy.get('[data-testid="toast"]').should('have.length', 4);
    
    // Take Percy snapshot
    cy.percySnapshot('Toast Notifications');
  });
  
  it('should match visual snapshot of form components', () => {
    cy.visit('/component-demo');
    
    // Wait for form section to load
    cy.get('[data-testid="form-demo-section"]').should('be.visible');
    
    // Interact with form elements to show different states
    cy.get('[data-testid="text-input"]').type('Example text');
    cy.get('[data-testid="select-input"]').select('Option 2');
    cy.get('[data-testid="checkbox-input"]').check();
    
    // Take Percy snapshot
    cy.percySnapshot('Form Components');
  });
  
  it('should match visual snapshot of error states', () => {
    cy.visit('/component-demo');
    
    // Trigger error states
    cy.get('[data-testid="trigger-form-errors"]').click();
    
    // Wait for error states to appear
    cy.get('[data-testid="error-text-input"]').should('be.visible');
    cy.get('[data-testid="error-select-input"]').should('be.visible');
    
    // Take Percy snapshot
    cy.percySnapshot('Form Error States');
  });
  
  it('should match visual snapshot of notification center', () => {
    // Mock notifications
    cy.intercept('GET', '/api/notifications', {
      statusCode: 200,
      body: [
        {
          id: '1',
          title: 'Integration Completed',
          message: 'Your data integration has completed successfully.',
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false
        },
        {
          id: '2',
          title: 'Update Available',
          message: 'A new version of the platform is available.',
          type: 'info',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true
        },
        {
          id: '3',
          title: 'Warning: Low Disk Space',
          message: 'Your storage is running low. Please free up space.',
          type: 'warning',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        }
      ]
    });
    
    cy.visit('/');
    
    // Open notification center
    cy.get('[data-testid="notification-button"]').click();
    cy.get('[data-testid="notification-center"]').should('be.visible');
    
    // Take Percy snapshot
    cy.percySnapshot('Notification Center');
  });
  
  it('should match visual snapshot in dark mode', () => {
    cy.visit('/component-demo');
    
    // Switch to dark mode
    cy.get('[data-testid="theme-toggle"]').click();
    
    // Wait for theme change to apply
    cy.get('body').should('have.class', 'dark-theme');
    
    // Take Percy snapshot
    cy.percySnapshot('Dark Mode Components');
  });
  
  it('should match visual snapshot at different viewport sizes', () => {
    cy.visit('/component-demo');
    
    // Wait for page to load
    cy.get('[data-testid="responsive-demo-section"]').should('be.visible');
    
    // Take snapshots at different viewport sizes
    cy.viewport('iphone-6');
    cy.percySnapshot('Responsive Components - Mobile');
    
    cy.viewport('ipad-2');
    cy.percySnapshot('Responsive Components - Tablet');
    
    cy.viewport('macbook-13');
    cy.percySnapshot('Responsive Components - Desktop');
  });
  
  it('should match visual snapshot of integration flow canvas', () => {
    // Visit the integration flow builder
    cy.visit('/integrations/new');
    
    // Wait for canvas to load
    cy.get('[data-testid="flow-canvas"]').should('be.visible');
    
    // Add some nodes to the canvas
    cy.get('[data-testid="source-node-button"]').click();
    cy.get('[data-testid="flow-canvas"]').click(200, 200);
    
    cy.get('[data-testid="transform-node-button"]').click();
    cy.get('[data-testid="flow-canvas"]').click(400, 200);
    
    cy.get('[data-testid="destination-node-button"]').click();
    cy.get('[data-testid="flow-canvas"]').click(600, 200);
    
    // Connect the nodes
    cy.get('[data-testid="connect-nodes-button"]').click();
    cy.get('[data-testid="node-1-output"]').click();
    cy.get('[data-testid="node-2-input"]').click();
    
    cy.get('[data-testid="connect-nodes-button"]').click();
    cy.get('[data-testid="node-2-output"]').click();
    cy.get('[data-testid="node-3-input"]').click();
    
    // Take Percy snapshot
    cy.percySnapshot('Integration Flow Canvas');
  });
});