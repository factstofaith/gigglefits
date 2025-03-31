"""
TransactionManager Schema

Pydantic models for transactionmanager API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class TransactionManagerBase(BaseModel):
    """Base schema for TransactionManager data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class TransactionManagerCreate(TransactionManagerBase):
    """Schema for creating a new transactionmanager"""
    # Add creation-specific fields here
    pass

class TransactionManagerUpdate(BaseModel):
    """Schema for updating a transactionmanager"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class TransactionManagerResponse(TransactionManagerBase):
    """Schema for TransactionManager data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
