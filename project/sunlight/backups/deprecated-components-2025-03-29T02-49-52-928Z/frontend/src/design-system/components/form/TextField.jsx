import React, { useState } from 'react';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';
import Box from '@design-system/components/layout/Box';
import Typography from '@design-system/components/core/Typography';

/**
 * TextField component for text input
 */
export const TextField = React.forwardRef(
  (
    {
      id,
      name,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      placeholder,
      variant = 'outlined',
      size = 'medium',
      disabled = false,
      readOnly = false,
      required = false,
      error = false,
      helperText,
      fullWidth = false,
      multiline = false,
      rows = 1,
      maxRows,
      type = 'text',
      startAdornment,
      endAdornment,
      inputRef,
      style = {},
      inputProps = {},
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { colors, spacing, typography } = theme;

    // Local state for input focus
    const [focused, setFocused] = useState(false);

    // Handle controlling the input
    const isControlled = value !== undefined;
    const inputValue = isControlled ? value : defaultValue || '';

    // Handle input state changes
    const handleChange = e => {
      if (onChange) onChange(e);
    };

    const handleFocus = e => {
      setFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = e => {
      setFocused(false);
      if (onBlur) onBlur(e);
    };

    // Get size-specific styles
    const getSizeStyles = size => {
      switch (size) {
        case 'small':
          return {
            padding: `${spacing.xs} ${spacing.sm}`,
            fontSize: typography.fontSizes.sm,
          };
        case 'large':
          return {
            padding: `${spacing.sm} ${spacing.md}`,
            fontSize: typography.fontSizes.lg,
          };
        case 'medium':
        default:
          return {
            padding: `${spacing.xs} ${spacing.md}`,
            fontSize: typography.fontSizes.md,
          };
      }
    };

    // Get variant-specific styles
    const getVariantStyles = variant => {
      const borderColor = error
        ? colors.error.main
        : focused
          ? colors.primary.main
          : colors.text.disabled;

      switch (variant) {
        case 'filled':
          return {
            border: 'none',
            borderBottom: `1px solid ${borderColor}`,
            borderRadius: '4px 4px 0 0',
            backgroundColor: focused ? 'rgba(0, 0, 0, 0.09)' : 'rgba(0, 0, 0, 0.06)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.09)',
            },
          };
        case 'standard':
          return {
            border: 'none',
            borderBottom: `1px solid ${borderColor}`,
            borderRadius: 0,
            backgroundColor: 'transparent',
            paddingLeft: 0,
            paddingRight: 0,
          };
        case 'outlined':
        default:
          return {
            border: `1px solid ${borderColor}`,
            borderRadius: '4px',
            backgroundColor: 'transparent',
          };
      }
    };

    // Size styles based on prop
    const sizeStyles = getSizeStyles(size);

    // Variant styles based on prop
    const variantStyles = getVariantStyles(variant);

    // Determine text color based on disabled/error state
    const getTextColor = () => {
  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';


      if (disabled) return colors.text.disabled;
      if (error) return colors.error.main;
      return colors.text.primary;
    };

    // Base input styles
    const inputStyles = {
      boxSizing: 'border-box',
      display: 'block',
      width: '100%',
      fontFamily: typography.fontFamilies.primary,
      fontWeight: typography.fontWeights.regular,
      color: getTextColor(),
      outline: 'none',
      ...sizeStyles,
      ...variantStyles,
      ...(disabled && {
        opacity: 0.7,
        cursor: 'default',
      }),
      ...(multiline && {
        resize: 'vertical',
        minHeight: rows * parseInt(sizeStyles.fontSize) * 2.5,
        ...(maxRows && {
          maxHeight: maxRows * parseInt(sizeStyles.fontSize) * 2.5,
        }),
      }),
      ...(fullWidth && {
        width: '100%',
      }),
      ...inputProps.style,
    };

    // Container styles
    const containerStyles = {
      position: 'relative',
      display: 'inline-flex',
      flexDirection: 'column',
      width: fullWidth ? '100%' : 'auto',
      ...style,
    };

    // Adornment container styles
    const adornmentContainerStyles = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      color: colors.text.secondary,
      pointerEvents: 'none',
    };

    // Helper text styles
    const helperTextStyles = {
      marginTop: spacing.xs,
      color: error ? colors.error.main : colors.text.secondary,
      fontSize: typography.fontSizes.xs,
    };

    // Determine input component based on multiline prop
    const InputComponent = multiline ? 'textarea' : 'input';

    // Input props
    const inputElementProps = {
      id,
      name,
      value: inputValue,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      placeholder,
      disabled,
      readOnly,
      required,
      type: multiline ? undefined : type,
      ref: inputRef || ref,
      style: inputStyles,
      ...inputProps,
    };

    // Calculate padding adjustments for adornments
    const paddingAdjustments = {};
    if (startAdornment) {
      paddingAdjustments.paddingLeft = '32px';
    }
    if (endAdornment) {
      paddingAdjustments.paddingRight = '32px';
    }

    return (
      <Box style={containerStyles}>
        <Box position="relative&quot;>
          {startAdornment && (
            <div style={{ ...adornmentContainerStyles, left: spacing.sm }}>{startAdornment}</div>
          )}

          <InputComponent
            {...inputElementProps}
            style={{ ...inputStyles, ...paddingAdjustments }}
          />

          {endAdornment && (
            <div style={{ ...adornmentContainerStyles, right: spacing.sm }}>{endAdornment}</div>
          )}
        </Box>

        {helperText && <Typography style={helperTextStyles}>{helperText}</Typography>}
      </Box>
    );
  }
);

TextField.displayName = "TextField';

export default TextField;
