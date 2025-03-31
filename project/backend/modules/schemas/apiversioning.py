"""
APIVersioning Schema

Pydantic models for apiversioning API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class APIVersioningBase(BaseModel):
    """Base schema for APIVersioning data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class APIVersioningCreate(APIVersioningBase):
    """Schema for creating a new apiversioning"""
    # Add creation-specific fields here
    pass

class APIVersioningUpdate(BaseModel):
    """Schema for updating a apiversioning"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class APIVersioningResponse(APIVersioningBase):
    """Schema for APIVersioning data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
