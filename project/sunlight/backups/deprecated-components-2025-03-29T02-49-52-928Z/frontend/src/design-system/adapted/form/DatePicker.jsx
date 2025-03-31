/**
 * @component DatePicker
 * @description An adapter wrapper for the Material UI DatePicker component. This component
 * maps the Material UI DatePicker API to the design system DatePicker component, providing
 * consistent interface and accessibility features.
 * @typedef {import('../../types/form').DatePickerProps} DatePickerProps
 * @type {React.ForwardRefExoticComponent<DatePickerProps & React.RefAttributes<HTMLDivElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from '@design-system/components/form';
import { getAriaAttributes } from '@utils/accessibilityUtils';

/**
 * DatePickerAdapted - Adapter wrapper for Material UI DatePicker component
 *
 * Provides a consistent interface between Material UI DatePicker and our design system
 * while supporting accessibility features and virtualization for performance.
 */
const DatePicker = React.memo(React.forwardRef(({
  variant = 'outlined',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  label,
  placeholder,
  helperText,
  error = false,
  disabled = false,
  required = false,
  autoFocus = false,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  name,
  format = 'MM/dd/yyyy',
  minDate,
  maxDate,
  disablePast = false,
  disableFuture = false,
  disableDates = [],
  InputProps,
  inputProps,
  InputLabelProps,
  FormHelperTextProps,
  margin = 'normal',
  id,
  className,
  // Accessibility props
  ariaLabel,
  ariaDescribedBy,
  ariaRequired,
  ariaInvalid,
  // Additional props
  ...rest
}, ref) => {
  // Handle Material UI's InputProps (particularly for adornments)
  const { startAdornment, endAdornment, ...otherInputProps } = InputProps || {};

  // Get accessibility attributes
  const ariaAttributes = getAriaAttributes({
    isDisabled: disabled,
    isRequired: ariaRequired || required,
    isInvalid: ariaInvalid || error,
    describedBy: ariaDescribedBy || (helperText && `${id}-helper-text`),
    label: ariaLabel || label,
  });

  // Handle validation states
  const validationProps = {
    error,
    errorText: error ? helperText : undefined,
    helperText: !error ? helperText : undefined,
    required,
  };

  return (
    <DatePicker
      id={id}
      ref={ref}
      name={name}
      label={label}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      disabled={disabled}
      format={format}
      minDate={minDate}
      maxDate={maxDate}
      disablePast={disablePast}
      disableFuture={disableFuture}
      disableDates={disableDates}
      variant={variant}
      fullWidth={fullWidth}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      className={`ds-date-picker ds-date-picker-adapted ${className || ''}`}
      {...ariaAttributes}
      {...validationProps}
      {...otherInputProps}
      {...rest}
    />
  );
}));

DatePickerAdapted.propTypes = {
  // Standard props
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.node,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  autoFocus: PropTypes.bool,
  
  // Date specific props
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  format: PropTypes.string,
  minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  disablePast: PropTypes.bool,
  disableFuture: PropTypes.bool,
  disableDates: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
  ),
  
  // Callback props
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  
  // MUI specific props to handle
  name: PropTypes.string,
  InputProps: PropTypes.object,
  inputProps: PropTypes.object,
  InputLabelProps: PropTypes.object,
  FormHelperTextProps: PropTypes.object,
  margin: PropTypes.oneOf(['none', 'dense', 'normal']),
  id: PropTypes.string,
  className: PropTypes.string,
  
  // Accessibility props
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaRequired: PropTypes.bool,
  ariaInvalid: PropTypes.bool,
};

DatePicker.displayName = 'DatePicker';

export default DatePicker;