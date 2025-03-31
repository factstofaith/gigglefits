"""
TenantService Service

Service for tenant management and isolation
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from db.models import TenantService as TenantServiceModel
from .models import TenantServiceCreate, TenantServiceUpdate

class TenantServiceService:
    """Service for tenantservice operations"""
    
    def __init__(self, db: Session):
        """Initialize with database session"""
        self.db = db
    
    def get_all(self, 
                skip: int = 0, 
                limit: int = 100, 
                tenant_id: Optional[str] = None) -> List[TenantServiceModel]:
        """
        Get all tenantservices, optionally filtered by tenant.
        
        Args:
            skip: Number of records to skip (for pagination)
            limit: Maximum number of records to return
            tenant_id: Optional tenant ID to filter by
            
        Returns:
            List of TenantService objects
        """
        query = self.db.query(TenantServiceModel)
        
        # Apply tenant filtering if provided
        if tenant_id:
            query = query.filter(TenantServiceModel.tenant_id == tenant_id)
            
        return query.offset(skip).limit(limit).all()
    
    def get_by_id(self, tenantservice_id: int) -> TenantServiceModel:
        """
        Get a specific tenantservice by ID.
        
        Args:
            tenantservice_id: ID of the tenantservice to retrieve
            
        Returns:
            TenantService object if found
            
        Raises:
            HTTPException: If tenantservice not found
        """
        tenantservice = self.db.query(TenantServiceModel).filter(TenantServiceModel.id == tenantservice_id).first()
        
        if not tenantservice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"TenantService with ID {tenantservice_id} not found"
            )
            
        return tenantservice
    
    def create(self, data: TenantServiceCreate) -> TenantServiceModel:
        """
        Create a new tenantservice.
        
        Args:
            data: TenantService creation data
            
        Returns:
            Newly created TenantService object
        """
        tenantservice = TenantServiceModel(**data.dict())
        
        try:
            self.db.add(tenantservice)
            self.db.commit()
            self.db.refresh(tenantservice)
            return tenantservice
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create tenantservice: {str(e)}"
            )
    
    def update(self, tenantservice_id: int, data: TenantServiceUpdate) -> TenantServiceModel:
        """
        Update an existing tenantservice.
        
        Args:
            tenantservice_id: ID of the tenantservice to update
            data: TenantService update data
            
        Returns:
            Updated TenantService object
            
        Raises:
            HTTPException: If tenantservice not found or update fails
        """
        tenantservice = self.get_by_id(tenantservice_id)
        
        # Update fields from the data
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tenantservice, field, value)
            
        try:
            self.db.commit()
            self.db.refresh(tenantservice)
            return tenantservice
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update tenantservice: {str(e)}"
            )
    
    def delete(self, tenantservice_id: int) -> bool:
        """
        Delete a tenantservice.
        
        Args:
            tenantservice_id: ID of the tenantservice to delete
            
        Returns:
            True if deletion successful
            
        Raises:
            HTTPException: If tenantservice not found or deletion fails
        """
        tenantservice = self.get_by_id(tenantservice_id)
        
        try:
            self.db.delete(tenantservice)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete tenantservice: {str(e)}"
            )
