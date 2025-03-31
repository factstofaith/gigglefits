// cypress/e2e/flows/admin-user-management.cy.js

/**
 * End-to-End Test for Admin User Management
 * 
 * This test verifies the administrative user management functionality:
 * 1. Viewing and filtering user lists
 * 2. Creating and managing user accounts
 * 3. Modifying user roles and permissions
 * 4. Managing user account status
 * 5. Viewing user activity
 */
describe('Admin User Management Flow', () => {
  // Test data - admin user
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!',
    fullName: 'Admin User'
  };
  
  // Test data - users to be managed
  const testUsers = [
    {
      email: 'test.user1@example.test',
      password: 'Test1234!',
      fullName: 'Test User One',
      role: 'USER',
      department: 'Sales',
      position: 'Sales Representative'
    },
    {
      email: 'test.user2@example.test',
      password: 'Test1234!',
      fullName: 'Test User Two',
      role: 'USER',
      department: 'Marketing',
      position: 'Marketing Specialist'
    }
  ];
  
  before(() => {
    // Reset test database and create test users
    cy.request('POST', '/api/test/reset-db', { scope: 'admin_tests' });
    
    // Create test users
    testUsers.forEach(user => {
      cy.request('POST', '/api/test/create-user', {
        email: user.email,
        password: user.password,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        position: user.position,
        mfaEnabled: false
      });
    });
    
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification for admin
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
  });
  
  it('displays and filters user list', () => {
    // Navigate to user management page
    cy.navigateToUserManagement();
    
    // Verify user table is displayed with test users
    cy.get('[data-testid="users-table"]').should('be.visible');
    testUsers.forEach(user => {
      cy.contains(user.email).should('be.visible');
    });
    
    // Verify pagination controls
    cy.get('[data-testid="pagination-controls"]').should('be.visible');
    
    // Test filtering by role
    cy.filterUsers({ role: 'USER' }).then($table => {
      // All rows should be regular users
      cy.wrap($table).find('tr').each($row => {
        cy.wrap($row).find('[data-testid="user-role"]').should('contain', 'USER');
      });
    });
    
    // Test filtering by department
    cy.filterUsers({ search: 'Sales' }).then($table => {
      // Should only show Sales department users
      cy.wrap($table).find('tr').should('have.length', 1);
      cy.wrap($table).find('tr').first().should('contain', 'Sales');
    });
    
    // Test filtering by status
    cy.intercept('GET', '/api/admin/users*').as('getUsersRequest');
    
    // Change status of one user to inactive
    cy.changeUserStatus(testUsers[1].email, 'inactive');
    
    // Filter by active status
    cy.filterUsers({ status: 'ACTIVE' }).then($table => {
      cy.wrap($table).find('tr').should('have.length', 1);
      cy.wrap($table).find('tr').first().should('contain', testUsers[0].email);
    });
    
    // Filter by inactive status
    cy.filterUsers({ status: 'INACTIVE' }).then($table => {
      cy.wrap($table).find('tr').should('have.length', 1);
      cy.wrap($table).find('tr').first().should('contain', testUsers[1].email);
    });
    
    // Clear filters
    cy.get('[data-testid="clear-filters-button"]').click();
    cy.get('[data-testid="users-table"]').find('tr').should('have.length.at.least', 2);
    
    // Test search by email
    cy.filterUsers({ search: testUsers[0].email }).then($table => {
      cy.wrap($table).find('tr').should('have.length', 1);
      cy.wrap($table).find('tr').first().should('contain', testUsers[0].email);
    });
    
    // Test search by name
    cy.filterUsers({ search: testUsers[0].fullName }).then($table => {
      cy.wrap($table).find('tr').should('have.length', 1);
      cy.wrap($table).find('tr').first().should('contain', testUsers[0].fullName);
    });
    
    // Clear filters again
    cy.get('[data-testid="clear-filters-button"]').click();
  });
  
  it('creates new user accounts', () => {
    // Define a new user to create
    const newUser = {
      email: 'new.admin.user@example.test',
      fullName: 'New Admin User',
      role: 'ADMIN',
      department: 'IT',
      position: 'System Administrator',
      password: 'NewAdmin1234!',
      generatePassword: false
    };
    
    // Intercept the email notification API call
    cy.intercept('POST', '/api/admin/notifications/email').as('emailNotification');
    
    // Create the user using our custom command
    cy.createUser(newUser).then(createdUser => {
      // Verify the user was created successfully
      expect(createdUser).to.have.property('id');
      expect(createdUser.email).to.eq(newUser.email);
      
      // Verify success message
      cy.get('[data-testid="notification-toast"]').should('contain', 'User created successfully');
      
      // Verify user appears in the user list
      cy.navigateToUserManagement();
      cy.contains(newUser.email).should('be.visible');
      
      // Verify user has correct role
      cy.contains(newUser.email).parent('tr').within(() => {
        cy.get('[data-testid="user-role"]').should('contain', 'ADMIN');
      });
      
      // Verify notification was sent to the user
      cy.wait('@emailNotification').then(interception => {
        expect(interception.request.body.recipient).to.eq(newUser.email);
        expect(interception.request.body.template).to.eq('ACCOUNT_CREATION');
      });
    });
    
    // Test creating a user with generated password
    const generatedPasswordUser = {
      email: 'generated.password.user@example.test',
      fullName: 'Generated Password User',
      role: 'USER',
      department: 'Finance',
      position: 'Accountant',
      generatePassword: true
    };
    
    // Create the user
    cy.createUser(generatedPasswordUser).then(createdUser => {
      // Verify success
      expect(createdUser).to.have.property('id');
      
      // Verify temporary password was generated and returned
      expect(createdUser).to.have.property('temporary_password');
      
      // Verify user appears in list
      cy.navigateToUserManagement();
      cy.contains(generatedPasswordUser.email).should('be.visible');
      
      // Verify appropriate email notification was sent
      cy.wait('@emailNotification').then(interception => {
        expect(interception.request.body.recipient).to.eq(generatedPasswordUser.email);
        expect(interception.request.body.template).to.eq('ACCOUNT_CREATION_WITH_PASSWORD');
        expect(interception.request.body.data).to.have.property('temporary_password');
      });
      
      // Clean up: add these users to our test users array for deletion in the after hook
      testUsers.push(newUser);
      testUsers.push(generatedPasswordUser);
    });
  });
  
  it('modifies user roles and permissions', () => {
    // Select a user to modify
    const userToModify = testUsers[0];
    
    // Navigate to user management
    cy.navigateToUserManagement();
    
    // Intercept the user update API call
    cy.intercept('PUT', `/api/admin/users/*`).as('updateUser');
    
    // Find user and click edit
    cy.contains(userToModify.email).parent('tr').within(() => {
      cy.get('[data-testid="edit-user-button"]').click();
    });
    
    // Verify we're on the edit user page
    cy.url().should('include', '/admin/users/edit');
    cy.get('[data-testid="edit-user-page"]').should('be.visible');
    
    // Change the user's role to ADMIN
    cy.get('[data-testid="role-admin"]').check();
    
    // Change other details
    const updatedData = {
      fullName: `${userToModify.fullName} (Modified)`,
      department: 'Executive',
      position: 'CTO'
    };
    
    cy.get('[data-testid="full-name-input"]').clear().type(updatedData.fullName);
    cy.get('[data-testid="department-input"]').clear().type(updatedData.department);
    cy.get('[data-testid="position-input"]').clear().type(updatedData.position);
    
    // Save changes
    cy.get('[data-testid="save-user-button"]').click();
    
    // Wait for the update
    cy.wait('@updateUser').then(interception => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('role', 'ADMIN');
    });
    
    // Verify success notification
    cy.get('[data-testid="notification-toast"]').should('contain', 'User updated successfully');
    
    // Verify role change is reflected in user list
    cy.navigateToUserManagement();
    cy.contains(userToModify.email).parent('tr').within(() => {
      cy.get('[data-testid="user-role"]').should('contain', 'ADMIN');
    });
    
    // Verify other details were updated
    cy.contains(userToModify.email).parent('tr').within(() => {
      cy.get('[data-testid="user-name"]').should('contain', updatedData.fullName);
      cy.get('[data-testid="user-department"]').should('contain', updatedData.department);
    });
    
    // Test permission inheritance by checking access to admin-only features
    // First, let's logout
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Login as the user we just promoted to admin
    cy.intercept('POST', '/api/auth/login').as('login');
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(userToModify.email);
    cy.get('[data-testid="password-input"]').type(userToModify.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Skip MFA for test purpose (mocked in before hook)
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Check that this user now has access to admin menu
    cy.get('[data-testid="admin-menu"]').should('be.visible');
    cy.get('[data-testid="admin-menu"]').click();
    
    // Verify admin features access
    cy.get('[data-testid="users-link"]').should('be.visible');
    cy.get('[data-testid="users-link"]').click();
    
    // Verify they can see the user management page
    cy.url().should('include', '/admin/users');
    cy.get('[data-testid="user-management-title"]').should('be.visible');
    
    // Logout this user
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Login back as original admin for subsequent tests
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Skip MFA for test purpose
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
  });
  
  it('manages user account status', () => {
    // Select a user to manage status
    const userToManage = testUsers[1];
    
    // Navigate to user management
    cy.navigateToUserManagement();
    
    // Verify the user is currently active (default state)
    cy.contains(userToManage.email).parent('tr').within(() => {
      cy.get('[data-testid="user-status"]').should('contain', 'ACTIVE');
    });
    
    // Test deactivating the user
    cy.intercept('PUT', `/api/admin/users/*/status`).as('updateStatus');
    cy.changeUserStatus(userToManage.email, 'inactive');
    
    // Wait for the status update
    cy.wait('@updateStatus').then(interception => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('status', 'INACTIVE');
    });
    
    // Verify success notification
    cy.get('[data-testid="notification-toast"]').should('contain', 'User status updated');
    
    // Verify status change is reflected in user list
    cy.contains(userToManage.email).parent('tr').within(() => {
      cy.get('[data-testid="user-status"]').should('contain', 'INACTIVE');
    });
    
    // Test reactivating the user
    cy.changeUserStatus(userToManage.email, 'active');
    
    // Wait for the status update
    cy.wait('@updateStatus').then(interception => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('status', 'ACTIVE');
    });
    
    // Verify status change is reflected in user list
    cy.contains(userToManage.email).parent('tr').within(() => {
      cy.get('[data-testid="user-status"]').should('contain', 'ACTIVE');
    });
    
    // Test locking the user account (simulating failed login attempts)
    cy.contains(userToManage.email).parent('tr').within(() => {
      cy.get('[data-testid="lock-user-button"]').click();
    });
    
    // Confirm the lock action
    cy.get('[data-testid="confirm-status-change"]').should('be.visible');
    cy.get('[data-testid="confirm-button"]').click();
    
    // Wait for the status update
    cy.wait('@updateStatus').then(interception => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('status', 'LOCKED');
    });
    
    // Verify status change is reflected
    cy.contains(userToManage.email).parent('tr').within(() => {
      cy.get('[data-testid="user-status"]').should('contain', 'LOCKED');
    });
    
    // Test system behavior with locked account
    // Logout first
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Attempt to login as locked user
    cy.intercept('POST', '/api/auth/login').as('loginAttempt');
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(userToManage.email);
    cy.get('[data-testid="password-input"]').type(userToManage.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Verify login is rejected with appropriate message
    cy.wait('@loginAttempt').then(interception => {
      expect(interception.response.statusCode).to.eq(403);
      expect(interception.response.body).to.have.property('error', 'ACCOUNT_LOCKED');
    });
    
    cy.get('[data-testid="error-message"]').should('contain', 'Account locked');
    cy.get('[data-testid="contact-admin-message"]').should('be.visible');
    
    // Login back as admin
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Skip MFA for test purpose
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Navigate to user management
    cy.navigateToUserManagement();
    
    // Unlock the user account
    cy.changeUserStatus(userToManage.email, 'unlocked');
    
    // Wait for the status update
    cy.wait('@updateStatus').then(interception => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('status', 'ACTIVE');
    });
    
    // Verify status change is reflected
    cy.contains(userToManage.email).parent('tr').within(() => {
      cy.get('[data-testid="user-status"]').should('contain', 'ACTIVE');
    });
  });
  
  it('views user activity and audit logs', () => {
    // Select a user to view activity for
    const userToView = testUsers[0];
    
    // First, let's generate some login history for this user
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Login as test user
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(userToView.email);
    cy.get('[data-testid="password-input"]').type(userToView.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Verify successful login
    cy.url().should('include', '/dashboard');
    
    // Generate some activity by visiting different pages
    cy.get('[data-testid="integrations-link"]').click();
    cy.url().should('include', '/integrations');
    
    cy.get('[data-testid="settings-link"]').click();
    cy.url().should('include', '/settings');
    
    // Logout test user
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Login back as admin
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Intercept login history API call
    cy.intercept('GET', `/api/admin/users/*/login-history*`).as('loginHistory');
    
    // Intercept activity logs API call
    cy.intercept('GET', `/api/admin/users/*/activity*`).as('activityLogs');
    
    // Navigate to user details
    cy.viewUserDetails(userToView.email);
    
    // Verify user details page shows basic information
    cy.get('[data-testid="user-email"]').should('contain', userToView.email);
    cy.get('[data-testid="user-role"]').should('be.visible');
    cy.get('[data-testid="user-status"]').should('be.visible');
    cy.get('[data-testid="user-created-at"]').should('be.visible');
    
    // View login history
    cy.viewUserLoginHistory(userToView.email);
    
    // Wait for login history data
    cy.wait('@loginHistory');
    
    // Verify login history table is populated
    cy.get('[data-testid="login-history-table"]').should('be.visible');
    cy.get('[data-testid="login-history-table"]').find('tr').should('have.length.at.least', 1);
    
    // Verify the most recent login entry (from our test login)
    cy.get('[data-testid="login-history-table"]').find('tr').first().within(() => {
      cy.get('[data-testid="login-status"]').should('contain', 'SUCCESS');
      cy.get('[data-testid="login-date"]').should('be.visible');
      cy.get('[data-testid="login-ip"]').should('be.visible');
    });
    
    // Test filtering login history by status
    cy.get('[data-testid="status-filter"]').select('SUCCESS');
    cy.get('[data-testid="apply-filters-button"]').click();
    
    // Wait for filtered data
    cy.wait('@loginHistory');
    
    // Verify filter works
    cy.get('[data-testid="login-history-table"]').find('tr').each($row => {
      cy.wrap($row).find('[data-testid="login-status"]').should('contain', 'SUCCESS');
    });
    
    // View activity logs
    cy.get('[data-testid="activity-logs-tab"]').click();
    
    // Wait for activity logs data
    cy.wait('@activityLogs');
    
    // Verify activity logs table is populated
    cy.get('[data-testid="activity-logs-table"]').should('be.visible');
    cy.get('[data-testid="activity-logs-table"]').find('tr').should('have.length.at.least', 1);
    
    // Verify recent activities are recorded (page visits from our test)
    cy.get('[data-testid="activity-logs-table"]').find('tr').should('contain', 'Page View');
    cy.get('[data-testid="activity-logs-table"]').find('tr').should('contain', '/settings');
    cy.get('[data-testid="activity-logs-table"]').find('tr').should('contain', '/integrations');
    
    // Test activity log filtering by action type
    cy.get('[data-testid="action-type-filter"]').select('PAGE_VIEW');
    cy.get('[data-testid="apply-filters-button"]').click();
    
    // Wait for filtered data
    cy.wait('@activityLogs');
    
    // Verify filter works
    cy.get('[data-testid="activity-logs-table"]').find('tr').each($row => {
      cy.wrap($row).find('[data-testid="activity-action"]').should('contain', 'Page View');
    });
    
    // Test activity log filtering by date range
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    cy.get('[data-testid="date-from-input"]').type(today);
    cy.get('[data-testid="date-to-input"]').type(today);
    cy.get('[data-testid="apply-filters-button"]').click();
    
    // Wait for filtered data
    cy.wait('@activityLogs');
    
    // Verify activities are shown for today
    cy.get('[data-testid="activity-logs-table"]').find('tr').should('have.length.at.least', 1);
    
    // Test the export functionality
    cy.intercept('GET', `/api/admin/users/*/activity/export*`).as('exportActivity');
    cy.get('[data-testid="export-activity-button"]').click();
    
    // Verify export starts
    cy.wait('@exportActivity').then(interception => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.headers).to.have.property('content-type', 'text/csv');
    });
    
    // Verify success notification for export
    cy.get('[data-testid="notification-toast"]').should('contain', 'Activity log exported');
  });
  
  after(() => {
    // Clean up test data
    testUsers.forEach(user => {
      cy.request('DELETE', '/api/test/users', { email: user.email });
    });
    
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });
});