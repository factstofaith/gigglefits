// integrationServiceEnhanced.js
// -----------------------------------------------------------------------------
// Enhanced service for managing integrations with advanced caching,
// background synchronization, and prefetching

import createEnhancedApiService from '../utils/apiServiceFactoryEnhanced';
import { CACHE_STRATEGIES } from '../utils/enhancedCache';

// Base API URL - would come from environment config in a real app
const API_BASE_URL = '/api';

// Integration service endpoints
const ENDPOINTS = {
  integrations: `${API_BASE_URL}/integrations`,
  runs: `${API_BASE_URL}/integration-runs`,
  history: `${API_BASE_URL}/integration-history`,
  templates: `${API_BASE_URL}/integration-templates`,
  metrics: `${API_BASE_URL}/integration-metrics`,
};

// Configuration for background updates
const backgroundUpdateConfig = {
  // Real-time metrics update frequently
  [`${API_BASE_URL}/integration-metrics`]: {
    interval: 30 * 1000, // 30 seconds
    maxUpdates: 20, // Up to 20 updates (10 min)
  },
  // Recent runs update occasionally
  [`${API_BASE_URL}/integration-runs`]: {
    interval: 60 * 1000, // 1 minute
    maxUpdates: 5, // Up to 5 updates
  },
};

// Create enhanced API service with custom settings
const apiService = createEnhancedApiService(API_BASE_URL, {
  serviceName: 'integration-service',
  enableCache: true,
  enableBackgroundUpdates: true,
  enablePrefetching: true,
  showErrorNotifications: true,
  showSuccessNotifications: true,
  cacheStrategy: CACHE_STRATEGIES.ADAPTIVE,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  backgroundUpdateConfig,
  // Prefetch configuration
  prefetchConfig: {
    enabled: true,
    maxPrefetchLimit: 15,
  },
});

// Integration service with enhanced caching
const integrationServiceEnhanced = {
  // Get all integrations with optional filters
  getIntegrations: async (filters = {}) => {
    try {
      return await apiService.get(
        ENDPOINTS.integrations,
        filters,
        // Common integrations list - use cache with medium TTL
        { useCache: true }
      );
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  },

  // Get a specific integration by ID
  getIntegrationById: async id => {
    try {
      return await apiService.get(
        `${ENDPOINTS.integrations}/${id}`,
        {},
        // Integration details - use cache with short TTL for real-time accuracy
        { useCache: true }
      );
    } catch (error) {
      console.error(`Error fetching integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new integration
  createIntegration: async integrationData => {
    try {
      const result = await apiService.post(ENDPOINTS.integrations, integrationData, {
        showSuccess: true,
        successMessage: 'Integration created successfully',
      });

      // Note: Cache invalidation is handled automatically by apiServiceFactoryEnhanced

      return result;
    } catch (error) {
      console.error('Error creating integration:', error);
      throw error;
    }
  },

  // Update an existing integration
  updateIntegration: async (id, integrationData) => {
    try {
      return await apiService.put(`${ENDPOINTS.integrations}/${id}`, integrationData, {
        showSuccess: true,
        successMessage: 'Integration updated successfully',
      });
    } catch (error) {
      console.error(`Error updating integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete an integration
  deleteIntegration: async id => {
    try {
      await apiService.delete(`${ENDPOINTS.integrations}/${id}`, {
        showSuccess: true,
        successMessage: 'Integration deleted successfully',
      });
      return true;
    } catch (error) {
      console.error(`Error deleting integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Run an integration
  runIntegration: async (id, options = {}) => {
    try {
      const result = await apiService.post(`${ENDPOINTS.integrations}/${id}/run`, options, {
        showSuccess: true,
        successMessage: 'Integration run started successfully',
      });

      // Force refresh run history on next fetch
      apiService.invalidateCache(`${ENDPOINTS.runs}/${id}`);
      apiService.invalidateCache(`${ENDPOINTS.history}/${id}`);

      return result;
    } catch (error) {
      console.error(`Error running integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Get integration run history
  getIntegrationRuns: async (integrationId, page = 0, limit = 10) => {
    try {
      return await apiService.get(
        `${ENDPOINTS.runs}/${integrationId}`,
        { page, limit },
        // Run history - use cache but with short TTL
        { useCache: true }
      );
    } catch (error) {
      console.error(`Error fetching runs for integration ID ${integrationId}:`, error);
      throw error;
    }
  },

  // Get detailed integration history (audit log)
  getIntegrationHistory: async (integrationId, filters = {}) => {
    try {
      return await apiService.get(
        `${ENDPOINTS.history}/${integrationId}`,
        filters,
        // Audit history - can be cached longer
        { useCache: true }
      );
    } catch (error) {
      console.error(`Error fetching history for integration ID ${integrationId}:`, error);
      throw error;
    }
  },

  // Get integration templates
  getIntegrationTemplates: async (category = null) => {
    try {
      const params = category ? { category } : {};
      return await apiService.get(
        ENDPOINTS.templates,
        params,
        // Templates rarely change - use long-lived cache
        {
          useCache: true,
          // Don't auto-refresh templates during the session
          forceRefresh: false,
        }
      );
    } catch (error) {
      console.error('Error fetching integration templates:', error);
      throw error;
    }
  },

  // Get integration metrics (real-time data)
  getIntegrationMetrics: async (integrationId = null, timeframe = '24h') => {
    try {
      const params = {
        timeframe,
        ...(integrationId ? { integration_id: integrationId } : {}),
      };

      return await apiService.get(
        ENDPOINTS.metrics,
        params,
        // Metrics - real-time data with short TTL and background updates
        { useCache: true, forceRefresh: false }
      );
    } catch (error) {
      console.error('Error fetching integration metrics:', error);
      throw error;
    }
  },

  // Duplicate an existing integration
  duplicateIntegration: async (id, newName) => {
    try {
      return await apiService.post(
        `${ENDPOINTS.integrations}/${id}/duplicate`,
        { name: newName },
        {
          showSuccess: true,
          successMessage: 'Integration duplicated successfully',
        }
      );
    } catch (error) {
      console.error(`Error duplicating integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Export an integration configuration
  exportIntegration: async id => {
    try {
      return await apiService.get(
        `${ENDPOINTS.integrations}/${id}/export`,
        {},
        {
          useCache: false,
          headers: {
            Accept: 'application/json',
          },
        }
      );
    } catch (error) {
      console.error(`Error exporting integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Import an integration configuration
  importIntegration: async integrationData => {
    try {
      return await apiService.post(`${ENDPOINTS.integrations}/import`, integrationData, {
        showSuccess: true,
        successMessage: 'Integration imported successfully',
      });
    } catch (error) {
      console.error('Error importing integration:', error);
      throw error;
    }
  },

  // Check if the service is loading data
  isLoading: (endpoint, params = {}) => {
    return apiService.isLoading(endpoint, params);
  },

  // Get cache statistics for this service
  getCacheStats: () => {
    return apiService.getCacheStats();
  },

  // Clear the cache for this service
  clearCache: () => {
    return apiService.clearCache();
  },

  // Force refresh of integration data
  forceRefreshIntegration: async id => {
    // Invalidate specific integration cache
    apiService.invalidateCache(`${ENDPOINTS.integrations}/${id}`);
    apiService.invalidateCache(`${ENDPOINTS.runs}/${id}`);
    apiService.invalidateCache(`${ENDPOINTS.history}/${id}`);

    // Re-fetch the integration
    return await integrationServiceEnhanced.getIntegrationById(id);
  },
};

export default integrationServiceEnhanced;
