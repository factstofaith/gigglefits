import React from 'react';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';
import Box from '@design-system/components/layout/Box';
import Typography from '@design-system/components/core/Typography';

/**
 * FormField component for wrapping form controls with labels and helper text
 */
export const FormField = ({
  children,
  label,
  helperText,
  error = false,
  required = false,
  fullWidth = false,
  disabled = false,
  id,
  style = {},
  labelProps = {},
  helperTextProps = {},
  ...props
}) => {
  // Added display name
  FormField.displayName = 'FormField';

  // Added display name
  FormField.displayName = 'FormField';

  // Added display name
  FormField.displayName = 'FormField';

  // Added display name
  FormField.displayName = 'FormField';

  // Added display name
  FormField.displayName = 'FormField';


  const { theme } = useTheme();
  const { spacing, colors, typography } = theme;

  // Pass error state to the child component
  const childWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        error,
        required,
        disabled,
        fullWidth,
        id: id || child.props.id,
        'aria-describedby': helperText ? `${id || child.props.id}-helper-text` : undefined,
      });
    }
    return child;
  });

  // Label styles
  const labelStyles = {
    display: 'block',
    marginBottom: spacing.xs,
    color: error ? colors.error.main : disabled ? colors.text.disabled : colors.text.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    ...labelProps.style,
  };

  // Helper text styles
  const helperTextStyles = {
    marginTop: spacing.xs,
    color: error ? colors.error.main : colors.text.secondary,
    fontSize: typography.fontSizes.xs,
    ...helperTextProps.style,
  };

  // Container styles
  const containerStyles = {
    marginBottom: spacing.md,
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  return (
    <Box style={containerStyles} {...props}>
      {label && (
        <label
          htmlFor={id || (React.isValidElement(children) ? children.props.id : undefined)}
          style={labelStyles}
          {...labelProps}
        >
          {label}
          {required && <span style={{ color: colors.error.main, marginLeft: '4px' }}>*</span>}
        </label>
      )}

      {childWithProps}

      {helperText && (
        <Typography
          variant="caption&quot;
          style={helperTextStyles}
          id={`${id || (React.isValidElement(children) ? children.props.id : "field')}-helper-text`}
          {...helperTextProps}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

FormField.displayName = 'FormField';

export default FormField;
