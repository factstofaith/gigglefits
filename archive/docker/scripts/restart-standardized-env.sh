#!/bin/bash
# Restart containers with standardized environment variables

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

# Stop any running containers
print_status "Stopping existing containers..."
docker compose down

# Use the standardized docker-compose.yml
print_status "Using standardized docker-compose.yml..."

# Export standardized environment variables
print_status "Setting standardized environment variables..."

# Service identification
export SERVICE_ENV=development
export SERVICE_VERSION=1.0.0

# Frontend configuration
export SERVICE_FRONTEND_PORT=3456
export SERVICE_API_URL=http://tap-backend:8000
export SERVICE_DEV_MODE=true
export SERVICE_HOT_RELOAD=true
export SERVICE_HOT_RELOAD_HOST=localhost
export SERVICE_HOT_RELOAD_PORT=3456
export SERVICE_HEALTH_CHECK_INTERVAL=60000
export SERVICE_ERROR_REPORTING=true
export SERVICE_ERROR_LEVEL=debug
export SERVICE_MAX_ERRORS=100

# Backend configuration
export SERVICE_BACKEND_PORT=8000
export SERVICE_CORS_ORIGINS='["http://localhost:3456","http://tap-frontend"]'
export SERVICE_DATABASE_URL=sqlite:///data/local_dev.sqlite
export SERVICE_SECRET_KEY=local_development_secret_change_in_production
export SERVICE_LOG_LEVEL=debug
export SERVICE_DEBUG=true
export SERVICE_ENABLE_INVITATIONS=false
export SERVICE_ENABLE_MFA=false
export SERVICE_DB_SSL_REQUIRED=false
export SERVICE_DB_AUTOMIGRATE=true
export SERVICE_DB_AUTOSEED=true
export SERVICE_WORKERS=1

# Remove previous Docker networks to ensure clean restart
print_status "Removing previous Docker networks..."
docker network rm tap-network-dev 2>/dev/null || true

# Build and start the containers
print_status "Building and starting containers with standardized environment..."
docker compose build
docker compose up -d

# Wait for containers to initialize
print_status "Waiting for containers to initialize..."
sleep 10

# Check container status
print_status "Checking container status..."
docker compose ps

# Check logs for errors
print_status "Checking for errors in logs..."
docker compose logs --tail=20

# Run the integration test
print_status "Running integration test..."
./test-service-integration.sh

print_success "Standardized environment restart completed."