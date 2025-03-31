/**
 * Test Data Validators
 * 
 * This module exports validation utilities for ensuring test data integrity
 * across different testing environments.
 * 
 * @version 1.0.0
 */

export * from './schemaValidator';
export * from './relationshipValidator';
export * from './entitySchemas';

// Export convenience validators
import { validate, validateAll, formatErrors } from './schemaValidator';
import * as schemas from './entitySchemas';
import * as relationshipValidator from './relationshipValidator';

/**
 * Validate a user entity against its schema
 * @param {Object} user User entity to validate
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateUser = (user) => validate(user, schemas.userSchema);

/**
 * Validate a tenant entity against its schema
 * @param {Object} tenant Tenant entity to validate
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateTenant = (tenant) => validate(tenant, schemas.tenantSchema);

/**
 * Validate an application entity against its schema
 * @param {Object} application Application entity to validate
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateApplication = (application) => validate(application, schemas.applicationSchema);

/**
 * Validate a dataset entity against its schema
 * @param {Object} dataset Dataset entity to validate
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateDataset = (dataset) => validate(dataset, schemas.datasetSchema);

/**
 * Validate an integration entity against its schema
 * @param {Object} integration Integration entity to validate
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateIntegration = (integration) => validate(integration, schemas.integrationSchema);

/**
 * Validate a storage config entity against its schema
 * @param {Object} storageConfig Storage configuration entity to validate
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateStorageConfig = (storageConfig) => validate(storageConfig, schemas.storageConfigSchema);

/**
 * Validate an error log entity against its schema
 * @param {Object} errorLog Error log entity to validate
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateErrorLog = (errorLog) => validate(errorLog, schemas.errorLogSchema);

/**
 * Validate a user and all its relationships
 * @param {Object} user User entity to validate
 * @param {Object} context Optional context with related entities
 * @returns {Object} Validation result {valid: boolean, errors: array, relationshipErrors: array}
 */
export const validateUserWithRelationships = (user, context = {}) => {
  // Added display name
  validateUserWithRelationships.displayName = 'validateUserWithRelationships';

  // Added display name
  validateUserWithRelationships.displayName = 'validateUserWithRelationships';

  // Added display name
  validateUserWithRelationships.displayName = 'validateUserWithRelationships';

  // Added display name
  validateUserWithRelationships.displayName = 'validateUserWithRelationships';

  const schemaResult = validateUser(user);
  const relationshipResult = relationshipValidator.validateUserRelationships(user, context);
  
  return {
    valid: schemaResult.valid && relationshipResult.valid,
    errors: schemaResult.errors,
    relationshipErrors: relationshipResult.errors
  };
};

/**
 * Validate test data consistency between different test environments
 * @param {Object} jestData Data from Jest environment
 * @param {Object} cypressData Data from Cypress environment
 * @returns {Object} Validation result {valid: boolean, inconsistencies: array}
 */
export const validateCrossEnvironmentConsistency = (jestData, cypressData) => {
  // Added display name
  validateCrossEnvironmentConsistency.displayName = 'validateCrossEnvironmentConsistency';

  // Added display name
  validateCrossEnvironmentConsistency.displayName = 'validateCrossEnvironmentConsistency';

  // Added display name
  validateCrossEnvironmentConsistency.displayName = 'validateCrossEnvironmentConsistency';

  // Added display name
  validateCrossEnvironmentConsistency.displayName = 'validateCrossEnvironmentConsistency';

  const inconsistencies = [];
  let valid = true;
  
  // Compare essential properties
  Object.keys(jestData).forEach(key => {
    if (typeof cypressData[key] === 'undefined') {
      inconsistencies.push({
        field: key,
        message: `Field exists in Jest data but not in Cypress data`
      });
      valid = false;
    } else if (JSON.stringify(jestData[key]) !== JSON.stringify(cypressData[key])) {
      inconsistencies.push({
        field: key,
        message: `Field has different values between Jest and Cypress`,
        jestValue: jestData[key],
        cypressValue: cypressData[key]
      });
      valid = false;
    }
  });
  
  // Check for extra fields in Cypress data
  Object.keys(cypressData).forEach(key => {
    if (typeof jestData[key] === 'undefined') {
      inconsistencies.push({
        field: key,
        message: `Field exists in Cypress data but not in Jest data`
      });
      valid = false;
    }
  });
  
  return { valid, inconsistencies };
};