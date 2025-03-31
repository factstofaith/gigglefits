#!/usr/bin/env node

/**
 * parallel-validation.js
 * 
 * ADVANCED PARALLEL VALIDATION SYSTEM
 * 
 * This script enhances the static-error-finder.js by providing true parallel 
 * validation capabilities. It runs build and test processes simultaneously,
 * captures their outputs, and performs correlation analysis to identify 
 * relationships between build errors and test failures.
 * 
 * CORE PRINCIPLES:
 * 1. SIMULTANEOUS VALIDATION: Run build and tests in parallel for efficiency
 * 2. STATE CAPTURE: Record system state before and after for full analysis
 * 3. FAILURE CORRELATION: Identify patterns between build and test errors
 * 4. COMPLETE REPORTING: Create detailed reports for each validation run
 * 5. ZERO TOLERANCE: Fail on ANY issue to ensure zero technical debt
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// CONFIGURATION
const TIMESTAMP = new Date().toISOString().replace(/:/g, '-');
const rootDir = path.resolve(__dirname, '..');
const reportDir = path.join(rootDir, 'validation-reports');
const buildLogFile = path.join(reportDir, `build-log-${TIMESTAMP}.txt`);
const testLogFile = path.join(reportDir, `test-log-${TIMESTAMP}.txt`);
const correlationReportFile = path.join(reportDir, `correlation-report-${TIMESTAMP}.md`);
const summaryFile = path.join(reportDir, `validation-summary-${TIMESTAMP}.md`);
const stateSnapshotDir = path.join(reportDir, `state-snapshot-${TIMESTAMP}`);

// Create directories if they don't exist
[reportDir, stateSnapshotDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// CLI OPTIONS
const options = {
  captureState: process.argv.includes('--capture-state'),
  correlateErrors: process.argv.includes('--correlate-errors') || true,
  buildOnly: process.argv.includes('--build-only'),
  testOnly: process.argv.includes('--test-only'),
  failFast: process.argv.includes('--fail-fast') || true,
  buildCommand: process.argv.find(arg => arg.startsWith('--build-command='))?.split('=')[1] || 'npm run build',
  testCommand: process.argv.find(arg => arg.startsWith('--test-command='))?.split('=')[1] || 'npm run test:once'
};

/**
 * Captures the current state of the codebase for analysis
 */
function captureSystemState() {
  console.log('📸 Capturing system state...');
  
  // Record package.json content
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
    fs.writeFileSync(path.join(stateSnapshotDir, 'package.json'), packageJson);
  }
  
  // Record current git status
  const gitStatusProcess = spawn('git', ['status'], { cwd: rootDir });
  const gitStatusOutput = [];
  
  gitStatusProcess.stdout.on('data', (data) => {
    gitStatusOutput.push(data.toString());
  });
  
  gitStatusProcess.on('close', () => {
    fs.writeFileSync(path.join(stateSnapshotDir, 'git-status.txt'), gitStatusOutput.join(''));
  });
  
  // Record list of modified files
  const gitLsFilesProcess = spawn('git', ['ls-files', '--modified'], { cwd: rootDir });
  const gitLsFilesOutput = [];
  
  gitLsFilesProcess.stdout.on('data', (data) => {
    gitLsFilesOutput.push(data.toString());
  });
  
  gitLsFilesProcess.on('close', () => {
    fs.writeFileSync(path.join(stateSnapshotDir, 'modified-files.txt'), gitLsFilesOutput.join(''));
  });
  
  console.log('✅ System state captured');
}

/**
 * Runs a command and captures its output
 */
function runCommand(command, args, logFile) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Running: ${command} ${args.join(' ')}`);
    
    const startTime = Date.now();
    const process = spawn(command, args, { cwd: rootDir });
    
    const logStream = fs.createWriteStream(logFile);
    logStream.write(`Command: ${command} ${args.join(' ')}\n`);
    logStream.write(`Started: ${new Date().toISOString()}\n\n`);
    
    let output = '';
    
    process.stdout.on('data', (data) => {
      const dataStr = data.toString();
      output += dataStr;
      logStream.write(dataStr);
      console.log(dataStr);
    });
    
    process.stderr.on('data', (data) => {
      const dataStr = data.toString();
      output += dataStr;
      logStream.write(`[ERROR] ${dataStr}`);
      console.error(dataStr);
    });
    
    process.on('close', (code) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      logStream.write(`\nExited with code: ${code}\n`);
      logStream.write(`Duration: ${duration}ms\n`);
      logStream.end();
      
      if (code === 0) {
        resolve({
          success: true,
          output,
          duration,
          command: `${command} ${args.join(' ')}`
        });
      } else {
        resolve({
          success: false,
          output,
          duration,
          exitCode: code,
          command: `${command} ${args.join(' ')}`
        });
      }
    });
    
    process.on('error', (err) => {
      logStream.write(`\nProcess error: ${err.message}\n`);
      logStream.end();
      
      resolve({
        success: false,
        error: err.message,
        command: `${command} ${args.join(' ')}`
      });
    });
  });
}

/**
 * Correlates build errors with test failures
 */
function correlateErrors(buildResult, testResult) {
  console.log('🔍 Correlating errors between build and test processes...');
  
  const correlations = [];
  
  // No correlation needed if both succeeded
  if (buildResult.success && testResult.success) {
    return [];
  }
  
  // Extract error patterns from build output
  const buildErrors = [];
  if (!buildResult.success) {
    // Common build error patterns
    const errorPatterns = [
      /ERROR in (.*?)\((\d+),(\d+)\):/g,
      /Module not found: Error: Can't resolve '(.*)' in/g,
      /Cannot find module '(.*)'/g,
      /Syntax error: (.*) \((\d+):(\d+)\)/g,
      /Error: (.*) is not defined/g
    ];
    
    for (const pattern of errorPatterns) {
      let match;
      while ((match = pattern.exec(buildResult.output)) !== null) {
        buildErrors.push({
          type: pattern.toString().match(/\/(.+?)\/g/)[0],
          match: match[0],
          details: match.slice(1)
        });
      }
    }
  }
  
  // Extract failures from test output
  const testFailures = [];
  if (!testResult.success) {
    // Common test failure patterns
    const failurePatterns = [
      /FAIL\s+(.*?)(\(\d+ms\))?$/gm,
      /● (.*?) › (.*?)$/gm,
      /TypeError: (.*)/g,
      /ReferenceError: (.*) is not defined/g
    ];
    
    for (const pattern of failurePatterns) {
      let match;
      while ((match = pattern.exec(testResult.output)) !== null) {
        testFailures.push({
          type: pattern.toString().match(/\/(.+?)\/g/)[0],
          match: match[0],
          details: match.slice(1)
        });
      }
    }
  }
  
  // Find correlations between build errors and test failures
  for (const buildError of buildErrors) {
    for (const testFailure of testFailures) {
      // Look for common terms
      const buildErrorText = buildError.match.toLowerCase();
      const testFailureText = testFailure.match.toLowerCase();
      
      // Check for common component/module names
      const buildErrorModules = buildErrorText.match(/['"]([^'"]+)['"]/g) || [];
      const testFailureModules = testFailureText.match(/['"]([^'"]+)['"]/g) || [];
      
      const commonModules = buildErrorModules.filter(module => 
        testFailureModules.some(testModule => testModule === module)
      );
      
      if (commonModules.length > 0) {
        correlations.push({
          type: 'module-reference',
          buildError: buildError.match,
          testFailure: testFailure.match,
          commonModules
        });
        continue;
      }
      
      // Check for common line/component references
      const buildErrorLines = buildErrorText.match(/\((\d+),(\d+)\)/) || [];
      const testFailureComponents = testFailureText.match(/<([A-Z]\w+)/) || [];
      
      if (buildErrorLines.length > 0 && testFailureComponents.length > 0) {
        // Find if component is mentioned in build error
        if (buildErrorText.includes(testFailureComponents[1].toLowerCase())) {
          correlations.push({
            type: 'component-error',
            buildError: buildError.match,
            testFailure: testFailure.match,
            component: testFailureComponents[1]
          });
        }
      }
    }
  }
  
  // Generate correlation report
  let report = `# Build and Test Error Correlation Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Build: ${buildResult.success ? '✅ Passed' : '❌ Failed'}\n`;
  report += `- Tests: ${testResult.success ? '✅ Passed' : '❌ Failed'}\n`;
  report += `- Build Duration: ${buildResult.duration}ms\n`;
  report += `- Test Duration: ${testResult.duration}ms\n`;
  report += `- Correlations Found: ${correlations.length}\n\n`;
  
  if (correlations.length > 0) {
    report += `## Detected Correlations\n\n`;
    
    for (let i = 0; i < correlations.length; i++) {
      const correlation = correlations[i];
      report += `### Correlation ${i + 1}: ${correlation.type}\n\n`;
      report += `- **Build Error**: ${correlation.buildError}\n`;
      report += `- **Test Failure**: ${correlation.testFailure}\n`;
      
      if (correlation.commonModules) {
        report += `- **Common Modules**: ${correlation.commonModules.join(', ')}\n`;
      }
      
      if (correlation.component) {
        report += `- **Component Involved**: ${correlation.component}\n`;
      }
      
      report += `\n`;
    }
  }
  
  if (buildErrors.length > 0) {
    report += `## All Build Errors (${buildErrors.length})\n\n`;
    buildErrors.forEach((error, index) => {
      report += `${index + 1}. ${error.match}\n`;
    });
    report += `\n`;
  }
  
  if (testFailures.length > 0) {
    report += `## All Test Failures (${testFailures.length})\n\n`;
    testFailures.forEach((failure, index) => {
      report += `${index + 1}. ${failure.match}\n`;
    });
    report += `\n`;
  }
  
  fs.writeFileSync(correlationReportFile, report);
  console.log(`✅ Correlation report saved to ${correlationReportFile}`);
  
  return correlations;
}

/**
 * Creates a summary report of the validation run
 */
function createSummaryReport(buildResult, testResult, correlations) {
  console.log('📝 Creating validation summary...');
  
  let summary = `# Parallel Validation Summary\n\n`;
  summary += `Run Date: ${new Date().toISOString()}\n\n`;
  
  summary += `## Results\n\n`;
  summary += `| Process | Status | Duration | Exit Code |\n`;
  summary += `|---------|--------|----------|----------|\n`;
  summary += `| Build | ${buildResult.success ? '✅ PASS' : '❌ FAIL'} | ${buildResult.duration}ms | ${buildResult.exitCode || 0} |\n`;
  
  if (!options.buildOnly) {
    summary += `| Tests | ${testResult.success ? '✅ PASS' : '❌ FAIL'} | ${testResult.duration}ms | ${testResult.exitCode || 0} |\n`;
  }
  
  summary += `\n`;
  
  const overallSuccess = (buildResult.success && (options.buildOnly || testResult.success));
  
  summary += `## Overall Status: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}\n\n`;
  
  if (!overallSuccess) {
    summary += `### Failure Analysis\n\n`;
    
    if (!buildResult.success) {
      summary += `#### Build Failures\n\n`;
      summary += `The build process failed with exit code ${buildResult.exitCode}. `;
      summary += `See the full build log at \`${buildLogFile}\` for details.\n\n`;
      
      const buildErrorExcerpt = buildResult.output
        .split('\n')
        .filter(line => line.includes('ERROR'))
        .slice(0, 5)
        .join('\n');
      
      if (buildErrorExcerpt) {
        summary += "```\n" + buildErrorExcerpt + "\n```\n\n";
      }
    }
    
    if (!options.buildOnly && !testResult.success) {
      summary += `#### Test Failures\n\n`;
      summary += `The test process failed with exit code ${testResult.exitCode}. `;
      summary += `See the full test log at \`${testLogFile}\` for details.\n\n`;
      
      const testErrorExcerpt = testResult.output
        .split('\n')
        .filter(line => line.includes('FAIL') || line.includes('● '))
        .slice(0, 5)
        .join('\n');
      
      if (testErrorExcerpt) {
        summary += "```\n" + testErrorExcerpt + "\n```\n\n";
      }
    }
    
    if (correlations && correlations.length > 0) {
      summary += `### Error Correlations\n\n`;
      summary += `${correlations.length} correlations were found between build errors and test failures. `;
      summary += `See the full correlation report at \`${correlationReportFile}\` for details.\n\n`;
      
      summary += `| Build Error | Test Failure | Correlation Type |\n`;
      summary += `|-------------|--------------|------------------|\n`;
      
      correlations.slice(0, 3).forEach(correlation => {
        const buildErrorShort = correlation.buildError.length > 40 
          ? correlation.buildError.substring(0, 40) + '...' 
          : correlation.buildError;
          
        const testFailureShort = correlation.testFailure.length > 40 
          ? correlation.testFailure.substring(0, 40) + '...' 
          : correlation.testFailure;
          
        summary += `| ${buildErrorShort} | ${testFailureShort} | ${correlation.type} |\n`;
      });
      
      summary += `\n`;
    }
  }
  
  summary += `## Next Steps\n\n`;
  
  if (overallSuccess) {
    summary += `✅ All validation checks passed successfully. The code changes maintain quality standards and do not introduce technical debt.\n\n`;
    summary += `Recommended actions:\n`;
    summary += `- Commit the changes\n`;
    summary += `- Run additional verification as needed (e2e tests, performance tests)\n`;
    summary += `- Update documentation to reflect the changes\n`;
  } else {
    summary += `❌ Validation checks failed. The following actions are recommended:\n\n`;
    
    if (!buildResult.success) {
      summary += `1. Address build errors first:\n`;
      summary += `   - Fix syntax errors and type issues\n`;
      summary += `   - Resolve missing dependencies\n`;
      summary += `   - Correct import/export statements\n\n`;
    }
    
    if (!options.buildOnly && !testResult.success) {
      summary += `2. Address test failures:\n`;
      summary += `   - Fix broken component functionality\n`;
      summary += `   - Update tests to match new component behavior\n`;
      summary += `   - Check for missing mock data or services\n\n`;
    }
    
    if (correlations && correlations.length > 0) {
      summary += `3. Focus on components with correlated errors:\n`;
      correlations.slice(0, 3).forEach((correlation, index) => {
        if (correlation.component) {
          summary += `   - ${correlation.component}: Appears in both build and test errors\n`;
        } else if (correlation.commonModules && correlation.commonModules.length > 0) {
          summary += `   - Module '${correlation.commonModules[0]}': Referenced in both contexts\n`;
        }
      });
    }
    
    summary += `\nAfter making fixes, run validation again to verify all issues are resolved.\n`;
  }
  
  fs.writeFileSync(summaryFile, summary);
  console.log(`✅ Validation summary saved to ${summaryFile}`);
  
  return overallSuccess;
}

/**
 * Main function to run build and tests in parallel
 */
async function runParallelValidation() {
  console.log('🚀 Starting parallel validation...');
  
  // Capture system state if requested
  if (options.captureState) {
    captureSystemState();
  }
  
  // Parse build and test commands
  const [buildCmd, ...buildArgs] = options.buildCommand.split(' ');
  const [testCmd, ...testArgs] = options.testCommand.split(' ');
  
  // Run build and test processes in parallel
  const startTime = Date.now();
  
  const buildPromise = !options.testOnly ? runCommand(buildCmd, buildArgs, buildLogFile) : Promise.resolve({ success: true, output: 'Test only mode - build skipped', duration: 0 });
  const testPromise = !options.buildOnly ? runCommand(testCmd, testArgs, testLogFile) : Promise.resolve({ success: true, output: 'Build only mode - tests skipped', duration: 0 });
  
  const [buildResult, testResult] = await Promise.all([buildPromise, testPromise]);
  
  const endTime = Date.now();
  const totalDuration = endTime - startTime;
  
  console.log(`\n⏱️ Total validation time: ${totalDuration}ms`);
  console.log(`📊 Build: ${buildResult.success ? '✅ Passed' : '❌ Failed'} in ${buildResult.duration}ms`);
  
  if (!options.buildOnly) {
    console.log(`🧪 Tests: ${testResult.success ? '✅ Passed' : '❌ Failed'} in ${testResult.duration}ms`);
  }
  
  // Correlate errors if both processes ran and at least one failed
  let correlations = [];
  if (options.correlateErrors && !options.buildOnly && !options.testOnly && (!buildResult.success || !testResult.success)) {
    correlations = correlateErrors(buildResult, testResult);
  }
  
  // Create validation summary
  const overallSuccess = createSummaryReport(buildResult, testResult, correlations);
  
  // Return success or failure
  return overallSuccess;
}

// Run the validation
runParallelValidation()
  .then(success => {
    if (success) {
      console.log('\n✅ Parallel validation completed successfully');
      process.exit(0);
    } else {
      console.error('\n❌ Parallel validation failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n❌ Parallel validation script error:', err);
    process.exit(1);
  });