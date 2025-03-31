/**
 * A11yForm
 * 
 * Accessible form component with validation and screen reader support
 * 
 * Features:
 * - Fully accessible with ARIA attributes
 * - Keyboard navigation support
 * - Screen reader announcements
 * - High-contrast mode compatibility
 * - Focus management
 * - Form validation with accessible error messaging
 * - Field tracking with submission handling
 */

import React, { forwardRef, useRef, useState, useEffect, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

// Form context for managing form state
const FormContext = createContext({
  values: {},
  errors: {},
  touched: {},
  setFieldValue: () => {},
  setFieldTouched: () => {},
  setFieldError: () => {},
  validateField: () => {},
  registerField: () => {},
  unregisterField: () => {},
  isSubmitting: false
});

// Hook for field components to connect to form
export const useFormContext = () => useContext(FormContext);

/**
 * Field component for form inputs
 */
export const FormField = forwardRef(({
  name,
  label,
  type = 'text',
  required = false,
  disabled = false,
  onChange,
  onBlur,
  value: externalValue,
  error: externalError,
  className,
  style,
  children,
  ...props
}, ref) => {
  // Connect to form context
  const formContext = useFormContext();
  const isControlled = externalValue !== undefined;
  
  // Choose between controlled and uncontrolled value/error
  const value = isControlled ? externalValue : (formContext.values[name] || '');
  const error = isControlled ? externalError : formContext.errors[name];
  const touched = formContext.touched[name];
  const hasError = error && touched;
  
  // Generate IDs for accessibility
  const inputId = props.id || `form-field-${name}`;
  const errorId = `${inputId}-error`;
  const labelId = `${inputId}-label`;
  
  // Field registration with form
  useEffect(() => {
    if (!isControlled && name) {
      formContext.registerField(name);
      return () => {
        formContext.unregisterField(name);
      };
    }
  }, [name, isControlled, formContext]);
  
  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (!isControlled && name) {
      formContext.setFieldValue(name, newValue);
    }
    if (onChange) {
      onChange(e);
    }
  };
  
  // Handle input blur
  const handleBlur = (e) => {
    if (!isControlled && name) {
      formContext.setFieldTouched(name, true);
      formContext.validateField(name);
    }
    if (onBlur) {
      onBlur(e);
    }
  };
  
  // Render with children
  if (children) {
    // Clone child and pass props
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) return child;
      
      return React.cloneElement(child, {
        name,
        id: inputId,
        value,
        onChange: handleChange,
        onBlur: handleBlur,
        'aria-invalid': hasError,
        'aria-describedby': hasError ? errorId : undefined,
        'aria-required': required,
        disabled: disabled || formContext.isSubmitting,
        ...props
      });
    });
  }
  
  // Render with standard input
  return (
    <div className={`form-field ${className || ''}`} style={style}>
      {label && (
        <label 
          htmlFor={inputId}
          id={labelId}
          className="form-label"
        >
          {label}{required && <span className="required-indicator">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        name={name}
        id={inputId}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        aria-required={required}
        disabled={disabled || formContext.isSubmitting}
        className={`form-input ${hasError ? 'has-error' : ''}`}
        {...props}
      />
      {hasError && (
        <div 
          id={errorId} 
          className="error-message" 
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

/**
 * Form group component for grouping related fields
 */
export const FormGroup = forwardRef(({ 
  children, 
  label, 
  className, 
  style, 
  ...props 
}, ref) => {
  const groupId = props.id || `form-group-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <fieldset
      ref={ref}
      className={`form-group ${className || ''}`}
      style={style}
      {...props}
    >
      {label && <legend className="form-group-label">{label}</legend>}
      {children}
    </fieldset>
  );
});

FormGroup.displayName = 'FormGroup';

/**
 * Form error summary component for showing all form errors
 */
export const FormError = forwardRef(({ 
  errors, 
  heading = 'Please fix the following errors:',
  className, 
  style, 
  ...props 
}, ref) => {
  const errorMessages = typeof errors === 'object' 
    ? Object.values(errors).filter(Boolean)
    : Array.isArray(errors) 
      ? errors.filter(Boolean)
      : errors
        ? [errors]
        : [];
        
  if (errorMessages.length === 0) return null;
  
  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className={`form-error-summary ${className || ''}`}
      style={style}
      {...props}
    >
      <h3>{heading}</h3>
      <ul>
        {errorMessages.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
});

FormError.displayName = 'FormError';

/**
 * A11yForm Component
 */
const A11yForm = forwardRef((props, ref) => {
  const {
    children,
    className,
    style,
    id,
    initialValues = {},
    validate,
    onSubmit,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    dataTestId,
    ...other
  } = props;

  // Form state
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fields, setFields] = useState([]);
  
  // Using internal ref if none provided
  const formRef = useRef(null);
  const resolvedRef = ref || formRef;
  
  // Set a field value
  const setFieldValue = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Set a field touched state
  const setFieldTouched = (name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
  };
  
  // Set a field error
  const setFieldError = (name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  // Register a field
  const registerField = (name) => {
    if (!fields.includes(name)) {
      setFields(prev => [...prev, name]);
    }
  };
  
  // Unregister a field
  const unregisterField = (name) => {
    setFields(prev => prev.filter(field => field !== name));
  };
  
  // Validate a single field
  const validateField = (name) => {
    if (!validate) return;
    
    try {
      const fieldError = validate({ 
        [name]: values[name] 
      }, name);
      
      if (fieldError && fieldError[name]) {
        setFieldError(name, fieldError[name]);
        return false;
      } else {
        setFieldError(name, undefined);
        return true;
      }
    } catch (error) {
      console.error(`Validation error for field ${name}:`, error);
      return false;
    }
  };
  
  // Validate all fields
  const validateForm = () => {
    if (!validate) return true;
    
    try {
      const formErrors = validate(values);
      
      if (formErrors && Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return false;
      } else {
        setErrors({});
        return true;
      }
    } catch (error) {
      console.error('Form validation error:', error);
      return false;
    }
  };
  
  // Mark all fields as touched
  const touchAllFields = () => {
    const touchedFields = {};
    fields.forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);
  };
  
  // Handle form submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Don't submit if already submitting
    if (isSubmitting) return;
    
    // Touch all fields to show all errors
    touchAllFields();
    
    // Validate the form
    const isValid = validateForm();
    
    if (!isValid) {
      // Focus the first field with an error
      const firstErrorField = fields.find(field => errors[field]);
      if (firstErrorField) {
        const fieldElement = document.getElementById(`form-field-${firstErrorField}`);
        if (fieldElement) {
          fieldElement.focus();
        }
      }
      return;
    }
    
    if (onSubmit) {
      setIsSubmitting(true);
      
      try {
        await onSubmit(values, {
          setSubmitting: setIsSubmitting,
          resetForm: () => {
            setValues(initialValues);
            setErrors({});
            setTouched({});
          }
        });
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Form context value
  const formContextValue = {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateField,
    registerField,
    unregisterField,
    isSubmitting
  };
  
  // Calculate error summary from current errors
  const formHasErrors = Object.keys(errors).length > 0;
  const errorSummary = formHasErrors && Object.keys(touched).length > 0
    ? errors
    : {};
  
  return (
    <FormContext.Provider value={formContextValue}>
      <form
        ref={resolvedRef}
        className={`a11y-form ${className || ''}`}
        style={style}
        id={id}
        onSubmit={handleSubmit}
        noValidate
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        data-testid={dataTestId}
        {...other}
      >
        <FormError errors={errorSummary} />
        {children}
      </form>
    </FormContext.Provider>
  );
});

A11yForm.displayName = 'A11yForm';

A11yForm.propTypes = {
  /** Child elements */
  children: PropTypes.node,
  /** Additional CSS class */
  className: PropTypes.string,
  /** Additional inline styles */
  style: PropTypes.object,
  /** Element ID */
  id: PropTypes.string,
  /** Initial form values */
  initialValues: PropTypes.object,
  /** Validation function */
  validate: PropTypes.func,
  /** Submit handler */
  onSubmit: PropTypes.func,
  /** ARIA label */
  ariaLabel: PropTypes.string,
  /** ID of element that labels this component */
  ariaLabelledBy: PropTypes.string,
  /** ID of element that describes this component */
  ariaDescribedBy: PropTypes.string,
  /** Data test ID for testing */
  dataTestId: PropTypes.string
};

export default A11yForm;