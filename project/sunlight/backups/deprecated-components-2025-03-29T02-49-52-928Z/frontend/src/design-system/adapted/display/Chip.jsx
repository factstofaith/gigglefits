/**
 * @component Chip
 * @description An adapter wrapper for the Material UI Chip component. This component
 * maps the Material UI Chip API to the design system Chip component, providing
 * consistent interface and accessibility features.
 * @typedef {import('../../types/display').ChipProps} ChipProps
 * @type {React.ForwardRefExoticComponent<ChipProps & React.RefAttributes<HTMLDivElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@design-system/components/display';
import { getAriaAttributes } from '@utils/accessibilityUtils';

/**
 * ChipAdapted - Adapter wrapper for Material UI Chip component
 * 
 * Provides interactive elements that represent tags, attributes, or categories
 * with consistent styling and accessibility features.
 */
const Chip = React.memo(React.forwardRef(({
  label,
  icon,
  avatar,
  deleteIcon,
  onDelete,
  color = 'default',
  size = 'medium',
  variant = 'filled',
  disabled = false,
  clickable = false,
  onClick,
  className,
  component,
  href,
  // Accessibility props
  ariaLabel,
  ariaDescribedBy,
  ariaRequired,
  ariaInvalid,
  // Additional props
  ...rest
}, ref) => {
  // Determine if chip should be clickable
  const isClickable = clickable || !!onClick || !!href;
  
  // Get accessibility attributes
  const ariaAttributes = getAriaAttributes({
    isDisabled: disabled,
    label: ariaLabel || (typeof label === 'string' ? label : undefined),
    describedBy: ariaDescribedBy,
    role: isClickable && !href ? 'button' : undefined,
  });

  return (
    <Chip
      ref={ref}
      label={label}
      icon={icon}
      avatar={!!avatar}
      deleteIcon={deleteIcon}
      onDelete={onDelete}
      onClick={onClick}
      color={color}
      size={size}
      variant={variant}
      disabled={disabled}
      clickable={isClickable}
      component={component}
      href={href}
      className={`ds-chip ds-chip-adapted ${className || ''}`}
      {...ariaAttributes}
      {...rest}
    />
  );
}));

ChipAdapted.propTypes = {
  // Standard props
  label: PropTypes.node,
  icon: PropTypes.node,
  avatar: PropTypes.node,
  deleteIcon: PropTypes.node,
  onDelete: PropTypes.func,
  color: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'error', 'warning', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['filled', 'outlined']),
  disabled: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  component: PropTypes.elementType,
  href: PropTypes.string,
  
  // Accessibility props
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaRequired: PropTypes.bool,
  ariaInvalid: PropTypes.bool,
};

Chip.displayName = 'Chip';

export default Chip;