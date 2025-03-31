"""
Test SchemaValidator

Tests for the SchemaValidator component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import SchemaValidator as SchemaValidatorModel
from .models import SchemaValidatorCreate, SchemaValidatorUpdate
from .service import SchemaValidatorService

# Test data
test_schemavalidator = {
    "id": 1,
    "name": "Test SchemaValidator",
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
def schemavalidator_service(mock_db):
    """Create a SchemaValidatorService with a mock DB session"""
    return SchemaValidatorService(mock_db)

class TestSchemaValidatorService:
    """Test SchemaValidatorService functionality"""
    
    def test_get_all(self, schemavalidator_service, mock_db):
        """Test getting all schemavalidators"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [SchemaValidatorModel(**test_schemavalidator)]
        
        # Test without tenant filtering
        result = schemavalidator_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_schemavalidator["id"]
        assert result[0].name == test_schemavalidator["name"]
        
        # Test with tenant filtering
        result = schemavalidator_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(SchemaValidatorModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, schemavalidator_service, mock_db):
        """Test getting a schemavalidator by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = SchemaValidatorModel(**test_schemavalidator)
        
        # Test successful retrieval
        result = schemavalidator_service.get_by_id(1)
        assert result.id == test_schemavalidator["id"]
        assert result.name == test_schemavalidator["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            schemavalidator_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, schemavalidator_service, mock_db):
        """Test creating a new schemavalidator"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new schemavalidator
        create_data = SchemaValidatorCreate(
            name="New SchemaValidator",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = schemavalidator_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            schemavalidator_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, schemavalidator_service, mock_db):
        """Test updating a schemavalidator"""
        # Mock get_by_id to return a schemavalidator
        schemavalidator_model = SchemaValidatorModel(**test_schemavalidator)
        schemavalidator_service.get_by_id = MagicMock(return_value=schemavalidator_model)
        
        # Test successful update
        update_data = SchemaValidatorUpdate(name="Updated SchemaValidator")
        result = schemavalidator_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            schemavalidator_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, schemavalidator_service, mock_db):
        """Test deleting a schemavalidator"""
        # Mock get_by_id to return a schemavalidator
        schemavalidator_model = SchemaValidatorModel(**test_schemavalidator)
        schemavalidator_service.get_by_id = MagicMock(return_value=schemavalidator_model)
        
        # Test successful deletion
        result = schemavalidator_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            schemavalidator_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
