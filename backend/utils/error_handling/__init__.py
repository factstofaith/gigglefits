"""
Comprehensive error handling system for the application.

This module provides a comprehensive error handling system with:
1. Standardized exceptions for consistent error behavior
2. Error handling and recovery for various scenarios
3. Resource tracking for proper cleanup
4. Centralized error reporting and monitoring
5. Error management API endpoints

All these components work together to ensure reliable operation in
containerized environments with proper recovery from transient errors.
"""

# Import core exception classes
from .exceptions import (
    ApplicationError,
    ValidationError,
    ResourceNotFoundError,
    DatabaseError,
    DatabaseConnectionError,
    DatabaseQueryError,
    DatabaseIntegrityError,
    AuthenticationError,
    AuthorizationError,
    ConfigurationError,
    ExternalServiceError,
    StorageError,
    ConnectionError,
    RateLimitError,
    ERROR_HANDLERS,
    get_exception_by_status
)

# Import Docker-specific exceptions
from .exceptions_docker import (
    ContainerError,
    ContainerStartupError,
    ContainerShutdownError,
    ContainerResourceExhaustedError,
    ContainerMemoryError,
    ContainerCPUError,
    ContainerNetworkError,
    ContainerDependencyError,
    DatabaseContainerError,
    RedisContainerError,
    OrchestrationError,
    HealthCheckError,
    ContainerTimeoutError,
    VolumeError,
    VolumePermissionError,
    VolumeNotFoundError,
    EnvironmentError,
    EnvironmentVariableMissingError,
    InterContainerCommunicationError,
    CircuitBreakerOpenError,
    CONTAINER_ERROR_MAP,
    get_container_exception_by_code
)

# Import error handling utilities
from .handlers import (
    with_error_logging,
    create_error_response,
    log_exception,
    setup_exception_handlers
)

# Import recovery utilities
from .recovery import (
    CircuitBreaker,
    get_circuit_breaker,
    configure_circuit_breaker,
    with_circuit_breaker,
    with_async_circuit_breaker,
    with_retry,
    with_async_retry,
    async_retry,
    Fallback,
    with_fallback,
    with_async_fallback,
    with_timeout
)

# Import resource tracking
from .resources import (
    ResourceType,
    Resource,
    ResourceTracker,
    register_resource,
    deregister_resource,
    cleanup_resource,
    cleanup_resources_by_type,
    cleanup_resources_by_owner,
    cleanup_all_resources,
    get_resource,
    get_resources_by_type,
    get_resources_by_owner,
    get_resource_counts,
    get_resource_stats,
    track_resource,
    track_file,
    track_connection,
    track_thread
)

# Import error reporting
from .reporting import (
    ErrorSeverity,
    ErrorCategory,
    ErrorRecord,
    report_error,
    report_exception,
    register_processor,
    get_error,
    get_errors,
    get_error_counts,
    get_error_rate,
    get_stats,
    clear_errors,
    reset_stats,
    setup_error_reporting
)

# Import database-specific error handling
from .database import (
    create_db_engine_with_retry,
    handle_db_error,
    db_transaction,
    with_db_error_handling,
    with_async_db_error_handling,
    setup_db_health_check
)

# Import container-specific error handling
from .container import (
    shutdown_handler,
    register_shutdown_handler,
    register_signal_handlers,
    register_database_shutdown_handler,
    register_async_shutdown_handler,
    setup_container_health_check,
    add_container_middleware
)

# Import async-specific error handling
from .async_handlers import (
    handle_async_errors,
    handle_task_result,
    run_parallel_tasks_with_error_handling,
    create_task_with_error_handling,
    AsyncErrorBoundary,
    retry_async
)

# Import API endpoints
from .api import (
    setup_error_api,
    router as error_api_router
)

__all__ = [
    # Core exceptions
    'ApplicationError',
    'ValidationError',
    'ResourceNotFoundError',
    'DatabaseError',
    'DatabaseConnectionError',
    'DatabaseQueryError',
    'DatabaseIntegrityError',
    'AuthenticationError',
    'AuthorizationError',
    'ConfigurationError',
    'ExternalServiceError',
    'StorageError',
    'ConnectionError',
    'RateLimitError',
    'ERROR_HANDLERS',
    'get_exception_by_status',
    
    # Docker-specific exceptions
    'ContainerError',
    'ContainerStartupError',
    'ContainerShutdownError',
    'ContainerResourceExhaustedError',
    'ContainerMemoryError',
    'ContainerCPUError',
    'ContainerNetworkError',
    'ContainerDependencyError',
    'DatabaseContainerError',
    'RedisContainerError',
    'OrchestrationError',
    'HealthCheckError',
    'ContainerTimeoutError',
    'VolumeError',
    'VolumePermissionError',
    'VolumeNotFoundError',
    'EnvironmentError',
    'EnvironmentVariableMissingError',
    'InterContainerCommunicationError',
    'CircuitBreakerOpenError',
    'CONTAINER_ERROR_MAP',
    'get_container_exception_by_code',
    
    # Error handling utilities
    'with_error_logging',
    'create_error_response',
    'log_exception',
    'setup_exception_handlers',
    
    # Recovery utilities
    'CircuitBreaker',
    'get_circuit_breaker',
    'configure_circuit_breaker',
    'with_circuit_breaker',
    'with_async_circuit_breaker',
    'with_retry',
    'with_async_retry',
    'async_retry',
    'Fallback',
    'with_fallback',
    'with_async_fallback',
    'with_timeout',
    
    # Resource tracking
    'ResourceType',
    'Resource',
    'ResourceTracker',
    'register_resource',
    'deregister_resource',
    'cleanup_resource',
    'cleanup_resources_by_type',
    'cleanup_resources_by_owner',
    'cleanup_all_resources',
    'get_resource',
    'get_resources_by_type',
    'get_resources_by_owner',
    'get_resource_counts',
    'get_resource_stats',
    'track_resource',
    'track_file',
    'track_connection',
    'track_thread',
    
    # Error reporting
    'ErrorSeverity',
    'ErrorCategory',
    'ErrorRecord',
    'report_error',
    'report_exception',
    'register_processor',
    'get_error',
    'get_errors',
    'get_error_counts',
    'get_error_rate',
    'get_stats',
    'clear_errors',
    'reset_stats',
    'setup_error_reporting',
    
    # Database-specific error handling
    'create_db_engine_with_retry',
    'handle_db_error',
    'db_transaction',
    'with_db_error_handling',
    'with_async_db_error_handling',
    'setup_db_health_check',
    
    # Container-specific error handling
    'shutdown_handler',
    'register_shutdown_handler',
    'register_signal_handlers',
    'register_database_shutdown_handler',
    'register_async_shutdown_handler',
    'setup_container_health_check',
    'add_container_middleware',
    
    # Async-specific error handling
    'handle_async_errors',
    'handle_task_result',
    'run_parallel_tasks_with_error_handling',
    'create_task_with_error_handling',
    'AsyncErrorBoundary',
    'retry_async',
    
    # API endpoints
    'setup_error_api',
    'error_api_router'
]

# Initialize error reporting system with default settings
setup_error_reporting(
    max_errors=1000,
    enable_logging=True,
    enable_persistence=False  # Set to True and provide path for persistent error logs
)