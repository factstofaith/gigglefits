"""
Authentication module for the TAP Integration Platform
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.config import settings
from db.base import get_db
from db.models import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Token(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Token data model"""
    username: Optional[str] = None
    tenant_id: Optional[str] = None
    role: Optional[str] = None
    bypass_mfa: bool = False

def verify_password(plain_password, hashed_password):
    """Verify password against hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hash password"""
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str):
    """Authenticate a user by username and password"""
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.hashed_password:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get the current user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        # Add expiration check
        if "exp" in payload and datetime.utcnow() > datetime.fromtimestamp(payload["exp"]):
            raise credentials_exception
            
        token_data = TokenData(
            username=username, 
            tenant_id=payload.get("tenant_id"),
            role=payload.get("role"),
            bypass_mfa=payload.get("bypass_mfa", False)
        )
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Verify that the current user is active"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_admin_user(current_user: User = Depends(get_current_active_user)):
    """Verify that the current user is an admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

async def verify_mfa_if_required(user: User, token_data: TokenData = None, code: str = None):
    """
    Verify MFA if required for user
    
    Args:
        user: The user to verify MFA for
        token_data: Optional token data containing bypass_mfa flag
        code: The MFA code to verify
        
    Returns:
        True if MFA is not required or was successfully verified, False otherwise
    
    Raises:
        HTTPException if MFA is required but no code was provided or code is invalid
    """
    # Check token data for bypass_mfa flag first (for API calls with existing token)
    if token_data and token_data.bypass_mfa:
        return True
        
    # If token doesn't have bypass flag, check user object (for direct MFA verification)
    if hasattr(user, 'bypass_mfa') and user.bypass_mfa:
        return True
        
    # Get MFA status for user
    from modules.users.service import MFAService
    from db.base import SessionLocal
    
    mfa_service = MFAService(SessionLocal())
    mfa_status = mfa_service.get_mfa_status(user)
    
    # If MFA is enabled and no code provided, require MFA
    if mfa_status["enabled"] and not code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="MFA code required",
            headers={"WWW-Authenticate": "MFA-Required"},
        )
    
    # If MFA is enabled and code provided, verify code
    if mfa_status["enabled"] and code:
        return mfa_service.verify_mfa_code(user, code)
    
    # MFA not enabled, no verification needed
    return True

async def get_user_with_permissions(role_required: str = None, current_user: User = Depends(get_current_active_user)):
    """Check if user has required permissions based on role"""
    if role_required and current_user.role.value != role_required:
        # Allow higher role levels
        if role_required == "user" and current_user.role.value in ["admin", "super_admin"]:
            return current_user
        if role_required == "admin" and current_user.role.value == "super_admin":
            return current_user
        
        raise HTTPException(
            status_code=403,
            detail=f"Action requires {role_required} role"
        )
    return current_user