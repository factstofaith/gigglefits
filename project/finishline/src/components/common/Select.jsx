/**
 * Select
 * 
 * A standardized select dropdown component with various options and states.
 * 
 * @module components/common/Select
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized select dropdown component
 * 
 * @param {Object} props - Component props
 * @param {string} [props.id] - Select element ID
 * @param {string} [props.name] - Select element name
 * @param {string|number} [props.value] - Selected value (controlled)
 * @param {string|number} [props.defaultValue] - Default selected value (uncontrolled)
 * @param {Array} props.options - Array of options to display
 * @param {string} [props.label] - Select label
 * @param {string} [props.placeholder] - Select placeholder
 * @param {string} [props.helperText] - Helper text below select
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required=false] - Whether select is required
 * @param {boolean} [props.disabled=false] - Whether select is disabled
 * @param {boolean} [props.readOnly=false] - Whether select is read-only
 * @param {string} [props.variant='outlined'] - Visual variant
 * @param {string} [props.size='medium'] - Select size
 * @param {Function} [props.onChange] - Change handler
 * @param {Function} [props.onFocus] - Focus handler
 * @param {Function} [props.onBlur] - Blur handler
 * @param {boolean} [props.fullWidth=false] - Whether select should take full width
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The select component
 */
const Select = forwardRef(({
  id,
  name,
  value,
  defaultValue,
  options = [],
  label,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  readOnly = false,
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
      padding: '8px 32px 8px 12px',
      fontSize: '14px',
    },
    medium: {
      padding: '10px 36px 10px 14px',
      fontSize: '16px',
    },
    large: {
      padding: '12px 40px 12px 16px',
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
  
  // Select styles
  const selectStyle = {
    ...sizeStyles[size],
    ...getVariantStyles(),
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease-in-out',
    color: disabled ? '#757575' : '#212121',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
  };
  
  // Arrow icon container styles
  const arrowContainerStyle = {
    position: 'absolute',
    top: label ? 'calc(14px + 1em)' : '0',
    right: '8px',
    bottom: '0',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
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
  
  // Generate a unique ID if not provided
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div 
      className={`tap-select tap-select--${variant} tap-select--${size} ${error ? 'tap-select--error' : ''} ${disabled ? 'tap-select--disabled' : ''} ${fullWidth ? 'tap-select--fullwidth' : ''} ${className}`}
      style={containerStyle}
      data-testid="tap-select"
    >
      {label && (
        <label 
          htmlFor={selectId} 
          style={labelStyle}
          className="tap-select__label"
        >
          {label}
          {required && <span style={{ color: '#f44336' }}> *</span>}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={currentValue}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={selectStyle}
          className="tap-select__select"
          aria-invalid={!!error}
          aria-describedby={helperText ? `${selectId}-helper-text` : undefined}
          data-readonly={readOnly}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div style={arrowContainerStyle} className="tap-select__arrow">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 9l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      
      {(helperText || error) && (
        <div 
          id={`${selectId}-helper-text`}
          style={helperTextStyle}
          className="tap-select__helper-text"
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

// Display name for debugging
Select.displayName = 'Select';

// Prop types
Select.propTypes = {
  /** Select element ID */
  id: PropTypes.string,
  
  /** Select element name */
  name: PropTypes.string,
  
  /** Selected value (for controlled component) */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  
  /** Default selected value (for uncontrolled component) */
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  
  /** Array of options to display */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  
  /** Select label */
  label: PropTypes.string,
  
  /** Select placeholder */
  placeholder: PropTypes.string,
  
  /** Helper text below select */
  helperText: PropTypes.string,
  
  /** Error message */
  error: PropTypes.string,
  
  /** Whether select is required */
  required: PropTypes.bool,
  
  /** Whether select is disabled */
  disabled: PropTypes.bool,
  
  /** Whether select is read-only */
  readOnly: PropTypes.bool,
  
  /** Visual variant */
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  
  /** Select size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  /** Change handler */
  onChange: PropTypes.func,
  
  /** Focus handler */
  onFocus: PropTypes.func,
  
  /** Blur handler */
  onBlur: PropTypes.func,
  
  /** Whether select should take full width */
  fullWidth: PropTypes.bool,
  
  /** Additional CSS class names */
  className: PropTypes.string,
};

export default Select;