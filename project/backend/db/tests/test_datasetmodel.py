"""
Test DatasetModel

Tests for the DatasetModel component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import DatasetModel as DatasetModelModel
from .models import DatasetModelCreate, DatasetModelUpdate
from .service import DatasetModelService

# Test data
test_datasetmodel = {
    "id": 1,
    "name": "Test DatasetModel",
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
def datasetmodel_service(mock_db):
    """Create a DatasetModelService with a mock DB session"""
    return DatasetModelService(mock_db)

class TestDatasetModelService:
    """Test DatasetModelService functionality"""
    
    def test_get_all(self, datasetmodel_service, mock_db):
        """Test getting all datasetmodels"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [DatasetModelModel(**test_datasetmodel)]
        
        # Test without tenant filtering
        result = datasetmodel_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_datasetmodel["id"]
        assert result[0].name == test_datasetmodel["name"]
        
        # Test with tenant filtering
        result = datasetmodel_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(DatasetModelModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, datasetmodel_service, mock_db):
        """Test getting a datasetmodel by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = DatasetModelModel(**test_datasetmodel)
        
        # Test successful retrieval
        result = datasetmodel_service.get_by_id(1)
        assert result.id == test_datasetmodel["id"]
        assert result.name == test_datasetmodel["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            datasetmodel_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, datasetmodel_service, mock_db):
        """Test creating a new datasetmodel"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new datasetmodel
        create_data = DatasetModelCreate(
            name="New DatasetModel",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = datasetmodel_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            datasetmodel_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, datasetmodel_service, mock_db):
        """Test updating a datasetmodel"""
        # Mock get_by_id to return a datasetmodel
        datasetmodel_model = DatasetModelModel(**test_datasetmodel)
        datasetmodel_service.get_by_id = MagicMock(return_value=datasetmodel_model)
        
        # Test successful update
        update_data = DatasetModelUpdate(name="Updated DatasetModel")
        result = datasetmodel_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            datasetmodel_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, datasetmodel_service, mock_db):
        """Test deleting a datasetmodel"""
        # Mock get_by_id to return a datasetmodel
        datasetmodel_model = DatasetModelModel(**test_datasetmodel)
        datasetmodel_service.get_by_id = MagicMock(return_value=datasetmodel_model)
        
        # Test successful deletion
        result = datasetmodel_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            datasetmodel_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
