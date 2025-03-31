"""
ErrorHandler Schema

Pydantic models for errorhandler API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class ErrorHandlerBase(BaseModel):
    """Base schema for ErrorHandler data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class ErrorHandlerCreate(ErrorHandlerBase):
    """Schema for creating a new errorhandler"""
    # Add creation-specific fields here
    pass

class ErrorHandlerUpdate(BaseModel):
    """Schema for updating a errorhandler"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class ErrorHandlerResponse(ErrorHandlerBase):
    """Schema for ErrorHandler data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
