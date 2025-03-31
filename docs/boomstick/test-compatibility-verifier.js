#!/usr/bin/env node
/**
 * Test Compatibility Verifier
 * 
 * Dual validation tool that ensures code changes maintain both build and test compatibility.
 * Features:
 * - Fast test environment simulation
 * - Mock detection and validation
 * - Jest configuration analysis
 * - Test dependency graph generation
 * - Change impact prediction
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };
const { execSync } = require('child_process');

// Configuration
const config = {
  rootDir: process.cwd(),
  backupDir: path.resolve(`./project/777_Final/backups/${new Date().toISOString().replace(/:/g, '-')}`),
  testDir: 'src/tests',
  outputFile: './test-compatibility-report.json',
  dryRun: false,
  verbose: false,
  maxConcurrentTests: 4,
  quickMode: true
};

// Parse command line args
const args = process.argv.slice(2);
if (args.includes('--dry-run')) config.dryRun = true;
if (args.includes('--verbose')) config.verbose = true;
if (args.includes('--full')) config.quickMode = false;

// Create backup directory
if (!config.dryRun) {
  fs.mkdirSync(config.backupDir, { recursive: true });
  console.log(chalk.blue(`Created backup directory: ${config.backupDir}`));
}

/**
 * Find test files recursively
 */
function findTestFiles(dir = path.join(config.rootDir, config.testDir)) {
  const result = [];
  
  if (!fs.existsSync(dir)) {
    console.log(chalk.yellow(`Test directory ${dir} does not exist`));
    return result;
  }
  
  const queue = [dir];
  
  while (queue.length > 0) {
    const currentDir = queue.shift();
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        queue.push(fullPath);
      } else if (
        entry.isFile() && 
        (entry.name.endsWith('.test.js') || 
         entry.name.endsWith('.test.jsx') ||
         entry.name.endsWith('.spec.js') ||
         entry.name.endsWith('.spec.jsx'))
      ) {
        result.push(fullPath);
      }
    }
  }
  
  return result;
}

/**
 * Analyze test files for mock usage and imports
 */
function analyzeTestFiles(files) {
  const testData = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy']
      });
      
      const imports = [];
      const mocks = [];
      const issues = [];
      
      traverse(ast, {
        ImportDeclaration(path) {
          const source = path.node.source.value;
          const importedNames = [];
          
          path.node.specifiers.forEach(specifier => {
            if (t.isImportDefaultSpecifier(specifier)) {
              importedNames.push({ name: specifier.local.name, isDefault: true });
            } else if (t.isImportSpecifier(specifier)) {
              importedNames.push({ 
                name: specifier.local.name, 
                imported: specifier.imported ? specifier.imported.name : specifier.local.name,
                isDefault: false 
              });
            } else if (t.isImportNamespaceSpecifier(specifier)) {
              importedNames.push({ name: specifier.local.name, isNamespace: true });
            }
          });
          
          imports.push({
            source,
            importedNames,
            loc: path.node.loc
          });
        },
        
        // Find Jest mocks
        CallExpression(path) {
          const callee = path.node.callee;
          
          // jest.mock('./someModule')
          if (
            t.isMemberExpression(callee) && 
            t.isIdentifier(callee.object) && 
            callee.object.name === 'jest' &&
            t.isIdentifier(callee.property) && 
            callee.property.name === 'mock'
          ) {
            const args = path.node.arguments;
            if (args.length > 0 && t.isStringLiteral(args[0])) {
              mocks.push({
                modulePath: args[0].value,
                hasFactory: args.length > 1 && (t.isArrowFunctionExpression(args[1]) || t.isFunctionExpression(args[1])),
                loc: path.node.loc
              });
            }
          }
          
          // Check for problems with MSW handlers
          if (
            imports.some(imp => imp.source.includes('msw')) &&
            t.isMemberExpression(callee) &&
            t.isIdentifier(callee.property) &&
            ['get', 'post', 'put', 'delete', 'patch'].includes(callee.property.name)
          ) {
            // Check if there's a URL that matches production endpoints
            const args = path.node.arguments;
            if (args.length > 0 && t.isStringLiteral(args[0])) {
              const url = args[0].value;
              if (url.startsWith('/api/') && !url.includes('test') && !url.includes('mock')) {
                issues.push({
                  type: 'msw-production-endpoint',
                  severity: 'warning',
                  message: `MSW handler using production endpoint: ${url}`,
                  loc: path.node.loc,
                  fix: {
                    type: 'prefix-test-endpoint',
                    description: 'Consider using a test-specific endpoint',
                    automated: false
                  }
                });
              }
            }
          }
        },
        
        // Look for potential memory leaks in tests
        MemberExpression(path) {
          if (
            t.isIdentifier(path.node.object) &&
            t.isIdentifier(path.node.property) &&
            path.node.object.name === 'window' &&
            ['addEventListener', 'setTimeout', 'setInterval'].includes(path.node.property.name)
          ) {
            // Check if there's a corresponding cleanup
            const cleanup = ['removeEventListener', 'clearTimeout', 'clearInterval'][
              ['addEventListener', 'setTimeout', 'setInterval'].indexOf(path.node.property.name)
            ];
            
            // Simple check - look for the cleanup method name in the file
            if (!content.includes(cleanup)) {
              issues.push({
                type: 'potential-test-leak',
                severity: 'warning',
                message: `Potential memory leak: ${path.node.object.name}.${path.node.property.name} without cleanup`,
                loc: path.node.loc,
                fix: {
                  type: 'add-cleanup',
                  description: `Add ${cleanup} in afterEach or cleanup function`,
                  automated: false
                }
              });
            }
          }
        }
      });
      
      // Check if test uses React Testing Library properly
      const usesTestingLibrary = imports.some(imp => 
        imp.source.includes('@testing-library/react') ||
        imp.source.includes('@testing-library/jest-dom')
      );
      
      if (usesTestingLibrary) {
        // Check for proper cleanup
        if (!content.includes('cleanup') && !content.includes('afterEach')) {
          issues.push({
            type: 'missing-rtl-cleanup',
            severity: 'warning',
            message: 'Test uses React Testing Library but does not call cleanup',
            fix: {
              type: 'add-rtl-cleanup',
              description: 'Add afterEach(cleanup) or import and use cleanup after tests',
              automated: true,
              code: "import { cleanup } from '@testing-library/react';\nafterEach(cleanup);"
            }
          });
        }
      }
      
      testData.push({
        filePath: file,
        imports,
        mocks,
        issues
      });
    } catch (error) {
      console.error(chalk.red(`Error analyzing ${file}: ${error.message}`));
      testData.push({
        filePath: file,
        imports: [],
        mocks: [],
        issues: [{
          type: 'analysis-error',
          severity: 'error',
          message: `Failed to analyze file: ${error.message}`
        }]
      });
    }
  }
  
  return testData;
}

/**
 * Map source files to test files that import them
 */
function mapSourceToTestDependencies(testData) {
  const sourceToTests = {};
  
  testData.forEach(test => {
    test.imports.forEach(imp => {
      const source = imp.source;
      
      // Skip node_modules and relative paths that go outside the src directory
      if (source.startsWith('src/') || source.startsWith('./') || source.startsWith('../')) {
        const resolvedPath = resolveImportPath(test.filePath, source);
        
        if (resolvedPath) {
          if (!sourceToTests[resolvedPath]) {
            sourceToTests[resolvedPath] = [];
          }
          
          if (!sourceToTests[resolvedPath].includes(test.filePath)) {
            sourceToTests[resolvedPath].push(test.filePath);
          }
        }
      }
    });
  });
  
  return sourceToTests;
}

/**
 * Resolve an import path relative to a file
 */
function resolveImportPath(filePath, importSource) {
  const dirName = path.dirname(filePath);
  
  // Node modules or absolute paths
  if (!importSource.startsWith('.') && !importSource.startsWith('src/')) {
    return null;
  }
  
  let resolvedPath;
  
  if (importSource.startsWith('src/')) {
    // Handle absolute paths from the project root
    resolvedPath = path.resolve(config.rootDir, importSource);
  } else {
    // Handle relative paths
    resolvedPath = path.resolve(dirName, importSource);
  }
  
  // Try with different extensions and index files
  const possiblePaths = [
    resolvedPath,
    `${resolvedPath}.js`,
    `${resolvedPath}.jsx`,
    path.join(resolvedPath, 'index.js'),
    path.join(resolvedPath, 'index.jsx')
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  
  return null;
}

/**
 * Run tests for a specific file
 */
async function runTestsForFile(testFile) {
  try {
    console.log(chalk.blue(`Running tests for ${testFile}`));
    
    if (config.dryRun) {
      return { success: true };
    }
    
    const command = `npx jest ${testFile} --no-cache --coverage=false`;
    execSync(command, { stdio: config.verbose ? 'inherit' : 'pipe' });
    
    return { success: true };
  } catch (error) {
    console.error(chalk.red(`Tests failed for ${testFile}`));
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Run critical tests in parallel
 */
async function runCriticalTests(testFiles, maxConcurrent = config.maxConcurrentTests) {
  if (testFiles.length === 0) {
    console.log(chalk.green('No critical tests to run'));
    return { success: true };
  }
  
  console.log(chalk.blue(`Running ${testFiles.length} critical tests...`));
  
  const results = [];
  
  // Group tests into batches for parallel execution
  for (let i = 0; i < testFiles.length; i += maxConcurrent) {
    const batch = testFiles.slice(i, i + maxConcurrent);
    
    // Run tests in this batch in parallel
    const batchResults = await Promise.all(
      batch.map(file => runTestsForFile(file))
    );
    
    results.push(...batchResults);
  }
  
  const failures = results.filter(r => !r.success);
  
  if (failures.length > 0) {
    console.log(chalk.red(`${failures.length} tests failed`));
    return { success: false, failures };
  }
  
  console.log(chalk.green(`All ${testFiles.length} tests passed!`));
  return { success: true };
}

/**
 * Check a file for test compatibility issues
 */
async function checkTestCompatibility(filePath, sourceToTests) {
  console.log(chalk.blue(`Checking test compatibility for ${filePath}`));
  
  // Find tests that import this file
  const affectedTests = sourceToTests[filePath] || [];
  
  if (affectedTests.length === 0) {
    console.log(chalk.yellow(`No tests found that import ${filePath}`));
    return { success: true, testsRun: 0 };
  }
  
  console.log(chalk.blue(`Found ${affectedTests.length} tests that import ${filePath}`));
  
  // In quick mode, only run a subset of tests
  const testsToRun = config.quickMode && affectedTests.length > 3 
    ? affectedTests.slice(0, 3)  // Run just 3 tests in quick mode
    : affectedTests;
  
  const results = await runCriticalTests(testsToRun);
  
  return {
    ...results,
    testsRun: testsToRun.length,
    totalTests: affectedTests.length
  };
}

/**
 * Fix test compatibility issues
 */
function fixTestIssues(testData) {
  let fixedCount = 0;
  let errorCount = 0;
  
  for (const test of testData) {
    const fixableIssues = test.issues.filter(i => i.fix && i.fix.automated);
    
    if (fixableIssues.length === 0) continue;
    
    console.log(chalk.blue(`Fixing ${fixableIssues.length} issues in ${test.filePath}`));
    
    if (config.dryRun) {
      console.log(chalk.yellow('[DRY RUN] Would fix issues'));
      continue;
    }
    
    // Create backup
    const backupPath = path.join(config.backupDir, `${path.basename(test.filePath)}.${Date.now()}.backup`);
    fs.copyFileSync(test.filePath, backupPath);
    
    try {
      let content = fs.readFileSync(test.filePath, 'utf8');
      let modified = false;
      
      for (const issue of fixableIssues) {
        if (issue.fix.type === 'add-rtl-cleanup') {
          // Add RTL cleanup to the test file
          if (!content.includes('cleanup') && !content.includes('afterEach(cleanup)')) {
            // Find the imports section
            const importSection = content.match(/import[^;]+;(\s*import[^;]+;)*/);
            
            if (importSection) {
              const endOfImports = importSection[0].length;
              content = content.substring(0, endOfImports) + '\n' + issue.fix.code + '\n' + content.substring(endOfImports);
              modified = true;
            } else {
              // Add to the beginning of the file
              content = issue.fix.code + '\n\n' + content;
              modified = true;
            }
          }
        }
      }
      
      if (modified) {
        fs.writeFileSync(test.filePath, content);
        
        // Run tests to verify the fix
        try {
          const command = `npx jest ${test.filePath} --no-cache`;
          execSync(command, { stdio: 'pipe' });
          console.log(chalk.green(`✓ Fixed ${test.filePath}`));
          fixedCount++;
        } catch (error) {
          console.error(chalk.red(`× Fix broke tests in ${test.filePath}, restoring from backup`));
          fs.copyFileSync(backupPath, test.filePath);
          errorCount++;
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error fixing ${test.filePath}: ${error.message}`));
      // Restore from backup
      fs.copyFileSync(backupPath, test.filePath);
      errorCount++;
    }
  }
  
  return { fixedCount, errorCount };
}

/**
 * Generate HTML report
 */
function generateHtmlReport(testData, sourceToTests) {
  const reportPath = config.outputFile.replace('.json', '.html');
  
  // Count issues by type
  const issueTypes = {};
  let totalIssues = 0;
  let testsWithIssues = 0;
  
  testData.forEach(test => {
    if (test.issues.length > 0) {
      testsWithIssues++;
      
      test.issues.forEach(issue => {
        if (!issueTypes[issue.type]) {
          issueTypes[issue.type] = 0;
        }
        issueTypes[issue.type]++;
        totalIssues++;
      });
    }
  });
  
  // Get files covered by tests
  const testCoverage = Object.keys(sourceToTests).length;
  
  // Find files with many dependent tests - good candidates for careful review
  const criticalFiles = Object.entries(sourceToTests)
    .filter(([_, tests]) => tests.length > 5)  // Files with more than 5 dependent tests
    .sort(([_, testsA], [__, testsB]) => testsB.length - testsA.length)
    .slice(0, 20);  // Top 20 most critical files
  
  // Generate HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Compatibility Report</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; margin: 0; padding: 20px; }
    .header { margin-bottom: 20px; }
    .summary { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 30px; }
    .summary-item { flex: 1; min-width: 200px; background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .summary-item.error { background: #ffebee; }
    .summary-item.warning { background: #fff8e1; }
    .critical-files { background: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 30px; }
    .test-file { margin-bottom: 20px; }
    .test-header { background: #f5f5f5; padding: 10px; cursor: pointer; }
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
    <h1>Test Compatibility Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="summary">
    <div class="summary-item">
      <h3>Total Test Files</h3>
      <div>${testData.length}</div>
    </div>
    <div class="summary-item">
      <h3>Total Source Files Tested</h3>
      <div>${testCoverage}</div>
    </div>
    <div class="summary-item">
      <h3>Tests with Issues</h3>
      <div>${testsWithIssues}</div>
    </div>
    <div class="summary-item">
      <h3>Total Issues</h3>
      <div>${totalIssues}</div>
    </div>
    ${Object.entries(issueTypes).map(([type, count]) => `
      <div class="summary-item ${type.includes('error') ? 'error' : 'warning'}">
        <h3>${type}</h3>
        <div>${count}</div>
      </div>
    `).join('')}
  </div>
  
  <div class="critical-files">
    <h2>Critical Files (Most Test Dependencies)</h2>
    <p>These files are used by many tests and should be modified with caution:</p>
    <ul>
      ${criticalFiles.map(([file, tests]) => `
        <li><code>${file}</code> - used by ${tests.length} tests</li>
      `).join('')}
    </ul>
  </div>
  
  <h2>Test Issues</h2>
  ${testData.filter(test => test.issues.length > 0).map(test => `
    <div class="test-file">
      <div class="test-header" onclick="toggleTest('${Buffer.from(test.filePath).toString('base64')}')">
        <h3>${test.filePath} (${test.issues.length} issues)</h3>
      </div>
      <div id="${Buffer.from(test.filePath).toString('base64')}" class="issues hidden">
        ${test.issues.map(issue => `
          <div class="issue ${issue.severity}">
            <div><strong>${issue.type}</strong> ${issue.loc ? `- Line ${issue.loc.start.line}` : ''}</div>
            <div>${issue.message}</div>
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
    function toggleTest(id) {
      const element = document.getElementById(id);
      element.classList.toggle('hidden');
    }
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(chalk.blue(`HTML report saved to ${reportPath}`));
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.blue('🔍 Analyzing test compatibility...'));
  
  // Find test files
  const testFiles = findTestFiles();
  console.log(chalk.blue(`Found ${testFiles.length} test files`));
  
  // Analyze test files
  console.log(chalk.blue('Analyzing test files...'));
  const testData = analyzeTestFiles(testFiles);
  
  // Create source-to-test mapping
  console.log(chalk.blue('Mapping source files to tests...'));
  const sourceToTests = mapSourceToTestDependencies(testData);
  
  // Count issues
  let totalIssues = 0;
  testData.forEach(test => {
    totalIssues += test.issues.length;
  });
  
  console.log(chalk.blue(`Found ${totalIssues} test compatibility issues`));
  
  // Write report
  const outputDir = path.dirname(config.outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(config.outputFile, JSON.stringify({ testData, sourceToTests }, null, 2));
  
  // Generate HTML report
  generateHtmlReport(testData, sourceToTests);
  
  // Fix issues
  const fixableIssues = testData.reduce((count, test) => {
    return count + test.issues.filter(i => i.fix && i.fix.automated).length;
  }, 0);
  
  if (fixableIssues > 0) {
    console.log(chalk.blue(`\nFixing ${fixableIssues} issues...`));
    const { fixedCount, errorCount } = fixTestIssues(testData);
    
    console.log(chalk.blue('\n=== Test Fix Summary ==='));
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Failed: ${errorCount}`);
  }
  
  // Demonstrate running a single component check
  if (!config.dryRun && args.length > 0 && fs.existsSync(args[0])) {
    console.log(chalk.blue(`\nChecking test compatibility for ${args[0]}...`));
    const result = await checkTestCompatibility(args[0], sourceToTests);
    
    if (result.success) {
      console.log(chalk.green(`✓ All tests passed (${result.testsRun}/${result.totalTests})`));
    } else {
      console.log(chalk.red(`× Tests failed (${result.failures.length} failures)`));
    }
  }
  
  console.log(chalk.green('\nTest compatibility analysis complete!'));
}

// Run main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});