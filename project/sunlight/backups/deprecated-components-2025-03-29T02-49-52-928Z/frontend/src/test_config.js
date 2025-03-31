/**
 * Simple test for frontend configuration
 * Run with: node test_config.js
 */

// Mock process.env
process.env = {
  REACT_APP_API_URL: 'http://localhost:8000/api',
  REACT_APP_DEBUG: 'true',
};

// Environment types
const EnvironmentType = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
};

// Base configuration with common settings
const baseConfig = {
  app: {
    name: 'TAP Integration Platform',
    version: process.env.REACT_APP_VERSION || '1.0.0',
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
      baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
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
      debug: true,
      mockApi: process.env.REACT_APP_MOCK_API === 'true',
    },
  },
  [EnvironmentType.TEST]: {
    api: {
      baseUrl: process.env.REACT_APP_API_URL || '/api',
      timeout: 5000, // Shorter timeout for tests
    },
    auth: {
      enabled: process.env.REACT_APP_AUTH_ENABLED !== 'false',
      providers: {
        local: true,
        office365: false,
        gmail: false,
      },
    },
    features: {
      debug: true,
      mockApi: true, // Always use mock API in test
    },
  },
  [EnvironmentType.PRODUCTION]: {
    api: {
      baseUrl: process.env.REACT_APP_API_URL || '/api',
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
      debug: false,
      mockApi: false,
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

// Validate configuration
function validateConfig(config, schema) {
  // Added display name
  validateConfig.displayName = 'validateConfig';

  const result = {
    valid: true,
    errors: [],
  };
  
  // Check if config exists
  if (!config) {
    result.valid = false;
    result.errors.push('Configuration is undefined');
    return result;
  }
  
  // Validate required fields
  validateRequiredFields(config, schema, '', result);
  
  return result;
}

// Validate required fields recursively
function validateRequiredFields(config, schema, path, result) {
  // Added display name
  validateRequiredFields.displayName = 'validateRequiredFields';

  // Process each key in the schema
  Object.entries(schema).forEach(([key, value]) => {
    const currentPath = path ? `${path}.${key}` : key;
    
    // If value is a nested schema, validate recursively
    if (value !== null && typeof value === 'object' && !('type' in value)) {
      // If the corresponding config section doesn't exist, add error
      if (!config[key] || typeof config[key] !== 'object') {
        result.valid = false;
        result.errors.push(`Missing required section: ${currentPath}`);
      } else {
        // Continue validation on nested objects
        validateRequiredFields(config[key], value, currentPath, result);
      }
    } 
    // If value is a field definition with 'required: true'
    else if (value && value.required === true) {
      // Check if the field exists
      if (config[key] === undefined || config[key] === null || config[key] === '') {
        result.valid = false;
        result.errors.push(`Missing required field: ${currentPath}`);
      }
      
      // Validate type if specified
      if (value.type && config[key] !== undefined) {
        const actualType = Array.isArray(config[key]) ? 'array' : typeof config[key];
        if (actualType !== value.type) {
          result.valid = false;
          result.errors.push(`Type mismatch for ${currentPath}: expected ${value.type}, got ${actualType}`);
        }
      }
    }
  });
}

// Get current environment
function getCurrentEnvironment() {
  // Added display name
  getCurrentEnvironment.displayName = 'getCurrentEnvironment';

  const env = process.env.REACT_APP_ENVIRONMENT || 'development';
  
  // Validate environment value
  if (!Object.values(EnvironmentType).includes(env)) {
    console.warn(`Invalid environment "${env}", using development`);
    return EnvironmentType.DEVELOPMENT;
  }
  
  return env;
}

// Configuration singleton
let configInstance = null;

// Get configuration for current environment
function getConfig() {
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
      if (environment === EnvironmentType.DEVELOPMENT) {
        throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
      }
    }
    
    configInstance = mergedConfig;
  }
  
  return configInstance;
}

// Create configuration for specific environment (useful for testing)
function createConfig(environment) {
  // Added display name
  createConfig.displayName = 'createConfig';

  const envConfig = environmentConfigs[environment] || environmentConfigs[EnvironmentType.DEVELOPMENT];
  
  return {
    ...baseConfig,
    ...envConfig,
    environment,
  };
}

// Reset configuration singleton (for testing)
function resetConfig() {
  // Added display name
  resetConfig.displayName = 'resetConfig';

  configInstance = null;
}

// Test the configuration
function testConfig() {
  // Added display name
  testConfig.displayName = 'testConfig';

  
  // Test development environment
  process.env.REACT_APP_ENVIRONMENT = 'development';
  resetConfig();
  const devConfig = getConfig();
  
  // Test test environment
  process.env.REACT_APP_ENVIRONMENT = 'test';
  resetConfig();
  const testConfig = getConfig();
  
  // Test production environment
  process.env.REACT_APP_ENVIRONMENT = 'production';
  resetConfig();
  const prodConfig = getConfig();
  
  // Test invalid environment
  process.env.REACT_APP_ENVIRONMENT = 'invalid';
  resetConfig();
  const invalidConfig = getConfig();
  
  // Test createConfig method
  const devConfigCreated = createConfig(EnvironmentType.DEVELOPMENT);
  const testConfigCreated = createConfig(EnvironmentType.TEST);
  const prodConfigCreated = createConfig(EnvironmentType.PRODUCTION);
  
  
}

// Run the tests
testConfig();