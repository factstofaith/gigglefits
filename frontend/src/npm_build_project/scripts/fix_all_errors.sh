#!/bin/bash
# Comprehensive script to fix all detected errors in one pass
# This script applies all the targeted fix scripts in sequence

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$FRONTEND_DIR/src/npm_build_project/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/fix_all_errors_$TIMESTAMP.log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Echo both to console and log file
log() {
  echo "$@" | tee -a "$LOG_FILE"
}

print_separator() {
  log "\n======================================================="
}

log "🔧 Starting comprehensive error fix at $(date)"
print_separator

# Fix 1: Run empty import fix
log "🔍 Stage 1: Fixing empty imports..."
log "-------------------------------------------------------"

# Find files with empty imports
FILES_WITH_EMPTY_IMPORTS=$(grep -l "import {.*,[ ]*}" --include="*.js" --include="*.jsx" "$FRONTEND_DIR/src" || echo "")

if [ -z "$FILES_WITH_EMPTY_IMPORTS" ]; then
  log "✓ No empty imports found"
else
  log "⚠️ Found files with empty imports. Fixing..."
  
  for FILE in $FILES_WITH_EMPTY_IMPORTS; do
    log "Processing $FILE"
    # Replace ", }" with "}" in import statements
    sed -i 's/import {[^}]*,[ ]*}/import {}/g' "$FILE"
    # Replace empty imports entirely
    sed -i 's/import {} from .*//' "$FILE"
  done
  log "✓ Fixed empty imports"
fi

# Fix 2: Fix direct design-system imports
log "\n🔍 Stage 2: Fixing direct design-system imports..."
log "-------------------------------------------------------"

if [ -f "$SCRIPT_DIR/fix_direct_imports.sh" ]; then
  log "Running fix_direct_imports.sh script"
  chmod +x "$SCRIPT_DIR/fix_direct_imports.sh"
  bash "$SCRIPT_DIR/fix_direct_imports.sh" | tee -a "$LOG_FILE"
else
  log "⚠️ fix_direct_imports.sh script not found"
  
  # Implement direct fix here as fallback
  DIRECT_IMPORT_FILES=$(grep -l "import {.*} from '../../design-system/components" --include="*.jsx" "$FRONTEND_DIR/src/components/" | grep -v adapter || echo "")
  
  if [ -n "$DIRECT_IMPORT_FILES" ]; then
    log "Fixing direct imports in ${#DIRECT_IMPORT_FILES[@]} files"
    
    for FILE in $DIRECT_IMPORT_FILES; do
      log "Processing $FILE"
      # Replace direct imports with adapter imports
      sed -i 's|import { \(.*\) } from '\''../../design-system/components/.*|\import { \1 } from '\''../../design-system/adapter'\''|g' "$FILE"
    done
    log "✓ Fixed direct imports"
  else
    log "✓ No direct imports found"
  fi
fi

# Fix 3: Fix Dialog imports
log "\n🔍 Stage 3: Fixing Dialog component imports..."
log "-------------------------------------------------------"

if [ -f "$SCRIPT_DIR/fix_dialog_imports.sh" ]; then
  log "Running fix_dialog_imports.sh script"
  chmod +x "$SCRIPT_DIR/fix_dialog_imports.sh"
  bash "$SCRIPT_DIR/fix_dialog_imports.sh" | tee -a "$LOG_FILE"
else
  log "⚠️ fix_dialog_imports.sh script not found"
  
  # Implement direct fix here as fallback
  DIALOG_IMPORT_FILES=$(grep -l "import.*Dialog.*from '.*feedback/Dialog'" --include="*.jsx" "$FRONTEND_DIR/src" || echo "")
  
  if [ -n "$DIALOG_IMPORT_FILES" ]; then
    log "Fixing Dialog imports in files"
    
    for FILE in $DIALOG_IMPORT_FILES; do
      log "Processing $FILE"
      # Replace direct Dialog imports with adapter imports
      sed -i 's|import { \(.*\)Dialog\(.*\) } from .*/components/feedback/Dialog.*|import { \1Dialog\2 } from "../../design-system/adapter";|g' "$FILE"
      sed -i 's|import Dialog from .*/components/feedback/Dialog.*|import { Dialog } from "../../design-system/adapter";|g' "$FILE"
    done
    log "✓ Fixed Dialog imports"
  else
    log "✓ No problematic Dialog imports found"
  fi
fi

# Fix 4: Fix unescaped entities
log "\n🔍 Stage 4: Fixing unescaped HTML entities..."
log "-------------------------------------------------------"

if [ -f "$SCRIPT_DIR/fix_unescaped_entities.sh" ]; then
  log "Running fix_unescaped_entities.sh script"
  chmod +x "$SCRIPT_DIR/fix_unescaped_entities.sh"
  bash "$SCRIPT_DIR/fix_unescaped_entities.sh" | tee -a "$LOG_FILE"
else
  log "⚠️ fix_unescaped_entities.sh script not found"
  
  # Implement direct fix here as fallback
  ENTITY_FILES=$(grep -l "react/no-unescaped-entities" --include="*.jsx" "$FRONTEND_DIR/src/components/" || echo "")
  
  if [ -n "$ENTITY_FILES" ]; then
    log "Fixing unescaped entities in files"
    
    for FILE in $ENTITY_FILES; do
      log "Processing $FILE"
      # Create a backup
      cp "$FILE" "${FILE}.bak"
      # Replace quotes and apostrophes with entities
      sed -i 's/\([^\\]\)"/\1\&quot;/g' "$FILE"
      sed -i "s/\([^\\]\)'/\1\&apos;/g" "$FILE"
    done
    log "✓ Fixed unescaped entities"
  else
    log "✓ No unescaped entities found"
  fi
fi

# Fix 5: Fix missing icons
log "\n🔍 Stage 5: Fixing missing icon imports..."
log "-------------------------------------------------------"

# Define known problematic icon mappings
declare -A ICON_MAPPINGS
ICON_MAPPINGS["InsertBreakpoint"]="FiberManualRecord"
ICON_MAPPINGS["Database"]="Storage"

# Find files with problematic icon imports
for bad_icon in "${!ICON_MAPPINGS[@]}"; do
  replacement_icon="${ICON_MAPPINGS[$bad_icon]}"
  
  FILES_WITH_BAD_ICON=$(grep -l "import.*$bad_icon.*from '@mui/icons-material'" --include="*.js" --include="*.jsx" "$FRONTEND_DIR/src" || echo "")
  
  if [ -n "$FILES_WITH_BAD_ICON" ]; then
    log "Replacing $bad_icon with $replacement_icon in files"
    
    for FILE in $FILES_WITH_BAD_ICON; do
      log "Processing $FILE"
      sed -i "s/$bad_icon as /${replacement_icon} as /g" "$FILE"
      sed -i "s/import { $bad_icon } from/import { ${replacement_icon} } from/g" "$FILE"
    done
    log "✓ Fixed $bad_icon icon imports"
  else
    log "✓ No problematic $bad_icon imports found"
  fi
done

# Final check and verification
log "\n🔍 Stage 6: Running final verification..."
log "-------------------------------------------------------"

if [ -f "$SCRIPT_DIR/compile_check.sh" ]; then
  log "Running compile_check.sh for verification"
  chmod +x "$SCRIPT_DIR/compile_check.sh"
  bash "$SCRIPT_DIR/compile_check.sh" | tee -a "$LOG_FILE"
else
  log "⚠️ compile_check.sh script not found for verification"
fi

# Final summary
print_separator
log "🏁 Comprehensive error fix complete at $(date)!"
log "Check log file for details: $LOG_FILE"
log "The application should now be ready to run."
print_separator

exit 0