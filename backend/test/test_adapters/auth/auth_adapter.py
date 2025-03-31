"""
Auth test adapter.

This module provides mock authentication endpoints for API authorization testing.
"""

from fastapi import APIRouter, Depends, HTTPException, Cookie, Response, Request
from fastapi import status as http_status
from typing import Optional, Dict, Any, List, Union
from datetime import datetime, timedelta, timezone
import jwt
import uuid
import json
import enum
import logging

# Import entity registry
from ..entity_registry import BaseTestAdapter, EntityAction, global_registry

# Set up logging
logger = logging.getLogger("auth_adapter")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Define OAuth Provider enum
class OAuthProviderEnum(enum.Enum):
    OFFICE365 = "office365"
    GMAIL = "gmail"

# User model
class User:
    """User model for the auth adapter."""
    def __init__(self, id, email, name, role, mfa_enabled=False, oauth_provider=None, oauth_id=None):
        self.id = id
        self.email = email
        self.name = name
        self.role = role
        self.mfa_enabled = mfa_enabled
        self.oauth_provider = oauth_provider
        self.oauth_id = oauth_id
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)

# Auth adapter class for simplified testing
class AuthAdapter(BaseTestAdapter):
    """
    Mock authentication adapter for testing without database dependencies.
    
    Inherits from BaseTestAdapter to enable entity synchronization.
    """
    
    def __init__(self, registry=None):
        """Initialize the auth adapter with an entity registry."""
        super().__init__(registry)
        
        # Register entity change handlers
        self.registry.register_listener("User", self._handle_entity_change)
        self.registry.register_listener("MFA", self._handle_entity_change)
        
        # Mock data storage - these will be synced with the registry
        self.users = {}
        self.tokens = {}
        self.refresh_tokens = {}
        self.roles = {
            "ADMIN": {"id": 1, "name": "ADMIN", "permissions": ["*"]},
            "USER": {"id": 2, "name": "USER", "permissions": ["read:*", "write:own"]},
            "READONLY": {"id": 3, "name": "READONLY", "permissions": ["read:*"]},
        }
        
        # OAuth configuration
        self.oauth_configs = {}
        self.oauth_states = {}
        self.oauth_tokens = {}
        
        # JWT Config
        self.SECRET_KEY = "test_secret_key"
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30
        self.REFRESH_TOKEN_EXPIRE_DAYS = 7
        
        logger.info("AuthAdapter initialized with entity registry")
    
    def reset(self):
        """Reset all mock data."""
        self.users = {}
        self.tokens = {}
        self.refresh_tokens = {}
        self.oauth_configs = {}
        self.oauth_states = {}
        self.oauth_tokens = {}
    
    def add_user(self, user):
        """
        Add a user to the mock data store and register with the entity registry.
        
        Args:
            user: User object with id, email, name, and role
            
        Returns:
            The user object
        """
        self.users[user.id] = user
        
        # Register with the entity registry
        self._register_entity("User", user.id, user)
        
        logger.debug(f"Added user: {user.id} ({user.email})")
        return user
    
    def create_user(self, email, name, role, mfa_enabled=False):
        """
        Create a new user and add it to the mock data store.
        
        Args:
            email: User's email address
            name: User's name
            role: User's role (e.g., ADMIN, USER)
            mfa_enabled: Whether MFA is enabled for the user
            
        Returns:
            The created user object
        """
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email=email,
            name=name,
            role=role,
            mfa_enabled=mfa_enabled
        )
        
        return self.add_user(user)
    
    def register_user(self, user_data):
        """
        Register a new user from registration data.
        
        Args:
            user_data: Dictionary containing user registration information
                       (email, name, password, registration_token)
            
        Returns:
            Dictionary with success status and user_id
        """
        # Validate registration token if provided
        registration_token = user_data.get("registration_token")
        
        # In a real implementation, we would validate the token here
        # For testing, we'll just check if it's provided
        if not registration_token:
            return {"success": False, "error": "Invalid registration token"}
            
        # Create user
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email=user_data.get("email"),
            name=user_data.get("name"),
            role=user_data.get("role", "USER"),
            mfa_enabled=False
        )
        
        # Add to mock data store
        self.add_user(user)
        
        # Return success
        return {
            "success": True,
            "user_id": user_id
        }
    
    def update_user(self, user_id, updates):
        """
        Update a user and sync with the entity registry.
        
        Args:
            user_id: ID of the user to update
            updates: Dictionary of fields to update
            
        Returns:
            Updated user or None if not found
        """
        user = self.get_user_by_id(user_id)
        if not user:
            return None
            
        # Apply updates
        for key, value in updates.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        # Update timestamp
        user.updated_at = datetime.now(timezone.utc)
        
        # Update in the registry
        self._update_entity("User", user_id, user)
        
        logger.debug(f"Updated user: {user_id}")
        return user
    
    def update_user_profile(self, user_id, profile_data):
        """
        Update a user's profile information.
        
        Args:
            user_id: ID of the user to update
            profile_data: Dictionary containing profile information
                          (display_name, timezone, preferred_language, etc.)
            
        Returns:
            Dictionary with success status and updated user info
        """
        user = self.get_user_by_id(user_id)
        if not user:
            return {"success": False, "error": "User not found"}
            
        # For each profile field, add it as an attribute to the user
        for key, value in profile_data.items():
            setattr(user, key, value)
        
        # Update timestamp
        user.updated_at = datetime.now(timezone.utc)
        
        # Update in the registry
        self._update_entity("User", user_id, user)
        
        logger.debug(f"Updated user profile: {user_id}")
        
        return {
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role,
                **{k: getattr(user, k) for k in profile_data.keys()}
            }
        }
    
    def delete_user(self, user_id):
        """
        Delete a user and sync with the entity registry.
        
        Args:
            user_id: ID of the user to delete
            
        Returns:
            True if deleted, False otherwise
        """
        if user_id not in self.users:
            return False
            
        # Remove tokens
        self.tokens.pop(user_id, None)
        self.refresh_tokens.pop(user_id, None)
        
        # Remove user
        self.users.pop(user_id)
        
        # Delete from registry
        self._delete_entity("User", user_id)
        
        logger.debug(f"Deleted user: {user_id}")
        return True
    
    def get_user_by_id(self, user_id):
        """
        Get a user by ID, checking both local cache and entity registry.
        
        Args:
            user_id: ID of the user to retrieve
            
        Returns:
            User object or None if not found
        """
        # Try local cache first
        user = self.users.get(user_id)
        if user:
            return user
            
        # Try registry
        user = self._get_entity("User", user_id)
        if user:
            # Update local cache
            self.users[user_id] = user
            return user
            
        return None
        
    def get_user(self, user_id):
        """
        Alias for get_user_by_id for compatibility with test expectations.
        
        Args:
            user_id: ID of the user to retrieve
            
        Returns:
            User object or None if not found
        """
        return self.get_user_by_id(user_id)
    
    def get_user_by_email(self, email):
        """
        Get a user by email, checking both local cache and entity registry.
        
        Args:
            email: Email of the user to retrieve
            
        Returns:
            User object or None if not found
        """
        # Try local cache first
        for user in self.users.values():
            if user.email == email:
                return user
        
        # Try registry
        user = self._get_entity_by_attribute("User", "email", email)
        if user:
            # Update local cache
            self.users[user.id] = user
            return user
        
        return None
    
    def generate_token(self, user_id, expires_delta=None):
        """Generate a JWT token for a user."""
        user = self.get_user_by_id(user_id)
        if not user:
            return None
            
        # Create token data
        token_data = {
            "sub": user_id,
            "email": user.email,
            "role": user.role,
            "exp": datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES))
        }
        
        # Generate token
        token = jwt.encode(token_data, self.SECRET_KEY, algorithm=self.ALGORITHM)
        
        # Store token
        self.tokens[user_id] = token
        
        return token
        
    def verify_token(self, token):
        """Verify a JWT token and return the user ID."""
        try:
            # Check for hardcoded test tokens
            for user_id, stored_token in self.tokens.items():
                if token == stored_token:
                    return user_id
                    
            # Verify using JWT
            payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            return payload.get("sub")
        except Exception:
            return None
    
    def login(self, email, password):
        """Authenticate a user and return a token."""
        user = self.get_user_by_email(email)
        
        if not user:
            return {"error": "Invalid credentials", "status_code": 401}
            
        # Password validation would normally be here
        # For testing, we'll just check if it's provided
        if not password:
            return {"error": "Password required", "status_code": 401}
        
        # Generate token
        token = self.generate_token(user.id)
        
        # For MFA-enabled accounts, return a partial login
        if hasattr(user, 'mfa_enabled') and user.mfa_enabled:
            return {
                "requires_mfa": True,
                "user_id": user.id,
                "partial_token": token
            }
        
        # Normal login
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
        }
    
    def authenticate(self, email, password):
        """
        Authenticate a user with email and password.
        
        Args:
            email: User's email address
            password: User's password
            
        Returns:
            Dictionary with authentication result
        """
        user = self.get_user_by_email(email)
        
        if not user:
            return {"success": False, "error": "Invalid credentials"}
            
        # Password validation would normally be here
        # For testing, we'll just check if it's provided
        if not password:
            return {"success": False, "error": "Password required"}
        
        # Generate token
        token = self.generate_token(user.id)
        
        # For MFA-enabled accounts, return a partial login that requires MFA
        if hasattr(user, 'mfa_enabled') and user.mfa_enabled:
            return {
                "success": True,
                "mfa_required": True,
                "user_id": user.id,
                "mfa_token": token
            }
        
        # Normal login without MFA
        return {
            "success": True,
            "mfa_required": False,
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
        }
    
    def complete_mfa_login(self, mfa_data):
        """Complete a login that requires MFA verification."""
        user_id = mfa_data.get("user_id")
        user = self.get_user_by_id(user_id)
        
        if not user:
            return {"error": "User not found", "status_code": 404}
        
        # Generate a full access token
        token = self.generate_token(user_id)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
        }
        
    def configure_oauth_provider(self, config_data):
        """
        Configure an OAuth provider for authentication.
        
        Args:
            config_data: Dictionary containing provider configuration
                (provider, client_id, client_secret, redirect_uri, scope, etc.)
                
        Returns:
            Dictionary with configuration result
        """
        provider = config_data.get("provider")
        if not provider:
            return {"success": False, "error": "Provider is required"}
            
        # Store configuration
        self.oauth_configs[provider] = config_data
        
        logger.debug(f"Configured OAuth provider: {provider}")
        
        return {
            "success": True,
            "provider": provider,
            "configured_at": datetime.now(timezone.utc).isoformat(),
            "client_id": config_data.get("client_id")
        }
        
    def initiate_oauth_login(self, oauth_request):
        """
        Initiate OAuth login process.
        
        Args:
            oauth_request: Dictionary containing provider and redirect_uri
            
        Returns:
            Dictionary with auth URL and state
        """
        provider = oauth_request.get("provider")
        if not provider or provider not in self.oauth_configs:
            return {"success": False, "error": "Invalid or unconfigured provider"}
            
        # Use provided state or generate one
        state = oauth_request.get("state") or str(uuid.uuid4())
        
        # Store state data
        self.oauth_states[state] = {
            "provider": provider,
            "redirect_uri": oauth_request.get("redirect_uri"),
            "link_to_email": oauth_request.get("link_to_email"),
            "created_at": datetime.now(timezone.utc)
        }
        
        # Generate a mock authorization URL
        config = self.oauth_configs[provider]
        base_url = "https://example.com/oauth/authorize"
        auth_url = f"{base_url}?client_id={config.get('client_id')}&state={state}&scope={config.get('scope')}&response_type=code"
        
        logger.debug(f"Initiated OAuth login for provider: {provider}")
        
        return {
            "success": True,
            "auth_url": auth_url,
            "state": state,
            "provider": provider
        }
        
    def process_oauth_callback(self, callback_data):
        """
        Process OAuth callback with authorization code.
        
        Args:
            callback_data: Dictionary containing code, state, and oauth_user_data
            
        Returns:
            Dictionary with user and access token
        """
        code = callback_data.get("code")
        state = callback_data.get("state")
        provider = callback_data.get("provider")
        
        if not state or state not in self.oauth_states:
            return {"success": False, "error": "Invalid state parameter"}
            
        # Get state data
        state_data = self.oauth_states[state]
        
        if provider != state_data["provider"]:
            return {"success": False, "error": "Provider mismatch"}
            
        # Get OAuth user data (would come from provider in a real scenario)
        oauth_user_data = callback_data.get("oauth_user_data", {})
        
        # Check if this is an account link request
        link_to_email = state_data.get("link_to_email")
        if link_to_email:
            # Find existing user by email
            existing_user = self.get_user_by_email(link_to_email)
            
            if existing_user and existing_user.email == oauth_user_data.get("email"):
                # Link OAuth provider to existing account
                existing_user.oauth_provider = provider
                existing_user.oauth_id = oauth_user_data.get("id")
                existing_user.updated_at = datetime.now(timezone.utc)
                
                # Update in registry
                self._update_entity("User", existing_user.id, existing_user)
                
                # Generate token
                token = self.generate_token(existing_user.id)
                
                logger.debug(f"Linked OAuth account to existing user: {existing_user.id}")
                
                return {
                    "success": True,
                    "user": {
                        "id": existing_user.id,
                        "email": existing_user.email,
                        "name": existing_user.name,
                        "role": existing_user.role
                    },
                    "access_token": token,
                    "account_linked": True
                }
                
        # Create a new user with OAuth data
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email=oauth_user_data.get("email"),
            name=oauth_user_data.get("name"),
            role="USER",  # Default role
            mfa_enabled=False,
            oauth_provider=provider,
            oauth_id=oauth_user_data.get("id")
        )
        
        # Add user to data store
        self.add_user(user)
        
        # Apply role mappings from OAuth configuration
        if provider in self.oauth_configs:
            role_mappings = self.oauth_configs[provider].get("role_mappings", {})
            oauth_roles = oauth_user_data.get("roles", [])
            
            # Get RBAC adapter from registry
            rbac_adapter = None
            for adapter in self.registry.adapters.values():
                if hasattr(adapter, 'assign_role') and hasattr(adapter, 'get_user_roles'):
                    rbac_adapter = adapter
                    break
            
            # Map OAuth roles to system roles
            for oauth_role in oauth_roles:
                if oauth_role in role_mappings:
                    system_role = role_mappings[oauth_role]
                    if rbac_adapter:
                        # Actually assign the role using the RBAC adapter
                        rbac_adapter.assign_role(
                            user_id=user_id,
                            role=system_role,
                            assigned_by="SYSTEM",
                            source="OAUTH"
                        )
                    logger.debug(f"Mapped OAuth role {oauth_role} to system role {system_role} for user {user_id}")
        
        # Generate token
        token = self.generate_token(user_id)
        
        # Store token
        self.oauth_tokens[token] = {
            "user_id": user_id,
            "provider": provider,
            "issued_at": datetime.now(timezone.utc)
        }
        
        logger.debug(f"Processed OAuth callback and created user: {user_id}")
        
        return {
            "success": True,
            "user": {
                "id": user_id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            },
            "access_token": token
        }
        
    def validate_token(self, token):
        """
        Validate an access token.
        
        Args:
            token: Access token to validate
            
        Returns:
            Dictionary with validation result
        """
        # First check OAuth tokens
        if token in self.oauth_tokens:
            token_data = self.oauth_tokens[token]
            return {
                "valid": True,
                "user_id": token_data["user_id"],
                "provider": token_data["provider"],
                "token_type": "oauth"
            }
            
        # Then check JWT tokens
        user_id = self.verify_token(token)
        if user_id:
            return {
                "valid": True,
                "user_id": user_id,
                "token_type": "jwt"
            }
            
        return {"valid": False, "error": "Invalid token"}
        
    def process_oauth_revocation(self, revocation_data):
        """
        Process OAuth token revocation or permission change.
        
        Args:
            revocation_data: Dictionary containing provider, oauth_id, and updated oauth_user_data
            
        Returns:
            Dictionary with revocation result
        """
        provider = revocation_data.get("provider")
        oauth_id = revocation_data.get("oauth_id")
        
        if not provider or not oauth_id:
            return {"success": False, "error": "Provider and OAuth ID are required"}
            
        # Find user by OAuth ID
        user_id = None
        for uid, user in self.users.items():
            if (hasattr(user, "oauth_provider") and user.oauth_provider == provider and 
                hasattr(user, "oauth_id") and user.oauth_id == oauth_id):
                user_id = uid
                break
                
        if not user_id:
            return {"success": False, "error": "User not found"}
            
        # Get RBAC adapter from registry
        rbac_adapter = None
        for adapter in self.registry.adapters.values():
            if hasattr(adapter, 'get_user_roles') and hasattr(adapter, 'remove_role'):
                rbac_adapter = adapter
                break
        
        # If we have an RBAC adapter, remove OAuth-granted roles
        if rbac_adapter:
            # Remove roles that came from OAuth
            user = self.users.get(user_id)
            if user and hasattr(user, "oauth_roles"):
                for role in user.oauth_roles:
                    # This would remove the role
                    rbac_adapter.remove_role(user_id, role, source="OAUTH")
                user.oauth_roles = []
            
            # Get user from RBAC adapter
            rbac_user = rbac_adapter.resources["users"].get(user_id, {})
            if rbac_user and "role_sources" in rbac_user:
                # Find roles that came from OAuth
                oauth_roles = []
                for role, sources in rbac_user["role_sources"].items():
                    if "OAUTH" in sources:
                        oauth_roles.append(role)
                
                # Remove those roles
                for role in oauth_roles:
                    if role in rbac_user["roles"]:
                        rbac_user["roles"].remove(role)
                    if role in rbac_user["role_sources"]:
                        rbac_user["role_sources"][role].remove("OAUTH")
        
        logger.debug(f"Revoked OAuth permissions for user: {user_id}")
        
        return {
            "success": True,
            "user_id": user_id,
            "revoked_at": datetime.now(timezone.utc).isoformat()
        }
        
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
            if action == EntityAction.CREATE or action == EntityAction.UPDATE:
                # Update user in local cache
                self.users[entity_id] = entity
                logger.debug(f"Updated user in AuthAdapter: {entity_id}")
            elif action == EntityAction.DELETE:
                # Remove user from local cache
                self.users.pop(entity_id, None)
                self.tokens.pop(entity_id, None)
                self.refresh_tokens.pop(entity_id, None)
                logger.debug(f"Removed user from AuthAdapter: {entity_id}")
                
        elif entity_type == "MFA":
            if action == EntityAction.CREATE or action == EntityAction.UPDATE:
                # Update MFA status on user
                user_id = getattr(entity, "user_id", None)
                if user_id and user_id in self.users:
                    user = self.users[user_id]
                    user.mfa_enabled = True
                    logger.debug(f"Updated MFA status for user {user_id} in AuthAdapter")
            elif action == EntityAction.DELETE:
                # Disable MFA on user
                user_id = getattr(entity, "user_id", None)
                if user_id and user_id in self.users:
                    user = self.users[user_id]
                    user.mfa_enabled = False
                    logger.debug(f"Disabled MFA for user {user_id} in AuthAdapter")

# Legacy code for FastAPI router-based mocking
from fastapi import APIRouter, Depends, HTTPException, Cookie, Response, Request
from fastapi import status as http_status
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta, timezone
import jwt
import uuid
import json

# Mock data storage
mock_users = {}
mock_roles = {
    "ADMIN": {"id": 1, "name": "ADMIN", "permissions": ["*"]},
    "USER": {"id": 2, "name": "USER", "permissions": ["read:*", "write:own"]},
    "READONLY": {"id": 3, "name": "READONLY", "permissions": ["read:*"]},
}
mock_user_roles = {}
mock_tokens = {}
mock_refresh_tokens = {}

# JWT Config
SECRET_KEY = "test_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Create router
router = APIRouter(prefix="/auth")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a new JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    """Create a new JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "token_type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(authorization: Optional[str] = None):
    """Verify JWT token and return current user."""
    if not authorization:
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Handle our hardcoded test tokens
        if token == "mock_user_token":
            return {
                "id": "user-test-id",
                "email": "user@test.com",
                "role": "USER",
                "name": "Test User"
            }
        elif token == "mock_admin_token":
            return {
                "id": "admin-test-id",
                "email": "admin@test.com",
                "role": "ADMIN",
                "name": "Admin User"
            }
        elif token == "mock_mfa_user_token":
            return {
                "id": "mfa-test-id",
                "email": "mfa@test.com",
                "role": "USER",
                "name": "MFA User"
            }
        
        # Check for expired or malformed token
        if token == "invalid_refresh_token" or token == mock_tokens.get("MALFORMED"):
            raise HTTPException(
                status_code=http_status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if token == mock_tokens.get("EXPIRED"):
            raise HTTPException(
                status_code=http_status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # For non-test tokens, verify using JWT
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            email = payload.get("email")
            role = payload.get("role")
            
            # Find user by ID or email
            for uid, user in mock_users.items():
                if str(uid) == user_id or user["email"] == email:
                    # Return a copy of the user data with role information
                    user_data = user.copy()
                    user_data["id"] = uid
                    user_data["role"] = role
                    return user_data
                    
        except jwt.PyJWTError:
            # Allow test tokens to pass through if they're not found in the JWT verification
            pass
        
        # For test tokens from the test class
        for role, token_value in mock_tokens.items():
            if token == token_value:
                # Return a user with the specified role
                return {
                    "id": f"test_{role.lower()}_id",
                    "email": f"test_{role.lower()}@example.com",
                    "role": role,
                }
        
        # If we reach here, token is invalid
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/register", status_code=http_status.HTTP_201_CREATED)
async def register(user_data: Dict[str, Any]):
    """Register a new user."""
    email = user_data.get("email")
    
    # Check if email already exists
    for user in mock_users.values():
        if user["email"] == email:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create new user
    user_id = str(uuid.uuid4())
    user = {
        "email": email,
        "password": user_data.get("password"),  # In a real app, you'd hash this
        "first_name": user_data.get("first_name"),
        "last_name": user_data.get("last_name"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    mock_users[user_id] = user
    
    # Default to USER role unless specified
    role_name = user_data.get("role", "USER")
    if role_name in mock_roles:
        role_id = mock_roles[role_name]["id"]
        mock_user_roles[user_id] = role_id
    
    # Return user data
    response_data = user.copy()
    response_data["id"] = user_id
    # Don't include password in response
    response_data.pop("password", None)
    
    return response_data

@router.post("/login")
async def login(login_data: Dict[str, Any], response: Response):
    """Log in a user and return access and refresh tokens."""
    email = login_data.get("email")
    password = login_data.get("password")
    
    # Handle our hardcoded test users
    if email == "user@test.com" and password == "user123":
        user_id = "user-test-id"
        role_name = "USER"
        user = {
            "email": email,
            "password": password,
            "first_name": "Test",
            "last_name": "User",
            "role": role_name
        }
    elif email == "admin@test.com" and password == "admin123":
        user_id = "admin-test-id"
        role_name = "ADMIN"
        user = {
            "email": email,
            "password": password,
            "first_name": "Admin",
            "last_name": "User",
            "role": role_name
        }
    elif email == "mfa@test.com" and password == "mfa123":
        user_id = "mfa-test-id"
        role_name = "USER"
        user = {
            "email": email,
            "password": password,
            "first_name": "MFA",
            "last_name": "User",
            "role": role_name
        }
    else:
        # Try to find the user by email
        user_id = None
        user = None
        role_name = None
        
        for uid, u in mock_users.items():
            if u["email"] == email and u["password"] == password:
                user_id = uid
                user = u
                break
        
        # For test users not in our mock database
        if not user and email.startswith("auth_"):
            # This is a test user from the test class
            user_id = str(uuid.uuid4())
            user = {
                "email": email,
                "password": password,
                "first_name": "Test",
                "last_name": "User",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            mock_users[user_id] = user
            
            # Determine role from email prefix
            if "admin" in email:
                role = "ADMIN"
            elif "readonly" in email:
                role = "READONLY"
            else:
                role = "USER"
                
            # Assign role
            mock_user_roles[user_id] = mock_roles[role]["id"]
            role_name = role
        
        if not user:
            raise HTTPException(
                status_code=http_status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
    
    # For non-hardcoded users, determine role
    if email not in ["user@test.com", "admin@test.com", "mfa@test.com"]:
        role_id = mock_user_roles.get(user_id)
        
        for name, role in mock_roles.items():
            if role["id"] == role_id:
                role_name = name
                break
    
    # Save user in mock storage
    if user_id not in mock_users:
        mock_users[user_id] = user
    
    # Create tokens
    token_data = {
        "sub": user_id,
        "email": email,
        "role": role_name
    }
    
    # Use hardcoded tokens for test users
    if email == "user@test.com":
        access_token = "mock_user_token"
        refresh_token = "mock_user_refresh_token"
    elif email == "admin@test.com":
        access_token = "mock_admin_token"
        refresh_token = "mock_admin_refresh_token"
    elif email == "mfa@test.com":
        access_token = "mock_mfa_user_token"
        refresh_token = "mock_mfa_refresh_token"
    else:
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
    
    # Store refresh token for validation
    mock_refresh_tokens[refresh_token] = user_id
    
    # Store token for the test class to access
    mock_tokens[role_name] = access_token
    
    # Set cookies for session-based auth
    response.set_cookie(
        key="session", 
        value=f"user_id={user_id}", 
        httponly=True, 
        secure=True, 
        samesite="lax"
    )
    
    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh")
async def refresh_token(data: Dict[str, Any]):
    """Refresh an access token using a refresh token."""
    refresh_token = data.get("refresh_token")
    
    if not refresh_token or refresh_token not in mock_refresh_tokens:
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user ID from refresh token
    user_id = mock_refresh_tokens[refresh_token]
    
    # Find user
    if user_id not in mock_users:
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    user = mock_users[user_id]
    
    # Determine user's role
    role_id = mock_user_roles.get(user_id)
    role_name = "USER"  # Default
    
    for name, role in mock_roles.items():
        if role["id"] == role_id:
            role_name = name
            break
    
    # Create new tokens
    token_data = {
        "sub": user_id,
        "email": user["email"],
        "role": role_name
    }
    
    access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)
    
    # Update refresh token
    del mock_refresh_tokens[refresh_token]
    mock_refresh_tokens[new_refresh_token] = user_id
    
    return {
        "token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

# Additional routes needed for testing

@router.get("/me")
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get information about the current user."""
    # Add security headers for testing
    headers = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Content-Security-Policy": "default-src 'self'"
    }
    
    return Response(
        content=json.dumps(current_user),
        media_type="application/json",
        headers=headers
    )

@router.get("/users/me")
async def get_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get the current user's profile."""
    # Add security headers for testing
    headers = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Content-Security-Policy": "default-src 'self'",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
    }
    
    return Response(
        content=json.dumps(current_user),
        media_type="application/json",
        headers=headers
    )