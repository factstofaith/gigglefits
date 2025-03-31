// cypress/e2e/flows/storage-configuration.cy.js

/**
 * End-to-End Test for Storage Configuration
 * 
 * This test verifies the storage configuration capabilities:
 * 1. Creating, reading, updating, and deleting storage configurations
 * 2. Testing connections to storage providers
 * 3. Browsing and managing files in storage
 * 4. Using storage in integration flows
 * 5. Error handling and validation
 */
describe('Storage Configuration', () => {
  // Test data - admin user
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!',
    fullName: 'Admin User'
  };
  
  // Test integration for storage flow testing
  const testIntegration = {
    name: 'Storage Test Integration',
    description: 'Integration for testing storage functionality',
    type: 'FILE_PROCESSING',
    schedule: 'MANUAL',
    tags: ['test', 'storage', 'e2e']
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
    
    // Create a test integration for storage flow testing
    cy.createIntegration(testIntegration).then(createdIntegration => {
      cy.wrap(createdIntegration.id).as('testIntegrationId');
    });
  });
  
  it('creates and views Azure Blob Storage configuration', function() {
    // Load test data from fixture
    cy.fixture('storage/storage_configurations.json').then(configs => {
      // Create Azure Blob Storage configuration
      cy.configureAzureBlobStorage(configs.azureBlobStorageConfig).then(createdConfig => {
        // Store the configuration ID for later use
        cy.wrap(createdConfig.id).as('azureBlobConfigId');
        
        // Verify configuration was created successfully
        cy.visit(`/admin/storage/${createdConfig.id}`);
        
        // Check configuration details
        cy.get('[data-testid="storage-name"]').should('contain', configs.azureBlobStorageConfig.name);
        cy.get('[data-testid="storage-description"]').should('contain', configs.azureBlobStorageConfig.description);
        cy.get('[data-testid="storage-provider-type"]').should('contain', 'Azure Blob Storage');
        
        // Check Azure-specific details
        cy.get('[data-testid="azure-account-name"]').should('contain', configs.azureBlobStorageConfig.accountName);
        cy.get('[data-testid="azure-container"]').should('contain', configs.azureBlobStorageConfig.container);
        
        // Connection string should be masked
        cy.get('[data-testid="azure-connection-string"]').should('contain', '••••••••');
        
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
  
  it('creates and views AWS S3 configuration', function() {
    // Load test data from fixture
    cy.fixture('storage/storage_configurations.json').then(configs => {
      // Create AWS S3 configuration
      cy.configureS3Storage(configs.awsS3Config).then(createdConfig => {
        // Store the configuration ID for later use
        cy.wrap(createdConfig.id).as('s3ConfigId');
        
        // Verify configuration was created successfully
        cy.visit(`/admin/storage/${createdConfig.id}`);
        
        // Check configuration details
        cy.get('[data-testid="storage-name"]').should('contain', configs.awsS3Config.name);
        cy.get('[data-testid="storage-description"]').should('contain', configs.awsS3Config.description);
        cy.get('[data-testid="storage-provider-type"]').should('contain', 'AWS S3');
        
        // Check S3-specific details
        cy.get('[data-testid="s3-region"]').should('contain', configs.awsS3Config.region);
        cy.get('[data-testid="s3-bucket"]').should('contain', configs.awsS3Config.bucket);
        
        // Access key should be partly masked
        cy.get('[data-testid="s3-access-key"]').should('contain', '••••••••');
        
        // Secret key should be fully masked
        cy.get('[data-testid="s3-secret-key"]').should('contain', '••••••••');
        
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
  
  it('creates and views SharePoint configuration', function() {
    // Load test data from fixture
    cy.fixture('storage/storage_configurations.json').then(configs => {
      // Create SharePoint configuration
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
  
  it('updates storage configuration', function() {
    // Get the Azure Blob config ID
    const configId = this.azureBlobConfigId;
    
    // Load test data from fixture
    cy.fixture('storage/storage_configurations.json').then(configs => {
      // Update Azure Blob Storage configuration
      cy.updateStorageConfig(configId, configs.updatedAzureBlobStorageConfig).then(updatedConfig => {
        // Verify configuration was updated successfully
        cy.visit(`/admin/storage/${updatedConfig.id}`);
        
        // Check updated details
        cy.get('[data-testid="storage-name"]').should('contain', configs.updatedAzureBlobStorageConfig.name);
        cy.get('[data-testid="storage-description"]').should('contain', configs.updatedAzureBlobStorageConfig.description);
        
        // Check updated Azure-specific details
        cy.get('[data-testid="azure-account-name"]').should('contain', configs.updatedAzureBlobStorageConfig.accountName);
        cy.get('[data-testid="azure-container"]').should('contain', configs.updatedAzureBlobStorageConfig.container);
        
        // Folder path should be updated
        cy.get('[data-testid="azure-folder-path"]').should('contain', configs.updatedAzureBlobStorageConfig.folderPath);
      });
    });
  });
  
  it('tests connection with invalid credentials', function() {
    // Load test data from fixture
    cy.fixture('storage/storage_configurations.json').then(configs => {
      // Create invalid Azure Blob Storage configuration
      cy.configureAzureBlobStorage(configs.invalidAzureBlobStorageConfig).then(createdConfig => {
        // Store the invalid configuration ID
        cy.wrap(createdConfig.id).as('invalidConfigId');
        
        // Test connection to verify it fails
        cy.intercept('POST', `/api/storage/configurations/${createdConfig.id}/test`).as('testConnection');
        cy.get('[data-testid="test-connection-button"]').click();
        
        // Verify connection test result
        cy.wait('@testConnection').then((interception) => {
          expect(interception.response.statusCode).to.equal(200);
          expect(interception.response.body.success).to.be.false;
        });
        
        // Connection failure message should be displayed
        cy.get('[data-testid="connection-test-result"]').should('contain', 'Connection failed');
        cy.get('[data-testid="connection-error-details"]').should('be.visible');
      });
    });
  });
  
  it('searches and filters storage configurations', function() {
    // Navigate to storage configurations list
    cy.visit('/admin/storage');
    
    // Search for Azure configurations
    cy.get('[data-testid="storage-search-input"]').clear().type('Azure');
    cy.get('[data-testid="search-storage-button"]').click();
    
    // Verify search results contain Azure configurations
    cy.get('[data-testid="storage-config-list"]').should('contain', 'Updated Azure Blob Storage');
    cy.get('[data-testid="storage-config-list"]').should('contain', 'Invalid Azure Blob Storage');
    
    // Filter by provider type
    cy.get('[data-testid="storage-provider-filter"]').select('AWS_S3');
    cy.get('[data-testid="apply-filters-button"]').click();
    
    // Verify only S3 configurations are displayed
    cy.get('[data-testid="storage-config-list"]').should('contain', 'Test AWS S3');
    cy.get('[data-testid="storage-config-list"]').should('not.contain', 'Azure');
    
    // Clear filters
    cy.get('[data-testid="clear-filters-button"]').click();
    
    // Search for test configurations
    cy.get('[data-testid="storage-search-input"]').clear().type('Test');
    cy.get('[data-testid="search-storage-button"]').click();
    
    // Verify all test configurations are displayed
    cy.get('[data-testid="storage-config-list"]').should('contain', 'Test AWS S3');
    cy.get('[data-testid="storage-config-list"]').should('contain', 'Test SharePoint');
  });
  
  it('browses storage files', function() {
    // Get the Azure Blob config ID
    const configId = this.azureBlobConfigId;
    
    // Mock file listings API
    cy.fixture('storage/file_listings.json').then(listings => {
      // Mock root listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2F`, {
        statusCode: 200,
        body: listings.rootListing
      }).as('getRootListing');
      
      // Mock documents folder listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2Fdocuments`, {
        statusCode: 200,
        body: listings.documentsListing
      }).as('getDocumentsListing');
      
      // Mock images folder listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2Fimages`, {
        statusCode: 200,
        body: listings.imagesListing
      }).as('getImagesListing');
      
      // Browse storage files
      cy.browseStorageFiles(configId).then(fileList => {
        // Verify root listing is displayed
        cy.wait('@getRootListing');
        
        // Check folders are displayed
        cy.get('[data-testid="folder-item"]').should('have.length', 3);
        cy.get('[data-testid="folder-item"]').eq(0).should('contain', 'documents');
        cy.get('[data-testid="folder-item"]').eq(1).should('contain', 'images');
        cy.get('[data-testid="folder-item"]').eq(2).should('contain', 'data');
        
        // Check files are displayed
        cy.get('[data-testid="file-item"]').should('have.length', 2);
        cy.get('[data-testid="file-item"]').eq(0).should('contain', 'readme.txt');
        cy.get('[data-testid="file-item"]').eq(1).should('contain', 'config.json');
        
        // Navigate to documents folder
        cy.contains('[data-testid="folder-item"]', 'documents').click();
        cy.wait('@getDocumentsListing');
        
        // Check documents folder content is displayed
        cy.get('[data-testid="folder-item"]').should('have.length', 2);
        cy.get('[data-testid="folder-item"]').eq(0).should('contain', 'reports');
        cy.get('[data-testid="folder-item"]').eq(1).should('contain', 'contracts');
        
        cy.get('[data-testid="file-item"]').should('have.length', 3);
        cy.get('[data-testid="file-item"]').eq(0).should('contain', 'sample.docx');
        cy.get('[data-testid="file-item"]').eq(1).should('contain', 'report.pdf');
        cy.get('[data-testid="file-item"]').eq(2).should('contain', 'notes.txt');
        
        // Go back to root
        cy.get('[data-testid="parent-folder-button"]').click();
        cy.wait('@getRootListing');
        
        // Navigate to images folder
        cy.contains('[data-testid="folder-item"]', 'images').click();
        cy.wait('@getImagesListing');
        
        // Check images folder content is displayed
        cy.get('[data-testid="folder-item"]').should('have.length', 2);
        cy.get('[data-testid="folder-item"]').eq(0).should('contain', 'products');
        cy.get('[data-testid="folder-item"]').eq(1).should('contain', 'banners');
        
        cy.get('[data-testid="file-item"]').should('have.length', 3);
        cy.get('[data-testid="file-item"]').eq(0).should('contain', 'logo.png');
        cy.get('[data-testid="file-item"]').eq(1).should('contain', 'header.jpg');
        cy.get('[data-testid="file-item"]').eq(2).should('contain', 'icon.svg');
      });
    });
  });
  
  it('searches storage files', function() {
    // Get the Azure Blob config ID
    const configId = this.azureBlobConfigId;
    
    // Mock search API
    cy.fixture('storage/file_listings.json').then(listings => {
      cy.intercept('GET', `/api/storage/${configId}/search?query=report`, {
        statusCode: 200,
        body: listings.searchResults
      }).as('searchFiles');
      
      // Search for files
      cy.searchStorageFiles(configId, 'report').then(searchResults => {
        // Verify search results are displayed
        cy.wait('@searchFiles');
        
        // Check search results
        cy.get('[data-testid="search-results-count"]').should('contain', '3');
        cy.get('[data-testid="file-item"]').should('have.length', 3);
        cy.get('[data-testid="file-item"]').eq(0).should('contain', 'report.pdf');
        cy.get('[data-testid="file-item"]').eq(1).should('contain', 'monthly_report.xlsx');
        cy.get('[data-testid="file-item"]').eq(2).should('contain', 'annual_report_2024.pdf');
      });
    });
  });
  
  it('previews storage file', function() {
    // Get the Azure Blob config ID
    const configId = this.azureBlobConfigId;
    
    // Mock file preview API
    cy.fixture('storage/file_listings.json').then(listings => {
      // Mock file listings for navigation
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2F`, {
        statusCode: 200,
        body: listings.rootListing
      }).as('getRootListing');
      
      // Mock file preview
      cy.intercept('GET', `/api/storage/${configId}/preview*`, {
        statusCode: 200,
        body: listings.filePreview
      }).as('previewFile');
      
      // Preview file
      cy.visit(`/admin/storage/${configId}/browser`);
      cy.wait('@getRootListing');
      
      // Click on readme.txt to preview
      cy.contains('[data-testid="file-item"]', 'readme.txt').within(() => {
        cy.get('[data-testid="preview-file-button"]').click();
      });
      
      // Verify preview dialog is shown
      cy.wait('@previewFile');
      cy.get('[data-testid="file-preview-dialog"]').should('be.visible');
      
      // Check preview content
      cy.get('[data-testid="file-preview-content"]').should('contain', 'This is a sample text file content');
      
      // Close preview
      cy.get('[data-testid="close-preview-button"]').click();
      cy.get('[data-testid="file-preview-dialog"]').should('not.exist');
    });
  });
  
  it('creates folder in storage', function() {
    // Get the Azure Blob config ID
    const configId = this.azureBlobConfigId;
    
    // Mock file listings API
    cy.fixture('storage/file_listings.json').then(listings => {
      // Mock root listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2F`, {
        statusCode: 200,
        body: listings.rootListing
      }).as('getRootListing');
    });
    
    // Mock folder creation API
    cy.fixture('storage/file_operations.json').then(operations => {
      cy.intercept('POST', `/api/storage/${configId}/folders*`, {
        statusCode: 201,
        body: operations.createFolderResult
      }).as('createFolder');
      
      // Create folder
      cy.visit(`/admin/storage/${configId}/browser`);
      cy.wait('@getRootListing');
      
      // Click create folder button
      cy.get('[data-testid="create-folder-button"]').click();
      
      // Enter folder name
      cy.get('[data-testid="folder-name-input"]').type('new_folder');
      
      // Confirm folder creation
      cy.get('[data-testid="confirm-create-folder-button"]').click();
      
      // Verify folder creation request was made
      cy.wait('@createFolder');
      
      // Success message should be displayed
      cy.get('[data-testid="operation-success-message"]').should('contain', 'Folder created successfully');
    });
  });
  
  it('uploads and downloads files', function() {
    // Get the Azure Blob config ID
    const configId = this.azureBlobConfigId;
    
    // Mock file listings API
    cy.fixture('storage/file_listings.json').then(listings => {
      // Mock root listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2F`, {
        statusCode: 200,
        body: listings.rootListing
      }).as('getRootListing');
    });
    
    // Mock file upload API
    cy.fixture('storage/file_operations.json').then(operations => {
      cy.intercept('POST', `/api/storage/${configId}/upload*`, {
        statusCode: 201,
        body: operations.uploadResult
      }).as('uploadFile');
      
      // Mock file download API
      cy.intercept('GET', `/api/storage/${configId}/download*`, {
        statusCode: 200,
        body: operations.downloadResult
      }).as('downloadFile');
      
      // Visit file browser
      cy.visit(`/admin/storage/${configId}/browser`);
      cy.wait('@getRootListing');
      
      // Test file upload
      // Create a test file for upload (this is mocked in Cypress)
      const testFile = new File(['test file content'], 'test_upload.txt', { type: 'text/plain' });
      
      // Upload the file
      cy.get('[data-testid="upload-file-input"]').attachFile({
        fileContent: testFile,
        fileName: 'test_upload.txt',
        mimeType: 'text/plain'
      });
      
      // Verify upload request was made
      cy.wait('@uploadFile');
      
      // Success message should be displayed
      cy.get('[data-testid="operation-success-message"]').should('contain', 'File uploaded successfully');
      
      // Test file download
      // Click on a file to download
      cy.contains('[data-testid="file-item"]', 'readme.txt').within(() => {
        cy.get('[data-testid="download-file-button"]').click();
      });
      
      // Verify download request was made
      cy.wait('@downloadFile');
    });
  });
  
  it('deletes storage items', function() {
    // Get the Azure Blob config ID
    const configId = this.azureBlobConfigId;
    
    // Mock file listings API
    cy.fixture('storage/file_listings.json').then(listings => {
      // Mock root listing
      cy.intercept('GET', `/api/storage/${configId}/browse?path=%2F`, {
        statusCode: 200,
        body: listings.rootListing
      }).as('getRootListing');
    });
    
    // Mock delete operations API
    cy.fixture('storage/file_operations.json').then(operations => {
      // Mock file deletion API
      cy.intercept('DELETE', `/api/storage/${configId}/files*`, {
        statusCode: 200,
        body: operations.deleteFileResult
      }).as('deleteFile');
      
      // Mock folder deletion API
      cy.intercept('DELETE', `/api/storage/${configId}/folders*`, {
        statusCode: 200,
        body: operations.deleteFolderResult
      }).as('deleteFolder');
      
      // Visit file browser
      cy.visit(`/admin/storage/${configId}/browser`);
      cy.wait('@getRootListing');
      
      // Delete a file
      cy.contains('[data-testid="file-item"]', 'readme.txt').within(() => {
        cy.get('[data-testid="delete-item-button"]').click();
      });
      
      // Confirm deletion
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      // Verify file deletion request was made
      cy.wait('@deleteFile');
      
      // Success message should be displayed
      cy.get('[data-testid="operation-success-message"]').should('contain', 'File deleted successfully');
      
      // Delete a folder
      cy.contains('[data-testid="folder-item"]', 'documents').within(() => {
        cy.get('[data-testid="delete-item-button"]').click();
      });
      
      // Confirm deletion
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      // Verify folder deletion request was made
      cy.wait('@deleteFolder');
      
      // Success message should be displayed
      cy.get('[data-testid="operation-success-message"]').should('contain', 'Folder deleted successfully');
    });
  });
  
  it('adds storage source node to integration flow', function() {
    // Get the integration ID and Azure Blob config ID
    const integrationId = this.testIntegrationId;
    const storageConfigId = this.azureBlobConfigId;
    
    // Load test data from fixture
    cy.fixture('storage/integration_flow.json').then(integrationFlow => {
      // Add storage source node to flow
      cy.addStorageSourceNode(integrationId, storageConfigId, integrationFlow.storageSourceOptions).then(sourceNodeId => {
        // Verify node is added to the flow
        cy.get(`[data-testid="node-${sourceNodeId}"]`).should('be.visible');
        cy.get(`[data-testid="node-${sourceNodeId}"]`).should('have.attr', 'data-node-type', 'STORAGE_SOURCE');
        
        // Verify storage configuration is selected
        cy.get(`[data-testid="node-${sourceNodeId}"]`).click();
        cy.get('[data-testid="node-properties-panel"]').should('be.visible');
        cy.get('[data-testid="storage-config-select"]').should('have.value', storageConfigId);
        
        // Verify file path and pattern are set
        cy.get('[data-testid="file-path-input"]').should('have.value', integrationFlow.storageSourceOptions.filePath);
        cy.get('[data-testid="file-pattern-input"]').should('have.value', integrationFlow.storageSourceOptions.filePattern);
        
        // Verify recursive option is set
        cy.get('[data-testid="recursive-checkbox"]').should('be.checked');
        
        // Verify trigger type is set
        cy.get('[data-testid="trigger-type-select"]').should('have.value', integrationFlow.storageSourceOptions.triggerType);
        
        // Save the node ID for later
        cy.wrap(sourceNodeId).as('sourceNodeId');
      });
    });
  });
  
  it('adds storage destination node to integration flow', function() {
    // Get the integration ID and Azure Blob config ID
    const integrationId = this.testIntegrationId;
    const storageConfigId = this.azureBlobConfigId;
    const sourceNodeId = this.sourceNodeId;
    
    // Load test data from fixture
    cy.fixture('storage/integration_flow.json').then(integrationFlow => {
      // Add storage destination node to flow
      cy.addStorageDestinationNode(integrationId, storageConfigId, integrationFlow.storageDestinationOptions).then(destNodeId => {
        // Verify node is added to the flow
        cy.get(`[data-testid="node-${destNodeId}"]`).should('be.visible');
        cy.get(`[data-testid="node-${destNodeId}"]`).should('have.attr', 'data-node-type', 'STORAGE_DESTINATION');
        
        // Verify storage configuration is selected
        cy.get(`[data-testid="node-${destNodeId}"]`).click();
        cy.get('[data-testid="node-properties-panel"]').should('be.visible');
        cy.get('[data-testid="storage-config-select"]').should('have.value', storageConfigId);
        
        // Verify destination path is set
        cy.get('[data-testid="destination-path-input"]').should('have.value', integrationFlow.storageDestinationOptions.destinationPath);
        cy.get('[data-testid="file-name-pattern-input"]').should('have.value', integrationFlow.storageDestinationOptions.fileNamePattern);
        
        // Verify options are set
        cy.get('[data-testid="overwrite-checkbox"]').should('not.be.checked');
        cy.get('[data-testid="create-path-checkbox"]').should('be.checked');
        
        // Connect source node to destination node
        cy.connectNodes(sourceNodeId, destNodeId);
        
        // Save the flow
        cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
        cy.get('[data-testid="save-flow-button"]').click();
        cy.wait('@saveFlow');
        
        // Save the node ID for later
        cy.wrap(destNodeId).as('destNodeId');
      });
    });
  });
  
  it('runs storage integration flow successfully', function() {
    // Get the integration ID
    const integrationId = this.testIntegrationId;
    
    // Mock execution API
    cy.fixture('storage/integration_flow.json').then(integrationFlow => {
      cy.intercept('POST', `/api/integrations/${integrationId}/execute`, {
        statusCode: 200,
        body: { executionId: 'test-execution-id' }
      }).as('executeIntegration');
      
      // Mock execution status API
      cy.intercept('GET', `/api/executions/test-execution-id`, {
        statusCode: 200,
        body: integrationFlow.executionResult
      }).as('getExecutionStatus');
      
      // Run the integration
      cy.visit(`/integrations/${integrationId}`);
      cy.get('[data-testid="run-integration-button"]').click();
      
      // Wait for execution to start
      cy.wait('@executeIntegration');
      
      // Navigate to execution page
      cy.visit(`/executions/test-execution-id`);
      
      // Verify execution completed successfully
      cy.wait('@getExecutionStatus');
      cy.get('[data-testid="execution-status"]').should('contain', 'SUCCESS');
      
      // Check execution details
      cy.get('[data-testid="execution-time"]').should('contain', '90 seconds');
      cy.get('[data-testid="items-processed"]').should('contain', '3');
      
      // Check execution logs
      cy.get('[data-testid="execution-logs-tab"]').click();
      cy.get('[data-testid="execution-logs"]').should('contain', 'Integration execution started');
      cy.get('[data-testid="execution-logs"]').should('contain', 'Reading files from storage source');
      cy.get('[data-testid="execution-logs"]').should('contain', 'Found 3 files matching pattern');
      cy.get('[data-testid="execution-logs"]').should('contain', 'Integration execution completed successfully');
    });
  });
  
  it('handles storage errors gracefully', function() {
    // Get the integration ID and invalid config ID
    const integrationId = this.testIntegrationId;
    const invalidConfigId = this.invalidConfigId;
    
    // Create a new flow with the invalid storage configuration
    cy.visit(`/integrations/${integrationId}/builder`);
    
    // Clear existing nodes
    cy.get('[data-testid="clear-flow-button"]').click();
    cy.get('[data-testid="confirm-clear-button"]').click();
    
    // Load test data from fixture
    cy.fixture('storage/integration_flow.json').then(integrationFlow => {
      // Add storage source node with invalid configuration
      cy.addStorageSourceNode(integrationId, invalidConfigId, integrationFlow.storageSourceOptions).then(invalidSourceNodeId => {
        // Add a destination node (can use any valid storage)
        cy.addStorageDestinationNode(integrationId, this.azureBlobConfigId, integrationFlow.storageDestinationOptions).then(destNodeId => {
          // Connect nodes
          cy.connectNodes(invalidSourceNodeId, destNodeId);
          
          // Save the flow
          cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
          cy.get('[data-testid="save-flow-button"]').click();
          cy.wait('@saveFlow');
          
          // Mock execution API for error case
          cy.intercept('POST', `/api/integrations/${integrationId}/execute`, {
            statusCode: 200,
            body: { executionId: 'error-execution-id' }
          }).as('executeIntegration');
          
          // Mock execution status API for error case
          cy.intercept('GET', `/api/executions/error-execution-id`, {
            statusCode: 200,
            body: integrationFlow.errorExecutionResult
          }).as('getErrorExecutionStatus');
          
          // Run the integration
          cy.visit(`/integrations/${integrationId}`);
          cy.get('[data-testid="run-integration-button"]').click();
          
          // Wait for execution to start
          cy.wait('@executeIntegration');
          
          // Navigate to execution page
          cy.visit(`/executions/error-execution-id`);
          
          // Verify execution failed
          cy.wait('@getErrorExecutionStatus');
          cy.get('[data-testid="execution-status"]').should('contain', 'FAILED');
          
          // Check error details
          cy.get('[data-testid="execution-error"]').should('contain', 'Failed to authenticate with storage provider');
          
          // Check execution logs
          cy.get('[data-testid="execution-logs-tab"]').click();
          cy.get('[data-testid="execution-logs"]').should('contain', 'Failed to connect to storage: Authentication failed');
          cy.get('[data-testid="execution-logs"]').should('contain', 'Storage connection error: Invalid credentials or expired token');
          cy.get('[data-testid="execution-logs"]').should('contain', 'Integration execution failed');
        });
      });
    });
  });
  
  it('deletes storage configuration', function() {
    // Get the S3 config ID
    const configId = this.s3ConfigId;
    
    // Delete the configuration
    cy.deleteStorageConfig(configId).then(() => {
      // Verify configuration is no longer in the list
      cy.visit('/admin/storage');
      cy.get('[data-testid="storage-search-input"]').clear().type('Test AWS S3');
      cy.get('[data-testid="search-storage-button"]').click();
      
      // Should show no results
      cy.get('[data-testid="no-results-message"]').should('be.visible');
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