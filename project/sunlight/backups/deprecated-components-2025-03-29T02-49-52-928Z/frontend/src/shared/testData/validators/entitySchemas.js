/**
 * Entity Schemas for Test Data Validation
 * 
 * This module provides schemas for validating entity test data, ensuring
 * consistency and correctness of generated test data.
 * 
 * @version 1.0.0
 */

/**
 * Schema for validating user entities
 */
export const userSchema = {
  type: 'object',
  required: ['id', 'name', 'email', 'role', 'status', 'tenantId'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { 
      type: 'string',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    },
    role: { 
      type: 'string',
      enum: ['admin', 'user', 'guest', 'manager', 'developer']
    },
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'pending', 'suspended']
    },
    createdAt: { type: ['string', 'date'] },
    updatedAt: { type: ['string', 'date'] },
    tenantId: { type: 'string' },
    permissions: { 
      type: 'array',
      items: { type: 'string' }
    }
  }
};

/**
 * Schema for validating tenant entities
 */
export const tenantSchema = {
  type: 'object',
  required: ['id', 'name', 'status'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    displayName: { type: 'string' },
    domain: { 
      type: 'string',
      pattern: '^[a-zA-Z0-9][a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    },
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'pending', 'suspended']
    },
    plan: {
      type: 'string',
      enum: ['free', 'standard', 'premium', 'enterprise']
    },
    createdAt: { type: ['string', 'date'] },
    updatedAt: { type: ['string', 'date'] },
    settings: {
      type: 'object',
      properties: {
        timezone: { type: 'string' },
        dateFormat: { type: 'string' },
        theme: { 
          type: 'string',
          enum: ['light', 'dark', 'system'] 
        }
      }
    },
    features: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

/**
 * Schema for validating application entities
 */
export const applicationSchema = {
  type: 'object',
  required: ['id', 'name', 'type', 'status', 'tenantId'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    type: { 
      type: 'string',
      enum: ['api', 'database', 'file', 'custom']
    },
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'pending', 'archived']
    },
    createdAt: { type: ['string', 'date'] },
    updatedAt: { type: ['string', 'date'] },
    tenantId: { type: 'string' },
    configuration: { type: 'object' },
    tags: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

/**
 * Schema for validating dataset entities
 */
export const datasetSchema = {
  type: 'object',
  required: ['id', 'name', 'schema', 'source', 'sourceId', 'tenantId', 'status'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    schema: {
      type: 'object',
      required: ['fields'],
      properties: {
        fields: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'type'],
            properties: {
              name: { type: 'string' },
              type: { 
                type: 'string',
                enum: ['string', 'number', 'boolean', 'date', 'object', 'array']
              },
              required: { type: 'boolean' }
            }
          }
        }
      }
    },
    source: { 
      type: 'string',
      enum: ['application', 'file', 'manual', 'api']
    },
    sourceId: { type: 'string' },
    tenantId: { type: 'string' },
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'draft', 'archived']
    },
    createdAt: { type: ['string', 'date'] },
    updatedAt: { type: ['string', 'date'] }
  }
};

/**
 * Schema for validating integration entities
 */
export const integrationSchema = {
  type: 'object',
  required: ['id', 'name', 'status', 'createdBy', 'tenantId'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'draft', 'archived', 'error', 'running']
    },
    createdAt: { type: ['string', 'date'] },
    updatedAt: { type: ['string', 'date'] },
    lastExecutedAt: { type: ['string', 'date', 'null'] },
    createdBy: { type: 'string' },
    tenantId: { type: 'string' },
    schedule: { type: ['string', 'object', 'null'] },
    version: { type: 'number' },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    isTemplate: { type: 'boolean' }
  }
};

/**
 * Schema for validating storage configuration entities
 */
export const storageConfigSchema = {
  type: 'object',
  required: ['id', 'name', 'type', 'status', 'tenantId', 'configuration'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    type: { 
      type: 'string',
      enum: ['azure_blob', 's3', 'sharepoint', 'file', 'google_drive']
    },
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'error', 'pending']
    },
    createdAt: { type: ['string', 'date'] },
    updatedAt: { type: ['string', 'date'] },
    tenantId: { type: 'string' },
    configuration: {
      type: 'object',
      required: ['isDefault'],
      properties: {
        connectionString: { type: 'string' },
        containerName: { type: 'string' },
        isDefault: { type: 'boolean' }
      }
    }
  }
};

/**
 * Schema for validating error log entities
 */
export const errorLogSchema = {
  type: 'object',
  required: ['id', 'timestamp', 'level', 'message', 'source'],
  properties: {
    id: { type: 'string' },
    timestamp: { type: ['string', 'date'] },
    level: { 
      type: 'string',
      enum: ['error', 'warning', 'info', 'debug']
    },
    message: { type: 'string' },
    stackTrace: { type: 'string' },
    source: { type: 'string' },
    sourceId: { type: 'string' },
    userId: { type: 'string' },
    tenantId: { type: 'string' },
    metadata: { type: 'object' }
  }
};