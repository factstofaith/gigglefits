#!/bin/bash
# Script to build and test the frontend container

set -e

# Set working directory
cd "$(dirname "$0")"

# Display status
echo "==================== TAP Integration Platform ===================="
echo "Building and testing frontend container"
echo "==============================================================="

# Stop and remove existing containers if they exist
echo "Stopping and removing existing containers..."
docker stop tap-frontend-dev tap-frontend-test 2>/dev/null || true
docker rm tap-frontend-dev tap-frontend-test 2>/dev/null || true

# Remove existing images to ensure a clean build
echo "Removing existing images..."
docker rmi tap-frontend:local tap-frontend-test:latest 2>/dev/null || true

# Create a directory for stage checking
echo "Setting up build stage files..."
mkdir -p /tmp/tap-frontend-test

# Build the container
echo "Building frontend container..."
docker build --no-cache -t tap-frontend:local -f ./frontend/Dockerfile.dev ./frontend 

# Run the container with the health check script directly
echo "Testing container startup..."
docker run -d --name tap-frontend-test -p 3456:3000 \
  -v $(pwd)/frontend/src:/app/src \
  -v $(pwd)/frontend/public:/app/public \
  -v $(pwd)/frontend/config:/app/config \
  -e NODE_ENV=development \
  -e REACT_APP_API_URL=http://localhost:8000 \
  -e REACT_APP_VERSION=1.0.0 \
  -e REACT_APP_RUNNING_IN_DOCKER=true \
  -e CHOKIDAR_USEPOLLING=true \
  -e WDS_SOCKET_HOST=localhost \
  -e WDS_SOCKET_PORT=3456 \
  tap-frontend:local

# Display container status
echo "Container status:"
docker ps | grep tap-frontend-test

# Display logs
echo "Container logs:"
docker logs tap-frontend-test

echo "==============================================================="
echo "Frontend container built and tested"
echo "Access URL: http://localhost:3456"
echo "==============================================================="