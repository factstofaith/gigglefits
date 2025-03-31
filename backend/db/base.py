"""
Base database models and utilities using SQLAlchemy.
"""

import os
import logging
from contextlib import contextmanager
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from sqlalchemy.pool import QueuePool
from datetime import datetime
from typing import Optional, List, Dict, Any, Generator

# Configure logging
logger = logging.getLogger(__name__)

# Get database connection string from environment variable
# Default to SQLite for local development if not provided
# For Docker Compose setup use: "postgresql://postgres:postgres@db:5432/tap_db"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tap_local.db")

# Import settings from core config
from core.config import settings

# Import the enhanced connection pool manager
from utils.db.optimization import ConnectionPoolManager

# Create base class for declarative models
Base = declarative_base()

# Create ConnectionPoolManager instance for advanced connection pooling
# This provides auto-scaling, tenant isolation, and comprehensive monitoring
connection_manager = ConnectionPoolManager(
    db_url=settings.DATABASE_URL,
    min_pool_size=settings.DB_POOL_SIZE,
    max_pool_size=settings.DB_POOL_SIZE * 3,  # Allow scaling up to 3x the minimum size
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=1800,  # Recycle connections after 30 minutes
    pool_pre_ping=True,  # Enable connection health checks
    enable_tenant_isolation=True,  # Enable tenant-specific connection pools
    enable_auto_scaling=True,  # Enable automatic pool size adjustment
    metrics_window=300,  # 5-minute window for metrics collection
    scaling_check_interval=300,  # Check pool sizing every 5 minutes
    echo=settings.ENABLE_SQL_LOGGING  # Log SQL statements based on config
)

# Get default engine from the connection manager
engine = connection_manager.get_engine('default')

# Use connection manager's session factory
SessionLocal = connection_manager.get_session_maker('default')

# Dependency to get db session for FastAPI endpoints
def get_db(tenant_id: str = 'default') -> Generator[Session, None, None]:
    """
    Create and yield a database session for use in FastAPI endpoint dependencies.
    The session is automatically closed when the endpoint function returns or raises an exception.
    
    Args:
        tenant_id: The tenant identifier for multi-tenant isolation
    
    Yields:
        SQLAlchemy Session instance
    """
    db = connection_manager.get_session_maker(tenant_id)()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error for tenant {tenant_id}: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

# Context manager for using db sessions in scripts and background tasks
@contextmanager
def get_db_context(tenant_id: str = 'default'):
    """
    Context manager for database sessions outside of FastAPI endpoints.
    Use with 'with get_db_context() as db:' to ensure proper session cleanup.
    
    Args:
        tenant_id: The tenant identifier for multi-tenant isolation
    
    Yields:
        SQLAlchemy Session instance
    """
    # Use the connection manager's session scope
    with connection_manager.session_scope(tenant_id) as db:
        yield db

# Function to initialize database and run migrations
def initialize_db():
    """
    Initialize the database by creating tables and running migrations.
    Should be called when the application starts.
    """
    from db.run_migrations import run_migrations
    from sqlalchemy import inspect
    
    logger.info("Initializing database...")
    try:
        # Run migrations to create/update tables
        run_migrations()
        logger.info("Database migrations complete")
        
        # Validate required tables exist
        inspector = inspect(engine)
        required_tables = [
            "tenants", 
            "tenant_application_associations", 
            "tenant_dataset_associations",
            "applications",
            "datasets",
            "integrations",
            "webhook_logs"
        ]
        
        existing_tables = inspector.get_table_names()
        missing_tables = [table for table in required_tables if table not in existing_tables]
        
        if missing_tables:
            logger.warning(f"Missing required tables: {', '.join(missing_tables)}")
            logger.warning("Some application features may not work correctly")
        else:
            logger.info("All required tables validated successfully")
        
        # Check tenant associations have correct foreign keys
        if "tenant_application_associations" in existing_tables:
            fks = inspector.get_foreign_keys("tenant_application_associations")
            fk_cols = {fk['constrained_columns'][0] for fk in fks}
            if "tenant_id" not in fk_cols or "application_id" not in fk_cols:
                logger.warning("tenant_application_associations table has incorrect foreign key structure")
        
        if "tenant_dataset_associations" in existing_tables:
            fks = inspector.get_foreign_keys("tenant_dataset_associations")
            fk_cols = {fk['constrained_columns'][0] for fk in fks}
            if "tenant_id" not in fk_cols or "dataset_id" not in fk_cols:
                logger.warning("tenant_dataset_associations table has incorrect foreign key structure")
        
        # Perform database health check
        health = connection_manager.health_check()
        logger.info(f"Database health check: {health['status']}")
        
        logger.info("Database initialization complete")
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise

# Get database connection metrics for monitoring
def get_db_metrics(tenant_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Get connection pool metrics for monitoring.
    
    Args:
        tenant_id: The tenant identifier (None for all tenants)
    
    Returns:
        Dictionary with connection pool metrics
    """
    return connection_manager.get_metrics(tenant_id)

# Perform database health check
def db_health_check(tenant_id: str = 'default') -> Dict[str, Any]:
    """
    Perform health check on the database connection.
    
    Args:
        tenant_id: The tenant identifier
    
    Returns:
        Dictionary with health check results
    """
    return connection_manager.health_check(tenant_id)

# Optimize connection pool size based on usage patterns
def optimize_connection_pool(tenant_id: str = 'default') -> Dict[str, Any]:
    """
    Get recommendations for optimal connection pool size.
    
    Args:
        tenant_id: The tenant identifier
    
    Returns:
        Dictionary with pool sizing recommendations
    """
    return connection_manager.metrics.get_pool_sizing_recommendation(tenant_id)

# Prune stale database connections
def prune_stale_connections(tenant_id: Optional[str] = None) -> int:
    """
    Prune stale connections from the connection pool.
    
    Args:
        tenant_id: The tenant identifier (None for all tenants)
    
    Returns:
        Number of connections pruned
    """
    return connection_manager.prune_stale_connections(tenant_id)