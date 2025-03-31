import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTheme, ThemeContext, ThemeProvider } from '@design-system/foundations/theme/ThemeProvider';
import { lightTheme, darkTheme } from '@design-system/foundations/theme/themes';

/**
 * Mock storage and media query functionality
 */
describe('useTheme Hook', () => {
  // Mock localStorage
  const localStorageMock = (() => {
  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';


    let store = {};
    return {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  // Mock matchMedia
  const matchMediaMock = jest.fn();

  // Setup and teardown
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(window, 'matchMedia', { 
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))
    });
    document.body.dataset.theme = '';
    localStorageMock.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper wrapper component for testing
  const wrapper = ({ children, initialMode = 'light' }) => (
    <ThemeProvider initialMode={initialMode}>{children}</ThemeProvider>
  );

  // Test direct context usage
  it('provides the correct default values when used without provider', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe(lightTheme);
    expect(result.current.mode).toBe('light');
    expect(typeof result.current.setMode).toBe('function');
    expect(typeof result.current.toggleMode).toBe('function');
  });

  // Test with provider
  it('provides theme values from the provider', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current.theme).toBe(lightTheme); // default is light theme
    expect(result.current.mode).toBe('light');
    expect(typeof result.current.setMode).toBe('function');
    expect(typeof result.current.toggleMode).toBe('function');
  });

  // Test initial dark mode
  it('initializes with dark mode when specified', () => {
    const { result } = renderHook(() => useTheme(), { 
      wrapper: ({ children }) => wrapper({ children, initialMode: 'dark' })
    });
    
    expect(result.current.theme).toBe(darkTheme);
    expect(result.current.mode).toBe('dark');
  });

  // Test toggling theme
  it('toggles between light and dark themes', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    // Initial state
    expect(result.current.mode).toBe('light');
    expect(result.current.theme).toBe(lightTheme);
    
    // Toggle to dark
    act(() => {
      result.current.toggleMode();
    });
    
    expect(result.current.mode).toBe('dark');
    expect(result.current.theme).toBe(darkTheme);
    
    // Toggle back to light
    act(() => {
      result.current.toggleMode();
    });
    
    expect(result.current.mode).toBe('light');
    expect(result.current.theme).toBe(lightTheme);
  });

  // Test setMode function
  it('sets the mode directly with setMode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    // Initial state
    expect(result.current.mode).toBe('light');
    
    // Set to dark
    act(() => {
      result.current.setMode('dark');
    });
    
    expect(result.current.mode).toBe('dark');
    expect(result.current.theme).toBe(darkTheme);
    
    // Set to light
    act(() => {
      result.current.setMode('light');
    });
    
    expect(result.current.mode).toBe('light');
    expect(result.current.theme).toBe(lightTheme);
  });

  // Test localStorage persistence
  it('persists theme preference in localStorage', () => {
    // Start with light theme
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    // Change to dark theme
    act(() => {
      result.current.setMode('dark');
    });
    
    // Check localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-mode', 'dark');
    
    // Change back to light theme
    act(() => {
      result.current.setMode('light');
    });
    
    // Check localStorage was updated again
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-mode', 'light');
  });

  // Test localStorage retrieval on initialization
  it('retrieves theme preference from localStorage on initialization', () => {
    // Set theme in localStorage
    localStorageMock.getItem.mockReturnValueOnce('dark');
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    // Should initialize with dark theme from localStorage
    expect(result.current.mode).toBe('dark');
    expect(result.current.theme).toBe(darkTheme);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme-mode');
  });

  // Test body dataset update
  it('updates document.body dataset with current theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    // Initial state
    expect(document.body.dataset.theme).toBe('light');
    
    // Change to dark theme
    act(() => {
      result.current.setMode('dark');
    });
    
    // Check body dataset was updated
    expect(document.body.dataset.theme).toBe('dark');
  });

  // Test system preference with 'system' initialMode
  it('uses system preference when initialMode is "system"', () => {
    // Mock system preference for dark mode
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    const { result } = renderHook(() => useTheme(), { 
      wrapper: ({ children }) => wrapper({ children, initialMode: 'system' })
    });
    
    // Should use dark theme based on system preference
    expect(result.current.mode).toBe('dark');
    expect(result.current.theme).toBe(darkTheme);
  });

  // Test theme object structure
  it('provides a theme object with the correct structure', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    const { theme } = result.current;
    
    // Verify theme structure
    expect(theme).toHaveProperty('mode');
    expect(theme).toHaveProperty('colors');
    expect(theme).toHaveProperty('typography');
    expect(theme).toHaveProperty('spacing');
    expect(theme).toHaveProperty('breakpoints');
    
    // Verify colors structure
    expect(theme.colors).toHaveProperty('primary');
    expect(theme.colors).toHaveProperty('secondary');
    expect(theme.colors).toHaveProperty('error');
    
    // Verify typography structure
    expect(theme.typography).toHaveProperty('fontFamilies');
    expect(theme.typography).toHaveProperty('fontSizes');
    expect(theme.typography).toHaveProperty('fontWeights');
    expect(theme.typography).toHaveProperty('lineHeights');
    expect(theme.typography).toHaveProperty('variants');
  });
});