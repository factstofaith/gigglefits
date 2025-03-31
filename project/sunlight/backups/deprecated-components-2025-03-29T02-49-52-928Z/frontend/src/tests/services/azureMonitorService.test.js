import axios from 'axios';
import { getResourceHealth, getResourceMetrics, getStorageAnalytics, clearMetricsCache } from '@services/azureMonitorService';

// Mock axios
jest.mock('axios');

// Mock localStorage for cache testing
const localStorageMock = (() => {
  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';


  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock date for consistent timestamps
const mockDate = new Date('2025-04-07T10:00:00Z');
global.Date = jest.fn(() => mockDate);
global.Date.now = jest.fn(() => mockDate.getTime());

// Mock response data
const mockResourceHealthResponse = {
  data: {
    resources: [
      {
        id: '/subscriptions/123/resourceGroups/test-rg/providers/Microsoft.Web/sites/test-app',
        name: 'test-app',
        type: 'Microsoft.Web/sites',
        status: 'Available',
        details: 'The resource is healthy',
        lastChecked: '2025-04-07T09:00:00Z'
      },
      {
        id: '/subscriptions/123/resourceGroups/test-rg/providers/Microsoft.Sql/servers/test-db',
        name: 'test-db',
        type: 'Microsoft.Sql/servers',
        status: 'Degraded',
        details: 'The resource is experiencing performance issues',
        lastChecked: '2025-04-07T09:05:00Z'
      }
    ]
  }
};

const mockMetricsResponse = {
  data: {
    resource_id: 'appService',
    start_time: '2025-04-06T10:00:00Z',
    end_time: '2025-04-07T10:00:00Z',
    metrics: {
      'CPU Usage': [
        { timestamp: '2025-04-06T10:15:00Z', average: 45.2, minimum: 30.5, maximum: 65.8 },
        { timestamp: '2025-04-06T10:30:00Z', average: 47.6, minimum: 32.1, maximum: 68.2 }
      ],
      'Memory Usage': [
        { timestamp: '2025-04-06T10:15:00Z', average: 2048, minimum: 1536, maximum: 2560 },
        { timestamp: '2025-04-06T10:30:00Z', average: 2150, minimum: 1680, maximum: 2720 }
      ]
    }
  }
};

const mockStorageAnalyticsResponse = {
  data: {
    page_views: {
      total: 1250,
      unique_visitors: 385,
      time_series: [
        { date: '2025-04-06', views: 120 },
        { date: '2025-04-07', views: 130 }
      ]
    },
    popular_documents: [
      { name: 'Getting Started Guide', views: 450, percentage: 36 },
      { name: 'API Reference', views: 250, percentage: 20 }
    ],
    search_terms: [
      { term: 'api', count: 120 },
      { term: 'integration', count: 95 }
    ],
    storage_metrics: {
      total_size_mb: 256,
      document_count: 45,
      last_updated: '2025-04-07T09:50:00Z'
    }
  }
};

describe('azureMonitorService', () => {
  beforeEach(() => {
    // Clear axios mocks and localStorage before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('getResourceHealth', () => {
    test('fetches resource health data successfully', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce(mockResourceHealthResponse);

      // Call function
      const result = await getResourceHealth();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/resource-health');
      expect(result).toEqual(mockResourceHealthResponse.data.resources);
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Network Error';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(getResourceHealth()).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/resource-health');
    });
  });

  describe('getResourceMetrics', () => {
    const resourceId = 'appService';
    const metricNames = ['CPU Usage', 'Memory Usage'];
    const timeframe = '24h';
    
    test('fetches resource metrics successfully', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce(mockMetricsResponse);

      // Call function
      const result = await getResourceMetrics(resourceId, metricNames, timeframe);

      // Assertions
      expect(axios.get).toHaveBeenCalledWith(
        `/api/admin/monitoring/metrics?resource_id=${resourceId}&metrics=${encodeURIComponent(metricNames.join(','))}&timeframe=${timeframe}`
      );
      expect(result).toEqual(mockMetricsResponse.data);
    });

    test('returns cached data when available and fresh', async () => {
      // Setup cache with fresh data (less than 5 minutes old)
      const cacheKey = `metrics_${resourceId}_${metricNames.join(',')}_${timeframe}`;
      const cacheTime = Date.now() - 4 * 60 * 1000; // 4 minutes ago
      
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: mockMetricsResponse.data,
          timestamp: cacheTime
        })
      );

      // Call function
      const result = await getResourceMetrics(resourceId, metricNames, timeframe);

      // Assertions
      expect(axios.get).not.toHaveBeenCalled(); // Should not call API
      expect(localStorage.getItem).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(mockMetricsResponse.data);
    });

    test('fetches new data when cache is stale', async () => {
      // Setup cache with stale data (more than 5 minutes old)
      const cacheKey = `metrics_${resourceId}_${metricNames.join(',')}_${timeframe}`;
      const cacheTime = Date.now() - 6 * 60 * 1000; // 6 minutes ago
      
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: { ...mockMetricsResponse.data, stale: true },
          timestamp: cacheTime
        })
      );

      // Setup axios mock for new data
      axios.get.mockResolvedValueOnce(mockMetricsResponse);

      // Call function
      const result = await getResourceMetrics(resourceId, metricNames, timeframe);

      // Assertions
      expect(axios.get).toHaveBeenCalled(); // Should call API for fresh data
      expect(localStorage.getItem).toHaveBeenCalledWith(cacheKey);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        cacheKey,
        expect.any(String) // New cached data
      );
      expect(result).toEqual(mockMetricsResponse.data);
    });

    test('validates required parameters', async () => {
      // Call with missing parameters and expect errors
      await expect(getResourceMetrics(null, metricNames, timeframe))
        .rejects.toThrow('Resource ID is required');
      
      await expect(getResourceMetrics(resourceId, null, timeframe))
        .rejects.toThrow('Metric names are required');
      
      // With invalid timeframe, should use default
      axios.get.mockResolvedValueOnce(mockMetricsResponse);
      await getResourceMetrics(resourceId, metricNames, 'invalid');
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('timeframe=24h') // Default timeframe
      );
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to fetch metrics';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(getResourceMetrics(resourceId, metricNames, timeframe))
        .rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalled();
    });
  });

  describe('getStorageAnalytics', () => {
    const timeframe = '7d';
    
    test('fetches storage analytics successfully', async () => {
      // Setup axios mock for successful response
      axios.get.mockResolvedValueOnce(mockStorageAnalyticsResponse);

      // Call function
      const result = await getStorageAnalytics(timeframe);

      // Assertions
      expect(axios.get).toHaveBeenCalledWith(
        `/api/admin/monitoring/storage-analytics?timeframe=${timeframe}`
      );
      expect(result).toEqual(mockStorageAnalyticsResponse.data);
    });

    test('returns cached data when available and fresh', async () => {
      // Setup cache with fresh data (less than 15 minutes old)
      const cacheKey = `storage_analytics_${timeframe}`;
      const cacheTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago
      
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: mockStorageAnalyticsResponse.data,
          timestamp: cacheTime
        })
      );

      // Call function
      const result = await getStorageAnalytics(timeframe);

      // Assertions
      expect(axios.get).not.toHaveBeenCalled(); // Should not call API
      expect(localStorage.getItem).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(mockStorageAnalyticsResponse.data);
    });

    test('fetches new data when cache is stale', async () => {
      // Setup cache with stale data (more than 15 minutes old)
      const cacheKey = `storage_analytics_${timeframe}`;
      const cacheTime = Date.now() - 20 * 60 * 1000; // 20 minutes ago
      
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: { ...mockStorageAnalyticsResponse.data, stale: true },
          timestamp: cacheTime
        })
      );

      // Setup axios mock for new data
      axios.get.mockResolvedValueOnce(mockStorageAnalyticsResponse);

      // Call function
      const result = await getStorageAnalytics(timeframe);

      // Assertions
      expect(axios.get).toHaveBeenCalled(); // Should call API for fresh data
      expect(localStorage.getItem).toHaveBeenCalledWith(cacheKey);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        cacheKey,
        expect.any(String) // New cached data
      );
      expect(result).toEqual(mockStorageAnalyticsResponse.data);
    });

    test('uses default timeframe when not provided', async () => {
      // Setup axios mock
      axios.get.mockResolvedValueOnce(mockStorageAnalyticsResponse);

      // Call function without timeframe
      await getStorageAnalytics();

      // Should use default timeframe (7d)
      expect(axios.get).toHaveBeenCalledWith(
        '/api/admin/monitoring/storage-analytics?timeframe=7d'
      );
    });

    test('handles API errors gracefully', async () => {
      // Setup axios mock for failure
      const errorMessage = 'Failed to fetch storage analytics';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      // Call function and expect it to throw
      await expect(getStorageAnalytics(timeframe))
        .rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(axios.get).toHaveBeenCalled();
    });
  });

  describe('clearMetricsCache', () => {
    test('clears all metrics-related cache', () => {
      // Setup multiple cache entries
      localStorage.setItem('metrics_appService_CPU Usage_24h', 'cached data 1');
      localStorage.setItem('metrics_database_Memory Usage_7d', 'cached data 2');
      localStorage.setItem('storage_analytics_30d', 'cached data 3');
      localStorage.setItem('unrelated_cache_key', 'unrelated data');

      // Call function
      clearMetricsCache();

      // Verify metrics cache was cleared but other items remain
      expect(localStorage.getItem('metrics_appService_CPU Usage_24h')).toBeNull();
      expect(localStorage.getItem('metrics_database_Memory Usage_7d')).toBeNull();
      expect(localStorage.getItem('storage_analytics_30d')).toBeNull();
      expect(localStorage.getItem('unrelated_cache_key')).toBe('unrelated data');
    });

    test('handles empty localStorage gracefully', () => {
      // Clear localStorage first
      localStorage.clear();
      jest.clearAllMocks();

      // Call function
      clearMetricsCache();

      // Verify no errors occurred
      expect(localStorage.clear).not.toHaveBeenCalled(); // Should not clear all items
    });
  });
});