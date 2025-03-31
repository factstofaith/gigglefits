"""
SharePoint Document Library Connector Implementation

This module implements the StorageConnector interface for SharePoint Online
document libraries to provide a consistent storage interface.
"""

import os
import io
import logging
import json
import base64
import mimetypes
from typing import Dict, Any, Optional, List, Union, BinaryIO
from datetime import datetime, timedelta
import urllib.parse

import requests
import msal

from .storage_connector import StorageConnector

logger = logging.getLogger(__name__)


class SharePointConnector(StorageConnector):
    """SharePoint document library connector implementation"""
    
    def __init__(self, 
                 site_url: str,
                 client_id: str,
                 tenant_id: str,
                 username: Optional[str] = None,
                 password: Optional[str] = None,
                 client_secret: Optional[str] = None,
                 auth_type: str = 'app',  # 'app' or 'user'
                 default_library: Optional[str] = 'Documents'):
        """
        Initialize the SharePoint connector
        
        Args:
            site_url: SharePoint site URL (e.g., https://contoso.sharepoint.com/sites/sitename)
            client_id: Azure AD application client ID
            tenant_id: Azure AD tenant ID
            username: User principal name for user credentials auth
            password: User password for user credentials auth
            client_secret: Client secret for application authentication
            auth_type: Authentication type ('app' or 'user')
            default_library: Default document library name
        """
        self.site_url = site_url.rstrip('/')
        self.client_id = client_id
        self.tenant_id = tenant_id
        self.username = username
        self.password = password
        self.client_secret = client_secret
        self.auth_type = auth_type
        self.default_library = default_library
        
        self.authority = f"https://login.microsoftonline.com/{tenant_id}"
        self.graph_resource = 'https://graph.microsoft.com/.default'
        self.sharepoint_resource = f"{self.site_url}/.default"
        self.api_version = 'v1.0'
        
        self.token_cache = {}  # {resource: {token, expiry}}
        self.site_info = None
        self.site_domain = None
        self.site_name = None
        self.web_id = None
        
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
        """Establish a connection to SharePoint Online"""
        try:
            # Get token for Microsoft Graph API
            graph_token = self._get_access_token(self.graph_resource)
            if not graph_token:
                logger.error("Failed to acquire access token for Microsoft Graph API")
                return False
            
            # Get site information
            site_info = self._get_site_info(graph_token)
            if not site_info:
                logger.error("Failed to retrieve SharePoint site information")
                return False
            
            self.site_info = site_info
            self.web_id = site_info.get('id')
            
            # Get token for SharePoint API
            sharepoint_token = self._get_access_token(self.sharepoint_resource)
            if not sharepoint_token:
                logger.error("Failed to acquire access token for SharePoint API")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to SharePoint: {str(e)}")
            return False
    
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
    
    def list_containers(self) -> List[Dict[str, Any]]:
        """List available document libraries in SharePoint site"""
        try:
            # Ensure connected
            if not self.site_info:
                success = self.connect()
                if not success:
                    return []
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                return []
            
            # Get document libraries
            url = f"https://graph.microsoft.com/{self.api_version}/sites/{self.site_domain},sites,{self.site_name}/lists"
            params = {
                "$filter": "displayName ne 'Site Pages' and displayName ne 'Form Templates'"
            }
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            
            response = requests.get(url, params=params, headers=headers)
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
            
            return libraries
            
        except Exception as e:
            logger.error(f"Failed to list SharePoint document libraries: {str(e)}")
            return []
    
    def create_container(self, container_name: str) -> bool:
        """Create a new document library in SharePoint site"""
        try:
            # Ensure connected
            if not self.site_info:
                success = self.connect()
                if not success:
                    return False
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                return False
            
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
            
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            return True
            
        except requests.exceptions.HTTPError as http_err:
            # Check if error is due to library already existing
            if http_err.response.status_code == 409:
                logger.warning(f"SharePoint document library '{container_name}' already exists")
                return True
            else:
                logger.error(f"Failed to create SharePoint document library '{container_name}': {str(http_err)}")
                return False
        except Exception as e:
            logger.error(f"Failed to create SharePoint document library '{container_name}': {str(e)}")
            return False
    
    def delete_container(self, container_name: str) -> bool:
        """Delete a document library from SharePoint site"""
        try:
            # Ensure connected
            if not self.site_info:
                success = self.connect()
                if not success:
                    return False
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                return False
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                logger.warning(f"SharePoint document library '{container_name}' not found")
                return True
            
            # Delete document library
            url = f"https://graph.microsoft.com/{self.api_version}/sites/{self.site_domain},sites,{self.site_name}/lists/{library_id}"
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            
            response = requests.delete(url, headers=headers)
            response.raise_for_status()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete SharePoint document library '{container_name}': {str(e)}")
            return False
    
    def list_blobs(self, container_name: str, prefix: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """List files in a SharePoint document library"""
        try:
            # Ensure connected
            if not self.site_info:
                success = self.connect()
                if not success:
                    return []
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                return []
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                logger.warning(f"SharePoint document library '{container_name}' not found")
                return []
            
            # Get files in the document library
            url = f"https://graph.microsoft.com/{self.api_version}/sites/{self.site_domain},sites,{self.site_name}/lists/{library_id}/items"
            params = {
                "$expand": "fields,driveItem",
                "$top": limit if limit else 100
            }
            
            # Add filter for prefix if provided
            if prefix:
                params["$filter"] = f"startswith(fields/LinkFilename, '{prefix}')"
            
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            blobs = []
            
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
            
            return blobs
            
        except Exception as e:
            logger.error(f"Failed to list files in SharePoint document library '{container_name}': {str(e)}")
            return []
    
    def upload_blob(self, container_name: str, blob_name: str, data: Union[bytes, BinaryIO, str], content_type: Optional[str] = None) -> Dict[str, Any]:
        """Upload a file to a SharePoint document library"""
        try:
            # Ensure connected
            if not self.site_info:
                success = self.connect()
                if not success:
                    return {'status': 'error', 'message': 'Failed to connect to SharePoint Online'}
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                return {'status': 'error', 'message': 'Failed to acquire access token'}
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                return {'status': 'error', 'message': f"Document library '{container_name}' not found"}
            
            # Get drive ID
            drive_id = self._get_drive_id(library_id, token)
            if not drive_id:
                return {'status': 'error', 'message': 'Failed to get drive ID for document library'}
            
            # Prepare data
            if isinstance(data, str):
                data = data.encode('utf-8')
            
            # Determine content type if not provided
            if not content_type and isinstance(blob_name, str):
                content_type, _ = mimetypes.guess_type(blob_name)
            
            # Default content type
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Upload file
            url = f"https://graph.microsoft.com/{self.api_version}/drives/{drive_id}/root:/{blob_name}:/content"
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': content_type
            }
            
            if hasattr(data, 'read'):  # File-like object
                response = requests.put(url, headers=headers, data=data)
            else:  # Bytes
                response = requests.put(url, headers=headers, data=data)
            
            response.raise_for_status()
            file_info = response.json()
            
            return {
                'status': 'success',
                'message': 'File uploaded successfully',
                'id': file_info.get('id'),
                'name': file_info.get('name'),
                'size': file_info.get('size'),
                'last_modified': file_info.get('lastModifiedDateTime')
            }
            
        except Exception as e:
            logger.error(f"Failed to upload file '{blob_name}' to SharePoint document library '{container_name}': {str(e)}")
            return {
                'status': 'error',
                'message': f'Upload failed: {str(e)}'
            }
    
    def download_blob(self, container_name: str, blob_name: str) -> Union[bytes, None]:
        """Download a file from a SharePoint document library"""
        try:
            # Ensure connected
            if not self.site_info:
                success = self.connect()
                if not success:
                    return None
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                return None
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                logger.warning(f"SharePoint document library '{container_name}' not found")
                return None
            
            # Get drive ID
            drive_id = self._get_drive_id(library_id, token)
            if not drive_id:
                logger.error('Failed to get drive ID for document library')
                return None
            
            # Get file
            url = f"https://graph.microsoft.com/{self.api_version}/drives/{drive_id}/root:/{blob_name}:/content"
            headers = {
                'Authorization': f'Bearer {token}'
            }
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            return response.content
            
        except requests.exceptions.HTTPError as http_err:
            if http_err.response.status_code == 404:
                logger.warning(f"File '{blob_name}' not found in SharePoint document library '{container_name}'")
            else:
                logger.error(f"Failed to download file '{blob_name}' from SharePoint document library '{container_name}': {str(http_err)}")
            return None
        except Exception as e:
            logger.error(f"Failed to download file '{blob_name}' from SharePoint document library '{container_name}': {str(e)}")
            return None
    
    def delete_blob(self, container_name: str, blob_name: str) -> bool:
        """Delete a file from a SharePoint document library"""
        try:
            # Ensure connected
            if not self.site_info:
                success = self.connect()
                if not success:
                    return False
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                return False
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                logger.warning(f"SharePoint document library '{container_name}' not found")
                return True
            
            # Get drive ID
            drive_id = self._get_drive_id(library_id, token)
            if not drive_id:
                logger.error('Failed to get drive ID for document library')
                return False
            
            # Delete file
            url = f"https://graph.microsoft.com/{self.api_version}/drives/{drive_id}/root:/{blob_name}"
            headers = {
                'Authorization': f'Bearer {token}'
            }
            
            response = requests.delete(url, headers=headers)
            response.raise_for_status()
            
            return True
            
        except requests.exceptions.HTTPError as http_err:
            if http_err.response.status_code == 404:
                logger.warning(f"File '{blob_name}' not found in SharePoint document library '{container_name}'")
                return True
            else:
                logger.error(f"Failed to delete file '{blob_name}' from SharePoint document library '{container_name}': {str(http_err)}")
                return False
        except Exception as e:
            logger.error(f"Failed to delete file '{blob_name}' from SharePoint document library '{container_name}': {str(e)}")
            return False
    
    def get_blob_properties(self, container_name: str, blob_name: str) -> Dict[str, Any]:
        """Get properties of a file in a SharePoint document library"""
        try:
            # Ensure connected
            if not self.site_info:
                success = self.connect()
                if not success:
                    return {}
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                return {}
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                logger.warning(f"SharePoint document library '{container_name}' not found")
                return {}
            
            # Get drive ID
            drive_id = self._get_drive_id(library_id, token)
            if not drive_id:
                logger.error('Failed to get drive ID for document library')
                return {}
            
            # Get file properties
            url = f"https://graph.microsoft.com/{self.api_version}/drives/{drive_id}/root:/{blob_name}"
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            file_info = response.json()
            
            return {
                'name': file_info.get('name'),
                'id': file_info.get('id'),
                'size': file_info.get('size'),
                'last_modified': file_info.get('lastModifiedDateTime'),
                'created_at': file_info.get('createdDateTime'),
                'web_url': file_info.get('webUrl'),
                'content_type': file_info.get('file', {}).get('mimeType'),
                'etag': file_info.get('eTag')
            }
            
        except requests.exceptions.HTTPError as http_err:
            if http_err.response.status_code == 404:
                logger.warning(f"File '{blob_name}' not found in SharePoint document library '{container_name}'")
            else:
                logger.error(f"Failed to get properties for file '{blob_name}' in SharePoint document library '{container_name}': {str(http_err)}")
            return {}
        except Exception as e:
            logger.error(f"Failed to get properties for file '{blob_name}' in SharePoint document library '{container_name}': {str(e)}")
            return {}
    
    def get_blob_url(self, container_name: str, blob_name: str, expiry_hours: int = 1) -> str:
        """Get a URL for accessing a file in a SharePoint document library"""
        try:
            # Ensure connected
            if not self.site_info:
                success = self.connect()
                if not success:
                    return ''
            
            # Get token
            token = self._get_access_token(self.graph_resource)
            if not token:
                return ''
            
            # Get library ID
            library_id = self._get_library_id(container_name, token)
            if not library_id:
                logger.warning(f"SharePoint document library '{container_name}' not found")
                return ''
            
            # Get drive ID
            drive_id = self._get_drive_id(library_id, token)
            if not drive_id:
                logger.error('Failed to get drive ID for document library')
                return ''
            
            # Get file ID
            file_info = self.get_blob_properties(container_name, blob_name)
            if not file_info or not file_info.get('id'):
                logger.warning(f"File '{blob_name}' not found in SharePoint document library '{container_name}'")
                return ''
            
            file_id = file_info.get('id')
            
            # Create sharing link
            url = f"https://graph.microsoft.com/{self.api_version}/drives/{drive_id}/items/{file_id}/createLink"
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            payload = {
                "type": "view",
                "scope": "anonymous",
                "expirationDateTime": (datetime.utcnow() + timedelta(hours=expiry_hours)).isoformat() + 'Z'
            }
            
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            link_info = response.json()
            return link_info.get('link', {}).get('webUrl', '')
            
        except Exception as e:
            logger.error(f"Failed to get URL for file '{blob_name}' in SharePoint document library '{container_name}': {str(e)}")
            return ''
    
    #
    # Helper methods
    #
    
    def _get_access_token(self, resource: str) -> Optional[str]:
        """
        Get access token for the specified resource
        
        Args:
            resource: Resource URL to get access for
            
        Returns:
            str: Access token or None if failed
        """
        # Check if we have a valid cached token
        cached_token = self.token_cache.get(resource)
        if cached_token and cached_token.get('expiry', 0) > datetime.now().timestamp():
            return cached_token.get('token')
        
        try:
            # Create MSAL app
            app = msal.ConfidentialClientApplication(
                self.client_id,
                authority=self.authority,
                client_credential=self.client_secret if self.auth_type == 'app' else None
            )
            
            # Get token
            if self.auth_type == 'app':
                # App authentication (client credentials)
                result = app.acquire_token_for_client(scopes=[resource])
            else:
                # User authentication (username/password)
                result = app.acquire_token_by_username_password(
                    username=self.username,
                    password=self.password,
                    scopes=[resource]
                )
            
            if 'access_token' not in result:
                error_message = result.get('error_description', result.get('error', 'Unknown error'))
                logger.error(f"Failed to acquire token: {error_message}")
                return None
            
            # Cache token with expiry
            token = result['access_token']
            expiry = datetime.now().timestamp() + result.get('expires_in', 3600) - 300  # 5 minutes buffer
            
            self.token_cache[resource] = {
                'token': token,
                'expiry': expiry
            }
            
            return token
            
        except Exception as e:
            logger.error(f"Error getting access token: {str(e)}")
            return None
    
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