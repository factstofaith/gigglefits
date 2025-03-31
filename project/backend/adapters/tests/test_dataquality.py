"""
Test DataQuality

Tests for the DataQuality component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import DataQuality as DataQualityModel
from .models import DataQualityCreate, DataQualityUpdate
from .service import DataQualityService

# Test data
test_dataquality = {
    "id": 1,
    "name": "Test DataQuality",
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
def dataquality_service(mock_db):
    """Create a DataQualityService with a mock DB session"""
    return DataQualityService(mock_db)

class TestDataQualityService:
    """Test DataQualityService functionality"""
    
    def test_get_all(self, dataquality_service, mock_db):
        """Test getting all dataqualitys"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [DataQualityModel(**test_dataquality)]
        
        # Test without tenant filtering
        result = dataquality_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_dataquality["id"]
        assert result[0].name == test_dataquality["name"]
        
        # Test with tenant filtering
        result = dataquality_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(DataQualityModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, dataquality_service, mock_db):
        """Test getting a dataquality by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = DataQualityModel(**test_dataquality)
        
        # Test successful retrieval
        result = dataquality_service.get_by_id(1)
        assert result.id == test_dataquality["id"]
        assert result.name == test_dataquality["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            dataquality_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, dataquality_service, mock_db):
        """Test creating a new dataquality"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new dataquality
        create_data = DataQualityCreate(
            name="New DataQuality",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = dataquality_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            dataquality_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, dataquality_service, mock_db):
        """Test updating a dataquality"""
        # Mock get_by_id to return a dataquality
        dataquality_model = DataQualityModel(**test_dataquality)
        dataquality_service.get_by_id = MagicMock(return_value=dataquality_model)
        
        # Test successful update
        update_data = DataQualityUpdate(name="Updated DataQuality")
        result = dataquality_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            dataquality_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, dataquality_service, mock_db):
        """Test deleting a dataquality"""
        # Mock get_by_id to return a dataquality
        dataquality_model = DataQualityModel(**test_dataquality)
        dataquality_service.get_by_id = MagicMock(return_value=dataquality_model)
        
        # Test successful deletion
        result = dataquality_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            dataquality_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
