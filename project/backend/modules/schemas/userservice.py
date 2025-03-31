"""
UserService Schema

Pydantic models for userservice API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class UserServiceBase(BaseModel):
    """Base schema for UserService data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class UserServiceCreate(UserServiceBase):
    """Schema for creating a new userservice"""
    # Add creation-specific fields here
    pass

class UserServiceUpdate(BaseModel):
    """Schema for updating a userservice"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class UserServiceResponse(UserServiceBase):
    """Schema for UserService data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
