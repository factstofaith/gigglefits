#\!/bin/bash

AUDIT_DIR="./deep_audit"
mkdir -p $AUDIT_DIR

echo "=== Deep File Usage Audit ==="
echo "Starting comprehensive analysis..."

# 1. LEGACY COMPONENTS ANALYSIS
echo "=== LEGACY COMPONENTS ANALYSIS ===" > $AUDIT_DIR/legacy_analysis.txt
find ./frontend/src -name "*Legacy*.jsx" | while read file; do
  component=$(basename "$file" | sed 's/\.jsx$//')
  echo "-----------------------------------" >> $AUDIT_DIR/legacy_analysis.txt
  echo "Component: $component ($file)" >> $AUDIT_DIR/legacy_analysis.txt
  
  # Check direct imports
  import_count=$(grep -r "import.*$component" --include="*.js*" ./frontend/src | grep -v "test" | grep -v "standalone" | wc -l)
  echo "Direct imports (non-test): $import_count" >> $AUDIT_DIR/legacy_analysis.txt
  
  # Check JSX usage
  jsx_usage=$(grep -r "<$component" --include="*.js*" ./frontend/src | grep -v "test" | grep -v "standalone" | wc -l)
  echo "JSX usage (non-test): $jsx_usage" >> $AUDIT_DIR/legacy_analysis.txt
  
  # Check if adapted version exists
  adapted_version=$(find ./frontend/src -name "$(echo $component | sed 's/Legacy/Adapted/')*.jsx")
  if [ \! -z "$adapted_version" ]; then
    echo "Adapted version exists: $(basename "$adapted_version")" >> $AUDIT_DIR/legacy_analysis.txt
  else
    echo "No adapted version found" >> $AUDIT_DIR/legacy_analysis.txt
  fi
  
  if [[ $import_count -eq 0 && $jsx_usage -eq 0 ]]; then
    echo "STATUS: UNUSED in production code" >> $AUDIT_DIR/legacy_analysis.txt
  else
    echo "STATUS: ACTIVE in production code" >> $AUDIT_DIR/legacy_analysis.txt
  fi
done

# 2. ADAPTED COMPONENTS ANALYSIS
echo "=== ADAPTED COMPONENTS ANALYSIS ===" > $AUDIT_DIR/adapted_analysis.txt
find ./frontend/src -name "*Adapted*.jsx" | grep -v "__tests__" | while read file; do
  component=$(basename "$file" | sed 's/\.jsx$//')
  echo "-----------------------------------" >> $AUDIT_DIR/adapted_analysis.txt
  echo "Component: $component ($file)" >> $AUDIT_DIR/adapted_analysis.txt
  
  # Check direct imports
  import_count=$(grep -r "import.*$component" --include="*.js*" ./frontend/src | grep -v "test" | grep -v "$file" | wc -l)
  echo "Direct imports: $import_count" >> $AUDIT_DIR/adapted_analysis.txt
  
  # Check JSX usage
  jsx_usage=$(grep -r "<$component" --include="*.js*" ./frontend/src | grep -v "test" | grep -v "$file" | wc -l)
  echo "JSX usage: $jsx_usage" >> $AUDIT_DIR/adapted_analysis.txt
  
  if [[ $import_count -eq 0 && $jsx_usage -eq 0 ]]; then
    echo "STATUS: POTENTIALLY UNUSED" >> $AUDIT_DIR/adapted_analysis.txt
  else
    echo "STATUS: ACTIVE" >> $AUDIT_DIR/adapted_analysis.txt
  fi
done

# 3. CLEANUP ARCHIVE VALIDATION
echo "=== CLEANUP ARCHIVE VALIDATION ===" > $AUDIT_DIR/archive_validation.txt
find ./frontend/src/cleanup-archive -type f | grep -v "README.md" | while read file; do
  filename=$(basename "$file")
  echo "-----------------------------------" >> $AUDIT_DIR/archive_validation.txt
  echo "File: $file" >> $AUDIT_DIR/archive_validation.txt
  
  # Check if file exists outside archive
  similar_files=$(find ./frontend/src -path "./frontend/src/cleanup-archive" -prune -o -name "$filename" -print)
  if [ \! -z "$similar_files" ]; then
    echo "DUPLICATE EXISTS outside archive: $similar_files" >> $AUDIT_DIR/archive_validation.txt
  else
    echo "No duplicate outside archive" >> $AUDIT_DIR/archive_validation.txt
  fi
  
  # Check for imports of this file
  base_name=$(basename "$file" | sed 's/\.[^.]*$//')
  import_count=$(grep -r "import.*$base_name" --include="*.js*" ./frontend/src | grep -v "cleanup-archive" | wc -l)
  if [ $import_count -gt 0 ]; then
    echo "WARNING: Archived file still imported ($import_count times)" >> $AUDIT_DIR/archive_validation.txt
  else
    echo "Not imported outside archive (safe)" >> $AUDIT_DIR/archive_validation.txt
  fi
done

# 4. ORPHANED TEST FILES
echo "=== ORPHANED TEST FILES ===" > $AUDIT_DIR/orphaned_tests.txt
find ./frontend/src -name "*.test.js*" -o -name "*.spec.js*" | while read test_file; do
  # Skip files in node_modules
  if [[ "$test_file" == *"node_modules"* ]]; then continue; fi
  
  impl_file=$(echo "$test_file" | sed 's/\.test\.|\.spec\././')
  if [ \! -f "$impl_file" ]; then
    echo "$test_file (missing: $impl_file)" >> $AUDIT_DIR/orphaned_tests.txt
  fi
done

# 5. DESIGN SYSTEM DEEP ANALYSIS
echo "=== DESIGN SYSTEM DEEP ANALYSIS ===" > $AUDIT_DIR/design_system_analysis.txt

# Analyze legacy components
echo "Legacy components in design-system: $(find ./frontend/src/design-system/legacy -type f | wc -l)" >> $AUDIT_DIR/design_system_analysis.txt
echo "Legacy components used in production: $(grep -r 'import.*Legacy' --include="*.js*" ./frontend/src | grep -v 'test' | grep -v 'standalone' | grep -v 'design-system/legacy' | wc -l)" >> $AUDIT_DIR/design_system_analysis.txt

# Analyze adapted components
echo "Adapted components in design-system: $(find ./frontend/src/design-system/adapted -name "*.jsx" | grep -v "__tests__" | wc -l)" >> $AUDIT_DIR/design_system_analysis.txt
echo "Adapted components used in production: $(grep -r 'import.*Adapted' --include="*.js*" ./frontend/src | grep -v 'test' | grep -v 'design-system/adapted' | wc -l)" >> $AUDIT_DIR/design_system_analysis.txt

# Look for imports from the design-system by directory
echo "" >> $AUDIT_DIR/design_system_analysis.txt
echo "Design system import patterns:" >> $AUDIT_DIR/design_system_analysis.txt
grep -r 'import.*design-system' --include="*.js*" ./frontend/src | grep -v 'test' | grep -v 'standalone' | grep -v 'design-system/' | awk -F 'from' '{print $2}' | sort | uniq -c | sort -nr >> $AUDIT_DIR/design_system_analysis.txt

# 6. LARGE/OLD FILES ANALYSIS
echo "=== LARGE FILES ANALYSIS ===" > $AUDIT_DIR/large_files_analysis.txt
echo "Files > 1MB excluding node_modules, venv, .git:" >> $AUDIT_DIR/large_files_analysis.txt
find . -type f -size +1M -not -path "*/node_modules/*" -not -path "*/venv/*" -not -path "*/.git/*" | xargs ls -lh | sort -k5hr >> $AUDIT_DIR/large_files_analysis.txt

# 7. GENERATE SUMMARY REPORT
echo "=== STALE FILES SUMMARY ===" > $AUDIT_DIR/summary_report.txt
echo "1. Legacy Components:" >> $AUDIT_DIR/summary_report.txt
echo "   Total found: $(find ./frontend/src -name "*Legacy*.jsx" | wc -l)" >> $AUDIT_DIR/summary_report.txt
echo "   Unused in production: $(grep -c "STATUS: UNUSED" $AUDIT_DIR/legacy_analysis.txt)" >> $AUDIT_DIR/summary_report.txt

echo "2. Adapted Components:" >> $AUDIT_DIR/summary_report.txt
echo "   Total found: $(find ./frontend/src -name "*Adapted*.jsx" | grep -v "__tests__" | wc -l)" >> $AUDIT_DIR/summary_report.txt
echo "   Potentially unused: $(grep -c "STATUS: POTENTIALLY UNUSED" $AUDIT_DIR/adapted_analysis.txt)" >> $AUDIT_DIR/summary_report.txt

echo "3. Cleanup Archive:" >> $AUDIT_DIR/summary_report.txt
echo "   Total archived files: $(find ./frontend/src/cleanup-archive -type f | grep -v "README.md" | wc -l)" >> $AUDIT_DIR/summary_report.txt
echo "   Archived files with duplicates outside: $(grep -c "DUPLICATE EXISTS" $AUDIT_DIR/archive_validation.txt)" >> $AUDIT_DIR/summary_report.txt
echo "   Archived files still imported: $(grep -c "WARNING: Archived file still imported" $AUDIT_DIR/archive_validation.txt)" >> $AUDIT_DIR/summary_report.txt

echo "4. Orphaned Test Files:" >> $AUDIT_DIR/summary_report.txt
echo "   Total found: $(wc -l < $AUDIT_DIR/orphaned_tests.txt)" >> $AUDIT_DIR/summary_report.txt

echo "5. Design System:" >> $AUDIT_DIR/summary_report.txt
echo "   Legacy components: $(find ./frontend/src/design-system/legacy -type f | wc -l)" >> $AUDIT_DIR/summary_report.txt
echo "   Adapted components: $(find ./frontend/src/design-system/adapted -name "*.jsx" | grep -v "__tests__" | wc -l)" >> $AUDIT_DIR/summary_report.txt

echo "6. Large Files:" >> $AUDIT_DIR/summary_report.txt
echo "   Files > 1MB: $(wc -l < $AUDIT_DIR/large_files_analysis.txt)" >> $AUDIT_DIR/summary_report.txt

echo "Deep audit completed. Results in $AUDIT_DIR/"
echo "For a summary of findings, check $AUDIT_DIR/summary_report.txt"
