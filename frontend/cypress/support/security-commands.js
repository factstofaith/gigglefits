// ***********************************************
// Custom Cypress commands for Security Settings & Recovery Features
// ***********************************************

/**
 * Navigates to the security settings page
 */
Cypress.Commands.add('navigateToSecuritySettings', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="security-settings-link"]').click();
  cy.url().should('include', '/settings/security');
  cy.get('[data-testid="security-settings-page"]').should('be.visible');
});

/**
 * Sets up API route interceptions for MFA and security endpoints
 */
Cypress.Commands.add('setupSecurityInterceptions', () => {
  // MFA status endpoint
  cy.intercept('GET', '**/api/auth/mfa/status', (req) => {
    req.reply((res) => {
      return {
        statusCode: 200,
        body: {
          enabled: false
        }
      };
    });
  }).as('getMfaStatus');

  // Login history endpoint
  cy.intercept('GET', '**/api/auth/login-history', { fixture: 'security/login_history.json' }).as('getLoginHistory');
  
  // MFA enable endpoint
  cy.intercept('POST', '**/api/auth/mfa/enable', { fixture: 'security/verification_responses.json' }).as('enableMfa');
  
  // MFA verification endpoint
  cy.intercept('POST', '**/api/auth/mfa/verify', (req) => {
    const body = req.body;
    if (body && body.code === '123456') {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: 'Verification successful',
          token: 'mock-authenticated-token'
        }
      });
    } else {
      req.reply({
        statusCode: 400,
        body: {
          success: false,
          message: 'Invalid verification code',
          remainingAttempts: 2
        }
      });
    }
  }).as('verifyMfaCode');
  
  // MFA disable endpoint
  cy.intercept('POST', '**/api/auth/mfa/disable', { fixture: 'security/verification_responses.json' }).as('disableMfa');
  
  // Recovery codes endpoints
  cy.intercept('GET', '**/api/auth/mfa/recovery-codes', { fixture: 'security/recovery_codes.json' }).as('getRecoveryCodes');
  cy.intercept('POST', '**/api/auth/mfa/recovery-codes/regenerate', { fixture: 'security/verification_responses.json' }).as('regenerateRecoveryCodes');
  
  // Recovery code verification
  cy.intercept('POST', '**/api/auth/mfa/recovery-code', (req) => {
    const code = req.body.recoveryCode;
    // Check if it's one of our test recovery codes
    if (code && code.match(/[A-Z]{4}-\d{4}-[A-Z]{4}-\d{4}/)) {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: 'Recovery code accepted',
          token: 'mock-authenticated-token',
          remainingCodes: 9
        }
      });
    } else {
      req.reply({
        statusCode: 400,
        body: {
          success: false,
          message: 'Invalid recovery code'
        }
      });
    }
  }).as('verifyRecoveryCode');
  
  // Password change endpoint
  cy.intercept('POST', '**/api/auth/password/change', (req) => {
    const body = req.body;
    if (body && body.currentPassword === 'Test1234!') {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: 'Password changed successfully'
        }
      });
    } else {
      req.reply({
        statusCode: 400,
        body: {
          success: false,
          message: 'Current password is incorrect'
        }
      });
    }
  }).as('changePassword');
  
  // MFA policy endpoints (admin)
  cy.intercept('GET', '**/api/admin/security/mfa-policy', { fixture: 'security/mfa_policies.json' }).as('getMfaPolicy');
  cy.intercept('POST', '**/api/admin/security/mfa-policy', {
    statusCode: 200,
    body: {
      success: true,
      message: 'MFA policy updated successfully'
    }
  }).as('updateMfaPolicy');
});

/**
 * Enables MFA for the current user
 * @param {string} verificationCode - The code to use for verification (default: 123456)
 * @returns {Cypress.Chainable} A chainable containing the generated recovery codes
 */
Cypress.Commands.add('setupMfa', (verificationCode = '123456') => {
  // Setup interceptions
  cy.setupSecurityInterceptions();
  
  // Navigate to security settings
  cy.navigateToSecuritySettings();
  
  // Get MFA status to verify it's disabled
  cy.wait('@getMfaStatus');
  
  // Click enable MFA button
  cy.get('[data-testid="enable-mfa-button"]').click();
  
  // Verify MFA setup page displayed
  cy.get('[data-testid="mfa-setup-page"]').should('be.visible');
  
  // Verify QR code is displayed
  cy.get('[data-testid="qr-code"]').should('be.visible');
  cy.get('[data-testid="manual-key"]').should('be.visible');
  
  // Enter verification code
  cy.get('[data-testid="verification-code-input"]').type(verificationCode);
  cy.get('[data-testid="verify-button"]').click();
  
  // Wait for verification API call
  cy.wait('@verifyMfaCode');
  
  // Verify recovery codes displayed
  cy.get('[data-testid="recovery-codes"]').should('be.visible');
  
  // Store recovery codes for later use
  const codes = [];
  cy.get('[data-testid="recovery-code"]').each(($code) => {
    codes.push($code.text().trim());
  }).then(() => {
    // Complete setup
    cy.get('[data-testid="continue-button"]').click();
    
    // Verify we're back at security settings with MFA enabled
    cy.get('[data-testid="mfa-status"]').should('contain', 'Enabled');
    cy.get('[data-testid="disable-mfa-button"]').should('be.visible');
    
    // Return codes for later use
    return cy.wrap(codes);
  });
});

/**
 * Regenerates recovery codes and returns them
 * @returns {Cypress.Chainable} A chainable containing the new recovery codes
 */
Cypress.Commands.add('regenerateRecoveryCodes', () => {
  // Navigate to security settings
  cy.navigateToSecuritySettings();
  
  // Click view recovery codes
  cy.get('[data-testid="view-recovery-codes-button"]').click();
  cy.get('[data-testid="recovery-codes-dialog"]').should('be.visible');
  
  // Click regenerate button
  cy.get('[data-testid="regenerate-codes-button"]').click();
  
  // Confirm regeneration
  cy.get('[data-testid="confirm-regenerate-dialog"]').should('be.visible');
  cy.get('[data-testid="confirm-button"]').click();
  
  // Wait for API call
  cy.wait('@regenerateRecoveryCodes');
  
  // Store and return new codes
  const newCodes = [];
  cy.get('[data-testid="recovery-code"]').each(($code) => {
    newCodes.push($code.text().trim());
  }).then(() => {
    // Close dialog
    cy.get('[data-testid="close-dialog-button"]').click();
    
    // Return new codes
    return cy.wrap(newCodes);
  });
});

/**
 * Verifies the current MFA status matches the expected status
 * @param {string} expectedStatus - The expected status ('Enabled' or 'Disabled')
 */
Cypress.Commands.add('verifyMfaStatus', (expectedStatus) => {
  cy.navigateToSecuritySettings();
  cy.get('[data-testid="mfa-status"]').should('contain', expectedStatus);
  
  if (expectedStatus === 'Enabled') {
    cy.get('[data-testid="disable-mfa-button"]').should('be.visible');
    cy.get('[data-testid="view-recovery-codes-button"]').should('be.visible');
  } else {
    cy.get('[data-testid="enable-mfa-button"]').should('be.visible');
  }
});

/**
 * Login with MFA verification
 * @param {Object} user - User object with email and password
 * @param {string} verificationCode - The MFA verification code (default: 123456)
 */
Cypress.Commands.add('loginWithMfa', (user, verificationCode = '123456') => {
  // Setup interceptions
  cy.setupSecurityInterceptions();
  
  // Visit login page
  cy.visit('/login');
  
  // Enter credentials
  cy.get('[data-testid="email-input"]').type(user.email);
  cy.get('[data-testid="password-input"]').type(user.password);
  cy.get('[data-testid="login-button"]').click();
  
  // Verify MFA verification dialog is shown
  cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
  
  // Enter verification code
  cy.get('[data-testid="verification-code-input"]').type(verificationCode);
  cy.get('[data-testid="verify-button"]').click();
  
  // Wait for verification
  cy.wait('@verifyMfaCode');
  
  // Verify successful login
  cy.url().should('include', '/dashboard');
});

/**
 * Login using a recovery code instead of MFA code
 * @param {Object} user - User object with email and password
 * @param {string} recoveryCode - The recovery code to use
 */
Cypress.Commands.add('loginWithRecoveryCode', (user, recoveryCode) => {
  // Setup interceptions
  cy.setupSecurityInterceptions();
  
  // Visit login page
  cy.visit('/login');
  
  // Enter credentials
  cy.get('[data-testid="email-input"]').type(user.email);
  cy.get('[data-testid="password-input"]').type(user.password);
  cy.get('[data-testid="login-button"]').click();
  
  // Verify MFA verification dialog is shown
  cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
  
  // Click on "Use recovery code" link
  cy.get('[data-testid="use-recovery-code-link"]').click();
  
  // Verify recovery code input is shown
  cy.get('[data-testid="recovery-code-input"]').should('be.visible');
  
  // Enter recovery code
  cy.get('[data-testid="recovery-code-input"]').type(recoveryCode);
  cy.get('[data-testid="verify-button"]').click();
  
  // Wait for verification
  cy.wait('@verifyRecoveryCode');
  
  // Verify successful login
  cy.url().should('include', '/dashboard');
  
  // Verify notification about recovery code usage
  cy.get('[data-testid="notification-toast"]').should('contain', 'Recovery code used');
});

/**
 * Changes the user's password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
Cypress.Commands.add('changePassword', (currentPassword, newPassword) => {
  // Navigate to security settings
  cy.navigateToSecuritySettings();
  
  // Click change password button
  cy.get('[data-testid="change-password-button"]').click();
  
  // Fill and submit form
  cy.get('[data-testid="current-password-input"]').type(currentPassword);
  cy.get('[data-testid="new-password-input"]').type(newPassword);
  cy.get('[data-testid="confirm-password-input"]').type(newPassword);
  cy.get('[data-testid="submit-password-change"]').click();
  
  // Wait for API call
  cy.wait('@changePassword');
  
  // Verify success message
  cy.get('[data-testid="notification-toast"]').should('contain', 'Password changed successfully');
});

/**
 * Verifies login history entries match the expected count and data
 * @param {number} expectedCount - Expected number of entries
 */
Cypress.Commands.add('verifyLoginHistory', (expectedCount) => {
  // Navigate to security settings
  cy.navigateToSecuritySettings();
  
  // Wait for history API call
  cy.wait('@getLoginHistory');
  
  // Click on login history tab if needed
  cy.get('[data-testid="login-history-tab"]').click();
  
  // Verify history entries
  cy.get('[data-testid="login-history-entry"]').should('have.length', expectedCount);
  
  // Verify most recent login shows correct information
  cy.get('[data-testid="login-history-entry"]').first().within(() => {
    cy.get('[data-testid="login-date"]').should('be.visible');
    cy.get('[data-testid="login-browser"]').should('be.visible');
    cy.get('[data-testid="login-ip"]').should('be.visible');
    cy.get('[data-testid="login-status"]').should('be.visible');
  });
});

/**
 * Configure MFA policy as an administrator
 * @param {boolean} requireMfa - Whether to require MFA for all users
 * @param {number} gracePeriodDays - Grace period in days for enabling MFA
 */
Cypress.Commands.add('configureMfaPolicy', (requireMfa, gracePeriodDays = 7) => {
  // Setup interceptions
  cy.setupSecurityInterceptions();
  
  // Navigate to admin security settings
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="security-settings-link"]').click();
  cy.url().should('include', '/admin/security');
  
  // Wait for policy to load
  cy.wait('@getMfaPolicy');
  
  // Set MFA requirement
  if (requireMfa) {
    cy.get('[data-testid="require-mfa-toggle"]').check({ force: true });
  } else {
    cy.get('[data-testid="require-mfa-toggle"]').uncheck({ force: true });
  }
  
  // Set grace period
  cy.get('[data-testid="grace-period-input"]').clear().type(gracePeriodDays.toString());
  
  // Save settings
  cy.get('[data-testid="save-settings-button"]').click();
  
  // Wait for API call
  cy.wait('@updateMfaPolicy');
  
  // Verify success message
  cy.get('[data-testid="notification-toast"]').should('contain', 'MFA policy updated successfully');
});

/**
 * Verify security accessibility for key security interfaces
 * @param {string} testId - The data-testid of the element to test for accessibility
 */
Cypress.Commands.add('verifySecurityAccessibility', (testId) => {
  cy.get(`[data-testid="${testId}"]`).should('be.visible');
  cy.get(`[data-testid="${testId}"]`).then($el => {
    // Run accessibility check on this specific element
    cy.checkA11y($el[0], {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
  });
});