#!/bin/bash
# Script to restart frontend container with debugging

set -e

# Set working directory
cd "$(dirname "$0")"

# Optional environment variables
export FRONTEND_PORT=${FRONTEND_PORT:-3456}
export NODE_ENV=${NODE_ENV:-development}

# Display status
echo "==================== TAP Integration Platform ===================="
echo "Restarting frontend Docker container with enhanced error handling"
echo "==============================================================="

# Stop and remove existing containers if they exist
echo "Stopping and removing existing containers..."
docker stop tap-frontend-dev 2>/dev/null || true
docker rm tap-frontend-dev 2>/dev/null || true

# Remove existing images to ensure a clean build
echo "Removing existing images..."
docker rmi tap-frontend:local 2>/dev/null || true

# Build the containers
echo "Building new frontend container..."
docker-compose -f docker-compose.yml build frontend

# Start only the frontend service
echo "Starting frontend service with verbose logs..."
docker-compose -f docker-compose.yml up -d backend
docker-compose -f docker-compose.yml up frontend

echo "==============================================================="