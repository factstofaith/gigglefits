"""
OAuth Adapter for API integrations

This module provides an adapter for OAuth-based APIs with token management
and automatic refresh capabilities.
"""

from typing import Dict, Any, Optional, List
import time
import requests
from datetime import datetime, timedelta
import logging

from .api_adapter import APIAdapter

logger = logging.getLogger(__name__)

class OAuthAdapter(APIAdapter):
    """Adapter for OAuth-based APIs with token refresh capabilities"""
    
    def __init__(
        self, 
        base_url: str, 
        client_id: str, 
        client_secret: str, 
        token_url: str, 
        scope: Optional[str] = None,
        auth_method: str = "client_credentials"
    ):
        """
        Initialize the OAuth adapter
        
        Args:
            base_url: Base URL for API requests
            client_id: OAuth client ID
            client_secret: OAuth client secret
            token_url: URL for token acquisition
            scope: OAuth scope (space-separated)
            auth_method: Authentication method (client_credentials, authorization_code, password)
        """
        # Initialize without API key since we'll use OAuth tokens
        super().__init__(base_url, api_key=None)
        
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_url = token_url
        self.scope = scope
        self.auth_method = auth_method
        
        # Token storage
        self.access_token = None
        self.refresh_token = None
        self.token_expiry = None
        
        # Default token buffer to prevent token expiry during requests (30 seconds)
        self.token_buffer = 30
    
    def authenticate(self) -> bool:
        """
        Perform OAuth authentication flow to acquire tokens
        
        Returns:
            bool: True if authentication was successful
        """
        if self.auth_method == "client_credentials":
            return self._client_credentials_flow()
        else:
            # For now, only client_credentials is implemented
            # Future: Add support for authorization_code and password flows
            raise NotImplementedError(f"Auth method {self.auth_method} not implemented")
    
    def _client_credentials_flow(self) -> bool:
        """
        Implement Client Credentials OAuth flow
        
        Returns:
            bool: True if authentication was successful
        """
        try:
            data = {
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret
            }
            
            if self.scope:
                data["scope"] = self.scope
                
            response = requests.post(self.token_url, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            self._update_token_data(token_data)
            
            return True
        except Exception as e:
            logger.error(f"OAuth authentication error: {str(e)}")
            return False
    
    def _update_token_data(self, token_data: Dict[str, Any]) -> None:
        """
        Update token data from response
        
        Args:
            token_data: Token response data
        """
        self.access_token = token_data.get("access_token")
        self.refresh_token = token_data.get("refresh_token")
        
        # Calculate token expiry
        expires_in = token_data.get("expires_in", 3600)  # Default to 1 hour
        self.token_expiry = datetime.now() + timedelta(seconds=expires_in)
        
        # Update session headers with the new token
        self.session.headers.update({"Authorization": f"Bearer {self.access_token}"})
        
        logger.info("OAuth token acquired/refreshed successfully")
    
    def token_expired(self) -> bool:
        """
        Check if the current token is expired or about to expire
        
        Returns:
            bool: True if token is expired or will expire soon
        """
        if not self.access_token or not self.token_expiry:
            return True
            
        # Check if token is expired or will expire soon (within buffer)
        buffer_time = datetime.now() + timedelta(seconds=self.token_buffer)
        return buffer_time >= self.token_expiry
    
    def refresh_auth_token(self) -> bool:
        """
        Refresh the authentication token if expired
        
        Returns:
            bool: True if token refresh was successful
        """
        # If we have a refresh token, use it
        if self.refresh_token:
            try:
                data = {
                    "grant_type": "refresh_token",
                    "refresh_token": self.refresh_token,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret
                }
                
                response = requests.post(self.token_url, data=data)
                response.raise_for_status()
                
                token_data = response.json()
                self._update_token_data(token_data)
                
                return True
            except Exception as e:
                logger.error(f"OAuth token refresh error: {str(e)}")
                # If refresh fails, try full authentication
                
        # Fall back to full authentication
        return self.authenticate()
    
    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Make a GET request with automatic token handling
        
        Args:
            endpoint: API endpoint
            params: Query parameters
            
        Returns:
            Dict[str, Any]: Response data
        """
        if self.token_expired():
            self.refresh_auth_token()
            
        return super().get(endpoint, params)
    
    def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a POST request with automatic token handling
        
        Args:
            endpoint: API endpoint
            data: Request data
            
        Returns:
            Dict[str, Any]: Response data
        """
        if self.token_expired():
            self.refresh_auth_token()
            
        return super().post(endpoint, data)
    
    def put(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a PUT request with automatic token handling
        
        Args:
            endpoint: API endpoint
            data: Request data
            
        Returns:
            Dict[str, Any]: Response data
        """
        if self.token_expired():
            self.refresh_auth_token()
            
        return super().put(endpoint, data)
    
    def delete(self, endpoint: str) -> Dict[str, Any]:
        """
        Make a DELETE request with automatic token handling
        
        Args:
            endpoint: API endpoint
            
        Returns:
            Dict[str, Any]: Response data
        """
        if self.token_expired():
            self.refresh_auth_token()
            
        return super().delete(endpoint)
    
    def discover_fields(self) -> List[Dict[str, str]]:
        """
        Discover fields from the API (override in specific adapters)
        
        Returns:
            List[Dict[str, str]]: Discovered fields
        """
        # This is a generic implementation that should be overridden
        # by specific API adapters for better field discovery
        try:
            # If token is expired, refresh it
            if self.token_expired():
                self.refresh_auth_token()
                
            # Try to get a sample response from a common endpoint
            # This is a guess and might not work for all APIs
            sample_data = None
            
            # Try some common endpoints
            for endpoint in ["", "metadata", "schema", "fields"]:
                try:
                    sample_data = self.get(endpoint)
                    break
                except:
                    continue
            
            if not sample_data:
                # If no endpoint worked, return default fields
                return super().discover_fields()
            
            # Try to extract fields from the first item
            if isinstance(sample_data, list) and sample_data:
                first_item = sample_data[0]
            elif isinstance(sample_data, dict):
                # Check if there's a data/items/results field (common in APIs)
                for key in ["data", "items", "results", "records"]:
                    if key in sample_data and isinstance(sample_data[key], list) and sample_data[key]:
                        first_item = sample_data[key][0]
                        break
                else:
                    first_item = sample_data
            else:
                # Fallback to default
                return super().discover_fields()
            
            # Extract fields from the item
            fields = []
            for key, value in first_item.items():
                field_type = "string"
                if isinstance(value, int):
                    field_type = "integer"
                elif isinstance(value, float):
                    field_type = "number"
                elif isinstance(value, bool):
                    field_type = "boolean"
                elif isinstance(value, list):
                    field_type = "array"
                elif isinstance(value, dict):
                    field_type = "object"
                
                fields.append({
                    "name": key,
                    "type": field_type,
                    "description": f"Field {key} from API"
                })
            
            return fields
        except Exception as e:
            logger.error(f"Error discovering fields from OAuth API: {str(e)}")
            return super().discover_fields()