// cypress/support/storage-commands.js

/**
 * Custom Cypress commands for storage configuration testing
 * 
 * These commands provide abstracted functionality for:
 * - Storage connection configuration
 * - Storage browsing
 * - File operations
 * - Integration with flows
 */

// Configure Azure Blob Storage connection
Cypress.Commands.add('configureAzureBlobStorage', (configData) => {
  // Navigate to storage configuration page
  cy.visit('/admin/storage');
  cy.get('[data-testid="add-storage-config-button"]').click();
  
  // Select Azure Blob Storage provider
  cy.get('[data-testid="storage-provider-select"]').select('AZURE_BLOB');
  
  // Fill out configuration form
  cy.get('[data-testid="storage-name-input"]').type(configData.name);
  cy.get('[data-testid="storage-description-input"]').type(configData.description);
  
  // Fill out Azure-specific fields
  cy.get('[data-testid="azure-account-name-input"]').type(configData.accountName);
  cy.get('[data-testid="azure-connection-string-input"]').type(configData.connectionString);
  cy.get('[data-testid="azure-container-input"]').type(configData.container);
  
  // If folder path is provided
  if (configData.folderPath) {
    cy.get('[data-testid="azure-folder-path-input"]').type(configData.folderPath);
  }
  
  // Save configuration
  cy.intercept('POST', '/api/storage/configurations').as('saveStorageConfig');
  cy.get('[data-testid="save-storage-config-button"]').click();
  
  // Wait for save to complete
  return cy.wait('@saveStorageConfig').then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    return cy.wrap(interception.response.body);
  });
});

// Configure AWS S3 connection
Cypress.Commands.add('configureS3Storage', (configData) => {
  // Navigate to storage configuration page
  cy.visit('/admin/storage');
  cy.get('[data-testid="add-storage-config-button"]').click();
  
  // Select S3 provider
  cy.get('[data-testid="storage-provider-select"]').select('AWS_S3');
  
  // Fill out configuration form
  cy.get('[data-testid="storage-name-input"]').type(configData.name);
  cy.get('[data-testid="storage-description-input"]').type(configData.description);
  
  // Fill out S3-specific fields
  cy.get('[data-testid="s3-region-input"]').type(configData.region);
  cy.get('[data-testid="s3-bucket-input"]').type(configData.bucket);
  cy.get('[data-testid="s3-access-key-input"]').type(configData.accessKey);
  cy.get('[data-testid="s3-secret-key-input"]').type(configData.secretKey);
  
  // If folder path is provided
  if (configData.folderPath) {
    cy.get('[data-testid="s3-folder-path-input"]').type(configData.folderPath);
  }
  
  // Save configuration
  cy.intercept('POST', '/api/storage/configurations').as('saveStorageConfig');
  cy.get('[data-testid="save-storage-config-button"]').click();
  
  // Wait for save to complete
  return cy.wait('@saveStorageConfig').then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    return cy.wrap(interception.response.body);
  });
});

// Configure SharePoint connection
Cypress.Commands.add('configureSharePointStorage', (configData) => {
  // Navigate to storage configuration page
  cy.visit('/admin/storage');
  cy.get('[data-testid="add-storage-config-button"]').click();
  
  // Select SharePoint provider
  cy.get('[data-testid="storage-provider-select"]').select('SHAREPOINT');
  
  // Fill out configuration form
  cy.get('[data-testid="storage-name-input"]').type(configData.name);
  cy.get('[data-testid="storage-description-input"]').type(configData.description);
  
  // Fill out SharePoint-specific fields
  cy.get('[data-testid="sharepoint-site-url-input"]').type(configData.siteUrl);
  cy.get('[data-testid="sharepoint-library-input"]').type(configData.library);
  
  // Handle authentication method
  if (configData.authMethod === 'OAUTH') {
    cy.get('[data-testid="sharepoint-auth-method-select"]').select('OAUTH');
    cy.get('[data-testid="sharepoint-connect-oauth-button"]').click();
    
    // Handle OAuth flow (mock for testing)
    cy.intercept('GET', '/api/auth/oauth/sharepoint/callback*').as('oauthCallback');
    cy.window().then(win => {
      win.postMessage({ type: 'OAUTH_CALLBACK', provider: 'sharepoint', success: true }, '*');
    });
    cy.wait('@oauthCallback');
  } else {
    cy.get('[data-testid="sharepoint-auth-method-select"]').select('CREDENTIALS');
    cy.get('[data-testid="sharepoint-username-input"]').type(configData.username);
    cy.get('[data-testid="sharepoint-password-input"]').type(configData.password);
  }
  
  // If folder path is provided
  if (configData.folderPath) {
    cy.get('[data-testid="sharepoint-folder-path-input"]').type(configData.folderPath);
  }
  
  // Save configuration
  cy.intercept('POST', '/api/storage/configurations').as('saveStorageConfig');
  cy.get('[data-testid="save-storage-config-button"]').click();
  
  // Wait for save to complete
  return cy.wait('@saveStorageConfig').then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    return cy.wrap(interception.response.body);
  });
});

// Get storage configuration by name
Cypress.Commands.add('getStorageConfig', (configName) => {
  // Navigate to storage configuration page
  cy.visit('/admin/storage');
  
  // Search for the configuration
  cy.get('[data-testid="storage-search-input"]').clear().type(configName);
  cy.get('[data-testid="search-storage-button"]').click();
  
  // Get the first matching configuration
  cy.get('[data-testid="storage-config-row"]').first().then($row => {
    const configId = $row.attr('data-config-id');
    cy.intercept('GET', `/api/storage/configurations/${configId}`).as('getStorageConfigDetails');
    cy.wrap($row).click();
    
    return cy.wait('@getStorageConfigDetails').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      return cy.wrap(interception.response.body);
    });
  });
});

// Update storage configuration
Cypress.Commands.add('updateStorageConfig', (configId, updateData) => {
  // Navigate to storage configuration detail page
  cy.visit(`/admin/storage/${configId}`);
  cy.get('[data-testid="edit-storage-config-button"]').click();
  
  // Update fields as needed
  if (updateData.name) {
    cy.get('[data-testid="storage-name-input"]').clear().type(updateData.name);
  }
  
  if (updateData.description) {
    cy.get('[data-testid="storage-description-input"]').clear().type(updateData.description);
  }
  
  // Update provider-specific fields
  const providerType = updateData.providerType || 'AZURE_BLOB'; // Default to Azure if not specified
  
  switch (providerType) {
    case 'AZURE_BLOB':
      if (updateData.accountName) {
        cy.get('[data-testid="azure-account-name-input"]').clear().type(updateData.accountName);
      }
      if (updateData.connectionString) {
        cy.get('[data-testid="azure-connection-string-input"]').clear().type(updateData.connectionString);
      }
      if (updateData.container) {
        cy.get('[data-testid="azure-container-input"]').clear().type(updateData.container);
      }
      if (updateData.folderPath) {
        cy.get('[data-testid="azure-folder-path-input"]').clear().type(updateData.folderPath);
      }
      break;
    
    case 'AWS_S3':
      if (updateData.region) {
        cy.get('[data-testid="s3-region-input"]').clear().type(updateData.region);
      }
      if (updateData.bucket) {
        cy.get('[data-testid="s3-bucket-input"]').clear().type(updateData.bucket);
      }
      if (updateData.accessKey) {
        cy.get('[data-testid="s3-access-key-input"]').clear().type(updateData.accessKey);
      }
      if (updateData.secretKey) {
        cy.get('[data-testid="s3-secret-key-input"]').clear().type(updateData.secretKey);
      }
      if (updateData.folderPath) {
        cy.get('[data-testid="s3-folder-path-input"]').clear().type(updateData.folderPath);
      }
      break;
      
    case 'SHAREPOINT':
      if (updateData.siteUrl) {
        cy.get('[data-testid="sharepoint-site-url-input"]').clear().type(updateData.siteUrl);
      }
      if (updateData.library) {
        cy.get('[data-testid="sharepoint-library-input"]').clear().type(updateData.library);
      }
      if (updateData.folderPath) {
        cy.get('[data-testid="sharepoint-folder-path-input"]').clear().type(updateData.folderPath);
      }
      break;
  }
  
  // Save configuration
  cy.intercept('PUT', `/api/storage/configurations/${configId}`).as('updateStorageConfig');
  cy.get('[data-testid="save-storage-config-button"]').click();
  
  // Wait for update to complete
  return cy.wait('@updateStorageConfig').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});

// Delete storage configuration
Cypress.Commands.add('deleteStorageConfig', (configId) => {
  // Navigate to storage configuration detail page
  cy.visit(`/admin/storage/${configId}`);
  cy.get('[data-testid="delete-storage-config-button"]').click();
  
  // Confirm deletion
  cy.get('[data-testid="confirm-delete-button"]').click();
  
  // Wait for delete to complete
  cy.intercept('DELETE', `/api/storage/configurations/${configId}`).as('deleteStorageConfig');
  return cy.wait('@deleteStorageConfig').then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 204]);
    return cy.wrap(true);
  });
});

// Test connection
Cypress.Commands.add('testStorageConnection', (configId) => {
  // Navigate to storage configuration detail page
  cy.visit(`/admin/storage/${configId}`);
  
  // Test connection
  cy.intercept('POST', `/api/storage/configurations/${configId}/test`).as('testConnection');
  cy.get('[data-testid="test-connection-button"]').click();
  
  // Wait for test to complete
  return cy.wait('@testConnection').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});

// Browse storage files
Cypress.Commands.add('browseStorageFiles', (configId, path = '/') => {
  // Navigate to storage browser
  cy.visit(`/admin/storage/${configId}/browser`);
  
  // If path is not root, navigate to it
  if (path !== '/') {
    // Split path into segments and navigate through each folder
    const segments = path.split('/').filter(segment => segment.length > 0);
    
    for (const segment of segments) {
      cy.intercept('GET', `/api/storage/${configId}/browse*`).as('browsePath');
      cy.contains('[data-testid="folder-item"]', segment).click();
      cy.wait('@browsePath');
    }
  }
  
  // Get file list
  cy.intercept('GET', `/api/storage/${configId}/browse*`).as('getFileList');
  return cy.wait('@getFileList').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});

// Upload file to storage
Cypress.Commands.add('uploadFileToStorage', (configId, folderPath, filePath) => {
  // Navigate to storage browser
  cy.visit(`/admin/storage/${configId}/browser`);
  
  // Navigate to folder path if provided
  if (folderPath && folderPath !== '/') {
    const segments = folderPath.split('/').filter(segment => segment.length > 0);
    
    for (const segment of segments) {
      cy.intercept('GET', `/api/storage/${configId}/browse*`).as('browsePath');
      cy.contains('[data-testid="folder-item"]', segment).click();
      cy.wait('@browsePath');
    }
  }
  
  // Upload file
  cy.intercept('POST', `/api/storage/${configId}/upload*`).as('uploadFile');
  cy.get('[data-testid="upload-file-input"]').selectFile(filePath, { force: true });
  
  // Wait for upload to complete
  return cy.wait('@uploadFile').then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    return cy.wrap(interception.response.body);
  });
});

// Download file from storage
Cypress.Commands.add('downloadFileFromStorage', (configId, filePath) => {
  // Navigate to storage browser
  cy.visit(`/admin/storage/${configId}/browser`);
  
  // Navigate to file path
  const segments = filePath.split('/');
  const fileName = segments.pop();
  const folderPath = segments.join('/');
  
  // Navigate to folder path if needed
  if (folderPath && folderPath !== '') {
    const folderSegments = folderPath.split('/').filter(segment => segment.length > 0);
    
    for (const segment of folderSegments) {
      cy.intercept('GET', `/api/storage/${configId}/browse*`).as('browsePath');
      cy.contains('[data-testid="folder-item"]', segment).click();
      cy.wait('@browsePath');
    }
  }
  
  // Find file and download it
  cy.contains('[data-testid="file-item"]', fileName).within(() => {
    cy.get('[data-testid="download-file-button"]').click();
  });
  
  // For test purposes, we can't actually verify the download since Cypress doesn't support this directly
  // But we can check if the download request was made
  cy.intercept('GET', `/api/storage/${configId}/download*`).as('downloadFile');
  return cy.wait('@downloadFile').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(true);
  });
});

// Create folder in storage
Cypress.Commands.add('createStorageFolder', (configId, parentPath, folderName) => {
  // Navigate to storage browser
  cy.visit(`/admin/storage/${configId}/browser`);
  
  // Navigate to parent path if provided
  if (parentPath && parentPath !== '/') {
    const segments = parentPath.split('/').filter(segment => segment.length > 0);
    
    for (const segment of segments) {
      cy.intercept('GET', `/api/storage/${configId}/browse*`).as('browsePath');
      cy.contains('[data-testid="folder-item"]', segment).click();
      cy.wait('@browsePath');
    }
  }
  
  // Create folder
  cy.get('[data-testid="create-folder-button"]').click();
  cy.get('[data-testid="folder-name-input"]').type(folderName);
  
  // Confirm folder creation
  cy.intercept('POST', `/api/storage/${configId}/folders*`).as('createFolder');
  cy.get('[data-testid="confirm-create-folder-button"]').click();
  
  // Wait for folder creation to complete
  return cy.wait('@createFolder').then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    return cy.wrap(interception.response.body);
  });
});

// Delete file or folder from storage
Cypress.Commands.add('deleteStorageItem', (configId, itemPath, itemType = 'file') => {
  // Navigate to storage browser
  cy.visit(`/admin/storage/${configId}/browser`);
  
  // Navigate to item path
  const segments = itemPath.split('/');
  const itemName = segments.pop();
  const parentPath = segments.join('/');
  
  // Navigate to parent path if needed
  if (parentPath && parentPath !== '') {
    const parentSegments = parentPath.split('/').filter(segment => segment.length > 0);
    
    for (const segment of parentSegments) {
      cy.intercept('GET', `/api/storage/${configId}/browse*`).as('browsePath');
      cy.contains('[data-testid="folder-item"]', segment).click();
      cy.wait('@browsePath');
    }
  }
  
  // Find item and delete it
  const testIdSelector = itemType === 'file' ? 'file-item' : 'folder-item';
  cy.contains(`[data-testid="${testIdSelector}"]`, itemName).within(() => {
    cy.get('[data-testid="delete-item-button"]').click();
  });
  
  // Confirm deletion
  cy.get('[data-testid="confirm-delete-button"]').click();
  
  // Wait for deletion to complete
  const endpoint = itemType === 'file' ? 'files' : 'folders';
  cy.intercept('DELETE', `/api/storage/${configId}/${endpoint}*`).as('deleteItem');
  return cy.wait('@deleteItem').then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 204]);
    return cy.wrap(true);
  });
});

// Search for files in storage
Cypress.Commands.add('searchStorageFiles', (configId, searchTerm) => {
  // Navigate to storage browser
  cy.visit(`/admin/storage/${configId}/browser`);
  
  // Search for files
  cy.get('[data-testid="storage-file-search-input"]').clear().type(searchTerm);
  cy.get('[data-testid="search-storage-files-button"]').click();
  
  // Get search results
  cy.intercept('GET', `/api/storage/${configId}/search*`).as('searchFiles');
  return cy.wait('@searchFiles').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    return cy.wrap(interception.response.body);
  });
});

// Preview file in storage
Cypress.Commands.add('previewStorageFile', (configId, filePath) => {
  // Navigate to storage browser
  cy.visit(`/admin/storage/${configId}/browser`);
  
  // Navigate to file path
  const segments = filePath.split('/');
  const fileName = segments.pop();
  const folderPath = segments.join('/');
  
  // Navigate to folder path if needed
  if (folderPath && folderPath !== '') {
    const folderSegments = folderPath.split('/').filter(segment => segment.length > 0);
    
    for (const segment of folderSegments) {
      cy.intercept('GET', `/api/storage/${configId}/browse*`).as('browsePath');
      cy.contains('[data-testid="folder-item"]', segment).click();
      cy.wait('@browsePath');
    }
  }
  
  // Find file and preview it
  cy.contains('[data-testid="file-item"]', fileName).within(() => {
    cy.get('[data-testid="preview-file-button"]').click();
  });
  
  // Wait for preview to load
  cy.intercept('GET', `/api/storage/${configId}/preview*`).as('previewFile');
  
  return cy.wait('@previewFile').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
    
    // Verify preview dialog is shown
    cy.get('[data-testid="file-preview-dialog"]').should('be.visible');
    
    // Check preview content
    cy.get('[data-testid="file-preview-content"]').should('exist');
    
    return cy.wrap(interception.response.body);
  });
});

// Add storage source node to integration flow
Cypress.Commands.add('addStorageSourceNode', (integrationId, storageConfigId, options = {}) => {
  // Open integration builder
  cy.visit(`/integrations/${integrationId}/builder`);
  
  // Add storage source node
  cy.get('[data-testid="add-node-button"]').click();
  cy.get('[data-testid="node-type-STORAGE_SOURCE"]').click();
  
  // Position node
  const position = options.position || { x: 200, y: 200 };
  cy.get('[data-testid="flow-canvas"]').click(position.x, position.y);
  
  // Get the created node id
  cy.get('[data-node-type="STORAGE_SOURCE"]').last().invoke('attr', 'data-node-id').then(nodeId => {
    // Configure storage source node
    cy.get(`[data-testid="node-${nodeId}"]`).click();
    cy.get('[data-testid="storage-config-select"]').select(storageConfigId);
    
    // Fill out file path and filter options if provided
    if (options.filePath) {
      cy.get('[data-testid="file-path-input"]').type(options.filePath);
    }
    
    if (options.filePattern) {
      cy.get('[data-testid="file-pattern-input"]').type(options.filePattern);
    }
    
    if (options.recursive !== undefined) {
      cy.get('[data-testid="recursive-checkbox"]').then($checkbox => {
        if ((options.recursive && !$checkbox.is(':checked')) || 
            (!options.recursive && $checkbox.is(':checked'))) {
          cy.wrap($checkbox).click();
        }
      });
    }
    
    if (options.triggerType) {
      cy.get('[data-testid="trigger-type-select"]').select(options.triggerType);
      
      if (options.triggerType === 'SCHEDULE' && options.cronExpression) {
        cy.get('[data-testid="cron-expression-input"]').type(options.cronExpression);
      }
    }
    
    // Apply node configuration
    cy.get('[data-testid="apply-node-config-button"]').click();
    
    // Return node id
    return cy.wrap(nodeId);
  });
});

// Add storage destination node to integration flow
Cypress.Commands.add('addStorageDestinationNode', (integrationId, storageConfigId, options = {}) => {
  // Open integration builder
  cy.visit(`/integrations/${integrationId}/builder`);
  
  // Add storage destination node
  cy.get('[data-testid="add-node-button"]').click();
  cy.get('[data-testid="node-type-STORAGE_DESTINATION"]').click();
  
  // Position node
  const position = options.position || { x: 600, y: 200 };
  cy.get('[data-testid="flow-canvas"]').click(position.x, position.y);
  
  // Get the created node id
  cy.get('[data-node-type="STORAGE_DESTINATION"]').last().invoke('attr', 'data-node-id').then(nodeId => {
    // Configure storage destination node
    cy.get(`[data-testid="node-${nodeId}"]`).click();
    cy.get('[data-testid="storage-config-select"]').select(storageConfigId);
    
    // Fill out destination path options
    if (options.destinationPath) {
      cy.get('[data-testid="destination-path-input"]').type(options.destinationPath);
    }
    
    if (options.fileNamePattern) {
      cy.get('[data-testid="file-name-pattern-input"]').type(options.fileNamePattern);
    }
    
    if (options.overwrite !== undefined) {
      cy.get('[data-testid="overwrite-checkbox"]').then($checkbox => {
        if ((options.overwrite && !$checkbox.is(':checked')) || 
            (!options.overwrite && $checkbox.is(':checked'))) {
          cy.wrap($checkbox).click();
        }
      });
    }
    
    if (options.createPath !== undefined) {
      cy.get('[data-testid="create-path-checkbox"]').then($checkbox => {
        if ((options.createPath && !$checkbox.is(':checked')) || 
            (!options.createPath && $checkbox.is(':checked'))) {
          cy.wrap($checkbox).click();
        }
      });
    }
    
    // Apply node configuration
    cy.get('[data-testid="apply-node-config-button"]').click();
    
    // Return node id
    return cy.wrap(nodeId);
  });
});