#!/bin/bash

# Check Docker status for TAP Integration Platform
# This script provides a quick overview of the running containers and their health

echo "=============================================="
echo "TAP Integration Platform Docker Status Checker"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running or you don't have permission to access it."
  echo "Try: sudo systemctl start docker"
  echo "Or: sudo usermod -aG docker $(whoami) && newgrp docker"
  exit 1
fi

# Function to print status with color
print_status() {
  if [ "$2" == "running" ] || [ "$2" == "healthy" ]; then
    echo -e "\033[0;32m$1:\033[0m $2"
  elif [ "$2" == "starting" ] || [ "$2" == "unhealthy" ]; then
    echo -e "\033[0;33m$1:\033[0m $2"
  else
    echo -e "\033[0;31m$1:\033[0m $2"
  fi
}

# Check container status
echo "Container Status:"
if docker ps -a | grep -q "tap-frontend"; then
  frontend_status=$(docker inspect --format='{{.State.Status}}' tap-frontend-dev 2>/dev/null || echo "not found")
  frontend_health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' tap-frontend-dev 2>/dev/null || echo "N/A")
  print_status "Frontend" "$frontend_status"
  print_status "Frontend Health" "$frontend_health"
else
  print_status "Frontend" "not running"
fi

if docker ps -a | grep -q "tap-backend"; then
  backend_status=$(docker inspect --format='{{.State.Status}}' tap-backend-dev 2>/dev/null || echo "not found")
  backend_health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' tap-backend-dev 2>/dev/null || echo "N/A") 
  print_status "Backend" "$backend_status"
  print_status "Backend Health" "$backend_health"
else
  print_status "Backend" "not running"
fi

# Check network status
echo -e "\nNetwork Status:"
if docker network ls | grep -q "tap-network"; then
  network_status="created"
  print_status "tap-network" "$network_status"
else
  print_status "tap-network" "not created"
fi

# Check volumes status
echo -e "\nVolume Status:"
if docker volume ls | grep -q "tap-frontend-node-modules"; then
  print_status "frontend_node_modules" "created"
else
  print_status "frontend_node_modules" "not created"
fi

if docker volume ls | grep -q "tap-backend-venv"; then
  print_status "backend_venv" "created"
else
  print_status "backend_venv" "not created"
fi

if docker volume ls | grep -q "tap-backend-data"; then
  print_status "backend_data" "created"
else
  print_status "backend_data" "not created"
fi

# Check service availability
echo -e "\nService Availability:"
if curl -s http://localhost:3456 > /dev/null; then
  print_status "Frontend Web UI" "available at http://localhost:3456"
else
  print_status "Frontend Web UI" "not available"
fi

if curl -s http://localhost:8000/health > /dev/null; then
  print_status "Backend API" "available at http://localhost:8000"
  print_status "API Documentation" "available at http://localhost:8000/api/docs"
else
  print_status "Backend API" "not available"
fi

echo -e "\nTo launch the environment: ./launch-local-dev.sh"
echo "To stop the environment: docker compose down"