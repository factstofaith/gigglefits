import React, { createContext, useContext } from 'react';
import { getConfig } from '../config';

// Create context with default value
const ConfigContext = createContext(null);

/**
 * Configuration Provider component
 * Provides application configuration to components via React Context
 */
export function ConfigProvider({ children }) {
  // Added display name
  ConfigProvider.displayName = 'ConfigProvider';

  // Get configuration for current environment
  const config = getConfig();
  
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

/**
 * Hook to access configuration in components
 * @returns {Object} Current configuration
 */
export function useConfig() {
  // Added display name
  useConfig.displayName = 'useConfig';

  const context = useContext(ConfigContext);
  
  if (context === null) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  
  return context;
}