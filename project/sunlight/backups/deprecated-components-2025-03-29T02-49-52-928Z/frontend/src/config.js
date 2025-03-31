/**
 * Application Configuration
 *
 * This file contains environment-specific configuration for the application.
 * In a production environment, these values should be set via environment variables.
 * 
 * This file serves as a compatibility layer for both the legacy config usage
 * and the newer module-based config system in config/index.js.
 */

// Import and re-export the newer configuration system
import configModule, { getConfig, createConfig, resetConfig, EnvironmentType } from './config/index';

// Legacy config maintained for backward compatibility
const config = {
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || '/api',
    timeout: 30000,
  },

  // Authentication Configuration
  auth: {
    providers: {
      local: true,
      office365: true,
      gmail: true,
    },
    tokenStorageKey: 'auth_token',
    userInfoStorageKey: 'user_info',
  },

  // Feature Flags
  features: {
    multiTenant: true,
    azureBlobStorage: true,
    scheduling: true,
    fieldMapping: true,
    canvas: true,
  },

  // UI Configuration
  ui: {
    theme: 'light',
    primaryColor: '#48C2C5',
    secondaryColor: '#FC741C',
    logo: '/logo.png',
  },
};

// Export the getConfig function and other exports from config/index.js
export { getConfig, createConfig, resetConfig, EnvironmentType };

// Export default config for backward compatibility
export default config;
