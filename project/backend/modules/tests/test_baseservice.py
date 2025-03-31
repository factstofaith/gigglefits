"""
Test BaseService

Tests for the BaseService component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import BaseService as BaseServiceModel
from .models import BaseServiceCreate, BaseServiceUpdate
from .service import BaseServiceService

# Test data
test_baseservice = {
    "id": 1,
    "name": "Test BaseService",
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
def baseservice_service(mock_db):
    """Create a BaseServiceService with a mock DB session"""
    return BaseServiceService(mock_db)

class TestBaseServiceService:
    """Test BaseServiceService functionality"""
    
    def test_get_all(self, baseservice_service, mock_db):
        """Test getting all baseservices"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [BaseServiceModel(**test_baseservice)]
        
        # Test without tenant filtering
        result = baseservice_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_baseservice["id"]
        assert result[0].name == test_baseservice["name"]
        
        # Test with tenant filtering
        result = baseservice_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(BaseServiceModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, baseservice_service, mock_db):
        """Test getting a baseservice by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = BaseServiceModel(**test_baseservice)
        
        # Test successful retrieval
        result = baseservice_service.get_by_id(1)
        assert result.id == test_baseservice["id"]
        assert result.name == test_baseservice["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            baseservice_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, baseservice_service, mock_db):
        """Test creating a new baseservice"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new baseservice
        create_data = BaseServiceCreate(
            name="New BaseService",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = baseservice_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            baseservice_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, baseservice_service, mock_db):
        """Test updating a baseservice"""
        # Mock get_by_id to return a baseservice
        baseservice_model = BaseServiceModel(**test_baseservice)
        baseservice_service.get_by_id = MagicMock(return_value=baseservice_model)
        
        # Test successful update
        update_data = BaseServiceUpdate(name="Updated BaseService")
        result = baseservice_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            baseservice_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, baseservice_service, mock_db):
        """Test deleting a baseservice"""
        # Mock get_by_id to return a baseservice
        baseservice_model = BaseServiceModel(**test_baseservice)
        baseservice_service.get_by_id = MagicMock(return_value=baseservice_model)
        
        # Test successful deletion
        result = baseservice_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            baseservice_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
