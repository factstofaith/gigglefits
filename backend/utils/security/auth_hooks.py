"""
Authentication hooks for security monitoring.

This module provides hooks to integrate authentication processes
with the security monitoring system.
"""

import logging
from typing import Optional, Dict, Any, Tuple
from fastapi import Request, Response
from datetime import datetime

from .monitoring import (
    SecurityEventType, 
    SecurityAlertLevel, 
    log_security_event,
    check_account_status
)

# Setup logging
logger = logging.getLogger(__name__)


def log_login_success(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    auth_method: str = "password",
    auth_details: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log a successful login event.
    
    Args:
        request: The incoming request
        user_id: User ID of the authenticated user
        username: Username of the authenticated user
        tenant_id: Tenant ID of the authenticated user
        auth_method: Authentication method used (password, oauth, mfa)
        auth_details: Additional authentication details
    """
    # Get client IP and user agent
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("user-agent")
    
    # Prepare event details
    details = {
        "username": username,
        "auth_method": auth_method,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Add any additional details
    if auth_details:
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


def log_login_failure(
    request: Request,
    username: Optional[str],
    tenant_id: Optional[str] = None,
    reason: str = "Invalid credentials",
    auth_method: str = "password",
    auth_details: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log a failed login event.
    
    Args:
        request: The incoming request
        username: Username that failed to authenticate
        tenant_id: Tenant ID from the login attempt
        reason: Reason for the failure
        auth_method: Authentication method used (password, oauth, mfa)
        auth_details: Additional authentication details
    """
    # Get client IP and user agent
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("user-agent")
    
    # Prepare event details
    details = {
        "username": username,
        "auth_method": auth_method,
        "reason": reason,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Add any additional details
    if auth_details:
        details.update(auth_details)
    
    # Determine alert level based on context
    alert_level = SecurityAlertLevel.LOW
    
    # Log the event
    log_security_event(
        event_type=SecurityEventType.LOGIN_FAILURE,
        user_id=None,  # User ID unknown for login failures
        tenant_id=tenant_id,
        ip_address=client_ip,
        user_agent=user_agent,
        alert_level=alert_level,
        details=details
    )


def log_logout(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None
) -> None:
    """
    Log a logout event.
    
    Args:
        request: The incoming request
        user_id: User ID of the authenticated user
        username: Username of the authenticated user
        tenant_id: Tenant ID of the authenticated user
    """
    # Get client IP and user agent
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("user-agent")
    
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
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def log_mfa_challenge(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    mfa_type: str = "totp"
) -> None:
    """
    Log an MFA challenge event.
    
    Args:
        request: The incoming request
        user_id: User ID of the authenticated user
        username: Username of the authenticated user
        tenant_id: Tenant ID of the authenticated user
        mfa_type: Type of MFA challenge (totp, email, sms)
    """
    # Get client IP and user agent
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("user-agent")
    
    # Log the event
    log_security_event(
        event_type=SecurityEventType.MFA_CHALLENGE,
        user_id=user_id,
        tenant_id=tenant_id,
        ip_address=client_ip,
        user_agent=user_agent,
        alert_level=SecurityAlertLevel.INFO,
        details={
            "username": username,
            "mfa_type": mfa_type,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def log_mfa_success(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    mfa_type: str = "totp"
) -> None:
    """
    Log a successful MFA verification event.
    
    Args:
        request: The incoming request
        user_id: User ID of the authenticated user
        username: Username of the authenticated user
        tenant_id: Tenant ID of the authenticated user
        mfa_type: Type of MFA verification (totp, email, sms)
    """
    # Get client IP and user agent
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("user-agent")
    
    # Log the event
    log_security_event(
        event_type=SecurityEventType.MFA_SUCCESS,
        user_id=user_id,
        tenant_id=tenant_id,
        ip_address=client_ip,
        user_agent=user_agent,
        alert_level=SecurityAlertLevel.INFO,
        details={
            "username": username,
            "mfa_type": mfa_type,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def log_mfa_failure(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    mfa_type: str = "totp",
    reason: str = "Invalid code"
) -> None:
    """
    Log a failed MFA verification event.
    
    Args:
        request: The incoming request
        user_id: User ID of the authenticated user
        username: Username of the authenticated user
        tenant_id: Tenant ID of the authenticated user
        mfa_type: Type of MFA verification (totp, email, sms)
        reason: Reason for the failure
    """
    # Get client IP and user agent
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("user-agent")
    
    # Log the event
    log_security_event(
        event_type=SecurityEventType.MFA_FAILURE,
        user_id=user_id,
        tenant_id=tenant_id,
        ip_address=client_ip,
        user_agent=user_agent,
        alert_level=SecurityAlertLevel.MEDIUM,
        details={
            "username": username,
            "mfa_type": mfa_type,
            "reason": reason,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def log_account_locked(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    reason: str = "Too many failed login attempts"
) -> None:
    """
    Log an account locked event.
    
    Args:
        request: The incoming request
        user_id: User ID of the locked account
        username: Username of the locked account
        tenant_id: Tenant ID of the locked account
        reason: Reason for locking the account
    """
    # Get client IP and user agent
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("user-agent")
    
    # Log the event
    log_security_event(
        event_type=SecurityEventType.ACCOUNT_LOCKED,
        user_id=user_id,
        tenant_id=tenant_id,
        ip_address=client_ip,
        user_agent=user_agent,
        alert_level=SecurityAlertLevel.HIGH,
        details={
            "username": username,
            "reason": reason,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def log_account_unlocked(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    unlocked_by: Optional[str] = None
) -> None:
    """
    Log an account unlocked event.
    
    Args:
        request: The incoming request
        user_id: User ID of the unlocked account
        username: Username of the unlocked account
        tenant_id: Tenant ID of the unlocked account
        unlocked_by: User ID of the admin who unlocked the account
    """
    # Get client IP and user agent
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("user-agent")
    
    # Log the event
    log_security_event(
        event_type=SecurityEventType.ACCOUNT_UNLOCKED,
        user_id=user_id,
        tenant_id=tenant_id,
        ip_address=client_ip,
        user_agent=user_agent,
        alert_level=SecurityAlertLevel.MEDIUM,
        details={
            "username": username,
            "unlocked_by": unlocked_by,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def log_password_change(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    changed_by: Optional[str] = None
) -> None:
    """
    Log a password change event.
    
    Args:
        request: The incoming request
        user_id: User ID of the account
        username: Username of the account
        tenant_id: Tenant ID of the account
        changed_by: User ID of the admin who changed the password, if not self
    """
    # Get client IP and user agent
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("user-agent")
    
    # Determine if this is a self-change or admin change
    is_admin_change = changed_by and changed_by != user_id
    
    # Set alert level based on whether this is a self-change or admin change
    alert_level = SecurityAlertLevel.MEDIUM if is_admin_change else SecurityAlertLevel.INFO
    
    # Log the event
    log_security_event(
        event_type=SecurityEventType.PASSWORD_CHANGE,
        user_id=user_id,
        tenant_id=tenant_id,
        ip_address=client_ip,
        user_agent=user_agent,
        alert_level=alert_level,
        details={
            "username": username,
            "changed_by": changed_by if is_admin_change else "self",
            "is_admin_change": is_admin_change,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def log_password_reset(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    reset_method: str = "email"
) -> None:
    """
    Log a password reset event.
    
    Args:
        request: The incoming request
        user_id: User ID of the account
        username: Username of the account
        tenant_id: Tenant ID of the account
        reset_method: Method used for password reset (email, admin, recovery)
    """
    # Get client IP and user agent
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("user-agent")
    
    # Log the event
    log_security_event(
        event_type=SecurityEventType.PASSWORD_RESET,
        user_id=user_id,
        tenant_id=tenant_id,
        ip_address=client_ip,
        user_agent=user_agent,
        alert_level=SecurityAlertLevel.MEDIUM,
        details={
            "username": username,
            "reset_method": reset_method,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def log_permission_change(
    request: Request,
    user_id: str, 
    username: str,
    tenant_id: Optional[str] = None,
    permission: str = "",
    action: str = "granted",  # granted or revoked
    changed_by: Optional[str] = None
) -> None:
    """
    Log a permission change event.
    
    Args:
        request: The incoming request
        user_id: User ID of the account
        username: Username of the account
        tenant_id: Tenant ID of the account
        permission: The permission that was changed
        action: The action performed (granted or revoked)
        changed_by: User ID of the admin who changed the permission
    """
    # Get client IP and user agent
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    user_agent = request.headers.get("user-agent")
    
    # Determine event type based on action
    event_type = (
        SecurityEventType.PERMISSION_GRANTED if action == "granted" 
        else SecurityEventType.PERMISSION_REVOKED
    )
    
    # Log the event
    log_security_event(
        event_type=event_type,
        user_id=user_id,
        tenant_id=tenant_id,
        ip_address=client_ip,
        user_agent=user_agent,
        alert_level=SecurityAlertLevel.MEDIUM,
        details={
            "username": username,
            "permission": permission,
            "changed_by": changed_by,
            "timestamp": datetime.utcnow().isoformat()
        }
    )