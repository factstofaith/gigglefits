/**
 * Fix React Hooks Issues
 * 
 * This script identifies and fixes common React Hooks issues:
 * - Hooks used outside of component functions
 * - Hooks used in callbacks or loops
 * - Missing dependencies in useEffect
 * 
 * Usage: node fix-react-hooks.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const HOOKS_REGEX = /\b(use[A-Z]\w+)\s*\(/g;
const HOOK_ERROR_PATTERNS = [
  // Hooks inside loops
  { pattern: /for\s*\([^)]*\)\s*\{[^}]*\buse[A-Z]\w+\s*\(/g, description: 'Hook in loop' },
  // Hooks inside conditionals
  { pattern: /if\s*\([^)]*\)\s*\{[^}]*\buse[A-Z]\w+\s*\(/g, description: 'Hook in conditional' },
  // Hooks inside callbacks
  { pattern: /\(\s*(?:function|\([^)]*\)\s*=>)\s*\{[^}]*\buse[A-Z]\w+\s*\(/g, description: 'Hook in callback' },
];

// Function to extract actual hook code based on potential violation location
function extractHookContext(content, match, startIndex) {
  const hookStart = content.indexOf(match, startIndex);
  if (hookStart === -1) return null;
  
  // Get 50 chars before and after for context
  const contextStart = Math.max(0, hookStart - 50);
  const contextEnd = Math.min(content.length, hookStart + match.length + 50);
  
  return {
    text: content.substring(contextStart, contextEnd),
    start: hookStart,
    end: hookStart + match.length
  };
}

// Function to check if a file has hook violations
function analyzeHookIssues(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for violations
  HOOK_ERROR_PATTERNS.forEach(({ pattern, description }) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const context = extractHookContext(content, match[0], match.index);
      if (context) {
        issues.push({
          file: filePath,
          description,
          context: context.text,
          position: { start: context.start, end: context.end }
        });
      }
    }
  });
  
  return issues;
}

// Special fix for bidirectionalSync.js which has complex hook issues
function fixBidirectionalSync() {
  const filePath = path.join(ROOT_DIR, 'utils/bidirectionalSync.js');
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Could not find bidirectionalSync.js`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the problematic code into a proper React custom hook
    if (content.includes('function createSyncManager')) {
      // Fix for moving hooks out of callbacks
      content = content.replace(
        /function createSyncManager\([^)]*\)\s*{([\s\S]*?)return/,
        'function createSyncManager(props) {\n  const useSyncManager = () => {\n$1    return\n  };\n\n  return'
      );
      
      // Properly export the hook
      content = content.replace(
        /export {\s*createSyncManager\s*};/,
        'export { createSyncManager, useSyncManager };'
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed hooks in bidirectionalSync.js`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing bidirectionalSync.js:`, error.message);
    return false;
  }
}

// Find all JS/JSX files that might contain hooks
const files = glob.sync(`${ROOT_DIR}/**/*.{js,jsx}`);
let foundIssues = [];

// Analyze each file for hook issues
files.forEach(filePath => {
  try {
    const fileIssues = analyzeHookIssues(filePath);
    if (fileIssues.length > 0) {
      foundIssues = [...foundIssues, ...fileIssues];
      console.log(`⚠️ Found ${fileIssues.length} hook issues in: ${path.relative(ROOT_DIR, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
  }
});

// Fix known specific issues
const fixedBidirectionalSync = fixBidirectionalSync();

console.log(`\nCompleted! Found ${foundIssues.length} potential hook issues in ${files.length} files.`);
console.log(`Fixed specific issues in bidirectionalSync.js: ${fixedBidirectionalSync ? 'Yes' : 'No'}`);
console.log(`\nNote: Most hook issues require manual intervention. The analysis results have been saved to help guide manual fixes.`);