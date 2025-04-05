/**
 * Docker Error Handling Integration Module
 * 
 * This module provides integration utilities for connecting Docker error handling
 * with the rest of the application.
 */

import { withDockerErrorHandling } from './docker-error-service';
import { DockerErrorHandler } from './DockerErrorHandler';
import { useContainerErrorPropagation } from './ContainerErrorContext';

/**
 * Initialize the Docker error handling system
 * @param {Object} options - Configuration options
 * @returns {boolean} True if initialized successfully
 */
import { ENV } from "@/utils/environmentConfig";
export function initializeDockerErrorHandling(options = {}) {
  const {
    window,
    containerId = ENV.REACT_APP_CONTAINER_ID || '',
    errorReportingUrl = ENV.REACT_APP_ERROR_REPORTING_URL || '',
    logToConsole = true
  } = options;
  if ((ENV.REACT_APP_RUNNING_IN_DOCKER || '') !== 'true') {
    return false;
  }
  try {
    // Set up global Docker error handler
    if (window && !window.__DOCKER_ERROR_HANDLER_INITIALIZED__) {
      // Set up unhandled error listeners
      const originalOnError = window.onerror;
      window.onerror = function (message, source, lineno, colno, error) {
        // Log to container stdout/stderr
        if (logToConsole) {
          console.error('[DOCKER_UNHANDLED_ERROR]', {
            message,
            source,
            lineno,
            colno,
            error: error ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            } : null,
            container: {
              id: containerId || 'unknown',
              timestamp: new Date().toISOString()
            }
          });
        }

        // Call original handler if exists
        if (typeof originalOnError === 'function') {
          return originalOnError.call(this, message, source, lineno, colno, error);
        }
        return false;
      };

      // Set up unhandled promise rejection handler
      const originalOnUnhandledRejection = window.onunhandledrejection;
      window.onunhandledrejection = function (event) {
        // Log to container stdout/stderr
        if (logToConsole) {
          console.error('[DOCKER_UNHANDLED_REJECTION]', {
            reason: event.reason,
            promise: event.promise,
            container: {
              id: containerId || 'unknown',
              timestamp: new Date().toISOString()
            }
          });
        }

        // Call original handler if exists
        if (typeof originalOnUnhandledRejection === 'function') {
          return originalOnUnhandledRejection.call(this, event);
        }
      };

      // Mark as initialized
      window.__DOCKER_ERROR_HANDLER_INITIALIZED__ = true;
    }
    return true;
  } catch (err) {
    console.error('[DOCKER_ERROR_HANDLER] Failed to initialize:', err);
    return false;
  }
}

/**
 * Check if the Docker error handling system is initialized
 * @returns {boolean} True if initialized
 */
export function isDockerErrorHandlingInitialized() {
  if (typeof window !== 'undefined') {
    return !!window.__DOCKER_ERROR_HANDLER_INITIALIZED__;
  }
  return false;
}

// Export Docker error handling components and utilities
export { DockerErrorHandler, withDockerErrorHandling, useContainerErrorPropagation };