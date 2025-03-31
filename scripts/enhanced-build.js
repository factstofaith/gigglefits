/**
 * TAP Integration Platform - Enhanced Build Script
 * 
 * This script provides a robust build process that handles errors gracefully,
 * collects detailed metrics, and generates comprehensive reports.
 * 
 * Following the Golden Approach methodology for thorough implementation.
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
  buildCommands: {
    frontend: 'npm run build',
    backend: 'npm run build'
  },
  timeouts: {
    frontend: 300000, // 5 minutes
    backend: 180000   // 3 minutes
  },
  retries: {
    enabled: true,
    maxRetries: 1,
    retryableErrors: [
      'ENOENT',
      'ETIMEDOUT',
      'ECONNRESET'
    ]
  },
  verification: {
    validateArtifacts: true,
    failOnWarnings: false
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
    total: 0
  }
};

/**
 * Main function to run the build process
 */
async function main() {
  console.log('TAP Integration Platform - Enhanced Build');
  console.log('=========================================');
  console.log(`Root path: ${config.rootPath}`);
  console.log(`Components: ${config.components.join(', ')}`);
  console.log();

  try {
    // Build all components
    await buildAllComponents();
    
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
    console.error('Build process failed:', error);
    process.exit(1);
  }
}

/**
 * Build all components sequentially
 */
async function buildAllComponents() {
  console.log('Starting build process...');
  
  // Initialize metrics
  metrics.summary.total = config.components.length;
  
  // Build each component
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
      
      // Build the component
      const result = await buildComponent(component, componentPath);
      
      // Update metrics
      metrics.components[component] = result;
      
      if (result.success) {
        metrics.summary.successful++;
      } else {
        metrics.summary.failed++;
      }
    } catch (error) {
      console.error(`Error building ${component}:`, error);
      metrics.components[component] = {
        status: 'error',
        error: error.message,
        stack: error.stack
      };
      metrics.summary.failed++;
    }
  }
}

/**
 * Build a single component
 */
async function buildComponent(component, componentPath) {
  console.log(`\nBuilding ${component}...`);
  
  const startTime = Date.now();
  const buildCommand = config.buildCommands[component];
  const [cmd, ...args] = buildCommand.split(' ');
  
  const result = {
    component,
    command: buildCommand,
    startTime,
    endTime: null,
    duration: null,
    success: false,
    status: 'pending',
    output: '',
    errors: [],
    warnings: [],
    retries: 0
  };
  
  // Build function with retry logic
  const executeBuild = async (retry = 0) => {
    result.retries = retry;
    
    return new Promise((resolve, reject) => {
      console.log(`Executing: ${buildCommand} (in ${componentPath})`);
      
      // Spawn the build process
      const buildProcess = spawn(cmd, args, {
        cwd: componentPath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: 'true' }
      });
      
      // Set up timeout
      const timeout = setTimeout(() => {
        buildProcess.kill();
        result.status = 'timeout';
        result.errors.push(`Build timed out after ${config.timeouts[component] / 1000} seconds`);
        reject(new Error(`Build timed out for ${component}`));
      }, config.timeouts[component]);
      
      // Collect output
      buildProcess.stdout.on('data', (data) => {
        const output = data.toString();
        result.output += output;
        
        // Check for warnings
        if (output.includes('warning') || output.includes('WARN')) {
          result.warnings.push(output.trim());
        }
        
        // Forward to console
        process.stdout.write(`[${component}] ${output}`);
      });
      
      buildProcess.stderr.on('data', (data) => {
        const output = data.toString();
        result.output += output;
        result.errors.push(output.trim());
        
        // Forward to console
        process.stderr.write(`[${component}] ${output}`);
      });
      
      // Handle completion
      buildProcess.on('close', (code) => {
        clearTimeout(timeout);
        
        result.endTime = Date.now();
        result.duration = result.endTime - result.startTime;
        result.exitCode = code;
        result.success = code === 0;
        result.status = result.success ? 'success' : 'failed';
        
        console.log(`${component} build ${result.success ? 'succeeded' : 'failed'} with code ${code} in ${result.duration / 1000}s`);
        
        // Save logs
        const logFile = path.join(
          config.logPath,
          `build-${component}-${new Date().toISOString().replace(/:/g, '-')}.log`
        );
        
        fs.writeFileSync(logFile, result.output);
        
        if (result.success) {
          resolve(result);
        } else {
          // Check if we should retry
          if (retry < config.retries.maxRetries && config.retries.enabled) {
            console.log(`Retrying ${component} build (retry ${retry + 1}/${config.retries.maxRetries})...`);
            executeBuild(retry + 1).then(resolve).catch(reject);
          } else {
            reject(new Error(`Build failed for ${component} with exit code ${code}`));
          }
        }
      });
      
      // Handle process errors
      buildProcess.on('error', (error) => {
        clearTimeout(timeout);
        
        result.endTime = Date.now();
        result.duration = result.endTime - result.startTime;
        result.status = 'error';
        result.errors.push(error.message);
        
        // Check if we should retry
        const isRetryableError = config.retries.retryableErrors.includes(error.code);
        
        if (retry < config.retries.maxRetries && config.retries.enabled && isRetryableError) {
          console.log(`Retrying ${component} build after error: ${error.message} (retry ${retry + 1}/${config.retries.maxRetries})...`);
          executeBuild(retry + 1).then(resolve).catch(reject);
        } else {
          reject(error);
        }
      });
    });
  };
  
  try {
    // Execute build with retry logic
    const buildResult = await executeBuild();
    
    // Verify build artifacts if configured
    if (config.verification.validateArtifacts) {
      const verificationResult = verifyBuildArtifacts(component, componentPath);
      
      if (!verificationResult.success) {
        buildResult.status = 'verification-failed';
        buildResult.success = false;
        buildResult.errors.push(...verificationResult.issues.map(issue => `Verification: ${issue}`));
      }
    }
    
    // Check if we should fail on warnings
    if (config.verification.failOnWarnings && buildResult.warnings.length > 0) {
      buildResult.status = 'warnings';
      buildResult.success = false;
    }
    
    return buildResult;
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
 * Verify build artifacts for a component
 */
function verifyBuildArtifacts(component, componentPath) {
  console.log(`Verifying ${component} build artifacts...`);
  
  // Define verification criteria for components
  const criteria = {
    frontend: [
      { path: 'build/index.html', required: true },
      { path: 'build/static/js', required: true, minFiles: 1 },
      { path: 'build/static/css', required: true, minFiles: 1 }
    ],
    backend: [
      // Add backend verification criteria
    ]
  };
  
  // Skip if no criteria defined
  if (!criteria[component]) {
    return { success: true, issues: [] };
  }
  
  const result = {
    success: true,
    issues: []
  };
  
  // Check each criterion
  for (const criterion of criteria[component]) {
    const fullPath = path.join(componentPath, criterion.path);
    
    // Check existence
    const exists = fs.existsSync(fullPath);
    
    if (criterion.required && !exists) {
      result.success = false;
      result.issues.push(`Required artifact missing: ${criterion.path}`);
      continue;
    }
    
    // Check directory contents
    if (exists && criterion.minFiles && fs.statSync(fullPath).isDirectory()) {
      const files = fs.readdirSync(fullPath);
      
      if (files.length < criterion.minFiles) {
        result.success = false;
        result.issues.push(`${criterion.path} has fewer than ${criterion.minFiles} files (found ${files.length})`);
      }
    }
  }
  
  if (result.success) {
    console.log(`✅ ${component} build artifacts verified successfully`);
  } else {
    console.error(`❌ ${component} build verification failed:`);
    result.issues.forEach(issue => console.error(`  - ${issue}`));
  }
  
  return result;
}

/**
 * Generate a comprehensive build report
 */
function generateReport() {
  console.log('\nGenerating build report...');
  
  const reportFile = path.join(
    config.outputPath,
    `build-report-${new Date().toISOString().replace(/:/g, '-')}.json`
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
  console.log(`Build report saved to ${reportFile}`);
  
  // Generate a markdown summary
  const summaryFile = path.join(
    config.outputPath,
    `build-summary-${new Date().toISOString().replace(/:/g, '-')}.md`
  );
  
  const summaryContent = [
    '# TAP Integration Platform Build Summary',
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
      '- Run tests to verify functionality',
      '- Deploy to integration environment',
      '- Update documentation'
    ].join('\n') : [
      '- Fix build failures (see logs)',
      '- Run dependency resolver if needed',
      '- Retry build process'
    ].join('\n')
  ].join('\n');
  
  fs.writeFileSync(summaryFile, summaryContent);
  console.log(`Build summary saved to ${summaryFile}`);
}

/**
 * Print a summary of the build process to the console
 */
function printSummary() {
  const duration = (metrics.summary.totalDuration / 1000).toFixed(2);
  const success = metrics.summary.failed === 0;
  
  console.log('\n=========================================');
  console.log(`Build ${success ? 'SUCCESS' : 'FAILED'}`);
  console.log('=========================================');
  console.log(`Total time: ${duration}s`);
  console.log(`Components: ${metrics.summary.total}`);
  console.log(`Successful: ${metrics.summary.successful}`);
  console.log(`Failed: ${metrics.summary.failed}`);
  console.log('=========================================');
  
  if (success) {
    console.log('✅ All components built successfully');
  } else {
    console.log('❌ Some components failed to build:');
    
    Object.entries(metrics.components)
      .filter(([_, details]) => !details.success)
      .forEach(([name, details]) => {
        console.log(`  - ${name}: ${details.status}`);
        
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