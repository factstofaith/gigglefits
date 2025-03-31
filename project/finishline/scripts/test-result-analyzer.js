#!/usr/bin/env node

/**
 * Test Result Analyzer
 * 
 * Analyzes test results from different test types, finds patterns,
 * and creates a unified report of test failures with recommendations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Get the most recent test results
 */
function getMostRecentResults(testResultsDir) {
  try {
    // Ensure the directory exists
    if (!fs.existsSync(testResultsDir)) {
      console.error(`Results directory does not exist: ${testResultsDir}`);
      return null;
    }
    
    // Get all JSON files in the directory
    const files = fs.readdirSync(testResultsDir)
      .filter(file => file.startsWith('test-results-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.error('No test result files found');
      return null;
    }
    
    // Read the most recent file
    const mostRecentFile = files[0];
    const filePath = path.join(testResultsDir, mostRecentFile);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    return {
      file: mostRecentFile,
      date: new Date(mostRecentFile.replace('test-results-', '').replace('.json', '').replace(/-/g, ':')),
      results: JSON.parse(content)
    };
  } catch (error) {
    console.error('Error reading test results:', error.message);
    return null;
  }
}

/**
 * Analyze patterns in test failures
 */
function analyzeFailurePatterns(results) {
  // Create a map of error types and their frequencies
  const errorTypes = {};
  const errorByComponent = {};
  const errorByTestType = {};
  
  // Extract errors from each test type
  Object.keys(results).forEach(testType => {
    const typeResult = results[testType];
    
    if (!typeResult.success) {
      // Initialize test type in map if not exists
      if (!errorByTestType[testType]) {
        errorByTestType[testType] = { count: 0, errors: [] };
      }
      
      // Add error to test type
      errorByTestType[testType].count++;
      errorByTestType[testType].errors.push(typeResult.error);
      
      // Extract error type and component (if possible)
      let errorType = 'Unknown Error';
      let component = 'Unknown Component';
      
      // Try to extract error type from message
      if (typeResult.error) {
        // Check for common error patterns
        if (typeResult.error.includes('TypeError')) {
          errorType = 'TypeError';
        } else if (typeResult.error.includes('SyntaxError')) {
          errorType = 'SyntaxError';
        } else if (typeResult.error.includes('ReferenceError')) {
          errorType = 'ReferenceError';
        } else if (typeResult.error.includes('unbalanced')) {
          errorType = 'Unbalanced Tags';
        } else if (typeResult.error.includes('WCAG')) {
          errorType = 'Accessibility Violation';
        }
        
        // Try to extract component name from error message
        const componentMatch = typeResult.error.match(/([A-Z][a-zA-Z0-9]+)\.(jsx|test\.jsx|visual\.js)/);
        if (componentMatch) {
          component = componentMatch[1];
        }
      }
      
      // Add to error type map
      if (!errorTypes[errorType]) {
        errorTypes[errorType] = { count: 0, components: {} };
      }
      
      errorTypes[errorType].count++;
      if (!errorTypes[errorType].components[component]) {
        errorTypes[errorType].components[component] = 0;
      }
      errorTypes[errorType].components[component]++;
      
      // Add to component map
      if (!errorByComponent[component]) {
        errorByComponent[component] = { count: 0, types: {} };
      }
      
      errorByComponent[component].count++;
      if (!errorByComponent[component].types[errorType]) {
        errorByComponent[component].types[errorType] = 0;
      }
      errorByComponent[component].types[errorType]++;
    }
  });
  
  return {
    errorTypes,
    errorByComponent,
    errorByTestType
  };
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(analysis) {
  const recommendations = [];
  
  // Generate recommendations based on error types
  Object.keys(analysis.errorTypes).forEach(errorType => {
    const error = analysis.errorTypes[errorType];
    const topComponents = Object.entries(error.components)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => name);
    
    // Add type-specific recommendations
    switch (errorType) {
      case 'SyntaxError':
        recommendations.push({
          priority: 'High',
          issue: `Syntax errors in components (${error.count} occurrences)`,
          components: topComponents,
          recommendation: 'Run the code structure standardization tool to fix syntax issues'
        });
        break;
        
      case 'TypeError':
        recommendations.push({
          priority: 'High',
          issue: `Type errors in components (${error.count} occurrences)`,
          components: topComponents,
          recommendation: 'Review component prop types and ensure proper validation'
        });
        break;
        
      case 'Unbalanced Tags':
        recommendations.push({
          priority: 'High',
          issue: `JSX tag balance issues (${error.count} occurrences)`,
          components: topComponents,
          recommendation: 'Run the fixTests command to automatically fix tag balance issues'
        });
        break;
        
      case 'Accessibility Violation':
        recommendations.push({
          priority: 'Medium',
          issue: `Accessibility violations (${error.count} occurrences)`,
          components: topComponents,
          recommendation: 'Fix ARIA attributes and ensure WCAG compliance'
        });
        break;
        
      default:
        recommendations.push({
          priority: 'Medium',
          issue: `${errorType} (${error.count} occurrences)`,
          components: topComponents,
          recommendation: 'Review component implementation for potential issues'
        });
    }
  });
  
  // Add general recommendations
  if (Object.keys(analysis.errorByTestType).length > 0) {
    const failingTypes = Object.keys(analysis.errorByTestType).join(', ');
    
    recommendations.push({
      priority: 'High',
      issue: `Multiple test types failing (${failingTypes})`,
      components: ['Multiple'],
      recommendation: 'Run each test type individually to diagnose specific issues'
    });
  }
  
  // Sort recommendations by priority
  const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return recommendations;
}

/**
 * Generate HTML report from analysis and recommendations
 */
function generateHTMLReport(results, analysis, recommendations) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Results Analysis - ${timestamp}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #1a73e8;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .summary-box {
      flex: 1;
      background: #f5f7fa;
      border-radius: 8px;
      padding: 15px;
      margin-right: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-box:last-child {
      margin-right: 0;
    }
    .summary-box h3 {
      margin-top: 0;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    .error {
      color: #d93025;
    }
    .success {
      color: #188038;
    }
    .warning {
      color: #e37400;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th, td {
      text-align: left;
      padding: 12px 15px;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f5f7fa;
      font-weight: 600;
    }
    tr:hover {
      background-color: #f9f9f9;
    }
    .high-priority {
      background-color: #fce8e6;
    }
    .medium-priority {
      background-color: #fef7e0;
    }
    .low-priority {
      background-color: #e8f0fe;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge-high {
      background-color: #fce8e6;
      color: #d93025;
    }
    .badge-medium {
      background-color: #fef7e0;
      color: #e37400;
    }
    .badge-low {
      background-color: #e8f0fe;
      color: #1a73e8;
    }
    .chart-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .chart {
      width: 48%;
      height: 300px;
      background: #f5f7fa;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <h1>Test Results Analysis</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <div class="summary-box">
      <h3>Test Status Summary</h3>
      <ul>
        ${Object.entries(results).map(([type, result]) => `
          <li>${type}: <span class="${result.success ? 'success' : 'error'}">${result.success ? 'Passed' : 'Failed'}</span></li>
        `).join('')}
      </ul>
    </div>
    <div class="summary-box">
      <h3>Error Types</h3>
      <ul>
        ${Object.entries(analysis.errorTypes).map(([type, data]) => `
          <li>${type}: ${data.count} occurrences</li>
        `).join('')}
      </ul>
    </div>
    <div class="summary-box">
      <h3>Components with Issues</h3>
      <ul>
        ${Object.entries(analysis.errorByComponent).map(([component, data]) => `
          <li>${component}: ${data.count} errors</li>
        `).join('')}
      </ul>
    </div>
  </div>
  
  <h2>Recommendations</h2>
  <table>
    <thead>
      <tr>
        <th>Priority</th>
        <th>Issue</th>
        <th>Affected Components</th>
        <th>Recommendation</th>
      </tr>
    </thead>
    <tbody>
      ${recommendations.map(rec => `
        <tr class="${rec.priority.toLowerCase()}-priority">
          <td><span class="badge badge-${rec.priority.toLowerCase()}">${rec.priority}</span></td>
          <td>${rec.issue}</td>
          <td>${rec.components.join(', ')}</td>
          <td>${rec.recommendation}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h2>Detailed Analysis</h2>
  
  <h3>Test Type Analysis</h3>
  <table>
    <thead>
      <tr>
        <th>Test Type</th>
        <th>Status</th>
        <th>Error Details</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(results).map(([type, result]) => `
        <tr>
          <td>${type}</td>
          <td class="${result.success ? 'success' : 'error'}">${result.success ? 'Passed' : 'Failed'}</td>
          <td>${result.success ? '-' : result.error || 'Unknown error'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h3>Component Analysis</h3>
  <table>
    <thead>
      <tr>
        <th>Component</th>
        <th>Error Count</th>
        <th>Error Types</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(analysis.errorByComponent).map(([component, data]) => `
        <tr>
          <td>${component}</td>
          <td>${data.count}</td>
          <td>${Object.entries(data.types).map(([type, count]) => `${type} (${count})`).join(', ')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  return html;
}

/**
 * Generate markdown report from analysis and recommendations
 */
function generateMarkdownReport(results, analysis, recommendations) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  
  let markdown = `# Test Results Analysis\n\n`;
  markdown += `Generated on ${new Date().toLocaleString()}\n\n`;
  
  // Summary
  markdown += `## Summary\n\n`;
  
  // Test Status
  markdown += `### Test Status\n\n`;
  Object.entries(results).forEach(([type, result]) => {
    markdown += `- ${type}: ${result.success ? '✅ Passed' : '❌ Failed'}\n`;
  });
  markdown += '\n';
  
  // Error Types
  markdown += `### Error Types\n\n`;
  Object.entries(analysis.errorTypes).forEach(([type, data]) => {
    markdown += `- ${type}: ${data.count} occurrences\n`;
  });
  markdown += '\n';
  
  // Components with Issues
  markdown += `### Components with Issues\n\n`;
  Object.entries(analysis.errorByComponent).forEach(([component, data]) => {
    markdown += `- ${component}: ${data.count} errors\n`;
  });
  markdown += '\n';
  
  // Recommendations
  markdown += `## Recommendations\n\n`;
  markdown += `| Priority | Issue | Affected Components | Recommendation |\n`;
  markdown += `| -------- | ----- | ------------------- | -------------- |\n`;
  recommendations.forEach(rec => {
    markdown += `| ${rec.priority} | ${rec.issue} | ${rec.components.join(', ')} | ${rec.recommendation} |\n`;
  });
  markdown += '\n';
  
  // Detailed Analysis
  markdown += `## Detailed Analysis\n\n`;
  
  // Test Type Analysis
  markdown += `### Test Type Analysis\n\n`;
  markdown += `| Test Type | Status | Error Details |\n`;
  markdown += `| --------- | ------ | ------------- |\n`;
  Object.entries(results).forEach(([type, result]) => {
    markdown += `| ${type} | ${result.success ? '✅ Passed' : '❌ Failed'} | ${result.success ? '-' : result.error || 'Unknown error'} |\n`;
  });
  markdown += '\n';
  
  // Component Analysis
  markdown += `### Component Analysis\n\n`;
  markdown += `| Component | Error Count | Error Types |\n`;
  markdown += `| --------- | ----------- | ----------- |\n`;
  Object.entries(analysis.errorByComponent).forEach(([component, data]) => {
    markdown += `| ${component} | ${data.count} | ${Object.entries(data.types).map(([type, count]) => `${type} (${count})`).join(', ')} |\n`;
  });
  
  return markdown;
}

/**
 * Run test result analysis
 */
function runAnalysis(options = {}) {
  console.log('Running Test Result Analysis...');
  
  const testResultsDir = options.resultDir || path.resolve(__dirname, '../test-results');
  const outputDir = options.outputDir || path.resolve(__dirname, '../analysis-reports');
  
  // Get most recent test results
  const resultsData = getMostRecentResults(testResultsDir);
  
  if (!resultsData) {
    console.error('No test results found to analyze. Run tests first.');
    return;
  }
  
  console.log(`Analyzing results from ${resultsData.file}...`);
  
  // Analyze results
  const analysis = analyzeFailurePatterns(resultsData.results);
  
  // Generate recommendations
  const recommendations = generateRecommendations(analysis);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate timestamp for filenames
  const timestamp = new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
  
  // Generate HTML report
  const htmlReport = generateHTMLReport(resultsData.results, analysis, recommendations);
  const htmlPath = path.resolve(outputDir, `test-analysis-${timestamp}.html`);
  fs.writeFileSync(htmlPath, htmlReport);
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport(resultsData.results, analysis, recommendations);
  const markdownPath = path.resolve(outputDir, `test-analysis-${timestamp}.md`);
  fs.writeFileSync(markdownPath, markdownReport);
  
  console.log(`Analysis complete! Reports generated:`);
  console.log(`- HTML report: ${htmlPath}`);
  console.log(`- Markdown report: ${markdownPath}`);
  
  return {
    results: resultsData.results,
    analysis,
    recommendations,
    reports: {
      html: htmlPath,
      markdown: markdownPath
    }
  };
}

// Run the script
if (require.main === module) {
  runAnalysis();
}

module.exports = {
  getMostRecentResults,
  analyzeFailurePatterns,
  generateRecommendations,
  generateHTMLReport,
  generateMarkdownReport,
  runAnalysis
};