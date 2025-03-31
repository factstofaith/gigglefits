"""
Redis storage backend for rate limiting.

This module provides a Redis implementation of the BaseStorage interface.
Recommended for production use with multiple worker processes.
"""

from typing import Dict, Any, Optional, List, Tuple, cast, Union
import redis.asyncio as redis
from redis.asyncio.client import Redis
from redis.asyncio.connection import ConnectionPool

from .base import BaseStorage
from ..exceptions import StorageError


class RedisStorage(BaseStorage):
    """Redis storage implementation for rate limiting."""
    
    def __init__(
        self,
        redis_url: Optional[str] = None,
        redis_connection: Optional[Redis] = None,
        connection_pool: Optional[ConnectionPool] = None,
        **redis_options
    ):
        """
        Initialize the Redis storage.
        
        Args:
            redis_url: Redis connection URL (redis://host:port/db)
            redis_connection: Existing Redis client instance
            connection_pool: Existing Redis connection pool
            **redis_options: Additional Redis client options
        """
        if redis_connection:
            self.redis = redis_connection
        elif connection_pool:
            self.redis = redis.Redis(connection_pool=connection_pool, **redis_options)
        elif redis_url:
            self.redis = redis.from_url(redis_url, **redis_options)
        else:
            self.redis = redis.Redis(**redis_options)
            
        self._connection_provided = bool(redis_connection)
    
    async def increment(
        self, 
        key: str, 
        expire_seconds: int, 
        amount: int = 1
    ) -> Tuple[int, int]:
        """
        Increment a counter and return the current count and remaining TTL.
        
        Uses Redis INCRBY and EXPIRE commands.
        
        Args:
            key: The unique identifier for the counter
            expire_seconds: Time-to-live in seconds for the counter
            amount: Amount to increment by (default: 1)
            
        Returns:
            Tuple containing (current count, remaining TTL in seconds)
        """
        try:
            # Use pipeline to ensure atomic operations
            async with self.redis.pipeline() as pipe:
                # Increment counter
                await pipe.incrby(key, amount)
                
                # Set expiry if this is a new key
                await pipe.ttl(key)
                
                # Execute pipeline
                count, ttl = await pipe.execute()
                
                # If TTL is -1 (no expiry) or -2 (key doesn't exist), set expiry
                if ttl < 0:
                    await self.redis.expire(key, expire_seconds)
                    ttl = expire_seconds
                    
                return int(count), int(ttl)
        except redis.RedisError as e:
            raise StorageError(f"Redis error: {str(e)}", storage_type="redis") from e
    
    async def get(self, key: str) -> Tuple[Optional[int], Optional[int]]:
        """
        Get the current count and TTL for a key.
        
        Uses Redis GET and TTL commands.
        
        Args:
            key: The unique identifier for the counter
            
        Returns:
            Tuple containing (current count or None, remaining TTL in seconds or None)
        """
        try:
            async with self.redis.pipeline() as pipe:
                await pipe.get(key)
                await pipe.ttl(key)
                
                value, ttl = await pipe.execute()
                
                if value is None or ttl < 0:  # Key doesn't exist or has expired
                    return None, None
                    
                return int(value), int(ttl)
        except redis.RedisError as e:
            raise StorageError(f"Redis error: {str(e)}", storage_type="redis") from e
    
    async def set(
        self,
        key: str,
        value: int,
        expire_seconds: int
    ) -> bool:
        """
        Set a key's value with expiration.
        
        Uses Redis SET and EXPIRE commands.
        
        Args:
            key: The unique identifier for the counter
            value: Value to set
            expire_seconds: Time-to-live in seconds
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Set value with expiration in one atomic command
            result = await self.redis.set(key, value, ex=expire_seconds)
            return result is True
        except redis.RedisError as e:
            raise StorageError(f"Redis error: {str(e)}", storage_type="redis") from e
    
    async def reset(self, key: str) -> bool:
        """
        Reset (delete) a counter.
        
        Uses Redis DEL command.
        
        Args:
            key: The unique identifier for the counter
            
        Returns:
            True if successfully deleted, False if key didn't exist
        """
        try:
            result = await self.redis.delete(key)
            return result > 0
        except redis.RedisError as e:
            raise StorageError(f"Redis error: {str(e)}", storage_type="redis") from e
    
    async def close(self) -> None:
        """
        Close the Redis connection.
        
        Only closes if we created the Redis client (not if it was provided).
        """
        if not self._connection_provided:
            await self.redis.close()
    
    async def get_many(self, keys: List[str]) -> Dict[str, Tuple[Optional[int], Optional[int]]]:
        """
        Get counts and TTLs for multiple keys at once.
        
        Uses Redis MGET and pipelined TTL commands.
        
        Args:
            keys: List of unique identifiers
            
        Returns:
            Dict mapping keys to tuples of (count, ttl)
        """
        if not keys:
            return {}
            
        try:
            result: Dict[str, Tuple[Optional[int], Optional[int]]] = {}
            
            async with self.redis.pipeline() as pipe:
                # Get all values
                await pipe.mget(keys)
                
                # Get TTL for each key
                for key in keys:
                    await pipe.ttl(key)
                    
                responses = await pipe.execute()
                
                # First response is the MGET result
                values = responses[0]
                
                # Remaining responses are TTL results
                ttls = responses[1:]
                
                for i, key in enumerate(keys):
                    value = values[i]
                    ttl = ttls[i]
                    
                    if value is None or ttl < 0:  # Key doesn't exist or has expired
                        result[key] = (None, None)
                    else:
                        result[key] = (int(value), int(ttl))
                        
                return result
        except redis.RedisError as e:
            raise StorageError(f"Redis error: {str(e)}", storage_type="redis") from e