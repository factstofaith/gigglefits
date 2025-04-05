/**
 * Docker API Error Handling Module
 * 
 * This module provides Docker-specific API error handling utilities
 * for containerized environments.
 */

import { ErrorSeverity } from '../error-service';
import { createDockerFetchWithErrorHandling, createDockerAxiosErrorInterceptor } from './dockerNetworkErrorHandler';
import { ENV } from '@/utils/environmentConfig';

/**
 * Configure Docker API error handling for fetch
 * @returns {function} Enhanced fetch function with Docker error handling
 */
export function configureDockerApiFetch() {
  const containerInfo = {
    containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown',
    containerName: 'frontend',
    containerVersion: ENV.REACT_APP_CONTAINER_VERSION || 'unknown',
    isDocker: ENV.REACT_APP_RUNNING_IN_DOCKER === 'true'
  };
  
  return createDockerFetchWithErrorHandling(window.fetch, {
    containerInfo,
    propagateErrors: true,
    addHealthCheck: true
  });
}

/**
 * Configure Docker API error handling for axios
 * @param {Object} axios - Axios instance
 * @returns {function} Function to remove interceptors
 */
export function configureDockerAxios(axios) {
  const containerInfo = {
    containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown',
    containerName: 'frontend',
    containerVersion: ENV.REACT_APP_CONTAINER_VERSION || 'unknown',
    isDocker: ENV.REACT_APP_RUNNING_IN_DOCKER === 'true'
  };
  
  return createDockerAxiosErrorInterceptor(axios, {
    containerInfo,
    propagateErrors: true,
    addHealthCheck: true
  });
}

/**
 * Custom wrapper for API requests with Docker error handling
 * @param {function} apiFunction - The API function to wrap
 * @param {Object} options - Options for error handling
 * @returns {function} Wrapped API function with Docker error handling
 */
export function withDockerApiErrorHandling(apiFunction, options = {}) {
  const { 
    boundary = 'docker-api', 
    severity = ErrorSeverity.ERROR,
    retry = true,
    maxRetries = 3,
    retryDelay = 1000
  } = options;
  
  return async function wrappedApiFunction(...args) {
    let retryCount = 0;
    
    while (true) {
      try {
        return await apiFunction(...args);
      } catch (error) {
        const isNetworkError = error.isDockerNetworkError || 
          (error.message && (
            error.message.includes('network') ||
            error.message.includes('connection') ||
            error.message.includes('timeout')
          ));
        
        // Add Docker-specific metadata
        error.dockerMetadata = {
          containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown',
          containerVersion: ENV.REACT_APP_CONTAINER_VERSION || 'unknown',
          isDocker: ENV.REACT_APP_RUNNING_IN_DOCKER === 'true',
          boundary,
          apiFunction: apiFunction.name || 'unknown',
          args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)),
          retryCount
        };
        
        // Check if we should retry
        if (retry && isNetworkError && retryCount < maxRetries) {
          retryCount++;
          
          // Log retry attempt
          console.warn(`[DOCKER_API] Retrying API call (${retryCount}/${maxRetries}):`, {
            function: apiFunction.name || 'unknown',
            error: error.message,
            isNetworkError
          });
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount - 1)));
          continue;
        }
        
        // Log the error to container stdout/stderr
        console.error('[DOCKER_API_ERROR]', {
          message: error.message,
          isNetworkError,
          function: apiFunction.name || 'unknown',
          dockerMetadata: error.dockerMetadata,
          retryCount,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      }
    }
  };
}

// Export Docker API error handling utilities
export default {
  configureDockerApiFetch,
  configureDockerAxios,
  withDockerApiErrorHandling
};