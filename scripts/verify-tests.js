/**
 * TAP Integration Platform - Test Verification Script
 * 
 * This script verifies that tests have run successfully and meet quality
 * requirements.
 * 
 * Following the Golden Approach methodology for thorough verification.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  rootPath: path.join(__dirname, '../../..'),
  outputPath: path.join(__dirname, '../reports'),
  components: {
    frontend: {
      path: path.join(__dirname, '../../../frontend'),
      results: {
        files: [
          'test-results.json',
          'coverage/coverage-summary.json'
        ],
        validation: {
          minPassRate: 90, // Minimum percentage of tests that should pass
          minCoverage: {
            statements: 70,
            branches: 60,
            functions: 70,
            lines: 70
          }
        }
      }
    },
    backend: {
      path: path.join(__dirname, '../../../backend'),
      results: {
        files: [
          // Add backend test result files
        ],
        validation: {
          minPassRate: 90,
          minCoverage: {
            statements: 70,
            branches: 60,
            functions: 70,
            lines: 70
          }
        }
      }
    }
  }
};

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  success: true,
  components: {},
  issues: []
};

/**
 * Main function to run the verification process
 */
async function main() {
  console.log('TAP Integration Platform - Test Verification');
  console.log('===========================================');

  try {
    // Verify each component
    for (const [name, component] of Object.entries(config.components)) {
      if (component.results && component.results.files && component.results.files.length > 0) {
        const componentResults = verifyComponent(name, component);
        results.components[name] = componentResults;
        
        if (!componentResults.success) {
          results.success = false;
        }
      }
    }
    
    // Generate report
    generateReport();
    
    // Print summary
    printSummary();
    
    // Exit with appropriate code
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    console.error('Verification process failed:', error);
    process.exit(1);
  }
}

/**
 * Verify a single component's test results
 */
function verifyComponent(name, component) {
  console.log(`\nVerifying ${name} test results...`);
  
  const result = {
    name,
    success: true,
    resultsFound: false,
    coverageFound: false,
    testResults: null,
    coverageResults: null,
    testStats: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      passRate: 0
    },
    coverageStats: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    },
    issues: []
  };
  
  // Check if component path exists
  if (!fs.existsSync(component.path)) {
    result.success = false;
    result.issues.push(`Component directory not found: ${component.path}`);
    results.issues.push(`[${name}] Component directory not found: ${component.path}`);
    return result;
  }
  
  // Check each results file
  for (const file of component.results.files) {
    const fullPath = path.join(component.path, file);
    
    if (fs.existsSync(fullPath)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        
        // Process test results
        if (file.includes('test-results') || file.includes('junit') || file.includes('test-report')) {
          result.resultsFound = true;
          result.testResults = fileContent;
          
          // Extract test stats based on format
          extractTestStats(fileContent, result);
        }
        
        // Process coverage results
        if (file.includes('coverage')) {
          result.coverageFound = true;
          result.coverageResults = fileContent;
          
          // Extract coverage stats based on format
          extractCoverageStats(fileContent, result);
        }
      } catch (error) {
        console.warn(`Could not parse ${file}:`, error.message);
      }
    }
  }
  
  // Validate results
  if (component.results.validation) {
    // Validate test pass rate
    if (component.results.validation.minPassRate && result.testStats.total > 0) {
      const passRate = (result.testStats.passed / result.testStats.total) * 100;
      result.testStats.passRate = passRate;
      
      if (passRate < component.results.validation.minPassRate) {
        result.success = false;
        const issue = `Test pass rate (${passRate.toFixed(2)}%) is below minimum (${component.results.validation.minPassRate}%)`;
        result.issues.push(issue);
        results.issues.push(`[${name}] ${issue}`);
      }
    }
    
    // Validate coverage
    if (component.results.validation.minCoverage && result.coverageFound) {
      const coverage = result.coverageStats;
      const minCoverage = component.results.validation.minCoverage;
      
      if (coverage.statements < minCoverage.statements) {
        result.success = false;
        const issue = `Statement coverage (${coverage.statements.toFixed(2)}%) is below minimum (${minCoverage.statements}%)`;
        result.issues.push(issue);
        results.issues.push(`[${name}] ${issue}`);
      }
      
      if (coverage.branches < minCoverage.branches) {
        result.success = false;
        const issue = `Branch coverage (${coverage.branches.toFixed(2)}%) is below minimum (${minCoverage.branches}%)`;
        result.issues.push(issue);
        results.issues.push(`[${name}] ${issue}`);
      }
      
      if (coverage.functions < minCoverage.functions) {
        result.success = false;
        const issue = `Function coverage (${coverage.functions.toFixed(2)}%) is below minimum (${minCoverage.functions}%)`;
        result.issues.push(issue);
        results.issues.push(`[${name}] ${issue}`);
      }
      
      if (coverage.lines < minCoverage.lines) {
        result.success = false;
        const issue = `Line coverage (${coverage.lines.toFixed(2)}%) is below minimum (${minCoverage.lines}%)`;
        result.issues.push(issue);
        results.issues.push(`[${name}] ${issue}`);
      }
    }
  }
  
  // Check if results were found
  if (!result.resultsFound) {
    result.success = false;
    const issue = `No test results found`;
    result.issues.push(issue);
    results.issues.push(`[${name}] ${issue}`);
  }
  
  // Report results
  if (result.success) {
    console.log(`✅ ${name} test results verified successfully`);
    console.log(`  Tests: ${result.testStats.passed}/${result.testStats.total} passed (${result.testStats.passRate.toFixed(2)}%)`);
    
    if (result.coverageFound) {
      console.log(`  Coverage: statements ${result.coverageStats.statements.toFixed(2)}%, branches ${result.coverageStats.branches.toFixed(2)}%, functions ${result.coverageStats.functions.toFixed(2)}%, lines ${result.coverageStats.lines.toFixed(2)}%`);
    }
  } else {
    console.error(`❌ ${name} test verification failed:`);
    result.issues.forEach(issue => console.error(`  - ${issue}`));
  }
  
  return result;
}

/**
 * Extract test statistics from results file
 */
function extractTestStats(results, componentResult) {
  // Jest format
  if (results.numTotalTests !== undefined) {
    componentResult.testStats.total = results.numTotalTests;
    componentResult.testStats.passed = results.numPassedTests;
    componentResult.testStats.failed = results.numFailedTests;
    componentResult.testStats.skipped = results.numPendingTests;
    
    if (componentResult.testStats.total > 0) {
      componentResult.testStats.passRate = (componentResult.testStats.passed / componentResult.testStats.total) * 100;
    }
    
    return;
  }
  
  // Mocha/JUnit format
  if (results.stats || results.testsuites) {
    const stats = results.stats || results.testsuites;
    
    componentResult.testStats.total = stats.tests || stats.total || 0;
    componentResult.testStats.passed = stats.passes || stats.passed || (stats.tests - stats.failures - stats.skipped) || 0;
    componentResult.testStats.failed = stats.failures || stats.failed || 0;
    componentResult.testStats.skipped = stats.skipped || stats.pending || 0;
    
    if (componentResult.testStats.total > 0) {
      componentResult.testStats.passRate = (componentResult.testStats.passed / componentResult.testStats.total) * 100;
    }
    
    return;
  }
  
  // Custom format - try to detect structure
  if (typeof results === 'object') {
    // Look for common patterns in properties
    const totalKeys = ['total', 'tests', 'totalTests', 'numTests', 'testsTotal'];
    const passedKeys = ['passed', 'passes', 'passedTests', 'numPassed', 'testsPassed'];
    const failedKeys = ['failed', 'failures', 'failedTests', 'numFailed', 'testsFailed'];
    const skippedKeys = ['skipped', 'pending', 'skippedTests', 'numSkipped', 'testsSkipped'];
    
    // Find matching properties
    for (const key of totalKeys) {
      if (typeof results[key] === 'number') {
        componentResult.testStats.total = results[key];
        break;
      }
    }
    
    for (const key of passedKeys) {
      if (typeof results[key] === 'number') {
        componentResult.testStats.passed = results[key];
        break;
      }
    }
    
    for (const key of failedKeys) {
      if (typeof results[key] === 'number') {
        componentResult.testStats.failed = results[key];
        break;
      }
    }
    
    for (const key of skippedKeys) {
      if (typeof results[key] === 'number') {
        componentResult.testStats.skipped = results[key];
        break;
      }
    }
    
    // If we still don't have a total, try to calculate it
    if (componentResult.testStats.total === 0) {
      componentResult.testStats.total = 
        componentResult.testStats.passed + 
        componentResult.testStats.failed + 
        componentResult.testStats.skipped;
    }
    
    // Calculate pass rate
    if (componentResult.testStats.total > 0) {
      componentResult.testStats.passRate = (componentResult.testStats.passed / componentResult.testStats.total) * 100;
    }
  }
}

/**
 * Extract coverage statistics from results file
 */
function extractCoverageStats(results, componentResult) {
  // Istanbul/NYC coverage format
  if (results.total) {
    const total = results.total;
    
    if (total.statements) {
      componentResult.coverageStats.statements = total.statements.pct || 0;
    }
    
    if (total.branches) {
      componentResult.coverageStats.branches = total.branches.pct || 0;
    }
    
    if (total.functions) {
      componentResult.coverageStats.functions = total.functions.pct || 0;
    }
    
    if (total.lines) {
      componentResult.coverageStats.lines = total.lines.pct || 0;
    }
    
    return;
  }
  
  // Custom format - try to detect structure
  if (typeof results === 'object') {
    // Look for common patterns in properties
    const statementsKeys = ['statements', 'stmts', 'statementCoverage'];
    const branchesKeys = ['branches', 'branch', 'branchCoverage'];
    const functionsKeys = ['functions', 'funcs', 'functionCoverage'];
    const linesKeys = ['lines', 'line', 'lineCoverage'];
    
    // Find matching properties
    for (const key of statementsKeys) {
      if (typeof results[key] === 'number' || (results[key] && typeof results[key].pct === 'number')) {
        componentResult.coverageStats.statements = typeof results[key] === 'number' ? results[key] : results[key].pct;
        break;
      }
    }
    
    for (const key of branchesKeys) {
      if (typeof results[key] === 'number' || (results[key] && typeof results[key].pct === 'number')) {
        componentResult.coverageStats.branches = typeof results[key] === 'number' ? results[key] : results[key].pct;
        break;
      }
    }
    
    for (const key of functionsKeys) {
      if (typeof results[key] === 'number' || (results[key] && typeof results[key].pct === 'number')) {
        componentResult.coverageStats.functions = typeof results[key] === 'number' ? results[key] : results[key].pct;
        break;
      }
    }
    
    for (const key of linesKeys) {
      if (typeof results[key] === 'number' || (results[key] && typeof results[key].pct === 'number')) {
        componentResult.coverageStats.lines = typeof results[key] === 'number' ? results[key] : results[key].pct;
        break;
      }
    }
  }
}

/**
 * Generate a verification report
 */
function generateReport() {
  console.log('\nGenerating verification report...');
  
  // Ensure output directory exists
  if (!fs.existsSync(config.outputPath)) {
    fs.mkdirSync(config.outputPath, { recursive: true });
  }
  
  const reportFile = path.join(
    config.outputPath,
    `test-verification-${new Date().toISOString().replace(/:/g, '-')}.json`
  );
  
  // Create report object
  const report = {
    ...results,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
  
  // Write the report
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`Verification report saved to ${reportFile}`);
  
  // Generate a markdown summary
  const summaryFile = path.join(
    config.outputPath,
    `test-verification-${new Date().toISOString().replace(/:/g, '-')}.md`
  );
  
  const summaryContent = [
    '# TAP Integration Platform Test Verification Summary',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '## Overview',
    '',
    `- Status: ${report.success ? '✅ Success' : '❌ Failure'}`,
    '',
    '## Component Results',
    '',
    ...Object.entries(report.components).map(([name, details]) => {
      return [
        `### ${name}`,
        '',
        `- Status: ${details.success ? '✅ Success' : '❌ Failure'}`,
        '',
        '#### Test Results',
        '',
        `- Total Tests: ${details.testStats.total}`,
        `- Passed: ${details.testStats.passed}`,
        `- Failed: ${details.testStats.failed}`,
        `- Skipped: ${details.testStats.skipped}`,
        `- Pass Rate: ${details.testStats.passRate.toFixed(2)}%`,
        '',
        details.coverageFound ? [
          '#### Coverage',
          '',
          `- Statements: ${details.coverageStats.statements.toFixed(2)}%`,
          `- Branches: ${details.coverageStats.branches.toFixed(2)}%`,
          `- Functions: ${details.coverageStats.functions.toFixed(2)}%`,
          `- Lines: ${details.coverageStats.lines.toFixed(2)}%`,
          ''
        ].join('\n') : '',
        details.issues.length > 0 ? [
          '#### Issues:',
          '',
          ...details.issues.map(issue => `- ${issue}`),
          ''
        ].join('\n') : '',
        '---',
        ''
      ].filter(Boolean).join('\n');
    }),
    '## Next Steps',
    '',
    report.success ? [
      '- Review test coverage for potential improvements',
      '- Consider adding tests for uncovered areas',
      '- Proceed with deployment preparations'
    ].join('\n') : [
      '- Address failing tests',
      '- Improve test coverage where needed',
      '- Re-run test verification after fixes'
    ].join('\n')
  ].join('\n');
  
  fs.writeFileSync(summaryFile, summaryContent);
  console.log(`Verification summary saved to ${summaryFile}`);
}

/**
 * Print a summary of the verification process to the console
 */
function printSummary() {
  console.log('\n===========================================');
  console.log(`Test Verification ${results.success ? 'SUCCESS' : 'FAILED'}`);
  console.log('===========================================');
  
  Object.entries(results.components).forEach(([name, details]) => {
    const statusSymbol = details.success ? '✅' : '❌';
    console.log(`${statusSymbol} ${name}: ${details.testStats.passed}/${details.testStats.total} tests passed (${details.testStats.passRate.toFixed(2)}%)`);
    
    if (details.coverageFound) {
      console.log(`   Coverage: statements ${details.coverageStats.statements.toFixed(2)}%, branches ${details.coverageStats.branches.toFixed(2)}%, functions ${details.coverageStats.functions.toFixed(2)}%, lines ${details.coverageStats.lines.toFixed(2)}%`);
    }
  });
  
  console.log('===========================================');
  
  if (results.success) {
    console.log('✅ All test results verified successfully!');
  } else {
    console.log('❌ Test verification failed. Issues found:');
    results.issues.forEach(issue => console.log(`  - ${issue}`));
  }
}

// Execute the main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});