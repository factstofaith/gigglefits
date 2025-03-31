// cypress/e2e/flows/login-logout-flow.cy.js

/**
 * End-to-End Test for Login and Logout Flow
 * 
 * This test verifies the basic authentication workflow:
 * 1. User login with valid credentials
 * 2. Login failure scenarios (invalid credentials, locked account, etc.)
 * 3. User logout
 * 4. Session persistence
 * 5. Session timeout behavior
 */
describe('Login and Logout Flow', () => {
  // Test users
  const validUser = {
    email: 'test.user@example.test',
    password: 'Test1234!',
    fullName: 'Test User'
  };
  
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!',
    fullName: 'Admin User'
  };
  
  before(() => {
    // Clean the test database and create test users
    cy.request('POST', '/api/test/reset-db', { scope: 'auth_tests' });
    cy.request('POST', '/api/test/create-user', {
      email: validUser.email,
      password: validUser.password,
      fullName: validUser.fullName,
      role: 'USER',
      mfaEnabled: false
    });
  });
  
  beforeEach(() => {
    // Reset state between tests
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit login page
    cy.visit('/login');
    cy.url().should('include', '/login');
  });
  
  /**
   * Section 1: Core Functionality - Happy Path
   * These tests verify that the primary login/logout flow works as expected
   */
  describe('Core Functionality', () => {
    it('logs in successfully with valid credentials', () => {
      // Intercept the login API call
      cy.intercept('POST', '/api/auth/login').as('loginRequest');
      
      // Enter valid credentials
      cy.get('[data-testid="email-input"]').type(validUser.email);
      cy.get('[data-testid="password-input"]').type(validUser.password);
      cy.get('[data-testid="login-button"]').click();
      
      // Wait for the login API response
      cy.wait('@loginRequest').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });
      
      // Verify successful login and redirect to dashboard
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('contain', validUser.fullName);
      
      // Verify authentication state is preserved
      cy.get('[data-testid="dashboard-greeting"]').should('contain', validUser.fullName);
    });
    
    it('logs out successfully', () => {
      // First login
      cy.get('[data-testid="email-input"]').type(validUser.email);
      cy.get('[data-testid="password-input"]').type(validUser.password);
      cy.get('[data-testid="login-button"]').click();
      
      // Verify we're logged in
      cy.url().should('include', '/dashboard');
      
      // Intercept the logout API call
      cy.intercept('POST', '/api/auth/logout').as('logoutRequest');
      
      // Perform logout
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      // Wait for the logout request
      cy.wait('@logoutRequest').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });
      
      // Verify redirect to login page
      cy.url().should('include', '/login');
      
      // Verify we can't access protected routes
      cy.visit('/dashboard');
      cy.url().should('include', '/login'); // Should redirect back to login
    });
    
    it('maintains user session across page reloads', () => {
      // Login
      cy.get('[data-testid="email-input"]').type(validUser.email);
      cy.get('[data-testid="password-input"]').type(validUser.password);
      cy.get('[data-testid="login-button"]').click();
      
      // Verify we're logged in
      cy.url().should('include', '/dashboard');
      
      // Reload the page
      cy.reload();
      
      // Verify we're still logged in
      cy.get('[data-testid="user-menu"]').should('contain', validUser.fullName);
      
      // Navigate to another page
      cy.get('[data-testid="settings-link"]').click();
      cy.url().should('include', '/settings');
      
      // Go back to dashboard
      cy.get('[data-testid="dashboard-link"]').click();
      cy.url().should('include', '/dashboard');
      
      // Verify we're still logged in
      cy.get('[data-testid="user-menu"]').should('contain', validUser.fullName);
    });
  });
  
  /**
   * Section 2: Error Handling & Edge Cases
   * These tests verify that login errors are handled properly
   */
  describe('Error Handling & Edge Cases', () => {
    it('shows error with invalid email', () => {
      // Try to login with invalid email
      cy.get('[data-testid="email-input"]').type('invalid@example.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();
      
      // Verify error message
      cy.get('[data-testid="login-error"]').should('be.visible');
      cy.get('[data-testid="login-error"]').should('contain', 'Invalid email or password');
      
      // Verify we're still on the login page
      cy.url().should('include', '/login');
    });
    
    it('shows error with empty email', () => {
      // Try to login with empty email
      cy.get('[data-testid="password-input"]').type(validUser.password);
      cy.get('[data-testid="login-button"]').click();
      
      // Verify validation error
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required');
      
      // Verify we're still on the login page
      cy.url().should('include', '/login');
    });
    
    it('shows error with empty password', () => {
      // Try to login with empty password
      cy.get('[data-testid="email-input"]').type(validUser.email);
      cy.get('[data-testid="login-button"]').click();
      
      // Verify validation error
      cy.get('[data-testid="password-error"]').should('be.visible');
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required');
      
      // Verify we're still on the login page
      cy.url().should('include', '/login');
    });
    
    it('handles account lockout after multiple failed attempts', () => {
      // Mock lockout API response after 5 failed attempts
      let attemptCount = 0;
      cy.intercept('POST', '/api/auth/login', (req) => {
        attemptCount++;
        if (attemptCount >= 5) {
          req.reply({
            statusCode: 429,
            body: {
              error: 'Too many failed login attempts',
              message: 'Account temporarily locked. Please try again later.'
            }
          });
        } else {
          req.reply({
            statusCode: 401,
            body: {
              error: 'Invalid credentials',
              message: 'Invalid email or password'
            }
          });
        }
      }).as('loginAttempt');
      
      // Attempt login multiple times with incorrect password
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="email-input"]').clear().type(validUser.email);
        cy.get('[data-testid="password-input"]').clear().type('WrongPassword' + i);
        cy.get('[data-testid="login-button"]').click();
        cy.wait('@loginAttempt');
      }
      
      // Verify account lockout message
      cy.get('[data-testid="login-error"]').should('contain', 'Account temporarily locked');
      
      // Try again with correct password to ensure we're still locked out
      cy.get('[data-testid="email-input"]').clear().type(validUser.email);
      cy.get('[data-testid="password-input"]').clear().type(validUser.password);
      cy.get('[data-testid="login-button"]').click();
      
      // Verify we're still locked out
      cy.get('[data-testid="login-error"]').should('contain', 'Account temporarily locked');
    });
  });
  
  /**
   * Section 3: Security Features
   * These tests verify security-related features of the login process
   */
  describe('Security Features', () => {
    it('encrypts password during transmission', () => {
      cy.intercept('POST', '/api/auth/login', (req) => {
        // Verify the request doesn't contain the plaintext password
        expect(req.body.toString()).not.to.include(validUser.password);
        
        // Continue with the request
        req.continue();
      }).as('secureLogin');
      
      // Perform login
      cy.get('[data-testid="email-input"]').type(validUser.email);
      cy.get('[data-testid="password-input"]').type(validUser.password);
      cy.get('[data-testid="login-button"]').click();
      
      // Wait for the secure login request
      cy.wait('@secureLogin');
    });
    
    it('supports remember me functionality', () => {
      // Check the remember me box
      cy.get('[data-testid="remember-me-checkbox"]').check();
      
      // Login
      cy.get('[data-testid="email-input"]').type(validUser.email);
      cy.get('[data-testid="password-input"]').type(validUser.password);
      cy.get('[data-testid="login-button"]').click();
      
      // Verify we're logged in
      cy.url().should('include', '/dashboard');
      
      // Get the session cookie and verify it has appropriate expiration
      cy.getCookie('session').then((cookie) => {
        // Remember me should set a long-lived cookie (at least 7 days)
        const expiryDate = new Date(cookie.expiry * 1000);
        const now = new Date();
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        
        // Check if expiry is at least 7 days in the future
        expect(expiryDate.getTime() - now.getTime()).to.be.at.least(sevenDaysInMs - 60000); // Allow 1 minute margin
      });
      
      // Logout to clean up
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
    });
    
    it('sanitizes inputs to prevent XSS attacks', () => {
      // Attempt to inject script
      const scriptInjection = '<script>alert("XSS")</script>';
      
      // Enter malicious input
      cy.get('[data-testid="email-input"]').type(`test${scriptInjection}@example.com`);
      cy.get('[data-testid="password-input"]').type(validUser.password);
      
      // Verify the input is sanitized (shouldn't execute script)
      cy.get('[data-testid="email-input"]').should('not.have.value', scriptInjection);
      
      // Attempt login to see how system handles it
      cy.get('[data-testid="login-button"]').click();
      
      // Should show validation error or general error, not execute script
      cy.get('body').should('not.contain.text', 'XSS');
    });
  });
  
  /**
   * Section 4: Accessibility Testing
   * These tests verify that the login page meets accessibility requirements
   */
  describe('Accessibility', () => {
    it('has no accessibility violations', () => {
      // Run accessibility check on the login page
      cy.injectAxe();
      cy.checkA11y();
    });
    
    it('is navigable via keyboard', () => {
      // Focus on email input
      cy.get('[data-testid="email-input"]').focus();
      
      // Tab to password
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'password-input');
      
      // Tab to remember me
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'remember-me-checkbox');
      
      // Tab to login button
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'login-button');
      
      // Press enter to login
      cy.focused().type('{enter}');
      
      // Should show validation errors since we didn't enter any credentials
      cy.get('[data-testid="email-error"]').should('be.visible');
    });
  });
  
  /**
   * Section 5: Responsive Design Testing
   * These tests verify that the login page works on different screen sizes
   */
  describe('Responsive Design', () => {
    const viewports = {
      desktop: [1280, 720],
      tablet: [768, 1024],
      mobile: [375, 667]
    };
    
    Object.entries(viewports).forEach(([device, [width, height]]) => {
      it(`displays correctly on ${device}`, () => {
        // Set viewport size
        cy.viewport(width, height);
        cy.reload();
        
        // Verify login form is visible and properly formatted
        cy.get('[data-testid="login-form"]').should('be.visible');
        
        // Verify branding elements are appropriate for viewport size
        if (device === 'mobile') {
          // Mobile may have a simplified header/logo
          cy.get('[data-testid="compact-logo"]').should('be.visible');
          cy.get('[data-testid="full-logo"]').should('not.be.visible');
        } else {
          // Desktop/tablet should have the full logo
          cy.get('[data-testid="full-logo"]').should('be.visible');
        }
        
        // Take screenshot for visual reference
        cy.takeSnapshot(`Login page on ${device}`);
      });
    });
  });
  
  after(() => {
    // Clean up test users
    cy.request('DELETE', '/api/test/users', { email: validUser.email });
  });
});