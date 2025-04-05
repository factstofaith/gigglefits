"""
Middleware for handling logging context in request/response cycle.

This middleware:
1. Sets up request context for each incoming request
2. Tracks request timing for performance logging
3. Ensures unique request IDs for distributed tracing
4. Cleans up context after request processing
"""

import time
import uuid
import logging
from typing import Callable, Dict, Any, Optional

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send

from .context import set_request_context, clear_request_context, get_request_id

# Logger for this module
logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for request context and logging.
    
    This middleware ensures each request:
    - Has a unique request ID for tracing
    - Is properly logged with timing information
    - Has request context available to all loggers
    - Has context cleaned up after completion
    """
    
    def __init__(
        self,
        app: ASGIApp,
        log_all_requests: bool = True,
        log_errors_only: bool = False,
        exclude_paths: Optional[list] = None
    ):
        """
        Initialize the middleware.
        
        Args:
            app: The ASGI application
            log_all_requests: Whether to log all requests
            log_errors_only: Whether to log only errors
            exclude_paths: List of path prefixes to exclude from logging
        """
        super().__init__(app)
        self.log_all_requests = log_all_requests
        self.log_errors_only = log_errors_only
        self.exclude_paths = exclude_paths or ["/health", "/docs", "/static"]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process a request and set up logging context.
        
        Args:
            request: The incoming HTTP request
            call_next: Function to call the next middleware or route handler
            
        Returns:
            HTTP response
        """
        # Extract request ID from headers or generate a new one
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = str(uuid.uuid4())
        
        # Get authenticated user ID if available
        user_id = None
        try:
            # Different ways user information might be available
            if hasattr(request.state, "user") and hasattr(request.state.user, "id"):
                user_id = str(request.state.user.id)
            elif hasattr(request.state, "user_id"):
                user_id = str(request.state.user_id)
            elif hasattr(request.state, "authenticated_user"):
                user_id = str(request.state.authenticated_user.get("id", "anonymous"))
        except Exception:
            # Don't break request processing if we can't get user ID
            pass
        
        # Extract tenant ID if available
        tenant_id = None
        try:
            if hasattr(request.state, "tenant") and hasattr(request.state.tenant, "id"):
                tenant_id = str(request.state.tenant.id)
            elif hasattr(request.state, "tenant_id"):
                tenant_id = str(request.state.tenant_id)
        except Exception:
            pass
        
        # Get client IP
        client_ip = request.client.host if request.client else None
        
        # Set up request context
        set_request_context(
            request_id=request_id,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=request.headers.get("User-Agent")
        )
        
        # Add request ID to response headers
        start_time = time.time()
        path = request.url.path
        
        # Skip logging for excluded paths
        should_log = True
        if self.exclude_paths:
            for excluded in self.exclude_paths:
                if path.startswith(excluded):
                    should_log = False
                    break
        
        # Log request start if not excluded
        if should_log and not self.log_errors_only:
            logger.info(
                f"Request started: {request.method} {path}",
                extra={
                    "http": {
                        "method": request.method,
                        "path": path,
                        "query": str(request.query_params),
                        "request_id": request_id,
                    }
                }
            )
        
        try:
            # Process the request
            response = await call_next(request)
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            # Log response if needed
            if should_log and (not self.log_errors_only or response.status_code >= 400):
                duration = time.time() - start_time
                logger.info(
                    f"Request completed: {request.method} {path} - {response.status_code}",
                    extra={
                        "http": {
                            "method": request.method,
                            "path": path,
                            "status_code": response.status_code,
                            "duration_ms": int(duration * 1000),
                            "request_id": request_id,
                        }
                    }
                )
            
            return response
            
        except Exception as exc:
            # Log exceptions
            duration = time.time() - start_time
            logger.exception(
                f"Request failed: {request.method} {path}",
                extra={
                    "http": {
                        "method": request.method,
                        "path": path,
                        "duration_ms": int(duration * 1000),
                        "request_id": request_id,
                        "error": str(exc)
                    }
                }
            )
            raise
        finally:
            # Always clean up request context
            clear_request_context()

def setup_request_logging(app: FastAPI, **kwargs) -> None:
    """
    Set up request logging middleware for a FastAPI application.
    
    Args:
        app: FastAPI application
        **kwargs: Arguments to pass to RequestLoggingMiddleware
    """
    app.add_middleware(RequestLoggingMiddleware, **kwargs)
    logger.info("Request logging middleware configured")