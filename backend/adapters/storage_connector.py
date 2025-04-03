"""
Unified Storage Connector Base Class

This module provides a standardized interface for interacting with different
storage platforms like AWS S3, Azure Blob Storage, and SharePoint.

The StorageConnector abstract base class defines the contract that all storage
connectors must implement, ensuring consistent behavior across different
storage providers.

Implementation Guidelines:
1. All methods should handle exceptions internally and raise appropriate exception types
2. Methods should provide detailed error information when operations fail
3. Connection state should be tracked and accessible via a connection_status property
4. Methods should log operations at appropriate levels (debug, info, warning, error)
5. Container and blob naming conventions should be validated according to provider requirements
"""

from typing import Dict, Any, Optional, List, BinaryIO, Union
import abc
import os
import io
import mimetypes
import logging
import pandas as pd

from utils.error_handling.exceptions import StorageError, ConnectionError, AuthenticationError, OperationError

# Setup logging
logger = logging.getLogger(__name__)


class StorageConnector(abc.ABC):
    """
    Abstract base class for storage platform connectors
    
    This class defines the interface that all storage connectors must implement.
    Storage connectors provide standardized access to different storage systems
    like S3, Azure Blob Storage, SharePoint, etc.
    """
    
    @property
    def connection_status(self) -> Dict[str, Any]:
        """
        Get the current connection status
        
        Returns:
            Dict[str, Any]: Status information including at least:
                - connected: Whether currently connected
                - last_connection_attempt: Timestamp of last connection attempt
                - last_successful_connection: Timestamp of last successful connection
                - connection_errors: List of recent connection errors
        """
        # Subclasses should override this property
        return {
            "connected": False,
            "last_connection_attempt": None,
            "last_successful_connection": None,
            "connection_errors": []
        }
    
    @abc.abstractmethod
    def connect(self) -> bool:
        """
        Establish a connection to the storage platform
        
        Returns:
            bool: True if connection was successful, False otherwise
        """
        pass
    
    @abc.abstractmethod
    def disconnect(self) -> bool:
        """
        Close the connection to the storage platform
        
        Returns:
            bool: True if disconnection was successful, False otherwise
        """
        pass
    
    @abc.abstractmethod
    def test_connection(self) -> Dict[str, Any]:
        """
        Test the connection to the storage platform
        
        Returns:
            Dict[str, Any]: Connection test results with status and details
        """
        pass
    
    @abc.abstractmethod
    def list_containers(self) -> List[Dict[str, Any]]:
        """
        List available containers/buckets in the storage platform
        
        Returns:
            List[Dict[str, Any]]: List of container/bucket details
        """
        pass
    
    @abc.abstractmethod
    def create_container(self, container_name: str) -> bool:
        """
        Create a new container/bucket in the storage platform
        
        Args:
            container_name: Name of the container to create
            
        Returns:
            bool: True if container was created successfully, False otherwise
        """
        pass
    
    @abc.abstractmethod
    def delete_container(self, container_name: str) -> bool:
        """
        Delete a container/bucket from the storage platform
        
        Args:
            container_name: Name of the container to delete
            
        Returns:
            bool: True if container was deleted successfully, False otherwise
        """
        pass
    
    @abc.abstractmethod
    def list_blobs(self, container_name: str, prefix: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        List blobs/objects in a container/bucket
        
        Args:
            container_name: Name of the container to list blobs from
            prefix: Optional prefix to filter blobs
            limit: Optional maximum number of blobs to return
            
        Returns:
            List[Dict[str, Any]]: List of blob details
        """
        pass
    
    @abc.abstractmethod
    def upload_blob(self, container_name: str, blob_name: str, data: Union[bytes, BinaryIO, str], content_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Upload a blob/object to a container/bucket
        
        Args:
            container_name: Name of the container to upload to
            blob_name: Name to give the blob
            data: Content to upload (bytes, file-like object, or string)
            content_type: Optional MIME type of the content
            
        Returns:
            Dict[str, Any]: Upload details
        """
        pass
    
    @abc.abstractmethod
    def download_blob(self, container_name: str, blob_name: str) -> Union[bytes, None]:
        """
        Download a blob/object from a container/bucket
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob to download
            
        Returns:
            bytes: The blob content or None if not found
        """
        pass
    
    @abc.abstractmethod
    def delete_blob(self, container_name: str, blob_name: str) -> bool:
        """
        Delete a blob/object from a container/bucket
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob to delete
            
        Returns:
            bool: True if blob was deleted successfully, False otherwise
        """
        pass
    
    @abc.abstractmethod
    def get_blob_properties(self, container_name: str, blob_name: str) -> Dict[str, Any]:
        """
        Get properties of a blob/object
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob
            
        Returns:
            Dict[str, Any]: Blob properties
        """
        pass
    
    @abc.abstractmethod
    def get_blob_url(self, container_name: str, blob_name: str, expiry_hours: int = 1) -> str:
        """
        Get a URL for accessing a blob/object
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob
            expiry_hours: Number of hours until the URL expires
            
        Returns:
            str: URL for accessing the blob
        """
        pass
    
    #
    # Helper methods implemented for all connectors
    #
    
    def upload_file(self, container_name: str, file_path: str, blob_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Upload a file to storage
        
        Args:
            container_name: Name of the container to upload to
            file_path: Path to the file to upload
            blob_name: Optional name to give the blob (defaults to file basename)
            
        Returns:
            Dict[str, Any]: Upload details
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Use file basename if blob_name not provided
        if not blob_name:
            blob_name = os.path.basename(file_path)
        
        # Determine content type
        content_type, _ = mimetypes.guess_type(file_path)
        
        # Read the file and upload
        with open(file_path, 'rb') as file:
            return self.upload_blob(container_name, blob_name, file, content_type)
    
    def download_file(self, container_name: str, blob_name: str, file_path: str) -> bool:
        """
        Download a blob to a local file
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob to download
            file_path: Path where the file should be saved
            
        Returns:
            bool: True if file was downloaded successfully, False otherwise
        """
        content = self.download_blob(container_name, blob_name)
        
        if content is None:
            return False
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
        
        # Write content to file
        with open(file_path, 'wb') as file:
            file.write(content)
        
        return True
    
    def read_text_blob(self, container_name: str, blob_name: str, encoding: str = 'utf-8') -> Optional[str]:
        """
        Read a text blob into a string
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob to read
            encoding: Text encoding to use
            
        Returns:
            str: The blob content as a string or None if not found
        """
        content = self.download_blob(container_name, blob_name)
        
        if content is None:
            return None
        
        return content.decode(encoding)
    
    def read_csv_blob(self, container_name: str, blob_name: str, **pandas_kwargs) -> Optional[pd.DataFrame]:
        """
        Read a CSV blob into a pandas DataFrame
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob to read
            pandas_kwargs: Additional keyword arguments for pandas.read_csv
            
        Returns:
            pd.DataFrame: DataFrame with the CSV content or None if not found
        """
        content = self.download_blob(container_name, blob_name)
        
        if content is None:
            return None
        
        # Create file-like object from bytes
        file_obj = io.BytesIO(content)
        
        # Read into DataFrame
        return pd.read_csv(file_obj, **pandas_kwargs)
    
    def read_excel_blob(self, container_name: str, blob_name: str, **pandas_kwargs) -> Optional[pd.DataFrame]:
        """
        Read an Excel blob into a pandas DataFrame
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob to read
            pandas_kwargs: Additional keyword arguments for pandas.read_excel
            
        Returns:
            pd.DataFrame: DataFrame with the Excel content or None if not found
        """
        content = self.download_blob(container_name, blob_name)
        
        if content is None:
            return None
        
        # Create file-like object from bytes
        file_obj = io.BytesIO(content)
        
        # Read into DataFrame
        return pd.read_excel(file_obj, **pandas_kwargs)
    
    def read_json_blob(self, container_name: str, blob_name: str, **pandas_kwargs) -> Optional[pd.DataFrame]:
        """
        Read a JSON blob into a pandas DataFrame
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob to read
            pandas_kwargs: Additional keyword arguments for pandas.read_json
            
        Returns:
            pd.DataFrame: DataFrame with the JSON content or None if not found
        """
        content = self.download_blob(container_name, blob_name)
        
        if content is None:
            return None
        
        # Create file-like object from bytes
        file_obj = io.BytesIO(content)
        
        # Read into DataFrame
        return pd.read_json(file_obj, **pandas_kwargs)
    
    def write_dataframe_to_csv(self, container_name: str, blob_name: str, df: pd.DataFrame, **pandas_kwargs) -> Dict[str, Any]:
        """
        Write a pandas DataFrame to a CSV blob
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob to write
            df: DataFrame to write
            pandas_kwargs: Additional keyword arguments for DataFrame.to_csv
            
        Returns:
            Dict[str, Any]: Upload details
        """
        # Create a buffer for the CSV
        csv_buffer = io.StringIO()
        
        # Write DataFrame to buffer
        df.to_csv(csv_buffer, **pandas_kwargs)
        
        # Get CSV as string and encode to bytes
        csv_str = csv_buffer.getvalue()
        csv_bytes = csv_str.encode('utf-8')
        
        # Upload to storage
        return self.upload_blob(container_name, blob_name, csv_bytes, 'text/csv')
    
    def write_dataframe_to_excel(self, container_name: str, blob_name: str, df: pd.DataFrame, **pandas_kwargs) -> Dict[str, Any]:
        """
        Write a pandas DataFrame to an Excel blob
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob to write
            df: DataFrame to write
            pandas_kwargs: Additional keyword arguments for DataFrame.to_excel
            
        Returns:
            Dict[str, Any]: Upload details
        """
        # Create a buffer for the Excel file
        excel_buffer = io.BytesIO()
        
        # Write DataFrame to buffer
        df.to_excel(excel_buffer, **pandas_kwargs)
        
        # Reset buffer position to beginning
        excel_buffer.seek(0)
        
        # Get Excel content as bytes
        excel_bytes = excel_buffer.getvalue()
        
        # Determine content type based on file extension
        if blob_name.endswith('.xlsx'):
            content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        else:
            content_type = 'application/vnd.ms-excel'
        
        # Upload to storage
        return self.upload_blob(container_name, blob_name, excel_bytes, content_type)
    
    def write_dataframe_to_json(self, container_name: str, blob_name: str, df: pd.DataFrame, **pandas_kwargs) -> Dict[str, Any]:
        """
        Write a pandas DataFrame to a JSON blob
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob to write
            df: DataFrame to write
            pandas_kwargs: Additional keyword arguments for DataFrame.to_json
            
        Returns:
            Dict[str, Any]: Upload details
        """
        # Create a buffer for the JSON
        json_buffer = io.StringIO()
        
        # Write DataFrame to buffer
        df.to_json(json_buffer, **pandas_kwargs)
        
        # Get JSON as string and encode to bytes
        json_str = json_buffer.getvalue()
        json_bytes = json_str.encode('utf-8')
        
        # Upload to storage
        return self.upload_blob(container_name, blob_name, json_bytes, 'application/json')
    
    def discover_fields(self, container_name: str, blob_name: str) -> List[Dict[str, str]]:
        """
        Discover fields in a blob by analyzing its content
        
        Args:
            container_name: Name of the container
            blob_name: Name of the blob to analyze
            
        Returns:
            List[Dict[str, str]]: List of discovered fields
        """
        try:
            # Handle different file types
            if blob_name.lower().endswith('.csv'):
                df = self.read_csv_blob(container_name, blob_name, nrows=100)
            elif blob_name.lower().endswith(('.xls', '.xlsx')):
                df = self.read_excel_blob(container_name, blob_name, nrows=100)
            elif blob_name.lower().endswith('.json'):
                df = self.read_json_blob(container_name, blob_name)
            else:
                # For unsupported file types
                logger.warning(f"Unsupported file type for field discovery: {blob_name}")
                return []
            
            if df is None or df.empty:
                logger.info(f"No data found in {blob_name} for field discovery")
                return []
            
            # Analyze DataFrame to discover fields
            fields = []
            for column in df.columns:
                # Try to infer type from data
                dtype = df[column].dtype
                sample = df[column].iloc[0] if not df[column].empty else None
                
                if pd.api.types.is_numeric_dtype(dtype):
                    if pd.api.types.is_integer_dtype(dtype):
                        field_type = 'integer'
                    else:
                        field_type = 'number'
                elif pd.api.types.is_bool_dtype(dtype):
                    field_type = 'boolean'
                elif pd.api.types.is_datetime64_dtype(dtype):
                    field_type = 'datetime'
                else:
                    # Check for date strings
                    if isinstance(sample, str) and (
                        len(sample) >= 10 and
                        (sample[4:5] == '-' and sample[7:8] == '-' or  # YYYY-MM-DD
                         sample[2:3] == '/' and sample[5:6] == '/')    # MM/DD/YYYY
                    ):
                        field_type = 'date'
                    else:
                        field_type = 'string'
                
                fields.append({
                    'name': column,
                    'type': field_type,
                    'description': f'Field {column}'
                })
            
            logger.info(f"Discovered {len(fields)} fields in {blob_name}")
            return fields
        except Exception as e:
            logger.error(f"Error discovering fields in {blob_name}: {str(e)}")
            # Return empty list rather than raising an exception to allow graceful fallback
            return []

    def __enter__(self):
        """
        Enter context manager - connect to the storage service
        
        Returns:
            StorageConnector: Self
            
        Raises:
            ConnectionError: If connection fails
        """
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Exit context manager - disconnect from the storage service
        
        Args:
            exc_type: Exception type
            exc_val: Exception value
            exc_tb: Exception traceback
        """
        self.disconnect()