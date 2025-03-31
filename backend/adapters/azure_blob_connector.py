"""
Azure Blob Storage Connector Implementation

This module implements the StorageConnector interface for Azure Blob Storage.
"""

import os
import io
import logging
from typing import Dict, Any, Optional, List, Union, BinaryIO
from datetime import datetime, timedelta
import mimetypes

from azure.storage.blob import BlobServiceClient, ContainerClient, BlobClient, ContentSettings, generate_container_sas
from azure.core.exceptions import ResourceNotFoundError, ResourceExistsError, ServiceRequestError, HttpResponseError
from azure.identity import DefaultAzureCredential, ClientSecretCredential, ManagedIdentityCredential

from .storage_connector import StorageConnector

logger = logging.getLogger(__name__)


class AzureBlobConnector(StorageConnector):
    """Azure Blob Storage connector implementation"""
    
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
                 use_managed_identity: bool = False):
        """
        Initialize the Azure Blob Storage connector
        
        Args:
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
        
        self.blob_service_client = None
    
    def connect(self) -> bool:
        """Establish a connection to Azure Blob Storage"""
        try:
            # Connect using the most appropriate available method
            if self.connection_string:
                # Connect using connection string
                self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
            elif self.account_url:
                if self.account_key:
                    # Connect using account URL and key
                    self.blob_service_client = BlobServiceClient(
                        account_url=self.account_url,
                        credential=self.account_key
                    )
                elif self.sas_token:
                    # Connect using account URL and SAS token
                    self.blob_service_client = BlobServiceClient(
                        account_url=f"{self.account_url}?{self.sas_token}"
                    )
                elif self.client_id and self.client_secret and self.tenant_id:
                    # Connect using Azure AD service principal
                    credential = ClientSecretCredential(
                        tenant_id=self.tenant_id,
                        client_id=self.client_id,
                        client_secret=self.client_secret
                    )
                    self.blob_service_client = BlobServiceClient(
                        account_url=self.account_url,
                        credential=credential
                    )
                elif self.use_managed_identity:
                    # Connect using managed identity
                    credential = ManagedIdentityCredential()
                    self.blob_service_client = BlobServiceClient(
                        account_url=self.account_url,
                        credential=credential
                    )
                else:
                    # Connect using Azure default credential chain
                    credential = DefaultAzureCredential()
                    self.blob_service_client = BlobServiceClient(
                        account_url=self.account_url,
                        credential=credential
                    )
            else:
                raise ValueError("Insufficient connection parameters provided")
            
            # Test connection
            self.blob_service_client.get_service_properties()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Azure Blob Storage: {str(e)}")
            self.blob_service_client = None
            return False
    
    def disconnect(self) -> bool:
        """Close the connection to Azure Blob Storage"""
        self.blob_service_client = None
        return True
    
    def test_connection(self) -> Dict[str, Any]:
        """Test the connection to Azure Blob Storage"""
        try:
            if not self.blob_service_client:
                success = self.connect()
                if not success:
                    return {
                        'status': 'error',
                        'message': 'Failed to connect to Azure Blob Storage'
                    }
            
            # Get service properties to verify connection
            self.blob_service_client.get_service_properties()
            
            # List containers to test access
            containers = list(self.blob_service_client.list_containers(max_results=5))
            container_count = len(containers)
            
            return {
                'status': 'success',
                'message': f'Connection successful. Found {container_count} container(s).',
                'containers': container_count
            }
            
        except Exception as e:
            logger.error(f"Azure Blob Storage connection test failed: {str(e)}")
            return {
                'status': 'error',
                'message': f'Connection failed: {str(e)}'
            }
    
    def list_containers(self) -> List[Dict[str, Any]]:
        """List available containers in Azure Blob Storage"""
        try:
            if not self.blob_service_client:
                success = self.connect()
                if not success:
                    return []
            
            containers = list(self.blob_service_client.list_containers())
            
            return [
                {
                    'name': container.name,
                    'last_modified': container.last_modified.isoformat() if container.last_modified else None,
                    'metadata': container.metadata
                }
                for container in containers
            ]
            
        except Exception as e:
            logger.error(f"Failed to list Azure Blob Storage containers: {str(e)}")
            return []
    
    def create_container(self, container_name: str) -> bool:
        """Create a new container in Azure Blob Storage"""
        try:
            if not self.blob_service_client:
                success = self.connect()
                if not success:
                    return False
            
            # Create container
            container_client = self.blob_service_client.create_container(container_name)
            return True
            
        except ResourceExistsError:
            # Container already exists
            logger.warning(f"Azure Blob Storage container '{container_name}' already exists")
            return True
        except Exception as e:
            logger.error(f"Failed to create Azure Blob Storage container '{container_name}': {str(e)}")
            return False
    
    def delete_container(self, container_name: str) -> bool:
        """Delete a container from Azure Blob Storage"""
        try:
            if not self.blob_service_client:
                success = self.connect()
                if not success:
                    return False
            
            # Delete container
            self.blob_service_client.delete_container(container_name)
            return True
            
        except ResourceNotFoundError:
            # Container doesn't exist
            logger.warning(f"Azure Blob Storage container '{container_name}' not found")
            return True
        except Exception as e:
            logger.error(f"Failed to delete Azure Blob Storage container '{container_name}': {str(e)}")
            return False
    
    def list_blobs(self, container_name: str, prefix: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """List blobs in an Azure Blob Storage container"""
        try:
            if not self.blob_service_client:
                success = self.connect()
                if not success:
                    return []
            
            # Get container client
            container_client = self.blob_service_client.get_container_client(container_name)
            
            # List blobs
            list_kwargs = {}
            if prefix:
                list_kwargs['name_starts_with'] = prefix
            
            if limit:
                list_kwargs['max_results'] = limit
            
            blob_list = list(container_client.list_blobs(**list_kwargs))
            
            return [
                {
                    'name': blob.name,
                    'size': blob.size,
                    'last_modified': blob.last_modified.isoformat() if blob.last_modified else None,
                    'etag': blob.etag.strip('"') if blob.etag else None,
                    'content_type': blob.content_settings.content_type if blob.content_settings else None,
                    'content_md5': blob.content_settings.content_md5 if blob.content_settings else None,
                    'metadata': blob.metadata
                }
                for blob in blob_list
            ]
            
        except ResourceNotFoundError:
            logger.warning(f"Azure Blob Storage container '{container_name}' not found")
            return []
        except Exception as e:
            logger.error(f"Failed to list blobs in Azure Blob Storage container '{container_name}': {str(e)}")
            return []
    
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
                    expiry_time = datetime.utcnow() + timedelta(hours=expiry_hours)
                    
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