"""
Test SharePointConnector

Tests for the SharePointConnector component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import SharePointConnector as SharePointConnectorModel
from .models import SharePointConnectorCreate, SharePointConnectorUpdate
from .service import SharePointConnectorService

# Test data
test_sharepointconnector = {
    "id": 1,
    "name": "Test SharePointConnector",
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
def sharepointconnector_service(mock_db):
    """Create a SharePointConnectorService with a mock DB session"""
    return SharePointConnectorService(mock_db)

class TestSharePointConnectorService:
    """Test SharePointConnectorService functionality"""
    
    def test_get_all(self, sharepointconnector_service, mock_db):
        """Test getting all sharepointconnectors"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [SharePointConnectorModel(**test_sharepointconnector)]
        
        # Test without tenant filtering
        result = sharepointconnector_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_sharepointconnector["id"]
        assert result[0].name == test_sharepointconnector["name"]
        
        # Test with tenant filtering
        result = sharepointconnector_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(SharePointConnectorModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, sharepointconnector_service, mock_db):
        """Test getting a sharepointconnector by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = SharePointConnectorModel(**test_sharepointconnector)
        
        # Test successful retrieval
        result = sharepointconnector_service.get_by_id(1)
        assert result.id == test_sharepointconnector["id"]
        assert result.name == test_sharepointconnector["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            sharepointconnector_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, sharepointconnector_service, mock_db):
        """Test creating a new sharepointconnector"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new sharepointconnector
        create_data = SharePointConnectorCreate(
            name="New SharePointConnector",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = sharepointconnector_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            sharepointconnector_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, sharepointconnector_service, mock_db):
        """Test updating a sharepointconnector"""
        # Mock get_by_id to return a sharepointconnector
        sharepointconnector_model = SharePointConnectorModel(**test_sharepointconnector)
        sharepointconnector_service.get_by_id = MagicMock(return_value=sharepointconnector_model)
        
        # Test successful update
        update_data = SharePointConnectorUpdate(name="Updated SharePointConnector")
        result = sharepointconnector_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            sharepointconnector_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, sharepointconnector_service, mock_db):
        """Test deleting a sharepointconnector"""
        # Mock get_by_id to return a sharepointconnector
        sharepointconnector_model = SharePointConnectorModel(**test_sharepointconnector)
        sharepointconnector_service.get_by_id = MagicMock(return_value=sharepointconnector_model)
        
        # Test successful deletion
        result = sharepointconnector_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            sharepointconnector_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
