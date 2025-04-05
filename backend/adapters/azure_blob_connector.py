"""
Azure Blob Storage Connector Implementation

This module implements the StorageConnector interface for Azure Blob Storage.
It provides standardized methods for interacting with Azure Blob Storage services.
"""

import os
import io
import logging
from typing import Dict, Any, Optional, List, Union, BinaryIO, Tuple
from datetime import datetime, timedelta, timezone
import mimetypes
import time
import functools
import pandas as pd

from azure.storage.blob import BlobServiceClient, ContainerClient, BlobClient, ContentSettings, generate_container_sas
from azure.core.exceptions import ResourceNotFoundError, ResourceExistsError, ServiceRequestError, HttpResponseError, AzureError
from azure.identity import DefaultAzureCredential, ClientSecretCredential, ManagedIdentityCredential

from .storage_connector import StorageConnector
from ..utils.error_handling.exceptions import StorageError, ConnectionError, AuthenticationError, OperationError

logger = logging.getLogger(__name__)


def retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2):
    """
    Decorator for retrying Azure Blob operations with exponential backoff.
    
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
                except (ServiceRequestError, HttpResponseError) as e:
                    retries += 1
                    if retries > max_retries:
                        logger.error(f"Operation failed after {max_retries} retries: {str(e)}")
                        raise StorageError(f"Operation failed after {max_retries} retries", original_error=e)
                    
                    logger.warning(f"Retry {retries}/{max_retries} after error: {str(e)}. Waiting {current_backoff}s")
                    time.sleep(current_backoff)
                    current_backoff *= backoff_factor
        return wrapper
    return decorator


class AzureBlobConnector(StorageConnector):
    """Azure Blob Storage connector implementation
    
    This class implements the StorageConnector interface for Azure Blob Storage.
    It provides methods for interacting with Azure Blob Storage services including
    container management, blob operations, and utilities for working with blob
    storage in a standardized way across different storage providers.
    
    The connector supports multiple authentication methods:
    - Connection string
    - Account key
    - SAS token
    - Managed identity
    - Azure AD credentials (service principal)
    
    Attributes:
        client (BlobServiceClient): Azure Blob Storage service client
        account_name (str): Azure Storage account name
        connection_status (Dict): Current connection status and health information
    """
    
    def __init__(self, 
                 connection_string: Optional[str] = None,
                 account_url: Optional[str] = None,
                 account_name: Optional[str] = None,
                 account_key: Optional[str] = None,
                 sas_token: Optional[str] = None,
                 client_id: Optional[str] = None,
                 client_secret: Optional[str] = None,
                 tenant_id: Optional[str] = None,
                 container_name: Optional[str] = None,
                 use_managed_identity: bool = False,
                 max_retries: int = 3):
        """
        Initialize the Azure Blob Storage connector
        
        Args:
            connection_string (Optional[str]): Azure Storage connection string
            account_url (Optional[str]): Azure Storage account URL
            account_name (Optional[str]): Azure Storage account name
            account_key (Optional[str]): Azure Storage account key
            sas_token (Optional[str]): SAS token for authentication
            client_id (Optional[str]): Azure AD client ID for authentication
            client_secret (Optional[str]): Azure AD client secret for authentication
            tenant_id (Optional[str]): Azure AD tenant ID for authentication
            container_name (Optional[str]): Default container name
            use_managed_identity (bool): Whether to use managed identity for authentication
            max_retries (int): Maximum number of retries for operations
            
        Raises:
            AuthenticationError: If no valid authentication method is provided
            ConnectionError: If connection attempt fails
        """
        # Validate that at least one authentication method is provided
        if not any([connection_string, (account_url and account_key), 
                   (account_url and sas_token), 
                   (account_url and client_id and client_secret and tenant_id),
                   (account_url and use_managed_identity)]):
            raise AuthenticationError("No valid authentication method provided for Azure Blob Storage")
            
        self.connection_string = connection_string
        self.account_url = account_url
        self.account_name = account_name
        self.account_key = account_key
        self.sas_token = sas_token
        self.client_id = client_id
        self.client_secret = client_secret
        self.tenant_id = tenant_id
        self.default_container = container_name
        self.use_managed_identity = use_managed_identity
        self.max_retries = max_retries
        
        self.blob_service_client = None
        
        # Connection status tracking
        self.connection_status = {
            "connected": False,
            "last_connection_attempt": None,
            "last_successful_connection": None,
            "connection_errors": [],
            "auth_method": self._determine_auth_method(),
            "endpoint": account_url or "Using connection string"
        }
        
        # Auto-connect if we have enough information
        try:
            self.connect()
        except Exception as e:
            logger.warning(f"Failed to connect during initialization: {str(e)}")
    
    def _determine_auth_method(self) -> str:
        """
        Determine which authentication method will be used
        
        Returns:
            str: The authentication method description
        """
        if self.connection_string:
            return "connection_string"
        elif self.account_key:
            return "account_key"
        elif self.sas_token:
            return "sas_token"
        elif self.client_id and self.client_secret and self.tenant_id:
            return "service_principal"
        elif self.use_managed_identity:
            return "managed_identity"
        else:
            return "unknown"
    
    def connect(self) -> bool:
        """
        Establish a connection to Azure Blob Storage
        
        Attempts to connect to Azure Blob Storage using the provided credentials.
        Updates the connection status with the result.
        
        Returns:
            bool: True if connection is successful, False otherwise
            
        Raises:
            AuthenticationError: If authentication fails
            ConnectionError: If connection cannot be established
        """
        now = datetime.now(timezone.utc)
        self.connection_status["last_connection_attempt"] = now
        
        try:
            logger.info(f"Connecting to Azure Blob Storage using {self.connection_status['auth_method']} authentication")
            
            # Connect using the most appropriate available method
            if self.connection_string:
                # Connect using connection string
                self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
                # Extract account name if available
                if not self.account_name:
                    try:
                        # Try to extract account name from connection string
                        parts = dict(part.split('=', 1) for part in self.connection_string.split(';') if '=' in part)
                        self.account_name = parts.get('AccountName')
                    except Exception:
                        pass
            elif self.account_url:
                if self.account_key:
                    # Connect using account URL and key
                    self.blob_service_client = BlobServiceClient(
                        account_url=self.account_url,
                        credential=self.account_key
                    )
                elif self.sas_token:
                    # Connect using account URL and SAS token
                    # Make sure the SAS token doesn't start with a '?'
                    token = self.sas_token[1:] if self.sas_token.startswith('?') else self.sas_token
                    self.blob_service_client = BlobServiceClient(
                        account_url=f"{self.account_url}?{token}"
                    )
                elif self.client_id and self.client_secret and self.tenant_id:
                    # Connect using Azure AD service principal
                    logger.debug(f"Connecting with service principal (client_id: {self.client_id}, tenant: {self.tenant_id})")
                    try:
                        credential = ClientSecretCredential(
                            tenant_id=self.tenant_id,
                            client_id=self.client_id,
                            client_secret=self.client_secret
                        )
                        self.blob_service_client = BlobServiceClient(
                            account_url=self.account_url,
                            credential=credential
                        )
                    except Exception as auth_error:
                        logger.error(f"Service principal authentication failed: {str(auth_error)}")
                        raise AuthenticationError("Failed to authenticate with service principal", original_error=auth_error)
                elif self.use_managed_identity:
                    # Connect using managed identity
                    logger.debug("Connecting with managed identity")
                    try:
                        credential = ManagedIdentityCredential()
                        self.blob_service_client = BlobServiceClient(
                            account_url=self.account_url,
                            credential=credential
                        )
                    except Exception as auth_error:
                        logger.error(f"Managed identity authentication failed: {str(auth_error)}")
                        raise AuthenticationError("Failed to authenticate with managed identity", original_error=auth_error)
                else:
                    # Connect using Azure default credential chain
                    logger.debug("Connecting with default credential chain")
                    try:
                        credential = DefaultAzureCredential()
                        self.blob_service_client = BlobServiceClient(
                            account_url=self.account_url,
                            credential=credential
                        )
                    except Exception as auth_error:
                        logger.error(f"Default credential authentication failed: {str(auth_error)}")
                        raise AuthenticationError("Failed to authenticate with default credential chain", original_error=auth_error)
            else:
                error_msg = "Insufficient connection parameters provided"
                logger.error(error_msg)
                raise AuthenticationError(error_msg)
            
            # Test connection
            try:
                # Make a call to verify the connection is working
                self.blob_service_client.get_service_properties()
                
                # Update connection status
                self.connection_status["connected"] = True
                self.connection_status["last_successful_connection"] = datetime.now(timezone.utc)
                self.connection_status["connection_errors"] = []
                
                logger.info(f"Successfully connected to Azure Blob Storage (account: {self.account_name or 'unknown'})")
                return True
                
            except (HttpResponseError, ServiceRequestError) as e:
                error_msg = f"Connection failed during verification: {str(e)}"
                logger.error(error_msg)
                
                # Update connection status
                self.connection_status["connected"] = False
                self.connection_status["connection_errors"].append({
                    "timestamp": datetime.now(timezone.utc),
                    "error": str(e),
                    "error_type": type(e).__name__
                })
                
                self.blob_service_client = None
                raise ConnectionError(error_msg, original_error=e)
            
        except AuthenticationError:
            # Re-raise authentication errors
            raise
        except Exception as e:
            error_msg = f"Failed to connect to Azure Blob Storage: {str(e)}"
            logger.error(error_msg)
            
            # Update connection status
            self.connection_status["connected"] = False
            self.connection_status["connection_errors"].append({
                "timestamp": datetime.now(timezone.utc),
                "error": str(e),
                "error_type": type(e).__name__
            })
            
            self.blob_service_client = None
            raise ConnectionError(error_msg, original_error=e)
    
    def disconnect(self) -> bool:
        """
        Close the connection to Azure Blob Storage
        
        Releases the client and updates connection status.
        
        Returns:
            bool: True if disconnection is successful
        """
        self.blob_service_client = None
        
        # Update connection status
        self.connection_status["connected"] = False
        self.connection_status["last_disconnection"] = datetime.now(timezone.utc)
        
        logger.info("Disconnected from Azure Blob Storage")
        return True
    
    @retry_with_backoff(max_retries=3)
    def test_connection(self) -> Dict[str, Any]:
        """
        Test the connection to Azure Blob Storage
        
        Performs a series of operations to verify the connection is working
        properly, including getting service properties and listing containers.
        
        Returns:
            Dict[str, Any]: Connection test results with status, message, and details
            
        Raises:
            ConnectionError: If connection test fails
            AuthenticationError: If authentication fails
        """
        start_time = datetime.now(timezone.utc)
        result = {
            'status': 'error',
            'message': 'Connection test not completed',
            'details': {},
            'timestamp': start_time.isoformat()
        }
        
        try:
            if not self.blob_service_client:
                logger.info("No active client, attempting to connect")
                try:
                    self.connect()
                except (ConnectionError, AuthenticationError) as e:
                    result['message'] = f"Failed to connect: {str(e)}"
                    result['details']['error'] = str(e)
                    result['details']['error_type'] = type(e).__name__
                    return result
            
            # Get service properties to verify connection
            logger.debug("Testing connection with get_service_properties")
            props_start = datetime.now(timezone.utc)
            properties = self.blob_service_client.get_service_properties()
            props_duration = (datetime.now(timezone.utc) - props_start).total_seconds()
            
            # List containers to test access
            logger.debug("Testing connection with list_containers")
            list_start = datetime.now(timezone.utc)
            containers = list(self.blob_service_client.list_containers(max_results=5))
            container_count = len(containers)
            list_duration = (datetime.now(timezone.utc) - list_start).total_seconds()
            
            # Test container creation if no containers exist and we have a default container configured
            default_container_exists = False
            if container_count == 0 and self.default_container:
                try:
                    logger.debug(f"Testing container creation with {self.default_container}_test")
                    test_container = f"{self.default_container}_test_{int(time.time())}"
                    create_start = datetime.now(timezone.utc)
                    container_client = self.blob_service_client.create_container(test_container)
                    create_duration = (datetime.now(timezone.utc) - create_start).total_seconds()
                    
                    # Test container deletion
                    delete_start = datetime.now(timezone.utc)
                    container_client.delete_container()
                    delete_duration = (datetime.now(timezone.utc) - delete_start).total_seconds()
                    
                    # Add container operations to result details
                    result['details']['container_operations'] = {
                        'create_duration': create_duration,
                        'delete_duration': delete_duration
                    }
                except Exception as e:
                    logger.warning(f"Container creation test failed: {str(e)}")
                    result['details']['container_creation_error'] = str(e)
            
            # Check if the default container exists
            if self.default_container:
                for container in containers:
                    if container.name == self.default_container:
                        default_container_exists = True
                        break
            
            # Calculate total test duration
            total_duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            # Update connection status with test results
            self.connection_status["last_test"] = {
                "timestamp": start_time.isoformat(),
                "duration": total_duration,
                "success": True,
                "containers": container_count,
                "auth_method": self.connection_status["auth_method"]
            }
            
            return {
                'status': 'success',
                'message': f'Connection successful. Found {container_count} container(s).',
                'details': {
                    'account_name': self.account_name,
                    'container_count': container_count,
                    'default_container_exists': default_container_exists if self.default_container else None,
                    'auth_method': self.connection_status["auth_method"],
                    'service_properties_duration': props_duration,
                    'list_containers_duration': list_duration,
                    'total_duration': total_duration
                },
                'timestamp': start_time.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Azure Blob Storage connection test failed: {str(e)}")
            error_type = type(e).__name__
            
            # Update connection status with test failure
            self.connection_status["last_test"] = {
                "timestamp": start_time.isoformat(),
                "duration": (datetime.now(timezone.utc) - start_time).total_seconds(),
                "success": False,
                "error": str(e),
                "error_type": error_type
            }
            
            # Add error to connection errors list
            self.connection_status["connection_errors"].append({
                "timestamp": datetime.now(timezone.utc),
                "error": str(e),
                "error_type": error_type,
                "operation": "test_connection"
            })
            
            return {
                'status': 'error',
                'message': f'Connection test failed: {str(e)}',
                'details': {
                    'error': str(e),
                    'error_type': error_type,
                    'account_name': self.account_name,
                    'auth_method': self.connection_status["auth_method"],
                },
                'timestamp': start_time.isoformat()
            }
    
    @retry_with_backoff()
    def list_containers(self, include_metadata: bool = True, prefix: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        List available containers in Azure Blob Storage
        
        Args:
            include_metadata (bool): Whether to include container metadata
            prefix (Optional[str]): Filter containers by name prefix
            limit (Optional[int]): Maximum number of containers to return
            
        Returns:
            List[Dict[str, Any]]: List of container details
            
        Raises:
            ConnectionError: If not connected and connection attempt fails
            StorageError: If container listing fails
        """
        try:
            if not self.blob_service_client:
                logger.debug("No active client for list_containers, attempting to connect")
                self.connect()
            
            # Apply parameters for listing containers
            max_results = limit if limit and limit > 0 else None
            
            # Get iterator for containers
            container_iterator = self.blob_service_client.list_containers(
                name_starts_with=prefix,
                include_metadata=include_metadata,
                results_per_page=100 if max_results and max_results > 100 else max_results
            )
            
            # Use pagination to efficiently iterate through results
            containers = []
            page_count = 0
            total_count = 0
            
            # Process each page
            for page in container_iterator.by_page():
                page_count += 1
                page_items = []
                
                # Process items in the current page
                for container in page:
                    # Convert to dictionary with relevant details
                    container_details = {
                        'name': container.name,
                        'last_modified': container.last_modified.isoformat() if container.last_modified else None,
                        'metadata': container.metadata if include_metadata else None,
                        'etag': container.etag,
                        'has_immutability_policy': container.has_immutability_policy,
                        'has_legal_hold': container.has_legal_hold,
                        'is_default': self.default_container and container.name == self.default_container
                    }
                    page_items.append(container_details)
                    total_count += 1
                    
                    # Check if we've reached the limit
                    if max_results and total_count >= max_results:
                        break
                
                containers.extend(page_items)
                
                # If we've reached the limit, stop processing pages
                if max_results and total_count >= max_results:
                    break
            
            logger.info(f"Listed {len(containers)} containers from {page_count} pages")
            return containers
            
        except (HttpResponseError, ServiceRequestError) as e:
            error_msg = f"Failed to list Azure Blob Storage containers: {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Unexpected error listing Azure Blob Storage containers: {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff()
    def create_container(self, container_name: str, metadata: Optional[Dict[str, str]] = None, public_access: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new container in Azure Blob Storage
        
        Args:
            container_name (str): Name of the container to create
            metadata (Optional[Dict[str, str]]): Container metadata key-value pairs
            public_access (Optional[str]): Public access level ('container', 'blob', or None for private)
            
        Returns:
            Dict[str, Any]: Created container details
            
        Raises:
            ConnectionError: If not connected and connection attempt fails
            StorageError: If container creation fails
            ValueError: If container name is invalid
        """
        # Validate container name
        if not container_name:
            raise ValueError("Container name cannot be empty")
        
        # Azure container naming rules
        if not all(c.islower() or c.isdigit() or c == '-' for c in container_name):
            raise ValueError("Container name must contain only lowercase letters, numbers, and hyphens")
            
        if len(container_name) < 3 or len(container_name) > 63:
            raise ValueError("Container name must be 3-63 characters long")
            
        if container_name.startswith('-') or container_name.endswith('-'):
            raise ValueError("Container name cannot start or end with a hyphen")
            
        if '--' in container_name:
            raise ValueError("Container name cannot contain consecutive hyphens")
        
        try:
            if not self.blob_service_client:
                logger.debug("No active client for create_container, attempting to connect")
                self.connect()
            
            # Create container with metadata and access level if provided
            start_time = datetime.now(timezone.utc)
            
            # Convert public_access string to Azure enum value
            access_level = None
            if public_access:
                from azure.storage.blob import PublicAccess
                if public_access.lower() == 'container':
                    access_level = PublicAccess.Container
                elif public_access.lower() == 'blob':
                    access_level = PublicAccess.Blob
            
            # Create the container
            container_client = self.blob_service_client.create_container(
                name=container_name,
                metadata=metadata,
                public_access=access_level
            )
            
            # Get container properties to return complete details
            props = container_client.get_container_properties()
            
            # Construct response with timing information
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            logger.info(f"Created container '{container_name}' in {duration:.2f}s")
            
            # Return details about the container
            return {
                'name': container_name,
                'created': True,
                'url': container_client.url,
                'etag': props.etag,
                'last_modified': props.last_modified.isoformat() if props.last_modified else None,
                'metadata': metadata,
                'public_access': public_access,
                'duration': duration
            }
            
        except ResourceExistsError as e:
            # Container already exists
            logger.warning(f"Azure Blob Storage container '{container_name}' already exists")
            
            # Try to get properties of existing container
            try:
                container_client = self.blob_service_client.get_container_client(container_name)
                props = container_client.get_container_properties()
                
                return {
                    'name': container_name,
                    'created': False,
                    'exists': True,
                    'url': container_client.url,
                    'etag': props.etag,
                    'last_modified': props.last_modified.isoformat() if props.last_modified else None,
                    'error': 'Container already exists'
                }
            except Exception:
                # If we can't get properties, just return basic info
                return {
                    'name': container_name,
                    'created': False,
                    'exists': True,
                    'error': 'Container already exists',
                    'error_details': str(e)
                }
                
        except (HttpResponseError, ServiceRequestError) as e:
            error_msg = f"Failed to create Azure Blob Storage container '{container_name}': {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
            
        except ValueError as e:
            # Re-raise validation errors
            raise
            
        except Exception as e:
            error_msg = f"Unexpected error creating Azure Blob Storage container '{container_name}': {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff()
    def delete_container(self, container_name: str, if_match: Optional[str] = None) -> Dict[str, Any]:
        """
        Delete a container from Azure Blob Storage
        
        Args:
            container_name (str): Name of the container to delete
            if_match (Optional[str]): ETag for optimistic concurrency control
            
        Returns:
            Dict[str, Any]: Result of the delete operation
            
        Raises:
            ConnectionError: If not connected and connection attempt fails
            StorageError: If container deletion fails
        """
        if not container_name:
            raise ValueError("Container name cannot be empty")
            
        start_time = datetime.now(timezone.utc)
        
        try:
            if not self.blob_service_client:
                logger.debug("No active client for delete_container, attempting to connect")
                self.connect()
            
            # Get container client
            container_client = self.blob_service_client.get_container_client(container_name)
            
            # Delete container with optional ETag for optimistic concurrency
            container_client.delete_container(if_match=if_match)
            
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.info(f"Deleted container '{container_name}' in {duration:.2f}s")
            
            return {
                'name': container_name,
                'deleted': True,
                'duration': duration
            }
            
        except ResourceNotFoundError as e:
            # Container doesn't exist - consider this a success since the end state is as desired
            logger.warning(f"Azure Blob Storage container '{container_name}' not found during deletion")
            
            return {
                'name': container_name,
                'deleted': False,
                'exists': False,
                'message': 'Container not found',
                'duration': (datetime.now(timezone.utc) - start_time).total_seconds()
            }
            
        except (HttpResponseError, ServiceRequestError) as e:
            error_msg = f"Failed to delete Azure Blob Storage container '{container_name}': {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Unexpected error deleting Azure Blob Storage container '{container_name}': {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff()
    def list_blobs(self, container_name: str, prefix: Optional[str] = None, limit: Optional[int] = None, 
                   include_metadata: bool = True, include_snapshots: bool = False, include_versions: bool = False,
                   include_deleted: bool = False, delimiter: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List blobs in an Azure Blob Storage container
        
        Args:
            container_name (str): Name of the container
            prefix (Optional[str]): Prefix to filter blob names
            limit (Optional[int]): Maximum number of blobs to return
            include_metadata (bool): Whether to include blob metadata
            include_snapshots (bool): Whether to include blob snapshots
            include_versions (bool): Whether to include blob versions
            include_deleted (bool): Whether to include soft-deleted blobs
            delimiter (Optional[str]): Character for hierarchy navigation (e.g. '/')
            
        Returns:
            List[Dict[str, Any]]: List of blob details
            
        Raises:
            ConnectionError: If not connected and connection attempt fails
            StorageError: If blob listing fails
            ValueError: If container name is invalid
        """
        if not container_name:
            raise ValueError("Container name cannot be empty")
            
        try:
            if not self.blob_service_client:
                logger.debug("No active client for list_blobs, attempting to connect")
                self.connect()
            
            # Get container client and set up includes for listing
            container_client = self.blob_service_client.get_container_client(container_name)
            
            # Configure listing options
            start_time = datetime.now(timezone.utc)
            
            # Determine includes for listing
            from azure.storage.blob import BlobProperties
            include = []
            if include_metadata:
                include.append("metadata")
            if include_snapshots:
                include.append("snapshots")
            if include_versions:
                include.append("versions")
            if include_deleted:
                include.append("deleted")
            
            # Set up listing parameters
            list_kwargs = {
                'name_starts_with': prefix if prefix else None,
                'include': include,
                'delimiter': delimiter
            }
            
            # Set max results if provided
            max_results = None
            if limit and limit > 0:
                max_results = limit
                list_kwargs['results_per_page'] = min(limit, 1000)  # Azure has a max of 5000, but use a smaller value
            
            # Get blob iterator
            blob_iterator = container_client.list_blobs(**list_kwargs)
            
            # Process results with pagination support
            blobs = []
            page_count = 0
            total_count = 0
            
            # Process each page
            for page in blob_iterator.by_page():
                page_count += 1
                page_items = []
                
                # Process items in the current page
                for blob in page:
                    # Convert blob to dictionary with all relevant details
                    blob_details = {
                        'name': blob.name,
                        'size': blob.size,
                        'last_modified': blob.last_modified.isoformat() if blob.last_modified else None,
                        'created_on': blob.creation_time.isoformat() if hasattr(blob, 'creation_time') and blob.creation_time else None,
                        'etag': blob.etag.strip('"') if blob.etag else None,
                        'content_type': blob.content_settings.content_type if blob.content_settings else None,
                        'content_md5': blob.content_settings.content_md5.hex() if blob.content_settings and blob.content_settings.content_md5 else None,
                        'content_encoding': blob.content_settings.content_encoding if blob.content_settings else None,
                        'content_language': blob.content_settings.content_language if blob.content_settings else None,
                        'content_disposition': blob.content_settings.content_disposition if blob.content_settings else None,
                        'cache_control': blob.content_settings.cache_control if blob.content_settings else None,
                        'blob_type': blob.blob_type if hasattr(blob, 'blob_type') else None,
                        'is_current_version': blob.is_current_version if hasattr(blob, 'is_current_version') else None,
                        'metadata': blob.metadata if include_metadata else None,
                        'has_snapshot': hasattr(blob, 'snapshot') and blob.snapshot is not None,
                        'snapshot': blob.snapshot if hasattr(blob, 'snapshot') else None,
                        'version_id': blob.version_id if hasattr(blob, 'version_id') else None,
                        'is_deleted': blob.deleted if hasattr(blob, 'deleted') else None,
                        'deleted_time': blob.deleted_time.isoformat() if hasattr(blob, 'deleted_time') and blob.deleted_time else None
                    }
                    
                    # Add URL if it's a current version
                    if not hasattr(blob, 'is_current_version') or blob.is_current_version:
                        blob_client = container_client.get_blob_client(blob.name)
                        blob_details['url'] = blob_client.url
                    
                    page_items.append(blob_details)
                    total_count += 1
                    
                    # Check if we've reached the limit
                    if max_results and total_count >= max_results:
                        break
                
                blobs.extend(page_items)
                
                # If we've reached the limit, stop processing pages
                if max_results and total_count >= max_results:
                    break
            
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.info(f"Listed {len(blobs)} blobs from container '{container_name}' in {duration:.2f}s (prefix: {prefix or 'None'}, pages: {page_count})")
            
            return blobs
            
        except ResourceNotFoundError as e:
            logger.warning(f"Azure Blob Storage container '{container_name}' not found during list_blobs")
            raise StorageError(f"Container '{container_name}' not found", original_error=e)
            
        except (HttpResponseError, ServiceRequestError) as e:
            error_msg = f"Failed to list blobs in Azure Blob Storage container '{container_name}': {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Unexpected error listing blobs in Azure Blob Storage container '{container_name}': {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
    
    def upload_blob(self, container_name: str, blob_name: str, data: Union[bytes, BinaryIO, str], content_type: Optional[str] = None) -> Dict[str, Any]:
        """Upload a blob to an Azure Blob Storage container"""
        try:
            if not self.blob_service_client:
                success = self.connect()
                if not success:
                    return {'status': 'error', 'message': 'Failed to connect to Azure Blob Storage'}
            
            # Get blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            
            # Prepare content settings
            content_settings = None
            if content_type:
                content_settings = ContentSettings(content_type=content_type)
            
            # Handle different data types
            if isinstance(data, str):
                data = data.encode('utf-8')
            
            # Upload blob
            if hasattr(data, 'read'):  # File-like object
                result = blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)
            else:  # Bytes or string
                result = blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)
            
            return {
                'status': 'success',
                'message': 'Blob uploaded successfully',
                'etag': result.get('etag', '').strip('"') if result else None,
                'last_modified': result.get('last_modified').isoformat() if result and result.get('last_modified') else None
            }
            
        except Exception as e:
            logger.error(f"Failed to upload blob '{blob_name}' to Azure Blob Storage container '{container_name}': {str(e)}")
            return {
                'status': 'error',
                'message': f'Upload failed: {str(e)}'
            }
    
    def download_blob(self, container_name: str, blob_name: str) -> Union[bytes, None]:
        """Download a blob from an Azure Blob Storage container"""
        try:
            if not self.blob_service_client:
                success = self.connect()
                if not success:
                    return None
            
            # Get blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            
            # Download blob
            download_stream = blob_client.download_blob()
            return download_stream.readall()
            
        except ResourceNotFoundError:
            logger.warning(f"Blob '{blob_name}' not found in Azure Blob Storage container '{container_name}'")
            return None
        except Exception as e:
            logger.error(f"Failed to download blob '{blob_name}' from Azure Blob Storage container '{container_name}': {str(e)}")
            return None
    
    def delete_blob(self, container_name: str, blob_name: str) -> bool:
        """Delete a blob from an Azure Blob Storage container"""
        try:
            if not self.blob_service_client:
                success = self.connect()
                if not success:
                    return False
            
            # Get blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            
            # Delete blob
            blob_client.delete_blob()
            return True
            
        except ResourceNotFoundError:
            # Blob doesn't exist
            logger.warning(f"Blob '{blob_name}' not found in Azure Blob Storage container '{container_name}'")
            return True
        except Exception as e:
            logger.error(f"Failed to delete blob '{blob_name}' from Azure Blob Storage container '{container_name}': {str(e)}")
            return False
    
    def get_blob_properties(self, container_name: str, blob_name: str) -> Dict[str, Any]:
        """Get properties of a blob in Azure Blob Storage"""
        try:
            if not self.blob_service_client:
                success = self.connect()
                if not success:
                    return {}
            
            # Get blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            
            # Get blob properties
            properties = blob_client.get_blob_properties()
            
            return {
                'name': blob_name,
                'size': properties.size,
                'last_modified': properties.last_modified.isoformat() if properties.last_modified else None,
                'created_on': properties.creation_time.isoformat() if properties.creation_time else None,
                'etag': properties.etag.strip('"') if properties.etag else None,
                'content_type': properties.content_settings.content_type if properties.content_settings else None,
                'content_encoding': properties.content_settings.content_encoding if properties.content_settings else None,
                'content_language': properties.content_settings.content_language if properties.content_settings else None,
                'cache_control': properties.content_settings.cache_control if properties.content_settings else None,
                'content_md5': properties.content_settings.content_md5 if properties.content_settings else None,
                'content_disposition': properties.content_settings.content_disposition if properties.content_settings else None,
                'metadata': properties.metadata
            }
            
        except ResourceNotFoundError:
            logger.warning(f"Blob '{blob_name}' not found in Azure Blob Storage container '{container_name}'")
            return {}
        except Exception as e:
            logger.error(f"Failed to get properties for blob '{blob_name}' in Azure Blob Storage container '{container_name}': {str(e)}")
            return {}
    
    def get_blob_url(self, container_name: str, blob_name: str, expiry_hours: int = 1) -> str:
        """Get a URL for accessing a blob in Azure Blob Storage"""
        try:
            if not self.blob_service_client:
                success = self.connect()
                if not success:
                    return ''
            
            # If using SAS token or account key, generate SAS URL
            if self.account_key or self.sas_token:
                # Get account name from account URL if not provided
                account_name = self.account_name
                if not account_name and self.account_url:
                    # Extract account name from URL
                    # Format: https://{account_name}.blob.core.windows.net
                    try:
                        url_parts = self.account_url.split('.')
                        account_name = url_parts[0].split('//')[1]
                    except:
                        pass
                
                if account_name and self.account_key:
                    # Generate SAS token for the container
                    expiry_time = datetime.now(timezone.utc) + timedelta(hours=expiry_hours)
                    
                    # Generate SAS token for the specific blob
                    sas_token = generate_container_sas(
                        account_name=account_name,
                        container_name=container_name,
                        account_key=self.account_key,
                        permission='r',  # Read permission
                        expiry=expiry_time
                    )
                    
                    # Construct the URL
                    url = f"https://{account_name}.blob.core.windows.net/{container_name}/{blob_name}?{sas_token}"
                    return url
                else:
                    # Use blob client to get URL
                    blob_client = self.blob_service_client.get_blob_client(
                        container=container_name,
                        blob=blob_name
                    )
                    return blob_client.url
            else:
                # Just return the blob URL (for use with authenticated access)
                blob_client = self.blob_service_client.get_blob_client(
                    container=container_name,
                    blob=blob_name
                )
                return blob_client.url
                
        except Exception as e:
            logger.error(f"Failed to get URL for blob '{blob_name}' in Azure Blob Storage container '{container_name}': {str(e)}")
            return ''