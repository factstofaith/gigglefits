"""
User Onboarding End-to-End Tests

This module contains end-to-end tests for the complete user onboarding workflow,
including invitation, registration, MFA setup, and initial login.
"""

import pytest
from datetime import datetime, timedelta, timezone
import uuid

from test_adapters.auth.timezone_test_utils import TimezoneTestUtilities


class TestUserOnboardingE2E:
    """End-to-end tests for user onboarding workflow."""
    
    def test_complete_user_onboarding(self, entity_registry, auth_adapter, 
                                     invitation_adapter, mfa_adapter, rbac_adapter):
        """
        Test the complete user onboarding process from invitation to login.
        
        This test verifies the following workflow:
        1. Admin creates a user invitation
        2. User receives the invitation
        3. User completes registration
        4. User sets up MFA
        5. User completes profile
        6. User logs in with MFA
        7. Admin assigns a role
        8. User accesses resources with new permissions
        """
        # Step 1: Admin creates a user invitation
        admin_user = auth_adapter.create_user(
            email="admin@example.com",
            name="Admin User",
            role="ADMIN"
        )
        
        invitation = invitation_adapter.create_invitation(
            email="new_user@example.com",
            role="USER",
            created_by=admin_user.id
        )
        
        assert invitation["status"] == "PENDING"
        assert invitation["email"] == "new_user@example.com"
        assert invitation["role"] == "USER"
        
        # Get the invitation token
        invitation_token = invitation["token"]
        
        # Step 2: User accepts the invitation
        invitation_acceptance = invitation_adapter.accept_invitation(invitation_token)
        assert invitation_acceptance["success"] is True
        
        registration_token = invitation_acceptance["registration_token"]
        
        # Step 3: User completes registration
        user_data = {
            "email": "new_user@example.com",
            "name": "New User",
            "password": "SecurePassword123!",
            "registration_token": registration_token
        }
        
        register_result = auth_adapter.register_user(user_data)
        assert register_result["success"] is True
        user_id = register_result["user_id"]
        
        # Verify user was created with correct initial state
        user = auth_adapter.get_user(user_id)
        assert user.email == "new_user@example.com"
        assert user.name == "New User"
        assert user.role == "USER"
        assert user.mfa_enabled is False
        
        # Step 4: User sets up MFA
        mfa_setup = mfa_adapter.begin_enrollment(user_id)
        assert mfa_setup["success"] is True
        assert "secret" in mfa_setup
        assert "qr_code" in mfa_setup
        
        # Generate test verification code from secret
        verification_code = mfa_adapter.generate_test_code(mfa_setup["secret"])
        
        # Complete MFA enrollment
        mfa_verify = mfa_adapter.complete_enrollment(
            user_id, 
            verification_code,
            mfa_setup["enrollment_token"]
        )
        assert mfa_verify["success"] is True
        
        # Get recovery codes for emergencies
        recovery_codes = mfa_adapter.get_recovery_codes(user_id)
        assert len(recovery_codes) > 0
        
        # Verify MFA is now enabled for the user
        user = auth_adapter.get_user(user_id)
        assert user.mfa_enabled is True
        
        # Step 5: User completes profile setup
        profile_update = auth_adapter.update_user_profile(
            user_id,
            {
                "display_name": "New Test User",
                "timezone": "America/New_York",
                "preferred_language": "en-US"
            }
        )
        assert profile_update["success"] is True
        
        # Step 6: User logs in with MFA
        # First stage - email/password authentication
        auth_result = auth_adapter.authenticate(
            email="new_user@example.com",
            password="SecurePassword123!"
        )
        assert auth_result["success"] is True
        assert auth_result["mfa_required"] is True
        assert "mfa_token" in auth_result
        
        # Get a fresh verification code
        verification_code = mfa_adapter.generate_test_code(mfa_setup["secret"])
        
        # Second stage - MFA verification
        mfa_auth_result = mfa_adapter.verify_mfa(
            user_id,
            auth_result["mfa_token"],
            verification_code
        )
        assert mfa_auth_result["success"] is True
        assert "token" in mfa_auth_result
        
        # Extract session token
        session_token = mfa_auth_result["token"]
        
        # Step 7: Admin assigns additional role to the user
        role_assignment = rbac_adapter.assign_role(
            user_id=user_id,
            role="DATA_ANALYST",
            assigned_by=admin_user.id
        )
        assert role_assignment["success"] is True
        
        # Verify user now has both roles
        user_roles = rbac_adapter.get_user_roles(user_id)
        assert "USER" in user_roles
        assert "DATA_ANALYST" in user_roles
        
        # Step 8: User accesses a protected resource requiring DATA_ANALYST role
        # First with an invalid resource
        access_result = rbac_adapter.check_permission(
            user_id=user_id,
            resource="REPORTS",
            action="VIEW",
            session_token=session_token
        )
        assert access_result["allowed"] is True
        
        # Let's also test a permission the user should not have
        admin_access = rbac_adapter.check_permission(
            user_id=user_id,
            resource="ADMIN_DASHBOARD",
            action="ACCESS",
            session_token=session_token
        )
        assert admin_access["allowed"] is False
    
    def test_expired_invitation_flow(self, entity_registry, auth_adapter, 
                                    invitation_adapter):
        """
        Test user onboarding with an expired invitation.
        """
        # Create admin user
        admin_user = auth_adapter.create_user(
            email="admin2@example.com",
            name="Admin User 2",
            role="ADMIN"
        )
        
        # Create an invitation with expired date
        expired_date = TimezoneTestUtilities.utc_now() - timedelta(days=8)  # 8 days in the past
        
        invitation = invitation_adapter.create_invitation(
            email="expired_invite@example.com",
            role="USER",
            created_by=admin_user.id,
            expires_at=expired_date
        )
        
        # Attempt to accept the expired invitation
        invitation_acceptance = invitation_adapter.accept_invitation(invitation["token"])
        
        # Verify acceptance failed due to expiration
        assert invitation_acceptance["success"] is False
        assert "expired" in invitation_acceptance["error"].lower()
        
        # Admin extends the invitation
        extended_invitation = invitation_adapter.extend_invitation(
            invitation["id"],
            days=7,
            extended_by=admin_user.id
        )
        
        assert extended_invitation["success"] is True
        
        # Check that the invitation is now valid
        new_acceptance = invitation_adapter.accept_invitation(extended_invitation["token"])
        assert new_acceptance["success"] is True
    
    def test_mfa_recovery_flow(self, entity_registry, auth_adapter, 
                              invitation_adapter, mfa_adapter):
        """
        Test MFA recovery process during onboarding.
        """
        # Create a user with MFA enabled
        admin_user = auth_adapter.create_user(
            email="admin3@example.com",
            name="Admin User 3",
            role="ADMIN"
        )
        
        # Create and register the user
        invitation = invitation_adapter.create_invitation(
            email="recovery_test@example.com",
            role="USER",
            created_by=admin_user.id
        )
        
        invitation_acceptance = invitation_adapter.accept_invitation(invitation["token"])
        registration_token = invitation_acceptance["registration_token"]
        
        user_data = {
            "email": "recovery_test@example.com",
            "name": "Recovery Test User",
            "password": "SecurePassword123!",
            "registration_token": registration_token
        }
        
        register_result = auth_adapter.register_user(user_data)
        user_id = register_result["user_id"]
        
        # Set up MFA
        mfa_setup = mfa_adapter.begin_enrollment(user_id)
        verification_code = mfa_adapter.generate_test_code(mfa_setup["secret"])
        
        mfa_verify = mfa_adapter.complete_enrollment(
            user_id, 
            verification_code,
            mfa_setup["enrollment_token"]
        )
        
        # Get recovery codes
        recovery_codes = mfa_adapter.get_recovery_codes(user_id)
        first_recovery_code = recovery_codes[0]
        
        # Simulate lost device by forgetting the MFA secret
        forgotten_secret = mfa_setup["secret"]
        mfa_setup["secret"] = None
        
        # Authenticate with password
        auth_result = auth_adapter.authenticate(
            email="recovery_test@example.com",
            password="SecurePassword123!"
        )
        
        # Use recovery code instead of MFA code
        recovery_auth = mfa_adapter.verify_with_recovery_code(
            user_id,
            auth_result["mfa_token"],
            first_recovery_code
        )
        
        assert recovery_auth["success"] is True
        assert "token" in recovery_auth
        
        # Verify that the recovery code was consumed
        updated_recovery_codes = mfa_adapter.get_recovery_codes(user_id)
        assert first_recovery_code not in updated_recovery_codes
        
        # Reset MFA
        reset_result = mfa_adapter.reset_mfa(user_id)
        assert reset_result["success"] is True
        
        # Verify user can now log in without MFA
        simple_auth = auth_adapter.authenticate(
            email="recovery_test@example.com",
            password="SecurePassword123!"
        )
        assert simple_auth["success"] is True
        assert simple_auth.get("mfa_required") is False