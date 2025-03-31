"""
Test ETLPipeline

Tests for the ETLPipeline component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import ETLPipeline as ETLPipelineModel
from .models import ETLPipelineCreate, ETLPipelineUpdate
from .service import ETLPipelineService

# Test data
test_etlpipeline = {
    "id": 1,
    "name": "Test ETLPipeline",
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
def etlpipeline_service(mock_db):
    """Create a ETLPipelineService with a mock DB session"""
    return ETLPipelineService(mock_db)

class TestETLPipelineService:
    """Test ETLPipelineService functionality"""
    
    def test_get_all(self, etlpipeline_service, mock_db):
        """Test getting all etlpipelines"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [ETLPipelineModel(**test_etlpipeline)]
        
        # Test without tenant filtering
        result = etlpipeline_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_etlpipeline["id"]
        assert result[0].name == test_etlpipeline["name"]
        
        # Test with tenant filtering
        result = etlpipeline_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(ETLPipelineModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, etlpipeline_service, mock_db):
        """Test getting a etlpipeline by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = ETLPipelineModel(**test_etlpipeline)
        
        # Test successful retrieval
        result = etlpipeline_service.get_by_id(1)
        assert result.id == test_etlpipeline["id"]
        assert result.name == test_etlpipeline["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            etlpipeline_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, etlpipeline_service, mock_db):
        """Test creating a new etlpipeline"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new etlpipeline
        create_data = ETLPipelineCreate(
            name="New ETLPipeline",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = etlpipeline_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            etlpipeline_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, etlpipeline_service, mock_db):
        """Test updating a etlpipeline"""
        # Mock get_by_id to return a etlpipeline
        etlpipeline_model = ETLPipelineModel(**test_etlpipeline)
        etlpipeline_service.get_by_id = MagicMock(return_value=etlpipeline_model)
        
        # Test successful update
        update_data = ETLPipelineUpdate(name="Updated ETLPipeline")
        result = etlpipeline_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            etlpipeline_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, etlpipeline_service, mock_db):
        """Test deleting a etlpipeline"""
        # Mock get_by_id to return a etlpipeline
        etlpipeline_model = ETLPipelineModel(**test_etlpipeline)
        etlpipeline_service.get_by_id = MagicMock(return_value=etlpipeline_model)
        
        # Test successful deletion
        result = etlpipeline_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            etlpipeline_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
