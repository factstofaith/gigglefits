/**
 * Form Validation Utilities
 * 
 * Reusable validation functions for forms.
 * 
 * @module utils/validation
 */

/**
 * Validate that a value is not empty
 * 
 * @param {any} value - The value to validate
 * @param {string} [message='This field is required'] - Error message
 * @returns {string|undefined} Error message if validation fails, undefined otherwise
 */
export const required = (value, message = 'This field is required') => {
  if (value === undefined || value === null || value === '') {
    return message;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return message;
  }
  
  return undefined;
};

/**
 * Validate that a value has a minimum length
 * 
 * @param {number} min - Minimum length
 * @param {string} [message] - Error message
 * @returns {Function} Validation function
 */
export const minLength = (min, message) => (value) => {
  if (value && value.length < min) {
    return message || `Must be at least ${min} characters`;
  }
  return undefined;
};

/**
 * Validate that a value has a maximum length
 * 
 * @param {number} max - Maximum length
 * @param {string} [message] - Error message
 * @returns {Function} Validation function
 */
export const maxLength = (max, message) => (value) => {
  if (value && value.length > max) {
    return message || `Must be no more than ${max} characters`;
  }
  return undefined;
};

/**
 * Validate that a value matches a regular expression
 * 
 * @param {RegExp} pattern - Regular expression to match
 * @param {string} message - Error message
 * @returns {Function} Validation function
 */
export const pattern = (pattern, message) => (value) => {
  if (value && !pattern.test(value)) {
    return message;
  }
  return undefined;
};

/**
 * Validate that a value is a valid email address
 * 
 * @param {string} [message='Invalid email address'] - Error message
 * @returns {Function} Validation function
 */
export const email = (message = 'Invalid email address') => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern(emailPattern, message);
};

/**
 * Validate that a value is a valid URL
 * 
 * @param {string} [message='Invalid URL'] - Error message
 * @returns {Function} Validation function
 */
export const url = (message = 'Invalid URL') => {
  const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
  return pattern(urlPattern, message);
};

/**
 * Validate that a value is a valid phone number
 * 
 * @param {string} [message='Invalid phone number'] - Error message
 * @returns {Function} Validation function
 */
export const phone = (message = 'Invalid phone number') => {
  const phonePattern = /^\+?[0-9]{10,15}$/;
  return pattern(phonePattern, message);
};

/**
 * Validate that a value is a number
 * 
 * @param {string} [message='Must be a number'] - Error message
 * @returns {Function} Validation function
 */
export const number = (message = 'Must be a number') => (value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  
  if (isNaN(Number(value))) {
    return message;
  }
  
  return undefined;
};

/**
 * Validate that a number is within a range
 * 
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} [message] - Error message
 * @returns {Function} Validation function
 */
export const range = (min, max, message) => (value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  
  const numberValue = Number(value);
  
  if (isNaN(numberValue)) {
    return 'Must be a number';
  }
  
  if (numberValue < min || numberValue > max) {
    return message || `Must be between ${min} and ${max}`;
  }
  
  return undefined;
};

/**
 * Validate that a value matches another field
 * 
 * @param {string} field - Field to match against
 * @param {string} [message] - Error message
 * @returns {Function} Validation function
 */
export const matches = (field, message) => (value, allValues) => {
  if (value !== allValues[field]) {
    return message || `Must match ${field}`;
  }
  return undefined;
};

/**
 * Combine multiple validators
 * 
 * @param {...Function} validators - Validators to combine
 * @returns {Function} Combined validation function
 */
export const compose = (...validators) => (value, allValues) => {
  for (const validator of validators) {
    const error = validator(value, allValues);
    if (error) {
      return error;
    }
  }
  return undefined;
};

/**
 * Schema-based form validation
 * 
 * @param {Object} schema - Validation schema
 * @returns {Function} Form validation function
 */
export const createValidator = (schema) => (values) => {
  const errors = {};
  
  Object.entries(schema).forEach(([field, validators]) => {
    const value = values[field];
    const validatorsArray = Array.isArray(validators) ? validators : [validators];
    
    for (const validator of validatorsArray) {
      const error = validator(value, values);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  
  return errors;
};

/**
 * Create a validator that only validates touched fields
 * 
 * @param {Object} schema - Validation schema
 * @returns {Function} Form validation function that only validates touched fields
 */
export const createTouchedValidator = (schema) => (values, touched = {}) => {
  const errors = {};
  
  Object.entries(schema).forEach(([field, validators]) => {
    if (!touched[field]) {
      return;
    }
    
    const value = values[field];
    const validatorsArray = Array.isArray(validators) ? validators : [validators];
    
    for (const validator of validatorsArray) {
      const error = validator(value, values);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  
  return errors;
};