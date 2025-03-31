#!/bin/bash
# Error Manager - Launcher for checking and fixing compilation errors
# This script provides a simple interface to run the various error tools

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Make sure all scripts are executable
chmod +x "$SCRIPT_DIR"/*.sh 2>/dev/null || true

print_help() {
  echo "TAP Integration Platform Error Manager"
  echo "-------------------------------------"
  echo "Usage: $0 [command]"
  echo ""
  echo "Commands:"
  echo "  check      Run a quick compilation check to identify errors"
  echo "  fix        Run automatic fixes for all detected errors"
  echo "  status     Show the current error status"
  echo "  report     Generate a detailed error report"
  echo "  help       Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 check   # Run checks only"
  echo "  $0 fix     # Fix all errors automatically"
}

run_check() {
  echo "📊 Running compilation check..."
  if [ -f "$SCRIPT_DIR/compile_check.sh" ]; then
    bash "$SCRIPT_DIR/compile_check.sh"
  else
    echo "❌ Error: compile_check.sh script not found"
    exit 1
  fi
}

run_fix() {
  echo "🔧 Running automatic error fixes..."
  if [ -f "$SCRIPT_DIR/fix_all_errors.sh" ]; then
    bash "$SCRIPT_DIR/fix_all_errors.sh"
  else
    echo "❌ Error: fix_all_errors.sh script not found"
    exit 1
  fi
}

show_status() {
  echo "🔍 Current Error Status"
  echo "-------------------------------------"
  
  # Check how many files have direct imports
  direct_imports=$(grep -r "import {.*} from '../../design-system/components" --include="*.jsx" "$FRONTEND_DIR/src/components/" | grep -v adapter | wc -l)
  echo "Direct imports: $direct_imports files"
  
  # Check for empty imports
  empty_imports=$(grep -r "import {.*,[ ]*}" --include="*.js" --include="*.jsx" "$FRONTEND_DIR/src" | wc -l)
  echo "Empty imports: $empty_imports occurrences"
  
  # Check for unescaped entities
  unescaped=$(grep -r "react/no-unescaped-entities" --include="*.jsx" "$FRONTEND_DIR/src/components/" | wc -l)
  echo "Unescaped entities: $unescaped files"
  
  # Check for critical import errors
  echo "-------------------------------------"
  echo "Critical component status:"
  
  # Check Dialog and Collapse (the most problematic components)
  dialog_adapter=$(grep -r "import.*Dialog.*from '../../design-system/adapter'" --include="*.jsx" "$FRONTEND_DIR/src" | wc -l)
  dialog_direct=$(grep -r "import.*Dialog.*from '../../design-system/components" --include="*.jsx" "$FRONTEND_DIR/src" | wc -l)
  echo "- Dialog: $dialog_adapter adapter imports, $dialog_direct direct imports"
  
  collapse_adapter=$(grep -r "import.*Collapse.*from '../../design-system/adapter'" --include="*.jsx" "$FRONTEND_DIR/src" | wc -l)
  collapse_direct=$(grep -r "import.*Collapse.*from '../../design-system/components" --include="*.jsx" "$FRONTEND_DIR/src" | wc -l)
  echo "- Collapse: $collapse_adapter adapter imports, $collapse_direct direct imports"
  
  # Check if npm install can run
  echo "-------------------------------------"
  echo "Latest error log files:"
  ls -lt "$FRONTEND_DIR/src/npm_build_project/logs/" | head -5
}

generate_report() {
  REPORT_FILE="$FRONTEND_DIR/src/npm_build_project/logs/error_report_$(date +"%Y%m%d_%H%M%S").md"
  
  echo "# TAP Integration Platform Error Report" > "$REPORT_FILE"
  echo "Generated: $(date)" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  echo "## Component Import Analysis" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "### Direct vs Adapter Imports" >> "$REPORT_FILE"
  
  # Count different import types
  direct_imports=$(grep -r "import {.*} from '../../design-system/components" --include="*.jsx" "$FRONTEND_DIR/src/components/" | grep -v adapter | wc -l)
  adapter_imports=$(grep -r "import {.*} from '../../design-system/adapter'" --include="*.jsx" "$FRONTEND_DIR/src/components/" | wc -l)
  
  echo "- **Adapter imports:** $adapter_imports" >> "$REPORT_FILE"
  echo "- **Direct imports:** $direct_imports" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  echo "### Top 5 Components with Direct Imports" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "| Component | Direct Import Count |" >> "$REPORT_FILE"
  echo "|-----------|---------------------|" >> "$REPORT_FILE"
  
  # Find top components imported directly
  for component in Box Typography Button Dialog Card CircularProgress TextField; do
    count=$(grep -r "import {.*$component.*} from '../../design-system/components" --include="*.jsx" "$FRONTEND_DIR/src/components/" | grep -v adapter | wc -l)
    echo "| $component | $count |" >> "$REPORT_FILE"
  done
  
  echo "" >> "$REPORT_FILE"
  echo "## Syntax Error Analysis" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  # Find other error types
  echo "### Error Types" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "| Error Type | Count |" >> "$REPORT_FILE"
  echo "|------------|-------|" >> "$REPORT_FILE"
  
  empty_imports=$(grep -r "import {.*,[ ]*}" --include="*.js" --include="*.jsx" "$FRONTEND_DIR/src" | wc -l)
  echo "| Empty imports | $empty_imports |" >> "$REPORT_FILE"
  
  unescaped=$(grep -r "react/no-unescaped-entities" --include="*.jsx" "$FRONTEND_DIR/src/components/" | wc -l)
  echo "| Unescaped entities | $unescaped |" >> "$REPORT_FILE"
  
  icon_issues=$(grep -r "import.*InsertBreakpoint.*from '@mui/icons-material'" --include="*.js" --include="*.jsx" "$FRONTEND_DIR/src" | wc -l)
  echo "| Invalid icon imports | $icon_issues |" >> "$REPORT_FILE"
  
  # Run a quick compilation check
  echo "" >> "$REPORT_FILE"
  echo "## Quick Compilation Check" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "Running quick compilation check..." >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
  
  # Run the check script if available, capture only the summary
  if [ -f "$SCRIPT_DIR/compile_check.sh" ]; then
    bash "$SCRIPT_DIR/compile_check.sh" | grep -v "=======" | grep -v "-------" | tail -10 >> "$REPORT_FILE"
  else
    echo "compile_check.sh script not found" >> "$REPORT_FILE"
  fi
  echo "\`\`\`" >> "$REPORT_FILE"
  
  echo "" >> "$REPORT_FILE"
  echo "## Recommendations" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "1. Run the full error fix script: \`./error_manager.sh fix\`" >> "$REPORT_FILE"
  echo "2. Verify the fixes with: \`./error_manager.sh check\`" >> "$REPORT_FILE"
  echo "3. Try running npm commands after fixes are applied" >> "$REPORT_FILE"
  
  echo "📊 Report generated: $REPORT_FILE"
}

# Main command processing
case "$1" in
  check)
    run_check
    ;;
  fix)
    run_fix
    ;;
  status)
    show_status
    ;;
  report)
    generate_report
    ;;
  help|--help|-h|"")
    print_help
    ;;
  *)
    echo "Unknown command: $1"
    print_help
    exit 1
    ;;
esac

exit 0