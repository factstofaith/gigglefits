"""
ErrorHandler Service

Comprehensive error handling framework for services
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from db.models import ErrorHandler as ErrorHandlerModel
from .models import ErrorHandlerCreate, ErrorHandlerUpdate

class ErrorHandlerService:
    """Service for errorhandler operations"""
    
    def __init__(self, db: Session):
        """Initialize with database session"""
        self.db = db
    
    def get_all(self, 
                skip: int = 0, 
                limit: int = 100, 
                tenant_id: Optional[str] = None) -> List[ErrorHandlerModel]:
        """
        Get all errorhandlers, optionally filtered by tenant.
        
        Args:
            skip: Number of records to skip (for pagination)
            limit: Maximum number of records to return
            tenant_id: Optional tenant ID to filter by
            
        Returns:
            List of ErrorHandler objects
        """
        query = self.db.query(ErrorHandlerModel)
        
        # Apply tenant filtering if provided
        if tenant_id:
            query = query.filter(ErrorHandlerModel.tenant_id == tenant_id)
            
        return query.offset(skip).limit(limit).all()
    
    def get_by_id(self, errorhandler_id: int) -> ErrorHandlerModel:
        """
        Get a specific errorhandler by ID.
        
        Args:
            errorhandler_id: ID of the errorhandler to retrieve
            
        Returns:
            ErrorHandler object if found
            
        Raises:
            HTTPException: If errorhandler not found
        """
        errorhandler = self.db.query(ErrorHandlerModel).filter(ErrorHandlerModel.id == errorhandler_id).first()
        
        if not errorhandler:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"ErrorHandler with ID {errorhandler_id} not found"
            )
            
        return errorhandler
    
    def create(self, data: ErrorHandlerCreate) -> ErrorHandlerModel:
        """
        Create a new errorhandler.
        
        Args:
            data: ErrorHandler creation data
            
        Returns:
            Newly created ErrorHandler object
        """
        errorhandler = ErrorHandlerModel(**data.dict())
        
        try:
            self.db.add(errorhandler)
            self.db.commit()
            self.db.refresh(errorhandler)
            return errorhandler
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create errorhandler: {str(e)}"
            )
    
    def update(self, errorhandler_id: int, data: ErrorHandlerUpdate) -> ErrorHandlerModel:
        """
        Update an existing errorhandler.
        
        Args:
            errorhandler_id: ID of the errorhandler to update
            data: ErrorHandler update data
            
        Returns:
            Updated ErrorHandler object
            
        Raises:
            HTTPException: If errorhandler not found or update fails
        """
        errorhandler = self.get_by_id(errorhandler_id)
        
        # Update fields from the data
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(errorhandler, field, value)
            
        try:
            self.db.commit()
            self.db.refresh(errorhandler)
            return errorhandler
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update errorhandler: {str(e)}"
            )
    
    def delete(self, errorhandler_id: int) -> bool:
        """
        Delete a errorhandler.
        
        Args:
            errorhandler_id: ID of the errorhandler to delete
            
        Returns:
            True if deletion successful
            
        Raises:
            HTTPException: If errorhandler not found or deletion fails
        """
        errorhandler = self.get_by_id(errorhandler_id)
        
        try:
            self.db.delete(errorhandler)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete errorhandler: {str(e)}"
            )
