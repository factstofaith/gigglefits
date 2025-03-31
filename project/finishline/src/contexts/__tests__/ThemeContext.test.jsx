/**
 * ThemeContext Tests
 * 
 * Tests for the ThemeContext provider and hook.
 */

import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Test component that uses the theme
const TestComponent = () => {
  const { theme, mode, toggleMode } = useTheme();
  
  return (
    <div data-testid="theme-test">
      <span data-testid="theme-mode">{mode}</span>
      <span data-testid="theme-color">{theme.palette.primary.main}</span>
      <button onClick={toggleMode} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  );
};

// Wrapper for testing hooks
const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;

describe('ThemeContext', () => {
  // Provider tests
  describe('ThemeProvider', () => {
    it('provides default light theme', () => {
      render(<TestComponent />, { wrapper: ThemeProvider });
      
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      // Light theme primary color
      expect(screen.getByTestId('theme-color')).toHaveTextContent('#1976d2');
    });

    it('provides dark theme when defaultMode is dark', () => {
      render(
        <ThemeProvider defaultMode="dark">
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      // Dark theme primary color
      expect(screen.getByTestId('theme-color')).toHaveTextContent('#90caf9');
    });

    it('can toggle between light and dark themes', () => {
      render(<TestComponent />, { wrapper: ThemeProvider });
      
      // Initial state: light theme
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      
      // Toggle to dark theme
      fireEvent.click(screen.getByTestId('toggle-button'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('theme-color')).toHaveTextContent('#90caf9');
      
      // Toggle back to light theme
      fireEvent.click(screen.getByTestId('toggle-button'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('theme-color')).toHaveTextContent('#1976d2');
    });
  });

  // Hook tests
  describe('useTheme', () => {
    it('returns the theme object', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      
      expect(result.current.theme).toBeDefined();
      expect(result.current.theme.palette).toBeDefined();
      expect(result.current.theme.typography).toBeDefined();
    });

    it('returns the current mode', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      
      expect(result.current.mode).toBe('light');
    });

    it('returns setMode function', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      
      expect(typeof result.current.setMode).toBe('function');
    });

    it('returns toggleMode function', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      
      expect(typeof result.current.toggleMode).toBe('function');
    });

    it('can set mode directly', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      
      act(() => {
        result.current.setMode('dark');
      });
      
      expect(result.current.mode).toBe('dark');
      expect(result.current.theme.palette.mode).toBe('dark');
    });

    it('throws an error when used outside of ThemeProvider', () => {
      // Suppress console.error for this test to avoid noisy output
      const originalError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');
      
      // Restore console.error
      console.error = originalError;
    });
  });
});