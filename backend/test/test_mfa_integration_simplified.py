"""
Test suite for the MFA enrollment and verification functionality (simplified).

This test suite covers:
1. MFA enrollment process
2. MFA verification
3. Recovery code generation and usage
4. MFA settings management

Author: Claude (with human oversight)
Date: April 15, 2025
"""

import unittest
import pytest
from fastapi.testclient import TestClient
import pyotp
import time

from main import app

# Test client
client = TestClient(app)

class TestMFAIntegration(unittest.TestCase):
    """Tests for MFA integration."""
    
    def setUp(self):
        """Set up test data."""
        # Login to get tokens for different user types
        # Regular user
        response = client.post(
            "/api/auth/login",
            json={"email": "user@test.com", "password": "user123"}
        )
        self.user_token = response.json().get("token", "mock_user_token")
        
        # Admin user
        response = client.post(
            "/api/auth/login",
            json={"email": "admin@test.com", "password": "admin123"}
        )
        self.admin_token = response.json().get("token", "mock_admin_token")
        
        # MFA user (with MFA already set up)
        response = client.post(
            "/api/auth/login",
            json={"email": "mfa@test.com", "password": "mfa123"}
        )
        self.mfa_user_token = response.json().get("token", "mock_mfa_user_token")
        
        # Store test data
        self.test_secret = None
        self.recovery_codes = []
    
    def tearDown(self):
        """Clean up after tests."""
        # No cleanup needed for this simplified version
        pass
    
    def test_enroll_mfa(self):
        """Test initiating MFA enrollment."""
        print("Testing MFA enrollment")
        
        # Start MFA enrollment
        response = client.post(
            "/api/users/mfa/enroll",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("secret", data)
        self.assertIn("qrCode", data)
        self.assertTrue(data["qrCode"].startswith("data:image/png;base64,"))
        
        # Save secret for later tests
        self.test_secret = data["secret"]
    
    def test_verify_mfa_invalid_code(self):
        """Test MFA verification with invalid code."""
        print("Testing MFA verification with invalid code")
        
        # First ensure enrollment is started
        self.test_enroll_mfa()
        
        # Try to verify with invalid code
        response = client.post(
            "/api/users/mfa/verify",
            headers={"Authorization": f"Bearer {self.user_token}"},
            json={"code": "123456"}  # Hardcoded invalid code
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
    
    def test_verify_mfa_valid_code(self):
        """Test MFA verification with valid code."""
        print("Testing MFA verification with valid code")
        
        # First ensure enrollment is started
        if not self.test_secret:
            self.test_enroll_mfa()
        
        # Generate valid code using Python's TOTP implementation
        # In a real scenario, this would use the authenticator app
        totp = pyotp.TOTP(self.test_secret)
        valid_code = totp.now()
        print(f"Using valid code: {valid_code}")
        
        # Verify with valid code
        response = client.post(
            "/api/users/mfa/verify",
            headers={"Authorization": f"Bearer {self.user_token}"},
            json={"code": valid_code}
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success", False))
    
    def test_get_mfa_status(self):
        """Test getting MFA status after enrollment and verification."""
        print("Testing MFA status")
        
        # First ensure MFA is set up
        self.test_verify_mfa_valid_code()
        
        # Get MFA status
        response = client.get(
            "/api/users/mfa/status",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("enabled", False))
    
    def test_get_recovery_codes(self):
        """Test getting recovery codes."""
        print("Testing recovery codes")
        
        # First ensure MFA is set up
        self.test_verify_mfa_valid_code()
        
        # Get recovery codes
        response = client.get(
            "/api/users/mfa/recovery-codes",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("recoveryCodes", data)
        self.assertIsInstance(data["recoveryCodes"], list)
        self.assertGreater(len(data["recoveryCodes"]), 0)
        
        # Save one code for later tests
        self.recovery_codes = data["recoveryCodes"]
    
    def test_regenerate_recovery_codes(self):
        """Test regenerating recovery codes."""
        print("Testing regenerating recovery codes")
        
        # First ensure MFA is set up and we have the original codes
        self.test_get_recovery_codes()
        original_codes = self.recovery_codes
        
        # Regenerate codes
        response = client.post(
            "/api/users/mfa/recovery-codes/regenerate",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("recoveryCodes", data)
        new_codes = data["recoveryCodes"]
        
        # New codes should be different from original
        self.assertNotEqual(set(original_codes), set(new_codes))
        
        # Save new codes for later tests
        self.recovery_codes = new_codes
    
    def test_login_with_recovery_code(self):
        """Test logging in with a recovery code."""
        print("Testing login with recovery code")
        
        # First ensure we have recovery codes
        if not self.recovery_codes:
            self.test_get_recovery_codes()
        
        # Attempt login with recovery code
        recovery_code = self.recovery_codes[0]
        response = client.post(
            "/api/auth/login/recovery",
            json={
                "email": "user@test.com",
                "password": "user123",
                "recoveryCode": recovery_code
            }
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.json())
    
    def test_disable_mfa(self):
        """Test disabling MFA."""
        print("Testing MFA disabling")
        
        # First ensure MFA is set up
        self.test_verify_mfa_valid_code()
        
        # Disable MFA
        response = client.post(
            "/api/users/mfa/disable",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success", False))
        
        # Verify MFA is now disabled
        status_response = client.get(
            "/api/users/mfa/status",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        
        self.assertEqual(status_response.status_code, 200)
        self.assertFalse(status_response.json().get("enabled", True))
    
    def test_admin_reset_user_mfa(self):
        """Test admin resetting a user's MFA."""
        print("Testing admin MFA reset")
        
        # Reset MFA for the MFA test user
        response = client.post(
            "/api/admin/users/mfa-test-id/mfa/reset",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success", False))
    
    def test_admin_mfa_settings(self):
        """Test admin getting and updating MFA settings."""
        print("Testing admin MFA settings")
        
        # Get current settings
        get_response = client.get(
            "/api/admin/mfa/settings",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        self.assertEqual(get_response.status_code, 200)
        current_settings = get_response.json()
        self.assertIn("requireMFA", current_settings)
        
        # Update settings with opposite values
        new_settings = {
            "requireMFA": not current_settings["requireMFA"],
            "enableRecoveryCodes": not current_settings["enableRecoveryCodes"],
            "mfaGracePeriodDays": 14
        }
        
        update_response = client.put(
            "/api/admin/mfa/settings",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            json=new_settings
        )
        
        self.assertEqual(update_response.status_code, 200)
        updated_settings = update_response.json()
        self.assertEqual(updated_settings["requireMFA"], new_settings["requireMFA"])
        self.assertEqual(updated_settings["mfaGracePeriodDays"], new_settings["mfaGracePeriodDays"])

if __name__ == "__main__":
    unittest.main()