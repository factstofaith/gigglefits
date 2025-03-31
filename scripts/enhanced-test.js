/**
 * TAP Integration Platform - Enhanced Test Script
 * 
 * This script provides a robust test execution process with detailed reporting,
 * following the Golden Approach methodology for comprehensive testing.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  rootPath: path.join(__dirname, '../../..'),
  outputPath: path.join(__dirname, '../reports'),
  logPath: path.join(__dirname, '../logs'),
  components: ['frontend', 'backend'],
  testCommands: {
    frontend: 'npm run test:once',
    backend: 'npm run test'
  },
  timeouts: {
    frontend: 300000, // 5 minutes
    backend: 180000 // 3 minutes
  },
  retries: {
    enabled: true,
    maxRetries: 1,
    retryableErrorPatterns: [
      'Test timed out',
      'Connection refused',
      'Network error'
    ]
  },
  parallel: false, // Set to true to run tests in parallel
  verifyResultsFiles: {
    frontend: 'test-results.json',
    backend: 'test-results.json'
  }
};

// Ensure output directories exist
ensureDirectoriesExist([config.outputPath, config.logPath]);

// Metrics storage
const metrics = {
  startTime: Date.now(),
  endTime: null,
  components: {},
  summary: {
    totalDuration: 0,
    successful: 0,
    failed: 0,
    total: 0,
    tests: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    }
  }
};

/**
 * Main function to run the test process
 */
async function main() {
  console.log('TAP Integration Platform - Enhanced Test Runner');
  console.log('==============================================');
  console.log(`Root path: ${config.rootPath}`);
  console.log(`Components: ${config.components.join(', ')}`);
  console.log(`Mode: ${config.parallel ? 'Parallel' : 'Sequential'}`);
  console.log();

  try {
    // Run tests for all components
    await runTests();
    
    // Finalize metrics
    metrics.endTime = Date.now();
    metrics.summary.totalDuration = metrics.endTime - metrics.startTime;
    
    // Generate report
    generateReport();
    
    // Print summary
    printSummary();
    
    // Exit with appropriate code
    process.exit(metrics.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test process failed:', error);
    process.exit(1);
  }
}

/**
 * Run tests for all components
 */
async function runTests() {
  console.log('Starting test execution...');
  
  // Initialize metrics
  metrics.summary.total = config.components.length;
  
  if (config.parallel) {
    // Run all tests in parallel
    const promises = config.components.map(component => {
      return testComponent(component)
        .then(result => {
          metrics.components[component] = result;
          
          if (result.success) {
            metrics.summary.successful++;
          } else {
            metrics.summary.failed++;
          }
          
          updateTestCounts(result);
        })
        .catch(error => {
          console.error(`Error testing ${component}:`, error);
          metrics.components[component] = {
            status: 'error',
            error: error.message,
            stack: error.stack
          };
          metrics.summary.failed++;
        });
    });
    
    await Promise.all(promises);
  } else {
    // Run tests sequentially
    for (const component of config.components) {
      try {
        const componentPath = path.join(config.rootPath, component);
        
        // Skip if component directory doesn't exist
        if (!fs.existsSync(componentPath)) {
          console.warn(`Component directory not found: ${component}, skipping`);
          metrics.components[component] = {
            status: 'skipped',
            error: 'Directory not found'
          };
          continue;
        }
        
        // Test the component
        const result = await testComponent(component, componentPath);
        
        // Update metrics
        metrics.components[component] = result;
        
        if (result.success) {
          metrics.summary.successful++;
        } else {
          metrics.summary.failed++;
        }
        
        updateTestCounts(result);
      } catch (error) {
        console.error(`Error testing ${component}:`, error);
        metrics.components[component] = {
          status: 'error',
          error: error.message,
          stack: error.stack
        };
        metrics.summary.failed++;
      }
    }
  }
}

/**
 * Update test count metrics from a result
 */
function updateTestCounts(result) {
  if (result.testCounts) {
    metrics.summary.tests.total += result.testCounts.total || 0;
    metrics.summary.tests.passed += result.testCounts.passed || 0;
    metrics.summary.tests.failed += result.testCounts.failed || 0;
    metrics.summary.tests.skipped += result.testCounts.skipped || 0;
  }
}

/**
 * Test a single component
 */
async function testComponent(component, componentPath) {
  console.log(`\nTesting ${component}...`);
  
  componentPath = componentPath || path.join(config.rootPath, component);
  
  const startTime = Date.now();
  const testCommand = config.testCommands[component];
  const [cmd, ...args] = testCommand.split(' ');
  
  const result = {
    component,
    command: testCommand,
    startTime,
    endTime: null,
    duration: null,
    success: false,
    status: 'pending',
    output: '',
    errors: [],
    warnings: [],
    testCounts: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    },
    retries: 0
  };
  
  // Test function with retry logic
  const executeTest = async (retry = 0) => {
    result.retries = retry;
    
    return new Promise((resolve, reject) => {
      console.log(`Executing: ${testCommand} (in ${componentPath})`);
      
      // Spawn the test process
      const testProcess = spawn(cmd, args, {
        cwd: componentPath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: 'true' }
      });
      
      // Set up timeout
      const timeout = setTimeout(() => {
        testProcess.kill();
        result.status = 'timeout';
        result.errors.push(`Test timed out after ${config.timeouts[component] / 1000} seconds`);
        reject(new Error(`Test timed out for ${component}`));
      }, config.timeouts[component]);
      
      // Collect output
      testProcess.stdout.on('data', (data) => {
        const output = data.toString();
        result.output += output;
        
        // Parse test results from output
        parseTestResults(output, result);
        
        // Check for warnings
        if (output.toLowerCase().includes('warning') || output.includes('WARN')) {
          result.warnings.push(output.trim());
        }
        
        // Forward to console
        process.stdout.write(`[${component}] ${output}`);
      });
      
      testProcess.stderr.on('data', (data) => {
        const output = data.toString();
        result.output += output;
        result.errors.push(output.trim());
        
        // Forward to console
        process.stderr.write(`[${component}] ${output}`);
      });
      
      // Handle completion
      testProcess.on('close', (code) => {
        clearTimeout(timeout);
        
        result.endTime = Date.now();
        result.duration = result.endTime - result.startTime;
        result.exitCode = code;
        result.success = code === 0;
        result.status = result.success ? 'success' : 'failed';
        
        console.log(`${component} tests ${result.success ? 'passed' : 'failed'} with code ${code} in ${result.duration / 1000}s`);
        
        // Save logs
        const logFile = path.join(
          config.logPath,
          `test-${component}-${new Date().toISOString().replace(/:/g, '-')}.log`
        );
        
        fs.writeFileSync(logFile, result.output);
        
        // Try to read test results file if it exists
        const resultsFile = config.verifyResultsFiles[component];
        
        if (resultsFile && fs.existsSync(path.join(componentPath, resultsFile))) {
          try {
            const testResults = JSON.parse(fs.readFileSync(
              path.join(componentPath, resultsFile),
              'utf8'
            ));
            
            // Update test counts from results file
            if (testResults.numTotalTests !== undefined) {
              result.testCounts.total = testResults.numTotalTests;
              result.testCounts.passed = testResults.numPassedTests;
              result.testCounts.failed = testResults.numFailedTests;
              result.testCounts.skipped = testResults.numPendingTests;
            }
          } catch (error) {
            console.warn(`Could not parse test results file for ${component}:`, error.message);
          }
        }
        
        if (result.success) {
          resolve(result);
        } else {
          // Check if we should retry
          if (retry < config.retries.maxRetries && config.retries.enabled) {
            console.log(`Retrying ${component} tests (retry ${retry + 1}/${config.retries.maxRetries})...`);
            executeTest(retry + 1).then(resolve).catch(reject);
          } else {
            reject(new Error(`Tests failed for ${component} with exit code ${code}`));
          }
        }
      });
      
      // Handle process errors
      testProcess.on('error', (error) => {
        clearTimeout(timeout);
        
        result.endTime = Date.now();
        result.duration = result.endTime - result.startTime;
        result.status = 'error';
        result.errors.push(error.message);
        
        // Check if we should retry
        const shouldRetry = config.retries.enabled && retry < config.retries.maxRetries && 
          (config.retries.retryableErrorPatterns.some(pattern => error.message.includes(pattern)));
        
        if (shouldRetry) {
          console.log(`Retrying ${component} tests after error: ${error.message} (retry ${retry + 1}/${config.retries.maxRetries})...`);
          executeTest(retry + 1).then(resolve).catch(reject);
        } else {
          reject(error);
        }
      });
    });
  };
  
  try {
    // Execute tests with retry logic
    return await executeTest();
  } catch (error) {
    result.status = 'error';
    result.success = false;
    result.errors.push(error.message);
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    
    return result;
  }
}

/**
 * Parse test results from console output
 */
function parseTestResults(output, result) {
  // Match common test output patterns
  
  // Jest pattern: "Tests: 10 passed, 2 failed, 3 skipped"
  const jestPattern = /Tests:\s+(\d+)\s+passed,\s+(\d+)\s+failed(?:,\s+(\d+)\s+skipped)?/;
  const jestMatch = output.match(jestPattern);
  
  if (jestMatch) {
    const passed = parseInt(jestMatch[1], 10);
    const failed = parseInt(jestMatch[2], 10);
    const skipped = jestMatch[3] ? parseInt(jestMatch[3], 10) : 0;
    
    result.testCounts.passed = passed;
    result.testCounts.failed = failed;
    result.testCounts.skipped = skipped;
    result.testCounts.total = passed + failed + skipped;
    return;
  }
  
  // Mocha pattern: "10 passing, 2 failing, 3 pending"
  const mochaPattern = /(\d+)\s+passing,\s+(\d+)\s+failing(?:,\s+(\d+)\s+pending)?/;
  const mochaMatch = output.match(mochaPattern);
  
  if (mochaMatch) {
    const passed = parseInt(mochaMatch[1], 10);
    const failed = parseInt(mochaMatch[2], 10);
    const skipped = mochaMatch[3] ? parseInt(mochaMatch[3], 10) : 0;
    
    result.testCounts.passed = passed;
    result.testCounts.failed = failed;
    result.testCounts.skipped = skipped;
    result.testCounts.total = passed + failed + skipped;
    return;
  }
  
  // PyTest pattern: "10 passed, 2 failed, 3 skipped"
  const pytestPattern = /(\d+)\s+passed,\s+(\d+)\s+failed(?:,\s+(\d+)\s+skipped)?/;
  const pytestMatch = output.match(pytestPattern);
  
  if (pytestMatch) {
    const passed = parseInt(pytestMatch[1], 10);
    const failed = parseInt(pytestMatch[2], 10);
    const skipped = pytestMatch[3] ? parseInt(pytestMatch[3], 10) : 0;
    
    result.testCounts.passed = passed;
    result.testCounts.failed = failed;
    result.testCounts.skipped = skipped;
    result.testCounts.total = passed + failed + skipped;
    return;
  }
}

/**
 * Generate a comprehensive test report
 */
function generateReport() {
  console.log('\nGenerating test report...');
  
  const reportFile = path.join(
    config.outputPath,
    `test-report-${new Date().toISOString().replace(/:/g, '-')}.json`
  );
  
  // Create report object
  const report = {
    timestamp: new Date().toISOString(),
    duration: metrics.summary.totalDuration,
    success: metrics.summary.failed === 0,
    summary: metrics.summary,
    components: metrics.components,
    config: {
      ...config,
      // Don't include full paths in the report
      rootPath: undefined,
      outputPath: undefined,
      logPath: undefined
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuCores: require('os').cpus().length
    }
  };
  
  // Write the report
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`Test report saved to ${reportFile}`);
  
  // Generate a markdown summary
  const summaryFile = path.join(
    config.outputPath,
    `test-summary-${new Date().toISOString().replace(/:/g, '-')}.md`
  );
  
  const summaryContent = [
    '# TAP Integration Platform Test Summary',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '## Overview',
    '',
    `- Status: ${report.success ? '✅ Success' : '❌ Failure'}`,
    `- Duration: ${(report.duration / 1000).toFixed(2)}s`,
    `- Components: ${report.summary.total}`,
    `- Successful: ${report.summary.successful}`,
    `- Failed: ${report.summary.failed}`,
    '',
    '## Test Results',
    '',
    `- Total Tests: ${report.summary.tests.total}`,
    `- Passed: ${report.summary.tests.passed}`,
    `- Failed: ${report.summary.tests.failed}`,
    `- Skipped: ${report.summary.tests.skipped}`,
    '',
    '## Component Details',
    '',
    ...Object.entries(report.components).map(([name, details]) => {
      return [
        `### ${name}`,
        '',
        `- Status: ${details.status}`,
        `- Duration: ${details.duration ? (details.duration / 1000).toFixed(2) + 's' : 'N/A'}`,
        `- Exit Code: ${details.exitCode !== undefined ? details.exitCode : 'N/A'}`,
        '',
        details.testCounts ? [
          '#### Test Counts',
          '',
          `- Total: ${details.testCounts.total}`,
          `- Passed: ${details.testCounts.passed}`,
          `- Failed: ${details.testCounts.failed}`,
          `- Skipped: ${details.testCounts.skipped}`,
          ''
        ].join('\n') : '',
        details.warnings?.length > 0 ? `Warnings: ${details.warnings.length}` : '',
        details.errors?.length > 0 ? `Errors: ${details.errors.length}` : '',
        '',
        '---',
        ''
      ].filter(Boolean).join('\n');
    }),
    '## Environment',
    '',
    `- Node.js: ${report.environment.nodeVersion}`,
    `- Platform: ${report.environment.platform}`,
    `- CPU Cores: ${report.environment.cpuCores}`,
    '',
    '## Next Steps',
    '',
    report.success ? [
      '- Review test coverage reports',
      '- Consider adding more tests for uncovered areas',
      '- Update documentation with test results'
    ].join('\n') : [
      '- Fix test failures (see logs)',
      '- Update test expectations if needed',
      '- Retry test process after fixes'
    ].join('\n')
  ].join('\n');
  
  fs.writeFileSync(summaryFile, summaryContent);
  console.log(`Test summary saved to ${summaryFile}`);
}

/**
 * Print a summary of the test process to the console
 */
function printSummary() {
  const duration = (metrics.summary.totalDuration / 1000).toFixed(2);
  const success = metrics.summary.failed === 0;
  
  console.log('\n==============================================');
  console.log(`Test ${success ? 'SUCCESS' : 'FAILED'}`);
  console.log('==============================================');
  console.log(`Total time: ${duration}s`);
  console.log(`Components: ${metrics.summary.total}`);
  console.log(`Successful: ${metrics.summary.successful}`);
  console.log(`Failed: ${metrics.summary.failed}`);
  console.log('');
  console.log(`Total Tests: ${metrics.summary.tests.total}`);
  console.log(`Passed: ${metrics.summary.tests.passed}`);
  console.log(`Failed: ${metrics.summary.tests.failed}`);
  console.log(`Skipped: ${metrics.summary.tests.skipped}`);
  console.log('==============================================');
  
  if (success) {
    console.log('✅ All tests passed');
  } else {
    console.log('❌ Some tests failed:');
    
    Object.entries(metrics.components)
      .filter(([_, details]) => !details.success)
      .forEach(([name, details]) => {
        console.log(`  - ${name}: ${details.status}`);
        
        if (details.testCounts && details.testCounts.failed > 0) {
          console.log(`    Failed tests: ${details.testCounts.failed}/${details.testCounts.total}`);
        }
        
        if (details.errors && details.errors.length > 0) {
          console.log('    Errors:');
          details.errors.slice(0, 3).forEach(error => {
            console.log(`      ${error.split('\n')[0]}`);
          });
          
          if (details.errors.length > 3) {
            console.log(`      ... and ${details.errors.length - 3} more errors`);
          }
        }
      });
  }
}

/**
 * Ensure that all required directories exist
 */
function ensureDirectoriesExist(dirs) {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Execute the main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});