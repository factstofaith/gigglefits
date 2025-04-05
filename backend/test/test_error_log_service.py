"""
Tests for error log service functions in the admin monitoring module.
"""

import pytest
import json
import asyncio
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

from fastapi import HTTPException
from backend.modules.admin.models import (
    ErrorLog,
    ErrorLogDetail,
    ErrorLogResponse,
    LogSeverity
)
from backend.modules.admin.monitoring_service import (
    get_error_logs,
    search_error_logs,
    get_error_log_detail,
    get_error_log_severity_levels,
    get_error_log_components,
    export_error_logs
)

# Test data
mock_logs = [
    ErrorLog(
        id="log-1",
        severity=LogSeverity.ERROR,
        component="backend",
        message="Database connection failed",
        timestamp=datetime.now(timezone.utc) - timedelta(hours=1)
    ),
    ErrorLog(
        id="log-2",
        severity=LogSeverity.WARNING,
        component="frontend",
        message="API request timed out",
        timestamp=datetime.now(timezone.utc) - timedelta(hours=2)
    ),
    ErrorLog(
        id="log-3",
        severity=LogSeverity.CRITICAL,
        component="database",
        message="Out of memory error",
        timestamp=datetime.now(timezone.utc) - timedelta(hours=3)
    ),
]

@pytest.mark.asyncio
async def test_get_error_logs_default_params():
    """Test get_error_logs with default parameters."""
    
    # Create mock response
    expected_response = ErrorLogResponse(
        logs=mock_logs,
        total=len(mock_logs),
        page=0,
        page_size=10
    )
    
    # Call the function
    response = await get_error_logs()
    
    # Assert response structure
    assert isinstance(response, ErrorLogResponse)
    assert len(response.logs) > 0
    assert response.total > 0
    assert response.page == 0
    assert response.page_size == 10
    
    # Check log entry fields
    log = response.logs[0]
    assert isinstance(log, ErrorLog)
    assert hasattr(log, 'id')
    assert hasattr(log, 'severity')
    assert hasattr(log, 'component')
    assert hasattr(log, 'message')
    assert hasattr(log, 'timestamp')

@pytest.mark.asyncio
async def test_get_error_logs_with_filters():
    """Test get_error_logs with various filters."""
    
    # Test with severity filter
    severity_response = await get_error_logs(severity=LogSeverity.ERROR)
    assert all(log.severity == LogSeverity.ERROR for log in severity_response.logs)
    
    # Test with component filter
    component_response = await get_error_logs(component="backend")
    assert all(log.component == "backend" for log in component_response.logs)
    
    # Test with date range filter
    start_date = datetime.now(timezone.utc) - timedelta(days=1)
    end_date = datetime.now(timezone.utc)
    date_response = await get_error_logs(start_date=start_date, end_date=end_date)
    assert all(start_date <= log.timestamp <= end_date for log in date_response.logs)
    
    # Test with pagination
    skip = 5
    limit = 3
    pagination_response = await get_error_logs(skip=skip, limit=limit)
    assert len(pagination_response.logs) <= limit
    assert pagination_response.page == skip // limit if limit > 0 else 0

@pytest.mark.asyncio
async def test_search_error_logs():
    """Test search_error_logs functionality."""
    
    # Test with search query
    query = "error"
    search_response = await search_error_logs(query=query)
    
    # Check that response has expected structure
    assert isinstance(search_response, ErrorLogResponse)
    assert len(search_response.logs) >= 0
    
    # Check that all results contain the query string
    assert all(
        query.lower() in log.message.lower() or 
        query.lower() in log.component.lower() or
        query.lower() in log.id.lower()
        for log in search_response.logs
    )
    
    # Test with combined filters
    combined_response = await search_error_logs(
        query=query,
        severity=LogSeverity.ERROR,
        component="backend"
    )
    
    # Check that filtered results meet all criteria
    for log in combined_response.logs:
        assert query.lower() in log.message.lower() or query.lower() in log.component.lower() or query.lower() in log.id.lower()
        assert log.severity == LogSeverity.ERROR
        assert log.component == "backend"

@pytest.mark.asyncio
async def test_get_error_log_detail():
    """Test get_error_log_detail functionality."""
    
    # Test with valid log ID
    log_id = "log-1"
    log_detail = await get_error_log_detail(log_id)
    
    # Check that detail has expected structure
    assert isinstance(log_detail, ErrorLogDetail)
    assert log_detail.id == log_id
    
    # Check for extended fields
    assert hasattr(log_detail, 'stack_trace')
    assert hasattr(log_detail, 'context')
    assert hasattr(log_detail, 'additional_data')
    
    # Test with invalid log ID
    invalid_log_id = "non-existent-log"
    invalid_log_detail = await get_error_log_detail(invalid_log_id)
    assert invalid_log_detail is None

@pytest.mark.asyncio
async def test_get_error_log_severity_levels():
    """Test get_error_log_severity_levels functionality."""
    
    severity_levels = await get_error_log_severity_levels()
    
    # Check that severity levels are returned as a list
    assert isinstance(severity_levels, list)
    assert len(severity_levels) > 0
    
    # Check that all LogSeverity enum values are included
    for level in LogSeverity.__members__.values():
        assert level in severity_levels

@pytest.mark.asyncio
async def test_get_error_log_components():
    """Test get_error_log_components functionality."""
    
    components = await get_error_log_components()
    
    # Check that components are returned as a list
    assert isinstance(components, list)
    assert len(components) > 0
    
    # Check some expected common components
    common_components = ["frontend", "backend", "api"]
    for component in common_components:
        assert component in components

@pytest.mark.asyncio
async def test_export_error_logs_csv():
    """Test export_error_logs functionality for CSV format."""
    
    # Test CSV export
    csv_result = await export_error_logs(format="csv")
    
    # Check that result is a string
    assert isinstance(csv_result, str)
    
    # Check CSV structure
    lines = csv_result.strip().split('\n')
    assert lines[0] == "id,severity,component,message,timestamp"
    assert len(lines) > 1  # Header + at least one data row
    
    # Check that a data row has the expected number of columns
    data_row = lines[1].split(',')
    assert len(data_row) >= 5  # At least 5 columns (id, severity, component, message, timestamp)

@pytest.mark.asyncio
async def test_export_error_logs_json():
    """Test export_error_logs functionality for JSON format."""
    
    # Test JSON export
    json_result = await export_error_logs(format="json")
    
    # Check that result is a string
    assert isinstance(json_result, str)
    
    # Check that it's valid JSON
    log_objects = json.loads(json_result)
    
    # Check that it's a list of log objects
    assert isinstance(log_objects, list)
    assert len(log_objects) > 0
    
    # Check log object structure
    log = log_objects[0]
    assert "id" in log
    assert "severity" in log
    assert "component" in log
    assert "message" in log
    assert "timestamp" in log

@pytest.mark.asyncio
async def test_export_error_logs_with_filters():
    """Test export_error_logs functionality with filters."""
    
    # Test export with filters
    filtered_csv = await export_error_logs(
        format="csv",
        severity=LogSeverity.ERROR,
        component="backend",
        search="database"
    )
    
    # Check that result is a string
    assert isinstance(filtered_csv, str)
    
    # Check that it has the header row
    assert filtered_csv.startswith("id,severity,component,message,timestamp")

@pytest.mark.asyncio
async def test_export_error_logs_invalid_format():
    """Test export_error_logs with invalid format."""
    
    # Test with invalid format
    with pytest.raises(HTTPException) as excinfo:
        await export_error_logs(format="invalid")
    
    # Check exception details
    assert excinfo.value.status_code == 400
    assert "Format must be 'csv' or 'json'" in excinfo.value.detail