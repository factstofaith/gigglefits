/**
 * @component Button
 * @description A compatibility wrapper for the legacy Button component. This component
 * maps the legacy Button API to the new design system Button component, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@design-system/components/core/Button';
import { getAriaAttributes, getKeyboardHandlers } from '@utils/accessibilityUtils';

// Mapping from legacy color palette to design system
const colorMapping = {
  default: 'primary',
  primary: 'primary',
  secondary: 'secondary',
  danger: 'error',
  warning: 'warning',
  success: 'success',
};

/**
 * ButtonLegacy - Migration wrapper for legacy Button component
 *
 * @param {Object} props - All props from the original Button component
 * @returns {React.ReactElement} Rendered Button component from design system
 */
const Button = React.forwardRef(
  (
    {
      onClick,
      children,
      style,
      disabled = false,
      type = 'button',
      variant = 'default',
      size = 'medium',
      fullWidth = false,
      ariaLabel,
      ariaPressed,
      ariaExpanded,
      ariaControls,
      ariaDescribedBy,
      role,
      tabIndex,
      ...otherProps
    },
    ref
  ) => {
    // Map legacy variant to design system variant
    const dsVariant = variant === 'default' ? 'contained' : 'contained';
    const dsColor = colorMapping[variant] || 'primary';

    // Get accessibility attributes
    const ariaAttributes = getAriaAttributes({
      isDisabled: disabled,
      isPressed: ariaPressed,
      isExpanded: ariaExpanded,
      controls: ariaControls,
      describedBy: ariaDescribedBy,
      label: ariaLabel,
      role: role,
    });

    // Add keyboard support for accessibility
    const keyboardHandlers = getKeyboardHandlers({
      onEnter: onClick,
      onSpace: onClick,
      preventDefaultKeys: [' '], // Prevent page scroll on space
    });

    // Map styles from legacy to design system
    // This handles any custom styling that might be applied
    const mappedStyles = {
      ...style,
    };

    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'ButtonLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system Button component.'
      );
    }

    return (
      <Button
        ref={ref}
        onClick={onClick}
        color={dsColor}
        variant={dsVariant}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        style={mappedStyles}
        type={type}
        tabIndex={tabIndex}
        {...ariaAttributes}
        {...keyboardHandlers}
        {...otherProps}
      >
        {children}
      </Button>
    );
  }
);

ButtonLegacy.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  ariaLabel: PropTypes.string,
  ariaPressed: PropTypes.bool,
  ariaExpanded: PropTypes.bool,
  ariaControls: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  role: PropTypes.string,
  tabIndex: PropTypes.number,
};

Button.displayName = 'Button';

export default Button;
