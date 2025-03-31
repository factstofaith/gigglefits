"""
Admin Operations End-to-End Tests

This module contains end-to-end tests for administrative operations,
including tenant management, user management, role assignments,
system configuration, and audit logging.
"""

import pytest
import uuid
from datetime import datetime, timezone

from test_adapters.auth.auth_adapter import User


class TestAdminOperationsE2E:
    """End-to-end tests for administrative operations workflow."""
    
    def test_tenant_management(self, entity_registry, auth_adapter, 
                              admin_adapter):
        """
        Test the tenant management workflow.
        
        This test verifies the following workflow:
        1. Admin creates a new tenant
        2. Admin configures tenant settings
        3. Admin assigns users to tenant
        4. Admin configures tenant-specific settings
        5. Admin verifies tenant isolation
        """
        # Step 1: Create a super admin user
        super_admin = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="super_admin@example.com",
                name="Super Admin User",
                role="SUPER_ADMIN",
                mfa_enabled=False
            )
        )
        
        # Step 2: Create a new tenant
        tenant_data = {
            "name": "Test Tenant",
            "display_name": "Test Tenant Organization",
            "domain": "test-tenant.example.com",
            "contact_email": "admin@test-tenant.example.com",
            "subscription_tier": "PREMIUM",
            "max_users": 100,
            "max_storage_gb": 500,
            "created_by": super_admin.id
        }
        
        tenant = admin_adapter.create_tenant(tenant_data)
        
        assert tenant["id"] is not None
        assert tenant["name"] == "Test Tenant"
        assert tenant["subscription_tier"] == "PREMIUM"
        
        tenant_id = tenant["id"]
        
        # Step 3: Create a tenant admin
        tenant_admin = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="tenant_admin@test-tenant.example.com",
                name="Tenant Admin User",
                role="ADMIN",
                mfa_enabled=False
            )
        )
        
        # Step 4: Assign admin to tenant
        assignment_result = admin_adapter.assign_user_to_tenant(
            user_id=tenant_admin.id,
            tenant_id=tenant_id,
            assigned_by=super_admin.id,
            role="TENANT_ADMIN"
        )
        
        assert assignment_result["success"] is True
        
        # Step 5: Configure tenant settings
        tenant_settings = {
            "logo_url": "https://test-tenant.example.com/logo.png",
            "primary_color": "#1a73e8",
            "secondary_color": "#f8f9fa",
            "login_page_message": "Welcome to Test Tenant Portal",
            "allowed_domains": ["test-tenant.example.com", "partner.example.com"],
            "default_language": "en-US",
            "default_timezone": "America/New_York",
            "security_settings": {
                "mfa_required": True,
                "password_expiry_days": 90,
                "session_timeout_minutes": 30
            }
        }
        
        settings_result = admin_adapter.update_tenant_settings(
            tenant_id=tenant_id,
            settings=tenant_settings,
            updated_by=tenant_admin.id
        )
        
        assert settings_result["success"] is True
        
        # Step 6: Create tenant users
        tenant_user1 = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="user1@test-tenant.example.com",
                name="Tenant User 1",
                role="USER",
                mfa_enabled=False
            )
        )
        
        tenant_user2 = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="user2@test-tenant.example.com",
                name="Tenant User 2",
                role="USER",
                mfa_enabled=False
            )
        )
        
        # Step 7: Assign users to tenant
        admin_adapter.assign_user_to_tenant(
            user_id=tenant_user1.id,
            tenant_id=tenant_id,
            assigned_by=tenant_admin.id,
            role="TENANT_USER"
        )
        
        admin_adapter.assign_user_to_tenant(
            user_id=tenant_user2.id,
            tenant_id=tenant_id,
            assigned_by=tenant_admin.id,
            role="TENANT_USER"
        )
        
        # Step 8: Create tenant resources
        dataset = admin_adapter.create_tenant_resource(
            tenant_id=tenant_id,
            resource_type="DATASET",
            resource_data={
                "name": "Tenant Test Dataset",
                "description": "Test dataset for tenant",
                "schema": {
                    "fields": [
                        {"name": "id", "type": "string", "required": True},
                        {"name": "name", "type": "string", "required": True},
                        {"name": "value", "type": "number", "required": False}
                    ]
                },
                "created_by": tenant_admin.id
            }
        )
        
        assert dataset["success"] is True
        assert dataset["resource"]["tenant_id"] == tenant_id
        
        # Step 9: Verify tenant isolation
        tenant_users = admin_adapter.get_tenant_users(tenant_id)
        assert len(tenant_users) == 3  # admin + 2 users
        
        tenant_resources = admin_adapter.get_tenant_resources(tenant_id)
        assert len(tenant_resources) >= 1
        
        # Step 10: Create another tenant to test isolation
        other_tenant = admin_adapter.create_tenant({
            "name": "Other Tenant",
            "display_name": "Other Test Organization",
            "domain": "other-tenant.example.com",
            "subscription_tier": "STANDARD",
            "created_by": super_admin.id
        })
        
        other_tenant_id = other_tenant["id"]
        
        # Step 11: Verify cross-tenant isolation
        other_tenant_users = admin_adapter.get_tenant_users(other_tenant_id)
        assert len(other_tenant_users) == 0  # No users assigned yet
        
        other_tenant_resources = admin_adapter.get_tenant_resources(other_tenant_id)
        assert len(other_tenant_resources) == 0  # No resources created yet
        
        # Step 12: Audit tenant operations
        audit_logs = admin_adapter.get_tenant_audit_logs(tenant_id)
        
        assert len(audit_logs) >= 4  # At least 4 operations performed
        # Verify key operations are logged
        operation_types = [log["operation_type"] for log in audit_logs]
        assert "TENANT_CREATION" in operation_types
        assert "TENANT_USER_ASSIGNMENT" in operation_types
        assert "TENANT_SETTINGS_UPDATE" in operation_types
        assert "RESOURCE_CREATION" in operation_types
    
    def test_user_management(self, entity_registry, auth_adapter, admin_adapter):
        """
        Test the user management workflow.
        """
        # Step 1: Create an admin user
        admin_user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="user_admin@example.com",
                name="User Admin",
                role="ADMIN",
                mfa_enabled=False
            )
        )
        
        # Step 2: Create a batch of users
        users_data = [
            {
                "email": "batch_user1@example.com",
                "name": "Batch User 1",
                "role": "USER",
                "department": "Engineering",
                "title": "Software Engineer"
            },
            {
                "email": "batch_user2@example.com",
                "name": "Batch User 2",
                "role": "MANAGER",
                "department": "Product",
                "title": "Product Manager"
            },
            {
                "email": "batch_user3@example.com",
                "name": "Batch User 3",
                "role": "READONLY",
                "department": "Finance",
                "title": "Financial Analyst"
            }
        ]
        
        batch_result = admin_adapter.create_users_batch(
            users_data=users_data,
            created_by=admin_user.id,
            send_welcome_email=True
        )
        
        assert batch_result["success"] is True
        assert batch_result["created_count"] == 3
        assert "failed_users" not in batch_result or len(batch_result["failed_users"]) == 0
        
        created_user_ids = batch_result["created_user_ids"]
        
        # Step 3: Get user details
        user1 = auth_adapter.get_user_by_id(created_user_ids[0])
        assert user1 is not None
        assert user1.email == "batch_user1@example.com"
        
        # Step 4: Update user
        user_update = admin_adapter.update_user(
            user_id=created_user_ids[0],
            update_data={
                "department": "Engineering",
                "title": "Senior Software Engineer",
                "manager_id": created_user_ids[1],  # Set user2 as manager
                "custom_attributes": {
                    "skill_level": "Expert",
                    "programming_languages": ["Python", "JavaScript", "Go"]
                }
            },
            updated_by=admin_user.id
        )
        
        assert user_update["success"] is True
        
        # Step 5: Disable user
        disable_result = admin_adapter.update_user_status(
            user_id=created_user_ids[2],
            status="DISABLED",
            reason="Test disabling user",
            updated_by=admin_user.id
        )
        
        assert disable_result["success"] is True
        
        # Step 6: Verify user statuses
        users = admin_adapter.get_users(
            filters={
                "email_domain": "example.com",
                "roles": ["USER", "MANAGER", "READONLY"]
            }
        )
        
        assert len(users) >= 3
        
        # Find our users in the list
        user1_status = next((u["status"] for u in users if u["id"] == created_user_ids[0]), None)
        user3_status = next((u["status"] for u in users if u["id"] == created_user_ids[2]), None)
        
        assert user1_status == "ACTIVE"
        assert user3_status == "DISABLED"
        
        # Step 7: Check user audit logs
        user_logs = admin_adapter.get_user_audit_logs(created_user_ids[0])
        
        assert len(user_logs) >= 2  # At least creation and update
        
        # Step 8: Test bulk operations
        bulk_op_result = admin_adapter.bulk_update_users(
            user_ids=[created_user_ids[0], created_user_ids[1]],
            update_data={
                "account_type": "INTERNAL",
                "login_instructions_sent": True
            },
            updated_by=admin_user.id
        )
        
        assert bulk_op_result["success"] is True
        assert bulk_op_result["updated_count"] == 2
    
    def test_system_configuration(self, entity_registry, auth_adapter, admin_adapter):
        """
        Test system configuration management.
        """
        # Step 1: Create system admin
        system_admin = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="system_admin@example.com",
                name="System Admin",
                role="SUPER_ADMIN",
                mfa_enabled=True
            )
        )
        
        # Step 2: Update global system settings
        global_settings = {
            "system_name": "TAP Integration Platform - Test",
            "company_name": "Test Company, Inc.",
            "support_email": "support@example.com",
            "support_url": "https://support.example.com",
            "terms_url": "https://example.com/terms",
            "privacy_url": "https://example.com/privacy",
            "default_language": "en-US",
            "available_languages": ["en-US", "es-ES", "fr-FR", "de-DE"],
            "session_timeout_minutes": 60,
            "max_login_attempts": 5,
            "password_policy": {
                "min_length": 10,
                "require_lowercase": True,
                "require_uppercase": True,
                "require_number": True,
                "require_special": True,
                "max_age_days": 90
            },
            "notification_settings": {
                "email_notifications_enabled": True,
                "in_app_notifications_enabled": True,
                "default_digest_frequency": "DAILY"
            }
        }
        
        settings_result = admin_adapter.update_system_settings(
            settings=global_settings,
            updated_by=system_admin.id
        )
        
        assert settings_result["success"] is True
        
        # Step 3: Configure authentication providers
        auth_providers = [
            {
                "provider_type": "OAUTH",
                "provider_name": "Google",
                "enabled": True,
                "config": {
                    "client_id": f"test-client-{uuid.uuid4()}",
                    "client_secret": f"test-secret-{uuid.uuid4()}",
                    "redirect_uri": "https://example.com/oauth/callback/google",
                    "scopes": ["email", "profile"]
                }
            },
            {
                "provider_type": "SAML",
                "provider_name": "Okta",
                "enabled": True,
                "config": {
                    "metadata_url": "https://test-company.okta.com/app/metadata",
                    "entity_id": "https://example.com/saml",
                    "assertion_consumer_service_url": "https://example.com/saml/callback"
                }
            }
        ]
        
        for provider in auth_providers:
            provider_result = admin_adapter.configure_auth_provider(
                provider_data=provider,
                configured_by=system_admin.id
            )
            assert provider_result["success"] is True
        
        # Step 4: Configure email settings
        email_settings = {
            "smtp_server": "smtp.example.com",
            "smtp_port": 587,
            "smtp_username": "notifications@example.com",
            "smtp_password": "test-password-123",
            "smtp_use_tls": True,
            "from_email": "noreply@example.com",
            "from_name": "TAP Integration Platform",
            "email_templates": {
                "welcome": {
                    "subject": "Welcome to TAP Integration Platform",
                    "template_id": "welcome-template-123"
                },
                "password_reset": {
                    "subject": "Reset Your Password",
                    "template_id": "password-reset-template-123"
                },
                "invitation": {
                    "subject": "You've Been Invited to TAP Integration Platform",
                    "template_id": "invitation-template-123"
                }
            }
        }
        
        email_result = admin_adapter.configure_email_settings(
            settings=email_settings,
            configured_by=system_admin.id
        )
        
        assert email_result["success"] is True
        
        # Step 5: Configure integration defaults
        integration_defaults = {
            "default_storage_provider": "AWS_S3",
            "default_notification_channel": "EMAIL",
            "automatic_error_retries": 3,
            "default_batch_size": 1000,
            "default_timeout_seconds": 300,
            "allowed_integration_types": ["API", "FILE", "DATABASE", "EVENT"]
        }
        
        integration_defaults_result = admin_adapter.configure_integration_defaults(
            defaults=integration_defaults,
            configured_by=system_admin.id
        )
        
        assert integration_defaults_result["success"] is True
        
        # Step 6: Verify system configuration
        system_config = admin_adapter.get_system_settings()
        
        assert system_config["system_name"] == global_settings["system_name"]
        assert len(system_config["auth_providers"]) >= 2
        
        # Step 7: Test system settings override for tenant
        tenant = admin_adapter.create_tenant({
            "name": "Config Test Tenant",
            "display_name": "Config Test Organization",
            "domain": "config-test.example.com",
            "created_by": system_admin.id
        })
        
        tenant_override = admin_adapter.set_tenant_system_overrides(
            tenant_id=tenant["id"],
            overrides={
                "session_timeout_minutes": 30,  # Override global value
                "password_policy": {
                    "min_length": 12,  # More strict for this tenant
                    "require_lowercase": True,
                    "require_uppercase": True,
                    "require_number": True,
                    "require_special": True,
                    "max_age_days": 60  # More strict for this tenant
                }
            },
            configured_by=system_admin.id
        )
        
        assert tenant_override["success"] is True
        
        # Step 8: Check audit logs for system configuration
        config_logs = admin_adapter.get_system_audit_logs(
            filters={
                "operation_types": ["SYSTEM_SETTINGS_UPDATE", "AUTH_PROVIDER_CONFIG", "EMAIL_CONFIG"]
            }
        )
        
        assert len(config_logs) >= 3  # At least 3 operations performed