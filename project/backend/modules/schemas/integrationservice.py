"""
IntegrationService Schema

Pydantic models for integrationservice API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class IntegrationServiceBase(BaseModel):
    """Base schema for IntegrationService data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class IntegrationServiceCreate(IntegrationServiceBase):
    """Schema for creating a new integrationservice"""
    # Add creation-specific fields here
    pass

class IntegrationServiceUpdate(BaseModel):
    """Schema for updating a integrationservice"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class IntegrationServiceResponse(IntegrationServiceBase):
    """Schema for IntegrationService data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
