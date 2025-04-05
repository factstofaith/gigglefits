/**
 * Docker Error Handling
 * 
 * This module provides a complete set of Docker-specific error handling 
 * components, hooks, and utilities for containerized environments.
 */

// Export DockerErrorHandler - our main Docker error boundary component
export { default as DockerErrorHandler } from './DockerErrorHandler';

// Export docker-error-service
export { 
  default as dockerErrorService,
  initDockerErrorService,
  reportDockerError,
  createDockerComponentErrorHandler,
  withDockerErrorHandling,
  logContainerError
} from './docker-error-service';

// Export enhanced Docker error handler
export {
  default as dockerErrorHandlerEnhancement,
  configureDockerErrorHandler,
  createDockerEnhancedFetch,
  reportDockerError as reportEnhancedDockerError,
  createDockerHealthCheck,
  createRecoveryStrategy,
  withDockerErrorHandling as withEnhancedDockerErrorHandling,
  DockerErrorTypes,
  DockerErrorSeverity
} from './docker-error-handler-enhancement';

// Export DockerNetworkErrorBoundary
export { default as DockerNetworkErrorBoundaryContextProvider } from './DockerNetworkErrorBoundary';
export { 
  DockerNetworkErrorBoundaryContext,
  DockerNetworkErrorBoundaryProvider,
  useDockerNetworkErrorBoundary
} from './DockerNetworkErrorBoundary';

// Export HealthCheckProvider
export { default as HealthCheckProviderContextProvider } from './HealthCheckProvider';
export { 
  HealthCheckProviderContext,
  HealthCheckProviderProvider,
  useHealthCheckProvider
} from './HealthCheckProvider';

// Export ContainerErrorContext
export { default as ContainerErrorContextContextProvider } from './ContainerErrorContext';
export { 
  ContainerErrorContextContext,
  ContainerErrorContextProvider,
  useContainerErrorContext
} from './ContainerErrorContext';

// Export DockerEnvironmentCheck
export { default as DockerEnvironmentCheckContextProvider } from './DockerEnvironmentCheck';
export { 
  DockerEnvironmentCheckContext,
  DockerEnvironmentCheckProvider,
  useDockerEnvironmentCheck
} from './DockerEnvironmentCheck';

// Export DockerNetworkStatus
export { default as DockerNetworkStatusContextProvider } from './DockerNetworkStatus';
export { 
  DockerNetworkStatusContext,
  DockerNetworkStatusProvider,
  useDockerNetworkStatus
} from './DockerNetworkStatus';

// Export ContainerCommunicationManager
export { default as ContainerCommunicationManagerContextProvider } from './ContainerCommunicationManager';
export { 
  ContainerCommunicationManagerContext,
  ContainerCommunicationManagerProvider,
  useContainerCommunicationManager
} from './ContainerCommunicationManager';

// Export DockerVolumeValidator
export { default as DockerVolumeValidatorContextProvider } from './DockerVolumeValidator';
export { 
  DockerVolumeValidatorContext,
  DockerVolumeValidatorProvider,
  useDockerVolumeValidator
} from './DockerVolumeValidator';

// Export DockerServiceRegistry
export { default as DockerServiceRegistryContextProvider } from './DockerServiceRegistry';
export { 
  DockerServiceRegistryContext,
  DockerServiceRegistryProvider,
  useDockerServiceRegistry
} from './DockerServiceRegistry';

// Export DockerHealthMonitor
export { default as DockerHealthMonitorContextProvider } from './DockerHealthMonitor';
export { 
  DockerHealthMonitorContext,
  DockerHealthMonitorProvider,
  useDockerHealthMonitor
} from './DockerHealthMonitor';

// Export Docker error handling utilities
export * from './integration';
export * from './api-error-handling';
export * from './health-check-integration';
export * from './hoc';

// Rename export for dockerNetworkErrorHandler
export { createDockerFetchWithErrorHandling as withDockerNetworkErrorHandling } from './dockerNetworkErrorHandler';
export { dockerFetch } from './dockerNetworkErrorHandler';

// Export combined dockerNetworkErrorHandler
import * as dockerNetworkHandlerUtils from './dockerNetworkErrorHandler';
export const dockerNetworkErrorHandler = dockerNetworkHandlerUtils;

