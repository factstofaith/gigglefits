"""
Improved test suite for the MFA enrollment and verification functionality.

This test suite uses the standardized testing approach with the Entity Registry pattern
and other improvements to ensure reliable, maintainable tests.

This test suite covers:
1. MFA enrollment process
2. MFA verification
3. Recovery code generation and usage
4. MFA settings management

Author: Claude (with human oversight)
Date: April 15, 2025
"""

import pytest
import json
import base64
import pyotp
from datetime import datetime, timezone

# Import test adapters - use fixtures from conftest.py
from test.test_adapters.auth import TimezoneTestUtilities

# Test data - will be used to populate the auth adapter
@pytest.fixture(scope="function")
def test_regular_user():
    """Create a regular user for testing."""
    return {
        "id": "test-user-id",
        "email": "user@test.com",
        "name": "Test User",
        "role": "USER",
        "mfa_enabled": False
    }

@pytest.fixture(scope="function")
def test_admin_user():
    """Create an admin user for testing."""
    return {
        "id": "test-admin-id",
        "email": "admin@test.com",
        "name": "Admin User",
        "role": "ADMIN",
        "mfa_enabled": False
    }

@pytest.fixture(scope="function")
def test_mfa_user():
    """Create a user with MFA already enabled."""
    return {
        "id": "test-mfa-id",
        "email": "mfa@test.com",
        "name": "MFA User",
        "role": "USER",
        "mfa_enabled": True
    }

@pytest.fixture(scope="function")
def setup_users(auth_adapter, mfa_adapter, test_regular_user, test_admin_user, test_mfa_user):
    """Set up test users in auth and MFA adapters."""
    # Add users to auth adapter
    auth_adapter.add_user(
        auth_adapter.User(
            id=test_regular_user["id"],
            email=test_regular_user["email"],
            name=test_regular_user["name"],
            role=test_regular_user["role"],
            mfa_enabled=test_regular_user["mfa_enabled"]
        )
    )
    
    auth_adapter.add_user(
        auth_adapter.User(
            id=test_admin_user["id"],
            email=test_admin_user["email"],
            name=test_admin_user["name"],
            role=test_admin_user["role"],
            mfa_enabled=test_admin_user["mfa_enabled"]
        )
    )
    
    auth_adapter.add_user(
        auth_adapter.User(
            id=test_mfa_user["id"],
            email=test_mfa_user["email"],
            name=test_mfa_user["name"],
            role=test_mfa_user["role"],
            mfa_enabled=test_mfa_user["mfa_enabled"]
        )
    )
    
    # Set up MFA for mfa_user - should be synchronized via entity registry
    mfa_adapter.enable_mfa(test_mfa_user["id"], "ABCDEFGHIJKLMNOP")
    mfa_adapter.add_recovery_codes(
        test_mfa_user["id"], 
        ["12345678", "23456789", "34567890", "45678901", "56789012"]
    )
    
    # Yield control back to the test
    yield
    
    # Clean up (the fixtures will handle resetting the adapters)
    pass

@pytest.fixture(scope="function")
def user_token(auth_adapter, setup_users, test_regular_user):
    """Get authentication token for regular user."""
    return auth_adapter.generate_token(test_regular_user["id"])

@pytest.fixture(scope="function")
def admin_token(auth_adapter, setup_users, test_admin_user):
    """Get authentication token for admin user."""
    return auth_adapter.generate_token(test_admin_user["id"])

@pytest.fixture(scope="function")
def mfa_user_token(auth_adapter, setup_users, test_mfa_user):
    """Get authentication token for MFA user."""
    return auth_adapter.generate_token(test_mfa_user["id"])

# Create a fixture to store test data across tests
@pytest.fixture(scope="module")
def test_data():
    """Store test data shared across tests."""
    return {
        "mfa_secret": None,
        "recovery_code": None
    }

# TEST CASES

def test_enroll_mfa(mfa_adapter, test_regular_user, test_data):
    """Test initiating MFA enrollment."""
    # Use direct assertion on adapter method
    result = mfa_adapter.initiate_enrollment(test_regular_user["id"])
    
    assert result is not None
    assert "qrCode" in result
    assert "secret" in result
    assert result["qrCode"].startswith("data:image/png;base64,")
    
    # Save secret for later test
    test_data["mfa_secret"] = result["secret"]

def test_verify_mfa_invalid_code(mfa_adapter, test_regular_user, test_data):
    """Test MFA verification with invalid code."""
    # First ensure we have a secret
    if not test_data["mfa_secret"]:
        # Enroll first
        result = mfa_adapter.initiate_enrollment(test_regular_user["id"])
        test_data["mfa_secret"] = result["secret"]
    
    # Attempt to verify with invalid code
    result = mfa_adapter.verify_code(
        test_regular_user["id"], 
        "123456",  # Invalid code
        test_data["mfa_secret"]
    )
    
    assert result["success"] is False
    assert "invalid" in result["error"].lower()

def test_verify_mfa_valid_code(mfa_adapter, auth_adapter, test_regular_user, test_data):
    """Test MFA verification with valid code."""
    # First ensure we have a secret
    if not test_data["mfa_secret"]:
        # Enroll first
        result = mfa_adapter.initiate_enrollment(test_regular_user["id"])
        test_data["mfa_secret"] = result["secret"]
    
    # Generate a valid TOTP code
    totp = pyotp.TOTP(test_data["mfa_secret"])
    valid_code = totp.now()
    
    # Verify the code
    result = mfa_adapter.verify_code(
        test_regular_user["id"],
        valid_code,
        test_data["mfa_secret"]
    )
    
    assert result["success"] is True
    
    # Check that the user's MFA status is updated in auth adapter via registry
    user = auth_adapter.get_user_by_id(test_regular_user["id"])
    assert user.mfa_enabled is True

def test_get_mfa_status(mfa_adapter, test_regular_user, test_data):
    """Test getting MFA status after enrollment."""
    # Ensure MFA is verified
    if not test_data["mfa_secret"]:
        # Enroll and verify
        result = mfa_adapter.initiate_enrollment(test_regular_user["id"])
        test_data["mfa_secret"] = result["secret"]
        
        # Generate and verify code
        totp = pyotp.TOTP(test_data["mfa_secret"])
        valid_code = totp.now()
        mfa_adapter.verify_code(test_regular_user["id"], valid_code, test_data["mfa_secret"])
    
    # Check MFA status
    result = mfa_adapter.get_mfa_status(test_regular_user["id"])
    assert result["enabled"] is True
    assert result["verified"] is True
    assert result["last_verified"] is not None

def test_get_recovery_codes(mfa_adapter, test_regular_user, test_data):
    """Test getting recovery codes."""
    # Ensure MFA is verified
    if not test_data["mfa_secret"]:
        # Enroll and verify
        result = mfa_adapter.initiate_enrollment(test_regular_user["id"])
        test_data["mfa_secret"] = result["secret"]
        
        # Generate and verify code
        totp = pyotp.TOTP(test_data["mfa_secret"])
        valid_code = totp.now()
        mfa_adapter.verify_code(test_regular_user["id"], valid_code, test_data["mfa_secret"])
    
    # Get recovery codes
    codes = mfa_adapter.get_recovery_codes(test_regular_user["id"])
    assert codes is not None
    assert isinstance(codes, list)
    assert len(codes) > 0
    
    # Save one code for later test
    test_data["recovery_code"] = codes[0]

def test_regenerate_recovery_codes(mfa_adapter, test_regular_user, test_data):
    """Test regenerating recovery codes."""
    # Ensure MFA is verified
    if not test_data["mfa_secret"]:
        # Enroll and verify
        result = mfa_adapter.initiate_enrollment(test_regular_user["id"])
        test_data["mfa_secret"] = result["secret"]
        
        # Generate and verify code
        totp = pyotp.TOTP(test_data["mfa_secret"])
        valid_code = totp.now()
        mfa_adapter.verify_code(test_regular_user["id"], valid_code, test_data["mfa_secret"])
    
    # Get current codes to compare
    original_codes = mfa_adapter.get_recovery_codes(test_regular_user["id"])
    
    # Regenerate codes
    new_codes = mfa_adapter.regenerate_recovery_codes(test_regular_user["id"])
    
    assert new_codes is not None
    assert isinstance(new_codes, list)
    assert len(new_codes) > 0
    
    # New codes should be different from original codes
    assert set(new_codes) != set(original_codes)
    
    # Update recovery code for later tests
    test_data["recovery_code"] = new_codes[0]

def test_verify_recovery_code(mfa_adapter, test_regular_user, test_data):
    """Test verifying recovery code."""
    # Ensure we have a recovery code
    if not test_data["recovery_code"]:
        pytest.skip("No recovery code available")
    
    # Verify the recovery code
    result = mfa_adapter.verify_recovery_code(
        test_regular_user["id"],
        test_data["recovery_code"]
    )
    
    assert result["success"] is True

def test_verify_invalid_recovery_code(mfa_adapter, test_regular_user):
    """Test verifying invalid recovery code."""
    result = mfa_adapter.verify_recovery_code(
        test_regular_user["id"],
        "invalid-code"
    )
    
    assert result["success"] is False
    assert "invalid" in result["error"].lower()

def test_disable_mfa(mfa_adapter, auth_adapter, test_regular_user, test_data):
    """Test disabling MFA."""
    # Ensure MFA is verified
    if not test_data["mfa_secret"]:
        # Enroll and verify
        result = mfa_adapter.initiate_enrollment(test_regular_user["id"])
        test_data["mfa_secret"] = result["secret"]
        
        # Generate and verify code
        totp = pyotp.TOTP(test_data["mfa_secret"])
        valid_code = totp.now()
        mfa_adapter.verify_code(test_regular_user["id"], valid_code, test_data["mfa_secret"])
    
    # Disable MFA
    result = mfa_adapter.disable_mfa(test_regular_user["id"])
    assert result["success"] is True
    
    # Verify MFA is disabled
    status = mfa_adapter.get_mfa_status(test_regular_user["id"])
    assert status["enabled"] is False
    
    # Check that the user's MFA status is updated in auth adapter via registry
    user = auth_adapter.get_user_by_id(test_regular_user["id"])
    assert user.mfa_enabled is False

def test_admin_reset_user_mfa(mfa_adapter, auth_adapter, test_admin_user, test_mfa_user):
    """Test admin resetting user's MFA."""
    # Admin resets user's MFA
    result = mfa_adapter.admin_reset_mfa(
        test_admin_user["id"],
        test_mfa_user["id"]
    )
    
    assert result["success"] is True
    
    # Verify MFA is disabled for the user
    status = mfa_adapter.get_mfa_status(test_mfa_user["id"])
    assert status["enabled"] is False
    
    # Check that the user's MFA status is updated in auth adapter via registry
    user = auth_adapter.get_user_by_id(test_mfa_user["id"])
    assert user.mfa_enabled is False

def test_admin_get_mfa_settings(mfa_adapter, test_admin_user):
    """Test admin getting MFA settings."""
    settings = mfa_adapter.get_mfa_settings(test_admin_user["id"])
    
    assert "requireMFA" in settings
    assert "enableRecoveryCodes" in settings
    assert isinstance(settings["requireMFA"], bool)

def test_admin_update_mfa_settings(mfa_adapter, test_admin_user):
    """Test admin updating MFA settings."""
    # Get current settings first
    current_settings = mfa_adapter.get_mfa_settings(test_admin_user["id"])
    
    # Update settings to opposite values
    new_settings = {
        "requireMFA": not current_settings["requireMFA"],
        "enableRecoveryCodes": not current_settings["enableRecoveryCodes"],
        "mfaGracePeriodDays": 7
    }
    
    # Update settings
    result = mfa_adapter.update_mfa_settings(test_admin_user["id"], new_settings)
    
    assert result["requireMFA"] == new_settings["requireMFA"]
    assert result["enableRecoveryCodes"] == new_settings["enableRecoveryCodes"]
    assert result["mfaGracePeriodDays"] == new_settings["mfaGracePeriodDays"]

def test_enroll_mfa_already_enabled(mfa_adapter, test_mfa_user):
    """Test attempting to enroll when MFA is already enabled."""
    result = mfa_adapter.initiate_enrollment(test_mfa_user["id"])
    
    assert "error" in result
    assert "already enabled" in result["error"].lower()

def test_disable_mfa_not_enabled(mfa_adapter, test_regular_user):
    """Test disabling MFA when it's not enabled."""
    # Make sure MFA is disabled first
    mfa_adapter.disable_mfa(test_regular_user["id"])
    
    # Then try to disable again
    result = mfa_adapter.disable_mfa(test_regular_user["id"])
    
    assert "error" in result
    assert "not enabled" in result["error"].lower()

def test_timezone_aware_mfa_operations(mfa_adapter, test_regular_user):
    """Test MFA operations with timezone-aware datetimes."""
    # Create timezone-aware times for MFA operations
    tokyo_time = TimezoneTestUtilities.create_datetime(
        2025, 4, 15, 12, 0, 0, "Asia/Tokyo"
    )
    
    # Initialize MFA
    result = mfa_adapter.initiate_enrollment(test_regular_user["id"])
    secret = result["secret"]
    
    # Generate TOTP code
    totp = pyotp.TOTP(secret)
    valid_code = totp.now()
    
    # Verify with code
    result = mfa_adapter.verify_code(test_regular_user["id"], valid_code, secret)
    assert result["success"] is True
    
    # Verify timezone handling in status retrieval
    status = mfa_adapter.get_mfa_status(test_regular_user["id"])
    
    # Ensure timestamp is timezone-aware
    last_verified = status["last_verified"]
    assert last_verified is not None
    
    # If it's a string, parse it to a datetime first
    if isinstance(last_verified, str):
        # Parse ISO format string to datetime
        from dateutil import parser
        last_verified = parser.parse(last_verified)
    
    # Check that the timestamp is timezone-aware
    assert last_verified.tzinfo is not None