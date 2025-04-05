#!/bin/sh
# Environment Variable Injection Script for TAP Integration Platform
# Injects environment variables into index.html at runtime for Docker containers

set -e  # Exit on error

# Configuration
INDEX_FILE=${INDEX_FILE:-/app/public/index.html}
RUNTIME_ENV_FILE=${RUNTIME_ENV_FILE:-/app/public/runtime-env.js}

# Function to inject environment variables into index.html
inject_env_vars() {
  echo "Injecting environment variables into index.html..."
  
  # Check if the file exists
  if [ ! -f "$INDEX_FILE" ]; then
    echo "Warning: index.html not found at $INDEX_FILE, creating empty placeholder"
    mkdir -p "$(dirname "$INDEX_FILE")"
    echo "<html><body>Index file placeholder</body></html>" > "$INDEX_FILE"
  fi
  
  # Create a JavaScript object with environment variables
  ENV_JSON="{"
  
  # REACT_APP_ environment variables
  for var in $(env | grep -E '^REACT_APP_' | sort); do
    key=$(echo "$var" | cut -d= -f1)
    value=$(echo "$var" | cut -d= -f2-)
    ENV_JSON="${ENV_JSON}\"${key}\": \"${value}\","
  done
  
  # Add common variables
  ENV_JSON="${ENV_JSON}\"REACT_APP_VERSION\": \"${REACT_APP_VERSION:-1.0.0}\","
  ENV_JSON="${ENV_JSON}\"REACT_APP_API_URL\": \"${REACT_APP_API_URL:-/api}\","
  ENV_JSON="${ENV_JSON}\"REACT_APP_AUTH_URL\": \"${REACT_APP_AUTH_URL:-/auth}\","
  ENV_JSON="${ENV_JSON}\"REACT_APP_ENVIRONMENT\": \"${NODE_ENV:-production}\","
  
  # Add Docker-specific variables
  ENV_JSON="${ENV_JSON}\"REACT_APP_RUNNING_IN_DOCKER\": \"true\","
  ENV_JSON="${ENV_JSON}\"REACT_APP_CONTAINER_ID\": \"${HOSTNAME:-unknown}\","
  ENV_JSON="${ENV_JSON}\"REACT_APP_CONTAINER_VERSION\": \"${REACT_APP_CONTAINER_VERSION:-1.0.0}\","
  ENV_JSON="${ENV_JSON}\"REACT_APP_DOCKER_ENVIRONMENT\": \"${REACT_APP_DOCKER_ENVIRONMENT:-production}\","
  ENV_JSON="${ENV_JSON}\"REACT_APP_HEALTH_CHECK_INTERVAL\": \"${REACT_APP_HEALTH_CHECK_INTERVAL:-60000}\","
  ENV_JSON="${ENV_JSON}\"REACT_APP_ERROR_LOGGING_ENABLED\": \"${REACT_APP_ERROR_LOGGING_ENABLED:-true}\","
  ENV_JSON="${ENV_JSON}\"REACT_APP_ERROR_LOG_LEVEL\": \"${REACT_APP_ERROR_LOG_LEVEL:-warn}\","
  ENV_JSON="${ENV_JSON}\"REACT_APP_DOCKER_ERROR_HANDLING\": \"${REACT_APP_DOCKER_ERROR_HANDLING:-enabled}\""
  
  ENV_JSON="${ENV_JSON}}"
  
  # Replace the window.env object in index.html
  # First try standard approach
  if grep -q "window.env = {.*}" "$INDEX_FILE"; then
    sed -i "s|window.env = {.*};|window.env = ${ENV_JSON};|g" "$INDEX_FILE"
    echo "Successfully injected environment variables into window.env object"
  else
    # Fallback approach - insert after opening head tag
    sed -i "s|<head>|<head>\n<script>window.env = ${ENV_JSON};</script>|" "$INDEX_FILE"
    echo "Inserted window.env script tag into head section"
  fi
}

# Function to create runtime-env.js file
create_runtime_env() {
  echo "Creating runtime environment file at $RUNTIME_ENV_FILE..."
  
  mkdir -p "$(dirname "$RUNTIME_ENV_FILE")"
  
  # Create runtime environment file
  cat << EOF > "$RUNTIME_ENV_FILE"
// Runtime environment variables - dynamically injected at runtime
window.runtimeEnv = {
  // Environment values injected at container startup
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
  ERROR_LOG_LEVEL: '${REACT_APP_ERROR_LOG_LEVEL:-warn}',
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
  SERVICE_ERROR_LEVEL: '${SERVICE_ERROR_LEVEL:-warn}',
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
  }
};

console.log('[Runtime Environment] Initialized with standardized variables');
EOF

  echo "Runtime environment file created successfully"
}

# Execute the functions
inject_env_vars
create_runtime_env

# Continue with the next script in the entrypoint chain
exit 0