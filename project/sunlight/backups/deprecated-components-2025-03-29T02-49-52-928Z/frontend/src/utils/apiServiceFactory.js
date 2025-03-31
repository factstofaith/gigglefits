// apiServiceFactory.js
// -----------------------------------------------------------------------------
// Factory function for creating standardized API service instances

import axios from 'axios';
import authService from '@services/authService';
import { createNotificationManager } from './/notificationHelper';

// In-memory cache for API responses
const responseCache = new Map();

// In-memory tracking of loading states
const loadingStates = new Map();

// Pending requests registry for deduplication
const pendingRequests = new Map();

/**
 * Creates a standardized API service with consistent error handling,
 * loading state management, and optional caching.
 *
 * @param {string} baseUrl - Base URL for the API endpoints
 * @param {Object} options - Configuration options
 * @param {boolean} options.enableCache - Whether to enable response caching
 * @param {number} options.cacheTTL - Cache TTL in milliseconds (default: 5 minutes)
 * @param {boolean} options.showErrorNotifications - Whether to show error notifications
 * @param {boolean} options.showSuccessNotifications - Whether to show success notifications
 * @param {boolean} options.enableRequestDeduplication - Whether to deduplicate identical requests
 * @returns {Object} API service instance
 */
export const createApiService = (baseUrl, options = {}) => {
  // Added display name
  createApiService.displayName = 'createApiService';

  // Added display name
  createApiService.displayName = 'createApiService';

  // Added display name
  createApiService.displayName = 'createApiService';

  // Added display name
  createApiService.displayName = 'createApiService';

  // Added display name
  createApiService.displayName = 'createApiService';


  // Default options
  const {
    enableCache = false,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    showErrorNotifications = true,
    showSuccessNotifications = false,
    enableRequestDeduplication = true,
  } = options;

  // Create an axios instance
  const apiClient = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to include auth token
  apiClient.interceptors.request.use(async config => {
    try {
      // Set loading state for this request
      const requestId = getRequestId(config);
      loadingStates.set(requestId, true);

      // Check for duplicate requests if enabled
      if (enableRequestDeduplication && config.method.toLowerCase() === 'get') {
        const requestKey = getRequestKey(config);

        if (pendingRequests.has(requestKey)) {
          // Return the existing request promise
          config.adapter = () => pendingRequests.get(requestKey);
        }
      }

      // Use the auth service to get a fresh token if needed
      const token = await authService.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error preparing API request:', error);
      return config;
    }
  });

  // Add response interceptor to handle auth errors and caching
  apiClient.interceptors.response.use(
    response => {
      // Clear loading state
      const requestId = getRequestId(response.config);
      loadingStates.delete(requestId);

      // Clear from pending requests registry
      if (enableRequestDeduplication && response.config.method.toLowerCase() === 'get') {
        const requestKey = getRequestKey(response.config);
        pendingRequests.delete(requestKey);
      }

      // Cache the response if caching is enabled
      if (enableCache && response.config.method.toLowerCase() === 'get') {
        const cacheKey = getCacheKey(response.config);

        responseCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
          expiry: Date.now() + cacheTTL,
        });
      }

      return response;
    },
    async error => {
      // Clear loading state
      if (error.config) {
        const requestId = getRequestId(error.config);
        loadingStates.delete(requestId);

        // Clear from pending requests registry
        if (enableRequestDeduplication && error.config.method.toLowerCase() === 'get') {
          const requestKey = getRequestKey(error.config);
          pendingRequests.delete(requestKey);
        }
      }

      // Handle 401 Unauthorized errors with token refresh
      if (
        error.response &&
        error.response.status === 401 &&
        error.config &&
        !error.config._isRetry
      ) {
        try {
          // Try to refresh the token
          await authService.refreshToken();

          // Clone the original request
          const newRequest = {
            ...error.config,
            _isRetry: true,
          };

          // Get fresh token and update auth header
          const token = await authService.getAuthToken();
          if (token) {
            newRequest.headers.Authorization = `Bearer ${token}`;
          }

          // Retry the request with new token
          return apiClient(newRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);

          // Logout if refresh fails
          await authService.logout();

          // Redirect to home/login
          window.location.href = '/';
          return Promise.reject(refreshError);
        }
      }

      // Show error notification if enabled
      if (showErrorNotifications) {
        const notifications = createNotificationManager();

        // Get the error message
        let errorMessage = 'An unexpected error occurred';
        let errorTitle = 'Error';

        if (error.response) {
          // The request was made and the server responded with an error status
          errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Error ${error.response.status}: ${error.response.statusText}`;

          // Set appropriate title based on error status
          if (error.response.status === 403) {
            errorTitle = 'Access Denied';
          } else if (error.response.status >= 500) {
            errorTitle = 'Server Error';
          } else if (error.response.status >= 400) {
            errorTitle = 'Request Error';
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = 'No response received from server. Please check your connection.';
          errorTitle = 'Network Error';
        } else {
          // Something happened in setting up the request
          errorMessage = error.message || errorMessage;
        }

        // Show the error notification
        notifications.showToast(errorMessage, 'error', {
          title: errorTitle,
          duration: 8000,
        });
      }

      return Promise.reject(error);
    }
  );

  /**
   * Generate a unique ID for a request based on its URL and method
   */
  function getRequestId(config) {
  // Added display name
  getRequestId.displayName = 'getRequestId';

    return `${config.method}:${config.url}${config.params ? JSON.stringify(config.params) : ''}`;
  }

  /**
   * Generate a cache key for a request
   */
  function getCacheKey(config) {
  // Added display name
  getCacheKey.displayName = 'getCacheKey';

    return `${config.url}${config.params ? JSON.stringify(config.params) : ''}`;
  }

  /**
   * Generate a request key for deduplication
   */
  function getRequestKey(config) {
  // Added display name
  getRequestKey.displayName = 'getRequestKey';

    return `${config.method}:${config.url}${config.params ? JSON.stringify(config.params) : ''}${config.data ? JSON.stringify(config.data) : ''}`;
  }

  /**
   * Check if a cached response exists and is valid
   */
  function getValidCacheResponse(endpoint, params) {
  // Added display name
  getValidCacheResponse.displayName = 'getValidCacheResponse';

    const cacheKey = `${endpoint}${params ? JSON.stringify(params) : ''}`;

    if (responseCache.has(cacheKey)) {
      const cachedResponse = responseCache.get(cacheKey);
      if (cachedResponse.expiry > Date.now()) {
        return cachedResponse.data;
      } else {
        // Remove expired cache entry
        responseCache.delete(cacheKey);
      }
    }

    return null;
  }

  /**
   * Show a success notification
   */
  function showSuccess(message, options = {}) {
  // Added display name
  showSuccess.displayName = 'showSuccess';

    if (!showSuccessNotifications) return;

    const notifications = createNotificationManager();
    notifications.showToast(message, 'success', {
      title: options.title || 'Success',
      duration: options.duration || 3000,
      ...options,
    });
  }

  // Return the API service interface
  return {
    /**
     * HTTP GET request
     * @param {string} endpoint - API endpoint to request
     * @param {Object} params - Query parameters
     * @param {Object} options - Additional options
     * @param {boolean} options.useCache - Override global cache setting
     * @param {boolean} options.forceRefresh - Force refresh even if cached
     * @param {boolean} options.showSuccess - Show success notification
     * @param {boolean} options.showError - Show error notification
     */
    async get(endpoint, params = {}, options = {}) {
      const useCache = options.useCache ?? enableCache;
      const forceRefresh = options.forceRefresh ?? false;

      // Check cache first if enabled and not forced to refresh
      if (useCache && !forceRefresh) {
        const cachedData = getValidCacheResponse(endpoint, params);
        if (cachedData) {
          return cachedData;
        }
      }

      // Set up request configuration
      const config = {
        params,
        headers: options.headers || {},
      };

      // Register this request in the pending requests registry if enabled
      if (enableRequestDeduplication) {
        const requestKey = `get:${endpoint}${params ? JSON.stringify(params) : ''}`;

        if (pendingRequests.has(requestKey)) {
          // Return the existing request promise
          return pendingRequests.get(requestKey).then(response => response.data);
        }

        // Create the request promise
        const requestPromise = apiClient.get(endpoint, config);
        pendingRequests.set(requestKey, requestPromise);
      }

      try {
        const response = await apiClient.get(endpoint, config);

        if (options.showSuccess) {
          showSuccess(options.successMessage || 'Request completed successfully');
        }

        return response.data;
      } catch (error) {
        // Error handling is done by the interceptor
        throw error;
      }
    },

    /**
     * HTTP POST request
     * @param {string} endpoint - API endpoint to request
     * @param {Object} data - Request body data
     * @param {Object} options - Additional options
     * @param {boolean} options.showSuccess - Show success notification
     * @param {boolean} options.showError - Show error notification
     * @param {string} options.successMessage - Custom success message
     */
    async post(endpoint, data = {}, options = {}) {
      const config = {
        headers: options.headers || {},
      };

      try {
        const response = await apiClient.post(endpoint, data, config);

        // Show success notification if enabled
        if (options.showSuccess ?? showSuccessNotifications) {
          showSuccess(options.successMessage || 'Created successfully');
        }

        // Invalidate related GET cache entries if this is a mutation
        if (enableCache) {
          const cachePattern = new RegExp(`^${endpoint.split('/').slice(0, -1).join('/')}`);

          for (const key of responseCache.keys()) {
            if (cachePattern.test(key)) {
              responseCache.delete(key);
            }
          }
        }

        return response.data;
      } catch (error) {
        // Error handling is done by the interceptor
        throw error;
      }
    },

    /**
     * HTTP PUT request
     * @param {string} endpoint - API endpoint to request
     * @param {Object} data - Request body data
     * @param {Object} options - Additional options
     * @param {boolean} options.showSuccess - Show success notification
     * @param {boolean} options.showError - Show error notification
     * @param {string} options.successMessage - Custom success message
     */
    async put(endpoint, data = {}, options = {}) {
      const config = {
        headers: options.headers || {},
      };

      try {
        const response = await apiClient.put(endpoint, data, config);

        // Show success notification if enabled
        if (options.showSuccess ?? showSuccessNotifications) {
          showSuccess(options.successMessage || 'Updated successfully');
        }

        // Invalidate related GET cache entries if this is a mutation
        if (enableCache) {
          const cachePattern = new RegExp(`^${endpoint.split('/').slice(0, -1).join('/')}`);

          for (const key of responseCache.keys()) {
            if (cachePattern.test(key)) {
              responseCache.delete(key);
            }
          }
        }

        return response.data;
      } catch (error) {
        // Error handling is done by the interceptor
        throw error;
      }
    },

    /**
     * HTTP DELETE request
     * @param {string} endpoint - API endpoint to request
     * @param {Object} options - Additional options
     * @param {boolean} options.showSuccess - Show success notification
     * @param {boolean} options.showError - Show error notification
     * @param {string} options.successMessage - Custom success message
     */
    async delete(endpoint, options = {}) {
      const config = {
        headers: options.headers || {},
      };

      try {
        const response = await apiClient.delete(endpoint, config);

        // Show success notification if enabled
        if (options.showSuccess ?? showSuccessNotifications) {
          showSuccess(options.successMessage || 'Deleted successfully');
        }

        // Invalidate related GET cache entries if this is a mutation
        if (enableCache) {
          const cachePattern = new RegExp(`^${endpoint.split('/').slice(0, -1).join('/')}`);

          for (const key of responseCache.keys()) {
            if (cachePattern.test(key)) {
              responseCache.delete(key);
            }
          }
        }

        return response.data;
      } catch (error) {
        // Error handling is done by the interceptor
        throw error;
      }
    },

    /**
     * Get the loading state for an endpoint
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {boolean} Whether the endpoint is currently loading
     */
    isLoading(endpoint, params = {}) {
      const requestId = `get:${endpoint}${params ? JSON.stringify(params) : ''}`;
      return loadingStates.has(requestId);
    },

    /**
     * Invalidate cached response for an endpoint
     * @param {string} endpoint - API endpoint to invalidate
     * @param {Object} params - Query parameters to match
     * @returns {boolean} Whether any cache entries were invalidated
     */
    invalidateCache(endpoint, params = null) {
      if (!enableCache) return false;

      if (params) {
        // Invalidate specific endpoint with params
        const cacheKey = `${endpoint}${params ? JSON.stringify(params) : ''}`;
        const deleted = responseCache.delete(cacheKey);
        return deleted;
      } else {
        // Invalidate all entries starting with this endpoint
        const cachePattern = new RegExp(`^${endpoint}`);
        let invalidated = false;

        for (const key of responseCache.keys()) {
          if (cachePattern.test(key)) {
            responseCache.delete(key);
            invalidated = true;
          }
        }

        return invalidated;
      }
    },

    /**
     * Clear all cached responses
     */
    clearCache() {
      responseCache.clear();
    },
  };
};

export default createApiService;
