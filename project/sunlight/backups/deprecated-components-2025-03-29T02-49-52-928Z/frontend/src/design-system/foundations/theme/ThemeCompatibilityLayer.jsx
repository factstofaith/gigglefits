/**
 * Enhanced ThemeCompatibilityLayer
 * 
 * This component creates a complete compatibility bridge between the Material UI 
 * theme system and our design system theme. It allows for gradual migration from 
 * Material UI to our custom design system while maintaining visual consistency.
 */

import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider as MuiThemeProvider, createTheme } from '../../adapter';
import { useTheme as useDesignTheme, ThemeProvider as DesignSystemProvider } from './ThemeProvider';
import { lightTheme } from './themes';

// Create a default Material UI theme for reference
const defaultMuiTheme = createTheme();

// Create compatibility context to share both theme objects
const ThemeCompatibilityContext = createContext({
  theme: null,
  muiTheme: null,
});

/**
 * Maps design system theme properties to Material UI equivalent
 * @param {Object} designTheme - Our design system theme
 * @returns {Object} - Material UI compatible theme object
 */
export function createCompatibilityTheme(designTheme = lightTheme) {
  // Added display name
  createCompatibilityTheme.displayName = 'createCompatibilityTheme';

  // Create a Material UI compatible theme based on our design system theme
  return createTheme({
    // Material UI compatibility layer
    palette: {
      mode: designTheme.mode || 'light',
      primary: {
        main: designTheme.colors?.primary?.main || '#1976d2',
        light: designTheme.colors?.primary?.light || '#42a5f5',
        dark: designTheme.colors?.primary?.dark || '#1565c0',
        contrastText: designTheme.colors?.primary?.contrastText || '#fff',
      },
      secondary: {
        main: designTheme.colors?.secondary?.main || '#9c27b0',
        light: designTheme.colors?.secondary?.light || '#ba68c8',
        dark: designTheme.colors?.secondary?.dark || '#7b1fa2',
        contrastText: designTheme.colors?.secondary?.contrastText || '#fff',
      },
      error: {
        main: designTheme.colors?.status?.error?.main || designTheme.colors?.error?.main || '#d32f2f',
        light: designTheme.colors?.status?.error?.light || designTheme.colors?.error?.light || '#ef5350',
        dark: designTheme.colors?.status?.error?.dark || designTheme.colors?.error?.dark || '#c62828',
        contrastText: designTheme.colors?.status?.error?.contrastText || designTheme.colors?.error?.contrastText || '#fff',
      },
      warning: {
        main: designTheme.colors?.status?.warning?.main || designTheme.colors?.warning?.main || '#ed6c02',
        light: designTheme.colors?.status?.warning?.light || designTheme.colors?.warning?.light || '#ff9800',
        dark: designTheme.colors?.status?.warning?.dark || designTheme.colors?.warning?.dark || '#e65100',
        contrastText: designTheme.colors?.status?.warning?.contrastText || designTheme.colors?.warning?.contrastText || '#fff',
      },
      info: {
        main: designTheme.colors?.status?.info?.main || designTheme.colors?.info?.main || '#0288d1',
        light: designTheme.colors?.status?.info?.light || designTheme.colors?.info?.light || '#03a9f4',
        dark: designTheme.colors?.status?.info?.dark || designTheme.colors?.info?.dark || '#01579b',
        contrastText: designTheme.colors?.status?.info?.contrastText || designTheme.colors?.info?.contrastText || '#fff',
      },
      success: {
        main: designTheme.colors?.status?.success?.main || designTheme.colors?.success?.main || '#2e7d32',
        light: designTheme.colors?.status?.success?.light || designTheme.colors?.success?.light || '#4caf50',
        dark: designTheme.colors?.status?.success?.dark || designTheme.colors?.success?.dark || '#1b5e20',
        contrastText: designTheme.colors?.status?.success?.contrastText || designTheme.colors?.success?.contrastText || '#fff',
      },
      text: {
        primary: designTheme.colors?.text?.primary || 'rgba(0, 0, 0, 0.87)',
        secondary: designTheme.colors?.text?.secondary || 'rgba(0, 0, 0, 0.6)',
        disabled: designTheme.colors?.text?.disabled || 'rgba(0, 0, 0, 0.38)',
      },
      background: {
        paper: designTheme.colors?.background?.paper || '#fff',
        default: designTheme.colors?.background?.default || '#f5f5f5',
      },
      divider: designTheme.colors?.divider || 'rgba(0, 0, 0, 0.12)',
      action: {
        active: designTheme.colors?.action?.active || 'rgba(0, 0, 0, 0.54)',
        hover: designTheme.colors?.action?.hover || 'rgba(0, 0, 0, 0.04)',
        selected: designTheme.colors?.action?.selected || 'rgba(0, 0, 0, 0.08)',
        disabled: designTheme.colors?.action?.disabled || 'rgba(0, 0, 0, 0.26)',
        disabledBackground: designTheme.colors?.action?.disabledBackground || 'rgba(0, 0, 0, 0.12)',
      },
      grey: designTheme.colors?.grey || {
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
        A100: '#f5f5f5',
        A200: '#eeeeee',
        A400: '#bdbdbd',
        A700: '#616161',
      },
    },
    
    // Typography mapping
    typography: {
      ...defaultMuiTheme.typography,
      fontFamily: designTheme.typography?.fontFamily || defaultMuiTheme.typography.fontFamily,
      fontSize: designTheme.typography?.fontSize || defaultMuiTheme.typography.fontSize,
      fontWeightLight: designTheme.typography?.fontWeightLight || defaultMuiTheme.typography.fontWeightLight,
      fontWeightRegular: designTheme.typography?.fontWeightRegular || defaultMuiTheme.typography.fontWeightRegular,
      fontWeightMedium: designTheme.typography?.fontWeightMedium || defaultMuiTheme.typography.fontWeightMedium,
      fontWeightBold: designTheme.typography?.fontWeightBold || defaultMuiTheme.typography.fontWeightBold,
      h1: {
        ...defaultMuiTheme.typography.h1,
        ...designTheme.typography?.h1
      },
      h2: {
        ...defaultMuiTheme.typography.h2,
        ...designTheme.typography?.h2
      },
      h3: {
        ...defaultMuiTheme.typography.h3,
        ...designTheme.typography?.h3
      },
      h4: {
        ...defaultMuiTheme.typography.h4,
        ...designTheme.typography?.h4
      },
      h5: {
        ...defaultMuiTheme.typography.h5,
        ...designTheme.typography?.h5
      },
      h6: {
        ...defaultMuiTheme.typography.h6,
        ...designTheme.typography?.h6
      },
      subtitle1: {
        ...defaultMuiTheme.typography.subtitle1,
        ...designTheme.typography?.subtitle1
      },
      subtitle2: {
        ...defaultMuiTheme.typography.subtitle2,
        ...designTheme.typography?.subtitle2
      },
      body1: {
        ...defaultMuiTheme.typography.body1,
        ...designTheme.typography?.body1
      },
      body2: {
        ...defaultMuiTheme.typography.body2,
        ...designTheme.typography?.body2
      },
      button: {
        ...defaultMuiTheme.typography.button,
        ...designTheme.typography?.button
      },
      caption: {
        ...defaultMuiTheme.typography.caption,
        ...designTheme.typography?.caption
      },
      overline: {
        ...defaultMuiTheme.typography.overline,
        ...designTheme.typography?.overline
      },
    },
    
    // Spacing function compatible with Material UI
    spacing: factor => {
      if (typeof designTheme.spacing === 'function') {
        return designTheme.spacing(factor);
      }
      
      if (typeof designTheme.spacing === 'number') {
        return `${factor * designTheme.spacing}px`;
      }
      
      if (Array.isArray(designTheme.spacing) && designTheme.spacing.length > 0) {
        // Handle spacing array patterns like [0, 4, 8, 16, 32, 64]
        const index = Math.min(factor, designTheme.spacing.length - 1);
        return typeof designTheme.spacing[index] === 'number'
          ? `${designTheme.spacing[index]}px`
          : designTheme.spacing[index] || `${factor * 8}px`;
      }
      
      // Default MUI spacing
      return `${factor * 8}px`;
    },
    
    // Shape mapping
    shape: {
      borderRadius: designTheme.shape?.borderRadius || designTheme.borderRadius || 4,
    },
    
    // Breakpoints mapping
    breakpoints: {
      values: {
        xs: designTheme.breakpoints?.xs || designTheme.breakpoints?.values?.xs || 0,
        sm: designTheme.breakpoints?.sm || designTheme.breakpoints?.values?.sm || 600,
        md: designTheme.breakpoints?.md || designTheme.breakpoints?.values?.md || 900,
        lg: designTheme.breakpoints?.lg || designTheme.breakpoints?.values?.lg || 1200,
        xl: designTheme.breakpoints?.xl || designTheme.breakpoints?.values?.xl || 1536,
      },
    },
    
    // Other Material UI properties use defaults
    shadows: defaultMuiTheme.shadows,
    transitions: defaultMuiTheme.transitions,
    zIndex: defaultMuiTheme.zIndex,
    
    // Include the original design system theme for access to its properties
    designSystem: designTheme,
  });
}

/**
 * Create design system theme from MUI theme (for reverse conversion)
 * @param {Object} muiTheme - Material UI theme
 * @returns {Object} - Design system theme
 */
export function createDesignSystemTheme(muiTheme = defaultMuiTheme) {
  // Added display name
  createDesignSystemTheme.displayName = 'createDesignSystemTheme';

  return {
    mode: muiTheme.palette.mode || 'light',
    colors: {
      primary: {
        main: muiTheme.palette.primary.main,
        light: muiTheme.palette.primary.light,
        dark: muiTheme.palette.primary.dark,
        contrastText: muiTheme.palette.primary.contrastText,
      },
      secondary: {
        main: muiTheme.palette.secondary.main,
        light: muiTheme.palette.secondary.light,
        dark: muiTheme.palette.secondary.dark,
        contrastText: muiTheme.palette.secondary.contrastText,
      },
      error: {
        main: muiTheme.palette.error.main,
        light: muiTheme.palette.error.light,
        dark: muiTheme.palette.error.dark,
        contrastText: muiTheme.palette.error.contrastText,
      },
      warning: {
        main: muiTheme.palette.warning.main,
        light: muiTheme.palette.warning.light,
        dark: muiTheme.palette.warning.dark,
        contrastText: muiTheme.palette.warning.contrastText,
      },
      info: {
        main: muiTheme.palette.info.main,
        light: muiTheme.palette.info.light,
        dark: muiTheme.palette.info.dark,
        contrastText: muiTheme.palette.info.contrastText,
      },
      success: {
        main: muiTheme.palette.success.main,
        light: muiTheme.palette.success.light,
        dark: muiTheme.palette.success.dark,
        contrastText: muiTheme.palette.success.contrastText,
      },
      text: {
        primary: muiTheme.palette.text.primary,
        secondary: muiTheme.palette.text.secondary,
        disabled: muiTheme.palette.text.disabled,
      },
      background: {
        paper: muiTheme.palette.background.paper,
        default: muiTheme.palette.background.default,
      },
      divider: muiTheme.palette.divider,
      grey: muiTheme.palette.grey,
    },
    typography: muiTheme.typography,
    spacing: muiTheme.spacing,
    breakpoints: {
      values: muiTheme.breakpoints.values,
    },
    shape: {
      borderRadius: muiTheme.shape.borderRadius,
    },
  };
}

/**
 * Enhanced ThemeCompatibilityProvider component that wraps both MUI and design system themes.
 * 
 * This provider ensures that both Material UI components and design system components
 * receive the correct theme context, allowing for gradual migration.
 */
export function ThemeCompatibilityProvider({ 
  children, 
  initialMode = 'light',
  theme: externalDesignTheme = null,
  muiTheme: externalMuiTheme = null,
}) {
  // Added display name
  ThemeCompatibilityProvider.displayName = 'ThemeCompatibilityProvider';

  // Render prop that will be passed to DesignSystemProvider
  const renderWithTheme = ({ theme, mode }) => {
  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';


    // Create Material UI theme from design system theme (or use provided)
    const materialTheme = externalMuiTheme || createCompatibilityTheme(theme);
    
    return (
      <MuiThemeProvider theme={materialTheme}>
        <ThemeCompatibilityContext.Provider value={{ theme, muiTheme: materialTheme }}>
          {children}
        </ThemeCompatibilityContext.Provider>
      </MuiThemeProvider>
    );
  };
  
  // If we have a design system theme directly provided, use simpler approach
  if (externalDesignTheme) {
    const materialTheme = externalMuiTheme || createCompatibilityTheme(externalDesignTheme);
    
    return (
      <DesignSystemProvider initialMode={initialMode} theme={externalDesignTheme}>
        <MuiThemeProvider theme={materialTheme}>
          <ThemeCompatibilityContext.Provider value={{ theme: externalDesignTheme, muiTheme: materialTheme }}>
            {children}
          </ThemeCompatibilityContext.Provider>
        </MuiThemeProvider>
      </DesignSystemProvider>
    );
  }
  
  // Otherwise use the render prop pattern with DesignSystemProvider
  return (
    <DesignSystemProvider initialMode={initialMode}>
      {renderWithTheme}
    </DesignSystemProvider>
  );
}

/**
 * Enhanced hook that provides access to both MUI and design system themes
 * @returns {Object} - Combined theme object with both MUI and design system properties
 */
export function useTheme() {
  // Added display name
  useTheme.displayName = 'useTheme';

  // Try to get theme from compatibility context first
  const compatContext = useContext(ThemeCompatibilityContext);
  
  // Always get design system theme directly to ensure hook is used unconditionally
  const designTheme = useDesignTheme();
  
  // If compatibility context is available, use it
  if (compatContext.theme && compatContext.muiTheme) {
    return {
      // MUI theme properties (backward compatibility)
      ...compatContext.muiTheme,
      // Design system theme properties
      ...compatContext.theme,
      // Add explicit theme objects
      muiTheme: compatContext.muiTheme,
      designSystem: compatContext.theme,
      // Helper properties
      mode: compatContext.theme.mode,
      isDark: compatContext.theme.mode === 'dark',
      isLight: compatContext.theme.mode === 'light',
    };
  }
  
  // Fallback: Create MUI theme from design system theme
  const materialTheme = createCompatibilityTheme(designTheme.theme);
  
  // Return combined theme with clear indicator that it's a fallback
  return {
    // MUI theme properties
    ...materialTheme,
    // Design system theme properties 
    ...designTheme.theme,
    // Explicit theme objects
    muiTheme: materialTheme,
    designSystem: designTheme.theme,
    // Helper properties
    mode: designTheme.mode,
    isDark: designTheme.mode === 'dark', 
    isLight: designTheme.mode === 'light',
    // Indicator that this is fallback mode (for debugging)
    __compatFallback: true,
  };
}

// Define prop types
ThemeCompatibilityProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialMode: PropTypes.oneOf(['light', 'dark', 'system']),
  theme: PropTypes.object,
  muiTheme: PropTypes.object,
};

export default ThemeCompatibilityProvider;