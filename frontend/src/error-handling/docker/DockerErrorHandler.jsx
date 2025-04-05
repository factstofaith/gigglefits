import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ENV } from '@/utils/environmentConfig';
import { useErrorContext } from '../ErrorContext';
import dockerErrorService from './docker-error-service';

/**
 * DockerErrorHandler Component
 * 
 * This component integrates with the Docker error service to ensure all errors
 * from the application are properly logged to container stdout/stderr and can
 * be monitored by container orchestration systems.
 * 
 * It adds Docker-specific error handling capabilities to the application and
 * periodically reports container health status.
 */
export function DockerErrorHandler({ children }) {
  const [initialized, setInitialized] = useState(false);
  const { globalError, addError, setMetadata } = useErrorContext();
  
  // Initialize Docker error handling
  useEffect(() => {
    // Only apply Docker-specific error handling in containerized environments
    if (ENV.REACT_APP_RUNNING_IN_DOCKER === 'true' && !initialized) {
      console.log('[DOCKER] Initializing Docker error handler');
      
      // Set metadata in the error context
      setMetadata({
        containerized: true,
        containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown',
        containerVersion: ENV.REACT_APP_CONTAINER_VERSION || 'unknown',
        dockerEnvironment: ENV.REACT_APP_DOCKER_ENVIRONMENT || 'production'
      });
      
      // Set up a periodic health check reporter
      const healthCheckInterval = parseInt(ENV.REACT_APP_HEALTH_CHECK_INTERVAL || '60000', 10);
      const healthCheckTimer = setInterval(() => {
        dockerErrorService.logContainerHealth();
      }, healthCheckInterval);
      
      setInitialized(true);
      
      // Clean up on unmount
      return () => {
        clearInterval(healthCheckTimer);
      };
    }
  }, [initialized, setMetadata]);
  
  // Monitor and log global errors to container logs
  useEffect(() => {
    if (globalError && ENV.REACT_APP_RUNNING_IN_DOCKER === 'true') {
      // Log to container stdout
      console.error(`[DOCKER_GLOBAL_ERROR] ${globalError.message}`);
      
      // Report through Docker error service
      dockerErrorService.reportDockerError(
        globalError, 
        { source: 'global' }, 
        'global', 
        dockerErrorService.ErrorSeverity.ERROR
      );
    }
  }, [globalError]);
  
  // Create hidden health check component for container monitoring
  const HealthCheck = (
    <div 
      id="docker-health-check" 
      style={{ display: 'none' }} 
      data-status="healthy" 
      data-timestamp={Date.now()}
      data-errors={globalError ? 'true' : 'false'}
    />
  );
  
  // Only apply Docker-specific handling in container environments
  if (ENV.REACT_APP_RUNNING_IN_DOCKER !== 'true') {
    return <>{children}</>;
  }
  
  return (
    <>
      {HealthCheck}
      {children}
    </>
  );
}

DockerErrorHandler.propTypes = {
  /** Child components */
  children: PropTypes.node.isRequired
};

export default DockerErrorHandler;