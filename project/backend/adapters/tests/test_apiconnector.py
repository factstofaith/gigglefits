"""
Test APIConnector

Tests for the APIConnector component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import APIConnector as APIConnectorModel
from .models import APIConnectorCreate, APIConnectorUpdate
from .service import APIConnectorService

# Test data
test_apiconnector = {
    "id": 1,
    "name": "Test APIConnector",
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
def apiconnector_service(mock_db):
    """Create a APIConnectorService with a mock DB session"""
    return APIConnectorService(mock_db)

class TestAPIConnectorService:
    """Test APIConnectorService functionality"""
    
    def test_get_all(self, apiconnector_service, mock_db):
        """Test getting all apiconnectors"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [APIConnectorModel(**test_apiconnector)]
        
        # Test without tenant filtering
        result = apiconnector_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_apiconnector["id"]
        assert result[0].name == test_apiconnector["name"]
        
        # Test with tenant filtering
        result = apiconnector_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(APIConnectorModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, apiconnector_service, mock_db):
        """Test getting a apiconnector by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = APIConnectorModel(**test_apiconnector)
        
        # Test successful retrieval
        result = apiconnector_service.get_by_id(1)
        assert result.id == test_apiconnector["id"]
        assert result.name == test_apiconnector["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            apiconnector_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, apiconnector_service, mock_db):
        """Test creating a new apiconnector"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new apiconnector
        create_data = APIConnectorCreate(
            name="New APIConnector",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = apiconnector_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            apiconnector_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, apiconnector_service, mock_db):
        """Test updating a apiconnector"""
        # Mock get_by_id to return a apiconnector
        apiconnector_model = APIConnectorModel(**test_apiconnector)
        apiconnector_service.get_by_id = MagicMock(return_value=apiconnector_model)
        
        # Test successful update
        update_data = APIConnectorUpdate(name="Updated APIConnector")
        result = apiconnector_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            apiconnector_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, apiconnector_service, mock_db):
        """Test deleting a apiconnector"""
        # Mock get_by_id to return a apiconnector
        apiconnector_model = APIConnectorModel(**test_apiconnector)
        apiconnector_service.get_by_id = MagicMock(return_value=apiconnector_model)
        
        # Test successful deletion
        result = apiconnector_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            apiconnector_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
