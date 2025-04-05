import { ENV } from "@/utils/environmentConfig";
/**
 * Performance Utilities Index
 * 
 * Centralizes exports of all performance optimization utilities.
 * Part of the zero technical debt performance implementation.
 * 
 * @module utils/performance
 */

// Component optimization utilities
export { optimizeComponent, withOptimization, createOptimizedHandlers, createOptimizedValues, withRenderTiming, optimizeListRendering, DeferredRender, withDebouncedRendering } from './componentOptimizer';

// Performance monitoring utilities
export { enablePerformanceMonitoring, getPerformanceMetrics, clearPerformanceMetrics, timeFunction, timeAsyncFunction, createPerformantEventHandler, generatePerformanceReport } from './performanceMonitor';

// Performance budget utilities
export { setPerformanceBudget, getPerformanceBudget, checkComponentBudgets, checkInteractionBudgets, checkResourceBudgets, checkNavigationBudgets, checkBundleSizeBudgets, checkAllBudgets, getViolations, clearViolations, onBudgetViolation, generateBudgetReport, createBudgetPlugin } from './performanceBudget';

// Render tracking utilities
export { default as withRenderTracking, enableRenderTracking, disableRenderTracking, printRenderStats, resetRenderStats } from './withRenderTracking';

// Bundle size analysis utilities
export { enableBundleSizeTracking, generateBundleReport, trackImport, generateBundleOptimizationReport } from './bundleAnalyzer';

// Lazy loading utilities
export { lazyWithMonitoring, LazyComponentLoader, lazyRoute } from './lazyLoadWithMonitoring';

// Export a convenience initializer
export const initializePerformanceMonitoring = (options = {}) => {
  const {
    trackRenders = true,
    trackBundleSize = true,
    ...monitoringOptions
  } = options;

  // Initialize performance monitoring
  const disableMonitoring = enablePerformanceMonitoring(monitoringOptions);

  // Initialize render tracking if requested
  if (trackRenders) {
    enableRenderTracking();
  }

  // Initialize bundle size tracking if requested
  if (trackBundleSize && ENV.NODE_ENV === 'development') {
    enableBundleSizeTracking();
  }

  // Return cleanup function
  return () => {
    disableMonitoring();
    disableRenderTracking();
  };
};