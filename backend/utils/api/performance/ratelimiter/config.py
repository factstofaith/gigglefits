"""
Configuration management for rate limiting.

This module provides classes and utilities for configuring rate limiting.
"""

from typing import Dict, Any, List, Optional, Union, Callable, Type
from enum import Enum
from pydantic import BaseModel, Field, field_validator

from .strategies.base import RateLimitStrategy
from .strategies.fixed_window import FixedWindowStrategy
from .strategies.sliding_window import SlidingWindowStrategy
from .strategies.token_bucket import TokenBucketStrategy
from .storage.base import BaseStorage
from .storage.memory import MemoryStorage
from .storage.redis import RedisStorage


class RateLimitStrategyType(str, Enum):
    """Supported rate limiting strategy types."""
    FIXED_WINDOW = "fixed_window"
    SLIDING_WINDOW = "sliding_window"
    TOKEN_BUCKET = "token_bucket"


class StorageType(str, Enum):
    """Supported storage types."""
    MEMORY = "memory"
    REDIS = "redis"


class RedisConfig(BaseModel):
    """Redis connection configuration."""
    url: Optional[str] = None
    host: str = "localhost"
    port: int = 6379
    db: int = 0
    password: Optional[str] = None
    socket_timeout: Optional[int] = None
    socket_connect_timeout: Optional[int] = None
    connection_pool_kwargs: Dict[str, Any] = Field(default_factory=dict)
    
    def get_connection_params(self) -> Dict[str, Any]:
        """
        Get Redis connection parameters.
        
        Returns:
            Dictionary of connection parameters
        """
        if self.url:
            return {"redis_url": self.url}
        
        params = {
            "host": self.host,
            "port": self.port,
            "db": self.db
        }
        
        if self.password:
            params["password"] = self.password
            
        if self.socket_timeout:
            params["socket_timeout"] = self.socket_timeout
            
        if self.socket_connect_timeout:
            params["socket_connect_timeout"] = self.socket_connect_timeout
            
        if self.connection_pool_kwargs:
            params.update(self.connection_pool_kwargs)
            
        return params


# Define constants for default values
DEFAULT_RATE_LIMIT = 100  # Requests per period
DEFAULT_PERIOD_SECONDS = 60  # One minute period
DEFAULT_MAX_KEY_LENGTH = 128
DEFAULT_NAMESPACE = "ratelimit"
DEFAULT_HEADER_PREFIX = "X-RateLimit-"
DEFAULT_TENANT_HEADER = "X-Tenant-ID"


class RateLimitConfig(BaseModel):
    """Rate limiting configuration."""
    enabled: bool = True
    strategy: RateLimitStrategyType = RateLimitStrategyType.FIXED_WINDOW
    storage: StorageType = StorageType.MEMORY
    rate_limit: int = DEFAULT_RATE_LIMIT
    period_seconds: int = DEFAULT_PERIOD_SECONDS
    
    # Strategy-specific configuration
    bucket_capacity: Optional[int] = None  # For token bucket
    
    # Key generation
    key_by_path: bool = True
    key_by_method: bool = False
    key_by_ip: bool = True
    
    # Response headers
    include_headers: bool = True
    header_prefix: str = DEFAULT_HEADER_PREFIX
    
    # Redis configuration (if storage is REDIS)
    redis: RedisConfig = Field(default_factory=RedisConfig)
    
    # Path and IP exemptions
    exempted_paths: List[str] = Field(default_factory=list)
    exempted_ips: List[str] = Field(default_factory=list)
    
    # Tenant configuration
    enable_tenant_limits: bool = False
    tenant_header: str = DEFAULT_TENANT_HEADER
    tenant_limits: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    
    # Error handling
    block_on_failure: bool = False  # If True, block requests when rate limiter fails
    
    # Advanced options
    namespace: str = DEFAULT_NAMESPACE
    max_key_length: int = DEFAULT_MAX_KEY_LENGTH
    
    @field_validator("period_seconds")
    def validate_period(cls, v):
        """Validate period is positive."""
        if v <= 0:
            raise ValueError("period_seconds must be positive")
        return v
        
    @field_validator("rate_limit")
    def validate_rate_limit(cls, v):
        """Validate rate limit is positive."""
        if v <= 0:
            raise ValueError("rate_limit must be positive")
        return v
    
    def create_strategy(self, storage: BaseStorage) -> RateLimitStrategy:
        """
        Create a rate limiting strategy instance based on configuration.
        
        Args:
            storage: Storage backend to use
            
        Returns:
            Instantiated rate limiting strategy
        """
        kwargs = {
            "storage": storage,
            "rate_limit": self.rate_limit,
            "period_seconds": self.period_seconds,
            "namespace": self.namespace
        }
        
        if self.strategy == RateLimitStrategyType.FIXED_WINDOW:
            return FixedWindowStrategy(**kwargs)
        
        elif self.strategy == RateLimitStrategyType.SLIDING_WINDOW:
            return SlidingWindowStrategy(**kwargs)
        
        elif self.strategy == RateLimitStrategyType.TOKEN_BUCKET:
            if self.bucket_capacity:
                kwargs["bucket_capacity"] = self.bucket_capacity
            return TokenBucketStrategy(**kwargs)
        
        # Default to fixed window
        return FixedWindowStrategy(**kwargs)
    
    def create_storage(self) -> BaseStorage:
        """
        Create a storage backend instance based on configuration.
        
        Returns:
            Instantiated storage backend
        """
        if self.storage == StorageType.REDIS:
            return RedisStorage(**self.redis.get_connection_params())
        
        # Default to memory
        return MemoryStorage()
        
    def get_key_config(self) -> Dict[str, bool]:
        """
        Get key generation configuration.
        
        Returns:
            Dictionary of key generation flags
        """
        return {
            "path": self.key_by_path,
            "method": self.key_by_method,
            "ip": self.key_by_ip
        }


class ConfigurationManager:
    """Manager for rate limiter configuration."""
    
    def __init__(self, config: Optional[Union[Dict[str, Any], RateLimitConfig]] = None):
        """
        Initialize the configuration manager.
        
        Args:
            config: Rate limiter configuration (dictionary or RateLimitConfig)
        """
        self.config = config if isinstance(config, RateLimitConfig) else RateLimitConfig(**(config or {}))
        self._storage = None
        self._strategy = None
    
    @property
    def storage(self) -> BaseStorage:
        """
        Get or create storage backend.
        
        Returns:
            Storage backend instance
        """
        if self._storage is None:
            self._storage = self.config.create_storage()
        return self._storage
    
    @property
    def strategy(self) -> RateLimitStrategy:
        """
        Get or create rate limiting strategy.
        
        Returns:
            Rate limiting strategy instance
        """
        if self._strategy is None:
            self._strategy = self.config.create_strategy(self.storage)
        return self._strategy
    
    async def close(self):
        """Close resources used by the configuration manager."""
        if self._storage:
            await self._storage.close()
            self._storage = None
    
    def update_config(self, config: Union[Dict[str, Any], RateLimitConfig]):
        """
        Update configuration.
        
        Args:
            config: New configuration
        """
        self.config = config if isinstance(config, RateLimitConfig) else RateLimitConfig(**config)
        self._storage = None
        self._strategy = None