"""
Authentication Service for TAP Integration Platform

This module provides standardized authentication services for the TAP Integration Platform,
including token generation, validation, and MFA handling.
"""

import logging
import uuid
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple, List

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from jose import jwt, JWTError
from passlib.context import CryptContext

from db.models import User, UserRole, UserLoginHistory as LoginHistory, UserLoginHistory as LoginAttempt, MFASettings
from core.config_factory import get_config
from core.config import get_settings

# Get settings
settings = get_settings()
from core.auth import verify_password, create_access_token


logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

class AuthService:
    """
    Authentication service for handling user authentication, tokens, and MFA.
    
    This service handles the complete authentication flow, including:
    - User login with username/password
    - MFA verification
    - Token generation and validation
    - Token refresh
    - Login history tracking
    """
    
    def __init__(self, db: Session):
        """
        Initialize the authentication service.
        
        Args:
            db: Database session
        """
        self.db = db
    
    def login(self, username: str, password: str) -> Dict[str, Any]:
        """
        Authenticate a user with username and password.
        
        Args:
            username: User's username or email
            password: User's password
            
        Returns:
            Dict containing authentication result
            
        Raises:
            HTTPException: If authentication fails
        """
        # Check if username is an email or username
        if '@' in username:
            user = self.db.query(User).filter(User.email == username).first()
        else:
            user = self.db.query(User).filter(User.username == username).first()
        
        # User not found
        if not user:
            # Record failed login attempt
            self._record_login_attempt(username, False, "User not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )
        
        # Check if user is active
        if not user.is_active:
            self._record_login_attempt(username, False, "Inactive user")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive",
            )
        
        # Verify password
        if not verify_password(password, user.hashed_password):
            self._record_login_attempt(username, False, "Invalid password")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )
        
        # Check if MFA is required
        if getattr(user, 'mfa_enabled', False):
            # Generate and return MFA token for second step
            mfa_token = self._generate_mfa_token(user)
            self._record_login_attempt(username, True, "MFA required")
            
            return {
                "mfa_required": True,
                "mfa_token": mfa_token,
                "user_id": str(user.id)
            }
        
        # Generate tokens
        access_token, refresh_token = self._generate_tokens(user)
        
        # Record successful login
        self._record_login_history(user, True, "Login successful")
        
        # Create user profile response without sensitive information
        user_profile = {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "name": getattr(user, 'name', None),
            "role": user.role,
            "is_active": user.is_active,
            "tenant_id": getattr(user, 'tenant_id', None),
            "mfa_enabled": getattr(user, 'mfa_enabled', False),
            "last_login": datetime.now(timezone.utc)
        }
        
        # Return authentication result
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_profile
        }
    
    def verify_mfa(self, user_id: str, mfa_token: str, mfa_code: str) -> Dict[str, Any]:
        """
        Verify MFA code and complete the login process.
        
        Args:
            user_id: User ID
            mfa_token: Temporary MFA token
            mfa_code: MFA verification code
            
        Returns:
            Dict containing authentication result
            
        Raises:
            HTTPException: If MFA verification fails
        """
        # Validate MFA token
        try:
            payload = jwt.decode(
                mfa_token, 
                settings.SECRET_KEY, 
                algorithms=["HS256"],
                options={"verify_exp": True}
            )
            
            token_user_id = payload.get("sub")
            token_type = payload.get("type")
            
            if token_user_id != user_id or token_type != "mfa":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid MFA token",
                )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired MFA token",
            )
        
        # Get user from database
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Verify MFA code
        from modules.users.service import MFAService
        mfa_service = MFAService(self.db)
        
        if not mfa_service.verify_mfa_code(user, mfa_code):
            self._record_login_attempt(user.username, False, "Invalid MFA code")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid MFA code",
            )
        
        # Generate tokens
        access_token, refresh_token = self._generate_tokens(user)
        
        # Record successful login
        self._record_login_history(user, True, "MFA verification successful")
        
        # Create user profile response without sensitive information
        user_profile = {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "name": getattr(user, 'name', None),
            "role": user.role,
            "is_active": user.is_active,
            "tenant_id": getattr(user, 'tenant_id', None),
            "mfa_enabled": True,
            "last_login": datetime.now(timezone.utc)
        }
        
        # Return authentication result
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_profile
        }
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh access token using refresh token.
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            Dict containing new tokens
            
        Raises:
            HTTPException: If refresh token is invalid
        """
        try:
            # Decode refresh token
            payload = jwt.decode(
                refresh_token, 
                settings.REFRESH_TOKEN_SECRET or settings.SECRET_KEY, 
                algorithms=["HS256"]
            )
            
            token_type = payload.get("type")
            username = payload.get("sub")
            
            # Verify it's a refresh token
            if token_type != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token",
                )
            
            # Get user from database
            user = self.db.query(User).filter(User.username == username).first()
            if not user or not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found or inactive",
                )
            
            # Generate new tokens
            access_token, new_refresh_token = self._generate_tokens(user)
            
            # Log refresh
            logger.info(f"Token refreshed for user {user.username}")
            
            return {
                "access_token": access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer"
            }
            
        except JWTError as e:
            logger.error(f"Token refresh error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
    
    def validate_token(self, token: str) -> Dict[str, Any]:
        """
        Validate access token.
        
        Args:
            token: Access token
            
        Returns:
            Dict containing token validity and user info
            
        Raises:
            HTTPException: If token is invalid
        """
        try:
            # Decode token
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=["HS256"],
                options={"verify_exp": True}
            )
            
            username = payload.get("sub")
            expires_at = datetime.fromtimestamp(payload.get("exp"), tz=timezone.utc)
            user_id = payload.get("user_id")
            role = payload.get("role")
            
            return {
                "valid": True,
                "user_id": user_id,
                "username": username,
                "role": role,
                "expires_at": expires_at
            }
            
        except JWTError:
            return {"valid": False}
    
    def logout(self, token: str = None, all_devices: bool = False) -> Dict[str, Any]:
        """
        Log out user by invalidating tokens.
        
        In a stateless JWT system, logging out is handled client-side by removing
        tokens. However, we can implement a token blacklist for additional security.
        
        Args:
            token: Access token (optional)
            all_devices: Whether to invalidate all tokens for the user
            
        Returns:
            Dict containing logout result
        """
        # In a real implementation, you would add the token to a blocklist
        # For now, we'll just return a success message
        if token:
            try:
                # Try to extract user info from token for logging
                payload = jwt.decode(
                    token, 
                    settings.SECRET_KEY, 
                    algorithms=["HS256"],
                    options={"verify_signature": True, "verify_exp": False}
                )
                username = payload.get("sub")
                logger.info(f"Logout for user {username}")
            except JWTError:
                pass
        
        return {"success": True, "message": "Logged out successfully"}
    
    def _generate_tokens(self, user: User) -> Tuple[str, str]:
        """
        Generate access and refresh tokens for user.
        
        Args:
            user: User object
            
        Returns:
            Tuple of (access_token, refresh_token)
        """
        # Create token data
        token_data = {
            "sub": user.username,
            "user_id": str(user.id),
            "tenant_id": getattr(user, "tenant_id", None),
            "role": user.role
        }
        
        # Add MFA bypass flag if applicable
        if hasattr(user, "bypass_mfa") and user.bypass_mfa:
            token_data["bypass_mfa"] = True
        
        # Access token expires in 30 minutes by default
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES or 30)
        access_token = create_access_token(token_data, access_token_expires)
        
        # Refresh token expires in 7 days by default
        refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS or 7)
        
        # Add refresh token type and expiration
        refresh_token_data = token_data.copy()
        refresh_token_data["type"] = "refresh"
        
        refresh_token = jwt.encode(
            {
                **refresh_token_data,
                "exp": datetime.now(timezone.utc) + refresh_token_expires
            },
            settings.REFRESH_TOKEN_SECRET or settings.SECRET_KEY,
            algorithm="HS256"
        )
        
        return access_token, refresh_token
    
    def _generate_mfa_token(self, user: User) -> str:
        """
        Generate temporary MFA token.
        
        Args:
            user: User object
            
        Returns:
            MFA token string
        """
        # MFA token expires in 5 minutes
        expires = datetime.now(timezone.utc) + timedelta(minutes=5)
        
        # Create token with MFA type and short expiration
        mfa_token_data = {
            "sub": str(user.id),
            "type": "mfa",
            "exp": expires.timestamp()
        }
        
        mfa_token = jwt.encode(
            mfa_token_data,
            get_config().SECRET_KEY,
            algorithm="HS256"
        )
        
        return mfa_token
    
    def _record_login_attempt(self, username: str, success: bool, message: str) -> None:
        """
        Record login attempt for security monitoring.
        
        Args:
            username: Username that attempted login
            success: Whether the attempt was successful
            message: Message describing the attempt
        """
        try:
            # Create login attempt record
            login_attempt = LoginAttempt(
                username=username,
                success=success,
                message=message,
                timestamp=datetime.now(timezone.utc),
                ip_address="127.0.0.1"  # In a real implementation, get from request
            )
            
            self.db.add(login_attempt)
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error recording login attempt: {str(e)}")
            self.db.rollback()
    
    def _record_login_history(self, user: User, success: bool, message: str) -> None:
        """
        Record successful login in user's login history.
        
        Args:
            user: User object
            success: Whether the login was successful
            message: Message describing the login
        """
        try:
            # Create login history record
            login_history = LoginHistory(
                user_id=user.id,
                success=success,
                message=message,
                timestamp=datetime.now(timezone.utc),
                ip_address="127.0.0.1",  # In a real implementation, get from request
                user_agent="Unknown"     # In a real implementation, get from request
            )
            
            self.db.add(login_history)
            
            # Update user's last login time
            user.last_login = datetime.now(timezone.utc)
            
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error recording login history: {str(e)}")
            self.db.rollback()