// azure-configuration.cy.js
// -----------------------------------------------------------------------------
// E2E tests for the Azure Configuration functionality

/// <reference types="cypress" />
/// <reference types="cypress-axe" />

describe('Azure Configuration', () => {
  // Load fixtures before each test
  beforeEach(() => {
    // Load fixtures
    cy.fixture('azure/configuration.json').as('configData');
    cy.fixture('azure/subscriptions.json').as('subscriptionData');
    cy.fixture('azure/resourceGroups.json').as('resourceGroupData');
    cy.fixture('azure/resources.json').as('resourceData');
    
    // Login as admin
    cy.login('admin@example.com', 'Password123!');
    
    // Intercept Azure configuration API calls
    cy.intercept('GET', '/api/admin/azure/configuration', { fixture: 'azure/configuration.json' }).as('getConfiguration');
    
    cy.intercept('POST', '/api/admin/azure/configuration', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          ...req.body,
          id: 'config-004', // Assign a new ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }).as('createConfiguration');
    
    cy.intercept('PUT', '/api/admin/azure/configuration/*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          ...req.body,
          id: req.url.split('/').pop(),
          updatedAt: new Date().toISOString()
        }
      });
    }).as('updateConfiguration');
    
    cy.intercept('DELETE', '/api/admin/azure/configuration/*', { statusCode: 204 }).as('deleteConfiguration');
    
    // Intercept Azure subscription API calls
    cy.intercept('GET', '/api/admin/azure/subscriptions', { fixture: 'azure/subscriptions.json' }).as('getSubscriptions');
    
    // Intercept Azure resource group API calls
    cy.intercept('GET', '/api/admin/azure/resourceGroups*', (req) => {
      // Handle optional subscription filter
      const params = new URLSearchParams(req.url.split('?')[1] || '');
      const subscriptionId = params.get('subscriptionId');
      
      cy.get('@resourceGroupData').then((resourceGroups) => {
        if (subscriptionId) {
          const filtered = resourceGroups.filter(rg => rg.subscriptionId === subscriptionId);
          req.reply(filtered);
        } else {
          req.reply(resourceGroups);
        }
      });
    }).as('getResourceGroups');
    
    cy.intercept('POST', '/api/admin/azure/resourceGroups', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: `rg-${Date.now()}`,
          name: req.body.name,
          location: req.body.location,
          subscriptionId: req.body.subscriptionId,
          properties: {
            provisioningState: 'Succeeded'
          }
        }
      });
    }).as('createResourceGroup');
    
    // Intercept Azure resources API calls
    cy.intercept('GET', '/api/admin/azure/resources*', (req) => {
      // Handle optional resource group and type filters
      const params = new URLSearchParams(req.url.split('?')[1] || '');
      const resourceGroup = params.get('resourceGroup');
      const resourceType = params.get('resourceType');
      
      cy.get('@resourceData').then((resources) => {
        let filtered = [...resources];
        
        if (resourceGroup) {
          filtered = filtered.filter(res => res.resourceGroup === resourceGroup);
        }
        
        if (resourceType) {
          filtered = filtered.filter(res => res.type === resourceType);
        }
        
        req.reply(filtered);
      });
    }).as('getResources');
    
    // Intercept connection test
    cy.intercept('POST', '/api/admin/azure/validate', (req) => {
      // Simulate success or failure based on credentials
      const isValid = req.body.tenantId && req.body.clientId && req.body.clientSecret;
      
      if (isValid) {
        req.reply({
          statusCode: 200,
          body: { valid: true, message: 'Connection successful' }
        });
      } else {
        req.reply({
          statusCode: 400,
          body: { valid: false, message: 'Connection failed: Invalid credentials' }
        });
      }
    }).as('validateConnection');
    
    // Navigate to Azure configuration
    cy.navigateToAzureConfig();
    cy.wait('@getConfiguration');
  });
  
  describe('Azure Configuration Management', () => {
    it('should display the list of Azure configurations', () => {
      // Verify the configuration table is displayed
      cy.contains('Azure Configurations').should('be.visible');
      cy.get('table').should('be.visible');
      
      // Verify each configuration is displayed
      cy.get('@configData').then((configs) => {
        configs.forEach(config => {
          cy.contains('td', config.name).should('be.visible');
          cy.contains('td', config.tenantId).should('be.visible');
        });
      });
      
      // Check accessibility
      cy.checkAzureA11y('configuration list');
    });
    
    it('should create a new Azure configuration', () => {
      // Create new configuration using command
      const newConfig = {
        name: 'Staging Environment',
        tenantId: '44444444-4444-4444-4444-444444444444',
        clientId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        clientSecret: 'secret123!',
        description: 'Azure configuration for staging environment'
      };
      
      cy.createAzureConfig(newConfig);
      cy.wait('@createConfiguration');
      
      // Verify new configuration appears in the list
      cy.contains('td', newConfig.name).should('be.visible');
      
      // Check accessibility
      cy.checkAzureA11y('after creating configuration');
    });
    
    it('should edit an existing Azure configuration', () => {
      // Get the first configuration
      cy.get('@configData').then((configs) => {
        const configToEdit = configs[0];
        const updatedData = {
          name: `${configToEdit.name} - Updated`,
          description: 'Updated description for testing'
        };
        
        // Edit the configuration
        cy.editAzureConfig(configToEdit.name, updatedData);
        cy.wait('@updateConfiguration');
        
        // Verify changes
        cy.contains('td', updatedData.name).should('be.visible');
      });
      
      // Check accessibility
      cy.checkAzureA11y('after editing configuration');
    });
    
    it('should delete an Azure configuration', () => {
      // Get the last configuration
      cy.get('@configData').then((configs) => {
        const configToDelete = configs[configs.length - 1];
        
        // Delete the configuration
        cy.deleteAzureConfig(configToDelete.name);
        cy.wait('@deleteConfiguration');
        
        // Verify it's gone
        cy.contains('td', configToDelete.name).should('not.exist');
      });
      
      // Check accessibility
      cy.checkAzureA11y('after deleting configuration');
    });
    
    it('should test a valid Azure connection', () => {
      // Get a configuration to test
      cy.get('@configData').then((configs) => {
        const config = configs[0];
        
        // Find the configuration row
        cy.contains('td', config.name)
          .parents('tr')
          .within(() => {
            // Click the test connection button
            cy.get('[aria-label="Test connection"]').click();
          });
        
        cy.wait('@validateConnection');
        
        // Verify success
        cy.contains('Connection successful').should('be.visible');
      });
    });
  });
  
  describe('Azure Subscription Management', () => {
    beforeEach(() => {
      // Click the "Manage Subscriptions" tab or button
      cy.contains('Manage Subscriptions').click();
      cy.wait('@getSubscriptions');
    });
    
    it('should display the list of Azure subscriptions', () => {
      // Verify the subscription table is displayed
      cy.contains('Azure Subscriptions').should('be.visible');
      cy.get('table').should('be.visible');
      
      // Verify each subscription is displayed
      cy.get('@subscriptionData').then((subscriptions) => {
        subscriptions.forEach(subscription => {
          cy.contains('td', subscription.displayName).should('be.visible');
        });
      });
      
      // Check accessibility
      cy.checkAzureA11y('subscription list');
    });
    
    it('should select an Azure subscription', () => {
      // Get an active subscription
      cy.get('@subscriptionData').then((subscriptions) => {
        const activeSubscription = subscriptions.find(sub => sub.state === 'Enabled');
        
        // Intercept resource groups for this subscription
        cy.intercept('GET', `/api/admin/azure/resourceGroups?subscriptionId=${activeSubscription.subscriptionId}`, (req) => {
          cy.get('@resourceGroupData').then((resourceGroups) => {
            const filtered = resourceGroups.filter(rg => rg.subscriptionId === activeSubscription.subscriptionId);
            req.reply(filtered);
          });
        }).as('getSubscriptionResourceGroups');
        
        // Select this subscription
        cy.selectAzureSubscription(activeSubscription.subscriptionId);
        cy.wait('@getSubscriptionResourceGroups');
        
        // Verify resource groups loaded for this subscription
        cy.contains('Resource Groups for').should('contain', activeSubscription.displayName);
        
        // Verify only resource groups for this subscription are shown
        cy.get('@resourceGroupData').then((resourceGroups) => {
          const subGroups = resourceGroups.filter(rg => rg.subscriptionId === activeSubscription.subscriptionId);
          cy.get('table.resource-groups-table tbody tr').should('have.length', subGroups.length);
          
          // Verify a resource group from this subscription is shown
          if (subGroups.length > 0) {
            cy.contains('td', subGroups[0].name).should('be.visible');
          }
        });
      });
      
      // Check accessibility
      cy.checkAzureA11y('after selecting subscription');
    });
    
    it('should filter subscriptions by state', () => {
      // Click on the state filter dropdown
      cy.get('select[data-testid="subscription-state-filter"]').select('Enabled');
      
      // Verify only enabled subscriptions are shown
      cy.get('@subscriptionData').then((subscriptions) => {
        const enabledSubs = subscriptions.filter(sub => sub.state === 'Enabled');
        cy.get('table.subscriptions-table tbody tr').should('have.length', enabledSubs.length);
        
        // Verify a disabled subscription is not shown
        const disabledSub = subscriptions.find(sub => sub.state === 'Disabled');
        if (disabledSub) {
          cy.contains('td', disabledSub.displayName).should('not.exist');
        }
      });
    });
  });
  
  describe('Azure Resource Group Management', () => {
    beforeEach(() => {
      // Select a subscription first
      cy.contains('Manage Subscriptions').click();
      cy.wait('@getSubscriptions');
      
      cy.get('@subscriptionData').then((subscriptions) => {
        const activeSubscription = subscriptions.find(sub => sub.state === 'Enabled');
        cy.selectAzureSubscription(activeSubscription.subscriptionId);
        cy.wait('@getResourceGroups');
      });
    });
    
    it('should display resource groups for a subscription', () => {
      // Verify resource groups table is displayed
      cy.contains('Resource Groups').should('be.visible');
      cy.get('table.resource-groups-table').should('be.visible');
      
      // Verify resource groups for this subscription are displayed
      cy.get('@subscriptionData').then((subscriptions) => {
        const activeSubscription = subscriptions.find(sub => sub.state === 'Enabled');
        
        cy.get('@resourceGroupData').then((resourceGroups) => {
          const subGroups = resourceGroups.filter(rg => rg.subscriptionId === activeSubscription.subscriptionId);
          
          // Verify each resource group is displayed
          subGroups.forEach(group => {
            cy.contains('td', group.name).should('be.visible');
          });
          
          // Verify resource group count
          cy.get('table.resource-groups-table tbody tr').should('have.length', subGroups.length);
        });
      });
      
      // Check accessibility
      cy.checkAzureA11y('resource groups list');
    });
    
    it('should create a new resource group', () => {
      // Get active subscription
      cy.get('@subscriptionData').then((subscriptions) => {
        const activeSubscription = subscriptions.find(sub => sub.state === 'Enabled');
        
        // Create new resource group
        const newGroup = {
          name: `tap-test-${Date.now()}`,
          location: 'eastus'
        };
        
        cy.selectResourceGroup(newGroup.name, true, newGroup.location);
        cy.wait('@createResourceGroup');
        
        // Verify success message
        cy.contains(`Resource group ${newGroup.name} created successfully`).should('be.visible');
      });
      
      // Check accessibility
      cy.checkAzureA11y('after creating resource group');
    });
    
    it('should select an existing resource group', () => {
      // Get a resource group for the active subscription
      cy.get('@subscriptionData').then((subscriptions) => {
        const activeSubscription = subscriptions.find(sub => sub.state === 'Enabled');
        
        cy.get('@resourceGroupData').then((resourceGroups) => {
          const subGroups = resourceGroups.filter(rg => rg.subscriptionId === activeSubscription.subscriptionId);
          
          if (subGroups.length > 0) {
            const groupToSelect = subGroups[0];
            
            // Intercept resources for this resource group
            cy.intercept('GET', `/api/admin/azure/resources?resourceGroup=${groupToSelect.name}`, (req) => {
              cy.get('@resourceData').then((resources) => {
                const filtered = resources.filter(res => res.resourceGroup === groupToSelect.name);
                req.reply(filtered);
              });
            }).as('getGroupResources');
            
            // Select this resource group
            cy.selectResourceGroup(groupToSelect.name);
            cy.wait('@getGroupResources');
            
            // Verify resources loaded for this group
            cy.contains('Resources in').should('contain', groupToSelect.name);
          }
        });
      });
      
      // Check accessibility
      cy.checkAzureA11y('after selecting resource group');
    });
  });
  
  describe('Azure Resource Discovery', () => {
    beforeEach(() => {
      // Navigate to resource discovery tab
      cy.contains('Discover Resources').click();
      
      // Select a subscription and resource group first
      cy.get('@subscriptionData').then((subscriptions) => {
        const activeSubscription = subscriptions.find(sub => sub.state === 'Enabled');
        cy.selectAzureSubscription(activeSubscription.subscriptionId);
        
        cy.get('@resourceGroupData').then((resourceGroups) => {
          const subGroups = resourceGroups.filter(rg => rg.subscriptionId === activeSubscription.subscriptionId);
          if (subGroups.length > 0) {
            cy.selectResourceGroup(subGroups[0].name);
          }
        });
      });
    });
    
    it('should discover Azure resources', () => {
      // Discover storage resources
      const resourceTypes = ['Microsoft.Storage/storageAccounts'];
      cy.discoverAzureResources(resourceTypes);
      
      // Verify resources are displayed
      cy.get('@resourceData').then((resources) => {
        const storageResources = resources.filter(res => res.type === 'Microsoft.Storage/storageAccounts');
        
        // Verify each storage resource is displayed
        storageResources.forEach(resource => {
          cy.contains('td', resource.name).should('be.visible');
        });
      });
      
      // Check accessibility
      cy.checkAzureA11y('discovered resources');
    });
    
    it('should filter Azure resources by type', () => {
      // Discover all resources
      cy.discoverAzureResources([
        'Microsoft.Storage/storageAccounts',
        'Microsoft.ServiceBus/namespaces',
        'Microsoft.KeyVault/vaults'
      ]);
      
      // Filter by storage accounts
      cy.filterResourcesByType('Microsoft.Storage/storageAccounts');
      
      // Verify only storage resources are shown
      cy.get('@resourceData').then((resources) => {
        const storageResources = resources.filter(res => res.type === 'Microsoft.Storage/storageAccounts');
        
        // Check that all visible rows are storage accounts
        cy.get('table.resource-table tbody tr').each(($row) => {
          cy.wrap($row).contains('td', 'Microsoft.Storage/storageAccounts').should('be.visible');
        });
        
        // Check that non-storage resources are not visible
        const nonStorageResource = resources.find(res => res.type !== 'Microsoft.Storage/storageAccounts');
        if (nonStorageResource) {
          cy.contains('td', nonStorageResource.name).should('not.exist');
        }
      });
    });
    
    it('should search for Azure resources', () => {
      // Discover all resources
      cy.discoverAzureResources([
        'Microsoft.Storage/storageAccounts',
        'Microsoft.ServiceBus/namespaces',
        'Microsoft.KeyVault/vaults'
      ]);
      
      // Search for a specific resource
      cy.get('@resourceData').then((resources) => {
        if (resources.length > 0) {
          // Get a substring from the first resource name
          const searchTerm = resources[0].name.substring(0, 5);
          
          // Search for this term
          cy.searchAzureResources(searchTerm);
          
          // Get resources that should match the search
          const matchingResources = resources.filter(res => res.name.includes(searchTerm));
          
          // Verify only matching resources are shown
          cy.get('table.resource-table tbody tr').should('have.length', matchingResources.length);
          
          // Verify a matching resource is visible
          if (matchingResources.length > 0) {
            cy.contains('td', matchingResources[0].name).should('be.visible');
          }
          
          // Verify non-matching resources are not visible
          const nonMatchingResource = resources.find(res => !res.name.includes(searchTerm));
          if (nonMatchingResource) {
            cy.contains('td', nonMatchingResource.name).should('not.exist');
          }
        }
      });
    });
    
    it('should select Azure resources', () => {
      // Discover storage resources
      cy.discoverAzureResources(['Microsoft.Storage/storageAccounts']);
      
      // Get resources to select
      cy.get('@resourceData').then((resources) => {
        const storageResources = resources.filter(res => res.type === 'Microsoft.Storage/storageAccounts');
        
        if (storageResources.length >= 2) {
          // Select the first two storage resources
          const resourcesToSelect = [storageResources[0].name, storageResources[1].name];
          cy.selectAzureResources(resourcesToSelect);
          
          // Verify resources are selected
          cy.contains('Selected Resources').should('be.visible');
          cy.get('.selected-resources-container').within(() => {
            cy.contains(resourcesToSelect[0]).should('be.visible');
            cy.contains(resourcesToSelect[1]).should('be.visible');
          });
        }
      });
      
      // Check accessibility
      cy.checkAzureA11y('selected resources');
    });
  });
});