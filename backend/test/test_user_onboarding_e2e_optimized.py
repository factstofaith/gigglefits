"""
User Onboarding End-to-End Optimized Tests

This module contains optimized end-to-end tests for the complete user onboarding workflow,
using the E2E test adapter for workflow tracking and cross-component integration.
"""

import pytest
from datetime import datetime, timedelta, timezone
import uuid

from test_adapters.auth.timezone_test_utils import TimezoneTestUtilities


class TestUserOnboardingE2EOptimized:
    """Optimized end-to-end tests for user onboarding workflow using the E2E adapter."""
    
    def test_complete_user_onboarding_workflow(self, entity_registry, e2e_adapter):
        """
        Test the complete user onboarding process from invitation to login using
        the optimized E2E adapter for workflow tracking.
        
        This test verifies the onboarding workflow with clear step progression and
        comprehensive tracking of the process.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "user-onboarding-1",
            "Complete User Onboarding Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Admin creates a user invitation
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_invitation",
                "Admin creates a user invitation"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            admin_user = e2e_adapter.auth_adapter.create_user(
                email="admin_optimized@example.com",
                name="Admin User Optimized",
                role="ADMIN"
            )
            
            invitation = e2e_adapter.invitation_adapter.create_invitation(
                email="new_user_optimized@example.com",
                role="USER",
                created_by=admin_user.id
            )
            
            # Associate the created entities with this step
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", admin_user.id)
            e2e_adapter.associate_entity(workflow_id, step1["id"], "Invitation", invitation["id"])
            
            # Verify step result
            assert invitation["status"] == "PENDING"
            assert invitation["email"] == "new_user_optimized@example.com"
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success",
                {"invitation_id": invitation["id"], "token": invitation["token"]}
            )
            
            # Step 2: User accepts the invitation
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "accept_invitation",
                "User accepts the invitation email"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            invitation_acceptance = e2e_adapter.invitation_adapter.accept_invitation(
                invitation["token"]
            )
            
            # Verify step result
            assert invitation_acceptance["success"] is True
            registration_token = invitation_acceptance["registration_token"]
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {"registration_token": registration_token}
            )
            
            # Step 3: User completes registration
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "complete_registration",
                "User completes registration with personal details"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            user_data = {
                "email": "new_user_optimized@example.com",
                "name": "New User Optimized",
                "password": "SecurePassword123!",
                "registration_token": registration_token
            }
            
            register_result = e2e_adapter.auth_adapter.register_user(user_data)
            assert register_result["success"] is True
            user_id = register_result["user_id"]
            
            # Associate the user entity
            e2e_adapter.associate_entity(workflow_id, step3["id"], "User", user_id)
            
            # Verify user details
            user = e2e_adapter.auth_adapter.get_user(user_id)
            assert user.email == "new_user_optimized@example.com"
            assert user.role == "USER"
            assert user.mfa_enabled is False
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                {"user_id": user_id}
            )
            
            # Step 4: User sets up MFA
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "setup_mfa",
                "User sets up multi-factor authentication"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            # Start MFA enrollment
            mfa_setup = e2e_adapter.mfa_adapter.begin_enrollment(user_id)
            assert mfa_setup["success"] is True
            assert "secret" in mfa_setup
            
            # Generate test verification code
            verification_code = e2e_adapter.mfa_adapter.generate_test_code(mfa_setup["secret"])
            
            # Complete MFA enrollment
            mfa_verify = e2e_adapter.mfa_adapter.complete_enrollment(
                user_id, 
                verification_code,
                mfa_setup["enrollment_token"]
            )
            assert mfa_verify["success"] is True
            
            # Get recovery codes
            recovery_codes = e2e_adapter.mfa_adapter.get_recovery_codes(user_id)
            
            # Verify MFA is enabled
            user = e2e_adapter.auth_adapter.get_user(user_id)
            assert user.mfa_enabled is True
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                {
                    "mfa_enabled": True,
                    "recovery_codes_count": len(recovery_codes)
                }
            )
            
            # Step 5: User completes profile
            step5 = e2e_adapter.add_workflow_step(
                workflow_id,
                "complete_profile",
                "User completes their profile information"
            )
            e2e_adapter.start_step(workflow_id, step5["id"])
            
            profile_update = e2e_adapter.auth_adapter.update_user_profile(
                user_id,
                {
                    "display_name": "Optimized Test User",
                    "timezone": "Europe/London",
                    "preferred_language": "en-GB"
                }
            )
            assert profile_update["success"] is True
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step5["id"], 
                "success",
                {"profile_updated": True}
            )
            
            # Step 6: User logs in with MFA
            step6 = e2e_adapter.add_workflow_step(
                workflow_id,
                "login_with_mfa",
                "User logs in with MFA verification"
            )
            e2e_adapter.start_step(workflow_id, step6["id"])
            
            # First stage authentication
            auth_result = e2e_adapter.auth_adapter.authenticate(
                email="new_user_optimized@example.com",
                password="SecurePassword123!"
            )
            assert auth_result["success"] is True
            assert auth_result["mfa_required"] is True
            
            # Second stage - MFA verification
            verification_code = e2e_adapter.mfa_adapter.generate_test_code(mfa_setup["secret"])
            
            mfa_auth_result = e2e_adapter.mfa_adapter.verify_mfa(
                user_id,
                auth_result["mfa_token"],
                verification_code
            )
            assert mfa_auth_result["success"] is True
            assert "token" in mfa_auth_result
            
            session_token = mfa_auth_result["token"]
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step6["id"], 
                "success",
                {"authenticated": True, "session_token": session_token[:10] + "..."}
            )
            
            # Step 7: Admin assigns roles
            step7 = e2e_adapter.add_workflow_step(
                workflow_id,
                "assign_roles",
                "Admin assigns additional roles to the user"
            )
            e2e_adapter.start_step(workflow_id, step7["id"])
            
            role_assignment = e2e_adapter.rbac_adapter.assign_role(
                user_id=user_id,
                role="DATA_ANALYST",
                assigned_by=admin_user.id
            )
            assert role_assignment["success"] is True
            
            # Verify user roles
            user_roles = e2e_adapter.rbac_adapter.get_user_roles(user_id)
            assert "USER" in user_roles
            assert "DATA_ANALYST" in user_roles
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step7["id"], 
                "success",
                {"assigned_roles": user_roles}
            )
            
            # Step 8: Verify resource access
            step8 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_access",
                "Verify user access to protected resources"
            )
            e2e_adapter.start_step(workflow_id, step8["id"])
            
            # Check permitted access
            reports_access = e2e_adapter.rbac_adapter.check_permission(
                user_id=user_id,
                resource="REPORTS",
                action="VIEW",
                session_token=session_token
            )
            assert reports_access["allowed"] is True
            
            # Check denied access
            admin_access = e2e_adapter.rbac_adapter.check_permission(
                user_id=user_id,
                resource="ADMIN_DASHBOARD",
                action="ACCESS",
                session_token=session_token
            )
            assert admin_access["allowed"] is False
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step8["id"], 
                "success",
                {
                    "access_verified": True,
                    "permitted_resources": ["REPORTS"],
                    "denied_resources": ["ADMIN_DASHBOARD"]
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
    
    def test_invitation_expiration_and_extension(self, entity_registry, e2e_adapter):
        """
        Test invitation expiration and extension using the optimized E2E adapter.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "invitation-expiration-1",
            "Invitation Expiration and Extension"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Admin creates an expired invitation
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_expired_invitation",
                "Admin creates an invitation that is already expired"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            admin_user = e2e_adapter.auth_adapter.create_user(
                email="admin_expiry@example.com",
                name="Admin Expiry Test",
                role="ADMIN"
            )
            
            # Create invitation with expired date
            expired_date = TimezoneTestUtilities.utc_now() - timedelta(days=8)
            
            invitation = e2e_adapter.invitation_adapter.create_invitation(
                email="expired_test@example.com",
                role="USER",
                created_by=admin_user.id,
                expires_at=expired_date
            )
            
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", admin_user.id)
            e2e_adapter.associate_entity(workflow_id, step1["id"], "Invitation", invitation["id"])
            
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success", 
                {"invitation_id": invitation["id"], "token": invitation["token"]}
            )
            
            # Step 2: User attempts to use expired invitation
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "attempt_expired_invitation",
                "User attempts to use the expired invitation"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            attempt_result = e2e_adapter.invitation_adapter.accept_invitation(invitation["token"])
            assert attempt_result["success"] is False
            assert "expired" in attempt_result["error"].lower()
            
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success", 
                {"error": attempt_result["error"]}
            )
            
            # Step 3: Admin extends the invitation
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "extend_invitation",
                "Admin extends the expired invitation"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            extension_result = e2e_adapter.invitation_adapter.extend_invitation(
                invitation["id"],
                days=7,
                extended_by=admin_user.id
            )
            assert extension_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success", 
                {"new_token": extension_result["token"]}
            )
            
            # Step 4: User successfully uses extended invitation
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "use_extended_invitation",
                "User successfully uses the extended invitation"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            acceptance_result = e2e_adapter.invitation_adapter.accept_invitation(
                extension_result["token"]
            )
            assert acceptance_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success", 
                {"registration_token": acceptance_result["registration_token"]}
            )
            
            # Complete the workflow
            e2e_adapter.complete_workflow(workflow_id, "completed")
            
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
    
    def test_mfa_recovery_workflow(self, entity_registry, e2e_adapter):
        """
        Test MFA recovery workflow using the optimized E2E adapter.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "mfa-recovery-1",
            "MFA Recovery Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create user with MFA enabled
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_user_with_mfa",
                "Create a user and enable MFA"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            # Create admin for invitation creation
            admin_user = e2e_adapter.auth_adapter.create_user(
                email="admin_recovery@example.com",
                name="Admin Recovery Test",
                role="ADMIN"
            )
            
            # Create invitation
            invitation = e2e_adapter.invitation_adapter.create_invitation(
                email="recovery_opt@example.com",
                role="USER",
                created_by=admin_user.id
            )
            
            # Accept invitation
            acceptance = e2e_adapter.invitation_adapter.accept_invitation(invitation["token"])
            
            # Complete registration
            user_data = {
                "email": "recovery_opt@example.com",
                "name": "Recovery Optimized",
                "password": "SecurePassword123!",
                "registration_token": acceptance["registration_token"]
            }
            
            register_result = e2e_adapter.auth_adapter.register_user(user_data)
            user_id = register_result["user_id"]
            
            # Setup MFA
            mfa_setup = e2e_adapter.mfa_adapter.begin_enrollment(user_id)
            verification_code = e2e_adapter.mfa_adapter.generate_test_code(mfa_setup["secret"])
            
            e2e_adapter.mfa_adapter.complete_enrollment(
                user_id, 
                verification_code,
                mfa_setup["enrollment_token"]
            )
            
            # Get recovery codes
            recovery_codes = e2e_adapter.mfa_adapter.get_recovery_codes(user_id)
            first_recovery_code = recovery_codes[0]
            
            # Store the MFA secret for later use
            secret = mfa_setup["secret"]
            
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", user_id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success", 
                {
                    "user_id": user_id, 
                    "mfa_enabled": True,
                    "recovery_codes_count": len(recovery_codes)
                }
            )
            
            # Step 2: Simulate lost device
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "simulate_lost_device",
                "Simulate a lost authentication device"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            # Authenticate with password
            auth_result = e2e_adapter.auth_adapter.authenticate(
                email="recovery_opt@example.com",
                password="SecurePassword123!"
            )
            assert auth_result["success"] is True
            assert auth_result["mfa_required"] is True
            
            # Use a standard code, which should fail since we're simulating a lost device
            wrong_code = "123456"  # Not a real code
            
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success", 
                {"mfa_token": auth_result["mfa_token"]}
            )
            
            # Step 3: Use recovery code
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "use_recovery_code",
                "User uses a recovery code to authenticate"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            # Use recovery code instead of MFA code
            recovery_auth = e2e_adapter.mfa_adapter.verify_with_recovery_code(
                user_id,
                auth_result["mfa_token"],
                first_recovery_code
            )
            
            assert recovery_auth["success"] is True
            assert "token" in recovery_auth
            
            # Verify recovery code was consumed
            updated_codes = e2e_adapter.mfa_adapter.get_recovery_codes(user_id)
            assert first_recovery_code not in updated_codes
            
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success", 
                {
                    "authenticated": True,
                    "recovery_code_used": True,
                    "remaining_codes": len(updated_codes)
                }
            )
            
            # Step 4: Reset MFA
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "reset_mfa",
                "User resets MFA to regain access"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            # Reset MFA
            reset_result = e2e_adapter.mfa_adapter.reset_mfa(user_id)
            assert reset_result["success"] is True
            
            # Verify MFA is disabled
            user = e2e_adapter.auth_adapter.get_user(user_id)
            assert user.mfa_enabled is False
            
            # Log in without MFA
            simple_auth = e2e_adapter.auth_adapter.authenticate(
                email="recovery_opt@example.com",
                password="SecurePassword123!"
            )
            
            assert simple_auth["success"] is True
            assert simple_auth.get("mfa_required") is False
            
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success", 
                {
                    "mfa_reset": True,
                    "mfa_enabled": False,
                    "login_success": True
                }
            )
            
            # Complete the workflow
            e2e_adapter.complete_workflow(workflow_id, "completed")
            
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