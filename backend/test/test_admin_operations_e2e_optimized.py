"""
Admin Operations End-to-End Optimized Tests

This module contains optimized end-to-end tests for administrative operations,
using the E2E test adapter for workflow tracking and cross-component integration.
"""

import pytest
import uuid
from datetime import datetime, timezone

from test_adapters.auth.auth_adapter import User


class TestAdminOperationsE2EOptimized:
    """Optimized end-to-end tests for administrative operations using the E2E adapter."""
    
    def test_tenant_management_workflow(self, entity_registry, e2e_adapter):
        """
        Test the tenant management workflow using
        the optimized E2E adapter for workflow tracking.
        
        This test verifies the tenant management workflow with clear step progression and
        comprehensive tracking of the process.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "tenant-management-1",
            "Tenant Management Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create a super admin user
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_super_admin",
                "Create a super admin user for tenant management"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            super_admin = e2e_adapter.auth_adapter.add_user(
                User(
                    id=str(uuid.uuid4()),
                    email="super_admin_opt@example.com",
                    name="Super Admin User Optimized",
                    role="SUPER_ADMIN",
                    mfa_enabled=False
                )
            )
            
            # Associate the user entity with this step
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", super_admin.id)
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success",
                {"user_id": super_admin.id}
            )
            
            # Step 2: Create a new tenant
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_tenant",
                "Create a new tenant organization"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            tenant_data = {
                "name": "Test Tenant Optimized",
                "display_name": "Test Tenant Organization Optimized",
                "domain": "test-tenant-opt.example.com",
                "contact_email": "admin@test-tenant-opt.example.com",
                "subscription_tier": "PREMIUM",
                "max_users": 100,
                "max_storage_gb": 500,
                "created_by": super_admin.id
            }
            
            tenant = e2e_adapter.admin_adapter.create_tenant(tenant_data)
            
            assert tenant["id"] is not None
            assert tenant["name"] == "Test Tenant Optimized"
            assert tenant["subscription_tier"] == "PREMIUM"
            
            tenant_id = tenant["id"]
            
            # Associate the tenant entity with this step
            e2e_adapter.associate_entity(workflow_id, step2["id"], "Tenant", str(tenant_id))
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {"tenant_id": tenant_id}
            )
            
            # Step 3: Create a tenant admin
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_tenant_admin",
                "Create a tenant admin user"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            tenant_admin = e2e_adapter.auth_adapter.add_user(
                User(
                    id=str(uuid.uuid4()),
                    email="tenant_admin_opt@test-tenant-opt.example.com",
                    name="Tenant Admin User Optimized",
                    role="ADMIN",
                    mfa_enabled=False
                )
            )
            
            e2e_adapter.associate_entity(workflow_id, step3["id"], "User", tenant_admin.id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                {"admin_id": tenant_admin.id}
            )
            
            # Step 4: Assign admin to tenant
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "assign_admin_to_tenant",
                "Assign admin user to the tenant"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            assignment_result = e2e_adapter.admin_adapter.assign_user_to_tenant(
                user_id=tenant_admin.id,
                tenant_id=tenant_id,
                assigned_by=super_admin.id,
                role="TENANT_ADMIN"
            )
            
            assert assignment_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                {
                    "assignment_success": assignment_result["success"],
                    "tenant_role": "TENANT_ADMIN"
                }
            )
            
            # Step 5: Configure tenant settings
            step5 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_tenant_settings",
                "Configure tenant-specific settings"
            )
            e2e_adapter.start_step(workflow_id, step5["id"])
            
            tenant_settings = {
                "logo_url": "https://test-tenant-opt.example.com/logo.png",
                "primary_color": "#1a73e8",
                "secondary_color": "#f8f9fa",
                "login_page_message": "Welcome to Test Tenant Portal - Optimized",
                "allowed_domains": ["test-tenant-opt.example.com", "partner-opt.example.com"],
                "default_language": "en-US",
                "default_timezone": "America/New_York",
                "security_settings": {
                    "mfa_required": True,
                    "password_expiry_days": 90,
                    "session_timeout_minutes": 30
                }
            }
            
            settings_result = e2e_adapter.admin_adapter.update_tenant_settings(
                tenant_id=tenant_id,
                settings=tenant_settings,
                updated_by=tenant_admin.id
            )
            
            assert settings_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step5["id"], 
                "success",
                {
                    "settings_updated": settings_result["success"],
                    "settings_count": len(tenant_settings)
                }
            )
            
            # Step 6: Create tenant users
            step6 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_tenant_users",
                "Create users for the tenant"
            )
            e2e_adapter.start_step(workflow_id, step6["id"])
            
            tenant_user1 = e2e_adapter.auth_adapter.add_user(
                User(
                    id=str(uuid.uuid4()),
                    email="user1_opt@test-tenant-opt.example.com",
                    name="Tenant User 1 Optimized",
                    role="USER",
                    mfa_enabled=False
                )
            )
            
            tenant_user2 = e2e_adapter.auth_adapter.add_user(
                User(
                    id=str(uuid.uuid4()),
                    email="user2_opt@test-tenant-opt.example.com",
                    name="Tenant User 2 Optimized",
                    role="USER",
                    mfa_enabled=False
                )
            )
            
            e2e_adapter.associate_entity(workflow_id, step6["id"], "User", tenant_user1.id)
            e2e_adapter.associate_entity(workflow_id, step6["id"], "User", tenant_user2.id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step6["id"], 
                "success",
                {
                    "user1_id": tenant_user1.id,
                    "user2_id": tenant_user2.id
                }
            )
            
            # Step 7: Assign users to tenant
            step7 = e2e_adapter.add_workflow_step(
                workflow_id,
                "assign_users_to_tenant",
                "Assign users to the tenant"
            )
            e2e_adapter.start_step(workflow_id, step7["id"])
            
            assignment1 = e2e_adapter.admin_adapter.assign_user_to_tenant(
                user_id=tenant_user1.id,
                tenant_id=tenant_id,
                assigned_by=tenant_admin.id,
                role="TENANT_USER"
            )
            
            assignment2 = e2e_adapter.admin_adapter.assign_user_to_tenant(
                user_id=tenant_user2.id,
                tenant_id=tenant_id,
                assigned_by=tenant_admin.id,
                role="TENANT_USER"
            )
            
            e2e_adapter.complete_step(
                workflow_id, 
                step7["id"], 
                "success",
                {
                    "assignments_success": assignment1["success"] and assignment2["success"],
                    "users_assigned": 2
                }
            )
            
            # Step 8: Create tenant resources
            step8 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_tenant_resources",
                "Create resources for the tenant"
            )
            e2e_adapter.start_step(workflow_id, step8["id"])
            
            dataset = e2e_adapter.admin_adapter.create_tenant_resource(
                tenant_id=tenant_id,
                resource_type="DATASET",
                resource_data={
                    "name": "Tenant Test Dataset Optimized",
                    "description": "Test dataset for tenant - optimized",
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
            
            e2e_adapter.complete_step(
                workflow_id, 
                step8["id"], 
                "success",
                {
                    "resource_created": dataset["success"],
                    "resource_type": "DATASET",
                    "resource_name": dataset["resource"]["name"]
                }
            )
            
            # Step 9: Verify tenant isolation
            step9 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_tenant_isolation",
                "Verify tenant data isolation"
            )
            e2e_adapter.start_step(workflow_id, step9["id"])
            
            tenant_users = e2e_adapter.admin_adapter.get_tenant_users(tenant_id)
            assert len(tenant_users) == 3  # admin + 2 users
            
            tenant_resources = e2e_adapter.admin_adapter.get_tenant_resources(tenant_id)
            assert len(tenant_resources) >= 1
            
            e2e_adapter.complete_step(
                workflow_id, 
                step9["id"], 
                "success",
                {
                    "tenant_user_count": len(tenant_users),
                    "tenant_resource_count": len(tenant_resources)
                }
            )
            
            # Step 10: Create another tenant to test isolation
            step10 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_other_tenant",
                "Create another tenant for isolation testing"
            )
            e2e_adapter.start_step(workflow_id, step10["id"])
            
            other_tenant = e2e_adapter.admin_adapter.create_tenant({
                "name": "Other Tenant Optimized",
                "display_name": "Other Test Organization Optimized",
                "domain": "other-tenant-opt.example.com",
                "subscription_tier": "STANDARD",
                "created_by": super_admin.id
            })
            
            other_tenant_id = other_tenant["id"]
            
            e2e_adapter.associate_entity(workflow_id, step10["id"], "Tenant", str(other_tenant_id))
            
            e2e_adapter.complete_step(
                workflow_id, 
                step10["id"], 
                "success",
                {"other_tenant_id": other_tenant_id}
            )
            
            # Step 11: Verify cross-tenant isolation
            step11 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_cross_tenant_isolation",
                "Verify isolation between tenants"
            )
            e2e_adapter.start_step(workflow_id, step11["id"])
            
            other_tenant_users = e2e_adapter.admin_adapter.get_tenant_users(other_tenant_id)
            assert len(other_tenant_users) == 0  # No users assigned yet
            
            other_tenant_resources = e2e_adapter.admin_adapter.get_tenant_resources(other_tenant_id)
            assert len(other_tenant_resources) == 0  # No resources created yet
            
            e2e_adapter.complete_step(
                workflow_id, 
                step11["id"], 
                "success",
                {
                    "other_tenant_user_count": len(other_tenant_users),
                    "other_tenant_resource_count": len(other_tenant_resources),
                    "isolation_verified": True
                }
            )
            
            # Step 12: Check audit logs
            step12 = e2e_adapter.add_workflow_step(
                workflow_id,
                "check_audit_logs",
                "Check tenant operation audit logs"
            )
            e2e_adapter.start_step(workflow_id, step12["id"])
            
            audit_logs = e2e_adapter.admin_adapter.get_tenant_audit_logs(tenant_id)
            
            assert len(audit_logs) >= 4  # At least 4 operations performed
            
            # Verify key operations are logged
            operation_types = [log["operation_type"] for log in audit_logs]
            assert "TENANT_CREATION" in operation_types
            assert "TENANT_USER_ASSIGNMENT" in operation_types
            assert "TENANT_SETTINGS_UPDATE" in operation_types
            assert "RESOURCE_CREATION" in operation_types
            
            e2e_adapter.complete_step(
                workflow_id, 
                step12["id"], 
                "success",
                {
                    "audit_log_count": len(audit_logs),
                    "operation_types": operation_types
                }
            )
            
            # Complete the workflow
            e2e_adapter.complete_workflow(workflow_id, "completed")
            
            # Verify workflow completion and success
            workflow_status = e2e_adapter.get_workflow_status(workflow_id)
            assert workflow_status == "completed"
            
            # Check all steps were completed successfully
            workflow = e2e_adapter.get_workflow(workflow_id)
            for step in workflow["steps"]:
                assert step["status"] == "success"
                
        except Exception as e:
            # In case of error, mark the current step and workflow as failed
            current_step = workflow.get("current_step", 0)
            if current_step < len(workflow["steps"]):
                e2e_adapter.complete_step(
                    workflow_id, 
                    current_step, 
                    "failure",
                    {"error": str(e)}
                )
            e2e_adapter.complete_workflow(workflow_id, "failed")
            raise
    
    def test_user_management_workflow(self, entity_registry, e2e_adapter):
        """
        Test the user management workflow using
        the optimized E2E adapter for workflow tracking.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "user-management-1",
            "User Management Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create an admin user
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_admin_user",
                "Create an admin user for user management"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            admin_user = e2e_adapter.auth_adapter.add_user(
                User(
                    id=str(uuid.uuid4()),
                    email="user_admin_opt@example.com",
                    name="User Admin Optimized",
                    role="ADMIN",
                    mfa_enabled=False
                )
            )
            
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", admin_user.id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success",
                {"admin_id": admin_user.id}
            )
            
            # Step 2: Create a batch of users
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_user_batch",
                "Create a batch of users"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            users_data = [
                {
                    "email": "batch_user1_opt@example.com",
                    "name": "Batch User 1 Optimized",
                    "role": "USER",
                    "department": "Engineering",
                    "title": "Software Engineer"
                },
                {
                    "email": "batch_user2_opt@example.com",
                    "name": "Batch User 2 Optimized",
                    "role": "MANAGER",
                    "department": "Product",
                    "title": "Product Manager"
                },
                {
                    "email": "batch_user3_opt@example.com",
                    "name": "Batch User 3 Optimized",
                    "role": "READONLY",
                    "department": "Finance",
                    "title": "Financial Analyst"
                }
            ]
            
            batch_result = e2e_adapter.admin_adapter.create_users_batch(
                users_data=users_data,
                created_by=admin_user.id,
                send_welcome_email=True
            )
            
            assert batch_result["success"] is True
            assert batch_result["created_count"] == 3
            
            created_user_ids = batch_result["created_user_ids"]
            
            for user_id in created_user_ids:
                e2e_adapter.associate_entity(workflow_id, step2["id"], "User", user_id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {
                    "users_created": batch_result["created_count"],
                    "user_ids": created_user_ids
                }
            )
            
            # Step 3: Get user details
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "get_user_details",
                "Get details of created users"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            user1 = e2e_adapter.auth_adapter.get_user_by_id(created_user_ids[0])
            assert user1 is not None
            assert user1.email == "batch_user1_opt@example.com"
            
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                {
                    "user_found": user1 is not None,
                    "user_email": user1.email
                }
            )
            
            # Step 4: Update user
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "update_user",
                "Update user information"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            user_update = e2e_adapter.admin_adapter.update_user(
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
            
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                {
                    "update_success": user_update["success"],
                    "updated_fields": ["department", "title", "manager_id", "custom_attributes"]
                }
            )
            
            # Step 5: Disable user
            step5 = e2e_adapter.add_workflow_step(
                workflow_id,
                "disable_user",
                "Disable a user"
            )
            e2e_adapter.start_step(workflow_id, step5["id"])
            
            disable_result = e2e_adapter.admin_adapter.update_user_status(
                user_id=created_user_ids[2],
                status="DISABLED",
                reason="Test disabling user - optimized",
                updated_by=admin_user.id
            )
            
            assert disable_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step5["id"], 
                "success",
                {
                    "disable_success": disable_result["success"],
                    "disabled_user_id": created_user_ids[2]
                }
            )
            
            # Step 6: Verify user statuses
            step6 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_user_statuses",
                "Verify status of all created users"
            )
            e2e_adapter.start_step(workflow_id, step6["id"])
            
            users = e2e_adapter.admin_adapter.get_users(
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
            
            e2e_adapter.complete_step(
                workflow_id, 
                step6["id"], 
                "success",
                {
                    "user_count": len(users),
                    "user1_status": user1_status,
                    "user3_status": user3_status
                }
            )
            
            # Step 7: Check user audit logs
            step7 = e2e_adapter.add_workflow_step(
                workflow_id,
                "check_user_audit_logs",
                "Check audit logs for user operations"
            )
            e2e_adapter.start_step(workflow_id, step7["id"])
            
            user_logs = e2e_adapter.admin_adapter.get_user_audit_logs(created_user_ids[0])
            
            assert len(user_logs) >= 2  # At least creation and update
            
            e2e_adapter.complete_step(
                workflow_id, 
                step7["id"], 
                "success",
                {
                    "audit_log_count": len(user_logs)
                }
            )
            
            # Step 8: Test bulk operations
            step8 = e2e_adapter.add_workflow_step(
                workflow_id,
                "bulk_update_users",
                "Perform bulk update on multiple users"
            )
            e2e_adapter.start_step(workflow_id, step8["id"])
            
            bulk_op_result = e2e_adapter.admin_adapter.bulk_update_users(
                user_ids=[created_user_ids[0], created_user_ids[1]],
                update_data={
                    "account_type": "INTERNAL",
                    "login_instructions_sent": True
                },
                updated_by=admin_user.id
            )
            
            assert bulk_op_result["success"] is True
            assert bulk_op_result["updated_count"] == 2
            
            e2e_adapter.complete_step(
                workflow_id, 
                step8["id"], 
                "success",
                {
                    "bulk_update_success": bulk_op_result["success"],
                    "users_updated": bulk_op_result["updated_count"]
                }
            )
            
            # Complete the workflow
            e2e_adapter.complete_workflow(workflow_id, "completed")
            
            # Verify workflow completion
            workflow_status = e2e_adapter.get_workflow_status(workflow_id)
            assert workflow_status == "completed"
            
        except Exception as e:
            # In case of error, mark the current step and workflow as failed
            current_step = workflow.get("current_step", 0)
            if current_step < len(workflow["steps"]):
                e2e_adapter.complete_step(
                    workflow_id, 
                    current_step, 
                    "failure",
                    {"error": str(e)}
                )
            e2e_adapter.complete_workflow(workflow_id, "failed")
            raise
    
    def test_system_configuration_workflow(self, entity_registry, e2e_adapter):
        """
        Test system configuration management using
        the optimized E2E adapter for workflow tracking.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "system-configuration-1",
            "System Configuration Management Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create system admin
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_system_admin",
                "Create a system administrator"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            system_admin = e2e_adapter.auth_adapter.add_user(
                User(
                    id=str(uuid.uuid4()),
                    email="system_admin_opt@example.com",
                    name="System Admin Optimized",
                    role="SUPER_ADMIN",
                    mfa_enabled=True
                )
            )
            
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", system_admin.id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success",
                {"admin_id": system_admin.id}
            )
            
            # Step 2: Update global system settings
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "update_system_settings",
                "Update global system settings"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            global_settings = {
                "system_name": "TAP Integration Platform - Test Optimized",
                "company_name": "Test Company Optimized, Inc.",
                "support_email": "support_opt@example.com",
                "support_url": "https://support-opt.example.com",
                "terms_url": "https://example.com/terms-opt",
                "privacy_url": "https://example.com/privacy-opt",
                "default_language": "en-US",
                "available_languages": ["en-US", "es-ES", "fr-FR", "de-DE", "ja-JP"],
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
            
            settings_result = e2e_adapter.admin_adapter.update_system_settings(
                settings=global_settings,
                updated_by=system_admin.id
            )
            
            assert settings_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {
                    "settings_updated": settings_result["success"],
                    "settings_count": len(global_settings)
                }
            )
            
            # Step 3: Configure authentication providers
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_auth_providers",
                "Configure authentication providers"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            auth_providers = [
                {
                    "provider_type": "OAUTH",
                    "provider_name": "Google",
                    "enabled": True,
                    "config": {
                        "client_id": f"test-client-{uuid.uuid4()}",
                        "client_secret": f"test-secret-{uuid.uuid4()}",
                        "redirect_uri": "https://example.com/oauth/callback/google-opt",
                        "scopes": ["email", "profile"]
                    }
                },
                {
                    "provider_type": "SAML",
                    "provider_name": "Okta",
                    "enabled": True,
                    "config": {
                        "metadata_url": "https://test-company-opt.okta.com/app/metadata",
                        "entity_id": "https://example.com/saml-opt",
                        "assertion_consumer_service_url": "https://example.com/saml/callback-opt"
                    }
                }
            ]
            
            provider_results = []
            for provider in auth_providers:
                provider_result = e2e_adapter.admin_adapter.configure_auth_provider(
                    provider_data=provider,
                    configured_by=system_admin.id
                )
                provider_results.append(provider_result)
                assert provider_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                {
                    "providers_configured": len(provider_results),
                    "provider_types": [p["provider_type"] for p in auth_providers]
                }
            )
            
            # Step 4: Configure email settings
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_email_settings",
                "Configure system email settings"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            email_settings = {
                "smtp_server": "smtp-opt.example.com",
                "smtp_port": 587,
                "smtp_username": "notifications_opt@example.com",
                "smtp_password": "test-password-opt-123",
                "smtp_use_tls": True,
                "from_email": "noreply_opt@example.com",
                "from_name": "TAP Integration Platform Optimized",
                "email_templates": {
                    "welcome": {
                        "subject": "Welcome to TAP Integration Platform - Optimized",
                        "template_id": "welcome-template-opt-123"
                    },
                    "password_reset": {
                        "subject": "Reset Your Password - Optimized",
                        "template_id": "password-reset-template-opt-123"
                    },
                    "invitation": {
                        "subject": "You've Been Invited to TAP Integration Platform - Optimized",
                        "template_id": "invitation-template-opt-123"
                    }
                }
            }
            
            email_result = e2e_adapter.admin_adapter.configure_email_settings(
                settings=email_settings,
                configured_by=system_admin.id
            )
            
            assert email_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                {
                    "email_configured": email_result["success"],
                    "template_count": len(email_settings["email_templates"])
                }
            )
            
            # Step 5: Configure integration defaults
            step5 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_integration_defaults",
                "Configure default settings for integrations"
            )
            e2e_adapter.start_step(workflow_id, step5["id"])
            
            integration_defaults = {
                "default_storage_provider": "AWS_S3",
                "default_notification_channel": "EMAIL",
                "automatic_error_retries": 3,
                "default_batch_size": 1000,
                "default_timeout_seconds": 300,
                "allowed_integration_types": ["API", "FILE", "DATABASE", "EVENT", "STREAMING"]
            }
            
            integration_defaults_result = e2e_adapter.admin_adapter.configure_integration_defaults(
                defaults=integration_defaults,
                configured_by=system_admin.id
            )
            
            assert integration_defaults_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step5["id"], 
                "success",
                {
                    "defaults_configured": integration_defaults_result["success"],
                    "default_storage": integration_defaults["default_storage_provider"],
                    "integration_types": len(integration_defaults["allowed_integration_types"])
                }
            )
            
            # Step 6: Verify system configuration
            step6 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_system_configuration",
                "Verify system configuration settings"
            )
            e2e_adapter.start_step(workflow_id, step6["id"])
            
            system_config = e2e_adapter.admin_adapter.get_system_settings()
            
            assert system_config["system_name"] == global_settings["system_name"]
            assert len(system_config["auth_providers"]) >= 2
            
            e2e_adapter.complete_step(
                workflow_id, 
                step6["id"], 
                "success",
                {
                    "system_name_verified": system_config["system_name"] == global_settings["system_name"],
                    "auth_provider_count": len(system_config["auth_providers"])
                }
            )
            
            # Step 7: Test tenant settings override
            step7 = e2e_adapter.add_workflow_step(
                workflow_id,
                "tenant_settings_override",
                "Configure tenant-specific overrides of system settings"
            )
            e2e_adapter.start_step(workflow_id, step7["id"])
            
            # Create test tenant
            tenant = e2e_adapter.admin_adapter.create_tenant({
                "name": "Config Test Tenant Optimized",
                "display_name": "Config Test Organization Optimized",
                "domain": "config-test-opt.example.com",
                "created_by": system_admin.id
            })
            
            tenant_override = e2e_adapter.admin_adapter.set_tenant_system_overrides(
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
            
            e2e_adapter.complete_step(
                workflow_id, 
                step7["id"], 
                "success",
                {
                    "tenant_created": tenant["id"] is not None,
                    "overrides_applied": tenant_override["success"],
                    "override_fields": ["session_timeout_minutes", "password_policy"]
                }
            )
            
            # Step 8: Check audit logs for system configuration
            step8 = e2e_adapter.add_workflow_step(
                workflow_id,
                "check_system_audit_logs",
                "Check audit logs for system configuration"
            )
            e2e_adapter.start_step(workflow_id, step8["id"])
            
            config_logs = e2e_adapter.admin_adapter.get_system_audit_logs(
                filters={
                    "operation_types": ["SYSTEM_SETTINGS_UPDATE", "AUTH_PROVIDER_CONFIG", "EMAIL_CONFIG"]
                }
            )
            
            assert len(config_logs) >= 3  # At least 3 operations performed
            
            e2e_adapter.complete_step(
                workflow_id, 
                step8["id"], 
                "success",
                {
                    "audit_log_count": len(config_logs)
                }
            )
            
            # Complete the workflow
            e2e_adapter.complete_workflow(workflow_id, "completed")
            
            # Verify workflow completion
            workflow_status = e2e_adapter.get_workflow_status(workflow_id)
            assert workflow_status == "completed"
            
        except Exception as e:
            # In case of error, mark the current step and workflow as failed
            current_step = workflow.get("current_step", 0)
            if current_step < len(workflow["steps"]):
                e2e_adapter.complete_step(
                    workflow_id, 
                    current_step, 
                    "failure",
                    {"error": str(e)}
                )
            e2e_adapter.complete_workflow(workflow_id, "failed")
            raise