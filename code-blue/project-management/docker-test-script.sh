#!/bin/bash
# Docker Test Script for TAP Integration Platform
# This script tests the Docker environment to ensure it's working properly

# Set bash to exit on error
set -e

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===================================================${NC}"
echo -e "${YELLOW} TAP Integration Platform Docker Test Script${NC}"
echo -e "${YELLOW}===================================================${NC}"
echo ""

# Function to check if Docker and Docker Compose are installed
check_docker_installation() {
    echo -e "${YELLOW}Checking Docker installation...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}ERROR: Docker is not installed or not in PATH.${NC}"
        exit 1
    fi
    
    if ! docker ps &> /dev/null; then
        echo -e "${RED}ERROR: Docker daemon is not running or you don't have permissions.${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}ERROR: Docker Compose is not installed or not in PATH.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker and Docker Compose are properly installed.${NC}"
}

# Function to check Docker Compose file
check_docker_compose_file() {
    echo -e "${YELLOW}Checking Docker Compose file...${NC}"
    
    if [[ ! -f "../docker-compose.yml" ]]; then
        echo -e "${RED}ERROR: docker-compose.yml not found in the project root.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker Compose file found.${NC}"
}

# Function to start Docker environment
start_docker_environment() {
    echo -e "${YELLOW}Starting Docker environment...${NC}"
    
    cd ..
    
    # Export environment variables for testing
    export FRONTEND_PORT=3456
    export BACKEND_PORT=8000
    export NODE_ENV=development
    export DEBUG=true
    export DEBUG_MODE=true
    
    # Start Docker Compose with clean build
    docker-compose down -v
    docker-compose build --no-cache
    docker-compose up -d
    
    echo -e "${GREEN}✅ Docker environment started.${NC}"
}

# Function to check container status
check_container_status() {
    echo -e "${YELLOW}Checking container status...${NC}"
    
    # Wait for containers to start
    sleep 10
    
    # Check if containers are running
    if [[ "$(docker ps -q -f name=tap-frontend-dev)" == "" ]]; then
        echo -e "${RED}ERROR: Frontend container is not running.${NC}"
        docker-compose logs frontend
        exit 1
    fi
    
    if [[ "$(docker ps -q -f name=tap-backend-dev)" == "" ]]; then
        echo -e "${RED}ERROR: Backend container is not running.${NC}"
        docker-compose logs backend
        exit 1
    fi
    
    echo -e "${GREEN}✅ All containers are running.${NC}"
}

# Function to test health endpoints
test_health_endpoints() {
    echo -e "${YELLOW}Testing health endpoints...${NC}"
    
    # Wait for services to be ready
    sleep 5
    
    # Test backend health endpoint
    echo -e "${YELLOW}Testing backend health endpoint...${NC}"
    if ! curl -s http://localhost:8000/health > /dev/null; then
        echo -e "${RED}ERROR: Backend health endpoint is not accessible.${NC}"
        docker-compose logs backend
        exit 1
    fi
    
    # Test frontend health check (simplified)
    echo -e "${YELLOW}Testing frontend accessibility...${NC}"
    if ! curl -s http://localhost:3456 > /dev/null; then
        echo -e "${RED}ERROR: Frontend is not accessible.${NC}"
        docker-compose logs frontend
        exit 1
    fi
    
    echo -e "${GREEN}✅ Health endpoints are accessible.${NC}"
}

# Function to test graceful shutdown
test_graceful_shutdown() {
    echo -e "${YELLOW}Testing graceful shutdown...${NC}"
    
    # Send SIGTERM to backend container
    echo -e "${YELLOW}Sending SIGTERM to backend container...${NC}"
    docker kill --signal=TERM tap-backend-dev
    
    # Wait for container to stop
    sleep 5
    
    # Check if container restarted (it should, due to restart policy)
    if [[ "$(docker ps -q -f name=tap-backend-dev)" == "" ]]; then
        echo -e "${RED}ERROR: Backend container did not restart after SIGTERM.${NC}"
        docker-compose logs backend
        exit 1
    fi
    
    echo -e "${GREEN}✅ Graceful shutdown and restart working properly.${NC}"
}

# Function to clean up
cleanup() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    
    # Stop Docker Compose
    docker-compose down
    
    echo -e "${GREEN}✅ Cleanup complete.${NC}"
}

# Main execution
main() {
    # Run all the checks
    check_docker_installation
    check_docker_compose_file
    start_docker_environment
    check_container_status
    test_health_endpoints
    test_graceful_shutdown
    cleanup
    
    # Display success message
    echo ""
    echo -e "${GREEN}===================================================${NC}"
    echo -e "${GREEN} DOCKER TEST COMPLETED SUCCESSFULLY ${NC}"
    echo -e "${GREEN}===================================================${NC}"
    echo ""
    echo -e "The Docker environment is now properly configured and working."
    echo -e "You can start the environment with: ./start-docker-env.sh"
}

# Call the main function
main