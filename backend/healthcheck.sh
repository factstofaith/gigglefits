#!/bin/bash
# Backend Health Check Script
# This script checks if the backend is healthy by calling the health endpoint

# Configuration
HEALTH_ENDPOINT="http://localhost:8000/health/simple"
TIMEOUT=5
MAX_RETRIES=3
RETRY_DELAY=1

# Function to check health endpoint
check_health() {
  local response
  local status_code
  
  # Use curl to fetch health endpoint with timeout
  response=$(curl -s -w "%{http_code}" -o /tmp/health_response.json -m "$TIMEOUT" "$HEALTH_ENDPOINT")
  status_code=$?
  
  # Check curl exit status
  if [ $status_code -ne 0 ]; then
    echo "Health check failed: Curl error $status_code"
    return 1
  fi
  
  # Check HTTP status code
  if [ "$response" != "200" ]; then
    echo "Health check failed: HTTP status $response"
    return 1
  fi
  
  # Parse JSON response and check status (optional, requires jq)
  if command -v jq >/dev/null 2>&1; then
    local health_status
    health_status=$(jq -r '.status' /tmp/health_response.json)
    
    if [ "$health_status" != "ok" ]; then
      echo "Health check failed: Service status is $health_status"
      return 1
    fi
  fi
  
  # Cleanup
  rm -f /tmp/health_response.json
  
  return 0
}

# Main health check logic with retries
for (( i=1; i<=MAX_RETRIES; i++ )); do
  if check_health; then
    echo "Health check passed"
    exit 0
  fi
  
  echo "Health check attempt $i of $MAX_RETRIES failed, retrying in $RETRY_DELAY seconds..."
  sleep $RETRY_DELAY
done

echo "Health check failed after $MAX_RETRIES attempts"
exit 1