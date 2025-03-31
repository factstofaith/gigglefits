/**
 * @file index.js
 * @description Exports theme provider and related utilities
 */

import ThemeProvider, { useTheme as useDesignTheme, ThemeContext } from './ThemeProvider';
import { lightTheme, darkTheme } from './themes';
import ThemeCompatibilityProvider, { 
  useTheme, 
  createCompatibilityTheme 
} from './ThemeCompatibilityLayer';

// Export original theme components
export { 
  ThemeProvider, 
  useDesignTheme, 
  ThemeContext, 
  lightTheme, 
  darkTheme 
};

// Export compatibility layer
export {
  ThemeCompatibilityProvider,
  useTheme,
  createCompatibilityTheme
};

// Default export is now the ThemeCompatibilityProvider for ease of migration
export default ThemeCompatibilityProvider;

export { default as ThemeCompatibilityLayer } from './ThemeCompatibilityLayer';
// ThemeProvider already exported above
export { default as themes } from './themes';
