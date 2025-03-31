#!/usr/bin/env node

/**
 * Run Monitoring Tools
 * 
 * Script to run all monitoring tools and generate comprehensive reports.
 */

const fs = require('fs');
const path = require('path');
const { initializeMonitoring, runMonitor } = require('./performance-monitor');
const { initializeErrorTracker, trackErrors } = require('./error-tracker');
const { initializeAnalytics, trackUsage } = require('./usage-analytics');
const { initializeCompliance, checkCompliance } = require('./compliance-monitor');

/**
 * Run all monitoring tools
 * 
 * @param {Object} options - Options for monitoring
 * @returns {Object} Monitoring results
 */
function runAllMonitoring(options = {}) {
  console.log('Running all monitoring tools...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = options.outputDir || path.resolve('performance-reports', `monitoring-${timestamp}`);
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Set options for each monitoring tool
  const toolOptions = {
    outputDir,
    outputFormat: options.format || 'html',
    detailed: options.detailed || false
  };
  
  // Run all monitoring tools
  console.log('Running performance monitor...');
  const performanceResults = runMonitor(toolOptions);
  
  console.log('Running error tracker...');
  const errorResults = trackErrors(toolOptions);
  
  console.log('Running usage analytics...');
  const usageResults = trackUsage(toolOptions);
  
  console.log('Running compliance check...');
  const complianceResults = checkCompliance(toolOptions);
  
  // Generate summary report
  const summary = generateSummaryReport({
    performance: performanceResults,
    errors: errorResults,
    usage: usageResults,
    compliance: complianceResults
  }, timestamp, options.format || 'html');
  
  // Save summary report
  const summaryPath = path.join(outputDir, `summary-report-${timestamp}.${options.format === 'json' ? 'json' : 'html'}`);
  fs.writeFileSync(summaryPath, summary);
  
  console.log(`\nAll monitoring tools completed successfully!`);
  console.log(`Summary report saved to: ${summaryPath}`);
  
  return {
    outputDir,
    summaryPath,
    performance: performanceResults,
    errors: errorResults,
    usage: usageResults,
    compliance: complianceResults
  };
}

/**
 * Generate a summary report of all monitoring results
 * 
 * @param {Object} results - Results from all monitoring tools
 * @param {string} timestamp - Timestamp for the report
 * @param {string} format - Output format (json, html)
 * @returns {string} Summary report
 */
function generateSummaryReport(results, timestamp, format = 'html') {
  if (format === 'json') {
    return JSON.stringify({
      timestamp,
      results,
      generatedAt: new Date().toISOString()
    }, null, 2);
  }
  
  // Generate HTML summary report
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Monitoring Summary Report - ${new Date(timestamp).toLocaleString()}</title>
    <style>
      body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 1200px; margin: 0 auto; padding: 2rem; }
      h1, h2, h3 { color: #333; }
      .card { background: #f9f9f9; border-radius: 4px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .good { color: #4caf50; }
      .warning { color: #ff9800; }
      .error { color: #f44336; }
      .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
      .summary-item { padding: 1rem; border-radius: 4px; }
      a { color: #2196f3; text-decoration: none; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <h1>Monitoring Summary Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    
    <div class="summary-grid">
      <div class="card summary-item">
        <h2>Performance Monitoring</h2>
        <p>
          ${results.performance.hasViolations 
            ? `<span class="warning">⚠️ Performance threshold violations detected</span>` 
            : `<span class="good">✅ No performance violations detected</span>`}
        </p>
        <p><a href="${results.performance.reportPath.split('/').pop()}" target="_blank">View detailed report</a></p>
      </div>
      
      <div class="card summary-item">
        <h2>Error Tracking</h2>
        <p>
          ${results.errors.hasErrors 
            ? `<span class="error">⚠️ Errors detected</span>` 
            : `<span class="good">✅ No errors detected</span>`}
        </p>
        <p><a href="${results.errors.reportPath.split('/').pop()}" target="_blank">View detailed report</a></p>
      </div>
      
      <div class="card summary-item">
        <h2>Usage Analytics</h2>
        <p>
          ${results.usage.hasData 
            ? `<span class="good">✅ Usage data collected</span>` 
            : `<span class="warning">⚠️ No usage data available</span>`}
        </p>
        <p><a href="${results.usage.reportPath.split('/').pop()}" target="_blank">View detailed report</a></p>
      </div>
      
      <div class="card summary-item">
        <h2>Compliance Monitoring</h2>
        <p>
          ${results.compliance.hasResults 
            ? `<span class="good">✅ Compliance check completed</span>` 
            : `<span class="warning">⚠️ No compliance data available</span>`}
        </p>
        <p><a href="${results.compliance.reportPath.split('/').pop()}" target="_blank">View detailed report</a></p>
      </div>
    </div>
    
    <h2>Next Steps</h2>
    <div class="card">
      <p>Based on the monitoring results, consider the following actions:</p>
      <ul>
        ${results.performance.hasViolations ? '<li>Address performance threshold violations in components</li>' : ''}
        ${results.errors.hasErrors ? '<li>Fix detected errors in the application</li>' : ''}
        ${!results.usage.hasData ? '<li>Implement more comprehensive usage tracking</li>' : ''}
        ${!results.compliance.hasResults ? '<li>Run full compliance checks for accessibility and performance budgets</li>' : ''}
        <li>Set up continuous monitoring to track trends over time</li>
        <li>Integrate monitoring into CI/CD pipeline</li>
      </ul>
    </div>
  </body>
  </html>
  `;
}

// Run when directly executed (not imported)
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      options.format = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--detailed') {
      options.detailed = true;
    }
  }
  
  // Run monitoring
  runAllMonitoring(options);
}

module.exports = { runAllMonitoring };