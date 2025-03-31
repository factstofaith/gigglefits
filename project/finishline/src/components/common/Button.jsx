/**
 * Button
 * 
 * A standardized button component with accessibility features.
 * 
 * @module components/common/Button
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Standard accessible button component
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button variant
 * @param {string} [props.size='medium'] - Button size
 * @param {boolean} [props.fullWidth=false] - Whether button should take full width
 * @param {node} props.children - Button content
 * @param {Function} [props.onClick] - Click handler
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {string} [props.ariaLabel] - Accessible label for screen readers
 * @param {boolean} [props.loading=false] - Whether to show loading state
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The button component
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  children,
  onClick,
  disabled = false,
  ariaLabel,
  loading = false,
  className = '',
  ...rest
}, ref) => {
  // Base styles
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontWeight: 500,
    transition: 'all 150ms ease-in-out',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    position: 'relative',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
  };

  // Size specific styles
  const sizeStyles = {
    small: {
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    medium: {
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    large: {
      padding: '0.625rem 1.25rem',
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
  };

  // Variant specific styles
  const variantStyles = {
    primary: {
      backgroundColor: disabled ? '#a0a0a0' : '#1565c0',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#0f4c8c',
      },
      '&:focus-visible': {
        boxShadow: '0 0 0 3px rgba(21, 101, 192, 0.5)',
      },
    },
    secondary: {
      backgroundColor: disabled ? '#e0e0e0' : '#f5f5f5',
      color: disabled ? '#a0a0a0' : '#424242',
      border: '1px solid #e0e0e0',
      '&:hover': {
        backgroundColor: '#eeeeee',
        borderColor: '#bbbbbb',
      },
      '&:focus-visible': {
        boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.1)',
      },
    },
    text: {
      backgroundColor: 'transparent',
      color: disabled ? '#a0a0a0' : '#1565c0',
      padding: sizeStyles[size].padding.split(' ').map(p => `calc(${p} * 0.5)`).join(' '),
      '&:hover': {
        backgroundColor: 'rgba(21, 101, 192, 0.04)',
      },
      '&:focus-visible': {
        boxShadow: '0 0 0 3px rgba(21, 101, 192, 0.2)',
      },
    },
  };

  // Combine styles
  const buttonStyle = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  // Adjust styles for hover effect
  const handleMouseEnter = (e) => {
    if (!disabled && !loading) {
      if (variant === 'primary') {
        e.currentTarget.style.backgroundColor = '#0f4c8c';
      } else if (variant === 'secondary') {
        e.currentTarget.style.backgroundColor = '#eeeeee';
      } else if (variant === 'text') {
        e.currentTarget.style.backgroundColor = 'rgba(21, 101, 192, 0.04)';
      }
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled && !loading) {
      if (variant === 'primary') {
        e.currentTarget.style.backgroundColor = '#1565c0';
      } else if (variant === 'secondary') {
        e.currentTarget.style.backgroundColor = '#f5f5f5';
      } else if (variant === 'text') {
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }
  };

  // Focus styles
  const handleFocus = (e) => {
    if (!disabled && !loading) {
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(21, 101, 192, 0.5)';
      } else if (variant === 'secondary') {
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
      } else if (variant === 'text') {
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(21, 101, 192, 0.2)';
      }
    }
  };

  const handleBlur = (e) => {
    e.currentTarget.style.boxShadow = 'none';
  };

  // Click handler
  const handleClick = (event) => {
    if (!disabled && !loading && onClick) {
      onClick(event);
    }
  };

  return (
    <button
      ref={ref}
      style={buttonStyle}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={`tap-button tap-button--${variant} tap-button--${size} ${fullWidth ? 'tap-button--fullWidth' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <span className="tap-button__loader" style={{
            display: 'inline-block',
            width: '1em',
            height: '1em',
            borderRadius: '50%',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: 'currentColor currentColor currentColor transparent',
            animation: 'tap-button-spin 0.75s linear infinite',
            marginRight: '0.5rem',
          }}></span>
          <span>{children}</span>
        </>
      ) : children}
    </button>
  );
});

// Display name for debugging
Button.displayName = 'Button';

// Prop types
Button.propTypes = {
  /** Button visual style variant */
  variant: PropTypes.oneOf(['primary', 'secondary', 'text']),
  
  /** Button size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  /** Whether button should take full width of container */
  fullWidth: PropTypes.bool,
  
  /** Button content */
  children: PropTypes.node.isRequired,
  
  /** Click handler function */
  onClick: PropTypes.func,
  
  /** Whether button is disabled */
  disabled: PropTypes.bool,
  
  /** Accessible label for screen readers */
  ariaLabel: PropTypes.string,
  
  /** Whether to show loading state */
  loading: PropTypes.bool,
  
  /** Additional CSS class names */
  className: PropTypes.string,
};

export default Button;