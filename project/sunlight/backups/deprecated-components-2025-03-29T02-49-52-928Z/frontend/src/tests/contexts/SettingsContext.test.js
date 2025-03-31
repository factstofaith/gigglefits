// SettingsContext.test.js
// -----------------------------------------------------------------------------
// Tests for SettingsContext provider using dependency injection pattern

import React, { useEffect } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsProvider, useSettings } from '@contexts/SettingsContext';

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
      store[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Sample mock data for API responses
const mockApiSettings = [
  { key: 'appearance.theme', value: 'dark' },
  { key: 'appearance.colorMode', value: 'high-contrast' },
  { key: 'system.dateFormat', value: 'DD/MM/YYYY' },
  { key: 'system.timeFormat', value: '24h' },
  { key: 'notifications.desktopEnabled', value: true },
  { key: 'features.betaFeaturesEnabled', value: true },
  { key: 'accessibility.fontSize', value: 'large' },
  { key: 'accessibility.highContrast', value: true },
  { key: 'display.dashboardLayout', value: 'compact' },
];

// Create mock API service for testing
const createMockApiService = () => {
  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';


  return {
    getAll: jest.fn(() => Promise.resolve(mockApiSettings)),
    executeCustom: jest.fn((endpoint, method, data) => {
      if (endpoint === 'update') {
        return Promise.resolve({ success: true });
      }
      if (endpoint === 'bulk-update') {
        return Promise.resolve({ success: true });
      }
      if (endpoint === 'reset') {
        return Promise.resolve({ success: true });
      }
      return Promise.resolve({});
    }),
  };
};

// Test component that uses the context
const TestComponent = ({ onContextLoad = () => {
  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

} }) => {
  const context = useSettings();

  // Call the callback with context values after render
  useEffect(() => {
    onContextLoad(context);
  }, [onContextLoad, context]);

  const {
    settings,
    theme,
    colorMode,
    dateFormat,
    timeFormat,
    fontSize,
    highContrast,
    dashboardLayout,
    isLoading,
    error,
    updateSetting,
    updateSettings,
    resetSettings,
    getSetting,
    getAccessibilitySettings,
    getDisplaySettings,
  } = context;

  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error-state">{error || 'No Error'}</div>
      <div data-testid="theme-value">{theme}</div>
      <div data-testid="color-mode">{colorMode}</div>
      <div data-testid="date-format">{dateFormat}</div>
      <div data-testid="time-format">{timeFormat}</div>
      <div data-testid="font-size">{fontSize}</div>
      <div data-testid="high-contrast">{highContrast ? 'true' : 'false'}</div>
      <div data-testid="dashboard-layout">{dashboardLayout}</div>
      <div data-testid="all-settings">{JSON.stringify(settings)}</div>
      <div data-testid="beta-features">
        {getSetting('features', 'betaFeaturesEnabled') ? 'Enabled' : 'Disabled'}
      </div>
      <div data-testid="accessibility-settings">
        {JSON.stringify(getAccessibilitySettings())}
      </div>
      <div data-testid="display-settings">
        {JSON.stringify(getDisplaySettings())}
      </div>

      <button
        data-testid="update-theme-button"
        onClick={() => updateSetting('appearance', 'theme', 'light')}
      >
        Update Theme
      </button>

      <button
        data-testid="update-multiple-button"
        onClick={() =>
          updateSettings({
            system: { dateFormat: 'YYYY-MM-DD' },
            features: { betaFeaturesEnabled: false },
          })
        }
      >
        Update Multiple
      </button>

      <button data-testid="reset-button" onClick={resetSettings}>
        Reset Settings
      </button>
    </div>
  );
};

// Helper function for simpler test setup with dependency injection
const renderWithSettingsContext = (apiService = createMockApiService()) => {
  let contextValues = null;

  render(
    <SettingsProvider apiService={apiService}>
      <TestComponent
        onContextLoad={(values) => {
          contextValues = values;
        }}
      />
    </SettingsProvider>
  );

  // Helper to get the latest context values
  const getContextValues = () => contextValues;

  return {
    getContextValues,
    apiService,
  };
};

describe('SettingsContext using dependency injection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    // Mock console.error to avoid cluttering the test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });

  it('initializes with default settings and fetches from API', async () => {
    const { apiService } = renderWithSettingsContext();

    // Initially loading
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    // Should have API-provided settings
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(screen.getByTestId('color-mode')).toHaveTextContent('high-contrast');
    expect(screen.getByTestId('date-format')).toHaveTextContent('DD/MM/YYYY');
    expect(screen.getByTestId('time-format')).toHaveTextContent('24h');
    expect(screen.getByTestId('font-size')).toHaveTextContent('large');
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
    expect(screen.getByTestId('dashboard-layout')).toHaveTextContent('compact');
    expect(screen.getByTestId('beta-features')).toHaveTextContent('Enabled');

    // Verify API call
    expect(apiService.getAll).toHaveBeenCalled();
  });

  it('updates a single setting using updateSetting', async () => {
    const { apiService } = renderWithSettingsContext();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    // Update theme
    await act(async () => {
      fireEvent.click(screen.getByTestId('update-theme-button'));
    });

    // Should be loading during update
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    });

    // After update completes
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });

    // Verify API call
    expect(apiService.executeCustom).toHaveBeenCalledWith(
      'update',
      'POST',
      {
        key: 'appearance.theme',
        value: 'light',
      }
    );

    // Should update localStorage
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  it('updates multiple settings with updateSettings', async () => {
    const { apiService } = renderWithSettingsContext();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    // Update multiple settings
    await act(async () => {
      fireEvent.click(screen.getByTestId('update-multiple-button'));
    });

    // Should be loading during update
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    });

    // After update completes
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('date-format')).toHaveTextContent('YYYY-MM-DD');
      expect(screen.getByTestId('beta-features')).toHaveTextContent('Disabled');
    });

    // Verify API call - check for bulk-update
    expect(apiService.executeCustom).toHaveBeenCalledWith(
      'bulk-update',
      'POST',
      expect.objectContaining({
        settings: expect.arrayContaining([
          expect.objectContaining({ key: 'system.dateFormat' }),
          expect.objectContaining({ key: 'features.betaFeaturesEnabled' }),
        ]),
      })
    );
  });

  it('resets settings to defaults', async () => {
    const { apiService } = renderWithSettingsContext();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    // First change a setting
    await act(async () => {
      fireEvent.click(screen.getByTestId('update-theme-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });

    // Now reset settings
    await act(async () => {
      fireEvent.click(screen.getByTestId('reset-button'));
    });

    // After reset completes
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    // Verify API call
    expect(apiService.executeCustom).toHaveBeenCalledWith('reset', 'POST');
  });

  it('handles API errors gracefully', async () => {
    // Custom API service with getAll that rejects
    const errorApiService = createMockApiService();
    errorApiService.getAll.mockImplementationOnce(() => 
      Promise.reject(new Error('API error'))
    );

    renderWithSettingsContext(errorApiService);

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    // Should show error state
    expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to load application settings');

    // Should still have default settings
    expect(screen.getByTestId('all-settings')).toBeTruthy();

    // Verify error was logged
    expect(console.error).toHaveBeenCalled();
  });

  it('getSetting helper returns correct value', async () => {
    renderWithSettingsContext();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    // Check beta features setting
    expect(screen.getByTestId('beta-features')).toHaveTextContent('Enabled');
  });

  it('uses localStorage for initial values', async () => {
    // Set localStorage value
    const storedSettings = {
      appearance: { 
        theme: 'custom-theme',
        colorMode: 'custom',
        primaryColor: '#ff0000', 
        accentColor: '#00ff00'
      },
      system: { dateFormat: 'YYYY-MM-DD' },
      notifications: {},
      connectivity: {},
      features: {},
      accessibility: {
        fontSize: 'x-large',
        reduceMotion: true
      },
      display: {
        dashboardLayout: 'expanded',
        defaultView: 'grid'
      }
    };
    window.localStorage.getItem.mockImplementation(() => JSON.stringify(storedSettings));

    renderWithSettingsContext();

    // Note: We don't test final values here because the mock API will override them,
    // but we verify localStorage was checked
    await waitFor(() => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith('app_settings');
    });
  });
  
  it('applies accessibility settings to the document body', async () => {
    // Mock document.body.dataset and classList
    const originalDataset = { ...document.body.dataset };
    const mockDataset = {};
    Object.defineProperty(document.body, 'dataset', {
      value: mockDataset,
      writable: true,
      configurable: true
    });
    
    const addClassSpy = jest.spyOn(document.body.classList, 'add');
    const removeClassSpy = jest.spyOn(document.body.classList, 'remove');
    
    renderWithSettingsContext();
    
    // Wait for settings to load and be applied
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Check that body attributes were set correctly
    expect(document.body.dataset.theme).toBe('dark');
    expect(document.body.dataset.colorMode).toBe('high-contrast');
    expect(document.body.dataset.fontSize).toBe('large');
    expect(document.body.dataset.highContrast).toBe('true');
    
    // Restore original dataset
    Object.defineProperty(document.body, 'dataset', {
      value: originalDataset,
      writable: true,
      configurable: true
    });
    
    // Clean up spies
    addClassSpy.mockRestore();
    removeClassSpy.mockRestore();
  });

  it('directly exposes context methods through getContextValues helper', async () => {
    const { getContextValues } = renderWithSettingsContext();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    // Get current context values
    const contextValues = getContextValues();

    // Verify context has expected structure and values
    expect(contextValues.settings).toBeDefined();
    expect(contextValues.theme).toBe('dark');
    expect(contextValues.colorMode).toBe('high-contrast');
    expect(contextValues.dateFormat).toBe('DD/MM/YYYY');
    expect(contextValues.fontSize).toBe('large');
    expect(contextValues.highContrast).toBe(true);
    expect(contextValues.dashboardLayout).toBe('compact');
    expect(typeof contextValues.updateSetting).toBe('function');
    expect(typeof contextValues.updateSettings).toBe('function');
    expect(typeof contextValues.resetSettings).toBe('function');
    expect(typeof contextValues.getSetting).toBe('function');
    expect(typeof contextValues.getAccessibilitySettings).toBe('function');
    expect(typeof contextValues.getDisplaySettings).toBe('function');
  });

  it('throws error when hook is used outside provider', () => {
    // Using a custom render function to catch the expected error
    const renderWithoutProvider = () => {
  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';


      const TestHookComponent = () => {
  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';


        useSettings();
        return <div>Should not render</div>;
      };
      
      return render(<TestHookComponent />);
    };
    
    // Expect the render to throw
    expect(renderWithoutProvider).toThrow('useSettings must be used within a SettingsProvider');
  });
});