/**
 * @component TextField
 * @description A wrapper around the design system TextField component that maintains
 * backward compatibility with Material UI's TextField API.
 *
 * This component serves as a bridge during the migration from Material UI to our custom design system,
 * allowing gradual adoption of the new design system without breaking existing code.
 */

import React from 'react';
import { TextField } from '@design-system/components/form';

const TextField = ({
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
  ...rest
}) => {
  // Added display name
  TextField.displayName = 'TextField';

  // Added display name
  TextField.displayName = 'TextField';

  // Added display name
  TextField.displayName = 'TextField';

  // Added display name
  TextField.displayName = 'TextField';

  // Added display name
  TextField.displayName = 'TextField';


  // Handle Material UI's InputProps (particularly for startAdornment and endAdornment)
  const { startAdornment, endAdornment, ...otherInputProps } = InputProps || {};

  // Map Material UI props to design system props
  return (
    <TextField
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
      required={required}
      autoFocus={autoFocus}
      error={error}
      helperText={helperText}
      multiline={multiline}
      rows={rows}
      fullWidth={fullWidth}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      className="ds-text-field ds-text-field-legacy"
      {...rest}
    />
  );
};

export default TextField;
