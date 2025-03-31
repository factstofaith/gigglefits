"""
MigrationFramework Schema

Pydantic models for migrationframework API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class MigrationFrameworkBase(BaseModel):
    """Base schema for MigrationFramework data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class MigrationFrameworkCreate(MigrationFrameworkBase):
    """Schema for creating a new migrationframework"""
    # Add creation-specific fields here
    pass

class MigrationFrameworkUpdate(BaseModel):
    """Schema for updating a migrationframework"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class MigrationFrameworkResponse(MigrationFrameworkBase):
    """Schema for MigrationFramework data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
