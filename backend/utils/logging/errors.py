"""
Error handling utilities for structured logging.

This module provides specialized error logging functions that integrate with
the structured logging system, ensuring consistent error reporting in
container environments with proper context information.
"""

import sys
import traceback
import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional, List, Type, Union

from .context import get_request_context, docker_context_provider

# Get logger for this module
logger = logging.getLogger(__name__)

def log_exception(
    exc: Exception,
    logger: logging.Logger,
    level: int = logging.ERROR,
    context: Optional[Dict[str, Any]] = None,
    include_traceback: bool = True,
    include_request_context: bool = True
) -> None:
    """
    Log an exception with structured context.
    
    Args:
        exc: The exception to log
        logger: Logger to use
        level: Log level
        context: Additional context to include
        include_traceback: Whether to include traceback
        include_request_context: Whether to include request context
    """
    # Get exception details
    exc_type = type(exc).__name__
    exc_msg = str(exc)
    
    # Create the base log data
    log_data = {
        'error': {
            'type': exc_type,
            'message': exc_msg,
        }
    }
    
    # Add traceback if requested
    if include_traceback:
        tb = traceback.format_exception(type(exc), exc, exc.__traceback__)
        log_data['error']['traceback'] = tb
    
    # Add request context if available and requested
    if include_request_context:
        request_ctx = get_request_context()
        if request_ctx:
            log_data['request'] = request_ctx
    
    # Add Docker context if running in Docker
    try:
        docker_ctx = docker_context_provider()
        if docker_ctx:
            log_data.update(docker_ctx)
    except Exception:
        # Don't fail if we can't get Docker context
        pass
    
    # Add additional context
    if context:
        log_data.update(context)
    
    # Log the error with all context
    logger.log(level, f"Exception: {exc_type}: {exc_msg}", extra=log_data)

def log_unexpected_error(
    logger: logging.Logger = logger,
    context: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log an unexpected error from sys.exc_info().
    
    This is useful in except blocks where you want to log the current exception.
    
    Args:
        logger: Logger to use
        context: Additional context to include
    """
    exc_type, exc_value, exc_traceback = sys.exc_info()
    
    # Skip if no exception
    if exc_type is None:
        return
    
    # Create log data with exception details
    log_data = {
        'error': {
            'type': exc_type.__name__,
            'message': str(exc_value),
            'traceback': traceback.format_exception(exc_type, exc_value, exc_traceback)
        }
    }
    
    # Add request context if available
    request_ctx = get_request_context()
    if request_ctx:
        log_data['request'] = request_ctx
    
    # Add Docker context if available
    try:
        docker_ctx = docker_context_provider()
        if docker_ctx:
            log_data.update(docker_ctx)
    except Exception:
        pass
    
    # Add additional context
    if context:
        log_data.update(context)
    
    # Log the error with all context
    logger.error(f"Unexpected error: {exc_type.__name__}: {exc_value}", extra=log_data)

class ErrorLogger:
    """
    Utility class for logging errors with consistent formatting.
    
    This class provides a standardized approach to error logging
    with proper context and integration with the structured logging system.
    """
    
    def __init__(
        self,
        logger: logging.Logger,
        default_level: int = logging.ERROR,
        include_request_context: bool = True,
        include_docker_context: bool = True
    ):
        """
        Initialize the error logger.
        
        Args:
            logger: Logger to use
            default_level: Default log level for errors
            include_request_context: Whether to include request context
            include_docker_context: Whether to include Docker context
        """
        self.logger = logger
        self.default_level = default_level
        self.include_request_context = include_request_context
        self.include_docker_context = include_docker_context
    
    def log_error(
        self,
        message: str,
        exc: Optional[Exception] = None,
        level: Optional[int] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Log an error with structured context.
        
        Args:
            message: Error message
            exc: Optional exception object
            level: Log level (defaults to self.default_level)
            context: Additional context
        """
        # Use provided level or default
        log_level = level if level is not None else self.default_level
        
        # Create log data
        log_data = {}
        
        # Add exception details if provided
        if exc:
            log_data['error'] = {
                'type': type(exc).__name__,
                'message': str(exc),
                'traceback': traceback.format_exception(type(exc), exc, exc.__traceback__)
            }
        
        # Add request context if enabled
        if self.include_request_context:
            request_ctx = get_request_context()
            if request_ctx:
                log_data['request'] = request_ctx
        
        # Add Docker context if enabled
        if self.include_docker_context:
            try:
                docker_ctx = docker_context_provider()
                if docker_ctx:
                    log_data.update(docker_ctx)
            except Exception:
                pass
        
        # Add additional context
        if context:
            log_data.update(context)
        
        # Log the error
        self.logger.log(log_level, message, extra=log_data)
    
    def exception(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Log an exception with the current exception info.
        
        Args:
            message: Error message
            context: Additional context
        """
        # Get current exception
        exc_type, exc_value, exc_traceback = sys.exc_info()
        
        # Skip if no exception
        if exc_type is None:
            return
        
        # Create log data
        log_data = {
            'error': {
                'type': exc_type.__name__,
                'message': str(exc_value),
                'traceback': traceback.format_exception(exc_type, exc_value, exc_traceback)
            }
        }
        
        # Add request context if enabled
        if self.include_request_context:
            request_ctx = get_request_context()
            if request_ctx:
                log_data['request'] = request_ctx
        
        # Add Docker context if enabled
        if self.include_docker_context:
            try:
                docker_ctx = docker_context_provider()
                if docker_ctx:
                    log_data.update(docker_ctx)
            except Exception:
                pass
        
        # Add additional context
        if context:
            log_data.update(context)
        
        # Log the exception
        self.logger.error(message, extra=log_data)

def get_error_logger(
    name: str,
    default_level: int = logging.ERROR
) -> ErrorLogger:
    """
    Get an ErrorLogger instance for the given name.
    
    Args:
        name: Logger name
        default_level: Default log level for errors
        
    Returns:
        ErrorLogger instance
    """
    return ErrorLogger(
        logger=logging.getLogger(name),
        default_level=default_level
    )