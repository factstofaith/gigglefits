// TestInputFieldLegacy.jsx
// A standalone version of InputFieldLegacy for testing without Material UI or other dependencies

import React, { useState, useEffect } from 'react';

/**
 * A simplified implementation of InputFieldLegacy for testing purposes
 * This mimics the API of Material UI TextField with our design system under the hood
 */
const InputFieldLegacy = React.forwardRef(
  (
    {
      // Input props
      defaultValue,
      value,
      onChange,
      onBlur,
      onFocus,
      type = 'text',
      placeholder,
      disabled = false,
      readOnly = false,
      required = false,
      autoFocus = false,
      autoComplete = 'off',
      name,
      id,

      // TextField props
      label,
      helperText,
      error = false,
      fullWidth = false,
      variant = 'outlined',
      size = 'medium',
      multiline = false,
      rows = 1,
      maxRows,
      minRows,
      startAdornment,
      endAdornment,
      className = '',

      // Other props
      ...props
    },
    ref
  ) => {
    // Internal state for controlled/uncontrolled input
    const [internalValue, setInternalValue] = useState(
      value !== undefined ? value : defaultValue || ''
    );

    // Update internal value when controlled value changes
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    // Map variants to CSS classes
    const variantClass =
      {
        outlined: 'input-outlined',
        filled: 'input-filled',
        standard: 'input-standard',
      }[variant] || 'input-outlined';

    // Map sizes to CSS classes
    const sizeClass =
      {
        small: 'input-small',
        medium: 'input-medium',
        large: 'input-large',
      }[size] || 'input-medium';

    // Combine all classes
    const inputContainerClass = `input-container ${fullWidth ? 'input-full-width' : ''} ${className}`;
    const inputClass = `input ${variantClass} ${sizeClass} ${disabled ? 'input-disabled' : ''} ${error ? 'input-error' : ''} ${readOnly ? 'input-readonly' : ''}`;

    // Handle input change
    const handleChange = event => {
      const newValue = event.target.value;

      // Update internal state for uncontrolled input
      if (value === undefined) {
        setInternalValue(newValue);
      }

      // Call onChange if provided
      if (onChange) {
        onChange(event);
      }
    };

    // Render input or textarea based on multiline prop
    const renderInput = () => {
  // Added display name
  renderInput.displayName = 'renderInput';

  // Added display name
  renderInput.displayName = 'renderInput';

  // Added display name
  renderInput.displayName = 'renderInput';

  // Added display name
  renderInput.displayName = 'renderInput';

  // Added display name
  renderInput.displayName = 'renderInput';


      const inputProps = {
        id,
        name,
        type,
        value: internalValue,
        onChange: handleChange,
        onBlur,
        onFocus,
        placeholder,
        disabled,
        readOnly,
        required,
        autoFocus,
        autoComplete,
        className: inputClass,
        ref,
        'data-testid': 'input-legacy-field',
        'aria-invalid': error,
        'aria-required': required,
        ...props,
      };

      if (multiline) {
        return <textarea rows={rows} maxLength={maxRows} minLength={minRows} {...inputProps} />;
      }

      return <input {...inputProps} />;
    };

    return (
      <div className={inputContainerClass} data-testid="input-legacy-container">
        {label && (
          <label
            className={`input-label ${required ? 'input-label-required' : ''} ${error ? 'input-label-error' : ''}`}
            htmlFor={id}
          >
            {label}
          </label>
        )}

        <div className="input-wrapper&quot;>
          {startAdornment && (
            <div className="input-adornment input-adornment-start">{startAdornment}</div>
          )}

          {renderInput()}

          {endAdornment && (
            <div className="input-adornment input-adornment-end&quot;>{endAdornment}</div>
          )}
        </div>

        {helperText && (
          <div className={`input-helper-text ${error ? "input-error-text' : ''}`}>{helperText}</div>
        )}
      </div>
    );
  }
);

InputFieldLegacy.displayName = 'InputFieldLegacy';

export default InputFieldLegacy;
