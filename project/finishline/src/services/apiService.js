/**
 * API Service
 * 
 * Central service for handling API requests with built-in
 * error handling, authentication, and standardized responses.
 * 
 * @module services/apiService
 */

/**
 * Default request options
 */
const DEFAULT_OPTIONS = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
  credentials: 'include',
};

/**
 * API Service class for handling API requests
 */
class ApiService {
  /**
   * Create a new API service instance
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.baseUrl - Base URL for API requests
   * @param {Function} [options.onRequest] - Request interceptor
   * @param {Function} [options.onResponse] - Response interceptor
   * @param {Function} [options.onError] - Error interceptor
   * @param {number} [options.timeout=30000] - Request timeout in ms
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '';
    this.onRequest = options.onRequest;
    this.onResponse = options.onResponse;
    this.onError = options.onError;
    this.defaultOptions = {
      ...DEFAULT_OPTIONS,
      timeout: options.timeout || DEFAULT_OPTIONS.timeout,
    };
    
    // Bind methods to preserve this context
    this.request = this.request.bind(this);
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
  }
  
  /**
   * Build full URL from path
   * 
   * @param {string} path - API endpoint path
   * @returns {string} Full URL
   */
  buildUrl(path) {
    // Handle already absolute URLs
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Ensure path starts with / and doesn't duplicate with baseUrl
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const normalizedBase = this.baseUrl.endsWith('/') 
      ? this.baseUrl.slice(0, -1) 
      : this.baseUrl;
      
    return `${normalizedBase}${normalizedPath}`;
  }
  
  /**
   * Create AbortController with timeout
   * 
   * @param {number} timeout - Timeout in ms
   * @returns {Object} AbortController and signal
   */
  createAbortController(timeout) {
    const controller = new AbortController();
    const { signal } = controller;
    
    // Set timeout if specified
    if (timeout) {
      setTimeout(() => {
        controller.abort();
      }, timeout);
    }
    
    return { controller, signal };
  }
  
  /**
   * Make a request to the API
   * 
   * @param {string} path - API endpoint path
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async request(path, options = {}) {
    // Merge options with defaults
    const mergedOptions = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      },
    };
    
    // Create AbortController for timeout
    const { signal } = this.createAbortController(mergedOptions.timeout);
    mergedOptions.signal = signal;
    
    // Remove timeout from options since it's not a valid fetch option
    delete mergedOptions.timeout;
    
    // Call onRequest interceptor if defined
    if (this.onRequest) {
      const modifiedOptions = await this.onRequest(mergedOptions);
      if (modifiedOptions) {
        Object.assign(mergedOptions, modifiedOptions);
      }
    }
    
    try {
      // Make the request
      const response = await fetch(this.buildUrl(path), mergedOptions);
      
      // Process the response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && contentType.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }
      
      // Call onResponse interceptor if defined
      if (this.onResponse) {
        const result = await this.onResponse(response, data);
        if (result !== undefined) {
          data = result;
        }
      }
      
      // Handle error responses
      if (!response.ok) {
        const error = new Error(data.message || response.statusText);
        error.status = response.status;
        error.response = response;
        error.data = data;
        
        // Call onError interceptor if defined
        if (this.onError) {
          await this.onError(error);
        }
        
        throw error;
      }
      
      return data;
    } catch (error) {
      // Handle aborted requests
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout');
        timeoutError.status = 408;
        timeoutError.code = 'TIMEOUT';
        
        // Call onError interceptor if defined
        if (this.onError) {
          await this.onError(timeoutError);
        }
        
        throw timeoutError;
      }
      
      // Call onError interceptor if defined and not already called
      if (this.onError && !error.status) {
        await this.onError(error);
      }
      
      throw error;
    }
  }
  
  /**
   * Make a GET request
   * 
   * @param {string} path - API endpoint path
   * @param {Object} [params] - Query parameters
   * @param {Object} [options] - Request options
   * @returns {Promise<Object>} Response data
   */
  async get(path, params = {}, options = {}) {
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `${path}?${queryString}` : path;
    
    return this.request(url, {
      method: 'GET',
      ...options,
    });
  }
  
  /**
   * Make a POST request
   * 
   * @param {string} path - API endpoint path
   * @param {Object} data - Request body data
   * @param {Object} [options] - Request options
   * @returns {Promise<Object>} Response data
   */
  async post(path, data, options = {}) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }
  
  /**
   * Make a PUT request
   * 
   * @param {string} path - API endpoint path
   * @param {Object} data - Request body data
   * @param {Object} [options] - Request options
   * @returns {Promise<Object>} Response data
   */
  async put(path, data, options = {}) {
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }
  
  /**
   * Make a PATCH request
   * 
   * @param {string} path - API endpoint path
   * @param {Object} data - Request body data
   * @param {Object} [options] - Request options
   * @returns {Promise<Object>} Response data
   */
  async patch(path, data, options = {}) {
    return this.request(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }
  
  /**
   * Make a DELETE request
   * 
   * @param {string} path - API endpoint path
   * @param {Object} [options] - Request options
   * @returns {Promise<Object>} Response data
   */
  async delete(path, options = {}) {
    return this.request(path, {
      method: 'DELETE',
      ...options,
    });
  }
}

// Create a default instance
const defaultInstance = new ApiService({
  baseUrl: process.env.REACT_APP_API_URL || '/api',
});

export { ApiService };
export default defaultInstance;