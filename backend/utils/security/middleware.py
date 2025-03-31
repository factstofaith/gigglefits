"""
Security middleware for FastAPI application.

This module provides middleware for integrating security monitoring
with FastAPI requests and responses.
"""

import time
import logging
from typing import Dict, Optional, List, Any, Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import json

from .monitoring import (
    SecurityEventType, 
    SecurityAlertLevel, 
    log_security_event, 
    check_account_status
)

# Setup logging
logger = logging.getLogger(__name__)


class SecurityMonitoringMiddleware(BaseHTTPMiddleware):
    """
    Middleware for monitoring security events in FastAPI requests.
    
    This middleware:
    1. Tracks API requests and responses
    2. Monitors for suspicious activities
    3. Blocks requests from suspicious sources
    4. Logs security events
    """
    
    def __init__(
        self, 
        app: ASGIApp, 
        excluded_paths: Optional[List[str]] = None,
        excluded_methods: Optional[List[str]] = None
    ):
        """
        Initialize the security monitoring middleware.
        
        Args:
            app: The ASGI application
            excluded_paths: List of URL paths to exclude from monitoring
            excluded_methods: List of HTTP methods to exclude from monitoring
        """
        super().__init__(app)
        self.excluded_paths = excluded_paths or [
            "/api/health", 
            "/", 
            "/api/docs", 
            "/api/redoc", 
            "/api/openapi.json"
        ]
        self.excluded_methods = excluded_methods or ["OPTIONS"]
        
        logger.info("Security monitoring middleware initialized")
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process a request through the middleware.
        
        Args:
            request: The incoming request
            call_next: The next middleware or endpoint to call
            
        Returns:
            The response from the application
        """
        # Skip excluded paths and methods
        if self._should_skip(request):
            return await call_next(request)
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Start timing
        start_time = time.time()
        
        # Get user and tenant from request state if authenticated
        user_id = getattr(request.state, "user_id", None)
        tenant_id = getattr(request.state, "tenant_id", None)
        
        # Check if account is blocked
        if user_id:
            should_block, reason = check_account_status(user_id, client_ip)
            if should_block:
                # Log account blocked event
                log_security_event(
                    event_type=SecurityEventType.ACCOUNT_LOCKED,
                    user_id=user_id,
                    tenant_id=tenant_id,
                    ip_address=client_ip,
                    user_agent=request.headers.get("user-agent"),
                    alert_level=SecurityAlertLevel.HIGH,
                    details={"reason": reason}
                )
                
                # Return 403 Forbidden response
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Account temporarily locked for security reasons"}
                )
        
        # Process the request
        try:
            response = await call_next(request)
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Monitor for suspicious activities based on response
            if response.status_code == 401:
                self._handle_unauthorized_response(request, user_id, tenant_id, client_ip)
            elif response.status_code == 403:
                self._handle_forbidden_response(request, user_id, tenant_id, client_ip)
            elif response.status_code == 429:
                self._handle_rate_limited_response(request, user_id, tenant_id, client_ip)
            
            # Log slow responses as potential DoS indicators
            if response_time > 5.0:  # 5 seconds threshold
                self._log_slow_response(request, response, response_time, user_id, tenant_id, client_ip)
            
            return response
            
        except Exception as e:
            # Log error as security event if it might be related to security
            if "sql" in str(e).lower() or "injection" in str(e).lower():
                log_security_event(
                    event_type=SecurityEventType.SUSPICIOUS_USER_AGENT,
                    user_id=user_id,
                    tenant_id=tenant_id,
                    ip_address=client_ip,
                    user_agent=request.headers.get("user-agent"),
                    resource_type="api",
                    resource_id=str(request.url),
                    alert_level=SecurityAlertLevel.HIGH,
                    details={
                        "error": str(e),
                        "method": request.method,
                        "path": request.url.path,
                        "exception_type": str(type(e).__name__)
                    }
                )
            
            # Re-raise the exception
            raise
    
    def _should_skip(self, request: Request) -> bool:
        """
        Check if the request should be skipped.
        
        Args:
            request: The incoming request
            
        Returns:
            True if the request should be skipped, False otherwise
        """
        # Skip excluded methods
        if request.method in self.excluded_methods:
            return True
        
        # Skip excluded paths
        path = request.url.path
        for excluded_path in self.excluded_paths:
            if path == excluded_path or path.startswith(f"{excluded_path}/"):
                return True
        
        return False
    
    def _get_client_ip(self, request: Request) -> str:
        """
        Get the client IP address from a request.
        
        Args:
            request: The incoming request
            
        Returns:
            The client IP address
        """
        # Try to get real IP from proxy headers
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            # Get the first IP in the list
            return forwarded_for.split(",")[0].strip()
        
        # Fallback to client IP from the request
        return request.client.host if request.client else "127.0.0.1"
    
    def _handle_unauthorized_response(
        self, 
        request: Request, 
        user_id: Optional[str], 
        tenant_id: Optional[str], 
        client_ip: str
    ) -> None:
        """
        Handle an unauthorized (401) response.
        
        Args:
            request: The incoming request
            user_id: User ID associated with the request
            tenant_id: Tenant ID associated with the request
            client_ip: Client IP address
        """
        # Log as login failure if it's a token endpoint
        if request.url.path == "/token" and request.method == "POST":
            log_security_event(
                event_type=SecurityEventType.LOGIN_FAILURE,
                user_id=user_id,  # This might be None for login failures
                tenant_id=tenant_id,
                ip_address=client_ip,
                user_agent=request.headers.get("user-agent"),
                alert_level=SecurityAlertLevel.LOW,
                details={
                    "path": request.url.path,
                    "method": request.method
                }
            )
        else:
            # Other unauthorized access attempts
            log_security_event(
                event_type=SecurityEventType.ACCESS_DENIED,
                user_id=user_id,
                tenant_id=tenant_id,
                ip_address=client_ip,
                user_agent=request.headers.get("user-agent"),
                resource_type="api",
                resource_id=str(request.url),
                alert_level=SecurityAlertLevel.LOW,
                details={
                    "path": request.url.path,
                    "method": request.method,
                    "reason": "unauthorized"
                }
            )
    
    def _handle_forbidden_response(
        self, 
        request: Request, 
        user_id: Optional[str], 
        tenant_id: Optional[str], 
        client_ip: str
    ) -> None:
        """
        Handle a forbidden (403) response.
        
        Args:
            request: The incoming request
            user_id: User ID associated with the request
            tenant_id: Tenant ID associated with the request
            client_ip: Client IP address
        """
        # Log as permission denied event
        log_security_event(
            event_type=SecurityEventType.ACCESS_DENIED,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=request.headers.get("user-agent"),
            resource_type="api",
            resource_id=str(request.url),
            alert_level=SecurityAlertLevel.MEDIUM,
            details={
                "path": request.url.path,
                "method": request.method,
                "reason": "forbidden"
            }
        )
        
        # If it looks like a privilege escalation attempt, log it as such
        if "admin" in request.url.path and user_id:
            log_security_event(
                event_type=SecurityEventType.ELEVATION_ATTEMPT,
                user_id=user_id,
                tenant_id=tenant_id,
                ip_address=client_ip,
                user_agent=request.headers.get("user-agent"),
                resource_type="api",
                resource_id=str(request.url),
                alert_level=SecurityAlertLevel.HIGH,
                details={
                    "path": request.url.path,
                    "method": request.method
                }
            )
    
    def _handle_rate_limited_response(
        self, 
        request: Request, 
        user_id: Optional[str], 
        tenant_id: Optional[str], 
        client_ip: str
    ) -> None:
        """
        Handle a rate limited (429) response.
        
        Args:
            request: The incoming request
            user_id: User ID associated with the request
            tenant_id: Tenant ID associated with the request
            client_ip: Client IP address
        """
        # Log as rate limit exceeded event
        log_security_event(
            event_type=SecurityEventType.RATE_LIMIT_EXCEEDED,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=request.headers.get("user-agent"),
            resource_type="api",
            resource_id=str(request.url),
            alert_level=SecurityAlertLevel.MEDIUM,
            details={
                "path": request.url.path,
                "method": request.method
            }
        )
    
    def _log_slow_response(
        self, 
        request: Request, 
        response: Response, 
        response_time: float,
        user_id: Optional[str], 
        tenant_id: Optional[str], 
        client_ip: str
    ) -> None:
        """
        Log a slow response as potential DoS indicator.
        
        Args:
            request: The incoming request
            response: The response
            response_time: The response time in seconds
            user_id: User ID associated with the request
            tenant_id: Tenant ID associated with the request
            client_ip: Client IP address
        """
        # Only log as security event if it's very slow
        if response_time > 10.0:  # 10 seconds threshold for security event
            log_security_event(
                event_type=SecurityEventType.SUSPICIOUS_USER_AGENT,
                user_id=user_id,
                tenant_id=tenant_id,
                ip_address=client_ip,
                user_agent=request.headers.get("user-agent"),
                resource_type="api",
                resource_id=str(request.url),
                alert_level=SecurityAlertLevel.LOW,
                details={
                    "path": request.url.path,
                    "method": request.method,
                    "response_time": response_time,
                    "status_code": response.status_code
                }
            )


# Dependency for tracking sensitive data access
async def track_sensitive_data_access(
    request: Request, 
    resource_type: str, 
    resource_id: str,
    reason: Optional[str] = None
) -> None:
    """
    Track access to sensitive data resources.
    
    Args:
        request: The incoming request
        resource_type: Type of resource being accessed
        resource_id: ID of resource being accessed
        reason: Reason for accessing the sensitive data
    """
    # Get user and tenant from request state if authenticated
    user_id = getattr(request.state, "user_id", None)
    tenant_id = getattr(request.state, "tenant_id", None)
    
    # Get client IP
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    # Log the sensitive data access
    log_security_event(
        event_type=SecurityEventType.SENSITIVE_DATA_ACCESS,
        user_id=user_id,
        tenant_id=tenant_id,
        ip_address=client_ip,
        user_agent=request.headers.get("user-agent"),
        resource_type=resource_type,
        resource_id=resource_id,
        alert_level=SecurityAlertLevel.INFO,
        details={
            "path": request.url.path,
            "method": request.method,
            "reason": reason
        }
    )