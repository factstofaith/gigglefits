"""
Test UserModel

Tests for the UserModel component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import UserModel as UserModelModel
from .models import UserModelCreate, UserModelUpdate
from .service import UserModelService

# Test data
test_usermodel = {
    "id": 1,
    "name": "Test UserModel",
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
def usermodel_service(mock_db):
    """Create a UserModelService with a mock DB session"""
    return UserModelService(mock_db)

class TestUserModelService:
    """Test UserModelService functionality"""
    
    def test_get_all(self, usermodel_service, mock_db):
        """Test getting all usermodels"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [UserModelModel(**test_usermodel)]
        
        # Test without tenant filtering
        result = usermodel_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_usermodel["id"]
        assert result[0].name == test_usermodel["name"]
        
        # Test with tenant filtering
        result = usermodel_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(UserModelModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, usermodel_service, mock_db):
        """Test getting a usermodel by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = UserModelModel(**test_usermodel)
        
        # Test successful retrieval
        result = usermodel_service.get_by_id(1)
        assert result.id == test_usermodel["id"]
        assert result.name == test_usermodel["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            usermodel_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, usermodel_service, mock_db):
        """Test creating a new usermodel"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new usermodel
        create_data = UserModelCreate(
            name="New UserModel",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = usermodel_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            usermodel_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, usermodel_service, mock_db):
        """Test updating a usermodel"""
        # Mock get_by_id to return a usermodel
        usermodel_model = UserModelModel(**test_usermodel)
        usermodel_service.get_by_id = MagicMock(return_value=usermodel_model)
        
        # Test successful update
        update_data = UserModelUpdate(name="Updated UserModel")
        result = usermodel_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            usermodel_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, usermodel_service, mock_db):
        """Test deleting a usermodel"""
        # Mock get_by_id to return a usermodel
        usermodel_model = UserModelModel(**test_usermodel)
        usermodel_service.get_by_id = MagicMock(return_value=usermodel_model)
        
        # Test successful deletion
        result = usermodel_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            usermodel_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
