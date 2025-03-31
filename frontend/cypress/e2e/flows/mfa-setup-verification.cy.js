// cypress/e2e/flows/mfa-setup-verification.cy.js

/**
 * End-to-End Test for MFA Setup and Verification Flow
 * 
 * This test verifies the Multi-Factor Authentication workflow:
 * 1. Enabling MFA on an existing account
 * 2. Using MFA during login
 * 3. Using recovery codes when MFA device is unavailable
 * 4. Disabling and re-enabling MFA
 * 5. Admin MFA policy enforcement
 */
describe('MFA Setup and Verification Flow', () => {
  // Test data - existing user without MFA
  const nonMfaUser = {
    email: 'mfa.test.user@example.test',
    password: 'Test1234!',
    fullName: 'MFA Test User'
  };
  
  // Test recovery code (we'll get the actual codes during the test)
  let recoveryCodes = [];
  
  before(() => {
    // Clean the test database and create test user without MFA
    cy.request('POST', '/api/test/reset-db', { scope: 'mfa_tests' });
    cy.request('POST', '/api/test/create-user', {
      email: nonMfaUser.email,
      password: nonMfaUser.password,
      fullName: nonMfaUser.fullName,
      role: 'USER',
      mfaEnabled: false
    });
  });
  
  it('allows a user to enable MFA on their account', () => {
    // Login as the test user
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(nonMfaUser.email);
    cy.get('[data-testid="password-input"]').type(nonMfaUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Use the enableMfa command to enable MFA for the user
    cy.enableMfa('123456').then((codes) => {
      // Store recovery codes for later use
      recoveryCodes = codes;
      cy.wrap(codes).as('recoveryCodes');
      
      // Verify codes array has expected length
      expect(codes).to.have.length(10);
      
      // Verify user is on security settings page with MFA enabled
      cy.url().should('include', '/settings/security');
      cy.get('[data-testid="mfa-status"]').should('contain', 'Enabled');
      cy.get('[data-testid="disable-mfa-button"]').should('be.visible');
      cy.get('[data-testid="view-recovery-codes-button"]').should('be.visible');
    });
  });
  
  it('requires MFA verification during login', () => {
    // Logout first
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Verify we're back at login page
    cy.url().should('include', '/login');
    
    // Intercept MFA verification API call
    cy.intercept('POST', '/api/auth/mfa/verify', {
      statusCode: 200,
      body: {
        success: true,
        message: 'MFA verification successful',
        token: 'mock-authenticated-token'
      }
    }).as('mfaVerification');
    
    // Login with the test user (now with MFA enabled)
    cy.get('[data-testid="email-input"]').type(nonMfaUser.email);
    cy.get('[data-testid="password-input"]').type(nonMfaUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Verify MFA verification dialog is shown
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    
    // Enter verification code and submit
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Wait for verification API call
    cy.wait('@mfaVerification');
    
    // Verify successful login and redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('contain', nonMfaUser.fullName);
    
    // Verify authentication state is preserved
    cy.get('[data-testid="dashboard-greeting"]').should('contain', nonMfaUser.fullName);
  });
  
  it('allows using recovery codes when authenticator is unavailable', function() {
    // Retrieve stored recovery codes
    const codes = this.recoveryCodes || recoveryCodes;
    expect(codes).to.be.an('array').that.is.not.empty;
    
    // Select a recovery code to use
    const recoveryCode = codes[0];
    
    // Logout first
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Intercept recovery code verification API call
    cy.intercept('POST', '/api/auth/mfa/recovery-code', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Recovery code accepted',
        token: 'mock-authenticated-token',
        remaining_codes: 9
      }
    }).as('recoveryCodeVerification');
    
    // Login with credentials
    cy.get('[data-testid="email-input"]').type(nonMfaUser.email);
    cy.get('[data-testid="password-input"]').type(nonMfaUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // In MFA dialog, click on "Use recovery code" option
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="use-recovery-code-link"]').click();
    
    // Enter recovery code
    cy.get('[data-testid="recovery-code-input"]').should('be.visible');
    cy.get('[data-testid="recovery-code-input"]').type(recoveryCode);
    cy.get('[data-testid="verify-button"]').click();
    
    // Wait for recovery code verification API call
    cy.wait('@recoveryCodeVerification');
    
    // Verify successful login
    cy.url().should('include', '/dashboard');
    
    // Verify notification about recovery code usage
    cy.get('[data-testid="notification-toast"]').should('be.visible');
    cy.get('[data-testid="notification-toast"]').should('contain', 'Recovery code used');
    cy.get('[data-testid="notification-toast"]').should('contain', '9 codes remaining');
    
    // Navigate to security settings to verify recovery code status
    cy.navigateToMfaSettings();
    
    // Verify remaining recovery codes count
    cy.get('[data-testid="recovery-codes-count"]').should('contain', '9');
    
    // View recovery codes
    cy.get('[data-testid="view-recovery-codes-button"]').click();
    
    // Verify used recovery code is marked
    cy.get('[data-testid="recovery-codes-dialog"]').should('be.visible');
    cy.get('[data-testid="recovery-code-used"]').should('contain', recoveryCode);
  });
  
  it('supports disabling and re-enabling MFA', () => {
    // Navigate to security settings (we should already be there from previous test)
    cy.url().should('include', '/settings/security');
    
    // Close any open dialogs first
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="close-dialog-button"]').length > 0) {
        cy.get('[data-testid="close-dialog-button"]').click();
      }
    });
    
    // Intercept MFA disable API call
    cy.intercept('POST', '/api/auth/mfa/disable', {
      statusCode: 200,
      body: {
        success: true,
        message: 'MFA disabled successfully'
      }
    }).as('disableMfa');
    
    // Click disable MFA button
    cy.get('[data-testid="disable-mfa-button"]').click();
    
    // Confirm intention by entering password
    cy.get('[data-testid="confirm-disable-mfa"]').should('be.visible');
    cy.get('[data-testid="confirm-password-input"]').type(nonMfaUser.password);
    cy.get('[data-testid="confirm-button"]').click();
    
    // Wait for disable API call
    cy.wait('@disableMfa');
    
    // Verify MFA is now disabled
    cy.get('[data-testid="mfa-status"]').should('contain', 'Disabled');
    cy.get('[data-testid="enable-mfa-button"]').should('be.visible');
    cy.get('[data-testid="disable-mfa-button"]').should('not.exist');
    
    // Verify success notification
    cy.get('[data-testid="notification-toast"]').should('contain', 'MFA has been disabled');
    
    // Re-enable MFA to verify process
    cy.enableMfa('654321').then((newCodes) => {
      // Verify we received new recovery codes
      expect(newCodes).to.have.length(10);
      // Should be different from original codes
      const newCodesStr = newCodes.join('');
      const oldCodesStr = recoveryCodes.join('');
      expect(newCodesStr).not.to.equal(oldCodesStr);
      
      // Store new recovery codes
      recoveryCodes = newCodes;
      cy.wrap(newCodes).as('recoveryCodes');
      
      // Verify MFA is enabled again
      cy.get('[data-testid="mfa-status"]').should('contain', 'Enabled');
      cy.get('[data-testid="disable-mfa-button"]').should('be.visible');
      cy.get('[data-testid="view-recovery-codes-button"]').should('be.visible');
    });
  });
  
  it('enforces MFA policies configured by administrators', () => {
    // Logout first
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Login as admin
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('admin@tapplatform.test');
    cy.get('[data-testid="password-input"]').type('Admin1234!');
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification for admin
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Navigate to MFA policy settings
    cy.get('[data-testid="admin-menu"]').click();
    cy.get('[data-testid="security-settings-link"]').click();
    cy.url().should('include', '/admin/security');
    
    // Intercept MFA policy update API call
    cy.intercept('POST', '/api/admin/security/mfa-policy', {
      statusCode: 200,
      body: {
        success: true,
        message: 'MFA policy updated successfully'
      }
    }).as('updateMfaPolicy');
    
    // Enable require MFA policy with grace period
    cy.get('[data-testid="require-mfa-toggle"]').check();
    cy.get('[data-testid="grace-period-input"]').clear().type('7');
    cy.get('[data-testid="save-settings-button"]').click();
    
    // Wait for policy update API call
    cy.wait('@updateMfaPolicy');
    
    // Verify policy update success
    cy.get('[data-testid="notification-toast"]').should('contain', 'Security settings updated');
    
    // Create a new non-MFA test user for policy testing
    const policyTestUser = {
      email: 'policy.test.user@example.test',
      password: 'Test1234!',
      fullName: 'Policy Test User'
    };
    
    // Create test user via API
    cy.request('POST', '/api/test/create-user', {
      email: policyTestUser.email,
      password: policyTestUser.password,
      fullName: policyTestUser.fullName,
      role: 'USER',
      mfaEnabled: false
    });
    
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Login as the new test user
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(policyTestUser.email);
    cy.get('[data-testid="password-input"]').type(policyTestUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Verify MFA grace period notice is shown
    cy.get('[data-testid="mfa-required-notice"]').should('be.visible');
    cy.get('[data-testid="mfa-required-notice"]').should('contain', 'MFA setup is required');
    cy.get('[data-testid="mfa-required-notice"]').should('contain', '7 days');
    
    // Verify options to setup now or later
    cy.get('[data-testid="setup-mfa-now-button"]').should('be.visible');
    cy.get('[data-testid="setup-mfa-later-button"]').should('be.visible');
    
    // Choose setup now
    cy.get('[data-testid="setup-mfa-now-button"]').click();
    
    // Verify redirect to MFA setup page
    cy.url().should('include', '/settings/security/mfa/setup');
    cy.get('[data-testid="mfa-setup-page"]').should('be.visible');
    
    // Clean up test user
    cy.request('DELETE', '/api/test/users', { email: policyTestUser.email });
    
    // Cleanup: Login as admin and disable policy
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('admin@tapplatform.test');
    cy.get('[data-testid="password-input"]').type('Admin1234!');
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification for admin
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Navigate to MFA policy settings
    cy.get('[data-testid="admin-menu"]').click();
    cy.get('[data-testid="security-settings-link"]').click();
    
    // Disable the policy
    cy.get('[data-testid="require-mfa-toggle"]').uncheck();
    cy.get('[data-testid="save-settings-button"]').click();
    
    // Verify policy update
    cy.get('[data-testid="notification-toast"]').should('contain', 'Security settings updated');
  });
  
  after(() => {
    // Clean up test data
    cy.request('DELETE', '/api/test/users', { email: nonMfaUser.email });
  });
});