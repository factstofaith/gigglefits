/**
 * @component TextFieldAdapted
 * @description An adapter wrapper for the Material UI TextField component. This component
 * maps the Material UI TextField API to the design system TextField component, providing
 * consistent interface and accessibility features.
 * @typedef {import('../../types/form').TextFieldProps} TextFieldProps
 * @type {React.ForwardRefExoticComponent<TextFieldProps & React.RefAttributes<HTMLInputElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import { getAriaAttributes } from '../../../utils/accessibilityUtils';

const TextFieldAdapted = React.memo(React.forwardRef(({
  variant = 'outlined',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  multiline = false,
  rows,
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
  type = 'text',
  autoComplete,
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
    helperText,
    required,
  };

  return (
    <TextField
      id={id}
      ref={ref}
      name={name}
      label={label}
      type={type}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      disabled={disabled}
      autoFocus={autoFocus}
      multiline={multiline}
      rows={rows}
      fullWidth={fullWidth}
      variant={variant}
      color={color}
      size={size}
      margin={margin}
      InputProps={{
        ...otherInputProps,
        startAdornment: startAdornment,
        endAdornment: endAdornment,
      }}
      inputProps={inputProps}
      InputLabelProps={InputLabelProps}
      FormHelperTextProps={FormHelperTextProps}
      autoComplete={autoComplete}
      className={`ds-text-field ds-text-field-adapted ${className || ''}`}
      {...ariaAttributes}
      {...rest}
    />
  );
}));

TextFieldAdapted.propTypes = {
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.node,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  autoFocus: PropTypes.bool,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  name: PropTypes.string,
  type: PropTypes.string,
  autoComplete: PropTypes.string,
  InputProps: PropTypes.object,
  inputProps: PropTypes.object,
  InputLabelProps: PropTypes.object,
  FormHelperTextProps: PropTypes.object,
  margin: PropTypes.oneOf(['none', 'dense', 'normal']),
  id: PropTypes.string,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaRequired: PropTypes.bool,
  ariaInvalid: PropTypes.bool,
};

TextFieldAdapted.displayName = 'TextFieldAdapted';

export default TextFieldAdapted;