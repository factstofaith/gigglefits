/**
 * E2E tests for the notification system using Cypress
 *
 * To run these tests:
 * 1. Install Cypress: npm install --save-dev cypress
 * 2. Run: npx cypress open
 */

describe('Notification System', () => {
  beforeEach(() => {
    // Visit the integrations page where we can demo notifications
    cy.visit('/integrations');

    // Login if necessary (adjust as needed for your auth system)
    cy.get('[data-testid="login-button"]').then($btn => {
      if ($btn.length) {
        cy.get('[data-testid="login-button"]').click();
        cy.get('[data-testid="username"]').type('test@example.com');
        cy.get('[data-testid="password"]').type('password123');
        cy.get('[data-testid="submit-login"]').click();
      }
    });
  });

  it('Should show toast notifications', () => {
    // Click the button to show notification examples
    cy.get('[data-testid="show-notification-examples"]').click();

    // Info toast should appear
    cy.get('.MuiAlert-standardInfo').should('be.visible');
    cy.get('.MuiAlert-standardInfo').contains('This is an information message');

    // Success toast should appear
    cy.get('.MuiAlert-standardSuccess').should('be.visible');
    cy.get('.MuiAlert-standardSuccess').contains('Operation completed successfully');

    // Warning toast should appear
    cy.get('.MuiAlert-standardWarning').should('be.visible');
    cy.get('.MuiAlert-standardWarning').contains('This action may have consequences');

    // Error toast should appear
    cy.get('.MuiAlert-standardError').should('be.visible');
    cy.get('.MuiAlert-standardError').contains('An error occurred during the operation');

    // Toast should auto-dismiss
    cy.wait(5000);
    cy.get('.MuiAlert-standardInfo').should('not.exist');
  });

  it('Should display notification badge and show notification center', () => {
    // Click the button to show notification examples
    cy.get('[data-testid="show-notification-examples"]').click();

    // Notification badge should appear
    cy.get('.MuiBadge-badge').should('be.visible');
    cy.get('.MuiBadge-badge').contains('1');

    // Click the notification icon
    cy.get('[aria-label="Notifications"]').click();

    // Notification center should open
    cy.get('.MuiMenu-paper').should('be.visible');
    cy.get('.MuiMenu-paper').contains('System Update');

    // Badge should disappear as notifications are marked as read
    cy.get('.MuiBadge-badge').should('not.exist');
  });

  it('Should allow clearing all notifications', () => {
    // Click the button to show notification examples
    cy.get('[data-testid="show-notification-examples"]').click();

    // Click the notification icon
    cy.get('[aria-label="Notifications"]').click();

    // Click the clear all button
    cy.get('[title="Clear all"]').click();

    // Should show empty state
    cy.contains('No notifications').should('be.visible');
  });

  it('Should show notifications when creating an integration', () => {
    // Click button to create integration
    cy.get('[data-testid="create-integration-button"]').click();

    // Fill out the form (adjust as needed for your form)
    cy.get('[data-testid="integration-name"]').type('Test Integration');
    cy.get('[data-testid="integration-type"]').click();
    cy.get('[data-testid="integration-type-option-api"]').click();
    cy.get('[data-testid="integration-source"]').click();
    cy.get('[data-testid="integration-source-option-0"]').click();
    cy.get('[data-testid="integration-destination"]').click();
    cy.get('[data-testid="integration-destination-option-0"]').click();

    // Submit the form
    cy.get('[data-testid="create-integration-submit"]').click();

    // Success toast should appear
    cy.get('.MuiAlert-standardSuccess').should('be.visible');
    cy.get('.MuiAlert-standardSuccess').contains('Integration created successfully');

    // Notification badge should appear
    cy.get('.MuiBadge-badge').should('be.visible');

    // Click the notification icon
    cy.get('[aria-label="Notifications"]').click();

    // Should see the persistent notification
    cy.contains('New Integration Created').should('be.visible');
    cy.contains('Test Integration').should('be.visible');
  });
});
