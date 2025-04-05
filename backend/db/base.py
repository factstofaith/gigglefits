"""
Database module with SQLAlchemy session management and connection pooling.
"""

import os
import logging
from contextlib import contextmanager
from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

# Configure logging
logger = logging.getLogger(__name__)

# Create declarative base class for models
Base = declarative_base()

# Import settings
from core.config import get_settings
settings = get_settings()

# Create engine with appropriate configuration
def get_engine():
    """Create SQLAlchemy engine with correct configuration"""
    db_url = settings.DATABASE_URL
    
    # Configure engine with proper connection parameters
    engine = create_engine(
        db_url,
        echo=settings.DB_ECHO if hasattr(settings, "DB_ECHO") else False,
        pool_size=getattr(settings, "DB_POOL_SIZE", 5),
        max_overflow=getattr(settings, "DB_MAX_OVERFLOW", 10),
        pool_timeout=getattr(settings, "DB_POOL_TIMEOUT", 30),
        pool_pre_ping=True,
        connect_args={
            "check_same_thread": False
        } if "sqlite" in db_url else {}
    )
    
    return engine

# Create engine instance
engine = get_engine()

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get db session for FastAPI endpoints
def get_db_session() -> Generator[Session, None, None]:
    """
    Get a database session for use in FastAPI endpoint dependencies.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Context manager for database sessions (for use outside of FastAPI)
@contextmanager
def get_db_context():
    """Context manager for database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to check database health
def db_health_check() -> dict:
    """
    Perform a health check on the database connection.
    
    Returns:
        Dict with database health status
    """
    try:
        # Create a new session
        db = SessionLocal()
        
        # Execute a simple query
        db.execute("SELECT 1")
        
        # Close the session
        db.close()
        
        return {
            "status": "ok",
            "message": "Database connection successful"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return {
            "status": "error",
            "message": f"Database connection failed: {str(e)}"
        }