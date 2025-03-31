// cypress/e2e/flows/security-settings-recovery.cy.js

/**
 * End-to-End Test for Security Settings & Recovery Features
 * 
 * This test suite verifies the complete functionality of security settings,
 * including MFA management, recovery codes, and security policy administration.
 */
describe('Security Settings & Recovery Features', () => {
  // Test data
  const regularUser = {
    email: 'security.test.user@example.test',
    password: 'Test1234!',
    fullName: 'Security Test User'
  };
  
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!',
    fullName: 'Admin User'
  };
  
  // Store recovery codes for testing
  let recoveryCodes = [];
  
  beforeEach(() => {
    // Setup security API interceptions
    cy.setupSecurityInterceptions();
    
    // Mock authentication to skip manual login
    cy.window().then((win) => {
      win.localStorage.setItem('tap_auth_token', 'mock-auth-token');
      win.localStorage.setItem('user', JSON.stringify({
        email: regularUser.email,
        fullName: regularUser.fullName,
        role: 'USER'
      }));
    });
  });
  
  describe('Security Settings Page UI', () => {
    it('should display the security settings page with accessibility compliance', () => {
      // Visit the security settings page
      cy.visit('/settings/security');
      
      // Wait for page to load completely
      cy.get('[data-testid="security-settings-page"]').should('be.visible');
      
      // Verify essential UI elements
      cy.get('[data-testid="mfa-section"]').should('be.visible');
      cy.get('[data-testid="password-section"]').should('be.visible');
      cy.get('[data-testid="login-history-section"]').should('be.visible');
      
      // Check accessibility of the page
      cy.verifySecurityAccessibility('security-settings-page');
      cy.verifySecurityAccessibility('mfa-section');
      cy.verifySecurityAccessibility('password-section');
      cy.verifySecurityAccessibility('login-history-section');
      
      // Verify correct MFA status display
      cy.intercept('GET', '**/api/auth/mfa/status', {
        statusCode: 200,
        body: { enabled: false }
      }).as('getMfaStatus');
      
      cy.reload();
      cy.wait('@getMfaStatus');
      cy.get('[data-testid="mfa-status"]').should('contain', 'Disabled');
      cy.get('[data-testid="enable-mfa-button"]').should('be.visible');
    });
    
    it('should display login history correctly', () => {
      // Visit security settings
      cy.visit('/settings/security');
      
      // Wait for login history to load
      cy.wait('@getLoginHistory');
      
      // Verify login history display
      cy.verifyLoginHistory(5);
      
      // Check details of the most recent login
      cy.get('[data-testid="login-history-entry"]').first().within(() => {
        cy.get('[data-testid="login-date"]').should('contain', '2025-03-25');
        cy.get('[data-testid="login-browser"]').should('contain', 'Chrome');
        cy.get('[data-testid="login-status"]').should('contain', 'SUCCESS');
      });
      
      // Verify failed login is properly marked
      cy.get('[data-testid="login-history-entry"]').last().within(() => {
        cy.get('[data-testid="login-status"]').should('contain', 'FAILED');
        cy.get('[data-testid="login-reason"]').should('contain', 'Invalid password');
      });
    });
  });
  
  describe('MFA Lifecycle Management', () => {
    it('should allow enabling MFA with accessibility compliance', () => {
      // Enable MFA for the user
      cy.setupMfa('123456').then((codes) => {
        // Store recovery codes for later tests
        recoveryCodes = codes;
        cy.wrap(codes).as('recoveryCodes');
        
        // Verify codes array has expected format
        expect(codes).to.be.an('array');
        expect(codes.length).to.be.greaterThan(0);
        
        // Verify MFA now shows as enabled
        cy.get('[data-testid="mfa-status"]').should('contain', 'Enabled');
        
        // Check accessibility of MFA elements
        cy.verifySecurityAccessibility('mfa-status');
        cy.verifySecurityAccessibility('disable-mfa-button');
        cy.verifySecurityAccessibility('view-recovery-codes-button');
      });
    });
    
    it('should require MFA verification during login', () => {
      // Mock front-end to show MFA as enabled
      cy.intercept('GET', '**/api/auth/mfa/status', {
        statusCode: 200,
        body: { enabled: true }
      }).as('getMfaStatusEnabled');
      
      // Clear authentication state
      cy.clearLocalStorage();
      
      // Log in with MFA
      cy.loginWithMfa(regularUser, '123456');
      
      // Verify successful login
      cy.url().should('include', '/dashboard');
      
      // Verify authentication state persists
      cy.visit('/settings/security');
      cy.wait('@getMfaStatusEnabled');
      cy.get('[data-testid="mfa-status"]').should('contain', 'Enabled');
    });
    
    it('should display and allow management of recovery codes', function() {
      // Retrieve stored recovery codes
      const codes = this.recoveryCodes || recoveryCodes;
      expect(codes).to.be.an('array').that.is.not.empty;
      
      // Mock MFA as enabled
      cy.intercept('GET', '**/api/auth/mfa/status', {
        statusCode: 200,
        body: { enabled: true }
      }).as('getMfaStatusEnabled');
      
      // Visit security settings
      cy.visit('/settings/security');
      cy.wait('@getMfaStatusEnabled');
      
      // Click to view recovery codes
      cy.get('[data-testid="view-recovery-codes-button"]').click();
      cy.get('[data-testid="recovery-codes-dialog"]').should('be.visible');
      
      // Verify accessibility
      cy.verifySecurityAccessibility('recovery-codes-dialog');
      
      // Verify recovery codes display
      cy.get('[data-testid="recovery-code"]').should('have.length.at.least', 1);
      
      // Verify download button is present
      cy.get('[data-testid="download-codes-button"]').should('be.visible');
      
      // Verify copy to clipboard button is present
      cy.get('[data-testid="copy-codes-button"]').should('be.visible');
      
      // Close dialog
      cy.get('[data-testid="close-dialog-button"]').click();
    });
    
    it('should allow regenerating recovery codes', function() {
      // Mock MFA as enabled
      cy.intercept('GET', '**/api/auth/mfa/status', {
        statusCode: 200,
        body: { enabled: true }
      }).as('getMfaStatusEnabled');
      
      // Get new recovery codes
      cy.regenerateRecoveryCodes().then((newCodes) => {
        // Verify we received new codes
        expect(newCodes).to.be.an('array');
        expect(newCodes.length).to.be.greaterThan(0);
        
        // Store new codes
        recoveryCodes = newCodes;
        cy.wrap(newCodes).as('recoveryCodes');
        
        // Verify success notification
        cy.get('[data-testid="notification-toast"]').should('contain', 'Recovery codes regenerated');
      });
    });
    
    it('should allow login with recovery code when MFA device is unavailable', function() {
      // Retrieve stored recovery codes
      const codes = this.recoveryCodes || recoveryCodes;
      expect(codes).to.be.an('array').that.is.not.empty;
      const recoveryCode = codes[0];
      
      // Clear authentication state
      cy.clearLocalStorage();
      
      // Log in using recovery code
      cy.loginWithRecoveryCode(regularUser, recoveryCode);
      
      // Verify successful login
      cy.url().should('include', '/dashboard');
      
      // Verify notification about recovery code usage
      cy.get('[data-testid="notification-toast"]').should('contain', 'Recovery code used');
    });
    
    it('should allow disabling MFA', () => {
      // Mock MFA as enabled
      cy.intercept('GET', '**/api/auth/mfa/status', {
        statusCode: 200,
        body: { enabled: true }
      }).as('getMfaStatusEnabled');
      
      // Navigate to security settings
      cy.visit('/settings/security');
      cy.wait('@getMfaStatusEnabled');
      
      // Intercept the disable request
      cy.intercept('POST', '**/api/auth/mfa/disable', {
        statusCode: 200,
        body: {
          success: true,
          message: 'MFA disabled successfully'
        }
      }).as('disableMfa');
      
      // Click disable button
      cy.get('[data-testid="disable-mfa-button"]').click();
      
      // Verify confirm dialog appears
      cy.get('[data-testid="confirm-disable-mfa"]').should('be.visible');
      
      // Verify accessibility
      cy.verifySecurityAccessibility('confirm-disable-mfa');
      
      // Enter password and confirm
      cy.get('[data-testid="confirm-password-input"]').type(regularUser.password);
      cy.get('[data-testid="confirm-button"]').click();
      
      // Wait for disable call
      cy.wait('@disableMfa');
      
      // Override MFA status to now show disabled
      cy.intercept('GET', '**/api/auth/mfa/status', {
        statusCode: 200,
        body: { enabled: false }
      }).as('getMfaStatusDisabled');
      
      // Reload page to see updated status
      cy.reload();
      cy.wait('@getMfaStatusDisabled');
      
      // Verify MFA now shows as disabled
      cy.get('[data-testid="mfa-status"]').should('contain', 'Disabled');
      cy.get('[data-testid="enable-mfa-button"]').should('be.visible');
      cy.get('[data-testid="disable-mfa-button"]').should('not.exist');
      
      // Verify success notification
      cy.get('[data-testid="notification-toast"]').should('contain', 'MFA disabled successfully');
    });
  });
  
  describe('Password Management', () => {
    it('should allow changing password', () => {
      // Navigate to security settings
      cy.visit('/settings/security');
      
      // Intercept password change endpoint
      cy.intercept('POST', '**/api/auth/password/change', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Password changed successfully'
        }
      }).as('changePassword');
      
      // Click change password button
      cy.get('[data-testid="change-password-button"]').click();
      
      // Verify password change dialog appears
      cy.get('[data-testid="password-change-dialog"]').should('be.visible');
      
      // Check accessibility
      cy.verifySecurityAccessibility('password-change-dialog');
      
      // Fill in password form
      cy.get('[data-testid="current-password-input"]').type(regularUser.password);
      cy.get('[data-testid="new-password-input"]').type('NewTest5678!');
      cy.get('[data-testid="confirm-password-input"]').type('NewTest5678!');
      
      // Submit form
      cy.get('[data-testid="submit-password-change"]').click();
      
      // Wait for API call
      cy.wait('@changePassword');
      
      // Verify success notification
      cy.get('[data-testid="notification-toast"]').should('contain', 'Password changed successfully');
    });
    
    it('should validate password requirements', () => {
      // Navigate to security settings
      cy.visit('/settings/security');
      
      // Click change password button
      cy.get('[data-testid="change-password-button"]').click();
      
      // Verify password change dialog appears
      cy.get('[data-testid="password-change-dialog"]').should('be.visible');
      
      // Test weak password
      cy.get('[data-testid="current-password-input"]').type(regularUser.password);
      cy.get('[data-testid="new-password-input"]').type('weak');
      cy.get('[data-testid="confirm-password-input"]').type('weak');
      
      // Verify error messages
      cy.get('[data-testid="password-error"]').should('be.visible');
      cy.get('[data-testid="password-error"]').should('contain', 'Password must be at least 8 characters');
      
      // Submit button should be disabled
      cy.get('[data-testid="submit-password-change"]').should('be.disabled');
      
      // Test password mismatch
      cy.get('[data-testid="new-password-input"]').clear().type('StrongPwd123!');
      cy.get('[data-testid="confirm-password-input"]').clear().type('DifferentPwd123!');
      
      // Verify mismatch error
      cy.get('[data-testid="confirm-error"]').should('be.visible');
      cy.get('[data-testid="confirm-error"]').should('contain', 'Passwords do not match');
      
      // Submit button should still be disabled
      cy.get('[data-testid="submit-password-change"]').should('be.disabled');
    });
  });
  
  describe('MFA Policy Administration', () => {
    it('should allow administrators to configure MFA policy', () => {
      // Setup admin authentication
      cy.window().then((win) => {
        win.localStorage.setItem('tap_auth_token', 'mock-admin-token');
        win.localStorage.setItem('user', JSON.stringify({
          email: adminUser.email,
          fullName: adminUser.fullName,
          role: 'ADMIN'
        }));
      });
      
      // Configure MFA policy with 7-day grace period
      cy.configureMfaPolicy(true, 7);
      
      // Verify policy is saved
      cy.get('[data-testid="require-mfa-toggle"]').should('be.checked');
      cy.get('[data-testid="grace-period-input"]').should('have.value', '7');
      
      // Check accessibility
      cy.verifySecurityAccessibility('mfa-policy-section');
    });
    
    it('should show MFA setup notice for users subject to policy', () => {
      // Setup regular user authentication
      cy.window().then((win) => {
        win.localStorage.setItem('tap_auth_token', 'mock-user-token');
        win.localStorage.setItem('user', JSON.stringify({
          email: regularUser.email,
          fullName: regularUser.fullName,
          role: 'USER'
        }));
      });
      
      // Intercept MFA status to show it's disabled
      cy.intercept('GET', '**/api/auth/mfa/status', {
        statusCode: 200,
        body: { enabled: false }
      }).as('getMfaStatusDisabled');
      
      // Mock MFA policy API to indicate MFA is required
      cy.intercept('GET', '**/api/auth/mfa-policy', {
        statusCode: 200,
        body: {
          requireMfa: true,
          gracePeriodDays: 7,
          gracePeriodEnds: '2025-04-02T00:00:00Z' // 7 days from now
        }
      }).as('getMfaUserPolicy');
      
      // Visit dashboard
      cy.visit('/dashboard');
      cy.wait('@getMfaStatusDisabled');
      cy.wait('@getMfaUserPolicy');
      
      // Verify MFA required notice appears
      cy.get('[data-testid="mfa-required-notice"]').should('be.visible');
      cy.get('[data-testid="mfa-required-notice"]').should('contain', 'MFA setup is required');
      cy.get('[data-testid="mfa-required-notice"]').should('contain', '7 days');
      
      // Verify options to setup now or later
      cy.get('[data-testid="setup-mfa-now-button"]').should('be.visible');
      cy.get('[data-testid="setup-mfa-later-button"]').should('be.visible');
      
      // Check accessibility
      cy.verifySecurityAccessibility('mfa-required-notice');
    });
  });
  
  describe('Error Handling', () => {
    it('should handle invalid verification codes', () => {
      // Setup for invalid code test
      cy.visit('/settings/security');
      
      // Mock MFA as disabled
      cy.intercept('GET', '**/api/auth/mfa/status', {
        statusCode: 200,
        body: { enabled: false }
      }).as('getMfaStatusDisabled');
      
      // Click enable MFA
      cy.get('[data-testid="enable-mfa-button"]').click();
      
      // Replace verification intercept with error response
      cy.intercept('POST', '**/api/auth/mfa/verify', {
        statusCode: 400,
        body: {
          success: false,
          message: 'Invalid verification code',
          remainingAttempts: 2
        }
      }).as('verifyMfaCodeFail');
      
      // Enter invalid code
      cy.get('[data-testid="verification-code-input"]').type('999999');
      cy.get('[data-testid="verify-button"]').click();
      
      // Wait for failed verification
      cy.wait('@verifyMfaCodeFail');
      
      // Verify error message
      cy.get('[data-testid="verification-error"]').should('be.visible');
      cy.get('[data-testid="verification-error"]').should('contain', 'Invalid verification code');
      cy.get('[data-testid="verification-error"]').should('contain', '2 attempts remaining');
    });
    
    it('should handle too many failed verification attempts', () => {
      // Replace verification intercept with too many attempts error
      cy.intercept('POST', '**/api/auth/mfa/verify', {
        statusCode: 429,
        body: {
          success: false,
          message: 'Too many failed verification attempts. Please try again later.',
          lockoutTime: 300
        }
      }).as('verifyMfaCodeLockout');
      
      // Try again
      cy.get('[data-testid="verification-code-input"]').clear().type('999999');
      cy.get('[data-testid="verify-button"]').click();
      
      // Wait for lockout response
      cy.wait('@verifyMfaCodeLockout');
      
      // Verify lockout message
      cy.get('[data-testid="verification-lockout"]').should('be.visible');
      cy.get('[data-testid="verification-lockout"]').should('contain', 'Too many failed attempts');
      cy.get('[data-testid="verification-lockout"]').should('contain', '5 minutes');
    });
    
    it('should handle invalid recovery codes', () => {
      // Navigate to login
      cy.clearLocalStorage();
      cy.visit('/login');
      
      // Enter credentials
      cy.get('[data-testid="email-input"]').type(regularUser.email);
      cy.get('[data-testid="password-input"]').type(regularUser.password);
      cy.get('[data-testid="login-button"]').click();
      
      // In MFA dialog, click on "Use recovery code"
      cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
      cy.get('[data-testid="use-recovery-code-link"]').click();
      
      // Replace recovery code intercept with error
      cy.intercept('POST', '**/api/auth/mfa/recovery-code', {
        statusCode: 400,
        body: {
          success: false,
          message: 'Invalid recovery code'
        }
      }).as('invalidRecoveryCode');
      
      // Enter invalid recovery code
      cy.get('[data-testid="recovery-code-input"]').type('INVALID-CODE-1234');
      cy.get('[data-testid="verify-button"]').click();
      
      // Wait for error response
      cy.wait('@invalidRecoveryCode');
      
      // Verify error message
      cy.get('[data-testid="recovery-code-error"]').should('be.visible');
      cy.get('[data-testid="recovery-code-error"]').should('contain', 'Invalid recovery code');
    });
    
    it('should handle network errors gracefully', () => {
      // Mock network failure
      cy.intercept('GET', '**/api/auth/mfa/status', {
        forceNetworkError: true
      }).as('networkError');
      
      // Visit security settings
      cy.visit('/settings/security');
      
      // Wait for network error
      cy.wait('@networkError');
      
      // Verify error state UI
      cy.get('[data-testid="connection-error"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
      
      // Test retry functionality
      cy.intercept('GET', '**/api/auth/mfa/status', {
        statusCode: 200,
        body: { enabled: false }
      }).as('retrySuccess');
      
      // Click retry
      cy.get('[data-testid="retry-button"]').click();
      
      // Verify successful retry
      cy.wait('@retrySuccess');
      cy.get('[data-testid="connection-error"]').should('not.exist');
      cy.get('[data-testid="mfa-status"]').should('be.visible');
    });
  });
});