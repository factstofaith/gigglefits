/**
 * Error Tracking & Reporting System
 * 
 * Comprehensive error tracking system with categorization,
 * reporting, and recovery strategies.
 */

const fs = require('fs');
const path = require('path');

// Default configuration for error tracking
const defaultConfig = {
  // Maximum errors to store in memory
  maxErrors: 1000,
  // Categories to track
  categories: [
    'api',
    'rendering',
    'runtime',
    'resource',
    'promise',
    'network',
    'state',
    'validation',
    'authentication',
    'authorization',
    'unknown'
  ],
  // Directory to store error logs
  logsDir: 'error-logs',
  // Enable detailed logging
  verbose: false,
  // Error sampling rate (percentage of errors to record)
  samplingRate: 100,
  // Max stack trace length
  maxStackLength: 50,
  // Group similar errors
  groupSimilarErrors: true,
  // Enable automatic recovery for recoverable errors
  enableAutoRecovery: true
};

/**
 * Initialize the error tracking system
 * 
 * @param {Object} customConfig - Custom configuration to override defaults
 * @returns {Object} Error tracker API
 */
function initializeErrorTracker(customConfig = {}) {
  // Merge default and custom configurations
  const config = { ...defaultConfig, ...customConfig };
  
  // State to store errors
  const errors = [];
  const errorGroups = {};
  const recoveryStrategies = {};
  
  // Register default recovery strategies
  registerDefaultRecoveryStrategies();
  
  /**
   * Register default recovery strategies for common errors
   */
  function registerDefaultRecoveryStrategies() {
    // Network error recovery
    registerRecoveryStrategy('network', (error) => {
      return {
        action: 'retry',
        maxAttempts: 3,
        delay: 1000,
        backoff: 1.5,
        recoverable: true
      };
    });
    
    // API error recovery
    registerRecoveryStrategy('api', (error) => {
      if (error.status === 401) {
        return {
          action: 'refresh_auth',
          redirectTo: '/login',
          recoverable: false
        };
      } else if (error.status === 429) {
        return {
          action: 'retry',
          delay: 5000,
          maxAttempts: 3,
          recoverable: true
        };
      } else if (error.status >= 500) {
        return {
          action: 'retry',
          delay: 2000,
          maxAttempts: 2,
          recoverable: true
        };
      }
      return { action: 'none', recoverable: false };
    });
    
    // Resource loading error recovery
    registerRecoveryStrategy('resource', (error) => {
      return {
        action: 'retry',
        maxAttempts: 2,
        delay: 1000,
        recoverable: true
      };
    });
    
    // State management error recovery
    registerRecoveryStrategy('state', (error) => {
      return {
        action: 'reset_state',
        recoverable: true
      };
    });
  }
  
  /**
   * Track a new error
   * 
   * @param {Error|Object} error - Error object or details
   * @param {string} category - Error category
   * @param {Object} context - Additional context
   * @returns {string} Error ID
   */
  function trackError(error, category = 'unknown', context = {}) {
    // Apply sampling rate
    if (Math.random() * 100 > config.samplingRate) {
      return null;
    }
    
    // Ensure category is valid
    if (!config.categories.includes(category)) {
      category = 'unknown';
    }
    
    // Create error record
    const errorRecord = {
      id: generateErrorId(),
      timestamp: Date.now(),
      category,
      message: error.message || String(error),
      stack: processStack(error.stack),
      context: sanitizeContext(context),
      url: context.url || (typeof window !== 'undefined' ? window.location.href : null),
      count: 1,
      lastOccurrence: Date.now()
    };
    
    // Check if we should group similar errors
    if (config.groupSimilarErrors) {
      const groupKey = generateGroupKey(errorRecord);
      if (errorGroups[groupKey]) {
        // Increment count for existing group
        errorGroups[groupKey].count++;
        errorGroups[groupKey].lastOccurrence = Date.now();
        errorGroups[groupKey].context.occurrences = errorGroups[groupKey].context.occurrences || [];
        errorGroups[groupKey].context.occurrences.push({
          timestamp: Date.now(),
          context: errorRecord.context
        });
        
        if (config.verbose) {
          console.log(`Grouped error: ${errorRecord.message} (${errorGroups[groupKey].count} occurrences)`);
        }
        
        return errorGroups[groupKey].id;
      } else {
        // Create new group
        errorGroups[groupKey] = errorRecord;
      }
    }
    
    // Add error to log
    errors.push(errorRecord);
    
    // Enforce max errors limit
    if (errors.length > config.maxErrors) {
      errors.shift();
    }
    
    // Log error if verbose
    if (config.verbose) {
      console.error(`Error tracked [${category}]: ${errorRecord.message}`);
    }
    
    // Attempt recovery if enabled
    if (config.enableAutoRecovery) {
      const recovery = getRecoveryStrategy(errorRecord);
      if (recovery && recovery.recoverable) {
        executeRecoveryStrategy(errorRecord, recovery);
      }
    }
    
    return errorRecord.id;
  }
  
  /**
   * Sanitize context object to remove sensitive data
   * 
   * @param {Object} context - Context object
   * @returns {Object} Sanitized context
   */
  function sanitizeContext(context) {
    const sanitized = { ...context };
    
    // Remove potentially sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'credential'];
    
    const sanitizeObj = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      Object.keys(obj).forEach(key => {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObj(obj[key]);
        }
      });
      
      return obj;
    };
    
    return sanitizeObj(sanitized);
  }
  
  /**
   * Process and normalize stack trace
   * 
   * @param {string} stack - Error stack trace
   * @returns {string} Normalized stack trace
   */
  function processStack(stack) {
    if (!stack) return 'No stack trace available';
    
    // Limit stack length
    const lines = stack.split('\n');
    if (lines.length > config.maxStackLength) {
      return lines.slice(0, config.maxStackLength).join('\n') + 
        `\n... (${lines.length - config.maxStackLength} more lines)`;
    }
    
    return stack;
  }
  
  /**
   * Generate a unique error ID
   * 
   * @returns {string} Unique error ID
   */
  function generateErrorId() {
    return 'err_' + Date.now().toString(36) + '_' + 
      Math.random().toString(36).substring(2, 10);
  }
  
  /**
   * Generate a key for grouping similar errors
   * 
   * @param {Object} error - Error record
   * @returns {string} Group key
   */
  function generateGroupKey(error) {
    // Create key based on error message and category
    // Normalize message by removing dynamic parts like timestamps and IDs
    const normalizedMessage = error.message
      .replace(/\d+/g, 'XX')  // Replace numbers with XX
      .replace(/\b[0-9a-f]{8,}\b/g, 'ID')  // Replace IDs with ID
      .replace(/[-_.@]/g, '_');  // Normalize separators
    
    return `${error.category}:${normalizedMessage}`;
  }
  
  /**
   * Register a recovery strategy for a specific error category
   * 
   * @param {string} category - Error category
   * @param {Function} strategyFn - Strategy function that returns recovery instructions
   */
  function registerRecoveryStrategy(category, strategyFn) {
    if (!config.categories.includes(category)) {
      console.warn(`Unknown error category: ${category}`);
      return;
    }
    
    recoveryStrategies[category] = strategyFn;
    
    if (config.verbose) {
      console.log(`Registered recovery strategy for ${category} errors`);
    }
  }
  
  /**
   * Get recovery strategy for a specific error
   * 
   * @param {Object} error - Error record
   * @returns {Object|null} Recovery strategy or null if none available
   */
  function getRecoveryStrategy(error) {
    const strategyFn = recoveryStrategies[error.category];
    
    if (!strategyFn) return null;
    
    try {
      return strategyFn(error);
    } catch (e) {
      console.error('Error determining recovery strategy:', e);
      return null;
    }
  }
  
  /**
   * Execute a recovery strategy
   * 
   * @param {Object} error - Error record
   * @param {Object} strategy - Recovery strategy
   */
  function executeRecoveryStrategy(error, strategy) {
    if (!strategy || !strategy.action) return;
    
    if (config.verbose) {
      console.log(`Executing recovery strategy for ${error.category} error: ${strategy.action}`);
    }
    
    // Mock implementation - in a real app, these would be actual recovery actions
    switch (strategy.action) {
      case 'retry':
        if (config.verbose) {
          console.log(`Would retry operation with delay ${strategy.delay}ms, max attempts: ${strategy.maxAttempts}`);
        }
        break;
      case 'refresh_auth':
        if (config.verbose) {
          console.log(`Would refresh authentication token and redirect to: ${strategy.redirectTo}`);
        }
        break;
      case 'reset_state':
        if (config.verbose) {
          console.log(`Would reset application state to recover`);
        }
        break;
      default:
        if (config.verbose) {
          console.log(`Unknown recovery action: ${strategy.action}`);
        }
    }
  }
  
  /**
   * Generate error analytics
   * 
   * @returns {Object} Error analytics
   */
  function generateAnalytics() {
    const categories = {};
    const timeDistribution = {
      last5min: 0,
      last15min: 0,
      last1h: 0,
      last24h: 0,
      older: 0
    };
    
    // Time thresholds
    const now = Date.now();
    const min5 = 5 * 60 * 1000;
    const min15 = 15 * 60 * 1000;
    const hour1 = 60 * 60 * 1000;
    const hours24 = 24 * 60 * 60 * 1000;
    
    // Process errors
    const allErrors = config.groupSimilarErrors ? Object.values(errorGroups) : errors;
    
    allErrors.forEach(error => {
      // Category distribution
      if (!categories[error.category]) {
        categories[error.category] = 0;
      }
      categories[error.category] += error.count || 1;
      
      // Time distribution (using last occurrence for grouped errors)
      const timestamp = error.lastOccurrence || error.timestamp;
      const age = now - timestamp;
      
      if (age < min5) {
        timeDistribution.last5min += error.count || 1;
      } else if (age < min15) {
        timeDistribution.last15min += error.count || 1;
      } else if (age < hour1) {
        timeDistribution.last1h += error.count || 1;
      } else if (age < hours24) {
        timeDistribution.last24h += error.count || 1;
      } else {
        timeDistribution.older += error.count || 1;
      }
    });
    
    // Top errors
    const sortedErrors = [...allErrors].sort((a, b) => {
      return (b.count || 1) - (a.count || 1);
    });
    
    const topErrors = sortedErrors.slice(0, 10).map(error => ({
      id: error.id,
      message: error.message,
      category: error.category,
      count: error.count || 1,
      lastOccurrence: error.lastOccurrence || error.timestamp
    }));
    
    return {
      totalErrors: allErrors.reduce((total, error) => total + (error.count || 1), 0),
      uniqueErrors: allErrors.length,
      categoryDistribution: categories,
      timeDistribution,
      topErrors,
      timestamp: now
    };
  }
  
  /**
   * Generate an error report
   * 
   * @param {string} format - Output format (json, html, console)
   * @returns {string} Formatted report
   */
  function generateReport(format = 'json') {
    const analytics = generateAnalytics();
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          analytics,
          errors: config.groupSimilarErrors ? Object.values(errorGroups) : errors,
          config,
          timestamp: Date.now()
        }, null, 2);
        
      case 'html':
        return generateHtmlReport(analytics);
        
      case 'console':
      default:
        return generateConsoleReport(analytics);
    }
  }
  
  /**
   * Generate an HTML error report
   * 
   * @param {Object} analytics - Error analytics
   * @returns {string} HTML report
   */
  function generateHtmlReport(analytics) {
    // Simplified HTML report template
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Error Report - ${new Date().toISOString()}</title>
      <style>
        body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 1200px; margin: 0 auto; padding: 2rem; }
        h1, h2, h3 { color: #333; }
        .card { background: #f9f9f9; border-radius: 4px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #eee; }
        th { background: #f5f5f5; }
        .api { color: #e67e22; }
        .rendering { color: #3498db; }
        .network { color: #e74c3c; }
        .resource { color: #9b59b6; }
        .state { color: #f1c40f; }
        .unknown { color: #95a5a6; }
      </style>
    </head>
    <body>
      <h1>Error Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      
      <h2>Summary</h2>
      <div class="card">
        <p>Total Errors: ${analytics.totalErrors}</p>
        <p>Unique Errors: ${analytics.uniqueErrors}</p>
      </div>
      
      <h2>Category Distribution</h2>
      <div class="card">
        <table>
          <tr>
            <th>Category</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
          ${Object.entries(analytics.categoryDistribution).map(([category, count]) => `
          <tr>
            <td class="${category}">${category}</td>
            <td>${count}</td>
            <td>${((count / analytics.totalErrors) * 100).toFixed(1)}%</td>
          </tr>
          `).join('')}
        </table>
      </div>
      
      <h2>Time Distribution</h2>
      <div class="card">
        <table>
          <tr>
            <th>Time Range</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
          ${Object.entries(analytics.timeDistribution).map(([timeRange, count]) => `
          <tr>
            <td>${timeRange.replace(/([A-Z])/g, ' $1').trim()}</td>
            <td>${count}</td>
            <td>${((count / analytics.totalErrors) * 100).toFixed(1)}%</td>
          </tr>
          `).join('')}
        </table>
      </div>
      
      <h2>Top Errors</h2>
      <div class="card">
        <table>
          <tr>
            <th>Message</th>
            <th>Category</th>
            <th>Count</th>
            <th>Last Occurrence</th>
          </tr>
          ${analytics.topErrors.map(error => `
          <tr>
            <td>${error.message}</td>
            <td class="${error.category}">${error.category}</td>
            <td>${error.count}</td>
            <td>${new Date(error.lastOccurrence).toLocaleString()}</td>
          </tr>
          `).join('')}
        </table>
      </div>
    </body>
    </html>
    `;
  }
  
  /**
   * Generate a console-friendly error report
   * 
   * @param {Object} analytics - Error analytics
   * @returns {string} Console report
   */
  function generateConsoleReport(analytics) {
    let report = '\n=== ERROR TRACKING REPORT ===\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Summary
    report += 'SUMMARY:\n';
    report += `  Total Errors: ${analytics.totalErrors}\n`;
    report += `  Unique Errors: ${analytics.uniqueErrors}\n\n`;
    
    // Category Distribution
    report += 'CATEGORY DISTRIBUTION:\n';
    Object.entries(analytics.categoryDistribution).forEach(([category, count]) => {
      report += `  ${category}: ${count} (${((count / analytics.totalErrors) * 100).toFixed(1)}%)\n`;
    });
    report += '\n';
    
    // Time Distribution
    report += 'TIME DISTRIBUTION:\n';
    Object.entries(analytics.timeDistribution).forEach(([timeRange, count]) => {
      const formattedRange = timeRange.replace(/([A-Z])/g, ' $1').trim();
      report += `  ${formattedRange}: ${count} (${((count / analytics.totalErrors) * 100).toFixed(1)}%)\n`;
    });
    report += '\n';
    
    // Top Errors
    report += 'TOP ERRORS:\n';
    analytics.topErrors.forEach((error, index) => {
      report += `  ${index + 1}. [${error.category}] ${error.message}\n`;
      report += `     Count: ${error.count}, Last: ${new Date(error.lastOccurrence).toLocaleString()}\n`;
    });
    
    return report;
  }
  
  /**
   * Save the error report to a file
   * 
   * @param {string} format - Output format (json, html, console)
   * @returns {string} Path to the saved report
   */
  function saveReport(format = 'json') {
    const report = generateReport(format);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = format === 'html' ? 'html' : format === 'json' ? 'json' : 'txt';
    const logsDir = path.resolve(config.logsDir);
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const filePath = path.join(logsDir, `error-report-${timestamp}.${extension}`);
    fs.writeFileSync(filePath, report);
    
    console.log(`Error report saved to: ${filePath}`);
    return filePath;
  }
  
  /**
   * Clear all tracked errors
   */
  function clearErrors() {
    errors.length = 0;
    Object.keys(errorGroups).forEach(key => delete errorGroups[key]);
    
    console.log('Error tracking data cleared');
  }
  
  // Return public API
  return {
    trackError,
    registerRecoveryStrategy,
    getRecoveryStrategy,
    generateAnalytics,
    generateReport,
    saveReport,
    clearErrors,
    // Expose for testing/debugging
    __getErrors: () => [...errors],
    __getErrorGroups: () => ({ ...errorGroups }),
    __getConfig: () => ({ ...config })
  };
}

/**
 * Track errors using the error tracker
 * 
 * @param {Object} options - Tracker options
 * @returns {Object} Tracking results
 */
function trackErrors(options = {}) {
  console.log('Running error tracker...');
  
  const tracker = initializeErrorTracker({
    verbose: options.detailed || false,
    logsDir: options.outputDir || 'error-logs'
  });
  
  // Generate some sample error data for demo/testing purposes
  generateSampleData(tracker);
  
  // Generate and save report
  const reportPath = tracker.saveReport(options.outputFormat || 'console');
  
  // Generate analytics
  const analytics = tracker.generateAnalytics();
  
  return {
    reportPath,
    analytics,
    hasErrors: analytics.totalErrors > 0
  };
}

/**
 * Generate sample error data for testing
 * 
 * @param {Object} tracker - Error tracker instance
 */
function generateSampleData(tracker) {
  // Sample errors
  const errors = [
    { error: new Error('Failed to fetch user data'), category: 'api', context: { endpoint: '/api/users', status: 401 } },
    { error: new Error('Component rendering failed'), category: 'rendering', context: { component: 'UserProfile', props: { userId: 123 } } },
    { error: new Error('Network request failed'), category: 'network', context: { url: 'https://api.example.com/data', status: 500 } },
    { error: new Error('Failed to load image'), category: 'resource', context: { url: '/images/profile.jpg' } },
    { error: new Error('Unexpected state mutation'), category: 'state', context: { action: 'UPDATE_USER', payload: { name: 'John' } } },
    { error: new Error('Authentication token expired'), category: 'api', context: { endpoint: '/api/auth/refresh', status: 401 } }
  ];
  
  // Track errors
  errors.forEach(({error, category, context}) => {
    // Track the same error multiple times for some errors to test grouping
    const times = category === 'api' || category === 'network' ? 3 : 1;
    
    for (let i = 0; i < times; i++) {
      tracker.trackError(error, category, context);
    }
  });
  
  // Register a custom recovery strategy
  tracker.registerRecoveryStrategy('rendering', (error) => {
    return {
      action: 'reset_component',
      component: error.context?.component,
      recoverable: true
    };
  });
}

module.exports = { initializeErrorTracker, trackErrors };