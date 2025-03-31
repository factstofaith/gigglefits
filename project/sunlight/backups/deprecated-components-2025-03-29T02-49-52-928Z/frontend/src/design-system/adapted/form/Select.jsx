/**
 * @component Select
 * @description An enhanced select component with accessibility features and virtualization for large option lists.
 * @typedef {import('../../types/form').SelectProps} SelectProps
 * @type {React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
;
;
;
;
;;
import { VariableSizeList } from 'react-window';
;
import { getAriaAttributes } from '@utils/accessibilityUtils';
import ErrorBoundary from '../core/ErrorBoundary/ErrorBoundary';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select as MuiSelect, styled } from '../../design-system';

// Styled MenuItem for consistent height measurement
const StyledMenuItem = styled(MenuItem)({
  height: 48,
});

// Menu wrapper component for virtualization
const MenuWrapper = React.forwardRef((props, ref) => {
  const { children, MenuListProps, maxHeight, options, ...other } = props;
  
  // Item size measurement - returns consistent height for simple items
  const getItemSize = React.useCallback(index => {
  // Added display name
  getItemSize.displayName = 'getItemSize';

    return 48; // Standard height for most items
  }, []);
  
  // Only apply virtualization if there are many options
  if (!options || options.length <= 10) {
    return <div {...other}>{children}</div>;
  }
  
  return (
    <div ref={ref} {...other}>
      <VariableSizeList
        height={Math.min(maxHeight || 300, options.length * 48)}
        width="100%&quot;
        itemSize={getItemSize}
        itemCount={options.length}
        overscanCount={5}
      >
        {({ index, style }) => (
          <div style={style}>
            {React.Children.toArray(children)[index]}
          </div>
        )}
      </VariableSizeList>
    </div>
  );
});

MenuWrapper.propTypes = {
  children: PropTypes.node,
  MenuListProps: PropTypes.object,
  maxHeight: PropTypes.number,
  options: PropTypes.array
};

MenuWrapper.displayName = "MenuWrapper';

/**
 * Enhanced select component with accessibility improvements and virtualization for large datasets
 */
const Select = React.memo(React.forwardRef((props, ref) => {
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
    fullWidth = true,
    required = false,
    multiple = false,
    placeholder = '',
    variant = 'outlined',
    size = 'medium',
    maxHeight = 300,
    
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
  
  // Prepare option items
  const menuItems = options.map((option) => (
    <StyledMenuItem 
      key={option.value} 
      value={option.value}
      disabled={option.disabled}
    >
      {option.label}
    </StyledMenuItem>
  ));
  
  // Return JSX
  return (
    <ErrorBoundary fallback={<div>Error rendering select component</div>}>
      <FormControl
        fullWidth={fullWidth}
        error={error}
        disabled={disabled}
        required={required}
        variant={variant}
        size={size}
        className="ds-select ds-select-adapted&quot;
      >
        {label && (
          <InputLabel id={`${id}-label`}>{label}</InputLabel>
        )}
        
        <MuiSelect
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          labelId={label ? `${id}-label` : undefined}
          aria-describedby={helperTextId}
          placeholder={placeholder}
          multiple={multiple}
          MenuProps={{
            MenuListProps: {
              component: MenuWrapper,
              options,
              maxHeight
            },
            PaperProps: {
              style: {
                maxHeight
              }
            }
          }}
          {...ariaAttributes}
          {...otherProps}
        >
          {menuItems}
        </MuiSelect>
        
        {helperText && (
          <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
        )}
      </FormControl>
    </ErrorBoundary>
  );
}));

SelectAdapted.propTypes = {
  // Required props
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.node.isRequired,
    disabled: PropTypes.bool
  })),
  
  // Optional props
  label: PropTypes.string,
  helperText: PropTypes.node,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  placeholder: PropTypes.string,
  variant: PropTypes.oneOf(["standard', 'outlined', 'filled']),
  size: PropTypes.oneOf(['small', 'medium']),
  maxHeight: PropTypes.number,
  
  // ARIA props
  ariaLabel: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string
};

Select.displayName = 'Select';

export default Select;