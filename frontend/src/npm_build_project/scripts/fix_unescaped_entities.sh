#!/bin/bash
# Script to fix unescaped entities in JSX

echo "Fixing unescaped entities in JSX files..."

# Find files with unescaped quotes
FILES_TO_FIX=$(grep -r "react/no-unescaped-entities" --include="*.jsx" src/components/ | cut -d':' -f1 | sort -u)

# If no files found with grep, try using ESLint directly
if [ -z "$FILES_TO_FIX" ]; then
  echo "Searching for files with ESLint..."
  FILES_TO_FIX=$(npx eslint src/ --quiet --rule 'react/no-unescaped-entities:2' --ext .js,.jsx 2>&1 | grep -o 'src/.*\.jsx' | sort -u)
fi

# Show which files will be modified
echo "Files to fix:"
for FILE in $FILES_TO_FIX; do
  echo "- $FILE"
done

echo ""
echo "Proceeding with fixes..."
echo ""

# Fix unescaped quotes
for FILE in $FILES_TO_FIX; do
  echo "Processing $FILE"
  
  # Create a backup
  cp "$FILE" "${FILE}.bak"
  
  # Replace standalone double quotes with &quot;
  sed -i 's/\([^\\]\)"/\1\&quot;/g' "$FILE"
  
  # Replace standalone single quotes with &apos;
  sed -i "s/\([^\\]\)'/\1\&apos;/g" "$FILE"
  
  # Check if the file was modified correctly
  if ! grep -q "react/no-unescaped-entities" "$FILE"; then
    echo "✓ Successfully fixed $FILE"
  else
    echo "⚠️ May need manual attention: $FILE"
  fi
done

echo "Completed fixing unescaped entities."
echo "Original files are backed up with .bak extension."