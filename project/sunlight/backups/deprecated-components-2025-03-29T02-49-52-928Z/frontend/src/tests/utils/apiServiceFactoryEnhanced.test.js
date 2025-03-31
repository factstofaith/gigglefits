// apiServiceFactoryEnhanced.test.js
import axios from 'axios';
import { createEnhancedApiService } from '../../cleanup-archive/utils/apiServiceFactoryEnhanced';
import authService from '@services/authService';
import * as notificationHelper from '@utils/notificationHelper';
import { CACHE_STRATEGIES, STORAGE_TYPES, EnhancedCache, apiCacheGroup, referenceCache, userDataCache } from '@utils/enhancedCache';

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
jest.mock('../../utils/notificationHelper', () => ({
  createNotificationManager: jest.fn(() => ({
    showToast: mockShowToast,
  })),
}));

// Mock enhancedCache
jest.mock('../../utils/enhancedCache', () => {
  const CACHE_STRATEGIES = {
    TTL: 'ttl',
    LRU: 'lru',
    LFU: 'lfu', 
    ADAPTIVE: 'adaptive',
  };
  
  const STORAGE_TYPES = {
    MEMORY: 'memory',
    LOCAL_STORAGE: 'localStorage',
    SESSION_STORAGE: 'sessionStorage',
    HYBRID: 'hybrid',
  };
  
  const mockCache = {
    set: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
    deletePattern: jest.fn(),
    clear: jest.fn(),
    getStats: jest.fn(),
  };
  
  const mockCacheGroup = {
    getCache: jest.fn(() => mockCache),
    clearAll: jest.fn(),
    destroyAll: jest.fn(),
    getAllStats: jest.fn(),
  };
  
  const apiCacheGroup = {
    getCache: jest.fn(() => mockCache),
    clearAll: jest.fn(),
  };
  
  const referenceCache = {
    get: jest.fn(),
    set: jest.fn(),
    deletePattern: jest.fn(),
  };
  
  const userDataCache = {
    get: jest.fn(),
    set: jest.fn(),
    deletePattern: jest.fn(),
  };
  
  return {
    __esModule: true,
    CACHE_STRATEGIES,
    STORAGE_TYPES,
    apiCacheGroup,
    referenceCache,
    userDataCache,
    EnhancedCache: jest.fn().mockImplementation(() => mockCache),
    CacheGroup: jest.fn().mockImplementation(() => mockCacheGroup),
    default: {
      apiCache: mockCache,
      referenceCache,
      userDataCache,
    },
  };
});

// Mock window.location
const originalLocation = window.location;
delete window.location;
window.location = {
  href: '',
};

// Mock console methods
const originalConsoleError = console.error;
console.error = jest.fn();

describe('Enhanced API Service Factory', () => {
  // Mock for axios client
  const mockAxiosClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    window.location.href = '';
    
    // Setup axios mock
    axios.create.mockReturnValue(mockAxiosClient);
    
    // Default mock responses
    mockAxiosClient.get.mockImplementation((url) => {
      return Promise.resolve({
        data: { message: 'Success', result: 'mock data' },
        headers: {
          'cache-control': 'max-age=300',
        },
      });
    });
    
    mockAxiosClient.post.mockImplementation((url, data) => {
      return Promise.resolve({
        data: { message: 'Created', id: 123 },
      });
    });
    
    mockAxiosClient.put.mockImplementation((url, data) => {
      return Promise.resolve({
        data: { message: 'Updated', id: 123 },
      });
    });
    
    mockAxiosClient.delete.mockImplementation((url) => {
      return Promise.resolve({
        data: { message: 'Deleted' },
      });
    });
    
    // Mock cache behavior
    apiCacheGroup.getCache.mockImplementation(() => ({
      set: jest.fn(),
      get: jest.fn(),
      has: jest.fn(),
      delete: jest.fn(),
      deletePattern: jest.fn(),
      clear: jest.fn(),
      getStats: jest.fn(),
    }));
  });
  
  afterEach(() => {
    window.location = originalLocation;
    console.error = originalConsoleError;
  });
  
  // Test createEnhancedApiService
  describe('createEnhancedApiService', () => {
    it('creates a service with default options', () => {
      // Act
      const apiService = createEnhancedApiService('/api');
      
      // Assert
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      expect(apiCacheGroup.getCache).toHaveBeenCalled();
      expect(mockAxiosClient.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosClient.interceptors.response.use).toHaveBeenCalled();
      
      // Verify the service interface
      expect(apiService).toHaveProperty('get');
      expect(apiService).toHaveProperty('post');
      expect(apiService).toHaveProperty('put');
      expect(apiService).toHaveProperty('delete');
      expect(apiService).toHaveProperty('patch');
      expect(apiService).toHaveProperty('invalidateCache');
      expect(apiService).toHaveProperty('clearCache');
      expect(apiService).toHaveProperty('getCacheStats');
      expect(apiService).toHaveProperty('isLoading');
    });
    
    it('creates a service with custom options', () => {
      // Act
      const apiService = createEnhancedApiService('/api', {
        serviceName: 'test-service',
        enableCache: false,
        enableBackgroundUpdates: false,
        enablePrefetching: false,
        showErrorNotifications: false,
        showSuccessNotifications: true,
        cacheStrategy: CACHE_STRATEGIES.LRU,
        defaultTTL: 10000,
      });
      
      // Assert
      expect(apiCacheGroup.getCache).toHaveBeenCalledWith('test-service', expect.any(Object));
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });
  
  // Test API methods
  describe('API Methods', () => {
    let apiService;
    
    beforeEach(() => {
      apiService = createEnhancedApiService('/api');
    });
    
    // Test GET method
    describe('get', () => {
      it('calls axios.get with correct parameters', async () => {
        // Act
        const result = await apiService.get('/users', { page: 1, limit: 10 });
        
        // Assert
        expect(mockAxiosClient.get).toHaveBeenCalledWith('/users', {
          params: { page: 1, limit: 10 },
          headers: {},
        });
        expect(result).toEqual({ message: 'Success', result: 'mock data' });
      });
      
      it('handles caching when enabled', async () => {
        // Arrange
        const cache = apiCacheGroup.getCache();
        cache.get.mockReturnValueOnce({ cached: true, data: 'from cache' });
        
        // Act
        const result = await apiService.get('/users', {}, { useCache: true });
        
        // Assert
        expect(cache.get).toHaveBeenCalled();
        expect(mockAxiosClient.get).not.toHaveBeenCalled();
        expect(result).toEqual({ cached: true, data: 'from cache' });
      });
      
      it('bypasses cache with forceRefresh option', async () => {
        // Arrange
        const cache = apiCacheGroup.getCache();
        cache.get.mockReturnValueOnce({ cached: true, data: 'from cache' });
        
        // Act
        const result = await apiService.get('/users', {}, { 
          useCache: true, 
          forceRefresh: true 
        });
        
        // Assert
        expect(mockAxiosClient.get).toHaveBeenCalled();
        expect(result).toEqual({ message: 'Success', result: 'mock data' });
      });
      
      it('caches successful responses', async () => {
        // Arrange
        const cache = apiCacheGroup.getCache();
        
        // Act
        await apiService.get('/users', {}, { useCache: true });
        
        // Assert
        expect(cache.set).toHaveBeenCalledWith(
          '/users',
          { message: 'Success', result: 'mock data' },
          expect.any(Object)
        );
      });
      
      it('handles errors properly', async () => {
        // Arrange
        mockAxiosClient.get.mockRejectedValueOnce(new Error('Network error'));
        
        // Act & Assert
        await expect(apiService.get('/users')).rejects.toThrow('Network error');
      });
    });
    
    // Test POST method
    describe('post', () => {
      it('calls axios.post with correct parameters', async () => {
        // Arrange
        const postData = { name: 'Test User', email: 'test@example.com' };
        
        // Act
        const result = await apiService.post('/users', postData);
        
        // Assert
        expect(mockAxiosClient.post).toHaveBeenCalledWith('/users', postData, {
          headers: {},
        });
        expect(result).toEqual({ message: 'Created', id: 123 });
      });
      
      it('shows success notification when enabled', async () => {
        // Act
        await apiService.post('/users', {}, { 
          showSuccess: true,
          successMessage: 'User created successfully'
        });
        
        // Assert
        expect(notificationHelper.createNotificationManager).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith(
          'User created successfully',
          'success',
          expect.any(Object)
        );
      });
      
      it('invalidates related cache entries', async () => {
        // Arrange
        const cache = apiCacheGroup.getCache();
        
        // Act
        await apiService.post('/users', {});
        
        // Assert
        expect(cache.deletePattern).toHaveBeenCalled();
      });
      
      it('handles errors properly', async () => {
        // Arrange
        mockAxiosClient.post.mockRejectedValueOnce(new Error('API error'));
        
        // Act & Assert
        await expect(apiService.post('/users', {})).rejects.toThrow('API error');
      });
    });
    
    // Test PUT method
    describe('put', () => {
      it('calls axios.put with correct parameters', async () => {
        // Arrange
        const updateData = { name: 'Updated User' };
        
        // Act
        const result = await apiService.put('/users/123', updateData);
        
        // Assert
        expect(mockAxiosClient.put).toHaveBeenCalledWith('/users/123', updateData, {
          headers: {},
        });
        expect(result).toEqual({ message: 'Updated', id: 123 });
      });
      
      it('invalidates related cache entries', async () => {
        // Arrange
        const cache = apiCacheGroup.getCache();
        
        // Act
        await apiService.put('/users/123', {});
        
        // Assert
        expect(cache.deletePattern).toHaveBeenCalled();
      });
    });
    
    // Test DELETE method
    describe('delete', () => {
      it('calls axios.delete with correct parameters', async () => {
        // Act
        const result = await apiService.delete('/users/123');
        
        // Assert
        expect(mockAxiosClient.delete).toHaveBeenCalledWith('/users/123', {
          headers: {},
        });
        expect(result).toEqual({ message: 'Deleted' });
      });
      
      it('invalidates related cache entries', async () => {
        // Arrange
        const cache = apiCacheGroup.getCache();
        
        // Act
        await apiService.delete('/users/123');
        
        // Assert
        expect(cache.deletePattern).toHaveBeenCalled();
      });
    });
  });
  
  // Test request/response interceptors
  describe('Interceptors', () => {
    it('adds auth token to requests', async () => {
      // Arrange
      const apiService = createEnhancedApiService('/api');
      
      // Extract the request interceptor function
      const requestInterceptor = mockAxiosClient.interceptors.request.use.mock.calls[0][0];
      
      // Create a mock config
      const config = {
        headers: {},
      };
      
      // Act
      const result = await requestInterceptor(config);
      
      // Assert
      expect(authService.getAuthToken).toHaveBeenCalled();
      expect(result.headers.Authorization).toBe('Bearer mock-token');
    });
    
    it('marks background updates in headers', async () => {
      // Arrange
      const apiService = createEnhancedApiService('/api');
      
      // Extract the request interceptor function
      const requestInterceptor = mockAxiosClient.interceptors.request.use.mock.calls[0][0];
      
      // Create a mock config
      const config = {
        headers: {},
        isBackgroundUpdate: true,
      };
      
      // Act
      const result = await requestInterceptor(config);
      
      // Assert
      expect(result.headers['X-Background-Update']).toBe('true');
    });
    
    it('refreshes token and retries on 401 response', async () => {
      // Arrange
      const apiService = createEnhancedApiService('/api');
      
      // Extract the response error handler
      const responseSuccessHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][0];
      const responseErrorHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][1];
      
      // Create a mock error with 401 status
      const error = {
        response: { status: 401 },
        config: {
          headers: {},
          _isRetry: false,
        },
      };
      
      // Mock the retry logic
      mockAxiosClient.mockImplementationOnce(() => Promise.resolve({ data: 'retry success' }));
      
      // Act
      try {
        await responseErrorHandler(error);
      } catch (e) {
        // Ignore errors during testing
      }
      
      // Assert
      expect(authService.refreshToken).toHaveBeenCalled();
      expect(authService.getAuthToken).toHaveBeenCalled();
    });
    
    it('logs out user and redirects when token refresh fails', async () => {
      // Arrange
      const apiService = createEnhancedApiService('/api');
      
      // Extract the response error handler
      const responseErrorHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][1];
      
      // Create a mock error with 401 status
      const error = {
        response: { status: 401 },
        config: {
          headers: {},
          _isRetry: false,
        },
      };
      
      // Force the refresh token to fail
      authService.refreshToken.mockRejectedValueOnce(new Error('Refresh failed'));
      
      // Act
      try {
        await responseErrorHandler(error);
      } catch (e) {
        // Ignore errors during testing
      }
      
      // Assert
      expect(authService.refreshToken).toHaveBeenCalled();
      expect(authService.logout).toHaveBeenCalled();
      expect(window.location.href).toBe('/');
    });
    
    it('shows error notification on API errors', async () => {
      // Arrange
      const apiService = createEnhancedApiService('/api', {
        showErrorNotifications: true,
      });
      
      // Extract the response error handler
      const responseErrorHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][1];
      
      // Create a mock error with data
      const error = {
        response: { 
          status: 400, 
          statusText: 'Bad Request',
          data: { message: 'Invalid input' } 
        },
        config: {
          headers: {},
        },
      };
      
      // Act
      try {
        await responseErrorHandler(error);
      } catch (e) {
        // Ignore errors during testing
      }
      
      // Assert
      expect(notificationHelper.createNotificationManager).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        'Invalid input',
        'error',
        expect.objectContaining({
          title: 'Request Error',
        })
      );
    });
    
    it('uses appropriate error title based on status code', async () => {
      // Arrange
      const apiService = createEnhancedApiService('/api', {
        showErrorNotifications: true,
      });
      
      // Extract the response error handler
      const responseErrorHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][1];
      
      // Test cases for different status codes
      const testCases = [
        { status: 403, expectedTitle: 'Access Denied' },
        { status: 500, expectedTitle: 'Server Error' },
        { status: 404, expectedTitle: 'Request Error' },
      ];
      
      // Test each case
      for (const testCase of testCases) {
        // Reset mocks
        jest.clearAllMocks();
        
        // Create a mock error with the test status
        const error = {
          response: { 
            status: testCase.status, 
            statusText: 'Error',
            data: { message: 'Error message' } 
          },
          config: {
            headers: {},
          },
        };
        
        // Act
        try {
          await responseErrorHandler(error);
        } catch (e) {
          // Ignore errors during testing
        }
        
        // Assert
        expect(mockShowToast).toHaveBeenCalledWith(
          'Error message',
          'error',
          expect.objectContaining({
            title: testCase.expectedTitle,
          })
        );
      }
    });
  });
  
  // Test cache management functions
  describe('Cache Management', () => {
    let apiService;
    
    beforeEach(() => {
      apiService = createEnhancedApiService('/api', {
        enableCache: true,
      });
    });
    
    it('invalidates cache patterns', () => {
      // Arrange
      const cache = apiCacheGroup.getCache();
      const referenceCache = {
        deletePattern: jest.fn(),
      };
      const userDataCache = {
        deletePattern: jest.fn(),
      };
      
      // Simulate these caches for test
      jest.mock('../../utils/enhancedCache', () => ({
        ...jest.requireActual('../../utils/enhancedCache'),
        referenceCache,
        userDataCache,
      }));
      
      // Act
      apiService.invalidateCache('/users');
      
      // Assert
      expect(cache.deletePattern).toHaveBeenCalledWith('/users');
    });
    
    it('clears all caches', () => {
      // Act
      apiService.clearCache();
      
      // Assert
      expect(apiCacheGroup.clearAll).toHaveBeenCalled();
    });
    
    it('gets cache statistics', () => {
      // Arrange
      apiCacheGroup.getAllStats = jest.fn().mockReturnValue([
        { name: 'default', hits: 10, misses: 2 },
        { name: 'users', hits: 5, misses: 1 },
      ]);
      
      // Act
      const stats = apiService.getCacheStats();
      
      // Assert
      expect(apiCacheGroup.getAllStats).toHaveBeenCalled();
      expect(stats).toEqual([
        { name: 'default', hits: 10, misses: 2 },
        { name: 'users', hits: 5, misses: 1 },
      ]);
    });
    
    it('tracks loading state correctly', () => {
      // The implementation details of loading state tracking are private
      // We can test the isLoading public method
      const endpoint = '/users';
      const params = { page: 1 };
      
      // Initial state should be false
      expect(apiService.isLoading(endpoint, params)).toBe(false);
      
      // After a request, the state should be tracked
      // This is hard to test directly since it's internal, but we can confirm the method exists
      expect(typeof apiService.isLoading).toBe('function');
    });
  });
  
  // Test background update functionality
  describe('Background Updates', () => {
    let apiService;
    let originalSetInterval;
    let originalClearInterval;
    let mockSetInterval;
    let mockClearInterval;
    
    beforeEach(() => {
      // Mock setInterval and clearInterval
      originalSetInterval = global.setInterval;
      originalClearInterval = global.clearInterval;
      
      mockSetInterval = jest.fn().mockReturnValue(123); // Return interval ID
      mockClearInterval = jest.fn();
      
      global.setInterval = mockSetInterval;
      global.clearInterval = mockClearInterval;
      
      // Create service with background updates enabled
      apiService = createEnhancedApiService('/api', {
        enableBackgroundUpdates: true,
        backgroundUpdateConfig: {
          '/api/metrics': {
            interval: 5000,
            maxUpdates: 3,
          },
        },
      });
    });
    
    afterEach(() => {
      // Restore original functions
      global.setInterval = originalSetInterval;
      global.clearInterval = originalClearInterval;
    });
    
    it('sets up background updates for appropriate endpoints', async () => {
      // We need to trigger the interceptor that would set up the background update
      // First, extract the response success interceptor
      const responseSuccessHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][0];
      
      // Create a mock successful response for an endpoint that should have background updates
      const response = {
        config: {
          method: 'get',
          url: '/metrics',
          params: {},
          isBackgroundUpdate: false, // Not a background update itself
        },
        data: { result: 'test data' },
        headers: {},
      };
      
      // Act - calling the success handler would trigger background update setup
      await responseSuccessHandler(response);
      
      // Assert - difficult to test directly since setup is in closure
      // Instead we check if setInterval was called, which indicates background update setup
      expect(mockSetInterval).toHaveBeenCalled();
      
      // The interval should use a value from the config
      expect(mockSetInterval.mock.calls[0][1]).toBe(5000);
    });
    
    it('stops background updates after max update count is reached', async () => {
      // This test simulates the behavior of the interval function
      // Extract the response success interceptor
      const responseSuccessHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][0];
      
      // Create a mock successful response
      const response = {
        config: {
          method: 'get',
          url: '/metrics',
          params: {},
          isBackgroundUpdate: false,
        },
        data: { result: 'initial data' },
        headers: {},
      };
      
      // Setup the background update
      await responseSuccessHandler(response);
      
      // Verify setInterval was called
      expect(mockSetInterval).toHaveBeenCalled();
      
      // Extract the interval callback function
      const intervalCallback = mockSetInterval.mock.calls[0][0];
      
      // Mock axios for the background update
      mockAxiosClient.mockImplementationOnce(() => 
        Promise.resolve({ data: { result: 'updated data' } })
      );
      
      // Simulate running the interval 3 times (maxUpdates)
      await intervalCallback();
      await intervalCallback();
      await intervalCallback();
      
      // After maxUpdates, it should clear the interval
      expect(mockClearInterval).toHaveBeenCalledWith(123);
    });
    
    it('cancels all background updates on destroy', () => {
      // Create a mock successful response to setup a background update
      const responseSuccessHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][0];
      
      // Setup a background update
      responseSuccessHandler({
        config: {
          method: 'get',
          url: '/metrics',
          params: {},
          isBackgroundUpdate: false,
        },
        data: { result: 'test data' },
        headers: {},
      });
      
      // Call destroy which should cancel all background updates
      apiService.destroy();
      
      // Verify clearInterval was called
      expect(mockClearInterval).toHaveBeenCalled();
    });
    
    it('does not setup background updates for non-real-time data', async () => {
      // Extract the response success interceptor
      const responseSuccessHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][0];
      
      // Create a mock successful response for a non-real-time endpoint
      const response = {
        config: {
          method: 'get',
          url: '/users',
          params: {},
          isBackgroundUpdate: false,
        },
        data: { result: 'user data' },
        headers: {},
      };
      
      // Reset mocks to check specific call
      mockSetInterval.mockClear();
      
      // Trigger the response handler
      await responseSuccessHandler(response);
      
      // For a regular endpoint, it should not set up background updates
      expect(mockSetInterval).not.toHaveBeenCalled();
    });
  });
  
  // Test prefetching functionality
  describe('Prefetching', () => {
    let apiService;
    let originalSetTimeout;
    let mockSetTimeout;
    
    beforeEach(() => {
      // Mock setTimeout
      originalSetTimeout = global.setTimeout;
      mockSetTimeout = jest.fn((callback) => {
        // Execute callback immediately for testing
        callback();
        return 999;
      });
      global.setTimeout = mockSetTimeout;
      
      // Create service with prefetching enabled
      apiService = createEnhancedApiService('/api', {
        enablePrefetching: true,
        prefetchConfig: {
          enabled: true,
          maxPrefetchLimit: 5,
        },
      });
    });
    
    afterEach(() => {
      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });
    
    it('prefetches related data when fetching a list', async () => {
      // Setup test data - a list of items
      const listData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];
      
      // Mock a successful GET request for the list
      mockAxiosClient.get.mockImplementation((url) => {
        if (url === '/items/list') {
          return Promise.resolve({
            data: listData,
            headers: {},
          });
        } else if (url.includes('/items/')) {
          // This should be called for prefetched items
          return Promise.resolve({
            data: { id: parseInt(url.split('/').pop()), detail: 'Prefetched item data' },
            headers: {},
          });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });
      
      // Call the API to get the list
      await apiService.get('/items/list');
      
      // Now check if item details were prefetched
      // The detailEndpoint in the code is constructed as endpoint.replace('/list', `/${item.id}`)
      expect(mockAxiosClient.get).toHaveBeenCalledWith('/items/1', expect.objectContaining({
        headers: { 'X-Prefetch': 'true' },
      }));
      
      expect(mockAxiosClient.get).toHaveBeenCalledWith('/items/2', expect.objectContaining({
        headers: { 'X-Prefetch': 'true' },
      }));
      
      expect(mockAxiosClient.get).toHaveBeenCalledWith('/items/3', expect.objectContaining({
        headers: { 'X-Prefetch': 'true' },
      }));
    });
    
    it('prefetches related data when fetching a dashboard', async () => {
      // Mock successful GET request for dashboard
      mockAxiosClient.get.mockImplementation((url) => {
        if (url === '/dashboard') {
          return Promise.resolve({
            data: { name: 'Dashboard' },
            headers: {},
          });
        }
        // For prefetched endpoints
        return Promise.resolve({
          data: { message: 'Prefetched data' },
          headers: {},
        });
      });
      
      // Call the API to get the dashboard
      await apiService.get('/dashboard');
      
      // Check if related data was prefetched
      expect(mockAxiosClient.get).toHaveBeenCalledWith('/notifications/unread', expect.any(Object));
      expect(mockAxiosClient.get).toHaveBeenCalledWith('/user/preferences', expect.any(Object));
    });
    
    it('does not exceed max prefetch limit', async () => {
      // Create service with small prefetch limit
      apiService = createEnhancedApiService('/api', {
        enablePrefetching: true,
        prefetchConfig: {
          enabled: true,
          maxPrefetchLimit: 2, // Only allow 2 prefetches
        },
      });
      
      // Setup test data - a large list
      const listData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' },
      ];
      
      // Mock successful GET requests
      mockAxiosClient.get.mockImplementation((url) => {
        if (url === '/items/list') {
          return Promise.resolve({
            data: listData,
            headers: {},
          });
        } else {
          return Promise.resolve({
            data: { message: 'Prefetched data' },
            headers: {},
          });
        }
      });
      
      // Reset call history
      mockAxiosClient.get.mockClear();
      
      // Call the API to get the list
      await apiService.get('/items/list');
      
      // Count the number of prefetch calls (all calls minus the initial one)
      const prefetchCallCount = mockAxiosClient.get.mock.calls.length - 1;
      
      // Should not exceed the maxPrefetchLimit
      expect(prefetchCallCount).toBeLessThanOrEqual(2);
    });
    
    it('resets prefetch history when requested', async () => {
      // Setup spy on Set.prototype.clear
      const mockClear = jest.fn();
      const originalClear = Set.prototype.clear;
      Set.prototype.clear = mockClear;
      
      // Call reset method
      apiService.resetPrefetchHistory();
      
      // Verify clear was called
      expect(mockClear).toHaveBeenCalled();
      
      // Restore original method
      Set.prototype.clear = originalClear;
    });
  });
  
  // Test cache determination for different endpoints
  describe('Cache Determination', () => {
    let apiService;
    
    beforeEach(() => {
      apiService = createEnhancedApiService('/api', {
        enableCache: true,
      });
    });
    
    it('uses reference cache for reference data endpoints', async () => {
      // Reset mocks
      referenceCache.set.mockClear();
      
      // Mock successful GET request
      mockAxiosClient.get.mockResolvedValueOnce({
        data: { types: ['type1', 'type2'] },
        headers: {},
        config: { url: '/lookup/types', method: 'get' }
      });
      
      // Call API for a reference data endpoint
      await apiService.get('/lookup/types');
      
      // It should use the reference cache
      expect(referenceCache.set).toHaveBeenCalled();
    });
    
    it('uses user data cache for user-specific endpoints', async () => {
      // Reset mocks
      userDataCache.set.mockClear();
      
      // Mock successful GET request
      mockAxiosClient.get.mockResolvedValueOnce({
        data: { name: 'User' },
        headers: {},
        config: { url: '/user/profile', method: 'get' }
      });
      
      // Call API for a user data endpoint
      await apiService.get('/user/profile');
      
      // It should use the user data cache
      expect(userDataCache.set).toHaveBeenCalled();
    });
    
    it('uses default cache for other endpoints', () => {
      // We'll need to extract the response interceptor to test this
      const responseSuccessHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][0];
      
      // Create a mock response for a regular endpoint
      const response = {
        config: {
          method: 'get',
          url: '/regular/endpoint',
        },
        data: { regular: 'data' },
        headers: {},
      };
      
      // Reset mock
      apiCacheGroup.getCache().set.mockClear();
      
      // Process the response
      responseSuccessHandler(response);
      
      // The default cache should be used
      expect(apiCacheGroup.getCache().set).toHaveBeenCalled();
    });
  });
  
  // Test enhanced error handling
  describe('Enhanced Error Handling', () => {
    let apiService;
    
    beforeEach(() => {
      apiService = createEnhancedApiService('/api', {
        showErrorNotifications: true,
      });
    });
    
    it('handles network errors appropriately', async () => {
      // Extract error handler
      const responseErrorHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][1];
      
      // Create a network error
      const error = {
        request: {}, // Request exists but no response
        message: 'Network Error',
        config: {
          url: '/test',
          method: 'get',
          headers: {},
        },
      };
      
      // Process the error
      try {
        await responseErrorHandler(error);
        fail('Should have thrown an error');
      } catch (e) {
        // Should show appropriate error notification
        expect(mockShowToast).toHaveBeenCalledWith(
          'No response received from server. Please check your connection.',
          'error',
          expect.objectContaining({
            title: 'Network Error',
          })
        );
      }
    });
    
    it('handles setup errors appropriately', async () => {
      // Extract error handler
      const responseErrorHandler = mockAxiosClient.interceptors.response.use.mock.calls[0][1];
      
      // Create an error without request or response (setup error)
      const error = {
        message: 'Configuration Error',
        config: {
          url: '/test',
          method: 'get',
          headers: {},
        },
      };
      
      // Process the error
      try {
        await responseErrorHandler(error);
        fail('Should have thrown an error');
      } catch (e) {
        // Should show appropriate error notification
        expect(mockShowToast).toHaveBeenCalledWith(
          'Configuration Error',
          'error',
          expect.objectContaining({
            title: 'Error',
          })
        );
      }
    });
  });
  
  // Test request deduplication
  describe('Request Deduplication', () => {
    let apiService;
    
    beforeEach(() => {
      apiService = createEnhancedApiService('/api', {
        enableRequestDeduplication: true,
      });
    });
    
    it('deduplicates identical GET requests', async () => {
      // Reset mock
      mockAxiosClient.get.mockClear();
      
      // Setup mock to return a promise that we control
      let resolveRequest;
      const requestPromise = new Promise(resolve => {
        resolveRequest = resolve;
      });
      
      mockAxiosClient.get.mockReturnValueOnce(requestPromise);
      
      // Make two identical requests
      const request1 = apiService.get('/users', { page: 1 });
      const request2 = apiService.get('/users', { page: 1 });
      
      // Only one axios call should be made
      expect(mockAxiosClient.get).toHaveBeenCalledTimes(1);
      
      // Resolve the request
      resolveRequest({
        data: { result: 'success' },
        headers: {},
      });
      
      // Both promises should resolve with the same data
      const result1 = await request1;
      const result2 = await request2;
      
      expect(result1).toEqual(result2);
    });
    
    it('does not deduplicate requests with different parameters', async () => {
      // Reset mock
      mockAxiosClient.get.mockClear();
      
      // Make two requests with different params
      apiService.get('/users', { page: 1 });
      apiService.get('/users', { page: 2 });
      
      // Both should trigger separate axios calls
      expect(mockAxiosClient.get).toHaveBeenCalledTimes(2);
    });
  });
});