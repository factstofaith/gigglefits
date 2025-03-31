// ***********************************************
// Custom Cypress commands for admin operations
// ***********************************************

/**
 * Command to navigate to admin user management page
 */
Cypress.Commands.add('navigateToUserManagement', () => {
  // Navigate to admin user management
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="users-link"]').click();
  
  // Verify user management page
  cy.url().should('include', '/admin/users');
  cy.get('[data-testid="user-management-title"]').should('be.visible');
});

/**
 * Command to create a new user as admin
 */
Cypress.Commands.add('createUser', (userData) => {
  // Navigate to user management
  cy.navigateToUserManagement();
  
  // Click create user button
  cy.get('[data-testid="create-user-button"]').click();
  
  // Fill out user form
  cy.get('[data-testid="email-input"]').type(userData.email);
  cy.get('[data-testid="full-name-input"]').type(userData.fullName);
  
  // Select role
  if (userData.role === 'ADMIN') {
    cy.get('[data-testid="role-admin"]').check();
  } else {
    cy.get('[data-testid="role-user"]').check();
  }
  
  // Fill optional fields if provided
  if (userData.department) {
    cy.get('[data-testid="department-input"]').type(userData.department);
  }
  
  if (userData.position) {
    cy.get('[data-testid="position-input"]').type(userData.position);
  }
  
  // Select password option
  if (userData.generatePassword) {
    cy.get('[data-testid="generate-password-option"]').check();
  } else {
    cy.get('[data-testid="set-password-option"]').check();
    cy.get('[data-testid="password-input"]').type(userData.password);
    cy.get('[data-testid="confirm-password-input"]').type(userData.password);
  }
  
  // Submit form
  cy.intercept('POST', '/api/admin/users').as('createUser');
  cy.get('[data-testid="save-user-button"]').click();
  
  // Wait for user creation and return the user data
  return cy.wait('@createUser').then(interception => {
    expect(interception.response.statusCode).to.eq(201);
    return interception.response.body;
  });
});

/**
 * Command to edit a user
 */
Cypress.Commands.add('editUser', (email, updatedData) => {
  // Navigate to user management
  cy.navigateToUserManagement();
  
  // Find user by email and click edit
  cy.contains(email).parent('tr').within(() => {
    cy.get('[data-testid="edit-user-button"]').click();
  });
  
  // Clear existing data and enter new values
  if (updatedData.fullName) {
    cy.get('[data-testid="full-name-input"]').clear().type(updatedData.fullName);
  }
  
  if (updatedData.role) {
    if (updatedData.role === 'ADMIN') {
      cy.get('[data-testid="role-admin"]').check();
    } else {
      cy.get('[data-testid="role-user"]').check();
    }
  }
  
  if (updatedData.department) {
    cy.get('[data-testid="department-input"]').clear().type(updatedData.department);
  }
  
  if (updatedData.position) {
    cy.get('[data-testid="position-input"]').clear().type(updatedData.position);
  }
  
  // Submit form
  cy.intercept('PUT', '/api/admin/users/*').as('updateUser');
  cy.get('[data-testid="save-user-button"]').click();
  
  // Wait for user update
  return cy.wait('@updateUser');
});

/**
 * Command to change user status
 */
Cypress.Commands.add('changeUserStatus', (email, status) => {
  // Navigate to user management
  cy.navigateToUserManagement();
  
  // Find user by email
  cy.contains(email).parent('tr').within(() => {
    if (status === 'active') {
      cy.get('[data-testid="activate-user-button"]').click();
    } else if (status === 'inactive') {
      cy.get('[data-testid="deactivate-user-button"]').click();
    } else if (status === 'locked') {
      cy.get('[data-testid="lock-user-button"]').click();
    } else if (status === 'unlocked') {
      cy.get('[data-testid="unlock-user-button"]').click();
    }
  });
  
  // Confirm status change
  cy.get('[data-testid="confirm-status-change"]').should('be.visible');
  cy.get('[data-testid="confirm-button"]').click();
  
  // Verify status change
  cy.contains(email).parent('tr').within(() => {
    cy.get('[data-testid="user-status"]').should('contain', status.toUpperCase());
  });
});

/**
 * Command to view user details
 */
Cypress.Commands.add('viewUserDetails', (email) => {
  // Navigate to user management
  cy.navigateToUserManagement();
  
  // Find user by email and click view details
  cy.contains(email).parent('tr').within(() => {
    cy.get('[data-testid="view-user-details-button"]').click();
  });
  
  // Verify user details page
  cy.url().should('include', '/admin/users/');
  cy.get('[data-testid="user-details-page"]').should('be.visible');
  cy.get('[data-testid="user-email"]').should('contain', email);
});

/**
 * Command to view user login history
 */
Cypress.Commands.add('viewUserLoginHistory', (email) => {
  // Navigate to user details
  cy.viewUserDetails(email);
  
  // Go to login history tab
  cy.get('[data-testid="login-history-tab"]').click();
  
  // Verify login history table
  cy.get('[data-testid="login-history-table"]').should('be.visible');
});

/**
 * Command to filter users
 */
Cypress.Commands.add('filterUsers', (filterParams) => {
  // Navigate to user management
  cy.navigateToUserManagement();
  
  // Apply filters
  if (filterParams.role) {
    cy.get('[data-testid="role-filter"]').select(filterParams.role);
  }
  
  if (filterParams.status) {
    cy.get('[data-testid="status-filter"]').select(filterParams.status);
  }
  
  if (filterParams.search) {
    cy.get('[data-testid="search-input"]').type(filterParams.search);
  }
  
  // Apply filters
  cy.get('[data-testid="apply-filters-button"]').click();
  
  // Return filtered users table for assertions
  return cy.get('[data-testid="users-table"]');
});

/**
 * Command to navigate to monitoring dashboard
 */
Cypress.Commands.add('navigateToMonitoringDashboard', () => {
  // Navigate to admin monitoring dashboard
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="monitoring-link"]').click();
  
  // Verify monitoring dashboard page
  cy.url().should('include', '/admin/monitoring');
  cy.get('[data-testid="monitoring-dashboard-title"]').should('be.visible');
});

/**
 * Command to select a specific monitoring tab
 */
Cypress.Commands.add('selectMonitoringTab', (tabName) => {
  // Map tab names to indices
  const tabIndices = {
    'configuration': 0,
    'resources': 1,
    'metrics': 2,
    'errorLogs': 3,
    'documentation': 4
  };
  
  // Get tab index
  const tabIndex = tabIndices[tabName.toLowerCase()];
  
  if (tabIndex === undefined) {
    throw new Error(`Invalid tab name: ${tabName}. Available tabs: ${Object.keys(tabIndices).join(', ')}`);
  }
  
  // Click the tab
  cy.get(`[data-testid="monitoring-tab-${tabIndex}"]`).click();
  
  // Verify tab is selected
  cy.get(`[data-testid="monitoring-tab-${tabIndex}"]`).should('have.attr', 'aria-selected', 'true');
});

/**
 * Command to filter error logs
 */
Cypress.Commands.add('filterErrorLogs', (filterParams) => {
  // Make sure we're on the error logs tab
  cy.selectMonitoringTab('errorLogs');
  
  // Show filters if hidden
  cy.get('body').then($body => {
    if (!$body.find('[data-testid="error-log-filters"]').is(':visible')) {
      cy.get('[data-testid="show-filters-button"]').click();
    }
  });
  
  // Apply filters
  if (filterParams.severity) {
    cy.get('[data-testid="severity-filter"]').select(filterParams.severity);
  }
  
  if (filterParams.component) {
    cy.get('[data-testid="component-filter"]').select(filterParams.component);
  }
  
  if (filterParams.dateRange) {
    cy.get('[data-testid="date-range-filter"]').select(filterParams.dateRange);
  }
  
  if (filterParams.search) {
    cy.get('[data-testid="search-input"]').type(filterParams.search);
  }
  
  // Apply filters
  cy.get('[data-testid="apply-filters-button"]').click();
  
  // Return filtered logs table for assertions
  return cy.get('[data-testid="error-log-table"]');
});

/**
 * Command to export error logs
 */
Cypress.Commands.add('exportErrorLogs', (format) => {
  // Make sure we're on the error logs tab
  cy.selectMonitoringTab('errorLogs');
  
  // Select export format
  cy.get('[data-testid="export-format-select"]').select(format);
  
  // Click export button
  cy.get('[data-testid="export-button"]').click();
});

/**
 * Command to view error log details
 */
Cypress.Commands.add('viewErrorLogDetails', (logId) => {
  // Make sure we're on the error logs tab
  cy.selectMonitoringTab('errorLogs');
  
  // Find log by ID and click view details
  cy.contains(logId).closest('tr').find('[data-testid="view-details-button"]').click();
  
  // Verify details modal is displayed
  cy.get('[data-testid="error-detail-modal"]').should('be.visible');
});

/**
 * Command to configure Azure monitoring
 */
Cypress.Commands.add('configureAzureMonitoring', (configParams) => {
  // Make sure we're on the configuration tab
  cy.selectMonitoringTab('configuration');
  
  // Fill out form
  if (configParams.tenantId) {
    cy.get('[data-testid="tenant-id-input"]').clear().type(configParams.tenantId);
  }
  
  if (configParams.clientId) {
    cy.get('[data-testid="client-id-input"]').clear().type(configParams.clientId);
  }
  
  if (configParams.clientSecret) {
    cy.get('[data-testid="client-secret-input"]').clear().type(configParams.clientSecret);
  }
  
  if (configParams.subscriptionId) {
    cy.get('[data-testid="subscription-id-input"]').clear().type(configParams.subscriptionId);
  }
  
  // Save configuration
  cy.get('[data-testid="save-azure-config-button"]').click();
});

/**
 * Command to refresh monitoring data
 */
Cypress.Commands.add('refreshMonitoringData', (section) => {
  // Map section names to tab indices
  const sectionToTab = {
    'resources': 1,
    'metrics': 2,
    'errorLogs': 3,
    'documentation': 4
  };
  
  // Navigate to the correct tab
  if (section in sectionToTab) {
    cy.selectMonitoringTab(section);
  }
  
  // Click refresh button
  cy.get('[data-testid="refresh-button"]').click();
});

/**
 * Command to view resource health details
 */
Cypress.Commands.add('viewResourceHealthDetails', (resourceId) => {
  // Make sure we're on the resources tab
  cy.selectMonitoringTab('resources');
  
  // Find resource by ID and click view details
  cy.contains(resourceId).closest('[data-testid="resource-card"]').find('[data-testid="view-resource-details"]').click();
  
  // Verify details modal is displayed
  cy.get('[data-testid="resource-detail-modal"]').should('be.visible');
});

/**
 * Command to verify documentation analytics
 */
Cypress.Commands.add('verifyDocumentationAnalytics', () => {
  // Make sure we're on the documentation tab
  cy.selectMonitoringTab('documentation');
  
  // Verify key analytics components are displayed
  cy.get('[data-testid="doc-analytics-overview"]').should('be.visible');
  cy.get('[data-testid="total-views"]').should('be.visible');
  cy.get('[data-testid="unique-users"]').should('be.visible');
  cy.get('[data-testid="search-terms-table"]').should('be.visible');
  cy.get('[data-testid="page-engagement-table"]').should('be.visible');
});

/**
 * Command to navigate to email configuration page
 */
Cypress.Commands.add('navigateToEmailConfig', () => {
  // Navigate to admin menu
  cy.get('[data-testid="admin-menu"]').click();
  cy.get('[data-testid="email-config-link"]').click();
  
  // Verify navigation to email configuration page
  cy.url().should('include', '/admin/email-config');
  cy.contains('Email Configuration').should('be.visible');
});

/**
 * Command to configure Office 365 email provider
 */
Cypress.Commands.add('configureOffice365Email', (configData) => {
  // Navigate to email config if not already there
  cy.url().then(url => {
    if (!url.includes('/admin/email-config')) {
      cy.navigateToEmailConfig();
    }
  });
  
  // Select Office 365 provider
  cy.get('[name="emailProvider"][value="office365"]').check();
  
  // Fill out provider settings
  cy.get('[name="clientId"]').clear().type(configData.clientId);
  cy.get('[name="clientSecret"]').clear().type(configData.clientSecret);
  cy.get('[name="tenantId"]').clear().type(configData.tenantId);
  
  // Switch to general settings tab
  cy.contains('General Settings').click();
  
  // Fill out general settings
  cy.get('[name="fromEmail"]').clear().type(configData.fromEmail);
  cy.get('[name="fromName"]').clear().type(configData.fromName);
  
  if (configData.replyToEmail) {
    cy.get('[name="replyToEmail"]').clear().type(configData.replyToEmail);
  }
  
  // Save configuration
  cy.contains('button', 'Save Configuration').click();
});

/**
 * Command to configure SMTP email provider
 */
Cypress.Commands.add('configureSmtpEmail', (configData) => {
  // Navigate to email config if not already there
  cy.url().then(url => {
    if (!url.includes('/admin/email-config')) {
      cy.navigateToEmailConfig();
    }
  });
  
  // Select SMTP provider
  cy.get('[name="emailProvider"][value="smtp"]').check();
  
  // Fill out SMTP settings
  cy.get('[name="smtpHost"]').clear().type(configData.smtpHost);
  cy.get('[name="smtpPort"]').clear().type(configData.smtpPort);
  cy.get('[name="smtpUsername"]').clear().type(configData.smtpUsername);
  cy.get('[name="smtpPassword"]').clear().type(configData.smtpPassword);
  
  // Set secure connection based on config
  if (configData.smtpSecure) {
    cy.get('[name="smtpSecure"]').check();
  } else {
    cy.get('[name="smtpSecure"]').uncheck();
  }
  
  // Switch to general settings tab
  cy.contains('General Settings').click();
  
  // Fill out general settings
  cy.get('[name="fromEmail"]').clear().type(configData.fromEmail);
  cy.get('[name="fromName"]').clear().type(configData.fromName);
  
  if (configData.replyToEmail) {
    cy.get('[name="replyToEmail"]').clear().type(configData.replyToEmail);
  }
  
  // Save configuration
  cy.contains('button', 'Save Configuration').click();
});

/**
 * Command to switch between email providers
 */
Cypress.Commands.add('switchEmailProvider', (provider) => {
  if (provider === 'office365' || provider === 'smtp') {
    cy.get(`[name="emailProvider"][value="${provider}"]`).check();
    cy.get(`[name="emailProvider"][value="${provider}"]`).should('be.checked');
  } else {
    throw new Error(`Invalid provider: ${provider}. Must be "office365" or "smtp".`);
  }
});

/**
 * Command to send test email
 */
Cypress.Commands.add('sendTestEmail', (recipient) => {
  // Click test email button
  cy.contains('button', 'Test Email').click();
  
  // Verify dialog is open
  cy.contains('Send Test Email').should('be.visible');
  
  // Enter recipient and send
  cy.get('#testEmailRecipient').clear().type(recipient);
  cy.contains('button', 'Send Test').click();
});

/**
 * Command to verify email configuration
 */
Cypress.Commands.add('verifyEmailConfig', (expectedConfig) => {
  // Intercept configuration refresh
  cy.intercept('GET', '/api/admin/email/config').as('getConfig');
  
  // Refresh configuration
  cy.contains('button', 'Reset').click();
  cy.wait('@getConfig');
  
  // Verify provider selection
  cy.get(`[name="emailProvider"][value="${expectedConfig.provider}"]`).should('be.checked');
  
  // Verify provider-specific fields
  if (expectedConfig.provider === 'office365') {
    cy.get('[name="clientId"]').should('have.value', expectedConfig.clientId);
    cy.get('[name="tenantId"]').should('have.value', expectedConfig.tenantId);
  } else if (expectedConfig.provider === 'smtp') {
    cy.get('[name="smtpHost"]').should('have.value', expectedConfig.smtpHost);
    cy.get('[name="smtpPort"]').should('have.value', expectedConfig.smtpPort);
    cy.get('[name="smtpUsername"]').should('have.value', expectedConfig.smtpUsername);
  }
  
  // Verify general settings
  cy.contains('General Settings').click();
  cy.get('[name="fromEmail"]').should('have.value', expectedConfig.fromEmail);
  cy.get('[name="fromName"]').should('have.value', expectedConfig.fromName);
  
  if (expectedConfig.replyToEmail) {
    cy.get('[name="replyToEmail"]').should('have.value', expectedConfig.replyToEmail);
  }
});

/**
 * Command to toggle password visibility
 */
Cypress.Commands.add('togglePasswordVisibility', (fieldName) => {
  const fieldNameMap = {
    'clientSecret': 0,
    'smtpPassword': 0
  };
  
  if (!(fieldName in fieldNameMap)) {
    throw new Error(`Invalid field name: ${fieldName}. Valid values are "clientSecret" or "smtpPassword".`);
  }
  
  // Get the field index
  const index = fieldNameMap[fieldName];
  
  // Click the visibility toggle
  cy.get('[aria-label="toggle password visibility"]').eq(index).click();
});