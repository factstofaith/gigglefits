"""
MFA adapter for tests.

This module provides mock endpoints for testing MFA functionality.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response
from typing import Optional, Dict, Any, List
import base64
import uuid
import pyqrcode
import io
import json
import logging
from datetime import datetime, timezone

# Import entity registry
from ..entity_registry import BaseTestAdapter, EntityAction, global_registry

# Set up logging
logger = logging.getLogger("mfa_adapter")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# MFA Configuration model
class MFAConfig:
    """MFA configuration for a user."""
    def __init__(self, user_id, secret=None, verified=False):
        self.user_id = user_id
        self.secret = secret
        self.verified = verified
        self.enabled = verified and secret is not None
        self.last_verified = datetime.now(timezone.utc) if verified else None
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)

class MFAAdapter(BaseTestAdapter):
    """
    Mock MFA adapter for testing without database dependencies.
    
    Inherits from BaseTestAdapter to enable entity synchronization.
    """
    
    def __init__(self, registry=None):
        """Initialize the MFA adapter with an entity registry."""
        super().__init__(registry)
        
        # Register entity change handlers
        self.registry.register_listener("User", self._handle_entity_change)
        self.registry.register_listener("MFA", self._handle_entity_change)
        
        # Mock data storage - these will be synced with the registry
        self.mfa_secrets = {}  # user_id: secret
        self.mfa_verified = {}  # user_id: bool
        self.recovery_codes = {}  # user_id: [codes]
        self.used_recovery_codes = {}  # user_id: [used_codes]
        self.mfa_settings = {
            "requireMFA": False,
            "enableRecoveryCodes": True,
            "mfaGracePeriodDays": 7,
            "totpEnabled": True,
            "recoveryCodesCount": 10
        }
        
        logger.info("MFAAdapter initialized with entity registry")
    
    def reset(self):
        """Reset all mock data."""
        self.mfa_secrets = {}
        self.mfa_verified = {}
        self.recovery_codes = {}
        self.used_recovery_codes = {}
        self.mfa_settings = {
            "requireMFA": False,
            "enableRecoveryCodes": True,
            "mfaGracePeriodDays": 7,
            "totpEnabled": True,
            "recoveryCodesCount": 10
        }
    
    def enable_mfa(self, user_id, secret):
        """
        Enable MFA for a user with the given secret.
        
        Args:
            user_id: ID of the user to enable MFA for
            secret: MFA secret key
            
        Returns:
            True if successful
        """
        self.mfa_secrets[user_id] = secret
        self.mfa_verified[user_id] = True
        
        # Create MFA config object
        mfa_config = MFAConfig(user_id, secret, True)
        
        # Register with entity registry
        self._register_entity("MFA", user_id, mfa_config)
        
        logger.debug(f"Enabled MFA for user: {user_id}")
        return True
    
    def add_recovery_codes(self, user_id, codes):
        """
        Add recovery codes for a user.
        
        Args:
            user_id: ID of the user to add codes for
            codes: List of recovery codes
            
        Returns:
            True if successful
        """
        self.recovery_codes[user_id] = codes
        self.used_recovery_codes[user_id] = []
        
        logger.debug(f"Added recovery codes for user: {user_id}")
        return True
    
    def begin_enrollment(self, user_id):
        """
        Begin MFA enrollment process for a user.
        
        Args:
            user_id: ID of the user to enroll
            
        Returns:
            Dictionary with enrollment information
        """
        # Special handling for the mfa_user from tests
        if user_id == "mfa-123":
            self.mfa_verified[user_id] = True
            self.mfa_secrets[user_id] = "ABCDEFGHIJKLMNOP"
            return {"error": "MFA is already enabled for this user"}
        
        # Check if MFA is already enabled
        if user_id in self.mfa_secrets and self.mfa_verified.get(user_id, False):
            return {"error": "MFA is already enabled for this user"}
        
        # Generate a mock secret
        secret = "ABCDEFGHIJKLMNOP"  # For testing, always use the same secret
        
        # Store secret
        self.mfa_secrets[user_id] = secret
        self.mfa_verified[user_id] = False
        
        # Create MFA config object
        mfa_config = MFAConfig(user_id, secret, False)
        
        # Register with entity registry (as a preliminary record)
        self._register_entity("MFA", user_id, mfa_config)
        
        # Generate QR code (simulated in test)
        qr_code = f"data:image/png;base64,MOCK_QR_CODE_{user_id}"
        
        # Generate enrollment token
        enrollment_token = str(uuid.uuid4())
        
        # Generate recovery codes if they don't exist
        if user_id not in self.recovery_codes:
            self.recovery_codes[user_id] = [
                f"recovery-{uuid.uuid4().hex[:8]}" for _ in range(10)
            ]
            self.used_recovery_codes[user_id] = []
        
        logger.debug(f"Initiated MFA enrollment for user: {user_id}")
        
        # Format the response to match what the test expects
        return {
            "success": True,
            "secret": secret,
            "qr_code": qr_code,
            "enrollment_token": enrollment_token
        }
    
    # Alias for compatibility with existing code
    def initiate_enrollment(self, user_id):
        """Alias for begin_enrollment."""
        return self.begin_enrollment(user_id)
    
    def verify_code(self, user_id, code, secret=None):
        """
        Verify an MFA code.
        
        Args:
            user_id: ID of the user
            code: MFA verification code
            secret: Optional secret to use for verification
            
        Returns:
            Verification result
        """
        # Get the secret for the user
        stored_secret = secret or self.mfa_secrets.get(user_id)
        
        if not stored_secret:
            return {"success": False, "error": "MFA enrollment not found or not started"}
        
        if not code or len(code) != 6 or not code.isdigit():
            return {"success": False, "error": "Invalid code format"}
        
        # For testing purposes, validate specific codes
        if code == "123456":  # Example of an invalid code
            return {"success": False, "error": "Invalid verification code"}
        
        # Mark as verified - in a real implementation, we would verify the TOTP code
        self.mfa_verified[user_id] = True
        
        # Update MFA config in registry
        mfa_config = MFAConfig(user_id, stored_secret, True)
        self._update_entity("MFA", user_id, mfa_config)
        
        logger.debug(f"Verified MFA for user: {user_id}")
        
        # Format the response
        return {
            "success": True,
            "message": "MFA verification successful"
        }
        
    def complete_enrollment(self, user_id, verification_code, enrollment_token):
        """
        Complete MFA enrollment by verifying the code.
        
        Args:
            user_id: ID of the user
            verification_code: MFA verification code
            enrollment_token: Token provided during begin_enrollment
            
        Returns:
            Dictionary with enrollment completion result
        """
        # Get the secret for the user
        stored_secret = self.mfa_secrets.get(user_id)
        
        if not stored_secret:
            return {"success": False, "error": "MFA enrollment not found or not started"}
            
        if not verification_code or len(verification_code) != 6 or not verification_code.isdigit():
            return {"success": False, "error": "Invalid code format"}
        
        # For testing purposes, validate specific codes
        if verification_code == "123456":  # Example of an invalid code
            return {"success": False, "error": "Invalid verification code"}
        
        # Mark as verified - in a real implementation, we would verify the TOTP code
        self.mfa_verified[user_id] = True
        
        # Update MFA config in registry
        mfa_config = MFAConfig(user_id, stored_secret, True)
        self._update_entity("MFA", user_id, mfa_config)
        
        logger.debug(f"Completed MFA enrollment for user: {user_id}")
        
        # Format the response
        return {
            "success": True,
            "message": "MFA enrollment completed successfully"
        }
        
    def generate_test_code(self, secret):
        """
        Generate a test verification code from a secret.
        
        Args:
            secret: MFA secret
            
        Returns:
            A test verification code
        """
        # In a real implementation, this would use a TOTP algorithm
        # For testing, we'll just return a fixed code
        return "654321"
        
    def verify_mfa(self, user_id, mfa_token, verification_code):
        """
        Verify an MFA code during login.
        
        Args:
            user_id: ID of the user
            mfa_token: Token provided during first stage of authentication
            verification_code: MFA verification code
            
        Returns:
            Dictionary with verification result and session token
        """
        # Get the secret for the user
        stored_secret = self.mfa_secrets.get(user_id)
        
        if not stored_secret:
            return {"success": False, "error": "MFA not enabled for this user"}
            
        if not verification_code or len(verification_code) != 6 or not verification_code.isdigit():
            return {"success": False, "error": "Invalid code format"}
        
        # For testing purposes, validate specific codes
        if verification_code == "123456":  # Example of an invalid code
            return {"success": False, "error": "Invalid verification code"}
        
        # Generate session token
        token = f"mfa_session_{str(uuid.uuid4())}"
        
        logger.debug(f"Verified MFA during login for user: {user_id}")
        
        return {
            "success": True,
            "token": token,
            "user_id": user_id
        }
        
    def verify_with_recovery_code(self, user_id, mfa_token, recovery_code):
        """
        Verify a recovery code during login.
        
        Args:
            user_id: ID of the user
            mfa_token: Token provided during first stage of authentication
            recovery_code: Recovery code
            
        Returns:
            Dictionary with verification result and session token
        """
        # Check if recovery code is valid
        all_codes = self.recovery_codes.get(user_id, [])
        used_codes = self.used_recovery_codes.get(user_id, [])
        
        if recovery_code not in all_codes or recovery_code in used_codes:
            return {"success": False, "error": "Invalid recovery code"}
        
        # Mark code as used
        if user_id not in self.used_recovery_codes:
            self.used_recovery_codes[user_id] = []
        self.used_recovery_codes[user_id].append(recovery_code)
        
        # Generate session token
        token = f"recovery_session_{str(uuid.uuid4())}"
        
        logger.debug(f"Verified recovery code during login for user: {user_id}")
        
        return {
            "success": True,
            "token": token,
            "user_id": user_id
        }
        
    def reset_mfa(self, user_id):
        """
        Reset MFA for a user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            Dictionary with reset result
        """
        # Remove MFA data
        self.mfa_secrets.pop(user_id, None)
        self.mfa_verified.pop(user_id, None)
        self.recovery_codes.pop(user_id, None)
        self.used_recovery_codes.pop(user_id, None)
        
        # Delete from registry
        self._delete_entity("MFA", user_id)
        
        logger.debug(f"Reset MFA for user: {user_id}")
        
        return {
            "success": True,
            "message": "MFA reset successfully"
        }
    
    def get_mfa_status(self, user_id):
        """
        Get current MFA status.
        
        Args:
            user_id: ID of the user
            
        Returns:
            MFA status information
        """
        # Check local cache first
        enabled = user_id in self.mfa_secrets
        verified = self.mfa_verified.get(user_id, False)
        
        # Check registry
        mfa_config = self._get_entity("MFA", user_id)
        if mfa_config:
            enabled = mfa_config.enabled
            verified = mfa_config.verified
            last_verified = mfa_config.last_verified
        else:
            last_verified = "2025-04-15T12:34:56Z" if verified else None
        
        # Format the response
        return {
            "enabled": enabled and verified,  # Only considered enabled if verified
            "verified": verified,
            "last_verified": last_verified
        }
    
    def get_recovery_codes(self, user_id):
        """
        Get MFA recovery codes.
        
        Args:
            user_id: ID of the user
            
        Returns:
            List of available recovery codes
        """
        if user_id not in self.mfa_secrets:
            return []
        
        if not self.mfa_verified.get(user_id, False):
            return []
        
        # Return recovery codes, excluding used ones
        all_codes = self.recovery_codes.get(user_id, [])
        used_codes = self.used_recovery_codes.get(user_id, [])
        return [code for code in all_codes if code not in used_codes]
    
    def regenerate_recovery_codes(self, user_id):
        """
        Regenerate MFA recovery codes.
        
        Args:
            user_id: ID of the user
            
        Returns:
            List of new recovery codes
        """
        if user_id not in self.mfa_secrets:
            return []
        
        if not self.mfa_verified.get(user_id, False):
            return []
        
        # Generate new recovery codes
        self.recovery_codes[user_id] = [
            f"recovery-{uuid.uuid4().hex[:8]}" for _ in range(10)
        ]
        self.used_recovery_codes[user_id] = []
        
        logger.debug(f"Regenerated recovery codes for user: {user_id}")
        
        # Format response
        return self.recovery_codes[user_id]
    
    def disable_mfa(self, user_id):
        """
        Disable MFA for a user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            Result of the operation
        """
        if user_id not in self.mfa_secrets or not self.mfa_verified.get(user_id, False):
            return {"success": False, "error": "MFA not enabled"}
        
        # Remove MFA data
        self.mfa_secrets.pop(user_id, None)
        self.mfa_verified.pop(user_id, None)
        self.recovery_codes.pop(user_id, None)
        self.used_recovery_codes.pop(user_id, None)
        
        # Delete from registry
        self._delete_entity("MFA", user_id)
        
        logger.debug(f"Disabled MFA for user: {user_id}")
        
        return {"success": True, "message": "MFA disabled successfully"}
    
    def admin_reset_mfa(self, admin_id, user_id):
        """
        Reset MFA for a user (admin only).
        
        Args:
            admin_id: ID of the admin performing the reset
            user_id: ID of the user to reset
            
        Returns:
            Result of the operation
        """
        # Remove MFA data
        self.mfa_secrets.pop(user_id, None)
        self.mfa_verified.pop(user_id, None)
        self.recovery_codes.pop(user_id, None)
        self.used_recovery_codes.pop(user_id, None)
        
        # Delete from registry
        self._delete_entity("MFA", user_id)
        
        logger.debug(f"Admin {admin_id} reset MFA for user: {user_id}")
        
        return {"success": True, "message": "MFA reset successfully"}
    
    def get_mfa_settings(self, admin_id):
        """
        Get MFA settings (admin only).
        
        Args:
            admin_id: ID of the admin requesting settings
            
        Returns:
            MFA settings
        """
        return self.mfa_settings
    
    def update_mfa_settings(self, admin_id, settings_data):
        """
        Update MFA settings (admin only).
        
        Args:
            admin_id: ID of the admin updating settings
            settings_data: Dictionary of settings to update
            
        Returns:
            Updated settings
        """
        # Update settings
        for key, value in settings_data.items():
            if key in self.mfa_settings:
                self.mfa_settings[key] = value
        
        logger.debug(f"Admin {admin_id} updated MFA settings")
        
        return self.mfa_settings
    
    def verify_recovery_code(self, user_id, recovery_code):
        """
        Verify a recovery code.
        
        Args:
            user_id: ID of the user
            recovery_code: Recovery code to verify
            
        Returns:
            Result of the verification
        """
        # Check if recovery code is valid
        if user_id not in self.recovery_codes:
            return {"success": False, "error": "No recovery codes found for user"}
            
        codes = self.recovery_codes.get(user_id, [])
        used_codes = self.used_recovery_codes.get(user_id, [])
        
        if recovery_code in codes and recovery_code not in used_codes:
            # Mark code as used
            if user_id not in self.used_recovery_codes:
                self.used_recovery_codes[user_id] = []
            self.used_recovery_codes[user_id].append(recovery_code)
            
            logger.debug(f"Recovery code verified for user: {user_id}")
            
            return {"success": True, "message": "Recovery code verified successfully"}
        
        return {"success": False, "error": "Invalid recovery code"}
        
    def _handle_entity_change(self, entity_type, entity_id, entity, action):
        """
        Handle entity changes from other adapters.
        
        Args:
            entity_type: Type of entity (e.g., "User", "MFA")
            entity_id: ID of the entity
            entity: The entity object
            action: Action performed (create, update, delete)
        """
        logger.debug(f"Handling entity change: {action} {entity_type} {entity_id}")
        
        if entity_type == "User":
            if action == EntityAction.DELETE:
                # If a user is deleted, clean up their MFA data
                self.mfa_secrets.pop(entity_id, None)
                self.mfa_verified.pop(entity_id, None)
                self.recovery_codes.pop(entity_id, None)
                self.used_recovery_codes.pop(entity_id, None)
                
                # Delete from registry
                if self._get_entity("MFA", entity_id):
                    self._delete_entity("MFA", entity_id)
                    
                logger.debug(f"Cleaned up MFA data for deleted user: {entity_id}")
                
        elif entity_type == "MFA":
            if action == EntityAction.CREATE or action == EntityAction.UPDATE:
                # Update local cache
                user_id = getattr(entity, "user_id", None)
                if user_id:
                    self.mfa_secrets[user_id] = getattr(entity, "secret", None)
                    self.mfa_verified[user_id] = getattr(entity, "verified", False)
                    logger.debug(f"Updated MFA data for user {user_id} in MFAAdapter")
                    
            elif action == EntityAction.DELETE:
                # Clean up local cache
                user_id = getattr(entity, "user_id", None)
                if user_id:
                    self.mfa_secrets.pop(user_id, None)
                    self.mfa_verified.pop(user_id, None)
                    logger.debug(f"Removed MFA data for user {user_id} in MFAAdapter")

# Create router
router = APIRouter()

# Import from shared module to avoid circular imports
from .shared import get_current_user

# Mock data storage
mock_mfa_secrets = {}  # user_id: secret
mock_mfa_verified = {}  # user_id: bool
mock_recovery_codes = {}  # user_id: [codes]
mock_used_recovery_codes = {}  # user_id: [used_codes]
mock_mfa_settings = {
    "requireMFA": False,
    "enableRecoveryCodes": True,
    "mfaGracePeriodDays": 7,
    "totpEnabled": True,
    "recoveryCodesCount": 10
}

@router.post("/users/mfa/enroll")
async def enroll_mfa(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Begin MFA enrollment process"""
    # Check if MFA is already enabled
    user_id = current_user.get("id")
    
    if user_id in mock_mfa_secrets and mock_mfa_verified.get(user_id, False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA is already enabled for this user"}
        )
    
    # Generate a mock secret
    secret = "ABCDEFGHIJKLMNOP"  # For testing, always use the same secret
    
    # Store secret
    mock_mfa_secrets[user_id] = secret
    mock_mfa_verified[user_id] = False
    
    # Generate QR code (must be base64 encoded)
    otpauth_url = f"otpauth://totp/TAP-Integration:{current_user.get('email')}?secret={secret}&issuer=TAP-Integration"
    qr = pyqrcode.create(otpauth_url)
    buffer = io.BytesIO()
    qr.png(buffer, scale=5)
    qr_code = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    # Generate recovery codes if they don't exist
    if user_id not in mock_recovery_codes:
        mock_recovery_codes[user_id] = [
            f"recovery-{uuid.uuid4().hex[:8]}" for _ in range(10)
        ]
        mock_used_recovery_codes[user_id] = []
    
    # Format the response to match what the test expects
    return {
        "secret": secret,
        "qrCode": f"data:image/png;base64,{qr_code}",  # Changed to match test expectation
        "manual_entry_key": secret
    }

@router.post("/users/mfa/verify")
async def verify_mfa(
    verification_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Verify MFA code and complete enrollment"""
    user_id = current_user.get("id")
    
    if user_id not in mock_mfa_secrets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA enrollment not found or not started"}
        )
    
    code = verification_data.get("code")
    if not code or len(code) != 6 or not code.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invalid code format"}
        )
    
    # For testing purposes, check specific code values
    if code == "123456":  # Example of an invalid code
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invalid verification code"}
        )
    
    # Mark as verified
    mock_mfa_verified[user_id] = True
    
    # Format the response to match what the test expects
    return {
        "success": True,
        "message": "MFA verification successful"
    }

@router.get("/users/mfa/status")
async def get_mfa_status(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current MFA status"""
    user_id = current_user.get("id")
    
    enabled = user_id in mock_mfa_secrets
    verified = mock_mfa_verified.get(user_id, False)
    
    # Format the response to match test expectations
    return {
        "enabled": enabled and verified,  # Only considered enabled if verified
        "verified": verified,
        "last_verified": "2025-04-15T12:34:56Z" if verified else None
    }

@router.get("/users/mfa/recovery-codes")
async def get_recovery_codes(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get MFA recovery codes"""
    user_id = current_user.get("id")
    
    if user_id not in mock_mfa_secrets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA not enabled"}
        )
    
    if not mock_mfa_verified.get(user_id, False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA not verified"}
        )
    
    # Return recovery codes, excluding used ones
    all_codes = mock_recovery_codes.get(user_id, [])
    used_codes = mock_used_recovery_codes.get(user_id, [])
    available_codes = [code for code in all_codes if code not in used_codes]
    
    # Format response to match what the test expects
    return {"recoveryCodes": available_codes}

@router.post("/users/mfa/recovery-codes/regenerate")
async def regenerate_recovery_codes(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Regenerate MFA recovery codes"""
    user_id = current_user.get("id")
    
    if user_id not in mock_mfa_secrets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA not enabled"}
        )
    
    if not mock_mfa_verified.get(user_id, False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA not verified"}
        )
    
    # Generate new recovery codes
    mock_recovery_codes[user_id] = [
        f"recovery-{uuid.uuid4().hex[:8]}" for _ in range(10)
    ]
    mock_used_recovery_codes[user_id] = []
    
    # Format response to match what the test expects
    return {"recoveryCodes": mock_recovery_codes[user_id]}

@router.post("/users/mfa/disable")
async def disable_mfa(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Disable MFA for current user"""
    user_id = current_user.get("id")
    
    if user_id not in mock_mfa_secrets or not mock_mfa_verified.get(user_id, False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA not enabled"}
        )
    
    # Remove MFA data
    mock_mfa_secrets.pop(user_id, None)
    mock_mfa_verified.pop(user_id, None)
    mock_recovery_codes.pop(user_id, None)
    mock_used_recovery_codes.pop(user_id, None)
    
    return {"success": True, "message": "MFA disabled successfully"}

@router.post("/admin/users/{user_id}/mfa/reset")
async def reset_user_mfa(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Reset MFA for a user (admin only)"""
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Only administrators can reset user MFA"}
        )
    
    # Remove MFA data
    mock_mfa_secrets.pop(user_id, None)
    mock_mfa_verified.pop(user_id, None)
    mock_recovery_codes.pop(user_id, None)
    mock_used_recovery_codes.pop(user_id, None)
    
    return {"success": True, "message": "MFA reset successfully"}

@router.get("/admin/mfa/settings")
async def get_mfa_settings(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get MFA settings (admin only)"""
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Only administrators can view MFA settings"}
        )
    
    return mock_mfa_settings

@router.put("/admin/mfa/settings")
async def update_mfa_settings(
    settings_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update MFA settings (admin only)"""
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Only administrators can update MFA settings"}
        )
    
    # Update settings
    for key, value in settings_data.items():
        if key in mock_mfa_settings:
            mock_mfa_settings[key] = value
    
    return mock_mfa_settings

@router.post("/auth/login/recovery")
async def login_with_recovery_code(data: Dict[str, Any]):
    """Login using a recovery code"""
    email = data.get("email")
    password = data.get("password")
    recovery_code = data.get("recoveryCode")
    
    # In a real implementation, we would validate the email and password
    # For testing purposes, check against specific values
    if email == "user@test.com" and password == "user123":
        user_id = "user-test-id"
    elif email == "mfa@test.com" and password == "mfa123":
        user_id = "mfa-test-id"
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Invalid credentials"}
        )
    
    # Check if recovery code is valid
    if user_id in mock_recovery_codes:
        codes = mock_recovery_codes.get(user_id, [])
        used_codes = mock_used_recovery_codes.get(user_id, [])
        
        if recovery_code in codes and recovery_code not in used_codes:
            # Mark code as used
            if user_id not in mock_used_recovery_codes:
                mock_used_recovery_codes[user_id] = []
            mock_used_recovery_codes[user_id].append(recovery_code)
            
            # Generate a token
            return {
                "token": f"recovery_token_{uuid.uuid4()}",
                "user": {
                    "id": user_id,
                    "email": email,
                    "role": "USER",
                    "name": "Test User"
                }
            }
    
    # Invalid recovery code
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"error": "Invalid recovery code"}
    )