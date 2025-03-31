"""
UserService Service

Service for user management and authentication
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from db.models import UserService as UserServiceModel
from .models import UserServiceCreate, UserServiceUpdate

class UserServiceService:
    """Service for userservice operations"""
    
    def __init__(self, db: Session):
        """Initialize with database session"""
        self.db = db
    
    def get_all(self, 
                skip: int = 0, 
                limit: int = 100, 
                tenant_id: Optional[str] = None) -> List[UserServiceModel]:
        """
        Get all userservices, optionally filtered by tenant.
        
        Args:
            skip: Number of records to skip (for pagination)
            limit: Maximum number of records to return
            tenant_id: Optional tenant ID to filter by
            
        Returns:
            List of UserService objects
        """
        query = self.db.query(UserServiceModel)
        
        # Apply tenant filtering if provided
        if tenant_id:
            query = query.filter(UserServiceModel.tenant_id == tenant_id)
            
        return query.offset(skip).limit(limit).all()
    
    def get_by_id(self, userservice_id: int) -> UserServiceModel:
        """
        Get a specific userservice by ID.
        
        Args:
            userservice_id: ID of the userservice to retrieve
            
        Returns:
            UserService object if found
            
        Raises:
            HTTPException: If userservice not found
        """
        userservice = self.db.query(UserServiceModel).filter(UserServiceModel.id == userservice_id).first()
        
        if not userservice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"UserService with ID {userservice_id} not found"
            )
            
        return userservice
    
    def create(self, data: UserServiceCreate) -> UserServiceModel:
        """
        Create a new userservice.
        
        Args:
            data: UserService creation data
            
        Returns:
            Newly created UserService object
        """
        userservice = UserServiceModel(**data.dict())
        
        try:
            self.db.add(userservice)
            self.db.commit()
            self.db.refresh(userservice)
            return userservice
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create userservice: {str(e)}"
            )
    
    def update(self, userservice_id: int, data: UserServiceUpdate) -> UserServiceModel:
        """
        Update an existing userservice.
        
        Args:
            userservice_id: ID of the userservice to update
            data: UserService update data
            
        Returns:
            Updated UserService object
            
        Raises:
            HTTPException: If userservice not found or update fails
        """
        userservice = self.get_by_id(userservice_id)
        
        # Update fields from the data
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(userservice, field, value)
            
        try:
            self.db.commit()
            self.db.refresh(userservice)
            return userservice
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update userservice: {str(e)}"
            )
    
    def delete(self, userservice_id: int) -> bool:
        """
        Delete a userservice.
        
        Args:
            userservice_id: ID of the userservice to delete
            
        Returns:
            True if deletion successful
            
        Raises:
            HTTPException: If userservice not found or deletion fails
        """
        userservice = self.get_by_id(userservice_id)
        
        try:
            self.db.delete(userservice)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete userservice: {str(e)}"
            )
