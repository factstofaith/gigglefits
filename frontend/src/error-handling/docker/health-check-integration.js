/**
 * Docker Health Check Integration
 * 
 * This module provides utilities for integrating with Docker health checks
 * and monitoring the health of a containerized frontend application.
 */

import { ENV } from '@/utils/environmentConfig';
import { useHealthCheckProvider } from './HealthCheckProvider';

/**
 * Initializes health check monitoring for Docker environments
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.interval - Health check interval in milliseconds
 * @param {Function} options.onUnhealthy - Callback when app becomes unhealthy
 * @returns {Object} Health check control methods
 */
export function initDockerHealthCheck(options = {}) {
  const {
    interval = 30000,
    onUnhealthy = null
  } = options;

  // Only initialize in Docker environments
  const isDockerEnvironment = ENV.REACT_APP_RUNNING_IN_DOCKER === 'true';
  if (!isDockerEnvironment) {
    return {
      isActive: false,
      setHealthStatus: () => {},
      getHealthStatus: () => 'healthy'
    };
  }

  // Initialize health check element
  let healthCheckElement = document.getElementById('docker-health-check');
  
  if (!healthCheckElement) {
    healthCheckElement = document.createElement('div');
    healthCheckElement.id = 'docker-health-check';
    healthCheckElement.style.display = 'none';
    healthCheckElement.setAttribute('data-status', 'healthy');
    healthCheckElement.setAttribute('data-timestamp', Date.now().toString());
    document.body.appendChild(healthCheckElement);
  }

  // Update health check timestamp at regular intervals
  const intervalId = setInterval(() => {
    if (healthCheckElement) {
      healthCheckElement.setAttribute('data-timestamp', Date.now().toString());
    }
  }, interval);

  /**
   * Sets the current health status
   * 
   * @param {string} status - Health status ('healthy', 'unhealthy', 'warning')
   * @param {Object} details - Additional health details
   */
  const setHealthStatus = (status, details = {}) => {
    if (healthCheckElement) {
      healthCheckElement.setAttribute('data-status', status);
      
      // Add additional attributes for detailed health information
      Object.entries(details).forEach(([key, value]) => {
        healthCheckElement.setAttribute(`data-${key}`, String(value));
      });
      
      // Call onUnhealthy callback if status is unhealthy
      if (status === 'unhealthy' && typeof onUnhealthy === 'function') {
        onUnhealthy(details);
      }
    }
  };

  /**
   * Gets the current health status
   * 
   * @returns {string} Current health status
   */
  const getHealthStatus = () => {
    if (healthCheckElement) {
      return healthCheckElement.getAttribute('data-status') || 'unknown';
    }
    return 'unknown';
  };

  // Return control methods
  return {
    isActive: true,
    setHealthStatus,
    getHealthStatus,
    _cleanup: () => {
      clearInterval(intervalId);
      if (healthCheckElement && healthCheckElement.parentNode) {
        healthCheckElement.parentNode.removeChild(healthCheckElement);
      }
    }
  };
}

/**
 * React hook for interacting with Docker health checks
 * 
 * @returns {Object} Health check methods and state
 */
export function useDockerHealthCheck() {
  // Try to get the health check context
  let healthCheckContext = null;
  try {
    healthCheckContext = useHealthCheckProvider();
  } catch (e) {
    // Context not available, continue without it
  }

  // Only enable in Docker environments
  const isDockerEnvironment = ENV.REACT_APP_RUNNING_IN_DOCKER === 'true';
  if (!isDockerEnvironment || !healthCheckContext) {
    return {
      isActive: false,
      setHealthStatus: () => {},
      getHealthStatus: () => 'healthy',
      isHealthy: true
    };
  }

  // Get state and setState from context
  const { state, setState } = healthCheckContext;

  /**
   * Sets the current health status
   * 
   * @param {string} status - Health status ('healthy', 'unhealthy', 'warning')
   * @param {Object} details - Additional health details
   */
  const setHealthStatus = (status, details = {}) => {
    // Update the DOM element
    const healthCheckElement = document.getElementById('docker-health-check');
    if (healthCheckElement) {
      healthCheckElement.setAttribute('data-status', status);
      
      // Add additional attributes for detailed health information
      Object.entries(details).forEach(([key, value]) => {
        healthCheckElement.setAttribute(`data-${key}`, String(value));
      });
    }
    
    // Update the context state
    setState(prevState => ({
      ...prevState,
      status,
      details,
      lastChecked: Date.now()
    }));
  };

  /**
   * Gets the current health status
   * 
   * @returns {string} Current health status
   */
  const getHealthStatus = () => {
    return state.status || 'healthy';
  };

  // Return health check interface
  return {
    isActive: true,
    setHealthStatus,
    getHealthStatus,
    isHealthy: state.status === 'healthy',
    lastChecked: state.lastChecked,
    details: state.details
  };
}