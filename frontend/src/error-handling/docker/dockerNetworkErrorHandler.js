/**
 * Docker-specific network error handling utilities
 * 
 * This module provides specialized handling for network-related errors
 * in Docker environments, including container networking issues and
 * cross-container error propagation.
 */

import { reportError, ErrorSeverity } from '../error-service';
import { 
  configureNetworkErrorHandler,
  isOnline,
  parseErrorResponse,
  getHttpStatusMessage
} from '../networkErrorHandler';
import { useContainerErrorPropagation } from './ContainerErrorContext';

// Default Docker-specific configuration
const DOCKER_DEFAULT_CONFIG = {
  // Base retry configuration for Docker environment
  retry: {
    maxRetries: 5, // More retries for containerized environments
    initialDelay: 1000, // milliseconds
    backoffFactor: 1.5, // less aggressive backoff for containers
    statusCodesToRetry: [408, 425, 429, 500, 502, 503, 504, 507, 508],
    // Add Docker-specific status codes and errors
    shouldRetry: (error, requestInfo, retryCount) => {
      // Retry Docker networking errors (connection refused, etc.)
      if (error.message && (
        error.message.includes('connection refused') ||
        error.message.includes('network error') ||
        error.message.includes('network timeout') ||
        error.message.includes('service unavailable')
      )) {
        return true;
      }
      return false;
    }
  },
  
  // Timeout configuration (increased for Docker environments)
  timeout: {
    default: 45000, // 45 seconds for Docker (increased from 30)
    upload: 90000,  // 90 seconds for uploads
    download: 90000 // 90 seconds for downloads
  },
  
  // Docker-specific settings
  docker: {
    addContainerInfo: true,
    propagateErrors: true,
    healthCheckEndpoint: '/health',
    monitorConnectivity: true,
    serviceHealthCheckInterval: 60000, // 1 minute
  }
};

// Module state
let dockerConfig = { ...DOCKER_DEFAULT_CONFIG };

/**
 * Configure the Docker network error handler
 * @param {Object} customConfig - Custom configuration to override defaults
 */
export function configureDockerNetworkErrorHandler(customConfig = {}) {
  dockerConfig = {
    ...DOCKER_DEFAULT_CONFIG,
    ...customConfig,
    retry: {
      ...DOCKER_DEFAULT_CONFIG.retry,
      ...(customConfig.retry || {})
    },
    timeout: {
      ...DOCKER_DEFAULT_CONFIG.timeout,
      ...(customConfig.timeout || {})
    },
    docker: {
      ...DOCKER_DEFAULT_CONFIG.docker,
      ...(customConfig.docker || {})
    }
  };
  
  // Also configure the base network error handler
  configureNetworkErrorHandler({
    retry: dockerConfig.retry,
    timeout: dockerConfig.timeout
  });
}

/**
 * Format network error for Docker environments
 * @param {Error} error - The network error
 * @param {Object} requestInfo - Information about the request
 * @param {Object} containerInfo - Docker container information
 * @returns {Object} Formatted error object with Docker context
 */
function formatDockerNetworkError(error, requestInfo, containerInfo = {}) {
  return {
    name: error.name || 'DockerNetworkError',
    message: error.message,
    status: error.status || (requestInfo.response ? requestInfo.response.status : null),
    statusText: error.statusText || (requestInfo.response ? requestInfo.response.statusText : null),
    url: requestInfo.url,
    method: requestInfo.method,
    online: isOnline(),
    timestamp: new Date().toISOString(),
    container: {
      id: containerInfo.containerId || window.location.hostname,
      name: containerInfo.containerName || document.title,
      isDockerEnvironment: true
    },
    targetService: requestInfo.url.split('/')[1] || 'unknown',
    dockerNetworkEvent: true
  };
}

/**
 * Check if an error is likely a Docker networking issue
 * @param {Error} error - The error to check
 * @returns {boolean} Whether it's a Docker networking issue
 */
export function isDockerNetworkError(error) {
  // Check for explicit Docker network error indication
  if (error.isDockerNetworkError) {
    return true;
  }
  
  // Check for network errors that are common in Docker environments
  if (error.message && (
    error.message.includes('connection refused') ||
    error.message.includes('network timeout') ||
    error.message.includes('service unavailable') ||
    error.message.includes('network error') ||
    error.message.includes('no route to host') ||
    error.message.includes('host unreachable')
  )) {
    return true;
  }
  
  // Check for specific Docker-related status codes
  if (error.status === 503 || error.status === 502) {
    return true;
  }
  
  return false;
}

/**
 * Create a Docker-aware fetch wrapper with enhanced error handling
 * @param {function} fetchFn - The fetch function to wrap (default: window.fetch)
 * @param {Object} options - Docker-specific options
 * @returns {function} Wrapped fetch function with Docker-aware error handling
 * 
 * @example
 * const enhancedFetch = createDockerFetchWithErrorHandling();
 * 
 * // Use enhanced fetch
 * const response = await enhancedFetch('/api/data', { 
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * });
 */
export function createDockerFetchWithErrorHandling(fetchFn = window.fetch, options = {}) {
  const {
    containerInfo = {},
    propagateErrors = dockerConfig.docker.propagateErrors,
    addHealthCheck = dockerConfig.docker.monitorConnectivity
  } = options;
  
  // Get error propagation if available
  let errorPropagation = null;
  
  try {
    // This will throw if not in a ContainerErrorProvider
    errorPropagation = typeof window !== 'undefined' ? window.__CONTAINER_ERROR_PROPAGATION__ : null;
  } catch (e) {
    // Ignore error, errorPropagation will remain null
  }
  
  return async function dockerEnhancedFetch(url, options = {}) {
    // Request info for error reporting
    const requestInfo = {
      url,
      method: options.method || 'GET',
      headers: options.headers,
      timestamp: new Date().toISOString(),
      isDocker: true,
      targetService: url.split('/')[1] || 'unknown'
    };
    
    // Timeout handling
    let timeoutId;
    const timeoutDuration = options.timeout || (
      options.method === 'POST' || options.method === 'PUT' 
        ? dockerConfig.timeout.upload 
        : dockerConfig.timeout.default
    );
    
    // Add service health check endpoint if needed and if URL matches a service
    if (addHealthCheck && !url.includes('/health') && !url.endsWith('.js') && !url.endsWith('.css')) {
      const serviceName = url.split('/')[1];
      
      if (serviceName && !serviceName.includes('.')) {
        try {
          // Try to check service health first, but don't fail if health check fails
          const healthEndpoint = `/${serviceName}${dockerConfig.docker.healthCheckEndpoint}`;
          try {
            await fetchFn(healthEndpoint, { method: 'GET', timeout: 2000 });
          } catch (healthError) {
            console.warn(`Health check failed for service ${serviceName}:`, healthError);
            // Don't propagate health check errors
          }
        } catch (e) {
          // Ignore errors in health checking
        }
      }
    }
    
    let retryCount = 0;
    
    while (true) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            const timeoutError = new Error(`Docker request timeout after ${timeoutDuration}ms`);
            timeoutError.name = 'DockerTimeoutError';
            timeoutError.isDockerNetworkError = true;
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
          
          // Determine if this is a Docker networking error
          error.isDockerNetworkError = isDockerNetworkError(error);
          
          // Attach response to error for handling
          error.response = response;
          
          // Add response to request info
          requestInfo.response = {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          };
          
          // Check if we should retry
          if (retryCount < dockerConfig.retry.maxRetries && (
            dockerConfig.retry.statusCodesToRetry.includes(response.status) ||
            (dockerConfig.retry.shouldRetry && dockerConfig.retry.shouldRetry(error, requestInfo, retryCount))
          )) {
            retryCount++;
            const delay = dockerConfig.retry.initialDelay * Math.pow(dockerConfig.retry.backoffFactor, retryCount);
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Retry the request
          }
          
          // Format the error with Docker context
          const formattedError = formatDockerNetworkError(error, requestInfo, containerInfo);
          
          // Propagate error if enabled and it's a Docker network error
          if (propagateErrors && errorPropagation && error.isDockerNetworkError) {
            try {
              errorPropagation.propagateError(error, {
                severity: response.status >= 500 ? 'error' : 'warning',
                metadata: { 
                  request: requestInfo,
                  formatted: formattedError
                }
              }).catch(() => {
                // Ignore propagation errors
              });
            } catch (e) {
              // Ignore errors in error propagation
            }
          }
          
          // Report error if we're not retrying
          reportError(
            error, 
            { 
              request: requestInfo,
              formatted: formattedError,
              container: containerInfo,
              isDockerEnvironment: true
            }, 
            'dockerNetworkErrorHandler', 
            response.status >= 500 ? ErrorSeverity.ERROR : ErrorSeverity.WARNING
          );
          
          throw error;
        }
        
        // Return successful response
        return response;
      } catch (error) {
        // Clear timeout if fetch failed
        clearTimeout(timeoutId);
        
        // Determine if this is a Docker networking error
        error.isDockerNetworkError = isDockerNetworkError(error);
        
        // Offline handling
        if (!isOnline()) {
          const offlineError = new Error('Docker network request failed: Container is offline');
          offlineError.name = 'DockerOfflineError';
          offlineError.originalError = error;
          offlineError.isDockerNetworkError = true;
          
          // Report the offline error
          reportError(
            offlineError,
            { 
              request: requestInfo,
              container: containerInfo,
              isDockerEnvironment: true
            },
            'dockerNetworkErrorHandler',
            ErrorSeverity.WARNING
          );
          
          throw offlineError;
        }
        
        // Check if we should retry
        if (retryCount < dockerConfig.retry.maxRetries && (
          error.isDockerNetworkError ||
          (dockerConfig.retry.shouldRetry && dockerConfig.retry.shouldRetry(error, requestInfo, retryCount))
        )) {
          retryCount++;
          const delay = dockerConfig.retry.initialDelay * Math.pow(dockerConfig.retry.backoffFactor, retryCount);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          continue; // Retry the request
        }
        
        // Format and report error if we're not retrying
        const formattedError = formatDockerNetworkError(error, requestInfo, containerInfo);
        
        // Propagate error if enabled and it's a Docker network error
        if (propagateErrors && errorPropagation && error.isDockerNetworkError) {
          try {
            errorPropagation.propagateError(error, {
              severity: 'error',
              metadata: { 
                request: requestInfo,
                formatted: formattedError
              }
            }).catch(() => {
              // Ignore propagation errors
            });
          } catch (e) {
            // Ignore errors in error propagation
          }
        }
        
        reportError(
          error,
          { 
            request: requestInfo, 
            formatted: formattedError,
            container: containerInfo,
            isDockerEnvironment: true
          },
          'dockerNetworkErrorHandler',
          ErrorSeverity.ERROR
        );
        
        throw error;
      }
    }
  };
}

/**
 * Creates a Docker-aware axios interceptor for error handling
 * @param {Object} axios - The axios instance
 * @param {Object} options - Docker-specific options
 * @returns {function} Function to remove the interceptors
 * 
 * @example
 * import axios from 'axios';
 * import { createDockerAxiosErrorInterceptor } from './dockerNetworkErrorHandler';
 * 
 * // Add Docker-aware interceptors
 * const removeInterceptors = createDockerAxiosErrorInterceptor(axios, {
 *   containerInfo: { containerId: 'frontend-123' }
 * });
 */
export function createDockerAxiosErrorInterceptor(axios, options = {}) {
  const {
    containerInfo = {},
    propagateErrors = dockerConfig.docker.propagateErrors,
    addHealthCheck = dockerConfig.docker.monitorConnectivity
  } = options;
  
  // Get error propagation if available
  let errorPropagation = null;
  
  try {
    // This will throw if not in a ContainerErrorProvider
    errorPropagation = typeof window !== 'undefined' ? window.__CONTAINER_ERROR_PROPAGATION__ : null;
  } catch (e) {
    // Ignore error, errorPropagation will remain null
  }
  
  // Request interceptor for Docker-specific configuration
  const requestInterceptor = axios.interceptors.request.use(request => {
    // Set timeout based on request type
    if (!request.timeout) {
      if (request.method === 'post' || request.method === 'put') {
        request.timeout = dockerConfig.timeout.upload;
      } else if (request.responseType === 'blob' || request.responseType === 'arraybuffer') {
        request.timeout = dockerConfig.timeout.download;
      } else {
        request.timeout = dockerConfig.timeout.default;
      }
    }
    
    // Add Docker health check if needed
    if (addHealthCheck && request.url && !request.url.includes('/health') && 
        !request.url.endsWith('.js') && !request.url.endsWith('.css')) {
      const serviceName = request.url.split('/')[1];
      
      if (serviceName && !serviceName.includes('.')) {
        // Store original request to continue after health check
        const originalRequest = { ...request };
        
        // Add health check before original request
        const healthEndpoint = `/${serviceName}${dockerConfig.docker.healthCheckEndpoint}`;
        
        // Don't await this, just log any issues
        axios({
          url: healthEndpoint,
          method: 'GET',
          timeout: 2000
        }).catch(healthError => {
          console.warn(`Health check failed for service ${serviceName}:`, healthError);
          // Don't propagate health check errors
        });
      }
    }
    
    return request;
  });
  
  // Response interceptor for Docker error handling
  const responseInterceptor = axios.interceptors.response.use(
    response => response,
    async error => {
      // Request info for error reporting
      const requestInfo = {
        url: error.config.url,
        method: error.config.method.toUpperCase(),
        headers: error.config.headers,
        timestamp: new Date().toISOString(),
        timeout: error.config.timeout,
        isDocker: true,
        targetService: error.config.url.split('/')[1] || 'unknown'
      };
      
      // Determine if this is a Docker networking error
      error.isDockerNetworkError = isDockerNetworkError(error);
      
      // Offline handling
      if (!isOnline()) {
        const offlineError = new Error('Docker network request failed: Container is offline');
        offlineError.name = 'DockerOfflineError';
        offlineError.originalError = error;
        offlineError.isDockerNetworkError = true;
        
        reportError(
          offlineError,
          { 
            request: requestInfo,
            container: containerInfo,
            isDockerEnvironment: true
          },
          'dockerNetworkErrorHandler',
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
        maxRetries: dockerConfig.retry.maxRetries
      } : {
        count: 0,
        maxRetries: dockerConfig.retry.maxRetries
      };
      
      // Check if we should retry
      if (
        retryConfig.count < retryConfig.maxRetries && 
        (error.isDockerNetworkError || 
         (error.response && dockerConfig.retry.statusCodesToRetry.includes(error.response.status)) ||
         (dockerConfig.retry.shouldRetry && dockerConfig.retry.shouldRetry(error, requestInfo, retryConfig.count)))
      ) {
        retryConfig.count++;
        error.config._retryCount = retryConfig.count;
        
        // Wait before retrying
        const delay = dockerConfig.retry.initialDelay * Math.pow(dockerConfig.retry.backoffFactor, retryConfig.count);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return axios(error.config);
      }
      
      // Format and report error if we're not retrying
      const formattedError = formatDockerNetworkError(error, requestInfo, containerInfo);
      
      // Propagate error if enabled and it's a Docker network error
      if (propagateErrors && errorPropagation && error.isDockerNetworkError) {
        try {
          errorPropagation.propagateError(error, {
            severity: error.response && error.response.status < 500 ? 'warning' : 'error',
            metadata: { 
              request: requestInfo,
              formatted: formattedError
            }
          }).catch(() => {
            // Ignore propagation errors
          });
        } catch (e) {
          // Ignore errors in error propagation
        }
      }
      
      // Determine severity based on status code
      const severity = error.response && error.response.status < 500
        ? ErrorSeverity.WARNING
        : ErrorSeverity.ERROR;
      
      reportError(
        error,
        { 
          request: requestInfo, 
          formatted: formattedError,
          container: containerInfo,
          isDockerEnvironment: true
        },
        'dockerNetworkErrorHandler',
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
 * React hook for Docker-aware network error handling
 * Works with the network error boundary or standalone
 * 
 * @returns {Object} Docker network error handling utilities
 * 
 * @example
 * function DataLoaderComponent() {
 *   const { 
 *     dockerFetch,
 *     isLoading,
 *     error,
 *     retry,
 *     clearError,
 *     propagateToContainers
 *   } = useDockerNetworkErrorHandler();
 *   
 *   // Use for fetching data
 *   useEffect(() => {
 *     const fetchData = async () => {
 *       try {
 *         setIsLoading(true);
 *         const response = await dockerFetch('/api/data');
 *         const data = await response.json();
 *         setData(data);
 *       } catch (err) {
 *         // The hook will handle the error automatically
 *       } finally {
 *         setIsLoading(false);
 *       }
 *     };
 *     
 *     fetchData();
 *   }, [dockerFetch]);
 * }
 */
export function useDockerNetworkErrorHandler() {
  // Try to use container error propagation
  let containerErrorPropagation = null;
  
  try {
    containerErrorPropagation = useContainerErrorPropagation();
  } catch (e) {
    // Ignore error if ContainerErrorProvider is not available
  }
  
  // Create container-aware fetch
  const containerInfo = containerErrorPropagation ? {
    containerId: containerErrorPropagation.containerId,
  } : {};
  
  // Create Docker-aware fetch
  const dockerFetch = createDockerFetchWithErrorHandling(window.fetch, {
    containerInfo,
    propagateErrors: Boolean(containerErrorPropagation)
  });
  
  // Propagate error to other containers
  const propagateToContainers = containerErrorPropagation ? 
    (error, options = {}) => containerErrorPropagation.propagateError(error, options) :
    () => Promise.resolve(false);
  
  return {
    // Docker network fetch
    dockerFetch,
    
    // Axios interceptor creator
    createDockerAxiosInterceptor: (axios) => createDockerAxiosErrorInterceptor(axios, {
      containerInfo,
      propagateErrors: Boolean(containerErrorPropagation)
    }),
    
    // Container error utilities
    propagateToContainers,
    containerInfo,
    
    // Helper utilities
    isDockerNetworkError,
    parseErrorResponse,
    getHttpStatusMessage,
    
    // Hook is connected to container error context
    isConnectedToErrorContext: Boolean(containerErrorPropagation)
  };
}

// Export Docker-enhanced fetch by default
export const dockerFetch = createDockerFetchWithErrorHandling();