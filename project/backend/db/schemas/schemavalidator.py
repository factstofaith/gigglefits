"""
SchemaValidator Schema

Pydantic models for schemavalidator API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class SchemaValidatorBase(BaseModel):
    """Base schema for SchemaValidator data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class SchemaValidatorCreate(SchemaValidatorBase):
    """Schema for creating a new schemavalidator"""
    # Add creation-specific fields here
    pass

class SchemaValidatorUpdate(BaseModel):
    """Schema for updating a schemavalidator"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class SchemaValidatorResponse(SchemaValidatorBase):
    """Schema for SchemaValidator data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
