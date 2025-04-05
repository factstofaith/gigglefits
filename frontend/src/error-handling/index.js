/**
 * Error handling module for TAP Integration Platform
 * 
 * This module exports a comprehensive set of error handling utilities
 * designed to catch, report, track, and display errors in the application.
 */

// Error boundary component
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as withErrorBoundary } from './withErrorBoundary';

// Error context for global error state
export { 
  ErrorProvider, 
  useErrorContext 
} from './ErrorContext';

// Error banner component
export { default as ErrorBanner } from './ErrorBanner';

// Error hooks and utilities
export { default as useErrorHandler } from './useErrorHandler';

// Error service for reporting and logging
export { 
  reportError,
  logError,
  setErrorMetadata,
  initErrorService,
  resetErrorService,
  handleAsyncError,
  withErrorHandling,
  ErrorSeverity
} from './error-service';

// Network error handling utilities
export {
  enhancedFetch,
  createFetchWithErrorHandling,
  createAxiosErrorInterceptor,
  configureNetworkErrorHandler,
  parseErrorResponse,
  getHttpStatusMessage,
  isOnline
} from './networkErrorHandler';

// Docker-specific error handling
export * from './docker';

// Export default object for simpler imports
export default {
  ErrorBoundary,
  withErrorBoundary,
  ErrorProvider,
  useErrorContext,
  ErrorBanner,
  useErrorHandler,
  reportError,
  logError,
  setErrorMetadata,
  initErrorService,
  resetErrorService,
  handleAsyncError,
  withErrorHandling,
  ErrorSeverity,
  enhancedFetch,
  createFetchWithErrorHandling,
  createAxiosErrorInterceptor,
  configureNetworkErrorHandler,
  parseErrorResponse,
  getHttpStatusMessage,
  isOnline
};