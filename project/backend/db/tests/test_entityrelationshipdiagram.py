"""
Test EntityRelationshipDiagram

Tests for the EntityRelationshipDiagram component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import EntityRelationshipDiagram as EntityRelationshipDiagramModel
from .models import EntityRelationshipDiagramCreate, EntityRelationshipDiagramUpdate
from .service import EntityRelationshipDiagramService

# Test data
test_entityrelationshipdiagram = {
    "id": 1,
    "name": "Test EntityRelationshipDiagram",
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
def entityrelationshipdiagram_service(mock_db):
    """Create a EntityRelationshipDiagramService with a mock DB session"""
    return EntityRelationshipDiagramService(mock_db)

class TestEntityRelationshipDiagramService:
    """Test EntityRelationshipDiagramService functionality"""
    
    def test_get_all(self, entityrelationshipdiagram_service, mock_db):
        """Test getting all entityrelationshipdiagrams"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [EntityRelationshipDiagramModel(**test_entityrelationshipdiagram)]
        
        # Test without tenant filtering
        result = entityrelationshipdiagram_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_entityrelationshipdiagram["id"]
        assert result[0].name == test_entityrelationshipdiagram["name"]
        
        # Test with tenant filtering
        result = entityrelationshipdiagram_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(EntityRelationshipDiagramModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, entityrelationshipdiagram_service, mock_db):
        """Test getting a entityrelationshipdiagram by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = EntityRelationshipDiagramModel(**test_entityrelationshipdiagram)
        
        # Test successful retrieval
        result = entityrelationshipdiagram_service.get_by_id(1)
        assert result.id == test_entityrelationshipdiagram["id"]
        assert result.name == test_entityrelationshipdiagram["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            entityrelationshipdiagram_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, entityrelationshipdiagram_service, mock_db):
        """Test creating a new entityrelationshipdiagram"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new entityrelationshipdiagram
        create_data = EntityRelationshipDiagramCreate(
            name="New EntityRelationshipDiagram",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = entityrelationshipdiagram_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            entityrelationshipdiagram_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, entityrelationshipdiagram_service, mock_db):
        """Test updating a entityrelationshipdiagram"""
        # Mock get_by_id to return a entityrelationshipdiagram
        entityrelationshipdiagram_model = EntityRelationshipDiagramModel(**test_entityrelationshipdiagram)
        entityrelationshipdiagram_service.get_by_id = MagicMock(return_value=entityrelationshipdiagram_model)
        
        # Test successful update
        update_data = EntityRelationshipDiagramUpdate(name="Updated EntityRelationshipDiagram")
        result = entityrelationshipdiagram_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            entityrelationshipdiagram_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, entityrelationshipdiagram_service, mock_db):
        """Test deleting a entityrelationshipdiagram"""
        # Mock get_by_id to return a entityrelationshipdiagram
        entityrelationshipdiagram_model = EntityRelationshipDiagramModel(**test_entityrelationshipdiagram)
        entityrelationshipdiagram_service.get_by_id = MagicMock(return_value=entityrelationshipdiagram_model)
        
        # Test successful deletion
        result = entityrelationshipdiagram_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            entityrelationshipdiagram_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
