/**
 * usePerformanceTracking
 * 
 * Hook for tracking component performance metrics.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createComponentMonitor } from '../utils/monitoring/performanceMonitoring';

/**
 * usePerformanceTracking hook options
 * @typedef {Object} PerformanceTrackingOptions
 * @property {string} componentName - Name of the component being tracked
 * @property {boolean} trackRenders - Track component renders
 * @property {boolean} trackEffects - Track effect execution times
 * @property {boolean} trackInteractions - Track user interactions
 * @property {boolean} autoStart - Automatically start tracking
 * @property {boolean} debugMode - Enable detailed console logs
 * @property {boolean} collectProps - Collect component props for analysis
 * @property {boolean} collectMeasurements - Collect performance measurements
 */

/**
 * usePerformanceTracking hook
 * 
 * @param {string|PerformanceTrackingOptions} componentNameOrOptions - Component name or options
 * @returns {Object} Hook API
 */
export function usePerformanceTracking(componentNameOrOptions = {}) {
  // Handle both string and options object
  const options = typeof componentNameOrOptions === 'string' 
    ? { componentName: componentNameOrOptions } 
    : componentNameOrOptions;
  
  // Default options
  const {
    componentName = 'UnnamedComponent',
    trackRenders = true,
    trackEffects = true,
    trackInteractions = true,
    autoStart = true,
    debugMode = false,
    collectProps = false,
    collectMeasurements = true
  } = options;
  
  // Create monitor instance
  const monitorRef = useRef(null);
  if (!monitorRef.current) {
    monitorRef.current = createComponentMonitor(componentName, { verbose: debugMode });
  }
  
  // State for tracking
  const [isTracking, setIsTracking] = useState(autoStart);
  const [measurements, setMeasurements] = useState([]);
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(null);
  const lastRenderTimeRef = useRef(null);
  
  // Track mounting
  useEffect(() => {
    if (!isTracking) return;
    
    // Record mount time
    mountTimeRef.current = Date.now();
    
    // Start tracking renders
    if (trackRenders) {
      const mountStartMark = monitorRef.current.startRender();
      const props = collectProps ? options : undefined;
      monitorRef.current.endRender(mountStartMark, props);
    }
    
    return () => {
      // Track component lifecycle
      if (isTracking && trackRenders) {
        const totalLifetime = Date.now() - mountTimeRef.current;
        
        if (collectMeasurements) {
          setMeasurements(prev => [...prev, {
            type: 'lifecycle',
            duration: totalLifetime,
            timestamp: Date.now()
          }]);
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Track renders
  useEffect(() => {
    if (!isTracking || !trackRenders) return;
    
    renderCountRef.current += 1;
    
    // Skip first render as it's handled by mount tracking
    if (renderCountRef.current === 1) {
      return;
    }
    
    // Measure render time
    const renderStartMark = monitorRef.current.startRender();
    const props = collectProps ? options : undefined;
    const renderTime = monitorRef.current.endRender(renderStartMark, props);
    
    // Store render time
    lastRenderTimeRef.current = renderTime;
    
    if (collectMeasurements && renderTime) {
      setMeasurements(prev => [...prev, {
        type: 'render',
        duration: renderTime,
        count: renderCountRef.current,
        timestamp: Date.now()
      }]);
    }
  });
  
  /**
   * Start performance tracking
   */
  const startTracking = useCallback(() => {
    setIsTracking(true);
  }, []);
  
  /**
   * Stop performance tracking
   */
  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);
  
  /**
   * Track a custom event
   * 
   * @param {string} eventName - Name of the event
   * @param {Object} data - Event data
   */
  const trackEvent = useCallback((eventName, data = {}) => {
    if (!isTracking) return;
    
    if (collectMeasurements) {
      setMeasurements(prev => [...prev, {
        type: 'event',
        name: eventName,
        data,
        timestamp: Date.now()
      }]);
    }
    
    if (debugMode) {
      console.log(`[${componentName}] Event: ${eventName}`, data);
    }
  }, [isTracking, componentName, debugMode, collectMeasurements]);
  
  /**
   * Track render performance
   * 
   * @param {Object} props - Component props
   * @returns {Object} Tracking information
   */
  const trackRender = useCallback((props = {}) => {
    if (!isTracking || !trackRenders) return { renderCount: renderCountRef.current };
    
    // Create tracking info
    const renderInfo = {
      renderCount: renderCountRef.current,
      lastRenderTime: lastRenderTimeRef.current,
      timestamp: Date.now()
    };
    
    if (debugMode) {
      console.log(`[${componentName}] Render #${renderCountRef.current}`, renderInfo);
    }
    
    return renderInfo;
  }, [isTracking, trackRenders, componentName, debugMode]);
  
  /**
   * Track interaction performance
   * 
   * @param {Object} interactionInfo - Interaction details
   * @returns {number} Interaction duration
   */
  const trackInteraction = useCallback((interactionInfo = {}) => {
    if (!isTracking || !trackInteractions) return 0;
    
    const { action = 'interaction', startTime = Date.now() - 10, ...details } = interactionInfo;
    
    // Track interaction
    const duration = monitorRef.current.trackInteraction(action, startTime, details);
    
    if (collectMeasurements) {
      setMeasurements(prev => [...prev, {
        type: 'interaction',
        action,
        duration,
        details,
        timestamp: Date.now()
      }]);
    }
    
    if (debugMode) {
      console.log(`[${componentName}] Interaction: ${action} (${duration}ms)`, details);
    }
    
    return duration;
  }, [isTracking, trackInteractions, componentName, debugMode, collectMeasurements]);
  
  /**
   * Measure execution time of a function
   * 
   * @param {Function} fn - Function to measure
   * @param {string} name - Measurement name
   * @param {Object} context - Additional context
   * @returns {any} Function result
   */
  const measure = useCallback((fn, name = 'function', context = {}) => {
    if (!isTracking) return fn();
    
    const startTime = performance.now();
    
    try {
      const result = fn();
      
      // For promises, measure the promise resolution
      if (result instanceof Promise) {
        result.then(value => {
          const duration = performance.now() - startTime;
          
          if (collectMeasurements) {
            setMeasurements(prev => [...prev, {
              type: 'async',
              name,
              duration,
              context,
              timestamp: Date.now()
            }]);
          }
          
          if (debugMode) {
            console.log(`[${componentName}] Async ${name}: ${duration.toFixed(2)}ms`, context);
          }
          
          return value;
        }).catch(error => {
          if (debugMode) {
            console.error(`[${componentName}] Error in async ${name}:`, error);
          }
          throw error;
        });
        
        return result;
      }
      
      // For synchronous functions
      const duration = performance.now() - startTime;
      
      if (collectMeasurements) {
        setMeasurements(prev => [...prev, {
          type: 'sync',
          name,
          duration,
          context,
          timestamp: Date.now()
        }]);
      }
      
      if (debugMode) {
        console.log(`[${componentName}] ${name}: ${duration.toFixed(2)}ms`, context);
      }
      
      return result;
    } catch (error) {
      if (debugMode) {
        console.error(`[${componentName}] Error in ${name}:`, error);
      }
      throw error;
    }
  }, [isTracking, componentName, debugMode, collectMeasurements]);
  
  /**
   * Get performance metrics
   * 
   * @returns {Object} Performance metrics
   */
  const getMetrics = useCallback(() => {
    const componentMetrics = monitorRef.current.getMetrics();
    
    return {
      componentName,
      renderCount: renderCountRef.current,
      lastRenderTime: lastRenderTimeRef.current,
      mountTime: mountTimeRef.current ? Date.now() - mountTimeRef.current : null,
      measurements,
      renderTimes: componentMetrics.renderTimes,
      interactions: componentMetrics.interactions,
      timestamp: Date.now()
    };
  }, [componentName, measurements]);
  
  /**
   * Clear collected measurements
   */
  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
  }, []);
  
  // Return hook API
  return {
    isTracking,
    startTracking,
    stopTracking,
    trackEvent,
    trackRender,
    trackInteraction,
    measure,
    getMetrics,
    clearMeasurements,
    renderCount: renderCountRef.current
  };
}

export default usePerformanceTracking;