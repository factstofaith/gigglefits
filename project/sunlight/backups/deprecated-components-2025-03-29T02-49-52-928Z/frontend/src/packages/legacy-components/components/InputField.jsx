/**
 * @component InputField
 * @description A compatibility wrapper for the legacy InputField component. This component
 * maps the legacy InputField API to the new design system TextField component, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@design-system/components/form/TextField';

/**
 * InputFieldLegacy - Migration wrapper for legacy InputField component
 *
 * @param {Object} props - All props from the original InputField component
 * @returns {React.ReactElement} Rendered TextField component from design system
 */
const InputField = React.forwardRef(
  ({ label, type = 'text', value, onChange, placeholder, style, ...otherProps }, ref) => {
    // Map styles from legacy to design system
    const mappedStyles = {
      ...style,
    };

    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'InputFieldLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system TextField component.'
      );
    }

    return (
      <TextField
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        helperText={label ? undefined : label}
        label={label}
        style={mappedStyles}
        variant="outlined&quot;
        size="medium"
        fullWidth
        {...otherProps}
      />
    );
  }
);

InputFieldLegacy.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  style: PropTypes.object,
};

InputField.displayName = 'InputField';

export default InputField;
