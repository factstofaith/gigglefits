"""
TenantModel Schema

Pydantic models for tenantmodel API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class TenantModelBase(BaseModel):
    """Base schema for TenantModel data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class TenantModelCreate(TenantModelBase):
    """Schema for creating a new tenantmodel"""
    # Add creation-specific fields here
    pass

class TenantModelUpdate(BaseModel):
    """Schema for updating a tenantmodel"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class TenantModelResponse(TenantModelBase):
    """Schema for TenantModel data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
