#\!/bin/bash

# Create output directory
mkdir -p ./audit_results

echo "Running comprehensive file usage audit..."

# 1. Find potential frontend component files that don't seem to be imported
echo "Identifying potentially unused frontend components..."
find ./frontend/src/components -type f \( -name "*.jsx" -o -name "*.tsx" \) | while read file; do
  base_name=$(basename "$file" | sed 's/\.[^.]*$//')
  # Skip index files, they're entry points
  if [[ "$base_name" == "index" ]]; then continue; fi
  
  # Check if it's imported anywhere
  import_count=$(grep -r --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" "import.*${base_name}" ./frontend/src | grep -v "$file" | wc -l)
  if [ $import_count -eq 0 ]; then
    echo "$file" >> ./audit_results/unused_frontend_components.txt
  fi
done

# 2. Find utility files that aren't imported
echo "Identifying potentially unused utility files..."
find ./frontend/src/utils -type f \( -name "*.js" -o -name "*.ts" \) | while read file; do
  base_name=$(basename "$file" | sed 's/\.[^.]*$//')
  # Skip index files
  if [[ "$base_name" == "index" ]]; then continue; fi
  
  # Check if it's imported anywhere
  import_count=$(grep -r --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" "import.*${base_name}" ./frontend/src | grep -v "$file" | wc -l)
  if [ $import_count -eq 0 ]; then
    echo "$file" >> ./audit_results/unused_frontend_utils.txt
  fi
done

# 3. Find backend modules that aren't imported
echo "Identifying potentially unused backend modules..."
find ./backend -type f -name "*.py" | grep -v "__pycache__" | grep -v "/test/" | while read file; do
  module_name=$(basename "$file" | sed 's/\.py$//')
  # Skip special files
  if [[ "$module_name" == "__init__" || "$module_name" == "main" ]]; then continue; fi
  
  # Check if it's imported anywhere
  import_count=$(grep -r --include="*.py" -E "import $module_name|from .*$module_name import" ./backend | grep -v "$file" | wc -l)
  if [ $import_count -eq 0 ]; then
    echo "$file" >> ./audit_results/unused_backend_modules.txt
  fi
done

# 4. Find old docs that might be outdated (using filename patterns that suggest they might be old)
echo "Identifying potentially outdated documentation..."
find . -type f -name "*README*.md" -o -name "*GUIDE*.md" -o -name "*OVERVIEW*.md" -o -name "*NOTES*.md" | grep -v "README.md" > ./audit_results/potential_outdated_docs.txt

# 5. Find CSS files that might not be imported
echo "Identifying potentially unused CSS files..."
find ./frontend -type f -name "*.css" | while read file; do
  base_name=$(basename "$file")
  import_count=$(grep -r --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" "import.*${base_name}" ./frontend/src | wc -l)
  if [ $import_count -eq 0 ]; then
    echo "$file" >> ./audit_results/unused_css_files.txt
  fi
done

echo "Audit complete. Results saved to ./audit_results/"
