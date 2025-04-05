"""
Tests for the metrics collection functionality in the monitoring service.
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import patch, AsyncMock, MagicMock

from backend.modules.admin.monitoring_service import (
    get_resource_metrics,
    get_app_service_metrics,
    get_database_metrics,
    get_storage_metrics,
    get_key_vault_metrics,
    get_network_metrics,
    format_metric_response,
    get_documentation_analytics
)

# Sample metric response from Azure
MOCK_AZURE_METRIC_RESPONSE = {
    "value": [
        {
            "id": "/subscriptions/sub-id/resourceGroups/test-rg/providers/Microsoft.Web/sites/test-app/providers/Microsoft.Insights/metrics/CpuPercentage",
            "type": "Microsoft.Insights/metrics",
            "name": {
                "value": "CpuPercentage",
                "localizedValue": "CPU Percentage"
            },
            "displayDescription": "CPU usage percentage",
            "unit": "Percent",
            "timeseries": [
                {
                    "metadatavalues": [],
                    "data": [
                        {
                            "timeStamp": "2025-03-24T00:00:00Z",
                            "average": 10.5,
                            "minimum": 5.0,
                            "maximum": 15.0,
                            "count": 10
                        },
                        {
                            "timeStamp": "2025-03-24T01:00:00Z",
                            "average": 12.5,
                            "minimum": 7.0,
                            "maximum": 18.0,
                            "count": 10
                        },
                        {
                            "timeStamp": "2025-03-24T02:00:00Z",
                            "average": 15.0,
                            "minimum": 9.0,
                            "maximum": 21.0,
                            "count": 10
                        }
                    ]
                }
            ]
        }
    ]
}

# Mock for database
class MockDatabase:
    async def fetch_one(self, query, values=None):
        # Mock Azure configuration
        return {
            "id": "config-id",
            "tenant_id": "tenant-id",
            "subscription_id": "sub-id",
            "client_id": "client-id",
            "is_connected": True,
            "auth_method": "service_principal",
            "last_connected_at": datetime.now(timezone.utc) - timedelta(minutes=30)
        }
    
    async def fetch_all(self, query, values=None):
        # Mock resource list
        return [
            {
                "id": "resource-id-1",
                "name": "test-app",
                "type": "Microsoft.Web/sites",
                "resource_group": "test-rg",
                "region": "westus"
            },
            {
                "id": "resource-id-2",
                "name": "test-db",
                "type": "Microsoft.DBforPostgreSQL/servers",
                "resource_group": "test-rg",
                "region": "westus"
            }
        ]
    
    async def execute(self, query, values=None):
        # Mock successful execution
        return "mock-id"


@pytest.fixture
def mock_aiohttp_response():
    """Fixture to mock aiohttp ClientResponse"""
    class MockResponse:
        def __init__(self, status, json_data):
            self.status = status
            self._json_data = json_data
            self.text = AsyncMock(return_value=str(json_data))
        
        async def json(self):
            return self._json_data
        
        async def __aexit__(self, exc_type, exc, tb):
            pass
        
        async def __aenter__(self):
            return self
    
    return MockResponse


@pytest.fixture
def mock_get_token():
    """Fixture to mock token retrieval"""
    with patch("backend.modules.admin.monitoring_service.get_service_principal_token") as mock:
        mock.return_value = {"access_token": "mock-token", "expires_in": 3600}
        yield mock


@pytest.mark.asyncio
async def test_get_resource_metrics(mock_aiohttp_response, mock_get_token):
    """Test the general resource metrics collection function"""
    # Mock the database and ClientSession
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("aiohttp.ClientSession.get") as mock_get:
        
        # Set up the mock response
        mock_get.return_value = mock_aiohttp_response(200, MOCK_AZURE_METRIC_RESPONSE)
        
        # Call the function
        result = await get_resource_metrics(
            resource_id="test-resource-id",
            metric_name="CpuPercentage",
            time_range="24h"
        )
        
        # Verify the result
        assert isinstance(result, dict)
        assert "labels" in result
        assert "datasets" in result
        assert len(result["labels"]) == 3
        assert len(result["datasets"]) == 1
        assert result["datasets"][0]["label"] == "CPU Percentage"
        assert len(result["datasets"][0]["data"]) == 3
        assert result["datasets"][0]["data"][0] == 10.5
        
        # Verify the API call
        mock_get.assert_called_once()
        call_args = mock_get.call_args[0][0]
        assert "test-resource-id" in call_args
        assert "api-version=2018-01-01" in call_args
        assert "CpuPercentage" in call_args


@pytest.mark.asyncio
async def test_get_app_service_metrics(mock_aiohttp_response, mock_get_token):
    """Test metrics collection for App Service resources"""
    # Mock the database and ClientSession
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("aiohttp.ClientSession.get") as mock_get, \
         patch("backend.modules.admin.monitoring_service.get_resource_metrics") as mock_get_metrics:
        
        # Set up the mock response
        mock_get_metrics.return_value = {
            "labels": ["2025-03-24T00:00:00Z", "2025-03-24T01:00:00Z", "2025-03-24T02:00:00Z"],
            "datasets": [{
                "label": "CPU Percentage",
                "data": [10.5, 12.5, 15.0],
                "backgroundColor": "rgba(75, 192, 192, 0.2)",
                "borderColor": "rgba(75, 192, 192, 1)"
            }]
        }
        
        # Call the function
        result = await get_app_service_metrics(
            resource_id="test-app-id",
            metric_name="cpu",
            time_range="24h"
        )
        
        # Verify the result
        assert isinstance(result, dict)
        assert "labels" in result
        assert "datasets" in result
        
        # Verify that get_resource_metrics was called with correct params
        mock_get_metrics.assert_called_once()
        call_args = mock_get_metrics.call_args[1]
        assert call_args["resource_id"] == "test-app-id"
        assert "metric_name" in call_args
        assert call_args["time_range"] == "24h"


@pytest.mark.asyncio
async def test_get_database_metrics(mock_aiohttp_response, mock_get_token):
    """Test metrics collection for database resources"""
    # Mock the database and ClientSession
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("backend.modules.admin.monitoring_service.get_resource_metrics") as mock_get_metrics:
        
        # Set up the mock response
        mock_get_metrics.return_value = {
            "labels": ["2025-03-24T00:00:00Z", "2025-03-24T01:00:00Z", "2025-03-24T02:00:00Z"],
            "datasets": [{
                "label": "CPU Percentage",
                "data": [10.5, 12.5, 15.0],
                "backgroundColor": "rgba(75, 192, 192, 0.2)",
                "borderColor": "rgba(75, 192, 192, 1)"
            }]
        }
        
        # Call the function
        result = await get_database_metrics(
            resource_id="test-db-id",
            metric_name="cpu",
            time_range="24h"
        )
        
        # Verify the result
        assert isinstance(result, dict)
        assert "labels" in result
        assert "datasets" in result
        
        # Verify that get_resource_metrics was called with correct params
        mock_get_metrics.assert_called_once()
        call_args = mock_get_metrics.call_args[1]
        assert call_args["resource_id"] == "test-db-id"
        assert "metric_name" in call_args
        assert call_args["time_range"] == "24h"


@pytest.mark.asyncio
async def test_get_storage_metrics(mock_aiohttp_response, mock_get_token):
    """Test metrics collection for storage resources"""
    # Mock the database and ClientSession
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("backend.modules.admin.monitoring_service.get_resource_metrics") as mock_get_metrics:
        
        # Set up the mock response
        mock_get_metrics.return_value = {
            "labels": ["2025-03-24T00:00:00Z", "2025-03-24T01:00:00Z", "2025-03-24T02:00:00Z"],
            "datasets": [{
                "label": "Availability",
                "data": [99.9, 99.8, 100.0],
                "backgroundColor": "rgba(75, 192, 192, 0.2)",
                "borderColor": "rgba(75, 192, 192, 1)"
            }]
        }
        
        # Call the function
        result = await get_storage_metrics(
            resource_id="test-storage-id",
            metric_name="availability",
            time_range="24h"
        )
        
        # Verify the result
        assert isinstance(result, dict)
        assert "labels" in result
        assert "datasets" in result
        
        # Verify that get_resource_metrics was called with correct params
        mock_get_metrics.assert_called_once()
        call_args = mock_get_metrics.call_args[1]
        assert call_args["resource_id"] == "test-storage-id"
        assert "metric_name" in call_args
        assert call_args["time_range"] == "24h"


@pytest.mark.asyncio
async def test_get_key_vault_metrics(mock_aiohttp_response, mock_get_token):
    """Test metrics collection for Key Vault resources"""
    # Mock the database and ClientSession
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("backend.modules.admin.monitoring_service.get_resource_metrics") as mock_get_metrics:
        
        # Set up the mock response
        mock_get_metrics.return_value = {
            "labels": ["2025-03-24T00:00:00Z", "2025-03-24T01:00:00Z", "2025-03-24T02:00:00Z"],
            "datasets": [{
                "label": "API Requests",
                "data": [100, 120, 150],
                "backgroundColor": "rgba(75, 192, 192, 0.2)",
                "borderColor": "rgba(75, 192, 192, 1)"
            }]
        }
        
        # Call the function
        result = await get_key_vault_metrics(
            resource_id="test-keyvault-id",
            metric_name="apiRequests",
            time_range="24h"
        )
        
        # Verify the result
        assert isinstance(result, dict)
        assert "labels" in result
        assert "datasets" in result
        
        # Verify that get_resource_metrics was called with correct params
        mock_get_metrics.assert_called_once()
        call_args = mock_get_metrics.call_args[1]
        assert call_args["resource_id"] == "test-keyvault-id"
        assert "metric_name" in call_args
        assert call_args["time_range"] == "24h"


@pytest.mark.asyncio
async def test_get_network_metrics(mock_aiohttp_response, mock_get_token):
    """Test metrics collection for Network resources"""
    # Mock the database and ClientSession
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("backend.modules.admin.monitoring_service.get_resource_metrics") as mock_get_metrics:
        
        # Set up the mock response
        mock_get_metrics.return_value = {
            "labels": ["2025-03-24T00:00:00Z", "2025-03-24T01:00:00Z", "2025-03-24T02:00:00Z"],
            "datasets": [{
                "label": "Throughput",
                "data": [1.5, 2.0, 1.8],
                "backgroundColor": "rgba(75, 192, 192, 0.2)",
                "borderColor": "rgba(75, 192, 192, 1)"
            }]
        }
        
        # Call the function
        result = await get_network_metrics(
            resource_id="test-network-id",
            metric_name="throughput",
            time_range="24h"
        )
        
        # Verify the result
        assert isinstance(result, dict)
        assert "labels" in result
        assert "datasets" in result
        
        # Verify that get_resource_metrics was called with correct params
        mock_get_metrics.assert_called_once()
        call_args = mock_get_metrics.call_args[1]
        assert call_args["resource_id"] == "test-network-id"
        assert "metric_name" in call_args
        assert call_args["time_range"] == "24h"


@pytest.mark.asyncio
async def test_get_documentation_analytics():
    """Test documentation analytics metrics collection"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        
        # Call the function
        result = await get_documentation_analytics(time_range="30d")
        
        # Verify the result
        assert isinstance(result, dict)
        assert "pageViews" in result
        assert "uniqueVisitors" in result
        assert "popularDocuments" in result
        assert "searchTerms" in result
        assert isinstance(result["pageViews"], dict)
        assert "labels" in result["pageViews"]
        assert "datasets" in result["pageViews"]


@pytest.mark.asyncio
async def test_format_metric_response():
    """Test the formatting of Azure metric responses into chart-ready format"""
    # Sample Azure metric response
    azure_response = MOCK_AZURE_METRIC_RESPONSE
    
    # Call the function
    result = format_metric_response(azure_response)
    
    # Verify the result
    assert isinstance(result, dict)
    assert "labels" in result
    assert "datasets" in result
    assert len(result["labels"]) == 3
    assert isinstance(result["datasets"], list)
    assert len(result["datasets"]) == 1
    assert result["datasets"][0]["label"] == "CPU Percentage"
    assert len(result["datasets"][0]["data"]) == 3
    assert result["datasets"][0]["data"][0] == 10.5
    assert "backgroundColor" in result["datasets"][0]
    assert "borderColor" in result["datasets"][0]


@pytest.mark.asyncio
async def test_get_resource_metrics_error_handling(mock_aiohttp_response, mock_get_token):
    """Test error handling in resource metrics collection"""
    # Mock the database and ClientSession with error response
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("aiohttp.ClientSession.get") as mock_get:
        
        # Set up the mock error response
        mock_get.return_value = mock_aiohttp_response(404, {"error": {"code": "ResourceNotFound", "message": "The resource was not found."}})
        
        # Call the function
        result = await get_resource_metrics(
            resource_id="test-resource-id",
            metric_name="CpuPercentage",
            time_range="24h"
        )
        
        # Verify the result indicates error
        assert isinstance(result, dict)
        assert "error" in result
        assert result["error"] == "Failed to retrieve metrics data"


@pytest.mark.asyncio
async def test_get_resource_metrics_time_range_parsing():
    """Test time range parameter parsing in metrics collection"""
    # Mock the dependencies
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("backend.modules.admin.monitoring_service.get_service_principal_token") as mock_token, \
         patch("aiohttp.ClientSession.get") as mock_get:
        
        mock_token.return_value = {"access_token": "mock-token"}
        
        # Set the mock get response to return the raw URL for inspection
        async def mock_url_capture(*args, **kwargs):
            class MockResp:
                status = 200
                async def json(self):
                    return {"value": []}
                async def __aenter__(self):
                    return self
                async def __aexit__(self, *args):
                    pass
            
            # Return the URL that was called for testing
            MockResp.url = args[0]
            return MockResp()
        
        mock_get.side_effect = mock_url_capture
        
        # Test different time ranges
        time_ranges = {
            "1h": 60,
            "6h": 360,
            "24h": 1440,
            "7d": 10080,
            "30d": 43200
        }
        
        for range_str, minutes in time_ranges.items():
            # Call the function with this time range
            await get_resource_metrics(
                resource_id="test-resource-id",
                metric_name="CpuPercentage",
                time_range=range_str
            )
            
            # Get the URL that was called
            call_url = mock_get.call_args[0][0]
            
            # Verify the time parameters in the URL
            assert f"interval=PT" in call_url, f"Failed for range {range_str}"
            # Larger time ranges should have larger intervals
            if minutes > 1440:  # More than a day
                assert "PT1H" in call_url, f"Failed interval for range {range_str}"
            elif minutes > 360:  # More than 6 hours
                assert "PT5M" in call_url, f"Failed interval for range {range_str}"
            else:
                assert "PT1M" in call_url, f"Failed interval for range {range_str}"