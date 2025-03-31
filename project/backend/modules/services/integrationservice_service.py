"""
IntegrationService Service

Service for managing integrations and execution
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from db.models import IntegrationService as IntegrationServiceModel
from .models import IntegrationServiceCreate, IntegrationServiceUpdate

class IntegrationServiceService:
    """Service for integrationservice operations"""
    
    def __init__(self, db: Session):
        """Initialize with database session"""
        self.db = db
    
    def get_all(self, 
                skip: int = 0, 
                limit: int = 100, 
                tenant_id: Optional[str] = None) -> List[IntegrationServiceModel]:
        """
        Get all integrationservices, optionally filtered by tenant.
        
        Args:
            skip: Number of records to skip (for pagination)
            limit: Maximum number of records to return
            tenant_id: Optional tenant ID to filter by
            
        Returns:
            List of IntegrationService objects
        """
        query = self.db.query(IntegrationServiceModel)
        
        # Apply tenant filtering if provided
        if tenant_id:
            query = query.filter(IntegrationServiceModel.tenant_id == tenant_id)
            
        return query.offset(skip).limit(limit).all()
    
    def get_by_id(self, integrationservice_id: int) -> IntegrationServiceModel:
        """
        Get a specific integrationservice by ID.
        
        Args:
            integrationservice_id: ID of the integrationservice to retrieve
            
        Returns:
            IntegrationService object if found
            
        Raises:
            HTTPException: If integrationservice not found
        """
        integrationservice = self.db.query(IntegrationServiceModel).filter(IntegrationServiceModel.id == integrationservice_id).first()
        
        if not integrationservice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"IntegrationService with ID {integrationservice_id} not found"
            )
            
        return integrationservice
    
    def create(self, data: IntegrationServiceCreate) -> IntegrationServiceModel:
        """
        Create a new integrationservice.
        
        Args:
            data: IntegrationService creation data
            
        Returns:
            Newly created IntegrationService object
        """
        integrationservice = IntegrationServiceModel(**data.dict())
        
        try:
            self.db.add(integrationservice)
            self.db.commit()
            self.db.refresh(integrationservice)
            return integrationservice
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create integrationservice: {str(e)}"
            )
    
    def update(self, integrationservice_id: int, data: IntegrationServiceUpdate) -> IntegrationServiceModel:
        """
        Update an existing integrationservice.
        
        Args:
            integrationservice_id: ID of the integrationservice to update
            data: IntegrationService update data
            
        Returns:
            Updated IntegrationService object
            
        Raises:
            HTTPException: If integrationservice not found or update fails
        """
        integrationservice = self.get_by_id(integrationservice_id)
        
        # Update fields from the data
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(integrationservice, field, value)
            
        try:
            self.db.commit()
            self.db.refresh(integrationservice)
            return integrationservice
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update integrationservice: {str(e)}"
            )
    
    def delete(self, integrationservice_id: int) -> bool:
        """
        Delete a integrationservice.
        
        Args:
            integrationservice_id: ID of the integrationservice to delete
            
        Returns:
            True if deletion successful
            
        Raises:
            HTTPException: If integrationservice not found or deletion fails
        """
        integrationservice = self.get_by_id(integrationservice_id)
        
        try:
            self.db.delete(integrationservice)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete integrationservice: {str(e)}"
            )
