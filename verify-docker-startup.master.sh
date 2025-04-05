#!/bin/bash
#
# Docker Startup Verification Script
#
# This script verifies the proper startup sequence and initialization
# of the TAP Integration Platform Docker environment, checking:
#
# 1. Environment detection and configuration
# 2. Database initialization
# 3. Startup sequence timing
# 4. Logging system initialization
# 5. Container readiness
#
# Usage: ./verify-docker-startup.sh [--verbose]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_CONTAINER="tap-frontend-dev"
BACKEND_CONTAINER="tap-backend-dev"
VERBOSE=0
STARTUP_TIMEOUT=120  # seconds

# Parse arguments
if [[ "$1" == "--verbose" ]]; then
    VERBOSE=1
fi

# Print header
echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}    TAP Integration Platform Startup Verification        ${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo ""
echo -e "${BLUE}Date: $(date)${NC}"
echo ""

# Log message with status
# $1: Message
# $2: Status (0=success, 1=warning, 2=error)
log_status() {
    local message="$1"
    local status=$2
    
    case $status in
        0) echo -e "[${GREEN}PASS${NC}] $message" ;;
        1) echo -e "[${YELLOW}WARN${NC}] $message" ;;
        2) echo -e "[${RED}FAIL${NC}] $message" ;;
        *) echo -e "[ ?? ] $message" ;;
    esac
}

# Log verbose output if enabled
# $1: Message to log
log_verbose() {
    if [[ $VERBOSE -eq 1 ]]; then
        echo -e "       ${BLUE}→${NC} $1"
    fi
}

# Check if Docker is running
verify_docker_running() {
    echo -e "${BLUE}Verifying Docker is running...${NC}"
    
    if ! docker info >/dev/null 2>&1; then
        log_status "Docker is not running" 2
        echo "Please start Docker and try again."
        exit 1
    else
        log_status "Docker is running" 0
    fi
    
    echo ""
}

# Reset Docker environment
reset_docker_environment() {
    echo -e "${BLUE}Resetting Docker environment...${NC}"
    
    # Stop running containers
    if docker ps -q --filter "name=tap-" | grep -q .; then
        docker stop $(docker ps -q --filter "name=tap-") >/dev/null
        log_status "Stopped existing containers" 0
    else
        log_status "No running containers to stop" 0
    fi
    
    # Remove stopped containers
    if docker ps -a -q --filter "name=tap-" | grep -q .; then
        docker rm $(docker ps -a -q --filter "name=tap-") >/dev/null
        log_status "Removed existing containers" 0
    else
        log_status "No containers to remove" 0
    fi
    
    echo ""
}

# Start Docker environment
start_docker_environment() {
    echo -e "${BLUE}Starting Docker environment...${NC}"
    
    # Start containers using docker compose
    docker compose up -d
    
    if [ $? -eq 0 ]; then
        log_status "Docker Compose started successfully" 0
    else
        log_status "Docker Compose failed to start" 2
        exit 1
    fi
    
    echo ""
}

# Monitor startup logs
monitor_startup_logs() {
    echo -e "${BLUE}Monitoring startup logs...${NC}"
    
    # Get container IDs
    local backend_id=$(docker ps -q --filter "name=$BACKEND_CONTAINER")
    local frontend_id=$(docker ps -q --filter "name=$FRONTEND_CONTAINER")
    
    if [[ -z "$backend_id" || -z "$frontend_id" ]]; then
        log_status "Containers not found" 2
        return
    fi
    
    # Start monitoring logs in background
    docker logs -f $backend_id > /tmp/backend_logs.txt 2>&1 &
    local backend_logs_pid=$!
    
    docker logs -f $frontend_id > /tmp/frontend_logs.txt 2>&1 &
    local frontend_logs_pid=$!
    
    log_status "Started log monitoring" 0
    
    # Wait for health checks to pass or timeout
    echo -e "${BLUE}Waiting for containers to become healthy (timeout: ${STARTUP_TIMEOUT}s)...${NC}"
    
    local start_time=$(date +%s)
    local current_time=$start_time
    local backend_healthy=false
    local frontend_healthy=false
    
    while [[ $((current_time - start_time)) -lt $STARTUP_TIMEOUT ]]; do
        # Check backend health
        if [[ "$backend_healthy" == "false" ]]; then
            local backend_health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' $backend_id)
            if [[ "$backend_health" == "healthy" ]]; then
                backend_healthy=true
                local backend_time=$(($(date +%s) - start_time))
                log_status "Backend container became healthy after ${backend_time}s" 0
            fi
        fi
        
        # Check frontend health
        if [[ "$frontend_healthy" == "false" ]]; then
            local frontend_health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' $frontend_id)
            if [[ "$frontend_health" == "healthy" ]]; then
                frontend_healthy=true
                local frontend_time=$(($(date +%s) - start_time))
                log_status "Frontend container became healthy after ${frontend_time}s" 0
            fi
        fi
        
        # Break if both are healthy
        if [[ "$backend_healthy" == "true" && "$frontend_healthy" == "true" ]]; then
            break
        fi
        
        # Wait a bit before checking again
        sleep 2
        current_time=$(date +%s)
    done
    
    # Check final health status
    if [[ "$backend_healthy" == "false" ]]; then
        log_status "Backend container did not become healthy within ${STARTUP_TIMEOUT}s" 2
    fi
    
    if [[ "$frontend_healthy" == "false" ]]; then
        log_status "Frontend container did not become healthy within ${STARTUP_TIMEOUT}s" 2
    fi
    
    # Stop log monitoring
    kill $backend_logs_pid $frontend_logs_pid >/dev/null 2>&1 || true
    
    echo ""
}

# Verify environment detection
verify_environment_detection() {
    echo -e "${BLUE}Verifying environment detection...${NC}"
    
    # Backend environment detection
    local backend_id=$(docker ps -q --filter "name=$BACKEND_CONTAINER")
    if [[ -n "$backend_id" ]]; then
        # Check if Docker environment is detected
        if grep -q "Running in Docker container" /tmp/backend_logs.txt; then
            log_status "Backend correctly detected Docker environment" 0
            
            # Extract environment information if verbose
            if [[ $VERBOSE -eq 1 ]]; then
                local detected_env=$(grep "Environment:" /tmp/backend_logs.txt | head -1)
                log_verbose "Detected environment: $detected_env"
            fi
        else
            log_status "Backend did not detect Docker environment" 2
        fi
        
        # Check for configuration loading
        if grep -q "Initialized database connection pool" /tmp/backend_logs.txt; then
            log_status "Backend successfully initialized database connection" 0
        else
            log_status "Backend may not have initialized database connection" 2
        fi
    else
        log_status "Backend container not found" 2
    fi
    
    # Frontend environment detection
    local frontend_id=$(docker ps -q --filter "name=$FRONTEND_CONTAINER")
    if [[ -n "$frontend_id" ]]; then
        # Check if Docker environment is detected
        if grep -q "REACT_APP_RUNNING_IN_DOCKER=true" /tmp/frontend_logs.txt; then
            log_status "Frontend correctly configured with Docker environment" 0
        else
            # Check for alternative Docker detection
            if grep -q "Running in Docker" /tmp/frontend_logs.txt; then
                log_status "Frontend detected Docker environment" 0
            else
                log_status "Frontend may not have detected Docker environment" 2
            fi
        fi
        
        # Check for WebSocket configuration
        if grep -q "WebSocket server is listening" /tmp/frontend_logs.txt; then
            log_status "Frontend WebSocket server configured correctly" 0
        fi
    else
        log_status "Frontend container not found" 2
    fi
    
    echo ""
}

# Verify database initialization
verify_database_initialization() {
    echo -e "${BLUE}Verifying database initialization...${NC}"
    
    # Backend database initialization
    if grep -q "Database connection successful" /tmp/backend_logs.txt; then
        log_status "Database connection successful" 0
    else
        log_status "No confirmation of database connection" 2
    fi
    
    # Check for migrations
    if grep -q "Running migrations" /tmp/backend_logs.txt || grep -q "Applying migration" /tmp/backend_logs.txt; then
        log_status "Database migrations executed" 0
    else
        log_status "No database migrations detected" 1
        log_verbose "Migrations might not be needed or are handled separately"
    fi
    
    # Check for connection pool
    if grep -q "connection pool" /tmp/backend_logs.txt; then
        log_status "Database connection pool initialized" 0
        
        # Extract pool configuration if verbose
        if [[ $VERBOSE -eq 1 ]]; then
            local pool_config=$(grep "connection pool" /tmp/backend_logs.txt | head -1)
            log_verbose "Pool configuration: $pool_config"
        fi
    else
        log_status "No connection pool information found" 1
    fi
    
    echo ""
}

# Verify logging system initialization
verify_logging_system() {
    echo -e "${BLUE}Verifying logging system initialization...${NC}"
    
    # Backend structured logging
    if grep -q "Logging configured" /tmp/backend_logs.txt; then
        log_status "Backend logging system configured" 0
        
        # Check for JSON formatting
        if grep -q "json=True" /tmp/backend_logs.txt || grep -q "json formatter" /tmp/backend_logs.txt; then
            log_status "Backend configured with JSON logging" 0
        else
            log_status "Backend not using JSON logging" 1
            log_verbose "JSON logging might not be enabled in this environment"
        fi
    else
        log_status "No confirmation of backend logging configuration" 1
    fi
    
    # Frontend logging
    if grep -q "log level" /tmp/frontend_logs.txt; then
        log_status "Frontend logging initialized" 0
    else
        log_status "No confirmation of frontend logging initialization" 1
    fi
    
    echo ""
}

# Verify container readiness
verify_container_readiness() {
    echo -e "${BLUE}Verifying container readiness...${NC}"
    
    # Check backend readiness API
    local backend_ready=$(curl -s http://localhost:8000/health/simple 2>/dev/null)
    if [[ -n "$backend_ready" && "$backend_ready" == *"status"*"ok"* ]]; then
        log_status "Backend API is ready" 0
    else
        log_status "Backend API is not ready" 2
    fi
    
    # Check frontend readiness
    local frontend_ready=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3456/ 2>/dev/null)
    if [[ "$frontend_ready" == "200" ]]; then
        log_status "Frontend is ready" 0
    else
        log_status "Frontend is not ready (HTTP $frontend_ready)" 2
    fi
    
    # Check backend components status
    local health_check=$(curl -s http://localhost:8000/health 2>/dev/null)
    if [[ -n "$health_check" && "$health_check" == *"components"* ]]; then
        log_status "Backend health check reporting component status" 0
        
        # Extract component status if verbose
        if [[ $VERBOSE -eq 1 && -n "$health_check" ]]; then
            local component_status=$(echo "$health_check" | grep -o '"components":\[[^]]*\]')
            log_verbose "Component status: $component_status"
        fi
    else
        log_status "Backend health check not reporting detailed component status" 1
    fi
    
    echo ""
}

# Main function
main() {
    verify_docker_running
    reset_docker_environment
    start_docker_environment
    monitor_startup_logs
    verify_environment_detection
    verify_database_initialization
    verify_logging_system
    verify_container_readiness
    
    echo -e "${BLUE}=========================================================${NC}"
    echo -e "${BLUE}                 Verification Summary                    ${NC}"
    echo -e "${BLUE}=========================================================${NC}"
    echo ""
    
    # Check overall container status
    local backend_id=$(docker ps -q --filter "name=$BACKEND_CONTAINER")
    local frontend_id=$(docker ps -q --filter "name=$FRONTEND_CONTAINER")
    
    if [[ -n "$backend_id" && -n "$frontend_id" ]]; then
        local backend_health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' $backend_id)
        local frontend_health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' $frontend_id)
        
        if [[ "$backend_health" == "healthy" && "$frontend_health" == "healthy" ]]; then
            echo -e "${GREEN}Docker environment is running correctly with healthy containers.${NC}"
            echo -e "You can access the application at http://localhost:3456/"
        elif [[ "$backend_health" == "healthy" ]]; then
            echo -e "${YELLOW}Backend is healthy, but frontend health check is ${frontend_health}.${NC}"
            echo -e "Check frontend logs for more details."
        elif [[ "$frontend_health" == "healthy" ]]; then
            echo -e "${YELLOW}Frontend is healthy, but backend health check is ${backend_health}.${NC}"
            echo -e "Check backend logs for more details."
        else
            echo -e "${RED}Container health checks are not passing:${NC}"
            echo -e "Backend: $backend_health"
            echo -e "Frontend: $frontend_health"
            echo -e "Check container logs for more details."
        fi
    else
        echo -e "${RED}One or more containers are not running.${NC}"
        echo -e "Please check Docker logs for errors."
    fi
    
    echo ""
    echo -e "${BLUE}To check detailed logs:${NC}"
    echo "cat /tmp/backend_logs.txt"
    echo "cat /tmp/frontend_logs.txt"
    echo ""
}

main