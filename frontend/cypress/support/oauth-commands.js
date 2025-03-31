// ***********************************************
// Custom Cypress commands for OAuth authentication
// ***********************************************

/**
 * OAuth Authentication E2E Test Commands
 *
 * These commands provide robust support for testing OAuth authentication flows:
 * - Login with various OAuth providers (Google, Microsoft, etc.)
 * - Registration via OAuth during invitation flow
 * - MFA verification after OAuth authentication
 * - Error handling for OAuth flows
 * - Token refresh and management
 * 
 * Implementation uses resilient selection strategies and comprehensive
 * mocking of OAuth provider interactions.
 */

/**
 * Command to initiate an OAuth login flow with robust selector strategy
 */
Cypress.Commands.add('initiateOAuthLogin', (provider) => {
  // Visit login page
  cy.visit('/login');
  
  // Intercept the OAuth redirect
  cy.intercept('GET', `/api/auth/oauth/${provider}`).as(`${provider}Redirect`);
  
  // Click the provider login button using a more resilient approach
  // First check for multiple possible selectors, with progressive fallbacks
  cy.get('body').then($body => {
    let buttonClicked = false;
    
    // Try different possible selectors based on provider
    if (provider === 'office365') {
      // Try new selector pattern first
      if ($body.find('[data-testid="ms-office365-provider"]').length > 0) {
        cy.get('[data-testid="ms-office365-provider"]').click();
        buttonClicked = true;
      }
      // Then try legacy selector pattern
      else if ($body.find('[data-testid="office365-login-button"]').length > 0) {
        cy.get('[data-testid="office365-login-button"]').click();
        buttonClicked = true;
      }
      // Try another potential selector pattern
      else if ($body.find('[data-testid="oauth-provider-office365"]').length > 0) {
        cy.get('[data-testid="oauth-provider-office365"]').click();
        buttonClicked = true;
      }
    }
    else if (provider === 'gmail' || provider === 'google') {
      // Try new selector pattern first
      if ($body.find('[data-testid="google-provider"]').length > 0) {
        cy.get('[data-testid="google-provider"]').click();
        buttonClicked = true;
      }
      // Then try legacy selector pattern
      else if ($body.find('[data-testid="gmail-login-button"]').length > 0) {
        cy.get('[data-testid="gmail-login-button"]').click();
        buttonClicked = true;
      }
      // Try another potential selector pattern
      else if ($body.find('[data-testid="oauth-provider-google"]').length > 0) {
        cy.get('[data-testid="oauth-provider-google"]').click();
        buttonClicked = true;
      }
    }
    
    // If none of the specific selectors worked, fall back to text content
    if (!buttonClicked) {
      cy.log('Could not find OAuth button by data-testid, falling back to text content');
      
      if (provider === 'office365') {
        cy.contains('button', /Office\s*365|Microsoft|Sign in with Microsoft/i).click();
      }
      else if (provider === 'gmail' || provider === 'google') {
        cy.contains('button', /Gmail|Google|Sign in with Google/i).click();
      }
      else {
        // Generic fallback for other providers
        cy.contains('button', new RegExp(`${provider}|Sign in with ${provider}`, 'i')).click();
      }
    }
  });
  
  // Wait for redirect and return interception
  return cy.wait(`@${provider}Redirect`, { timeout: 10000 });
});

/**
 * Command to mock an OAuth callback with improved reliability for race conditions
 */
Cypress.Commands.add('mockOAuthCallback', (provider, userData, options = {}) => {
  const {
    isNewUser = false,
    requireMfa = true,
    requireRegistration = false,
    statusCode = 200,
    state = 'mock-state',
    code = 'mock-code',
    error = null,
    timeout = 15000
  } = options;
  
  const callbackUrl = `/auth/callback/${provider}`;
  
  // If error is provided, simulate error callback
  if (error) {
    cy.visit(`${callbackUrl}?state=${state}&error=${error}`);
    return;
  }
  
  // Intercept not just the callback API but also page navigation and state changes
  // 1. Intercept the OAuth callback API call
  cy.intercept('POST', `/api/auth/oauth/${provider}/callback`, {
    statusCode,
    body: {
      success: true,
      isNewUser,
      user: {
        id: userData.id || `user-${Date.now()}`,
        email: userData.email,
        full_name: userData.full_name,
        provider,
        mfa_enabled: requireMfa,
        registration_complete: !requireRegistration
      },
      token: 'mock-jwt-token',
      mfa_required: requireMfa,
      registration_required: requireRegistration
    },
    // Add small delay to simulate real-world scenario
    delay: 100
  }).as(`${provider}Callback`);
  
  // 2. Intercept redirects that happen after callback
  cy.intercept('GET', '/dashboard').as('dashboardRedirect');
  cy.intercept('GET', '/registration').as('registrationRedirect');
  cy.intercept('GET', '/mfa-setup').as('mfaSetupRedirect');
  
  // 3. Visit the OAuth callback URL
  cy.visit(`${callbackUrl}?state=${state}&code=${code}`);
  
  // 4. Wait for the callback API call to complete
  return cy.wait(`@${provider}Callback`, { timeout }).then(interception => {
    cy.log(`OAuth callback completed with status: ${interception.response.statusCode}`);
    
    // 5. Handle different redirect scenarios based on callback response
    const response = interception.response.body;
    
    if (response.registration_required) {
      // Wait for registration form to appear with proper timeout
      cy.log('Waiting for registration form...');
      return cy.get('[data-testid="registration-form"]', { timeout })
        .should('be.visible')
        .then(() => interception);
    } 
    else if (response.mfa_required) {
      // Wait for MFA verification dialog with proper timeout
      cy.log('Waiting for MFA verification dialog...');
      return cy.get('[data-testid="mfa-verification-dialog"]', { timeout })
        .should('be.visible')
        .then(() => interception);
    } 
    else {
      // Should redirect to dashboard - wait for that to happen
      cy.log('Waiting for dashboard redirect...');
      return cy.wait('@dashboardRedirect', { timeout: timeout / 2 })
        .then(() => interception);
    }
  });
});

/**
 * Command to initiate OAuth registration via invitation with robust selector strategy
 */
Cypress.Commands.add('initiateOAuthRegistration', (provider, invitationToken) => {
  // User visits invitation link
  cy.visit(`/invitation/accept?token=${invitationToken}`);
  
  // Verify invitation page loaded correctly
  cy.get('[data-testid="invitation-accept-page"]').should('be.visible');
  
  // Intercept the OAuth redirect with invitation token
  cy.intercept('GET', `/api/auth/oauth/${provider}?invitation_token=*`).as(`${provider}InvitationRedirect`);
  
  // Choose provider OAuth registration using a more resilient approach
  cy.get('body').then($body => {
    let buttonClicked = false;
    
    // Try different possible selectors based on provider
    if (provider === 'office365') {
      // Try various selector patterns
      const selectors = [
        `[data-testid="office365-registration-button"]`,
        `[data-testid="ms-office365-provider"]`,
        `[data-testid="office365-registration"]`,
        `[data-testid="oauth-registration-office365"]`
      ];
      
      // Try each selector
      for (const selector of selectors) {
        if ($body.find(selector).length > 0) {
          cy.get(selector).click();
          buttonClicked = true;
          break;
        }
      }
    }
    else if (provider === 'gmail' || provider === 'google') {
      // Try various selector patterns
      const selectors = [
        `[data-testid="gmail-registration-button"]`,
        `[data-testid="google-provider"]`,
        `[data-testid="gmail-registration"]`,
        `[data-testid="oauth-registration-google"]`
      ];
      
      // Try each selector
      for (const selector of selectors) {
        if ($body.find(selector).length > 0) {
          cy.get(selector).click();
          buttonClicked = true;
          break;
        }
      }
    }
    
    // If none of the specific selectors worked, fall back to text content
    if (!buttonClicked) {
      cy.log('Could not find OAuth registration button by data-testid, falling back to text content');
      
      if (provider === 'office365') {
        cy.contains('button', /Office\s*365|Microsoft|Register with Microsoft/i).click();
      }
      else if (provider === 'gmail' || provider === 'google') {
        cy.contains('button', /Gmail|Google|Register with Google/i).click();
      }
      else {
        // Generic fallback for other providers
        cy.contains('button', new RegExp(`${provider}|Register with ${provider}`, 'i')).click();
      }
    }
  });
  
  // Return the wait for the redirect with increased timeout
  return cy.wait(`@${provider}InvitationRedirect`, { timeout: 10000 });
});

/**
 * Command to complete OAuth registration with improved reliability
 */
Cypress.Commands.add('completeOAuthRegistration', (userData, options = {}) => {
  const { timeout = 10000 } = options;
  
  // First make sure we're on the registration form page and it's fully loaded
  cy.get('[data-testid="registration-form"]', { timeout }).should('be.visible');
  
  // Intercept form submission to handle redirect after registration
  cy.intercept('POST', '**/api/auth/register').as('registerSubmit');
  cy.intercept('GET', '/mfa-setup').as('mfaSetupRedirect');
  cy.intercept('GET', '/dashboard').as('dashboardRedirect');
  
  // Wait a moment to ensure the form is fully loaded and interactive
  cy.wait(500);
  
  // Complete registration (only company info needed since OAuth provided name)
  cy.get('[data-testid="client-company-input"]').should('be.visible').type(userData.clientCompany);
  
  if (userData.department) {
    cy.get('[data-testid="department-input"]').type(userData.department);
  }
  
  if (userData.position) {
    cy.get('[data-testid="position-input"]').type(userData.position);
  }
  
  cy.get('[data-testid="next-button"]').click();
  
  // Terms & Conditions - make sure this page is fully loaded
  cy.get('[data-testid="terms-checkbox"]', { timeout }).should('be.visible');
  cy.get('[data-testid="privacy-checkbox"]').should('be.visible');
  
  // Check terms checkboxes
  cy.get('[data-testid="terms-checkbox"]').check();
  cy.get('[data-testid="privacy-checkbox"]').check();
  
  // Submit form
  cy.get('[data-testid="submit-button"]').click();
  
  // Wait for the API call to complete to avoid race conditions
  return cy.wait('@registerSubmit', { timeout }).then(interception => {
    cy.log(`Registration form submitted: ${interception.response.statusCode}`);
    
    // Determine next screen based on response
    const requiresMfa = interception.response?.body?.mfa_required;
    
    if (requiresMfa) {
      // Wait for redirect to MFA setup
      cy.log('Waiting for MFA setup page...');
      return cy.get('[data-testid="mfa-setup-page"]', { timeout })
        .should('be.visible')
        .then(() => interception);
    } else {
      // Wait for registration complete confirmation
      cy.log('Waiting for registration completion...');
      return cy.contains('Registration Complete', { timeout })
        .should('be.visible')
        .then(() => interception);
    }
  });
});

/**
 * Command to perform a complete OAuth login flow with MFA
 */
Cypress.Commands.add('oauthLoginWithMfa', (provider, userData, verificationCode = '123456') => {
  // Start OAuth login
  cy.initiateOAuthLogin(provider);
  
  // Mock the OAuth callback
  cy.mockOAuthCallback(provider, userData, {
    requireMfa: true,
    state: 'login-state'
  });
  
  // Complete MFA verification with improved reliability
  cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
  
  // Use the robust verification command
  cy.verifyMfaCode(verificationCode, {
    maxAttempts: 3,
    apiTimeout: 15000,
    uiTimeout: 10000
  });
  
  // Verify successful login with increased timeout
  cy.url().should('include', '/dashboard', { timeout: 15000 });
  cy.get('[data-testid="user-menu"]').should('contain', userData.full_name, { timeout: 10000 });
});

/**
 * Command to test OAuth token refresh flow
 */
Cypress.Commands.add('testOAuthTokenRefresh', (provider, userData) => {
  // First login with OAuth
  cy.initiateOAuthLogin(provider);
  
  // Mock the initial OAuth callback
  cy.mockOAuthCallback(provider, userData, {
    requireMfa: false,
    state: 'login-state'
  });
  
  // Verify successful login
  cy.url().should('include', '/dashboard', { timeout: 15000 });
  
  // Intercept token refresh calls
  cy.intercept('POST', '**/api/auth/refresh', {
    statusCode: 200,
    body: {
      success: true,
      token: 'new-mock-jwt-token',
      expires_in: 3600
    }
  }).as('tokenRefresh');
  
  // Simulate expired token by modifying local storage
  cy.window().then(win => {
    // Get current token expiry and set it to past time
    const auth = JSON.parse(win.localStorage.getItem('auth') || '{}');
    auth.expiresAt = Date.now() - 10000; // 10 seconds in the past
    win.localStorage.setItem('auth', JSON.stringify(auth));
  });
  
  // Trigger a protected API call that should force a token refresh
  cy.intercept('GET', '**/api/user/profile', {
    statusCode: 200,
    body: {
      id: userData.id || `user-${Date.now()}`,
      email: userData.email,
      full_name: userData.full_name,
      provider: provider
    }
  }).as('profileFetch');
  
  // Visit user profile page to trigger API call
  cy.visit('/settings/profile');
  
  // Verify token refresh was attempted
  cy.wait('@tokenRefresh').then(interception => {
    expect(interception.response.statusCode).to.eq(200);
    cy.log('Token refresh successful');
  });
  
  // Verify profile fetch succeeded with new token
  cy.wait('@profileFetch');
  
  // Verify user is still authenticated
  cy.get('[data-testid="profile-email"]').should('contain', userData.email);
});

/**
 * Command to test OAuth token revocation
 */
Cypress.Commands.add('testOAuthTokenRevocation', (provider, userData) => {
  // First login with OAuth
  cy.initiateOAuthLogin(provider);
  
  // Mock the initial OAuth callback
  cy.mockOAuthCallback(provider, userData, {
    requireMfa: false,
    state: 'login-state'
  });
  
  // Verify successful login
  cy.url().should('include', '/dashboard', { timeout: 15000 });
  
  // Intercept token revocation call
  cy.intercept('POST', '**/api/auth/logout', {
    statusCode: 200,
    body: { success: true }
  }).as('tokenRevocation');
  
  // Logout
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  
  // Verify token revocation was called
  cy.wait('@tokenRevocation');
  
  // Verify redirect to login page
  cy.url().should('include', '/login');
  
  // Verify local storage auth data is cleared
  cy.window().then(win => {
    const auth = JSON.parse(win.localStorage.getItem('auth') || '{}');
    expect(auth.token).to.be.undefined;
  });
  
  // Verify protected route is no longer accessible
  cy.visit('/dashboard');
  cy.url().should('include', '/login'); // Should redirect back to login
});

/**
 * Command to test OAuth error scenarios
 */
Cypress.Commands.add('testOAuthError', (provider, errorCode, errorDescription) => {
  // Start OAuth login
  cy.initiateOAuthLogin(provider);
  
  // Simulate error in OAuth callback
  const callbackUrl = `/auth/callback/${provider}`;
  const mockState = 'mock-state-error';
  
  // Visit the OAuth callback URL with error
  cy.visit(`${callbackUrl}?state=${mockState}&error=${errorCode}&error_description=${encodeURIComponent(errorDescription)}`);
  
  // Verify error handling
  cy.get('[data-testid="auth-error-container"]').should('be.visible');
  cy.contains(errorCode).should('be.visible');
  cy.contains(errorDescription).should('be.visible');
  
  // Ensure try again button is available
  cy.get('[data-testid="try-again-button"]').should('be.visible');
  
  // Test retry functionality
  cy.get('[data-testid="try-again-button"]').click();
  cy.url().should('include', '/login');
});

/**
 * Command to test OAuth account linking conflicts
 */
Cypress.Commands.add('testOAuthAccountLinkingConflict', (provider, existingUser, conflictUser) => {
  // Start OAuth login
  cy.initiateOAuthLogin(provider);
  
  // Mock OAuth callback with account conflict
  cy.intercept('POST', `/api/auth/oauth/${provider}/callback`, {
    statusCode: 409, // Conflict status code
    body: {
      success: false,
      error: 'account_linking_conflict',
      message: `This ${provider} account is already linked to another user.`,
      existingEmail: existingUser.email,
      providerEmail: conflictUser.email
    }
  }).as(`${provider}ConflictCallback`);
  
  // Visit the OAuth callback URL
  const callbackUrl = `/auth/callback/${provider}`;
  const mockState = 'mock-state';
  const mockCode = 'mock-code';
  cy.visit(`${callbackUrl}?state=${mockState}&code=${mockCode}`);
  
  // Wait for the callback API call to complete
  cy.wait(`@${provider}ConflictCallback`);
  
  // Verify conflict resolution UI is shown
  cy.get('[data-testid="account-linking-conflict"]').should('be.visible');
  cy.contains(`This ${provider} account is already linked to another user`).should('be.visible');
  cy.contains(existingUser.email).should('be.visible');
  cy.contains(conflictUser.email).should('be.visible');
  
  // Test login with existing account option
  cy.get('[data-testid="login-existing-account"]').should('be.visible');
  
  // Test create new account option
  cy.get('[data-testid="create-new-account"]').should('be.visible');
});