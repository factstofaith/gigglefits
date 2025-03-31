/**
 * Performance Monitoring System
 * 
 * Comprehensive monitoring system for runtime performance tracking,
 * with metrics collection, analysis, and reporting capabilities.
 */

const fs = require('fs');
const path = require('path');

// Configuration for performance monitoring
const defaultConfig = {
  // Thresholds for performance metrics
  thresholds: {
    fcp: 1000, // First Contentful Paint (ms)
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100,  // First Input Delay (ms)
    cls: 0.1,  // Cumulative Layout Shift
    ttfb: 600, // Time to First Byte (ms)
    tbt: 300,  // Total Blocking Time (ms)
  },
  // Components to monitor specifically
  components: [
    'DataGrid',
    'Chart',
    'Dashboard',
    'FileUploader'
  ],
  // Sampling rate (percentage of sessions to monitor)
  samplingRate: 100,
  // Maximum events to track per session
  maxEventsPerSession: 100,
  // Directory to store performance reports
  reportsDir: 'performance-reports',
  // Enable detailed logging
  verbose: false
};

/**
 * Initialize the performance monitoring system
 * 
 * @param {Object} customConfig - Custom configuration to override defaults
 * @returns {Object} Performance monitoring API
 */
function initializeMonitoring(customConfig = {}) {
  // Merge default and custom configurations
  const config = { ...defaultConfig, ...customConfig };
  
  // State to store metrics
  const metrics = {
    webVitals: [],
    resourceLoading: [],
    componentRenderTimes: {},
    userInteractions: [],
    errors: [],
    navigationTiming: [],
  };
  
  /**
   * Record Web Vitals metrics
   * 
   * @param {Object} vital - Web Vital metric
   */
  function recordWebVital(vital) {
    metrics.webVitals.push({
      name: vital.name,
      value: vital.value,
      rating: vital.rating, // 'good', 'needs-improvement', or 'poor'
      timestamp: Date.now(),
    });
    
    // Log if verbose
    if (config.verbose) {
      console.log(`Web Vital: ${vital.name} = ${vital.value} (${vital.rating})`);
    }
    
    // Check against thresholds
    const threshold = config.thresholds[vital.name.toLowerCase()];
    if (threshold && vital.value > threshold) {
      console.warn(`${vital.name} exceeds threshold: ${vital.value}ms > ${threshold}ms`);
    }
  }
  
  /**
   * Record resource loading performance
   * 
   * @param {Object} resource - Resource timing entry
   */
  function recordResourceTiming(resource) {
    metrics.resourceLoading.push({
      name: resource.name,
      initiatorType: resource.initiatorType,
      duration: resource.duration,
      transferSize: resource.transferSize,
      timestamp: Date.now(),
    });
    
    // Log slow resource loads
    if (resource.duration > 1000 && config.verbose) {
      console.warn(`Slow resource load: ${resource.name} (${resource.duration}ms)`);
    }
  }
  
  /**
   * Record component render time
   * 
   * @param {string} componentName - Name of the component
   * @param {number} renderTime - Time taken to render in ms
   * @param {Object} props - Component props (optional)
   */
  function recordComponentRender(componentName, renderTime, props = {}) {
    // Initialize component tracking if it doesn't exist
    if (!metrics.componentRenderTimes[componentName]) {
      metrics.componentRenderTimes[componentName] = [];
    }
    
    metrics.componentRenderTimes[componentName].push({
      renderTime,
      timestamp: Date.now(),
      propsSnapshot: JSON.stringify(props).length > 1000 
        ? '(props too large to store)' 
        : props
    });
    
    // Log slow renders
    if (renderTime > 50 && config.verbose) {
      console.warn(`Slow render: ${componentName} (${renderTime}ms)`);
    }
  }
  
  /**
   * Record user interaction
   * 
   * @param {string} action - User action description
   * @param {number} responseTime - Time to respond to user action
   * @param {Object} details - Additional details about the interaction
   */
  function recordUserInteraction(action, responseTime, details = {}) {
    metrics.userInteractions.push({
      action,
      responseTime,
      details,
      timestamp: Date.now(),
    });
    
    // Log slow interactions
    if (responseTime > 100 && config.verbose) {
      console.warn(`Slow interaction: ${action} (${responseTime}ms)`);
    }
  }
  
  /**
   * Record performance error
   * 
   * @param {string} message - Error message
   * @param {string} category - Error category
   * @param {Object} context - Error context
   */
  function recordError(message, category, context = {}) {
    metrics.errors.push({
      message,
      category,
      context,
      timestamp: Date.now(),
    });
    
    console.error(`Performance error (${category}): ${message}`, context);
  }
  
  /**
   * Record navigation timing metrics
   * 
   * @param {Object} timingData - Navigation timing data
   */
  function recordNavigationTiming(timingData) {
    metrics.navigationTiming.push({
      ...timingData,
      timestamp: Date.now(),
    });
    
    // Log if verbose
    if (config.verbose) {
      console.log('Navigation timing:', timingData);
    }
  }
  
  /**
   * Calculate performance metrics summaries
   * 
   * @returns {Object} Metrics summaries
   */
  function calculateMetricsSummary() {
    // Web Vitals summary
    const webVitalsSummary = {};
    metrics.webVitals.forEach(vital => {
      if (!webVitalsSummary[vital.name]) {
        webVitalsSummary[vital.name] = {
          values: [],
          min: Number.MAX_VALUE,
          max: 0,
          avg: 0,
          count: 0,
          ratings: { good: 0, 'needs-improvement': 0, poor: 0 }
        };
      }
      
      const summary = webVitalsSummary[vital.name];
      summary.values.push(vital.value);
      summary.min = Math.min(summary.min, vital.value);
      summary.max = Math.max(summary.max, vital.value);
      summary.count++;
      summary.ratings[vital.rating]++;
    });
    
    // Calculate averages
    Object.keys(webVitalsSummary).forEach(key => {
      const summary = webVitalsSummary[key];
      summary.avg = summary.values.reduce((sum, val) => sum + val, 0) / summary.count;
      delete summary.values; // Remove values array to save space
    });
    
    // Component render times summary
    const componentRenderSummary = {};
    Object.keys(metrics.componentRenderTimes).forEach(component => {
      const renders = metrics.componentRenderTimes[component];
      const renderTimes = renders.map(r => r.renderTime);
      
      componentRenderSummary[component] = {
        min: Math.min(...renderTimes),
        max: Math.max(...renderTimes),
        avg: renderTimes.reduce((sum, val) => sum + val, 0) / renderTimes.length,
        count: renderTimes.length,
        // Calculate 95th percentile
        p95: calculatePercentile(renderTimes, 95)
      };
    });
    
    return {
      webVitals: webVitalsSummary,
      componentRenderTimes: componentRenderSummary,
      resourceCount: metrics.resourceLoading.length,
      interactionCount: metrics.userInteractions.length,
      errorCount: metrics.errors.length,
      timestamp: Date.now()
    };
  }
  
  /**
   * Calculate a percentile value from an array
   * 
   * @param {Array<number>} values - Array of numeric values
   * @param {number} percentile - Percentile to calculate (0-100)
   * @returns {number} Percentile value
   */
  function calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
  
  /**
   * Generate a performance report
   * 
   * @param {string} format - Output format (json, html, console)
   * @returns {string} Formatted report
   */
  function generateReport(format = 'json') {
    const summary = calculateMetricsSummary();
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          summary,
          detailedMetrics: metrics,
          config,
          timestamp: Date.now()
        }, null, 2);
        
      case 'html':
        return generateHtmlReport(summary);
        
      case 'console':
      default:
        return generateConsoleReport(summary);
    }
  }
  
  /**
   * Generate an HTML performance report
   * 
   * @param {Object} summary - Metrics summary
   * @returns {string} HTML report
   */
  function generateHtmlReport(summary) {
    // Simplified HTML report template
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Performance Report - ${new Date().toISOString()}</title>
      <style>
        body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 1200px; margin: 0 auto; padding: 2rem; }
        h1, h2, h3 { color: #333; }
        .card { background: #f9f9f9; border-radius: 4px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #eee; }
        th { background: #f5f5f5; }
        .good { color: green; }
        .warning { color: orange; }
        .error { color: red; }
      </style>
    </head>
    <body>
      <h1>Performance Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      
      <h2>Web Vitals</h2>
      <div class="card">
        <table>
          <tr>
            <th>Metric</th>
            <th>Average</th>
            <th>Min</th>
            <th>Max</th>
            <th>Count</th>
            <th>Ratings</th>
          </tr>
          ${Object.entries(summary.webVitals).map(([name, data]) => `
          <tr>
            <td>${name}</td>
            <td>${data.avg.toFixed(2)}</td>
            <td>${data.min.toFixed(2)}</td>
            <td>${data.max.toFixed(2)}</td>
            <td>${data.count}</td>
            <td>
              <span class="good">Good: ${data.ratings.good}</span>,
              <span class="warning">Needs Improvement: ${data.ratings['needs-improvement']}</span>,
              <span class="error">Poor: ${data.ratings.poor}</span>
            </td>
          </tr>
          `).join('')}
        </table>
      </div>
      
      <h2>Component Render Times</h2>
      <div class="card">
        <table>
          <tr>
            <th>Component</th>
            <th>Average (ms)</th>
            <th>Min (ms)</th>
            <th>Max (ms)</th>
            <th>95th Percentile (ms)</th>
            <th>Render Count</th>
          </tr>
          ${Object.entries(summary.componentRenderTimes).map(([name, data]) => `
          <tr>
            <td>${name}</td>
            <td>${data.avg.toFixed(2)}</td>
            <td>${data.min.toFixed(2)}</td>
            <td>${data.max.toFixed(2)}</td>
            <td>${data.p95.toFixed(2)}</td>
            <td>${data.count}</td>
          </tr>
          `).join('')}
        </table>
      </div>
      
      <h2>Summary Statistics</h2>
      <div class="card">
        <p>Resource Load Count: ${summary.resourceCount}</p>
        <p>User Interaction Count: ${summary.interactionCount}</p>
        <p>Error Count: ${summary.errorCount}</p>
      </div>
    </body>
    </html>
    `;
  }
  
  /**
   * Generate a console-friendly performance report
   * 
   * @param {Object} summary - Metrics summary
   * @returns {string} Console report
   */
  function generateConsoleReport(summary) {
    let report = '\n=== PERFORMANCE MONITORING REPORT ===\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Web Vitals
    report += 'WEB VITALS:\n';
    Object.entries(summary.webVitals).forEach(([name, data]) => {
      report += `  ${name}: avg=${data.avg.toFixed(2)}ms, min=${data.min.toFixed(2)}ms, max=${data.max.toFixed(2)}ms, count=${data.count}\n`;
      report += `    Ratings: good=${data.ratings.good}, needs-improvement=${data.ratings['needs-improvement']}, poor=${data.ratings.poor}\n`;
    });
    
    // Component Render Times
    report += '\nCOMPONENT RENDER TIMES:\n';
    Object.entries(summary.componentRenderTimes).forEach(([name, data]) => {
      report += `  ${name}: avg=${data.avg.toFixed(2)}ms, min=${data.min.toFixed(2)}ms, max=${data.max.toFixed(2)}ms, p95=${data.p95.toFixed(2)}ms, count=${data.count}\n`;
    });
    
    // Summary Stats
    report += '\nSUMMARY STATISTICS:\n';
    report += `  Resource Load Count: ${summary.resourceCount}\n`;
    report += `  User Interaction Count: ${summary.interactionCount}\n`;
    report += `  Error Count: ${summary.errorCount}\n`;
    
    return report;
  }
  
  /**
   * Save the performance report to a file
   * 
   * @param {string} format - Output format (json, html, console)
   * @returns {string} Path to the saved report
   */
  function saveReport(format = 'json') {
    const report = generateReport(format);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = format === 'html' ? 'html' : format === 'json' ? 'json' : 'txt';
    const reportDir = path.resolve(config.reportsDir);
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const filePath = path.join(reportDir, `performance-report-${timestamp}.${extension}`);
    fs.writeFileSync(filePath, report);
    
    console.log(`Performance report saved to: ${filePath}`);
    return filePath;
  }
  
  /**
   * Clear all collected metrics
   */
  function clearMetrics() {
    metrics.webVitals = [];
    metrics.resourceLoading = [];
    metrics.componentRenderTimes = {};
    metrics.userInteractions = [];
    metrics.errors = [];
    metrics.navigationTiming = [];
    
    console.log('Performance metrics cleared');
  }
  
  /**
   * Check if metrics exceed thresholds
   * 
   * @returns {Object} Threshold violations
   */
  function checkThresholds() {
    const violations = {};
    
    // Check Web Vitals against thresholds
    metrics.webVitals.forEach(vital => {
      const threshold = config.thresholds[vital.name.toLowerCase()];
      if (threshold && vital.value > threshold) {
        if (!violations[vital.name]) {
          violations[vital.name] = [];
        }
        violations[vital.name].push({
          value: vital.value,
          threshold,
          timestamp: vital.timestamp
        });
      }
    });
    
    // Check component render times
    Object.entries(metrics.componentRenderTimes).forEach(([component, renders]) => {
      const slowRenders = renders.filter(r => r.renderTime > 50);
      if (slowRenders.length > 0) {
        violations[`Component: ${component}`] = slowRenders.map(r => ({
          value: r.renderTime,
          threshold: 50,
          timestamp: r.timestamp
        }));
      }
    });
    
    return violations;
  }
  
  // Return public API
  return {
    recordWebVital,
    recordResourceTiming,
    recordComponentRender,
    recordUserInteraction,
    recordError,
    recordNavigationTiming,
    calculateMetricsSummary,
    generateReport,
    saveReport,
    clearMetrics,
    checkThresholds,
    // Expose metrics for testing/debugging
    __getMetrics: () => ({ ...metrics }),
    __getConfig: () => ({ ...config })
  };
}

/**
 * Run the performance monitor
 * 
 * @param {Object} options - Monitor options
 * @returns {Object} Monitoring results
 */
function runMonitor(options = {}) {
  console.log('Running performance monitor...');
  
  const monitor = initializeMonitoring({
    verbose: options.detailed || false,
    reportsDir: options.outputDir || 'performance-reports'
  });
  
  // Generate some sample test data for demo/testing purposes
  generateSampleData(monitor);
  
  // Generate and save report
  const reportPath = monitor.saveReport(options.outputFormat || 'console');
  
  // Check for threshold violations
  const violations = monitor.checkThresholds();
  const hasViolations = Object.keys(violations).length > 0;
  
  if (hasViolations) {
    console.warn('Performance threshold violations detected:');
    Object.entries(violations).forEach(([metric, instances]) => {
      console.warn(`  ${metric}: ${instances.length} violations`);
    });
  } else {
    console.log('No performance threshold violations detected');
  }
  
  return {
    reportPath,
    violations,
    hasViolations,
    summary: monitor.calculateMetricsSummary()
  };
}

/**
 * Generate sample performance data for testing
 * 
 * @param {Object} monitor - Performance monitor instance
 */
function generateSampleData(monitor) {
  // Sample Web Vitals
  const webVitals = [
    { name: 'FCP', value: 850, rating: 'good' },
    { name: 'LCP', value: 2200, rating: 'good' },
    { name: 'CLS', value: 0.05, rating: 'good' },
    { name: 'FID', value: 95, rating: 'good' },
    { name: 'TTFB', value: 450, rating: 'good' },
    { name: 'LCP', value: 3100, rating: 'needs-improvement' },
    { name: 'FID', value: 180, rating: 'needs-improvement' },
    { name: 'CLS', value: 0.18, rating: 'poor' }
  ];
  
  webVitals.forEach(vital => monitor.recordWebVital(vital));
  
  // Sample Resource Timing
  const resources = [
    { name: 'main.js', initiatorType: 'script', duration: 120, transferSize: 45000 },
    { name: 'styles.css', initiatorType: 'link', duration: 80, transferSize: 12000 },
    { name: 'hero-image.jpg', initiatorType: 'img', duration: 350, transferSize: 84000 },
    { name: 'api/data', initiatorType: 'fetch', duration: 210, transferSize: 5600 },
    { name: 'large-video.mp4', initiatorType: 'video', duration: 1250, transferSize: 2800000 },
  ];
  
  resources.forEach(resource => monitor.recordResourceTiming(resource));
  
  // Sample Component Render Times
  const components = [
    { name: 'Header', times: [5, 12, 8, 6, 5] },
    { name: 'DataGrid', times: [45, 52, 120, 38, 41, 63, 110] },
    { name: 'Chart', times: [68, 72, 64, 59, 210, 65] },
    { name: 'Footer', times: [3, 2, 4, 3, 3] },
    { name: 'Dashboard', times: [85, 92, 78, 88, 145, 81] }
  ];
  
  components.forEach(component => {
    component.times.forEach(time => {
      monitor.recordComponentRender(component.name, time, { sampleProp: true });
    });
  });
  
  // Sample User Interactions
  const interactions = [
    { action: 'button_click', responseTime: 35, details: { buttonId: 'submit' } },
    { action: 'form_submit', responseTime: 120, details: { formId: 'signup' } },
    { action: 'data_filter', responseTime: 85, details: { filter: 'date_range' } },
    { action: 'accordion_toggle', responseTime: 15, details: { accordionId: 'faq' } },
    { action: 'modal_open', responseTime: 45, details: { modalId: 'details' } },
    { action: 'infinite_scroll', responseTime: 180, details: { page: 2 } }
  ];
  
  interactions.forEach(interaction => {
    monitor.recordUserInteraction(
      interaction.action, 
      interaction.responseTime, 
      interaction.details
    );
  });
  
  // Sample Errors
  const errors = [
    { message: 'Failed to load resource', category: 'resource_loading', context: { url: 'images/icon.png' } },
    { message: 'Component failed to render', category: 'rendering', context: { component: 'UserProfile' } },
    { message: 'API request timeout', category: 'api', context: { endpoint: '/api/data', timeout: 3000 } }
  ];
  
  errors.forEach(error => {
    monitor.recordError(error.message, error.category, error.context);
  });
  
  // Sample Navigation Timing
  monitor.recordNavigationTiming({
    navigationStart: 0,
    fetchStart: 15,
    domainLookupStart: 20,
    domainLookupEnd: 35,
    connectStart: 40,
    connectEnd: 60,
    requestStart: 65,
    responseStart: 120,
    responseEnd: 150,
    domLoading: 155,
    domInteractive: 380,
    domContentLoadedEventStart: 390,
    domContentLoadedEventEnd: 410,
    domComplete: 620,
    loadEventStart: 625,
    loadEventEnd: 640
  });
}

module.exports = { initializeMonitoring, runMonitor };