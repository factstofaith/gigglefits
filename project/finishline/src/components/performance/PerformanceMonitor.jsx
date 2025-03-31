/**
 * PerformanceMonitor Component
 * 
 * Comprehensive performance monitoring and visualization.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { performanceMonitoring } from '../../utils/monitoring/performanceMonitoring';
import { usePerformanceTracking } from '../../hooks/usePerformanceTracking';
import ErrorBoundary from '../common/ErrorBoundary';

// Performance monitor instance
const monitor = performanceMonitoring({
  verbose: process.env.NODE_ENV !== 'production',
  thresholds: {
    fcp: 1000,  // First Contentful Paint (ms)
    lcp: 2500,  // Largest Contentful Paint (ms) 
    fid: 100,   // First Input Delay (ms)
    cls: 0.1,   // Cumulative Layout Shift
    ttfb: 600,  // Time to First Byte (ms)
    tbt: 300,   // Total Blocking Time (ms)
  }
});

/**
 * PerformanceMonitor Component
 */
const PerformanceMonitor = ({
  title = 'Performance Monitor',
  variant = 'default',
  refreshInterval = 30000,
  showControls = true,
  detailed = false,
  onMetricsChange = null,
  className = '',
  ...rest
}) => {
  // Track component's own performance
  const { trackRender, trackInteraction } = usePerformanceTracking('PerformanceMonitor');
  
  // Component state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const refreshTimerRef = useRef(null);
  
  /**
   * Load performance metrics
   */
  const loadMetrics = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      
      // Calculate metrics from monitor
      const data = monitor.calculateMetricsSummary();
      setMetrics(data);
      
      // Notify parent if callback provided
      if (onMetricsChange) {
        onMetricsChange(data);
      }
      
      setError(null);
      
      // Track interaction performance
      trackInteraction({
        action: 'loadMetrics',
        startTime,
        duration: performance.now() - startTime
      });
      
    } catch (err) {
      setError(err.message || 'Failed to load metrics');
      console.error('Error loading performance metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [onMetricsChange, trackInteraction]);
  
  /**
   * Export performance report
   */
  const handleExport = useCallback(() => {
    const startTime = performance.now();
    
    try {
      // Generate and save report
      monitor.saveMetrics();
      
      // Create downloadable report
      const reportData = JSON.stringify(monitor.calculateMetricsSummary(), null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Track interaction performance
      trackInteraction({
        action: 'exportReport',
        startTime,
        duration: performance.now() - startTime
      });
      
    } catch (err) {
      setError(err.message || 'Failed to export report');
      console.error('Error exporting report:', err);
    }
  }, [trackInteraction]);
  
  /**
   * Clear collected metrics
   */
  const handleClear = useCallback(() => {
    const startTime = performance.now();
    
    try {
      monitor.clearMetrics();
      loadMetrics();
      
      // Track interaction performance
      trackInteraction({
        action: 'clearMetrics',
        startTime,
        duration: performance.now() - startTime
      });
      
    } catch (err) {
      setError(err.message || 'Failed to clear metrics');
      console.error('Error clearing metrics:', err);
    }
  }, [loadMetrics, trackInteraction]);
  
  /**
   * Check for performance threshold violations
   */
  const checkViolations = useCallback(() => {
    if (!metrics) return null;
    
    const violations = monitor.checkThresholds();
    return Object.keys(violations).length > 0 ? violations : null;
  }, [metrics]);
  
  // Initialize component and fetch metrics
  useEffect(() => {
    // Load initial metrics
    loadMetrics();
    
    // Set up refresh interval
    if (refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        loadMetrics();
      }, refreshInterval);
    }
    
    // Clean up on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [loadMetrics, refreshInterval]);
  
  // Track render
  trackRender();
  
  // Render error state
  if (error && !metrics) {
    return (
      <div 
        className={`${className} performance-monitor-error`}
        data-testid="performance-monitor-error"
        {...rest}
      >
        <h3>{title} - Error</h3>
        <p>{error}</p>
        <button onClick={loadMetrics}>Retry</button>
      </div>
    );
  }
  
  // Render loading state
  if (loading && !metrics) {
    return (
      <div 
        className={`${className} performance-monitor-loading`}
        data-testid="performance-monitor-loading"
        {...rest}
      >
        <h3>Loading {title}...</h3>
      </div>
    );
  }
  
  // Determine if there are any violations
  const violations = checkViolations();
  
  // Render metrics
  return (
    <div 
      className={`${className} performance-monitor ${variant}`}
      data-testid="performance-monitor"
      {...rest}
    >
      <div className="performance-monitor-header">
        <h3>{title}</h3>
        
        {showControls && (
          <div className="performance-monitor-controls">
            <button 
              onClick={loadMetrics}
              className="performance-monitor-refresh"
              data-testid="performance-monitor-refresh"
            >
              Refresh
            </button>
            <button 
              onClick={handleExport}
              className="performance-monitor-export"
              data-testid="performance-monitor-export"
            >
              Export
            </button>
            <button 
              onClick={handleClear}
              className="performance-monitor-clear"
              data-testid="performance-monitor-clear"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      
      {violations && (
        <div 
          className="performance-monitor-violations"
          data-testid="performance-monitor-violations"
        >
          <h4>Performance Violations</h4>
          <ul>
            {Object.entries(violations).map(([metric, instances]) => (
              <li key={metric}>
                <strong>{metric}:</strong> {instances.length} violations
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="performance-monitor-summary">
        <h4>Web Vitals</h4>
        {metrics && metrics.webVitals && Object.entries(metrics.webVitals).length > 0 ? (
          <table className="performance-monitor-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Average</th>
                <th>Min</th>
                <th>Max</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metrics.webVitals).map(([name, data]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{data.avg ? data.avg.toFixed(2) : 'N/A'}</td>
                  <td>{data.min !== Number.MAX_VALUE ? data.min.toFixed(2) : 'N/A'}</td>
                  <td>{data.max ? data.max.toFixed(2) : 'N/A'}</td>
                  <td>{data.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Web Vitals data collected yet</p>
        )}
      </div>
      
      <div className="performance-monitor-components">
        <h4>Component Render Times</h4>
        {metrics && metrics.componentRenderTimes && Object.entries(metrics.componentRenderTimes).length > 0 ? (
          <table className="performance-monitor-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Average (ms)</th>
                <th>Min (ms)</th>
                <th>Max (ms)</th>
                <th>P95 (ms)</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metrics.componentRenderTimes).map(([name, data]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{data.avg.toFixed(2)}</td>
                  <td>{data.min.toFixed(2)}</td>
                  <td>{data.max.toFixed(2)}</td>
                  <td>{data.p95.toFixed(2)}</td>
                  <td>{data.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No component render data collected yet</p>
        )}
      </div>
      
      {detailed && metrics && (
        <div className="performance-monitor-details">
          <h4>Additional Details</h4>
          <ul>
            <li>Resource Count: {metrics.resourceCount}</li>
            <li>Interaction Count: {metrics.interactionCount}</li>
            <li>Error Count: {metrics.errorCount}</li>
            <li>Session ID: {metrics.sessionId}</li>
            <li>Last Updated: {new Date(metrics.timestamp).toLocaleString()}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

PerformanceMonitor.propTypes = {
  /** Title of the monitor */
  title: PropTypes.string,
  /** Display variant */
  variant: PropTypes.oneOf(['default', 'compact', 'detailed']),
  /** Refresh interval in milliseconds */
  refreshInterval: PropTypes.number,
  /** Whether to show control buttons */
  showControls: PropTypes.bool,
  /** Whether to show detailed metrics */
  detailed: PropTypes.bool,
  /** Callback when metrics change */
  onMetricsChange: PropTypes.func,
  /** Additional class name */
  className: PropTypes.string
};

/**
 * Wrapped PerformanceMonitor with ErrorBoundary
 */
const PerformanceMonitorWithErrorBoundary = (props) => (
  <ErrorBoundary
    fallback={<div>Error in Performance Monitor</div>}
    name="PerformanceMonitor"
  >
    <PerformanceMonitor {...props} />
  </ErrorBoundary>
);

export default PerformanceMonitorWithErrorBoundary;