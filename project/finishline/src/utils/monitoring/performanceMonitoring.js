/**
 * performanceMonitoring
 * 
 * Comprehensive tools for monitoring and tracking performance metrics.
 * 
 * Features:
 * - High performance implementation
 * - Optimized for production builds
 * - Compatible with tree shaking
 * - Minimal dependencies
 * - Web Vitals tracking
 * - Component render tracking
 * - Resource load tracking
 * - User interaction monitoring
 */

import { performance as perfAPI } from '../performance';

// Default configuration for performance monitoring
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
  monitoredComponents: [
    'DataGrid',
    'Chart',
    'Dashboard',
    'FileUploader'
  ],
  // Sampling rate (percentage of sessions to monitor)
  samplingRate: 100,
  // Maximum events to track per session
  maxEventsPerSession: 100,
  // Enable detailed logging
  verbose: false,
  // Storage key for persisting metrics
  storageKey: 'performance-metrics'
};

/**
 * performanceMonitoring Configuration options
 * @typedef {Object} performanceMonitoringOptions
 * @property {Object} thresholds - Performance thresholds
 * @property {Array<string>} monitoredComponents - Components to monitor
 * @property {number} samplingRate - Percentage of sessions to monitor
 * @property {number} maxEventsPerSession - Maximum events to track per session
 * @property {boolean} verbose - Enable detailed logging
 * @property {string} storageKey - Storage key for persisting metrics
 */

/**
 * Initialize the performance monitoring system
 * 
 * @param {performanceMonitoringOptions} options - Configuration options
 * @returns {Object} Performance monitoring API
 */
export function performanceMonitoring(options = {}) {
  // Track initialization performance
  const startTime = perfAPI.now();
  
  // Merge default and custom configurations
  const config = { ...defaultConfig, ...options };
  
  // State to store metrics
  const metrics = {
    webVitals: [],
    resourceLoading: [],
    componentRenderTimes: {},
    userInteractions: [],
    errors: [],
    navigationTiming: [],
  };
  
  // Set up session ID
  const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  
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
    // Check if component is on monitored list or all components are monitored
    const shouldMonitor = config.monitoredComponents.includes(componentName) || 
                         config.monitoredComponents.includes('*');
                         
    if (!shouldMonitor) return;
    
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
  function recordError(message, category = 'performance', context = {}) {
    metrics.errors.push({
      message,
      category,
      context,
      timestamp: Date.now(),
    });
    
    console.error(`Performance error (${category}): ${message}`, context);
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
      if (summary.count > 0) {
        summary.avg = summary.values.reduce((sum, val) => sum + val, 0) / summary.count;
      }
      delete summary.values; // Remove values array to save space
    });
    
    // Component render times summary
    const componentRenderSummary = {};
    Object.keys(metrics.componentRenderTimes).forEach(component => {
      const renders = metrics.componentRenderTimes[component];
      if (renders.length === 0) return;
      
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
      sessionId,
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
   * Start tracking resource performance
   */
  function trackResources() {
    if (typeof window === 'undefined' || !window.performance || !window.performance.getEntriesByType) {
      return;
    }
    
    // Get existing resource entries
    const resources = window.performance.getEntriesByType('resource');
    resources.forEach(resource => {
      recordResourceTiming({
        name: resource.name,
        initiatorType: resource.initiatorType,
        duration: resource.duration,
        transferSize: resource.transferSize || 0
      });
    });
    
    // Set up observer for future resources
    if (window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.entryType === 'resource') {
              recordResourceTiming({
                name: entry.name,
                initiatorType: entry.initiatorType,
                duration: entry.duration,
                transferSize: entry.transferSize || 0
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        recordError('Failed to create PerformanceObserver', 'configuration', e);
      }
    }
  }
  
  /**
   * Save metrics to storage
   */
  function saveMetrics() {
    if (typeof window === 'undefined' || !config.storageKey) {
      return;
    }
    
    try {
      const summary = calculateMetricsSummary();
      localStorage.setItem(config.storageKey, JSON.stringify(summary));
      
      if (config.verbose) {
        console.log('Performance metrics saved to storage');
      }
    } catch (e) {
      recordError('Failed to save metrics to storage', 'storage', e);
    }
  }
  
  /**
   * Load metrics from storage
   * 
   * @returns {Object|null} Loaded metrics or null if not found
   */
  function loadMetrics() {
    if (typeof window === 'undefined' || !config.storageKey) {
      return null;
    }
    
    try {
      const storedMetrics = localStorage.getItem(config.storageKey);
      if (storedMetrics) {
        return JSON.parse(storedMetrics);
      }
    } catch (e) {
      recordError('Failed to load metrics from storage', 'storage', e);
    }
    
    return null;
  }
  
  /**
   * Clear all metrics
   */
  function clearMetrics() {
    metrics.webVitals = [];
    metrics.resourceLoading = [];
    metrics.componentRenderTimes = {};
    metrics.userInteractions = [];
    metrics.errors = [];
    metrics.navigationTiming = [];
    
    if (typeof window !== 'undefined' && config.storageKey) {
      try {
        localStorage.removeItem(config.storageKey);
      } catch (e) {
        recordError('Failed to clear metrics from storage', 'storage', e);
      }
    }
    
    if (config.verbose) {
      console.log('Performance metrics cleared');
    }
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
  
  // Initialize tracking if in browser
  if (typeof window !== 'undefined') {
    trackResources();
    
    // Set up unload handler to save metrics
    window.addEventListener('beforeunload', () => {
      saveMetrics();
    });
  }
  
  // Log initialization time
  const initTime = perfAPI.now() - startTime;
  if (initTime > 5 && config.verbose) {
    console.warn(`Performance monitoring initialization took ${initTime.toFixed(2)}ms, which may impact performance`);
  }
  
  // Return public API
  return {
    recordWebVital,
    recordResourceTiming,
    recordComponentRender,
    recordUserInteraction,
    recordError,
    calculateMetricsSummary,
    saveMetrics,
    loadMetrics,
    clearMetrics,
    checkThresholds,
    getSessionId: () => sessionId,
    getMetrics: () => ({ ...metrics }),
    getConfig: () => ({ ...config })
  };
}

/**
 * Create a performance monitor for a specific component
 * 
 * @param {string} componentName - Name of the component
 * @param {performanceMonitoringOptions} options - Configuration options
 * @returns {Object} Component performance monitoring API
 */
export function createComponentMonitor(componentName, options = {}) {
  const monitor = performanceMonitoring(options);
  const startTime = perfAPI.now();
  
  return {
    // Start measuring render time
    startRender: () => {
      return perfAPI.now();
    },
    
    // End measuring render time
    endRender: (startMark, props = {}) => {
      const renderTime = perfAPI.now() - startMark;
      monitor.recordComponentRender(componentName, renderTime, props);
      return renderTime;
    },
    
    // Track interaction within the component
    trackInteraction: (action, startMark, details = {}) => {
      const responseTime = perfAPI.now() - startMark;
      monitor.recordUserInteraction(
        `${componentName}:${action}`, 
        responseTime, 
        details
      );
      return responseTime;
    },
    
    // Get metrics for this component
    getMetrics: () => {
      const allMetrics = monitor.getMetrics();
      return {
        renderTimes: allMetrics.componentRenderTimes[componentName] || [],
        interactions: allMetrics.userInteractions.filter(i => 
          i.action.startsWith(`${componentName}:`)
        ),
        mountTime: perfAPI.now() - startTime
      };
    }
  };
}

export default performanceMonitoring;