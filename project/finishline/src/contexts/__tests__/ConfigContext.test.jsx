/**
 * ConfigContext Tests
 * 
 * Tests for the ConfigContext provider and hook.
 */

import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfigProvider, useConfig } from '../ConfigContext';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Reset mocks between tests
beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

// Wrapper for testing hooks with default settings
const wrapper = ({ children }) => <ConfigProvider>{children}</ConfigProvider>;

// Test component
const TestComponent = () => {
  const { config } = useConfig();
  return <div data-testid="app-name">{config.appName}</div>;
};

describe('ConfigContext', () => {
  // Provider tests
  describe('ConfigProvider', () => {
    it('renders children correctly', () => {
      const { getByTestId } = render(
        <ConfigProvider>
          <TestComponent />
        </ConfigProvider>
      );
      
      expect(getByTestId('app-name')).toHaveTextContent('TAP Integration Platform');
    });

    it('merges initialConfig with default config', () => {
      const initialConfig = {
        appName: 'Custom App Name',
        features: {
          darkMode: false,
        },
      };
      
      const { result } = renderHook(() => useConfig(), {
        wrapper: ({ children }) => (
          <ConfigProvider initialConfig={initialConfig}>
            {children}
          </ConfigProvider>
        ),
      });
      
      expect(result.current.config.appName).toBe('Custom App Name');
      expect(result.current.config.features.darkMode).toBe(false);
      expect(result.current.config.features.notifications).toBe(true); // From default config
    });

    it('persists config to localStorage when persistConfig is true', () => {
      const initialConfig = {
        appName: 'Persisted App',
      };
      
      renderHook(() => useConfig(), {
        wrapper: ({ children }) => (
          <ConfigProvider initialConfig={initialConfig} persistConfig={true}>
            {children}
          </ConfigProvider>
        ),
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Check that the stored config includes our custom value
      const storedConfig = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(storedConfig.appName).toBe('Persisted App');
    });

    it('does not persist config to localStorage when persistConfig is false', () => {
      renderHook(() => useConfig(), {
        wrapper: ({ children }) => (
          <ConfigProvider persistConfig={false}>
            {children}
          </ConfigProvider>
        ),
      });
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('uses custom storageKey when provided', () => {
      const customKey = 'custom_config_key';
      
      renderHook(() => useConfig(), {
        wrapper: ({ children }) => (
          <ConfigProvider storageKey={customKey}>
            {children}
          </ConfigProvider>
        ),
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        customKey,
        expect.any(String)
      );
    });

    it('loads config from localStorage when available', () => {
      const savedConfig = {
        appName: 'Saved App Name',
        version: '2.0.0',
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedConfig));
      
      const { result } = renderHook(() => useConfig(), { wrapper });
      
      expect(result.current.config.appName).toBe('Saved App Name');
      expect(result.current.config.version).toBe('2.0.0');
    });
  });

  // Hook tests
  describe('useConfig', () => {
    it('provides config object', () => {
      const { result } = renderHook(() => useConfig(), { wrapper });
      
      expect(result.current.config).toBeDefined();
      expect(result.current.config.appName).toBe('TAP Integration Platform');
    });

    it('can update entire config', () => {
      const { result } = renderHook(() => useConfig(), { wrapper });
      
      act(() => {
        result.current.updateConfig({ appName: 'Updated App' });
      });
      
      expect(result.current.config.appName).toBe('Updated App');
    });

    it('can reset config to defaults', () => {
      const { result } = renderHook(() => useConfig(), { wrapper });
      
      // First update the config
      act(() => {
        result.current.updateConfig({ appName: 'Modified App' });
      });
      
      expect(result.current.config.appName).toBe('Modified App');
      
      // Then reset
      act(() => {
        result.current.resetConfig();
      });
      
      expect(result.current.config.appName).toBe('TAP Integration Platform');
    });

    it('can get config value by path', () => {
      const { result } = renderHook(() => useConfig(), { wrapper });
      
      expect(result.current.getConfigValue('appName')).toBe('TAP Integration Platform');
      expect(result.current.getConfigValue('features.darkMode')).toBe(true);
      expect(result.current.getConfigValue('preferences.language')).toBe('en');
    });

    it('returns default value for non-existent paths', () => {
      const { result } = renderHook(() => useConfig(), { wrapper });
      
      expect(result.current.getConfigValue('nonExistentPath', 'default')).toBe('default');
      expect(result.current.getConfigValue('features.nonExistentFeature', false)).toBe(false);
    });

    it('can set config value by path', () => {
      const { result } = renderHook(() => useConfig(), { wrapper });
      
      act(() => {
        result.current.setConfigValue('appName', 'New App Name');
      });
      
      expect(result.current.config.appName).toBe('New App Name');
      
      act(() => {
        result.current.setConfigValue('features.darkMode', false);
      });
      
      expect(result.current.config.features.darkMode).toBe(false);
    });

    it('can create nested objects when setting deep paths', () => {
      const { result } = renderHook(() => useConfig(), { wrapper });
      
      act(() => {
        result.current.setConfigValue('newSection.nestedProperty', 'New Value');
      });
      
      expect(result.current.config.newSection.nestedProperty).toBe('New Value');
    });

    it('throws an error when used outside of ConfigProvider', () => {
      // Suppress console.error for this test to avoid noisy output
      const originalError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        renderHook(() => useConfig());
      }).toThrow('useConfig must be used within a ConfigProvider');
      
      // Restore console.error
      console.error = originalError;
    });
  });
});