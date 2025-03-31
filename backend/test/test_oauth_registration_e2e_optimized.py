"""
OAuth Registration End-to-End Optimized Tests

This module contains optimized end-to-end tests for the OAuth registration workflow,
using the E2E test adapter for workflow tracking and cross-component integration.
"""

import pytest
import uuid
from datetime import datetime, timezone

from test_adapters.auth.auth_adapter import User


class TestOAuthRegistrationE2EOptimized:
    """Optimized end-to-end tests for OAuth registration workflow using the E2E adapter."""
    
    def test_complete_oauth_registration_workflow(self, entity_registry, e2e_adapter):
        """
        Test the complete OAuth registration process using
        the optimized E2E adapter for workflow tracking.
        
        This test verifies the OAuth registration workflow with clear step progression and
        comprehensive tracking of the process.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "oauth-registration-1",
            "Complete OAuth Registration Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create an admin user to configure OAuth
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_admin_user",
                "Create an admin user to configure OAuth"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            admin_user = e2e_adapter.auth_adapter.create_user(
                email="oauth_admin_opt@example.com",
                name="OAuth Admin User Optimized",
                role="ADMIN"
            )
            
            # Associate the admin user entity with this step
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", admin_user.id)
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success",
                {"user_id": admin_user.id}
            )
            
            # Step 2: Configure OAuth provider
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_oauth_provider",
                "Configure the OAuth provider settings"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            oauth_config = e2e_adapter.auth_adapter.configure_oauth_provider({
                "provider": "OFFICE365",
                "client_id": f"test-client-{uuid.uuid4()}",
                "client_secret": f"test-secret-{uuid.uuid4()}",
                "redirect_uri": "https://example.com/oauth/callback/optimized",
                "scope": "openid profile email",
                "configured_by": admin_user.id,
                "role_mappings": {
                    "Administrator": "ADMIN",
                    "User": "USER",
                    "Reader": "READONLY"
                }
            })
            
            assert oauth_config["success"] is True
            assert oauth_config["provider"] == "OFFICE365"
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {
                    "provider": oauth_config["provider"],
                    "configured": True,
                    "client_id": oauth_config["client_id"]
                }
            )
            
            # Step 3: Initiate OAuth login
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "initiate_oauth_login",
                "User initiates the OAuth login process"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            state_value = str(uuid.uuid4())
            
            oauth_request = e2e_adapter.auth_adapter.initiate_oauth_login({
                "provider": "OFFICE365",
                "redirect_uri": "https://example.com/oauth/callback/optimized",
                "state": state_value
            })
            
            assert oauth_request["success"] is True
            assert "auth_url" in oauth_request
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                {
                    "state": state_value,
                    "auth_url_generated": True
                }
            )
            
            # Step 4: Process OAuth callback
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "process_oauth_callback",
                "System processes the OAuth callback with user data"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            oauth_callback = e2e_adapter.auth_adapter.process_oauth_callback({
                "provider": "OFFICE365",
                "code": f"test-auth-code-{uuid.uuid4()}",
                "state": state_value,
                # Simulated data that would come from OAuth provider
                "oauth_user_data": {
                    "id": f"oauth-user-{uuid.uuid4()}",
                    "email": "oauth_user_opt@example.com",
                    "name": "OAuth Test User Optimized",
                    "roles": ["User"],
                    "picture": "https://example.com/profile_opt.jpg"
                }
            })
            
            assert oauth_callback["success"] is True
            assert "access_token" in oauth_callback
            assert "user" in oauth_callback
            
            user_id = oauth_callback["user"]["id"]
            access_token = oauth_callback["access_token"]
            
            # Associate the created user with this step
            e2e_adapter.associate_entity(workflow_id, step4["id"], "User", user_id)
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                {
                    "user_id": user_id,
                    "token_generated": True
                }
            )
            
            # Step 5: Verify user creation
            step5 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_user_creation",
                "Verify the user was created correctly from OAuth data"
            )
            e2e_adapter.start_step(workflow_id, step5["id"])
            
            user = e2e_adapter.auth_adapter.get_user_by_id(user_id)
            assert user is not None
            assert user.email == "oauth_user_opt@example.com"
            assert hasattr(user, "oauth_provider")
            assert user.oauth_provider == "OFFICE365"
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step5["id"], 
                "success",
                {
                    "user_verified": True,
                    "oauth_provider": user.oauth_provider
                }
            )
            
            # Step 6: Verify role mapping
            step6 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_role_mapping",
                "Verify OAuth roles were mapped correctly to system roles"
            )
            e2e_adapter.start_step(workflow_id, step6["id"])
            
            user_roles = e2e_adapter.rbac_adapter.get_user_roles(user_id)
            assert "USER" in user_roles  # Mapped from "User" in OAuth data
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step6["id"], 
                "success",
                {
                    "user_roles": user_roles
                }
            )
            
            # Step 7: Verify token validation
            step7 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_token_validation",
                "Verify the OAuth-generated token is valid"
            )
            e2e_adapter.start_step(workflow_id, step7["id"])
            
            token_validation = e2e_adapter.auth_adapter.validate_token(access_token)
            assert token_validation["valid"] is True
            assert token_validation["user_id"] == user_id
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step7["id"], 
                "success",
                {
                    "token_valid": token_validation["valid"],
                    "token_user_id": token_validation["user_id"]
                }
            )
            
            # Step 8: Verify resource access
            step8 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_resource_access",
                "Verify the user can access appropriate resources"
            )
            e2e_adapter.start_step(workflow_id, step8["id"])
            
            permission_check = e2e_adapter.rbac_adapter.check_permission(
                user_id=user_id,
                resource="DASHBOARD",
                action="VIEW",
                session_token=access_token
            )
            
            assert permission_check["allowed"] is True
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step8["id"], 
                "success",
                {
                    "access_allowed": permission_check["allowed"],
                    "resource": "DASHBOARD"
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
    
    def test_oauth_user_linking_workflow(self, entity_registry, e2e_adapter):
        """
        Test linking an OAuth account to an existing user using
        the optimized E2E adapter for workflow tracking.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "oauth-user-linking-1",
            "OAuth User Linking Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create existing user
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_existing_user",
                "Create an existing user to link with OAuth"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            existing_user = e2e_adapter.auth_adapter.add_user(
                User(
                    id=str(uuid.uuid4()),
                    email="existing_user_opt@example.com",
                    name="Existing User Optimized",
                    role="USER",
                    mfa_enabled=False
                )
            )
            
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", existing_user.id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success",
                {"user_id": existing_user.id}
            )
            
            # Step 2: Configure OAuth provider
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_oauth_provider",
                "Configure OAuth provider for linking"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            oauth_config = e2e_adapter.auth_adapter.configure_oauth_provider({
                "provider": "GMAIL",
                "client_id": f"test-client-{uuid.uuid4()}",
                "client_secret": f"test-secret-{uuid.uuid4()}",
                "redirect_uri": "https://example.com/oauth/callback/linking",
                "scope": "email profile",
                "configured_by": existing_user.id
            })
            
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {
                    "provider": oauth_config["provider"],
                    "configured": oauth_config["success"]
                }
            )
            
            # Step 3: Initiate OAuth flow with linking parameter
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "initiate_oauth_with_linking",
                "Initiate OAuth flow with account linking parameter"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            state_value = str(uuid.uuid4())
            
            oauth_request = e2e_adapter.auth_adapter.initiate_oauth_login({
                "provider": "GMAIL",
                "redirect_uri": "https://example.com/oauth/callback/linking",
                "state": state_value,
                "link_to_email": "existing_user_opt@example.com"  # This signals we want to link accounts
            })
            
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                {
                    "state": state_value,
                    "linking_requested": True
                }
            )
            
            # Step 4: Process OAuth callback for linking
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "process_oauth_callback_linking",
                "Process OAuth callback with matching email for linking"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            oauth_callback = e2e_adapter.auth_adapter.process_oauth_callback({
                "provider": "GMAIL",
                "code": f"test-auth-code-{uuid.uuid4()}",
                "state": state_value,
                # Simulated data with the same email as the existing user
                "oauth_user_data": {
                    "id": f"oauth-user-{uuid.uuid4()}",
                    "email": "existing_user_opt@example.com",  # Same email as existing user
                    "name": "Existing User OAuth Optimized",
                    "picture": "https://example.com/profile_opt2.jpg"
                }
            })
            
            assert oauth_callback["success"] is True
            assert oauth_callback["user"]["id"] == existing_user.id  # Should be the same user ID
            assert "account_linked" in oauth_callback
            assert oauth_callback["account_linked"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                {
                    "account_linked": oauth_callback["account_linked"],
                    "user_id": oauth_callback["user"]["id"]
                }
            )
            
            # Step 5: Verify user has OAuth provider linked
            step5 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_oauth_linking",
                "Verify user has OAuth provider linked correctly"
            )
            e2e_adapter.start_step(workflow_id, step5["id"])
            
            updated_user = e2e_adapter.auth_adapter.get_user_by_id(existing_user.id)
            assert hasattr(updated_user, "oauth_provider")
            assert updated_user.oauth_provider == "GMAIL"
            assert hasattr(updated_user, "oauth_id")
            
            e2e_adapter.complete_step(
                workflow_id, 
                step5["id"], 
                "success",
                {
                    "oauth_provider": updated_user.oauth_provider,
                    "oauth_id_exists": hasattr(updated_user, "oauth_id")
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
    
    def test_oauth_permission_revocation_workflow(self, entity_registry, e2e_adapter):
        """
        Test OAuth permission revocation workflow using
        the optimized E2E adapter for workflow tracking.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "oauth-revocation-1",
            "OAuth Permission Revocation Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create an OAuth user with roles
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_oauth_user",
                "Create a user with OAuth provider and roles"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            oauth_user = e2e_adapter.auth_adapter.add_user(
                User(
                    id=str(uuid.uuid4()),
                    email="oauth_revoke_opt@example.com",
                    name="OAuth Revoke Test User Optimized",
                    role="USER",
                    mfa_enabled=False,
                    oauth_provider="OFFICE365",
                    oauth_id=f"oauth-user-{uuid.uuid4()}"
                )
            )
            
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", oauth_user.id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success",
                {
                    "user_id": oauth_user.id,
                    "oauth_provider": oauth_user.oauth_provider
                }
            )
            
            # Step 2: Add OAuth-sourced roles
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "add_oauth_roles",
                "Add additional roles from OAuth source"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            role_result = e2e_adapter.rbac_adapter.assign_role(
                user_id=oauth_user.id,
                role="DATA_ANALYST",
                assigned_by=oauth_user.id,
                source="OAUTH"
            )
            
            user_roles = e2e_adapter.rbac_adapter.get_user_roles(oauth_user.id)
            assert "USER" in user_roles
            assert "DATA_ANALYST" in user_roles
            
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {
                    "roles_before_revocation": user_roles
                }
            )
            
            # Step 3: Simulate OAuth permission revocation
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "revoke_oauth_permissions",
                "Simulate OAuth permission revocation from provider"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            revocation_result = e2e_adapter.auth_adapter.process_oauth_revocation({
                "provider": "OFFICE365",
                "oauth_id": oauth_user.oauth_id,
                "oauth_user_data": {
                    "id": oauth_user.oauth_id,
                    "email": oauth_user.email,
                    "name": oauth_user.name,
                    "roles": []  # No roles anymore
                }
            })
            
            assert revocation_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                {
                    "revocation_success": revocation_result["success"]
                }
            )
            
            # Step 4: Verify role revocation
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_role_revocation",
                "Verify OAuth-granted roles were revoked"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            updated_roles = e2e_adapter.rbac_adapter.get_user_roles(oauth_user.id)
            assert "DATA_ANALYST" not in updated_roles  # This came from OAuth and should be removed
            assert "USER" in updated_roles  # This is the default role and should remain
            
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                {
                    "roles_after_revocation": updated_roles,
                    "oauth_role_removed": "DATA_ANALYST" not in updated_roles,
                    "default_role_preserved": "USER" in updated_roles
                }
            )
            
            # Step 5: Verify access restriction
            step5 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_access_restriction",
                "Verify user access is appropriately restricted"
            )
            e2e_adapter.start_step(workflow_id, step5["id"])
            
            permission_check = e2e_adapter.rbac_adapter.check_permission(
                user_id=oauth_user.id,
                resource="DATA_ANALYTICS",
                action="ANALYZE",
                session_token=None
            )
            
            assert permission_check["allowed"] is False
            
            e2e_adapter.complete_step(
                workflow_id, 
                step5["id"], 
                "success",
                {
                    "access_allowed": permission_check["allowed"],
                    "resource": "DATA_ANALYTICS",
                    "action": "ANALYZE"
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