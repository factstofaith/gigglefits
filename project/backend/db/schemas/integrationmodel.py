"""
IntegrationModel Schema

Pydantic models for integrationmodel API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class IntegrationModelBase(BaseModel):
    """Base schema for IntegrationModel data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class IntegrationModelCreate(IntegrationModelBase):
    """Schema for creating a new integrationmodel"""
    # Add creation-specific fields here
    pass

class IntegrationModelUpdate(BaseModel):
    """Schema for updating a integrationmodel"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class IntegrationModelResponse(IntegrationModelBase):
    """Schema for IntegrationModel data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
