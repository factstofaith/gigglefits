"""
Helper functions for the application.

This module provides utility functions for common operations in the application,
including date/time handling, dictionary manipulation, JSON serialization,
debugging, performance monitoring, and error context tracking.

Usage:
    from backend.utils.helpers import format_datetime, parse_datetime, debug_log, performance_log

    # Format datetime to ISO
    iso_str = format_datetime(datetime.now())
    
    # Parse ISO datetime string
    dt = parse_datetime("2023-01-01T12:30:45")
    
    # Debugging decorator
    @debug_log
    def my_function(arg1, arg2):
        pass
        
    # Performance monitoring
    @performance_log
    def expensive_operation():
        pass
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Callable, Union, Type, TypeVar, cast
import json
import logging
import traceback
import functools
import inspect
import time


# Setup module logger
logger = logging.getLogger(__name__)

# Type variables for better type hinting
T = TypeVar('T')
R = TypeVar('R')


def format_datetime(dt: datetime) -> str:
    """
    Format a datetime object to ISO format with timezone information.
    
    Args:
        dt (datetime): The datetime object to format
        
    Returns:
        str: ISO formatted datetime string
        
    Raises:
        TypeError: If dt is not a datetime object
    """
    if not isinstance(dt, datetime):
        raise TypeError("Input must be a datetime object")
        
    # Ensure timezone information is present
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
        
    return dt.isoformat()


def parse_datetime(dt_str: str) -> Optional[datetime]:
    """
    Parse a datetime string from ISO format.
    
    Args:
        dt_str (str): ISO formatted datetime string
        
    Returns:
        Optional[datetime]: Parsed datetime object or None if parsing fails
        
    Examples:
        >>> parse_datetime("2023-01-01T12:30:45")
        datetime.datetime(2023, 1, 1, 12, 30, 45)
        >>> parse_datetime("invalid")
        None
    """
    if not dt_str or not isinstance(dt_str, str):
        logger.debug(f"Invalid datetime string provided: {dt_str}")
        return None
        
    try:
        return datetime.fromisoformat(dt_str)
    except (ValueError, TypeError) as e:
        logger.debug(f"Failed to parse datetime string '{dt_str}': {str(e)}")
        return None


def filter_dict(data: Dict[str, Any], keys: List[str]) -> Dict[str, Any]:
    """
    Filter a dictionary to include only specified keys.
    
    Args:
        data (Dict[str, Any]): The dictionary to filter
        keys (List[str]): List of keys to include in the result
        
    Returns:
        Dict[str, Any]: Filtered dictionary containing only specified keys
        
    Examples:
        >>> filter_dict({'a': 1, 'b': 2, 'c': 3}, ['a', 'c'])
        {'a': 1, 'c': 3}
        >>> filter_dict({'a': 1}, ['b'])
        {}
    """
    if not isinstance(data, dict):
        logger.warning(f"filter_dict called with non-dict data: {type(data)}")
        return {}
        
    if not isinstance(keys, list):
        logger.warning(f"filter_dict called with non-list keys: {type(keys)}")
        return {}
        
    return {k: v for k, v in data.items() if k in keys}


def safe_json(data: Any) -> str:
    """
    Convert data to JSON with robust error handling for non-serializable types.
    
    Args:
        data (Any): The data to convert to JSON
        
    Returns:
        str: JSON string representation of the data
        
    Examples:
        >>> safe_json({'a': 1})
        '{"a": 1}'
        >>> safe_json({'a': datetime(2023, 1, 1)})  # Non-serializable type
        '{"a": "2023-01-01 00:00:00"}'
    """
    try:
        return json.dumps(data)
    except (TypeError, ValueError) as e:
        logger.debug(f"JSON serialization error: {str(e)}, converting to strings")
        
        # Convert values that can't be JSON serialized to strings
        if isinstance(data, dict):
            return json.dumps({k: str(v) for k, v in data.items()})
        elif isinstance(data, list):
            return json.dumps([str(item) for item in data])
        else:
            return json.dumps(str(data))


# Debug Utilities

def debug_log(func: Callable[[Any], R]) -> Callable[[Any], R]:
    """
    Decorator to log function entry, exit, args, and return values for debugging.
    
    This decorator provides detailed logging of function calls, including:
    - Function entry with all arguments
    - Function exit with return value
    - Exception details if the function raises
    - Execution time measurements
    
    Args:
        func (Callable): The function to decorate
        
    Returns:
        Callable: The decorated function with logging added
        
    Usage:
        @debug_log
        def my_function(arg1, arg2):
            # function implementation
    """
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> R:
        func_name = func.__name__
        module_name = func.__module__
        operation_id = f"{func_name}_{int(time.time() * 1000)}"
        
        # Log function entry with arguments
        arg_str = ", ".join([repr(a) for a in args])
        kwarg_str = ", ".join([f"{k}={repr(v)}" for k, v in kwargs.items()])
        params = f"{arg_str}{', ' if arg_str and kwarg_str else ''}{kwarg_str}"
        
        logger.debug(f"[{operation_id}] ENTER {module_name}.{func_name}({params})")
        
        start_time = time.time()
        try:
            # Execute the function
            result = func(*args, **kwargs)
            
            # Log function exit with return value
            elapsed = time.time() - start_time
            elapsed_ms = int(elapsed * 1000)
            
            # Truncate very long results in log message
            result_repr = repr(result)
            if len(result_repr) > 1000:
                result_repr = f"{result_repr[:997]}..."
                
            logger.debug(f"[{operation_id}] EXIT  {module_name}.{func_name} -> {result_repr} (took {elapsed:.4f}s / {elapsed_ms}ms)")
            
            return result
        except Exception as e:
            # Log exceptions
            elapsed = time.time() - start_time
            elapsed_ms = int(elapsed * 1000)
            
            logger.error(f"[{operation_id}] ERROR {module_name}.{func_name} -> {type(e).__name__}: {str(e)} (took {elapsed:.4f}s / {elapsed_ms}ms)")
            logger.error(traceback.format_exc())
            raise
    
    return cast(Callable[[Any], R], wrapper)


def performance_log(threshold_ms: int = 1000) -> Callable[[Callable[..., R]], Callable[..., R]]:
    """
    Decorator to log function execution time for performance monitoring.
    
    Args:
        threshold_ms (int, optional): Threshold in milliseconds to log warnings. Defaults to 1000.
        
    Returns:
        Callable: A decorator that adds performance logging
        
    Usage:
        @performance_log()
        def my_function(arg1, arg2):
            # function implementation
            
        @performance_log(threshold_ms=500)
        def time_sensitive_function():
            # function implementation
    """
    def decorator(func: Callable[..., R]) -> Callable[..., R]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> R:
            func_name = func.__name__
            module_name = func.__module__
            operation_id = f"{func_name}_{int(time.time() * 1000)}"
            
            start_time = time.time()
            try:
                # Execute the function
                result = func(*args, **kwargs)
                
                # Log execution time
                elapsed = time.time() - start_time
                elapsed_ms = int(elapsed * 1000)
                
                logger.info(f"[{operation_id}] PERF  {module_name}.{func_name} took {elapsed:.4f}s / {elapsed_ms}ms")
                
                # Log warning for slow functions
                if elapsed_ms > threshold_ms:
                    logger.warning(f"[{operation_id}] SLOW  {module_name}.{func_name} took {elapsed:.4f}s / {elapsed_ms}ms (threshold: {threshold_ms}ms)")
                
                return result
            except Exception as e:
                # Log exceptions with execution time
                elapsed = time.time() - start_time
                elapsed_ms = int(elapsed * 1000)
                
                logger.error(f"[{operation_id}] ERROR {module_name}.{func_name} -> {type(e).__name__}: {str(e)} (took {elapsed:.4f}s / {elapsed_ms}ms)")
                raise
        
        return cast(Callable[..., R], wrapper)
    
    # Support using the decorator with or without arguments
    if callable(threshold_ms):
        func = threshold_ms
        threshold_ms = 1000
        return decorator(func)
    
    return decorator


def trace_data_changes(data_before: Any, data_after: Any, context: str = "Data Change", 
                       max_changes: int = 20, max_value_length: int = 100) -> Dict[str, Any]:
    """
    Log and track changes between two data objects.
    
    This function analyzes changes between data objects and provides a detailed
    report of what changed. It supports dictionaries, lists, and other data types.
    
    Args:
        data_before (Any): Data before changes
        data_after (Any): Data after changes
        context (str, optional): Description of what's being compared. Defaults to "Data Change".
        max_changes (int, optional): Maximum number of changes to log. Defaults to 20.
        max_value_length (int, optional): Maximum length of values in log output. Defaults to 100.
        
    Returns:
        Dict[str, Any]: Change information including total changes, added, removed, and modified fields
        
    Examples:
        >>> trace_data_changes({'a': 1, 'b': 2}, {'a': 1, 'c': 3})
        {'total_changes': 2, 'added': ['c'], 'removed': ['b'], 'modified': []}
    """
    change_info = {
        'total_changes': 0,
        'added': [],
        'removed': [],
        'modified': []
    }
    
    def truncate_value(value: Any) -> str:
        """Truncate long string representations for logging"""
        value_str = str(value)
        if len(value_str) > max_value_length:
            return f"{value_str[:max_value_length-3]}..."
        return value_str
    
    if isinstance(data_before, dict) and isinstance(data_after, dict):
        # Compare two dictionaries
        all_keys = set(data_before.keys()) | set(data_after.keys())
        changes = []
        
        for key in all_keys:
            if key not in data_before:
                changes.append(f"+ {key}: {truncate_value(data_after[key])}")
                change_info['added'].append(key)
                change_info['total_changes'] += 1
            elif key not in data_after:
                changes.append(f"- {key}: {truncate_value(data_before[key])}")
                change_info['removed'].append(key)
                change_info['total_changes'] += 1
            elif data_before[key] != data_after[key]:
                changes.append(f"~ {key}: {truncate_value(data_before[key])} -> {truncate_value(data_after[key])}")
                change_info['modified'].append(key)
                change_info['total_changes'] += 1
        
        if changes:
            # Limit the number of changes in log output to prevent oversized logs
            log_changes = changes[:max_changes]
            if len(changes) > max_changes:
                log_changes.append(f"... and {len(changes) - max_changes} more changes")
                
            logger.debug(f"{context} Changes: {', '.join(log_changes)}")
            
    elif isinstance(data_before, list) and isinstance(data_after, list):
        # Log basic info about list changes
        len_before = len(data_before)
        len_after = len(data_after)
        change_info['total_changes'] = abs(len_after - len_before)
        
        if len_before < len_after:
            change_info['added'] = [f"item_{i}" for i in range(len_after - len_before)]
        elif len_before > len_after:
            change_info['removed'] = [f"item_{i}" for i in range(len_before - len_after)]
            
        logger.debug(f"{context} Changes: List size {len_before} -> {len_after}")
        
    else:
        # Log simple before/after for other types
        if data_before != data_after:
            change_info['total_changes'] = 1
            change_info['modified'] = ['value']
            
            logger.debug(f"{context} Changes: {truncate_value(data_before)} -> {truncate_value(data_after)}")
    
    return change_info


def get_function_call_info() -> Dict[str, Any]:
    """
    Get detailed information about the current function call and its caller.
    
    This function analyzes the call stack to provide context about where it was
    called from, including filename, line number, function and module names.
    
    Returns:
        Dict[str, Any]: Dictionary with detailed call information
    
    Example:
        >>> info = get_function_call_info()
        >>> print(f"Called from {info['module']}.{info['function']}")
        Called from my_module.my_function
    """
    try:
        stack = inspect.stack()
        # Get information about the current function (index 1, as 0 is get_function_call_info itself)
        current_frame = stack[1]
        # Get information about the caller
        caller_frame = stack[2] if len(stack) > 2 else None
        
        # Get module object and name safely
        current_module = inspect.getmodule(current_frame[0])
        current_module_name = current_module.__name__ if current_module else "unknown_module"
        
        result = {
            "function": current_frame.function,
            "filename": current_frame.filename,
            "lineno": current_frame.lineno,
            "module": current_module_name,
            "code_context": current_frame.code_context[0].strip() if current_frame.code_context else None,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        if caller_frame:
            caller_module = inspect.getmodule(caller_frame[0])
            caller_module_name = caller_module.__name__ if caller_module else "unknown_module"
            
            result["caller"] = {
                "function": caller_frame.function,
                "filename": caller_frame.filename,
                "lineno": caller_frame.lineno,
                "module": caller_module_name,
                "code_context": caller_frame.code_context[0].strip() if caller_frame.code_context else None
            }
        
        return result
    except Exception as e:
        logger.warning(f"Error getting function call info: {str(e)}")
        return {
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


def error_context(**context_vars: Any) -> Dict[str, Any]:
    """
    Create an error context dictionary with rich diagnostic information.
    
    This function captures detailed execution context information for error logging,
    including function call details, timestamp, and any additional context variables.
    
    Args:
        **context_vars: Additional key-value pairs to include in the context
        
    Returns:
        Dict[str, Any]: Error context dictionary with all contextual information
        
    Usage:
        try:
            do_something_risky()
        except Exception as e:
            logger.error(f"Error: {e}", extra=error_context(user_id=user.id, action="update"))
    """
    try:
        # Get the call stack information
        call_info = get_function_call_info()
        
        # Merge with the provided context variables
        context = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "function": call_info.get("function", "unknown"),
            "module": call_info.get("module", "unknown"),
            "line": call_info.get("lineno", -1),
            "context": call_info.get("code_context")
        }
        
        if "caller" in call_info:
            context["caller_function"] = call_info["caller"].get("function", "unknown")
            context["caller_module"] = call_info["caller"].get("module", "unknown")
            context["caller_line"] = call_info["caller"].get("lineno", -1)
            context["caller_context"] = call_info["caller"].get("code_context")
        
        # Add the user-provided context variables
        context.update(context_vars)
        
        return context
    except Exception as e:
        # Fallback context if an error occurs building the context
        logger.warning(f"Error creating error context: {str(e)}")
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error_in_context": str(e),
            **context_vars
        }


def generate_uid() -> str:
    """
    Generate a unique identifier string.
    
    Returns:
        str: A unique identifier string (UUID format)
    
    Examples:
        >>> generate_uid()
        '550e8400-e29b-41d4-a716-446655440000'
    """
    import uuid
    return str(uuid.uuid4())