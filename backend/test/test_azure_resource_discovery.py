"""
Tests for Azure resource discovery functionality in the monitoring service.
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import patch, AsyncMock, MagicMock

from backend.modules.admin.monitoring_service import (
    get_azure_resources,
    get_resource_details,
    get_resource_health,
    discover_resources,
    get_resource_types,
    get_resource_groups,
    get_discovery_status,
    get_resource_metrics_by_type
)

from backend.modules.admin.models import (
    AzureResource,
    AzureResourceHealth,
    AzureDiscoveryResult,
    AzureResourceType
)

# Sample resources data
SAMPLE_RESOURCES = [
    {
        "id": "resource-id-1",
        "name": "test-app",
        "type": "Microsoft.Web/sites",
        "resource_group": "test-rg",
        "region": "westus",
        "properties": {"kind": "app", "reserved": False},
        "tags": {"environment": "test"},
        "discovered_at": datetime.now(timezone.utc) - timedelta(days=1)
    },
    {
        "id": "resource-id-2",
        "name": "test-db",
        "type": "Microsoft.DBforPostgreSQL/servers",
        "resource_group": "test-rg",
        "region": "westus",
        "properties": {"version": "11", "administratorLogin": "admin"},
        "tags": {"environment": "test"},
        "discovered_at": datetime.now(timezone.utc) - timedelta(days=1)
    },
    {
        "id": "resource-id-3",
        "name": "test-storage",
        "type": "Microsoft.Storage/storageAccounts",
        "resource_group": "test-rg",
        "region": "westus",
        "properties": {"accessTier": "Hot", "supportsHttpsTrafficOnly": True},
        "tags": {"environment": "test"},
        "discovered_at": datetime.now(timezone.utc) - timedelta(days=1)
    }
]

# Sample resource health data
SAMPLE_HEALTH = {
    "resource_id": "resource-id-1",
    "status": "Available",
    "reason": None,
    "summary": "The resource is healthy",
    "timestamp": datetime.now(timezone.utc) - timedelta(minutes=5)
}

# Sample resource types
SAMPLE_RESOURCE_TYPES = [
    {
        "name": "Microsoft.Web/sites",
        "display_name": "App Services",
        "icon": "app-service-icon",
        "count": 1
    },
    {
        "name": "Microsoft.DBforPostgreSQL/servers",
        "display_name": "PostgreSQL Servers",
        "icon": "database-icon",
        "count": 1
    },
    {
        "name": "Microsoft.Storage/storageAccounts",
        "display_name": "Storage Accounts",
        "icon": "storage-icon",
        "count": 1
    }
]

# Sample resource groups
SAMPLE_RESOURCE_GROUPS = [
    {
        "name": "test-rg",
        "location": "westus",
        "resource_count": 3
    },
    {
        "name": "prod-rg",
        "location": "eastus",
        "resource_count": 0
    }
]

# Mock for database
class MockDatabase:
    async def fetch_all(self, query, values=None):
        if "azure_resources" in query:
            if values and values.get("resource_group") == "prod-rg":
                return []  # No resources in prod-rg
            if values and values.get("resource_type") == "Microsoft.Web/sites":
                return [SAMPLE_RESOURCES[0]]  # Only app service
            if values and values.get("resource_type") == "Microsoft.DBforPostgreSQL/servers":
                return [SAMPLE_RESOURCES[1]]  # Only database
            return SAMPLE_RESOURCES
        elif "azure_resource_health" in query:
            return [SAMPLE_HEALTH]
        elif "resource_types" in query:
            return SAMPLE_RESOURCE_TYPES
        elif "resource_groups" in query:
            return SAMPLE_RESOURCE_GROUPS
        return []
    
    async def fetch_one(self, query, values=None):
        if "resource_id" in str(values):
            for resource in SAMPLE_RESOURCES:
                if resource["id"] == values["resource_id"]:
                    return resource
        elif "azure_config" in query:
            return {
                "tenant_id": "test-tenant",
                "subscription_id": "test-subscription"
            }
        elif "discovery_status" in query:
            return {
                "id": "status-id",
                "status": "completed",
                "start_time": datetime.now(timezone.utc) - timedelta(hours=1),
                "end_time": datetime.now(timezone.utc) - timedelta(minutes=50),
                "discovered_count": 3,
                "error_count": 0,
                "result": "Discovered 3 resources"
            }
        return None
    
    async def execute(self, query, values=None):
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
async def test_get_azure_resources_all():
    """Test retrieving all Azure resources"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get all resources
        resources = await get_azure_resources()
        
        # Verify the result
        assert isinstance(resources, list)
        assert len(resources) == 3
        assert all(isinstance(r, AzureResource) for r in resources)
        assert resources[0].name == "test-app"
        assert resources[1].name == "test-db"
        assert resources[2].name == "test-storage"


@pytest.mark.asyncio
async def test_get_azure_resources_by_group():
    """Test retrieving Azure resources by resource group"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get resources in test-rg
        resources = await get_azure_resources(resource_group="test-rg")
        
        # Verify the result
        assert isinstance(resources, list)
        assert len(resources) == 3
        
        # Get resources in prod-rg (empty)
        resources = await get_azure_resources(resource_group="prod-rg")
        
        # Verify the result
        assert isinstance(resources, list)
        assert len(resources) == 0


@pytest.mark.asyncio
async def test_get_azure_resources_by_type():
    """Test retrieving Azure resources by type"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get app services
        resources = await get_azure_resources(resource_type="Microsoft.Web/sites")
        
        # Verify the result
        assert isinstance(resources, list)
        assert len(resources) == 1
        assert resources[0].name == "test-app"
        
        # Get databases
        resources = await get_azure_resources(resource_type="Microsoft.DBforPostgreSQL/servers")
        
        # Verify the result
        assert isinstance(resources, list)
        assert len(resources) == 1
        assert resources[0].name == "test-db"


@pytest.mark.asyncio
async def test_get_resource_details():
    """Test retrieving details for a specific resource"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get app service details
        resource = await get_resource_details("resource-id-1")
        
        # Verify the result
        assert isinstance(resource, AzureResource)
        assert resource.id == "resource-id-1"
        assert resource.name == "test-app"
        assert resource.type == "Microsoft.Web/sites"
        assert resource.properties.get("kind") == "app"
        
        # Test non-existent resource
        resource = await get_resource_details("non-existent-id")
        
        # Verify the result
        assert resource is None


@pytest.mark.asyncio
async def test_get_resource_health(mock_aiohttp_response, mock_get_token):
    """Test retrieving health status for a resource"""
    # Mock the database and HTTP client
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("aiohttp.ClientSession.get") as mock_get:
        
        # Mock successful health response from Azure
        azure_health_response = {
            "value": [
                {
                    "id": "/subscriptions/test-subscription/resourceGroups/test-rg/providers/Microsoft.Web/sites/test-app/providers/Microsoft.ResourceHealth/availabilityStatuses/current",
                    "name": "current",
                    "type": "Microsoft.ResourceHealth/availabilityStatuses",
                    "location": "westus",
                    "properties": {
                        "availabilityState": "Available",
                        "summary": "The resource is healthy",
                        "reasonType": None,
                        "reasonChronicity": None,
                        "reportedTime": "2025-03-24T12:00:00Z"
                    }
                }
            ]
        }
        
        mock_get.return_value = mock_aiohttp_response(200, azure_health_response)
        
        # Get resource health
        health = await get_resource_health("resource-id-1")
        
        # Verify the result
        assert isinstance(health, AzureResourceHealth)
        assert health.resource_id == "resource-id-1"
        assert health.status == "Available"
        assert health.summary == "The resource is healthy"
        
        # Verify API call
        mock_get.assert_called_once()
        assert "providers/Microsoft.ResourceHealth/availabilityStatuses" in mock_get.call_args[0][0]


@pytest.mark.asyncio
async def test_get_resource_health_from_cache():
    """Test retrieving health status from cache"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("backend.modules.admin.monitoring_service.get_resource_health_from_api") as mock_api:
        
        # Get resource health (should use cached value)
        health = await get_resource_health("resource-id-1", use_cache=True)
        
        # Verify the result
        assert isinstance(health, AzureResourceHealth)
        assert health.resource_id == "resource-id-1"
        assert health.status == "Available"
        
        # Verify API was not called
        mock_api.assert_not_called()


@pytest.mark.asyncio
async def test_get_resource_health_force_refresh(mock_aiohttp_response, mock_get_token):
    """Test forcing refresh of health status"""
    # Mock the database and HTTP client
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("aiohttp.ClientSession.get") as mock_get:
        
        # Mock successful health response from Azure
        azure_health_response = {
            "value": [
                {
                    "id": "/subscriptions/test-subscription/resourceGroups/test-rg/providers/Microsoft.Web/sites/test-app/providers/Microsoft.ResourceHealth/availabilityStatuses/current",
                    "name": "current",
                    "type": "Microsoft.ResourceHealth/availabilityStatuses",
                    "location": "westus",
                    "properties": {
                        "availabilityState": "Degraded",
                        "summary": "The resource is experiencing issues",
                        "reasonType": "PlatformIssue",
                        "reasonChronicity": "Persistent",
                        "reportedTime": "2025-03-24T13:00:00Z"
                    }
                }
            ]
        }
        
        mock_get.return_value = mock_aiohttp_response(200, azure_health_response)
        
        # Get resource health with force refresh
        health = await get_resource_health("resource-id-1", use_cache=False)
        
        # Verify API was called
        mock_get.assert_called_once()


@pytest.mark.asyncio
async def test_discover_resources(mock_aiohttp_response, mock_get_token):
    """Test resource discovery process"""
    # Mock the database and HTTP client
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("aiohttp.ClientSession.get") as mock_get, \
         patch("backend.modules.admin.monitoring_service.process_azure_resources") as mock_process:
        
        # Mock resource listing response from Azure
        azure_resources_response = {
            "value": [
                {
                    "id": "/subscriptions/test-subscription/resourceGroups/test-rg/providers/Microsoft.Web/sites/test-app",
                    "name": "test-app",
                    "type": "Microsoft.Web/sites",
                    "location": "westus",
                    "tags": {"environment": "test"},
                    "kind": "app"
                },
                {
                    "id": "/subscriptions/test-subscription/resourceGroups/test-rg/providers/Microsoft.DBforPostgreSQL/servers/test-db",
                    "name": "test-db",
                    "type": "Microsoft.DBforPostgreSQL/servers",
                    "location": "westus",
                    "tags": {"environment": "test"}
                }
            ]
        }
        
        mock_get.return_value = mock_aiohttp_response(200, azure_resources_response)
        mock_process.return_value = {"processed": 2, "errors": 0}
        
        # Discover resources
        result = await discover_resources()
        
        # Verify the result
        assert isinstance(result, AzureDiscoveryResult)
        assert result.status == "completed"
        
        # Verify API call
        mock_get.assert_called_once()
        assert "resources" in mock_get.call_args[0][0]
        
        # Verify resources were processed
        mock_process.assert_called_once()


@pytest.mark.asyncio
async def test_get_resource_types():
    """Test retrieving resource types"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get resource types
        types = await get_resource_types()
        
        # Verify the result
        assert isinstance(types, list)
        assert len(types) == 3
        assert all(isinstance(t, AzureResourceType) for t in types)
        assert types[0].name == "Microsoft.Web/sites"
        assert types[0].display_name == "App Services"
        assert types[0].count == 1


@pytest.mark.asyncio
async def test_get_resource_groups():
    """Test retrieving resource groups"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get resource groups
        groups = await get_resource_groups()
        
        # Verify the result
        assert isinstance(groups, list)
        assert len(groups) == 2
        assert groups[0]["name"] == "test-rg"
        assert groups[0]["resource_count"] == 3
        assert groups[1]["name"] == "prod-rg"
        assert groups[1]["resource_count"] == 0


@pytest.mark.asyncio
async def test_get_discovery_status():
    """Test retrieving resource discovery status"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get discovery status
        status = await get_discovery_status()
        
        # Verify the result
        assert status["status"] == "completed"
        assert status["discovered_count"] == 3
        assert status["error_count"] == 0


@pytest.mark.asyncio
async def test_get_resource_metrics_by_type(mock_aiohttp_response, mock_get_token):
    """Test retrieving metrics for resources of a specific type"""
    # Mock the database and metrics service
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("backend.modules.admin.monitoring_service.get_app_service_metrics") as mock_app_metrics, \
         patch("backend.modules.admin.monitoring_service.get_database_metrics") as mock_db_metrics:
        
        # Mock metrics responses
        mock_app_metrics.return_value = {
            "labels": ["2025-03-24T00:00:00Z", "2025-03-24T01:00:00Z"],
            "datasets": [{
                "label": "CPU Percentage",
                "data": [10.5, 12.5]
            }]
        }
        
        mock_db_metrics.return_value = {
            "labels": ["2025-03-24T00:00:00Z", "2025-03-24T01:00:00Z"],
            "datasets": [{
                "label": "CPU Percentage",
                "data": [20.5, 22.5]
            }]
        }
        
        # Get app service metrics
        result = await get_resource_metrics_by_type("Microsoft.Web/sites", "cpu", "24h")
        
        # Verify the result
        assert isinstance(result, dict)
        assert "metrics" in result
        assert len(result["metrics"]) == 1  # Only one app service
        assert result["metrics"][0]["resource_name"] == "test-app"
        assert "data" in result["metrics"][0]
        
        # Get database metrics
        result = await get_resource_metrics_by_type("Microsoft.DBforPostgreSQL/servers", "cpu", "24h")
        
        # Verify the result
        assert isinstance(result, dict)
        assert "metrics" in result
        assert len(result["metrics"]) == 1  # Only one database
        assert result["metrics"][0]["resource_name"] == "test-db"
        assert "data" in result["metrics"][0]


@pytest.mark.asyncio
async def test_get_resource_metrics_by_type_unsupported():
    """Test handling of unsupported resource types for metrics"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Try to get metrics for unsupported type
        result = await get_resource_metrics_by_type("UnsupportedType", "cpu", "24h")
        
        # Verify the result
        assert isinstance(result, dict)
        assert "error" in result
        assert "Unsupported resource type" in result["error"]