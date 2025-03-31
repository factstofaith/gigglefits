import axios from 'axios';
import {
  getAzureResources,
  getResourceDetails,
  getResourceTypes,
  getResourceGroups,
  getResourceHealth,
  discoverResources,
  getDiscoveryStatus
} from '../../services/azureResourceService';

// Mock axios
jest.mock('axios');

// Mock response data
const mockResources = [
  {
    id: '/subscriptions/123/resourceGroups/test-rg/providers/Microsoft.Web/sites/test-app',
    name: 'test-app',
    type: 'Microsoft.Web/sites',
    location: 'eastus',
    properties: { state: 'Running' },
    tags: { environment: 'test' }
  },
  {
    id: '/subscriptions/123/resourceGroups/test-rg/providers/Microsoft.Sql/servers/test-db',
    name: 'test-db',
    type: 'Microsoft.Sql/servers',
    location: 'eastus',
    properties: { administratorLogin: 'admin' },
    tags: { environment: 'test' }
  }
];

const mockResourceDetail = {
  id: '/subscriptions/123/resourceGroups/test-rg/providers/Microsoft.Web/sites/test-app',
  name: 'test-app',
  type: 'Microsoft.Web/sites',
  location: 'eastus',
  properties: {
    state: 'Running',
    hostNames: ['test-app.azurewebsites.net'],
    siteConfig: {
      phpVersion: '7.4',
      nodeVersion: '14.0',
      alwaysOn: true
    }
  },
  tags: {
    environment: 'test',
    tier: 'production'
  }
};

const mockResourceTypes = [
  'Microsoft.Web/sites',
  'Microsoft.Sql/servers',
  'Microsoft.Storage/storageAccounts',
  'Microsoft.KeyVault/vaults'
];

const mockResourceGroups = [
  'test-rg',
  'prod-rg',
  'dev-rg'
];

const mockHealthStatus = {
  id: '/subscriptions/123/resourceGroups/test-rg/providers/Microsoft.Web/sites/test-app',
  name: 'test-app',
  type: 'Microsoft.Web/sites',
  status: 'Available',
  details: 'The resource is healthy',
  lastChecked: '2025-04-07T12:00:00Z'
};

const mockDiscoveryResult = {
  subscription_id: '123',
  resource_group: 'test-rg',
  resource_count: 10,
  discovered_types: [
    'Microsoft.Web/sites',
    'Microsoft.Sql/servers',
    'Microsoft.Storage/storageAccounts'
  ],
  timestamp: '2025-04-07T12:05:00Z'
};

const mockDiscoveryStatus = {
  last_discovery: '2025-04-07T12:05:00Z',
  resource_count: 10,
  status: 'completed',
  duration_seconds: 45
};

describe('azureResourceService', () => {
  beforeEach(() => {
    // Clear axios mocks before each test
    jest.clearAllMocks();
  });

  describe('getAzureResources', () => {
    test('fetches all Azure resources successfully', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce({ data: mockResources });

      // Call function without resource group parameter
      const result = await getAzureResources();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure/resources');
      expect(result).toEqual(mockResources);
    });

    test('fetches resources filtered by resource group', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce({ data: mockResources });
      const resourceGroup = 'test-rg';

      // Call function with resource group parameter
      const result = await getAzureResources(resourceGroup);

      // Assertions
      expect(axios.get).toHaveBeenCalledWith(`/api/admin/monitoring/azure/resources?resource_group=${resourceGroup}`);
      expect(result).toEqual(mockResources);
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to fetch resources';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(getAzureResources()).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure/resources');
    });
  });

  describe('getResourceDetails', () => {
    test('fetches resource details successfully', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce({ data: mockResourceDetail });
      const resourceId = mockResourceDetail.id;

      // Call function
      const result = await getResourceDetails(resourceId);

      // Assertions
      expect(axios.get).toHaveBeenCalledWith(`/api/admin/monitoring/azure/resources${resourceId}`);
      expect(result).toEqual(mockResourceDetail);
    });

    test('validates required resource ID parameter', async () => {
      // Call with missing resource ID and expect it to throw
      await expect(getResourceDetails('')).rejects.toThrow('Resource ID is required');
      await expect(getResourceDetails(null)).rejects.toThrow('Resource ID is required');
      await expect(getResourceDetails(undefined)).rejects.toThrow('Resource ID is required');
      
      // Verify API was not called
      expect(axios.get).not.toHaveBeenCalled();
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Resource not found';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      const resourceId = mockResourceDetail.id;

      // Call function and expect it to throw
      await expect(getResourceDetails(resourceId)).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalledWith(`/api/admin/monitoring/azure/resources${resourceId}`);
    });
  });

  describe('getResourceTypes', () => {
    test('fetches resource types successfully', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce({ data: mockResourceTypes });

      // Call function
      const result = await getResourceTypes();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure/resource-types');
      expect(result).toEqual(mockResourceTypes);
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to fetch resource types';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(getResourceTypes()).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure/resource-types');
    });
  });

  describe('getResourceGroups', () => {
    test('fetches resource groups successfully', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce({ data: mockResourceGroups });

      // Call function
      const result = await getResourceGroups();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure/resource-groups');
      expect(result).toEqual(mockResourceGroups);
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to fetch resource groups';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(getResourceGroups()).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure/resource-groups');
    });
  });

  describe('getResourceHealth', () => {
    test('fetches resource health successfully', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce({ data: mockHealthStatus });
      const resourceId = mockHealthStatus.id;

      // Call function
      const result = await getResourceHealth(resourceId);

      // Assertions
      expect(axios.get).toHaveBeenCalledWith(`/api/admin/monitoring/azure/health${resourceId}`);
      expect(result).toEqual(mockHealthStatus);
    });

    test('validates required resource ID parameter', async () => {
      // Call with missing resource ID and expect it to throw
      await expect(getResourceHealth('')).rejects.toThrow('Resource ID is required');
      await expect(getResourceHealth(null)).rejects.toThrow('Resource ID is required');
      await expect(getResourceHealth(undefined)).rejects.toThrow('Resource ID is required');
      
      // Verify API was not called
      expect(axios.get).not.toHaveBeenCalled();
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to fetch resource health';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      const resourceId = mockHealthStatus.id;

      // Call function and expect it to throw
      await expect(getResourceHealth(resourceId)).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalledWith(`/api/admin/monitoring/azure/health${resourceId}`);
    });
  });

  describe('discoverResources', () => {
    test('discovers resources successfully', async () => {
      // Setup axios mock for successful response
      axios.post.mockResolvedValueOnce({ data: mockDiscoveryResult });

      // Call function
      const result = await discoverResources();

      // Assertions
      expect(axios.post).toHaveBeenCalledWith('/api/admin/monitoring/azure/discover');
      expect(result).toEqual(mockDiscoveryResult);
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to discover resources';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(discoverResources()).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.post).toHaveBeenCalledWith('/api/admin/monitoring/azure/discover');
    });
  });

  describe('getDiscoveryStatus', () => {
    test('fetches discovery status successfully', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce({ data: mockDiscoveryStatus });

      // Call function
      const result = await getDiscoveryStatus();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure/discover/status');
      expect(result).toEqual(mockDiscoveryStatus);
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to fetch discovery status';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(getDiscoveryStatus()).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/azure/discover/status');
    });
  });
});