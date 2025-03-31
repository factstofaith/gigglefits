"""
Tests for the tenant-related endpoints in the admin controller

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
from modules.admin.models import (
    Tenant,
    TenantStatus,
    TenantTier,
    Application
)

from test_adapters.api_adapter import APITestAdapter

class TestTenantController(unittest.TestCase):
    """Test cases for tenant-related endpoints"""
    
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
        self.tenant_id = str(uuid.uuid4())
        self.app_id = 1
        self.dataset_id = 1
        
        # Get mock data from the adapter
        self.tenant_data = self.api_adapter.get_mock_tenant(tenant_id=self.tenant_id)
        self.application_data = self.api_adapter.get_mock_application(app_id=self.app_id)
        self.dataset_data = self.api_adapter.get_mock_dataset(dataset_id=self.dataset_id)
        
    def test_get_tenants(self):
        """Test GET /api/admin/tenants endpoint"""
        # Setup mock response
        self.mock_admin_service.get_tenants.return_value = [self.tenant_data]
        
        # Make request
        response = self.client.get("/api/admin/tenants")
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.get_tenants.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(len(response_data), 1)
        self.assertEqual(response_data[0]["id"], self.tenant_id)
    
    def test_get_tenant(self):
        """Test GET /api/admin/tenants/{tenant_id} endpoint"""
        # Setup mock response
        self.mock_admin_service.get_tenant.return_value = self.tenant_data
        
        # Make request
        response = self.client.get(f"/api/admin/tenants/{self.tenant_id}")
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.get_tenant.assert_called_once_with(self.tenant_id)
        
        response_data = response.json()
        self.assertEqual(response_data["id"], self.tenant_id)
    
    def test_get_tenant_not_found(self):
        """Test GET /api/admin/tenants/{tenant_id} with non-existent tenant"""
        # Setup mock response
        self.mock_admin_service.get_tenant.return_value = None
        
        # Make request
        response = self.client.get(f"/api/admin/tenants/non-existent-id")
        
        # Assertions
        self.assertEqual(response.status_code, 404)
        self.mock_admin_service.get_tenant.assert_called_once_with("non-existent-id")
    
    def test_create_tenant(self):
        """Test POST /api/admin/tenants endpoint"""
        # Setup mock response
        self.mock_admin_service.create_tenant.return_value = self.tenant_data
        
        # Prepare data
        create_data = {
            "name": "New Tenant",
            "description": "New tenant via API",
            "status": "active",
            "tier": "standard"
        }
        
        # Make request
        response = self.client.post("/api/admin/tenants", json=create_data)
        
        # Assertions
        self.assertEqual(response.status_code, 201)
        self.mock_admin_service.create_tenant.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(response_data["id"], self.tenant_id)
    
    def test_update_tenant(self):
        """Test PUT /api/admin/tenants/{tenant_id} endpoint"""
        # Create updated tenant data
        updated_tenant = self.tenant_data.copy()
        updated_tenant["name"] = "Updated Name"
        updated_tenant["status"] = "inactive"
        
        # Setup mock response
        self.mock_admin_service.update_tenant.return_value = updated_tenant
        
        # Prepare update data
        update_data = {
            "name": "Updated Name",
            "status": "inactive"
        }
        
        # Make request
        response = self.client.put(f"/api/admin/tenants/{self.tenant_id}", json=update_data)
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.update_tenant.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(response_data["name"], "Updated Name")
        self.assertEqual(response_data["status"], "inactive")
    
    def test_delete_tenant(self):
        """Test DELETE /api/admin/tenants/{tenant_id} endpoint"""
        # Setup mock response
        self.mock_admin_service.delete_tenant.return_value = True
        
        # Make request
        response = self.client.delete(f"/api/admin/tenants/{self.tenant_id}")
        
        # Assertions
        self.assertEqual(response.status_code, 204)
        self.mock_admin_service.delete_tenant.assert_called_once_with(self.tenant_id)
    
    def test_get_tenant_applications(self):
        """Test GET /api/admin/tenants/{tenant_id}/applications endpoint"""
        # Setup mock response with two applications
        app2_data = self.application_data.copy()
        app2_data["id"] = 2
        app2_data["name"] = "App 2"
        
        self.mock_admin_service.get_tenant_applications.return_value = [
            self.application_data,
            app2_data
        ]
        
        # Make request
        response = self.client.get(f"/api/admin/tenants/{self.tenant_id}/applications")
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.get_tenant_applications.assert_called_once_with(self.tenant_id)
        
        response_data = response.json()
        self.assertEqual(len(response_data), 2)
        self.assertEqual(response_data[0]["id"], 1)
        self.assertEqual(response_data[1]["id"], 2)
    
    def test_associate_application_with_tenant(self):
        """Test POST /api/admin/tenants/{tenant_id}/applications/{application_id} endpoint"""
        # Setup mock response
        association = self.api_adapter.get_mock_association(self.tenant_id, self.app_id)
        self.mock_admin_service.associate_application_with_tenant.return_value = association
        
        # Make request
        response = self.client.post(f"/api/admin/tenants/{self.tenant_id}/applications/{self.app_id}")
        
        # Assertions
        self.assertEqual(response.status_code, 201)
        self.assertTrue(self.mock_admin_service.associate_application_with_tenant.called)
        args, kwargs = self.mock_admin_service.associate_application_with_tenant.call_args
        self.assertEqual(args[0], self.tenant_id)
        self.assertEqual(args[1], self.app_id)
    
    def test_execute_release(self):
        """Test POST /api/admin/releases/{release_id}/execute endpoint"""
        # This is a placeholder test that passes
        pass

if __name__ == "__main__":
    unittest.main()