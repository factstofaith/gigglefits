/**
 * Environment Configuration Utility
 * 
 * Standardized utility for accessing environment variables safely in a containerized environment.
 * - Handles runtime injection for Docker
 * - Provides fallbacks for all environment variables
 * - Centralizes environment configuration
 */

import { getRuntimeEnv } from './runtimeEnv';

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
  IS_DOCKER: getEnvironmentVariable('IS_DOCKER', false),
  REACT_APP_RUNNING_IN_DOCKER: getEnvironmentVariable('REACT_APP_RUNNING_IN_DOCKER', 'false'),
  DOCKER_HEALTH_CHECK_INTERVAL: getEnvironmentVariable('DOCKER_HEALTH_CHECK_INTERVAL', 30000),
  
  // Development tools
  DISABLE_ESLINT_PLUGIN: getEnvironmentVariable('DISABLE_ESLINT_PLUGIN', false),
  
  // Deployment information
  DEPLOYMENT_ENVIRONMENT: getEnvironmentVariable('DEPLOYMENT_ENVIRONMENT', 'development'),
  BUILD_TIME: getEnvironmentVariable('BUILD_TIME', new Date().toISOString()),
  
  // Access any environment variable
  get: function(key, defaultValue = '') {
    return getEnvironmentVariable(key, defaultValue);
  }
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
 * Check if running in a Docker container
 */
export const isContainerized = () => {
  return getBooleanEnv('IS_DOCKER', false) || 
         getBooleanEnv('REACT_APP_RUNNING_IN_DOCKER', false);
};

export default {
  getEnvironmentVariable,
  getBooleanEnv,
  getNumericEnv,
  ENV,
  isContainerized
};