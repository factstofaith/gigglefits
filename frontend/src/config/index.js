/**
 * Configuration module for the TAP Integration Platform frontend.
 * Provides environment-specific configuration with validation.
 */

// Environment types
export const EnvironmentType = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
};

// Configuration validation helper
import { validateConfig } from './validation';

// Environment variables are injected by webpack
const ENV = {
  REACT_APP_VERSION: typeof window !== 'undefined' && window.env ? window.env.REACT_APP_VERSION : '1.0.0',
  REACT_APP_API_URL: typeof window !== 'undefined' && window.env ? window.env.REACT_APP_API_URL : null,
  REACT_APP_MOCK_API: typeof window !== 'undefined' && window.env ? window.env.REACT_APP_MOCK_API : null,
  REACT_APP_AUTH_ENABLED: typeof window !== 'undefined' && window.env ? window.env.REACT_APP_AUTH_ENABLED : null,
  REACT_APP_ENVIRONMENT: typeof window !== 'undefined' && window.env ? window.env.REACT_APP_ENVIRONMENT : 'development',
};

// Base configuration with common settings
const baseConfig = {
  // Common settings shared across all environments
  app: {
    name: 'TAP Integration Platform',
    version: ENV.REACT_APP_VERSION || '1.0.0',
  },
  ui: {
    theme: 'light',
    primaryColor: '#48C2C5',
    secondaryColor: '#FC741C',
    logo: '/logo.png',
  },
  auth: {
    tokenStorageKey: 'auth_token',
    userInfoStorageKey: 'user_info',
  },
};

// Environment-specific configurations
const environmentConfigs = {
  [EnvironmentType.DEVELOPMENT]: {
    api: {
      baseUrl: ENV.REACT_APP_API_URL || 'http://localhost:8000/api',
      timeout: 30000, // Longer timeout for development
    },
    auth: {
      enabled: true,
      providers: {
        local: true,
        office365: true,
        gmail: true,
      },
    },
    features: {
      multiTenant: true,
      azureBlobStorage: true,
      scheduling: true,
      fieldMapping: true,
      canvas: true,
      debug: true,
      mockApi: ENV.REACT_APP_MOCK_API === 'true',
    },
    logging: {
      level: 'debug',
      enableConsole: true,
      enableRemote: false,
    },
  },
  [EnvironmentType.TEST]: {
    api: {
      baseUrl: ENV.REACT_APP_API_URL || '/api',
      timeout: 5000, // Shorter timeout for tests
    },
    auth: {
      enabled: ENV.REACT_APP_AUTH_ENABLED !== 'false',
      providers: {
        local: true,
        office365: false,
        gmail: false,
      },
    },
    features: {
      multiTenant: true,
      azureBlobStorage: true,
      scheduling: true,
      fieldMapping: true,
      canvas: true,
      debug: true,
      mockApi: true, // Always use mock API in test
    },
    logging: {
      level: 'error',
      enableConsole: false,
      enableRemote: false,
    },
  },
  [EnvironmentType.PRODUCTION]: {
    api: {
      baseUrl: ENV.REACT_APP_API_URL || '/api',
      timeout: 15000,
    },
    auth: {
      enabled: true,
      providers: {
        local: true,
        office365: true,
        gmail: true,
      },
    },
    features: {
      multiTenant: true,
      azureBlobStorage: true,
      scheduling: true,
      fieldMapping: true,
      canvas: true,
      debug: false,
      mockApi: false,
    },
    logging: {
      level: 'warn',
      enableConsole: false,
      enableRemote: true,
    },
  },
};

// Required configuration schema for validation
const requiredConfig = {
  api: {
    baseUrl: { type: 'string', required: true },
  },
  auth: {
    enabled: { type: 'boolean', required: true },
  },
};

// Get current environment
function getCurrentEnvironment() {
  // Added display name
  getCurrentEnvironment.displayName = 'getCurrentEnvironment';

  const env = ENV.REACT_APP_ENVIRONMENT || 'development';
  
  // Validate environment value
  if (!Object.values(EnvironmentType).includes(env)) {
    console.warn('Invalid environment "' + env + '", using development');
    return EnvironmentType.DEVELOPMENT;
  }
  
  return env;
}

// Create configuration singleton
let configInstance = null;

// Get configuration for current environment
export function getConfig() {
  // Added display name
  getConfig.displayName = 'getConfig';

  if (!configInstance) {
    const environment = getCurrentEnvironment();
    
    // Get environment-specific configuration
    const envConfig = environmentConfigs[environment] || environmentConfigs[EnvironmentType.DEVELOPMENT];
    
    // Merge with base configuration
    const mergedConfig = {
      ...baseConfig,
      ...envConfig,
      environment,
    };
    
    // Validate configuration
    const validationResult = validateConfig(mergedConfig, requiredConfig);
    if (!validationResult.valid) {
      console.error('Configuration validation failed:', validationResult.errors);
      // In development, we'll throw an error to make configuration issues obvious
      if (environment === EnvironmentType.DEVELOPMENT) {
        // Use string concatenation instead of template literals to avoid babel issues
        throw new Error('Configuration validation failed: ' + validationResult.errors.join(', '));
      }
    }
    
    configInstance = mergedConfig;
  }
  
  return configInstance;
}

// Create configuration for specific environment (useful for testing)
export function createConfig(environment) {
  // Added display name
  createConfig.displayName = 'createConfig';

  const envConfig = environmentConfigs[environment] || environmentConfigs[EnvironmentType.DEVELOPMENT];
  
  return {
    ...baseConfig,
    ...envConfig,
    environment,
  };
}

// Function to reset the configuration singleton (primarily for testing)
export function resetConfig() {
  // Added display name
  resetConfig.displayName = 'resetConfig';

  configInstance = null;
}

// Default export for backward compatibility
export default getConfig();

export { NOTIFICATION_CONFIG as notificationsConfig } from './notifications.config';
export { validateConfig as validation } from './validation';
