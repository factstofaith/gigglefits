"""
Multi-Tenant Isolation Validation Tests

This module tests the isolation between tenants to ensure data separation
is enforced throughout the platform.
"""

import pytest
import uuid
from test_adapters.auth.auth_adapter import User, AuthAdapter
from test_adapters.admin_adapter import AdminTestAdapter
from test_adapters.integration_adapter import IntegrationAdapter
from test_adapters.credential_manager import CredentialManagerAdapter


class TestTenantIsolation:
    """Tests for multi-tenant isolation across the platform."""
    
    def test_tenant_data_isolation(self, entity_registry, auth_adapter, admin_adapter):
        """
        Test basic tenant data isolation for resources.
        """
        # Create two tenant admins for different tenants
        tenant1_id = f"tenant1-{uuid.uuid4()}"
        tenant2_id = f"tenant2-{uuid.uuid4()}"
        
        # Create admin for tenant 1
        tenant1_admin = auth_adapter.add_user(
            User(
                id=f"admin1-{uuid.uuid4()}",
                email="tenant1_admin@example.com",
                name="Tenant 1 Admin",
                role="ADMIN",
                tenant_id=tenant1_id
            )
        )
        
        # Create admin for tenant 2
        tenant2_admin = auth_adapter.add_user(
            User(
                id=f"admin2-{uuid.uuid4()}",
                email="tenant2_admin@example.com",
                name="Tenant 2 Admin",
                role="ADMIN",
                tenant_id=tenant2_id
            )
        )
        
        # Create applications for tenant 1
        app1 = admin_adapter.create_application({
            "name": "Tenant 1 App",
            "description": "App for Tenant 1",
            "status": "active"
        }, tenant1_admin.id)
        
        # Create applications for tenant 2
        app2 = admin_adapter.create_application({
            "name": "Tenant 2 App",
            "description": "App for Tenant 2",
            "status": "active"
        }, tenant2_admin.id)
        
        # Get applications for tenant 1
        tenant1_apps = admin_adapter.get_tenant_applications(tenant1_id)
        tenant2_apps = admin_adapter.get_tenant_applications(tenant2_id)
        
        # Verify tenant 1 can only see its own applications
        app_ids_tenant1 = [a["id"] for a in tenant1_apps]
        assert app1["id"] in app_ids_tenant1
        assert app2["id"] not in app_ids_tenant1
        
        # Verify tenant 2 can only see its own applications
        app_ids_tenant2 = [a["id"] for a in tenant2_apps]
        assert app2["id"] in app_ids_tenant2
        assert app1["id"] not in app_ids_tenant2
    
    def test_credential_isolation(self, entity_registry, auth_adapter, credential_manager_adapter):
        """
        Test that credentials are isolated between tenants.
        """
        # Create users for different tenants
        tenant1_id = f"tenant1-{uuid.uuid4()}"
        tenant2_id = f"tenant2-{uuid.uuid4()}"
        
        # Create user for tenant 1
        tenant1_user = auth_adapter.add_user(
            User(
                id=f"user1-{uuid.uuid4()}",
                email="tenant1_user@example.com",
                name="Tenant 1 User",
                role="USER",
                tenant_id=tenant1_id
            )
        )
        
        # Create user for tenant 2
        tenant2_user = auth_adapter.add_user(
            User(
                id=f"user2-{uuid.uuid4()}",
                email="tenant2_user@example.com",
                name="Tenant 2 User",
                role="USER",
                tenant_id=tenant2_id
            )
        )
        
        # Store credential for tenant 1
        credential1_id = f"credential1-{uuid.uuid4()}"
        credential_manager_adapter.store_credential(
            tenant_id=tenant1_id,
            credential_id=credential1_id,
            credential_type="s3",
            data={
                "access_key": "tenant1-access-key",
                "secret_key": "tenant1-secret-key"
            },
            user_id=tenant1_user.id
        )
        
        # Store credential for tenant 2
        credential2_id = f"credential2-{uuid.uuid4()}"
        credential_manager_adapter.store_credential(
            tenant_id=tenant2_id,
            credential_id=credential2_id,
            credential_type="s3",
            data={
                "access_key": "tenant2-access-key",
                "secret_key": "tenant2-secret-key"
            },
            user_id=tenant2_user.id
        )
        
        # Verify tenant 1 can only see its own credentials
        tenant1_credential = credential_manager_adapter.retrieve_credential(
            tenant_id=tenant1_id,
            credential_id=credential1_id,
            user_id=tenant1_user.id
        )
        
        assert tenant1_credential is not None
        assert tenant1_credential["data"]["access_key"] == "tenant1-access-key"
        
        # Verify tenant 1 cannot see tenant 2's credentials
        with pytest.raises(Exception):
            credential_manager_adapter.retrieve_credential(
                tenant_id=tenant1_id,
                credential_id=credential2_id,
                user_id=tenant1_user.id
            )
        
        # Verify a user from tenant 1 cannot access tenant 2's credentials
        with pytest.raises(Exception):
            credential_manager_adapter.retrieve_credential(
                tenant_id=tenant2_id,
                credential_id=credential2_id,
                user_id=tenant1_user.id
            )
        
        # Verify tenant 2 can only see its own credentials
        tenant2_credential = credential_manager_adapter.retrieve_credential(
            tenant_id=tenant2_id,
            credential_id=credential2_id,
            user_id=tenant2_user.id
        )
        
        assert tenant2_credential is not None
        assert tenant2_credential["data"]["access_key"] == "tenant2-access-key"
        
        # Verify tenant 2 cannot see tenant 1's credentials
        with pytest.raises(Exception):
            credential_manager_adapter.retrieve_credential(
                tenant_id=tenant2_id,
                credential_id=credential1_id,
                user_id=tenant2_user.id
            )
    
    def test_integration_isolation(self, entity_registry, auth_adapter, integration_adapter):
        """
        Test that integrations are isolated between tenants.
        """
        # Create users for different tenants
        tenant1_id = f"tenant1-{uuid.uuid4()}"
        tenant2_id = f"tenant2-{uuid.uuid4()}"
        
        # Create user for tenant 1
        tenant1_user = auth_adapter.add_user(
            User(
                id=f"user1-{uuid.uuid4()}",
                email="tenant1_user@example.com",
                name="Tenant 1 User",
                role="USER",
                tenant_id=tenant1_id
            )
        )
        
        # Create user for tenant 2
        tenant2_user = auth_adapter.add_user(
            User(
                id=f"user2-{uuid.uuid4()}",
                email="tenant2_user@example.com",
                name="Tenant 2 User",
                role="USER",
                tenant_id=tenant2_id
            )
        )
        
        # Create integration for tenant 1
        integration1 = integration_adapter.create_integration({
            "name": "Tenant 1 Integration",
            "description": "Integration for Tenant 1",
            "status": "active",
            "tenant_id": tenant1_id,
            "owner_id": tenant1_user.id
        })
        
        # Create integration for tenant 2
        integration2 = integration_adapter.create_integration({
            "name": "Tenant 2 Integration",
            "description": "Integration for Tenant 2",
            "status": "active",
            "tenant_id": tenant2_id,
            "owner_id": tenant2_user.id
        })
        
        # Get integrations for tenant 1
        tenant1_integrations = integration_adapter.get_tenant_integrations(tenant1_id)
        
        # Get integrations for tenant 2
        tenant2_integrations = integration_adapter.get_tenant_integrations(tenant2_id)
        
        # Verify tenant 1 can only see its own integrations
        integration_ids_tenant1 = [i["id"] for i in tenant1_integrations]
        assert integration1["id"] in integration_ids_tenant1
        assert integration2["id"] not in integration_ids_tenant1
        
        # Verify tenant 2 can only see its own integrations
        integration_ids_tenant2 = [i["id"] for i in tenant2_integrations]
        assert integration2["id"] in integration_ids_tenant2
        assert integration1["id"] not in integration_ids_tenant2
        
        # Verify a user from tenant 1 cannot access tenant 2's integrations
        with pytest.raises(Exception):
            integration_adapter.get_integration(integration2["id"], tenant1_user.id)
        
        # Verify a user from tenant 2 cannot access tenant 1's integrations
        with pytest.raises(Exception):
            integration_adapter.get_integration(integration1["id"], tenant2_user.id)
    
    def test_cross_tenant_operations(self, entity_registry, auth_adapter, admin_adapter):
        """
        Test that cross-tenant operations are properly authorized.
        """
        # Create super admin (not tied to a specific tenant)
        super_admin = auth_adapter.add_user(
            User(
                id=f"super-admin-{uuid.uuid4()}",
                email="super_admin@example.com",
                name="Super Admin",
                role="SUPER_ADMIN",
                tenant_id=None
            )
        )
        
        # Create two tenants
        tenant1 = admin_adapter.create_tenant({
            "id": f"tenant1-{uuid.uuid4()}",
            "name": "Tenant 1",
            "status": "active"
        })
        
        tenant2 = admin_adapter.create_tenant({
            "id": f"tenant2-{uuid.uuid4()}",
            "name": "Tenant 2",
            "status": "active"
        })
        
        # Create admin for tenant 1
        tenant1_admin = auth_adapter.add_user(
            User(
                id=f"admin1-{uuid.uuid4()}",
                email="tenant1_admin@example.com",
                name="Tenant 1 Admin",
                role="ADMIN",
                tenant_id=tenant1["id"]
            )
        )
        
        # Verify super admin can access both tenants
        all_tenants = admin_adapter.get_tenants(user_id=super_admin.id)
        tenant_ids = [t["id"] for t in all_tenants]
        assert tenant1["id"] in tenant_ids
        assert tenant2["id"] in tenant_ids
        
        # Verify tenant admin cannot access other tenants
        with pytest.raises(Exception):
            admin_adapter.get_tenant(tenant2["id"], user_id=tenant1_admin.id)
        
        # Verify super admin can create cross-tenant associations
        # Create applications for both tenants
        app1 = admin_adapter.create_application({
            "name": "Cross-Tenant App",
            "description": "App for cross-tenant testing",
            "status": "active"
        }, super_admin.id)
        
        # Associate application with tenant 1
        admin_adapter.associate_application_with_tenant(
            tenant1["id"], app1["id"], super_admin.id
        )
        
        # Verify tenant 1 can see the application
        tenant1_apps = admin_adapter.get_tenant_applications(tenant1["id"])
        tenant1_app_ids = [a["id"] for a in tenant1_apps]
        assert app1["id"] in tenant1_app_ids
        
        # Verify tenant admin cannot create cross-tenant associations
        app2 = admin_adapter.create_application({
            "name": "Another App",
            "description": "Another app for testing",
            "status": "active"
        }, super_admin.id)
        
        # Tenant admin should not be able to associate apps with other tenants
        with pytest.raises(Exception):
            admin_adapter.associate_application_with_tenant(
                tenant2["id"], app2["id"], tenant1_admin.id
            )