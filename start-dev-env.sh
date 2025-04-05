#!/bin/bash
# TAP Integration Platform - Unified Development Environment Startup
# This script provides a standardized way to start the development environment

# Set strict error handling
set -e

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
  exit 1
}

# Function to print warning messages
print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Display banner
echo "=========================================================================="
echo "               TAP INTEGRATION PLATFORM - DEV ENVIRONMENT                 "
echo "=========================================================================="
print_status "Starting development environment with standardized configuration"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  print_error "Docker is not running. Please start Docker and try again."
fi

# Check if docker-compose is available
if ! command -v docker compose > /dev/null 2>&1; then
  print_error "Docker Compose is not available. Please install Docker Compose and try again."
fi

# Stop any running containers
print_status "Stopping existing containers..."
docker compose down 2>/dev/null || true
docker rm -f tap-frontend-dev tap-backend-dev 2>/dev/null || true

# Remove existing Docker networks
print_status "Cleaning up Docker networks..."
docker network rm tap-network-dev 2>/dev/null || true

# Ensure we're using the standardized docker-compose file
print_status "Using standardized Docker configuration..."
if [ -f docker-compose.yml.new ]; then
  print_status "Found docker-compose.yml.new, using it as the standard configuration"
  cp docker-compose.yml.new docker-compose.yml
else
  print_warning "docker-compose.yml.new not found, using existing docker-compose.yml"
fi

# Set environment variables
print_status "Setting standardized environment variables..."
export SERVICE_ENV=development
export SERVICE_VERSION=1.0.0
export SERVICE_FRONTEND_PORT=3456
export SERVICE_BACKEND_PORT=8000
export SERVICE_API_URL=http://tap-backend:8000
export SERVICE_DEV_MODE=true
export SERVICE_DEBUG=true

# Build and start the containers
print_status "Building and starting containers..."
docker compose build
docker compose up -d

# Wait for containers to initialize
print_status "Waiting for containers to initialize (30 seconds)..."
sleep 10
print_status "Checking container status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check if containers are healthy
print_status "Waiting for health checks to pass..."
TIMEOUT=120
START_TIME=$(date +%s)
while true; do
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  
  if [ $ELAPSED -gt $TIMEOUT ]; then
    print_error "Timed out waiting for containers to become healthy. Check logs for details."
  fi
  
  FRONTEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' tap-frontend-dev 2>/dev/null || echo "not running")
  BACKEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' tap-backend-dev 2>/dev/null || echo "not running")
  
  if [ "$FRONTEND_HEALTH" = "healthy" ] && [ "$BACKEND_HEALTH" = "healthy" ]; then
    print_success "All containers are healthy!"
    break
  fi
  
  echo -n "."
  sleep 5
done

# Display access information
echo ""
print_success "Development environment is running!"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3456"
echo "  Backend API: http://localhost:8000"
echo "  API Documentation: http://localhost:8000/docs"
echo ""
echo "Container logs:"
echo "  Frontend: docker logs -f tap-frontend-dev"
echo "  Backend: docker logs -f tap-backend-dev"
echo ""
echo "To stop the environment: docker compose down"
echo "=========================================================================="

# Ask if user wants to see logs
read -p "Do you want to follow the container logs? (y/n): " SHOW_LOGS
if [[ $SHOW_LOGS == "y" || $SHOW_LOGS == "Y" ]]; then
  docker compose logs -f
fi