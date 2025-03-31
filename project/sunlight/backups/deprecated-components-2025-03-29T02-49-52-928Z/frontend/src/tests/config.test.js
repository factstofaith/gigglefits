import { getConfig, createConfig, EnvironmentType } from '../config';

// Mock the process.env
const originalEnv = process.env;

describe('Configuration Module', () => {
  beforeEach(() => {
    // Reset process.env mock
    jest.resetModules();
    process.env = { ...originalEnv };
    
    // Reset configuration singleton for each test
    jest.isolateModules(() => {
      const { resetConfig } = require('../config');
      if (resetConfig) {
        resetConfig();
      }
    });
  });
  
  afterAll(() => {
    // Restore original process.env
    process.env = originalEnv;
  });
  
  test('getConfig returns development configuration by default', () => {
    delete process.env.REACT_APP_ENVIRONMENT;
    
    // Re-import to get fresh instance
    jest.isolateModules(() => {
      const { getConfig } = require('../config');
      const config = getConfig();
      
      expect(config.environment).toBe('development');
      expect(config.features.debug).toBe(true);
      expect(config.api.baseUrl).toBeDefined();
    });
  });
  
  test('getConfig returns correct configuration for test environment', () => {
    process.env.REACT_APP_ENVIRONMENT = 'test';
    
    // Re-import to get fresh instance
    jest.isolateModules(() => {
      const { getConfig } = require('../config');
      const config = getConfig();
      
      expect(config.environment).toBe('test');
      expect(config.features.mockApi).toBe(true);
      expect(config.api.timeout).toBe(5000); // Test has shorter timeout
    });
  });
  
  test('getConfig returns correct configuration for production environment', () => {
    process.env.REACT_APP_ENVIRONMENT = 'production';
    
    // Re-import to get fresh instance
    jest.isolateModules(() => {
      const { getConfig } = require('../config');
      const config = getConfig();
      
      expect(config.environment).toBe('production');
      expect(config.features.debug).toBe(false);
      expect(config.logging.level).toBe('warn');
    });
  });
  
  test('createConfig creates configuration for specific environment', () => {
    // Use exported function to create configs for different environments
    const devConfig = createConfig(EnvironmentType.DEVELOPMENT);
    const testConfig = createConfig(EnvironmentType.TEST);
    const prodConfig = createConfig(EnvironmentType.PRODUCTION);
    
    expect(devConfig.environment).toBe('development');
    expect(testConfig.environment).toBe('test');
    expect(prodConfig.environment).toBe('production');
    
    expect(devConfig.features.debug).toBe(true);
    expect(prodConfig.features.debug).toBe(false);
  });
  
  test('getConfig uses API URL from environment variable when provided', () => {
    process.env.REACT_APP_API_URL = 'https://api.example.com';
    process.env.REACT_APP_ENVIRONMENT = 'development';
    
    // Re-import to get fresh instance
    jest.isolateModules(() => {
      const { getConfig } = require('../config');
      const config = getConfig();
      
      expect(config.api.baseUrl).toBe('https://api.example.com');
    });
  });
});