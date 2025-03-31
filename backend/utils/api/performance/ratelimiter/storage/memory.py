"""
In-memory storage backend for rate limiting.

This module provides a simple in-memory implementation of the BaseStorage interface.
Not recommended for production use with multiple worker processes.
"""

import time
from typing import Dict, Any, Optional, List, Tuple
from .base import BaseStorage


class MemoryStorage(BaseStorage):
    """In-memory storage implementation for rate limiting."""
    
    def __init__(self, cleanup_interval: int = 60):
        """
        Initialize the in-memory storage.
        
        Args:
            cleanup_interval: Interval in seconds for cleaning up expired entries
        """
        self._storage: Dict[str, Tuple[int, int]] = {}  # key -> (count, expire_timestamp)
        self._cleanup_interval = cleanup_interval
        self._last_cleanup = time.time()
    
    def _cleanup_expired(self):
        """Remove expired entries from storage."""
        now = time.time()
        
        # Only run cleanup if the interval has passed
        if now - self._last_cleanup < self._cleanup_interval:
            return
            
        # Find expired keys
        expired_keys = [
            key for key, (_, expire_time) in self._storage.items()
            if expire_time <= now
        ]
        
        # Remove expired keys
        for key in expired_keys:
            self._storage.pop(key, None)
            
        self._last_cleanup = now
    
    async def increment(
        self, 
        key: str, 
        expire_seconds: int, 
        amount: int = 1
    ) -> Tuple[int, int]:
        """
        Increment a counter and return the current count and remaining TTL.
        
        Args:
            key: The unique identifier for the counter
            expire_seconds: Time-to-live in seconds for the counter
            amount: Amount to increment by (default: 1)
            
        Returns:
            Tuple containing (current count, remaining TTL in seconds)
        """
        self._cleanup_expired()
        now = time.time()
        
        if key in self._storage:
            count, expire_time = self._storage[key]
            # If key exists but has expired, reset it
            if expire_time <= now:
                count = amount
                expire_time = now + expire_seconds
            else:
                count += amount
        else:
            count = amount
            expire_time = now + expire_seconds
            
        self._storage[key] = (count, expire_time)
        ttl = max(0, int(expire_time - now))
        
        return count, ttl
    
    async def get(self, key: str) -> Tuple[Optional[int], Optional[int]]:
        """
        Get the current count and TTL for a key.
        
        Args:
            key: The unique identifier for the counter
            
        Returns:
            Tuple containing (current count or None, remaining TTL in seconds or None)
        """
        self._cleanup_expired()
        
        if key not in self._storage:
            return None, None
            
        count, expire_time = self._storage[key]
        now = time.time()
        
        # If expired, return None
        if expire_time <= now:
            self._storage.pop(key, None)
            return None, None
            
        ttl = max(0, int(expire_time - now))
        return count, ttl
    
    async def set(
        self,
        key: str,
        value: int,
        expire_seconds: int
    ) -> bool:
        """
        Set a key's value with expiration.
        
        Args:
            key: The unique identifier for the counter
            value: Value to set
            expire_seconds: Time-to-live in seconds
            
        Returns:
            True if successful, False otherwise
        """
        self._cleanup_expired()
        
        expire_time = time.time() + expire_seconds
        self._storage[key] = (value, expire_time)
        return True
    
    async def reset(self, key: str) -> bool:
        """
        Reset (delete) a counter.
        
        Args:
            key: The unique identifier for the counter
            
        Returns:
            True if successfully deleted, False if key didn't exist
        """
        self._cleanup_expired()
        
        if key in self._storage:
            del self._storage[key]
            return True
        return False
    
    async def close(self) -> None:
        """Clean up any resources (no-op for memory storage)."""
        self._storage.clear()
    
    async def get_many(self, keys: List[str]) -> Dict[str, Tuple[Optional[int], Optional[int]]]:
        """
        Get counts and TTLs for multiple keys at once.
        
        Args:
            keys: List of unique identifiers
            
        Returns:
            Dict mapping keys to tuples of (count, ttl)
        """
        self._cleanup_expired()
        result = {}
        now = time.time()
        
        for key in keys:
            if key in self._storage:
                count, expire_time = self._storage[key]
                
                # Skip expired keys
                if expire_time <= now:
                    result[key] = (None, None)
                    continue
                    
                ttl = max(0, int(expire_time - now))
                result[key] = (count, ttl)
            else:
                result[key] = (None, None)
                
        return result