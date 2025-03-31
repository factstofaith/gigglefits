"""
Test AzureBlobConnector

Tests for the AzureBlobConnector component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import AzureBlobConnector as AzureBlobConnectorModel
from .models import AzureBlobConnectorCreate, AzureBlobConnectorUpdate
from .service import AzureBlobConnectorService

# Test data
test_azureblobconnector = {
    "id": 1,
    "name": "Test AzureBlobConnector",
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
def azureblobconnector_service(mock_db):
    """Create a AzureBlobConnectorService with a mock DB session"""
    return AzureBlobConnectorService(mock_db)

class TestAzureBlobConnectorService:
    """Test AzureBlobConnectorService functionality"""
    
    def test_get_all(self, azureblobconnector_service, mock_db):
        """Test getting all azureblobconnectors"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [AzureBlobConnectorModel(**test_azureblobconnector)]
        
        # Test without tenant filtering
        result = azureblobconnector_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_azureblobconnector["id"]
        assert result[0].name == test_azureblobconnector["name"]
        
        # Test with tenant filtering
        result = azureblobconnector_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(AzureBlobConnectorModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, azureblobconnector_service, mock_db):
        """Test getting a azureblobconnector by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = AzureBlobConnectorModel(**test_azureblobconnector)
        
        # Test successful retrieval
        result = azureblobconnector_service.get_by_id(1)
        assert result.id == test_azureblobconnector["id"]
        assert result.name == test_azureblobconnector["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            azureblobconnector_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, azureblobconnector_service, mock_db):
        """Test creating a new azureblobconnector"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new azureblobconnector
        create_data = AzureBlobConnectorCreate(
            name="New AzureBlobConnector",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = azureblobconnector_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            azureblobconnector_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, azureblobconnector_service, mock_db):
        """Test updating a azureblobconnector"""
        # Mock get_by_id to return a azureblobconnector
        azureblobconnector_model = AzureBlobConnectorModel(**test_azureblobconnector)
        azureblobconnector_service.get_by_id = MagicMock(return_value=azureblobconnector_model)
        
        # Test successful update
        update_data = AzureBlobConnectorUpdate(name="Updated AzureBlobConnector")
        result = azureblobconnector_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            azureblobconnector_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, azureblobconnector_service, mock_db):
        """Test deleting a azureblobconnector"""
        # Mock get_by_id to return a azureblobconnector
        azureblobconnector_model = AzureBlobConnectorModel(**test_azureblobconnector)
        azureblobconnector_service.get_by_id = MagicMock(return_value=azureblobconnector_model)
        
        # Test successful deletion
        result = azureblobconnector_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            azureblobconnector_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
