/**
 * Relationship Validator for Test Data
 * 
 * This module provides functions for validating relationships between
 * test data entities, ensuring consistency and correctness.
 * 
 * @version 1.0.0
 */

/**
 * Error class for relationship validation failures
 */
export class RelationshipValidationError extends Error {
  constructor(message, entity, field, relatedEntity, relatedField, entityValue, relatedValue) {
    super(message);
    this.name = 'RelationshipValidationError';
    this.entity = entity;
    this.field = field;
    this.relatedEntity = relatedEntity;
    this.relatedField = relatedField;
    this.entityValue = entityValue;
    this.relatedValue = relatedValue;
  }

  /**
   * Get a formatted error message for this validation error
   * @returns {string} Formatted error message
   */
  getFormattedMessage() {
    return `${this.message}\n` +
      `  Entity: ${this.entity}\n` +
      `  Field: ${this.field}\n` +
      `  Value: ${JSON.stringify(this.entityValue)}\n` +
      `  Related Entity: ${this.relatedEntity}\n` +
      `  Related Field: ${this.relatedField}\n` +
      `  Related Value: ${JSON.stringify(this.relatedValue)}`;
  }
}

/**
 * Check if a related entity exists
 * @param {string} entityType Type of entity to look for
 * @param {string} idField Field containing the ID to match
 * @param {string} idValue Value of the ID to match
 * @param {Object} context Context with related entities
 * @returns {boolean} True if entity exists
 */
const entityExists = (entityType, idField, idValue, context) => {
  // Added display name
  entityExists.displayName = 'entityExists';

  // Added display name
  entityExists.displayName = 'entityExists';

  // Added display name
  entityExists.displayName = 'entityExists';

  // Added display name
  entityExists.displayName = 'entityExists';

  if (!context[entityType] || !Array.isArray(context[entityType])) {
    return false;
  }
  
  return context[entityType].some(entity => entity[idField] === idValue);
};

/**
 * Get a related entity
 * @param {string} entityType Type of entity to look for
 * @param {string} idField Field containing the ID to match
 * @param {string} idValue Value of the ID to match
 * @param {Object} context Context with related entities
 * @returns {Object|null} The related entity or null if not found
 */
const getRelatedEntity = (entityType, idField, idValue, context) => {
  // Added display name
  getRelatedEntity.displayName = 'getRelatedEntity';

  // Added display name
  getRelatedEntity.displayName = 'getRelatedEntity';

  // Added display name
  getRelatedEntity.displayName = 'getRelatedEntity';

  // Added display name
  getRelatedEntity.displayName = 'getRelatedEntity';

  if (!context[entityType] || !Array.isArray(context[entityType])) {
    return null;
  }
  
  return context[entityType].find(entity => entity[idField] === idValue) || null;
};

/**
 * Validate tenant relationships
 * @param {Object} tenant Tenant to validate
 * @param {Object} context Context with related entities
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateTenantRelationships = (tenant, context = {}) => {
  // Added display name
  validateTenantRelationships.displayName = 'validateTenantRelationships';

  // Added display name
  validateTenantRelationships.displayName = 'validateTenantRelationships';

  // Added display name
  validateTenantRelationships.displayName = 'validateTenantRelationships';

  // Added display name
  validateTenantRelationships.displayName = 'validateTenantRelationships';

  const errors = [];
  
  // No specific relationships to validate for tenant (it's a root entity)
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validate user relationships
 * @param {Object} user User to validate
 * @param {Object} context Context with related entities
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateUserRelationships = (user, context = {}) => {
  // Added display name
  validateUserRelationships.displayName = 'validateUserRelationships';

  // Added display name
  validateUserRelationships.displayName = 'validateUserRelationships';

  // Added display name
  validateUserRelationships.displayName = 'validateUserRelationships';

  // Added display name
  validateUserRelationships.displayName = 'validateUserRelationships';

  const errors = [];
  
  // Validate tenantId relationship if context includes tenants
  if (user.tenantId && context.tenants) {
    const tenantExists = entityExists('tenants', 'id', user.tenantId, context);
    if (!tenantExists) {
      errors.push(new RelationshipValidationError(
        `User references a tenant that doesn't exist`,
        'user',
        'tenantId',
        'tenant',
        'id',
        user.tenantId,
        null
      ));
    }
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validate application relationships
 * @param {Object} application Application to validate
 * @param {Object} context Context with related entities
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateApplicationRelationships = (application, context = {}) => {
  // Added display name
  validateApplicationRelationships.displayName = 'validateApplicationRelationships';

  // Added display name
  validateApplicationRelationships.displayName = 'validateApplicationRelationships';

  // Added display name
  validateApplicationRelationships.displayName = 'validateApplicationRelationships';

  // Added display name
  validateApplicationRelationships.displayName = 'validateApplicationRelationships';

  const errors = [];
  
  // Validate tenantId relationship if context includes tenants
  if (application.tenantId && context.tenants) {
    const tenantExists = entityExists('tenants', 'id', application.tenantId, context);
    if (!tenantExists) {
      errors.push(new RelationshipValidationError(
        `Application references a tenant that doesn't exist`,
        'application',
        'tenantId',
        'tenant',
        'id',
        application.tenantId,
        null
      ));
    }
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validate dataset relationships
 * @param {Object} dataset Dataset to validate
 * @param {Object} context Context with related entities
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateDatasetRelationships = (dataset, context = {}) => {
  // Added display name
  validateDatasetRelationships.displayName = 'validateDatasetRelationships';

  // Added display name
  validateDatasetRelationships.displayName = 'validateDatasetRelationships';

  // Added display name
  validateDatasetRelationships.displayName = 'validateDatasetRelationships';

  // Added display name
  validateDatasetRelationships.displayName = 'validateDatasetRelationships';

  const errors = [];
  
  // Validate tenantId relationship if context includes tenants
  if (dataset.tenantId && context.tenants) {
    const tenantExists = entityExists('tenants', 'id', dataset.tenantId, context);
    if (!tenantExists) {
      errors.push(new RelationshipValidationError(
        `Dataset references a tenant that doesn't exist`,
        'dataset',
        'tenantId',
        'tenant',
        'id',
        dataset.tenantId,
        null
      ));
    }
  }
  
  // Validate sourceId relationship if source is 'application' and context includes applications
  if (dataset.source === 'application' && dataset.sourceId && context.applications) {
    const applicationExists = entityExists('applications', 'id', dataset.sourceId, context);
    if (!applicationExists) {
      errors.push(new RelationshipValidationError(
        `Dataset references an application that doesn't exist`,
        'dataset',
        'sourceId',
        'application',
        'id',
        dataset.sourceId,
        null
      ));
    }
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validate integration relationships
 * @param {Object} integration Integration to validate
 * @param {Object} context Context with related entities
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateIntegrationRelationships = (integration, context = {}) => {
  // Added display name
  validateIntegrationRelationships.displayName = 'validateIntegrationRelationships';

  // Added display name
  validateIntegrationRelationships.displayName = 'validateIntegrationRelationships';

  // Added display name
  validateIntegrationRelationships.displayName = 'validateIntegrationRelationships';

  // Added display name
  validateIntegrationRelationships.displayName = 'validateIntegrationRelationships';

  const errors = [];
  
  // Validate tenantId relationship if context includes tenants
  if (integration.tenantId && context.tenants) {
    const tenantExists = entityExists('tenants', 'id', integration.tenantId, context);
    if (!tenantExists) {
      errors.push(new RelationshipValidationError(
        `Integration references a tenant that doesn't exist`,
        'integration',
        'tenantId',
        'tenant',
        'id',
        integration.tenantId,
        null
      ));
    }
  }
  
  // Validate createdBy relationship if context includes users
  if (integration.createdBy && context.users) {
    const userExists = entityExists('users', 'id', integration.createdBy, context);
    if (!userExists) {
      errors.push(new RelationshipValidationError(
        `Integration references a user that doesn't exist`,
        'integration',
        'createdBy',
        'user',
        'id',
        integration.createdBy,
        null
      ));
    }
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validate storage config relationships
 * @param {Object} storageConfig Storage config to validate
 * @param {Object} context Context with related entities
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateStorageConfigRelationships = (storageConfig, context = {}) => {
  // Added display name
  validateStorageConfigRelationships.displayName = 'validateStorageConfigRelationships';

  // Added display name
  validateStorageConfigRelationships.displayName = 'validateStorageConfigRelationships';

  // Added display name
  validateStorageConfigRelationships.displayName = 'validateStorageConfigRelationships';

  // Added display name
  validateStorageConfigRelationships.displayName = 'validateStorageConfigRelationships';

  const errors = [];
  
  // Validate tenantId relationship if context includes tenants
  if (storageConfig.tenantId && context.tenants) {
    const tenantExists = entityExists('tenants', 'id', storageConfig.tenantId, context);
    if (!tenantExists) {
      errors.push(new RelationshipValidationError(
        `Storage config references a tenant that doesn't exist`,
        'storageConfig',
        'tenantId',
        'tenant',
        'id',
        storageConfig.tenantId,
        null
      ));
    }
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validate error log relationships
 * @param {Object} errorLog Error log to validate
 * @param {Object} context Context with related entities
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateErrorLogRelationships = (errorLog, context = {}) => {
  // Added display name
  validateErrorLogRelationships.displayName = 'validateErrorLogRelationships';

  // Added display name
  validateErrorLogRelationships.displayName = 'validateErrorLogRelationships';

  // Added display name
  validateErrorLogRelationships.displayName = 'validateErrorLogRelationships';

  // Added display name
  validateErrorLogRelationships.displayName = 'validateErrorLogRelationships';

  const errors = [];
  
  // Validate tenantId relationship if context includes tenants
  if (errorLog.tenantId && context.tenants) {
    const tenantExists = entityExists('tenants', 'id', errorLog.tenantId, context);
    if (!tenantExists) {
      errors.push(new RelationshipValidationError(
        `Error log references a tenant that doesn't exist`,
        'errorLog',
        'tenantId',
        'tenant',
        'id',
        errorLog.tenantId,
        null
      ));
    }
  }
  
  // Validate userId relationship if context includes users
  if (errorLog.userId && context.users) {
    const userExists = entityExists('users', 'id', errorLog.userId, context);
    if (!userExists) {
      errors.push(new RelationshipValidationError(
        `Error log references a user that doesn't exist`,
        'errorLog',
        'userId',
        'user',
        'id',
        errorLog.userId,
        null
      ));
    }
  }
  
  // Validate source-specific relationships
  if (errorLog.source && errorLog.sourceId) {
    // For integration source
    if (errorLog.source === 'integration' && context.integrations) {
      const integrationExists = entityExists('integrations', 'id', errorLog.sourceId, context);
      if (!integrationExists) {
        errors.push(new RelationshipValidationError(
          `Error log references an integration that doesn't exist`,
          'errorLog',
          'sourceId',
          'integration',
          'id',
          errorLog.sourceId,
          null
        ));
      }
    }
    
    // For application source
    if (errorLog.source === 'application' && context.applications) {
      const applicationExists = entityExists('applications', 'id', errorLog.sourceId, context);
      if (!applicationExists) {
        errors.push(new RelationshipValidationError(
          `Error log references an application that doesn't exist`,
          'errorLog',
          'sourceId',
          'application',
          'id',
          errorLog.sourceId,
          null
        ));
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validate relationships between all entities in a test data context
 * @param {Object} context Context with all entities
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateAllRelationships = (context) => {
  // Added display name
  validateAllRelationships.displayName = 'validateAllRelationships';

  // Added display name
  validateAllRelationships.displayName = 'validateAllRelationships';

  // Added display name
  validateAllRelationships.displayName = 'validateAllRelationships';

  // Added display name
  validateAllRelationships.displayName = 'validateAllRelationships';

  const allErrors = [];
  
  // Validate all users
  if (context.users) {
    context.users.forEach((user, index) => {
      const result = validateUserRelationships(user, context);
      if (!result.valid) {
        // Add index to errors for better reporting
        result.errors.forEach(error => {
          error.index = index;
          error.message = `User[${index}]: ${error.message}`;
        });
        allErrors.push(...result.errors);
      }
    });
  }
  
  // Validate all applications
  if (context.applications) {
    context.applications.forEach((application, index) => {
      const result = validateApplicationRelationships(application, context);
      if (!result.valid) {
        result.errors.forEach(error => {
          error.index = index;
          error.message = `Application[${index}]: ${error.message}`;
        });
        allErrors.push(...result.errors);
      }
    });
  }
  
  // Validate all datasets
  if (context.datasets) {
    context.datasets.forEach((dataset, index) => {
      const result = validateDatasetRelationships(dataset, context);
      if (!result.valid) {
        result.errors.forEach(error => {
          error.index = index;
          error.message = `Dataset[${index}]: ${error.message}`;
        });
        allErrors.push(...result.errors);
      }
    });
  }
  
  // Validate all integrations
  if (context.integrations) {
    context.integrations.forEach((integration, index) => {
      const result = validateIntegrationRelationships(integration, context);
      if (!result.valid) {
        result.errors.forEach(error => {
          error.index = index;
          error.message = `Integration[${index}]: ${error.message}`;
        });
        allErrors.push(...result.errors);
      }
    });
  }
  
  // Validate all storage configs
  if (context.storageConfigs) {
    context.storageConfigs.forEach((storageConfig, index) => {
      const result = validateStorageConfigRelationships(storageConfig, context);
      if (!result.valid) {
        result.errors.forEach(error => {
          error.index = index;
          error.message = `StorageConfig[${index}]: ${error.message}`;
        });
        allErrors.push(...result.errors);
      }
    });
  }
  
  // Validate all error logs
  if (context.errorLogs) {
    context.errorLogs.forEach((errorLog, index) => {
      const result = validateErrorLogRelationships(errorLog, context);
      if (!result.valid) {
        result.errors.forEach(error => {
          error.index = index;
          error.message = `ErrorLog[${index}]: ${error.message}`;
        });
        allErrors.push(...result.errors);
      }
    });
  }
  
  return { valid: allErrors.length === 0, errors: allErrors };
};

/**
 * Formats relationship validation errors into a readable string
 * @param {Array} errors Array of relationship validation errors
 * @returns {string} Formatted error message
 */
export const formatRelationshipErrors = (errors) => {
  // Added display name
  formatRelationshipErrors.displayName = 'formatRelationshipErrors';

  // Added display name
  formatRelationshipErrors.displayName = 'formatRelationshipErrors';

  // Added display name
  formatRelationshipErrors.displayName = 'formatRelationshipErrors';

  // Added display name
  formatRelationshipErrors.displayName = 'formatRelationshipErrors';

  if (!errors || errors.length === 0) return 'No relationship validation errors';
  
  return errors.map((err, index) => {
    return `Error ${index + 1}: ${err.getFormattedMessage()}`;
  }).join('\n\n');
};