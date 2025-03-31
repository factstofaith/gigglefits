"""
Tests for the error log endpoints in the monitoring controller module.
"""

import pytest
import json
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock, AsyncMock

from fastapi import FastAPI
from fastapi.testclient import TestClient
from fastapi.responses import Response

from backend.modules.admin.models import (
    ErrorLog,
    ErrorLogDetail,
    ErrorLogResponse,
    LogSeverity
)
from backend.modules.admin.monitoring_controller import router as monitoring_router
from backend.modules.admin.monitoring_service import (
    get_error_logs,
    search_error_logs,
    get_error_log_detail,
    get_error_log_severity_levels,
    get_error_log_components,
    export_error_logs
)
from backend.db.models import User
from backend.modules.users.models import UserRole

# Create a test FastAPI application
app = FastAPI()
app.include_router(monitoring_router)

# Create a test client
client = TestClient(app)

# Mock the get_current_active_user dependency
async def mock_get_current_active_user():
    """Mock the get_current_active_user dependency for testing."""
    return User(
        id="test-user-id",
        username="test-admin",
        email="admin@test.com",
        role=UserRole.ADMIN,
        is_active=True
    )

# Override the dependency in the router
app.dependency_overrides = {
    "get_current_active_user": mock_get_current_active_user
}

# Test data
mock_logs = [
    ErrorLog(
        id="log-1",
        severity=LogSeverity.ERROR,
        component="backend",
        message="Database connection failed",
        timestamp=datetime.utcnow() - timedelta(hours=1)
    ),
    ErrorLog(
        id="log-2",
        severity=LogSeverity.WARNING,
        component="frontend",
        message="API request timed out",
        timestamp=datetime.utcnow() - timedelta(hours=2)
    ),
    ErrorLog(
        id="log-3",
        severity=LogSeverity.CRITICAL,
        component="database",
        message="Out of memory error",
        timestamp=datetime.utcnow() - timedelta(hours=3)
    ),
]

mock_log_response = ErrorLogResponse(
    logs=mock_logs,
    total=len(mock_logs),
    page=0,
    page_size=10
)

mock_log_detail = ErrorLogDetail(
    id="log-1",
    severity=LogSeverity.ERROR,
    component="backend",
    message="Database connection failed",
    timestamp=datetime.utcnow() - timedelta(hours=1),
    stack_trace="Error: Database connection failed\n  at connectToDatabase (database.js:42)",
    context={"request_id": "req-12345", "user_id": "user-67890"},
    additional_data={"attempted_fixes": ["retry", "fallback"]}
)

@pytest.mark.asyncio
@patch('backend.modules.admin.monitoring_service.get_error_logs')
async def test_get_error_logs_endpoint(mock_get_error_logs):
    """Test GET /error-logs endpoint."""
    
    # Mock the service function
    mock_get_error_logs.return_value = mock_log_response
    
    # Make the request
    response = client.get("/error-logs")
    
    # Check the response
    assert response.status_code == 200
    data = response.json()
    
    # Verify the structure
    assert "logs" in data
    assert "total" in data
    assert len(data["logs"]) == len(mock_logs)
    
    # Check that service was called with default parameters
    mock_get_error_logs.assert_called_once_with(skip=0, limit=10, severity=None, component=None, start_date=None, end_date=None)

@pytest.mark.asyncio
@patch('backend.modules.admin.monitoring_service.get_error_logs')
async def test_get_error_logs_endpoint_with_filters(mock_get_error_logs):
    """Test GET /error-logs endpoint with filters."""
    
    # Mock the service function
    mock_get_error_logs.return_value = mock_log_response
    
    # Make the request with query parameters
    response = client.get("/error-logs?skip=5&limit=20&severity=error&component=backend")
    
    # Check the response
    assert response.status_code == 200
    
    # Check that service was called with the right parameters
    mock_get_error_logs.assert_called_once()
    kwargs = mock_get_error_logs.call_args.kwargs
    assert kwargs["skip"] == 5
    assert kwargs["limit"] == 20
    assert kwargs["severity"] == "error"
    assert kwargs["component"] == "backend"

@pytest.mark.asyncio
@patch('backend.modules.admin.monitoring_service.search_error_logs')
async def test_search_error_logs_endpoint(mock_search_error_logs):
    """Test GET /error-logs/search endpoint."""
    
    # Mock the service function
    mock_search_error_logs.return_value = mock_log_response
    
    # Make the request
    response = client.get("/error-logs/search?query=database")
    
    # Check the response
    assert response.status_code == 200
    data = response.json()
    
    # Verify the structure
    assert "logs" in data
    assert "total" in data
    
    # Check that service was called with the right parameters
    mock_search_error_logs.assert_called_once()
    kwargs = mock_search_error_logs.call_args.kwargs
    assert kwargs["query"] == "database"

@pytest.mark.asyncio
@patch('backend.modules.admin.monitoring_service.get_error_log_detail')
async def test_get_error_log_detail_endpoint(mock_get_error_log_detail):
    """Test GET /error-logs/{log_id} endpoint."""
    
    # Mock the service function
    mock_get_error_log_detail.return_value = mock_log_detail
    
    # Make the request
    response = client.get("/error-logs/log-1")
    
    # Check the response
    assert response.status_code == 200
    data = response.json()
    
    # Verify the structure
    assert "id" in data
    assert "severity" in data
    assert "component" in data
    assert "message" in data
    assert "timestamp" in data
    assert "stack_trace" in data
    assert "context" in data
    
    # Check that the service was called with the right parameters
    mock_get_error_log_detail.assert_called_once_with("log-1")

@pytest.mark.asyncio
@patch('backend.modules.admin.monitoring_service.get_error_log_detail')
async def test_get_error_log_detail_endpoint_not_found(mock_get_error_log_detail):
    """Test GET /error-logs/{log_id} endpoint with non-existent log ID."""
    
    # Mock the service function to return None (log not found)
    mock_get_error_log_detail.return_value = None
    
    # Make the request
    response = client.get("/error-logs/non-existent-log")
    
    # Check the response
    assert response.status_code == 404
    data = response.json()
    
    # Verify the error message
    assert "detail" in data
    assert "not found" in data["detail"].lower()

@pytest.mark.asyncio
@patch('backend.modules.admin.monitoring_service.get_error_log_severity_levels')
async def test_get_error_log_severity_levels_endpoint(mock_get_severity_levels):
    """Test GET /error-logs/severity-levels endpoint."""
    
    # Mock the service function
    mock_get_severity_levels.return_value = list(LogSeverity.__members__.values())
    
    # Make the request
    response = client.get("/error-logs/severity-levels")
    
    # Check the response
    assert response.status_code == 200
    data = response.json()
    
    # Verify the structure
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Check that the service was called
    mock_get_severity_levels.assert_called_once()

@pytest.mark.asyncio
@patch('backend.modules.admin.monitoring_service.get_error_log_components')
async def test_get_error_log_components_endpoint(mock_get_components):
    """Test GET /error-logs/components endpoint."""
    
    # Mock the service function
    mock_get_components.return_value = ["frontend", "backend", "database", "api"]
    
    # Make the request
    response = client.get("/error-logs/components")
    
    # Check the response
    assert response.status_code == 200
    data = response.json()
    
    # Verify the structure
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Check that the service was called
    mock_get_components.assert_called_once()

@pytest.mark.asyncio
@patch('backend.modules.admin.monitoring_service.export_error_logs')
async def test_export_error_logs_csv_endpoint(mock_export_error_logs):
    """Test GET /error-logs/export endpoint for CSV format."""
    
    # Mock the service function
    csv_content = "id,severity,component,message,timestamp\nlog-1,error,backend,\"Database error\",2025-03-01T12:00:00.000Z"
    mock_export_error_logs.return_value = csv_content
    
    # Make the request
    response = client.get("/error-logs/export?format=csv")
    
    # Check the response
    assert response.status_code == 200
    assert response.content == csv_content.encode()
    
    # Check the Content-Type header
    assert response.headers["content-type"] == "text/csv"
    
    # Check the Content-Disposition header
    assert "attachment; filename=error_logs_export_" in response.headers["content-disposition"]
    assert ".csv" in response.headers["content-disposition"]
    
    # Check that the service was called with the right parameters
    mock_export_error_logs.assert_called_once()
    kwargs = mock_export_error_logs.call_args.kwargs
    assert kwargs["format"] == "csv"

@pytest.mark.asyncio
@patch('backend.modules.admin.monitoring_service.export_error_logs')
async def test_export_error_logs_json_endpoint(mock_export_error_logs):
    """Test GET /error-logs/export endpoint for JSON format."""
    
    # Mock the service function
    json_content = "[{\"id\":\"log-1\",\"severity\":\"error\",\"component\":\"backend\",\"message\":\"Database error\",\"timestamp\":\"2025-03-01T12:00:00.000Z\"}]"
    mock_export_error_logs.return_value = json_content
    
    # Make the request
    response = client.get("/error-logs/export?format=json")
    
    # Check the response
    assert response.status_code == 200
    assert response.content == json_content.encode()
    
    # Check the Content-Type header
    assert response.headers["content-type"] == "application/json"
    
    # Check the Content-Disposition header
    assert "attachment; filename=error_logs_export_" in response.headers["content-disposition"]
    assert ".json" in response.headers["content-disposition"]
    
    # Check that the service was called with the right parameters
    mock_export_error_logs.assert_called_once()
    kwargs = mock_export_error_logs.call_args.kwargs
    assert kwargs["format"] == "json"

@pytest.mark.asyncio
@patch('backend.modules.admin.monitoring_service.export_error_logs')
async def test_export_error_logs_with_filters(mock_export_error_logs):
    """Test GET /error-logs/export endpoint with filters."""
    
    # Mock the service function
    csv_content = "id,severity,component,message,timestamp\nlog-1,error,backend,\"Database error\",2025-03-01T12:00:00.000Z"
    mock_export_error_logs.return_value = csv_content
    
    # Make the request with filters
    response = client.get("/error-logs/export?format=csv&severity=error&component=backend&search=database")
    
    # Check the response
    assert response.status_code == 200
    
    # Check that the service was called with the right parameters
    mock_export_error_logs.assert_called_once()
    kwargs = mock_export_error_logs.call_args.kwargs
    assert kwargs["format"] == "csv"
    assert kwargs["severity"] == "error"
    assert kwargs["component"] == "backend"
    assert kwargs["search"] == "database"

@pytest.mark.asyncio
async def test_export_error_logs_invalid_format():
    """Test GET /error-logs/export endpoint with invalid format."""
    
    # Make the request with invalid format
    response = client.get("/error-logs/export?format=invalid")
    
    # Check the response
    assert response.status_code == 400
    data = response.json()
    
    # Verify the error message
    assert "detail" in data
    assert "format" in data["detail"].lower()
    assert "csv" in data["detail"].lower()
    assert "json" in data["detail"].lower()