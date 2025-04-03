"""
Standardized exception classes for the application.

This module provides a hierarchy of exception classes for consistent error handling
throughout the application. These exceptions map to standard HTTP status codes for API responses.
"""

from typing import Optional, Dict, Any, Type, Union
from fastapi import status


class ApplicationError(Exception):
    """Base exception class for all application-specific exceptions."""
    
    default_message = "An unexpected error occurred"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "INTERNAL_ERROR"
    
    def __init__(
        self, 
        message: Optional[str] = None, 
        status_code: Optional[int] = None,
        error_code: Optional[str] = None,
        detail: Optional[Dict[str, Any]] = None,
        original_error: Optional[Exception] = None
    ):
        """
        Initialize the exception.
        
        Args:
            message: Human-readable error message
            status_code: HTTP status code for API responses
            error_code: Machine-readable error code
            detail: Additional error details
            original_error: Original exception that caused this error
        """
        self.message = message or self.default_message
        self.status_code = status_code or self.status_code
        self.error_code = error_code or self.error_code
        self.detail = detail or {}
        self.original_error = original_error
        
        # Add original error information to detail if provided
        if original_error and not self.detail.get("original_error"):
            self.detail["original_error"] = str(original_error)
        
        super().__init__(self.message)


class ValidationError(ApplicationError):
    """Exception raised for validation errors."""
    
    default_message = "Validation error"
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    error_code = "VALIDATION_ERROR"


class ResourceNotFoundError(ApplicationError):
    """Exception raised when a requested resource is not found."""
    
    default_message = "Resource not found"
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "NOT_FOUND"


class DatabaseError(ApplicationError):
    """Base exception for database-related errors."""
    
    default_message = "Database error"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "DATABASE_ERROR"


class DatabaseConnectionError(DatabaseError):
    """Exception raised for database connection issues."""
    
    default_message = "Database connection error"
    error_code = "DATABASE_CONNECTION_ERROR"


class DatabaseQueryError(DatabaseError):
    """Exception raised for database query errors."""
    
    default_message = "Database query error"
    error_code = "DATABASE_QUERY_ERROR"


class DatabaseIntegrityError(DatabaseError):
    """Exception raised for database integrity constraint violations."""
    
    default_message = "Database integrity constraint violated"
    status_code = status.HTTP_409_CONFLICT
    error_code = "DATABASE_INTEGRITY_ERROR"


class AuthenticationError(ApplicationError):
    """Exception raised for authentication failures."""
    
    default_message = "Authentication failed"
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "AUTHENTICATION_ERROR"


class AuthorizationError(ApplicationError):
    """Exception raised for authorization failures."""
    
    default_message = "Not authorized to perform this action"
    status_code = status.HTTP_403_FORBIDDEN
    error_code = "AUTHORIZATION_ERROR"


class ConfigurationError(ApplicationError):
    """Exception raised for application configuration issues."""
    
    default_message = "Application configuration error"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "CONFIGURATION_ERROR"


class ExternalServiceError(ApplicationError):
    """Exception raised for external service failures."""
    
    default_message = "External service error"
    status_code = status.HTTP_502_BAD_GATEWAY
    error_code = "EXTERNAL_SERVICE_ERROR"


class StorageError(ApplicationError):
    """Exception raised for storage-related errors (S3, Azure Blob, etc.)."""
    
    default_message = "Storage error"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "STORAGE_ERROR"


class ConnectionError(ApplicationError):
    """Exception raised for connection-related errors."""
    
    default_message = "Connection error"
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    error_code = "CONNECTION_ERROR"


class RateLimitError(ApplicationError):
    """Exception raised when rate limits are exceeded."""
    
    default_message = "Rate limit exceeded"
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    error_code = "RATE_LIMIT_EXCEEDED"


# Map HTTP status codes to exception classes for automatic handling
ERROR_HANDLERS: Dict[int, Type[ApplicationError]] = {
    status.HTTP_400_BAD_REQUEST: ApplicationError,
    status.HTTP_401_UNAUTHORIZED: AuthenticationError,
    status.HTTP_403_FORBIDDEN: AuthorizationError,
    status.HTTP_404_NOT_FOUND: ResourceNotFoundError,
    status.HTTP_409_CONFLICT: DatabaseIntegrityError,
    status.HTTP_422_UNPROCESSABLE_ENTITY: ValidationError,
    status.HTTP_429_TOO_MANY_REQUESTS: RateLimitError,
    status.HTTP_500_INTERNAL_SERVER_ERROR: ApplicationError,
    status.HTTP_502_BAD_GATEWAY: ExternalServiceError,
    status.HTTP_503_SERVICE_UNAVAILABLE: ConnectionError,
    status.HTTP_504_GATEWAY_TIMEOUT: ExternalServiceError
}


def get_exception_by_status(status_code: int) -> Type[ApplicationError]:
    """
    Get exception class for a status code.
    
    Args:
        status_code: HTTP status code
        
    Returns:
        Corresponding exception class
    """
    return ERROR_HANDLERS.get(status_code, ApplicationError)