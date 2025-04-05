#!/usr/bin/env sh
# This script generates runtime-env.js with current environment variables
# Run at container startup to inject environment values without rebuilding

set -e

# Application environment variables to expose to the frontend
RUNTIME_ENV_FILE=/usr/share/nginx/html/runtime-env.js

# Create runtime environment file
cat << EOF > $RUNTIME_ENV_FILE
// Runtime environment variables - dynamically injected at runtime
window.runtimeEnv = {
  // Environment values injected at container startup
  API_URL: '${API_URL:-/api}',
  AUTH_URL: '${AUTH_URL:-/auth}',
  PUBLIC_URL: '${PUBLIC_URL:-}',
  HOST: '${HOST:-localhost}',
  PORT: '${PORT:-3000}',
  ENVIRONMENT: '${NODE_ENV:-development}',
  VERSION: '${VERSION:-development}',
  BUILD_TIME: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
  
  // Docker-specific settings
  IS_DOCKER: true,
  DOCKER_COMPOSE_PROJECT: '${COMPOSE_PROJECT_NAME:-tap-integration-platform}',
  
  // Function to access env variables with defaults
  get: function(key, defaultValue) {
    return this[key] !== undefined ? this[key] : defaultValue;
  }
};

// Runtime configuration for app initialization
window.runtimeConfig = {
  apiBaseUrl: window.runtimeEnv.API_URL,
  authBaseUrl: window.runtimeEnv.AUTH_URL,
  publicUrl: window.runtimeEnv.PUBLIC_URL,
  environment: window.runtimeEnv.ENVIRONMENT,
  version: window.runtimeEnv.VERSION,
  isDocker: window.runtimeEnv.IS_DOCKER,
  buildTime: window.runtimeEnv.BUILD_TIME,
};

console.log('[Runtime Environment] Initialized with config:', window.runtimeConfig);
EOF

echo "Runtime environment file generated at $RUNTIME_ENV_FILE"
