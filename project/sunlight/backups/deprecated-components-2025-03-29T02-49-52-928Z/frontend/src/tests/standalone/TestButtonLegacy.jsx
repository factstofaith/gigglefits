// TestButtonLegacy.jsx
// A standalone version of ButtonLegacy for testing without Material UI or other dependencies

import React from 'react';

/**
 * A simplified implementation of ButtonLegacy for testing purposes
 * This mimics the API of Material UI Button with our design system under the hood
 */
const ButtonLegacy = React.forwardRef(
  (
    {
      children,
      variant = 'contained',
      color = 'primary',
      size = 'medium',
      disabled = false,
      startIcon,
      endIcon,
      fullWidth = false,
      onClick,
      type = 'button',
      className = '',
      ...props
    },
    ref
  ) => {
    // Map variants to CSS classes
    const variantClass =
      {
        contained: 'btn-contained',
        outlined: 'btn-outlined',
        text: 'btn-text',
      }[variant] || 'btn-contained';

    // Map colors to CSS classes
    const colorClass =
      {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        error: 'btn-error',
        warning: 'btn-warning',
        info: 'btn-info',
        success: 'btn-success',
      }[color] || 'btn-primary';

    // Map sizes to CSS classes
    const sizeClass =
      {
        small: 'btn-small',
        medium: 'btn-medium',
        large: 'btn-large',
      }[size] || 'btn-medium';

    // Combine all classes
    const buttonClass = `btn ${variantClass} ${colorClass} ${sizeClass} ${fullWidth ? 'btn-full-width' : ''} ${disabled ? 'btn-disabled' : ''} ${className}`;

    return (
      <button
        type={type}
        className={buttonClass}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        ref={ref}
        data-testid="button-legacy"
        {...props}
      >
        {startIcon && <span className="btn-start-icon&quot;>{startIcon}</span>}
        <span className="btn-label">{children}</span>
        {endIcon && <span className="btn-end-icon&quot;>{endIcon}</span>}
      </button>
    );
  }
);

ButtonLegacy.displayName = "ButtonLegacy';

export default ButtonLegacy;
