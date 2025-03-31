/**
 * End-to-End Test Automation Runner
 * 
 * This script provides a comprehensive solution for end-to-end test automation
 * following the zero technical debt approach.
 * 
 * It configures, schedules, and executes e2e test suites,
 * while providing detailed reporting and analysis.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync, spawn } = require('child_process');
const { createHtmlReport } = require('cypress-mochawesome-reporter/lib');

// Configuration
const CONFIG = {
  // Test directories
  testDirectories: {
    flowTests: 'cypress/e2e/flows/**/*.cy.js',
    a11yTests: 'cypress/e2e/a11y/**/*.cy.js',
    visualTests: 'cypress/e2e/visual/**/*.cy.js',
    performanceTests: 'cypress/e2e/performance/**/*.cy.js',
    regressionTests: 'cypress/e2e/regression/**/*.cy.js',
  },
  
  // Report directories
  reportDirectories: {
    base: 'reports/e2e',
    mochawesome: 'reports/e2e/mochawesome',
    html: 'reports/e2e/html',
    trends: 'reports/e2e/trends',
    videos: 'reports/e2e/videos',
    screenshots: 'reports/e2e/screenshots'
  },
  
  // Test environments
  environments: {
    local: {
      baseUrl: 'http://localhost:3000',
      apiUrl: 'http://localhost:8000'
    },
    dev: {
      baseUrl: 'https://dev.tapintegration.example.com',
      apiUrl: 'https://dev-api.tapintegration.example.com' 
    },
    qa: {
      baseUrl: 'https://qa.tapintegration.example.com',
      apiUrl: 'https://qa-api.tapintegration.example.com'
    }
  },
  
  // Browser configurations
  browsers: ['chrome', 'firefox', 'edge'],
  
  // Concurrency levels
  concurrency: 4,
  
  // Retry configuration
  retries: {
    runMode: 2,
    openMode: 0
  },
  
  // Notification configuration
  notifications: {
    slack: {
      webhook: process.env.SLACK_WEBHOOK_URL,
      channel: '#e2e-test-results'
    },
    email: {
      enabled: false,
      recipients: ['qa-team@example.com']
    }
  }
};

// Create report directories if they don't exist
Object.values(CONFIG.reportDirectories).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Get all test files based on pattern
 * 
 * @param {string} pattern - Glob pattern for test files
 * @returns {Array<string>} - List of matching test file paths
 */
function getTestFiles(pattern) {
  return glob.sync(pattern);
}

/**
 * Generate a timestamp string for reports
 * 
 * @returns {string} - Formatted timestamp
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '');
}

/**
 * Run Cypress tests with provided configuration
 * 
 * @param {Object} options - Test run options
 * @param {string} options.testFiles - Pattern or array of test files to run
 * @param {string} options.browser - Browser to run tests in
 * @param {string} options.environment - Test environment to use
 * @param {string} options.reportDir - Directory for test reports
 * @param {boolean} options.isRegression - Whether this is a regression test run
 * @returns {Promise<Object>} - Test run results
 */
function runCypressTests({ testFiles, browser, environment, reportDir, isRegression = false }) {
  const timestamp = getTimestamp();
  const reportFilename = `${browser}-${environment}-${timestamp}`;
  
  console.log(`Running tests: ${testFiles} in ${browser} against ${environment} environment`);
  
  // Build Cypress arguments
  const cypressArgs = [
    'run',
    '--browser', browser,
    '--headless',
    '--reporter', 'cypress-mochawesome-reporter',
    '--config-file', 'cypress.config.js',
    '--config', [
      `baseUrl=${CONFIG.environments[environment].baseUrl}`,
      `screenshotsFolder=${CONFIG.reportDirectories.screenshots}/${reportFilename}`,
      `videosFolder=${CONFIG.reportDirectories.videos}/${reportFilename}`,
      'video=true',
      `retries=${CONFIG.retries.runMode}`,
      isRegression ? 'shouldCompareSnapshots=true' : 'shouldCompareSnapshots=false'
    ].join(','),
    '--env', `apiUrl=${CONFIG.environments[environment].apiUrl},isRegression=${isRegression}`,
    '--reporter-options', `reportDir=${reportDir},reportFilename=${reportFilename},overwrite=false,html=false,json=true`
  ];
  
  // Add test files specification
  if (Array.isArray(testFiles)) {
    testFiles.forEach(file => {
      cypressArgs.push('--spec', file);
    });
  } else {
    cypressArgs.push('--spec', testFiles);
  }
  
  return new Promise((resolve, reject) => {
    const cypress = spawn('npx', ['cypress', ...cypressArgs], { stdio: 'inherit' });
    
    cypress.on('close', (code) => {
      if (code === 0 || code === 1) {
        // Code 1 might mean tests failed but ran successfully
        resolve({
          success: code === 0,
          browser,
          environment,
          timestamp,
          reportFile: `${reportDir}/${reportFilename}.json`,
          exitCode: code
        });
      } else {
        reject(new Error(`Cypress process exited with code ${code}`));
      }
    });
    
    cypress.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Run all test suites for a specific configuration
 * 
 * @param {string} browser - Browser to run tests in
 * @param {string} environment - Test environment to use
 * @returns {Promise<Array<Object>>} - Results for all test suites
 */
async function runAllTestSuites(browser, environment) {
  const suites = [
    {
      name: 'Flow Tests',
      files: CONFIG.testDirectories.flowTests,
      reportDir: `${CONFIG.reportDirectories.mochawesome}/flows`,
      isRegression: false
    },
    {
      name: 'Accessibility Tests',
      files: CONFIG.testDirectories.a11yTests,
      reportDir: `${CONFIG.reportDirectories.mochawesome}/a11y`,
      isRegression: false
    },
    {
      name: 'Visual Tests',
      files: CONFIG.testDirectories.visualTests,
      reportDir: `${CONFIG.reportDirectories.mochawesome}/visual`,
      isRegression: false
    },
    {
      name: 'Performance Tests',
      files: CONFIG.testDirectories.performanceTests,
      reportDir: `${CONFIG.reportDirectories.mochawesome}/performance`,
      isRegression: false
    }
  ];
  
  const results = [];
  
  for (const suite of suites) {
    try {
      console.log(`Running ${suite.name} in ${browser} against ${environment} environment`);
      
      const result = await runCypressTests({
        testFiles: suite.files,
        browser,
        environment,
        reportDir: suite.reportDir,
        isRegression: suite.isRegression
      });
      
      results.push({
        ...result,
        suite: suite.name
      });
      
      console.log(`Completed ${suite.name} with exit code ${result.exitCode}`);
    } catch (error) {
      console.error(`Error running ${suite.name}:`, error);
      results.push({
        success: false,
        browser,
        environment,
        suite: suite.name,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Run regression test suite
 * 
 * @param {string} browser - Browser to run tests in
 * @param {string} environment - Test environment to use
 * @returns {Promise<Object>} - Regression test results
 */
async function runRegressionSuite(browser, environment) {
  try {
    console.log(`Running Regression Suite in ${browser} against ${environment} environment`);
    
    const result = await runCypressTests({
      testFiles: CONFIG.testDirectories.regressionTests,
      browser,
      environment,
      reportDir: `${CONFIG.reportDirectories.mochawesome}/regression`,
      isRegression: true
    });
    
    console.log(`Completed Regression Suite with exit code ${result.exitCode}`);
    
    return {
      ...result,
      suite: 'Regression Tests'
    };
  } catch (error) {
    console.error('Error running Regression Suite:', error);
    return {
      success: false,
      browser,
      environment,
      suite: 'Regression Tests',
      error: error.message
    };
  }
}

/**
 * Generate HTML reports from test results
 */
function generateHtmlReports() {
  console.log('Generating HTML Reports...');
  
  try {
    createHtmlReport({
      reportDir: CONFIG.reportDirectories.mochawesome,
      reportFilename: 'combined-report',
      reportTitle: 'TAP Integration Platform E2E Test Report',
      reportPageTitle: 'E2E Test Results',
      inline: true,
      charts: true,
      embeddedScreenshots: true,
      inlineAssets: true,
      saveJson: true,
      overwrite: true,
      showSkipped: true,
      showHooks: 'failed'
    });
    
    console.log(`HTML report generated at ${CONFIG.reportDirectories.html}/combined-report.html`);
  } catch (error) {
    console.error('Error generating HTML report:', error);
  }
}

/**
 * Analyze test results and generate summary
 * 
 * @param {Array<Object>} allResults - All test run results
 * @returns {Object} - Test result summary
 */
function analyzeResults(allResults) {
  const summary = {
    totalRuns: allResults.length,
    successful: allResults.filter(r => r.success).length,
    failed: allResults.filter(r => !r.success).length,
    byBrowser: {},
    byEnvironment: {},
    bySuite: {}
  };
  
  // Group by browser
  allResults.forEach(result => {
    if (!summary.byBrowser[result.browser]) {
      summary.byBrowser[result.browser] = { total: 0, successful: 0, failed: 0 };
    }
    
    summary.byBrowser[result.browser].total++;
    
    if (result.success) {
      summary.byBrowser[result.browser].successful++;
    } else {
      summary.byBrowser[result.browser].failed++;
    }
  });
  
  // Group by environment
  allResults.forEach(result => {
    if (!summary.byEnvironment[result.environment]) {
      summary.byEnvironment[result.environment] = { total: 0, successful: 0, failed: 0 };
    }
    
    summary.byEnvironment[result.environment].total++;
    
    if (result.success) {
      summary.byEnvironment[result.environment].successful++;
    } else {
      summary.byEnvironment[result.environment].failed++;
    }
  });
  
  // Group by suite
  allResults.forEach(result => {
    if (!summary.bySuite[result.suite]) {
      summary.bySuite[result.suite] = { total: 0, successful: 0, failed: 0 };
    }
    
    summary.bySuite[result.suite].total++;
    
    if (result.success) {
      summary.bySuite[result.suite].successful++;
    } else {
      summary.bySuite[result.suite].failed++;
    }
  });
  
  return summary;
}

/**
 * Generate summary report
 * 
 * @param {Object} summary - Test results summary
 * @returns {string} - Formatted summary report
 */
function generateSummaryReport(summary) {
  const totalPassRate = (summary.successful / summary.totalRuns * 100).toFixed(2);
  
  let report = `# E2E Test Automation Summary\n\n`;
  report += `Run Date: ${new Date().toISOString()}\n\n`;
  report += `## Overall Results\n\n`;
  report += `- Total Test Runs: ${summary.totalRuns}\n`;
  report += `- Successful: ${summary.successful} (${totalPassRate}%)\n`;
  report += `- Failed: ${summary.failed}\n\n`;
  
  report += `## Results by Browser\n\n`;
  Object.entries(summary.byBrowser).forEach(([browser, stats]) => {
    const passRate = (stats.successful / stats.total * 100).toFixed(2);
    report += `### ${browser}\n`;
    report += `- Tests: ${stats.total}\n`;
    report += `- Pass Rate: ${passRate}%\n\n`;
  });
  
  report += `## Results by Environment\n\n`;
  Object.entries(summary.byEnvironment).forEach(([env, stats]) => {
    const passRate = (stats.successful / stats.total * 100).toFixed(2);
    report += `### ${env}\n`;
    report += `- Tests: ${stats.total}\n`;
    report += `- Pass Rate: ${passRate}%\n\n`;
  });
  
  report += `## Results by Test Suite\n\n`;
  Object.entries(summary.bySuite).forEach(([suite, stats]) => {
    const passRate = (stats.successful / stats.total * 100).toFixed(2);
    report += `### ${suite}\n`;
    report += `- Tests: ${stats.total}\n`;
    report += `- Pass Rate: ${passRate}%\n\n`;
  });
  
  return report;
}

/**
 * Save test results and summary
 * 
 * @param {Array<Object>} allResults - All test run results
 * @param {Object} summary - Test results summary
 */
function saveResults(allResults, summary) {
  const timestamp = getTimestamp();
  
  // Save raw results
  const resultsPath = `${CONFIG.reportDirectories.base}/results-${timestamp}.json`;
  fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
  
  // Save summary
  const summaryPath = `${CONFIG.reportDirectories.base}/summary-${timestamp}.json`;
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  // Save summary report
  const reportPath = `${CONFIG.reportDirectories.base}/report-${timestamp}.md`;
  fs.writeFileSync(reportPath, generateSummaryReport(summary));
  
  console.log(`Results saved to ${resultsPath}`);
  console.log(`Summary saved to ${summaryPath}`);
  console.log(`Report saved to ${reportPath}`);
  
  // Save latest summary for quick access
  fs.writeFileSync(`${CONFIG.reportDirectories.base}/latest-summary.json`, JSON.stringify(summary, null, 2));
  fs.writeFileSync(`${CONFIG.reportDirectories.base}/latest-report.md`, generateSummaryReport(summary));
}

/**
 * Track test result trends over time
 * 
 * @param {Object} summary - Latest test results summary
 */
function trackResultTrends(summary) {
  const trendsFile = `${CONFIG.reportDirectories.trends}/trends.json`;
  let trends = [];
  
  // Load existing trends if available
  if (fs.existsSync(trendsFile)) {
    try {
      trends = JSON.parse(fs.readFileSync(trendsFile, 'utf8'));
    } catch (error) {
      console.error('Error loading trends file:', error);
    }
  }
  
  // Add latest results
  trends.push({
    timestamp: new Date().toISOString(),
    summary
  });
  
  // Limit history to last 50 runs
  if (trends.length > 50) {
    trends = trends.slice(trends.length - 50);
  }
  
  // Save updated trends
  fs.writeFileSync(trendsFile, JSON.stringify(trends, null, 2));
  
  console.log(`Trends updated in ${trendsFile}`);
}

/**
 * Send notifications with test results
 * 
 * @param {Object} summary - Test results summary
 */
function sendNotifications(summary) {
  // This is a placeholder for notification implementation
  if (CONFIG.notifications.slack.webhook) {
    console.log('Sending Slack notification...');
    // Implementation would go here
  }
  
  if (CONFIG.notifications.email.enabled) {
    console.log('Sending email notification...');
    // Implementation would go here
  }
}

/**
 * Main function to run the E2E test automation
 * 
 * @param {Object} options - Command line options
 */
async function main(options) {
  console.log('Starting E2E Test Automation...');
  console.log('Options:', options);
  
  // Only use selected browsers if specified
  const browsers = options.browser ? [options.browser] : CONFIG.browsers;
  
  // Only use selected environment if specified
  const environments = options.environment ? [options.environment] : Object.keys(CONFIG.environments);
  
  // Collect all results
  const allResults = [];
  
  // Run all test suites for each browser and environment
  for (const browser of browsers) {
    for (const environment of environments) {
      // Run regression suite if specified
      if (options.regression) {
        const regressionResult = await runRegressionSuite(browser, environment);
        allResults.push(regressionResult);
        continue;
      }
      
      // Run all test suites if not running specific suite
      if (!options.suite) {
        const suiteResults = await runAllTestSuites(browser, environment);
        allResults.push(...suiteResults);
        continue;
      }
      
      // Run specific test suite
      const suiteConfig = {
        flows: {
          name: 'Flow Tests',
          files: CONFIG.testDirectories.flowTests,
          reportDir: `${CONFIG.reportDirectories.mochawesome}/flows`,
          isRegression: false
        },
        a11y: {
          name: 'Accessibility Tests',
          files: CONFIG.testDirectories.a11yTests,
          reportDir: `${CONFIG.reportDirectories.mochawesome}/a11y`,
          isRegression: false
        },
        visual: {
          name: 'Visual Tests',
          files: CONFIG.testDirectories.visualTests,
          reportDir: `${CONFIG.reportDirectories.mochawesome}/visual`,
          isRegression: false
        },
        performance: {
          name: 'Performance Tests',
          files: CONFIG.testDirectories.performanceTests,
          reportDir: `${CONFIG.reportDirectories.mochawesome}/performance`,
          isRegression: false
        }
      };
      
      const suite = suiteConfig[options.suite];
      
      if (!suite) {
        console.error(`Unknown test suite: ${options.suite}`);
        process.exit(1);
      }
      
      try {
        const result = await runCypressTests({
          testFiles: suite.files,
          browser,
          environment,
          reportDir: suite.reportDir,
          isRegression: suite.isRegression
        });
        
        allResults.push({
          ...result,
          suite: suite.name
        });
      } catch (error) {
        console.error(`Error running ${suite.name}:`, error);
        allResults.push({
          success: false,
          browser,
          environment,
          suite: suite.name,
          error: error.message
        });
      }
    }
  }
  
  // Generate HTML reports
  generateHtmlReports();
  
  // Analyze results
  const summary = analyzeResults(allResults);
  
  // Save results and summary
  saveResults(allResults, summary);
  
  // Track trends
  trackResultTrends(summary);
  
  // Send notifications
  sendNotifications(summary);
  
  console.log('E2E Test Automation Complete!');
  console.log('Summary:');
  console.log(`- Total Runs: ${summary.totalRuns}`);
  console.log(`- Success: ${summary.successful}`);
  console.log(`- Failed: ${summary.failed}`);
  console.log(`- Pass Rate: ${(summary.successful / summary.totalRuns * 100).toFixed(2)}%`);
  
  // Exit with appropriate code
  const exitCode = summary.failed > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  browser: null,
  environment: null,
  suite: null,
  regression: false
};

// Simple argument parser
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--browser' && i + 1 < args.length) {
    options.browser = args[++i];
  } else if (arg === '--environment' && i + 1 < args.length) {
    options.environment = args[++i];
  } else if (arg === '--suite' && i + 1 < args.length) {
    options.suite = args[++i];
  } else if (arg === '--regression') {
    options.regression = true;
  } else if (arg === '--help') {
    console.log(`
Usage: node e2e-test-automation.js [options]

Options:
  --browser <name>       Run tests in specific browser (chrome, firefox, edge)
  --environment <name>   Run tests in specific environment (local, dev, qa)
  --suite <name>         Run specific test suite (flows, a11y, visual, performance)
  --regression           Run regression test suite
  --help                 Show this help message
    `);
    process.exit(0);
  }
}

// Run the test automation
main(options);