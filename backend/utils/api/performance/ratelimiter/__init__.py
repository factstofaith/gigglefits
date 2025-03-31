"""
Rate limiting module for FastAPI applications.

This package provides a comprehensive rate limiting solution for FastAPI applications,
including middleware, strategies, and storage backends.
"""

from .middleware import RateLimiter
from .config import RateLimitConfig, ConfigurationManager
from .exceptions import RateLimitError, RateLimitExceeded, ConfigurationError, StorageError, StrategyError
from .metrics import RateLimitMetrics, get_metrics, record_request, reset_metrics
from .tenant import TenantRateLimiter, TenantRateLimitConfig

# Re-export strategies for backward compatibility
from .strategies.base import RateLimitStrategy
from .strategies.fixed_window import FixedWindowStrategy
from .strategies.sliding_window import SlidingWindowStrategy
from .strategies.token_bucket import TokenBucketStrategy

# Re-export storage backends for backward compatibility
from .storage.base import BaseStorage
from .storage.memory import MemoryStorage
from .storage.redis import RedisStorage

# Utility functions
from .utils import (
    generate_key, 
    hash_key, 
    add_headers, 
    is_path_exempted, 
    is_ip_exempted,
    get_remote_address,
    normalize_ip_address
)

__all__ = [
    # Main components
    'RateLimiter',
    'RateLimitConfig',
    'ConfigurationManager',
    
    # Exceptions
    'RateLimitError',
    'RateLimitExceeded',
    'ConfigurationError',
    'StorageError',
    'StrategyError',
    
    # Strategies
    'RateLimitStrategy',
    'FixedWindowStrategy',
    'SlidingWindowStrategy',
    'TokenBucketStrategy',
    
    # Storage backends
    'BaseStorage',
    'MemoryStorage',
    'RedisStorage',
    
    # Metrics
    'RateLimitMetrics',
    'get_metrics',
    'record_request',
    'reset_metrics',
    
    # Tenant handling
    'TenantRateLimiter',
    'TenantRateLimitConfig',
    
    # Utilities
    'generate_key',
    'hash_key',
    'add_headers',
    'is_path_exempted',
    'is_ip_exempted',
    'get_remote_address',
    'normalize_ip_address',
]

# Version
__version__ = '1.0.0'