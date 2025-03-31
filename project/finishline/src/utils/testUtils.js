/**
 * Test Utilities
 * 
 * Helpers for testing React components and hooks.
 * 
 * @module utils/testUtils
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ConfigProvider } from '../contexts/ConfigContext';
import { AuthProvider } from '../contexts/AuthContext';
import { DialogProvider } from '../contexts/DialogContext';

/**
 * Create a wrapper for all providers
 * 
 * @param {Object} [options] - Provider options
 * @param {Object} [options.theme] - Theme provider options
 * @param {Object} [options.notification] - Notification provider options
 * @param {Object} [options.config] - Config provider options
 * @param {Object} [options.auth] - Auth provider options
 * @returns {Function} Provider wrapper component
 */
export const AllProviders = ({ 
  children,
  theme = {},
  notification = {},
  config = {},
  auth = {},
}) => {
  return (
    <ThemeProvider defaultMode={theme.defaultMode || 'light'}>
      <NotificationProvider maxNotifications={notification.maxNotifications || 5}>
        <ConfigProvider initialConfig={config.initialConfig || {}}>
          <AuthProvider initialUser={auth.initialUser}>
            <DialogProvider>
              {children}
            </DialogProvider>
          </AuthProvider>
        </ConfigProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

/**
 * Custom render function with providers
 * 
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} [options] - Render options
 * @param {Object} [options.providerProps] - Props for providers
 * @returns {Object} Render result
 */
export const renderWithProviders = (ui, options = {}) => {
  const { providerProps, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: (props) => <AllProviders {...props} {...providerProps} />,
    ...renderOptions,
  });
};

/**
 * Create a mock for the ResizeObserver
 * 
 * @returns {Object} ResizeObserver mock
 */
export const mockResizeObserver = () => {
  const mockObserve = jest.fn();
  const mockUnobserve = jest.fn();
  const mockDisconnect = jest.fn();
  
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  }));
  
  return { mockObserve, mockUnobserve, mockDisconnect };
};

/**
 * Create a mock for the IntersectionObserver
 * 
 * @returns {Object} IntersectionObserver mock
 */
export const mockIntersectionObserver = () => {
  const mockObserve = jest.fn();
  const mockUnobserve = jest.fn();
  const mockDisconnect = jest.fn();
  
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  }));
  
  return { mockObserve, mockUnobserve, mockDisconnect };
};

/**
 * Create a mock for localStorage
 * 
 * @returns {Object} localStorage mock
 */
export const mockLocalStorage = () => {
  const store = {};
  
  const mockLocalStorage = {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => {
        delete store[key];
      });
    }),
    length: Object.keys(store).length,
    key: jest.fn((index) => Object.keys(store)[index] || null),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
  
  return mockLocalStorage;
};

/**
 * Create a mock for fetch
 * 
 * @param {Object} mockResponses - Map of URL patterns to mock responses
 * @returns {Object} fetch mock
 */
export const mockFetch = (mockResponses = {}) => {
  const fetch = jest.fn().mockImplementation(async (url, options = {}) => {
    // Find matching URL pattern
    const matchedUrl = Object.keys(mockResponses).find((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(url);
      }
      return url.includes(pattern);
    });
    
    if (!matchedUrl) {
      return Promise.reject(new Error(`No mock response for URL: ${url}`));
    }
    
    const mockResponse = mockResponses[matchedUrl];
    const responseData = typeof mockResponse === 'function'
      ? mockResponse(url, options)
      : mockResponse;
      
    // Default to JSON response
    const contentType = responseData.headers?.['Content-Type'] 
      || responseData.headers?.['content-type'] 
      || 'application/json';
      
    const status = responseData.status || 200;
    const statusText = responseData.statusText || (status === 200 ? 'OK' : 'Error');
    
    const body = responseData.body === undefined 
      ? responseData 
      : responseData.body;
      
    const headers = {
      'Content-Type': contentType,
      ...(responseData.headers || {}),
    };
    
    // Create response object
    const response = {
      ok: status >= 200 && status < 300,
      status,
      statusText,
      headers: {
        get: (name) => headers[name.toLowerCase()],
        has: (name) => name.toLowerCase() in headers,
      },
      json: () => Promise.resolve(contentType.includes('json') ? body : {}),
      text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
      blob: () => Promise.resolve(new Blob([JSON.stringify(body)])),
      clone: () => response,
      url,
    };
    
    return Promise.resolve(response);
  });
  
  global.fetch = fetch;
  
  return fetch;
};

/**
 * Create a delay promise
 * 
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a promise that rejects with an error
 * 
 * @param {string|Error} error - Error message or Error object
 * @param {number} [delayMs] - Optional delay before rejection
 * @returns {Promise} Promise that rejects with the error
 */
export const rejectPromise = (error, delayMs) => {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  
  if (delayMs) {
    return delay(delayMs).then(() => Promise.reject(errorObj));
  }
  
  return Promise.reject(errorObj);
};

/**
 * Create a component with render props for testing
 * 
 * @param {Function} hook - React hook to test
 * @returns {Function} Component with render props
 */
export const createHookTestComponent = (hook) => {
  return function TestComponent({ children, ...props }) {
    const hookResult = hook(props);
    return children(hookResult);
  };
};