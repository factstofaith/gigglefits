/**
 * Form Hooks with Validation
 * 
 * Custom React hooks for form validation with Formik and Yup.
 */

import { useState, useCallback, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createValidationSchema, createInitialValues } from './validationHelpers';

/**
 * Custom hook for simple form state management
 * @param {Object} initialState - Initial form state
 * @returns {Array} [formState, handleInputChange, resetForm]
 */
export const useForm = (initialState = {}) => {
  const [formState, setFormState] = useState(initialState);
  
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);
  
  const resetForm = useCallback(() => {
    setFormState(initialState);
  }, [initialState]);
  
  return [formState, handleInputChange, resetForm];
};

/**
 * Custom hook for validated form using Formik and Yup
 * @param {Object} options - Configuration options
 * @param {Object} options.validationSchema - Yup validation schema or object to create schema from
 * @param {Object} options.initialValues - Initial form values
 * @param {Function} options.onSubmit - Form submission handler
 * @param {boolean} options.enableReinitialize - Whether to reinitialize form when initialValues change
 * @returns {Object} Formik form props and helpers
 */
export const useValidatedForm = ({
  validationSchema,
  initialValues,
  onSubmit,
  enableReinitialize = false
}) => {
  // Convert validation schema object to Yup schema if needed
  const schema = typeof validationSchema === 'object' && !validationSchema.validate
    ? createValidationSchema(validationSchema)
    : validationSchema;
  
  // Create initial values from schema if not provided
  const formInitialValues = initialValues || 
    (schema && schema.fields ? createInitialValues(schema.fields) : {});
  
  return useFormik({
    initialValues: formInitialValues,
    validationSchema: schema,
    onSubmit,
    validateOnBlur: true,
    validateOnChange: true,
    enableReinitialize
  });
};

/**
 * Custom hook for multi-step form
 * @param {Array} steps - Array of step configuration objects
 * @param {Function} onComplete - Callback when all steps are completed
 * @returns {Object} Multi-step form state and controls
 */
export const useMultiStepForm = (steps, onComplete) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [completed, setCompleted] = useState(false);
  
  const currentStepConfig = steps[currentStep];
  
  const {
    validationSchema,
    initialValues = {}
  } = currentStepConfig;
  
  // Initialize form for current step
  const formik = useFormik({
    initialValues: {
      ...initialValues,
      ...formData // Populate with values from previous steps
    },
    validationSchema,
    onSubmit: (values) => {
      const newFormData = {
        ...formData,
        ...values
      };
      setFormData(newFormData);
      
      if (currentStep === steps.length - 1) {
        setCompleted(true);
        onComplete?.(newFormData);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  });
  
  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);
  
  return {
    formik,
    currentStep,
    totalSteps: steps.length,
    goBack,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    formData,
    completed
  };
};

/**
 * Custom hook for form with real-time validation
 * @param {Object} validationSchema - Yup validation schema
 * @param {Object} initialValues - Initial form values
 * @returns {Object} Form state and helpers with real-time validation
 */
export const useRealtimeValidation = (validationSchema, initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);
  
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);
  
  // Validate fields on change
  useEffect(() => {
    if (validationSchema) {
      try {
        validationSchema.validateSync(values, { abortEarly: false });
        setErrors({});
      } catch (err) {
        const validationErrors = {};
        err.inner.forEach(error => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      }
    }
  }, [values, validationSchema]);
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValue: (name, value) => {
      setValues(prev => ({ ...prev, [name]: value }));
      setTouched(prev => ({ ...prev, [name]: true }));
    },
    reset: () => {
      setValues(initialValues);
      setErrors({});
      setTouched({});
    },
    isValid: Object.keys(errors).length === 0
  };
};
