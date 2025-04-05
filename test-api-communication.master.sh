#!/bin/bash
# test-api-communication.master.sh
#
# Description:
#   Tests API communication between frontend and backend containers
#   in the TAP Integration Platform. Verifies that frontend can make
#   requests to the backend API and receive expected responses.
#
# Usage:
#   ./test-api-communication.master.sh [options]
#
# Options:
#   --verbose       Show detailed output
#   --help          Show this help message
#
# Author: Claude AI
# Created: 2025-04-04
# Updated: 2025-04-04

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

# Container names and endpoints
FRONTEND_CONTAINER="tap-frontend-dev"
BACKEND_CONTAINER="tap-backend-dev"
BACKEND_API_URL="http://tap-backend:8000"
HEALTH_ENDPOINT="/health"
API_ENDPOINTS=(
  "/docs"
  "/openapi.json"
  "/api/integrations"
  "/api/users"
)

# Header
log_info "======================================================"
log_info "TAP Integration Platform - API Communication Test"
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
  if docker ps --format '{{.Names}}' | grep -q "$FRONTEND_CONTAINER"; then
    log_success "Frontend container is running"
    FRONTEND_RUNNING=true
  else
    log_warning "Frontend container is not running"
    FRONTEND_RUNNING=false
  fi
  
  # Check backend container
  if docker ps --format '{{.Names}}' | grep -q "$BACKEND_CONTAINER"; then
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

# Function to verify backend health from frontend container
function check_backend_health() {
  log_info "Checking backend health from frontend container..."
  
  if ! $FRONTEND_RUNNING || ! $BACKEND_RUNNING; then
    log_warning "Both containers must be running, skipping test"
    return 1
  fi
  
  # Test backend health endpoint from frontend container
  if docker exec $FRONTEND_CONTAINER wget -q -O - ${BACKEND_API_URL}${HEALTH_ENDPOINT} &>/dev/null; then
    log_success "✓ Frontend container can communicate with backend health endpoint"
    return 0
  else
    log_error "✗ Frontend container cannot communicate with backend health endpoint"
    return 1
  fi
}

# Function to test API endpoints
function test_api_endpoints() {
  log_info "Testing API endpoints from frontend container..."
  
  if ! $FRONTEND_RUNNING || ! $BACKEND_RUNNING; then
    log_warning "Both containers must be running, skipping test"
    return 1
  fi
  
  local success_count=0
  local failure_count=0
  
  # Test each API endpoint
  for endpoint in "${API_ENDPOINTS[@]}"; do
    log_info "Testing endpoint: ${BACKEND_API_URL}${endpoint}"
    
    if $VERBOSE; then
      # Show full response for verbose mode
      response=$(docker exec $FRONTEND_CONTAINER wget -q -O - ${BACKEND_API_URL}${endpoint} 2>&1)
      status=$?
    else
      # Just get status code for normal mode
      response=$(docker exec $FRONTEND_CONTAINER wget -q --spider ${BACKEND_API_URL}${endpoint} 2>&1)
      status=$?
    fi
    
    if [ $status -eq 0 ]; then
      log_success "✓ Endpoint ${endpoint} is accessible"
      success_count=$((success_count + 1))
      
      if $VERBOSE; then
        log_info "Response preview (first 100 characters):"
        echo "${response:0:100}..."
      fi
    else
      log_error "✗ Endpoint ${endpoint} is not accessible"
      log_error "Error: ${response}"
      failure_count=$((failure_count + 1))
    fi
  done
  
  log_info "API endpoint test results:"
  log_info "- Successful endpoints: ${success_count}"
  log_info "- Failed endpoints: ${failure_count}"
  
  if [ $success_count -gt 0 ] && [ $failure_count -eq 0 ]; then
    log_success "All API endpoints are accessible"
    return 0
  elif [ $success_count -gt 0 ]; then
    log_warning "Some API endpoints are accessible, but some failed"
    return 1
  else
    log_error "All API endpoints failed"
    return 1
  fi
}

# Function to test frontend API client configuration
function test_frontend_api_client() {
  log_info "Testing frontend API client configuration..."
  
  if ! $FRONTEND_RUNNING; then
    log_warning "Frontend container is not running, skipping test"
    return 1
  fi
  
  # Check if API client is configured with the correct backend URL
  log_info "Checking API client base URL configuration..."
  
  # Examine the runtime environment variables in the frontend
  if docker exec $FRONTEND_CONTAINER cat /app/public/runtime-env.js | grep -q "SERVICE_API_URL.*$BACKEND_CONTAINER"; then
    log_success "✓ Frontend API client is configured with correct backend URL"
  else
    log_warning "! Frontend API client configuration could not be verified"
    log_info "Checking alternative environment configuration..."
    
    if docker exec $FRONTEND_CONTAINER sh -c "grep -r 'API_BASE_URL.*tap-backend' /app/src" | grep -q .; then
      log_success "✓ Frontend API client base URL is configured correctly in source code"
    else
      log_warning "! Could not confirm frontend API client base URL configuration"
    fi
  fi
  
  # Test actual API communication using the frontend's JavaScript environment
  log_info "Creating test script to verify API communication..."
  
  # Create a small script to test API communication
  cat <<EOT > /tmp/test-api.js
// Simple test script to verify API client configuration
const API_URL = window.runtimeEnv?.SERVICE_API_URL || window.runtimeEnv?.API_URL || 'http://tap-backend:8000';

console.log('Testing API communication with: ' + API_URL);

// Simple function to test API endpoint
async function testApiEndpoint(endpoint) {
  try {
    console.log('Attempting to connect to: ' + API_URL + endpoint);
    const response = await fetch(API_URL + endpoint);
    const status = response.status;
    const contentType = response.headers.get('content-type');
    
    console.log('✓ API request to ' + endpoint + ' succeeded with status code: ' + status);
    console.log('  Content-Type: ' + contentType);
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = await response.json();
        console.log('  Response is valid JSON with keys: ' + Object.keys(data).join(', '));
        return { success: true, status, contentType, isJson: true };
      } catch (e) {
        console.log('  Response is not valid JSON');
        return { success: true, status, contentType, isJson: false };
      }
    }
    
    return { success: true, status, contentType, isJson: false };
  } catch (error) {
    console.error('✗ API request to ' + endpoint + ' failed: ' + error.message);
    // Log detailed error information for network errors
    if (error.name === 'TypeError' && error.message.includes('network')) {
      console.error('  This appears to be a network connectivity issue between containers');
      console.error('  Container DNS resolution may be failing or network is misconfigured');
    }
    return { success: false, error: error.message };
  }
}

// Test multiple endpoints to ensure connectivity
Promise.all([
  testApiEndpoint('/health'),
  testApiEndpoint('/health/simple'),
  testApiEndpoint('/')
])
.then(results => {
  // If any endpoint succeeded, we have connectivity
  if (results.some(r => r.success)) {
    console.log('API communication test passed');
  } else {
    console.log('API communication test failed');
    console.log('All endpoints failed to connect. Check DNS resolution and network configuration.');
  }
});
EOT

  # Copy the test script to the frontend container
  docker cp /tmp/test-api.js $FRONTEND_CONTAINER:/app/test-api.js
  
  # Run the test script in the frontend container using Node
  log_info "Running API communication test in frontend container..."
  
  # Create a server-side version of the test that doesn't rely on browser globals
  cat <<EOT > /tmp/test-api-node.js
// Node.js version of the test script (no browser globals)
const http = require('http');
const https = require('https');

// Backend API URL (same as in container DNS)
const API_URL = 'http://tap-backend:8000';

console.log('Testing API communication with: ' + API_URL);

// Simple function to test API endpoint with Node.js http module
function testApiEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    console.log('Attempting to connect to: ' + API_URL + endpoint);
    
    // Choose http or https module based on URL
    const httpModule = API_URL.startsWith('https') ? https : http;
    
    const req = httpModule.get(API_URL + endpoint, (res) => {
      const status = res.statusCode;
      const contentType = res.headers['content-type'];
      
      console.log('✓ API request to ' + endpoint + ' succeeded with status code: ' + status);
      console.log('  Content-Type: ' + contentType);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (contentType && contentType.includes('application/json')) {
          try {
            const jsonData = JSON.parse(data);
            console.log('  Response is valid JSON with keys: ' + Object.keys(jsonData).join(', '));
            resolve({ success: true, status, contentType, isJson: true });
          } catch (e) {
            console.log('  Response is not valid JSON');
            resolve({ success: true, status, contentType, isJson: false });
          }
        } else {
          resolve({ success: true, status, contentType, isJson: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('✗ API request to ' + endpoint + ' failed: ' + error.message);
      // Log detailed error information for network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.error('  This appears to be a network connectivity issue between containers');
        console.error('  Container DNS resolution may be failing or network is misconfigured');
        console.error('  Error code: ' + error.code);
      }
      resolve({ success: false, error: error.message });
    });
    
    // Set a timeout
    req.setTimeout(5000, () => {
      req.destroy();
      console.error('✗ API request to ' + endpoint + ' failed: timeout after 5 seconds');
      resolve({ success: false, error: 'timeout' });
    });
  });
}

// Test multiple endpoints to ensure connectivity
async function runTests() {
  const results = await Promise.all([
    testApiEndpoint('/health'),
    testApiEndpoint('/health/simple'),
    testApiEndpoint('/')
  ]);
  
  // If any endpoint succeeded, we have connectivity
  if (results.some(r => r.success)) {
    console.log('API communication test passed');
    return true;
  } else {
    console.log('API communication test failed');
    console.log('All endpoints failed to connect. Check DNS resolution and network configuration.');
    return false;
  }
}

// Run the tests
runTests().then(result => {
  process.exit(result ? 0 : 1);
});
EOT

  # Copy the test script to the frontend container
  docker cp /tmp/test-api-node.js $FRONTEND_CONTAINER:/app/test-api-node.js
  
  # Run the Node.js version of the test
  if docker exec $FRONTEND_CONTAINER node /app/test-api-node.js; then
    log_success "✓ Frontend API client can communicate with backend API"
    return 0
  else
    log_error "✗ Frontend API client failed to communicate with backend API"
    return 1
  fi
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
    log_warning "Container check failed, no further tests will be run"
    return 1
  fi
  
  # Test backend health from frontend container
  if check_backend_health; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  # Test API endpoints
  if test_api_endpoints; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  # Test frontend API client configuration
  if test_frontend_api_client; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  log_info "------------------------------------------------------"
  log_info "Tests passed: $TESTS_PASSED"
  log_info "Tests failed: $TESTS_FAILED"
  log_info "------------------------------------------------------"
  
  if [ $TESTS_FAILED -eq 0 ]; then
    log_success "✅ All API communication tests passed!"
    return 0
  else
    log_warning "⚠️ Some API communication tests failed"
    return 1
  fi
}

# Run all tests
run_all_tests
test_result=$?

# Final message
log_info "------------------------------------------------------"
log_info "Completed at: $(date)"
log_info "======================================================"

# Exit with test result
exit $test_result