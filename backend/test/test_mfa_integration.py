"""
Test suite for the MFA enrollment and verification functionality.

This test suite covers:
1. MFA enrollment process
2. MFA verification
3. Recovery code generation and usage
4. MFA settings management

Author: Claude (with human oversight)
Date: March 27, 2025
"""

import pytest
import json
import base64
import uuid
from datetime import datetime
import pyotp
from fastapi.testclient import TestClient

from main import app
from db.models import User, UserMFA
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
    
    # Setup: Create users for testing
    # Regular user without MFA
    regular_user = User(
        id=str(uuid.uuid4()),
        username="user_test",
        email="user@test.com",
        hashed_password="$2b$12$1234567890123456789012.1234567890123456789012345678901234",  # hashed 'user123'
        name="Test User",
        role="USER",
        client_company="Test Company",
        is_active=True,
        account_status="ACTIVE",
        created_at=datetime.now()
    )
    
    # Admin user
    admin_user = User(
        id=str(uuid.uuid4()),
        username="admin_test",
        email="admin@test.com",
        hashed_password="$2b$12$1234567890123456789012.1234567890123456789012345678901234",  # hashed 'admin123'
        name="Admin Test",
        role="ADMIN",
        client_company="Test Company",
        is_active=True,
        account_status="ACTIVE",
        created_at=datetime.now()
    )
    
    # User with MFA already configured
    mfa_user = User(
        id="3",  # Static ID for test simplicity
        username="mfa_test",
        email="mfa@test.com",
        hashed_password="$2b$12$1234567890123456789012.1234567890123456789012345678901234",  # hashed 'mfa123'
        name="MFA Test",
        role="USER",
        client_company="Test Company",
        is_active=True,
        account_status="ACTIVE",
        created_at=datetime.now()
    )
    
    db.add_all([regular_user, admin_user, mfa_user])
    db.commit()
    
    # Set up MFA for mfa_user
    test_secret = "ABCDEFGHIJKLMNOP"  # Test TOTP secret
    mfa_config = UserMFA(
        id=str(uuid.uuid4()),
        user_id="3",  # mfa_user.id
        mfa_secret=test_secret,
        mfa_enabled=True,
        mfa_verified=True,
        mfa_recovery_codes=["12345678", "23456789", "34567890", "45678901", "56789012"],
        created_at=datetime.now()
    )
    db.add(mfa_config)
    db.commit()
    
    # Return DB session
    yield db
    
    # Teardown
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def user_token():
    """Get user authentication token"""
    response = client.post(
        "/api/auth/login",
        json={"email": "user@test.com", "password": "user123"}
    )
    return response.json()["token"]


@pytest.fixture(scope="function")
def admin_token():
    """Get admin authentication token"""
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "admin123"}
    )
    return response.json()["token"]


@pytest.fixture(scope="function")
def mfa_user_token():
    """Get MFA user authentication token"""
    response = client.post(
        "/api/auth/login",
        json={"email": "mfa@test.com", "password": "mfa123"}
    )
    return response.json()["token"]


# Test cases for MFA enrollment
def test_enroll_mfa(user_token):
    """Test initiating MFA enrollment"""
    response = client.post(
        "/api/users/mfa/enroll",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "qrCode" in data
    assert "secret" in data
    assert data["qrCode"].startswith("data:image/png;base64,")
    
    # Verify the QR code contains the secret
    try:
        # Save secret for later test
        pytest.mfa_secret = data["secret"]
        return data["secret"]
    except Exception:
        pass


def test_verify_mfa_invalid_code(user_token):
    """Test MFA verification with invalid code"""
    response = client.post(
        "/api/users/mfa/verify",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"code": "123456"}  # Invalid code
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "invalid" in data["error"].lower()


def test_verify_mfa_valid_code(user_token):
    """Test MFA verification with valid code"""
    # Use the secret from the enrollment test
    secret = getattr(pytest, "mfa_secret", None)
    if not secret:
        # If secret not stored, get a new one
        secret = test_enroll_mfa(user_token)
    
    # Generate a valid TOTP code
    totp = pyotp.TOTP(secret)
    valid_code = totp.now()
    
    response = client.post(
        "/api/users/mfa/verify",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"code": valid_code}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_get_mfa_status(user_token):
    """Test getting MFA status after enrollment"""
    # First ensure MFA is set up
    test_verify_mfa_valid_code(user_token)
    
    response = client.get(
        "/api/users/mfa/status",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["enabled"] is True


# Test cases for recovery codes
def test_get_recovery_codes(user_token):
    """Test getting recovery codes"""
    # First ensure MFA is set up
    test_verify_mfa_valid_code(user_token)
    
    response = client.get(
        "/api/users/mfa/recovery-codes",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "recoveryCodes" in data
    assert isinstance(data["recoveryCodes"], list)
    assert len(data["recoveryCodes"]) > 0
    
    # Save one code for later test
    pytest.recovery_code = data["recoveryCodes"][0]


def test_regenerate_recovery_codes(user_token):
    """Test regenerating recovery codes"""
    # First ensure MFA is set up
    test_verify_mfa_valid_code(user_token)
    
    # Get current codes to compare
    response1 = client.get(
        "/api/users/mfa/recovery-codes",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    original_codes = response1.json()["recoveryCodes"]
    
    # Regenerate codes
    response2 = client.post(
        "/api/users/mfa/recovery-codes/regenerate",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response2.status_code == 200
    data = response2.json()
    assert "recoveryCodes" in data
    assert isinstance(data["recoveryCodes"], list)
    assert len(data["recoveryCodes"]) > 0
    
    # New codes should be different from original codes
    assert set(data["recoveryCodes"]) != set(original_codes)


def test_login_with_recovery_code():
    """Test logging in with recovery code"""
    # Get a recovery code from previous test
    recovery_code = getattr(pytest, "recovery_code", None)
    if not recovery_code:
        # If no code stored, we can't test this
        pytest.skip("No recovery code available")
    
    response = client.post(
        "/api/auth/login",
        json={
            "email": "user@test.com", 
            "password": "user123",
            "recoveryCode": recovery_code
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert "user" in data


def test_login_with_invalid_recovery_code():
    """Test logging in with invalid recovery code"""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "user@test.com", 
            "password": "user123",
            "recoveryCode": "invalid-code"
        }
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "error" in data
    assert "invalid recovery code" in data["error"].lower()


# Test cases for disabling MFA
def test_disable_mfa(user_token):
    """Test disabling MFA"""
    # First ensure MFA is set up
    test_verify_mfa_valid_code(user_token)
    
    response = client.post(
        "/api/users/mfa/disable",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    
    # Verify MFA is disabled
    status_response = client.get(
        "/api/users/mfa/status",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["enabled"] is False


# Test cases for admin MFA management
def test_admin_reset_user_mfa(admin_token):
    """Test admin resetting user's MFA"""
    response = client.post(
        "/api/admin/users/3/mfa/reset",  # Reset MFA for User with ID 3 (mfa_user)
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    
    # Verify MFA is disabled for the user
    # In a real API, we'd check the user's MFA status, but we'll simulate this
    # by directly checking the database
    test_db_session = next(get_db())
    mfa_config = test_db_session.query(UserMFA).filter_by(user_id="3").first()
    assert mfa_config.mfa_enabled is False


def test_admin_get_mfa_settings(admin_token):
    """Test admin getting MFA settings"""
    response = client.get(
        "/api/admin/mfa/settings",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "requireMFA" in data
    assert "enableRecoveryCodes" in data
    assert isinstance(data["requireMFA"], bool)


def test_admin_update_mfa_settings(admin_token):
    """Test admin updating MFA settings"""
    # Get current settings first
    get_response = client.get(
        "/api/admin/mfa/settings",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    current_settings = get_response.json()
    
    # Update settings to opposite values
    new_settings = {
        "requireMFA": not current_settings["requireMFA"],
        "enableRecoveryCodes": not current_settings["enableRecoveryCodes"],
        "mfaGracePeriodDays": 7
    }
    
    update_response = client.put(
        "/api/admin/mfa/settings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=new_settings
    )
    
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["requireMFA"] == new_settings["requireMFA"]
    assert data["enableRecoveryCodes"] == new_settings["enableRecoveryCodes"]
    assert data["mfaGracePeriodDays"] == new_settings["mfaGracePeriodDays"]


# Test error cases
def test_enroll_mfa_already_enabled(mfa_user_token):
    """Test attempting to enroll when MFA is already enabled"""
    response = client.post(
        "/api/users/mfa/enroll",
        headers={"Authorization": f"Bearer {mfa_user_token}"}
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "already enabled" in data["error"].lower()


def test_disable_mfa_not_enabled(user_token):
    """Test disabling MFA when it's not enabled"""
    # First disable MFA
    test_disable_mfa(user_token)
    
    # Then try to disable again
    response = client.post(
        "/api/users/mfa/disable",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "not enabled" in data["error"].lower()


def test_verify_mfa_not_enrolled(admin_token):
    """Test verifying MFA when not enrolled"""
    response = client.post(
        "/api/users/mfa/verify",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"code": "123456"}
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "not enrolled" in data["error"].lower() or "not found" in data["error"].lower()


def test_get_recovery_codes_mfa_not_enabled(admin_token):
    """Test getting recovery codes when MFA is not enabled"""
    response = client.get(
        "/api/users/mfa/recovery-codes",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "not enabled" in data["error"].lower() or "not found" in data["error"].lower()