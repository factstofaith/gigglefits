"""
Test TenantModel

Tests for the TenantModel component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import TenantModel as TenantModelModel
from .models import TenantModelCreate, TenantModelUpdate
from .service import TenantModelService

# Test data
test_tenantmodel = {
    "id": 1,
    "name": "Test TenantModel",
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
def tenantmodel_service(mock_db):
    """Create a TenantModelService with a mock DB session"""
    return TenantModelService(mock_db)

class TestTenantModelService:
    """Test TenantModelService functionality"""
    
    def test_get_all(self, tenantmodel_service, mock_db):
        """Test getting all tenantmodels"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [TenantModelModel(**test_tenantmodel)]
        
        # Test without tenant filtering
        result = tenantmodel_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_tenantmodel["id"]
        assert result[0].name == test_tenantmodel["name"]
        
        # Test with tenant filtering
        result = tenantmodel_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(TenantModelModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, tenantmodel_service, mock_db):
        """Test getting a tenantmodel by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = TenantModelModel(**test_tenantmodel)
        
        # Test successful retrieval
        result = tenantmodel_service.get_by_id(1)
        assert result.id == test_tenantmodel["id"]
        assert result.name == test_tenantmodel["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            tenantmodel_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, tenantmodel_service, mock_db):
        """Test creating a new tenantmodel"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new tenantmodel
        create_data = TenantModelCreate(
            name="New TenantModel",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = tenantmodel_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            tenantmodel_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, tenantmodel_service, mock_db):
        """Test updating a tenantmodel"""
        # Mock get_by_id to return a tenantmodel
        tenantmodel_model = TenantModelModel(**test_tenantmodel)
        tenantmodel_service.get_by_id = MagicMock(return_value=tenantmodel_model)
        
        # Test successful update
        update_data = TenantModelUpdate(name="Updated TenantModel")
        result = tenantmodel_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            tenantmodel_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, tenantmodel_service, mock_db):
        """Test deleting a tenantmodel"""
        # Mock get_by_id to return a tenantmodel
        tenantmodel_model = TenantModelModel(**test_tenantmodel)
        tenantmodel_service.get_by_id = MagicMock(return_value=tenantmodel_model)
        
        # Test successful deletion
        result = tenantmodel_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            tenantmodel_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
