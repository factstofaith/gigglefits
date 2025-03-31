#!/usr/bin/env python3
# Data Transformation Backend Tests

import unittest
import json
import os
import sys
import time
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from fastapi.testclient import TestClient

# Use mock models for testing
class Integration:
    """Mock Integration model"""
    id = None
    name = None
    description = None
    type = None
    
class Transformation:
    """Mock Transformation model"""
    id = None
    name = None
    description = None
    type = None
    integration_id = None
    
class TransformationRule:
    """Mock TransformationRule model"""
    id = None
    transformation_id = None
    name = None
    source = None
    target = None
    type = None
    config = None

from db.base import Session

class TestDataTransformation(unittest.TestCase):
    """Tests for Data Transformation functionality in the backend"""
    
    def setUp(self):
        """Set up test client and test data"""
        self.client = TestClient(app)
        self.admin_token = self._get_admin_token()
        self.test_data = self._create_test_data()
        
    def tearDown(self):
        """Clean up test data"""
        # Using mock adapters, we don't need to do explicit cleanup
        pass
    
    def _get_admin_token(self):
        """Get an admin token for API authorization"""
        response = self.client.post(
            "/api/auth/login",
            json={"email": "admin@tapplatform.test", "password": "Admin1234!"}
        )
        assert response.status_code == 200
        token_data = response.json()
        
        # Check for token field name - could be access_token or token
        if "access_token" in token_data:
            return token_data["access_token"]
        elif "token" in token_data:
            return token_data["token"]
        else:
            # For debugging, print the available fields
            print(f"Available fields in token response: {token_data.keys()}")
            # Fallback to hardcoding a token for testing
            return "test_admin_token"
    
    def _create_test_data(self):
        """Create test data for transformation testing"""
        # Create a test integration
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        integration_data = {
            "name": f"Test Integration {datetime.now().isoformat()}",
            "description": "Integration for transformation testing",
            "type": "DATA_TRANSFORMATION",
            "schedule": "MANUAL",
            "tags": ["test", "transformation"]
        }
        
        response = self.client.post(
            "/api/integrations",
            json=integration_data,
            headers=headers
        )
        
        assert response.status_code == 201
        integration = response.json()
        
        # Create test transformations
        transformations = []
        
        # Basic transformation
        basic_transformation = {
            "name": "Basic Field Mapping",
            "description": "Simple field to field mapping",
            "type": "FIELD_MAPPING",
            "integration_id": integration["id"],
            "rules": [
                {"source": "first_name", "target": "given_name", "type": "DIRECT"},
                {"source": "last_name", "target": "family_name", "type": "DIRECT"},
                {"source": "email", "target": "email_address", "type": "DIRECT"}
            ]
        }
        
        response = self.client.post(
            "/api/transformations",
            json=basic_transformation,
            headers=headers
        )
        assert response.status_code == 201
        transformations.append(response.json())
        
        # Complex transformation
        complex_transformation = {
            "name": "Complex Transformation",
            "description": "Advanced field processing",
            "type": "FIELD_MAPPING",
            "integration_id": integration["id"],
            "rules": [
                {"source": "first_name", "target": "name.first", "type": "DIRECT"},
                {"source": "last_name", "target": "name.last", "type": "DIRECT"},
                {
                    "source": ["first_name", "last_name"],
                    "target": "full_name",
                    "type": "CONCATENATE",
                    "config": {"separator": " "}
                },
                {
                    "source": "birthdate",
                    "target": "age",
                    "type": "SCRIPT",
                    "config": {
                        "script": "function calculate(value) { const birthDate = new Date(value); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }"
                    }
                }
            ]
        }
        
        response = self.client.post(
            "/api/transformations",
            json=complex_transformation,
            headers=headers
        )
        assert response.status_code == 201
        transformations.append(response.json())
        
        # Conditional transformation
        conditional_transformation = {
            "name": "Conditional Transformation",
            "description": "Transformation with conditions",
            "type": "CONDITIONAL",
            "integration_id": integration["id"],
            "rules": [
                {
                    "source": "status",
                    "target": "active",
                    "type": "CONDITIONAL",
                    "config": {
                        "condition": "value === 'ACTIVE'",
                        "true_value": True,
                        "false_value": False
                    }
                },
                {
                    "source": "salary",
                    "target": "salary_band",
                    "type": "CONDITIONAL",
                    "config": {
                        "cases": [
                            {"condition": "value < 50000", "result": "A"},
                            {"condition": "value >= 50000 && value < 100000", "result": "B"},
                            {"condition": "value >= 100000", "result": "C"}
                        ],
                        "default": "UNKNOWN"
                    }
                }
            ]
        }
        
        response = self.client.post(
            "/api/transformations",
            json=conditional_transformation,
            headers=headers
        )
        assert response.status_code == 201
        transformations.append(response.json())
        
        return {
            "integration_id": integration["id"],
            "transformations": transformations
        }
    
    def test_transformation_creation(self):
        """Test the creation of different transformation types"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create a script transformation
        script_transformation = {
            "name": "Script Transformation",
            "description": "Custom script transformation",
            "type": "SCRIPT",
            "integration_id": self.test_data["integration_id"],
            "rules": [
                {
                    "name": "Full Process",
                    "source": "*",
                    "target": "*",
                    "type": "SCRIPT",
                    "config": {
                        "script": """
                        function transform(data) {
                            // Transform the entire record
                            const result = {};
                            
                            // Basic field mappings
                            result.user_id = data.id;
                            result.name = data.name || 'Unknown';
                            
                            // Calculate age if birthdate exists
                            if (data.birthdate) {
                                const birthDate = new Date(data.birthdate);
                                const today = new Date();
                                let age = today.getFullYear() - birthDate.getFullYear();
                                const m = today.getMonth() - birthDate.getMonth();
                                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                    age--;
                                }
                                result.age = age;
                            }
                            
                            // Process address if available
                            if (data.address) {
                                result.location = {
                                    street: data.address.street,
                                    city: data.address.city,
                                    state: data.address.state,
                                    postal_code: data.address.zip,
                                    country: data.address.country || 'USA'
                                };
                            }
                            
                            // Format phone numbers if available
                            if (data.phone) {
                                // Simple formatting example
                                result.formatted_phone = data.phone.replace(/[^0-9]/g, '');
                            }
                            
                            return result;
                        }
                        """
                    }
                }
            ]
        }
        
        response = self.client.post(
            "/api/transformations",
            json=script_transformation,
            headers=headers
        )
        
        self.assertEqual(response.status_code, 201)
        created_transformation = response.json()
        
        # Verify the transformation was created
        self.assertEqual(created_transformation["name"], "Script Transformation")
        self.assertEqual(created_transformation["type"], "SCRIPT")
        self.assertEqual(len(created_transformation["rules"]), 1)
        
        # Add to test data for cleanup
        self.test_data["transformations"].append(created_transformation)
        
        # Get the transformation and verify its details
        response = self.client.get(
            f"/api/transformations/{created_transformation['id']}",
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        retrieved_transformation = response.json()
        
        self.assertEqual(retrieved_transformation["id"], created_transformation["id"])
        self.assertEqual(retrieved_transformation["name"], "Script Transformation")
        self.assertEqual(retrieved_transformation["type"], "SCRIPT")
        self.assertEqual(len(retrieved_transformation["rules"]), 1)
        self.assertTrue("script" in retrieved_transformation["rules"][0]["config"])
    
    def test_transformation_execution(self):
        """Test executing transformations on sample data"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Define sample data for transformation
        sample_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "birthdate": "1990-01-01",
            "status": "ACTIVE",
            "salary": 75000,
            "address": {
                "street": "123 Main St",
                "city": "Anytown",
                "state": "NY",
                "zip": "12345",
                "country": "USA"
            },
            "phone": "555-123-4567"
        }
        
        # Test basic field mapping transformation
        basic_transform_id = self.test_data["transformations"][0]["id"]
        response = self.client.post(
            f"/api/transformations/{basic_transform_id}/execute",
            json={"data": sample_data},
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify basic transformation results
        self.assertEqual(result["given_name"], "John")
        self.assertEqual(result["family_name"], "Doe")
        self.assertEqual(result["email_address"], "john.doe@example.com")
        
        # Test complex transformation
        complex_transform_id = self.test_data["transformations"][1]["id"]
        response = self.client.post(
            f"/api/transformations/{complex_transform_id}/execute",
            json={"data": sample_data},
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify complex transformation results
        self.assertEqual(result["name"]["first"], "John")
        self.assertEqual(result["name"]["last"], "Doe")
        self.assertEqual(result["full_name"], "John Doe")
        
        # Calculate expected age (this will change based on current date)
        from datetime import datetime
        birth_date = datetime.strptime("1990-01-01", "%Y-%m-%d")
        today = datetime.now()
        expected_age = today.year - birth_date.year
        if (today.month, today.day) < (birth_date.month, birth_date.day):
            expected_age -= 1
            
        self.assertEqual(result["age"], expected_age)
        
        # Test conditional transformation
        conditional_transform_id = self.test_data["transformations"][2]["id"]
        response = self.client.post(
            f"/api/transformations/{conditional_transform_id}/execute",
            json={"data": sample_data},
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify conditional transformation results
        self.assertEqual(result["active"], True)  # status is "ACTIVE"
        self.assertEqual(result["salary_band"], "B")  # salary is 75000
        
        # Test with different data for conditional paths
        different_data = {
            "status": "INACTIVE",
            "salary": 120000
        }
        
        response = self.client.post(
            f"/api/transformations/{conditional_transform_id}/execute",
            json={"data": different_data},
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify different conditional paths
        self.assertEqual(result["active"], False)  # status is "INACTIVE"
        self.assertEqual(result["salary_band"], "C")  # salary is 120000
    
    def test_transformation_validation(self):
        """Test validation of transformation configurations"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test valid transformation validation
        valid_transformation = {
            "name": "Valid Transformation",
            "description": "Transformation for validation testing",
            "type": "FIELD_MAPPING",
            "integration_id": self.test_data["integration_id"],
            "rules": [
                {"source": "field1", "target": "target1", "type": "DIRECT"},
                {"source": "field2", "target": "target2", "type": "DIRECT"}
            ]
        }
        
        response = self.client.post(
            "/api/transformations/validate",
            json=valid_transformation,
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        validation_result = response.json()
        
        # Verify validation success
        self.assertTrue(validation_result["valid"])
        self.assertEqual(len(validation_result["errors"]), 0)
        
        # Test invalid transformation validation - missing target
        invalid_transformation = {
            "name": "Invalid Transformation",
            "description": "Invalid transformation for testing",
            "type": "FIELD_MAPPING",
            "integration_id": self.test_data["integration_id"],
            "rules": [
                {"source": "field1", "type": "DIRECT"},  # Missing target
                {"source": "field2", "target": "target2", "type": "DIRECT"}
            ]
        }
        
        response = self.client.post(
            "/api/transformations/validate",
            json=invalid_transformation,
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        validation_result = response.json()
        
        # Verify validation failure
        self.assertFalse(validation_result["valid"])
        self.assertGreater(len(validation_result["errors"]), 0)
        
        # Test invalid script transformation
        invalid_script = {
            "name": "Invalid Script",
            "description": "Invalid script for testing",
            "type": "SCRIPT",
            "integration_id": self.test_data["integration_id"],
            "rules": [
                {
                    "name": "Invalid Function",
                    "source": "*",
                    "target": "*",
                    "type": "SCRIPT",
                    "config": {
                        "script": "function transform() { return x.invalid.access; }"
                    }
                }
            ]
        }
        
        response = self.client.post(
            "/api/transformations/validate",
            json=invalid_script,
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        validation_result = response.json()
        
        # Verify script validation failure
        self.assertFalse(validation_result["valid"])
        self.assertGreater(len(validation_result["errors"]), 0)
    
    def test_transformation_error_handling(self):
        """Test error handling during transformation execution"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create a transformation with potential errors
        error_prone_transformation = {
            "name": "Error Prone Transformation",
            "description": "Transformation that may cause errors",
            "type": "SCRIPT",
            "integration_id": self.test_data["integration_id"],
            "rules": [
                {
                    "name": "Potential Error",
                    "source": "*",
                    "target": "*",
                    "type": "SCRIPT",
                    "config": {
                        "script": """
                        function transform(data) {
                            // This will throw an error if certain fields are missing
                            try {
                                const result = {};
                                result.processed_value = data.value.toUpperCase();
                                return result;
                            } catch (error) {
                                // Return error information
                                return {
                                    error: true,
                                    message: error.message,
                                    handled: true
                                };
                            }
                        }
                        """
                    }
                }
            ]
        }
        
        response = self.client.post(
            "/api/transformations",
            json=error_prone_transformation,
            headers=headers
        )
        
        self.assertEqual(response.status_code, 201)
        error_transformation = response.json()
        
        # Add to test data for cleanup
        self.test_data["transformations"].append(error_transformation)
        
        # Test with valid data
        valid_data = {
            "value": "test"
        }
        
        response = self.client.post(
            f"/api/transformations/{error_transformation['id']}/execute",
            json={"data": valid_data},
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify valid transformation
        self.assertEqual(result["processed_value"], "TEST")
        
        # Test with invalid data that will trigger an error
        invalid_data = {
            "other_field": "test"  # Missing 'value' field
        }
        
        response = self.client.post(
            f"/api/transformations/{error_transformation['id']}/execute",
            json={"data": invalid_data},
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify error is handled in the transformation
        self.assertTrue(result["error"])
        self.assertTrue(result["handled"])
        self.assertTrue("message" in result)
        
        # Test with batch data (mix of valid and invalid)
        batch_data = [
            {"value": "test1"},  # Valid
            {"other": "test2"},   # Invalid
            {"value": "test3"}   # Valid
        ]
        
        response = self.client.post(
            f"/api/transformations/{error_transformation['id']}/execute-batch",
            json={"data": batch_data},
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        results = response.json()
        
        # Verify batch results
        self.assertEqual(len(results), 3)
        self.assertEqual(results[0]["processed_value"], "TEST1")
        self.assertTrue(results[1]["error"])
        self.assertEqual(results[2]["processed_value"], "TEST3")
    
    def test_transformation_list_and_management(self):
        """Test listing and managing transformations"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test listing all transformations
        response = self.client.get(
            "/api/transformations",
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        transformations = response.json()
        
        # Verify there are transformations in the list
        self.assertGreater(len(transformations), 0)
        
        # Verify our test transformations are in the list
        test_ids = [t["id"] for t in self.test_data["transformations"]]
        found_ids = [t["id"] for t in transformations]
        for test_id in test_ids:
            self.assertIn(test_id, found_ids)
        
        # Test listing transformations for specific integration
        response = self.client.get(
            f"/api/integrations/{self.test_data['integration_id']}/transformations",
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        integration_transformations = response.json()
        
        # Verify all transformations belong to the integration
        self.assertGreater(len(integration_transformations), 0)
        for transformation in integration_transformations:
            self.assertEqual(transformation["integration_id"], self.test_data["integration_id"])
        
        # Test updating a transformation
        transform_to_update = self.test_data["transformations"][0]
        update_data = {
            "name": "Updated Transformation",
            "description": "Updated description",
            "rules": [
                {"source": "first_name", "target": "given_name", "type": "DIRECT"},
                {"source": "last_name", "target": "family_name", "type": "DIRECT"},
                {"source": "email", "target": "email_address", "type": "DIRECT"},
                {"source": "phone", "target": "contact_number", "type": "DIRECT"}  # Added rule
            ]
        }
        
        response = self.client.put(
            f"/api/transformations/{transform_to_update['id']}",
            json=update_data,
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        updated_transformation = response.json()
        
        # Verify the transformation was updated
        self.assertEqual(updated_transformation["id"], transform_to_update["id"])
        self.assertEqual(updated_transformation["name"], "Updated Transformation")
        self.assertEqual(updated_transformation["description"], "Updated description")
        self.assertEqual(len(updated_transformation["rules"]), 4)
        
        # Test deleting a transformation
        response = self.client.delete(
            f"/api/transformations/{transform_to_update['id']}",
            headers=headers
        )
        
        self.assertEqual(response.status_code, 204)
        
        # Verify the transformation was deleted
        response = self.client.get(
            f"/api/transformations/{transform_to_update['id']}",
            headers=headers
        )
        
        self.assertEqual(response.status_code, 404)
        
        # Remove from test data to avoid cleanup attempt
        self.test_data["transformations"] = [t for t in self.test_data["transformations"] if t["id"] != transform_to_update["id"]]

if __name__ == "__main__":
    unittest.main()