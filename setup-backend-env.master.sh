#!/bin/bash
#
# setup-backend-env.master.sh
#
# Description:
#   This script sets up a standardized Python virtual environment for the TAP Integration Platform backend.
#   It creates a consistent development environment with all required dependencies.
#
# Usage:
#   ./setup-backend-env.master.sh [options]
#
# Options:
#   --with-dev     Install development dependencies
#   --clean        Remove existing environment and create a fresh one
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
WITH_DEV=false
CLEAN=false
VERBOSE=false
SHOW_HELP=false

# Backend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"
VENV_DIR="${BACKEND_DIR}/venv.master"
REQ_FILE="${BACKEND_DIR}/requirements.txt"
REQ_MASTER_FILE="${BACKEND_DIR}/requirements.master.txt"
REQ_DEV_FILE="${BACKEND_DIR}/requirements-dev.txt"

# Display help message
function show_help {
  grep '^#' "$0" | grep -v '#!/bin/bash' | sed 's/^# //' | sed 's/^#//'
  exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-dev)
      WITH_DEV=true
      shift
      ;;
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
log_info "TAP Integration Platform - Backend Environment Setup"
log_info "======================================================"
log_info "Started at: $(date)"
log_info "Options: Dev packages: $(if $WITH_DEV; then echo "Yes"; else echo "No"; fi), Clean: $(if $CLEAN; then echo "Yes"; else echo "No"; fi)"
log_info "------------------------------------------------------"

# Ensure the backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  log_error "Backend directory not found: $BACKEND_DIR"
  exit 1
fi

# Check Python version
if ! command -v python3 &>/dev/null; then
  log_error "Python 3 is required but not found"
  exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1)
log_info "Using $PYTHON_VERSION"

# Remove existing virtual environment if --clean specified
if $CLEAN && [ -d "$VENV_DIR" ]; then
  log_info "Removing existing virtual environment..."
  rm -rf "$VENV_DIR"
  log_success "Existing environment removed"
fi

# Create master requirements file if not exists
if [ ! -f "$REQ_MASTER_FILE" ]; then
  log_info "Creating master requirements file from existing requirements..."
  
  if [ -f "$REQ_FILE" ]; then
    cp "$REQ_FILE" "$REQ_MASTER_FILE"
    log_success "Created $REQ_MASTER_FILE from $REQ_FILE"
  else
    log_error "No requirements file found at $REQ_FILE"
    log_info "Creating minimal requirements file..."
    
    cat > "$REQ_MASTER_FILE" << EOF
# TAP Integration Platform Backend Requirements
# Master version for standardized environment

# Web Framework
fastapi==0.95.1
uvicorn==0.17.6
starlette==0.27.0

# Data Validation
pydantic==2.0.3
pydantic-settings==2.0.1
email-validator==1.3.1
python-multipart==0.0.5

# Database
sqlalchemy==2.0.7
alembic==1.10.3
sqlalchemy_utils==0.40.0

# Authentication
pyjwt==2.6.0
passlib==1.7.4
python-jose==3.3.0
bcrypt==4.0.1

# Storage
boto3==1.26.85
azure-storage-blob==12.16.0

# Utilities
python-dotenv==1.0.0
psutil==5.9.4

# Testing
pytest==7.3.1
pytest-cov==4.1.0
httpx==0.24.0
EOF
    
    log_success "Created minimal requirements file at $REQ_MASTER_FILE"
  fi
fi

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
  log_info "Creating master virtual environment..."
  python3 -m venv "$VENV_DIR"
  log_success "Virtual environment created at $VENV_DIR"
else
  log_info "Using existing virtual environment at $VENV_DIR"
fi

# Activate virtual environment
log_info "Activating virtual environment..."
source "${VENV_DIR}/bin/activate"

# Upgrade pip
log_info "Upgrading pip..."
if $VERBOSE; then
  python -m pip install --upgrade pip
else
  python -m pip install --upgrade pip >/dev/null 2>&1
fi

# Install requirements
log_info "Installing dependencies from $REQ_MASTER_FILE..."
if $VERBOSE; then
  python -m pip install -r "$REQ_MASTER_FILE"
else
  python -m pip install -r "$REQ_MASTER_FILE" >/dev/null 2>&1
fi

# Install development dependencies if requested
if $WITH_DEV; then
  if [ -f "$REQ_DEV_FILE" ]; then
    log_info "Installing development dependencies from $REQ_DEV_FILE..."
    if $VERBOSE; then
      python -m pip install -r "$REQ_DEV_FILE"
    else
      python -m pip install -r "$REQ_DEV_FILE" >/dev/null 2>&1
    fi
  else
    log_warning "No development requirements file found at $REQ_DEV_FILE"
  fi
fi

# Create activation helper script
ACTIVATE_HELPER="${BACKEND_DIR}/activate-env.master.sh"
log_info "Creating activation helper script at $ACTIVATE_HELPER..."

cat > "$ACTIVATE_HELPER" << EOF
#!/bin/bash
# Helper script to activate the master virtual environment
# Source this file, don't execute it
# Usage: source activate-env.master.sh

VENV_DIR="\$(dirname "\${BASH_SOURCE[0]}")/venv.master"

if [ -f "\${VENV_DIR}/bin/activate" ]; then
  echo -e "\033[0;34m[INFO]\033[0m Activating master virtual environment..."
  source "\${VENV_DIR}/bin/activate"
  echo -e "\033[0;32m[SUCCESS]\033[0m Environment activated! Python: \$(which python)"
else
  echo -e "\033[0;31m[ERROR]\033[0m Virtual environment not found at \${VENV_DIR}"
  echo -e "\033[0;34m[INFO]\033[0m Run setup-backend-env.master.sh to create it"
  return 1
fi
EOF

chmod +x "$ACTIVATE_HELPER"
log_success "Activation helper script created"

# Success message
log_info "------------------------------------------------------"
log_success "Backend environment setup complete!"
log_info "Virtual environment: $VENV_DIR"
log_info "Requirements: $REQ_MASTER_FILE"
log_info "Python version: $(python --version 2>&1)"
log_info "To activate the environment, run:"
log_info "  source $ACTIVATE_HELPER"
log_info "======================================================"

exit 0