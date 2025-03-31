"""
Test UserService

Tests for the UserService component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import UserService as UserServiceModel
from .models import UserServiceCreate, UserServiceUpdate
from .service import UserServiceService

# Test data
test_userservice = {
    "id": 1,
    "name": "Test UserService",
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
def userservice_service(mock_db):
    """Create a UserServiceService with a mock DB session"""
    return UserServiceService(mock_db)

class TestUserServiceService:
    """Test UserServiceService functionality"""
    
    def test_get_all(self, userservice_service, mock_db):
        """Test getting all userservices"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [UserServiceModel(**test_userservice)]
        
        # Test without tenant filtering
        result = userservice_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_userservice["id"]
        assert result[0].name == test_userservice["name"]
        
        # Test with tenant filtering
        result = userservice_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(UserServiceModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, userservice_service, mock_db):
        """Test getting a userservice by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = UserServiceModel(**test_userservice)
        
        # Test successful retrieval
        result = userservice_service.get_by_id(1)
        assert result.id == test_userservice["id"]
        assert result.name == test_userservice["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            userservice_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, userservice_service, mock_db):
        """Test creating a new userservice"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new userservice
        create_data = UserServiceCreate(
            name="New UserService",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = userservice_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            userservice_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, userservice_service, mock_db):
        """Test updating a userservice"""
        # Mock get_by_id to return a userservice
        userservice_model = UserServiceModel(**test_userservice)
        userservice_service.get_by_id = MagicMock(return_value=userservice_model)
        
        # Test successful update
        update_data = UserServiceUpdate(name="Updated UserService")
        result = userservice_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            userservice_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, userservice_service, mock_db):
        """Test deleting a userservice"""
        # Mock get_by_id to return a userservice
        userservice_model = UserServiceModel(**test_userservice)
        userservice_service.get_by_id = MagicMock(return_value=userservice_model)
        
        # Test successful deletion
        result = userservice_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            userservice_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
