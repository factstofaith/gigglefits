"""
Asynchronous error handling utilities.

This module provides error handling utilities for asynchronous code,
focusing on proper handling of errors in asyncio tasks and coroutines.
"""

import asyncio
import logging
import traceback
import functools
from typing import List, Any, Optional, Callable, TypeVar, Dict, Tuple, cast, Coroutine, Type

# Setup logging
logger = logging.getLogger(__name__)

# Type definitions for async functions
F = TypeVar('F', bound=Callable[..., Coroutine[Any, Any, Any]])


def handle_async_errors(func: F) -> F:
    """
    Decorator to properly handle exceptions in async functions.
    
    This decorator wraps async functions to ensure consistent error handling
    and logging.
    
    Args:
        func: Async function to decorate
        
    Returns:
        Decorated async function with error handling
    """
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except asyncio.CancelledError:
            # Handle cancellation (container shutdown)
            logger.info(f"Async operation cancelled: {func.__name__}")
            raise  # Re-raise cancellation
        except Exception as e:
            # Log and handle other exceptions
            logger.error(
                f"Error in async function {func.__name__}: {e}\n{traceback.format_exc()}"
            )
            # Re-raise the exception
            raise
    
    return cast(F, wrapper)


def handle_task_result(task: asyncio.Task) -> None:
    """
    Handle the result of an async task.
    
    This function is designed to be used as a callback for asyncio tasks to
    handle exceptions properly.
    
    Args:
        task: Completed asyncio task
    """
    try:
        # This will re-raise any exception from the task
        task.result()
    except asyncio.CancelledError:
        logger.info(f"Task {task.get_name()} was cancelled")
    except Exception as e:
        logger.error(f"Task {task.get_name()} failed with: {e}\n{traceback.format_exc()}")


async def run_parallel_tasks_with_error_handling(
    tasks: List[Coroutine],
    return_exceptions: bool = False
) -> List[Any]:
    """
    Run multiple tasks in parallel with error handling.
    
    This function runs multiple coroutines in parallel using asyncio.gather
    with proper error handling.
    
    Args:
        tasks: List of coroutines to run in parallel
        return_exceptions: Whether to return exceptions instead of raising them
        
    Returns:
        List of results or exceptions if return_exceptions is True
    """
    try:
        # Create named tasks for better error reporting
        named_tasks = []
        for i, coro in enumerate(tasks):
            task_name = getattr(coro, '__name__', f"task_{i}")
            task = asyncio.create_task(coro, name=task_name)
            named_tasks.append(task)
        
        # Run tasks in parallel
        results = await asyncio.gather(*named_tasks, return_exceptions=return_exceptions)
        
        if return_exceptions:
            # Log exceptions but don't raise them
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Task {named_tasks[i].get_name()} failed: {result}")
        
        return results
    except Exception as e:
        # This will only happen for errors outside of the gathered tasks
        logger.error(f"Error running parallel tasks: {e}\n{traceback.format_exc()}")
        raise


async def create_task_with_error_handling(
    coro: Coroutine,
    task_name: Optional[str] = None
) -> asyncio.Task:
    """
    Create an asyncio task with error handling.
    
    This function creates an asyncio task and adds error handling.
    
    Args:
        coro: Coroutine to run as a task
        task_name: Optional name for the task
        
    Returns:
        Created asyncio task
    """
    # Get default task name if not provided
    if task_name is None:
        task_name = getattr(coro, '__name__', 'unnamed_task')
    
    # Create the task
    task = asyncio.create_task(coro, name=task_name)
    
    # Add callback to handle exceptions
    task.add_done_callback(handle_task_result)
    
    return task


class AsyncErrorBoundary:
    """
    Context manager for handling errors in async code.
    
    This class provides a context manager that handles errors in async code
    in a consistent way.
    """
    
    def __init__(
        self,
        error_handler: Optional[Callable[[Exception], Any]] = None,
        reraise: bool = True,
        log_errors: bool = True
    ):
        """
        Initialize the error boundary.
        
        Args:
            error_handler: Optional function to call when an error occurs
            reraise: Whether to re-raise the error after handling
            log_errors: Whether to log errors
        """
        self.error_handler = error_handler
        self.reraise = reraise
        self.log_errors = log_errors
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_val is not None:
            # We have an exception
            if self.log_errors:
                logger.error(
                    f"Error caught in AsyncErrorBoundary: {exc_val}\n{traceback.format_exc()}"
                )
            
            # Call error handler if provided
            if self.error_handler:
                try:
                    if asyncio.iscoroutinefunction(self.error_handler):
                        await self.error_handler(exc_val)
                    else:
                        self.error_handler(exc_val)
                except Exception as handler_error:
                    logger.error(
                        f"Error in AsyncErrorBoundary handler: {handler_error}\n{traceback.format_exc()}"
                    )
            
            # Determine whether to suppress the exception
            return not self.reraise
        
        return False  # Don't suppress exception if there is none


async def retry_async(
    func: Callable,
    max_retries: int = 3,
    retry_delay: float = 1.0,
    backoff_factor: float = 2.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,)
) -> Any:
    """
    Retry an async function with exponential backoff.
    
    This function retries an async function if it raises specified exceptions,
    with exponential backoff between retries.
    
    Args:
        func: Function to retry
        max_retries: Maximum number of retry attempts
        retry_delay: Initial delay between retries in seconds
        backoff_factor: Multiplier for delay after each retry
        exceptions: Exception types to catch and retry
        
    Returns:
        Result of the function
        
    Raises:
        Last exception if all retries fail
    """
    retries = 0
    delay = retry_delay
    last_error = None
    
    while retries <= max_retries:
        try:
            if asyncio.iscoroutinefunction(func):
                return await func()
            else:
                return func()
        except exceptions as e:
            last_error = e
            retries += 1
            
            if retries > max_retries:
                break
            
            logger.warning(
                f"Retry {retries}/{max_retries} for {getattr(func, '__name__', 'function')} "
                f"after error: {e}"
            )
            
            await asyncio.sleep(delay)
            delay *= backoff_factor
    
    logger.error(
        f"All {max_retries} retries failed for {getattr(func, '__name__', 'function')}: {last_error}"
    )
    raise last_error