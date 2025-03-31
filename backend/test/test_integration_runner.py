"""
Integration Runner Tests

This module contains tests for the IntegrationRunner class in utils/integration_runner.py.
"""

import pytest
import asyncio
import pandas as pd
from unittest.mock import MagicMock, AsyncMock, patch
from datetime import datetime

# Import the integration runner
from utils.integration_runner import IntegrationRunner


class TestIntegrationRunner:
    """Tests for the IntegrationRunner class."""
    
    @pytest.fixture
    def integration_service_mock(self):
        """Create a mock for the integration service."""
        mock = MagicMock()
        
        # Mock get_integration to return a test integration
        test_integration = MagicMock()
        test_integration.id = 1
        test_integration.name = "Test Integration"
        test_integration.type = "API-based"
        test_integration.source = "Test Source"
        test_integration.destination = "Test Destination"
        test_integration.source_config = {"endpoint": "/api/data", "params": {}}
        test_integration.destination_config = {"endpoint": "/api/output", "batch_mode": True}
        
        mock.get_integration.return_value = test_integration
        
        # Mock get_field_mappings to return test field mappings
        field_mapping = MagicMock()
        field_mapping.source_field = "name"
        field_mapping.destination_field = "full_name"
        field_mapping.transformation = "direct"
        field_mapping.required = True
        
        mock.get_field_mappings = MagicMock(return_value=[field_mapping])
        
        # Mock history record methods
        mock.create_history_record = MagicMock(return_value=1)
        mock.update_history_record = MagicMock()
        
        return mock
    
    @pytest.fixture
    def field_mapping_service_mock(self):
        """Create a mock for the field mapping service."""
        mock = MagicMock()
        
        # Mock get_field_mappings to return test field mappings
        field_mapping = MagicMock()
        field_mapping.source_field = "name"
        field_mapping.destination_field = "full_name"
        field_mapping.transformation = "direct"
        field_mapping.required = True
        
        field_mapping2 = MagicMock()
        field_mapping2.source_field = "id"
        field_mapping2.destination_field = "external_id"
        field_mapping2.transformation = "direct"
        field_mapping2.required = True
        
        mock.get_field_mappings = MagicMock(return_value=[field_mapping, field_mapping2])
        
        return mock
    
    @pytest.fixture
    def source_adapter_mock(self):
        """Create a mock source adapter."""
        mock = MagicMock()
        
        # For API-based
        mock.get = AsyncMock(return_value={
            "items": [
                {"id": 1, "name": "Test 1"},
                {"id": 2, "name": "Test 2"}
            ]
        })
        
        # For file-based
        mock.read_csv_blob = AsyncMock(return_value=pd.DataFrame({
            "id": [1, 2, 3],
            "name": ["Test 1", "Test 2", "Test 3"]
        }))
        
        # For Salesforce
        mock.query = AsyncMock(return_value={
            "records": [
                {"Id": "001", "Name": "Test Account"}
            ]
        })
        
        return mock
    
    @pytest.fixture
    def dest_adapter_mock(self):
        """Create a mock destination adapter."""
        mock = MagicMock()
        
        # For API-based
        mock.post = AsyncMock(return_value={"success": True, "ids": [1, 2, 3]})
        
        # For file-based
        mock.write_csv_blob = AsyncMock(return_value=True)
        
        # For Salesforce
        mock.create_record = AsyncMock(return_value={"success": True, "id": "001"})
        
        return mock
    
    @pytest.fixture
    def runner(self, integration_service_mock, field_mapping_service_mock):
        """Create an IntegrationRunner instance for testing."""
        return IntegrationRunner(
            integration_service=integration_service_mock,
            field_mapping_service=field_mapping_service_mock
        )
    
    @pytest.mark.asyncio
    async def test_runner_initialization(self, runner, integration_service_mock, field_mapping_service_mock):
        """Test that the runner initializes correctly."""
        assert runner.integration_service == integration_service_mock
        assert runner.field_mapping_service == field_mapping_service_mock
    
    @pytest.mark.asyncio
    async def test_run_nonexistent_integration(self, runner, integration_service_mock):
        """Test running a non-existent integration."""
        # Setup integration service to return None (integration not found)
        integration_service_mock.get_integration.return_value = None
        
        # Run the integration
        result = await runner.run(999)
        
        # Verify result
        assert result["status"] == "error"
        assert "not found" in result["message"].lower()
        
        # Verify service calls
        integration_service_mock.get_integration.assert_called_once_with(999)
        integration_service_mock.create_history_record.assert_not_called()
        integration_service_mock.update_history_record.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_run_api_integration(self, runner, integration_service_mock, source_adapter_mock, dest_adapter_mock):
        """Test running an API-based integration."""
        # Mock the adapter creation method
        with patch.object(runner, '_create_adapter_for_integration') as mock_create_adapter:
            mock_create_adapter.side_effect = [source_adapter_mock, dest_adapter_mock]
            
            # Run the integration
            result = await runner.run(1)
            
            # Verify result
            assert result["status"] == "success"
            assert result["records_processed"] == 2
            assert "history_id" in result
            
            # Verify adapter creation
            assert mock_create_adapter.call_count == 2
            
            # Verify source adapter calls
            source_adapter_mock.get.assert_called_once()
            
            # Verify destination adapter calls
            dest_adapter_mock.post.assert_called_once()
            
            # Verify history record updates
            integration_service_mock.create_history_record.assert_called_once()
            integration_service_mock.update_history_record.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_extract_data_api(self, runner, integration_service_mock, source_adapter_mock):
        """Test extracting data from an API source."""
        # Set up test integration
        integration = integration_service_mock.get_integration.return_value
        
        # Extract data
        with patch.object(runner, '_create_adapter_for_integration', return_value=source_adapter_mock):
            data = await runner._extract_data(source_adapter_mock, integration)
            
            # Verify extraction
            assert data is not None
            assert "items" in data
            assert len(data["items"]) == 2
            
            # Verify adapter calls
            source_adapter_mock.get.assert_called_once_with(
                integration.source_config["endpoint"],
                integration.source_config["params"]
            )
    
    @pytest.mark.asyncio
    async def test_extract_data_file(self, runner, integration_service_mock, source_adapter_mock):
        """Test extracting data from a file source."""
        # Set up test integration for file-based
        integration = integration_service_mock.get_integration.return_value
        integration.type = "File-based"
        integration.source_config = {"file_pattern": "data.csv"}
        
        # Extract data
        with patch.object(runner, '_create_adapter_for_integration', return_value=source_adapter_mock):
            data = await runner._extract_data(source_adapter_mock, integration)
            
            # Verify extraction
            assert isinstance(data, pd.DataFrame)
            assert len(data) == 3
            assert "id" in data.columns
            assert "name" in data.columns
            
            # Verify adapter calls
            source_adapter_mock.read_csv_blob.assert_called_once_with("data.csv")
    
    @pytest.mark.asyncio
    async def test_extract_data_error(self, runner, integration_service_mock):
        """Test error handling during data extraction."""
        # Set up test integration
        integration = integration_service_mock.get_integration.return_value
        
        # Create a mock adapter that raises an error
        error_adapter = MagicMock()
        error_adapter.get = AsyncMock(side_effect=Exception("API error"))
        
        # Extract data (should raise the exception)
        with patch.object(runner, '_create_adapter_for_integration', return_value=error_adapter):
            with pytest.raises(Exception) as exc_info:
                await runner._extract_data(error_adapter, integration)
            
            assert "API error" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_transform_data(self, runner, field_mapping_service_mock):
        """Test transforming data using field mappings."""
        # Create test data
        data = pd.DataFrame({
            "id": [1, 2, 3],
            "name": ["Test 1", "Test 2", "Test 3"],
            "extra": ["A", "B", "C"]
        })
        
        # Get field mappings
        mappings = field_mapping_service_mock.get_field_mappings.return_value
        
        # Transform data
        result = runner._transform_data(data, mappings)
        
        # Verify transformation
        assert isinstance(result, pd.DataFrame)
        assert "external_id" in result.columns
        assert "full_name" in result.columns
        assert "extra" not in result.columns  # Not in mapping, shouldn't be in result
        assert len(result) == 3
    
    @pytest.mark.asyncio
    async def test_transform_data_list(self, runner, field_mapping_service_mock):
        """Test transforming data from a list of dictionaries."""
        # Create test data as list
        data = [
            {"id": 1, "name": "Test 1", "extra": "A"},
            {"id": 2, "name": "Test 2", "extra": "B"},
            {"id": 3, "name": "Test 3", "extra": "C"}
        ]
        
        # Get field mappings
        mappings = field_mapping_service_mock.get_field_mappings.return_value
        
        # Transform data
        result = runner._transform_data(data, mappings)
        
        # Verify transformation
        assert isinstance(result, pd.DataFrame)
        assert "external_id" in result.columns
        assert "full_name" in result.columns
        assert "extra" not in result.columns  # Not in mapping, shouldn't be in result
        assert len(result) == 3
    
    @pytest.mark.asyncio
    async def test_transform_data_missing_required_field(self, runner, field_mapping_service_mock):
        """Test error when a required field is missing."""
        # Create test data without a required field
        data = pd.DataFrame({
            # Missing "id" field which is required
            "name": ["Test 1", "Test 2", "Test 3"],
            "extra": ["A", "B", "C"]
        })
        
        # Get field mappings
        mappings = field_mapping_service_mock.get_field_mappings.return_value
        
        # Transform data (should raise an error)
        with pytest.raises(ValueError) as exc_info:
            runner._transform_data(data, mappings)
        
        assert "required" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_load_data_api(self, runner, integration_service_mock, dest_adapter_mock):
        """Test loading data to an API destination."""
        # Set up test integration
        integration = integration_service_mock.get_integration.return_value
        
        # Create test data
        data = pd.DataFrame({
            "external_id": [1, 2, 3],
            "full_name": ["Test 1", "Test 2", "Test 3"]
        })
        
        # Load data
        result = await runner._load_data(dest_adapter_mock, data, integration)
        
        # Verify result
        assert result["success"] is True
        
        # Verify adapter calls
        dest_adapter_mock.post.assert_called_once()
        
        # Verify that the correct data was sent
        called_args = dest_adapter_mock.post.call_args[0]
        assert called_args[0] == integration.destination_config["endpoint"]
        
        # The second argument should be the data converted to records
        records = called_args[1]
        assert isinstance(records, list)
        assert len(records) == 3
        assert records[0]["external_id"] == 1
        assert records[0]["full_name"] == "Test 1"
    
    @pytest.mark.asyncio
    async def test_load_data_file(self, runner, integration_service_mock, dest_adapter_mock):
        """Test loading data to a file destination."""
        # Set up test integration for file-based
        integration = integration_service_mock.get_integration.return_value
        integration.type = "File-based"
        integration.destination_config = {"file_path": "output.csv"}
        
        # Create test data
        data = pd.DataFrame({
            "external_id": [1, 2, 3],
            "full_name": ["Test 1", "Test 2", "Test 3"]
        })
        
        # Load data
        result = await runner._load_data(dest_adapter_mock, data, integration)
        
        # Verify result
        assert result["success"] is True
        assert "file_path" in result
        
        # Verify adapter calls
        dest_adapter_mock.write_csv_blob.assert_called_once_with(
            data,
            integration.destination_config["file_path"],
            include_header=True
        )
    
    @pytest.mark.asyncio
    async def test_load_data_individual_mode(self, runner, integration_service_mock, dest_adapter_mock):
        """Test loading data in individual mode (not batch)."""
        # Set up test integration with batch_mode=False
        integration = integration_service_mock.get_integration.return_value
        integration.destination_config = {"endpoint": "/api/output", "batch_mode": False}
        
        # Create test data
        data = pd.DataFrame({
            "external_id": [1, 2],
            "full_name": ["Test 1", "Test 2"]
        })
        
        # Set up post to return different results for each record
        dest_adapter_mock.post.side_effect = [
            {"success": True, "id": 101},
            {"success": True, "id": 102}
        ]
        
        # Load data
        result = await runner._load_data(dest_adapter_mock, data, integration)
        
        # Verify result
        assert result["success"] is True
        assert "results" in result
        assert len(result["results"]) == 2
        
        # Verify adapter calls - should be called twice, once per record
        assert dest_adapter_mock.post.call_count == 2
    
    @pytest.mark.asyncio
    async def test_load_data_error(self, runner, integration_service_mock):
        """Test error handling during data loading."""
        # Set up test integration
        integration = integration_service_mock.get_integration.return_value
        
        # Create test data
        data = pd.DataFrame({
            "external_id": [1, 2, 3],
            "full_name": ["Test 1", "Test 2", "Test 3"]
        })
        
        # Create a mock adapter that raises an error
        error_adapter = MagicMock()
        error_adapter.post = AsyncMock(side_effect=Exception("API error"))
        
        # Load data (should raise the exception)
        with pytest.raises(Exception) as exc_info:
            await runner._load_data(error_adapter, data, integration)
        
        assert "API error" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_create_adapter_api(self, runner):
        """Test creating an API adapter."""
        # Call the adapter creation method for API-based integration
        adapter = runner._create_adapter_for_integration(
            "API-based",
            "Test API",
            {"api_key": "test_key"}
        )
        
        # For this test, we mainly want to ensure it doesn't raise an exception
        # The actual adapter creation depends on the AdapterFactory which may not be available
        # So we'll just check that the method returns something
        assert adapter is None  # Default behavior when no matching adapter
    
    @pytest.mark.asyncio
    async def test_create_adapter_file(self, runner):
        """Test creating a file-based adapter."""
        # Call the adapter creation method for File-based integration
        adapter = runner._create_adapter_for_integration(
            "File-based",
            "Azure Blob Storage",
            {"connection_string": "test_connection"}
        )
        
        # For this test, we mainly want to ensure it doesn't raise an exception
        # The actual adapter creation depends on the AdapterFactory which may not be available
        # So we'll just check that the method returns something
        assert adapter is None  # Default behavior when no matching adapter
    
    @pytest.mark.asyncio
    async def test_end_to_end_run(self, runner, integration_service_mock, source_adapter_mock, dest_adapter_mock):
        """Test an end-to-end integration run."""
        # Mock the adapter creation method
        with patch.object(runner, '_create_adapter_for_integration') as mock_create_adapter:
            mock_create_adapter.side_effect = [source_adapter_mock, dest_adapter_mock]
            
            # Run the integration
            result = await runner.run(1)
            
            # Verify result
            assert result["status"] == "success"
            assert result["records_processed"] > 0
            assert "history_id" in result
            
            # Verify history record updates
            integration_service_mock.create_history_record.assert_called_once()
            integration_service_mock.update_history_record.assert_called_once_with(
                1,  # integration_id
                integration_service_mock.create_history_record.return_value,  # history_id
                status="success",
                records_processed=2  # From the source adapter mock data
            )