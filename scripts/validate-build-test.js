/**
 * TAP Integration Platform - Build & Test Validation Script
 * 
 * This script validates that the build and test processes can run successfully
 * and that they are compatible with each other.
 * 
 * Following the Golden Approach methodology for comprehensive validation.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  rootPath: path.join(__dirname, '../../..'),
  outputPath: path.join(__dirname, '../reports'),
  logPath: path.join(__dirname, '../logs'),
  sequence: [
    { name: 'Clean', command: 'npm run clean', optional: true },
    { name: 'Build', command: 'node scripts/enhanced-build.js', required: true },
    { name: 'Test', command: 'node scripts/enhanced-test.js', required: true },
    { name: 'Verify Build', command: 'node scripts/verify-build.js', optional: true },
    { name: 'Verify Tests', command: 'node scripts/verify-tests.js', optional: true }
  ],
  timeouts: {
    default: 600000, // 10 minutes
    clean: 60000, // 1 minute
    build: 600000, // 10 minutes
    test: 600000, // 10 minutes
  }
};

// Ensure output directories exist
ensureDirectoriesExist([config.outputPath, config.logPath]);

// Result storage
const results = {
  startTime: Date.now(),
  endTime: null,
  duration: null,
  steps: {},
  success: false
};

/**
 * Main function to run the validation process
 */
async function main() {
  console.log('TAP Integration Platform - Build & Test Validation');
  console.log('================================================');
  console.log(`Root path: ${config.rootPath}`);
  console.log(`Steps: ${config.sequence.map(s => s.name).join(' → ')}`);
  console.log();

  try {
    // Run validation sequence
    await runValidationSequence();
    
    // Finalize results
    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    results.success = Object.values(results.steps)
      .filter(step => step.required !== false)
      .every(step => step.success);
    
    // Generate report
    generateReport();
    
    // Print summary
    printSummary();
    
    // Exit with appropriate code
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    console.error('Validation process failed:', error);
    results.error = error.message;
    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    
    // Try to generate a report even on failure
    try {
      generateReport();
      printSummary();
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
    
    process.exit(1);
  }
}

/**
 * Run the validation sequence
 */
async function runValidationSequence() {
  console.log('Starting validation sequence...');
  
  // Run each step in sequence
  for (const step of config.sequence) {
    // Check for optional steps
    if (step.optional && !fs.existsSync(path.join(__dirname, step.command.split(' ')[1]))) {
      console.log(`Skipping optional step ${step.name} (script not found)`);
      results.steps[step.name] = {
        name: step.name,
        command: step.command,
        status: 'skipped',
        success: true,
        required: false,
        skipped: true,
        reason: 'Script not found'
      };
      continue;
    }
    
    try {
      // Execute the step
      const stepResult = await executeStep(step);
      
      // Store result
      results.steps[step.name] = {
        ...step,
        ...stepResult
      };
      
      // Stop sequence if a required step fails
      if (!stepResult.success && step.required !== false) {
        console.error(`Required step ${step.name} failed, stopping validation sequence`);
        break;
      }
    } catch (error) {
      console.error(`Error executing step ${step.name}:`, error);
      
      results.steps[step.name] = {
        ...step,
        status: 'error',
        success: false,
        error: error.message,
        endTime: Date.now(),
        duration: Date.now() - results.startTime
      };
      
      // Stop sequence if a required step fails
      if (step.required !== false) {
        console.error(`Required step ${step.name} failed with error, stopping validation sequence`);
        break;
      }
    }
  }
}

/**
 * Execute a single validation step
 */
async function executeStep(step) {
  console.log(`\nExecuting step: ${step.name}`);
  console.log(`Command: ${step.command}`);
  
  const startTime = Date.now();
  const [cmd, ...args] = step.command.split(' ');
  
  const result = {
    name: step.name,
    command: step.command,
    startTime,
    endTime: null,
    duration: null,
    success: false,
    status: 'pending',
    output: '',
    errors: []
  };
  
  return new Promise((resolve, reject) => {
    // Set up process
    const stepProcess = spawn(cmd, args, {
      cwd: path.join(__dirname, '..'),
      shell: true,
      env: { ...process.env, FORCE_COLOR: 'true' }
    });
    
    // Set up timeout
    const timeout = setTimeout(() => {
      stepProcess.kill();
      result.status = 'timeout';
      result.errors.push(`Step timed out after ${(getStepTimeout(step) / 1000)} seconds`);
      reject(new Error(`Step ${step.name} timed out`));
    }, getStepTimeout(step));
    
    // Collect output
    stepProcess.stdout.on('data', (data) => {
      const output = data.toString();
      result.output += output;
      
      // Forward to console
      process.stdout.write(`[${step.name}] ${output}`);
    });
    
    stepProcess.stderr.on('data', (data) => {
      const output = data.toString();
      result.output += output;
      result.errors.push(output.trim());
      
      // Forward to console
      process.stderr.write(`[${step.name}] ${output}`);
    });
    
    // Handle completion
    stepProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      result.endTime = Date.now();
      result.duration = result.endTime - result.startTime;
      result.exitCode = code;
      result.success = code === 0;
      result.status = result.success ? 'success' : 'failed';
      
      console.log(`Step ${step.name} ${result.success ? 'succeeded' : 'failed'} with code ${code} in ${result.duration / 1000}s`);
      
      // Save logs
      const logFile = path.join(
        config.logPath,
        `validation-${step.name}-${new Date().toISOString().replace(/:/g, '-')}.log`
      );
      
      fs.writeFileSync(logFile, result.output);
      
      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(`Step ${step.name} failed with exit code ${code}`));
      }
    });
    
    // Handle process errors
    stepProcess.on('error', (error) => {
      clearTimeout(timeout);
      
      result.endTime = Date.now();
      result.duration = result.endTime - result.startTime;
      result.status = 'error';
      result.errors.push(error.message);
      
      reject(error);
    });
  });
}

/**
 * Get timeout for a step
 */
function getStepTimeout(step) {
  const stepName = step.name.toLowerCase();
  
  if (config.timeouts[stepName]) {
    return config.timeouts[stepName];
  }
  
  return config.timeouts.default;
}

/**
 * Generate a comprehensive validation report
 */
function generateReport() {
  console.log('\nGenerating validation report...');
  
  const reportFile = path.join(
    config.outputPath,
    `validation-report-${new Date().toISOString().replace(/:/g, '-')}.json`
  );
  
  // Create report object
  const report = {
    timestamp: new Date().toISOString(),
    duration: results.duration,
    success: results.success,
    steps: results.steps,
    error: results.error,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuCores: require('os').cpus().length
    }
  };
  
  // Write the report
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`Validation report saved to ${reportFile}`);
  
  // Generate a markdown summary
  const summaryFile = path.join(
    config.outputPath,
    `validation-summary-${new Date().toISOString().replace(/:/g, '-')}.md`
  );
  
  const summaryContent = [
    '# TAP Integration Platform Build & Test Validation Summary',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '## Overview',
    '',
    `- Status: ${report.success ? '✅ Success' : '❌ Failure'}`,
    `- Duration: ${(report.duration / 1000).toFixed(2)}s`,
    '',
    '## Step Results',
    '',
    ...Object.entries(report.steps).map(([name, details]) => {
      return [
        `### ${name}`,
        '',
        `- Status: ${details.status}`,
        `- Required: ${details.required !== false ? 'Yes' : 'No'}`,
        `- Duration: ${details.duration ? (details.duration / 1000).toFixed(2) + 's' : 'N/A'}`,
        `- Exit Code: ${details.exitCode !== undefined ? details.exitCode : 'N/A'}`,
        '',
        details.errors?.length > 0 ? [
          '#### Errors:',
          '',
          ...details.errors.slice(0, 5).map(err => `- ${err.split('\n')[0]}`),
          details.errors.length > 5 ? `- ... and ${details.errors.length - 5} more errors` : '',
          ''
        ].join('\n') : '',
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
      '- Deploy to integration environment',
      '- Update documentation',
      '- Consider adding more comprehensive tests'
    ].join('\n') : [
      '- Fix failures (see logs)',
      '- Review dependencies if needed',
      '- Retry validation process'
    ].join('\n')
  ].join('\n');
  
  fs.writeFileSync(summaryFile, summaryContent);
  console.log(`Validation summary saved to ${summaryFile}`);
}

/**
 * Print a summary of the validation process to the console
 */
function printSummary() {
  const duration = (results.duration / 1000).toFixed(2);
  
  console.log('\n================================================');
  console.log(`Validation ${results.success ? 'SUCCESS' : 'FAILED'}`);
  console.log('================================================');
  console.log(`Total time: ${duration}s`);
  console.log('');
  console.log('Step Results:');
  
  Object.entries(results.steps).forEach(([name, details]) => {
    const stepDuration = details.duration ? (details.duration / 1000).toFixed(2) + 's' : 'N/A';
    const statusSymbol = details.success ? '✅' : details.skipped ? '⏭️' : '❌';
    console.log(`  ${statusSymbol} ${name}: ${details.status} (${stepDuration})`);
  });
  
  console.log('================================================');
  
  if (results.success) {
    console.log('✅ Build and test processes are compatible and working correctly!');
  } else {
    console.log('❌ Build and test validation failed. See logs for details.');
    
    const failedSteps = Object.entries(results.steps)
      .filter(([_, details]) => !details.success && !details.skipped)
      .map(([name, _]) => name);
    
    if (failedSteps.length > 0) {
      console.log(`Failed steps: ${failedSteps.join(', ')}`);
    }
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