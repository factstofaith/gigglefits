/**
 * useForm Hook
 * 
 * Custom hook for managing form state with validation.
 * 
 * @module hooks/useForm
 */

import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Form validation hook
 *
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function
 * @param {Function} [onSubmit] - Submit handler function
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.validateOnChange=true] - Whether to validate on change
 * @param {boolean} [options.validateOnBlur=true] - Whether to validate on blur
 * @param {boolean} [options.validateOnMount=false] - Whether to validate on mount
 * @returns {Object} Form state and handlers
 */
function useForm(initialValues = {}, validate = () => ({}), onSubmit = () => {}, options = {}) {
  // Set default options
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnMount = false,
  } = options;
  
  // Form state
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  
  // Track if form has been modified
  const [dirty, setDirty] = useState(false);
  
  // Helper to run validation
  const validateForm = useCallback(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return validationErrors;
  }, [values, validate]);
  
  // Validate on mount if option enabled
  useEffect(() => {
    if (validateOnMount) {
      validateForm();
    }
  }, [validateOnMount, validateForm]);
  
  // Handle field change
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    
    // Get appropriate value based on input type
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prevValues => ({
      ...prevValues,
      [name]: fieldValue,
    }));
    
    setDirty(true);
    
    // Validate on change if enabled
    if (validateOnChange) {
      const fieldTouched = { [name]: true };
      setTouched(prev => ({ ...prev, ...fieldTouched }));
      
      const validationErrors = validate({
        ...values,
        [name]: fieldValue,
      });
      
      setErrors(validationErrors);
    }
  }, [values, validateOnChange, validate]);
  
  // Set a field value programmatically
  const setFieldValue = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
    
    setDirty(true);
    
    // Validate on change if enabled
    if (validateOnChange) {
      const validationErrors = validate({
        ...values,
        [name]: value,
      });
      
      setErrors(validationErrors);
    }
  }, [values, validateOnChange, validate]);
  
  // Handle field blur
  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    
    const fieldTouched = { [name]: true };
    setTouched(prev => ({ ...prev, ...fieldTouched }));
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [values, validateOnBlur, validate]);
  
  // Reset form to initial state or new values
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }
    
    setSubmitCount(prev => prev + 1);
    
    // Validate all fields
    const validationErrors = validateForm();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (touched, field) => ({ ...touched, [field]: true }),
      {}
    );
    setTouched(allTouched);
    
    // Check if there are any errors
    const hasErrors = Object.keys(validationErrors).length > 0;
    
    if (!hasErrors) {
      setIsSubmitting(true);
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
    
    return !hasErrors;
  }, [values, validateForm, onSubmit]);
  
  // Computed flag for whether the form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);
  
  // Get props for a field
  const getFieldProps = useCallback((name) => {
    return {
      name,
      id: name,
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      'aria-invalid': errors[name] ? 'true' : 'false',
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    };
  }, [values, errors, handleChange, handleBlur]);
  
  // Get meta information for a field
  const getFieldMeta = useCallback((name) => {
    return {
      value: values[name],
      error: errors[name],
      touched: !!touched[name],
      isDirty: dirty && values[name] !== initialValues[name],
    };
  }, [values, errors, touched, dirty, initialValues]);
  
  // Get helper methods for a field
  const getFieldHelpers = useCallback((name) => {
    return {
      setValue: (value) => setFieldValue(name, value),
      setTouched: (isTouched = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }));
      },
      setError: (error) => {
        setErrors(prev => ({ ...prev, [name]: error }));
      },
    };
  }, [setFieldValue]);
  
  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    isDirty: dirty,
    isValid,
    submitCount,
    
    // Form actions
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
    
    // Field helpers
    getFieldProps,
    getFieldMeta,
    getFieldHelpers,
  };
}

export default useForm;