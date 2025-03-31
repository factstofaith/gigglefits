"""
SharePoint connector mock implementation for testing.

This module provides a mock SharePoint connector for testing without SharePoint/Microsoft dependencies.
"""

from typing import Dict, List, Any, Optional, Union, BinaryIO
import logging
import uuid
from datetime import datetime, timezone, timedelta
import re

from .storage_test_framework import BaseStorageAdapter, MockStorageProvider
from .entity_registry import BaseTestAdapter

# Set up logging
logger = logging.getLogger("sharepoint_connector")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)


class SharePointConnector(BaseStorageAdapter):
    """
    Mock SharePoint connector for testing.
    
    This class provides a mock implementation of the SharePoint connector for testing
    without requiring actual SharePoint or Microsoft dependencies.
    """
    
    def __init__(self, registry=None,
                 site_url: Optional[str] = None,
                 username: Optional[str] = None,
                 password: Optional[str] = None,
                 client_id: Optional[str] = None,
                 client_secret: Optional[str] = None,
                 tenant_id: Optional[str] = None,
                 use_app_only: bool = False):
        """
        Initialize the SharePoint connector.
        
        Args:
            registry: Entity registry to use
            site_url: SharePoint site URL
            username: SharePoint username
            password: SharePoint password
            client_id: Azure AD client ID for app-only authentication
            client_secret: Azure AD client secret for app-only authentication
            tenant_id: Azure AD tenant ID for app-only authentication
            use_app_only: Whether to use app-only authentication
        """
        super().__init__(registry, MockStorageProvider(provider_type="sharepoint"))
        
        # Store connection parameters
        self.site_url = site_url or "https://contoso.sharepoint.com/sites/testsite"
        self.username = username or "test.user@contoso.onmicrosoft.com"
        self.password = password or "mock_password"
        self.client_id = client_id or "mock_client_id"
        self.client_secret = client_secret or "mock_client_secret"
        self.tenant_id = tenant_id or "mock_tenant_id"
        self.use_app_only = use_app_only
        
        self.is_connected = False
        self.error_mode = False
        self.error_type = None
        
        # Initialize metadata for libraries (document libraries in SharePoint)
        self.libraries_metadata = {}
        
        logger.info("SharePointConnector initialized")
    
    def connect(self) -> bool:
        """
        Establish a mock connection to SharePoint.
        
        Returns:
            bool: True if connection is successful, False otherwise
        """
        if self.error_mode and self.error_type == "connection":
            logger.error("Mock SharePoint connection error (simulation)")
            self.is_connected = False
            return False
        
        self.is_connected = True
        logger.debug(f"Connected to mock SharePoint site: {self.site_url}")
        return True
    
    def disconnect(self) -> None:
        """
        Close the mock connection to SharePoint.
        """
        self.is_connected = False
        logger.debug("Disconnected from mock SharePoint")
    
    def test_connection(self) -> Dict[str, Any]:
        """
        Test the mock connection to SharePoint.
        
        Returns:
            Dict[str, Any]: Connection test result
        """
        if self.error_mode and self.error_type == "connection":
            return {
                'success': False,
                'message': 'Failed to connect to SharePoint site',
                'error': 'Connection error (simulated)'
            }
        
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'message': 'Failed to connect to SharePoint site',
                    'error': 'Connection error'
                }
        
        # Get document libraries
        libraries_result = self.list_containers()
        libraries = libraries_result.get('libraries', [])
        library_names = [lib['name'] for lib in libraries]
        
        return {
            'success': True,
            'message': f'Connection successful. Found {len(libraries)} document libraries: {", ".join(library_names)}',
            'site_url': self.site_url,
            'libraries': len(libraries)
        }
    
    def create_container(self, container_name: str) -> Dict[str, Any]:
        """
        Create a new document library in mock SharePoint.
        
        Args:
            container_name: Name of the document library to create
            
        Returns:
            Dict[str, Any]: Result dictionary with success status
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "create_container":
            logger.error(f"Mock create_container error for '{container_name}' (simulation)")
            return {
                'success': False,
                'error': 'Failed to create document library (simulated error)'
            }
        
        # Validate library name (SharePoint has restrictions)
        if not self._is_valid_library_name(container_name):
            return {
                'success': False,
                'error': 'Invalid document library name. Names must not contain special characters like /, \\, :, *, ?, ", <, >, |'
            }
        
        # Create library in mock storage
        result = self.provider.create_container(container_name)
        
        if result['success']:
            # Store library metadata
            now = datetime.now(timezone.utc)
            self.libraries_metadata[container_name] = {
                'name': container_name,
                'created': now,
                'modified': now,
                'item_count': 0,
                'relative_url': f'/sites/testsite/Shared Documents/{container_name}',
                'template_type': 101  # Document library template type
            }
            
            return {
                'success': True,
                'name': container_name,
                'relative_url': f'/sites/testsite/Shared Documents/{container_name}',
                'created': now.isoformat(),
                'template_type': 101
            }
        
        return result
    
    def delete_container(self, container_name: str) -> Dict[str, Any]:
        """
        Delete a document library from mock SharePoint.
        
        Args:
            container_name: Name of the document library to delete
            
        Returns:
            Dict[str, Any]: Result dictionary with success status
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "delete_container":
            logger.error(f"Mock delete_container error for '{container_name}' (simulation)")
            return {
                'success': False,
                'error': 'Failed to delete document library (simulated error)'
            }
        
        # Check if library exists
        exists = container_name in self.provider.containers
        
        if not exists:
            # SharePoint returns success even for non-existent libraries
            return {
                'success': True,
                'message': f'Document library {container_name} deleted successfully (did not exist)'
            }
            
        # Delete library from mock storage
        result = self.provider.delete_container(container_name)
        
        if result['success']:
            # Remove library metadata
            if container_name in self.libraries_metadata:
                del self.libraries_metadata[container_name]
            
            return {
                'success': True,
                'message': f'Document library {container_name} deleted successfully'
            }
        
        return result
    
    def list_containers(self) -> Dict[str, Any]:
        """
        List document libraries in mock SharePoint.
        
        Returns:
            Dict[str, Any]: Result dictionary with library list
        """
        if self.error_mode and self.error_type == "connection":
            logger.error("Mock SharePoint connection error in list_containers (simulation)")
            return {
                'success': False,
                'error': 'Not connected to SharePoint'
            }
            
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "list_containers":
            logger.error("Mock list_containers error (simulation)")
            return {
                'success': False,
                'error': 'Failed to list document libraries (simulated error)'
            }
        
        # Get libraries from mock storage
        result = self.provider.list_containers()
        
        if result['success']:
            # Format library list to match SharePoint
            libraries = []
            for library_name in result['containers']:
                # Get metadata or create default
                metadata = self.libraries_metadata.get(library_name, {
                    'name': library_name,
                    'created': datetime.now(timezone.utc),
                    'modified': datetime.now(timezone.utc),
                    'item_count': 0,
                    'relative_url': f'/sites/testsite/Shared Documents/{library_name}',
                    'template_type': 101  # Document library template type
                })
                
                libraries.append({
                    'name': library_name,
                    'title': library_name,
                    'created': metadata['created'].isoformat(),
                    'modified': metadata['modified'].isoformat(),
                    'item_count': metadata['item_count'],
                    'relative_url': metadata['relative_url'],
                    'template_type': metadata['template_type']
                })
            
            return {
                'success': True,
                'libraries': libraries,
                'count': len(libraries)
            }
        
        return result
    
    def upload_file(self, container_name: str, file_path: str, 
                   content: Union[bytes, BinaryIO],
                   content_type: str = "application/octet-stream",
                   metadata: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Upload a file to a document library in mock SharePoint.
        
        Args:
            container_name: Name of the document library
            file_path: Path to store the file at
            content: File content as bytes or file-like object
            content_type: MIME type of the file
            metadata: Additional file metadata
            
        Returns:
            Dict[str, Any]: Result dictionary with success status
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "upload_file":
            logger.error(f"Mock upload_file error for '{file_path}' (simulation)")
            return {
                'success': False,
                'error': 'Failed to upload file (simulated error)'
            }
        
        # Convert file-like object to bytes if needed
        if hasattr(content, 'read'):
            content = content.read()
        
        # Validate file path (SharePoint has restrictions)
        if not self._is_valid_file_path(file_path):
            return {
                'success': False,
                'error': 'Invalid file path. Path must not contain invalid characters like *, :, ", <, >, |, #, {, }, ~, %'
            }
        
        # Ensure metadata is a dictionary
        metadata = metadata or {}
        
        # Upload file to mock storage
        result = self.provider.upload_file(
            container_name=container_name,
            file_path=file_path,
            content=content,
            content_type=content_type,
            metadata=metadata
        )
        
        if result['success']:
            # Update library item count
            if container_name in self.libraries_metadata:
                self.libraries_metadata[container_name]['item_count'] += 1
                self.libraries_metadata[container_name]['modified'] = datetime.now(timezone.utc)
            
            # Format upload response to match SharePoint
            now = datetime.now(timezone.utc)
            unique_id = str(uuid.uuid4())
            
            return {
                'success': True,
                'name': file_path.split('/')[-1],
                'path': file_path,
                'server_relative_url': f'/sites/testsite/Shared Documents/{container_name}/{file_path}',
                'library': container_name,
                'content_type': content_type,
                'length': len(content),
                'created': now.isoformat(),
                'modified': now.isoformat(),
                'created_by': self.username,
                'modified_by': self.username,
                'unique_id': unique_id,
                'metadata': metadata
            }
        
        return result
    
    def download_file(self, container_name: str, file_path: str) -> Dict[str, Any]:
        """
        Download a file from a document library in mock SharePoint.
        
        Args:
            container_name: Name of the document library
            file_path: Path of the file to download
            
        Returns:
            Dict[str, Any]: Result dictionary with file content and metadata
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "download_file":
            logger.error(f"Mock download_file error for '{file_path}' (simulation)")
            return {
                'success': False,
                'error': 'Failed to download file (simulated error)'
            }
        
        # Download file from mock storage
        result = self.provider.download_file(
            container_name=container_name,
            file_path=file_path
        )
        
        if result['success']:
            # Format download response to match SharePoint
            return {
                'success': True,
                'content': result['content'],
                'name': file_path.split('/')[-1],
                'path': file_path,
                'server_relative_url': f'/sites/testsite/Shared Documents/{container_name}/{file_path}',
                'library': container_name,
                'content_type': result['content_type'],
                'length': result['size'],
                'last_modified': result['last_modified'].isoformat(),
                'metadata': result['metadata']
            }
        
        return result
    
    def delete_file(self, container_name: str, file_path: str) -> Dict[str, Any]:
        """
        Delete a file from a document library in mock SharePoint.
        
        Args:
            container_name: Name of the document library
            file_path: Path of the file to delete
            
        Returns:
            Dict[str, Any]: Result dictionary with success status
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "delete_file":
            logger.error(f"Mock delete_file error for '{file_path}' (simulation)")
            return {
                'success': False,
                'error': 'Failed to delete file (simulated error)'
            }
        
        # Delete file from mock storage
        result = self.provider.delete_file(
            container_name=container_name,
            file_path=file_path
        )
        
        if result['success']:
            # Update library item count
            if container_name in self.libraries_metadata:
                self.libraries_metadata[container_name]['item_count'] = max(0, self.libraries_metadata[container_name]['item_count'] - 1)
                self.libraries_metadata[container_name]['modified'] = datetime.now(timezone.utc)
            
            # Format delete response to match SharePoint
            return {
                'success': True,
                'path': file_path,
                'library': container_name,
                'message': f"File '{file_path}' deleted successfully from '{container_name}'"
            }
        
        return result
    
    def list_files(self, container_name: str, prefix: str = "") -> Dict[str, Any]:
        """
        List files in a document library in mock SharePoint.
        
        Args:
            container_name: Name of the document library
            prefix: Optional folder path to filter files
            
        Returns:
            Dict[str, Any]: Result dictionary with file list
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "list_files":
            logger.error(f"Mock list_files error for '{container_name}' (simulation)")
            return {
                'success': False,
                'error': 'Failed to list files (simulated error)'
            }
        
        # List files from mock storage
        result = self.provider.list_files(
            container_name=container_name,
            prefix=prefix
        )
        
        if result['success']:
            # Format file list to match SharePoint
            files = []
            for file_info in result['files']:
                file_name = file_info['path'].split('/')[-1]
                files.append({
                    'name': file_name,
                    'path': file_info['path'],
                    'server_relative_url': f'/sites/testsite/Shared Documents/{container_name}/{file_info["path"]}',
                    'length': file_info['size'],
                    'type': 'File',
                    'time_created': file_info['last_modified'].isoformat(),
                    'time_last_modified': file_info['last_modified'].isoformat(),
                    'content_type': file_info['content_type'],
                    'metadata': file_info['metadata']
                })
            
            return {
                'success': True,
                'files': files,
                'library': container_name,
                'folder': prefix,
                'count': len(files)
            }
        
        return result
    
    def create_folder(self, container_name: str, folder_path: str) -> Dict[str, Any]:
        """
        Create a folder in a document library in mock SharePoint.
        
        Args:
            container_name: Name of the document library
            folder_path: Path of the folder to create
            
        Returns:
            Dict[str, Any]: Result dictionary with success status
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "create_folder":
            logger.error(f"Mock create_folder error for '{folder_path}' (simulation)")
            return {
                'success': False,
                'error': 'Failed to create folder (simulated error)'
            }
        
        # Validate folder path
        if not self._is_valid_file_path(folder_path):
            return {
                'success': False,
                'error': 'Invalid folder path. Path must not contain invalid characters like *, :, ", <, >, |, #, {, }, ~, %'
            }
        
        # Ensure container exists
        if container_name not in self.provider.containers:
            return {
                'success': False,
                'error': f"Document library '{container_name}' not found"
            }
        
        # Create an empty file as a marker for the folder
        folder_marker = f"{folder_path}/.folder"
        
        # Upload marker file to mock storage
        result = self.provider.upload_file(
            container_name=container_name,
            file_path=folder_marker,
            content=b'',
            content_type='application/folder',
            metadata={'IsFolder': 'true'}
        )
        
        if result['success']:
            # Format create folder response to match SharePoint
            now = datetime.now(timezone.utc)
            
            return {
                'success': True,
                'name': folder_path.split('/')[-1],
                'path': folder_path,
                'server_relative_url': f'/sites/testsite/Shared Documents/{container_name}/{folder_path}',
                'library': container_name,
                'type': 'Folder',
                'created': now.isoformat(),
                'modified': now.isoformat(),
                'created_by': self.username,
                'modified_by': self.username
            }
        
        return {
            'success': False,
            'error': 'Failed to create folder in mock storage'
        }
    
    def get_file_metadata(self, container_name: str, file_path: str) -> Dict[str, Any]:
        """
        Get metadata for a file in mock SharePoint.
        
        Args:
            container_name: Name of the document library
            file_path: Path of the file
            
        Returns:
            Dict[str, Any]: Result dictionary with file metadata
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "get_file_metadata":
            logger.error(f"Mock get_file_metadata error for '{file_path}' (simulation)")
            return {
                'success': False,
                'error': 'Failed to get file metadata (simulated error)'
            }
        
        # Get file metadata from mock storage
        result = self.provider.get_file_metadata(
            container_name=container_name,
            file_path=file_path
        )
        
        if result['success']:
            # Format metadata response to match SharePoint
            file_name = file_path.split('/')[-1]
            
            return {
                'success': True,
                'name': file_name,
                'path': file_path,
                'server_relative_url': f'/sites/testsite/Shared Documents/{container_name}/{file_path}',
                'library': container_name,
                'content_type': result['content_type'],
                'length': result['size'],
                'time_created': result['last_modified'].isoformat(),
                'time_last_modified': result['last_modified'].isoformat(),
                'created_by': self.username,
                'modified_by': self.username,
                'metadata': result['metadata']
            }
        
        return result
    
    def update_file_metadata(self, container_name: str, file_path: str, 
                           metadata: Dict[str, str]) -> Dict[str, Any]:
        """
        Update metadata for a file in mock SharePoint.
        
        Args:
            container_name: Name of the document library
            file_path: Path of the file
            metadata: New metadata dictionary
            
        Returns:
            Dict[str, Any]: Result dictionary with success status
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "update_file_metadata":
            logger.error(f"Mock update_file_metadata error for '{file_path}' (simulation)")
            return {
                'success': False,
                'error': 'Failed to update file metadata (simulated error)'
            }
        
        # Update file metadata in mock storage
        result = self.provider.update_file_metadata(
            container_name=container_name,
            file_path=file_path,
            metadata=metadata
        )
        
        if result['success']:
            # Format update response to match SharePoint
            return {
                'success': True,
                'path': file_path,
                'library': container_name,
                'metadata': metadata,
                'message': 'Metadata updated successfully'
            }
        
        return result
    
    def get_file_versions(self, container_name: str, file_path: str) -> Dict[str, Any]:
        """
        Get version history for a file in mock SharePoint.
        
        Args:
            container_name: Name of the document library
            file_path: Path of the file
            
        Returns:
            Dict[str, Any]: Result dictionary with version history
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "get_file_versions":
            logger.error(f"Mock get_file_versions error for '{file_path}' (simulation)")
            return {
                'success': False,
                'error': 'Failed to get file versions (simulated error)'
            }
        
        # Get file metadata from mock storage
        result = self.provider.get_file_metadata(
            container_name=container_name,
            file_path=file_path
        )
        
        if result['success']:
            # Create mock version history (only one version in mock)
            current_time = datetime.now(timezone.utc)
            
            versions = [{
                'id': 1,
                'version_label': '1.0',
                'created': current_time.isoformat(),
                'created_by': self.username,
                'size': result['size'],
                'is_current_version': True
            }]
            
            return {
                'success': True,
                'path': file_path,
                'library': container_name,
                'versions': versions,
                'count': len(versions)
            }
        
        return result
    
    def copy_file(self, source_container: str, source_path: str,
                 target_container: str, target_path: str) -> Dict[str, Any]:
        """
        Copy a file within SharePoint.
        
        Args:
            source_container: Source document library name
            source_path: Source file path
            target_container: Target document library name
            target_path: Target file path
            
        Returns:
            Dict[str, Any]: Result dictionary with success status
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "copy_file":
            logger.error(f"Mock copy_file error (simulation)")
            return {
                'success': False,
                'error': 'Failed to copy file (simulated error)'
            }
        
        # Validate target path
        if not self._is_valid_file_path(target_path):
            return {
                'success': False,
                'error': 'Invalid target path. Path must not contain invalid characters like *, :, ", <, >, |, #, {, }, ~, %'
            }
        
        # Copy file in mock storage
        result = self.provider.copy_file(
            source_container=source_container,
            source_path=source_path,
            target_container=target_container,
            target_path=target_path
        )
        
        if result['success']:
            # Update library item count for target container
            if target_container in self.libraries_metadata:
                self.libraries_metadata[target_container]['item_count'] += 1
                self.libraries_metadata[target_container]['modified'] = datetime.now(timezone.utc)
            
            # Format copy response to match SharePoint
            return {
                'success': True,
                'source_path': source_path,
                'target_path': target_path,
                'source_library': source_container,
                'target_library': target_container,
                'message': 'File copied successfully'
            }
        
        return result
    
    def get_sharing_link(self, container_name: str, file_path: str, 
                        link_type: str = 'view', expiry_days: int = 7) -> Dict[str, Any]:
        """
        Generate a sharing link for a file in SharePoint.
        
        Args:
            container_name: Name of the document library
            file_path: Path of the file
            link_type: Type of link (view, edit)
            expiry_days: Number of days until the link expires
            
        Returns:
            Dict[str, Any]: Result dictionary with sharing link
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'success': False,
                    'error': 'Not connected to SharePoint'
                }
        
        if self.error_mode and self.error_type == "get_sharing_link":
            logger.error(f"Mock get_sharing_link error for '{file_path}' (simulation)")
            return {
                'success': False,
                'error': 'Failed to generate sharing link (simulated error)'
            }
        
        # Check if file exists
        file_result = self.provider.get_file_metadata(
            container_name=container_name,
            file_path=file_path
        )
        
        if not file_result['success']:
            return file_result
        
        # Generate mock sharing link
        link_id = str(uuid.uuid4())
        expiry_date = datetime.now(timezone.utc) + timedelta(days=expiry_days)
        
        # URL format varies based on link type
        if link_type.lower() == 'edit':
            permission = 'edit'
        else:
            permission = 'view'
        
        url = f"https://contoso.sharepoint.com/sites/testsite/_layouts/15/guestaccess.aspx?docid={link_id}&authkey=mock_key&e={expiry_date.timestamp()}&p={permission}"
        
        return {
            'success': True,
            'url': url,
            'path': file_path,
            'library': container_name,
            'type': link_type,
            'permission': permission,
            'expires': expiry_date.isoformat(),
            'created': datetime.now(timezone.utc).isoformat()
        }
    
    def _is_valid_library_name(self, name: str) -> bool:
        """
        Validate SharePoint document library name.
        
        Args:
            name: Library name to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        # SharePoint library name restrictions
        invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|', '#', '{', '}', '%']
        invalid_names = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 
                       'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 
                       'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
        
        # Check for invalid characters
        if any(c in name for c in invalid_chars):
            return False
        
        # Check for reserved names
        if name.upper() in invalid_names:
            return False
        
        # Check length
        if len(name) < 1 or len(name) > 128:
            return False
        
        # Check for leading/trailing spaces
        if name != name.strip():
            return False
        
        return True
    
    def _is_valid_file_path(self, path: str) -> bool:
        """
        Validate SharePoint file path.
        
        Args:
            path: File path to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        # SharePoint file path restrictions
        invalid_chars = ['*', ':', '"', '<', '>', '|', '#', '{', '}', '~', '%']
        
        # Check for invalid characters
        if any(c in path for c in invalid_chars):
            return False
        
        # Check length
        if len(path) < 1 or len(path) > 400:
            return False
        
        # Check filename length (last part of path)
        filename = path.split('/')[-1]
        if len(filename) > 128:
            return False
        
        return True
    
    # Methods for testing
    def set_error_mode(self, error_mode: bool, error_type: Optional[str] = None) -> None:
        """
        Set the connector to simulate errors.
        
        Args:
            error_mode: Whether to simulate errors
            error_type: Type of error to simulate
        """
        self.error_mode = error_mode
        self.error_type = error_type
        logger.info(f"Error mode set to {error_mode} with type '{error_type}'")
    
    def reset(self) -> None:
        """Reset the SharePoint connector to its initial state."""
        self.is_connected = False
        self.error_mode = False
        self.error_type = None
        self.libraries_metadata = {}
        self.provider.reset()
        logger.info("SharePoint connector reset")