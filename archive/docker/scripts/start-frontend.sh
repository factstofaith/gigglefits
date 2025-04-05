#!/bin/bash
# Script to start only the frontend container

set -e

# Set working directory
cd "$(dirname "$0")"

# Optional environment variables
export FRONTEND_PORT=${FRONTEND_PORT:-3456}
export NODE_ENV=${NODE_ENV:-development}

# Display status
echo "==================== TAP Integration Platform ===================="
echo "Starting Frontend Docker container"
echo "==============================================================="

# Stop and remove existing containers if they exist
echo "Stopping and removing existing frontend container..."
docker stop tap-frontend-dev 2>/dev/null || true
docker rm tap-frontend-dev 2>/dev/null || true

# Remove existing images to ensure a clean build
echo "Removing existing frontend image..."
docker rmi tap-frontend:local 2>/dev/null || true

# Build the container
echo "Building frontend container..."
docker compose -f frontend-docker-compose.yml build

# Start the service
echo "Starting frontend service..."
docker compose -f frontend-docker-compose.yml up -d

# Display status
echo "==============================================================="
echo "Frontend service started: http://localhost:${FRONTEND_PORT}"
echo "==============================================================="
echo "Displaying logs (Ctrl+C to exit logs, container will keep running)..."
docker compose -f frontend-docker-compose.yml logs -f