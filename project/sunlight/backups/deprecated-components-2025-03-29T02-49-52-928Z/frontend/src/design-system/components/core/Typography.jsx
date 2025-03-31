import React from 'react';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';

/**
 * Typography component for consistent text styling
 */
export const Typography = React.forwardRef(
  (
    {
      variant = 'body1',
      component,
      color,
      align = 'inherit',
      noWrap = false,
      gutterBottom = false,
      children,
      style = {},
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { typography, colors } = theme;

    // Determine the component to render based on variant or override
    const Component = component || getComponentFromVariant(variant);

    // Get typography styles from theme
    const variantStyles = typography.variants[variant] || typography.variants.body1;

    // Determine text color
    const textColor = determineColor(color, colors);

    // Combine all styles
    const combinedStyles = {
      ...variantStyles,
      color: textColor,
      textAlign: align,
      marginBottom: gutterBottom ? '0.35em' : 0,
      whiteSpace: noWrap ? 'nowrap' : 'normal',
      overflow: noWrap ? 'hidden' : 'visible',
      textOverflow: noWrap ? 'ellipsis' : 'clip',
      ...style,
    };

    return (
      <Component ref={ref} style={combinedStyles} {...props}>
        {children}
      </Component>
    );
  }
);

/**
 * Map variant to HTML element
 */
function getComponentFromVariant(variant) {
  // Added display name
  getComponentFromVariant.displayName = 'getComponentFromVariant';

  const variantComponentMap = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    subtitle1: 'h6',
    subtitle2: 'h6',
    body1: 'p',
    body2: 'p',
    button: 'span',
    caption: 'span',
    overline: 'span',
    code: 'code',
  };

  return variantComponentMap[variant] || 'span';
}

/**
 * Determine text color based on prop and theme
 */
function determineColor(color, colors) {
  // Added display name
  determineColor.displayName = 'determineColor';

  if (!color) return 'inherit';

  // Handle semantic colors
  if (color.includes('.')) {
    const [category, shade] = color.split('.');
    return colors[category]?.[shade] || colors.text.primary;
  }

  // Handle direct color references
  switch (color) {
    case 'primary':
      return colors.primary.main;
    case 'secondary':
      return colors.secondary.main;
    case 'error':
      return colors.error.main;
    case 'warning':
      return colors.warning.main;
    case 'success':
      return colors.success.main;
    case 'info':
      return colors.info.main;
    case 'textPrimary':
      return colors.text.primary;
    case 'textSecondary':
      return colors.text.secondary;
    case 'disabled':
      return colors.text.disabled;
    default:
      return color; // Assume direct color value (e.g. '#f00' or 'rgb(0,0,0)')
  }
}

Typography.displayName = 'Typography';

export default Typography;
