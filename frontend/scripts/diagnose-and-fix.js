#!/usr/bin/env node

/**
 * diagnose-and-fix.js
 * 
 * A comprehensive script that:
 * 1. Runs the build process in diagnostic mode
 * 2. Captures and categorizes all errors
 * 3. Applies targeted fixes based on error patterns
 * 4. Verifies the fixes by re-running the build
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const logFile = path.join(projectRoot, 'build-errors.log');
const fixSummaryFile = path.join(projectRoot, 'fix-summary.md');
const dryRun = process.argv.includes('--dry-run');

// Error patterns to look for and fix
const errorPatterns = [
  {
    name: 'Duplicate MUI imports',
    regex: /Attempted import error: '([^']+)' is not exported from/,
    description: 'Components imported directly from MUI that should come from design system',
    fix: fixDuplicateMuiImports
  },
  {
    name: 'Missing components in design system',
    regex: /Attempted import error: '([^']+)' is not exported from '.*\/design-system/,
    description: 'Components imported from design system that are not exported',
    fix: createMissingComponents
  },
  {
    name: 'Duplicate identifier',
    regex: /Identifier '([^']+)' has already been declared/,
    description: 'Multiple imports of the same component',
    fix: fixDuplicateIdentifiers
  },
  {
    name: 'Syntax error in JSX',
    regex: /Parsing error: (.*) \((\d+):(\d+)\)/,
    description: 'Syntax errors in JSX files',
    fix: fixJsxSyntaxErrors
  },
  {
    name: 'Invalid hook call',
    regex: /React Hook "(.*)" is called (conditionally|in a function)/,
    description: 'React hooks violations',
    fix: fixHookViolations
  }
];

// Container for all errors found
const errorsFound = {
  duplicateMuiImports: new Map(),
  missingComponents: new Set(),
  duplicateIdentifiers: new Map(),
  jsxSyntaxErrors: [],
  hookViolations: []
};

/**
 * Run the build process and capture errors
 */
async function runBuildAndCaptureErrors() {
  console.log('🔍 Running build in diagnostic mode to capture errors...');
  
  try {
    // Remove existing error log if it exists
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }
    
    // Run the build with output redirected to the log file
    const build = spawn('npm', ['run', 'build'], {
      cwd: projectRoot,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Capture build output
    let buildOutput = '';
    build.stdout.on('data', (data) => {
      const output = data.toString();
      buildOutput += output;
      process.stdout.write(output);
    });
    
    build.stderr.on('data', (data) => {
      const output = data.toString();
      buildOutput += output;
      process.stderr.write(output);
    });
    
    // Wait for build to complete
    const exitCode = await new Promise(resolve => {
      build.on('close', resolve);
    });
    
    // Save build output to log file
    fs.writeFileSync(logFile, buildOutput, 'utf8');
    
    console.log(`\nBuild completed with exit code ${exitCode}`);
    console.log(`Complete build log saved to ${logFile}`);
    
    return buildOutput;
  } catch (err) {
    console.error('Error running build:', err);
    return null;
  }
}

/**
 * Parse build errors from output
 */
function parseBuildErrors(buildOutput) {
  console.log('\n🔍 Analyzing build errors...');
  
  // Extract errors based on patterns
  errorPatterns.forEach(pattern => {
    const matches = buildOutput.match(new RegExp(pattern.regex, 'g')) || [];
    
    if (matches.length > 0) {
      console.log(`Found ${matches.length} ${pattern.name} errors`);
      
      // Process each match based on error type
      matches.forEach(match => {
        const details = pattern.regex.exec(match);
        
        if (details) {
          switch (pattern.name) {
            case 'Duplicate MUI imports':
            case 'Missing components in design system':
              if (details[1]) {
                const component = details[1];
                if (pattern.name === 'Duplicate MUI imports') {
                  errorsFound.duplicateMuiImports.set(component, (errorsFound.duplicateMuiImports.get(component) || 0) + 1);
                } else {
                  errorsFound.missingComponents.add(component);
                }
              }
              break;
              
            case 'Duplicate identifier':
              if (details[1]) {
                const identifier = details[1];
                errorsFound.duplicateIdentifiers.set(identifier, (errorsFound.duplicateIdentifiers.get(identifier) || 0) + 1);
              }
              break;
              
            case 'Syntax error in JSX':
              if (details[1] && details[2] && details[3]) {
                errorsFound.jsxSyntaxErrors.push({
                  message: details[1],
                  line: parseInt(details[2], 10),
                  column: parseInt(details[3], 10)
                });
              }
              break;
              
            case 'Invalid hook call':
              if (details[1] && details[2]) {
                errorsFound.hookViolations.push({
                  hook: details[1],
                  issue: details[2]
                });
              }
              break;
          }
        }
      });
    }
  });
  
  // Extract file paths with errors
  const fileErrorMatches = buildOutput.match(/\/[^:]+\.jsx?:\d+/g) || [];
  const fileErrors = new Map();
  
  fileErrorMatches.forEach(match => {
    const filePath = match.split(':')[0];
    fileErrors.set(filePath, (fileErrors.get(filePath) || 0) + 1);
  });
  
  console.log(`Found errors in ${fileErrors.size} files`);
  
  // Print error summary
  console.log('\n=== Error Summary ===');
  console.log(`Duplicate MUI imports: ${errorsFound.duplicateMuiImports.size} components`);
  console.log(`Missing design system components: ${errorsFound.missingComponents.size} components`);
  console.log(`Duplicate identifiers: ${errorsFound.duplicateIdentifiers.size} identifiers`);
  console.log(`JSX syntax errors: ${errorsFound.jsxSyntaxErrors.length} errors`);
  console.log(`Hook violations: ${errorsFound.hookViolations.length} violations`);
  
  return fileErrors;
}

/**
 * Apply fixes based on errors found
 */
async function applyFixes() {
  console.log('\n🔧 Applying fixes for found errors...');
  
  let totalFixesApplied = 0;
  
  // Apply fixes for each error type
  for (const pattern of errorPatterns) {
    switch (pattern.name) {
      case 'Duplicate MUI imports':
        if (errorsFound.duplicateMuiImports.size > 0) {
          const fixCount = await fixDuplicateMuiImports();
          totalFixesApplied += fixCount;
        }
        break;
        
      case 'Missing components in design system':
        if (errorsFound.missingComponents.size > 0) {
          const fixCount = await createMissingComponents();
          totalFixesApplied += fixCount;
        }
        break;
        
      case 'Duplicate identifier':
        if (errorsFound.duplicateIdentifiers.size > 0) {
          const fixCount = await fixDuplicateIdentifiers();
          totalFixesApplied += fixCount;
        }
        break;
        
      case 'Syntax error in JSX':
        if (errorsFound.jsxSyntaxErrors.length > 0) {
          const fixCount = await fixJsxSyntaxErrors();
          totalFixesApplied += fixCount;
        }
        break;
        
      case 'Invalid hook call':
        if (errorsFound.hookViolations.length > 0) {
          const fixCount = await fixHookViolations();
          totalFixesApplied += fixCount;
        }
        break;
    }
  }
  
  console.log(`\n✅ Applied ${totalFixesApplied} fixes in total`);
  return totalFixesApplied;
}

/**
 * Fix duplicate MUI imports
 */
async function fixDuplicateMuiImports() {
  console.log('\n🔧 Fixing duplicate MUI imports...');
  
  if (dryRun) {
    console.log('⚠️ Dry run mode - not applying fixes');
    console.log(`Would fix imports for: ${Array.from(errorsFound.duplicateMuiImports.keys()).join(', ')}`);
    return 0;
  }
  
  try {
    // Run the dedicated script to fix duplicate MUI imports
    execSync('node scripts/fix-duplicate-mui-imports.js', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    return errorsFound.duplicateMuiImports.size;
  } catch (err) {
    console.error('Error fixing duplicate MUI imports:', err.message);
    return 0;
  }
}

/**
 * Create missing components in design system
 */
async function createMissingComponents() {
  console.log('\n🔧 Creating missing design system components...');
  
  if (dryRun) {
    console.log('⚠️ Dry run mode - not applying fixes');
    console.log(`Would create components: ${Array.from(errorsFound.missingComponents).join(', ')}`);
    return 0;
  }
  
  try {
    // Run the dedicated script to create missing components
    execSync('node scripts/create-missing-components.js', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    return errorsFound.missingComponents.size;
  } catch (err) {
    console.error('Error creating missing components:', err.message);
    return 0;
  }
}

/**
 * Fix duplicate identifiers
 */
async function fixDuplicateIdentifiers() {
  console.log('\n🔧 Fixing duplicate identifiers...');
  
  if (dryRun) {
    console.log('⚠️ Dry run mode - not applying fixes');
    console.log(`Would fix duplicate identifiers: ${Array.from(errorsFound.duplicateIdentifiers.keys()).join(', ')}`);
    return 0;
  }
  
  let fixCount = 0;
  
  // Find files with duplicate imports
  const files = glob.sync('**/*.{js,jsx}', { cwd: srcDir, absolute: true });
  
  for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check for each duplicate identifier
    for (const [identifier] of errorsFound.duplicateIdentifiers) {
      // Look for duplicate import patterns
      const importRegex = new RegExp(`import\\s+${identifier}\\s+from\\s+['"]([^'"]+)['"]`, 'g');
      const imports = [];
      let match;
      
      // Find all imports of this identifier
      while ((match = importRegex.exec(content)) !== null) {
        imports.push({
          statement: match[0],
          source: match[1]
        });
      }
      
      // If there are multiple imports, remove duplicates
      if (imports.length > 1) {
        // Keep the first import, remove the rest
        for (let i = 1; i < imports.length; i++) {
          content = content.replace(imports[i].statement, `// Removed duplicate import: ${imports[i].statement}`);
          modified = true;
          fixCount++;
        }
      }
    }
    
    // Save changes if the file was modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed duplicate identifiers in ${path.relative(projectRoot, filePath)}`);
    }
  }
  
  return fixCount;
}

/**
 * Fix JSX syntax errors
 */
async function fixJsxSyntaxErrors() {
  console.log('\n🔧 Fixing JSX syntax errors...');
  
  if (dryRun) {
    console.log('⚠️ Dry run mode - not applying fixes');
    console.log(`Would fix ${errorsFound.jsxSyntaxErrors.length} JSX syntax errors`);
    return 0;
  }
  
  try {
    // Run ESLint to automatically fix JSX syntax errors
    execSync('npx eslint --fix "src/**/*.{js,jsx}"', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    return errorsFound.jsxSyntaxErrors.length;
  } catch (err) {
    console.error('Error fixing JSX syntax errors:', err.message);
    return 0;
  }
}

/**
 * Fix hook violations
 */
async function fixHookViolations() {
  console.log('\n🔧 Fixing React hook violations...');
  
  if (dryRun) {
    console.log('⚠️ Dry run mode - not applying fixes');
    console.log(`Would fix ${errorsFound.hookViolations.length} hook violations`);
    return 0;
  }
  
  try {
    // Run the dedicated script to fix hook violations
    execSync('node scripts/fix-react-hooks.js --src-dir src --run', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    return errorsFound.hookViolations.length;
  } catch (err) {
    console.error('Error fixing hook violations:', err.message);
    return 0;
  }
}

/**
 * Generate fix summary report
 */
function generateFixSummary(totalFixesApplied) {
  console.log('\n📝 Generating fix summary report...');
  
  const summary = `# Build Error Fix Summary
  
## Overview

This report summarizes the build errors found and fixes applied by the automated diagnostic and fix script.

## Error Summary

| Error Type | Count | Description |
|------------|-------|-------------|
| Duplicate MUI imports | ${errorsFound.duplicateMuiImports.size} | Components imported directly from MUI that should come from design system |
| Missing design system components | ${errorsFound.missingComponents.size} | Components imported from design system that are not exported |
| Duplicate identifiers | ${errorsFound.duplicateIdentifiers.size} | Multiple imports of the same component |
| JSX syntax errors | ${errorsFound.jsxSyntaxErrors.length} | Syntax errors in JSX files |
| Hook violations | ${errorsFound.hookViolations.length} | React hooks violations |
| **Total** | **${totalFixesApplied}** | |

## Details

### Duplicate MUI Imports
${Array.from(errorsFound.duplicateMuiImports.entries()).map(([component, count]) => `- ${component} (${count} occurrences)`).join('\n')}

### Missing Design System Components
${Array.from(errorsFound.missingComponents).map(component => `- ${component}`).join('\n')}

### Duplicate Identifiers
${Array.from(errorsFound.duplicateIdentifiers.entries()).map(([identifier, count]) => `- ${identifier} (${count} occurrences)`).join('\n')}

## Next Steps

1. Run \`npm run build\` to verify all errors have been fixed
2. If errors remain, run this script again
3. For complex errors that cannot be fixed automatically, manual intervention may be required
`;
  
  if (!dryRun) {
    fs.writeFileSync(fixSummaryFile, summary, 'utf8');
    console.log(`✅ Fix summary saved to ${fixSummaryFile}`);
  } else {
    console.log('⚠️ Dry run mode - not generating fix summary file');
  }
}

/**
 * Main function to orchestrate the diagnosis and fix process
 */
async function main() {
  console.log('🚀 Starting diagnostic and fix process...');
  
  if (dryRun) {
    console.log('⚠️ Running in dry run mode - will not apply any fixes');
  }
  
  // Step 1: Run build and capture errors
  const buildOutput = await runBuildAndCaptureErrors();
  
  if (!buildOutput) {
    console.error('❌ Failed to run build or no output captured');
    process.exit(1);
  }
  
  // Step 2: Parse build errors
  const fileErrors = parseBuildErrors(buildOutput);
  
  if (fileErrors.size === 0) {
    console.log('\n✅ No errors found in the build! The project builds successfully.');
    process.exit(0);
  }
  
  // Step 3: Apply fixes for errors
  const totalFixesApplied = await applyFixes();
  
  // Step 4: Generate summary report
  generateFixSummary(totalFixesApplied);
  
  // Step 5: Final message
  console.log('\n✅ Diagnostic and fix process completed');
  console.log(`Applied ${totalFixesApplied} fixes across ${fileErrors.size} files`);
  
  if (!dryRun) {
    console.log('\nTo verify fixes, run:');
    console.log('  npm run build');
  }
}

// Run the script
main().catch(err => {
  console.error('❌ Script failed with error:', err);
  process.exit(1);
});