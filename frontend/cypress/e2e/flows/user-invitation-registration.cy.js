// cypress/e2e/flows/user-invitation-registration.cy.js

/**
 * End-to-End Test for User Invitation and Registration Flow
 * 
 * This test verifies the complete user journey from:
 * 1. Admin creating an invitation
 * 2. User receiving invitation link
 * 3. User accepting invitation and registering
 * 4. User setting up MFA
 * 5. User completing profile
 * 6. User logging in with new credentials
 */
describe('User Invitation and Registration Flow', () => {
  // Test data
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!'
  };
  
  const newUser = {
    email: 'newuser@example.com',
    password: 'NewUser1234!',
    fullName: 'New Test User',
    clientCompany: 'Test Company',
    department: 'Engineering',
    position: 'Developer'
  };
  
  let invitationToken;
  let invitationId;
  
  before(() => {
    // Clear database state for clean test run
    cy.request('POST', '/api/test/reset-db', { scope: 'invitations,users' });
    
    // Admin login
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Verify successful login
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('contain', 'Admin');
    
    // Create invitation using custom command
    cy.createInvitation(newUser.email, 'USER', 48, true).then(invitation => {
      invitationId = invitation.id;
      invitationToken = invitation.token;
      
      // Store invitation data for the user journey part
      cy.wrap(invitationToken).as('invitationToken');
      cy.wrap(invitationId).as('invitationId');
    });
    
    // Verify invitation appears with PENDING status
    cy.contains(newUser.email).should('be.visible');
    cy.contains('PENDING').should('be.visible');
    
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('include', '/login');
  });
  
  it('allows user to accept invitation and complete registration', function() {
    // Retrieve the invitation token from the before hook
    const invitationToken = this.invitationToken;
    
    // Complete registration using custom commands
    cy.completeRegistration(invitationToken, newUser);
    cy.setupMfa('123456');
    
    // Verify completion and redirection to login
    cy.url().should('include', '/login');
    cy.contains('Your account is ready').should('be.visible');
  });
  
  it('allows the new user to log in successfully', () => {
    // Login with MFA using custom command
    cy.loginWithMfa(newUser.email, newUser.password, '123456');
    
    // Verify successful login
    cy.get('[data-testid="user-menu"]').should('contain', newUser.fullName);
    
    // Verify profile information is correct
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="profile-link"]').click();
    
    cy.url().should('include', '/profile');
    cy.get('[data-testid="profile-name"]').should('contain', newUser.fullName);
    cy.get('[data-testid="profile-email"]').should('contain', newUser.email);
    cy.get('[data-testid="profile-company"]').should('contain', newUser.clientCompany);
    cy.get('[data-testid="profile-department"]').should('contain', newUser.department);
    cy.get('[data-testid="profile-position"]').should('contain', newUser.position);
  });
  
  it('shows the invitation as accepted in admin view', () => {
    // Login as admin
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Check invitation status using custom command
    cy.checkInvitationStatus(newUser.email, 'ACCEPTED');
    
    // Check user status using custom command
    cy.checkUserStatus(newUser.email, 'ACTIVE');
  });
  
  it('validates form fields during registration', function() {
    // Test invalid registration data for validation
    const invalidToken = this.invitationToken;
    
    // Create test user with invalid data
    const invalidUser = {
      email: 'invalid@example.com',
      password: 'short',
      confirmPassword: 'doesntMatch',
      fullName: ''
    };
    
    // Expected validation errors
    const expectedErrors = {
      fullName: 'Full name is required',
      password: 'Password must be at least 8 characters',
      confirmPassword: 'Passwords do not match',
    };
    
    // Visit invitation accept page
    cy.visit(`/invitation/accept?token=${invalidToken}`);
    
    // Test form validation with invalid data
    cy.testRegistrationValidation(invalidUser, expectedErrors);
  });
  
  it('tests invitation expiration scenarios', function() {
    // Create invitation with short expiration for testing
    // Login as admin
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Create invitation with 0 hour expiration (expires immediately)
    const expiredUserEmail = 'expired.user@example.com';
    cy.createInvitation(expiredUserEmail, 'USER', 0, false).then(invitation => {
      const expiredToken = invitation.token;
      
      // Force invitation to expire via API call
      cy.request('POST', '/api/test/expire-invitation', { id: invitation.id });
      
      // Test expired invitation
      cy.useExpiredInvitation(expiredToken);
      
      // Test resending the invitation
      cy.resendInvitation(expiredUserEmail);
      
      // Verify status changed to PENDING
      cy.checkInvitationStatus(expiredUserEmail, 'PENDING');
    });
  });
  
  it('tests invitation creation validation', () => {
    // Admin login if not already logged in
    cy.get('body').then(($body) => {
      if (!$body.find('[data-testid="user-menu"]').length) {
        cy.visit('/login');
        cy.get('[data-testid="email-input"]').type(adminUser.email);
        cy.get('[data-testid="password-input"]').type(adminUser.password);
        cy.get('[data-testid="login-button"]').click();
      }
    });
    
    // Test various invalid invitation parameters
    const invalidParams = {
      email: 'not-an-email',
      role: 'USER',
      emailError: 'Invalid email format'
    };
    
    cy.testInvalidInvitation(invalidParams);
    
    // Test empty email
    const emptyEmailParams = {
      email: '',
      role: 'USER',
      emailError: 'Email is required'
    };
    
    cy.testInvalidInvitation(emptyEmailParams);
    
    // Test inviting existing user
    const existingUserParams = {
      email: newUser.email,
      role: 'USER',
      emailError: 'A user with this email already exists'
    };
    
    cy.testInvalidInvitation(existingUserParams);
  });
  
  it('tests bulk invitation functionality', () => {
    // Generate multiple test emails
    const bulkEmails = [
      Cypress.generateTestEmail('bulk1'),
      Cypress.generateTestEmail('bulk2'),
      Cypress.generateTestEmail('bulk3')
    ];
    
    // Create bulk invitations
    cy.createBulkInvitations(bulkEmails, 'USER', 48);
    
    // Verify all invitations were created
    bulkEmails.forEach(email => {
      cy.checkInvitationStatus(email, 'PENDING');
    });
    
    // Test export functionality
    cy.exportInvitations('csv');
  });
  
  it('tests invitation cancellation', () => {
    // Create a new invitation to cancel
    const cancelUserEmail = Cypress.generateTestEmail('cancel');
    
    cy.createInvitation(cancelUserEmail, 'USER', 48, false);
    
    // Cancel the invitation
    cy.cancelInvitation(cancelUserEmail);
    
    // Verify status
    cy.checkInvitationStatus(cancelUserEmail, 'CANCELED');
  });
  
  it('verifies accessibility of invitation and registration forms', function() {
    const invitationToken = this.invitationToken;
    
    // Test admin invitation form accessibility
    cy.get('[data-testid="admin-menu"]').click();
    cy.get('[data-testid="invitations-link"]').click();
    cy.get('[data-testid="create-invitation-button"]').click();
    
    // Verify form is keyboard navigable
    cy.get('body').tab(); // First tab should focus on first focusable element
    
    // Check for proper ARIA attributes
    cy.get('[data-testid="email-input"]')
      .should('have.attr', 'aria-required', 'true');
    
    cy.get('[data-testid="role-user"]')
      .should('have.attr', 'aria-required', 'true');
    
    // Run accessibility scan on invitation form
    cy.checkA11y('[data-testid="invitation-form"]', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
    
    // Test registration form accessibility
    cy.visit(`/invitation/accept?token=${invitationToken}`);
    cy.get('[data-testid="email-registration-button"]').click();
    
    // Verify form is keyboard navigable
    cy.get('body').tab(); // First tab should focus on first focusable element
    
    // Check for proper ARIA attributes in registration form
    cy.get('[data-testid="full-name-input"]')
      .should('have.attr', 'aria-required', 'true');
    
    cy.get('[data-testid="password-input"]')
      .should('have.attr', 'aria-required', 'true');
    
    // Run accessibility scan on registration form
    cy.checkA11y('[data-testid="registration-form"]', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
  });
  
  it('verifies responsive design of invitation and registration flows', function() {
    const invitationToken = this.invitationToken;
    
    // Test on mobile viewport
    cy.viewport('iphone-6');
    
    // Test admin invitation creation form
    cy.get('[data-testid="admin-menu"]').click();
    cy.get('[data-testid="invitations-link"]').click();
    cy.get('[data-testid="create-invitation-button"]').click();
    
    // Verify form elements adapt to smaller viewport
    cy.get('[data-testid="invitation-form"]').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    
    // Test registration form on mobile
    cy.visit(`/invitation/accept?token=${invitationToken}`);
    cy.get('[data-testid="invitation-accept-page"]').should('be.visible');
    cy.get('[data-testid="email-registration-button"]').should('be.visible');
    cy.get('[data-testid="email-registration-button"]').click();
    
    // Verify responsive layout
    cy.get('[data-testid="registration-form"]').should('be.visible');
    cy.get('[data-testid="full-name-input"]').should('be.visible');
    
    // Test on tablet viewport
    cy.viewport('ipad-2');
    cy.visit(`/invitation/accept?token=${invitationToken}`);
    cy.get('[data-testid="invitation-accept-page"]').should('be.visible');
    
    // Verify tablet layout
    cy.get('[data-testid="email-registration-button"]').should('be.visible');
    
    // Return to desktop viewport
    cy.viewport(1200, 800);
  });
  
  after(() => {
    // Clean up - remove created user and invitation
    // This ensures tests can be run repeatedly
    cy.request('DELETE', `/api/invitations/${invitationId}`);
    cy.request('DELETE', `/api/users`, { email: newUser.email });
    
    // Clean up any test users created during the tests
    cy.cleanupTestUsers();
  });
});