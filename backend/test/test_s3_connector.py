"""
Test suite for the S3 connector mock implementation.

This test suite covers the S3 connector mock functionality using the storage testing framework.
"""

import pytest
import os
import io
from datetime import datetime

from test_adapters.entity_registry import EntityRegistry
from test_adapters.storage_test_framework import StorageTestBase
from test_adapters.s3_connector import S3Connector


class TestS3Connector(StorageTestBase):
    """Test the S3 connector implementation."""
    
    def create_adapter(self, storage_provider):
        """Create an S3 connector with the given storage provider."""
        # Create a new registry for this test
        registry = EntityRegistry()
        # Create connector with the provider and registry
        connector = S3Connector(registry=registry)
        # Replace the internal provider with our test provider
        connector.provider = storage_provider
        return connector
    
    def test_s3_specific_bucket_creation(self):
        """Test S3-specific bucket creation response format."""
        # Create a bucket
        result = self.adapter.create_container("new-test-bucket")
        
        # Verify S3-specific response format
        assert result["success"] is True
        assert result["bucket"] == "new-test-bucket"
        assert "location" in result
        assert "s3.amazonaws.com" in result["location"]
    
    def test_s3_file_url_generation(self):
        """Test generation of pre-signed URLs."""
        # Create a test file
        self.create_test_file(path="url_test.txt")
        
        # Generate a pre-signed URL
        result = self.adapter.get_file_url(
            container_name=self.test_container,
            file_path="url_test.txt",
            expires_in=3600
        )
        
        # Verify URL generation
        assert result["success"] is True
        assert "url" in result
        assert "s3.amazonaws.com" in result["url"]
        assert "AWSAccessKeyId" in result["url"]
        assert "Signature" in result["url"]
        assert result["expires_in"] == 3600
    
    def test_s3_copy_operation(self):
        """Test S3 copy operation."""
        # Create a test file
        self.create_test_file(path="source.txt")
        
        # Create another bucket
        self.mock_storage.create_container("target-bucket")
        
        # Copy the file
        result = self.adapter.copy_file(
            source_bucket=self.test_container,
            source_key="source.txt",
            target_bucket="target-bucket",
            target_key="target.txt"
        )
        
        # Verify copy response
        assert result["success"] is True
        assert result["source_key"] == "source.txt"
        assert result["target_key"] == "target.txt"
        assert result["source_bucket"] == self.test_container
        assert result["target_bucket"] == "target-bucket"
        assert "etag" in result
        
        # Verify the file was copied
        download_result = self.mock_storage.download_file(
            container_name="target-bucket",
            file_path="target.txt"
        )
        assert download_result["success"] is True
    
    def test_upload_from_file_object(self):
        """Test uploading from a file-like object."""
        # Create a file-like object
        file_obj = io.BytesIO(b"File object content")
        
        # Upload the file
        result = self.adapter.upload_file(
            container_name=self.test_container,
            file_path="file_obj.txt",
            content=file_obj
        )
        
        # Verify upload
        assert result["success"] is True
        assert result["key"] == "file_obj.txt"
        
        # Verify content
        download_result = self.mock_storage.download_file(
            container_name=self.test_container,
            file_path="file_obj.txt"
        )
        assert download_result["success"] is True
        assert download_result["content"] == b"File object content"
    
    def test_s3_list_files_format(self):
        """Test S3-specific list files response format."""
        # Create some test files
        self.create_test_file(path="test1.txt")
        self.create_test_file(path="test2.txt")
        
        # List files
        result = self.adapter.list_files(
            container_name=self.test_container
        )
        
        # Verify S3-specific response format
        assert result["success"] is True
        assert "contents" in result
        assert len(result["contents"]) == 2
        assert "Key" in result["contents"][0]
        assert "Size" in result["contents"][0]
        assert "LastModified" in result["contents"][0]
        assert "ETag" in result["contents"][0]
        assert "StorageClass" in result["contents"][0]
    
    def test_error_handling(self):
        """Test error handling in the S3 connector."""
        # Create a file first so we don't get "File not found" error
        self.create_test_file(path="error_test.txt", content=b"Error test content")
        
        # Configure the mock provider to simulate errors
        self.mock_storage.simulate_error("download_file", "Simulated error")
        
        # Try to download the existing file
        result = self.adapter.download_file(
            container_name=self.test_container,
            file_path="error_test.txt"
        )
        
        # Verify error response
        assert result["success"] is False
        assert "Simulated error" in result["error"]
        
        # Clear error simulation
        self.mock_storage.clear_error_simulation()
    
    def test_s3_metadata_handling(self):
        """Test handling of S3 metadata."""
        # Create a file with metadata
        metadata = {
            "custom1": "value1",
            "custom2": "value2"
        }
        
        result = self.adapter.upload_file(
            container_name=self.test_container,
            file_path="metadata_test.txt",
            content=b"Metadata test content",
            metadata=metadata
        )
        
        # Verify metadata in upload response
        assert result["success"] is True
        assert result["metadata"] == metadata
        
        # Download file and verify metadata
        download_result = self.adapter.download_file(
            container_name=self.test_container,
            file_path="metadata_test.txt"
        )
        
        assert download_result["success"] is True
        assert download_result["metadata"] == metadata