"""
Tests for the entity registry.

This module provides tests for the entity registry and cross-adapter synchronization.
"""

import pytest
import uuid
from datetime import datetime, timezone

from test_adapters.entity_registry import EntityRegistry, BaseTestAdapter, EntityAction, global_registry
from test_adapters.auth.auth_adapter import AuthAdapter, User
from test_adapters.auth.mfa_adapter import MFAAdapter, MFAConfig
from test_adapters.auth.invitation_adapter import InvitationAdapter, Invitation, InvitationStatus

class TestEntityRegistry:
    """Test the entity registry functionality."""
    
    def setup_method(self):
        """Set up test environment before each test."""
        self.registry = EntityRegistry(debug=True)
    
    def test_register_entity(self):
        """Test registering an entity."""
        # Create test entity
        user = {"id": "user1", "name": "Test User"}
        
        # Register entity
        self.registry.register_entity("User", "user1", user)
        
        # Verify entity is registered
        assert self.registry.get_entity("User", "user1") == user
    
    def test_update_entity(self):
        """Test updating an entity."""
        # Create and register test entity
        user = {"id": "user1", "name": "Test User"}
        self.registry.register_entity("User", "user1", user)
        
        # Update entity
        updated_user = {"id": "user1", "name": "Updated User"}
        self.registry.update_entity("User", "user1", updated_user)
        
        # Verify entity is updated
        assert self.registry.get_entity("User", "user1") == updated_user
    
    def test_delete_entity(self):
        """Test deleting an entity."""
        # Create and register test entity
        user = {"id": "user1", "name": "Test User"}
        self.registry.register_entity("User", "user1", user)
        
        # Delete entity
        self.registry.delete_entity("User", "user1")
        
        # Verify entity is deleted
        assert self.registry.get_entity("User", "user1") is None
    
    def test_get_entity_by_attribute(self):
        """Test finding an entity by attribute."""
        # Create and register test entities
        user1 = {"id": "user1", "name": "Test User", "email": "test@example.com"}
        user2 = {"id": "user2", "name": "Another User", "email": "another@example.com"}
        
        self.registry.register_entity("User", "user1", user1)
        self.registry.register_entity("User", "user2", user2)
        
        # Find entity by attribute
        result = self.registry.get_entity_by_attribute("User", "email", "another@example.com")
        
        # Verify found entity
        assert result == user2
    
    def test_entity_listener(self):
        """Test entity change notifications."""
        # Set up listener
        notifications = []
        
        def listener(entity_type, entity_id, entity, action):
            notifications.append({
                "entity_type": entity_type,
                "entity_id": entity_id,
                "action": action
            })
        
        # Register listener
        self.registry.register_listener("User", listener)
        
        # Create, update, and delete entity
        user = {"id": "user1", "name": "Test User"}
        self.registry.register_entity("User", "user1", user)
        
        updated_user = {"id": "user1", "name": "Updated User"}
        self.registry.update_entity("User", "user1", updated_user)
        
        self.registry.delete_entity("User", "user1")
        
        # Verify notifications
        assert len(notifications) == 3
        assert notifications[0]["action"] == EntityAction.CREATE
        assert notifications[1]["action"] == EntityAction.UPDATE
        assert notifications[2]["action"] == EntityAction.DELETE


class TestCrossAdapterSync:
    """Test cross-adapter synchronization."""
    
    def setup_method(self):
        """Set up test environment before each test."""
        self.registry = EntityRegistry(debug=True)
        self.auth_adapter = AuthAdapter(self.registry)
        self.mfa_adapter = MFAAdapter(self.registry)
        self.invitation_adapter = InvitationAdapter(self.registry)
    
    def teardown_method(self):
        """Clean up after each test."""
        self.registry.reset()
        self.auth_adapter.reset()
        self.mfa_adapter.reset()
        self.invitation_adapter.reset()
        
    def test_invitation_workflow(self):
        """Test cross-adapter synchronization during invitation workflow."""
        # Create an invitation
        invitation_data = {
            "email": "invite@example.com",
            "role": "USER",
            "expiration_hours": 48
        }
        created_by = "admin-id"
        
        invitation = self.invitation_adapter.create_invitation(invitation_data, created_by)
        
        # Verify invitation is in registry
        registry_invitation = self.registry.get_entity("Invitation", invitation.id)
        assert registry_invitation is not None
        assert registry_invitation.email == "invite@example.com"
        
        # Accept invitation
        user_data = {
            "name": "Invited User",
            "password": "password123",
            "client_company": "Test Company"
        }
        
        user = self.invitation_adapter.accept_invitation(invitation.token, user_data)
        
        # Verify user is created in registry and available to auth adapter
        registry_user = self.registry.get_entity("User", user.id)
        assert registry_user is not None
        
        # Auth adapter should now know about this user
        auth_user = self.auth_adapter.get_user_by_id(user.id)
        assert auth_user is not None
        assert auth_user.email == "invite@example.com"
        
        # Verify invitation status is updated
        updated_invitation = self.invitation_adapter.get_invitation_by_id(invitation.id)
        assert updated_invitation.status == InvitationStatus.ACCEPTED.value
        assert updated_invitation.accepted_by == user.id
    
    def test_user_creation_sync(self):
        """Test that a user created in the auth adapter is available to the MFA adapter."""
        # Create user in auth adapter
        user_id = str(uuid.uuid4())
        user = User(id=user_id, email="test@example.com", name="Test User", role="USER")
        self.auth_adapter.add_user(user)
        
        # Verify user is in registry
        registry_user = self.registry.get_entity("User", user_id)
        assert registry_user is not None
        assert registry_user.email == "test@example.com"
    
    def test_mfa_setup_updates_user(self):
        """Test that MFA setup in the MFA adapter updates the user in the auth adapter."""
        # Create user in auth adapter
        user_id = str(uuid.uuid4())
        user = User(id=user_id, email="test@example.com", name="Test User", role="USER")
        self.auth_adapter.add_user(user)
        
        # Verify user doesn't have MFA enabled
        assert not user.mfa_enabled
        
        # Enable MFA in MFA adapter
        self.mfa_adapter.enable_mfa(user_id, "TEST_SECRET")
        
        # Verify MFA config is in registry
        mfa_config = self.registry.get_entity("MFA", user_id)
        assert mfa_config is not None
        assert mfa_config.verified
        
        # Verify user now has MFA enabled in auth adapter
        updated_user = self.auth_adapter.get_user_by_id(user_id)
        assert updated_user.mfa_enabled
    
    def test_user_deletion_removes_mfa(self):
        """Test that deleting a user in auth adapter removes MFA data."""
        # Create user in auth adapter
        user_id = str(uuid.uuid4())
        user = User(id=user_id, email="test@example.com", name="Test User", role="USER")
        self.auth_adapter.add_user(user)
        
        # Enable MFA in MFA adapter
        self.mfa_adapter.enable_mfa(user_id, "TEST_SECRET")
        
        # Verify MFA is set up
        mfa_status = self.mfa_adapter.get_mfa_status(user_id)
        assert mfa_status["enabled"]
        
        # Delete user from auth adapter
        self.auth_adapter.delete_user(user_id)
        
        # Verify MFA data is gone
        assert self.registry.get_entity("MFA", user_id) is None
        mfa_status = self.mfa_adapter.get_mfa_status(user_id)
        assert not mfa_status["enabled"]
    
    def test_multi_adapter_workflow(self):
        """Test a complete workflow across multiple adapters."""
        # 1. Create user in auth adapter
        user_id = str(uuid.uuid4())
        user = User(id=user_id, email="workflow@example.com", name="Workflow User", role="USER")
        self.auth_adapter.add_user(user)
        
        # 2. Log in and check MFA status (should not require MFA)
        login_result = self.auth_adapter.login("workflow@example.com", "password")
        assert "requires_mfa" not in login_result
        
        # 3. Initiate MFA enrollment
        enrollment = self.mfa_adapter.initiate_enrollment(user_id)
        assert "secret" in enrollment
        
        # 4. Verify MFA code
        verification = self.mfa_adapter.verify_code(user_id, "654321")
        assert verification["success"]
        
        # 5. Log in again (should now require MFA)
        login_result = self.auth_adapter.login("workflow@example.com", "password")
        assert login_result.get("requires_mfa")
        
        # 6. Complete MFA login
        mfa_data = {"user_id": user_id}
        complete_login = self.auth_adapter.complete_mfa_login(mfa_data)
        assert "access_token" in complete_login
        
        # 7. Disable MFA
        disable_result = self.mfa_adapter.disable_mfa(user_id)
        assert disable_result["success"]
        
        # 8. Log in again (should no longer require MFA)
        login_result = self.auth_adapter.login("workflow@example.com", "password")
        assert "requires_mfa" not in login_result


if __name__ == "__main__":
    pytest.main(["-v", "test_entity_registry.py"])