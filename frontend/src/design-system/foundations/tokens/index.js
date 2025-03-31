/**
 * Export all design tokens
 */

import colors from '@design-system/foundations/tokens/colors';
import typography from '@design-system/foundations/tokens/typography';
import spacing from '@design-system/foundations/tokens/spacing';
import breakpoints from '@design-system/foundations/tokens/breakpoints';
import shadows from '@design-system/foundations/tokens/shadows';
import shape from '@design-system/foundations/tokens/shape';
import zIndex from '@design-system/foundations/tokens/zIndex';
import transitions from '@design-system/foundations/tokens/transitions';
import components from '@design-system/foundations/tokens/components';

// Export all tokens as named exports
export { 
  colors, 
  typography, 
  spacing, 
  breakpoints,
  shadows,
  shape,
  zIndex,
  transitions,
  components
};

// Default export of all tokens as a single object
const tokens = {
  colors,
  typography,
  spacing,
  breakpoints,
  shadows,
  shape,
  zIndex,
  transitions,
  components
};

export default tokens;

export { default as breakpoints } from './breakpoints';
export { default as colors } from './colors';
export { default as components } from './components';
export { default as shadows } from './shadows';
export { default as shape } from './shape';
export { default as spacing } from './spacing';
export { default as transitions } from './transitions';
export { default as typography } from './typography';
export { default as zIndex } from './zIndex';
