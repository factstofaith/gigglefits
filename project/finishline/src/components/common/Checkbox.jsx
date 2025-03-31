/**
 * Checkbox
 * 
 * A standardized checkbox component with label and various states.
 * 
 * @module components/common/Checkbox
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized checkbox component
 * 
 * @param {Object} props - Component props
 * @param {string} [props.id] - Checkbox element ID
 * @param {string} [props.name] - Checkbox element name
 * @param {boolean} [props.checked] - Whether checkbox is checked (controlled)
 * @param {boolean} [props.defaultChecked] - Whether checkbox is checked by default (uncontrolled)
 * @param {string} [props.label] - Checkbox label
 * @param {boolean} [props.disabled=false] - Whether checkbox is disabled
 * @param {boolean} [props.required=false] - Whether checkbox is required
 * @param {boolean} [props.indeterminate=false] - Whether checkbox is in indeterminate state
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.helperText] - Helper text below checkbox
 * @param {string} [props.error] - Error message
 * @param {string} [props.color='primary'] - Checkbox color
 * @param {string} [props.size='medium'] - Checkbox size
 * @param {string} [props.className] - Additional CSS class names
 * @param {string} [props.labelPlacement='end'] - Position of the label
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The checkbox component
 */
const Checkbox = forwardRef(({
  id,
  name,
  checked,
  defaultChecked,
  label,
  disabled = false,
  required = false,
  indeterminate = false,
  onChange,
  helperText,
  error,
  color = 'primary',
  size = 'medium',
  className = '',
  labelPlacement = 'end',
  ...rest
}, ref) => {
  // Size styles
  const sizeMap = {
    small: {
      width: '16px',
      height: '16px',
      fontSize: '14px',
    },
    medium: {
      width: '20px',
      height: '20px',
      fontSize: '16px',
    },
    large: {
      width: '24px',
      height: '24px',
      fontSize: '18px',
    },
  };
  
  // Color styles
  const colorMap = {
    primary: {
      activeColor: '#1976d2',
      hoverColor: 'rgba(25, 118, 210, 0.1)',
    },
    secondary: {
      activeColor: '#9c27b0',
      hoverColor: 'rgba(156, 39, 176, 0.1)',
    },
    success: {
      activeColor: '#4caf50',
      hoverColor: 'rgba(76, 175, 80, 0.1)',
    },
    warning: {
      activeColor: '#ff9800',
      hoverColor: 'rgba(255, 152, 0, 0.1)',
    },
    error: {
      activeColor: '#f44336',
      hoverColor: 'rgba(244, 67, 54, 0.1)',
    },
    default: {
      activeColor: '#757575',
      hoverColor: 'rgba(0, 0, 0, 0.04)',
    },
  };
  
  // Get current color
  const currentColor = colorMap[color] || colorMap.primary;
  const currentSize = sizeMap[size] || sizeMap.medium;
  
  // Container styles
  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    position: 'relative',
    marginBottom: helperText || error ? '16px' : '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
  };
  
  // Checkbox styles
  const checkboxStyle = {
    position: 'relative',
    width: currentSize.width,
    height: currentSize.height,
    border: `2px solid ${error ? colorMap.error.activeColor : disabled ? '#bdbdbd' : '#757575'}`,
    borderRadius: '3px',
    backgroundColor: 'transparent',
    display: 'inline-block',
    transition: 'background-color 0.2s, border-color 0.2s',
    margin: 0,
  };
  
  // Label styles
  const labelStyle = {
    marginLeft: labelPlacement === 'start' ? 0 : '8px',
    marginRight: labelPlacement === 'start' ? '8px' : 0,
    fontSize: currentSize.fontSize,
    color: error ? colorMap.error.activeColor : disabled ? '#bdbdbd' : '#212121',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
  
  // Helper text styles
  const helperTextStyle = {
    fontSize: '12px',
    marginTop: '4px',
    marginLeft: size === 'small' ? '24px' : size === 'large' ? '32px' : '28px',
    color: error ? colorMap.error.activeColor : '#757575',
  };
  
  // Check mark (SVG) styles
  const checkMarkSvgStyle = {
    width: '100%',
    height: '100%',
    display: 'block',
  };
  
  // Handle changes
  const handleChange = (e) => {
    if (disabled) return;
    
    if (onChange) {
      onChange(e);
    }
  };
  
  // Get unique ID
  const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
  
  // Determine if checkbox is controlled
  const isControlled = checked !== undefined;
  
  return (
    <div className={`tap-checkbox-wrapper ${className}`}>
      <div 
        className={`tap-checkbox tap-checkbox--${size} ${error ? 'tap-checkbox--error' : ''} ${disabled ? 'tap-checkbox--disabled' : ''}`}
        style={containerStyle}
        data-testid="tap-checkbox"
      >
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={isControlled ? checked : undefined}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          style={{ 
            position: 'absolute',
            opacity: 0,
            width: currentSize.width,
            height: currentSize.height,
            margin: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          aria-checked={indeterminate ? 'mixed' : undefined}
          aria-invalid={!!error}
          aria-describedby={helperText || error ? `${checkboxId}-helper-text` : undefined}
          data-indeterminate={indeterminate}
          {...rest}
        />
        
        <span 
          className="tap-checkbox__control"
          style={{
            ...checkboxStyle,
            backgroundColor: (isControlled ? checked : defaultChecked) ? currentColor.activeColor : 'transparent',
            borderColor: (isControlled ? checked : defaultChecked) ? currentColor.activeColor : error ? colorMap.error.activeColor : '#757575',
          }}
        >
          {(isControlled ? checked : defaultChecked) && !indeterminate && (
            <svg style={checkMarkSvgStyle} viewBox="0 0 24 24" data-testid="checkbox-checked-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
            </svg>
          )}
          
          {indeterminate && (
            <svg style={checkMarkSvgStyle} viewBox="0 0 24 24" data-testid="checkbox-indeterminate-icon">
              <path d="M19 13H5v-2h14v2z" fill="white" />
            </svg>
          )}
        </span>
        
        {label && (
          <label 
            htmlFor={checkboxId} 
            style={labelStyle}
            className="tap-checkbox__label"
          >
            {label}
            {required && <span style={{ color: colorMap.error.activeColor }}> *</span>}
          </label>
        )}
      </div>
      
      {(helperText || error) && (
        <div 
          id={`${checkboxId}-helper-text`}
          style={helperTextStyle}
          className="tap-checkbox__helper-text"
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

// Display name for debugging
Checkbox.displayName = 'Checkbox';

// Prop types
Checkbox.propTypes = {
  /** Checkbox element ID */
  id: PropTypes.string,
  
  /** Checkbox element name */
  name: PropTypes.string,
  
  /** Whether checkbox is checked (controlled) */
  checked: PropTypes.bool,
  
  /** Whether checkbox is checked by default (uncontrolled) */
  defaultChecked: PropTypes.bool,
  
  /** Checkbox label */
  label: PropTypes.string,
  
  /** Whether checkbox is disabled */
  disabled: PropTypes.bool,
  
  /** Whether checkbox is required */
  required: PropTypes.bool,
  
  /** Whether checkbox is in indeterminate state */
  indeterminate: PropTypes.bool,
  
  /** Change handler */
  onChange: PropTypes.func,
  
  /** Helper text below checkbox */
  helperText: PropTypes.string,
  
  /** Error message */
  error: PropTypes.string,
  
  /** Checkbox color */
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'default']),
  
  /** Checkbox size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  /** Additional CSS class names */
  className: PropTypes.string,
  
  /** Position of the label */
  labelPlacement: PropTypes.oneOf(['start', 'end']),
};

export default Checkbox;