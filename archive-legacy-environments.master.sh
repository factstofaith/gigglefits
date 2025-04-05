#!/bin/bash
#
# archive-legacy-environments.master.sh
#
# Description:
#   This script archives legacy environment files and directories as part of the 
#   standardization process for the TAP Integration Platform.
#
# Usage:
#   ./archive-legacy-environments.master.sh [options]
#
# Options:
#   --dry-run       Show what would be archived without making changes
#   --force         Archive without confirmation
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
DRY_RUN=false
FORCE=false
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
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --force)
      FORCE=true
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

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"
ARCHIVE_BASE="${SCRIPT_DIR}/archive/environments"
BACKEND_ARCHIVE="${ARCHIVE_BASE}/backend"
FRONTEND_ARCHIVE="${ARCHIVE_BASE}/frontend"

# Header
log_info "======================================================"
log_info "TAP Integration Platform - Legacy Environment Archiving"
log_info "======================================================"
log_info "Started at: $(date)"
log_info "Mode: $(if $DRY_RUN; then echo "Dry Run"; else echo "Live"; fi)"
log_info "------------------------------------------------------"

# Ensure archive directories exist
mkdir -p "$BACKEND_ARCHIVE"
mkdir -p "$FRONTEND_ARCHIVE"

# Create a timestamp for archive naming
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Function to archive a directory or file
function archive_item {
  local source="$1"
  local destination="$2"
  local item_name="$3"
  
  if [ ! -e "$source" ]; then
    log_warning "Item not found: $source"
    return
  fi
  
  if $DRY_RUN; then
    log_info "[DRY RUN] Would archive $item_name: $source -> $destination"
  else
    if [ -d "$source" ]; then
      log_info "Archiving directory: $item_name"
      if $VERBOSE; then
        # Create a tar file of the directory
        tar -czf "${destination}.tar.gz" -C "$(dirname "$source")" "$(basename "$source")"
        log_success "Directory archived to ${destination}.tar.gz"
      else
        tar -czf "${destination}.tar.gz" -C "$(dirname "$source")" "$(basename "$source")" >/dev/null 2>&1
        log_success "Directory archived to ${destination}.tar.gz"
      fi
      # Add info to the README
      echo "- $(basename "$source") -> $(basename "${destination}.tar.gz")" >> "$(dirname "$destination")/README.md"
    else
      log_info "Archiving file: $item_name"
      # Copy the file with a new name
      cp "$source" "$destination"
      log_success "File archived to $destination"
      # Add info to the README
      echo "- $(basename "$source") -> $(basename "$destination")" >> "$(dirname "$destination")/README.md"
    fi
  fi
}

# Function to remove an archived item
function remove_item {
  local source="$1"
  local item_name="$2"
  
  if [ ! -e "$source" ]; then
    return
  fi
  
  if $DRY_RUN; then
    log_info "[DRY RUN] Would remove $item_name: $source"
  else
    if [ -d "$source" ]; then
      log_info "Removing directory: $item_name"
      if $VERBOSE; then
        rm -rf "$source"
      else
        rm -rf "$source" >/dev/null 2>&1
      fi
      log_success "Directory removed: $source"
    else
      log_info "Removing file: $item_name"
      rm -f "$source"
      log_success "File removed: $source"
    fi
  fi
}

# Collect items to archive
BACKEND_ENVS=()
if [ -d "$BACKEND_DIR" ]; then
  cd "$BACKEND_DIR"
  for env_dir in venv .venv test_env tmpvenv; do
    if [ -d "$env_dir" ] && [ "$env_dir" != "venv.master" ]; then
      BACKEND_ENVS+=("$env_dir")
    fi
  done
fi

FRONTEND_ENV_FILES=()
if [ -d "$FRONTEND_DIR" ]; then
  cd "$FRONTEND_DIR"
  for env_file in .env* .nvmrc; do
    if [ -f "$env_file" ] && [ "$env_file" != ".nvmrc.master" ] && [ "$env_file" != ".env.master" ]; then
      FRONTEND_ENV_FILES+=("$env_file")
    fi
  done
fi

# Collect webpack configs to archive
FRONTEND_WEBPACK_FILES=()
if [ -d "$FRONTEND_DIR/docker" ]; then
  cd "$FRONTEND_DIR/docker"
  for webpack_file in webpack.*.js; do
    if [ -f "$webpack_file" ] && [ "$webpack_file" != "webpack.master.js" ]; then
      FRONTEND_WEBPACK_FILES+=("$webpack_file")
    fi
  done
fi

# Collect config backup directories
CONFIG_BACKUP_DIRS=()
if [ -d "$FRONTEND_DIR/config" ]; then
  cd "$FRONTEND_DIR/config"
  for backup_dir in backup-*; do
    if [ -d "$backup_dir" ]; then
      CONFIG_BACKUP_DIRS+=("$backup_dir")
    fi
  done
fi

# Display items to archive
log_info "Backend environments to archive:"
for env in "${BACKEND_ENVS[@]}"; do
  log_info "- $env"
done

log_info "Frontend environment files to archive:"
for env_file in "${FRONTEND_ENV_FILES[@]}"; do
  log_info "- $env_file"
done

log_info "Frontend webpack files to archive:"
for webpack_file in "${FRONTEND_WEBPACK_FILES[@]}"; do
  log_info "- $webpack_file"
done

log_info "Config backup directories to archive:"
for backup_dir in "${CONFIG_BACKUP_DIRS[@]}"; do
  log_info "- $backup_dir"
done

# Confirm archiving
if ! $FORCE && ! $DRY_RUN; then
  echo ""
  read -p "Archive these items? (y/n): " confirm
  if [[ $confirm != [yY] ]]; then
    log_warning "Archiving cancelled by user"
    exit 0
  fi
fi

# Create archive directories
WEBPACK_ARCHIVE="${ARCHIVE_BASE}/webpack"
CONFIG_ARCHIVE="${ARCHIVE_BASE}/config"
mkdir -p "$WEBPACK_ARCHIVE"
mkdir -p "$CONFIG_ARCHIVE"

# Archive backend environments
if [ ${#BACKEND_ENVS[@]} -gt 0 ]; then
  log_info "Archiving backend environments..."
  for env in "${BACKEND_ENVS[@]}"; do
    archive_item "${BACKEND_DIR}/${env}" "${BACKEND_ARCHIVE}/${env}_${TIMESTAMP}" "$env"
    remove_item "${BACKEND_DIR}/${env}" "$env"
  done
  log_success "Backend environments archived"
else
  log_info "No backend environments to archive"
fi

# Archive frontend environment files
if [ ${#FRONTEND_ENV_FILES[@]} -gt 0 ]; then
  log_info "Archiving frontend environment files..."
  for env_file in "${FRONTEND_ENV_FILES[@]}"; do
    archive_item "${FRONTEND_DIR}/${env_file}" "${FRONTEND_ARCHIVE}/${env_file}_${TIMESTAMP}" "$env_file"
    remove_item "${FRONTEND_DIR}/${env_file}" "$env_file"
  done
  log_success "Frontend environment files archived"
else
  log_info "No frontend environment files to archive"
fi

# Archive webpack config files
if [ ${#FRONTEND_WEBPACK_FILES[@]} -gt 0 ]; then
  log_info "Archiving webpack config files..."
  for webpack_file in "${FRONTEND_WEBPACK_FILES[@]}"; do
    archive_item "${FRONTEND_DIR}/docker/${webpack_file}" "${WEBPACK_ARCHIVE}/${webpack_file}_${TIMESTAMP}" "$webpack_file"
    remove_item "${FRONTEND_DIR}/docker/${webpack_file}" "$webpack_file"
  done
  log_success "Webpack config files archived"
else
  log_info "No webpack config files to archive"
fi

# Archive config backup directories
if [ ${#CONFIG_BACKUP_DIRS[@]} -gt 0 ]; then
  log_info "Archiving config backup directories..."
  for backup_dir in "${CONFIG_BACKUP_DIRS[@]}"; do
    archive_item "${FRONTEND_DIR}/config/${backup_dir}" "${CONFIG_ARCHIVE}/${backup_dir}_${TIMESTAMP}" "$backup_dir"
    remove_item "${FRONTEND_DIR}/config/${backup_dir}" "$backup_dir"
  done
  log_success "Config backup directories archived"
else
  log_info "No config backup directories to archive"
fi

# Final success message
log_info "------------------------------------------------------"
if $DRY_RUN; then
  log_success "Dry run completed successfully!"
  log_info "Run without --dry-run to actually archive the items"
else
  log_success "Legacy environments archived successfully!"
  log_info "Archive location: $ARCHIVE_BASE"
fi
log_info "Completed at: $(date)"
log_info "======================================================"

exit 0