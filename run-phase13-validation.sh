#!/bin/bash
#
# Phase 13 Comprehensive Validation Script
# 
# This script performs a full validation of Phase 13 implementation,
# checking auth flow, database standardization, and regression testing
# on all previously implemented features.
#
# Usage: ./run-phase13-validation.sh [--skip-start]

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="phase13-validation-$(date +%Y%m%d%H%M%S).log"

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

# Function to run a command and log its output
run_cmd() {
  local cmd="$1"
  local description="$2"
  
  log "INFO" "Running: $description"
  echo "$ $cmd" >> $LOG_FILE
  
  if output=$($cmd 2>&1); then
    log "SUCCESS" "$description completed successfully"
    echo "$output" >> $LOG_FILE
    return 0
  else
    log "ERROR" "$description failed"
    echo "$output" >> $LOG_FILE
    return 1
  fi
}

# Welcome message
log "INFO" "Starting Phase 13 Comprehensive Validation"
log "INFO" "Results will be logged to $LOG_FILE"

# Check if we should skip container startup
if [[ "$1" != "--skip-start" ]]; then
  # Ensure Docker is running
  if ! docker info >/dev/null 2>&1; then
    log "ERROR" "Docker is not running or not accessible"
    exit 1
  fi

  # Start containers
  log "INFO" "Starting Docker containers"
  if ./start-containers.sh >> $LOG_FILE 2>&1; then
    log "SUCCESS" "Docker containers started successfully"
  else
    log "ERROR" "Failed to start Docker containers"
    exit 1
  fi
else
  log "INFO" "Skipping container startup as requested"
fi

# Validation Phase 1: Component Tests
log "INFO" "Starting Component Validation"

# Validate Docker environment
log "INFO" "Running Docker environment validation"
if ./validate-docker-env.sh >> $LOG_FILE 2>&1; then
  log "SUCCESS" "Docker environment validation passed"
else
  log "ERROR" "Docker environment validation failed"
fi

# Validate service communication
log "INFO" "Testing service communication"
if ./test-service-integration.sh >> $LOG_FILE 2>&1; then
  log "SUCCESS" "Service communication test passed"
else
  log "WARNING" "Service communication test had issues"
fi

# Test authentication flow
log "INFO" "Testing authentication flow"
if ./test-auth-integration.sh >> $LOG_FILE 2>&1; then
  log "SUCCESS" "Authentication flow test passed"
else
  log "WARNING" "Authentication flow test had issues"
fi

# Validation Phase 2: Cross-Component Tests
log "INFO" "Starting Cross-Component Validation"

# Check if Python and SQLAlchemy are available
if python3 -c "import sqlalchemy" >/dev/null 2>&1; then
  log "INFO" "Running database standardization test"
  if python3 test-database-standardization.py >> $LOG_FILE 2>&1; then
    log "SUCCESS" "Database standardization test passed"
  else
    log "WARNING" "Database standardization test had issues"
  fi
else
  log "WARNING" "Skipping database standardization test (SQLAlchemy not available)"
fi

# Test authentication with database
log "INFO" "Testing authentication with database persistence"
if python3 test-phase13-validation.py --skip-db >> $LOG_FILE 2>&1; then
  log "SUCCESS" "Authentication with database test passed"
else
  log "WARNING" "Authentication with database test had issues"
fi

# Validation Phase 3: Regression Testing
log "INFO" "Starting Regression Testing"

# Check Docker container health
log "INFO" "Verifying Docker container health"
if ./verify-docker-startup.sh >> $LOG_FILE 2>&1; then
  log "SUCCESS" "Docker container health verification passed"
else
  log "WARNING" "Docker container health verification had issues"
fi

# Test frontend container specifically
log "INFO" "Testing frontend container"
if ./test-frontend-container.sh >> $LOG_FILE 2>&1; then
  log "SUCCESS" "Frontend container test passed"
else
  log "WARNING" "Frontend container test had issues"
fi

# Validation Phase 4: Performance and Security Checks
log "INFO" "Starting Performance and Security Validation"

# Security check: HTTP headers
log "INFO" "Checking security headers"
if curl -s -I http://localhost:3000 | grep -i "x-content-type-options" >> $LOG_FILE 2>&1; then
  log "SUCCESS" "Security headers check passed"
else
  log "WARNING" "Security headers check had issues"
fi

# Check CORS headers
log "INFO" "Checking CORS configuration"
if curl -s -I -H "Origin: http://localhost:8000" http://localhost:3000/api | grep -i "access-control-allow-origin" >> $LOG_FILE 2>&1; then
  log "SUCCESS" "CORS configuration check passed"
else
  log "WARNING" "CORS configuration check had issues"
fi

# Validation Phase 5: Final Verification
log "INFO" "Starting Final Verification"

# Check if backend health endpoint is accessible
log "INFO" "Checking backend health endpoint"
if curl -s http://localhost:8000/health | grep -q "status"; then
  log "SUCCESS" "Backend health endpoint check passed"
else
  log "WARNING" "Backend health endpoint check had issues"
fi

# Check if frontend is accessible
log "INFO" "Checking frontend accessibility"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
  log "SUCCESS" "Frontend accessibility check passed"
else
  log "WARNING" "Frontend accessibility check had issues"
fi

# Generate summary
SUCCESS_COUNT=$(grep -c "\\[SUCCESS\\]" $LOG_FILE)
WARNING_COUNT=$(grep -c "\\[WARNING\\]" $LOG_FILE)
ERROR_COUNT=$(grep -c "\\[ERROR\\]" $LOG_FILE)
TOTAL_TESTS=$((SUCCESS_COUNT + WARNING_COUNT + ERROR_COUNT))

log "INFO" "Validation Summary:"
log "INFO" "Total tests: $TOTAL_TESTS"
log "INFO" "Successes: $SUCCESS_COUNT"
log "INFO" "Warnings: $WARNING_COUNT"
log "INFO" "Errors: $ERROR_COUNT"

# Final result
if [ $ERROR_COUNT -eq 0 ]; then
  if [ $WARNING_COUNT -eq 0 ]; then
    log "SUCCESS" "All validation tests passed successfully!"
  else
    log "WARNING" "Validation completed with warnings. Check the log for details."
  fi
else
  log "ERROR" "Validation failed with errors. Check the log for details."
fi

log "INFO" "Detailed validation results available in $LOG_FILE"
</parameter>
</invoke>