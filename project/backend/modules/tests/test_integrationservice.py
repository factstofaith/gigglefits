"""
Test IntegrationService

Tests for the IntegrationService component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import IntegrationService as IntegrationServiceModel
from .models import IntegrationServiceCreate, IntegrationServiceUpdate
from .service import IntegrationServiceService

# Test data
test_integrationservice = {
    "id": 1,
    "name": "Test IntegrationService",
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
def integrationservice_service(mock_db):
    """Create a IntegrationServiceService with a mock DB session"""
    return IntegrationServiceService(mock_db)

class TestIntegrationServiceService:
    """Test IntegrationServiceService functionality"""
    
    def test_get_all(self, integrationservice_service, mock_db):
        """Test getting all integrationservices"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [IntegrationServiceModel(**test_integrationservice)]
        
        # Test without tenant filtering
        result = integrationservice_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_integrationservice["id"]
        assert result[0].name == test_integrationservice["name"]
        
        # Test with tenant filtering
        result = integrationservice_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(IntegrationServiceModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, integrationservice_service, mock_db):
        """Test getting a integrationservice by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = IntegrationServiceModel(**test_integrationservice)
        
        # Test successful retrieval
        result = integrationservice_service.get_by_id(1)
        assert result.id == test_integrationservice["id"]
        assert result.name == test_integrationservice["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            integrationservice_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, integrationservice_service, mock_db):
        """Test creating a new integrationservice"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new integrationservice
        create_data = IntegrationServiceCreate(
            name="New IntegrationService",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = integrationservice_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            integrationservice_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, integrationservice_service, mock_db):
        """Test updating a integrationservice"""
        # Mock get_by_id to return a integrationservice
        integrationservice_model = IntegrationServiceModel(**test_integrationservice)
        integrationservice_service.get_by_id = MagicMock(return_value=integrationservice_model)
        
        # Test successful update
        update_data = IntegrationServiceUpdate(name="Updated IntegrationService")
        result = integrationservice_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            integrationservice_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, integrationservice_service, mock_db):
        """Test deleting a integrationservice"""
        # Mock get_by_id to return a integrationservice
        integrationservice_model = IntegrationServiceModel(**test_integrationservice)
        integrationservice_service.get_by_id = MagicMock(return_value=integrationservice_model)
        
        # Test successful deletion
        result = integrationservice_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            integrationservice_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
