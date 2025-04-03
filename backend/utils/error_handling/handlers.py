"""
General error handling utilities.

This module provides general error handling utilities for FastAPI applications,
including exception handlers and error response formatting.
"""

import logging
import traceback
import time
from typing import Dict, Any, Type, Optional, Callable
from functools import wraps

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError

from .exceptions import (
    ApplicationError, 
    ValidationError, 
    ResourceNotFoundError,
    DatabaseError,
    AuthenticationError,
    AuthorizationError,
    ERROR_HANDLERS
)

# Setup logging
logger = logging.getLogger(__name__)


def with_error_logging(func: Callable):
    """
    Decorator for logging exceptions in functions.
    
    This decorator wraps functions to log exceptions before re-raising them.
    
    Args:
        func: Function to decorate
        
    Returns:
        Decorated function with error logging
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(
                f"Error in {func.__name__}: {e}\n{traceback.format_exc()}"
            )
            raise
    
    return wrapper


def create_error_response(
    status_code: int,
    error_code: str,
    message: str,
    detail: Optional[Dict[str, Any]] = None,
    path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a standardized error response structure.
    
    Args:
        status_code: HTTP status code
        error_code: Machine-readable error code
        message: Human-readable error message
        detail: Additional error details
        path: Request path that caused the error
        
    Returns:
        Standardized error response structure
    """
    return {
        "error": {
            "code": error_code,
            "message": message,
            "detail": detail or {},
            "path": path,
            "timestamp": time.time()
        }
    }


def log_exception(request: Request, exc: Exception):
    """
    Log an exception with request details.
    
    Args:
        request: FastAPI request
        exc: Exception to log
    """
    try:
        # Determine log level based on exception type
        if isinstance(exc, (ResourceNotFoundError, AuthenticationError, AuthorizationError)):
            # These are common client errors, log at INFO level
            log_level = logging.INFO
        elif isinstance(exc, ValidationError):
            # Validation errors are client errors, log at WARNING level
            log_level = logging.WARNING
        elif isinstance(exc, ApplicationError):
            # Application errors are server errors, log at ERROR level
            log_level = logging.ERROR
        else:
            # Unknown errors are server errors, log at ERROR level
            log_level = logging.ERROR
        
        # Get request details
        method = request.method
        url = str(request.url)
        client_host = request.client.host if request.client else "unknown"
        
        # Create log message
        log_message = f"{method} {url} from {client_host} - {type(exc).__name__}: {str(exc)}"
        
        # Log with appropriate level
        if log_level == logging.INFO:
            logger.info(log_message)
        elif log_level == logging.WARNING:
            logger.warning(log_message)
        else:  # ERROR
            if isinstance(exc, ApplicationError) and exc.original_error:
                # Log original error details for application errors
                logger.error(
                    f"{log_message}\nOriginal error: {exc.original_error}\n{traceback.format_exc()}"
                )
            else:
                logger.error(f"{log_message}\n{traceback.format_exc()}")
    except Exception as e:
        logger.error(f"Error in log_exception: {e}")


@with_error_logging
def handle_application_error(request: Request, exc: ApplicationError):
    """
    Handle ApplicationError exceptions.
    
    Args:
        request: FastAPI request
        exc: ApplicationError instance
    
    Returns:
        JSON response with error details
    """
    try:
        # Log the exception
        log_exception(request, exc)
        
        # Create error response
        response_content = create_error_response(
            status_code=exc.status_code,
            error_code=exc.error_code,
            message=exc.message,
            detail=exc.detail,
            path=str(request.url.path)
        )
        
        # Return JSON response
        return JSONResponse(
            status_code=exc.status_code,
            content=response_content
        )
    except Exception as e:
        logger.error(f"Error in handle_application_error: {e}")
        # Fallback response if error handling fails
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Internal server error in error handler"}
        )


@with_error_logging
def handle_validation_error(request: Request, exc: RequestValidationError):
    """
    Handle FastAPI RequestValidationError exceptions.
    
    Args:
        request: FastAPI request
        exc: RequestValidationError instance
    
    Returns:
        JSON response with validation error details
    """
    try:
        # Log the exception
        log_exception(request, exc)
        
        # Extract validation errors
        errors = exc.errors()
        
        # Create error response
        response_content = create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
            message="Request validation error",
            detail={"errors": errors},
            path=str(request.url.path)
        )
        
        # Return JSON response
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=response_content
        )
    except Exception as e:
        logger.error(f"Error in handle_validation_error: {e}")
        # Fallback response if error handling fails
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Internal server error in error handler"}
        )


@with_error_logging
def handle_pydantic_validation_error(request: Request, exc: PydanticValidationError):
    """
    Handle Pydantic ValidationError exceptions.
    
    Args:
        request: FastAPI request
        exc: PydanticValidationError instance
    
    Returns:
        JSON response with validation error details
    """
    try:
        # Log the exception
        log_exception(request, exc)
        
        # Extract validation errors
        errors = exc.errors()
        
        # Create error response
        response_content = create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
            message="Data validation error",
            detail={"errors": errors},
            path=str(request.url.path)
        )
        
        # Return JSON response
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=response_content
        )
    except Exception as e:
        logger.error(f"Error in handle_pydantic_validation_error: {e}")
        # Fallback response if error handling fails
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Internal server error in error handler"}
        )


@with_error_logging
def handle_not_found_error(request: Request, exc: Exception):
    """
    Handle 404 Not Found errors.
    
    Args:
        request: FastAPI request
        exc: Exception instance
    
    Returns:
        JSON response with not found error details
    """
    try:
        # Log the exception
        not_found_error = ResourceNotFoundError(
            message=f"Resource not found: {request.url.path}"
        )
        log_exception(request, not_found_error)
        
        # Create error response
        response_content = create_error_response(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
            message=f"Resource not found: {request.url.path}",
            path=str(request.url.path)
        )
        
        # Return JSON response
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=response_content
        )
    except Exception as e:
        logger.error(f"Error in handle_not_found_error: {e}")
        # Fallback response if error handling fails
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Internal server error in error handler"}
        )


@with_error_logging
def handle_generic_error(request: Request, exc: Exception):
    """
    Handle generic exceptions.
    
    Args:
        request: FastAPI request
        exc: Exception instance
    
    Returns:
        JSON response with error details
    """
    try:
        # Log the exception
        log_exception(request, exc)
        
        # Create error response
        response_content = create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="INTERNAL_ERROR",
            message="An unexpected error occurred",
            detail={"error_type": type(exc).__name__},
            path=str(request.url.path)
        )
        
        # Return JSON response
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=response_content
        )
    except Exception as e:
        logger.error(f"Error in handle_generic_error: {e}")
        # Fallback response if error handling fails
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Internal server error in error handler"}
        )


# Import container-specific functions
from .container import (
    register_signal_handlers,
    setup_container_health_check,
    add_container_middleware
)


@with_error_logging
def setup_exception_handlers(app: FastAPI):
    """
    Set up exception handlers for a FastAPI application.
    
    This function registers handlers for various exception types to ensure
    consistent error responses across the application.
    
    Args:
        app: FastAPI application
    """
    try:
        # Register handler for ApplicationError and subclasses
        app.add_exception_handler(ApplicationError, handle_application_error)
        
        # Register handler for FastAPI's RequestValidationError
        app.add_exception_handler(RequestValidationError, handle_validation_error)
        
        # Register handler for Pydantic's ValidationError
        app.add_exception_handler(PydanticValidationError, handle_pydantic_validation_error)
        
        # Register handler for 404 Not Found
        app.exception_handler(404)(handle_not_found_error)
        
        # Register handler for generic exceptions
        app.add_exception_handler(Exception, handle_generic_error)
        
        logger.info("Exception handlers set up for FastAPI application")
    except Exception as e:
        logger.error(f"Error in setup_exception_handlers: {e}")
        raise ApplicationError(message=f"Error in setup_exception_handlers", original_error=e)