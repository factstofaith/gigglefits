"""
Test BaseModel

Tests for the BaseModel component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import BaseModel as BaseModelModel
from .models import BaseModelCreate, BaseModelUpdate
from .service import BaseModelService

# Test data
test_basemodel = {
    "id": 1,
    "name": "Test BaseModel",
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
def basemodel_service(mock_db):
    """Create a BaseModelService with a mock DB session"""
    return BaseModelService(mock_db)

class TestBaseModelService:
    """Test BaseModelService functionality"""
    
    def test_get_all(self, basemodel_service, mock_db):
        """Test getting all basemodels"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [BaseModelModel(**test_basemodel)]
        
        # Test without tenant filtering
        result = basemodel_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_basemodel["id"]
        assert result[0].name == test_basemodel["name"]
        
        # Test with tenant filtering
        result = basemodel_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(BaseModelModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, basemodel_service, mock_db):
        """Test getting a basemodel by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = BaseModelModel(**test_basemodel)
        
        # Test successful retrieval
        result = basemodel_service.get_by_id(1)
        assert result.id == test_basemodel["id"]
        assert result.name == test_basemodel["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            basemodel_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, basemodel_service, mock_db):
        """Test creating a new basemodel"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new basemodel
        create_data = BaseModelCreate(
            name="New BaseModel",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = basemodel_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            basemodel_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, basemodel_service, mock_db):
        """Test updating a basemodel"""
        # Mock get_by_id to return a basemodel
        basemodel_model = BaseModelModel(**test_basemodel)
        basemodel_service.get_by_id = MagicMock(return_value=basemodel_model)
        
        # Test successful update
        update_data = BaseModelUpdate(name="Updated BaseModel")
        result = basemodel_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            basemodel_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, basemodel_service, mock_db):
        """Test deleting a basemodel"""
        # Mock get_by_id to return a basemodel
        basemodel_model = BaseModelModel(**test_basemodel)
        basemodel_service.get_by_id = MagicMock(return_value=basemodel_model)
        
        # Test successful deletion
        result = basemodel_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            basemodel_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
