/**
 * Utility functions
 * Pure functions for common operations
 */

// Form validation utilities
export * from './validation';

// Performance monitoring utilities
export {
  PerformanceMarker,
  createPerformanceMarker,
  measureFunction,
  useRenderTime,
  performanceMonitor,
  withRenderTime
} from './performance';

// Theme utilities
export {
  getThemeValue,
  getColor,
  getSpacing,
  getTypography,
  responsive,
  createTransition,
  getShadow,
  createColoredShadow,
  truncateText,
  visuallyHidden
} from './themeUtils';

// Testing utilities
export {
  renderWithProviders,
  AllProviders,
  mockResizeObserver,
  mockIntersectionObserver,
  mockLocalStorage,
  mockFetch,
  delay,
  rejectPromise,
  createHookTestComponent
} from './testUtils';