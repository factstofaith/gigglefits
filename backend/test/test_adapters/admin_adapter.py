"""
Admin Test Adapter

This module provides a test adapter for admin functionality, implementing the BaseTestAdapter pattern.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Union

from .entity_registry import BaseTestAdapter, EntityAction


class AdminTestAdapter(BaseTestAdapter):
    """Test adapter for admin functionality."""
    
    def __init__(self, registry=None):
        """Initialize the adapter with an entity registry."""
        super().__init__(registry)
        self.applications = {}
        self.datasets = {}
        self.releases = {}
        self.webhooks = {}
        self.tenants = {}
        self.tenant_app_associations = {}
        self.tenant_dataset_associations = {}
        
        # Register listeners for relevant entity types
        self.registry.register_listener("User", self._handle_entity_change)
        self.registry.register_listener("Tenant", self._handle_entity_change)
    
    def reset(self):
        """Reset the adapter state."""
        self.applications = {}
        self.datasets = {}
        self.releases = {}
        self.webhooks = {}
        self.tenants = {}
        self.tenant_app_associations = {}
        self.tenant_dataset_associations = {}
    
    # Application methods
    def create_application(self, app_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new application."""
        app_id = len(self.applications) + 1
        
        # Create timestamps
        now = datetime.now(timezone.utc)
        
        # Create the application
        application = {
            "id": app_id,
            "created_at": now,
            "updated_at": now,
            **app_data
        }
        
        self.applications[app_id] = application
        
        # Register the entity with the registry
        self._register_entity("Application", str(app_id), application)
        
        return application
    
    def get_application(self, app_id: int) -> Optional[Dict[str, Any]]:
        """Get an application by ID."""
        return self.applications.get(app_id)
    
    def update_application(self, app_id: int, app_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an application."""
        if app_id not in self.applications:
            return None
        
        # Update the application
        application = self.applications[app_id]
        application.update({
            "updated_at": datetime.now(timezone.utc),
            **app_data
        })
        
        # Update the entity in the registry
        self._update_entity("Application", str(app_id), application)
        
        return application
    
    def delete_application(self, app_id: int) -> bool:
        """Delete an application."""
        if app_id not in self.applications:
            return False
        
        # Delete the application
        del self.applications[app_id]
        
        # Delete the entity from the registry
        self._delete_entity("Application", str(app_id))
        
        return True
    
    def list_applications(self) -> List[Dict[str, Any]]:
        """List all applications."""
        return list(self.applications.values())
    
    # Dataset methods
    def create_dataset(self, dataset_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new dataset."""
        dataset_id = len(self.datasets) + 1
        
        # Create timestamps
        now = datetime.now(timezone.utc)
        
        # Create the dataset
        dataset = {
            "id": dataset_id,
            "created_at": now,
            "updated_at": now,
            **dataset_data
        }
        
        self.datasets[dataset_id] = dataset
        
        # Register the entity with the registry
        self._register_entity("Dataset", str(dataset_id), dataset)
        
        return dataset
    
    def get_dataset(self, dataset_id: int) -> Optional[Dict[str, Any]]:
        """Get a dataset by ID."""
        return self.datasets.get(dataset_id)
    
    def update_dataset(self, dataset_id: int, dataset_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a dataset."""
        if dataset_id not in self.datasets:
            return None
        
        # Update the dataset
        dataset = self.datasets[dataset_id]
        dataset.update({
            "updated_at": datetime.now(timezone.utc),
            **dataset_data
        })
        
        # Update the entity in the registry
        self._update_entity("Dataset", str(dataset_id), dataset)
        
        return dataset
    
    def delete_dataset(self, dataset_id: int) -> bool:
        """Delete a dataset."""
        if dataset_id not in self.datasets:
            return False
        
        # Delete the dataset
        del self.datasets[dataset_id]
        
        # Delete the entity from the registry
        self._delete_entity("Dataset", str(dataset_id))
        
        return True
    
    def list_datasets(self) -> List[Dict[str, Any]]:
        """List all datasets."""
        return list(self.datasets.values())
    
    # Release methods
    def create_release(self, release_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new release."""
        release_id = len(self.releases) + 1
        
        # Create timestamps
        now = datetime.now(timezone.utc)
        
        # Create the release
        release = {
            "id": release_id,
            "created_at": now,
            "updated_at": now,
            "completed_at": None,
            **release_data
        }
        
        self.releases[release_id] = release
        
        # Register the entity with the registry
        self._register_entity("Release", str(release_id), release)
        
        return release
    
    def get_release(self, release_id: int) -> Optional[Dict[str, Any]]:
        """Get a release by ID."""
        return self.releases.get(release_id)
    
    def update_release(self, release_id: int, release_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a release."""
        if release_id not in self.releases:
            return None
        
        # Update the release
        release = self.releases[release_id]
        release.update({
            "updated_at": datetime.now(timezone.utc),
            **release_data
        })
        
        # Update the entity in the registry
        self._update_entity("Release", str(release_id), release)
        
        return release
    
    def delete_release(self, release_id: int) -> bool:
        """Delete a release."""
        if release_id not in self.releases:
            return False
        
        # Delete the release
        del self.releases[release_id]
        
        # Delete the entity from the registry
        self._delete_entity("Release", str(release_id))
        
        return True
    
    def list_releases(self) -> List[Dict[str, Any]]:
        """List all releases."""
        return list(self.releases.values())
    
    # Tenant methods
    def create_tenant(self, tenant_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new tenant."""
        tenant_id = tenant_data.get("id") or str(uuid.uuid4())
        created_by = tenant_data.get("created_by")
        
        # Create timestamps
        now = datetime.now(timezone.utc)
        
        # Create the tenant
        tenant = {
            "id": tenant_id,
            "created_at": now,
            "updated_at": now,
            **tenant_data
        }
        
        if "id" in tenant_data and tenant_data["id"] != tenant_id:
            tenant["id"] = tenant_id
        
        self.tenants[tenant_id] = tenant
        
        # Register the entity with the registry
        self._register_entity("Tenant", tenant_id, tenant)
        
        # Add an audit log entry
        if created_by:
            self._add_tenant_audit_log(
                tenant_id=tenant_id,
                operation_type="TENANT_CREATION",
                performed_by=created_by,
                details={
                    "tenant_name": tenant_data.get("name"),
                    "subscription_tier": tenant_data.get("subscription_tier")
                }
            )
        
        return tenant
    
    def get_tenant(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Get a tenant by ID."""
        return self.tenants.get(tenant_id)
    
    def update_tenant(self, tenant_id: str, tenant_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a tenant."""
        if tenant_id not in self.tenants:
            return None
        
        # Update the tenant
        tenant = self.tenants[tenant_id]
        tenant.update({
            "updated_at": datetime.now(timezone.utc),
            **tenant_data
        })
        
        # Update the entity in the registry
        self._update_entity("Tenant", tenant_id, tenant)
        
        return tenant
    
    def delete_tenant(self, tenant_id: str) -> bool:
        """Delete a tenant."""
        if tenant_id not in self.tenants:
            return False
        
        # Delete the tenant
        del self.tenants[tenant_id]
        
        # Delete the entity from the registry
        self._delete_entity("Tenant", tenant_id)
        
        return True
    
    def list_tenants(self) -> List[Dict[str, Any]]:
        """List all tenants."""
        return list(self.tenants.values())
    
    # User-Tenant Management
    def assign_user_to_tenant(self, user_id: str, tenant_id: str, assigned_by: str, role: str) -> Dict[str, Any]:
        """
        Assign a user to a tenant with a specific role.
        
        Args:
            user_id: ID of the user to assign
            tenant_id: ID of the tenant to assign the user to
            assigned_by: ID of the user making the assignment
            role: Role to assign to the user (e.g., "TENANT_ADMIN", "TENANT_USER")
            
        Returns:
            Assignment result information
        """
        # Check if tenant exists
        if tenant_id not in self.tenants:
            return {"success": False, "error": "Tenant not found"}
            
        # Check if user exists in registry
        user = self.registry.get_entity("User", user_id)
        if not user:
            return {"success": False, "error": "User not found"}
            
        # Create the assignment
        assignment_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        assignment = {
            "id": assignment_id,
            "user_id": user_id,
            "tenant_id": tenant_id,
            "role": role,
            "assigned_by": assigned_by,
            "created_at": now,
            "updated_at": now,
            "status": "ACTIVE"
        }
        
        # Store the assignment on the tenant
        tenant = self.tenants[tenant_id]
        if "users" not in tenant:
            tenant["users"] = {}
        tenant["users"][user_id] = assignment
        
        # Update the tenant entity
        self._update_entity("Tenant", tenant_id, tenant)
        
        # Add an audit log entry
        self._add_tenant_audit_log(
            tenant_id=tenant_id,
            operation_type="TENANT_USER_ASSIGNMENT",
            performed_by=assigned_by,
            details={
                "user_id": user_id,
                "role": role
            }
        )
        
        return {
            "success": True, 
            "assignment_id": assignment_id,
            "user_id": user_id,
            "tenant_id": tenant_id,
            "role": role
        }
    
    def get_tenant_users(self, tenant_id: str) -> List[Dict[str, Any]]:
        """
        Get all users assigned to a tenant.
        
        Args:
            tenant_id: ID of the tenant
            
        Returns:
            List of user assignment information
        """
        # Check if tenant exists
        if tenant_id not in self.tenants:
            return []
            
        tenant = self.tenants[tenant_id]
        if "users" not in tenant:
            return []
            
        # Get full user details from registry
        users = []
        for user_id, assignment in tenant["users"].items():
            user = self.registry.get_entity("User", user_id)
            if user:
                user_info = dict(user.__dict__)  # Convert User object to dict
                user_info.update({
                    "tenant_role": assignment["role"],
                    "assigned_at": assignment["created_at"]
                })
                users.append(user_info)
                
        return users
    
    def get_tenant_resources(self, tenant_id: str) -> List[Dict[str, Any]]:
        """
        Get all resources associated with a tenant.
        
        Args:
            tenant_id: ID of the tenant
            
        Returns:
            List of resource information
        """
        # Check if tenant exists
        if tenant_id not in self.tenants:
            return []
            
        tenant = self.tenants[tenant_id]
        resources = []
        
        # Collect all resources that belong to this tenant
        if "resources" in tenant:
            resources.extend(list(tenant["resources"].values()))
            
        return resources
    
    def create_tenant_resource(self, tenant_id: str, resource_type: str, resource_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a resource for a tenant.
        
        Args:
            tenant_id: ID of the tenant
            resource_type: Type of resource (e.g., "DATASET", "APPLICATION")
            resource_data: Resource data
            
        Returns:
            Resource creation result
        """
        # Check if tenant exists
        if tenant_id not in self.tenants:
            return {"success": False, "error": "Tenant not found"}
            
        # Create the resource
        resource_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        resource = {
            "id": resource_id,
            "tenant_id": tenant_id,
            "type": resource_type,
            "created_at": now,
            "updated_at": now,
            **resource_data
        }
        
        # Store the resource on the tenant
        tenant = self.tenants[tenant_id]
        if "resources" not in tenant:
            tenant["resources"] = {}
        tenant["resources"][resource_id] = resource
        
        # Update the tenant entity
        self._update_entity("Tenant", tenant_id, tenant)
        
        # Add an audit log entry
        self._add_tenant_audit_log(
            tenant_id=tenant_id,
            operation_type="RESOURCE_CREATION",
            performed_by=resource_data.get("created_by"),
            details={
                "resource_id": resource_id,
                "resource_type": resource_type
            }
        )
        
        return {
            "success": True, 
            "resource": resource
        }
        
    def get_tenant_audit_logs(self, tenant_id: str) -> List[Dict[str, Any]]:
        """
        Get audit logs for a tenant.
        
        Args:
            tenant_id: ID of the tenant
            
        Returns:
            List of audit log entries
        """
        # Check if tenant exists
        if tenant_id not in self.tenants:
            return []
            
        tenant = self.tenants[tenant_id]
        if "audit_logs" not in tenant:
            return []
            
        return tenant["audit_logs"]
        
    def _add_tenant_audit_log(self, tenant_id: str, operation_type: str, performed_by: str, details: Dict[str, Any]) -> None:
        """
        Add an audit log entry for a tenant operation.
        
        Args:
            tenant_id: ID of the tenant
            operation_type: Type of operation
            performed_by: ID of the user who performed the operation
            details: Operation details
        """
        if tenant_id not in self.tenants:
            return
            
        tenant = self.tenants[tenant_id]
        if "audit_logs" not in tenant:
            tenant["audit_logs"] = []
            
        # Create the log entry
        log_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc),
            "operation_type": operation_type,
            "performed_by": performed_by,
            "details": details
        }
        
        # Add to tenant audit logs
        tenant["audit_logs"].append(log_entry)
        
    def update_tenant_settings(self, tenant_id: str, settings: Dict[str, Any], updated_by: str) -> Dict[str, Any]:
        """
        Update tenant settings.
        
        Args:
            tenant_id: ID of the tenant
            settings: Settings to update
            updated_by: ID of the user making the update
            
        Returns:
            Update result
        """
        # Check if tenant exists
        if tenant_id not in self.tenants:
            return {"success": False, "error": "Tenant not found"}
            
        # Update tenant settings
        tenant = self.tenants[tenant_id]
        if "settings" not in tenant:
            tenant["settings"] = {}
            
        tenant["settings"].update(settings)
        tenant["updated_at"] = datetime.now(timezone.utc)
        
        # Update the tenant entity
        self._update_entity("Tenant", tenant_id, tenant)
        
        # Add an audit log entry
        self._add_tenant_audit_log(
            tenant_id=tenant_id,
            operation_type="TENANT_SETTINGS_UPDATE",
            performed_by=updated_by,
            details={
                "updated_settings": list(settings.keys())
            }
        )
        
        return {"success": True}
    
    # System Configuration
    def update_system_settings(self, settings: Dict[str, Any], updated_by: str) -> Dict[str, Any]:
        """
        Update global system settings.
        
        Args:
            settings: Settings to update
            updated_by: ID of the user making the update
            
        Returns:
            Update result
        """
        # Store system settings
        if not hasattr(self, "system_settings"):
            self.system_settings = {}
            
        self.system_settings.update(settings)
        
        # Add a system audit log
        self._add_system_audit_log(
            operation_type="SYSTEM_SETTINGS_UPDATE",
            performed_by=updated_by,
            details={
                "updated_settings": list(settings.keys())
            }
        )
        
        return {"success": True}
        
    def get_system_settings(self) -> Dict[str, Any]:
        """
        Get global system settings.
        
        Returns:
            System settings
        """
        if not hasattr(self, "system_settings"):
            self.system_settings = {}
            
        return self.system_settings
        
    def configure_auth_provider(self, provider_data: Dict[str, Any], configured_by: str) -> Dict[str, Any]:
        """
        Configure an authentication provider.
        
        Args:
            provider_data: Provider configuration data
            configured_by: ID of the user making the configuration
            
        Returns:
            Configuration result
        """
        # Initialize auth providers if not exists
        if not hasattr(self, "auth_providers"):
            self.auth_providers = {}
            
        provider_id = provider_data.get("provider_name")
        if not provider_id:
            provider_id = str(uuid.uuid4())
            
        # Store the provider configuration
        self.auth_providers[provider_id] = {
            "id": provider_id,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            **provider_data
        }
        
        # Update system settings with auth providers
        if not hasattr(self, "system_settings"):
            self.system_settings = {}
            
        if "auth_providers" not in self.system_settings:
            self.system_settings["auth_providers"] = []
            
        # Add provider to system settings if not already there
        provider_names = [p.get("provider_name") for p in self.system_settings["auth_providers"]]
        if provider_data.get("provider_name") not in provider_names:
            self.system_settings["auth_providers"].append({
                "provider_name": provider_data.get("provider_name"),
                "provider_type": provider_data.get("provider_type"),
                "enabled": provider_data.get("enabled", True)
            })
        
        # Add a system audit log
        self._add_system_audit_log(
            operation_type="AUTH_PROVIDER_CONFIG",
            performed_by=configured_by,
            details={
                "provider_name": provider_data.get("provider_name"),
                "provider_type": provider_data.get("provider_type")
            }
        )
        
        return {"success": True}
        
    def configure_email_settings(self, settings: Dict[str, Any], configured_by: str) -> Dict[str, Any]:
        """
        Configure email settings.
        
        Args:
            settings: Email settings
            configured_by: ID of the user making the configuration
            
        Returns:
            Configuration result
        """
        # Store email settings
        if not hasattr(self, "email_settings"):
            self.email_settings = {}
            
        self.email_settings.update(settings)
        
        # Add a system audit log
        self._add_system_audit_log(
            operation_type="EMAIL_CONFIG",
            performed_by=configured_by,
            details={
                "updated_settings": list(settings.keys())
            }
        )
        
        return {"success": True}
        
    def configure_integration_defaults(self, defaults: Dict[str, Any], configured_by: str) -> Dict[str, Any]:
        """
        Configure default settings for integrations.
        
        Args:
            defaults: Default settings
            configured_by: ID of the user making the configuration
            
        Returns:
            Configuration result
        """
        # Store integration defaults
        if not hasattr(self, "integration_defaults"):
            self.integration_defaults = {}
            
        self.integration_defaults.update(defaults)
        
        # Add a system audit log
        self._add_system_audit_log(
            operation_type="INTEGRATION_DEFAULTS_CONFIG",
            performed_by=configured_by,
            details={
                "updated_defaults": list(defaults.keys())
            }
        )
        
        return {"success": True}
        
    def set_tenant_system_overrides(self, tenant_id: str, overrides: Dict[str, Any], configured_by: str) -> Dict[str, Any]:
        """
        Set tenant-specific overrides for system settings.
        
        Args:
            tenant_id: ID of the tenant
            overrides: Settings to override
            configured_by: ID of the user making the configuration
            
        Returns:
            Configuration result
        """
        # Check if tenant exists
        if tenant_id not in self.tenants:
            return {"success": False, "error": "Tenant not found"}
            
        # Update tenant system overrides
        tenant = self.tenants[tenant_id]
        if "system_overrides" not in tenant:
            tenant["system_overrides"] = {}
            
        tenant["system_overrides"].update(overrides)
        tenant["updated_at"] = datetime.now(timezone.utc)
        
        # Update the tenant entity
        self._update_entity("Tenant", tenant_id, tenant)
        
        # Add an audit log entry
        self._add_tenant_audit_log(
            tenant_id=tenant_id,
            operation_type="TENANT_SYSTEM_OVERRIDE",
            performed_by=configured_by,
            details={
                "overridden_settings": list(overrides.keys())
            }
        )
        
        return {"success": True}
        
    def get_system_audit_logs(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Get system audit logs.
        
        Args:
            filters: Optional filters for the logs
            
        Returns:
            List of audit log entries
        """
        if not hasattr(self, "system_audit_logs"):
            self.system_audit_logs = []
            
        # If no filters, return all logs
        if not filters:
            return self.system_audit_logs
            
        # Apply filters
        filtered_logs = self.system_audit_logs
        
        # Filter by operation types if specified
        if "operation_types" in filters:
            operation_types = filters["operation_types"]
            filtered_logs = [log for log in filtered_logs 
                             if log["operation_type"] in operation_types]
            
        return filtered_logs
        
    def _add_system_audit_log(self, operation_type: str, performed_by: str, details: Dict[str, Any]) -> None:
        """
        Add a system audit log entry.
        
        Args:
            operation_type: Type of operation
            performed_by: ID of the user who performed the operation
            details: Operation details
        """
        if not hasattr(self, "system_audit_logs"):
            self.system_audit_logs = []
            
        # Create the log entry
        log_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc),
            "operation_type": operation_type,
            "performed_by": performed_by,
            "details": details
        }
        
        # Add to system audit logs
        self.system_audit_logs.append(log_entry)
    
    # User Management
    def create_users_batch(self, users_data: List[Dict[str, Any]], created_by: str, send_welcome_email: bool = True) -> Dict[str, Any]:
        """
        Create multiple users in a batch.
        
        Args:
            users_data: List of user data dictionaries
            created_by: ID of the user creating the batch
            send_welcome_email: Whether to send welcome emails
            
        Returns:
            Batch creation result
        """
        created_user_ids = []
        failed_users = []
        
        for user_data in users_data:
            # Generate a user ID
            user_id = str(uuid.uuid4())
            
            # Create User object to register with Auth adapter
            try:
                from .auth.auth_adapter import User
                
                # Extract basic user info
                email = user_data.get("email")
                name = user_data.get("name")
                role = user_data.get("role", "USER")
                
                # Register user with Auth adapter via entity registry
                user = User(
                    id=user_id,
                    email=email,
                    name=name,
                    role=role,
                    mfa_enabled=False
                )
                
                # Register entity directly
                self._register_entity("User", user_id, user)
                
                # Store additional user data
                user_details = {
                    "id": user_id,
                    "email": email,
                    "name": name,
                    "role": role,
                    "department": user_data.get("department"),
                    "title": user_data.get("title"),
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                    "created_by": created_by,
                    "status": "ACTIVE",
                    "welcome_email_sent": send_welcome_email
                }
                
                # Store additional data in user_details
                if not hasattr(self, "user_details"):
                    self.user_details = {}
                self.user_details[user_id] = user_details
                
                # Add a user creation audit log
                self._add_user_audit_log(
                    user_id=user_id,
                    operation_type="USER_CREATION",
                    performed_by=created_by,
                    details={
                        "email": email,
                        "role": role,
                        "batch_creation": True
                    }
                )
                
                created_user_ids.append(user_id)
                
            except Exception as e:
                failed_users.append({
                    "email": user_data.get("email"),
                    "error": str(e)
                })
        
        # Add a system audit log
        self._add_system_audit_log(
            operation_type="BATCH_USER_CREATION",
            performed_by=created_by,
            details={
                "created_count": len(created_user_ids),
                "failed_count": len(failed_users)
            }
        )
        
        result = {
            "success": True,
            "created_count": len(created_user_ids),
            "created_user_ids": created_user_ids
        }
        
        if failed_users:
            result["failed_users"] = failed_users
            
        return result
    
    def update_user(self, user_id: str, update_data: Dict[str, Any], updated_by: str) -> Dict[str, Any]:
        """
        Update user information.
        
        Args:
            user_id: ID of the user to update
            update_data: Data to update
            updated_by: ID of the user making the update
            
        Returns:
            Update result
        """
        # Check if user exists in registry
        user = self.registry.get_entity("User", user_id)
        if not user:
            return {"success": False, "error": "User not found"}
            
        # Update user details
        if not hasattr(self, "user_details"):
            self.user_details = {}
            
        if user_id not in self.user_details:
            self.user_details[user_id] = {
                "id": user_id,
                "created_at": datetime.now(timezone.utc)
            }
            
        # Update user details
        self.user_details[user_id].update(update_data)
        self.user_details[user_id]["updated_at"] = datetime.now(timezone.utc)
        self.user_details[user_id]["updated_by"] = updated_by
        
        # Add a user audit log
        self._add_user_audit_log(
            user_id=user_id,
            operation_type="USER_UPDATE",
            performed_by=updated_by,
            details={
                "updated_fields": list(update_data.keys())
            }
        )
        
        return {"success": True}
    
    def update_user_status(self, user_id: str, status: str, reason: str, updated_by: str) -> Dict[str, Any]:
        """
        Update user status.
        
        Args:
            user_id: ID of the user to update
            status: New status (e.g., "ACTIVE", "DISABLED")
            reason: Reason for the status change
            updated_by: ID of the user making the update
            
        Returns:
            Update result
        """
        # Check if user exists in registry
        user = self.registry.get_entity("User", user_id)
        if not user:
            return {"success": False, "error": "User not found"}
            
        # Update user details
        if not hasattr(self, "user_details"):
            self.user_details = {}
            
        if user_id not in self.user_details:
            self.user_details[user_id] = {
                "id": user_id,
                "created_at": datetime.now(timezone.utc)
            }
            
        # Update status
        self.user_details[user_id]["status"] = status
        self.user_details[user_id]["status_reason"] = reason
        self.user_details[user_id]["updated_at"] = datetime.now(timezone.utc)
        self.user_details[user_id]["updated_by"] = updated_by
        
        # Add a user audit log
        self._add_user_audit_log(
            user_id=user_id,
            operation_type="USER_STATUS_CHANGE",
            performed_by=updated_by,
            details={
                "new_status": status,
                "reason": reason
            }
        )
        
        return {"success": True}
    
    def get_users(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Get users with optional filtering.
        
        Args:
            filters: Optional filters for users
            
        Returns:
            List of user information
        """
        if not hasattr(self, "user_details"):
            return []
            
        # If no filters, return all users
        if not filters:
            return list(self.user_details.values())
            
        # Apply filters
        filtered_users = list(self.user_details.values())
        
        # Filter by email domain if specified
        if "email_domain" in filters:
            domain = filters["email_domain"]
            filtered_users = [u for u in filtered_users 
                             if u.get("email", "").endswith(f"@{domain}")]
                             
        # Filter by roles if specified
        if "roles" in filters:
            roles = filters["roles"]
            filtered_users = [u for u in filtered_users 
                             if u.get("role") in roles]
            
        return filtered_users
    
    def bulk_update_users(self, user_ids: List[str], update_data: Dict[str, Any], updated_by: str) -> Dict[str, Any]:
        """
        Update multiple users at once.
        
        Args:
            user_ids: List of user IDs to update
            update_data: Data to update for all users
            updated_by: ID of the user making the update
            
        Returns:
            Bulk update result
        """
        updated_count = 0
        failed_users = []
        
        for user_id in user_ids:
            # Check if user exists in registry
            user = self.registry.get_entity("User", user_id)
            if not user:
                failed_users.append({
                    "user_id": user_id,
                    "error": "User not found"
                })
                continue
                
            # Update user details
            if not hasattr(self, "user_details"):
                self.user_details = {}
                
            if user_id not in self.user_details:
                self.user_details[user_id] = {
                    "id": user_id,
                    "created_at": datetime.now(timezone.utc)
                }
                
            # Update user details
            self.user_details[user_id].update(update_data)
            self.user_details[user_id]["updated_at"] = datetime.now(timezone.utc)
            self.user_details[user_id]["updated_by"] = updated_by
            
            # Add a user audit log
            self._add_user_audit_log(
                user_id=user_id,
                operation_type="USER_BULK_UPDATE",
                performed_by=updated_by,
                details={
                    "updated_fields": list(update_data.keys())
                }
            )
            
            updated_count += 1
        
        # Add a system audit log
        self._add_system_audit_log(
            operation_type="BULK_USER_UPDATE",
            performed_by=updated_by,
            details={
                "updated_count": updated_count,
                "failed_count": len(failed_users),
                "updated_fields": list(update_data.keys())
            }
        )
        
        result = {
            "success": True,
            "updated_count": updated_count
        }
        
        if failed_users:
            result["failed_users"] = failed_users
            
        return result
    
    def get_user_audit_logs(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get audit logs for a specific user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            List of audit log entries
        """
        if not hasattr(self, "user_audit_logs"):
            self.user_audit_logs = {}
            
        if user_id not in self.user_audit_logs:
            return []
            
        return self.user_audit_logs[user_id]
    
    def _add_user_audit_log(self, user_id: str, operation_type: str, performed_by: str, details: Dict[str, Any]) -> None:
        """
        Add a user audit log entry.
        
        Args:
            user_id: ID of the user
            operation_type: Type of operation
            performed_by: ID of the user who performed the operation
            details: Operation details
        """
        if not hasattr(self, "user_audit_logs"):
            self.user_audit_logs = {}
            
        if user_id not in self.user_audit_logs:
            self.user_audit_logs[user_id] = []
            
        # Create the log entry
        log_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc),
            "operation_type": operation_type,
            "performed_by": performed_by,
            "details": details
        }
        
        # Add to user audit logs
        self.user_audit_logs[user_id].append(log_entry)

    # Tenant association methods
    def associate_tenant_with_application(self, tenant_id: str, app_id: int, created_by: str) -> Dict[str, Any]:
        """Associate a tenant with an application."""
        # Check if tenant and application exist
        if tenant_id not in self.tenants or app_id not in self.applications:
            return None
        
        # Create a unique key for the association
        assoc_key = f"{tenant_id}_{app_id}"
        
        # Create timestamps
        now = datetime.now(timezone.utc)
        
        # Create the association
        association = {
            "tenant_id": tenant_id,
            "application_id": app_id,
            "is_active": True,
            "granted_at": now,
            "granted_by": created_by
        }
        
        self.tenant_app_associations[assoc_key] = association
        
        # Register the entity with the registry
        self._register_entity("TenantApplicationAssociation", assoc_key, association)
        
        return association
    
    def dissociate_tenant_from_application(self, tenant_id: str, app_id: int) -> bool:
        """Dissociate a tenant from an application."""
        # Create a unique key for the association
        assoc_key = f"{tenant_id}_{app_id}"
        
        if assoc_key not in self.tenant_app_associations:
            return False
        
        # Delete the association
        del self.tenant_app_associations[assoc_key]
        
        # Delete the entity from the registry
        self._delete_entity("TenantApplicationAssociation", assoc_key)
        
        return True
    
    def get_tenant_applications(self, tenant_id: str) -> List[Dict[str, Any]]:
        """Get all applications associated with a tenant."""
        applications = []
        
        for key, assoc in self.tenant_app_associations.items():
            if assoc["tenant_id"] == tenant_id:
                app_id = assoc["application_id"]
                if app_id in self.applications:
                    applications.append(self.applications[app_id])
        
        return applications
    
    def get_application_tenants(self, app_id: int) -> List[Dict[str, Any]]:
        """Get all tenants associated with an application."""
        tenants = []
        
        for key, assoc in self.tenant_app_associations.items():
            if assoc["application_id"] == app_id:
                tenant_id = assoc["tenant_id"]
                if tenant_id in self.tenants:
                    tenants.append(self.tenants[tenant_id])
        
        return tenants
    
    # Webhook methods
    def create_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new webhook."""
        webhook_id = len(self.webhooks) + 1
        
        # Create timestamps
        now = datetime.now(timezone.utc)
        
        # Create the webhook
        webhook = {
            "id": webhook_id,
            "created_at": now,
            "updated_at": now,
            "last_triggered_at": None,
            "status": "ACTIVE",
            **webhook_data
        }
        
        self.webhooks[webhook_id] = webhook
        
        # Register the entity with the registry
        self._register_entity("Webhook", str(webhook_id), webhook)
        
        return webhook
    
    def get_webhook(self, webhook_id: int) -> Optional[Dict[str, Any]]:
        """Get a webhook by ID."""
        return self.webhooks.get(webhook_id)
    
    def update_webhook(self, webhook_id: int, webhook_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a webhook."""
        if webhook_id not in self.webhooks:
            return None
        
        # Update the webhook
        webhook = self.webhooks[webhook_id]
        webhook.update({
            "updated_at": datetime.now(timezone.utc),
            **webhook_data
        })
        
        # Update the entity in the registry
        self._update_entity("Webhook", str(webhook_id), webhook)
        
        return webhook
    
    def delete_webhook(self, webhook_id: int) -> bool:
        """Delete a webhook."""
        if webhook_id not in self.webhooks:
            return False
        
        # Delete the webhook
        del self.webhooks[webhook_id]
        
        # Delete the entity from the registry
        self._delete_entity("Webhook", str(webhook_id))
        
        return True
    
    def list_webhooks(self) -> List[Dict[str, Any]]:
        """List all webhooks."""
        return list(self.webhooks.values())
        
    def test_webhook(self, test_request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Test a webhook by simulating a request.
        
        Args:
            test_request: Webhook test request parameters
            
        Returns:
            Webhook test response
        """
        # Simulate a webhook test
        url = test_request.get("url")
        auth_type = test_request.get("auth_type", "none")
        payload = test_request.get("payload", {})
        event_type = test_request.get("event_type")
        
        # For test purposes, assume the webhook call succeeds
        success = True
        status_code = 200
        response_body = '{"status": "success", "message": "Webhook received"}'
        error_message = None
        request_duration_ms = 125  # Simulated response time
        
        # Create test response
        response = {
            "success": success,
            "status_code": status_code,
            "response_body": response_body,
            "error_message": error_message,
            "request_duration_ms": request_duration_ms
        }
        
        return response
    
    def _handle_entity_change(self, entity_type: str, entity_id: str, entity: Any, action: str) -> None:
        """
        Handle entity changes from the registry.
        
        This method is called when entities are changed in the registry.
        """
        # Handle User entity changes
        if entity_type == "User" and action == EntityAction.DELETE:
            # Remove associations for deleted users
            pass
        
        # Handle Tenant entity changes
        if entity_type == "Tenant":
            if action == EntityAction.CREATE:
                # Sync tenant if not already in our store
                if entity["id"] not in self.tenants:
                    self.tenants[entity["id"]] = entity
            
            elif action == EntityAction.UPDATE:
                # Update our copy of the tenant
                if entity["id"] in self.tenants:
                    self.tenants[entity["id"]] = entity
            
            elif action == EntityAction.DELETE:
                # Remove tenant and its associations
                if entity["id"] in self.tenants:
                    del self.tenants[entity["id"]]
                
                # Remove tenant associations
                associations_to_remove = []
                for key, assoc in self.tenant_app_associations.items():
                    if assoc["tenant_id"] == entity["id"]:
                        associations_to_remove.append(key)
                
                for key in associations_to_remove:
                    del self.tenant_app_associations[key]