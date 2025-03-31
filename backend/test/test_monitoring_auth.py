"""
Tests for authentication and authorization in the monitoring controllers.
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import patch, AsyncMock, MagicMock

from fastapi import HTTPException, Request, Depends
from fastapi.security import OAuth2PasswordBearer

from backend.modules.admin.monitoring_controller import (
    get_monitoring_dashboard_data,
    get_azure_config,
    update_azure_config,
    test_azure_connection,
    get_resource_health,
    get_resource_metrics,
    get_alerts,
    create_alert,
    update_alert,
    delete_alert,
    get_error_logs
)

from backend.core.auth import (
    get_current_user,
    get_current_admin,
    verify_tenant_access,
    verify_api_key
)

# Test config for security and auth dependencies
OAUTH2_SCHEME = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# Mock user data
ADMIN_USER = {
    "id": "admin-user-id",
    "email": "admin@example.com",
    "role": "admin",
    "tenant_id": "tenant-id-1",
    "is_active": True
}

REGULAR_USER = {
    "id": "regular-user-id",
    "email": "user@example.com",
    "role": "user",
    "tenant_id": "tenant-id-1",
    "is_active": True
}

INACTIVE_USER = {
    "id": "inactive-user-id",
    "email": "inactive@example.com",
    "role": "user",
    "tenant_id": "tenant-id-1",
    "is_active": False
}

OTHER_TENANT_USER = {
    "id": "other-tenant-user-id",
    "email": "other@example.com",
    "role": "admin",
    "tenant_id": "tenant-id-2",
    "is_active": True
}


# Mock dependency functions
async def mock_get_current_user(token: str = Depends(OAUTH2_SCHEME)):
    """Mock function for get_current_user dependency"""
    if token == "admin-token":
        return ADMIN_USER
    elif token == "user-token":
        return REGULAR_USER
    elif token == "inactive-token":
        return INACTIVE_USER
    elif token == "other-tenant-token":
        return OTHER_TENANT_USER
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


async def mock_get_current_admin(current_user = Depends(mock_get_current_user)):
    """Mock function for get_current_admin dependency"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this resource"
        )
    return current_user


async def mock_verify_tenant_access(request: Request, current_user = Depends(mock_get_current_user)):
    """Mock function for verify_tenant_access dependency"""
    # Extract tenant_id from path parameters
    tenant_id = request.path_params.get("tenant_id")
    
    if tenant_id and tenant_id != current_user["tenant_id"]:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this tenant"
        )
    return current_user


async def mock_verify_api_key(api_key: str = Depends(lambda: None)):
    """Mock function for verify_api_key dependency"""
    if api_key != "valid-api-key":
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )
    return True


# Mock Request class
class MockRequest:
    def __init__(self, path_params=None):
        self.path_params = path_params or {}


# Mock responses for monitoring services
MOCK_DASHBOARD_DATA = {
    "resource_summary": {"total": 5, "healthy": 4, "unhealthy": 1},
    "alerts_summary": {"critical": 1, "high": 2, "medium": 1, "low": 0},
    "resource_health": [
        {"id": "resource-id-1", "name": "test-app", "type": "Microsoft.Web/sites", "status": "Available"}
    ]
}

MOCK_AZURE_CONFIG = {
    "tenant_id": "test-tenant",
    "subscription_id": "test-subscription",
    "resource_group": "test-resource-group",
    "is_connected": True
}

MOCK_RESOURCE_HEALTH = {
    "resource_id": "resource-id-1",
    "status": "Available",
    "summary": "The resource is healthy"
}

MOCK_METRICS = {
    "labels": ["2025-03-24T00:00:00Z", "2025-03-24T01:00:00Z"],
    "datasets": [{"label": "CPU", "data": [10, 20]}]
}

MOCK_ALERTS = [
    {"id": "alert-id-1", "name": "High CPU Usage", "severity": "high", "status": "active"}
]

MOCK_ERROR_LOGS = [
    {"id": "log-id-1", "message": "Error in application", "severity": "error", "timestamp": "2025-03-24T00:00:00Z"}
]


# Test fixtures and helper functions
@pytest.fixture
def mock_monitoring_services():
    """Fixture to mock all monitoring services"""
    with patch("backend.modules.admin.monitoring_controller.get_monitoring_dashboard_data_service") as mock_dashboard, \
         patch("backend.modules.admin.monitoring_controller.get_azure_config_service") as mock_config, \
         patch("backend.modules.admin.monitoring_controller.update_azure_config_service") as mock_update_config, \
         patch("backend.modules.admin.monitoring_controller.test_azure_connection_service") as mock_test_connection, \
         patch("backend.modules.admin.monitoring_controller.get_resource_health_service") as mock_health, \
         patch("backend.modules.admin.monitoring_controller.get_resource_metrics_service") as mock_metrics, \
         patch("backend.modules.admin.monitoring_controller.get_alerts_service") as mock_alerts, \
         patch("backend.modules.admin.monitoring_controller.create_alert_service") as mock_create_alert, \
         patch("backend.modules.admin.monitoring_controller.update_alert_service") as mock_update_alert, \
         patch("backend.modules.admin.monitoring_controller.delete_alert_service") as mock_delete_alert, \
         patch("backend.modules.admin.monitoring_controller.get_error_logs_service") as mock_error_logs:
        
        # Set up mock return values
        mock_dashboard.return_value = MOCK_DASHBOARD_DATA
        mock_config.return_value = MOCK_AZURE_CONFIG
        mock_update_config.return_value = MOCK_AZURE_CONFIG
        mock_test_connection.return_value = {"success": True, "message": "Connected successfully"}
        mock_health.return_value = MOCK_RESOURCE_HEALTH
        mock_metrics.return_value = MOCK_METRICS
        mock_alerts.return_value = MOCK_ALERTS
        mock_create_alert.return_value = MOCK_ALERTS[0]
        mock_update_alert.return_value = True
        mock_delete_alert.return_value = True
        mock_error_logs.return_value = MOCK_ERROR_LOGS
        
        yield {
            "dashboard": mock_dashboard,
            "config": mock_config,
            "update_config": mock_update_config,
            "test_connection": mock_test_connection,
            "health": mock_health,
            "metrics": mock_metrics,
            "alerts": mock_alerts,
            "create_alert": mock_create_alert,
            "update_alert": mock_update_alert,
            "delete_alert": mock_delete_alert,
            "error_logs": mock_error_logs
        }


# Tests for authentication and authorization
@pytest.mark.asyncio
async def test_admin_access_allowed(mock_monitoring_services):
    """Test that admin users can access admin-only endpoints"""
    # Mock admin token
    admin_token = "admin-token"
    
    # Test dashboard data endpoint with admin user
    with patch("backend.modules.admin.monitoring_controller.get_current_admin") as mock_admin:
        mock_admin.side_effect = lambda: ADMIN_USER
        
        # Call the endpoint
        result = await get_monitoring_dashboard_data(current_admin=ADMIN_USER)
        
        # Verify the result
        assert result == MOCK_DASHBOARD_DATA
        
        # Verify the service was called
        mock_monitoring_services["dashboard"].assert_called_once()


@pytest.mark.asyncio
async def test_non_admin_access_denied():
    """Test that non-admin users cannot access admin-only endpoints"""
    # Mock regular user token
    user_token = "user-token"
    
    # Test dashboard data endpoint with regular user
    with patch("backend.core.auth.get_current_user") as mock_user, \
         patch("backend.core.auth.get_current_admin") as mock_admin:
        
        mock_user.return_value = REGULAR_USER
        mock_admin.side_effect = lambda: HTTPException(status_code=403, detail="Not authorized")
        
        # Call should raise exception
        with pytest.raises(HTTPException) as excinfo:
            await get_monitoring_dashboard_data(current_admin=None)
        
        # Verify the exception
        assert excinfo.value.status_code == 403
        assert "Not authorized" in str(excinfo.value.detail)


@pytest.mark.asyncio
async def test_inactive_user_denied():
    """Test that inactive users are denied access"""
    # Mock inactive user token
    inactive_token = "inactive-token"
    
    # Test with inactive user
    with patch("backend.core.auth.get_current_user") as mock_user:
        mock_user.side_effect = lambda: HTTPException(status_code=401, detail="Inactive user")
        
        # Call should raise exception
        with pytest.raises(HTTPException) as excinfo:
            await get_azure_config(current_user=None)
        
        # Verify the exception
        assert excinfo.value.status_code == 401
        assert "Inactive user" in str(excinfo.value.detail)


@pytest.mark.asyncio
async def test_tenant_access_control():
    """Test tenant isolation enforcement"""
    # Mock request with tenant path param
    request = MockRequest(path_params={"tenant_id": "tenant-id-2"})
    
    # Test with user from different tenant
    with patch("backend.core.auth.get_current_user") as mock_user, \
         patch("backend.core.auth.verify_tenant_access") as mock_tenant_access:
        
        mock_user.return_value = ADMIN_USER  # User from tenant-id-1
        mock_tenant_access.side_effect = lambda request, current_user: HTTPException(
            status_code=403, 
            detail="Not authorized to access this tenant"
        )
        
        # Call should raise exception
        with pytest.raises(HTTPException) as excinfo:
            await get_resource_health(
                "resource-id-1", 
                request=request,
                current_user=None
            )
        
        # Verify the exception
        assert excinfo.value.status_code == 403
        assert "Not authorized to access this tenant" in str(excinfo.value.detail)


@pytest.mark.asyncio
async def test_api_key_auth():
    """Test API key authentication"""
    # Test with invalid API key
    with patch("backend.core.auth.verify_api_key") as mock_verify:
        mock_verify.side_effect = lambda: HTTPException(
            status_code=401,
            detail="Invalid API key"
        )
        
        # Call should raise exception
        with pytest.raises(HTTPException) as excinfo:
            await get_alerts(api_key="invalid-key")
        
        # Verify the exception
        assert excinfo.value.status_code == 401
        assert "Invalid API key" in str(excinfo.value.detail)


@pytest.mark.asyncio
async def test_create_alert_permissions(mock_monitoring_services):
    """Test permissions for creating alerts"""
    # Test with admin user
    with patch("backend.modules.admin.monitoring_controller.get_current_admin") as mock_admin:
        mock_admin.return_value = ADMIN_USER
        
        # Create alert data
        alert_data = {
            "name": "Test Alert",
            "resource_id": "resource-id-1",
            "severity": "high",
            "conditions": [{"metric": "cpu", "operator": "gt", "threshold": 80}]
        }
        
        # Call the endpoint
        result = await create_alert(alert_data, current_admin=ADMIN_USER)
        
        # Verify the result
        assert result == MOCK_ALERTS[0]
        
        # Verify service was called with user ID
        mock_monitoring_services["create_alert"].assert_called_once()
        assert mock_monitoring_services["create_alert"].call_args[0][1] == ADMIN_USER["id"]


@pytest.mark.asyncio
async def test_update_alert_permissions(mock_monitoring_services):
    """Test permissions for updating alerts"""
    # Test with admin user
    with patch("backend.modules.admin.monitoring_controller.get_current_admin") as mock_admin:
        mock_admin.return_value = ADMIN_USER
        
        # Update alert data
        alert_data = {
            "name": "Updated Alert",
            "severity": "critical"
        }
        
        # Call the endpoint
        result = await update_alert("alert-id-1", alert_data, current_admin=ADMIN_USER)
        
        # Verify the result
        assert result == {"success": True}
        
        # Verify service was called with user ID
        mock_monitoring_services["update_alert"].assert_called_once()
        assert mock_monitoring_services["update_alert"].call_args[0][2] == ADMIN_USER["id"]


@pytest.mark.asyncio
async def test_delete_alert_permissions(mock_monitoring_services):
    """Test permissions for deleting alerts"""
    # Test with admin user
    with patch("backend.modules.admin.monitoring_controller.get_current_admin") as mock_admin:
        mock_admin.return_value = ADMIN_USER
        
        # Call the endpoint
        result = await delete_alert("alert-id-1", current_admin=ADMIN_USER)
        
        # Verify the result
        assert result == {"success": True}
        
        # Verify service was called
        mock_monitoring_services["delete_alert"].assert_called_once()


@pytest.mark.asyncio
async def test_error_logs_access(mock_monitoring_services):
    """Test access control for error logs"""
    # Test with admin user
    with patch("backend.modules.admin.monitoring_controller.get_current_admin") as mock_admin:
        mock_admin.return_value = ADMIN_USER
        
        # Call the endpoint
        result = await get_error_logs(
            severity=None, 
            component=None,
            from_date=None,
            to_date=None,
            limit=100,
            offset=0,
            current_admin=ADMIN_USER
        )
        
        # Verify the result
        assert result == {"logs": MOCK_ERROR_LOGS, "total": len(MOCK_ERROR_LOGS)}
        
        # Verify service was called
        mock_monitoring_services["error_logs"].assert_called_once()


@pytest.mark.asyncio
async def test_metrics_access(mock_monitoring_services):
    """Test access control for metrics"""
    # Test with regular user
    with patch("backend.modules.admin.monitoring_controller.get_current_user") as mock_user:
        mock_user.return_value = REGULAR_USER
        
        # Call the endpoint
        result = await get_resource_metrics(
            resource_id="resource-id-1",
            metric_name="cpu",
            time_range="24h",
            current_user=REGULAR_USER
        )
        
        # Verify the result
        assert result == MOCK_METRICS
        
        # Verify service was called
        mock_monitoring_services["metrics"].assert_called_once()


@pytest.mark.asyncio
async def test_azure_config_access(mock_monitoring_services):
    """Test access control for Azure configuration"""
    # Test with admin user
    with patch("backend.modules.admin.monitoring_controller.get_current_admin") as mock_admin:
        mock_admin.return_value = ADMIN_USER
        
        # Call the endpoint
        result = await get_azure_config(current_admin=ADMIN_USER)
        
        # Verify the result
        assert result == MOCK_AZURE_CONFIG
        
        # Verify service was called
        mock_monitoring_services["config"].assert_called_once()


@pytest.mark.asyncio
async def test_update_azure_config_permissions(mock_monitoring_services):
    """Test permissions for updating Azure configuration"""
    # Test with admin user
    with patch("backend.modules.admin.monitoring_controller.get_current_admin") as mock_admin:
        mock_admin.return_value = ADMIN_USER
        
        # Update config data
        config_data = {
            "tenant_id": "updated-tenant",
            "subscription_id": "updated-subscription",
            "resource_group": "updated-resource-group"
        }
        
        # Call the endpoint
        result = await update_azure_config(config_data, current_admin=ADMIN_USER)
        
        # Verify the result
        assert result == MOCK_AZURE_CONFIG
        
        # Verify service was called with user ID
        mock_monitoring_services["update_config"].assert_called_once()
        assert mock_monitoring_services["update_config"].call_args[0][1] == ADMIN_USER["id"]