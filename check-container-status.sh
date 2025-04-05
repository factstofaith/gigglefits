#!/bin/bash
# Script to check the status of Docker containers

set -e

# Set working directory
cd "$(dirname "$0")"

# Optional environment variables
export FRONTEND_PORT=${FRONTEND_PORT:-3456}
export BACKEND_PORT=${BACKEND_PORT:-8000}

# Display status
echo "==================== TAP Integration Platform ===================="
echo "Checking Docker container status"
echo "==============================================================="

# Check container status
echo "Container status:"
docker ps -a | grep "tap-\|NAME" || echo "No TAP containers found"

# Check if containers are running
frontend_running=$(docker ps -q -f name=tap-frontend-dev)
backend_running=$(docker ps -q -f name=tap-backend-dev)

# Display health check status if containers are running
echo ""
echo "Health check status:"

if [ -n "$frontend_running" ]; then
  echo "- Frontend: $(docker inspect --format '{{.State.Health.Status}}' tap-frontend-dev)"
  echo "  URL: http://localhost:${FRONTEND_PORT}"
  
  # Check if frontend health endpoint is reachable
  echo "  Checking health endpoint..."
  curl -s -o /dev/null -w "  Health endpoint response: %{http_code}\n" http://localhost:${FRONTEND_PORT}/health || echo "  Health endpoint not reachable"
else
  echo "- Frontend: Not running"
fi

if [ -n "$backend_running" ]; then
  echo "- Backend: $(docker inspect --format '{{.State.Health.Status}}' tap-backend-dev)"
  echo "  URL: http://localhost:${BACKEND_PORT}"
  
  # Check if backend health endpoint is reachable
  echo "  Checking health endpoint..."
  curl -s -o /dev/null -w "  Health endpoint response: %{http_code}\n" http://localhost:${BACKEND_PORT}/health || echo "  Health endpoint not reachable"
else
  echo "- Backend: Not running"
fi

# Display resource usage
echo ""
echo "Resource usage:"
docker stats --no-stream $(docker ps -q -f name=tap-) || echo "No TAP containers running"

echo "==============================================================="