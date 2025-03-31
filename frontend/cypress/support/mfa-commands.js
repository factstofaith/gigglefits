// ***********************************************
// Custom Cypress commands for MFA operations
// ***********************************************

/**
 * Command to navigate to MFA settings
 */
Cypress.Commands.add('navigateToMfaSettings', () => {
  // Navigate to security settings
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="security-settings-link"]').click();
  
  // Verify security settings page
  cy.url().should('include', '/settings/security');
});

/**
 * Command to verify an MFA code with improved reliability
 * Uses API interception and retry logic for more robust verification
 */
Cypress.Commands.add('verifyMfaCode', (code, options = {}) => {
  const {
    maxAttempts = 3,
    apiTimeout = 15000,
    uiTimeout = 10000
  } = options;
  
  // Intercept the verification API call
  cy.intercept('POST', '**/api/auth/mfa/verify').as('verifyMfa');
  
  // Type the verification code
  cy.get('[data-testid="verification-code-input"]').clear().type(code);
  
  // Click the verify button
  cy.get('[data-testid="verify-button"]').click();
  
  // Setup verification with retry logic
  let attempts = 0;
  
  function checkVerification() {
    attempts++;
    cy.log(`MFA verification attempt ${attempts}/${maxAttempts}`);
    
    // Wait for the API call with a generous timeout
    return cy.wait('@verifyMfa', { timeout: apiTimeout })
      .then((interception) => {
        // If successful, look for the success message
        if (interception.response && interception.response.statusCode === 200) {
          return cy.get('[data-testid="verification-success"]', { timeout: uiTimeout })
            .should('be.visible');
        } 
        // If we've tried too many times, fail the test
        else if (attempts >= maxAttempts) {
          throw new Error(`MFA verification failed after ${attempts} attempts. Status: ${
            interception.response ? interception.response.statusCode : 'No response'
          }`);
        } 
        // Otherwise, retry the verification
        else {
          cy.log(`Verification attempt ${attempts} failed, retrying...`);
          cy.get('[data-testid="verification-code-input"]').clear().type(code);
          cy.get('[data-testid="verify-button"]').click();
          // Wait briefly before retrying to avoid overwhelming the server
          cy.wait(1000);
          return checkVerification();
        }
      });
  }
  
  return checkVerification();
});

/**
 * Command to enable MFA for a user account
 */
Cypress.Commands.add('enableMfa', (verificationCode = '123456') => {
  // Navigate to security settings
  cy.navigateToMfaSettings();
  
  // Click enable MFA button
  cy.get('[data-testid="enable-mfa-button"]').click();
  
  // Verify MFA setup page
  cy.get('[data-testid="mfa-setup-page"]').should('be.visible');
  
  // Look for QR code with more resilient selector strategy
  cy.get('body').then($body => {
    if ($body.find('[data-testid="qr-code"]').length > 0) {
      cy.get('[data-testid="qr-code"]').should('be.visible');
    } else if ($body.find('[data-testid="mfa-qr-container"]').length > 0) {
      cy.get('[data-testid="mfa-qr-container"]').should('be.visible');
    } else {
      // If neither selector works, try a more generic approach
      cy.get('img[alt="MFA QR Code"]').should('be.visible');
    }
  });
  
  // Use the more robust verification method with longer timeouts
  cy.verifyMfaCode(verificationCode, {
    maxAttempts: 3,
    apiTimeout: 20000,
    uiTimeout: 15000
  });
  
  // Save recovery codes
  cy.get('[data-testid="recovery-codes"]').should('be.visible');
  
  // Store recovery codes for later use
  const codes = [];
  cy.get('[data-testid="recovery-code"]').each(($code) => {
    codes.push($code.text().trim());
  }).then(() => {
    return cy.wrap(codes);
  });
  
  // Complete MFA setup
  cy.get('[data-testid="continue-button"]').click();
  
  // Verify MFA status
  cy.contains('MFA has been enabled for your account').should('be.visible', { timeout: 10000 });
});

/**
 * Command to disable MFA for a user account
 */
Cypress.Commands.add('disableMfa', (password) => {
  // Navigate to security settings
  cy.navigateToMfaSettings();
  
  // Click disable MFA button
  cy.get('[data-testid="disable-mfa-button"]').click();
  
  // Confirm intention
  cy.get('[data-testid="confirm-disable-mfa"]').should('be.visible');
  
  // Enter password to confirm
  cy.get('[data-testid="confirm-password-input"]').type(password);
  cy.get('[data-testid="confirm-button"]').click();
  
  // Verify MFA has been disabled
  cy.contains('MFA has been disabled').should('be.visible');
});

/**
 * Command to login with a recovery code with improved reliability
 */
Cypress.Commands.add('loginWithRecoveryCode', (email, password, recoveryCode) => {
  // Navigate to login page
  cy.visit('/login');
  
  // Enter credentials
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  
  // On MFA page, click use recovery code
  cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
  cy.get('[data-testid="use-recovery-code-link"]').click();
  
  // Intercept the recovery code verification API call
  cy.intercept('POST', '**/api/auth/mfa/recovery').as('verifyRecoveryCode');
  
  // Enter recovery code
  cy.get('[data-testid="recovery-code-input"]').type(recoveryCode);
  cy.get('[data-testid="verify-button"]').click();
  
  // Wait for API response with a generous timeout
  cy.wait('@verifyRecoveryCode', { timeout: 15000 }).then((interception) => {
    if (interception.response && interception.response.statusCode === 200) {
      // Continue with verification of successful login
      cy.log('Recovery code accepted, verifying login');
    } else {
      // Log error for debugging
      cy.log(`Recovery code verification failed with status: ${
        interception.response ? interception.response.statusCode : 'No response'
      }`);
    }
  });
  
  // Verify successful login with increased timeout
  cy.url().should('include', '/dashboard', { timeout: 15000 });
});

/**
 * Command to set admin MFA policy
 */
Cypress.Commands.add('setMfaPolicy', (requireMfa, gracePeriodDays = 7) => {
  // Navigate to admin MFA settings
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="security-settings-link"]').click();
  
  // Set MFA policy
  if (requireMfa) {
    cy.get('[data-testid="require-mfa-toggle"]').check();
  } else {
    cy.get('[data-testid="require-mfa-toggle"]').uncheck();
  }
  
  // Set grace period
  cy.get('[data-testid="grace-period-input"]').clear().type(gracePeriodDays.toString());
  
  // Save settings
  cy.get('[data-testid="save-settings-button"]').click();
  
  // Verify confirmation
  cy.contains('Security settings updated').should('be.visible');
});

/**
 * Command to verify user's MFA status
 */
Cypress.Commands.add('verifyMfaStatus', (email, expectedStatus) => {
  // Navigate to users admin page
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="users-link"]').click();
  
  // Find user and verify MFA status
  cy.contains(email).parent('tr').within(() => {
    cy.get('[data-testid="mfa-status"]').should('contain', expectedStatus);
  });
});