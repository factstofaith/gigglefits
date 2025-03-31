/**
 * Performance Monitoring Utilities
 * 
 * Tools for monitoring and analyzing performance in the application.
 * Part of the zero technical debt performance implementation.
 * 
 * @module utils/performance/performanceMonitor
 */

/**
 * Performance metrics tracked by the monitor
 */
const metrics = {
  components: {}, // Component render times
  interactions: {}, // User interaction times
  navigation: {}, // Navigation times
  resources: {}, // Resource load times
  custom: {}, // Custom metrics
};

/**
 * Enable automatic performance monitoring
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} [options.trackComponents=true] - Whether to track component render times
 * @param {boolean} [options.trackInteractions=true] - Whether to track user interaction times
 * @param {boolean} [options.trackNavigation=true] - Whether to track navigation times
 * @param {boolean} [options.trackResources=true] - Whether to track resource load times
 * @param {boolean} [options.logToConsole=false] - Whether to log metrics to console
 * @param {Function} [options.onMetricUpdate] - Callback when metrics are updated
 * @param {number} [options.sampleRate=100] - Percentage of measurements to record (0-100)
 * @returns {Function} Function to disable monitoring
 */
export const enablePerformanceMonitoring = ({
  trackComponents = true,
  trackInteractions = true,
  trackNavigation = true,
  trackResources = true,
  logToConsole = false,
  onMetricUpdate = null,
  sampleRate = 100
} = {}) => {
  const observers = [];
  
  // Only record data based on sample rate
  const shouldRecord = () => {
    return Math.random() * 100 <= sampleRate;
  };
  
  // Track component render times using a patched React.createElement
  if (trackComponents && typeof React !== 'undefined') {
    const originalCreateElement = React.createElement;
    
    React.createElement = function(type, props, ...children) {
      // Only track component functions or classes, not DOM elements
      if (typeof type === 'function') {
        const displayName = type.displayName || type.name || 'AnonymousComponent';
        
        // Create wrapper for timing
        const wrappedType = function(props, ref) {
          const startTime = performance.now();
          let element;
          
          try {
            // Call original component
            element = type(props, ref);
          } finally {
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            if (shouldRecord()) {
              // Record metrics
              if (!metrics.components[displayName]) {
                metrics.components[displayName] = {
                  count: 0,
                  totalTime: 0,
                  minTime: Number.MAX_VALUE,
                  maxTime: 0,
                  averageTime: 0,
                  lastTime: 0
                };
              }
              
              const compMetrics = metrics.components[displayName];
              compMetrics.count++;
              compMetrics.totalTime += renderTime;
              compMetrics.minTime = Math.min(compMetrics.minTime, renderTime);
              compMetrics.maxTime = Math.max(compMetrics.maxTime, renderTime);
              compMetrics.averageTime = compMetrics.totalTime / compMetrics.count;
              compMetrics.lastTime = renderTime;
              
              // Log if enabled
              if (logToConsole) {
                console.log(`[Performance] Rendered ${displayName} in ${renderTime.toFixed(2)}ms`);
              }
              
              // Call callback if provided
              if (onMetricUpdate) {
                onMetricUpdate('component', displayName, renderTime);
              }
            }
          }
          
          return element;
        };
        
        // Set display name
        wrappedType.displayName = displayName;
        
        // Forward other properties
        Object.assign(wrappedType, type);
        
        return originalCreateElement(wrappedType, props, ...children);
      }
      
      return originalCreateElement(type, props, ...children);
    };
    
    observers.push(() => {
      React.createElement = originalCreateElement;
    });
  }
  
  // Track user interactions
  if (trackInteractions) {
    const interactionEvents = ['click', 'input', 'change', 'submit'];
    const interactionHandler = (event) => {
      if (!shouldRecord()) return;
      
      const startTime = performance.now();
      
      // Use setTimeout to measure time until next frame
      setTimeout(() => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        // Create a descriptor for the interaction
        let target = event.target;
        let descriptor = target.id ? `#${target.id}` : target.className ? `.${target.className.replace(/\s+/g, '.')}` : target.tagName.toLowerCase();
        
        // Add event type
        descriptor = `${event.type}:${descriptor}`;
        
        // Record metrics
        if (!metrics.interactions[descriptor]) {
          metrics.interactions[descriptor] = {
            count: 0,
            totalTime: 0,
            minTime: Number.MAX_VALUE,
            maxTime: 0,
            averageTime: 0,
            lastTime: 0,
            type: event.type
          };
        }
        
        const intMetrics = metrics.interactions[descriptor];
        intMetrics.count++;
        intMetrics.totalTime += responseTime;
        intMetrics.minTime = Math.min(intMetrics.minTime, responseTime);
        intMetrics.maxTime = Math.max(intMetrics.maxTime, responseTime);
        intMetrics.averageTime = intMetrics.totalTime / intMetrics.count;
        intMetrics.lastTime = responseTime;
        
        // Log if enabled
        if (logToConsole) {
          console.log(`[Performance] Interaction ${descriptor} responded in ${responseTime.toFixed(2)}ms`);
        }
        
        // Call callback if provided
        if (onMetricUpdate) {
          onMetricUpdate('interaction', descriptor, responseTime);
        }
      }, 0);
    };
    
    // Add event listeners
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, interactionHandler, { passive: true });
    });
    
    observers.push(() => {
      interactionEvents.forEach(eventType => {
        document.removeEventListener(eventType, interactionHandler);
      });
    });
  }
  
  // Track navigation performance
  if (trackNavigation && window.performance && window.performance.getEntriesByType) {
    const recordNavigationMetrics = () => {
      if (!shouldRecord()) return;
      
      const navEntries = window.performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const nav = navEntries[0];
        const url = window.location.pathname;
        
        // Record navigation metrics
        metrics.navigation[url] = {
          domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          load: nav.loadEventEnd - nav.loadEventStart,
          domInteractive: nav.domInteractive - nav.startTime,
          domComplete: nav.domComplete - nav.startTime,
          firstPaint: 0, // Will be populated by PerformanceObserver
          firstContentfulPaint: 0, // Will be populated by PerformanceObserver
          timestamp: Date.now()
        };
        
        // Log if enabled
        if (logToConsole) {
          console.log(`[Performance] Navigation to ${url} completed in ${nav.loadEventEnd.toFixed(2)}ms`);
        }
        
        // Call callback if provided
        if (onMetricUpdate) {
          onMetricUpdate('navigation', url, metrics.navigation[url]);
        }
      }
    };
    
    // Record on page load
    if (document.readyState === 'complete') {
      recordNavigationMetrics();
    } else {
      window.addEventListener('load', recordNavigationMetrics);
      observers.push(() => {
        window.removeEventListener('load', recordNavigationMetrics);
      });
    }
    
    // Use PerformanceObserver for paint metrics if available
    if (window.PerformanceObserver) {
      const paintObserver = new PerformanceObserver((entries) => {
        if (!shouldRecord()) return;
        
        entries.getEntries().forEach((entry) => {
          const url = window.location.pathname;
          
          if (!metrics.navigation[url]) {
            metrics.navigation[url] = {
              domContentLoaded: 0,
              load: 0,
              domInteractive: 0,
              domComplete: 0,
              firstPaint: 0,
              firstContentfulPaint: 0,
              timestamp: Date.now()
            };
          }
          
          if (entry.name === 'first-paint') {
            metrics.navigation[url].firstPaint = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            metrics.navigation[url].firstContentfulPaint = entry.startTime;
          }
          
          // Log if enabled
          if (logToConsole) {
            console.log(`[Performance] ${entry.name} at ${entry.startTime.toFixed(2)}ms`);
          }
          
          // Call callback if provided
          if (onMetricUpdate) {
            onMetricUpdate('paint', entry.name, entry.startTime);
          }
        });
      });
      
      paintObserver.observe({ entryTypes: ['paint'] });
      observers.push(() => {
        paintObserver.disconnect();
      });
    }
  }
  
  // Track resource load times
  if (trackResources && window.performance && window.performance.getEntriesByType) {
    const recordResourceMetrics = () => {
      if (!shouldRecord()) return;
      
      const resourceEntries = window.performance.getEntriesByType('resource');
      
      resourceEntries.forEach((resource) => {
        const url = resource.name.split('/').pop();
        const type = resource.initiatorType;
        
        // Group by type and name
        const key = `${type}:${url}`;
        
        if (!metrics.resources[key]) {
          metrics.resources[key] = {
            count: 0,
            totalTime: 0,
            minTime: Number.MAX_VALUE,
            maxTime: 0,
            averageTime: 0,
            lastTime: 0,
            size: 0,
            type: type
          };
        }
        
        const resMetrics = metrics.resources[key];
        const loadTime = resource.responseEnd - resource.startTime;
        
        resMetrics.count++;
        resMetrics.totalTime += loadTime;
        resMetrics.minTime = Math.min(resMetrics.minTime, loadTime);
        resMetrics.maxTime = Math.max(resMetrics.maxTime, loadTime);
        resMetrics.averageTime = resMetrics.totalTime / resMetrics.count;
        resMetrics.lastTime = loadTime;
        resMetrics.size = resource.transferSize || resource.encodedBodySize || 0;
        
        // Log if enabled and only log slow resources
        if (logToConsole && loadTime > 100) {
          console.log(`[Performance] Resource ${key} loaded in ${loadTime.toFixed(2)}ms (${(resMetrics.size / 1024).toFixed(2)} KB)`);
        }
        
        // Call callback if provided
        if (onMetricUpdate) {
          onMetricUpdate('resource', key, loadTime);
        }
      });
    };
    
    // Record on page load
    if (document.readyState === 'complete') {
      recordResourceMetrics();
    } else {
      window.addEventListener('load', recordResourceMetrics);
      observers.push(() => {
        window.removeEventListener('load', recordResourceMetrics);
      });
    }
  }
  
  // Return function to disable monitoring
  return () => {
    observers.forEach(cleanup => cleanup());
  };
};

/**
 * Get current performance metrics
 * 
 * @returns {Object} Current performance metrics
 */
export const getPerformanceMetrics = () => {
  return { ...metrics };
};

/**
 * Clear all collected performance metrics
 */
export const clearPerformanceMetrics = () => {
  Object.keys(metrics).forEach(category => {
    metrics[category] = {};
  });
};

/**
 * Time a specific function execution
 * 
 * @param {Function} fn - Function to time
 * @param {string} name - Name for the metric
 * @param {boolean} [logToConsole=true] - Whether to log to console
 * @returns {any} Result of the function
 */
export const timeFunction = (fn, name, logToConsole = true) => {
  const startTime = performance.now();
  let result;
  
  try {
    result = fn();
  } finally {
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Record custom metric
    if (!metrics.custom[name]) {
      metrics.custom[name] = {
        count: 0,
        totalTime: 0,
        minTime: Number.MAX_VALUE,
        maxTime: 0,
        averageTime: 0,
        lastTime: 0
      };
    }
    
    const customMetrics = metrics.custom[name];
    customMetrics.count++;
    customMetrics.totalTime += executionTime;
    customMetrics.minTime = Math.min(customMetrics.minTime, executionTime);
    customMetrics.maxTime = Math.max(customMetrics.maxTime, executionTime);
    customMetrics.averageTime = customMetrics.totalTime / customMetrics.count;
    customMetrics.lastTime = executionTime;
    
    // Log if enabled
    if (logToConsole) {
      console.log(`[Performance] ${name} executed in ${executionTime.toFixed(2)}ms`);
    }
  }
  
  return result;
};

/**
 * Time an asynchronous function execution
 * 
 * @param {Function} asyncFn - Async function to time
 * @param {string} name - Name for the metric
 * @param {boolean} [logToConsole=true] - Whether to log to console
 * @returns {Promise<any>} Result of the async function
 */
export const timeAsyncFunction = async (asyncFn, name, logToConsole = true) => {
  const startTime = performance.now();
  let result;
  
  try {
    result = await asyncFn();
  } finally {
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Record custom metric
    if (!metrics.custom[name]) {
      metrics.custom[name] = {
        count: 0,
        totalTime: 0,
        minTime: Number.MAX_VALUE,
        maxTime: 0,
        averageTime: 0,
        lastTime: 0
      };
    }
    
    const customMetrics = metrics.custom[name];
    customMetrics.count++;
    customMetrics.totalTime += executionTime;
    customMetrics.minTime = Math.min(customMetrics.minTime, executionTime);
    customMetrics.maxTime = Math.max(customMetrics.maxTime, executionTime);
    customMetrics.averageTime = customMetrics.totalTime / customMetrics.count;
    customMetrics.lastTime = executionTime;
    
    // Log if enabled
    if (logToConsole) {
      console.log(`[Performance] Async ${name} executed in ${executionTime.toFixed(2)}ms`);
    }
  }
  
  return result;
};

/**
 * Create a performant event handler with debounce and performance tracking
 * 
 * @param {Function} handler - Event handler function
 * @param {Object} options - Handler options
 * @param {number} [options.debounce=0] - Debounce time in ms (0 to disable)
 * @param {number} [options.throttle=0] - Throttle time in ms (0 to disable)
 * @param {string} [options.name='event'] - Name for performance tracking
 * @param {boolean} [options.track=true] - Whether to track performance
 * @returns {Function} Optimized event handler
 */
export const createPerformantEventHandler = (handler, {
  debounce = 0,
  throttle = 0,
  name = 'event',
  track = true
} = {}) => {
  let timeout = null;
  let lastExecuted = 0;
  
  return (...args) => {
    const currentTime = Date.now();
    
    // Clear existing timeout if debouncing
    if (debounce > 0 && timeout) {
      clearTimeout(timeout);
    }
    
    // Check if throttled
    if (throttle > 0 && currentTime - lastExecuted < throttle) {
      return;
    }
    
    const executeHandler = () => {
      lastExecuted = Date.now();
      
      if (track) {
        return timeFunction(() => handler(...args), `handler:${name}`);
      } else {
        return handler(...args);
      }
    };
    
    // Debounce or execute immediately
    if (debounce > 0) {
      timeout = setTimeout(executeHandler, debounce);
    } else {
      return executeHandler();
    }
  };
};

/**
 * Generate a performance report based on collected metrics
 * 
 * @returns {string} HTML performance report
 */
export const generatePerformanceReport = () => {
  const { components, interactions, navigation, resources, custom } = metrics;
  
  // Create HTML report
  let report = `
    <h1>Performance Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
    
    <h2>Component Render Times</h2>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Renders</th>
          <th>Avg Time (ms)</th>
          <th>Min Time (ms)</th>
          <th>Max Time (ms)</th>
          <th>Total Time (ms)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Sort components by average time (slowest first)
  const sortedComponents = Object.entries(components)
    .sort(([, a], [, b]) => b.averageTime - a.averageTime);
  
  sortedComponents.forEach(([name, data]) => {
    report += `
      <tr>
        <td>${name}</td>
        <td>${data.count}</td>
        <td>${data.averageTime.toFixed(2)}</td>
        <td>${data.minTime.toFixed(2)}</td>
        <td>${data.maxTime.toFixed(2)}</td>
        <td>${data.totalTime.toFixed(2)}</td>
      </tr>
    `;
  });
  
  report += `
      </tbody>
    </table>
    
    <h2>User Interactions</h2>
    <table>
      <thead>
        <tr>
          <th>Interaction</th>
          <th>Count</th>
          <th>Avg Time (ms)</th>
          <th>Min Time (ms)</th>
          <th>Max Time (ms)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Sort interactions by average time (slowest first)
  const sortedInteractions = Object.entries(interactions)
    .sort(([, a], [, b]) => b.averageTime - a.averageTime);
  
  sortedInteractions.forEach(([name, data]) => {
    report += `
      <tr>
        <td>${name}</td>
        <td>${data.count}</td>
        <td>${data.averageTime.toFixed(2)}</td>
        <td>${data.minTime.toFixed(2)}</td>
        <td>${data.maxTime.toFixed(2)}</td>
      </tr>
    `;
  });
  
  report += `
      </tbody>
    </table>
    
    <h2>Navigation Performance</h2>
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>DOM Interactive (ms)</th>
          <th>DOM Complete (ms)</th>
          <th>First Paint (ms)</th>
          <th>First Contentful Paint (ms)</th>
          <th>Load (ms)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  Object.entries(navigation).forEach(([url, data]) => {
    report += `
      <tr>
        <td>${url}</td>
        <td>${data.domInteractive.toFixed(2)}</td>
        <td>${data.domComplete.toFixed(2)}</td>
        <td>${data.firstPaint.toFixed(2)}</td>
        <td>${data.firstContentfulPaint.toFixed(2)}</td>
        <td>${data.load.toFixed(2)}</td>
      </tr>
    `;
  });
  
  report += `
      </tbody>
    </table>
    
    <h2>Resource Load Times (Top 20 Slowest)</h2>
    <table>
      <thead>
        <tr>
          <th>Resource</th>
          <th>Type</th>
          <th>Size (KB)</th>
          <th>Count</th>
          <th>Avg Time (ms)</th>
          <th>Max Time (ms)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Sort resources by average time (slowest first) and limit to top 20
  const sortedResources = Object.entries(resources)
    .sort(([, a], [, b]) => b.averageTime - a.averageTime)
    .slice(0, 20);
  
  sortedResources.forEach(([name, data]) => {
    report += `
      <tr>
        <td>${name}</td>
        <td>${data.type}</td>
        <td>${(data.size / 1024).toFixed(2)}</td>
        <td>${data.count}</td>
        <td>${data.averageTime.toFixed(2)}</td>
        <td>${data.maxTime.toFixed(2)}</td>
      </tr>
    `;
  });
  
  report += `
      </tbody>
    </table>
    
    <h2>Custom Metrics</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Count</th>
          <th>Avg Time (ms)</th>
          <th>Min Time (ms)</th>
          <th>Max Time (ms)</th>
          <th>Total Time (ms)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Sort custom metrics by average time (slowest first)
  const sortedCustom = Object.entries(custom)
    .sort(([, a], [, b]) => b.averageTime - a.averageTime);
  
  sortedCustom.forEach(([name, data]) => {
    report += `
      <tr>
        <td>${name}</td>
        <td>${data.count}</td>
        <td>${data.averageTime.toFixed(2)}</td>
        <td>${data.minTime.toFixed(2)}</td>
        <td>${data.maxTime.toFixed(2)}</td>
        <td>${data.totalTime.toFixed(2)}</td>
      </tr>
    `;
  });
  
  report += `
      </tbody>
    </table>
    
    <style>
      body { font-family: system-ui, sans-serif; line-height: 1.4; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
      th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #eee; }
      th { background: #f5f5f5; }
      tr:hover { background: #f9f9f9; }
    </style>
  `;
  
  return report;
};