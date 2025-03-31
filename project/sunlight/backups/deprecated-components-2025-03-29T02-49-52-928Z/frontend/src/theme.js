// theme.js
// -----------------------------------------------------------------------------
// MUI theme configuration with light and dark mode

import { createTheme, responsiveFontSizes } from 'design-system';

// Brand color palette
const colors = {
  primary: {
    main: '#2E7EED', // Blue - primary brand color
    light: '#88B6F2',
    dark: '#1756B0',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#27AE60', // Green - for success states
    light: '#6FCF97',
    dark: '#219653',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EB5757', // Red - for errors
    light: '#FF8080',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F2994A', // Orange - for warnings
    light: '#F2C94C',
    dark: '#E67E22',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#56CCF2', // Light blue - for info
    light: '#79D0F2',
    dark: '#2D9CDB',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#27AE60', // Green - same as secondary
    light: '#6FCF97',
    dark: '#219653',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  text: {
    primary: '#1E293B', // Dark grey for main text
    secondary: '#64748B', // Medium grey for secondary text
    disabled: '#94A3B8', // Light grey for disabled text
  },
  background: {
    default: '#F8FAFC', // Very light grey for main background
    paper: '#FFFFFF', // White for cards and elevated surfaces
    elevated: '#FFFFFF', // White with shadow for elevated content
  },
  divider: '#E2E8F0', // Light grey for dividers
};

// Common component styling modifications
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        padding: '8px 16px',
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
      contained: {
        '&:hover': {
          backgroundColor: colors.primary.dark,
        },
      },
      containedPrimary: {
        background: 'linear-gradient(45deg, #2E7EED 30%, #3788EF 90%)',
        '&:hover': {
          background: 'linear-gradient(45deg, #1756B0 30%, #2E7EED 90%)',
        },
      },
      containedSecondary: {
        '&:hover': {
          backgroundColor: colors.secondary.dark,
        },
      },
      outlined: {
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
      outlinedPrimary: {
        '&:hover': {
          backgroundColor: 'rgba(46, 126, 237, 0.08)',
        },
      },
      text: {
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
      textPrimary: {
        '&:hover': {
          backgroundColor: 'rgba(46, 126, 237, 0.08)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
      },
      elevation1: {
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '6px',
        fontWeight: 600,
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          fontWeight: 700,
          color: colors.text.secondary,
        },
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        paddingTop: '8px',
        paddingBottom: '8px',
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: '40px',
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
        },
      },
      indicator: {
        height: '3px',
        borderRadius: '3px 3px 0 0',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: '10px',
        height: '6px',
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 42,
        height: 26,
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: 2,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
          },
        },
        '& .MuiSwitch-thumb': {
          width: 22,
          height: 22,
        },
        '& .MuiSwitch-track': {
          borderRadius: 26 / 2,
        },
      },
    },
  },
};

// Base theme with shared properties
const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components,
};

// Light theme
const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    ...colors,
  },
});

// Dark theme (would need more complete colors definition to be fully functional)
const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    ...colors,
    background: {
      default: '#0F172A',
      paper: '#1E293B',
      elevated: '#1E293B',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      disabled: '#64748B',
    },
    divider: '#334155',
  },
});

// Apply responsive font sizes
const theme = responsiveFontSizes(lightTheme);

export { theme, darkTheme };
export default theme;
