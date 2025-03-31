"""
Test TransactionManager

Tests for the TransactionManager component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import TransactionManager as TransactionManagerModel
from .models import TransactionManagerCreate, TransactionManagerUpdate
from .service import TransactionManagerService

# Test data
test_transactionmanager = {
    "id": 1,
    "name": "Test TransactionManager",
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
def transactionmanager_service(mock_db):
    """Create a TransactionManagerService with a mock DB session"""
    return TransactionManagerService(mock_db)

class TestTransactionManagerService:
    """Test TransactionManagerService functionality"""
    
    def test_get_all(self, transactionmanager_service, mock_db):
        """Test getting all transactionmanagers"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [TransactionManagerModel(**test_transactionmanager)]
        
        # Test without tenant filtering
        result = transactionmanager_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_transactionmanager["id"]
        assert result[0].name == test_transactionmanager["name"]
        
        # Test with tenant filtering
        result = transactionmanager_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(TransactionManagerModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, transactionmanager_service, mock_db):
        """Test getting a transactionmanager by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = TransactionManagerModel(**test_transactionmanager)
        
        # Test successful retrieval
        result = transactionmanager_service.get_by_id(1)
        assert result.id == test_transactionmanager["id"]
        assert result.name == test_transactionmanager["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            transactionmanager_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, transactionmanager_service, mock_db):
        """Test creating a new transactionmanager"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new transactionmanager
        create_data = TransactionManagerCreate(
            name="New TransactionManager",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = transactionmanager_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            transactionmanager_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, transactionmanager_service, mock_db):
        """Test updating a transactionmanager"""
        # Mock get_by_id to return a transactionmanager
        transactionmanager_model = TransactionManagerModel(**test_transactionmanager)
        transactionmanager_service.get_by_id = MagicMock(return_value=transactionmanager_model)
        
        # Test successful update
        update_data = TransactionManagerUpdate(name="Updated TransactionManager")
        result = transactionmanager_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            transactionmanager_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, transactionmanager_service, mock_db):
        """Test deleting a transactionmanager"""
        # Mock get_by_id to return a transactionmanager
        transactionmanager_model = TransactionManagerModel(**test_transactionmanager)
        transactionmanager_service.get_by_id = MagicMock(return_value=transactionmanager_model)
        
        # Test successful deletion
        result = transactionmanager_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            transactionmanager_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
