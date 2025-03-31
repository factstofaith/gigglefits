"""
Tests for the application-related endpoints in the admin controller

This test uses the APITestAdapter to set up a test FastAPI app with mocked authentication
and service dependencies.
"""

from fastapi import FastAPI, Depends
import unittest
from unittest.mock import patch, MagicMock
import uuid
from datetime import datetime

from modules.admin.controller import router, get_admin_service, require_super_admin
from modules.admin.service import AdminService
from modules.admin.models import Application, ApplicationCreate, ApplicationUpdate, ApplicationStatus, AuthType

from test_adapters.api_adapter import APITestAdapter

class TestApplicationController(unittest.TestCase):
    """Test cases for application-related endpoints"""
    
    def setUp(self):
        """Set up test data and API test adapter"""
        self.api_adapter = APITestAdapter()
        
        # Create a test app
        app = FastAPI()
        
        # Create a MagicMock for the admin service
        self.mock_admin_service = MagicMock(spec=AdminService)
        
        # Set up dependency overrides with our API adapter
        self.client = self.api_adapter.setup_app(
            app=app,
            router=router,
            auth_dependency=require_super_admin,
            other_dependencies={
                get_admin_service: lambda: self.mock_admin_service
            }
        )
        
        # Set up test IDs
        self.app_id = 1
        
        # Get mock data from the adapter
        self.application_data = self.api_adapter.get_mock_application(app_id=self.app_id)
        
    def test_get_applications(self):
        """Test GET /api/admin/applications endpoint"""
        # Setup mock response
        self.mock_admin_service.get_applications.return_value = [self.application_data]
        
        # Make request
        response = self.client.get("/api/admin/applications")
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.get_applications.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(len(response_data), 1)
        self.assertEqual(response_data[0]["id"], self.app_id)
    
    def test_get_application(self):
        """Test GET /api/admin/applications/{application_id} endpoint"""
        # Setup mock response
        self.mock_admin_service.get_application.return_value = self.application_data
        
        # Make request
        response = self.client.get(f"/api/admin/applications/{self.app_id}")
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.get_application.assert_called_once_with(self.app_id)
        
        response_data = response.json()
        self.assertEqual(response_data["id"], self.app_id)
    
    def test_get_application_not_found(self):
        """Test GET /api/admin/applications/{application_id} with non-existent application"""
        # Setup mock response
        self.mock_admin_service.get_application.return_value = None
        
        # Make request
        response = self.client.get("/api/admin/applications/999")
        
        # Assertions
        self.assertEqual(response.status_code, 404)
        self.mock_admin_service.get_application.assert_called_once_with(999)
    
    def test_create_application(self):
        """Test POST /api/admin/applications endpoint"""
        # Setup mock response
        self.mock_admin_service.create_application.return_value = self.application_data
        
        # Prepare data
        create_data = {
            "name": "New Application",
            "description": "New application via API",
            "type": "api",
            "auth_type": "none"
        }
        
        # Make request
        response = self.client.post("/api/admin/applications", json=create_data)
        
        # Assertions
        self.assertEqual(response.status_code, 201)
        self.assertTrue(self.mock_admin_service.create_application.called)
        args, kwargs = self.mock_admin_service.create_application.call_args
        self.assertEqual(args[1], "admin-123")  # user ID from mock user
        
        response_data = response.json()
        self.assertEqual(response_data["id"], self.app_id)
    
    def test_update_application(self):
        """Test PUT /api/admin/applications/{application_id} endpoint"""
        # Create updated application data
        updated_app = self.application_data.copy()
        updated_app["name"] = "Updated Name"
        updated_app["status"] = "inactive"
        
        # Setup mock response
        self.mock_admin_service.update_application.return_value = updated_app
        
        # Prepare update data
        update_data = {
            "name": "Updated Name",
            "status": "inactive"
        }
        
        # Make request
        response = self.client.put(f"/api/admin/applications/{self.app_id}", json=update_data)
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.update_application.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(response_data["name"], "Updated Name")
        self.assertEqual(response_data["status"], "inactive")
    
    def test_delete_application(self):
        """Test DELETE /api/admin/applications/{application_id} endpoint"""
        # Setup mock response
        self.mock_admin_service.delete_application.return_value = True
        
        # Make request
        response = self.client.delete(f"/api/admin/applications/{self.app_id}")
        
        # Assertions
        self.assertEqual(response.status_code, 204)
        self.mock_admin_service.delete_application.assert_called_once_with(self.app_id)
    
    def test_discover_application_schema(self):
        """Test POST /api/admin/applications/{application_id}/discover-schema endpoint"""
        # Setup mock schema fields
        schema_fields = [
            {
                "name": "id",
                "description": "Primary key",
                "type": "integer",
                "required": True,
                "is_primary_key": True,
                "example_value": 1
            },
            {
                "name": "name",
                "description": "User name",
                "type": "string", 
                "required": True,
                "is_primary_key": False,
                "example_value": "John Doe"
            }
        ]
        
        self.mock_admin_service.get_application.return_value = self.application_data
        self.mock_admin_service.discover_application_schema.return_value = schema_fields
        
        # Make request with params
        response = self.client.post(
            f"/api/admin/applications/{self.app_id}/discover-schema?method=api",
            json={"api_url": "https://example.com/schema"}
        )
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.discover_application_schema.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(len(response_data), 2)
        self.assertEqual(response_data[0]["name"], "id")
        self.assertEqual(response_data[1]["name"], "name")
    
    def test_create_dataset_from_schema(self):
        """Test POST /api/admin/applications/{application_id}/create-dataset-from-schema endpoint"""
        # Setup mock dataset
        dataset = self.api_adapter.get_mock_dataset(dataset_id=1)
        
        self.mock_admin_service.get_application.return_value = self.application_data
        self.mock_admin_service.create_dataset_from_schema.return_value = dataset
        
        # Prepare fields data
        fields = [
            {
                "name": "id",
                "description": "Primary key",
                "type": "integer",
                "required": True,
                "is_primary_key": True,
                "example_value": 1
            },
            {
                "name": "name",
                "description": "User name",
                "type": "string", 
                "required": True,
                "is_primary_key": False,
                "example_value": "John Doe"
            }
        ]
        
        # Make request
        response = self.client.post(
            f"/api/admin/applications/{self.app_id}/create-dataset-from-schema?name=UserData&description=User+data+schema",
            json=fields
        )
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.create_dataset_from_schema.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(response_data["id"], 1)
        self.assertEqual(response_data["name"], "Test Dataset")

if __name__ == "__main__":
    unittest.main()