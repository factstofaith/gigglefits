"""
Fixed Window Rate Limiting Strategy.

This strategy uses a fixed time window approach for rate limiting.
The window resets completely after each period, which can lead to
twice the rate limit being allowed at the window boundary.
"""

import time
import math
from typing import Dict, Any, Tuple
from datetime import datetime

from .base import RateLimitStrategy
from ..storage.base import BaseStorage


class FixedWindowStrategy(RateLimitStrategy):
    """
    Fixed Window Strategy for rate limiting.
    
    Tracks request count in fixed time windows (e.g., per minute).
    When the window expires, the counter resets.
    """
    
    def __init__(
        self,
        storage: BaseStorage,
        rate_limit: int,
        period_seconds: int,
        namespace: str = "ratelimit:fixedwindow"
    ):
        """
        Initialize the fixed window strategy.
        
        Args:
            storage: Storage backend implementation
            rate_limit: Maximum number of requests allowed in the period
            period_seconds: Time period in seconds
            namespace: Namespace prefix for storage keys
        """
        super().__init__(storage, rate_limit, period_seconds, namespace)
    
    def get_window_key(self, identifier: str, timestamp: datetime = None) -> str:
        """
        Generate a storage key for the current fixed window.
        
        Args:
            identifier: Unique identifier for the client/request
            timestamp: Timestamp for the window (default: current time)
            
        Returns:
            Storage key string including window information
        """
        if timestamp is None:
            timestamp = datetime.utcnow()
            
        # For fixed window, we divide time into discrete periods
        # e.g., for a 60-second window, each minute becomes a window
        window = int(timestamp.timestamp() / self.period_seconds)
        return f"{self.get_storage_key(identifier)}:{window}"
        
    async def check_rate_limit(self, identifier: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if a request should be rate limited using the fixed window approach.
        
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
        window_key = self.get_window_key(identifier)
        count, ttl = await self.storage.get(window_key)
        
        # Calculate remaining time in current window
        now = time.time()
        window_start = math.floor(now / self.period_seconds) * self.period_seconds
        reset = self.period_seconds - (now - window_start)
        
        # If key doesn't exist or TTL is negative, counter is 0
        if count is None:
            return True, {
                "limit": self.rate_limit,
                "remaining": self.rate_limit,
                "reset": int(reset),
                "retry_after": None
            }
            
        # Check if under the limit
        allowed = count < self.rate_limit
        remaining = max(0, self.rate_limit - count)
        
        return allowed, {
            "limit": self.rate_limit,
            "remaining": remaining,
            "reset": int(reset),
            "retry_after": int(reset) if not allowed else None
        }
        
    async def increment(self, identifier: str) -> Dict[str, Any]:
        """
        Increment the counter for an identifier and return rate limit info.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Dictionary with rate limit information
        """
        window_key = self.get_window_key(identifier)
        
        # Calculate remaining time in current window for TTL
        now = time.time()
        window_start = math.floor(now / self.period_seconds) * self.period_seconds
        ttl = self.period_seconds - (now - window_start)
        
        # Increment counter and set/update TTL
        count, _ = await self.storage.increment(window_key, int(ttl))
        
        # Check if under the limit
        allowed = count <= self.rate_limit
        remaining = max(0, self.rate_limit - count)
        
        return {
            "limit": self.rate_limit,
            "remaining": remaining,
            "reset": int(ttl),
            "retry_after": int(ttl) if not allowed else None,
            "allowed": allowed
        }
        
    async def reset(self, identifier: str) -> bool:
        """
        Reset the rate limit counter for an identifier.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            True if counter was reset, False if identifier not found
        """
        window_key = self.get_window_key(identifier)
        return await self.storage.reset(window_key)