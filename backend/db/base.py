"""
Database module with SQLAlchemy session management and connection pooling.

This module provides database connection and session management optimized for Docker environments:
- Connection pooling with Docker-specific configuration
- Health check support for container orchestration
- Graceful connection handling during container shutdown
- Monitoring and metrics collection for database connections
"""

import os
import logging
import time
from contextlib import contextmanager
from typing import Generator, Dict, Any, Optional
from sqlalchemy import create_engine, inspect, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.engine import Engine

# Configure logging
logger = logging.getLogger(__name__)

# Create declarative base class for models
Base = declarative_base()

# Import settings
from core.config_factory import ConfigFactory, get_config
settings = get_config()

# Default singleton engine and session factory
_engine = None
_SessionLocal = None

# Track connection usage for metrics
_connection_stats = {
    "created": 0,
    "checked_out": 0,
    "checked_in": 0,
    "errors": 0,
}

# Docker-specific pool configuration
def get_docker_pool_config() -> Dict[str, Any]:
    """
    Get connection pool configuration optimized for Docker environments.
    
    In Docker containers, we need special configuration for connection pools
    to ensure proper resource usage and graceful shutdown.
    
    Returns:
        Dict with connection pool configuration
    """
    # Check if running in Docker
    in_docker = settings.is_docker()
    
    # Base configuration
    config = {
        "pool_size": settings.DB_POOL_SIZE,
        "max_overflow": settings.DB_MAX_OVERFLOW,
        "pool_timeout": settings.DB_POOL_TIMEOUT,
        "pool_pre_ping": True,
        "pool_recycle": 1800,  # 30 minutes
    }
    
    # Docker-specific optimizations
    if in_docker:
        # Get Docker configuration
        docker_settings = settings.docker
        
        # In Docker we want to be more conservative with resources
        # but ensure connections are recycled more frequently to prevent staleness
        config.update({
            "pool_size": min(settings.DB_POOL_SIZE, 10),  # Limit max pool size in containers
            "max_overflow": min(settings.DB_MAX_OVERFLOW, 20),  # More conservative overflow
            "pool_timeout": min(settings.DB_POOL_TIMEOUT, 30),  # Shorter timeout
            "pool_recycle": 900,  # 15 minutes - recycle more frequently in containers
        })
        
        logger.info(f"Using Docker-optimized connection pool configuration: {config}")
    
    return config

# Create engine with appropriate configuration
def get_engine() -> Engine:
    """
    Create SQLAlchemy engine with Docker-aware configuration.
    
    Returns:
        SQLAlchemy Engine instance
    """
    global _engine
    
    if _engine is not None:
        return _engine
    
    db_url = settings.DATABASE_URL
    
    # Get connection pool configuration
    pool_config = get_docker_pool_config()
    
    # Configure additional connection args
    connect_args = {}
    if "sqlite" in db_url:
        connect_args["check_same_thread"] = False
    elif "postgresql" in db_url and settings.DB_SSL_REQUIRED:
        connect_args["sslmode"] = "require"
    
    # Create engine with proper configuration
    _engine = create_engine(
        db_url,
        echo=settings.DB_ECHO if hasattr(settings, "DB_ECHO") else False,
        pool_size=pool_config["pool_size"],
        max_overflow=pool_config["max_overflow"],
        pool_timeout=pool_config["pool_timeout"],
        pool_recycle=pool_config["pool_recycle"],
        pool_pre_ping=pool_config["pool_pre_ping"],
        connect_args=connect_args
    )
    
    # Set up event listeners for monitoring
    _setup_engine_events(_engine)
    
    logger.info(f"Created database engine with pool_size={pool_config['pool_size']}, "
               f"max_overflow={pool_config['max_overflow']}")
    
    return _engine

# Set up event listeners for engine monitoring
def _setup_engine_events(engine: Engine) -> None:
    """
    Set up SQLAlchemy event listeners for connection monitoring.
    
    Args:
        engine: SQLAlchemy Engine instance
    """
    @event.listens_for(engine, "checkout")
    def on_checkout(dbapi_conn, conn_record, conn_proxy):
        """Track connection checkout for metrics"""
        _connection_stats["checked_out"] += 1
        logger.debug(f"Database connection checked out (active: {_connection_stats['checked_out'] - _connection_stats['checked_in']})")
    
    @event.listens_for(engine, "checkin")
    def on_checkin(dbapi_conn, conn_record):
        """Track connection checkin for metrics"""
        _connection_stats["checked_in"] += 1
        logger.debug(f"Database connection checked in (active: {_connection_stats['checked_out'] - _connection_stats['checked_in']})")
    
    @event.listens_for(engine, "connect")
    def on_connect(dbapi_conn, conn_record):
        """Track connection creation for metrics"""
        _connection_stats["created"] += 1
        logger.debug(f"Database connection created (total: {_connection_stats['created']})")
    
    @event.listens_for(engine, "invalidate")
    def on_invalidate(dbapi_conn, conn_record, exception):
        """Track connection invalidation (errors)"""
        _connection_stats["errors"] += 1
        logger.warning(f"Database connection invalidated: {exception}")

# Get a sessionmaker for the database
def get_session_factory() -> sessionmaker:
    """
    Get a SQLAlchemy sessionmaker for the database.
    
    Returns:
        SQLAlchemy sessionmaker instance
    """
    global _SessionLocal
    
    if _SessionLocal is None:
        engine = get_engine()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    return _SessionLocal

# Dependency to get db session for FastAPI endpoints
def get_db_session() -> Generator[Session, None, None]:
    """
    Get a database session for use in FastAPI endpoint dependencies.
    Ensures proper connection cleanup after request processing.
    
    Yields:
        SQLAlchemy Session instance
    """
    SessionLocal = get_session_factory()
    db = SessionLocal()
    start_time = time.time()
    
    try:
        yield db
    finally:
        # Close the session to return connection to pool
        db.close()
        
        # Log session duration for monitoring
        duration = time.time() - start_time
        if duration > 1.0:  # Log slow queries
            logger.warning(f"Slow database session detected: {duration:.2f}s")
        else:
            logger.debug(f"Database session completed in {duration:.2f}s")

# Context manager for database sessions (for use outside of FastAPI)
@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.
    Ensures proper transaction management and connection cleanup.
    
    Yields:
        SQLAlchemy Session instance
    """
    SessionLocal = get_session_factory()
    db = SessionLocal()
    start_time = time.time()
    
    try:
        yield db
        db.commit()
    except Exception as e:
        logger.error(f"Database error in context manager: {str(e)}")
        db.rollback()
        raise
    finally:
        # Close the session to return connection to pool
        db.close()
        
        # Log session duration for monitoring
        duration = time.time() - start_time
        if duration > 1.0:  # Log slow queries
            logger.warning(f"Slow database session detected: {duration:.2f}s")
        else:
            logger.debug(f"Database session completed in {duration:.2f}s")

# Function to check database health
def db_health_check() -> dict:
    """
    Perform a health check on the database connection.
    
    Returns:
        Dict with database health status
    """
    try:
        # Create a new session
        SessionLocal = get_session_factory()
        db = SessionLocal()
        
        start_time = time.time()
        
        # Execute a simple query
        db.execute(text("SELECT 1"))
        
        # Calculate query time
        query_time = time.time() - start_time
        
        # Get connection pool statistics
        engine = get_engine()
        pool_stats = {
            "connections_in_use": _connection_stats["checked_out"] - _connection_stats["checked_in"],
            "total_connections_created": _connection_stats["created"],
            "total_checkouts": _connection_stats["checked_out"],
            "total_checkins": _connection_stats["checked_in"],
            "connection_errors": _connection_stats["errors"],
            "pool_size": engine.pool.size(),
            "pool_checkedin": engine.pool.checkedin(),
            "pool_overflow": engine.pool.overflow(),
            "pool_checkedout": engine.pool.checkedout(),
        }
        
        # Close the session
        db.close()
        
        # Return status with metrics
        return {
            "status": "ok",
            "message": "Database connection successful",
            "query_time_ms": int(query_time * 1000),
            "database_type": db_url.split("://")[0] if (db_url := os.environ.get("DATABASE_URL")) else "unknown",
            "pool_stats": pool_stats,
            "in_docker": settings.is_docker()
        }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return {
            "status": "error",
            "message": f"Database connection failed: {str(e)}"
        }

# Function to close all database connections
def close_all_connections() -> None:
    """
    Close all database connections for graceful shutdown.
    This should be called during container shutdown to ensure
    all database connections are properly closed.
    """
    global _engine
    
    if _engine is not None:
        logger.info("Closing all database connections...")
        _engine.dispose()
        logger.info("All database connections closed")
        
        # Reset engine for potential restart
        _engine = None

# Register shutdown handler with signal_handlers module
def register_db_shutdown_handler() -> None:
    """
    Register database shutdown handler with signal_handlers.
    This ensures proper database cleanup during container shutdown.
    """
    try:
        from utils.signal_handlers import register_shutdown_handler
        register_shutdown_handler("database", close_all_connections)
        logger.info("Registered database shutdown handler")
    except ImportError:
        logger.warning("Could not register database shutdown handler: signal_handlers module not found")
    except Exception as e:
        logger.error(f"Error registering database shutdown handler: {str(e)}")

# Initialize shutdown handler on module import
if settings.is_docker():
    register_db_shutdown_handler()