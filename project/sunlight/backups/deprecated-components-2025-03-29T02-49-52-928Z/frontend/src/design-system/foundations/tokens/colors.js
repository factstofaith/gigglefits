/**
 * Color tokens for the design system
 */

export const baseColors = {
  // Primary colors
  blue: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3', // Primary
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  // Secondary colors
  teal: {
    50: '#e0f2f1',
    100: '#b2dfdb',
    200: '#80cbc4',
    300: '#4db6ac',
    400: '#26a69a',
    500: '#009688', // Secondary
    600: '#00897b',
    700: '#00796b',
    800: '#00695c',
    900: '#004d40',
  },
  // Supporting colors
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  red: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336', // Error
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  green: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50', // Success
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  orange: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800', // Warning
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  // Base colors
  common: {
    black: '#000000',
    white: '#ffffff',
  },
};

/**
 * Light theme semantic colors
 */
export const lightThemeColors = {
  primary: {
    main: baseColors.blue[500],
    light: baseColors.blue[300],
    dark: baseColors.blue[700],
    contrastText: baseColors.common.white,
  },
  secondary: {
    main: baseColors.teal[500],
    light: baseColors.teal[300],
    dark: baseColors.teal[700],
    contrastText: baseColors.common.white,
  },
  error: {
    main: baseColors.red[500],
    light: baseColors.red[300],
    dark: baseColors.red[700],
    contrastText: baseColors.common.white,
  },
  warning: {
    main: baseColors.orange[500],
    light: baseColors.orange[300],
    dark: baseColors.orange[700],
    contrastText: baseColors.common.white,
  },
  success: {
    main: baseColors.green[500],
    light: baseColors.green[300],
    dark: baseColors.green[700],
    contrastText: baseColors.common.white,
  },
  info: {
    main: baseColors.blue[400],
    light: baseColors.blue[200],
    dark: baseColors.blue[600],
    contrastText: baseColors.common.white,
  },
  text: {
    primary: baseColors.grey[900],
    secondary: baseColors.grey[700],
    disabled: baseColors.grey[500],
    hint: baseColors.grey[500],
  },
  background: {
    default: baseColors.grey[100],
    paper: baseColors.common.white,
    highlight: baseColors.blue[50],
  },
  divider: baseColors.grey[300],
  action: {
    active: baseColors.grey[900],
    hover: `rgba(0, 0, 0, 0.04)`,
    hoverOpacity: 0.04,
    selected: `rgba(0, 0, 0, 0.08)`,
    selectedOpacity: 0.08,
    disabled: baseColors.grey[300],
    disabledBackground: baseColors.grey[200],
    disabledOpacity: 0.38,
    focus: `rgba(0, 0, 0, 0.12)`,
    focusOpacity: 0.12,
  },
};

/**
 * Dark theme semantic colors
 */
export const darkThemeColors = {
  primary: {
    main: baseColors.blue[400],
    light: baseColors.blue[300],
    dark: baseColors.blue[600],
    contrastText: baseColors.common.white,
  },
  secondary: {
    main: baseColors.teal[400],
    light: baseColors.teal[300],
    dark: baseColors.teal[600],
    contrastText: baseColors.common.white,
  },
  error: {
    main: baseColors.red[400],
    light: baseColors.red[300],
    dark: baseColors.red[600],
    contrastText: baseColors.common.white,
  },
  warning: {
    main: baseColors.orange[400],
    light: baseColors.orange[300],
    dark: baseColors.orange[600],
    contrastText: baseColors.common.white,
  },
  success: {
    main: baseColors.green[400],
    light: baseColors.green[300],
    dark: baseColors.green[600],
    contrastText: baseColors.common.white,
  },
  info: {
    main: baseColors.blue[400],
    light: baseColors.blue[300],
    dark: baseColors.blue[600],
    contrastText: baseColors.common.white,
  },
  text: {
    primary: baseColors.common.white,
    secondary: baseColors.grey[300],
    disabled: baseColors.grey[500],
    hint: baseColors.grey[400],
  },
  background: {
    default: baseColors.grey[900],
    paper: baseColors.grey[800],
    highlight: `rgba(66, 165, 245, 0.12)`,
  },
  divider: baseColors.grey[700],
  action: {
    active: baseColors.common.white,
    hover: `rgba(255, 255, 255, 0.08)`,
    hoverOpacity: 0.08,
    selected: `rgba(255, 255, 255, 0.16)`,
    selectedOpacity: 0.16,
    disabled: baseColors.grey[600],
    disabledBackground: `rgba(255, 255, 255, 0.12)`,
    disabledOpacity: 0.38,
    focus: `rgba(255, 255, 255, 0.12)`,
    focusOpacity: 0.12,
  },
};

/**
 * Helper function to create alpha version of a color
 */
export function alpha(color, value) {
  // Added display name
  alpha.displayName = 'alpha';

  // Simple implementation to create a color with alpha transparency
  if (color.startsWith('#')) {
    // Convert hex to rgb
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${value})`;
  }
  
  if (color.startsWith('rgb(')) {
    // Convert rgb to rgba
    return color.replace('rgb(', 'rgba(').replace(')', `, ${value})`);
  }
  
  if (color.startsWith('rgba(')) {
    // Already rgba, just update the alpha
    return color.replace(/rgba\((.+?),\s*[\d.]+\)/, `rgba($1, ${value})`);
  }
  
  // If it's a named color or other format, just return with opacity
  return `${color}${value}`;
}

/**
 * Export all color tokens
 */
export const colors = {
  base: baseColors,
  light: lightThemeColors,
  dark: darkThemeColors,
};

export default colors;
