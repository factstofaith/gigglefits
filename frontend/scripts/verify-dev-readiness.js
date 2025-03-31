#!/usr/bin/env node
/**
 * Development Environment Readiness Verification
 * 
 * This script runs a comprehensive verification of the codebase readiness for
 * the development environment, ensuring that both npm build and QA tests 
 * pass successfully with no errors.
 * 
 * Usage:
 *   node scripts/verify-dev-readiness.js [--verbose]
 */

import path from 'path';
import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default options
const options = {
  verbose: false,
  timestamp: new Date().toISOString().replace(/:/g, '-').slice(0, 19)
};

// Parse command line arguments
process.argv.slice(2).forEach(arg => {
  if (arg === '--verbose') options.verbose = true;
  if (arg === '--help') {
    console.log(`
Development Environment Readiness Verification

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --verbose        Show detailed output
  --help           Show this help message
`);
    process.exit(0);
  }
});

// Create results directory
const resultsDir = path.resolve(`./validation_results/dev-readiness-${options.timestamp}`);
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Logger with timestamps and colorized output
const log = {
  info: (message) => console.log(`\x1b[36m[${new Date().toISOString()}]\x1b[0m ${message}`),
  success: (message) => console.log(`\x1b[32m[${new Date().toISOString()}]\x1b[0m ${message}`),
  warning: (message) => console.log(`\x1b[33m[${new Date().toISOString()}]\x1b[0m ${message}`),
  error: (message) => console.log(`\x1b[31m[${new Date().toISOString()}]\x1b[0m ${message}`)
};

// Execute command and capture output
function runCommand(command, options = {}) {
  log.info(`Executing: ${command}`);
  
  try {
    // Use spawnSync for better stdout/stderr handling
    const result = spawnSync(command, {
      shell: true,
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large outputs
    });
    
    if (result.status !== 0) {
      log.error(`Command failed with status ${result.status}`);
      if (result.stderr) {
        log.error(`Error output: ${result.stderr}`);
      }
      return { success: false, error: result.stderr || 'Unknown error' };
    }
    
    return { success: true, output: result.stdout };
  } catch (error) {
    log.error(`Failed to execute command: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Write report file
function writeReport(report) {
  const reportPath = path.join(resultsDir, 'dev-readiness-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log.info(`Report written to: ${reportPath}`);
  
  // Create human-readable summary
  const summaryPath = path.join(resultsDir, 'dev-readiness-summary.md');
  const summaryContent = `# Development Environment Readiness Report

## Summary
**Timestamp:** ${report.timestamp}
**Status:** ${report.status}
**Overall Result:** ${report.success ? '✅ PASS' : '❌ FAIL'}

## Test Results

### Building
- **npm Build:** ${report.npmBuild.success ? '✅ PASS' : '❌ FAIL'}
- **Build Time:** ${report.npmBuild.durationMs}ms

### Testing
- **Unit Tests:** ${report.unitTests.success ? '✅ PASS' : '❌ FAIL'}
- **Unit Test Count:** ${report.unitTests.testCount || 'N/A'}
- **E2E Tests:** ${report.e2eTests.success ? '✅ PASS' : '❌ FAIL'}
- **E2E Test Count:** ${report.e2eTests.testCount || 'N/A'}

## Issues Found
${report.issues.length > 0 ? report.issues.map(issue => `- ${issue}`).join('\n') : 'No issues found.'}

## Next Steps
${report.success ? 'The codebase is ready for deployment to the development environment.' : 'Please fix the identified issues before deploying to the development environment.'}
`;

  fs.writeFileSync(summaryPath, summaryContent);
  log.info(`Summary written to: ${summaryPath}`);
  
  // Create symlink to latest results
  const latestDir = path.resolve('./validation_results/latest-dev-readiness');
  if (fs.existsSync(latestDir)) {
    fs.rmSync(latestDir, { recursive: true, force: true });
  }
  fs.mkdirSync(latestDir, { recursive: true });
  
  // Copy latest results
  fs.writeFileSync(
    path.join(latestDir, 'dev-readiness-report.json'),
    JSON.stringify(report, null, 2)
  );
  fs.writeFileSync(
    path.join(latestDir, 'dev-readiness-summary.md'),
    summaryContent
  );
}

// Verify readiness
async function verifyReadiness() {
  log.info('🚀 Starting Development Environment Readiness Verification');
  
  const report = {
    timestamp: new Date().toISOString(),
    status: 'In Progress',
    success: false,
    npmBuild: { success: false },
    unitTests: { success: false },
    e2eTests: { success: false },
    issues: []
  };
  
  try {
    // 1. Verify dependencies
    log.info('Step 1: Verifying dependencies');
    const depsResult = runCommand('npm ci');
    if (!depsResult.success) {
      report.issues.push('Dependency installation failed');
      throw new Error('Dependency installation failed');
    }
    
    // 2. Run npm build
    log.info('Step 2: Building npm package');
    const buildStartTime = Date.now();
    const buildResult = runCommand('npm run build:all');
    const buildEndTime = Date.now();
    
    report.npmBuild = {
      success: buildResult.success,
      durationMs: buildEndTime - buildStartTime
    };
    
    if (!buildResult.success) {
      report.issues.push('npm build failed');
      throw new Error('npm build failed');
    }
    
    log.success('npm build completed successfully');
    
    // 3. Run unit tests
    log.info('Step 3: Running unit tests');
    const unitTestStartTime = Date.now();
    const unitTestResult = runCommand('npm run test:once', { silent: !options.verbose });
    const unitTestEndTime = Date.now();
    
    // Parse test results to count tests
    let testCount = 0;
    if (unitTestResult.success && unitTestResult.output) {
      const match = unitTestResult.output.match(/(\d+)\s+passed/);
      if (match && match[1]) {
        testCount = parseInt(match[1], 10);
      }
    }
    
    report.unitTests = {
      success: unitTestResult.success,
      durationMs: unitTestEndTime - unitTestStartTime,
      testCount
    };
    
    if (!unitTestResult.success) {
      report.issues.push('Unit tests failed');
      throw new Error('Unit tests failed');
    }
    
    log.success(`Unit tests completed successfully (${testCount} tests passed)`);
    
    // 4. Run e2e tests
    log.info('Step 4: Running E2E tests');
    const e2eTestStartTime = Date.now();
    const e2eTestResult = runCommand('npm run cypress:run', { silent: !options.verbose });
    const e2eTestEndTime = Date.now();
    
    // Parse e2e test results to count tests
    let e2eTestCount = 0;
    if (e2eTestResult.success && e2eTestResult.output) {
      const match = e2eTestResult.output.match(/(\d+)\s+passed/);
      if (match && match[1]) {
        e2eTestCount = parseInt(match[1], 10);
      }
    }
    
    report.e2eTests = {
      success: e2eTestResult.success,
      durationMs: e2eTestEndTime - e2eTestStartTime,
      testCount: e2eTestCount
    };
    
    if (!e2eTestResult.success) {
      report.issues.push('E2E tests failed');
      throw new Error('E2E tests failed');
    }
    
    log.success(`E2E tests completed successfully (${e2eTestCount} tests passed)`);
    
    // 5. Verify artifacts
    log.info('Step 5: Verifying artifacts');
    const artifactsResult = runCommand('npm run verify:artifacts', { silent: !options.verbose });
    
    if (!artifactsResult.success) {
      report.issues.push('Artifact verification failed');
      throw new Error('Artifact verification failed');
    }
    
    log.success('Artifacts verified successfully');
    
    // All tests passed
    report.success = true;
    report.status = 'Completed Successfully';
    log.success('🎉 All verification tests passed! The codebase is ready for development environment.');
    
  } catch (error) {
    report.status = 'Failed';
    log.error(`❌ Verification failed: ${error.message}`);
    if (!report.issues.includes(error.message)) {
      report.issues.push(error.message);
    }
  } finally {
    // Generate report
    writeReport(report);
    
    // Print results
    if (report.success) {
      log.success(`
┌────────────────────────────────────────────────┐
│                                                │
│   ✅ DEV ENVIRONMENT READINESS: VERIFIED      │
│                                                │
│   ✓ npm build: Successful                     │
│   ✓ Unit tests: Passed                        │
│   ✓ E2E tests: Passed                         │
│   ✓ Artifacts: Verified                       │
│                                                │
│   Ready for deployment to dev environment!     │
│                                                │
└────────────────────────────────────────────────┘
`);
    } else {
      log.error(`
┌────────────────────────────────────────────────┐
│                                                │
│   ❌ DEV ENVIRONMENT READINESS: FAILED        │
│                                                │
│   Issues Found:                                │
${report.issues.map(issue => `│   - ${issue}`).join('\n')}
│                                                │
│   Please fix the issues before deploying!      │
│                                                │
└────────────────────────────────────────────────┘
`);
    }
    
    // Exit with appropriate code
    process.exit(report.success ? 0 : 1);
  }
}

// Run the verification
verifyReadiness().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});