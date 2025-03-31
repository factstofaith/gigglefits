"""
Tenant-aware rate limiting functionality.

This module provides utilities for managing rate limits in a multi-tenant environment.
"""

from typing import Dict, Any, Optional, Callable, Union
from fastapi import Request


class TenantRateLimiter:
    """Multi-tenant rate limit manager."""
    
    def __init__(
        self,
        default_limits: Dict[str, Any],
        tenant_extractor: Optional[Callable[[Request], str]] = None
    ):
        """
        Initialize the tenant rate limiter.
        
        Args:
            default_limits: Default rate limits to apply if no tenant-specific limits
            tenant_extractor: Function to extract tenant ID from request (optional)
        """
        self.default_limits = default_limits
        self.tenant_limits: Dict[str, Dict[str, Any]] = {}
        self.tenant_extractor = tenant_extractor or self._default_tenant_extractor
    
    def _default_tenant_extractor(self, request: Request) -> str:
        """
        Default function to extract tenant ID from request.
        
        Attempts to extract tenant ID from:
        1. X-Tenant-ID header
        2. tenant_id query parameter
        3. tenant_id in path parameters
        
        Args:
            request: FastAPI request object
            
        Returns:
            Tenant ID or "default" if not found
        """
        # Try to get from header
        tenant_id = request.headers.get("X-Tenant-ID")
        if tenant_id:
            return tenant_id
            
        # Try to get from query params
        tenant_id = request.query_params.get("tenant_id")
        if tenant_id:
            return tenant_id
            
        # Try to get from path params
        try:
            if hasattr(request, "path_params") and "tenant_id" in request.path_params:
                return request.path_params["tenant_id"]
        except:
            pass
            
        # Default tenant ID
        return "default"
    
    def set_tenant_limits(self, tenant_id: str, limits: Dict[str, Any]):
        """
        Set rate limits for a specific tenant.
        
        Args:
            tenant_id: Tenant identifier
            limits: Rate limits configuration for the tenant
        """
        self.tenant_limits[tenant_id] = limits
    
    def get_tenant_limits(self, tenant_id: str) -> Dict[str, Any]:
        """
        Get rate limits for a specific tenant.
        
        Args:
            tenant_id: Tenant identifier
            
        Returns:
            Rate limits configuration for the tenant or default if not set
        """
        return self.tenant_limits.get(tenant_id, self.default_limits)
    
    async def extract_tenant_id(self, request: Request) -> str:
        """
        Extract tenant ID from request.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Tenant ID string
        """
        if callable(self.tenant_extractor):
            return self.tenant_extractor(request)
        return "default"
    
    async def get_limits_for_request(self, request: Request) -> Dict[str, Any]:
        """
        Get rate limits for a specific request.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Rate limits configuration to apply
        """
        tenant_id = await self.extract_tenant_id(request)
        return self.get_tenant_limits(tenant_id)


class TenantRateLimitConfig:
    """Configuration for tenant-specific rate limits."""
    
    def __init__(
        self,
        enabled: bool = True,
        tenant_header: str = "X-Tenant-ID",
        default_rate_limit: int = 100,
        default_period_seconds: int = 60,
        tenant_limits: Optional[Dict[str, Dict[str, Any]]] = None
    ):
        """
        Initialize tenant rate limit configuration.
        
        Args:
            enabled: Whether tenant-specific rate limiting is enabled
            tenant_header: HTTP header to extract tenant ID from
            default_rate_limit: Default rate limit (requests per period)
            default_period_seconds: Default period in seconds
            tenant_limits: Optional dict of tenant-specific limits
        """
        self.enabled = enabled
        self.tenant_header = tenant_header
        self.default_rate_limit = default_rate_limit
        self.default_period_seconds = default_period_seconds
        self.tenant_limits = tenant_limits or {}
    
    def get_default_limits(self) -> Dict[str, Any]:
        """
        Get default rate limit configuration.
        
        Returns:
            Default limits configuration
        """
        return {
            "rate_limit": self.default_rate_limit,
            "period_seconds": self.default_period_seconds
        }
        
    def get_tenant_extractor(self) -> Callable[[Request], str]:
        """
        Get function to extract tenant ID from request.
        
        Returns:
            Function that extracts tenant ID from request
        """
        header = self.tenant_header
        
        def extractor(request: Request) -> str:
            # Try to get from configured header
            tenant_id = request.headers.get(header)
            if tenant_id:
                return tenant_id
                
            # Try standard alternatives
            tenant_id = (
                request.headers.get("X-Tenant-ID") or
                request.query_params.get("tenant_id")
            )
            if tenant_id:
                return tenant_id
                
            # Try to get from path params
            try:
                if hasattr(request, "path_params") and "tenant_id" in request.path_params:
                    return request.path_params["tenant_id"]
            except:
                pass
                
            # Default tenant ID
            return "default"
            
        return extractor