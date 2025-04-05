/**
 * Runtime Environment Utility
 * 
 * Provides access to environment variables injected at runtime in Docker containers.
 * Supports both development and production modes with proper fallbacks.
 * 
 * Usage examples:
 * 
 * import { getRuntimeEnv, API_URL } from './utils/runtimeEnv';
 * 
 * // Get a specific variable with fallback
 * const apiUrl = getRuntimeEnv('API_URL', '/default-api');
 * 
 * // Use predefined constants
 * fetch(API_URL + '/users');
 * 
 * // Get the entire configuration object
 * const config = getConfig();
 * console.log(config.apiBaseUrl);
 */

// Runtime environment detection
export const IS_DOCKER = typeof window !== 'undefined' && 
  (window.runtimeEnv?.IS_DOCKER === true || 
   window.env?.REACT_APP_RUNNING_IN_DOCKER === 'true');

/**
 * Get a runtime environment variable with fallbacks
 * Priority: window.runtimeEnv > window.env > process.env > default
 * 
 * @param {string} key - The environment variable key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} The environment value
 */
export const getRuntimeEnv = (key, defaultValue) => {
  // Check if window is defined (browser environment)
  if (typeof window === 'undefined') {
    // Server-side rendering or Node.js context
    if (process.env && process.env['REACT_APP_' + key] !== undefined) {
      return process.env['REACT_APP_' + key];
    }
    return defaultValue;
  }

  // Use window.runtimeEnv if available (Docker runtime injection)
  if (window.runtimeEnv) {
    // First check with direct key
    if (window.runtimeEnv[key] !== undefined) {
      return window.runtimeEnv[key];
    }
    
    // Then try using the get method if available
    if (typeof window.runtimeEnv.get === 'function') {
      const value = window.runtimeEnv.get(key, undefined);
      if (value !== undefined) {
        return value;
      }
    }
  }
  
  // Fall back to window.env (HTML injection)
  if (window.env) {
    const envKey = 'REACT_APP_' + key;
    if (window.env[envKey] !== undefined) {
      return window.env[envKey];
    }
  }
  
  // Fall back to process.env (webpack defined env)
  if (process.env && process.env['REACT_APP_' + key] !== undefined) {
    return process.env['REACT_APP_' + key];
  }
  
  // Finally use the default value
  return defaultValue;
};

// Common environment variables
export const API_URL = getRuntimeEnv('API_URL', '/api');
export const AUTH_URL = getRuntimeEnv('AUTH_URL', '/auth');
export const PUBLIC_URL = getRuntimeEnv('PUBLIC_URL', '');
export const ENVIRONMENT = getRuntimeEnv('ENVIRONMENT', 'development');
export const VERSION = getRuntimeEnv('VERSION', 'development');
export const BUILD_TIME = getRuntimeEnv('BUILD_TIME', new Date().toISOString());
export const ERROR_LOGGING_ENABLED = getRuntimeEnv('ERROR_LOGGING_ENABLED', true);
export const ERROR_LOG_LEVEL = getRuntimeEnv('ERROR_LOG_LEVEL', 'warn');
export const ERROR_REPORTING_URL = getRuntimeEnv('ERROR_REPORTING_URL', '/api/errors');

/**
 * Get the complete configuration object
 * Prefers window.runtimeConfig if available, otherwise builds it
 * 
 * @returns {Object} Configuration object
 */
export const getConfig = () => {
  // Use pre-constructed config if available
  if (window.runtimeConfig) {
    return window.runtimeConfig;
  }
  
  // Otherwise build config from individual values
  return {
    apiBaseUrl: API_URL,
    authBaseUrl: AUTH_URL,
    publicUrl: PUBLIC_URL,
    environment: ENVIRONMENT,
    version: VERSION,
    isDocker: IS_DOCKER,
    buildTime: BUILD_TIME,
    containerId: getRuntimeEnv('CONTAINER_ID', 'unknown'),
    dockerEnvironment: getRuntimeEnv('DOCKER_ENVIRONMENT', ENVIRONMENT),
    errorHandling: {
      enabled: ERROR_LOGGING_ENABLED,
      logLevel: ERROR_LOG_LEVEL,
      reportingUrl: ERROR_REPORTING_URL,
      maxErrorsPerSession: getRuntimeEnv('MAX_ERRORS_PER_SESSION', 100)
    }
  };
};

/**
 * Initialize the runtime environment
 * Logs the configuration to the console in development mode
 */
export const initializeRuntimeEnvironment = () => {
  const config = getConfig();
  
  if (ENVIRONMENT === 'development') {
    console.log('[Runtime Environment] Initialized with config:', config);
  }
  
  return config;
};

// Export default object for convenience
export default {
  getRuntimeEnv,
  getConfig,
  initializeRuntimeEnvironment,
  IS_DOCKER,
  API_URL,
  AUTH_URL,
  PUBLIC_URL,
  ENVIRONMENT,
  VERSION,
  BUILD_TIME,
  ERROR_LOGGING_ENABLED,
  ERROR_LOG_LEVEL,
  ERROR_REPORTING_URL,
};