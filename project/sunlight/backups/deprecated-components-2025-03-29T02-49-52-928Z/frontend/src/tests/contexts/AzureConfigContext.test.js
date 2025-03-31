import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AzureConfigProvider, useAzureConfig } from '@contexts/AzureConfigContext';
import * as azureConfigService from '@services/azureConfigService';
import * as azureResourceService from '@services/azureResourceService';

// Mock the services
jest.mock('../../services/azureConfigService');
jest.mock('../../services/azureResourceService');

// Test component that uses the Azure config context
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
  } = useAzureConfig();
  
  return (
    <div>
      <div data-testid="config-loading">{configLoading.toString()}</div>
      <div data-testid="resources-loading">{resourcesLoading.toString()}</div>
      <div data-testid="discovery-loading">{discoveryLoading.toString()}</div>
      <div data-testid="is-connected">{isConnected.toString()}</div>
      <div data-testid="config-error">{configError || 'no-error'}</div>
      <div data-testid="resources-error">{resourcesError || 'no-error'}</div>
      <div data-testid="resources-count">{resources.length}</div>
      <div data-testid="azure-config">{JSON.stringify(azureConfig || {})}</div>
      
      <button 
        onClick={() => saveConfiguration({ 
          tenantId: 'test-tenant', 
          clientId: 'test-client', 
          clientSecret: 'test-secret', 
          subscriptionId: 'test-subscription',
          resourceGroup: 'test-resource-group'
        })} 
        data-testid="save-config-btn"
      >
        Save Config
      </button>
      
      <button 
        onClick={() => testConnection({ 
          tenantId: 'test-tenant', 
          clientId: 'test-client' 
        })} 
        data-testid="test-connection-btn"
      >
        Test Connection
      </button>
      
      <button 
        onClick={() => loadResources('test-resource-group')} 
        data-testid="load-resources-btn"
      >
        Load Resources
      </button>
      
      <button 
        onClick={discoverResources} 
        data-testid="discover-resources-btn"
      >
        Discover Resources
      </button>
      
      <button 
        onClick={clearConfiguration} 
        data-testid="clear-config-btn"
      >
        Clear Config
      </button>
    </div>
  );
};

describe('AzureConfigContext', () => {
  // Sample mock data
  const mockAzureConfig = {
    tenantId: 'test-tenant-id',
    clientId: 'test-client-id',
    subscriptionId: 'test-subscription-id',
    resourceGroup: 'test-resource-group'
  };
  
  const mockResources = [
    { id: 'resource-1', name: 'App Service', type: 'Microsoft.Web/sites' },
    { id: 'resource-2', name: 'SQL Database', type: 'Microsoft.Sql/servers/databases' },
    { id: 'resource-3', name: 'Storage Account', type: 'Microsoft.Storage/storageAccounts' }
  ];
  
  // Setup service mocks before each test
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Default mock implementation for config service
    azureConfigService.checkAzureConnection.mockResolvedValue(true);
    azureConfigService.getAzureConfig.mockResolvedValue(mockAzureConfig);
    azureConfigService.saveAzureConfig.mockResolvedValue(mockAzureConfig);
    azureConfigService.testAzureConnection.mockResolvedValue({ success: true });
    azureConfigService.clearAzureConfig.mockResolvedValue({ success: true });
    
    // Default mock implementation for resource service
    azureResourceService.getAzureResources.mockResolvedValue(mockResources);
    azureResourceService.discoverResources.mockResolvedValue({ discovered: 3 });
  });
  
  const renderWithProvider = (ui) => {
  // Added display name
  renderWithProvider.displayName = 'renderWithProvider';

  // Added display name
  renderWithProvider.displayName = 'renderWithProvider';

  // Added display name
  renderWithProvider.displayName = 'renderWithProvider';

  // Added display name
  renderWithProvider.displayName = 'renderWithProvider';

  // Added display name
  renderWithProvider.displayName = 'renderWithProvider';


    return render(
      <AzureConfigProvider>
        {ui}
      </AzureConfigProvider>
    );
  };
  
  it('should initialize and load Azure configuration automatically', async () => {
    renderWithProvider(<TestComponent />);
    
    // Initially loading should be true
    expect(screen.getByTestId('config-loading').textContent).toBe('true');
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
      expect(screen.getByTestId('is-connected').textContent).toBe('true');
    });
    
    // Check that the services were called
    expect(azureConfigService.checkAzureConnection).toHaveBeenCalled();
    expect(azureConfigService.getAzureConfig).toHaveBeenCalled();
    expect(azureResourceService.getAzureResources).toHaveBeenCalled();
    
    // Check that state was updated correctly
    expect(screen.getByTestId('azure-config').textContent).toContain('test-tenant-id');
    expect(screen.getByTestId('resources-count').textContent).toBe('3');
  });
  
  it('should handle failures during initialization', async () => {
    // Mock a failure in the service
    azureConfigService.checkAzureConnection.mockResolvedValue(false);
    
    renderWithProvider(<TestComponent />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
      expect(screen.getByTestId('is-connected').textContent).toBe('false');
    });
    
    // Should not have loaded config or resources
    expect(azureConfigService.getAzureConfig).not.toHaveBeenCalled();
    expect(azureResourceService.getAzureResources).not.toHaveBeenCalled();
  });
  
  it('should handle errors during initialization', async () => {
    // Mock an error in the service
    azureConfigService.checkAzureConnection.mockRejectedValue(new Error('API error'));
    
    renderWithProvider(<TestComponent />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
      expect(screen.getByTestId('config-error').textContent).not.toBe('no-error');
    });
  });
  
  it('should save Azure configuration', async () => {
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
    });
    
    // Click the save config button
    await act(async () => {
      screen.getByTestId('save-config-btn').click();
    });
    
    // Should show loading during save
    expect(screen.getByTestId('config-loading').textContent).toBe('true');
    
    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
    });
    
    // Check that the service was called with the right parameters
    expect(azureConfigService.saveAzureConfig).toHaveBeenCalledWith({
      tenantId: 'test-tenant',
      clientId: 'test-client',
      clientSecret: 'test-secret',
      subscriptionId: 'test-subscription',
      resourceGroup: 'test-resource-group'
    });
    
    // Should check connection status after save
    expect(azureConfigService.checkAzureConnection).toHaveBeenCalledTimes(2); // Once on init, once after save
  });
  
  it('should handle errors when saving configuration', async () => {
    // Mock a failure in the save service
    azureConfigService.saveAzureConfig.mockRejectedValue(new Error('Save failed'));
    
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
    });
    
    // Expect save to fail
    await expect(async () => {
      await act(async () => {
        screen.getByTestId('save-config-btn').click();
      });
    }).rejects.toThrow();
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId('config-error').textContent).not.toBe('no-error');
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
    });
  });
  
  it('should test Azure connection', async () => {
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
    });
    
    // Click the test connection button
    await act(async () => {
      screen.getByTestId('test-connection-btn').click();
    });
    
    // Check that the service was called with the right parameters
    expect(azureConfigService.testAzureConnection).toHaveBeenCalledWith({
      tenantId: 'test-tenant',
      clientId: 'test-client'
    });
  });
  
  it('should handle errors during connection testing', async () => {
    // Mock a failure in the test service
    azureConfigService.testAzureConnection.mockRejectedValue(new Error('Connection test failed'));
    
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
    });
    
    // Expect test to fail
    await expect(async () => {
      await act(async () => {
        screen.getByTestId('test-connection-btn').click();
      });
    }).rejects.toThrow();
  });
  
  it('should load Azure resources', async () => {
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
    });
    
    // Reset the resources mock to simulate fresh call
    azureResourceService.getAzureResources.mockClear();
    
    // Click the load resources button
    await act(async () => {
      screen.getByTestId('load-resources-btn').click();
    });
    
    // Should show loading during resource fetch
    expect(screen.getByTestId('resources-loading').textContent).toBe('true');
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('resources-loading').textContent).toBe('false');
    });
    
    // Check that the service was called with the right parameters
    expect(azureResourceService.getAzureResources).toHaveBeenCalledWith('test-resource-group');
    expect(screen.getByTestId('resources-count').textContent).toBe('3');
  });
  
  it('should not load resources when not connected', async () => {
    // Mock not connected
    azureConfigService.checkAzureConnection.mockResolvedValue(false);
    
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
      expect(screen.getByTestId('is-connected').textContent).toBe('false');
    });
    
    // Click the load resources button
    await act(async () => {
      screen.getByTestId('load-resources-btn').click();
    });
    
    // Should not call the service
    expect(azureResourceService.getAzureResources).not.toHaveBeenCalled();
    expect(screen.getByTestId('resources-count').textContent).toBe('0');
  });
  
  it('should handle errors when loading resources', async () => {
    // Mock a failure in the resources service
    azureResourceService.getAzureResources.mockRejectedValue(new Error('Resource loading failed'));
    
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete and service mock to be reset for our explicit test
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
    });
    
    // Clear any previous resource calls (from initialization)
    azureResourceService.getAzureResources.mockClear();
    
    // Click the load resources button
    await act(async () => {
      screen.getByTestId('load-resources-btn').click();
    });
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId('resources-error').textContent).not.toBe('no-error');
      expect(screen.getByTestId('resources-loading').textContent).toBe('false');
    });
  });
  
  it('should discover Azure resources', async () => {
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
      expect(screen.getByTestId('is-connected').textContent).toBe('true');
    });
    
    // Reset mocks to clear initialization calls
    azureResourceService.discoverResources.mockClear();
    azureResourceService.getAzureResources.mockClear();
    
    // Click the discover resources button
    await act(async () => {
      screen.getByTestId('discover-resources-btn').click();
    });
    
    // Should show loading during discovery
    expect(screen.getByTestId('discovery-loading').textContent).toBe('true');
    
    // Wait for discovery to complete
    await waitFor(() => {
      expect(screen.getByTestId('discovery-loading').textContent).toBe('false');
    });
    
    // Check that the services were called
    expect(azureResourceService.discoverResources).toHaveBeenCalled();
    expect(azureResourceService.getAzureResources).toHaveBeenCalledWith(mockAzureConfig.resourceGroup);
  });
  
  it('should not discover resources when not connected', async () => {
    // Mock not connected
    azureConfigService.checkAzureConnection.mockResolvedValue(false);
    
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
      expect(screen.getByTestId('is-connected').textContent).toBe('false');
    });
    
    // Expect discover to fail
    await expect(async () => {
      await act(async () => {
        screen.getByTestId('discover-resources-btn').click();
      });
    }).rejects.toThrow();
    
    // Should not have called the service
    expect(azureResourceService.discoverResources).not.toHaveBeenCalled();
  });
  
  it('should handle errors during resource discovery', async () => {
    // Mock a failure in the discover service
    azureResourceService.discoverResources.mockRejectedValue(new Error('Discovery failed'));
    
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
      expect(screen.getByTestId('is-connected').textContent).toBe('true');
    });
    
    // Expect discover to fail
    await expect(async () => {
      await act(async () => {
        screen.getByTestId('discover-resources-btn').click();
      });
    }).rejects.toThrow();
    
    // Should have tried to call the service
    expect(azureResourceService.discoverResources).toHaveBeenCalled();
    
    // Loading should be false after error
    await waitFor(() => {
      expect(screen.getByTestId('discovery-loading').textContent).toBe('false');
    });
  });
  
  it('should clear Azure configuration', async () => {
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
      expect(screen.getByTestId('is-connected').textContent).toBe('true');
    });
    
    // Click the clear config button
    await act(async () => {
      screen.getByTestId('clear-config-btn').click();
    });
    
    // Should show loading during clear
    expect(screen.getByTestId('config-loading').textContent).toBe('true');
    
    // Wait for clear to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
    });
    
    // Check that the service was called
    expect(azureConfigService.clearAzureConfig).toHaveBeenCalled();
    
    // Check that state was updated correctly
    expect(screen.getByTestId('is-connected').textContent).toBe('false');
    expect(screen.getByTestId('azure-config').textContent).toBe('{}');
    expect(screen.getByTestId('resources-count').textContent).toBe('0');
  });
  
  it('should handle errors when clearing configuration', async () => {
    // Mock a failure in the clear service
    azureConfigService.clearAzureConfig.mockRejectedValue(new Error('Clear failed'));
    
    renderWithProvider(<TestComponent />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
    });
    
    // Expect clear to fail
    await expect(async () => {
      await act(async () => {
        screen.getByTestId('clear-config-btn').click();
      });
    }).rejects.toThrow();
    
    // Loading should be false after error
    await waitFor(() => {
      expect(screen.getByTestId('config-loading').textContent).toBe('false');
    });
  });
  
  it('should throw error when useAzureConfig is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    const ErrorComponent = () => {
  // Added display name
  ErrorComponent.displayName = 'ErrorComponent';

  // Added display name
  ErrorComponent.displayName = 'ErrorComponent';

  // Added display name
  ErrorComponent.displayName = 'ErrorComponent';

  // Added display name
  ErrorComponent.displayName = 'ErrorComponent';

  // Added display name
  ErrorComponent.displayName = 'ErrorComponent';


      useAzureConfig(); // This should throw
      return <div>This should not render</div>;
    };
    
    expect(() => {
      render(<ErrorComponent />);
    }).toThrow('useAzureConfig must be used within an AzureConfigProvider');
    
    // Restore console.error
    console.error = originalError;
  });
});