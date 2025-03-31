// tenant-management.cy.js
// -----------------------------------------------------------------------------
// E2E tests for the Tenant Management functionality

/// <reference types="cypress" />
/// <reference types="cypress-axe" />

describe('Tenant Management', () => {
  // Load fixtures before each test
  beforeEach(() => {
    // Load fixtures
    cy.fixture('tenants/tenants.json').as('tenantData');
    cy.fixture('tenants/tenant_users.json').as('tenantUserData');
    cy.fixture('tenants/tenant_resources.json').as('tenantResourceData');
    cy.fixture('tenants/tenant_settings.json').as('tenantSettingsData');
    
    // Login as admin
    cy.login('admin@example.com', 'Password123!');
    
    // Intercept tenant API calls
    cy.intercept('GET', '/api/admin/tenants', { fixture: 'tenants/tenants.json' }).as('getTenants');
    
    cy.intercept('POST', '/api/admin/tenants', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          ...req.body,
          id: `tenant-${Date.now()}`, // Generate unique ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }).as('createTenant');
    
    cy.intercept('PUT', '/api/admin/tenants/*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          ...req.body,
          id: req.url.split('/').pop(),
          updatedAt: new Date().toISOString()
        }
      });
    }).as('updateTenant');
    
    cy.intercept('DELETE', '/api/admin/tenants/*', { statusCode: 204 }).as('deleteTenant');
    
    // Intercept tenant status change
    cy.intercept('PUT', '/api/admin/tenants/*/status', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          id: req.url.split('/')[4], // Extract tenant ID from URL
          status: req.body.status,
          updatedAt: new Date().toISOString()
        }
      });
    }).as('updateTenantStatus');
    
    // Intercept tenant users API calls
    cy.intercept('GET', '/api/admin/tenants/*/users', (req) => {
      const tenantId = req.url.split('/')[4]; // Extract tenant ID from URL
      cy.get('@tenantUserData').then((userData) => {
        const filteredUsers = userData.filter(user => user.tenantId === tenantId);
        req.reply(filteredUsers);
      });
    }).as('getTenantUsers');
    
    cy.intercept('POST', '/api/admin/tenants/*/users', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: `user-${Date.now()}`, // Generate unique ID
          tenantId: req.url.split('/')[4], // Extract tenant ID from URL
          email: req.body.email,
          firstName: req.body.firstName || 'New',
          lastName: req.body.lastName || 'User',
          role: req.body.role,
          status: 'Pending',
          createdAt: new Date().toISOString()
        }
      });
    }).as('addTenantUser');
    
    // Intercept tenant resources API calls
    cy.intercept('GET', '/api/admin/tenants/*/resources', (req) => {
      const tenantId = req.url.split('/')[4]; // Extract tenant ID from URL
      cy.get('@tenantResourceData').then((resourceData) => {
        const filteredResources = resourceData.filter(resource => resource.tenantId === tenantId);
        req.reply(filteredResources);
      });
    }).as('getTenantResources');
    
    cy.intercept('POST', '/api/admin/tenants/*/resources', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: `resource-${Date.now()}`, // Generate unique ID
          tenantId: req.url.split('/')[4], // Extract tenant ID from URL
          resourceId: req.body.resourceId,
          resourceName: req.body.resourceName,
          resourceType: req.body.resourceType,
          status: 'Connected',
          createdAt: new Date().toISOString()
        }
      });
    }).as('addTenantResource');
    
    // Intercept tenant settings API calls
    cy.intercept('GET', '/api/admin/tenants/*/settings', (req) => {
      const tenantId = req.url.split('/')[4]; // Extract tenant ID from URL
      cy.get('@tenantSettingsData').then((settingsData) => {
        const tenantSettings = settingsData.find(settings => settings.tenantId === tenantId);
        req.reply(tenantSettings || { tenantId, settings: {} });
      });
    }).as('getTenantSettings');
    
    // Intercept tenant context API calls
    cy.intercept('GET', '/api/tenants/current', (req) => {
      cy.get('@tenantData').then((tenants) => {
        // Default to first active tenant
        const activeTenant = tenants.find(tenant => tenant.status === 'Active');
        req.reply(activeTenant);
      });
    }).as('getCurrentTenant');
    
    cy.intercept('POST', '/api/tenants/switch', (req) => {
      cy.get('@tenantData').then((tenants) => {
        const selectedTenant = tenants.find(tenant => tenant.id === req.body.tenantId);
        req.reply({
          statusCode: 200,
          body: selectedTenant
        });
      });
    }).as('switchTenant');
    
    // Intercept resources by type for tenant resource association
    cy.intercept('GET', '/api/admin/resources*', (req) => {
      const params = new URLSearchParams(req.url.split('?')[1] || '');
      const resourceType = params.get('type');
      
      // Use the Azure resources fixture for convenience
      cy.fixture('azure/resources.json').then((resources) => {
        let filteredResources = [...resources];
        
        if (resourceType) {
          filteredResources = filteredResources.filter(res => res.type === resourceType);
        }
        
        req.reply(filteredResources);
      });
    }).as('getResourcesByType');
    
    // Navigate to tenant management
    cy.navigateToTenantManagement();
    cy.wait('@getTenants');
  });
  
  describe('Tenant Management Operations', () => {
    it('should display the list of tenants', () => {
      // Verify the tenant table is displayed
      cy.contains('Tenant Management').should('be.visible');
      cy.get('table').should('be.visible');
      
      // Verify each tenant is displayed
      cy.get('@tenantData').then((tenants) => {
        tenants.forEach(tenant => {
          cy.contains('td', tenant.name).should('be.visible');
          cy.contains('td', tenant.identifier).should('be.visible');
        });
      });
      
      // Check accessibility
      cy.checkTenantA11y('tenant list');
    });
    
    it('should create a new tenant', () => {
      // Create new tenant using command
      const newTenant = {
        name: 'Education Services',
        identifier: 'eduserv',
        primaryDomain: 'educationservices.example.com',
        industry: 'Education',
        tier: 'Professional',
        status: 'Active',
        description: 'Educational technology and services provider'
      };
      
      cy.createTenant(newTenant);
      cy.wait('@createTenant');
      
      // Verify new tenant appears in the list
      cy.contains('td', newTenant.name).should('be.visible');
      cy.contains('td', newTenant.identifier).should('be.visible');
      
      // Check accessibility
      cy.checkTenantA11y('after creating tenant');
    });
    
    it('should edit an existing tenant', () => {
      // Get the first tenant
      cy.get('@tenantData').then((tenants) => {
        const tenantToEdit = tenants[0];
        const updatedData = {
          name: `${tenantToEdit.name} - Updated`,
          description: 'Updated description for testing'
        };
        
        // Edit the tenant
        cy.editTenant(tenantToEdit.name, updatedData);
        cy.wait('@updateTenant');
        
        // Verify changes
        cy.contains('td', updatedData.name).should('be.visible');
      });
      
      // Check accessibility
      cy.checkTenantA11y('after editing tenant');
    });
    
    it('should delete a tenant', () => {
      // Get the last tenant
      cy.get('@tenantData').then((tenants) => {
        const tenantToDelete = tenants[tenants.length - 1];
        
        // Delete the tenant
        cy.deleteTenant(tenantToDelete.name);
        cy.wait('@deleteTenant');
        
        // Verify it's gone
        cy.contains('td', tenantToDelete.name).should('not.exist');
      });
      
      // Check accessibility
      cy.checkTenantA11y('after deleting tenant');
    });
    
    it('should change tenant status', () => {
      // Get an active tenant
      cy.get('@tenantData').then((tenants) => {
        const activeTenant = tenants.find(tenant => tenant.status === 'Active');
        
        // Change status to Inactive
        cy.changeTenantStatus(activeTenant.name, 'Inactive');
        cy.wait('@updateTenantStatus');
        
        // Verify status changed
        cy.contains('td', activeTenant.name)
          .parents('tr')
          .contains('Inactive')
          .should('be.visible');
      });
      
      // Check accessibility
      cy.checkTenantA11y('after changing status');
    });
  });
  
  describe('Tenant Users Management', () => {
    beforeEach(() => {
      // Get the first tenant 
      cy.get('@tenantData').then((tenants) => {
        const firstTenant = tenants[0];
        
        // Navigate to tenant users
        cy.navigateToTenantDetail(firstTenant.name);
        cy.contains('button', 'Users').click();
        cy.wait('@getTenantUsers');
      });
    });
    
    it('should display tenant users', () => {
      // Get the first tenant
      cy.get('@tenantData').then((tenants) => {
        const firstTenant = tenants[0];
        
        // Get users for this tenant
        cy.get('@tenantUserData').then((users) => {
          const tenantUsers = users.filter(user => user.tenantId === firstTenant.id);
          
          // Verify each user is displayed
          tenantUsers.forEach(user => {
            cy.contains('td', user.email).should('be.visible');
            cy.contains('td', user.role).should('be.visible');
          });
          
          // Verify user count
          cy.get('table.users-table tbody tr').should('have.length', tenantUsers.length);
        });
      });
      
      // Check accessibility
      cy.checkTenantA11y('tenant users list');
    });
    
    it('should add a user to tenant', () => {
      // Add user to tenant
      const newUser = {
        email: 'newuser@example.com',
        role: 'User'
      };
      
      // Click add user button
      cy.contains('button', 'Add User').click();
      
      // Fill in the form
      cy.get('input[name="email"]').type(newUser.email);
      cy.get('select[name="role"]').select(newUser.role);
      
      // Submit the form
      cy.contains('button', 'Add').click();
      cy.wait('@addTenantUser');
      
      // Verify user added
      cy.contains('User added to tenant successfully').should('be.visible');
      cy.contains('td', newUser.email).should('be.visible');
      
      // Check accessibility
      cy.checkTenantA11y('after adding user');
    });
  });
  
  describe('Tenant Resources Management', () => {
    beforeEach(() => {
      // Get the first tenant 
      cy.get('@tenantData').then((tenants) => {
        const firstTenant = tenants[0];
        
        // Navigate to tenant resources
        cy.navigateToTenantDetail(firstTenant.name);
        cy.contains('button', 'Resources').click();
        cy.wait('@getTenantResources');
      });
    });
    
    it('should display tenant resources', () => {
      // Get the first tenant
      cy.get('@tenantData').then((tenants) => {
        const firstTenant = tenants[0];
        
        // Get resources for this tenant
        cy.get('@tenantResourceData').then((resources) => {
          const tenantResources = resources.filter(resource => resource.tenantId === firstTenant.id);
          
          // Verify each resource is displayed
          tenantResources.forEach(resource => {
            cy.contains('td', resource.resourceName).should('be.visible');
            cy.contains('td', resource.resourceType).should('be.visible');
          });
          
          // Verify resource count
          cy.get('table.resources-table tbody tr').should('have.length', tenantResources.length);
        });
      });
      
      // Check accessibility
      cy.checkTenantA11y('tenant resources list');
    });
    
    it('should associate a resource with tenant', () => {
      // Intercept resource requests
      cy.intercept('GET', '/api/admin/resources*', { fixture: 'azure/resources.json' }).as('getResources');
      
      // First available resource type
      const resourceData = {
        type: 'Microsoft.Web/sites',
        name: 'tapdevappservice'
      };
      
      // Click add resource button
      cy.contains('button', 'Add Resource').click();
      
      // Fill in the form
      cy.get('select[name="resourceType"]').select(resourceData.type);
      cy.wait('@getResourcesByType');
      
      cy.get('select[name="resourceId"]').select(resourceData.name);
      
      // Submit the form
      cy.contains('button', 'Add').click();
      cy.wait('@addTenantResource');
      
      // Verify resource added
      cy.contains('Resource associated successfully').should('be.visible');
      cy.contains('td', resourceData.name).should('be.visible');
      
      // Check accessibility
      cy.checkTenantA11y('after adding resource');
    });
  });
  
  describe('Tenant Context Switching', () => {
    beforeEach(() => {
      // Navigate to home page where tenant context is used
      cy.contains('a', 'Home').click();
      cy.wait('@getCurrentTenant');
    });
    
    it('should display current tenant', () => {
      // Verify current tenant is displayed
      cy.get('@tenantData').then((tenants) => {
        const activeTenant = tenants.find(tenant => tenant.status === 'Active');
        cy.get('[aria-label="Current tenant"]').should('contain', activeTenant.name);
      });
    });
    
    it('should switch between tenants', () => {
      // Get active tenants
      cy.get('@tenantData').then((tenants) => {
        const activeTenants = tenants.filter(tenant => tenant.status === 'Active');
        
        if (activeTenants.length > 1) {
          // Get a different tenant than the current one
          const currentTenant = activeTenants[0];
          const targetTenant = activeTenants.find(tenant => tenant.id !== currentTenant.id);
          
          // Switch to the target tenant
          cy.selectTenant(targetTenant.name);
          cy.wait('@switchTenant');
          
          // Verify current tenant changed
          cy.get('[aria-label="Current tenant"]').should('contain', targetTenant.name);
          
          // Verify data context switched
          cy.contains('Viewing data for').should('contain', targetTenant.name);
        }
      });
      
      // Check accessibility
      cy.checkTenantA11y('after switching tenant');
    });
  });
  
  describe('Tenant Filtering and Searching', () => {
    it('should filter tenants by status', () => {
      // Filter by Inactive status
      cy.filterTenantsByStatus('Inactive');
      
      // Verify only inactive tenants are shown
      cy.get('@tenantData').then((tenants) => {
        const inactiveTenants = tenants.filter(tenant => tenant.status === 'Inactive');
        cy.get('table tbody tr').should('have.length', inactiveTenants.length);
        
        // Check that an active tenant is not shown
        const activeTenant = tenants.find(tenant => tenant.status === 'Active');
        cy.contains('td', activeTenant.name).should('not.exist');
      });
    });
    
    it('should search for tenants', () => {
      // Get a distinctive part of a tenant name
      cy.get('@tenantData').then((tenants) => {
        const firstTenant = tenants[0];
        const searchTerm = firstTenant.name.split(' ')[0]; // First word of name
        
        // Search for this term
        cy.searchTenants(searchTerm);
        
        // Get all tenants matching the search term
        const matchingTenants = tenants.filter(tenant => 
          tenant.name.includes(searchTerm) || 
          tenant.identifier.includes(searchTerm) ||
          tenant.primaryDomain.includes(searchTerm)
        );
        
        // Verify matching count
        cy.get('table tbody tr').should('have.length', matchingTenants.length);
        
        // Verify a matching tenant is shown
        cy.contains('td', firstTenant.name).should('be.visible');
        
        // Find a non-matching tenant if any
        const nonMatchingTenant = tenants.find(tenant => 
          !tenant.name.includes(searchTerm) && 
          !tenant.identifier.includes(searchTerm) &&
          !tenant.primaryDomain.includes(searchTerm)
        );
        
        if (nonMatchingTenant) {
          // Verify non-matching tenant is not shown
          cy.contains('td', nonMatchingTenant.name).should('not.exist');
        }
      });
    });
  });
});