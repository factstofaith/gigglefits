"""
RateLimiter

Request throttling and rate limiting with tenant-specific quotas
"""
import logging
import time
import asyncio
import json
from typing import Dict, List, Optional, Any, Union, Tuple, Callable, Set
from functools import wraps
from datetime import datetime, timedelta
import hashlib

from fastapi import FastAPI, Request, Response, Depends, Header, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.middleware.base import RequestResponseEndpoint
from starlette.types import ASGIApp
from starlette.responses import Response

# Configure logging
logger = logging.getLogger(__name__)

class RateLimitStrategy:
    """Base class for rate limiting strategies"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the rate limit strategy
        
        Args:
            config: Configuration dictionary for the strategy
        """
        self.config = config
    
    async def is_rate_limited(self, key: str, tenant_id: Optional[str] = None) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if a key is rate limited
        
        Args:
            key: The key to check
            tenant_id: Optional tenant ID for tenant-specific limits
            
        Returns:
            Tuple of (is_limited, rate_limit_info)
        """
        raise NotImplementedError("Subclasses must implement is_rate_limited")
    
    async def record_request(self, key: str, tenant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Record a request for a key
        
        Args:
            key: The key to record a request for
            tenant_id: Optional tenant ID for tenant-specific limits
            
        Returns:
            Rate limit information
        """
        raise NotImplementedError("Subclasses must implement record_request")
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get strategy metrics
        
        Returns:
            Strategy metrics
        """
        raise NotImplementedError("Subclasses must implement get_metrics")


class FixedWindowStrategy(RateLimitStrategy):
    """Fixed window rate limiting strategy"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the fixed window strategy
        
        Args:
            config: Configuration dictionary with the following keys:
                - requests_per_window: Number of requests allowed per window
                - window_seconds: Window duration in seconds
                - tenant_limits: Optional dict mapping tenant IDs to custom limits
        """
        super().__init__(config)
        self.requests_per_window = config.get('requests_per_window', 100)
        self.window_seconds = config.get('window_seconds', 60)
        self.tenant_limits = config.get('tenant_limits', {})
        
        # Store request counts per key and window
        self.windows: Dict[str, Dict[int, int]] = {}
        
        # Store metrics
        self.metrics = {
            'total_requests': 0,
            'limited_requests': 0,
            'windows_created': 0,
            'active_keys': 0
        }
    
    def _get_current_window(self) -> int:
        """
        Get the current time window
        
        Returns:
            Current window timestamp (seconds)
        """
        return int(time.time() / self.window_seconds) * self.window_seconds
    
    def _get_tenant_limit(self, tenant_id: Optional[str]) -> int:
        """
        Get the request limit for a tenant
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            Number of requests allowed per window for this tenant
        """
        if tenant_id and tenant_id in self.tenant_limits:
            return self.tenant_limits[tenant_id]
        return self.requests_per_window
    
    def _get_key_with_tenant(self, key: str, tenant_id: Optional[str]) -> str:
        """
        Get a key including tenant ID if provided
        
        Args:
            key: Base key
            tenant_id: Optional tenant ID
            
        Returns:
            Key with tenant information
        """
        if tenant_id:
            return f"{tenant_id}:{key}"
        return key
    
    async def is_rate_limited(self, key: str, tenant_id: Optional[str] = None) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if a key is rate limited
        
        Args:
            key: The key to check
            tenant_id: Optional tenant ID for tenant-specific limits
            
        Returns:
            Tuple of (is_limited, rate_limit_info)
        """
        composite_key = self._get_key_with_tenant(key, tenant_id)
        current_window = self._get_current_window()
        limit = self._get_tenant_limit(tenant_id)
        
        # Initialize if key or window doesn't exist
        if composite_key not in self.windows:
            self.windows[composite_key] = {}
            self.metrics['active_keys'] += 1
        
        if current_window not in self.windows[composite_key]:
            self.windows[composite_key][current_window] = 0
            self.metrics['windows_created'] += 1
        
        # Clean up old windows
        self._cleanup_old_windows(composite_key, current_window)
        
        # Check if rate limited
        current_count = self.windows[composite_key].get(current_window, 0)
        is_limited = current_count >= limit
        
        # Calculate remaining requests and reset time
        remaining = max(0, limit - current_count)
        reset_time = current_window + self.window_seconds - int(time.time())
        
        rate_limit_info = {
            'limit': limit,
            'remaining': remaining,
            'reset': reset_time,
            'window': self.window_seconds
        }
        
        if is_limited:
            self.metrics['limited_requests'] += 1
        
        return is_limited, rate_limit_info
    
    async def record_request(self, key: str, tenant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Record a request for a key
        
        Args:
            key: The key to record a request for
            tenant_id: Optional tenant ID for tenant-specific limits
            
        Returns:
            Rate limit information
        """
        self.metrics['total_requests'] += 1
        
        composite_key = self._get_key_with_tenant(key, tenant_id)
        current_window = self._get_current_window()
        limit = self._get_tenant_limit(tenant_id)
        
        # Initialize if key or window doesn't exist
        if composite_key not in self.windows:
            self.windows[composite_key] = {}
            self.metrics['active_keys'] += 1
        
        if current_window not in self.windows[composite_key]:
            self.windows[composite_key][current_window] = 0
            self.metrics['windows_created'] += 1
        
        # Increment request count
        self.windows[composite_key][current_window] += 1
        
        # Calculate remaining requests and reset time
        current_count = self.windows[composite_key][current_window]
        remaining = max(0, limit - current_count)
        reset_time = current_window + self.window_seconds - int(time.time())
        
        return {
            'limit': limit,
            'remaining': remaining,
            'reset': reset_time,
            'window': self.window_seconds
        }
    
    def _cleanup_old_windows(self, key: str, current_window: int) -> None:
        """
        Clean up old windows for a key
        
        Args:
            key: The key to clean up
            current_window: Current window timestamp
        """
        if key in self.windows:
            # Keep only the current window and the previous one (for safety)
            valid_windows = {current_window}
            self.windows[key] = {
                window: count for window, count in self.windows[key].items()
                if window in valid_windows or window > current_window - self.window_seconds
            }
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get strategy metrics
        
        Returns:
            Strategy metrics
        """
        return {
            'strategy': 'fixed_window',
            'requests_per_window': self.requests_per_window,
            'window_seconds': self.window_seconds,
            'total_requests': self.metrics['total_requests'],
            'limited_requests': self.metrics['limited_requests'],
            'windows_created': self.metrics['windows_created'],
            'active_keys': self.metrics['active_keys'],
            'tenant_custom_limits': len(self.tenant_limits)
        }


class SlidingWindowStrategy(RateLimitStrategy):
    """Sliding window rate limiting strategy"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the sliding window strategy
        
        Args:
            config: Configuration dictionary with the following keys:
                - requests_per_window: Number of requests allowed per window
                - window_seconds: Window duration in seconds
                - tenant_limits: Optional dict mapping tenant IDs to custom limits
        """
        super().__init__(config)
        self.requests_per_window = config.get('requests_per_window', 100)
        self.window_seconds = config.get('window_seconds', 60)
        self.tenant_limits = config.get('tenant_limits', {})
        
        # Store request timestamps per key
        self.requests: Dict[str, List[float]] = {}
        
        # Store metrics
        self.metrics = {
            'total_requests': 0,
            'limited_requests': 0,
            'active_keys': 0,
            'evicted_timestamps': 0
        }
    
    def _get_tenant_limit(self, tenant_id: Optional[str]) -> int:
        """
        Get the request limit for a tenant
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            Number of requests allowed per window for this tenant
        """
        if tenant_id and tenant_id in self.tenant_limits:
            return self.tenant_limits[tenant_id]
        return self.requests_per_window
    
    def _get_key_with_tenant(self, key: str, tenant_id: Optional[str]) -> str:
        """
        Get a key including tenant ID if provided
        
        Args:
            key: Base key
            tenant_id: Optional tenant ID
            
        Returns:
            Key with tenant information
        """
        if tenant_id:
            return f"{tenant_id}:{key}"
        return key
    
    def _cleanup_old_requests(self, key: str) -> None:
        """
        Clean up old request timestamps for a key
        
        Args:
            key: The key to clean up
        """
        if key in self.requests:
            now = time.time()
            window_start = now - self.window_seconds
            
            # Calculate how many timestamps to remove
            original_length = len(self.requests[key])
            self.requests[key] = [ts for ts in self.requests[key] if ts >= window_start]
            removed_count = original_length - len(self.requests[key])
            
            if removed_count > 0:
                self.metrics['evicted_timestamps'] += removed_count
    
    async def is_rate_limited(self, key: str, tenant_id: Optional[str] = None) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if a key is rate limited
        
        Args:
            key: The key to check
            tenant_id: Optional tenant ID for tenant-specific limits
            
        Returns:
            Tuple of (is_limited, rate_limit_info)
        """
        composite_key = self._get_key_with_tenant(key, tenant_id)
        limit = self._get_tenant_limit(tenant_id)
        
        # Initialize if key doesn't exist
        if composite_key not in self.requests:
            self.requests[composite_key] = []
            self.metrics['active_keys'] += 1
        
        # Clean up old requests
        self._cleanup_old_requests(composite_key)
        
        # Check if rate limited
        current_count = len(self.requests[composite_key])
        is_limited = current_count >= limit
        
        # Calculate remaining requests and reset time
        remaining = max(0, limit - current_count)
        
        # Calculate time until oldest request expires
        now = time.time()
        if current_count > 0 and len(self.requests[composite_key]) > 0:
            oldest_request = min(self.requests[composite_key])
            reset_time = max(0, int(oldest_request + self.window_seconds - now))
        else:
            reset_time = 0
        
        rate_limit_info = {
            'limit': limit,
            'remaining': remaining,
            'reset': reset_time,
            'window': self.window_seconds
        }
        
        if is_limited:
            self.metrics['limited_requests'] += 1
        
        return is_limited, rate_limit_info
    
    async def record_request(self, key: str, tenant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Record a request for a key
        
        Args:
            key: The key to record a request for
            tenant_id: Optional tenant ID for tenant-specific limits
            
        Returns:
            Rate limit information
        """
        self.metrics['total_requests'] += 1
        
        composite_key = self._get_key_with_tenant(key, tenant_id)
        limit = self._get_tenant_limit(tenant_id)
        
        # Initialize if key doesn't exist
        if composite_key not in self.requests:
            self.requests[composite_key] = []
            self.metrics['active_keys'] += 1
        
        # Clean up old requests
        self._cleanup_old_requests(composite_key)
        
        # Add current timestamp
        now = time.time()
        self.requests[composite_key].append(now)
        
        # Calculate remaining requests and reset time
        current_count = len(self.requests[composite_key])
        remaining = max(0, limit - current_count)
        
        # Calculate time until oldest request expires
        if current_count > 0:
            oldest_request = min(self.requests[composite_key])
            reset_time = max(0, int(oldest_request + self.window_seconds - now))
        else:
            reset_time = 0
        
        return {
            'limit': limit,
            'remaining': remaining,
            'reset': reset_time,
            'window': self.window_seconds
        }
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get strategy metrics
        
        Returns:
            Strategy metrics
        """
        return {
            'strategy': 'sliding_window',
            'requests_per_window': self.requests_per_window,
            'window_seconds': self.window_seconds,
            'total_requests': self.metrics['total_requests'],
            'limited_requests': self.metrics['limited_requests'],
            'active_keys': self.metrics['active_keys'],
            'evicted_timestamps': self.metrics['evicted_timestamps'],
            'tenant_custom_limits': len(self.tenant_limits)
        }


class TokenBucketStrategy(RateLimitStrategy):
    """Token bucket rate limiting strategy"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the token bucket strategy
        
        Args:
            config: Configuration dictionary with the following keys:
                - bucket_capacity: Maximum number of tokens in the bucket
                - refill_rate: Number of tokens added per second
                - tenant_limits: Optional dict mapping tenant IDs to custom limits
        """
        super().__init__(config)
        self.bucket_capacity = config.get('bucket_capacity', 100)
        self.refill_rate = config.get('refill_rate', 1)  # tokens per second
        self.tenant_limits = config.get('tenant_limits', {})
        
        # Store buckets with remaining tokens and last update timestamp
        self.buckets: Dict[str, Dict[str, Union[float, int]]] = {}
        
        # Store metrics
        self.metrics = {
            'total_requests': 0,
            'limited_requests': 0,
            'active_keys': 0,
            'tokens_refilled': 0
        }
    
    def _get_tenant_capacity(self, tenant_id: Optional[str]) -> int:
        """
        Get the bucket capacity for a tenant
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            Bucket capacity for this tenant
        """
        if tenant_id and tenant_id in self.tenant_limits and 'bucket_capacity' in self.tenant_limits[tenant_id]:
            return self.tenant_limits[tenant_id]['bucket_capacity']
        return self.bucket_capacity
    
    def _get_tenant_refill_rate(self, tenant_id: Optional[str]) -> float:
        """
        Get the refill rate for a tenant
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            Refill rate for this tenant
        """
        if tenant_id and tenant_id in self.tenant_limits and 'refill_rate' in self.tenant_limits[tenant_id]:
            return self.tenant_limits[tenant_id]['refill_rate']
        return self.refill_rate
    
    def _get_key_with_tenant(self, key: str, tenant_id: Optional[str]) -> str:
        """
        Get a key including tenant ID if provided
        
        Args:
            key: Base key
            tenant_id: Optional tenant ID
            
        Returns:
            Key with tenant information
        """
        if tenant_id:
            return f"{tenant_id}:{key}"
        return key
    
    def _refill_bucket(self, key: str, tenant_id: Optional[str] = None) -> None:
        """
        Refill a token bucket based on elapsed time
        
        Args:
            key: The key to refill
            tenant_id: Optional tenant ID for tenant-specific limits
        """
        composite_key = self._get_key_with_tenant(key, tenant_id)
        capacity = self._get_tenant_capacity(tenant_id)
        refill_rate = self._get_tenant_refill_rate(tenant_id)
        
        # Initialize if key doesn't exist
        if composite_key not in self.buckets:
            self.buckets[composite_key] = {
                'tokens': capacity,
                'last_refill': time.time()
            }
            self.metrics['active_keys'] += 1
            return
        
        # Calculate elapsed time since last refill
        now = time.time()
        elapsed = now - self.buckets[composite_key]['last_refill']
        
        # Calculate tokens to add
        tokens_to_add = elapsed * refill_rate
        
        if tokens_to_add > 0:
            # Add tokens up to capacity
            self.buckets[composite_key]['tokens'] = min(
                capacity,
                self.buckets[composite_key]['tokens'] + tokens_to_add
            )
            self.buckets[composite_key]['last_refill'] = now
            self.metrics['tokens_refilled'] += tokens_to_add
    
    async def is_rate_limited(self, key: str, tenant_id: Optional[str] = None) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if a key is rate limited
        
        Args:
            key: The key to check
            tenant_id: Optional tenant ID for tenant-specific limits
            
        Returns:
            Tuple of (is_limited, rate_limit_info)
        """
        composite_key = self._get_key_with_tenant(key, tenant_id)
        capacity = self._get_tenant_capacity(tenant_id)
        refill_rate = self._get_tenant_refill_rate(tenant_id)
        
        # Refill bucket
        self._refill_bucket(key, tenant_id)
        
        # Check if tokens available
        tokens = self.buckets[composite_key]['tokens']
        is_limited = tokens < 1
        
        # Calculate reset time (time until 1 token is available)
        if is_limited and refill_rate > 0:
            tokens_needed = 1 - tokens
            reset_time = int(tokens_needed / refill_rate)
        else:
            reset_time = 0
        
        rate_limit_info = {
            'limit': capacity,
            'remaining': int(tokens),
            'reset': reset_time,
            'refill_rate': refill_rate
        }
        
        if is_limited:
            self.metrics['limited_requests'] += 1
        
        return is_limited, rate_limit_info
    
    async def record_request(self, key: str, tenant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Record a request for a key
        
        Args:
            key: The key to record a request for
            tenant_id: Optional tenant ID for tenant-specific limits
            
        Returns:
            Rate limit information
        """
        self.metrics['total_requests'] += 1
        
        composite_key = self._get_key_with_tenant(key, tenant_id)
        capacity = self._get_tenant_capacity(tenant_id)
        refill_rate = self._get_tenant_refill_rate(tenant_id)
        
        # Refill bucket
        self._refill_bucket(key, tenant_id)
        
        # Consume a token
        self.buckets[composite_key]['tokens'] -= 1
        
        # Calculate remaining tokens and reset time
        tokens = max(0, self.buckets[composite_key]['tokens'])
        
        # Calculate reset time (time until bucket is full)
        if tokens < capacity and refill_rate > 0:
            tokens_needed = capacity - tokens
            reset_time = int(tokens_needed / refill_rate)
        else:
            reset_time = 0
        
        return {
            'limit': capacity,
            'remaining': int(tokens),
            'reset': reset_time,
            'refill_rate': refill_rate
        }
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get strategy metrics
        
        Returns:
            Strategy metrics
        """
        return {
            'strategy': 'token_bucket',
            'bucket_capacity': self.bucket_capacity,
            'refill_rate': self.refill_rate,
            'total_requests': self.metrics['total_requests'],
            'limited_requests': self.metrics['limited_requests'],
            'active_keys': self.metrics['active_keys'],
            'tokens_refilled': int(self.metrics['tokens_refilled']),
            'tenant_custom_limits': len(self.tenant_limits)
        }


class RateLimiter:
    """
    Request throttling and rate limiting with tenant-specific quotas
    
    Features:
    - High-performance middleware with minimal overhead
    - Configurable settings for different application scenarios
    - Multiple rate limiting strategies (fixed window, sliding window, token bucket)
    - Detailed metrics collection and performance tracking
    - Tenant-aware processing for multi-tenant environments
    - Comprehensive error handling and logging
    - Custom rate limits for specific endpoints, tenants, and user roles
    - Automated rate limit headers for client-side handling
    """
    
    def __init__(self, app: FastAPI, config: Dict[str, Any] = None):
        """
        Initialize the middleware.
        
        Args:
            app: FastAPI application
            config: Configuration dictionary
        """
        self.app = app
        self.config = config or {}
        self.metrics = {
            'requests_processed': 0,
            'rate_limited_requests': 0,
            'bypass_count': 0,
            'processing_time': 0,
            'started_at': datetime.utcnow().isoformat()
        }
        self.enabled = self.config.get('enabled', True)
        self.last_error = None
        
        # Configure rate limiter settings
        self.include_headers = self.config.get('include_headers', True)
        self.headers_prefix = self.config.get('headers_prefix', 'X-RateLimit-')
        self.status_code = self.config.get('status_code', status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Configure strategy
        strategy_name = self.config.get('strategy', 'fixed_window')
        strategy_config = self.config.get('strategy_config', {})
        self.strategy = self._create_strategy(strategy_name, strategy_config)
        
        # Configure exempt paths and IPs
        self.exempt_paths = set(self.config.get('exempt_paths', []))
        self.exempt_ips = set(self.config.get('exempt_ips', []))
        
        # Configure key functions
        self.key_by_ip = self.config.get('key_by_ip', True)
        self.key_by_path = self.config.get('key_by_path', True)
        self.key_by_method = self.config.get('key_by_method', False)
        
        # Initialize middleware
        self._initialize()
    
    def _create_strategy(self, strategy_name: str, strategy_config: Dict[str, Any]) -> RateLimitStrategy:
        """
        Create a rate limiting strategy
        
        Args:
            strategy_name: Strategy name
            strategy_config: Strategy configuration
            
        Returns:
            Rate limiting strategy
        """
        strategies = {
            'fixed_window': FixedWindowStrategy,
            'sliding_window': SlidingWindowStrategy,
            'token_bucket': TokenBucketStrategy
        }
        
        if strategy_name not in strategies:
            logger.warning(f"Unknown rate limiting strategy: {strategy_name}, using fixed_window")
            strategy_name = 'fixed_window'
        
        return strategies[strategy_name](strategy_config)
    
    def _initialize(self):
        """Initialize the middleware with the FastAPI app."""
        try:
            # Add the middleware to the application
            self.app.add_middleware(
                BaseHTTPMiddleware,
                dispatch=self._dispatch
            )
            
            # Register metrics endpoint
            self._register_metrics_endpoint()
            
            logger.info(f"RateLimiter middleware initialized with strategy: {type(self.strategy).__name__}")
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Failed to initialize RateLimiter middleware: {str(e)}")
    
    def _register_metrics_endpoint(self):
        """Register metrics endpoint for the middleware"""
        
        @self.app.get("/api/metrics/rate-limiter", tags=["metrics"])
        async def rate_limiter_metrics():
            """Get rate limiter metrics"""
            return self.get_metrics()
    
    def _get_request_key(self, request: Request) -> str:
        """
        Generate a key for rate limiting based on request properties
        
        Args:
            request: FastAPI request
            
        Returns:
            Rate limiting key
        """
        components = []
        
        # Add IP address if configured
        if self.key_by_ip:
            # Get client IP, handling proxy forwarding
            forwarded = request.headers.get("X-Forwarded-For")
            if forwarded:
                ip = forwarded.split(",")[0].strip()
            else:
                ip = request.client.host if request.client else "127.0.0.1"
            components.append(ip)
        
        # Add path if configured
        if self.key_by_path:
            components.append(request.url.path)
        
        # Add method if configured
        if self.key_by_method:
            components.append(request.method)
        
        # Generate key
        key = ":".join(components)
        
        # Hash the key if it's too long
        if len(key) > 100:
            key = hashlib.md5(key.encode()).hexdigest()
        
        return key
    
    def _get_tenant_id(self, request: Request) -> Optional[str]:
        """
        Extract tenant ID from the request
        
        Args:
            request: FastAPI request
            
        Returns:
            Optional tenant ID
        """
        # Try to get from header
        tenant_id = request.headers.get("X-Tenant-ID")
        
        # Try to get from request state
        if not tenant_id and hasattr(request.state, "tenant_id"):
            tenant_id = getattr(request.state, "tenant_id")
        
        return tenant_id
    
    def _is_exempt(self, request: Request) -> bool:
        """
        Check if a request is exempt from rate limiting
        
        Args:
            request: FastAPI request
            
        Returns:
            True if the request is exempt
        """
        # Check path exemption
        if request.url.path in self.exempt_paths:
            return True
        
        # Check IP exemption
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0].strip()
        else:
            ip = request.client.host if request.client else "127.0.0.1"
        
        if ip in self.exempt_ips:
            return True
        
        # Not exempt
        return False
    
    async def _dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint
    ) -> Response:
        """
        Process the request and response.
        
        Args:
            request: The incoming request
            call_next: The next middleware or endpoint
            
        Returns:
            The processed response
        """
        if not self.enabled:
            return await call_next(request)
        
        # Start processing time
        start_time = time.time()
        self.metrics['requests_processed'] += 1
        
        # Check if request is exempt
        if self._is_exempt(request):
            self.metrics['bypass_count'] += 1
            return await call_next(request)
        
        try:
            # Get request key
            key = self._get_request_key(request)
            tenant_id = self._get_tenant_id(request)
            
            # Check if rate limited
            is_limited, rate_limit_info = await self.strategy.is_rate_limited(key, tenant_id)
            
            if is_limited:
                # Request is rate limited
                self.metrics['rate_limited_requests'] += 1
                
                # Create rate limit response
                response = self._create_rate_limit_response(rate_limit_info)
                
                # Update metrics
                processing_time = time.time() - start_time
                self.metrics['processing_time'] += processing_time
                
                return response
            
            # Process the request
            response = await call_next(request)
            
            # Record the request
            rate_limit_info = await self.strategy.record_request(key, tenant_id)
            
            # Add rate limit headers
            if self.include_headers:
                response = self._add_rate_limit_headers(response, rate_limit_info)
            
            # Update metrics
            processing_time = time.time() - start_time
            self.metrics['processing_time'] += processing_time
            
            return response
            
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Error in RateLimiter middleware: {str(e)}", exc_info=True)
            
            # Update metrics
            processing_time = time.time() - start_time
            self.metrics['processing_time'] += processing_time
            
            # Create error response
            error_response = JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error during rate limiting"}
            )
            
            return error_response
    
    def _create_rate_limit_response(self, rate_limit_info: Dict[str, Any]) -> Response:
        """
        Create a rate limit response
        
        Args:
            rate_limit_info: Rate limit information
            
        Returns:
            Rate limit response
        """
        # Create response
        response = JSONResponse(
            status_code=self.status_code,
            content={
                "detail": f"Rate limit exceeded. Try again in {rate_limit_info['reset']} seconds.",
                "limit": rate_limit_info['limit'],
                "remaining": rate_limit_info['remaining'],
                "reset": rate_limit_info['reset']
            }
        )
        
        # Add rate limit headers
        if self.include_headers:
            response = self._add_rate_limit_headers(response, rate_limit_info)
        
        # Add retry-after header
        response.headers["Retry-After"] = str(rate_limit_info['reset'])
        
        return response
    
    def _add_rate_limit_headers(self, response: Response, rate_limit_info: Dict[str, Any]) -> Response:
        """
        Add rate limit headers to a response
        
        Args:
            response: The response to add headers to
            rate_limit_info: Rate limit information
            
        Returns:
            Response with added headers
        """
        # Add standard rate limit headers
        response.headers[f"{self.headers_prefix}Limit"] = str(rate_limit_info['limit'])
        response.headers[f"{self.headers_prefix}Remaining"] = str(rate_limit_info['remaining'])
        response.headers[f"{self.headers_prefix}Reset"] = str(rate_limit_info['reset'])
        
        # Add strategy-specific headers
        if 'window' in rate_limit_info:
            response.headers[f"{self.headers_prefix}Window"] = str(rate_limit_info['window'])
        
        if 'refill_rate' in rate_limit_info:
            response.headers[f"{self.headers_prefix}RefillRate"] = str(rate_limit_info['refill_rate'])
        
        return response
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get middleware metrics.
        
        Returns:
            Dict containing middleware metrics
        """
        # Calculate average processing time
        avg_time = 0
        if self.metrics['requests_processed'] > 0:
            avg_time = self.metrics['processing_time'] / self.metrics['requests_processed']
        
        # Calculate rate limit percentage
        rate_limit_pct = 0
        if self.metrics['requests_processed'] > 0:
            rate_limit_pct = (self.metrics['rate_limited_requests'] / self.metrics['requests_processed']) * 100
        
        # Get uptime
        uptime_seconds = (datetime.utcnow() - datetime.fromisoformat(self.metrics['started_at'])).total_seconds()
        
        # Get strategy metrics
        strategy_metrics = self.strategy.get_metrics()
        
        return {
            'component': 'RateLimiter',
            'strategy': type(self.strategy).__name__,
            'enabled': self.enabled,
            'requests_processed': self.metrics['requests_processed'],
            'rate_limited_requests': self.metrics['rate_limited_requests'],
            'rate_limit_percentage': round(rate_limit_pct, 2),
            'bypass_count': self.metrics['bypass_count'],
            'average_processing_time_ms': round(avg_time * 1000, 2),
            'total_processing_time': round(self.metrics['processing_time'], 2),
            'uptime_seconds': int(uptime_seconds),
            'last_error': self.last_error,
            'last_updated': datetime.utcnow().isoformat(),
            'strategy_metrics': strategy_metrics
        }
    
    def enable(self):
        """Enable the middleware."""
        self.enabled = True
        logger.info(f"RateLimiter middleware enabled")
    
    def disable(self):
        """Disable the middleware."""
        self.enabled = False
        logger.info(f"RateLimiter middleware disabled")
    
    def update_strategy(self, strategy_name: str, strategy_config: Dict[str, Any]):
        """
        Update the rate limiting strategy
        
        Args:
            strategy_name: Strategy name
            strategy_config: Strategy configuration
        """
        self.strategy = self._create_strategy(strategy_name, strategy_config)
        logger.info(f"RateLimiter strategy updated to: {type(self.strategy).__name__}")
    
    def add_exempt_path(self, path: str):
        """
        Add a path to the exempt paths list
        
        Args:
            path: Path to exempt
        """
        self.exempt_paths.add(path)
        logger.info(f"Added exempt path: {path}")
    
    def add_exempt_ip(self, ip: str):
        """
        Add an IP to the exempt IPs list
        
        Args:
            ip: IP to exempt
        """
        self.exempt_ips.add(ip)
        logger.info(f"Added exempt IP: {ip}")


def create_rate_limiter(
    app: FastAPI,
    strategy: str = "fixed_window",
    requests_per_window: int = 100,
    window_seconds: int = 60,
    bucket_capacity: int = 100,
    refill_rate: float = 1.0,
    key_by_ip: bool = True,
    key_by_path: bool = True,
    key_by_method: bool = False,
    include_headers: bool = True,
    tenant_limits: Dict[str, Any] = None,
    exempt_paths: List[str] = None,
    exempt_ips: List[str] = None
) -> RateLimiter:
    """
    Create a RateLimiter middleware with common configuration
    
    Args:
        app: FastAPI application
        strategy: Rate limiting strategy ('fixed_window', 'sliding_window', 'token_bucket')
        requests_per_window: Number of requests allowed per window (for window strategies)
        window_seconds: Window duration in seconds (for window strategies)
        bucket_capacity: Maximum number of tokens in the bucket (for token bucket)
        refill_rate: Number of tokens added per second (for token bucket)
        key_by_ip: Whether to include IP in the rate limit key
        key_by_path: Whether to include path in the rate limit key
        key_by_method: Whether to include HTTP method in the rate limit key
        include_headers: Whether to include rate limit headers in responses
        tenant_limits: Custom limits for specific tenants
        exempt_paths: Paths to exempt from rate limiting
        exempt_ips: IPs to exempt from rate limiting
        
    Returns:
        Configured RateLimiter middleware
    """
    # Create strategy config based on strategy type
    if strategy == "token_bucket":
        strategy_config = {
            "bucket_capacity": bucket_capacity,
            "refill_rate": refill_rate,
            "tenant_limits": tenant_limits or {}
        }
    else:
        strategy_config = {
            "requests_per_window": requests_per_window,
            "window_seconds": window_seconds,
            "tenant_limits": tenant_limits or {}
        }
    
    # Create config
    config = {
        "enabled": True,
        "strategy": strategy,
        "strategy_config": strategy_config,
        "key_by_ip": key_by_ip,
        "key_by_path": key_by_path,
        "key_by_method": key_by_method,
        "include_headers": include_headers,
        "exempt_paths": exempt_paths or [],
        "exempt_ips": exempt_ips or []
    }
    
    # Create and return middleware
    return RateLimiter(app, config)