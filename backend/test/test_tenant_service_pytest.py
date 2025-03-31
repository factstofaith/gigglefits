"""
Pytest-based tests for the tenant functionality in the AdminService class.

This test file follows the standardized testing pattern for service tests
in the TAP Integration Platform.

Author: TAP Integration Platform Team
"""

import pytest
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


# Fixtures for tenant tests
@pytest.fixture
def tenant_id():
    """Generate a tenant ID for testing."""
    return str(uuid.uuid4())


@pytest.fixture
def tenant_data(tenant_id):
    """Create test tenant data."""
    return {
        "id": tenant_id,
        "name": "Test Tenant",
        "description": "Test tenant for unit tests",
        "status": "active",
        "tier": "standard",
        "settings": {"allowed_users": 5},
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC)
    }


@pytest.fixture
def db_tenant(tenant_data):
    """Create a mock database tenant for testing."""
    return DbTenant(**tenant_data)


@pytest.fixture
def app_id():
    """Generate an application ID for testing."""
    return 1


@pytest.fixture
def db_application(app_id):
    """Create a mock database application for testing."""
    return DbApplication(
        id=app_id,
        name="Test App",
        type="API",
        status="active",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )


@pytest.fixture
def dataset_id():
    """Generate a dataset ID for testing."""
    return 1


@pytest.fixture
def db_dataset(dataset_id):
    """Create a mock database dataset for testing."""
    return DbDataset(
        id=dataset_id,
        name="Test Dataset",
        status="active",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )


@pytest.fixture
def user_id():
    """Generate a user ID for testing."""
    return "user-123"


@pytest.fixture
def mock_db_session():
    """Create a mock database session for testing."""
    return MagicMock(spec=Session)


@pytest.fixture
def admin_service(mock_db_session):
    """Create an instance of AdminService for testing."""
    return AdminService(mock_db_session)


@pytest.fixture
def mock_query_side_effect(db_tenant, db_application, db_dataset):
    """Create a side effect function for mocking database queries."""
    def _side_effect(model):
        mock = MagicMock()
        
        if model == DbTenant:
            mock.filter.return_value.first.return_value = db_tenant
        elif model == DbApplication:
            mock.filter.return_value.first.return_value = db_application
        elif model == DbDataset:
            mock.filter.return_value.first.return_value = db_dataset
        elif model == DbTenantApplicationAssociation:
            # No existing association
            mock.filter.return_value.first.return_value = None
        elif model == DbTenantDatasetAssociation:
            # No existing association
            mock.filter.return_value.first.return_value = None
        
        return mock
    
    return _side_effect


# Test class for tenant service
@pytest.mark.unit
class TestTenantService:
    """Test cases for tenant-related methods in AdminService."""
    
    def test_get_tenant(self, admin_service, mock_db_session, db_tenant, tenant_id):
        """Test getting a tenant by ID."""
        # Setup mock
        mock_db_session.query.return_value.filter.return_value.first.return_value = db_tenant
        
        # Call the method
        result = admin_service.get_tenant(tenant_id)
        
        # Assertions
        mock_db_session.query.assert_called_once_with(DbTenant)
        mock_db_session.query.return_value.filter.assert_called_once()
        assert result is not None
        assert result.id == tenant_id
        assert result.name == db_tenant.name
    
    def test_get_tenant_not_found(self, admin_service, mock_db_session):
        """Test getting a non-existent tenant."""
        # Setup mock
        mock_db_session.query.return_value.filter.return_value.first.return_value = None
        
        # Call the method
        result = admin_service.get_tenant("non-existent-id")
        
        # Assertions
        assert result is None
    
    def test_create_tenant(self, admin_service, mock_db_session, tenant_id):
        """Test creating a new tenant."""
        # Setup
        tenant_create = TenantCreate(
            id=tenant_id,
            name="New Tenant",
            description="New tenant for testing",
            status=TenantStatus.ACTIVE,
            tier=TenantTier.STANDARD
        )
        
        # Setup mock to return the newly created tenant
        mock_db_session.query.return_value.filter.return_value.first.return_value = DbTenant(
            id=tenant_id,
            name=tenant_create.name,
            description=tenant_create.description,
            status=tenant_create.status,
            tier=tenant_create.tier,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC)
        )
        
        # Call the method
        result = admin_service.create_tenant(tenant_create)
        
        # Assertions
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()
        assert result.name == tenant_create.name
        assert result.id == tenant_id
    
    def test_update_tenant(self, admin_service, mock_db_session, db_tenant, tenant_id):
        """Test updating an existing tenant."""
        # Setup
        tenant_update = TenantUpdate(
            name="Updated Tenant",
            status=TenantStatus.INACTIVE
        )
        
        # Setup mock to return the existing tenant
        mock_db_session.query.return_value.filter.return_value.first.return_value = db_tenant
        
        # Call the method
        result = admin_service.update_tenant(tenant_id, tenant_update)
        
        # Assertions
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()
        assert result.name == tenant_update.name
        assert result.status == tenant_update.status
    
    def test_delete_tenant(self, admin_service, mock_db_session, db_tenant, tenant_id):
        """Test deleting a tenant."""
        # Setup mock to return the existing tenant
        mock_db_session.query.return_value.filter.return_value.first.return_value = db_tenant
        
        # Call the method
        result = admin_service.delete_tenant(tenant_id)
        
        # Assertions
        mock_db_session.delete.assert_called_once_with(db_tenant)
        mock_db_session.commit.assert_called_once()
        assert result is True
    
    def test_associate_application_with_tenant(self, admin_service, mock_db_session, 
                                              tenant_id, app_id, user_id, mock_query_side_effect):
        """Test associating an application with a tenant."""
        # Setup mocks
        mock_db_session.query.side_effect = mock_query_side_effect
        
        # Call the method
        result = admin_service.associate_application_with_tenant(
            tenant_id, app_id, user_id
        )
        
        # Assertions
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        assert result is True
    
    def test_disassociate_application_from_tenant(self, admin_service, mock_db_session, 
                                                tenant_id, app_id, user_id):
        """Test removing an association between application and tenant."""
        # Setup mock for existing association
        association = DbTenantApplicationAssociation(
            tenant_id=tenant_id,
            application_id=app_id,
            is_active=True,
            granted_at=datetime.now(UTC),
            granted_by=user_id
        )
        mock_db_session.query.return_value.filter.return_value.first.return_value = association
        
        # Call the method
        result = admin_service.disassociate_application_from_tenant(
            tenant_id, app_id
        )
        
        # Assertions
        mock_db_session.commit.assert_called_once()
        assert result is True
        assert association.is_active is False  # Check soft delete
    
    def test_get_tenant_applications(self, admin_service, mock_db_session, db_tenant, tenant_id):
        """Test getting applications associated with a tenant."""
        # Setup mocks
        mock_db_session.query.return_value.filter.return_value.first.return_value = db_tenant
        
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
        
        mock_db_session.query.return_value = mock_query
        mock_query.join.return_value = mock_join
        mock_join.filter.return_value = mock_filter
        mock_filter.filter.return_value = mock_filter
        mock_filter.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = apps
        
        # Call the method
        result = admin_service.get_tenant_applications(tenant_id)
        
        # Assertions
        assert len(result) == 2
        assert all(isinstance(app, Application) for app in result)