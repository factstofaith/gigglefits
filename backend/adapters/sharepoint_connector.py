"""
SharePoint Document Library Connector Implementation

This module implements the StorageConnector interface for SharePoint Online
document libraries to provide a consistent storage interface with robust error
handling, connection tracking, and retry functionality.
"""

import os
import io
import logging
import json
import base64
import mimetypes
import time
import functools
from typing import Dict, Any, Optional, List, Union, BinaryIO, Tuple
from datetime import datetime, timedelta, timezone
import urllib.parse

import requests
from requests.exceptions import RequestException, ConnectionError as RequestsConnectionError
import msal

from .storage_connector import StorageConnector
from ..utils.error_handling.exceptions import StorageError, ConnectionError, AuthenticationError, OperationError

logger = logging.getLogger(__name__)


def retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2):
    """
    Decorator for retrying SharePoint operations with exponential backoff.
    
    Args:
        max_retries (int): Maximum number of retries before giving up
        initial_backoff (float): Initial backoff time in seconds
        backoff_factor (float): Factor to multiply backoff time by after each retry
        
    Returns:
        Callable: Decorated function with retry logic
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            current_backoff = initial_backoff
            
            while True:
                try:
                    return func(*args, **kwargs)
                except (RequestException, requests.HTTPError) as e:
                    # Check if the error is transient (retryable)
                    if hasattr(e, 'response') and e.response is not None:
                        status_code = e.response.status_code
                        # Don't retry on client errors except timeout (429) or specific server errors
                        if status_code < 500 and status_code != 429 and status_code != 408:
                            logger.error(f"Non-retryable HTTP error: {status_code} - {str(e)}")
                            raise StorageError(f"SharePoint operation failed: {str(e)}", original_error=e)
                    
                    retries += 1
                    if retries > max_retries:
                        logger.error(f"Operation failed after {max_retries} retries: {str(e)}")
                        raise StorageError(f"Operation failed after {max_retries} retries", original_error=e)
                    
                    logger.warning(f"Retry {retries}/{max_retries} after error: {str(e)}. Waiting {current_backoff}s")
                    time.sleep(current_backoff)
                    current_backoff *= backoff_factor
        return wrapper
    return decorator


class SharePointConnector(StorageConnector):
    """SharePoint document library connector implementation
    
    This class implements the StorageConnector interface for SharePoint document libraries.
    It provides methods for interacting with SharePoint Online including document library
    management, file operations, and metadata handling in a standardized way.
    
    The connector supports multiple authentication methods:
    - App-based authentication (client ID + client secret)
    - User-based authentication (username + password)
    
    Features include:
    - Connection status tracking
    - Retry mechanisms for transient errors
    - Detailed error handling with specific error types
    - Performance metrics for operations
    
    Attributes:
        site_url (str): SharePoint site URL
        client (msal.ConfidentialClientApplication or msal.PublicClientApplication): MSAL client
        access_token (str): Current access token for authentication
        token_expiry (datetime): Access token expiry time
        default_library (str): Default document library name
        connection_status (Dict): Current connection status and health information
    """
    
    def __init__(self, 
                 site_url: str,
                 client_id: str,
                 tenant_id: str,
                 username: Optional[str] = None,
                 password: Optional[str] = None,
                 client_secret: Optional[str] = None,
                 auth_type: str = 'app',  # 'app' or 'user'
                 default_library: Optional[str] = 'Documents',
                 timeout: int = 60,
                 max_retries: int = 3,
                 verify_ssl: bool = True):
        """
        Initialize the SharePoint connector
        
        Args:
            site_url (str): SharePoint site URL (e.g., https://contoso.sharepoint.com/sites/sitename)
            client_id (str): Azure AD application client ID
            tenant_id (str): Azure AD tenant ID
            username (Optional[str]): User principal name for user credentials auth
            password (Optional[str]): User password for user credentials auth
            client_secret (Optional[str]): Client secret for application authentication
            auth_type (str): Authentication type ('app' or 'user')
            default_library (Optional[str]): Default document library name
            timeout (int): Request timeout in seconds
            max_retries (int): Maximum number of retries for failed operations
            verify_ssl (bool): Whether to verify SSL certificates
            
        Raises:
            AuthenticationError: If no valid authentication method is provided
            ValueError: If site_url is invalid
        """
        # Validate input parameters
        if not site_url:
            raise ValueError("SharePoint site URL cannot be empty")
            
        if not client_id or not tenant_id:
            raise AuthenticationError("Client ID and Tenant ID are required")
            
        if auth_type == 'app' and not client_secret:
            raise AuthenticationError("Client secret is required for app-based authentication")
            
        if auth_type == 'user' and (not username or not password):
            raise AuthenticationError("Username and password are required for user-based authentication")
            
        # Store connection parameters
        self.site_url = site_url.rstrip('/')
        self.client_id = client_id
        self.tenant_id = tenant_id
        self.username = username
        self.password = password
        self.client_secret = client_secret
        self.auth_type = auth_type
        self.default_library = default_library
        self.timeout = timeout
        self.max_retries = max_retries
        self.verify_ssl = verify_ssl
        
        # Authentication and API settings
        self.authority = f"https://login.microsoftonline.com/{tenant_id}"
        self.graph_resource = 'https://graph.microsoft.com/.default'
        self.sharepoint_resource = f"{self.site_url}/.default"
        self.api_version = 'v1.0'
        
        # Client and token management
        self.client = None  # MSAL client will be initialized in connect()
        self.token_cache = {}  # {resource: {token, expiry}}
        self.access_token = None
        self.token_expiry = None
        
        # Site information
        self.site_info = None
        self.site_domain = None
        self.site_name = None
        self.web_id = None
        self.drive_id = None
        
        # Connection status tracking
        self.connection_status = {
            "connected": False,
            "last_connection_attempt": None,
            "last_successful_connection": None,
            "connection_errors": [],
            "auth_method": auth_type,
            "endpoint": site_url
        }
        
        # Extract site domain and name from URL for API calls
        try:
            # Example: https://contoso.sharepoint.com/sites/sitename
            parsed_url = urllib.parse.urlparse(self.site_url)
            hostname_parts = parsed_url.netloc.split('.')
            self.site_domain = hostname_parts[0]  # contoso
            
            path_parts = parsed_url.path.strip('/').split('/')
            if len(path_parts) >= 2 and path_parts[0] == 'sites':
                self.site_name = path_parts[1]  # sitename
        except Exception as e:
            logger.error(f"Error parsing SharePoint site URL: {str(e)}")
    
    def connect(self) -> bool:
        """
        Establish a connection to SharePoint Online
        
        This method performs a series of operations to verify connectivity:
        1. Initializes the MSAL client if needed
        2. Acquires access token for Microsoft Graph API
        3. Gets site information
        4. Acquires access token for SharePoint API
        
        Returns:
            bool: True if connection is successful, False otherwise
            
        Raises:
            ConnectionError: If connection cannot be established
            AuthenticationError: If authentication fails
        """
        now = datetime.now(timezone.utc)
        self.connection_status["last_connection_attempt"] = now
        
        try:
            logger.info(f"Connecting to SharePoint Online site: {self.site_url} using {self.auth_type} authentication")
            
            # Initialize the MSAL client if not already initialized
            if not self.client:
                if self.auth_type == 'app':
                    if not self.client_secret:
                        error_msg = "Client secret is required for app-based authentication"
                        logger.error(error_msg)
                        raise AuthenticationError(error_msg)
                    
                    # Create a confidential client application
                    self.client = msal.ConfidentialClientApplication(
                        client_id=self.client_id,
                        client_credential=self.client_secret,
                        authority=self.authority
                    )
                    logger.debug("Initialized MSAL ConfidentialClientApplication for app-based authentication")
                else:  # 'user'
                    if not self.username or not self.password:
                        error_msg = "Username and password are required for user-based authentication"
                        logger.error(error_msg)
                        raise AuthenticationError(error_msg)
                    
                    # Create a public client application
                    self.client = msal.PublicClientApplication(
                        client_id=self.client_id,
                        authority=self.authority
                    )
                    logger.debug("Initialized MSAL PublicClientApplication for user-based authentication")
            
            # Get token for Microsoft Graph API
            logger.debug("Acquiring access token for Microsoft Graph API")
            graph_token = self._get_access_token(self.graph_resource)
            if not graph_token:
                error_msg = "Failed to acquire access token for Microsoft Graph API"
                logger.error(error_msg)
                raise AuthenticationError(error_msg)
            
            # Get site information
            logger.debug("Retrieving SharePoint site information")
            site_info = self._get_site_info(graph_token)
            if not site_info:
                error_msg = "Failed to retrieve SharePoint site information"
                logger.error(error_msg)
                raise ConnectionError(error_msg)
            
            self.site_info = site_info
            self.web_id = site_info.get('id')
            logger.debug(f"Retrieved site information. Web ID: {self.web_id}")
            
            # Get token for SharePoint API
            logger.debug("Acquiring access token for SharePoint API")
            sharepoint_token = self._get_access_token(self.sharepoint_resource)
            if not sharepoint_token:
                error_msg = "Failed to acquire access token for SharePoint API"
                logger.error(error_msg)
                raise AuthenticationError(error_msg)
            
            # Set the connection status to success
            self.connection_status["connected"] = True
            self.connection_status["last_successful_connection"] = now
            self.connection_status["connection_errors"] = []
            self.connection_status["site_info"] = {
                "id": self.web_id,
                "name": self.site_name,
                "domain": self.site_domain,
                "url": self.site_url
            }
            
            logger.info(f"Successfully connected to SharePoint Online site: {self.site_url}")
            return True
            
        except AuthenticationError as e:
            # Update connection status
            self.connection_status["connected"] = False
            self.connection_status["connection_errors"].append({
                "timestamp": now.isoformat(),
                "error": str(e),
                "error_type": "AuthenticationError",
                "stage": "connect"
            })
            
            # Re-raise the error
            raise
            
        except RequestException as e:
            error_msg = f"Failed to connect to SharePoint due to network error: {str(e)}"
            logger.error(error_msg)
            
            # Update connection status
            self.connection_status["connected"] = False
            self.connection_status["connection_errors"].append({
                "timestamp": now.isoformat(),
                "error": str(e),
                "error_type": "RequestException",
                "stage": "connect"
            })
            
            raise ConnectionError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Unexpected error connecting to SharePoint: {str(e)}"
            logger.error(error_msg)
            
            # Update connection status
            self.connection_status["connected"] = False
            self.connection_status["connection_errors"].append({
                "timestamp": now.isoformat(),
                "error": str(e),
                "error_type": type(e).__name__,
                "stage": "connect"
            })
            
            raise ConnectionError(error_msg, original_error=e)
    
    def disconnect(self) -> bool:
        """Close the connection to SharePoint Online"""
        # Clear token cache
        self.token_cache = {}
        self.site_info = None
        self.web_id = None
        return True
    
    def test_connection(self) -> Dict[str, Any]:
        """Test the connection to SharePoint Online"""
        try:
            # Ensure connected
            if not self.site_info:
                success = self.connect()
                if not success:
                    return {
                        'status': 'error',
                        'message': 'Failed to connect to SharePoint Online'
                    }
            
            # List document libraries to verify access
            libraries = self.list_containers()
            library_count = len(libraries)
            
            return {
                'status': 'success',
                'message': f'Connection successful. Found {library_count} document libraries.',
                'site_name': self.site_name,
                'libraries': library_count
            }
            
        except Exception as e:
            logger.error(f"SharePoint connection test failed: {str(e)}")
            return {
                'status': 'error',
                'message': f'Connection failed: {str(e)}'
            }
    
    @retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2)
    def list_containers(self) -> List[Dict[str, Any]]:
        """List available document libraries in SharePoint site
        
        Returns a list of document libraries available in the connected SharePoint site,
        with details including name, display name, ID, and timestamps.
        
        Returns:
            List[Dict[str, Any]]: List of document libraries with their properties
            
        Raises:
            ConnectionError: If connection to SharePoint fails
            AuthenticationError: If authentication or token acquisition fails
            StorageError: If SharePoint operation fails
        """
        start_time = time.time()
        operation_id = f"list_containers_{int(start_time * 1000)}"
        logger.info(f"[{operation_id}] Listing SharePoint document libraries")
        
        try:
            # Ensure connected
            if not self.site_info:
                logger.debug(f"[{operation_id}] Connection not established, connecting first")
                success = self.connect()
                if not success:
                    error_msg = "Failed to connect to SharePoint Online"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise ConnectionError(error_msg)
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                error_msg = "Failed to acquire access token for Microsoft Graph API"
                logger.error(f"[{operation_id}] {error_msg}")
                raise AuthenticationError(error_msg)
            
            # Get document libraries
            url = f"https://graph.microsoft.com/{self.api_version}/sites/{self.site_domain},sites,{self.site_name}/lists"
            params = {
                "$filter": "displayName ne 'Site Pages' and displayName ne 'Form Templates'"
            }
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            
            logger.debug(f"[{operation_id}] Requesting document libraries from {url}")
            response = requests.get(url, params=params, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            libraries = []
            
            for item in data.get('value', []):
                # Filter to only include document libraries
                if item.get('list', {}).get('template') == 'documentLibrary':
                    libraries.append({
                        'name': item.get('name', ''),
                        'display_name': item.get('displayName', ''),
                        'id': item.get('id', ''),
                        'created_at': item.get('createdDateTime'),
                        'last_modified': item.get('lastModifiedDateTime')
                    })
            
            duration_ms = int((time.time() - start_time) * 1000)
            logger.info(f"[{operation_id}] Listed {len(libraries)} SharePoint document libraries in {duration_ms}ms")
            return libraries
            
        except AuthenticationError as e:
            # Re-raise authentication errors
            logger.error(f"[{operation_id}] Authentication error: {str(e)}")
            raise
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error listing SharePoint document libraries: {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Failed to list SharePoint document libraries: {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2)
    def create_container(self, container_name: str) -> Dict[str, Any]:
        """Create a new document library in SharePoint site
        
        Args:
            container_name (str): Name of the document library to create
            
        Returns:
            Dict[str, Any]: Operation result with status and details
            
        Raises:
            ConnectionError: If connection to SharePoint fails
            AuthenticationError: If authentication or token acquisition fails
            StorageError: If SharePoint operation fails
            ValueError: If container_name is invalid
        """
        if not container_name or not isinstance(container_name, str):
            raise ValueError("Container name must be a non-empty string")
            
        start_time = time.time()
        operation_id = f"create_container_{int(start_time * 1000)}"
        logger.info(f"[{operation_id}] Creating SharePoint document library '{container_name}'")
        
        try:
            # Ensure connected
            if not self.site_info:
                logger.debug(f"[{operation_id}] Connection not established, connecting first")
                success = self.connect()
                if not success:
                    error_msg = "Failed to connect to SharePoint Online"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise ConnectionError(error_msg)
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                error_msg = "Failed to acquire access token for Microsoft Graph API"
                logger.error(f"[{operation_id}] {error_msg}")
                raise AuthenticationError(error_msg)
            
            # Create document library
            url = f"https://graph.microsoft.com/{self.api_version}/sites/{self.site_domain},sites,{self.site_name}/lists"
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            
            payload = {
                "displayName": container_name,
                "list": {
                    "template": "documentLibrary"
                }
            }
            
            logger.debug(f"[{operation_id}] Sending request to create document library to {url}")
            response = requests.post(url, headers=headers, json=payload, timeout=self.timeout)
            response.raise_for_status()
            
            # Get the created document library details
            created_library = response.json()
            duration_ms = int((time.time() - start_time) * 1000)
            
            result = {
                'status': 'success',
                'message': f"Document library '{container_name}' created successfully",
                'name': created_library.get('name', ''),
                'id': created_library.get('id', ''),
                'created_at': created_library.get('createdDateTime'),
                'operation_duration_ms': duration_ms
            }
            
            logger.info(f"[{operation_id}] Created SharePoint document library '{container_name}' in {duration_ms}ms")
            return result
            
        except requests.exceptions.HTTPError as http_err:
            # Check if error is due to library already existing
            if http_err.response.status_code == 409:
                duration_ms = int((time.time() - start_time) * 1000)
                logger.warning(f"[{operation_id}] SharePoint document library '{container_name}' already exists")
                
                return {
                    'status': 'success',
                    'message': f"Document library '{container_name}' already exists",
                    'name': container_name,
                    'operation_duration_ms': duration_ms,
                    'already_exists': True
                }
            else:
                error_msg = f"Failed to create SharePoint document library '{container_name}': {str(http_err)}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err)
                
        except AuthenticationError as e:
            # Re-raise authentication errors
            logger.error(f"[{operation_id}] Authentication error: {str(e)}")
            raise
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error creating SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Failed to create SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2)
    def delete_container(self, container_name: str) -> Dict[str, Any]:
        """Delete a document library from SharePoint site
        
        Args:
            container_name (str): Name of the document library to delete
            
        Returns:
            Dict[str, Any]: Operation result with status and details
            
        Raises:
            ConnectionError: If connection to SharePoint fails
            AuthenticationError: If authentication or token acquisition fails
            StorageError: If SharePoint operation fails
            ValueError: If container_name is invalid
        """
        if not container_name or not isinstance(container_name, str):
            raise ValueError("Container name must be a non-empty string")
            
        start_time = time.time()
        operation_id = f"delete_container_{int(start_time * 1000)}"
        logger.info(f"[{operation_id}] Deleting SharePoint document library '{container_name}'")
        
        try:
            # Ensure connected
            if not self.site_info:
                logger.debug(f"[{operation_id}] Connection not established, connecting first")
                success = self.connect()
                if not success:
                    error_msg = "Failed to connect to SharePoint Online"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise ConnectionError(error_msg)
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                error_msg = "Failed to acquire access token for Microsoft Graph API"
                logger.error(f"[{operation_id}] {error_msg}")
                raise AuthenticationError(error_msg)
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                duration_ms = int((time.time() - start_time) * 1000)
                logger.warning(f"[{operation_id}] SharePoint document library '{container_name}' not found")
                
                return {
                    'status': 'success',
                    'message': f"Document library '{container_name}' not found (nothing to delete)",
                    'name': container_name,
                    'operation_duration_ms': duration_ms,
                    'not_found': True
                }
            
            # Delete document library
            url = f"https://graph.microsoft.com/{self.api_version}/sites/{self.site_domain},sites,{self.site_name}/lists/{library_id}"
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            
            logger.debug(f"[{operation_id}] Sending request to delete document library to {url}")
            response = requests.delete(url, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            
            duration_ms = int((time.time() - start_time) * 1000)
            logger.info(f"[{operation_id}] Deleted SharePoint document library '{container_name}' in {duration_ms}ms")
            
            return {
                'status': 'success',
                'message': f"Document library '{container_name}' deleted successfully",
                'name': container_name,
                'operation_duration_ms': duration_ms
            }
            
        except AuthenticationError as e:
            # Re-raise authentication errors
            logger.error(f"[{operation_id}] Authentication error: {str(e)}")
            raise
            
        except requests.exceptions.HTTPError as http_err:
            if http_err.response.status_code == 404:
                duration_ms = int((time.time() - start_time) * 1000)
                logger.warning(f"[{operation_id}] SharePoint document library '{container_name}' not found")
                
                return {
                    'status': 'success',
                    'message': f"Document library '{container_name}' not found (nothing to delete)",
                    'name': container_name,
                    'operation_duration_ms': duration_ms,
                    'not_found': True
                }
            else:
                error_msg = f"Failed to delete SharePoint document library '{container_name}': {str(http_err)}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err)
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error deleting SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Failed to delete SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2)
    def list_blobs(self, container_name: str, prefix: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """List files in a SharePoint document library
        
        Args:
            container_name (str): Name of the document library to list files from
            prefix (Optional[str]): Filter files by name prefix
            limit (Optional[int]): Maximum number of files to return
            
        Returns:
            List[Dict[str, Any]]: List of files with their properties
            
        Raises:
            ConnectionError: If connection to SharePoint fails
            AuthenticationError: If authentication or token acquisition fails
            StorageError: If SharePoint operation fails
            ValueError: If container_name is invalid
        """
        if not container_name or not isinstance(container_name, str):
            raise ValueError("Container name must be a non-empty string")
            
        start_time = time.time()
        operation_id = f"list_blobs_{int(start_time * 1000)}"
        logger.info(f"[{operation_id}] Listing files in SharePoint document library '{container_name}'")
        
        try:
            # Ensure connected
            if not self.site_info:
                logger.debug(f"[{operation_id}] Connection not established, connecting first")
                success = self.connect()
                if not success:
                    error_msg = "Failed to connect to SharePoint Online"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise ConnectionError(error_msg)
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                error_msg = "Failed to acquire access token for Microsoft Graph API"
                logger.error(f"[{operation_id}] {error_msg}")
                raise AuthenticationError(error_msg)
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                error_msg = f"SharePoint document library '{container_name}' not found"
                logger.warning(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="CONTAINER_NOT_FOUND")
            
            # Get files in the document library
            url = f"https://graph.microsoft.com/{self.api_version}/sites/{self.site_domain},sites,{self.site_name}/lists/{library_id}/items"
            
            # Validate and set pagination limit
            page_size = 100
            if limit and isinstance(limit, int):
                if limit <= 0:
                    logger.warning(f"[{operation_id}] Invalid limit value {limit}, using default {page_size}")
                else:
                    page_size = min(limit, 999)  # API limit is typically 999
            
            params = {
                "$expand": "fields,driveItem",
                "$top": page_size
            }
            
            # Add filter for prefix if provided
            if prefix:
                logger.debug(f"[{operation_id}] Filtering files by prefix: '{prefix}'")
                params["$filter"] = f"startswith(fields/LinkFilename, '{prefix}')"
            
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            
            logger.debug(f"[{operation_id}] Requesting files from {url} with page size {page_size}")
            response = requests.get(url, params=params, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            blobs = []
            
            # Process items and extract file properties
            for item in data.get('value', []):
                fields = item.get('fields', {})
                drive_item = item.get('driveItem', {})
                
                # Skip folders
                if drive_item.get('folder'):
                    continue
                
                blobs.append({
                    'name': fields.get('LinkFilename', ''),
                    'id': item.get('id', ''),
                    'size': drive_item.get('size', 0),
                    'last_modified': fields.get('Modified'),
                    'created_at': fields.get('Created'),
                    'author': fields.get('Author'),
                    'content_type': drive_item.get('file', {}).get('mimeType'),
                    'etag': drive_item.get('eTag')
                })
            
            # Handle next page if there is one and we need more results
            next_link = data.get('@odata.nextLink')
            original_limit = limit
            
            while next_link and (not original_limit or len(blobs) < original_limit):
                logger.debug(f"[{operation_id}] Fetching next page from {next_link}")
                
                response = requests.get(next_link, headers=headers, timeout=self.timeout)
                response.raise_for_status()
                
                page_data = response.json()
                
                # Process items from this page
                for item in page_data.get('value', []):
                    # Stop if we've reached the limit
                    if original_limit and len(blobs) >= original_limit:
                        break
                        
                    fields = item.get('fields', {})
                    drive_item = item.get('driveItem', {})
                    
                    # Skip folders
                    if drive_item.get('folder'):
                        continue
                    
                    blobs.append({
                        'name': fields.get('LinkFilename', ''),
                        'id': item.get('id', ''),
                        'size': drive_item.get('size', 0),
                        'last_modified': fields.get('Modified'),
                        'created_at': fields.get('Created'),
                        'author': fields.get('Author'),
                        'content_type': drive_item.get('file', {}).get('mimeType'),
                        'etag': drive_item.get('eTag')
                    })
                
                # Update next link for the next iteration
                next_link = page_data.get('@odata.nextLink')
                
                # If we hit the limit, stop pagination
                if original_limit and len(blobs) >= original_limit:
                    break
            
            duration_ms = int((time.time() - start_time) * 1000)
            logger.info(f"[{operation_id}] Listed {len(blobs)} files in SharePoint document library '{container_name}' in {duration_ms}ms")
            
            # If a limit was specified, ensure we don't return more than requested
            if limit and isinstance(limit, int) and limit > 0:
                return blobs[:limit]
            return blobs
            
        except AuthenticationError as e:
            # Re-raise authentication errors
            logger.error(f"[{operation_id}] Authentication error: {str(e)}")
            raise
            
        except requests.exceptions.HTTPError as http_err:
            if http_err.response.status_code == 404:
                error_msg = f"SharePoint document library '{container_name}' not found"
                logger.warning(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err, error_code="CONTAINER_NOT_FOUND")
            else:
                error_msg = f"HTTP error listing files in SharePoint document library '{container_name}': {str(http_err)}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err)
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error listing files in SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Failed to list files in SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2)
    def upload_blob(self, container_name: str, blob_name: str, data: Union[bytes, BinaryIO, str], 
                   content_type: Optional[str] = None, metadata: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Upload a file to a SharePoint document library
        
        Args:
            container_name (str): Name of the document library to upload to
            blob_name (str): Name of the file to upload
            data (Union[bytes, BinaryIO, str]): File content to upload
            content_type (Optional[str]): MIME type of the file
            metadata (Optional[Dict[str, str]]): Metadata to attach to the file
            
        Returns:
            Dict[str, Any]: Operation result with status and details
            
        Raises:
            ConnectionError: If connection to SharePoint fails
            AuthenticationError: If authentication or token acquisition fails
            StorageError: If SharePoint operation fails
            ValueError: If parameters are invalid
        """
        if not container_name or not isinstance(container_name, str):
            raise ValueError("Container name must be a non-empty string")
            
        if not blob_name or not isinstance(blob_name, str):
            raise ValueError("Blob name must be a non-empty string")
            
        if data is None:
            raise ValueError("Data cannot be None")
            
        start_time = time.time()
        operation_id = f"upload_blob_{int(start_time * 1000)}"
        logger.info(f"[{operation_id}] Uploading file '{blob_name}' to SharePoint document library '{container_name}'")
        
        try:
            # Ensure connected
            if not self.site_info:
                logger.debug(f"[{operation_id}] Connection not established, connecting first")
                success = self.connect()
                if not success:
                    error_msg = "Failed to connect to SharePoint Online"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise ConnectionError(error_msg)
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                error_msg = "Failed to acquire access token for Microsoft Graph API"
                logger.error(f"[{operation_id}] {error_msg}")
                raise AuthenticationError(error_msg)
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                error_msg = f"SharePoint document library '{container_name}' not found"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="CONTAINER_NOT_FOUND")
            
            # Get drive ID
            drive_id = self._get_drive_id(library_id, token)
            if not drive_id:
                error_msg = "Failed to get drive ID for document library"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="DRIVE_NOT_FOUND")
            
            # Prepare data
            if isinstance(data, str):
                logger.debug(f"[{operation_id}] Converting string data to bytes")
                data = data.encode('utf-8')
            
            # Determine content type if not provided
            if not content_type and isinstance(blob_name, str):
                content_type, _ = mimetypes.guess_type(blob_name)
                logger.debug(f"[{operation_id}] Guessed content type: {content_type}")
            
            # Default content type
            if not content_type:
                content_type = 'application/octet-stream'
                logger.debug(f"[{operation_id}] Using default content type: {content_type}")
            
            # Get file size for logging
            file_size = 0
            if hasattr(data, 'seek') and hasattr(data, 'tell'):
                # It's a file-like object
                current_pos = data.tell()
                data.seek(0, os.SEEK_END)
                file_size = data.tell()
                data.seek(current_pos)  # Reset to original position
            elif isinstance(data, bytes):
                file_size = len(data)
                
            logger.debug(f"[{operation_id}] Uploading file with size: {file_size} bytes")
            
            # Upload file
            url = f"https://graph.microsoft.com/{self.api_version}/drives/{drive_id}/root:/{blob_name}:/content"
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': content_type
            }
            
            # For large files, we should use the upload session approach
            # but for simplicity in this implementation, we're using direct upload
            # In a future version, files > 4MB should use upload sessions
            logger.debug(f"[{operation_id}] Starting file upload to {url}")
            
            if hasattr(data, 'read'):  # File-like object
                response = requests.put(url, headers=headers, data=data, timeout=self.timeout)
            else:  # Bytes
                response = requests.put(url, headers=headers, data=data, timeout=self.timeout)
            
            response.raise_for_status()
            file_info = response.json()
            
            duration_ms = int((time.time() - start_time) * 1000)
            transfer_rate = int(file_size / (duration_ms / 1000)) if duration_ms > 0 else 0
            
            logger.info(f"[{operation_id}] Uploaded file '{blob_name}' ({file_size} bytes) to SharePoint in {duration_ms}ms. Transfer rate: {transfer_rate} bytes/s")
            
            # If metadata is provided, update file metadata
            if metadata and isinstance(metadata, dict):
                logger.debug(f"[{operation_id}] Updating file metadata")
                metadata_result = self._update_file_metadata(drive_id, file_info.get('id'), metadata, token)
                if not metadata_result.get('success', False):
                    logger.warning(f"[{operation_id}] Failed to update file metadata: {metadata_result.get('message')}")
            
            return {
                'status': 'success',
                'message': 'File uploaded successfully',
                'id': file_info.get('id'),
                'name': file_info.get('name'),
                'size': file_info.get('size'),
                'last_modified': file_info.get('lastModifiedDateTime'),
                'content_type': content_type,
                'operation_duration_ms': duration_ms,
                'transfer_rate_bytes_per_second': transfer_rate
            }
            
        except AuthenticationError as e:
            # Re-raise authentication errors
            logger.error(f"[{operation_id}] Authentication error: {str(e)}")
            raise
            
        except requests.exceptions.HTTPError as http_err:
            if http_err.response.status_code == 404:
                error_msg = f"SharePoint resource not found while uploading file '{blob_name}'"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err, error_code="RESOURCE_NOT_FOUND")
            elif http_err.response.status_code == 409:
                error_msg = f"File '{blob_name}' already exists in SharePoint document library '{container_name}'"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err, error_code="BLOB_ALREADY_EXISTS")
            else:
                error_msg = f"HTTP error uploading file '{blob_name}' to SharePoint document library '{container_name}': {str(http_err)}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err)
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error uploading file '{blob_name}' to SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Failed to upload file '{blob_name}' to SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
    
    def _update_file_metadata(self, drive_id: str, file_id: str, metadata: Dict[str, str], token: str) -> Dict[str, Any]:
        """Update file metadata
        
        Args:
            drive_id (str): Drive ID
            file_id (str): File ID
            metadata (Dict[str, str]): Metadata to update
            token (str): Access token
            
        Returns:
            Dict[str, Any]: Result of the operation
        """
        try:
            url = f"https://graph.microsoft.com/{self.api_version}/drives/{drive_id}/items/{file_id}"
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Format metadata for SharePoint API
            formatted_metadata = {}
            for key, value in metadata.items():
                formatted_metadata[key] = value
                
            # Update file properties
            payload = {
                "fileSystemInfo": formatted_metadata
            }
            
            response = requests.patch(url, headers=headers, json=payload, timeout=self.timeout)
            response.raise_for_status()
            
            return {
                'success': True,
                'message': 'Metadata updated successfully'
            }
            
        except Exception as e:
            logger.error(f"Failed to update file metadata: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to update metadata: {str(e)}'
            }
    
    @retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2)
    def download_blob(self, container_name: str, blob_name: str) -> bytes:
        """Download a file from a SharePoint document library
        
        Args:
            container_name (str): Name of the document library to download from
            blob_name (str): Name of the file to download
            
        Returns:
            bytes: File content as bytes
            
        Raises:
            ConnectionError: If connection to SharePoint fails
            AuthenticationError: If authentication or token acquisition fails
            StorageError: If SharePoint operation fails or file not found
            ValueError: If parameters are invalid
        """
        if not container_name or not isinstance(container_name, str):
            raise ValueError("Container name must be a non-empty string")
            
        if not blob_name or not isinstance(blob_name, str):
            raise ValueError("Blob name must be a non-empty string")
            
        start_time = time.time()
        operation_id = f"download_blob_{int(start_time * 1000)}"
        logger.info(f"[{operation_id}] Downloading file '{blob_name}' from SharePoint document library '{container_name}'")
        
        try:
            # Ensure connected
            if not self.site_info:
                logger.debug(f"[{operation_id}] Connection not established, connecting first")
                success = self.connect()
                if not success:
                    error_msg = "Failed to connect to SharePoint Online"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise ConnectionError(error_msg)
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                error_msg = "Failed to acquire access token for Microsoft Graph API"
                logger.error(f"[{operation_id}] {error_msg}")
                raise AuthenticationError(error_msg)
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                error_msg = f"SharePoint document library '{container_name}' not found"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="CONTAINER_NOT_FOUND")
            
            # Get drive ID
            drive_id = self._get_drive_id(library_id, token)
            if not drive_id:
                error_msg = "Failed to get drive ID for document library"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="DRIVE_NOT_FOUND")
            
            # Get file
            url = f"https://graph.microsoft.com/{self.api_version}/drives/{drive_id}/root:/{blob_name}:/content"
            headers = {
                'Authorization': f'Bearer {token}'
            }
            
            logger.debug(f"[{operation_id}] Downloading file from {url}")
            response = requests.get(url, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            
            content = response.content
            content_length = len(content)
            duration_ms = int((time.time() - start_time) * 1000)
            transfer_rate = int(content_length / (duration_ms / 1000)) if duration_ms > 0 else 0
            
            logger.info(f"[{operation_id}] Downloaded file '{blob_name}' ({content_length} bytes) from SharePoint in {duration_ms}ms. Transfer rate: {transfer_rate} bytes/s")
            
            return content
            
        except AuthenticationError as e:
            # Re-raise authentication errors
            logger.error(f"[{operation_id}] Authentication error: {str(e)}")
            raise
            
        except requests.exceptions.HTTPError as http_err:
            if http_err.response.status_code == 404:
                error_msg = f"File '{blob_name}' not found in SharePoint document library '{container_name}'"
                logger.warning(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err, error_code="BLOB_NOT_FOUND")
            else:
                error_msg = f"HTTP error downloading file '{blob_name}' from SharePoint document library '{container_name}': {str(http_err)}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err)
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error downloading file '{blob_name}' from SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Failed to download file '{blob_name}' from SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2)
    def delete_blob(self, container_name: str, blob_name: str) -> Dict[str, Any]:
        """Delete a file from a SharePoint document library
        
        Args:
            container_name (str): Name of the document library
            blob_name (str): Name of the file to delete
            
        Returns:
            Dict[str, Any]: Operation result with status and details
            
        Raises:
            ConnectionError: If connection to SharePoint fails
            AuthenticationError: If authentication or token acquisition fails
            StorageError: If SharePoint operation fails
            ValueError: If parameters are invalid
        """
        if not container_name or not isinstance(container_name, str):
            raise ValueError("Container name must be a non-empty string")
            
        if not blob_name or not isinstance(blob_name, str):
            raise ValueError("Blob name must be a non-empty string")
            
        start_time = time.time()
        operation_id = f"delete_blob_{int(start_time * 1000)}"
        logger.info(f"[{operation_id}] Deleting file '{blob_name}' from SharePoint document library '{container_name}'")
        
        try:
            # Ensure connected
            if not self.site_info:
                logger.debug(f"[{operation_id}] Connection not established, connecting first")
                success = self.connect()
                if not success:
                    error_msg = "Failed to connect to SharePoint Online"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise ConnectionError(error_msg)
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                error_msg = "Failed to acquire access token for Microsoft Graph API"
                logger.error(f"[{operation_id}] {error_msg}")
                raise AuthenticationError(error_msg)
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                error_msg = f"SharePoint document library '{container_name}' not found"
                logger.warning(f"[{operation_id}] {error_msg}")
                
                # Not finding the container is not an error when deleting
                duration_ms = int((time.time() - start_time) * 1000)
                return {
                    'status': 'success',
                    'message': f"Document library '{container_name}' not found (nothing to delete)",
                    'blob_name': blob_name,
                    'container_name': container_name,
                    'operation_duration_ms': duration_ms,
                    'container_not_found': True
                }
            
            # Get drive ID
            drive_id = self._get_drive_id(library_id, token)
            if not drive_id:
                error_msg = "Failed to get drive ID for document library"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="DRIVE_NOT_FOUND")
            
            # Delete file
            url = f"https://graph.microsoft.com/{self.api_version}/drives/{drive_id}/root:/{blob_name}"
            headers = {
                'Authorization': f'Bearer {token}'
            }
            
            logger.debug(f"[{operation_id}] Sending request to delete file to {url}")
            response = requests.delete(url, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            
            duration_ms = int((time.time() - start_time) * 1000)
            logger.info(f"[{operation_id}] Deleted file '{blob_name}' from SharePoint document library '{container_name}' in {duration_ms}ms")
            
            return {
                'status': 'success',
                'message': f"File '{blob_name}' deleted successfully",
                'blob_name': blob_name,
                'container_name': container_name,
                'operation_duration_ms': duration_ms
            }
            
        except AuthenticationError as e:
            # Re-raise authentication errors
            logger.error(f"[{operation_id}] Authentication error: {str(e)}")
            raise
            
        except requests.exceptions.HTTPError as http_err:
            if http_err.response.status_code == 404:
                # Not finding the file is not an error when deleting
                duration_ms = int((time.time() - start_time) * 1000)
                logger.warning(f"[{operation_id}] File '{blob_name}' not found in SharePoint document library '{container_name}'")
                
                return {
                    'status': 'success',
                    'message': f"File '{blob_name}' not found (nothing to delete)",
                    'blob_name': blob_name,
                    'container_name': container_name,
                    'operation_duration_ms': duration_ms,
                    'blob_not_found': True
                }
            else:
                error_msg = f"HTTP error deleting file '{blob_name}' from SharePoint document library '{container_name}': {str(http_err)}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err)
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error deleting file '{blob_name}' from SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Failed to delete file '{blob_name}' from SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2)
    def get_blob_properties(self, container_name: str, blob_name: str) -> Dict[str, Any]:
        """Get properties of a file in a SharePoint document library
        
        Args:
            container_name (str): Name of the document library
            blob_name (str): Name of the file to get properties for
            
        Returns:
            Dict[str, Any]: File properties including name, size, timestamps, etc.
            
        Raises:
            ConnectionError: If connection to SharePoint fails
            AuthenticationError: If authentication or token acquisition fails
            StorageError: If SharePoint operation fails or file not found
            ValueError: If parameters are invalid
        """
        if not container_name or not isinstance(container_name, str):
            raise ValueError("Container name must be a non-empty string")
            
        if not blob_name or not isinstance(blob_name, str):
            raise ValueError("Blob name must be a non-empty string")
            
        start_time = time.time()
        operation_id = f"get_blob_properties_{int(start_time * 1000)}"
        logger.info(f"[{operation_id}] Getting properties for file '{blob_name}' in SharePoint document library '{container_name}'")
        
        try:
            # Ensure connected
            if not self.site_info:
                logger.debug(f"[{operation_id}] Connection not established, connecting first")
                success = self.connect()
                if not success:
                    error_msg = "Failed to connect to SharePoint Online"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise ConnectionError(error_msg)
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                error_msg = "Failed to acquire access token for Microsoft Graph API"
                logger.error(f"[{operation_id}] {error_msg}")
                raise AuthenticationError(error_msg)
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                error_msg = f"SharePoint document library '{container_name}' not found"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="CONTAINER_NOT_FOUND")
            
            # Get drive ID
            drive_id = self._get_drive_id(library_id, token)
            if not drive_id:
                error_msg = "Failed to get drive ID for document library"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="DRIVE_NOT_FOUND")
            
            # Get file properties
            url = f"https://graph.microsoft.com/{self.api_version}/drives/{drive_id}/root:/{blob_name}"
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            
            logger.debug(f"[{operation_id}] Requesting file properties from {url}")
            response = requests.get(url, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            
            file_info = response.json()
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Extract standard properties and any additional metadata
            result = {
                'name': file_info.get('name'),
                'id': file_info.get('id'),
                'size': file_info.get('size'),
                'last_modified': file_info.get('lastModifiedDateTime'),
                'created_at': file_info.get('createdDateTime'),
                'web_url': file_info.get('webUrl'),
                'content_type': file_info.get('file', {}).get('mimeType'),
                'etag': file_info.get('eTag'),
                'operation_duration_ms': duration_ms
            }
            
            # Add any custom file system info as metadata
            file_system_info = file_info.get('fileSystemInfo', {})
            if file_system_info:
                result['metadata'] = file_system_info
                
            logger.info(f"[{operation_id}] Retrieved properties for file '{blob_name}' from SharePoint in {duration_ms}ms")
            return result
            
        except AuthenticationError as e:
            # Re-raise authentication errors
            logger.error(f"[{operation_id}] Authentication error: {str(e)}")
            raise
            
        except requests.exceptions.HTTPError as http_err:
            if http_err.response.status_code == 404:
                error_msg = f"File '{blob_name}' not found in SharePoint document library '{container_name}'"
                logger.warning(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err, error_code="BLOB_NOT_FOUND")
            else:
                error_msg = f"HTTP error getting properties for file '{blob_name}' in SharePoint document library '{container_name}': {str(http_err)}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, original_error=http_err)
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error getting properties for file '{blob_name}' in SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Failed to get properties for file '{blob_name}' in SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2)
    def get_blob_url(self, container_name: str, blob_name: str, expiry_hours: int = 1) -> Dict[str, Any]:
        """Get a URL for accessing a file in a SharePoint document library
        
        Args:
            container_name (str): Name of the document library
            blob_name (str): Name of the file to get URL for
            expiry_hours (int): Number of hours until the URL expires
            
        Returns:
            Dict[str, Any]: Operation result with status, URL and details
            
        Raises:
            ConnectionError: If connection to SharePoint fails
            AuthenticationError: If authentication or token acquisition fails
            StorageError: If SharePoint operation fails or file not found
            ValueError: If parameters are invalid
        """
        if not container_name or not isinstance(container_name, str):
            raise ValueError("Container name must be a non-empty string")
            
        if not blob_name or not isinstance(blob_name, str):
            raise ValueError("Blob name must be a non-empty string")
            
        if not isinstance(expiry_hours, int) or expiry_hours <= 0:
            raise ValueError("Expiry hours must be a positive integer")
            
        start_time = time.time()
        operation_id = f"get_blob_url_{int(start_time * 1000)}"
        logger.info(f"[{operation_id}] Getting URL for file '{blob_name}' in SharePoint document library '{container_name}' with {expiry_hours} hour expiry")
        
        try:
            # Ensure connected
            if not self.site_info:
                logger.debug(f"[{operation_id}] Connection not established, connecting first")
                success = self.connect()
                if not success:
                    error_msg = "Failed to connect to SharePoint Online"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise ConnectionError(error_msg)
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                error_msg = "Failed to acquire access token for Microsoft Graph API"
                logger.error(f"[{operation_id}] {error_msg}")
                raise AuthenticationError(error_msg)
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                error_msg = f"SharePoint document library '{container_name}' not found"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="CONTAINER_NOT_FOUND")
            
            # Get drive ID
            drive_id = self._get_drive_id(library_id, token)
            if not drive_id:
                error_msg = "Failed to get drive ID for document library"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="DRIVE_NOT_FOUND")
            
            # Get file ID
            try:
                file_info = self.get_blob_properties(container_name, blob_name)
                file_id = file_info.get('id')
            except StorageError as e:
                # Re-raise with appropriate message
                if getattr(e, 'error_code', None) == "BLOB_NOT_FOUND":
                    error_msg = f"File '{blob_name}' not found in SharePoint document library '{container_name}'"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise StorageError(error_msg, original_error=e, error_code="BLOB_NOT_FOUND")
                raise
            
            if not file_id:
                error_msg = f"Failed to get file ID for '{blob_name}'"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="BLOB_NOT_FOUND")
            
            # Create sharing link
            url = f"https://graph.microsoft.com/{self.api_version}/drives/{drive_id}/items/{file_id}/createLink"
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Calculate expiration date/time in ISO 8601 format
            expiry_time = datetime.now(timezone.utc) + timedelta(hours=expiry_hours)
            expiry_iso = expiry_time.isoformat().replace('+00:00', 'Z')
            
            payload = {
                "type": "view",
                "scope": "anonymous",
                "expirationDateTime": expiry_iso
            }
            
            logger.debug(f"[{operation_id}] Creating sharing link with expiry at {expiry_iso}")
            response = requests.post(url, headers=headers, json=payload, timeout=self.timeout)
            response.raise_for_status()
            
            link_info = response.json()
            shared_url = link_info.get('link', {}).get('webUrl', '')
            
            if not shared_url:
                error_msg = "Failed to get shared URL from SharePoint response"
                logger.error(f"[{operation_id}] {error_msg}")
                raise StorageError(error_msg, error_code="URL_GENERATION_FAILED")
            
            duration_ms = int((time.time() - start_time) * 1000)
            logger.info(f"[{operation_id}] Generated URL for file '{blob_name}' in {duration_ms}ms, valid until {expiry_iso}")
            
            return {
                'status': 'success',
                'message': f"URL generated successfully, valid for {expiry_hours} hours",
                'url': shared_url,
                'blob_name': blob_name,
                'container_name': container_name,
                'expiry_time': expiry_iso,
                'operation_duration_ms': duration_ms
            }
            
        except AuthenticationError as e:
            # Re-raise authentication errors
            logger.error(f"[{operation_id}] Authentication error: {str(e)}")
            raise
            
        except StorageError:
            # Re-raise storage errors (already logged)
            raise
            
        except requests.exceptions.HTTPError as http_err:
            error_msg = f"HTTP error generating URL for file '{blob_name}' in SharePoint document library '{container_name}': {str(http_err)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=http_err)
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error generating URL for file '{blob_name}' in SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Failed to generate URL for file '{blob_name}' in SharePoint document library '{container_name}': {str(e)}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise StorageError(error_msg, original_error=e)
    
    #
    # Helper methods
    #
    
    @retry_with_backoff()
    def _get_access_token(self, resource: str) -> Optional[str]:
        """
        Get access token for the specified resource
        
        This method handles token acquisition and caching for both app-based and
        user-based authentication methods. It includes token caching with expiration
        and automatic refresh when tokens are about to expire.
        
        Args:
            resource (str): Resource URL to get access for
            
        Returns:
            Optional[str]: Access token if successful, None if failed
            
        Raises:
            AuthenticationError: If token acquisition fails
        """
        # Check if we have a valid cached token
        now = datetime.now(timezone.utc)
        now_timestamp = now.timestamp()
        
        cached_token = self.token_cache.get(resource)
        if cached_token and cached_token.get('expiry', 0) > now_timestamp:
            logger.debug(f"Using cached token for {resource} (expires in {int(cached_token['expiry'] - now_timestamp)} seconds)")
            
            # Store the current access token and expiry
            self.access_token = cached_token.get('token')
            self.token_expiry = datetime.fromtimestamp(cached_token.get('expiry'), tz=timezone.utc)
            
            return cached_token.get('token')
        
        logger.debug(f"Acquiring new access token for {resource}")
        
        try:
            # Use the existing client if available
            if not self.client:
                logger.debug("Initializing MSAL client for token acquisition")
                if self.auth_type == 'app':
                    # App authentication (client credentials)
                    self.client = msal.ConfidentialClientApplication(
                        client_id=self.client_id,
                        client_credential=self.client_secret,
                        authority=self.authority
                    )
                else:
                    # User authentication
                    self.client = msal.PublicClientApplication(
                        client_id=self.client_id,
                        authority=self.authority
                    )
            
            # Get token based on authentication type
            if self.auth_type == 'app':
                # App authentication (client credentials)
                logger.debug(f"Acquiring token for client credentials flow: {resource}")
                result = self.client.acquire_token_for_client(scopes=[resource])
            else:
                # User authentication (username/password)
                logger.debug(f"Acquiring token for username/password flow: {resource}")
                result = self.client.acquire_token_by_username_password(
                    username=self.username,
                    password=self.password,
                    scopes=[resource]
                )
            
            # Check for errors in the result
            if 'access_token' not in result:
                error_type = result.get('error', 'Unknown error')
                error_message = result.get('error_description', 'No error description')
                logger.error(f"Failed to acquire token: {error_type} - {error_message}")
                
                # Update connection status
                self.connection_status["connection_errors"].append({
                    "timestamp": now.isoformat(),
                    "error": f"{error_type}: {error_message}",
                    "error_type": "TokenAcquisitionError",
                    "resource": resource
                })
                
                raise AuthenticationError(f"Failed to acquire token: {error_message}")
            
            # Cache token with expiry (with 5 minutes buffer)
            token = result['access_token']
            expiry = now_timestamp + result.get('expires_in', 3600) - 300  # 5 minutes buffer
            expiry_datetime = datetime.fromtimestamp(expiry, tz=timezone.utc)
            
            self.token_cache[resource] = {
                'token': token,
                'expiry': expiry,
                'expiry_datetime': expiry_datetime.isoformat(),
                'scope': resource,
                'acquired_at': now.isoformat()
            }
            
            # Store the current access token and expiry
            self.access_token = token
            self.token_expiry = expiry_datetime
            
            logger.debug(f"Successfully acquired token for {resource} (expires at {expiry_datetime.isoformat()})")
            return token
            
        except Exception as e:
            error_msg = f"Error getting access token for {resource}: {str(e)}"
            logger.error(error_msg)
            
            # Update connection status
            self.connection_status["connection_errors"].append({
                "timestamp": now.isoformat(),
                "error": str(e),
                "error_type": type(e).__name__,
                "resource": resource
            })
            
            raise AuthenticationError(error_msg, original_error=e)
    
    def _get_site_info(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Get SharePoint site information
        
        Args:
            token: Access token for Microsoft Graph API
            
        Returns:
            Dict[str, Any]: Site information or None if failed
        """
        try:
            # Get site information
            url = f"https://graph.microsoft.com/{self.api_version}/sites/{self.site_domain}:/sites/{self.site_name}"
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error getting site information: {str(e)}")
            return None
    
    def _get_library_id(self, library_name: str, token: str) -> Optional[str]:
        """
        Get document library ID by name
        
        Args:
            library_name: Document library name
            token: Access token for Microsoft Graph API
            
        Returns:
            str: Library ID or None if not found
        """
        try:
            # Get document libraries
            url = f"https://graph.microsoft.com/{self.api_version}/sites/{self.site_domain},sites,{self.site_name}/lists"
            params = {
                "$filter": f"displayName eq '{library_name}'"
            }
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            libraries = data.get('value', [])
            
            if not libraries:
                return None
            
            return libraries[0].get('id')
            
        except Exception as e:
            logger.error(f"Error getting library ID: {str(e)}")
            return None
    
    def _get_drive_id(self, library_id: str, token: str) -> Optional[str]:
        """
        Get drive ID for a document library
        
        Args:
            library_id: Document library ID
            token: Access token for Microsoft Graph API
            
        Returns:
            str: Drive ID or None if not found
        """
        try:
            # Get drive information
            url = f"https://graph.microsoft.com/{self.api_version}/sites/{self.site_domain},sites,{self.site_name}/lists/{library_id}/drive"
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            return data.get('id')
            
        except Exception as e:
            logger.error(f"Error getting drive ID: {str(e)}")
            return None