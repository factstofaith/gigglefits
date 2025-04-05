/**
 * Docker Error Service
 * 
 * This module extends the base error service to provide Docker-specific error
 * handling capabilities, ensuring that errors are properly logged to stdout/stderr
 * for container log capture and monitoring.
 */

import { 
  reportError, 
  logError, 
  setErrorMetadata, 
  initErrorService,
  resetErrorService,
  handleAsyncError,
  withErrorHandling,
  ErrorSeverity
} from '../error-service';

import { ENV } from '@/utils/environmentConfig';

// Docker-specific configuration
const DOCKER_CONFIG = {
  // Always enable error logging in Docker environments
  logErrors: true,
  
  // Set container-specific metadata
  metadata: {
    containerized: true,
    containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown',
    containerVersion: ENV.REACT_APP_CONTAINER_VERSION || 'unknown',
    dockerEnvironment: ENV.REACT_APP_DOCKER_ENVIRONMENT || 'production'
  },
  
  // Configure Docker-specific error handling
  groupSimilarErrors: true,
  maxErrorsPerSession: parseInt(ENV.REACT_APP_MAX_ERRORS_PER_SESSION || '100', 10),
  
  // Override endpoints for Docker environments
  endpoints: {
    errorReporting: ENV.REACT_APP_ERROR_REPORTING_URL || '/api/errors',
    healthCheck: ENV.REACT_APP_HEALTH_CHECK_URL || '/health'
  }
};

/**
 * Initialize Docker error service
 * @param {Object} customConfig - Custom configuration to override defaults
 */
export function initDockerErrorService(customConfig = {}) {
  // Initialize the base error service with Docker configuration
  initErrorService({
    ...DOCKER_CONFIG,
    ...customConfig
  });
  
  // Add Docker-specific error metadata
  setErrorMetadata(DOCKER_CONFIG.metadata);
  
  // Set up container-specific error handlers
  configureContainerErrorHandlers();
  
  // Log initialization for container logs
  console.log('[DOCKER] Error service initialized with Docker-specific configuration');
}

/**
 * Configure container-specific error handlers
 */
function configureContainerErrorHandlers() {
  // Override console.error to ensure proper stdout logging
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Call original console.error
    originalConsoleError.apply(this, args);
    
    // Ensure the error is written to container logs in a structured format
    const errorMessage = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, Object.getOwnPropertyNames(arg)) : String(arg)
    ).join(' ');
    
    // Write to stdout with container log format
    process.stdout && process.stdout.write && 
      process.stdout.write(`ERROR: ${new Date().toISOString()} - ${errorMessage}\n`);
  };
  
  // Add periodic health check logging
  if (ENV.REACT_APP_HEALTH_CHECK_INTERVAL) {
    const interval = parseInt(ENV.REACT_APP_HEALTH_CHECK_INTERVAL, 10);
    if (!isNaN(interval) && interval > 0) {
      setInterval(logContainerHealth, interval);
    }
  }
}

/**
 * Report an error with Docker-specific context
 * @param {Error} error - The error object
 * @param {Object} errorInfo - Additional error information
 * @param {string} boundary - The component boundary
 * @param {string} severity - Error severity level
 * @returns {string} The error ID
 */
export function reportDockerError(error, errorInfo = {}, boundary = 'docker', severity = ErrorSeverity.ERROR) {
  // Add Docker-specific context to error info
  const enhancedErrorInfo = {
    ...errorInfo,
    docker: {
      containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown',
      containerVersion: ENV.REACT_APP_CONTAINER_VERSION || 'unknown',
      dockerEnvironment: ENV.REACT_APP_DOCKER_ENVIRONMENT || 'production',
      timestamp: new Date().toISOString()
    }
  };
  
  // Use base error reporting with enhanced info
  return reportError(error, enhancedErrorInfo, boundary, severity);
}

/**
 * Log container health information
 */
function logContainerHealth() {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    memory: window.performance && window.performance.memory ? {
      usedJSHeapSize: window.performance.memory.usedJSHeapSize,
      totalJSHeapSize: window.performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
    } : 'unavailable',
    containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown',
    containerVersion: ENV.REACT_APP_CONTAINER_VERSION || 'unknown'
  };
  
  // Log health data to console for container logs
  console.log(`[DOCKER_HEALTH] ${JSON.stringify(healthData)}`);
  
  // Report health status to API endpoint if configured
  if (DOCKER_CONFIG.endpoints.healthCheck) {
    fetch(DOCKER_CONFIG.endpoints.healthCheck, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(healthData),
      keepalive: true
    }).catch(err => {
      console.error('[DOCKER_HEALTH] Failed to report health status:', err);
    });
  }
}

/**
 * Create an error handler function for Docker component errors
 * @param {string} componentName - The Docker component name
 * @returns {Function} Error handler function for the component
 */
export function createDockerComponentErrorHandler(componentName) {
  return (error, errorInfo = {}) => {
    return reportDockerError(error, errorInfo, `docker:${componentName}`, ErrorSeverity.ERROR);
  };
}

/**
 * HOC to wrap a component with Docker error handling
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} options - Error handling options
 * @returns {React.ComponentType} Wrapped component with Docker error handling
 */
export function withDockerErrorHandling(Component, options = {}) {
  const { 
    boundary = Component.displayName || Component.name || 'DockerComponent',
    severity = ErrorSeverity.ERROR,
    logToStdout = true
  } = options;
  
  // Return the original component if not in a Docker environment
  if (ENV.REACT_APP_RUNNING_IN_DOCKER !== 'true') {
    return Component;
  }
  
  // Create a wrapper component with Docker error handling
  const WrappedComponent = (props) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      // Report the error with Docker context
      reportDockerError(error, { props }, `docker:${boundary}`, severity);
      
      // Log to stdout if enabled
      if (logToStdout) {
        console.error(`[DOCKER_COMPONENT_ERROR] ${boundary}:`, error);
      }
      
      // Return error fallback UI
      return (
        <div className="docker-error-fallback" data-component={boundary}>
          <h3>Component Error</h3>
          <p>An error occurred in this component.</p>
          <details>
            <summary>Error Details</summary>
            <pre>{error.message}</pre>
          </details>
        </div>
      );
    }
  };
  
  // Set display name for debugging
  WrappedComponent.displayName = `WithDockerErrorHandling(${boundary})`;
  
  return WrappedComponent;
}

// Initialize Docker error service if running in a Docker environment
if (ENV.REACT_APP_RUNNING_IN_DOCKER === 'true') {
  initDockerErrorService();
}

/**
 * Log a container error from the error page
 * @param {Object} errorDetails - Details about the error
 */
export function logContainerError(errorDetails = {}) {
  try {
    // Enhanced error details with container information
    const enhancedDetails = {
      ...errorDetails,
      containerInfo: {
        containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown',
        containerVersion: ENV.REACT_APP_CONTAINER_VERSION || 'unknown',
        dockerEnvironment: ENV.REACT_APP_DOCKER_ENVIRONMENT || 'production'
      },
      timestamp: errorDetails.time || new Date().toISOString(),
      source: 'docker-error.html'
    };
    
    // Write to console for container logging
    console.error('[DOCKER_ERROR_PAGE]', JSON.stringify(enhancedDetails));
    
    // Send to error reporting endpoint if available
    if (DOCKER_CONFIG.endpoints.errorReporting) {
      fetch(DOCKER_CONFIG.endpoints.errorReporting, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'container_error',
          details: enhancedDetails
        }),
        keepalive: true
      }).catch(err => {
        console.error('[DOCKER_ERROR_PAGE] Failed to report error:', err);
      });
    }
    
    return true;
  } catch (e) {
    console.error('[DOCKER_ERROR_PAGE] Failed to log container error:', e);
    return false;
  }
}

// Expose the service to the window for use by the error page
if (typeof window !== 'undefined') {
  window.dockerErrorService = {
    logContainerError,
    reportDockerError
  };
}

// Export Docker error service
export default {
  initDockerErrorService,
  reportDockerError,
  createDockerComponentErrorHandler,
  withDockerErrorHandling,
  logContainerHealth,
  logContainerError,
  ErrorSeverity
};