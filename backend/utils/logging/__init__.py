"""
Structured logging system for Docker container environments.

This module provides enhanced logging functionality specifically designed for 
containerized environments, with features including:

1. JSON-formatted logs for easy parsing by container orchestration tools
2. Docker container context in all log messages
3. Request ID tracking for distributed tracing
4. Performance metric integration for monitoring
5. Standardized log field naming for consistent analysis
6. Environment-aware log configuration (development vs. production)
7. Log rotation configuration for container logs

Usage:
    from utils.logging import get_logger
    
    logger = get_logger(__name__)
    logger.info("Message with structured context", extra={"user_id": 123})
"""

import os
import sys
import logging
import json
import time
import socket
import threading
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Union, List

from .formatter import JsonFormatter, get_json_formatter
from .context import RequestContext, docker_context_provider
from .config import configure_logging, LOG_LEVELS

# Create a thread local storage for request context
_request_context = threading.local()

def get_logger(name: str) -> logging.Logger:
    """
    Get a logger configured for structured logging.
    
    Args:
        name: Logger name, typically __name__
        
    Returns:
        Logger instance with JSON formatting
    """
    logger = logging.getLogger(name)
    
    # Only configure if it hasn't been configured yet
    if not logger.handlers:
        configure_logger(logger)
    
    return logger

def configure_logger(logger: logging.Logger) -> None:
    """
    Configure a logger with the appropriate handlers and formatters.
    
    Args:
        logger: Logger instance to configure
    """
    # Get configuration from environment
    from core.config_factory import get_config
    config = get_config()
    
    # Set log level based on configuration
    log_level = getattr(logging, config.LOG_LEVEL.upper()) if hasattr(config, 'LOG_LEVEL') else logging.INFO
    logger.setLevel(log_level)
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    
    # Use JSON formatter in Docker environments, plain formatter otherwise
    if config.is_docker():
        formatter = get_json_formatter(enable_docker_context=True)
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

def set_request_context(request_id: Optional[str] = None, **kwargs) -> None:
    """
    Set the request context for the current thread.
    
    Args:
        request_id: Unique identifier for the request
        **kwargs: Additional context values
    """
    if not hasattr(_request_context, 'values'):
        _request_context.values = {}
    
    # Generate request ID if not provided
    if request_id is None:
        request_id = str(uuid.uuid4())
    
    _request_context.values['request_id'] = request_id
    
    # Add additional context
    for key, value in kwargs.items():
        _request_context.values[key] = value

def get_request_context() -> Dict[str, Any]:
    """
    Get the request context for the current thread.
    
    Returns:
        Dictionary with request context
    """
    if not hasattr(_request_context, 'values'):
        _request_context.values = {}
    
    return _request_context.values.copy()

def clear_request_context() -> None:
    """Clear the request context for the current thread."""
    if hasattr(_request_context, 'values'):
        _request_context.values.clear()

# Initialize logging for Docker by default if in container
from core.config_factory import ConfigFactory
if ConfigFactory.is_docker():
    # Configure root logger for Docker
    configure_logging(
        level=os.environ.get('LOG_LEVEL', 'INFO'),
        enable_json=True,
        enable_docker_context=True
    )