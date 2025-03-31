"""
Tests for the dataset-related endpoints in the admin controller

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
from modules.admin.models import Dataset, DatasetCreate, DatasetUpdate, DatasetStatus

from test_adapters.api_adapter import APITestAdapter

class TestDatasetController(unittest.TestCase):
    """Test cases for dataset-related endpoints"""
    
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
        self.dataset_id = 1
        self.tenant_id = str(uuid.uuid4())
        
        # Get mock data from the adapter
        self.dataset_data = self.api_adapter.get_mock_dataset(dataset_id=self.dataset_id)
        
    def test_get_datasets(self):
        """Test GET /api/admin/datasets endpoint"""
        # Setup mock response
        self.mock_admin_service.get_datasets.return_value = [self.dataset_data]
        
        # Make request
        response = self.client.get("/api/admin/datasets")
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.get_datasets.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(len(response_data), 1)
        self.assertEqual(response_data[0]["id"], self.dataset_id)
    
    def test_get_dataset(self):
        """Test GET /api/admin/datasets/{dataset_id} endpoint"""
        # Setup mock response
        self.mock_admin_service.get_dataset.return_value = self.dataset_data
        
        # Make request
        response = self.client.get(f"/api/admin/datasets/{self.dataset_id}")
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.get_dataset.assert_called_once_with(self.dataset_id)
        
        response_data = response.json()
        self.assertEqual(response_data["id"], self.dataset_id)
    
    def test_get_dataset_not_found(self):
        """Test GET /api/admin/datasets/{dataset_id} with non-existent dataset"""
        # Setup mock response
        self.mock_admin_service.get_dataset.return_value = None
        
        # Make request
        response = self.client.get("/api/admin/datasets/999")
        
        # Assertions
        self.assertEqual(response.status_code, 404)
        self.mock_admin_service.get_dataset.assert_called_once_with(999)
    
    def test_create_dataset(self):
        """Test POST /api/admin/datasets endpoint"""
        # Setup mock response
        self.mock_admin_service.create_dataset.return_value = self.dataset_data
        
        # Prepare data
        create_data = {
            "name": "New Dataset",
            "description": "New dataset via API",
            "status": "active",
            "fields": [
                {
                    "name": "id",
                    "description": "Primary key",
                    "type": "integer",
                    "required": True,
                    "is_primary_key": True
                },
                {
                    "name": "name",
                    "description": "User name",
                    "type": "string",
                    "required": True,
                    "is_primary_key": False
                }
            ]
        }
        
        # Make request
        response = self.client.post("/api/admin/datasets", json=create_data)
        
        # Assertions
        self.assertEqual(response.status_code, 201)
        self.assertTrue(self.mock_admin_service.create_dataset.called)
        args, kwargs = self.mock_admin_service.create_dataset.call_args
        self.assertEqual(args[1], "admin-123")  # user ID from mock user
        
        response_data = response.json()
        self.assertEqual(response_data["id"], self.dataset_id)
    
    def test_update_dataset(self):
        """Test PUT /api/admin/datasets/{dataset_id} endpoint"""
        # Create updated dataset data
        updated_dataset = self.dataset_data.copy()
        updated_dataset["name"] = "Updated Name"
        updated_dataset["status"] = "inactive"
        
        # Setup mock response
        self.mock_admin_service.update_dataset.return_value = updated_dataset
        
        # Prepare update data
        update_data = {
            "name": "Updated Name",
            "status": "inactive"
        }
        
        # Make request
        response = self.client.put(f"/api/admin/datasets/{self.dataset_id}", json=update_data)
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.update_dataset.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(response_data["name"], "Updated Name")
        self.assertEqual(response_data["status"], "inactive")
    
    def test_delete_dataset(self):
        """Test DELETE /api/admin/datasets/{dataset_id} endpoint"""
        # Setup mock response
        self.mock_admin_service.delete_dataset.return_value = True
        
        # Make request
        response = self.client.delete(f"/api/admin/datasets/{self.dataset_id}")
        
        # Assertions
        self.assertEqual(response.status_code, 204)
        self.mock_admin_service.delete_dataset.assert_called_once_with(self.dataset_id)
    
    def test_get_tenant_datasets(self):
        """Test GET /api/admin/tenants/{tenant_id}/datasets endpoint"""
        # Setup mock response with two datasets
        dataset2_data = self.dataset_data.copy()
        dataset2_data["id"] = 2
        dataset2_data["name"] = "Dataset 2"
        
        self.mock_admin_service.get_tenant_datasets.return_value = [
            self.dataset_data,
            dataset2_data
        ]
        
        # Make request
        response = self.client.get(f"/api/admin/tenants/{self.tenant_id}/datasets")
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.get_tenant_datasets.assert_called_once_with(self.tenant_id)
        
        response_data = response.json()
        self.assertEqual(len(response_data), 2)
        self.assertEqual(response_data[0]["id"], 1)
        self.assertEqual(response_data[1]["id"], 2)
    
    def test_associate_dataset_with_tenant(self):
        """Test POST /api/admin/tenants/{tenant_id}/datasets/{dataset_id} endpoint"""
        # Setup mock response
        association = self.api_adapter.get_mock_association(self.tenant_id, self.dataset_id, "dataset")
        self.mock_admin_service.associate_dataset_with_tenant.return_value = association
        
        # Make request
        response = self.client.post(f"/api/admin/tenants/{self.tenant_id}/datasets/{self.dataset_id}")
        
        # Assertions
        self.assertEqual(response.status_code, 201)
        self.assertTrue(self.mock_admin_service.associate_dataset_with_tenant.called)
        args, kwargs = self.mock_admin_service.associate_dataset_with_tenant.call_args
        self.assertEqual(args[0], self.tenant_id)
        self.assertEqual(args[1], self.dataset_id)
    
    def test_disassociate_dataset_from_tenant(self):
        """Test DELETE /api/admin/tenants/{tenant_id}/datasets/{dataset_id} endpoint"""
        # Setup mock response
        self.mock_admin_service.disassociate_dataset_from_tenant.return_value = True
        
        # Make request
        response = self.client.delete(f"/api/admin/tenants/{self.tenant_id}/datasets/{self.dataset_id}")
        
        # Assertions
        self.assertEqual(response.status_code, 204)
        self.mock_admin_service.disassociate_dataset_from_tenant.assert_called_once_with(self.tenant_id, self.dataset_id)

if __name__ == "__main__":
    unittest.main()