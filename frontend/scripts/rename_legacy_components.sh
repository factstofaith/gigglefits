#!/bin/bash

# This script renames all "legacy" components to "adapted" components
# It's part of the high-priority design system completion phase

# Set base directory
BASE_DIR="/home/ai-dev/Desktop/tap-integration-platform/frontend"
DESIGN_SYS_DIR="${BASE_DIR}/src/design-system"

# Print informational message
echo "==== Design System Component Renaming ===="
echo "This script will rename \"legacy\" components to \"adapted\" components"
echo "Base directory: ${BASE_DIR}"
echo ""

# 1. Create adapted directory structure
echo "Creating adapted directory structure..."
mkdir -p "${DESIGN_SYS_DIR}/adapted"
mkdir -p "${DESIGN_SYS_DIR}/adapted/form"
mkdir -p "${DESIGN_SYS_DIR}/adapted/layout"
mkdir -p "${DESIGN_SYS_DIR}/adapted/feedback"
mkdir -p "${DESIGN_SYS_DIR}/adapted/navigation"
mkdir -p "${DESIGN_SYS_DIR}/adapted/display"
echo "✓ Directory structure created"
echo ""

# 2. Copy and rename legacy component files
echo "Copying and renaming legacy components..."
LEGACY_FILES=$(find "${DESIGN_SYS_DIR}/legacy" -name "*Legacy.jsx" -type f)
LEGACY_COUNT=$(echo "${LEGACY_FILES}" | wc -l)
echo "Found ${LEGACY_COUNT} legacy component files to rename."

for file in ${LEGACY_FILES}; do
  filename=$(basename "${file}")
  new_filename=$(echo "${filename}" | sed 's/Legacy/Adapted/g')
  component_type=$(echo "${filename}" | sed 's/Legacy.jsx//' | tr '[:upper:]' '[:lower:]')
  
  # Determine directory based on component type
  if [[ "${filename}" == *"Button"* || "${filename}" == *"Typography"* ]]; then
    target_dir="${DESIGN_SYS_DIR}/adapted/core"
  elif [[ "${filename}" == *"TextField"* || "${filename}" == *"Select"* || "${filename}" == *"Checkbox"* || "${filename}" == *"Radio"* ]]; then
    target_dir="${DESIGN_SYS_DIR}/adapted/form"
  elif [[ "${filename}" == *"Box"* || "${filename}" == *"Grid"* || "${filename}" == *"Card"* ]]; then
    target_dir="${DESIGN_SYS_DIR}/adapted/layout"
  elif [[ "${filename}" == *"Alert"* || "${filename}" == *"Dialog"* || "${filename}" == *"Snackbar"* || "${filename}" == *"Progress"* ]]; then
    target_dir="${DESIGN_SYS_DIR}/adapted/feedback"
  elif [[ "${filename}" == *"Tabs"* || "${filename}" == *"Menu"* || "${filename}" == *"Drawer"* ]]; then
    target_dir="${DESIGN_SYS_DIR}/adapted/navigation"
  else
    target_dir="${DESIGN_SYS_DIR}/adapted/display"
  fi

  # Create target directory if it doesn't exist
  mkdir -p "${target_dir}"
  
  # Copy the file with new name
  new_file="${target_dir}/${new_filename}"
  cp "${file}" "${new_file}"
  
  # Update content to use "Adapted" instead of "Legacy"
  sed -i 's/Legacy/Adapted/g' "${new_file}"
  
  echo "  ✓ Copied ${filename} to ${new_file}"
done
echo "✓ Component files copied and renamed"
echo ""

# 3. Update internal references in adapted components
echo "Updating internal references in adapted components..."
find "${DESIGN_SYS_DIR}/adapted" -name "*.jsx" -type f -exec sed -i 's/from "\.\.\/legacy/from "\.\.\/adapted/g' {} \;
find "${DESIGN_SYS_DIR}/adapted" -name "*.jsx" -type f -exec sed -i "s/from '\.\.\\/legacy/from '\.\.\\/adapted/g" {} \;
find "${DESIGN_SYS_DIR}/adapted" -name "*.jsx" -type f -exec sed -i 's/ds-.*-legacy/ds-\1-adapted/g' {} \;
echo "✓ Internal references updated"
echo ""

# 4. Create adapted/index.js exports
echo "Creating adapted/index.js exports..."
ADAPTED_FILES=$(find "${DESIGN_SYS_DIR}/adapted" -name "*Adapted.jsx" -type f)

cat > "${DESIGN_SYS_DIR}/adapted/index.js" << EOF
/**
 * Adapted components
 * 
 * These components adapt Material UI components to work consistently with
 * our design system, serving as a bridge during the migration process.
 */

// Adapted components exports
EOF

for file in ${ADAPTED_FILES}; do
  filename=$(basename "${file}")
  component_name=$(echo "${filename}" | sed 's/Adapted.jsx//')
  echo "export { default as ${component_name}Adapted } from './${filename%.jsx}';" >> "${DESIGN_SYS_DIR}/adapted/index.js"
done
echo "✓ Created adapted/index.js exports"
echo ""

# 5. Update adapter.js to use adapted components
echo "Updating adapter.js..."
sed -i 's/from "\.\/legacy/from "\.\/adapted/g' "${DESIGN_SYS_DIR}/adapter.js"
sed -i "s/from '\.\\/legacy/from '\.\\/adapted/g" "${DESIGN_SYS_DIR}/adapter.js"
sed -i 's/Legacy/Adapted/g' "${DESIGN_SYS_DIR}/adapter.js"
echo "✓ Updated adapter.js"
echo ""

# 6. Update application imports
echo "Updating application component imports..."
APP_IMPORTS=$(grep -r "import.*Legacy" --include="*.jsx" "${BASE_DIR}/src/" | grep -v "design-system/legacy" | wc -l)
echo "Found ${APP_IMPORTS} import statements to update."

find "${BASE_DIR}/src" -name "*.jsx" -not -path "*/design-system/legacy/*" -not -path "*/design-system/adapted/*" -exec sed -i 's/Legacy/Adapted/g' {} \;
find "${BASE_DIR}/src" -name "*.jsx" -not -path "*/design-system/legacy/*" -not -path "*/design-system/adapted/*" -exec sed -i 's/from "\.\.\/\.\.\/design-system\/legacy/from "\.\.\/\.\.\/design-system\/adapted/g' {} \;
find "${BASE_DIR}/src" -name "*.jsx" -not -path "*/design-system/legacy/*" -not -path "*/design-system/adapted/*" -exec sed -i "s/from '\.\.\\/\.\.\\/design-system\\/legacy/from '\.\.\\/\.\.\\/design-system\\/adapted/g" {} \;
echo "✓ Updated application imports"
echo ""

# 7. Verify no legacy references remain
echo "Verifying successful renaming..."
REMAINING=$(grep -r "Legacy" --include="*.jsx" "${BASE_DIR}/src/" | grep -v "design-system/legacy" | wc -l)
if [ ${REMAINING} -eq 0 ]; then
  echo "✓ Renaming successful! No legacy references remain."
else
  echo "⚠ ${REMAINING} legacy references still remain. Manual cleanup required."
fi

# Summary
echo ""
echo "==== Renaming Complete ===="
echo "Renamed ${LEGACY_COUNT} legacy components to adapted components"
echo "Updated application imports in ${APP_IMPORTS} files"
echo ""
echo "Next steps:"
echo "1. Run build to verify changes"
echo "2. Begin component API standardization"
echo "3. Implement performance optimizations"
echo ""

# Exit
exit 0