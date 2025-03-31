#!/bin/bash
# Advanced compilation check script for quickly identifying errors
# This script runs a series of fast checks to find issues before running npm

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$FRONTEND_DIR/src/npm_build_project/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/compile_check_$TIMESTAMP.log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Echo both to console and log file
log() {
  echo "$@" | tee -a "$LOG_FILE"
}

log "🔍 Starting compilation check at $(date)"
log "======================================================="

# Check 1: Find syntax errors using Node's own parser
log "\n✅ STAGE 1: Basic syntax check"
log "-------------------------------------------------------"

syntax_error_count=0
for file in $(find "$FRONTEND_DIR/src" -name "*.js" -o -name "*.jsx" | grep -v "node_modules" | grep -v "build"); do
  node --check "$file" > /dev/null 2>&1 || {
    log "❌ Syntax error in $file"
    node --check "$file" 2>&1 | head -n 5 | tee -a "$LOG_FILE"
    syntax_error_count=$((syntax_error_count + 1))
  }
done

if [ $syntax_error_count -eq 0 ]; then
  log "✓ No basic syntax errors found"
else
  log "⚠️ Found $syntax_error_count files with syntax errors"
fi

# Check 2: Find common import errors
log "\n✅ STAGE 2: Import pattern check"
log "-------------------------------------------------------"

# Check for empty imports like "import { , Box }"
log "Checking for empty imports..."
grep -r "import {.*,[ ]*}" --include="*.js" --include="*.jsx" "$FRONTEND_DIR/src" | tee -a "$LOG_FILE" || log "✓ No empty imports found"

# Check for direct design-system imports
log "\nChecking for direct design-system imports..."
direct_imports=$(grep -r "import {.*} from '../../design-system/components" --include="*.jsx" "$FRONTEND_DIR/src/components/" | grep -v adapter | wc -l)
if [ "$direct_imports" -gt 0 ]; then
  log "⚠️ Found $direct_imports direct design-system imports. Top 5:"
  grep -r "import {.*} from '../../design-system/components" --include="*.jsx" "$FRONTEND_DIR/src/components/" | grep -v adapter | head -5 | tee -a "$LOG_FILE"
else
  log "✓ No direct design-system imports found"
fi

# Check for missing/incorrect imports
log "\nChecking for import errors with common components..."
common_components=("Dialog" "Collapse" "CircularProgress" "Chip" "Box" "Typography")
for component in "${common_components[@]}"; do
  import_count=$(grep -r "import.*$component.*from" --include="*.js" --include="*.jsx" "$FRONTEND_DIR/src" | wc -l)
  log "  - $component: $import_count imports"
done

# Check 3: ESLint critical errors only (much faster than full ESLint)
log "\n✅ STAGE 3: Critical ESLint errors"
log "-------------------------------------------------------"
log "Running focused ESLint check for critical errors..."

# Use a targeted set of rules for speed
npx eslint "$FRONTEND_DIR/src" --quiet --no-eslintrc --parser-options=jsx:true \
  --rule 'react/jsx-no-undef:2' \
  --rule 'no-undef:2' \
  --rule 'import/no-unresolved:0' \
  --rule 'react/jsx-key:2' \
  2>/dev/null | grep -v "Definition for rule" | head -10 | tee -a "$LOG_FILE" || log "✓ No critical ESLint errors found"

# Check 4: Type checking - run a fast subset check 
log "\n✅ STAGE 4: TypeScript quick check (sample files)"
log "-------------------------------------------------------"

# Create a list of key files to check
key_files=(
  "$FRONTEND_DIR/src/hooks/useFlowOptimizer.js"
  "$FRONTEND_DIR/src/App.jsx"
  "$FRONTEND_DIR/src/pages/invitation/AcceptInvitationPage.jsx"
  "$FRONTEND_DIR/src/pages/invitation/CompleteRegistrationPage.jsx"
  "$FRONTEND_DIR/src/components/integration/DebugModePanel.jsx"
)

for file in "${key_files[@]}"; do
  if [ -f "$file" ]; then
    log "Checking $file..."
    npx tsc --noEmit --skipLibCheck --allowJs --jsx react "$file" 2>&1 | head -5 | tee -a "$LOG_FILE" || log "⚠️ Type errors found in $file"
  fi
done

# Check 5: Run a quick Babel compile test on a few files
log "\n✅ STAGE 5: Babel transpilation test"
log "-------------------------------------------------------"
log "Testing Babel transpilation on sample files..."

for file in "${key_files[@]}"; do
  if [ -f "$file" ]; then
    npx babel --presets @babel/preset-react --plugins @babel/plugin-syntax-jsx "$file" > /dev/null 2>&1 && log "✓ $file: OK" || {
      log "❌ Babel error in $file:"
      npx babel --presets @babel/preset-react --plugins @babel/plugin-syntax-jsx "$file" 2>&1 | head -5 | tee -a "$LOG_FILE"
    }
  fi
done

# Check 6: Find unescaped entities
log "\n✅ STAGE 6: HTML entity check"
log "-------------------------------------------------------"
log "Looking for unescaped entities in JSX..."

unescaped_count=$(grep -r "react/no-unescaped-entities" --include="*.jsx" "$FRONTEND_DIR/src/components/" | wc -l)
if [ "$unescaped_count" -gt 0 ]; then
  log "⚠️ Found potential unescaped entities. Top 5 files:"
  grep -r "react/no-unescaped-entities" --include="*.jsx" "$FRONTEND_DIR/src/components/" | cut -d':' -f1 | sort | uniq | head -5 | tee -a "$LOG_FILE"
else
  log "✓ No obvious unescaped entities found"
fi

# Final summary
log "\n======================================================="
log "🏁 Compilation check complete!"
log "Check log file for details: $LOG_FILE"
log "Next steps:"
log "1. Fix any syntax errors (Stage 1)"
log "2. Fix import pattern issues (Stage 2)"
log "3. Address critical ESLint errors (Stage 3)"
log "4. Fix TypeScript errors (Stage 4)"
log "5. Fix Babel transpilation issues (Stage 5)"
log "6. Fix unescaped entities (Stage 6)"
log "======================================================="

# Return success
exit 0