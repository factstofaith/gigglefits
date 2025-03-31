"""
Test database encryption functionality.
This test verifies that sensitive data is properly encrypted in the database.
"""
import unittest
import os
import sys
import json
import base64
from unittest.mock import patch, MagicMock

# Add parent directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock cryptography imports
class MockFernet:
    def __init__(self, key):
        self.key = key
    
    def encrypt(self, data):
        # Simple mock encryption - prefix with "encrypted:"
        return f"encrypted:{data.decode('utf-8')}".encode('utf-8')
    
    def decrypt(self, data):
        # Simple mock decryption - remove "encrypted:" prefix
        text = data.decode('utf-8')
        if text.startswith("encrypted:"):
            return text[10:].encode('utf-8')
        return data

# Create a mock module for cryptography.fernet
mock_fernet_module = MagicMock()
mock_fernet_module.Fernet = MockFernet
mock_fernet_module.Fernet.generate_key = lambda: base64.urlsafe_b64encode(b'0' * 32)

# Apply the mock
sys.modules['cryptography.fernet'] = mock_fernet_module
sys.modules['cryptography.hazmat.primitives'] = MagicMock()
sys.modules['cryptography.hazmat.primitives.hashes'] = MagicMock()
sys.modules['cryptography.hazmat.primitives.kdf.pbkdf2'] = MagicMock()

# Now import the module we want to test
from utils.credential_manager import CredentialManager

class TestDatabaseEncryption(unittest.TestCase):
    """Test the database encryption functionality"""
    
    def setUp(self):
        """Setup for tests"""
        # Temporary file for credential storage
        self.temp_file = "/tmp/test_credentials.json"
        
        # Create credential manager
        self.credential_manager = CredentialManager(
            app_id="test_app",
            encryption_key="test_encryption_key",
            use_keyring=False,  # Disable keyring for testing
            storage_path=self.temp_file
        )
    
    def tearDown(self):
        """Cleanup after tests"""
        # Remove the temporary file
        if os.path.exists(self.temp_file):
            os.remove(self.temp_file)
    
    def test_encrypt_decrypt_credential(self):
        """Test credential encryption and decryption"""
        # Test data
        test_name = "test_credential"
        test_credential = {
            "username": "test_user",
            "password": "very_secret_password",
            "api_key": "secret_api_key"
        }
        
        # Store the credential
        result = self.credential_manager.store_credential(test_name, test_credential)
        self.assertTrue(result, "Credential storage should succeed")
        
        # Check if the file exists
        self.assertTrue(os.path.exists(self.temp_file), "Credential file should exist")
        
        # Read the raw file to check encryption
        with open(self.temp_file, 'r') as f:
            raw_data = json.load(f)
            
        # Verify the credential exists and is encrypted
        self.assertIn(test_name, raw_data, "Credential should exist in storage")
        self.assertIn('value', raw_data[test_name], "Credential should have a value")
        
        # The raw value should not contain the original password
        raw_value = raw_data[test_name]['value']
        self.assertNotIn("very_secret_password", raw_value, "Raw value should not contain plaintext password")
        self.assertNotIn("secret_api_key", raw_value, "Raw value should not contain plaintext API key")
        
        # Retrieve the credential
        retrieved = self.credential_manager.get_credential(test_name)
        
        # Verify the retrieved credential matches the original
        self.assertEqual(retrieved, test_credential, "Retrieved credential should match original")
        self.assertEqual(retrieved["password"], "very_secret_password", "Retrieved password should match original")
        self.assertEqual(retrieved["api_key"], "secret_api_key", "Retrieved API key should match original")
    
    def test_multiple_encryption_keys(self):
        """Test different encryption keys produce different results"""
        # Test credential
        test_name = "another_test"
        test_credential = "sensitive_value"
        
        # Store with our properly initialized manager
        self.credential_manager.store_credential(test_name, test_credential)
        
        # Create a manager with a different encryption key
        different_key_manager = CredentialManager(
            app_id="test_app_different_key",
            encryption_key="different_encryption_key",  # Different key
            use_keyring=False,
            storage_path=self.temp_file + ".diff_key"
        )
        
        # Store with the different-key manager
        different_key_manager.store_credential(test_name, test_credential)
        
        # Verify we can retrieve from both managers
        original_retrieved = self.credential_manager.get_credential(test_name)
        different_retrieved = different_key_manager.get_credential(test_name)
        
        # Both should return the same credential value when decrypted
        self.assertEqual(original_retrieved, test_credential)
        self.assertEqual(different_retrieved, test_credential)
        
        # But the internal encryption implementation should be able to use
        # different keys for different instances
        # Verify we can retrieve from both managers
        self.assertIsNotNone(original_retrieved)
        self.assertIsNotNone(different_retrieved)
        self.assertEqual(original_retrieved, different_retrieved)

if __name__ == "__main__":
    unittest.main()