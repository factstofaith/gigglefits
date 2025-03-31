"""
Optimized Integration Runner Tests

This module contains optimized tests for the IntegrationRunner class using
the entity registry and adapter patterns.
"""

import pytest
import asyncio
import pandas as pd
from unittest.mock import MagicMock, AsyncMock, patch
from datetime import datetime

# Import the integration runner
from utils.integration_runner import IntegrationRunner

# Import test adapters
from test_adapters import IntegrationRunnerTestAdapter


class TestIntegrationRunnerOptimized:
    """
    Optimized tests for the IntegrationRunner class using the adapter pattern.
    
    These tests demonstrate how to use the IntegrationRunnerTestAdapter for more maintainable
    and standardized integration runner tests.
    """
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry, integration_runner_adapter, integration_adapter):
        """Set up test environment before each test."""
        self.runner_adapter = integration_runner_adapter
        self.integration_adapter = integration_adapter
        self.runner = self.runner_adapter.runner
        
        # Create a test integration
        self.test_integration = self.runner_adapter.create_test_integration()
        
        # Create field mappings
        self.mappings = [
            self.runner_adapter.create_field_mapping(
                self.test_integration["id"], "id", "external_id", "direct", True
            ),
            self.runner_adapter.create_field_mapping(
                self.test_integration["id"], "name", "full_name", "direct", True
            ),
            self.runner_adapter.create_field_mapping(
                self.test_integration["id"], "value", "amount", "direct", False
            )
        ]
        
        yield
        
        # Clean up
        self.runner_adapter.reset()
    
    def test_runner_initialization(self):
        """Test that the runner initializes correctly."""
        # Verify runner has the expected services
        assert hasattr(self.runner, 'integration_service')
        assert hasattr(self.runner, 'field_mapping_service')
    
    @pytest.mark.asyncio
    async def test_run_nonexistent_integration(self):
        """Test running a non-existent integration."""
        # Run a non-existent integration
        result = await self.runner_adapter.run_integration(999)
        
        # Verify result
        assert result["status"] == "error"
        assert "not found" in result["message"].lower()
    
    @pytest.mark.asyncio
    async def test_api_integration_run(self):
        """Test running an API-based integration."""
        # Create source and destination adapters
        source_adapter = self.runner_adapter.create_test_source_adapter("api")
        dest_adapter = self.runner_adapter.create_test_destination_adapter("api")
        
        # Set up the runner to use our mock adapters
        self.runner_adapter.mock_adapter_creation(source_adapter, dest_adapter)
        
        # Run the integration
        result = await self.runner_adapter.run_integration(self.test_integration["id"])
        
        # Verify result
        assert result["status"] == "success"
        assert "records_processed" in result
        assert result["records_processed"] > 0
        
        # Verify adapter calls
        assert source_adapter.get.called
        assert dest_adapter.post.called
        
        # Verify history record was created/updated
        assert self.runner.integration_service.create_history_record.called
        assert self.runner.integration_service.update_history_record.called
    
    @pytest.mark.asyncio
    async def test_file_integration_run(self):
        """Test running a file-based integration."""
        # Create an integration with file-based type
        file_integration = self.runner_adapter.create_test_integration({
            "type": "File-based",
            "source": "AWS S3",
            "destination": "Azure Blob",
            "source_config": {"file_pattern": "data.csv"},
            "destination_config": {"file_path": "output.csv"}
        })
        
        # Create source and destination adapters
        source_adapter = self.runner_adapter.create_test_source_adapter("csv")
        dest_adapter = self.runner_adapter.create_test_destination_adapter("csv")
        
        # Set up the runner to use our mock adapters
        self.runner_adapter.mock_adapter_creation(source_adapter, dest_adapter)
        
        # Run the integration
        result = await self.runner_adapter.run_integration(file_integration["id"])
        
        # Verify result
        assert result["status"] == "success"
        assert "records_processed" in result
        assert result["records_processed"] > 0
        
        # Verify adapter calls
        assert source_adapter.read_csv_blob.called
        assert dest_adapter.write_csv_blob.called
        
        # Verify history record was created/updated
        assert self.runner.integration_service.create_history_record.called
        assert self.runner.integration_service.update_history_record.called
    
    @pytest.mark.asyncio
    async def test_salesforce_integration_run(self):
        """Test running a Salesforce integration."""
        # Create an integration with Salesforce
        sf_integration = self.runner_adapter.create_test_integration({
            "type": "API-based",
            "source": "Salesforce",
            "destination": "Salesforce",
            "source_config": {"query": "SELECT Id, Name FROM Account LIMIT 10"},
            "destination_config": {"object_name": "Contact"}
        })
        
        # Create source and destination adapters
        source_adapter = self.runner_adapter.create_test_source_adapter("salesforce")
        dest_adapter = self.runner_adapter.create_test_destination_adapter("salesforce")
        
        # Set up the runner to use our mock adapters
        self.runner_adapter.mock_adapter_creation(source_adapter, dest_adapter)
        
        # Run the integration
        result = await self.runner_adapter.run_integration(sf_integration["id"])
        
        # Verify result
        assert result["status"] == "success"
        assert "records_processed" in result
        assert result["records_processed"] > 0
        
        # Verify adapter calls
        assert source_adapter.query.called
        assert dest_adapter.create_record.called
    
    @pytest.mark.asyncio
    async def test_extract_error_handling(self):
        """Test error handling during extraction phase."""
        # Create a test error
        test_error = ValueError("Test extraction error")
        
        # Create source adapter with error
        source_adapter = self.runner_adapter.create_test_source_adapter("api", error=test_error)
        dest_adapter = self.runner_adapter.create_test_destination_adapter("api")
        
        # Set up the runner to use our mock adapters
        self.runner_adapter.mock_adapter_creation(source_adapter, dest_adapter)
        
        # Run the integration (should handle the error)
        result = await self.runner_adapter.run_integration(self.test_integration["id"])
        
        # Verify result indicates error
        assert result["status"] == "error"
        assert "Test extraction error" in result["message"]
        
        # Verify history record was updated with error
        assert self.runner.integration_service.update_history_record.called
        update_args = self.runner.integration_service.update_history_record.call_args[1]
        assert update_args["status"] == "error"
        assert "error" in update_args
    
    @pytest.mark.asyncio
    async def test_transform_error_handling(self):
        """Test error handling during transformation phase."""
        # Create source adapter with data missing required field
        source_data = {"items": [{"age": 30}]}  # Missing required 'id' and 'name' fields
        source_adapter = self.runner_adapter.create_test_source_adapter("api", data=source_data)
        dest_adapter = self.runner_adapter.create_test_destination_adapter("api")
        
        # Set up the runner to use our mock adapters
        self.runner_adapter.mock_adapter_creation(source_adapter, dest_adapter)
        
        # Run the integration (should handle the error)
        result = await self.runner_adapter.run_integration(self.test_integration["id"])
        
        # Verify result indicates error
        assert result["status"] == "error"
        assert "required" in result["message"].lower()
        
        # Verify history record was updated with error
        assert self.runner.integration_service.update_history_record.called
        update_args = self.runner.integration_service.update_history_record.call_args[1]
        assert update_args["status"] == "error"
    
    @pytest.mark.asyncio
    async def test_load_error_handling(self):
        """Test error handling during loading phase."""
        # Create a test error
        test_error = ValueError("Test loading error")
        
        # Create source adapter with valid data but destination adapter with error
        source_adapter = self.runner_adapter.create_test_source_adapter("api")
        dest_adapter = self.runner_adapter.create_test_destination_adapter("api", error=test_error)
        
        # Set up the runner to use our mock adapters
        self.runner_adapter.mock_adapter_creation(source_adapter, dest_adapter)
        
        # Run the integration (should handle the error)
        result = await self.runner_adapter.run_integration(self.test_integration["id"])
        
        # Verify result indicates error
        assert result["status"] == "error"
        assert "Test loading error" in result["message"]
        
        # Verify history record was updated with error
        assert self.runner.integration_service.update_history_record.called
        update_args = self.runner.integration_service.update_history_record.call_args[1]
        assert update_args["status"] == "error"
    
    @pytest.mark.asyncio
    async def test_transform_complex_mapping(self):
        """Test transformation with complex field mappings."""
        # Add a complex field mapping
        concat_mapping = self.runner_adapter.create_field_mapping(
            self.test_integration["id"],
            "id",
            "display_id",
            "concat",
            False,
            {"concat_field": "name", "separator": "-"}
        )
        
        # Create source adapter with test data
        source_data = {"items": [{"id": 1, "name": "Test"}, {"id": 2, "name": "Example"}]}
        source_adapter = self.runner_adapter.create_test_source_adapter("api", data=source_data)
        dest_adapter = self.runner_adapter.create_test_destination_adapter("api")
        
        # Override the transform method to capture the transformed data
        transformed_data = None
        original_transform = self.runner._transform_data
        
        def capture_transform(*args, **kwargs):
            nonlocal transformed_data
            transformed_data = original_transform(*args, **kwargs)
            return transformed_data
        
        self.runner._transform_data = capture_transform
        
        # Set up the runner to use our mock adapters
        self.runner_adapter.mock_adapter_creation(source_adapter, dest_adapter)
        
        # Run the integration
        result = await self.runner_adapter.run_integration(self.test_integration["id"])
        
        # Verify result
        assert result["status"] == "success"
        
        # Verify transformation
        assert transformed_data is not None
        assert "display_id" in transformed_data.columns
        
        # Check concatenation (assuming first row)
        display_id = transformed_data["display_id"].iloc[0]
        assert "-" in display_id  # Should contain the separator
    
    @pytest.mark.asyncio
    async def test_batch_vs_individual_loading(self):
        """Test batch vs individual loading modes."""
        # Test batch mode
        batch_integration = self.runner_adapter.create_test_integration({
            "destination_config": {"endpoint": "/api/output", "batch_mode": True}
        })
        
        source_adapter = self.runner_adapter.create_test_source_adapter("api")
        batch_dest_adapter = self.runner_adapter.create_test_destination_adapter("api")
        
        self.runner_adapter.mock_adapter_creation(source_adapter, batch_dest_adapter)
        batch_result = await self.runner_adapter.run_integration(batch_integration["id"])
        
        # Verify batch adapter call (should be called once with all records)
        assert batch_dest_adapter.post.call_count == 1
        
        # Test individual mode
        individual_integration = self.runner_adapter.create_test_integration({
            "destination_config": {"endpoint": "/api/output", "batch_mode": False}
        })
        
        source_adapter = self.runner_adapter.create_test_source_adapter("api")
        individual_dest_adapter = self.runner_adapter.create_test_destination_adapter("api")
        
        # Mock post to return a different result for each call
        individual_dest_adapter.post = AsyncMock(side_effect=[
            {"success": True, "id": 1},
            {"success": True, "id": 2}
        ])
        
        self.runner_adapter.mock_adapter_creation(source_adapter, individual_dest_adapter)
        individual_result = await self.runner_adapter.run_integration(individual_integration["id"])
        
        # Verify individual adapter calls (should be called once per record)
        assert individual_dest_adapter.post.call_count == 2
    
    @pytest.mark.asyncio
    async def test_integration_with_entity_registry(self):
        """Test integration with the entity registry."""
        # Create source and destination adapters
        source_adapter = self.runner_adapter.create_test_source_adapter("api")
        dest_adapter = self.runner_adapter.create_test_destination_adapter("api")
        
        # Set up the runner to use our mock adapters
        self.runner_adapter.mock_adapter_creation(source_adapter, dest_adapter)
        
        # Run the integration
        result = await self.runner_adapter.run_integration(self.test_integration["id"])
        
        # Verify result
        assert result["status"] == "success"
        
        # Now delete the integration from the registry
        self.integration_adapter.delete_integration(self.test_integration["id"])
        
        # Run the integration again (should fail because it's deleted)
        result = await self.runner_adapter.run_integration(self.test_integration["id"])
        
        # Verify result reflects the integration is not found
        assert result["status"] == "error"
        assert "not found" in result["message"].lower()
    
    @pytest.mark.asyncio
    async def test_nested_api_response_handling(self):
        """Test handling of nested API responses."""
        # Test different nested API response formats
        nested_formats = [
            {"items": [{"id": 1, "name": "Test"}]},
            {"records": [{"id": 1, "name": "Test"}]},
            {"data": [{"id": 1, "name": "Test"}]}
        ]
        
        for nested_data in nested_formats:
            # Create source adapter with nested data
            source_adapter = self.runner_adapter.create_test_source_adapter("api", data=nested_data)
            dest_adapter = self.runner_adapter.create_test_destination_adapter("api")
            
            # Set up the runner to use our mock adapters
            self.runner_adapter.mock_adapter_creation(source_adapter, dest_adapter)
            
            # Run the integration
            result = await self.runner_adapter.run_integration(self.test_integration["id"])
            
            # Verify result
            assert result["status"] == "success"
            
            # Reset adapters for next test
            self.runner_adapter.reset_mocks()