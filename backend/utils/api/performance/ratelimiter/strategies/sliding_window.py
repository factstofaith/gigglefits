"""
Sliding Window Rate Limiting Strategy.

This strategy uses a rolling time window approach for rate limiting.
It improves on fixed window by considering a weighted share of the previous window,
which prevents traffic spikes at window boundaries.
"""

import time
import math
from typing import Dict, Any, Tuple, List, Optional
from datetime import datetime

from .base import RateLimitStrategy
from ..storage.base import BaseStorage


class SlidingWindowStrategy(RateLimitStrategy):
    """
    Sliding Window Strategy for rate limiting.
    
    Uses the current window's count plus a weighted portion of the previous window
    to create a smooth sliding effect.
    """
    
    def __init__(
        self,
        storage: BaseStorage,
        rate_limit: int,
        period_seconds: int,
        namespace: str = "ratelimit:slidingwindow"
    ):
        """
        Initialize the sliding window strategy.
        
        Args:
            storage: Storage backend implementation
            rate_limit: Maximum number of requests allowed in the period
            period_seconds: Time period in seconds
            namespace: Namespace prefix for storage keys
        """
        super().__init__(storage, rate_limit, period_seconds, namespace)
    
    def get_current_window_key(self, identifier: str) -> str:
        """
        Get the storage key for the current time window.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Storage key for the current window
        """
        current_window = math.floor(time.time() / self.period_seconds)
        return f"{self.get_storage_key(identifier)}:{current_window}"
        
    def get_previous_window_key(self, identifier: str) -> str:
        """
        Get the storage key for the previous time window.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Storage key for the previous window
        """
        previous_window = math.floor(time.time() / self.period_seconds) - 1
        return f"{self.get_storage_key(identifier)}:{previous_window}"
    
    async def _get_window_counts(self, identifier: str) -> Tuple[int, int, float]:
        """
        Get counts for current and previous windows, and calculate weight.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Tuple of (current count, previous count, previous window weight)
        """
        # Get both window keys
        current_key = self.get_current_window_key(identifier)
        previous_key = self.get_previous_window_key(identifier)
        
        # Get counts for both windows in one operation
        window_counts = await self.storage.get_many([current_key, previous_key])
        
        # Extract counts, defaulting to 0 if not found
        current_data = window_counts.get(current_key, (None, None))
        previous_data = window_counts.get(previous_key, (None, None))
        
        current_count = current_data[0] or 0
        previous_count = previous_data[0] or 0
        
        # Calculate position in current window (0.0 to 1.0)
        now = time.time()
        window_start = math.floor(now / self.period_seconds) * self.period_seconds
        position_in_window = (now - window_start) / self.period_seconds
        
        # Weight for previous window (1.0 at start of window, 0.0 at end)
        previous_weight = 1.0 - position_in_window
        
        return current_count, previous_count, previous_weight
        
    async def check_rate_limit(self, identifier: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if a request should be rate limited using the sliding window approach.
        
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
        # Get counts and weight
        current_count, previous_count, previous_weight = await self._get_window_counts(identifier)
        
        # Calculate effective count using sliding window formula
        effective_count = current_count + (previous_count * previous_weight)
        
        # Calculate time until reset
        now = time.time()
        window_start = math.floor(now / self.period_seconds) * self.period_seconds
        reset = self.period_seconds - (now - window_start)
        
        # Check if under the limit
        allowed = effective_count < self.rate_limit
        remaining = max(0, math.floor(self.rate_limit - effective_count))
        
        return allowed, {
            "limit": self.rate_limit,
            "remaining": remaining,
            "reset": int(reset),
            "retry_after": int(reset) if not allowed else None,
            "current_count": current_count,
            "previous_count": previous_count,
            "effective_count": effective_count
        }
        
    async def increment(self, identifier: str) -> Dict[str, Any]:
        """
        Increment the counter for an identifier and return rate limit info.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Dictionary with rate limit information
        """
        # Increment current window counter
        current_key = self.get_current_window_key(identifier)
        
        # Calculate TTL to expire at the end of next window
        now = time.time()
        window_start = math.floor(now / self.period_seconds) * self.period_seconds
        ttl = (2 * self.period_seconds) - (now - window_start)
        
        # Increment counter
        current_count, _ = await self.storage.increment(current_key, int(ttl))
        
        # Get previous window count and position
        previous_key = self.get_previous_window_key(identifier)
        previous_data = await self.storage.get(previous_key)
        previous_count = previous_data[0] or 0
        
        # Calculate position in current window
        position_in_window = (now - window_start) / self.period_seconds
        previous_weight = 1.0 - position_in_window
        
        # Calculate effective count
        effective_count = current_count + (previous_count * previous_weight)
        
        # Check if under the limit
        allowed = effective_count <= self.rate_limit
        remaining = max(0, math.floor(self.rate_limit - effective_count))
        reset = int(self.period_seconds - (now - window_start))
        
        return {
            "limit": self.rate_limit,
            "remaining": remaining,
            "reset": reset,
            "retry_after": reset if not allowed else None,
            "current_count": current_count,
            "previous_count": previous_count,
            "effective_count": effective_count,
            "allowed": allowed
        }
        
    async def reset(self, identifier: str) -> bool:
        """
        Reset the rate limit counter for an identifier.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            True if at least one counter was reset, False otherwise
        """
        # Reset both current and previous window
        current_key = self.get_current_window_key(identifier)
        previous_key = self.get_previous_window_key(identifier)
        
        current_reset = await self.storage.reset(current_key)
        previous_reset = await self.storage.reset(previous_key)
        
        return current_reset or previous_reset