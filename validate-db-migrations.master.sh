#!/bin/bash
#
# validate-db-migrations.master.sh
# 
# Description:
#   This script validates database migrations in the TAP Integration Platform.
#   It tests both legacy migration scripts and Alembic-based migrations
#   to ensure database schema consistency and proper migration execution.
#
# Usage:
#   ./validate-db-migrations.master.sh [options]
#
# Options:
#   --docker       Run tests inside Docker container (recommended)
#   --local        Run tests using local Python environment
#   --legacy-only  Test only legacy migrations
#   --alembic-only Test only Alembic migrations
#   --verbose      Enable verbose output
#   --help         Show this help message
#
# Examples:
#   ./validate-db-migrations.master.sh --docker
#   ./validate-db-migrations.master.sh --local --legacy-only
#   ./validate-db-migrations.master.sh --docker --verbose
#
# Author: Claude AI
# Created: 2025-04-10
# Updated: 2025-04-10

# Exit immediately if a command fails
set -e

# Load common utilities
source $(dirname "$0")/code-blue/utilities/common.sh 2>/dev/null || {
  echo "Error: Could not load common utilities"
  echo "Creating minimal color support..."
  # Define colors
  BLUE='\033[0;34m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  RED='\033[0;31m'
  NC='\033[0m' # No Color
  
  # Define basic log functions
  function log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
  }
  
  function log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
  }
  
  function log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
  }
  
  function log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
  }
}

# Default options
RUN_IN_DOCKER=true
LEGACY_ONLY=false
ALEMBIC_ONLY=false
VERBOSE=false
SHOW_HELP=false
BACKEND_DIR="$(dirname "$0")/backend"

# Display help message
function show_help {
  grep '^#' "$0" | grep -v '#!/bin/bash' | sed 's/^# //' | sed 's/^#//'
  exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --docker)
      RUN_IN_DOCKER=true
      shift
      ;;
    --local)
      RUN_IN_DOCKER=false
      shift
      ;;
    --legacy-only)
      LEGACY_ONLY=true
      shift
      ;;
    --alembic-only)
      ALEMBIC_ONLY=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      SHOW_HELP=true
      shift
      ;;
    *)
      log_error "Unknown option: $1"
      log_error "Use --help to see available options"
      exit 1
      ;;
  esac
done

# Show help if requested
if $SHOW_HELP; then
  show_help
fi

# Configure options for migration validator
VALIDATOR_OPTIONS=""
if $LEGACY_ONLY; then
  VALIDATOR_OPTIONS="$VALIDATOR_OPTIONS --legacy-only"
elif $ALEMBIC_ONLY; then
  VALIDATOR_OPTIONS="$VALIDATOR_OPTIONS --alembic-only"
fi

# Header
log_info "======================================================"
log_info "TAP Integration Platform - Database Migration Validator"
log_info "======================================================"
log_info "Mode: $(if $RUN_IN_DOCKER; then echo "Docker"; else echo "Local"; fi)"
log_info "Options: $(if [ -n "$VALIDATOR_OPTIONS" ]; then echo "$VALIDATOR_OPTIONS"; else echo "All tests"; fi)"
log_info "Started at: $(date)"
log_info "------------------------------------------------------"

# Ensure the backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  log_error "Backend directory not found: $BACKEND_DIR"
  exit 1
fi

# Function to run validation in local environment
function run_local_validation {
  log_info "Running migration validation in local environment..."
  
  # Ensure Python 3 is available
  if ! command -v python3 &>/dev/null; then
    log_error "Python 3 is required but not found"
    log_error "Please install Python 3 and try again"
    exit 1
  fi
  
  # Check for virtual environment
  if [ -d "$BACKEND_DIR/venv" ]; then
    log_info "Using existing virtual environment..."
    source "$BACKEND_DIR/venv/bin/activate" || {
      log_error "Failed to activate virtual environment"
      exit 1
    }
  else
    log_warning "No virtual environment found at $BACKEND_DIR/venv"
    log_info "Checking for alternative environments..."
    
    if [ -d "$BACKEND_DIR/test_env" ]; then
      log_info "Using test_env environment..."
      source "$BACKEND_DIR/test_env/bin/activate" || {
        log_error "Failed to activate test_env environment"
        exit 1
      }
    else
      log_warning "No virtual environment found. Using system Python."
      log_warning "This may cause dependency issues."
    fi
  fi
  
  # Install required packages
  log_info "Installing required packages..."
  python3 -m pip install sqlalchemy sqlalchemy_utils alembic &>/dev/null || {
    log_error "Failed to install required packages"
    exit 1
  }
  
  # Run the migration validator
  log_info "Running migration validator..."
  if $VERBOSE; then
    python3 "$BACKEND_DIR/db/migration_validator.py" $VALIDATOR_OPTIONS
  else
    python3 "$BACKEND_DIR/db/migration_validator.py" $VALIDATOR_OPTIONS 2>/dev/null
  fi
  
  VALIDATION_RESULT=$?
  
  # Report results
  if [ $VALIDATION_RESULT -eq 0 ]; then
    log_success "Migration validation completed successfully"
  else
    log_error "Migration validation failed with exit code $VALIDATION_RESULT"
    exit $VALIDATION_RESULT
  fi
}

# Function to run validation in Docker
function run_docker_validation {
  log_info "Running migration validation in Docker environment..."
  
  # Ensure Docker is available
  if ! command -v docker &>/dev/null; then
    log_error "Docker is required but not found"
    log_error "Please install Docker and try again"
    exit 1
  fi
  
  # Check if backend container is running
  if ! docker ps --format '{{.Names}}' | grep -q "tap-backend"; then
    log_warning "No running backend container found"
    log_info "Checking for backend container..."
    
    CONTAINER_NAME=$(docker ps -a --format '{{.Names}}' | grep "tap-backend" | head -n 1)
    
    if [ -z "$CONTAINER_NAME" ]; then
      log_error "No backend container found"
      log_error "Please start the backend container first:"
      log_error "  ./start-dev-env.master.sh"
      exit 1
    else
      log_info "Found backend container: $CONTAINER_NAME (not running)"
      log_info "Starting container..."
      
      docker start $CONTAINER_NAME || {
        log_error "Failed to start backend container"
        exit 1
      }
      
      log_success "Container started"
    fi
  else
    CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep "tap-backend" | head -n 1)
    log_info "Using running backend container: $CONTAINER_NAME"
  fi
  
  # Copy migration validator to container
  log_info "Copying migration validator to container..."
  docker cp "$BACKEND_DIR/db/migration_validator.py" "$CONTAINER_NAME:/app/db/" || {
    log_error "Failed to copy migration validator to container"
    exit 1
  }
  
  # Run the migration validator in the container
  log_info "Running migration validator in container..."
  if $VERBOSE; then
    docker exec $CONTAINER_NAME python /app/db/migration_validator.py $VALIDATOR_OPTIONS
  else
    docker exec $CONTAINER_NAME python /app/db/migration_validator.py $VALIDATOR_OPTIONS 2>/dev/null
  fi
  
  VALIDATION_RESULT=$?
  
  # Report results
  if [ $VALIDATION_RESULT -eq 0 ]; then
    log_success "Migration validation completed successfully in Docker"
  else
    log_error "Migration validation failed in Docker with exit code $VALIDATION_RESULT"
    exit $VALIDATION_RESULT
  fi
}

# Run validation based on selected mode
if $RUN_IN_DOCKER; then
  run_docker_validation
else
  run_local_validation
fi

# Final success message
log_info "------------------------------------------------------"
log_success "Database migration validation complete!"
log_info "Completed at: $(date)"
log_info "======================================================"

exit 0