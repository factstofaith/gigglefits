/**
 * Entity Generators for Cypress
 * 
 * These generators provide test data for Cypress E2E tests while maintaining
 * consistency with the unit test data generators. This reuses logic from
 * the entity generators but removes Jest dependencies.
 * 
 * Note: This file is kept for backward compatibility, but new code should use
 * the mockFactoryAdapter which provides consistent data with Jest tests.
 */

// Helper for generating IDs (duplicated because we can't import from outside Cypress)
const generateId = () => `id-${Math.random().toString(36).substr(2, 9)}`;

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