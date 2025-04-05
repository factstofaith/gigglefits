"""
Context providers for structured logging.

This module handles enriching log messages with contextual information such as:
1. Docker container details when running in containers
2. Request tracking information for distributed systems
3. Performance metrics for monitoring
4. Application-specific context
"""

import os
import time
import uuid
import socket
import threading
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any, Optional, Union, List

# Thread-local storage for request context
_request_context = threading.local()

@dataclass
class RequestContext:
    """
    Context for a request in a distributed system.
    
    Attributes:
        request_id: Unique identifier for the request
        start_time: Time when the request started
        user_id: ID of the authenticated user (if applicable)
        tenant_id: ID of the tenant (for multi-tenant systems)
        session_id: Session identifier
        ip_address: Client IP address
        user_agent: User agent string
    """
    request_id: str
    start_time: float = time.time()
    user_id: Optional[str] = None
    tenant_id: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'request_id': self.request_id,
            'start_time': datetime.fromtimestamp(self.start_time).isoformat(),
            'elapsed_ms': int((time.time() - self.start_time) * 1000),
            'user_id': self.user_id,
            'tenant_id': self.tenant_id,
            'session_id': self.session_id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent
        }

def get_request_id() -> str:
    """
    Get the current request ID from context or generate a new one.
    
    Returns:
        String request ID
    """
    if hasattr(_request_context, 'request_id'):
        return _request_context.request_id
    
    # Generate a new request ID
    request_id = str(uuid.uuid4())
    _request_context.request_id = request_id
    return request_id

def set_request_context(
    request_id: Optional[str] = None,
    user_id: Optional[str] = None,
    tenant_id: Optional[str] = None,
    session_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> None:
    """
    Set request context values for the current thread.
    
    Args:
        request_id: Unique identifier for the request
        user_id: ID of the authenticated user
        tenant_id: ID of the tenant
        session_id: Session identifier
        ip_address: Client IP address
        user_agent: User agent string
    """
    if not hasattr(_request_context, 'context'):
        _request_context.context = {}
    
    if request_id:
        _request_context.request_id = request_id
    
    # Set context values
    context = {
        'user_id': user_id,
        'tenant_id': tenant_id,
        'session_id': session_id,
        'ip_address': ip_address,
        'user_agent': user_agent
    }
    
    # Filter out None values
    context = {k: v for k, v in context.items() if v is not None}
    
    # Update existing context
    _request_context.context.update(context)

def get_request_context() -> Dict[str, Any]:
    """
    Get the current request context.
    
    Returns:
        Dictionary with request context
    """
    context = {}
    
    # Add request_id if available
    if hasattr(_request_context, 'request_id'):
        context['request_id'] = _request_context.request_id
    
    # Add context values if available
    if hasattr(_request_context, 'context'):
        context.update(_request_context.context)
    
    return context

def clear_request_context() -> None:
    """Clear the request context for the current thread."""
    if hasattr(_request_context, 'context'):
        _request_context.context.clear()
    
    if hasattr(_request_context, 'request_id'):
        delattr(_request_context, 'request_id')

def docker_context_provider() -> Dict[str, Any]:
    """
    Provide Docker container context for logs.
    
    Returns:
        Dictionary with Docker container information
    """
    # Check for Docker environment
    from core.config_factory import ConfigFactory
    
    if not ConfigFactory.is_docker():
        return {}
    
    # Get Docker configuration
    config = ConfigFactory.get_config()
    docker_settings = config.docker
    
    # Build container context
    container_context = {
        'docker': {
            'container_name': docker_settings.CONTAINER_NAME,
            'container_id': docker_settings.CONTAINER_ID[:12] if docker_settings.CONTAINER_ID else None,
            'image': os.environ.get('IMAGE_NAME', 'unknown'),
            'environment': config.ENVIRONMENT,
        }
    }
    
    # Add compose project if available
    if hasattr(docker_settings, 'DOCKER_COMPOSE_PROJECT'):
        container_context['docker']['compose_project'] = docker_settings.DOCKER_COMPOSE_PROJECT
    
    return container_context

def system_context_provider() -> Dict[str, Any]:
    """
    Provide system context for logs.
    
    Returns:
        Dictionary with system context information
    """
    return {
        'system': {
            'hostname': socket.gethostname(),
            'process_id': os.getpid(),
        }
    }

def performance_context_provider() -> Dict[str, Any]:
    """
    Provide performance context for logs.
    
    Returns:
        Dictionary with performance metrics
    """
    import psutil
    
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    
    return {
        'performance': {
            'memory_rss_mb': memory_info.rss / (1024 * 1024),
            'cpu_percent': process.cpu_percent(interval=None),
            'thread_count': process.num_threads(),
            'open_files': len(process.open_files()),
            'connections': len(process.connections()),
        }
    }