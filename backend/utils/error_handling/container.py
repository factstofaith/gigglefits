"""
Container-specific error handling utilities.

This module provides error handling utilities specifically for containerized environments,
focusing on graceful shutdown and proper signal handling.
"""

import signal
import sys
import logging
import time
import asyncio
import os
import socket
from typing import Optional, Callable, Dict, Any
from functools import partial

# Setup logging
logger = logging.getLogger(__name__)

# Maintain a reference to registered shutdown handlers
_shutdown_handlers: Dict[str, Callable] = {}


def shutdown_handler(sig: int, frame: Any, handlers: Dict[str, Callable] = None) -> None:
    """
    Graceful shutdown handler for Docker containers.
    
    This function handles SIGTERM and SIGINT signals to perform graceful shutdown
    in containerized environments. It calls registered shutdown handlers and
    then exits the process.
    
    Args:
        sig: Signal number
        frame: Stack frame
        handlers: Dictionary of shutdown handlers to call
    """
    if handlers is None:
        handlers = _shutdown_handlers
    
    signal_name = "UNKNOWN"
    if sig == signal.SIGTERM:
        signal_name = "SIGTERM"
    elif sig == signal.SIGINT:
        signal_name = "SIGINT"
    
    logger.info(f"Received signal {signal_name} ({sig}). Shutting down gracefully...")
    
    # Call registered shutdown handlers
    for name, handler in handlers.items():
        try:
            logger.info(f"Running shutdown handler: {name}")
            handler()
        except Exception as e:
            logger.error(f"Error in shutdown handler {name}: {e}")
    
    # Flush logs
    logging.shutdown()
    
    # Exit with success code
    logger.info("Shutdown complete. Exiting.")
    sys.exit(0)


def register_shutdown_handler(name: str, handler: Callable) -> None:
    """
    Register a shutdown handler to be called during graceful shutdown.
    
    Args:
        name: Name of the handler for identification
        handler: Function to call during shutdown
    """
    if name in _shutdown_handlers:
        logger.warning(f"Overwriting existing shutdown handler: {name}")
    
    _shutdown_handlers[name] = handler
    logger.debug(f"Registered shutdown handler: {name}")


def register_signal_handlers() -> None:
    """
    Register signal handlers for graceful shutdown in Docker containers.
    
    This function sets up handlers for SIGTERM and SIGINT to ensure proper
    resource cleanup when a container is stopped.
    """
    # Create a partial function with the current handlers
    handler = partial(shutdown_handler, handlers=_shutdown_handlers.copy())
    
    # Register signal handlers
    signal.signal(signal.SIGTERM, handler)
    signal.signal(signal.SIGINT, handler)
    
    logger.info("Registered container signal handlers for graceful shutdown")


def register_database_shutdown_handler(engine) -> None:
    """
    Register a shutdown handler for database connections.
    
    Args:
        engine: SQLAlchemy engine to dispose during shutdown
    """
    def dispose_engine():
        logger.info("Closing database connections...")
        engine.dispose()
    
    register_shutdown_handler("database", dispose_engine)


def register_async_shutdown_handler(loop: Optional[asyncio.AbstractEventLoop] = None) -> None:
    """
    Register a shutdown handler for asyncio event loop.
    
    Args:
        loop: Asyncio event loop to close during shutdown (defaults to current loop)
    """
    if loop is None:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            logger.warning("No asyncio event loop available to register for shutdown")
            return
    
    def shutdown_asyncio():
        logger.info("Shutting down asyncio event loop...")
        
        # Cancel all running tasks
        pending = asyncio.all_tasks(loop=loop)
        for task in pending:
            task.cancel()
        
        # Run the event loop until all tasks are cancelled
        if pending:
            loop.run_until_complete(asyncio.gather(*pending, return_exceptions=True))
        
        # Close the loop
        loop.close()
    
    register_shutdown_handler("asyncio", shutdown_asyncio)


def setup_container_health_check(app, health_check_path: str = "/health") -> None:
    """
    Set up a health check endpoint for container orchestration.
    
    Args:
        app: FastAPI application
        health_check_path: URL path for the health check endpoint
    """
    from fastapi import FastAPI, status
    
    if not isinstance(app, FastAPI):
        logger.error("Cannot setup health check: app is not a FastAPI instance")
        return
    
    @app.get(health_check_path, status_code=status.HTTP_200_OK)
    async def health_check():
        """
        Container health check endpoint.
        
        This endpoint allows container orchestration platforms to check if
        the application is healthy and ready to receive traffic.
        """
        return {"status": "healthy", "timestamp": time.time()}
    
    logger.info(f"Container health check endpoint registered at {health_check_path}")


def add_container_middleware(app) -> None:
    """
    Add middleware for container-specific functionality.
    
    Args:
        app: FastAPI application
    """
    from fastapi import FastAPI, Request, Response
    import time
    
    if not isinstance(app, FastAPI):
        logger.error("Cannot add container middleware: app is not a FastAPI instance")
        return
    
    @app.middleware("http")
    async def add_container_headers(request: Request, call_next):
        """
        Add container-specific headers to responses.
        
        This middleware adds headers that can be useful for debugging and tracing
        in container environments.
        """
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # Add container information headers
            process_time = time.time() - start_time
            hostname = socket.gethostname()
            container_id = os.environ.get("HOSTNAME", "unknown")
            
            response.headers["X-Container-ID"] = container_id
            response.headers["X-Container-Hostname"] = hostname
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
        except Exception as e:
            logger.error(f"Error processing request in container: {e}")
            process_time = time.time() - start_time
            
            # Return error response
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=500,
                content={
                    "error": {
                        "code": "CONTAINER_ERROR",
                        "message": "Internal server error in container",
                        "detail": str(e) if app.debug else None,
                        "process_time": process_time,
                        "container_id": os.environ.get("HOSTNAME", "unknown")
                    }
                }
            )
    
    logger.info("Container middleware added to application")