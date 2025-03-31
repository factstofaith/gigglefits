"""
Mock services for external dependencies in testing.

This module provides mock implementations of:
1. OAuth providers (Office 365, Gmail)
2. Email services
3. External storage providers

These mocks allow tests to run in isolation without actual external service dependencies.

Author: TAP Integration Platform Team
Date: March 28, 2025
"""

import os
import json
import base64
import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mock_services")


class MockOAuthProvider:
    """Base class for mock OAuth providers."""

    def __init__(self, provider_name: str, client_id: str, client_secret: str):
        self.provider_name = provider_name
        self.client_id = client_id
        self.client_secret = client_secret
        self.tokens: Dict[str, Dict[str, Any]] = {}  # Store tokens by auth code
        self.states: Dict[str, Dict[str, Any]] = {}  # Store state information
        self.users: Dict[str, Dict[str, Any]] = {}   # Store user profiles
        logger.info(f"Mock {provider_name} OAuth provider initialized")

    def generate_auth_url(self, redirect_uri: str, state: str, scope: List[str]) -> str:
        """Generate a mock OAuth authorization URL."""
        # Store the state for verification
        self.states[state] = {
            "redirect_uri": redirect_uri,
            "scope": scope,
            "created_at": datetime.now()
        }
        
        # Build mock OAuth URL (this would not actually work in a browser)
        params = {
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "state": state,
            "scope": " ".join(scope),
            "response_type": "code"
        }
        param_str = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"https://mock-{self.provider_name}-auth.example.com/oauth2/auth?{param_str}"

    def verify_state(self, state: str) -> bool:
        """Verify that a state token is valid."""
        if state not in self.states:
            return False
        
        # Check if state has expired (5 minutes)
        state_info = self.states[state]
        if datetime.now() - state_info["created_at"] > timedelta(minutes=5):
            del self.states[state]
            return False
        
        return True

    def exchange_code_for_token(self, code: str, redirect_uri: str, state: str = None) -> Dict[str, Any]:
        """Exchange an authorization code for an access token."""
        # Verify state if provided
        if state and not self.verify_state(state):
            raise ValueError("Invalid state parameter")
        
        # Generate a mock token
        access_token = f"mock_{self.provider_name}_access_token_{uuid.uuid4()}"
        refresh_token = f"mock_{self.provider_name}_refresh_token_{uuid.uuid4()}"
        
        token_info = {
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": 3600,
            "refresh_token": refresh_token,
            "scope": " ".join(self.states.get(state, {}).get("scope", [])),
            "created_at": datetime.now()
        }
        
        # Store the token for later use
        self.tokens[code] = token_info
        logger.info(f"Generated mock {self.provider_name} token for code {code}")
        
        return token_info

    def revoke_token(self, token: str) -> bool:
        """Revoke an access token."""
        # Find and remove the token
        for code, token_info in list(self.tokens.items()):
            if token_info["access_token"] == token:
                del self.tokens[code]
                logger.info(f"Revoked {self.provider_name} token {token}")
                return True
        
        logger.warning(f"Token {token} not found for revocation")
        return False

    def create_mock_user(self, email: str, name: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a mock user profile."""
        raise NotImplementedError("Subclasses must implement this method")

    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information using an access token."""
        # Find the user associated with this token
        user_id = None
        for code, token_info in self.tokens.items():
            if token_info["access_token"] == access_token:
                user_id = token_info.get("user_id")
                break
        
        if not user_id or user_id not in self.users:
            # For testing, we'll create a default user if none exists
            default_email = f"mock_{self.provider_name}_user@example.com"
            default_name = f"Mock {self.provider_name.title()} User"
            return self.create_mock_user(default_email, default_name)
        
        return self.users[user_id]


class MockOffice365OAuth(MockOAuthProvider):
    """Mock implementation of Office 365 OAuth provider."""
    
    def __init__(self):
        client_id = os.environ.get("TEST_OFFICE365_CLIENT_ID", "mock_office365_client_id")
        client_secret = os.environ.get("TEST_OFFICE365_CLIENT_SECRET", "mock_office365_client_secret")
        super().__init__("office365", client_id, client_secret)
    
    def create_mock_user(self, email: str, name: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a mock Office 365 user profile."""
        if not user_id:
            user_id = f"o365_{uuid.uuid4()}"
        
        user_info = {
            "id": user_id,
            "displayName": name,
            "userPrincipalName": email,
            "mail": email,
            "givenName": name.split()[0] if ' ' in name else name,
            "surname": name.split()[-1] if ' ' in name else "",
            "jobTitle": "Test User",
            "officeLocation": "Test Office"
        }
        
        self.users[user_id] = user_info
        logger.info(f"Created mock Office 365 user: {email}")
        
        # Store user ID in any tokens for this user
        for code, token_info in self.tokens.items():
            token_info["user_id"] = user_id
        
        return user_info


class MockGmailOAuth(MockOAuthProvider):
    """Mock implementation of Gmail OAuth provider."""
    
    def __init__(self):
        client_id = os.environ.get("TEST_GMAIL_CLIENT_ID", "mock_gmail_client_id")
        client_secret = os.environ.get("TEST_GMAIL_CLIENT_SECRET", "mock_gmail_client_secret")
        super().__init__("gmail", client_id, client_secret)
    
    def create_mock_user(self, email: str, name: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a mock Gmail user profile."""
        if not user_id:
            user_id = f"gmail_{uuid.uuid4()}"
        
        user_info = {
            "id": user_id,
            "email": email,
            "verified_email": True,
            "name": name,
            "given_name": name.split()[0] if ' ' in name else name,
            "family_name": name.split()[-1] if ' ' in name else "",
            "picture": f"https://mock-profile-pictures.example.com/{user_id}.jpg"
        }
        
        self.users[user_id] = user_info
        logger.info(f"Created mock Gmail user: {email}")
        
        # Store user ID in any tokens for this user
        for code, token_info in self.tokens.items():
            token_info["user_id"] = user_id
        
        return user_info


class MockEmailService:
    """Mock email service for testing."""
    
    def __init__(self):
        self.sent_emails: List[Dict[str, Any]] = []
        logger.info("Mock email service initialized")
    
    def send_email(self, to: str, subject: str, body: str, html_body: Optional[str] = None, 
                  from_email: Optional[str] = None, from_name: Optional[str] = None) -> bool:
        """Send a mock email (store in memory)."""
        email_data = {
            "to": to,
            "subject": subject,
            "body": body,
            "html_body": html_body,
            "from_email": from_email or "no-reply@test.example.com",
            "from_name": from_name or "TAP Integration Platform",
            "sent_at": datetime.now()
        }
        
        self.sent_emails.append(email_data)
        logger.info(f"Mock email sent to {to}: {subject}")
        return True
    
    def get_emails_sent_to(self, email_address: str) -> List[Dict[str, Any]]:
        """Get all emails sent to a specific address."""
        return [email for email in self.sent_emails if email["to"] == email_address]
    
    def clear_emails(self) -> None:
        """Clear all stored emails."""
        self.sent_emails = []
        logger.info("Cleared all mock emails")


class MockStorageService:
    """Mock storage service for testing (S3, Azure Blob, etc.)."""
    
    def __init__(self, provider_name: str):
        self.provider_name = provider_name
        self.files: Dict[str, Dict[str, Any]] = {}
        logger.info(f"Mock {provider_name} storage service initialized")
    
    def upload_file(self, file_path: str, content: bytes, content_type: Optional[str] = None) -> bool:
        """Upload a file to mock storage."""
        self.files[file_path] = {
            "content": content,
            "content_type": content_type or "application/octet-stream",
            "uploaded_at": datetime.now(),
            "size": len(content)
        }
        logger.info(f"Uploaded file to {self.provider_name}: {file_path}")
        return True
    
    def download_file(self, file_path: str) -> Optional[bytes]:
        """Download a file from mock storage."""
        if file_path not in self.files:
            logger.warning(f"File not found in {self.provider_name}: {file_path}")
            return None
        
        logger.info(f"Downloaded file from {self.provider_name}: {file_path}")
        return self.files[file_path]["content"]
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file from mock storage."""
        if file_path not in self.files:
            logger.warning(f"File not found in {self.provider_name}: {file_path}")
            return False
        
        del self.files[file_path]
        logger.info(f"Deleted file from {self.provider_name}: {file_path}")
        return True
    
    def list_files(self, prefix: Optional[str] = None) -> List[str]:
        """List files in mock storage."""
        if prefix:
            return [path for path in self.files.keys() if path.startswith(prefix)]
        return list(self.files.keys())


# Create global instances for easy access in tests
office365_oauth = MockOffice365OAuth()
gmail_oauth = MockGmailOAuth()
email_service = MockEmailService()
s3_storage = MockStorageService("S3")
azure_blob_storage = MockStorageService("Azure Blob")