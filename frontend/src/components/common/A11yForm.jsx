/**
 * Accessibility-Enhanced Form Component
 * 
 * A form component with enhanced accessibility features.
 * Part of the zero technical debt accessibility implementation.
 * 
 * @module components/common/A11yForm
 */

import React, { forwardRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useA11yAnnouncement } from '../../hooks/a11y';
import { getFormFieldAttributes } from '../../utils/a11y/ariaAttributeHelper';

/**
 * Enhanced Form with built-in accessibility features
 * 
 * @param {Object} props - Component props
 * @param {string} [props.a11yLabel] - Accessible label for the form
 * @param {string} [props.a11yAnnouncement] - Message to announce when form state changes
 * @param {string} [props.a11yRegion] - Region role for the form (form, search, etc)
 * @param {boolean} [props.a11yLiveValidation=false] - Whether to announce validation errors in real time
 * @param {boolean} [props.a11yFocusOnError=true] - Whether to focus on the first error field when validation fails
 * @param {Object} [props.a11yErrorMessages] - Custom error messages for form fields
 * @param {Function} props.onSubmit - Function to call when the form is submitted
 * @param {React.ReactNode} props.children - Form content
 * @param {string} [props.className] - Additional class name
 * @param {Object} [props.style] - Additional styles
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The enhanced form
 */
const A11yForm = forwardRef(({ 
  // A11y props
  a11yLabel,
  a11yAnnouncement,
  a11yRegion = 'form',
  a11yLiveValidation = false,
  a11yFocusOnError = true,
  a11yErrorMessages = {},
  
  // Standard form props
  onSubmit,
  children,
  className = '',
  style = {},
  ...rest
}, ref) => {
  const { announcePolite } = useA11yAnnouncement();
  
  // Track form errors
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Announce errors when they change
  useEffect(() => {
    if (Object.keys(errors).length > 0 && hasSubmitted) {
      const errorCount = Object.keys(errors).length;
      const errorMessage = `Form has ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}. ${Object.values(errors).join('. ')}`;
      announcePolite(errorMessage);
    }
  }, [errors, hasSubmitted, announcePolite]);
  
  // Find first invalid field and focus it
  const focusFirstInvalidField = () => {
    if (!a11yFocusOnError || !ref?.current) return;
    
    const form = ref.current;
    const errorFields = Object.keys(errors);
    
    if (errorFields.length > 0) {
      const firstErrorField = form.querySelector(`[name="${errorFields[0]}"], #${errorFields[0]}`);
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }
  };
  
  // Validate form fields
  const validateForm = (formData, form) => {
    const newErrors = {};
    
    // Check for required fields
    Array.from(form.elements).forEach(element => {
      if (element.hasAttribute('required') && !element.value.trim()) {
        const fieldName = element.name || element.id;
        const fieldLabel = element.getAttribute('aria-label') || 
                         document.querySelector(`label[for="${element.id}"]`)?.textContent || 
                         fieldName;
                        
        newErrors[fieldName] = a11yErrorMessages[fieldName] || 
                              `${fieldLabel} is required`;
      }
    });
    
    // Set errors and focus first invalid field
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    setHasSubmitted(true);
    
    const form = event.target;
    const formData = new FormData(form);
    const isValid = validateForm(formData, form);
    
    if (isValid) {
      if (a11yAnnouncement) {
        announcePolite(a11yAnnouncement);
      }
      
      // Convert FormData to object for easier handling
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      if (onSubmit) {
        onSubmit(data, event);
      }
    } else {
      focusFirstInvalidField();
    }
  };
  
  // Get ARIA attributes for the form
  const formAttributes = {
    'aria-label': a11yLabel,
    role: a11yRegion === 'form' ? undefined : a11yRegion,
    ref,
    onSubmit: handleSubmit,
    className: `a11y-form ${className}`,
    style,
    noValidate: true, // Disable browser validation to handle it ourselves
    ...rest
  };
  
  // Provide error context to children
  const enhancedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    
    // Only process form controls
    const isFormControl = child.props.name || child.props.id;
    if (!isFormControl) return child;
    
    const fieldName = child.props.name || child.props.id;
    const hasError = errors[fieldName] !== undefined;
    
    return React.cloneElement(child, {
      'aria-invalid': hasError ? 'true' : undefined,
      'aria-errormessage': hasError ? `${fieldName}-error` : undefined,
      ...child.props,
      children: (
        <>
          {child.props.children}
          {hasError && (
            <div 
              id={`${fieldName}-error`} 
              className="a11y-form-error"
              role="alert"
            >
              {errors[fieldName]}
            </div>
          )}
        </>
      )
    });
  });
  
  return (
    <form {...formAttributes}>
      {enhancedChildren}
    </form>
  );
});

A11yForm.displayName = 'A11yForm';

A11yForm.propTypes = {
  // A11y props
  a11yLabel: PropTypes.string,
  a11yAnnouncement: PropTypes.string,
  a11yRegion: PropTypes.oneOf(['form', 'search', 'region']),
  a11yLiveValidation: PropTypes.bool,
  a11yFocusOnError: PropTypes.bool,
  a11yErrorMessages: PropTypes.object,
  
  // Standard form props
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object
};

export default A11yForm;