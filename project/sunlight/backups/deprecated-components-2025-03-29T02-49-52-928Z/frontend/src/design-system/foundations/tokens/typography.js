/**
 * Typography tokens for the design system
 */

export const fontFamilies = {
  primary: '"Roboto", "Helvetica", "Arial", sans-serif',
  code: '"Roboto Mono", monospace',
};

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
};

export const fontSizes = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  md: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px
};

export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

export const typographyVariants = {
  h1: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.bold,
    fontSize: fontSizes['5xl'],
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  h2: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.bold,
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  h3: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.semiBold,
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.normal,
  },
  h4: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.semiBold,
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },
  h5: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  h6: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  subtitle1: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  subtitle2: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  body1: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.regular,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  },
  body2: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  },
  button: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wide,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.regular,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  overline: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.widest,
    textTransform: 'uppercase',
  },
  code: {
    fontFamily: fontFamilies.code,
    fontWeight: fontWeights.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
};

export const typography = {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacings,
  variants: typographyVariants,
};

export default typography;
