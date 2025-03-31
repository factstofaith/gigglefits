/**
 * Remove Deprecated Components
 * 
 * This script identifies and removes deprecated components from the codebase.
 * It targets components that are duplicated, marked as legacy, or no longer used.
 * 
 * Usage: node remove-deprecated.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `deprecated-components-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const DRY_RUN = process.argv.includes('--dry-run');

// Components known to be deprecated (based on git status and file analysis)
const DEPRECATED_COMPONENTS = [
  // Components marked as removed in git status
  'frontend/src/components/common/AlertBox.jsx',
  'frontend/src/components/common/AuthModal.jsx',
  'frontend/src/components/common/Badge.jsx',
  'frontend/src/components/common/Card.jsx',
  'frontend/src/components/common/ChatSupportPanel.jsx',
  'frontend/src/components/common/DashboardCard.jsx',
  'frontend/src/components/common/ErrorBoundary.jsx',
  'frontend/src/components/common/Footer.jsx',
  'frontend/src/components/common/Logo.jsx',
  'frontend/src/components/common/OptimizedToast.jsx',
  'frontend/src/components/common/PageHeader.jsx',
  'frontend/src/components/common/PortalModal.jsx',
  'frontend/src/components/common/ProgressBar.jsx',
  
  // Design system adapted components (replaced by central adapter)
  'frontend/src/design-system/adapted/core/ButtonAdapted.jsx',
  'frontend/src/design-system/adapted/display/CardAdapted.jsx',
  'frontend/src/design-system/adapted/display/CardContentAdapted.jsx',
  'frontend/src/design-system/adapted/display/TableAdapted.jsx',
  'frontend/src/design-system/adapted/display/TypographyAdapted.jsx',
  'frontend/src/design-system/adapted/feedback/AlertAdapted.jsx',
  'frontend/src/design-system/adapted/feedback/ModalAdapted.jsx',
  'frontend/src/design-system/adapted/form/CheckboxAdapted.jsx',
  'frontend/src/design-system/adapted/form/TextFieldAdapted.jsx',
  'frontend/src/design-system/adapted/navigation/LinkAdapted.jsx',
  'frontend/src/design-system/adapted/navigation/TabsAdapted.jsx',
];

// Custom patterns to identify deprecated components
const DEPRECATED_PATTERNS = [
  // Files with "Legacy" in the name
  /Legacy/,
  // Files with "Deprecated" or "deprecated" in the content
  /\/\*\s*@deprecated\s*\*\//,
  /\/\/\s*@deprecated/,
  // Files in archive directories
  /\/archive\//,
  // Files in cleanup directories
  /\/cleanup-archive\//,
];

// Create backup directory
if (!DRY_RUN) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
}

// Function to check if a file is still imported anywhere
function isFileImported(filePath) {
  try {
    const relativePath = path.relative(path.resolve(__dirname, '../../..'), filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Try to find imports of this file
    const grepCmd = `grep -r --include="*.{js,jsx}" "import.*${fileName}\\|require.*${fileName}" ${ROOT_DIR}`;
    const result = execSync(grepCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    
    // Check if file is imported (excluding self-imports)
    const imports = result.split('\n').filter(line => {
      return line && !line.includes(relativePath);
    });
    
    return imports.length > 0;
  } catch (error) {
    // If grep returns non-zero (no matches), file is not imported
    return false;
  }
}

// Function to backup and remove a file
function removeFile(filePath, reason) {
  const relativePath = path.relative(path.resolve(__dirname, '../../..'), filePath);
  
  if (DRY_RUN) {
    console.log(`🔍 [DRY RUN] Would remove: ${relativePath} (${reason})`);
    return true;
  }
  
  try {
    // Create backup
    const backupPath = path.join(BACKUP_DIR, relativePath);
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.copyFileSync(filePath, backupPath);
    
    // Remove file
    fs.unlinkSync(filePath);
    console.log(`🗑️ Removed: ${relativePath} (${reason})`);
    return true;
  } catch (error) {
    console.error(`❌ Error removing ${relativePath}:`, error.message);
    return false;
  }
}

// Find all components
const jsxFiles = glob.sync(`${ROOT_DIR}/**/*.{js,jsx}`);
console.log(`🔍 Found ${jsxFiles.length} component files to analyze...`);

// Track removal statistics
const removedFiles = {
  explicitlyDeprecated: 0,
  matchedPattern: 0,
  notImported: 0,
  total: 0
};

// Process explicitly deprecated components
if (DEPRECATED_COMPONENTS.length > 0) {
  console.log('\n🔍 Processing explicitly deprecated components...');
  
  DEPRECATED_COMPONENTS.forEach(componentPath => {
    const fullPath = path.resolve(__dirname, '../../..', componentPath);
    
    if (fs.existsSync(fullPath)) {
      if (removeFile(fullPath, 'explicitly deprecated')) {
        removedFiles.explicitlyDeprecated++;
        removedFiles.total++;
      }
    }
  });
}

// Process components matching deprecated patterns
console.log('\n🔍 Processing components matching deprecated patterns...');

jsxFiles.forEach(filePath => {
  // Skip files that have already been processed
  const relativePath = path.relative(path.resolve(__dirname, '../../..'), filePath);
  if (DEPRECATED_COMPONENTS.some(depPath => relativePath.endsWith(depPath))) {
    return;
  }
  
  // Check if file matches a deprecated pattern
  let isDeprecated = false;
  let pattern = '';
  
  // Check filename patterns
  for (const depPattern of DEPRECATED_PATTERNS) {
    if (depPattern.test(filePath)) {
      isDeprecated = true;
      pattern = depPattern.toString();
      break;
    }
  }
  
  // Check file content if not already marked deprecated
  if (!isDeprecated) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const depPattern of DEPRECATED_PATTERNS) {
        if (depPattern.test(content)) {
          isDeprecated = true;
          pattern = depPattern.toString();
          break;
        }
      }
    } catch (error) {
      // Skip if can't read file
    }
  }
  
  // Remove if deprecated
  if (isDeprecated) {
    if (removeFile(filePath, `matched pattern ${pattern}`)) {
      removedFiles.matchedPattern++;
      removedFiles.total++;
    }
    return;
  }
  
  // Check if file is not imported anywhere (except for entry files)
  const isEntryFile = filePath.includes('/index.') || 
                     filePath.includes('/App.') || 
                     filePath.includes('/main.');
  
  if (!isEntryFile && !isFileImported(filePath)) {
    if (removeFile(filePath, 'not imported anywhere')) {
      removedFiles.notImported++;
      removedFiles.total++;
    }
  }
});

// Report results
console.log('\n📊 Removal Summary:');
console.log(`- Explicitly deprecated: ${removedFiles.explicitlyDeprecated}`);
console.log(`- Matched deprecated pattern: ${removedFiles.matchedPattern}`);
console.log(`- Not imported anywhere: ${removedFiles.notImported}`);
console.log(`- Total removed: ${removedFiles.total} of ${jsxFiles.length} files`);

if (DRY_RUN) {
  console.log('\n⚠️ This was a dry run. No files were actually removed.');
  console.log('To perform the actual removal, run the script without --dry-run');
} else {
  console.log(`\n✅ Deprecated components have been backed up to: ${BACKUP_DIR}`);
}

// Provide suggestions for next steps
console.log('\nNext steps:');
console.log('1. Run the build to verify no critical components were removed');
console.log('2. Update the Technical Debt Elimination Tracker in ClaudeContext.md');
console.log('3. Run the transform-components.js script to update remaining components');