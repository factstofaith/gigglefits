/**
 * @component IconButton
 * @description A compatibility wrapper for the legacy IconButton component. This component
 * maps the legacy IconButton API to the new design system IconButton component, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@design-system/components/core';

/**
 * IconButtonLegacy - Migration wrapper for legacy IconButton component
 *
 * @param {Object} props - All props from the original IconButton component
 * @returns {React.ReactElement} Rendered IconButton component from design system
 */
const IconButton = React.forwardRef(
  (
    {
      children,
      color = 'default',
      disabled = false,
      size = 'medium',
      className = '',
      style = {},
      onClick,
      ...otherProps
    },
    ref
  ) => {
    // Map legacy color values to design system color values
    const colorMapping = {
      default: 'default',
      inherit: 'inherit',
      primary: 'primary',
      secondary: 'secondary',
      error: 'error',
      info: 'info',
      success: 'success',
      warning: 'warning',
    };

    // Map legacy size values to design system size values
    const sizeMapping = {
      small: 'sm',
      medium: 'md',
      large: 'lg',
    };

    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'IconButtonLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system IconButton component.'
      );
    }

    return (
      <Button
        ref={ref}
        variant="icon&quot;
        color={colorMapping[color] || "default'}
        size={sizeMapping[size] || 'md'}
        disabled={disabled}
        className={`design-system-icon-button ${className}`}
        style={style}
        onClick={onClick}
        {...otherProps}
      >
        {children}
      </Button>
    );
  }
);

IconButtonLegacy.propTypes = {
  children: PropTypes.node,
  color: PropTypes.oneOf([
    'default',
    'inherit',
    'primary',
    'secondary',
    'error',
    'info',
    'success',
    'warning',
  ]),
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

IconButton.displayName = 'IconButton';

export default IconButton;
