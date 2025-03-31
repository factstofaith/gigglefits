#\!/bin/bash

# Create output directory
mkdir -p ./stale_analysis

# 1. Find deleted files in git status
echo "Finding deleted files from git status..."
git status | grep "deleted:" | sed "s/\s*deleted:\s*//" > ./stale_analysis/deleted_files.txt

# 2. Find duplicate/backup files by naming pattern
echo "Finding backup and temporary files..."
find . -type f -name "*.bak" -o -name "*.backup" -o -name "*~" -o -name "*.tmp" -o -name "*.old" -o -name "*.orig" > ./stale_analysis/backup_files.txt

# 3. Look for README or documentation files that might be outdated
echo "Finding potentially outdated documentation..."
find . -name "README-*.md" -o -name "*-README.md" > ./stale_analysis/potential_outdated_docs.txt

# 4. Look for files in directories called archive, backup, old, deprecated
echo "Finding files in archive/backup/deprecated directories..."
find . -path "*/archive/*" -o -path "*/backup/*" -o -path "*/old/*" -o -path "*/deprecated/*" > ./stale_analysis/archived_files.txt

# 5. Check for migrations that were moved to migrations_backup
echo "Finding potentially obsolete migration files..."
find ./backend -path "*/migrations_backup/*.py" > ./stale_analysis/obsolete_migrations.txt

echo "Stale file analysis complete. Check stale_analysis directory for results."
