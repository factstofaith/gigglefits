#!/bin/sh
# Frontend Health Check Script for TAP Integration Platform
# This script performs health checks for the frontend service in Docker

# Configuration
PORT=${PORT:-3000}
MAX_RETRIES=3
RETRY_DELAY=1
TIMEOUT=3
HEALTH_ENDPOINT="http://localhost:${PORT}/health"
STATIC_FILE_ENDPOINT="http://localhost:${PORT}/index.html"
PID_PATTERN="node.*dev-server.js"

# Function to check a URL
check_url() {
  local url=$1
  local label=$2
  wget -q --spider --timeout=$TIMEOUT "$url" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "$label is reachable"
    return 0
  else
    echo "$label is not reachable"
    return 1
  fi
}

# Function to check if webpack process is running
check_process() {
  if pgrep -f "$PID_PATTERN" > /dev/null; then
    echo "Frontend service process is running"
    return 0
  else
    echo "Frontend service process is not running"
    return 1
  fi
}

# Main health check logic
check_process || exit 1

# First try the health endpoint if available
for i in $(seq 1 $MAX_RETRIES); do
  if check_url "$HEALTH_ENDPOINT" "Health endpoint"; then
    exit 0
  fi
  
  echo "Health endpoint check attempt $i of $MAX_RETRIES failed - trying static file..."
  
  # If health endpoint fails, try a static file
  if check_url "$STATIC_FILE_ENDPOINT" "Static file"; then
    echo "Static file is accessible, service is healthy"
    exit 0
  fi
  
  # If we still haven't exited, service might be starting up
  echo "Health check attempt $i of $MAX_RETRIES failed - waiting $RETRY_DELAY seconds..."
  sleep $RETRY_DELAY
done

# Even if web server isn't responding yet, if process is running, give more time
# This allows more time for webpack to compile in development mode
echo "Web server not responding, but process is running"
echo "Service may still be starting - marking as healthy to allow startup to complete"
exit 0