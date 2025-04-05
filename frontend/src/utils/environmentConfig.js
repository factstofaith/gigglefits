/**
 * Environment Configuration Utility
 * 
 * Standardized utility for accessing environment variables safely in a containerized environment.
 * - Handles runtime injection for Docker
 * - Provides fallbacks for all environment variables
 * - Centralizes environment configuration
 * - Supports Docker-specific configuration
 */

import { getRuntimeEnv, getConfig, IS_DOCKER, ENVIRONMENT } from './runtimeEnv';

/**
 * Environment types
 * @enum {string}
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  STAGING: 'staging',
  PRODUCTION: 'production',
};

/**
 * Safely access environment variables with fallbacks
 * @param {string} key - The environment variable key
 * @param {*} fallback - Default value if environment variable is not found
 * @returns {*} The environment variable value or fallback
 */
export const getEnvironmentVariable = (key, fallback = '') => {
  return getRuntimeEnv(key, fallback);
};

/**
 * Get current environment
 * @returns {string} Current environment
 */
export const getCurrentEnvironment = () => {
  return ENVIRONMENT || process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;
};

/**
 * Check if current environment is production
 * @returns {boolean} Is production environment
 */
export const isProduction = () => {
  return getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION;
};

/**
 * Check if current environment is development
 * @returns {boolean} Is development environment
 */
export const isDevelopment = () => {
  return getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT;
};

/**
 * Check if running in Docker container
 * @returns {boolean} Is Docker environment
 */
export const isDocker = () => {
  return IS_DOCKER || getBooleanEnv('REACT_APP_RUNNING_IN_DOCKER', false);
};

/**
 * Common environment variables with standardized access
 */
export const ENV = {
  // API endpoints
  API_URL: getEnvironmentVariable('API_URL', '/api'),
  AUTH_URL: getEnvironmentVariable('AUTH_URL', '/auth'),
  
  // Application configuration
  NODE_ENV: getEnvironmentVariable('NODE_ENV', 'development'),
  PUBLIC_URL: getEnvironmentVariable('PUBLIC_URL', ''),
  APP_VERSION: getEnvironmentVariable('VERSION', '0.0.0'),
  
  // Feature flags
  ENABLE_ANALYTICS: getEnvironmentVariable('ENABLE_ANALYTICS', false),
  ENABLE_EXPERIMENTAL: getEnvironmentVariable('ENABLE_EXPERIMENTAL', false),
  
  // Docker-specific configuration
  IS_DOCKER: isDocker(),
  DOCKER_HEALTH_CHECK_INTERVAL: getEnvironmentVariable('HEALTH_CHECK_INTERVAL', 30000),
  
  // Development tools
  DISABLE_ESLINT_PLUGIN: getEnvironmentVariable('DISABLE_ESLINT_PLUGIN', false),
  
  // Deployment information
  DEPLOYMENT_ENVIRONMENT: getCurrentEnvironment(),
  BUILD_TIME: getEnvironmentVariable('BUILD_TIME', new Date().toISOString()),
};

/**
 * Get a boolean environment variable
 * @param {string} key - The environment variable key
 * @param {boolean} fallback - Default value if not found
 * @returns {boolean} The parsed boolean value
 */
export const getBooleanEnv = (key, fallback = false) => {
  const value = getEnvironmentVariable(key, fallback);
  
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  
  return Boolean(value);
};

/**
 * Get a numeric environment variable
 * @param {string} key - The environment variable key
 * @param {number} fallback - Default value if not found
 * @returns {number} The parsed numeric value
 */
export const getNumericEnv = (key, fallback = 0) => {
  const value = getEnvironmentVariable(key, fallback);
  
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  }
  
  return typeof value === 'number' ? value : fallback;
};

/**
 * Get environment-specific configuration
 * @returns {Object} Configuration for current environment
 */
export const getEnvironmentConfig = () => {
  const config = getConfig();
  const environment = getCurrentEnvironment();
  
  // Common configuration
  const commonConfig = {
    apiBaseUrl: config.apiBaseUrl || ENV.API_URL,
    authBaseUrl: config.authBaseUrl || ENV.AUTH_URL,
    errorReportingEnabled: config.errorHandling?.enabled ?? true,
    logLevel: config.errorHandling?.logLevel ?? 'warn',
  };
  
  // Environment-specific overrides
  switch (environment) {
    case ENVIRONMENTS.PRODUCTION:
      return {
        ...commonConfig,
        apiTimeout: 30000, // 30 seconds
        cacheStrategy: 'production',
        debugMode: false,
        pollingInterval: 60000, // 1 minute
      };
      
    case ENVIRONMENTS.STAGING:
      return {
        ...commonConfig,
        apiTimeout: 30000,
        cacheStrategy: 'network-first',
        debugMode: false,
        pollingInterval: 30000, // 30 seconds
      };
      
    case ENVIRONMENTS.TESTING:
      return {
        ...commonConfig,
        apiTimeout: 60000, // 1 minute (longer for tests)
        cacheStrategy: 'no-cache',
        debugMode: true,
        pollingInterval: 10000, // 10 seconds
      };
      
    case ENVIRONMENTS.DEVELOPMENT:
    default:
      return {
        ...commonConfig,
        apiTimeout: 60000,
        cacheStrategy: 'no-cache',
        debugMode: true,
        pollingInterval: 5000, // 5 seconds
      };
  }
};

/**
 * Get Docker-specific configuration
 * @returns {Object} Docker configuration if running in Docker, null otherwise
 */
export const getDockerConfig = () => {
  if (!isDocker()) {
    return null;
  }
  
  return {
    containerId: getEnvironmentVariable('CONTAINER_ID', 'unknown'),
    dockerEnvironment: getEnvironmentVariable('DOCKER_ENVIRONMENT', getCurrentEnvironment()),
    healthCheckInterval: getNumericEnv('HEALTH_CHECK_INTERVAL', 60000),
    errorHandling: {
      enabled: getBooleanEnv('ERROR_LOGGING_ENABLED', true),
      logLevel: getEnvironmentVariable('ERROR_LOG_LEVEL', 'warn'),
      reportingUrl: getEnvironmentVariable('ERROR_REPORTING_URL', '/api/errors'),
      maxErrorsPerSession: getNumericEnv('MAX_ERRORS_PER_SESSION', 100),
    }
  };
};

export default {
  ENVIRONMENTS,
  getCurrentEnvironment,
  isProduction,
  isDevelopment,
  isDocker,
  getEnvironmentConfig,
  getDockerConfig,
  getEnvironmentVariable,
  getBooleanEnv,
  getNumericEnv,
  ENV,
};