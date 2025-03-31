"""
DatasetService Service

Service for dataset management and transformation
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from db.models import DatasetService as DatasetServiceModel
from .models import DatasetServiceCreate, DatasetServiceUpdate

class DatasetServiceService:
    """Service for datasetservice operations"""
    
    def __init__(self, db: Session):
        """Initialize with database session"""
        self.db = db
    
    def get_all(self, 
                skip: int = 0, 
                limit: int = 100, 
                tenant_id: Optional[str] = None) -> List[DatasetServiceModel]:
        """
        Get all datasetservices, optionally filtered by tenant.
        
        Args:
            skip: Number of records to skip (for pagination)
            limit: Maximum number of records to return
            tenant_id: Optional tenant ID to filter by
            
        Returns:
            List of DatasetService objects
        """
        query = self.db.query(DatasetServiceModel)
        
        # Apply tenant filtering if provided
        if tenant_id:
            query = query.filter(DatasetServiceModel.tenant_id == tenant_id)
            
        return query.offset(skip).limit(limit).all()
    
    def get_by_id(self, datasetservice_id: int) -> DatasetServiceModel:
        """
        Get a specific datasetservice by ID.
        
        Args:
            datasetservice_id: ID of the datasetservice to retrieve
            
        Returns:
            DatasetService object if found
            
        Raises:
            HTTPException: If datasetservice not found
        """
        datasetservice = self.db.query(DatasetServiceModel).filter(DatasetServiceModel.id == datasetservice_id).first()
        
        if not datasetservice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"DatasetService with ID {datasetservice_id} not found"
            )
            
        return datasetservice
    
    def create(self, data: DatasetServiceCreate) -> DatasetServiceModel:
        """
        Create a new datasetservice.
        
        Args:
            data: DatasetService creation data
            
        Returns:
            Newly created DatasetService object
        """
        datasetservice = DatasetServiceModel(**data.dict())
        
        try:
            self.db.add(datasetservice)
            self.db.commit()
            self.db.refresh(datasetservice)
            return datasetservice
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create datasetservice: {str(e)}"
            )
    
    def update(self, datasetservice_id: int, data: DatasetServiceUpdate) -> DatasetServiceModel:
        """
        Update an existing datasetservice.
        
        Args:
            datasetservice_id: ID of the datasetservice to update
            data: DatasetService update data
            
        Returns:
            Updated DatasetService object
            
        Raises:
            HTTPException: If datasetservice not found or update fails
        """
        datasetservice = self.get_by_id(datasetservice_id)
        
        # Update fields from the data
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(datasetservice, field, value)
            
        try:
            self.db.commit()
            self.db.refresh(datasetservice)
            return datasetservice
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update datasetservice: {str(e)}"
            )
    
    def delete(self, datasetservice_id: int) -> bool:
        """
        Delete a datasetservice.
        
        Args:
            datasetservice_id: ID of the datasetservice to delete
            
        Returns:
            True if deletion successful
            
        Raises:
            HTTPException: If datasetservice not found or deletion fails
        """
        datasetservice = self.get_by_id(datasetservice_id)
        
        try:
            self.db.delete(datasetservice)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete datasetservice: {str(e)}"
            )
