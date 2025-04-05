#!/bin/bash
# Script to test the frontend container in isolation

# Stop any existing containers
echo "Stopping existing containers..."
docker stop tap-frontend-dev 2>/dev/null || true
docker rm tap-frontend-dev 2>/dev/null || true

# Remove images to ensure a clean build
echo "Removing existing images..."
docker rmi tap-frontend:local 2>/dev/null || true

# Start just the frontend
echo "Starting frontend container..."
docker compose -f frontend-docker-compose.yml up --build