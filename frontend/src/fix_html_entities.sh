#!/bin/bash

# Script to replace HTML entities with their character equivalents in JSX files
# This addresses the ESLint rule "react/no-unescaped-entities" properly

echo "Fixing HTML entities in JSX files..."

# Function to safely process files
function process_file() {
  local file=$1
  
  # Create a backup just in case
  cp "$file" "${file}.entity.bak"
  
  # Replace common HTML entities with actual characters
  # &apos; -> '
  # &quot; -> "
  # &amp; -> &
  # &lt; -> <
  # &gt; -> >
  sed -i \
    -e 's/&apos;/\x27/g' \
    -e 's/&quot;/\x22/g' \
    -e 's/&amp;/\&/g' \
    -e 's/&lt;/</g' \
    -e 's/&gt;/>/g' \
    "$file"
  
  echo "Fixed entities in $file"
}

# Find all JSX files with HTML entities
echo "Searching for files with HTML entities..."

# Process files with &apos;
files_with_apos=$(grep -l "&apos;" --include="*.jsx" --include="*.js" -r src/)
for file in $files_with_apos; do
  process_file "$file"
done

# Process files with &quot;
files_with_quot=$(grep -l "&quot;" --include="*.jsx" --include="*.js" -r src/)
for file in $files_with_quot; do
  # Skip if already processed
  if [[ ! -f "${file}.entity.bak" ]]; then
    process_file "$file"
  fi
done

echo "Completed fixing HTML entities in all files."
echo "Backup files with .entity.bak extension were created."