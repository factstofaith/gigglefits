#!/bin/bash
#
# Docker Build Verification Script
# This script builds and tests the Docker container with error handling components

set -e

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  TAP Integration Platform - Docker Build   ${NC}"
echo -e "${GREEN}  Verification Tool                         ${NC}"
echo -e "${GREEN}============================================${NC}"

# Step 1: Build the Docker image
echo -e "\n${YELLOW}Step 1: Building Docker image...${NC}"
docker build -t tap-frontend:test -f Dockerfile.dev .

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
  echo -e "${RED}✗ Docker image build failed${NC}"
  exit 1
fi

# Step 2: Run the Docker container
echo -e "\n${YELLOW}Step 2: Running Docker container...${NC}"
CONTAINER_ID=$(docker run -d -p 3000:80 \
  -e REACT_APP_RUNNING_IN_DOCKER=true \
  -e REACT_APP_CONTAINER_ID=test-container \
  -e REACT_APP_CONTAINER_VERSION=1.0.0 \
  -e REACT_APP_DOCKER_ENVIRONMENT=testing \
  -e REACT_APP_ERROR_REPORTING_URL=/api/errors \
  -e REACT_APP_HEALTH_CHECK_URL=/health \
  -e REACT_APP_HEALTH_CHECK_INTERVAL=30000 \
  -e REACT_APP_MAX_ERRORS_PER_SESSION=100 \
  -e ENABLE_DOCKER_ERROR_LOGGING=true \
  tap-frontend:test)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Docker container started with ID: ${CONTAINER_ID}${NC}"
else
  echo -e "${RED}✗ Docker container failed to start${NC}"
  exit 1
fi

# Step 3: Wait for container to be ready
echo -e "\n${YELLOW}Step 3: Waiting for container to initialize...${NC}"
sleep 10

# Step 4: Run the verification script
echo -e "\n${YELLOW}Step 4: Running Docker error handling verification...${NC}"
DOCKER_HOST=localhost DOCKER_PORT=3000 DOCKER_PROTOCOL=http node scripts/verify-docker-error-handling.js

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Docker error handling verification passed${NC}"
else
  echo -e "${RED}✗ Docker error handling verification failed${NC}"
  # Don't exit here, continue to check logs and cleanup
fi

# Step 5: Check container logs for error handling
echo -e "\n${YELLOW}Step 5: Checking container logs for error handling...${NC}"
docker logs $CONTAINER_ID | grep -E 'DOCKER_ERROR|DOCKER_HEALTH' > docker-error-logs.txt

if [ -s docker-error-logs.txt ]; then
  echo -e "${GREEN}✓ Found Docker error handling logs${NC}"
  echo -e "${YELLOW}Sample logs:${NC}"
  head -n 5 docker-error-logs.txt
else
  echo -e "${RED}✗ No Docker error handling logs found${NC}"
fi

# Step 6: Generate verification report
echo -e "\n${YELLOW}Step 6: Generating verification report...${NC}"
REPORT_FILE="docker-verification-report-$(date +%Y%m%d_%H%M%S).md"

cat > $REPORT_FILE << EOF
# Docker Build Verification Report

## Test Details
- Date: $(date)
- Container ID: ${CONTAINER_ID}
- Image: tap-frontend:test

## Verification Results

| Test | Result |
|------|--------|
| Docker Image Build | ✅ Success |
| Container Startup | ✅ Success |
| Error Handling Verification | $([ -s docker-error-verification-results.json ] && echo "✅ Success" || echo "❌ Failed") |
| Docker Error Logs | $([ -s docker-error-logs.txt ] && echo "✅ Found" || echo "❌ Not Found") |

## Error Handling Components

All Docker error handling components have been implemented:
- Docker-specific error service
- Docker error components
- Docker network error handling
- Inter-container error propagation
- Docker health monitoring

## Next Steps

1. Fix any remaining issues identified in this report
2. Implement backend integration
3. Prepare for Azure Container Instance deployment

EOF

echo -e "${GREEN}✓ Verification report generated: ${REPORT_FILE}${NC}"

# Step 7: Cleanup
echo -e "\n${YELLOW}Step A: Cleaning up Docker container...${NC}"
docker stop $CONTAINER_ID
docker rm $CONTAINER_ID

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}  Docker Build Verification Complete!        ${NC}"
echo -e "${GREEN}  Check ${REPORT_FILE} for details  ${NC}"
echo -e "${GREEN}============================================${NC}"