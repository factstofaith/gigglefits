/**
 * @file shape.js
 * @description Shape tokens for the TAP Integration Platform design system.
 * Defines border radius and shape constants.
 */

/**
 * Border radius tokens
 * Defines border radius values for consistent rounded corners
 */
export const borderRadius = {
  // Named scale
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',

  // Component-specific border radius
  button: '8px',
  card: '12px',
  panel: '8px',
  modal: '16px',
  chip: '9999px',
  input: '8px',
  tooltip: '4px',
};

/**
 * Border width tokens
 * Defines consistent border widths
 */
export const borderWidth = {
  none: 0,
  thin: '1px',
  default: '1px',
  thick: '2px',
  heavy: '3px',
};

/**
 * Border style tokens
 */
export const borderStyle = {
  none: 'none',
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted',
};

/**
 * Shape variations
 * Predefined shape styles for common UI elements
 */
export const shape = {
  // Default shape
  default: {
    borderRadius: borderRadius.md,
  },

  // Soft shape (slightly rounded)
  soft: {
    borderRadius: borderRadius.sm,
  },

  // Rounded shape (very rounded)
  rounded: {
    borderRadius: borderRadius.lg,
  },

  // Circular shape (perfect circle when width = height)
  circular: {
    borderRadius: borderRadius.full,
  },

  // Sharp shape (no rounding)
  sharp: {
    borderRadius: borderRadius.none,
  },
};

export default {
  borderRadius,
  borderWidth,
  borderStyle,
  shape,
};
