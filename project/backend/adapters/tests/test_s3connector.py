"""
Test S3Connector

Tests for the S3Connector component.
"""
import pytest
import datetime
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from db.models import S3Connector as S3ConnectorModel
from .models import S3ConnectorCreate, S3ConnectorUpdate
from .service import S3ConnectorService

# Test data
test_s3connector = {
    "id": 1,
    "name": "Test S3Connector",
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
def s3connector_service(mock_db):
    """Create a S3ConnectorService with a mock DB session"""
    return S3ConnectorService(mock_db)

class TestS3ConnectorService:
    """Test S3ConnectorService functionality"""
    
    def test_get_all(self, s3connector_service, mock_db):
        """Test getting all s3connectors"""
        # Mock query results
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [S3ConnectorModel(**test_s3connector)]
        
        # Test without tenant filtering
        result = s3connector_service.get_all(skip=0, limit=100)
        assert len(result) == 1
        assert result[0].id == test_s3connector["id"]
        assert result[0].name == test_s3connector["name"]
        
        # Test with tenant filtering
        result = s3connector_service.get_all(skip=0, limit=100, tenant_id="test-tenant")
        assert len(result) == 1
        mock_query.filter.assert_called_with(S3ConnectorModel.tenant_id == "test-tenant")
    
    def test_get_by_id(self, s3connector_service, mock_db):
        """Test getting a s3connector by ID"""
        # Mock query result
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = S3ConnectorModel(**test_s3connector)
        
        # Test successful retrieval
        result = s3connector_service.get_by_id(1)
        assert result.id == test_s3connector["id"]
        assert result.name == test_s3connector["name"]
        
        # Test 404 error
        mock_query.first.return_value = None
        with pytest.raises(Exception) as excinfo:
            s3connector_service.get_by_id(999)
        assert "not found" in str(excinfo.value)
    
    def test_create(self, s3connector_service, mock_db):
        """Test creating a new s3connector"""
        # Mock DB operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Create a new s3connector
        create_data = S3ConnectorCreate(
            name="New S3Connector",
            description="New description",
            tenant_id="test-tenant"
        )
        
        # Test successful creation
        result = s3connector_service.create(create_data)
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            s3connector_service.create(create_data)
        assert "Failed to create" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_update(self, s3connector_service, mock_db):
        """Test updating a s3connector"""
        # Mock get_by_id to return a s3connector
        s3connector_model = S3ConnectorModel(**test_s3connector)
        s3connector_service.get_by_id = MagicMock(return_value=s3connector_model)
        
        # Test successful update
        update_data = S3ConnectorUpdate(name="Updated S3Connector")
        result = s3connector_service.update(1, update_data)
        assert mock_db.commit.called
        assert mock_db.refresh.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            s3connector_service.update(1, update_data)
        assert "Failed to update" in str(excinfo.value)
        assert mock_db.rollback.called
    
    def test_delete(self, s3connector_service, mock_db):
        """Test deleting a s3connector"""
        # Mock get_by_id to return a s3connector
        s3connector_model = S3ConnectorModel(**test_s3connector)
        s3connector_service.get_by_id = MagicMock(return_value=s3connector_model)
        
        # Test successful deletion
        result = s3connector_service.delete(1)
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
        
        # Test error handling
        mock_db.commit.side_effect = Exception("DB error")
        with pytest.raises(Exception) as excinfo:
            s3connector_service.delete(1)
        assert "Failed to delete" in str(excinfo.value)
        assert mock_db.rollback.called
