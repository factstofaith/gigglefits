"""
Authentication models for the TAP Integration Platform

This module contains all the data models related to the authentication system,
including request and response models for login, token refresh, and MFA verification.
"""

from typing import Optional, Dict, Any, List, Union
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role enum"""
    ADMIN = "admin"
    USER = "user"
    READ_ONLY = "read_only"


class UserStatus(str, Enum):
    """User status enum"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class Token(BaseModel):
    """Token response model for OAuth2"""
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = Field(default=1800, description="Token expiration time in seconds")


class TokenData(BaseModel):
    """Token data model"""
    username: Optional[str] = None
    user_id: Optional[str] = None
    tenant_id: Optional[str] = None
    role: Optional[str] = None
    bypass_mfa: bool = False
    exp: Optional[int] = None


class UserProfile(BaseModel):
    """User profile data"""
    id: str
    username: str
    email: str
    name: Optional[str] = None
    role: UserRole
    tenant_id: Optional[str] = None
    is_active: bool = True
    mfa_enabled: bool = False
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class LoginRequest(BaseModel):
    """Login request model"""
    username: str
    password: str
    remember_me: bool = False
    set_cookie: bool = True
    mfa_code: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "username": "user@example.com",
                "password": "SecurePassword123",
                "remember_me": True,
                "set_cookie": True
            }
        }


class LoginResponse(BaseModel):
    """Login response model"""
    success: bool
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: Optional[str] = None
    expires_in: Optional[int] = None
    user: Optional[UserProfile] = None
    mfa_required: bool = False
    mfa_token: Optional[str] = None


class RefreshRequest(BaseModel):
    """Token refresh request model"""
    refresh_token: Optional[str] = None
    # The refresh token can also come from a cookie


class MFAVerifyRequest(BaseModel):
    """MFA verification request model"""
    mfa_code: str
    mfa_token: str
    user_id: str
    remember_me: bool = False
    set_cookie: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "mfa_code": "123456",
                "mfa_token": "temp_token_123",
                "user_id": "user_123",
                "remember_me": True,
                "set_cookie": True
            }
        }


class MFAResponse(BaseModel):
    """MFA verification response model"""
    success: bool
    message: str
    qr_code: Optional[str] = None
    secret: Optional[str] = None
    recovery_codes: Optional[List[str]] = None


class LogoutRequest(BaseModel):
    """Logout request model"""
    refresh_token: Optional[str] = None
    # The refresh token can also come from a cookie
    all_devices: bool = False


class UserResponse(BaseModel):
    """User response model"""
    id: str
    username: str
    email: EmailStr
    name: Optional[str] = None
    role: str
    tenant_id: Optional[str] = None
    is_active: bool
    mfa_enabled: bool = False
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TokenValidateResponse(BaseModel):
    """Token validation response"""
    valid: bool
    user_id: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None
    expires_at: Optional[datetime] = None


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    error_description: str
    error_code: Optional[str] = None
    status_code: int = 400


class ResponseMetadata(BaseModel):
    """Standard response metadata"""
    timestamp: datetime
    request_id: str
    api_version: str = "1.0"


class StandardResponse(BaseModel):
    """Standard API response model"""
    data: Any
    metadata: ResponseMetadata


class ErrorDetail(BaseModel):
    """Error detail model"""
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class ErrorResponseModel(BaseModel):
    """Standard error response model"""
    error: ErrorDetail
    metadata: ResponseMetadata