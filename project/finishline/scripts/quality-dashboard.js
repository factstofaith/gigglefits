/**
 * Quality Metrics Dashboard
 * 
 * Generates comprehensive quality metrics reports for the project, tracking test coverage,
 * bundle size, performance metrics, accessibility compliance, and technical debt.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration for metrics collection
const config = {
  testCoverage: {
    threshold: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80
    }
  },
  bundle: {
    maxSize: {
      main: 250, // KB
      vendor: 1000, // KB
      total: 1500 // KB
    }
  },
  performance: {
    thresholds: {
      firstContentfulPaint: 1800, // ms
      timeToInteractive: 3500, // ms
      maxJsExecutionTime: 350 // ms
    }
  },
  accessibility: {
    level: 'AA', // 'A', 'AA', or 'AAA'
    minScore: 90 // 0-100
  },
  technicalDebt: {
    maxAllowed: {
      complexity: 10,
      duplicateCode: 5, // percentage
      todos: 10
    }
  }
};

/**
 * Collect test coverage metrics
 * 
 * @returns {Object} Test coverage metrics
 */
function collectTestCoverage() {
  // In a real implementation, would parse coverage reports
  // Mock for illustration
  
  return {
    overall: {
      statements: 85.2,
      branches: 74.6,
      functions: 88.3,
      lines: 86.7
    },
    components: {
      statements: 92.4,
      branches: 82.1,
      functions: 94.8,
      lines: 93.2
    },
    services: {
      statements: 88.7,
      branches: 76.5,
      functions: 91.3,
      lines: 89.4
    },
    hooks: {
      statements: 90.1,
      branches: 80.9,
      functions: 93.5,
      lines: 91.2
    },
    utils: {
      statements: 79.8,
      branches: 68.3,
      functions: 83.7,
      lines: 80.5
    },
    isThresholdMet: true,
    trend: [
      { date: '2025-03-20', overall: 78.5 },
      { date: '2025-03-25', overall: 82.1 },
      { date: '2025-03-30', overall: 85.2 }
    ]
  };
}

/**
 * Collect bundle size metrics
 * 
 * @returns {Object} Bundle size metrics
 */
function collectBundleMetrics() {
  // In a real implementation, would analyze webpack stats
  // Mock for illustration
  
  return {
    modules: {
      main: { size: 187, sizeGzip: 52 },
      vendor: { size: 856, sizeGzip: 245 },
      react: { size: 130, sizeGzip: 43 },
      'material-ui': { size: 308, sizeGzip: 89 },
      utilities: { size: 75, sizeGzip: 22 }
    },
    total: { size: 1341, sizeGzip: 387 },
    isWithinLimits: true,
    trend: [
      { date: '2025-03-20', size: 1420 },
      { date: '2025-03-25', size: 1380 },
      { date: '2025-03-30', size: 1341 }
    ],
    largestFiles: [
      { name: 'vendor.js', size: 856 },
      { name: 'main.js', size: 187 },
      { name: 'react.js', size: 130 }
    ]
  };
}

/**
 * Collect performance metrics
 * 
 * @returns {Object} Performance metrics
 */
function collectPerformanceMetrics() {
  // In a real implementation, would analyze lighthouse reports
  // Mock for illustration
  
  return {
    metrics: {
      firstContentfulPaint: 1650,
      timeToInteractive: 3280,
      maxJsExecutionTime: 310,
      totalBlockingTime: 220,
      cumulativeLayoutShift: 0.08,
      largestContentfulPaint: 2100
    },
    components: {
      'IntegrationDetailView': { renderTime: 45, reRenders: 3 },
      'DataGrid': { renderTime: 89, reRenders: 2 },
      'Dashboard': { renderTime: 67, reRenders: 4 }
    },
    meetsThresholds: true,
    trend: [
      { date: '2025-03-20', timeToInteractive: 3650 },
      { date: '2025-03-25', timeToInteractive: 3400 },
      { date: '2025-03-30', timeToInteractive: 3280 }
    ],
    slowestComponents: [
      { name: 'DataGrid', renderTime: 89 },
      { name: 'Dashboard', renderTime: 67 },
      { name: 'IntegrationDetailView', renderTime: 45 }
    ]
  };
}

/**
 * Collect accessibility metrics
 * 
 * @returns {Object} Accessibility metrics
 */
function collectAccessibilityMetrics() {
  // In a real implementation, would run accessibility audit
  // Mock for illustration
  
  return {
    score: 87,
    categories: {
      'color-contrast': { score: 92, issues: 3 },
      'keyboard-navigation': { score: 85, issues: 7 },
      'aria-attributes': { score: 90, issues: 5 },
      'form-labels': { score: 95, issues: 2 },
      'image-alt': { score: 98, issues: 1 },
      'link-purpose': { score: 88, issues: 6 },
      'heading-order': { score: 93, issues: 4 }
    },
    components: {
      'Button': { score: 95 },
      'Dialog': { score: 82 },
      'TextField': { score: 90 },
      'Table': { score: 84 },
      'Card': { score: 93 }
    },
    meetsStandards: false,
    trend: [
      { date: '2025-03-20', score: 82 },
      { date: '2025-03-25', score: 85 },
      { date: '2025-03-30', score: 87 }
    ],
    topIssues: [
      { type: 'keyboard-navigation', count: 7, severity: 'high' },
      { type: 'link-purpose', count: 6, severity: 'medium' },
      { type: 'aria-attributes', count: 5, severity: 'medium' }
    ]
  };
}

/**
 * Collect technical debt metrics
 * 
 * @returns {Object} Technical debt metrics
 */
function collectTechnicalDebtMetrics() {
  // In a real implementation, would analyze code quality
  // Mock for illustration
  
  return {
    metrics: {
      complexity: {
        average: 7.2,
        max: 15,
        exceedingThreshold: 3
      },
      duplicateCode: {
        percentage: 3.8,
        linesOfCode: 520
      },
      todos: {
        count: 8,
        critical: 2
      },
      linesOfCode: 15680,
      filesTouched: [
        { path: 'src/components/integration/IntegrationDetailView.jsx', changes: 45 },
        { path: 'src/components/common/Table.jsx', changes: 32 },
        { path: 'src/utils/validation.js', changes: 28 }
      ]
    },
    isUnderThreshold: true,
    trend: [
      { date: '2025-03-20', complexity: 8.1, duplicateCode: 4.5, todos: 12 },
      { date: '2025-03-25', complexity: 7.6, duplicateCode: 4.1, todos: 10 },
      { date: '2025-03-30', complexity: 7.2, duplicateCode: 3.8, todos: 8 }
    ],
    problemAreas: [
      { file: 'src/utils/transformation.js', complexity: 15, type: 'complexity' },
      { file: 'src/components/DataGrid.jsx', complexity: 12, type: 'complexity' },
      { file: 'src/services/apiService.js', complexity: 11, type: 'complexity' }
    ]
  };
}

/**
 * Calculate health score based on all metrics
 * 
 * @param {Object} metrics - All collected metrics
 * @returns {number} Health score (0-100)
 */
function calculateHealthScore(metrics) {
  // Weights for different categories
  const weights = {
    testCoverage: 0.25,
    bundle: 0.15,
    performance: 0.20,
    accessibility: 0.20,
    technicalDebt: 0.20
  };
  
  // Calculate scores for each category (0-100)
  const scores = {
    testCoverage: Math.min(100, (metrics.testCoverage.overall.statements / config.testCoverage.threshold.statements) * 100),
    
    bundle: Math.min(100, (1 - (metrics.bundle.total.size / config.bundle.maxSize.total)) * 100),
    
    performance: Math.min(100, (1 - (metrics.performance.metrics.timeToInteractive / config.performance.thresholds.timeToInteractive)) * 100),
    
    accessibility: metrics.accessibility.score,
    
    technicalDebt: Math.min(100, (1 - (metrics.technicalDebt.metrics.complexity.average / config.technicalDebt.maxAllowed.complexity)) * 100)
  };
  
  // Calculate weighted average
  let totalScore = 0;
  let totalWeight = 0;
  
  for (const [category, weight] of Object.entries(weights)) {
    totalScore += scores[category] * weight;
    totalWeight += weight;
  }
  
  return Math.round(totalScore / totalWeight);
}

/**
 * Generate recommendations based on metrics
 * 
 * @param {Object} metrics - All collected metrics
 * @returns {Array} Recommendations
 */
function generateRecommendations(metrics) {
  const recommendations = [];
  
  // Test coverage recommendations
  if (metrics.testCoverage.overall.branches < config.testCoverage.threshold.branches) {
    recommendations.push({
      category: 'testCoverage',
      priority: 'high',
      message: `Improve branch coverage (${metrics.testCoverage.overall.branches}%) to meet threshold (${config.testCoverage.threshold.branches}%)`
    });
  }
  
  if (metrics.testCoverage.utils.statements < config.testCoverage.threshold.statements) {
    recommendations.push({
      category: 'testCoverage',
      priority: 'medium',
      message: `Improve utility functions test coverage (${metrics.testCoverage.utils.statements}%)`
    });
  }
  
  // Bundle size recommendations
  const largestModule = metrics.bundle.modules[Object.keys(metrics.bundle.modules).reduce((a, b) => 
    metrics.bundle.modules[a].size > metrics.bundle.modules[b].size ? a : b
  )];
  
  if (largestModule && largestModule.size > 300) {
    recommendations.push({
      category: 'bundle',
      priority: 'medium',
      message: `Consider splitting large module (${largestModule.name || 'vendor'}: ${largestModule.size}KB)`
    });
  }
  
  // Performance recommendations
  if (metrics.performance.metrics.maxJsExecutionTime > 300) {
    recommendations.push({
      category: 'performance',
      priority: 'high',
      message: `Reduce JavaScript execution time (${metrics.performance.metrics.maxJsExecutionTime}ms)`
    });
  }
  
  metrics.performance.slowestComponents.slice(0, 2).forEach(component => {
    if (component.renderTime > 50) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        message: `Optimize render performance of ${component.name} (${component.renderTime}ms)`
      });
    }
  });
  
  // Accessibility recommendations
  if (metrics.accessibility.score < config.accessibility.minScore) {
    recommendations.push({
      category: 'accessibility',
      priority: 'high',
      message: `Improve overall accessibility score (${metrics.accessibility.score}) to meet threshold (${config.accessibility.minScore})`
    });
  }
  
  metrics.accessibility.topIssues.filter(issue => issue.severity === 'high').forEach(issue => {
    recommendations.push({
      category: 'accessibility',
      priority: 'high',
      message: `Fix ${issue.count} ${issue.type} accessibility issues`
    });
  });
  
  // Technical debt recommendations
  metrics.technicalDebt.problemAreas.forEach(area => {
    if (area.complexity > config.technicalDebt.maxAllowed.complexity) {
      recommendations.push({
        category: 'technicalDebt',
        priority: 'medium',
        message: `Reduce complexity in ${area.file} (${area.complexity})`
      });
    }
  });
  
  if (metrics.technicalDebt.metrics.todos.critical > 0) {
    recommendations.push({
      category: 'technicalDebt',
      priority: 'high',
      message: `Address ${metrics.technicalDebt.metrics.todos.critical} critical TODOs in codebase`
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate HTML dashboard from metrics
 * 
 * @param {Object} metrics - All collected metrics
 * @param {number} healthScore - Overall health score
 * @param {Array} recommendations - Recommendations
 * @returns {string} HTML dashboard
 */
function generateHTMLDashboard(metrics, healthScore, recommendations) {
  // Generate dashboard HTML
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Quality Dashboard</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.5;
      color: #333;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f7;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 20px;
    }
    h1 {
      margin-top: 0;
      color: #1a1a1a;
    }
    .health-score {
      display: flex;
      align-items: center;
      margin: 15px 0;
    }
    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: conic-gradient(
        ${healthScore >= 90 ? '#4caf50' : healthScore >= 70 ? '#ff9800' : '#f44336'} ${healthScore}%, 
        #e0e0e0 0
      );
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      position: relative;
    }
    .score-circle::before {
      content: "";
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: white;
    }
    .score-value {
      position: relative;
      font-size: 32px;
      font-weight: bold;
      color: ${healthScore >= 90 ? '#388e3c' : healthScore >= 70 ? '#f57c00' : '#d32f2f'};
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      padding: 20px;
    }
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .metric-title {
      margin: 0;
      font-size: 18px;
      color: #1a1a1a;
    }
    .metric-status {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    .status-good {
      background-color: #e8f5e9;
      color: #388e3c;
    }
    .status-warning {
      background-color: #fff3e0;
      color: #f57c00;
    }
    .status-poor {
      background-color: #ffebee;
      color: #d32f2f;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0;
    }
    .metric-detail {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 14px;
    }
    .metric-detail-value {
      font-weight: 500;
    }
    .recommendations {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      padding: 20px;
      margin-bottom: 30px;
    }
    .recommendation {
      padding: 12px 16px;
      margin: 8px 0;
      border-radius: 4px;
      display: flex;
      align-items: center;
    }
    .priority-high {
      background-color: #ffebee;
      border-left: 4px solid #d32f2f;
    }
    .priority-medium {
      background-color: #fff3e0;
      border-left: 4px solid #f57c00;
    }
    .priority-low {
      background-color: #e8f5e9;
      border-left: 4px solid #388e3c;
    }
    .priority-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 12px;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #666;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Project Quality Dashboard</h1>
      <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <div class="health-score">
        <div class="score-circle">
          <span class="score-value">${healthScore}</span>
        </div>
        <div>
          <h2>Health Score</h2>
          <p>Overall quality assessment based on test coverage, performance, accessibility, and technical debt.</p>
        </div>
      </div>
    </header>
    
    <div class="dashboard-grid">
      <!-- Test Coverage Card -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Test Coverage</h3>
          <span class="metric-status ${metrics.testCoverage.isThresholdMet ? 'status-good' : 'status-warning'}">
            ${metrics.testCoverage.isThresholdMet ? 'Good' : 'Needs Improvement'}
          </span>
        </div>
        <div class="metric-value">${metrics.testCoverage.overall.statements.toFixed(1)}%</div>
        <div class="metric-detail">
          <span>Statements</span>
          <span class="metric-detail-value">${metrics.testCoverage.overall.statements.toFixed(1)}%</span>
        </div>
        <div class="metric-detail">
          <span>Branches</span>
          <span class="metric-detail-value">${metrics.testCoverage.overall.branches.toFixed(1)}%</span>
        </div>
        <div class="metric-detail">
          <span>Functions</span>
          <span class="metric-detail-value">${metrics.testCoverage.overall.functions.toFixed(1)}%</span>
        </div>
        <div class="metric-detail">
          <span>Lines</span>
          <span class="metric-detail-value">${metrics.testCoverage.overall.lines.toFixed(1)}%</span>
        </div>
      </div>
      
      <!-- Bundle Size Card -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Bundle Size</h3>
          <span class="metric-status ${metrics.bundle.isWithinLimits ? 'status-good' : 'status-warning'}">
            ${metrics.bundle.isWithinLimits ? 'Good' : 'Needs Optimization'}
          </span>
        </div>
        <div class="metric-value">${metrics.bundle.total.size.toFixed(0)} KB</div>
        <div class="metric-detail">
          <span>Main</span>
          <span class="metric-detail-value">${metrics.bundle.modules.main.size.toFixed(0)} KB</span>
        </div>
        <div class="metric-detail">
          <span>Vendor</span>
          <span class="metric-detail-value">${metrics.bundle.modules.vendor.size.toFixed(0)} KB</span>
        </div>
        <div class="metric-detail">
          <span>Gzipped Total</span>
          <span class="metric-detail-value">${metrics.bundle.total.sizeGzip.toFixed(0)} KB</span>
        </div>
      </div>
      
      <!-- Performance Card -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Performance</h3>
          <span class="metric-status ${metrics.performance.meetsThresholds ? 'status-good' : 'status-warning'}">
            ${metrics.performance.meetsThresholds ? 'Good' : 'Needs Optimization'}
          </span>
        </div>
        <div class="metric-value">${metrics.performance.metrics.timeToInteractive.toFixed(0)} ms</div>
        <div class="metric-detail">
          <span>First Contentful Paint</span>
          <span class="metric-detail-value">${metrics.performance.metrics.firstContentfulPaint.toFixed(0)} ms</span>
        </div>
        <div class="metric-detail">
          <span>Max JS Execution Time</span>
          <span class="metric-detail-value">${metrics.performance.metrics.maxJsExecutionTime.toFixed(0)} ms</span>
        </div>
        <div class="metric-detail">
          <span>Layout Shift</span>
          <span class="metric-detail-value">${metrics.performance.metrics.cumulativeLayoutShift.toFixed(2)}</span>
        </div>
      </div>
      
      <!-- Accessibility Card -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Accessibility</h3>
          <span class="metric-status ${metrics.accessibility.meetsStandards ? 'status-good' : 'status-warning'}">
            ${metrics.accessibility.meetsStandards ? 'Good' : 'Needs Improvement'}
          </span>
        </div>
        <div class="metric-value">${metrics.accessibility.score}/100</div>
        <div class="metric-detail">
          <span>Color Contrast</span>
          <span class="metric-detail-value">${metrics.accessibility.categories['color-contrast'].score}/100</span>
        </div>
        <div class="metric-detail">
          <span>Keyboard Navigation</span>
          <span class="metric-detail-value">${metrics.accessibility.categories['keyboard-navigation'].score}/100</span>
        </div>
        <div class="metric-detail">
          <span>ARIA Attributes</span>
          <span class="metric-detail-value">${metrics.accessibility.categories['aria-attributes'].score}/100</span>
        </div>
        <div class="metric-detail">
          <span>Total Issues</span>
          <span class="metric-detail-value">${Object.values(metrics.accessibility.categories).reduce((sum, cat) => sum + cat.issues, 0)}</span>
        </div>
      </div>
      
      <!-- Technical Debt Card -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Technical Debt</h3>
          <span class="metric-status ${metrics.technicalDebt.isUnderThreshold ? 'status-good' : 'status-warning'}">
            ${metrics.technicalDebt.isUnderThreshold ? 'Good' : 'Needs Attention'}
          </span>
        </div>
        <div class="metric-value">${metrics.technicalDebt.metrics.complexity.average.toFixed(1)}</div>
        <div class="metric-detail">
          <span>Complexity (Avg)</span>
          <span class="metric-detail-value">${metrics.technicalDebt.metrics.complexity.average.toFixed(1)}</span>
        </div>
        <div class="metric-detail">
          <span>Duplicate Code</span>
          <span class="metric-detail-value">${metrics.technicalDebt.metrics.duplicateCode.percentage.toFixed(1)}%</span>
        </div>
        <div class="metric-detail">
          <span>TODOs</span>
          <span class="metric-detail-value">${metrics.technicalDebt.metrics.todos.count}</span>
        </div>
        <div class="metric-detail">
          <span>Lines of Code</span>
          <span class="metric-detail-value">${metrics.technicalDebt.metrics.linesOfCode.toLocaleString()}</span>
        </div>
      </div>
    </div>
    
    <div class="recommendations">
      <h2>Recommendations</h2>
      ${recommendations.map(rec => `
        <div class="recommendation priority-${rec.priority}">
          <div class="priority-indicator" style="background-color: ${rec.priority === 'high' ? '#d32f2f' : rec.priority === 'medium' ? '#f57c00' : '#388e3c'}"></div>
          ${rec.message}
        </div>
      `).join('')}
    </div>
    
    <footer class="footer">
      <p>Generated by Quality Metrics Dashboard | Finishline Project</p>
    </footer>
  </div>
</body>
</html>
  `;
  
  return html;
}

/**
 * Generate Markdown report from metrics
 * 
 * @param {Object} metrics - All collected metrics
 * @param {number} healthScore - Overall health score
 * @param {Array} recommendations - Recommendations
 * @returns {string} Markdown report
 */
function generateMarkdownReport(metrics, healthScore, recommendations) {
  let report = `# Project Quality Report\n\n`;
  report += `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
  
  report += `## Health Score: ${healthScore}/100\n\n`;
  
  // Test Coverage
  report += `## Test Coverage\n\n`;
  report += `- Overall: ${metrics.testCoverage.overall.statements.toFixed(1)}%\n`;
  report += `- Statements: ${metrics.testCoverage.overall.statements.toFixed(1)}%\n`;
  report += `- Branches: ${metrics.testCoverage.overall.branches.toFixed(1)}%\n`;
  report += `- Functions: ${metrics.testCoverage.overall.functions.toFixed(1)}%\n`;
  report += `- Lines: ${metrics.testCoverage.overall.lines.toFixed(1)}%\n\n`;
  
  // Bundle Size
  report += `## Bundle Size\n\n`;
  report += `- Total: ${metrics.bundle.total.size.toFixed(0)} KB\n`;
  report += `- Main: ${metrics.bundle.modules.main.size.toFixed(0)} KB\n`;
  report += `- Vendor: ${metrics.bundle.modules.vendor.size.toFixed(0)} KB\n`;
  report += `- Gzipped Total: ${metrics.bundle.total.sizeGzip.toFixed(0)} KB\n\n`;
  
  // Performance
  report += `## Performance\n\n`;
  report += `- Time to Interactive: ${metrics.performance.metrics.timeToInteractive.toFixed(0)} ms\n`;
  report += `- First Contentful Paint: ${metrics.performance.metrics.firstContentfulPaint.toFixed(0)} ms\n`;
  report += `- Max JS Execution Time: ${metrics.performance.metrics.maxJsExecutionTime.toFixed(0)} ms\n`;
  report += `- Cumulative Layout Shift: ${metrics.performance.metrics.cumulativeLayoutShift.toFixed(2)}\n\n`;
  
  // Slowest Components
  report += `### Slowest Components\n\n`;
  metrics.performance.slowestComponents.forEach(comp => {
    report += `- ${comp.name}: ${comp.renderTime} ms\n`;
  });
  report += `\n`;
  
  // Accessibility
  report += `## Accessibility\n\n`;
  report += `- Overall Score: ${metrics.accessibility.score}/100\n`;
  report += `- Color Contrast: ${metrics.accessibility.categories['color-contrast'].score}/100\n`;
  report += `- Keyboard Navigation: ${metrics.accessibility.categories['keyboard-navigation'].score}/100\n`;
  report += `- ARIA Attributes: ${metrics.accessibility.categories['aria-attributes'].score}/100\n\n`;
  
  // Top Accessibility Issues
  report += `### Top Accessibility Issues\n\n`;
  metrics.accessibility.topIssues.forEach(issue => {
    report += `- ${issue.type}: ${issue.count} issues (${issue.severity} severity)\n`;
  });
  report += `\n`;
  
  // Technical Debt
  report += `## Technical Debt\n\n`;
  report += `- Average Complexity: ${metrics.technicalDebt.metrics.complexity.average.toFixed(1)}\n`;
  report += `- Duplicate Code: ${metrics.technicalDebt.metrics.duplicateCode.percentage.toFixed(1)}%\n`;
  report += `- TODOs: ${metrics.technicalDebt.metrics.todos.count} (${metrics.technicalDebt.metrics.todos.critical} critical)\n`;
  report += `- Lines of Code: ${metrics.technicalDebt.metrics.linesOfCode.toLocaleString()}\n\n`;
  
  // Problem Areas
  report += `### Problem Areas\n\n`;
  metrics.technicalDebt.problemAreas.forEach(area => {
    report += `- ${area.file}: ${area.complexity} complexity\n`;
  });
  report += `\n`;
  
  // Recommendations
  report += `## Recommendations\n\n`;
  
  // Group by category
  const categories = {
    testCoverage: { name: 'Test Coverage', items: [] },
    bundle: { name: 'Bundle Size', items: [] },
    performance: { name: 'Performance', items: [] },
    accessibility: { name: 'Accessibility', items: [] },
    technicalDebt: { name: 'Technical Debt', items: [] }
  };
  
  recommendations.forEach(rec => {
    categories[rec.category].items.push(rec);
  });
  
  Object.values(categories).forEach(category => {
    if (category.items.length > 0) {
      report += `### ${category.name}\n\n`;
      
      category.items.forEach(rec => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟠' : '🟢';
        report += `- ${priority} ${rec.message}\n`;
      });
      
      report += `\n`;
    }
  });
  
  return report;
}

/**
 * Run the quality dashboard
 * 
 * @param {Object} options - Options for the dashboard
 * @returns {Object} Dashboard results
 */
function runQualityDashboard(options = {}) {
  console.log('Generating Quality Metrics Dashboard...');
  
  // Collect metrics
  const testCoverage = collectTestCoverage();
  const bundle = collectBundleMetrics();
  const performance = collectPerformanceMetrics();
  const accessibility = collectAccessibilityMetrics();
  const technicalDebt = collectTechnicalDebtMetrics();
  
  // Combine metrics
  const metrics = {
    testCoverage,
    bundle,
    performance,
    accessibility,
    technicalDebt
  };
  
  // Calculate health score
  const healthScore = calculateHealthScore(metrics);
  
  // Generate recommendations
  const recommendations = generateRecommendations(metrics);
  
  // Generate HTML dashboard
  const html = generateHTMLDashboard(metrics, healthScore, recommendations);
  const htmlPath = path.resolve('./quality-dashboard.html');
  fs.writeFileSync(htmlPath, html);
  
  // Generate Markdown report
  const markdown = generateMarkdownReport(metrics, healthScore, recommendations);
  const mdPath = path.resolve('./quality-report.md');
  fs.writeFileSync(mdPath, markdown);
  
  console.log(`\nQuality dashboard generated:`);
  console.log(`- HTML Dashboard: ${htmlPath}`);
  console.log(`- Markdown Report: ${mdPath}`);
  
  // Print summary
  console.log(`\nHealth Score: ${healthScore}/100`);
  console.log(`Test Coverage: ${testCoverage.overall.statements.toFixed(1)}%`);
  console.log(`Bundle Size: ${bundle.total.size.toFixed(0)} KB`);
  console.log(`Performance: ${performance.metrics.timeToInteractive.toFixed(0)} ms (Time to Interactive)`);
  console.log(`Accessibility: ${accessibility.score}/100`);
  console.log(`Technical Debt: ${technicalDebt.metrics.complexity.average.toFixed(1)} (Avg Complexity)`);
  
  if (recommendations.length > 0) {
    console.log('\nTop Recommendations:');
    recommendations.slice(0, 3).forEach(rec => {
      const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟠' : '🟢';
      console.log(`${priority} ${rec.message}`);
    });
  }
  
  return {
    metrics,
    healthScore,
    recommendations,
    paths: {
      html: htmlPath,
      markdown: mdPath
    }
  };
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

// Run the dashboard
runQualityDashboard(options);

module.exports = {
  runQualityDashboard,
  calculateHealthScore,
  generateRecommendations,
  generateHTMLDashboard,
  generateMarkdownReport
};