"""
DatasetService Schema

Pydantic models for datasetservice API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class DatasetServiceBase(BaseModel):
    """Base schema for DatasetService data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class DatasetServiceCreate(DatasetServiceBase):
    """Schema for creating a new datasetservice"""
    # Add creation-specific fields here
    pass

class DatasetServiceUpdate(BaseModel):
    """Schema for updating a datasetservice"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class DatasetServiceResponse(DatasetServiceBase):
    """Schema for DatasetService data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
