"""
Azure Blob Storage Connector Mock for Testing

This module implements a mock Azure Blob Storage connector for testing,
using the standardized storage testing framework.
"""

import logging
import io
import base64
from typing import Dict, Any, Optional, List, Union, BinaryIO
from datetime import datetime, timedelta, timezone

from .storage_test_framework import MockStorageProvider, StorageTestBase
from .entity_registry import BaseTestAdapter

# Set up logging
logger = logging.getLogger("azure_blob_connector")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

class AzureBlobConnector(BaseTestAdapter):
    """
    Mock Azure Blob Storage connector for testing
    
    This class implements all methods from the real AzureBlobConnector with mock functionality
    for testing purposes.
    """
    
    def __init__(self, registry=None,
                 connection_string: Optional[str] = None,
                 account_url: Optional[str] = None,
                 account_name: Optional[str] = None,
                 account_key: Optional[str] = None,
                 sas_token: Optional[str] = None,
                 client_id: Optional[str] = None,
                 client_secret: Optional[str] = None,
                 tenant_id: Optional[str] = None,
                 container_name: Optional[str] = None,
                 use_managed_identity: bool = False):
        """
        Initialize the mock Azure Blob Storage connector
        
        Args:
            registry: Entity registry instance
            connection_string: Azure Storage connection string
            account_url: Azure Storage account URL
            account_name: Azure Storage account name
            account_key: Azure Storage account key
            sas_token: SAS token for authentication
            client_id: Azure AD client ID for authentication
            client_secret: Azure AD client secret for authentication
            tenant_id: Azure AD tenant ID for authentication
            container_name: Default container name
            use_managed_identity: Whether to use managed identity for authentication
        """
        super().__init__(registry)
        
        # Store connection parameters
        self.connection_string = connection_string
        self.account_url = account_url
        self.account_name = account_name or "mockstorageaccount"
        self.account_key = account_key or "mock_account_key"
        self.sas_token = sas_token
        self.client_id = client_id
        self.client_secret = client_secret
        self.tenant_id = tenant_id
        self.default_container = container_name
        self.use_managed_identity = use_managed_identity
        
        self.is_connected = False
        self.error_mode = False
        self.error_type = None
        
        # Initialize mock storage provider if not already initialized
        if not hasattr(self, 'storage'):
            self.storage = MockStorageProvider()
            
        logger.info("AzureBlobConnector mock initialized")
    
    def connect(self) -> bool:
        """
        Establish a mock connection to Azure Blob Storage
        
        Returns:
            bool: True if connection is successful, False otherwise
        """
        if self.error_mode and self.error_type == "connection":
            logger.error("Mock Azure Blob Storage connection error (simulation)")
            self.is_connected = False
            return False
        
        self.is_connected = True
        logger.debug("Connected to mock Azure Blob Storage")
        return True
    
    def disconnect(self) -> bool:
        """
        Close the mock connection to Azure Blob Storage
        
        Returns:
            bool: True if disconnection is successful
        """
        self.is_connected = False
        logger.debug("Disconnected from mock Azure Blob Storage")
        return True
    
    def test_connection(self) -> Dict[str, Any]:
        """
        Test the mock connection to Azure Blob Storage
        
        Returns:
            Dict[str, Any]: Connection test result
        """
        if self.error_mode and self.error_type == "connection":
            return {
                'status': 'error',
                'message': 'Failed to connect to Azure Blob Storage'
            }
        
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {
                    'status': 'error',
                    'message': 'Failed to connect to Azure Blob Storage'
                }
        
        containers = self.list_containers()
        container_count = len(containers)
        
        return {
            'status': 'success',
            'message': f'Connection successful. Found {container_count} container(s).',
            'containers': container_count
        }
    
    def list_containers(self) -> List[Dict[str, Any]]:
        """
        List available containers in mock Azure Blob Storage
        
        Returns:
            List[Dict[str, Any]]: List of container metadata
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return []
        
        if self.error_mode and self.error_type == "list_containers":
            logger.error("Mock list_containers error (simulation)")
            return []
        
        # Get containers from mock storage using the storage provider's list_containers method
        result = self.storage.list_containers()
        
        if not result['success']:
            return []
            
        # Format container data to match real Azure response
        return [
            {
                'name': container_name,
                'last_modified': datetime.now(timezone.utc).isoformat(),
                'metadata': {}
            }
            for container_name in result['containers']
        ]
    
    def create_container(self, container_name: str) -> bool:
        """
        Create a new container in mock Azure Blob Storage
        
        Args:
            container_name: Name of the container to create
            
        Returns:
            bool: True if container is created successfully, False otherwise
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return False
        
        if self.error_mode and self.error_type == "create_container":
            logger.error(f"Mock create_container error for '{container_name}' (simulation)")
            return False
        
        # Create container in mock storage
        success = self.storage.create_container(container_name)
        
        if success:
            logger.debug(f"Created mock container: {container_name}")
        else:
            logger.warning(f"Container '{container_name}' already exists in mock storage")
            
        return True  # Always return True for existing container, same as real implementation
    
    def delete_container(self, container_name: str) -> bool:
        """
        Delete a container from mock Azure Blob Storage
        
        Args:
            container_name: Name of the container to delete
            
        Returns:
            bool: True if container is deleted successfully, False otherwise
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return False
        
        if self.error_mode and self.error_type == "delete_container":
            logger.error(f"Mock delete_container error for '{container_name}' (simulation)")
            return False
        
        # Delete container from mock storage
        success = self.storage.delete_container(container_name)
        
        if success:
            logger.debug(f"Deleted mock container: {container_name}")
            return True
        else:
            logger.warning(f"Container '{container_name}' not found in mock storage")
            return True  # Always return True for non-existent container, same as real implementation
    
    def list_blobs(self, container_name: str, prefix: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        List blobs in a mock Azure Blob Storage container
        
        Args:
            container_name: Name of the container
            prefix: Optional prefix to filter blobs
            limit: Optional maximum number of results
            
        Returns:
            List[Dict[str, Any]]: List of blob metadata
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return []
        
        if self.error_mode and self.error_type == "list_blobs":
            logger.error(f"Mock list_blobs error for container '{container_name}' (simulation)")
            return []
        
        # Check if container exists
        if container_name not in self.storage.containers:
            logger.warning(f"Container '{container_name}' not found in mock storage")
            return []
        
        # Get files from mock storage using the storage provider's list_files method
        result = self.storage.list_files(
            container_name=container_name,
            prefix=prefix or ""
        )
        
        if not result['success']:
            return []
            
        # Format file data to match real Azure response
        blobs = []
        files = result['files']
        
        # Apply limit if specified
        if limit is not None and limit > 0:
            files = files[:limit]
        
        for file_info in files:
            # Create mock blob metadata
            blob_name = file_info['path']
            blobs.append({
                'name': blob_name,
                'size': file_info['size'],
                'last_modified': file_info['last_modified'].isoformat(),
                'etag': f'"{blob_name}_etag"',
                'content_type': file_info['content_type'],
                'content_md5': None,
                'metadata': file_info.get('metadata', {})
            })
        
        return blobs
    
    def upload_blob(self, container_name: str, blob_name: str, data: Union[bytes, BinaryIO, str], content_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Upload a blob to a mock Azure Blob Storage container
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob
            data: Content of the blob
            content_type: Optional content type of the blob
            
        Returns:
            Dict[str, Any]: Upload result
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {'status': 'error', 'message': 'Failed to connect to Azure Blob Storage'}
        
        if self.error_mode and self.error_type == "upload_blob":
            logger.error(f"Mock upload_blob error for '{blob_name}' (simulation)")
            return {
                'status': 'error',
                'message': 'Upload failed: Simulated error'
            }
        
        # Check if container exists, create it if it doesn't
        if container_name not in self.storage.containers:
            success = self.storage.create_container(container_name)
            if not success:
                return {'status': 'error', 'message': f"Failed to create container '{container_name}'"}
        
        # Handle different data types
        if isinstance(data, str):
            content = data.encode('utf-8')
        elif hasattr(data, 'read'):  # File-like object
            content = data.read()
            if isinstance(content, str):
                content = content.encode('utf-8')
        else:  # Bytes
            content = data
        
        # Determine content type if not provided
        if not content_type:
            if blob_name.endswith('.txt'):
                content_type = 'text/plain'
            elif blob_name.endswith('.json'):
                content_type = 'application/json'
            elif blob_name.endswith('.xml'):
                content_type = 'application/xml'
            elif blob_name.endswith('.html'):
                content_type = 'text/html'
            elif blob_name.endswith('.csv'):
                content_type = 'text/csv'
            else:
                content_type = 'application/octet-stream'
        
        # Store blob in mock storage with metadata
        now = datetime.now(timezone.utc)
        etag = f'"{blob_name}_{now.timestamp()}"'
        
        blob_data = {
            'content': content,
            'content_type': content_type,
            'last_modified': now,
            'created_at': now,
            'etag': etag,
            'metadata': {}
        }
        
        # Upload blob to mock storage using the storage provider's upload_file method
        result = self.storage.upload_file(
            container_name=container_name,
            file_path=blob_name,
            content=content,
            content_type=content_type,
            metadata=blob_data.get('metadata', {})
        )
        
        if result['success']:
            logger.debug(f"Uploaded mock blob: {container_name}/{blob_name}")
            return {
                'status': 'success',
                'message': 'Blob uploaded successfully',
                'etag': etag.strip('"'),
                'last_modified': now.isoformat()
            }
        else:
            return {
                'status': 'error',
                'message': 'Failed to upload blob to mock storage'
            }
    
    def download_blob(self, container_name: str, blob_name: str) -> Union[bytes, None]:
        """
        Download a blob from a mock Azure Blob Storage container
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob
            
        Returns:
            Union[bytes, None]: Blob content or None if not found/error
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return None
        
        if self.error_mode and self.error_type == "download_blob":
            logger.error(f"Mock download_blob error for '{blob_name}' (simulation)")
            return None
        
        # Check if container exists
        if container_name not in self.storage.containers:
            logger.warning(f"Container '{container_name}' not found in mock storage")
            return None
        
        # Get blob from mock storage using the storage provider's download_file method
        result = self.storage.download_file(
            container_name=container_name,
            file_path=blob_name
        )
        
        if result['success']:
            logger.debug(f"Downloaded mock blob: {container_name}/{blob_name}")
            return result['content']
        else:
            logger.warning(f"Blob '{blob_name}' not found in container '{container_name}'")
            return None
    
    def delete_blob(self, container_name: str, blob_name: str) -> bool:
        """
        Delete a blob from a mock Azure Blob Storage container
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob
            
        Returns:
            bool: True if blob is deleted successfully, False otherwise
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return False
        
        if self.error_mode and self.error_type == "delete_blob":
            logger.error(f"Mock delete_blob error for '{blob_name}' (simulation)")
            return False
        
        # Check if container exists
        if container_name not in self.storage.containers:
            logger.warning(f"Container '{container_name}' not found in mock storage")
            return True  # Match real implementation behavior
        
        # Delete blob from mock storage using the storage provider's delete_file method
        result = self.storage.delete_file(
            container_name=container_name,
            file_path=blob_name
        )
        
        if result['success']:
            logger.debug(f"Deleted mock blob: {container_name}/{blob_name}")
            return True
        else:
            logger.warning(f"Blob '{blob_name}' not found in container '{container_name}'")
            return True  # Match real implementation behavior
    
    def get_blob_properties(self, container_name: str, blob_name: str) -> Dict[str, Any]:
        """
        Get properties of a blob in mock Azure Blob Storage
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob
            
        Returns:
            Dict[str, Any]: Blob properties or empty dict if not found/error
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return {}
        
        if self.error_mode and self.error_type == "get_blob_properties":
            logger.error(f"Mock get_blob_properties error for '{blob_name}' (simulation)")
            return {}
        
        # Check if container exists
        if container_name not in self.storage.containers:
            logger.warning(f"Container '{container_name}' not found in mock storage")
            return {}
        
        # Get file metadata using the storage provider's get_file_metadata method
        result = self.storage.get_file_metadata(
            container_name=container_name,
            file_path=blob_name
        )
        
        if result['success']:
            # Format properties to match real Azure response
            return {
                'name': blob_name,
                'size': result['size'],
                'last_modified': result['last_modified'].isoformat(),
                'created_on': result['last_modified'].isoformat(),  # Use last_modified as created_on
                'etag': f'"{blob_name}_etag"',
                'content_type': result['content_type'],
                'content_encoding': None,
                'content_language': None,
                'cache_control': None,
                'content_md5': None,
                'content_disposition': None,
                'metadata': result['metadata']
            }
        else:
            logger.warning(f"Blob '{blob_name}' not found in container '{container_name}'")
            return {}
    
    def get_blob_url(self, container_name: str, blob_name: str, expiry_hours: int = 1) -> str:
        """
        Get a URL for accessing a blob in mock Azure Blob Storage
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob
            expiry_hours: Number of hours until the URL expires
            
        Returns:
            str: SAS URL for the blob or empty string if error
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return ''
        
        if self.error_mode and self.error_type == "get_blob_url":
            logger.error(f"Mock get_blob_url error for '{blob_name}' (simulation)")
            return ''
        
        # Check if container exists
        if container_name not in self.storage.containers:
            logger.warning(f"Container '{container_name}' not found in mock storage")
            return ''
        
        # Check if blob exists using the storage provider's get_file_metadata method
        result = self.storage.get_file_metadata(
            container_name=container_name,
            file_path=blob_name
        )
        if not result['success']:
            logger.warning(f"Blob '{blob_name}' not found in container '{container_name}'")
            return ''
        
        # Generate expiry time
        expiry_time = datetime.now(timezone.utc) + timedelta(hours=expiry_hours)
        expiry_str = expiry_time.strftime('%Y-%m-%dT%H:%M:%SZ')
        
        # Generate mock SAS token
        mock_sas = f"sp=r&st={datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}&se={expiry_str}&sip=0.0.0.0-255.255.255.255&sr=b&sig=mock_signature"
        
        # Construct the URL
        url = f"https://{self.account_name}.blob.core.windows.net/{container_name}/{blob_name}?{mock_sas}"
        return url
    
    # Methods for testing
    def set_error_mode(self, error_mode: bool, error_type: Optional[str] = None) -> None:
        """
        Set the connector to simulate errors
        
        Args:
            error_mode: Whether to simulate errors
            error_type: Type of error to simulate
        """
        self.error_mode = error_mode
        self.error_type = error_type
    
    def reset(self) -> None:
        """Reset the mock Azure Blob Storage connector to its initial state."""
        # No super().reset() call needed as there is no reset method in the parent class
        self.is_connected = False
        self.error_mode = False
        self.error_type = None
        
        # Reinitialize storage provider
        self.storage = MockStorageProvider(provider_type="azure_blob")
        
    def container_exists(self, container_name: str) -> bool:
        """
        Check if a container exists in mock Azure Blob Storage
        
        Args:
            container_name: Name of the container
            
        Returns:
            bool: True if container exists, False otherwise
        """
        if not self.is_connected:
            success = self.connect()
            if not success:
                return False
                
        return container_name in self.storage.containers