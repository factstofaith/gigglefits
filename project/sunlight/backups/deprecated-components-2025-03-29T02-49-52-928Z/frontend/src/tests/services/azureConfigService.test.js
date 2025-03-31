import axios from 'axios';
import {
  getAzureConfig,
  saveAzureConfig,
  testAzureConnection,
  getAzureToken,
  checkAzureConnection,
  clearAzureConfig
} from '../../services/azureConfigService';

// Mock axios
jest.mock('axios');

// Mock config data
const mockAzureConfig = {
  tenant_id: 'mock-tenant-id',
  subscription_id: 'mock-subscription-id',
  resource_group: 'mock-resource-group',
  auth_method: 'servicePrincipal',
  client_id: 'mock-client-id',
  client_secret: 'mock-client-secret',
  refresh_interval: 60
};

// Mock API responses
const mockConfigResponse = {
  data: {
    ...mockAzureConfig,
    id: 1,
    is_connected: true,
    created_at: '2025-04-01T10:00:00Z',
    updated_at: '2025-04-07T10:00:00Z',
    last_connected_at: '2025-04-07T10:00:00Z'
  }
};

const mockSaveResponse = {
  data: {
    ...mockConfigResponse.data,
    updated_at: '2025-04-07T11:00:00Z'
  }
};

const mockConnectionTestResponse = {
  data: {
    success: true,
    message: 'Successfully connected to Azure',
    details: {
      subscription: {
        id: 'mock-subscription-id',
        name: 'Mock Subscription',
        state: 'Enabled'
      },
      resource_group: {
        name: 'mock-resource-group',
        location: 'eastus'
      }
    },
    timestamp: '2025-04-07T11:05:00Z'
  }
};

const mockTokenResponse = {
  data: {
    access_token: 'mock-access-token',
    token_type: 'Bearer',
    expires_in: 3600,
    ext_expires_in: 3600
  }
};

const mockStatusResponse = {
  data: {
    connected: true
  }
};

describe('azureConfigService', () => {
  beforeEach(() => {
    // Clear axios mocks before each test
    jest.clearAllMocks();
  });

  describe('getAzureConfig', () => {
    test('fetches Azure configuration successfully', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce(mockConfigResponse);

      // Call function
      const result = await getAzureConfig();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure-config');
      expect(result).toEqual(mockConfigResponse.data);
    });

    test('handles empty configuration gracefully', async () => {
      // Setup axios mock for empty response
      axios.get.mockResolvedValueOnce({ data: null });

      // Call function
      const result = await getAzureConfig();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure-config');
      expect(result).toBeNull();
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Configuration not found';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(getAzureConfig()).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure-config');
    });
  });

  describe('saveAzureConfig', () => {
    test('saves new Azure configuration successfully', async () => {
      // Setup axios mock for successful response with no existing config
      axios.get.mockResolvedValueOnce({ data: null });
      axios.post.mockResolvedValueOnce(mockSaveResponse);

      // Call function
      const result = await saveAzureConfig(mockAzureConfig);

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure-config');
      expect(axios.post).toHaveBeenCalledWith('/api/admin/monitoring/azure-config', mockAzureConfig);
      expect(result).toEqual(mockSaveResponse.data);
    });

    test('updates existing Azure configuration successfully', async () => {
      // Setup axios mock for successful response with existing config
      axios.get.mockResolvedValueOnce(mockConfigResponse);
      axios.put.mockResolvedValueOnce(mockSaveResponse);

      // Call function
      const result = await saveAzureConfig(mockAzureConfig);

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure-config');
      expect(axios.put).toHaveBeenCalledWith('/api/admin/monitoring/azure-config', mockAzureConfig);
      expect(result).toEqual(mockSaveResponse.data);
    });

    test('validates required Azure configuration fields', async () => {
      // Call with missing parameters and expect errors
      const incompleteConfig = {
        subscription_id: 'mock-subscription-id',
        resource_group: 'mock-resource-group',
        auth_method: 'servicePrincipal'
      };

      await expect(saveAzureConfig(incompleteConfig))
        .rejects.toThrow('Tenant ID is required');
      
      // With missing client_id for service principal
      const missingClientIdConfig = {
        tenant_id: 'mock-tenant-id',
        subscription_id: 'mock-subscription-id',
        resource_group: 'mock-resource-group',
        auth_method: 'servicePrincipal'
      };

      await expect(saveAzureConfig(missingClientIdConfig))
        .rejects.toThrow('Client ID is required for Service Principal authentication');
      
      // With missing client_secret for service principal
      const missingClientSecretConfig = {
        tenant_id: 'mock-tenant-id',
        subscription_id: 'mock-subscription-id',
        resource_group: 'mock-resource-group',
        auth_method: 'servicePrincipal',
        client_id: 'mock-client-id'
      };

      await expect(saveAzureConfig(missingClientSecretConfig))
        .rejects.toThrow('Client Secret is required for Service Principal authentication');
    });

    test('handles API errors gracefully during save', async () => {
      // Setup axios mock for failure
      axios.get.mockResolvedValueOnce(mockConfigResponse);
      const errorMessage = 'Failed to save configuration';
      axios.put.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(saveAzureConfig(mockAzureConfig)).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure-config');
      expect(axios.put).toHaveBeenCalledWith('/api/admin/monitoring/azure-config', mockAzureConfig);
    });
  });

  describe('testAzureConnection', () => {
    test('tests Azure connection successfully with configuration', async () => {
      // Setup axios mock for successful response
      axios.post.mockResolvedValueOnce(mockConnectionTestResponse);

      // Call function
      const result = await testAzureConnection(mockAzureConfig);

      // Assertions
      expect(axios.post).toHaveBeenCalledWith('/api/admin/monitoring/azure-config/test', mockAzureConfig);
      expect(result).toEqual(mockConnectionTestResponse.data);
    });

    test('tests current Azure connection successfully without configuration', async () => {
      // Setup axios mock for successful response
      axios.post.mockResolvedValueOnce(mockConnectionTestResponse);

      // Call function without config
      const result = await testAzureConnection();

      // Assertions
      expect(axios.post).toHaveBeenCalledWith('/api/admin/monitoring/azure-config/test', null);
      expect(result).toEqual(mockConnectionTestResponse.data);
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to test connection';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(testAzureConnection(mockAzureConfig)).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.post).toHaveBeenCalledWith('/api/admin/monitoring/azure-config/test', mockAzureConfig);
    });
  });

  describe('getAzureToken', () => {
    test('retrieves Azure token successfully', async () => {
      // Setup axios mock for successful response
      axios.post.mockResolvedValueOnce(mockTokenResponse);

      // Call function
      const result = await getAzureToken(mockAzureConfig.tenant_id, mockAzureConfig.client_id, mockAzureConfig.client_secret);

      // Assertions
      expect(axios.post).toHaveBeenCalledWith(
        '/api/admin/monitoring/azure-token',
        {
          tenant_id: mockAzureConfig.tenant_id,
          client_id: mockAzureConfig.client_id,
          client_secret: mockAzureConfig.client_secret
        }
      );
      expect(result).toEqual(mockTokenResponse.data.access_token);
    });

    test('retrieves Azure token from stored config if not provided', async () => {
      // Setup axios mock for successful responses
      axios.get.mockResolvedValueOnce(mockConfigResponse);
      axios.post.mockResolvedValueOnce(mockTokenResponse);

      // Call function without parameters
      const result = await getAzureToken();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure-config');
      expect(axios.post).toHaveBeenCalledWith(
        '/api/admin/monitoring/azure-token',
        {
          tenant_id: mockAzureConfig.tenant_id,
          client_id: mockAzureConfig.client_id,
          client_secret: mockAzureConfig.client_secret
        }
      );
      expect(result).toEqual(mockTokenResponse.data.access_token);
    });

    test('handles case when no configuration is available', async () => {
      // Setup axios mock for empty config response
      axios.get.mockResolvedValueOnce({ data: null });

      // Call function without parameters and expect it to throw
      await expect(getAzureToken()).rejects.toThrow('Azure configuration not found');
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure-config');
      expect(axios.post).not.toHaveBeenCalled();
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to get token';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(getAzureToken(
        mockAzureConfig.tenant_id,
        mockAzureConfig.client_id,
        mockAzureConfig.client_secret
      )).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('checkAzureConnection', () => {
    test('checks Azure connection status successfully', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce(mockStatusResponse);

      // Call function
      const result = await checkAzureConnection();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure-config/status');
      expect(result).toBe(true);
    });

    test('returns false when not connected', async () => {
      // Setup axios mock for not connected response
      axios.get.mockResolvedValueOnce({ data: { connected: false } });

      // Call function
      const result = await checkAzureConnection();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure-config/status');
      expect(result).toBe(false);
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to check connection';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      // Call function
      const result = await checkAzureConnection();

      // Assertions - should return false on error, not throw
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure-config/status');
      expect(result).toBe(false);
    });
  });

  describe('clearAzureConfig', () => {
    test('clears Azure configuration successfully', async () => {
      // Setup axios mock for successful response
      axios.delete.mockResolvedValueOnce({ data: { success: true } });

      // Call function
      const result = await clearAzureConfig();

      // Assertions
      expect(axios.delete).toHaveBeenCalledWith('/api/admin/monitoring/azure-config');
      expect(result).toBe(true);
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to clear configuration';
      axios.delete.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to return false, not throw
      const result = await clearAzureConfig();
      
      // Verify API was called
      expect(axios.delete).toHaveBeenCalledWith('/api/admin/monitoring/azure-config');
      expect(result).toBe(false);
    });
  });
});