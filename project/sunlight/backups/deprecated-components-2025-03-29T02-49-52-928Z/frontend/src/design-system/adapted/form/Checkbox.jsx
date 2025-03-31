/**
 * @component CheckboxAdapted
 * @description Enhanced checkbox component with accessibility features
 * and consistent styling. Provides a Material UI compatible API.
 * @typedef {import('../../types/form').CheckboxProps} CheckboxProps
 * @type {React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from '@mui/material';
import { getAriaAttributes } from '../../../utils/accessibilityUtils';

/**
 * CheckboxAdapted - Material UI compatible checkbox component
 */
const CheckboxAdapted = React.forwardRef(({
  // Checkbox state
  checked = false,
  indeterminate = false,
  disabled = false,
  required = false,
  
  // Labels and identifiers
  id,
  name,
  value,
  label,
  
  // Styling props
  color = 'primary',
  size = 'medium',
  
  // Event handlers
  onChange,
  onFocus,
  onBlur,
  
  // Accessibility props
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  
  // Additional styling
  className,
  style,
  
  ...otherProps
}, ref) => {
  // Generate ARIA attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel,
    labelledBy: ariaLabelledBy,
    describedBy: ariaDescribedBy,
    checked: indeterminate ? 'mixed' : checked,
    required,
    disabled,
  });
  
  // Handle change event
  const handleChange = (e, newChecked) => {
  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

    if (disabled) return;
    
    if (onChange) {
      onChange(e, newChecked);
    }
  };
  
  return (
    <Checkbox
      ref={ref}
      id={id}
      name={name}
      value={value}
      checked={checked}
      indeterminate={indeterminate}
      disabled={disabled}
      required={required}
      color={color}
      size={size}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`ds-checkbox-adapted ${className || ''}`}
      style={style}
      {...ariaAttributes}
      {...otherProps}
    />
  );
});

CheckboxAdapted.propTypes = {
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.node,
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success', 'default']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  ariaLabel: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

CheckboxAdapted.displayName = 'CheckboxAdapted';

export default CheckboxAdapted;