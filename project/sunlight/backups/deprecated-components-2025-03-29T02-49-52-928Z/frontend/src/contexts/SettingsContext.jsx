// SettingsContext.jsx
// -----------------------------------------------------------------------------
// Context provider for managing application-wide settings

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createApiService } from '@utils/apiServiceFactory';

// Create the context
const SettingsContext = createContext();

// Custom hook for accessing the context
export const useSettings = () => {
  // Added display name
  useSettings.displayName = 'useSettings';

  // Added display name
  useSettings.displayName = 'useSettings';

  // Added display name
  useSettings.displayName = 'useSettings';

  // Added display name
  useSettings.displayName = 'useSettings';

  // Added display name
  useSettings.displayName = 'useSettings';


  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Create default API service for settings operations
const defaultSettingsApiService = createApiService({
  baseUrl: '/api/settings',
  entityName: 'setting',
  cacheConfig: {
    enabled: true,
    ttl: 30 * 60 * 1000, // 30 minutes
  },
});

// Context provider component
export const SettingsProvider = ({ 
  children, 
  apiService = defaultSettingsApiService 
}) => {
  // Added display name
  SettingsProvider.displayName = 'SettingsProvider';

  // Added display name
  SettingsProvider.displayName = 'SettingsProvider';

  // Added display name
  SettingsProvider.displayName = 'SettingsProvider';

  // Added display name
  SettingsProvider.displayName = 'SettingsProvider';

  // Added display name
  SettingsProvider.displayName = 'SettingsProvider';


  // Settings state
  const [settings, setSettings] = useState({
    appearance: {
      theme: 'light',
      density: 'standard',
      animations: true,
      colorMode: 'default', // default, high-contrast, custom
      primaryColor: '#3f51b5',
      accentColor: '#f50057',
    },
    system: {
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      language: 'en-US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    notifications: {
      desktopEnabled: true,
      emailEnabled: true,
      notifyOnIntegrationSuccess: true,
      notifyOnIntegrationFailure: true,
      notifyOnNewRelease: true,
    },
    connectivity: {
      apiEndpoints: {},
      refreshInterval: 60000, // Default to 1 minute
      offlineMode: false,
      retryStrategy: 'exponential',
      maxRetries: 3,
    },
    features: {
      betaFeaturesEnabled: false,
      analyticsEnabled: true,
      dataExportEnabled: true,
      advancedFiltersEnabled: true,
    },
    accessibility: {
      fontSize: 'medium', // small, medium, large, x-large
      reduceMotion: false,
      highContrast: false,
      screenReaderOptimized: false,
      keyboardNavigation: true,
      autoExpandMenus: false,
      focusIndicators: true,
      showTooltips: true,
    },
    display: {
      defaultPageSize: 25,
      compactTables: false,
      showDetailedErrors: true,
      preserveScrollPosition: true,
      dashboardLayout: 'default', // default, compact, expanded
      defaultView: 'list', // list, grid, detail
    },
  });

  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);

  // State for error
  const [error, setError] = useState(null);

  // Fetch settings from API or localStorage on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try to load from localStorage first for instant UI
        const storedSettings = localStorage.getItem('app_settings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }

        // Then fetch from API to get the latest
        const apiSettings = await apiService.getAll();

        // Convert from key-value format to structured format
        const formattedSettings = {
          appearance: {},
          system: {},
          notifications: {},
          connectivity: {},
          features: {},
        };

        apiSettings.forEach(setting => {
          const [category, key] = setting.key.split('.');
          if (formattedSettings[category] && key) {
            formattedSettings[category][key] = setting.value;
          }
        });

        setSettings(prev => ({
          appearance: { ...(prev?.appearance || {}), ...(formattedSettings?.appearance || {}) },
          system: { ...(prev?.system || {}), ...(formattedSettings?.system || {}) },
          notifications: { ...(prev?.notifications || {}), ...(formattedSettings?.notifications || {}) },
          connectivity: { ...(prev?.connectivity || {}), ...(formattedSettings?.connectivity || {}) },
          features: { ...(prev?.features || {}), ...(formattedSettings?.features || {}) },
        }));

        // Store in localStorage for faster loading next time
        localStorage.setItem('app_settings', JSON.stringify(formattedSettings));
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load application settings');

        // Fallback to default settings
        // Default settings already set in useState
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [apiService]);

  // Update a setting
  const updateSetting = useCallback(
    async (category, key, value) => {
  // Added display name
  updateSetting.displayName = 'updateSetting';

      setIsLoading(true);
      setError(null);

      try {
        // Update setting in API
        await apiService.executeCustom('update', 'POST', {
          key: `${category}.${key}`,
          value,
        });

        // Update local state
        setSettings(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value,
          },
        }));

        // Update localStorage
        localStorage.setItem(
          'app_settings',
          JSON.stringify({
            ...settings,
            [category]: {
              ...settings[category],
              [key]: value,
            },
          })
        );

        return true;
      } catch (error) {
        console.error('Error updating setting:', error);
        setError(`Failed to update ${category}.${key} setting`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [settings, apiService]
  );

  // Bulk update settings
  const updateSettings = useCallback(
    async newSettings => {
  // Added display name
  updateSettings.displayName = 'updateSettings';

      setIsLoading(true);
      setError(null);

      try {
        // Convert structured format to key-value format for API
        const settingsUpdates = [];

        Object.entries(newSettings).forEach(([category, categorySettings]) => {
          if (typeof categorySettings === 'object') {
            Object.entries(categorySettings).forEach(([key, value]) => {
              settingsUpdates.push({
                key: `${category}.${key}`,
                value,
              });
            });
          }
        });

        // Update settings in API
        await apiService.executeCustom('bulk-update', 'POST', {
          settings: settingsUpdates,
        });

        // Update local state
        setSettings(prev => ({
          ...prev,
          ...newSettings,
        }));

        // Update localStorage
        localStorage.setItem(
          'app_settings',
          JSON.stringify({
            ...settings,
            ...newSettings,
          })
        );

        return true;
      } catch (error) {
        console.error('Error updating settings:', error);
        setError('Failed to update settings');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [settings, apiService]
  );

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
  // Added display name
  resetSettings.displayName = 'resetSettings';

    setIsLoading(true);
    setError(null);

    try {
      // Reset settings in API
      await apiService.executeCustom('reset', 'POST');

      // Default settings
      const defaultSettings = {
        appearance: {
          theme: 'light',
          density: 'standard',
          animations: true,
          colorMode: 'default',
          primaryColor: '#3f51b5',
          accentColor: '#f50057',
        },
        system: {
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          language: 'en-US',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        notifications: {
          desktopEnabled: true,
          emailEnabled: true,
          notifyOnIntegrationSuccess: true,
          notifyOnIntegrationFailure: true,
          notifyOnNewRelease: true,
        },
        connectivity: {
          apiEndpoints: {},
          refreshInterval: 60000,
          offlineMode: false,
          retryStrategy: 'exponential',
          maxRetries: 3,
        },
        features: {
          betaFeaturesEnabled: false,
          analyticsEnabled: true,
          dataExportEnabled: true,
          advancedFiltersEnabled: true,
        },
        accessibility: {
          fontSize: 'medium',
          reduceMotion: false,
          highContrast: false,
          screenReaderOptimized: false,
          keyboardNavigation: true,
          autoExpandMenus: false,
          focusIndicators: true,
          showTooltips: true,
        },
        display: {
          defaultPageSize: 25,
          compactTables: false,
          showDetailedErrors: true,
          preserveScrollPosition: true,
          dashboardLayout: 'default',
          defaultView: 'list',
        },
      };

      // Update local state
      setSettings(defaultSettings);

      // Update localStorage
      localStorage.setItem('app_settings', JSON.stringify(defaultSettings));

      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError('Failed to reset settings');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  // Apply settings to body element for global styles
  useEffect(() => {
    try {
      // Appearance settings
      const theme = settings?.appearance?.theme || 'light';
      document.body.dataset.theme = theme;
      document.body.dataset.density = settings?.appearance?.density || 'standard';
      document.body.dataset.animations = settings?.appearance?.animations ? 'enabled' : 'disabled';
      document.body.dataset.colorMode = settings?.appearance?.colorMode || 'default';
      
      // Apply color variables if in custom color mode
      if (settings?.appearance?.colorMode === 'custom') {
        document.documentElement.style.setProperty('--primary-color', settings?.appearance?.primaryColor);
        document.documentElement.style.setProperty('--accent-color', settings?.appearance?.accentColor);
      } else {
        document.documentElement.style.removeProperty('--primary-color');
        document.documentElement.style.removeProperty('--accent-color');
      }
      
      // Accessibility settings
      if (settings?.accessibility) {
        // Font size
        document.body.dataset.fontSize = settings.accessibility.fontSize || 'medium';
        
        // High contrast mode
        document.body.dataset.highContrast = settings.accessibility.highContrast ? 'true' : 'false';
        
        // Reduced motion
        if (settings.accessibility.reduceMotion) {
          document.body.classList.add('reduce-motion');
        } else {
          document.body.classList.remove('reduce-motion');
        }
        
        // Screen reader optimizations
        document.body.dataset.screenReaderOptimized = 
          settings.accessibility.screenReaderOptimized ? 'true' : 'false';
        
        // Focus indicators
        document.body.dataset.focusIndicators = 
          settings.accessibility.focusIndicators ? 'true' : 'false';
      }
      
      // Display settings
      if (settings?.display) {
        document.body.dataset.compactTables = settings.display.compactTables ? 'true' : 'false';
        document.body.dataset.dashboardLayout = settings.display.dashboardLayout || 'default';
      }
    } catch (error) {
      console.error('Error applying settings to body:', error);
    }
  }, [settings?.appearance, settings?.accessibility, settings?.display]);

  // Create a helper function to get a specific setting
  const getSetting = useCallback(
    (category, key) => {
  // Added display name
  getSetting.displayName = 'getSetting';

      if (settings && category && key && 
          settings[category] && 
          settings[category][key] !== undefined) {
        return settings[category][key];
      }
      return null;
    },
    [settings]
  );

  // Context value
  const value = {
    // Settings state
    settings,
    isLoading,
    error,

    // Specific appearance settings
    theme: settings.appearance.theme,
    density: settings.appearance.density,
    animations: settings.appearance.animations,
    colorMode: settings.appearance.colorMode,
    primaryColor: settings.appearance.primaryColor,
    accentColor: settings.appearance.accentColor,
    
    // Specific system settings
    language: settings.system.language,
    dateFormat: settings.system.dateFormat,
    timeFormat: settings.system.timeFormat,
    timezone: settings.system.timezone,
    
    // Connectivity settings
    refreshInterval: settings.connectivity.refreshInterval,
    offlineMode: settings.connectivity.offlineMode,
    
    // Accessibility settings
    fontSize: settings?.accessibility?.fontSize,
    reduceMotion: settings?.accessibility?.reduceMotion,
    highContrast: settings?.accessibility?.highContrast,
    screenReaderOptimized: settings?.accessibility?.screenReaderOptimized,
    keyboardNavigation: settings?.accessibility?.keyboardNavigation,
    
    // Display settings
    defaultPageSize: settings?.display?.defaultPageSize,
    compactTables: settings?.display?.compactTables,
    showDetailedErrors: settings?.display?.showDetailedErrors,
    dashboardLayout: settings?.display?.dashboardLayout,
    defaultView: settings?.display?.defaultView,

    // Methods
    updateSetting,
    updateSettings,
    resetSettings,
    getSetting,
    clearError: () => setError(null),
    
    // Convenience getters for setting categories
    getAppearanceSettings: () => settings.appearance,
    getSystemSettings: () => settings.system,
    getNotificationSettings: () => settings.notifications,
    getAccessibilitySettings: () => settings.accessibility,
    getDisplaySettings: () => settings.display,
    getFeatureSettings: () => settings.features,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export default SettingsContext;
