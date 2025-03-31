/**
 * Enhanced Integration Service
 * 
 * Provides API access to integration functionality with advanced caching,
 * background updates, and improved error handling.
 */

import { createEnhancedApiService } from '../utils/apiServiceFactory';
import { CACHE_STRATEGIES } from '../utils/enhancedCache';

// Create enhanced API service
const apiService = createEnhancedApiService('/api', {
  serviceName: 'integration-service',
  enableCache: true,
  enableBackgroundUpdates: true,
  enablePrefetching: true,
  showErrorNotifications: true,
  showSuccessNotifications: true,
  cacheStrategy: CACHE_STRATEGIES.ADAPTIVE,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  backgroundUpdateConfig: {
    // Endpoints that should update in the background
    '/api/integration-metrics': {
      interval: 30 * 1000, // 30 seconds
      maxUpdates: 10,
    },
    '/api/integration-runs': {
      interval: 60 * 1000, // 1 minute
      maxUpdates: 5,
    },
  },
  prefetchConfig: {
    enabled: true,
    maxPrefetchLimit: 15,
  },
});

/**
 * Enhanced Integration Service
 * Provides API access to integration functionality with improved error handling and caching
 */
const integrationServiceEnhanced = {
  /**
   * Get all integrations with optional filtering
   * 
   * @param {Object} [filter={}] - Filter criteria
   * @returns {Promise<Array>} - List of integrations
   */
  async getIntegrations(filter = {}) {
    return apiService.get('/api/integrations', filter, { useCache: true });
  },

  /**
   * Get a specific integration by ID
   * 
   * @param {string|number} id - Integration ID
   * @returns {Promise<Object>} - Integration details
   */
  async getIntegrationById(id) {
    return apiService.get(`/api/integrations/${id}`, {}, { useCache: true });
  },

  /**
   * Create a new integration
   * 
   * @param {Object} data - Integration data
   * @returns {Promise<Object>} - Created integration
   */
  async createIntegration(data) {
    return apiService.post('/api/integrations', data, {
      showSuccess: true,
      successMessage: 'Integration created successfully',
    });
  },

  /**
   * Update an existing integration
   * 
   * @param {string|number} id - Integration ID
   * @param {Object} data - Updated integration data
   * @returns {Promise<Object>} - Updated integration
   */
  async updateIntegration(id, data) {
    return apiService.put(`/api/integrations/${id}`, data, {
      showSuccess: true,
      successMessage: 'Integration updated successfully',
    });
  },

  /**
   * Delete an integration
   * 
   * @param {string|number} id - Integration ID
   * @returns {Promise<boolean>} - Success indicator
   */
  async deleteIntegration(id) {
    await apiService.delete(`/api/integrations/${id}`, {
      showSuccess: true,
      successMessage: 'Integration deleted successfully',
    });
    return true;
  },

  /**
   * Run an integration
   * 
   * @param {string|number} id - Integration ID
   * @param {Object} [options={}] - Run options
   * @returns {Promise<Object>} - Run result
   */
  async runIntegration(id, options = {}) {
    const result = await apiService.post(`/api/integrations/${id}/run`, options, {
      showSuccess: true,
      successMessage: 'Integration run started successfully',
    });

    // Invalidate related caches
    apiService.invalidateCache(`/api/integration-runs/${id}`);
    apiService.invalidateCache(`/api/integration-history/${id}`);

    return result;
  },

  /**
   * Get integration run history
   * 
   * @param {string|number} id - Integration ID
   * @param {number} [page=0] - Page number
   * @param {number} [limit=10] - Results per page
   * @returns {Promise<Object>} - Paged run history
   */
  async getIntegrationRuns(id, page = 0, limit = 10) {
    return apiService.get(`/api/integration-runs/${id}`, { page, limit }, { useCache: true });
  },

  /**
   * Get integration metrics
   * 
   * @param {string|number} [id=null] - Integration ID (null for all)
   * @param {string} [timeframe='7d'] - Timeframe (e.g. '24h', '7d', '30d')
   * @returns {Promise<Object>} - Integration metrics
   */
  async getIntegrationMetrics(id = null, timeframe = '7d') {
    const params = { timeframe };
    if (id) {
      params.integration_id = id;
    }

    return apiService.get('/api/integration-metrics', params, {
      useCache: true,
      forceRefresh: false,
    });
  },

  /**
   * Duplicate an integration
   * 
   * @param {string|number} id - Integration ID to duplicate
   * @param {string} name - Name for the new integration
   * @returns {Promise<Object>} - Duplicated integration
   */
  async duplicateIntegration(id, name) {
    return apiService.post(`/api/integrations/${id}/duplicate`, { name }, {
      showSuccess: true,
      successMessage: 'Integration duplicated successfully',
    });
  },

  /**
   * Export an integration configuration
   * 
   * @param {string|number} id - Integration ID
   * @returns {Promise<Object>} - Integration export data
   */
  async exportIntegration(id) {
    return apiService.get(`/api/integrations/${id}/export`, {}, {
      useCache: false,
      headers: {
        Accept: 'application/json',
      },
    });
  },

  /**
   * Import an integration configuration
   * 
   * @param {Object} data - Integration configuration
   * @returns {Promise<Object>} - Imported integration
   */
  async importIntegration(data) {
    return apiService.post('/api/integrations/import', data, {
      showSuccess: true,
      successMessage: 'Integration imported successfully',
    });
  },

  /**
   * Get integration templates
   * 
   * @param {string} [category=null] - Template category
   * @returns {Promise<Array>} - List of templates
   */
  async getIntegrationTemplates(category = null) {
    const params = category ? { category } : {};
    return apiService.get('/api/integration-templates', params, {
      useCache: true,
      forceRefresh: false,
    });
  },

  /**
   * Force refresh an integration's data
   * 
   * @param {string|number} id - Integration ID
   * @returns {Promise<Object>} - Fresh integration data
   */
  async forceRefreshIntegration(id) {
    // Invalidate all related caches
    apiService.invalidateCache(`/api/integrations/${id}`);
    apiService.invalidateCache(`/api/integration-runs/${id}`);
    apiService.invalidateCache(`/api/integration-history/${id}`);

    // Fetch fresh data
    return apiService.get(`/api/integrations/${id}`, {}, { useCache: true });
  },

  /**
   * Check if a request is loading
   * 
   * @param {string} endpoint - API endpoint
   * @param {Object} [params={}] - Request parameters
   * @returns {boolean} - Whether the request is loading
   */
  isLoading(endpoint, params = {}) {
    return apiService.isLoading(endpoint, params);
  },

  /**
   * Get cache statistics
   * 
   * @returns {Array<Object>} - Cache statistics
   */
  getCacheStats() {
    return apiService.getCacheStats();
  },

  /**
   * Clear all caches
   */
  clearCache() {
    apiService.clearCache();
  },
};

export default integrationServiceEnhanced;