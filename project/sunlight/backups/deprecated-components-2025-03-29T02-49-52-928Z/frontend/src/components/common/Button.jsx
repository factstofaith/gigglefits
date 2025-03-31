/**
 * @component Button
 * @description A wrapper around the design system Button component.
 * This component is deprecated and maintained for backward compatibility.
 * New code should import Button directly from '../../design-system'.
 *
 * @example
 * // Preferred usage (new code)
 * import { Button } from '../../design-system';
 * <Button>Click Me</Button>
 *
 * @example
 * // Legacy usage (existing code)
 * // Removed duplicate import
 * <Button>Click Me</Button>
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button as DesignSystemButton } from '../../design-system';

/**
 * Button component - DEPRECATED
 * This is a wrapper around the design system Button for backward compatibility.
 * @deprecated Use the Button component from design-system/adapter instead.
 */
function Button(props) {
  // Show deprecation warning in development (only once)
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'DEPRECATED: Using common/Button is deprecated. Please import Button from design-system/adapter instead.'
    );
  }

  return <DesignSystemButton {...props} />;
}

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.string,
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

Button.displayName = 'Button';

export default Button;