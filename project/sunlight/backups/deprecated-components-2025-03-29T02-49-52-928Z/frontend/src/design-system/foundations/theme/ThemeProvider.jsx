/**
 * @component ThemeProvider
 * @description Enhanced theme provider with support for system preference
 * and consistent token usage across the application.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from './themes';
import { colors } from '../tokens/colors';

/**
 * Context for theme state
 */
export const ThemeContext = createContext({
  theme: lightTheme,
  mode: 'light',
  tokens: colors.light,
  setMode: () => {},
  toggleMode: () => {},
});

/**
 * Hook for accessing the theme from any component
 */
export const useTheme = () => useContext(ThemeContext);

/**
 * Theme provider component for the design system
 */
export const ThemeProvider = ({ initialMode = 'light', children }) => {
  // Added display name
  ThemeProvider.displayName = 'ThemeProvider';

  // Added display name
  ThemeProvider.displayName = 'ThemeProvider';

  // Added display name
  ThemeProvider.displayName = 'ThemeProvider';

  // Added display name
  ThemeProvider.displayName = 'ThemeProvider';

  // Added display name
  ThemeProvider.displayName = 'ThemeProvider';


  // Check for user preference in localStorage or system preference
  const getInitialMode = () => {
  // Added display name
  getInitialMode.displayName = 'getInitialMode';

  // Added display name
  getInitialMode.displayName = 'getInitialMode';

  // Added display name
  getInitialMode.displayName = 'getInitialMode';

  // Added display name
  getInitialMode.displayName = 'getInitialMode';

  // Added display name
  getInitialMode.displayName = 'getInitialMode';


    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode) {
      return savedMode;
    }

    if (initialMode !== 'system') {
      return initialMode;
    }

    // Check for system preference
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const [mode, setMode] = useState(getInitialMode);

  // Effect to save mode in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);

    // Apply theme class to body for global styling if needed
    document.body.dataset.theme = mode;
  }, [mode]);

  // Effect to listen for system preference changes
  useEffect(() => {
    if (initialMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = e => {
      setMode(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [initialMode]);

  // Get the current theme based on mode
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  
  // Get tokens for current theme
  const tokens = mode === 'dark' ? colors.dark : colors.light;

  // Toggle between light and dark mode
  const toggleMode = () => {
  // Added display name
  toggleMode.displayName = 'toggleMode';

  // Added display name
  toggleMode.displayName = 'toggleMode';

  // Added display name
  toggleMode.displayName = 'toggleMode';

  // Added display name
  toggleMode.displayName = 'toggleMode';

  // Added display name
  toggleMode.displayName = 'toggleMode';


    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Create memoized context value
  const contextValue = React.useMemo(() => ({
    theme, 
    mode, 
    tokens,
    setMode, 
    toggleMode
  }), [theme, mode, tokens]);

  // Provide theme context to all children
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
