/**
 * Test utilities for component testing
 * 
 * Provides test wrappers with context providers for testing components
 */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { DialogProvider } from './contexts/DialogContext';

/**
 * Custom render function that wraps component with all providers
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} options - Render options
 * @returns {Object} - Result of render with queries
 */
function renderWithProviders(ui, options = {}) {
  const AllProviders = ({ children }) => {
    return (
      <ThemeProvider>
        <ConfigProvider>
          <AuthProvider>
            <NotificationProvider>
              <DialogProvider>
                <BrowserRouter>
                  {children}
                </BrowserRouter>
              </DialogProvider>
            </NotificationProvider>
          </AuthProvider>
        </ConfigProvider>
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Simplified wrapper for testing with minimal provider requirements
 * Use when you only need specific contexts rather than all of them
 */
const TestProviders = {
  /**
   * Just theme provider
   */
  Theme: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,

  /**
   * Just config provider
   */
  Config: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,

  /**
   * Just auth provider
   */
  Auth: ({ children }) => <AuthProvider>{children}</AuthProvider>,

  /**
   * Just notification provider
   */
  Notification: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,

  /**
   * Just dialog provider
   */
  Dialog: ({ children }) => <DialogProvider>{children}</DialogProvider>,

  /**
   * Just router
   */
  Router: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
};

export { renderWithProviders, TestProviders };