"""
APIVersioning Service

API versioning infrastructure for backward compatibility
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from db.models import APIVersioning as APIVersioningModel
from .models import APIVersioningCreate, APIVersioningUpdate

class APIVersioningService:
    """Service for apiversioning operations"""
    
    def __init__(self, db: Session):
        """Initialize with database session"""
        self.db = db
    
    def get_all(self, 
                skip: int = 0, 
                limit: int = 100, 
                tenant_id: Optional[str] = None) -> List[APIVersioningModel]:
        """
        Get all apiversionings, optionally filtered by tenant.
        
        Args:
            skip: Number of records to skip (for pagination)
            limit: Maximum number of records to return
            tenant_id: Optional tenant ID to filter by
            
        Returns:
            List of APIVersioning objects
        """
        query = self.db.query(APIVersioningModel)
        
        # Apply tenant filtering if provided
        if tenant_id:
            query = query.filter(APIVersioningModel.tenant_id == tenant_id)
            
        return query.offset(skip).limit(limit).all()
    
    def get_by_id(self, apiversioning_id: int) -> APIVersioningModel:
        """
        Get a specific apiversioning by ID.
        
        Args:
            apiversioning_id: ID of the apiversioning to retrieve
            
        Returns:
            APIVersioning object if found
            
        Raises:
            HTTPException: If apiversioning not found
        """
        apiversioning = self.db.query(APIVersioningModel).filter(APIVersioningModel.id == apiversioning_id).first()
        
        if not apiversioning:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"APIVersioning with ID {apiversioning_id} not found"
            )
            
        return apiversioning
    
    def create(self, data: APIVersioningCreate) -> APIVersioningModel:
        """
        Create a new apiversioning.
        
        Args:
            data: APIVersioning creation data
            
        Returns:
            Newly created APIVersioning object
        """
        apiversioning = APIVersioningModel(**data.dict())
        
        try:
            self.db.add(apiversioning)
            self.db.commit()
            self.db.refresh(apiversioning)
            return apiversioning
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create apiversioning: {str(e)}"
            )
    
    def update(self, apiversioning_id: int, data: APIVersioningUpdate) -> APIVersioningModel:
        """
        Update an existing apiversioning.
        
        Args:
            apiversioning_id: ID of the apiversioning to update
            data: APIVersioning update data
            
        Returns:
            Updated APIVersioning object
            
        Raises:
            HTTPException: If apiversioning not found or update fails
        """
        apiversioning = self.get_by_id(apiversioning_id)
        
        # Update fields from the data
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(apiversioning, field, value)
            
        try:
            self.db.commit()
            self.db.refresh(apiversioning)
            return apiversioning
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update apiversioning: {str(e)}"
            )
    
    def delete(self, apiversioning_id: int) -> bool:
        """
        Delete a apiversioning.
        
        Args:
            apiversioning_id: ID of the apiversioning to delete
            
        Returns:
            True if deletion successful
            
        Raises:
            HTTPException: If apiversioning not found or deletion fails
        """
        apiversioning = self.get_by_id(apiversioning_id)
        
        try:
            self.db.delete(apiversioning)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete apiversioning: {str(e)}"
            )
