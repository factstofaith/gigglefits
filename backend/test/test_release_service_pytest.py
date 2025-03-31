"""
Pytest-based tests for the release functionality in the AdminService class.

This test follows the standardized testing pattern for service tests
in the TAP Integration Platform.

Author: TAP Integration Platform Team
"""

import pytest
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


# Fixtures for release tests
@pytest.fixture
def release_id():
    """Generate a release ID for testing."""
    return 1


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
def user_id():
    """Generate a user ID for testing."""
    return "user-123"


@pytest.fixture
def mock_release(release_id, tenant_id, app_id, dataset_id):
    """Create a mock release for testing."""
    release = MagicMock()
    release.id = release_id
    release.items = [
        {"type": "application", "id": app_id, "action": "add"},
        {"type": "dataset", "id": dataset_id, "action": "add"}
    ]
    release.tenants = [tenant_id]
    release.status = "pending"
    return release


@pytest.fixture
def mock_tenant(tenant_id):
    """Create a mock tenant for testing."""
    tenant = MagicMock(spec=DbTenant)
    tenant.id = tenant_id
    return tenant


@pytest.fixture
def mock_db_session():
    """Create a mock database session for testing."""
    return MagicMock(spec=Session)


@pytest.fixture
def admin_service(mock_db_session):
    """Create an instance of AdminService for testing."""
    return AdminService(mock_db_session)


# Test class for release service
@pytest.mark.unit
class TestReleaseService:
    """Test cases for release-related methods in AdminService."""
    
    def test_execute_release(self, admin_service, mock_db_session, mock_release, mock_tenant, 
                            release_id, tenant_id, app_id, dataset_id, user_id):
        """Test executing a release to tenants."""
        # Setup mocks
        mock_db_session.query.return_value.filter.return_value.first.side_effect = [
            mock_release,  # First query for the release
            mock_tenant    # Second query for the tenant
        ]
        
        # Configure patches for association methods
        with patch.object(AdminService, 'associate_application_with_tenant') as mock_associate_app, \
             patch.object(AdminService, 'associate_dataset_with_tenant') as mock_associate_dataset:
            
            # Configure mocks to return success
            mock_associate_app.return_value = True
            mock_associate_dataset.return_value = True
            
            # Call the method
            admin_service.execute_release(release_id, user_id)
            
            # Assertions
            mock_db_session.query.assert_called()  # Was query called?
            mock_db_session.commit.assert_called()  # Were changes committed?
            
            # Was status updated to completed?
            assert mock_release.status == "completed"
            
            # Were associate methods called?
            mock_associate_app.assert_called_with(tenant_id, app_id, user_id)
            mock_associate_dataset.assert_called_with(tenant_id, dataset_id, user_id)
    
    def test_rollback_release(self, admin_service, mock_db_session, mock_release, mock_tenant,
                              release_id, tenant_id, app_id, dataset_id, user_id):
        """Test rolling back a release."""
        # Setup mocks
        mock_db_session.query.return_value.filter.return_value.first.side_effect = [
            mock_release,  # First query for the release
            mock_tenant    # Second query for the tenant
        ]
        
        # Configure patches for disassociation methods
        with patch.object(AdminService, 'disassociate_application_from_tenant') as mock_disassociate_app, \
             patch.object(AdminService, 'disassociate_dataset_from_tenant') as mock_disassociate_dataset:
            
            # Configure mocks to return success
            mock_disassociate_app.return_value = True
            mock_disassociate_dataset.return_value = True
            
            # Call the method
            admin_service.rollback_release(release_id, user_id)
            
            # Assertions
            mock_db_session.query.assert_called()  # Was query called?
            mock_db_session.commit.assert_called()  # Were changes committed?
            
            # Was status updated correctly?
            assert mock_release.status == "rolled_back"
            
            # Were disassociate methods called?
            mock_disassociate_app.assert_called_with(tenant_id, app_id)
            mock_disassociate_dataset.assert_called_with(tenant_id, dataset_id)
    
    def test_create_release(self, admin_service, mock_db_session, 
                            tenant_id, app_id, dataset_id, user_id):
        """Test creating a release."""
        # Setup mock
        release_create = ReleaseCreate(
            name="Test Release",
            description="Test release description",
            version="1.0.0",
            status=ReleaseStatus.DRAFT,
            items=[
                {"item_type": "application", "item_id": app_id, "action": "add"},
                {"item_type": "dataset", "item_id": dataset_id, "action": "add"}
            ],
            tenants=[tenant_id]
        )
        
        # Call the method
        admin_service.create_release(release_create, user_id)
        
        # Assertions
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()
    
    def test_release_association_workflow(self, admin_service, mock_db_session,
                                         release_id, tenant_id, app_id, dataset_id, user_id):
        """Test the complete workflow from release creation to execution."""
        # This simulates how an admin would create applications and datasets
        # and then push them to various tenants through a release
        
        # 1. Setup mocks for tenant and release
        tenant = MagicMock(spec=DbTenant)
        tenant.id = tenant_id
        release = MagicMock()
        release.id = release_id
        release.name = "Test Release"
        release.items = [
            {"type": "application", "id": app_id, "action": "add"},
            {"type": "dataset", "id": dataset_id, "action": "add"}
        ]
        release.tenants = [tenant_id]
        release.status = ReleaseStatus.DRAFT.value
        
        # 2. Setup query mocks
        mock_db_session.query.return_value.filter.return_value.first.side_effect = [
            release,    # For get_release
            tenant,     # For get_tenant
            None,       # For checking application association (not exists)
            None        # For checking dataset association (not exists)
        ]
        
        # 3. Setup patch for association methods
        with patch.object(admin_service, 'associate_application_with_tenant') as mock_assoc_app, \
             patch.object(admin_service, 'associate_dataset_with_tenant') as mock_assoc_dataset:
            
            # Configure mocks to return success
            mock_assoc_app.return_value = MagicMock(
                tenant_id=tenant_id, 
                application_id=app_id, 
                is_active=True
            )
            mock_assoc_dataset.return_value = MagicMock(
                tenant_id=tenant_id, 
                dataset_id=dataset_id, 
                is_active=True
            )
            
            # 4. Call execute_release
            admin_service.execute_release(release_id, user_id)
            
            # 5. Assertions
            # Was release status updated?
            assert release.status == "completed"
            
            # Were association methods called?
            mock_assoc_app.assert_called_once_with(tenant_id, app_id, user_id)
            mock_assoc_dataset.assert_called_once_with(tenant_id, dataset_id, user_id)
            
            # Were DB changes committed?
            mock_db_session.commit.assert_called()