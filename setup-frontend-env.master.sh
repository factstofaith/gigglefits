#!/bin/bash
#
# setup-frontend-env.master.sh
#
# Description:
#   This script sets up a standardized Node.js environment for the TAP Integration Platform frontend.
#   It creates a consistent development environment with all required dependencies.
#
# Usage:
#   ./setup-frontend-env.master.sh [options]
#
# Options:
#   --clean        Remove existing node_modules and create a fresh install
#   --verbose      Show detailed output
#   --help         Show this help message
#
# Author: Claude AI
# Created: 2025-04-10
# Updated: 2025-04-10

# Exit immediately if a command fails
set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Log functions
function log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
function log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
function log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
function log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Default options
CLEAN=false
VERBOSE=false
SHOW_HELP=false

# Frontend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"
NVMRC_MASTER="${FRONTEND_DIR}/.nvmrc.master"

# Display help message
function show_help {
  grep '^#' "$0" | grep -v '#!/bin/bash' | sed 's/^# //' | sed 's/^#//'
  exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --clean)
      CLEAN=true
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

# Header
log_info "======================================================"
log_info "TAP Integration Platform - Frontend Environment Setup"
log_info "======================================================"
log_info "Started at: $(date)"
log_info "Options: Clean: $(if $CLEAN; then echo "Yes"; else echo "No"; fi)"
log_info "------------------------------------------------------"

# Ensure the frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
  log_error "Frontend directory not found: $FRONTEND_DIR"
  exit 1
fi

# Check Node.js and npm availability
if ! command -v node &>/dev/null; then
  log_error "Node.js is required but not found"
  log_error "Please install Node.js before continuing"
  exit 1
fi

if ! command -v npm &>/dev/null; then
  log_error "npm is required but not found"
  log_error "Please install npm before continuing"
  exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_info "Using Node.js ${NODE_VERSION} and npm ${NPM_VERSION}"

# Create .nvmrc.master file if it doesn't exist
if [ ! -f "$NVMRC_MASTER" ]; then
  log_info "Creating .nvmrc.master file..."
  RECOMMENDED_NODE_VERSION="18.15.0"
  echo "$RECOMMENDED_NODE_VERSION" > "$NVMRC_MASTER"
  log_success "Created .nvmrc.master with Node.js version $RECOMMENDED_NODE_VERSION"
else
  RECOMMENDED_NODE_VERSION=$(cat "$NVMRC_MASTER")
  log_info "Found .nvmrc.master with Node.js version $RECOMMENDED_NODE_VERSION"
fi

# Check Node.js version against .nvmrc.master
CURRENT_NODE_VERSION=$(node --version | cut -d'v' -f2)

if [ "$(printf '%s\n' "$RECOMMENDED_NODE_VERSION" "$CURRENT_NODE_VERSION" | sort -V | head -n1)" != "$RECOMMENDED_NODE_VERSION" ]; then
  log_warning "Node.js version mismatch!"
  log_warning "Recommended: ${RECOMMENDED_NODE_VERSION}, Current: ${CURRENT_NODE_VERSION}"
  
  if command -v nvm &>/dev/null; then
    log_info "nvm detected. You can switch Node.js versions with:"
    log_info "  nvm install ${RECOMMENDED_NODE_VERSION} && nvm use ${RECOMMENDED_NODE_VERSION}"
  else
    log_warning "Consider installing nvm to manage Node.js versions:"
    log_warning "  https://github.com/nvm-sh/nvm#installing-and-updating"
  fi
fi

# Remove node_modules if clean option is specified
if $CLEAN && [ -d "${FRONTEND_DIR}/node_modules" ]; then
  log_info "Removing existing node_modules..."
  rm -rf "${FRONTEND_DIR}/node_modules"
  if [ -f "${FRONTEND_DIR}/package-lock.json" ]; then
    log_info "Removing package-lock.json..."
    rm -f "${FRONTEND_DIR}/package-lock.json"
  fi
  log_success "Cleaned existing dependencies"
fi

# Install dependencies
log_info "Installing frontend dependencies..."
cd "${FRONTEND_DIR}"

if $VERBOSE; then
  npm ci
else
  npm ci --quiet
fi

log_success "Frontend dependencies installed successfully"

# Create env files from the master template if they don't exist
if [ -f "${FRONTEND_DIR}/.env.master" ]; then
  log_info "Using .env.master as template for environment files..."

  # Create development environment file
  if [ ! -f "${FRONTEND_DIR}/.env.development" ]; then
    log_info "Creating .env.development from .env.master..."
    cp "${FRONTEND_DIR}/.env.master" "${FRONTEND_DIR}/.env.development"
    log_success "Created .env.development file"
  fi

  # Create production environment file with production overrides
  if [ ! -f "${FRONTEND_DIR}/.env.production" ]; then
    log_info "Creating .env.production from .env.master with production overrides..."
    cp "${FRONTEND_DIR}/.env.master" "${FRONTEND_DIR}/.env.production"
    
    # Apply production-specific overrides
    sed -i 's/SERVICE_ENV=development/SERVICE_ENV=production/g' "${FRONTEND_DIR}/.env.production"
    sed -i 's/SERVICE_API_URL=http:\/\/tap-backend:8000/SERVICE_API_URL=\/api/g' "${FRONTEND_DIR}/.env.production"
    sed -i 's/SERVICE_DEV_MODE=true/SERVICE_DEV_MODE=false/g' "${FRONTEND_DIR}/.env.production"
    sed -i 's/SERVICE_HOT_RELOAD=true/SERVICE_HOT_RELOAD=false/g' "${FRONTEND_DIR}/.env.production"
    sed -i 's/SERVICE_ERROR_LEVEL=debug/SERVICE_ERROR_LEVEL=error/g' "${FRONTEND_DIR}/.env.production"
    sed -i 's/SERVICE_HEALTH_CHECK_INTERVAL=60000/SERVICE_HEALTH_CHECK_INTERVAL=300000/g' "${FRONTEND_DIR}/.env.production"
    sed -i 's/NODE_ENV=development/NODE_ENV=production/g' "${FRONTEND_DIR}/.env.production"
    sed -i 's/REACT_APP_ENVIRONMENT=development/REACT_APP_ENVIRONMENT=production/g' "${FRONTEND_DIR}/.env.production"
    sed -i 's/REACT_APP_ERROR_LOG_LEVEL=debug/REACT_APP_ERROR_LOG_LEVEL=error/g' "${FRONTEND_DIR}/.env.production"
    sed -i 's/REACT_APP_API_URL=http:\/\/tap-backend:8000/REACT_APP_API_URL=\/api/g' "${FRONTEND_DIR}/.env.production"
    
    log_success "Created .env.production file"
  fi
else
  log_warning "Master environment file .env.master not found."
  log_info "Creating .env.master template..."
  
  cat > "${FRONTEND_DIR}/.env.master" << EOF
# Environment Variables - Master Configuration
# This is the standardized master environment file for the TAP Integration Platform frontend

# Service Identity
SERVICE_NAME=frontend
SERVICE_ENV=development
SERVICE_VERSION=1.0.0
SERVICE_API_URL=http://tap-backend:8000

# Development Settings
SERVICE_DEV_MODE=true
SERVICE_HOT_RELOAD=true
SERVICE_HOT_RELOAD_HOST=localhost
SERVICE_HOT_RELOAD_PORT=3456
CHOKIDAR_USEPOLLING=true
WDS_SOCKET_HOST=localhost
WDS_SOCKET_PORT=3456
WEBPACK_DEV_SERVER=true

# Health & Error Handling
SERVICE_HEALTH_CHECK_INTERVAL=60000
SERVICE_HEALTH_CHECK_PATH=/health
SERVICE_ERROR_REPORTING=true
SERVICE_ERROR_LEVEL=debug
SERVICE_MAX_ERRORS=100
REACT_APP_ERROR_REPORTING_URL=/api/errors
REACT_APP_ERROR_LOGGING_ENABLED=true
REACT_APP_ERROR_LOG_LEVEL=debug

# Legacy Variables (for backward compatibility)
NODE_ENV=development
REACT_APP_API_URL=http://tap-backend:8000
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
EOF
  
  log_success "Created .env.master template"
  
  # Now create the environment-specific files
  log_info "Creating environment-specific files from .env.master..."
  cp "${FRONTEND_DIR}/.env.master" "${FRONTEND_DIR}/.env.development"
  cp "${FRONTEND_DIR}/.env.master" "${FRONTEND_DIR}/.env.production"
  
  # Apply production-specific overrides
  sed -i 's/SERVICE_ENV=development/SERVICE_ENV=production/g' "${FRONTEND_DIR}/.env.production"
  sed -i 's/SERVICE_API_URL=http:\/\/tap-backend:8000/SERVICE_API_URL=\/api/g' "${FRONTEND_DIR}/.env.production"
  sed -i 's/SERVICE_DEV_MODE=true/SERVICE_DEV_MODE=false/g' "${FRONTEND_DIR}/.env.production"
  sed -i 's/SERVICE_HOT_RELOAD=true/SERVICE_HOT_RELOAD=false/g' "${FRONTEND_DIR}/.env.production"
  sed -i 's/SERVICE_ERROR_LEVEL=debug/SERVICE_ERROR_LEVEL=error/g' "${FRONTEND_DIR}/.env.production"
  sed -i 's/SERVICE_HEALTH_CHECK_INTERVAL=60000/SERVICE_HEALTH_CHECK_INTERVAL=300000/g' "${FRONTEND_DIR}/.env.production"
  sed -i 's/NODE_ENV=development/NODE_ENV=production/g' "${FRONTEND_DIR}/.env.production"
  sed -i 's/REACT_APP_ENVIRONMENT=development/REACT_APP_ENVIRONMENT=production/g' "${FRONTEND_DIR}/.env.production"
  sed -i 's/REACT_APP_ERROR_LOG_LEVEL=debug/REACT_APP_ERROR_LOG_LEVEL=error/g' "${FRONTEND_DIR}/.env.production"
  sed -i 's/REACT_APP_API_URL=http:\/\/tap-backend:8000/REACT_APP_API_URL=\/api/g' "${FRONTEND_DIR}/.env.production"
  
  log_success "Created .env.development and .env.production files"
fi

# Create activation helper script
ACTIVATE_HELPER="${FRONTEND_DIR}/activate-env.master.sh"
log_info "Creating activation helper script at $ACTIVATE_HELPER..."

cat > "$ACTIVATE_HELPER" << EOF
#!/bin/bash
# Helper script to set up frontend environment variables
# Source this file, don't execute it
# Usage: source activate-env.master.sh

# Set Node.js version if using nvm
if command -v nvm &>/dev/null; then
  NVMRC_MASTER="\$(dirname "\${BASH_SOURCE[0]}")/.nvmrc.master"
  if [ -f "\$NVMRC_MASTER" ]; then
    NODE_VERSION=\$(cat "\$NVMRC_MASTER")
    echo -e "\033[0;34m[INFO]\033[0m Activating Node.js \$NODE_VERSION using nvm..."
    nvm use \$NODE_VERSION 2>/dev/null || {
      echo -e "\033[0;33m[WARNING]\033[0m Node.js \$NODE_VERSION not found, installing..."
      nvm install \$NODE_VERSION
      nvm use \$NODE_VERSION
    }
  fi
fi

# Set environment variables
export NODE_ENV=development
export CHOKIDAR_USEPOLLING=true
export WDS_SOCKET_HOST=localhost
export WDS_SOCKET_PORT=3456

echo -e "\033[0;32m[SUCCESS]\033[0m Frontend environment activated!"
echo -e "\033[0;34m[INFO]\033[0m Node.js: \$(node --version), npm: \$(npm --version)"
echo -e "\033[0;34m[INFO]\033[0m To start the frontend development server, run:"
echo -e "\033[0;34m[INFO]\033[0m   cd \$(dirname "\${BASH_SOURCE[0]}") && npm start"
EOF

chmod +x "$ACTIVATE_HELPER"
log_success "Activation helper script created"

# Success message
log_info "------------------------------------------------------"
log_success "Frontend environment setup complete!"
log_info "Node.js version: ${NODE_VERSION}"
log_info "npm version: ${NPM_VERSION}"
log_info "To activate the environment, run:"
log_info "  source $ACTIVATE_HELPER"
log_info "======================================================"

exit 0