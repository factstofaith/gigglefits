/**
 * Theme Utilities
 * 
 * Helpers for working with theme values and styling.
 * 
 * @module utils/themeUtils
 */

/**
 * Get a value from the theme by path
 * 
 * @param {Object} theme - Theme object
 * @param {string} path - Dot notation path to the value
 * @param {any} [defaultValue] - Default value if path not found
 * @returns {any} The theme value or default value
 */
export const getThemeValue = (theme, path, defaultValue) => {
  if (!theme || !path) {
    return defaultValue;
  }
  
  const parts = path.split('.');
  let value = theme;
  
  for (const part of parts) {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    
    value = value[part];
  }
  
  return value !== undefined ? value : defaultValue;
};

/**
 * Get a color from the theme palette
 * 
 * @param {Object} theme - Theme object
 * @param {string} color - Color name (e.g., 'primary', 'error')
 * @param {string} [variant='main'] - Color variant (main, light, dark)
 * @returns {string} The color value
 */
export const getColor = (theme, color, variant = 'main') => {
  if (!theme || !theme.palette) {
    return '';
  }
  
  // Handle direct color name like 'primary.main'
  if (color.includes('.')) {
    return getThemeValue(theme, `palette.${color}`, '');
  }
  
  // Handle the case where we have a palette color with variants
  if (theme.palette[color] && theme.palette[color][variant]) {
    return theme.palette[color][variant];
  }
  
  // Handle the case where we have a direct palette color
  if (theme.palette[color]) {
    return theme.palette[color];
  }
  
  return '';
};

/**
 * Get a spacing value from the theme
 * 
 * @param {Object} theme - Theme object
 * @param {number|string} factor - Spacing factor or direct value
 * @returns {string} The spacing value
 */
export const getSpacing = (theme, factor) => {
  if (!theme || !theme.spacing) {
    return typeof factor === 'number' ? `${factor}px` : factor;
  }
  
  if (typeof theme.spacing === 'function') {
    return theme.spacing(factor);
  }
  
  if (typeof theme.spacing === 'number') {
    return `${theme.spacing * factor}px`;
  }
  
  if (Array.isArray(theme.spacing)) {
    // Handle spacing arrays (e.g., [0, 4, 8, 16, ...])
    return `${theme.spacing[factor] || 0}px`;
  }
  
  return typeof factor === 'number' ? `${factor}px` : factor;
};

/**
 * Get a font size from the theme
 * 
 * @param {Object} theme - Theme object
 * @param {string} variant - Typography variant (e.g., 'body1', 'h1')
 * @param {string} [property='fontSize'] - Typography property to get
 * @returns {string} The font size value
 */
export const getTypography = (theme, variant, property = 'fontSize') => {
  if (!theme || !theme.typography || !theme.typography[variant]) {
    return '';
  }
  
  return theme.typography[variant][property] || '';
};

/**
 * Create responsive styles based on breakpoints
 * 
 * @param {Object} theme - Theme object
 * @param {Object} styles - Styles object with breakpoint keys
 * @returns {Object} Media query styles object
 */
export const responsive = (theme, styles) => {
  if (!theme || !theme.breakpoints) {
    return styles;
  }
  
  const result = {};
  
  // Handle default styles (no breakpoint specified)
  Object.entries(styles).forEach(([key, value]) => {
    if (!['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(key)) {
      result[key] = value;
    }
  });
  
  // Add media queries for breakpoints
  const breakpointKeys = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  
  breakpointKeys.forEach((breakpoint) => {
    if (styles[breakpoint]) {
      const mediaQuery = getThemeValue(
        theme, 
        `breakpoints.${breakpoint}`, 
        `(min-width: ${getDefaultBreakpoint(breakpoint)})`
      );
      
      result[`@media ${mediaQuery}`] = styles[breakpoint];
    }
  });
  
  return result;
};

/**
 * Get a default breakpoint value for a given key
 * 
 * @param {string} key - Breakpoint key
 * @returns {string} CSS breakpoint value
 */
function getDefaultBreakpoint(key) {
  switch (key) {
    case 'xs': return '0px';
    case 'sm': return '576px';
    case 'md': return '768px';
    case 'lg': return '992px';
    case 'xl': return '1200px';
    case 'xxl': return '1400px';
    default: return '0px';
  }
}

/**
 * Create a CSS transition value
 * 
 * @param {Object} theme - Theme object
 * @param {string|Array} properties - CSS property or array of properties
 * @param {Object} [options] - Transition options
 * @param {string} [options.duration='standard'] - Transition duration
 * @param {string} [options.easing='easeInOut'] - Transition timing function
 * @param {number} [options.delay=0] - Transition delay in ms
 * @returns {string} CSS transition value
 */
export const createTransition = (theme, properties, options = {}) => {
  if (!theme || !theme.transitions) {
    // Default values if theme is not available
    const duration = options.duration ? `${options.duration}ms` : '300ms';
    const easing = options.easing || 'cubic-bezier(0.4, 0, 0.2, 1)';
    const delay = options.delay ? `${options.delay}ms` : '0ms';
    
    const props = Array.isArray(properties) ? properties : [properties];
    return props.map(prop => `${prop} ${duration} ${easing} ${delay}`).join(', ');
  }
  
  const { 
    duration: durationOption = 'standard',
    easing: easingOption = 'easeInOut',
    delay = 0,
  } = options;
  
  // Get duration value from theme
  let duration;
  if (typeof durationOption === 'string') {
    duration = getThemeValue(theme, `transitions.duration.${durationOption}`, 300);
  } else {
    duration = durationOption;
  }
  
  // Get easing value from theme
  let easing;
  if (typeof easingOption === 'string') {
    easing = getThemeValue(theme, `transitions.easing.${easingOption}`, 'cubic-bezier(0.4, 0, 0.2, 1)');
  } else {
    easing = easingOption;
  }
  
  const props = Array.isArray(properties) ? properties : [properties];
  
  return props.map(prop => `${prop} ${duration}ms ${easing} ${delay}ms`).join(', ');
};

/**
 * Get a shadow from the theme
 * 
 * @param {Object} theme - Theme object
 * @param {number} elevation - Shadow elevation level
 * @returns {string} CSS shadow value
 */
export const getShadow = (theme, elevation) => {
  if (!theme || !theme.shadows || elevation === undefined) {
    return '';
  }
  
  return theme.shadows[elevation] || '';
};

/**
 * Create a CSS box shadow with colored shadow
 * 
 * @param {Object} theme - Theme object
 * @param {Object} options - Shadow options
 * @param {number} [options.elevation=1] - Shadow elevation level
 * @param {string} [options.color='primary'] - Shadow color
 * @param {number} [options.alpha=0.2] - Shadow opacity
 * @returns {string} CSS shadow value
 */
export const createColoredShadow = (theme, options = {}) => {
  const { elevation = 1, color = 'primary', alpha = 0.2 } = options;
  
  if (!theme || !theme.palette) {
    return '';
  }
  
  const shadowColor = getColor(theme, color);
  
  if (!shadowColor) {
    return getShadow(theme, elevation);
  }
  
  // Create a semi-transparent version of the color
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };
  
  const [r, g, b] = hexToRgb(shadowColor);
  
  // Use different spread and blur based on elevation
  const spread = elevation * 2;
  const blur = elevation * 4;
  const y = elevation * 2;
  
  return `0 ${y}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Create a CSS text truncation style
 * 
 * @param {number} [lines=1] - Number of lines to show before truncating
 * @returns {Object} CSS style object for truncation
 */
export const truncateText = (lines = 1) => {
  if (lines === 1) {
    return {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };
  }
  
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };
};

/**
 * Create a style for visually hiding an element while keeping it accessible
 * 
 * @returns {Object} CSS style for visually hidden elements
 */
export const visuallyHidden = () => ({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});