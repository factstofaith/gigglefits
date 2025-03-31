"""
DatasetModel Model

Dataset model with schema validation and transformation
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declared_attr

from db.base import Base
from utils.encryption.model_encryption import EncryptedColumn

class DatasetModel(Base):
    """Dataset model with schema validation and transformation"""
    __tablename__ = "datasetmodels"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Tenant relationship for multi-tenancy
    @declared_attr
    def tenant_id(cls):
        return Column(String(50), ForeignKey('tenants.id'), nullable=True)
    
    @declared_attr
    def tenant(cls):
        return relationship("Tenant", back_populates="datasetmodels")
    
    # Add additional fields and relationships as needed
    # ...
    
    def __repr__(self):
        return f"<DatasetModel id={self.id}, name={self.name}>"
