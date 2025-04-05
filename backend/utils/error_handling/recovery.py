"""
Error recovery mechanisms for improved reliability.

This module provides utilities for recovering from transient errors and failures,
including retry mechanisms, circuit breakers, and graceful degradation strategies.
These are especially important in Docker container environments where transient
network issues and service dependencies may cause temporary failures.
"""

import time
import random
import logging
import functools
import asyncio
from typing import (
    Callable, Any, Optional, Type, Union, List, Dict, Tuple, 
    TypeVar, cast, Coroutine
)
from enum import Enum
from datetime import datetime, timedelta
from contextlib import contextmanager

from .exceptions import ApplicationError
from .exceptions_docker import (
    CircuitBreakerOpenError, ContainerDependencyError, 
    ContainerTimeoutError
)

# Setup logging
logger = logging.getLogger(__name__)

# Type definitions for function decoration
F = TypeVar('F', bound=Callable[..., Any])
AsyncF = TypeVar('AsyncF', bound=Callable[..., Coroutine[Any, Any, Any]])


class CircuitState(Enum):
    """Circuit breaker states."""
    CLOSED = "closed"       # Normal operation, requests allowed
    OPEN = "open"           # Failing, requests blocked
    HALF_OPEN = "half_open" # Testing if system has recovered


class CircuitBreaker:
    """
    Circuit breaker for handling external service failures.
    
    The circuit breaker pattern prevents cascading failures by stopping
    requests to a failing service and allowing it time to recover.
    """
    
    def __init__(
        self, 
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 30,
        retry_timeout: int = 60,
        excluded_exceptions: Optional[List[Type[Exception]]] = None
    ):
        """
        Initialize a circuit breaker.
        
        Args:
            name: Name for this circuit breaker
            failure_threshold: Number of failures before opening circuit
            recovery_timeout: Seconds to wait before trying recovery
            retry_timeout: Seconds before resetting failure count
            excluded_exceptions: Exceptions that don't count as failures
        """
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.retry_timeout = retry_timeout
        self.excluded_exceptions = excluded_exceptions or []
        
        # State tracking
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        self.last_success_time = None
        self.open_time = None
        
        logger.info(f"Circuit breaker {name} initialized (threshold: {failure_threshold}, "
                  f"recovery: {recovery_timeout}s)")
    
    def _should_allow_request(self) -> bool:
        """
        Determine if a request should be allowed based on circuit state.
        
        Returns:
            True if request should be allowed, False otherwise
        """
        now = datetime.now()
        
        if self.state == CircuitState.CLOSED:
            # Always allow requests in closed state
            return True
        
        elif self.state == CircuitState.OPEN:
            # In open state, check if recovery timeout has elapsed
            if self.open_time and now > self.open_time + timedelta(seconds=self.recovery_timeout):
                logger.info(f"Circuit {self.name} transitioning from OPEN to HALF_OPEN")
                self.state = CircuitState.HALF_OPEN
                return True
            return False
            
        elif self.state == CircuitState.HALF_OPEN:
            # In half-open state, allow a single request to test recovery
            return True
        
        return True
    
    def record_success(self) -> None:
        """Record a successful request."""
        now = datetime.now()
        self.last_success_time = now
        
        if self.state == CircuitState.HALF_OPEN:
            # Successful request in half-open state closes the circuit
            logger.info(f"Circuit {self.name} recovered, transitioning to CLOSED")
            self.state = CircuitState.CLOSED
            self.failure_count = 0
            self.open_time = None
    
    def record_failure(self, exception: Exception) -> None:
        """
        Record a failed request.
        
        Args:
            exception: The exception that occurred
        """
        # Skip if exception is in excluded list
        if any(isinstance(exception, exc_type) for exc_type in self.excluded_exceptions):
            return
            
        now = datetime.now()
        self.last_failure_time = now
        
        if self.state == CircuitState.CLOSED:
            # Check if we should reset failure count due to time elapsed
            if (self.last_failure_time and 
                    self.last_success_time and 
                    self.last_success_time > self.last_failure_time + timedelta(seconds=self.retry_timeout)):
                self.failure_count = 0
            
            # Increment failure count
            self.failure_count += 1
            
            # Check if threshold reached
            if self.failure_count >= self.failure_threshold:
                logger.warning(f"Circuit {self.name} threshold reached ({self.failure_count} failures), "
                             f"transitioning to OPEN")
                self.state = CircuitState.OPEN
                self.open_time = now
        
        elif self.state == CircuitState.HALF_OPEN:
            # Failure in half-open state returns to open state
            logger.warning(f"Circuit {self.name} failed in HALF_OPEN state, returning to OPEN")
            self.state = CircuitState.OPEN
            self.open_time = now
    
    @contextmanager
    def __call__(self) -> Any:
        """
        Use the circuit breaker as a context manager.
        
        Raises:
            CircuitBreakerOpenError: If the circuit is open
        """
        if not self._should_allow_request():
            raise CircuitBreakerOpenError(
                message=f"Circuit breaker {self.name} is open",
                detail={
                    "circuit": self.name,
                    "state": self.state.value,
                    "failure_count": self.failure_count,
                    "open_time": self.open_time.isoformat() if self.open_time else None,
                    "recovery_timeout": self.recovery_timeout
                }
            )
        
        try:
            yield
            self.record_success()
        except Exception as e:
            self.record_failure(e)
            raise
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get the current status of the circuit breaker.
        
        Returns:
            Dictionary with circuit breaker status
        """
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self.failure_count,
            "failure_threshold": self.failure_threshold,
            "recovery_timeout": self.recovery_timeout,
            "retry_timeout": self.retry_timeout,
            "last_failure": self.last_failure_time.isoformat() if self.last_failure_time else None,
            "last_success": self.last_success_time.isoformat() if self.last_success_time else None,
            "open_time": self.open_time.isoformat() if self.open_time else None
        }
    
    def reset(self) -> None:
        """Reset the circuit breaker to closed state."""
        logger.info(f"Circuit {self.name} manually reset to CLOSED")
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.open_time = None


# Registry for circuit breakers
_circuit_breakers: Dict[str, CircuitBreaker] = {}

def get_circuit_breaker(name: str) -> CircuitBreaker:
    """
    Get or create a circuit breaker by name.
    
    Args:
        name: Name of the circuit breaker
        
    Returns:
        Circuit breaker instance
    """
    if name not in _circuit_breakers:
        _circuit_breakers[name] = CircuitBreaker(name)
    
    return _circuit_breakers[name]

def configure_circuit_breaker(
    name: str,
    failure_threshold: int = 5,
    recovery_timeout: int = 30,
    retry_timeout: int = 60,
    excluded_exceptions: Optional[List[Type[Exception]]] = None
) -> CircuitBreaker:
    """
    Configure a circuit breaker.
    
    Args:
        name: Name of the circuit breaker
        failure_threshold: Number of failures before opening circuit
        recovery_timeout: Seconds to wait before trying recovery
        retry_timeout: Seconds before resetting failure count
        excluded_exceptions: Exceptions that don't count as failures
        
    Returns:
        Configured circuit breaker instance
    """
    circuit = CircuitBreaker(
        name=name,
        failure_threshold=failure_threshold,
        recovery_timeout=recovery_timeout,
        retry_timeout=retry_timeout,
        excluded_exceptions=excluded_exceptions
    )
    
    _circuit_breakers[name] = circuit
    return circuit

def with_circuit_breaker(
    circuit_name: str,
    **circuit_kwargs
) -> Callable[[F], F]:
    """
    Decorator to apply circuit breaker pattern to a function.
    
    Args:
        circuit_name: Name of the circuit breaker
        **circuit_kwargs: Additional arguments for circuit breaker configuration
        
    Returns:
        Decorated function with circuit breaker
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Get or configure circuit breaker
            if circuit_kwargs:
                circuit = configure_circuit_breaker(circuit_name, **circuit_kwargs)
            else:
                circuit = get_circuit_breaker(circuit_name)
            
            # Apply circuit breaker
            with circuit():
                return func(*args, **kwargs)
        
        return cast(F, wrapper)
    
    return decorator

def with_async_circuit_breaker(
    circuit_name: str,
    **circuit_kwargs
) -> Callable[[AsyncF], AsyncF]:
    """
    Decorator to apply circuit breaker pattern to an async function.
    
    Args:
        circuit_name: Name of the circuit breaker
        **circuit_kwargs: Additional arguments for circuit breaker configuration
        
    Returns:
        Decorated async function with circuit breaker
    """
    def decorator(func: AsyncF) -> AsyncF:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Get or configure circuit breaker
            if circuit_kwargs:
                circuit = configure_circuit_breaker(circuit_name, **circuit_kwargs)
            else:
                circuit = get_circuit_breaker(circuit_name)
            
            # Apply circuit breaker
            with circuit():
                return await func(*args, **kwargs)
        
        return cast(AsyncF, wrapper)
    
    return decorator

def with_retry(
    max_retries: int = 3,
    retry_delay: float = 1.0,
    backoff_factor: float = 2.0,
    jitter: bool = True,
    max_delay: float = 60.0,
    retry_exceptions: Optional[Tuple[Type[Exception], ...]] = None
) -> Callable[[F], F]:
    """
    Decorator to retry a function on failure with exponential backoff.
    
    Args:
        max_retries: Maximum number of retry attempts
        retry_delay: Initial delay between retries in seconds
        backoff_factor: Multiplier for delay after each retry
        jitter: Whether to add random jitter to delay
        max_delay: Maximum delay between retries
        retry_exceptions: Exception types to retry on (defaults to all exceptions)
        
    Returns:
        Decorated function with retry logic
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            exceptions_to_retry = retry_exceptions or (Exception,)
            retries = 0
            delay = retry_delay
            
            while True:
                try:
                    return func(*args, **kwargs)
                except exceptions_to_retry as e:
                    retries += 1
                    if retries > max_retries:
                        logger.error(f"Max retries ({max_retries}) exceeded for {func.__name__}")
                        raise
                    
                    # Calculate delay with optional jitter
                    current_delay = min(delay, max_delay)
                    if jitter:
                        current_delay = current_delay * (0.5 + random.random())
                    
                    logger.warning(f"Retry {retries}/{max_retries} for {func.__name__} "
                                 f"after {e.__class__.__name__}: {str(e)}. "
                                 f"Waiting {current_delay:.2f}s")
                    
                    # Wait before retry
                    time.sleep(current_delay)
                    
                    # Increase delay for next retry
                    delay *= backoff_factor
        
        return cast(F, wrapper)
    
    return decorator

async def async_retry(
    func: Callable[[], Coroutine[Any, Any, Any]],
    max_retries: int = 3,
    retry_delay: float = 1.0,
    backoff_factor: float = 2.0,
    jitter: bool = True,
    max_delay: float = 60.0,
    retry_exceptions: Optional[Tuple[Type[Exception], ...]] = None
) -> Any:
    """
    Retry an async function with exponential backoff.
    
    Args:
        func: Async function to retry
        max_retries: Maximum number of retry attempts
        retry_delay: Initial delay between retries in seconds
        backoff_factor: Multiplier for delay after each retry
        jitter: Whether to add random jitter to delay
        max_delay: Maximum delay between retries
        retry_exceptions: Exception types to retry on (defaults to all exceptions)
        
    Returns:
        Result of the function
        
    Raises:
        Last exception if all retries fail
    """
    exceptions_to_retry = retry_exceptions or (Exception,)
    retries = 0
    delay = retry_delay
    
    while True:
        try:
            return await func()
        except exceptions_to_retry as e:
            retries += 1
            if retries > max_retries:
                logger.error(f"Max retries ({max_retries}) exceeded for async function")
                raise
            
            # Calculate delay with optional jitter
            current_delay = min(delay, max_delay)
            if jitter:
                current_delay = current_delay * (0.5 + random.random())
            
            logger.warning(f"Async retry {retries}/{max_retries} after "
                         f"{e.__class__.__name__}: {str(e)}. Waiting {current_delay:.2f}s")
            
            # Wait before retry
            await asyncio.sleep(current_delay)
            
            # Increase delay for next retry
            delay *= backoff_factor

def with_async_retry(
    max_retries: int = 3,
    retry_delay: float = 1.0,
    backoff_factor: float = 2.0,
    jitter: bool = True,
    max_delay: float = 60.0,
    retry_exceptions: Optional[Tuple[Type[Exception], ...]] = None
) -> Callable[[AsyncF], AsyncF]:
    """
    Decorator to retry an async function on failure with exponential backoff.
    
    Args:
        max_retries: Maximum number of retry attempts
        retry_delay: Initial delay between retries in seconds
        backoff_factor: Multiplier for delay after each retry
        jitter: Whether to add random jitter to delay
        max_delay: Maximum delay between retries
        retry_exceptions: Exception types to retry on (defaults to all exceptions)
        
    Returns:
        Decorated async function with retry logic
    """
    def decorator(func: AsyncF) -> AsyncF:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            exceptions_to_retry = retry_exceptions or (Exception,)
            retries = 0
            delay = retry_delay
            
            while True:
                try:
                    return await func(*args, **kwargs)
                except exceptions_to_retry as e:
                    retries += 1
                    if retries > max_retries:
                        logger.error(f"Max retries ({max_retries}) exceeded for {func.__name__}")
                        raise
                    
                    # Calculate delay with optional jitter
                    current_delay = min(delay, max_delay)
                    if jitter:
                        current_delay = current_delay * (0.5 + random.random())
                    
                    logger.warning(f"Retry {retries}/{max_retries} for {func.__name__} "
                                 f"after {e.__class__.__name__}: {str(e)}. "
                                 f"Waiting {current_delay:.2f}s")
                    
                    # Wait before retry
                    await asyncio.sleep(current_delay)
                    
                    # Increase delay for next retry
                    delay *= backoff_factor
        
        return cast(AsyncF, wrapper)
    
    return decorator

class Fallback:
    """
    Fallback mechanism for graceful degradation.
    
    This class provides a way to specify fallback options when primary
    functionality fails, enabling graceful degradation instead of hard failures.
    """
    
    def __init__(
        self, 
        primary_func: Callable,
        fallback_func: Callable,
        exceptions_to_catch: Optional[Tuple[Type[Exception], ...]] = None,
        log_failures: bool = True
    ):
        """
        Initialize a fallback mechanism.
        
        Args:
            primary_func: Primary function to try first
            fallback_func: Fallback function to use if primary fails
            exceptions_to_catch: Exception types that trigger fallback
            log_failures: Whether to log primary function failures
        """
        self.primary_func = primary_func
        self.fallback_func = fallback_func
        self.exceptions_to_catch = exceptions_to_catch or (Exception,)
        self.log_failures = log_failures
        
        # Track usage statistics
        self.total_calls = 0
        self.fallback_calls = 0
        self.last_failure = None
        self.last_failure_time = None
    
    def __call__(self, *args, **kwargs):
        """
        Execute the primary function with fallback on failure.
        
        Args:
            *args: Arguments to pass to both functions
            **kwargs: Keyword arguments to pass to both functions
            
        Returns:
            Result from primary or fallback function
            
        Raises:
            Exception: If both primary and fallback fail
        """
        self.total_calls += 1
        
        try:
            # Try primary function
            return self.primary_func(*args, **kwargs)
        except self.exceptions_to_catch as e:
            # Record failure
            self.fallback_calls += 1
            self.last_failure = e
            self.last_failure_time = datetime.now()
            
            if self.log_failures:
                logger.warning(f"Primary function {self.primary_func.__name__} failed: {e}. "
                             f"Using fallback {self.fallback_func.__name__}")
            
            # Use fallback
            try:
                return self.fallback_func(*args, **kwargs)
            except Exception as fallback_error:
                logger.error(f"Fallback function {self.fallback_func.__name__} also failed: {fallback_error}")
                raise
    
    async def async_call(self, *args, **kwargs):
        """
        Execute the primary async function with fallback on failure.
        
        Args:
            *args: Arguments to pass to both functions
            **kwargs: Keyword arguments to pass to both functions
            
        Returns:
            Result from primary or fallback function
            
        Raises:
            Exception: If both primary and fallback fail
        """
        self.total_calls += 1
        
        try:
            # Try primary function (handle both async and sync functions)
            if asyncio.iscoroutinefunction(self.primary_func):
                return await self.primary_func(*args, **kwargs)
            else:
                return self.primary_func(*args, **kwargs)
        except self.exceptions_to_catch as e:
            # Record failure
            self.fallback_calls += 1
            self.last_failure = e
            self.last_failure_time = datetime.now()
            
            if self.log_failures:
                logger.warning(f"Primary function {self.primary_func.__name__} failed: {e}. "
                             f"Using fallback {self.fallback_func.__name__}")
            
            # Use fallback (handle both async and sync functions)
            try:
                if asyncio.iscoroutinefunction(self.fallback_func):
                    return await self.fallback_func(*args, **kwargs)
                else:
                    return self.fallback_func(*args, **kwargs)
            except Exception as fallback_error:
                logger.error(f"Fallback function {self.fallback_func.__name__} also failed: {fallback_error}")
                raise
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get the current status of the fallback mechanism.
        
        Returns:
            Dictionary with fallback mechanism status
        """
        return {
            "primary_function": self.primary_func.__name__,
            "fallback_function": self.fallback_func.__name__,
            "total_calls": self.total_calls,
            "fallback_calls": self.fallback_calls,
            "fallback_rate": (self.fallback_calls / self.total_calls) if self.total_calls > 0 else 0,
            "last_failure_time": self.last_failure_time.isoformat() if self.last_failure_time else None,
            "last_failure": str(self.last_failure) if self.last_failure else None
        }

def with_fallback(
    fallback_func: Callable,
    exceptions_to_catch: Optional[Tuple[Type[Exception], ...]] = None,
    log_failures: bool = True
) -> Callable[[F], F]:
    """
    Decorator to apply fallback mechanism to a function.
    
    Args:
        fallback_func: Fallback function to use if primary fails
        exceptions_to_catch: Exception types that trigger fallback
        log_failures: Whether to log primary function failures
        
    Returns:
        Decorated function with fallback mechanism
    """
    def decorator(primary_func: F) -> F:
        fallback = Fallback(
            primary_func=primary_func,
            fallback_func=fallback_func,
            exceptions_to_catch=exceptions_to_catch,
            log_failures=log_failures
        )
        
        @functools.wraps(primary_func)
        def wrapper(*args, **kwargs):
            return fallback(*args, **kwargs)
        
        # Store fallback instance on wrapper for introspection
        wrapper.fallback = fallback
        
        return cast(F, wrapper)
    
    return decorator

def with_async_fallback(
    fallback_func: Callable,
    exceptions_to_catch: Optional[Tuple[Type[Exception], ...]] = None,
    log_failures: bool = True
) -> Callable[[AsyncF], AsyncF]:
    """
    Decorator to apply fallback mechanism to an async function.
    
    Args:
        fallback_func: Fallback function to use if primary fails
        exceptions_to_catch: Exception types that trigger fallback
        log_failures: Whether to log primary function failures
        
    Returns:
        Decorated async function with fallback mechanism
    """
    def decorator(primary_func: AsyncF) -> AsyncF:
        fallback = Fallback(
            primary_func=primary_func,
            fallback_func=fallback_func,
            exceptions_to_catch=exceptions_to_catch,
            log_failures=log_failures
        )
        
        @functools.wraps(primary_func)
        async def wrapper(*args, **kwargs):
            return await fallback.async_call(*args, **kwargs)
        
        # Store fallback instance on wrapper for introspection
        wrapper.fallback = fallback
        
        return cast(AsyncF, wrapper)
    
    return decorator

def with_timeout(
    timeout_seconds: float,
    timeout_exception: Optional[Type[Exception]] = None
) -> Callable[[F], F]:
    """
    Decorator to apply timeout to a function.
    
    Note: This works only for synchronous functions. For async functions,
    use asyncio.wait_for() directly.
    
    Args:
        timeout_seconds: Maximum time to allow function to run
        timeout_exception: Exception type to raise on timeout
        
    Returns:
        Decorated function with timeout
    """
    timeout_exc = timeout_exception or ContainerTimeoutError
    
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            import signal
            
            def timeout_handler(signum, frame):
                raise timeout_exc(
                    message=f"Function {func.__name__} timed out after {timeout_seconds} seconds",
                    detail={"timeout": timeout_seconds}
                )
            
            # Set timeout handler
            original_handler = signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(int(timeout_seconds))
            
            try:
                # Call the function
                return func(*args, **kwargs)
            finally:
                # Reset alarm and restore original handler
                signal.alarm(0)
                signal.signal(signal.SIGALRM, original_handler)
        
        return cast(F, wrapper)
    
    return decorator