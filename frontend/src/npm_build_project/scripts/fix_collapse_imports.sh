#!/bin/bash

# Script to fix Collapse component imports that directly reference @mui/material
# rather than using the design system adapter

echo "Fixing Collapse component imports across the codebase..."
SRC_DIR="/home/ai-dev/Desktop/tap-integration-platform/frontend/src"

# Find all files that import Collapse directly from MUI
FILES_TO_FIX=$(grep -l "import.*{.*Collapse.*}.*from ['|\"]@mui/material['|\"]" --include="*.jsx" --include="*.js" -r $SRC_DIR | grep -v "node_modules" | grep -v "coverage" | grep -v "design-system/adapter.js")

# Exit if no files found
if [ -z "$FILES_TO_FIX" ]; then
  echo "No files with direct Collapse imports found."
  exit 0
fi

# Count of files to fix
FILE_COUNT=$(echo "$FILES_TO_FIX" | wc -l)
echo "Found $FILE_COUNT files with direct Collapse imports."

# Fix each file
for FILE in $FILES_TO_FIX; do
  echo "Fixing imports in $FILE"
  
  # Extract the current MUI import line
  MUI_IMPORT_LINE=$(grep "import.*{.*Collapse.*}.*from ['|\"]@mui/material['|\"]" "$FILE")
  
  # Check if there is already a design system adapter import
  if grep -q "import.*from ['|\"].*design-system/adapter['|\"]" "$FILE"; then
    # If adapter is already imported, add Collapse to it
    sed -i 's/import {/import { Collapse,/g' "$FILE"
    # And remove Collapse from the MUI import
    sed -i 's/Collapse,\s*//g' "$FILE"
    sed -i 's/,\s*Collapse//g' "$FILE"
    sed -i 's/,\s*Collapse,/,/g' "$FILE"
    sed -i 's/{\s*Collapse\s*}/{ }/g' "$FILE"
    # Clean up empty imports
    sed -i 's/import { } from/\/\/ import { } from/g' "$FILE"
  else
    # Otherwise, add a new import for the adapter
    sed -i '1i import { Collapse } from "../../design-system/adapter";' "$FILE"
    # And remove Collapse from the MUI import
    sed -i 's/Collapse,\s*//g' "$FILE"
    sed -i 's/,\s*Collapse//g' "$FILE"
    sed -i 's/,\s*Collapse,/,/g' "$FILE"
    sed -i 's/{\s*Collapse\s*}/{ }/g' "$FILE"
    # Clean up empty imports
    sed -i 's/import { } from/\/\/ import { } from/g' "$FILE"
  fi
done

echo "Completed fixing Collapse imports in $FILE_COUNT files."
echo "Please review the changes and run tests to ensure everything works correctly."