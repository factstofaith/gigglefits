"""
Token Bucket Rate Limiting Strategy.

This strategy implements the token bucket algorithm, which allows for
bursts of traffic while still maintaining an average rate limit.
"""

import time
import math
from typing import Dict, Any, Tuple, Optional
from datetime import datetime

from .base import RateLimitStrategy
from ..storage.base import BaseStorage


class TokenBucketStrategy(RateLimitStrategy):
    """
    Token Bucket Strategy for rate limiting.
    
    Implements the token bucket algorithm where tokens are added at a fixed rate
    to a bucket with a maximum capacity. Each request consumes one token.
    """
    
    def __init__(
        self,
        storage: BaseStorage,
        rate_limit: int,
        period_seconds: int,
        bucket_capacity: Optional[int] = None,
        namespace: str = "ratelimit:tokenbucket"
    ):
        """
        Initialize the token bucket strategy.
        
        Args:
            storage: Storage backend implementation
            rate_limit: Maximum number of tokens per period (token refill rate)
            period_seconds: Time period in seconds for token refill
            bucket_capacity: Maximum number of tokens the bucket can hold
                            (defaults to rate_limit if not specified)
            namespace: Namespace prefix for storage keys
        """
        super().__init__(storage, rate_limit, period_seconds, namespace)
        self.bucket_capacity = bucket_capacity if bucket_capacity is not None else rate_limit
        self.refill_rate = self.rate_limit / self.period_seconds  # tokens per second
    
    def _get_bucket_key(self, identifier: str) -> str:
        """
        Get the storage key for the token bucket.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Storage key for the token bucket
        """
        return f"{self.get_storage_key(identifier)}:bucket"
        
    def _get_last_update_key(self, identifier: str) -> str:
        """
        Get the storage key for the last update timestamp.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Storage key for the last update timestamp
        """
        return f"{self.get_storage_key(identifier)}:last_update"
        
    async def _get_bucket_state(self, identifier: str) -> Tuple[float, float]:
        """
        Get the current state of the token bucket.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Tuple of (current tokens, last update timestamp)
        """
        bucket_key = self._get_bucket_key(identifier)
        last_update_key = self._get_last_update_key(identifier)
        
        # Get both values in one operation
        keys = [bucket_key, last_update_key]
        values = await self.storage.get_many(keys)
        
        bucket_data = values.get(bucket_key, (None, None))
        last_update_data = values.get(last_update_key, (None, None))
        
        # Default values if not found
        tokens = float(bucket_data[0]) if bucket_data[0] is not None else float(self.bucket_capacity)
        last_update = float(last_update_data[0]) if last_update_data[0] is not None else time.time()
        
        return tokens, last_update
        
    async def _update_bucket_state(
        self,
        identifier: str,
        tokens: float,
        last_update: Optional[float] = None
    ) -> bool:
        """
        Update the token bucket state.
        
        Args:
            identifier: Unique identifier for the client/request
            tokens: Number of tokens in the bucket
            last_update: Timestamp of last update (defaults to current time)
            
        Returns:
            True if update was successful
        """
        if last_update is None:
            last_update = time.time()
            
        bucket_key = self._get_bucket_key(identifier)
        last_update_key = self._get_last_update_key(identifier)
        
        # TTL for both keys (much longer than period to maintain bucket state)
        ttl = max(self.period_seconds * 10, 3600)  # At least 1 hour
        
        # Store both values with pipeline
        async with self.storage.redis.pipeline() as pipe:
            await pipe.set(bucket_key, str(tokens), ex=ttl)
            await pipe.set(last_update_key, str(last_update), ex=ttl)
            results = await pipe.execute()
            
        return all(results)
        
    async def check_rate_limit(self, identifier: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if a request should be rate limited using the token bucket approach.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Tuple containing:
            - Boolean indicating if request is allowed (True) or should be limited (False)
            - Dictionary with rate limit information:
                - limit: Maximum tokens in bucket
                - remaining: Current tokens in bucket
                - reset: Seconds until bucket would be full again
                - retry_after: Seconds to wait before retry (for limited requests)
        """
        # Get current bucket state
        tokens, last_update = await self._get_bucket_state(identifier)
        
        # Calculate tokens to add based on time passed
        now = time.time()
        time_passed = now - last_update
        tokens_to_add = time_passed * self.refill_rate
        
        # Add tokens to bucket (up to capacity)
        current_tokens = min(self.bucket_capacity, tokens + tokens_to_add)
        
        # Check if bucket has at least one token
        allowed = current_tokens >= 1
        
        # Calculate time until bucket would be full
        time_to_fill = (self.bucket_capacity - current_tokens) / self.refill_rate if current_tokens < self.bucket_capacity else 0
        
        # Calculate time until next token is available (for retry-after)
        time_to_next_token = (1 - current_tokens) / self.refill_rate if current_tokens < 1 else 0
        
        return allowed, {
            "limit": self.bucket_capacity,
            "remaining": current_tokens,
            "reset": int(time_to_fill),
            "retry_after": int(time_to_next_token) if time_to_next_token > 0 else None
        }
        
    async def increment(self, identifier: str) -> Dict[str, Any]:
        """
        Take a token from the bucket and return rate limit info.
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            Dictionary with rate limit information
        """
        # Get current bucket state
        tokens, last_update = await self._get_bucket_state(identifier)
        
        # Calculate tokens to add based on time passed
        now = time.time()
        time_passed = now - last_update
        tokens_to_add = time_passed * self.refill_rate
        
        # Add tokens to bucket (up to capacity)
        current_tokens = min(self.bucket_capacity, tokens + tokens_to_add)
        
        # Check if bucket has at least one token
        allowed = current_tokens >= 1
        
        # Take a token if allowed
        if allowed:
            new_tokens = current_tokens - 1
        else:
            new_tokens = current_tokens
            
        # Update bucket state
        await self._update_bucket_state(identifier, new_tokens, now)
        
        # Calculate time until bucket would be full
        time_to_fill = (self.bucket_capacity - new_tokens) / self.refill_rate if new_tokens < self.bucket_capacity else 0
        
        # Calculate time until next token is available (for retry-after)
        time_to_next_token = (1 - new_tokens) / self.refill_rate if new_tokens < 1 else 0
        
        return {
            "limit": self.bucket_capacity,
            "remaining": new_tokens,
            "reset": int(time_to_fill),
            "retry_after": int(time_to_next_token) if time_to_next_token > 0 else None,
            "allowed": allowed
        }
        
    async def reset(self, identifier: str) -> bool:
        """
        Reset the token bucket for an identifier (fill to capacity).
        
        Args:
            identifier: Unique identifier for the client/request
            
        Returns:
            True if bucket was reset, False if error
        """
        # Set bucket to full capacity and update timestamp
        return await self._update_bucket_state(identifier, float(self.bucket_capacity))