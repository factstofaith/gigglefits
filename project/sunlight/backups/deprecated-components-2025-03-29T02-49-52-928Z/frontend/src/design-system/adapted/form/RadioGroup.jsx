/**
 * @component RadioGroup
 * @description An enhanced radio group component with accessibility features.
 * @typedef {import('../../types/form').RadioGroupProps} RadioGroupProps
 * @type {React.ForwardRefExoticComponent<RadioGroupProps & React.RefAttributes<HTMLDivElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
;
;
;
;
;
;;
import { getAriaAttributes } from '@utils/accessibilityUtils';
import ErrorBoundary from '../core/ErrorBoundary/ErrorBoundary';
import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup as MuiRadioGroup } from '../../design-system';

const RadioGroup = React.memo(React.forwardRef((props, ref) => {
  // Destructure and process props
  const {
    // Required props
    id,
    name,
    value,
    onChange,
    options = [],
    
    // Optional props with defaults
    label = '',
    helperText = '',
    error = false,
    disabled = false,
    required = false,
    row = false,
    size = 'medium',
    
    // ARIA props
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    
    // Rest of props
    ...otherProps
  } = props;
  
  // Generate ID for helper text
  const helperTextId = helperText ? `${id}-helper-text` : undefined;
  
  // Compute ARIA attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel,
    labelledBy: ariaLabelledBy || (label ? `${id}-label` : undefined),
    describedBy: ariaDescribedBy || helperTextId,
    required,
    disabled,
    hasError: error
  });
  
  return (
    <ErrorBoundary fallback={<div>Error rendering radio group component</div>}>
      <FormControl
        component="fieldset&quot;
        error={error}
        disabled={disabled}
        required={required}
        className="ds-radio-group ds-radio-group-adapted"
      >
        {label && (
          <FormLabel id={`${id}-label`} component="legend&quot;>{label}</FormLabel>
        )}
        
        <MuiRadioGroup
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          aria-describedby={helperTextId}
          row={row}
          {...ariaAttributes}
          {...otherProps}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio size={size} />}
              label={option.label}
              disabled={option.disabled || disabled}
              className="ds-radio-option"
            />
          ))}
        </MuiRadioGroup>
        
        {helperText && (
          <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
        )}
      </FormControl>
    </ErrorBoundary>
  );
}));

RadioGroupAdapted.propTypes = {
  // Required props
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.node.isRequired,
    disabled: PropTypes.bool
  })).isRequired,
  
  // Optional props
  label: PropTypes.string,
  helperText: PropTypes.node,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  row: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
  
  // ARIA props
  ariaLabel: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string
};

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;