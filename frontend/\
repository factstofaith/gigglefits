#!/usr/bin/env node
/**
 * Static Code Analyzer for React/JSX Codebase
 * 
 * This script performs rapid static analysis of React components and JavaScript files
 * to identify build and test compatibility issues without running npm.
 * 
 * Features:
 * - AST-based parsing for accurate issue detection
 * - Parallel file processing for speed
 * - Root cause categorization
 * - Build AND test compatibility validation
 * - Automatic issue prioritization
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');

// Configuration
const numCPUs = os.cpus().length;
const extensions = ['.js', '.jsx'];
const config = {
  rootDir: process.cwd(),
  ignoreDirs: ['node_modules', 'build', 'dist', '.git'],
  outputFile: './static-analysis-report.json',
  categoriesFile: './issue-categories.json'
};

// Root cause categories
const categories = {
  JSX_SYNTAX: {
    name: 'JSX Syntax Issues',
    patterns: [
      { id: 'unclosed-jsx-tag', pattern: /(<[A-Za-z][A-Za-z0-9\-]*)(?!.*?<\/[A-Za-z][A-Za-z0-9\-]*>)/ },
      { id: 'improper-self-closing', pattern: /(\S)\/>/ },
      { id: 'unmatched-closing-tag', pattern: /<\/([A-Za-z][A-Za-z0-9\-]*)>(?!.*?<\1)/ }
    ],
    fix: (content, issue) => {
      // Various fixes based on issue type
      if (issue.id === 'improper-self-closing') {
        return content.replace(/(\S)\/>/g, '$1 />');
      }
      return content;
    }
  },
  IMPORT_EXPORT: {
    name: 'Import/Export Issues',
    patterns: [
      { id: 'empty-import', pattern: /import\s+from\s+['"][^'"]+['"]/ },
      { id: 'duplicate-export', pattern: /export\s+default\s+([A-Za-z][A-Za-z0-9_$]*)/g },
      { id: 'invalid-export-name', pattern: /export\s+{\s*[^}]*[a-zA-Z]+-[a-zA-Z]+[^}]*\s*}\s+from/ }
    ],
    fix: (content, issue) => {
      if (issue.id === 'empty-import') {
        return content.replace(/import\s+from\s+['"]([^'"]+)['"]/g, "// Removed empty import from '$1'");
      } else if (issue.id === 'invalid-export-name') {
        return content.replace(/export\s+{\s*[^}]*[a-zA-Z]+-[a-zA-Z]+[^}]*\s*}\s+from/g, 
          match => match.replace(/-/g, '_'));
      }
      return content;
    }
  },
  REACT_HOOKS: {
    name: 'React Hooks Issues',
    patterns: [
      { id: 'hooks-in-conditionals', pattern: /if\s*\([^)]*\)\s*\{\s*use[A-Z][a-zA-Z]*/ },
      { id: 'hooks-in-classes', pattern: /class\s+[A-Za-z][A-Za-z0-9_$]*\s+extends\s+[A-Za-z][A-Za-z0-9_$.]*[\s\S]*?use[A-Z][a-zA-Z]*\(/ }
    ],
    astValidation: (ast, filePath) => {
      const issues = [];
      try {
        traverse(ast, {
          ClassDeclaration(path) {
            // Check for React hooks inside class components
            path.traverse({
              CallExpression(callPath) {
                const callee = callPath.node.callee;
                if (t.isIdentifier(callee) && callee.name.startsWith('use')) {
                  issues.push({
                    category: 'REACT_HOOKS',
                    id: 'hooks-in-classes',
                    message: `React Hook '${callee.name}' cannot be used in a class component`,
                    location: callPath.node.loc,
                    severity: 'error',
                    filePath
                  });
                }
              }
            });
          },
          ConditionalExpression(path) {
            // Check for React hooks inside conditionals
            path.traverse({
              CallExpression(callPath) {
                const callee = callPath.node.callee;
                if (t.isIdentifier(callee) && callee.name.startsWith('use')) {
                  issues.push({
                    category: 'REACT_HOOKS',
                    id: 'hooks-in-conditionals',
                    message: `React Hook '${callee.name}' cannot be used in a conditional`,
                    location: callPath.node.loc,
                    severity: 'error',
                    filePath
                  });
                }
              }
            });
          }
        });
      } catch (error) {
        console.error(`Error traversing AST for ${filePath}:`, error);
      }
      return issues;
    }
  },
  TEMPLATE_LITERALS: {
    name: 'Template Literal Issues',
    patterns: [
      { id: 'nested-expressions', pattern: /`[^`]*\${[^}]*\${[^}]*}[^}]*}[^`]*`/ },
      { id: 'unterminated-expressions', pattern: /`[^`]*\${(?![^`]*}[^`]*$)/ }
    ],
    fix: (content, issue) => {
      if (issue.id === 'nested-expressions') {
        return content.replace(/`([^`]*)\${([^}]*)}\${([^}]*)}`/g, '`$1${$2}${$3}`');
      }
      return content;
    }
  },
  TEST_COMPATIBILITY: {
    name: 'Test Compatibility Issues',
    astValidation: (ast, filePath) => {
      const issues = [];
      try {
        traverse(ast, {
          // Find potential mocking issues that would cause test failures
          ImportDeclaration(path) {
            const source = path.node.source.value;
            if (source.includes('msw') || source.includes('jest')) {
              // Look for potentially problematic mock setups
              if (source === 'msw' && filePath.includes('services')) {
                issues.push({
                  category: 'TEST_COMPATIBILITY',
                  id: 'msw-in-service',
                  message: 'Using MSW directly in service file may cause test conflicts',
                  location: path.node.loc,
                  severity: 'warning',
                  filePath
                });
              }
            }
          }
        });
      } catch (error) {
        console.error(`Error traversing AST for ${filePath}:`, error);
      }
      return issues;
    }
  }
};

// Track files that affect both build and tests
const criticalFiles = [
  { pattern: /\/services\/.*\.js$/, reason: 'Service file used by both app and tests' },
  { pattern: /\/contexts\/.*\.jsx$/, reason: 'Context provider used by both app and tests' },
  { pattern: /\/utils\/.*\.js$/, reason: 'Utility function used by both app and tests' },
  { pattern: /\/components\/common\/.*\.jsx$/, reason: 'Common component used in many places' }
];

/**
 * Performs static analysis on a single file
 */
async function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const filename = path.basename(filePath);

  // Check if this is a critical file affecting both build and tests
  const isCriticalFile = criticalFiles.some(cf => cf.pattern.test(filePath));
  
  // Pattern-based checks
  Object.entries(categories).forEach(([categoryKey, category]) => {
    if (category.patterns) {
      category.patterns.forEach(pattern => {
        const matches = content.match(pattern.pattern);
        if (matches) {
          matches.forEach(match => {
            issues.push({
              category: categoryKey,
              id: pattern.id,
              message: `Found ${pattern.id} issue: "${match.substring(0, 50)}${match.length > 50 ? '...' : ''}"`,
              severity: 'error',
              filePath,
              isCriticalFile,
              match
            });
          });
        }
      });
    }
  });

  // AST-based checks for more complex issues
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy']
    });

    // Run AST validations for each category
    Object.entries(categories).forEach(([categoryKey, category]) => {
      if (category.astValidation) {
        const astIssues = category.astValidation(ast, filePath);
        issues.push(...astIssues.map(issue => ({
          ...issue,
          isCriticalFile
        })));
      }
    });
  } catch (error) {
    issues.push({
      category: 'PARSE_ERROR',
      id: 'parse-error',
      message: `Failed to parse file: ${error.message}`,
      severity: 'error',
      filePath,
      isCriticalFile
    });
  }

  return issues;
}

/**
 * Worker thread function for parallel processing
 */
function workerFunction() {
  const { filePaths } = workerData;
  
  const processFiles = async () => {
    const results = [];
    for (const filePath of filePaths) {
      try {
        const fileIssues = await analyzeFile(filePath);
        results.push(...fileIssues);
      } catch (error) {
        console.error(`Error analyzing ${filePath}:`, error);
      }
    }
    return results;
  };
  
  processFiles().then(results => {
    parentPort.postMessage(results);
  }).catch(error => {
    console.error('Worker error:', error);
    parentPort.postMessage([]);
  });
}

/**
 * Main function for parallel file processing
 */
async function analyzeFilesInParallel(filePaths) {
  // Divide files among worker threads
  const fileChunks = [];
  const chunkSize = Math.ceil(filePaths.length / numCPUs);
  
  for (let i = 0; i < filePaths.length; i += chunkSize) {
    fileChunks.push(filePaths.slice(i, i + chunkSize));
  }
  
  // Create and run worker threads
  const workers = fileChunks.map(chunk => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { filePaths: chunk }
      });
      
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', code => {
        if (code !== 0) {
          reject(new Error(`Worker exited with code ${code}`));
        }
      });
    });
  });
  
  // Wait for all workers to complete
  const results = await Promise.all(workers);
  return results.flat();
}

/**
 * Recursively gets all JavaScript and JSX files
 */
function getAllFiles(dir, extensions, ignoreDirs = [], fileList = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const isDirectory = fs.statSync(itemPath).isDirectory();
    
    if (isDirectory) {
      if (!ignoreDirs.includes(item)) {
        getAllFiles(itemPath, extensions, ignoreDirs, fileList);
      }
    } else {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        fileList.push(itemPath);
      }
    }
  }
  
  return fileList;
}

/**
 * Generate HTML report with interactive features
 */
function generateHtmlReport(issues, outputPath) {
  // Group issues by category
  const issuesByCategory = {};
  issues.forEach(issue => {
    if (!issuesByCategory[issue.category]) {
      issuesByCategory[issue.category] = [];
    }
    issuesByCategory[issue.category].push(issue);
  });

  // Calculate statistics
  const totalIssues = issues.length;
  const criticalIssues = issues.filter(i => i.isCriticalFile).length;
  const errorIssues = issues.filter(i => i.severity === 'error').length;
  const warningIssues = issues.filter(i => i.severity !== 'error').length;

  // Generate HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Static Analysis Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; line-height: 1.5; }
    .header { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
    .stats { display: flex; gap: 20px; margin-bottom: 20px; }
    .stat { background: #f5f5f5; padding: 15px; border-radius: 5px; flex: 1; }
    .stat.critical { background: #fff8e1; }
    .stat.errors { background: #ffebee; }
    .category { margin-bottom: 30px; }
    .category-header { padding: 10px; background: #f5f5f5; cursor: pointer; }
    .file-list { margin-left: 20px; }
    .issue { padding: 10px; border-left: 3px solid #ddd; margin-bottom: 10px; }
    .issue.error { border-left-color: #f44336; }
    .issue.warning { border-left-color: #ff9800; }
    .issue.critical { background-color: #fffde7; }
    .hidden { display: none; }
    .info { color: #666; }
    button { padding: 8px 16px; background: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 4px; }
    button:hover { background: #388E3C; }
    summary { cursor: pointer; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Static Analysis Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="stats">
    <div class="stat">
      <h3>Total Issues</h3>
      <div>${totalIssues}</div>
    </div>
    <div class="stat critical">
      <h3>Critical Issues</h3>
      <div>${criticalIssues}</div>
      <div class="info">(affecting both build and tests)</div>
    </div>
    <div class="stat errors">
      <h3>Errors</h3>
      <div>${errorIssues}</div>
    </div>
    <div class="stat">
      <h3>Warnings</h3>
      <div>${warningIssues}</div>
    </div>
  </div>
  
  <h2>Issues by Category</h2>
  ${Object.entries(issuesByCategory).map(([category, categoryIssues]) => `
    <div class="category">
      <div class="category-header" onclick="toggleCategory('${category}')">
        <h3>${categories[category]?.name || category} (${categoryIssues.length})</h3>
      </div>
      <div id="${category}" class="file-list">
        ${categoryIssues.map(issue => `
          <div class="issue ${issue.severity} ${issue.isCriticalFile ? 'critical' : ''}">
            <strong>${path.relative(config.rootDir, issue.filePath)}</strong>
            <p>${issue.message}</p>
            ${issue.isCriticalFile ? `<p class="info">⚠️ Critical: ${criticalFiles.find(cf => cf.pattern.test(issue.filePath))?.reason}</p>` : ''}
            ${issue.location ? `<p class="info">Location: Line ${issue.location.start.line}, Column ${issue.location.start.column}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')}
  
  <script>
    function toggleCategory(id) {
      const element = document.getElementById(id);
      element.classList.toggle('hidden');
    }
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(outputPath, html);
  return outputPath;
}

/**
 * Main function
 */
async function main() {
  if (!isMainThread) {
    return workerFunction();
  }
  
  console.time('Static analysis completed in');
  
  // Get all JS and JSX files
  const files = getAllFiles(config.rootDir, extensions, config.ignoreDirs);
  console.log(`Found ${files.length} JavaScript/JSX files`);
  
  // Analyze all files in parallel
  console.log('Analyzing files...');
  const issues = await analyzeFilesInParallel(files);
  
  // Sort issues by criticality and severity
  issues.sort((a, b) => {
    // First sort by critical files (affecting both build and tests)
    if (a.isCriticalFile && !b.isCriticalFile) return -1;
    if (!a.isCriticalFile && b.isCriticalFile) return 1;
    
    // Then by severity
    if (a.severity === 'error' && b.severity !== 'error') return -1;
    if (a.severity !== 'error' && b.severity === 'error') return 1;
    
    // Finally by category
    return a.category.localeCompare(b.category);
  });
  
  // Generate reports
  const outputDir = path.dirname(config.outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(config.outputFile, JSON.stringify(issues, null, 2));
  const htmlReportPath = path.join(outputDir, 'static-analysis-report.html');
  generateHtmlReport(issues, htmlReportPath);
  
  // Print summary
  const criticalIssues = issues.filter(i => i.isCriticalFile).length;
  const errorIssues = issues.filter(i => i.severity === 'error').length;
  const warningIssues = issues.filter(i => i.severity !== 'error').length;
  
  console.log('\n=== Static Analysis Summary ===');
  console.log(`Total issues found: ${issues.length}`);
  console.log(`Critical issues (affecting both build and tests): ${criticalIssues}`);
  console.log(`Errors: ${errorIssues}`);
  console.log(`Warnings: ${warningIssues}`);
  console.log(`\nDetailed report saved to ${config.outputFile}`);
  console.log(`HTML report saved to ${htmlReportPath}`);
  
  console.timeEnd('Static analysis completed in');
}

// Run the main function
if (isMainThread) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = {
  analyzeFile,
  getAllFiles,
  categories,
  config
};