"""
Tests for Admin Service

This module contains tests for the admin service functionality.
"""

import pytest
from datetime import datetime, timedelta, UTC
from unittest.mock import MagicMock, patch

from modules.admin.service import AdminService
from modules.admin.models import (
    Application,
    ApplicationCreate,
    ApplicationStatus,
    ApplicationType,
    AuthType,
    Dataset,
    DatasetCreate,
    DatasetStatus,
    DatasetField,
    DataType,
    Release,
    ReleaseCreate,
    ReleaseStatus,
    Tenant,
    TenantCreate,
    TenantStatus,
    TenantTier,
    WebhookCreate,
    WebhookStatus,
    WebhookEventType,
    WebhookAuthType
)


class TestAdminService:
    """Test suite for AdminService class."""
    
    def setup_method(self):
        """Set up test environment before each test."""
        self.db_session = MagicMock()
        self.admin_service = AdminService(self.db_session)
    
    #
    # Application Tests
    #
    def test_create_application(self, admin_adapter):
        """Test creating a new application."""
        # Arrange
        app_create = ApplicationCreate(
            name="Test Application",
            type=ApplicationType.API,
            description="Test Description",
            auth_type=AuthType.API_KEY,
            status=ApplicationStatus.DRAFT,
            is_public=True,
            created_by="test-admin"
        )
        
        # Mock the DB session
        self.db_session.add.return_value = None
        self.db_session.commit.return_value = None
        
        # Setup created application
        created_app = Application(
            id=1,
            name=app_create.name,
            type=app_create.type,
            description=app_create.description,
            auth_type=app_create.auth_type,
            status=app_create.status,
            is_public=app_create.is_public,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            created_by="test-admin"
        )
        self.db_session.query().filter().first.return_value = None  # No existing app
        self.db_session.query().get.return_value = created_app
        
        # Act
        result = self.admin_service.create_application(app_create, "test-admin")
        
        # Assert
        assert result is not None
        assert result.name == app_create.name
        assert result.type == app_create.type
        assert result.description == app_create.description
        assert result.status == app_create.status
        assert result.is_public == app_create.is_public
        assert self.db_session.add.called
        assert self.db_session.commit.called
    
    def test_get_application(self, admin_adapter):
        """Test retrieving an application by ID."""
        # Arrange
        app_id = 1
        mock_app = Application(
            id=app_id,
            name="Test Application",
            type=ApplicationType.API,
            description="Test Description",
            auth_type=AuthType.API_KEY,
            status=ApplicationStatus.DRAFT,
            is_public=True,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            created_by="test-admin"
        )
        
        # Mock the DB session
        self.db_session.query().get.return_value = mock_app
        
        # Act
        result = self.admin_service.get_application(app_id)
        
        # Assert
        assert result is not None
        assert result.id == app_id
        assert result.name == mock_app.name
        assert result.type == mock_app.type
        assert result.description == mock_app.description
    
    def test_get_application_not_found(self, admin_adapter):
        """Test retrieving a non-existent application."""
        # Arrange
        app_id = 999
        
        # Mock the DB session
        self.db_session.query().get.return_value = None
        
        # Act
        result = self.admin_service.get_application(app_id)
        
        # Assert
        assert result is None
    
    def test_update_application(self, admin_adapter):
        """Test updating an application."""
        # Arrange
        app_id = 1
        mock_app = Application(
            id=app_id,
            name="Test Application",
            type=ApplicationType.API,
            description="Test Description",
            auth_type=AuthType.API_KEY,
            status=ApplicationStatus.DRAFT,
            is_public=True,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            created_by="test-admin"
        )
        
        update_data = {
            "name": "Updated Application",
            "description": "Updated Description",
            "status": ApplicationStatus.ACTIVE
        }
        
        # Mock the DB session
        self.db_session.query().get.return_value = mock_app
        self.db_session.commit.return_value = None
        
        # Act
        result = self.admin_service.update_application(app_id, update_data)
        
        # Assert
        assert result is not None
        assert result.name == update_data["name"]
        assert result.description == update_data["description"]
        assert result.status == update_data["status"]
        assert self.db_session.commit.called
    
    def test_delete_application(self, admin_adapter):
        """Test deleting an application."""
        # Arrange
        app_id = 1
        mock_app = Application(
            id=app_id,
            name="Test Application",
            type=ApplicationType.API,
            description="Test Description",
            auth_type=AuthType.API_KEY,
            status=ApplicationStatus.DRAFT,
            is_public=True,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            created_by="test-admin"
        )
        
        # Mock the DB session
        self.db_session.query().get.return_value = mock_app
        self.db_session.delete.return_value = None
        self.db_session.commit.return_value = None
        
        # Act
        result = self.admin_service.delete_application(app_id)
        
        # Assert
        assert result is True
        assert self.db_session.delete.called
        assert self.db_session.commit.called
    
    def test_delete_application_not_found(self, admin_adapter):
        """Test deleting a non-existent application."""
        # Arrange
        app_id = 999
        
        # Mock the DB session
        self.db_session.query().get.return_value = None
        
        # Act
        result = self.admin_service.delete_application(app_id)
        
        # Assert
        assert result is False
        assert not self.db_session.delete.called
        assert not self.db_session.commit.called
    
    #
    # Dataset Tests
    #
    def test_create_dataset(self, admin_adapter):
        """Test creating a new dataset."""
        # Arrange
        fields = [
            DatasetField(
                name="field1",
                description="First field",
                type=DataType.STRING,
                required=True
            ),
            DatasetField(
                name="field2",
                description="Second field",
                type=DataType.INTEGER,
                required=False
            )
        ]
        
        dataset_create = DatasetCreate(
            name="Test Dataset",
            description="Test Dataset Description",
            fields=fields,
            status=DatasetStatus.DRAFT,
            is_public=True
        )
        
        # Mock the DB session
        self.db_session.add.return_value = None
        self.db_session.commit.return_value = None
        
        # Setup created dataset
        created_dataset = Dataset(
            id=1,
            name=dataset_create.name,
            description=dataset_create.description,
            fields=dataset_create.fields,
            status=dataset_create.status,
            is_public=dataset_create.is_public,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            created_by="test-admin"
        )
        self.db_session.query().filter().first.return_value = None  # No existing dataset
        self.db_session.query().get.return_value = created_dataset
        
        # Act
        result = self.admin_service.create_dataset(dataset_create, "test-admin")
        
        # Assert
        assert result is not None
        assert result.name == dataset_create.name
        assert result.description == dataset_create.description
        assert len(result.fields) == len(fields)
        assert result.status == dataset_create.status
        assert result.is_public == dataset_create.is_public
        assert self.db_session.add.called
        assert self.db_session.commit.called
    
    #
    # Release Tests
    #
    def test_create_release(self, admin_adapter):
        """Test creating a new release."""
        # Arrange
        release_create = ReleaseCreate(
            name="Test Release",
            description="Test Release Description",
            version="1.0.0",
            status=ReleaseStatus.DRAFT,
            items=[],
            tenants=["tenant-1", "tenant-2"]
        )
        
        # Mock the DB session
        self.db_session.add.return_value = None
        self.db_session.commit.return_value = None
        
        # Setup created release
        created_release = Release(
            id=1,
            name=release_create.name,
            description=release_create.description,
            version=release_create.version,
            status=release_create.status,
            items=release_create.items,
            tenants=release_create.tenants,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            created_by="test-admin",
            completed_at=None
        )
        self.db_session.query().filter().first.return_value = None  # No existing release
        self.db_session.query().get.return_value = created_release
        
        # Act
        result = self.admin_service.create_release(release_create, "test-admin")
        
        # Assert
        assert result is not None
        assert result.name == release_create.name
        assert result.description == release_create.description
        assert result.version == release_create.version
        assert result.status == release_create.status
        assert len(result.tenants) == len(release_create.tenants)
        assert self.db_session.add.called
        assert self.db_session.commit.called
    
    #
    # Tenant Tests
    #
    def test_create_tenant(self, admin_adapter):
        """Test creating a new tenant."""
        # Arrange
        tenant_create = TenantCreate(
            name="Test Tenant",
            description="Test Tenant Description",
            status=TenantStatus.ACTIVE,
            tier=TenantTier.STANDARD,
            settings={"setting1": "value1", "setting2": "value2"}
        )
        
        # Mock the DB session
        self.db_session.add.return_value = None
        self.db_session.commit.return_value = None
        
        # Setup created tenant
        created_tenant = Tenant(
            id="tenant-1",
            name=tenant_create.name,
            description=tenant_create.description,
            status=tenant_create.status,
            tier=tenant_create.tier,
            settings=tenant_create.settings,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC)
        )
        self.db_session.query().filter().first.return_value = None  # No existing tenant
        self.db_session.query().get.return_value = created_tenant
        
        # Act
        result = self.admin_service.create_tenant(tenant_create)
        
        # Assert
        assert result is not None
        assert result.name == tenant_create.name
        assert result.description == tenant_create.description
        assert result.status == tenant_create.status
        assert result.tier == tenant_create.tier
        assert result.settings == tenant_create.settings
        assert self.db_session.add.called
        assert self.db_session.commit.called
    
    #
    # Webhook Tests
    #
    def test_create_webhook(self, admin_adapter):
        """Test creating a new webhook."""
        # Arrange
        webhook_create = WebhookCreate(
            name="Test Webhook",
            url="https://example.com/webhook",
            description="Test webhook description",
            auth_type=WebhookAuthType.NONE,
            events=[WebhookEventType.INTEGRATION_CREATED, WebhookEventType.INTEGRATION_UPDATED],
            tenant_id="tenant-1",
            timeout_seconds=10,
            retry_count=3,
            retry_interval_seconds=60
        )
        
        # Mock the DB session
        self.db_session.add.return_value = None
        self.db_session.commit.return_value = None
        
        # Act
        result = self.admin_service.create_webhook(webhook_create, "test-admin")
        
        # Assert
        assert result is not None
        assert result.name == webhook_create.name
        assert result.url == webhook_create.url
        assert result.description == webhook_create.description
        assert result.auth_type == webhook_create.auth_type
        assert set(result.events) == set(webhook_create.events)
        assert result.tenant_id == webhook_create.tenant_id
        assert result.timeout_seconds == webhook_create.timeout_seconds
        assert result.retry_count == webhook_create.retry_count
        assert result.retry_interval_seconds == webhook_create.retry_interval_seconds
        assert self.db_session.add.called
        assert self.db_session.commit.called
    
    def test_test_webhook(self, admin_adapter):
        """Test the test_webhook functionality."""
        # Arrange
        webhook_test_request = {
            "url": "https://example.com/webhook",
            "auth_type": WebhookAuthType.NONE,
            "payload": {"event": "test_event", "data": {"key": "value"}},
            "event_type": WebhookEventType.INTEGRATION_CREATED
        }
        
        # Mock the requests module
        with patch('modules.admin.service.requests.post') as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.text = '{"status": "success"}'
            mock_response.elapsed.total_seconds.return_value = 0.5
            mock_post.return_value = mock_response
            
            # Act
            result = self.admin_service.test_webhook(webhook_test_request)
            
            # Assert
            assert result is not None
            assert result.success is True
            assert result.status_code == 200
            assert result.response_body == '{"status": "success"}'
            assert result.request_duration_ms > 0
            mock_post.assert_called_once()
    
    def test_test_webhook_failure(self, admin_adapter):
        """Test the test_webhook functionality with a failure."""
        # Arrange
        webhook_test_request = {
            "url": "https://example.com/webhook",
            "auth_type": WebhookAuthType.NONE,
            "payload": {"event": "test_event", "data": {"key": "value"}},
            "event_type": WebhookEventType.INTEGRATION_CREATED
        }
        
        # Mock the requests module to raise an exception
        with patch('modules.admin.service.requests.post') as mock_post:
            mock_post.side_effect = Exception("Connection error")
            
            # Act
            result = self.admin_service.test_webhook(webhook_test_request)
            
            # Assert
            assert result is not None
            assert result.success is False
            assert result.status_code is None
            assert "Connection error" in result.error_message
            assert result.request_duration_ms > 0
            mock_post.assert_called_once()