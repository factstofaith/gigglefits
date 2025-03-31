// MonitoringContext.jsx
// -----------------------------------------------------------------------------
// Context provider for Azure monitoring state management

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  getResourceHealth, 
  getResourceMetrics,
  getAppServiceMetrics,
  getDatabaseMetrics,
  getStorageMetrics,
  getKeyVaultMetrics,
  getNetworkMetrics,
  getAlerts,
  getAlertHistory
} from '../services/azureMonitorService';
import { useAzureConfig } from '@contexts/AzureConfigContext';
import { useNotification } from '@hooks/useNotification';

// Create context
const MonitoringContext = createContext();

/**
 * Provider component for monitoring-related state and actions
 */
export const MonitoringProvider = ({ children }) => {
  // Added display name
  MonitoringProvider.displayName = 'MonitoringProvider';

  // Added display name
  MonitoringProvider.displayName = 'MonitoringProvider';

  // Added display name
  MonitoringProvider.displayName = 'MonitoringProvider';

  // Added display name
  MonitoringProvider.displayName = 'MonitoringProvider';

  // Added display name
  MonitoringProvider.displayName = 'MonitoringProvider';


  // Get Azure configuration context
  const { 
    isConnected, 
    azureResources, 
    configLoading
  } = useAzureConfig();
  
  // Get notification context
  const { showToast } = useNotification();
  
  // State for resources health
  const [resourceHealth, setResourceHealth] = useState({});
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState(null);
  
  // State for metrics data
  const [metricsData, setMetricsData] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);
  
  // State for time ranges
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute
  
  // State for currently selected resources
  const [selectedAppService, setSelectedAppService] = useState(null);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedKeyVault, setSelectedKeyVault] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  
  // State for alerts
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [alertHistoryLoading, setAlertHistoryLoading] = useState(false);
  
  // Load resource health
  const loadResourceHealth = useCallback(async () => {
  // Added display name
  loadResourceHealth.displayName = 'loadResourceHealth';

    if (!isConnected || !azureResources || azureResources.length === 0) {
      return;
    }
    
    try {
      setHealthLoading(true);
      setHealthError(null);
      
      // Create an array of promises for parallel execution
      const healthPromises = azureResources.map(resource => 
        getResourceHealth(resource.id).catch(err => {
          console.error(`Error fetching health for resource ${resource.name}:`, err);
          // Return a placeholder error result
          return { 
            resourceId: resource.id,
            status: 'Unknown',
            error: true,
            errorMessage: err.message || 'Failed to retrieve health status'
          };
        })
      );
      
      // Execute all promises in parallel
      const results = await Promise.all(healthPromises);
      
      // Convert results to a map for easy lookup
      const healthMap = {};
      results.forEach(result => {
        healthMap[result.resourceId] = result;
      });
      
      setResourceHealth(healthMap);
      setHealthLoading(false);
    } catch (error) {
      console.error('Error loading resource health:', error);
      setHealthError('Failed to load resource health');
      setHealthLoading(false);
      showToast('Failed to load resource health', 'error');
    }
  }, [isConnected, azureResources, showToast]);
  
  // Load metrics for a specific resource
  const loadResourceMetrics = useCallback(async (resourceId, resourceType, metricName) => {
  // Added display name
  loadResourceMetrics.displayName = 'loadResourceMetrics';

    if (!isConnected || !resourceId) {
      return null;
    }
    
    try {
      // Call appropriate metrics function based on resource type
      let result;
      switch (resourceType) {
        case 'Microsoft.Web/sites':
          result = await getAppServiceMetrics(resourceId, metricName, timeRange);
          break;
        case 'Microsoft.DBforPostgreSQL/servers':
          result = await getDatabaseMetrics(resourceId, metricName, timeRange);
          break;
        case 'Microsoft.Storage/storageAccounts':
          result = await getStorageMetrics(resourceId, metricName, timeRange);
          break;
        case 'Microsoft.KeyVault/vaults':
          result = await getKeyVaultMetrics(resourceId, metricName, timeRange);
          break;
        case 'Microsoft.Network/virtualNetworks':
        case 'Microsoft.Network/networkSecurityGroups':
          result = await getNetworkMetrics(resourceId, metricName, timeRange);
          break;
        default:
          // Generic metrics function for other resource types
          result = await getResourceMetrics(resourceId, metricName, timeRange);
      }
      
      return result;
    } catch (error) {
      console.error(`Error loading metrics for ${resourceId}:`, error);
      throw error;
    }
  }, [isConnected, timeRange]);
  
  // Load all metrics for selected resources
  const loadAllMetrics = useCallback(async () => {
  // Added display name
  loadAllMetrics.displayName = 'loadAllMetrics';

    if (!isConnected) {
      return;
    }
    
    try {
      setMetricsLoading(true);
      setMetricsError(null);
      
      const newMetricsData = { ...metricsData };
      
      // Load App Service metrics
      if (selectedAppService) {
        const appServiceId = selectedAppService.id;
        const [cpu, memory, responseTime, requests, errors] = await Promise.all([
          loadResourceMetrics(appServiceId, 'Microsoft.Web/sites', 'cpu'),
          loadResourceMetrics(appServiceId, 'Microsoft.Web/sites', 'memory'),
          loadResourceMetrics(appServiceId, 'Microsoft.Web/sites', 'responseTime'),
          loadResourceMetrics(appServiceId, 'Microsoft.Web/sites', 'requests'),
          loadResourceMetrics(appServiceId, 'Microsoft.Web/sites', 'errors')
        ]);
        
        newMetricsData.appService = {
          cpu,
          memory,
          responseTime,
          requests,
          errors
        };
      }
      
      // Load Database metrics
      if (selectedDatabase) {
        const databaseId = selectedDatabase.id;
        const [cpu, memory, storage, connections, queryPerformance, iops] = await Promise.all([
          loadResourceMetrics(databaseId, 'Microsoft.DBforPostgreSQL/servers', 'cpu'),
          loadResourceMetrics(databaseId, 'Microsoft.DBforPostgreSQL/servers', 'memory'),
          loadResourceMetrics(databaseId, 'Microsoft.DBforPostgreSQL/servers', 'storage'),
          loadResourceMetrics(databaseId, 'Microsoft.DBforPostgreSQL/servers', 'connections'),
          loadResourceMetrics(databaseId, 'Microsoft.DBforPostgreSQL/servers', 'queryPerformance'),
          loadResourceMetrics(databaseId, 'Microsoft.DBforPostgreSQL/servers', 'iops')
        ]);
        
        newMetricsData.database = {
          cpu,
          memory,
          storage,
          connections,
          queryPerformance,
          iops
        };
      }
      
      // Load Storage metrics
      if (selectedStorage) {
        const storageId = selectedStorage.id;
        const [availability, transactions, latency, capacity, ingress, egress] = await Promise.all([
          loadResourceMetrics(storageId, 'Microsoft.Storage/storageAccounts', 'availability'),
          loadResourceMetrics(storageId, 'Microsoft.Storage/storageAccounts', 'transactions'),
          loadResourceMetrics(storageId, 'Microsoft.Storage/storageAccounts', 'latency'),
          loadResourceMetrics(storageId, 'Microsoft.Storage/storageAccounts', 'capacity'),
          loadResourceMetrics(storageId, 'Microsoft.Storage/storageAccounts', 'ingress'),
          loadResourceMetrics(storageId, 'Microsoft.Storage/storageAccounts', 'egress')
        ]);
        
        newMetricsData.storage = {
          availability,
          transactions,
          latency,
          capacity,
          ingress,
          egress
        };
      }
      
      // Load Key Vault metrics
      if (selectedKeyVault) {
        const keyVaultId = selectedKeyVault.id;
        const [apiRequests, availability, latency, operationTypes, operationResults, saturation] = await Promise.all([
          loadResourceMetrics(keyVaultId, 'Microsoft.KeyVault/vaults', 'apiRequests'),
          loadResourceMetrics(keyVaultId, 'Microsoft.KeyVault/vaults', 'availability'),
          loadResourceMetrics(keyVaultId, 'Microsoft.KeyVault/vaults', 'latency'),
          loadResourceMetrics(keyVaultId, 'Microsoft.KeyVault/vaults', 'operationTypes'),
          loadResourceMetrics(keyVaultId, 'Microsoft.KeyVault/vaults', 'operationResults'),
          loadResourceMetrics(keyVaultId, 'Microsoft.KeyVault/vaults', 'saturation')
        ]);
        
        newMetricsData.keyVault = {
          apiRequests,
          availability,
          latency,
          operationTypes,
          operationResults,
          saturation
        };
      }
      
      // Load Network metrics
      if (selectedNetwork) {
        const networkId = selectedNetwork.id;
        const [throughput, latency, packetLoss, connections, securityEvents, dataTransfer] = await Promise.all([
          loadResourceMetrics(networkId, 'Microsoft.Network/virtualNetworks', 'throughput'),
          loadResourceMetrics(networkId, 'Microsoft.Network/virtualNetworks', 'latency'),
          loadResourceMetrics(networkId, 'Microsoft.Network/virtualNetworks', 'packetLoss'),
          loadResourceMetrics(networkId, 'Microsoft.Network/virtualNetworks', 'connections'),
          loadResourceMetrics(networkId, 'Microsoft.Network/virtualNetworks', 'securityEvents'),
          loadResourceMetrics(networkId, 'Microsoft.Network/virtualNetworks', 'dataTransfer')
        ]);
        
        newMetricsData.network = {
          throughput,
          latency,
          packetLoss,
          connections,
          securityEvents,
          dataTransfer
        };
      }
      
      setMetricsData(newMetricsData);
      setMetricsLoading(false);
    } catch (error) {
      console.error('Error loading all metrics:', error);
      setMetricsError('Failed to load metrics data');
      setMetricsLoading(false);
      showToast('Failed to load metrics data', 'error');
    }
  }, [
    isConnected, 
    loadResourceMetrics, 
    metricsData, 
    selectedAppService, 
    selectedDatabase, 
    selectedStorage, 
    selectedKeyVault, 
    selectedNetwork,
    showToast
  ]);
  
  // Handle time range change
  const handleTimeRangeChange = useCallback((newTimeRange) => {
  // Added display name
  handleTimeRangeChange.displayName = 'handleTimeRangeChange';

    setTimeRange(newTimeRange);
  }, []);
  
  // Handle auto refresh toggle
  const handleAutoRefreshToggle = useCallback(() => {
  // Added display name
  handleAutoRefreshToggle.displayName = 'handleAutoRefreshToggle';

    setAutoRefresh(prev => !prev);
  }, []);
  
  // Handle refresh interval change
  const handleRefreshIntervalChange = useCallback((newInterval) => {
  // Added display name
  handleRefreshIntervalChange.displayName = 'handleRefreshIntervalChange';

    setRefreshInterval(newInterval);
  }, []);
  
  // Handle resource selection
  const handleSelectResource = useCallback((resource) => {
  // Added display name
  handleSelectResource.displayName = 'handleSelectResource';

    const resourceType = resource?.type;
    
    if (!resourceType) {
      return;
    }
    
    switch (resourceType) {
      case 'Microsoft.Web/sites':
        setSelectedAppService(resource);
        break;
      case 'Microsoft.DBforPostgreSQL/servers':
        setSelectedDatabase(resource);
        break;
      case 'Microsoft.Storage/storageAccounts':
        setSelectedStorage(resource);
        break;
      case 'Microsoft.KeyVault/vaults':
        setSelectedKeyVault(resource);
        break;
      case 'Microsoft.Network/virtualNetworks':
      case 'Microsoft.Network/networkSecurityGroups':
        setSelectedNetwork(resource);
        break;
      default:
        // Unhandled resource type
        console.warn(`Unhandled resource type: ${resourceType}`);
    }
  }, []);
  
  // Load alerts
  const loadAlerts = useCallback(async () => {
  // Added display name
  loadAlerts.displayName = 'loadAlerts';

    if (!isConnected) {
      return;
    }
    
    try {
      setAlertsLoading(true);
      setAlertsError(null);
      
      const alertsData = await getAlerts();
      setAlerts(alertsData);
      
      setAlertsLoading(false);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlertsError('Failed to load alerts');
      setAlertsLoading(false);
    }
  }, [isConnected]);
  
  // Load alert history
  const loadAlertHistory = useCallback(async (alertId = null, limit = 50) => {
    if (!isConnected) {
      return;
    }
    
    try {
      setAlertHistoryLoading(true);
      
      const historyData = await getAlertHistory(alertId, limit);
      setAlertHistory(historyData);
      
      setAlertHistoryLoading(false);
    } catch (error) {
      console.error('Error loading alert history:', error);
      setAlertHistoryLoading(false);
    }
  }, [isConnected]);
  
  // Manual refresh action
  const handleRefresh = useCallback(() => {
  // Added display name
  handleRefresh.displayName = 'handleRefresh';

    loadResourceHealth();
    loadAllMetrics();
    loadAlerts();
    showToast('Refreshing monitoring data...', 'info');
  }, [loadResourceHealth, loadAllMetrics, loadAlerts, showToast]);
  
  // Load health on initial render and when Azure config changes
  useEffect(() => {
    if (isConnected && !configLoading) {
      loadResourceHealth();
    }
  }, [isConnected, configLoading, loadResourceHealth]);
  
  // Load metrics when selected resources change
  useEffect(() => {
    if (isConnected && 
        (selectedAppService || 
         selectedDatabase || 
         selectedStorage || 
         selectedKeyVault || 
         selectedNetwork)) {
      loadAllMetrics();
    }
  }, [
    isConnected, 
    loadAllMetrics, 
    selectedAppService, 
    selectedDatabase, 
    selectedStorage, 
    selectedKeyVault, 
    selectedNetwork
  ]);
  
  // Load alerts on initial render
  useEffect(() => {
    if (isConnected && !configLoading) {
      loadAlerts();
    }
  }, [isConnected, configLoading, loadAlerts]);
  
  // Handle auto refresh
  useEffect(() => {
    let intervalId;
    
    if (autoRefresh && isConnected) {
      intervalId = setInterval(() => {
        loadResourceHealth();
        loadAllMetrics();
        loadAlerts();
      }, refreshInterval);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    autoRefresh, 
    refreshInterval, 
    isConnected, 
    loadResourceHealth, 
    loadAllMetrics,
    loadAlerts
  ]);
  
  // Create the context value object
  const contextValue = {
    // State
    resourceHealth,
    healthLoading,
    healthError,
    metricsData,
    metricsLoading,
    metricsError,
    timeRange,
    autoRefresh,
    refreshInterval,
    selectedAppService,
    selectedDatabase,
    selectedStorage,
    selectedKeyVault,
    selectedNetwork,
    alerts,
    alertsLoading,
    alertsError,
    alertHistory,
    alertHistoryLoading,
    
    // Actions
    loadResourceHealth,
    loadResourceMetrics,
    loadAllMetrics,
    handleTimeRangeChange,
    handleAutoRefreshToggle,
    handleRefreshIntervalChange,
    handleSelectResource,
    handleRefresh,
    loadAlerts,
    loadAlertHistory
  };
  
  return (
    <MonitoringContext.Provider value={contextValue}>
      {children}
    </MonitoringContext.Provider>
  );
};

// Define prop types
MonitoringProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook for using the Monitoring context
export const useMonitoring = () => {
  // Added display name
  useMonitoring.displayName = 'useMonitoring';

  // Added display name
  useMonitoring.displayName = 'useMonitoring';

  // Added display name
  useMonitoring.displayName = 'useMonitoring';

  // Added display name
  useMonitoring.displayName = 'useMonitoring';

  // Added display name
  useMonitoring.displayName = 'useMonitoring';


  const context = useContext(MonitoringContext);
  
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  
  return context;
};

export default MonitoringContext;