"""
Permission definitions and utilities for RBAC system.

This module provides standardized permission definitions and utilities for working
with the role-based access control (RBAC) system. It defines permission constants,
permission checking functions, and utilities for working with permission sets.

Features:
- Standardized permission naming conventions
- Resource-based permission hierarchies
- Permission checking utilities
- Permission set operations
- Resource ownership validation

All permission functionality is implemented with consistent patterns:
1. Operation ID tracking for correlated logging
2. Performance monitoring with threshold warnings
3. Detailed error handling with context
4. Comprehensive docstrings with examples
"""

import logging
import time
import traceback
from typing import Dict, Any, List, Optional, Set, Tuple, Union, cast
from enum import Enum
from pydantic import BaseModel, Field, validator

# Import RBAC basics
from .rbac import Permission, Role, check_permission

# Setup logging
logger = logging.getLogger(__name__)

# Constants
SLOW_OPERATION_THRESHOLD_MS = 50  # Threshold for logging slow operations (milliseconds)


class ResourcePermission:
    """
    Resource permission utility class.
    
    This class provides methods for checking permissions within specific resource
    contexts, such as documents, projects, or integrations. It handles the common
    resource permission patterns and ownership validation.
    """
    
    def __init__(self, resource_type: str):
        """
        Initialize a resource permission utility.
        
        Args:
            resource_type (str): The type of resource this utility handles
        """
        self.resource_type = resource_type
        self.permissions = {
            "view": f"{resource_type}:view",
            "create": f"{resource_type}:create",
            "edit": f"{resource_type}:edit",
            "delete": f"{resource_type}:delete",
            "share": f"{resource_type}:share",
            "list": f"{resource_type}:list",
            "export": f"{resource_type}:export",
            "import": f"{resource_type}:import"
        }
    
    def get_permission(self, action: str) -> str:
        """
        Get the permission string for a specific action on this resource type.
        
        Args:
            action (str): The action (e.g., "view", "edit", "delete")
            
        Returns:
            str: The permission string
            
        Raises:
            ValueError: If the action is not valid for this resource type
        """
        if action not in self.permissions:
            valid_actions = ", ".join(self.permissions.keys())
            raise ValueError(f"Invalid action '{action}' for {self.resource_type}. Valid actions: {valid_actions}")
        
        return self.permissions[action]
    
    def check_permission(
        self, 
        user_id: str, 
        action: str, 
        tenant_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Check if a user has permission to perform an action on this resource type.
        
        Args:
            user_id (str): The user ID to check
            action (str): The action to check (e.g., "view", "edit", "delete")
            tenant_id (Optional[str], optional): The tenant context. Defaults to None.
            resource_id (Optional[str], optional): The specific resource ID. Defaults to None.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            bool: True if the user has permission, False otherwise
            
        Example:
            ```python
            # Check if a user can edit a document
            document_permissions = ResourcePermission("document")
            has_permission = document_permissions.check_permission(
                user_id="user123",
                action="edit",
                tenant_id="tenant456",
                resource_id="doc789"
            )
            ```
        """
        op_id = operation_id or f"check_{self.resource_type}_{action}_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Get the permission string for this action
            try:
                permission = self.get_permission(action)
            except ValueError as e:
                logger.error(f"[{op_id}] {str(e)}")
                return False
            
            # Check the permission using the RBAC system
            result = check_permission(
                user_id=user_id,
                permission=permission,
                tenant_id=tenant_id,
                resource_type=self.resource_type,
                resource_id=resource_id,
                operation_id=op_id
            )
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow permission check: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Permission check completed in {elapsed_ms}ms")
            
            return result
            
        except Exception as e:
            logger.error(f"[{op_id}] Error checking permission: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return False on error to be safe
            return False


# Create common resource permission utilities
document_permissions = ResourcePermission("document")
integration_permissions = ResourcePermission("integration")
report_permissions = ResourcePermission("report")
user_permissions = ResourcePermission("user")
system_permissions = ResourcePermission("system")
data_permissions = ResourcePermission("data")


class PermissionSet:
    """
    Permission set utility for managing collections of permissions.
    
    This class provides utilities for working with sets of permissions, including
    set operations like union, intersection, and difference. It is useful for
    comparing permission sets and finding missing permissions.
    """
    
    def __init__(self, permissions: Optional[List[str]] = None):
        """
        Initialize a permission set.
        
        Args:
            permissions (Optional[List[str]], optional): Initial list of permissions.
                Defaults to None.
        """
        self.permissions = set(permissions) if permissions else set()
    
    def add(self, permission: str) -> None:
        """
        Add a permission to the set.
        
        Args:
            permission (str): Permission to add
        """
        self.permissions.add(permission)
    
    def remove(self, permission: str) -> None:
        """
        Remove a permission from the set.
        
        Args:
            permission (str): Permission to remove
        """
        if permission in self.permissions:
            self.permissions.remove(permission)
    
    def contains(self, permission: str) -> bool:
        """
        Check if the set contains a specific permission.
        
        Args:
            permission (str): Permission to check
            
        Returns:
            bool: True if the permission is in the set, False otherwise
        """
        return permission in self.permissions
    
    def union(self, other: 'PermissionSet') -> 'PermissionSet':
        """
        Get the union of this permission set with another.
        
        Args:
            other (PermissionSet): Other permission set
            
        Returns:
            PermissionSet: New permission set containing all permissions from both sets
        """
        result = PermissionSet()
        result.permissions = self.permissions.union(other.permissions)
        return result
    
    def intersection(self, other: 'PermissionSet') -> 'PermissionSet':
        """
        Get the intersection of this permission set with another.
        
        Args:
            other (PermissionSet): Other permission set
            
        Returns:
            PermissionSet: New permission set containing only permissions present in both sets
        """
        result = PermissionSet()
        result.permissions = self.permissions.intersection(other.permissions)
        return result
    
    def difference(self, other: 'PermissionSet') -> 'PermissionSet':
        """
        Get the difference between this permission set and another.
        
        Args:
            other (PermissionSet): Other permission set
            
        Returns:
            PermissionSet: New permission set containing permissions in this set but not in the other
        """
        result = PermissionSet()
        result.permissions = self.permissions.difference(other.permissions)
        return result
    
    def to_list(self) -> List[str]:
        """
        Convert the permission set to a list.
        
        Returns:
            List[str]: List of permissions in the set
        """
        return list(self.permissions)
    
    def __len__(self) -> int:
        """
        Get the number of permissions in the set.
        
        Returns:
            int: Number of permissions
        """
        return len(self.permissions)
    
    def __str__(self) -> str:
        """
        Get a string representation of the permission set.
        
        Returns:
            str: String representation
        """
        return f"PermissionSet({len(self.permissions)} permissions): {', '.join(sorted(self.permissions))}"


def get_required_permissions_for_endpoint(
    endpoint_path: str, 
    method: str
) -> List[str]:
    """
    Get the required permissions for a specific API endpoint.
    
    This utility function returns the permission(s) needed to access a specific
    API endpoint, based on the endpoint path and HTTP method.
    
    Args:
        endpoint_path (str): API endpoint path (e.g., "/api/documents/{id}")
        method (str): HTTP method (e.g., "GET", "POST", "PUT", "DELETE")
        
    Returns:
        List[str]: List of required permissions for the endpoint
        
    Example:
        ```python
        # Get permissions required for creating a document
        from backend.utils.security.permissions import get_required_permissions_for_endpoint
        
        required_permissions = get_required_permissions_for_endpoint(
            endpoint_path="/api/documents",
            method="POST"
        )
        # Returns ["document:create"]
        ```
    """
    operation_id = f"get_endpoint_perms_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Normalize inputs
        endpoint_path = endpoint_path.lower().rstrip('/')
        method = method.upper()
        
        # Extract resource type from endpoint path
        parts = [p for p in endpoint_path.split('/') if p]
        
        # Default to empty list if we can't determine permissions
        if len(parts) < 2:
            logger.warning(f"[{operation_id}] Cannot determine resource type for endpoint: {endpoint_path}")
            return []
        
        # The resource type is usually the second part of the path (e.g., /api/documents)
        resource_type = parts[1]
        if resource_type.endswith('s'):
            # Convert plural to singular (e.g., "documents" -> "document")
            resource_type = resource_type[:-1]
        
        # Determine action based on HTTP method and path pattern
        action = ""
        if method == "GET":
            if len(parts) <= 2 or parts[-1] == "list":
                # GET /api/documents or GET /api/documents/list
                action = "list"
            else:
                # GET /api/documents/{id}
                action = "view"
        elif method == "POST":
            if len(parts) > 2 and parts[-1] in ["import", "export", "share"]:
                # POST /api/documents/import or POST /api/documents/export
                action = parts[-1]
            else:
                # POST /api/documents
                action = "create"
        elif method == "PUT" or method == "PATCH":
            # PUT /api/documents/{id}
            action = "edit"
        elif method == "DELETE":
            # DELETE /api/documents/{id}
            action = "delete"
        
        # Map to permission
        if action:
            permission = f"{resource_type}:{action}"
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow endpoint permission mapping: {elapsed_ms}ms")
            else:
                logger.debug(f"[{operation_id}] Endpoint permission mapping completed in {elapsed_ms}ms")
            
            return [permission]
        
        # If we can't determine the action
        logger.warning(f"[{operation_id}] Cannot determine action for endpoint: {method} {endpoint_path}")
        return []
        
    except Exception as e:
        logger.error(f"[{operation_id}] Error mapping endpoint to permissions: {str(e)}")
        logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
        return []


def is_resource_owner(
    resource: Dict[str, Any], 
    user_id: str, 
    operation_id: Optional[str] = None
) -> bool:
    """
    Check if a user is the owner of a resource.
    
    This utility function checks if a user is the owner of a resource by comparing
    the user_id with different possible ownership fields in the resource.
    
    Args:
        resource (Dict[str, Any]): The resource to check
        user_id (str): The user ID to check against
        operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
        
    Returns:
        bool: True if the user is the owner, False otherwise
        
    Example:
        ```python
        # Check if a user is the owner of a document
        from backend.utils.security.permissions import is_resource_owner
        
        document = {"id": "doc123", "owner_id": "user456", "title": "Example Document"}
        is_owner = is_resource_owner(document, "user456")
        # Returns True
        ```
    """
    op_id = operation_id or f"check_owner_{int(time.time() * 1000)}"
    
    try:
        # Validate input
        if not resource or not isinstance(resource, dict):
            logger.error(f"[{op_id}] Invalid resource parameter: not a dictionary")
            return False
            
        if not user_id or not isinstance(user_id, str):
            logger.error(f"[{op_id}] Invalid user_id parameter: {user_id}")
            return False
        
        # Check various owner field patterns
        owner_fields = ["owner_id", "user_id", "created_by", "creator_id", "author_id"]
        
        for field in owner_fields:
            if field in resource and resource[field] == user_id:
                return True
        
        # Check if there's an "owner" object with an "id" field
        if "owner" in resource and isinstance(resource["owner"], dict) and "id" in resource["owner"]:
            if resource["owner"]["id"] == user_id:
                return True
        
        # Not the owner
        return False
        
    except Exception as e:
        logger.error(f"[{op_id}] Error checking resource ownership: {str(e)}")
        logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
        return False


def get_middleware_handler(permission: str) -> Optional[callable]:
    """
    Get a middleware handler function for checking a specific permission.
    
    This utility function returns a middleware handler function that checks if the
    user has a specific permission before allowing access to an endpoint.
    
    Args:
        permission (str): The permission to check
        
    Returns:
        Optional[callable]: Middleware handler function or None if permission is invalid
        
    Example:
        ```python
        # Create a middleware handler for checking document view permission
        from fastapi import Request, Response
        from backend.utils.security.permissions import get_middleware_handler
        
        document_view_handler = get_middleware_handler("document:view")
        
        @app.middleware("http")
        async def document_permission_middleware(request: Request, call_next):
            # Only apply to document endpoints
            if request.url.path.startswith("/api/documents"):
                # Check permission before continuing
                result = await document_view_handler(request)
                if result is not None:
                    return result
            return await call_next(request)
        ```
    """
    if not permission or not isinstance(permission, str):
        return None
    
    async def check_permission_middleware(request: Request) -> Optional[Response]:
        """
        Middleware handler for checking a specific permission.
        
        Args:
            request (Request): The incoming request
            
        Returns:
            Optional[Response]: Response object if permission is denied, None if allowed
        """
        # Extract user from request (implementation depends on your auth system)
        user = getattr(request, "user", None)
        if not user or not getattr(user, "id", None):
            # Authentication is handled by auth middleware, not here
            return None
        
        # Extract tenant ID from request if available
        tenant_id = getattr(request, "tenant_id", None)
        
        # Check permission
        has_permission = check_permission(
            user_id=user.id,
            permission=permission,
            tenant_id=tenant_id
        )
        
        if not has_permission:
            # Return 403 Forbidden response
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=403,
                content={"detail": "Permission denied", "permission": permission}
            )
        
        # Continue with request processing
        return None
    
    return check_permission_middleware