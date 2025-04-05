#!/bin/bash
# Debug script for frontend Docker container

set -e

echo "Building test container for frontend debugging..."
docker build -f ./frontend/Dockerfile.dev -t tap-frontend-test:local ./frontend

echo "Running test container with mounted volumes..."
docker run --rm -it \
  -v $(pwd)/frontend:/app-src \
  -e NODE_ENV=development \
  -e REACT_APP_API_URL=http://localhost:8000 \
  -e REACT_APP_VERSION=1.0.0 \
  -e REACT_APP_RUNNING_IN_DOCKER=true \
  -e REACT_APP_CONTAINER_ID=tap-frontend-test \
  tap-frontend-test:local \
  sh -c "
    echo 'Files in /app:' && 
    ls -la /app && 
    echo 'Files in /app/docker:' && 
    ls -la /app/docker || echo 'Docker dir not found' && 
    echo 'Files in /app-src:' && 
    ls -la /app-src && 
    echo 'Checking if inject-env.sh exists and is executable:' &&
    find /app -name 'inject-env.sh' -type f -exec sh -c 'echo \"Found: {}\"; ls -la {}; file {}' \; || echo 'inject-env.sh not found'
  "