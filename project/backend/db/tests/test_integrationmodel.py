"""
Test IntegrationModel

Tests for the IntegrationModel component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import IntegrationModel as IntegrationModelModel
from .models import IntegrationModelCreate, IntegrationModelUpdate
from .service import IntegrationModelService

# Test data
test_integrationmodel = {
    "id": 1,
    "name": "Test IntegrationModel",
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
def integrationmodel_service(mock_db):
    """Create a IntegrationModelService with a mock DB session"""
    return IntegrationModelService(mock_db)

class TestIntegrationModelService:
    """Test IntegrationModelService functionality"""
    
    def test_get_all(self, integrationmodel_service, mock_db):
        """Test getting all integrationmodels"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [IntegrationModelModel(**test_integrationmodel)]
        
        # Test without tenant filtering
        result = integrationmodel_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_integrationmodel["id"]
        assert result[0].name == test_integrationmodel["name"]
        
        # Test with tenant filtering
        result = integrationmodel_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(IntegrationModelModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, integrationmodel_service, mock_db):
        """Test getting a integrationmodel by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = IntegrationModelModel(**test_integrationmodel)
        
        # Test successful retrieval
        result = integrationmodel_service.get_by_id(1)
        assert result.id == test_integrationmodel["id"]
        assert result.name == test_integrationmodel["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            integrationmodel_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, integrationmodel_service, mock_db):
        """Test creating a new integrationmodel"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new integrationmodel
        create_data = IntegrationModelCreate(
            name="New IntegrationModel",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = integrationmodel_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            integrationmodel_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, integrationmodel_service, mock_db):
        """Test updating a integrationmodel"""
        # Mock get_by_id to return a integrationmodel
        integrationmodel_model = IntegrationModelModel(**test_integrationmodel)
        integrationmodel_service.get_by_id = MagicMock(return_value=integrationmodel_model)
        
        # Test successful update
        update_data = IntegrationModelUpdate(name="Updated IntegrationModel")
        result = integrationmodel_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            integrationmodel_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, integrationmodel_service, mock_db):
        """Test deleting a integrationmodel"""
        # Mock get_by_id to return a integrationmodel
        integrationmodel_model = IntegrationModelModel(**test_integrationmodel)
        integrationmodel_service.get_by_id = MagicMock(return_value=integrationmodel_model)
        
        # Test successful deletion
        result = integrationmodel_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            integrationmodel_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
