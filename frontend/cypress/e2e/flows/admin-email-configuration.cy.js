// cypress/e2e/flows/admin-email-configuration.cy.js

/**
 * End-to-End Test for Admin Email Configuration
 * 
 * This test verifies the functionality of the email configuration system:
 * 1. Office 365 email provider configuration
 * 2. SMTP email provider configuration
 * 3. Form validation and error handling
 * 4. Test email functionality
 * 5. Accessibility and responsive design
 */
describe('Admin Email Configuration Flow', () => {
  // Test data - admin user
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!'
  };
  
  // Test data - Office 365 configuration
  const office365Config = {
    clientId: 'test-client-id-123',
    clientSecret: 'test-client-secret-abc',
    tenantId: 'test-tenant-id-456',
    fromEmail: 'noreply@example.com',
    fromName: 'TAP Platform',
    replyToEmail: 'support@example.com'
  };
  
  // Test data - SMTP configuration
  const smtpConfig = {
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'smtp-user',
    smtpPassword: 'smtp-password-123',
    smtpSecure: true,
    fromEmail: 'system@example.com',
    fromName: 'TAP System',
    replyToEmail: 'help@example.com'
  };
  
  // Test data - Test email recipient
  const testEmailRecipient = 'test@example.com';
  
  beforeEach(() => {
    // Mock initial email configuration API response
    cy.intercept('GET', '/api/admin/email/config', {
      statusCode: 200,
      body: {
        data: {
          provider: 'office365',
          office365: {
            client_id: '',
            client_secret: '',
            tenant_id: ''
          },
          smtp: {
            host: '',
            port: '',
            username: '',
            password: '',
            secure: true
          },
          from_email: '',
          from_name: '',
          reply_to_email: ''
        }
      }
    }).as('getEmailConfig');
    
    // Login as admin
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Navigate to Email Configuration page
    cy.get('[data-testid="admin-menu"]').click();
    cy.get('[data-testid="email-config-link"]').click();
    
    // Verify navigation to email configuration page
    cy.url().should('include', '/admin/email-config');
    cy.contains('Email Configuration').should('be.visible');
    
    // Wait for initial configuration to load
    cy.wait('@getEmailConfig');
  });
  
  it('configures Office 365 email provider with validation', () => {
    // Verify Office 365 is selected by default
    cy.get('[name="emailProvider"][value="office365"]').should('be.checked');
    
    // Check initial form state - Provider Settings tab should be active
    cy.contains('Provider Settings').should('be.visible');
    cy.contains('Office 365 Settings').should('be.visible');
    
    // Intercept the configuration update API call
    cy.intercept('PUT', '/api/admin/email/config', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          provider: 'office365',
          office365: {
            client_id: office365Config.clientId,
            tenant_id: office365Config.tenantId
            // client_secret is not returned for security
          },
          from_email: office365Config.fromEmail,
          from_name: office365Config.fromName,
          reply_to_email: office365Config.replyToEmail
        }
      }
    }).as('updateEmailConfig');
    
    // Fill out Office 365 settings form
    cy.get('[name="clientId"]').type(office365Config.clientId);
    cy.get('[name="clientSecret"]').type(office365Config.clientSecret);
    cy.get('[name="tenantId"]').type(office365Config.tenantId);
    
    // Switch to General Settings tab
    cy.contains('General Settings').click();
    cy.contains('Email Settings').should('be.visible');
    
    // Fill out general settings
    cy.get('[name="fromEmail"]').type(office365Config.fromEmail);
    cy.get('[name="fromName"]').type(office365Config.fromName);
    cy.get('[name="replyToEmail"]').type(office365Config.replyToEmail);
    
    // Submit the form
    cy.contains('button', 'Save Configuration').click();
    
    // Verify API call
    cy.wait('@updateEmailConfig').then(interception => {
      expect(interception.request.body.provider).to.eq('office365');
      expect(interception.request.body.office365.client_id).to.eq(office365Config.clientId);
      expect(interception.request.body.office365.client_secret).to.eq(office365Config.clientSecret);
      expect(interception.request.body.office365.tenant_id).to.eq(office365Config.tenantId);
      expect(interception.request.body.from_email).to.eq(office365Config.fromEmail);
      expect(interception.request.body.from_name).to.eq(office365Config.fromName);
      expect(interception.request.body.reply_to_email).to.eq(office365Config.replyToEmail);
    });
    
    // Verify success message
    cy.contains('Email configuration updated successfully').should('be.visible');
    
    // Test form validation
    cy.contains('General Settings').click();
    cy.get('[name="fromEmail"]').clear();
    cy.contains('button', 'Save Configuration').click();
    
    // Verify validation error
    cy.contains('From email is required').should('be.visible');
    
    // Fix validation error
    cy.get('[name="fromEmail"]').type('valid@example.com');
    
    // Return to provider settings
    cy.contains('Provider Settings').click();
    
    // Test client secret masking and visibility toggle
    cy.get('[name="clientSecret"]').should('have.attr', 'type', 'password');
    cy.get('[aria-label="toggle password visibility"]').first().click();
    cy.get('[name="clientSecret"]').should('have.attr', 'type', 'text');
    cy.get('[aria-label="toggle password visibility"]').first().click();
    cy.get('[name="clientSecret"]').should('have.attr', 'type', 'password');
  });
  
  it('configures SMTP email provider with validation', () => {
    // Switch to SMTP provider
    cy.get('[name="emailProvider"][value="smtp"]').click();
    cy.get('[name="emailProvider"][value="smtp"]').should('be.checked');
    
    // Verify SMTP settings form is displayed
    cy.contains('SMTP Settings').should('be.visible');
    
    // Intercept the configuration update API call
    cy.intercept('PUT', '/api/admin/email/config', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          provider: 'smtp',
          smtp: {
            host: smtpConfig.smtpHost,
            port: parseInt(smtpConfig.smtpPort, 10),
            username: smtpConfig.smtpUsername,
            secure: smtpConfig.smtpSecure
            // password is not returned for security
          },
          from_email: smtpConfig.fromEmail,
          from_name: smtpConfig.fromName,
          reply_to_email: smtpConfig.replyToEmail
        }
      }
    }).as('updateSmtpConfig');
    
    // Fill out SMTP settings form
    cy.get('[name="smtpHost"]').type(smtpConfig.smtpHost);
    cy.get('[name="smtpPort"]').type(smtpConfig.smtpPort);
    cy.get('[name="smtpUsername"]').type(smtpConfig.smtpUsername);
    cy.get('[name="smtpPassword"]').type(smtpConfig.smtpPassword);
    
    // Verify secure connection is checked by default
    cy.get('[name="smtpSecure"]').should('be.checked');
    
    // Switch to General Settings tab
    cy.contains('General Settings').click();
    
    // Fill out general settings
    cy.get('[name="fromEmail"]').type(smtpConfig.fromEmail);
    cy.get('[name="fromName"]').type(smtpConfig.fromName);
    cy.get('[name="replyToEmail"]').type(smtpConfig.replyToEmail);
    
    // Submit the form
    cy.contains('button', 'Save Configuration').click();
    
    // Verify API call
    cy.wait('@updateSmtpConfig').then(interception => {
      expect(interception.request.body.provider).to.eq('smtp');
      expect(interception.request.body.smtp.host).to.eq(smtpConfig.smtpHost);
      expect(interception.request.body.smtp.port).to.eq(parseInt(smtpConfig.smtpPort, 10));
      expect(interception.request.body.smtp.username).to.eq(smtpConfig.smtpUsername);
      expect(interception.request.body.smtp.password).to.eq(smtpConfig.smtpPassword);
      expect(interception.request.body.smtp.secure).to.eq(smtpConfig.smtpSecure);
      expect(interception.request.body.from_email).to.eq(smtpConfig.fromEmail);
      expect(interception.request.body.from_name).to.eq(smtpConfig.fromName);
      expect(interception.request.body.reply_to_email).to.eq(smtpConfig.replyToEmail);
    });
    
    // Verify success message
    cy.contains('Email configuration updated successfully').should('be.visible');
    
    // Test form validation - port field
    cy.contains('Provider Settings').click();
    cy.get('[name="smtpPort"]').clear().type('not-a-number');
    cy.contains('button', 'Save Configuration').click();
    
    // Verify validation error
    cy.contains('SMTP port must be a number').should('be.visible');
    
    // Fix validation error
    cy.get('[name="smtpPort"]').clear().type('587');
    
    // Test SMTP password masking and visibility toggle
    cy.get('[name="smtpPassword"]').should('have.attr', 'type', 'password');
    cy.get('[aria-label="toggle password visibility"]').first().click();
    cy.get('[name="smtpPassword"]').should('have.attr', 'type', 'text');
    cy.get('[aria-label="toggle password visibility"]').first().click();
    cy.get('[name="smtpPassword"]').should('have.attr', 'type', 'password');
  });
  
  it('tests email sending functionality', () => {
    // Fill out minimal required configuration
    cy.get('[name="clientId"]').type('test-client-id');
    cy.get('[name="clientSecret"]').type('test-client-secret');
    cy.get('[name="tenantId"]').type('test-tenant-id');
    
    cy.contains('General Settings').click();
    cy.get('[name="fromEmail"]').type('test@example.com');
    cy.get('[name="fromName"]').type('Test Sender');
    
    // Intercept the test email API call
    cy.intercept('POST', '/api/admin/email/test', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Test email sent successfully'
      }
    }).as('sendTestEmail');
    
    // Click test email button
    cy.contains('button', 'Test Email').click();
    
    // Verify test email dialog opens
    cy.contains('Send Test Email').should('be.visible');
    
    // Enter recipient email and send test
    cy.get('#testEmailRecipient').type(testEmailRecipient);
    cy.contains('button', 'Send Test').click();
    
    // Verify API call
    cy.wait('@sendTestEmail').then(interception => {
      expect(interception.request.body.recipient).to.eq(testEmailRecipient);
    });
    
    // Verify success message
    cy.contains(`Test email sent to ${testEmailRecipient}`).should('be.visible');
    
    // Test validation for invalid email
    cy.contains('button', 'Test Email').click();
    cy.get('#testEmailRecipient').type('invalid-email');
    cy.contains('button', 'Send Test').click();
    
    // Verify validation error
    cy.contains('Please enter a valid email address').should('be.visible');
    
    // Test cancel button
    cy.contains('button', 'Cancel').click();
    cy.contains('Send Test Email').should('not.exist');
  });
  
  it('handles form reset and refresh functionality', () => {
    // Fill form with test data
    cy.get('[name="clientId"]').type('test-client-id');
    cy.get('[name="clientSecret"]').type('test-client-secret');
    cy.get('[name="tenantId"]').type('test-tenant-id');
    
    // Mock updated configuration on refresh
    cy.intercept('GET', '/api/admin/email/config', {
      statusCode: 200,
      body: {
        data: {
          provider: 'office365',
          office365: {
            client_id: 'refreshed-client-id',
            client_secret: '********',
            tenant_id: 'refreshed-tenant-id'
          },
          smtp: {
            host: '',
            port: '',
            username: '',
            password: '',
            secure: true
          },
          from_email: 'refreshed@example.com',
          from_name: 'Refreshed Name',
          reply_to_email: ''
        }
      }
    }).as('refreshConfig');
    
    // Click reset button
    cy.contains('button', 'Reset').click();
    
    // Verify API call to refresh configuration
    cy.wait('@refreshConfig');
    
    // Verify form is updated with refreshed data
    cy.get('[name="clientId"]').should('have.value', 'refreshed-client-id');
    cy.get('[name="tenantId"]').should('have.value', 'refreshed-tenant-id');
    
    // Check that password remains masked
    cy.get('[name="clientSecret"]').should('have.value', '********');
    
    // Switch to general settings tab and verify
    cy.contains('General Settings').click();
    cy.get('[name="fromEmail"]').should('have.value', 'refreshed@example.com');
    cy.get('[name="fromName"]').should('have.value', 'Refreshed Name');
  });
  
  it('handles error scenarios gracefully', () => {
    // Fill form with test data
    cy.get('[name="clientId"]').type('test-client-id');
    cy.get('[name="clientSecret"]').type('test-client-secret');
    cy.get('[name="tenantId"]').type('test-tenant-id');
    
    cy.contains('General Settings').click();
    cy.get('[name="fromEmail"]').type('test@example.com');
    cy.get('[name="fromName"]').type('Test Sender');
    
    // Mock API error on save
    cy.intercept('PUT', '/api/admin/email/config', {
      statusCode: 500,
      body: {
        success: false,
        message: 'Server error occurred while saving configuration'
      }
    }).as('saveError');
    
    // Submit form
    cy.contains('button', 'Save Configuration').click();
    
    // Verify error message is displayed
    cy.contains('Failed to update email configuration').should('be.visible');
    
    // Mock API error on test email
    cy.intercept('POST', '/api/admin/email/test', {
      statusCode: 400,
      body: {
        success: false,
        message: 'Invalid email configuration'
      }
    }).as('testEmailError');
    
    // Attempt to send test email
    cy.contains('button', 'Test Email').click();
    cy.get('#testEmailRecipient').type(testEmailRecipient);
    cy.contains('button', 'Send Test').click();
    
    // Verify error message
    cy.contains('Failed to send test email').should('be.visible');
  });
  
  it('verifies accessibility of email configuration form', () => {
    // Test tab key navigation
    cy.get('body').tab();
    cy.focused().should('have.attr', 'name', 'emailProvider');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'name', 'clientId');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'name', 'clientSecret');
    
    // Test ARIA attributes
    cy.get('[name="clientId"]').should('have.attr', 'aria-required', 'true');
    cy.get('[name="clientSecret"]').should('have.attr', 'aria-required', 'true');
    cy.get('[name="tenantId"]').should('have.attr', 'aria-required', 'true');
    
    // Test form validation and error announcements
    cy.get('[name="clientId"]').clear();
    cy.contains('button', 'Save Configuration').click();
    
    // Verify error has correct ARIA association
    cy.get('[name="clientId"]').should('have.attr', 'aria-invalid', 'true');
    cy.get('[name="clientId"]').parents().find('p').should('contain', 'Client ID is required');
    
    // Test tab navigation between tabs
    cy.get('[role="tab"]').first().focus();
    cy.focused().realPress('ArrowRight');
    cy.focused().should('contain', 'General Settings');
    
    // Run comprehensive accessibility audit
    cy.checkA11y('form', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
  });
  
  it('tests responsive design of email configuration form', () => {
    // Test on mobile viewport
    cy.viewport('iphone-6');
    
    // Verify form layout adapts
    cy.get('form').should('be.visible');
    
    // Test tabs are still accessible
    cy.contains('General Settings').click();
    cy.contains('Email Settings').should('be.visible');
    
    // Fill out a field to verify it's usable
    cy.get('[name="fromEmail"]').type('mobile@example.com');
    cy.get('[name="fromEmail"]').should('have.value', 'mobile@example.com');
    
    // Test on tablet viewport
    cy.viewport('ipad-2');
    
    // Verify form layout adapts
    cy.get('form').should('be.visible');
    
    // Switch back to provider settings
    cy.contains('Provider Settings').click();
    
    // Fill out a field to verify it's usable
    cy.get('[name="clientId"]').clear().type('tablet-client-id');
    cy.get('[name="clientId"]').should('have.value', 'tablet-client-id');
    
    // Return to desktop viewport
    cy.viewport(1200, 800);
  });
  
  after(() => {
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });
});