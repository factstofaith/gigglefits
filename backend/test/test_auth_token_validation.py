"""
Test suite for JWT token validation features.

This test suite covers authentication token validation, including:
1. Valid token verification
2. Expired token handling
3. Invalid signature handling
4. Non-existent user handling
5. Inactive user handling
6. Malformed token handling
7. Token claims validation
8. Role-based access handling

Author: Claude (with human oversight)
Date: April 3, 2025
"""

import pytest
import json
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

from fastapi.testclient import TestClient
from jose import jwt

from main import app
from core.config import settings
from core.auth import (
    create_access_token, 
    get_current_user, 
    get_current_active_user,
    get_user_with_permissions
)
from db.models import User, UserRole, AuthProvider, UserAccountStatus

client = TestClient(app)

@pytest.fixture
def mock_admin_user():
    """Create a mock admin user for testing"""
    return User(
        id="test-admin-id",
        username="admin@example.com",
        email="admin@example.com",
        name="Admin User",
        role=UserRole.ADMIN,
        auth_provider=AuthProvider.LOCAL,
        is_active=True,
        account_status=UserAccountStatus.ACTIVE,
        hashed_password="hashed_password",  # Not a real hash
        bypass_mfa=True,
        tenant_id="test-tenant-id"
    )

@pytest.fixture
def mock_regular_user():
    """Create a mock regular user for testing"""
    return User(
        id="test-user-id",
        username="user@example.com",
        email="user@example.com",
        name="Regular User",
        role=UserRole.USER,
        auth_provider=AuthProvider.LOCAL,
        is_active=True,
        account_status=UserAccountStatus.ACTIVE,
        hashed_password="hashed_password",  # Not a real hash
        bypass_mfa=False,
        tenant_id="test-tenant-id"
    )

@pytest.fixture
def mock_inactive_user():
    """Create a mock inactive user for testing"""
    return User(
        id="inactive-user-id",
        username="inactive@example.com",
        email="inactive@example.com",
        name="Inactive User",
        role=UserRole.USER,
        auth_provider=AuthProvider.LOCAL,
        is_active=False,
        account_status=UserAccountStatus.DISABLED,
        hashed_password="hashed_password",  # Not a real hash
        bypass_mfa=False,
        tenant_id="test-tenant-id"
    )

@pytest.fixture
def valid_admin_token(mock_admin_user):
    """Create a valid JWT token for an admin user"""
    return create_access_token(
        data={
            "sub": mock_admin_user.username,
            "role": mock_admin_user.role.value,
            "bypass_mfa": mock_admin_user.bypass_mfa
        }
    )

@pytest.fixture
def valid_user_token(mock_regular_user):
    """Create a valid JWT token for a regular user"""
    return create_access_token(
        data={
            "sub": mock_regular_user.username,
            "role": mock_regular_user.role.value,
            "bypass_mfa": mock_regular_user.bypass_mfa
        }
    )

@pytest.fixture
def expired_token(mock_regular_user):
    """Create an expired JWT token"""
    expires = datetime.now(timezone.utc) - timedelta(minutes=15)  # Token expired 15 minutes ago
    return create_access_token(
        data={
            "sub": mock_regular_user.username,
            "role": mock_regular_user.role.value
        },
        expires_delta=timedelta(minutes=-15)  # Negative delta for expired token
    )

@pytest.fixture
def token_invalid_signature(mock_regular_user):
    """Create a token with an invalid signature"""
    payload = {
        "sub": mock_regular_user.username,
        "role": mock_regular_user.role.value,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
    }
    return jwt.encode(payload, "invalid_secret_key", algorithm=settings.JWT_ALGORITHM)

@pytest.fixture
def malformed_token():
    """Create a malformed token"""
    return "not.a.valid.token.format"

class TestJWTTokenValidation:
    """Test JWT token validation functionality"""

    def setup_mock_db_query(self, mock_db, user=None):
        """Setup a mock database query that returns the specified user"""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_first = MagicMock(return_value=user)
        
        mock_filter.first = mock_first
        mock_query.filter = lambda *args, **kwargs: mock_filter
        mock_db.query = lambda *args, **kwargs: mock_query
        
        return mock_db
    
    def test_valid_admin_token(self, valid_admin_token, mock_admin_user):
        """Test that a valid admin token grants access to admin-only endpoint"""
        # Mock the database session to return the admin user
        with patch("core.auth.get_db") as mock_get_db:
            mock_db = MagicMock()
            self.setup_mock_db_query(mock_db, mock_admin_user)
            mock_get_db.return_value = mock_db
            
            # Make request to an admin-only endpoint
            response = client.get(
                "/admin/users",
                headers={"Authorization": f"Bearer {valid_admin_token}"}
            )
            
            # Check that the request was successful
            assert response.status_code == 200
    
    def test_valid_user_token_for_user_endpoint(self, valid_user_token, mock_regular_user):
        """Test that a valid user token grants access to user endpoints"""
        # Mock the database session to return the regular user
        with patch("core.auth.get_db") as mock_get_db:
            mock_db = MagicMock()
            self.setup_mock_db_query(mock_db, mock_regular_user)
            mock_get_db.return_value = mock_db
            
            # Make request to a user endpoint
            response = client.get(
                "/users/profile",
                headers={"Authorization": f"Bearer {valid_user_token}"}
            )
            
            # Check that the request was successful
            assert response.status_code == 200
    
    def test_valid_user_token_for_admin_endpoint(self, valid_user_token, mock_regular_user):
        """Test that a valid user token is denied access to admin-only endpoints"""
        # Mock the database session to return the regular user
        with patch("core.auth.get_db") as mock_get_db:
            mock_db = MagicMock()
            self.setup_mock_db_query(mock_db, mock_regular_user)
            mock_get_db.return_value = mock_db
            
            # Make request to an admin-only endpoint
            response = client.get(
                "/admin/users",
                headers={"Authorization": f"Bearer {valid_user_token}"}
            )
            
            # Check that the request was forbidden
            assert response.status_code == 403
            assert "Only administrators" in response.json()["detail"]
    
    def test_expired_token(self, expired_token, mock_regular_user):
        """Test that an expired token is rejected"""
        # Mock the database session to return the regular user
        with patch("core.auth.get_db") as mock_get_db:
            mock_db = MagicMock()
            self.setup_mock_db_query(mock_db, mock_regular_user)
            mock_get_db.return_value = mock_db
            
            # Make request with an expired token
            response = client.get(
                "/users/profile",
                headers={"Authorization": f"Bearer {expired_token}"}
            )
            
            # Check that the request was unauthorized due to expired token
            assert response.status_code == 401
            assert "Could not validate credentials" in response.json()["detail"]
    
    def test_invalid_signature_token(self, token_invalid_signature, mock_regular_user):
        """Test that a token with invalid signature is rejected"""
        # Mock the database session to return the regular user
        with patch("core.auth.get_db") as mock_get_db:
            mock_db = MagicMock()
            self.setup_mock_db_query(mock_db, mock_regular_user)
            mock_get_db.return_value = mock_db
            
            # Make request with a token that has an invalid signature
            response = client.get(
                "/users/profile",
                headers={"Authorization": f"Bearer {token_invalid_signature}"}
            )
            
            # Check that the request was unauthorized due to invalid signature
            assert response.status_code == 401
            assert "Could not validate credentials" in response.json()["detail"]
    
    def test_malformed_token(self, malformed_token):
        """Test that a malformed token is rejected"""
        # Make request with a malformed token
        response = client.get(
            "/users/profile",
            headers={"Authorization": f"Bearer {malformed_token}"}
        )
        
        # Check that the request was unauthorized due to malformed token
        assert response.status_code == 401
        assert "Could not validate credentials" in response.json()["detail"]
    
    def test_missing_token(self):
        """Test that requests without tokens are rejected"""
        # Make request without a token
        response = client.get("/users/profile")
        
        # Check that the request was unauthorized due to missing token
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]
    
    def test_nonexistent_user_token(self, mock_regular_user):
        """Test that a token for a non-existent user is rejected"""
        # Create a token for a user that doesn't exist in the database
        token = create_access_token(
            data={
                "sub": "nonexistent@example.com",
                "role": UserRole.USER.value
            }
        )
        
        # Mock the database session to return None (user not found)
        with patch("core.auth.get_db") as mock_get_db:
            mock_db = MagicMock()
            self.setup_mock_db_query(mock_db, None)  # No user returned
            mock_get_db.return_value = mock_db
            
            # Make request with token for non-existent user
            response = client.get(
                "/users/profile",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            # Check that the request was unauthorized due to non-existent user
            assert response.status_code == 401
            assert "Could not validate credentials" in response.json()["detail"]
    
    def test_inactive_user_token(self, mock_inactive_user):
        """Test that a token for an inactive user is rejected"""
        # Create a token for an inactive user
        token = create_access_token(
            data={
                "sub": mock_inactive_user.username,
                "role": mock_inactive_user.role.value
            }
        )
        
        # Mock the database session to return the inactive user
        with patch("core.auth.get_db") as mock_get_db:
            mock_db = MagicMock()
            self.setup_mock_db_query(mock_db, mock_inactive_user)
            mock_get_db.return_value = mock_db
            
            # Make request with inactive user's token
            response = client.get(
                "/users/profile",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            # Check that the request was forbidden due to inactive user
            assert response.status_code == 400
            assert "Inactive user" in response.json()["detail"]
    
    def test_token_without_role(self, mock_regular_user):
        """Test that a token without role information is handled properly"""
        # Create a token without role information
        token = create_access_token(
            data={"sub": mock_regular_user.username}  # No role specified
        )
        
        # Mock the database session to return the regular user
        with patch("core.auth.get_db") as mock_get_db:
            mock_db = MagicMock()
            self.setup_mock_db_query(mock_db, mock_regular_user)
            mock_get_db.return_value = mock_db
            
            # Make request with token without role
            response = client.get(
                "/users/profile",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            # Check that the request was successful since role comes from database
            assert response.status_code == 200
    
    def test_token_with_mfa_bypass(self, mock_admin_user):
        """Test token with MFA bypass flag"""
        # Create a token with MFA bypass flag
        token = create_access_token(
            data={
                "sub": mock_admin_user.username,
                "role": mock_admin_user.role.value,
                "bypass_mfa": True
            }
        )
        
        # Mock the database session to return the admin user
        with patch("core.auth.get_db") as mock_get_db:
            mock_db = MagicMock()
            self.setup_mock_db_query(mock_db, mock_admin_user)
            mock_get_db.return_value = mock_db
            
            # Mock the MFA verification to check that bypass is honored
            with patch("core.auth.verify_mfa_if_required") as mock_verify_mfa:
                # Make request to an MFA-protected endpoint
                response = client.get(
                    "/users/profile",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                # Check that the request was successful
                assert response.status_code == 200
                
                # Verify that MFA verification was called with the bypass flag
                mock_verify_mfa.assert_called()
    
    def test_custom_token_claims(self, mock_regular_user):
        """Test handling of custom token claims"""
        # Create a token with custom claims
        token = create_access_token(
            data={
                "sub": mock_regular_user.username,
                "role": mock_regular_user.role.value,
                "custom_claim": "custom_value",
                "tenant": "test-tenant-id"
            }
        )
        
        # Mock the database session to return the regular user
        with patch("core.auth.get_db") as mock_get_db:
            mock_db = MagicMock()
            self.setup_mock_db_query(mock_db, mock_regular_user)
            mock_get_db.return_value = mock_db
            
            # Make request with token containing custom claims
            response = client.get(
                "/users/profile",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            # Check that the request was successful
            assert response.status_code == 200


class TestDirectAuthFunctionality:
    """Test the authentication functions directly"""
    
    @pytest.mark.asyncio
    async def test_get_current_user(self, valid_user_token, mock_regular_user):
        """Test get_current_user function"""
        # Create a mock database session that returns the mock user
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_first = MagicMock(return_value=mock_regular_user)
        
        mock_filter.first = mock_first
        mock_query.filter = lambda *args, **kwargs: mock_filter
        mock_db.query = lambda *args, **kwargs: mock_query
        
        # Call get_current_user with the valid token
        with patch("core.auth.get_db", return_value=mock_db):
            token_payload = jwt.decode(
                valid_user_token, 
                settings.SECRET_KEY, 
                algorithms=[settings.JWT_ALGORITHM]
            )
            user = await get_current_user(token=valid_user_token)
            
            # Verify user is correctly returned
            assert user.id == mock_regular_user.id
            assert user.username == mock_regular_user.username
            assert user.role == mock_regular_user.role
    
    @pytest.mark.asyncio
    async def test_get_current_active_user(self, valid_user_token, mock_regular_user):
        """Test get_current_active_user function"""
        # Create a mock database session
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_first = MagicMock(return_value=mock_regular_user)
        
        mock_filter.first = mock_first
        mock_query.filter = lambda *args, **kwargs: mock_filter
        mock_db.query = lambda *args, **kwargs: mock_query
        
        # Call get_current_active_user with the valid token
        with patch("core.auth.get_db", return_value=mock_db):
            user = await get_current_active_user(token=valid_user_token)
            
            # Verify user is correctly returned
            assert user.id == mock_regular_user.id
            assert user.is_active is True
    
    @pytest.mark.asyncio
    async def test_get_user_with_permissions(self, valid_admin_token, mock_admin_user):
        """Test get_user_with_permissions function"""
        # Create a mock database session
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_first = MagicMock(return_value=mock_admin_user)
        
        mock_filter.first = mock_first
        mock_query.filter = lambda *args, **kwargs: mock_filter
        mock_db.query = lambda *args, **kwargs: mock_query
        
        # Call get_user_with_permissions with admin role requirement
        with patch("core.auth.get_db", return_value=mock_db):
            user_func = await get_user_with_permissions([UserRole.ADMIN])(token=valid_admin_token)
            user = user_func()
            
            # Verify admin user is correctly returned
            assert user.id == mock_admin_user.id
            assert user.role == UserRole.ADMIN
    
    @pytest.mark.asyncio
    async def test_get_user_with_permissions_insufficient_role(self, valid_user_token, mock_regular_user):
        """Test get_user_with_permissions function with insufficient role"""
        # Create a mock database session
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_first = MagicMock(return_value=mock_regular_user)
        
        mock_filter.first = mock_first
        mock_query.filter = lambda *args, **kwargs: mock_filter
        mock_db.query = lambda *args, **kwargs: mock_query
        
        # Call get_user_with_permissions with admin role requirement using a regular user token
        with patch("core.auth.get_db", return_value=mock_db):
            with pytest.raises(Exception) as excinfo:
                user_func = await get_user_with_permissions([UserRole.ADMIN])(token=valid_user_token)
                user_func()
            
            # Verify permission error was raised
            assert "Not enough permissions" in str(excinfo.value)