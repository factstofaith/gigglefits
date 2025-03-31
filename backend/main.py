"""
TAP Integration Platform Backend

This is the main entry point for the FastAPI application that serves
as the backend for the TAP Integration Platform.
"""

import os
import logging
import logging.handlers
import uvicorn
import sys
import time
from datetime import timedelta, datetime
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Import application modules
from core.config import settings, get_log_level_for_module
from core.auth import (
    Token, authenticate_user, create_access_token, 
    get_current_active_user, get_password_hash, oauth2_scheme
)
from utils.security.auth_hooks import (
    log_login_success, log_login_failure, log_account_locked
)
from db.base import get_db, engine, Base
from db.models import User, UserRole, UserAccountStatus
from modules.integrations import router as integrations_router
from modules.admin.controller import router as admin_router
from modules.admin.documentation_controller import analytics_router as documentation_analytics_router
from modules.earnings import router as earnings_router
from modules.users import router as users_router
from modules.integrations.models import UserResponseModel

# Configure logging
def configure_logging():
    """
    Configure logging based on settings
    """
    log_level = getattr(logging, settings.LOG_LEVEL)
    
    # Create formatter
    formatter = logging.Formatter(settings.LOG_FORMAT)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Clear existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Add console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    root_logger.addHandler(console_handler)
    
    # Add file handler if LOG_FILE is set
    if settings.LOG_FILE:
        # Create directory if it doesn't exist
        log_dir = os.path.dirname(settings.LOG_FILE)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        # Use rotating file handler to prevent log files from growing too large
        file_handler = logging.handlers.RotatingFileHandler(
            settings.LOG_FILE,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(log_level)
        root_logger.addHandler(file_handler)
    
    # Set module-specific log levels
    for module, level in settings.MODULE_LOG_LEVELS.items():
        module_logger = logging.getLogger(module)
        module_logger.setLevel(getattr(logging, level))
    
    # Special debug settings
    if settings.DEBUG_MODE:
        # If in debug mode, enable more verbose logging for specific modules
        critical_modules = [
            "utils.integration_runner", 
            "adapters", 
            "modules.integrations.service"
        ]
        for module in critical_modules:
            module_logger = logging.getLogger(module)
            if module not in settings.MODULE_LOG_LEVELS:  # Don't override explicit settings
                module_logger.setLevel(logging.DEBUG)
    
    # Configure SQLAlchemy logging if enabled
    if settings.ENABLE_SQL_LOGGING:
        logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Configure logging
configure_logging()
logger = logging.getLogger(__name__)

# Create the FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    # TAP Integration Platform API

    This is the backend API for the TAP Integration Platform, a comprehensive system for
    managing tenant integrations, data transformations, and enterprise workflows.

    ## Features

    * **Integration Management**: Create, configure, and manage data integrations
    * **Storage Connectors**: Connect to S3, Azure Blob, SharePoint, and more
    * **Workflow Automation**: Build and execute data workflows with retry and recovery
    * **Multi-tenant Architecture**: Securely isolated tenant environments
    * **Role-based Access Control**: Granular permissions for different user roles
    * **Earnings Management**: Process and transform earnings data
    * **Admin Operations**: Tenant, application, and dataset management

    ## Authentication

    Most endpoints require authentication using OAuth2 with JWT tokens.
    Use the `/token` endpoint to obtain an access token.

    ### Getting an Access Token

    Make a POST request to the `/token` endpoint with your credentials:

    ```
    POST /token
    Content-Type: application/x-www-form-urlencoded

    username=your_username&password=your_password
    ```

    ### Using the Access Token

    Add the token to your requests using the Authorization header:

    ```
    GET /api/v1/users/me
    Authorization: Bearer your_access_token
    ```

    ### User Roles

    The API supports different access levels based on user roles:
    
    * **ADMIN**: Full system access
    * **INTEGRATION_MANAGER**: Manage integrations and view tenant data
    * **DATA_MANAGER**: View and manage datasets
    * **USER**: Basic access to assigned resources
    
    ## Rate Limiting

    The API implements rate limiting to prevent abuse and ensure fair usage:

    * Each client is limited to a configurable number of requests in a time window
    * Authentication endpoints have additional rate limiting to prevent brute force attacks
    * Rate limit headers are included in all responses
    
    ### Rate Limit Headers

    The following headers are included in API responses:

    * **X-RateLimit-Limit**: Maximum number of requests allowed in the window
    * **X-RateLimit-Remaining**: Number of requests remaining in the current window
    * **X-RateLimit-Reset**: Seconds until the rate limit window resets
    
    ### Rate Limiting Response

    When a rate limit is exceeded, the API returns a 429 Too Many Requests response with:

    ```json
    {
      "detail": "Rate limit exceeded. Try again in X seconds.",
      "status_code": 429
    }
    ```

    The response also includes a **Retry-After** header indicating the number of seconds to wait before retrying.
    """,
    version="1.0.0",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    terms_of_service="https://example.com/terms/",
    contact={
        "name": "TAP Integration Platform Support",
        "url": "https://example.com/support",
        "email": "support@example.com",
    },
    license_info={
        "name": "Proprietary",
        "url": "https://example.com/license",
    },
    openapi_tags=[
        {
            "name": "auth",
            "description": "Authentication operations",
            "externalDocs": {
                "description": "Authentication Documentation",
                "url": "https://example.com/docs/auth",
            },
        },
        {
            "name": "integrations",
            "description": "Integration configuration and execution",
            "externalDocs": {
                "description": "Integration Documentation",
                "url": "https://example.com/docs/integrations",
            },
        },
        {
            "name": "admin",
            "description": "Administrative operations for tenant, application and dataset management",
            "externalDocs": {
                "description": "Admin Documentation",
                "url": "https://example.com/docs/admin",
            },
        },
        {
            "name": "earnings",
            "description": "Earnings data management and transformation",
            "externalDocs": {
                "description": "Earnings Documentation",
                "url": "https://example.com/docs/earnings",
            },
        },
        {
            "name": "users",
            "description": "User management, invitation and profile operations",
            "externalDocs": {
                "description": "User Management Documentation",
                "url": "https://example.com/docs/users",
            },
        },
        {
            "name": "system",
            "description": "System health, information and diagnostic endpoints",
        },
    ],
    swagger_ui_parameters={"defaultModelsExpandDepth": -1}
)

# Apply security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# Add API rate limiting middleware
@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    """
    Middleware that implements API rate limiting based on client IP address.
    
    This middleware:
    1. Extracts client IP from the request
    2. Checks if the client has exceeded rate limits
    3. Returns 429 Too Many Requests if rate limited
    4. Adds rate limit headers to responses
    
    In production, this should be replaced with a more robust solution using Redis or similar.
    """
    # Skip rate limiting for some paths
    if request.url.path in ["/api/health", "/", "/api/docs", "/api/redoc", "/api/openapi.json"]:
        return await call_next(request)
    
    # Get client IP
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    # Check rate limit
    is_limited, requests_remaining, reset_time = rate_limiter.is_rate_limited(
        client_ip, request.url.path
    )
    
    if is_limited:
        # Return 429 Too Many Requests
        content = {
            "detail": f"Rate limit exceeded. Try again in {reset_time} seconds.",
            "status_code": 429
        }
        
        # Create a JSON response
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content=content,
            headers={
                "Retry-After": str(reset_time),
                "X-RateLimit-Limit": str(settings.RATE_LIMIT_REQUESTS),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time)
            }
        )
    
    # Process the request normally
    response = await call_next(request)
    
    # Add rate limit headers
    response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_REQUESTS)
    response.headers["X-RateLimit-Remaining"] = str(requests_remaining)
    response.headers["X-RateLimit-Reset"] = str(reset_time)
    
    return response

# Add request timing middleware for performance debugging
@app.middleware("http")
async def request_timer_middleware(request: Request, call_next):
    # Only track timing if performance logging is enabled
    if settings.ENABLE_PERFORMANCE_LOGGING:
        # Add request ID for correlation
        request_id = f"{time.time()}-{id(request)}"
        
        # Extract path and method for logging
        path = request.url.path
        method = request.method
        
        # Log request start
        logger.debug(f"Request started | {request_id} | {method} {path}")
        
        # Measure request time
        start_time = time.time()
        
        # Process the request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Add timing header to response
        response.headers["X-Process-Time"] = str(process_time)
        
        # Log timing information with different levels based on duration
        if process_time > settings.SLOW_FUNCTION_THRESHOLD:
            logger.warning(
                f"Slow request | {request_id} | {method} {path} | {process_time:.4f}s"
            )
        else:
            logger.debug(
                f"Request completed | {request_id} | {method} {path} | {process_time:.4f}s"
            )
        
        return response
    else:
        # Skip timing measurement if not enabled
        return await call_next(request)

# Simple in-memory rate limiter
# In production, this should be replaced with a Redis-based implementation
class RateLimiter:
    def __init__(self, requests_limit: int, window_seconds: int):
        """
        Initialize a rate limiter
        
        Args:
            requests_limit: Maximum number of requests allowed in the window
            window_seconds: Time window in seconds
        """
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.client_requests = {}  # Maps client_id -> [(timestamp, endpoint), ...]
        
    def is_rate_limited(self, client_id: str, endpoint: str) -> tuple[bool, int, int]:
        """
        Check if a client is rate limited
        
        Args:
            client_id: Identifier for the client (IP address or API key)
            endpoint: API endpoint being accessed
            
        Returns:
            Tuple of (is_limited, requests_remaining, reset_time_seconds)
        """
        now = time.time()
        
        # Initialize client record if not exists
        if client_id not in self.client_requests:
            self.client_requests[client_id] = []
        
        # Clean up old requests outside the window
        window_start = now - self.window_seconds
        self.client_requests[client_id] = [
            (timestamp, ep) for timestamp, ep in self.client_requests[client_id]
            if timestamp > window_start
        ]
        
        # Calculate endpoints for different rate limits
        # Authentication endpoints get stricter limits
        if endpoint == "/token":
            # Special case for login endpoint - use login_attempts logic instead
            return False, self.requests_limit, 0
        
        # Count requests in the current window
        request_count = len(self.client_requests[client_id])
        
        # Store current request
        self.client_requests[client_id].append((now, endpoint))
        
        # Check if limit exceeded
        is_limited = request_count >= self.requests_limit
        requests_remaining = max(0, self.requests_limit - request_count)
        
        # Calculate reset time
        if len(self.client_requests[client_id]) > 0:
            oldest = min(timestamp for timestamp, _ in self.client_requests[client_id])
            reset_time = int(oldest + self.window_seconds - now)
        else:
            reset_time = self.window_seconds
            
        return is_limited, requests_remaining, reset_time

# Initialize rate limiter
rate_limiter = RateLimiter(
    requests_limit=settings.RATE_LIMIT_REQUESTS,
    window_seconds=settings.RATE_LIMIT_WINDOW
)

# Import security monitoring
from utils.security.middleware import SecurityMonitoringMiddleware
from utils.security.dashboard import router as security_dashboard_router

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security monitoring middleware
app.add_middleware(SecurityMonitoringMiddleware)

# Configure security scheme for OpenAPI documentation
app.openapi_components = {
    "securitySchemes": {
        "jwt": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": """
            A Bearer JWT token is required to access protected endpoints.
            Get your token from the `/token` endpoint and use it in the header:
            `Authorization: Bearer <token>`
            """
        }
    }
}

# Include routers
app.include_router(integrations_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(documentation_analytics_router)  # No prefix, uses its own /api/documentation prefix
app.include_router(earnings_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(security_dashboard_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get(
    "/api/health",
    summary="System health check",
    description="Performs a system health check including database connectivity verification",
    response_description="Health status information including database connection state",
    tags=["system"],
    responses={
        200: {
            "description": "Successful health check",
            "content": {
                "application/json": {
                    "example": {
                        "status": "ok",
                        "message": "API is running",
                        "database": "connected",
                        "version": "1.0.0"
                    }
                }
            }
        },
        500: {
            "description": "System health check failed",
            "content": {
                "application/json": {
                    "example": {
                        "status": "error",
                        "message": "System health check failed",
                        "database": "error",
                        "version": "1.0.0"
                    }
                }
            }
        }
    }
)
async def health_check(db: Session = Depends(get_db)):
    """
    Performs a system health check including database connectivity verification.
    
    This endpoint can be used by monitoring tools to check the system's operational status.
    It verifies that:
    
    * The API server is running
    * The database connection is active
    
    Returns a 200 OK response if all systems are operational, with detailed status information.
    """
    try:
        # Try a simple database query to verify connection
        db.execute("SELECT 1")
        db_status = "connected"
        status = "ok"
        message = "API is running"
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        db_status = "error"
        status = "error"
        message = "Database connection failed"
    
    return {
        "status": status,
        "message": message,
        "database": db_status,
        "version": "1.0.0"
    }

# Debug endpoint to check encryption status (only available in debug mode for admins)
@app.get("/api/debug/encryption")
async def debug_encryption_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get encryption status information for debugging"""
    # Only allow admins to access this endpoint
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access encryption information"
        )
    
    # Only allow this endpoint in debug mode
    if not settings.DEBUG_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debug endpoints are only available when DEBUG_MODE is enabled"
        )
        
    # Import encryption utilities
    from utils.encryption.model_encryption import check_encryption_status
    
    # Check encryption status
    encryption_status = check_encryption_status(db)
    
    # Get encryption configuration (filter out actual keys)
    encryption_config = {
        "encryption_key_provided": bool(settings.ENCRYPTION_KEY),
        "encryption_salt_provided": bool(settings.ENCRYPTION_SALT),
        "key_rotation_configured": settings.ENCRYPTION_KEY_ROTATION != "{}",
        "using_development_encryption": not bool(settings.ENCRYPTION_KEY)
    }
    
    return {
        "encryption_config": encryption_config,
        "model_status": encryption_status
    }

# Debug endpoint to get system information (only available in debug mode)
@app.get("/api/debug/system")
async def debug_system_info(
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed system information for debugging"""
    # Only allow admins to access this endpoint
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access debug information"
        )
    
    # Only allow this endpoint in debug mode
    if not settings.DEBUG_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debug endpoints are only available when DEBUG_MODE is enabled"
        )
    
    # Collect system information
    import platform
    import sys
    
    try:
        import psutil
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        process = psutil.Process(os.getpid())
        process_memory = process.memory_info()
        
        memory_info = {
            "total": f"{memory.total / (1024**3):.2f} GB",
            "available": f"{memory.available / (1024**3):.2f} GB",
            "used_percent": f"{memory.percent}%",
            "process_rss": f"{process_memory.rss / (1024**2):.2f} MB",
            "process_vms": f"{process_memory.vms / (1024**2):.2f} MB",
        }
        
        disk_info = {
            "total": f"{disk.total / (1024**3):.2f} GB",
            "used": f"{disk.used / (1024**3):.2f} GB",
            "free": f"{disk.free / (1024**3):.2f} GB",
            "used_percent": f"{disk.percent}%",
        }
    except ImportError:
        memory_info = {"error": "psutil not installed"}
        disk_info = {"error": "psutil not installed"}
    
    # Get environment variables (filter out sensitive ones)
    env_vars = {}
    sensitive_keys = ["SECRET", "PASSWORD", "KEY", "TOKEN", "CREDENTIAL"]
    
    for key, value in os.environ.items():
        # Skip sensitive variables
        if any(sensitive in key.upper() for sensitive in sensitive_keys):
            env_vars[key] = "[REDACTED]"
        else:
            env_vars[key] = value
    
    # Get Python package information
    try:
        import pkg_resources
        packages = [
            {"name": pkg.key, "version": pkg.version}
            for pkg in pkg_resources.working_set
        ]
    except ImportError:
        packages = [{"error": "pkg_resources not available"}]
    
    # Return the collected information
    return {
        "system": {
            "os": platform.platform(),
            "python_version": sys.version,
            "processors": os.cpu_count(),
            "time": datetime.utcnow().isoformat(),
            "pid": os.getpid(),
            "cwd": os.getcwd(),
        },
        "memory": memory_info,
        "disk": disk_info,
        "settings": {
            "debug_mode": settings.DEBUG_MODE,
            "log_level": settings.LOG_LEVEL,
            "performance_logging": settings.ENABLE_PERFORMANCE_LOGGING,
            "sql_logging": settings.ENABLE_SQL_LOGGING,
            "memory_monitoring": settings.MONITOR_MEMORY_USAGE,
        },
        "loggers": {
            "root": logging.getLogger().level,
            **{name: logger.level for name, logger in logging.Logger.manager.loggerDict.items() 
               if hasattr(logger, 'level')}
        },
        "packages": packages[:20],  # Limit to first 20 packages
    }

# Root endpoint
@app.get(
    "/",
    summary="API information",
    description="Returns basic information about the API including version and documentation links",
    response_description="API information object with name, version and documentation URLs",
    tags=["system"],
    responses={
        200: {
            "description": "API information response",
            "content": {
                "application/json": {
                    "example": {
                        "name": "TAP Integration Platform API",
                        "version": "1.0.0",
                        "documentation": "/api/docs",
                        "swagger_ui": "/api/docs",
                        "redoc": "/api/redoc",
                        "openapi_spec": "/api/openapi.json"
                    }
                }
            }
        }
    }
)
async def root():
    """
    Root endpoint that provides basic information about the API.
    
    This endpoint returns:
    * The API name
    * The current API version
    * Links to API documentation
    
    This endpoint requires no authentication and can be used to verify API availability
    or to discover documentation resources.
    """
    return {
        "name": "TAP Integration Platform API",
        "version": "1.0.0",
        "documentation": "/api/docs",
        "swagger_ui": "/api/docs",
        "redoc": "/api/redoc",
        "openapi_spec": "/api/openapi.json"
    }

# Authentication rate limiter settings
# This is separate from the general API rate limiter for enhanced security
login_attempts = {}
MAX_ATTEMPTS = 5
LOCKOUT_TIME = 15 * 60  # 15 minutes in seconds

# Authentication-specific rate limiter
class AuthRateLimiter:
    def __init__(self, max_attempts: int, lockout_time: int):
        """
        Initialize an authentication rate limiter
        
        Args:
            max_attempts: Maximum number of failed attempts before lockout
            lockout_time: Lockout duration in seconds
        """
        self.max_attempts = max_attempts
        self.lockout_time = lockout_time
        self.client_attempts = {}  # Maps client_id -> (attempts, lockout_until)
        
    def check_rate_limit(self, client_id: str) -> tuple[bool, int, int]:
        """
        Check if a client is rate limited for authentication
        
        Args:
            client_id: Identifier for the client (IP address)
            
        Returns:
            Tuple of (is_limited, attempts_remaining, lockout_remaining_seconds)
        """
        current_time = datetime.utcnow().timestamp()
        
        if client_id in self.client_attempts:
            attempts, lockout_until = self.client_attempts[client_id]
            
            # Check if client is in lockout period
            if lockout_until and current_time < lockout_until:
                remaining = int(lockout_until - current_time)
                return True, 0, remaining
                
            # Reset attempts if lockout has expired
            if lockout_until and current_time >= lockout_until:
                attempts = 0
                self.client_attempts[client_id] = (attempts, None)
        else:
            attempts = 0
            self.client_attempts[client_id] = (attempts, None)
            
        # Calculate attempts remaining
        attempts_remaining = max(0, self.max_attempts - attempts)
        
        # Not limited
        return False, attempts_remaining, 0
        
    def record_success(self, client_id: str):
        """Record a successful authentication, resetting the attempt counter"""
        self.client_attempts[client_id] = (0, None)
        
    def record_failure(self, client_id: str) -> tuple[int, int]:
        """
        Record a failed authentication attempt
        
        Returns:
            Tuple of (attempts, lockout_remaining_seconds)
        """
        current_time = datetime.utcnow().timestamp()
        
        if client_id not in self.client_attempts:
            attempts = 0
            lockout_until = None
        else:
            attempts, lockout_until = self.client_attempts[client_id]
            
        # Increment attempts
        attempts += 1
        
        # Apply lockout if too many attempts
        if attempts >= self.max_attempts:
            lockout_until = current_time + self.lockout_time
            lockout_remaining = int(self.lockout_time)
        else:
            lockout_remaining = 0
            
        # Update client attempts
        self.client_attempts[client_id] = (attempts, lockout_until)
        
        return attempts, lockout_remaining

# Initialize auth rate limiter
auth_rate_limiter = AuthRateLimiter(
    max_attempts=MAX_ATTEMPTS,
    lockout_time=LOCKOUT_TIME
)

# Authentication endpoint
@app.post(
    "/token", 
    response_model=Token,
    summary="Authenticate user and get access token",
    description="OAuth2 compatible token login. Provide username and password to get a JWT access token for authenticating future API requests.",
    tags=["auth"],
    responses={
        200: {
            "description": "Successful authentication",
            "content": {
                "application/json": {
                    "example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "bearer",
                        "expires_at": "2025-03-26T10:00:00Z"
                    }
                }
            }
        },
        401: {
            "description": "Authentication failed",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Incorrect username or password"
                    }
                }
            }
        },
        429: {
            "description": "Too many failed login attempts",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Too many failed attempts. Try again in 300 seconds"
                    }
                }
            }
        },
        403: {
            "description": "Account is inactive or disabled",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Account is inactive or suspended"
                    }
                }
            }
        }
    }
)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    request: Request = None,
):
    """
    OAuth2 compatible token login endpoint for API authentication.
    
    This endpoint:
    * Validates username and password credentials
    * Performs rate limiting to prevent brute force attacks
    * Creates and returns a JWT token for API authentication
    * Records login attempts for security auditing
    
    The returned JWT token should be included in the Authorization header 
    of subsequent requests using the format: `Authorization: Bearer {token}`
    
    Rate limiting: After 5 failed attempts, the account will be temporarily
    locked for 15 minutes.
    """
    # Get client IP for rate limiting
    client_ip = form_data.client_id or getattr(request, "client", None)
    if client_ip is None:
        client_ip = "default_ip"
    elif hasattr(client_ip, "host"):
        client_ip = client_ip.host
        
    # Check auth rate limiter
    is_limited, attempts_remaining, lockout_remaining = auth_rate_limiter.check_rate_limit(client_ip)
    
    # If rate limited, return 429 response
    if is_limited:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed attempts. Try again in {lockout_remaining} seconds",
            headers={
                "Retry-After": str(lockout_remaining),
                "X-RateLimit-Reset": str(lockout_remaining)
            }
        )
    
    # Try to authenticate
    user = authenticate_user(db, form_data.username, form_data.password)
    
    # Handle failed login
    if not user:
        # Record failure in auth rate limiter
        attempts, lockout_remaining = auth_rate_limiter.record_failure(client_ip)
        
        # Log login failure for security monitoring
        log_login_failure(
            request=request,
            username=form_data.username,
            reason="Invalid credentials",
            auth_method="password"
        )
        
        # Track login failure in the database
        try:
            # Get user by username (might not exist)
            user_record = db.query(User).filter(User.username == form_data.username).first()
            if user_record:
                # Increment login attempts counter
                user_record.login_attempts = (user_record.login_attempts or 0) + 1
                db.commit()
                
                # Create login history record
                from db.models import UserLoginHistory
                import uuid
                login_history = UserLoginHistory(
                    id=str(uuid.uuid4()),
                    user_id=user_record.id,
                    ip_address=client_ip if client_ip != "default_ip" else None,
                    login_time=datetime.utcnow(),
                    success=False,
                    failure_reason="Invalid password"
                )
                db.add(login_history)
                db.commit()
        except Exception as e:
            logger.error(f"Error tracking login failure: {str(e)}")
        
        # If this attempt caused a lockout, return 429 response
        if lockout_remaining > 0:
            # Log account locked event if we have the user record
            if user_record:
                log_account_locked(
                    request=request,
                    user_id=user_record.id,
                    username=user_record.username,
                    tenant_id=user_record.tenant_id,
                    reason="Too many failed login attempts"
                )
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed attempts. Try again in {lockout_remaining} seconds",
                headers={
                    "Retry-After": str(lockout_remaining),
                    "X-RateLimit-Reset": str(lockout_remaining)
                }
            )
        else:
            # Return 401 with attempts remaining header
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={
                    "WWW-Authenticate": "Bearer",
                    "X-RateLimit-Remaining": str(MAX_ATTEMPTS - attempts)
                },
            )
    
    # Check if account is active
    if user.account_status != UserAccountStatus.ACTIVE:
        # Record failure in auth rate limiter
        auth_rate_limiter.record_failure(client_ip)
        
        # Create login history record for disabled account
        try:
            from db.models import UserLoginHistory
            import uuid
            login_history = UserLoginHistory(
                id=str(uuid.uuid4()),
                user_id=user.id,
                ip_address=client_ip if client_ip != "default_ip" else None,
                login_time=datetime.utcnow(),
                success=False,
                failure_reason=f"Account status: {user.account_status.value}"
            )
            db.add(login_history)
            db.commit()
        except Exception as e:
            logger.error(f"Error tracking login for disabled account: {str(e)}")
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Account is {user.account_status.value}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Track successful login
    try:
        # Reset login attempts counter
        user.login_attempts = 0
        user.last_login = datetime.utcnow()
        
        # Create login history record
        from db.models import UserLoginHistory
        import uuid
        login_history = UserLoginHistory(
            id=str(uuid.uuid4()),
            user_id=user.id,
            ip_address=client_ip if client_ip != "default_ip" else None,
            login_time=datetime.utcnow(),
            success=True
        )
        db.add(login_history)
        db.commit()
    except Exception as e:
        logger.error(f"Error tracking successful login: {str(e)}")
    
    # Successful login - reset attempts
    auth_rate_limiter.record_success(client_ip)
    
    # Log login success for security monitoring
    log_login_success(
        request=request,
        user_id=user.id,
        username=user.username,
        tenant_id=user.tenant_id,
        auth_method="password"
    )
    
    # Generate the JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Include role and MFA bypass status in token payload
    token_data = {
        "sub": user.username, 
        "tenant_id": user.tenant_id,
        "role": user.role.value
    }
    
    # Add bypass_mfa flag to token if present
    if hasattr(user, "bypass_mfa") and user.bypass_mfa:
        token_data["bypass_mfa"] = True
    
    access_token = create_access_token(
        data=token_data, 
        expires_delta=access_token_expires
    )
    
    # Calculate token expiration time for easier client usage
    expiration = datetime.utcnow() + access_token_expires
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "expires_at": expiration.isoformat()
    }

# Protected endpoint for user profiles
@app.get("/api/user/profile", response_model=UserResponseModel)
async def get_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get the current user's profile"""
    return current_user

# Admin endpoint to create an initial user
@app.post("/api/admin/create-initial-user", status_code=status.HTTP_201_CREATED)
async def create_initial_user(
    username: str, 
    password: str, 
    email: str, 
    name: str, 
    db: Session = Depends(get_db)
):
    """Create an initial admin user - only available in development"""
    if not settings.DEMO_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only available in development mode"
        )
        
    # Check if any users exist
    user_count = db.query(User).count()
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Users already exist in the database"
        )
        
    # Create admin user
    hashed_password = get_password_hash(password)
    new_user = User(
        id=username,
        username=username,
        email=email,
        name=name,
        role=UserRole.ADMIN,
        is_active=True,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    
    return {"message": "Initial admin user created successfully"}

# Create databases and run migrations on startup
# Add healthcheck endpoint for container health checking
@app.get("/api/health", tags=["system"], summary="Health check endpoint")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint that verifies service and database connectivity.
    Used by container orchestration for health monitoring.
    """
    try:
        # Check database connectivity
        from sqlalchemy import text
        result = db.execute(text("SELECT 1")).scalar()
        if result != 1:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database health check failed"
            )
            
        return {"status": "ok", "message": "Service is healthy"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health check failed: {str(e)}"
        )

@app.on_event("startup")
async def startup_event():
    try:
        # Initialize encryption system
        from utils.encryption.crypto import initialize_encryption
        initialize_encryption()
        logger.info("Encryption system initialized")
        
        # Check database connection but don't run migrations
        # This separates database initialization from application startup
        from sqlalchemy import create_engine, text
        from core.config import settings
        
        try:
            # Just test the connection
            engine = create_engine(settings.DATABASE_URL)
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1")).scalar()
                if result == 1:
                    logger.info("Database connection successful")
                else:
                    logger.warning("Database connection test returned unexpected result")
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            logger.error("Please ensure the database is properly initialized.")
            logger.info("Run 'python -m db.manage_db init' to initialize the database")
            logger.info("Run 'python -m db.manage_db migrate' to run database migrations")
        
        # Set up the user invitation system
        if settings.SETUP_INVITATION_SYSTEM:
            try:
                from setup_invitation_system import setup_database
                setup_database()
                logger.info("User invitation system setup complete")
            except Exception as e:
                logger.error(f"User invitation system setup error: {str(e)}")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")
        # Continue startup even if initialization fails
        # In production, you might want to exit the application here
    
    # Setup memory monitoring if enabled
    if settings.MONITOR_MEMORY_USAGE:
        try:
            import psutil
            import threading
            
            def monitor_memory_usage():
                """
                Background thread that periodically checks memory usage
                """
                process = psutil.Process(os.getpid())
                
                while True:
                    try:
                        # Get memory usage in MB
                        memory_info = process.memory_info()
                        rss_mb = memory_info.rss / (1024 * 1024)
                        vms_mb = memory_info.vms / (1024 * 1024)
                        
                        # Log memory usage
                        logger.debug(f"Memory usage: RSS {rss_mb:.2f} MB, VMS {vms_mb:.2f} MB")
                        
                        # Check if memory usage exceeds warning threshold
                        if rss_mb > settings.MEMORY_WARNING_THRESHOLD_MB:
                            logger.warning(
                                f"High memory usage detected: RSS {rss_mb:.2f} MB exceeds threshold "
                                f"of {settings.MEMORY_WARNING_THRESHOLD_MB} MB"
                            )
                            
                        # Sleep before next check
                        time.sleep(60)  # Check every minute
                    except Exception as e:
                        logger.error(f"Memory monitoring error: {str(e)}")
                        time.sleep(300)  # On error, retry after 5 minutes
            
            # Start memory monitoring in a background thread
            memory_thread = threading.Thread(
                target=monitor_memory_usage, 
                daemon=True,  # daemon=True ensures thread stops when app stops
                name="MemoryMonitor"
            )
            memory_thread.start()
            logger.info("Memory monitoring started")
        except ImportError:
            logger.warning("psutil not installed, memory monitoring disabled")
            logger.warning("Install with: pip install psutil")
    
    # Log system information
    logger.info(f"Debug mode: {settings.DEBUG_MODE}")
    logger.info(f"Log level: {settings.LOG_LEVEL}")
    logger.info("Application started successfully")

# Run the application with uvicorn when executed directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)