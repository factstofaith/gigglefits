"""
Role-Based Access Control (RBAC) system.

This module provides a standardized implementation of role-based access control
for the TAP Integration Platform. It defines the core RBAC functionality including
role hierarchy, permission checking, and tenant isolation.

Features:
- Hierarchical role system with inheritance
- Permission definition and validation
- Cross-tenant access control
- Resource-level permission checking
- Detailed security logging
- Performance monitoring
- Comprehensive error handling

All RBAC functionality is implemented with consistent patterns:
1. Operation ID tracking for correlated logging
2. Performance monitoring with threshold warnings
3. Thread safety for concurrent access
4. Detailed error handling with context
5. Comprehensive docstrings with examples
"""

import logging
import time
import traceback
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Set, Tuple, Union, cast
from enum import Enum
from threading import Lock
import uuid

from fastapi import HTTPException, status
from pydantic import BaseModel, Field, validator

# Import security monitoring
from .monitoring import (
    SecurityEventType,
    SecurityAlertLevel,
    log_security_event
)

# Setup logging
logger = logging.getLogger(__name__)

# Constants
SLOW_OPERATION_THRESHOLD_MS = 50  # Threshold for logging slow operations (milliseconds)


class Role(str, Enum):
    """
    Role definitions for the RBAC system.
    
    This enum defines the standard roles available in the system. Roles are organized
    in a hierarchy, with higher roles inheriting permissions from lower roles.
    
    Roles:
    - ADMIN: Administrator with full system access
    - MANAGER: Manager with elevated permissions for team resources
    - USER: Standard user with basic permissions
    - READONLY: Read-only access to permitted resources
    - GUEST: Limited access for temporary users
    
    The role hierarchy is:
    ADMIN > MANAGER > USER > READONLY > GUEST
    """
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    READONLY = "readonly"
    GUEST = "guest"


class Permission(str, Enum):
    """
    Permission definitions for the RBAC system.
    
    This enum defines the standard permissions available in the system. Permissions
    follow a resource:action pattern for clarity and consistency.
    
    Categories:
    - User Management: Permissions related to user accounts
    - Integration Management: Permissions related to data integration
    - Data Access: Permissions related to accessing and managing data
    - System Administration: Permissions related to system configuration
    - Reporting: Permissions related to analytics and reporting
    
    Standard format: resource:action
    Where resource is the entity being accessed and action is the operation being performed.
    """
    # User Management
    USER_VIEW = "user:view"
    USER_CREATE = "user:create"
    USER_EDIT = "user:edit"
    USER_DELETE = "user:delete"
    
    # Integration Management
    INTEGRATION_VIEW = "integration:view"
    INTEGRATION_CREATE = "integration:create"
    INTEGRATION_EDIT = "integration:edit"
    INTEGRATION_DELETE = "integration:delete"
    INTEGRATION_EXECUTE = "integration:execute"
    
    # Data Access
    DATA_VIEW = "data:view"
    DATA_EDIT = "data:edit"
    DATA_DELETE = "data:delete"
    DATA_EXPORT = "data:export"
    DATA_IMPORT = "data:import"
    
    # System Administration
    SYSTEM_CONFIG_VIEW = "system:config:view"
    SYSTEM_CONFIG_EDIT = "system:config:edit"
    SYSTEM_LOGS_VIEW = "system:logs:view"
    SYSTEM_USERS_MANAGE = "system:users:manage"
    
    # Reporting
    REPORTS_VIEW = "reports:view"
    REPORTS_CREATE = "reports:create"
    REPORTS_EDIT = "reports:edit"
    REPORTS_DELETE = "reports:delete"
    REPORTS_EXPORT = "reports:export"


class RoleMixin:
    """
    Base functionality for RBAC role management.
    
    This mixin provides core methods for role operations and permission checking.
    It should be inherited by classes that need role-based access control.
    """
    
    def __init__(self):
        """Initialize role management functionality."""
        # Define the role hierarchy (higher roles inherit permissions from lower roles)
        self.role_hierarchy = {
            Role.ADMIN: [Role.MANAGER, Role.USER, Role.READONLY, Role.GUEST],
            Role.MANAGER: [Role.USER, Role.READONLY, Role.GUEST],
            Role.USER: [Role.READONLY, Role.GUEST],
            Role.READONLY: [Role.GUEST],
            Role.GUEST: []
        }
        
        # Define default permissions for each role
        self.role_permissions = {
            Role.ADMIN: [
                # Admin has all permissions
                "*"  # Wildcard for all permissions
            ],
            Role.MANAGER: [
                # User management (limited)
                Permission.USER_VIEW,
                
                # Integration management
                Permission.INTEGRATION_VIEW,
                Permission.INTEGRATION_CREATE,
                Permission.INTEGRATION_EDIT,
                Permission.INTEGRATION_DELETE,
                Permission.INTEGRATION_EXECUTE,
                
                # Data access
                Permission.DATA_VIEW,
                Permission.DATA_EDIT,
                Permission.DATA_EXPORT,
                Permission.DATA_IMPORT,
                
                # Reporting
                Permission.REPORTS_VIEW,
                Permission.REPORTS_CREATE,
                Permission.REPORTS_EDIT,
                Permission.REPORTS_DELETE,
                Permission.REPORTS_EXPORT
            ],
            Role.USER: [
                # Integration management (limited)
                Permission.INTEGRATION_VIEW,
                Permission.INTEGRATION_CREATE,
                Permission.INTEGRATION_EDIT,
                Permission.INTEGRATION_EXECUTE,
                
                # Data access (limited)
                Permission.DATA_VIEW,
                Permission.DATA_EDIT,
                Permission.DATA_EXPORT,
                
                # Reporting (limited)
                Permission.REPORTS_VIEW,
                Permission.REPORTS_CREATE,
                Permission.REPORTS_EXPORT
            ],
            Role.READONLY: [
                # View-only permissions
                Permission.USER_VIEW,
                Permission.INTEGRATION_VIEW,
                Permission.DATA_VIEW,
                Permission.REPORTS_VIEW
            ],
            Role.GUEST: [
                # Minimal permissions
                Permission.DATA_VIEW
            ]
        }
        
        # Thread safety
        self.lock = Lock()
    
    def get_role_permissions(self, role: str, operation_id: Optional[str] = None) -> Set[str]:
        """
        Get all permissions for a role, including inherited permissions.
        
        Args:
            role (str): The role to get permissions for
            operation_id (Optional[str], optional): Correlation ID for logging
            
        Returns:
            Set[str]: Set of permission strings for the role
            
        Raises:
            ValueError: If the role is not a valid role
        """
        op_id = operation_id or f"get_role_perms_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate role
            if not role or not isinstance(role, str):
                logger.error(f"[{op_id}] Invalid role parameter: {role}")
                raise ValueError(f"Invalid role: {role}")
            
            # Convert string role to enum if needed
            try:
                role_enum = Role(role) if isinstance(role, str) else role
            except ValueError:
                logger.warning(f"[{op_id}] Unknown role: {role}, returning empty permissions")
                return set()
            
            logger.debug(f"[{op_id}] Getting permissions for role: {role}")
            
            with self.lock:
                # Get direct permissions for this role
                permissions = set(self.role_permissions.get(role_enum, []))
                
                # Get inherited roles for this role
                inherited_roles = self.role_hierarchy.get(role_enum, [])
                
                # Add permissions from inherited roles
                for inherited_role in inherited_roles:
                    # Add direct permissions from inherited role
                    permissions.update(self.role_permissions.get(inherited_role, []))
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow role permission retrieval: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Role permissions retrieved in {elapsed_ms}ms")
            
            return permissions
            
        except Exception as e:
            logger.error(f"[{op_id}] Error getting role permissions: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return empty set on error to be safe
            return set()
    
    def has_permission(
        self, 
        role: str, 
        permission: str, 
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Check if a role has a specific permission.
        
        Args:
            role (str): The role to check
            permission (str): The permission to check for
            operation_id (Optional[str], optional): Correlation ID for logging
            
        Returns:
            bool: True if the role has the permission, False otherwise
        """
        op_id = operation_id or f"has_permission_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not role or not isinstance(role, str):
                logger.error(f"[{op_id}] Invalid role parameter: {role}")
                return False
                
            if not permission or not isinstance(permission, str):
                logger.error(f"[{op_id}] Invalid permission parameter: {permission}")
                return False
            
            logger.debug(f"[{op_id}] Checking if role '{role}' has permission '{permission}'")
            
            # Get all permissions for the role
            role_permissions = self.get_role_permissions(role, op_id)
            
            # Always approve if role has wildcard permission
            if "*" in role_permissions:
                logger.debug(f"[{op_id}] Role '{role}' has wildcard permission")
                return True
            
            # Check for exact permission match
            has_perm = permission in role_permissions
            
            # Check for wildcard permissions (e.g., "user:*" would match "user:view")
            if not has_perm and ":" in permission:
                resource = permission.split(":")[0]
                resource_wildcard = f"{resource}:*"
                has_perm = resource_wildcard in role_permissions
            
            # Log result
            logger.debug(f"[{op_id}] Permission check result: {has_perm}")
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow permission check: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Permission check completed in {elapsed_ms}ms")
            
            return has_perm
            
        except Exception as e:
            logger.error(f"[{op_id}] Error checking permission: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return False on error to be safe
            return False
    
    def has_any_permission(
        self, 
        role: str, 
        permissions: List[str], 
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Check if a role has any of the specified permissions.
        
        Args:
            role (str): The role to check
            permissions (List[str]): List of permissions to check for
            operation_id (Optional[str], optional): Correlation ID for logging
            
        Returns:
            bool: True if the role has any of the permissions, False otherwise
        """
        op_id = operation_id or f"has_any_perm_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not role or not isinstance(role, str):
                logger.error(f"[{op_id}] Invalid role parameter: {role}")
                return False
                
            if not permissions or not isinstance(permissions, list) or not all(isinstance(p, str) for p in permissions):
                logger.error(f"[{op_id}] Invalid permissions parameter: {permissions}")
                return False
            
            logger.debug(f"[{op_id}] Checking if role '{role}' has any of {len(permissions)} permissions")
            
            # Get all permissions for the role
            role_permissions = self.get_role_permissions(role, op_id)
            
            # Always approve if role has wildcard permission
            if "*" in role_permissions:
                logger.debug(f"[{op_id}] Role '{role}' has wildcard permission")
                return True
            
            # Check each permission
            for permission in permissions:
                # Check for exact permission match
                if permission in role_permissions:
                    logger.debug(f"[{op_id}] Role '{role}' has permission '{permission}'")
                    return True
                
                # Check for wildcard permissions (e.g., "user:*" would match "user:view")
                if ":" in permission:
                    resource = permission.split(":")[0]
                    resource_wildcard = f"{resource}:*"
                    if resource_wildcard in role_permissions:
                        logger.debug(f"[{op_id}] Role '{role}' has wildcard permission '{resource_wildcard}'")
                        return True
            
            # Log result
            logger.debug(f"[{op_id}] Role '{role}' does not have any of the required permissions")
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow permission check: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Permission check completed in {elapsed_ms}ms")
            
            return False
            
        except Exception as e:
            logger.error(f"[{op_id}] Error checking permissions: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return False on error to be safe
            return False
    
    def has_all_permissions(
        self, 
        role: str, 
        permissions: List[str], 
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Check if a role has all of the specified permissions.
        
        Args:
            role (str): The role to check
            permissions (List[str]): List of permissions to check for
            operation_id (Optional[str], optional): Correlation ID for logging
            
        Returns:
            bool: True if the role has all of the permissions, False otherwise
        """
        op_id = operation_id or f"has_all_perms_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not role or not isinstance(role, str):
                logger.error(f"[{op_id}] Invalid role parameter: {role}")
                return False
                
            if not permissions or not isinstance(permissions, list) or not all(isinstance(p, str) for p in permissions):
                logger.error(f"[{op_id}] Invalid permissions parameter: {permissions}")
                return False
            
            logger.debug(f"[{op_id}] Checking if role '{role}' has all of {len(permissions)} permissions")
            
            # Get all permissions for the role
            role_permissions = self.get_role_permissions(role, op_id)
            
            # Always approve if role has wildcard permission
            if "*" in role_permissions:
                logger.debug(f"[{op_id}] Role '{role}' has wildcard permission")
                return True
            
            # Track missing permissions for logging
            missing_permissions = []
            
            # Check each permission
            for permission in permissions:
                # Check for exact permission match
                has_perm = permission in role_permissions
                
                # Check for wildcard permissions (e.g., "user:*" would match "user:view")
                if not has_perm and ":" in permission:
                    resource = permission.split(":")[0]
                    resource_wildcard = f"{resource}:*"
                    has_perm = resource_wildcard in role_permissions
                
                # If missing this permission, track it and return False
                if not has_perm:
                    missing_permissions.append(permission)
            
            # Determine result
            has_all = len(missing_permissions) == 0
            
            # Log result
            if has_all:
                logger.debug(f"[{op_id}] Role '{role}' has all required permissions")
            else:
                logger.debug(f"[{op_id}] Role '{role}' is missing permissions: {missing_permissions}")
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow permission check: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Permission check completed in {elapsed_ms}ms")
            
            return has_all
            
        except Exception as e:
            logger.error(f"[{op_id}] Error checking permissions: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return False on error to be safe
            return False


class RBACManager(RoleMixin):
    """
    Role-Based Access Control (RBAC) Manager.
    
    This class provides the main implementation of the RBAC system. It extends
    the RoleMixin with additional functionality for user-specific permissions,
    tenant isolation, and resource-level access control.
    """
    
    def __init__(self):
        """Initialize the RBAC manager."""
        super().__init__()
        
        # Store user-specific permissions (user_id -> permissions set)
        self.user_permissions = {}
        
        # Store tenant-specific roles (tenant_id -> user_id -> role)
        self.tenant_roles = {}
        
        # Store resource permissions (resource_type -> resource_id -> user_id -> permissions set)
        self.resource_permissions = {}
        
        # Store tenant resources (tenant_id -> resource_type -> set of resource_ids)
        self.tenant_resources = {}
        
        # Track permission change history for auditing (user_id -> list of permission changes)
        self.permission_history = {}
    
    def check_permission(
        self, 
        user_id: str, 
        permission: str, 
        tenant_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Check if a user has a specific permission.
        
        This method checks if a user has the specified permission, taking into account:
        1. User's role permissions (including inherited permissions)
        2. User-specific permissions granted or revoked
        3. Tenant isolation (if applicable)
        4. Resource-specific permissions (if applicable)
        
        Args:
            user_id (str): The user ID to check
            permission (str): The permission to check for
            tenant_id (Optional[str], optional): The tenant context. Defaults to None.
            resource_type (Optional[str], optional): The resource type. Defaults to None.
            resource_id (Optional[str], optional): The specific resource ID. Defaults to None.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            bool: True if the user has the permission, False otherwise
            
        Example:
            ```python
            # Check if a user can view a specific document
            has_permission = rbac_manager.check_permission(
                user_id="user123",
                permission="document:view",
                tenant_id="tenant456",
                resource_type="document",
                resource_id="doc789"
            )
            ```
        """
        op_id = operation_id or f"check_perm_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not user_id or not isinstance(user_id, str):
                logger.error(f"[{op_id}] Invalid user_id parameter: {user_id}")
                return False
                
            if not permission or not isinstance(permission, str):
                logger.error(f"[{op_id}] Invalid permission parameter: {permission}")
                return False
            
            logger.debug(
                f"[{op_id}] Checking permission '{permission}' for user '{user_id}'" +
                (f" in tenant '{tenant_id}'" if tenant_id else "") +
                (f" on {resource_type}/{resource_id}" if resource_type and resource_id else "")
            )
            
            with self.lock:
                # Get user's role in the tenant context
                user_role = self._get_user_role(user_id, tenant_id, op_id)
                
                # If no role found for this user in this tenant, permission denied
                if not user_role:
                    logger.debug(f"[{op_id}] No role found for user '{user_id}' in tenant '{tenant_id}'")
                    return False
                
                # Check resource-specific permissions first if applicable
                if resource_type and resource_id:
                    # Check if user has permission for this specific resource
                    if self._check_resource_permission(
                        user_id, permission, resource_type, resource_id, op_id
                    ):
                        return True
                
                # Check user-specific permissions overrides
                if user_id in self.user_permissions:
                    # Check if user has an explicit deny for this permission
                    if f"!{permission}" in self.user_permissions[user_id]:
                        logger.debug(f"[{op_id}] User '{user_id}' has explicit deny for '{permission}'")
                        return False
                    
                    # Check if user has an explicit allow for this permission
                    if permission in self.user_permissions[user_id]:
                        logger.debug(f"[{op_id}] User '{user_id}' has explicit allow for '{permission}'")
                        return True
                
                # Check role-based permissions
                has_perm = self.has_permission(user_role, permission, op_id)
                
                # Log performance metrics
                elapsed_ms = int((time.time() - start_time) * 1000)
                if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                    logger.warning(f"[{op_id}] Slow permission check: {elapsed_ms}ms")
                else:
                    logger.debug(f"[{op_id}] Permission check completed in {elapsed_ms}ms")
                
                return has_perm
                
        except Exception as e:
            logger.error(f"[{op_id}] Error checking permission: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return False on error to be safe
            return False
    
    def _get_user_role(
        self, 
        user_id: str, 
        tenant_id: Optional[str] = None,
        operation_id: Optional[str] = None
    ) -> Optional[str]:
        """
        Get a user's role in a specific tenant context.
        
        Args:
            user_id (str): The user ID
            tenant_id (Optional[str], optional): The tenant context. Defaults to None.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            Optional[str]: The user's role, or None if not found
        """
        op_id = operation_id or f"get_user_role_{int(time.time() * 1000)}"
        
        try:
            if tenant_id and tenant_id in self.tenant_roles:
                if user_id in self.tenant_roles[tenant_id]:
                    # User has a specific role in this tenant
                    return self.tenant_roles[tenant_id][user_id]
            
            # Check if user has a global role (when tenant_id is None)
            if None in self.tenant_roles and user_id in self.tenant_roles[None]:
                return self.tenant_roles[None][user_id]
            
            # No role found for this user
            return None
            
        except Exception as e:
            logger.error(f"[{op_id}] Error getting user role: {str(e)}")
            # Return None on error to be safe
            return None
    
    def _check_resource_permission(
        self, 
        user_id: str, 
        permission: str,
        resource_type: str,
        resource_id: str,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Check if a user has permission for a specific resource.
        
        Args:
            user_id (str): The user ID
            permission (str): The permission to check
            resource_type (str): The resource type
            resource_id (str): The resource ID
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            bool: True if the user has permission for the resource, False otherwise
        """
        op_id = operation_id or f"check_resource_{int(time.time() * 1000)}"
        
        try:
            # Check if resource type exists
            if resource_type not in self.resource_permissions:
                return False
            
            # Check if resource ID exists
            if resource_id not in self.resource_permissions[resource_type]:
                return False
            
            # Check if user has permissions for this resource
            if user_id not in self.resource_permissions[resource_type][resource_id]:
                return False
            
            # Get user's permissions for this resource
            user_resource_perms = self.resource_permissions[resource_type][resource_id][user_id]
            
            # Check explicit deny
            if f"!{permission}" in user_resource_perms:
                return False
            
            # Check explicit allow or wildcard
            return permission in user_resource_perms or "*" in user_resource_perms
            
        except Exception as e:
            logger.error(f"[{op_id}] Error checking resource permission: {str(e)}")
            # Return False on error to be safe
            return False
    
    def set_user_role(
        self, 
        user_id: str, 
        role: str, 
        tenant_id: Optional[str] = None,
        changed_by: Optional[str] = None,
        reason: Optional[str] = None,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Set a user's role in a specific tenant context.
        
        Args:
            user_id (str): The user ID
            role (str): The role to assign
            tenant_id (Optional[str], optional): The tenant context. Defaults to None.
            changed_by (Optional[str], optional): ID of the user making the change. Defaults to None.
            reason (Optional[str], optional): Reason for the change. Defaults to None.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            bool: True if the role was successfully set, False otherwise
            
        Example:
            ```python
            # Set a user's role to MANAGER in a specific tenant
            success = rbac_manager.set_user_role(
                user_id="user123",
                role="manager",
                tenant_id="tenant456",
                changed_by="admin789",
                reason="Promotion to team manager"
            )
            ```
        """
        op_id = operation_id or f"set_user_role_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not user_id or not isinstance(user_id, str):
                logger.error(f"[{op_id}] Invalid user_id parameter: {user_id}")
                return False
                
            if not role or not isinstance(role, str):
                logger.error(f"[{op_id}] Invalid role parameter: {role}")
                return False
            
            # Ensure the role is valid
            try:
                role_enum = Role(role)
            except ValueError:
                logger.error(f"[{op_id}] Invalid role value: {role}")
                return False
            
            logger.debug(
                f"[{op_id}] Setting role '{role}' for user '{user_id}'" +
                (f" in tenant '{tenant_id}'" if tenant_id else "") +
                (f" by user '{changed_by}'" if changed_by else "")
            )
            
            with self.lock:
                # Get the old role for logging
                old_role = self._get_user_role(user_id, tenant_id, op_id)
                
                # Initialize tenant dict if needed
                if tenant_id not in self.tenant_roles:
                    self.tenant_roles[tenant_id] = {}
                
                # Set the user's role
                self.tenant_roles[tenant_id][user_id] = role
                
                # Track the change for auditing
                if changed_by:
                    change_record = {
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "changed_by": changed_by,
                        "user_id": user_id,
                        "tenant_id": tenant_id,
                        "old_role": old_role,
                        "new_role": role,
                        "reason": reason,
                        "operation_id": op_id
                    }
                    
                    # Add to permission history
                    if user_id not in self.permission_history:
                        self.permission_history[user_id] = []
                    
                    self.permission_history[user_id].append(change_record)
            
            # Log the change in security monitoring
            if changed_by:
                log_security_event(
                    event_type=SecurityEventType.PERMISSION_GRANTED,
                    user_id=user_id,
                    tenant_id=tenant_id,
                    details={
                        "changed_by": changed_by,
                        "old_role": old_role,
                        "new_role": role,
                        "reason": reason,
                        "operation_id": op_id
                    },
                    alert_level=SecurityAlertLevel.MEDIUM,
                    operation_id=op_id
                )
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow role assignment: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Role assignment completed in {elapsed_ms}ms")
            
            return True
            
        except Exception as e:
            logger.error(f"[{op_id}] Error setting user role: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            return False
    
    def grant_permission(
        self, 
        user_id: str, 
        permission: str,
        tenant_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        granted_by: Optional[str] = None,
        reason: Optional[str] = None,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Grant a specific permission to a user.
        
        This method grants a permission to a user, which can override their role-based
        permissions. Permissions can be granted globally or for specific resources.
        
        Args:
            user_id (str): The user ID
            permission (str): The permission to grant
            tenant_id (Optional[str], optional): The tenant context. Defaults to None.
            resource_type (Optional[str], optional): The resource type. Defaults to None.
            resource_id (Optional[str], optional): The specific resource ID. Defaults to None.
            granted_by (Optional[str], optional): ID of the user granting the permission. Defaults to None.
            reason (Optional[str], optional): Reason for granting the permission. Defaults to None.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            bool: True if the permission was successfully granted, False otherwise
            
        Example:
            ```python
            # Grant a user permission to edit a specific document
            success = rbac_manager.grant_permission(
                user_id="user123",
                permission="document:edit",
                tenant_id="tenant456",
                resource_type="document",
                resource_id="doc789",
                granted_by="admin001",
                reason="Temporary access for project completion"
            )
            ```
        """
        op_id = operation_id or f"grant_perm_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not user_id or not isinstance(user_id, str):
                logger.error(f"[{op_id}] Invalid user_id parameter: {user_id}")
                return False
                
            if not permission or not isinstance(permission, str):
                logger.error(f"[{op_id}] Invalid permission parameter: {permission}")
                return False
            
            logger.debug(
                f"[{op_id}] Granting permission '{permission}' to user '{user_id}'" +
                (f" in tenant '{tenant_id}'" if tenant_id else "") +
                (f" for {resource_type}/{resource_id}" if resource_type and resource_id else "")
            )
            
            with self.lock:
                if resource_type and resource_id:
                    # Handle resource-specific permission
                    return self._grant_resource_permission(
                        user_id, permission, resource_type, resource_id,
                        granted_by, reason, op_id
                    )
                
                # Handle global permission
                if user_id not in self.user_permissions:
                    self.user_permissions[user_id] = set()
                
                # Add the permission
                self.user_permissions[user_id].add(permission)
                
                # Remove any explicit deny for this permission if it exists
                deny_perm = f"!{permission}"
                if deny_perm in self.user_permissions[user_id]:
                    self.user_permissions[user_id].remove(deny_perm)
                
                # Track the change for auditing
                if granted_by:
                    change_record = {
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "granted_by": granted_by,
                        "user_id": user_id,
                        "tenant_id": tenant_id,
                        "permission": permission,
                        "action": "granted",
                        "reason": reason,
                        "operation_id": op_id
                    }
                    
                    # Add to permission history
                    if user_id not in self.permission_history:
                        self.permission_history[user_id] = []
                    
                    self.permission_history[user_id].append(change_record)
            
            # Log the change in security monitoring
            if granted_by:
                log_security_event(
                    event_type=SecurityEventType.PERMISSION_GRANTED,
                    user_id=user_id,
                    tenant_id=tenant_id,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    details={
                        "granted_by": granted_by,
                        "permission": permission,
                        "reason": reason,
                        "operation_id": op_id
                    },
                    alert_level=SecurityAlertLevel.MEDIUM,
                    operation_id=op_id
                )
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow permission grant: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Permission grant completed in {elapsed_ms}ms")
            
            return True
            
        except Exception as e:
            logger.error(f"[{op_id}] Error granting permission: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            return False
    
    def _grant_resource_permission(
        self, 
        user_id: str, 
        permission: str,
        resource_type: str,
        resource_id: str,
        granted_by: Optional[str] = None,
        reason: Optional[str] = None,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Grant a permission for a specific resource to a user.
        
        Args:
            user_id (str): The user ID
            permission (str): The permission to grant
            resource_type (str): The resource type
            resource_id (str): The resource ID
            granted_by (Optional[str], optional): ID of the user granting the permission. Defaults to None.
            reason (Optional[str], optional): Reason for granting the permission. Defaults to None.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            bool: True if the permission was successfully granted, False otherwise
        """
        op_id = operation_id or f"grant_resource_{int(time.time() * 1000)}"
        
        try:
            # Initialize resource type dict if needed
            if resource_type not in self.resource_permissions:
                self.resource_permissions[resource_type] = {}
            
            # Initialize resource ID dict if needed
            if resource_id not in self.resource_permissions[resource_type]:
                self.resource_permissions[resource_type][resource_id] = {}
            
            # Initialize user permissions set if needed
            if user_id not in self.resource_permissions[resource_type][resource_id]:
                self.resource_permissions[resource_type][resource_id][user_id] = set()
            
            # Add the permission
            self.resource_permissions[resource_type][resource_id][user_id].add(permission)
            
            # Remove any explicit deny for this permission if it exists
            deny_perm = f"!{permission}"
            if deny_perm in self.resource_permissions[resource_type][resource_id][user_id]:
                self.resource_permissions[resource_type][resource_id][user_id].remove(deny_perm)
            
            # Track the change for auditing
            if granted_by:
                change_record = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "granted_by": granted_by,
                    "user_id": user_id,
                    "resource_type": resource_type,
                    "resource_id": resource_id,
                    "permission": permission,
                    "action": "granted",
                    "reason": reason,
                    "resource_specific": True,
                    "operation_id": op_id
                }
                
                # Add to permission history
                if user_id not in self.permission_history:
                    self.permission_history[user_id] = []
                
                self.permission_history[user_id].append(change_record)
            
            return True
            
        except Exception as e:
            logger.error(f"[{op_id}] Error granting resource permission: {str(e)}")
            return False
    
    def revoke_permission(
        self, 
        user_id: str, 
        permission: str,
        tenant_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        revoked_by: Optional[str] = None,
        reason: Optional[str] = None,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Revoke a specific permission from a user.
        
        This method revokes a permission from a user, which can override their role-based
        permissions. Permissions can be revoked globally or for specific resources.
        
        Args:
            user_id (str): The user ID
            permission (str): The permission to revoke
            tenant_id (Optional[str], optional): The tenant context. Defaults to None.
            resource_type (Optional[str], optional): The resource type. Defaults to None.
            resource_id (Optional[str], optional): The specific resource ID. Defaults to None.
            revoked_by (Optional[str], optional): ID of the user revoking the permission. Defaults to None.
            reason (Optional[str], optional): Reason for revoking the permission. Defaults to None.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            bool: True if the permission was successfully revoked, False otherwise
            
        Example:
            ```python
            # Revoke a user's permission to delete documents
            success = rbac_manager.revoke_permission(
                user_id="user123",
                permission="document:delete",
                tenant_id="tenant456",
                revoked_by="admin001",
                reason="Security policy update"
            )
            ```
        """
        op_id = operation_id or f"revoke_perm_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not user_id or not isinstance(user_id, str):
                logger.error(f"[{op_id}] Invalid user_id parameter: {user_id}")
                return False
                
            if not permission or not isinstance(permission, str):
                logger.error(f"[{op_id}] Invalid permission parameter: {permission}")
                return False
            
            logger.debug(
                f"[{op_id}] Revoking permission '{permission}' from user '{user_id}'" +
                (f" in tenant '{tenant_id}'" if tenant_id else "") +
                (f" for {resource_type}/{resource_id}" if resource_type and resource_id else "")
            )
            
            with self.lock:
                if resource_type and resource_id:
                    # Handle resource-specific permission
                    return self._revoke_resource_permission(
                        user_id, permission, resource_type, resource_id,
                        revoked_by, reason, op_id
                    )
                
                # Handle global permission
                if user_id not in self.user_permissions:
                    self.user_permissions[user_id] = set()
                
                # Add explicit deny for this permission
                deny_perm = f"!{permission}"
                self.user_permissions[user_id].add(deny_perm)
                
                # Remove any explicit allow for this permission if it exists
                if permission in self.user_permissions[user_id]:
                    self.user_permissions[user_id].remove(permission)
                
                # Track the change for auditing
                if revoked_by:
                    change_record = {
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "revoked_by": revoked_by,
                        "user_id": user_id,
                        "tenant_id": tenant_id,
                        "permission": permission,
                        "action": "revoked",
                        "reason": reason,
                        "operation_id": op_id
                    }
                    
                    # Add to permission history
                    if user_id not in self.permission_history:
                        self.permission_history[user_id] = []
                    
                    self.permission_history[user_id].append(change_record)
            
            # Log the change in security monitoring
            if revoked_by:
                log_security_event(
                    event_type=SecurityEventType.PERMISSION_REVOKED,
                    user_id=user_id,
                    tenant_id=tenant_id,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    details={
                        "revoked_by": revoked_by,
                        "permission": permission,
                        "reason": reason,
                        "operation_id": op_id
                    },
                    alert_level=SecurityAlertLevel.MEDIUM,
                    operation_id=op_id
                )
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow permission revocation: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Permission revocation completed in {elapsed_ms}ms")
            
            return True
            
        except Exception as e:
            logger.error(f"[{op_id}] Error revoking permission: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            return False
    
    def _revoke_resource_permission(
        self, 
        user_id: str, 
        permission: str,
        resource_type: str,
        resource_id: str,
        revoked_by: Optional[str] = None,
        reason: Optional[str] = None,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Revoke a permission for a specific resource from a user.
        
        Args:
            user_id (str): The user ID
            permission (str): The permission to revoke
            resource_type (str): The resource type
            resource_id (str): The resource ID
            revoked_by (Optional[str], optional): ID of the user revoking the permission. Defaults to None.
            reason (Optional[str], optional): Reason for revoking the permission. Defaults to None.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            bool: True if the permission was successfully revoked, False otherwise
        """
        op_id = operation_id or f"revoke_resource_{int(time.time() * 1000)}"
        
        try:
            # Check if resource type exists
            if resource_type not in self.resource_permissions:
                self.resource_permissions[resource_type] = {}
            
            # Check if resource ID exists
            if resource_id not in self.resource_permissions[resource_type]:
                self.resource_permissions[resource_type][resource_id] = {}
            
            # Check if user has permissions for this resource
            if user_id not in self.resource_permissions[resource_type][resource_id]:
                self.resource_permissions[resource_type][resource_id][user_id] = set()
            
            # Add explicit deny for this permission
            deny_perm = f"!{permission}"
            self.resource_permissions[resource_type][resource_id][user_id].add(deny_perm)
            
            # Remove any explicit allow for this permission if it exists
            if permission in self.resource_permissions[resource_type][resource_id][user_id]:
                self.resource_permissions[resource_type][resource_id][user_id].remove(permission)
            
            # Track the change for auditing
            if revoked_by:
                change_record = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "revoked_by": revoked_by,
                    "user_id": user_id,
                    "resource_type": resource_type,
                    "resource_id": resource_id,
                    "permission": permission,
                    "action": "revoked",
                    "reason": reason,
                    "resource_specific": True,
                    "operation_id": op_id
                }
                
                # Add to permission history
                if user_id not in self.permission_history:
                    self.permission_history[user_id] = []
                
                self.permission_history[user_id].append(change_record)
            
            return True
            
        except Exception as e:
            logger.error(f"[{op_id}] Error revoking resource permission: {str(e)}")
            return False
    
    def reset_permissions(
        self, 
        user_id: str, 
        tenant_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        reset_by: Optional[str] = None,
        reason: Optional[str] = None,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Reset a user's permissions to their role-based defaults.
        
        This method removes all custom permission grants and denials for a user,
        effectively resetting them to the default permissions for their role.
        
        Args:
            user_id (str): The user ID
            tenant_id (Optional[str], optional): The tenant context. Defaults to None.
            resource_type (Optional[str], optional): The resource type. Defaults to None.
            resource_id (Optional[str], optional): The specific resource ID. Defaults to None.
            reset_by (Optional[str], optional): ID of the user resetting the permissions. Defaults to None.
            reason (Optional[str], optional): Reason for resetting permissions. Defaults to None.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            bool: True if the permissions were successfully reset, False otherwise
            
        Example:
            ```python
            # Reset all custom permissions for a user
            success = rbac_manager.reset_permissions(
                user_id="user123",
                tenant_id="tenant456",
                reset_by="admin001",
                reason="Annual security review"
            )
            ```
        """
        op_id = operation_id or f"reset_perms_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not user_id or not isinstance(user_id, str):
                logger.error(f"[{op_id}] Invalid user_id parameter: {user_id}")
                return False
            
            logger.debug(
                f"[{op_id}] Resetting permissions for user '{user_id}'" +
                (f" in tenant '{tenant_id}'" if tenant_id else "") +
                (f" for {resource_type}/{resource_id}" if resource_type and resource_id else "")
            )
            
            with self.lock:
                if resource_type and resource_id:
                    # Reset resource-specific permissions
                    if (resource_type in self.resource_permissions and 
                        resource_id in self.resource_permissions[resource_type] and
                        user_id in self.resource_permissions[resource_type][resource_id]):
                        # Clear all permissions for this resource
                        self.resource_permissions[resource_type][resource_id][user_id] = set()
                else:
                    # Reset global permissions
                    if user_id in self.user_permissions:
                        # Clear all custom permissions
                        self.user_permissions[user_id] = set()
                
                # Track the change for auditing
                if reset_by:
                    change_record = {
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "reset_by": reset_by,
                        "user_id": user_id,
                        "tenant_id": tenant_id,
                        "resource_type": resource_type,
                        "resource_id": resource_id,
                        "action": "reset",
                        "reason": reason,
                        "operation_id": op_id
                    }
                    
                    # Add to permission history
                    if user_id not in self.permission_history:
                        self.permission_history[user_id] = []
                    
                    self.permission_history[user_id].append(change_record)
            
            # Log the change in security monitoring
            if reset_by:
                log_security_event(
                    event_type=SecurityEventType.PERMISSION_REVOKED,
                    user_id=user_id,
                    tenant_id=tenant_id,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    details={
                        "reset_by": reset_by,
                        "action": "reset",
                        "reason": reason,
                        "operation_id": op_id
                    },
                    alert_level=SecurityAlertLevel.MEDIUM,
                    operation_id=op_id
                )
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow permission reset: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Permission reset completed in {elapsed_ms}ms")
            
            return True
            
        except Exception as e:
            logger.error(f"[{op_id}] Error resetting permissions: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            return False


# Create a global instance for app-wide use
rbac_manager = RBACManager()

# Initialize with test adapter integration if available
try:
    from backend.test.test_adapters.auth.rbac_adapter import RBACAdapter
    test_adapter = RBACAdapter()
    
    # Initialize the rbac_manager with test adapter's role hierarchy and permissions
    # for testing purposes, if in test mode
    import os
    if os.environ.get('TEST_MODE') == 'true':
        logger.info("Initializing RBAC system with test adapter configuration")
        # Initialize roles from test adapter
        for role, permissions in test_adapter.role_permissions.items():
            if role in rbac_manager.role_permissions:
                rbac_manager.role_permissions[Role(role)] = permissions
        
        # Additional initialization as needed for testing
except ImportError:
    # Not in a testing context, use standard configuration
    logger.debug("Using standard RBAC configuration (test adapter not available)")


# Helper functions for common operations
def check_permission(
    user_id: str,
    permission: str,
    tenant_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    operation_id: Optional[str] = None
) -> bool:
    """
    Check if a user has a specific permission.
    
    This is a utility function that delegates to the global RBAC manager.
    
    Args:
        user_id (str): The user ID to check
        permission (str): The permission to check for
        tenant_id (Optional[str], optional): The tenant context. Defaults to None.
        resource_type (Optional[str], optional): The resource type. Defaults to None.
        resource_id (Optional[str], optional): The specific resource ID. Defaults to None.
        operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
        
    Returns:
        bool: True if the user has the permission, False otherwise
        
    Example:
        ```python
        # Check if a user can view a specific document
        from backend.utils.security.rbac import check_permission
        
        if check_permission(
            user_id="user123",
            permission="document:view",
            tenant_id="tenant456",
            resource_type="document",
            resource_id="doc789"
        ):
            # User has permission to view the document
            return get_document("doc789")
        else:
            # User does not have permission
            raise HTTPException(status_code=403, detail="Permission denied")
        ```
    """
    return rbac_manager.check_permission(
        user_id=user_id,
        permission=permission,
        tenant_id=tenant_id,
        resource_type=resource_type,
        resource_id=resource_id,
        operation_id=operation_id
    )


def get_role_permissions(role: str, operation_id: Optional[str] = None) -> List[str]:
    """
    Get all permissions for a role, including inherited permissions.
    
    This is a utility function that delegates to the global RBAC manager.
    
    Args:
        role (str): The role to get permissions for
        operation_id (Optional[str], optional): Correlation ID for logging
        
    Returns:
        List[str]: List of permission strings for the role
        
    Example:
        ```python
        # Get all permissions for the MANAGER role
        from backend.utils.security.rbac import get_role_permissions
        
        manager_permissions = get_role_permissions("MANAGER")
        print(f"Manager role has {len(manager_permissions)} permissions")
        ```
    """
    permissions = rbac_manager.get_role_permissions(role, operation_id)
    return list(permissions) if permissions else []


def set_user_role(
    user_id: str,
    role: str,
    tenant_id: Optional[str] = None,
    changed_by: Optional[str] = None,
    reason: Optional[str] = None,
    operation_id: Optional[str] = None
) -> bool:
    """
    Set a user's role in a specific tenant context.
    
    This is a utility function that delegates to the global RBAC manager.
    
    Args:
        user_id (str): The user ID
        role (str): The role to assign
        tenant_id (Optional[str], optional): The tenant context. Defaults to None.
        changed_by (Optional[str], optional): ID of the user making the change. Defaults to None.
        reason (Optional[str], optional): Reason for the change. Defaults to None.
        operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
        
    Returns:
        bool: True if the role was successfully set, False otherwise
        
    Example:
        ```python
        # Set a user's role to MANAGER in a specific tenant
        from backend.utils.security.rbac import set_user_role
        
        success = set_user_role(
            user_id="user123",
            role="MANAGER",
            tenant_id="tenant456",
            changed_by="admin789",
            reason="Promotion to team manager"
        )
        
        if success:
            print("Role updated successfully")
        else:
            print("Failed to update role")
        ```
    """
    return rbac_manager.set_user_role(
        user_id=user_id,
        role=role,
        tenant_id=tenant_id,
        changed_by=changed_by,
        reason=reason,
        operation_id=operation_id
    )