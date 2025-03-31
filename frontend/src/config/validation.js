/**
 * Configuration validation
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
    !value || /^[a-zA-Z0-9]+$/.test(value) || 'This field must contain only letters and numbers'
};

export function validateConfig(config) {
  // Validate application configuration
  const requiredKeys = ['api', 'features', 'environment'];
  const errors = [];
  
  requiredKeys.forEach(key => {
    if (!config[key]) {
      errors.push(`Missing required config key: ${key}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

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
