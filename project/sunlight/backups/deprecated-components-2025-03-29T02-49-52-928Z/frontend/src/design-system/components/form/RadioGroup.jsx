/**
 * @component RadioGroup
 * @description Component to manage a group of Radio components
 * Provides context and layout for related radio buttons
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';
import Box from '@design-system/components/layout/Box';
import Stack from '@design-system/components/layout/Stack';
import Typography from '@design-system/components/core/Typography';

/**
 * RadioGroup Component
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.name] - Name for all radio inputs in the group
 * @param {string} [props.label] - Group label text
 * @param {string} [props.helperText] - Helper text displayed below the group
 * @param {string} [props.errorText] - Error text displayed instead of helper text when error is true
 * @param {boolean} [props.error=false] - Whether the radio group has an error
 * @param {boolean} [props.disabled=false] - Whether all radio buttons in the group are disabled
 * @param {boolean} [props.required=false] - Whether selection from the group is required
 * @param {string} [props.value] - Selected value for controlled component
 * @param {string} [props.defaultValue] - Default selected value for uncontrolled component
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.color='primary'] - Color for all radio buttons in the group
 * @param {string} [props.size='medium'] - Size for all radio buttons in the group
 * @param {'horizontal'|'vertical'} [props.layout='vertical'] - Layout direction for the radio buttons
 * @param {React.ReactNode} props.children - Radio components
 * @param {string} [props.className] - Additional CSS class
 * @param {Object} [props.style] - Additional inline styles
 * @returns {React.ReactElement} RadioGroup component
 */
const RadioGroup = forwardRef(
  (
    {
      name,
      label,
      helperText,
      errorText,
      error = false,
      disabled = false,
      required = false,
      value,
      defaultValue,
      onChange,
      color = 'primary',
      size = 'medium',
      layout = 'vertical',
      children,
      className = '',
      style = {},
      ...rest
    },
    ref
  ) => {
    // Get theme context
    const { theme } = useTheme();

    // Generate a unique ID
    const groupId = `tap-radio-group-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = `${groupId}-helper-text`;

    // Handle change
    const handleChange = e => {
      if (onChange) {
        onChange(e);
      }
    };

    // Determine label variant
    const getLabelVariant = () => {
  // Added display name
  getLabelVariant.displayName = 'getLabelVariant';

  // Added display name
  getLabelVariant.displayName = 'getLabelVariant';

  // Added display name
  getLabelVariant.displayName = 'getLabelVariant';

  // Added display name
  getLabelVariant.displayName = 'getLabelVariant';

  // Added display name
  getLabelVariant.displayName = 'getLabelVariant';


      switch (size) {
        case 'small':
          return 'caption';
        case 'medium':
          return 'label';
        case 'large':
          return 'body2';
        default:
          return 'label';
      }
    };

    // Helper text color
    const getHelperTextColor = () => {
  // Added display name
  getHelperTextColor.displayName = 'getHelperTextColor';

  // Added display name
  getHelperTextColor.displayName = 'getHelperTextColor';

  // Added display name
  getHelperTextColor.displayName = 'getHelperTextColor';

  // Added display name
  getHelperTextColor.displayName = 'getHelperTextColor';

  // Added display name
  getHelperTextColor.displayName = 'getHelperTextColor';


      if (error) return theme.colors.status.error;
      if (disabled) return theme.colors.text.disabled;
      return theme.colors.text.secondary;
    };

    // Clone children with props
    const renderChildren = () => {
  // Added display name
  renderChildren.displayName = 'renderChildren';

  // Added display name
  renderChildren.displayName = 'renderChildren';

  // Added display name
  renderChildren.displayName = 'renderChildren';

  // Added display name
  renderChildren.displayName = 'renderChildren';

  // Added display name
  renderChildren.displayName = 'renderChildren';


      return React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;

        // Pass properties to Radio components
        return React.cloneElement(child, {
          name,
          disabled: disabled || child.props.disabled,
          color: child.props.color || color,
          size: child.props.size || size,
          checked: value !== undefined ? value === child.props.value : undefined,
          defaultChecked:
            defaultValue !== undefined ? defaultValue === child.props.value : undefined,
          onChange: e => {
            if (child.props.onChange) {
              child.props.onChange(e);
            }
            handleChange(e);
          },
          error: error || child.props.error,
          // Don't override existing child helperText/errorText
          helperText: undefined,
          errorText: undefined,
        });
      });
    };

    return (
      <Box
        ref={ref}
        className={`tap-radio-group ${className}`}
        role="radiogroup&quot;
        aria-labelledby={`${groupId}-label`}
        aria-describedby={helperText || errorText ? helperTextId : undefined}
        aria-required={required}
        aria-invalid={error}
        style={style}
        {...rest}
      >
        {label && (
          <Typography
            id={`${groupId}-label`}
            component="label"
            variant={getLabelVariant()}
            color={error ? 'error' : disabled ? 'disabled' : 'textSecondary'}
            style={{ marginBottom: '8px', display: 'block' }}
          >
            {label}
            {required && <span style={{ color: theme.colors.status.error }}> *</span>}
          </Typography>
        )}

        <Stack
          direction={layout === 'horizontal' ? 'row' : 'column'}
          spacing={layout === 'horizontal' ? 'xl' : 'md'}
          wrap={layout === 'horizontal'}
        >
          {renderChildren()}
        </Stack>

        {(helperText || errorText) && (
          <Typography
            id={helperTextId}
            variant="caption&quot;
            color={getHelperTextColor()}
            style={{ marginTop: "4px' }}
          >
            {error ? errorText : helperText}
          </Typography>
        )}
      </Box>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

RadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  helperText: PropTypes.string,
  errorText: PropTypes.string,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default RadioGroup;
