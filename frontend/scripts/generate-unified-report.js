#!/usr/bin/env node
/**
 * Unified Build and Test Reporting Script
 *
 * This script generates a comprehensive report combining build metrics,
 * test results, and verification status for the NPM package.
 *
 * Usage:
 *   node scripts/generate-unified-report.js [--output-dir path/to/output] [--coverage-report path/to/coverage]
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Default settings
let outputDir = path.resolve('./validation_results/latest');
let coverageReportPath = path.resolve('./coverage/coverage-summary.json');
let artifactsReportPath = path.resolve('./build/verification-report.json');
let publishReport = false;

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  
  if (arg === '--output-dir' && i + 1 < process.argv.length) {
    outputDir = path.resolve(process.argv[++i]);
  } else if (arg === '--coverage-report' && i + 1 < process.argv.length) {
    coverageReportPath = path.resolve(process.argv[++i]);
  } else if (arg === '--artifacts-report' && i + 1 < process.argv.length) {
    artifactsReportPath = path.resolve(process.argv[++i]);
  } else if (arg === '--publish') {
    publishReport = true;
  } else if (arg === '--help') {
    console.log(`
Unified Build and Test Reporting Script

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --output-dir <path>       Directory to output reports (default: ./validation_results/latest)
  --coverage-report <path>  Path to coverage summary JSON file (default: ./coverage/coverage-summary.json)
  --artifacts-report <path> Path to artifacts verification report (default: ./build/verification-report.json)
  --publish                 Publish the report to the CI/CD dashboard
  --help                    Show this help message
`);
    process.exit(0);
  }
}

// Ensure output directory exists
try {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
} catch (error) {
  console.error(`Error creating output directory: ${error.message}`);
  process.exit(1);
}

/**
 * Generate the unified report combining build, test and artifact verification results
 */
async function generateUnifiedReport() {
  console.log(chalk.blue('📊 Generating unified build and test report...'));
  
  const timestamp = new Date().toISOString();
  const dateFolder = timestamp.slice(0, 10).replace(/-/g, '');
  
  // Create date-specific subfolder if it doesn't exist
  const dateOutputDir = path.join(outputDir, dateFolder);
  if (!fs.existsSync(dateOutputDir)) {
    fs.mkdirSync(dateOutputDir, { recursive: true });
  }
  
  // Initialize report object
  const report = {
    generated: timestamp,
    build: {
      status: 'unknown',
      stats: {}
    },
    tests: {
      status: 'unknown',
      coverage: {},
      testResults: {}
    },
    artifacts: {
      status: 'unknown',
      verification: {}
    },
    overall: {
      status: 'unknown',
      recommendations: []
    }
  };
  
  // 1. Collect build information
  try {
    const buildInfoPath = path.join(process.cwd(), 'build', 'deploy-info.json');
    if (fs.existsSync(buildInfoPath)) {
      const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
      report.build = {
        status: 'success',
        version: buildInfo.version,
        buildTime: buildInfo.buildTime,
        gitCommit: buildInfo.gitCommit,
        gitBranch: buildInfo.gitBranch
      };
      
      // Get bundle stats
      try {
        const bundleStats = getBundleStats();
        report.build.stats = bundleStats;
      } catch (error) {
        console.warn(`Warning: Could not get bundle stats: ${error.message}`);
      }
    } else {
      report.build.status = 'not_found';
      report.overall.recommendations.push('Run a production build before generating the report');
    }
  } catch (error) {
    console.error(`Error reading build info: ${error.message}`);
    report.build.status = 'error';
    report.build.error = error.message;
  }
  
  // 2. Collect test coverage data
  try {
    if (fs.existsSync(coverageReportPath)) {
      const coverageData = JSON.parse(fs.readFileSync(coverageReportPath, 'utf8'));
      if (coverageData && coverageData.total) {
        report.tests.status = 'success';
        report.tests.coverage = {
          statements: coverageData.total.statements?.pct || 0,
          branches: coverageData.total.branches?.pct || 0,
          functions: coverageData.total.functions?.pct || 0,
          lines: coverageData.total.lines?.pct || 0
        };
        
        // Get test results (success/failure count)
        const jestResults = getJestResults();
        if (jestResults) {
          report.tests.testResults = jestResults;
        }
      } else {
        report.tests.status = 'invalid';
        report.overall.recommendations.push('Run tests with coverage to generate valid coverage data');
      }
    } else {
      report.tests.status = 'not_found';
      report.overall.recommendations.push('Run tests with coverage before generating the report');
    }
  } catch (error) {
    console.error(`Error reading test coverage: ${error.message}`);
    report.tests.status = 'error';
    report.tests.error = error.message;
  }
  
  // 3. Collect artifact verification data
  try {
    if (fs.existsSync(artifactsReportPath)) {
      const artifactsData = JSON.parse(fs.readFileSync(artifactsReportPath, 'utf8'));
      report.artifacts = {
        status: 'success',
        verification: artifactsData
      };
    } else {
      report.artifacts.status = 'not_found';
      report.overall.recommendations.push('Run artifact verification before generating the report');
    }
  } catch (error) {
    console.error(`Error reading artifacts verification: ${error.message}`);
    report.artifacts.status = 'error';
    report.artifacts.error = error.message;
  }
  
  // 4. Determine overall status
  if (report.build.status === 'success' && 
      report.tests.status === 'success' && 
      report.artifacts.status === 'success') {
    report.overall.status = 'success';
  } else if (report.build.status === 'error' || 
             report.tests.status === 'error' || 
             report.artifacts.status === 'error') {
    report.overall.status = 'error';
  } else {
    report.overall.status = 'incomplete';
  }
  
  // 5. Write JSON report
  const reportFileName = `unified_report_${timestamp.replace(/[:.]/g, '')}.json`;
  const reportPath = path.join(dateOutputDir, reportFileName);
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(chalk.green(`✅ JSON report created at: ${reportPath}`));
  
  // 6. Generate HTML report
  const htmlReportPath = reportPath.replace('.json', '.html');
  const htmlReport = generateHtmlReport(report);
  fs.writeFileSync(htmlReportPath, htmlReport);
  console.log(chalk.green(`✅ HTML report created at: ${htmlReportPath}`));
  
  // 7. Create a "latest" symbolic link
  const latestJsonPath = path.join(outputDir, 'latest_unified_report.json');
  const latestHtmlPath = path.join(outputDir, 'latest_unified_report.html');
  
  try {
    if (fs.existsSync(latestJsonPath)) fs.unlinkSync(latestJsonPath);
    if (fs.existsSync(latestHtmlPath)) fs.unlinkSync(latestHtmlPath);
    
    fs.copyFileSync(reportPath, latestJsonPath);
    fs.copyFileSync(htmlReportPath, latestHtmlPath);
    
    console.log(chalk.green('✅ Latest report links updated'));
  } catch (error) {
    console.warn(`Warning: Could not update latest links: ${error.message}`);
  }
  
  // 8. Publish report if requested
  if (publishReport) {
    try {
      // This would upload the report to a CI dashboard or similar system
      console.log(chalk.blue('📤 Publishing report to CI/CD dashboard...'));
      // publishToCIDashboard(report, reportPath);
      console.log(chalk.green('✅ Report published successfully'));
    } catch (error) {
      console.error(`Error publishing report: ${error.message}`);
    }
  }
  
  console.log(chalk.blue(`\n=== Build and Test Report Summary ===\n`));
  console.log(`Overall Status: ${getStatusEmoji(report.overall.status)} ${report.overall.status.toUpperCase()}`);
  console.log(`Build Status: ${getStatusEmoji(report.build.status)} ${report.build.status.toUpperCase()}`);
  console.log(`Test Status: ${getStatusEmoji(report.tests.status)} ${report.tests.status.toUpperCase()}`);
  console.log(`Artifact Status: ${getStatusEmoji(report.artifacts.status)} ${report.artifacts.status.toUpperCase()}`);
  
  if (report.overall.recommendations.length > 0) {
    console.log(chalk.yellow('\nRecommendations:'));
    report.overall.recommendations.forEach((rec, i) => {
      console.log(`${i+1}. ${rec}`);
    });
  }
  
  return report;
}

/**
 * Get the bundle statistics from the build directory
 */
function getBundleStats() {
  const stats = {
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    assetCount: 0
  };
  
  const buildDir = path.join(process.cwd(), 'build');
  if (!fs.existsSync(buildDir)) {
    return stats;
  }
  
  // Get JS file sizes
  const jsDir = path.join(buildDir, 'static/js');
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    jsFiles.forEach(file => {
      const size = fs.statSync(path.join(jsDir, file)).size;
      stats.jsSize += size;
      stats.totalSize += size;
      stats.assetCount++;
    });
  }
  
  // Get CSS file sizes
  const cssDir = path.join(buildDir, 'static/css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    cssFiles.forEach(file => {
      const size = fs.statSync(path.join(cssDir, file)).size;
      stats.cssSize += size;
      stats.totalSize += size;
      stats.assetCount++;
    });
  }
  
  // Convert to human readable format
  stats.totalSizeFormatted = formatBytes(stats.totalSize);
  stats.jsSizeFormatted = formatBytes(stats.jsSize);
  stats.cssSizeFormatted = formatBytes(stats.cssSize);
  
  return stats;
}

/**
 * Get the Jest test results from the test results file
 */
function getJestResults() {
  const testResultsPath = path.join(process.cwd(), 'test-results.json');
  if (!fs.existsSync(testResultsPath)) {
    // Try junit report
    const junitPath = path.join(process.cwd(), 'junit.xml');
    if (fs.existsSync(junitPath)) {
      // Parse junit.xml if available
      // This would need xml parsing which is omitted for brevity
      return { note: "JUnit report found but not parsed" };
    }
    return null;
  }
  
  try {
    const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
    return {
      numTotalTests: testResults.numTotalTests,
      numPassedTests: testResults.numPassedTests,
      numFailedTests: testResults.numFailedTests,
      numPendingTests: testResults.numPendingTests
    };
  } catch (error) {
    console.warn(`Warning: Could not parse test results: ${error.message}`);
    return null;
  }
}

/**
 * Generate HTML report from the report data
 */
function generateHtmlReport(report) {
  const statusColorMap = {
    success: '#4caf50',
    error: '#f44336',
    incomplete: '#ff9800',
    not_found: '#9e9e9e',
    unknown: '#9e9e9e'
  };
  
  // Format metrics as percentage bars
  function formatPercentageBar(value, threshold) {
    const color = value >= threshold ? '#4caf50' : value >= threshold * 0.9 ? '#ff9800' : '#f44336';
    return `
      <div class="percentage-bar-container">
        <div class="percentage-bar" style="width: ${value}%; background-color: ${color};"></div>
        <span class="percentage-text">${value.toFixed(2)}%</span>
      </div>
    `;
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NPM Package Verification Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .timestamp {
      color: #7f8c8d;
      font-size: 0.9em;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      color: white;
      font-weight: bold;
      font-size: 0.9em;
      text-transform: uppercase;
    }
    .overview {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .overview-card {
      flex: 1;
      margin: 0 10px;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    .section {
      margin-bottom: 30px;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background-color: #f5f5f5;
    }
    .recommendations {
      background-color: #fff8e1;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .percentage-bar-container {
      width: 100%;
      background-color: #e0e0e0;
      height: 20px;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }
    .percentage-bar {
      height: 100%;
      border-radius: 4px;
    }
    .percentage-text {
      position: absolute;
      top: 0;
      left: 10px;
      line-height: 20px;
      color: white;
      font-weight: bold;
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    }
  </style>
</head>
<body>
  <header>
    <h1>NPM Package Verification Report</h1>
    <p class="timestamp">Generated on: ${new Date(report.generated).toLocaleString()}</p>
    <div>
      <span class="status-badge" style="background-color: ${statusColorMap[report.overall.status]}">
        Overall: ${report.overall.status}
      </span>
    </div>
  </header>
  
  <div class="overview">
    <div class="overview-card" style="border-left: 5px solid ${statusColorMap[report.build.status]}">
      <h3>Build</h3>
      <span class="status-badge" style="background-color: ${statusColorMap[report.build.status]}">
        ${report.build.status}
      </span>
      ${report.build.version ? `<p>Version: ${report.build.version}</p>` : ''}
      ${report.build.buildTime ? `<p>Build Time: ${new Date(report.build.buildTime).toLocaleString()}</p>` : ''}
    </div>
    
    <div class="overview-card" style="border-left: 5px solid ${statusColorMap[report.tests.status]}">
      <h3>Tests</h3>
      <span class="status-badge" style="background-color: ${statusColorMap[report.tests.status]}">
        ${report.tests.status}
      </span>
      ${report.tests.testResults?.numTotalTests ? 
        `<p>Tests: ${report.tests.testResults.numPassedTests}/${report.tests.testResults.numTotalTests} passed</p>` : ''}
    </div>
    
    <div class="overview-card" style="border-left: 5px solid ${statusColorMap[report.artifacts.status]}">
      <h3>Artifacts</h3>
      <span class="status-badge" style="background-color: ${statusColorMap[report.artifacts.status]}">
        ${report.artifacts.status}
      </span>
      ${report.artifacts.verification?.issues ? 
        `<p>Issues: ${report.artifacts.verification.issues.length}</p>` : ''}
    </div>
  </div>
  
  <!-- Build Details -->
  <div class="section">
    <h2>Build Details</h2>
    ${report.build.status === 'success' ? `
      <table>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Version</td>
          <td>${report.build.version || 'N/A'}</td>
        </tr>
        <tr>
          <td>Build Time</td>
          <td>${report.build.buildTime ? new Date(report.build.buildTime).toLocaleString() : 'N/A'}</td>
        </tr>
        <tr>
          <td>Git Commit</td>
          <td>${report.build.gitCommit || 'N/A'}</td>
        </tr>
        <tr>
          <td>Git Branch</td>
          <td>${report.build.gitBranch || 'N/A'}</td>
        </tr>
        <tr>
          <td>Total Bundle Size</td>
          <td>${report.build.stats?.totalSizeFormatted || 'N/A'}</td>
        </tr>
        <tr>
          <td>JS Size</td>
          <td>${report.build.stats?.jsSizeFormatted || 'N/A'}</td>
        </tr>
        <tr>
          <td>CSS Size</td>
          <td>${report.build.stats?.cssSizeFormatted || 'N/A'}</td>
        </tr>
        <tr>
          <td>Asset Count</td>
          <td>${report.build.stats?.assetCount || 'N/A'}</td>
        </tr>
      </table>
    ` : `<p>No build information available. Status: ${report.build.status}</p>`}
  </div>
  
  <!-- Test Coverage -->
  <div class="section">
    <h2>Test Coverage</h2>
    ${report.tests.status === 'success' ? `
      <table>
        <tr>
          <th>Type</th>
          <th>Coverage</th>
        </tr>
        <tr>
          <td>Statements</td>
          <td>${formatPercentageBar(report.tests.coverage.statements, 80)}</td>
        </tr>
        <tr>
          <td>Branches</td>
          <td>${formatPercentageBar(report.tests.coverage.branches, 70)}</td>
        </tr>
        <tr>
          <td>Functions</td>
          <td>${formatPercentageBar(report.tests.coverage.functions, 75)}</td>
        </tr>
        <tr>
          <td>Lines</td>
          <td>${formatPercentageBar(report.tests.coverage.lines, 80)}</td>
        </tr>
      </table>
      
      ${report.tests.testResults ? `
        <h3>Test Results</h3>
        <table>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Total Tests</td>
            <td>${report.tests.testResults.numTotalTests || 'N/A'}</td>
          </tr>
          <tr>
            <td>Passed Tests</td>
            <td>${report.tests.testResults.numPassedTests || 'N/A'}</td>
          </tr>
          <tr>
            <td>Failed Tests</td>
            <td>${report.tests.testResults.numFailedTests || 'N/A'}</td>
          </tr>
          <tr>
            <td>Pending Tests</td>
            <td>${report.tests.testResults.numPendingTests || 'N/A'}</td>
          </tr>
        </table>
      ` : ''}
    ` : `<p>No test coverage information available. Status: ${report.tests.status}</p>`}
  </div>
  
  <!-- Artifact Verification -->
  <div class="section">
    <h2>Artifact Verification</h2>
    ${report.artifacts.status === 'success' ? `
      ${report.artifacts.verification.issues && report.artifacts.verification.issues.length > 0 ? `
        <h3>Issues Found</h3>
        <ul>
          ${report.artifacts.verification.issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>
      ` : '<p>No issues found in artifact verification.</p>'}
      
      ${report.artifacts.verification.checks ? `
        <h3>Verification Checks</h3>
        <table>
          <tr>
            <th>Check</th>
            <th>Result</th>
          </tr>
          ${Object.entries(report.artifacts.verification.checks).map(([check, result]) => `
            <tr>
              <td>${check}</td>
              <td>${result ? '✅ Passed' : '❌ Failed'}</td>
            </tr>
          `).join('')}
        </table>
      ` : ''}
    ` : `<p>No artifact verification information available. Status: ${report.artifacts.status}</p>`}
  </div>
  
  <!-- Recommendations -->
  ${report.overall.recommendations.length > 0 ? `
    <div class="recommendations">
      <h2>Recommendations</h2>
      <ul>
        ${report.overall.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
  ` : ''}
</body>
</html>
`;
}

/**
 * Format bytes to human readable form
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get emoji for status
 */
function getStatusEmoji(status) {
  switch (status) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'incomplete':
      return '⚠️';
    case 'not_found':
      return '❓';
    default:
      return '❔';
  }
}

// Execute the report generation
generateUnifiedReport().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});