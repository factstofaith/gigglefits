/**
 * @component Autocomplete
 * @description A compatibility wrapper for the legacy Autocomplete component. This component
 * maps the legacy Autocomplete API to the new design system Autocomplete component, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Autocomplete } from '@design-system/components/form';

/**
 * AutocompleteLegacy - Migration wrapper for legacy Autocomplete component
 *
 * @param {Object} props - All props from the original Autocomplete component
 * @returns {React.ReactElement} Rendered Autocomplete component from design system
 */
const Autocomplete = React.forwardRef(
  (
    {
      options = [],
      getOptionLabel,
      renderInput,
      renderOption,
      renderTags,
      value,
      defaultValue,
      onChange,
      multiple = false,
      freeSolo = false,
      disableClearable = false,
      loading = false,
      disabled = false,
      className = '',
      style = {},
      ...otherProps
    },
    ref
  ) => {
    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'AutocompleteLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system Autocomplete component.'
      );
    }

    return (
      <Autocomplete
        ref={ref}
        options={options}
        getOptionLabel={getOptionLabel}
        renderInput={renderInput}
        renderOption={renderOption}
        renderTags={renderTags}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        multiple={multiple}
        freeSolo={freeSolo}
        disableClearable={disableClearable}
        loading={loading}
        disabled={disabled}
        className={`design-system-autocomplete ${className}`}
        style={style}
        {...otherProps}
      />
    );
  }
);

AutocompleteLegacy.propTypes = {
  options: PropTypes.array,
  getOptionLabel: PropTypes.func,
  renderInput: PropTypes.func.isRequired,
  renderOption: PropTypes.func,
  renderTags: PropTypes.func,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
  freeSolo: PropTypes.bool,
  disableClearable: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

Autocomplete.displayName = 'Autocomplete';

export default Autocomplete;
