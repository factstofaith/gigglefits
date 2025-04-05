"""User management services for the TAP Integration Platform"""
import logging
import os
import secrets
import string
import uuid
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta, timezone
import base64
import pyotp
import qrcode
import io
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON, Table
from sqlalchemy import Float, Sequence, UniqueConstraint, ForeignKeyConstraint, event, or_, desc
from sqlalchemy.orm import relationship, backref, validates, Session
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func
import enum

from db.base import Base
from utils.encryption.crypto import EncryptedString, EncryptedJSON
from utils.helpers import generate_uid
from utils.error_handling.exceptions import ValidationError, ApplicationError, ResourceNotFoundError, DatabaseError
from utils.error_handling.handlers import with_error_logging
from fastapi import HTTPException, status

# Setup logging
logger = logging.getLogger(__name__)

# Import models from a separate file to avoid circular imports
# For now, we're assuming these are properly defined elsewhere
# These need to be properly imported from the models file
from db.models import User, UserRole, UserAccountStatus, AuthProvider, Invitation, UserMFA, UserLoginHistory, MFASettings, EmailConfiguration, EmailTemplate, InvitationStatus

# For authentication functions
from modules.auth.service import get_password_hash

class InvitationService:
    def __init__(self, db: Session):
        self.db = db
    
    @with_error_logging
    def create_invitation(self, email: str, role: str, expiration_hours: int, 
                         created_by: User, custom_message: Optional[str] = None):
        """Create a new invitation"""
        try:
            # Check if an active invitation exists
            existing_invitation = self.db.query(Invitation).filter(
                Invitation.email == email,
                Invitation.status == InvitationStatus.PENDING
            ).first()
            
            if existing_invitation:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"An active invitation already exists for {email}"
                )
            
            # Create new invitation
            invitation = Invitation(
                id=str(uuid.uuid4()),
                email=email,
                token=self._generate_secure_token(),
                expiration_date=datetime.now(timezone.utc) + timedelta(hours=expiration_hours),
                created_by=created_by.id,
                status=InvitationStatus.PENDING,
                role=role,
                custom_message=custom_message
            )
            
            self.db.add(invitation)
            self.db.commit()
            self.db.refresh(invitation)
            
            # Send invitation email (implement this later)
            # self._send_invitation_email(invitation)
            
            return invitation
        except Exception as e:
            logger.error(f"Error in create_invitation: {e}")
            raise ApplicationError(message=f"Error in create_invitation", original_error=e)
    
    def _generate_secure_token(self, length: int = 64) -> str:
        """Generate a secure random token"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))


# Stub implementation of other services - these will be properly implemented later
class MFAService:
    def __init__(self, db: Session):
        self.db = db


class UserService:
    def __init__(self, db: Session):
        self.db = db


class EmailService:
    def __init__(self, db: Session):
        self.db = db


class MFASettingsService:
    def __init__(self, db: Session):
        self.db = db