"""
Azure Blob Storage Adapter

This module provides an adapter for working with Azure Blob Storage,
including CSV file processing capabilities.
"""

from typing import Dict, Any, Optional, List, Union
import logging
import io
import csv
import pandas as pd
from datetime import datetime

# Import Azure Storage SDK - we'll try to support both azure-storage-blob and the newer azure.storage.blob
try:
    # New Azure SDK
    from azure.storage.blob import BlobServiceClient, ContainerClient
    from azure.core.exceptions import ResourceNotFoundError, ServiceRequestError
    AZURE_SDK_AVAILABLE = True
except ImportError:
    try:
        # Legacy Azure SDK
        from azure.storage.blob import BlockBlobService
        AZURE_SDK_AVAILABLE = True
    except ImportError:
        AZURE_SDK_AVAILABLE = False
        logging.warning("Azure Storage SDK not available. Install with: pip install azure-storage-blob")

logger = logging.getLogger(__name__)

class BlobStorageAdapter:
    """Adapter for Azure Blob Storage operations with CSV support"""
    
    def __init__(
        self,
        connection_string: Optional[str] = None,
        account_name: Optional[str] = None,
        account_key: Optional[str] = None,
        sas_token: Optional[str] = None,
        container_name: str = None,
        auth_method: str = "connection_string"
    ):
        """
        Initialize the Azure Blob Storage adapter
        
        Args:
            connection_string: Azure Storage connection string
            account_name: Azure Storage account name (if not using connection string)
            account_key: Azure Storage account key (if using account_key auth)
            sas_token: Azure Storage SAS token (if using sas_token auth)
            container_name: Name of the container
            auth_method: Authentication method (connection_string, account_key, sas_token, managed_identity)
        """
        if not AZURE_SDK_AVAILABLE:
            raise ImportError("Azure Storage SDK not available. Install with: pip install azure-storage-blob")
        
        self.container_name = container_name
        self.auth_method = auth_method
        self.blob_service_client = None
        self.container_client = None
        
        # Set up the client based on authentication method
        if auth_method == "connection_string" and connection_string:
            try:
                # New Azure SDK
                self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
                self.container_client = self.blob_service_client.get_container_client(container_name)
            except NameError:
                # Legacy Azure SDK
                self.blob_service_client = BlockBlobService(connection_string=connection_string)
        
        elif auth_method == "account_key" and account_name and account_key:
            try:
                # New Azure SDK
                account_url = f"https://{account_name}.blob.core.windows.net"
                self.blob_service_client = BlobServiceClient(account_url=account_url, credential=account_key)
                self.container_client = self.blob_service_client.get_container_client(container_name)
            except NameError:
                # Legacy Azure SDK
                self.blob_service_client = BlockBlobService(account_name=account_name, account_key=account_key)
                
        elif auth_method == "sas_token" and account_name and sas_token:
            try:
                # New Azure SDK
                account_url = f"https://{account_name}.blob.core.windows.net{sas_token}"
                self.blob_service_client = BlobServiceClient(account_url=account_url)
                self.container_client = self.blob_service_client.get_container_client(container_name)
            except NameError:
                # Legacy Azure SDK
                self.blob_service_client = BlockBlobService(account_name=account_name, sas_token=sas_token)
                
        elif auth_method == "managed_identity" and account_name:
            try:
                # New Azure SDK - requires DefaultAzureCredential
                from azure.identity import DefaultAzureCredential
                account_url = f"https://{account_name}.blob.core.windows.net"
                self.blob_service_client = BlobServiceClient(account_url=account_url, credential=DefaultAzureCredential())
                self.container_client = self.blob_service_client.get_container_client(container_name)
            except ImportError:
                raise ImportError("Azure Identity package not available. Install with: pip install azure-identity")
        else:
            raise ValueError("Invalid authentication method or missing required parameters")
    
    def list_blobs(self, prefix: Optional[str] = None) -> List[str]:
        """
        List all blobs in the container with optional prefix
        
        Args:
            prefix: Optional prefix to filter blobs
            
        Returns:
            List[str]: List of blob names
        """
        try:
            # New Azure SDK
            if hasattr(self, 'container_client') and self.container_client:
                blobs = self.container_client.list_blobs(name_starts_with=prefix)
                return [blob.name for blob in blobs]
            
            # Legacy Azure SDK
            elif hasattr(self, 'blob_service_client') and hasattr(self.blob_service_client, 'list_blobs'):
                blobs = self.blob_service_client.list_blobs(
                    container_name=self.container_name,
                    prefix=prefix
                )
                return [blob.name for blob in blobs]
            
            return []
        except Exception as e:
            logger.error(f"Error listing blobs: {str(e)}")
            return []
    
    def read_blob(self, blob_name: str) -> Optional[bytes]:
        """
        Read a blob's content
        
        Args:
            blob_name: Name of the blob to read
            
        Returns:
            Optional[bytes]: Blob content as bytes or None if error
        """
        try:
            # New Azure SDK
            if hasattr(self, 'container_client') and self.container_client:
                blob_client = self.container_client.get_blob_client(blob_name)
                return blob_client.download_blob().readall()
            
            # Legacy Azure SDK
            elif hasattr(self, 'blob_service_client') and hasattr(self.blob_service_client, 'get_blob_to_bytes'):
                return self.blob_service_client.get_blob_to_bytes(
                    container_name=self.container_name,
                    blob_name=blob_name
                ).content
            
            return None
        except Exception as e:
            logger.error(f"Error reading blob {blob_name}: {str(e)}")
            return None
    
    def write_blob(self, blob_name: str, data: Union[str, bytes]) -> bool:
        """
        Write data to a blob
        
        Args:
            blob_name: Name of the blob to write
            data: Data to write (string or bytes)
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Convert string to bytes if needed
            if isinstance(data, str):
                data = data.encode('utf-8')
                
            # New Azure SDK
            if hasattr(self, 'container_client') and self.container_client:
                blob_client = self.container_client.get_blob_client(blob_name)
                blob_client.upload_blob(data, overwrite=True)
                return True
            
            # Legacy Azure SDK
            elif hasattr(self, 'blob_service_client') and hasattr(self.blob_service_client, 'create_blob_from_bytes'):
                self.blob_service_client.create_blob_from_bytes(
                    container_name=self.container_name,
                    blob_name=blob_name,
                    blob=data
                )
                return True
            
            return False
        except Exception as e:
            logger.error(f"Error writing blob {blob_name}: {str(e)}")
            return False
    
    def read_csv_blob(
        self,
        blob_name: str,
        delimiter: str = ',',
        encoding: str = 'utf-8',
        header: Union[int, None] = 0
    ) -> Optional[pd.DataFrame]:
        """
        Read a CSV blob into a pandas DataFrame
        
        Args:
            blob_name: Name of the blob to read
            delimiter: CSV delimiter character
            encoding: File encoding
            header: Row number to use as header (0-indexed), None means no header
            
        Returns:
            Optional[pd.DataFrame]: DataFrame or None if error
        """
        try:
            # Get blob content
            content = self.read_blob(blob_name)
            if not content:
                return None
            
            # Convert to string
            text_content = content.decode(encoding)
            
            # Use pandas to read CSV
            return pd.read_csv(
                io.StringIO(text_content),
                delimiter=delimiter,
                header=header
            )
        except Exception as e:
            logger.error(f"Error reading CSV blob {blob_name}: {str(e)}")
            return None
    
    def write_csv_blob(
        self,
        data: pd.DataFrame,
        blob_name: str,
        delimiter: str = ',',
        encoding: str = 'utf-8',
        include_header: bool = True
    ) -> bool:
        """
        Write DataFrame to a CSV blob
        
        Args:
            data: DataFrame to write
            blob_name: Name of the blob to write
            delimiter: CSV delimiter character
            encoding: File encoding
            include_header: Whether to include column headers
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Convert DataFrame to CSV string
            csv_buffer = io.StringIO()
            data.to_csv(
                csv_buffer,
                sep=delimiter,
                index=False,
                header=include_header
            )
            
            # Write to blob
            return self.write_blob(blob_name, csv_buffer.getvalue())
        except Exception as e:
            logger.error(f"Error writing CSV blob {blob_name}: {str(e)}")
            return False
    
    def discover_fields(self, blob_name: Optional[str] = None) -> List[Dict[str, str]]:
        """
        Discover fields from CSV file structure
        
        Args:
            blob_name: Name of a specific blob to analyze. If None, finds the first CSV.
            
        Returns:
            List[Dict[str, str]]: Discovered fields
        """
        try:
            # Find a CSV file if none specified
            if not blob_name:
                csv_blobs = [b for b in self.list_blobs() if b.lower().endswith('.csv')]
                if not csv_blobs:
                    logger.warning("No CSV files found in container")
                    return []
                blob_name = csv_blobs[0]
            
            # Read just a few rows to analyze structure
            df = self.read_csv_blob(blob_name)
            if df is None or df.empty:
                return []
            
            # Get column info
            fields = []
            for col in df.columns:
                # Determine column type based on data
                col_data = df[col]
                if col_data.empty:
                    col_type = "string"
                else:
                    try:
                        if pd.api.types.is_integer_dtype(col_data.dtype):
                            col_type = "integer"
                        elif pd.api.types.is_float_dtype(col_data.dtype):
                            col_type = "number"
                        elif pd.api.types.is_bool_dtype(col_data.dtype):
                            col_type = "boolean"
                        elif pd.api.types.is_datetime64_dtype(col_data.dtype):
                            col_type = "datetime"
                        elif pd.api.types.is_object_dtype(col_data.dtype):
                            # Try to detect date strings
                            if all(isinstance(x, str) and self._is_date_string(x) for x in col_data.dropna().head(5)):
                                col_type = "date"
                            else:
                                col_type = "string"
                        else:
                            col_type = "string"
                    except:
                        col_type = "string"
                
                fields.append({
                    "name": col,
                    "type": col_type,
                    "description": f"Column {col} from {blob_name}"
                })
            
            return fields
        except Exception as e:
            logger.error(f"Error discovering fields: {str(e)}")
            return []
    
    def _is_date_string(self, text: str) -> bool:
        """
        Check if a string looks like a date
        
        Args:
            text: String to check
            
        Returns:
            bool: True if it looks like a date
        """
        try:
            pd.to_datetime(text)
            return True
        except:
            return False
    
    def get_container_properties(self) -> Optional[Dict[str, Any]]:
        """
        Get container properties
        
        Returns:
            Optional[Dict[str, Any]]: Container properties or None if error
        """
        try:
            # New Azure SDK
            if hasattr(self, 'container_client') and self.container_client:
                props = self.container_client.get_container_properties()
                return {
                    "name": self.container_name,
                    "last_modified": props.last_modified,
                    "etag": props.etag,
                    "lease_status": props.lease.status,
                    "lease_state": props.lease.state
                }
            
            # Legacy Azure SDK
            elif hasattr(self, 'blob_service_client') and hasattr(self.blob_service_client, 'get_container_properties'):
                props = self.blob_service_client.get_container_properties(self.container_name)
                return {
                    "name": self.container_name,
                    "last_modified": props.properties.last_modified,
                    "etag": props.properties.etag,
                    "lease_status": props.properties.lease.status,
                    "lease_state": props.properties.lease.state
                }
            
            return None
        except Exception as e:
            logger.error(f"Error getting container properties: {str(e)}")
            return None
    
    def test_connection(self) -> Dict[str, Any]:
        """
        Test the connection to the blob storage
        
        Returns:
            Dict[str, Any]: Test results including success status
        """
        try:
            # Try to get container properties
            props = self.get_container_properties()
            if not props:
                return {
                    "success": False,
                    "message": "Could not get container properties"
                }
            
            # Count blobs
            blobs = self.list_blobs()
            
            return {
                "success": True,
                "message": f"Successfully connected to container {self.container_name}",
                "container": props,
                "blobs": len(blobs),
                "csv_files": len([b for b in blobs if b.lower().endswith('.csv')])
            }
        except Exception as e:
            logger.error(f"Connection test failed: {str(e)}")
            return {
                "success": False,
                "message": f"Connection test failed: {str(e)}"
            }