/**
 * Schema Validator for Test Data
 * 
 * This module provides functions for validating test data against schemas,
 * ensuring consistency and correctness of generated test data.
 * 
 * @version 1.0.0
 */

/**
 * Error class for schema validation failures
 */
export class SchemaValidationError extends Error {
  constructor(message, field, expected, received, path = []) {
    super(message);
    this.name = 'SchemaValidationError';
    this.field = field;
    this.expected = expected;
    this.received = received;
    this.path = path;
  }

  /**
   * Get a formatted error message for this validation error
   * @returns {string} Formatted error message
   */
  getFormattedMessage() {
    return `${this.message}\n  Path: ${this.path.join('.')}\n  Field: ${this.field}\n  Expected: ${this.expected}\n  Received: ${JSON.stringify(this.received)}`;
  }
}

/**
 * Validates a required field exists in the object
 * @param {Object} object The object to validate
 * @param {string} field The field name to check
 * @param {Array<string>} path Current path in validation
 * @throws {SchemaValidationError} If validation fails
 */
const validateRequired = (object, field, path = []) => {
  // Added display name
  validateRequired.displayName = 'validateRequired';

  // Added display name
  validateRequired.displayName = 'validateRequired';

  // Added display name
  validateRequired.displayName = 'validateRequired';

  // Added display name
  validateRequired.displayName = 'validateRequired';

  if (object[field] === undefined || object[field] === null) {
    throw new SchemaValidationError(
      `Required field '${field}' is missing`,
      field,
      'non-null value',
      object[field],
      path
    );
  }
};

/**
 * Validates a field's type
 * @param {Object} object The object to validate
 * @param {string} field The field name to check
 * @param {string|string[]} expectedType Expected type(s)
 * @param {Array<string>} path Current path in validation
 * @throws {SchemaValidationError} If validation fails
 */
const validateType = (object, field, expectedType, path = []) => {
  // Added display name
  validateType.displayName = 'validateType';

  // Added display name
  validateType.displayName = 'validateType';

  // Added display name
  validateType.displayName = 'validateType';

  // Added display name
  validateType.displayName = 'validateType';

  // Skip validation if the field doesn't exist (for optional fields)
  if (object[field] === undefined) return;
  
  const actualValue = object[field];
  const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;
  
  // Handle multiple allowed types
  const expectedTypes = Array.isArray(expectedType) ? expectedType : [expectedType];
  
  // Special handling for dates
  if (expectedTypes.includes('date') && 
      (actualValue instanceof Date || 
       (typeof actualValue === 'string' && !isNaN(Date.parse(actualValue))))) {
    return;
  }
  
  // Special handling for arrays
  if (expectedTypes.includes('array') && Array.isArray(actualValue)) {
    return;
  }
  
  // Check if the actual type is one of the expected types
  if (!expectedTypes.includes(actualType)) {
    throw new SchemaValidationError(
      `Field '${field}' has incorrect type`,
      field,
      expectedTypes.join(' or '),
      actualType,
      path
    );
  }
};

/**
 * Validates a field matches a pattern
 * @param {Object} object The object to validate
 * @param {string} field The field name to check
 * @param {RegExp} pattern Pattern to match
 * @param {Array<string>} path Current path in validation
 * @throws {SchemaValidationError} If validation fails
 */
const validatePattern = (object, field, pattern, path = []) => {
  // Added display name
  validatePattern.displayName = 'validatePattern';

  // Added display name
  validatePattern.displayName = 'validatePattern';

  // Added display name
  validatePattern.displayName = 'validatePattern';

  // Added display name
  validatePattern.displayName = 'validatePattern';

  // Skip validation if the field doesn't exist (for optional fields)
  if (object[field] === undefined) return;
  
  const value = object[field];
  
  // Only validate string values
  if (typeof value !== 'string') return;
  
  if (!pattern.test(value)) {
    throw new SchemaValidationError(
      `Field '${field}' does not match expected pattern`,
      field,
      pattern.toString(),
      value,
      path
    );
  }
};

/**
 * Validates a field's value is one of the allowed enum values
 * @param {Object} object The object to validate
 * @param {string} field The field name to check
 * @param {Array} allowedValues Allowed values
 * @param {Array<string>} path Current path in validation
 * @throws {SchemaValidationError} If validation fails
 */
const validateEnum = (object, field, allowedValues, path = []) => {
  // Added display name
  validateEnum.displayName = 'validateEnum';

  // Added display name
  validateEnum.displayName = 'validateEnum';

  // Added display name
  validateEnum.displayName = 'validateEnum';

  // Added display name
  validateEnum.displayName = 'validateEnum';

  // Skip validation if the field doesn't exist (for optional fields)
  if (object[field] === undefined) return;
  
  const value = object[field];
  
  if (!allowedValues.includes(value)) {
    throw new SchemaValidationError(
      `Field '${field}' has invalid value`,
      field,
      `one of [${allowedValues.join(', ')}]`,
      value,
      path
    );
  }
};

/**
 * Validates an array field's items against a schema
 * @param {Object} object The object to validate
 * @param {string} field The field name to check
 * @param {Object} itemSchema Schema for array items
 * @param {Array<string>} path Current path in validation
 * @throws {SchemaValidationError} If validation fails
 */
const validateArrayItems = (object, field, itemSchema, path = []) => {
  // Added display name
  validateArrayItems.displayName = 'validateArrayItems';

  // Added display name
  validateArrayItems.displayName = 'validateArrayItems';

  // Added display name
  validateArrayItems.displayName = 'validateArrayItems';

  // Added display name
  validateArrayItems.displayName = 'validateArrayItems';

  // Skip validation if the field doesn't exist (for optional fields)
  if (object[field] === undefined) return;
  
  const array = object[field];
  
  // Ensure the field is an array
  if (!Array.isArray(array)) {
    throw new SchemaValidationError(
      `Field '${field}' should be an array`,
      field,
      'array',
      typeof array,
      path
    );
  }
  
  // Validate each item in the array
  array.forEach((item, index) => {
    validateObject(item, itemSchema, [...path, field, index.toString()]);
  });
};

/**
 * Validates an object field's properties against a schema
 * @param {Object} object The object to validate
 * @param {string} field The field name to check
 * @param {Object} objectSchema Schema for the object
 * @param {Array<string>} path Current path in validation
 * @throws {SchemaValidationError} If validation fails
 */
const validateObjectField = (object, field, objectSchema, path = []) => {
  // Added display name
  validateObjectField.displayName = 'validateObjectField';

  // Added display name
  validateObjectField.displayName = 'validateObjectField';

  // Added display name
  validateObjectField.displayName = 'validateObjectField';

  // Added display name
  validateObjectField.displayName = 'validateObjectField';

  // Skip validation if the field doesn't exist (for optional fields)
  if (object[field] === undefined) return;
  
  const nestedObject = object[field];
  
  // Ensure the field is an object
  if (typeof nestedObject !== 'object' || nestedObject === null || Array.isArray(nestedObject)) {
    throw new SchemaValidationError(
      `Field '${field}' should be an object`,
      field,
      'object',
      typeof nestedObject,
      path
    );
  }
  
  // Validate the nested object
  validateObject(nestedObject, objectSchema, [...path, field]);
};

/**
 * Validates an object against a schema
 * @param {Object} object The object to validate
 * @param {Object} schema Schema definition
 * @param {Array<string>} path Current path in validation
 * @throws {SchemaValidationError} If validation fails
 */
export const validateObject = (object, schema, path = []) => {
  // Added display name
  validateObject.displayName = 'validateObject';

  // Added display name
  validateObject.displayName = 'validateObject';

  // Added display name
  validateObject.displayName = 'validateObject';

  // Added display name
  validateObject.displayName = 'validateObject';

  if (!object || typeof object !== 'object') {
    throw new SchemaValidationError(
      'Invalid object for validation',
      'root',
      'object',
      typeof object,
      path
    );
  }

  // Check required fields
  (schema.required || []).forEach(field => {
    validateRequired(object, field, path);
  });

  // Validate each field according to its rules
  Object.keys(schema.properties || {}).forEach(field => {
    const fieldSchema = schema.properties[field];
    
    // Check type
    if (fieldSchema.type) {
      validateType(object, field, fieldSchema.type, path);
    }
    
    // Check pattern
    if (fieldSchema.pattern && object[field] !== undefined) {
      validatePattern(object, field, new RegExp(fieldSchema.pattern), path);
    }
    
    // Check enum
    if (fieldSchema.enum && object[field] !== undefined) {
      validateEnum(object, field, fieldSchema.enum, path);
    }
    
    // Validate nested arrays
    if (fieldSchema.type === 'array' && fieldSchema.items && object[field] !== undefined) {
      validateArrayItems(object, field, fieldSchema.items, path);
    }
    
    // Validate nested objects
    if (fieldSchema.type === 'object' && fieldSchema.properties && object[field] !== undefined) {
      validateObjectField(object, field, fieldSchema, path);
    }
  });

  return true;
};

/**
 * Wraps validation in a try-catch and returns the result
 * @param {Object} object The object to validate
 * @param {Object} schema Schema definition
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validate = (object, schema) => {
  // Added display name
  validate.displayName = 'validate';

  // Added display name
  validate.displayName = 'validate';

  // Added display name
  validate.displayName = 'validate';

  // Added display name
  validate.displayName = 'validate';

  try {
    validateObject(object, schema);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof SchemaValidationError) {
      return { 
        valid: false, 
        errors: [error],
      };
    }
    throw error; // Rethrow unexpected errors
  }
};

/**
 * Validates multiple objects against a schema
 * @param {Array<Object>} objects Array of objects to validate
 * @param {Object} schema Schema definition
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateAll = (objects, schema) => {
  // Added display name
  validateAll.displayName = 'validateAll';

  // Added display name
  validateAll.displayName = 'validateAll';

  // Added display name
  validateAll.displayName = 'validateAll';

  // Added display name
  validateAll.displayName = 'validateAll';

  if (!Array.isArray(objects)) {
    throw new Error('validateAll requires an array of objects');
  }
  
  const results = objects.map((obj, index) => {
    const result = validate(obj, schema);
    if (!result.valid) {
      // Add index information to errors
      result.errors = result.errors.map(err => {
        err.arrayIndex = index;
        err.path = ['[' + index + ']', ...err.path];
        return err;
      });
    }
    return result;
  });
  
  // Combine all errors
  const allErrors = results.flatMap(r => r.errors);
  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
};

/**
 * Formats validation errors into a readable string
 * @param {Array} errors Array of validation errors
 * @returns {string} Formatted error message
 */
export const formatErrors = (errors) => {
  // Added display name
  formatErrors.displayName = 'formatErrors';

  // Added display name
  formatErrors.displayName = 'formatErrors';

  // Added display name
  formatErrors.displayName = 'formatErrors';

  // Added display name
  formatErrors.displayName = 'formatErrors';

  if (!errors || errors.length === 0) return 'No validation errors';
  
  return errors.map((err, index) => {
    return `Error ${index + 1}: ${err.getFormattedMessage()}`;
  }).join('\n\n');
};