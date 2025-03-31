#\!/bin/bash

AUDIT_DIR="./quick_audit_results"
mkdir -p $AUDIT_DIR

echo "Quick File Usage Audit"
echo "====================="

# 1. Find duplicate files with the same functionality
echo "Looking for potential duplicate files..."
find ./frontend/src -type f -name "*Legacy*.jsx" > $AUDIT_DIR/legacy_components.txt
find ./frontend/src -type f -name "*Adapted*.jsx" > $AUDIT_DIR/adapted_components.txt
find ./frontend/src -type f -name "*Enhanced*.js" > $AUDIT_DIR/enhanced_utils.txt

# 2. Look for files in specific directories that suggest they might be old/stale
echo "Scanning for files in known stale directories..."
find ./frontend/src -path "*/archive/*" -type f > $AUDIT_DIR/archived_files.txt
find ./frontend/src -path "*/deprecated/*" -type f > $AUDIT_DIR/deprecated_files.txt
find ./frontend/src -path "*/old/*" -type f > $AUDIT_DIR/old_files.txt

# 3. Check for test-specific files that are not paired with implementation
echo "Scanning for orphaned test files..."
find ./frontend/src -name "*.test.js" -o -name "*.test.jsx" -o -name "*.spec.js" -o -name "*.spec.jsx" | while read test_file; do
  implementation_file=$(echo "$test_file" | sed 's/\.test\.|\.spec\././')
  if [ \! -f "$implementation_file" ]; then
    echo "$test_file" >> $AUDIT_DIR/orphaned_test_files.txt
  fi
done

# 4. Find migration files that are possibly old
echo "Checking for old migration files..."
find ./backend -path "*/migrations/*.py" | sort > $AUDIT_DIR/migration_files.txt

# Report counts
echo ""
echo "Summary of findings:"
for file in $AUDIT_DIR/*.txt; do
  if [ -f "$file" ]; then
    count=$(wc -l < "$file")
    name=$(basename "$file" .txt | tr '_' ' ')
    echo "- Found $count potential $name"
  fi
done

echo ""
echo "Full details available in $AUDIT_DIR/"
