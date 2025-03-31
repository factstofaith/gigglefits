import React from 'react';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';

/**
 * Button component with variants
 */
export const Button = React.forwardRef(
  (
    {
      variant = 'contained',
      color = 'primary',
      size = 'medium',
      disabled = false,
      fullWidth = false,
      startIcon,
      endIcon,
      children,
      onClick,
      style = {},
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { colors, spacing, typography } = theme;

    // Button size styles
    const sizeStyles = getSizeStyles(size, spacing);

    // Button variant styles
    const variantStyles = getVariantStyles(variant, color, colors);

    // Icon styles
    const iconSpacing = spacing.sm;

    // Base button styles
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      boxSizing: 'border-box',
      WebkitTapHighlightColor: 'transparent',
      backgroundColor: 'transparent',
      outline: 0,
      border: 0,
      margin: 0,
      cursor: disabled ? 'default' : 'pointer',
      userSelect: 'none',
      verticalAlign: 'middle',
      appearance: 'none',
      textDecoration: 'none',
      fontFamily: typography.fontFamilies.primary,
      fontWeight: typography.fontWeights.medium,
      fontSize: typography.fontSizes.sm,
      lineHeight: typography.lineHeights.normal,
      letterSpacing: typography.letterSpacings.wide,
      textTransform: 'uppercase',
      minWidth: 64,
      padding: `${spacing.xs} ${spacing.md}`,
      borderRadius: 4,
      transition:
        'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.7 : 1,
      ...sizeStyles,
      ...variantStyles,
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        onClick={!disabled ? onClick : undefined}
        style={baseStyles}
        {...props}
      >
        {startIcon && (
          <span style={{ display: 'inherit', marginRight: iconSpacing }}>{startIcon}</span>
        )}
        {children}
        {endIcon && <span style={{ display: 'inherit', marginLeft: iconSpacing }}>{endIcon}</span>}
      </button>
    );
  }
);

/**
 * Get size-specific styles
 */
function getSizeStyles(size, spacing) {
  // Added display name
  getSizeStyles.displayName = 'getSizeStyles';

  switch (size) {
    case 'small':
      return {
        padding: `${spacing.xs} ${spacing.sm}`,
        fontSize: '0.8125rem',
      };
    case 'large':
      return {
        padding: `${spacing.sm} ${spacing.lg}`,
        fontSize: '0.9375rem',
      };
    case 'medium':
    default:
      return {
        padding: `${spacing.xs} ${spacing.md}`,
        fontSize: '0.875rem',
      };
  }
}

/**
 * Get variant-specific styles
 */
function getVariantStyles(variant, colorName, colors) {
  // Added display name
  getVariantStyles.displayName = 'getVariantStyles';

  // Get color values based on colorName
  const colorValues = getColorValues(colorName, colors);

  switch (variant) {
    case 'outlined':
      return {
        color: colorValues.main,
        border: `1px solid ${colorValues.main}`,
        backgroundColor: 'transparent',
        ':hover': {
          backgroundColor: `rgba(${hexToRgb(colorValues.main)}, 0.04)`,
          borderColor: colorValues.dark,
        },
      };
    case 'text':
      return {
        color: colorValues.main,
        backgroundColor: 'transparent',
        ':hover': {
          backgroundColor: `rgba(${hexToRgb(colorValues.main)}, 0.04)`,
        },
      };
    case 'contained':
    default:
      return {
        color: colorValues.contrastText,
        backgroundColor: colorValues.main,
        boxShadow:
          '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
        ':hover': {
          backgroundColor: colorValues.dark,
          boxShadow:
            '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
        },
      };
  }
}

/**
 * Get color values for the button based on color name
 */
function getColorValues(colorName, colors) {
  // Added display name
  getColorValues.displayName = 'getColorValues';

  switch (colorName) {
    case 'secondary':
      return colors.secondary;
    case 'error':
      return colors.error;
    case 'warning':
      return colors.warning;
    case 'success':
      return colors.success;
    case 'info':
      return colors.info;
    case 'primary':
    default:
      return colors.primary;
  }
}

/**
 * Helper to convert hex to rgb
 */
function hexToRgb(hex) {
  // Added display name
  hexToRgb.displayName = 'hexToRgb';

  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

Button.displayName = 'Button';

export default Button;
