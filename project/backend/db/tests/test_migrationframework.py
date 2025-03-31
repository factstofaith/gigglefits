"""
Test MigrationFramework

Tests for the MigrationFramework component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import MigrationFramework as MigrationFrameworkModel
from .models import MigrationFrameworkCreate, MigrationFrameworkUpdate
from .service import MigrationFrameworkService

# Test data
test_migrationframework = {
    "id": 1,
    "name": "Test MigrationFramework",
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
def migrationframework_service(mock_db):
    """Create a MigrationFrameworkService with a mock DB session"""
    return MigrationFrameworkService(mock_db)

class TestMigrationFrameworkService:
    """Test MigrationFrameworkService functionality"""
    
    def test_get_all(self, migrationframework_service, mock_db):
        """Test getting all migrationframeworks"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [MigrationFrameworkModel(**test_migrationframework)]
        
        # Test without tenant filtering
        result = migrationframework_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_migrationframework["id"]
        assert result[0].name == test_migrationframework["name"]
        
        # Test with tenant filtering
        result = migrationframework_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(MigrationFrameworkModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, migrationframework_service, mock_db):
        """Test getting a migrationframework by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = MigrationFrameworkModel(**test_migrationframework)
        
        # Test successful retrieval
        result = migrationframework_service.get_by_id(1)
        assert result.id == test_migrationframework["id"]
        assert result.name == test_migrationframework["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            migrationframework_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, migrationframework_service, mock_db):
        """Test creating a new migrationframework"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new migrationframework
        create_data = MigrationFrameworkCreate(
            name="New MigrationFramework",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = migrationframework_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            migrationframework_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, migrationframework_service, mock_db):
        """Test updating a migrationframework"""
        # Mock get_by_id to return a migrationframework
        migrationframework_model = MigrationFrameworkModel(**test_migrationframework)
        migrationframework_service.get_by_id = MagicMock(return_value=migrationframework_model)
        
        # Test successful update
        update_data = MigrationFrameworkUpdate(name="Updated MigrationFramework")
        result = migrationframework_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            migrationframework_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, migrationframework_service, mock_db):
        """Test deleting a migrationframework"""
        # Mock get_by_id to return a migrationframework
        migrationframework_model = MigrationFrameworkModel(**test_migrationframework)
        migrationframework_service.get_by_id = MagicMock(return_value=migrationframework_model)
        
        # Test successful deletion
        result = migrationframework_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            migrationframework_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
