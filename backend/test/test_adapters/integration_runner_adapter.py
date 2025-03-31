"""
Integration Runner Test Adapter

This module provides test adapters for the IntegrationRunner class.
"""

import logging
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Optional, List, Union, Callable
from unittest.mock import MagicMock, AsyncMock

from utils.integration_runner import IntegrationRunner
from .entity_registry import BaseTestAdapter, EntityAction

logger = logging.getLogger(__name__)

class IntegrationRunnerTestAdapter(BaseTestAdapter):
    """
    Test adapter for the IntegrationRunner class.
    
    This adapter integrates with the entity registry and provides methods
    for testing the IntegrationRunner.
    """
    
    def __init__(self, registry=None, integration_adapter=None, integration_service=None, field_mapping_service=None):
        """
        Initialize the IntegrationRunnerTestAdapter.
        
        Args:
            registry: Entity registry for test synchronization
            integration_adapter: Integration test adapter instance
            integration_service: Mock integration service for testing
            field_mapping_service: Mock field mapping service for testing
        """
        super().__init__(registry)
        
        # Store reference to integration adapter
        self.integration_adapter = integration_adapter
        
        # Set up mock services if not provided
        self.integration_service = integration_service or self._create_mock_integration_service()
        self.field_mapping_service = field_mapping_service or self._create_mock_field_mapping_service()
        
        # Create instance of IntegrationRunner with mock services
        self.runner = IntegrationRunner(
            integration_service=self.integration_service,
            field_mapping_service=self.field_mapping_service
        )
        
        # Register event listener for integration changes
        self.registry.register_listener("Integration", self._handle_integration_change)
        self.registry.register_listener("FieldMapping", self._handle_field_mapping_change)
        
        # Track mock data adapters
        self.mock_adapters = {}
        
        # Mock data for testing
        self.test_data = {
            "dataframes": {},
            "responses": {},
            "errors": {}
        }
    
    def _create_mock_integration_service(self):
        """Create a mock integration service for testing."""
        mock_service = MagicMock()
        
        # Set up get_integration method
        def get_integration(integration_id):
            # Check if integration exists in registry
            integration = self.registry.get_entity("Integration", str(integration_id))
            if integration:
                # Convert to mock with properties
                mock_integration = MagicMock()
                for key, value in integration.items():
                    setattr(mock_integration, key, value)
                return mock_integration
            return None
        
        mock_service.get_integration = get_integration
        
        # Set up get_field_mappings method (delegate to field_mapping_service)
        mock_service.get_field_mappings = MagicMock(return_value=[])
        
        # Set up create_history_record method
        mock_service.create_history_record = MagicMock(return_value=1)  # Return history ID
        
        # Set up update_history_record method
        mock_service.update_history_record = MagicMock()
        
        return mock_service
    
    def _create_mock_field_mapping_service(self):
        """Create a mock field mapping service for testing."""
        mock_service = MagicMock()
        
        # Set up get_field_mappings method
        def get_field_mappings(integration_id):
            # Check if field mappings exist in registry
            mappings = []
            all_mappings = self.registry.get_entities_by_type("FieldMapping")
            
            # Filter mappings for this integration
            for mapping_id, mapping in all_mappings.items():
                if mapping.get("integration_id") == integration_id:
                    # Convert to mock with properties
                    mock_mapping = MagicMock()
                    for key, value in mapping.items():
                        setattr(mock_mapping, key, value)
                    mappings.append(mock_mapping)
            
            return mappings
        
        mock_service.get_field_mappings = get_field_mappings
        
        return mock_service
    
    def create_test_integration(self, overrides=None):
        """
        Create a test integration for the runner to use.
        
        Args:
            overrides: Optional dict of values to override defaults
            
        Returns:
            Dict containing the created integration entity
        """
        integration_data = {
            "id": self._generate_id(),
            "name": "Test Integration",
            "type": "API-based",
            "source": "Test Source",
            "destination": "Test Destination",
            "source_config": {"endpoint": "/api/test", "params": {}},
            "destination_config": {"endpoint": "/api/destination", "batch_mode": True},
            "status": "active"
        }
        
        # Apply any overrides
        if overrides:
            integration_data.update(overrides)
        
        # Register in registry
        self._register_entity("Integration", str(integration_data["id"]), integration_data)
        
        return integration_data
    
    def create_field_mapping(self, integration_id, source_field, destination_field, transformation="direct", required=False, transform_params=None):
        """
        Create a test field mapping.
        
        Args:
            integration_id: ID of the integration
            source_field: Source field name
            destination_field: Destination field name
            transformation: Transformation type
            required: Whether the mapping is required
            transform_params: Optional transformation parameters
            
        Returns:
            Dict containing the created field mapping entity
        """
        mapping_id = self._generate_id()
        
        mapping_data = {
            "id": mapping_id,
            "integration_id": integration_id,
            "source_field": source_field,
            "destination_field": destination_field,
            "transformation": transformation,
            "required": required,
            "transform_params": transform_params or {}
        }
        
        # Register in registry
        self._register_entity("FieldMapping", str(mapping_id), mapping_data)
        
        return mapping_data
    
    def create_test_source_adapter(self, adapter_type="api", data=None, error=None):
        """
        Create a mock source adapter for testing.
        
        Args:
            adapter_type: Type of adapter (api, csv, salesforce)
            data: Test data to return
            error: Optional error to raise
            
        Returns:
            Mock adapter instance
        """
        mock_adapter = MagicMock()
        
        if adapter_type == "api":
            # Mock API adapter with get method
            if error:
                mock_adapter.get = AsyncMock(side_effect=error)
            else:
                api_data = data or {"items": [{"id": 1, "name": "Test"}]}
                mock_adapter.get = AsyncMock()
                mock_adapter.get.return_value = api_data
        
        elif adapter_type == "csv":
            # Mock CSV adapter with read_csv_blob method
            if error:
                mock_adapter.read_csv_blob = AsyncMock(side_effect=error)
            else:
                if isinstance(data, pd.DataFrame):
                    df = data
                else:
                    # Create default DataFrame if none provided
                    df = pd.DataFrame({
                        "id": [1, 2, 3],
                        "name": ["Test 1", "Test 2", "Test 3"],
                        "value": [10, 20, 30]
                    })
                mock_adapter.read_csv_blob = AsyncMock()
                mock_adapter.read_csv_blob.return_value = df
        
        elif adapter_type == "salesforce":
            # Mock Salesforce adapter with query method
            if error:
                mock_adapter.query = AsyncMock(side_effect=error)
            else:
                sf_data = data or {
                    "records": [
                        {"Id": "001", "Name": "Test Account"},
                        {"Id": "002", "Name": "Test Account 2"}
                    ]
                }
                mock_adapter.query = AsyncMock()
                mock_adapter.query.return_value = sf_data
        
        # Store the adapter
        adapter_id = f"source_{adapter_type}_{self._generate_id()}"
        self.mock_adapters[adapter_id] = mock_adapter
        
        return mock_adapter
    
    def create_test_destination_adapter(self, adapter_type="api", error=None):
        """
        Create a mock destination adapter for testing.
        
        Args:
            adapter_type: Type of adapter (api, csv, salesforce)
            error: Optional error to raise
            
        Returns:
            Mock adapter instance
        """
        mock_adapter = MagicMock()
        
        if adapter_type == "api":
            # Mock API adapter with post method
            if error:
                mock_adapter.post = AsyncMock(side_effect=error)
            else:
                mock_adapter.post = AsyncMock()
                mock_adapter.post.return_value = {"success": True, "ids": [1, 2, 3]}
        
        elif adapter_type == "csv":
            # Mock CSV adapter with write_csv_blob method
            if error:
                mock_adapter.write_csv_blob = AsyncMock(side_effect=error)
            else:
                mock_adapter.write_csv_blob = AsyncMock()
                mock_adapter.write_csv_blob.return_value = True
        
        elif adapter_type == "salesforce":
            # Mock Salesforce adapter with create_record method
            if error:
                mock_adapter.create_record = AsyncMock(side_effect=error)
            else:
                mock_adapter.create_record = AsyncMock()
                mock_adapter.create_record.return_value = {"success": True, "id": "003"}
        
        # Store the adapter
        adapter_id = f"destination_{adapter_type}_{self._generate_id()}"
        self.mock_adapters[adapter_id] = mock_adapter
        
        return mock_adapter
    
    def mock_adapter_creation(self, source_adapter=None, destination_adapter=None):
        """
        Mock the adapter creation process.
        
        Args:
            source_adapter: Source adapter to return
            destination_adapter: Destination adapter to return
        """
        # Create a function that returns the appropriate adapter
        def create_adapter_mock(integration_type, source_name, config):
            if source_name.lower() in ["test source", "aws s3", "salesforce"]:
                return source_adapter
            else:
                return destination_adapter
        
        # Patch the _create_adapter_for_integration method
        self.runner._create_adapter_for_integration = create_adapter_mock
        
        # Override the extract_data method to handle our mock
        original_extract = self.runner._extract_data
        async def extract_data_override(source_adapter, integration):
            if isinstance(source_adapter, MagicMock):
                # Get data based on integration type
                if integration.type == "API-based":
                    if "salesforce" in integration.source.lower():
                        if hasattr(source_adapter, "query") and callable(source_adapter.query):
                            return await source_adapter.query()
                    else:
                        if hasattr(source_adapter, "get") and callable(source_adapter.get):
                            return await source_adapter.get()
                elif integration.type == "File-based":
                    if hasattr(source_adapter, "read_csv_blob") and callable(source_adapter.read_csv_blob):
                        return await source_adapter.read_csv_blob()
            
            # Fall back to original behavior
            return await original_extract(source_adapter, integration)
        
        # Override the load_data method to handle our mock
        original_load = self.runner._load_data
        async def load_data_override(dest_adapter, data, integration):
            if isinstance(dest_adapter, MagicMock):
                # Handle load based on integration type
                if integration.type == "API-based":
                    if "salesforce" in integration.destination.lower():
                        if hasattr(dest_adapter, "create_record") and callable(dest_adapter.create_record):
                            result = await dest_adapter.create_record()
                            return {"success": True, "results": [result]}
                    else:
                        if hasattr(dest_adapter, "post") and callable(dest_adapter.post):
                            # Check if we should post batch or individual
                            batch_mode = getattr(integration.destination_config, "batch_mode", True)
                            if batch_mode:
                                result = await dest_adapter.post()
                                return result
                            else:
                                # Individual mode
                                results = []
                                records = data.to_dict(orient="records")
                                for record in records:
                                    results.append(await dest_adapter.post())
                                return {"success": True, "results": results}
                elif integration.type == "File-based":
                    if hasattr(dest_adapter, "write_csv_blob") and callable(dest_adapter.write_csv_blob):
                        file_path = getattr(integration.destination_config, "file_path", "output.csv")
                        result = await dest_adapter.write_csv_blob()
                        return {"success": result, "file_path": file_path}
            
            # Fall back to original behavior
            return await original_load(dest_adapter, data, integration)
            
        self.runner._extract_data = extract_data_override
        self.runner._load_data = load_data_override
    
    def reset_mocks(self):
        """Reset all mocks to their initial state."""
        # Reset mock services
        if hasattr(self.integration_service, "reset_mock"):
            self.integration_service.reset_mock()
        
        if hasattr(self.field_mapping_service, "reset_mock"):
            self.field_mapping_service.reset_mock()
        
        # Reset mock adapters
        for adapter_id, adapter in self.mock_adapters.items():
            if hasattr(adapter, "reset_mock"):
                adapter.reset_mock()
    
    async def run_integration(self, integration_id):
        """
        Run an integration using the runner.
        
        Args:
            integration_id: ID of the integration to run
            
        Returns:
            Dict with run results
        """
        return await self.runner.run(integration_id)
    
    def _generate_id(self):
        """Generate a unique ID for test entities."""
        import uuid
        return str(uuid.uuid4())[:8]
    
    def _handle_integration_change(self, entity_type, entity_id, entity, action):
        """
        Handle changes to integration entities.
        
        Args:
            entity_type: Type of entity that changed
            entity_id: ID of the entity
            entity: Entity data
            action: Action that occurred
        """
        if action == EntityAction.DELETE:
            # Clean up any associated resources
            pass
    
    def _handle_field_mapping_change(self, entity_type, entity_id, entity, action):
        """
        Handle changes to field mapping entities.
        
        Args:
            entity_type: Type of entity that changed
            entity_id: ID of the entity
            entity: Entity data
            action: Action that occurred
        """
        # Currently no special handling needed
        pass
    
    def reset(self):
        """Reset the adapter to its initial state."""
        # Reset all mocks
        self.reset_mocks()
        
        # Clear mock adapters
        self.mock_adapters = {}
        
        # Clear test data
        self.test_data = {
            "dataframes": {},
            "responses": {},
            "errors": {}
        }