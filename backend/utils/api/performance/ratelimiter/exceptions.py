"""
Rate limiter exception classes.

This module defines all exceptions specific to the rate limiting functionality.
"""

from typing import Dict, Any, Optional


class RateLimitError(Exception):
    """Base exception for all rate limiter errors."""
    pass


class RateLimitExceeded(RateLimitError):
    """Exception raised when rate limit is exceeded."""
    
    def __init__(
        self, 
        message: str = "Rate limit exceeded", 
        limit: Optional[int] = None,
        remaining: Optional[int] = None,
        reset: Optional[int] = None,
        retry_after: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.limit = limit
        self.remaining = remaining
        self.reset = reset
        self.retry_after = retry_after
        self.details = details or {}
        super().__init__(message)


class ConfigurationError(RateLimitError):
    """Exception raised when there's an issue with rate limiter configuration."""
    
    def __init__(
        self, 
        message: str = "Invalid rate limiter configuration",
        param: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.param = param
        self.details = details or {}
        super().__init__(message)


class StorageError(RateLimitError):
    """Exception raised when there's an issue with rate limiter storage."""
    
    def __init__(
        self, 
        message: str = "Storage error",
        storage_type: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.storage_type = storage_type
        self.details = details or {}
        super().__init__(message)


class StrategyError(RateLimitError):
    """Exception raised when there's an issue with rate limit strategy."""
    
    def __init__(
        self, 
        message: str = "Strategy error",
        strategy_type: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.strategy_type = strategy_type
        self.details = details or {}
        super().__init__(message)