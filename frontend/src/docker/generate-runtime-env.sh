#!/bin/sh
# Runtime Environment Variables Generator
# This script generates the runtime-env.js file with current environment variables
# It's executed at container startup to inject environment values

# Output file path
OUTPUT_FILE="/usr/share/nginx/html/runtime-env.js"

# Start the file with window.__RUNTIME_ENV__ object
echo "window.__RUNTIME_ENV__ = {" > $OUTPUT_FILE

# Add environment variables that should be available at runtime
# Add environment-specific variables here

# API URLs
[[ ! -z "$API_URL" ]] && echo "  API_URL: '$API_URL'," >> $OUTPUT_FILE
[[ ! -z "$BASE_URL" ]] && echo "  BASE_URL: '$BASE_URL'," >> $OUTPUT_FILE
[[ ! -z "$PUBLIC_URL" ]] && echo "  PUBLIC_URL: '$PUBLIC_URL'," >> $OUTPUT_FILE

# Environment
echo "  NODE_ENV: '$NODE_ENV'," >> $OUTPUT_FILE
[[ ! -z "$ENV" ]] && echo "  ENV: '$ENV'," >> $OUTPUT_FILE

# Feature flags
[[ ! -z "$DEBUG" ]] && echo "  DEBUG: '$DEBUG'," >> $OUTPUT_FILE

# Authentication
[[ ! -z "$AUTH_ENABLED" ]] && echo "  AUTH_ENABLED: '$AUTH_ENABLED'," >> $OUTPUT_FILE

# Server config
[[ ! -z "$PORT" ]] && echo "  PORT: '$PORT'," >> $OUTPUT_FILE
[[ ! -z "$HOST" ]] && echo "  HOST: '$HOST'," >> $OUTPUT_FILE
[[ ! -z "$SERVER_URL" ]] && echo "  SERVER_URL: '$SERVER_URL'," >> $OUTPUT_FILE

# Docker-specific
echo "  CONTAINER_NAME: '$HOSTNAME'," >> $OUTPUT_FILE

# Version
[[ ! -z "$APP_VERSION" ]] && echo "  APP_VERSION: '$APP_VERSION'," >> $OUTPUT_FILE

# Close the object
echo "};" >> $OUTPUT_FILE

echo "Runtime environment variables generated at $OUTPUT_FILE"
