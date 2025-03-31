"""
TransactionManager Service

Transaction management for database operations
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from db.models import TransactionManager as TransactionManagerModel
from .models import TransactionManagerCreate, TransactionManagerUpdate

class TransactionManagerService:
    """Service for transactionmanager operations"""
    
    def __init__(self, db: Session):
        """Initialize with database session"""
        self.db = db
    
    def get_all(self, 
                skip: int = 0, 
                limit: int = 100, 
                tenant_id: Optional[str] = None) -> List[TransactionManagerModel]:
        """
        Get all transactionmanagers, optionally filtered by tenant.
        
        Args:
            skip: Number of records to skip (for pagination)
            limit: Maximum number of records to return
            tenant_id: Optional tenant ID to filter by
            
        Returns:
            List of TransactionManager objects
        """
        query = self.db.query(TransactionManagerModel)
        
        # Apply tenant filtering if provided
        if tenant_id:
            query = query.filter(TransactionManagerModel.tenant_id == tenant_id)
            
        return query.offset(skip).limit(limit).all()
    
    def get_by_id(self, transactionmanager_id: int) -> TransactionManagerModel:
        """
        Get a specific transactionmanager by ID.
        
        Args:
            transactionmanager_id: ID of the transactionmanager to retrieve
            
        Returns:
            TransactionManager object if found
            
        Raises:
            HTTPException: If transactionmanager not found
        """
        transactionmanager = self.db.query(TransactionManagerModel).filter(TransactionManagerModel.id == transactionmanager_id).first()
        
        if not transactionmanager:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"TransactionManager with ID {transactionmanager_id} not found"
            )
            
        return transactionmanager
    
    def create(self, data: TransactionManagerCreate) -> TransactionManagerModel:
        """
        Create a new transactionmanager.
        
        Args:
            data: TransactionManager creation data
            
        Returns:
            Newly created TransactionManager object
        """
        transactionmanager = TransactionManagerModel(**data.dict())
        
        try:
            self.db.add(transactionmanager)
            self.db.commit()
            self.db.refresh(transactionmanager)
            return transactionmanager
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create transactionmanager: {str(e)}"
            )
    
    def update(self, transactionmanager_id: int, data: TransactionManagerUpdate) -> TransactionManagerModel:
        """
        Update an existing transactionmanager.
        
        Args:
            transactionmanager_id: ID of the transactionmanager to update
            data: TransactionManager update data
            
        Returns:
            Updated TransactionManager object
            
        Raises:
            HTTPException: If transactionmanager not found or update fails
        """
        transactionmanager = self.get_by_id(transactionmanager_id)
        
        # Update fields from the data
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(transactionmanager, field, value)
            
        try:
            self.db.commit()
            self.db.refresh(transactionmanager)
            return transactionmanager
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update transactionmanager: {str(e)}"
            )
    
    def delete(self, transactionmanager_id: int) -> bool:
        """
        Delete a transactionmanager.
        
        Args:
            transactionmanager_id: ID of the transactionmanager to delete
            
        Returns:
            True if deletion successful
            
        Raises:
            HTTPException: If transactionmanager not found or deletion fails
        """
        transactionmanager = self.get_by_id(transactionmanager_id)
        
        try:
            self.db.delete(transactionmanager)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete transactionmanager: {str(e)}"
            )
