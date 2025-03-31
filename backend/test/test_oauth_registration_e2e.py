"""
OAuth Registration End-to-End Tests

This module contains end-to-end tests for the OAuth registration workflow,
including authentication with OAuth providers, user creation, permission mapping,
and access verification.
"""

import pytest
import uuid
from datetime import datetime, timezone

from test_adapters.auth.auth_adapter import User


class TestOAuthRegistrationE2E:
    """End-to-end tests for OAuth registration workflow."""
    
    def test_complete_oauth_registration(self, entity_registry, auth_adapter, 
                                       invitation_adapter, rbac_adapter):
        """
        Test the complete OAuth registration process.
        
        This test verifies the following workflow:
        1. Admin configures OAuth provider
        2. User initiates OAuth authentication
        3. System receives OAuth callback with user data
        4. System creates or links user account
        5. System maps OAuth permissions to roles
        6. User receives access token
        7. User accesses protected resources
        """
        # Step 1: Create an admin user to configure OAuth
        admin_user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="oauth_admin@example.com",
                name="OAuth Admin User",
                role="ADMIN",
                mfa_enabled=False
            )
        )
        
        # Step 2: Configure OAuth provider
        oauth_config = auth_adapter.configure_oauth_provider({
            "provider": "OFFICE365",
            "client_id": f"test-client-{uuid.uuid4()}",
            "client_secret": f"test-secret-{uuid.uuid4()}",
            "redirect_uri": "https://example.com/oauth/callback",
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
        
        # Step 3: Simulate OAuth initiation
        oauth_request = auth_adapter.initiate_oauth_login({
            "provider": "OFFICE365",
            "redirect_uri": "https://example.com/oauth/callback",
            "state": str(uuid.uuid4())
        })
        
        assert oauth_request["success"] is True
        assert "auth_url" in oauth_request
        
        # Step 4: Simulate OAuth callback with user data
        oauth_callback = auth_adapter.process_oauth_callback({
            "provider": "OFFICE365",
            "code": f"test-auth-code-{uuid.uuid4()}",
            "state": oauth_request["state"],
            # Simulated data that would come from OAuth provider
            "oauth_user_data": {
                "id": f"oauth-user-{uuid.uuid4()}",
                "email": "oauth_user@example.com",
                "name": "OAuth Test User",
                "roles": ["User"],
                "picture": "https://example.com/profile.jpg"
            }
        })
        
        assert oauth_callback["success"] is True
        assert "access_token" in oauth_callback
        assert "user" in oauth_callback
        
        user_id = oauth_callback["user"]["id"]
        access_token = oauth_callback["access_token"]
        
        # Step 5: Verify user was created correctly
        user = auth_adapter.get_user_by_id(user_id)
        assert user is not None
        assert user.email == "oauth_user@example.com"
        assert hasattr(user, "oauth_provider")
        assert user.oauth_provider == "OFFICE365"
        
        # Step 6: Verify role mapping
        user_roles = rbac_adapter.get_user_roles(user_id)
        assert "USER" in user_roles  # Mapped from "User" in OAuth data
        
        # Step 7: Verify access with token
        token_validation = auth_adapter.validate_token(access_token)
        assert token_validation["valid"] is True
        assert token_validation["user_id"] == user_id
        
        # Step 8: Check access to protected resources
        permission_check = rbac_adapter.check_permission(
            user_id=user_id,
            resource="DASHBOARD",
            action="VIEW",
            session_token=access_token
        )
        
        assert permission_check["allowed"] is True
    
    def test_oauth_user_linking(self, entity_registry, auth_adapter, invitation_adapter):
        """
        Test linking OAuth account to existing user.
        """
        # Step 1: Create existing user
        existing_user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="existing_user@example.com",
                name="Existing Test User",
                role="USER",
                mfa_enabled=False
            )
        )
        
        # Step 2: Configure OAuth provider
        oauth_config = auth_adapter.configure_oauth_provider({
            "provider": "GMAIL",
            "client_id": f"test-client-{uuid.uuid4()}",
            "client_secret": f"test-secret-{uuid.uuid4()}",
            "redirect_uri": "https://example.com/oauth/callback",
            "scope": "email profile",
            "configured_by": existing_user.id
        })
        
        # Step 3: Initiate OAuth flow
        oauth_request = auth_adapter.initiate_oauth_login({
            "provider": "GMAIL",
            "redirect_uri": "https://example.com/oauth/callback",
            "state": str(uuid.uuid4()),
            "link_to_email": "existing_user@example.com"  # This signals we want to link accounts
        })
        
        # Step 4: Process OAuth callback with matching email
        oauth_callback = auth_adapter.process_oauth_callback({
            "provider": "GMAIL",
            "code": f"test-auth-code-{uuid.uuid4()}",
            "state": oauth_request["state"],
            # Simulated data with the same email as the existing user
            "oauth_user_data": {
                "id": f"oauth-user-{uuid.uuid4()}",
                "email": "existing_user@example.com",  # Same email as existing user
                "name": "Existing User OAuth",
                "picture": "https://example.com/profile2.jpg"
            }
        })
        
        assert oauth_callback["success"] is True
        assert oauth_callback["user"]["id"] == existing_user.id  # Should be the same user ID
        assert "account_linked" in oauth_callback
        assert oauth_callback["account_linked"] is True
        
        # Step 5: Verify user has OAuth provider linked
        updated_user = auth_adapter.get_user_by_id(existing_user.id)
        assert hasattr(updated_user, "oauth_provider")
        assert updated_user.oauth_provider == "GMAIL"
        assert hasattr(updated_user, "oauth_id")
    
    def test_oauth_permission_revocation(self, entity_registry, auth_adapter, rbac_adapter):
        """
        Test OAuth permission revocation workflow.
        """
        # Step 1: Create a user with OAuth
        oauth_user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="oauth_revoke@example.com",
                name="OAuth Revoke Test User",
                role="USER",
                mfa_enabled=False,
                oauth_provider="OFFICE365",
                oauth_id=f"oauth-user-{uuid.uuid4()}"
            )
        )
        
        # Step 2: Add additional OAuth roles
        rbac_adapter.assign_role(
            user_id=oauth_user.id,
            role="DATA_ANALYST",
            assigned_by=oauth_user.id,
            source="OAUTH"
        )
        
        # Verify roles before revocation
        user_roles = rbac_adapter.get_user_roles(oauth_user.id)
        assert "USER" in user_roles
        assert "DATA_ANALYST" in user_roles
        
        # Step 3: Simulate OAuth token revocation or permission change
        revocation_result = auth_adapter.process_oauth_revocation({
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
        
        # Step 4: Verify OAuth-granted roles were revoked
        updated_roles = rbac_adapter.get_user_roles(oauth_user.id)
        assert "DATA_ANALYST" not in updated_roles  # This came from OAuth and should be removed
        assert "USER" in updated_roles  # This is the default role and should remain
        
        # Step 5: Verify user access is restricted
        permission_check = rbac_adapter.check_permission(
            user_id=oauth_user.id,
            resource="DATA_ANALYTICS",
            action="ANALYZE",
            session_token=None
        )
        
        assert permission_check["allowed"] is False