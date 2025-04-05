#!/bin/bash

# Docker Environment Startup Script for TAP Integration Platform
# This script starts both frontend and backend services in Docker

# Set environment variables
export FRONTEND_PORT=3456
export BACKEND_PORT=8000
export NODE_ENV=development
export REACT_APP_API_URL=http://localhost:8000
export REACT_APP_VERSION=1.0.0
export REACT_APP_RUNNING_IN_DOCKER=true
export REACT_APP_DOCKER_ENVIRONMENT=development
export REACT_APP_ERROR_LOGGING_ENABLED=true
export REACT_APP_ERROR_LOG_LEVEL=debug

# Print banner
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║             TAP INTEGRATION PLATFORM DOCKER                ║"
echo "║                    ENVIRONMENT STARTUP                     ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Starting Docker environment with the following configuration:"
echo "- Frontend: http://localhost:$FRONTEND_PORT"
echo "- Backend: http://localhost:$BACKEND_PORT"
echo "- Environment: $NODE_ENV"
echo "- Docker Error Handling: Enabled"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Build and start the containers
echo "Building and starting containers..."
docker compose up --build -d

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Docker environment started successfully!"
  echo ""
  echo "You can access the application at:"
  echo "- Frontend: http://localhost:$FRONTEND_PORT"
  echo "- Backend API: http://localhost:$BACKEND_PORT"
  echo ""
  echo "To verify Docker error handling, run:"
  echo "node frontend/scripts/verify-docker-error-handling.js"
  echo ""
  echo "To view container logs:"
  echo "docker compose logs -f frontend"
  echo ""
  echo "To stop the environment:"
  echo "docker compose down"
else
  echo ""
  echo "❌ Failed to start Docker environment"
  echo ""
  echo "For detailed error information, run:"
  echo "docker-compose logs"
fi