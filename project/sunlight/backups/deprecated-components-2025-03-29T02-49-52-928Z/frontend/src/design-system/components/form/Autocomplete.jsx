import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';
;
import TextField from './TextField';
import { Autocomplete as MuiAutocomplete } from '@design-system';

/**
 * Autocomplete component
 * A wrapper around Material UI's Autocomplete
 */
const Autocomplete = React.forwardRef(
  (
    {
      options = [],
      getOptionLabel = option => option.label || option.toString(),
      onChange,
      value,
      multiple = false,
      freeSolo = false,
      loading = false,
      disabled = false,
      fullWidth = false,
      renderInput,
      textFieldProps = {},
      ...props
    },
    ref
  ) => {
    // Default render input function that uses our TextField component
    const defaultRenderInput = params => (
      <TextField
        {...params}
        {...textFieldProps}
        variant={textFieldProps.variant || 'outlined'}
        fullWidth={fullWidth}
        disabled={disabled}
      />
    );

    return (
      <MuiAutocomplete
        ref={ref}
        options={options}
        getOptionLabel={getOptionLabel}
        onChange={onChange}
        value={value}
        multiple={multiple}
        freeSolo={freeSolo}
        loading={loading}
        disabled={disabled}
        fullWidth={fullWidth}
        renderInput={renderInput || defaultRenderInput}
        {...props}
      />
    );
  }
);

Autocomplete.propTypes = {
  /**
   * The array of options to be rendered
   */
  options: PropTypes.array,

  /**
   * Used to determine the string value for the selected item
   */
  getOptionLabel: PropTypes.func,

  /**
   * Callback fired when the value changes
   */
  onChange: PropTypes.func,

  /**
   * The value of the autocomplete
   */
  value: PropTypes.any,

  /**
   * If true, the autocomplete is free solo, meaning that it allows arbitrary values
   */
  freeSolo: PropTypes.bool,

  /**
   * If true, the autocomplete allows multiple selections
   */
  multiple: PropTypes.bool,

  /**
   * If true, the autocomplete is in a loading state
   */
  loading: PropTypes.bool,

  /**
   * If true, the autocomplete is disabled
   */
  disabled: PropTypes.bool,

  /**
   * If true, the width of the autocomplete matches its parent
   */
  fullWidth: PropTypes.bool,

  /**
   * Function that renders the input
   */
  renderInput: PropTypes.func,

  /**
   * Props applied to the TextField element
   */
  textFieldProps: PropTypes.object,
};

Autocomplete.displayName = 'Autocomplete';

export default Autocomplete;