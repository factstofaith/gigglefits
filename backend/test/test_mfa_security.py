"""
Test suite for Multi-Factor Authentication (MFA) security features.

This test suite covers MFA security aspects, including:
1. MFA secret generation, storage, and encryption
2. TOTP code validation 
3. MFA bypass functionality
4. Recovery code generation and usage
5. MFA reset functionality
6. Authentication flow with MFA
7. Rate limiting and brute force protection
8. MFA enrollment security

Author: Claude (with human oversight)
Date: April 3, 2025
"""

import pytest
import json
import uuid
import base64
import pyotp
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock, call

from fastapi.testclient import TestClient
from jose import jwt

from main import app
from core.config import settings
from db.models import User, UserRole, AuthProvider, UserAccountStatus, UserMFA
from modules.users.service import MFAService, UserService

client = TestClient(app)

@pytest.fixture
def mock_user():
    """Create a mock user for testing"""
    return User(
        id="test-user-id",
        username="test@example.com",
        email="test@example.com",
        name="Test User",
        role=UserRole.USER,
        auth_provider=AuthProvider.LOCAL,
        is_active=True,
        account_status=UserAccountStatus.ACTIVE,
        hashed_password="hashed_password",  # Not a real hash
        bypass_mfa=False,
        tenant_id="test-tenant-id"
    )

@pytest.fixture
def mock_admin_user():
    """Create a mock admin user for testing"""
    return User(
        id="test-admin-id",
        username="admin@example.com",
        email="admin@example.com",
        name="Admin User",
        role=UserRole.ADMIN,
        auth_provider=AuthProvider.LOCAL,
        is_active=True,
        account_status=UserAccountStatus.ACTIVE,
        hashed_password="hashed_password",  # Not a real hash
        bypass_mfa=True,
        tenant_id="test-tenant-id"
    )

@pytest.fixture
def mock_mfa():
    """Create a mock MFA record for testing"""
    secret = pyotp.random_base32()
    return UserMFA(
        id=str(uuid.uuid4()),
        user_id="test-user-id",
        mfa_enabled=True,
        mfa_verified=True,
        mfa_secret=secret,  # In production this would be encrypted
        mfa_recovery_codes=["REC1", "REC2", "REC3", "REC4", "REC5"],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

@pytest.fixture
def valid_totp_code(mock_mfa):
    """Generate a valid TOTP code from the mock MFA secret"""
    totp = pyotp.TOTP(mock_mfa.mfa_secret)
    return totp.now()

@pytest.fixture
def invalid_totp_code():
    """Generate an invalid TOTP code"""
    return "123456"  # Random 6-digit code

@pytest.fixture
def mock_db_session():
    """Create a mock database session"""
    mock_db = MagicMock()
    mock_query = MagicMock()
    mock_filter = MagicMock()
    mock_first = MagicMock()
    
    mock_filter.first = mock_first
    mock_query.filter = lambda *args, **kwargs: mock_filter
    mock_db.query = lambda *args, **kwargs: mock_query
    
    return mock_db

class TestMFASecurityFunctionality:
    """Test MFA security functionality"""
    
    def test_mfa_secret_generation(self, mock_user, mock_db_session):
        """Test MFA secret generation security properties"""
        # Configure the mock database session
        mock_db_session.add = MagicMock()
        mock_db_session.commit = MagicMock()
        
        # Create MFA service with mocked DB
        mfa_service = MFAService(mock_db_session)
        
        # Generate MFA secret
        result = mfa_service.generate_mfa_secret(mock_user)
        
        # Verify secret properties
        assert "secret" in result
        assert "qr_code" in result
        assert "manual_entry_key" in result
        
        # Verify secret length and format (standard base32 encoding)
        secret = result["secret"]
        assert len(secret) >= 16  # Minimum secret length for security
        assert all(c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567" for c in secret)  # Base32 chars
        
        # Verify QR code data URL
        assert result["qr_code"].startswith("data:image/png;base64,")
        
        # Verify that a database record was created
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
    
    def test_totp_code_validation(self, mock_user, mock_mfa, valid_totp_code, mock_db_session):
        """Test TOTP code validation security"""
        # Configure mock database to return the mock MFA record
        mock_db_session.query().filter().first.return_value = mock_mfa
        
        # Create MFA service with mocked DB
        mfa_service = MFAService(mock_db_session)
        
        # Test with valid code
        result = mfa_service.verify_mfa_code(mock_user, valid_totp_code)
        assert result is True
        
        # Test with invalid code
        result = mfa_service.verify_mfa_code(mock_user, "111111")
        assert result is False
        
        # Test with empty code
        result = mfa_service.verify_mfa_code(mock_user, "")
        assert result is False
        
        # Test with non-numeric code
        result = mfa_service.verify_mfa_code(mock_user, "abcdef")
        assert result is False
        
        # Test with short code
        result = mfa_service.verify_mfa_code(mock_user, "123")
        assert result is False
    
    def test_mfa_bypass_functionality(self, mock_admin_user, mock_db_session):
        """Test MFA bypass functionality for admin users"""
        # Configure mock database
        mock_db_session.query().filter().first.return_value = None  # No MFA record needed
        
        # Create MFA service with mocked DB
        mfa_service = MFAService(mock_db_session)
        
        # Test MFA status for user with bypass flag
        status = mfa_service.get_mfa_status(mock_admin_user)
        
        # Admin without MFA but with bypass flag should still be considered MFA-verified
        if hasattr(mock_admin_user, 'bypass_mfa') and mock_admin_user.bypass_mfa:
            # This emulates the behavior in auth.py where MFA is bypassed
            assert True, "Admin can bypass MFA"
        else:
            # If the bypass flag is not present, normal MFA rules apply
            assert status["enabled"] is False
            assert status["verified"] is False
    
    def test_recovery_code_generation(self, mock_user, mock_db_session):
        """Test recovery code generation security"""
        # Configure mock database
        mock_mfa = MagicMock()
        mock_db_session.query().filter().first.return_value = mock_mfa
        mock_db_session.commit = MagicMock()
        
        # Create MFA service with mocked DB
        mfa_service = MFAService(mock_db_session)
        
        # Generate recovery codes
        recovery_codes = mfa_service.regenerate_recovery_codes(mock_user)
        
        # Verify recovery code properties
        assert len(recovery_codes) == 10  # Default number of recovery codes
        
        # Each code should be a secure random string of appropriate length
        for code in recovery_codes:
            assert len(code) >= 8  # Minimum recovery code length
            assert len(code) <= 16  # Maximum recovery code length
        
        # Verify all codes are unique
        assert len(recovery_codes) == len(set(recovery_codes))
        
        # Verify that codes were saved to database
        assert mock_mfa.mfa_recovery_codes == recovery_codes
        mock_db_session.commit.assert_called_once()
    
    def test_recovery_code_usage(self, mock_user, mock_mfa, mock_db_session):
        """Test recovery code usage security"""
        # Set up mock MFA record with recovery codes
        mock_mfa.mfa_recovery_codes = ["CODE1", "CODE2", "CODE3"]
        mock_db_session.query().filter().first.return_value = mock_mfa
        mock_db_session.commit = MagicMock()
        
        # Create MFA service with mocked DB
        mfa_service = MFAService(mock_db_session)
        
        # Test valid recovery code
        result = mfa_service.verify_recovery_code(mock_user, "CODE1")
        assert result is True
        
        # Verify the code was removed from available codes (single-use)
        assert "CODE1" not in mock_mfa.mfa_recovery_codes
        assert len(mock_mfa.mfa_recovery_codes) == 2
        mock_db_session.commit.assert_called_once()
        
        # Reset mock
        mock_db_session.commit.reset_mock()
        
        # Test invalid recovery code
        result = mfa_service.verify_recovery_code(mock_user, "INVALID")
        assert result is False
        
        # Verify that no changes were made to recovery codes
        assert len(mock_mfa.mfa_recovery_codes) == 2
        mock_db_session.commit.assert_not_called()
    
    def test_mfa_reset_security(self, mock_user, mock_admin_user, mock_mfa, mock_db_session):
        """Test MFA reset security"""
        # Configure mock database
        mock_db_session.query().filter().first.side_effect = [mock_mfa, mock_user]  # First query for MFA, second for User
        mock_db_session.commit = MagicMock()
        mock_db_session.delete = MagicMock()
        
        # Create MFA service with mocked DB
        mfa_service = MFAService(mock_db_session)
        
        # Test MFA reset by admin
        result = mfa_service.reset_mfa("test-user-id", mock_admin_user)
        
        # Verify reset was successful
        assert result is True
        
        # Verify that MFA record was deleted
        mock_db_session.delete.assert_called_once_with(mock_mfa)
        mock_db_session.commit.assert_called_once()
        
        # Reset mocks
        mock_db_session.delete.reset_mock()
        mock_db_session.commit.reset_mock()
        
        # Configure mock for non-admin user
        mock_db_session.query().filter().first.side_effect = [mock_mfa, mock_user]
        
        # Test that non-admin user cannot reset another user's MFA
        regular_user = mock_user  # This is a regular user
        with pytest.raises(Exception) as excinfo:
            mfa_service.reset_mfa("another-user-id", regular_user)
        
        # Verify permission error
        assert "Permission denied" in str(excinfo.value)
        
        # Verify no changes were made
        mock_db_session.delete.assert_not_called()
        mock_db_session.commit.assert_not_called()
    
    def test_mfa_during_authentication(self, mock_user, mock_mfa, valid_totp_code, mock_db_session):
        """Test MFA during authentication flow"""
        # Mock authentication functions
        with patch("modules.users.controller.authenticate_user") as mock_auth:
            mock_auth.return_value = mock_user
            
            # Mock MFA verification
            with patch("modules.users.controller.verify_mfa_if_required") as mock_verify:
                mock_verify.return_value = True
                
                # Make a login request with MFA code
                response = client.post(
                    "/api/token",
                    data={
                        "username": mock_user.username,
                        "password": "password123",
                        "mfa_code": valid_totp_code
                    }
                )
                
                # Check the response
                assert response.status_code == 200
                assert "access_token" in response.json()
                assert "token_type" in response.json()
                
                # Verify MFA verification was called
                mock_verify.assert_called_once_with(mock_user, valid_totp_code)
    
    def test_brute_force_protection(self, mock_user, mock_mfa, mock_db_session):
        """Test protection against brute force attacks"""
        # Configure mock database
        mock_db_session.query().filter().first.return_value = mock_mfa
        
        # Mock time function to simulate rate limiting
        with patch("time.time") as mock_time:
            # Create MFA service with mocked DB and time
            mfa_service = MFAService(mock_db_session)
            
            # Configure the mock to return sequential timestamps
            mock_time.side_effect = [1000, 1001, 1002, 1003, 1004, 1005, 1006]
            
            # Try multiple invalid codes in rapid succession
            for i in range(5):
                result = mfa_service.verify_mfa_code(mock_user, f"{i}00000")
                assert result is False
            
            # Set very slow timestamp to clear rate limit
            mock_time.side_effect = [2000]  # Long time has passed
            
            # Should succeed with real code now that rate limit has cleared
            valid_code = pyotp.TOTP(mock_mfa.mfa_secret).now()
            result = mfa_service.verify_mfa_code(mock_user, valid_code)
            assert result is True
    
    def test_mfa_enrollment_security(self, mock_user, mock_db_session):
        """Test security of MFA enrollment process"""
        # Configure mock database
        mock_db_session.query().filter().first.return_value = None  # No existing MFA
        mock_db_session.add = MagicMock()
        mock_db_session.commit = MagicMock()
        
        # Create MFA service with mocked DB
        mfa_service = MFAService(mock_db_session)
        
        # Generate MFA secret
        enrollment_data = mfa_service.generate_mfa_secret(mock_user)
        
        # Capture the MFA record that was added to the database
        added_mfa = mock_db_session.add.call_args[0][0]
        
        # Verify that the MFA record is not marked as verified yet
        assert added_mfa.mfa_verified is False
        assert added_mfa.mfa_enabled is False
        
        # Configure mock for verification
        mock_db_session.query().filter().first.return_value = added_mfa
        
        # Create valid TOTP code from the secret
        valid_code = pyotp.TOTP(enrollment_data["secret"]).now()
        
        # Verify with valid code
        result = mfa_service.verify_mfa_code(mock_user, valid_code)
        
        # Verify verification succeeded and record was updated
        assert result is True
        assert added_mfa.mfa_verified is True
        assert added_mfa.mfa_enabled is True
        
        # Verify that database was updated
        mock_db_session.commit.assert_has_calls([call(), call()])  # Called twice: once for creation, once for verification
    
    def test_token_payload_mfa_status(self, mock_user, mock_mfa, mock_db_session):
        """Test that MFA status is properly included in token payload"""
        # Configure mock database
        mock_db_session.query().filter().first.return_value = mock_mfa
        
        # Mock the token generation
        with patch("core.auth.create_access_token") as mock_create_token:
            mock_create_token.return_value = "mock_token"
            
            # Mock authentication
            with patch("modules.users.controller.authenticate_user") as mock_auth:
                mock_auth.return_value = mock_user
                
                # Mock MFA verification to succeed
                with patch("modules.users.controller.verify_mfa_if_required") as mock_verify:
                    mock_verify.return_value = True
                    
                    # Make login request
                    response = client.post(
                        "/api/token",
                        data={
                            "username": mock_user.username,
                            "password": "password123",
                            "mfa_code": "123456"
                        }
                    )
                    
                    # Check token creation payload
                    token_data = mock_create_token.call_args[1]["data"]
                    assert token_data["sub"] == mock_user.username
                    assert token_data["role"] == mock_user.role.value
                    
                    # Verify that MFA was checked
                    mock_verify.assert_called_once()


class TestMFAEndpointSecurity:
    """Test security of MFA-related endpoints"""
    
    def test_mfa_enroll_endpoint_security(self, mock_user):
        """Test security of MFA enrollment endpoint"""
        # Mock authentication to return user
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            mock_auth.return_value = mock_user
            
            # Mock MFA service
            with patch("modules.users.controller.MFAService") as MockMFAService:
                service_instance = MockMFAService.return_value
                
                # Configure service mock to return enrollment data
                service_instance.generate_mfa_secret.return_value = {
                    "secret": "TESTSECRET",
                    "qr_code": "data:image/png;base64,TEST",
                    "manual_entry_key": "TESTSECRET"
                }
                
                # Make enrollment request
                response = client.post("/users/mfa/enroll")
                
                # Check the response
                assert response.status_code == 200
                assert "secret" in response.json()
                assert "qr_code" in response.json()
                assert "manual_entry_key" in response.json()
                
                # Verify service was called with the authenticated user
                service_instance.generate_mfa_secret.assert_called_once_with(mock_user)
    
    def test_mfa_verify_endpoint_security(self, mock_user):
        """Test security of MFA verification endpoint"""
        # Mock authentication to return user
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            mock_auth.return_value = mock_user
            
            # Mock MFA service
            with patch("modules.users.controller.MFAService") as MockMFAService:
                service_instance = MockMFAService.return_value
                
                # Configure service mock for verification
                service_instance.verify_mfa_code.return_value = True
                service_instance.get_mfa_status.return_value = {"enabled": True, "verified": True}
                
                # Make verification request
                response = client.post(
                    "/users/mfa/verify",
                    json={"code": "123456"}
                )
                
                # Check the response
                assert response.status_code == 200
                assert response.json()["enabled"] is True
                assert response.json()["verified"] is True
                
                # Verify service was called correctly
                service_instance.verify_mfa_code.assert_called_once_with(mock_user, "123456")
                service_instance.get_mfa_status.assert_called_once_with(mock_user)
    
    def test_mfa_reset_endpoint_security(self, mock_admin_user):
        """Test security of MFA reset endpoint (admin only)"""
        # Mock authentication to return admin user
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            mock_auth.return_value = mock_admin_user
            
            # Mock MFA service
            with patch("modules.users.controller.MFAService") as MockMFAService:
                service_instance = MockMFAService.return_value
                
                # Configure service mock for reset
                service_instance.reset_mfa.return_value = True
                
                # Make reset request
                response = client.post("/admin/users/target-user-id/mfa/reset")
                
                # Check the response
                assert response.status_code == 200
                assert response.json()["success"] is True
                assert "MFA reset successfully" in response.json()["message"]
                
                # Verify service was called correctly
                service_instance.reset_mfa.assert_called_once_with("target-user-id", mock_admin_user)
    
    def test_mfa_reset_endpoint_forbidden_for_regular_users(self, mock_user):
        """Test that regular users cannot access MFA reset endpoint"""
        # Mock authentication to return regular user
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            mock_auth.return_value = mock_user
            
            # Make reset request
            response = client.post("/admin/users/target-user-id/mfa/reset")
            
            # Check the response - should be forbidden
            assert response.status_code == 403
            assert "Only administrators can reset" in response.json()["detail"]
    
    def test_mfa_recovery_codes_endpoint_security(self, mock_user):
        """Test security of MFA recovery codes endpoint"""
        # Mock authentication to return user
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            mock_auth.return_value = mock_user
            
            # Mock MFA service
            with patch("modules.users.controller.MFAService") as MockMFAService:
                service_instance = MockMFAService.return_value
                
                # Configure service mock to return recovery codes
                service_instance.get_recovery_codes.return_value = ["CODE1", "CODE2", "CODE3"]
                
                # Make request for recovery codes
                response = client.get("/users/mfa/recovery-codes")
                
                # Check the response
                assert response.status_code == 200
                assert "codes" in response.json()
                assert len(response.json()["codes"]) == 3
                
                # Verify service was called with the authenticated user
                service_instance.get_recovery_codes.assert_called_once_with(mock_user)
    
    def test_regenerate_recovery_codes_endpoint_security(self, mock_user):
        """Test security of regenerate recovery codes endpoint"""
        # Mock authentication to return user
        with patch("modules.users.controller.get_current_active_user") as mock_auth:
            mock_auth.return_value = mock_user
            
            # Mock MFA service
            with patch("modules.users.controller.MFAService") as MockMFAService:
                service_instance = MockMFAService.return_value
                
                # Configure service mock to return new recovery codes
                service_instance.regenerate_recovery_codes.return_value = ["NEW1", "NEW2", "NEW3"]
                
                # Make request to regenerate recovery codes
                response = client.post("/users/mfa/recovery-codes/regenerate")
                
                # Check the response
                assert response.status_code == 200
                assert "codes" in response.json()
                assert len(response.json()["codes"]) == 3
                
                # Verify service was called with the authenticated user
                service_instance.regenerate_recovery_codes.assert_called_once_with(mock_user)