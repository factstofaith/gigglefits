"""
Unit tests for the tenant functionality in the AdminService class
"""

import unittest
import uuid
from datetime import datetime, UTC
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from modules.admin.service import AdminService
from modules.admin.models import (
    TenantCreate,
    TenantUpdate,
    TenantStatus,
    TenantTier,
    Tenant,
    Application,
    Dataset
)
from db.models import (
    Tenant as DbTenant,
    TenantApplicationAssociation as DbTenantApplicationAssociation,
    TenantDatasetAssociation as DbTenantDatasetAssociation,
    Application as DbApplication,
    Dataset as DbDataset
)

class TestTenantService(unittest.TestCase):
    """Test cases for tenant-related methods in AdminService"""
    
    def setUp(self):
        """Set up test fixtures before each test method runs"""
        # Create a mock SQLAlchemy session
        self.db = MagicMock(spec=Session)
        
        # Create admin service with mock DB
        self.admin_service = AdminService(self.db)
        
        # Sample data
        self.tenant_id = str(uuid.uuid4())
        self.test_tenant_data = {
            "id": self.tenant_id,
            "name": "Test Tenant",
            "description": "Test tenant for unit tests",
            "status": "active",
            "tier": "standard",
            "settings": {"allowed_users": 5},
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC)
        }
        
        self.test_db_tenant = DbTenant(**self.test_tenant_data)
        
        # Application data
        self.app_id = 1
        self.test_db_application = DbApplication(
            id=self.app_id,
            name="Test App",
            type="API",
            status="active",
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC)
        )
        
        # Dataset data
        self.dataset_id = 1
        self.test_db_dataset = DbDataset(
            id=self.dataset_id,
            name="Test Dataset",
            status="active",
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC)
        )
        
        # User ID for associations
        self.user_id = "user-123"
    
    def test_get_tenant(self):
        """Test getting a tenant by ID"""
        # Setup mock
        self.db.query.return_value.filter.return_value.first.return_value = self.test_db_tenant
        
        # Call the method
        result = self.admin_service.get_tenant(self.tenant_id)
        
        # Assertions
        self.db.query.assert_called_once_with(DbTenant)
        self.db.query.return_value.filter.assert_called_once()
        self.assertIsNotNone(result)
        self.assertEqual(result.id, self.tenant_id)
        self.assertEqual(result.name, self.test_tenant_data["name"])
    
    def test_get_tenant_not_found(self):
        """Test getting a non-existent tenant"""
        # Setup mock
        self.db.query.return_value.filter.return_value.first.return_value = None
        
        # Call the method
        result = self.admin_service.get_tenant("non-existent-id")
        
        # Assertions
        self.assertIsNone(result)
    
    def test_create_tenant(self):
        """Test creating a new tenant"""
        # Setup
        tenant_create = TenantCreate(
            id=self.tenant_id,
            name="New Tenant",
            description="New tenant for testing",
            status=TenantStatus.ACTIVE,
            tier=TenantTier.STANDARD
        )
        
        # Setup mock to return the newly created tenant
        self.db.query.return_value.filter.return_value.first.return_value = DbTenant(
            id=self.tenant_id,
            name=tenant_create.name,
            description=tenant_create.description,
            status=tenant_create.status,
            tier=tenant_create.tier,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC)
        )
        
        # Call the method
        result = self.admin_service.create_tenant(tenant_create)
        
        # Assertions
        self.db.add.assert_called_once()
        self.db.commit.assert_called_once()
        self.db.refresh.assert_called_once()
        self.assertEqual(result.name, tenant_create.name)
        self.assertEqual(result.id, self.tenant_id)
    
    def test_update_tenant(self):
        """Test updating an existing tenant"""
        # Setup
        tenant_update = TenantUpdate(
            name="Updated Tenant",
            status=TenantStatus.INACTIVE
        )
        
        # Setup mock to return the existing tenant
        self.db.query.return_value.filter.return_value.first.return_value = self.test_db_tenant
        
        # Call the method
        result = self.admin_service.update_tenant(self.tenant_id, tenant_update)
        
        # Assertions
        self.db.commit.assert_called_once()
        self.db.refresh.assert_called_once()
        self.assertEqual(result.name, tenant_update.name)
        self.assertEqual(result.status, tenant_update.status)
    
    def test_delete_tenant(self):
        """Test deleting a tenant"""
        # Setup mock to return the existing tenant
        self.db.query.return_value.filter.return_value.first.return_value = self.test_db_tenant
        
        # Call the method
        result = self.admin_service.delete_tenant(self.tenant_id)
        
        # Assertions
        self.db.delete.assert_called_once_with(self.test_db_tenant)
        self.db.commit.assert_called_once()
        self.assertTrue(result)
    
    def test_associate_application_with_tenant(self):
        """Test associating an application with a tenant"""
        # Setup mocks
        self.db.query.side_effect = self._mock_query_side_effect
        
        # Call the method
        result = self.admin_service.associate_application_with_tenant(
            self.tenant_id, self.app_id, self.user_id
        )
        
        # Assertions
        self.db.add.assert_called_once()
        self.db.commit.assert_called_once()
        self.assertTrue(result)
    
    def test_disassociate_application_from_tenant(self):
        """Test removing an association between application and tenant"""
        # Setup mock for existing association
        association = DbTenantApplicationAssociation(
            tenant_id=self.tenant_id,
            application_id=self.app_id,
            is_active=True,
            granted_at=datetime.now(UTC),
            granted_by=self.user_id
        )
        self.db.query.return_value.filter.return_value.first.return_value = association
        
        # Call the method
        result = self.admin_service.disassociate_application_from_tenant(
            self.tenant_id, self.app_id
        )
        
        # Assertions
        self.db.commit.assert_called_once()
        self.assertTrue(result)
        self.assertFalse(association.is_active)  # Check soft delete
    
    def test_get_tenant_applications(self):
        """Test getting applications associated with a tenant"""
        # Setup mocks
        self.db.query.return_value.filter.return_value.first.return_value = self.test_db_tenant
        
        apps = [
            DbApplication(id=1, name="App 1", type="API", status="active"),
            DbApplication(id=2, name="App 2", type="FILE", status="active")
        ]
        
        # Mock the complex join query
        mock_query = MagicMock()
        mock_join = MagicMock()
        mock_filter = MagicMock()
        mock_offset = MagicMock()
        mock_limit = MagicMock()
        
        self.db.query.return_value = mock_query
        mock_query.join.return_value = mock_join
        mock_join.filter.return_value = mock_filter
        mock_filter.filter.return_value = mock_filter
        mock_filter.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = apps
        
        # Call the method
        result = self.admin_service.get_tenant_applications(self.tenant_id)
        
        # Assertions
        self.assertEqual(len(result), 2)
        self.assertTrue(all(isinstance(app, Application) for app in result))
    
    def test_execute_release(self):
        """Test executing a release to tenants"""
        # This would require more extensive mocking of the release mechanism
        # For now, we'll just test the basic structure
        pass
    
    def _mock_query_side_effect(self, model):
        """Helper to mock different query results based on the model"""
        mock = MagicMock()
        
        if model == DbTenant:
            mock.filter.return_value.first.return_value = self.test_db_tenant
        elif model == DbApplication:
            mock.filter.return_value.first.return_value = self.test_db_application
        elif model == DbDataset:
            mock.filter.return_value.first.return_value = self.test_db_dataset
        elif model == DbTenantApplicationAssociation:
            # No existing association
            mock.filter.return_value.first.return_value = None
        elif model == DbTenantDatasetAssociation:
            # No existing association
            mock.filter.return_value.first.return_value = None
        
        return mock

if __name__ == "__main__":
    unittest.main()