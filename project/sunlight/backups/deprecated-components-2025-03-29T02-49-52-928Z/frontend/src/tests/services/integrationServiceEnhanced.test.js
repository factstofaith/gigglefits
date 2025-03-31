// integrationServiceEnhanced.test.js
import axios from 'axios';
import integrationServiceEnhanced from '../../cleanup-archive/services/integrationServiceEnhanced';
import authService from '@services/authService';
import createEnhancedApiService from '../../cleanup-archive/utils/apiServiceFactoryEnhanced';
import * as enhancedCache from '@utils/enhancedCache';
import * as notificationHelper from '@utils/notificationHelper';

// Mock axios
jest.mock('axios');

// Mock authService
jest.mock('../../services/authService', () => ({
  getAuthToken: jest.fn().mockResolvedValue('mock-token'),
  refreshToken: jest.fn().mockResolvedValue({ token: 'refreshed-token', expiresIn: 1800 * 1000 }),
  logout: jest.fn().mockResolvedValue(true),
}));

// Mock notificationHelper
const mockShowToast = jest.fn();
const mockAddNotification = jest.fn();

jest.mock('../../utils/notificationHelper', () => ({
  createNotificationManager: jest.fn(() => ({
    showToast: mockShowToast,
    addNotification: mockAddNotification,
  })),
  initNotificationHelper: jest.fn(),
}));

// Mock enhanced API service factory
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();
const mockInvalidateCache = jest.fn();
const mockIsLoading = jest.fn();
const mockGetCacheStats = jest.fn();
const mockClearCache = jest.fn();

jest.mock('../../utils/apiServiceFactoryEnhanced', () => {
  const mockApiService = {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    invalidateCache: mockInvalidateCache,
    isLoading: mockIsLoading,
    getCacheStats: mockGetCacheStats,
    clearCache: mockClearCache,
  };
  
  return {
    __esModule: true,
    default: jest.fn(() => mockApiService),
  };
});

// Mock enhanced cache
jest.mock('../../utils/enhancedCache', () => {
  const CACHE_STRATEGIES = {
    TTL: 'ttl',
    LRU: 'lru',
    LFU: 'lfu',
    ADAPTIVE: 'adaptive',
  };
  
  return {
    CACHE_STRATEGIES,
    apiCacheGroup: {
      getCache: jest.fn(),
    },
    referenceCache: {
      get: jest.fn(),
      set: jest.fn(),
      deletePattern: jest.fn(),
    },
    userDataCache: {
      get: jest.fn(),
      set: jest.fn(),
      deletePattern: jest.fn(),
    },
  };
});

// Mock window.location
const originalLocation = window.location;
delete window.location;
window.location = {
  href: '',
};

describe('Enhanced Integration Service', () => {
  // Setup before each test
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    window.location.href = '';
    
    // Set up mock return values
    mockGet.mockImplementation((endpoint, params, options) => {
      if (endpoint.includes('/integrations')) {
        return Promise.resolve([
          { id: 1, name: 'Test Integration 1', type: 'salesforce' },
          { id: 2, name: 'Test Integration 2', type: 'azure-blob' },
        ]);
      }
      
      if (endpoint.includes('/metrics')) {
        return Promise.resolve({
          totalRuns: 42,
          successRate: 0.95,
          avgRunTime: 1200,
          lastRun: new Date().toISOString(),
        });
      }
      
      if (endpoint.includes('/templates')) {
        return Promise.resolve([
          { id: 1, name: 'HR Integration Template', description: 'Template for HR integrations' },
          { id: 2, name: 'Finance Integration Template', description: 'Template for finance integrations' },
        ]);
      }
      
      if (endpoint.includes('/runs')) {
        return Promise.resolve({
          items: [
            { id: 1, status: 'completed', startTime: '2025-03-01T10:00:00Z', endTime: '2025-03-01T10:02:30Z' },
            { id: 2, status: 'failed', startTime: '2025-03-02T15:30:00Z', endTime: '2025-03-02T15:32:45Z' },
          ],
          total: 2,
          page: 0,
          limit: 10,
        });
      }
      
      return Promise.reject(new Error(`Unexpected endpoint: ${endpoint}`));
    });
    
    mockPost.mockImplementation((endpoint, data, options) => {
      if (endpoint.includes('/run')) {
        return Promise.resolve({
          runId: 123,
          status: 'started',
          startTime: new Date().toISOString(),
        });
      }
      
      if (endpoint.includes('/duplicate')) {
        return Promise.resolve({
          id: 3,
          name: data.name,
          type: 'salesforce',
        });
      }
      
      if (endpoint === '/api/integrations') {
        return Promise.resolve({
          id: 3,
          name: data.name,
          type: data.type,
        });
      }
      
      if (endpoint.includes('/import')) {
        return Promise.resolve({
          id: 4,
          name: 'Imported Integration',
          type: 'custom',
        });
      }
      
      return Promise.reject(new Error(`Unexpected endpoint: ${endpoint}`));
    });
    
    mockPut.mockImplementation((endpoint, data, options) => {
      if (endpoint.includes('/integrations/1')) {
        return Promise.resolve({
          id: 1,
          name: data.name || 'Updated Integration',
          type: data.type || 'salesforce',
        });
      }
      
      return Promise.reject(new Error(`Unexpected endpoint: ${endpoint}`));
    });
    
    mockDelete.mockImplementation((endpoint, options) => {
      return Promise.resolve({ success: true });
    });
    
    // Set up mock cache
    mockIsLoading.mockReturnValue(false);
    mockGetCacheStats.mockReturnValue([
      { name: 'default', hits: 42, misses: 5, size: 12345 },
      { name: 'reference', hits: 100, misses: 2, size: 54321 },
    ]);
  });
  
  // Restore after each test
  afterEach(() => {
    window.location = originalLocation;
  });
  
  // Test getIntegrations
  describe('getIntegrations', () => {
    it('fetches integrations with caching enabled', async () => {
      // Act
      const result = await integrationServiceEnhanced.getIntegrations();
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith('/api/integrations', {}, { useCache: true });
      expect(result).toEqual([
        { id: 1, name: 'Test Integration 1', type: 'salesforce' },
        { id: 2, name: 'Test Integration 2', type: 'azure-blob' },
      ]);
    });
    
    it('passes filter parameters correctly', async () => {
      // Act
      await integrationServiceEnhanced.getIntegrations({ type: 'salesforce', status: 'active' });
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith(
        '/api/integrations',
        { type: 'salesforce', status: 'active' },
        { useCache: true }
      );
    });
    
    it('handles fetch errors properly', async () => {
      // Arrange
      mockGet.mockRejectedValueOnce(new Error('Network error'));
      
      // Act & Assert
      await expect(integrationServiceEnhanced.getIntegrations())
        .rejects.toThrow('Network error');
    });
  });
  
  // Test getIntegrationById
  describe('getIntegrationById', () => {
    it('fetches a specific integration by ID with caching enabled', async () => {
      // Arrange
      const integrationId = 5;
      mockGet.mockResolvedValueOnce({ id: integrationId, name: 'Specific Integration', type: 'custom' });
      
      // Act
      const result = await integrationServiceEnhanced.getIntegrationById(integrationId);
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}`,
        {},
        { useCache: true }
      );
      expect(result).toEqual({ id: integrationId, name: 'Specific Integration', type: 'custom' });
    });
  });
  
  // Test createIntegration
  describe('createIntegration', () => {
    it('creates an integration successfully with automatic notification', async () => {
      // Arrange
      const integrationData = {
        name: 'New Integration',
        type: 'custom',
        description: 'A test integration'
      };
      
      // Act
      const result = await integrationServiceEnhanced.createIntegration(integrationData);
      
      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        '/api/integrations',
        integrationData,
        {
          showSuccess: true,
          successMessage: 'Integration created successfully',
        }
      );
      expect(result).toEqual({ id: 3, name: 'New Integration', type: 'custom' });
    });
  });
  
  // Test updateIntegration
  describe('updateIntegration', () => {
    it('updates an integration successfully with automatic notification', async () => {
      // Arrange
      const integrationId = 1;
      const updateData = {
        name: 'Updated Integration',
        description: 'Updated description'
      };
      
      // Act
      const result = await integrationServiceEnhanced.updateIntegration(integrationId, updateData);
      
      // Assert
      expect(mockPut).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}`,
        updateData,
        {
          showSuccess: true,
          successMessage: 'Integration updated successfully',
        }
      );
      expect(result).toEqual({ id: 1, name: 'Updated Integration', type: 'salesforce' });
    });
  });
  
  // Test deleteIntegration
  describe('deleteIntegration', () => {
    it('deletes an integration with automatic notification', async () => {
      // Arrange
      const integrationId = 1;
      
      // Act
      const result = await integrationServiceEnhanced.deleteIntegration(integrationId);
      
      // Assert
      expect(mockDelete).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}`,
        {
          showSuccess: true,
          successMessage: 'Integration deleted successfully',
        }
      );
      expect(result).toBe(true);
    });
  });
  
  // Test runIntegration
  describe('runIntegration', () => {
    it('runs an integration with cache invalidation', async () => {
      // Arrange
      const integrationId = 1;
      const options = { params: { debug: true } };
      
      // Act
      const result = await integrationServiceEnhanced.runIntegration(integrationId, options);
      
      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}/run`,
        options,
        {
          showSuccess: true,
          successMessage: 'Integration run started successfully',
        }
      );
      expect(mockInvalidateCache).toHaveBeenCalledWith(`/api/integration-runs/${integrationId}`);
      expect(mockInvalidateCache).toHaveBeenCalledWith(`/api/integration-history/${integrationId}`);
      expect(result).toEqual({
        runId: 123,
        status: 'started',
        startTime: expect.any(String),
      });
    });
  });
  
  // Test getIntegrationRuns
  describe('getIntegrationRuns', () => {
    it('fetches integration runs with pagination and caching', async () => {
      // Arrange
      const integrationId = 1;
      const page = 2;
      const limit = 5;
      
      // Act
      const result = await integrationServiceEnhanced.getIntegrationRuns(integrationId, page, limit);
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith(
        `/api/integration-runs/${integrationId}`,
        { page, limit },
        { useCache: true }
      );
      expect(result).toEqual({
        items: [
          { id: 1, status: 'completed', startTime: '2025-03-01T10:00:00Z', endTime: '2025-03-01T10:02:30Z' },
          { id: 2, status: 'failed', startTime: '2025-03-02T15:30:00Z', endTime: '2025-03-02T15:32:45Z' },
        ],
        total: 2,
        page: 0,
        limit: 10,
      });
    });
  });
  
  // Test getIntegrationMetrics
  describe('getIntegrationMetrics', () => {
    it('fetches integration metrics with timeframe parameter', async () => {
      // Arrange
      const timeframe = '7d';
      
      // Act
      const result = await integrationServiceEnhanced.getIntegrationMetrics(null, timeframe);
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith(
        '/api/integration-metrics',
        { timeframe },
        { useCache: true, forceRefresh: false }
      );
      expect(result).toEqual({
        totalRuns: 42,
        successRate: 0.95,
        avgRunTime: 1200,
        lastRun: expect.any(String),
      });
    });
    
    it('fetches metrics for a specific integration', async () => {
      // Arrange
      const integrationId = 1;
      const timeframe = '24h';
      
      // Act
      await integrationServiceEnhanced.getIntegrationMetrics(integrationId, timeframe);
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith(
        '/api/integration-metrics',
        { timeframe, integration_id: integrationId },
        { useCache: true, forceRefresh: false }
      );
    });
  });
  
  // Test duplicateIntegration
  describe('duplicateIntegration', () => {
    it('duplicates an integration with a new name', async () => {
      // Arrange
      const integrationId = 1;
      const newName = 'Duplicated Integration';
      
      // Act
      const result = await integrationServiceEnhanced.duplicateIntegration(integrationId, newName);
      
      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}/duplicate`,
        { name: newName },
        {
          showSuccess: true,
          successMessage: 'Integration duplicated successfully',
        }
      );
      expect(result).toEqual({
        id: 3,
        name: newName,
        type: 'salesforce',
      });
    });
  });
  
  // Test importExport
  describe('Import/Export Operations', () => {
    it('exports an integration configuration', async () => {
      // Arrange
      const integrationId = 1;
      mockGet.mockResolvedValueOnce({
        id: 1,
        name: 'Exported Integration',
        type: 'salesforce',
        config: { field1: 'value1', field2: 'value2' },
      });
      
      // Act
      const result = await integrationServiceEnhanced.exportIntegration(integrationId);
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}/export`,
        {},
        {
          useCache: false,
          headers: {
            Accept: 'application/json',
          },
        }
      );
    });
    
    it('imports an integration configuration', async () => {
      // Arrange
      const integrationData = {
        name: 'Imported Integration',
        type: 'custom',
        config: { field1: 'value1', field2: 'value2' },
      };
      
      // Act
      const result = await integrationServiceEnhanced.importIntegration(integrationData);
      
      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        '/api/integrations/import',
        integrationData,
        {
          showSuccess: true,
          successMessage: 'Integration imported successfully',
        }
      );
      expect(result).toEqual({
        id: 4,
        name: 'Imported Integration',
        type: 'custom',
      });
    });
  });
  
  // Test getIntegrationTemplates
  describe('getIntegrationTemplates', () => {
    it('fetches templates with optional category filter', async () => {
      // Arrange
      const category = 'HR';
      
      // Act
      const result = await integrationServiceEnhanced.getIntegrationTemplates(category);
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith(
        '/api/integration-templates',
        { category },
        {
          useCache: true,
          forceRefresh: false,
        }
      );
      expect(result).toEqual([
        { id: 1, name: 'HR Integration Template', description: 'Template for HR integrations' },
        { id: 2, name: 'Finance Integration Template', description: 'Template for finance integrations' },
      ]);
    });
    
    it('fetches all templates when no category is provided', async () => {
      // Act
      await integrationServiceEnhanced.getIntegrationTemplates();
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith(
        '/api/integration-templates',
        {},
        {
          useCache: true,
          forceRefresh: false,
        }
      );
    });
  });
  
  // Test cache management
  describe('Cache Management', () => {
    it('checks if a request is loading', () => {
      // Arrange
      mockIsLoading.mockReturnValueOnce(true);
      
      // Act
      const result = integrationServiceEnhanced.isLoading('/api/integrations', { type: 'salesforce' });
      
      // Assert
      expect(mockIsLoading).toHaveBeenCalledWith('/api/integrations', { type: 'salesforce' });
      expect(result).toBe(true);
    });
    
    it('retrieves cache statistics', () => {
      // Act
      const result = integrationServiceEnhanced.getCacheStats();
      
      // Assert
      expect(mockGetCacheStats).toHaveBeenCalled();
      expect(result).toEqual([
        { name: 'default', hits: 42, misses: 5, size: 12345 },
        { name: 'reference', hits: 100, misses: 2, size: 54321 },
      ]);
    });
    
    it('clears the entire cache', () => {
      // Act
      integrationServiceEnhanced.clearCache();
      
      // Assert
      expect(mockClearCache).toHaveBeenCalled();
    });
  });
  
  // Test force refresh
  describe('Force Refresh', () => {
    it('invalidates cache and refetches integration data', async () => {
      // Arrange
      const integrationId = 1;
      mockGet.mockResolvedValueOnce({ id: 1, name: 'Refreshed Integration', type: 'salesforce' });
      
      // Act
      const result = await integrationServiceEnhanced.forceRefreshIntegration(integrationId);
      
      // Assert
      expect(mockInvalidateCache).toHaveBeenCalledWith(`/api/integrations/${integrationId}`);
      expect(mockInvalidateCache).toHaveBeenCalledWith(`/api/integration-runs/${integrationId}`);
      expect(mockInvalidateCache).toHaveBeenCalledWith(`/api/integration-history/${integrationId}`);
      expect(mockGet).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}`,
        {},
        { useCache: true }
      );
      expect(result).toEqual({ id: 1, name: 'Refreshed Integration', type: 'salesforce' });
    });
  });
  
  // Test api factory creation
  describe('API Factory Creation', () => {
    it('creates an API service with the correct configuration', () => {
      // Assert that createEnhancedApiService was called with correct arguments
      expect(createEnhancedApiService).toHaveBeenCalledWith('/api', {
        serviceName: 'integration-service',
        enableCache: true,
        enableBackgroundUpdates: true,
        enablePrefetching: true,
        showErrorNotifications: true,
        showSuccessNotifications: true,
        cacheStrategy: enhancedCache.CACHE_STRATEGIES.ADAPTIVE,
        defaultTTL: 5 * 60 * 1000, // 5 minutes
        backgroundUpdateConfig: expect.any(Object),
        prefetchConfig: {
          enabled: true,
          maxPrefetchLimit: 15,
        },
      });
      
      // Check background update config
      const callArgs = createEnhancedApiService.mock.calls[0][1];
      expect(callArgs.backgroundUpdateConfig['/api/integration-metrics'].interval).toBe(30 * 1000);
      expect(callArgs.backgroundUpdateConfig['/api/integration-runs'].interval).toBe(60 * 1000);
    });
  });
});