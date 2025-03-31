#!/usr/bin/env node
/**
 * Combined NPM and QA Testing Pipeline
 * 
 * This script orchestrates the complete build, test, and verification pipeline
 * for the NPM package, integrating all steps in a coordinated workflow.
 * 
 * Usage:
 *   node scripts/run-integrated-pipeline.js [--skip-build] [--skip-tests] [--report-only]
 */

const path = require('path');
const { execSync, spawn } = require('child_process');
const fs = require('fs');

// Default options
const options = {
  skipBuild: false,
  skipTests: false, 
  reportOnly: false,
  verbose: false,
  timestamp: new Date().toISOString().replace(/:/g, '-').slice(0, 19)
};

// Parse command line arguments
process.argv.slice(2).forEach(arg => {
  if (arg === '--skip-build') options.skipBuild = true;
  if (arg === '--skip-tests') options.skipTests = true;
  if (arg === '--report-only') options.reportOnly = true;
  if (arg === '--verbose') options.verbose = true;
  if (arg === '--help') {
    console.log(`
Combined NPM and QA Testing Pipeline

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --skip-build     Skip the package build step
  --skip-tests     Skip the test execution
  --report-only    Generate reports without failing on errors
  --verbose        Show detailed output
  --help           Show this help message
`);
    process.exit(0);
  }
});

// Create results directory
const resultsDir = path.resolve(`./validation_results/${options.timestamp}`);
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Logger with timestamps
const log = {
  info: (message) => console.log(`\x1b[36m[${new Date().toISOString()}]\x1b[0m ${message}`),
  success: (message) => console.log(`\x1b[32m[${new Date().toISOString()}]\x1b[0m ${message}`),
  warning: (message) => console.log(`\x1b[33m[${new Date().toISOString()}]\x1b[0m ${message}`),
  error: (message) => console.log(`\x1b[31m[${new Date().toISOString()}]\x1b[0m ${message}`)
};

// Execute command and handle errors
function executeCommand(command, errorMessage, silent = false) {
  try {
    log.info(`Executing: ${command}`);
    const output = execSync(command, { 
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf-8'
    });
    return { success: true, output };
  } catch (error) {
    if (!options.reportOnly) {
      log.error(`${errorMessage}: ${error.message}`);
      throw error;
    } else {
      log.warning(`${errorMessage} (continuing due to report-only mode)`);
      return { success: false, error: error.message };
    }
  }
}

// Main pipeline execution
async function runPipeline() {
  const results = {
    build: { status: 'skipped' },
    tests: { status: 'skipped' },
    verification: { status: 'skipped' },
    report: { status: 'pending' },
    timestamp: options.timestamp
  };

  try {
    // 1. Build the package
    if (!options.skipBuild) {
      log.info('STEP 1: Building NPM package');
      results.build = { status: 'running' };
      
      // Execute production build with proper module format support
      const buildOutput = executeCommand(
        'npm run build:all',
        'Failed to build package with multi-format support'
      );
      
      results.build = { 
        status: 'completed',
        success: buildOutput.success
      };
      log.success('Package build completed');
    }

    // 2. Run tests
    if (!options.skipTests) {
      log.info('STEP 2: Running test suites');
      results.tests = { status: 'running' };
      
      // Execute Jest tests
      const jestOutput = executeCommand(
        'npm run test:once',
        'Unit tests failed',
        options.verbose ? false : true
      );
      
      // Execute test coverage generation
      const coverageOutput = executeCommand(
        'npm run test:coverage:summary',
        'Coverage generation failed',
        options.verbose ? false : true
      );
      
      results.tests = { 
        status: 'completed',
        success: jestOutput.success,
        coverage: coverageOutput.success
      };
      log.success('Test execution completed');
    }

    // 3. Verify artifacts
    log.info('STEP 3: Verifying artifacts');
    results.verification = { status: 'running' };
    
    // Verify package artifacts
    const verifyArtifactsOutput = executeCommand(
      `node scripts/verify-artifacts.js ${options.reportOnly ? '--report-only' : ''}`,
      'Artifact verification failed',
      options.verbose ? false : true
    );
    
    // Run compatibility check
    const compatibilityOutput = executeCommand(
      `node scripts/compatibility-test.js ${options.reportOnly ? '--report-only' : ''}`,
      'Compatibility check failed',
      options.verbose ? false : true
    );
    
    results.verification = { 
      status: 'completed',
      success: verifyArtifactsOutput.success && compatibilityOutput.success
    };
    log.success('Verification completed');

    // 4. Generate unified report
    log.info('STEP 4: Generating unified report');
    results.report = { status: 'running' };
    
    // Create summary file
    fs.writeFileSync(
      path.join(resultsDir, 'pipeline_summary.json'),
      JSON.stringify(results, null, 2)
    );
    
    // Create symlink to latest results
    const latestDir = path.resolve('./validation_results/latest');
    if (fs.existsSync(latestDir)) {
      fs.rmSync(latestDir, { recursive: true, force: true });
    }
    fs.mkdirSync(latestDir, { recursive: true });
    
    // Copy latest results
    fs.writeFileSync(
      path.join(latestDir, 'pipeline_summary.json'),
      JSON.stringify(results, null, 2)
    );
    
    // Generate HTML report
    executeCommand(
      `node scripts/generate-unified-report.js --output-dir "${resultsDir}"`,
      'Failed to generate unified report'
    );
    
    results.report = { 
      status: 'completed',
      success: true,
      reportPath: resultsDir
    };
    log.success('Report generation completed');

    // Final status
    const allSuccessful = 
      (options.skipBuild || results.build.success) &&
      (options.skipTests || results.tests.success) &&
      results.verification.success &&
      results.report.success;
      
    if (allSuccessful) {
      log.success('🎉 Pipeline completed successfully!');
      log.info(`Reports available at: ${resultsDir}`);
      
      // Create production readiness report
      executeCommand(
        'npm run validate:production',
        'Failed to generate production readiness report',
        !options.verbose
      );
      
      process.exit(0);
    } else {
      log.warning('⚠️ Pipeline completed with issues');
      log.info(`Check reports for details at: ${resultsDir}`);
      
      if (!options.reportOnly) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    }
  } catch (error) {
    log.error(`Pipeline execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute pipeline
runPipeline().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});