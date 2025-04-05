/**
 * Docker Error Handling HOC Module
 * 
 * This module provides Higher-Order Components (HOCs) for adding
 * Docker-specific error handling to React components.
 */

import React, { useEffect } from 'react';
import { ENV } from '@/utils/environmentConfig';
import { withDockerErrorHandling } from './docker-error-service';
import { useContainerErrorPropagation } from './ContainerErrorContext';

/**
 * HOC that adds Docker error handling to a React component
 * @param {Object} options - Error handling options
 * @returns {Function} HOC function that wraps a component
 */
export function withDockerError(options = {}) {
  const { 
    boundary = 'docker-component',
    severity = 'error',
    logToStdout = true,
    includeProps = false,
    onError = null
  } = options;
  
  return function wrapWithDockerError(Component) {
    // Skip wrapping if not in Docker environment
    if (ENV.REACT_APP_RUNNING_IN_DOCKER !== 'true') {
      return Component;
    }
    
    // Create the wrapped component
    const WrappedComponent = (props) => {
      // Mark component for Docker container metrics
      useEffect(() => {
        if (typeof window !== 'undefined' && window.__DOCKER_COMPONENTS__) {
          window.__DOCKER_COMPONENTS__.add(boundary);
        } else if (typeof window !== 'undefined') {
          window.__DOCKER_COMPONENTS__ = new Set([boundary]);
        }
        
        return () => {
          if (typeof window !== 'undefined' && window.__DOCKER_COMPONENTS__) {
            window.__DOCKER_COMPONENTS__.delete(boundary);
          }
        };
      }, []);
      
      // Wrap the component with Docker error handling
      return (
        <Component {...props} />
      );
    };
    
    // Display name for debugging
    WrappedComponent.displayName = `withDockerError(${Component.displayName || Component.name || 'Component'})`;
    
    // Wrap with Docker error handling HOC
    return withDockerErrorHandling(WrappedComponent, {
      boundary,
      severity,
      logToStdout,
      includeProps,
      onError
    });
  };
}

/**
 * Create a Docker error handler function
 * @param {string} componentName - The component name
 * @param {Object} options - Error handler options
 * @returns {Function} Error handler function
 */
export function createDockerErrorHandler(componentName, options = {}) {
  const {
    severity = 'error',
    logToStdout = true,
    propagateError = true
  } = options;
  
  // Get error propagation if available
  let containerErrorPropagation = null;
  if (typeof window !== 'undefined' && window.__CONTAINER_ERROR_PROPAGATION__) {
    containerErrorPropagation = window.__CONTAINER_ERROR_PROPAGATION__;
  }
  
  return function dockerErrorHandler(error, errorInfo = {}) {
    // Skip if not in Docker environment
    if (ENV.REACT_APP_RUNNING_IN_DOCKER !== 'true') {
      return;
    }
    
    // Log to container stdout/stderr
    if (logToStdout) {
      console.error(`[DOCKER_COMPONENT_ERROR] ${componentName}:`, error.message, {
        name: error.name,
        stack: error.stack,
        componentName,
        errorInfo,
        timestamp: new Date().toISOString(),
        containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown'
      });
    }
    
    // Propagate error to other containers if enabled
    if (propagateError && containerErrorPropagation && containerErrorPropagation.propagateError) {
      containerErrorPropagation.propagateError(error, {
        severity,
        metadata: {
          componentName,
          errorInfo,
          timestamp: new Date().toISOString()
        }
      }).catch(() => {
        // Ignore propagation errors
      });
    }
  };
}

/**
 * React hook for using Docker error handler
 * @param {string} componentName - The component name
 * @param {Object} options - Error handler options
 * @returns {Object} Docker error handler
 */
export function useDockerErrorHandler(componentName, options = {}) {
  // Try to use container error propagation hook
  let containerErrorPropagation = null;
  try {
    containerErrorPropagation = useContainerErrorPropagation();
  } catch (e) {
    // Hook not available in context, continue without it
  }
  
  // Create reusable error handler
  const handleError = React.useCallback((error, errorInfo = {}) => {
    // Skip if not in Docker environment
    if (ENV.REACT_APP_RUNNING_IN_DOCKER !== 'true') {
      return;
    }
    
    // Log to container stdout/stderr
    if (options.logToStdout !== false) {
      console.error(`[DOCKER_COMPONENT_ERROR] ${componentName}:`, error.message, {
        name: error.name,
        stack: error.stack,
        componentName,
        errorInfo,
        timestamp: new Date().toISOString(),
        containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown'
      });
    }
    
    // Propagate error to other containers if enabled
    if (options.propagateError !== false && containerErrorPropagation && containerErrorPropagation.propagateError) {
      containerErrorPropagation.propagateError(error, {
        severity: options.severity || 'error',
        metadata: {
          componentName,
          errorInfo,
          timestamp: new Date().toISOString()
        }
      }).catch(() => {
        // Ignore propagation errors
      });
    }
    
    // Call custom error handler if provided
    if (typeof options.onError === 'function') {
      options.onError(error, errorInfo);
    }
  }, [componentName, options, containerErrorPropagation]);
  
  return {
    handleError,
    isDockerEnvironment: ENV.REACT_APP_RUNNING_IN_DOCKER === 'true',
    containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown',
    containerVersion: ENV.REACT_APP_CONTAINER_VERSION || 'unknown',
    propagateError: containerErrorPropagation ? containerErrorPropagation.propagateError : null
  };
}

// Export Docker error handling HOCs and utilities
export default {
  withDockerError,
  createDockerErrorHandler,
  useDockerErrorHandler
};