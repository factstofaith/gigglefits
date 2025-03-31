"""
Helper Functions Optimized Tests

This module contains optimized tests for the helper functions in utils/helpers.py
using the adapter pattern.
"""

import pytest
import json
import logging
from datetime import datetime
from unittest.mock import MagicMock, patch, ANY

from utils.helpers import (
    format_datetime, parse_datetime, filter_dict, safe_json,
    debug_log, performance_log, trace_data_changes,
    get_function_call_info, error_context
)


class TestHelperFunctionsOptimized:
    """Optimized tests for the helper functions using the adapter pattern."""
    
    def test_format_datetime_with_adapter(self, helpers_adapter):
        """Test formatting datetime with the adapter."""
        # Test with a specific datetime
        dt = datetime(2023, 1, 15, 10, 30, 45)
        result = helpers_adapter.format_datetime(dt)
        
        # Verify result
        assert result == "2023-01-15T10:30:45"
        
        # Test with current datetime
        now = datetime.now()
        result = helpers_adapter.format_datetime(now)
        
        # Verify result format (exact value will vary)
        assert isinstance(result, str)
        assert "T" in result  # ISO format separator
        assert len(result) >= 19  # Minimum length for ISO format
    
    def test_parse_datetime_with_adapter(self, helpers_adapter):
        """Test parsing datetime with the adapter."""
        # Test with valid datetime strings
        valid_formats = [
            "2023-01-15T10:30:45",
            "2023-01-15T10:30:45.123456",
            "2023-01-15 10:30:45",  # Space instead of T
        ]
        
        for dt_str in valid_formats:
            result = helpers_adapter.parse_datetime(dt_str)
            assert isinstance(result, datetime)
            assert result.year == 2023
            assert result.month == 1
            assert result.day == 15
        
        # Test with invalid formats
        invalid_formats = [
            "not-a-datetime",
            "2023/01/15",
            "15-01-2023",
            "",
            None
        ]
        
        for dt_str in invalid_formats:
            result = helpers_adapter.parse_datetime(dt_str)
            assert result is None
    
    def test_filter_dict_with_adapter(self, helpers_adapter):
        """Test filtering dictionaries with the adapter."""
        # Test data dictionary
        data = {
            "id": 1,
            "name": "Test Item",
            "description": "Test description",
            "metadata": {
                "created": "2023-01-15",
                "updated": "2023-01-16"
            },
            "tags": ["test", "sample"],
            "status": "active",
            "price": 99.99
        }
        
        # Test cases with different key sets
        test_cases = [
            {
                "keys": ["id", "name", "status"],
                "expected": {"id": 1, "name": "Test Item", "status": "active"}
            },
            {
                "keys": ["name", "price"],
                "expected": {"name": "Test Item", "price": 99.99}
            },
            {
                "keys": ["non_existent"],
                "expected": {}
            },
            {
                "keys": [],
                "expected": {}
            }
        ]
        
        # Run test cases
        for case in test_cases:
            result = helpers_adapter.filter_dict(data, case["keys"])
            assert result == case["expected"]
    
    def test_safe_json_with_adapter(self, helpers_adapter):
        """Test safe JSON serialization with the adapter."""
        # Test with different data types
        test_cases = [
            # Regular JSON-serializable data
            {
                "data": {"name": "Test", "value": 123, "active": True},
                "expected_type": dict
            },
            # List data
            {
                "data": [1, "two", True, {"key": "value"}],
                "expected_type": list
            },
            # Simple scalar data
            {
                "data": 42,
                "expected_type": int
            },
            # Custom class that will be converted to string
            {
                "data": datetime(2023, 1, 15),
                "expected_type": str
            }
        ]
        
        # Run test cases
        for case in test_cases:
            result = helpers_adapter.safe_json(case["data"])
            # Result should be a JSON string
            assert isinstance(result, str)
            
            # Parse result back to Python
            parsed = json.loads(result)
            
            # Check type or conversion
            if case["expected_type"] in (dict, list):
                assert isinstance(parsed, case["expected_type"])
            elif case["expected_type"] == int:
                assert parsed == 42
            elif case["expected_type"] == str:
                assert isinstance(parsed, str)
    
    def test_debug_log_with_adapter(self, helpers_adapter):
        """Test debug log decorator with the adapter."""
        # Test normal execution
        result, log_calls = helpers_adapter.test_debug_log(should_raise=False)
        
        # Verify function executed successfully
        assert result is not None
        assert "Result" in result
        
        # Verify log messages
        assert len(log_calls) >= 2  # At least enter and exit logs
        
        # Check for expected log message content
        enter_log = log_calls[0][1]
        exit_log = log_calls[1][1]
        
        assert "ENTER" in enter_log
        assert "arg1" in enter_log
        assert "arg2" in enter_log
        assert "kwarg1" in enter_log
        
        assert "EXIT" in exit_log
        assert "Result" in exit_log
    
    def test_debug_log_exception_with_adapter(self, helpers_adapter):
        """Test debug log decorator with exception using the adapter."""
        # Test execution with exception
        result, log_calls = helpers_adapter.test_debug_log(should_raise=True)
        
        # Verify function did not complete
        assert result is None
        
        # Verify log messages
        assert len(log_calls) >= 2  # At least enter and error logs
        
        # Check for expected log message content
        enter_log = log_calls[0][1]
        error_log = log_calls[1][1]
        
        assert "ENTER" in enter_log
        assert "ERROR" in error_log
        assert "ValueError" in error_log
        assert "Test exception" in error_log
    
    def test_performance_log_with_adapter(self, helpers_adapter):
        """Test performance log decorator with the adapter."""
        # Test normal execution (not slow)
        result, log_calls = helpers_adapter.test_performance_log(
            should_raise=False,
            time_values=[1.0, 1.2]  # 0.2 seconds elapsed
        )
        
        # Verify function executed successfully
        assert result is not None
        assert "Result" in result
        
        # Verify log messages - should have info log but not warning
        info_logs = [call for call in log_calls if call[0] == "info"]
        warning_logs = [call for call in log_calls if call[0] == "warning"]
        
        assert len(info_logs) == 1
        assert "PERF" in info_logs[0][1]
        assert "0.2" in info_logs[0][1]  # 0.2 seconds elapsed
        
        assert len(warning_logs) == 0  # No warning for fast execution
    
    def test_performance_log_slow_with_adapter(self, helpers_adapter):
        """Test performance log decorator with slow execution using the adapter."""
        # Test slow execution (over 1 second)
        result, log_calls = helpers_adapter.test_performance_log(
            should_raise=False,
            time_values=[1.0, 3.5]  # 2.5 seconds elapsed
        )
        
        # Verify function executed successfully
        assert result is not None
        
        # Verify log messages - should have both info and warning logs
        info_logs = [call for call in log_calls if call[0] == "info"]
        warning_logs = [call for call in log_calls if call[0] == "warning"]
        
        assert len(info_logs) == 1
        assert "PERF" in info_logs[0][1]
        
        assert len(warning_logs) == 1
        assert "SLOW" in warning_logs[0][1]
        assert "2.5" in warning_logs[0][1]  # 2.5 seconds elapsed
    
    def test_performance_log_exception_with_adapter(self, helpers_adapter):
        """Test performance log decorator with exception using the adapter."""
        # Test execution with exception
        result, log_calls = helpers_adapter.test_performance_log(should_raise=True)
        
        # Verify function did not complete
        assert result is None
        
        # Verify log messages - should have error log
        error_logs = [call for call in log_calls if call[0] == "error"]
        
        assert len(error_logs) >= 1
        assert "ERROR" in error_logs[0][1]
        assert "ValueError" in error_logs[0][1]
        assert "Test exception" in error_logs[0][1]
    
    def test_trace_data_changes_dict_with_adapter(self, helpers_adapter):
        """Test tracing dictionary changes with the adapter."""
        # Test dictionaries with various change types
        before = {
            "id": 1,
            "name": "Original Name",
            "status": "draft",
            "remove_me": "old value",
            "unchanged": "same value"
        }
        
        after = {
            "id": 1,  # unchanged
            "name": "Updated Name",  # changed
            "status": "published",  # changed
            "new_field": True,  # added
            "unchanged": "same value"  # unchanged
            # remove_me is removed
        }
        
        # Trace changes
        log_calls = helpers_adapter.test_trace_data_changes(before, after, "Test Dict Changes")
        
        # Verify log messages
        assert len(log_calls) == 1
        log_message = log_calls[0][1]
        
        # Check all changes are logged
        assert "Test Dict Changes" in log_message
        assert "name: Original Name -> Updated Name" in log_message
        assert "status: draft -> published" in log_message
        assert "+ new_field: True" in log_message
        assert "- remove_me: old value" in log_message
        assert "unchanged" not in log_message  # Unchanged fields not logged
        assert "id" not in log_message  # Unchanged fields not logged
    
    def test_trace_data_changes_list_with_adapter(self, helpers_adapter):
        """Test tracing list changes with the adapter."""
        # Test lists with size changes
        before_list = [1, 2, 3]
        after_list = [1, 2, 3, 4, 5]
        
        # Trace changes
        log_calls = helpers_adapter.test_trace_data_changes(before_list, after_list, "List Size Change")
        
        # Verify log messages
        assert len(log_calls) == 1
        log_message = log_calls[0][1]
        
        # Check list size change is logged
        assert "List Size Change" in log_message
        assert "List size 3 -> 5" in log_message
    
    def test_trace_data_changes_scalar_with_adapter(self, helpers_adapter):
        """Test tracing scalar changes with the adapter."""
        # Test scalar value changes
        before_value = 42
        after_value = 100
        
        # Trace changes
        log_calls = helpers_adapter.test_trace_data_changes(before_value, after_value, "Number Change")
        
        # Verify log messages
        assert len(log_calls) == 1
        log_message = log_calls[0][1]
        
        # Check value change is logged
        assert "Number Change" in log_message
        assert "42 -> 100" in log_message
    
    def test_get_function_call_info_with_adapter(self, helpers_adapter):
        """Test getting function call info with the adapter."""
        # Get call info
        call_info = helpers_adapter.test_get_function_call_info()
        
        # Verify structure
        assert isinstance(call_info, dict)
        assert "function" in call_info
        assert "filename" in call_info
        assert "lineno" in call_info
        assert "module" in call_info
        
        # The function should be wrapper_function from the adapter
        assert call_info["function"] == "wrapper_function"
        
        # Verify caller info
        assert "caller" in call_info
        assert "function" in call_info["caller"]
        assert "filename" in call_info["caller"]
        assert "lineno" in call_info["caller"]
        assert "module" in call_info["caller"]
    
    def test_error_context_with_adapter(self, helpers_adapter):
        """Test creating error context with the adapter."""
        # Create context with custom variables
        context_vars = {
            "user_id": "user123",
            "action": "delete",
            "resource": "document",
            "resource_id": "doc456"
        }
        
        error_ctx = helpers_adapter.test_error_context(context_vars)
        
        # Verify structure
        assert isinstance(error_ctx, dict)
        assert "timestamp" in error_ctx
        assert "function" in error_ctx
        assert "module" in error_ctx
        assert "line" in error_ctx
        
        # Verify caller info
        assert "caller_function" in error_ctx
        assert "caller_module" in error_ctx
        
        # Verify custom context variables
        for key, value in context_vars.items():
            assert key in error_ctx
            assert error_ctx[key] == value
    
    def test_entity_registry_integration(self, helpers_adapter, entity_registry):
        """Test integration with entity registry."""
        # Create some test entities through the adapter
        helpers_adapter.format_datetime(datetime(2023, 1, 15))
        helpers_adapter.parse_datetime("2023-01-15T10:30:45")
        helpers_adapter.filter_dict({"a": 1, "b": 2}, ["a"])
        
        # Verify entities in the registry
        datetime_entities = entity_registry.get_entities_by_type("TestDateTime")
        assert len(datetime_entities) > 0
        
        datetime_str_entities = entity_registry.get_entities_by_type("TestDateTimeStr")
        assert len(datetime_str_entities) > 0
        
        dict_filter_entities = entity_registry.get_entities_by_type("TestDictFilter")
        assert len(dict_filter_entities) > 0
        
        # Check entity structure - dict_filter_entities is a dictionary, not a list
        for entity_id, dict_entity in dict_filter_entities.items():
            assert "original" in dict_entity
            assert "keys" in dict_entity
            assert "filtered" in dict_entity
            break  # Just check the first entity
    
    def test_adapter_reset(self, helpers_adapter):
        """Test adapter reset functionality."""
        # Create some test data
        helpers_adapter.format_datetime(datetime.now())
        helpers_adapter.test_debug_log()
        
        # Setup mock logger
        mock_logger = helpers_adapter.setup_logging_mock()
        assert helpers_adapter.mock_logger is not None
        
        # Reset the adapter
        helpers_adapter.reset()
        
        # Verify state is reset
        assert helpers_adapter.mock_logger is None
        assert helpers_adapter.test_function_calls == []
        assert helpers_adapter.test_time_values == []
        assert helpers_adapter.original_time_time is None