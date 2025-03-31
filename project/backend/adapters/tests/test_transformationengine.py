"""
Test TransformationEngine

Tests for the TransformationEngine component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import TransformationEngine as TransformationEngineModel
from .models import TransformationEngineCreate, TransformationEngineUpdate
from .service import TransformationEngineService

# Test data
test_transformationengine = {
    "id": 1,
    "name": "Test TransformationEngine",
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
def transformationengine_service(mock_db):
    """Create a TransformationEngineService with a mock DB session"""
    return TransformationEngineService(mock_db)

class TestTransformationEngineService:
    """Test TransformationEngineService functionality"""
    
    def test_get_all(self, transformationengine_service, mock_db):
        """Test getting all transformationengines"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [TransformationEngineModel(**test_transformationengine)]
        
        # Test without tenant filtering
        result = transformationengine_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_transformationengine["id"]
        assert result[0].name == test_transformationengine["name"]
        
        # Test with tenant filtering
        result = transformationengine_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(TransformationEngineModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, transformationengine_service, mock_db):
        """Test getting a transformationengine by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = TransformationEngineModel(**test_transformationengine)
        
        # Test successful retrieval
        result = transformationengine_service.get_by_id(1)
        assert result.id == test_transformationengine["id"]
        assert result.name == test_transformationengine["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            transformationengine_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, transformationengine_service, mock_db):
        """Test creating a new transformationengine"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new transformationengine
        create_data = TransformationEngineCreate(
            name="New TransformationEngine",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = transformationengine_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            transformationengine_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, transformationengine_service, mock_db):
        """Test updating a transformationengine"""
        # Mock get_by_id to return a transformationengine
        transformationengine_model = TransformationEngineModel(**test_transformationengine)
        transformationengine_service.get_by_id = MagicMock(return_value=transformationengine_model)
        
        # Test successful update
        update_data = TransformationEngineUpdate(name="Updated TransformationEngine")
        result = transformationengine_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            transformationengine_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, transformationengine_service, mock_db):
        """Test deleting a transformationengine"""
        # Mock get_by_id to return a transformationengine
        transformationengine_model = TransformationEngineModel(**test_transformationengine)
        transformationengine_service.get_by_id = MagicMock(return_value=transformationengine_model)
        
        # Test successful deletion
        result = transformationengine_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            transformationengine_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
