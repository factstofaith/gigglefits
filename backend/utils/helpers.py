"""
Helper functions for the application.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional, Callable
import json
import logging
import traceback
import functools
import inspect
import time


def format_datetime(dt: datetime) -> str:
    """Format a datetime object to ISO format"""
    return dt.isoformat()


def parse_datetime(dt_str: str) -> Optional[datetime]:
    """Parse a datetime string from ISO format"""
    try:
        return datetime.fromisoformat(dt_str)
    except (ValueError, TypeError):
        return None


def filter_dict(data: Dict[str, Any], keys: List[str]) -> Dict[str, Any]:
    """Filter a dictionary to include only specified keys"""
    return {k: v for k, v in data.items() if k in keys}


def safe_json(data: Any) -> str:
    """Convert data to JSON with error handling"""
    try:
        return json.dumps(data)
    except (TypeError, ValueError):
        # Convert values that can't be JSON serialized to strings
        if isinstance(data, dict):
            return json.dumps({k: str(v) for k, v in data.items()})
        elif isinstance(data, list):
            return json.dumps([str(item) for item in data])
        else:
            return json.dumps(str(data))


# Debug Utilities

logger = logging.getLogger(__name__)

def debug_log(func: Callable) -> Callable:
    """
    Decorator to log function entry, exit, args, and return values for debugging
    
    Usage:
        @debug_log
        def my_function(arg1, arg2):
            # function implementation
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        func_name = func.__name__
        module_name = func.__module__
        
        # Log function entry with arguments
        arg_str = ", ".join([repr(a) for a in args])
        kwarg_str = ", ".join([f"{k}={repr(v)}" for k, v in kwargs.items()])
        params = f"{arg_str}{', ' if arg_str and kwarg_str else ''}{kwarg_str}"
        
        logger.debug(f"ENTER {module_name}.{func_name}({params})")
        
        start_time = time.time()
        try:
            # Execute the function
            result = func(*args, **kwargs)
            
            # Log function exit with return value
            elapsed = time.time() - start_time
            logger.debug(f"EXIT  {module_name}.{func_name} -> {repr(result)} (took {elapsed:.4f}s)")
            
            return result
        except Exception as e:
            # Log exceptions
            elapsed = time.time() - start_time
            logger.error(f"ERROR {module_name}.{func_name} -> {type(e).__name__}: {str(e)} (took {elapsed:.4f}s)")
            logger.error(traceback.format_exc())
            raise
    
    return wrapper


def performance_log(func: Callable) -> Callable:
    """
    Decorator to log function execution time for performance monitoring
    
    Usage:
        @performance_log
        def my_function(arg1, arg2):
            # function implementation
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        func_name = func.__name__
        module_name = func.__module__
        
        start_time = time.time()
        try:
            # Execute the function
            result = func(*args, **kwargs)
            
            # Log execution time
            elapsed = time.time() - start_time
            logger.info(f"PERF  {module_name}.{func_name} took {elapsed:.4f}s")
            
            # Log warning for slow functions (over 1 second)
            if elapsed > 1.0:
                logger.warning(f"SLOW  {module_name}.{func_name} took {elapsed:.4f}s")
            
            return result
        except Exception as e:
            # Log exceptions with execution time
            elapsed = time.time() - start_time
            logger.error(f"ERROR {module_name}.{func_name} -> {type(e).__name__}: {str(e)} (took {elapsed:.4f}s)")
            raise
    
    return wrapper


def trace_data_changes(data_before: Any, data_after: Any, context: str = "Data Change") -> None:
    """
    Log changes between two data objects
    
    Args:
        data_before: Data before changes
        data_after: Data after changes
        context: Description of what's being compared
    """
    if isinstance(data_before, dict) and isinstance(data_after, dict):
        # Compare two dictionaries
        all_keys = set(data_before.keys()) | set(data_after.keys())
        changes = []
        
        for key in all_keys:
            if key not in data_before:
                changes.append(f"+ {key}: {data_after[key]}")
            elif key not in data_after:
                changes.append(f"- {key}: {data_before[key]}")
            elif data_before[key] != data_after[key]:
                changes.append(f"~ {key}: {data_before[key]} -> {data_after[key]}")
        
        if changes:
            logger.debug(f"{context} Changes: {', '.join(changes)}")
    elif isinstance(data_before, list) and isinstance(data_after, list):
        # Log basic info about list changes
        logger.debug(f"{context} Changes: List size {len(data_before)} -> {len(data_after)}")
    else:
        # Log simple before/after for other types
        if data_before != data_after:
            logger.debug(f"{context} Changes: {data_before} -> {data_after}")


def get_function_call_info() -> Dict[str, Any]:
    """
    Get information about the current function call and its caller
    
    Returns:
        Dictionary with call information
    """
    stack = inspect.stack()
    # Get information about the current function
    current_frame = stack[1]
    # Get information about the caller
    caller_frame = stack[2] if len(stack) > 2 else None
    
    result = {
        "function": current_frame.function,
        "filename": current_frame.filename,
        "lineno": current_frame.lineno,
        "module": inspect.getmodule(current_frame[0]).__name__ if inspect.getmodule(current_frame[0]) else "",
    }
    
    if caller_frame:
        result["caller"] = {
            "function": caller_frame.function,
            "filename": caller_frame.filename,
            "lineno": caller_frame.lineno,
            "module": inspect.getmodule(caller_frame[0]).__name__ if inspect.getmodule(caller_frame[0]) else "",
        }
    
    return result


def error_context(**context_vars) -> Dict[str, Any]:
    """
    Create an error context dictionary with additional variables
    
    Usage:
        try:
            do_something_risky()
        except Exception as e:
            logger.error(f"Error: {e}", extra=error_context(user_id=user.id, action="update"))
    """
    # Get the call stack information
    call_info = get_function_call_info()
    
    # Merge with the provided context variables
    context = {
        "timestamp": datetime.utcnow().isoformat(),
        "function": call_info["function"],
        "module": call_info["module"],
        "line": call_info["lineno"],
    }
    
    if "caller" in call_info:
        context["caller_function"] = call_info["caller"]["function"]
        context["caller_module"] = call_info["caller"]["module"]
    
    # Add the user-provided context variables
    context.update(context_vars)
    
    return context