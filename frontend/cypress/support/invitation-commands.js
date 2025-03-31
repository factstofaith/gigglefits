// ***********************************************
// Custom Cypress commands for invitation and registration flow
// ***********************************************

// Initialize a Cypress environment variable to track test users
Cypress.env('testUsers', Cypress.env('testUsers') || []);

/**
 * Helper function to generate a unique test user email
 * @param {string} prefix - Optional prefix for the email (default: 'test.user')
 * @returns {string} A unique email address for testing
 */
function generateTestEmail(prefix = 'test.user') {
  const timestamp = new Date().getTime();
  const randomSuffix = Math.floor(Math.random() * 10000);
  const email = `${prefix}.${timestamp}.${randomSuffix}@example.com`;
  
  // Add to the list of test users for cleanup
  const testUsers = Cypress.env('testUsers') || [];
  testUsers.push(email);
  Cypress.env('testUsers', testUsers);
  
  return email;
}

// Add the helper function to the Cypress namespace
Cypress.generateTestEmail = generateTestEmail;

/**
 * Command to create a new invitation as an admin
 */
Cypress.Commands.add('createInvitation', (email, role = 'USER', expirationHours = 48, sendReminder = true) => {
  // Navigate to invitations page
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="invitations-link"]').click();
  cy.url().should('include', '/admin/invitations');
  
  // Create new invitation
  cy.get('[data-testid="create-invitation-button"]').click();
  cy.url().should('include', '/admin/invitations/new');
  
  // Fill out invitation form
  cy.get('[data-testid="email-input"]').type(email);
  
  if (role === 'ADMIN') {
    cy.get('[data-testid="role-admin"]').check();
  } else {
    cy.get('[data-testid="role-user"]').check();
  }
  
  cy.get('[data-testid="expiration-select"]').select(expirationHours.toString());
  
  if (sendReminder) {
    cy.get('[data-testid="send-reminder-checkbox"]').check();
  } else {
    cy.get('[data-testid="send-reminder-checkbox"]').uncheck();
  }
  
  // Submit invitation
  cy.intercept('POST', '/api/invitations').as('createInvitation');
  cy.get('[data-testid="send-invitation-button"]').click();
  
  // Wait for invitation to be created and return the invitation data
  return cy.wait('@createInvitation').then(interception => {
    expect(interception.response.statusCode).to.eq(201);
    return {
      id: interception.response.body.id,
      token: interception.response.body.token,
      email: email
    };
  });
});

/**
 * Command to complete user registration through an invitation
 */
Cypress.Commands.add('completeRegistration', (invitationToken, userData) => {
  // If email is not provided, generate a unique one
  const email = userData.email || Cypress.generateTestEmail();
  
  // Keep track of all registered users for later cleanup
  const testUsers = Cypress.env('testUsers') || [];
  if (!testUsers.includes(email)) {
    testUsers.push(email);
    Cypress.env('testUsers', testUsers);
  }
  
  // Visit invitation accept page
  cy.visit(`/invitation/accept?token=${invitationToken}`);
  
  // Verify invitation page loaded correctly
  cy.get('[data-testid="invitation-accept-page"]').should('be.visible');
  cy.contains('You have been invited').should('be.visible');
  
  // Choose email registration (not OAuth)
  cy.get('[data-testid="email-registration-button"]').click();
  
  // Complete registration form - Step 1: Account Information
  cy.get('[data-testid="registration-form"]').should('be.visible');
  cy.get('[data-testid="full-name-input"]').type(userData.fullName);
  cy.get('[data-testid="password-input"]').type(userData.password);
  cy.get('[data-testid="confirm-password-input"]').type(userData.password);
  cy.get('[data-testid="next-button"]').click();
  
  // Step 2: Company Information
  cy.get('[data-testid="client-company-input"]').type(userData.clientCompany);
  
  if (userData.department) {
    cy.get('[data-testid="department-input"]').type(userData.department);
  }
  
  if (userData.position) {
    cy.get('[data-testid="position-input"]').type(userData.position);
  }
  
  cy.get('[data-testid="next-button"]').click();
  
  // Step 3: Terms & Conditions
  cy.get('[data-testid="terms-checkbox"]').check();
  cy.get('[data-testid="privacy-checkbox"]').check();
  cy.get('[data-testid="submit-button"]').click();
  
  // Verify registration completion
  cy.contains('Registration Complete').should('be.visible');
  
  // Return the email for reference
  return cy.wrap(email);
});

/**
 * Command to complete MFA setup during registration
 */
Cypress.Commands.add('setupMfa', (verificationCode = '123456') => {
  // Proceed to MFA setup
  cy.get('[data-testid="continue-button"]').click();
  
  // Verify MFA setup page
  cy.get('[data-testid="mfa-setup-page"]').should('be.visible');
  cy.get('[data-testid="qr-code"]').should('be.visible');
  
  // Mock MFA verification (in real tests we'd use a TOTP library)
  cy.intercept('POST', '/api/mfa/verify').as('verifyMfa');
  cy.get('[data-testid="verification-code-input"]').type(verificationCode);
  cy.get('[data-testid="verify-button"]').click();
  
  // Wait for verification API call
  cy.wait('@verifyMfa');
  
  // Verify recovery codes display
  cy.get('[data-testid="recovery-codes"]').should('be.visible');
  cy.get('[data-testid="recovery-code"]').should('have.length.at.least', 8);
  
  // Acknowledge recovery codes
  cy.get('[data-testid="continue-button"]').click();
});

/**
 * Command to login with MFA verification
 */
Cypress.Commands.add('loginWithMfa', (email, password, verificationCode = '123456') => {
  // Navigate to login page
  cy.visit('/login');
  
  // Login with credentials
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  
  // Handle MFA verification
  cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
  cy.get('[data-testid="verification-code-input"]').type(verificationCode);
  cy.get('[data-testid="verify-button"]').click();
  
  // Verify successful login
  cy.url().should('include', '/dashboard');
});

/**
 * Command to check invitation status in admin view
 */
Cypress.Commands.add('checkInvitationStatus', (email, expectedStatus) => {
  // Navigate to invitations page
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="invitations-link"]').click();
  
  // Verify invitation status
  cy.contains(email).parent('tr').within(() => {
    cy.contains(expectedStatus).should('be.visible');
  });
});

/**
 * Command to check user status in admin view
 */
Cypress.Commands.add('checkUserStatus', (email, expectedStatus) => {
  // Navigate to users page
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="users-link"]').click();
  
  // Verify user status
  cy.contains(email).parent('tr').within(() => {
    cy.contains(expectedStatus).should('be.visible');
  });
});

/**
 * Command to resend an invitation
 */
Cypress.Commands.add('resendInvitation', (email) => {
  // Navigate to invitations page
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="invitations-link"]').click();
  
  // Find the invitation and click resend
  cy.contains(email).parent('tr').within(() => {
    cy.get('[data-testid="resend-invitation-button"]').click();
  });
  
  // Confirm resend
  cy.get('[data-testid="confirm-resend-button"]').click();
  
  // Verify success message
  cy.contains(`Invitation resent to ${email}`).should('be.visible');
});

/**
 * Command to cancel an invitation
 */
Cypress.Commands.add('cancelInvitation', (email) => {
  // Navigate to invitations page
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="invitations-link"]').click();
  
  // Find the invitation and click cancel
  cy.contains(email).parent('tr').within(() => {
    cy.get('[data-testid="cancel-invitation-button"]').click();
  });
  
  // Confirm cancellation
  cy.get('[data-testid="confirm-cancel-button"]').click();
  
  // Verify success message
  cy.contains(`Invitation to ${email} cancelled`).should('be.visible');
  
  // Verify status changed to CANCELED
  cy.contains(email).parent('tr').within(() => {
    cy.contains('CANCELED').should('be.visible');
  });
});

/**
 * Command to test an expired invitation token
 */
Cypress.Commands.add('useExpiredInvitation', (token) => {
  // Visit invitation accept page with expired token
  cy.visit(`/invitation/accept?token=${token}`);
  
  // Verify expired invitation message
  cy.get('[data-testid="invitation-expired"]').should('be.visible');
  cy.contains('This invitation has expired').should('be.visible');
  cy.get('[data-testid="contact-admin-button"]').should('be.visible');
});

/**
 * Command to test invitation with missing or invalid parameters
 */
Cypress.Commands.add('testInvalidInvitation', (invalidParams) => {
  // Navigate to invitations page
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="invitations-link"]').click();
  
  // Create new invitation
  cy.get('[data-testid="create-invitation-button"]').click();
  
  // Fill out invitation form with invalid parameters
  if (invalidParams.email) {
    cy.get('[data-testid="email-input"]').type(invalidParams.email);
  }
  
  if (invalidParams.role) {
    if (invalidParams.role === 'ADMIN') {
      cy.get('[data-testid="role-admin"]').check();
    } else if (invalidParams.role === 'USER') {
      cy.get('[data-testid="role-user"]').check();
    }
  }
  
  if (invalidParams.expiration) {
    cy.get('[data-testid="expiration-select"]').select(invalidParams.expiration.toString());
  }
  
  // Submit invitation
  cy.get('[data-testid="send-invitation-button"]').click();
  
  // Verify validation errors
  if (invalidParams.emailError) {
    cy.get('[data-testid="email-error"]').should('contain', invalidParams.emailError);
  }
  
  if (invalidParams.roleError) {
    cy.get('[data-testid="role-error"]').should('contain', invalidParams.roleError);
  }
  
  if (invalidParams.expirationError) {
    cy.get('[data-testid="expiration-error"]').should('contain', invalidParams.expirationError);
  }
});

/**
 * Command to test registration with validation errors
 */
Cypress.Commands.add('testRegistrationValidation', (userData, expectedErrors) => {
  // Visit registration page (assuming we're already on the invitation accept page)
  cy.get('[data-testid="email-registration-button"]').click();
  
  // Submit the form with missing or invalid data
  if (userData.fullName) {
    cy.get('[data-testid="full-name-input"]').type(userData.fullName);
  }
  
  if (userData.password) {
    cy.get('[data-testid="password-input"]').type(userData.password);
  }
  
  if (userData.confirmPassword) {
    cy.get('[data-testid="confirm-password-input"]').type(userData.confirmPassword);
  }
  
  // Click next to trigger validation
  cy.get('[data-testid="next-button"]').click();
  
  // Verify validation errors
  if (expectedErrors.fullName) {
    cy.get('[data-testid="full-name-error"]').should('contain', expectedErrors.fullName);
  }
  
  if (expectedErrors.password) {
    cy.get('[data-testid="password-error"]').should('contain', expectedErrors.password);
  }
  
  if (expectedErrors.confirmPassword) {
    cy.get('[data-testid="confirm-password-error"]').should('contain', expectedErrors.confirmPassword);
  }
  
  if (expectedErrors.general) {
    cy.get('[data-testid="general-error"]').should('contain', expectedErrors.general);
  }
});

/**
 * Command to test bulk invitation operations
 */
Cypress.Commands.add('createBulkInvitations', (emails, role = 'USER', expirationHours = 48) => {
  // Navigate to invitations page
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="invitations-link"]').click();
  
  // Click bulk invite button
  cy.get('[data-testid="bulk-invite-button"]').click();
  
  // Enter emails in textarea (one per line)
  const emailList = emails.join('\n');
  cy.get('[data-testid="bulk-emails-input"]').type(emailList);
  
  // Set role and expiration
  if (role === 'ADMIN') {
    cy.get('[data-testid="bulk-role-admin"]').check();
  } else {
    cy.get('[data-testid="bulk-role-user"]').check();
  }
  
  cy.get('[data-testid="bulk-expiration-select"]').select(expirationHours.toString());
  
  // Submit bulk invitations
  cy.intercept('POST', '/api/invitations/bulk').as('createBulkInvitations');
  cy.get('[data-testid="send-bulk-invitations-button"]').click();
  
  // Wait for API call and verify success
  return cy.wait('@createBulkInvitations').then(interception => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    
    // Verify success message
    cy.contains('Successfully sent invitations').should('be.visible');
    
    // Return the response for use in tests
    return interception.response.body;
  });
});

/**
 * Command to export invitation data
 */
Cypress.Commands.add('exportInvitations', (format = 'csv') => {
  // Navigate to invitations page
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="invitations-link"]').click();
  
  // Click export button
  cy.get('[data-testid="export-invitations-button"]').click();
  
  // Select format
  cy.get(`[data-testid="export-${format}-option"]`).click();
  
  // Verify download started
  cy.contains('Export started').should('be.visible');
});

/**
 * Command to cleanup test users
 * This should be called in the after() hook of test files to ensure proper cleanup
 */
Cypress.Commands.add('cleanupTestUsers', () => {
  // Get all test users that were created during this test run
  const testUsers = Cypress.env('testUsers') || [];
  
  if (testUsers.length === 0) {
    cy.log('No test users to clean up');
    return;
  }
  
  cy.log(`Cleaning up ${testUsers.length} test users: ${testUsers.join(', ')}`);
  
  // Call the test API to clean up these specific users
  cy.request({
    method: 'POST',
    url: '/api/test/cleanup-users',
    body: { emails: testUsers },
    failOnStatusCode: false
  }).then(response => {
    if (response.status === 200) {
      cy.log(`Successfully cleaned up ${testUsers.length} test users`);
    } else {
      cy.log(`Warning: Failed to clean up test users. Status: ${response.status}`);
    }
  });
  
  // Also do a pattern-based cleanup for any missed users
  cy.request({
    method: 'POST',
    url: '/api/test/cleanup',
    body: { 
      patterns: ['test.user', 'e2e.test', 'cypress.test'],
      force: true // Force deletion even if references exist
    },
    failOnStatusCode: false
  });
  
  // Reset the test users array
  Cypress.env('testUsers', []);
});