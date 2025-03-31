"""
Test TenantService

Tests for the TenantService component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import TenantService as TenantServiceModel
from .models import TenantServiceCreate, TenantServiceUpdate
from .service import TenantServiceService

# Test data
test_tenantservice = {
    "id": 1,
    "name": "Test TenantService",
    "description": "Test description",
    "tenant_id": "test-tenant",
    "created_at": datetime.datetime.utcnow(),
    "updated_at": datetime.datetime.utcnow()
}

# Test fixtures
@pytest.fixture
def mock_db():
    """Create a mock database session"""
    db = MagicMock(spec=Session)
    return db

@pytest.fixture
def tenantservice_service(mock_db):
    """Create a TenantServiceService with a mock DB session"""
    return TenantServiceService(mock_db)

class TestTenantServiceService:
    """Test TenantServiceService functionality"""
    
    def test_get_all(self, tenantservice_service, mock_db):
        """Test getting all tenantservices"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [TenantServiceModel(**test_tenantservice)]
        
        # Test without tenant filtering
        result = tenantservice_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_tenantservice["id"]
        assert result[0].name == test_tenantservice["name"]
        
        # Test with tenant filtering
        result = tenantservice_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(TenantServiceModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, tenantservice_service, mock_db):
        """Test getting a tenantservice by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = TenantServiceModel(**test_tenantservice)
        
        # Test successful retrieval
        result = tenantservice_service.get_by_id(1)
        assert result.id == test_tenantservice["id"]
        assert result.name == test_tenantservice["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            tenantservice_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, tenantservice_service, mock_db):
        """Test creating a new tenantservice"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new tenantservice
        create_data = TenantServiceCreate(
            name="New TenantService",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = tenantservice_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            tenantservice_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, tenantservice_service, mock_db):
        """Test updating a tenantservice"""
        # Mock get_by_id to return a tenantservice
        tenantservice_model = TenantServiceModel(**test_tenantservice)
        tenantservice_service.get_by_id = MagicMock(return_value=tenantservice_model)
        
        # Test successful update
        update_data = TenantServiceUpdate(name="Updated TenantService")
        result = tenantservice_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            tenantservice_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, tenantservice_service, mock_db):
        """Test deleting a tenantservice"""
        # Mock get_by_id to return a tenantservice
        tenantservice_model = TenantServiceModel(**test_tenantservice)
        tenantservice_service.get_by_id = MagicMock(return_value=tenantservice_model)
        
        # Test successful deletion
        result = tenantservice_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            tenantservice_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
