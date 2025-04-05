"""
JSON logging formatter for structured logging in container environments.

This module provides a standardized JSON formatter for logs that ensures:
1. Consistent log format for all application components
2. Container context in Docker environments
3. Request context for distributed tracing
4. Integration with log aggregation and analysis tools
"""

import os
import json
import socket
import logging
import time
import traceback
from datetime import datetime
from typing import Dict, Any, Optional, Union, List, Callable

# Import Docker context provider if available
try:
    from .context import docker_context_provider, get_request_context
except ImportError:
    # Default implementations if context module not available
    def docker_context_provider() -> Dict[str, Any]:
        """Default implementation that returns Docker environment variables."""
        context = {}
        if os.environ.get('RUNNING_IN_DOCKER') == 'true':
            context['container_name'] = os.environ.get('CONTAINER_NAME', 'unknown')
            context['container_id'] = os.environ.get('CONTAINER_ID', 'unknown')
        return context
    
    def get_request_context() -> Dict[str, Any]:
        """Default implementation that returns empty context."""
        return {}

class JsonFormatter(logging.Formatter):
    """
    Custom formatter that outputs JSON formatted logs.
    
    Attributes:
        include_docker_context: Whether to include Docker container information
        include_hostname: Whether to include the hostname in logs
        enable_request_context: Whether to include request context
        context_providers: List of functions that provide additional context
    """
    
    def __init__(
        self,
        include_docker_context: bool = True,
        include_hostname: bool = True,
        enable_request_context: bool = True,
        context_providers: Optional[List[Callable[[], Dict[str, Any]]]] = None
    ):
        """
        Initialize the JSON formatter.
        
        Args:
            include_docker_context: Whether to include Docker container information
            include_hostname: Whether to include the hostname in logs
            enable_request_context: Whether to include request context 
            context_providers: List of functions that provide additional context
        """
        super().__init__()
        self.include_docker_context = include_docker_context
        self.include_hostname = include_hostname
        self.enable_request_context = enable_request_context
        self.hostname = socket.gethostname()
        self.context_providers = context_providers or []
        
        # Add Docker context provider if enabled
        if include_docker_context:
            self.context_providers.append(docker_context_provider)
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format the log record as JSON.
        
        Args:
            record: LogRecord instance
            
        Returns:
            JSON string representation of the log record
        """
        # Basic log data
        log_data = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'name': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'line': record.lineno,
        }
        
        # Add hostname if enabled
        if self.include_hostname:
            log_data['hostname'] = self.hostname
        
        # Include process and thread information
        log_data['process'] = {
            'id': record.process,
            'name': record.processName
        }
        log_data['thread'] = {
            'id': record.thread,
            'name': record.threadName
        }
        
        # Add exception info if available
        if record.exc_info:
            log_data['exception'] = {
                'type': record.exc_info[0].__name__,
                'message': str(record.exc_info[1]),
                'traceback': traceback.format_exception(*record.exc_info)
            }
        
        # Add request context if enabled
        if self.enable_request_context:
            request_context = get_request_context()
            if request_context:
                log_data['request'] = request_context
        
        # Add extra fields from the record
        if hasattr(record, 'extra'):
            log_data.update(record.extra)
        
        # Apply additional context from providers
        for provider in self.context_providers:
            try:
                context = provider()
                if context:
                    log_data.update(context)
            except Exception as e:
                # Don't let context provider failures break logging
                log_data.setdefault('context_errors', []).append(str(e))
        
        # Add context from record attributes
        for key, value in record.__dict__.items():
            if key not in [
                'args', 'asctime', 'created', 'exc_info', 'exc_text', 
                'filename', 'funcName', 'id', 'levelname', 'levelno',
                'lineno', 'module', 'msecs', 'message', 'msg', 'name', 
                'pathname', 'process', 'processName', 'relativeCreated', 
                'stack_info', 'thread', 'threadName', 'extra'
            ] and not key.startswith('_'):
                log_data[key] = value
        
        # Convert to JSON string
        return json.dumps(log_data)

def get_json_formatter(
    enable_docker_context: bool = True,
    enable_request_context: bool = True,
    additional_providers: Optional[List[Callable[[], Dict[str, Any]]]] = None
) -> JsonFormatter:
    """
    Get a configured JSON formatter.
    
    Args:
        enable_docker_context: Whether to include Docker container context
        enable_request_context: Whether to include request context
        additional_providers: Additional context provider functions
        
    Returns:
        Configured JsonFormatter instance
    """
    providers = additional_providers or []
    
    return JsonFormatter(
        include_docker_context=enable_docker_context,
        enable_request_context=enable_request_context,
        context_providers=providers
    )