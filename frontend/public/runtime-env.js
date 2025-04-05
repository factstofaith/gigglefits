// Runtime environment variables - dynamically injected at runtime
window.runtimeEnv = {
  // Environment values injected at container startup
  API_URL: 'http://tap-backend:8000',
  AUTH_URL: 'http://tap-backend:8000/api/v1/auth',
  PUBLIC_URL: '',
  HOST: 'localhost',
  PORT: '3000',
  ENVIRONMENT: 'development',
  VERSION: '1.0.0',
  BUILD_TIME: '2025-04-05T06:17:25Z',
  
  // Docker-specific settings
  IS_DOCKER: true,
  DOCKER_COMPOSE_PROJECT: 'tap-integration-platform',
  CONTAINER_ID: '20b7f7d9d58c',
  DOCKER_ENVIRONMENT: 'production',
  
  // Error handling configuration
  ERROR_LOGGING_ENABLED: true,
  ERROR_LOG_LEVEL: 'warn',
  ERROR_REPORTING_URL: '/api/errors',
  HEALTH_CHECK_INTERVAL: 60000,
  MAX_ERRORS_PER_SESSION: 100,
  DOCKER_ERROR_HANDLING: 'enabled',
  
  // Standardized SERVICE_* variables
  SERVICE_NAME: 'frontend',
  SERVICE_ENV: 'development',
  SERVICE_VERSION: '1.0.0',
  SERVICE_API_URL: 'http://tap-backend:8000',
  SERVICE_DEV_MODE: true,
  SERVICE_HOT_RELOAD: true,
  SERVICE_HOT_RELOAD_HOST: 'localhost',
  SERVICE_HOT_RELOAD_PORT: '3456',
  SERVICE_HEALTH_CHECK_INTERVAL: 60000,
  SERVICE_HEALTH_CHECK_PATH: '/health',
  SERVICE_ERROR_REPORTING: true,
  SERVICE_ERROR_LEVEL: 'warn',
  SERVICE_MAX_ERRORS: 100,
  
  // Function to access env variables with defaults
  get: function(key, defaultValue) {
    return this[key] !== undefined ? this[key] : defaultValue;
  }
};

// Map standardized variables to legacy format for backward compatibility
window.runtimeEnv.REACT_APP_API_URL = window.runtimeEnv.SERVICE_API_URL || window.runtimeEnv.API_URL;
window.runtimeEnv.REACT_APP_VERSION = window.runtimeEnv.SERVICE_VERSION || window.runtimeEnv.VERSION;
window.runtimeEnv.REACT_APP_ENVIRONMENT = window.runtimeEnv.SERVICE_ENV || window.runtimeEnv.ENVIRONMENT;
window.runtimeEnv.REACT_APP_RUNNING_IN_DOCKER = 'true';
window.runtimeEnv.REACT_APP_HEALTH_CHECK_INTERVAL = window.runtimeEnv.SERVICE_HEALTH_CHECK_INTERVAL || window.runtimeEnv.HEALTH_CHECK_INTERVAL;
window.runtimeEnv.REACT_APP_ERROR_LOGGING_ENABLED = window.runtimeEnv.SERVICE_ERROR_REPORTING || window.runtimeEnv.ERROR_LOGGING_ENABLED;
window.runtimeEnv.REACT_APP_ERROR_LOG_LEVEL = window.runtimeEnv.SERVICE_ERROR_LEVEL || window.runtimeEnv.ERROR_LOG_LEVEL;
window.runtimeEnv.REACT_APP_MAX_ERRORS_PER_SESSION = window.runtimeEnv.SERVICE_MAX_ERRORS || window.runtimeEnv.MAX_ERRORS_PER_SESSION;
window.runtimeEnv.WDS_SOCKET_HOST = window.runtimeEnv.SERVICE_HOT_RELOAD_HOST;
window.runtimeEnv.WDS_SOCKET_PORT = window.runtimeEnv.SERVICE_HOT_RELOAD_PORT;

// Runtime configuration for app initialization
window.runtimeConfig = {
  apiBaseUrl: window.runtimeEnv.REACT_APP_API_URL,
  authBaseUrl: window.runtimeEnv.AUTH_URL,
  publicUrl: window.runtimeEnv.PUBLIC_URL,
  environment: window.runtimeEnv.REACT_APP_ENVIRONMENT,
  version: window.runtimeEnv.REACT_APP_VERSION,
  isDocker: window.runtimeEnv.IS_DOCKER,
  buildTime: window.runtimeEnv.BUILD_TIME,
  containerId: window.runtimeEnv.CONTAINER_ID,
  dockerEnvironment: window.runtimeEnv.DOCKER_ENVIRONMENT,
  errorHandling: {
    enabled: window.runtimeEnv.REACT_APP_ERROR_LOGGING_ENABLED,
    logLevel: window.runtimeEnv.REACT_APP_ERROR_LOG_LEVEL,
    reportingUrl: window.runtimeEnv.ERROR_REPORTING_URL,
    maxErrorsPerSession: window.runtimeEnv.REACT_APP_MAX_ERRORS_PER_SESSION
  }
};

console.log('[Runtime Environment] Initialized with standardized variables');
