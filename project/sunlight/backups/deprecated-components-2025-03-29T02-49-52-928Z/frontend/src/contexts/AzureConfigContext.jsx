// AzureConfigContext.jsx
// Context provider for Azure configuration state management

import React, { createContext, useState, useContext, useEffect } from 'react';
import * as azureConfigService from '@services/azureConfigService';
import * as azureResourceService from '@services/azureResourceService';

// Create context
const AzureConfigContext = createContext();

/**
 * Provider component for Azure configuration
 */
export const AzureConfigProvider = ({ children }) => {
  // Added display name
  AzureConfigProvider.displayName = 'AzureConfigProvider';

  // Added display name
  AzureConfigProvider.displayName = 'AzureConfigProvider';

  // Added display name
  AzureConfigProvider.displayName = 'AzureConfigProvider';

  // Added display name
  AzureConfigProvider.displayName = 'AzureConfigProvider';

  // Added display name
  AzureConfigProvider.displayName = 'AzureConfigProvider';


  // Azure configuration state
  const [azureConfig, setAzureConfig] = useState(null);
  
  // Connection status
  const [isConnected, setIsConnected] = useState(false);
  
  // Azure resources
  const [resources, setResources] = useState([]);
  
  // Loading states
  const [configLoading, setConfigLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  
  // Error states
  const [configError, setConfigError] = useState(null);
  const [resourcesError, setResourcesError] = useState(null);
  
  /**
   * Load Azure configuration on component mount
   */
  useEffect(() => {
    const loadAzureConfig = async () => {
      try {
        setConfigLoading(true);
        setConfigError(null);
        
        // Check if Azure connection is configured and active
        const connected = await azureConfigService.checkAzureConnection();
        setIsConnected(connected);
        
        // Only load the full config if connected
        if (connected) {
          const config = await azureConfigService.getAzureConfig();
          setAzureConfig(config);
          
          // Load initial resources
          await loadResources();
        }
      } catch (error) {
        console.error('Error loading Azure configuration:', error);
        setConfigError('Failed to load Azure configuration');
      } finally {
        setConfigLoading(false);
      }
    };
    
    loadAzureConfig();
  }, []);
  
  /**
   * Load Azure resources
   */
  const loadResources = async (resourceGroup) => {
    if (!isConnected) {
      return;
    }
    
    try {
      setResourcesLoading(true);
      setResourcesError(null);
      
      const resources = await azureResourceService.getAzureResources(resourceGroup);
      setResources(resources);
    } catch (error) {
      console.error('Error loading Azure resources:', error);
      setResourcesError('Failed to load Azure resources');
    } finally {
      setResourcesLoading(false);
    }
  };
  
  /**
   * Save Azure configuration
   */
  const saveConfiguration = async (config) => {
    try {
      setConfigLoading(true);
      setConfigError(null);
      
      const savedConfig = await azureConfigService.saveAzureConfig(config);
      setAzureConfig(savedConfig);
      
      // Check if connection is now active
      const connected = await azureConfigService.checkAzureConnection();
      setIsConnected(connected);
      
      return savedConfig;
    } catch (error) {
      console.error('Error saving Azure configuration:', error);
      setConfigError('Failed to save Azure configuration');
      throw error;
    } finally {
      setConfigLoading(false);
    }
  };
  
  /**
   * Test Azure connection
   */
  const testConnection = async (config) => {
    try {
      const result = await azureConfigService.testAzureConnection(config || azureConfig);
      return result;
    } catch (error) {
      console.error('Error testing Azure connection:', error);
      throw error;
    }
  };
  
  /**
   * Discover Azure resources
   */
  const discoverResources = async () => {
    if (!isConnected) {
      throw new Error('Azure is not connected');
    }
    
    try {
      setDiscoveryLoading(true);
      
      const result = await azureResourceService.discoverResources();
      
      // Reload resources after discovery
      await loadResources(azureConfig?.resourceGroup);
      
      return result;
    } catch (error) {
      console.error('Error discovering Azure resources:', error);
      throw error;
    } finally {
      setDiscoveryLoading(false);
    }
  };
  
  /**
   * Clear Azure configuration
   */
  const clearConfiguration = async () => {
    try {
      setConfigLoading(true);
      
      await azureConfigService.clearAzureConfig();
      setAzureConfig(null);
      setIsConnected(false);
      setResources([]);
    } catch (error) {
      console.error('Error clearing Azure configuration:', error);
      throw error;
    } finally {
      setConfigLoading(false);
    }
  };
  
  // Create context value
  const contextValue = {
    azureConfig,
    isConnected,
    resources,
    configLoading,
    resourcesLoading,
    discoveryLoading,
    configError,
    resourcesError,
    saveConfiguration,
    testConnection,
    loadResources,
    discoverResources,
    clearConfiguration
  };
  
  return (
    <AzureConfigContext.Provider value={contextValue}>
      {children}
    </AzureConfigContext.Provider>
  );
};

/**
 * Custom hook for using the Azure configuration context
 */
export const useAzureConfig = () => {
  // Added display name
  useAzureConfig.displayName = 'useAzureConfig';

  // Added display name
  useAzureConfig.displayName = 'useAzureConfig';

  // Added display name
  useAzureConfig.displayName = 'useAzureConfig';

  // Added display name
  useAzureConfig.displayName = 'useAzureConfig';

  // Added display name
  useAzureConfig.displayName = 'useAzureConfig';


  const context = useContext(AzureConfigContext);
  if (context === undefined) {
    throw new Error('useAzureConfig must be used within an AzureConfigProvider');
  }
  return context;
};

export default AzureConfigContext;