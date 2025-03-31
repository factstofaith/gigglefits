#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * 
 * Runs all tests across the codebase and generates a detailed report
 * of any failures. Used to achieve zero test failures across all components.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Test types to run
const testTypes = [
  {
    name: 'unit',
    command: 'npx jest',
    args: ['--config', 'jest.config.js', '--json', '--outputFile=unit-results.json'],
    resultFile: 'unit-results.json',
    directory: '../',
    parser: parseJestResults
  },
  {
    name: 'component',
    command: 'npx jest',
    args: ['--testMatch=**/components/**/*.test.{js,jsx}', '--json', '--outputFile=component-results.json'],
    resultFile: 'component-results.json',
    directory: '../',
    parser: parseJestResults
  },
  {
    name: 'visual',
    command: 'npx jest',
    args: ['--testMatch=**/*.visual.{js,jsx}', '--json', '--outputFile=visual-results.json'],
    resultFile: 'visual-results.json',
    directory: '../',
    parser: parseJestResults
  },
  {
    name: 'build',
    command: 'node',
    args: ['verify-build.js', '--output-json=build-results.json'],
    resultFile: 'build-results.json',
    directory: './',
    parser: parseBuildResults
  }
];

/**
 * Parse Jest results
 */
function parseJestResults(results) {
  try {
    const data = JSON.parse(results);
    
    const failedTests = data.testResults
      .filter(result => result.status === 'failed')
      .map(result => ({
        file: result.name,
        failures: result.assertionResults
          .filter(assertion => assertion.status === 'failed')
          .map(assertion => ({
            title: assertion.title,
            fullName: assertion.fullName || assertion.ancestorTitles.concat(assertion.title).join(' > '),
            error: assertion.failureMessages && assertion.failureMessages.length > 0 
              ? assertion.failureMessages[0] 
              : 'Unknown error'
          }))
      }));
    
    return {
      success: data.success,
      numPassedTests: data.numPassedTests,
      numFailedTests: data.numFailedTests,
      numTotalTests: data.numTotalTests,
      failedTests
    };
  } catch (error) {
    console.error('Error parsing Jest results:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Parse build verification results
 */
function parseBuildResults(results) {
  try {
    const data = JSON.parse(results);
    
    const buildFailures = [];
    
    if (data.builds) {
      Object.entries(data.builds).forEach(([type, build]) => {
        if (!build.success) {
          buildFailures.push({
            type,
            errors: build.errors || ['Unknown build error']
          });
        }
      });
    }
    
    return {
      success: data.success,
      duration: data.duration,
      buildFailures
    };
  } catch (error) {
    console.error('Error parsing build results:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Run a test command with proper error handling
 */
async function runTestCommand(testType) {
  return new Promise((resolve, reject) => {
    console.log(`\nRunning ${testType.name} tests...`);
    
    try {
      // Prepare the output directory
      const outputDir = path.resolve(__dirname, '../test-results');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Change to the correct directory
      process.chdir(path.resolve(__dirname, testType.directory));
      
      // Run the command
      const proc = spawn(testType.command, testType.args, {
        stdio: ['inherit', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      proc.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
      });
      
      proc.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });
      
      proc.on('close', (code) => {
        console.log(`${testType.name} tests completed with exit code ${code}`);
        
        // Try to read the results file
        const resultFilePath = path.resolve(process.cwd(), testType.resultFile);
        
        if (fs.existsSync(resultFilePath)) {
          try {
            const results = fs.readFileSync(resultFilePath, 'utf8');
            
            // Save to output directory
            const outputPath = path.resolve(outputDir, `${testType.name}-results.json`);
            fs.writeFileSync(outputPath, results);
            
            // Parse results
            const parsedResults = testType.parser(results);
            
            // Clean up result file
            fs.unlinkSync(resultFilePath);
            
            resolve({
              type: testType.name,
              exitCode: code,
              success: code === 0,
              results: parsedResults
            });
          } catch (error) {
            console.error(`Error reading results file for ${testType.name} tests:`, error.message);
            resolve({
              type: testType.name,
              exitCode: code,
              success: false,
              error: error.message,
              stdout,
              stderr
            });
          }
        } else {
          console.warn(`Results file not found for ${testType.name} tests`);
          resolve({
            type: testType.name,
            exitCode: code,
            success: code === 0,
            stdout,
            stderr
          });
        }
      });
      
      proc.on('error', (error) => {
        console.error(`Error running ${testType.name} tests:`, error.message);
        reject(error);
      });
    } catch (error) {
      console.error(`Error setting up ${testType.name} tests:`, error.message);
      reject(error);
    }
  });
}

/**
 * Generate HTML test report
 */
function generateHTMLReport(results) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const outputDir = path.resolve(__dirname, '../test-results');
  const outputPath = path.resolve(outputDir, `comprehensive-test-report-${timestamp}.html`);
  
  // Calculate summary stats
  const totalTests = results.reduce((sum, result) => {
    if (result.results && result.results.numTotalTests) {
      return sum + result.results.numTotalTests;
    }
    return sum;
  }, 0);
  
  const passedTests = results.reduce((sum, result) => {
    if (result.results && result.results.numPassedTests) {
      return sum + result.results.numPassedTests;
    }
    return sum;
  }, 0);
  
  const failedTests = results.reduce((sum, result) => {
    if (result.results && result.results.numFailedTests) {
      return sum + result.results.numFailedTests;
    }
    return sum;
  }, 0);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comprehensive Test Report - ${timestamp}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif;
      line-height: 1.5;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #0066cc;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    .timestamp {
      color: #666;
      font-size: 14px;
    }
    .summary {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-box {
      flex: 1;
      background: #f5f7fa;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-box h2 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 18px;
    }
    .summary-stat {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }
    .pass {
      color: #2ecc71;
    }
    .fail {
      color: #e74c3c;
    }
    .neutral {
      color: #3498db;
    }
    .test-type {
      margin-bottom: 30px;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }
    .test-type-header {
      background: #f5f7fa;
      padding: 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .test-type-header h2 {
      margin: 0;
      font-size: 18px;
    }
    .test-type-content {
      padding: 15px;
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 14px;
    }
    .status-pass {
      background: #d5f5e3;
      color: #27ae60;
    }
    .status-fail {
      background: #fadbd8;
      color: #c0392b;
    }
    .failed-test {
      margin-bottom: 20px;
      padding: 15px;
      background: #fff;
      border: 1px solid #fadbd8;
      border-radius: 4px;
    }
    .failed-test h4 {
      margin: 0 0 10px 0;
      color: #c0392b;
    }
    .error-message {
      font-family: monospace;
      white-space: pre-wrap;
      background: #f9f9f9;
      padding: 10px;
      border-radius: 4px;
      border-left: 3px solid #e74c3c;
      max-height: 200px;
      overflow: auto;
      font-size: 12px;
    }
    .buildFailure {
      margin-bottom: 20px;
      padding: 15px;
      background: #fff;
      border: 1px solid #fadbd8;
      border-radius: 4px;
    }
    .no-failures {
      color: #27ae60;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Comprehensive Test Report</h1>
    <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
  </div>
  
  <div class="summary">
    <div class="summary-box">
      <h2>Total Tests</h2>
      <div class="summary-stat neutral">${totalTests}</div>
    </div>
    <div class="summary-box">
      <h2>Passed Tests</h2>
      <div class="summary-stat pass">${passedTests}</div>
    </div>
    <div class="summary-box">
      <h2>Failed Tests</h2>
      <div class="summary-stat fail">${failedTests}</div>
    </div>
    <div class="summary-box">
      <h2>Success Rate</h2>
      <div class="summary-stat ${passedTests / totalTests >= 0.9 ? 'pass' : 'fail'}">${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%</div>
    </div>
  </div>
  
  ${results.map(result => `
    <div class="test-type">
      <div class="test-type-header">
        <h2>${result.type} Tests</h2>
        <div class="status ${result.success ? 'status-pass' : 'status-fail'}">${result.success ? 'PASSED' : 'FAILED'}</div>
      </div>
      <div class="test-type-content">
        ${result.type === 'build' ? 
          result.success ? 
            `<p class="no-failures">All builds completed successfully!</p>` :
            `<h3>Build Failures</h3>
            ${result.results && result.results.buildFailures ? 
              result.results.buildFailures.map(failure => `
                <div class="buildFailure">
                  <h4>Build Type: ${failure.type}</h4>
                  <div class="error-message">${failure.errors.join('\n')}</div>
                </div>
              `).join('') : 
              '<p>No specific build failure details available.</p>'
            }`
          :
          result.results && result.results.failedTests && result.results.failedTests.length > 0 ?
            `<h3>Failed Tests</h3>
            ${result.results.failedTests.map(file => `
              <h4>File: ${file.file}</h4>
              ${file.failures.map(failure => `
                <div class="failed-test">
                  <h4>${failure.fullName || failure.title}</h4>
                  <div class="error-message">${failure.error}</div>
                </div>
              `).join('')}
            `).join('')}` :
            (result.success ? 
              `<p class="no-failures">No test failures!</p>` : 
              `<p>No specific test failure details available.</p>
               ${result.error ? `<div class="error-message">${result.error}</div>` : ''}
               ${result.stderr ? `<div class="error-message">${result.stderr}</div>` : ''}
              `
            )
        }
      </div>
    </div>
  `).join('')}
  
  <div style="margin-top: 40px; color: #666; font-size: 12px; text-align: center;">
    Generated by Comprehensive Test Runner
  </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
  console.log(`\nHTML report generated: ${outputPath}`);
  return outputPath;
}

/**
 * Generate Markdown test report
 */
function generateMarkdownReport(results) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const outputDir = path.resolve(__dirname, '../test-results');
  const outputPath = path.resolve(outputDir, `comprehensive-test-report-${timestamp}.md`);
  
  // Calculate summary stats
  const totalTests = results.reduce((sum, result) => {
    if (result.results && result.results.numTotalTests) {
      return sum + result.results.numTotalTests;
    }
    return sum;
  }, 0);
  
  const passedTests = results.reduce((sum, result) => {
    if (result.results && result.results.numPassedTests) {
      return sum + result.results.numPassedTests;
    }
    return sum;
  }, 0);
  
  const failedTests = results.reduce((sum, result) => {
    if (result.results && result.results.numFailedTests) {
      return sum + result.results.numFailedTests;
    }
    return sum;
  }, 0);
  
  let markdown = `# Comprehensive Test Report\n\n`;
  markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Total Tests**: ${totalTests}\n`;
  markdown += `- **Passed Tests**: ${passedTests}\n`;
  markdown += `- **Failed Tests**: ${failedTests}\n`;
  markdown += `- **Success Rate**: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%\n\n`;
  
  results.forEach(result => {
    markdown += `## ${result.type} Tests\n\n`;
    markdown += `Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    if (result.type === 'build') {
      if (result.success) {
        markdown += `All builds completed successfully!\n\n`;
      } else {
        markdown += `### Build Failures\n\n`;
        
        if (result.results && result.results.buildFailures) {
          result.results.buildFailures.forEach(failure => {
            markdown += `#### Build Type: ${failure.type}\n\n`;
            markdown += `\`\`\`\n${failure.errors.join('\n')}\n\`\`\`\n\n`;
          });
        } else {
          markdown += `No specific build failure details available.\n\n`;
        }
      }
    } else {
      if (result.results && result.results.failedTests && result.results.failedTests.length > 0) {
        markdown += `### Failed Tests\n\n`;
        
        result.results.failedTests.forEach(file => {
          markdown += `#### File: ${file.file}\n\n`;
          
          file.failures.forEach(failure => {
            markdown += `##### ${failure.fullName || failure.title}\n\n`;
            markdown += `\`\`\`\n${failure.error}\n\`\`\`\n\n`;
          });
        });
      } else if (result.success) {
        markdown += `No test failures!\n\n`;
      } else {
        markdown += `No specific test failure details available.\n\n`;
        
        if (result.error) {
          markdown += `\`\`\`\n${result.error}\n\`\`\`\n\n`;
        }
        
        if (result.stderr) {
          markdown += `\`\`\`\n${result.stderr}\n\`\`\`\n\n`;
        }
      }
    }
  });
  
  fs.writeFileSync(outputPath, markdown);
  console.log(`Markdown report generated: ${outputPath}`);
  return outputPath;
}

/**
 * Generate comprehensive JSON report with all test results
 */
function generateJSONReport(results) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const outputDir = path.resolve(__dirname, '../test-results');
  const outputPath = path.resolve(outputDir, `comprehensive-test-report-${timestamp}.json`);
  
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTestTypes: results.length,
      successfulTestTypes: results.filter(r => r.success).length,
      failedTestTypes: results.filter(r => !r.success).length
    },
    results
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
  console.log(`JSON report generated: ${outputPath}`);
  return outputPath;
}

/**
 * Run the comprehensive test suite
 */
async function runComprehensiveTests() {
  console.log('Running comprehensive test suite...');
  
  const results = [];
  
  // Run each test type
  for (const testType of testTypes) {
    try {
      const result = await runTestCommand(testType);
      results.push(result);
    } catch (error) {
      console.error(`Error running ${testType.name} tests:`, error.message);
      results.push({
        type: testType.name,
        success: false,
        error: error.message
      });
    }
  }
  
  // Generate reports
  const htmlReport = generateHTMLReport(results);
  const markdownReport = generateMarkdownReport(results);
  const jsonReport = generateJSONReport(results);
  
  // Output summary
  console.log('\n---------------------------------------------------------');
  console.log('Comprehensive Test Results');
  console.log('---------------------------------------------------------');
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.type} tests: ${result.success ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log('\nReports generated:');
  console.log(`- HTML: ${htmlReport}`);
  console.log(`- Markdown: ${markdownReport}`);
  console.log(`- JSON: ${jsonReport}`);
  
  // Determine overall success
  const allSuccessful = results.every(result => result.success);
  
  console.log('\n---------------------------------------------------------');
  console.log(`Overall Result: ${allSuccessful ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('---------------------------------------------------------');
  
  return {
    success: allSuccessful,
    results,
    reports: {
      html: htmlReport,
      markdown: markdownReport,
      json: jsonReport
    }
  };
}

// Run the script
if (require.main === module) {
  runComprehensiveTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error running comprehensive tests:', error);
      process.exit(1);
    });
}

module.exports = {
  runComprehensiveTests,
  generateHTMLReport,
  generateMarkdownReport,
  generateJSONReport
};