import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { MonitoringProvider, useMonitoring } from '@contexts/MonitoringContext';
import { AzureConfigProvider } from '@contexts/AzureConfigContext';
import { NotificationProvider } from '@contexts/NotificationContext';
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
} from '../../services/azureMonitorService';

// Mock the azureMonitorService
jest.mock('../../services/azureMonitorService');

// Mock the useAzureConfig hook
jest.mock('../../contexts/AzureConfigContext', () => {
  const originalModule = jest.requireActual('../../contexts/AzureConfigContext');
  
  return {
    ...originalModule,
    useAzureConfig: () => ({
      isConnected: true,
      configLoading: false,
      configError: null,
      resources: [
        { id: 'app-service-id', name: 'Test App Service', type: 'Microsoft.Web/sites' },
        { id: 'database-id', name: 'Test Database', type: 'Microsoft.DBforPostgreSQL/servers' },
        { id: 'storage-id', name: 'Test Storage', type: 'Microsoft.Storage/storageAccounts' },
        { id: 'keyvault-id', name: 'Test Key Vault', type: 'Microsoft.KeyVault/vaults' },
        { id: 'network-id', name: 'Test Network', type: 'Microsoft.Network/virtualNetworks' }
      ]
    }),
    AzureConfigProvider: ({ children }) => children,
  };
});

// Mock the useNotification hook
jest.mock('../../hooks/useNotification', () => {
  const mockShowToast = jest.fn();
  return {
    useNotification: () => ({
      showToast: mockShowToast
    }),
  };
});

// Test component that uses the monitoring context
const TestComponent = () => {
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


  const { 
    resourceHealth, 
    healthLoading,
    healthError,
    alerts,
    alertsLoading,
    alertHistory,
    alertHistoryLoading,
    metricsData,
    metricsLoading,
    metricsError,
    autoRefresh,
    refreshInterval,
    selectedAppService,
    selectedDatabase,
    selectedStorage,
    selectedKeyVault,
    selectedNetwork,
    loadResourceHealth,
    loadAlerts,
    loadAlertHistory,
    loadAllMetrics,
    handleRefresh,
    timeRange,
    handleTimeRangeChange,
    handleAutoRefreshToggle,
    handleRefreshIntervalChange,
    handleSelectResource
  } = useMonitoring();
  
  return (
    <div>
      <div data-testid="health-loading">{healthLoading.toString()}</div>
      <div data-testid="health-error">{healthError || 'no-error'}</div>
      <div data-testid="alerts-loading">{alertsLoading.toString()}</div>
      <div data-testid="metrics-loading">{metricsLoading.toString()}</div>
      <div data-testid="metrics-error">{metricsError || 'no-error'}</div>
      <div data-testid="time-range">{timeRange}</div>
      <div data-testid="auto-refresh">{autoRefresh.toString()}</div>
      <div data-testid="refresh-interval">{refreshInterval}</div>
      <div data-testid="resource-count">{Object.keys(resourceHealth).length}</div>
      <div data-testid="alerts-count">{alerts.length}</div>
      <div data-testid="alert-history-count">{alertHistory.length}</div>
      <div data-testid="alert-history-loading">{alertHistoryLoading.toString()}</div>
      <div data-testid="metrics-keys">{Object.keys(metricsData).join(',') || 'no-metrics'}</div>
      <div data-testid="selected-app-service">{selectedAppService?.name || 'none'}</div>
      <div data-testid="selected-database">{selectedDatabase?.name || 'none'}</div>
      <div data-testid="selected-storage">{selectedStorage?.name || 'none'}</div>
      <div data-testid="selected-keyvault">{selectedKeyVault?.name || 'none'}</div>
      <div data-testid="selected-network">{selectedNetwork?.name || 'none'}</div>
      
      <button onClick={loadResourceHealth} data-testid="load-health-btn">Load Health</button>
      <button onClick={loadAlerts} data-testid="load-alerts-btn">Load Alerts</button>
      <button onClick={() => loadAlertHistory('alert-1')} data-testid="load-history-btn">Load Alert History</button>
      <button onClick={loadAllMetrics} data-testid="load-metrics-btn">Load Metrics</button>
      <button onClick={handleRefresh} data-testid="refresh-btn">Refresh</button>
      <button onClick={() => handleTimeRangeChange('1h')} data-testid="change-time-btn">Change Time</button>
      <button onClick={handleAutoRefreshToggle} data-testid="toggle-auto-refresh-btn">Toggle Auto Refresh</button>
      <button onClick={() => handleRefreshIntervalChange(30000)} data-testid="change-interval-btn">Change Interval</button>
      <button onClick={() => handleSelectResource({ id: 'app-service-id', name: 'Test App Service', type: 'Microsoft.Web/sites' })} data-testid="select-app-service-btn">Select App Service</button>
      <button onClick={() => handleSelectResource({ id: 'database-id', name: 'Test Database', type: 'Microsoft.DBforPostgreSQL/servers' })} data-testid="select-database-btn">Select Database</button>
      <button onClick={() => handleSelectResource({ id: 'storage-id', name: 'Test Storage', type: 'Microsoft.Storage/storageAccounts' })} data-testid="select-storage-btn">Select Storage</button>
      <button onClick={() => handleSelectResource({ id: 'keyvault-id', name: 'Test Key Vault', type: 'Microsoft.KeyVault/vaults' })} data-testid="select-keyvault-btn">Select Key Vault</button>
      <button onClick={() => handleSelectResource({ id: 'network-id', name: 'Test Network', type: 'Microsoft.Network/virtualNetworks' })} data-testid="select-network-btn">Select Network</button>
    </div>
  );
};

describe('MonitoringContext', () => {
  // Sample data for mocks
  const mockResourceHealth = {
    'app-service-id': { resourceId: 'app-service-id', status: 'Available' },
    'database-id': { resourceId: 'database-id', status: 'Available' },
    'storage-id': { resourceId: 'storage-id', status: 'Available' },
    'keyvault-id': { resourceId: 'keyvault-id', status: 'Available' },
    'network-id': { resourceId: 'network-id', status: 'Available' }
  };
  
  const mockAlerts = [
    { id: 'alert-1', name: 'High CPU Usage', severity: 'critical' },
    { id: 'alert-2', name: 'Low Storage Space', severity: 'warning' }
  ];
  
  const mockAlertHistory = [
    { id: 'history-1', alertId: 'alert-1', timestamp: '2025-03-24T12:00:00Z', status: 'triggered' },
    { id: 'history-2', alertId: 'alert-1', timestamp: '2025-03-24T14:00:00Z', status: 'resolved' },
    { id: 'history-3', alertId: 'alert-2', timestamp: '2025-03-24T16:00:00Z', status: 'triggered' }
  ];
  
  const mockMetricsData = {
    cpu: { data: [10, 20, 30, 40, 50], timestamps: ['t1', 't2', 't3', 't4', 't5'] },
    memory: { data: [40, 45, 50, 55, 60], timestamps: ['t1', 't2', 't3', 't4', 't5'] },
    responseTime: { data: [150, 160, 170, 180, 190], timestamps: ['t1', 't2', 't3', 't4', 't5'] },
    requests: { data: [100, 120, 140, 160, 180], timestamps: ['t1', 't2', 't3', 't4', 't5'] },
    errors: { data: [1, 2, 1, 0, 1], timestamps: ['t1', 't2', 't3', 't4', 't5'] }
  };
  
  // Setup service mocks
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock resource health
    getResourceHealth.mockImplementation((resourceId) => {
      return Promise.resolve(mockResourceHealth[resourceId] || 
        { resourceId, status: 'Unknown' });
    });
    
    // Mock metrics
    getResourceMetrics.mockResolvedValue({ data: [1, 2, 3], timestamps: ['t1', 't2', 't3'] });
    getAppServiceMetrics.mockImplementation((resourceId, metricName) => {
      return Promise.resolve(mockMetricsData[metricName] || 
        { data: [1, 2, 3], timestamps: ['t1', 't2', 't3'] });
    });
    getDatabaseMetrics.mockResolvedValue({ data: [4, 5, 6], timestamps: ['t1', 't2', 't3'] });
    getStorageMetrics.mockResolvedValue({ data: [7, 8, 9], timestamps: ['t1', 't2', 't3'] });
    getKeyVaultMetrics.mockResolvedValue({ data: [10, 11, 12], timestamps: ['t1', 't2', 't3'] });
    getNetworkMetrics.mockResolvedValue({ data: [13, 14, 15], timestamps: ['t1', 't2', 't3'] });
    
    // Mock alerts
    getAlerts.mockResolvedValue(mockAlerts);
    getAlertHistory.mockImplementation((alertId) => {
      if (alertId) {
        return Promise.resolve(mockAlertHistory.filter(h => h.alertId === alertId));
      }
      return Promise.resolve(mockAlertHistory);
    });
  });
  
  const renderWithProviders = (ui) => {
  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';


    return render(
      <NotificationProvider>
        <AzureConfigProvider>
          <MonitoringProvider>
            {ui}
          </MonitoringProvider>
        </AzureConfigProvider>
      </NotificationProvider>
    );
  };
  
  it('should initialize with default values', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('health-loading').textContent).toBe('false');
    expect(screen.getByTestId('health-error').textContent).toBe('no-error');
    expect(screen.getByTestId('alerts-loading').textContent).toBe('false');
    expect(screen.getByTestId('time-range').textContent).toBe('24h');
    expect(screen.getByTestId('resource-count').textContent).toBe('0');
    expect(screen.getByTestId('alerts-count').textContent).toBe('0');
  });
  
  it('should load resource health data', async () => {
    // Mock the getResourceHealth to return multiple resources
    getResourceHealth.mockImplementation((resourceId) => {
      return Promise.resolve(mockResourceHealth[resourceId]);
    });
    
    renderWithProviders(<TestComponent />);
    
    // Click the load health button
    await act(async () => {
      screen.getByTestId('load-health-btn').click();
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(getResourceHealth).toHaveBeenCalled();
      expect(screen.getByTestId('health-loading').textContent).toBe('false');
    });
  });
  
  it('should load alerts', async () => {
    renderWithProviders(<TestComponent />);
    
    // Click the load alerts button
    await act(async () => {
      screen.getByTestId('load-alerts-btn').click();
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(getAlerts).toHaveBeenCalled();
      expect(screen.getByTestId('alerts-loading').textContent).toBe('false');
      expect(screen.getByTestId('alerts-count').textContent).toBe('2');
    });
  });
  
  it('should handle refresh', async () => {
    renderWithProviders(<TestComponent />);
    
    // Click the refresh button
    await act(async () => {
      screen.getByTestId('refresh-btn').click();
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(getResourceHealth).toHaveBeenCalled();
      expect(getAlerts).toHaveBeenCalled();
    });
  });
  
  it('should change time range', async () => {
    renderWithProviders(<TestComponent />);
    
    // Click the change time button
    await act(async () => {
      screen.getByTestId('change-time-btn').click();
    });
    
    // Check that time range has changed
    expect(screen.getByTestId('time-range').textContent).toBe('1h');
  });
  
  it('should handle errors when loading resource health', async () => {
    // Mock API failure
    getResourceHealth.mockRejectedValue(new Error('API error'));
    
    renderWithProviders(<TestComponent />);
    
    // Click the load health button
    await act(async () => {
      screen.getByTestId('load-health-btn').click();
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('health-loading').textContent).toBe('false');
      expect(screen.getByTestId('health-error').textContent).not.toBe('no-error');
    });
  });
  
  it('should handle errors when loading alerts', async () => {
    // Mock API failure
    getAlerts.mockRejectedValue(new Error('API error'));
    
    renderWithProviders(<TestComponent />);
    
    // Click the load alerts button
    await act(async () => {
      screen.getByTestId('load-alerts-btn').click();
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('alerts-loading').textContent).toBe('false');
      expect(screen.getByTestId('alerts-count').textContent).toBe('0');
    });
  });
});