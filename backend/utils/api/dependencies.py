"""
Dependency utilities for API standardization.

This module provides standardized dependencies for API endpoints,
especially for authentication and authorization.
"""

from typing import List, Optional, Callable, Dict, Any
from fastapi import Depends, HTTPException, status

from core.auth import get_current_active_user
from db.models import User


async def get_current_tenant_user(
    tenant_id: str,
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Get current user and verify tenant access.
    
    This dependency checks if the current user has access to the specified tenant.
    Admin users have access to all tenants, while regular users can only access
    their own tenant.
    
    Args:
        tenant_id: The tenant ID to verify access for
        current_user: The current authenticated user
        
    Returns:
        The current user if they have access to the tenant
        
    Raises:
        HTTPException: If the user doesn't have access to the tenant
    """
    if current_user.role != "admin" and current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "TENANT_ACCESS_DENIED",
                "message": "Not authorized to access this tenant"
            }
        )
    
    return current_user


def require_permissions(permissions: List[str]) -> Callable:
    """
    Create a dependency that requires specific permissions.
    
    This factory function creates a dependency that checks if the current user
    has the required permissions.
    
    Args:
        permissions: List of required permissions
        
    Returns:
        A dependency function that checks permissions
    """
    async def _require_permissions(
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        """
        Check if the current user has the required permissions.
        
        Args:
            current_user: The current authenticated user
            
        Returns:
            The current user if they have the required permissions
            
        Raises:
            HTTPException: If the user doesn't have the required permissions
        """
        # Admin role has all permissions
        if current_user.role == "admin":
            return current_user
        
        # Check user permissions
        user_permissions = getattr(current_user, "permissions", [])
        
        # Check if user has all required permissions
        missing_permissions = [p for p in permissions if p not in user_permissions]
        
        if missing_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "INSUFFICIENT_PERMISSIONS",
                    "message": "Insufficient permissions to access this resource",
                    "missing_permissions": missing_permissions
                }
            )
        
        return current_user
    
    return _require_permissions