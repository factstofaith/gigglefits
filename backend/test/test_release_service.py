"""
Unit tests for the release functionality in the AdminService class
"""

import unittest
import uuid
from datetime import datetime
from unittest.mock import MagicMock, patch, call

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from modules.admin.service import AdminService
from modules.admin.models import (
    Release,
    ReleaseCreate,
    ReleaseUpdate,
    ReleaseStatus,
    ReleaseItem
)
from db.models import (
    Tenant as DbTenant,
    TenantApplicationAssociation as DbTenantApplicationAssociation,
    TenantDatasetAssociation as DbTenantDatasetAssociation
)

class TestReleaseService(unittest.TestCase):
    """Test cases for release-related methods in AdminService"""
    
    def setUp(self):
        """Set up test fixtures before each test method runs"""
        # Create a mock SQLAlchemy session
        self.db = MagicMock(spec=Session)
        
        # Create admin service with mock DB
        self.admin_service = AdminService(self.db)
        
        # Mock the database models
        self.release_id = 1
        self.tenant_id = str(uuid.uuid4())
        self.app_id = 1
        self.dataset_id = 1
        self.user_id = "user-123"
        
        # Create mock release
        self.release = MagicMock()
        self.release.id = self.release_id
        self.release.items = [
            {"type": "application", "id": self.app_id, "action": "add"},
            {"type": "dataset", "id": self.dataset_id, "action": "add"}
        ]
        self.release.tenants = [self.tenant_id]
        self.release.status = "pending"
        
        # Create mock tenant
        self.tenant = MagicMock(spec=DbTenant)
        self.tenant.id = self.tenant_id
    
    @patch.object(AdminService, 'associate_application_with_tenant')
    @patch.object(AdminService, 'associate_dataset_with_tenant')
    def test_execute_release(self, mock_associate_dataset, mock_associate_app):
        """Test executing a release to tenants"""
        # Setup mocks
        self.db.query.return_value.filter.return_value.first.side_effect = [
            self.release,  # First query for the release
            self.tenant    # Second query for the tenant
        ]
        
        # Configure mocks to return success
        mock_associate_app.return_value = True
        mock_associate_dataset.return_value = True
        
        # Call the method
        self.admin_service.execute_release(self.release_id, self.user_id)
        
        # Assertions
        self.db.query.assert_called()  # Was query called?
        self.db.commit.assert_called()  # Were changes committed?
        
        # Was status updated to in_progress?
        self.assertEqual(self.release.status, "completed")
        
        # Were associate methods called?
        mock_associate_app.assert_called_with(self.tenant_id, self.app_id, self.user_id)
        mock_associate_dataset.assert_called_with(self.tenant_id, self.dataset_id, self.user_id)
    
    @patch.object(AdminService, 'disassociate_application_from_tenant')
    @patch.object(AdminService, 'disassociate_dataset_from_tenant')
    def test_rollback_release(self, mock_disassociate_dataset, mock_disassociate_app):
        """Test rolling back a release"""
        # Setup mocks
        self.db.query.return_value.filter.return_value.first.side_effect = [
            self.release,  # First query for the release
            self.tenant    # Second query for the tenant
        ]
        
        # Configure mocks to return success
        mock_disassociate_app.return_value = True
        mock_disassociate_dataset.return_value = True
        
        # Call the method
        self.admin_service.rollback_release(self.release_id, self.user_id)
        
        # Assertions
        self.db.query.assert_called()  # Was query called?
        self.db.commit.assert_called()  # Were changes committed?
        
        # Was status updated correctly?
        self.assertEqual(self.release.status, "rolled_back")
        
        # Were disassociate methods called?
        mock_disassociate_app.assert_called_with(self.tenant_id, self.app_id)
        mock_disassociate_dataset.assert_called_with(self.tenant_id, self.dataset_id)
    
    def test_create_release(self):
        """Test creating a release"""
        # Setup mock
        release_create = ReleaseCreate(
            name="Test Release",
            description="Test release description",
            version="1.0.0",
            status=ReleaseStatus.DRAFT,
            items=[
                {"item_type": "application", "item_id": self.app_id, "action": "add"},
                {"item_type": "dataset", "item_id": self.dataset_id, "action": "add"}
            ],
            tenants=[self.tenant_id]
        )
        
        # Call the method
        self.admin_service.create_release(release_create, self.user_id)
        
        # Assertions
        self.db.add.assert_called_once()
        self.db.commit.assert_called_once()
        self.db.refresh.assert_called_once()
    
    def test_release_association_workflow(self):
        """Test the complete workflow from release creation to execution"""
        # This simulates how an admin would create applications and datasets
        # and then push them to various tenants through a release
        
        # 1. Setup mocks for tenant and release
        tenant = MagicMock(spec=DbTenant)
        tenant.id = self.tenant_id
        release = MagicMock()
        release.id = self.release_id
        release.name = "Test Release"
        release.items = [
            {"type": "application", "id": self.app_id, "action": "add"},
            {"type": "dataset", "id": self.dataset_id, "action": "add"}
        ]
        release.tenants = [self.tenant_id]
        release.status = ReleaseStatus.DRAFT.value
        
        # 2. Setup query mocks
        self.db.query.return_value.filter.return_value.first.side_effect = [
            release,    # For get_release
            tenant,     # For get_tenant
            None,       # For checking application association (not exists)
            None        # For checking dataset association (not exists)
        ]
        
        # 3. Setup patch for association methods
        with patch.object(self.admin_service, 'associate_application_with_tenant') as mock_assoc_app, \
             patch.object(self.admin_service, 'associate_dataset_with_tenant') as mock_assoc_dataset:
            
            # Configure mocks to return success
            mock_assoc_app.return_value = MagicMock(
                tenant_id=self.tenant_id, 
                application_id=self.app_id, 
                is_active=True
            )
            mock_assoc_dataset.return_value = MagicMock(
                tenant_id=self.tenant_id, 
                dataset_id=self.dataset_id, 
                is_active=True
            )
            
            # 4. Call execute_release
            self.admin_service.execute_release(self.release_id, self.user_id)
            
            # 5. Assertions
            # Was release status updated?
            self.assertEqual(release.status, "completed")
            
            # Were association methods called?
            mock_assoc_app.assert_called_once_with(self.tenant_id, self.app_id, self.user_id)
            mock_assoc_dataset.assert_called_once_with(self.tenant_id, self.dataset_id, self.user_id)
            
            # Were DB changes committed?
            self.db.commit.assert_called()

if __name__ == "__main__":
    unittest.main()