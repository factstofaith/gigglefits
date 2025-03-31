/**
 * @component ButtonAdapted
 * @description An adapter wrapper for the Material UI Button component. This component
 * maps the Material UI Button API to the design system Button component, providing a
 * consistent interface during the migration process.
 * 
 * @typedef {import('../../types/core').ButtonProps} ButtonProps
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import { getAriaAttributes, getKeyboardHandlers } from '../../../utils/accessibilityUtils';

// Mapping from Material UI color palette to design system
const colorMapping = {
  default: 'primary',
  primary: 'primary',
  secondary: 'secondary',
  error: 'error',
  warning: 'warning',
  success: 'success',
  info: 'info',
};

/**
 * ButtonAdapted - Adapter wrapper for Material UI Button component
 *
 * @type {React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>}
 */
const ButtonAdapted = React.forwardRef(
  (
    {
      onClick,
      children,
      style,
      disabled = false,
      type = 'button',
      variant = 'contained',
      color = 'primary',
      size = 'medium',
      fullWidth = false,
      startIcon,
      endIcon,
      ariaLabel,
      ariaPressed,
      ariaExpanded,
      ariaControls,
      ariaDescribedBy,
      role,
      tabIndex,
      className,
      ...otherProps
    },
    ref
  ) => {
    // Get design system color from mapping
    const dsColor = colorMapping[color] || 'primary';

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

    return (
      <Button
        ref={ref}
        onClick={onClick}
        color={dsColor}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        style={style}
        type={type}
        tabIndex={tabIndex}
        startIcon={startIcon}
        endIcon={endIcon}
        className={`ds-button ds-button-adapted ${className || ''}`}
        {...ariaAttributes}
        {...keyboardHandlers}
        {...otherProps}
      >
        {children}
      </Button>
    );
  }
);

ButtonAdapted.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success', 'default']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  ariaLabel: PropTypes.string,
  ariaPressed: PropTypes.bool,
  ariaExpanded: PropTypes.bool,
  ariaControls: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  role: PropTypes.string,
  tabIndex: PropTypes.number,
  className: PropTypes.string,
};

ButtonAdapted.displayName = 'ButtonAdapted';

export default ButtonAdapted;