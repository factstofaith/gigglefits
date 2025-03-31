/**
 * errorTracking
 * 
 * Comprehensive error tracking system with categorization,
 * reporting, and recovery strategies.
 * 
 * Features:
 * - High performance implementation
 * - Optimized for production builds
 * - Compatible with tree shaking
 * - Minimal dependencies
 * - Error categorization and grouping
 * - Automatic recovery strategies
 * - Error analytics
 */

import { performance } from '../performance';

// Default configuration for error tracking
const defaultConfig = {
  // Maximum errors to store in memory
  maxErrors: 1000,
  // Categories to track
  categories: [
    'api',
    'rendering',
    'runtime',
    'resource',
    'promise',
    'network',
    'state',
    'validation',
    'authentication',
    'authorization',
    'unknown'
  ],
  // Enable detailed logging
  verbose: false,
  // Error sampling rate (percentage of errors to record)
  samplingRate: 100,
  // Max stack trace length
  maxStackLength: 50,
  // Group similar errors
  groupSimilarErrors: true,
  // Enable automatic recovery for recoverable errors
  enableAutoRecovery: true,
  // Storage key for persisting error data
  storageKey: 'error-tracking-data'
};

/**
 * errorTracking Configuration options
 * @typedef {Object} errorTrackingOptions
 * @property {number} maxErrors - Maximum errors to store in memory
 * @property {Array<string>} categories - Error categories to track
 * @property {boolean} verbose - Enable detailed logging
 * @property {number} samplingRate - Percentage of errors to record (0-100)
 * @property {number} maxStackLength - Maximum stack trace length to record
 * @property {boolean} groupSimilarErrors - Group similar errors together
 * @property {boolean} enableAutoRecovery - Enable automatic recovery strategies
 * @property {string} storageKey - Storage key for persisting error data
 */

/**
 * Initialize the error tracking system
 * 
 * @param {errorTrackingOptions} options - Configuration options
 * @returns {Object} Error tracking API
 */
export function errorTracking(options = {}) {
  // Track initialization performance
  const startTime = performance.now();
  
  // Merge default and custom configurations
  const config = { ...defaultConfig, ...options };
  
  // State to store errors
  const errors = [];
  const errorGroups = {};
  const recoveryStrategies = {};
  
  // Register default recovery strategies
  registerDefaultRecoveryStrategies();
  
  /**
   * Register default recovery strategies for common errors
   */
  function registerDefaultRecoveryStrategies() {
    // Network error recovery
    registerRecoveryStrategy('network', (error) => {
      return {
        action: 'retry',
        maxAttempts: 3,
        delay: 1000,
        backoff: 1.5,
        recoverable: true
      };
    });
    
    // API error recovery
    registerRecoveryStrategy('api', (error) => {
      const status = error.context?.status || error.context?.statusCode;
      
      if (status === 401 || status === 403) {
        return {
          action: 'refresh_auth',
          redirectTo: '/login',
          recoverable: false
        };
      } else if (status === 429) {
        return {
          action: 'retry',
          delay: 5000,
          maxAttempts: 3,
          recoverable: true
        };
      } else if (status >= 500) {
        return {
          action: 'retry',
          delay: 2000,
          maxAttempts: 2,
          recoverable: true
        };
      }
      return { action: 'none', recoverable: false };
    });
    
    // Resource loading error recovery
    registerRecoveryStrategy('resource', (error) => {
      return {
        action: 'retry',
        maxAttempts: 2,
        delay: 1000,
        recoverable: true
      };
    });
    
    // State management error recovery
    registerRecoveryStrategy('state', (error) => {
      return {
        action: 'reset_state',
        recoverable: true
      };
    });
  }
  
  /**
   * Track a new error
   * 
   * @param {Error|Object} error - Error object or details
   * @param {string} category - Error category
   * @param {Object} context - Additional context
   * @returns {string} Error ID
   */
  function trackError(error, category = 'unknown', context = {}) {
    // Apply sampling rate
    if (Math.random() * 100 > config.samplingRate) {
      return null;
    }
    
    // Ensure category is valid
    if (!config.categories.includes(category)) {
      category = 'unknown';
    }
    
    // Create error record
    const errorRecord = {
      id: generateErrorId(),
      timestamp: Date.now(),
      category,
      message: error.message || String(error),
      stack: processStack(error.stack || ''),
      context: sanitizeContext(context),
      url: context.url || (typeof window !== 'undefined' ? window.location.href : null),
      count: 1,
      lastOccurrence: Date.now()
    };
    
    // Check if we should group similar errors
    if (config.groupSimilarErrors) {
      const groupKey = generateGroupKey(errorRecord);
      if (errorGroups[groupKey]) {
        // Increment count for existing group
        errorGroups[groupKey].count++;
        errorGroups[groupKey].lastOccurrence = Date.now();
        errorGroups[groupKey].context.occurrences = errorGroups[groupKey].context.occurrences || [];
        errorGroups[groupKey].context.occurrences.push({
          timestamp: Date.now(),
          context: errorRecord.context
        });
        
        if (config.verbose) {
          console.log(`Grouped error: ${errorRecord.message} (${errorGroups[groupKey].count} occurrences)`);
        }
        
        return errorGroups[groupKey].id;
      } else {
        // Create new group
        errorGroups[groupKey] = errorRecord;
      }
    }
    
    // Add error to log
    errors.push(errorRecord);
    
    // Enforce max errors limit
    if (errors.length > config.maxErrors) {
      errors.shift();
    }
    
    // Log error if verbose
    if (config.verbose) {
      console.error(`Error tracked [${category}]: ${errorRecord.message}`);
    }
    
    // Attempt recovery if enabled
    if (config.enableAutoRecovery) {
      const recovery = getRecoveryStrategy(errorRecord);
      if (recovery && recovery.recoverable) {
        executeRecoveryStrategy(errorRecord, recovery);
      }
    }
    
    // Save errors to storage
    saveErrors();
    
    return errorRecord.id;
  }
  
  /**
   * Sanitize context object to remove sensitive data
   * 
   * @param {Object} context - Context object
   * @returns {Object} Sanitized context
   */
  function sanitizeContext(context) {
    const sanitized = { ...context };
    
    // Remove potentially sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'credential'];
    
    const sanitizeObj = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      Object.keys(obj).forEach(key => {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObj(obj[key]);
        }
      });
      
      return obj;
    };
    
    return sanitizeObj(sanitized);
  }
  
  /**
   * Process and normalize stack trace
   * 
   * @param {string} stack - Error stack trace
   * @returns {string} Normalized stack trace
   */
  function processStack(stack) {
    if (!stack) return 'No stack trace available';
    
    // Limit stack length
    const lines = stack.split('\n');
    if (lines.length > config.maxStackLength) {
      return lines.slice(0, config.maxStackLength).join('\n') + 
        `\n... (${lines.length - config.maxStackLength} more lines)`;
    }
    
    return stack;
  }
  
  /**
   * Generate a unique error ID
   * 
   * @returns {string} Unique error ID
   */
  function generateErrorId() {
    return 'err_' + Date.now().toString(36) + '_' + 
      Math.random().toString(36).substring(2, 10);
  }
  
  /**
   * Generate a key for grouping similar errors
   * 
   * @param {Object} error - Error record
   * @returns {string} Group key
   */
  function generateGroupKey(error) {
    // Create key based on error message and category
    // Normalize message by removing dynamic parts like timestamps and IDs
    const normalizedMessage = error.message
      .replace(/\d+/g, 'XX')  // Replace numbers with XX
      .replace(/\b[0-9a-f]{8,}\b/g, 'ID')  // Replace IDs with ID
      .replace(/[-_.@]/g, '_');  // Normalize separators
    
    return `${error.category}:${normalizedMessage}`;
  }
  
  /**
   * Register a recovery strategy for a specific error category
   * 
   * @param {string} category - Error category
   * @param {Function} strategyFn - Strategy function that returns recovery instructions
   */
  function registerRecoveryStrategy(category, strategyFn) {
    if (!config.categories.includes(category)) {
      console.warn(`Unknown error category: ${category}`);
      return;
    }
    
    recoveryStrategies[category] = strategyFn;
    
    if (config.verbose) {
      console.log(`Registered recovery strategy for ${category} errors`);
    }
  }
  
  /**
   * Get recovery strategy for a specific error
   * 
   * @param {Object} error - Error record
   * @returns {Object|null} Recovery strategy or null if none available
   */
  function getRecoveryStrategy(error) {
    const strategyFn = recoveryStrategies[error.category];
    
    if (!strategyFn) return null;
    
    try {
      return strategyFn(error);
    } catch (e) {
      console.error('Error determining recovery strategy:', e);
      return null;
    }
  }
  
  /**
   * Execute a recovery strategy
   * 
   * @param {Object} error - Error record
   * @param {Object} strategy - Recovery strategy
   */
  function executeRecoveryStrategy(error, strategy) {
    if (!strategy || !strategy.action) return;
    
    if (config.verbose) {
      console.log(`Executing recovery strategy for ${error.category} error: ${strategy.action}`);
    }
    
    // Implementation for common recovery strategies
    switch (strategy.action) {
      case 'retry':
        if (error.context && error.context.retryFunction) {
          const retryFn = error.context.retryFunction;
          const maxAttempts = strategy.maxAttempts || 3;
          const delay = strategy.delay || 1000;
          const backoff = strategy.backoff || 1;
          
          // Retry with exponential backoff
          setTimeout(() => {
            try {
              if (typeof retryFn === 'function') {
                retryFn();
              }
            } catch (e) {
              // If retry fails, track as a new error
              trackError(e, error.category, {
                ...error.context,
                originalError: error.message,
                retryAttempt: (error.context.retryAttempt || 0) + 1,
                maxAttempts
              });
            }
          }, delay * Math.pow(backoff, error.context.retryAttempt || 0));
        }
        break;
      
      case 'refresh_auth':
        if (typeof window !== 'undefined' && strategy.redirectTo) {
          // For browser environments, handle auth refresh
          if (window.location.pathname !== strategy.redirectTo) {
            window.location.href = strategy.redirectTo;
          }
        }
        break;
      
      case 'reset_state':
        // Reset application state (implementation depends on the app)
        if (error.context && error.context.resetStateFn) {
          try {
            error.context.resetStateFn();
          } catch (e) {
            console.error('Error resetting state:', e);
          }
        }
        break;
      
      default:
        if (config.verbose) {
          console.log(`Unknown recovery action: ${strategy.action}`);
        }
    }
  }
  
  /**
   * Save errors to storage
   */
  function saveErrors() {
    if (typeof window === 'undefined' || !config.storageKey) {
      return;
    }
    
    try {
      // Save only the last 50 errors to avoid exceeding storage limits
      const errorData = {
        errors: errors.slice(-50),
        errorGroups: Object.values(errorGroups).slice(-50),
        timestamp: Date.now()
      };
      
      localStorage.setItem(config.storageKey, JSON.stringify(errorData));
      
      if (config.verbose) {
        console.log('Error data saved to storage');
      }
    } catch (e) {
      console.error('Failed to save error data to storage:', e);
    }
  }
  
  /**
   * Load errors from storage
   * 
   * @returns {Object|null} Loaded error data or null if not found
   */
  function loadErrors() {
    if (typeof window === 'undefined' || !config.storageKey) {
      return null;
    }
    
    try {
      const storedErrors = localStorage.getItem(config.storageKey);
      if (storedErrors) {
        const parsedData = JSON.parse(storedErrors);
        
        // Restore errors from storage
        if (parsedData.errors && Array.isArray(parsedData.errors)) {
          errors.push(...parsedData.errors);
        }
        
        // Restore error groups
        if (parsedData.errorGroups && Array.isArray(parsedData.errorGroups)) {
          parsedData.errorGroups.forEach(group => {
            const key = generateGroupKey(group);
            errorGroups[key] = group;
          });
        }
        
        if (config.verbose) {
          console.log('Error data loaded from storage');
        }
        
        return parsedData;
      }
    } catch (e) {
      console.error('Failed to load error data from storage:', e);
    }
    
    return null;
  }
  
  /**
   * Clear all error data
   */
  function clearErrors() {
    errors.length = 0;
    Object.keys(errorGroups).forEach(key => delete errorGroups[key]);
    
    if (typeof window !== 'undefined' && config.storageKey) {
      try {
        localStorage.removeItem(config.storageKey);
      } catch (e) {
        console.error('Failed to clear error data from storage:', e);
      }
    }
    
    if (config.verbose) {
      console.log('Error tracking data cleared');
    }
  }
  
  /**
   * Generate error analytics
   * 
   * @returns {Object} Error analytics
   */
  function generateAnalytics() {
    const categories = {};
    const timeDistribution = {
      last5min: 0,
      last15min: 0,
      last1h: 0,
      last24h: 0,
      older: 0
    };
    
    // Time thresholds
    const now = Date.now();
    const min5 = 5 * 60 * 1000;
    const min15 = 15 * 60 * 1000;
    const hour1 = 60 * 60 * 1000;
    const hours24 = 24 * 60 * 60 * 1000;
    
    // Process errors
    const allErrors = config.groupSimilarErrors ? Object.values(errorGroups) : errors;
    
    allErrors.forEach(error => {
      // Category distribution
      if (!categories[error.category]) {
        categories[error.category] = 0;
      }
      categories[error.category] += error.count || 1;
      
      // Time distribution (using last occurrence for grouped errors)
      const timestamp = error.lastOccurrence || error.timestamp;
      const age = now - timestamp;
      
      if (age < min5) {
        timeDistribution.last5min += error.count || 1;
      } else if (age < min15) {
        timeDistribution.last15min += error.count || 1;
      } else if (age < hour1) {
        timeDistribution.last1h += error.count || 1;
      } else if (age < hours24) {
        timeDistribution.last24h += error.count || 1;
      } else {
        timeDistribution.older += error.count || 1;
      }
    });
    
    // Top errors
    const sortedErrors = [...allErrors].sort((a, b) => {
      return (b.count || 1) - (a.count || 1);
    });
    
    const topErrors = sortedErrors.slice(0, 10).map(error => ({
      id: error.id,
      message: error.message,
      category: error.category,
      count: error.count || 1,
      lastOccurrence: error.lastOccurrence || error.timestamp
    }));
    
    return {
      totalErrors: allErrors.reduce((total, error) => total + (error.count || 1), 0),
      uniqueErrors: allErrors.length,
      categoryDistribution: categories,
      timeDistribution,
      topErrors,
      timestamp: now
    };
  }
  
  // Set up global error handler if in browser
  if (typeof window !== 'undefined') {
    // Load existing errors
    loadErrors();
    
    // Set up window error handler
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      // Call original handler if it exists
      if (typeof originalOnError === 'function') {
        originalOnError.apply(this, arguments);
      }
      
      // Track the error
      trackError(error || new Error(message), 'runtime', {
        source,
        lineno,
        colno
      });
      
      // Don't prevent default handling
      return false;
    };
    
    // Set up promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
      trackError(event.reason || new Error('Unhandled Promise rejection'), 'promise', {
        promise: event.promise
      });
    });
  }
  
  // Log initialization time
  const initTime = performance.now() - startTime;
  if (initTime > 5 && config.verbose) {
    console.warn(`Error tracking initialization took ${initTime.toFixed(2)}ms, which may impact performance`);
  }
  
  // Return public API
  return {
    trackError,
    registerRecoveryStrategy,
    getRecoveryStrategy,
    generateAnalytics,
    saveErrors,
    loadErrors,
    clearErrors,
    getErrors: () => [...errors],
    getErrorGroups: () => ({ ...errorGroups }),
    getConfig: () => ({ ...config })
  };
}

/**
 * Create an ErrorBoundary component factory
 * 
 * @param {errorTrackingOptions} options - Configuration options
 * @returns {Function} Factory function to create ErrorBoundary components
 */
export function createErrorBoundaryFactory(options = {}) {
  const tracker = errorTracking(options);
  
  /**
   * Create an ErrorBoundary component
   * 
   * @param {Object} props - Component props including fallback, onError, etc.
   * @returns {React.Component} ErrorBoundary component
   */
  return function createErrorBoundary(props = {}) {
    // This would return a React component that uses the tracker
    // Implementation depends on React version and component structure
    // This is a simplified approach
    
    return {
      componentDidCatch: (error, errorInfo) => {
        tracker.trackError(error, 'rendering', {
          componentStack: errorInfo.componentStack,
          ...props.errorContext
        });
        
        if (typeof props.onError === 'function') {
          props.onError(error, errorInfo);
        }
      },
      
      render: (state, children) => {
        if (state.hasError) {
          return props.fallback || null;
        }
        return children;
      }
    };
  };
}

export default errorTracking;