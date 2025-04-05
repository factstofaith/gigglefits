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

# Import structured logging
try:
    from utils.logging import get_logger
    from utils.logging.errors import log_exception, get_error_logger
    # Use structured logger if available
    logger = get_logger(__name__)
    error_logger = get_error_logger(__name__)
    structured_logging_available = True
except ImportError:
    # Fallback to standard logging if structured logging not available
    logger = logging.getLogger(__name__)
    structured_logging_available = False


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
            if structured_logging_available:
                # Use structured logging if available
                error_logger.exception(
                    f"Error in {func.__name__}",
                    context={
                        "function": func.__name__,
                        "module": func.__module__,
                        "args_count": len(args),
                        "kwargs_keys": list(kwargs.keys())
                    }
                )
            else:
                # Fallback to standard logging
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
    path: Optional[str] = None,
    request_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a standardized error response structure.
    
    Args:
        status_code: HTTP status code
        error_code: Machine-readable error code
        message: Human-readable error message
        detail: Additional error details
        path: Request path that caused the error
        request_id: Unique request ID for tracing
        
    Returns:
        Standardized error response structure
    """
    return {
        "error": {
            "code": error_code,
            "message": message,
            "detail": detail or {},
            "path": path,
            "timestamp": time.time(),
            "request_id": request_id
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
        # Extract request information
        path = request.url.path
        method = request.method
        client_ip = request.client.host if request.client else None
        
        # Get request ID if available
        request_id = request.headers.get("X-Request-ID")
        
        # Get user agent
        user_agent = request.headers.get("User-Agent", "Unknown")
        
        # Determine log level based on exception type
        if isinstance(exc, (ResourceNotFoundError, AuthenticationError, AuthorizationError)):
            # These are common client errors, log at INFO level
            log_level = logging.INFO
        else:
            # For server errors, log at ERROR level
            log_level = logging.ERROR
        
        # Context for structured logging
        context = {
            "request": {
                "method": method,
                "path": path,
                "request_id": request_id,
                "ip": client_ip,
                "user_agent": user_agent
            },
            "error": {
                "type": type(exc).__name__,
                "message": str(exc)
            }
        }
        
        # Add exception traceback for server errors
        if log_level >= logging.ERROR:
            context["error"]["traceback"] = traceback.format_exception(type(exc), exc, exc.__traceback__)
        
        # Log with structured logging if available
        if structured_logging_available:
            from utils.logging.context import set_request_context
            
            # Set request context for structured logging
            if request_id:
                set_request_context(
                    request_id=request_id,
                    ip_address=client_ip,
                    user_agent=user_agent
                )
            
            # Log using structured logger
            error_logger.log_error(
                f"Exception in {method} {path}: {type(exc).__name__}: {str(exc)}",
                exc=exc,
                level=log_level,
                context=context
            )
        else:
            # Fallback to standard logging
            logger.log(
                log_level,
                f"Exception in {method} {path}: {type(exc).__name__}: {str(exc)}"
            )
            
            # Log traceback for errors
            if log_level >= logging.ERROR:
                logger.error(traceback.format_exc())
    except Exception as logging_error:
        # If error logging fails, log a simple message as fallback
        logger.error(f"Error while logging exception: {logging_error}")
        logger.error(f"Original exception: {exc}")


def setup_exception_handlers(app: FastAPI):
    """
    Register exception handlers with a FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    # Register handler for ApplicationError base class
    @app.exception_handler(ApplicationError)
    async def application_error_handler(request: Request, exc: ApplicationError):
        """Handle all application exceptions."""
        log_exception(request, exc)
        
        # Create error response
        response = create_error_response(
            status_code=exc.status_code,
            error_code=exc.error_code,
            message=str(exc),
            detail=exc.detail,
            path=request.url.path,
            request_id=request.headers.get("X-Request-ID")
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            content=response
        )
    
    # Register handler for validation errors
    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        """Handle request validation errors."""
        log_exception(request, exc)
        
        # Create error response
        response = create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="validation_error",
            message="Request validation error",
            detail={"errors": exc.errors()},
            path=request.url.path,
            request_id=request.headers.get("X-Request-ID")
        )
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=response
        )
    
    # Register handler for Pydantic validation errors
    @app.exception_handler(PydanticValidationError)
    async def pydantic_validation_error_handler(request: Request, exc: PydanticValidationError):
        """Handle Pydantic validation errors."""
        log_exception(request, exc)
        
        # Create error response
        response = create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="validation_error",
            message="Data validation error",
            detail={"errors": exc.errors()},
            path=request.url.path,
            request_id=request.headers.get("X-Request-ID")
        )
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=response
        )
    
    # Register handler for all other exceptions
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        """Handle all unhandled exceptions."""
        log_exception(request, exc)
        
        # For security, don't expose internal error details in production
        from core.config_factory import get_config
        config = get_config()
        
        if config.ENVIRONMENT == "production":
            message = "An internal server error occurred"
            detail = None
        else:
            message = str(exc)
            detail = {
                "exception": type(exc).__name__,
                "traceback": traceback.format_exception(type(exc), exc, exc.__traceback__)
            }
        
        # Create error response
        response = create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="internal_server_error",
            message=message,
            detail=detail,
            path=request.url.path,
            request_id=request.headers.get("X-Request-ID")
        )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=response
        )
    
    # Register specific handlers for custom exception types
    for exception_class, handler in ERROR_HANDLERS.items():
        app.add_exception_handler(exception_class, handler)
    
    logger.info("Exception handlers configured for FastAPI application")