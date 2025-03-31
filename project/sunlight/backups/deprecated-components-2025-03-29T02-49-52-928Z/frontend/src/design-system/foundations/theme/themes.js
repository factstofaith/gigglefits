/**
 * Theme definitions combining all design tokens
 */

import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { breakpoints } from '../tokens/breakpoints';

/**
 * Light theme configuration
 */
export const lightTheme = {
  mode: 'light',
  colors: colors.light,
  typography,
  spacing,
  breakpoints,
};

/**
 * Dark theme configuration
 */
export const darkTheme = {
  mode: 'dark',
  colors: colors.dark,
  typography,
  spacing,
  breakpoints,
};

/**
 * Default theme
 */
export const defaultTheme = lightTheme;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export default themes;
