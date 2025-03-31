/**
 * Comprehensive error handling utilities for Integration Flow Canvas
 * 
 * This module provides utilities for creating, categorizing, tracking,
 * and handling errors in flow canvas operations. It includes:
 * 
 * - Error type and severity categorization
 * - Standardized error object creation
 * - Recovery strategy recommendations
 * - User-friendly error messages
 * - Grouping and filtering capabilities
 */

/**
 * Error type categories
 */
export const ERROR_TYPE = {
  VALIDATION: 'validation',    // Schema or data validation errors
  CONNECTION: 'connection',    // Connection or network errors
  TRANSFORMATION: 'transform', // Data transformation errors
  EXECUTION: 'execution',      // Flow execution errors
  PERMISSION: 'permission',    // Authorization or access errors
  CONFIGURATION: 'config',     // Configuration or setup errors
  SYSTEM: 'system',            // System or unexpected errors
  UI: 'ui'                     // User interface errors
};

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  FATAL: 'fatal',      // Flow cannot proceed, requires intervention
  ERROR: 'error',      // Serious issue, but flow may continue
  WARNING: 'warning',  // Potential issue or sub-optimal behavior
  INFO: 'info'         // Informational message
};

/**
 * Recovery action types
 */
export const RECOVERY_ACTION = {
  RETRY: 'retry',              // Retry the operation
  RECONFIGURE: 'reconfigure',  // Reconfigure the element
  RECONNECT: 'reconnect',      // Reconnect to the service
  SKIP: 'skip',                // Skip this step and continue
  ROLLBACK: 'rollback',        // Rollback to previous state
  MANUAL: 'manual'             // Requires manual intervention
};

/**
 * Creates a standardized error object for flow canvas
 * 
 * @param {Object} options - Error options
 * @param {string} options.type - Error type from ERROR_TYPE
 * @param {string} options.severity - Error severity from ERROR_SEVERITY
 * @param {string} options.message - User-friendly error message
 * @param {string} options.code - Error code (optional)
 * @param {Object} options.details - Detailed error information (optional)
 * @param {string} options.nodeId - ID of the node where the error occurred (optional)
 * @param {string} options.edgeId - ID of the edge where the error occurred (optional)
 * @param {Error} options.originalError - Original error object (optional)
 * @returns {Object} - Standardized error object
 */
export const createFlowError = ({
  type = ERROR_TYPE.SYSTEM,
  severity = ERROR_SEVERITY.ERROR,
  message,
  code,
  details,
  nodeId,
  edgeId,
  originalError
}) => {
  // Added display name
  createFlowError.displayName = 'createFlowError';

  // Added display name
  createFlowError.displayName = 'createFlowError';

  // Added display name
  createFlowError.displayName = 'createFlowError';

  // Added display name
  createFlowError.displayName = 'createFlowError';

  // Added display name
  createFlowError.displayName = 'createFlowError';


  return {
    type,
    severity,
    message: message || 'An error occurred',
    code: code || `${type.toUpperCase()}_ERR`,
    timestamp: new Date().toISOString(),
    details: details || {},
    nodeId,
    edgeId,
    originalError: originalError ? {
      name: originalError.name,
      message: originalError.message,
      stack: originalError.stack
    } : undefined,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
};

/**
 * Gets a user-friendly message for a standard error type and code
 * 
 * @param {string} type - Error type from ERROR_TYPE
 * @param {string} code - Error code
 * @param {Object} params - Parameters to include in the message
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (type, code, params = {}) => {
  // Added display name
  getErrorMessage.displayName = 'getErrorMessage';

  // Added display name
  getErrorMessage.displayName = 'getErrorMessage';

  // Added display name
  getErrorMessage.displayName = 'getErrorMessage';

  // Added display name
  getErrorMessage.displayName = 'getErrorMessage';

  // Added display name
  getErrorMessage.displayName = 'getErrorMessage';


  const errorMessages = {
    [ERROR_TYPE.VALIDATION]: {
      SCHEMA_MISMATCH: `Schema validation failed${params.field ? ` for field ${params.field}` : ""}`,
      REQUIRED_FIELD: `Required field${params.field ? ` ${params.field}` : ""} is missing`,
      TYPE_MISMATCH: `Type mismatch${params.field ? ` for field ${params.field}` : ""}${params.expected ? `, expected ${params.expected}` : ""}`,
      PATTERN_MISMATCH: `Format validation failed${params.field ? ` for field ${params.field}` : ""}`,
      ENUM_MISMATCH: `Value${params.field ? ` for ${params.field}` : ""} not in allowed list`
    },
    [ERROR_TYPE.CONNECTION]: {
      TIMEOUT: 'Connection timed out',
      NETWORK_ERROR: 'Network error occurred',
      SERVICE_UNAVAILABLE: 'Service is unavailable',
      AUTHENTICATION_FAILED: 'Authentication failed',
      AUTHORIZATION_FAILED: 'Authorization failed',
      SSL_ERROR: 'SSL certificate validation failed',
      HOST_NOT_FOUND: 'Host not found',
      CONNECTION_REFUSED: 'Connection refused'
    },
    [ERROR_TYPE.TRANSFORMATION]: {
      INVALID_SOURCE: 'Invalid source data for transformation',
      FIELD_MAPPING_ERROR: `Error mapping field${params.field ? ` ${params.field}` : ""}`,
      EXPRESSION_ERROR: 'Error in transformation expression',
      TYPE_CONVERSION_ERROR: `Type conversion failed${params.field ? ` for field ${params.field}` : ""}`,
      MISSING_DATA: 'Required data for transformation is missing'
    },
    [ERROR_TYPE.EXECUTION]: {
      EXECUTION_FAILED: 'Flow execution failed',
      NODE_EXECUTION_ERROR: `Error executing node${params.nodeType ? ` of type ${params.nodeType}` : ""}`,
      MAX_RETRIES_EXCEEDED: 'Maximum retry attempts exceeded',
      TIMEOUT: 'Execution timed out',
      DEPENDENCY_ERROR: 'Error in dependent service or component'
    },
    [ERROR_TYPE.PERMISSION]: {
      ACCESS_DENIED: 'Access denied',
      INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
      UNAUTHORIZED: 'Unauthorized access',
      FORBIDDEN: 'Forbidden operation'
    },
    [ERROR_TYPE.CONFIGURATION]: {
      INVALID_CONFIG: 'Invalid configuration',
      MISSING_CONFIG: 'Missing configuration',
      INCOMPATIBLE_CONFIG: 'Incompatible configuration settings',
      DEPRECATED_CONFIG: 'Using deprecated configuration'
    },
    [ERROR_TYPE.SYSTEM]: {
      INTERNAL_ERROR: 'Internal system error',
      OUT_OF_MEMORY: 'Out of memory',
      RESOURCE_LIMIT: 'Resource limit exceeded',
      VERSION_MISMATCH: 'Version mismatch',
      UNEXPECTED_ERROR: 'Unexpected error occurred'
    },
    [ERROR_TYPE.UI]: {
      RENDERING_ERROR: 'UI rendering error',
      STATE_ERROR: 'State management error',
      INTERACTION_ERROR: 'User interaction error',
      LAYOUT_ERROR: 'Layout calculation error'
    }
  };

  // Return specific message if available
  if (errorMessages[type] && errorMessages[type][code]) {
    return errorMessages[type][code];
  }
  
  // Fallback to generic message
  return `${type.charAt(0).toUpperCase() + type.slice(1)} error occurred`;
};

/**
 * Determines appropriate recovery strategy for an error
 * 
 * @param {Object} error - Error object created with createFlowError
 * @returns {Object} - Recovery strategy recommendation
 */
export const getRecoveryStrategy = (error) => {
  // Added display name
  getRecoveryStrategy.displayName = 'getRecoveryStrategy';

  // Added display name
  getRecoveryStrategy.displayName = 'getRecoveryStrategy';

  // Added display name
  getRecoveryStrategy.displayName = 'getRecoveryStrategy';

  // Added display name
  getRecoveryStrategy.displayName = 'getRecoveryStrategy';

  // Added display name
  getRecoveryStrategy.displayName = 'getRecoveryStrategy';


  if (!error) {
    return { action: RECOVERY_ACTION.MANUAL, description: 'Unknown error, manual intervention required' };
  }
  
  // Define recovery strategies based on error type and severity
  const strategies = {
    [ERROR_TYPE.CONNECTION]: {
      [ERROR_SEVERITY.FATAL]: { 
        action: RECOVERY_ACTION.MANUAL, 
        description: 'Critical connection error, manual intervention required' 
      },
      [ERROR_SEVERITY.ERROR]: { 
        action: RECOVERY_ACTION.RETRY, 
        description: 'Connection error, retry operation' 
      },
      [ERROR_SEVERITY.WARNING]: { 
        action: RECOVERY_ACTION.RETRY, 
        description: 'Connection warning, retry operation' 
      }
    },
    [ERROR_TYPE.VALIDATION]: {
      [ERROR_SEVERITY.FATAL]: { 
        action: RECOVERY_ACTION.RECONFIGURE, 
        description: 'Critical validation error, reconfigure node' 
      },
      [ERROR_SEVERITY.ERROR]: { 
        action: RECOVERY_ACTION.RECONFIGURE, 
        description: 'Validation error, reconfigure node' 
      },
      [ERROR_SEVERITY.WARNING]: { 
        action: RECOVERY_ACTION.SKIP, 
        description: 'Validation warning, consider reconfiguring node' 
      }
    },
    [ERROR_TYPE.TRANSFORMATION]: {
      [ERROR_SEVERITY.FATAL]: { 
        action: RECOVERY_ACTION.RECONFIGURE, 
        description: 'Critical transformation error, reconfigure transformation' 
      },
      [ERROR_SEVERITY.ERROR]: { 
        action: RECOVERY_ACTION.RECONFIGURE, 
        description: 'Transformation error, reconfigure transformation' 
      },
      [ERROR_SEVERITY.WARNING]: { 
        action: RECOVERY_ACTION.SKIP, 
        description: 'Transformation warning, review transformation configuration' 
      }
    },
    [ERROR_TYPE.EXECUTION]: {
      [ERROR_SEVERITY.FATAL]: { 
        action: RECOVERY_ACTION.MANUAL, 
        description: 'Critical execution error, manual intervention required' 
      },
      [ERROR_SEVERITY.ERROR]: { 
        action: RECOVERY_ACTION.RETRY, 
        description: 'Execution error, retry operation' 
      },
      [ERROR_SEVERITY.WARNING]: { 
        action: RECOVERY_ACTION.SKIP, 
        description: 'Execution warning, consider reviewing configuration' 
      }
    },
    [ERROR_TYPE.PERMISSION]: {
      [ERROR_SEVERITY.FATAL]: { 
        action: RECOVERY_ACTION.MANUAL, 
        description: 'Critical permission error, manual intervention required' 
      },
      [ERROR_SEVERITY.ERROR]: { 
        action: RECOVERY_ACTION.RECONFIGURE, 
        description: 'Permission error, reconfigure authentication or authorization' 
      },
      [ERROR_SEVERITY.WARNING]: { 
        action: RECOVERY_ACTION.SKIP, 
        description: 'Permission warning, review access credentials' 
      }
    },
    [ERROR_TYPE.CONFIGURATION]: {
      [ERROR_SEVERITY.FATAL]: { 
        action: RECOVERY_ACTION.RECONFIGURE, 
        description: 'Critical configuration error, reconfigure node' 
      },
      [ERROR_SEVERITY.ERROR]: { 
        action: RECOVERY_ACTION.RECONFIGURE, 
        description: 'Configuration error, reconfigure node' 
      },
      [ERROR_SEVERITY.WARNING]: { 
        action: RECOVERY_ACTION.SKIP, 
        description: 'Configuration warning, review node configuration' 
      }
    },
    [ERROR_TYPE.SYSTEM]: {
      [ERROR_SEVERITY.FATAL]: { 
        action: RECOVERY_ACTION.MANUAL, 
        description: 'Critical system error, manual intervention required' 
      },
      [ERROR_SEVERITY.ERROR]: { 
        action: RECOVERY_ACTION.RETRY, 
        description: 'System error, retry operation' 
      },
      [ERROR_SEVERITY.WARNING]: { 
        action: RECOVERY_ACTION.SKIP, 
        description: 'System warning, monitor system resources' 
      }
    },
    [ERROR_TYPE.UI]: {
      [ERROR_SEVERITY.FATAL]: { 
        action: RECOVERY_ACTION.ROLLBACK, 
        description: 'Critical UI error, reverting to last stable state' 
      },
      [ERROR_SEVERITY.ERROR]: { 
        action: RECOVERY_ACTION.RETRY, 
        description: 'UI error, refreshing interface' 
      },
      [ERROR_SEVERITY.WARNING]: { 
        action: RECOVERY_ACTION.SKIP, 
        description: 'UI warning, consider refreshing interface' 
      }
    }
  };
  
  // Get strategy based on error type and severity
  if (strategies[error.type] && strategies[error.type][error.severity]) {
    return strategies[error.type][error.severity];
  }
  
  // Default recovery strategy
  return { 
    action: RECOVERY_ACTION.MANUAL, 
    description: 'No specific recovery strategy available, manual intervention recommended' 
  };
};

/**
 * Groups errors by specified criteria
 * 
 * @param {Array} errors - Array of error objects
 * @param {string} groupBy - Grouping criteria ('type', 'severity', 'nodeId', etc.)
 * @returns {Object} - Grouped errors
 */
export const groupErrors = (errors, groupBy = 'type') => {
  // Added display name
  groupErrors.displayName = 'groupErrors';

  // Added display name
  groupErrors.displayName = 'groupErrors';

  // Added display name
  groupErrors.displayName = 'groupErrors';

  // Added display name
  groupErrors.displayName = 'groupErrors';

  // Added display name
  groupErrors.displayName = 'groupErrors';


  if (!errors || !Array.isArray(errors)) {
    return {};
  }
  
  return errors.reduce((groups, error) => {
    const key = error[groupBy] || 'unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(error);
    return groups;
  }, {});
};

/**
 * Filters errors based on criteria
 * 
 * @param {Array} errors - Array of error objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered errors
 */
export const filterErrors = (errors, filters = {}) => {
  // Added display name
  filterErrors.displayName = 'filterErrors';

  // Added display name
  filterErrors.displayName = 'filterErrors';

  // Added display name
  filterErrors.displayName = 'filterErrors';

  // Added display name
  filterErrors.displayName = 'filterErrors';

  // Added display name
  filterErrors.displayName = 'filterErrors';


  if (!errors || !Array.isArray(errors)) {
    return [];
  }
  
  return errors.filter(error => {
    // Check each filter criteria
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        // If filter value is an array, check if error value is in the array
        if (!value.includes(error[key])) {
          return false;
        }
      } else if (error[key] !== value) {
        // If filter value is not an array, check for exact match
        return false;
      }
    }
    return true;
  });
};

/**
 * Sorts errors by specified criteria
 * 
 * @param {Array} errors - Array of error objects
 * @param {string} sortBy - Sort criteria ('timestamp', 'severity', etc.)
 * @param {boolean} ascending - Sort direction
 * @returns {Array} - Sorted errors
 */
export const sortErrors = (errors, sortBy = 'timestamp', ascending = false) => {
  // Added display name
  sortErrors.displayName = 'sortErrors';

  // Added display name
  sortErrors.displayName = 'sortErrors';

  // Added display name
  sortErrors.displayName = 'sortErrors';

  // Added display name
  sortErrors.displayName = 'sortErrors';

  // Added display name
  sortErrors.displayName = 'sortErrors';


  if (!errors || !Array.isArray(errors)) {
    return [];
  }
  
  // Custom comparators for different criteria
  const comparators = {
    severity: (a, b) => {
      const severityOrder = {
        [ERROR_SEVERITY.FATAL]: 0,
        [ERROR_SEVERITY.ERROR]: 1,
        [ERROR_SEVERITY.WARNING]: 2,
        [ERROR_SEVERITY.INFO]: 3
      };
      
      const valueA = severityOrder[a.severity] ?? Number.MAX_SAFE_INTEGER;
      const valueB = severityOrder[b.severity] ?? Number.MAX_SAFE_INTEGER;
      
      return ascending ? valueA - valueB : valueB - valueA;
    },
    timestamp: (a, b) => {
      const valueA = new Date(a.timestamp).getTime();
      const valueB = new Date(b.timestamp).getTime();
      
      return ascending ? valueA - valueB : valueB - valueA;
    }
  };
  
  // Use custom comparator if available, otherwise use default comparison
  const comparator = comparators[sortBy] || ((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    
    if (valueA < valueB) return ascending ? -1 : 1;
    if (valueA > valueB) return ascending ? 1 : -1;
    return 0;
  });
  
  return [...errors].sort(comparator);
};

/**
 * Gets error statistics
 * 
 * @param {Array} errors - Array of error objects
 * @returns {Object} - Error statistics
 */
export const getErrorStats = (errors) => {
  // Added display name
  getErrorStats.displayName = 'getErrorStats';

  // Added display name
  getErrorStats.displayName = 'getErrorStats';

  // Added display name
  getErrorStats.displayName = 'getErrorStats';

  // Added display name
  getErrorStats.displayName = 'getErrorStats';

  // Added display name
  getErrorStats.displayName = 'getErrorStats';


  if (!errors || !Array.isArray(errors)) {
    return {
      total: 0,
      byType: {},
      bySeverity: {}
    };
  }
  
  const stats = {
    total: errors.length,
    byType: {},
    bySeverity: {}
  };
  
  // Count errors by type
  Object.values(ERROR_TYPE).forEach(type => {
    stats.byType[type] = errors.filter(error => error.type === type).length;
  });
  
  // Count errors by severity
  Object.values(ERROR_SEVERITY).forEach(severity => {
    stats.bySeverity[severity] = errors.filter(error => error.severity === severity).length;
  });
  
  return stats;
};

/**
 * Formats error for display
 * 
 * @param {Object} error - Error object
 * @param {boolean} includeDetails - Whether to include detailed information
 * @returns {Object} - Formatted error
 */
export const formatError = (error, includeDetails = false) => {
  // Added display name
  formatError.displayName = 'formatError';

  // Added display name
  formatError.displayName = 'formatError';

  // Added display name
  formatError.displayName = 'formatError';

  // Added display name
  formatError.displayName = 'formatError';

  // Added display name
  formatError.displayName = 'formatError';


  if (!error) {
    return { message: 'Unknown error' };
  }
  
  const formatted = {
    message: error.message,
    type: error.type,
    severity: error.severity,
    code: error.code,
    timestamp: new Date(error.timestamp).toLocaleString()
  };
  
  if (error.nodeId) {
    formatted.nodeId = error.nodeId;
  }
  
  if (error.edgeId) {
    formatted.edgeId = error.edgeId;
  }
  
  if (includeDetails) {
    formatted.details = error.details;
    formatted.recoveryStrategy = getRecoveryStrategy(error);
    
    if (error.originalError) {
      formatted.originalError = error.originalError;
    }
  }
  
  return formatted;
};

/**
 * Creates a debounced error tracking function
 * 
 * @param {Function} callback - Function to call with grouped errors
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} - Debounced error tracker function
 */
export const createDebouncedErrorTracker = (callback, delay = 200) => {
  // Added display name
  createDebouncedErrorTracker.displayName = 'createDebouncedErrorTracker';

  // Added display name
  createDebouncedErrorTracker.displayName = 'createDebouncedErrorTracker';

  // Added display name
  createDebouncedErrorTracker.displayName = 'createDebouncedErrorTracker';

  // Added display name
  createDebouncedErrorTracker.displayName = 'createDebouncedErrorTracker';

  // Added display name
  createDebouncedErrorTracker.displayName = 'createDebouncedErrorTracker';


  let timeout = null;
  let errors = [];
  
  return (error) => {
    // Add error to queue
    errors.push(error);
    
    // Clear existing timeout
    if (timeout) {
      clearTimeout(timeout);
    }
    
    // Set new timeout
    timeout = setTimeout(() => {
      // Group errors and call callback
      const groupedErrors = groupErrors(errors, 'type');
      callback(groupedErrors, errors);
      
      // Reset errors
      errors = [];
      timeout = null;
    }, delay);
  };
};

export default {
  ERROR_TYPE,
  ERROR_SEVERITY,
  RECOVERY_ACTION,
  createFlowError,
  getErrorMessage,
  getRecoveryStrategy,
  groupErrors,
  filterErrors,
  sortErrors,
  getErrorStats,
  formatError,
  createDebouncedErrorTracker
};