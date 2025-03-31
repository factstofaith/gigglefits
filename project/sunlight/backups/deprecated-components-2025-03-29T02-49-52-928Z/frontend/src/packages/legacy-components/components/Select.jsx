/**
 * @component Select
 * @description A compatibility wrapper for the legacy Select component. This component
 * maps the legacy Select API to the new design system Select component, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Select } from '@design-system/components/form/Select';

/**
 * SelectLegacy - Migration wrapper for legacy Select component
 *
 * @param {Object} props - All props from the original Select component
 * @returns {React.ReactElement} Rendered Select component from design system
 */
const Select = React.forwardRef(
  ({ value, onChange, options = [], placeholder, disabled = false, style, ...otherProps }, ref) => {
    // Map options to the format expected by the design system Select
    const mappedOptions = Array.isArray(options)
      ? options.map(option => {
          if (typeof option === 'object' && option.value !== undefined) {
            // Already in the right format
            return option;
          } else {
            // Convert simple value to {value, label} format
            return {
              value: option,
              label: option.toString(),
            };
          }
        })
      : [];

    // Map styles from legacy to design system
    const mappedStyles = {
      ...style,
    };

    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'SelectLegacy is a compatibility wrapper component and will be deprecated. ' +
          'Please migrate to the new design system Select component.'
      );
    }

    return (
      <Select
        ref={ref}
        value={value}
        onChange={onChange}
        options={mappedOptions}
        placeholder={placeholder}
        disabled={disabled}
        style={mappedStyles}
        variant="outlined&quot;
        size="medium"
        fullWidth
        {...otherProps}
      />
    );
  }
);

SelectLegacy.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  onChange: PropTypes.func,
  options: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
      })
    ),
  ]),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  style: PropTypes.object,
};

Select.displayName = 'Select';

export default Select;
