"""
Database Service Module for TAP Integration Platform

This module provides a standardized approach to database operations,
with consistent error handling, transaction management, and service pattern.
It implements a repository/service pattern for database access.
"""

import logging
from typing import TypeVar, Generic, Type, List, Dict, Any, Optional, Union, Callable
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, OperationalError
from sqlalchemy import func, select, text
from datetime import datetime, timezone
from pydantic import BaseModel

from db.base import get_db_context
from db.base import Base
from utils.error_handling.exceptions import DatabaseError, ValidationError, NotFoundError

# Configure logging
logger = logging.getLogger(__name__)

# Type variables for generics
T = TypeVar('T', bound=Base)  # SQL Alchemy model
M = TypeVar('M', bound=BaseModel)  # Pydantic model

class DatabaseService(Generic[T, M]):
    """
    Generic database service implementing the repository pattern for consistent
    database access across the application.
    
    This service provides standardized methods for CRUD operations with proper
    error handling, transaction management, and auditing.
    
    Attributes:
        model_class: SQLAlchemy model class
        schema_class: Pydantic model class for validation
    """
    
    def __init__(self, model_class: Type[T], schema_class: Type[M] = None):
        """
        Initialize database service with model class and optional schema class.
        
        Args:
            model_class: SQLAlchemy model class
            schema_class: Optional Pydantic model class for validation
        """
        self.model_class = model_class
        self.schema_class = schema_class
    
    def create(self, db: Session, obj_in: Union[Dict[str, Any], BaseModel], 
               user_id: Optional[str] = None) -> T:
        """
        Create a new database record with proper error handling.
        
        Args:
            db: Database session
            obj_in: Input data as dict or Pydantic model
            user_id: Optional user ID for auditing
            
        Returns:
            Created model instance
            
        Raises:
            DatabaseError: On database errors
            ValidationError: On validation errors
        """
        try:
            # Convert pydantic model to dict if necessary
            obj_data = obj_in if isinstance(obj_in, dict) else obj_in.dict(exclude_unset=True)
            
            # Add audit fields if user_id provided
            if user_id and hasattr(self.model_class, 'created_by'):
                obj_data['created_by'] = user_id
            
            # Create model instance
            db_obj = self.model_class(**obj_data)
            
            # Add to session and commit
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            
            logger.debug(f"Created {self.model_class.__name__} with ID: {getattr(db_obj, 'id', None)}")
            return db_obj
            
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Integrity error creating {self.model_class.__name__}: {str(e)}")
            if 'unique constraint' in str(e).lower() or 'duplicate key' in str(e).lower():
                raise ValidationError(f"A record with these values already exists: {str(e)}")
            raise DatabaseError(f"Database integrity error: {str(e)}")
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error creating {self.model_class.__name__}: {str(e)}")
            raise DatabaseError(f"Database error: {str(e)}")
    
    def get(self, db: Session, id: Any) -> Optional[T]:
        """
        Get a single record by ID with proper error handling.
        
        Args:
            db: Database session
            id: Record ID
            
        Returns:
            Model instance if found, None otherwise
            
        Raises:
            DatabaseError: On database errors
        """
        try:
            return db.query(self.model_class).filter(self.model_class.id == id).first()
            
        except SQLAlchemyError as e:
            logger.error(f"Database error retrieving {self.model_class.__name__} with ID {id}: {str(e)}")
            raise DatabaseError(f"Database error: {str(e)}")
    
    def get_or_404(self, db: Session, id: Any) -> T:
        """
        Get a single record by ID or raise 404 error.
        
        Args:
            db: Database session
            id: Record ID
            
        Returns:
            Model instance
            
        Raises:
            NotFoundError: If record not found
            DatabaseError: On database errors
        """
        obj = self.get(db, id)
        if not obj:
            raise NotFoundError(f"{self.model_class.__name__} with ID {id} not found")
        return obj
    
    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100, 
                 filters: Optional[Dict[str, Any]] = None) -> List[T]:
        """
        Get multiple records with pagination and filtering.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Optional dictionary of filters
            
        Returns:
            List of model instances
            
        Raises:
            DatabaseError: On database errors
        """
        try:
            query = db.query(self.model_class)
            
            # Apply filters if provided
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model_class, field):
                        query = query.filter(getattr(self.model_class, field) == value)
            
            # Apply pagination
            return query.offset(skip).limit(limit).all()
            
        except SQLAlchemyError as e:
            logger.error(f"Database error retrieving multiple {self.model_class.__name__} records: {str(e)}")
            raise DatabaseError(f"Database error: {str(e)}")
    
    def get_count(self, db: Session, *, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Get count of records with optional filtering.
        
        Args:
            db: Database session
            filters: Optional dictionary of filters
            
        Returns:
            Count of records
            
        Raises:
            DatabaseError: On database errors
        """
        try:
            query = db.query(func.count(self.model_class.id))
            
            # Apply filters if provided
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model_class, field):
                        query = query.filter(getattr(self.model_class, field) == value)
            
            return query.scalar() or 0
            
        except SQLAlchemyError as e:
            logger.error(f"Database error counting {self.model_class.__name__} records: {str(e)}")
            raise DatabaseError(f"Database error: {str(e)}")
    
    def update(self, db: Session, *, db_obj: T, obj_in: Union[Dict[str, Any], BaseModel], 
              user_id: Optional[str] = None) -> T:
        """
        Update an existing record.
        
        Args:
            db: Database session
            db_obj: Existing database object
            obj_in: Input data as dict or Pydantic model
            user_id: Optional user ID for auditing
            
        Returns:
            Updated model instance
            
        Raises:
            DatabaseError: On database errors
        """
        try:
            # Convert input to dict if needed
            update_data = obj_in if isinstance(obj_in, dict) else obj_in.dict(exclude_unset=True)
            
            # Add audit fields if user_id provided and model has relevant fields
            if user_id and hasattr(self.model_class, 'updated_by'):
                update_data['updated_by'] = user_id
            
            # Add updated_at if not provided and model has this field
            if 'updated_at' not in update_data and hasattr(self.model_class, 'updated_at'):
                update_data['updated_at'] = datetime.now(timezone.utc)
            
            # Update model attributes
            for field, value in update_data.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            # Commit changes
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            
            logger.debug(f"Updated {self.model_class.__name__} with ID: {getattr(db_obj, 'id', None)}")
            return db_obj
            
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Integrity error updating {self.model_class.__name__}: {str(e)}")
            if 'unique constraint' in str(e).lower() or 'duplicate key' in str(e).lower():
                raise ValidationError(f"A record with these values already exists: {str(e)}")
            raise DatabaseError(f"Database integrity error: {str(e)}")
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error updating {self.model_class.__name__}: {str(e)}")
            raise DatabaseError(f"Database error: {str(e)}")
    
    def delete(self, db: Session, *, id: Any) -> bool:
        """
        Delete a record by ID.
        
        Args:
            db: Database session
            id: Record ID
            
        Returns:
            True if record was deleted, False if not found
            
        Raises:
            DatabaseError: On database errors
        """
        try:
            obj = db.query(self.model_class).filter(self.model_class.id == id).first()
            if not obj:
                return False
            
            db.delete(obj)
            db.commit()
            
            logger.debug(f"Deleted {self.model_class.__name__} with ID: {id}")
            return True
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error deleting {self.model_class.__name__} with ID {id}: {str(e)}")
            raise DatabaseError(f"Database error: {str(e)}")
    
    def execute_transaction(self, operations: List[Callable[[Session], Any]]) -> List[Any]:
        """
        Execute multiple operations in a single transaction.
        
        Args:
            operations: List of callables that take a session and return a result
            
        Returns:
            List of results from operations
            
        Raises:
            DatabaseError: On database errors
        """
        try:
            results = []
            
            with get_db_context() as db:
                for operation in operations:
                    result = operation(db)
                    results.append(result)
                
                # Transaction will be committed automatically if no exceptions
            
            return results
            
        except SQLAlchemyError as e:
            logger.error(f"Transaction error in {self.model_class.__name__} service: {str(e)}")
            raise DatabaseError(f"Transaction error: {str(e)}")
    
    def find_one(self, db: Session, *, filters: Dict[str, Any]) -> Optional[T]:
        """
        Find a single record matching the given filters.
        
        Args:
            db: Database session
            filters: Dictionary of field/value pairs
            
        Returns:
            Model instance if found, None otherwise
            
        Raises:
            DatabaseError: On database errors
        """
        try:
            query = db.query(self.model_class)
            
            # Apply filters
            for field, value in filters.items():
                if hasattr(self.model_class, field):
                    query = query.filter(getattr(self.model_class, field) == value)
            
            return query.first()
            
        except SQLAlchemyError as e:
            logger.error(f"Database error finding {self.model_class.__name__}: {str(e)}")
            raise DatabaseError(f"Database error: {str(e)}")
    
    def find_many(self, db: Session, *, filters: Dict[str, Any], 
                 skip: int = 0, limit: int = 100) -> List[T]:
        """
        Find records matching the given filters with pagination.
        
        Args:
            db: Database session
            filters: Dictionary of field/value pairs
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of model instances
            
        Raises:
            DatabaseError: On database errors
        """
        try:
            query = db.query(self.model_class)
            
            # Apply filters
            for field, value in filters.items():
                if hasattr(self.model_class, field):
                    query = query.filter(getattr(self.model_class, field) == value)
            
            # Apply pagination
            return query.offset(skip).limit(limit).all()
            
        except SQLAlchemyError as e:
            logger.error(f"Database error finding multiple {self.model_class.__name__} records: {str(e)}")
            raise DatabaseError(f"Database error: {str(e)}")

    def exists(self, db: Session, *, id: Any) -> bool:
        """
        Check if a record exists by ID.
        
        Args:
            db: Database session
            id: Record ID
            
        Returns:
            True if record exists, False otherwise
            
        Raises:
            DatabaseError: On database errors
        """
        try:
            return db.query(
                db.query(self.model_class).filter(self.model_class.id == id).exists()
            ).scalar()
            
        except SQLAlchemyError as e:
            logger.error(f"Database error checking existence of {self.model_class.__name__} with ID {id}: {str(e)}")
            raise DatabaseError(f"Database error: {str(e)}")

# Context manager for database transactions
class DatabaseTransaction:
    """
    Context manager for database transactions to ensure proper handling
    of transactions with consistent error handling and logging.
    
    Usage:
        with DatabaseTransaction() as db:
            # Perform database operations
            db.add(my_object)
    """
    
    def __init__(self):
        """Initialize transaction context manager."""
        self.db = None
    
    def __enter__(self) -> Session:
        """
        Enter transaction context.
        
        Returns:
            Database session
        """
        # Get session from context manager
        self.db = get_db_context().__enter__()
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        """
        Exit transaction context, handling errors and cleanup.
        
        Args:
            exc_type: Exception type if raised
            exc_val: Exception value if raised
            exc_tb: Exception traceback if raised
            
        Returns:
            True if exception was handled, False otherwise
        """
        # If exception occurred, log it
        if exc_type is not None:
            logger.error(f"Transaction error: {exc_val}")
            if self.db:
                self.db.rollback()
        
        # Use context manager's exit
        get_db_context().__exit__(exc_type, exc_val, exc_tb)
        
        # Don't suppress exceptions
        return False


# Async support will be added in future versions
# For now, here's a placeholder class
class AsyncDatabaseService:
    """
    Placeholder for async database service - will be implemented in future.
    """
    
    @staticmethod
    def not_implemented():
        """Placeholder method."""
        raise NotImplementedError("Async database service not yet implemented")