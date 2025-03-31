"""Tests for the users controller endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import patch, MagicMock

from main import app
from db.models import User, UserRole, UserAccountStatus, AuthProvider
from modules.users.service import UserService, MFAService

client = TestClient(app)

@pytest.fixture
def mock_user():
    """Create a mock user for testing"""
    return User(
        id="test-user-id",
        username="test@example.com",
        email="test@example.com",
        name="Test User",
        role=UserRole.ADMIN,
        auth_provider=AuthProvider.LOCAL,
        is_active=True,
        account_status=UserAccountStatus.ACTIVE,
        hashed_password="hashed_password",  # Not a real hash
        bypass_mfa=True,
        tenant_id="test-tenant-id"
    )

@pytest.fixture
def mock_regular_user():
    """Create a mock regular user for testing"""
    return User(
        id="regular-user-id",
        username="regular@example.com",
        email="regular@example.com",
        name="Regular User",
        role=UserRole.USER,
        auth_provider=AuthProvider.LOCAL,
        is_active=True,
        account_status=UserAccountStatus.ACTIVE,
        hashed_password="hashed_password",  # Not a real hash
        bypass_mfa=False,
        tenant_id="test-tenant-id"
    )

@pytest.fixture
def mock_user_service():
    """Create a mock user service"""
    with patch("modules.users.controller.UserService") as MockUserService:
        service_instance = MockUserService.return_value
        yield service_instance

@pytest.fixture
def mock_mfa_service():
    """Create a mock MFA service"""
    with patch("modules.users.controller.MFAService") as MockMFAService:
        service_instance = MockMFAService.return_value
        # Configure the MFA status
        service_instance.get_mfa_status.return_value = {"enabled": True, "verified": True}
        yield service_instance


class TestUserManagementEndpoints:
    """Tests for user management endpoints."""

    def test_list_users(self, mock_user, mock_user_service):
        """Test listing users (admin only)"""
        # Mock the service to return test users
        mock_user_service.get_users.return_value = ([mock_user], 1)
        
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return admin user for authentication
            mock_auth.return_value = mock_user
            
            # Make the request
            response = client.get("/admin/users")
            
            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 1
            assert len(data["users"]) == 1
            assert data["users"][0]["id"] == "test-user-id"
            assert data["users"][0]["email"] == "test@example.com"
            
            # Verify service was called correctly
            mock_user_service.get_users.assert_called_once_with(
                skip=0, limit=100, status=None, role=None, search=None
            )
    
    def test_list_users_forbidden_for_regular_user(self, mock_regular_user, mock_user_service):
        """Test that regular users cannot list all users"""
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return regular user for authentication
            mock_auth.return_value = mock_regular_user
            
            # Make the request
            response = client.get("/admin/users")
            
            # Check the response - should be forbidden
            assert response.status_code == 403
            assert "Only administrators can list users" in response.json()["detail"]
            
            # Verify service was not called
            mock_user_service.get_users.assert_not_called()
    
    def test_get_user_detail_as_admin(self, mock_user, mock_user_service, mock_mfa_service):
        """Test getting user details as an admin"""
        # Mock the service to return a test user
        mock_user_service.get_user.return_value = mock_user
        
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return admin user for authentication
            mock_auth.return_value = mock_user
            
            # Make the request for a different user
            response = client.get("/admin/users/other-user-id")
            
            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "test-user-id"
            assert data["email"] == "test@example.com"
            
            # Verify service was called correctly
            mock_user_service.get_user.assert_called_once_with("other-user-id")
            mock_mfa_service.get_mfa_status.assert_called_once_with(mock_user)
    
    def test_get_user_detail_as_self(self, mock_regular_user, mock_user_service, mock_mfa_service):
        """Test getting own user details"""
        # Mock the service to return the regular user
        mock_user_service.get_user.return_value = mock_regular_user
        
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return regular user for authentication
            mock_auth.return_value = mock_regular_user
            
            # Make the request for own profile
            response = client.get(f"/admin/users/{mock_regular_user.id}")
            
            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "regular-user-id"
            assert data["email"] == "regular@example.com"
            
            # Verify service was called correctly
            mock_user_service.get_user.assert_called_once_with(mock_regular_user.id)
            mock_mfa_service.get_mfa_status.assert_called_once_with(mock_regular_user)
    
    def test_get_user_detail_forbidden(self, mock_regular_user, mock_user_service):
        """Test that regular users cannot view other users' details"""
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return regular user for authentication
            mock_auth.return_value = mock_regular_user
            
            # Make the request for a different user
            response = client.get("/admin/users/other-user-id")
            
            # Check the response - should be forbidden
            assert response.status_code == 403
            assert "You don't have permission to view this user" in response.json()["detail"]
            
            # Verify service was not called
            mock_user_service.get_user.assert_not_called()
    
    def test_get_own_profile(self, mock_regular_user, mock_mfa_service):
        """Test getting own profile"""
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return regular user for authentication
            mock_auth.return_value = mock_regular_user
            
            # Make the request
            response = client.get("/users/profile")
            
            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "regular-user-id"
            assert data["email"] == "regular@example.com"
            assert data["name"] == "Regular User"
            
            # Verify MFA service was called
            mock_mfa_service.get_mfa_status.assert_called_once_with(mock_regular_user)
    
    def test_update_own_profile(self, mock_regular_user, mock_user_service, mock_mfa_service):
        """Test updating own profile"""
        # Mock the service to return the updated user
        updated_user = mock_regular_user
        updated_user.name = "Updated Name"
        mock_user_service.update_user_profile.return_value = updated_user
        
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return regular user for authentication
            mock_auth.return_value = mock_regular_user
            
            # Make the request
            update_data = {"name": "Updated Name"}
            response = client.put("/users/profile", json=update_data)
            
            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "regular-user-id"
            assert data["name"] == "Updated Name"
            
            # Verify service was called correctly
            mock_user_service.update_user_profile.assert_called_once_with(
                user_id=mock_regular_user.id,
                update_data={"name": "Updated Name"},
                current_user=mock_regular_user
            )
            mock_mfa_service.get_mfa_status.assert_called_once_with(updated_user)
    
    def test_update_user_status_as_admin(self, mock_user, mock_user_service):
        """Test updating user status as admin"""
        # Mock the service to return the updated user
        updated_user = User(
            id="target-user-id",
            username="target@example.com",
            email="target@example.com",
            name="Target User",
            role=UserRole.USER,
            auth_provider=AuthProvider.LOCAL,
            is_active=True,
            account_status=UserAccountStatus.DISABLED,  # Updated status
            tenant_id="test-tenant-id"
        )
        mock_user_service.update_user_status.return_value = updated_user
        
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return admin user for authentication
            mock_auth.return_value = mock_user
            
            # Make the request
            status_data = {"status": "DISABLED"}
            response = client.patch("/admin/users/target-user-id/status", json=status_data)
            
            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "User status updated" in data["message"]
            
            # Verify service was called correctly
            mock_user_service.update_user_status.assert_called_once_with(
                "target-user-id", UserAccountStatus.DISABLED, mock_user
            )
    
    def test_update_user_status_forbidden_for_regular_user(self, mock_regular_user, mock_user_service):
        """Test that regular users cannot update user status"""
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return regular user for authentication
            mock_auth.return_value = mock_regular_user
            
            # Make the request
            status_data = {"status": "DISABLED"}
            response = client.patch("/admin/users/target-user-id/status", json=status_data)
            
            # Check the response - should be forbidden
            assert response.status_code == 403
            assert "Only administrators can update user status" in response.json()["detail"]
            
            # Verify service was not called
            mock_user_service.update_user_status.assert_not_called()
    
    def test_update_mfa_bypass_as_admin(self, mock_user, mock_user_service):
        """Test updating MFA bypass as admin"""
        # Mock the service to return the updated user
        updated_user = User(
            id="target-user-id",
            username="target@example.com",
            email="target@example.com",
            name="Target User",
            role=UserRole.USER,
            auth_provider=AuthProvider.LOCAL,
            is_active=True,
            account_status=UserAccountStatus.ACTIVE,
            bypass_mfa=True,  # Updated bypass flag
            tenant_id="test-tenant-id"
        )
        mock_user_service.update_mfa_bypass.return_value = updated_user
        
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return admin user for authentication
            mock_auth.return_value = mock_user
            
            # Make the request
            bypass_data = {"bypass_mfa": True}
            response = client.patch("/admin/users/target-user-id/mfa-bypass", json=bypass_data)
            
            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "MFA bypass enabled" in data["message"]
            assert data["bypass_mfa"] is True
            
            # Verify service was called correctly
            mock_user_service.update_mfa_bypass.assert_called_once_with(
                "target-user-id", True, mock_user
            )
    
    def test_update_mfa_bypass_forbidden_for_regular_user(self, mock_regular_user, mock_user_service):
        """Test that regular users cannot update MFA bypass"""
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return regular user for authentication
            mock_auth.return_value = mock_regular_user
            
            # Make the request
            bypass_data = {"bypass_mfa": True}
            response = client.patch("/admin/users/target-user-id/mfa-bypass", json=bypass_data)
            
            # Check the response - should be forbidden
            assert response.status_code == 403
            assert "Only administrators can update MFA bypass settings" in response.json()["detail"]
            
            # Verify service was not called
            mock_user_service.update_mfa_bypass.assert_not_called()
    
    def test_delete_user_as_admin(self, mock_user, mock_user_service):
        """Test deleting a user as admin"""
        # Mock the service to return success
        mock_user_service.delete_user.return_value = True
        
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return admin user for authentication
            mock_auth.return_value = mock_user
            
            # Make the request
            response = client.delete("/admin/users/target-user-id")
            
            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "User deleted successfully" in data["message"]
            
            # Verify service was called correctly
            mock_user_service.delete_user.assert_called_once_with("target-user-id", mock_user)
    
    def test_delete_user_forbidden_for_regular_user(self, mock_regular_user, mock_user_service):
        """Test that regular users cannot delete users"""
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return regular user for authentication
            mock_auth.return_value = mock_regular_user
            
            # Make the request
            response = client.delete("/admin/users/target-user-id")
            
            # Check the response - should be forbidden
            assert response.status_code == 403
            assert "Only administrators can delete users" in response.json()["detail"]
            
            # Verify service was not called
            mock_user_service.delete_user.assert_not_called()
    
    def test_get_login_history(self, mock_user, mock_user_service):
        """Test getting login history"""
        # Mock login history data
        history_items = [
            {
                "id": "history-1",
                "user_id": "test-user-id",
                "login_time": "2023-01-01T10:00:00Z",
                "ip_address": "192.168.1.1",
                "user_agent": "Mozilla/5.0",
                "login_status": "SUCCESS",
                "mfa_verified": True
            }
        ]
        mock_user_service.get_login_history.return_value = (history_items, 1)
        
        # Mock the authentication
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            # Return admin user for authentication
            mock_auth.return_value = mock_user
            
            # Make the request
            response = client.get("/users/test-user-id/login-history")
            
            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 1
            assert len(data["history"]) == 1
            assert data["history"][0]["id"] == "history-1"
            assert data["history"][0]["user_id"] == "test-user-id"
            
            # Verify service was called correctly
            mock_user_service.get_login_history.assert_called_once_with(
                user_id="test-user-id",
                skip=0,
                limit=100,
                current_user=mock_user
            )


class TestInvitationEndpoints:
    """Tests for invitation endpoints."""

    def test_create_invitation(self, mock_user):
        """Test creating a new invitation"""
        # Mock the invitation service
        with patch("modules.users.controller.InvitationService") as MockInvitationService:
            service_instance = MockInvitationService.return_value
            
            # Configure the mock to return invitation data
            invitation_data = {
                "id": "test-invitation-id",
                "email": "invite@example.com",
                "role": "USER",
                "status": "PENDING",
                "created_by": "test-user-id",
                "created_at": "2023-01-01T10:00:00Z",
                "expires_at": "2023-01-03T10:00:00Z",
                "token": "test-token"
            }
            service_instance.create_invitation.return_value = invitation_data
            
            # Mock the authentication
            with patch("modules.users.controller.get_current_active_user") as mock_auth:
                # Return admin user for authentication
                mock_auth.return_value = mock_user
                
                # Make the request
                invitation_request = {
                    "email": "invite@example.com",
                    "role": "USER",
                    "expiration_hours": 48,
                    "custom_message": "Please join our team"
                }
                response = client.post("/admin/invitations", json=invitation_request)
                
                # Check the response
                assert response.status_code == 201
                data = response.json()
                assert data["id"] == "test-invitation-id"
                assert data["email"] == "invite@example.com"
                assert data["status"] == "PENDING"
                
                # Verify service was called correctly
                service_instance.create_invitation.assert_called_once_with(
                    email="invite@example.com",
                    role="USER",
                    expiration_hours=48,
                    created_by=mock_user,
                    custom_message="Please join our team"
                )

    def test_list_invitations(self, mock_user):
        """Test listing invitations"""
        # Mock the invitation service
        with patch("modules.users.controller.InvitationService") as MockInvitationService:
            service_instance = MockInvitationService.return_value
            
            # Configure the mock to return invitation data
            invitations = [
                {
                    "id": "test-invitation-id",
                    "email": "invite@example.com",
                    "role": "USER",
                    "status": "PENDING",
                    "created_by": "test-user-id",
                    "created_at": "2023-01-01T10:00:00Z",
                    "expires_at": "2023-01-03T10:00:00Z",
                    "token": "test-token"
                }
            ]
            service_instance.get_invitations.return_value = (invitations, 1)
            
            # Mock the authentication
            with patch("modules.users.controller.get_current_active_user") as mock_auth:
                # Return admin user for authentication
                mock_auth.return_value = mock_user
                
                # Make the request
                response = client.get("/admin/invitations?status=PENDING")
                
                # Check the response
                assert response.status_code == 200
                data = response.json()
                assert data["total"] == 1
                assert len(data["invitations"]) == 1
                assert data["invitations"][0]["id"] == "test-invitation-id"
                assert data["invitations"][0]["email"] == "invite@example.com"
                
                # Verify service was called correctly
                service_instance.get_invitations.assert_called_once_with(
                    user=mock_user,
                    skip=0,
                    limit=100,
                    status="PENDING"
                )


class TestMFAEndpoints:
    """Tests for MFA endpoints."""

    def test_enroll_mfa(self, mock_regular_user):
        """Test MFA enrollment"""
        # Mock the MFA service
        with patch("modules.users.controller.MFAService") as MockMFAService:
            service_instance = MockMFAService.return_value
            
            # Configure the mock to return MFA enrollment data
            mfa_data = {
                "secret": "TESTSECRET",
                "qr_code": "data:image/png;base64,TEST",
                "manual_entry_key": "TESTSECRET"
            }
            service_instance.generate_mfa_secret.return_value = mfa_data
            
            # Mock the authentication
            with patch("modules.users.controller.get_current_active_user") as mock_auth:
                # Return regular user for authentication
                mock_auth.return_value = mock_regular_user
                
                # Make the request
                response = client.post("/users/mfa/enroll", json={})
                
                # Check the response
                assert response.status_code == 200
                data = response.json()
                assert data["secret"] == "TESTSECRET"
                assert data["qr_code"] == "data:image/png;base64,TEST"
                assert data["manual_entry_key"] == "TESTSECRET"
                
                # Verify service was called correctly
                service_instance.generate_mfa_secret.assert_called_once_with(mock_regular_user)

    def test_verify_mfa(self, mock_regular_user):
        """Test MFA verification"""
        # Mock the MFA service
        with patch("modules.users.controller.MFAService") as MockMFAService:
            service_instance = MockMFAService.return_value
            
            # Configure the service to return MFA status
            service_instance.get_mfa_status.return_value = {
                "enabled": True,
                "verified": True
            }
            
            # Mock the authentication
            with patch("modules.users.controller.get_current_active_user") as mock_auth:
                # Return regular user for authentication
                mock_auth.return_value = mock_regular_user
                
                # Make the request
                verification_data = {"code": "123456"}
                response = client.post("/users/mfa/verify", json=verification_data)
                
                # Check the response
                assert response.status_code == 200
                data = response.json()
                assert data["enabled"] is True
                assert data["verified"] is True
                
                # Verify service was called correctly
                service_instance.verify_mfa_code.assert_called_once_with(
                    mock_regular_user, "123456"
                )
                service_instance.get_mfa_status.assert_called_once_with(mock_regular_user)

    def test_get_mfa_status(self, mock_regular_user):
        """Test getting MFA status"""
        # Mock the MFA service
        with patch("modules.users.controller.MFAService") as MockMFAService:
            service_instance = MockMFAService.return_value
            
            # Configure the service to return MFA status
            service_instance.get_mfa_status.return_value = {
                "enabled": True,
                "verified": True
            }
            
            # Mock the authentication
            with patch("modules.users.controller.get_current_active_user") as mock_auth:
                # Return regular user for authentication
                mock_auth.return_value = mock_regular_user
                
                # Make the request
                response = client.get("/users/mfa/status")
                
                # Check the response
                assert response.status_code == 200
                data = response.json()
                assert data["enabled"] is True
                assert data["verified"] is True
                
                # Verify service was called correctly
                service_instance.get_mfa_status.assert_called_once_with(mock_regular_user)

    def test_get_recovery_codes(self, mock_regular_user):
        """Test getting MFA recovery codes"""
        # Mock the MFA service
        with patch("modules.users.controller.MFAService") as MockMFAService:
            service_instance = MockMFAService.return_value
            
            # Configure the service to return recovery codes
            service_instance.get_recovery_codes.return_value = ["CODE1", "CODE2", "CODE3"]
            
            # Mock the authentication
            with patch("modules.users.controller.get_current_active_user") as mock_auth:
                # Return regular user for authentication
                mock_auth.return_value = mock_regular_user
                
                # Make the request
                response = client.get("/users/mfa/recovery-codes")
                
                # Check the response
                assert response.status_code == 200
                data = response.json()
                assert len(data["codes"]) == 3
                assert "CODE1" in data["codes"]
                assert "CODE2" in data["codes"]
                assert "CODE3" in data["codes"]
                
                # Verify service was called correctly
                service_instance.get_recovery_codes.assert_called_once_with(mock_regular_user)

    def test_regenerate_recovery_codes(self, mock_regular_user):
        """Test regenerating MFA recovery codes"""
        # Mock the MFA service
        with patch("modules.users.controller.MFAService") as MockMFAService:
            service_instance = MockMFAService.return_value
            
            # Configure the service to return new recovery codes
            service_instance.regenerate_recovery_codes.return_value = ["NEW1", "NEW2", "NEW3"]
            
            # Mock the authentication
            with patch("modules.users.controller.get_current_active_user") as mock_auth:
                # Return regular user for authentication
                mock_auth.return_value = mock_regular_user
                
                # Make the request
                response = client.post("/users/mfa/recovery-codes/regenerate")
                
                # Check the response
                assert response.status_code == 200
                data = response.json()
                assert len(data["codes"]) == 3
                assert "NEW1" in data["codes"]
                assert "NEW2" in data["codes"]
                assert "NEW3" in data["codes"]
                
                # Verify service was called correctly
                service_instance.regenerate_recovery_codes.assert_called_once_with(mock_regular_user)

    def test_disable_mfa(self, mock_regular_user):
        """Test disabling MFA"""
        # Mock the MFA service
        with patch("modules.users.controller.MFAService") as MockMFAService:
            service_instance = MockMFAService.return_value
            
            # Mock the authentication
            with patch("modules.users.controller.get_current_active_user") as mock_auth:
                # Return regular user for authentication
                mock_auth.return_value = mock_regular_user
                
                # Make the request
                response = client.post("/users/mfa/disable")
                
                # Check the response
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True
                assert "MFA disabled successfully" in data["message"]
                
                # Verify service was called correctly
                service_instance.disable_mfa.assert_called_once_with(mock_regular_user)

    def test_reset_user_mfa_as_admin(self, mock_user):
        """Test resetting another user's MFA as admin"""
        # Mock the MFA service
        with patch("modules.users.controller.MFAService") as MockMFAService:
            service_instance = MockMFAService.return_value
            
            # Mock the authentication
            with patch("modules.users.controller.get_current_active_user") as mock_auth:
                # Return admin user for authentication
                mock_auth.return_value = mock_user
                
                # Make the request
                response = client.post("/admin/users/target-user-id/mfa/reset")
                
                # Check the response
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True
                assert "MFA reset successfully" in data["message"]
                
                # Verify service was called correctly
                service_instance.reset_mfa.assert_called_once_with("target-user-id", mock_user)

    def test_reset_user_mfa_forbidden_for_regular_user(self, mock_regular_user):
        """Test that regular users cannot reset another user's MFA"""
        # Mock the MFA service
        with patch("modules.users.controller.MFAService") as MockMFAService:
            service_instance = MockMFAService.return_value
            
            # Mock the authentication
            with patch("modules.users.controller.get_current_active_user") as mock_auth:
                # Return regular user for authentication
                mock_auth.return_value = mock_regular_user
                
                # Make the request
                response = client.post("/admin/users/target-user-id/mfa/reset")
                
                # Check the response - should be forbidden
                assert response.status_code == 403
                assert "Only administrators can reset user MFA" in response.json()["detail"]
                
                # Verify service was not called
                service_instance.reset_mfa.assert_not_called()