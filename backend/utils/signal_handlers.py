"""
Signal handlers for graceful shutdown in containerized environments

This module provides a comprehensive signal handling system for containerized
applications, ensuring proper resource cleanup and graceful shutdown when
container orchestration systems send termination signals.

Features:
- Signal handlers for SIGTERM and SIGINT
- Registration system for cleanup handlers
- Timeout protection for long-running shutdown operations
- Resource tracking and cleanup
- Context manager for resource registration
"""

import os
import sys
import signal
import logging
import time
import threading
import asyncio
from typing import Callable, Dict, Any, Optional, List, Union, Set, Awaitable
from contextlib import contextmanager

# Import configuration
from core.config_factory import ConfigFactory

# Configure logger
logger = logging.getLogger(__name__)

# Track registered shutdown handlers
_shutdown_handlers: Dict[str, Union[Callable[[], Any], Callable[[], Awaitable[Any]]]] = {}
_async_shutdown_handlers: Set[str] = set()  # Track which handlers are async
_shutdown_in_progress = threading.Event()
_shutdown_lock = threading.RLock()

# Default values, will be overridden by config
_max_shutdown_time = 30  # seconds
_shutdown_attempts = 3

# Track active resources
_active_connections: Dict[str, Any] = {}
_active_tasks: List[asyncio.Task] = []

def get_shutdown_config() -> Dict[str, Any]:
    """
    Get shutdown configuration values from config.
    
    Returns:
        Dict with shutdown configuration values
    """
    config = ConfigFactory.get_config()
    
    # Get Docker settings if available
    if config.is_docker():
        docker_settings = config.docker
        return {
            "max_shutdown_time": docker_settings.GRACEFUL_SHUTDOWN_TIMEOUT,
            "shutdown_attempts": docker_settings.GRACEFUL_SHUTDOWN_ATTEMPTS,
        }
    
    # Default values if not in Docker
    return {
        "max_shutdown_time": int(os.environ.get("GRACEFUL_SHUTDOWN_TIMEOUT", "30")),
        "shutdown_attempts": int(os.environ.get("GRACEFUL_SHUTDOWN_ATTEMPTS", "3"))
    }

def register_shutdown_handler(name: str, handler_func: Union[Callable[[], Any], Callable[[], Awaitable[Any]]]) -> None:
    """
    Register a function to be called during graceful shutdown.
    
    Args:
        name: Unique identifier for this handler
        handler_func: Function to call during shutdown, can be sync or async
    """
    global _shutdown_handlers, _async_shutdown_handlers
    
    with _shutdown_lock:
        if name in _shutdown_handlers:
            logger.warning(f"Overwriting existing shutdown handler: {name}")
        
        _shutdown_handlers[name] = handler_func
        
        # Check if it's an async function
        if asyncio.iscoroutinefunction(handler_func):
            _async_shutdown_handlers.add(name)
            logger.debug(f"Registered async shutdown handler: {name}")
        else:
            logger.debug(f"Registered sync shutdown handler: {name}")

def remove_shutdown_handler(name: str) -> None:
    """
    Remove a registered shutdown handler.
    
    Args:
        name: Identifier of the handler to remove
    """
    global _shutdown_handlers, _async_shutdown_handlers
    
    with _shutdown_lock:
        if name in _shutdown_handlers:
            del _shutdown_handlers[name]
            if name in _async_shutdown_handlers:
                _async_shutdown_handlers.remove(name)
            logger.debug(f"Removed shutdown handler: {name}")

def register_connection(name: str, connection: Any) -> None:
    """
    Register an active connection for tracking.
    
    Args:
        name: Identifier for the connection
        connection: Connection object
    """
    global _active_connections
    
    with _shutdown_lock:
        _active_connections[name] = connection
        logger.debug(f"Registered active connection: {name}")

def unregister_connection(name: str) -> None:
    """
    Unregister an active connection.
    
    Args:
        name: Identifier for the connection
    """
    global _active_connections
    
    with _shutdown_lock:
        if name in _active_connections:
            del _active_connections[name]
            logger.debug(f"Unregistered active connection: {name}")

def register_task(task: asyncio.Task) -> None:
    """
    Register an active asyncio task for tracking.
    
    Args:
        task: Asyncio task
    """
    global _active_tasks
    
    with _shutdown_lock:
        _active_tasks.append(task)
        logger.debug(f"Registered active task: {task.get_name()}")

def unregister_task(task: asyncio.Task) -> None:
    """
    Unregister an active asyncio task.
    
    Args:
        task: Asyncio task
    """
    global _active_tasks
    
    with _shutdown_lock:
        if task in _active_tasks:
            _active_tasks.remove(task)
            logger.debug(f"Unregistered active task: {task.get_name()}")

def _execute_shutdown() -> None:
    """
    Execute all registered shutdown handlers.
    """
    if _shutdown_in_progress.is_set():
        logger.info("Shutdown already in progress")
        return
    
    _shutdown_in_progress.set()
    
    # Get configuration values
    shutdown_config = get_shutdown_config()
    global _max_shutdown_time, _shutdown_attempts
    _max_shutdown_time = shutdown_config["max_shutdown_time"]
    _shutdown_attempts = shutdown_config["shutdown_attempts"]
    
    logger.info(f"Starting graceful shutdown (timeout: {_max_shutdown_time}s, attempts: {_shutdown_attempts})")
    
    # Create a timer to force exit if graceful shutdown takes too long
    force_exit_timer = threading.Timer(_max_shutdown_time, _force_exit)
    force_exit_timer.daemon = True
    force_exit_timer.start()
    
    try:
        # Execute async handlers if we're in an asyncio event loop
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                logger.info("Executing async shutdown handlers")
                asyncio.create_task(_execute_async_shutdown())
                return  # Let the async task handle the exit
        except RuntimeError:
            logger.info("No running event loop, using synchronous shutdown only")
        
        # Execute all registered synchronous shutdown handlers
        _execute_sync_shutdown()
        
        # Cancel the force exit timer if shutdown completed successfully
        force_exit_timer.cancel()
        
        # Exit with success code
        logger.info("Graceful shutdown completed")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")
        sys.exit(1)

async def _execute_async_shutdown() -> None:
    """
    Execute all registered async shutdown handlers.
    """
    try:
        # Cancel all active tasks
        for task in _active_tasks:
            if not task.done() and not task.cancelled():
                logger.info(f"Cancelling active task: {task.get_name()}")
                task.cancel()
        
        # Wait for tasks to cancel (brief timeout)
        if _active_tasks:
            try:
                await asyncio.wait(_active_tasks, timeout=2.0)
            except Exception as e:
                logger.warning(f"Error waiting for tasks to cancel: {str(e)}")
        
        # Execute all async shutdown handlers
        async_handlers = []
        for name in _async_shutdown_handlers:
            handler = _shutdown_handlers.get(name)
            if handler:
                logger.info(f"Running async shutdown handler: {name}")
                try:
                    task = asyncio.create_task(handler())
                    task.set_name(f"shutdown_{name}")
                    async_handlers.append(task)
                except Exception as e:
                    logger.error(f"Error starting async shutdown handler {name}: {str(e)}")
        
        # Wait for all async handlers with timeout
        if async_handlers:
            done, pending = await asyncio.wait(async_handlers, timeout=max(5.0, _max_shutdown_time * 0.5))
            for task in pending:
                logger.warning(f"Async shutdown handler timed out: {task.get_name()}")
        
        # Execute all synchronous shutdown handlers
        for name, handler in _shutdown_handlers.items():
            if name not in _async_shutdown_handlers:
                try:
                    logger.info(f"Running sync shutdown handler: {name}")
                    handler()
                except Exception as e:
                    logger.error(f"Error in sync shutdown handler {name}: {str(e)}")
        
        logger.info("Async graceful shutdown completed")
        
        # Exit after a short delay to allow log messages to be written
        loop = asyncio.get_event_loop()
        loop.call_later(0.5, sys.exit, 0)
    except Exception as e:
        logger.error(f"Error during async shutdown: {str(e)}")
        sys.exit(1)

def _execute_sync_shutdown() -> None:
    """
    Execute all synchronous shutdown handlers.
    """
    for name, handler in _shutdown_handlers.items():
        if name not in _async_shutdown_handlers:
            try:
                logger.info(f"Running shutdown handler: {name}")
                handler()
            except Exception as e:
                logger.error(f"Error in shutdown handler {name}: {str(e)}")

def _force_exit() -> None:
    """
    Force exit if graceful shutdown takes too long.
    """
    logger.error(f"Graceful shutdown timed out after {_max_shutdown_time}s. Forcing exit.")
    os._exit(1)  # Force exit without calling cleanup handlers

def _signal_handler(sig: int, frame: Any) -> None:
    """
    Signal handler for SIGTERM and SIGINT.
    
    Args:
        sig: Signal number
        frame: Current stack frame
    """
    signal_name = signal.Signals(sig).name
    logger.info(f"Received {signal_name} signal")
    _execute_shutdown()

def setup_signal_handlers() -> None:
    """
    Register signal handlers for graceful shutdown.
    """
    signal.signal(signal.SIGTERM, _signal_handler)  # Termination signal
    signal.signal(signal.SIGINT, _signal_handler)   # Interrupt from keyboard (Ctrl+C)
    
    # Load configuration
    shutdown_config = get_shutdown_config()
    global _max_shutdown_time, _shutdown_attempts
    _max_shutdown_time = shutdown_config["max_shutdown_time"]
    _shutdown_attempts = shutdown_config["shutdown_attempts"]
    
    # Register Docker-specific handler if running in Docker
    if ConfigFactory.is_docker():
        logger.info(f"Registered signal handlers for Docker container (timeout: {_max_shutdown_time}s)")
    else:
        logger.info("Registered signal handlers for graceful shutdown")

@contextmanager
def register_resource(name: str, cleanup_func: Union[Callable[[], Any], Callable[[], Awaitable[Any]]]) -> None:
    """
    Context manager to register and automatically remove shutdown handlers.
    
    Args:
        name: Unique identifier for this handler
        cleanup_func: Function to call during shutdown
    
    Example:
        with register_resource("db_connection", lambda: db.close()):
            # Use db connection
    """
    try:
        register_shutdown_handler(name, cleanup_func)
        yield
    finally:
        remove_shutdown_handler(name)

# --- Database connection management ---

def register_database_shutdown_handler(engine: Any) -> None:
    """
    Register a shutdown handler for SQLAlchemy engine.
    
    Args:
        engine: SQLAlchemy engine
    """
    register_shutdown_handler("database", lambda: engine.dispose())
    logger.info("Registered database shutdown handler")

def register_async_database_shutdown_handler(engine: Any) -> None:
    """
    Register a shutdown handler for SQLAlchemy async engine.
    
    Args:
        engine: SQLAlchemy async engine
    """
    async def dispose_engine():
        await engine.dispose()
    
    register_shutdown_handler("async_database", dispose_engine)
    logger.info("Registered async database shutdown handler")

# --- In-memory cache management ---

def register_cache_shutdown_handler(cache: Any) -> None:
    """
    Register a shutdown handler for cache.
    
    Args:
        cache: Cache object with a close method
    """
    if hasattr(cache, 'close'):
        register_shutdown_handler("cache", lambda: cache.close())
        logger.info("Registered cache shutdown handler")
    else:
        logger.warning("Cache object does not have a close method")

# --- Container-specific handlers ---

def register_container_handlers() -> None:
    """
    Register handlers specific to Docker containers.
    """
    if not ConfigFactory.is_docker():
        return
    
    # Register a handler for logging container shutdown
    def log_container_shutdown():
        docker_settings = ConfigFactory.get_docker_settings()
        if docker_settings:
            logger.info(f"Container {docker_settings.CONTAINER_NAME} ({docker_settings.CONTAINER_ID}) shutting down")
    
    register_shutdown_handler("container_log", log_container_shutdown)
    logger.info("Registered container shutdown handlers")