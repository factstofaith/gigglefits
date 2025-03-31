"""
Integration Tests for the OAuth implementation.

This test suite verifies the OAuth functionality for both Office 365 and Gmail
including authorization URL generation and token exchange.
"""

import pytest
import uuid
import json
import re
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session

from db.models import User, Invitation
from modules.users.service import InvitationService, UserService
from adapters.auth_module import Office365OAuth2Authentication, GmailOAuth2Authentication
from modules.users.models import InvitationCreate
from pydantic import BaseModel
from enum import Enum

# Define missing models required for tests
class UserCreate(BaseModel):
    """Mock model for creating a user"""
    email: str
    full_name: str
    password: str
    role: str = "USER"
    client_company: str = None

class OAuthProvider(str, Enum):
    """OAuth provider type"""
    OFFICE365 = "office365"
    GMAIL = "gmail"

class OAuthAuthorizationResponse(BaseModel):
    """Model for OAuth authorization response"""
    code: str
    state: str
    provider: str


class TestOAuthIntegration:
    """Test the OAuth integration for Office 365 and Gmail providers."""

    @pytest.fixture
    def test_invitation(self, test_db):
        """Create a test invitation."""
        # Create invitation for testing
        invitation = Invitation(
            id=str(uuid.uuid4()),
            email="oauth_test@example.com",
            role="USER",
            status="PENDING",
            token=str(uuid.uuid4()),
            created_at=datetime.now(),
            expiration_date=datetime.now() + timedelta(days=1),
            created_by=str(uuid.uuid4())
        )
        test_db.add(invitation)
        test_db.commit()
        test_db.refresh(invitation)
        return invitation

    @pytest.fixture
    def invitation_service(self, test_db):
        """Create an invitation service instance for testing."""
        return InvitationService(test_db)

    @pytest.fixture
    def user_service(self, test_db):
        """Create a user service instance for testing."""
        return UserService(test_db)

    # Removed auth_service fixture as AuthService doesn't exist in the current implementation
    # We'll need to refactor the tests that use it

    @patch('adapters.auth_module.Office365OAuth2Authentication')
    def test_office365_authorization_url_generation(self, mock_oauth, invitation_service, test_invitation):
        """Test generating an authorization URL for Office 365 OAuth."""
        # Arrange
        mock_instance = MagicMock()
        mock_oauth.return_value = mock_instance
        mock_instance.get_authorization_url.return_value = "https://login.microsoftonline.com/tenant/oauth2/v2.0/authorize?client_id=clientid&response_type=code&redirect_uri=https://example.com/callback&scope=https://graph.microsoft.com/.default&state=token123"
        
        # Act
        result = invitation_service.get_office365_auth_url(test_invitation.token)
        
        # Assert
        assert result is not None
        assert "auth_url" in result
        assert "login.microsoftonline.com" in result["auth_url"]
        assert mock_instance.get_authorization_url.called
        
        # Verify state parameter contains the invitation token
        state_param = re.search(r"&state=([^&]+)", result["auth_url"])
        assert state_param is not None
        assert test_invitation.token in state_param.group(1)

    @patch('adapters.auth_module.GmailOAuth2Authentication')
    def test_gmail_authorization_url_generation(self, mock_oauth, invitation_service, test_invitation):
        """Test generating an authorization URL for Gmail OAuth."""
        # Arrange
        mock_instance = MagicMock()
        mock_oauth.return_value = mock_instance
        mock_instance.get_authorization_url.return_value = "https://accounts.google.com/o/oauth2/v2/auth?client_id=clientid&response_type=code&redirect_uri=https://example.com/callback&scope=https://www.googleapis.com/auth/gmail.send&state=token123"
        
        # Act
        result = invitation_service.get_gmail_auth_url(test_invitation.token)
        
        # Assert
        assert result is not None
        assert "auth_url" in result
        assert "accounts.google.com" in result["auth_url"]
        assert mock_instance.get_authorization_url.called
        
        # Verify state parameter contains the invitation token
        state_param = re.search(r"&state=([^&]+)", result["auth_url"])
        assert state_param is not None
        assert test_invitation.token in state_param.group(1)

    @patch('adapters.auth_module.Office365OAuth2Authentication')
    def test_office365_oauth_callback(self, mock_oauth, invitation_service, test_invitation, test_db):
        """Test processing OAuth callback for Office 365."""
        # Arrange
        mock_instance = MagicMock()
        mock_oauth.return_value = mock_instance
        mock_instance.exchange_code_for_token.return_value = True
        mock_instance.token = {
            "access_token": "access_token_value",
            "refresh_token": "refresh_token_value",
            "id_token": "id_token_value",
            "received_at": datetime.now().timestamp(),
            "expires_in": 3600
        }
        
        # Create callback data
        callback_data = OAuthAuthorizationResponse(
            code="auth_code_123",
            state=f"{test_invitation.token}_random",
            provider="office365"
        )
        
        # Mock user data extraction from token
        with patch.object(invitation_service, '_extract_user_data_from_token', return_value={
            "full_name": "OAuth Test User",
            "email": test_invitation.email,
            "client_company": "Test Company"
        }):
            # Act
            result = invitation_service.complete_oauth_authentication(callback_data)
            
            # Assert
            assert result is not None
            assert result.user_id is not None
            assert result.access_token is not None
            assert result.token_type == "bearer"
            
            # Verify user was created
            user = test_db.query(User).filter(User.email == test_invitation.email).first()
            assert user is not None
            assert user.full_name == "OAuth Test User"
            assert user.client_company == "Test Company"
            
            # Verify invitation was updated
            test_db.refresh(test_invitation)
            assert test_invitation.status == "ACCEPTED"

    @patch('adapters.auth_module.GmailOAuth2Authentication')
    def test_gmail_oauth_callback(self, mock_oauth, invitation_service, test_invitation, test_db):
        """Test processing OAuth callback for Gmail."""
        # Arrange
        mock_instance = MagicMock()
        mock_oauth.return_value = mock_instance
        mock_instance.exchange_code_for_token.return_value = True
        mock_instance.token = {
            "access_token": "access_token_value",
            "refresh_token": "refresh_token_value",
            "id_token": "id_token_value",
            "received_at": datetime.now().timestamp(),
            "expires_in": 3600
        }
        
        # Create callback data
        callback_data = OAuthAuthorizationResponse(
            code="auth_code_456",
            state=f"{test_invitation.token}_random",
            provider="gmail"
        )
        
        # Mock user data extraction from token
        with patch.object(invitation_service, '_extract_user_data_from_token', return_value={
            "full_name": "Gmail OAuth User",
            "email": test_invitation.email,
            "client_company": "Google Inc"
        }):
            # Act
            result = invitation_service.complete_oauth_authentication(callback_data)
            
            # Assert
            assert result is not None
            assert result.user_id is not None
            assert result.access_token is not None
            assert result.token_type == "bearer"
            
            # Verify user was created
            user = test_db.query(User).filter(User.email == test_invitation.email).first()
            assert user is not None
            assert user.full_name == "Gmail OAuth User"
            assert user.client_company == "Google Inc"
            
            # Verify invitation was updated
            test_db.refresh(test_invitation)
            assert test_invitation.status == "ACCEPTED"

    def test_invalid_state_parameter(self, invitation_service):
        """Test handling invalid state parameter in OAuth callback."""
        # Arrange
        callback_data = OAuthAuthorizationResponse(
            code="auth_code_789",
            state="invalid_token_format",
            provider="office365"
        )
        
        # Act & Assert
        with pytest.raises(ValueError) as excinfo:
            invitation_service.complete_oauth_authentication(callback_data)
        
        assert "Invalid state parameter" in str(excinfo.value)

    def test_invalid_invitation_token(self, invitation_service):
        """Test handling invalid invitation token in OAuth callback."""
        # Arrange
        callback_data = OAuthAuthorizationResponse(
            code="auth_code_789",
            state=f"{uuid.uuid4()}_random",  # Non-existent token
            provider="gmail"
        )
        
        # Act & Assert
        with pytest.raises(ValueError) as excinfo:
            invitation_service.complete_oauth_authentication(callback_data)
        
        assert "Invalid invitation token" in str(excinfo.value)


class TestEndToEndOAuthWorkflow:
    """
    End-to-end test of the OAuth workflow, mimicking how the API would be used.
    
    This test simulates the complete flow from invitation to OAuth authentication.
    """
    
    @patch('adapters.auth_module.Office365OAuth2Authentication')
    def test_complete_oauth_workflow(self, mock_oauth, test_db):
        """Test the complete OAuth workflow from invitation to user creation."""
        # Setup services
        invitation_service = InvitationService(test_db)
        user_service = UserService(test_db)
        
        # Mock OAuth implementation
        mock_instance = MagicMock()
        mock_oauth.return_value = mock_instance
        mock_instance.get_authorization_url.return_value = "https://login.microsoftonline.com/tenant/oauth2/v2.0/authorize?client_id=clientid&response_type=code&redirect_uri=https://example.com/callback&scope=https://graph.microsoft.com/.default&state=token123"
        mock_instance.exchange_code_for_token.return_value = True
        mock_instance.token = {
            "access_token": "access_token_value",
            "refresh_token": "refresh_token_value",
            "id_token": "id_token_value",
            "received_at": datetime.now().timestamp(),
            "expires_in": 3600
        }
        
        # Step 1: Create an admin user
        admin = User(
            id=str(uuid.uuid4()),
            username="oauth_admin",
            email="oauth_admin@example.com",
            hashed_password="hashed_password",
            name="OAuth Admin",
            role="ADMIN",
            account_status="ACTIVE"
        )
        test_db.add(admin)
        test_db.commit()
        test_db.refresh(admin)
        
        # Step 2: Admin creates an invitation
        invitation_data = InvitationCreate(
            email="oauth_user@example.com",
            role="USER",
            expiration_hours=48,
            custom_message="Please sign in with your Office 365 account"
        )
        
        invitation = invitation_service.create_invitation(
            invitation_data=invitation_data,
            created_by=admin.id
        )
        
        # Step 3: User receives email and clicks OAuth login button
        # Simulate by getting OAuth URL
        auth_url_result = invitation_service.get_office365_auth_url(invitation.token)
        
        # Step 4: User is redirected to Microsoft login
        # Step 5: User authenticates and gives consent
        # Step 6: Microsoft redirects back to callback URL with auth code
        
        # Extract state from the auth URL for the callback
        state_param = re.search(r"&state=([^&]+)", auth_url_result["auth_url"])
        assert state_param is not None
        state = state_param.group(1)
        
        # Create callback data
        callback_data = OAuthAuthorizationResponse(
            code="auth_code_for_workflow",
            state=state,
            provider="office365"
        )
        
        # Mock user data extraction from token
        with patch.object(invitation_service, '_extract_user_data_from_token', return_value={
            "full_name": "OAuth Workflow User",
            "email": invitation.email,
            "client_company": "Test Corporation"
        }):
            # Step 7: System processes the callback and creates user
            result = invitation_service.complete_oauth_authentication(callback_data)
            
            # Step 8: Verify user was created
            user = test_db.query(User).filter(User.email == invitation.email).first()
            assert user is not None
            assert user.full_name == "OAuth Workflow User"
            assert user.client_company == "Test Corporation"
            
            # Step 9: Verify authentication token was returned
            assert result.access_token is not None
            assert result.token_type == "bearer"
            
            # Step 10: Verify invitation was marked as accepted
            test_db.refresh(invitation)
            assert invitation.status == "ACCEPTED"
            
            # Complete workflow succeeded
            print("End-to-end OAuth workflow test completed successfully")