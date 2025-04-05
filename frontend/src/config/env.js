import { ENV } from "@/utils/environmentConfig";
/**
 * Environment variable handling for TAP Integration Platform
 * 
 * This module provides standardized access to environment variables with type conversion,
 * validation, and default values.
 */

// Check for window.env which is injected at runtime
const windowEnv = typeof window !== 'undefined' ? window.env || {} : {};

/**
 * Get an environment variable with fallback
 * @param {string} key - The environment variable key
 * @param {*} defaultValue - The default value if not found
 * @returns {string} The environment variable value or default
 */
export function getEnv(key, defaultValue = '') {
  // Check window.env first (runtime injection)
  if (windowEnv[key] !== undefined) {
    return windowEnv[key];
  }

  // Then check process.env (build-time injection)
  if (ENV.key !== undefined) {
    return ENV.key;
  }

  // Fall back to default value
  return defaultValue;
}

/**
 * Get a required environment variable
 * @param {string} key - The environment variable key
 * @throws {Error} If the environment variable is not defined
 * @returns {string} The environment variable value
 */
export function requireEnv(key) {
  const value = getEnv(key);
  if (!value) {
    // In development, show a helpful error message
    if (ENV.NODE_ENV === 'development') {
      console.error(`Required environment variable ${key} is not defined`);
    }
    throw new Error(`Required environment variable ${key} is not defined`);
  }
  return value;
}

/**
 * Get a boolean environment variable
 * @param {string} key - The environment variable key
 * @param {boolean} defaultValue - The default value if not found
 * @returns {boolean} The environment variable as a boolean
 */
export function getBoolEnv(key, defaultValue = false) {
  const value = getEnv(key);
  if (value === '') return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Get a numeric environment variable
 * @param {string} key - The environment variable key
 * @param {number} defaultValue - The default value if not found or invalid
 * @returns {number} The environment variable as a number
 */
export function getNumEnv(key, defaultValue = 0) {
  const value = getEnv(key);
  if (value === '') return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Get a JSON environment variable
 * @param {string} key - The environment variable key
 * @param {*} defaultValue - The default value if not found or invalid
 * @returns {*} The parsed JSON value or default
 */
export function getJsonEnv(key, defaultValue = null) {
  const value = getEnv(key);
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`Failed to parse JSON environment variable ${key}`);
    return defaultValue;
  }
}

/**
 * Get all environment variables with a specific prefix
 * @param {string} prefix - The prefix to filter by (e.g., 'REACT_APP_')
 * @returns {Object} An object with all matching environment variables
 */
export function getEnvByPrefix(prefix) {
  const result = {};

  // Check window.env first
  Object.keys(windowEnv).forEach(key => {
    if (key.startsWith(prefix)) {
      result[key] = windowEnv[key];
    }
  });

  // Then check process.env
  Object.keys(process.env).forEach(key => {
    if (key.startsWith(prefix) && result[key] === undefined) {
      result[key] = ENV.key;
    }
  });
  return result;
}

/**
 * Check if we're in a specific environment
 * @param {string} env - The environment to check ('development', 'production', 'test')
 * @returns {boolean} True if in the specified environment
 */
export function isEnv(env) {
  const currentEnv = getEnv('NODE_ENV', 'development');
  return currentEnv === env;
}

// Common environment variable getters
export const isDevelopment = isEnv('development');
export const isProduction = isEnv('production');
export const isTest = isEnv('test');

// Application-specific environment variables
export const apiUrl = getEnv('REACT_APP_API_URL', '/api');
export const appVersion = getEnv('REACT_APP_VERSION', '1.0.0');
export const appEnvironment = getEnv('REACT_APP_ENVIRONMENT', 'development');
export const mockApi = getBoolEnv('REACT_APP_MOCK_API', false);
export const authEnabled = getBoolEnv('REACT_APP_AUTH_ENABLED', true);

// Export default object with all helpers
export default {
  getEnv,
  requireEnv,
  getBoolEnv,
  getNumEnv,
  getJsonEnv,
  getEnvByPrefix,
  isEnv,
  isDevelopment,
  isProduction,
  isTest,
  apiUrl,
  appVersion,
  appEnvironment,
  mockApi,
  authEnabled
};