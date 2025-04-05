"""
Authentication hooks for security monitoring.

This module provides hooks to integrate authentication processes
with the security monitoring system.

Features:
- Login success and failure tracking
- Logout monitoring
- Multi-factor authentication event logging
- Account lockout and unlock monitoring
- Password change and reset auditing
- Permission change tracking
- Comprehensive error handling
- Detailed logging with context information
- Performance monitoring

Each function follows a standardized pattern:
1. Extract client information from the request
2. Create event details with relevant context
3. Log the event with appropriate security level
4. Handle any exceptions with detailed error reporting
"""

import logging
import time
from typing import Optional, Dict, Any, Tuple, cast
from fastapi import Request, Response
from datetime import datetime, timezone
import traceback

from .monitoring import (
    SecurityEventType, 
    SecurityAlertLevel, 
    log_security_event,
    check_account_status
)

# Setup logging
logger = logging.getLogger(__name__)

# Constants
SLOW_OPERATION_THRESHOLD_MS = 50  # Threshold for logging slow operations (milliseconds)


def _extract_client_info(request: Request) -> Tuple[str, Optional[str]]:
    """
    Extract client IP address and user agent from request.
    
    Args:
        request (Request): The incoming FastAPI request
        
    Returns:
        Tuple[str, Optional[str]]: A tuple of (client_ip, user_agent)
    """
    # Get client IP - check X-Forwarded-For first (for proxy scenarios)
    client_ip = "127.0.0.1"  # Default fallback
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    elif request.client and hasattr(request.client, "host"):
        client_ip = request.client.host
    
    # Get user agent
    user_agent = request.headers.get("user-agent")
    
    return client_ip, user_agent


def log_login_success(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    auth_method: str = "password",
    auth_details: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Log a successful login event.
    
    This function records successful authentication events with detailed context
    information for security monitoring and auditing purposes.
    
    Args:
        request (Request): The incoming FastAPI request
        user_id (str): User ID of the authenticated user
        username (str): Username of the authenticated user
        tenant_id (Optional[str], optional): Tenant ID of the authenticated user.
            Defaults to None.
        auth_method (str, optional): Authentication method used.
            Valid values: "password", "oauth", "mfa", "sso", "token".
            Defaults to "password".
        auth_details (Optional[Dict[str, Any]], optional): Additional authentication details.
            These will be merged with standard details. Defaults to None.
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        from fastapi import Depends, Request
        
        @app.post("/login")
        async def login(
            request: Request, 
            credentials: LoginCredentials
        ):
            # ... authentication logic ...
            
            # Log successful login
            log_login_success(
                request=request,
                user_id=user.id,
                username=user.username,
                tenant_id=user.tenant_id,
                auth_method="password"
            )
            
            # ... create and return token ...
        ```
    """
    operation_id = f"login_success_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Validate input parameters
        if not isinstance(user_id, str) or not user_id:
            logger.error(f"[{operation_id}] Invalid user_id parameter: {user_id}")
            return False
            
        if not isinstance(username, str) or not username:
            logger.error(f"[{operation_id}] Invalid username parameter: {username}")
            return False
            
        if tenant_id is not None and (not isinstance(tenant_id, str) or not tenant_id):
            logger.error(f"[{operation_id}] Invalid tenant_id parameter: {tenant_id}")
            return False
            
        valid_auth_methods = ["password", "oauth", "mfa", "sso", "token"]
        if not isinstance(auth_method, str) or auth_method not in valid_auth_methods:
            logger.error(f"[{operation_id}] Invalid auth_method parameter: {auth_method}")
            return False
        
        # Extract client information
        client_ip, user_agent = _extract_client_info(request)
        
        # Log the operation start
        logger.debug(f"[{operation_id}] Logging successful login for user {username} (ID: {user_id}) from IP {client_ip}")
        
        # Prepare event details
        details = {
            "username": username,
            "auth_method": auth_method,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operation_id": operation_id
        }
        
        # Add any additional details
        if auth_details and isinstance(auth_details, dict):
            details.update(auth_details)
        
        # Log the event
        log_security_event(
            event_type=SecurityEventType.LOGIN_SUCCESS,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            alert_level=SecurityAlertLevel.INFO,
            details=details
        )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{operation_id}] Slow login success logging: {elapsed_ms}ms")
        else:
            logger.debug(f"[{operation_id}] Login success logged in {elapsed_ms}ms")
        
        return True
        
    except Exception as e:
        # Log the error with traceback
        logger.error(f"[{operation_id}] Error logging login success: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return False


def log_login_failure(
    request: Request,
    username: Optional[str],
    tenant_id: Optional[str] = None,
    reason: str = "Invalid credentials",
    auth_method: str = "password",
    auth_details: Optional[Dict[str, Any]] = None,
    alert_level: SecurityAlertLevel = SecurityAlertLevel.LOW
) -> bool:
    """
    Log a failed login event.
    
    This function records failed authentication attempts with detailed context
    information for security monitoring and auditing purposes. It helps detect
    potential brute force attacks and unauthorized access attempts.
    
    Args:
        request (Request): The incoming FastAPI request
        username (Optional[str]): Username that failed to authenticate (can be None for anonymous attempts)
        tenant_id (Optional[str], optional): Tenant ID from the login attempt. Defaults to None.
        reason (str, optional): Reason for the failure. Defaults to "Invalid credentials".
            Common values: "Invalid credentials", "Account locked", "User not found", "MFA required"
        auth_method (str, optional): Authentication method used. Defaults to "password".
            Valid values: "password", "oauth", "mfa", "sso", "token"
        auth_details (Optional[Dict[str, Any]], optional): Additional authentication details.
            These will be merged with standard details. Defaults to None.
        alert_level (SecurityAlertLevel, optional): Alert level for the event. Defaults to LOW.
            This can be increased based on context (e.g., repeated failures, suspicious IP)
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        from fastapi import Depends, Request
        from backend.utils.security.monitoring import SecurityAlertLevel
        
        @app.post("/login")
        async def login(
            request: Request, 
            credentials: LoginCredentials
        ):
            # ... authentication logic ...
            
            # If authentication fails
            if not user_authenticated:
                # Log login failure - use MEDIUM level for suspicious patterns
                log_login_failure(
                    request=request,
                    username=credentials.username,
                    reason="Invalid credentials",
                    alert_level=SecurityAlertLevel.MEDIUM if suspicious else SecurityAlertLevel.LOW
                )
                return {"error": "Authentication failed"}
                
            # ... success logic ...
        ```
    """
    operation_id = f"login_failure_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Validate input parameters
        if username is not None and not isinstance(username, str):
            logger.error(f"[{operation_id}] Invalid username parameter type: {type(username)}")
            return False
            
        if tenant_id is not None and (not isinstance(tenant_id, str) or not tenant_id):
            logger.error(f"[{operation_id}] Invalid tenant_id parameter: {tenant_id}")
            return False
            
        if not isinstance(reason, str) or not reason:
            logger.error(f"[{operation_id}] Invalid reason parameter: {reason}")
            return False
            
        valid_auth_methods = ["password", "oauth", "mfa", "sso", "token"]
        if not isinstance(auth_method, str) or auth_method not in valid_auth_methods:
            logger.error(f"[{operation_id}] Invalid auth_method parameter: {auth_method}")
            return False
        
        # Extract client information
        client_ip, user_agent = _extract_client_info(request)
        
        # Log the operation start
        logger.debug(f"[{operation_id}] Logging login failure for username '{username}' from IP {client_ip}")
        
        # Prepare event details with required fields
        details = {
            "username": username,
            "auth_method": auth_method,
            "reason": reason,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operation_id": operation_id
        }
        
        # Add any additional details if they exist and are valid
        if auth_details and isinstance(auth_details, dict):
            details.update(auth_details)
        
        # Log the event
        log_security_event(
            event_type=SecurityEventType.LOGIN_FAILURE,
            user_id=None,  # User ID is typically unknown for login failures
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            alert_level=alert_level,
            details=details
        )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{operation_id}] Slow login failure logging: {elapsed_ms}ms")
        else:
            logger.debug(f"[{operation_id}] Login failure logged in {elapsed_ms}ms")
        
        return True
        
    except Exception as e:
        # Log the error with traceback for better diagnostics
        logger.error(f"[{operation_id}] Error logging login failure: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return False


def log_logout(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    logout_type: str = "user_initiated"
) -> bool:
    """
    Log a logout event.
    
    This function records user logout events with detailed context information 
    for security monitoring and session tracking purposes.
    
    Args:
        request (Request): The incoming FastAPI request
        user_id (str): User ID of the authenticated user
        username (str): Username of the authenticated user
        tenant_id (Optional[str], optional): Tenant ID of the authenticated user. 
            Defaults to None.
        logout_type (str, optional): Type of logout event. 
            Valid values: "user_initiated", "session_expired", "admin_terminated", "system_logout"
            Defaults to "user_initiated".
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        from fastapi import Depends, Request
        
        @app.post("/logout")
        async def logout(
            request: Request,
            current_user: User = Depends(get_current_user)
        ):
            # Log the logout event
            log_logout(
                request=request,
                user_id=current_user.id,
                username=current_user.username,
                tenant_id=current_user.tenant_id
            )
            
            # ... invalidate token logic ...
            return {"message": "Logged out successfully"}
        ```
    """
    operation_id = f"logout_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Validate input parameters
        if not isinstance(user_id, str) or not user_id:
            logger.error(f"[{operation_id}] Invalid user_id parameter: {user_id}")
            return False
            
        if not isinstance(username, str) or not username:
            logger.error(f"[{operation_id}] Invalid username parameter: {username}")
            return False
            
        if tenant_id is not None and (not isinstance(tenant_id, str) or not tenant_id):
            logger.error(f"[{operation_id}] Invalid tenant_id parameter: {tenant_id}")
            return False
            
        valid_logout_types = ["user_initiated", "session_expired", "admin_terminated", "system_logout"]
        if not isinstance(logout_type, str) or logout_type not in valid_logout_types:
            logger.error(f"[{operation_id}] Invalid logout_type parameter: {logout_type}")
            return False
        
        # Extract client information
        client_ip, user_agent = _extract_client_info(request)
        
        # Log the operation start
        logger.debug(f"[{operation_id}] Logging logout for user {username} (ID: {user_id}) from IP {client_ip}")
        
        # Log the event
        log_security_event(
            event_type=SecurityEventType.LOGOUT,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            alert_level=SecurityAlertLevel.INFO,
            details={
                "username": username,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "logout_type": logout_type,
                "operation_id": operation_id
            }
        )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{operation_id}] Slow logout logging: {elapsed_ms}ms")
        else:
            logger.debug(f"[{operation_id}] Logout logged in {elapsed_ms}ms")
        
        return True
        
    except Exception as e:
        # Log the error with traceback
        logger.error(f"[{operation_id}] Error logging logout: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return False


def log_mfa_challenge(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    mfa_type: str = "totp",
    channel: Optional[str] = None
) -> bool:
    """
    Log an MFA challenge event.
    
    This function records when a multi-factor authentication challenge is issued
    to a user. This is important for security auditing and tracking MFA usage patterns.
    
    Args:
        request (Request): The incoming FastAPI request
        user_id (str): User ID of the authenticated user
        username (str): Username of the authenticated user
        tenant_id (Optional[str], optional): Tenant ID of the authenticated user. 
            Defaults to None.
        mfa_type (str, optional): Type of MFA challenge. Defaults to "totp".
            Valid values: "totp", "email", "sms", "app", "hardware_token", "push"
        channel (Optional[str], optional): Specific channel used for the MFA challenge.
            For example, "personal_email", "work_email", "mobile", etc.
            Defaults to None.
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        from fastapi import Depends, Request
        
        @app.post("/mfa/challenge")
        async def initiate_mfa(
            request: Request,
            current_user: User = Depends(get_current_user)
        ):
            # ... generate MFA challenge ...
            
            # Log the MFA challenge
            log_mfa_challenge(
                request=request,
                user_id=current_user.id,
                username=current_user.username,
                tenant_id=current_user.tenant_id,
                mfa_type="email",
                channel="work_email"
            )
            
            return {"message": "MFA challenge sent"}
        ```
    """
    operation_id = f"mfa_challenge_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Validate input parameters
        if not isinstance(user_id, str) or not user_id:
            logger.error(f"[{operation_id}] Invalid user_id parameter: {user_id}")
            return False
            
        if not isinstance(username, str) or not username:
            logger.error(f"[{operation_id}] Invalid username parameter: {username}")
            return False
            
        if tenant_id is not None and (not isinstance(tenant_id, str) or not tenant_id):
            logger.error(f"[{operation_id}] Invalid tenant_id parameter: {tenant_id}")
            return False
            
        valid_mfa_types = ["totp", "email", "sms", "app", "hardware_token", "push"]
        if not isinstance(mfa_type, str) or mfa_type not in valid_mfa_types:
            logger.error(f"[{operation_id}] Invalid mfa_type parameter: {mfa_type}")
            return False
            
        if channel is not None and not isinstance(channel, str):
            logger.error(f"[{operation_id}] Invalid channel parameter: {channel}")
            return False
        
        # Extract client information
        client_ip, user_agent = _extract_client_info(request)
        
        # Log the operation start
        logger.debug(f"[{operation_id}] Logging MFA challenge for user {username} (ID: {user_id}) from IP {client_ip}")
        
        # Prepare event details
        details = {
            "username": username,
            "mfa_type": mfa_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operation_id": operation_id
        }
        
        # Add channel if provided
        if channel:
            details["channel"] = channel
        
        # Log the event
        log_security_event(
            event_type=SecurityEventType.MFA_CHALLENGE,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            alert_level=SecurityAlertLevel.INFO,
            details=details
        )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{operation_id}] Slow MFA challenge logging: {elapsed_ms}ms")
        else:
            logger.debug(f"[{operation_id}] MFA challenge logged in {elapsed_ms}ms")
        
        return True
        
    except Exception as e:
        # Log the error with traceback
        logger.error(f"[{operation_id}] Error logging MFA challenge: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return False


def log_mfa_success(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    mfa_type: str = "totp",
    channel: Optional[str] = None,
    challenge_id: Optional[str] = None
) -> bool:
    """
    Log a successful MFA verification event.
    
    This function records when a multi-factor authentication verification succeeds.
    It's important for security auditing and completing the MFA challenge-response flow tracking.
    
    Args:
        request (Request): The incoming FastAPI request
        user_id (str): User ID of the authenticated user
        username (str): Username of the authenticated user
        tenant_id (Optional[str], optional): Tenant ID of the authenticated user. 
            Defaults to None.
        mfa_type (str, optional): Type of MFA verification. Defaults to "totp".
            Valid values: "totp", "email", "sms", "app", "hardware_token", "push"
        channel (Optional[str], optional): Specific channel used for the MFA verification.
            For example, "personal_email", "work_email", "mobile", etc.
            Defaults to None.
        challenge_id (Optional[str], optional): ID of the associated MFA challenge.
            This helps correlate challenge and response events. Defaults to None.
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        from fastapi import Depends, Request
        
        @app.post("/mfa/verify")
        async def verify_mfa(
            request: Request,
            verification: MfaVerification,
            current_user: User = Depends(get_current_user_partial)
        ):
            # ... verify MFA code ...
            
            # Log the successful MFA verification
            log_mfa_success(
                request=request,
                user_id=current_user.id,
                username=current_user.username,
                tenant_id=current_user.tenant_id,
                mfa_type="totp",
                challenge_id=verification.challenge_id
            )
            
            return {"message": "MFA verification successful"}
        ```
    """
    operation_id = f"mfa_success_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Validate input parameters
        if not isinstance(user_id, str) or not user_id:
            logger.error(f"[{operation_id}] Invalid user_id parameter: {user_id}")
            return False
            
        if not isinstance(username, str) or not username:
            logger.error(f"[{operation_id}] Invalid username parameter: {username}")
            return False
            
        if tenant_id is not None and (not isinstance(tenant_id, str) or not tenant_id):
            logger.error(f"[{operation_id}] Invalid tenant_id parameter: {tenant_id}")
            return False
            
        valid_mfa_types = ["totp", "email", "sms", "app", "hardware_token", "push"]
        if not isinstance(mfa_type, str) or mfa_type not in valid_mfa_types:
            logger.error(f"[{operation_id}] Invalid mfa_type parameter: {mfa_type}")
            return False
            
        if channel is not None and not isinstance(channel, str):
            logger.error(f"[{operation_id}] Invalid channel parameter: {channel}")
            return False
            
        if challenge_id is not None and not isinstance(challenge_id, str):
            logger.error(f"[{operation_id}] Invalid challenge_id parameter: {challenge_id}")
            return False
        
        # Extract client information
        client_ip, user_agent = _extract_client_info(request)
        
        # Log the operation start
        logger.debug(f"[{operation_id}] Logging successful MFA verification for user {username} (ID: {user_id}) from IP {client_ip}")
        
        # Prepare event details
        details = {
            "username": username,
            "mfa_type": mfa_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operation_id": operation_id
        }
        
        # Add optional fields if provided
        if channel:
            details["channel"] = channel
        if challenge_id:
            details["challenge_id"] = challenge_id
        
        # Log the event
        log_security_event(
            event_type=SecurityEventType.MFA_SUCCESS,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            alert_level=SecurityAlertLevel.INFO,
            details=details
        )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{operation_id}] Slow MFA success logging: {elapsed_ms}ms")
        else:
            logger.debug(f"[{operation_id}] MFA success logged in {elapsed_ms}ms")
        
        return True
        
    except Exception as e:
        # Log the error with traceback
        logger.error(f"[{operation_id}] Error logging MFA success: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return False


def log_mfa_failure(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    mfa_type: str = "totp",
    reason: str = "Invalid code",
    channel: Optional[str] = None,
    challenge_id: Optional[str] = None,
    alert_level: SecurityAlertLevel = SecurityAlertLevel.MEDIUM,
    attempt_count: Optional[int] = None
) -> bool:
    """
    Log a failed MFA verification event.
    
    This function records when a multi-factor authentication verification fails.
    It helps in monitoring potential security threats and identifying issues in
    the MFA flow.
    
    Args:
        request (Request): The incoming FastAPI request
        user_id (str): User ID of the authenticated user
        username (str): Username of the authenticated user
        tenant_id (Optional[str], optional): Tenant ID of the authenticated user. 
            Defaults to None.
        mfa_type (str, optional): Type of MFA verification. Defaults to "totp".
            Valid values: "totp", "email", "sms", "app", "hardware_token", "push"
        reason (str, optional): Reason for the failure. Defaults to "Invalid code".
            Common values: "Invalid code", "Expired code", "Too many attempts",
            "Code already used"
        channel (Optional[str], optional): Specific channel used for the MFA verification.
            For example, "personal_email", "work_email", "mobile", etc.
            Defaults to None.
        challenge_id (Optional[str], optional): ID of the associated MFA challenge.
            This helps correlate challenge and response events. Defaults to None.
        alert_level (SecurityAlertLevel, optional): Alert level for the event. 
            Defaults to MEDIUM. Can be increased to HIGH for suspicious patterns.
        attempt_count (Optional[int], optional): Number of failed attempts.
            Defaults to None.
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        from fastapi import Depends, Request
        from backend.utils.security.monitoring import SecurityAlertLevel
        
        @app.post("/mfa/verify")
        async def verify_mfa(
            request: Request,
            verification: MfaVerification,
            current_user: User = Depends(get_current_user_partial)
        ):
            # ... verify MFA code ...
            
            # If verification fails
            if not verified:
                # Determine alert level based on context
                alert_level = SecurityAlertLevel.HIGH if attempt_count > 3 else SecurityAlertLevel.MEDIUM
                
                # Log the failed MFA verification
                log_mfa_failure(
                    request=request,
                    user_id=current_user.id,
                    username=current_user.username,
                    tenant_id=current_user.tenant_id,
                    mfa_type="totp",
                    reason="Invalid code",
                    challenge_id=verification.challenge_id,
                    alert_level=alert_level,
                    attempt_count=attempt_count
                )
                
                return {"error": "Invalid MFA code"}
        ```
    """
    operation_id = f"mfa_failure_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Validate input parameters
        if not isinstance(user_id, str) or not user_id:
            logger.error(f"[{operation_id}] Invalid user_id parameter: {user_id}")
            return False
            
        if not isinstance(username, str) or not username:
            logger.error(f"[{operation_id}] Invalid username parameter: {username}")
            return False
            
        if tenant_id is not None and (not isinstance(tenant_id, str) or not tenant_id):
            logger.error(f"[{operation_id}] Invalid tenant_id parameter: {tenant_id}")
            return False
            
        valid_mfa_types = ["totp", "email", "sms", "app", "hardware_token", "push"]
        if not isinstance(mfa_type, str) or mfa_type not in valid_mfa_types:
            logger.error(f"[{operation_id}] Invalid mfa_type parameter: {mfa_type}")
            return False
            
        if not isinstance(reason, str) or not reason:
            logger.error(f"[{operation_id}] Invalid reason parameter: {reason}")
            return False
            
        if channel is not None and not isinstance(channel, str):
            logger.error(f"[{operation_id}] Invalid channel parameter: {channel}")
            return False
            
        if challenge_id is not None and not isinstance(challenge_id, str):
            logger.error(f"[{operation_id}] Invalid challenge_id parameter: {challenge_id}")
            return False
            
        if attempt_count is not None and (not isinstance(attempt_count, int) or attempt_count < 1):
            logger.error(f"[{operation_id}] Invalid attempt_count parameter: {attempt_count}")
            return False
        
        # Extract client information
        client_ip, user_agent = _extract_client_info(request)
        
        # Log the operation start
        logger.debug(f"[{operation_id}] Logging failed MFA verification for user {username} (ID: {user_id}) from IP {client_ip}")
        
        # Prepare event details
        details = {
            "username": username,
            "mfa_type": mfa_type,
            "reason": reason,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operation_id": operation_id
        }
        
        # Add optional fields if provided
        if channel:
            details["channel"] = channel
        if challenge_id:
            details["challenge_id"] = challenge_id
        if attempt_count is not None:
            details["attempt_count"] = attempt_count
        
        # Log the event
        log_security_event(
            event_type=SecurityEventType.MFA_FAILURE,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            alert_level=alert_level,
            details=details
        )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{operation_id}] Slow MFA failure logging: {elapsed_ms}ms")
        else:
            logger.debug(f"[{operation_id}] MFA failure logged in {elapsed_ms}ms")
        
        return True
        
    except Exception as e:
        # Log the error with traceback
        logger.error(f"[{operation_id}] Error logging MFA failure: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return False


def log_account_locked(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    reason: str = "Too many failed login attempts",
    lock_duration_minutes: Optional[int] = None,
    triggered_by_user_id: Optional[str] = None,
    alert_level: SecurityAlertLevel = SecurityAlertLevel.HIGH
) -> bool:
    """
    Log an account locked event.
    
    This function records when a user account is locked, either automatically
    due to security policies or manually by an administrator. This is important 
    for security auditing and user support.
    
    Args:
        request (Request): The incoming FastAPI request
        user_id (str): User ID of the locked account
        username (str): Username of the locked account
        tenant_id (Optional[str], optional): Tenant ID of the locked account.
            Defaults to None.
        reason (str, optional): Reason for locking the account.
            Defaults to "Too many failed login attempts".
            Common values: "Too many failed login attempts", "Suspicious activity",
            "Administrative action", "Compliance policy", "Security protocol"
        lock_duration_minutes (Optional[int], optional): How long the account is locked
            in minutes. If None, the lock is indefinite until manually resolved.
            Defaults to None.
        triggered_by_user_id (Optional[str], optional): User ID of the administrator
            who triggered the lock, if applicable. Defaults to None.
        alert_level (SecurityAlertLevel, optional): Alert level for the event.
            Defaults to HIGH.
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        from fastapi import Depends, Request
        
        @app.post("/admin/lock-account")
        async def lock_user_account(
            request: Request,
            user_id: str,
            reason: str,
            current_admin: User = Depends(get_current_admin)
        ):
            # ... lock account logic ...
            
            # Get user details
            user = await get_user_by_id(user_id)
            
            # Log the account locked event
            log_account_locked(
                request=request,
                user_id=user.id,
                username=user.username,
                tenant_id=user.tenant_id,
                reason=reason,
                triggered_by_user_id=current_admin.id
            )
            
            return {"message": "Account locked successfully"}
        ```
    """
    operation_id = f"account_locked_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Validate input parameters
        if not isinstance(user_id, str) or not user_id:
            logger.error(f"[{operation_id}] Invalid user_id parameter: {user_id}")
            return False
            
        if not isinstance(username, str) or not username:
            logger.error(f"[{operation_id}] Invalid username parameter: {username}")
            return False
            
        if tenant_id is not None and (not isinstance(tenant_id, str) or not tenant_id):
            logger.error(f"[{operation_id}] Invalid tenant_id parameter: {tenant_id}")
            return False
            
        if not isinstance(reason, str) or not reason:
            logger.error(f"[{operation_id}] Invalid reason parameter: {reason}")
            return False
            
        if lock_duration_minutes is not None and (not isinstance(lock_duration_minutes, int) or lock_duration_minutes < 1):
            logger.error(f"[{operation_id}] Invalid lock_duration_minutes parameter: {lock_duration_minutes}")
            return False
            
        if triggered_by_user_id is not None and (not isinstance(triggered_by_user_id, str) or not triggered_by_user_id):
            logger.error(f"[{operation_id}] Invalid triggered_by_user_id parameter: {triggered_by_user_id}")
            return False
        
        # Extract client information
        client_ip, user_agent = _extract_client_info(request)
        
        # Log the operation start
        logger.debug(f"[{operation_id}] Logging account locked for user {username} (ID: {user_id}) from IP {client_ip}")
        
        # Prepare event details
        details = {
            "username": username,
            "reason": reason,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operation_id": operation_id
        }
        
        # Add optional fields if provided
        if lock_duration_minutes is not None:
            details["lock_duration_minutes"] = lock_duration_minutes
            details["unlock_time"] = (datetime.now(timezone.utc) + timedelta(minutes=lock_duration_minutes)).isoformat()
            
        if triggered_by_user_id:
            details["triggered_by_user_id"] = triggered_by_user_id
            details["is_administrative_action"] = True
        else:
            details["is_administrative_action"] = False
        
        # Log the event
        log_security_event(
            event_type=SecurityEventType.ACCOUNT_LOCKED,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            alert_level=alert_level,
            details=details
        )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{operation_id}] Slow account locked logging: {elapsed_ms}ms")
        else:
            logger.debug(f"[{operation_id}] Account locked logged in {elapsed_ms}ms")
        
        return True
        
    except Exception as e:
        # Log the error with traceback
        logger.error(f"[{operation_id}] Error logging account locked: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return False


def log_account_unlocked(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    unlocked_by: Optional[str] = None,
    reason: Optional[str] = None,
    alert_level: SecurityAlertLevel = SecurityAlertLevel.MEDIUM
) -> bool:
    """
    Log an account unlocked event.
    
    This function records when a user account is unlocked, typically by an administrator
    or through an automatic time-based process. This is important for security auditing
    and user support.
    
    Args:
        request (Request): The incoming FastAPI request
        user_id (str): User ID of the unlocked account
        username (str): Username of the unlocked account
        tenant_id (Optional[str], optional): Tenant ID of the unlocked account.
            Defaults to None.
        unlocked_by (Optional[str], optional): User ID of the administrator who
            unlocked the account, or "system" for automatic unlocks. Defaults to None.
        reason (Optional[str], optional): Reason for unlocking the account.
            Common values: "Administrative action", "Timeout expired",
            "User verification completed", "Support request". Defaults to None.
        alert_level (SecurityAlertLevel, optional): Alert level for the event.
            Defaults to MEDIUM.
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        from fastapi import Depends, Request
        
        @app.post("/admin/unlock-account")
        async def unlock_user_account(
            request: Request,
            user_id: str,
            reason: str,
            current_admin: User = Depends(get_current_admin)
        ):
            # ... unlock account logic ...
            
            # Get user details
            user = await get_user_by_id(user_id)
            
            # Log the account unlocked event
            log_account_unlocked(
                request=request,
                user_id=user.id,
                username=user.username,
                tenant_id=user.tenant_id,
                unlocked_by=current_admin.id,
                reason=reason
            )
            
            return {"message": "Account unlocked successfully"}
        ```
    """
    operation_id = f"account_unlocked_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Validate input parameters
        if not isinstance(user_id, str) or not user_id:
            logger.error(f"[{operation_id}] Invalid user_id parameter: {user_id}")
            return False
            
        if not isinstance(username, str) or not username:
            logger.error(f"[{operation_id}] Invalid username parameter: {username}")
            return False
            
        if tenant_id is not None and (not isinstance(tenant_id, str) or not tenant_id):
            logger.error(f"[{operation_id}] Invalid tenant_id parameter: {tenant_id}")
            return False
            
        if unlocked_by is not None and not isinstance(unlocked_by, str):
            logger.error(f"[{operation_id}] Invalid unlocked_by parameter: {unlocked_by}")
            return False
            
        if reason is not None and not isinstance(reason, str):
            logger.error(f"[{operation_id}] Invalid reason parameter: {reason}")
            return False
        
        # Extract client information
        client_ip, user_agent = _extract_client_info(request)
        
        # Log the operation start
        logger.debug(f"[{operation_id}] Logging account unlocked for user {username} (ID: {user_id}) from IP {client_ip}")
        
        # Prepare event details
        details = {
            "username": username,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operation_id": operation_id
        }
        
        # Add optional fields if provided
        if unlocked_by:
            details["unlocked_by"] = unlocked_by
            details["is_administrative_action"] = unlocked_by != "system"
        else:
            details["is_administrative_action"] = False
            
        if reason:
            details["reason"] = reason
        
        # Log the event
        log_security_event(
            event_type=SecurityEventType.ACCOUNT_UNLOCKED,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            alert_level=alert_level,
            details=details
        )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{operation_id}] Slow account unlocked logging: {elapsed_ms}ms")
        else:
            logger.debug(f"[{operation_id}] Account unlocked logged in {elapsed_ms}ms")
        
        return True
        
    except Exception as e:
        # Log the error with traceback
        logger.error(f"[{operation_id}] Error logging account unlocked: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return False


def log_password_change(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    changed_by: Optional[str] = None,
    change_reason: Optional[str] = None,
    password_expires_days: Optional[int] = None
) -> bool:
    """
    Log a password change event.
    
    This function records when a user's password is changed, either by the user
    themselves or by an administrator. It's important for security auditing
    and compliance tracking.
    
    Args:
        request (Request): The incoming FastAPI request
        user_id (str): User ID of the account
        username (str): Username of the account
        tenant_id (Optional[str], optional): Tenant ID of the account.
            Defaults to None.
        changed_by (Optional[str], optional): User ID of the admin who changed 
            the password, if not self. Defaults to None.
        change_reason (Optional[str], optional): Reason for the password change.
            Common values: "User initiated", "Password expired", "Admin reset",
            "Security policy", "Suspicious activity". Defaults to None.
        password_expires_days (Optional[int], optional): Number of days until
            the new password expires. Defaults to None.
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        from fastapi import Depends, Request
        
        @app.post("/account/change-password")
        async def change_password(
            request: Request,
            password_data: PasswordChangeRequest,
            current_user: User = Depends(get_current_user)
        ):
            # ... password change logic ...
            
            # Log the password change event
            log_password_change(
                request=request,
                user_id=current_user.id,
                username=current_user.username,
                tenant_id=current_user.tenant_id,
                change_reason="User initiated",
                password_expires_days=90
            )
            
            return {"message": "Password changed successfully"}
        ```
    """
    operation_id = f"password_change_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Validate input parameters
        if not isinstance(user_id, str) or not user_id:
            logger.error(f"[{operation_id}] Invalid user_id parameter: {user_id}")
            return False
            
        if not isinstance(username, str) or not username:
            logger.error(f"[{operation_id}] Invalid username parameter: {username}")
            return False
            
        if tenant_id is not None and (not isinstance(tenant_id, str) or not tenant_id):
            logger.error(f"[{operation_id}] Invalid tenant_id parameter: {tenant_id}")
            return False
            
        if changed_by is not None and not isinstance(changed_by, str):
            logger.error(f"[{operation_id}] Invalid changed_by parameter: {changed_by}")
            return False
            
        if change_reason is not None and not isinstance(change_reason, str):
            logger.error(f"[{operation_id}] Invalid change_reason parameter: {change_reason}")
            return False
            
        if password_expires_days is not None and (not isinstance(password_expires_days, int) or password_expires_days < 0):
            logger.error(f"[{operation_id}] Invalid password_expires_days parameter: {password_expires_days}")
            return False
        
        # Extract client information
        client_ip, user_agent = _extract_client_info(request)
        
        # Determine if this is a self-change or admin change
        is_admin_change = changed_by and changed_by != user_id
        
        # Set alert level based on whether this is a self-change or admin change
        alert_level = SecurityAlertLevel.MEDIUM if is_admin_change else SecurityAlertLevel.INFO
        
        # Log the operation start
        logger.debug(f"[{operation_id}] Logging password change for user {username} (ID: {user_id}) from IP {client_ip}")
        
        # Prepare event details
        details = {
            "username": username,
            "changed_by": changed_by if is_admin_change else "self",
            "is_admin_change": is_admin_change,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operation_id": operation_id
        }
        
        # Add optional fields if provided
        if change_reason:
            details["change_reason"] = change_reason
            
        if password_expires_days is not None:
            details["password_expires_days"] = password_expires_days
            expiry_date = datetime.now(timezone.utc) + timedelta(days=password_expires_days)
            details["password_expiry_date"] = expiry_date.isoformat()
        
        # Log the event
        log_security_event(
            event_type=SecurityEventType.PASSWORD_CHANGE,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            alert_level=alert_level,
            details=details
        )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{operation_id}] Slow password change logging: {elapsed_ms}ms")
        else:
            logger.debug(f"[{operation_id}] Password change logged in {elapsed_ms}ms")
        
        return True
        
    except Exception as e:
        # Log the error with traceback
        logger.error(f"[{operation_id}] Error logging password change: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return False


def log_password_reset(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    reset_method: str = "email",
    initiated_by_user_id: Optional[str] = None,
    token_id: Optional[str] = None,
    expires_in_minutes: Optional[int] = None,
    alert_level: SecurityAlertLevel = SecurityAlertLevel.MEDIUM
) -> bool:
    """
    Log a password reset event.
    
    This function records when a password reset is initiated for a user account,
    typically through a recovery flow. This is important for security auditing,
    detecting potential account takeover attempts, and tracking support operations.
    
    Args:
        request (Request): The incoming FastAPI request
        user_id (str): User ID of the account
        username (str): Username of the account
        tenant_id (Optional[str], optional): Tenant ID of the account.
            Defaults to None.
        reset_method (str, optional): Method used for password reset.
            Valid values: "email", "admin", "recovery", "sms", "support", 
            "security_questions". Defaults to "email".
        initiated_by_user_id (Optional[str], optional): User ID of the admin
            who initiated the reset, if applicable. Defaults to None.
        token_id (Optional[str], optional): ID of the reset token, for correlating
            the reset initiation with the completion. Defaults to None.
        expires_in_minutes (Optional[int], optional): How long the reset token
            is valid, in minutes. Defaults to None.
        alert_level (SecurityAlertLevel, optional): Alert level for the event.
            Defaults to MEDIUM. Use HIGH for admin-initiated resets or suspicious
            patterns.
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        from fastapi import Depends, Request
        from backend.utils.security.monitoring import SecurityAlertLevel
        
        @app.post("/auth/forgot-password")
        async def forgot_password(
            request: Request,
            email: str
        ):
            # ... find user by email ...
            # ... generate reset token ...
            
            # Log the password reset event
            log_password_reset(
                request=request,
                user_id=user.id,
                username=user.username,
                tenant_id=user.tenant_id,
                reset_method="email",
                token_id=reset_token.id,
                expires_in_minutes=30
            )
            
            # ... send email with reset link ...
            return {"message": "Password reset instructions sent"}
        ```
    """
    operation_id = f"password_reset_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Validate input parameters
        if not isinstance(user_id, str) or not user_id:
            logger.error(f"[{operation_id}] Invalid user_id parameter: {user_id}")
            return False
            
        if not isinstance(username, str) or not username:
            logger.error(f"[{operation_id}] Invalid username parameter: {username}")
            return False
            
        if tenant_id is not None and (not isinstance(tenant_id, str) or not tenant_id):
            logger.error(f"[{operation_id}] Invalid tenant_id parameter: {tenant_id}")
            return False
            
        valid_reset_methods = ["email", "admin", "recovery", "sms", "support", "security_questions"]
        if not isinstance(reset_method, str) or reset_method not in valid_reset_methods:
            logger.error(f"[{operation_id}] Invalid reset_method parameter: {reset_method}")
            return False
            
        if initiated_by_user_id is not None and not isinstance(initiated_by_user_id, str):
            logger.error(f"[{operation_id}] Invalid initiated_by_user_id parameter: {initiated_by_user_id}")
            return False
            
        if token_id is not None and not isinstance(token_id, str):
            logger.error(f"[{operation_id}] Invalid token_id parameter: {token_id}")
            return False
            
        if expires_in_minutes is not None and (not isinstance(expires_in_minutes, int) or expires_in_minutes <= 0):
            logger.error(f"[{operation_id}] Invalid expires_in_minutes parameter: {expires_in_minutes}")
            return False
        
        # Extract client information
        client_ip, user_agent = _extract_client_info(request)
        
        # Log the operation start
        logger.debug(f"[{operation_id}] Logging password reset for user {username} (ID: {user_id}) from IP {client_ip}")
        
        # Prepare event details
        details = {
            "username": username,
            "reset_method": reset_method,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operation_id": operation_id
        }
        
        # Add optional fields if provided
        if initiated_by_user_id:
            details["initiated_by_user_id"] = initiated_by_user_id
            details["is_administrative_action"] = True
        else:
            details["is_administrative_action"] = False
            
        if token_id:
            details["token_id"] = token_id
            
        if expires_in_minutes is not None:
            details["expires_in_minutes"] = expires_in_minutes
            expiry_time = datetime.now(timezone.utc) + timedelta(minutes=expires_in_minutes)
            details["expiry_time"] = expiry_time.isoformat()
        
        # Log the event
        log_security_event(
            event_type=SecurityEventType.PASSWORD_RESET,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            alert_level=alert_level,
            details=details
        )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{operation_id}] Slow password reset logging: {elapsed_ms}ms")
        else:
            logger.debug(f"[{operation_id}] Password reset logged in {elapsed_ms}ms")
        
        return True
        
    except Exception as e:
        # Log the error with traceback
        logger.error(f"[{operation_id}] Error logging password reset: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return False


def log_permission_change(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    permission: str = "",
    action: str = "granted",  # granted or revoked
    changed_by: Optional[str] = None,
    change_reason: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    alert_level: SecurityAlertLevel = SecurityAlertLevel.MEDIUM
) -> bool:
    """
    Log a permission change event.
    
    This function records when a user's permissions are changed, typically by an 
    administrator or through an automated process. This is essential for security 
    auditing, compliance tracking, and detecting privilege escalation.
    
    Args:
        request (Request): The incoming FastAPI request
        user_id (str): User ID of the account whose permissions are changing
        username (str): Username of the account whose permissions are changing
        tenant_id (Optional[str], optional): Tenant ID of the account.
            Defaults to None.
        permission (str): The permission that was changed. This should be a 
            specific permission identifier like "manage_users" or "view_reports".
            Defaults to "".
        action (str, optional): The action performed. Defaults to "granted".
            Valid values: "granted" or "revoked".
        changed_by (Optional[str], optional): User ID of the administrator who
            changed the permission. Defaults to None.
        change_reason (Optional[str], optional): Reason for the permission change.
            Common values: "Role change", "Promotion", "Security policy",
            "Administrative request", "Compliance". Defaults to None.
        resource_type (Optional[str], optional): Type of resource the permission
            applies to (e.g., "document", "user", "report"). Defaults to None.
        resource_id (Optional[str], optional): ID of the specific resource the
            permission applies to. Defaults to None.
        alert_level (SecurityAlertLevel, optional): Alert level for the event.
            Defaults to MEDIUM. Use HIGH for sensitive permission changes like
            administrative access.
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        from fastapi import Depends, Request
        from backend.utils.security.monitoring import SecurityAlertLevel
        
        @app.post("/admin/users/{user_id}/permissions")
        async def change_user_permission(
            request: Request,
            user_id: str,
            permission_data: PermissionChangeRequest,
            current_admin: User = Depends(get_current_admin)
        ):
            # ... permission change logic ...
            
            # Get user details
            user = await get_user_by_id(user_id)
            
            # Determine alert level based on permission sensitivity
            alert_level = SecurityAlertLevel.HIGH if permission_data.permission == "admin_access" else SecurityAlertLevel.MEDIUM
            
            # Log the permission change event
            log_permission_change(
                request=request,
                user_id=user.id,
                username=user.username,
                tenant_id=user.tenant_id,
                permission=permission_data.permission,
                action=permission_data.action,
                changed_by=current_admin.id,
                change_reason=permission_data.reason,
                alert_level=alert_level
            )
            
            return {"message": "Permission updated successfully"}
        ```
    """
    operation_id = f"permission_change_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Validate input parameters
        if not isinstance(user_id, str) or not user_id:
            logger.error(f"[{operation_id}] Invalid user_id parameter: {user_id}")
            return False
            
        if not isinstance(username, str) or not username:
            logger.error(f"[{operation_id}] Invalid username parameter: {username}")
            return False
            
        if tenant_id is not None and (not isinstance(tenant_id, str) or not tenant_id):
            logger.error(f"[{operation_id}] Invalid tenant_id parameter: {tenant_id}")
            return False
            
        if not isinstance(permission, str):
            logger.error(f"[{operation_id}] Invalid permission parameter: {permission}")
            return False
            
        valid_actions = ["granted", "revoked"]
        if not isinstance(action, str) or action not in valid_actions:
            logger.error(f"[{operation_id}] Invalid action parameter: {action}")
            return False
            
        if changed_by is not None and not isinstance(changed_by, str):
            logger.error(f"[{operation_id}] Invalid changed_by parameter: {changed_by}")
            return False
            
        if change_reason is not None and not isinstance(change_reason, str):
            logger.error(f"[{operation_id}] Invalid change_reason parameter: {change_reason}")
            return False
            
        if resource_type is not None and not isinstance(resource_type, str):
            logger.error(f"[{operation_id}] Invalid resource_type parameter: {resource_type}")
            return False
            
        if resource_id is not None and not isinstance(resource_id, str):
            logger.error(f"[{operation_id}] Invalid resource_id parameter: {resource_id}")
            return False
        
        # Extract client information
        client_ip, user_agent = _extract_client_info(request)
        
        # Determine event type based on action
        event_type = (
            SecurityEventType.PERMISSION_GRANTED if action == "granted" 
            else SecurityEventType.PERMISSION_REVOKED
        )
        
        # Log the operation start
        logger.debug(f"[{operation_id}] Logging permission {action} for user {username} " +
                    f"(ID: {user_id}) from IP {client_ip}, permission: {permission}")
        
        # Prepare event details
        details = {
            "username": username,
            "permission": permission,
            "action": action,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operation_id": operation_id
        }
        
        # Add optional fields if provided
        if changed_by:
            details["changed_by"] = changed_by
            
        if change_reason:
            details["change_reason"] = change_reason
            
        if resource_type:
            details["resource_type"] = resource_type
            
        if resource_id:
            details["resource_id"] = resource_id
            details["scoped_permission"] = True
        else:
            details["scoped_permission"] = False
        
        # Log the event
        log_security_event(
            event_type=event_type,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            resource_type=resource_type,  # Include as top-level field for better querying
            resource_id=resource_id,      # Include as top-level field for better querying
            alert_level=alert_level,
            details=details
        )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{operation_id}] Slow permission change logging: {elapsed_ms}ms")
        else:
            logger.debug(f"[{operation_id}] Permission change logged in {elapsed_ms}ms")
        
        return True
        
    except Exception as e:
        # Log the error with traceback
        logger.error(f"[{operation_id}] Error logging permission change: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return False