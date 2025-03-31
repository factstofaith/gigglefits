/**
 * Documentation Analytics Service
 * 
 * This service handles interactions with the documentation analytics API,
 * including fetching usage statistics, popular documents, and search terms.
 * 
 * Features:
 * - Token authentication through authService
 * - Caching for performance optimization
 * - Retry logic for resilience
 * - Detailed error handling
 * - Mock data fallback for development/testing
 */

import axios from 'axios';
import authService from './/authService';

const API_URL = process.env.REACT_APP_API_URL || '';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Cache storage
const cache = {
  data: new Map(),
  
  // Get cached data if valid
  get(key) {
    const item = this.data.get(key);
    if (!item) return null;
    
    const now = Date.now();
    if (now > item.expiry) {
      this.data.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  // Set data in cache with expiry
  set(key, value, ttl = CACHE_DURATION) {
    const expiry = Date.now() + ttl;
    this.data.set(key, { value, expiry });
  },
  
  // Invalidate specific cache entries by prefix
  invalidate(keyPrefix) {
    for (const key of this.data.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.data.delete(key);
      }
    }
  },
  
  // Clear all cache
  clear() {
    this.data.clear();
  }
};

/**
 * Makes an authenticated API request with retry logic
 * 
 * @param {string} url - API URL
 * @param {Object} options - Request options
 * @param {number} retries - Number of retries remaining
 * @returns {Promise<Object>} API response
 */
async function makeRequest(url, options = {}, retries = MAX_RETRIES) {
  // Added display name
  makeRequest.displayName = 'makeRequest';

  try {
    // Get fresh token for each request attempt
    const token = await authService.getAuthToken();
    
    // Merge options with authentication
    const requestOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    };
    
    // Make the request
    const response = await axios(url, requestOptions);
    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      // Server responded with an error status code
      const status = error.response.status;
      
      // Handle authentication errors
      if (status === 401 || status === 403) {
        console.error(`Authentication error (${status}) for ${url}:`, error);
        throw new Error(`Authentication failed: ${error.response.data.message || 'Access denied'}`);
      }
      
      // Handle rate limiting
      if (status === 429 && retries > 0) {
        console.warn(`Rate limited on ${url}, retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return makeRequest(url, options, retries - 1);
      }
      
      // Handle server errors with retry
      if (status >= 500 && retries > 0) {
        console.warn(`Server error (${status}) on ${url}, retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return makeRequest(url, options, retries - 1);
      }
      
      // Other response errors
      console.error(`API error (${status}) for ${url}:`, error);
      throw new Error(`API error: ${error.response.data.message || error.message}`);
    } 
    
    // Network/connection errors with retry
    if (error.request && retries > 0) {
      console.warn(`Network error on ${url}, retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return makeRequest(url, options, retries - 1);
    }
    
    // Other errors
    console.error(`Unexpected error for ${url}:`, error);
    throw error;
  }
}

/**
 * Get documentation usage statistics with caching
 * 
 * @param {string} timePeriod - Time period for stats (day, week, month, year, all)
 * @returns {Promise<Object>} Documentation usage statistics
 */
async function getDocumentationStats(timePeriod = 'week') {
  // Added display name
  getDocumentationStats.displayName = 'getDocumentationStats';

  const cacheKey = `stats-${timePeriod}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const url = `${API_URL}/api/documentation/analytics/stats?time_period=${timePeriod}`;
    const data = await makeRequest(url, { method: 'GET' });
    
    // Cache the result
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching documentation statistics:', error);
    
    // Return mock data for development/testing or when API fails
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const mockData = getMockDocumentationStats(timePeriod);
      cache.set(cacheKey, mockData, CACHE_DURATION / 2); // Cache mock data for half the time
      return mockData;
    }
    
    throw error;
  }
}

/**
 * Get top search terms used in documentation with caching
 * 
 * @param {string} timePeriod - Time period for stats (day, week, month, year, all)
 * @param {number} limit - Maximum number of search terms to return
 * @returns {Promise<Array>} List of top search terms and their counts
 */
async function getTopSearchTerms(timePeriod = 'week', limit = 10) {
  // Added display name
  getTopSearchTerms.displayName = 'getTopSearchTerms';

  const cacheKey = `search-terms-${timePeriod}-${limit}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const url = `${API_URL}/api/documentation/analytics/search-terms?time_period=${timePeriod}&limit=${limit}`;
    const data = await makeRequest(url, { method: 'GET' });
    
    // Cache the result
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching top search terms:', error);
    
    // Return mock data for development/testing or when API fails
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const mockData = getMockSearchTerms(limit);
      cache.set(cacheKey, mockData, CACHE_DURATION / 2);
      return mockData;
    }
    
    throw error;
  }
}

/**
 * Get detailed document usage statistics by ID with caching
 * 
 * @param {string} documentId - ID of the document to get stats for
 * @param {string} timePeriod - Time period for stats (day, week, month, year, all)
 * @returns {Promise<Object>} Detailed document usage statistics
 */
async function getDocumentStats(documentId, timePeriod = 'week') {
  // Added display name
  getDocumentStats.displayName = 'getDocumentStats';

  const cacheKey = `document-${documentId}-${timePeriod}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const url = `${API_URL}/api/documentation/analytics/document/${documentId}?time_period=${timePeriod}`;
    const data = await makeRequest(url, { method: 'GET' });
    
    // Cache the result
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching statistics for document ${documentId}:`, error);
    
    // Return mock data for development/testing or when API fails
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const mockData = getMockDocumentStats(documentId, timePeriod);
      cache.set(cacheKey, mockData, CACHE_DURATION / 2);
      return mockData;
    }
    
    throw error;
  }
}

/**
 * Get user engagement metrics for documentation with caching
 * 
 * @param {string} timePeriod - Time period for stats (day, week, month, year, all)
 * @returns {Promise<Object>} User engagement metrics
 */
async function getUserEngagementMetrics(timePeriod = 'week') {
  // Added display name
  getUserEngagementMetrics.displayName = 'getUserEngagementMetrics';

  const cacheKey = `engagement-${timePeriod}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const url = `${API_URL}/api/documentation/analytics/engagement?time_period=${timePeriod}`;
    const data = await makeRequest(url, { method: 'GET' });
    
    // Cache the result
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching user engagement metrics:', error);
    
    // Return mock data for development/testing or when API fails
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const mockData = getMockEngagementMetrics(timePeriod);
      cache.set(cacheKey, mockData, CACHE_DURATION / 2);
      return mockData;
    }
    
    throw error;
  }
}

/**
 * Get documentation usage by category with caching
 * 
 * @param {string} timePeriod - Time period for stats (day, week, month, year, all)
 * @returns {Promise<Array>} Usage by category
 */
async function getUsageByCategory(timePeriod = 'week') {
  // Added display name
  getUsageByCategory.displayName = 'getUsageByCategory';

  const cacheKey = `categories-${timePeriod}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const url = `${API_URL}/api/documentation/analytics/categories?time_period=${timePeriod}`;
    const data = await makeRequest(url, { method: 'GET' });
    
    // Cache the result
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching usage by category:', error);
    
    // Return mock data for development/testing or when API fails
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const mockData = getMockCategoryUsage();
      cache.set(cacheKey, mockData, CACHE_DURATION / 2);
      return mockData;
    }
    
    throw error;
  }
}

/**
 * Invalidate all cache for a specific time period
 * 
 * @param {string} timePeriod - Time period to invalidate (day, week, month, year, all)
 */
function invalidateCache(timePeriod = null) {
  // Added display name
  invalidateCache.displayName = 'invalidateCache';

  if (timePeriod) {
    // Invalidate specific time period
    cache.invalidate(`stats-${timePeriod}`);
    cache.invalidate(`search-terms-${timePeriod}`);
    cache.invalidate(`engagement-${timePeriod}`);
    cache.invalidate(`categories-${timePeriod}`);
    // Document stats are also impacted by time period but have document IDs
    // So we don't invalidate them here to avoid excessive cache clearing
  } else {
    // Invalidate all cache
    cache.clear();
  }
}

/**
 * Refresh all analytics data for a specific time period
 * Forces a fresh fetch by clearing relevant cache first
 * 
 * @param {string} timePeriod - Time period for stats (day, week, month, year, all)
 * @returns {Promise<Object>} Consolidated analytics data
 */
async function refreshAnalytics(timePeriod = 'week') {
  // Added display name
  refreshAnalytics.displayName = 'refreshAnalytics';

  // Clear cache for this time period
  invalidateCache(timePeriod);
  
  try {
    // Fetch all data in parallel
    const [stats, searchTerms, categoryData, engagementData] = await Promise.all([
      getDocumentationStats(timePeriod),
      getTopSearchTerms(timePeriod),
      getUsageByCategory(timePeriod),
      getUserEngagementMetrics(timePeriod)
    ]);
    
    // Return consolidated data
    return {
      stats,
      searchTerms,
      categoryData,
      engagementData,
      refreshTime: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error refreshing analytics data:', error);
    throw new Error(`Failed to refresh analytics data: ${error.message}`);
  }
}

// Mock data functions for development and testing

function getMockDocumentationStats(timePeriod) {
  // Added display name
  getMockDocumentationStats.displayName = 'getMockDocumentationStats';

  const now = new Date();
  let startDate;
  
  switch (timePeriod) {
    case 'day':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(2020, 0, 1);
  }
  
  return {
    time_period: timePeriod,
    start_date: startDate.toISOString(),
    end_date: now.toISOString(),
    total_views: 1245,
    unique_documents: 42,
    unique_users: 89,
    anonymous_views: 324,
    top_documents: [
      { document_id: 'getting-started-guide', views: 156, title: 'Getting Started Guide' },
      { document_id: 'integration-tutorial', views: 98, title: 'Integration Tutorial' },
      { document_id: 'api-reference', views: 92, title: 'API Reference' },
      { document_id: 'terraform-deployment', views: 87, title: 'Terraform Deployment Guide' },
      { document_id: 'oauth-configuration', views: 76, title: 'OAuth Configuration' },
      { document_id: 'troubleshooting', views: 65, title: 'Troubleshooting Guide' },
      { document_id: 'security-best-practices', views: 58, title: 'Security Best Practices' },
      { document_id: 'azure-integration', views: 52, title: 'Azure Integration Guide' },
      { document_id: 'data-model', views: 45, title: 'Data Model Reference' },
      { document_id: 'release-notes', views: 38, title: 'Release Notes' }
    ],
    feedback: {
      positive: 98,
      negative: 12
    }
  };
}

function getMockSearchTerms(limit = 10) {
  // Added display name
  getMockSearchTerms.displayName = 'getMockSearchTerms';

  const terms = [
    { term: 'integration', count: 87 },
    { term: 'api key', count: 65 },
    { term: 'oauth', count: 52 },
    { term: 'error', count: 48 },
    { term: 'connection', count: 43 },
    { term: 'azure blob', count: 39 },
    { term: 'webhook', count: 35 },
    { term: 'transformation', count: 32 },
    { term: 'schedule', count: 29 },
    { term: 'authentication', count: 27 },
    { term: 'dataset', count: 24 },
    { term: 'trigger', count: 21 },
    { term: 'mapping', count: 19 },
    { term: 'logs', count: 17 },
    { term: 'troubleshooting', count: 15 }
  ];
  
  return terms.slice(0, limit);
}

function getMockDocumentStats(documentId, timePeriod) {
  // Added display name
  getMockDocumentStats.displayName = 'getMockDocumentStats';

  return {
    document_id: documentId,
    time_period: timePeriod,
    views: Math.floor(Math.random() * 100) + 20,
    unique_users: Math.floor(Math.random() * 30) + 5,
    average_time_spent: Math.floor(Math.random() * 180) + 30, // seconds
    bounce_rate: Math.random() * 0.3 + 0.1, // 10-40%
    feedback: {
      positive: Math.floor(Math.random() * 30),
      negative: Math.floor(Math.random() * 10)
    },
    referrers: [
      { source: 'Google', count: Math.floor(Math.random() * 20) + 5 },
      { source: 'Direct', count: Math.floor(Math.random() * 15) + 3 },
      { source: 'GitHub', count: Math.floor(Math.random() * 10) + 2 },
      { source: 'Twitter', count: Math.floor(Math.random() * 5) + 1 }
    ],
    daily_views: Array.from({ length: 7 }, () => ({
      date: new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000).toISOString().split('T')[0],
      views: Math.floor(Math.random() * 20) + 1
    }))
  };
}

function getMockEngagementMetrics(timePeriod) {
  // Added display name
  getMockEngagementMetrics.displayName = 'getMockEngagementMetrics';

  return {
    time_period: timePeriod,
    average_session_duration: 325, // seconds
    average_pages_per_session: 3.2,
    bounce_rate: 0.28, // 28%
    returning_users: 67,
    new_users: 22,
    device_breakdown: {
      desktop: 82,
      mobile: 12,
      tablet: 6
    },
    browser_breakdown: {
      chrome: 68,
      firefox: 14,
      safari: 12,
      edge: 5,
      other: 1
    }
  };
}

function getMockCategoryUsage() {
  // Added display name
  getMockCategoryUsage.displayName = 'getMockCategoryUsage';

  return [
    { category: 'Getting Started', views: 245, documents: 5 },
    { category: 'API Reference', views: 187, documents: 8 },
    { category: 'Tutorials', views: 164, documents: 6 },
    { category: 'Integration', views: 142, documents: 7 },
    { category: 'Security', views: 98, documents: 3 },
    { category: 'Deployment', views: 87, documents: 4 },
    { category: 'Troubleshooting', views: 76, documents: 5 }
  ];
}

const documentationAnalyticsService = {
  // Core API methods
  getDocumentationStats,
  getTopSearchTerms,
  getDocumentStats,
  getUserEngagementMetrics,
  getUsageByCategory,
  
  // Cache management methods
  invalidateCache,
  refreshAnalytics,
  
  // Expose the cache for testing/debugging
  _cache: cache
};

export default documentationAnalyticsService;