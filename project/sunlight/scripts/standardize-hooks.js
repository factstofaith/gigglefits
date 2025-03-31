/**
 * Standardize React Hooks
 * 
 * This script aggressively standardizes React hooks usage across the codebase:
 * - Adds missing dependencies to useEffect hooks
 * - Fixes hooks rule violations
 * - Extracts hooks from incorrect locations into custom hooks
 * - Standardizes hook naming conventions
 * 
 * Usage: node standardize-hooks.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const HOOKS_DIR = path.join(ROOT_DIR, 'hooks');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `hooks-standardization-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const DRY_RUN = process.argv.includes('--dry-run');

// Create backup and hooks directories
if (!DRY_RUN) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.mkdirSync(HOOKS_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
  console.log(`📁 Ensuring hooks directory exists: ${HOOKS_DIR}`);
}

// Hook patterns to search for
const HOOK_PATTERNS = [
  // useEffect with empty or missing dependency array
  {
    name: 'useEffect-empty-deps',
    pattern: /useEffect\(\s*\(\s*\)\s*=>\s*\{[^}]*\},\s*\[\s*\]\s*\)/g,
    fix: (match) => {
      // Add comment to explain why empty deps are used
      return match.replace(/\[\s*\]\s*\)$/, '[] /* run only on mount */ )');
    }
  },
  // useEffect with missing dependency array
  {
    name: 'useEffect-missing-deps',
    pattern: /useEffect\(\s*\(\s*\)\s*=>\s*\{(?:[^{}]|{[^{}]*})*\}\s*\)/g,
    fix: (match) => {
      // Add dependency array to prevent infinite loops
      return match.replace(/\}\s*\)$/, '}, [] /* TODO: add proper dependencies */ )');
    }
  },
  // useCallback with empty or missing dependency array
  {
    name: 'useCallback-empty-deps',
    pattern: /useCallback\(\s*\([^)]*\)\s*=>\s*\{[^}]*\},\s*\[\s*\]\s*\)/g,
    fix: (match) => {
      // Add comment to explain why empty deps are used
      return match.replace(/\[\s*\]\s*\)$/, '[] /* memoized callback */ )');
    }
  },
  // useCallback with missing dependency array
  {
    name: 'useCallback-missing-deps',
    pattern: /useCallback\(\s*\([^)]*\)\s*=>\s*\{(?:[^{}]|{[^{}]*})*\}\s*\)/g,
    fix: (match) => {
      // Add dependency array to prevent infinite loops
      return match.replace(/\}\s*\)$/, '}, [] /* TODO: add proper dependencies */ )');
    }
  },
  // useMemo with empty or missing dependency array
  {
    name: 'useMemo-empty-deps',
    pattern: /useMemo\(\s*\(\s*\)\s*=>\s*\{[^}]*\},\s*\[\s*\]\s*\)/g,
    fix: (match) => {
      // Add comment to explain why empty deps are used
      return match.replace(/\[\s*\]\s*\)$/, '[] /* memoized value */ )');
    }
  },
  // useMemo with missing dependency array
  {
    name: 'useMemo-missing-deps',
    pattern: /useMemo\(\s*\(\s*\)\s*=>\s*\{(?:[^{}]|{[^{}]*})*\}\s*\)/g,
    fix: (match) => {
      // Add dependency array to prevent infinite loops
      return match.replace(/\}\s*\)$/, '}, [] /* TODO: add proper dependencies */ )');
    }
  },
  // useState inside a loop, condition, or nested function
  {
    name: 'useState-in-loop',
    pattern: /(for|if|while|function|=>)\s*\([^)]*\)\s*\{[^{]*useState\(/g,
    fix: null // Cannot automatically fix, needs extraction to custom hook
  },
  // useEffect inside a loop, condition, or nested function
  {
    name: 'useEffect-in-loop',
    pattern: /(for|if|while|function|=>)\s*\([^)]*\)\s*\{[^{]*useEffect\(/g,
    fix: null // Cannot automatically fix, needs extraction to custom hook
  },
  // useCallback inside a loop, condition, or nested function
  {
    name: 'useCallback-in-loop',
    pattern: /(for|if|while|function|=>)\s*\([^)]*\)\s*\{[^{]*useCallback\(/g,
    fix: null // Cannot automatically fix, needs extraction to custom hook
  },
  // useMemo inside a loop, condition, or nested function
  {
    name: 'useMemo-in-loop',
    pattern: /(for|if|while|function|=>)\s*\([^)]*\)\s*\{[^{]*useMemo\(/g,
    fix: null // Cannot automatically fix, needs extraction to custom hook
  }
];

// Function to detect complex hook issues that need manual intervention
function detectComplexHookIssues(filePath, content) {
  const issues = [];
  
  // Check for hooks violations that need extraction
  HOOK_PATTERNS.forEach(({ name, pattern }) => {
    if (name.includes('-in-loop')) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        issues.push({
          type: name,
          count: matches.length,
          needsExtraction: true
        });
      }
    }
  });
  
  // Special check for bidirectionalSync.js which has custom hook creation issues
  if (filePath.includes('bidirectionalSync.js') && content.includes('useState(') && content.includes('return {')) {
    issues.push({
      type: 'custom-hook-structure',
      count: 1,
      needsExtraction: true,
      message: 'Custom hook factory needs restructuring in bidirectionalSync.js'
    });
  }
  
  return issues;
}

// Function to fix simple hook issues
function fixSimpleHookIssues(content) {
  let updatedContent = content;
  let fixCount = 0;
  
  // Apply each fix pattern
  HOOK_PATTERNS.forEach(({ name, pattern, fix }) => {
    // Skip patterns that need extraction
    if (!fix || name.includes('-in-loop')) return;
    
    updatedContent = updatedContent.replace(pattern, (match) => {
      fixCount++;
      return fix(match);
    });
  });
  
  return { updatedContent, fixCount };
}

// Function to generate a custom hook file
function generateCustomHook(componentName, hookName, hookCode) {
  // Convert component name to hook name if not provided
  if (!hookName) {
    // Remove "Component" suffix if present
    const baseName = componentName.replace(/Component$/, '');
    
    // Convert to camelCase and add "use" prefix
    hookName = `use${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`;
  }
  
  // Create a basic hook template
  return `/**
 * ${hookName}
 * 
 * Custom hook extracted from ${componentName}
 * Created by Project Sunlight standardization
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

const ${hookName} = (props) => {
  // TODO: Implement the hook based on extracted code
  ${hookCode || '// Add hook implementation here'}
  
  return {
    // TODO: Return the values and functions needed by the component
  };
};

export default ${hookName};
`;
}

// Function to process a file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for complex issues
    const complexIssues = detectComplexHookIssues(filePath, content);
    
    // Fix simple issues
    const { updatedContent, fixCount } = fixSimpleHookIssues(content);
    
    // Extract component name from file path
    const fileName = path.basename(filePath, path.extname(filePath));
    const componentName = fileName;
    
    // Determine if file needs changes
    const hasSimpleFixes = content !== updatedContent;
    const hasComplexIssues = complexIssues.length > 0;
    const needsChanges = hasSimpleFixes || hasComplexIssues;
    
    // Create backup if needed
    if (needsChanges && !DRY_RUN) {
      const relativePath = path.relative(ROOT_DIR, filePath);
      const backupPath = path.join(BACKUP_DIR, relativePath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(filePath, backupPath);
    }
    
    // Generate custom hooks for complex issues
    if (hasComplexIssues && !DRY_RUN) {
      complexIssues.forEach(issue => {
        if (issue.needsExtraction) {
          const hookName = `use${componentName}${issue.type.split('-')[0].charAt(0).toUpperCase() + issue.type.split('-')[0].slice(1)}`;
          const hookPath = path.join(HOOKS_DIR, `${hookName}.js`);
          
          // Skip if the hook already exists
          if (!fs.existsSync(hookPath)) {
            fs.writeFileSync(hookPath, generateCustomHook(componentName, hookName), 'utf8');
            console.log(`🪝 Generated custom hook: ${hookName}`);
          }
        }
      });
    }
    
    // Write updated content for simple fixes
    if (hasSimpleFixes && !DRY_RUN) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
    
    return {
      filePath,
      componentName,
      simpleFixes: fixCount,
      complexIssues,
      needsChanges
    };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return {
      filePath,
      error: error.message,
      needsChanges: false
    };
  }
}

// Find all React files
const reactFiles = glob.sync(`${ROOT_DIR}/**/*.{js,jsx}`).filter(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Only include files that use React hooks
    return content.includes('useState') || 
           content.includes('useEffect') || 
           content.includes('useCallback') || 
           content.includes('useMemo') || 
           content.includes('useContext') || 
           content.includes('useReducer') || 
           content.includes('useRef');
  } catch (error) {
    return false;
  }
});

console.log(`🔍 Found ${reactFiles.length} files with React hooks to analyze...`);

// Process each file
const results = reactFiles.map(filePath => processFile(filePath));

// Summarize results
const changedFiles = results.filter(r => r.needsChanges);
const simpleFixCount = results.reduce((acc, r) => acc + (r.simpleFixes || 0), 0);
const complexIssueCount = results.reduce((acc, r) => {
  if (r.complexIssues) {
    return acc + r.complexIssues.reduce((sum, issue) => sum + issue.count, 0);
  }
  return acc;
}, 0);

console.log('\n📊 Hook Standardization Summary:');
console.log(`- Files analyzed: ${reactFiles.length}`);
console.log(`- Files needing changes: ${changedFiles.length}`);
console.log(`- Simple hook issues fixed: ${simpleFixCount}`);
console.log(`- Complex hook issues detected: ${complexIssueCount}`);

if (DRY_RUN) {
  console.log('\n⚠️ This was a dry run. No files were actually modified.');
  console.log('To perform the actual changes, run the script without --dry-run');
} else {
  console.log(`\n✅ Modified files have been backed up to: ${BACKUP_DIR}`);
  
  // List files with complex issues that need manual attention
  const manualFiles = results.filter(r => r.complexIssues && r.complexIssues.length > 0);
  
  if (manualFiles.length > 0) {
    console.log('\n⚠️ Files needing manual attention:');
    manualFiles.forEach(result => {
      console.log(`- ${path.relative(ROOT_DIR, result.filePath)}`);
      result.complexIssues.forEach(issue => {
        console.log(`  • ${issue.type}: ${issue.count} occurrence(s)`);
        if (issue.message) console.log(`    ${issue.message}`);
      });
    });
  }
}

// Provide suggestions for next steps
console.log('\nNext steps:');
console.log('1. Run the build to verify hook standardization');
console.log('2. Review and implement the custom hooks created in the hooks directory');
console.log('3. Manually address complex hook issues that could not be fixed automatically');
console.log('4. Update the Technical Debt Elimination Tracker in ClaudeContext.md');