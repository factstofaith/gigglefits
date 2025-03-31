"""
UserModel Schema

Pydantic models for usermodel API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class UserModelBase(BaseModel):
    """Base schema for UserModel data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class UserModelCreate(UserModelBase):
    """Schema for creating a new usermodel"""
    # Add creation-specific fields here
    pass

class UserModelUpdate(BaseModel):
    """Schema for updating a usermodel"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class UserModelResponse(UserModelBase):
    """Schema for UserModel data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
