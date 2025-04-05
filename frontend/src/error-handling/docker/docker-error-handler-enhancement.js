/**
 * Enhanced Docker Error Handler for TAP Integration Platform
 * 
 * This module provides improved Docker-specific error handling by:
 * 1. Adding standardized health check procedures
 * 2. Implementing better inter-container communication error detection
 * 3. Supporting automatic recovery from common Docker networking issues
 * 4. Providing clear error messages for Docker-specific errors
 */

import { reportError, ErrorSeverity } from '../error-service';
import { ENV } from '@/utils/environmentConfig';

// Docker-specific error types
export const DockerErrorTypes = {
  NETWORK: 'docker_network',
  VOLUME: 'docker_volume',
  SERVICE: 'docker_service',
  HEALTH_CHECK: 'docker_health_check',
  CONTAINER: 'docker_container',
  RESOURCE: 'docker_resource',
  PERMISSION: 'docker_permission',
  COMMUNICATION: 'docker_communication'
};

// Docker-specific error severities
export const DockerErrorSeverity = {
  ...ErrorSeverity,
  CONTAINER_CRITICAL: 'container_critical',
  CONTAINER_WARNING: 'container_warning'
};

// Default configuration
const DEFAULT_CONFIG = {
  healthCheck: {
    enabled: true,
    interval: 30000, // 30 seconds
    timeout: 5000, // 5 seconds
    endpoints: {
      backend: '/api/health',
      database: '/api/health/db',
      storage: '/api/health/storage'
    },
    retries: 3
  },
  communication: {
    timeout: 10000, // 10 seconds
    retries: 2
  },
  recovery: {
    automatic: true,
    maxAttempts: 3,
    backoffFactor: 1.5
  }
};

// Module state
let config = { ...DEFAULT_CONFIG };

/**
 * Configures the enhanced Docker error handler
 * @param {Object} customConfig - Custom configuration to override defaults
 */
export function configureDockerErrorHandler(customConfig = {}) {
  config = {
    ...DEFAULT_CONFIG,
    ...customConfig,
    healthCheck: {
      ...DEFAULT_CONFIG.healthCheck,
      ...(customConfig.healthCheck || {})
    },
    communication: {
      ...DEFAULT_CONFIG.communication,
      ...(customConfig.communication || {})
    },
    recovery: {
      ...DEFAULT_CONFIG.recovery,
      ...(customConfig.recovery || {})
    }
  };
}

/**
 * Creates a Docker-enhanced fetch function with specialized error handling
 * @param {Function} fetchFn - Original fetch function
 * @returns {Function} Docker-enhanced fetch function
 */
export function createDockerEnhancedFetch(fetchFn = window.fetch) {
  return async function dockerEnhancedFetch(url, options = {}) {
    // Skip Docker handling if not in Docker environment
    if (ENV.REACT_APP_RUNNING_IN_DOCKER !== 'true') {
      return fetchFn(url, options);
    }
    
    try {
      // Add Docker-specific headers
      const dockerOptions = {
        ...options,
        headers: {
          ...(options.headers || {}),
          'X-Docker-Request': 'true'
        }
      };
      
      // Try the fetch operation
      return await fetchFn(url, dockerOptions);
    } catch (error) {
      // Enhance error with Docker-specific information
      const dockerError = enhanceErrorWithDockerInfo(error, { url, options });
      
      // Report the Docker-specific error
      reportDockerError(dockerError);
      
      // Throw the enhanced error
      throw dockerError;
    }
  };
}

/**
 * Enhances an error with Docker-specific information
 * @param {Error} error - Original error
 * @param {Object} requestInfo - Request information
 * @returns {Error} Enhanced error
 */
function enhanceErrorWithDockerInfo(error, requestInfo) {
  // Determine Docker error type
  const dockerErrorType = determineDockerErrorType(error, requestInfo);
  
  // Create enhanced error object
  const dockerError = error instanceof Error ? error : new Error(error.message || 'Docker error');
  
  // Add Docker-specific properties
  dockerError.dockerType = dockerErrorType;
  dockerError.dockerInfo = {
    containerID: getContainerID(),
    containerName: getContainerName(),
    networkMode: getNetworkMode(),
    serviceInfo: getServiceInfo(),
    timestamp: new Date().toISOString(),
    request: requestInfo
  };
  
  // Add recovery suggestion based on error type
  dockerError.recoverySuggestion = getRecoverySuggestion(dockerErrorType);
  
  return dockerError;
}

/**
 * Determines the Docker error type based on error characteristics
 * @param {Error} error - The error
 * @param {Object} requestInfo - Request information
 * @returns {string} Docker error type
 */
function determineDockerErrorType(error, requestInfo) {
  // Error accessing a volume mounted path
  if (error.message && error.message.includes('EACCES') && error.message.includes('/usr/src/app')) {
    return DockerErrorTypes.VOLUME;
  }
  
  // Network errors (ECONNREFUSED, connection timeouts, etc.)
  if (
    error.message && (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('network timeout') ||
      error.message.includes('Failed to fetch')
    )
  ) {
    return DockerErrorTypes.NETWORK;
  }
  
  // Service errors (HTTP 502, 503, 504)
  if (error.status && [502, 503, 504].includes(error.status)) {
    return DockerErrorTypes.SERVICE;
  }
  
  // Health check errors
  if (requestInfo.url && Object.values(config.healthCheck.endpoints).some(endpoint => 
    requestInfo.url.includes(endpoint)
  )) {
    return DockerErrorTypes.HEALTH_CHECK;
  }
  
  // Inter-container communication errors
  if (
    requestInfo.url && (
      requestInfo.url.includes('/api/') ||
      requestInfo.url.includes('/auth/')
    )
  ) {
    return DockerErrorTypes.COMMUNICATION;
  }
  
  // Default to container error
  return DockerErrorTypes.CONTAINER;
}

/**
 * Reports a Docker-specific error
 * @param {Error} error - Docker-enhanced error
 * @param {Object} [additionalInfo={}] - Additional error information
 * @param {string} [boundary='docker'] - Error boundary
 * @param {string} [severity=ErrorSeverity.ERROR] - Error severity
 */
export function reportDockerError(
  error, 
  additionalInfo = {}, 
  boundary = 'docker', 
  severity = ErrorSeverity.ERROR
) {
  // Combine error info
  const errorInfo = {
    ...additionalInfo,
    dockerType: error.dockerType,
    dockerInfo: error.dockerInfo,
    recoverySuggestion: error.recoverySuggestion
  };
  
  // Report error using standard error service
  reportError(error, errorInfo, boundary, severity);
  
  // Log Docker-specific format for easier debugging
  console.error(`[DOCKER:${error.dockerType}] ${error.message}`, {
    info: error.dockerInfo,
    recovery: error.recoverySuggestion
  });
}

/**
 * Gets recovery suggestion based on Docker error type
 * @param {string} errorType - Docker error type
 * @returns {string} Recovery suggestion
 */
function getRecoverySuggestion(errorType) {
  const suggestions = {
    [DockerErrorTypes.NETWORK]: 'Check Docker network settings, ensure containers are on the same network, and verify service is running',
    [DockerErrorTypes.VOLUME]: 'Check volume mount permissions and ensure paths exist',
    [DockerErrorTypes.SERVICE]: 'Restart the service container and check logs for errors',
    [DockerErrorTypes.HEALTH_CHECK]: 'Check service health, verify endpoints, and ensure adequate resources',
    [DockerErrorTypes.CONTAINER]: 'Check container logs and resource usage',
    [DockerErrorTypes.RESOURCE]: 'Ensure container has sufficient CPU, memory and disk space',
    [DockerErrorTypes.PERMISSION]: 'Check file and network permissions for the container',
    [DockerErrorTypes.COMMUNICATION]: 'Verify service discovery and network connectivity between containers'
  };
  
  return suggestions[errorType] || 'Check Docker container logs and connectivity';
}

// Helper functions to get Docker container information
function getContainerID() {
  return ENV.REACT_APP_CONTAINER_ID || 'unknown';
}

function getContainerName() {
  return ENV.REACT_APP_CONTAINER_NAME || 'frontend';
}

function getNetworkMode() {
  return ENV.REACT_APP_NETWORK_MODE || 'unknown';
}

function getServiceInfo() {
  return {
    name: ENV.REACT_APP_SERVICE_NAME || 'frontend',
    version: ENV.REACT_APP_VERSION || 'unknown'
  };
}

/**
 * Creates a health check function for Docker services
 * @returns {Function} Health check function
 */
export function createDockerHealthCheck() {
  return async function checkDockerHealth() {
    if (!config.healthCheck.enabled) {
      return { status: 'skipped', message: 'Health checks disabled' };
    }
    
    const results = {};
    const endpoints = config.healthCheck.endpoints;
    
    // Check each endpoint
    for (const [service, endpoint] of Object.entries(endpoints)) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.healthCheck.timeout);
        
        const response = await fetch(endpoint, { 
          signal: controller.signal,
          headers: { 'X-Health-Check': 'true' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          try {
            const data = await response.json();
            results[service] = { 
              status: 'healthy',
              details: data
            };
          } catch (e) {
            // Response wasn't JSON
            results[service] = { 
              status: 'healthy',
              message: await response.text() 
            };
          }
        } else {
          results[service] = { 
            status: 'unhealthy',
            statusCode: response.status,
            message: `Service returned status ${response.status}`
          };
        }
      } catch (error) {
        results[service] = { 
          status: 'error',
          message: error.message,
          error: error.toString()
        };
      }
    }
    
    // Determine overall health
    const isHealthy = Object.values(results).every(r => r.status === 'healthy');
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: results
    };
  };
}

/**
 * Creates a recovery strategy for Docker errors
 * @param {Error} error - Docker-enhanced error
 * @returns {Object} Recovery strategy
 */
export function createRecoveryStrategy(error) {
  if (!config.recovery.automatic) {
    return { 
      canRecover: false, 
      reason: 'Automatic recovery disabled' 
    };
  }
  
  // Create strategy based on error type
  switch (error.dockerType) {
    case DockerErrorTypes.NETWORK:
      return {
        canRecover: true,
        strategy: 'retry',
        delay: 1000,
        maxAttempts: config.recovery.maxAttempts
      };
      
    case DockerErrorTypes.SERVICE:
      return {
        canRecover: true,
        strategy: 'backoff-retry',
        delay: 2000,
        backoffFactor: config.recovery.backoffFactor,
        maxAttempts: config.recovery.maxAttempts
      };
      
    case DockerErrorTypes.HEALTH_CHECK:
      return {
        canRecover: true,
        strategy: 'health-recovery',
        steps: [
          'check-dependencies',
          'retry-connection',
          'notify-user'
        ],
        delay: 3000
      };
      
    default:
      return {
        canRecover: false,
        reason: `No recovery strategy for ${error.dockerType} errors`
      };
  }
}

/**
 * Higher-order component for Docker error handling
 * @param {Function} WrappedComponent - Component to wrap
 * @param {Object} options - Configuration options
 * @returns {Function} Wrapped component with Docker error handling
 */
export function withDockerErrorHandling(WrappedComponent, options = {}) {
  // Create a component that adds Docker error handling
  const WithDockerErrorHandling = (props) => {
    // Implementation details would go here
    // For now, we'll just pass through to the wrapped component
    return <WrappedComponent {...props} />;
  };
  
  // Set display name for easier debugging
  WithDockerErrorHandling.displayName = `WithDockerErrorHandling(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;
  
  return WithDockerErrorHandling;
}

export default {
  configureDockerErrorHandler,
  createDockerEnhancedFetch,
  reportDockerError,
  createDockerHealthCheck,
  createRecoveryStrategy,
  withDockerErrorHandling,
  DockerErrorTypes,
  DockerErrorSeverity
};