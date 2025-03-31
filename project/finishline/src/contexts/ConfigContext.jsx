/**
 * ConfigContext
 * 
 * Context provider for application-wide configuration.
 * 
 * @module contexts/ConfigContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

// Default configuration values
const defaultConfig = {
  apiUrl: '/api',
  appName: 'TAP Integration Platform',
  version: '1.0.0',
  features: {
    darkMode: true,
    notifications: true,
    analytics: false,
    debugMode: false,
  },
  preferences: {
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  performance: {
    pageSize: 25,
    maxItemsPerPage: 100,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  },
  ui: {
    animationsEnabled: true,
    denseMode: false,
    sidebarCollapsed: false,
  },
};

// Create the context
const ConfigContext = createContext({
  config: defaultConfig,
  updateConfig: () => {},
  resetConfig: () => {},
  getConfigValue: () => {},
  setConfigValue: () => {},
});

/**
 * Config Provider Component
 * 
 * @param {Object} props - Component props
 * @param {node} props.children - Child components
 * @param {Object} [props.initialConfig={}] - Initial configuration to merge with defaults
 * @param {boolean} [props.persistConfig=true] - Whether to persist configuration in localStorage
 * @param {string} [props.storageKey='tap_app_config'] - Storage key for persisted configuration
 * @returns {JSX.Element} Config provider
 */
export function ConfigProvider({ 
  children, 
  initialConfig = {}, 
  persistConfig = true,
  storageKey = 'tap_app_config'
}) {
  // Initialize configuration state
  const [config, setConfig] = useState(() => {
    // If persistence is enabled, try to load from localStorage
    if (persistConfig) {
      try {
        const savedConfig = localStorage.getItem(storageKey);
        if (savedConfig) {
          return {
            ...defaultConfig,
            ...JSON.parse(savedConfig),
            ...initialConfig,
          };
        }
      } catch (error) {
        console.error('Failed to load config from localStorage:', error);
      }
    }
    
    // Otherwise use default + initial config
    return {
      ...defaultConfig,
      ...initialConfig,
    };
  });
  
  // Update configuration when initialConfig changes
  useEffect(() => {
    if (Object.keys(initialConfig).length > 0) {
      setConfig(prevConfig => ({
        ...prevConfig,
        ...initialConfig,
      }));
    }
  }, [initialConfig]);
  
  // Persist configuration to localStorage when it changes
  useEffect(() => {
    if (persistConfig) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(config));
      } catch (error) {
        console.error('Failed to save config to localStorage:', error);
      }
    }
  }, [config, persistConfig, storageKey]);
  
  // Update the entire configuration
  const updateConfig = useCallback((newConfig) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig,
    }));
  }, []);
  
  // Reset configuration to defaults
  const resetConfig = useCallback(() => {
    setConfig({
      ...defaultConfig,
      ...initialConfig,
    });
  }, [initialConfig]);
  
  // Get a specific configuration value by path
  const getConfigValue = useCallback((path, defaultValue) => {
    if (!path) return config;
    
    const pathParts = path.split('.');
    let value = config;
    
    for (let part of pathParts) {
      if (value === undefined || value === null) {
        return defaultValue;
      }
      value = value[part];
    }
    
    return value !== undefined && value !== null ? value : defaultValue;
  }, [config]);
  
  // Set a specific configuration value by path
  const setConfigValue = useCallback((path, value) => {
    if (!path) return;
    
    const pathParts = path.split('.');
    
    setConfig(prevConfig => {
      // Clone the config to avoid direct mutation
      const newConfig = JSON.parse(JSON.stringify(prevConfig));
      
      // Navigate to the target property
      let current = newConfig;
      const lastPart = pathParts.pop();
      
      for (let part of pathParts) {
        // Create missing objects along the path
        if (current[part] === undefined) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the value
      current[lastPart] = value;
      
      return newConfig;
    });
  }, []);
  
  // Value object for the context
  const contextValue = useMemo(() => ({
    config,
    updateConfig,
    resetConfig,
    getConfigValue,
    setConfigValue,
  }), [config, updateConfig, resetConfig, getConfigValue, setConfigValue]);
  
  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
}

/**
 * Hook to use config context
 * 
 * @returns {Object} Config context value
 */
export function useConfig() {
  const context = useContext(ConfigContext);
  
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  
  return context;
}

ConfigProvider.propTypes = {
  /** Child components */
  children: PropTypes.node.isRequired,
  
  /** Initial configuration to merge with defaults */
  initialConfig: PropTypes.object,
  
  /** Whether to persist configuration in localStorage */
  persistConfig: PropTypes.bool,
  
  /** Storage key for persisted configuration */
  storageKey: PropTypes.string,
};

export default ConfigContext;