/**
 * @component Switch
 * @description A compatibility wrapper for the legacy Switch component. This component
 * maps the legacy Switch API to the new design system Switch component, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from '@design-system/components/form';

/**
 * SwitchLegacy - Migration wrapper for legacy Switch component
 *
 * @param {Object} props - All props from the original Switch component
 * @returns {React.ReactElement} Rendered Switch component from design system
 */
const Switch = React.forwardRef(
  (
    {
      checked,
      defaultChecked,
      onChange,
      disabled = false,
      color = 'primary',
      size = 'medium',
      className = '',
      style = {},
      ...otherProps
    },
    ref
  ) => {
    // Map legacy color values to design system color values
    const colorMapping = {
      primary: 'primary',
      secondary: 'secondary',
      default: 'default',
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
        'SwitchLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system Switch component.'
      );
    }

    return (
      <Switch
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        color={colorMapping[color] || 'primary'}
        size={sizeMapping[size] || 'md'}
        className={`design-system-switch ${className}`}
        style={style}
        {...otherProps}
      />
    );
  }
);

SwitchLegacy.propTypes = {
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'default',
    'error',
    'info',
    'success',
    'warning',
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
};

Switch.displayName = 'Switch';

export default Switch;
