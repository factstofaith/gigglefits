#!/bin/bash
# TAP Integration Platform - Service Integration Test Script
# Tests communication between frontend and backend services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
  echo -e "${BLUE}[STATUS]${NC} $1"
}

# Function to print success messages
print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to print error messages
print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Function to print warning messages
print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  print_error "jq is required but not installed. Please install jq first."
  echo "On Ubuntu/Debian: sudo apt-get install jq"
  echo "On CentOS/RHEL: sudo yum install jq"
  echo "On macOS: brew install jq"
  exit 1
fi

# Test backend health
print_status "Testing backend health..."
backend_health=$(curl -s http://localhost:8000/health)

if [ $? -ne 0 ]; then
  print_error "Failed to connect to backend health endpoint"
  exit 1
fi

echo $backend_health | jq '.' || print_warning "Backend response is not valid JSON: $backend_health"

if echo $backend_health | grep -q "healthy"; then
  print_success "Backend is healthy"
else
  print_error "Backend reports unhealthy status"
  exit 1
fi

# Test frontend health
print_status "Testing frontend health..."
frontend_health=$(curl -s http://localhost:3456/health)

if [ $? -ne 0 ]; then
  print_error "Failed to connect to frontend health endpoint"
  exit 1
fi

echo $frontend_health

if echo $frontend_health | grep -q "healthy"; then
  print_success "Frontend is healthy"
else
  print_error "Frontend reports unhealthy status"
  exit 1
fi

# Test backend API access from host
print_status "Testing backend API access..."
backend_api=$(curl -s http://localhost:8000/api/v1/health)

if [ $? -ne 0 ]; then
  print_error "Failed to connect to backend API endpoint"
  exit 1
fi

echo $backend_api | jq '.' || print_warning "Backend API response is not valid JSON: $backend_api"

if echo $backend_api | grep -q "status"; then
  print_success "Backend API is accessible"
else
  print_error "Backend API is not responding correctly"
  exit 1
fi

# Get container IDs
print_status "Getting container IDs..."
frontend_container=$(docker ps --filter "name=tap-frontend" --format "{{.ID}}")
backend_container=$(docker ps --filter "name=tap-backend" --format "{{.ID}}")

if [ -z "$frontend_container" ]; then
  print_error "Frontend container not found"
  exit 1
fi

if [ -z "$backend_container" ]; then
  print_error "Backend container not found"
  exit 1
fi

print_success "Frontend container: $frontend_container"
print_success "Backend container: $backend_container"

# Test internal communication (backend to frontend)
print_status "Testing backend to frontend communication..."
docker exec $backend_container curl -s http://tap-frontend/health

if [ $? -ne 0 ]; then
  print_error "Backend cannot connect to frontend"
else
  print_success "Backend can connect to frontend"
fi

# Test internal communication (frontend to backend)
print_status "Testing frontend to backend communication..."
docker exec $frontend_container curl -s http://tap-backend:8000/health | jq '.' || echo "Response not valid JSON"

if [ $? -ne 0 ]; then
  print_error "Frontend cannot connect to backend"
else
  print_success "Frontend can connect to backend"
fi

# Test API communication with environment variables
print_status "Testing API communication with environment variables..."
docker exec $frontend_container env | grep -E '(SERVICE_|REACT_APP_)'

print_status "Checking how frontend resolves backend API URL..."
docker exec $frontend_container cat /app/public/runtime-env.js | grep -E '(API_URL|SERVICE_API_URL)'

print_status "Testing actual API endpoint from frontend container..."
docker exec $frontend_container curl -s http://tap-backend:8000/api/v1/health | jq '.' || echo "Response not valid JSON"

if [ $? -ne 0 ]; then
  print_error "Frontend cannot access backend API"
else
  print_success "Frontend can access backend API"
fi

print_success "Service integration tests completed."