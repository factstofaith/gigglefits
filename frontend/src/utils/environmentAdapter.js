/**
 * Environment Variable Adapter for SERVICE_* Standard
 * 
 * This adapter provides backward compatibility with the standardized SERVICE_* environment variables
 * while maintaining support for the existing REACT_APP_* pattern.
 * 
 * Usage:
 * import { adaptEnvironmentVariables } from './environmentAdapter';
 * 
 * // Call at application startup
 * adaptEnvironmentVariables();
 */

/**
 * Variable mapping between standardized SERVICE_* and legacy REACT_APP_* format
 * @type {Object}
 */
const VARIABLE_MAPPING = {
  // Core variables
  'SERVICE_NAME': 'REACT_APP_SERVICE_NAME',
  'SERVICE_ENV': 'REACT_APP_ENVIRONMENT',
  'SERVICE_VERSION': 'REACT_APP_VERSION',
  
  // API configuration
  'SERVICE_API_URL': 'REACT_APP_API_URL',
  'SERVICE_AUTH_URL': 'REACT_APP_AUTH_URL',
  
  // Development configuration
  'SERVICE_DEV_MODE': 'REACT_APP_DEV_MODE',
  'SERVICE_HOT_RELOAD': 'REACT_APP_HOT_RELOAD',
  'SERVICE_HOT_RELOAD_HOST': 'WDS_SOCKET_HOST',
  'SERVICE_HOT_RELOAD_PORT': 'WDS_SOCKET_PORT',
  
  // Health monitoring
  'SERVICE_HEALTH_CHECK_INTERVAL': 'REACT_APP_HEALTH_CHECK_INTERVAL',
  'SERVICE_HEALTH_CHECK_PATH': 'REACT_APP_HEALTH_CHECK_PATH',
  
  // Error handling
  'SERVICE_ERROR_REPORTING': 'REACT_APP_ERROR_LOGGING_ENABLED',
  'SERVICE_ERROR_LEVEL': 'REACT_APP_ERROR_LOG_LEVEL',
  'SERVICE_MAX_ERRORS': 'REACT_APP_MAX_ERRORS_PER_SESSION',
  'SERVICE_ERROR_REPORTING_URL': 'REACT_APP_ERROR_REPORTING_URL',
};

/**
 * Adapts the runtime environment by checking for standardized SERVICE_* variables
 * and creates corresponding REACT_APP_* variables for backward compatibility
 */
export const adaptEnvironmentVariables = () => {
  // Skip if not in browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  // Skip if already adapted
  if (window.__environmentAdapterRun) {
    return;
  }
  
  // Initialize runtime env object if it doesn't exist
  if (!window.runtimeEnv) {
    window.runtimeEnv = {};
  }
  
  // Get all available environment sources
  const sources = [
    window.runtimeEnv,
    window.env || {},
    typeof process !== 'undefined' && process.env ? process.env : {}
  ];
  
  // Process each mapping
  Object.entries(VARIABLE_MAPPING).forEach(([standardKey, legacyKey]) => {
    // Find the value from any source using the standardized key
    let value = undefined;
    for (const source of sources) {
      if (source[standardKey] !== undefined) {
        value = source[standardKey];
        break;
      }
    }
    
    // If found, ensure it's available in both forms
    if (value !== undefined) {
      // Add to runtime environment
      window.runtimeEnv[standardKey] = value;
      window.runtimeEnv[legacyKey] = value;
      
      // Add to window.env if it exists
      if (window.env) {
        window.env[legacyKey] = value;
      }
    }
  });
  
  // Add special handling for common Docker variables
  if (sources.some(source => source.SERVICE_ENV === 'development')) {
    window.runtimeEnv.IS_DOCKER = true;
    window.runtimeEnv.REACT_APP_RUNNING_IN_DOCKER = 'true';
    
    if (window.env) {
      window.env.REACT_APP_RUNNING_IN_DOCKER = 'true';
    }
  }
  
  // Mark as run
  window.__environmentAdapterRun = true;
  
  // Log in development mode
  if (window.runtimeEnv.ENVIRONMENT === 'development' || 
      window.runtimeEnv.SERVICE_ENV === 'development' ||
      window.runtimeEnv.NODE_ENV === 'development') {
    console.log('[Environment Adapter] Initialized with standardized variables');
  }
};

/**
 * Get a specific environment variable with preference for the standardized format
 * @param {string} key - The key to look up
 * @param {any} defaultValue - Default value if not found
 * @returns {any} The value from environment
 */
export const getStandardizedEnv = (key, defaultValue) => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  // Ensure adapter has run
  adaptEnvironmentVariables();
  
  // Check if we have a mapping for this key
  const standardKey = Object.keys(VARIABLE_MAPPING).find(
    stdKey => VARIABLE_MAPPING[stdKey] === key
  );
  
  // If we do, check for the standardized version first
  if (standardKey && window.runtimeEnv[standardKey] !== undefined) {
    return window.runtimeEnv[standardKey];
  }
  
  // Otherwise fall back to the legacy key
  if (window.runtimeEnv[key] !== undefined) {
    return window.runtimeEnv[key];
  }
  
  // Check window.env
  if (window.env && window.env[key] !== undefined) {
    return window.env[key];
  }
  
  // Fall back to process.env if available
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    return process.env[key];
  }
  
  // Finally use the default
  return defaultValue;
};

export default {
  adaptEnvironmentVariables,
  getStandardizedEnv,
  VARIABLE_MAPPING
};