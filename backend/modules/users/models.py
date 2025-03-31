"""Pydantic models for the users module"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
import re

from db.models import UserRole, InvitationStatus, UserAccountStatus, AuthProvider

# ====================
# Invitation Models
# ====================

class InvitationCreate(BaseModel):
    """Model for creating a new invitation"""
    email: EmailStr
    role: str = Field(default="USER")
    expiration_hours: int = Field(default=48, ge=1, le=168)  # 1 hour to 7 days
    custom_message: Optional[str] = None
    
    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if v not in ["ADMIN", "USER"]:
            raise ValueError('Role must be either "ADMIN" or "USER"')
        return v

class InvitationResponse(BaseModel):
    """Model for invitation response"""
    id: str
    email: EmailStr
    status: InvitationStatus
    expiration_date: datetime
    created_by: str
    role: str
    created_at: datetime
    custom_message: Optional[str] = None
    
    class Config:
        from_attributes = True

class InvitationVerify(BaseModel):
    """Model for verifying invitation token"""
    token: str

class InvitationList(BaseModel):
    """Model for listing invitations"""
    invitations: List[InvitationResponse]
    total: int
    page: int
    limit: int

# ====================
# MFA Models
# ====================

class MFAEnrollRequest(BaseModel):
    """Model for initiating MFA enrollment"""
    pass  # No parameters needed, user is identified from token

class MFAEnrollResponse(BaseModel):
    """Model for MFA enrollment response"""
    secret: str
    qr_code: str  # Base64 encoded QR code image
    manual_entry_key: str

class MFAVerifyRequest(BaseModel):
    """Model for verifying MFA code"""
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")

class MFAStatusResponse(BaseModel):
    """Model for MFA status response"""
    enabled: bool
    verified: bool
    last_verified: Optional[datetime] = None

class MFARecoveryCodesResponse(BaseModel):
    """Model for MFA recovery codes response"""
    codes: List[str]

# ====================
# User Profile Models
# ====================

class ContactInformation(BaseModel):
    """Contact information model"""
    phone: Optional[str] = None
    address: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None

class UserProfileUpdate(BaseModel):
    """Model for updating user profile"""
    name: Optional[str] = None
    zoho_account: Optional[str] = None
    client_company: Optional[str] = None
    contact_information: Optional[ContactInformation] = None

class UserProfileResponse(BaseModel):
    """Model for user profile response"""
    id: str
    username: str
    email: EmailStr
    name: str
    role: UserRole
    tenant_id: Optional[str] = None
    auth_provider: AuthProvider
    account_status: UserAccountStatus
    is_active: bool
    zoho_account: Optional[str] = None
    client_company: Optional[str] = None
    contact_information: Optional[Dict[str, Any]] = None
    mfa_enabled: bool
    bypass_mfa: bool = False
    last_login: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# ====================
# User Management Models
# ====================

class UserList(BaseModel):
    """Model for listing users"""
    users: List[UserProfileResponse]
    total: int
    page: int
    limit: int

class UserStatusUpdate(BaseModel):
    """Model for updating user status"""
    status: UserAccountStatus

# ====================
# Account Creation Models
# ====================

class AcceptInvitation(BaseModel):
    """Model for accepting invitation and creating account"""
    token: str
    name: str
    password: str = Field(min_length=8)
    client_company: Optional[str] = None
    zoho_account: Optional[str] = None
    contact_information: Optional[ContactInformation] = None
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v):
        """Ensure password meets strength requirements"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

# ====================
# Email Configuration Models
# ====================

class Office365Settings(BaseModel):
    """Model for Office 365 email settings"""
    client_id: str
    client_secret: str
    tenant_id: str

class SMTPSettings(BaseModel):
    """Model for SMTP email settings"""
    host: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None
    use_tls: bool = True

class EmailConfigCreate(BaseModel):
    """Model for creating email configuration"""
    provider: str = Field(default="office365")
    from_email: EmailStr
    from_name: str
    reply_to: Optional[EmailStr] = None
    office365_settings: Optional[Office365Settings] = None
    smtp_settings: Optional[SMTPSettings] = None
    
    @field_validator('provider')
    @classmethod
    def validate_provider(cls, v):
        if v not in ["office365", "smtp"]:
            raise ValueError('Provider must be either "office365" or "smtp"')
        return v
    
    @field_validator('office365_settings', 'smtp_settings')
    @classmethod
    def validate_settings(cls, v, info):
        provider = info.data.get('provider')
        if provider == 'office365' and not v and provider == 'office365':
            raise ValueError('Office 365 settings are required when provider is office365')
        if provider == 'smtp' and not v and provider == 'smtp':
            raise ValueError('SMTP settings are required when provider is smtp')
        return v

class EmailConfigResponse(BaseModel):
    """Model for email configuration response"""
    id: int
    tenant_id: Optional[str] = None
    provider: str
    from_email: EmailStr
    from_name: str
    reply_to: Optional[EmailStr] = None
    office365_settings: Optional[Dict[str, Any]] = None
    smtp_settings: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TestEmailRequest(BaseModel):
    """Model for sending a test email"""
    recipient: EmailStr

# ====================
# Email Template Models
# ====================

class EmailTemplateCreate(BaseModel):
    """Model for creating email template"""
    name: str
    subject: str
    html_content: str
    text_content: str

class EmailTemplateResponse(BaseModel):
    """Model for email template response"""
    id: int
    name: str
    subject: str
    html_content: str
    text_content: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ====================
# MFA Settings Models
# ====================

class MFASettingsUpdate(BaseModel):
    """Model for updating MFA settings"""
    enforcement_type: str = Field(default="optional")  # 'optional', 'required', 'required_for_admins'
    grace_period_days: int = Field(default=7, ge=1, le=90)
    totp_enabled: bool = True
    email_enabled: bool = False
    sms_enabled: bool = False
    recovery_codes_enabled: bool = True
    recovery_codes_count: int = Field(default=10, ge=5, le=20)
    recovery_code_length: int = Field(default=8, ge=6, le=12)
    
    @field_validator('enforcement_type')
    @classmethod
    def validate_enforcement_type(cls, v):
        if v not in ["optional", "required", "required_for_admins"]:
            raise ValueError('Enforcement type must be one of: optional, required, required_for_admins')
        return v

class MFASettingsResponse(BaseModel):
    """Model for MFA settings response"""
    id: int
    tenant_id: Optional[str] = None
    enforcement_type: str
    grace_period_days: int
    totp_enabled: bool
    email_enabled: bool
    sms_enabled: bool
    recovery_codes_enabled: bool
    recovery_codes_count: int
    recovery_code_length: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ====================
# MFA Bypass Models
# ====================

class MFABypassUpdate(BaseModel):
    """Model for updating MFA bypass setting"""
    bypass_mfa: bool = Field(default=False, description="Whether to bypass MFA for this user")
    
# ====================
# Login History Models
# ====================

class LoginHistoryResponse(BaseModel):
    """Model for login history response"""
    id: str
    user_id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    login_time: datetime
    success: bool
    failure_reason: Optional[str] = None
    
    class Config:
        from_attributes = True

class LoginHistoryList(BaseModel):
    """Model for listing login history"""
    history: List[LoginHistoryResponse]
    total: int
    page: int
    limit: int