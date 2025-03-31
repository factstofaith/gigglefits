"""
Test DatasetService

Tests for the DatasetService component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import DatasetService as DatasetServiceModel
from .models import DatasetServiceCreate, DatasetServiceUpdate
from .service import DatasetServiceService

# Test data
test_datasetservice = {
    "id": 1,
    "name": "Test DatasetService",
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
def datasetservice_service(mock_db):
    """Create a DatasetServiceService with a mock DB session"""
    return DatasetServiceService(mock_db)

class TestDatasetServiceService:
    """Test DatasetServiceService functionality"""
    
    def test_get_all(self, datasetservice_service, mock_db):
        """Test getting all datasetservices"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [DatasetServiceModel(**test_datasetservice)]
        
        # Test without tenant filtering
        result = datasetservice_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_datasetservice["id"]
        assert result[0].name == test_datasetservice["name"]
        
        # Test with tenant filtering
        result = datasetservice_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(DatasetServiceModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, datasetservice_service, mock_db):
        """Test getting a datasetservice by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = DatasetServiceModel(**test_datasetservice)
        
        # Test successful retrieval
        result = datasetservice_service.get_by_id(1)
        assert result.id == test_datasetservice["id"]
        assert result.name == test_datasetservice["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            datasetservice_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, datasetservice_service, mock_db):
        """Test creating a new datasetservice"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new datasetservice
        create_data = DatasetServiceCreate(
            name="New DatasetService",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = datasetservice_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            datasetservice_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, datasetservice_service, mock_db):
        """Test updating a datasetservice"""
        # Mock get_by_id to return a datasetservice
        datasetservice_model = DatasetServiceModel(**test_datasetservice)
        datasetservice_service.get_by_id = MagicMock(return_value=datasetservice_model)
        
        # Test successful update
        update_data = DatasetServiceUpdate(name="Updated DatasetService")
        result = datasetservice_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            datasetservice_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, datasetservice_service, mock_db):
        """Test deleting a datasetservice"""
        # Mock get_by_id to return a datasetservice
        datasetservice_model = DatasetServiceModel(**test_datasetservice)
        datasetservice_service.get_by_id = MagicMock(return_value=datasetservice_model)
        
        # Test successful deletion
        result = datasetservice_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            datasetservice_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
