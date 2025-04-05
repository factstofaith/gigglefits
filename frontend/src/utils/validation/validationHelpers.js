/**
 * Form Validation Helpers
 * 
 * Reusable form validation utilities using Formik and Yup.
 */

import * as Yup from 'yup';

// Common validation schemas
export const validationSchemas = {
  /**
   * Email validation schema
   */
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  
  /**
   * Password validation schema with strength requirements
   */
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .required('Password is required'),
  
  /**
   * URL validation schema
   */
  url: Yup.string()
    .url('Invalid URL format')
    .required('URL is required'),
  
  /**
   * Required string validation
   */
  requiredString: Yup.string()
    .required('This field is required'),
  
  /**
   * Optional string validation
   */
  optionalString: Yup.string(),
  
  /**
   * Required number validation
   */
  requiredNumber: Yup.number()
    .typeError('Must be a number')
    .required('This field is required'),
  
  /**
   * Date validation
   */
  date: Yup.date()
    .typeError('Must be a valid date')
    .required('Date is required'),
  
  /**
   * Phone number validation
   */
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
};

/**
 * Creates a combined validation schema from individual field schemas
 * @param {Object} schemaObj - Object with field names as keys and validation schemas as values
 * @returns {Object} Yup validation schema
 */
export const createValidationSchema = (schemaObj) => {
  return Yup.object().shape(schemaObj);
};

/**
 * Formats validation errors from Yup for display
 * @param {Object} errors - Yup validation errors object
 * @returns {Array} Array of formatted error messages
 */
export const formatValidationErrors = (errors) => {
  if (!errors) return [];
  
  return Object.values(errors);
};

/**
 * Creates initial values object from a validation schema
 * @param {Object} schemaObj - Object with field names as keys and validation schemas as values
 * @returns {Object} Initial values object
 */
export const createInitialValues = (schemaObj) => {
  const initialValues = {};
  
  Object.keys(schemaObj).forEach(key => {
    const schema = schemaObj[key];
    
    if (schema.type === 'string') {
      initialValues[key] = '';
    } else if (schema.type === 'number') {
      initialValues[key] = 0;
    } else if (schema.type === 'boolean') {
      initialValues[key] = false;
    } else if (schema.type === 'array') {
      initialValues[key] = [];
    } else if (schema.type === 'date') {
      initialValues[key] = null;
    } else {
      initialValues[key] = '';
    }
  });
  
  return initialValues;
};

/**
 * Custom hook for form validation with Formik and Yup
 * @param {Object} options - Configuration options
 * @param {Object} options.validationSchema - Yup validation schema
 * @param {Object} options.initialValues - Initial form values
 * @param {Function} options.onSubmit - Form submission handler
 * @returns {Object} Formik form state and helpers
 */
export const useFormValidation = (options) => {
  const { useFormik } = require('formik');
  
  return useFormik({
    validationSchema: options.validationSchema,
    initialValues: options.initialValues || createInitialValues(options.validationSchema),
    onSubmit: options.onSubmit,
    validateOnBlur: true,
    validateOnChange: true,
  });
};
