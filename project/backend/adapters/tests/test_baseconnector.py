"""
Test BaseConnector

Tests for the BaseConnector component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import BaseConnector as BaseConnectorModel
from .models import BaseConnectorCreate, BaseConnectorUpdate
from .service import BaseConnectorService

# Test data
test_baseconnector = {
    "id": 1,
    "name": "Test BaseConnector",
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
def baseconnector_service(mock_db):
    """Create a BaseConnectorService with a mock DB session"""
    return BaseConnectorService(mock_db)

class TestBaseConnectorService:
    """Test BaseConnectorService functionality"""
    
    def test_get_all(self, baseconnector_service, mock_db):
        """Test getting all baseconnectors"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [BaseConnectorModel(**test_baseconnector)]
        
        # Test without tenant filtering
        result = baseconnector_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_baseconnector["id"]
        assert result[0].name == test_baseconnector["name"]
        
        # Test with tenant filtering
        result = baseconnector_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(BaseConnectorModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, baseconnector_service, mock_db):
        """Test getting a baseconnector by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = BaseConnectorModel(**test_baseconnector)
        
        # Test successful retrieval
        result = baseconnector_service.get_by_id(1)
        assert result.id == test_baseconnector["id"]
        assert result.name == test_baseconnector["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            baseconnector_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, baseconnector_service, mock_db):
        """Test creating a new baseconnector"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new baseconnector
        create_data = BaseConnectorCreate(
            name="New BaseConnector",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = baseconnector_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            baseconnector_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, baseconnector_service, mock_db):
        """Test updating a baseconnector"""
        # Mock get_by_id to return a baseconnector
        baseconnector_model = BaseConnectorModel(**test_baseconnector)
        baseconnector_service.get_by_id = MagicMock(return_value=baseconnector_model)
        
        # Test successful update
        update_data = BaseConnectorUpdate(name="Updated BaseConnector")
        result = baseconnector_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            baseconnector_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, baseconnector_service, mock_db):
        """Test deleting a baseconnector"""
        # Mock get_by_id to return a baseconnector
        baseconnector_model = BaseConnectorModel(**test_baseconnector)
        baseconnector_service.get_by_id = MagicMock(return_value=baseconnector_model)
        
        # Test successful deletion
        result = baseconnector_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            baseconnector_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
