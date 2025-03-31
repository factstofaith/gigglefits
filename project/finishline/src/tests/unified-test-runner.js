#!/usr/bin/env node

/**
 * Unified Test Runner CLI
 * 
 * Command-line interface for running all test types with a unified API.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load configuration
const runnerConfig = require('./config/test-runner.config.js');
const adapterConfig = require('./config/test-adapters.config.js');

// Parse command line arguments
const args = process.argv.slice(2);
const testTypes = args.filter(arg => !arg.startsWith('--'));
const options = args
  .filter(arg => arg.startsWith('--'))
  .reduce((opts, arg) => {
    const [key, value] = arg.replace('--', '').split('=');
    opts[key] = value || true;
    return opts;
  }, {});

// Determine which test types to run
const typesToRun = testTypes.length > 0 
  ? testTypes 
  : Object.keys(runnerConfig.testTypes);

console.log(`Running tests: ${typesToRun.join(', ')}`);

// Run tests for each type
const results = {};

typesToRun.forEach(type => {
  if (!runnerConfig.testTypes[type]) {
    console.error(`Unknown test type: ${type}`);
    return;
  }
  
  const testConfig = runnerConfig.testTypes[type];
  const adapterName = testConfig.runner;
  const adapter = adapterConfig[adapterName];
  
  if (!adapter) {
    console.error(`Unknown adapter: ${adapterName}`);
    return;
  }
  
  console.log(`\nRunning ${type} tests with ${adapterName} adapter...`);
  
  try {
    // Prepare environment variables
    const env = { ...process.env, ...adapter.environmentSetup };
    
    // Construct command
    let command = adapter.command;
    
    if (adapter.args) {
      command += ` ${adapter.args.join(' ')}`;
    }
    
    if (adapter.configFile) {
      command += ` --config ${adapter.configFile}`;
    }
    
    if (options.verbose) {
      console.log(`Executing: ${command}`);
    }
    
    // Execute command
    const output = execSync(command, { 
      env,
      stdio: options.silent ? 'pipe' : 'inherit'
    }).toString();
    
    // Process results
    if (adapter.resultParser && fs.existsSync(adapter.resultParser)) {
      const parser = require(adapter.resultParser);
      results[type] = parser(output);
    } else {
      results[type] = { success: true, message: 'Tests completed, but no parser available for results.' };
    }
    
    console.log(`✅ ${type} tests completed successfully`);
  } catch (error) {
    console.error(`❌ ${type} tests failed`);
    console.error(error.message);
    
    results[type] = { 
      success: false, 
      error: error.message,
      exitCode: error.status || 1
    };
    
    if (options.failFast || runnerConfig.ci.failFast) {
      console.error('Stopping tests due to failure.');
      process.exit(1);
    }
  }
});

// Generate report
if (options.report || options.generateReport) {
  console.log('\nGenerating test report...');
  
  // Ensure output directory exists
  const outputDir = path.resolve(runnerConfig.results.outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate timestamp
  const timestamp = new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/..+/, '')
    .replace('T', '_');
  
  // Write JSON report
  const jsonReport = path.resolve(outputDir, `test-results-${timestamp}.json`);
  fs.writeFileSync(jsonReport, JSON.stringify(results, null, 2));
  
  console.log(`Written JSON report to ${jsonReport}`);
  
  // TODO: Implement HTML and text report generation
}

// Summary
console.log('\nTest Summary:');
Object.keys(results).forEach(type => {
  const result = results[type];
  const icon = result.success ? '✅' : '❌';
  console.log(`${icon} ${type}: ${result.success ? 'Passed' : 'Failed'}`);
});

// Exit with appropriate code
const anyFailures = Object.values(results).some(result => !result.success);
process.exit(anyFailures ? 1 : 0);
