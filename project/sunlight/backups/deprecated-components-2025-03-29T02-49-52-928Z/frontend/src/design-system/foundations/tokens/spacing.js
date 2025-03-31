/**
 * Spacing tokens for the design system
 */

export const spacingUnit = 8;

export const spacingValues = {
  none: 0,
  '2xs': `${spacingUnit * 0.25}px`, // 2px
  xs: `${spacingUnit * 0.5}px`, // 4px
  sm: `${spacingUnit * 1}px`, // 8px
  md: `${spacingUnit * 2}px`, // 16px
  lg: `${spacingUnit * 3}px`, // 24px
  xl: `${spacingUnit * 4}px`, // 32px
  '2xl': `${spacingUnit * 5}px`, // 40px
  '3xl': `${spacingUnit * 6}px`, // 48px
  '4xl': `${spacingUnit * 8}px`, // 64px
  '5xl': `${spacingUnit * 10}px`, // 80px
  '6xl': `${spacingUnit * 12}px`, // 96px
  '7xl': `${spacingUnit * 16}px`, // 128px
  '8xl': `${spacingUnit * 20}px`, // 160px
  '9xl': `${spacingUnit * 24}px`, // 192px
};

export const spacing = {
  ...spacingValues,
  unit: spacingUnit,
};

export default spacing;
