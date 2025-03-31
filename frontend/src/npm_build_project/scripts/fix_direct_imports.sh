#!/bin/bash
# Script to fix direct component imports from design-system paths

echo "Fixing direct component imports..."

# Find files with direct design-system imports excluding adapter
FILES_TO_FIX=$(grep -r "import {.*} from '../../design-system/components" --include="*.jsx" src/components/ | grep -v adapter | cut -d':' -f1 | sort -u)

# Show which files will be modified
echo "Files to fix:"
for FILE in $FILES_TO_FIX; do
  echo "- $FILE"
done

echo ""
echo "Proceeding with fixes..."
echo ""

# Convert each file's imports to use adapter
for FILE in $FILES_TO_FIX; do
  echo "Processing $FILE"
  
  # Replace direct imports with adapter imports
  sed -i 's|import { \(.*\) } from '\''../../design-system/components/.*|\import { \1 } from '\''../../design-system/adapter'\''|g' "$FILE"
done

echo "Completed fixing component imports."