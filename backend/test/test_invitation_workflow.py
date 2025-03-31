"""
Test suite for the invitation workflow from creation to acceptance.

This test suite covers:
1. Creating invitations
2. Verifying invitations
3. Accepting invitations via email registration
4. Accepting invitations via OAuth

Author: Claude (with human oversight)
Date: March 27, 2025
"""

import pytest
from datetime import datetime, timedelta, timezone
import json
import uuid
from fastapi.testclient import TestClient
from test.test_adapters.auth import TimezoneTestUtilities

from main import app
from db.models import User, Invitation
from db.base import get_db, Base, engine
from sqlalchemy.orm import Session, sessionmaker

# Test client
client = TestClient(app)

# Setup and teardown fixtures
@pytest.fixture(scope="module")
def test_db():
    """Create test database and provide session"""
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    
    # Create tables from scratch
    Base.metadata.create_all(bind=engine)
    
    # Create test session
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    # Setup: Create admin user for testing with timezone-aware datetime
    admin_user = User(
        email="admin@test.com",
        password_hash="$2b$12$1234567890123456789012.1234567890123456789012345678901234",  # hashed 'admin123'
        full_name="Admin Test",
        role="ADMIN",
        client_company="Test Company",
        created_at=TimezoneTestUtilities.utc_now()  # Use timezone-aware datetime
    )
    db.add(admin_user)
    db.commit()
    
    # Return DB session
    yield db
    
    # Teardown
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def admin_token():
    """Get admin authentication token"""
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "admin123"}
    )
    return response.json()["token"]


@pytest.fixture(scope="function")
def active_invitation(test_db):
    """Create an active invitation for testing with timezone-aware datetimes"""
    # Use the timezone utilities to create timezone-aware datetimes
    now = TimezoneTestUtilities.utc_now()
    expires_at = TimezoneTestUtilities.create_future_datetime(days=7)
    
    invitation = Invitation(
        email="newuser@test.com",
        token=str(uuid.uuid4()),
        role="USER",
        inviter_id=1,  # Admin user created in the test_db fixture
        created_at=now,  # Add created_at with timezone info
        expires_at=expires_at,  # Use timezone-aware future datetime
        client_company="Test Client"
    )
    test_db.add(invitation)
    test_db.commit()
    test_db.refresh(invitation)
    return invitation


@pytest.fixture(scope="function")
def expired_invitation(test_db):
    """Create an expired invitation for testing with timezone-aware datetimes"""
    # Use the timezone utilities to create timezone-aware datetimes
    now = TimezoneTestUtilities.utc_now()
    expires_at = TimezoneTestUtilities.create_past_datetime(days=1)  # Expired 1 day ago
    
    invitation = Invitation(
        email="expired@test.com",
        token=str(uuid.uuid4()),
        role="USER",
        inviter_id=1,  # Admin user created in the test_db fixture
        created_at=TimezoneTestUtilities.create_past_datetime(days=7),  # Created 7 days ago
        expires_at=expires_at,  # Use timezone-aware past datetime
        client_company="Test Client"
    )
    test_db.add(invitation)
    test_db.commit()
    test_db.refresh(invitation)
    
    # Verify the invitation is actually expired using our utility
    assert TimezoneTestUtilities.is_expired(invitation.expires_at), "Invitation should be expired"
    
    return invitation


# Test cases for invitation creation
def test_create_invitation(admin_token):
    """Test creating a new invitation as an admin"""
    response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "invite@test.com",
            "role": "USER",
            "client_company": "Test Client"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "invite@test.com"
    assert data["role"] == "USER"
    assert data["client_company"] == "Test Client"
    assert "token" in data
    assert "expires_at" in data


def test_get_invitations(admin_token):
    """Test retrieving all invitations as an admin"""
    response = client.get(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should have at least the invitation created in the previous test
    assert len(data) >= 1


def test_cancel_invitation(admin_token, active_invitation):
    """Test canceling an invitation as an admin"""
    response = client.delete(
        f"/api/admin/invitations/{active_invitation.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Invitation canceled successfully"


# Test cases for invitation verification
def test_verify_valid_invitation(active_invitation):
    """Test verifying a valid invitation token"""
    response = client.get(
        f"/api/invitations/verify/{active_invitation.token}"
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == active_invitation.email
    assert data["role"] == active_invitation.role
    assert data["client_company"] == active_invitation.client_company


def test_verify_expired_invitation(expired_invitation):
    """Test verifying an expired invitation token"""
    response = client.get(
        f"/api/invitations/verify/{expired_invitation.token}"
    )
    
    assert response.status_code == 410
    data = response.json()
    assert "error" in data
    assert "expired" in data["error"].lower()


def test_verify_invalid_invitation():
    """Test verifying an invalid invitation token"""
    response = client.get(
        f"/api/invitations/verify/invalid_token_12345"
    )
    
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert "not found" in data["error"].lower()


# Test cases for accepting invitations via email
def test_accept_invitation_email(active_invitation):
    """Test accepting invitation via email registration"""
    response = client.post(
        "/api/invitations/accept",
        json={
            "token": active_invitation.token,
            "fullName": "New Test User",
            "password": "Password123!",
            "clientCompany": "Test Client Company",
            "position": "Developer",
            "department": "Engineering"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == active_invitation.email
    assert data["user"]["full_name"] == "New Test User"
    assert data["user"]["role"] == active_invitation.role
    assert data["user"]["client_company"] == "Test Client Company"


def test_accept_invitation_duplicate(active_invitation):
    """Test attempting to accept an invitation twice"""
    # First accept normally
    client.post(
        "/api/invitations/accept",
        json={
            "token": active_invitation.token,
            "fullName": "New Test User",
            "password": "Password123!",
            "clientCompany": "Test Client Company",
        }
    )
    
    # Then try accepting again with same token
    response = client.post(
        "/api/invitations/accept",
        json={
            "token": active_invitation.token,
            "fullName": "Duplicate User",
            "password": "Password123!",
            "clientCompany": "Another Company",
        }
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "already accepted" in data["error"].lower()


# Test cases for OAuth URLs
def test_get_office365_auth_url(active_invitation):
    """Test getting Office 365 OAuth URL"""
    response = client.get(
        "/api/invitations/oauth/office365/url",
        params={"token": active_invitation.token}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "authUrl" in data
    assert "https://login.microsoftonline.com" in data["authUrl"]
    assert "client_id" in data["authUrl"]
    assert "redirect_uri" in data["authUrl"]
    assert "state" in data["authUrl"]
    assert active_invitation.token in data["authUrl"]


def test_get_gmail_auth_url(active_invitation):
    """Test getting Gmail OAuth URL"""
    response = client.get(
        "/api/invitations/oauth/gmail/url",
        params={"token": active_invitation.token}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "authUrl" in data
    assert "https://accounts.google.com/o/oauth2/auth" in data["authUrl"]
    assert "client_id" in data["authUrl"]
    assert "redirect_uri" in data["authUrl"]
    assert "state" in data["authUrl"]
    assert active_invitation.token in data["authUrl"]


# Test OAuth callback (this requires mocking OAuth providers)
# This test would typically use a mock for external OAuth providers
def test_oauth_callback_office365(active_invitation, monkeypatch):
    """Test Office 365 OAuth callback with mocked responses"""
    # Mock the OAuth token exchange and user info retrieval with timezone-aware values
    def mock_exchange_code(*args, **kwargs):
        # Use timezone utilities to create proper expiration timestamp
        now = TimezoneTestUtilities.utc_now()
        expires_at = TimezoneTestUtilities.create_future_datetime(hours=1)  # Token expires in 1 hour
        
        return {
            "access_token": "test_access_token",
            "token_type": "Bearer",
            "expires_in": 3600,
            "expires_at": TimezoneTestUtilities.format_datetime(expires_at)  # Add timezone-aware expiration
        }
    
    def mock_get_user_info(*args, **kwargs):
        return {
            "id": "o365_user_id",
            "displayName": "Office Test User",
            "userPrincipalName": active_invitation.email,
            "mail": active_invitation.email
        }
    
    # Apply mocks to the OAuth provider methods
    from adapters.auth_module import Office365OAuth
    monkeypatch.setattr(Office365OAuth, "exchange_code_for_token", mock_exchange_code)
    monkeypatch.setattr(Office365OAuth, "get_user_info", mock_get_user_info)
    
    # Construct state parameter with invitation token
    state = f"{active_invitation.token}_randomstring"
    
    # Test the callback endpoint
    response = client.post(
        "/api/invitations/oauth/office365/callback",
        json={
            "code": "test_auth_code",
            "token": active_invitation.token,
            "state": state
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["email"] == active_invitation.email
    assert data["user"]["full_name"] == "Office Test User"
    assert data["requiresMFA"] is True


def test_oauth_callback_gmail(active_invitation, monkeypatch):
    """Test Gmail OAuth callback with mocked responses"""
    # Mock the OAuth token exchange and user info retrieval with timezone-aware values
    def mock_exchange_code(*args, **kwargs):
        # Use timezone utilities to create proper expiration timestamp
        now = TimezoneTestUtilities.utc_now()
        expires_at = TimezoneTestUtilities.create_future_datetime(hours=1)  # Token expires in 1 hour
        
        return {
            "access_token": "test_access_token",
            "token_type": "Bearer",
            "expires_in": 3600,
            "expires_at": TimezoneTestUtilities.format_datetime(expires_at),  # Add timezone-aware expiration
            "issued_at": TimezoneTestUtilities.format_datetime(now)  # Add issued timestamp
        }
    
    def mock_get_user_info(*args, **kwargs):
        return {
            "id": "gmail_user_id",
            "name": "Gmail Test User",
            "email": active_invitation.email,
            "verified_email": True
        }
    
    # Apply mocks to the OAuth provider methods
    from adapters.auth_module import GmailOAuth
    monkeypatch.setattr(GmailOAuth, "exchange_code_for_token", mock_exchange_code)
    monkeypatch.setattr(GmailOAuth, "get_user_info", mock_get_user_info)
    
    # Construct state parameter with invitation token
    state = f"{active_invitation.token}_randomstring"
    
    # Test the callback endpoint
    response = client.post(
        "/api/invitations/oauth/gmail/callback",
        json={
            "code": "test_auth_code",
            "token": active_invitation.token,
            "state": state
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["email"] == active_invitation.email
    assert data["user"]["full_name"] == "Gmail Test User"
    assert data["requiresMFA"] is True


# Test error cases for invitation workflow
def test_invalid_oauth_state():
    """Test OAuth callback with invalid state parameter"""
    response = client.post(
        "/api/invitations/oauth/office365/callback",
        json={
            "code": "test_auth_code",
            "token": "invalid_token",
            "state": "invalid_state"
        }
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "invalid state" in data["error"].lower()


def test_invitation_with_invalid_data(admin_token):
    """Test creating invitation with invalid data"""
    response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "not_an_email",
            "role": "INVALID_ROLE",
            "client_company": "Test Client"
        }
    )
    
    assert response.status_code == 422  # Validation error


def test_invitation_across_timezones(test_db):
    """Test invitation handling across multiple timezones"""
    # 1. Create invitation in Tokyo timezone
    tokyo_now = TimezoneTestUtilities.create_datetime_with_offset(tz_name="Asia/Tokyo")
    tokyo_expiry = TimezoneTestUtilities.create_datetime_with_offset(
        offset_hours=48,  # 48 hours in the future
        tz_name="Asia/Tokyo"
    )
    
    # Create invitation with Tokyo timezone
    tokyo_invitation = Invitation(
        email="tokyo@test.com",
        token=str(uuid.uuid4()),
        role="USER",
        inviter_id=1,  # Admin user
        created_at=tokyo_now,
        expires_at=tokyo_expiry,
        client_company="Tokyo Corp"
    )
    test_db.add(tokyo_invitation)
    test_db.commit()
    test_db.refresh(tokyo_invitation)
    
    # 2. Verify the invitation expiry from New York timezone perspective
    ny_perspective = TimezoneTestUtilities.normalize_timezone(
        tokyo_invitation.expires_at, 
        "America/New_York"
    )
    
    # 3. Verify the same absolute time
    assert not TimezoneTestUtilities.is_expired(tokyo_invitation.expires_at)
    
    # The expiration time in different timezones should represent the same moment
    tokyo_check = TimezoneTestUtilities.normalize_timezone(tokyo_expiry, "Asia/Tokyo")
    ny_check = TimezoneTestUtilities.normalize_timezone(tokyo_expiry, "America/New_York")
    
    # Should be the same absolute time, but different local representations
    assert TimezoneTestUtilities.safe_compare(tokyo_check, ny_check) == 0
    assert tokyo_check.hour != ny_check.hour  # Different hour due to timezone difference
    
    # Verify the expiration through the API
    response = client.get(
        f"/api/invitations/verify/{tokyo_invitation.token}"
    )
    
    assert response.status_code == 200
    
    # 4. Create an invitation that will expire soon
    almost_expired = Invitation(
        email="expiring_soon@test.com",
        token=str(uuid.uuid4()),
        role="USER",
        inviter_id=1,
        created_at=TimezoneTestUtilities.create_past_datetime(days=6),
        expires_at=TimezoneTestUtilities.create_future_datetime(minutes=5),  # Expires in 5 minutes
        client_company="Almost Expired Corp"
    )
    test_db.add(almost_expired)
    test_db.commit()
    test_db.refresh(almost_expired)
    
    # Verify it's not expired yet but will be soon
    assert not TimezoneTestUtilities.is_expired(almost_expired.expires_at)
    assert TimezoneTestUtilities.is_in_future(almost_expired.expires_at)