"""
Authentication Controller for TAP Integration Platform

This module provides standardized authentication endpoints for the TAP Integration Platform,
including login, token refresh, and MFA verification.
"""

from typing import Optional, List, Dict, Any, Union
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, Request, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.auth import (
    get_current_user, 
    create_access_token, 
    authenticate_user, 
    verify_mfa_if_required,
    TokenData
)
from db.base import get_db_session as get_db
from db.models import User, UserRole
from modules.auth.models import (
    Token,
    LoginRequest,
    RefreshRequest, 
    MFAVerifyRequest, 
    LoginResponse,
    UserResponse
)
from modules.auth.service import AuthService

# Create router
router = APIRouter(prefix="/auth", tags=["Authentication"])

# Standard API Response
from pydantic import BaseModel
class ResponseMetadata(BaseModel):
    timestamp: datetime
    request_id: str
    api_version: str = "1.0"

class StandardResponse(BaseModel):
    data: Any
    metadata: ResponseMetadata

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    error: ErrorDetail
    metadata: ResponseMetadata

# Import config
from core.config import get_settings

# Standardized OAuth2 scheme with proper security settings
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/token",
    auto_error=True
)

# Get app settings for cookie configuration
settings = get_settings()

# Helper functions
def get_request_id(request: Request) -> str:
    """Get or generate request ID for tracking."""
    request_id = request.headers.get("X-Request-ID")
    if not request_id:
        import uuid
        request_id = str(uuid.uuid4())
    return request_id

def create_standard_response(data: Any, request: Request) -> StandardResponse:
    """Create a standardized API response."""
    return {
        "data": data,
        "metadata": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": get_request_id(request),
            "api_version": "1.0"
        }
    }

def create_error_response(
    code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    request: Request = None
) -> ErrorResponse:
    """Create a standardized error response."""
    request_id = get_request_id(request) if request else str(datetime.now(timezone.utc).timestamp())
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details
        },
        "metadata": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": request_id,
            "api_version": "1.0"
        }
    }

# Token endpoints
@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Authenticate user and return access token (OAuth2 flow)."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if MFA is required
    if user.mfa_enabled:
        # For OAuth2 flow, we need to return a special response indicating MFA is required
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="MFA required",
            headers={"WWW-Authenticate": "Bearer", "X-MFA-Required": "true"},
        )
    
    # Generate token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username, "tenant_id": user.tenant_id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return access token with user information.
    
    This endpoint provides a more comprehensive login flow than the OAuth2 token endpoint,
    including user information and handling for MFA.
    """
    auth_service = AuthService(db)
    
    try:
        # Authenticate user
        result = auth_service.login(
            username=login_data.username,
            password=login_data.password
        )
        
        # If MFA is required
        if result.get("mfa_required"):
            return {
                "success": True,
                "mfa_required": True,
                "mfa_token": result.get("mfa_token"),
                "user_id": result.get("user_id")
            }
        
        # Set access token in HttpOnly cookie for better security
        if login_data.set_cookie:
            # Calculate cookie max_age in seconds from minutes
            cookie_max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            
            # Set cookie with configured settings
            response.set_cookie(
                key="access_token",
                value=result.get("access_token"),
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                domain=settings.AUTH_COOKIE_DOMAIN,
                path=settings.AUTH_COOKIE_PATH,
                max_age=cookie_max_age
            )
            
            # Also set refresh token if requested
            if login_data.remember_me:
                # Calculate refresh token max_age in seconds from days
                refresh_max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
                
                response.set_cookie(
                    key="refresh_token",
                    value=result.get("refresh_token"),
                    httponly=settings.AUTH_COOKIE_HTTPONLY,
                    secure=settings.AUTH_COOKIE_SECURE,
                    samesite=settings.AUTH_COOKIE_SAMESITE,
                    domain=settings.AUTH_COOKIE_DOMAIN,
                    path=settings.AUTH_COOKIE_PATH,
                    max_age=refresh_max_age
                )
        
        # Return successful login response
        return {
            "success": True,
            "mfa_required": False,
            "access_token": result.get("access_token"),
            "refresh_token": result.get("refresh_token") if login_data.remember_me else None,
            "token_type": "bearer",
            "user": result.get("user")
        }
        
    except Exception as e:
        # Log the error
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Login error: {str(e)}")
        
        # Raise HTTP exception instead of returning error response
        # This ensures the response format matches the expected model
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

@router.post("/verify-mfa", response_model=LoginResponse)
async def verify_mfa(
    mfa_data: MFAVerifyRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Verify MFA code and complete login.
    
    This endpoint is used to complete the login process when MFA is required.
    """
    auth_service = AuthService(db)
    
    try:
        # Verify MFA and complete login
        result = auth_service.verify_mfa(
            user_id=mfa_data.user_id,
            mfa_token=mfa_data.mfa_token,
            mfa_code=mfa_data.mfa_code
        )
        
        # Set access token in HttpOnly cookie for better security
        if mfa_data.set_cookie:
            # Calculate cookie max_age in seconds from minutes
            cookie_max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            
            response.set_cookie(
                key="access_token",
                value=result.get("access_token"),
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                domain=settings.AUTH_COOKIE_DOMAIN,
                path=settings.AUTH_COOKIE_PATH,
                max_age=cookie_max_age
            )
            
            # Also set refresh token if requested
            if mfa_data.remember_me:
                # Calculate refresh token max_age in seconds from days
                refresh_max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
                
                response.set_cookie(
                    key="refresh_token",
                    value=result.get("refresh_token"),
                    httponly=settings.AUTH_COOKIE_HTTPONLY,
                    secure=settings.AUTH_COOKIE_SECURE,
                    samesite=settings.AUTH_COOKIE_SAMESITE,
                    domain=settings.AUTH_COOKIE_DOMAIN,
                    path=settings.AUTH_COOKIE_PATH,
                    max_age=refresh_max_age
                )
        
        # Return successful login response
        return {
            "success": True,
            "mfa_required": False,
            "access_token": result.get("access_token"),
            "refresh_token": result.get("refresh_token") if mfa_data.remember_me else None,
            "token_type": "bearer",
            "user": result.get("user")
        }
        
    except Exception as e:
        # Log the error
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"MFA verification error: {str(e)}")
        
        # Raise HTTP exception instead of returning error response
        # This ensures the response format matches the expected model
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"MFA verification failed: {str(e)}"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_data: RefreshRequest,
    request: Request,
    response: Response,
    refresh_token: Optional[str] = Cookie(None, alias="refresh_token"),
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    This endpoint accepts the refresh token either in the request body or from a cookie.
    """
    auth_service = AuthService(db)
    
    # Get refresh token from either request body or cookie
    token = refresh_data.refresh_token or refresh_token
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Verify refresh token and generate new tokens
        result = auth_service.refresh_token(token)
        
        # Set new access token in cookie if the original was in a cookie
        if refresh_token:
            # Calculate cookie max_age in seconds from minutes
            cookie_max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            
            response.set_cookie(
                key="access_token",
                value=result.get("access_token"),
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                domain=settings.AUTH_COOKIE_DOMAIN,
                path=settings.AUTH_COOKIE_PATH,
                max_age=cookie_max_age
            )
            
            # Also update refresh token cookie
            # Calculate refresh token max_age in seconds from days
            refresh_max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
            
            response.set_cookie(
                key="refresh_token",
                value=result.get("refresh_token"),
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                domain=settings.AUTH_COOKIE_DOMAIN,
                path=settings.AUTH_COOKIE_PATH,
                max_age=refresh_max_age
            )
        
        # Return new tokens
        return {
            "access_token": result.get("access_token"),
            "refresh_token": result.get("refresh_token"),
            "token_type": "bearer"
        }
        
    except Exception as e:
        # Log the error
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Token refresh error: {str(e)}")
        
        # Clear invalid cookies
        if refresh_token:
            response.delete_cookie(key="access_token")
            response.delete_cookie(key="refresh_token")
        
        # Return standardized error response
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    access_token: Optional[str] = Cookie(None, alias="access_token"),
    token: Optional[str] = Depends(oauth2_scheme)
):
    """
    Log out user by invalidating tokens.
    
    This endpoint handles both cookie-based and bearer token authentication.
    """
    # Get token from either cookie or Authorization header
    current_token = access_token or token
    
    # Clear cookies regardless of token
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    
    # In a real implementation, you would add the token to a blocklist or invalidate it
    
    return create_standard_response(
        {"message": "Logged out successfully"},
        request
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Get information about the currently authenticated user.
    """
    # Create user response without sensitive information
    user_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "tenant_id": current_user.tenant_id,
        "mfa_enabled": getattr(current_user, 'mfa_enabled', False)
    }
    
    return create_standard_response(user_data, request)

@router.get("/validate-token")
async def validate_token(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Validate current token and return basic user information.
    
    This endpoint is useful for client-side authentication checks.
    """
    return create_standard_response(
        {
            "valid": True,
            "user_id": current_user.id,
            "username": current_user.username,
            "role": current_user.role
        },
        request
    )