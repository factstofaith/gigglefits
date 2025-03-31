"""
TenantService Schema

Pydantic models for tenantservice API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class TenantServiceBase(BaseModel):
    """Base schema for TenantService data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class TenantServiceCreate(TenantServiceBase):
    """Schema for creating a new tenantservice"""
    # Add creation-specific fields here
    pass

class TenantServiceUpdate(BaseModel):
    """Schema for updating a tenantservice"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class TenantServiceResponse(TenantServiceBase):
    """Schema for TenantService data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
