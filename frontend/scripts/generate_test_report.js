#!/usr/bin/env node

/**
 * Test Report Generator
 * 
 * This script generates an HTML report from JUnit XML test results
 * produced by Cypress tests.
 */

const fs = require('fs');
const path = require('path');
const { parseStringPromise } = require('xml2js');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    description: 'Input directory containing JUnit XML files',
    type: 'string',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    description: 'Output directory for HTML report',
    type: 'string',
    demandOption: true
  })
  .help()
  .alias('help', 'h')
  .argv;

// Ensure output directory exists
if (!fs.existsSync(argv.output)) {
  fs.mkdirSync(argv.output, { recursive: true });
}

/**
 * Process JUnit XML files
 */
async function processJUnitFiles() {
  // Get all XML files in input directory
  const files = fs.readdirSync(argv.input)
    .filter(file => file.endsWith('.xml'))
    .map(file => path.join(argv.input, file));
  
  if (files.length === 0) {
    console.error('No JUnit XML files found in input directory');
    process.exit(1);
  }
  
  // Process each file and collect results
  const testResults = [];
  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0
  };
  
  for (const file of files) {
    try {
      const xml = fs.readFileSync(file, 'utf8');
      const result = await parseStringPromise(xml);
      
      // Extract test suite information
      const testSuite = result.testsuites?.testsuite?.[0] || result.testsuite;
      
      if (!testSuite) {
        console.warn(`No test suite found in ${file}`);
        continue;
      }
      
      // Process test cases
      const suiteResults = {
        name: testSuite.$.name,
        tests: parseInt(testSuite.$.tests, 10) || 0,
        failures: parseInt(testSuite.$.failures, 10) || 0,
        errors: parseInt(testSuite.$.errors, 10) || 0,
        skipped: parseInt(testSuite.$.skipped, 10) || 0,
        time: parseFloat(testSuite.$.time) || 0,
        timestamp: testSuite.$.timestamp,
        testcases: []
      };
      
      // Update summary
      summary.total += suiteResults.tests;
      summary.failed += suiteResults.failures + suiteResults.errors;
      summary.skipped += suiteResults.skipped;
      summary.passed += suiteResults.tests - suiteResults.failures - suiteResults.errors - suiteResults.skipped;
      summary.duration += suiteResults.time;
      
      // Process individual test cases
      if (testSuite.testcase) {
        for (const testcase of testSuite.testcase) {
          const testResult = {
            name: testcase.$.name,
            classname: testcase.$.classname,
            time: parseFloat(testcase.$.time) || 0,
            status: 'passed'
          };
          
          // Check for failures or errors
          if (testcase.failure || testcase.error) {
            testResult.status = 'failed';
            testResult.failure = {
              message: (testcase.failure?.[0].$ || testcase.error?.[0].$)?.message || 'Test failed',
              content: (testcase.failure?.[0]._ || testcase.error?.[0]._) || ''
            };
          } else if (testcase.skipped) {
            testResult.status = 'skipped';
          }
          
          suiteResults.testcases.push(testResult);
        }
      }
      
      testResults.push(suiteResults);
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
  
  return { testResults, summary };
}

/**
 * Generate HTML report from test results
 */
function generateHtmlReport(data) {
  const { testResults, summary } = data;
  
  // Calculate pass rate percentage
  const passRate = summary.total > 0 
    ? Math.round((summary.passed / summary.total) * 100) 
    : 0;
  
  // Generate timestamp
  const timestamp = new Date().toISOString();
  
  // Generate HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E2E Test Execution Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-item {
      text-align: center;
      padding: 15px;
      min-width: 120px;
    }
    .summary-item h3 {
      margin-bottom: 5px;
    }
    .passed { color: #28a745; }
    .failed { color: #dc3545; }
    .skipped { color: #6c757d; }
    .duration { color: #17a2b8; }
    
    .progress-bar {
      height: 30px;
      background-color: #e9ecef;
      border-radius: 5px;
      margin: 20px 0;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background-color: #28a745;
      width: ${passRate}%;
      transition: width 0.5s ease-in-out;
      text-align: center;
      color: white;
      line-height: 30px;
    }
    
    .test-suite {
      margin-bottom: 30px;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test-suite-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #dee2e6;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .test-case {
      padding: 10px 15px;
      margin: 10px 0;
      border-radius: 5px;
    }
    .test-case.passed { background-color: #f0fff4; border-left: 4px solid #28a745; }
    .test-case.failed { background-color: #fff5f5; border-left: 4px solid #dc3545; }
    .test-case.skipped { background-color: #f8f9fa; border-left: 4px solid #6c757d; }
    
    .failure-details {
      background-color: #ffeeee;
      padding: 15px;
      border-radius: 5px;
      margin-top: 10px;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 12px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .collapsible {
      cursor: pointer;
    }
    .content {
      display: none;
      overflow: hidden;
    }
    
    @media (max-width: 768px) {
      .summary {
        flex-direction: column;
      }
      .summary-item {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <h1>E2E Test Execution Report</h1>
  <p>Generated on: ${new Date(timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <div class="summary-item">
      <h3>Total Tests</h3>
      <p><strong>${summary.total}</strong></p>
    </div>
    <div class="summary-item">
      <h3 class="passed">Passed</h3>
      <p><strong>${summary.passed}</strong></p>
    </div>
    <div class="summary-item">
      <h3 class="failed">Failed</h3>
      <p><strong>${summary.failed}</strong></p>
    </div>
    <div class="summary-item">
      <h3 class="skipped">Skipped</h3>
      <p><strong>${summary.skipped}</strong></p>
    </div>
    <div class="summary-item">
      <h3 class="duration">Duration</h3>
      <p><strong>${summary.duration.toFixed(2)}s</strong></p>
    </div>
  </div>
  
  <h2>Pass Rate: ${passRate}%</h2>
  <div class="progress-bar">
    <div class="progress-fill">${passRate}%</div>
  </div>
  
  <h2>Test Suites</h2>
  
  ${testResults.map(suite => `
    <div class="test-suite">
      <div class="test-suite-header">
        <h3>${suite.name}</h3>
        <div>
          <span class="passed">${suite.tests - suite.failures - suite.errors - suite.skipped} passed</span> | 
          <span class="failed">${suite.failures + suite.errors} failed</span> | 
          <span class="skipped">${suite.skipped} skipped</span> | 
          <span class="duration">${suite.time.toFixed(2)}s</span>
        </div>
      </div>
      
      ${suite.testcases.map(testcase => `
        <div class="test-case ${testcase.status}">
          <div>
            <strong>${testcase.name}</strong>
            <span style="float: right">${testcase.time.toFixed(2)}s</span>
          </div>
          <div><small>${testcase.classname}</small></div>
          
          ${testcase.status === 'failed' ? `
            <div class="collapsible">
              <p><strong>Failure:</strong> ${testcase.failure.message}</p>
              <p><strong>Show Details</strong> ⬇️</p>
            </div>
            <div class="content failure-details">
              ${testcase.failure.content}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `).join('')}
  
  <script>
    // Add collapsible functionality for failure details
    const collapsibles = document.getElementsByClassName("collapsible");
    for (let i = 0; i < collapsibles.length; i++) {
      collapsibles[i].addEventListener("click", function() {
        const content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
          this.getElementsByTagName('p')[1].innerHTML = "<strong>Show Details</strong> ⬇️";
        } else {
          content.style.display = "block";
          this.getElementsByTagName('p')[1].innerHTML = "<strong>Hide Details</strong> ⬆️";
        }
      });
    }
  </script>
</body>
</html>
  `;
  
  // Write HTML to file
  fs.writeFileSync(path.join(argv.output, 'index.html'), html);
  
  // Write summary to JSON file for other scripts to use
  fs.writeFileSync(path.join(argv.output, 'summary.json'), JSON.stringify(summary, null, 2));
  
  console.log(`HTML report generated at ${path.join(argv.output, 'index.html')}`);
  console.log(`Summary: ${summary.passed}/${summary.total} passed (${passRate}%)`);
}

// Execute the report generation
async function main() {
  try {
    const data = await processJUnitFiles();
    generateHtmlReport(data);
  } catch (error) {
    console.error('Error generating report:', error.message);
    process.exit(1);
  }
}

main();