#!/bin/sh
# Master Environment Variable Generator for TAP Integration Platform
# Creates runtime-env.js directly from .env.master

set -e  # Exit on error

# Configuration
ENV_MASTER_FILE=${ENV_MASTER_FILE:-/app/.env.master}
RUNTIME_ENV_FILE=${RUNTIME_ENV_FILE:-/app/public/runtime-env.js}

# Debug info
echo "Generating runtime environment from master file..."
echo "ENV_MASTER_FILE: $ENV_MASTER_FILE"
echo "RUNTIME_ENV_FILE: $RUNTIME_ENV_FILE"

# Function to load environment from .env.master file
load_master_env() {
  echo "Loading variables from $ENV_MASTER_FILE..."
  
  if [ ! -f "$ENV_MASTER_FILE" ]; then
    echo "Warning: $ENV_MASTER_FILE not found, using default values"
    return 1
  fi
  
  # Load variables from .env.master
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [ -n "$line" ] && ! echo "$line" | grep -q "^#"; then
      # Extract key and value
      key=$(echo "$line" | cut -d= -f1)
      value=$(echo "$line" | cut -d= -f2-)
      
      # Export variable
      export "$key=$value"
      echo "Loaded: $key=$value"
    fi
  done < "$ENV_MASTER_FILE"
  
  return 0
}

# Function to create runtime-env.js file
create_runtime_env() {
  echo "Creating runtime environment file at $RUNTIME_ENV_FILE..."
  
  mkdir -p "$(dirname "$RUNTIME_ENV_FILE")"
  
  # Create runtime environment file
  cat << EOF > "$RUNTIME_ENV_FILE"
// Runtime environment variables - loaded from .env.master
window.runtimeEnv = {
  // Environment values from .env.master
  API_URL: '${REACT_APP_API_URL:-/api}',
  AUTH_URL: '${REACT_APP_AUTH_URL:-/auth}',
  PUBLIC_URL: '${PUBLIC_URL:-}',
  HOST: '${HOST:-localhost}',
  PORT: '${PORT:-3000}',
  ENVIRONMENT: '${NODE_ENV:-development}',
  VERSION: '${REACT_APP_VERSION:-1.0.0}',
  BUILD_TIME: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
  
  // Docker-specific settings
  IS_DOCKER: true,
  DOCKER_COMPOSE_PROJECT: '${COMPOSE_PROJECT_NAME:-tap-integration-platform}',
  CONTAINER_ID: '${HOSTNAME:-unknown}',
  DOCKER_ENVIRONMENT: '${REACT_APP_DOCKER_ENVIRONMENT:-production}',
  
  // Error handling configuration
  ERROR_LOGGING_ENABLED: ${REACT_APP_ERROR_LOGGING_ENABLED:-true},
  ERROR_LOG_LEVEL: '${REACT_APP_ERROR_LOG_LEVEL:-debug}',
  ERROR_REPORTING_URL: '${REACT_APP_ERROR_REPORTING_URL:-/api/errors}',
  HEALTH_CHECK_INTERVAL: ${REACT_APP_HEALTH_CHECK_INTERVAL:-60000},
  MAX_ERRORS_PER_SESSION: ${REACT_APP_MAX_ERRORS_PER_SESSION:-100},
  DOCKER_ERROR_HANDLING: '${REACT_APP_DOCKER_ERROR_HANDLING:-enabled}',
  
  // Standardized SERVICE_* variables
  SERVICE_NAME: '${SERVICE_NAME:-frontend}',
  SERVICE_ENV: '${SERVICE_ENV:-development}',
  SERVICE_VERSION: '${SERVICE_VERSION:-1.0.0}',
  SERVICE_API_URL: '${SERVICE_API_URL:-http://tap-backend:8000}',
  SERVICE_DEV_MODE: ${SERVICE_DEV_MODE:-true},
  SERVICE_HOT_RELOAD: ${SERVICE_HOT_RELOAD:-true},
  SERVICE_HOT_RELOAD_HOST: '${SERVICE_HOT_RELOAD_HOST:-localhost}',
  SERVICE_HOT_RELOAD_PORT: '${SERVICE_HOT_RELOAD_PORT:-3456}',
  SERVICE_HEALTH_CHECK_INTERVAL: ${SERVICE_HEALTH_CHECK_INTERVAL:-60000},
  SERVICE_HEALTH_CHECK_PATH: '${SERVICE_HEALTH_CHECK_PATH:-/health}',
  SERVICE_ERROR_REPORTING: ${SERVICE_ERROR_REPORTING:-true},
  SERVICE_ERROR_LEVEL: '${SERVICE_ERROR_LEVEL:-debug}',
  SERVICE_MAX_ERRORS: ${SERVICE_MAX_ERRORS:-100},
  
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
  },
  masterEnvironment: true // Flag to indicate master environment configuration
};

console.log('[Runtime Environment] Initialized from master environment file');
EOF

  echo "Runtime environment file created successfully"
}

# Execute the functions
load_master_env
create_runtime_env

# Continue with the next script in the entrypoint chain
exit 0