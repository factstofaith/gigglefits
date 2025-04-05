#!/bin/bash
# test-standardized-environment.master.sh
#
# Description:
#   Tests the standardized environment setup for the TAP Integration Platform.
#   Verifies that Docker containers can communicate with each other and that
#   the standardized environment files are properly loaded.
#
# Usage:
#   ./test-standardized-environment.master.sh [options]
#
# Options:
#   --verbose       Show detailed output
#   --help          Show this help message
#
# Author: Claude AI
# Created: 2025-04-10
# Updated: 2025-04-10

set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Log functions
function log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
function log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
function log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
function log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Default options
VERBOSE=false
SHOW_HELP=false

# Display help message
function show_help {
  grep '^#' "$0" | grep -v '#!/bin/bash' | sed 's/^# //' | sed 's/^#//'
  exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      SHOW_HELP=true
      shift
      ;;
    *)
      log_error "Unknown option: $1"
      log_error "Use --help to see available options"
      exit 1
      ;;
  esac
done

# Show help if requested
if $SHOW_HELP; then
  show_help
fi

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

# Header
log_info "======================================================"
log_info "TAP Integration Platform - Standardized Environment Test"
log_info "======================================================"
log_info "Started at: $(date)"
log_info "------------------------------------------------------"

# Function to check if containers are running
function check_containers() {
  log_info "Checking Docker container status..."
  
  if ! command -v docker &>/dev/null; then
    log_error "Docker is not installed or not in PATH"
    return 1
  fi
  
  if ! docker ps &>/dev/null; then
    log_error "Docker daemon is not running or you don't have permission"
    return 1
  fi
  
  # Check frontend container
  if docker ps --format '{{.Names}}' | grep -q "tap-frontend-dev"; then
    log_success "Frontend container is running"
    FRONTEND_RUNNING=true
  else
    log_warning "Frontend container is not running"
    FRONTEND_RUNNING=false
  fi
  
  # Check backend container
  if docker ps --format '{{.Names}}' | grep -q "tap-backend-dev"; then
    log_success "Backend container is running"
    BACKEND_RUNNING=true
  else
    log_warning "Backend container is not running"
    BACKEND_RUNNING=false
  fi
  
  # Return success only if both containers are running
  if $FRONTEND_RUNNING && $BACKEND_RUNNING; then
    return 0
  else
    return 1
  fi
}

# Function to check standardized environment files
function check_environment_files() {
  log_info "Checking standardized environment files..."
  
  # Check backend requirements.master.txt
  if [ -f "${SCRIPT_DIR}/backend/requirements.master.txt" ]; then
    log_success "Backend requirements.master.txt exists"
  else
    log_warning "Backend requirements.master.txt does not exist"
  fi
  
  # Check frontend .env.master
  if [ -f "${SCRIPT_DIR}/frontend/.env.master" ]; then
    log_success "Frontend .env.master exists"
  else
    log_error "Frontend .env.master does not exist"
    return 1
  fi
  
  # Check frontend package.master.json
  if [ -f "${SCRIPT_DIR}/frontend/package.master.json" ]; then
    log_success "Frontend package.master.json exists"
  else
    log_error "Frontend package.master.json does not exist"
    return 1
  fi
  
  # Check frontend .nvmrc.master
  if [ -f "${SCRIPT_DIR}/frontend/.nvmrc.master" ]; then
    log_success "Frontend .nvmrc.master exists"
  else
    log_warning "Frontend .nvmrc.master does not exist"
  fi
  
  return 0
}

# Function to test frontend environment loading
function test_frontend_environment() {
  log_info "Testing frontend environment loading..."
  
  if ! $FRONTEND_RUNNING; then
    log_warning "Frontend container is not running, skipping test"
    return 1
  fi
  
  # Check if .env.master is mounted in the container
  if docker exec tap-frontend-dev ls /app/.env.master &>/dev/null; then
    log_success ".env.master is mounted in the frontend container"
  else
    log_error ".env.master is not mounted in the frontend container"
    return 1
  fi
  
  # Check if runtime-env.js exists (generated from .env.master)
  if docker exec tap-frontend-dev ls /app/public/runtime-env.js &>/dev/null; then
    log_success "runtime-env.js exists in the frontend container"
    
    # Verify that it was created from .env.master
    if docker exec tap-frontend-dev cat /app/public/runtime-env.js | grep -q "Initialized from master environment file"; then
      log_success "runtime-env.js was created from .env.master"
    else
      log_warning "Cannot verify if runtime-env.js was created from .env.master"
    fi
  else
    log_error "runtime-env.js does not exist in the frontend container"
    return 1
  fi
  
  return 0
}

# Function to test frontend dependencies
function test_frontend_dependencies() {
  log_info "Testing frontend dependencies..."
  
  if ! $FRONTEND_RUNNING; then
    log_warning "Frontend container is not running, skipping test"
    return 1
  fi
  
  # Check if node_modules has essential dependencies from package.master.json
  local dependencies=("react" "react-dom" "axios" "lodash" "yup")
  local missing_deps=0
  
  for dep in "${dependencies[@]}"; do
    if docker exec tap-frontend-dev ls /app/node_modules/$dep &>/dev/null; then
      if $VERBOSE; then
        log_success "Dependency $dep is installed"
      fi
    else
      log_warning "Dependency $dep is not installed"
      missing_deps=$((missing_deps + 1))
    fi
  done
  
  if [ $missing_deps -eq 0 ]; then
    log_success "All essential frontend dependencies are installed"
    return 0
  else
    log_warning "$missing_deps essential frontend dependencies are missing"
    return 1
  fi
}

# Function to test container communication
function test_container_communication() {
  log_info "Testing container communication..."
  
  if ! $FRONTEND_RUNNING || ! $BACKEND_RUNNING; then
    log_warning "Both containers must be running, skipping test"
    return 1
  fi
  
  # Test backend health endpoint from frontend container
  if docker exec tap-frontend-dev wget -q -O - http://tap-backend:8000/health &>/dev/null; then
    log_success "Frontend container can communicate with backend health endpoint"
  else
    log_error "Frontend container cannot communicate with backend health endpoint"
    return 1
  fi
  
  # Check backend health endpoint from host
  if docker exec tap-backend-dev curl -s http://localhost:8000/health | grep -q "status"; then
    log_success "Backend health endpoint is responding properly"
  else
    log_warning "Backend health endpoint is not responding as expected"
  fi
  
  # Test environment variables for API URL
  if docker exec tap-frontend-dev cat /app/public/runtime-env.js | grep -q "SERVICE_API_URL.*tap-backend:8000"; then
    log_success "Frontend container has correct backend API URL in runtime environment"
  else
    log_warning "Frontend container may not have correct backend API URL in runtime environment"
  fi
  
  return 0
}

# Function to run all tests
function run_all_tests() {
  TESTS_PASSED=0
  TESTS_FAILED=0
  
  # Check if containers are running
  if check_containers; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  # Check standardized environment files
  if check_environment_files; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  # Test frontend environment loading
  if test_frontend_environment; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  # Test frontend dependencies
  if test_frontend_dependencies; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  # Test container communication
  if test_container_communication; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  log_info "------------------------------------------------------"
  log_info "Tests passed: $TESTS_PASSED"
  log_info "Tests failed: $TESTS_FAILED"
  log_info "------------------------------------------------------"
  
  if [ $TESTS_FAILED -eq 0 ]; then
    log_success "All standardized environment tests passed!"
    return 0
  else
    log_warning "Some standardized environment tests failed"
    return 1
  fi
}

# Run all tests
run_all_tests

# Final message
log_info "------------------------------------------------------"
log_info "Completed at: $(date)"
log_info "======================================================"

exit 0