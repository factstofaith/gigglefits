/**
 * Test Utilities for React Testing Library
 * -----------------------------------------------------------------------------
 * Provides wrapper components and render utilities that include
 * common providers like ThemeProvider, NotificationContext, etc.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '../../design-system';
import { MemoryRouter } from 'react-router-dom';
import { NotificationProvider } from '@contexts/NotificationContext';
import { UserProvider } from '@contexts/UserContext';

/**
 * Custom render function that wraps component with commonly needed providers
 * 
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options including initialRoutes and any context props
 * @returns {Object} Object with all of React Testing Library's query functions
 */
function renderWithProviders(ui, { 
  initialRoutes = ['/'],
  userContext = {},
  notificationContext = {},
  ...renderOptions
} = {}) {
  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Create wrapper with all providers
  function AllProviders({ children }) {
  // Added display name
  AllProviders.displayName = 'AllProviders';

    return (
      <MemoryRouter initialEntries={initialRoutes}>
        <ThemeProvider initialMode="light">
          <UserProvider initialValue={userContext}>
            <NotificationProvider initialState={notificationContext}>
              {children}
            </NotificationProvider>
          </UserProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: AllProviders, ...renderOptions });
}

/**
 * A simpler wrapper function that just includes routing
 */
function renderWithRouter(ui, { initialRoutes = ['/'], ...renderOptions } = {}) {
  // Added display name
  renderWithRouter.displayName = 'renderWithRouter';

  return render(
    ui,
    {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={initialRoutes}>
          {children}
        </MemoryRouter>
      ),
      ...renderOptions,
    }
  );
}

/**
 * A wrapper function that just includes the ThemeProvider
 */
function renderWithTheme(ui, { initialMode = 'light', ...renderOptions } = {}) {
  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  return render(
    ui,
    {
      wrapper: ({ children }) => (
        <ThemeProvider initialMode={initialMode}>
          {children}
        </ThemeProvider>
      ),
      ...renderOptions,
    }
  );
}

/**
 * A mock implementation of the ThemeProvider
 * This simplifies testing components that rely on theme functionality
 */
function MockThemeProvider({ children, initialMode = 'light' }) {
  // Added display name
  MockThemeProvider.displayName = 'MockThemeProvider';

  // Mock theme object
  const theme = {
    colors: {
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#dc004e',
        light: '#ff4081',
        dark: '#9a0036',
        contrastText: '#ffffff',
      },
      error: {
        main: '#f44336',
        light: '#e57373', 
        dark: '#d32f2f',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: '#000000',
      },
      info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
        contrastText: '#ffffff',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
        contrastText: '#ffffff',
      },
      text: {
        primary: '#000000',
        secondary: '#757575',
        disabled: '#9e9e9e',
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
      divider: '#e0e0e0',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    typography: {
      fontFamilies: {
        primary: 'Inter, sans-serif',
        code: 'monospace',
      },
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
      },
      fontWeights: {
        light: 300,
        normal: 400,
        medium: 500,
        bold: 700,
      },
      lineHeights: {
        none: 1,
        tight: 1.25,
        normal: 1.5,
        loose: 2,
      },
      letterSpacings: {
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
    shape: {
      borderRadius: '4px',
    },
    shadows: {
      0: 'none',
      1: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      2: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
      3: '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    },
    zIndex: {
      modal: 1300,
      drawer: 1200,
      appBar: 1100,
      tooltip: 1500,
    },
  };

  // Mock theme context value
  const themeContext = {
    theme,
    mode: initialMode,
    toggleColorMode: jest.fn(),
  };

  // Provide the mock theme
  return children({ ...themeContext });
}

export {
  renderWithProviders,
  renderWithRouter,
  renderWithTheme,
  MockThemeProvider,
};