"""
Role-Based Access Control (RBAC) adapter for testing.

This module provides mock API endpoints for testing role-based access control.
"""

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from fastapi import status as http_status
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timezone

from ..entity_registry import BaseTestAdapter

class RBACAdapter(BaseTestAdapter):
    """
    Mock RBAC adapter for testing without database dependencies.
    """
    
    def __init__(self, registry=None):
        """
        Initialize the RBAC adapter.
        
        Args:
            registry: Optional entity registry for cross-adapter synchronization
        """
        super().__init__(registry)
        
        # Mock data storage
        self.resources = {
            "users": {},
            "integrations": {},
            "transformations": {},
            "settings": {},
            "logs": [
                {"timestamp": "2025-01-01T00:00:00Z", "level": "INFO", "message": "System started"},
                {"timestamp": "2025-01-01T01:00:00Z", "level": "WARNING", "message": "High memory usage"}
            ]
        }
        
        # Define role permissions
        self.role_permissions = {
            "ADMIN": ["*:*"],  # All permissions
            "USER": ["read:*", "write:own", "update:own", "delete:own"],
            "READONLY": ["read:*"]
        }
    
    def reset(self):
        """Reset all mock data."""
        self.resources = {
            "users": {},
            "integrations": {},
            "transformations": {},
            "settings": {},
            "logs": [
                {"timestamp": "2025-01-01T00:00:00Z", "level": "INFO", "message": "System started"},
                {"timestamp": "2025-01-01T01:00:00Z", "level": "WARNING", "message": "High memory usage"}
            ]
        }
    
    def check_permission(self, user_id, resource, action, session_token=None):
        """
        Check if a user has permission to perform an action on a resource.
        
        Args:
            user_id: ID of the user to check
            resource: Resource type to check access for
            action: Action to perform (VIEW, CREATE, UPDATE, DELETE, etc.)
            session_token: Optional session token for additional verification
            
        Returns:
            Dictionary with allowed status and details
        """
        user = self.resources["users"].get(user_id)
        if not user:
            # Add the user to resources with default role
            user = {
                "id": user_id,
                "role": "USER"  # Default role
            }
            self.resources["users"][user_id] = user
        
        role = user.get("role", "USER")
        user_roles = self.get_user_roles(user_id)
        
        # Admin or user with admin role can do everything
        if role == "ADMIN" or "ADMIN" in user_roles:
            return {"allowed": True, "message": "Admin access granted"}
        
        # Data analyst can access reports
        if resource == "REPORTS" and action == "VIEW" and "DATA_ANALYST" in user_roles:
            return {"allowed": True, "message": "Data analyst access granted"}
        
        # Admin dashboard is only for admins
        if resource == "ADMIN_DASHBOARD" and action == "ACCESS":
            return {"allowed": False, "message": "Admin access required"}
        
        # Read-only can only read
        if role == "READONLY" and action in ["VIEW", "LIST", "GET"]:
            return {"allowed": True, "message": "Read-only access granted"}
        elif role == "READONLY":
            return {"allowed": False, "message": "Read-only users cannot perform this action"}
        
        # Regular user can read anything and modify their own resources
        if role == "USER":
            if action in ["VIEW", "LIST", "GET"]:
                return {"allowed": True, "message": "User access granted"}
            elif action in ["CREATE", "UPDATE", "DELETE"] and resource != "ADMIN":
                # Check if user owns the resource
                if resource in self.resources and "owner_id" in self.resources[resource]:
                    if self.resources[resource]["owner_id"] == user_id:
                        return {"allowed": True, "message": "Owner access granted"}
                    return {"allowed": False, "message": "Not the resource owner"}
                return {"allowed": True, "message": "User access granted"}
            else:
                return {"allowed": False, "message": "Insufficient permissions"}
        
        # Default to denying access
        return {"allowed": False, "message": "Default denial - no matching permission rule"}
    
    def add_resource(self, resource_type, resource_data, owner_id=None):
        """Add a resource to the mock data store."""
        if resource_type not in self.resources:
            self.resources[resource_type] = {}
            
        resource_id = resource_data.get("id", str(uuid.uuid4()))
        resource_data["id"] = resource_id
        
        if owner_id:
            resource_data["owner_id"] = owner_id
            
        self.resources[resource_type][resource_id] = resource_data
        return resource_data
    
    def get_resource(self, resource_type, resource_id):
        """Get a resource by ID."""
        if resource_type not in self.resources:
            return None
            
        return self.resources[resource_type].get(resource_id)
    
    def list_resources(self, resource_type):
        """List all resources of a given type."""
        if resource_type not in self.resources:
            return []
            
        return list(self.resources[resource_type].values())
    
    def update_resource(self, resource_type, resource_id, resource_data, user_id):
        """Update a resource if the user has permission."""
        if not self.check_permission(user_id, resource_type, "update"):
            return {"error": "Permission denied", "status_code": 403}
            
        resource = self.get_resource(resource_type, resource_id)
        if not resource:
            return {"error": "Resource not found", "status_code": 404}
            
        # Check ownership
        if resource.get("owner_id") != user_id and not self.check_permission(user_id, resource_type, "admin"):
            return {"error": "Permission denied", "status_code": 403}
            
        # Update resource
        for key, value in resource_data.items():
            if key != "id" and key != "owner_id":  # Don't allow changing ID or owner
                resource[key] = value
                
        return resource
    
    def delete_resource(self, resource_type, resource_id, user_id):
        """Delete a resource if the user has permission."""
        if not self.check_permission(user_id, resource_type, "delete"):
            return {"error": "Permission denied", "status_code": 403}
            
        resource = self.get_resource(resource_type, resource_id)
        if not resource:
            return {"error": "Resource not found", "status_code": 404}
            
        # Check ownership
        if resource.get("owner_id") != user_id and not self.check_permission(user_id, resource_type, "admin"):
            return {"error": "Permission denied", "status_code": 403}
            
        # Delete resource
        del self.resources[resource_type][resource_id]
        return {"message": "Resource deleted successfully"}
        
    def assign_role(self, user_id, role, assigned_by, source=None):
        """
        Assign a role to a user.
        
        Args:
            user_id: ID of the user to assign the role to
            role: Role to assign
            assigned_by: ID of the user assigning the role
            source: Optional source of the role assignment (e.g., "OAUTH")
            
        Returns:
            Dictionary with assignment result
        """
        # Always return success for testing purposes
        # In a real implementation, this would check permissions
        
        # Get user
        user = self.resources["users"].get(user_id)
        if not user:
            # Create the user if not exists
            user = {
                "id": user_id,
                "role": "USER",  # Default role
                "roles": []      # Additional roles
            }
            self.resources["users"][user_id] = user
        
        # Make sure user has a roles list
        if "roles" not in user:
            user["roles"] = []
            
        # Add role if not already assigned
        if role not in user["roles"]:
            user["roles"].append(role)
            
        # Track role source if provided
        if source and "role_sources" not in user:
            user["role_sources"] = {}
            
        if source and "role_sources" in user:
            if role not in user["role_sources"]:
                user["role_sources"][role] = []
            if source not in user["role_sources"][role]:
                user["role_sources"][role].append(source)
            
        return {
            "success": True,
            "user_id": user_id,
            "role": role,
            "assigned_by": assigned_by,
            "source": source,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    def get_user_roles(self, user_id):
        """
        Get all roles assigned to a user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            List of roles assigned to the user
        """
        user = self.resources["users"].get(user_id)
        if not user:
            return []
            
        # Get primary role
        primary_role = user.get("role", "USER")
        
        # Get additional roles
        additional_roles = user.get("roles", [])
        
        # Combine roles, ensuring uniqueness
        all_roles = [primary_role]
        for role in additional_roles:
            if role not in all_roles:
                all_roles.append(role)
                
        return all_roles
        
    def remove_role(self, user_id, role, source=None):
        """
        Remove a role from a user.
        
        Args:
            user_id: ID of the user
            role: Role to remove
            source: Optional source of the role assignment (e.g., "OAUTH")
            
        Returns:
            Dictionary with removal result
        """
        user = self.resources["users"].get(user_id)
        if not user:
            return {"success": False, "error": "User not found"}
            
        # Cannot remove primary role
        if user.get("role") == role:
            return {"success": False, "error": "Cannot remove primary role"}
            
        # Check if user has the role
        if "roles" not in user or role not in user["roles"]:
            return {"success": False, "error": "User does not have the specified role"}
            
        # If source is specified, only remove role if it comes from that source
        if source and "role_sources" in user and role in user["role_sources"]:
            sources = user["role_sources"].get(role, [])
            if source not in sources:
                return {"success": False, "error": f"Role {role} was not assigned by {source}"}
                
            # Remove source from the role's sources
            user["role_sources"][role].remove(source)
            
            # If no sources left for this role, remove the role
            if not user["role_sources"][role]:
                user["roles"].remove(role)
                del user["role_sources"][role]
        else:
            # Remove role
            user["roles"].remove(role)
            
            # Remove from role_sources if applicable
            if "role_sources" in user and role in user["role_sources"]:
                del user["role_sources"][role]
        
        return {
            "success": True,
            "user_id": user_id,
            "role": role,
            "source": source,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# Import auth functions
from .auth_adapter import get_current_user

# Create router
router = APIRouter()

# Mock data stores
mock_resources = {
    "users": {},
    "integrations": {},
    "transformations": {},
    "settings": {},
    "logs": [
        {"timestamp": "2025-01-01T00:00:00Z", "level": "INFO", "message": "System started"},
        {"timestamp": "2025-01-01T01:00:00Z", "level": "WARNING", "message": "High memory usage"}
    ]
}

# Permission check function
def check_permission(user: Dict[str, Any], resource: str, action: str) -> bool:
    """Check if a user has permission to perform an action on a resource."""
    if not user:
        return False
    
    role = user.get("role", "USER")
    
    # Admin can do everything
    if role == "ADMIN":
        return True
    
    # Read-only can only read
    if role == "READONLY" and action in ["read", "get", "list"]:
        return True
    elif role == "READONLY":
        return False
    
    # Regular user can read anything and modify their own resources
    if role == "USER":
        if action in ["read", "get", "list"]:
            return True
        elif action in ["create", "update", "delete"] and resource != "admin":
            return True
        else:
            return False
    
    # Custom role with specific permissions
    if role == "CUSTOM_TESTER":
        if resource in ["integrations", "transformations"] and action in ["read", "get", "list"]:
            return True
        else:
            return False
    
    # Default to denying access
    return False

# Admin endpoints
@router.get("/admin/settings")
async def get_admin_settings(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get admin settings (admin only)."""
    if not check_permission(current_user, "admin", "read"):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    return {"settings": "Admin settings data"}

@router.get("/admin/users")
async def list_users(current_user: Dict[str, Any] = Depends(get_current_user)):
    """List users (admin only)."""
    if not check_permission(current_user, "admin", "read"):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    return {"users": list(mock_resources["users"].values())}

@router.get("/admin/logs")
async def get_admin_logs(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get admin logs (admin only)."""
    if not check_permission(current_user, "admin", "read"):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    return {"logs": [
        {"timestamp": "2025-01-01T00:00:00Z", "level": "INFO", "message": "System started"},
        {"timestamp": "2025-01-01T01:00:00Z", "level": "WARNING", "message": "High memory usage"}
    ]}

# User profile endpoints
@router.post("/users/me/profile")
async def update_user_profile(
    data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update user profile."""
    if not check_permission(current_user, "users", "update"):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    # This would only be allowed with proper CSRF protection in a real app
    user_id = current_user.get("id")
    
    # Update user profile
    user = mock_resources["users"].get(user_id, {})
    for key, value in data.items():
        user[key] = value
    
    mock_resources["users"][user_id] = user
    
    return user

# Integration endpoints
@router.get("/integrations")
async def list_integrations(current_user: Dict[str, Any] = Depends(get_current_user)):
    """List integrations."""
    if not check_permission(current_user, "integrations", "read"):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    return list(mock_resources["integrations"].values())

@router.post("/integrations", status_code=http_status.HTTP_201_CREATED)
async def create_integration(
    data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new integration."""
    if not check_permission(current_user, "integrations", "create"):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    integration_id = str(uuid.uuid4())
    
    integration = {
        "id": integration_id,
        "name": data.get("name"),
        "description": data.get("description"),
        "type": data.get("type"),
        "schedule": data.get("schedule"),
        "owner_id": current_user.get("id"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    mock_resources["integrations"][integration_id] = integration
    
    return integration

@router.get("/integrations/{integration_id}")
async def get_integration(
    integration_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get integration details."""
    if not check_permission(current_user, "integrations", "read"):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    if integration_id not in mock_resources["integrations"]:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    return mock_resources["integrations"][integration_id]