#!/bin/bash
#
# Docker Environment Validation Script
# 
# This script performs comprehensive validation of the Docker environment
# for the TAP Integration Platform, checking:
#
# 1. Container status
# 2. Health check endpoints
# 3. Network connectivity
# 4. Environment variable injection
# 5. Resource usage
#
# Usage: ./validate-docker-env.sh [--verbose]

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
FRONTEND_PORT=${FRONTEND_PORT:-3456}
BACKEND_PORT=${BACKEND_PORT:-8000}
VERBOSE=0

# Parse arguments
if [[ "$1" == "--verbose" ]]; then
    VERBOSE=1
fi

# Print header
echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}      TAP Integration Platform Docker Validation         ${NC}"
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
check_docker_running() {
    echo -e "${BLUE}Checking Docker status...${NC}"
    
    if ! docker info >/dev/null 2>&1; then
        log_status "Docker is not running" 2
        echo "Please start Docker and try again."
        exit 1
    else
        log_status "Docker is running" 0
    fi
    
    # Check Docker Compose - supporting both modern (plugin) and legacy versions
    # Set the DOCKER_COMPOSE_CMD global variable for later use
    if docker compose version >/dev/null 2>&1; then
        local compose_version=$(docker compose version --short 2>/dev/null || echo "unknown")
        log_status "Docker Compose (modern plugin) version $compose_version is installed" 0
        DOCKER_COMPOSE_CMD="docker compose"
    elif docker-compose --version >/dev/null 2>&1; then
        local compose_version=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
        log_status "Docker Compose (legacy) version $compose_version is installed" 0
        DOCKER_COMPOSE_CMD="docker-compose"
    else
        log_status "Docker Compose is not installed" 2
        echo "Please install Docker Compose and try again."
        exit 1
    fi
    
    echo ""
}

# Check container status
check_container_status() {
    echo -e "${BLUE}Checking container status...${NC}"
    
    # Check frontend container
    if docker ps --format '{{.Names}}' | grep -q "$FRONTEND_CONTAINER"; then
        local status=$(docker inspect --format='{{.State.Status}}' $FRONTEND_CONTAINER)
        local health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' $FRONTEND_CONTAINER)
        
        if [[ "$status" == "running" ]]; then
            if [[ "$health" == "healthy" ]]; then
                log_status "Frontend container ($FRONTEND_CONTAINER) is running and healthy" 0
            elif [[ "$health" == "N/A" ]]; then
                log_status "Frontend container ($FRONTEND_CONTAINER) is running (no health check)" 0
            else
                log_status "Frontend container ($FRONTEND_CONTAINER) is running but $health" 1
            fi
            
            # Log container details
            if [[ $VERBOSE -eq 1 ]]; then
                local started=$(docker inspect --format='{{.State.StartedAt}}' $FRONTEND_CONTAINER)
                log_verbose "Started at: $started"
                log_verbose "Container ID: $(docker inspect --format='{{.Id}}' $FRONTEND_CONTAINER | cut -c1-12)"
                
                # Get mapped ports
                local ports=$(docker inspect --format='{{range $p, $conf := .NetworkSettings.Ports}}{{$p}} -> {{(index $conf 0).HostPort}}{{println}}{{end}}' $FRONTEND_CONTAINER)
                log_verbose "Ports: $ports"
            fi
        else
            log_status "Frontend container ($FRONTEND_CONTAINER) is $status" 2
        fi
    else
        log_status "Frontend container ($FRONTEND_CONTAINER) is not running" 2
    fi
    
    # Check backend container
    if docker ps --format '{{.Names}}' | grep -q "$BACKEND_CONTAINER"; then
        local status=$(docker inspect --format='{{.State.Status}}' $BACKEND_CONTAINER)
        local health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' $BACKEND_CONTAINER)
        
        if [[ "$status" == "running" ]]; then
            if [[ "$health" == "healthy" ]]; then
                log_status "Backend container ($BACKEND_CONTAINER) is running and healthy" 0
            elif [[ "$health" == "N/A" ]]; then
                log_status "Backend container ($BACKEND_CONTAINER) is running (no health check)" 0
            else
                log_status "Backend container ($BACKEND_CONTAINER) is running but $health" 1
            fi
            
            # Log container details
            if [[ $VERBOSE -eq 1 ]]; then
                local started=$(docker inspect --format='{{.State.StartedAt}}' $BACKEND_CONTAINER)
                log_verbose "Started at: $started"
                log_verbose "Container ID: $(docker inspect --format='{{.Id}}' $BACKEND_CONTAINER | cut -c1-12)"
                
                # Get mapped ports
                local ports=$(docker inspect --format='{{range $p, $conf := .NetworkSettings.Ports}}{{$p}} -> {{(index $conf 0).HostPort}}{{println}}{{end}}' $BACKEND_CONTAINER)
                log_verbose "Ports: $ports"
            fi
        else
            log_status "Backend container ($BACKEND_CONTAINER) is $status" 2
        fi
    else
        log_status "Backend container ($BACKEND_CONTAINER) is not running" 2
    fi
    
    echo ""
}

# Check network connectivity
check_network_connectivity() {
    echo -e "${BLUE}Checking network connectivity...${NC}"
    
    # Check if frontend can reach backend
    if docker ps --format '{{.Names}}' | grep -q "$FRONTEND_CONTAINER"; then
        if docker exec $FRONTEND_CONTAINER curl -s -o /dev/null -w "%{http_code}" backend:8000 >/dev/null 2>&1; then
            log_status "Frontend can reach backend container" 0
        else
            log_status "Frontend cannot reach backend container" 2
        fi
    fi
    
    # Check if backend can reach frontend
    if docker ps --format '{{.Names}}' | grep -q "$BACKEND_CONTAINER"; then
        if docker exec $BACKEND_CONTAINER curl -s -o /dev/null -w "%{http_code}" frontend:3000 >/dev/null 2>&1; then
            log_status "Backend can reach frontend container" 0
        else
            # This is a warning since backend might not need to reach frontend
            log_status "Backend cannot reach frontend container" 1
        fi
    fi
    
    # Check Docker network
    echo -e "${BLUE}Checking Docker network...${NC}"
    
    local network_name=$(docker inspect -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' $BACKEND_CONTAINER 2>/dev/null || echo "unknown")
    
    if [[ "$network_name" != "unknown" ]]; then
        log_status "Containers are on network: $network_name" 0
        
        # Check network details
        if [[ $VERBOSE -eq 1 ]]; then
            local network_id=$(docker network inspect -f '{{.Id}}' $network_name 2>/dev/null || echo "unknown")
            local network_driver=$(docker network inspect -f '{{.Driver}}' $network_name 2>/dev/null || echo "unknown")
            log_verbose "Network ID: $network_id"
            log_verbose "Network driver: $network_driver"
            
            # Count connected containers
            local connected_containers=$(docker network inspect -f '{{range $k, $v := .Containers}}{{$k}}{{println}}{{end}}' $network_name 2>/dev/null | wc -l | tr -d ' ')
            log_verbose "Connected containers: $connected_containers"
        fi
    else
        log_status "Could not determine Docker network" 2
    fi
    
    echo ""
}

# Check health endpoints
check_health_endpoints() {
    echo -e "${BLUE}Checking health endpoints...${NC}"
    
    # Backend health check
    if docker ps --format '{{.Names}}' | grep -q "$BACKEND_CONTAINER"; then
        # Check simple health endpoint
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/health/simple 2>/dev/null || echo "000")
        
        if [[ "$status_code" == "200" ]]; then
            log_status "Backend health endpoint is responding (200 OK)" 0
            
            # Get more detailed health info if verbose
            if [[ $VERBOSE -eq 1 ]]; then
                local health_json=$(curl -s http://localhost:$BACKEND_PORT/health 2>/dev/null)
                log_verbose "Health status: $(echo $health_json | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
                log_verbose "Components: $(echo $health_json | grep -o '"components":\[[^]]*\]' | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | tr '\n' ', ' | sed 's/,$//')"
            fi
        else
            log_status "Backend health endpoint returned $status_code" 2
        fi
    fi
    
    # Frontend health check (might be a static file)
    if docker ps --format '{{.Names}}' | grep -q "$FRONTEND_CONTAINER"; then
        # Check health endpoint
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$FRONTEND_PORT/health-check.html 2>/dev/null || echo "000")
        
        if [[ "$status_code" == "200" ]]; then
            log_status "Frontend health check page is accessible (200 OK)" 0
        else
            # Try alternative health check URLs
            status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$FRONTEND_PORT/docker-health 2>/dev/null || echo "000")
            
            if [[ "$status_code" == "200" ]]; then
                log_status "Frontend Docker health endpoint is accessible (200 OK)" 0
            else
                log_status "Frontend health check is not accessible" 2
            fi
        fi
    fi
    
    echo ""
}

# Check environment variables
check_environment_variables() {
    echo -e "${BLUE}Checking environment variables...${NC}"
    
    # Check frontend environment
    if docker ps --format '{{.Names}}' | grep -q "$FRONTEND_CONTAINER"; then
        local env_count=$(docker exec $FRONTEND_CONTAINER env | wc -l)
        log_status "Frontend container has $env_count environment variables" 0
        
        # Check critical environment variables
        local react_app_api_url=$(docker exec $FRONTEND_CONTAINER sh -c 'echo $REACT_APP_API_URL')
        local react_app_env=$(docker exec $FRONTEND_CONTAINER sh -c 'echo $REACT_APP_ENVIRONMENT')
        local node_env=$(docker exec $FRONTEND_CONTAINER sh -c 'echo $NODE_ENV')
        
        if [[ -n "$react_app_api_url" ]]; then
            log_status "Frontend REACT_APP_API_URL is set to $react_app_api_url" 0
        else
            log_status "Frontend REACT_APP_API_URL is not set" 2
        fi
        
        if [[ -n "$react_app_env" ]]; then
            log_status "Frontend REACT_APP_ENVIRONMENT is set to $react_app_env" 0
        else
            log_status "Frontend REACT_APP_ENVIRONMENT is not set" 1
        fi
        
        if [[ -n "$node_env" ]]; then
            log_status "Frontend NODE_ENV is set to $node_env" 0
        else
            log_status "Frontend NODE_ENV is not set" 2
        fi
        
        # Check Docker-specific variables
        local running_in_docker=$(docker exec $FRONTEND_CONTAINER sh -c 'echo $REACT_APP_RUNNING_IN_DOCKER')
        
        if [[ "$running_in_docker" == "true" ]]; then
            log_status "Frontend REACT_APP_RUNNING_IN_DOCKER is correctly set to 'true'" 0
        else
            log_status "Frontend REACT_APP_RUNNING_IN_DOCKER is not correctly set" 2
        fi
    fi
    
    # Check backend environment
    if docker ps --format '{{.Names}}' | grep -q "$BACKEND_CONTAINER"; then
        local env_count=$(docker exec $BACKEND_CONTAINER env | wc -l)
        log_status "Backend container has $env_count environment variables" 0
        
        # Check critical environment variables
        local environment=$(docker exec $BACKEND_CONTAINER sh -c 'echo $ENVIRONMENT')
        local app_environment=$(docker exec $BACKEND_CONTAINER sh -c 'echo $APP_ENVIRONMENT')
        local database_url=$(docker exec $BACKEND_CONTAINER sh -c 'echo $DATABASE_URL')
        
        if [[ -n "$environment" ]]; then
            log_status "Backend ENVIRONMENT is set to $environment" 0
        else
            log_status "Backend ENVIRONMENT is not set" 2
        fi
        
        if [[ -n "$app_environment" ]]; then
            log_status "Backend APP_ENVIRONMENT is set to $app_environment" 0
        else
            log_status "Backend APP_ENVIRONMENT is not set" 1
        fi
        
        if [[ -n "$database_url" ]]; then
            log_status "Backend DATABASE_URL is set" 0
            log_verbose "Database URL: $database_url"
        else
            log_status "Backend DATABASE_URL is not set" 2
        fi
        
        # Check Docker-specific variables
        local running_in_docker=$(docker exec $BACKEND_CONTAINER sh -c 'echo $RUNNING_IN_DOCKER')
        
        if [[ "$running_in_docker" == "true" ]]; then
            log_status "Backend RUNNING_IN_DOCKER is correctly set to 'true'" 0
        else
            log_status "Backend RUNNING_IN_DOCKER is not correctly set" 2
        fi
    fi
    
    echo ""
}

# Check resource usage
check_resource_usage() {
    echo -e "${BLUE}Checking resource usage...${NC}"
    
    # Check frontend container resources
    if docker ps --format '{{.Names}}' | grep -q "$FRONTEND_CONTAINER"; then
        local cpu=$(docker stats --no-stream --format "{{.CPUPerc}}" $FRONTEND_CONTAINER)
        local memory=$(docker stats --no-stream --format "{{.MemUsage}}" $FRONTEND_CONTAINER)
        local memory_percent=$(docker stats --no-stream --format "{{.MemPerc}}" $FRONTEND_CONTAINER)
        
        log_status "Frontend container using $cpu CPU, $memory memory ($memory_percent)" 0
    fi
    
    # Check backend container resources
    if docker ps --format '{{.Names}}' | grep -q "$BACKEND_CONTAINER"; then
        local cpu=$(docker stats --no-stream --format "{{.CPUPerc}}" $BACKEND_CONTAINER)
        local memory=$(docker stats --no-stream --format "{{.MemUsage}}" $BACKEND_CONTAINER)
        local memory_percent=$(docker stats --no-stream --format "{{.MemPerc}}" $BACKEND_CONTAINER)
        
        log_status "Backend container using $cpu CPU, $memory memory ($memory_percent)" 0
    fi
    
    # Check overall Docker resources
    local total_containers=$(docker ps -q | wc -l | tr -d ' ')
    log_status "Total running containers: $total_containers" 0
    
    echo ""
}

# Check volumes
check_volumes() {
    echo -e "${BLUE}Checking Docker volumes...${NC}"
    
    # Get volume list
    local volumes=$(docker volume ls --filter name=tap --format "{{.Name}}")
    local volume_count=$(echo "$volumes" | wc -l | tr -d ' ')
    
    if [[ $volume_count -gt 0 ]]; then
        log_status "Found $volume_count TAP-related volumes" 0
        
        # Check if expected volumes exist
        if echo "$volumes" | grep -q "tap-frontend-node-modules"; then
            log_status "Frontend node_modules volume exists" 0
        else
            log_status "Frontend node_modules volume is missing" 2
        fi
        
        if echo "$volumes" | grep -q "tap-backend-data"; then
            log_status "Backend data volume exists" 0
        else
            log_status "Backend data volume is missing" 2
        fi
        
        if echo "$volumes" | grep -q "tap-backend-venv"; then
            log_status "Backend venv volume exists" 0
        else
            log_status "Backend venv volume is missing" 2
        fi
        
        # Report volume sizes if verbose
        if [[ $VERBOSE -eq 1 ]]; then
            for volume in $volumes; do
                log_verbose "Volume: $volume"
            done
        fi
    else
        log_status "No TAP-related volumes found" 2
    fi
    
    echo ""
}

# Check application accessibility
check_application_accessibility() {
    echo -e "${BLUE}Checking application accessibility...${NC}"
    
    # Check frontend
    local frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$FRONTEND_PORT/ 2>/dev/null || echo "000")
    
    if [[ "$frontend_status" == "200" ]]; then
        log_status "Frontend is accessible at http://localhost:$FRONTEND_PORT/ (200 OK)" 0
    else
        log_status "Frontend is not accessible (HTTP $frontend_status)" 2
    fi
    
    # Check backend
    local backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/ 2>/dev/null || echo "000")
    
    if [[ "$backend_status" == "200" ]]; then
        log_status "Backend is accessible at http://localhost:$BACKEND_PORT/ (200 OK)" 0
        
        # If API is up, check if it returns JSON
        local content_type=$(curl -s -I -X GET http://localhost:$BACKEND_PORT/ 2>/dev/null | grep 'Content-Type' | cut -d' ' -f2 | tr -d '\r')
        
        if [[ "$content_type" == *"application/json"* ]]; then
            log_status "Backend API returning proper JSON content-type" 0
        else
            log_status "Backend API not returning JSON content-type: $content_type" 1
        fi
    else
        log_status "Backend is not accessible (HTTP $backend_status)" 2
    fi
    
    echo ""
}

# Run all checks
run_all_checks() {
    check_docker_running
    check_container_status
    check_network_connectivity
    check_health_endpoints
    check_environment_variables
    check_resource_usage
    check_volumes
    check_application_accessibility
}

# Display summary
display_summary() {
    echo -e "${BLUE}=========================================================${NC}"
    echo -e "${BLUE}                  Validation Summary                     ${NC}"
    echo -e "${BLUE}=========================================================${NC}"
    echo ""
    echo -e "${BLUE}Frontend:${NC} http://localhost:$FRONTEND_PORT/"
    echo -e "${BLUE}Backend:${NC} http://localhost:$BACKEND_PORT/"
    echo ""
    
    # Check if main containers are running
    local frontend_running=false
    local backend_running=false
    
    if docker ps --format '{{.Names}}' | grep -q "$FRONTEND_CONTAINER"; then
        local frontend_status=$(docker inspect --format='{{.State.Status}}' $FRONTEND_CONTAINER)
        if [[ "$frontend_status" == "running" ]]; then
            frontend_running=true
        fi
    fi
    
    if docker ps --format '{{.Names}}' | grep -q "$BACKEND_CONTAINER"; then
        local backend_status=$(docker inspect --format='{{.State.Status}}' $BACKEND_CONTAINER)
        if [[ "$backend_status" == "running" ]]; then
            backend_running=true
        fi
    fi
    
    if [[ "$frontend_running" == "true" && "$backend_running" == "true" ]]; then
        echo -e "${GREEN}The TAP Integration Platform is running.${NC}"
        echo -e "You can access the application at http://localhost:$FRONTEND_PORT/"
    elif [[ "$frontend_running" == "true" ]]; then
        echo -e "${YELLOW}The frontend is running, but the backend is not available.${NC}"
        echo -e "You can access the frontend at http://localhost:$FRONTEND_PORT/ but functionality may be limited."
    elif [[ "$backend_running" == "true" ]]; then
        echo -e "${YELLOW}The backend is running, but the frontend is not available.${NC}"
        echo -e "The API is accessible at http://localhost:$BACKEND_PORT/"
    else
        echo -e "${RED}The TAP Integration Platform is not running.${NC}"
        echo -e "Please start the application using docker compose up"
    fi
    
    echo ""
    echo -e "${BLUE}Use the following command to start the application:${NC}"
    echo "${DOCKER_COMPOSE_CMD:-docker compose} -f docker-compose.master.yml up -d"
    echo ""
}

# Main function
main() {
    run_all_checks
    display_summary
}

# Run main function
main