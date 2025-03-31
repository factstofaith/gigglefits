"""
BaseModel Schema

Pydantic models for basemodel API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class BaseModelBase(BaseModel):
    """Base schema for BaseModel data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class BaseModelCreate(BaseModelBase):
    """Schema for creating a new basemodel"""
    # Add creation-specific fields here
    pass

class BaseModelUpdate(BaseModel):
    """Schema for updating a basemodel"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class BaseModelResponse(BaseModelBase):
    """Schema for BaseModel data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
