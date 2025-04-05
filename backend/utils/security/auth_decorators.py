"""
Authorization decorators for API endpoints.

This module provides decorators for protecting API endpoints with role-based
access control and permission checks. These decorators work with FastAPI
dependency injection system and provide standardized error handling.

Features:
- Role-based access decorators
- Permission-based access decorators
- Resource ownership validation
- Tenant isolation
- Detailed error messages
- Comprehensive logging

All decorators follow a standardized pattern:
1. Operation ID tracking for correlated logging
2. Performance monitoring with threshold warnings
3. Detailed error handling with context
4. Comprehensive docstrings with examples
"""

import logging
import time
import functools
import traceback
from typing import Callable, List, Optional, Dict, Any, Tuple, Union, cast
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status, Request, Response, Path, Query
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

# Import RBAC system
from .rbac import check_permission, Role, rbac_manager
from .permissions import is_resource_owner, ResourcePermission

# Setup logging
logger = logging.getLogger(__name__)

# Constants
SLOW_OPERATION_THRESHOLD_MS = 50  # Threshold for logging slow operations (milliseconds)


# Mock current user dependency for example purposes
# In a real implementation, this would come from your core.auth module
async def get_current_user(request: Request):
    """Get the current authenticated user."""
    return request.state.user


def require_role(role: str, strict: bool = False):
    """
    Require a specific role or higher for access to an endpoint.
    
    This decorator creates a FastAPI dependency that checks if the current user
    has the specified role or a higher role in the role hierarchy. If strict is
    True, it requires exactly the specified role, not higher roles.
    
    Args:
        role (str): The required role
        strict (bool, optional): If True, require exactly this role, not higher roles.
            Defaults to False.
            
    Returns:
        Callable: FastAPI dependency function
        
    Example:
        ```python
        from fastapi import APIRouter, Depends
        from backend.utils.security.auth_decorators import require_role
        
        router = APIRouter()
        
        @router.get("/admin-only")
        async def admin_only_endpoint(
            current_user = Depends(require_role("admin"))
        ):
            return {"message": "You have admin access"}
            
        @router.get("/manager-only")
        async def manager_only_endpoint(
            current_user = Depends(require_role("manager", strict=True))
        ):
            # Only managers can access, not admins
            return {"message": "You have manager access"}
        ```
    """
    operation_id = f"require_role_{int(time.time() * 1000)}"
    
    # Check if the role is valid
    try:
        valid_role = Role(role)
    except ValueError:
        logger.error(f"[{operation_id}] Invalid role specified in decorator: {role}")
        valid_role = None
    
    async def _require_role(request: Request):
        """
        FastAPI dependency for role-based access control.
        
        Args:
            request (Request): The FastAPI request object
            
        Returns:
            Any: The current user if access is allowed
            
        Raises:
            HTTPException: If the user doesn't have the required role
        """
        start_time = time.time()
        op_id = f"{operation_id}_{int(time.time() * 1000)}"
        
        # Get the current user from request state
        user = getattr(request.state, "user", None)
        if not user:
            logger.error(f"[{op_id}] No authenticated user found in request")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # If an invalid role was specified in the decorator
        if not valid_role:
            logger.error(f"[{op_id}] Cannot verify invalid role: {role}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server configuration error"
            )
        
        # Get the user's role
        user_role = getattr(user, "role", None)
        if not user_role:
            logger.error(f"[{op_id}] User has no role attribute: {user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No role assigned"
            )
        
        # Check if roles match
        if strict:
            # Strict mode: require exactly this role
            has_role = user_role == role
        else:
            # Non-strict mode: check role hierarchy
            try:
                user_role_enum = Role(user_role)
                required_role_enum = Role(role)
                
                # Higher roles can access (e.g., ADMIN can access MANAGER endpoints)
                # This is specific to your role hierarchy logic
                role_hierarchy = {
                    Role.ADMIN: [Role.MANAGER, Role.USER, Role.READONLY, Role.GUEST],
                    Role.MANAGER: [Role.USER, Role.READONLY, Role.GUEST],
                    Role.USER: [Role.READONLY, Role.GUEST],
                    Role.READONLY: [Role.GUEST],
                    Role.GUEST: []
                }
                
                if user_role_enum == required_role_enum:
                    has_role = True
                elif required_role_enum in role_hierarchy.get(user_role_enum, []):
                    has_role = True
                else:
                    has_role = False
                    
            except ValueError:
                # If roles aren't in the enum, fall back to direct comparison
                has_role = user_role == role
        
        # Handle access denial
        if not has_role:
            logger.warning(f"[{op_id}] Role access denied: user has '{user_role}', needs '{role}'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "INSUFFICIENT_ROLE",
                    "message": f"This endpoint requires the '{role}' role"
                }
            )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{op_id}] Slow role check: {elapsed_ms}ms")
        else:
            logger.debug(f"[{op_id}] Role check completed in {elapsed_ms}ms")
        
        # Access granted, return the user
        return user
    
    return _require_role


def require_permission(permission: str):
    """
    Require a specific permission for access to an endpoint.
    
    This decorator creates a FastAPI dependency that checks if the current user
    has the specified permission.
    
    Args:
        permission (str): The required permission
            
    Returns:
        Callable: FastAPI dependency function
        
    Example:
        ```python
        from fastapi import APIRouter, Depends
        from backend.utils.security.auth_decorators import require_permission
        
        router = APIRouter()
        
        @router.get("/documents")
        async def list_documents(
            current_user = Depends(require_permission("document:list"))
        ):
            return {"documents": [...]}
            
        @router.post("/documents")
        async def create_document(
            document: DocumentCreate,
            current_user = Depends(require_permission("document:create"))
        ):
            return {"id": "new_document_id"}
        ```
    """
    operation_id = f"require_perm_{int(time.time() * 1000)}"
    
    async def _require_permission(request: Request):
        """
        FastAPI dependency for permission-based access control.
        
        Args:
            request (Request): The FastAPI request object
            
        Returns:
            Any: The current user if access is allowed
            
        Raises:
            HTTPException: If the user doesn't have the required permission
        """
        start_time = time.time()
        op_id = f"{operation_id}_{int(time.time() * 1000)}"
        
        # Get the current user from request state
        user = getattr(request.state, "user", None)
        if not user:
            logger.error(f"[{op_id}] No authenticated user found in request")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # Get the tenant ID from the request if present
        tenant_id = getattr(request.state, "tenant_id", None)
        if not tenant_id and hasattr(user, "tenant_id"):
            tenant_id = user.tenant_id
        
        # Extract user ID
        user_id = getattr(user, "id", None)
        if not user_id:
            logger.error(f"[{op_id}] User has no id attribute")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User object missing id"
            )
        
        # Check permission using the RBAC system
        has_permission = check_permission(
            user_id=user_id,
            permission=permission,
            tenant_id=tenant_id,
            operation_id=op_id
        )
        
        # Handle access denial
        if not has_permission:
            logger.warning(f"[{op_id}] Permission denied: user {user_id} lacks '{permission}'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "INSUFFICIENT_PERMISSION",
                    "message": f"This endpoint requires the '{permission}' permission"
                }
            )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{op_id}] Slow permission check: {elapsed_ms}ms")
        else:
            logger.debug(f"[{op_id}] Permission check completed in {elapsed_ms}ms")
        
        # Access granted, return the user
        return user
    
    return _require_permission


def require_any_permission(permissions: List[str]):
    """
    Require any of the specified permissions for access to an endpoint.
    
    This decorator creates a FastAPI dependency that checks if the current user
    has any of the specified permissions.
    
    Args:
        permissions (List[str]): List of permissions, any of which grants access
            
    Returns:
        Callable: FastAPI dependency function
        
    Example:
        ```python
        from fastapi import APIRouter, Depends
        from backend.utils.security.auth_decorators import require_any_permission
        
        router = APIRouter()
        
        @router.get("/sensitive-data")
        async def access_sensitive_data(
            current_user = Depends(require_any_permission([
                "data:admin",
                "data:audit",
                "system:admin"
            ]))
        ):
            return {"sensitive_data": [...]}
        ```
    """
    operation_id = f"require_any_perm_{int(time.time() * 1000)}"
    
    async def _require_any_permission(request: Request):
        """
        FastAPI dependency for multiple permission check (any).
        
        Args:
            request (Request): The FastAPI request object
            
        Returns:
            Any: The current user if access is allowed
            
        Raises:
            HTTPException: If the user doesn't have any of the required permissions
        """
        start_time = time.time()
        op_id = f"{operation_id}_{int(time.time() * 1000)}"
        
        # Get the current user from request state
        user = getattr(request.state, "user", None)
        if not user:
            logger.error(f"[{op_id}] No authenticated user found in request")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # Get the tenant ID from the request if present
        tenant_id = getattr(request.state, "tenant_id", None)
        if not tenant_id and hasattr(user, "tenant_id"):
            tenant_id = user.tenant_id
        
        # Extract user ID
        user_id = getattr(user, "id", None)
        if not user_id:
            logger.error(f"[{op_id}] User has no id attribute")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User object missing id"
            )
        
        # Check each permission
        for permission in permissions:
            has_permission = check_permission(
                user_id=user_id,
                permission=permission,
                tenant_id=tenant_id,
                operation_id=op_id
            )
            if has_permission:
                # Access granted if any permission is valid
                
                # Log performance metrics
                elapsed_ms = int((time.time() - start_time) * 1000)
                if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                    logger.warning(f"[{op_id}] Slow permission check: {elapsed_ms}ms")
                else:
                    logger.debug(f"[{op_id}] Permission check completed in {elapsed_ms}ms")
                
                return user
        
        # No permissions matched, access denied
        logger.warning(f"[{op_id}] No permissions matched for user {user_id}, required any of: {permissions}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "INSUFFICIENT_PERMISSION",
                "message": "You need at least one of the required permissions",
                "required_permissions": permissions
            }
        )
    
    return _require_any_permission


def require_all_permissions(permissions: List[str]):
    """
    Require all of the specified permissions for access to an endpoint.
    
    This decorator creates a FastAPI dependency that checks if the current user
    has all of the specified permissions.
    
    Args:
        permissions (List[str]): List of permissions, all of which are required
            
    Returns:
        Callable: FastAPI dependency function
        
    Example:
        ```python
        from fastapi import APIRouter, Depends
        from backend.utils.security.auth_decorators import require_all_permissions
        
        router = APIRouter()
        
        @router.delete("/users/{user_id}")
        async def delete_user(
            user_id: str,
            current_user = Depends(require_all_permissions([
                "user:delete",
                "user:admin"
            ]))
        ):
            # Delete the user
            return {"message": "User deleted"}
        ```
    """
    operation_id = f"require_all_perms_{int(time.time() * 1000)}"
    
    async def _require_all_permissions(request: Request):
        """
        FastAPI dependency for multiple permission check (all).
        
        Args:
            request (Request): The FastAPI request object
            
        Returns:
            Any: The current user if access is allowed
            
        Raises:
            HTTPException: If the user doesn't have all the required permissions
        """
        start_time = time.time()
        op_id = f"{operation_id}_{int(time.time() * 1000)}"
        
        # Get the current user from request state
        user = getattr(request.state, "user", None)
        if not user:
            logger.error(f"[{op_id}] No authenticated user found in request")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # Get the tenant ID from the request if present
        tenant_id = getattr(request.state, "tenant_id", None)
        if not tenant_id and hasattr(user, "tenant_id"):
            tenant_id = user.tenant_id
        
        # Extract user ID
        user_id = getattr(user, "id", None)
        if not user_id:
            logger.error(f"[{op_id}] User has no id attribute")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User object missing id"
            )
        
        # Track missing permissions
        missing_permissions = []
        
        # Check each permission
        for permission in permissions:
            has_permission = check_permission(
                user_id=user_id,
                permission=permission,
                tenant_id=tenant_id,
                operation_id=op_id
            )
            if not has_permission:
                missing_permissions.append(permission)
        
        # Access denied if any permissions are missing
        if missing_permissions:
            logger.warning(f"[{op_id}] Missing permissions for user {user_id}: {missing_permissions}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "INSUFFICIENT_PERMISSION",
                    "message": "You need all the required permissions",
                    "missing_permissions": missing_permissions
                }
            )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{op_id}] Slow permission check: {elapsed_ms}ms")
        else:
            logger.debug(f"[{op_id}] Permission check completed in {elapsed_ms}ms")
        
        # Access granted, return the user
        return user
    
    return _require_all_permissions


def require_resource_permission(permission: str, param_name: str = "id"):
    """
    Require permission for a specific resource by ID.
    
    This decorator creates a FastAPI dependency that checks if the current user
    has the specified permission for a specific resource identified by a path parameter.
    
    Args:
        permission (str): The required permission
        param_name (str, optional): Name of the path parameter containing the resource ID.
            Defaults to "id".
            
    Returns:
        Callable: FastAPI dependency function
        
    Example:
        ```python
        from fastapi import APIRouter, Depends, Path
        from backend.utils.security.auth_decorators import require_resource_permission
        
        router = APIRouter()
        
        @router.get("/documents/{document_id}")
        async def get_document(
            document_id: str = Path(...),
            current_user = Depends(require_resource_permission("document:view", "document_id"))
        ):
            return {"document": get_document_by_id(document_id)}
        ```
    """
    operation_id = f"require_resource_{int(time.time() * 1000)}"
    
    async def _require_resource_permission(request: Request):
        """
        FastAPI dependency for resource-specific permission check.
        
        Args:
            request (Request): The FastAPI request object
            
        Returns:
            Any: The current user if access is allowed
            
        Raises:
            HTTPException: If the user doesn't have the required permission for the resource
        """
        start_time = time.time()
        op_id = f"{operation_id}_{int(time.time() * 1000)}"
        
        # Get the current user from request state
        user = getattr(request.state, "user", None)
        if not user:
            logger.error(f"[{op_id}] No authenticated user found in request")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # Get the tenant ID from the request if present
        tenant_id = getattr(request.state, "tenant_id", None)
        if not tenant_id and hasattr(user, "tenant_id"):
            tenant_id = user.tenant_id
        
        # Extract user ID
        user_id = getattr(user, "id", None)
        if not user_id:
            logger.error(f"[{op_id}] User has no id attribute")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User object missing id"
            )
        
        # Extract resource ID from path parameters
        path_params = request.path_params
        if param_name not in path_params:
            logger.error(f"[{op_id}] Resource ID parameter '{param_name}' not found in path")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Path parameter '{param_name}' not found"
            )
        
        resource_id = path_params[param_name]
        
        # Determine resource type from permission or path
        # This is a simple approach - in a real implementation, you might need more complex logic
        if ":" in permission:
            resource_type = permission.split(":")[0]
        else:
            # Default fallback - extract from path
            path_parts = request.url.path.split("/")
            if len(path_parts) >= 2:
                # Assume format like /api/documents/{id} or /documents/{id}
                for part in path_parts:
                    if part and part not in ["api", "v1", "v2"]:
                        resource_type = part
                        # Remove trailing 's' if plural
                        if resource_type.endswith("s"):
                            resource_type = resource_type[:-1]
                        break
            else:
                resource_type = None
                
        # Check permission for this specific resource
        has_permission = check_permission(
            user_id=user_id,
            permission=permission,
            tenant_id=tenant_id,
            resource_type=resource_type,
            resource_id=resource_id,
            operation_id=op_id
        )
        
        # Handle access denial
        if not has_permission:
            logger.warning(f"[{op_id}] Resource permission denied: user {user_id} lacks '{permission}' for {resource_type}/{resource_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "INSUFFICIENT_PERMISSION",
                    "message": f"You don't have permission to access this {resource_type if resource_type else 'resource'}"
                }
            )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{op_id}] Slow resource permission check: {elapsed_ms}ms")
        else:
            logger.debug(f"[{op_id}] Resource permission check completed in {elapsed_ms}ms")
        
        # Access granted, return the user
        return user
    
    return _require_resource_permission


def require_ownership(param_name: str = "id", resource_getter: Optional[Callable] = None):
    """
    Require resource ownership for access to an endpoint.
    
    This decorator creates a FastAPI dependency that checks if the current user
    is the owner of a resource identified by a path parameter.
    
    Args:
        param_name (str, optional): Name of the path parameter containing the resource ID.
            Defaults to "id".
        resource_getter (Optional[Callable], optional): Function to get the resource from its ID.
            If not provided, a default getter will be used. Defaults to None.
            
    Returns:
        Callable: FastAPI dependency function
        
    Example:
        ```python
        from fastapi import APIRouter, Depends, Path
        from backend.utils.security.auth_decorators import require_ownership
        from backend.models.document import get_document_by_id
        
        router = APIRouter()
        
        @router.put("/documents/{document_id}")
        async def update_document(
            document_id: str = Path(...),
            document: DocumentUpdate,
            current_user = Depends(require_ownership("document_id", get_document_by_id))
        ):
            # Update the document
            return {"message": "Document updated"}
        ```
    """
    operation_id = f"require_ownership_{int(time.time() * 1000)}"
    
    async def _require_ownership(request: Request):
        """
        FastAPI dependency for resource ownership check.
        
        Args:
            request (Request): The FastAPI request object
            
        Returns:
            Any: The current user if access is allowed
            
        Raises:
            HTTPException: If the user is not the owner of the resource
        """
        start_time = time.time()
        op_id = f"{operation_id}_{int(time.time() * 1000)}"
        
        # Get the current user from request state
        user = getattr(request.state, "user", None)
        if not user:
            logger.error(f"[{op_id}] No authenticated user found in request")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # Extract user ID
        user_id = getattr(user, "id", None)
        if not user_id:
            logger.error(f"[{op_id}] User has no id attribute")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User object missing id"
            )
        
        # Extract resource ID from path parameters
        path_params = request.path_params
        if param_name not in path_params:
            logger.error(f"[{op_id}] Resource ID parameter '{param_name}' not found in path")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Path parameter '{param_name}' not found"
            )
        
        resource_id = path_params[param_name]
        
        # Get the resource using the provided getter or a mock
        if resource_getter:
            try:
                resource = resource_getter(resource_id)
            except Exception as e:
                logger.error(f"[{op_id}] Error getting resource: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error retrieving resource"
                )
        else:
            # Mock resource getter for illustration
            # In a real implementation, you would connect to your database
            logger.warning(f"[{op_id}] No resource getter provided, using mock")
            resource = {"id": resource_id, "owner_id": None}
        
        # Check if the resource exists
        if not resource:
            logger.warning(f"[{op_id}] Resource {resource_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found"
            )
        
        # Check if user is the owner of the resource
        is_owner = is_resource_owner(resource, user_id, op_id)
        
        # Check if user is an admin (admins can access any resource)
        # This is a simple implementation - your admin check might be different
        is_admin = getattr(user, "role", "") == "admin"
        
        # Handle access denial
        if not (is_owner or is_admin):
            logger.warning(f"[{op_id}] Ownership check failed: user {user_id} is not the owner of {resource_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "NOT_RESOURCE_OWNER",
                    "message": "You don't have permission to access this resource"
                }
            )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{op_id}] Slow ownership check: {elapsed_ms}ms")
        else:
            logger.debug(f"[{op_id}] Ownership check completed in {elapsed_ms}ms")
        
        # Access granted, return the user
        return user
    
    return _require_ownership


def require_tenant_access(tenant_param: str = "tenant_id"):
    """
    Require access to a specific tenant.
    
    This decorator creates a FastAPI dependency that checks if the current user
    has access to a specific tenant identified by a path parameter.
    
    Args:
        tenant_param (str, optional): Name of the path parameter containing the tenant ID.
            Defaults to "tenant_id".
            
    Returns:
        Callable: FastAPI dependency function
        
    Example:
        ```python
        from fastapi import APIRouter, Depends, Path
        from backend.utils.security.auth_decorators import require_tenant_access
        
        router = APIRouter()
        
        @router.get("/tenants/{tenant_id}/users")
        async def list_tenant_users(
            tenant_id: str = Path(...),
            current_user = Depends(require_tenant_access())
        ):
            # List users in the tenant
            return {"users": get_users_by_tenant(tenant_id)}
        ```
    """
    operation_id = f"require_tenant_{int(time.time() * 1000)}"
    
    async def _require_tenant_access(request: Request):
        """
        FastAPI dependency for tenant access check.
        
        Args:
            request (Request): The FastAPI request object
            
        Returns:
            Any: The current user if access is allowed
            
        Raises:
            HTTPException: If the user doesn't have access to the tenant
        """
        start_time = time.time()
        op_id = f"{operation_id}_{int(time.time() * 1000)}"
        
        # Get the current user from request state
        user = getattr(request.state, "user", None)
        if not user:
            logger.error(f"[{op_id}] No authenticated user found in request")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # Extract user's tenant ID
        user_tenant_id = getattr(user, "tenant_id", None)
        if not user_tenant_id:
            logger.error(f"[{op_id}] User has no tenant_id attribute")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User object missing tenant_id"
            )
        
        # Extract target tenant ID from path parameters
        path_params = request.path_params
        if tenant_param not in path_params:
            logger.error(f"[{op_id}] Tenant ID parameter '{tenant_param}' not found in path")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Path parameter '{tenant_param}' not found"
            )
        
        target_tenant_id = path_params[tenant_param]
        
        # Check if user is an admin (admins can access any tenant)
        # This is a simple implementation - your admin check might be different
        is_admin = getattr(user, "role", "") == "admin"
        
        # Check if user belongs to the target tenant
        has_tenant_access = is_admin or user_tenant_id == target_tenant_id
        
        # Handle access denial
        if not has_tenant_access:
            logger.warning(f"[{op_id}] Tenant access denied: user from tenant {user_tenant_id} cannot access tenant {target_tenant_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "TENANT_ACCESS_DENIED",
                    "message": "You don't have permission to access this tenant"
                }
            )
        
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{op_id}] Slow tenant access check: {elapsed_ms}ms")
        else:
            logger.debug(f"[{op_id}] Tenant access check completed in {elapsed_ms}ms")
        
        # Add tenant ID to request state for downstream handlers
        request.state.current_tenant_id = target_tenant_id
        
        # Access granted, return the user
        return user
    
    return _require_tenant_access