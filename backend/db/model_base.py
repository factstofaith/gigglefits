"""
Base model for SQLAlchemy models with common functionality
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON, Table, Float, Sequence, UniqueConstraint, ForeignKeyConstraint, event
from sqlalchemy.orm import relationship, backref, validates
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func
from datetime import datetime, timezone
import enum
import uuid

from db.base import Base
from utils.encryption.crypto import EncryptedString, EncryptedJSON
from utils.helpers import generate_uid
from utils.error_handling.exceptions import ValidationError
class ModelBase(Base):
    """Base class for all TAP Integration Platform models with common functionality"""
    
    __abstract__ = True
    
    @declared_attr
    def __tablename__(cls):
        """Generate tablename from class name"""
        return cls.__name__.lower()
    
    @classmethod
    def create(cls, session, **kwargs):
        """Create a new instance of the model and add it to the session"""
        instance = cls(**kwargs)
        session.add(instance)
        return instance
    
    def update(self, **kwargs):
        """Update model attributes"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        return self
        
    def to_dict(self, exclude=None):
        """Convert model to dictionary, excluding certain fields if specified"""
        exclude = exclude or []
        result = {}
        for column in self.__table__.columns:
            if column.name not in exclude:
                result[column.name] = getattr(self, column.name)
        return result

