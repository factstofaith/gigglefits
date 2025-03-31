/**
 * Error Tracking Service
 * 
 * Centralized error tracking and reporting service that can be integrated
 * with third-party error monitoring services like Sentry, LogRocket, etc.
 */

// Configuration
const config = {
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV || 'development',
  sampleRate: 1.0, // Capture all errors in development, could be reduced in production
  ignoreErrors: [
    // Add patterns to ignore certain errors
    'ResizeObserver loop limit exceeded',
    'Network request failed',
    /^Script error./i,
  ],
};

// Initialize third-party error tracking
function initErrorTracking() {
  if (!config.enabled) return;
  
  // Example for Sentry integration:
  /*
  import * as Sentry from '@sentry/react';
  
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: config.environment,
    release: process.env.REACT_APP_VERSION,
    sampleRate: config.sampleRate,
    ignoreErrors: config.ignoreErrors,
    beforeSend(event) {
      // You can modify or filter events before sending to Sentry
      return event;
    },
  });
  */
  
  // Add initialization for other services here
}

// Track an error
function trackError(error, errorInfo = {}, tags = {}) {
  const errorDetails = {
    message: error?.message || String(error),
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    ...errorInfo,
    tags: {
      environment: config.environment,
      ...tags,
    },
  };
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorTracking]', errorDetails);
  }
  
  // Skip if error should be ignored
  if (shouldIgnoreError(error)) {
    return;
  }
  
  // Send to tracking service if enabled
  if (config.enabled) {
    // Send to appropriate service
    // Example for Sentry:
    /*
    Sentry.captureException(error, {
      extra: errorInfo,
      tags,
    });
    */
  }
  
  return errorDetails;
}

// Check if error should be ignored
function shouldIgnoreError(error) {
  const errorMessage = error?.message || String(error);
  
  return config.ignoreErrors.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(errorMessage);
    }
    return errorMessage.includes(pattern);
  });
}

// Track handled errors (doesn't affect app operation but should be monitored)
function trackHandledError(error, context = {}) {
  return trackError(error, { handled: true, ...context }, { handled: true });
}

// Set user context for error tracking
function setUserContext(user) {
  if (!config.enabled) return;
  
  // Example for Sentry:
  /*
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
  */
}

// Clear user context (e.g., on logout)
function clearUserContext() {
  if (!config.enabled) return;
  
  // Example for Sentry:
  /*
  Sentry.configureScope(scope => scope.setUser(null));
  */
}

// Add breadcrumb for contextual information
function addBreadcrumb(message, category = 'app', data = {}) {
  if (!config.enabled) return;
  
  // Example for Sentry:
  /*
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
  */
}

// Usage with React error boundary
function errorBoundaryHandler(error, errorInfo) {
  trackError(error, {
    componentStack: errorInfo?.componentStack,
    type: 'react-error-boundary',
  });
}

export default {
  init: initErrorTracking,
  trackError,
  trackHandledError,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  errorBoundaryHandler,
};
