/**
 * Accessible Button Component
 * 
 * A fully accessible button component that follows WCAG standards.
 * Features keyboard navigation support, ARIA attributes, proper focus handling,
 * and consistent styling across different states (hover, focus, active, disabled).
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Color contrast constants that meet WCAG AA standards
 */
const COLORS = {
  primary: {
    background: '#0056b3',
    text: '#ffffff',
    hoverBackground: '#004494',
    focusOutline: '#4d90fe',
    disabledBackground: '#88b2dd',
    disabledText: '#ffffff'
  },
  secondary: {
    background: '#6c757d',
    text: '#ffffff',
    hoverBackground: '#5a6268',
    focusOutline: '#4d90fe',
    disabledBackground: '#b2b5b8',
    disabledText: '#ffffff'
  },
  success: {
    background: '#28a745',
    text: '#ffffff',
    hoverBackground: '#218838',
    focusOutline: '#4d90fe',
    disabledBackground: '#8dd49a',
    disabledText: '#ffffff'
  },
  danger: {
    background: '#dc3545',
    text: '#ffffff',
    hoverBackground: '#c82333',
    focusOutline: '#4d90fe',
    disabledBackground: '#e99ca3',
    disabledText: '#ffffff'
  },
  light: {
    background: '#f8f9fa',
    text: '#212529',
    hoverBackground: '#e2e6ea',
    focusOutline: '#4d90fe',
    disabledBackground: '#fbfbfc',
    disabledText: '#757575'
  },
  dark: {
    background: '#343a40',
    text: '#ffffff',
    hoverBackground: '#23272b',
    focusOutline: '#4d90fe',
    disabledBackground: '#96999c',
    disabledText: '#ffffff'
  }
};

/**
 * Button sizes
 */
const SIZES = {
  small: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem',
    borderRadius: '0.2rem',
    minHeight: '32px'
  },
  medium: {
    padding: '0.375rem 0.75rem',
    fontSize: '1rem',
    borderRadius: '0.25rem',
    minHeight: '38px'
  },
  large: {
    padding: '0.5rem 1rem',
    fontSize: '1.25rem',
    borderRadius: '0.3rem',
    minHeight: '48px'
  }
};

/**
 * Accessible Button Component
 */
const A11yButton = forwardRef((props, ref) => {
  const {
    children,
    color = 'primary',
    size = 'medium',
    variant = 'contained',
    fullWidth = false,
    disabled = false,
    loading = false,
    href,
    startIcon,
    endIcon,
    type = 'button',
    onClick,
    onKeyDown,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    ariaControls,
    ariaExpanded,
    ariaHaspopup,
    className,
    style,
    role,
    tabIndex,
    dataTestId,
    ...other
  } = props;

  // Creating internal ref if none provided
  const buttonRef = useRef(null);
  const resolvedRef = ref || buttonRef;
  
  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    // Execute onClick on Enter and Space
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled && onClick) {
        onClick(event);
      }
    }
    
    // Call provided onKeyDown if available
    if (onKeyDown) {
      onKeyDown(event);
    }
  };
  
  // Focus button when loading completes
  const previousLoadingRef = useRef(loading);
  useEffect(() => {
    if (previousLoadingRef.current && !loading && resolvedRef.current) {
      resolvedRef.current.focus();
    }
    previousLoadingRef.current = loading;
  }, [loading, resolvedRef]);

  // Style based on theme and button state
  const buttonColors = COLORS[color] || COLORS.primary;
  const buttonSizes = SIZES[size] || SIZES.medium;
  
  const getVariantStyles = () => {
    if (variant === 'text') {
      return {
        backgroundColor: 'transparent',
        color: buttonColors.background,
        border: 'none',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        },
        '&:disabled': {
          color: buttonColors.disabledBackground,
          backgroundColor: 'transparent'
        }
      };
    } else if (variant === 'outlined') {
      return {
        backgroundColor: 'transparent',
        color: buttonColors.background,
        border: `1px solid ${buttonColors.background}`,
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        },
        '&:disabled': {
          color: buttonColors.disabledBackground,
          borderColor: buttonColors.disabledBackground,
          backgroundColor: 'transparent'
        }
      };
    } else {
      // Default contained variant
      return {
        backgroundColor: buttonColors.background,
        color: buttonColors.text,
        border: 'none',
        '&:hover': {
          backgroundColor: buttonColors.hoverBackground
        },
        '&:disabled': {
          backgroundColor: buttonColors.disabledBackground,
          color: buttonColors.disabledText
        }
      };
    }
  };
  
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxSizing: 'border-box',
    WebkitTapHighlightColor: 'transparent',
    outline: 0,
    margin: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    verticalAlign: 'middle',
    appearance: 'none',
    textDecoration: 'none',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
    minWidth: 64,
    transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, ' +
                'box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, ' +
                'border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, ' +
                'color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    ...buttonSizes,
    width: fullWidth ? '100%' : 'auto',
    '&:focus': {
      outline: `2px solid ${buttonColors.focusOutline}`,
      outlineOffset: 2
    },
    '&:focus:not(:focus-visible)': {
      outline: 'none' // Remove outline for mouse users but keep for keyboard users
    },
    // Styles for :focus-visible only apply for browsers that support it
    '&:focus-visible': {
      outline: `2px solid ${buttonColors.focusOutline}`,
      outlineOffset: 2
    },
    '&:active': {
      transform: 'scale(0.98)'
    }
  };
  
  const variantStyles = getVariantStyles();
  
  // Combine all styles
  const combinedStyles = {
    ...baseStyles,
    ...variantStyles,
    ...style
  };
  
  // Convert the style object to CSS-in-JS string
  const styleString = Object.entries(combinedStyles)
    .map(([key, value]) => {
      // Handle pseudo-selectors and nested styles
      if (typeof value === 'object') {
        const nestedStyles = Object.entries(value)
          .map(([nestedKey, nestedValue]) => `${nestedKey}: ${nestedValue};`)
          .join(' ');
        return `${key} { ${nestedStyles} }`;
      }
      // Convert camelCase to kebab-case
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}: ${value};`;
    })
    .join(' ');
  
  // Loading or content
  const buttonContent = loading ? (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        role="progressbar"
        aria-label="Loading"
        style={{
          width: '1em',
          height: '1em',
          borderRadius: '50%',
          border: `2px solid ${variant === 'contained' ? buttonColors.text : buttonColors.background}`,
          borderTopColor: 'transparent',
          animation: 'a11y-button-spin 0.8s linear infinite',
          marginRight: children ? '0.5em' : 0
        }}
      />
      {children}
    </div>
  ) : (
    <>
      {startIcon && <span style={{ marginRight: '0.5em', display: 'inline-flex' }}>{startIcon}</span>}
      {children}
      {endIcon && <span style={{ marginLeft: '0.5em', display: 'inline-flex' }}>{endIcon}</span>}
    </>
  );

  // Create spinning animation in a style tag
  const spinnerAnimation = `
    @keyframes a11y-button-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  // Determine which element to render (button or anchor)
  const ButtonComponent = href && !disabled ? 'a' : 'button';
  
  // Determine button role
  const buttonRole = role || (href ? 'button' : undefined);
  
  // Determine aria props based on component type
  const ariaProps = {
    'aria-disabled': disabled,
    'aria-busy': loading,
    ...(ariaLabel && { 'aria-label': ariaLabel }),
    ...(ariaLabelledBy && { 'aria-labelledby': ariaLabelledBy }),
    ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
    ...(ariaControls && { 'aria-controls': ariaControls }),
    ...(ariaExpanded !== undefined && { 'aria-expanded': ariaExpanded }),
    ...(ariaHaspopup !== undefined && { 'aria-haspopup': ariaHaspopup })
  };
  
  return (
    <>
      <style>{spinnerAnimation}</style>
      <ButtonComponent
        ref={resolvedRef}
        className={className}
        disabled={ButtonComponent === 'button' ? disabled : undefined}
        href={href && !disabled ? href : undefined}
        onClick={!disabled ? onClick : undefined}
        onKeyDown={handleKeyDown}
        role={buttonRole}
        style={combinedStyles}
        tabIndex={tabIndex !== undefined ? tabIndex : disabled ? -1 : 0}
        type={ButtonComponent === 'button' ? type : undefined}
        data-testid={dataTestId}
        {...ariaProps}
        {...other}
      >
        {buttonContent}
      </ButtonComponent>
    </>
  );
});

A11yButton.displayName = 'A11yButton';

A11yButton.propTypes = {
  /** The content of the button */
  children: PropTypes.node,
  /** The color of the button */
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'light', 'dark']),
  /** The size of the button */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** The variant to use */
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  /** If true, the button will take up the full width of its container */
  fullWidth: PropTypes.bool,
  /** If true, the button will be disabled */
  disabled: PropTypes.bool,
  /** If true, the button will show a loading spinner */
  loading: PropTypes.bool,
  /** Link URL, if specified button acts as a link */
  href: PropTypes.string,
  /** Icon element to display before the label */
  startIcon: PropTypes.node,
  /** Icon element to display after the label */
  endIcon: PropTypes.node,
  /** Type of the button element */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  /** Callback fired when the button is clicked */
  onClick: PropTypes.func,
  /** Callback fired when a key is pressed */
  onKeyDown: PropTypes.func,
  /** Provides an accessible name for the button */
  ariaLabel: PropTypes.string,
  /** ID of element that labels the button */
  ariaLabelledBy: PropTypes.string,
  /** ID of element that describes the button */
  ariaDescribedBy: PropTypes.string,
  /** ID of element controlled by the button */
  ariaControls: PropTypes.string,
  /** Indicates whether controlled element is expanded */
  ariaExpanded: PropTypes.bool,
  /** Indicates the type of popup triggered by the button */
  ariaHaspopup: PropTypes.oneOf(['true', 'menu', 'listbox', 'tree', 'grid', 'dialog']),
  /** Additional CSS class */
  className: PropTypes.string,
  /** Additional inline styles */
  style: PropTypes.object,
  /** ARIA role override */
  role: PropTypes.string,
  /** Tab index override */
  tabIndex: PropTypes.number,
  /** Data test ID for testing */
  dataTestId: PropTypes.string
};

export default A11yButton;