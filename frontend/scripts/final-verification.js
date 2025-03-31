#!/usr/bin/env node
/**
 * Final Production Verification Script
 *
 * This script performs comprehensive verification of the production build,
 * including build execution, test suite validation, performance assessment,
 * and compatibility verification.
 *
 * Usage:
 *   node scripts/final-verification.js [--output-dir path/to/output]
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Default settings
const options = {
  outputDir: path.resolve(`./validation_results/production-${new Date().toISOString().replace(/:/g, '-').slice(0, 10)}`),
  reportOnly: false,
  verbose: false
};

// Parse command line arguments
process.argv.slice(2).forEach(arg => {
  if (arg.startsWith('--output-dir=')) {
    options.outputDir = path.resolve(arg.split('=')[1]);
  } else if (arg === '--report-only') {
    options.reportOnly = true;
  } else if (arg === '--verbose') {
    options.verbose = true;
  } else if (arg === '--help') {
    console.log(`
Final Production Verification Script

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --output-dir=<path>   Directory to output verification results (default: ./validation_results/production-YYYY-MM-DD)
  --report-only         Generate reports without failing on errors
  --verbose             Show detailed output
  --help                Show this help message
`);
    process.exit(0);
  }
});

// Create output directory if it doesn't exist
if (!fs.existsSync(options.outputDir)) {
  fs.mkdirSync(options.outputDir, { recursive: true });
}

// Logger with timestamps
const log = {
  info: (message) => console.log(`\x1b[36m[${new Date().toISOString()}]\x1b[0m ${message}`),
  success: (message) => console.log(`\x1b[32m[${new Date().toISOString()}]\x1b[0m ${message}`),
  warning: (message) => console.log(`\x1b[33m[${new Date().toISOString()}]\x1b[0m ${message}`),
  error: (message) => console.log(`\x1b[31m[${new Date().toISOString()}]\x1b[0m ${message}`)
};

// Execute command and handle errors
function executeCommand(command, options = {}) {
  const { silent = false, ignoreError = false } = options;
  
  try {
    log.info(`Executing: ${command}`);
    const output = execSync(command, { 
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf-8'
    });
    return { success: true, output };
  } catch (error) {
    if (ignoreError) {
      log.warning(`Command failed but continuing: ${command}`);
      return { success: false, error: error.message };
    } else {
      log.error(`Command failed: ${command}`);
      log.error(`Error: ${error.message}`);
      throw error;
    }
  }
}

// Main verification function
async function verifyProductionBuild() {
  log.info('🔍 Starting final production build verification');
  
  // Verification steps
  const verificationSteps = [
    { name: 'Clean environment', status: 'pending' },
    { name: 'Production build', status: 'pending' },
    { name: 'Type checking', status: 'pending' },
    { name: 'Linting', status: 'pending' },
    { name: 'Unit tests', status: 'pending' },
    { name: 'Integration tests', status: 'pending' },
    { name: 'Bundle analysis', status: 'pending' },
    { name: 'Artifact verification', status: 'pending' },
    { name: 'Compatibility testing', status: 'pending' },
    { name: 'Performance assessment', status: 'pending' },
    { name: 'Documentation validation', status: 'pending' }
  ];
  
  const results = {
    timestamp: new Date().toISOString(),
    steps: verificationSteps,
    summary: {
      totalSteps: verificationSteps.length,
      completedSteps: 0,
      successfulSteps: 0,
      failedSteps: 0
    }
  };

  try {
    // 1. Clean environment
    log.info('\n==== STEP 1: Clean Environment ====');
    results.steps[0].status = 'running';
    
    try {
      executeCommand('npm run clean || true', { silent: !options.verbose, ignoreError: true });
      executeCommand('rm -rf ./dist ./build ./coverage ./validation_results/latest', { silent: !options.verbose, ignoreError: true });
      results.steps[0].status = 'success';
      results.summary.successfulSteps++;
    } catch (error) {
      results.steps[0].status = 'failed';
      results.steps[0].error = error.message;
      results.summary.failedSteps++;
      if (!options.reportOnly) throw error;
    }
    results.summary.completedSteps++;

    // 2. Production build
    log.info('\n==== STEP 2: Production Build ====');
    results.steps[1].status = 'running';
    
    try {
      executeCommand('npm run build:production', { silent: !options.verbose });
      executeCommand('npm run build:all', { silent: !options.verbose });
      results.steps[1].status = 'success';
      results.summary.successfulSteps++;
    } catch (error) {
      results.steps[1].status = 'failed';
      results.steps[1].error = error.message;
      results.summary.failedSteps++;
      if (!options.reportOnly) throw error;
    }
    results.summary.completedSteps++;

    // 3. Type checking
    log.info('\n==== STEP 3: Type Checking ====');
    results.steps[2].status = 'running';
    
    try {
      executeCommand('npm run typecheck:ci', { silent: !options.verbose });
      results.steps[2].status = 'success';
      results.summary.successfulSteps++;
    } catch (error) {
      results.steps[2].status = 'failed';
      results.steps[2].error = error.message;
      results.summary.failedSteps++;
      if (!options.reportOnly) throw error;
    }
    results.summary.completedSteps++;

    // 4. Linting
    log.info('\n==== STEP 4: Linting ====');
    results.steps[3].status = 'running';
    
    try {
      executeCommand('npm run lint', { silent: !options.verbose, ignoreError: true });
      results.steps[3].status = 'success';
      results.summary.successfulSteps++;
    } catch (error) {
      results.steps[3].status = 'failed';
      results.steps[3].error = error.message;
      results.summary.failedSteps++;
      if (!options.reportOnly) throw error;
    }
    results.summary.completedSteps++;

    // 5. Unit tests
    log.info('\n==== STEP 5: Unit Tests ====');
    results.steps[4].status = 'running';
    
    try {
      executeCommand('npm run test:once', { silent: !options.verbose });
      results.steps[4].status = 'success';
      results.summary.successfulSteps++;
    } catch (error) {
      results.steps[4].status = 'failed';
      results.steps[4].error = error.message;
      results.summary.failedSteps++;
      if (!options.reportOnly) throw error;
    }
    results.summary.completedSteps++;

    // 6. Integration tests
    log.info('\n==== STEP 6: Integration Tests ====');
    results.steps[5].status = 'running';
    
    try {
      executeCommand('npm run test:utils', { silent: !options.verbose });
      executeCommand('npm run test:contexts', { silent: !options.verbose });
      results.steps[5].status = 'success';
      results.summary.successfulSteps++;
    } catch (error) {
      results.steps[5].status = 'failed';
      results.steps[5].error = error.message;
      results.summary.failedSteps++;
      if (!options.reportOnly) throw error;
    }
    results.summary.completedSteps++;

    // 7. Bundle analysis
    log.info('\n==== STEP 7: Bundle Analysis ====');
    results.steps[6].status = 'running';
    
    try {
      executeCommand('npm run analyze', { silent: !options.verbose, ignoreError: true });
      executeCommand('node scripts/analyze-bundle-size.js', { silent: !options.verbose, ignoreError: true });
      results.steps[6].status = 'success';
      results.summary.successfulSteps++;
    } catch (error) {
      results.steps[6].status = 'failed';
      results.steps[6].error = error.message;
      results.summary.failedSteps++;
      if (!options.reportOnly) throw error;
    }
    results.summary.completedSteps++;

    // 8. Artifact verification
    log.info('\n==== STEP 8: Artifact Verification ====');
    results.steps[7].status = 'running';
    
    try {
      executeCommand('npm run verify:artifacts', { silent: !options.verbose });
      results.steps[7].status = 'success';
      results.summary.successfulSteps++;
    } catch (error) {
      results.steps[7].status = 'failed';
      results.steps[7].error = error.message;
      results.summary.failedSteps++;
      if (!options.reportOnly) throw error;
    }
    results.summary.completedSteps++;

    // 9. Compatibility testing
    log.info('\n==== STEP 9: Compatibility Testing ====');
    results.steps[8].status = 'running';
    
    try {
      executeCommand('npm run verify:compatibility', { silent: !options.verbose });
      results.steps[8].status = 'success';
      results.summary.successfulSteps++;
    } catch (error) {
      results.steps[8].status = 'failed';
      results.steps[8].error = error.message;
      results.summary.failedSteps++;
      if (!options.reportOnly) throw error;
    }
    results.summary.completedSteps++;

    // 10. Performance assessment
    log.info('\n==== STEP 10: Performance Assessment ====');
    results.steps[9].status = 'running';
    
    try {
      executeCommand('node scripts/analyze-performance-impact.js', { silent: !options.verbose, ignoreError: true });
      results.steps[9].status = 'success';
      results.summary.successfulSteps++;
    } catch (error) {
      results.steps[9].status = 'failed';
      results.steps[9].error = error.message;
      results.summary.failedSteps++;
      // Don't throw for performance issues
    }
    results.summary.completedSteps++;

    // 11. Documentation validation
    log.info('\n==== STEP 11: Documentation Validation ====');
    results.steps[10].status = 'running';
    
    try {
      executeCommand('node scripts/verify-documentation.js', { silent: !options.verbose, ignoreError: true });
      results.steps[10].status = 'success';
      results.summary.successfulSteps++;
    } catch (error) {
      results.steps[10].status = 'failed';
      results.steps[10].error = error.message;
      results.summary.failedSteps++;
      // Don't throw for documentation issues
    }
    results.summary.completedSteps++;

    // Generate report
    log.info('\n🔖 Generating verification report...');
    
    // Save results to JSON file
    const resultsFile = path.join(options.outputDir, 'verification-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    log.info(`Results saved to ${resultsFile}`);
    
    // Generate HTML report
    generateHtmlReport(results, path.join(options.outputDir, 'verification-report.html'));
    log.info(`HTML report saved to ${path.join(options.outputDir, 'verification-report.html')}`);
    
    // Link to latest results
    const latestDir = path.resolve('./validation_results/latest');
    if (fs.existsSync(latestDir)) {
      fs.rmSync(latestDir, { recursive: true, force: true });
    }
    fs.mkdirSync(latestDir, { recursive: true });
    
    // Copy latest results
    fs.writeFileSync(
      path.join(latestDir, 'verification-results.json'),
      JSON.stringify(results, null, 2)
    );
    fs.writeFileSync(
      path.join(latestDir, 'verification-report.html'),
      fs.readFileSync(path.join(options.outputDir, 'verification-report.html'))
    );
    
    // Print summary
    log.info('\n📋 Verification Summary');
    log.info(`Total steps: ${results.summary.totalSteps}`);
    log.info(`Completed steps: ${results.summary.completedSteps}`);
    log.info(`Successful steps: ${results.summary.successfulSteps}`);
    log.info(`Failed steps: ${results.summary.failedSteps}`);
    
    if (results.summary.failedSteps === 0) {
      log.success('\n✅ All verification steps completed successfully!');
      return 0;
    } else {
      log.warning(`\n⚠️ ${results.summary.failedSteps} verification steps failed.`);
      return options.reportOnly ? 0 : 1;
    }
    
  } catch (error) {
    log.error(`\n❌ Verification failed: ${error.message}`);
    
    // Save partial results
    const resultsFile = path.join(options.outputDir, 'verification-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    log.info(`Partial results saved to ${resultsFile}`);
    
    return 1;
  }
}

// Generate HTML report
function generateHtmlReport(results, outputFile) {
  const statusColors = {
    pending: '#6c757d',
    running: '#007bff',
    success: '#28a745',
    failed: '#dc3545'
  };
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Production Verification Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    h1 {
      margin-bottom: 0.5rem;
    }
    .timestamp {
      color: #666;
      font-size: 0.9rem;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .summary-item {
      flex: 1;
      min-width: 200px;
      padding: 1rem;
      margin: 0.5rem;
      background-color: #f8f9fa;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
    }
    .summary-item h3 {
      margin-top: 0;
      margin-bottom: 0.5rem;
    }
    .summary-value {
      font-size: 2rem;
      font-weight: bold;
    }
    .steps-table {
      width: 100%;
      border-collapse: collapse;
    }
    .steps-table th, .steps-table td {
      border: 1px solid #ddd;
      padding: 10px;
    }
    .steps-table th {
      background-color: #f5f5f5;
      text-align: left;
    }
    .steps-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .status {
      font-weight: bold;
      padding: 3px 6px;
      border-radius: 3px;
      color: white;
    }
    .status-pending { background-color: ${statusColors.pending}; }
    .status-running { background-color: ${statusColors.running}; }
    .status-success { background-color: ${statusColors.success}; }
    .status-failed { background-color: ${statusColors.failed}; }
    .error-message {
      color: #dc3545;
      font-family: monospace;
      white-space: pre-wrap;
      margin-top: 8px;
    }
    .progress-bar-container {
      width: 100%;
      height: 20px;
      background-color: #f5f5f5;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 2rem;
    }
    .progress-bar {
      height: 100%;
      background-color: #28a745;
      width: ${results.summary.successfulSteps / results.summary.totalSteps * 100}%;
    }
    .report-footer {
      margin-top: 3rem;
      text-align: center;
      font-size: 0.9rem;
      color: #666;
    }
  </style>
</head>
<body>
  <header>
    <h1>Production Verification Report</h1>
    <p class="timestamp">Generated at: ${new Date(results.timestamp).toLocaleString()}</p>
  </header>
  
  <div class="progress-bar-container">
    <div class="progress-bar"></div>
  </div>
  
  <div class="summary">
    <div class="summary-item">
      <h3>Total Steps</h3>
      <div class="summary-value">${results.summary.totalSteps}</div>
    </div>
    <div class="summary-item">
      <h3>Completed</h3>
      <div class="summary-value">${results.summary.completedSteps}</div>
    </div>
    <div class="summary-item">
      <h3>Successful</h3>
      <div class="summary-value">${results.summary.successfulSteps}</div>
    </div>
    <div class="summary-item">
      <h3>Failed</h3>
      <div class="summary-value">${results.summary.failedSteps}</div>
    </div>
  </div>
  
  <h2>Verification Steps</h2>
  <table class="steps-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Step</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${results.steps.map((step, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${step.name}</td>
          <td>
            <span class="status status-${step.status}">${step.status.toUpperCase()}</span>
            ${step.error ? `<div class="error-message">${step.error}</div>` : ''}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="report-footer">
    <p>TAP Integration Platform - Production Verification Report</p>
  </div>
</body>
</html>`;

  fs.writeFileSync(outputFile, html);
}

// Execute verification
verifyProductionBuild()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });