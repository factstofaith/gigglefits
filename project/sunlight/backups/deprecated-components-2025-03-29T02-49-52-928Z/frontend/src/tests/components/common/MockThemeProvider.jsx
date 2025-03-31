// MockThemeProvider.jsx
// A robust theme provider for testing components that require theme context
// Supports both design system components and legacy Material UI components

import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@design-system/adapter';
import { createContext } from 'react';

// Create a local version of ThemeContext instead of importing from outside src
const ThemeContext = createContext({
  theme: {},
  mode: 'light',
  setMode: () => {},
  toggleMode: () => {},
});

// Mock theme for design system components
const mockDesignTheme = {
  mode: 'light',
  colors: {
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
    secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2' },
    error: { main: '#d32f2f', light: '#ef5350', dark: '#c62828' },
    warning: { main: '#ed6c02', light: '#ff9800', dark: '#e65100' },
    info: { main: '#0288d1', light: '#03a9f4', dark: '#01579b' },
    success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' },
    text: { primary: '#000000', secondary: '#00000099', disabled: '#00000061' },
    divider: '#0000001f',
    background: { paper: '#ffffff', default: '#f5f5f5' },
    action: { hover: '#0000000a' },
  },
  typography: {
    fontFamilies: {
      primary: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      code: "'Roboto Mono', monospace",
    },
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacings: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    variants: {
      h1: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 700,
        fontSize: '3rem',
        lineHeight: 1.25,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 700,
        fontSize: '2.25rem',
        lineHeight: 1.25,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 600,
        fontSize: '1.875rem',
        lineHeight: 1.25,
        letterSpacing: '0',
      },
      h4: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.375,
        letterSpacing: '0',
      },
      h5: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.5,
        letterSpacing: '0',
      },
      h6: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 500,
        fontSize: '1.125rem',
        lineHeight: 1.5,
        letterSpacing: '0',
      },
      subtitle1: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.5,
        letterSpacing: '0',
      },
      subtitle2: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.5,
        letterSpacing: '0',
      },
      body1: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 400,
        fontSize: '1rem',
        lineHeight: 1.625,
        letterSpacing: '0',
      },
      body2: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 400,
        fontSize: '0.875rem',
        lineHeight: 1.625,
        letterSpacing: '0',
      },
      button: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.5,
        letterSpacing: '0.025em',
        textTransform: 'uppercase',
      },
      caption: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 1.5,
        letterSpacing: '0',
      },
      overline: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontWeight: 500,
        fontSize: '0.75rem',
        lineHeight: 1.5,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      },
      code: {
        fontFamily: "'Roboto Mono', monospace",
        fontWeight: 400,
        fontSize: '0.875rem',
        lineHeight: 1.5,
        letterSpacing: '0',
      },
    },
  },
  spacing: {
    unit: 8,
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
  },
  shadows: {
    none: 'none',
    sm: '0 2px 4px 0 rgba(0,0,0,0.1)',
    md: '0 4px 8px 0 rgba(0,0,0,0.1)',
    lg: '0 8px 16px 0 rgba(0,0,0,0.1)',
    xl: '0 12px 24px 0 rgba(0,0,0,0.1)',
  },
  zIndex: {
    modal: 1300,
    drawer: 1200,
    appBar: 1100,
    tooltip: 1500,
  },
};

// Create a Material UI theme for legacy components
const mockMuiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    text: {
      primary: '#000000',
      secondary: '#00000099',
      disabled: '#00000061',
    },
    divider: '#0000001f',
    background: {
      paper: '#ffffff',
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontSize: '3rem', fontWeight: 700 },
    h2: { fontSize: '2.25rem', fontWeight: 700 },
    h3: { fontSize: '1.875rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1.125rem', fontWeight: 500 },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
});

// Comprehensive theme provider that supports both design system and Material UI
export const MockThemeProvider = ({ children, useMaterialUI = false }) => {
  // Added display name
  MockThemeProvider.displayName = 'MockThemeProvider';

  // Added display name
  MockThemeProvider.displayName = 'MockThemeProvider';

  // Added display name
  MockThemeProvider.displayName = 'MockThemeProvider';

  // Added display name
  MockThemeProvider.displayName = 'MockThemeProvider';

  // Added display name
  MockThemeProvider.displayName = 'MockThemeProvider';


  // Provide both theme contexts to ensure all components have what they need
  return (
    <ThemeContext.Provider
      value={{
        theme: mockDesignTheme,
        mode: 'light',
        setMode: () => {},
        toggleMode: () => {},
      }}
    >
      <MuiThemeProvider theme={mockMuiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default MockThemeProvider;
