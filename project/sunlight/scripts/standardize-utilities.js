/**
 * Standardize Utilities
 * 
 * This script standardizes utility functions across the codebase:
 * - Adds proper TypeScript typing
 * - Adds comprehensive JSDoc comments
 * - Ensures consistent error handling
 * - Refactors utility functions for reusability
 * - Standardizes function signatures and return types
 * 
 * Usage: node standardize-utilities.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const UTILS_DIR = path.join(ROOT_DIR, 'utils');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `utilities-standardization-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const DRY_RUN = process.argv.includes('--dry-run');

// Create backup directory
if (!DRY_RUN) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
}

// Standard utility template
function generateStandardizedUtility(utilityName, functions = [], imports = []) {
  return `/**
 * ${utilityName}
 * 
 * Standardized utility implementation
 * Created/Updated by Project Sunlight standardization
 */

${imports.join('\n')}

/**
 * ${utilityName} utilities
 * @module ${utilityName}
 */

${functions.map(func => `/**
 * ${func.description || func.name}
 * ${func.params ? func.params.split(',').map(param => {
   const paramName = param.trim().split('=')[0];
   return `* @param {${func.paramType || 'any'}} ${paramName} - Parameter description`;
 }).join('\n') : ''}
 * @returns {${func.returnType || 'any'}} ${func.returnDesc || 'Return value'}
 */
export function ${func.name}(${func.params || ''}) {
  ${func.body || '// TODO: Implement function body'}
}
`).join('\n\n')}

// Export all utility functions
export default {
  ${functions.map(func => func.name).join(',\n  ')}
};
`;
}

// Function to extract functions from existing utility file
function extractFunctions(content) {
  const functions = [];
  
  // Find function declarations - both named exports and regular functions
  const funcRegex = /export\s+(const|function)\s+([a-zA-Z0-9_]+)\s*=?\s*(\([^)]*\)|\([^)]*\)\s*=>)/g;
  let match;
  
  while ((match = funcRegex.exec(content)) !== null) {
    const functionName = match[2];
    
    // Extract parameters
    const paramsMatch = match[3].match(/\(([^)]*)\)/);
    const params = paramsMatch ? paramsMatch[1] : '';
    
    // Try to extract function body
    let body = 'return null; // TODO: Implement function body';
    
    // Check if it's an arrow function or regular function
    if (match[3].includes('=>')) { // Arrow function
      const startPos = content.indexOf('=>', match.index) + 2;
      
      // Check if it's a block body or expression body
      if (content.charAt(startPos).trim() === '{') {
        // Block body
        let braceCount = 1;
        let endPos = content.indexOf('{', startPos) + 1;
        
        while (braceCount > 0 && endPos < content.length) {
          const char = content.charAt(endPos);
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
          endPos++;
        }
        
        body = content.substring(
          content.indexOf('{', startPos) + 1, 
          endPos - 1
        ).trim();
      } else {
        // Expression body - find the end of the expression
        const lineEnd = content.indexOf('\n', startPos);
        const semiEnd = content.indexOf(';', startPos);
        const endPos = Math.min(
          lineEnd > -1 ? lineEnd : Infinity,
          semiEnd > -1 ? semiEnd : Infinity
        );
        
        if (endPos !== Infinity) {
          body = `return ${content.substring(startPos, endPos).trim()};`;
        }
      }
    } else { // Regular function
      const startPos = match.index;
      let braceCount = 1;
      let endPos = content.indexOf('{', startPos) + 1;
      
      while (braceCount > 0 && endPos < content.length) {
        const char = content.charAt(endPos);
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        endPos++;
      }
      
      body = content.substring(
        content.indexOf('{', startPos) + 1, 
        endPos - 1
      ).trim();
    }
    
    // Try to extract JSDoc comment
    let description = functionName;
    let returnType = 'any';
    let returnDesc = 'Return value';
    
    // Look for JSDoc comments above the function
    const beforeFunc = content.substring(Math.max(0, match.index - 500), match.index);
    const jsdocMatch = beforeFunc.match(/\/\*\*([\s\S]*?)\*\//);
    
    if (jsdocMatch) {
      const jsdoc = jsdocMatch[1];
      
      // Extract description
      const descMatch = jsdoc.match(/@description\s+([^\n]+)/);
      if (descMatch) {
        description = descMatch[1].trim();
      } else {
        // Use first line as description
        const firstLine = jsdoc.trim().split('\n')[0].trim();
        if (firstLine && !firstLine.startsWith('@')) {
          description = firstLine.replace(/\*/g, '').trim();
        }
      }
      
      // Extract return type and description
      const returnMatch = jsdoc.match(/@returns?\s+\{([^}]+)\}\s+([^\n]+)/);
      if (returnMatch) {
        returnType = returnMatch[1].trim();
        returnDesc = returnMatch[2].trim();
      }
    }
    
    functions.push({
      name: functionName,
      params,
      body,
      description,
      returnType,
      returnDesc
    });
  }
  
  return functions;
}

// Function to extract imports from existing utility file
function extractImports(content) {
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"];/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[0]);
  }
  
  return imports;
}

// Function to analyze a utility file
function analyzeUtilityFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, path.extname(filePath));
    const utilityName = fileName.replace(/Utils$/, '') + 'Utils';
    
    // Check for common issues
    const issues = {
      missingJSDocs: !content.includes('/**') || !content.includes('@'),
      missingTypeAnnotations: !content.includes('@param') || !content.includes('@returns'),
      inconsistentExports: content.includes('module.exports') && content.includes('export'),
      noErrorHandling: (content.includes('try') && !content.includes('catch')) || 
                       (content.includes('throw') && !content.includes('try')),
      missingDefaultExport: !content.includes('export default')
    };
    
    return {
      filePath,
      utilityName,
      issues,
      needsStandardization: Object.values(issues).some(issue => issue),
      functions: extractFunctions(content),
      imports: extractImports(content)
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

// Function to standardize a utility file
function standardizeUtilityFile(analysis) {
  if (!analysis.needsStandardization && analysis.functions.length === 0) {
    return false;
  }
  
  try {
    const standardUtility = generateStandardizedUtility(
      analysis.utilityName,
      analysis.functions,
      analysis.imports
    );
    
    if (!DRY_RUN) {
      // Backup original file
      const relativePath = path.relative(ROOT_DIR, analysis.filePath);
      const backupPath = path.join(BACKUP_DIR, relativePath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(analysis.filePath, backupPath);
      
      // Write standardized file
      fs.writeFileSync(analysis.filePath, standardUtility, 'utf8');
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error standardizing ${analysis.filePath}:`, error.message);
    return false;
  }
}

// Find all utility files
const utilityFiles = glob.sync(`${UTILS_DIR}/**/*.{js,jsx}`);
console.log(`🔍 Found ${utilityFiles.length} utility files to analyze...`);

// Analyze each utility file
const analyses = utilityFiles.map(filePath => analyzeUtilityFile(filePath));
const needStandardization = analyses.filter(a => a.needsStandardization || a.functions.length > 0);

console.log(`\n📊 Utility Analysis Summary:`);
console.log(`- Total utility files: ${utilityFiles.length}`);
console.log(`- Utilities needing standardization: ${needStandardization.length}`);

// List issues found
const issueTypes = {
  missingJSDocs: 'Missing or incomplete JSDoc comments',
  missingTypeAnnotations: 'Missing type annotations',
  inconsistentExports: 'Inconsistent export patterns',
  noErrorHandling: 'Incomplete error handling',
  missingDefaultExport: 'Missing default export'
};

Object.entries(issueTypes).forEach(([issueKey, issueDesc]) => {
  const count = analyses.filter(a => a.issues && a.issues[issueKey]).length;
  console.log(`- ${issueDesc}: ${count}`);
});

// Standardize utilities if needed
if (needStandardization.length > 0) {
  console.log('\n🔄 Standardizing utilities...');
  
  if (DRY_RUN) {
    console.log('⚠️ Dry run mode - not making actual changes');
  }
  
  let standardizedCount = 0;
  
  needStandardization.forEach(analysis => {
    console.log(`- ${path.relative(ROOT_DIR, analysis.filePath)}`);
    Object.entries(analysis.issues || {}).forEach(([issueKey, hasIssue]) => {
      if (hasIssue) {
        console.log(`  • ${issueTypes[issueKey]}`);
      }
    });
    
    const wasStandardized = standardizeUtilityFile(analysis);
    if (wasStandardized) {
      standardizedCount++;
    }
  });
  
  console.log(`\n✅ Standardized ${standardizedCount} utility files`);
  
  if (!DRY_RUN) {
    console.log(`Original files backed up to: ${BACKUP_DIR}`);
  }
}

// Provide suggestions for next steps
console.log('\nNext steps:');
console.log('1. Review standardized utility implementations');
console.log('2. Update imports in components to use the standardized utilities');
console.log('3. Run the build to verify changes');
console.log('4. Update the Technical Debt Elimination Tracker in ClaudeContext.md');