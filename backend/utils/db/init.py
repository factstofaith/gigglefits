"""
Database Initialization Module for TAP Integration Platform

This module provides standardized database initialization and setup utilities
for consistent database management across application components.
"""

import logging
import time
from typing import Optional, Dict, Any, List
from sqlalchemy import inspect, create_engine, text, Table, Column
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, OperationalError

from db.base import Base, get_engine, get_db_context
from core.config_factory import ConfigFactory

# Configure logging
logger = logging.getLogger(__name__)


class DatabaseInitializer:
    """
    Database initialization utilities for standardized setup.
    
    This class provides methods for:
    - Database creation
    - Schema initialization
    - Migration handling
    - Database verification
    - Health checks
    """
    
    @staticmethod
    def initialize_database(create_tables: bool = True) -> bool:
        """
        Initialize database with schema.
        
        Args:
            create_tables: Whether to create tables if they don't exist
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get engine
            engine = get_engine()
            
            # Create all tables if requested
            if create_tables:
                Base.metadata.create_all(engine)
                logger.info("Database tables created successfully")
            
            # Verify database connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                logger.info("Database connection verified")
            
            return True
            
        except SQLAlchemyError as e:
            logger.error(f"Database initialization error: {str(e)}")
            return False
    
    @staticmethod
    def verify_schema() -> Dict[str, Any]:
        """
        Verify database schema matches SQLAlchemy models.
        
        Returns:
            Dictionary with verification results
        """
        try:
            # Get engine
            engine = get_engine()
            inspector = inspect(engine)
            
            # Get model tables
            model_tables = {table_name for table_name in Base.metadata.tables.keys()}
            
            # Get database tables
            db_tables = set(inspector.get_table_names())
            
            # Compare
            missing_tables = model_tables - db_tables
            extra_tables = db_tables - model_tables
            matching_tables = model_tables.intersection(db_tables)
            
            # Verify columns in matching tables
            column_issues = []
            for table_name in matching_tables:
                db_columns = {col["name"] for col in inspector.get_columns(table_name)}
                model_columns = {col.name for col in Base.metadata.tables[table_name].columns}
                
                missing_columns = model_columns - db_columns
                if missing_columns:
                    column_issues.append({
                        "table": table_name,
                        "missing_columns": list(missing_columns)
                    })
            
            # Build result
            result = {
                "status": "ok" if not missing_tables and not column_issues else "issues",
                "missing_tables": list(missing_tables),
                "extra_tables": list(extra_tables),
                "matching_tables_count": len(matching_tables),
                "total_model_tables": len(model_tables),
                "total_db_tables": len(db_tables),
                "column_issues": column_issues
            }
            
            if result["status"] == "issues":
                logger.warning(f"Schema verification found issues: {result}")
            else:
                logger.info("Schema verification successful")
            
            return result
            
        except SQLAlchemyError as e:
            logger.error(f"Schema verification error: {str(e)}")
            return {
                "status": "error",
                "message": f"Schema verification failed: {str(e)}"
            }
    
    @staticmethod
    def check_connection_retry(max_retries: int = 5, retry_interval: int = 3) -> bool:
        """
        Check database connection with retry logic.
        
        Args:
            max_retries: Maximum number of connection attempts
            retry_interval: Seconds between retries
            
        Returns:
            True if connection successful, False otherwise
        """
        for attempt in range(1, max_retries + 1):
            try:
                # Get engine
                engine = get_engine()
                
                # Test connection
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                
                logger.info(f"Database connection succeeded on attempt {attempt}")
                return True
                
            except OperationalError as e:
                logger.warning(f"Database connection attempt {attempt}/{max_retries} failed: {str(e)}")
                
                # If not last attempt, wait and retry
                if attempt < max_retries:
                    time.sleep(retry_interval)
                else:
                    logger.error(f"Database connection failed after {max_retries} attempts")
                    return False
    
    @staticmethod
    def check_migrations() -> Dict[str, Any]:
        """
        Check if migrations are applied.
        
        Returns:
            Dictionary with migration status
        """
        try:
            # Get engine
            engine = get_engine()
            
            # Check if alembic_version table exists
            inspector = inspect(engine)
            has_migrations = "alembic_version" in inspector.get_table_names()
            
            if has_migrations:
                # Get current migration version
                with engine.connect() as conn:
                    result = conn.execute(text("SELECT version_num FROM alembic_version")).fetchone()
                    current_version = result[0] if result else None
                
                return {
                    "status": "ok",
                    "has_migrations": True,
                    "current_version": current_version
                }
            else:
                return {
                    "status": "warning",
                    "has_migrations": False,
                    "message": "No migrations found in database"
                }
            
        except SQLAlchemyError as e:
            logger.error(f"Migration check error: {str(e)}")
            return {
                "status": "error",
                "message": f"Migration check failed: {str(e)}"
            }
    
    @staticmethod
    def create_indexes(indexes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create indexes on database tables.
        
        Args:
            indexes: List of index specifications
                Each index spec should be a dict with:
                - table: Table name
                - name: Index name
                - columns: List of column names
                - unique: Whether the index is unique (optional)
            
        Returns:
            Dictionary with results
        """
        results = []
        successful = 0
        failed = 0
        
        try:
            # Get engine
            engine = get_engine()
            
            # Create each index
            for idx_spec in indexes:
                try:
                    table_name = idx_spec["table"]
                    index_name = idx_spec["name"]
                    columns = idx_spec["columns"]
                    unique = idx_spec.get("unique", False)
                    
                    # Check if index already exists
                    inspector = inspect(engine)
                    existing_indexes = inspector.get_indexes(table_name)
                    index_exists = any(idx["name"] == index_name for idx in existing_indexes)
                    
                    if index_exists:
                        results.append({
                            "table": table_name,
                            "index": index_name,
                            "status": "skipped",
                            "message": "Index already exists"
                        })
                        continue
                    
                    # Create the index
                    with engine.connect() as conn:
                        conn.execute(text(
                            f"CREATE {'UNIQUE ' if unique else ''}INDEX IF NOT EXISTS {index_name} "
                            f"ON {table_name} ({', '.join(columns)})"
                        ))
                    
                    results.append({
                        "table": table_name,
                        "index": index_name,
                        "status": "created",
                        "message": f"Created index on {', '.join(columns)}"
                    })
                    successful += 1
                    
                except Exception as e:
                    results.append({
                        "table": idx_spec.get("table", "unknown"),
                        "index": idx_spec.get("name", "unknown"),
                        "status": "error",
                        "message": str(e)
                    })
                    failed += 1
                    logger.error(f"Error creating index {idx_spec.get('name')}: {str(e)}")
            
            return {
                "status": "ok" if failed == 0 else "partial",
                "successful": successful,
                "failed": failed,
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Index creation error: {str(e)}")
            return {
                "status": "error",
                "message": f"Index creation failed: {str(e)}",
                "results": results
            }


# Initialize database connection pool on module import
def init_database_pool():
    """Initialize database connection pool on module import."""
    try:
        engine = get_engine()
        logger.info(f"Database connection pool initialized with size={engine.pool.size()}, "
                   f"max_overflow={engine.pool.overflow()}")
    except Exception as e:
        logger.error(f"Error initializing database pool: {str(e)}")

# Call initialization on module import
init_database_pool()