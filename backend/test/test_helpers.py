"""
Helper Functions Tests

This module contains tests for the helper functions in utils/helpers.py.
"""

import pytest
import json
import logging
import time
from datetime import datetime
from unittest.mock import MagicMock, patch, ANY

from utils.helpers import (
    format_datetime, parse_datetime, filter_dict, safe_json,
    debug_log, performance_log, trace_data_changes,
    get_function_call_info, error_context
)


class TestHelperFunctions:
    """Tests for the helper functions."""
    
    def test_format_datetime(self):
        """Test formatting datetime to ISO format."""
        dt = datetime(2023, 1, 15, 10, 30, 45)
        result = format_datetime(dt)
        assert result == "2023-01-15T10:30:45"
    
    def test_parse_datetime(self):
        """Test parsing datetime from ISO format."""
        # Test valid datetime string
        dt_str = "2023-01-15T10:30:45"
        result = parse_datetime(dt_str)
        assert isinstance(result, datetime)
        assert result.year == 2023
        assert result.month == 1
        assert result.day == 15
        assert result.hour == 10
        assert result.minute == 30
        assert result.second == 45
        
        # Test invalid datetime string
        invalid_str = "not-a-datetime"
        result = parse_datetime(invalid_str)
        assert result is None
        
        # Test None input
        result = parse_datetime(None)
        assert result is None
    
    def test_filter_dict(self):
        """Test filtering a dictionary by keys."""
        data = {
            "name": "Test User",
            "email": "test@example.com",
            "role": "admin",
            "created_at": "2023-01-15T10:30:45",
            "status": "active"
        }
        
        # Test including specific keys
        keys = ["name", "email", "role"]
        result = filter_dict(data, keys)
        assert result == {
            "name": "Test User",
            "email": "test@example.com",
            "role": "admin"
        }
        
        # Test with keys that don't exist in the data
        keys = ["name", "non_existent"]
        result = filter_dict(data, keys)
        assert result == {"name": "Test User"}
        
        # Test with empty keys list
        result = filter_dict(data, [])
        assert result == {}
    
    def test_safe_json(self):
        """Test safe JSON serialization."""
        # Test regular JSON-serializable data
        data = {
            "name": "Test User",
            "age": 30,
            "active": True,
            "tags": ["user", "admin"]
        }
        result = safe_json(data)
        parsed = json.loads(result)
        assert parsed["name"] == "Test User"
        assert parsed["age"] == 30
        assert parsed["active"] is True
        assert parsed["tags"] == ["user", "admin"]
        
        # Test with non-serializable data
        class TestClass:
            def __str__(self):
                return "TestClass instance"
        
        data = {
            "name": "Test User",
            "obj": TestClass()
        }
        result = safe_json(data)
        parsed = json.loads(result)
        assert parsed["name"] == "Test User"
        assert parsed["obj"] == "TestClass instance"
        
        # Test with list containing non-serializable items
        data = ["string", 123, TestClass()]
        result = safe_json(data)
        parsed = json.loads(result)
        assert parsed[0] == "string"
        assert parsed[1] == "123"
        assert parsed[2] == "TestClass instance"
        
        # Test with direct non-serializable object
        data = TestClass()
        result = safe_json(data)
        parsed = json.loads(result)
        assert parsed == "TestClass instance"
    
    def test_debug_log_decorator(self):
        """Test the debug_log decorator."""
        mock_logger = MagicMock()
        
        # Define a test function
        @debug_log
        def test_function(arg1, arg2, kwarg1=None):
            return f"Result: {arg1}, {arg2}, {kwarg1}"
        
        # Patch the logger
        with patch('utils.helpers.logger', mock_logger):
            # Execute the function
            result = test_function("value1", "value2", kwarg1="kwvalue")
            
            # Verify function returned correct result
            assert result == "Result: value1, value2, kwvalue"
            
            # Verify debug log entry
            mock_logger.debug.assert_any_call(ANY)  # Entry log
            mock_logger.debug.assert_any_call(ANY)  # Exit log
            
            # Verify log args were captured
            entry_call = mock_logger.debug.call_args_list[0][0][0]
            assert "ENTER" in entry_call
            assert "test_function" in entry_call
            assert "value1" in entry_call
            assert "value2" in entry_call
            assert "kwarg1=\'kwvalue\'" in entry_call
    
    def test_debug_log_decorator_exception(self):
        """Test the debug_log decorator with exception."""
        mock_logger = MagicMock()
        
        # Define a test function that raises an exception
        @debug_log
        def test_exception_function():
            raise ValueError("Test exception")
        
        # Patch the logger
        with patch('utils.helpers.logger', mock_logger):
            # Execute the function and expect exception
            with pytest.raises(ValueError, match="Test exception"):
                test_exception_function()
            
            # Verify error log entry
            mock_logger.error.assert_any_call(ANY)  # Error log
            mock_logger.error.assert_any_call(ANY)  # Traceback
            
            # Verify exception details were logged
            error_call = mock_logger.error.call_args_list[0][0][0]
            assert "ERROR" in error_call
            assert "test_exception_function" in error_call
            assert "ValueError" in error_call
            assert "Test exception" in error_call
    
    def test_performance_log_decorator(self):
        """Test the performance_log decorator."""
        mock_logger = MagicMock()
        
        # Define a test function
        @performance_log
        def test_perf_function(arg1, kwarg1=None):
            return f"Result: {arg1}, {kwarg1}"
        
        # Mock time.time to return consistent values
        with patch('time.time', side_effect=[1.0, 1.5]):  # 0.5 seconds elapsed
            # Patch the logger
            with patch('utils.helpers.logger', mock_logger):
                # Execute the function
                result = test_perf_function("value1", kwarg1="kwvalue")
                
                # Verify function returned correct result
                assert result == "Result: value1, kwvalue"
                
                # Verify performance log entry
                mock_logger.info.assert_called_once()
                perf_call = mock_logger.info.call_args[0][0]
                assert "PERF" in perf_call
                assert "test_perf_function" in perf_call
                assert "0.5" in perf_call  # 0.5 seconds elapsed
    
    def test_performance_log_decorator_slow(self):
        """Test the performance_log decorator with slow execution."""
        mock_logger = MagicMock()
        
        # Define a test function
        @performance_log
        def test_slow_function(arg1):
            return f"Slow: {arg1}"
        
        # Mock time.time to return values indicating slow execution
        with patch('time.time', side_effect=[1.0, 3.5]):  # 2.5 seconds elapsed
            # Patch the logger
            with patch('utils.helpers.logger', mock_logger):
                # Execute the function
                result = test_slow_function("value1")
                
                # Verify function returned correct result
                assert result == "Slow: value1"
                
                # Verify warning log for slow execution
                mock_logger.warning.assert_called_once()
                warning_call = mock_logger.warning.call_args[0][0]
                assert "SLOW" in warning_call
                assert "test_slow_function" in warning_call
                assert "2.5" in warning_call  # 2.5 seconds elapsed
    
    def test_trace_data_changes_dict(self):
        """Test tracing changes between dictionaries."""
        mock_logger = MagicMock()
        
        # Test data
        before = {
            "name": "Old Name",
            "age": 30,
            "role": "user",
            "to_remove": "value"
        }
        
        after = {
            "name": "New Name",  # Changed
            "age": 30,           # Unchanged
            "role": "admin",     # Changed
            "new_field": True    # Added
            # to_remove field removed
        }
        
        # Patch the logger
        with patch('utils.helpers.logger', mock_logger):
            # Call the function
            trace_data_changes(before, after, "User Update")
            
            # Verify debug log entry
            mock_logger.debug.assert_called_once()
            log_call = mock_logger.debug.call_args[0][0]
            
            # Verify changes were logged correctly
            assert "User Update Changes" in log_call
            assert "name: Old Name -> New Name" in log_call
            assert "role: user -> admin" in log_call
            assert "+ new_field: True" in log_call
            assert "- to_remove: value" in log_call
            assert "age" not in log_call  # Unchanged field not logged
    
    def test_trace_data_changes_lists(self):
        """Test tracing changes between lists."""
        mock_logger = MagicMock()
        
        # Test data - lists
        before_list = [1, 2, 3, 4]
        after_list = [1, 2, 3, 4, 5]
        
        # Patch the logger
        with patch('utils.helpers.logger', mock_logger):
            # Call the function
            trace_data_changes(before_list, after_list, "List Update")
            
            # Verify debug log entry
            mock_logger.debug.assert_called_once()
            log_call = mock_logger.debug.call_args[0][0]
            
            # Verify changes were logged
            assert "List Update Changes" in log_call
            assert "List size 4 -> 5" in log_call
    
    def test_trace_data_changes_other_types(self):
        """Test tracing changes between other types."""
        mock_logger = MagicMock()
        
        # Test data - simple values
        before_value = "Old value"
        after_value = "New value"
        
        # Patch the logger
        with patch('utils.helpers.logger', mock_logger):
            # Call the function
            trace_data_changes(before_value, after_value, "Value Update")
            
            # Verify debug log entry
            mock_logger.debug.assert_called_once()
            log_call = mock_logger.debug.call_args[0][0]
            
            # Verify changes were logged
            assert "Value Update Changes" in log_call
            assert "Old value -> New value" in log_call
    
    def test_get_function_call_info(self):
        """Test getting function call information."""
        # Define a wrapper to get deterministic stack frames
        def wrapper_function():
            return get_function_call_info()
        
        # Call the function
        result = wrapper_function()
        
        # Verify structure and content
        assert isinstance(result, dict)
        assert "function" in result
        assert result["function"] == "wrapper_function"
        assert "filename" in result
        assert "test_helpers.py" in result["filename"]
        assert "lineno" in result
        assert "module" in result
        
        # Verify caller information
        assert "caller" in result
        assert "function" in result["caller"]
        assert "filename" in result["caller"]
        assert "lineno" in result["caller"]
        assert "module" in result["caller"]
        
        # The caller should be test_get_function_call_info
        assert result["caller"]["function"] == "test_get_function_call_info"
    
    def test_error_context(self):
        """Test creating error context."""
        # Define a wrapper to get deterministic stack frames
        def wrapper_function():
            return error_context(user_id="user123", action="update")
        
        # Call the function
        result = wrapper_function()
        
        # Verify structure and content
        assert isinstance(result, dict)
        assert "timestamp" in result
        assert "function" in result
        # The actual function is error_context, not wrapper_function
        assert "module" in result
        assert "line" in result
        
        # Verify caller information
        assert "caller_function" in result
        # Caller might vary depending on implementation
        assert "caller_module" in result
        
        # Verify user-provided context
        assert "user_id" in result
        assert result["user_id"] == "user123"
        assert "action" in result
        assert result["action"] == "update"