#!/usr/bin/env node

/**
 * Fix Component Tests Script
 * 
 * This script automatically identifies and fixes issues in component tests
 * to achieve zero test failures across all test types.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load components that need fixing
const componentsToFix = [
  {
    name: 'A11yForm',
    path: '../src/components/common/A11yForm.jsx',
    testPath: '../src/tests/components/common/A11yForm.test.jsx',
    visualTestPath: '../src/tests/components/common/A11yForm.visual.js',
    issues: ['JSX tags not balanced']
  },
  {
    name: 'A11yTable',
    path: '../src/components/common/A11yTable.jsx',
    testPath: '../src/tests/components/common/A11yTable.test.jsx',
    visualTestPath: '../src/tests/components/common/A11yTable.visual.js',
    issues: ['JSX tags not balanced']
  }
];

/**
 * Check if file content has balanced JSX tags and braces
 */
function checkBalanced(content) {
  const results = {
    balanced: true,
    braces: 0,
    parentheses: 0,
    tags: 0,
    errors: []
  };
  
  // Count braces, parentheses, and JSX tags
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inComment = false;
  let inMultilineComment = false;
  let tagName = '';
  let collectingTagName = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1] || '';
    const prevChar = content[i - 1] || '';
    
    // Skip characters in quotes
    if (char === "'" && !inDoubleQuote && prevChar !== '\\') {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    
    if (char === '"' && !inSingleQuote && prevChar !== '\\') {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    
    if (inSingleQuote || inDoubleQuote) continue;
    
    // Handle comments
    if (char === '/' && nextChar === '/') {
      inComment = true;
      i++; // Skip next character
      continue;
    }
    
    if (inComment && char === '\n') {
      inComment = false;
      continue;
    }
    
    if (char === '/' && nextChar === '*') {
      inMultilineComment = true;
      i++; // Skip next character
      continue;
    }
    
    if (inMultilineComment && char === '*' && nextChar === '/') {
      inMultilineComment = false;
      i++; // Skip next character
      continue;
    }
    
    if (inComment || inMultilineComment) continue;
    
    // Count braces and parentheses
    if (char === '{') results.braces++;
    if (char === '}') results.braces--;
    if (char === '(') results.parentheses++;
    if (char === ')') results.parentheses--;
    
    // Check for JSX tags
    if (char === '<' && /[a-zA-Z\/]/.test(nextChar)) {
      collectingTagName = true;
      tagName = '';
      
      if (nextChar === '/') {
        results.tags--;
      } else {
        results.tags++;
      }
    }
    
    if (collectingTagName) {
      if (/[a-zA-Z0-9]/.test(char)) {
        tagName += char;
      } else if (char === '>' || char === ' ' || char === '/') {
        collectingTagName = false;
        
        // Self-closing tag
        if (char === '/' && nextChar === '>') {
          results.tags--;
        }
      }
    }
  }
  
  // Check for balance
  if (results.braces !== 0) {
    results.balanced = false;
    results.errors.push(`Unbalanced braces: ${results.braces > 0 ? 'missing' : 'extra'} ${Math.abs(results.braces)} closing brace(s)`);
  }
  
  if (results.parentheses !== 0) {
    results.balanced = false;
    results.errors.push(`Unbalanced parentheses: ${results.parentheses > 0 ? 'missing' : 'extra'} ${Math.abs(results.parentheses)} closing parenthesis`);
  }
  
  if (results.tags !== 0) {
    results.balanced = false;
    results.errors.push(`Unbalanced JSX tags: ${results.tags > 0 ? 'missing' : 'extra'} ${Math.abs(results.tags)} closing tag(s)`);
  }
  
  return results;
}

/**
 * Validate the component code
 */
function validateComponent(componentData) {
  console.log(`Validating ${componentData.name}...`);
  
  try {
    const content = fs.readFileSync(path.resolve(__dirname, componentData.path), 'utf8');
    const balance = checkBalanced(content);
    
    if (!balance.balanced) {
      console.log(`❌ ${componentData.name} validation failed: ${balance.errors.join(', ')}`);
      return { valid: false, content, errors: balance.errors };
    } else {
      console.log(`✅ ${componentData.name} validation passed!`);
      return { valid: true, content };
    }
  } catch (error) {
    console.error(`Error validating ${componentData.name}:`, error.message);
    return { valid: false, errors: [error.message] };
  }
}

/**
 * Fix issues in the component
 */
function fixComponent(componentData, validationResult) {
  console.log(`Fixing ${componentData.name}...`);
  
  // If already valid, no need to fix
  if (validationResult.valid) {
    console.log(`✅ ${componentData.name} is already valid, no fixes needed.`);
    return true;
  }
  
  try {
    // Backup the original file
    const backupPath = path.resolve(__dirname, `${componentData.path}.backup`);
    fs.writeFileSync(backupPath, validationResult.content);
    console.log(`Created backup at ${backupPath}`);
    
    // Fix regex in replacement patterns
    let updatedContent = validationResult.content.replace(/\.replace\(\/\.\.\+\/([^\/]*), ''\)/g, ".replace(/\\..+/$1, '')");
    
    // If we found and fixed a regex issue
    if (updatedContent !== validationResult.content) {
      console.log(`Fixed regex issue in ${componentData.name}`);
      
      // Write fixed content
      fs.writeFileSync(path.resolve(__dirname, componentData.path), updatedContent);
      
      // Validate again
      const newValidation = validateComponent(componentData);
      if (newValidation.valid) {
        console.log(`✅ ${componentData.name} fixed successfully!`);
        return true;
      }
      
      console.log(`⚠️ Regex fix applied, but component still has issues.`);
    } else {
      console.log(`⚠️ No regex issues found, may need manual intervention.`);
    }
    
    // If regex fix didn't solve all issues, attempt to parse and fix JSX structure
    // This would involve more complex AST parsing and is beyond the scope of simple fixes
    console.log(`Component requires manual inspection: ${componentData.path}`);
    
    return false;
  } catch (error) {
    console.error(`Error fixing ${componentData.name}:`, error.message);
    return false;
  }
}

/**
 * Display component validation summary
 */
function displayValidationSummary(results) {
  console.log('\n---------------------------------------------------------');
  console.log(`Component Validation Summary`);
  console.log('---------------------------------------------------------');
  
  const validCount = results.filter(r => r.valid).length;
  const totalCount = results.length;
  
  console.log(`Valid: ${validCount}/${totalCount}`);
  console.log(`Invalid: ${totalCount - validCount}/${totalCount}`);
  
  if (validCount !== totalCount) {
    console.log('\nInvalid components:');
    results.forEach(result => {
      if (!result.valid) {
        console.log(`- ${result.component.name}: ${result.errors.join(', ')}`);
      }
    });
    console.log('\nManual fixes may be needed for these components.');
  } else {
    console.log('\nAll components are valid! 🎉');
  }
  
  console.log('---------------------------------------------------------');
}

/**
 * Run the component fix script
 */
function runComponentFix() {
  console.log('Running Component Fix Script...');
  
  // Validate all components
  const validationResults = componentsToFix.map(component => {
    const result = validateComponent(component);
    return { component, ...result };
  });
  
  // Fix invalid components
  const fixResults = validationResults
    .filter(result => !result.valid)
    .map(result => {
      const fixed = fixComponent(result.component, result);
      return { ...result, fixed };
    });
  
  // Display validation summary
  displayValidationSummary(validationResults);
  
  // Return overall success status
  return validationResults.every(result => result.valid);
}

// Run the script
if (require.main === module) {
  const success = runComponentFix();
  process.exit(success ? 0 : 1);
}

module.exports = {
  validateComponent,
  fixComponent,
  runComponentFix
};