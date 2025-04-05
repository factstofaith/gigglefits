/**
 * Error handling service for TAP Integration Platform
 * 
 * This service provides centralized error handling, reporting, and logging
 * capabilities for the frontend application. It implements a comprehensive
 * error management strategy with configurable severity levels, contextual
 * metadata, and integration with monitoring services.
 */

// Import environment configuration
import { getEnv, getBoolEnv } from "@/config/env";

// Default configuration
const DEFAULT_CONFIG = {
  // Enable error reporting to external service
  reportErrors: getBoolEnv('REACT_APP_ERROR_REPORTING_ENABLED', true),

  // Log errors to console
  logErrors: getBoolEnv('REACT_APP_ERROR_LOGGING_ENABLED', true),

  // Minimum severity level to report (debug, info, warning, error, critical)
  minReportSeverity: getEnv('REACT_APP_MIN_REPORT_SEVERITY', 'warning'),

  // Maximum number of errors to report per session to prevent flooding
  maxErrorsPerSession: parseInt(getEnv('REACT_APP_MAX_ERRORS_PER_SESSION', '50'), 10),

  // Group similar errors to reduce noise
  groupSimilarErrors: getBoolEnv('REACT_APP_GROUP_SIMILAR_ERRORS', true),

  // External error reporting endpoints
  endpoints: {
    errorReporting: getEnv('REACT_APP_ERROR_REPORTING_URL', '/api/errors'),
    errorMonitoring: getEnv('REACT_APP_ERROR_MONITORING_URL', '/api/monitoring')
  }
};

// Error severity levels
export const ErrorSeverity = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Internal state
const internalState = {
  config: { ...DEFAULT_CONFIG },
  errorCount: 0,
  errorGroups: new Map(), // For grouping similar errors
  initialized: false,
  metadata: {
    sessionId: generateSessionId(),
    userAgent: window.navigator.userAgent,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    version: getEnv('REACT_APP_VERSION', 'unknown')
  }
};

/**
 * Generate a unique session ID
 * @returns {string} A unique session ID
 */
function generateSessionId() {
  return 'session_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2);
}

/**
 * Initialize the error service with custom configuration
 * @param {Object} customConfig - Custom configuration to override defaults
 */
export function initErrorService(customConfig = {}) {
  if (internalState.initialized) {
    console.warn('Error service already initialized. Call resetErrorService() first to reinitialize.');
    return;
  }

  internalState.config = {
    ...DEFAULT_CONFIG,
    ...customConfig
  };

  // Set up global error handlers
  configureGlobalErrorHandlers();

  internalState.initialized = true;

  if (internalState.config.logErrors) {
    console.log('Error service initialized:', internalState.config);
  }
}

/**
 * Reset the error service state
 */
export function resetErrorService() {
  internalState.errorCount = 0;
  internalState.errorGroups.clear();
  internalState.initialized = false;
  internalState.metadata = {
    ...internalState.metadata,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
}

/**
 * Configure global error handlers
 */
function configureGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason || new Error('Unhandled Promise Rejection');
    reportError(error, {
      type: 'unhandledrejection',
      promise: event.promise
    }, 'global', ErrorSeverity.ERROR);
  });

  // Handle uncaught exceptions
  window.addEventListener('error', (event) => {
    // Prevent handling the same error twice
    if (event.error) {
      reportError(event.error, {
        type: 'uncaughtexception',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message
      }, 'global', ErrorSeverity.ERROR);
    }
  });
}

/**
 * Report an error to the error service
 * @param {Error} error - The error object
 * @param {Object} [errorInfo={}] - Additional error information
 * @param {string} [boundary='unknown'] - The error boundary or component that caught the error
 * @param {string} [severity=ErrorSeverity.ERROR] - Error severity level
 * @returns {string} The error ID
 */
export function reportError(error, errorInfo = {}, boundary = 'unknown', severity = ErrorSeverity.ERROR) {
  if (!internalState.initialized) {
    initErrorService();
  }

  // Check if we should report this error based on severity
  if (!shouldReportError(severity)) {
    return null;
  }

  // Check if we've reached the max errors per session
  if (internalState.errorCount >= internalState.config.maxErrorsPerSession) {
    if (internalState.config.logErrors && internalState.errorCount === internalState.config.maxErrorsPerSession) {
      console.warn(`Reached maximum error reporting limit (${internalState.config.maxErrorsPerSession}). Additional errors will not be reported.`);
      internalState.errorCount++; // Increment to avoid logging this warning again
    }
    return null;
  }

  // Generate error ID
  const errorId = generateErrorId(error);

  // Prepare error data
  const errorData = prepareErrorData(error, errorInfo, boundary, severity, errorId);

  // Group similar errors if enabled
  if (internalState.config.groupSimilarErrors) {
    const errorGroupKey = generateErrorGroupKey(error);

    if (internalState.errorGroups.has(errorGroupKey)) {
      const group = internalState.errorGroups.get(errorGroupKey);
      group.count++;
      group.lastSeen = new Date().toISOString();

      // Only report repeated errors periodically
      if (group.count % 10 !== 0) {
        // Log to console if enabled
        if (internalState.config.logErrors) {
          console.error(`[${severity.toUpperCase()}] [${boundary}] [${errorId}] Error occurred (${group.count}x):`, error);
        }
        return errorId;
      }

      // Add group info to error data
      errorData.groupInfo = {
        count: group.count,
        firstSeen: group.firstSeen,
        lastSeen: group.lastSeen
      };
    } else {
      // First occurrence of this error group
      internalState.errorGroups.set(errorGroupKey, {
        count: 1,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      });
    }
  }

  // Increment error count
  internalState.errorCount++;

  // Log to console if enabled
  if (internalState.config.logErrors) {
    console.error(`[${severity.toUpperCase()}] [${boundary}] [${errorId}] Error occurred:`, error, errorInfo);
  }

  // Report to external service if enabled
  if (internalState.config.reportErrors) {
    sendErrorToReportingService(errorData);
  }

  return errorId;
}

/**
 * Manually log an error without reporting it
 * @param {string} message - Error message
 * @param {Object} [data={}] - Additional data to log
 * @param {string} [severity=ErrorSeverity.INFO] - Error severity level
 */
export function logError(message, data = {}, severity = ErrorSeverity.INFO) {
  if (!internalState.initialized) {
    initErrorService();
  }

  if (internalState.config.logErrors) {
    switch (severity) {
      case ErrorSeverity.DEBUG:
        console.debug(`[${severity.toUpperCase()}] ${message}`, data);
        break;
      case ErrorSeverity.INFO:
        console.info(`[${severity.toUpperCase()}] ${message}`, data);
        break;
      case ErrorSeverity.WARNING:
        console.warn(`[${severity.toUpperCase()}] ${message}`, data);
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        console.error(`[${severity.toUpperCase()}] ${message}`, data);
        break;
      default:
        console.log(`[${severity.toUpperCase()}] ${message}`, data);
    }
  }
}

/**
 * Set global metadata for error context
 * @param {Object} metadata - Metadata to set
 */
export function setErrorMetadata(metadata = {}) {
  if (!internalState.initialized) {
    initErrorService();
  }

  internalState.metadata = {
    ...internalState.metadata,
    ...metadata,
    timestamp: new Date().toISOString()
  };
}

/**
 * Check if an error should be reported based on its severity
 * @param {string} severity - Error severity level
 * @returns {boolean} Whether the error should be reported
 */
function shouldReportError(severity) {
  const severityLevels = {
    [ErrorSeverity.DEBUG]: 0,
    [ErrorSeverity.INFO]: 1,
    [ErrorSeverity.WARNING]: 2,
    [ErrorSeverity.ERROR]: 3,
    [ErrorSeverity.CRITICAL]: 4
  };

  const configuredLevel = severityLevels[internalState.config.minReportSeverity] || 2;
  const errorLevel = severityLevels[severity] || 2;

  return errorLevel >= configuredLevel;
}

/**
 * Generate a unique ID for an error
 * @param {Error} error - The error object
 * @returns {string} A unique error ID
 */
function generateErrorId(error) {
  const timestamp = Date.now().toString(36);
  const errorName = error.name || 'Unknown';
  const randomId = Math.random().toString(36).substring(2, 7);

  return `${errorName}_${timestamp}_${randomId}`;
}

/**
 * Generate a key for grouping similar errors
 * @param {Error} error - The error object
 * @returns {string} A key for grouping similar errors
 */
function generateErrorGroupKey(error) {
  // Get the first line of the stack trace or the error message
  const stackLine = error.stack ? error.stack.split('\n')[1] || error.message : error.message;
  const errorName = error.name || 'Unknown';

  return `${errorName}_${stackLine}`;
}

/**
 * Prepare error data for reporting
 * @param {Error} error - The error object
 * @param {Object} errorInfo - Additional error information
 * @param {string} boundary - The component boundary
 * @param {string} severity - Error severity level
 * @param {string} errorId - Unique error ID
 * @returns {Object} Prepared error data
 */
function prepareErrorData(error, errorInfo, boundary, severity, errorId) {
  return {
    // Error identification
    errorId,
    name: error.name,
    message: error.message,
    stack: error.stack,

    // Error context
    boundary,
    severity,
    componentStack: errorInfo.componentStack,

    // Additional error info
    info: errorInfo,

    // Global metadata
    metadata: {
      ...internalState.metadata,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Send error data to the reporting service
 * @param {Object} errorData - Prepared error data
 */
function sendErrorToReportingService(errorData) {
  try {
    // Use fetch API to send the error data to the reporting service
    fetch(internalState.config.endpoints.errorReporting, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorData),
      // Use keepalive to ensure the request completes even if the page is unloading
      keepalive: true
    }).catch((err) => {
      // Log the failure but don't report it (to avoid infinite loops)
      if (internalState.config.logErrors) {
        console.error('Failed to report error:', err);
      }
    });
  } catch (err) {
    // Log the failure but don't report it (to avoid infinite loops)
    if (internalState.config.logErrors) {
      console.error('Failed to report error:', err);
    }
  }
}

/**
 * Create an error handler function for async operations
 * @param {string} [boundary='async'] - The error boundary or component name
 * @param {string} [severity=ErrorSeverity.ERROR] - Error severity level
 * @param {Function} [callback] - Callback function to execute when an error occurs
 * @returns {Function} Error handler function
 * 
 * @example
 * // Usage with async/await
 * async function fetchData() {
 *   try {
 *     const data = await apiCall();
 *     return data;
 *   } catch (error) {
 *     handleAsyncError('fetchData')(error);
 *     return null;
 *   }
 * }
 * 
 * @example
 * // Usage with promises
 * fetchData()
 *   .then(handleData)
 *   .catch(handleAsyncError('fetchData'));
 */
export function handleAsyncError(boundary = 'async', severity = ErrorSeverity.ERROR, callback) {
  return (error) => {
    reportError(error, { type: 'async' }, boundary, severity);
    if (typeof callback === 'function') {
      callback(error);
    }
    return error; // Return the error to allow for further chaining
  };
}

/**
 * Wrap a function with error handling
 * @param {Function} fn - Function to wrap
 * @param {string} [boundary='function'] - The error boundary or function name
 * @param {string} [severity=ErrorSeverity.ERROR] - Error severity level
 * @returns {Function} Wrapped function with error handling
 * 
 * @example
 * const safeFunction = withErrorHandling(riskyFunction, 'myComponent');
 * // Now you can call safeFunction without try/catch
 */
export function withErrorHandling(fn, boundary = 'function', severity = ErrorSeverity.ERROR) {
  return (...args) => {
    try {
      const result = fn(...args);

      // Handle async functions (those that return a promise)
      if (result instanceof Promise) {
        return result.catch(handleAsyncError(boundary, severity));
      }

      return result;
    } catch (error) {
      reportError(error, { args }, boundary, severity);
      throw error; // Re-throw to maintain original behavior
    }
  };
}

// Initialize error service by default
if (!internalState.initialized) {
  initErrorService();
}

// Export default object for simpler imports
export default {
  reportError,
  logError,
  setErrorMetadata,
  initErrorService,
  resetErrorService,
  handleAsyncError,
  withErrorHandling,
  ErrorSeverity
};