"""
S3 connector mock implementation for testing.

This module provides a mock S3 connector for testing without AWS dependencies.
"""

from typing import Dict, List, Any, Optional, Union, BinaryIO
import uuid
import logging

from .storage_test_framework import BaseStorageAdapter, MockStorageProvider

# Set up logging
logger = logging.getLogger("s3_connector")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)


class S3Connector(BaseStorageAdapter):
    """
    Mock S3 connector for testing.
    
    This class provides a mock implementation of the S3 connector for testing.
    """
    
    def __init__(self, registry=None):
        """
        Initialize the S3 connector.
        
        Args:
            registry: Entity registry to use
        """
        super().__init__(registry, MockStorageProvider(provider_type="s3"))
        self.credentials = {
            "access_key": "mock_access_key",
            "secret_key": "mock_secret_key",
            "region": "us-east-1"
        }
        logger.info("S3Connector initialized")
    
    def create_container(self, container_name: str) -> Dict[str, Any]:
        """
        Create a new S3 bucket.
        
        Args:
            container_name: Name of the bucket to create
            
        Returns:
            Result dictionary with success status
        """
        result = self.provider.create_container(container_name)
        if result["success"]:
            # Format bucket creation response to match AWS S3
            return {
                "success": True,
                "bucket": container_name,
                "location": f"http://{container_name}.s3.amazonaws.com/"
            }
        return result
    
    def delete_container(self, container_name: str) -> Dict[str, Any]:
        """
        Delete an S3 bucket.
        
        Args:
            container_name: Name of the bucket to delete
            
        Returns:
            Result dictionary with success status
        """
        result = self.provider.delete_container(container_name)
        if result["success"]:
            # Format bucket deletion response to match AWS S3
            return {
                "success": True,
                "message": f"Bucket {container_name} deleted successfully"
            }
        return result
    
    def list_containers(self) -> Dict[str, Any]:
        """
        List all S3 buckets.
        
        Returns:
            Result dictionary with bucket list
        """
        result = self.provider.list_containers()
        if result["success"]:
            # Format bucket list response to match AWS S3
            buckets = []
            for bucket_name in result["containers"]:
                buckets.append({
                    "Name": bucket_name,
                    "CreationDate": "2025-04-15T12:00:00Z"  # Mock creation date
                })
            return {
                "success": True,
                "buckets": buckets
            }
        return result
    
    def upload_file(self, container_name: str, file_path: str, 
                   content: Union[bytes, BinaryIO],
                   content_type: str = "application/octet-stream",
                   metadata: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Upload a file to an S3 bucket.
        
        Args:
            container_name: Name of the bucket
            file_path: Key to store the file under
            content: File content as bytes or file-like object
            content_type: MIME type of the file
            metadata: Additional file metadata
            
        Returns:
            Result dictionary with success status
        """
        # Convert file-like object to bytes if needed
        if hasattr(content, 'read'):
            content = content.read()
        
        result = self.provider.upload_file(
            container_name=container_name,
            file_path=file_path,
            content=content,
            content_type=content_type,
            metadata=metadata
        )
        
        if result["success"]:
            # Format upload response to match AWS S3
            etag = f'"{uuid.uuid4().hex}"'  # Mock ETag
            return {
                "success": True,
                "key": file_path,
                "bucket": container_name,
                "etag": etag,
                "location": f"https://{container_name}.s3.amazonaws.com/{file_path}",
                "content_type": content_type,
                "metadata": metadata or {}
            }
        return result
    
    def download_file(self, container_name: str, file_path: str) -> Dict[str, Any]:
        """
        Download a file from an S3 bucket.
        
        Args:
            container_name: Name of the bucket
            file_path: Key of the file to download
            
        Returns:
            Result dictionary with file content and metadata
        """
        result = self.provider.download_file(
            container_name=container_name,
            file_path=file_path
        )
        
        if result["success"]:
            # Format download response to match AWS S3
            return {
                "success": True,
                "content": result["content"],
                "key": file_path,
                "bucket": container_name,
                "content_type": result["content_type"],
                "metadata": result["metadata"],
                "last_modified": result["last_modified"],
                "content_length": result["size"]
            }
        # Simply pass through the error result from the provider
        return result
    
    def delete_file(self, container_name: str, file_path: str) -> Dict[str, Any]:
        """
        Delete a file from an S3 bucket.
        
        Args:
            container_name: Name of the bucket
            file_path: Key of the file to delete
            
        Returns:
            Result dictionary with success status
        """
        result = self.provider.delete_file(
            container_name=container_name,
            file_path=file_path
        )
        
        if result["success"]:
            # Format delete response to match AWS S3
            return {
                "success": True,
                "key": file_path,
                "bucket": container_name,
                "message": f"Object {file_path} deleted from bucket {container_name}"
            }
        return result
    
    def list_files(self, container_name: str, prefix: str = "") -> Dict[str, Any]:
        """
        List files in an S3 bucket with optional prefix.
        
        Args:
            container_name: Name of the bucket
            prefix: Optional prefix to filter objects
            
        Returns:
            Result dictionary with file list
        """
        result = self.provider.list_files(
            container_name=container_name,
            prefix=prefix
        )
        
        if result["success"]:
            # Format list response to match AWS S3
            contents = []
            for file_info in result["files"]:
                contents.append({
                    "Key": file_info["path"],
                    "Size": file_info["size"],
                    "LastModified": file_info["last_modified"],
                    "ETag": f'"{uuid.uuid4().hex}"',  # Mock ETag
                    "StorageClass": "STANDARD"
                })
            
            # Return both files and contents for compatibility
            return {
                "success": True,
                "contents": contents,
                "files": result["files"],  # Include original files array for compatibility
                "bucket": container_name,
                "prefix": prefix,
                "is_truncated": False,
                "max_keys": 1000
            }
        return result
    
    def get_file_url(self, container_name: str, file_path: str, 
                     expires_in: int = 3600) -> Dict[str, Any]:
        """
        Generate a pre-signed URL for an S3 object.
        
        Args:
            container_name: Name of the bucket
            file_path: Key of the file
            expires_in: URL expiration time in seconds
            
        Returns:
            Result dictionary with pre-signed URL
        """
        # Check if file exists
        file_result = self.provider.get_file_metadata(
            container_name=container_name,
            file_path=file_path
        )
        
        if not file_result["success"]:
            return file_result
        
        # Generate mock pre-signed URL
        url = f"https://{container_name}.s3.amazonaws.com/{file_path}?AWSAccessKeyId=mock_access_key&Expires=1714503272&Signature=mock_signature"
        
        return {
            "success": True,
            "url": url,
            "expires_in": expires_in,
            "key": file_path,
            "bucket": container_name
        }
    
    def copy_file(self, source_bucket: str, source_key: str, 
                 target_bucket: str, target_key: str) -> Dict[str, Any]:
        """
        Copy a file from one location to another within S3.
        
        Args:
            source_bucket: Source bucket name
            source_key: Source object key
            target_bucket: Target bucket name
            target_key: Target object key
            
        Returns:
            Result dictionary with success status
        """
        result = self.provider.copy_file(
            source_container=source_bucket,
            source_path=source_key,
            target_container=target_bucket,
            target_path=target_key
        )
        
        if result["success"]:
            # Format copy response to match AWS S3
            return {
                "success": True,
                "source_key": source_key,
                "target_key": target_key,
                "source_bucket": source_bucket,
                "target_bucket": target_bucket,
                "etag": f'"{uuid.uuid4().hex}"',  # Mock ETag
                "copy_source": f"{source_bucket}/{source_key}"
            }
        return result