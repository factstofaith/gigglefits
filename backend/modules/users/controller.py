"""User management controllers for the TAP Integration Platform"""

from typing import Optional, List, Dict, Any
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from core.auth import get_current_user, get_current_active_user
from db.base import get_db_session as get_db
from db.models import User, UserRole
from modules.users.models import (
    InvitationCreate, InvitationResponse, InvitationVerify, InvitationList,
    MFAEnrollRequest, MFAEnrollResponse, MFAVerifyRequest, MFAStatusResponse,
    MFARecoveryCodesResponse, UserProfileUpdate, UserProfileResponse, UserList,
    UserStatusUpdate, AcceptInvitation, EmailConfigCreate, EmailConfigResponse,
    TestEmailRequest, EmailTemplateCreate, EmailTemplateResponse, MFASettingsUpdate,
    MFASettingsResponse, LoginHistoryResponse, LoginHistoryList, MFABypassUpdate
)
from modules.users.service import UserService, InvitationService, MFAService, EmailService

from datetime import datetime
from pydantic import BaseModel

# Standard API Response Models
class ResponseMetadata(BaseModel):
    timestamp: datetime
    request_id: str
    api_version: str = "1.0"

class StandardResponse(BaseModel):
    data: Any
    metadata: ResponseMetadata

class PaginationMetadata(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int

class PaginatedResponse(BaseModel):
    data: List[Any]
    pagination: PaginationMetadata
    metadata: ResponseMetadata

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    error: ErrorDetail
    metadata: ResponseMetadata

# Create router
router = APIRouter()

# =========================
# Invitation Endpoints
# =========================

@router.post(
    "/admin/invitations", 
    response_model=InvitationResponse, 
    status_code=status.HTTP_201_CREATED
)
async def create_invitation(
    invitation_data: InvitationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new user invitation"""
    invitation_service = InvitationService(db)
    invitation = invitation_service.create_invitation(
        email=invitation_data.email,
        role=invitation_data.role,
        expiration_hours=invitation_data.expiration_hours,
        created_by=current_user,
        custom_message=invitation_data.custom_message
    )
    return invitation

@router.get("/admin/invitations", response_model=InvitationList)
async def list_invitations(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all invitations with pagination and optional filtering"""
    invitation_service = InvitationService(db)
    invitations, total = invitation_service.get_invitations(
        user=current_user, 
        skip=skip, 
        limit=limit, 
        status=status
    )
    return {
        "invitations": invitations,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }

@router.get("/admin/invitations/{id}", response_model=InvitationResponse)
async def get_invitation(
    id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get invitation details"""
    invitation_service = InvitationService(db)
    invitation = invitation_service.get_invitation(id, current_user)
    return invitation

@router.delete("/admin/invitations/{id}", response_model=InvitationResponse)
async def cancel_invitation(
    id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel an invitation"""
    invitation_service = InvitationService(db)
    invitation = invitation_service.cancel_invitation(id, current_user)
    return invitation

@router.post("/admin/invitations/{id}/resend", response_model=InvitationResponse)
async def resend_invitation(
    id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Resend an invitation"""
    invitation_service = InvitationService(db)
    invitation = invitation_service.resend_invitation(id, current_user)
    return invitation

@router.get("/invitations/verify/{token}", response_model=InvitationResponse)
async def verify_invitation(
    token: str,
    db: Session = Depends(get_db)
):
    """Verify invitation token (public endpoint)"""
    invitation_service = InvitationService(db)
    invitation = invitation_service.verify_token(token)
    return invitation

@router.post("/invitations/accept", response_model=UserProfileResponse)
async def accept_invitation(
    invitation_data: AcceptInvitation,
    db: Session = Depends(get_db)
):
    """Accept invitation and create account (public endpoint)"""
    invitation_service = InvitationService(db)
    user = invitation_service.accept_invitation(
        token=invitation_data.token,
        name=invitation_data.name,
        password=invitation_data.password,
        client_company=invitation_data.client_company,
        zoho_account=invitation_data.zoho_account,
        contact_information=invitation_data.contact_information.model_dump() if invitation_data.contact_information else None
    )
    return user

# =========================
# MFA Endpoints
# =========================

@router.post("/users/mfa/enroll", response_model=MFAEnrollResponse)
async def enroll_mfa(
    request: MFAEnrollRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Begin MFA enrollment process"""
    mfa_service = MFAService(db)
    return mfa_service.generate_mfa_secret(current_user)

@router.post("/users/mfa/verify", response_model=MFAStatusResponse)
async def verify_mfa(
    verification_data: MFAVerifyRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Verify MFA code and complete enrollment"""
    mfa_service = MFAService(db, response_model=StandardResponse)
    mfa_service.verify_mfa_code(current_user, verification_data.code)
    return mfa_service.get_mfa_status(current_user)

@router.get("/users/mfa/status", response_model=MFAStatusResponse)
async def get_mfa_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current MFA status"""
    mfa_service = MFAService(db, response_model=StandardResponse)
    return mfa_service.get_mfa_status(current_user)

@router.get("/users/mfa/recovery-codes", response_model=MFARecoveryCodesResponse)
async def get_recovery_codes(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get MFA recovery codes"""
    mfa_service = MFAService(db)
    codes = mfa_service.get_recovery_codes(current_user)
    return {"codes": codes}

@router.post("/users/mfa/recovery-codes/regenerate", response_model=MFARecoveryCodesResponse)
async def regenerate_recovery_codes(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Regenerate MFA recovery codes"""
    mfa_service = MFAService(db)
    codes = mfa_service.regenerate_recovery_codes(current_user)
    return {"codes": codes}

@router.post("/users/mfa/disable")
async def disable_mfa(
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Disable MFA for current user"""
    mfa_service = MFAService(db)
    mfa_service.disable_mfa(current_user)
    request_id = str(uuid.uuid4())
    return {"data": {"success": True, "message": "MFA disabled successfully"}, "metadata": {"timestamp": datetime.now().isoformat(), "request_id": request_id, "api_version": "1.0"}}

@router.post("/admin/users/{user_id}/mfa/reset", response_model=StandardResponse)
async def reset_user_mfa(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Reset MFA for a user (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can reset user MFA"
        )
    
    mfa_service = MFAService(db)
    mfa_service.reset_mfa(user_id, current_user)
    return {"success": True, "message": "MFA reset successfully"}

# =========================
# User Management Endpoints
# =========================

@router.get("/admin/users", response_model=UserList)
async def list_users(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None,
    role: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all users with pagination and optional filtering"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can list users"
        )
    
    user_service = UserService(db)
    users, total = user_service.get_users(
        skip=skip, 
        limit=limit, 
        status=status,
        role=role,
        search=search
    )
    
    return {
        "users": users,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }

@router.get("/admin/users/{user_id}", response_model=UserProfileResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user details (admin or self)"""
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this user"
        )
    
    user_service = UserService(db)
    user = user_service.get_user(user_id)
    
    # Add MFA status
    mfa_service = MFAService(db)
    mfa_status = mfa_service.get_mfa_status(user)
    user.mfa_enabled = mfa_status["enabled"]
    
    return user

@router.get("/users/profile", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    # Add MFA status
    mfa_service = MFAService(db)
    mfa_status = mfa_service.get_mfa_status(current_user)
    current_user.mfa_enabled = mfa_status["enabled"]
    
    return current_user

@router.put("/users/profile", response_model=UserProfileResponse)
async def update_current_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    user_service = UserService(db)
    
    update_data = {}
    if profile_data.name is not None:
        update_data["name"] = profile_data.name
    if profile_data.zoho_account is not None:
        update_data["zoho_account"] = profile_data.zoho_account
    if profile_data.client_company is not None:
        update_data["client_company"] = profile_data.client_company
    if profile_data.contact_information is not None:
        update_data["contact_information"] = profile_data.contact_information.model_dump()
    
    user = user_service.update_user_profile(
        user_id=current_user.id,
        update_data=update_data,
        current_user=current_user
    )
    
    # Add MFA status
    mfa_service = MFAService(db)
    mfa_status = mfa_service.get_mfa_status(user)
    user.mfa_enabled = mfa_status["enabled"]
    
    return user

@router.patch("/admin/users/{user_id}/status", response_model=UserProfileResponse)
async def update_user_status(
    user_id: str,
    status_data: UserStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user status (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update user status"
        )
    
    user_service = UserService(db)
    user = user_service.update_user_status(user_id, status_data.status, current_user)
    
    return {"success": True, "message": f"User status updated to {status_data.status.value}"}
@router.patch("/admin/users/{user_id}/mfa-bypass", response_model=StandardResponse)
async def update_user_mfa_bypass(
    user_id: str,
    bypass_data: MFABypassUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update MFA bypass setting for a user (admin only)
    
    This endpoint allows administrators to enable or disable MFA bypass for a user.
    Users with MFA bypass enabled will not be required to complete MFA verification
    during login or when accessing protected resources.
    
    Note: This should only be used for admin testing accounts or in special circumstances.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update MFA bypass settings"
        )
    
    user_service = UserService(db)
    user = user_service.update_mfa_bypass(user_id, bypass_data.bypass_mfa, current_user)
    
    return {
        "success": True, 
        "message": f"MFA bypass {'enabled' if bypass_data.bypass_mfa else 'disabled'} for user",
        "user_id": user_id,
        "bypass_mfa": bypass_data.bypass_mfa
    }

@router.delete("/admin/users/{user_id}", response_model=StandardResponse)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete users"
        )
    
    user_service = UserService(db)
    user_service.delete_user(user_id, current_user)
    
    return {"success": True, "message": "User deleted successfully"}

@router.get("/users/{user_id}/login-history", response_model=LoginHistoryList)
async def get_login_history(
    user_id: str,
    skip: int = 0, 
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get login history for a user (admin or self)"""
    user_service = UserService(db)
    history, total = user_service.get_login_history(
        user_id=user_id,
        skip=skip,
        limit=limit,
        current_user=current_user
    )
    
    return {
        "history": history,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }

# =========================
# Email Configuration Endpoints
# =========================

@router.get("/admin/email/config", response_model=EmailConfigResponse)
async def get_email_config(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get email configuration (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view email configuration"
        )
    
    email_service = EmailService(db)
    config = email_service.get_email_config(tenant_id=current_user.tenant_id)
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email configuration not found"
        )
    
    return config

@router.put("/admin/email/config", response_model=EmailConfigResponse)
async def update_email_config(
    config_data: EmailConfigCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update email configuration (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update email configuration"
        )
    
    email_service = EmailService(db)
    
    # Prepare settings dict based on provider
    settings_dict = None
    if config_data.provider == "office365" and config_data.office365_settings:
        settings_dict = config_data.office365_settings.model_dump()
    elif config_data.provider == "smtp" and config_data.smtp_settings:
        settings_dict = config_data.smtp_settings.model_dump()
    
    config = email_service.create_or_update_email_config(
        tenant_id=current_user.tenant_id,
        provider=config_data.provider,
        from_email=config_data.from_email,
        from_name=config_data.from_name,
        reply_to=config_data.reply_to,
        settings_dict=settings_dict
    )
    
    return config

@router.post("/admin/email/test", response_model=StandardResponse)
async def send_test_email(
    test_data: TestEmailRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a test email (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can send test emails"
        )
    
    email_service = EmailService(db)
    
    try:
        email_service.send_test_email(test_data.recipient, tenant_id=current_user.tenant_id)
        return {"success": True, "message": f"Test email sent to {test_data.recipient}"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test email: {str(e)}"
        )

# =========================
# MFA Settings Endpoints
# =========================

@router.get("/admin/mfa/settings", response_model=MFASettingsResponse)
async def get_mfa_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get MFA settings (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view MFA settings"
        )
    
    mfa_settings_service = MFASettingsService(db)
    settings = mfa_settings_service.get_mfa_settings(tenant_id=current_user.tenant_id)
    
    return settings

@router.put("/admin/mfa/settings", response_model=MFASettingsResponse)
async def update_mfa_settings(
    settings_data: MFASettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update MFA settings (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update MFA settings"
        )
    
    mfa_settings_service = MFASettingsService(db)
    settings = mfa_settings_service.update_mfa_settings(
        tenant_id=current_user.tenant_id,
        enforcement_type=settings_data.enforcement_type,
        grace_period_days=settings_data.grace_period_days,
        totp_enabled=settings_data.totp_enabled,
        email_enabled=settings_data.email_enabled,
        sms_enabled=settings_data.sms_enabled,
        recovery_codes_enabled=settings_data.recovery_codes_enabled,
        recovery_codes_count=settings_data.recovery_codes_count,
        recovery_code_length=settings_data.recovery_code_length
    )
    
    return settings