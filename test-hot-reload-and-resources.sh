#!/bin/bash
#
# Hot Reload and Resource Allocation Test Script
# Tests hot reload functionality and resource allocation in Docker containers
# Usage: ./test-hot-reload-and-resources.sh

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="hot-reload-resources-test-$(date +%Y%m%d%H%M%S).log"

# Function to log and display messages
log() {
  local level=$1
  local message=$2
  local color=$NC
  
  case $level in
    "INFO") color=$BLUE ;;
    "SUCCESS") color=$GREEN ;;
    "WARNING") color=$YELLOW ;;
    "ERROR") color=$RED ;;
  esac
  
  echo -e "${color}[$level]${NC} $message"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" >> $LOG_FILE
}

# Welcome message
log "INFO" "Starting Hot Reload and Resource Allocation Test"
log "INFO" "Results will be logged to $LOG_FILE"

# Ensure Docker is running
if ! docker info >/dev/null 2>&1; then
  log "ERROR" "Docker is not running or not accessible"
  exit 1
fi

# Check if containers are running
FRONTEND_RUNNING=$(docker ps --filter "name=tap-frontend" --format "{{.Names}}" | wc -l)
BACKEND_RUNNING=$(docker ps --filter "name=tap-backend" --format "{{.Names}}" | wc -l)

if [ "$FRONTEND_RUNNING" -eq 0 ] || [ "$BACKEND_RUNNING" -eq 0 ]; then
  log "INFO" "Starting Docker containers with ./start-dev-env.master.sh"
  if ./start-dev-env.master.sh > /dev/null 2>&1; then
    log "SUCCESS" "Docker containers started successfully"
  else
    log "ERROR" "Failed to start Docker containers"
    exit 1
  fi
else
  log "INFO" "Docker containers are already running"
fi

# Get container IDs
FRONTEND_CONTAINER=$(docker ps --filter "name=tap-frontend" --format "{{.ID}}")
BACKEND_CONTAINER=$(docker ps --filter "name=tap-backend" --format "{{.ID}}")

log "INFO" "Frontend container: $FRONTEND_CONTAINER"
log "INFO" "Backend container: $BACKEND_CONTAINER"

# Test 1: Check Resource Limits
log "INFO" "Checking resource limits for containers"

# Check frontend resource limits
FRONTEND_LIMITS=$(docker inspect --format='{{.HostConfig.Resources.Memory}}' $FRONTEND_CONTAINER)
if [ "$FRONTEND_LIMITS" != "0" ]; then
  log "SUCCESS" "Frontend container has resource limits configured"
else
  log "WARNING" "Frontend container may not have resource limits configured"
fi

# Check backend resource limits
BACKEND_LIMITS=$(docker inspect --format='{{.HostConfig.Resources.Memory}}' $BACKEND_CONTAINER)
if [ "$BACKEND_LIMITS" != "0" ]; then
  log "SUCCESS" "Backend container has resource limits configured"
else
  log "WARNING" "Backend container may not have resource limits configured"
fi

# Test 2: Verify Hot Reload Configuration
log "INFO" "Checking hot reload configuration"

# Check webpack configuration
log "INFO" "Checking webpack configuration for hot reload settings"
WEBPACK_HOT=$(docker exec $FRONTEND_CONTAINER cat /app/webpack.config.js | grep -c "hot: true")
if [ "$WEBPACK_HOT" -gt 0 ]; then
  log "SUCCESS" "Hot reload is enabled in webpack configuration"
else
  log "WARNING" "Hot reload may not be enabled in webpack configuration"
fi

# Check WebSocket configuration
log "INFO" "Checking WebSocket configuration for hot reload"
WEBSOCKET_CONFIG=$(docker exec $FRONTEND_CONTAINER cat /app/webpack.config.js | grep -c "webSocketURL")
if [ "$WEBSOCKET_CONFIG" -gt 0 ]; then
  log "SUCCESS" "WebSocket is configured for hot reload"
else
  log "WARNING" "WebSocket may not be properly configured for hot reload"
fi

# Test 3: Verify File Watching
log "INFO" "Checking file watching configuration"

# Check file watching setup
FILE_WATCHING=$(docker exec $FRONTEND_CONTAINER cat /app/webpack.config.js | grep -c "watchFiles")
if [ "$FILE_WATCHING" -gt 0 ]; then
  log "SUCCESS" "File watching is configured in webpack"
else
  log "WARNING" "File watching may not be properly configured"
fi

# Check polling configuration
POLLING_CONFIG=$(docker exec $FRONTEND_CONTAINER cat /app/webpack.config.js | grep -c "usePolling: true")
if [ "$POLLING_CONFIG" -gt 0 ]; then
  log "SUCCESS" "File polling is properly configured for Docker"
else
  log "WARNING" "File polling may not be properly configured for Docker"
fi

# Test 4: Test File Change Detection
log "INFO" "Testing file change detection"

# Create a test component file
TEST_COMPONENT="import React from 'react';\n\nexport const TestComponent = () => {\n  return <div>Test Component - $(date)</div>;\n};\n\nexport default TestComponent;"
echo -e "$TEST_COMPONENT" > ./frontend/src/TestComponent.jsx
log "INFO" "Created test component file: ./frontend/src/TestComponent.jsx"

# Wait a moment for file watching to detect the change
sleep 5

# Check dev server logs for file change detection
FILE_CHANGE_DETECTED=$(docker logs --tail 20 $FRONTEND_CONTAINER 2>&1 | grep -c "TestComponent.jsx")
if [ "$FILE_CHANGE_DETECTED" -gt 0 ]; then
  log "SUCCESS" "File change was detected by webpack"
else
  log "WARNING" "File change detection may not be working properly"
fi

# Test 5: Check Resource Usage
log "INFO" "Checking resource usage"

# Check frontend CPU and memory usage
FRONTEND_CPU=$(docker stats --no-stream --format "{{.CPUPerc}}" $FRONTEND_CONTAINER)
FRONTEND_MEM=$(docker stats --no-stream --format "{{.MemUsage}}" $FRONTEND_CONTAINER)
log "INFO" "Frontend CPU usage: $FRONTEND_CPU"
log "INFO" "Frontend memory usage: $FRONTEND_MEM"

# Check backend CPU and memory usage
BACKEND_CPU=$(docker stats --no-stream --format "{{.CPUPerc}}" $BACKEND_CONTAINER)
BACKEND_MEM=$(docker stats --no-stream --format "{{.MemUsage}}" $BACKEND_CONTAINER)
log "INFO" "Backend CPU usage: $BACKEND_CPU"
log "INFO" "Backend memory usage: $BACKEND_MEM"

# Test 6: Verify Dev Server Diagnostic Features
log "INFO" "Checking dev server diagnostic features"

# Check for diagnostic logging in dev server
DIAGNOSTICS_ENABLED=$(docker logs --tail 50 $FRONTEND_CONTAINER 2>&1 | grep -c "WebSocket HMR configuration")
if [ "$DIAGNOSTICS_ENABLED" -gt 0 ]; then
  log "SUCCESS" "Dev server diagnostics are properly configured"
else
  log "WARNING" "Dev server diagnostics may not be properly configured"
fi

# Check for WebSocket status reporting
WS_STATUS_REPORTING=$(docker logs --tail 100 $FRONTEND_CONTAINER 2>&1 | grep -c "WebSocket status:")
if [ "$WS_STATUS_REPORTING" -gt 0 ]; then
  log "SUCCESS" "WebSocket status reporting is properly configured"
else
  log "WARNING" "WebSocket status reporting may not be properly configured"
fi

# Test 7: Clean Up
log "INFO" "Cleaning up test files"
rm -f ./frontend/src/TestComponent.jsx

# Generate summary
log "INFO" "Test Summary:"
SUCCESS_COUNT=$(grep -c "\\[SUCCESS\\]" $LOG_FILE)
WARNING_COUNT=$(grep -c "\\[WARNING\\]" $LOG_FILE)
ERROR_COUNT=$(grep -c "\\[ERROR\\]" $LOG_FILE)
TOTAL_TESTS=$((SUCCESS_COUNT + WARNING_COUNT))

log "INFO" "Total tests: $TOTAL_TESTS"
log "INFO" "Successes: $SUCCESS_COUNT"
log "INFO" "Warnings: $WARNING_COUNT"
log "INFO" "Errors: $ERROR_COUNT"

# Final result
if [ $ERROR_COUNT -eq 0 ]; then
  if [ $WARNING_COUNT -eq 0 ]; then
    log "SUCCESS" "All tests passed successfully!"
  else
    log "WARNING" "Tests completed with warnings. Check the log for details."
  fi
else
  log "ERROR" "Tests failed with errors. Check the log for details."
fi

log "INFO" "Detailed test results available in $LOG_FILE"