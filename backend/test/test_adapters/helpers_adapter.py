"""
Helpers Test Adapter

This module provides a test adapter for the helpers.py module.
"""

import logging
import time
from datetime import datetime
from typing import Dict, Any, List, Optional, Callable, Tuple
from unittest.mock import MagicMock, patch, Mock

from utils.helpers import (
    format_datetime, parse_datetime, filter_dict, safe_json,
    debug_log, performance_log, trace_data_changes,
    get_function_call_info, error_context
)
from .entity_registry import BaseTestAdapter, EntityAction


class HelpersTestAdapter(BaseTestAdapter):
    """
    Test adapter for helpers.py module.
    
    This adapter integrates with the entity registry and provides methods
    for testing helper functions.
    """
    
    def __init__(self, registry=None):
        """
        Initialize the HelpersTestAdapter.
        
        Args:
            registry: Entity registry for test synchronization
        """
        super().__init__(registry)
        self.mock_logger = None
        self.test_function_calls = []
        self.test_time_values = []
        self.original_time_time = None
    
    def setup_logging_mock(self) -> MagicMock:
        """
        Setup and return a mock logger for testing logging functions.
        
        Returns:
            Mock logger
        """
        self.mock_logger = MagicMock(spec=logging.Logger)
        return self.mock_logger
    
    def setup_time_mock(self, time_values: List[float] = None) -> None:
        """
        Setup a mock for time.time() to return predictable values.
        
        Args:
            time_values: Sequence of time values to return on successive calls
        """
        self.original_time_time = time.time
        self.test_time_values = time_values or [1.0, 2.0]  # Default: 1 second elapsed
        
        mock_time = MagicMock()
        mock_time.side_effect = self.test_time_values
        time.time = mock_time
    
    def teardown_time_mock(self) -> None:
        """Restore the original time.time function"""
        if self.original_time_time:
            time.time = self.original_time_time
            self.original_time_time = None
    
    def format_datetime(self, dt: datetime) -> str:
        """
        Test wrapper for format_datetime function.
        
        Args:
            dt: Datetime object to format
            
        Returns:
            Formatted datetime string
        """
        result = format_datetime(dt)
        
        # Register test data
        self._register_entity("TestDateTime", str(dt), {
            "datetime": dt,
            "formatted": result
        })
        
        return result
    
    def parse_datetime(self, dt_str: str) -> Optional[datetime]:
        """
        Test wrapper for parse_datetime function.
        
        Args:
            dt_str: Datetime string to parse
            
        Returns:
            Parsed datetime object or None
        """
        result = parse_datetime(dt_str)
        
        # Register test data
        self._register_entity("TestDateTimeStr", dt_str, {
            "string": dt_str,
            "parsed": result
        })
        
        return result
    
    def filter_dict(self, data: Dict[str, Any], keys: List[str]) -> Dict[str, Any]:
        """
        Test wrapper for filter_dict function.
        
        Args:
            data: Dictionary to filter
            keys: Keys to include
            
        Returns:
            Filtered dictionary
        """
        result = filter_dict(data, keys)
        
        # Register test data
        self._register_entity("TestDictFilter", str(keys), {
            "original": data,
            "keys": keys,
            "filtered": result
        })
        
        return result
    
    def safe_json(self, data: Any) -> str:
        """
        Test wrapper for safe_json function.
        
        Args:
            data: Data to convert to JSON
            
        Returns:
            JSON string
        """
        result = safe_json(data)
        
        # Register test data
        entity_id = f"json_{type(data).__name__}_{id(data)}"
        self._register_entity("TestJson", entity_id, {
            "data": str(data),
            "type": type(data).__name__,
            "result": result
        })
        
        return result
    
    def create_decorated_function(self, decorator: Callable, should_raise: bool = False) -> Tuple[Callable, str]:
        """
        Create a test function decorated with the specified decorator.
        
        Args:
            decorator: Decorator to apply
            should_raise: Whether the function should raise an exception
            
        Returns:
            Tuple of (decorated function, function name)
        """
        func_name = f"test_func_{len(self.test_function_calls)}"
        
        # Define a test function
        if should_raise:
            @decorator
            def test_func(*args, **kwargs):
                """Test function that raises an exception"""
                self.test_function_calls.append((func_name, args, kwargs))
                raise ValueError("Test exception")
        else:
            @decorator
            def test_func(*args, **kwargs):
                """Test function that returns a value"""
                self.test_function_calls.append((func_name, args, kwargs))
                return f"Result: {args}, {kwargs}"
        
        # Register function in entity registry
        self._register_entity("TestFunction", func_name, {
            "name": func_name,
            "decorator": decorator.__name__,
            "should_raise": should_raise
        })
        
        return test_func, func_name
    
    def test_debug_log(self, should_raise: bool = False, logger: MagicMock = None) -> Tuple[Any, List]:
        """
        Test the debug_log decorator.
        
        Args:
            should_raise: Whether the test function should raise an exception
            logger: Mock logger to use (uses setup_logging_mock if None)
            
        Returns:
            Tuple of (function result, log messages)
        """
        mock_logger = logger or self.setup_logging_mock()
        
        with patch('utils.helpers.logger', mock_logger):
            # Create and call a decorated test function
            test_func, func_name = self.create_decorated_function(debug_log, should_raise)
            
            try:
                result = test_func("arg1", "arg2", kwarg1="value1")
                exception = None
            except Exception as e:
                result = None
                exception = e
            
            # Extract log messages
            log_calls = []
            for name, args, kwargs in mock_logger.method_calls:
                if args:
                    log_calls.append((name, args[0]))
            
            # Register results
            self._register_entity("TestDebugLog", func_name, {
                "result": str(result),
                "exception": str(exception) if exception else None,
                "log_calls": log_calls
            })
            
            return result, log_calls
    
    def test_performance_log(self, should_raise: bool = False, logger: MagicMock = None, 
                           time_values: List[float] = None) -> Tuple[Any, List]:
        """
        Test the performance_log decorator.
        
        Args:
            should_raise: Whether the test function should raise an exception
            logger: Mock logger to use (uses setup_logging_mock if None)
            time_values: Sequence of time values to return (uses setup_time_mock default if None)
            
        Returns:
            Tuple of (function result, log messages)
        """
        import time
        
        mock_logger = logger or self.setup_logging_mock()
        self.setup_time_mock(time_values)
        
        try:
            with patch('utils.helpers.logger', mock_logger):
                # Create and call a decorated test function
                test_func, func_name = self.create_decorated_function(performance_log, should_raise)
                
                try:
                    result = test_func("perf_arg1", kwarg1="perf_value1")
                    exception = None
                except Exception as e:
                    result = None
                    exception = e
                
                # Extract log messages
                log_calls = []
                for name, args, kwargs in mock_logger.method_calls:
                    if args:
                        log_calls.append((name, args[0]))
                
                # Register results
                self._register_entity("TestPerformanceLog", func_name, {
                    "result": str(result),
                    "exception": str(exception) if exception else None,
                    "log_calls": log_calls,
                    "time_values": self.test_time_values
                })
                
                return result, log_calls
        finally:
            self.teardown_time_mock()
    
    def test_trace_data_changes(self, before: Any, after: Any, context: str = "Test Context",
                             logger: MagicMock = None) -> List:
        """
        Test the trace_data_changes function.
        
        Args:
            before: Data before changes
            after: Data after changes
            context: Description context
            logger: Mock logger to use (uses setup_logging_mock if None)
            
        Returns:
            List of log messages
        """
        mock_logger = logger or self.setup_logging_mock()
        
        with patch('utils.helpers.logger', mock_logger):
            # Call the function
            trace_data_changes(before, after, context)
            
            # Extract log messages
            log_calls = []
            for name, args, kwargs in mock_logger.method_calls:
                if args:
                    log_calls.append((name, args[0]))
            
            # Register results
            entity_id = f"trace_{id(before)}_{id(after)}"
            self._register_entity("TestTraceChanges", entity_id, {
                "before": str(before),
                "after": str(after),
                "context": context,
                "log_calls": log_calls
            })
            
            return log_calls
    
    def test_get_function_call_info(self) -> Dict[str, Any]:
        """
        Test the get_function_call_info function.
        
        Returns:
            Call information dictionary
        """
        # Define a wrapper function to get predictable call stack
        def wrapper_function():
            return get_function_call_info()
        
        # Call through the wrapper
        result = wrapper_function()
        
        # Register results
        self._register_entity("TestCallInfo", "call_info", {
            "result": result
        })
        
        return result
    
    def test_error_context(self, context_vars: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Test the error_context function.
        
        Args:
            context_vars: Context variables to pass to the function
            
        Returns:
            Error context dictionary
        """
        context_vars = context_vars or {"test_key": "test_value"}
        
        # Define a wrapper function to get predictable call stack
        def wrapper_function():
            return error_context(**context_vars)
        
        # Call through the wrapper
        result = wrapper_function()
        
        # Register results
        self._register_entity("TestErrorContext", "error_ctx", {
            "context_vars": context_vars,
            "result": result
        })
        
        return result
    
    def reset(self):
        """Reset the adapter to its initial state."""
        # Clear test data
        self.mock_logger = None
        self.test_function_calls = []
        self.teardown_time_mock()