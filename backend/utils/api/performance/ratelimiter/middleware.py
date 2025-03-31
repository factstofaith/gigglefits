"""
Rate limiting middleware for FastAPI.

This module provides a FastAPI middleware for rate limiting requests.
"""

import time
import asyncio
from typing import Dict, Any, Optional, Union, Callable, List, Type
import logging
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from .config import RateLimitConfig, ConfigurationManager
from .exceptions import RateLimitError, RateLimitExceeded, ConfigurationError
from .tenant import TenantRateLimiter
from .metrics import record_request
from .utils import (
    generate_key,
    hash_key,
    add_headers,
    is_path_exempted,
    is_ip_exempted,
    get_remote_address
)


logger = logging.getLogger("ratelimiter")


class RateLimiter(BaseHTTPMiddleware):
    """FastAPI middleware for rate limiting requests."""
    
    def __init__(
        self,
        app: ASGIApp,
        config: Optional[Union[Dict[str, Any], RateLimitConfig]] = None,
        key_func: Optional[Callable[[Request], str]] = None,
        exemption_func: Optional[Callable[[Request], bool]] = None
    ):
        """
        Initialize the rate limiter middleware.
        
        Args:
            app: ASGI application
            config: Rate limiting configuration
            key_func: Optional function to generate rate limit keys
            exemption_func: Optional function to determine if a request is exempt
        """
        super().__init__(app)
        self.config_manager = ConfigurationManager(config)
        self.tenant_limiter = self._init_tenant_limiter()
        self.key_func = key_func
        self.exemption_func = exemption_func
        self.startup_time = time.time()
    
    def _init_tenant_limiter(self) -> TenantRateLimiter:
        """
        Initialize the tenant rate limiter.
        
        Returns:
            Tenant rate limiter instance
        """
        config = self.config_manager.config
        
        if not config.enable_tenant_limits:
            return None
            
        default_limits = {
            "rate_limit": config.rate_limit,
            "period_seconds": config.period_seconds
        }
        
        # If bucket capacity is set for token bucket, include it
        if config.strategy == "token_bucket" and config.bucket_capacity:
            default_limits["bucket_capacity"] = config.bucket_capacity
            
        return TenantRateLimiter(
            default_limits=default_limits,
            tenant_limits=config.tenant_limits
        )
    
    async def should_exempt(self, request: Request) -> bool:
        """
        Determine if a request should be exempted from rate limiting.
        
        Args:
            request: FastAPI request object
            
        Returns:
            True if request should be exempted, False otherwise
        """
        config = self.config_manager.config
        
        # Use custom exemption function if provided
        if self.exemption_func:
            try:
                if await asyncio.iscoroutinefunction(self.exemption_func):
                    return await self.exemption_func(request)
                return self.exemption_func(request)
            except Exception as e:
                logger.error(f"Error in custom exemption function: {str(e)}")
        
        # Check if path is exempted
        if config.exempted_paths and is_path_exempted(
            request.url.path, config.exempted_paths
        ):
            return True
        
        # Check if IP is exempted
        if config.exempted_ips:
            client_ip = get_remote_address(request)
            if is_ip_exempted(client_ip, config.exempted_ips):
                return True
        
        return False
    
    async def generate_key_for_request(self, request: Request) -> str:
        """
        Generate a rate limit key for a request.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Rate limit key string
        """
        # Use custom key function if provided
        if self.key_func:
            try:
                if asyncio.iscoroutinefunction(self.key_func):
                    key = await self.key_func(request)
                else:
                    key = self.key_func(request)
                
                # Hash if too long
                return hash_key(key, max_length=self.config_manager.config.max_key_length)
            except Exception as e:
                logger.error(f"Error in custom key function: {str(e)}")
        
        # Use default key generation
        key_config = self.config_manager.config.get_key_config()
        key = generate_key(request, **key_config)
        
        return hash_key(key, max_length=self.config_manager.config.max_key_length)
    
    async def handle_rate_limited(self, request: Request, exc: RateLimitExceeded) -> Response:
        """
        Handle a rate limited request.
        
        Args:
            request: FastAPI request object
            exc: Rate limit exceeded exception
            
        Returns:
            Response with rate limit information
        """
        status_code = 429  # Too Many Requests
        
        # Prepare response data
        content = {
            "detail": str(exc),
            "limit": exc.limit,
            "reset": exc.reset
        }
        
        if exc.retry_after:
            content["retry_after"] = exc.retry_after
        
        # Create response
        response = JSONResponse(
            status_code=status_code,
            content=content
        )
        
        # Add rate limit headers
        rate_limit_info = {
            "limit": exc.limit,
            "remaining": exc.remaining or 0,
            "reset": exc.reset or 0,
            "retry_after": exc.retry_after
        }
        
        return add_headers(
            response, 
            rate_limit_info,
            include_headers=self.config_manager.config.include_headers,
            prefix=self.config_manager.config.header_prefix
        )
    
    async def apply_rate_limit(self, request: Request) -> Dict[str, Any]:
        """
        Apply rate limiting to a request.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Dictionary with rate limit information
            
        Raises:
            RateLimitExceeded: If rate limit is exceeded
            ConfigurationError: If there's an issue with configuration
        """
        # Get tenant-specific limits if enabled
        if self.tenant_limiter and self.config_manager.config.enable_tenant_limits:
            tenant_id = await self.tenant_limiter.extract_tenant_id(request)
            tenant_limits = self.tenant_limiter.get_tenant_limits(tenant_id)
            
            # Apply tenant-specific rate limiting
            strategy_type = self.config_manager.config.strategy
            strategy_cls = self.config_manager.strategy.__class__
            
            # Create tenant-specific strategy
            tenant_strategy = strategy_cls(
                storage=self.config_manager.storage,
                rate_limit=tenant_limits.get("rate_limit", self.config_manager.config.rate_limit),
                period_seconds=tenant_limits.get("period_seconds", self.config_manager.config.period_seconds),
                namespace=f"{self.config_manager.config.namespace}:{tenant_id}"
            )
            
            # For token bucket, set bucket capacity if specified
            if strategy_type == "token_bucket" and "bucket_capacity" in tenant_limits:
                tenant_strategy.bucket_capacity = tenant_limits["bucket_capacity"]
            
            # Use tenant-specific strategy
            strategy = tenant_strategy
        else:
            # Use default strategy
            strategy = self.config_manager.strategy
        
        # Generate key for request
        key = await self.generate_key_for_request(request)
        
        # Increment counter and check rate limit
        rate_limit_info = await strategy.increment(key)
        
        # Record metrics
        record_request(
            allowed=rate_limit_info.get("allowed", True),
            identifier=key,
            strategy=self.config_manager.config.strategy,
            route=request.url.path
        )
        
        # If not allowed, raise exception
        if not rate_limit_info.get("allowed", True):
            raise RateLimitExceeded(
                message="Rate limit exceeded",
                limit=rate_limit_info.get("limit"),
                remaining=rate_limit_info.get("remaining"),
                reset=rate_limit_info.get("reset"),
                retry_after=rate_limit_info.get("retry_after")
            )
            
        return rate_limit_info
    
    async def dispatch(self, request: Request, call_next):
        """
        Dispatch middleware logic.
        
        Args:
            request: FastAPI request object
            call_next: Function to call next middleware
            
        Returns:
            Response object
        """
        # Skip rate limiting if not enabled
        if not self.config_manager.config.enabled:
            return await call_next(request)
        
        # Check if request should be exempted
        if await self.should_exempt(request):
            return await call_next(request)
        
        rate_limit_info = None
        
        try:
            # Apply rate limiting
            rate_limit_info = await self.apply_rate_limit(request)
            
            # Continue to next middleware/handler
            response = await call_next(request)
            
            # Add rate limit headers to response
            if rate_limit_info:
                response = add_headers(
                    response,
                    rate_limit_info,
                    include_headers=self.config_manager.config.include_headers,
                    prefix=self.config_manager.config.header_prefix
                )
                
            return response
                
        except RateLimitExceeded as exc:
            # Handle rate limited requests
            return await self.handle_rate_limited(request, exc)
            
        except RateLimitError as exc:
            # Handle other rate limit errors
            logger.error(f"Rate limit error: {str(exc)}")
            
            if self.config_manager.config.block_on_failure:
                # Block request on failure if configured to do so
                return JSONResponse(
                    status_code=500,
                    content={"detail": "Rate limiting error"}
                )
            
            # Continue to next middleware/handler on error
            return await call_next(request)
            
        except Exception as exc:
            # Log unexpected errors
            logger.exception(f"Unexpected error in rate limiter: {str(exc)}")
            
            if self.config_manager.config.block_on_failure:
                # Block request on failure if configured to do so
                return JSONResponse(
                    status_code=500,
                    content={"detail": "Rate limiting error"}
                )
            
            # Continue to next middleware/handler on error
            return await call_next(request)
    
    async def close(self):
        """Close resources used by the rate limiter."""
        if self.config_manager:
            await self.config_manager.close()