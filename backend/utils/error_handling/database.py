"""
Database-specific error handling utilities.

This module provides error handling utilities for database operations,
focusing on ensuring reliability in containerized environments.
"""

import os
import time
import logging
import functools
from typing import Optional, Any, Callable, TypeVar, cast
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.exc import (
    SQLAlchemyError, 
    IntegrityError, 
    OperationalError, 
    ProgrammingError,
    DisconnectionError,
    DatabaseError as SQLAlchemyDatabaseError
)

from .exceptions import (
    DatabaseError,
    DatabaseConnectionError,
    DatabaseQueryError,
    DatabaseIntegrityError
)

# Setup logging
logger = logging.getLogger(__name__)

# Type definitions for function decoration
F = TypeVar('F', bound=Callable[..., Any])


def create_db_engine_with_retry(
    db_url: Optional[str] = None, 
    max_retries: int = 5, 
    retry_interval: int = 2,
    **engine_kwargs
):
    """
    Create a database engine with retry logic for container environments.
    
    This function creates a SQLAlchemy engine with retry logic to handle
    temporary connection issues that can occur in containerized environments.
    
    Args:
        db_url: Database URL (defaults to DATABASE_URL environment variable)
        max_retries: Maximum number of connection attempts
        retry_interval: Seconds to wait between retries
        **engine_kwargs: Additional keyword arguments for SQLAlchemy create_engine
        
    Returns:
        SQLAlchemy engine
        
    Raises:
        DatabaseConnectionError: If the connection cannot be established after retries
        ValueError: If the database URL is not provided or found in environment
    """
    # Get database URL from environment if not provided
    if db_url is None:
        db_url = os.environ.get("DATABASE_URL")
        if not db_url:
            raise ValueError(
                "DATABASE_URL environment variable is not set and no URL was provided"
            )
    
    # Set default engine arguments for better container performance
    default_engine_kwargs = {
        "pool_pre_ping": True,
        "pool_recycle": 300,  # 5 minutes
        "pool_size": 5,
        "max_overflow": 10,
        "echo": False
    }
    
    # Override defaults with provided arguments
    engine_kwargs = {**default_engine_kwargs, **engine_kwargs}
    
    retries = 0
    last_error = None
    
    while retries < max_retries:
        try:
            engine = create_engine(db_url, **engine_kwargs)
            # Test the connection
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            
            logger.info(f"Successfully connected to database")
            return engine
            
        except (OperationalError, DisconnectionError) as e:
            last_error = e
            retries += 1
            logger.warning(
                f"Failed to connect to database (attempt {retries}/{max_retries}): {e}"
            )
            time.sleep(retry_interval)
    
    # If we get here, all retries failed
    logger.error(f"Failed to connect to database after {max_retries} attempts: {last_error}")
    raise DatabaseConnectionError(
        message=f"Failed to connect to database after {max_retries} attempts",
        original_error=last_error
    )


def handle_db_error(error: Exception) -> Exception:
    """
    Convert SQLAlchemy exceptions to application-specific exceptions.
    
    This function translates SQLAlchemy-specific exceptions into application-defined
    exceptions for consistent error handling.
    
    Args:
        error: Original SQLAlchemy exception
        
    Returns:
        Converted application exception
    """
    if isinstance(error, IntegrityError):
        return DatabaseIntegrityError(
            message="Database integrity constraint violated",
            original_error=error
        )
    elif isinstance(error, OperationalError):
        return DatabaseConnectionError(
            message="Database connection error",
            original_error=error
        )
    elif isinstance(error, (ProgrammingError, SQLAlchemyError)):
        return DatabaseQueryError(
            message="Database query error",
            original_error=error
        )
    else:
        return DatabaseError(
            message="Unexpected database error",
            original_error=error
        )


@contextmanager
def db_transaction(session: Session, commit: bool = True):
    """
    Context manager for handling database transactions.
    
    This context manager ensures proper transaction handling with
    consistent error management and automatic rollback on exceptions.
    
    Args:
        session: SQLAlchemy session to use for the transaction
        commit: Whether to commit the transaction if successful (default: True)
        
    Yields:
        The provided session
        
    Raises:
        DatabaseError: If a database error occurs during the transaction
    """
    try:
        yield session
        if commit:
            session.commit()
    except Exception as e:
        session.rollback()
        if isinstance(e, SQLAlchemyError):
            db_error = handle_db_error(e)
            logger.error(f"Database error in transaction: {db_error}")
            raise db_error
        else:
            logger.error(f"Non-database error in transaction: {e}")
            raise
    finally:
        if commit:
            session.close()


def with_db_error_handling(func: F) -> F:
    """
    Decorator for handling database errors in functions.
    
    This decorator wraps functions that perform database operations to ensure
    consistent error handling.
    
    Args:
        func: Function to decorate
        
    Returns:
        Decorated function that handles database errors
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except SQLAlchemyError as e:
            db_error = handle_db_error(e)
            logger.error(f"Database error in {func.__name__}: {db_error}")
            raise db_error
    
    return cast(F, wrapper)


def with_async_db_error_handling(func: F) -> F:
    """
    Decorator for handling database errors in async functions.
    
    This decorator wraps async functions that perform database operations to ensure
    consistent error handling.
    
    Args:
        func: Async function to decorate
        
    Returns:
        Decorated async function that handles database errors
    """
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except SQLAlchemyError as e:
            db_error = handle_db_error(e)
            logger.error(f"Database error in async {func.__name__}: {db_error}")
            raise db_error
    
    return cast(F, wrapper)


def setup_db_health_check(app, engine, health_check_path: str = "/db/health") -> None:
    """
    Set up a database health check endpoint.
    
    Args:
        app: FastAPI application
        engine: SQLAlchemy engine to check
        health_check_path: URL path for the health check endpoint
    """
    from fastapi import FastAPI, status, HTTPException
    
    if not isinstance(app, FastAPI):
        logger.error("Cannot setup DB health check: app is not a FastAPI instance")
        return
    
    @app.get(health_check_path, status_code=status.HTTP_200_OK)
    async def db_health_check():
        """
        Database health check endpoint.
        
        This endpoint verifies that the database connection is working.
        """
        try:
            # Run a simple query to check the connection
            with engine.connect() as conn:
                result = conn.execute("SELECT 1").scalar()
                if result != 1:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Database health check failed"
                    )
                
                return {
                    "status": "healthy", 
                    "database": "connected",
                    "timestamp": time.time()
                }
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database health check failed: {str(e)}"
            )
    
    logger.info(f"Database health check endpoint registered at {health_check_path}")