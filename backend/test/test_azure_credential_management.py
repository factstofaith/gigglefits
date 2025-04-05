"""
Tests for Azure credential management in the monitoring service.
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import patch, AsyncMock, MagicMock
from pydantic import SecretStr

from backend.modules.admin.monitoring_service import (
    get_azure_config,
    save_azure_config,
    update_azure_config,
    delete_azure_config,
    test_azure_connection,
    check_azure_connection,
    get_service_principal_token
)

from backend.modules.admin.models import (
    AzureConfigCreate,
    AzureConfigUpdate,
    AzureConfig,
    AzureAuthMethod
)

# Sample config data
SAMPLE_CONFIG = {
    "id": "config-id",
    "tenant_id": "test-tenant",
    "subscription_id": "test-subscription",
    "resource_group": "test-resource-group",
    "auth_method": AzureAuthMethod.SERVICE_PRINCIPAL,
    "client_id": "test-client",
    "client_secret": None,  # Sensitive value not returned from DB
    "refresh_interval": 300,
    "is_connected": True,
    "last_connected_at": datetime.now(timezone.utc) - timedelta(minutes=10),
    "created_at": datetime.now(timezone.utc) - timedelta(days=1),
    "updated_at": datetime.now(timezone.utc) - timedelta(minutes=10)
}

# Mock for database
class MockDatabase:
    def __init__(self, has_config=True):
        self.has_config = has_config
        self.executed_queries = []
        self.query_values = []
    
    async def fetch_one(self, query, values=None):
        if not self.has_config:
            return None
        return SAMPLE_CONFIG
    
    async def execute(self, query, values=None):
        self.executed_queries.append(query)
        self.query_values.append(values)
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


@pytest.mark.asyncio
async def test_get_azure_config_exists():
    """Test retrieving Azure configuration when it exists"""
    # Mock the database with config
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase(has_config=True)):
        result = await get_azure_config()
        
        # Verify the result
        assert isinstance(result, AzureConfig)
        assert result.tenant_id == "test-tenant"
        assert result.subscription_id == "test-subscription"
        assert result.resource_group == "test-resource-group"
        assert result.client_id == "test-client"
        assert result.is_connected is True


@pytest.mark.asyncio
async def test_get_azure_config_not_exists():
    """Test retrieving Azure configuration when it doesn't exist"""
    # Mock the database without config
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase(has_config=False)):
        result = await get_azure_config()
        
        # Verify the result
        assert result is None


@pytest.mark.asyncio
async def test_save_azure_config_new():
    """Test saving a new Azure configuration"""
    # Mock the database without existing config
    mock_db = MockDatabase(has_config=False)
    with patch("backend.modules.admin.monitoring_service.database", mock_db), \
         patch("backend.modules.admin.monitoring_service.test_azure_connection") as mock_test:
        
        # Mock successful connection test
        mock_test.return_value.success = True
        
        # Create a new config
        config = AzureConfigCreate(
            tenant_id="new-tenant",
            subscription_id="new-subscription",
            resource_group="new-resource-group",
            auth_method=AzureAuthMethod.SERVICE_PRINCIPAL,
            client_id="new-client",
            client_secret=SecretStr("new-secret"),
            refresh_interval=300
        )
        
        # Save the config
        await save_azure_config(config, "test-user")
        
        # Verify the database was called with INSERT
        assert len(mock_db.executed_queries) >= 1
        assert any("INSERT INTO" in query for query in mock_db.executed_queries)
        
        # Verify connection test was called
        mock_test.assert_called_once()


@pytest.mark.asyncio
async def test_save_azure_config_update():
    """Test updating an existing Azure configuration"""
    # Mock the database with existing config
    mock_db = MockDatabase(has_config=True)
    with patch("backend.modules.admin.monitoring_service.database", mock_db), \
         patch("backend.modules.admin.monitoring_service.test_azure_connection") as mock_test:
        
        # Mock successful connection test
        mock_test.return_value.success = True
        
        # Create an update config
        config = AzureConfigCreate(
            tenant_id="updated-tenant",
            subscription_id="updated-subscription",
            resource_group="updated-resource-group",
            auth_method=AzureAuthMethod.SERVICE_PRINCIPAL,
            client_id="updated-client",
            client_secret=SecretStr("updated-secret"),
            refresh_interval=600
        )
        
        # Save the config
        await save_azure_config(config, "test-user")
        
        # Verify the database was called with UPDATE
        assert len(mock_db.executed_queries) >= 1
        assert any("UPDATE" in query for query in mock_db.executed_queries)
        
        # Verify connection test was called
        mock_test.assert_called_once()


@pytest.mark.asyncio
async def test_update_azure_config():
    """Test updating specific fields in Azure configuration"""
    # Mock the database with existing config
    mock_db = MockDatabase(has_config=True)
    with patch("backend.modules.admin.monitoring_service.database", mock_db), \
         patch("backend.modules.admin.monitoring_service.test_azure_connection") as mock_test:
        
        # Mock successful connection test
        mock_test.return_value.success = True
        
        # Create an update with only some fields
        config = AzureConfigUpdate(
            tenant_id="updated-tenant",
            refresh_interval=600
        )
        
        # Update the config
        result = await update_azure_config(config, "test-user")
        
        # Verify the database was called with UPDATE
        assert len(mock_db.executed_queries) >= 1
        assert any("UPDATE" in query and "tenant_id" in query for query in mock_db.executed_queries)
        
        # Since we updated auth-related fields, connection test should be called
        mock_test.assert_called_once()


@pytest.mark.asyncio
async def test_update_azure_config_non_auth_fields():
    """Test updating non-auth fields in Azure configuration"""
    # Mock the database with existing config
    mock_db = MockDatabase(has_config=True)
    with patch("backend.modules.admin.monitoring_service.database", mock_db), \
         patch("backend.modules.admin.monitoring_service.test_azure_connection") as mock_test:
        
        # Create an update with only non-auth fields
        config = AzureConfigUpdate(
            refresh_interval=600
        )
        
        # Update the config
        result = await update_azure_config(config, "test-user")
        
        # Verify the database was called with UPDATE
        assert len(mock_db.executed_queries) >= 1
        assert any("UPDATE" in query and "refresh_interval" in query for query in mock_db.executed_queries)
        
        # Connection test should not be called for non-auth fields
        mock_test.assert_not_called()


@pytest.mark.asyncio
async def test_delete_azure_config():
    """Test deleting Azure configuration"""
    # Mock the database
    mock_db = MockDatabase(has_config=True)
    with patch("backend.modules.admin.monitoring_service.database", mock_db):
        
        # Delete the config
        result = await delete_azure_config()
        
        # Verify the result
        assert result is True
        
        # Verify the database was called with DELETE
        assert len(mock_db.executed_queries) >= 1
        assert any("DELETE FROM" in query for query in mock_db.executed_queries)


@pytest.mark.asyncio
async def test_test_azure_connection_success(mock_aiohttp_response):
    """Test Azure connection testing with successful result"""
    # Mock the database and HTTP responses
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase(has_config=True)), \
         patch("backend.modules.admin.monitoring_service.get_service_principal_token") as mock_token, \
         patch("aiohttp.ClientSession.get") as mock_get:
        
        # Mock successful token
        mock_token.return_value = {"access_token": "mock-token"}
        
        # Mock successful subscription response
        sub_response = mock_aiohttp_response(200, {
            "id": "/subscriptions/test-subscription",
            "displayName": "Test Subscription",
            "state": "Enabled"
        })
        
        # Mock successful resource group response
        rg_response = mock_aiohttp_response(200, {
            "id": "/subscriptions/test-subscription/resourceGroups/test-resource-group",
            "name": "test-resource-group",
            "location": "westus"
        })
        
        # Set up the mock to return different responses for different URLs
        mock_get.side_effect = lambda url, **kwargs: \
            sub_response if "subscriptions" in url and "resourceGroups" not in url else rg_response
        
        # Test with config object
        config = AzureConfigCreate(
            tenant_id="test-tenant",
            subscription_id="test-subscription",
            resource_group="test-resource-group",
            auth_method=AzureAuthMethod.SERVICE_PRINCIPAL,
            client_id="test-client",
            client_secret=SecretStr("test-secret"),
            refresh_interval=300
        )
        
        result = await test_azure_connection(config)
        
        # Verify the result
        assert result.success is True
        assert "Successfully connected" in result.message
        assert "subscription" in result.details
        assert "resource_group" in result.details


@pytest.mark.asyncio
async def test_test_azure_connection_stored_config():
    """Test Azure connection testing using stored configuration"""
    # Mock the database and token service
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase(has_config=True)), \
         patch("backend.modules.admin.monitoring_service.get_service_principal_token") as mock_token, \
         patch("aiohttp.ClientSession.get") as mock_get:
        
        # Mock successful token
        mock_token.return_value = {"access_token": "mock-token"}
        
        # Mock successful HTTP responses
        mock_get.return_value.__aenter__.return_value.status = 200
        mock_get.return_value.__aenter__.return_value.json = AsyncMock(return_value={
            "id": "/subscriptions/test-subscription",
            "displayName": "Test Subscription",
            "state": "Enabled"
        })
        
        # Test with no config (should use stored)
        result = await test_azure_connection()
        
        # Verify token retrieval was called with stored values
        mock_token.assert_called_once()
        assert "test-tenant" in mock_token.call_args[1]["tenant_id"]


@pytest.mark.asyncio
async def test_test_azure_connection_failure():
    """Test Azure connection testing with failure"""
    # Mock the database and token service
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase(has_config=True)), \
         patch("backend.modules.admin.monitoring_service.get_service_principal_token") as mock_token:
        
        # Mock token failure
        mock_token.return_value = {
            "error": "invalid_client",
            "error_description": "Invalid client credentials"
        }
        
        # Test with config object
        config = AzureConfigCreate(
            tenant_id="test-tenant",
            subscription_id="test-subscription",
            resource_group="test-resource-group",
            auth_method=AzureAuthMethod.SERVICE_PRINCIPAL,
            client_id="test-client",
            client_secret=SecretStr("test-secret"),
            refresh_interval=300
        )
        
        result = await test_azure_connection(config)
        
        # Verify the result
        assert result.success is False
        assert "Authentication failed" in result.message


@pytest.mark.asyncio
async def test_check_azure_connection_connected():
    """Test checking Azure connection status when connected"""
    # Mock the database with connected config
    mock_db = MockDatabase(has_config=True)
    with patch("backend.modules.admin.monitoring_service.database", mock_db):
        
        # Check connection
        result = await check_azure_connection()
        
        # Verify the result
        assert result is True


@pytest.mark.asyncio
async def test_check_azure_connection_expired():
    """Test checking Azure connection status when last check is expired"""
    # Mock the database with connected config but old timestamp
    mock_config = dict(SAMPLE_CONFIG)
    mock_config["last_connected_at"] = datetime.now(timezone.utc) - timedelta(hours=2)  # 2 hours old
    
    mock_db = MockDatabase(has_config=True)
    mock_db.fetch_one = AsyncMock(return_value=mock_config)
    
    with patch("backend.modules.admin.monitoring_service.database", mock_db), \
         patch("backend.modules.admin.monitoring_service.test_azure_connection") as mock_test:
        
        # Mock successful test
        mock_test.return_value.success = True
        
        # Check connection
        result = await check_azure_connection()
        
        # Verify test was called
        mock_test.assert_called_once()
        
        # Verify result
        assert result is True


@pytest.mark.asyncio
async def test_get_service_principal_token():
    """Test retrieving service principal token"""
    # Mock the HTTP client
    with patch("aiohttp.ClientSession.post") as mock_post:
        
        # Mock successful token response
        response_mock = AsyncMock()
        response_mock.status = 200
        response_mock.json = AsyncMock(return_value={
            "token_type": "Bearer",
            "expires_in": 3600,
            "access_token": "mock-access-token"
        })
        mock_post.return_value.__aenter__.return_value = response_mock
        
        # Get token
        result = await get_service_principal_token(
            tenant_id="test-tenant",
            client_id="test-client",
            client_secret="test-secret"
        )
        
        # Verify the result
        assert "access_token" in result
        assert result["access_token"] == "mock-access-token"
        
        # Verify correct URL and data
        mock_post.assert_called_once()
        assert "test-tenant" in mock_post.call_args[0][0]
        assert "client_id" in mock_post.call_args[1]["data"]
        assert "client_secret" in mock_post.call_args[1]["data"]


@pytest.mark.asyncio
async def test_get_service_principal_token_with_stored_credentials():
    """Test retrieving service principal token using stored credentials"""
    # Mock the database and HTTP client
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase(has_config=True)), \
         patch("aiohttp.ClientSession.post") as mock_post:
        
        # Mock successful token response
        response_mock = AsyncMock()
        response_mock.status = 200
        response_mock.json = AsyncMock(return_value={
            "token_type": "Bearer",
            "expires_in": 3600,
            "access_token": "mock-access-token"
        })
        mock_post.return_value.__aenter__.return_value = response_mock
        
        # Get token with no client_secret (should use stored)
        result = await get_service_principal_token(
            tenant_id="test-tenant",
            client_id="test-client"
        )
        
        # Verify the result
        assert "access_token" in result
        assert result["access_token"] == "mock-access-token"


@pytest.mark.asyncio
async def test_get_service_principal_token_failure():
    """Test failure handling in service principal token retrieval"""
    # Mock the HTTP client
    with patch("aiohttp.ClientSession.post") as mock_post:
        
        # Mock error response
        response_mock = AsyncMock()
        response_mock.status = 401
        response_mock.json = AsyncMock(return_value={
            "error": "invalid_client",
            "error_description": "AADSTS7000215: Invalid client credentials."
        })
        mock_post.return_value.__aenter__.return_value = response_mock
        
        # Get token
        result = await get_service_principal_token(
            tenant_id="test-tenant",
            client_id="test-client",
            client_secret="invalid-secret"
        )
        
        # Verify error in result
        assert "error" in result
        assert result["error"] == "invalid_client"