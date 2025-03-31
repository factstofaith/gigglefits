#!/bin/bash

# Exit on error
set -e

# Display confirmation prompt
echo "This script will remove stale files from your codebase."
echo "All files will be backed up before removal."
read -p "Do you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Operation cancelled."
    exit 1
fi

# Create backup directory for safety
BACKUP_DIR="./stale_files_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR"

# 1. Remove backup files (creating a safety backup first)
echo "Backing up and removing .bak, .backup, .tmp files..."
find . -type f \( -name "*.bak" -o -name "*.backup" -o -name "*~" -o -name "*.tmp" -o -name "*.old" -o -name "*.orig" \) -not -path "./node_modules/*" -not -path "*/venv/*" | while read file; do
  # Create backup structure
  rel_path=$(echo "$file" | sed "s|^\./||")
  backup_path="$BACKUP_DIR/$rel_path"
  mkdir -p "$(dirname "$backup_path")"
  
  # Copy to backup
  cp -p "$file" "$backup_path"
  
  # Remove original
  rm "$file"
  echo "  Removed: $file"
done

# 2. Clean up already deleted files from git
echo "Removing deleted files from git tracking..."
git ls-files --deleted | while read file; do
  git rm "$file"
  echo "  Removed from git: $file"
done

# 3. Remove files from migrations_backup (after backing up)
echo "Backing up and removing migration backup files..."
if [ -d "./backend/db/migrations_backup" ]; then
  mkdir -p "$BACKUP_DIR/backend/db/migrations_backup"
  cp -rp ./backend/db/migrations_backup/* "$BACKUP_DIR/backend/db/migrations_backup/"
  rm -rf ./backend/db/migrations_backup
  echo "  Removed migrations_backup directory"
fi

# 4. Remove archived test files
echo "Backing up and removing archived test files..."
if [ -d "./frontend/src/tests/archive" ]; then
  mkdir -p "$BACKUP_DIR/frontend/src/tests/archive"
  cp -rp ./frontend/src/tests/archive/* "$BACKUP_DIR/frontend/src/tests/archive/"
  rm -rf ./frontend/src/tests/archive
  echo "  Removed tests/archive directory"
fi

# 5. Remove archived service files
echo "Backing up and removing archived service files..."
if [ -d "./frontend/src/services/archive" ]; then
  mkdir -p "$BACKUP_DIR/frontend/src/services/archive"
  cp -rp ./frontend/src/services/archive/* "$BACKUP_DIR/frontend/src/services/archive/"
  rm -rf ./frontend/src/services/archive
  echo "  Removed services/archive directory"
fi

# 6. Remove archived component files
echo "Backing up and removing archived component files..."
if [ -d "./frontend/src/components/integration/archive" ]; then
  mkdir -p "$BACKUP_DIR/frontend/src/components/integration/archive"
  cp -rp ./frontend/src/components/integration/archive/* "$BACKUP_DIR/frontend/src/components/integration/archive/"
  rm -rf ./frontend/src/components/integration/archive
  echo "  Removed components/integration/archive directory"
fi

# 7. Remove archived utility files
echo "Backing up and removing archived utility files..."
if [ -d "./frontend/src/utils/archive" ]; then
  mkdir -p "$BACKUP_DIR/frontend/src/utils/archive"
  cp -rp ./frontend/src/utils/archive/* "$BACKUP_DIR/frontend/src/utils/archive/"
  rm -rf ./frontend/src/utils/archive
  echo "  Removed utils/archive directory"
fi

# 8. Generate cleanup report
echo "Generating cleanup report..."
REPORT_FILE="stale_files_cleanup_report.md"
{
  echo "# Stale Files Cleanup Report"
  echo "Generated: $(date)"
  echo
  echo "## Summary of Removed Files"
  echo
  echo "All removed files were backed up to: $BACKUP_DIR"
  echo
  
  echo "### Removed Backup Files"
  find "$BACKUP_DIR" -type f -name "*.bak" -o -name "*.backup" -o -name "*~" -o -name "*.tmp" -o -name "*.old" -o -name "*.orig" | sort | while read file; do
    rel_path=$(echo "$file" | sed "s|$BACKUP_DIR/||")
    echo "- $rel_path"
  done
  echo
  
  echo "### Removed Deleted Git Files"
  echo "Files that were deleted but still tracked in git:"
  git ls-files --deleted | sort | while read file; do
    echo "- $file"
  done
  echo
  
  echo "### Removed Archive Directories"
  [ -d "$BACKUP_DIR/backend/db/migrations_backup" ] && echo "- backend/db/migrations_backup/"
  [ -d "$BACKUP_DIR/frontend/src/tests/archive" ] && echo "- frontend/src/tests/archive/"
  [ -d "$BACKUP_DIR/frontend/src/services/archive" ] && echo "- frontend/src/services/archive/"
  [ -d "$BACKUP_DIR/frontend/src/components/integration/archive" ] && echo "- frontend/src/components/integration/archive/"
  [ -d "$BACKUP_DIR/frontend/src/utils/archive" ] && echo "- frontend/src/utils/archive/"
  echo
  
  echo "## Recommendations"
  echo "1. Review the changes with \`git status\`"
  echo "2. Commit the changes with a descriptive message like \`git commit -m \"Remove stale files and cleanup codebase\"\`"
  echo "3. Consider adding patterns to .gitignore for future prevention:"
  echo "   ```"
  echo "   # Backup files"
  echo "   *.bak"
  echo "   *.backup"
  echo "   *~"
  echo "   *.tmp"
  echo "   *.old"
  echo "   *.orig"
  echo "   ```"
} > "$REPORT_FILE"

echo "Stale files cleanup complete. All removed files were backed up to: $BACKUP_DIR"
echo "Cleanup report generated: $REPORT_FILE"
echo "Verify changes with 'git status' and commit when satisfied."
