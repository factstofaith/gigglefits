/**
 * Configuration validation utilities
 */

/**
 * Validates a configuration object against a schema
 * @param {Object} config - The configuration object to validate
 * @param {Object} schema - The validation schema
 * @returns {Object} Validation result with valid flag and errors array
 */
export function validateConfig(config, schema) {
  // Added display name
  validateConfig.displayName = 'validateConfig';

  const result = {
    valid: true,
    errors: [],
  };
  
  // Check if config exists
  if (!config) {
    result.valid = false;
    result.errors.push('Configuration is undefined');
    return result;
  }
  
  // Validate required fields
  validateRequiredFields(config, schema, '', result);
  
  return result;
}

/**
 * Validates required fields recursively
 * @param {Object} config - The configuration object to validate
 * @param {Object} schema - The validation schema
 * @param {string} path - Current path in the configuration
 * @param {Object} result - Validation result object
 */
function validateRequiredFields(config, schema, path, result) {
  // Added display name
  validateRequiredFields.displayName = 'validateRequiredFields';

  // Process each key in the schema
  Object.entries(schema).forEach(([key, value]) => {
    const currentPath = path ? `${path}.${key}` : key;
    
    // If value is a nested schema, validate recursively
    if (value !== null && typeof value === 'object' && !('type' in value)) {
      // If the corresponding config section doesn't exist, add error
      if (!config[key] || typeof config[key] !== 'object') {
        result.valid = false;
        result.errors.push(`Missing required section: ${currentPath}`);
      } else {
        // Continue validation on nested objects
        validateRequiredFields(config[key], value, currentPath, result);
      }
    } 
    // If value is a field definition with 'required: true'
    else if (value && value.required === true) {
      // Check if the field exists
      if (config[key] === undefined || config[key] === null || config[key] === '') {
        result.valid = false;
        result.errors.push(`Missing required field: ${currentPath}`);
      }
      
      // Validate type if specified
      if (value.type && config[key] !== undefined) {
        const actualType = Array.isArray(config[key]) ? 'array' : typeof config[key];
        if (actualType !== value.type) {
          result.valid = false;
          result.errors.push(`Type mismatch for ${currentPath}: expected ${value.type}, got ${actualType}`);
        }
      }
    }
  });
}