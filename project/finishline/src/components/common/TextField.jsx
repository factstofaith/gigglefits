/**
 * TextField
 * 
 * A standardized text input component with various options and validations.
 * 
 * @module components/common/TextField
 */

import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized text input component
 * 
 * @param {Object} props - Component props
 * @param {string} [props.id] - Input element ID
 * @param {string} [props.name] - Input element name
 * @param {string} [props.value] - Input value
 * @param {string} [props.defaultValue] - Default input value
 * @param {string} [props.label] - Input label
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.helperText] - Helper text below input
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required=false] - Whether input is required
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {boolean} [props.readOnly=false] - Whether input is read-only
 * @param {string} [props.type='text'] - Input type (text, password, email, etc.)
 * @param {string} [props.variant='outlined'] - Visual variant
 * @param {string} [props.size='medium'] - Input size
 * @param {Function} [props.onChange] - Change handler
 * @param {Function} [props.onFocus] - Focus handler
 * @param {Function} [props.onBlur] - Blur handler
 * @param {boolean} [props.fullWidth=false] - Whether input should take full width
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The text field component
 */
const TextField = forwardRef(({
  id,
  name,
  value,
  defaultValue,
  label,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  readOnly = false,
  type = 'text',
  variant = 'outlined',
  size = 'medium',
  onChange,
  onFocus,
  onBlur,
  fullWidth = false,
  className = '',
  ...rest
}, ref) => {
  // Use controlled or uncontrolled based on whether value is provided
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  
  // Size styles
  const sizeStyles = {
    small: {
      padding: '8px 12px',
      fontSize: '14px',
    },
    medium: {
      padding: '10px 14px',
      fontSize: '16px',
    },
    large: {
      padding: '12px 16px',
      fontSize: '18px',
    },
  };
  
  // Variant styles
  const getVariantStyles = () => {
    const styles = {
      outlined: {
        border: `1px solid ${error ? '#f44336' : isFocused ? '#1976d2' : '#c4c4c4'}`,
        borderRadius: '4px',
        backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
      },
      filled: {
        border: 'none',
        borderBottom: `1px solid ${error ? '#f44336' : isFocused ? '#1976d2' : '#c4c4c4'}`,
        borderRadius: '4px 4px 0 0',
        backgroundColor: disabled ? '#f5f5f5' : '#f5f5f5',
      },
      standard: {
        border: 'none',
        borderBottom: `1px solid ${error ? '#f44336' : isFocused ? '#1976d2' : '#c4c4c4'}`,
        borderRadius: '0',
        backgroundColor: 'transparent',
      },
    };
    
    return styles[variant] || styles.outlined;
  };
  
  // Base container styles
  const containerStyle = {
    display: 'inline-flex',
    flexDirection: 'column',
    position: 'relative',
    marginBottom: '16px',
    width: fullWidth ? '100%' : 'auto',
  };
  
  // Label styles
  const labelStyle = {
    marginBottom: '6px',
    fontSize: '14px',
    color: error ? '#f44336' : disabled ? '#757575' : '#212121',
    fontWeight: 500,
  };
  
  // Helper text styles
  const helperTextStyle = {
    marginTop: '6px',
    fontSize: '12px',
    color: error ? '#f44336' : '#757575',
    minHeight: '18px',
  };
  
  // Input styles
  const inputStyle = {
    ...sizeStyles[size],
    ...getVariantStyles(),
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease-in-out',
    color: disabled ? '#757575' : '#212121',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.7 : 1,
  };
  
  // Handle changes
  const handleChange = (e) => {
    if (readOnly || disabled) return;
    
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    
    if (onChange) {
      onChange(e);
    }
  };
  
  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };
  
  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };
  
  // Get current value
  const currentValue = isControlled ? value : internalValue;
  
  return (
    <div 
      className={`tap-textfield tap-textfield--${variant} tap-textfield--${size} ${error ? 'tap-textfield--error' : ''} ${disabled ? 'tap-textfield--disabled' : ''} ${fullWidth ? 'tap-textfield--fullwidth' : ''} ${className}`}
      style={containerStyle}
      data-testid="tap-textfield"
    >
      {label && (
        <label 
          htmlFor={id} 
          style={labelStyle}
          className="tap-textfield__label"
        >
          {label}
          {required && <span style={{ color: '#f44336' }}> *</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={inputStyle}
        className="tap-textfield__input"
        aria-invalid={!!error}
        aria-describedby={helperText ? `${id}-helper-text` : undefined}
        {...rest}
      />
      
      {(helperText || error) && (
        <div 
          id={`${id}-helper-text`}
          style={helperTextStyle}
          className="tap-textfield__helper-text"
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

// Display name for debugging
TextField.displayName = 'TextField';

// Prop types
TextField.propTypes = {
  /** Input element ID */
  id: PropTypes.string,
  
  /** Input element name */
  name: PropTypes.string,
  
  /** Input value (for controlled component) */
  value: PropTypes.string,
  
  /** Default input value (for uncontrolled component) */
  defaultValue: PropTypes.string,
  
  /** Input label */
  label: PropTypes.string,
  
  /** Input placeholder */
  placeholder: PropTypes.string,
  
  /** Helper text below input */
  helperText: PropTypes.string,
  
  /** Error message */
  error: PropTypes.string,
  
  /** Whether input is required */
  required: PropTypes.bool,
  
  /** Whether input is disabled */
  disabled: PropTypes.bool,
  
  /** Whether input is read-only */
  readOnly: PropTypes.bool,
  
  /** Input type (text, password, email, etc.) */
  type: PropTypes.string,
  
  /** Visual variant */
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  
  /** Input size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  /** Change handler */
  onChange: PropTypes.func,
  
  /** Focus handler */
  onFocus: PropTypes.func,
  
  /** Blur handler */
  onBlur: PropTypes.func,
  
  /** Whether input should take full width */
  fullWidth: PropTypes.bool,
  
  /** Additional CSS class names */
  className: PropTypes.string,
};

export default TextField;