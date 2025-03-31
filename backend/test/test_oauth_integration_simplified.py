"""
Simplified test suite for the OAuth implementation.

This test suite verifies the OAuth functionality for both Office 365 and Gmail
including authorization URL generation and token exchange.

Author: Claude (with human oversight)
Date: March 27, 2025
"""

import pytest
import uuid
import re
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

# Fix import paths for test adapters
import sys
import os
# Add the backend directory to the path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
from test_adapters.auth.invitation_adapter import InvitationAdapter
from test_adapters.auth.auth_adapter import AuthAdapter, OAuthProviderEnum
from test_adapters.mock_models import MockUser, MockInvitation

# Test adapters setup
invitation_adapter = InvitationAdapter()
auth_adapter = AuthAdapter()

@pytest.fixture(autouse=True)
def reset_adapters():
    """Reset adapters between tests."""
    # Setup 
    invitation_adapter.reset()
    auth_adapter.reset()
    # Register admin user again after reset
    auth_adapter.add_user(test_admin)
    yield
    # Teardown - nothing needed as we reset before each test

# Test data
test_admin = MockUser(
    id="admin-123",
    email="oauth_admin@example.com",
    name="OAuth Admin",
    role="ADMIN",
    client_company="Test Company",
    hashed_password="hashed_password",
)

# Register admin user
auth_adapter.add_user(test_admin)


@pytest.fixture
def test_invitation():
    """Create a test invitation."""
    invitation = MockInvitation(
        id=str(uuid.uuid4()),
        email="oauth_test@example.com",
        role="USER",
        status="PENDING",
        token=str(uuid.uuid4()),
        created_at=datetime.now(),
        expires_at=datetime.now() + timedelta(days=1),
        created_by=test_admin.id
    )
    invitation_adapter.add_invitation(invitation)
    return invitation


# Test Office 365 OAuth
def test_office365_authorization_url_generation(test_invitation):
    """Test generating an authorization URL for Office 365 OAuth."""
    # Generate auth URL
    result = invitation_adapter.get_oauth_auth_url(
        invitation_token=test_invitation.token,
        provider=OAuthProviderEnum.OFFICE365
    )
    
    assert result is not None
    assert "auth_url" in result
    assert "login.microsoftonline.com" in result["auth_url"]
    
    # Verify state parameter contains the invitation token
    state_param = re.search(r"&state=([^&]+)", result["auth_url"])
    assert state_param is not None
    assert test_invitation.token in state_param.group(1)


def test_gmail_authorization_url_generation(test_invitation):
    """Test generating an authorization URL for Gmail OAuth."""
    # Generate auth URL
    result = invitation_adapter.get_oauth_auth_url(
        invitation_token=test_invitation.token,
        provider=OAuthProviderEnum.GMAIL
    )
    
    assert result is not None
    assert "auth_url" in result
    assert "accounts.google.com" in result["auth_url"]
    
    # Verify state parameter contains the invitation token
    state_param = re.search(r"&state=([^&]+)", result["auth_url"])
    assert state_param is not None
    assert test_invitation.token in state_param.group(1)


def test_office365_oauth_callback(test_invitation):
    """Test processing OAuth callback for Office 365."""
    # Create callback data
    state = f"{test_invitation.token}_random"
    
    # Process callback
    user_info = {
        "name": "OAuth Test User",
        "email": test_invitation.email,
        "client_company": "Test Company"
    }
    
    # Simulate callback processing
    result = invitation_adapter.process_oauth_callback(
        code="auth_code_123",
        state=state,
        provider=OAuthProviderEnum.OFFICE365,
        user_info=user_info
    )
    
    # Check results
    assert result is not None
    assert "user_id" in result
    assert "access_token" in result
    assert result["token_type"] == "bearer"
    
    # Verify user was created
    # Manual sync for this test
    for user_id, user in invitation_adapter.users.items():
        if user.email == test_invitation.email:
            auth_adapter.add_user(user)
            break
    
    user = auth_adapter.get_user_by_email(test_invitation.email)
    assert user is not None
    assert user.name == "OAuth Test User"
    assert user.client_company == "Test Company"
    
    # Verify invitation was updated
    updated_invitation = invitation_adapter.get_invitation_by_token(test_invitation.token)
    assert updated_invitation.status == "ACCEPTED"


def test_gmail_oauth_callback(test_invitation):
    """Test processing OAuth callback for Gmail."""
    # Create callback data
    state = f"{test_invitation.token}_random"
    
    # Process callback
    user_info = {
        "name": "Gmail OAuth User",
        "email": test_invitation.email,
        "client_company": "Google Inc"
    }
    
    # Simulate callback processing
    result = invitation_adapter.process_oauth_callback(
        code="auth_code_456",
        state=state,
        provider=OAuthProviderEnum.GMAIL,
        user_info=user_info
    )
    
    # Check results
    assert result is not None
    assert "user_id" in result
    assert "access_token" in result
    assert result["token_type"] == "bearer"
    
    # Verify user was created
    # Manual sync for this test
    for user_id, user in invitation_adapter.users.items():
        if user.email == test_invitation.email:
            auth_adapter.add_user(user)
            break
            
    user = auth_adapter.get_user_by_email(test_invitation.email)
    assert user is not None
    assert user.name == "Gmail OAuth User"
    assert user.client_company == "Google Inc"
    
    # Verify invitation was updated
    updated_invitation = invitation_adapter.get_invitation_by_token(test_invitation.token)
    assert updated_invitation.status == "ACCEPTED"


def test_invalid_state_parameter():
    """Test handling invalid state parameter in OAuth callback."""
    with pytest.raises(ValueError) as excinfo:
        invitation_adapter.process_oauth_callback(
            code="auth_code_789",
            state="invalid_token_format",
            provider=OAuthProviderEnum.OFFICE365,
            user_info={}
        )
    
    assert "Invalid state parameter" in str(excinfo.value)


def test_invalid_invitation_token():
    """Test handling invalid invitation token in OAuth callback."""
    with pytest.raises(ValueError) as excinfo:
        invitation_adapter.process_oauth_callback(
            code="auth_code_789",
            state=f"{uuid.uuid4()}_random",  # Non-existent token
            provider=OAuthProviderEnum.GMAIL,
            user_info={}
        )
    
    assert "Invalid invitation token" in str(excinfo.value)


def test_complete_oauth_workflow():
    """Test the complete OAuth workflow from invitation to user creation."""
    # Step 1: Admin creates an invitation
    invitation_data = {
        "email": "oauth_flow@example.com",
        "role": "USER",
        "expiration_hours": 48,
        "custom_message": "Please sign in with your Office 365 account"
    }
    
    invitation = invitation_adapter.create_invitation(
        invitation_data=invitation_data,
        created_by=test_admin.id
    )
    
    # Step 2: User receives email and clicks OAuth login button
    # Simulate by getting OAuth URL
    auth_url_result = invitation_adapter.get_oauth_auth_url(
        invitation_token=invitation.token,
        provider=OAuthProviderEnum.OFFICE365
    )
    
    # Extract state from the auth URL for the callback
    state_param = re.search(r"&state=([^&]+)", auth_url_result["auth_url"])
    assert state_param is not None
    state = state_param.group(1)
    
    # Step 3-6: User goes through Microsoft login screen and is redirected back
    
    # Step 7: System processes the callback and creates user
    user_info = {
        "name": "OAuth Workflow User",
        "email": invitation.email,
        "client_company": "Test Corporation"
    }
    
    result = invitation_adapter.process_oauth_callback(
        code="auth_code_for_workflow",
        state=state,
        provider=OAuthProviderEnum.OFFICE365,
        user_info=user_info
    )
    
    # Step 8: Verify user was created
    # Manual sync for this test
    for user_id, user in invitation_adapter.users.items():
        if user.email == invitation.email:
            auth_adapter.add_user(user)
            break
            
    user = auth_adapter.get_user_by_email(invitation.email)
    assert user is not None
    assert user.name == "OAuth Workflow User"
    assert user.client_company == "Test Corporation"
    
    # Step 9: Verify authentication token was returned
    assert result["access_token"] is not None
    assert result["token_type"] == "bearer"
    
    # Step 10: Verify invitation was marked as accepted
    updated_invitation = invitation_adapter.get_invitation_by_token(invitation.token)
    assert updated_invitation.status == "ACCEPTED"