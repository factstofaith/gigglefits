/**
 * Performance Monitoring Utilities
 * 
 * Tools for measuring and optimizing component performance.
 * 
 * @module utils/performance
 */

import { useRef, useEffect } from 'react';

/**
 * Function to format performance time in milliseconds
 * 
 * @param {number} time - Time in milliseconds
 * @returns {string} Formatted time
 */
const formatTime = (time) => {
  if (time < 1) {
    return `${(time * 1000).toFixed(2)}μs`;
  }
  if (time < 1000) {
    return `${time.toFixed(2)}ms`;
  }
  return `${(time / 1000).toFixed(2)}s`;
};

/**
 * Performance marker class for measuring operations
 */
export class PerformanceMarker {
  /**
   * Create a new performance marker
   * 
   * @param {string} name - Name of the marker
   */
  constructor(name) {
    this.name = name;
    this.marks = {};
    this.measures = {};
  }
  
  /**
   * Start a measurement
   * 
   * @param {string} label - Label for the measurement
   * @returns {PerformanceMarker} This instance for chaining
   */
  start(label = 'default') {
    if (typeof performance !== 'undefined') {
      const markName = `${this.name}-${label}-start`;
      performance.mark(markName);
      this.marks[label] = { start: markName };
    }
    return this;
  }
  
  /**
   * End a measurement and record the result
   * 
   * @param {string} label - Label for the measurement (should match start label)
   * @returns {number} Duration in milliseconds
   */
  end(label = 'default') {
    if (typeof performance === 'undefined' || !this.marks[label]) {
      return 0;
    }
    
    const startMark = this.marks[label].start;
    const endMark = `${this.name}-${label}-end`;
    const measureName = `${this.name}-${label}`;
    
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const entries = performance.getEntriesByName(measureName);
    const duration = entries.length > 0 ? entries[0].duration : 0;
    
    // Store the measure for later reference
    this.measures[label] = duration;
    
    // Clean up marks
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
    
    return duration;
  }
  
  /**
   * Get the duration of a measurement
   * 
   * @param {string} label - Label for the measurement
   * @returns {number} Duration in milliseconds
   */
  getDuration(label = 'default') {
    return this.measures[label] || 0;
  }
  
  /**
   * Format the duration of a measurement as a string
   * 
   * @param {string} label - Label for the measurement
   * @returns {string} Formatted duration
   */
  getFormattedDuration(label = 'default') {
    return formatTime(this.getDuration(label));
  }
  
  /**
   * Get all measurements
   * 
   * @returns {Object} All measurements
   */
  getAllMeasures() {
    return { ...this.measures };
  }
  
  /**
   * Get all measurements formatted as strings
   * 
   * @returns {Object} All formatted measurements
   */
  getAllFormattedMeasures() {
    const formatted = {};
    Object.entries(this.measures).forEach(([label, duration]) => {
      formatted[label] = formatTime(duration);
    });
    return formatted;
  }
}

/**
 * Create a new performance marker
 * 
 * @param {string} name - Name of the marker
 * @returns {PerformanceMarker} New performance marker
 */
export const createPerformanceMarker = (name) => {
  return new PerformanceMarker(name);
};

/**
 * Measure execution time of a function
 * 
 * @param {Function} fn - Function to measure
 * @param {string} name - Name for the measurement
 * @returns {Function} Wrapped function that measures execution time
 */
export const measureFunction = (fn, name) => {
  if (typeof performance === 'undefined') {
    return fn;
  }
  
  return (...args) => {
    const marker = createPerformanceMarker(name || fn.name || 'anonymous');
    marker.start();
    const result = fn(...args);
    
    // Handle promises
    if (result && typeof result.then === 'function') {
      return result.then((value) => {
        const duration = marker.end();
        console.log(`⏱️ ${name || fn.name || 'Anonymous function'} took ${formatTime(duration)}`);
        return value;
      });
    }
    
    const duration = marker.end();
    console.log(`⏱️ ${name || fn.name || 'Anonymous function'} took ${formatTime(duration)}`);
    return result;
  };
};

/**
 * Hook to measure component render time
 * 
 * @param {string} componentName - Name of the component
 * @param {Object} [options] - Options
 * @param {boolean} [options.logToConsole=true] - Whether to log to console
 * @param {Function} [options.onMeasure] - Callback when measurement completes
 * @returns {Object} Render measurements
 */
export const useRenderTime = (componentName, options = {}) => {
  const { logToConsole = true, onMeasure } = options;
  const renderCount = useRef(0);
  const marker = useRef(new PerformanceMarker(componentName));
  const measurements = useRef({
    lastRender: 0,
    averageRender: 0,
    totalRender: 0,
    minRender: Infinity,
    maxRender: 0,
  });
  
  // Start timing on render
  useEffect(() => {
    marker.current.start('render');
    
    return () => {
      const duration = marker.current.end('render');
      renderCount.current += 1;
      
      // Update measurements
      const mRef = measurements.current;
      mRef.lastRender = duration;
      mRef.totalRender += duration;
      mRef.averageRender = mRef.totalRender / renderCount.current;
      mRef.minRender = Math.min(mRef.minRender, duration);
      mRef.maxRender = Math.max(mRef.maxRender, duration);
      
      if (logToConsole) {
        console.log(`⏱️ ${componentName} render #${renderCount.current}: ${formatTime(duration)}`);
      }
      
      if (onMeasure) {
        onMeasure({
          componentName,
          renderCount: renderCount.current,
          duration,
          average: mRef.averageRender,
          min: mRef.minRender,
          max: mRef.maxRender,
        });
      }
    };
  });
  
  return {
    renderCount: renderCount.current,
    ...measurements.current,
  };
};

/**
 * Global performance monitor for tracking application-wide metrics
 */
export class PerformanceMonitor {
  constructor() {
    this.measurements = {};
    this.enabled = true;
    this.logThreshold = 50; // Log renders taking more than 50ms by default
  }
  
  /**
   * Enable or disable performance monitoring
   * 
   * @param {boolean} enabled - Whether monitoring is enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  /**
   * Set the threshold for logging slow renders
   * 
   * @param {number} threshold - Threshold in milliseconds
   */
  setLogThreshold(threshold) {
    this.logThreshold = threshold;
  }
  
  /**
   * Record a component render
   * 
   * @param {string} componentName - Name of the component
   * @param {number} duration - Render duration in milliseconds
   */
  recordRender(componentName, duration) {
    if (!this.enabled) return;
    
    if (!this.measurements[componentName]) {
      this.measurements[componentName] = {
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        minRenderTime: Infinity,
        maxRenderTime: 0,
        lastRenderTime: 0,
      };
    }
    
    const metrics = this.measurements[componentName];
    metrics.renderCount += 1;
    metrics.totalRenderTime += duration;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
    metrics.minRenderTime = Math.min(metrics.minRenderTime, duration);
    metrics.maxRenderTime = Math.max(metrics.maxRenderTime, duration);
    metrics.lastRenderTime = duration;
    
    // Log slow renders
    if (duration > this.logThreshold) {
      console.warn(`⚠️ Slow render: ${componentName} took ${formatTime(duration)}`);
    }
  }
  
  /**
   * Get metrics for a specific component
   * 
   * @param {string} componentName - Name of the component
   * @returns {Object|null} Component metrics or null if not found
   */
  getComponentMetrics(componentName) {
    return this.measurements[componentName] || null;
  }
  
  /**
   * Get all component metrics
   * 
   * @returns {Object} All component metrics
   */
  getAllMetrics() {
    return { ...this.measurements };
  }
  
  /**
   * Get the slowest components by average render time
   * 
   * @param {number} [limit=5] - Maximum number of components to return
   * @returns {Array} Array of [componentName, metrics] pairs
   */
  getSlowestComponents(limit = 5) {
    return Object.entries(this.measurements)
      .sort((a, b) => b[1].averageRenderTime - a[1].averageRenderTime)
      .slice(0, limit);
  }
  
  /**
   * Get components with the most renders
   * 
   * @param {number} [limit=5] - Maximum number of components to return
   * @returns {Array} Array of [componentName, metrics] pairs
   */
  getMostFrequentlyRenderedComponents(limit = 5) {
    return Object.entries(this.measurements)
      .sort((a, b) => b[1].renderCount - a[1].renderCount)
      .slice(0, limit);
  }
  
  /**
   * Clear all measurements
   */
  clear() {
    this.measurements = {};
  }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order component to measure render time
 * 
 * @param {React.ComponentType} Component - Component to measure
 * @param {Object} [options] - Options
 * @returns {React.ComponentType} Wrapped component with render time measurement
 */
export const withRenderTime = (Component, options = {}) => {
  const { 
    name = Component.displayName || Component.name || 'Component',
    logToConsole = true,
    logThreshold,
  } = options;
  
  const WrappedComponent = (props) => {
    useRenderTime(name, {
      logToConsole,
      onMeasure: ({ duration }) => {
        performanceMonitor.recordRender(name, duration);
        
        if (logThreshold && duration > logThreshold) {
          console.warn(`⚠️ Slow render: ${name} took ${formatTime(duration)}`);
        }
      },
    });
    
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `withRenderTime(${name})`;
  
  return WrappedComponent;
};