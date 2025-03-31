"""
Minimal credential manager test script.

This test script focuses on the core credential type handling issues
without dependencies on the entire test framework.
"""

import sys
import os
import unittest
import json
from datetime import datetime, timezone
from enum import Enum
import uuid

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from test_adapters.credential_manager import CredentialManager, CredentialType
from test_adapters.entity_registry import EntityRegistry
from test_adapters.security_test_framework import SecureTestEnvironment

class TestCredentialTypeHandling(unittest.TestCase):
    """Test cases for credential type normalization."""
    
    def setUp(self):
        """Set up test environment."""
        # Create secure environment
        self.secure_env = SecureTestEnvironment(debug=True)
        
        # Create registry
        self.registry = EntityRegistry()
        
        # Create credential manager
        self.manager = CredentialManager(registry=self.registry)
        self.manager.secure_env = self.secure_env
        
        # Test data
        self.test_tenant_id = "test-tenant-1"
        self.test_user_id = "test-user-1"
        self.test_data = {
            "username": "test_user",
            "password": "test_password",
            "api_key": "test_api_key"
        }
        
        # Pre-populate user permissions directly
        if self.test_user_id not in self.manager.user_permissions:
            self.manager.user_permissions[self.test_user_id] = {}
            
        # Pre-populate tenant credentials
        if self.test_tenant_id not in self.manager.tenant_credentials:
            self.manager.tenant_credentials[self.test_tenant_id] = []
    
    def tearDown(self):
        """Clean up after test."""
        self.secure_env.reset()
    
    def test_enum_to_string(self):
        """Test converting enum to string."""
        # When using enum directly
        cred_type = CredentialType.API_KEY
        cred_type_str = cred_type.value
        
        self.assertEqual(cred_type_str, "api_key")
        
    def test_store_with_enum_type(self):
        """Test storing credential with enum type."""
        # Store with enum type
        result = self.manager.store_credential(
            name="Test Enum Type",
            credential_data=self.test_data.copy(),
            credential_type=CredentialType.API_KEY,
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(result["success"])
        
        # Retrieve and verify type is enum
        credential_id = result["credential_id"]
        
        retrieve_result = self.manager.retrieve_credential(
            credential_id=credential_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(retrieve_result["success"])
        self.assertEqual(retrieve_result["type"], CredentialType.API_KEY)
        
    def test_store_with_string_type(self):
        """Test storing credential with string type."""
        # Store with string type
        result = self.manager.store_credential(
            name="Test String Type",
            credential_data=self.test_data.copy(),
            credential_type="api_key",
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(result["success"])
        
        # Retrieve and verify type is normalized to enum
        credential_id = result["credential_id"]
        
        retrieve_result = self.manager.retrieve_credential(
            credential_id=credential_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(retrieve_result["success"])
        self.assertEqual(retrieve_result["type"], CredentialType.API_KEY)
        
    def test_equivalent_types(self):
        """Test handling equivalent credential types."""
        # Store with api_credentials type (equivalent to API_KEY)
        result = self.manager.store_credential(
            name="Test Equivalent Type",
            credential_data=self.test_data.copy(),
            credential_type="api_credentials",
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(result["success"])
        
        # Retrieve and verify type is normalized to API_KEY
        credential_id = result["credential_id"]
        
        retrieve_result = self.manager.retrieve_credential(
            credential_id=credential_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(retrieve_result["success"])
        self.assertEqual(retrieve_result["type"], CredentialType.API_KEY)
        
    def test_list_credentials_with_type_filter(self):
        """Test listing credentials with type filter."""
        # Store credentials with different types
        api_result = self.manager.store_credential(
            name="Test API Key",
            credential_data={"api_key": "test_api_key"},
            credential_type=CredentialType.API_KEY,
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id
        )
        
        db_result = self.manager.store_credential(
            name="Test Database",
            credential_data={"username": "db_user", "password": "db_pass"},
            credential_type=CredentialType.DATABASE,
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id
        )
        
        # List all credentials
        list_result = self.manager.list_credentials(
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(list_result["success"])
        # We should have at least 2 credentials (could be more due to test setup)
        self.assertGreaterEqual(len(list_result["credentials"]), 2)
        
        # List with API_KEY filter - enum
        list_api_result = self.manager.list_credentials(
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id,
            credential_type=CredentialType.API_KEY
        )
        
        self.assertTrue(list_api_result["success"])
        # There should be at least 1 API_KEY credential
        self.assertGreaterEqual(len(list_api_result["credentials"]), 1)
        
        # Check if our named credential is in the results
        api_key_names = [cred["name"] for cred in list_api_result["credentials"]]
        self.assertIn("Test API Key", api_key_names)
        
        # List with string type filter
        list_db_result = self.manager.list_credentials(
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id,
            credential_type="database"  # String type
        )
        
        self.assertTrue(list_db_result["success"])
        # There should be at least 1 DATABASE credential
        self.assertGreaterEqual(len(list_db_result["credentials"]), 1)
        
        # Check if our named credential is in the results
        db_names = [cred["name"] for cred in list_db_result["credentials"]]
        self.assertIn("Test Database", db_names)

class TestDataFormatHandling(unittest.TestCase):
    """Test cases for credential data format handling."""
    
    def setUp(self):
        """Set up test environment."""
        # Create secure environment
        self.secure_env = SecureTestEnvironment(debug=True)
        
        # Create registry
        self.registry = EntityRegistry()
        
        # Create credential manager
        self.manager = CredentialManager(registry=self.registry)
        self.manager.secure_env = self.secure_env
        
        # Test data
        self.test_tenant_id = "test-tenant-1"
        self.test_user_id = "test-user-1"
        
        # Pre-populate user permissions directly
        if self.test_user_id not in self.manager.user_permissions:
            self.manager.user_permissions[self.test_user_id] = {}
            
        # Pre-populate tenant credentials
        if self.test_tenant_id not in self.manager.tenant_credentials:
            self.manager.tenant_credentials[self.test_tenant_id] = []
    
    def tearDown(self):
        """Clean up after test."""
        self.secure_env.reset()
    
    def test_dict_data_storage_retrieval(self):
        """Test storing and retrieving dictionary data."""
        # Dictionary data
        dict_data = {"username": "test_user", "password": "test_pass", "api_key": "test_api_key"}
        
        # Store the data
        result = self.manager.store_credential(
            name="Dict Data Test",
            credential_data=dict_data,
            credential_type=CredentialType.API_KEY,
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(result["success"])
        
        # Retrieve and verify data
        credential_id = result["credential_id"]
        
        retrieve_result = self.manager.retrieve_credential(
            credential_id=credential_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(retrieve_result["success"])
        self.assertTrue(isinstance(retrieve_result["data"], dict))
        
        # Check each key
        for key, value in dict_data.items():
            self.assertTrue(key in retrieve_result["data"])
            self.assertEqual(retrieve_result["data"][key], value)
    
    def test_json_data_storage_retrieval(self):
        """Test storing and retrieving JSON data."""
        # JSON string data
        json_data = json.dumps({"username": "json_user", "password": "json_pass"})
        
        # Store as string
        result = self.manager.store_credential(
            name="JSON Data Test",
            credential_data=json_data,
            credential_type=CredentialType.API_KEY,
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(result["success"])
        
        # Retrieve and verify data is parsed as dictionary
        credential_id = result["credential_id"]
        
        retrieve_result = self.manager.retrieve_credential(
            credential_id=credential_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(retrieve_result["success"])
        
        # Either the data is a dictionary or it contains the original string
        if isinstance(retrieve_result["data"], dict):
            self.assertTrue("username" in retrieve_result["data"])
            self.assertEqual(retrieve_result["data"]["username"], "json_user")
        else:
            self.assertTrue("json_user" in str(retrieve_result["data"]))
            self.assertTrue("json_pass" in str(retrieve_result["data"]))
    
    def test_update_dict_with_string(self):
        """Test updating dictionary data with string data."""
        # Initial dict data
        dict_data = {"username": "test_user", "password": "test_pass"}
        
        # Store initial data
        result = self.manager.store_credential(
            name="Update Format Test",
            credential_data=dict_data,
            credential_type=CredentialType.API_KEY,
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id
        )
        
        credential_id = result["credential_id"]
        
        # Update with string data
        string_data = "updated_data_string"
        
        update_result = self.manager.update_credential(
            credential_id=credential_id,
            credential_data=string_data,
            user_id=self.test_user_id
        )
        
        self.assertTrue(update_result["success"])
        
        # Retrieve and verify data handling
        retrieve_result = self.manager.retrieve_credential(
            credential_id=credential_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(retrieve_result["success"])
        
        # The data should contain the string in some form
        data_str = str(retrieve_result["data"])
        self.assertTrue("updated_data_string" in data_str)

class TestPermissionHandling(unittest.TestCase):
    """Test cases for credential permission handling."""
    
    def setUp(self):
        """Set up test environment."""
        # Create secure environment
        self.secure_env = SecureTestEnvironment(debug=True)
        
        # Create registry
        self.registry = EntityRegistry()
        
        # Create credential manager
        self.manager = CredentialManager(registry=self.registry)
        self.manager.secure_env = self.secure_env
        
        # User IDs
        self.owner_user_id = "test-owner"
        self.reader_user_id = "test-reader"
        
        # Tenant ID
        self.test_tenant_id = "test-tenant-1"
        
        # Test data
        self.test_data = {"username": "test_user", "password": "test_pass"}
        
        # Store a credential
        result = self.manager.store_credential(
            name="Permission Test",
            credential_data=self.test_data,
            credential_type=CredentialType.API_KEY,
            tenant_id=self.test_tenant_id,
            user_id=self.owner_user_id
        )
        
        self.test_credential_id = result["credential_id"]
        
        # Set up reader permissions
        self.manager.set_user_permissions(
            user_id=self.reader_user_id,
            credential_id=self.test_credential_id,
            permissions=["read"]
        )
    
    def tearDown(self):
        """Clean up after test."""
        self.secure_env.reset()
    
    def test_owner_permissions(self):
        """Test owner permissions."""
        # Owner should be able to read
        read_result = self.manager.retrieve_credential(
            credential_id=self.test_credential_id,
            user_id=self.owner_user_id
        )
        
        self.assertTrue(read_result["success"])
        
        # Owner should be able to update
        update_result = self.manager.update_credential(
            credential_id=self.test_credential_id,
            credential_data={"username": "updated_username"},
            user_id=self.owner_user_id
        )
        
        self.assertTrue(update_result["success"])
        
        # Owner should be able to delete
        delete_result = self.manager.delete_credential(
            credential_id=self.test_credential_id,
            user_id=self.owner_user_id
        )
        
        self.assertTrue(delete_result["success"])
    
    def test_reader_permissions(self):
        """Test reader permissions."""
        # Reader should be able to read
        read_result = self.manager.retrieve_credential(
            credential_id=self.test_credential_id,
            user_id=self.reader_user_id
        )
        
        self.assertTrue(read_result["success"])
        
        # Reader should not be able to update
        update_result = self.manager.update_credential(
            credential_id=self.test_credential_id,
            credential_data={"username": "reader_update_attempt"},
            user_id=self.reader_user_id
        )
        
        self.assertFalse(update_result["success"])
        self.assertTrue("Access denied" in update_result.get("error", ""))
        
        # Reader should not be able to delete
        delete_result = self.manager.delete_credential(
            credential_id=self.test_credential_id,
            user_id=self.reader_user_id
        )
        
        self.assertFalse(delete_result["success"])
        self.assertTrue("Access denied" in delete_result.get("error", ""))
    
    def test_nonexistent_user_permissions(self):
        """Test permissions for nonexistent user."""
        # Nonexistent user should not be able to read
        read_result = self.manager.retrieve_credential(
            credential_id=self.test_credential_id,
            user_id="nonexistent-user"
        )
        
        self.assertFalse(read_result["success"])
        self.assertTrue("Access denied" in read_result.get("error", "") or 
                        "not found" in read_result.get("error", ""))

class TestAPIKeyGeneration(unittest.TestCase):
    """Test cases for API key generation."""
    
    def setUp(self):
        """Set up test environment."""
        # Create secure environment
        self.secure_env = SecureTestEnvironment(debug=True)
        
        # Create registry
        self.registry = EntityRegistry()
        
        # Create credential manager
        self.manager = CredentialManager(registry=self.registry)
        self.manager.secure_env = self.secure_env
        
        # Test data
        self.test_tenant_id = "test-tenant-1"
        self.test_user_id = "test-user-1"
    
    def tearDown(self):
        """Clean up after test."""
        self.secure_env.reset()
    
    def test_generate_api_key(self):
        """Test generating API key."""
        # Generate an API key
        result = self.manager.generate_tenant_api_key(
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id,
            name="Generated API Key"
        )
        
        self.assertTrue(result["success"])
        self.assertTrue("credential_id" in result)
        self.assertTrue("api_key" in result)
        self.assertEqual(result["name"], "Generated API Key")
        self.assertEqual(result["type"], CredentialType.API_KEY)
        
        # Verify the generated key exists
        credential_id = result["credential_id"]
        
        # Credentials should be in metadata
        self.assertTrue(credential_id in self.manager.credential_metadata)
        
        # Verify tenant association
        self.assertTrue(credential_id in self.manager.tenant_credentials.get(self.test_tenant_id, []))
        
        # Verify user permissions
        self.assertTrue(credential_id in self.manager.user_permissions.get(self.test_user_id, {}))
        
        # Verify API key format
        api_key = result["api_key"]
        self.assertTrue(api_key.startswith("tap_"))
    
    def test_api_key_retrieval(self):
        """Test retrieving generated API key."""
        # Generate an API key
        result = self.manager.generate_tenant_api_key(
            tenant_id=self.test_tenant_id,
            user_id=self.test_user_id,
            name="Retrieval Test Key"
        )
        
        credential_id = result["credential_id"]
        api_key = result["api_key"]
        
        # Retrieve the API key credential
        retrieve_result = self.manager.retrieve_credential(
            credential_id=credential_id,
            user_id=self.test_user_id
        )
        
        self.assertTrue(retrieve_result["success"])
        self.assertEqual(retrieve_result["type"], CredentialType.API_KEY)
        
        # API key should be in the data
        if isinstance(retrieve_result["data"], dict):
            self.assertTrue("api_key" in retrieve_result["data"])
            self.assertEqual(retrieve_result["data"]["api_key"], api_key)
        else:
            self.assertTrue(api_key in str(retrieve_result["data"]))

if __name__ == "__main__":
    unittest.main()