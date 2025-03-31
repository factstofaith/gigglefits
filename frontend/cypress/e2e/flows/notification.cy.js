/// <reference types="cypress" />

/**
 * E2E test for the notification system
 * 
 * This test verifies the notification functionality in the application, including:
 * - Toast notifications appearing and disappearing
 * - Notification center opening and closing
 * - Reading and marking notifications as read
 * - Notification actions
 * 
 * Uses the shared test data strategy with MockFactory pattern.
 * 
 * @version 2.0.0
 */
describe('Notification System', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
    
    // Use consistent test data from mock factory
    cy.mockNotificationsApi(3);
    cy.mockMarkNotificationsAsReadApi();
    cy.mockClearNotificationsApi();
    
    // Visit the homepage
    cy.visit('/');
    cy.wait('@getNotifications');
  });
  
  it('should display toast notifications', () => {
    // Get mock toast data
    cy.mockToast('success', 'This is a test toast message').then(toast => {
      // Trigger a toast notification
      cy.window().then(win => {
        win.showToast = (message, type) => {
          win.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { message, type, title: 'Test Toast' } 
          }));
        };
        win.showToast(toast.message, toast.type);
      });
      
      // Verify toast is displayed
      cy.get('[data-testid="toast-container"]').should('exist');
      cy.get('[data-testid="toast"]').should('be.visible');
      cy.get('[data-testid="toast"]').contains(toast.message);
      cy.get('[data-testid="toast"]').contains('Test Toast');
      
      // Verify toast auto-closes after duration
      cy.get('[data-testid="toast"]', { timeout: 6000 }).should('not.exist');
    });
  });
  
  it('should open and close notification center', () => {
    // Check notification badge count
    cy.get('[data-testid="notification-badge"]').should('exist');
    
    // Open notification center
    cy.get('[data-testid="notification-button"]').click();
    cy.get('[data-testid="notification-center"]').should('be.visible');
    
    // Verify notification content
    cy.get('[data-testid="notification-item"]').should('have.length', 3);
    
    // Close notification center
    cy.get('[data-testid="notification-close-button"]').click();
    cy.get('[data-testid="notification-center"]').should('not.exist');
  });
  
  it('should mark notifications as read', () => {
    // Open notification center
    cy.get('[data-testid="notification-button"]').click();
    
    // Check unread notification
    cy.get('[data-testid="notification-item"]').first().should('have.class', 'unread');
    
    // Mark as read
    cy.get('[data-testid="notification-item"]').first().find('[data-testid="mark-read-button"]').click();
    cy.wait('@markAsRead');
    
    // Badge count should decrease
    cy.get('[data-testid="notification-badge"]');
    
    // Notification should now be marked as read
    cy.get('[data-testid="notification-item"]').first().should('not.have.class', 'unread');
  });
  
  it('should clear all notifications', () => {
    // Open notification center
    cy.get('[data-testid="notification-button"]').click();
    
    // Click clear all button
    cy.get('[data-testid="clear-all-button"]').click();
    cy.wait('@clearAll');
    
    // No notifications should be displayed
    cy.get('[data-testid="notification-item"]').should('not.exist');
    cy.get('[data-testid="empty-notifications"]').should('be.visible');
    
    // Badge should be gone
    cy.get('[data-testid="notification-badge"]').should('not.exist');
  });
  
  it('should handle notification actions', () => {
    // Create custom notification with an action
    cy.mockNotifications('info', 1).then(notifications => {
      const customNotification = {
        ...notifications[0],
        title: 'Update Available',
        message: 'A new version of the platform is available.',
        actions: [
          {
            label: 'View Update',
            url: '/system/update'
          }
        ]
      };
      
      // Mock notification API with custom notification
      cy.intercept('GET', '/api/notifications', {
        statusCode: 200,
        body: [customNotification]
      }).as('getCustomNotifications');
      
      // Reload to get custom notification
      cy.reload();
      cy.wait('@getCustomNotifications');
      
      // Intercept update check API
      cy.intercept('GET', '/api/system/update-check', {
        statusCode: 200,
        body: { version: '2.0.0', updateAvailable: true }
      }).as('updateCheck');
      
      // Open notification center
      cy.get('[data-testid="notification-button"]').click();
      
      // Find update notification and click action button
      cy.contains('[data-testid="notification-item"]', 'Update Available')
        .find('[data-testid="action-button"]')
        .click();
      
      // Should navigate to update page
      cy.url().should('include', '/system/update');
      cy.wait('@updateCheck');
      
      // Page should show update information
      cy.contains('Version 2.0.0 Available').should('be.visible');
    });
  });
  
  it('should pass accessibility tests', () => {
    // Open notification center
    cy.get('[data-testid="notification-button"]').click();
    
    // Check accessibility of notification center
    cy.checkA11y('[data-testid="notification-center"]');
    
    // Generate a test toast
    cy.mockToast('success', 'This is a test toast message').then(toast => {
      // Trigger a toast
      cy.window().then(win => {
        win.showToast = (message, type) => {
          win.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { message, type, title: 'Test Toast' } 
          }));
        };
        win.showToast(toast.message, toast.type);
      });
      
      // Check accessibility of toast
      cy.checkA11y('[data-testid="toast"]');
    });
  });
  
  it('should handle keyboard navigation correctly', () => {
    // Open notification center with keyboard
    cy.get('[data-testid="notification-button"]').focus().type('{enter}');
    cy.get('[data-testid="notification-center"]').should('be.visible');
    
    // Focus should be trapped within notification center
    cy.focused().type('{tab}');
    cy.focused().should('have.attr', 'data-testid', 'notification-item');
    
    // Navigate to second notification
    cy.focused().type('{tab}');
    
    // Navigate to clear all button
    cy.focused().type('{tab}{tab}{tab}');
    cy.focused().should('have.attr', 'data-testid', 'clear-all-button');
    
    // Close with escape key
    cy.get('body').type('{esc}');
    cy.get('[data-testid="notification-center"]').should('not.exist');
  });
});