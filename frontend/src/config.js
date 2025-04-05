import { ENV } from "@/utils/environmentConfig";
/**
 * Application Configuration
 * 
 * This file contains environment-specific configuration for the application.
 * In a production environment, these values should be set via environment variables.
 */

const config = {
  // API Configuration
  api: {
    baseUrl: ENV.REACT_APP_API_URL || '/api',
    timeout: 30000
  },
  // Authentication Configuration
  auth: {
    providers: {
      local: true,
      office365: true,
      gmail: true
    },
    tokenStorageKey: 'auth_token',
    userInfoStorageKey: 'user_info'
  },
  // Feature Flags
  features: {
    multiTenant: true,
    azureBlobStorage: true,
    scheduling: true,
    fieldMapping: true,
    canvas: true
  },
  // UI Configuration
  ui: {
    theme: 'light',
    primaryColor: '#48C2C5',
    secondaryColor: '#FC741C',
    logo: '/logo.png'
  }
};
export default config;