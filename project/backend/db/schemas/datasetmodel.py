"""
DatasetModel Schema

Pydantic models for datasetmodel API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class DatasetModelBase(BaseModel):
    """Base schema for DatasetModel data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class DatasetModelCreate(DatasetModelBase):
    """Schema for creating a new datasetmodel"""
    # Add creation-specific fields here
    pass

class DatasetModelUpdate(BaseModel):
    """Schema for updating a datasetmodel"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class DatasetModelResponse(DatasetModelBase):
    """Schema for DatasetModel data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
