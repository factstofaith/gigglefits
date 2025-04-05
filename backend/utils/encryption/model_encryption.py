"""
SQLAlchemy model encryption utilities.

This module provides helper functions and classes for working with encrypted database columns.
"""

import logging
from typing import List, Dict, Any, Type, Optional
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON, Table, Float, Sequence, UniqueConstraint, ForeignKeyConstraint, event
from sqlalchemy.orm import relationship, backref, validates, Session
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func
from datetime import datetime, timezone
import enum
import uuid

from db.base import Base
from utils.encryption.crypto import EncryptedString, EncryptedJSON
from utils.helpers import generate_uid
from utils.error_handling.exceptions import ValidationError

# Set up logging
logger = logging.getLogger(__name__)

# Dictionary to store models with encrypted fields
MODELS_WITH_ENCRYPTION = {}

def is_encrypted(value: str) -> bool:
    """
    Check if a string value appears to be encrypted.
    
    Args:
        value: The string value to check
        
    Returns:
        True if the value appears to be encrypted, False otherwise
    """
    if not isinstance(value, str):
        return False
    
    # A simple heuristic: encrypted data is base64 and starts with a specific prefix
    return value.startswith("enc:") or (len(value) > 24 and "=" in value[-3:])

def register_encrypted_fields(model_class: Type[Base], encrypted_fields: List[str]):
    """
    Register a model class and its encrypted fields.
    
    Args:
        model_class: SQLAlchemy model class
        encrypted_fields: List of field names that are encrypted
    """
    MODELS_WITH_ENCRYPTION[model_class.__name__] = encrypted_fields
    logger.info(f"Registered encrypted fields for {model_class.__name__}: {', '.join(encrypted_fields)}")

def get_encrypted_fields(model_class: Type[Base]) -> List[str]:
    """
    Get the list of encrypted fields for a model class.
    
    Args:
        model_class: SQLAlchemy model class
        
    Returns:
        List of field names that are encrypted
    """
    return MODELS_WITH_ENCRYPTION.get(model_class.__name__, [])

def update_column_type(model_class: Type[Base], column_name: str, new_type: Any) -> bool:
    """
    Update a column's type at runtime.
    
    This is a helper function for migration scripts to update column types.
    
    Args:
        model_class: The SQLAlchemy model class
        column_name: The name of the column to update
        new_type: The new SQLAlchemy column type
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Get the column
        column = getattr(model_class, column_name)
        if column is None:
            logger.error(f"Column {column_name} not found in {model_class.__name__}")
            return False
        
        # Update the column type
        column.type = new_type
        logger.info(f"Updated column type for {model_class.__name__}.{column_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to update column type: {str(e)}")
        return False

def encrypt_existing_data(db: Session, model_class: Type[Base], column_name: str) -> int:
    """
    Encrypt existing data in a column.
    
    This function is used during migration to encrypt existing data in a column
    that is being converted to use encryption.
    
    Args:
        db: SQLAlchemy session
        model_class: The model class
        column_name: The column name to encrypt
        
    Returns:
        Number of records encrypted
    """
    from utils.encryption.crypto import encrypt_data
    
    count = 0
    try:
        # Get all records
        records = db.query(model_class).all()
        
        for record in records:
            value = getattr(record, column_name)
            if value is not None and not is_encrypted(value):
                # Encrypt the value and update the record
                encrypted_value = encrypt_data(value)
                setattr(record, column_name, encrypted_value)
                count += 1
        
        # Commit the changes
        db.commit()
        logger.info(f"Encrypted {count} records in {model_class.__name__}.{column_name}")
        return count
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to encrypt existing data: {str(e)}")
        return 0

def check_encryption_status(db: Session) -> Dict[str, Dict[str, Any]]:
    """
    Check the encryption status of all registered models.
    
    This function checks whether the registered encrypted fields in each model
    actually contain encrypted data.
    
    Args:
        db: SQLAlchemy session
        
    Returns:
        Dictionary with encryption status for each model and field
    """
    results = {}
    
    for model_name, fields in MODELS_WITH_ENCRYPTION.items():
        model_class = next((m for m in Base.__subclasses__() if m.__name__ == model_name), None)
        if not model_class:
            results[model_name] = {"error": "Model class not found"}
            continue
        
        field_status = {}
        for field_name in fields:
            try:
                # Check if the field exists
                if not hasattr(model_class, field_name):
                    field_status[field_name] = {"error": "Field not found in model"}
                    continue
                
                # Get the first few records
                records = db.query(model_class).limit(5).all()
                
                if not records:
                    field_status[field_name] = {"status": "no data"}
                    continue
                
                # Check encryption status of each record
                sample_values = []
                for record in records:
                    value = getattr(record, field_name)
                    if value is not None:
                        is_enc = is_encrypted(value) if isinstance(value, str) else False
                        sample_values.append({"encrypted": is_enc})
                
                # Determine overall status
                total = len(sample_values)
                encrypted = sum(1 for v in sample_values if v.get("encrypted", False))
                
                if total == 0:
                    field_status[field_name] = {"status": "no data"}
                elif encrypted == 0:
                    field_status[field_name] = {"status": "not encrypted", "samples": total}
                elif encrypted == total:
                    field_status[field_name] = {"status": "fully encrypted", "samples": total}
                else:
                    field_status[field_name] = {
                        "status": "partially encrypted",
                        "encrypted": encrypted,
                        "total": total
                    }
            except Exception as e:
                field_status[field_name] = {"error": str(e)}
        
        results[model_name] = field_status
    
    return results