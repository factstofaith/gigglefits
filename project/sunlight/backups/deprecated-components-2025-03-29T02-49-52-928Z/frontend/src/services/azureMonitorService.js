// azureMonitorService.js
// Service for integrating with Azure Monitor API to retrieve resource metrics

import axios from 'axios';

/**
 * Cache for storing metrics data to reduce API calls
 * Structure:
 * {
 *   [resourceId-metrics-timeframe]: {
 *     data: [...],
 *     timestamp: Date,
 *     expires: Date
 *   }
 * }
 */
const metricsCache = {};

/**
 * Cache expiration times (in milliseconds) based on timeframe
 */
const CACHE_EXPIRATION = {
  '1h': 60 * 1000,      // 1 minute for 1 hour data
  '6h': 5 * 60 * 1000,  // 5 minutes for 6 hour data
  '24h': 15 * 60 * 1000, // 15 minutes for 24 hour data
  '7d': 60 * 60 * 1000,  // 1 hour for 7 day data
  '30d': 3 * 60 * 60 * 1000 // 3 hours for 30 day data
};

/**
 * Get the health status for all resources
 * @returns {Promise<Object>} Resource health data
 */
export const getResourceHealth = async () => {
  try {
    const response = await axios.get('/api/admin/monitoring/resource-health');
    return response.data;
  } catch (error) {
    console.error('Error fetching resource health:', error);
    throw new Error('Failed to fetch resource health data');
  }
};

/**
 * Get metrics for a specific resource
 * @param {string} resourceId - Resource identifier (appService, database, storage, keyVault)
 * @param {Array<string>} metricNames - Array of metric names to retrieve
 * @param {string} timeframe - Time period for metrics (1h, 6h, 24h, 7d, 30d)
 * @returns {Promise<Object>} Metrics data
 */
export const getResourceMetrics = async (resourceId, metricNames, timeframe = '24h') => {
  // Create cache key
  const cacheKey = `${resourceId}-${metricNames.join(',')}-${timeframe}`;
  
  // Check if we have valid cached data
  if (metricsCache[cacheKey] && metricsCache[cacheKey].expires > new Date()) {
    return metricsCache[cacheKey].data;
  }
  
  try {
    // Fetch from API if not in cache or expired
    const response = await axios.get('/api/admin/monitoring/metrics', {
      params: {
        resourceId,
        metrics: metricNames.join(','),
        timeframe
      }
    });
    
    // Calculate cache expiration
    const now = new Date();
    const expires = new Date(now.getTime() + (CACHE_EXPIRATION[timeframe] || 60000));
    
    // Store in cache
    metricsCache[cacheKey] = {
      data: response.data,
      timestamp: now,
      expires
    };
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${resourceId} metrics:`, error);
    throw new Error(`Failed to fetch metrics for ${resourceId}`);
  }
};

/**
 * Get documentation storage analytics
 * @param {string} timeframe - Time period for analytics (1h, 6h, 24h, 7d, 30d)
 * @returns {Promise<Object>} Storage analytics data
 */
export const getStorageAnalytics = async (timeframe = '7d') => {
  // Create cache key
  const cacheKey = `storage-analytics-${timeframe}`;
  
  // Check if we have valid cached data
  if (metricsCache[cacheKey] && metricsCache[cacheKey].expires > new Date()) {
    return metricsCache[cacheKey].data;
  }
  
  try {
    const response = await axios.get('/api/admin/monitoring/storage-analytics', {
      params: { timeframe }
    });
    
    // Calculate cache expiration
    const now = new Date();
    const expires = new Date(now.getTime() + (CACHE_EXPIRATION[timeframe] || 300000));
    
    // Store in cache
    metricsCache[cacheKey] = {
      data: response.data,
      timestamp: now,
      expires
    };
    
    return response.data;
  } catch (error) {
    console.error('Error fetching storage analytics:', error);
    throw new Error('Failed to fetch documentation analytics data');
  }
};

/**
 * Clear metrics cache
 * Useful for forcing a refresh
 */
export const clearMetricsCache = () => {
  // Added display name
  clearMetricsCache.displayName = 'clearMetricsCache';

  // Added display name
  clearMetricsCache.displayName = 'clearMetricsCache';

  // Added display name
  clearMetricsCache.displayName = 'clearMetricsCache';

  // Added display name
  clearMetricsCache.displayName = 'clearMetricsCache';

  // Added display name
  clearMetricsCache.displayName = 'clearMetricsCache';


  Object.keys(metricsCache).forEach(key => {
    delete metricsCache[key];
  });
};

export default {
  getResourceHealth,
  getResourceMetrics,
  getStorageAnalytics,
  clearMetricsCache
};