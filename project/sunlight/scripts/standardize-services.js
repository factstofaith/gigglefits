/**
 * Standardize Services
 * 
 * This script standardizes service implementations across the codebase:
 * - Ensures consistent API service patterns
 * - Adds proper error handling
 * - Standardizes return types
 * - Adds TypeScript typing to services
 * - Implements consistent logging
 * 
 * Usage: node standardize-services.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `services-standardization-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const DRY_RUN = process.argv.includes('--dry-run');

// Create backup directory
if (!DRY_RUN) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
}

// Standard service template
function generateStandardizedService(serviceName, apiEndpoints = [], imports = [], otherFunctions = []) {
  return `/**
 * ${serviceName}
 * 
 * Standardized service implementation
 * Created/Updated by Project Sunlight standardization
 */

import axios from 'axios';
${imports.join('\n')}

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Error handler for standardized error responses
 * @param {Error} error - The error object
 * @returns {Object} Standardized error response
 */
const handleError = (error) => {
  // Create standardized error response
  const standardError = {
    message: error.message || 'An unexpected error occurred',
    status: error.response?.status || 500,
    data: error.response?.data || null,
    timestamp: new Date().toISOString(),
  };

  // Log error details (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('[${serviceName}] API Error:', standardError);
  }

  return standardError;
};

/**
 * ${serviceName} API methods
 */
const ${serviceName} = {
  /**
   * Get API headers including authentication
   * @returns {Object} Headers object
   */
  getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? \`Bearer \${token}\` : '',
    };
  },

${apiEndpoints.map(endpoint => {
  return `  /**
   * ${endpoint.description || `${endpoint.method.toUpperCase()} ${endpoint.path}`}
   * ${endpoint.params ? `* @param {Object} ${endpoint.params} - Request parameters` : ''}
   * @returns {Promise<Object>} Response data or error
   */
  async ${endpoint.name}(${endpoint.params || ''}) {
    try {
      const response = await axios.${endpoint.method.toLowerCase()}(
        \`\${API_BASE_URL}${endpoint.path}\`,
        ${endpoint.method.toLowerCase() === 'get' ? 
          '{ headers: this.getHeaders() }' : 
          `${endpoint.params || '{}'}, { headers: this.getHeaders() }`}
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
`;
}).join('\n')}

${otherFunctions.map(func => `  /**
   * ${func.description || func.name}
   * ${func.params ? `* @param {${func.paramType || 'Object'}} ${func.params} - ${func.paramDesc || 'Parameters'}` : ''}
   * @returns {${func.returnType || 'any'}} ${func.returnDesc || 'Return value'}
   */
  ${func.name}(${func.params || ''}) {
    ${func.body || '// TODO: Implement function body'}
  },`).join('\n\n')}
};

export default ${serviceName};
`;
}

// Function to extract API endpoints from existing service
function extractApiEndpoints(content) {
  const endpoints = [];
  
  // Find axios method calls
  const axiosMethods = ['get', 'post', 'put', 'delete', 'patch'];
  
  axiosMethods.forEach(method => {
    const regex = new RegExp(`axios\\.${method}\\(([^)]+)\\)`, 'g');
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const argsStr = match[1];
      
      // Extract URL
      const urlMatch = argsStr.match(/['"`]([^'"`]+)['"`]/);
      if (urlMatch) {
        const url = urlMatch[1];
        const urlWithoutBase = url.replace(/\${[^}]+}/, '');
        
        // Try to find function name
        const funcRegex = /async\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g;
        let funcMatch;
        let startPos = Math.max(0, match.index - 200); // Look 200 chars back for function declaration
        const contextText = content.substring(startPos, match.index);
        
        let functionName = `${method}Data`;
        let params = '';
        
        while ((funcMatch = funcRegex.exec(contextText)) !== null) {
          functionName = funcMatch[1];
          params = funcMatch[2];
        }
        
        endpoints.push({
          name: functionName,
          method: method,
          path: urlWithoutBase,
          params: params,
          description: `${method.toUpperCase()} request to ${urlWithoutBase}`
        });
      }
    }
  });
  
  return endpoints;
}

// Function to extract other functions from existing service
function extractOtherFunctions(content) {
  const functions = [];
  
  // Find function declarations
  const funcRegex = /(async\s+)?([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/g;
  let match;
  
  while ((match = funcRegex.exec(content)) !== null) {
    const isAsync = !!match[1];
    const functionName = match[2];
    const params = match[3];
    
    // Skip if it's likely an API endpoint function (already handled above)
    if (content.substring(match.index, match.index + 300).includes('axios.')) {
      continue;
    }
    
    // Extract function body
    const startPos = match.index;
    let braceCount = 1;
    let endPos = content.indexOf('{', startPos) + 1;
    
    while (braceCount > 0 && endPos < content.length) {
      const char = content.charAt(endPos);
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      endPos++;
    }
    
    const body = content.substring(
      content.indexOf('{', startPos) + 1, 
      endPos - 1
    ).trim();
    
    functions.push({
      name: functionName,
      params: params,
      body: body,
      isAsync: isAsync,
      description: `${functionName} function`,
      returnType: isAsync ? 'Promise<any>' : 'any'
    });
  }
  
  return functions;
}

// Function to extract imports from existing service
function extractImports(content) {
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"];/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[0]);
  }
  
  // Ensure axios is imported
  if (!imports.some(imp => imp.includes('axios'))) {
    imports.push("import axios from 'axios';");
  }
  
  return imports;
}

// Function to analyze a service file
function analyzeServiceFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, path.extname(filePath));
    const serviceName = fileName.replace(/Service$/, '') + 'Service';
    
    // Check for common issues
    const issues = {
      missingErrorHandling: !content.includes('catch') || !content.includes('error'),
      inconsistentApiCalls: !content.includes('headers') || !content.includes('axios'),
      missingTypes: !content.includes('@param') && !content.includes('@returns'),
      directEndpointCalls: content.includes('fetch(') || content.includes('$.ajax')
    };
    
    return {
      filePath,
      serviceName,
      issues,
      needsStandardization: Object.values(issues).some(issue => issue),
      apiEndpoints: extractApiEndpoints(content),
      otherFunctions: extractOtherFunctions(content),
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

// Function to standardize a service file
function standardizeServiceFile(analysis) {
  if (!analysis.needsStandardization && analysis.apiEndpoints.length === 0) {
    return false;
  }
  
  try {
    const standardService = generateStandardizedService(
      analysis.serviceName,
      analysis.apiEndpoints,
      analysis.imports,
      analysis.otherFunctions
    );
    
    if (!DRY_RUN) {
      // Backup original file
      const relativePath = path.relative(ROOT_DIR, analysis.filePath);
      const backupPath = path.join(BACKUP_DIR, relativePath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(analysis.filePath, backupPath);
      
      // Write standardized file
      fs.writeFileSync(analysis.filePath, standardService, 'utf8');
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error standardizing ${analysis.filePath}:`, error.message);
    return false;
  }
}

// Find all service files
const serviceFiles = glob.sync(`${SERVICES_DIR}/**/*.{js,jsx}`);
console.log(`🔍 Found ${serviceFiles.length} service files to analyze...`);

// Analyze each service file
const analyses = serviceFiles.map(filePath => analyzeServiceFile(filePath));
const needStandardization = analyses.filter(a => a.needsStandardization || a.apiEndpoints.length > 0);

console.log(`\n📊 Service Analysis Summary:`);
console.log(`- Total service files: ${serviceFiles.length}`);
console.log(`- Services needing standardization: ${needStandardization.length}`);

// List issues found
const issueTypes = {
  missingErrorHandling: 'Missing or inconsistent error handling',
  inconsistentApiCalls: 'Inconsistent API calls',
  missingTypes: 'Missing parameter types or return types',
  directEndpointCalls: 'Using direct endpoint calls instead of axios'
};

Object.entries(issueTypes).forEach(([issueKey, issueDesc]) => {
  const count = analyses.filter(a => a.issues && a.issues[issueKey]).length;
  console.log(`- ${issueDesc}: ${count}`);
});

// Standardize services if needed
if (needStandardization.length > 0) {
  console.log('\n🔄 Standardizing services...');
  
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
    
    const wasStandardized = standardizeServiceFile(analysis);
    if (wasStandardized) {
      standardizedCount++;
    }
  });
  
  console.log(`\n✅ Standardized ${standardizedCount} service files`);
  
  if (!DRY_RUN) {
    console.log(`Original files backed up to: ${BACKUP_DIR}`);
  }
}

// Provide suggestions for next steps
console.log('\nNext steps:');
console.log('1. Review standardized service implementations');
console.log('2. Update components to use the new standardized services');
console.log('3. Run the build to verify changes');
console.log('4. Update the Technical Debt Elimination Tracker in ClaudeContext.md');