import React from 'react';
import { ThemeProvider as MuiThemeProvider, Theme, ThemeOptions, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme as defaultTheme } from '../../theme';

/**
 * Theme Provider props interface
 */
export interface ThemeProviderProps {
  /**
   * The theme to use. If not provided, the default theme will be used.
   */
  theme?: Theme;
  
  /**
   * Theme options to merge with the default theme
   */
  themeOptions?: ThemeOptions;
  
  /**
   * Whether to use CssBaseline to reset browser styles
   * @default true
   */
  useCssBaseline?: boolean;
  
  /**
   * Children components
   */
  children: React.ReactNode;
}

/**
 * Theme Provider component that wraps the application with the provided theme
 * 
 * @example
 * // With default theme
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * 
 * @example
 * // With custom theme options
 * <ThemeProvider themeOptions={{ palette: { primary: { main: '#ff5722' } } }}>
 *   <App />
 * </ThemeProvider>
 * 
 * @example
 * // With custom theme
 * const customTheme = createTheme({ ... });
 * <ThemeProvider theme={customTheme}>
 *   <App />
 * </ThemeProvider>
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme,
  themeOptions,
  useCssBaseline = true,
  children,
}) => {
  // If theme is provided, use it directly
  // If themeOptions are provided, merge them with default theme
  // Otherwise use default theme
  const themeToUse = theme || (themeOptions ? createTheme(defaultTheme, themeOptions) : defaultTheme);

  return (
    <MuiThemeProvider theme={themeToUse}>
      {useCssBaseline && <CssBaseline />}
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;