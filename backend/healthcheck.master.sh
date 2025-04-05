#!/bin/bash
# Backend Health Check Script for TAP Integration Platform
# Enhanced script with Docker-specific health checks and detailed status reporting

# Configuration (can be overridden by environment variables)
HOST=${HOST:-localhost}
PORT=${PORT:-8000}
HEALTH_ENDPOINT="http://${HOST}:${PORT}/health/docker"
TIMEOUT=${HEALTH_CHECK_TIMEOUT:-5}
MAX_RETRIES=${HEALTH_CHECK_RETRIES:-3}
RETRY_DELAY=${HEALTH_CHECK_RETRY_DELAY:-1}
DOCKER_ENDPOINT="/health/docker"
FULL_ENDPOINT="/health"
SIMPLE_ENDPOINT="/health/simple"
API_MARKER_FILE="/tmp/api_ready"  # Marker file for API readiness

# Development mode settings
DEV_MODE=${DEV_MODE:-true}
STARTUP_GRACE_PERIOD=120  # seconds
CONTAINER_START_TIME_FILE="/tmp/container_start_time"

# Progress tracking
echo "Starting TAP backend health check..."
echo "Environment: ${APP_ENVIRONMENT:-unknown}"
echo "Container: ${CONTAINER_NAME:-unknown}"

# Create or check container start time file
if [ ! -f "$CONTAINER_START_TIME_FILE" ]; then
    date +%s > "$CONTAINER_START_TIME_FILE"
    echo "First health check - recording container start time"
    
    # In development mode, give container time to start
    if [ "$DEV_MODE" = "true" ] || [ "${APP_ENVIRONMENT}" = "development" ]; then
        echo "Development mode: Container is starting, allowing grace period"
        # First health check always passes in development
        exit 0
    fi
fi

# Calculate how long the container has been running
CONTAINER_START_TIME=$(cat "$CONTAINER_START_TIME_FILE")
CURRENT_TIME=$(date +%s)
UPTIME=$((CURRENT_TIME - CONTAINER_START_TIME))

echo "Container uptime: ${UPTIME}s"

# In development mode, be more tolerant during startup period
if { [ "$DEV_MODE" = "true" ] || [ "${APP_ENVIRONMENT}" = "development" ]; } && [ "$UPTIME" -lt "$STARTUP_GRACE_PERIOD" ]; then
    echo "Development mode: Within startup grace period (${UPTIME}s / ${STARTUP_GRACE_PERIOD}s)"
    echo "✓ Health check passed (startup grace period)"
    exit 0
fi

# Function to check if the process is running
check_process() {
    # Check if uvicorn is running
    if pgrep -f "uvicorn main:app" >/dev/null; then
        echo "✓ Process is running"
        return 0
    elif pgrep -f "gunicorn main:app" >/dev/null; then
        echo "✓ Process is running (gunicorn)"
        return 0
    else
        echo "✗ Process is not running"
        return 1
    fi
}

# Function to check health endpoint
check_health() {
    local endpoint=$1
    local response
    local status_code
    
    echo "Checking endpoint: $endpoint"
    
    # Use curl to fetch health endpoint with timeout
    response=$(curl -s -w "%{http_code}" -o /tmp/health_response.json -m "$TIMEOUT" "$endpoint" 2>/dev/null)
    status_code=$?
    
    # Check curl exit status
    if [ $status_code -ne 0 ]; then
        echo "✗ Health check failed: Curl error $status_code"
        
        # If container just started, be more tolerant
        if [ "$UPTIME" -lt 30 ]; then
            echo "Container recently started, connection may still be initializing"
            return 1
        fi
        
        return 1
    fi
    
    # Check HTTP status code
    if [ "$response" = "200" ]; then
        echo "✓ HTTP status OK: 200"
    elif [ "$response" = "503" ]; then
        echo "✗ Service degraded or unavailable: 503"
        return 1
    else
        echo "✗ Unexpected HTTP status: $response"
        return 1
    fi
    
    # Parse JSON response and check status
    if command -v jq >/dev/null 2>&1; then
        local health_status
        health_status=$(jq -r '.status' /tmp/health_response.json 2>/dev/null || echo "unknown")
        
        if [ "$health_status" = "ok" ]; then
            echo "✓ Service status: $health_status"
        else
            echo "✗ Service status: $health_status"
            
            # Extract more details if available
            if jq -e '.reason' /tmp/health_response.json >/dev/null 2>&1; then
                local reason
                reason=$(jq -r '.reason' /tmp/health_response.json)
                echo "  Reason: $reason"
            fi
            
            if jq -e '.error' /tmp/health_response.json >/dev/null 2>&1; then
                local error
                error=$(jq -r '.error' /tmp/health_response.json)
                echo "  Error: $error"
            fi
            
            return 1
        fi
    else
        # Simple check if jq is not available
        if grep -q "ok" /tmp/health_response.json; then
            echo "✓ Response contains 'ok'"
        else
            echo "✗ Response does not contain 'ok'"
            return 1
        fi
    fi
    
    return 0
}

# Function to check if API is fully initialized
check_api_initialized() {
    # Check if the API endpoints are accessible, not just the process
    echo "Checking if API is fully initialized..."
    if curl -s "http://${HOST}:${PORT}/api/v1/health" -o /dev/null; then
        echo "✓ API is fully initialized and endpoints are responding"
        # Create marker file for API readiness that can be used by other containers
        touch "$API_MARKER_FILE"
        return 0
    else
        if [ -f "$API_MARKER_FILE" ]; then
            echo "! API was previously initialized but is not responding now"
            rm "$API_MARKER_FILE"
        else
            echo "✗ API is not fully initialized yet"
        fi
        return 1
    fi
}

# Check if process is running first
if ! check_process; then
    echo "✗ Health check failed: Process not running"
    
    # For Docker startup, we should be more permissive during initialization
    # Especially in development mode, the app might take longer to start
    if { [ "$DEV_MODE" = "true" ] || [ "${APP_ENVIRONMENT}" = "development" ]; } && [ "$UPTIME" -lt 60 ]; then
        echo "Development mode: Temporarily considering container healthy to allow startup (process starting)"
        exit 0
    fi
    
    # Remove API ready marker if process is not running
    if [ -f "$API_MARKER_FILE" ]; then
        rm "$API_MARKER_FILE"
    fi
    
    exit 1
fi

# Try Docker-specific health endpoint first (faster)
for ((i=1; i<=MAX_RETRIES; i++)); do
    if check_health "${HEALTH_ENDPOINT}"; then
        echo "✓ Docker health check passed"
        
        # After basic health check passes, verify API is fully initialized
        # Only needed if API marker file doesn't exist yet
        if [ ! -f "$API_MARKER_FILE" ]; then
            # Try to verify API is fully initialized
            if check_api_initialized; then
                echo "✓ API endpoints are ready and responding"
            else
                echo "! Basic health check passed but API is not yet fully initialized"
                # Continue and consider healthy, but don't create the ready marker yet
            fi
        else
            echo "✓ API was already initialized and marked as ready"
        fi
        
        rm -f /tmp/health_response.json
        exit 0
    fi
    
    echo "✗ Docker health check attempt $i of $MAX_RETRIES failed"
    
    # Try simple health endpoint as fallback
    if [ $i -eq $MAX_RETRIES ]; then
        echo "Trying simple health endpoint as fallback..."
        if check_health "http://${HOST}:${PORT}${SIMPLE_ENDPOINT}"; then
            echo "✓ Simple health check passed"
            
            # Try to verify API is fully initialized after simple check passes
            if ! [ -f "$API_MARKER_FILE" ]; then
                check_api_initialized
            fi
            
            rm -f /tmp/health_response.json
            exit 0
        fi
        
        # If we're in development mode, be more permissive during startup
        if { [ "$DEV_MODE" = "true" ] || [ "${APP_ENVIRONMENT}" = "development" ]; } && [ "$UPTIME" -lt "$STARTUP_GRACE_PERIOD" ]; then
            echo "Development mode: Temporarily considering container healthy despite endpoint check failure"
            echo "Container is still within startup grace period (${UPTIME}s / ${STARTUP_GRACE_PERIOD}s)"
            rm -f /tmp/health_response.json
            exit 0
        fi
    fi
    
    if [ $i -lt $MAX_RETRIES ]; then
        echo "Retrying in $RETRY_DELAY seconds..."
        sleep $RETRY_DELAY
    fi
done

# For Docker orchestration, additional info on failure is helpful
if [ "${RUNNING_IN_DOCKER}" = "true" ]; then
    echo "Container information:"
    echo "  Name: ${CONTAINER_NAME:-unknown}"
    echo "  ID: ${HOSTNAME:-unknown}"
    echo "  Environment: ${APP_ENVIRONMENT:-unknown}"
    echo "  Uptime: ${UPTIME}s"
fi

# Cleanup
rm -f /tmp/health_response.json

echo "✗ Health check failed after $MAX_RETRIES attempts"

# If health check fails, ensure API marker is removed
if [ -f "$API_MARKER_FILE" ]; then
    echo "Removing API ready marker since health check failed"
    rm -f "$API_MARKER_FILE"
fi

# Last chance for development mode - after grace period we start enforcing health checks
if { [ "$DEV_MODE" = "true" ] || [ "${APP_ENVIRONMENT}" = "development" ]; } && [ "$UPTIME" -lt 300 ]; then
    echo "Development mode: Still within extended grace period. Passing health check."
    exit 0
fi

exit 1