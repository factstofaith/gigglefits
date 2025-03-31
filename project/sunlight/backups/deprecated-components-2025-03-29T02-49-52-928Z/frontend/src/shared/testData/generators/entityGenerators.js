/**
 * Entity Generators for Test Data
 * 
 * This module provides functions for generating test data entities
 * including users, tenants, applications, and datasets.
 * 
 * These generators are environment-agnostic and can be used in both
 * Jest and Cypress test environments.
 * 
 * @version 1.0.0
 */

/**
 * Helper for generating IDs (safe for all environments)
 * @returns {string} Unique ID
 */
export const generateId = () => `id-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Generate a test user
 * @param {Object} overrides Properties to override
 * @returns {Object} User entity
 */
export const generateUser = (overrides = {}) => ({
  id: generateId(),
  name: 'Test User',
  email: 'test.user@example.com',
  role: 'user',
  createdAt: new Date('2025-01-01').toISOString(),
  updatedAt: new Date('2025-01-01').toISOString(),
  status: 'active',
  tenantId: 'tenant-1',
  ...overrides
});

/**
 * Generate an admin user
 * @param {Object} overrides Properties to override
 * @returns {Object} Admin user entity
 */
export const generateAdminUser = (overrides = {}) => ({
  ...generateUser(),
  role: 'admin',
  permissions: ['read:all', 'write:all', 'delete:all', 'admin:all'],
  ...overrides
});

/**
 * Generate a list of users
 * @param {number} count Number of users to generate
 * @param {Object} overrides Properties to override in all users
 * @returns {Array} Array of user entities
 */
export const generateUserList = (count = 3, overrides = {}) => {
  // Added display name
  generateUserList.displayName = 'generateUserList';

  // Added display name
  generateUserList.displayName = 'generateUserList';

  // Added display name
  generateUserList.displayName = 'generateUserList';

  // Added display name
  generateUserList.displayName = 'generateUserList';

  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(generateUser({
      id: `user-${i + 1}`,
      name: `Test User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      ...overrides
    }));
  }
  return users;
};

/**
 * Generate a tenant
 * @param {Object} overrides Properties to override
 * @returns {Object} Tenant entity
 */
export const generateTenant = (overrides = {}) => ({
  id: generateId(),
  name: 'Test Tenant',
  displayName: 'Test Tenant Organization',
  domain: 'test-tenant.example.com',
  createdAt: new Date('2025-01-01').toISOString(),
  updatedAt: new Date('2025-01-01').toISOString(),
  status: 'active',
  plan: 'standard',
  settings: {
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    theme: 'light'
  },
  features: ['integration-builder', 'dataset-management', 'api-connections'],
  ...overrides
});

/**
 * Generate a list of tenants
 * @param {number} count Number of tenants to generate
 * @param {Object} overrides Properties to override in all tenants
 * @returns {Array} Array of tenant entities
 */
export const generateTenantList = (count = 3, overrides = {}) => {
  // Added display name
  generateTenantList.displayName = 'generateTenantList';

  // Added display name
  generateTenantList.displayName = 'generateTenantList';

  // Added display name
  generateTenantList.displayName = 'generateTenantList';

  // Added display name
  generateTenantList.displayName = 'generateTenantList';

  const tenants = [];
  for (let i = 0; i < count; i++) {
    tenants.push(generateTenant({
      id: `tenant-${i + 1}`,
      name: `Test Tenant ${i + 1}`,
      displayName: `Test Tenant Organization ${i + 1}`,
      domain: `tenant-${i + 1}.example.com`,
      ...overrides
    }));
  }
  return tenants;
};

/**
 * Generate an application
 * @param {Object} overrides Properties to override
 * @returns {Object} Application entity
 */
export const generateApplication = (overrides = {}) => ({
  id: generateId(),
  name: 'Test Application',
  description: 'A test application for integration',
  type: 'api',
  status: 'active',
  createdAt: new Date('2025-01-01').toISOString(),
  updatedAt: new Date('2025-01-01').toISOString(),
  tenantId: 'tenant-1',
  configuration: {
    baseUrl: 'https://api.test-app.example.com',
    authType: 'oauth2',
    apiVersion: 'v1'
  },
  tags: ['test', 'api', 'integration'],
  ...overrides
});

/**
 * Generate a list of applications
 * @param {number} count Number of applications to generate
 * @param {Object} overrides Properties to override in all applications
 * @returns {Array} Array of application entities
 */
export const generateApplicationList = (count = 3, overrides = {}) => {
  // Added display name
  generateApplicationList.displayName = 'generateApplicationList';

  // Added display name
  generateApplicationList.displayName = 'generateApplicationList';

  // Added display name
  generateApplicationList.displayName = 'generateApplicationList';

  // Added display name
  generateApplicationList.displayName = 'generateApplicationList';

  const applications = [];
  for (let i = 0; i < count; i++) {
    applications.push(generateApplication({
      id: `app-${i + 1}`,
      name: `Test Application ${i + 1}`,
      type: i % 2 === 0 ? 'api' : 'database',
      ...overrides
    }));
  }
  return applications;
};

/**
 * Generate a dataset
 * @param {Object} overrides Properties to override
 * @returns {Object} Dataset entity
 */
export const generateDataset = (overrides = {}) => ({
  id: generateId(),
  name: 'Test Dataset',
  description: 'A test dataset for transformation',
  schema: {
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'value', type: 'number', required: false },
      { name: 'active', type: 'boolean', required: false },
      { name: 'createdAt', type: 'date', required: false }
    ]
  },
  source: 'application',
  sourceId: 'app-1',
  tenantId: 'tenant-1',
  status: 'active',
  createdAt: new Date('2025-01-01').toISOString(),
  updatedAt: new Date('2025-01-01').toISOString(),
  ...overrides
});

/**
 * Generate a list of datasets
 * @param {number} count Number of datasets to generate
 * @param {Object} overrides Properties to override in all datasets
 * @returns {Array} Array of dataset entities
 */
export const generateDatasetList = (count = 3, overrides = {}) => {
  // Added display name
  generateDatasetList.displayName = 'generateDatasetList';

  // Added display name
  generateDatasetList.displayName = 'generateDatasetList';

  // Added display name
  generateDatasetList.displayName = 'generateDatasetList';

  // Added display name
  generateDatasetList.displayName = 'generateDatasetList';

  const datasets = [];
  for (let i = 0; i < count; i++) {
    datasets.push(generateDataset({
      id: `dataset-${i + 1}`,
      name: `Test Dataset ${i + 1}`,
      sourceId: `app-${i % 3 + 1}`,
      ...overrides
    }));
  }
  return datasets;
};

/**
 * Generate an integration
 * @param {Object} overrides Properties to override
 * @returns {Object} Integration entity
 */
export const generateIntegration = (overrides = {}) => ({
  id: generateId(),
  name: 'Test Integration',
  description: 'A test integration flow',
  status: 'active',
  createdAt: new Date('2025-01-01').toISOString(),
  updatedAt: new Date('2025-01-01').toISOString(),
  lastExecutedAt: null,
  createdBy: 'user-1',
  tenantId: 'tenant-1',
  schedule: null,
  version: 1,
  tags: ['test', 'integration'],
  isTemplate: false,
  ...overrides
});

/**
 * Generate a list of integrations
 * @param {number} count Number of integrations to generate
 * @param {Object} overrides Properties to override in all integrations
 * @returns {Array} Array of integration entities
 */
export const generateIntegrationList = (count = 3, overrides = {}) => {
  // Added display name
  generateIntegrationList.displayName = 'generateIntegrationList';

  // Added display name
  generateIntegrationList.displayName = 'generateIntegrationList';

  // Added display name
  generateIntegrationList.displayName = 'generateIntegrationList';

  // Added display name
  generateIntegrationList.displayName = 'generateIntegrationList';

  const integrations = [];
  for (let i = 0; i < count; i++) {
    integrations.push(generateIntegration({
      id: `integration-${i + 1}`,
      name: `Test Integration ${i + 1}`,
      status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'draft' : 'archived',
      ...overrides
    }));
  }
  return integrations;
};

/**
 * Generate a storage configuration
 * @param {Object} overrides Properties to override
 * @returns {Object} Storage configuration entity
 */
export const generateStorageConfig = (overrides = {}) => ({
  id: generateId(),
  name: 'Test Storage',
  type: 'azure_blob',
  status: 'active',
  createdAt: new Date('2025-01-01').toISOString(),
  updatedAt: new Date('2025-01-01').toISOString(),
  tenantId: 'tenant-1',
  configuration: {
    connectionString: '<redacted>',
    containerName: 'test-container',
    isDefault: true
  },
  ...overrides
});

/**
 * Generate a list of storage configurations
 * @param {number} count Number of storage configurations to generate
 * @param {Object} overrides Properties to override in all storage configs
 * @returns {Array} Array of storage configuration entities
 */
export const generateStorageConfigList = (count = 2, overrides = {}) => {
  // Added display name
  generateStorageConfigList.displayName = 'generateStorageConfigList';

  // Added display name
  generateStorageConfigList.displayName = 'generateStorageConfigList';

  // Added display name
  generateStorageConfigList.displayName = 'generateStorageConfigList';

  // Added display name
  generateStorageConfigList.displayName = 'generateStorageConfigList';

  const types = ['azure_blob', 's3', 'sharepoint'];
  const storageConfigs = [];
  for (let i = 0; i < count; i++) {
    storageConfigs.push(generateStorageConfig({
      id: `storage-${i + 1}`,
      name: `Test Storage ${i + 1}`,
      type: types[i % types.length],
      configuration: {
        connectionString: '<redacted>',
        containerName: `test-container-${i + 1}`,
        isDefault: i === 0
      },
      ...overrides
    }));
  }
  return storageConfigs;
};

/**
 * Generate an error log
 * @param {Object} overrides Properties to override
 * @returns {Object} Error log entity
 */
export const generateErrorLog = (overrides = {}) => ({
  id: generateId(),
  timestamp: new Date().toISOString(),
  level: 'error',
  message: 'Test error message',
  stackTrace: 'Error: Test error\n    at TestFunction (/path/to/file.js:123:45)',
  source: 'integration',
  sourceId: 'integration-1',
  userId: 'user-1',
  tenantId: 'tenant-1',
  metadata: {
    browser: 'Chrome',
    os: 'Windows',
    component: 'IntegrationFlowCanvas'
  },
  ...overrides
});

/**
 * Generate a list of error logs
 * @param {number} count Number of error logs to generate
 * @param {Object} overrides Properties to override in all error logs
 * @returns {Array} Array of error log entities
 */
export const generateErrorLogList = (count = 5, overrides = {}) => {
  // Added display name
  generateErrorLogList.displayName = 'generateErrorLogList';

  // Added display name
  generateErrorLogList.displayName = 'generateErrorLogList';

  // Added display name
  generateErrorLogList.displayName = 'generateErrorLogList';

  // Added display name
  generateErrorLogList.displayName = 'generateErrorLogList';

  const levels = ['error', 'warning', 'info'];
  const sources = ['integration', 'api', 'ui', 'auth'];
  const errorLogs = [];
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - i * 10);
    
    errorLogs.push(generateErrorLog({
      id: `error-${i + 1}`,
      timestamp: timestamp.toISOString(),
      level: levels[i % levels.length],
      source: sources[i % sources.length],
      message: `Test ${levels[i % levels.length]} message ${i + 1}`,
      ...overrides
    }));
  }
  
  return errorLogs;
};