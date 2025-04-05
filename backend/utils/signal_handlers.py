"""
Signal handlers for graceful shutdown in containerized environments
"""

import os
import sys
import signal
import logging
import time
import threading
from typing import Callable, Dict, Any, Optional
from contextlib import contextmanager

# Configure logger
logger = logging.getLogger(__name__)

# Track registered shutdown handlers
_shutdown_handlers: Dict[str, Callable[[], Any]] = {}
_shutdown_in_progress = threading.Event()
_max_shutdown_time = int(os.environ.get("GRACEFUL_SHUTDOWN_TIMEOUT", "30"))

def register_shutdown_handler(name: str, handler_func: Callable[[], Any]) -> None:
    """
    Register a function to be called during graceful shutdown.
    
    Args:
        name: Unique identifier for this handler
        handler_func: Function to call during shutdown
    """
    if name in _shutdown_handlers:
        logger.warning(f"Overwriting existing shutdown handler: {name}")
    
    _shutdown_handlers[name] = handler_func
    logger.debug(f"Registered shutdown handler: {name}")

def remove_shutdown_handler(name: str) -> None:
    """
    Remove a registered shutdown handler.
    
    Args:
        name: Identifier of the handler to remove
    """
    if name in _shutdown_handlers:
        del _shutdown_handlers[name]
        logger.debug(f"Removed shutdown handler: {name}")

def _execute_shutdown() -> None:
    """
    Execute all registered shutdown handlers.
    """
    if _shutdown_in_progress.is_set():
        logger.info("Shutdown already in progress")
        return
    
    _shutdown_in_progress.set()
    logger.info(f"Starting graceful shutdown (timeout: {_max_shutdown_time}s)")
    
    # Create a timer to force exit if graceful shutdown takes too long
    force_exit_timer = threading.Timer(_max_shutdown_time, _force_exit)
    force_exit_timer.daemon = True
    force_exit_timer.start()
    
    try:
        # Execute all registered shutdown handlers
        for name, handler in _shutdown_handlers.items():
            try:
                logger.info(f"Running shutdown handler: {name}")
                handler()
            except Exception as e:
                logger.error(f"Error in shutdown handler {name}: {str(e)}")
        
        logger.info("Graceful shutdown completed")
        
        # Cancel the force exit timer if shutdown completed successfully
        force_exit_timer.cancel()
        
        # Exit with success code
        sys.exit(0)
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")
        sys.exit(1)

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
    logger.info("Registered signal handlers for graceful shutdown")

@contextmanager
def register_resource(name: str, cleanup_func: Callable[[], Any]) -> None:
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