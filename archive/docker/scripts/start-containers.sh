#!/bin/bash
# Script to start both frontend and backend containers

set -e

# Set working directory
cd "$(dirname "$0")"

# Optional environment variables
export FRONTEND_PORT=${FRONTEND_PORT:-3456}
export BACKEND_PORT=${BACKEND_PORT:-8000}
export NODE_ENV=${NODE_ENV:-development}

# Display status
echo "==================== TAP Integration Platform ===================="
echo "Starting Docker containers with enhanced error handling"
echo "==============================================================="

# Stop and remove existing containers if they exist
echo "Stopping and removing existing containers..."
docker stop tap-frontend-dev tap-backend-dev 2>/dev/null || true
docker rm tap-frontend-dev tap-backend-dev 2>/dev/null || true

# Remove existing images to ensure a clean build
echo "Removing existing images..."
docker rmi tap-frontend:local tap-backend:local 2>/dev/null || true

# Build the containers
echo "Building containers..."
docker compose -f docker-compose.yml build

# Start the services
echo "Starting services..."
docker compose -f docker-compose.yml up -d

# Display status
echo "==============================================================="
echo "Services started:"
echo "- Frontend: http://localhost:${FRONTEND_PORT}"
echo "- Backend: http://localhost:${BACKEND_PORT}"
echo "==============================================================="
echo "Displaying logs (Ctrl+C to exit logs, containers will keep running)..."
docker compose -f docker-compose.yml logs -f