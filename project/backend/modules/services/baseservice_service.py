"""
BaseService Service

Base service class with common CRUD operations
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from db.models import BaseService as BaseServiceModel
from .models import BaseServiceCreate, BaseServiceUpdate

class BaseServiceService:
    """Service for baseservice operations"""
    
    def __init__(self, db: Session):
        """Initialize with database session"""
        self.db = db
    
    def get_all(self, 
                skip: int = 0, 
                limit: int = 100, 
                tenant_id: Optional[str] = None) -> List[BaseServiceModel]:
        """
        Get all baseservices, optionally filtered by tenant.
        
        Args:
            skip: Number of records to skip (for pagination)
            limit: Maximum number of records to return
            tenant_id: Optional tenant ID to filter by
            
        Returns:
            List of BaseService objects
        """
        query = self.db.query(BaseServiceModel)
        
        # Apply tenant filtering if provided
        if tenant_id:
            query = query.filter(BaseServiceModel.tenant_id == tenant_id)
            
        return query.offset(skip).limit(limit).all()
    
    def get_by_id(self, baseservice_id: int) -> BaseServiceModel:
        """
        Get a specific baseservice by ID.
        
        Args:
            baseservice_id: ID of the baseservice to retrieve
            
        Returns:
            BaseService object if found
            
        Raises:
            HTTPException: If baseservice not found
        """
        baseservice = self.db.query(BaseServiceModel).filter(BaseServiceModel.id == baseservice_id).first()
        
        if not baseservice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"BaseService with ID {baseservice_id} not found"
            )
            
        return baseservice
    
    def create(self, data: BaseServiceCreate) -> BaseServiceModel:
        """
        Create a new baseservice.
        
        Args:
            data: BaseService creation data
            
        Returns:
            Newly created BaseService object
        """
        baseservice = BaseServiceModel(**data.dict())
        
        try:
            self.db.add(baseservice)
            self.db.commit()
            self.db.refresh(baseservice)
            return baseservice
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create baseservice: {str(e)}"
            )
    
    def update(self, baseservice_id: int, data: BaseServiceUpdate) -> BaseServiceModel:
        """
        Update an existing baseservice.
        
        Args:
            baseservice_id: ID of the baseservice to update
            data: BaseService update data
            
        Returns:
            Updated BaseService object
            
        Raises:
            HTTPException: If baseservice not found or update fails
        """
        baseservice = self.get_by_id(baseservice_id)
        
        # Update fields from the data
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(baseservice, field, value)
            
        try:
            self.db.commit()
            self.db.refresh(baseservice)
            return baseservice
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update baseservice: {str(e)}"
            )
    
    def delete(self, baseservice_id: int) -> bool:
        """
        Delete a baseservice.
        
        Args:
            baseservice_id: ID of the baseservice to delete
            
        Returns:
            True if deletion successful
            
        Raises:
            HTTPException: If baseservice not found or deletion fails
        """
        baseservice = self.get_by_id(baseservice_id)
        
        try:
            self.db.delete(baseservice)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete baseservice: {str(e)}"
            )
