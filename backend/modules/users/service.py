"""User management services for the TAP Integration Platform"""

import os
import secrets
import string
import uuid
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta
import base64
import pyotp
import qrcode
import io
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from fastapi import HTTPException, status, Depends

from core.config import settings
from core.auth import get_password_hash, verify_password
from db.models import (
    User, Invitation, UserMFA, UserLoginHistory, EmailConfiguration,
    EmailTemplate, MFASettings, UserRole, InvitationStatus, UserAccountStatus,
    AuthProvider
)

# ============================
# Invitation Service
# ============================

class InvitationService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_invitation(self, email: str, role: str, expiration_hours: int, 
                          created_by: User, custom_message: Optional[str] = None) -> Invitation:
        """Create a new invitation"""
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
            expiration_date=datetime.utcnow() + timedelta(hours=expiration_hours),
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
    
    def get_invitations(self, user: User, skip: int = 0, limit: int = 100, 
                       status: Optional[str] = None) -> Tuple[List[Invitation], int]:
        """Get list of invitations with optional filtering"""
        query = self.db.query(Invitation)
        
        # Apply status filter if provided
        if status:
            try:
                status_enum = InvitationStatus(status)
                query = query.filter(Invitation.status == status_enum)
            except ValueError:
                pass  # Invalid status, ignore filter
        
        # If not admin, only show own invitations
        if user.role != UserRole.ADMIN:
            query = query.filter(Invitation.created_by == user.id)
            
        # Get total count for pagination
        total = query.count()
        
        # Apply pagination and return results
        invitations = query.order_by(desc(Invitation.created_at)).offset(skip).limit(limit).all()
        
        return invitations, total
    
    def get_invitation(self, invitation_id: str, user: User) -> Invitation:
        """Get invitation by ID"""
        invitation = self.db.query(Invitation).filter(Invitation.id == invitation_id).first()
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found"
            )
        
        # If not admin and not owner, deny access
        if user.role != UserRole.ADMIN and invitation.created_by != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this invitation"
            )
            
        return invitation
    
    def verify_token(self, token: str) -> Invitation:
        """Verify invitation token"""
        invitation = self.db.query(Invitation).filter(Invitation.token == token).first()
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid invitation token"
            )
        
        if invitation.status != InvitationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invitation has been {invitation.status.value}"
            )
            
        if invitation.expiration_date < datetime.utcnow():
            # Update status to expired
            invitation.status = InvitationStatus.EXPIRED
            self.db.commit()
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has expired"
            )
            
        return invitation
    
    def cancel_invitation(self, invitation_id: str, user: User) -> Invitation:
        """Cancel an invitation"""
        invitation = self.get_invitation(invitation_id, user)
        
        if invitation.status != InvitationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel invitation with status {invitation.status.value}"
            )
            
        invitation.status = InvitationStatus.CANCELLED
        self.db.commit()
        self.db.refresh(invitation)
        
        return invitation
    
    def resend_invitation(self, invitation_id: str, user: User) -> Invitation:
        """Resend an invitation"""
        invitation = self.get_invitation(invitation_id, user)
        
        # For expired or cancelled invitations, reactivate them
        if invitation.status in [InvitationStatus.EXPIRED, InvitationStatus.CANCELLED]:
            invitation.status = InvitationStatus.PENDING
            invitation.token = self._generate_secure_token()
            invitation.expiration_date = datetime.utcnow() + timedelta(hours=48)  # Default 48 hours
        elif invitation.status == InvitationStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot resend an accepted invitation"
            )
        
        # Update invitation
        invitation.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(invitation)
        
        # Send invitation email (implement this later)
        # self._send_invitation_email(invitation)
        
        return invitation
    
    def accept_invitation(self, token: str, name: str, password: str, 
                         client_company: Optional[str] = None,
                         zoho_account: Optional[str] = None,
                         contact_information: Optional[Dict[str, Any]] = None) -> User:
        """Accept invitation and create user account"""
        invitation = self.verify_token(token)
        
        # Check if user with this email already exists
        existing_user = self.db.query(User).filter(User.email == invitation.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists"
            )
        
        # Create new user from invitation
        hashed_password = get_password_hash(password)
        
        user = User(
            id=str(uuid.uuid4()),
            username=invitation.email,  # Use email as username
            email=invitation.email,
            name=name,
            role=UserRole[invitation.role],
            tenant_id=None,  # Will be set by admin later if needed
            auth_provider=AuthProvider.LOCAL,
            hashed_password=hashed_password,
            is_active=True,
            account_status=UserAccountStatus.ACTIVE,
            invite_id=invitation.id,
            client_company=client_company,
            zoho_account=zoho_account,
            contact_information=contact_information,
            created_at=datetime.utcnow()
        )
        
        # Update invitation status
        invitation.status = InvitationStatus.ACCEPTED
        invitation.accepted_at = datetime.utcnow()
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
        
    def _generate_secure_token(self, length: int = 64) -> str:
        """Generate a secure random token"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    def _send_invitation_email(self, invitation: Invitation):
        """Send invitation email (placeholder for now)"""
        # This will be implemented with the EmailService
        pass

# ============================
# MFA Service
# ============================

class MFAService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_mfa_secret(self, user: User) -> Dict[str, str]:
        """Generate a new MFA secret and QR code for a user"""
        # Check if user already has MFA enabled
        mfa = self.db.query(UserMFA).filter(UserMFA.user_id == user.id).first()
        
        if mfa and mfa.mfa_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="MFA is already enabled for this user"
            )
            
        # Generate new secret
        secret = pyotp.random_base32()
        
        # Create TOTP URI
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name=settings.APP_NAME
        )
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered)
        qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Store or update MFA record
        if mfa:
            mfa.mfa_secret = secret
            mfa.updated_at = datetime.utcnow()
        else:
            mfa = UserMFA(
                id=str(uuid.uuid4()),
                user_id=user.id,
                mfa_enabled=False,
                mfa_verified=False,
                mfa_secret=secret
            )
            self.db.add(mfa)
            
        self.db.commit()
        
        return {
            "secret": secret,
            "qr_code": f"data:image/png;base64,{qr_code_base64}",
            "manual_entry_key": secret
        }
    
    def verify_mfa_code(self, user: User, code: str) -> bool:
        """Verify an MFA code and enable MFA if it's the first verification"""
        mfa = self.db.query(UserMFA).filter(UserMFA.user_id == user.id).first()
        
        if not mfa or not mfa.mfa_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="MFA is not set up for this user"
            )
            
        # Verify the code
        totp = pyotp.TOTP(mfa.mfa_secret)
        is_valid = totp.verify(code)
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid MFA code"
            )
            
        # If this is the first verification, enable MFA and generate recovery codes
        if not mfa.mfa_verified:
            mfa.mfa_enabled = True
            mfa.mfa_verified = True
            mfa.recovery_codes = self._generate_recovery_codes()
        
        # Update last verified time
        mfa.last_verified = datetime.utcnow()
        self.db.commit()
        
        return True
    
    def get_recovery_codes(self, user: User) -> List[str]:
        """Get recovery codes for a user"""
        mfa = self.db.query(UserMFA).filter(UserMFA.user_id == user.id).first()
        
        if not mfa or not mfa.mfa_enabled or not mfa.mfa_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="MFA is not enabled for this user"
            )
            
        if not mfa.recovery_codes:
            # Generate new codes if none exist
            mfa.recovery_codes = self._generate_recovery_codes()
            self.db.commit()
            
        return mfa.recovery_codes
    
    def regenerate_recovery_codes(self, user: User) -> List[str]:
        """Regenerate recovery codes for a user"""
        mfa = self.db.query(UserMFA).filter(UserMFA.user_id == user.id).first()
        
        if not mfa or not mfa.mfa_enabled or not mfa.mfa_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="MFA is not enabled for this user"
            )
            
        mfa.recovery_codes = self._generate_recovery_codes()
        self.db.commit()
        
        return mfa.recovery_codes
    
    def disable_mfa(self, user: User) -> bool:
        """Disable MFA for a user"""
        mfa = self.db.query(UserMFA).filter(UserMFA.user_id == user.id).first()
        
        if not mfa or not mfa.mfa_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="MFA is not enabled for this user"
            )
            
        mfa.mfa_enabled = False
        self.db.commit()
        
        return True
    
    def reset_mfa(self, user_id: str, admin_user: User) -> bool:
        """Reset MFA for a user (admin only)"""
        if admin_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can reset MFA for users"
            )
            
        mfa = self.db.query(UserMFA).filter(UserMFA.user_id == user_id).first()
        
        if not mfa:
            return True  # Nothing to reset
            
        mfa.mfa_enabled = False
        mfa.mfa_verified = False
        mfa.mfa_secret = None
        mfa.recovery_codes = None
        self.db.commit()
        
        return True
    
    def get_mfa_status(self, user: User) -> Dict[str, Any]:
        """Get MFA status for a user"""
        mfa = self.db.query(UserMFA).filter(UserMFA.user_id == user.id).first()
        
        if not mfa:
            return {
                "enabled": False,
                "verified": False,
                "last_verified": None
            }
            
        return {
            "enabled": mfa.mfa_enabled,
            "verified": mfa.mfa_verified,
            "last_verified": mfa.last_verified
        }
    
    def _generate_recovery_codes(self, count: int = 10, length: int = 8) -> List[str]:
        """Generate a list of recovery codes"""
        alphabet = string.ascii_uppercase + string.digits
        codes = [
            ''.join(secrets.choice(alphabet) for _ in range(length))
            for _ in range(count)
        ]
        return codes

# ============================
# User Management Service
# ============================

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_users(self, skip: int = 0, limit: int = 100, 
                 status: Optional[str] = None, 
                 role: Optional[str] = None,
                 search: Optional[str] = None) -> Tuple[List[User], int]:
        """Get list of users with optional filtering"""
        query = self.db.query(User)
        
        # Apply status filter
        if status:
            try:
                status_enum = UserAccountStatus(status)
                query = query.filter(User.account_status == status_enum)
            except ValueError:
                pass  # Invalid status, ignore filter
        
        # Apply role filter
        if role:
            try:
                role_enum = UserRole(role)
                query = query.filter(User.role == role_enum)
            except ValueError:
                pass  # Invalid role, ignore filter
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.name.ilike(search_term),
                    User.email.ilike(search_term),
                    User.username.ilike(search_term),
                    User.client_company.ilike(search_term)
                )
            )
        
        # Get total count for pagination
        total = query.count()
        
        # Apply pagination and ordering
        users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
        
        return users, total
    
    def get_user(self, user_id: str) -> User:
        """Get user by ID"""
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        return user
    
    def update_user_profile(self, user_id: str, 
                           update_data: Dict[str, Any],
                           current_user: User) -> User:
        """Update user profile"""
        # Only admin or the user themselves can update profile
        if current_user.role != UserRole.ADMIN and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this user"
            )
            
        user = self.get_user(user_id)
        
        # Update allowed fields
        if "name" in update_data:
            user.name = update_data["name"]
        if "zoho_account" in update_data:
            user.zoho_account = update_data["zoho_account"]
        if "client_company" in update_data:
            user.client_company = update_data["client_company"]
        if "contact_information" in update_data:
            user.contact_information = update_data["contact_information"]
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def update_user_status(self, user_id: str, status: UserAccountStatus, admin_user: User) -> User:
        """Update user account status (admin only)"""
        if admin_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can update user status"
            )
            
        user = self.get_user(user_id)
        
        # Don't allow disabling yourself
        if admin_user.id == user_id and status == UserAccountStatus.DISABLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot disable your own account"
            )
            
        user.account_status = status
        
        # Update is_active field based on status
        user.is_active = (status == UserAccountStatus.ACTIVE)
        
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def delete_user(self, user_id: str, admin_user: User) -> bool:
        """Delete user (admin only)"""
        if admin_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can delete users"
            )
            
        user = self.get_user(user_id)
        
        # Don't allow deleting yourself
        if admin_user.id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete your own account"
            )
            
        self.db.delete(user)
        self.db.commit()
        
        return True
        
    def update_mfa_bypass(self, user_id: str, bypass_mfa: bool, admin_user: User) -> User:
        """Update user MFA bypass setting (admin only)"""
        if admin_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can update MFA bypass settings"
            )
            
        user = self.get_user(user_id)
        
        # Update the bypass_mfa flag
        user.bypass_mfa = bypass_mfa
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def get_login_history(self, user_id: str, current_user: User,
                         skip: int = 0, limit: int = 100) -> Tuple[List[UserLoginHistory], int]:
        """Get login history for a user"""
        # Only admin or the user themselves can view login history
        if current_user.role != UserRole.ADMIN and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this user's login history"
            )
            
        # Ensure user exists
        self.get_user(user_id)
        
        # Query login history
        query = self.db.query(UserLoginHistory).filter(UserLoginHistory.user_id == user_id)
        
        # Get total count for pagination
        total = query.count()
        
        # Apply pagination and ordering
        history = query.order_by(UserLoginHistory.login_time.desc()).offset(skip).limit(limit).all()
        
        return history, total

# ============================
# Email Service
# ============================

class EmailService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_email_config(self, tenant_id: Optional[str] = None) -> Optional[EmailConfiguration]:
        """Get email configuration for a tenant or default"""
        if tenant_id:
            config = self.db.query(EmailConfiguration).filter(EmailConfiguration.tenant_id == tenant_id).first()
            if config:
                return config
                
        # Fall back to default config (no tenant_id)
        return self.db.query(EmailConfiguration).filter(EmailConfiguration.tenant_id.is_(None)).first()
    
    def create_or_update_email_config(self, 
                                     tenant_id: Optional[str],
                                     provider: str,
                                     from_email: str,
                                     from_name: str,
                                     reply_to: Optional[str] = None,
                                     settings_dict: Dict[str, Any] = None) -> EmailConfiguration:
        """Create or update email configuration"""
        # Check if config exists
        config = None
        if tenant_id:
            config = self.db.query(EmailConfiguration).filter(EmailConfiguration.tenant_id == tenant_id).first()
        else:
            config = self.db.query(EmailConfiguration).filter(EmailConfiguration.tenant_id.is_(None)).first()
            
        if config:
            # Update existing config
            config.provider = provider
            config.from_email = from_email
            config.from_name = from_name
            config.reply_to = reply_to
            if settings_dict:
                config.settings = settings_dict
            config.updated_at = datetime.utcnow()
        else:
            # Create new config
            config = EmailConfiguration(
                tenant_id=tenant_id,
                provider=provider,
                from_email=from_email,
                from_name=from_name,
                reply_to=reply_to,
                settings=settings_dict or {}
            )
            self.db.add(config)
            
        self.db.commit()
        self.db.refresh(config)
        
        return config
    
    def send_test_email(self, recipient: str, tenant_id: Optional[str] = None) -> bool:
        """Send a test email"""
        config = self.get_email_config(tenant_id)
        
        if not config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email configuration not found"
            )
            
        # For now, just return success
        # In a real implementation, this would connect to the email provider
        # and send an actual test email
        return True
    
    def get_email_templates(self, tenant_id: Optional[str] = None) -> List[EmailTemplate]:
        """Get email templates for a tenant or default"""
        if tenant_id:
            templates = self.db.query(EmailTemplate).filter(EmailTemplate.tenant_id == tenant_id).all()
            if templates:
                return templates
                
        # Fall back to default templates (no tenant_id)
        return self.db.query(EmailTemplate).filter(EmailTemplate.tenant_id.is_(None)).all()
    
    def get_email_template(self, template_id: int, tenant_id: Optional[str] = None) -> EmailTemplate:
        """Get a specific email template"""
        template = self.db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email template not found"
            )
            
        # Check if template belongs to the requested tenant or is a default template
        if tenant_id and template.tenant_id and template.tenant_id != tenant_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email template not found for this tenant"
            )
            
        return template
    
    def create_email_template(self, 
                             name: str,
                             subject: str,
                             html_content: str,
                             text_content: str,
                             tenant_id: Optional[str] = None) -> EmailTemplate:
        """Create a new email template"""
        template = EmailTemplate(
            name=name,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            tenant_id=tenant_id
        )
        
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        
        return template
    
    def update_email_template(self,
                             template_id: int,
                             name: Optional[str] = None,
                             subject: Optional[str] = None,
                             html_content: Optional[str] = None,
                             text_content: Optional[str] = None) -> EmailTemplate:
        """Update an email template"""
        template = self.get_email_template(template_id)
        
        if name:
            template.name = name
        if subject:
            template.subject = subject
        if html_content:
            template.html_content = html_content
        if text_content:
            template.text_content = text_content
            
        template.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(template)
        
        return template

# ============================
# MFA Settings Service
# ============================

class MFASettingsService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_mfa_settings(self, tenant_id: Optional[str] = None) -> MFASettings:
        """Get MFA settings for a tenant or default"""
        if tenant_id:
            settings = self.db.query(MFASettings).filter(MFASettings.tenant_id == tenant_id).first()
            if settings:
                return settings
                
        # Fall back to default settings (no tenant_id)
        settings = self.db.query(MFASettings).filter(MFASettings.tenant_id.is_(None)).first()
        
        # If no settings exist, create default
        if not settings:
            settings = MFASettings(
                tenant_id=None,
                enforcement_type="optional",
                grace_period_days=7,
                totp_enabled=True,
                email_enabled=False,
                sms_enabled=False,
                recovery_codes_enabled=True,
                recovery_codes_count=10,
                recovery_code_length=8
            )
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
            
        return settings
    
    def update_mfa_settings(self,
                           tenant_id: Optional[str] = None,
                           enforcement_type: Optional[str] = None,
                           grace_period_days: Optional[int] = None,
                           totp_enabled: Optional[bool] = None,
                           email_enabled: Optional[bool] = None,
                           sms_enabled: Optional[bool] = None,
                           recovery_codes_enabled: Optional[bool] = None,
                           recovery_codes_count: Optional[int] = None,
                           recovery_code_length: Optional[int] = None) -> MFASettings:
        """Update MFA settings"""
        settings = self.get_mfa_settings(tenant_id)
        
        # Update fields if provided
        if enforcement_type is not None:
            settings.enforcement_type = enforcement_type
        if grace_period_days is not None:
            settings.grace_period_days = grace_period_days
        if totp_enabled is not None:
            settings.totp_enabled = totp_enabled
        if email_enabled is not None:
            settings.email_enabled = email_enabled
        if sms_enabled is not None:
            settings.sms_enabled = sms_enabled
        if recovery_codes_enabled is not None:
            settings.recovery_codes_enabled = recovery_codes_enabled
        if recovery_codes_count is not None:
            settings.recovery_codes_count = recovery_codes_count
        if recovery_code_length is not None:
            settings.recovery_code_length = recovery_code_length
            
        settings.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(settings)
        
        return settings