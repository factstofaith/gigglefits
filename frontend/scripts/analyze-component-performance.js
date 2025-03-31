#!/usr/bin/env node

/**
 * Component Performance Analyzer
 * 
 * A utility for analyzing React components and identifying performance
 * optimization opportunities, generating optimization recommendations.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const babel = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Configuration
const config = {
  componentBasePath: path.resolve(__dirname, '../src/components'),
  outputPath: path.resolve(__dirname, '../performance-reports'),
  ignorePatterns: ['node_modules', 'dist', 'build', '.git', '__tests__', '__snapshots__'],
  issuePatterns: {
    inlineObjectCreation: /\{\s*[a-zA-Z0-9_]+\s*:\s*[^,\}]+\s*(,\s*[a-zA-Z0-9_]+\s*:\s*[^,\}]+\s*)*\}/g,
    inlineFunctionCreation: /(\(\)\s*=>\s*\{|\(\s*[a-zA-Z0-9_,\s]+\s*\)\s*=>\s*\{|\sfunction\s*\([^)]*\)\s*\{)/g,
    missingDependencies: /useEffect\(\(\)\s*=>\s*\{[^}]*\},\s*\[\s*\]\)/g,
    nonMemoizedComponent: /^(function|const)\s+([A-Z][a-zA-Z0-9_]*)\s*=/m,
    nonCallbackHandler: /const\s+handle[A-Z][a-zA-Z0-9_]*\s*=\s*\([^)]*\)\s*=>/
  }
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Process command line arguments
const args = process.argv.slice(2);
const flags = {
  help: args.includes('--help') || args.includes('-h'),
  recursive: args.includes('--recursive') || args.includes('-r'),
  fix: args.includes('--fix') || args.includes('-f'),
  verbose: args.includes('--verbose') || args.includes('-v')
};

// Extract arguments that aren't flags
const nonFlagArgs = args.filter(arg => !arg.startsWith('-'));

/**
 * Show help information
 */
function showHelp() {
  console.log(`
  Component Performance Analyzer
  ------------------------------
  A tool for analyzing React components and identifying performance optimization opportunities.
  
  Usage:
    npm run analyze-performance -- [options] [ComponentPath]
  
  Options:
    --help, -h          : Show this help information
    --recursive, -r     : Recursively analyze all components in directory
    --fix, -f           : Attempt to automatically fix identified issues
    --verbose, -v       : Show detailed analysis information
  
  Examples:
    npm run analyze-performance -- src/components/integration/IntegrationTable.jsx
    npm run analyze-performance -- src/components/common --recursive
    npm run analyze-performance -- --fix src/components/integration/DataPreview.jsx
  `);
  rl.close();
}

/**
 * Check if a file exists
 * 
 * @param {string} filePath - Path to check
 * @returns {boolean} Whether the file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

/**
 * Check if a path is a directory
 * 
 * @param {string} dirPath - Path to check
 * @returns {boolean} Whether the path is a directory
 */
function isDirectory(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * Get all component files in a directory
 * 
 * @param {string} dirPath - Directory to scan
 * @param {boolean} recursive - Whether to scan recursively
 * @returns {Array<string>} Array of component file paths
 */
function getComponentFiles(dirPath, recursive = false) {
  if (!isDirectory(dirPath)) {
    if (dirPath.endsWith('.jsx') || dirPath.endsWith('.js') || dirPath.endsWith('.tsx')) {
      return [dirPath];
    }
    return [];
  }
  
  const files = [];
  const entries = fs.readdirSync(dirPath);
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    
    // Skip ignored patterns
    if (config.ignorePatterns.some(pattern => entry.includes(pattern))) {
      continue;
    }
    
    // If directory and recursive, scan subdirectory
    if (isDirectory(fullPath) && recursive) {
      files.push(...getComponentFiles(fullPath, recursive));
    } 
    // If React component file, add to list
    else if (
      (entry.endsWith('.jsx') || entry.endsWith('.js') || entry.endsWith('.tsx')) &&
      !entry.endsWith('.test.jsx') && 
      !entry.endsWith('.spec.jsx') &&
      !entry.endsWith('.test.js') && 
      !entry.endsWith('.spec.js')
    ) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Parse a component file and identify performance issues
 * 
 * @param {string} filePath - Path to the component file
 * @returns {Object} Analysis results
 */
function analyzeComponentFile(filePath) {
  const result = {
    componentName: path.basename(filePath, path.extname(filePath)),
    filePath,
    issues: [],
    optimization: {
      memoizationNeeded: false,
      callbackOptimizations: [],
      effectOptimizations: [],
      renderOptimizations: []
    }
  };
  
  try {
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Simple pattern-based analysis
    performPatternAnalysis(fileContent, result);
    
    // AST-based analysis
    performAstAnalysis(fileContent, result);
    
    return result;
  } catch (error) {
    result.issues.push({
      type: 'error',
      message: `Error analyzing file: ${error.message}`,
      line: 0,
      column: 0,
      severity: 'error'
    });
    return result;
  }
}

/**
 * Perform pattern-based analysis on a component file
 * 
 * @param {string} fileContent - Content of the component file
 * @param {Object} result - Analysis result object to update
 */
function performPatternAnalysis(fileContent, result) {
  const lines = fileContent.split('\n');
  
  // Check for inline object creation in render
  const inlineObjectMatches = [];
  const jsxStartLine = fileContent.indexOf('return (');
  if (jsxStartLine !== -1) {
    const jsxContent = fileContent.substring(jsxStartLine);
    const matches = jsxContent.match(config.issuePatterns.inlineObjectCreation) || [];
    matches.forEach(match => {
      inlineObjectMatches.push(match);
    });
  }
  
  if (inlineObjectMatches.length > 0) {
    result.issues.push({
      type: 'inline-object',
      message: `Found ${inlineObjectMatches.length} inline object creation(s) in render. Consider using useMemo or moving to component scope.`,
      count: inlineObjectMatches.length,
      severity: 'warning'
    });
    
    result.optimization.renderOptimizations.push({
      type: 'extract-inline-objects',
      description: 'Extract inline objects to component scope or use useMemo'
    });
  }
  
  // Check for inline function creation in render
  const inlineFunctionMatches = [];
  if (jsxStartLine !== -1) {
    const jsxContent = fileContent.substring(jsxStartLine);
    const matches = jsxContent.match(config.issuePatterns.inlineFunctionCreation) || [];
    matches.forEach(match => {
      inlineFunctionMatches.push(match);
    });
  }
  
  if (inlineFunctionMatches.length > 0) {
    result.issues.push({
      type: 'inline-function',
      message: `Found ${inlineFunctionMatches.length} inline function creation(s) in render. Consider using useCallback.`,
      count: inlineFunctionMatches.length,
      severity: 'warning'
    });
    
    result.optimization.renderOptimizations.push({
      type: 'extract-inline-functions',
      description: 'Extract inline functions using useCallback'
    });
  }
  
  // Check for empty dependency arrays in useEffect
  const emptyDependencyMatches = fileContent.match(config.issuePatterns.missingDependencies) || [];
  if (emptyDependencyMatches.length > 0) {
    result.issues.push({
      type: 'empty-dependencies',
      message: `Found ${emptyDependencyMatches.length} useEffect hook(s) with empty dependency arrays. Verify if dependencies are missing.`,
      count: emptyDependencyMatches.length,
      severity: 'warning'
    });
    
    result.optimization.effectOptimizations.push({
      type: 'add-missing-dependencies',
      description: 'Add missing dependencies to useEffect dependency arrays'
    });
  }
  
  // Check if component is not memoized
  if (fileContent.match(config.issuePatterns.nonMemoizedComponent) && !fileContent.includes('React.memo') && !fileContent.includes('memo(')) {
    result.issues.push({
      type: 'non-memoized',
      message: 'Component is not memoized. Consider using React.memo for better performance.',
      severity: 'info'
    });
    
    result.optimization.memoizationNeeded = true;
  }
  
  // Check for event handlers not using useCallback
  const nonCallbackHandlers = fileContent.match(config.issuePatterns.nonCallbackHandler) || [];
  if (nonCallbackHandlers.length > 0) {
    result.issues.push({
      type: 'non-callback-handler',
      message: `Found ${nonCallbackHandlers.length} event handler(s) not using useCallback.`,
      count: nonCallbackHandlers.length,
      severity: 'info'
    });
    
    result.optimization.callbackOptimizations.push({
      type: 'add-useCallback',
      description: 'Wrap event handlers with useCallback'
    });
  }
}

/**
 * Perform AST-based analysis on a component file
 * 
 * @param {string} fileContent - Content of the component file
 * @param {Object} result - Analysis result object to update
 */
function performAstAnalysis(fileContent, result) {
  try {
    // Parse the component with babel
    const ast = babel.parse(fileContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    // Track component information
    const componentInfo = {
      name: '',
      hooks: [],
      stateVariables: [],
      props: [],
      renderCount: 0
    };
    
    // Traverse the AST
    traverse(ast, {
      // Find component declaration
      VariableDeclarator(path) {
        if (path.node.id.name && path.node.id.name[0] === path.node.id.name[0].toUpperCase()) {
          componentInfo.name = path.node.id.name;
        }
      },
      
      // Find React hooks
      CallExpression(path) {
        if (path.node.callee.name && path.node.callee.name.startsWith('use')) {
          componentInfo.hooks.push(path.node.callee.name);
        }
        
        // Check useState specifically
        if (path.node.callee.name === 'useState') {
          if (path.parent.id && path.parent.id.elements && path.parent.id.elements[0]) {
            componentInfo.stateVariables.push(path.parent.id.elements[0].name);
          }
        }
      },
      
      // Find component props
      ObjectPattern(path) {
        if (path.parent.params && path.parent.params[0] === path.node) {
          path.node.properties.forEach(prop => {
            if (prop.key && prop.key.name) {
              componentInfo.props.push(prop.key.name);
            }
          });
        }
      },
      
      // Find component render
      ReturnStatement(path) {
        if (path.findParent(p => p.isFunctionExpression() || p.isArrowFunctionExpression())) {
          componentInfo.renderCount++;
        }
      }
    });
    
    // Add component info to result
    result.componentInfo = componentInfo;
    
    // Analyze state and re-render relationship
    const stateCount = componentInfo.stateVariables.length;
    if (stateCount > 3) {
      result.issues.push({
        type: 'excessive-state',
        message: `Component has ${stateCount} state variables. Consider consolidating state or using useReducer.`,
        severity: 'warning'
      });
      
      result.optimization.renderOptimizations.push({
        type: 'consolidate-state',
        description: 'Consolidate related state variables or use useReducer'
      });
    }
    
    // Analyze hooks usage
    const hookCounts = componentInfo.hooks.reduce((acc, hook) => {
      acc[hook] = (acc[hook] || 0) + 1;
      return acc;
    }, {});
    
    // Check for missing performance hooks
    if (!hookCounts.useMemo && !hookCounts.useCallback && componentInfo.props.length > 2) {
      result.issues.push({
        type: 'missing-perf-hooks',
        message: 'Component with multiple props is not using performance hooks (useMemo, useCallback).',
        severity: 'info'
      });
      
      result.optimization.renderOptimizations.push({
        type: 'add-performance-hooks',
        description: 'Add useMemo and useCallback for expensive calculations and handlers'
      });
    }
    
  } catch (error) {
    // AST parsing failed, but we already did pattern analysis
    if (flags.verbose) {
      console.warn(`AST analysis failed for ${result.componentName}: ${error.message}`);
    }
  }
}

/**
 * Generate an HTML report from analysis results
 * 
 * @param {Array<Object>} results - Analysis results for multiple components
 * @param {string} outputPath - Path to write the report
 * @returns {string} Path to the generated report
 */
function generateHtmlReport(results, outputPath) {
  const reportDate = new Date().toISOString().split('T')[0];
  const reportPath = path.join(outputPath, `performance-report-${reportDate}.html`);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  // Count issues by severity
  const issueCount = {
    error: 0,
    warning: 0,
    info: 0
  };
  
  results.forEach(result => {
    result.issues.forEach(issue => {
      issueCount[issue.severity] = (issueCount[issue.severity] || 0) + 1;
    });
  });
  
  // Generate HTML content
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Performance Analysis Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #0066cc;
    }
    .summary {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    .summary-card {
      background-color: #f5f5f5;
      border-radius: 5px;
      padding: 15px;
      flex: 1;
    }
    .severity-error {
      color: #d32f2f;
    }
    .severity-warning {
      color: #f57c00;
    }
    .severity-info {
      color: #0288d1;
    }
    .component-card {
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .component-header {
      background-color: #f5f5f5;
      padding: 10px 15px;
      border-bottom: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .component-body {
      padding: 15px;
    }
    .issues-table {
      width: 100%;
      border-collapse: collapse;
    }
    .issues-table th, .issues-table td {
      text-align: left;
      padding: 8px;
      border-bottom: 1px solid #ddd;
    }
    .issues-table th {
      background-color: #f5f5f5;
    }
    .optimization-section {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge-error {
      background-color: #ffebee;
      color: #d32f2f;
    }
    .badge-warning {
      background-color: #fff3e0;
      color: #f57c00;
    }
    .badge-info {
      background-color: #e1f5fe;
      color: #0288d1;
    }
    .badge-success {
      background-color: #e8f5e9;
      color: #388e3c;
    }
  </style>
</head>
<body>
  <h1>Component Performance Analysis Report</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <div class="summary-card">
      <h3>Components Analyzed</h3>
      <p><strong>${results.length}</strong> components</p>
    </div>
    <div class="summary-card">
      <h3>Issues Found</h3>
      <p>
        <span class="severity-error">${issueCount.error || 0} errors</span><br>
        <span class="severity-warning">${issueCount.warning || 0} warnings</span><br>
        <span class="severity-info">${issueCount.info || 0} infos</span>
      </p>
    </div>
    <div class="summary-card">
      <h3>Top Optimizations</h3>
      <p>
        ${results.filter(r => r.optimization.memoizationNeeded).length} components need memoization<br>
        ${results.reduce((sum, r) => sum + r.optimization.callbackOptimizations.length, 0)} callback optimizations<br>
        ${results.reduce((sum, r) => sum + r.optimization.renderOptimizations.length, 0)} render optimizations
      </p>
    </div>
  </div>
  
  <h2>Component Analysis</h2>
  
  ${results.map(result => `
    <div class="component-card">
      <div class="component-header">
        <h3>${result.componentName}</h3>
        <div>
          ${result.issues.length === 0 
            ? '<span class="badge badge-success">No Issues</span>' 
            : `<span class="badge badge-${result.issues.some(i => i.severity === 'error') ? 'error' : result.issues.some(i => i.severity === 'warning') ? 'warning' : 'info'}">${result.issues.length} issues</span>`
          }
        </div>
      </div>
      <div class="component-body">
        <p><strong>File:</strong> ${result.filePath}</p>
        
        ${result.componentInfo ? `
          <div>
            <p><strong>Props:</strong> ${result.componentInfo.props.join(', ') || 'None'}</p>
            <p><strong>State Variables:</strong> ${result.componentInfo.stateVariables.join(', ') || 'None'}</p>
            <p><strong>Hooks:</strong> ${result.componentInfo.hooks.join(', ') || 'None'}</p>
          </div>
        ` : ''}
        
        ${result.issues.length > 0 ? `
          <h4>Issues</h4>
          <table class="issues-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Message</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              ${result.issues.map(issue => `
                <tr>
                  <td>${issue.type}</td>
                  <td>${issue.message}</td>
                  <td><span class="badge badge-${issue.severity}">${issue.severity}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No issues found.</p>'}
        
        <div class="optimization-section">
          <h4>Recommended Optimizations</h4>
          ${result.optimization.memoizationNeeded ? '<p>✓ Memoize component using React.memo</p>' : ''}
          
          ${result.optimization.callbackOptimizations.length > 0 ? `
            <p><strong>Callback Optimizations:</strong></p>
            <ul>
              ${result.optimization.callbackOptimizations.map(opt => `
                <li>${opt.description}</li>
              `).join('')}
            </ul>
          ` : ''}
          
          ${result.optimization.effectOptimizations.length > 0 ? `
            <p><strong>Effect Optimizations:</strong></p>
            <ul>
              ${result.optimization.effectOptimizations.map(opt => `
                <li>${opt.description}</li>
              `).join('')}
            </ul>
          ` : ''}
          
          ${result.optimization.renderOptimizations.length > 0 ? `
            <p><strong>Render Optimizations:</strong></p>
            <ul>
              ${result.optimization.renderOptimizations.map(opt => `
                <li>${opt.description}</li>
              `).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('')}
</body>
</html>
  `;
  
  // Write the report
  fs.writeFileSync(reportPath, htmlContent);
  
  return reportPath;
}

/**
 * Main function
 */
async function main() {
  // Show help if requested
  if (flags.help) {
    showHelp();
    return;
  }
  
  // Get component path
  let componentPath = nonFlagArgs[0] || config.componentBasePath;
  if (!path.isAbsolute(componentPath)) {
    componentPath = path.join(process.cwd(), componentPath);
  }
  
  // Check if path exists
  if (!fileExists(componentPath)) {
    console.error(`Error: Path ${componentPath} does not exist.`);
    rl.close();
    return;
  }
  
  // Get components to analyze
  const componentFiles = getComponentFiles(componentPath, flags.recursive);
  
  if (componentFiles.length === 0) {
    console.error(`Error: No component files found at ${componentPath}.`);
    rl.close();
    return;
  }
  
  console.log(`Analyzing ${componentFiles.length} component files...`);
  
  // Analyze each component
  const results = [];
  for (const filePath of componentFiles) {
    if (flags.verbose) {
      console.log(`Analyzing ${filePath}...`);
    }
    
    const result = analyzeComponentFile(filePath);
    results.push(result);
    
    if (flags.verbose) {
      console.log(`Found ${result.issues.length} issues in ${result.componentName}.`);
    }
  }
  
  // Generate report
  const reportPath = generateHtmlReport(results, config.outputPath);
  console.log(`Analysis complete. Report saved to ${reportPath}`);
  
  // Summary of findings
  const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0);
  console.log(`Found ${totalIssues} issues in ${results.length} components.`);
  
  // Components with the most issues
  const sortedByIssues = [...results].sort((a, b) => b.issues.length - a.issues.length);
  if (sortedByIssues.length > 0 && sortedByIssues[0].issues.length > 0) {
    console.log('\nComponents with the most issues:');
    sortedByIssues.slice(0, 5).forEach(result => {
      if (result.issues.length > 0) {
        console.log(`- ${result.componentName}: ${result.issues.length} issues`);
      }
    });
  }
  
  rl.close();
}

// Start the program
main();