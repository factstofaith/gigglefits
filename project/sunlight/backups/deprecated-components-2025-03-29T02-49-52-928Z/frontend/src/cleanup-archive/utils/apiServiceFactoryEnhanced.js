// apiServiceFactoryEnhanced.js
// -----------------------------------------------------------------------------
// Enhanced factory function for creating standardized API service instances
// with improved caching, prefetching, and background synchronization

import axios from 'axios';
import authService from '../services/authService';
import { createNotificationManager } from './notificationHelper';
import { apiCacheGroup, referenceCache, userDataCache, CACHE_STRATEGIES } from './enhancedCache';

// In-memory tracking of loading states
const loadingStates = new Map();

// Pending requests registry for deduplication
const pendingRequests = new Map();

// Cache identifier patterns for different types of data
const CACHE_PATTERNS = {
  // Reference data patterns (long-lived cache)
  REFERENCE: [/\/lookup\//, /\/types\//, /\/codes\//, /\/categories\//, /\/settings\//],

  // User-specific data patterns (shorter-lived cache)
  USER_DATA: [/\/user\//, /\/profile\//, /\/preferences\//],

  // Real-time data patterns (minimal caching)
  REAL_TIME: [/\/status\//, /\/metrics\//, /\/notifications\//, /\/activity\//],
};

/**
 * Determines the appropriate cache for an endpoint
 * @param {string} endpoint - The API endpoint
 * @returns {Object} The cache instance to use
 */
function determineCache(endpoint) {
  // Added display name
  determineCache.displayName = 'determineCache';

  // Check reference data patterns
  for (const pattern of CACHE_PATTERNS.REFERENCE) {
    if (pattern.test(endpoint)) {
      return referenceCache;
    }
  }

  // Check user data patterns
  for (const pattern of CACHE_PATTERNS.USER_DATA) {
    if (pattern.test(endpoint)) {
      return userDataCache;
    }
  }

  // Default to API cache
  return apiCacheGroup.getCache('default');
}

/**
 * Generates background update configuration for an endpoint
 * @param {string} endpoint - The API endpoint
 * @returns {Object|null} Background update configuration or null if not applicable
 */
function getBackgroundUpdateConfig(endpoint) {
  // Added display name
  getBackgroundUpdateConfig.displayName = 'getBackgroundUpdateConfig';

  // Real-time data should have background updates
  for (const pattern of CACHE_PATTERNS.REAL_TIME) {
    if (pattern.test(endpoint)) {
      return {
        interval: 15 * 1000, // 15 seconds
        maxUpdates: 10, // Max 10 background updates
      };
    }
  }

  // User data should have occasional background updates
  for (const pattern of CACHE_PATTERNS.USER_DATA) {
    if (pattern.test(endpoint)) {
      return {
        interval: 60 * 1000, // 1 minute
        maxUpdates: 5, // Max 5 background updates
      };
    }
  }

  // Reference data typically doesn't need background updates
  return null;
}

/**
 * Creates an enhanced API service with improved caching, background updates,
 * and performance optimizations.
 *
 * @param {string} baseUrl - Base URL for the API endpoints
 * @param {Object} options - Configuration options
 * @returns {Object} Enhanced API service instance
 */
export const createEnhancedApiService = (baseUrl, options = {}) => {
  // Added display name
  createEnhancedApiService.displayName = 'createEnhancedApiService';

  // Added display name
  createEnhancedApiService.displayName = 'createEnhancedApiService';

  // Added display name
  createEnhancedApiService.displayName = 'createEnhancedApiService';

  // Added display name
  createEnhancedApiService.displayName = 'createEnhancedApiService';

  // Added display name
  createEnhancedApiService.displayName = 'createEnhancedApiService';


  // Default options with enhanced defaults
  const {
    enableCache = true,
    enableBackgroundUpdates = true,
    enablePrefetching = true,
    enableRequestDeduplication = true,
    showErrorNotifications = true,
    showSuccessNotifications = false,
    cacheStrategy = CACHE_STRATEGIES.ADAPTIVE,
    defaultTTL = 5 * 60 * 1000, // 5 minutes
    backgroundUpdateConfig = {},
    prefetchConfig = {
      enabled: true,
      maxPrefetchLimit: 10,
    },
    debug = false,
  } = options;

  // Background update registrations
  const backgroundUpdates = new Map();

  // Prefetch tracking
  const prefetchHistory = new Set();

  // Create an axios instance
  const apiClient = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Create a service-specific cache group if requested
  const serviceCacheGroup = apiCacheGroup.getCache(
    options.serviceName || baseUrl.replace(/[^a-z0-9]/gi, '-'),
    {
      strategy: cacheStrategy,
      defaultTTL: defaultTTL,
    }
  );

  // Add request interceptor to include auth token
  apiClient.interceptors.request.use(async config => {
    try {
      // Set loading state for this request
      const requestId = getRequestId(config);
      loadingStates.set(requestId, true);

      // Mark if this is a background update
      if (config.isBackgroundUpdate) {
        config.headers['X-Background-Update'] = 'true';
      }

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

      // Handle caching if enabled and it's a GET request
      if (enableCache && response.config.method.toLowerCase() === 'get') {
        const cacheKey = getCacheKey(response.config);
        const endpoint = response.config.url;
        const cache = determineCache(endpoint);

        // If there's a max-age header, use it for TTL
        let ttl = defaultTTL;
        const cacheControl = response.headers['cache-control'];
        if (cacheControl) {
          const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
          if (maxAgeMatch && maxAgeMatch[1]) {
            ttl = parseInt(maxAgeMatch[1], 10) * 1000; // Convert seconds to ms
          }
        }

        // Cache the response
        cache.set(cacheKey, response.data, { ttl });

        // Set up background updates if enabled
        if (enableBackgroundUpdates && !response.config.isBackgroundUpdate) {
          setupBackgroundUpdate(response.config, response.data);
        }
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
   * Setup background update for a request
   */
  function setupBackgroundUpdate(config, initialData) {
  // Added display name
  setupBackgroundUpdate.displayName = 'setupBackgroundUpdate';

    if (!enableBackgroundUpdates) return;

    const endpoint = config.url;
    const updateConfig = backgroundUpdateConfig[endpoint] || getBackgroundUpdateConfig(endpoint);

    // If this endpoint doesn't need background updates, skip
    if (!updateConfig) return;

    const requestKey = getRequestKey(config);

    // If there's already a background update for this request, clear it
    if (backgroundUpdates.has(requestKey)) {
      clearInterval(backgroundUpdates.get(requestKey).intervalId);
    }

    // Create a new background update
    let updateCount = 0;
    const maxUpdates = updateConfig.maxUpdates || 5;
    const interval = updateConfig.interval || 30000;

    // Create a clone of the config for background updates
    const updateConfig2 = {
      ...config,
      isBackgroundUpdate: true,
      headers: { ...config.headers },
    };

    // Set up interval for background updates
    const intervalId = setInterval(async () => {
      try {
        // Stop after max updates
        if (updateCount >= maxUpdates) {
          clearInterval(intervalId);
          backgroundUpdates.delete(requestKey);
          return;
        }

        // Perform background update
        const response = await apiClient(updateConfig2);
        updateCount++;

        // Update cache with new data
        if (enableCache) {
          const cacheKey = getCacheKey(config);
          const cache = determineCache(endpoint);
          cache.set(cacheKey, response.data);
        }

        if (debug) {
            `[ApiService] Background update ${updateCount}/${maxUpdates} for ${endpoint}`
          );
        }
      } catch (error) {
        // Log error but don't show notification for background updates
        console.error(`Background update failed for ${endpoint}:`, error);
      }
    }, interval);

    // Store update info
    backgroundUpdates.set(requestKey, {
      intervalId,
      endpoint,
      initialData,
      startTime: Date.now(),
    });
  }

  /**
   * Perform intelligent prefetching based on the current request
   */
  function handlePrefetching(endpoint, data) {
  // Added display name
  handlePrefetching.displayName = 'handlePrefetching';

    if (!enablePrefetching || !prefetchConfig.enabled) return;

    // Limit total number of prefetches to avoid overwhelming the client
    if (prefetchHistory.size >= prefetchConfig.maxPrefetchLimit) return;

    // Define prefetch patterns based on endpoint and data
    const prefetchPatterns = [];

    // Example: If fetching a list of items, prefetch the first few items' details
    if (endpoint.includes('/list') && Array.isArray(data) && data.length > 0) {
      const itemsToFetch = Math.min(3, data.length);

      for (let i = 0; i < itemsToFetch; i++) {
        const item = data[i];
        if (item && item.id) {
          const detailEndpoint = endpoint.replace('/list', `/${item.id}`);
          prefetchPatterns.push({ endpoint: detailEndpoint });
        }
      }
    }

    // Example: If fetching a dashboard, prefetch common related data
    if (endpoint.includes('/dashboard')) {
      prefetchPatterns.push(
        { endpoint: '/notifications/unread' },
        { endpoint: '/user/preferences' }
      );
    }

    // Execute prefetches
    for (const pattern of prefetchPatterns) {
      const prefetchEndpoint = pattern.endpoint;

      // Skip if already prefetched
      if (prefetchHistory.has(prefetchEndpoint)) continue;

      // Mark as prefetched
      prefetchHistory.add(prefetchEndpoint);

      // Perform prefetch with low priority
      setTimeout(() => {
        apiClient
          .get(prefetchEndpoint, {
            headers: { 'X-Prefetch': 'true' },
            params: pattern.params || {},
          })
          .then(response => {
            if (debug) {
            }

            // Cache the prefetched data
            if (enableCache) {
              const cacheKey =
                prefetchEndpoint + (pattern.params ? JSON.stringify(pattern.params) : '');
              const cache = determineCache(prefetchEndpoint);
              cache.set(cacheKey, response.data);
            }
          })
          .catch(error => {
            // Silently log prefetch errors, don't notify user
            console.error(`Prefetch failed for ${prefetchEndpoint}:`, error);
          });
      }, 100); // Small delay to prioritize main requests
    }
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

  /**
   * Get a valid cached response for an endpoint
   */
  function getValidCachedResponse(endpoint, params) {
  // Added display name
  getValidCachedResponse.displayName = 'getValidCachedResponse';

    if (!enableCache) return null;

    const cacheKey = `${endpoint}${params ? JSON.stringify(params) : ''}`;
    const cache = determineCache(endpoint);

    return cache.get(cacheKey);
  }

  /**
   * Perform cache invalidation for related endpoints
   */
  function invalidateRelatedCache(endpoint, method) {
  // Added display name
  invalidateRelatedCache.displayName = 'invalidateRelatedCache';

    if (!enableCache) return;

    // For mutation requests (POST, PUT, DELETE)
    if (['post', 'put', 'delete'].includes(method.toLowerCase())) {
      // Get the base API path to invalidate
      const pathParts = endpoint.split('/');

      // Remove the ID segment if it exists
      // e.g., /api/users/123 -> /api/users
      const basePath =
        pathParts.length > 2 && !isNaN(pathParts[pathParts.length - 1])
          ? pathParts.slice(0, -1).join('/')
          : pathParts.join('/');

      // Invalidate all endpoints that start with this base path
      // This includes list views, detail views, etc.
      invalidateCache(basePath);

      // Also invalidate any count/summary endpoints
      invalidateCache(`${basePath}/count`);
      invalidateCache(`${basePath}/summary`);

      // For specific entity relationships
      if (endpoint.includes('/users/')) {
        // User-related changes might affect dashboards, profiles, etc.
        invalidateCache('/dashboards');
        invalidateCache('/profiles');
      } else if (endpoint.includes('/integrations/')) {
        // Integration changes might affect stats, metrics, etc.
        invalidateCache('/metrics');
        invalidateCache('/stats');
      }
    }
  }

  /**
   * Clear all background updates
   */
  function clearAllBackgroundUpdates() {
  // Added display name
  clearAllBackgroundUpdates.displayName = 'clearAllBackgroundUpdates';

    for (const update of backgroundUpdates.values()) {
      clearInterval(update.intervalId);
    }
    backgroundUpdates.clear();
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  function invalidateCache(pattern) {
  // Added display name
  invalidateCache.displayName = 'invalidateCache';

    // First try the default API cache
    apiCacheGroup.getCache('default').deletePattern(pattern);

    // Then try the reference cache
    referenceCache.deletePattern(pattern);

    // Finally try the user data cache
    userDataCache.deletePattern(pattern);
  }

  // Return the API service interface
  return {
    /**
     * HTTP GET request
     * @param {string} endpoint - API endpoint to request
     * @param {Object} params - Query parameters
     * @param {Object} options - Additional options
     */
    async get(endpoint, params = {}, options = {}) {
      const useCache = options.useCache ?? enableCache;
      const forceRefresh = options.forceRefresh ?? false;

      // Check cache first if enabled and not forced to refresh
      if (useCache && !forceRefresh) {
        const cachedData = getValidCachedResponse(endpoint, params);
        if (cachedData) {
          // If prefetching is enabled, do it in the background even when serving from cache
          if (enablePrefetching && prefetchConfig.enabled) {
            setTimeout(() => handlePrefetching(endpoint, cachedData), 10);
          }
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

        // Handle prefetching if enabled
        if (enablePrefetching && prefetchConfig.enabled) {
          handlePrefetching(endpoint, response.data);
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

        // Invalidate related cache entries
        invalidateRelatedCache(endpoint, 'post');

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

        // Invalidate related cache entries
        invalidateRelatedCache(endpoint, 'put');

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

        // Invalidate related cache entries
        invalidateRelatedCache(endpoint, 'delete');

        return response.data;
      } catch (error) {
        // Error handling is done by the interceptor
        throw error;
      }
    },

    /**
     * HTTP PATCH request
     * @param {string} endpoint - API endpoint to request
     * @param {Object} data - Request body data (partial update)
     * @param {Object} options - Additional options
     */
    async patch(endpoint, data = {}, options = {}) {
      const config = {
        headers: options.headers || {},
      };

      try {
        const response = await apiClient.patch(endpoint, data, config);

        // Show success notification if enabled
        if (options.showSuccess ?? showSuccessNotifications) {
          showSuccess(options.successMessage || 'Updated successfully');
        }

        // Invalidate related cache entries
        invalidateRelatedCache(endpoint, 'patch');

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
     * Manually invalidate cached responses for an endpoint
     * @param {string} pattern - Regex pattern to match endpoints
     * @returns {number} How many cache entries were invalidated
     */
    invalidateCache(pattern) {
      return invalidateCache(pattern);
    },

    /**
     * Clear all caches
     */
    clearCache() {
      // Clear all caches in all groups
      apiCacheGroup.clearAll();
    },

    /**
     * Get cache statistics
     */
    getCacheStats() {
      return apiCacheGroup.getAllStats();
    },

    /**
     * Cancel all background updates
     */
    cancelBackgroundUpdates() {
      clearAllBackgroundUpdates();
    },

    /**
     * Reset the prefetch history
     */
    resetPrefetchHistory() {
      prefetchHistory.clear();
    },

    /**
     * Clean up resources
     */
    destroy() {
      clearAllBackgroundUpdates();
      prefetchHistory.clear();
    },
  };
};

export default createEnhancedApiService;
