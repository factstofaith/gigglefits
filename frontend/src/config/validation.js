/**
 * Configuration validation module
 * 
 * Provides utilities for validating configuration and form values
 * with a standardized approach and comprehensive error reporting.
 */

export const validationRules = {
  required: (value) => !!value || 'This field is required',
  email: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'Enter a valid email address';
  },
  minLength: (min) => (value) => 
    !value || value.length >= min || `Minimum length is ${min} characters`,
  maxLength: (max) => (value) => 
    !value || value.length <= max || `Maximum length is ${max} characters`,
  numeric: (value) => 
    !value || /^\d+$/.test(value) || 'This field must contain only numbers',
  alphanumeric: (value) => 
    !value || /^[a-zA-Z0-9]+$/.test(value) || 'This field must contain only letters and numbers',
  url: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch (e) {
      return 'Enter a valid URL';
    }
  },
  boolean: (value) => typeof value === 'boolean' || 'This field must be a boolean'
};

/**
 * Validate application configuration against a schema
 * 
 * @param {Object} config - Configuration object to validate
 * @param {Object} schema - Validation schema (optional)
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateConfig(config, schema = {}) {
  const errors = [];
  
  // First, check for required top-level keys
  const requiredKeys = ['api', 'auth', 'environment'];
  requiredKeys.forEach(key => {
    if (!config[key]) {
      errors.push(`Missing required config key: ${key}`);
    }
  });
  
  // If schema is provided, validate against it
  if (Object.keys(schema).length > 0) {
    Object.entries(schema).forEach(([section, sectionSchema]) => {
      if (!config[section]) {
        errors.push(`Missing required config section: ${section}`);
        return;
      }
      
      // Check properties in this section
      Object.entries(sectionSchema).forEach(([key, rules]) => {
        const value = config[section][key];
        
        // Check if required
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push(`Missing required config value: ${section}.${key}`);
        }
        
        // Check type
        if (rules.type && value !== undefined && value !== null) {
          const actualType = typeof value;
          if (actualType !== rules.type) {
            errors.push(`Invalid type for ${section}.${key}: expected ${rules.type}, got ${actualType}`);
          }
        }
        
        // Check pattern
        if (rules.pattern && value !== undefined && value !== null) {
          const regex = new RegExp(rules.pattern);
          if (!regex.test(String(value))) {
            errors.push(`Invalid format for ${section}.${key}: must match pattern ${rules.pattern}`);
          }
        }
      });
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate form values against a set of rules
 * 
 * @param {Object} values - Form values to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result with isValid flag and errors object
 */
export function validateForm(values, rules) {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = values[field];
    
    for (const rule of fieldRules) {
      const result = rule(value);
      if (result !== true) {
        errors[field] = result;
        break;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export default {
  validationRules,
  validateForm,
  validateConfig
};
