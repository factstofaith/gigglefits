#!/bin/bash

# Script to fix Dialog component imports that directly reference components/feedback/Dialog
# rather than using the design system adapter

echo "Fixing Dialog component imports across the codebase..."
SRC_DIR="/home/ai-dev/Desktop/tap-integration-platform/frontend/src"

# Find all files that import Dialog directly from the components/feedback path
FILES_TO_FIX=$(grep -l "import.*Dialog.*from '.*feedback/Dialog'" --include="*.jsx" --include="*.js" -r $SRC_DIR | grep -v "node_modules" | grep -v "coverage" | grep -v "design-system/index.js" | grep -v "design-system/legacy/DialogLegacy.jsx")

# Exit if no files found
if [ -z "$FILES_TO_FIX" ]; then
  echo "No files with incorrect Dialog imports found."
  exit 0
fi

# Count of files to fix
FILE_COUNT=$(echo "$FILES_TO_FIX" | wc -l)
echo "Found $FILE_COUNT files with incorrect Dialog imports."

# Fix each file
for FILE in $FILES_TO_FIX; do
  echo "Fixing imports in $FILE"
  
  # Replace direct import with design-system/adapter import
  # This handles both the specific component import and any other components imported alongside it
  sed -i 's|import { \(.*\)Dialog\(.*\) } from .*/components/feedback/Dialog.*|import { \1Dialog\2 } from "../../design-system/adapter";|g' "$FILE"
  sed -i 's|import Dialog from .*/components/feedback/Dialog.*|import { Dialog } from "../../design-system/adapter";|g' "$FILE"
  
  # Fix any broken imports from the same line
  sed -i 's|import { \(.*\), Dialog, \(.*\) } from .*/components/feedback/Dialog.*|import { \1, Dialog, \2 } from "../../design-system/adapter";|g' "$FILE"
done

echo "Completed fixing Dialog imports in $FILE_COUNT files."
echo "Please review the changes and run tests to ensure everything works correctly."