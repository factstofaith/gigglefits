#!/usr/bin/env node
/**
 * React Hooks Compliance Analyzer
 * 
 * Specialized static analysis tool that detects React Hooks violations:
 * - Hooks in conditionals
 * - Hooks in loops
 * - Hooks in nested functions
 * - Missing dependencies in useEffect/useCallback/useMemo
 * - Invalid ordering of hooks
 * 
 * Features:
 * - AST-based analysis for accurate detection
 * - Automatic fix suggestions
 * - Smart dependency detection for useEffect
 * - Rule enforcement with React team's best practices
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const { execSync } = require('child_process');

// Configuration
const config = {
  rootDir: process.cwd(),
  backupDir: path.resolve(`./project/777_Final/backups/${new Date().toISOString().replace(/:/g, '-')}`),
  outputFile: './hooks-analysis-report.json',
  dryRun: false,
  verbose: false
};

// Parse command line args
const args = process.argv.slice(2);
if (args.includes('--dry-run')) config.dryRun = true;
if (args.includes('--verbose')) config.verbose = true;

// Create backup directory
if (!config.dryRun) {
  fs.mkdirSync(config.backupDir, { recursive: true });
  console.log(`Created backup directory: ${config.backupDir}`);
}

/**
 * Extract variable names that are used inside a function
 */
function extractDependenciesFromFunction(fnNode) {
  const dependencies = new Set();
  
  traverse(fnNode, {
    Identifier(path) {
      // Skip if this identifier is a declaration or a parameter
      if (path.parent.type === 'VariableDeclarator' && path.parent.id === path.node) {
        return;
      }
      if (path.parent.type === 'FunctionDeclaration' && path.parent.params.includes(path.node)) {
        return;
      }
      if (path.parent.type === 'FunctionExpression' && path.parent.params.includes(path.node)) {
        return;
      }
      if (path.parent.type === 'ArrowFunctionExpression' && path.parent.params.includes(path.node)) {
        return;
      }
      
      // Check if it's a reference to a variable that's not in function scope
      if (path.isReferencedIdentifier()) {
        const binding = path.scope.getBinding(path.node.name);
        
        // If binding is null, it's a global or not in scope
        // If binding is outside our function, it's a dependency
        if (!binding || !isAncestor(fnNode, binding.path.node)) {
          // Skip known globals and React hooks
          if (!['React', 'document', 'window', 'console'].includes(path.node.name) && 
              !path.node.name.startsWith('use')) {
            dependencies.add(path.node.name);
          }
        }
      }
    }
  }, fnNode.scope);
  
  return Array.from(dependencies);
}

/**
 * Check if node1 is an ancestor of node2
 */
function isAncestor(node1, node2) {
  let current = node2;
  while (current) {
    if (current === node1) {
      return true;
    }
    current = current._parentPath && current._parentPath.node;
  }
  return false;
}

/**
 * Analyze Hooks usage in a file
 */
function analyzeHooks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
      loc: true
    });
    
    // Track hooks in the order they appear
    const hooksByComponent = new Map();
    let currentComponent = null;
    
    // Track hook declarations vs usage
    const hooksDeclarations = new Map();
    
    traverse(ast, {
      // Track component functions
      FunctionDeclaration(path) {
        const name = path.node.id.name;
        // If first letter is uppercase, likely a component
        if (name[0] === name[0].toUpperCase()) {
          currentComponent = name;
          hooksByComponent.set(currentComponent, []);
        }
      },
      ArrowFunctionExpression(path) {
        if (path.parent.type === 'VariableDeclarator') {
          const name = path.parent.id.name;
          // If first letter is uppercase, likely a component
          if (name[0] === name[0].toUpperCase()) {
            currentComponent = name;
            hooksByComponent.set(currentComponent, []);
          }
        }
      },
      
      // Track class components
      ClassDeclaration(path) {
        const name = path.node.id.name;
        currentComponent = name;
        
        // Check for hooks in class components - always an error
        path.traverse({
          CallExpression(callPath) {
            const callee = callPath.node.callee;
            if (t.isIdentifier(callee) && callee.name.startsWith('use')) {
              issues.push({
                type: 'hooks-in-class-component',
                severity: 'error',
                message: `React Hook '${callee.name}' cannot be used in a class component`,
                component: currentComponent,
                line: callPath.node.loc.start.line,
                column: callPath.node.loc.start.column,
                fix: {
                  type: 'class-to-function',
                  description: 'Convert class component to function component to use hooks',
                  automated: false
                }
              });
            }
          }
        });
      },
      
      // Track hooks in conditional or loop statements
      CallExpression(path) {
        const callee = path.node.callee;
        
        // Check if this is a hook call
        if (t.isIdentifier(callee) && callee.name.startsWith('use')) {
          // Store hook declaration location
          hooksDeclarations.set(callee.name, path.node.loc);
          
          // Check if hook is in a component
          if (currentComponent) {
            const hooks = hooksByComponent.get(currentComponent);
            hooks.push({
              name: callee.name,
              node: path.node
            });
          }
          
          // Check if hook is called conditionally
          let conditionalParent = path.findParent(p => 
            p.isIfStatement() || 
            p.isConditionalExpression() || 
            p.isLogicalExpression() ||
            p.isForStatement() ||
            p.isWhileStatement() ||
            p.isDoWhileStatement() ||
            p.isForInStatement() ||
            p.isForOfStatement()
          );
          
          if (conditionalParent) {
            issues.push({
              type: 'conditional-hook',
              severity: 'error',
              message: `React Hook '${callee.name}' cannot be called inside a ${conditionalParent.type}`,
              component: currentComponent,
              line: path.node.loc.start.line,
              column: path.node.loc.start.column,
              fix: {
                type: 'extract-hook',
                description: 'Move hook outside of conditional statement',
                automated: true,
                replacement: {
                  lookBehind: conditionalParent.node.loc.start.line - 1,
                  extract: content.substring(path.node.loc.start.offset, path.node.loc.end.offset),
                  variableName: `${callee.name.charAt(0).toLowerCase() + callee.name.slice(1)}Result`
                }
              }
            });
          }
          
          // Check if hook is in a nested function
          let nestedFnParent = path.findParent(p => 
            (p.isFunctionDeclaration() || p.isFunctionExpression() || p.isArrowFunctionExpression()) &&
            p.scope !== path.scope.getProgramParent()
          );
          
          if (nestedFnParent) {
            issues.push({
              type: 'nested-hook',
              severity: 'error',
              message: `React Hook '${callee.name}' cannot be called inside a nested function`,
              component: currentComponent,
              line: path.node.loc.start.line,
              column: path.node.loc.start.column,
              fix: {
                type: 'move-hook',
                description: 'Move hook to the top level of component function',
                automated: false
              }
            });
          }
          
          // Check dependency arrays in useEffect, useCallback, useMemo
          if (['useEffect', 'useCallback', 'useMemo'].includes(callee.name) && path.node.arguments.length > 1) {
            const depArray = path.node.arguments[1];
            
            // No dependency array provided or empty array
            if (!depArray || (t.isArrayExpression(depArray) && depArray.elements.length === 0)) {
              // For useEffect with empty array but has dependencies
              const callbackFn = path.node.arguments[0];
              if (callee.name === 'useEffect' && t.isArrowFunctionExpression(callbackFn)) {
                const extractedDeps = extractDependenciesFromFunction(callbackFn);
                
                if (extractedDeps.length > 0) {
                  issues.push({
                    type: 'missing-dependencies',
                    severity: 'warning',
                    message: `React Hook ${callee.name} has missing dependencies: ${extractedDeps.join(', ')}`,
                    component: currentComponent,
                    line: path.node.loc.start.line,
                    column: path.node.loc.start.column,
                    missingDeps: extractedDeps,
                    fix: {
                      type: 'add-dependencies',
                      description: `Add missing dependencies: ${extractedDeps.join(', ')}`,
                      automated: true,
                      depArray: extractedDeps
                    }
                  });
                }
              }
            }
            // Check for dependencies that change too often - performance issue
            else if (t.isArrayExpression(depArray) && depArray.elements.length > 5) {
              issues.push({
                type: 'excessive-dependencies',
                severity: 'warning',
                message: `React Hook ${callee.name} has too many dependencies (${depArray.elements.length})`,
                component: currentComponent,
                line: path.node.loc.start.line,
                column: path.node.loc.start.column,
                fix: {
                  type: 'memoize-values',
                  description: 'Consider memoizing some values to reduce dependency changes',
                  automated: false
                }
              });
            }
          }
        }
      }
    });
    
    // Check hook ordering violations
    hooksByComponent.forEach((hooks, component) => {
      const conditionalHooks = new Set();
      
      // Map to track if we've seen a particular hook type
      const hooksSeen = new Set();
      
      for (let i = 0; i < hooks.length; i++) {
        const hook = hooks[i];
        
        // Check if we have a conditional hook
        const hookParent = hook.node._paths && hook.node._paths[0].findParent(p => 
          p.isIfStatement() || p.isConditionalExpression() || p.isLogicalExpression()
        );
        
        if (hookParent) {
          conditionalHooks.add(hook.name);
        }
        
        // Check if hooks are called in consistent order
        if (hooksSeen.has(hook.name) && !conditionalHooks.has(hook.name)) {
          // Only non-conditional hooks need consistent ordering
          const firstCall = hooks.find(h => h.name === hook.name);
          
          issues.push({
            type: 'inconsistent-hook-order',
            severity: 'error',
            message: `React Hook '${hook.name}' is called conditionally or multiple times in the same component`,
            component,
            line: hook.node.loc.start.line,
            column: hook.node.loc.start.column,
            firstCall: firstCall.node.loc.start.line,
            fix: {
              type: 'fix-hook-order',
              description: 'Ensure hooks are called in the same order on every render',
              automated: false
            }
          });
        }
        
        hooksSeen.add(hook.name);
      }
    });
    
  } catch (error) {
    issues.push({
      type: 'parse-error',
      severity: 'error',
      message: `Failed to parse file: ${error.message}`,
      line: error.loc ? error.loc.line : 0,
      column: error.loc ? error.loc.column : 0
    });
  }
  
  return issues;
}

/**
 * Apply automated fixes to hooks issues
 */
function applyFixes(filePath, issues) {
  if (config.dryRun) {
    console.log(`[DRY RUN] Would fix ${issues.length} issues in ${filePath}`);
    return true;
  }
  
  // Create backup
  const backupPath = path.join(config.backupDir, `${path.basename(filePath)}.${Date.now()}.backup`);
  fs.copyFileSync(filePath, backupPath);
  if (config.verbose) {
    console.log(`Created backup: ${backupPath}`);
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Sort issues by location (descending) to avoid offset changes
  const fixableIssues = issues
    .filter(issue => issue.fix && issue.fix.automated)
    .sort((a, b) => b.line - a.line || b.column - a.column);
  
  for (const issue of fixableIssues) {
    const fix = issue.fix;
    
    if (fix.type === 'extract-hook') {
      // Extract hook from conditional
      const lines = content.split('\n');
      const hookCall = fix.replacement.extract;
      const beforeLine = lines[fix.replacement.lookBehind];
      const indentation = beforeLine.match(/^(\s*)/)[1];
      
      // Add variable declaration before conditional
      const newLine = `${indentation}const ${fix.replacement.variableName} = ${hookCall};`;
      lines.splice(fix.replacement.lookBehind + 1, 0, newLine);
      
      // Replace hook call with the variable
      const modifiedContent = lines.join('\n').replace(hookCall, fix.replacement.variableName);
      content = modifiedContent;
      modified = true;
      
    } else if (fix.type === 'add-dependencies') {
      // Add missing dependencies to dependency array
      const lines = content.split('\n');
      const line = lines[issue.line - 1];
      
      // Find the end of useEffect call
      const matches = line.match(/useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*\},\s*\[\s*\]\)/);
      if (matches) {
        const newLine = line.replace(/\[\s*\]\)/, `[${fix.depArray.join(', ')}])`);
        lines[issue.line - 1] = newLine;
        content = lines.join('\n');
        modified = true;
      }
    }
  }
  
  if (modified) {
    // Write changes
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${fixableIssues.length} issues in ${filePath}`);
    
    // Validate the fixes
    try {
      execSync(`npx eslint --no-eslintrc --parser-options=jsx=true --parser=@babel/eslint-parser ${filePath}`, { stdio: 'pipe' });
      console.log(`Validation passed for ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Validation failed for ${filePath}, restoring from backup`);
      fs.copyFileSync(backupPath, filePath);
      return false;
    }
  }
  
  return true;
}

/**
 * Scan for files with potential hooks
 */
function findFilesWithHooks(rootDir) {
  const result = [];
  const queue = [rootDir];
  
  while (queue.length > 0) {
    const dir = queue.shift();
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (item === 'node_modules' || item.startsWith('.')) continue;
      
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        queue.push(itemPath);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx'))) {
        // Quick check for hooks usage to avoid processing all files
        const content = fs.readFileSync(itemPath, 'utf8');
        if (content.includes('use') && 
           (content.includes('useState') || 
            content.includes('useEffect') || 
            content.includes('useContext') ||
            content.includes('useReducer') ||
            content.includes('useCallback') ||
            content.includes('useMemo'))) {
          result.push(itemPath);
        }
      }
    }
  }
  
  return result;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Scanning for React Hooks issues...');
  
  // Find files likely containing hooks
  const files = findFilesWithHooks(config.rootDir);
  console.log(`Found ${files.length} files with potential React Hooks usage`);
  
  const allIssues = [];
  let fixedCount = 0;
  let errorCount = 0;
  
  // Process each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`[${i+1}/${files.length}] Analyzing ${file}`);
    
    const issues = analyzeHooks(file);
    if (issues.length > 0) {
      console.log(`  Found ${issues.length} issues`);
      
      // Apply fixes where possible
      if (applyFixes(file, issues)) {
        fixedCount++;
      } else {
        errorCount++;
      }
      
      // Store issues for reporting
      allIssues.push({
        filePath: file,
        issues
      });
    }
  }
  
  // Write report
  const outputDir = path.dirname(config.outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(config.outputFile, JSON.stringify(allIssues, null, 2));
  
  // Print summary
  console.log('\n=== React Hooks Analysis Summary ===');
  console.log(`Total files analyzed: ${files.length}`);
  console.log(`Files with issues: ${allIssues.length}`);
  console.log(`Total issues found: ${allIssues.reduce((sum, file) => sum + file.issues.length, 0)}`);
  console.log(`Files fixed: ${fixedCount}`);
  console.log(`Files with errors: ${errorCount}`);
  console.log(`\nDetailed report saved to ${config.outputFile}`);
  
  // Generate HTML report
  generateHtmlReport(allIssues);
}

/**
 * Generate HTML report
 */
function generateHtmlReport(fileIssues) {
  const reportPath = config.outputFile.replace('.json', '.html');
  
  // Count issues by type
  const issueTypes = {};
  let totalIssues = 0;
  
  fileIssues.forEach(file => {
    file.issues.forEach(issue => {
      if (!issueTypes[issue.type]) {
        issueTypes[issue.type] = 0;
      }
      issueTypes[issue.type]++;
      totalIssues++;
    });
  });
  
  // Generate HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>React Hooks Compliance Report</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; margin: 0; padding: 20px; }
    .header { margin-bottom: 20px; }
    .summary { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 30px; }
    .summary-item { flex: 1; min-width: 200px; background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .summary-item.error { background: #ffebee; }
    .summary-item.warning { background: #fff8e1; }
    .file { margin-bottom: 30px; }
    .file-header { background: #f5f5f5; padding: 10px; cursor: pointer; }
    .issue { padding: 10px; border-left: 3px solid #ddd; margin: 10px 0; }
    .issue.error { border-left-color: #f44336; }
    .issue.warning { border-left-color: #ff9800; }
    .fix { background: #e8f5e9; padding: 10px; margin-top: 10px; border-radius: 5px; }
    code { font-family: monospace; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>React Hooks Compliance Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="summary">
    <div class="summary-item">
      <h3>Total Issues</h3>
      <div>${totalIssues}</div>
    </div>
    <div class="summary-item">
      <h3>Files with Issues</h3>
      <div>${fileIssues.length}</div>
    </div>
    ${Object.entries(issueTypes).map(([type, count]) => `
      <div class="summary-item ${type.includes('error') ? 'error' : 'warning'}">
        <h3>${type}</h3>
        <div>${count}</div>
      </div>
    `).join('')}
  </div>
  
  <h2>Issues by File</h2>
  ${fileIssues.map(file => `
    <div class="file">
      <div class="file-header" onclick="toggleFile('${path.basename(file.filePath)}')">
        <h3>${file.filePath} (${file.issues.length} issues)</h3>
      </div>
      <div id="${path.basename(file.filePath)}" class="issues">
        ${file.issues.map(issue => `
          <div class="issue ${issue.severity}">
            <div><strong>${issue.type}</strong> - Line ${issue.line}</div>
            <div>${issue.message}</div>
            ${issue.component ? `<div>Component: <code>${issue.component}</code></div>` : ''}
            ${issue.fix ? `
              <div class="fix">
                <strong>Suggested Fix:</strong> ${issue.fix.description}
                ${issue.fix.automated ? '<span>(Automated)</span>' : '<span>(Manual)</span>'}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')}
  
  <script>
    function toggleFile(id) {
      const element = document.getElementById(id);
      element.classList.toggle('hidden');
    }
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(`HTML report saved to ${reportPath}`);
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});