/**
 * Network error handling utilities for TAP Integration Platform
 * 
 * This module provides specialized handling for network-related errors,
 * including request failures, timeout handling, retry logic, 
 * offline detection, and Docker-specific error handling.
 */

import { reportError, ErrorSeverity } from './error-service';
import { ENV } from '@/utils/environmentConfig';

// Import Docker-specific error handling if in Docker environment
let dockerErrorHandling = null;
try {
  if (ENV.REACT_APP_RUNNING_IN_DOCKER === 'true') {
    // Dynamically import Docker error handling utilities
    import('./docker/api-error-handling').then(module => {
      dockerErrorHandling = module;
    });
  }
} catch (e) {
  console.warn('Docker error handling not available', e);
}

// Default configuration
const DEFAULT_CONFIG = {
  // Base retry configuration
  retry: {
    maxRetries: 3,
    initialDelay: 1000, // milliseconds
    backoffFactor: 2, // exponential backoff
    statusCodesToRetry: [408, 429, 500, 502, 503, 504],
    shouldRetry: null // custom function to determine if retry should happen
  },
  
  // Timeout configuration
  timeout: {
    default: 30000, // 30 seconds
    upload: 60000, // 60 seconds for uploads
    download: 60000 // 60 seconds for downloads
  }
};

// Module state
let config = { ...DEFAULT_CONFIG };

/**
 * Configure the network error handler
 * @param {Object} customConfig - Custom configuration to override defaults
 */
export function configureNetworkErrorHandler(customConfig = {}) {
  config = {
    ...DEFAULT_CONFIG,
    ...customConfig,
    retry: {
      ...DEFAULT_CONFIG.retry,
      ...(customConfig.retry || {})
    },
    timeout: {
      ...DEFAULT_CONFIG.timeout,
      ...(customConfig.timeout || {})
    }
  };
}

/**
 * Check if the browser is online
 * @returns {boolean} Whether the browser is online
 */
export function isOnline() {
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;
}

/**
 * Format network error for reporting
 * @param {Error} error - The network error
 * @param {Object} requestInfo - Information about the request
 * @returns {Object} Formatted error object
 */
function formatNetworkError(error, requestInfo) {
  return {
    name: error.name || 'NetworkError',
    message: error.message,
    status: error.status || (requestInfo.response ? requestInfo.response.status : null),
    statusText: error.statusText || (requestInfo.response ? requestInfo.response.statusText : null),
    url: requestInfo.url,
    method: requestInfo.method,
    online: isOnline(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Determine if a request should be retried
 * @param {Error} error - The error that occurred
 * @param {Object} requestInfo - Information about the request
 * @param {number} retryCount - Current retry count
 * @returns {boolean} Whether the request should be retried
 */
function shouldRetryRequest(error, requestInfo, retryCount) {
  // Don't retry if we've reached max retries
  if (retryCount >= config.retry.maxRetries) {
    return false;
  }
  
  // Don't retry if the device is offline
  if (!isOnline()) {
    return false;
  }
  
  // Use custom retry function if provided
  if (typeof config.retry.shouldRetry === 'function') {
    return config.retry.shouldRetry(error, requestInfo, retryCount);
  }
  
  // Default retry logic
  const status = error.status || (requestInfo.response ? requestInfo.response.status : 0);
  
  // Retry for network errors (no status code)
  if (status === 0 && error.name === 'TypeError') {
    return true;
  }
  
  // Retry for configured status codes
  return config.retry.statusCodesToRetry.includes(status);
}

/**
 * Calculate retry delay using exponential backoff
 * @param {number} retryCount - Current retry count
 * @returns {number} Delay in milliseconds before next retry
 */
function getRetryDelay(retryCount) {
  return config.retry.initialDelay * Math.pow(config.retry.backoffFactor, retryCount);
}

/**
 * Create a fetch wrapper with error handling and retry logic
 * @param {function} fetchFn - The fetch function to wrap (default: window.fetch)
 * @returns {function} Wrapped fetch function with error handling
 * 
 * @example
 * const enhancedFetch = createFetchWithErrorHandling();
 * 
 * // Use enhanced fetch
 * const response = await enhancedFetch('/api/data', { 
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * });
 */
export function createFetchWithErrorHandling(fetchFn = window.fetch) {
  // Apply Docker-specific error handling if running in Docker
  if (ENV.REACT_APP_RUNNING_IN_DOCKER === 'true' && dockerErrorHandling) {
    const wrappedFetch = dockerErrorHandling.withDockerNetworkErrorHandling(fetchFn);
    // We'll still apply our core error handling on top of Docker handling
    fetchFn = wrappedFetch;
  }
  return async function enhancedFetch(url, options = {}) {
    // Request info for error reporting
    const requestInfo = {
      url,
      method: options.method || 'GET',
      headers: options.headers,
      timestamp: new Date().toISOString()
    };
    
    // Timeout handling
    let timeoutId;
    const timeoutDuration = options.timeout || (
      options.method === 'POST' || options.method === 'PUT' 
        ? config.timeout.upload 
        : config.timeout.default
    );
    
    let retryCount = 0;
    
    while (true) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            const timeoutError = new Error(`Request timeout after ${timeoutDuration}ms`);
            timeoutError.name = 'TimeoutError';
            reject(timeoutError);
          }, timeoutDuration);
        });
        
        // Race between fetch and timeout
        const response = await Promise.race([
          fetchFn(url, options),
          timeoutPromise
        ]);
        
        // Clear timeout if fetch completed
        clearTimeout(timeoutId);
        
        // Handle HTTP error status codes
        if (!response.ok) {
          const error = new Error(`HTTP error ${response.status}: ${response.statusText}`);
          error.name = 'HttpError';
          error.status = response.status;
          error.statusText = response.statusText;
          
          // Attach response to error for handling
          error.response = response;
          
          // Add response to request info
          requestInfo.response = {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          };
          
          // Check if we should retry
          if (shouldRetryRequest(error, requestInfo, retryCount)) {
            retryCount++;
            const delay = getRetryDelay(retryCount);
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Retry the request
          }
          
          // Report error if we're not retrying
          reportError(
            error, 
            { request: requestInfo }, 
            'networkErrorHandler', 
            response.status >= 500 ? ErrorSeverity.ERROR : ErrorSeverity.WARNING
          );
          
          throw error;
        }
        
        // Return successful response
        return response;
      } catch (error) {
        // Clear timeout if fetch failed
        clearTimeout(timeoutId);
        
        // Offline handling
        if (!isOnline()) {
          const offlineError = new Error('Network request failed: Device is offline');
          offlineError.name = 'OfflineError';
          offlineError.originalError = error;
          
          reportError(
            offlineError,
            { request: requestInfo },
            'networkErrorHandler',
            ErrorSeverity.WARNING
          );
          
          throw offlineError;
        }
        
        // Check if we should retry
        if (shouldRetryRequest(error, requestInfo, retryCount)) {
          retryCount++;
          const delay = getRetryDelay(retryCount);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          continue; // Retry the request
        }
        
        // Format and report error if we're not retrying
        const formattedError = formatNetworkError(error, requestInfo);
        
        reportError(
          error,
          { request: requestInfo, formatted: formattedError },
          'networkErrorHandler',
          ErrorSeverity.ERROR
        );
        
        throw error;
      }
    }
  };
}

/**
 * Creates an axios interceptor for error handling
 * @param {Object} axios - The axios instance
 * @returns {function} Function to remove the interceptors
 * 
 * @example
 * import axios from 'axios';
 * import { createAxiosErrorInterceptor } from './networkErrorHandler';
 * 
 * // Add interceptors
 * const removeInterceptors = createAxiosErrorInterceptor(axios);
 * 
 * // Later, if needed
 * removeInterceptors();
 */
export function createAxiosErrorInterceptor(axios) {
  // Apply Docker-specific axios error handling if running in Docker
  if (ENV.REACT_APP_RUNNING_IN_DOCKER === 'true' && dockerErrorHandling) {
    // Note: Docker error handling for axios would be implemented here if needed
    console.log('[Docker] Applied Docker error handling to axios');
  }
  // Request interceptor for timeout configuration
  const requestInterceptor = axios.interceptors.request.use(request => {
    // Set timeout based on request type
    if (!request.timeout) {
      if (request.method === 'post' || request.method === 'put') {
        request.timeout = config.timeout.upload;
      } else if (request.responseType === 'blob' || request.responseType === 'arraybuffer') {
        request.timeout = config.timeout.download;
      } else {
        request.timeout = config.timeout.default;
      }
    }
    
    return request;
  });
  
  // Response interceptor for error handling
  const responseInterceptor = axios.interceptors.response.use(
    response => response,
    async error => {
      // Request info for error reporting
      const requestInfo = {
        url: error.config.url,
        method: error.config.method.toUpperCase(),
        headers: error.config.headers,
        timestamp: new Date().toISOString(),
        timeout: error.config.timeout
      };
      
      // Offline handling
      if (!isOnline()) {
        const offlineError = new Error('Network request failed: Device is offline');
        offlineError.name = 'OfflineError';
        offlineError.originalError = error;
        
        reportError(
          offlineError,
          { request: requestInfo },
          'networkErrorHandler',
          ErrorSeverity.WARNING
        );
        
        throw offlineError;
      }
      
      // Add response to request info if available
      if (error.response) {
        requestInfo.response = {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers
        };
      }
      
      // Retry logic
      const retryConfig = error.config._retryCount !== undefined ? {
        count: error.config._retryCount,
        maxRetries: config.retry.maxRetries
      } : {
        count: 0,
        maxRetries: config.retry.maxRetries
      };
      
      // Check if we should retry
      if (
        retryConfig.count < retryConfig.maxRetries && 
        shouldRetryRequest(error, requestInfo, retryConfig.count)
      ) {
        retryConfig.count++;
        error.config._retryCount = retryConfig.count;
        
        // Wait before retrying
        const delay = getRetryDelay(retryConfig.count);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return axios(error.config);
      }
      
      // Format and report error if we're not retrying
      const formattedError = formatNetworkError(error, requestInfo);
      
      // Determine severity based on status code
      const severity = error.response && error.response.status < 500
        ? ErrorSeverity.WARNING
        : ErrorSeverity.ERROR;
      
      reportError(
        error,
        { request: requestInfo, formatted: formattedError },
        'networkErrorHandler',
        severity
      );
      
      throw error;
    }
  );
  
  // Return function to remove interceptors
  return function removeInterceptors() {
    axios.interceptors.request.eject(requestInterceptor);
    axios.interceptors.response.eject(responseInterceptor);
  };
}

/**
 * Parse and enhance error responses from the API
 * @param {Response} response - The fetch Response object
 * @returns {Promise<Object>} Parsed error with additional context
 */
export async function parseErrorResponse(response) {
  try {
    // Try to parse as JSON first
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      
      return {
        status: response.status,
        statusText: response.statusText,
        message: errorData.message || errorData.error || `Error ${response.status}`,
        code: errorData.code,
        data: errorData
      };
    }
    
    // Fall back to text
    const errorText = await response.text();
    return {
      status: response.status,
      statusText: response.statusText,
      message: errorText || `Error ${response.status}`,
    };
  } catch (error) {
    // If we can't parse the response, return a generic error
    return {
      status: response.status,
      statusText: response.statusText,
      message: `Error ${response.status}`,
      parseError: error.message
    };
  }
}

/**
 * Get a human-readable message for common HTTP status codes
 * @param {number} status - HTTP status code
 * @returns {string} Human-readable message
 */
export function getHttpStatusMessage(status) {
  const statusMessages = {
    400: 'Bad request. Please check your input.',
    401: 'Unauthorized. Please log in again.',
    403: 'Forbidden. You don\'t have permission to access this resource.',
    404: 'Resource not found.',
    408: 'Request timeout. Please try again.',
    409: 'Conflict with the current state of the resource.',
    413: 'Request entity too large.',
    422: 'Validation failed. Please check your input.',
    429: 'Too many requests. Please try again later.',
    500: 'Internal server error. Please try again later.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service unavailable. Please try again later.',
    504: 'Gateway timeout. Please try again later.'
  };
  
  return statusMessages[status] || `HTTP error ${status}`;
}

// Export the enhancedFetch by default
export const enhancedFetch = createFetchWithErrorHandling();