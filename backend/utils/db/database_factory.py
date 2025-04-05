"""
Database Factory Module for TAP Integration Platform

This module provides a standardized factory for database access across the application.
It ensures consistent database access patterns, connection management, and configuration.
"""

import logging
from typing import Dict, Any, Type, Optional, Callable, List
from functools import lru_cache
from sqlalchemy.orm import Session
from pydantic import BaseModel

from db.base import get_db_context, Base, get_engine
from core.config_factory import ConfigFactory
from utils.db.service import DatabaseService
from utils.error_handling.exceptions import DatabaseError

# Configure logging
logger = logging.getLogger(__name__)


class DatabaseFactory:
    """
    Factory for standardized database access across the application.
    
    This class provides:
    1. Standardized service creation for different models
    2. Connection management with proper error handling
    3. Configuration and optimization for different environments
    """
    
    # Cache of database services
    _services: Dict[str, DatabaseService] = {}
    
    @classmethod
    def get_service(cls, model_class: Type[Base], schema_class: Type[BaseModel] = None) -> DatabaseService:
        """
        Get or create a database service for a model class.
        
        Args:
            model_class: SQLAlchemy model class
            schema_class: Optional Pydantic model class for validation
            
        Returns:
            Database service for the model class
        """
        model_name = model_class.__name__
        
        # Check cache first
        if model_name in cls._services:
            return cls._services[model_name]
        
        # Create new service
        service = DatabaseService(model_class, schema_class)
        cls._services[model_name] = service
        
        logger.debug(f"Created database service for {model_name}")
        return service
    
    @staticmethod
    def with_transaction(operations: List[Callable[[Session], Any]]) -> List[Any]:
        """
        Execute multiple operations in a single transaction.
        
        Args:
            operations: List of callables that take a session and return a result
            
        Returns:
            List of results from operations
            
        Raises:
            DatabaseError: On database errors
        """
        results = []
        
        with get_db_context() as db:
            try:
                for operation in operations:
                    result = operation(db)
                    results.append(result)
                
                # Transaction will be committed automatically at context exit
                
            except Exception as e:
                logger.error(f"Transaction error: {str(e)}")
                db.rollback()
                raise DatabaseError(f"Transaction error: {str(e)}")
        
        return results
    
    @staticmethod
    @lru_cache(maxsize=1)
    def get_connection_config() -> Dict[str, Any]:
        """
        Get standardized database connection configuration.
        
        Returns:
            Dictionary with connection configuration
        """
        # Get application config
        config = ConfigFactory.get_config()
        
        # Default connection params
        connection_params = {
            "connection_timeout": 30,
            "echo": config.DB_ECHO if hasattr(config, "DB_ECHO") else False,
            "pool_size": config.DB_POOL_SIZE if hasattr(config, "DB_POOL_SIZE") else 5,
            "max_overflow": config.DB_MAX_OVERFLOW if hasattr(config, "DB_MAX_OVERFLOW") else 10,
            "pool_recycle": 1800,  # 30 minutes
            "pool_pre_ping": True
        }
        
        # Docker-specific optimizations
        if config.is_docker():
            # In Docker environments, we use more conservative resource settings
            connection_params.update({
                "pool_size": min(connection_params["pool_size"], 10),
                "max_overflow": min(connection_params["max_overflow"], 20),
                "pool_recycle": 900,  # 15 minutes
                "connection_timeout": 10
            })
        
        logger.debug(f"Database connection configuration: {connection_params}")
        return connection_params
    
    @staticmethod
    def check_database_health() -> Dict[str, Any]:
        """
        Check database health and connection status.
        
        Returns:
            Dictionary with health check results
        """
        try:
            # Get engine to ensure pool is initialized
            engine = get_engine()
            
            # Execute simple query to test connection
            with engine.connect() as conn:
                conn.execute(engine.dialect.text("SELECT 1"))
            
            # Get pool statistics
            pool_stats = {
                "pool_size": engine.pool.size(),
                "overflow": engine.pool.overflow(),
                "checkedin": engine.pool.checkedin(),
                "checkedout": engine.pool.checkedout(),
            }
            
            return {
                "status": "healthy",
                "message": "Database connection is healthy",
                "pool_stats": pool_stats,
                "database_url": "***" + str(engine.url)[-20:],  # Safely truncated URL
                "dialect": engine.dialect.name,
            }
            
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "message": f"Database connection failed: {str(e)}",
                "error": str(e)
            }

    @staticmethod
    def register_shutdown_handlers():
        """Register database shutdown handlers for graceful cleanup."""
        from db.base import register_db_shutdown_handler
        register_db_shutdown_handler()
        logger.info("Registered database shutdown handlers")


# Initialize on module import
DatabaseFactory.register_shutdown_handlers()