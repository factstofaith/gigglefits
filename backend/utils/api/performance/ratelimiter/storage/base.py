"""
Base storage backend for rate limiting.

This module defines the interface that all storage backends must implement.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Union, List, Tuple


class BaseStorage(ABC):
    """Base abstract class for rate limiter storage backends."""
    
    @abstractmethod
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
        pass
    
    @abstractmethod
    async def get(self, key: str) -> Tuple[Optional[int], Optional[int]]:
        """
        Get the current count and TTL for a key.
        
        Args:
            key: The unique identifier for the counter
            
        Returns:
            Tuple containing (current count or None, remaining TTL in seconds or None)
        """
        pass
    
    @abstractmethod
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
        pass
    
    @abstractmethod
    async def reset(self, key: str) -> bool:
        """
        Reset (delete) a counter.
        
        Args:
            key: The unique identifier for the counter
            
        Returns:
            True if successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def close(self) -> None:
        """Clean up any resources used by the storage backend."""
        pass
    
    @abstractmethod
    async def get_many(self, keys: List[str]) -> Dict[str, Tuple[Optional[int], Optional[int]]]:
        """
        Get counts and TTLs for multiple keys at once.
        
        Args:
            keys: List of unique identifiers
            
        Returns:
            Dict mapping keys to tuples of (count, ttl)
        """
        pass
    
    def generate_key(
        self, 
        identifier: str, 
        namespace: str = "ratelimit"
    ) -> str:
        """
        Generate a storage key with namespace.
        
        Args:
            identifier: The unique identifier for the rate limit
            namespace: Namespace prefix for the key
            
        Returns:
            Full key string for use in storage
        """
        return f"{namespace}:{identifier}"