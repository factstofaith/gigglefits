/**
 * Standardize Context Implementations
 * 
 * This script standardizes React context implementations across the codebase:
 * - Ensures consistent context provider structure
 * - Adds proper defaultValue to createContext calls
 * - Creates custom hooks for context access
 * - Fixes context usage patterns
 * 
 * Usage: node standardize-contexts.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const CONTEXTS_DIR = path.join(ROOT_DIR, 'contexts');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `contexts-standardization-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const DRY_RUN = process.argv.includes('--dry-run');

// Create backup directory
if (!DRY_RUN) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
}

// Standard context template
function generateStandardizedContext(contextName, initialState = {}, providerCode = '') {
  const hookName = `use${contextName.replace(/Context$/, '')}`;
  
  return `/**
 * ${contextName}
 * 
 * Standardized context implementation
 * Created/Updated by Project Sunlight standardization
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// Define initial state with proper types
const initialState = ${JSON.stringify(initialState, null, 2)};

// Create context with initial state
const ${contextName} = createContext(initialState);

/**
 * ${contextName} Provider
 * 
 * Provider component for ${contextName}
 */
export const ${contextName}Provider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  ${providerCode}
  
  // Create the context value object with state and functions
  const contextValue = {
    ...state,
    // Add your context functions here
  };
  
  return (
    <${contextName}.Provider value={contextValue}>
      {children}
    </${contextName}.Provider>
  );
};

${contextName}Provider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * ${hookName}
 * 
 * Custom hook for accessing ${contextName}
 */
export const ${hookName} = () => {
  const context = useContext(${contextName});
  
  if (context === undefined) {
    throw new Error('${hookName} must be used within a ${contextName}Provider');
  }
  
  return context;
};

export default ${contextName};
`;
}

// Function to extract initial state from existing context
function extractInitialState(content) {
  // Try to find createContext call
  const createContextMatch = content.match(/createContext\(([^)]+)\)/);
  if (createContextMatch && createContextMatch[1] && createContextMatch[1].trim() !== '') {
    try {
      // Try to evaluate the initial state
      const initialStateStr = createContextMatch[1].trim();
      
      // Handle empty objects
      if (initialStateStr === '{}') {
        return {};
      }
      
      // Handle null
      if (initialStateStr === 'null') {
        return {};
      }
      
      // Try to parse as JSON if it looks like an object
      if (initialStateStr.startsWith('{') && initialStateStr.endsWith('}')) {
        return JSON.parse(initialStateStr.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'));
      }
      
      return {};
    } catch (error) {
      return {};
    }
  }
  
  // Try to find useState call
  const useStateMatch = content.match(/useState\(([^)]+)\)/);
  if (useStateMatch && useStateMatch[1] && useStateMatch[1].trim() !== '') {
    try {
      const initialStateStr = useStateMatch[1].trim();
      
      // Handle empty objects
      if (initialStateStr === '{}') {
        return {};
      }
      
      // Handle null
      if (initialStateStr === 'null') {
        return {};
      }
      
      // Try to parse as JSON if it looks like an object
      if (initialStateStr.startsWith('{') && initialStateStr.endsWith('}')) {
        return JSON.parse(initialStateStr.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'));
      }
      
      return {};
    } catch (error) {
      return {};
    }
  }
  
  return {};
}

// Function to extract provider code from existing context
function extractProviderCode(content) {
  // Try to find useEffect in provider
  const effectMatches = content.match(/useEffect\(\s*\(\s*\)\s*=>\s*\{[^}]*\}/g);
  
  if (effectMatches && effectMatches.length > 0) {
    return effectMatches.join('\n\n');
  }
  
  return '// TODO: Implement provider logic';
}

// Function to analyze a context file
function analyzeContextFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const contextName = fileName.replace(/\.jsx?$/, '');
    
    // Check for common issues
    const issues = {
      missingDefaultValue: !content.includes('createContext(') || content.includes('createContext()') || content.includes('createContext(null)'),
      missingCustomHook: !content.includes('useContext(') || !content.includes('export const use'),
      missingPropTypes: !content.includes('PropTypes') || !content.includes('.propTypes'),
      inconsistentNaming: fileName.includes('Context') && !content.includes(`const ${contextName}`),
    };
    
    return {
      filePath,
      contextName,
      issues,
      needsStandardization: Object.values(issues).some(issue => issue),
      initialState: extractInitialState(content),
      providerCode: extractProviderCode(content)
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
    return {
      filePath,
      error: error.message,
      needsStandardization: false
    };
  }
}

// Function to standardize a context file
function standardizeContextFile(analysis) {
  if (!analysis.needsStandardization) {
    return false;
  }
  
  try {
    const contextName = analysis.contextName;
    const standardContext = generateStandardizedContext(
      contextName,
      analysis.initialState,
      analysis.providerCode
    );
    
    if (!DRY_RUN) {
      // Backup original file
      const relativePath = path.relative(ROOT_DIR, analysis.filePath);
      const backupPath = path.join(BACKUP_DIR, relativePath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(analysis.filePath, backupPath);
      
      // Write standardized file
      fs.writeFileSync(analysis.filePath, standardContext, 'utf8');
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error standardizing ${analysis.filePath}:`, error.message);
    return false;
  }
}

// Find all context files
const contextFiles = glob.sync(`${CONTEXTS_DIR}/**/*.{js,jsx}`);
console.log(`🔍 Found ${contextFiles.length} context files to analyze...`);

// Analyze each context file
const analyses = contextFiles.map(filePath => analyzeContextFile(filePath));
const needStandardization = analyses.filter(a => a.needsStandardization);

console.log(`\n📊 Context Analysis Summary:`);
console.log(`- Total context files: ${contextFiles.length}`);
console.log(`- Contexts needing standardization: ${needStandardization.length}`);

// List issues found
const issueTypes = {
  missingDefaultValue: 'Missing default value in createContext',
  missingCustomHook: 'Missing custom hook for context access',
  missingPropTypes: 'Missing PropTypes validation',
  inconsistentNaming: 'Inconsistent context naming'
};

Object.entries(issueTypes).forEach(([issueKey, issueDesc]) => {
  const count = analyses.filter(a => a.issues && a.issues[issueKey]).length;
  console.log(`- ${issueDesc}: ${count}`);
});

// Standardize contexts if needed
if (needStandardization.length > 0) {
  console.log('\n🔄 Standardizing contexts...');
  
  if (DRY_RUN) {
    console.log('⚠️ Dry run mode - not making actual changes');
  }
  
  let standardizedCount = 0;
  
  needStandardization.forEach(analysis => {
    console.log(`- ${path.relative(ROOT_DIR, analysis.filePath)}`);
    Object.entries(analysis.issues).forEach(([issueKey, hasIssue]) => {
      if (hasIssue) {
        console.log(`  • ${issueTypes[issueKey]}`);
      }
    });
    
    const wasStandardized = standardizeContextFile(analysis);
    if (wasStandardized) {
      standardizedCount++;
    }
  });
  
  console.log(`\n✅ Standardized ${standardizedCount} context files`);
  
  if (!DRY_RUN) {
    console.log(`Original files backed up to: ${BACKUP_DIR}`);
  }
}

// Provide suggestions for next steps
console.log('\nNext steps:');
console.log('1. Review standardized context implementations');
console.log('2. Update components to use the new context hooks');
console.log('3. Run the build to verify changes');
console.log('4. Update the Technical Debt Elimination Tracker in ClaudeContext.md');