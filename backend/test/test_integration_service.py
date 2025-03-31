"""
Tests for Integration Service

This module contains tests for the integration service functionality.
"""

import pytest
from datetime import datetime, UTC
from unittest.mock import MagicMock, patch

from modules.integrations.service import IntegrationService
from modules.integrations.models import (
    Integration,
    IntegrationCreate,
    IntegrationUpdate,
    IntegrationType,
    IntegrationHealth,
    FieldMapping,
    FieldMappingCreate,
    FieldMappingUpdate,
    EarningsMapping,
    EarningsMappingCreate,
    ScheduleType,
    ScheduleConfig
)

from test_adapters.service_test_framework import ServiceTestAdapter, BaseServiceTest


class TestIntegrationService:
    """Test suite for IntegrationService class."""
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry, integration_adapter):
        """Set up test environment before each test."""
        # Create a service test adapter
        self.service_adapter = ServiceTestAdapter(registry=entity_registry, service_class=IntegrationService)
        
        # Set up the service test with the integration adapter
        self.service_test = self.service_adapter.setup_service_test({"integration_adapter": integration_adapter})
        
        # Get the service instance and DB session for convenience
        self.service = self.service_test.service_instance
        self.db = self.service_test.db_session
        self.integration_adapter = integration_adapter
        
        # Register models with entity types
        self.service_adapter.register_model(Integration, "Integration")
        self.service_adapter.register_model(FieldMapping, "FieldMapping")
        
        # Yield to the test
        yield
        
        # Reset after the test
        self.service_test.reset()
    
    def test_get_available_sources(self):
        """Test getting available sources for an integration type."""
        # Act
        api_sources = self.service.get_available_sources("API-based")
        file_sources = self.service.get_available_sources("File-based")
        db_sources = self.service.get_available_sources("Database")
        
        # Assert
        assert isinstance(api_sources, list)
        assert isinstance(file_sources, list)
        assert isinstance(db_sources, list)
        assert "Workday (HR)" in api_sources
        assert "Azure Blob Container" in file_sources
        assert "MySQL" in db_sources
    
    def test_create_integration(self):
        """Test creating a new integration."""
        # Arrange
        schedule_config = ScheduleConfig(
            type=ScheduleType.DAILY_2AM,
            timezone="UTC"
        )
        
        integration_create = IntegrationCreate(
            name="Test Integration",
            type=IntegrationType.API,
            source="Workday (HR)",
            destination="ADP (Payroll)",
            description="Test integration description",
            tenant_id="tenant-1",
            owner_id="user-1",
            schedule=schedule_config.model_dump(),
            tags=["test", "integration"]
        )
        
        # Mock DB interactions
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        # Mock queries for tags
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None  # Tag doesn't exist yet
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Act
        result = self.service.create_integration(integration_create, "tenant-1")
        
        # Assert
        assert result is not None
        assert result.name == integration_create.name
        assert result.type == integration_create.type.value
        assert result.source == integration_create.source
        assert result.destination == integration_create.destination
        assert result.description == integration_create.description
        assert result.tenant_id == "tenant-1"
        assert result.owner_id == integration_create.owner_id
        assert result.health == IntegrationHealth.HEALTHY.value
        assert self.db.add.called
        assert self.db.commit.called
    
    def test_get_integration(self):
        """Test retrieving an integration by ID."""
        # Arrange
        integration_id = 1
        
        # Create test integration via adapter
        test_integration = self.integration_adapter.create_integration({
            "name": "Test Integration",
            "type": "API-based",
            "source": "Workday (HR)",
            "destination": "ADP (Payroll)",
            "description": "Test integration description",
            "tenant_id": "tenant-1",
            "owner_id": "user-1",
            "health": "healthy"
        })
        
        # Mock DB query
        mock_integration = MagicMock()
        mock_integration.id = integration_id
        mock_integration.name = test_integration["name"]
        mock_integration.type.value = test_integration["type"]
        mock_integration.source = test_integration["source"]
        mock_integration.destination = test_integration["destination"]
        mock_integration.description = test_integration["description"]
        mock_integration.tenant_id = test_integration["tenant_id"]
        mock_integration.owner_id = test_integration["owner_id"]
        mock_integration.health.value = test_integration["health"]
        mock_integration.created_at = test_integration["created_at"]
        mock_integration.updated_at = test_integration["updated_at"]
        mock_integration.last_run_at = None
        mock_integration.tags = []
        
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = mock_integration
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Act
        result = self.service.get_integration(integration_id)
        
        # Assert
        assert result is not None
        assert result.id == integration_id
        assert result.name == test_integration["name"]
        assert result.type == test_integration["type"]
        assert result.source == test_integration["source"]
        assert result.description == test_integration["description"]
    
    def test_get_integration_not_found(self):
        """Test retrieving a non-existent integration."""
        # Arrange
        integration_id = 999
        
        # Mock DB query to return None
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Act
        result = self.service.get_integration(integration_id)
        
        # Assert
        assert result is None
    
    def test_update_integration(self):
        """Test updating an integration."""
        # Arrange
        integration_id = 1
        
        # Create test integration via adapter
        test_integration = self.integration_adapter.create_integration({
            "name": "Test Integration",
            "type": "API-based",
            "source": "Workday (HR)",
            "destination": "ADP (Payroll)",
            "description": "Test integration description",
            "tenant_id": "tenant-1",
            "owner_id": "user-1",
            "health": "healthy"
        })
        
        # Mock DB query
        mock_integration = MagicMock()
        mock_integration.id = integration_id
        mock_integration.name = test_integration["name"]
        mock_integration.type.value = test_integration["type"]
        mock_integration.source = test_integration["source"]
        mock_integration.destination = test_integration["destination"]
        mock_integration.description = test_integration["description"]
        mock_integration.tenant_id = test_integration["tenant_id"]
        mock_integration.owner_id = test_integration["owner_id"]
        mock_integration.health.value = test_integration["health"]
        mock_integration.created_at = test_integration["created_at"]
        mock_integration.updated_at = test_integration["updated_at"]
        mock_integration.last_run_at = None
        mock_integration.tags = []
        
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = mock_integration
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Update data
        update_data = IntegrationUpdate(
            name="Updated Integration",
            description="Updated description",
            health=IntegrationHealth.WARNING
        )
        
        # Act
        result = self.service.update_integration(integration_id, update_data)
        
        # Assert
        assert result is not None
        assert result.name == update_data.name
        assert result.description == update_data.description
        assert result.health == IntegrationHealth.WARNING.value
        assert self.db.commit.called
    
    def test_delete_integration(self):
        """Test deleting an integration."""
        # Arrange
        integration_id = 1
        
        # Create test integration via adapter
        test_integration = self.integration_adapter.create_integration({
            "name": "Test Integration",
            "type": "API-based",
            "source": "Workday (HR)",
            "destination": "ADP (Payroll)",
            "description": "Test integration description",
            "tenant_id": "tenant-1",
            "owner_id": "user-1",
            "health": "healthy"
        })
        
        # Mock DB query
        mock_integration = MagicMock()
        mock_integration.id = integration_id
        mock_integration.name = test_integration["name"]
        
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = mock_integration
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Act
        result = self.service.delete_integration(integration_id)
        
        # Assert
        assert result is True
        assert self.db.delete.called
        assert self.db.commit.called
    
    def test_run_integration(self):
        """Test running an integration."""
        # Arrange
        integration_id = 1
        
        # Create test integration via adapter
        test_integration = self.integration_adapter.create_integration({
            "name": "Test Integration",
            "type": "API-based",
            "source": "Workday (HR)",
            "destination": "ADP (Payroll)",
            "description": "Test integration description",
            "tenant_id": "tenant-1",
            "owner_id": "user-1",
            "health": "healthy"
        })
        
        # Mock DB query for integration
        mock_integration = MagicMock()
        mock_integration.id = integration_id
        mock_integration.name = test_integration["name"]
        
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = mock_integration
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Mock DB interactions for run
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        # Mock run creation
        mock_run = MagicMock()
        mock_run.id = 1
        mock_run.integration_id = integration_id
        mock_run.status.value = "running"
        mock_run.start_time = datetime.now(UTC)
        
        # Act
        result = self.service.run_integration(integration_id)
        
        # Assert
        assert result is not None
        assert result["integration_id"] == integration_id
        assert result["status"] == "running"
        assert "start_time" in result
        assert self.db.add.called
        assert self.db.commit.called
    
    def test_get_integration_history(self):
        """Test getting integration execution history."""
        # Arrange
        integration_id = 1
        
        # Create test integration via adapter
        test_integration = self.integration_adapter.create_integration({
            "name": "Test Integration",
            "type": "API-based",
            "source": "Workday (HR)",
            "destination": "ADP (Payroll)",
            "description": "Test integration description",
            "tenant_id": "tenant-1",
            "owner_id": "user-1",
            "health": "healthy"
        })
        
        # Create test run via adapter
        test_run = self.integration_adapter.run_integration(integration_id)
        
        # Mock DB query for integration
        mock_integration = MagicMock()
        mock_integration.id = integration_id
        
        integration_query_mock = MagicMock()
        integration_filter_mock = MagicMock()
        integration_filter_mock.first.return_value = mock_integration
        integration_query_mock.filter.return_value = integration_filter_mock
        
        # Mock DB query for runs
        mock_run = MagicMock()
        mock_run.id = test_run["id"]
        mock_run.integration_id = test_run["integration_id"]
        mock_run.status.value = test_run["status"]
        mock_run.start_time = test_run["start_time"]
        mock_run.end_time = test_run["end_time"]
        mock_run.records_processed = test_run["records_processed"]
        mock_run.warnings = test_run["warnings"]
        mock_run.error = test_run["error"]
        
        runs_query_mock = MagicMock()
        runs_filter_mock = MagicMock()
        runs_order_mock = MagicMock()
        runs_offset_mock = MagicMock()
        runs_limit_mock = MagicMock()
        runs_limit_mock.all.return_value = [mock_run]
        runs_offset_mock.limit.return_value = runs_limit_mock
        runs_order_mock.offset.return_value = runs_offset_mock
        runs_filter_mock.order_by.return_value = runs_order_mock
        runs_query_mock.filter.return_value = runs_filter_mock
        
        # Set up query mocks
        self.db.query.side_effect = lambda cls: integration_query_mock if cls.__name__ == "DbIntegration" else runs_query_mock
        
        # Act
        result = self.service.get_integration_history(integration_id)
        
        # Assert
        assert result is not None
        assert len(result) == 1
        assert result[0]["integrationId"] == integration_id
        assert result[0]["status"] == "running"
    
    def test_field_mapping_operations(self):
        """Test field mapping CRUD operations."""
        # Arrange
        integration_id = 1
        
        # Create test integration via adapter
        test_integration = self.integration_adapter.create_integration({
            "name": "Test Integration",
            "type": "API-based",
            "source": "Workday (HR)",
            "destination": "ADP (Payroll)",
            "description": "Test integration description",
            "tenant_id": "tenant-1",
            "owner_id": "user-1",
            "health": "healthy"
        })
        
        # Mock DB query for integration
        mock_integration = MagicMock()
        mock_integration.id = integration_id
        
        integration_query_mock = MagicMock()
        integration_filter_mock = MagicMock()
        integration_filter_mock.first.return_value = mock_integration
        integration_query_mock.filter.return_value = integration_filter_mock
        
        # Create test mapping
        mapping_create = FieldMappingCreate(
            integration_id=integration_id,
            source_field="source_field",
            destination_field="destination_field",
            transformation="direct",
            required=True,
            description="Test mapping"
        )
        
        # Mock DB interactions
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        # Mock mapping creation
        mock_mapping = MagicMock()
        mock_mapping.id = 1
        mock_mapping.integration_id = mapping_create.integration_id
        mock_mapping.source_field = mapping_create.source_field
        mock_mapping.destination_field = mapping_create.destination_field
        mock_mapping.transformation = mapping_create.transformation
        mock_mapping.required = mapping_create.required
        mock_mapping.description = mapping_create.description
        mock_mapping.created_at = datetime.now(UTC)
        mock_mapping.updated_at = datetime.now(UTC)
        
        # Set up query mocks for mapping operations
        mapping_query_mock = MagicMock()
        mapping_filter_mock = MagicMock()
        mapping_filter_mock.all.return_value = [mock_mapping]
        mapping_filter_mock.first.return_value = mock_mapping
        mapping_query_mock.filter.return_value = mapping_filter_mock
        
        # Set up query mocks
        self.db.query.side_effect = lambda cls: integration_query_mock if cls.__name__ == "DbIntegration" else mapping_query_mock
        
        # Act - Create
        created_mapping = self.service.create_field_mapping(integration_id, mapping_create)
        
        # Assert - Create
        assert created_mapping is not None
        assert created_mapping.integration_id == mapping_create.integration_id
        assert created_mapping.source_field == mapping_create.source_field
        assert created_mapping.destination_field == mapping_create.destination_field
        
        # Act - Get
        mappings = self.service.get_field_mappings(integration_id)
        
        # Assert - Get
        assert mappings is not None
        assert len(mappings) == 1
        assert mappings[0].integration_id == mapping_create.integration_id
        
        # Act - Update
        mapping_update = FieldMappingUpdate(
            source_field="updated_source_field",
            destination_field="updated_destination_field"
        )
        updated_mapping = self.service.update_field_mapping(integration_id, 1, mapping_update)
        
        # Assert - Update
        assert updated_mapping is not None
        assert updated_mapping.source_field == mapping_update.source_field
        assert updated_mapping.destination_field == mapping_update.destination_field
        
        # Act - Delete
        delete_result = self.service.delete_field_mapping(integration_id, 1)
        
        # Assert - Delete
        assert delete_result is True
    
    def test_dataset_operations(self):
        """Test dataset association operations."""
        # Arrange
        integration_id = 1
        dataset_id = 1
        
        # Create test integration via adapter
        test_integration = self.integration_adapter.create_integration({
            "name": "Test Integration",
            "type": "API-based",
            "source": "Workday (HR)",
            "destination": "ADP (Payroll)",
            "description": "Test integration description",
            "tenant_id": "tenant-1",
            "owner_id": "user-1",
            "health": "healthy"
        })
        
        # Create test dataset via adapter
        test_dataset = self.integration_adapter.create_dataset({
            "name": "Test Dataset",
            "description": "Test dataset description",
            "status": "active",
            "tenant_id": "tenant-1"
        })
        
        # Mock DB query for integration
        mock_integration = MagicMock()
        mock_integration.id = integration_id
        mock_integration.datasets = []
        
        integration_query_mock = MagicMock()
        integration_filter_mock = MagicMock()
        integration_filter_mock.first.return_value = mock_integration
        integration_query_mock.filter.return_value = integration_filter_mock
        
        # Mock DB query for dataset
        mock_dataset = MagicMock()
        mock_dataset.id = dataset_id
        mock_dataset.name = test_dataset["name"]
        mock_dataset.description = test_dataset["description"]
        mock_dataset.status.value = test_dataset["status"]
        mock_dataset.tenant_id = test_dataset["tenant_id"]
        mock_dataset.fields = []
        mock_dataset.created_at = test_dataset["created_at"]
        mock_dataset.updated_at = test_dataset["updated_at"]
        
        dataset_query_mock = MagicMock()
        dataset_filter_mock = MagicMock()
        dataset_filter_mock.first.return_value = mock_dataset
        dataset_query_mock.filter.return_value = dataset_filter_mock
        
        # Set up query mocks
        self.db.query.side_effect = lambda cls: integration_query_mock if cls.__name__ == "DbIntegration" else dataset_query_mock
        
        # Act - Associate
        associate_result = self.service.associate_dataset(integration_id, dataset_id)
        
        # Assert - Associate
        assert associate_result is True
        
        # Update mock for dataset retrieval
        mock_integration.datasets = [mock_dataset]
        
        # Act - Get
        datasets = self.service.get_integration_datasets(integration_id)
        
        # Assert - Get
        assert datasets is not None
        assert len(datasets) == 1
        assert datasets[0].id == dataset_id
        
        # Act - Disassociate
        disassociate_result = self.service.disassociate_dataset(integration_id, dataset_id)
        
        # Assert - Disassociate
        assert disassociate_result is True