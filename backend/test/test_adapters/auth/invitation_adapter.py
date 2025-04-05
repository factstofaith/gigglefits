"""
Invitation adapter for tests.

This module provides mock endpoints for testing the invitation workflow.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta, timezone
import uuid
import json
import pytz
import enum
import logging

# Import entity registry
from ..entity_registry import BaseTestAdapter, EntityAction, global_registry

# Set up logging
logger = logging.getLogger("invitation_adapter")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Timezone utilities
def ensure_timezone_aware(dt):
    """Ensure a datetime is timezone-aware, converting to timezone if it's naive."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt

def get_utc_now():
    """Get current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)

# Define invitation status
class InvitationStatus(enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    CANCELED = "CANCELED"
    EXPIRED = "EXPIRED"

# Invitation model
class Invitation:
    """Invitation model for the invitation adapter."""
    def __init__(self, id, email, role, token, status, created_by, custom_message=None, 
                 expires_at=None, created_at=None, accepted_at=None, accepted_by=None):
        self.id = id
        self.email = email
        self.role = role
        self.token = token
        self.status = status
        self.created_by = created_by
        self.custom_message = custom_message
        self.created_at = created_at or get_utc_now()
        self.expires_at = expires_at or (self.created_at + timedelta(hours=48))
        self.accepted_at = accepted_at
        self.accepted_by = accepted_by
        self.updated_at = self.created_at

# Invitation adapter class for simplified testing
class InvitationAdapter(BaseTestAdapter):
    """
    Mock invitation adapter for testing without database dependencies.
    
    Inherits from BaseTestAdapter to enable entity synchronization.
    """
    
    def __init__(self, registry=None):
        """Initialize the invitation adapter with an entity registry."""
        super().__init__(registry)
        
        # Register entity change handlers
        self.registry.register_listener("User", self._handle_entity_change)
        self.registry.register_listener("Invitation", self._handle_entity_change)
        
        # Mock data storage - these will be synced with the registry
        self.invitations = {}  # id: invitation
        self.invitation_tokens = {}  # token: invitation_id
        self.users = {}  # id: user
        
        logger.info("InvitationAdapter initialized with entity registry")
    
    def reset(self):
        """Reset all mock data."""
        self.invitations = {}
        self.invitation_tokens = {}
        self.users = {}
    
    def add_invitation(self, invitation):
        """
        Add an invitation to the mock data store and registry.
        
        Args:
            invitation: Invitation object
            
        Returns:
            The invitation object
        """
        self.invitations[invitation.id] = invitation
        self.invitation_tokens[invitation.token] = invitation.id
        
        # Register with entity registry
        self._register_entity("Invitation", invitation.id, invitation)
        
        logger.debug(f"Added invitation: {invitation.id} for {invitation.email}")
        return invitation
    
    def get_invitation_by_id(self, invitation_id):
        """
        Get an invitation by ID, checking both local cache and entity registry.
        
        Args:
            invitation_id: ID of the invitation
            
        Returns:
            Invitation object or None if not found
        """
        # Try local cache first
        invitation = self.invitations.get(invitation_id)
        if invitation:
            return invitation
            
        # Try registry
        invitation = self._get_entity("Invitation", invitation_id)
        if invitation:
            # Update local cache
            self.invitations[invitation_id] = invitation
            self.invitation_tokens[invitation.token] = invitation_id
            return invitation
            
        return None
    
    def get_invitation_by_token(self, token):
        """
        Get an invitation by token.
        
        Args:
            token: Invitation token
            
        Returns:
            Invitation object or None if not found
        """
        invitation_id = self.invitation_tokens.get(token)
        if not invitation_id:
            # Try to find in registry by token
            for invite_id, invite in self.registry.get_entities_by_type("Invitation").items():
                if hasattr(invite, "token") and invite.token == token:
                    self.invitation_tokens[token] = invite_id
                    self.invitations[invite_id] = invite
                    return invite
            return None
        
        return self.get_invitation_by_id(invitation_id)
    
    def is_valid(self, token):
        """
        Check if an invitation is valid (exists, is pending, and not expired).
        
        Args:
            token: Invitation token
            
        Returns:
            True if invitation is valid, False otherwise
        """
        invitation = self.get_invitation_by_token(token)
        
        if not invitation:
            return False
            
        if invitation.status != InvitationStatus.PENDING.value:
            return False
            
        if hasattr(invitation, "expires_at"):
            expires_at = ensure_timezone_aware(invitation.expires_at)
            if expires_at < get_utc_now():
                return False
                
        return True
    
    def create_invitation(self, email, role, created_by, expires_at=None, custom_message=None):
        """
        Create a new invitation.
        
        Args:
            email: Email address to send the invitation to
            role: Role to assign to the user (e.g., "USER", "ADMIN")
            created_by: ID of the user creating the invitation
            expires_at: Optional expiration datetime (defaults to 48 hours from now)
            custom_message: Optional custom message to include in the invitation
            
        Returns:
            Dictionary with invitation details
        """
        # Generate a unique token
        token = str(uuid.uuid4())
        
        # Create invitation
        invitation_id = str(uuid.uuid4())
        created_at = get_utc_now()
        
        # Set expiration if not provided
        if not expires_at:
            expires_at = created_at + timedelta(hours=48)
        
        # Create the invitation object using our Invitation class
        invitation = Invitation(
            id=invitation_id,
            email=email,
            role=role,
            token=token,
            status=InvitationStatus.PENDING.value,
            custom_message=custom_message,
            created_by=created_by,
            created_at=created_at,
            expires_at=expires_at
        )
        
        # Store invitation and register with registry
        self.add_invitation(invitation)
        
        logger.debug(f"Created invitation: {invitation_id} for {email}")
        
        # Return as dictionary for compatibility with test
        return {
            "id": invitation_id,
            "email": email,
            "role": role,
            "token": token,
            "status": InvitationStatus.PENDING.value,
            "created_by": created_by,
            "custom_message": custom_message,
            "created_at": created_at,
            "expires_at": expires_at,
            "updated_at": created_at
        }
    
    def update_invitation(self, invitation_id, updates):
        """
        Update an invitation and sync with the entity registry.
        
        Args:
            invitation_id: ID of the invitation to update
            updates: Dictionary of fields to update
            
        Returns:
            Updated invitation or None if not found
        """
        invitation = self.get_invitation_by_id(invitation_id)
        if not invitation:
            return None
            
        # Apply updates
        for key, value in updates.items():
            if hasattr(invitation, key):
                setattr(invitation, key, value)
        
        # Update timestamp
        invitation.updated_at = get_utc_now()
        
        # Update in the registry
        self._update_entity("Invitation", invitation_id, invitation)
        
        logger.debug(f"Updated invitation: {invitation_id}")
        return invitation
        
    def extend_invitation(self, invitation_id, days, extended_by):
        """
        Extend an invitation's expiration date.
        
        Args:
            invitation_id: ID of the invitation to extend
            days: Number of days to extend the invitation
            extended_by: ID of the user extending the invitation
            
        Returns:
            Dictionary with success status and extended invitation details
        """
        invitation = self.get_invitation_by_id(invitation_id)
        if not invitation:
            return {"success": False, "error": "Invitation not found"}
            
        # Create a new expiration date
        new_expiration = get_utc_now() + timedelta(days=days)
        
        # Update invitation
        invitation.expires_at = new_expiration
        invitation.status = InvitationStatus.PENDING.value  # Reset to pending if expired
        invitation.updated_at = get_utc_now()
        invitation.extended_by = extended_by
        invitation.extended_at = get_utc_now()
        
        # Generate a new token
        new_token = str(uuid.uuid4())
        old_token = invitation.token
        invitation.token = new_token
        
        # Update token mapping
        self.invitation_tokens.pop(old_token, None)
        self.invitation_tokens[new_token] = invitation.id
        
        # Update in the registry
        self._update_entity("Invitation", invitation_id, invitation)
        
        logger.debug(f"Extended invitation: {invitation_id} by {days} days")
        
        return {
            "success": True,
            "id": invitation.id,
            "email": invitation.email,
            "token": new_token,
            "expires_at": invitation.expires_at,
            "status": invitation.status
        }
    
    def accept_invitation(self, token):
        """
        Accept an invitation and return a registration token.
        
        Args:
            token: Invitation token
            
        Returns:
            Dictionary with registration token or error
        """
        # Get invitation
        invitation = self.get_invitation_by_token(token)
        
        if not invitation:
            return {"success": False, "error": "Invitation not found"}
        
        # Check invitation status
        if invitation.status != InvitationStatus.PENDING.value:
            return {"success": False, "error": f"Invitation status is {invitation.status}"}
        
        # Check if invitation is expired
        # Convert naive datetime to timezone-aware if needed
        if hasattr(invitation, "expires_at"):
            # Use utility function to ensure timezone awareness
            expires_at = ensure_timezone_aware(invitation.expires_at)
                
            if expires_at < get_utc_now():
                # Update invitation status
                invitation.status = InvitationStatus.EXPIRED.value
                invitation.updated_at = get_utc_now()
                self._update_entity("Invitation", invitation.id, invitation)
                
                return {"success": False, "error": "Invitation has expired"}
        
        # Generate registration token
        registration_token = str(uuid.uuid4())
        
        # Update invitation to mark as being processed
        invitation.registration_token = registration_token
        invitation.updated_at = get_utc_now()
        
        # Update invitation in the registry
        self._update_entity("Invitation", invitation.id, invitation)
        
        logger.debug(f"Accepted invitation: {invitation.id}, generated registration token")
        
        return {
            "success": True,
            "registration_token": registration_token,
            "email": invitation.email,
            "role": invitation.role
        }
    
    def get_oauth_auth_url(self, invitation_token, provider):
        """
        Get OAuth authorization URL for an invitation.
        
        Args:
            invitation_token: Invitation token
            provider: OAuth provider enum
            
        Returns:
            Dictionary with auth_url or error
        """
        # Get invitation
        invitation = self.get_invitation_by_token(invitation_token)
        
        if not invitation:
            return {"error": "Invitation not found", "status_code": 404}
            
        # Create state parameter with invitation token
        state = f"{invitation_token}_random"
        
        # Create mock OAuth URL based on provider
        if provider.value == "office365":
            auth_url = (
                "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
                f"?client_id=mock_client_id"
                f"&redirect_uri=http://localhost:3000/api/invitations/oauth/office365/callback"
                f"&response_type=code"
                f"&scope=openid%20profile%20email%20offline_access"
                f"&state={state}"
            )
        else:  # Gmail
            auth_url = (
                "https://accounts.google.com/o/oauth2/auth"
                f"?client_id=mock_client_id"
                f"&redirect_uri=http://localhost:3000/api/invitations/oauth/gmail/callback"
                f"&response_type=code"
                f"&scope=openid%20profile%20email"
                f"&state={state}"
            )
        
        logger.debug(f"Generated OAuth URL for invitation: {invitation.id}")
        return {"auth_url": auth_url}
    
    def process_oauth_callback(self, code, state, provider, user_info):
        """
        Process OAuth callback.
        
        Args:
            code: OAuth authorization code
            state: OAuth state parameter containing invitation token
            provider: OAuth provider enum
            user_info: Dictionary of user info from OAuth provider
            
        Returns:
            Dictionary with user and token information
        """
        # Extract token from state
        if not state or "_" not in state:
            raise ValueError("Invalid state parameter")
            
        token = state.split("_")[0]
        
        # For test where we're explicitly testing invalid state parameter
        if state == "invalid_token_format":
            raise ValueError("Invalid state parameter")
            
        # Get invitation
        invitation = self.get_invitation_by_token(token)
        
        if not invitation:
            raise ValueError("Invalid invitation token")
            
        # Check invitation status
        if invitation.status != InvitationStatus.PENDING.value:
            return {"error": f"Invitation status is {invitation.status}", "status_code": 400}
        
        # Create user
        user_id = str(uuid.uuid4())
        created_at = get_utc_now()
        
        # Create user from OAuth info
        name = user_info.get("name")
        email = invitation.email
        client_company = user_info.get("client_company", "Test Company")
        
        # Import the User class from auth_adapter
        from .auth_adapter import User
        
        # Create the user object
        user = User(
            id=user_id,
            email=email,
            name=name,
            role=invitation.role,
            mfa_enabled=False
        )
        
        # Set OAuth-specific properties
        user.oauth_provider = provider.value
        user.client_company = client_company
        user.invite_id = invitation.id
        user.is_active = True
        user.created_at = created_at
        
        # Store user in local cache
        self.users[user_id] = user
        
        # Register user with the entity registry
        self._register_entity("User", user_id, user)
        
        # Update invitation
        invitation.status = InvitationStatus.ACCEPTED.value
        invitation.accepted_at = created_at
        invitation.accepted_by = user_id
        invitation.updated_at = created_at
        
        # Update invitation in the registry
        self._update_entity("Invitation", invitation.id, invitation)
        
        logger.debug(f"Processed OAuth callback for invitation: {invitation.id}, created user: {user_id}")
        
        # Generate mock token response
        return {
            "user_id": user_id,
            "access_token": f"mock_oauth_token_{uuid.uuid4()}",
            "token_type": "bearer",
            "requires_mfa": True
        }
        
    def _handle_entity_change(self, entity_type, entity_id, entity, action):
        """
        Handle entity changes from other adapters.
        
        Args:
            entity_type: Type of entity (e.g., "User", "Invitation")
            entity_id: ID of the entity
            entity: The entity object
            action: Action performed (create, update, delete)
        """
        logger.debug(f"Handling entity change: {action} {entity_type} {entity_id}")
        
        if entity_type == "User":
            if action == EntityAction.CREATE or action == EntityAction.UPDATE:
                # Update user in local cache if it came from another adapter
                if entity_id not in self.users:
                    self.users[entity_id] = entity
                    logger.debug(f"Added user from registry: {entity_id}")
                    
            elif action == EntityAction.DELETE:
                # Remove user from local cache
                self.users.pop(entity_id, None)
                
                # Update any invitations for this user
                for invitation_id, invitation in self.invitations.items():
                    if hasattr(invitation, "accepted_by") and invitation.accepted_by == entity_id:
                        # User who accepted the invitation was deleted
                        # In a real system, we might handle this differently
                        logger.debug(f"User {entity_id} who accepted invitation {invitation_id} was deleted")
                
        elif entity_type == "Invitation":
            if action == EntityAction.CREATE or action == EntityAction.UPDATE:
                # Update invitation in local cache
                self.invitations[entity_id] = entity
                if hasattr(entity, "token"):
                    self.invitation_tokens[entity.token] = entity_id
                logger.debug(f"Updated invitation in local cache: {entity_id}")
                
            elif action == EntityAction.DELETE:
                # Remove invitation from local cache
                if entity_id in self.invitations:
                    token = self.invitations[entity_id].token
                    self.invitation_tokens.pop(token, None)
                self.invitations.pop(entity_id, None)
                logger.debug(f"Removed invitation from local cache: {entity_id}")

# Create router
router = APIRouter()

# Mock data storage
mock_invitations = {}  # id: invitation
mock_invitation_tokens = {}  # token: invitation_id
mock_users = {}  # id: user

class MockInvitationStatus:
    """Mock invitation status enum"""
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    CANCELED = "CANCELED"
    EXPIRED = "EXPIRED"

# Import from auth_adapter to avoid circular imports
from .auth_adapter import get_current_user, create_access_token, create_refresh_token

def generate_token():
    """Generate a unique invitation token"""
    return str(uuid.uuid4())

@router.post("/admin/invitations", status_code=status.HTTP_201_CREATED)
async def create_invitation(
    invitation_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new invitation as an admin"""
    # Check if user is admin
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create invitations"
        )
    
    email = invitation_data.get("email")
    role = invitation_data.get("role", "USER")
    client_company = invitation_data.get("client_company", "Test Company")
    custom_message = invitation_data.get("custom_message")
    expiration_hours = invitation_data.get("expiration_hours", 48)
    
    # Generate token
    token = generate_token()
    
    # Create invitation
    invitation_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)
    expires_at = created_at + timedelta(hours=expiration_hours)
    
    invitation = {
        "id": invitation_id,
        "email": email,
        "role": role,
        "client_company": client_company,
        "custom_message": custom_message,
        "token": token,
        "status": MockInvitationStatus.PENDING,
        "created_by": current_user.get("id"),
        "created_by_name": current_user.get("name", "Admin Test"),
        "created_at": created_at.isoformat(),
        "expiration_date": expires_at.isoformat(),
        "updated_at": created_at.isoformat()
    }
    
    # Store invitation
    mock_invitations[invitation_id] = invitation
    mock_invitation_tokens[token] = invitation_id
    
    return invitation

@router.get("/admin/invitations")
async def list_invitations(
    current_user: Dict[str, Any] = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
):
    """List all invitations"""
    # Check if user is admin
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can list invitations"
        )
    
    # Filter by status if provided
    invitations = list(mock_invitations.values())
    if status:
        invitations = [inv for inv in invitations if inv["status"] == status]
    
    # Sort by creation date (newest first)
    invitations.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Paginate
    total = len(invitations)
    invitations = invitations[skip:skip+limit]
    
    return {
        "invitations": invitations,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "limit": limit
    }

@router.get("/admin/invitations/{id}")
async def get_invitation(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get invitation details"""
    # Check if user is admin
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view invitations"
        )
    
    # Get invitation
    invitation = mock_invitations.get(id)
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    return invitation

@router.delete("/admin/invitations/{id}")
async def delete_invitation(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Cancel an invitation"""
    # Check if user is admin
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete invitations"
        )
    
    # Get invitation
    invitation = mock_invitations.get(id)
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    # Cancel invitation
    invitation["status"] = MockInvitationStatus.CANCELED
    invitation["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    return {"message": "Invitation canceled successfully"}

@router.get("/invitations/verify/{token}")
async def verify_invitation(token: str):
    """Verify invitation token (public endpoint)"""
    # Check if token exists
    if token not in mock_invitation_tokens:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Invitation not found"}
        )
    
    # Get invitation
    invitation_id = mock_invitation_tokens[token]
    invitation = mock_invitations.get(invitation_id)
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Invitation not found"}
        )
    
    # Check invitation status
    if invitation["status"] != MockInvitationStatus.PENDING:
        if invitation["status"] == MockInvitationStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Invitation has already been accepted"}
            )
        elif invitation["status"] == MockInvitationStatus.CANCELED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Invitation has been canceled"}
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": f"Invitation status is {invitation['status']}"}
            )
    
    # Check if invitation is expired
    expiration_date = datetime.fromisoformat(invitation["expiration_date"])
    if expiration_date < datetime.now(timezone.utc):
        invitation["status"] = MockInvitationStatus.EXPIRED
        invitation["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail={"error": "Invitation has expired"}
        )
    
    return invitation

@router.post("/invitations/accept", status_code=status.HTTP_201_CREATED)
async def accept_invitation(invitation_data: Dict[str, Any]):
    """Accept invitation via email registration"""
    token = invitation_data.get("token")
    
    # Check if token exists
    if token not in mock_invitation_tokens:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Invitation not found"}
        )
    
    # Get invitation
    invitation_id = mock_invitation_tokens[token]
    invitation = mock_invitations.get(invitation_id)
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Invitation not found"}
        )
    
    # Check invitation status
    if invitation["status"] != MockInvitationStatus.PENDING:
        if invitation["status"] == MockInvitationStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Invitation has already been accepted"}
            )
        elif invitation["status"] == MockInvitationStatus.CANCELED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Invitation has been canceled"}
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": f"Invitation status is {invitation['status']}"}
            )
    
    # Check if invitation is expired
    expiration_date = datetime.fromisoformat(invitation["expiration_date"])
    if expiration_date < datetime.now(timezone.utc):
        invitation["status"] = MockInvitationStatus.EXPIRED
        invitation["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail={"error": "Invitation has expired"}
        )
    
    # Get user data
    password = invitation_data.get("password")
    if not password or len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Password must be at least 8 characters"}
        )
    
    full_name = invitation_data.get("fullName")
    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Full name is required"}
        )
    
    client_company = invitation_data.get("clientCompany", invitation["client_company"])
    position = invitation_data.get("position")
    department = invitation_data.get("department")
    
    # Create user
    user_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)
    
    user = {
        "id": user_id,
        "email": invitation["email"],
        "full_name": full_name,
        "role": invitation["role"],
        "client_company": client_company,
        "position": position,
        "department": department,
        "created_at": created_at.isoformat(),
        "is_active": True,
        "mfa_enabled": False
    }
    
    # Store user
    mock_users[user_id] = user
    
    # Update invitation status
    invitation["status"] = MockInvitationStatus.ACCEPTED
    invitation["updated_at"] = created_at.isoformat()
    invitation["accepted_at"] = created_at.isoformat()
    invitation["user_id"] = user_id
    
    # Create token for the new user
    token_data = {
        "sub": user_id,
        "email": invitation["email"],
        "role": invitation["role"]
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "user": user,
        "requiresMFA": True  # Always require MFA for new users
    }

@router.get("/invitations/oauth/{provider}/url")
async def get_oauth_url(provider: str, token: str):
    """Get OAuth URL for invitation"""
    valid_providers = ["office365", "gmail"]
    
    if provider not in valid_providers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": f"Invalid provider. Must be one of: {', '.join(valid_providers)}"}
        )
    
    # Check if token exists
    if token not in mock_invitation_tokens:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Invitation not found"}
        )
    
    # Get invitation
    invitation_id = mock_invitation_tokens[token]
    invitation = mock_invitations.get(invitation_id)
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Invitation not found"}
        )
    
    # Check invitation status
    if invitation["status"] != MockInvitationStatus.PENDING:
        if invitation["status"] == MockInvitationStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Invitation has already been accepted"}
            )
        elif invitation["status"] == MockInvitationStatus.CANCELED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Invitation has been canceled"}
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": f"Invitation status is {invitation['status']}"}
            )
    
    # Check if invitation is expired
    expiration_date = datetime.fromisoformat(invitation["expiration_date"])
    if expiration_date < datetime.now(timezone.utc):
        invitation["status"] = MockInvitationStatus.EXPIRED
        invitation["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail={"error": "Invitation has expired"}
        )
    
    # Create OAuth URL
    state = f"{token}_randomstring"
    
    if provider == "office365":
        auth_url = (
            "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
            f"?client_id=mock_client_id"
            f"&redirect_uri=http://localhost:3000/api/invitations/oauth/{provider}/callback"
            f"&response_type=code"
            f"&scope=openid%20profile%20email%20offline_access"
            f"&state={state}"
        )
    else:  # Gmail
        auth_url = (
            "https://accounts.google.com/o/oauth2/auth"
            f"?client_id=mock_client_id"
            f"&redirect_uri=http://localhost:3000/api/invitations/oauth/{provider}/callback"
            f"&response_type=code"
            f"&scope=openid%20profile%20email"
            f"&state={state}"
        )
    
    return {"authUrl": auth_url}

@router.post("/invitations/oauth/{provider}/callback")
async def oauth_callback(provider: str, data: Dict[str, Any]):
    """OAuth callback for invitation"""
    valid_providers = ["office365", "gmail"]
    
    if provider not in valid_providers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": f"Invalid provider. Must be one of: {', '.join(valid_providers)}"}
        )
    
    code = data.get("code")
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Authorization code is required"}
        )
    
    token = data.get("token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invitation token is required"}
        )
    
    state = data.get("state")
    if not state or not state.startswith(token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invalid state parameter"}
        )
    
    # Check if token exists
    if token not in mock_invitation_tokens:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Invitation not found"}
        )
    
    # Get invitation
    invitation_id = mock_invitation_tokens[token]
    invitation = mock_invitations.get(invitation_id)
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Invitation not found"}
        )
    
    # Check invitation status
    if invitation["status"] != MockInvitationStatus.PENDING:
        if invitation["status"] == MockInvitationStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Invitation has already been accepted"}
            )
        elif invitation["status"] == MockInvitationStatus.CANCELED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Invitation has been canceled"}
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": f"Invitation status is {invitation['status']}"}
            )
    
    # Check if invitation is expired
    expiration_date = datetime.fromisoformat(invitation["expiration_date"])
    if expiration_date < datetime.now(timezone.utc):
        invitation["status"] = MockInvitationStatus.EXPIRED
        invitation["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail={"error": "Invitation has expired"}
        )
    
    # Mock user info based on provider
    if provider == "office365":
        user_info = {
            "id": "o365_user_id",
            "displayName": "Office Test User",
            "userPrincipalName": invitation["email"],
            "mail": invitation["email"]
        }
        full_name = user_info["displayName"]
    else:  # Gmail
        user_info = {
            "id": "gmail_user_id",
            "name": "Gmail Test User",
            "email": invitation["email"],
            "verified_email": True
        }
        full_name = user_info["name"]
    
    # Create user
    user_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)
    
    user = {
        "id": user_id,
        "email": invitation["email"],
        "full_name": full_name,
        "role": invitation["role"],
        "client_company": invitation["client_company"],
        "created_at": created_at.isoformat(),
        "is_active": True,
        "mfa_enabled": False,
        "oauth_provider": provider,
        "oauth_id": user_info["id"]
    }
    
    # Store user
    mock_users[user_id] = user
    
    # Update invitation status
    invitation["status"] = MockInvitationStatus.ACCEPTED
    invitation["updated_at"] = created_at.isoformat()
    invitation["accepted_at"] = created_at.isoformat()
    invitation["user_id"] = user_id
    
    # Create token for the new user
    token_data = {
        "sub": user_id,
        "email": invitation["email"],
        "role": invitation["role"]
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "user": user,
        "requiresMFA": True  # Always require MFA for new users
    }