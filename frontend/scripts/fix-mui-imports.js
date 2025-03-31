#!/usr/bin/env node
/**
 * Enhanced MUI Imports Fix Script
 * 
 * This script identifies and fixes problematic import patterns in React components:
 * 1. Duplicate component imports (from both MUI directly and design system adapter)
 * 2. Mixed import styles (destructured and direct imports from the same package)
 * 
 * It's designed to align with the ComprehensiveDevelopmentGuide principles:
 * - Only makes targeted, well-defined changes
 * - Maintains code standards and consistency
 * - Uses dry-run capability for safety
 * - Detailed logging and reporting
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Default settings
let sourceDir = path.resolve('./src');
let dryRun = true; // Default to dry run for safety
let verbose = false;
let logFile = null;

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  
  if (arg === '--src-dir' && i + 1 < process.argv.length) {
    sourceDir = path.resolve(process.argv[++i]);
  } else if (arg === '--run') {
    dryRun = false;
  } else if (arg === '--verbose') {
    verbose = true;
  } else if (arg === '--log' && i + 1 < process.argv.length) {
    logFile = path.resolve(process.argv[++i]);
  } else if (arg === '--help') {
    console.log(`
Enhanced MUI Imports Fix Script

This script systematically identifies and fixes problematic Material UI import patterns.
It targets duplicate imports and mixed import styles that cause build errors.

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --src-dir <path>      Path to source directory (default: ./src)
  --run                 Apply changes (without this, only a dry run is performed)
  --verbose             Show detailed information during processing
  --log <file>          Write detailed log to specified file
  --help                Show this help message

Examples:
  # Run in dry-run mode (preview only)
  node scripts/fix-mui-imports.js
  
  # Apply fixes to all detected issues
  node scripts/fix-mui-imports.js --run
  
  # Verbose output with detailed logging
  node scripts/fix-mui-imports.js --run --verbose --log mui-fixes.log
`);
    process.exit(0);
  }
}

// Configure logging
let logger = {
  log: console.log,
  info: (...args) => verbose && console.log(...args),
  warn: console.warn,
  error: console.error,
  changes: []
};

if (logFile) {
  const logStream = fs.createWriteStream(logFile, { flags: 'w' });
  const originalLog = logger.log;
  
  logger.log = (...args) => {
    const message = args.join(' ');
    logStream.write(message + '\n');
    originalLog(...args);
  };
  
  logger.logChanges = (file, type, details) => {
    logger.changes.push({ file, type, details });
    logStream.write(JSON.stringify({ file, type, details }) + '\n');
  };
}

// Main function to fix MUI import issues
async function fixMUIImports() {
  logger.log(chalk.blue('🔍 Finding and fixing problematic MUI imports...'));
  logger.log(chalk.blue(`Mode: ${dryRun ? 'DRY RUN (preview only)' : 'APPLY CHANGES'}`));
  
  // Get all JS/JSX files
  const files = getAllFilesRecursively(sourceDir, ['.js', '.jsx']);
  logger.log(chalk.blue(`Found ${files.length} JS/JSX files to scan`));
  
  let filesModified = 0;
  let issuesFixed = {
    duplicateImports: 0,
    mixedImportStyles: 0,
    materialUIImports: 0,
    directVsDestructured: 0
  };
  
  // Process each file
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    
    logger.info(`Processing ${relativePath}`);
    
    try {
      let content = fs.readFileSync(file, 'utf8');
      let originalContent = content;
      let fileModified = false;
      
      // Fix issues and track changes
      const issues = detectIssues(content);
      
      if (issues.length > 0) {
        logger.info(`  Found ${issues.length} issues in ${relativePath}`);
        
        // Apply fixes
        let fixResult = applyFixes(content, issues);
        if (fixResult.modified) {
          content = fixResult.content;
          fileModified = true;
          
          // Count fixed issues by type
          fixResult.fixes.forEach(fix => {
            issuesFixed[fix.type]++;
          });
          
          logger.info(`  Applied ${fixResult.fixes.length} fixes in ${relativePath}`);
          
          if (verbose) {
            fixResult.fixes.forEach(fix => {
              logger.info(`    - ${fix.type}: ${fix.details}`);
            });
          }
        }
      }
      
      // Write back the file if modified
      if (fileModified) {
        if (!dryRun) {
          fs.writeFileSync(file, content);
        }
        filesModified++;
        logger.log(chalk.green(`✅ ${dryRun ? 'Would fix' : 'Fixed'} ${relativePath}`));
        if (logFile) {
          logger.logChanges(relativePath, 'multiple', Object.entries(issuesFixed));
        }
      }
    } catch (err) {
      logger.error(`Error processing ${relativePath}:`, err);
    }
  }
  
  // Print summary
  logger.log(chalk.blue('\n=== MUI Import Fix Summary ===\n'));
  logger.log(`Files scanned: ${files.length}`);
  logger.log(`Files ${dryRun ? 'that would be modified' : 'modified'}: ${filesModified}`);
  logger.log('\nIssues fixed:');
  logger.log(`- Duplicate component imports: ${issuesFixed.duplicateImports}`);
  logger.log(`- Mixed import styles: ${issuesFixed.mixedImportStyles}`);
  logger.log(`- Direct Material UI imports: ${issuesFixed.materialUIImports}`);
  logger.log(`- Direct vs destructured conflicts: ${issuesFixed.directVsDestructured}`);
  
  if (dryRun) {
    logger.log(chalk.yellow('\nDRY RUN: No files were actually modified.'));
    logger.log(chalk.yellow('To apply these changes, run with the --run flag.'));
  }
  
  const totalIssues = Object.values(issuesFixed).reduce((sum, count) => sum + count, 0);
  if (totalIssues > 0) {
    logger.log(chalk.green(`\n✅ ${dryRun ? 'Would fix' : 'Successfully fixed'} ${totalIssues} issues in ${filesModified} files.`));
  } else {
    logger.log(chalk.yellow(`\n⚠️ No files ${dryRun ? 'would be modified' : 'were modified'}. No fixable issues were found.`));
  }
  
  return { filesModified, issuesFixed };
}

// Utility function to detect import issues in a file
function detectIssues(content) {
  const issues = [];
  
  // Pattern 1: Detect imports from @mui/material with destructuring
  const muiDestructuredImport = /import\s+{([^}]+)}\s+from\s+['"]@mui\/material['"];?/g;
  // Pattern 2: Detect direct component imports from @mui/material
  const muiDirectComponentImport = /import\s+(\w+)\s+from\s+['"]@mui\/material\/(\w+)['"];?/g;
  // Pattern 3: Detect imports from design-system/adapter
  const designSystemImport = /import\s+{([^}]+)}\s+from\s+['"](?:@design-system\/adapter|.*?design-system\/adapter)['"];?/g;
  
  // Collect all importers
  const importedComponentsByType = {
    muiDestructured: new Set(),
    muiDirect: new Map(),
    designSystem: new Set()
  };
  
  // Find Material UI destructured imports (@mui/material)
  let match;
  while ((match = muiDestructuredImport.exec(content)) !== null) {
    const components = match[1].split(',').map(c => c.trim());
    components.forEach(component => {
      // Handle 'as' renaming
      const actualName = component.split(' as ')[0].trim();
      importedComponentsByType.muiDestructured.add(actualName);
    });
  }
  
  // Find direct MUI component imports (@mui/material/Component)
  while ((match = muiDirectComponentImport.exec(content)) !== null) {
    const importName = match[1].trim();
    const componentName = match[2].trim();
    importedComponentsByType.muiDirect.set(importName, componentName);
    
    // Add issue for direct import (can be converted to design system adapter)
    issues.push({
      type: 'materialUIImports',
      importStatement: match[0],
      component: importName,
      line: getLineNumber(content, match.index)
    });
  }
  
  // Find design system adapter imports
  while ((match = designSystemImport.exec(content)) !== null) {
    const components = match[1].split(',').map(c => c.trim());
    components.forEach(component => {
      // Handle 'as' renaming
      const actualName = component.split(' as ')[0].trim();
      importedComponentsByType.designSystem.add(actualName);
    });
  }
  
  // Check for duplicate imports: components imported both directly and from design system
  importedComponentsByType.muiDirect.forEach((componentName, importName) => {
    if (importedComponentsByType.designSystem.has(componentName)) {
      issues.push({
        type: 'duplicateImports',
        importName: importName,
        componentName: componentName,
        line: getLineNumber(content, content.indexOf(`import ${importName} from '@mui/material/${componentName}'`))
      });
    }
  });
  
  // Check for mixed import styles: components imported both in destructured form and directly
  importedComponentsByType.muiDestructured.forEach(component => {
    // Check if this component is also imported directly
    if (Array.from(importedComponentsByType.muiDirect.values()).includes(component)) {
      issues.push({
        type: 'mixedImportStyles',
        component: component,
        line: getLineNumber(content, content.indexOf(`import ${component} from '@mui/material/${component}'`))
      });
    }
    
    // Check if this component is also imported from design system adapter
    if (importedComponentsByType.designSystem.has(component)) {
      issues.push({
        type: 'directVsDestructured',
        component: component,
        line: getLineNumber(content, content.indexOf(`${component},`) || content.indexOf(`${component} `))
      });
    }
  });
  
  return issues;
}

// Apply fixes to the detected issues
function applyFixes(content, issues) {
  let modifiedContent = content;
  let modified = false;
  const fixes = [];
  
  // Sort issues by line number in descending order to avoid position shifts
  issues.sort((a, b) => b.line - a.line);
  
  // Process each issue
  for (const issue of issues) {
    switch (issue.type) {
      case 'duplicateImports':
        // Remove direct import if already imported from design system
        const directImportRegex = new RegExp(`import\\s+${issue.importName}\\s+from\\s+['"]@mui\\/material\\/${issue.componentName}['"];?\\s*\\n?`, 'g');
        modifiedContent = modifiedContent.replace(directImportRegex, '');
        modified = true;
        fixes.push({
          type: 'duplicateImports',
          details: `Removed duplicate import of ${issue.componentName}`
        });
        break;
        
      case 'mixedImportStyles':
        // Prefer destructured imports over direct ones
        const componentDirectImportRegex = new RegExp(`import\\s+${issue.component}\\s+from\\s+['"]@mui\\/material\\/${issue.component}['"];?\\s*\\n?`, 'g');
        modifiedContent = modifiedContent.replace(componentDirectImportRegex, '');
        modified = true;
        fixes.push({
          type: 'mixedImportStyles',
          details: `Removed direct import of ${issue.component} in favor of destructured import`
        });
        break;
        
      case 'directVsDestructured':
        // Prefer design system adapter imports over MUI destructured imports
        const muiDestructuredImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@mui\/material['"];?/g;
        modifiedContent = modifiedContent.replace(muiDestructuredImportRegex, (match, components) => {
          // Remove the component that's also imported from design system
          const remainingComponents = components.split(',')
            .map(c => c.trim())
            .filter(c => {
              const componentName = c.split(' as ')[0].trim();
              return componentName !== issue.component;
            });
          
          if (remainingComponents.length === 0) {
            return ''; // Remove the entire import if no components remain
          }
          
          return `import { ${remainingComponents.join(', ')} } from '@mui/material';`;
        });
        
        modified = true;
        fixes.push({
          type: 'directVsDestructured',
          details: `Removed MUI destructured import of ${issue.component} in favor of design system adapter import`
        });
        break;
        
      case 'materialUIImports':
        // This case requires more context to handle properly
        // We'd generally want to convert direct MUI imports to design system adapter imports
        // But only if the component is available through the adapter
        break;
    }
  }
  
  return { content: modifiedContent, modified, fixes };
}

// Get line number for a position in the content
function getLineNumber(content, position) {
  const contentBeforePosition = content.substring(0, position);
  return (contentBeforePosition.match(/\n/g) || []).length + 1;
}

// Utility function to get all files recursively
function getAllFilesRecursively(dir, extensions = ['.js', '.jsx'], fileList = []) {
  if (!fs.existsSync(dir)) {
    logger.warn(`Warning: Directory ${dir} does not exist`);
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (file !== 'node_modules' && !file.startsWith('.')) {
        getAllFilesRecursively(filePath, extensions, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  
  return fileList;
}

// Execute the script
fixMUIImports().catch(err => {
  logger.error('Unexpected error:', err);
  process.exit(1);
});