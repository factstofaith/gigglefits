import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling";

/**
 * Performance Monitoring Provider Component
 * 
 * A component for setting up performance monitoring at the application level.
 * Part of the zero technical debt performance implementation.
 * 
 * @module components/common/performance/PerformanceMonitoringProvider
 */
import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { initializePerformanceMonitoring, checkAllBudgets, clearPerformanceMetrics, clearViolations, generatePerformanceReport, generateBudgetReport } from "@/utils/performance";
import PerformanceBudgetPanel from '../PerformanceBudgetPanel';

// Create performance context
import { ENV } from "@/utils/environmentConfig";
export const PerformanceContext = createContext({
  isMonitoringEnabled: false,
  toggleMonitoring: () => {},
  checkPerformance: () => {},
  resetMetrics: () => {},
  generateReport: () => {},
  performanceData: {},
  violationCount: 0,
  isDevelopment: false
});

/**
 * Performance Monitoring Provider Component
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export const PerformanceMonitoringProvider = ({
  children,
  initiallyEnabled = ENV.NODE_ENV === 'development',
  showBudgetPanel = ENV.NODE_ENV === 'development',
  budgetPanelPosition = 'bottom-right',
  monitoringOptions = {}
}) => {
  // Store monitoring state
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(initiallyEnabled);
  const [performanceData, setPerformanceData] = useState({});
  const [violationCount, setViolationCount] = useState(0);
  const [cleanupFn, setCleanupFn] = useState(null);

  // Check if we're in development environment
  const isDevelopment = ENV.NODE_ENV === 'development';

  /**
   * Toggle monitoring
   */
  const toggleMonitoring = useCallback(() => {
    setIsMonitoringEnabled(prev => !prev);
  }, []);

  /**
   * Check performance against budgets
   */
  const checkPerformance = useCallback(() => {
    const violations = checkAllBudgets({
      logToConsole: isDevelopment
    });
    const totalViolations = Object.values(violations).reduce((sum, categoryViolations) => sum + categoryViolations.length, 0);
    setViolationCount(totalViolations);
    return violations;
  }, [isDevelopment]);

  /**
   * Reset all performance metrics
   */
  const resetMetrics = useCallback(() => {
    clearPerformanceMetrics();
    clearViolations();
    setViolationCount(0);
  }, []);

  /**
   * Generate performance reports
   */
  const generateReport = useCallback((type = 'performance') => {
    if (type === 'budget') {
      return generateBudgetReport();
    } else {
      return generatePerformanceReport();
    }
  }, []);

  /**
   * Update function for metrics
   */
  const handleMetricUpdate = useCallback((category, name, value) => {
    setPerformanceData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [name]: value
      }
    }));
  }, []);

  // Initialize performance monitoring when enabled
  useEffect(() => {
    if (isMonitoringEnabled) {
      // Initialize with options
      const cleanup = initializePerformanceMonitoring({
        ...monitoringOptions,
        onMetricUpdate: handleMetricUpdate
      });
      setCleanupFn(() => cleanup);

      // Perform initial check
      checkPerformance();
    } else if (cleanupFn) {
      // Clean up if monitoring is disabled
      cleanupFn();
      setCleanupFn(null);
    }
    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [isMonitoringEnabled, monitoringOptions, checkPerformance, handleMetricUpdate]);

  // Create context value with useMemo for performance optimization
  const contextValue = useMemo(() => ({
    isMonitoringEnabled,
    toggleMonitoring,
    checkPerformance,
    resetMetrics,
    generateReport,
    performanceData,
    violationCount,
    isDevelopment
  }), [isMonitoringEnabled, toggleMonitoring, checkPerformance, resetMetrics, generateReport, performanceData, violationCount, isDevelopment]);
  return <PerformanceContext.Provider value={contextValue}>
      {children}
      
      {isDevelopment && showBudgetPanel && isMonitoringEnabled && <PerformanceBudgetPanel position={budgetPanelPosition} autoExpandViolations={true} initiallyOpen={false} refreshInterval={30000} logToConsole={false} />}


    </PerformanceContext.Provider>;
};

/**
 * Custom hook to use performance monitoring context
 * 
 * @returns {Object} Performance monitoring context
 */
export const usePerformanceMonitoring = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceMonitoring must be used within a PerformanceMonitoringProvider');
  }
  return context;
};
PerformanceMonitoringProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initiallyEnabled: PropTypes.bool,
  showBudgetPanel: PropTypes.bool,
  budgetPanelPosition: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  monitoringOptions: PropTypes.object
};
export default withErrorBoundary(PerformanceMonitoringProvider, {
  fallback: (error, resetErrorBoundary) => <div className="error-boundary-fallback">
      <h3>Performance Monitoring Error</h3>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Reset</button>
    </div>
});