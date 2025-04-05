/**
 * Configuration module for the TAP Integration Platform frontend.
 * Provides environment-specific configuration with validation and standardized access.
 */

// Import validation
import { validateConfig } from './validation';

// Environment types
import { ENV } from "@/utils/environmentConfig";
export const EnvironmentType = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production'
};

/**
 * Environment variable access with standardized handling
 * Variables can come from:
 * 1. Runtime window.env (injected by container)
 * 2. Build-time process.env (injected by webpack)
 * 3. Default values
 */

// Helper to get environment variable from multiple sources with fallback
export const getEnv = (key, defaultValue) => {
  // First check runtime environment variables (window.env)
  if (typeof window !== 'undefined' && window.env && window.env[key] !== undefined) {
    return window.env[key];
  }

  // Then check build-time environment variables (process.env)
  if (ENV.key !== undefined) {
    return ENV.key;
  }

  // Finally, fall back to default value
  return defaultValue;
};

// Helper to require an environment variable
export const requireEnv = (key, defaultValue = undefined) => {
  const value = getEnv(key, defaultValue);
  if (value === undefined || value === null || value === '') {
    // Only throw in development to avoid breaking production
    const env = getCurrentEnvironment();
    if (env === EnvironmentType.DEVELOPMENT) {
      throw new Error(`Required environment variable ${key} is not set`);
    } else {
      console.error(`Required environment variable ${key} is not set`);
      return defaultValue;
    }
  }
  return value;
};

// Helper to parse boolean environment variables
export const getBoolEnv = (key, defaultValue) => {
  const value = getEnv(key, defaultValue);
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1' || value === 1;
};

// Helper to parse numeric environment variables
export const getNumEnv = (key, defaultValue) => {
  const value = getEnv(key, defaultValue);
  if (typeof value === 'number') return value;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Load actual environment variables
const ENV = {
  REACT_APP_VERSION: getEnv('REACT_APP_VERSION', '1.0.0'),
  REACT_APP_API_URL: getEnv('REACT_APP_API_URL', '/api'),
  REACT_APP_MOCK_API: getBoolEnv('REACT_APP_MOCK_API', false),
  REACT_APP_AUTH_ENABLED: getBoolEnv('REACT_APP_AUTH_ENABLED', true),
  REACT_APP_ENVIRONMENT: getEnv('REACT_APP_ENVIRONMENT', 'development'),
  REACT_APP_LOGGER_LEVEL: getEnv('REACT_APP_LOGGER_LEVEL', 'info'),
  REACT_APP_API_TIMEOUT: getNumEnv('REACT_APP_API_TIMEOUT', 30000),
  REACT_APP_UI_THEME: getEnv('REACT_APP_UI_THEME', 'light'),
  REACT_APP_UI_PRIMARY_COLOR: getEnv('REACT_APP_UI_PRIMARY_COLOR', '#48C2C5'),
  REACT_APP_UI_SECONDARY_COLOR: getEnv('REACT_APP_UI_SECONDARY_COLOR', '#FC741C')
};

// Base configuration with common settings
const baseConfig = {
  // Common settings shared across all environments
  app: {
    name: 'TAP Integration Platform',
    version: ENV.REACT_APP_VERSION
  },
  ui: {
    theme: ENV.REACT_APP_UI_THEME,
    primaryColor: ENV.REACT_APP_UI_PRIMARY_COLOR,
    secondaryColor: ENV.REACT_APP_UI_SECONDARY_COLOR,
    logo: '/logo.png'
  },
  auth: {
    tokenStorageKey: 'auth_token',
    userInfoStorageKey: 'user_info'
  }
};

// Environment-specific configurations
const environmentConfigs = {
  [EnvironmentType.DEVELOPMENT]: {
    api: {
      baseUrl: ENV.REACT_APP_API_URL,
      timeout: ENV.REACT_APP_API_TIMEOUT
    },
    auth: {
      enabled: ENV.REACT_APP_AUTH_ENABLED,
      providers: {
        local: true,
        office365: true,
        gmail: true
      }
    },
    features: {
      multiTenant: true,
      azureBlobStorage: true,
      scheduling: true,
      fieldMapping: true,
      canvas: true,
      debug: true,
      mockApi: ENV.REACT_APP_MOCK_API
    },
    logging: {
      level: ENV.REACT_APP_LOGGER_LEVEL,
      enableConsole: true,
      enableRemote: false
    }
  },
  [EnvironmentType.TEST]: {
    api: {
      baseUrl: ENV.REACT_APP_API_URL,
      timeout: 5000 // Shorter timeout for tests
    },
    auth: {
      enabled: ENV.REACT_APP_AUTH_ENABLED,
      providers: {
        local: true,
        office365: false,
        gmail: false
      }
    },
    features: {
      multiTenant: true,
      azureBlobStorage: true,
      scheduling: true,
      fieldMapping: true,
      canvas: true,
      debug: true,
      mockApi: true // Always use mock API in test
    },
    logging: {
      level: 'error',
      enableConsole: false,
      enableRemote: false
    }
  },
  [EnvironmentType.PRODUCTION]: {
    api: {
      baseUrl: ENV.REACT_APP_API_URL,
      timeout: ENV.REACT_APP_API_TIMEOUT
    },
    auth: {
      enabled: ENV.REACT_APP_AUTH_ENABLED,
      providers: {
        local: true,
        office365: true,
        gmail: true
      }
    },
    features: {
      multiTenant: getBoolEnv('REACT_APP_FEATURE_MULTI_TENANT', true),
      azureBlobStorage: getBoolEnv('REACT_APP_FEATURE_AZURE_BLOB_STORAGE', true),
      scheduling: getBoolEnv('REACT_APP_FEATURE_SCHEDULING', true),
      fieldMapping: getBoolEnv('REACT_APP_FEATURE_FIELD_MAPPING', true),
      canvas: getBoolEnv('REACT_APP_FEATURE_CANVAS', true),
      debug: false,
      mockApi: false
    },
    logging: {
      level: ENV.REACT_APP_LOGGER_LEVEL,
      enableConsole: false,
      enableRemote: true
    }
  }
};

// Required configuration schema for validation
const requiredConfig = {
  api: {
    baseUrl: {
      type: 'string',
      required: true
    }
  },
  auth: {
    enabled: {
      type: 'boolean',
      required: true
    }
  }
};

// Get current environment
export function getCurrentEnvironment() {
  const env = ENV.REACT_APP_ENVIRONMENT;

  // Validate environment value
  if (!Object.values(EnvironmentType).includes(env)) {
    console.warn(`Invalid environment "${env}", using development`);
    return EnvironmentType.DEVELOPMENT;
  }
  return env;
}

// Create configuration singleton
let configInstance = null;

// Get configuration for current environment
export function getConfig() {
  if (!configInstance) {
    const environment = getCurrentEnvironment();

    // Get environment-specific configuration
    const envConfig = environmentConfigs[environment] || environmentConfigs[EnvironmentType.DEVELOPMENT];

    // Merge with base configuration
    const mergedConfig = {
      ...baseConfig,
      ...envConfig,
      environment
    };

    // Validate configuration
    const validationResult = validateConfig(mergedConfig, requiredConfig);
    if (!validationResult.isValid) {
      console.error('Configuration validation failed:', validationResult.errors);
      // In development, we'll throw an error to make configuration issues obvious
      if (environment === EnvironmentType.DEVELOPMENT) {
        throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
      }
    }
    configInstance = mergedConfig;

    // Log configuration in development environment
    if (environment === EnvironmentType.DEVELOPMENT) {
      console.log('Application configuration:', configInstance);
    }
  }
  return configInstance;
}

// Create configuration for specific environment (useful for testing)
export function createConfig(environment) {
  const envConfig = environmentConfigs[environment] || environmentConfigs[EnvironmentType.DEVELOPMENT];
  return {
    ...baseConfig,
    ...envConfig,
    environment
  };
}

// Function to reset the configuration singleton (primarily for testing)
export function resetConfig() {
  configInstance = null;
}

// Default export for backward compatibility
export default getConfig();
export { NOTIFICATION_CONFIG as notificationsConfig } from './notifications.config';
export { validateConfig as validation } from './validation';