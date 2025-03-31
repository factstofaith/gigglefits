"""
Pytest-based tests for the tenant-related endpoints in the admin controller.

This test follows the standardized testing pattern for controller tests
in the TAP Integration Platform.

Author: TAP Integration Platform Team
"""

import pytest
import uuid
from datetime import datetime
from unittest.mock import patch, MagicMock

from fastapi import FastAPI, Depends, status
from fastapi.testclient import TestClient

from modules.admin.controller import router, get_admin_service, require_super_admin
from modules.admin.service import AdminService
from modules.admin.models import (
    Tenant,
    TenantStatus,
    TenantTier,
    Application
)

from test_adapters.api_adapter import APITestAdapter


# Fixtures for tenant controller tests
@pytest.fixture
def tenant_id():
    """Generate a tenant ID for testing."""
    return str(uuid.uuid4())


@pytest.fixture
def app_id():
    """Generate an application ID for testing."""
    return 1


@pytest.fixture
def dataset_id():
    """Generate a dataset ID for testing."""
    return 1


@pytest.fixture
def api_adapter():
    """Create an API test adapter."""
    return APITestAdapter()


@pytest.fixture
def mock_admin_service():
    """Create a mock admin service."""
    return MagicMock(spec=AdminService)


@pytest.fixture
def client(api_adapter, mock_admin_service):
    """Create a test client with dependency overrides."""
    app = FastAPI()
    
    client = api_adapter.setup_app(
        app=app,
        router=router,
        auth_dependency=require_super_admin,
        other_dependencies={
            get_admin_service: lambda: mock_admin_service
        }
    )
    
    return client


@pytest.fixture
def tenant_data(api_adapter, tenant_id):
    """Get mock tenant data."""
    return api_adapter.get_mock_tenant(tenant_id=tenant_id)


@pytest.fixture
def application_data(api_adapter, app_id):
    """Get mock application data."""
    return api_adapter.get_mock_application(app_id=app_id)


@pytest.fixture
def dataset_data(api_adapter, dataset_id):
    """Get mock dataset data."""
    return api_adapter.get_mock_dataset(dataset_id=dataset_id)


# Test class for tenant controller
@pytest.mark.api
class TestTenantController:
    """Test cases for tenant-related endpoints."""
    
    def test_get_tenants(self, client, mock_admin_service, tenant_data):
        """Test GET /api/admin/tenants endpoint."""
        # Setup mock response
        mock_admin_service.get_tenants.return_value = [tenant_data]
        
        # Make request
        response = client.get("/api/admin/tenants")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        mock_admin_service.get_tenants.assert_called_once()
        
        response_data = response.json()
        assert len(response_data) == 1
        assert response_data[0]["id"] == tenant_data["id"]
    
    def test_get_tenant(self, client, mock_admin_service, tenant_data, tenant_id):
        """Test GET /api/admin/tenants/{tenant_id} endpoint."""
        # Setup mock response
        mock_admin_service.get_tenant.return_value = tenant_data
        
        # Make request
        response = client.get(f"/api/admin/tenants/{tenant_id}")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        mock_admin_service.get_tenant.assert_called_once_with(tenant_id)
        
        response_data = response.json()
        assert response_data["id"] == tenant_id
    
    def test_get_tenant_not_found(self, client, mock_admin_service):
        """Test GET /api/admin/tenants/{tenant_id} with non-existent tenant."""
        # Setup mock response
        mock_admin_service.get_tenant.return_value = None
        
        # Make request
        response = client.get("/api/admin/tenants/non-existent-id")
        
        # Assertions
        assert response.status_code == status.HTTP_404_NOT_FOUND
        mock_admin_service.get_tenant.assert_called_once_with("non-existent-id")
    
    def test_create_tenant(self, client, mock_admin_service, tenant_data):
        """Test POST /api/admin/tenants endpoint."""
        # Setup mock response
        mock_admin_service.create_tenant.return_value = tenant_data
        
        # Prepare data
        create_data = {
            "name": "New Tenant",
            "description": "New tenant via API",
            "status": "active",
            "tier": "standard"
        }
        
        # Make request
        response = client.post("/api/admin/tenants", json=create_data)
        
        # Assertions
        assert response.status_code == status.HTTP_201_CREATED
        mock_admin_service.create_tenant.assert_called_once()
        
        response_data = response.json()
        assert response_data["id"] == tenant_data["id"]
    
    def test_update_tenant(self, client, mock_admin_service, tenant_data, tenant_id):
        """Test PUT /api/admin/tenants/{tenant_id} endpoint."""
        # Create updated tenant data
        updated_tenant = tenant_data.copy()
        updated_tenant["name"] = "Updated Name"
        updated_tenant["status"] = "inactive"
        
        # Setup mock response
        mock_admin_service.update_tenant.return_value = updated_tenant
        
        # Prepare update data
        update_data = {
            "name": "Updated Name",
            "status": "inactive"
        }
        
        # Make request
        response = client.put(f"/api/admin/tenants/{tenant_id}", json=update_data)
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        mock_admin_service.update_tenant.assert_called_once()
        
        response_data = response.json()
        assert response_data["name"] == "Updated Name"
        assert response_data["status"] == "inactive"
    
    def test_delete_tenant(self, client, mock_admin_service, tenant_id):
        """Test DELETE /api/admin/tenants/{tenant_id} endpoint."""
        # Setup mock response
        mock_admin_service.delete_tenant.return_value = True
        
        # Make request
        response = client.delete(f"/api/admin/tenants/{tenant_id}")
        
        # Assertions
        assert response.status_code == status.HTTP_204_NO_CONTENT
        mock_admin_service.delete_tenant.assert_called_once_with(tenant_id)
    
    def test_get_tenant_applications(self, client, mock_admin_service, application_data, tenant_id):
        """Test GET /api/admin/tenants/{tenant_id}/applications endpoint."""
        # Setup mock response with two applications
        app2_data = application_data.copy()
        app2_data["id"] = 2
        app2_data["name"] = "App 2"
        
        mock_admin_service.get_tenant_applications.return_value = [
            application_data,
            app2_data
        ]
        
        # Make request
        response = client.get(f"/api/admin/tenants/{tenant_id}/applications")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        mock_admin_service.get_tenant_applications.assert_called_once_with(tenant_id)
        
        response_data = response.json()
        assert len(response_data) == 2
        assert response_data[0]["id"] == 1
        assert response_data[1]["id"] == 2
    
    def test_associate_application_with_tenant(self, client, mock_admin_service, api_adapter, tenant_id, app_id):
        """Test POST /api/admin/tenants/{tenant_id}/applications/{application_id} endpoint."""
        # Setup mock response
        association = api_adapter.get_mock_association(tenant_id, app_id)
        mock_admin_service.associate_application_with_tenant.return_value = association
        
        # Make request
        response = client.post(f"/api/admin/tenants/{tenant_id}/applications/{app_id}")
        
        # Assertions
        assert response.status_code == status.HTTP_201_CREATED
        assert mock_admin_service.associate_application_with_tenant.called
        args, kwargs = mock_admin_service.associate_application_with_tenant.call_args
        assert args[0] == tenant_id
        assert args[1] == app_id