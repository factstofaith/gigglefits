"""
Authentication Module for Various Connection Types

This module provides authentication capabilities for different types of
data source connections, including API keys, OAuth2, and credential-based
authentication methods.
"""

from typing import Dict, Any, Optional, List, Callable, Union
import abc
import time
import base64
import json
import logging
import requests
from requests.auth import HTTPBasicAuth, HTTPDigestAuth


logger = logging.getLogger(__name__)


class AuthenticationError(Exception):
    """Exception raised for authentication failures"""
    pass


class AuthenticationMethod(abc.ABC):
    """Abstract base class for authentication methods"""
    
    @abc.abstractmethod
    def apply_to_request(self, request_kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply authentication to a request
        
        Args:
            request_kwargs: Request keyword arguments dictionary
            
        Returns:
            Dict[str, Any]: Updated request kwargs with authentication
        """
        pass
        
    @abc.abstractmethod
    def refresh(self) -> bool:
        """
        Refresh authentication credentials if needed
        
        Returns:
            bool: True if refresh was successful, False otherwise
        """
        pass
        
    @property
    @abc.abstractmethod
    def is_valid(self) -> bool:
        """
        Check if authentication is currently valid
        
        Returns:
            bool: True if authentication is valid, False otherwise
        """
        pass


class ApiKeyAuthentication(AuthenticationMethod):
    """API Key authentication method"""
    
    def __init__(self, 
                 api_key: str, 
                 header_name: str = "Authorization", 
                 prefix: str = "Bearer", 
                 as_parameter: bool = False,
                 parameter_name: str = "api_key"):
        """
        Initialize API Key authentication
        
        Args:
            api_key: The API key value
            header_name: Name of the header for the API key
            prefix: Prefix for the API key (e.g., "Bearer")
            as_parameter: Whether to send the API key as a query parameter
            parameter_name: Name of the query parameter if as_parameter is True
        """
        self.api_key = api_key
        self.header_name = header_name
        self.prefix = prefix
        self.as_parameter = as_parameter
        self.parameter_name = parameter_name
        
    def apply_to_request(self, request_kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """Apply API Key authentication to a request"""
        if not self.api_key:
            return request_kwargs
            
        if not self.as_parameter:
            # Apply as header
            headers = request_kwargs.get("headers", {})
            if self.prefix:
                headers[self.header_name] = f"{self.prefix} {self.api_key}"
            else:
                headers[self.header_name] = self.api_key
            request_kwargs["headers"] = headers
        else:
            # Apply as query parameter
            params = request_kwargs.get("params", {})
            params[self.parameter_name] = self.api_key
            request_kwargs["params"] = params
            
        return request_kwargs
        
    def refresh(self) -> bool:
        """
        API keys typically don't need refreshing
        
        Returns:
            bool: Always True as refresh is not needed
        """
        return True
        
    @property
    def is_valid(self) -> bool:
        """
        Check if API key is valid
        
        Returns:
            bool: True if API key is not empty
        """
        return bool(self.api_key)


class OAuth2Authentication(AuthenticationMethod):
    """OAuth2 authentication method"""
    
    def __init__(self, 
                 client_id: str, 
                 client_secret: str, 
                 token_url: str,
                 scope: Optional[str] = None,
                 token: Optional[Dict[str, Any]] = None,
                 refresh_token_url: Optional[str] = None,
                 additional_params: Optional[Dict[str, Any]] = None):
        """
        Initialize OAuth2 authentication
        
        Args:
            client_id: OAuth2 client ID
            client_secret: OAuth2 client secret
            token_url: URL for obtaining tokens
            scope: OAuth2 scope(s)
            token: Existing token data (if available)
            refresh_token_url: URL for refreshing tokens (if different from token_url)
            additional_params: Additional parameters for token requests
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_url = token_url
        self.scope = scope
        self.token = token or {}
        self.refresh_token_url = refresh_token_url or token_url
        self.additional_params = additional_params or {}
        
    def apply_to_request(self, request_kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """Apply OAuth2 authentication to a request"""
        if not self.token or not self.token.get("access_token"):
            raise AuthenticationError("No access token available")
            
        headers = request_kwargs.get("headers", {})
        headers["Authorization"] = f"Bearer {self.token['access_token']}"
        request_kwargs["headers"] = headers
        
        return request_kwargs
        
    def refresh(self) -> bool:
        """
        Refresh OAuth2 tokens
        
        Returns:
            bool: True if refresh was successful, False otherwise
        """
        if not self.token or not self.token.get("refresh_token"):
            # If no refresh token, attempt to get a new token
            return self._get_new_token()
            
        try:
            # Use refresh token to get a new access token
            data = {
                "grant_type": "refresh_token",
                "refresh_token": self.token["refresh_token"],
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                **self.additional_params
            }
            
            response = requests.post(self.refresh_token_url, data=data)
            response.raise_for_status()
            
            # Update token with response
            new_token = response.json()
            
            # If no new refresh token provided, keep the old one
            if "refresh_token" not in new_token and "refresh_token" in self.token:
                new_token["refresh_token"] = self.token["refresh_token"]
                
            # Add received_at timestamp
            new_token["received_at"] = int(time.time())
            
            self.token = new_token
            return True
            
        except Exception as e:
            logger.error(f"Failed to refresh OAuth2 token: {str(e)}")
            return False
            
    def _get_new_token(self) -> bool:
        """
        Get a new OAuth2 token using client credentials
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Request new token
            data = {
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                **self.additional_params
            }
            
            if self.scope:
                data["scope"] = self.scope
                
            response = requests.post(self.token_url, data=data)
            response.raise_for_status()
            
            # Update token with response
            self.token = response.json()
            
            # Add received_at timestamp
            self.token["received_at"] = int(time.time())
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to get new OAuth2 token: {str(e)}")
            return False
            
    @property
    def is_valid(self) -> bool:
        """
        Check if OAuth2 token is valid and not expired
        
        Returns:
            bool: True if token is valid and not expired
        """
        if not self.token or not self.token.get("access_token"):
            return False
            
        # Check if token has an expiry and received_at timestamp
        if "expires_in" in self.token and "received_at" in self.token:
            expires_at = self.token["received_at"] + self.token["expires_in"]
            # Consider token invalid if it expires within the next 60 seconds
            return time.time() < (expires_at - 60)
            
        # If no expiry information, assume token is valid
        return True


class Office365OAuth2Authentication(OAuth2Authentication):
    """Microsoft Office 365 specific OAuth2 implementation"""

    def __init__(self,
                 client_id: str,
                 client_secret: str,
                 tenant_id: str,
                 scope: Optional[str] = None,
                 token: Optional[Dict[str, Any]] = None,
                 redirect_uri: Optional[str] = None):
        """
        Initialize Office 365 OAuth2 authentication
        
        Args:
            client_id: Application (client) ID from Azure AD app registration
            client_secret: Client secret from Azure AD app registration
            tenant_id: Directory (tenant) ID from Azure AD
            scope: Space-separated list of permissions (e.g., "https://outlook.office.com/mail.send offline_access")
            token: Existing token data (if available)
            redirect_uri: Redirect URI for authorization code flow
        """
        # Microsoft OAuth endpoints
        token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        
        # Store Microsoft-specific properties
        self.tenant_id = tenant_id
        self.redirect_uri = redirect_uri
        
        # Default scope if not provided
        if not scope:
            scope = "https://graph.microsoft.com/.default"
            
        # Call parent constructor
        super().__init__(
            client_id=client_id,
            client_secret=client_secret,
            token_url=token_url,
            scope=scope,
            token=token
        )
        
    def get_authorization_url(self, state: Optional[str] = None) -> str:
        """
        Get the authorization URL for the authorization code flow
        
        Args:
            state: Optional state parameter for CSRF protection
            
        Returns:
            str: Authorization URL to redirect the user to
        """
        if not self.redirect_uri:
            raise AuthenticationError("redirect_uri is required for authorization code flow")
            
        params = {
            "client_id": self.client_id,
            "response_type": "code",
            "redirect_uri": self.redirect_uri,
            "scope": self.scope,
            "response_mode": "query"
        }
        
        if state:
            params["state"] = state
            
        # Build query string
        query_string = "&".join([f"{k}={requests.utils.quote(v)}" for k, v in params.items()])
        
        return f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/authorize?{query_string}"
        
    def exchange_code_for_token(self, code: str) -> bool:
        """
        Exchange authorization code for token
        
        Args:
            code: Authorization code received from authorization redirect
            
        Returns:
            bool: True if token exchange was successful
        """
        if not self.redirect_uri:
            raise AuthenticationError("redirect_uri is required for authorization code flow")
            
        try:
            data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": self.redirect_uri,
                "scope": self.scope
            }
            
            response = requests.post(self.token_url, data=data)
            response.raise_for_status()
            
            # Update token with response
            self.token = response.json()
            
            # Add received_at timestamp
            self.token["received_at"] = int(time.time())
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to exchange code for token: {str(e)}")
            return False


class GmailOAuth2Authentication(OAuth2Authentication):
    """Google Gmail specific OAuth2 implementation"""

    def __init__(self,
                 client_id: str,
                 client_secret: str,
                 scope: Optional[str] = None,
                 token: Optional[Dict[str, Any]] = None,
                 redirect_uri: Optional[str] = None):
        """
        Initialize Gmail OAuth2 authentication
        
        Args:
            client_id: Client ID from Google Cloud Console
            client_secret: Client secret from Google Cloud Console
            scope: Space-separated list of permissions (e.g., "https://mail.google.com/ https://www.googleapis.com/auth/gmail.send")
            token: Existing token data (if available)
            redirect_uri: Redirect URI for authorization code flow
        """
        # Google OAuth endpoints
        token_url = "https://oauth2.googleapis.com/token"
        
        # Store Google-specific properties
        self.redirect_uri = redirect_uri
        
        # Default scope if not provided
        if not scope:
            scope = "https://mail.google.com/ https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email"
            
        # Call parent constructor
        super().__init__(
            client_id=client_id,
            client_secret=client_secret,
            token_url=token_url,
            scope=scope,
            token=token
        )
        
    def get_authorization_url(self, state: Optional[str] = None) -> str:
        """
        Get the authorization URL for the authorization code flow
        
        Args:
            state: Optional state parameter for CSRF protection
            
        Returns:
            str: Authorization URL to redirect the user to
        """
        if not self.redirect_uri:
            raise AuthenticationError("redirect_uri is required for authorization code flow")
            
        params = {
            "client_id": self.client_id,
            "response_type": "code",
            "redirect_uri": self.redirect_uri,
            "scope": self.scope,
            "access_type": "offline",  # Request a refresh token
            "prompt": "consent"  # Force the consent screen to appear
        }
        
        if state:
            params["state"] = state
            
        # Build query string
        query_string = "&".join([f"{k}={requests.utils.quote(v)}" for k, v in params.items()])
        
        return f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"
        
    def exchange_code_for_token(self, code: str) -> bool:
        """
        Exchange authorization code for token
        
        Args:
            code: Authorization code received from authorization redirect
            
        Returns:
            bool: True if token exchange was successful
        """
        if not self.redirect_uri:
            raise AuthenticationError("redirect_uri is required for authorization code flow")
            
        try:
            data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": self.redirect_uri
            }
            
            response = requests.post(self.token_url, data=data)
            response.raise_for_status()
            
            # Update token with response
            self.token = response.json()
            
            # Add received_at timestamp
            self.token["received_at"] = int(time.time())
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to exchange code for token: {str(e)}")
            return False


class BasicAuthentication(AuthenticationMethod):
    """HTTP Basic Authentication method"""
    
    def __init__(self, username: str, password: str):
        """
        Initialize HTTP Basic Authentication
        
        Args:
            username: Username for authentication
            password: Password for authentication
        """
        self.username = username
        self.password = password
        
    def apply_to_request(self, request_kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """Apply Basic Authentication to a request"""
        request_kwargs["auth"] = HTTPBasicAuth(self.username, self.password)
        return request_kwargs
        
    def refresh(self) -> bool:
        """
        Basic auth doesn't need refreshing
        
        Returns:
            bool: Always True as refresh is not needed
        """
        return True
        
    @property
    def is_valid(self) -> bool:
        """
        Check if basic auth credentials are valid
        
        Returns:
            bool: True if both username and password are not empty
        """
        return bool(self.username and self.password)


class DigestAuthentication(AuthenticationMethod):
    """HTTP Digest Authentication method"""
    
    def __init__(self, username: str, password: str):
        """
        Initialize HTTP Digest Authentication
        
        Args:
            username: Username for authentication
            password: Password for authentication
        """
        self.username = username
        self.password = password
        
    def apply_to_request(self, request_kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """Apply Digest Authentication to a request"""
        request_kwargs["auth"] = HTTPDigestAuth(self.username, self.password)
        return request_kwargs
        
    def refresh(self) -> bool:
        """
        Digest auth doesn't need refreshing
        
        Returns:
            bool: Always True as refresh is not needed
        """
        return True
        
    @property
    def is_valid(self) -> bool:
        """
        Check if digest auth credentials are valid
        
        Returns:
            bool: True if both username and password are not empty
        """
        return bool(self.username and self.password)


class JWTAuthentication(AuthenticationMethod):
    """JWT authentication method"""
    
    def __init__(self, token: str, header_name: str = "Authorization", prefix: str = "Bearer"):
        """
        Initialize JWT authentication
        
        Args:
            token: JWT token string
            header_name: Name of the header for the JWT
            prefix: Prefix for the JWT (typically "Bearer")
        """
        self.token = token
        self.header_name = header_name
        self.prefix = prefix
        
        # Parse token to get expiry if possible
        try:
            # JWT format is header.payload.signature
            # We need the payload part
            payload_part = token.split('.')[1]
            # Add padding if needed
            padded = payload_part + '=' * (4 - len(payload_part) % 4)
            payload = json.loads(base64.b64decode(padded).decode('utf-8'))
            self.exp = payload.get('exp')
        except:
            self.exp = None
        
    def apply_to_request(self, request_kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """Apply JWT authentication to a request"""
        headers = request_kwargs.get("headers", {})
        headers[self.header_name] = f"{self.prefix} {self.token}" if self.prefix else self.token
        request_kwargs["headers"] = headers
        return request_kwargs
        
    def refresh(self) -> bool:
        """
        JWT tokens typically need to be replaced, not refreshed
        
        Returns:
            bool: False as JWT refresh is not supported directly
        """
        return False
        
    @property
    def is_valid(self) -> bool:
        """
        Check if JWT token is valid and not expired
        
        Returns:
            bool: True if token exists and not expired
        """
        if not self.token:
            return False
            
        # If we have an expiry timestamp
        if self.exp:
            return time.time() < (self.exp - 60)  # 60 seconds grace period
            
        # If no expiry info, assume token is valid
        return True


class AuthenticationFactory:
    """Factory for creating authentication method instances"""
    
    @staticmethod
    def create_auth_method(auth_type: str, config: Dict[str, Any]) -> Optional[AuthenticationMethod]:
        """
        Create an authentication method based on type and configuration
        
        Args:
            auth_type: Type of authentication method
            config: Configuration for the authentication method
            
        Returns:
            AuthenticationMethod: An authentication method instance or None if type is unknown
        """
        if auth_type == "api_key":
            return ApiKeyAuthentication(
                api_key=config.get("api_key", ""),
                header_name=config.get("header_name", "Authorization"),
                prefix=config.get("prefix", "Bearer"),
                as_parameter=config.get("as_parameter", False),
                parameter_name=config.get("parameter_name", "api_key")
            )
        elif auth_type == "oauth2":
            return OAuth2Authentication(
                client_id=config.get("client_id", ""),
                client_secret=config.get("client_secret", ""),
                token_url=config.get("token_url", ""),
                scope=config.get("scope"),
                token=config.get("token"),
                refresh_token_url=config.get("refresh_token_url"),
                additional_params=config.get("additional_params", {})
            )
        elif auth_type == "office365_oauth":
            return Office365OAuth2Authentication(
                client_id=config.get("client_id", ""),
                client_secret=config.get("client_secret", ""),
                tenant_id=config.get("tenant_id", ""),
                scope=config.get("scope"),
                token=config.get("token"),
                redirect_uri=config.get("redirect_uri")
            )
        elif auth_type == "gmail_oauth":
            return GmailOAuth2Authentication(
                client_id=config.get("client_id", ""),
                client_secret=config.get("client_secret", ""),
                scope=config.get("scope"),
                token=config.get("token"),
                redirect_uri=config.get("redirect_uri")
            )
        elif auth_type == "basic":
            return BasicAuthentication(
                username=config.get("username", ""),
                password=config.get("password", "")
            )
        elif auth_type == "digest":
            return DigestAuthentication(
                username=config.get("username", ""),
                password=config.get("password", "")
            )
        elif auth_type == "jwt":
            return JWTAuthentication(
                token=config.get("token", ""),
                header_name=config.get("header_name", "Authorization"),
                prefix=config.get("prefix", "Bearer")
            )
        else:
            logger.warning(f"Unknown authentication type: {auth_type}")
            return None