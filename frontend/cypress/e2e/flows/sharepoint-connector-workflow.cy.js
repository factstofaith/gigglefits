// cypress/e2e/flows/sharepoint-connector-workflow.cy.js

/**
 * End-to-End Test for SharePoint Connector Workflow
 * 
 * This test verifies the entire SharePoint connector lifecycle:
 * 1. Configuration of SharePoint connector (both credential and OAuth methods)
 * 2. Site browsing and document library selection
 * 3. File and folder operations (browse, upload, download, delete)
 * 4. Batch operations (multi-select, copy, move)
 * 5. Integration with flow canvas for data pipelines
 * 6. Error handling and validation
 */
describe('SharePoint Connector Workflow', () => {
  // Test data - admin user
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!',
    fullName: 'Admin User'
  };
  
  // Test integration for SharePoint flow testing
  const testIntegration = {
    name: 'SharePoint Test Integration',
    description: 'Integration for testing SharePoint connector functionality',
    type: 'FILE_PROCESSING',
    schedule: 'MANUAL',
    tags: ['test', 'sharepoint', 'e2e']
  };
  
  before(() => {
    // Clean the test database for storage and integrations
    cy.request('POST', '/api/test/reset-db', { scope: ['storage', 'integrations'] });
    
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification for admin
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Create a test integration for SharePoint flow testing
    cy.createIntegration(testIntegration).then(createdIntegration => {
      cy.wrap(createdIntegration.id).as('testIntegrationId');
    });
  });
  
  it('creates SharePoint connector with credentials authentication', function() {
    // Load test data from fixture
    cy.fixture('storage/storage_configurations.json').then(configs => {
      // Create SharePoint configuration with credentials auth
      cy.configureSharePointStorage(configs.sharePointConfig).then(createdConfig => {
        // Store the configuration ID for later use
        cy.wrap(createdConfig.id).as('sharePointConfigId');
        
        // Verify configuration was created successfully
        cy.visit(`/admin/storage/${createdConfig.id}`);
        
        // Check configuration details
        cy.get('[data-testid="storage-name"]').should('contain', configs.sharePointConfig.name);
        cy.get('[data-testid="storage-description"]').should('contain', configs.sharePointConfig.description);
        cy.get('[data-testid="storage-provider-type"]').should('contain', 'SharePoint');
        
        // Check SharePoint-specific details
        cy.get('[data-testid="sharepoint-site-url"]').should('contain', configs.sharePointConfig.siteUrl);
        cy.get('[data-testid="sharepoint-library"]').should('contain', configs.sharePointConfig.library);
        
        // Auth method should be displayed
        cy.get('[data-testid="sharepoint-auth-method"]').should('contain', 'Credentials');
        
        // Username should be displayed
        cy.get('[data-testid="sharepoint-username"]').should('contain', configs.sharePointConfig.username);
        
        // Password should be masked
        cy.get('[data-testid="sharepoint-password"]').should('contain', '••••••••');
        
        // Test connection to verify it works
        cy.intercept('POST', `/api/storage/configurations/${createdConfig.id}/test`).as('testConnection');
        cy.get('[data-testid="test-connection-button"]').click();
        
        // Verify connection test result
        cy.wait('@testConnection').then((interception) => {
          expect(interception.response.statusCode).to.equal(200);
          expect(interception.response.body.success).to.be.true;
        });
        
        // Connection success message should be displayed
        cy.get('[data-testid="connection-test-result"]').should('contain', 'Connection successful');
      });
    });
  });
  
  it('creates SharePoint connector with OAuth authentication', function() {
    // Load test data from fixture
    cy.fixture('storage/storage_configurations.json').then(configs => {
      // Create SharePoint configuration with OAuth auth
      cy.configureSharePointStorage(configs.sharePointOAuthConfig).then(createdConfig => {
        // Store the configuration ID for later use
        cy.wrap(createdConfig.id).as('sharePointOAuthConfigId');
        
        // Verify configuration was created successfully
        cy.visit(`/admin/storage/${createdConfig.id}`);
        
        // Check configuration details
        cy.get('[data-testid="storage-name"]').should('contain', configs.sharePointOAuthConfig.name);
        cy.get('[data-testid="storage-description"]').should('contain', configs.sharePointOAuthConfig.description);
        cy.get('[data-testid="storage-provider-type"]').should('contain', 'SharePoint');
        
        // Check SharePoint-specific details
        cy.get('[data-testid="sharepoint-site-url"]').should('contain', configs.sharePointOAuthConfig.siteUrl);
        cy.get('[data-testid="sharepoint-library"]').should('contain', configs.sharePointOAuthConfig.library);
        
        // Auth method should be displayed
        cy.get('[data-testid="sharepoint-auth-method"]').should('contain', 'OAuth');
        
        // OAuth connection status should be displayed
        cy.get('[data-testid="oauth-connection-status"]').should('contain', 'Connected');
        
        // Test connection to verify it works
        cy.intercept('POST', `/api/storage/configurations/${createdConfig.id}/test`).as('testConnection');
        cy.get('[data-testid="test-connection-button"]').click();
        
        // Verify connection test result
        cy.wait('@testConnection').then((interception) => {
          expect(interception.response.statusCode).to.equal(200);
          expect(interception.response.body.success).to.be.true;
        });
        
        // Connection success message should be displayed
        cy.get('[data-testid="connection-test-result"]').should('contain', 'Connection successful');
      });
    });
  });
  
  it('browses SharePoint sites and document libraries', function() {
    // Get SharePoint config ID
    const configId = this.sharePointConfigId;
    
    // Mock site browsing API
    cy.fixture('storage/sharepoint_sites.json').then(sites => {
      // Mock sites listing
      cy.intercept('GET', `/api/storage/${configId}/sharepoint/sites`, {
        statusCode: 200,
        body: sites.sitesList
      }).as('getSitesList');
      
      // Mock site libraries listing
      cy.intercept('GET', `/api/storage/${configId}/sharepoint/sites/*/libraries`, {
        statusCode: 200,
        body: sites.librariesList
      }).as('getLibrariesList');
      
      // Navigate to SharePoint site browser
      cy.visit(`/admin/storage/${configId}/sharepoint/browser`);
      
      // Verify sites list is loaded
      cy.wait('@getSitesList');
      cy.get('[data-testid="sharepoint-sites-list"]').should('be.visible');
      cy.get('[data-testid="site-item"]').should('have.length', sites.sitesList.length);
      
      // Verify first site is displayed correctly
      cy.get('[data-testid="site-item"]').first().should('contain', sites.sitesList[0].title);
      cy.get('[data-testid="site-item"]').first().should('contain', sites.sitesList[0].url);
      
      // Click on first site to browse libraries
      cy.get('[data-testid="site-item"]').first().click();
      
      // Verify libraries list is loaded
      cy.wait('@getLibrariesList');
      cy.get('[data-testid="sharepoint-libraries-list"]').should('be.visible');
      cy.get('[data-testid="library-item"]').should('have.length', sites.librariesList.length);
      
      // Verify first library is displayed correctly
      cy.get('[data-testid="library-item"]').first().should('contain', sites.librariesList[0].name);
      cy.get('[data-testid="library-item"]').first().should('contain', sites.librariesList[0].itemCount);
      
      // Click on first library to select it
      cy.get('[data-testid="library-item"]').first().within(() => {
        cy.get('[data-testid="select-library-button"]').click();
      });
      
      // Verify library is selected
      cy.get('[data-testid="selected-library-name"]').should('contain', sites.librariesList[0].name);
      cy.get('[data-testid="save-library-selection-button"]').click();
      
      // Verify redirection to storage configuration
      cy.url().should('include', `/admin/storage/${configId}`);
      cy.get('[data-testid="sharepoint-library"]').should('contain', sites.librariesList[0].name);
    });
  });
  
  it('browses SharePoint files and folders', function() {
    // Get SharePoint config ID
    const configId = this.sharePointConfigId;
    
    // Mock file listings API
    cy.fixture('storage/file_listings.json').then(listings => {
      // Mock root listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2F`, {
        statusCode: 200,
        body: listings.sharePointRootListing
      }).as('getRootListing');
      
      // Mock documents folder listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2Fdocuments`, {
        statusCode: 200,
        body: listings.sharePointDocumentsListing
      }).as('getDocumentsListing');
      
      // Mock presentations folder listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2Fpresentations`, {
        statusCode: 200,
        body: listings.sharePointPresentationsListing
      }).as('getPresentationsListing');
      
      // Browse storage files
      cy.browseStorageFiles(configId).then(fileList => {
        // Verify root listing is displayed
        cy.wait('@getRootListing');
        
        // Check folders are displayed
        cy.get('[data-testid="folder-item"]').should('have.length', 3);
        cy.get('[data-testid="folder-item"]').eq(0).should('contain', 'documents');
        cy.get('[data-testid="folder-item"]').eq(1).should('contain', 'presentations');
        cy.get('[data-testid="folder-item"]').eq(2).should('contain', 'spreadsheets');
        
        // Check files are displayed
        cy.get('[data-testid="file-item"]').should('have.length', 2);
        cy.get('[data-testid="file-item"]').eq(0).should('contain', 'introduction.docx');
        cy.get('[data-testid="file-item"]').eq(1).should('contain', 'readme.txt');
        
        // Navigate to documents folder
        cy.contains('[data-testid="folder-item"]', 'documents').click();
        cy.wait('@getDocumentsListing');
        
        // Check documents folder content is displayed
        cy.get('[data-testid="folder-item"]').should('have.length', 2);
        cy.get('[data-testid="folder-item"]').eq(0).should('contain', 'project-plans');
        cy.get('[data-testid="folder-item"]').eq(1).should('contain', 'reports');
        
        cy.get('[data-testid="file-item"]').should('have.length', 3);
        cy.get('[data-testid="file-item"]').eq(0).should('contain', 'project-scope.docx');
        cy.get('[data-testid="file-item"]').eq(1).should('contain', 'meeting-notes.docx');
        cy.get('[data-testid="file-item"]').eq(2).should('contain', 'requirements.docx');
        
        // Go back to root
        cy.get('[data-testid="parent-folder-button"]').click();
        cy.wait('@getRootListing');
        
        // Navigate to presentations folder
        cy.contains('[data-testid="folder-item"]', 'presentations').click();
        cy.wait('@getPresentationsListing');
        
        // Check presentations folder content is displayed
        cy.get('[data-testid="folder-item"]').should('have.length', 1);
        cy.get('[data-testid="folder-item"]').eq(0).should('contain', 'client-meetings');
        
        cy.get('[data-testid="file-item"]').should('have.length', 3);
        cy.get('[data-testid="file-item"]').eq(0).should('contain', 'company-overview.pptx');
        cy.get('[data-testid="file-item"]').eq(1).should('contain', 'project-kickoff.pptx');
        cy.get('[data-testid="file-item"]').eq(2).should('contain', 'quarterly-results.pptx');
      });
    });
  });
  
  it('performs file operations in SharePoint', function() {
    // Get SharePoint config ID
    const configId = this.sharePointConfigId;
    
    // Mock file listings API
    cy.fixture('storage/file_listings.json').then(listings => {
      // Mock root listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2F`, {
        statusCode: 200,
        body: listings.sharePointRootListing
      }).as('getRootListing');
    });
    
    // Mock file operations APIs
    cy.fixture('storage/file_operations.json').then(operations => {
      // Mock file upload API
      cy.intercept('POST', `/api/storage/${configId}/upload*`, {
        statusCode: 201,
        body: operations.sharePointUploadResult
      }).as('uploadFile');
      
      // Mock folder creation API
      cy.intercept('POST', `/api/storage/${configId}/folders*`, {
        statusCode: 201,
        body: operations.sharePointCreateFolderResult
      }).as('createFolder');
      
      // Mock file download API
      cy.intercept('GET', `/api/storage/${configId}/download*`, {
        statusCode: 200,
        body: operations.sharePointDownloadResult
      }).as('downloadFile');
      
      // Mock file deletion API
      cy.intercept('DELETE', `/api/storage/${configId}/files*`, {
        statusCode: 200,
        body: operations.sharePointDeleteFileResult
      }).as('deleteFile');
      
      // Navigate to storage browser
      cy.visit(`/admin/storage/${configId}/browser`);
      cy.wait('@getRootListing');
      
      // Test folder creation
      cy.get('[data-testid="create-folder-button"]').click();
      cy.get('[data-testid="folder-name-input"]').type('new-sharepoint-folder');
      cy.get('[data-testid="confirm-create-folder-button"]').click();
      cy.wait('@createFolder');
      cy.get('[data-testid="operation-success-message"]').should('contain', 'Folder created successfully');
      
      // Test file upload
      const testFile = new File(['test file content'], 'test_upload.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      cy.get('[data-testid="upload-file-input"]').attachFile({
        fileContent: testFile,
        fileName: 'test_upload.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      cy.wait('@uploadFile');
      cy.get('[data-testid="operation-success-message"]').should('contain', 'File uploaded successfully');
      
      // Test file download
      cy.contains('[data-testid="file-item"]', 'readme.txt').within(() => {
        cy.get('[data-testid="download-file-button"]').click();
      });
      cy.wait('@downloadFile');
      
      // Test file deletion
      cy.contains('[data-testid="file-item"]', 'introduction.docx').within(() => {
        cy.get('[data-testid="delete-item-button"]').click();
      });
      cy.get('[data-testid="confirm-delete-button"]').click();
      cy.wait('@deleteFile');
      cy.get('[data-testid="operation-success-message"]').should('contain', 'File deleted successfully');
    });
  });
  
  it('performs batch operations in SharePoint', function() {
    // Get SharePoint config ID
    const configId = this.sharePointConfigId;
    
    // Mock file listings API
    cy.fixture('storage/file_listings.json').then(listings => {
      // Mock root listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2F`, {
        statusCode: 200,
        body: listings.sharePointRootListing
      }).as('getRootListing');
      
      // Mock documents folder listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2Fdocuments`, {
        statusCode: 200,
        body: listings.sharePointDocumentsListing
      }).as('getDocumentsListing');
    });
    
    // Mock batch operations APIs
    cy.fixture('storage/file_operations.json').then(operations => {
      // Mock batch copy API
      cy.intercept('POST', `/api/storage/${configId}/batch/copy`, {
        statusCode: 200,
        body: operations.sharePointBatchCopyResult
      }).as('batchCopy');
      
      // Mock batch move API
      cy.intercept('POST', `/api/storage/${configId}/batch/move`, {
        statusCode: 200,
        body: operations.sharePointBatchMoveResult
      }).as('batchMove');
      
      // Mock batch delete API
      cy.intercept('POST', `/api/storage/${configId}/batch/delete`, {
        statusCode: 200,
        body: operations.sharePointBatchDeleteResult
      }).as('batchDelete');
      
      // Navigate to storage browser
      cy.visit(`/admin/storage/${configId}/browser`);
      cy.wait('@getRootListing');
      
      // Navigate to documents folder
      cy.contains('[data-testid="folder-item"]', 'documents').click();
      cy.wait('@getDocumentsListing');
      
      // Test batch selection
      cy.get('[data-testid="file-item"]').eq(0).within(() => {
        cy.get('[data-testid="select-item-checkbox"]').check();
      });
      cy.get('[data-testid="file-item"]').eq(1).within(() => {
        cy.get('[data-testid="select-item-checkbox"]').check();
      });
      
      // Verify batch action toolbar appears
      cy.get('[data-testid="batch-actions-toolbar"]').should('be.visible');
      cy.get('[data-testid="selected-items-count"]').should('contain', '2');
      
      // Test batch copy
      cy.get('[data-testid="batch-copy-button"]').click();
      cy.get('[data-testid="destination-path-input"]').type('/presentations');
      cy.get('[data-testid="confirm-batch-copy-button"]').click();
      cy.wait('@batchCopy');
      cy.get('[data-testid="operation-success-message"]').should('contain', 'Copied 2 items successfully');
      
      // Test batch move
      cy.get('[data-testid="batch-move-button"]').click();
      cy.get('[data-testid="destination-path-input"]').type('/new-sharepoint-folder');
      cy.get('[data-testid="confirm-batch-move-button"]').click();
      cy.wait('@batchMove');
      cy.get('[data-testid="operation-success-message"]').should('contain', 'Moved 2 items successfully');
      
      // Test batch delete
      cy.get('[data-testid="batch-delete-button"]').click();
      cy.get('[data-testid="confirm-batch-delete-button"]').click();
      cy.wait('@batchDelete');
      cy.get('[data-testid="operation-success-message"]').should('contain', 'Deleted 2 items successfully');
    });
  });
  
  it('adds SharePoint source node to integration flow', function() {
    // Get the integration ID and SharePoint config ID
    const integrationId = this.testIntegrationId;
    const storageConfigId = this.sharePointConfigId;
    
    // Load test data from fixture
    cy.fixture('storage/integration_flow.json').then(integrationFlow => {
      // Add SharePoint source node to flow
      cy.addStorageSourceNode(integrationId, storageConfigId, integrationFlow.sharePointSourceOptions).then(sourceNodeId => {
        // Verify node is added to the flow
        cy.get(`[data-testid="node-${sourceNodeId}"]`).should('be.visible');
        cy.get(`[data-testid="node-${sourceNodeId}"]`).should('have.attr', 'data-node-type', 'STORAGE_SOURCE');
        
        // Verify storage configuration is selected
        cy.get(`[data-testid="node-${sourceNodeId}"]`).click();
        cy.get('[data-testid="node-properties-panel"]').should('be.visible');
        cy.get('[data-testid="storage-config-select"]').should('have.value', storageConfigId);
        
        // Verify file path and pattern are set
        cy.get('[data-testid="file-path-input"]').should('have.value', integrationFlow.sharePointSourceOptions.filePath);
        cy.get('[data-testid="file-pattern-input"]').should('have.value', integrationFlow.sharePointSourceOptions.filePattern);
        
        // Verify recursive option is set
        cy.get('[data-testid="recursive-checkbox"]').should('be.checked');
        
        // Verify trigger type is set
        cy.get('[data-testid="trigger-type-select"]').should('have.value', integrationFlow.sharePointSourceOptions.triggerType);
        
        // Save the node ID for later
        cy.wrap(sourceNodeId).as('sharePointSourceNodeId');
      });
    });
  });
  
  it('adds SharePoint destination node to integration flow', function() {
    // Get the integration ID, SharePoint config ID, and source node ID
    const integrationId = this.testIntegrationId;
    const storageConfigId = this.sharePointConfigId;
    const sourceNodeId = this.sharePointSourceNodeId;
    
    // Load test data from fixture
    cy.fixture('storage/integration_flow.json').then(integrationFlow => {
      // Add SharePoint destination node to flow
      cy.addStorageDestinationNode(integrationId, storageConfigId, integrationFlow.sharePointDestinationOptions).then(destNodeId => {
        // Verify node is added to the flow
        cy.get(`[data-testid="node-${destNodeId}"]`).should('be.visible');
        cy.get(`[data-testid="node-${destNodeId}"]`).should('have.attr', 'data-node-type', 'STORAGE_DESTINATION');
        
        // Verify storage configuration is selected
        cy.get(`[data-testid="node-${destNodeId}"]`).click();
        cy.get('[data-testid="node-properties-panel"]').should('be.visible');
        cy.get('[data-testid="storage-config-select"]').should('have.value', storageConfigId);
        
        // Verify destination path is set
        cy.get('[data-testid="destination-path-input"]').should('have.value', integrationFlow.sharePointDestinationOptions.destinationPath);
        cy.get('[data-testid="file-name-pattern-input"]').should('have.value', integrationFlow.sharePointDestinationOptions.fileNamePattern);
        
        // Verify options are set
        cy.get('[data-testid="overwrite-checkbox"]').should('be.checked');
        cy.get('[data-testid="create-path-checkbox"]').should('be.checked');
        
        // Connect source node to destination node
        cy.connectNodes(sourceNodeId, destNodeId);
        
        // Save the flow
        cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
        cy.get('[data-testid="save-flow-button"]').click();
        cy.wait('@saveFlow');
        
        // Save the node ID for later
        cy.wrap(destNodeId).as('sharePointDestNodeId');
      });
    });
  });
  
  it('runs SharePoint integration flow successfully', function() {
    // Get the integration ID
    const integrationId = this.testIntegrationId;
    
    // Mock execution API
    cy.fixture('storage/integration_flow.json').then(integrationFlow => {
      cy.intercept('POST', `/api/integrations/${integrationId}/execute`, {
        statusCode: 200,
        body: { executionId: 'sharepoint-test-execution-id' }
      }).as('executeIntegration');
      
      // Mock execution status API
      cy.intercept('GET', `/api/executions/sharepoint-test-execution-id`, {
        statusCode: 200,
        body: integrationFlow.sharePointExecutionResult
      }).as('getExecutionStatus');
      
      // Run the integration
      cy.visit(`/integrations/${integrationId}`);
      cy.get('[data-testid="run-integration-button"]').click();
      
      // Wait for execution to start
      cy.wait('@executeIntegration');
      
      // Navigate to execution page
      cy.visit(`/executions/sharepoint-test-execution-id`);
      
      // Verify execution completed successfully
      cy.wait('@getExecutionStatus');
      cy.get('[data-testid="execution-status"]').should('contain', 'SUCCESS');
      
      // Check execution details
      cy.get('[data-testid="execution-time"]').should('contain', '75 seconds');
      cy.get('[data-testid="items-processed"]').should('contain', '5');
      
      // Check execution logs
      cy.get('[data-testid="execution-logs-tab"]').click();
      cy.get('[data-testid="execution-logs"]').should('contain', 'Integration execution started');
      cy.get('[data-testid="execution-logs"]').should('contain', 'Reading files from SharePoint source');
      cy.get('[data-testid="execution-logs"]').should('contain', 'Found 5 files matching pattern');
      cy.get('[data-testid="execution-logs"]').should('contain', 'Writing files to SharePoint destination');
      cy.get('[data-testid="execution-logs"]').should('contain', 'Integration execution completed successfully');
    });
  });
  
  it('handles SharePoint errors gracefully', function() {
    // Get the integration ID and SharePoint config ID
    const integrationId = this.testIntegrationId;
    const sourceNodeId = this.sharePointSourceNodeId;
    const destNodeId = this.sharePointDestNodeId;
    
    // Mock execution API
    cy.fixture('storage/integration_flow.json').then(integrationFlow => {
      // Mock failures in source node
      cy.intercept('GET', `/api/node/${sourceNodeId}/config`, {
        statusCode: 200,
        body: {
          ...integrationFlow.sharePointSourceOptions,
          // Add invalid path that will cause failure
          filePath: '/nonexistent-folder'
        }
      }).as('getSourceNodeConfig');
      
      // Update node configuration to include error path
      cy.visit(`/integrations/${integrationId}/builder`);
      cy.get(`[data-testid="node-${sourceNodeId}"]`).click();
      cy.get('[data-testid="file-path-input"]').clear().type('/nonexistent-folder');
      cy.get('[data-testid="apply-node-config-button"]').click();
      
      // Save the flow
      cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
      cy.get('[data-testid="save-flow-button"]').click();
      cy.wait('@saveFlow');
      
      // Mock execution API for error case
      cy.intercept('POST', `/api/integrations/${integrationId}/execute`, {
        statusCode: 200,
        body: { executionId: 'sharepoint-error-execution-id' }
      }).as('executeIntegration');
      
      // Mock execution status API for error case
      cy.intercept('GET', `/api/executions/sharepoint-error-execution-id`, {
        statusCode: 200,
        body: integrationFlow.sharePointErrorExecutionResult
      }).as('getErrorExecutionStatus');
      
      // Run the integration
      cy.visit(`/integrations/${integrationId}`);
      cy.get('[data-testid="run-integration-button"]').click();
      
      // Wait for execution to start
      cy.wait('@executeIntegration');
      
      // Navigate to execution page
      cy.visit(`/executions/sharepoint-error-execution-id`);
      
      // Verify execution failed
      cy.wait('@getErrorExecutionStatus');
      cy.get('[data-testid="execution-status"]').should('contain', 'FAILED');
      
      // Check error details
      cy.get('[data-testid="execution-error"]').should('contain', 'SharePoint folder not found');
      
      // Check execution logs
      cy.get('[data-testid="execution-logs-tab"]').click();
      cy.get('[data-testid="execution-logs"]').should('contain', 'Integration execution started');
      cy.get('[data-testid="execution-logs"]').should('contain', 'Error: Folder /nonexistent-folder does not exist in the specified document library');
      cy.get('[data-testid="execution-logs"]').should('contain', 'SharePoint error: Item does not exist or you do not have permissions');
      cy.get('[data-testid="execution-logs"]').should('contain', 'Integration execution failed');
    });
  });
  
  it('deletes SharePoint configurations', function() {
    // Delete both SharePoint configurations
    cy.deleteStorageConfig(this.sharePointConfigId).then(() => {
      cy.deleteStorageConfig(this.sharePointOAuthConfigId).then(() => {
        // Verify configurations are no longer in the list
        cy.visit('/admin/storage');
        cy.get('[data-testid="storage-search-input"]').clear().type('SharePoint');
        cy.get('[data-testid="search-storage-button"]').click();
        
        // Should show no results
        cy.get('[data-testid="no-results-message"]').should('be.visible');
      });
    });
  });
  
  after(() => {
    // Clean up test data
    cy.request('POST', '/api/test/reset-db', { scope: ['storage', 'integrations'] });
    
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });
});