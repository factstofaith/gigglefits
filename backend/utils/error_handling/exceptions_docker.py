"""
Docker-specific exception classes for containerized environments.

This module provides specialized exception classes for Docker containerized environments,
focusing on container-specific error scenarios and proper error handling in distributed systems.
"""

from typing import Optional, Dict, Any, Type, Union
from fastapi import status

from .exceptions import ApplicationError, ExternalServiceError, ConnectionError, ResourceNotFoundError

# Container Error Codes
CONTAINER_ERROR_PREFIX = "CONTAINER"
RESOURCE_ERROR_PREFIX = "RESOURCE"
NETWORK_ERROR_PREFIX = "NETWORK"
DEPENDENCY_ERROR_PREFIX = "DEPENDENCY"
ORCHESTRATION_ERROR_PREFIX = "ORCHESTRATION"


class ContainerError(ApplicationError):
    """Base exception for container-related errors."""
    
    default_message = "Container error"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = f"{CONTAINER_ERROR_PREFIX}_ERROR"


class ContainerStartupError(ContainerError):
    """Exception raised for container startup issues."""
    
    default_message = "Container failed to start properly"
    error_code = f"{CONTAINER_ERROR_PREFIX}_STARTUP_ERROR"


class ContainerShutdownError(ContainerError):
    """Exception raised for container graceful shutdown issues."""
    
    default_message = "Container failed to shut down gracefully"
    error_code = f"{CONTAINER_ERROR_PREFIX}_SHUTDOWN_ERROR"


class ContainerResourceExhaustedError(ContainerError):
    """Exception raised when container resources are exhausted."""
    
    default_message = "Container resources exhausted"
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    error_code = f"{RESOURCE_ERROR_PREFIX}_EXHAUSTED"


class ContainerMemoryError(ContainerResourceExhaustedError):
    """Exception raised when container memory limit is reached."""
    
    default_message = "Container memory limit reached"
    error_code = f"{RESOURCE_ERROR_PREFIX}_MEMORY_LIMIT"


class ContainerCPUError(ContainerResourceExhaustedError):
    """Exception raised when container CPU limit is reached."""
    
    default_message = "Container CPU limit reached"
    error_code = f"{RESOURCE_ERROR_PREFIX}_CPU_LIMIT"


class ContainerNetworkError(ContainerError):
    """Exception raised for container network-related issues."""
    
    default_message = "Container network error"
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    error_code = f"{NETWORK_ERROR_PREFIX}_ERROR"


class ContainerDependencyError(ExternalServiceError):
    """Exception raised when a container dependency is unavailable."""
    
    default_message = "Container dependency error"
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    error_code = f"{DEPENDENCY_ERROR_PREFIX}_ERROR"


class DatabaseContainerError(ContainerDependencyError):
    """Exception raised when the database container is unavailable."""
    
    default_message = "Database container error"
    error_code = f"{DEPENDENCY_ERROR_PREFIX}_DATABASE"


class RedisContainerError(ContainerDependencyError):
    """Exception raised when the Redis container is unavailable."""
    
    default_message = "Redis container error"
    error_code = f"{DEPENDENCY_ERROR_PREFIX}_REDIS"


class OrchestrationError(ContainerError):
    """Exception raised for container orchestration-related issues."""
    
    default_message = "Container orchestration error"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = f"{ORCHESTRATION_ERROR_PREFIX}_ERROR"


class HealthCheckError(ContainerError):
    """Exception raised when a container health check fails."""
    
    default_message = "Container health check failed"
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    error_code = f"{CONTAINER_ERROR_PREFIX}_HEALTH_CHECK_FAILED"


class ContainerTimeoutError(ContainerError):
    """Exception raised when a container operation times out."""
    
    default_message = "Container operation timed out"
    status_code = status.HTTP_504_GATEWAY_TIMEOUT
    error_code = f"{CONTAINER_ERROR_PREFIX}_TIMEOUT"


class VolumeError(ContainerError):
    """Exception raised for container volume-related issues."""
    
    default_message = "Container volume error"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = f"{CONTAINER_ERROR_PREFIX}_VOLUME_ERROR"


class VolumePermissionError(VolumeError):
    """Exception raised when container doesn't have permission to access a volume."""
    
    default_message = "Container volume permission denied"
    error_code = f"{CONTAINER_ERROR_PREFIX}_VOLUME_PERMISSION_DENIED"


class VolumeNotFoundError(VolumeError, ResourceNotFoundError):
    """Exception raised when a container volume is not found."""
    
    default_message = "Container volume not found"
    status_code = status.HTTP_404_NOT_FOUND
    error_code = f"{CONTAINER_ERROR_PREFIX}_VOLUME_NOT_FOUND"


class EnvironmentError(ContainerError):
    """Exception raised for container environment-related issues."""
    
    default_message = "Container environment error"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = f"{CONTAINER_ERROR_PREFIX}_ENVIRONMENT_ERROR"


class EnvironmentVariableMissingError(EnvironmentError):
    """Exception raised when a required environment variable is missing."""
    
    default_message = "Required environment variable missing"
    error_code = f"{CONTAINER_ERROR_PREFIX}_ENV_VAR_MISSING"


class InterContainerCommunicationError(ContainerNetworkError):
    """Exception raised when communication between containers fails."""
    
    default_message = "Inter-container communication error"
    error_code = f"{NETWORK_ERROR_PREFIX}_INTER_CONTAINER"


class CircuitBreakerOpenError(ContainerDependencyError):
    """Exception raised when a circuit breaker is open."""
    
    default_message = "Circuit breaker is open"
    error_code = f"{DEPENDENCY_ERROR_PREFIX}_CIRCUIT_OPEN"


# Map container error codes to exception classes
CONTAINER_ERROR_MAP: Dict[str, Type[ContainerError]] = {
    f"{CONTAINER_ERROR_PREFIX}_ERROR": ContainerError,
    f"{CONTAINER_ERROR_PREFIX}_STARTUP_ERROR": ContainerStartupError,
    f"{CONTAINER_ERROR_PREFIX}_SHUTDOWN_ERROR": ContainerShutdownError,
    f"{RESOURCE_ERROR_PREFIX}_EXHAUSTED": ContainerResourceExhaustedError,
    f"{RESOURCE_ERROR_PREFIX}_MEMORY_LIMIT": ContainerMemoryError,
    f"{RESOURCE_ERROR_PREFIX}_CPU_LIMIT": ContainerCPUError,
    f"{NETWORK_ERROR_PREFIX}_ERROR": ContainerNetworkError,
    f"{DEPENDENCY_ERROR_PREFIX}_ERROR": ContainerDependencyError,
    f"{DEPENDENCY_ERROR_PREFIX}_DATABASE": DatabaseContainerError,
    f"{DEPENDENCY_ERROR_PREFIX}_REDIS": RedisContainerError,
    f"{ORCHESTRATION_ERROR_PREFIX}_ERROR": OrchestrationError,
    f"{CONTAINER_ERROR_PREFIX}_HEALTH_CHECK_FAILED": HealthCheckError,
    f"{CONTAINER_ERROR_PREFIX}_TIMEOUT": ContainerTimeoutError,
    f"{CONTAINER_ERROR_PREFIX}_VOLUME_ERROR": VolumeError,
    f"{CONTAINER_ERROR_PREFIX}_VOLUME_PERMISSION_DENIED": VolumePermissionError,
    f"{CONTAINER_ERROR_PREFIX}_VOLUME_NOT_FOUND": VolumeNotFoundError,
    f"{CONTAINER_ERROR_PREFIX}_ENVIRONMENT_ERROR": EnvironmentError,
    f"{CONTAINER_ERROR_PREFIX}_ENV_VAR_MISSING": EnvironmentVariableMissingError,
    f"{NETWORK_ERROR_PREFIX}_INTER_CONTAINER": InterContainerCommunicationError,
    f"{DEPENDENCY_ERROR_PREFIX}_CIRCUIT_OPEN": CircuitBreakerOpenError,
}


def get_container_exception_by_code(error_code: str) -> Type[ContainerError]:
    """
    Get container exception class for an error code.
    
    Args:
        error_code: Error code string
        
    Returns:
        Corresponding exception class
    """
    return CONTAINER_ERROR_MAP.get(error_code, ContainerError)