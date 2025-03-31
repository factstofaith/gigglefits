"""
BaseService Schema

Pydantic models for baseservice API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class BaseServiceBase(BaseModel):
    """Base schema for BaseService data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class BaseServiceCreate(BaseServiceBase):
    """Schema for creating a new baseservice"""
    # Add creation-specific fields here
    pass

class BaseServiceUpdate(BaseModel):
    """Schema for updating a baseservice"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class BaseServiceResponse(BaseServiceBase):
    """Schema for BaseService data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
