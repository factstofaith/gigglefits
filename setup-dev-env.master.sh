#!/bin/bash
#
# setup-dev-env.master.sh
#
# Description:
#   This script sets up the standardized development environment for the TAP Integration Platform.
#   It runs both the backend and frontend environment setup scripts.
#
# Usage:
#   ./setup-dev-env.master.sh [options]
#
# Options:
#   --backend-only  Only set up the backend environment
#   --frontend-only Only set up the frontend environment
#   --clean         Remove existing environments and create fresh ones
#   --with-dev      Install development dependencies
#   --verbose       Show detailed output
#   --help          Show this help message
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
SETUP_BACKEND=true
SETUP_FRONTEND=true
CLEAN=false
WITH_DEV=false
VERBOSE=false
SHOW_HELP=false

# Display help message
function show_help {
  grep '^#' "$0" | grep -v '#!/bin/bash' | sed 's/^# //' | sed 's/^#//'
  exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --backend-only)
      SETUP_BACKEND=true
      SETUP_FRONTEND=false
      shift
      ;;
    --frontend-only)
      SETUP_BACKEND=false
      SETUP_FRONTEND=true
      shift
      ;;
    --clean)
      CLEAN=true
      shift
      ;;
    --with-dev)
      WITH_DEV=true
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
log_info "TAP Integration Platform - Development Environment Setup"
log_info "======================================================"
log_info "Started at: $(date)"
log_info "Setup: Backend: $(if $SETUP_BACKEND; then echo "Yes"; else echo "No"; fi), Frontend: $(if $SETUP_FRONTEND; then echo "Yes"; else echo "No"; fi)"
log_info "Options: Clean: $(if $CLEAN; then echo "Yes"; else echo "No"; fi), Dev packages: $(if $WITH_DEV; then echo "Yes"; else echo "No"; fi)"
log_info "------------------------------------------------------"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
BACKEND_SETUP="${SCRIPT_DIR}/setup-backend-env.master.sh"
FRONTEND_SETUP="${SCRIPT_DIR}/setup-frontend-env.master.sh"

# Verify setup scripts exist
if $SETUP_BACKEND && [ ! -f "$BACKEND_SETUP" ]; then
  log_error "Backend setup script not found: $BACKEND_SETUP"
  exit 1
fi

if $SETUP_FRONTEND && [ ! -f "$FRONTEND_SETUP" ]; then
  log_error "Frontend setup script not found: $FRONTEND_SETUP"
  exit 1
fi

# Set up backend environment
if $SETUP_BACKEND; then
  log_info "Setting up backend environment..."
  
  # Build backend setup command
  BACKEND_CMD="$BACKEND_SETUP"
  if $CLEAN; then
    BACKEND_CMD="$BACKEND_CMD --clean"
  fi
  if $WITH_DEV; then
    BACKEND_CMD="$BACKEND_CMD --with-dev"
  fi
  if $VERBOSE; then
    BACKEND_CMD="$BACKEND_CMD --verbose"
  fi
  
  # Run backend setup
  $BACKEND_CMD
  
  log_success "Backend environment setup complete"
fi

# Set up frontend environment
if $SETUP_FRONTEND; then
  log_info "Setting up frontend environment..."
  
  # Build frontend setup command
  FRONTEND_CMD="$FRONTEND_SETUP"
  if $CLEAN; then
    FRONTEND_CMD="$FRONTEND_CMD --clean"
  fi
  if $VERBOSE; then
    FRONTEND_CMD="$FRONTEND_CMD --verbose"
  fi
  
  # Run frontend setup
  $FRONTEND_CMD
  
  log_success "Frontend environment setup complete"
fi

# Create activation helper script
ACTIVATE_HELPER="${SCRIPT_DIR}/activate-dev-env.master.sh"
log_info "Creating activation helper script at $ACTIVATE_HELPER..."

cat > "$ACTIVATE_HELPER" << EOF
#!/bin/bash
# Helper script to activate the TAP Integration Platform development environment
# Source this file, don't execute it
# Usage: source activate-dev-env.master.sh

# Script directory
SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

# Activate backend environment if it exists
if [ -f "\${SCRIPT_DIR}/backend/activate-env.master.sh" ]; then
  echo -e "\033[0;34m[INFO]\033[0m Activating backend environment..."
  source "\${SCRIPT_DIR}/backend/activate-env.master.sh"
fi

# Activate frontend environment if it exists
if [ -f "\${SCRIPT_DIR}/frontend/activate-env.master.sh" ]; then
  echo -e "\033[0;34m[INFO]\033[0m Activating frontend environment..."
  source "\${SCRIPT_DIR}/frontend/activate-env.master.sh"
fi

echo -e "\033[0;32m[SUCCESS]\033[0m TAP Integration Platform development environment activated!"
echo -e "\033[0;34m[INFO]\033[0m To start the development environment, run:"
echo -e "\033[0;34m[INFO]\033[0m   ./start-dev-env.master.sh"
EOF

chmod +x "$ACTIVATE_HELPER"
log_success "Activation helper script created"

# Success message
log_info "------------------------------------------------------"
log_success "Development environment setup complete!"
log_info "To activate the environment, run:"
log_info "  source $ACTIVATE_HELPER"
log_info "To start the development environment, run:"
log_info "  ./start-dev-env.master.sh"
log_info "======================================================"

exit 0