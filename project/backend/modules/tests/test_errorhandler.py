"""
Test ErrorHandler

Tests for the ErrorHandler component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import ErrorHandler as ErrorHandlerModel
from .models import ErrorHandlerCreate, ErrorHandlerUpdate
from .service import ErrorHandlerService

# Test data
test_errorhandler = {
    "id": 1,
    "name": "Test ErrorHandler",
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
def errorhandler_service(mock_db):
    """Create a ErrorHandlerService with a mock DB session"""
    return ErrorHandlerService(mock_db)

class TestErrorHandlerService:
    """Test ErrorHandlerService functionality"""
    
    def test_get_all(self, errorhandler_service, mock_db):
        """Test getting all errorhandlers"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [ErrorHandlerModel(**test_errorhandler)]
        
        # Test without tenant filtering
        result = errorhandler_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_errorhandler["id"]
        assert result[0].name == test_errorhandler["name"]
        
        # Test with tenant filtering
        result = errorhandler_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(ErrorHandlerModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, errorhandler_service, mock_db):
        """Test getting a errorhandler by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = ErrorHandlerModel(**test_errorhandler)
        
        # Test successful retrieval
        result = errorhandler_service.get_by_id(1)
        assert result.id == test_errorhandler["id"]
        assert result.name == test_errorhandler["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            errorhandler_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, errorhandler_service, mock_db):
        """Test creating a new errorhandler"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new errorhandler
        create_data = ErrorHandlerCreate(
            name="New ErrorHandler",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = errorhandler_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            errorhandler_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, errorhandler_service, mock_db):
        """Test updating a errorhandler"""
        # Mock get_by_id to return a errorhandler
        errorhandler_model = ErrorHandlerModel(**test_errorhandler)
        errorhandler_service.get_by_id = MagicMock(return_value=errorhandler_model)
        
        # Test successful update
        update_data = ErrorHandlerUpdate(name="Updated ErrorHandler")
        result = errorhandler_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            errorhandler_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, errorhandler_service, mock_db):
        """Test deleting a errorhandler"""
        # Mock get_by_id to return a errorhandler
        errorhandler_model = ErrorHandlerModel(**test_errorhandler)
        errorhandler_service.get_by_id = MagicMock(return_value=errorhandler_model)
        
        # Test successful deletion
        result = errorhandler_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            errorhandler_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
