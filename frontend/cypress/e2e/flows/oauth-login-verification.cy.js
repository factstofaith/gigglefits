// cypress/e2e/flows/oauth-login-verification.cy.js

/**
 * End-to-End Test for OAuth Login and Verification Flow
 * 
 * This test verifies the OAuth authentication flow:
 * 1. User initiating OAuth login (Office 365 and Gmail)
 * 2. OAuth provider authentication (mocked)
 * 3. Callback processing and token exchange
 * 4. MFA verification for OAuth users
 * 5. User profile access after OAuth login
 */
describe('OAuth Login and Verification Flow', () => {
  // Test data - existing OAuth users
  const office365User = {
    email: 'office365user@outlook.test',
    provider: 'office365',
    provider_id: 'o365_test_id_123',
    full_name: 'Office 365 User'
  };
  
  const gmailUser = {
    email: 'gmailuser@gmail.test',
    provider: 'gmail',
    provider_id: 'gmail_test_id_456',
    full_name: 'Gmail User'
  };
  
  // Test data - new OAuth user for registration
  const newOAuthUser = {
    email: 'new.oauth.user@gmail.test',
    provider: 'gmail',
    provider_id: 'gmail_new_id_789',
    full_name: 'New OAuth User',
    clientCompany: 'OAuth Test Company',
    department: 'Testing',
    position: 'Tester'
  };
  
  // Test data - existing user and conflicting user for account linking tests
  const existingUser = {
    email: 'existing.user@example.test',
    provider: 'gmail',
    provider_id: 'gmail_existing_id_123',
    full_name: 'Existing User'
  };
  
  const conflictUser = {
    email: 'conflict.user@example.test',
    provider: 'gmail',
    provider_id: 'gmail_conflict_id_456',
    full_name: 'Conflict User'
  };
  
  // OAuth error codes and descriptions for testing
  const oauthErrors = [
    { code: 'access_denied', description: 'The user has denied access to the requested scope.' },
    { code: 'invalid_request', description: 'The request is missing a required parameter.' },
    { code: 'unauthorized_client', description: 'The client is not authorized to request an access token.' },
    { code: 'server_error', description: 'The authorization server encountered an unexpected error.' }
  ];
  
  let invitationToken;
  let invitationId;
  
  before(() => {
    // Clean the test database for OAuth users
    cy.request('POST', '/api/test/reset-db', { scope: 'oauth_users' });
    
    // Create an invitation for the new OAuth user (for registration test)
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('admin@tapplatform.test');
    cy.get('[data-testid="password-input"]').type('Admin1234!');
    cy.get('[data-testid="login-button"]').click();
    
    // Create invitation using custom command
    cy.createInvitation(newOAuthUser.email, 'USER', 48, true).then(invitation => {
      invitationId = invitation.id;
      invitationToken = invitation.token;
      
      // Store invitation data for the OAuth registration test
      cy.wrap(invitationToken).as('invitationToken');
      cy.wrap(invitationId).as('invitationId');
    });
    
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });
  
  it('successfully logs in with Office 365 OAuth', () => {
    // Use custom command to perform OAuth login with MFA
    cy.oauthLoginWithMfa('office365', office365User);
  });
  
  it('successfully logs in with Gmail OAuth', () => {
    // Use custom command to perform OAuth login with MFA
    cy.oauthLoginWithMfa('gmail', gmailUser);
  });
  
  it('handles OAuth registration through invitation', function() {
    const invitationToken = this.invitationToken;
    
    // User visits invitation link
    cy.visit(`/invitation/accept?token=${invitationToken}`);
    
    // Verify invitation page loaded correctly
    cy.get('[data-testid="invitation-accept-page"]').should('be.visible');
    cy.contains('You have been invited').should('be.visible');
    cy.contains(newOAuthUser.email).should('be.visible');
    
    // Intercept the OAuth redirect
    cy.intercept('GET', '/api/auth/oauth/gmail?invitation_token=*').as('gmailInvitationRedirect');
    
    // Choose Gmail OAuth registration
    cy.get('[data-testid="gmail-registration-button"]').click();
    
    // Verify OAuth initialization with invitation token
    cy.wait('@gmailInvitationRedirect').then(interception => {
      expect(interception.response.statusCode).to.eq(302);
      
      // For our test, we mock the OAuth callback with invitation context
      const callbackUrl = '/auth/callback/gmail';
      const mockState = `invitation:${invitationToken}`;
      const mockCode = 'mock-code-789';
      
      // Intercept the OAuth callback API call for registration
      cy.intercept('POST', '/api/auth/oauth/gmail/callback', {
        statusCode: 200,
        body: {
          success: true,
          isNewUser: true,
          user: {
            id: 'newuser789',
            email: newOAuthUser.email,
            full_name: newOAuthUser.full_name,
            provider: 'gmail',
            mfa_enabled: false,
            registration_complete: false
          },
          token: 'mock-jwt-token',
          registration_required: true
        }
      }).as('gmailRegistrationCallback');
      
      // Visit the OAuth callback URL (simulating provider redirect)
      cy.visit(`${callbackUrl}?state=${mockState}&code=${mockCode}`);
      
      // Verify callback processing
      cy.wait('@gmailRegistrationCallback');
      
      // User should be redirected to complete registration
      cy.url().should('include', '/registration/complete');
      
      // Complete registration (only company info needed since OAuth provided name)
      cy.get('[data-testid="client-company-input"]').type(newOAuthUser.clientCompany);
      cy.get('[data-testid="department-input"]').type(newOAuthUser.department);
      cy.get('[data-testid="position-input"]').type(newOAuthUser.position);
      cy.get('[data-testid="next-button"]').click();
      
      // Terms & Conditions
      cy.get('[data-testid="terms-checkbox"]').check();
      cy.get('[data-testid="privacy-checkbox"]').check();
      cy.get('[data-testid="submit-button"]').click();
      
      // Complete MFA setup
      cy.setupMfa('123456');
      
      // Verify completion and redirection to login
      cy.url().should('include', '/login');
      cy.contains('Your account is ready').should('be.visible');
      
      // Test logging in with new OAuth account
      cy.visit('/login');
      cy.get('[data-testid="gmail-login-button"]').click();
      
      // Mock the OAuth provider again for login
      cy.intercept('GET', '/api/auth/oauth/gmail').as('gmailLoginRedirect');
      cy.wait('@gmailLoginRedirect');
      
      // Mock the OAuth callback for the new registered user
      cy.intercept('POST', '/api/auth/oauth/gmail/callback', {
        statusCode: 200,
        body: {
          success: true,
          user: {
            id: 'newuser789',
            email: newOAuthUser.email,
            full_name: newOAuthUser.full_name,
            provider: 'gmail',
            mfa_enabled: true
          },
          token: 'mock-jwt-token',
          mfa_required: true
        }
      }).as('gmailLoginCallback');
      
      // Visit the OAuth callback URL
      cy.visit(`${callbackUrl}?state=login&code=mock-code-789`);
      
      // Verify callback processing
      cy.wait('@gmailLoginCallback');
      
      // Complete MFA verification
      cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
      cy.get('[data-testid="verification-code-input"]').type('123456');
      cy.get('[data-testid="verify-button"]').click();
      
      // Verify successful login
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('contain', newOAuthUser.full_name);
    });
  });
  
  it('handles OAuth errors gracefully', () => {
    // Visit login page
    cy.visit('/login');
    
    // Intercept the OAuth redirect
    cy.intercept('GET', '/api/auth/oauth/gmail').as('gmailRedirect');
    
    // Click Gmail login button
    cy.get('[data-testid="gmail-login-button"]').click();
    
    // Verify OAuth initialization
    cy.wait('@gmailRedirect');
    
    // Simulate error in OAuth callback
    const callbackUrl = '/auth/callback/gmail';
    const mockState = 'mock-state-error';
    const mockError = 'access_denied';
    
    // Visit the OAuth callback URL with error
    cy.visit(`${callbackUrl}?state=${mockState}&error=${mockError}`);
    
    // Verify error handling
    cy.contains('Authentication Error').should('be.visible');
    cy.contains('access_denied').should('be.visible');
    cy.get('[data-testid="try-again-button"]').should('be.visible');
    
    // Click try again to return to login
    cy.get('[data-testid="try-again-button"]').click();
    cy.url().should('include', '/login');
  });
  
  // New test cases for token management and security features
  
  it('handles OAuth token refresh correctly', () => {
    // Test token refresh flow using custom command
    cy.testOAuthTokenRefresh('gmail', gmailUser);
  });
  
  it('handles OAuth token revocation during logout', () => {
    // Test token revocation flow using custom command
    cy.testOAuthTokenRevocation('gmail', gmailUser);
  });
  
  it('handles account linking conflicts appropriately', () => {
    // Test account linking conflict scenario
    cy.testOAuthAccountLinkingConflict('gmail', existingUser, conflictUser);
  });
  
  // Test multiple OAuth error scenarios
  oauthErrors.forEach(error => {
    it(`correctly handles OAuth error: ${error.code}`, () => {
      // Test specific error code and description
      cy.testOAuthError('gmail', error.code, error.description);
    });
  });
  
  it('validates CSRF protection with incorrect state parameter', () => {
    // Start OAuth login
    cy.initiateOAuthLogin('gmail');
    
    // Simulate callback with invalid state (CSRF attack attempt)
    const callbackUrl = '/auth/callback/gmail';
    const invalidState = 'invalid-state-csrf-attempt';
    const mockCode = 'mock-code';
    
    // Mock the callback API with state validation
    cy.intercept('POST', '/api/auth/oauth/gmail/callback', req => {
      if (req.body && req.body.state !== 'mock-state') {
        req.reply({
          statusCode: 400,
          body: {
            success: false,
            error: 'invalid_state',
            message: 'Invalid state parameter. Possible CSRF attack.'
          }
        });
      }
    }).as('csrfCheck');
    
    // Visit the callback URL with invalid state
    cy.visit(`${callbackUrl}?state=${invalidState}&code=${mockCode}`);
    
    // Verify CSRF protection triggered
    cy.wait('@csrfCheck');
    cy.contains('Security Error').should('be.visible');
    cy.contains('Invalid state parameter').should('be.visible');
    cy.get('[data-testid="security-alert"]').should('be.visible');
  });
  
  it('performs accessibility checks on OAuth components', () => {
    // Visit login page
    cy.visit('/login');
    
    // Check that OAuth provider buttons are keyboard navigable
    cy.get('body').tab(); // First tab should focus on first focusable element
    
    // Tab to the OAuth buttons and verify focus states
    let tabCount = 0;
    const maxTabs = 20; // Prevent infinite loop
    let foundOAuthButton = false;
    
    function checkNextTabStop() {
      tabCount++;
      if (tabCount > maxTabs) return; // Safety check
      
      cy.focused().then($el => {
        // Check if we've found an OAuth button
        if ($el.is('[data-testid$="-login-button"]')) {
          foundOAuthButton = true;
          // Verify proper focus styling
          cy.focused().should('have.css', 'outline');
          // Verify ARIA attributes for accessibility
          cy.focused().should('have.attr', 'role', 'button');
          cy.focused().should('have.attr', 'aria-label');
        } else if (!foundOAuthButton && tabCount < maxTabs) {
          // Keep tabbing until we find an OAuth button or reach max tabs
          cy.get('body').tab();
          checkNextTabStop();
        }
      });
    }
    
    checkNextTabStop();
    
    // Run full accessibility scan on login page with OAuth buttons
    cy.checkA11y('[data-testid="login-page"]', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
  });
  
  it('verifies OAuth UI is responsive across different viewport sizes', () => {
    // Test on mobile viewport
    cy.viewport('iphone-6');
    cy.visit('/login');
    cy.get('[data-testid="oauth-providers"]').should('be.visible');
    cy.get('[data-testid="gmail-login-button"]').should('be.visible');
    
    // Test on tablet viewport
    cy.viewport('ipad-2');
    cy.visit('/login');
    cy.get('[data-testid="oauth-providers"]').should('be.visible');
    cy.get('[data-testid="gmail-login-button"]').should('be.visible');
    
    // Test on desktop viewport
    cy.viewport(1200, 800);
    cy.visit('/login');
    cy.get('[data-testid="oauth-providers"]').should('be.visible');
    cy.get('[data-testid="gmail-login-button"]').should('be.visible');
  });
  
  after(() => {
    // Clean up test data
    cy.request('DELETE', `/api/invitations/${invitationId}`);
    cy.request('DELETE', `/api/users`, { email: newOAuthUser.email });
  });
});