import { ENV } from "@/utils/environmentConfig";
/**
 * Docker Error Handling Components
 * 
 * This module exports Docker-specific error handling components and hooks
 * for handling container network errors, health checks, and cross-container
 * error propagation.
 * 
 * IMPORTANT: These components should only be used in Docker container environments.
 */

// Re-export all Docker error handling components
export { useDockerNetworkErrorHandler } from './useDockerNetworkErrorHandler';
export { DockerNetworkErrorBoundary } from './DockerNetworkErrorBoundary';
export { useHealthCheckHandler } from './useHealthCheckHandler';
export { HealthCheckProvider } from './HealthCheckProvider';
export { useContainerErrorPropagation } from './useContainerErrorPropagation';
export { ContainerErrorContext } from './ContainerErrorContext';
export { HealthCheck } from './HealthCheck';
export { NetworkStatus } from './NetworkStatus';

// Export Docker error service
export { default as dockerErrorService } from '../docker-error-service';

// Export the Docker Error Handler component
export { default as DockerErrorHandler } from '../DockerErrorHandler';

// Export Docker error handling utilities
export { initDockerErrorService, reportDockerError, createDockerComponentErrorHandler, withDockerErrorHandling } from '../docker-error-service';

/**
 * Determine if the current environment is a Docker container
 * @returns {boolean} True if running in a Docker container
 */
export function isDockerEnvironment() {
  return (ENV.REACT_APP_RUNNING_IN_DOCKER || '') === 'true';
}

/**
 * Docker environment utilities
 */
export const DockerEnvironment = {
  isDockerEnvironment,
  /**
   * Get Docker-specific configuration
   * @returns {Object} Docker configuration object
   */
  getConfiguration() {
    return {
      containerId: ENV.REACT_APP_CONTAINER_ID || '' || 'unknown',
      containerVersion: ENV.REACT_APP_CONTAINER_VERSION || '' || 'unknown',
      environment: ENV.REACT_APP_DOCKER_ENVIRONMENT || '' || 'production',
      healthCheckInterval: parseInt(ENV.REACT_APP_HEALTH_CHECK_INTERVAL || '' || '60000', 10)
    };
  },
  /**
   * Log a message to container logs
   * @param {string} message - Message to log
   * @param {Object} [data] - Additional data to log
   * @param {string} [level='info'] - Log level (info, warn, error)
   */
  log(message, data = {}, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[DOCKER][${level.toUpperCase()}][${timestamp}]`;
    switch (level) {
      case 'error':
        console.error(`${prefix} ${message}`, data);
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`, data);
        break;
      default:
        console.log(`${prefix} ${message}`, data);
    }
  }
};