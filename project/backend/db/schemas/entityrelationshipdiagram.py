"""
EntityRelationshipDiagram Schema

Pydantic models for entityrelationshipdiagram API input/output validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

class EntityRelationshipDiagramBase(BaseModel):
    """Base schema for EntityRelationshipDiagram data"""
    name: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class EntityRelationshipDiagramCreate(EntityRelationshipDiagramBase):
    """Schema for creating a new entityrelationshipdiagram"""
    # Add creation-specific fields here
    pass

class EntityRelationshipDiagramUpdate(BaseModel):
    """Schema for updating a entityrelationshipdiagram"""
    name: Optional[str] = None
    description: Optional[str] = None
    # Add update-specific fields here

class EntityRelationshipDiagramResponse(EntityRelationshipDiagramBase):
    """Schema for EntityRelationshipDiagram data in responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        populate_by_name = True
