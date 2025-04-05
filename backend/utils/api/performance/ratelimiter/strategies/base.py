"""
Base rate limiting strategy.

This module defines the interface that all rate limiting strategies must implement.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Tuple, Union
from datetime import datetime

from ..storage.base import BaseStorage


class RateLimitStrategy(ABC):
    """Base abstract class for rate limiting strategies."""
    
    def __init__(
        self,
        storage: BaseStorage,
        rate_limit: int,
        period_seconds: int,
        namespace: str = "ratelimit"
    ):
        """
        Initialize the rate limiting strategy.
        
        Args:
            storage: Storage backend implementation
            rate_limit: Maximum number of requests allowed in the period
            period_seconds: Time period in seconds
            namespace: Namespace prefix for storage keys
        """
        self.storage = storage
        self.rate_limit = rate_limit
        self.period_seconds = period_seconds
        self.namespace = namespace
    
    @abstractmethod
    async def check_rate_limit(self, identifier: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if a request should be rate limited.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Tuple containing:
            - Boolean indicating if request is allowed (True) or should be limited (False)
            - Dictionary with rate limit information:
                - limit: Maximum requests allowed
                - remaining: Remaining requests allowed
                - reset: Seconds until limit reset
                - retry_after: Seconds to wait before retry (for limited requests)
        """
        pass
    
    @abstractmethod
    async def increment(self, identifier: str) -> Dict[str, Any]:
        """
        Increment the counter for an identifier and return rate limit info.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Dictionary with rate limit information
        """
        pass
        
    @abstractmethod
    async def reset(self, identifier: str) -> bool:
        """
        Reset the rate limit counter for an identifier.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            True if counter was reset, False if identifier not found
        """
        pass
    
    def get_storage_key(self, identifier: str) -> str:
        """
        Generate a storage key for the identifier with namespace.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Storage key string
        """
        return self.storage.generate_key(identifier, self.namespace)
        
    def get_window_key(self, identifier: str, timestamp: Optional[datetime] = None) -> str:
        """
        Generate a storage key for a specific time window.
        
        Args:
            identifier: Unique identifier for the client/request
            timestamp: Timestamp for the window (default: current time)
            
        Returns:
            Storage key string including window information
        """
        if timestamp is None:
            timestamp = datetime.now(timezone.utc)
        
        # Default implementation - can be overridden in subclasses
        # Convert timestamp to a window identifier (e.g., rounded to minute)
        window = int(timestamp.timestamp() / self.period_seconds)
        return f"{self.get_storage_key(identifier)}:{window}"