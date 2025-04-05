"""
Logging configuration module for Docker environments.

This module provides configuration utilities for setting up the logging system
in different environments (development, production, container, etc.) with 
appropriate formatters, handlers, and log levels.

It also handles log rotation setup for container environments where native
file rotation might not be available.
"""

import os
import sys
import logging
import logging.handlers
from typing import Dict, Any, Optional, Union, List

# Standard log levels
LOG_LEVELS = {
    'debug': logging.DEBUG,
    'info': logging.INFO,
    'warning': logging.WARNING,
    'error': logging.ERROR,
    'critical': logging.CRITICAL
}

def get_log_level(level_name: str) -> int:
    """
    Get the log level from a string name.
    
    Args:
        level_name: Name of the log level (debug, info, warning, error, critical)
        
    Returns:
        Log level constant from the logging module
    """
    level_name = level_name.lower()
    return LOG_LEVELS.get(level_name, logging.INFO)

def configure_logging(
    level: str = 'info',
    enable_json: bool = True,
    enable_docker_context: bool = True,
    handler: Optional[logging.Handler] = None,
    log_file: Optional[str] = None,
    log_rotation: bool = True,
    max_bytes: int = 10485760,  # 10MB
    backup_count: int = 5
) -> None:
    """
    Configure logging for the application.
    
    Args:
        level: Log level name (debug, info, warning, error, critical)
        enable_json: Whether to use JSON formatting
        enable_docker_context: Whether to include Docker context in logs
        handler: Custom log handler to use (if None, creates appropriate handlers)
        log_file: Path to log file (if None, logs to stdout only)
        log_rotation: Whether to enable log rotation
        max_bytes: Maximum log file size before rotation
        backup_count: Number of backup log files to keep
    """
    # Import JsonFormatter here to avoid circular imports
    from .formatter import JsonFormatter, get_json_formatter
    
    # Convert log level string to constant
    log_level = get_log_level(level)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers to avoid duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create handlers
    handlers = []
    
    # Use provided handler if specified
    if handler:
        handlers.append(handler)
    else:
        # Always add console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        handlers.append(console_handler)
        
        # Add file handler if log_file specified
        if log_file:
            if log_rotation:
                file_handler = logging.handlers.RotatingFileHandler(
                    log_file,
                    maxBytes=max_bytes,
                    backupCount=backup_count
                )
            else:
                file_handler = logging.FileHandler(log_file)
            
            file_handler.setLevel(log_level)
            handlers.append(file_handler)
    
    # Create and set formatter
    if enable_json:
        formatter = get_json_formatter(
            enable_docker_context=enable_docker_context,
            enable_request_context=True
        )
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    # Apply formatter to all handlers
    for handler in handlers:
        handler.setFormatter(formatter)
        root_logger.addHandler(handler)
    
    # Log configuration complete
    root_logger.info(
        f"Logging configured with level={level}, json={enable_json}, "
        f"docker_context={enable_docker_context}"
    )

def configure_gunicorn_logging(
    gunicorn_logger: logging.Logger,
    level: str = 'info',
    enable_json: bool = True
) -> None:
    """
    Configure logging for Gunicorn in Docker environments.
    
    Args:
        gunicorn_logger: Gunicorn logger instance
        level: Log level name
        enable_json: Whether to use JSON formatting
    """
    from .formatter import get_json_formatter
    
    # Convert log level string to constant
    log_level = get_log_level(level)
    
    # Set level for all existing handlers
    for handler in gunicorn_logger.handlers:
        handler.setLevel(log_level)
        
        # Set formatter if JSON is enabled
        if enable_json:
            formatter = get_json_formatter(
                enable_docker_context=True,
                enable_request_context=True
            )
            handler.setFormatter(formatter)
    
    # Configure root logger to use gunicorn's handlers
    root_logger = logging.getLogger()
    root_logger.handlers = gunicorn_logger.handlers
    root_logger.setLevel(log_level)

def get_logging_config_for_docker() -> Dict[str, Any]:
    """
    Get the logging configuration dictionary for Docker environments.
    
    Returns:
        Dictionary with logging configuration
    """
    from core.config_factory import ConfigFactory
    
    config = ConfigFactory.get_config()
    log_level = config.LOG_LEVEL.lower() if hasattr(config, 'LOG_LEVEL') else 'info'
    
    # Determine whether to use JSON based on environment
    enable_json = True
    
    # If running in Docker, always use JSON formatting
    if config.is_docker():
        enable_json = True
        
        # Get Docker-specific settings if available
        if hasattr(config, 'docker'):
            docker_settings = config.docker
            if hasattr(docker_settings, 'LOG_FORMAT'):
                enable_json = docker_settings.LOG_FORMAT.lower() == 'json'
    
    return {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'json': {
                '()': 'utils.logging.formatter.JsonFormatter',
                'include_docker_context': config.is_docker(),
                'include_hostname': True,
                'enable_request_context': True
            },
            'standard': {
                'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                'datefmt': '%Y-%m-%d %H:%M:%S'
            }
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'formatter': 'json' if enable_json else 'standard',
                'level': log_level.upper(),
                'stream': 'ext://sys.stdout'
            }
        },
        'root': {
            'level': log_level.upper(),
            'handlers': ['console']
        },
        'loggers': {
            'gunicorn.access': {
                'level': log_level.upper(),
                'handlers': ['console'],
                'propagate': False
            },
            'gunicorn.error': {
                'level': 'INFO',
                'handlers': ['console'],
                'propagate': False
            },
            'uvicorn': {
                'level': log_level.upper(),
                'handlers': ['console'],
                'propagate': False
            },
            'uvicorn.access': {
                'level': log_level.upper(),
                'handlers': ['console'],
                'propagate': False
            },
            'uvicorn.error': {
                'level': 'INFO',
                'handlers': ['console'],
                'propagate': False
            }
        }
    }