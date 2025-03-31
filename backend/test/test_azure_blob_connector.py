"""
Unit tests for the Azure Blob Storage connector mock.

This test suite verifies that the mock Azure Blob Storage connector 
properly implements all required functionality for testing.
"""

import pytest
import io
from datetime import datetime, timedelta, timezone
import uuid

from test_adapters.azure_blob_connector import AzureBlobConnector
from test_adapters.storage_test_framework import MockStorageProvider
from test_adapters.entity_registry import EntityRegistry


class TestAzureBlobConnector:
    """Test suite for the Azure Blob Storage connector mock."""
    
    @pytest.fixture
    def registry(self):
        """Create a new registry for testing."""
        return EntityRegistry(debug=True)
    
    @pytest.fixture
    def conn(self, registry):
        """Create a new Azure Blob connector for testing."""
        return AzureBlobConnector(
            registry=registry,
            account_name="testaccount",
            account_key="test_key",
            account_url="https://testaccount.blob.core.windows.net",
            container_name="testcontainer"
        )
    
    @pytest.fixture
    def setup_test_container(self, conn):
        """Setup a test container with blobs."""
        conn.connect()
        conn.create_container("testcontainer")
        conn.upload_blob("testcontainer", "testblob.txt", b"Test content")
        conn.upload_blob("testcontainer", "testblob.json", '{"name": "Test", "value": 123}')
        yield
        conn.delete_container("testcontainer")
    
    def test_initialization(self, conn):
        """Test that the connector is properly initialized."""
        # Check default values
        assert conn.account_name == "testaccount"
        assert conn.account_key == "test_key"
        assert conn.account_url == "https://testaccount.blob.core.windows.net"
        assert conn.default_container == "testcontainer"
        assert not conn.is_connected
        assert not conn.error_mode
        assert conn.error_type is None
        
        # Check that storage provider is initialized
        assert isinstance(conn.storage, MockStorageProvider)
    
    def test_connect_disconnect(self, conn):
        """Test connecting and disconnecting."""
        # Test connect
        result = conn.connect()
        assert result is True
        assert conn.is_connected is True
        
        # Test disconnect
        result = conn.disconnect()
        assert result is True
        assert conn.is_connected is False
    
    def test_connection_error(self, conn):
        """Test connection error handling."""
        # Set error mode
        conn.set_error_mode(True, "connection")
        
        # Test connect with error
        result = conn.connect()
        assert result is False
        assert conn.is_connected is False
        
        # Test test_connection with error
        result = conn.test_connection()
        assert result["status"] == "error"
        assert "Failed to connect" in result["message"]
        
        # Disable error mode
        conn.set_error_mode(False)
    
    def test_test_connection(self, conn):
        """Test connection testing."""
        # Connect and test connection
        conn.connect()
        result = conn.test_connection()
        
        # Check result
        assert result["status"] == "success"
        assert "Connection successful" in result["message"]
        assert "containers" in result
    
    def test_container_operations(self, conn):
        """Test container operations."""
        # Connect
        conn.connect()
        
        # Test create container
        result = conn.create_container("testcontainer")
        assert result is True
        
        # Test list containers
        containers = conn.list_containers()
        assert len(containers) == 1
        assert containers[0]["name"] == "testcontainer"
        
        # Test container already exists
        result = conn.create_container("testcontainer")
        assert result is True  # Should succeed for existing container
        
        # Test delete container
        result = conn.delete_container("testcontainer")
        assert result is True
        
        # Test list after delete
        containers = conn.list_containers()
        assert len(containers) == 0
        
        # Test delete non-existent container
        result = conn.delete_container("nonexistentcontainer")
        assert result is True  # Should succeed for non-existent container
    
    def test_container_error_handling(self, conn):
        """Test container operation error handling."""
        # Connect
        conn.connect()
        
        # Test create container error
        conn.set_error_mode(True, "create_container")
        result = conn.create_container("errorcontainer")
        assert result is False
        
        # Test list containers error
        conn.set_error_mode(True, "list_containers")
        containers = conn.list_containers()
        assert len(containers) == 0
        
        # Test delete container error
        conn.set_error_mode(True, "delete_container")
        result = conn.delete_container("errorcontainer")
        assert result is False
        
        # Disable error mode
        conn.set_error_mode(False)
    
    def test_blob_operations(self, conn, setup_test_container):
        """Test blob operations."""
        # Test list blobs
        blobs = conn.list_blobs("testcontainer")
        assert len(blobs) == 2
        
        # Verify blob properties
        assert any(b["name"] == "testblob.txt" for b in blobs)
        assert any(b["name"] == "testblob.json" for b in blobs)
        
        # Test download blob
        content = conn.download_blob("testcontainer", "testblob.txt")
        assert content == b"Test content"
        
        # Test get blob properties
        props = conn.get_blob_properties("testcontainer", "testblob.txt")
        assert props["name"] == "testblob.txt"
        assert props["size"] == len(b"Test content")
        assert props["content_type"] == "text/plain"
        
        # Test delete blob
        result = conn.delete_blob("testcontainer", "testblob.txt")
        assert result is True
        
        # Verify blob was deleted
        blobs = conn.list_blobs("testcontainer")
        assert len(blobs) == 1
        assert blobs[0]["name"] == "testblob.json"
        
        # Test delete non-existent blob
        result = conn.delete_blob("testcontainer", "nonexistentblob")
        assert result is True  # Should succeed for non-existent blob
    
    def test_blob_error_handling(self, conn, setup_test_container):
        """Test blob operation error handling."""
        # Test list blobs error
        conn.set_error_mode(True, "list_blobs")
        blobs = conn.list_blobs("testcontainer")
        assert len(blobs) == 0
        
        # Test upload blob error
        conn.set_error_mode(True, "upload_blob")
        result = conn.upload_blob("testcontainer", "errorblob", b"Error content")
        assert result["status"] == "error"
        
        # Test download blob error
        conn.set_error_mode(True, "download_blob")
        content = conn.download_blob("testcontainer", "testblob.txt")
        assert content is None
        
        # Test delete blob error
        conn.set_error_mode(True, "delete_blob")
        result = conn.delete_blob("testcontainer", "testblob.txt")
        assert result is False
        
        # Test get blob properties error
        conn.set_error_mode(True, "get_blob_properties")
        props = conn.get_blob_properties("testcontainer", "testblob.txt")
        assert props == {}
        
        # Disable error mode
        conn.set_error_mode(False)
    
    def test_blob_upload_with_different_data_types(self, conn):
        """Test uploading blobs with different data types."""
        # Connect and create container
        conn.connect()
        conn.create_container("typescontainer")
        
        # Test bytes data
        result1 = conn.upload_blob("typescontainer", "bytesblob", b"Bytes content")
        assert result1["status"] == "success"
        
        # Test string data
        result2 = conn.upload_blob("typescontainer", "stringblob", "String content")
        assert result2["status"] == "success"
        
        # Test file-like object data
        file_obj = io.BytesIO(b"File-like content")
        result3 = conn.upload_blob("typescontainer", "fileblob", file_obj)
        assert result3["status"] == "success"
        
        # Verify the contents
        content1 = conn.download_blob("typescontainer", "bytesblob")
        assert content1 == b"Bytes content"
        
        content2 = conn.download_blob("typescontainer", "stringblob")
        assert content2 == b"String content"
        
        content3 = conn.download_blob("typescontainer", "fileblob")
        assert content3 == b"File-like content"
        
        # Clean up
        conn.delete_container("typescontainer")
    
    def test_get_blob_url(self, conn, setup_test_container):
        """Test getting blob URL."""
        # Get blob URL
        url = conn.get_blob_url("testcontainer", "testblob.txt")
        
        # Verify URL contains the expected components
        assert "https://testaccount.blob.core.windows.net" in url
        assert "testcontainer" in url
        assert "testblob.txt" in url
        assert "sp=r" in url  # SAS token parameter
        assert "sig=mock_signature" in url  # Signature parameter
        
        # Test with non-existent container
        url = conn.get_blob_url("nonexistentcontainer", "testblob.txt")
        assert url == ""
        
        # Test with non-existent blob
        url = conn.get_blob_url("testcontainer", "nonexistentblob")
        assert url == ""
        
        # Test with error
        conn.set_error_mode(True, "get_blob_url")
        url = conn.get_blob_url("testcontainer", "testblob.txt")
        assert url == ""
        
        # Disable error mode
        conn.set_error_mode(False)
    
    def test_list_blobs_with_prefix(self, conn):
        """Test listing blobs with prefix filter."""
        # Connect and create container
        conn.connect()
        conn.create_container("prefixcontainer")
        
        # Upload blobs with different prefixes
        conn.upload_blob("prefixcontainer", "a/blob1.txt", b"A blob 1")
        conn.upload_blob("prefixcontainer", "a/blob2.txt", b"A blob 2")
        conn.upload_blob("prefixcontainer", "b/blob1.txt", b"B blob 1")
        conn.upload_blob("prefixcontainer", "c/blob1.txt", b"C blob 1")
        
        # List all blobs
        all_blobs = conn.list_blobs("prefixcontainer")
        assert len(all_blobs) == 4
        
        # List blobs with prefix "a/"
        a_blobs = conn.list_blobs("prefixcontainer", prefix="a/")
        assert len(a_blobs) == 2
        assert all(b["name"].startswith("a/") for b in a_blobs)
        
        # List blobs with prefix "b/"
        b_blobs = conn.list_blobs("prefixcontainer", prefix="b/")
        assert len(b_blobs) == 1
        assert b_blobs[0]["name"] == "b/blob1.txt"
        
        # List blobs with non-existent prefix
        no_blobs = conn.list_blobs("prefixcontainer", prefix="nonexistent/")
        assert len(no_blobs) == 0
        
        # Clean up
        conn.delete_container("prefixcontainer")
    
    def test_list_blobs_with_limit(self, conn):
        """Test listing blobs with result limit."""
        # Connect and create container
        conn.connect()
        conn.create_container("limitcontainer")
        
        # Upload multiple blobs
        for i in range(10):
            conn.upload_blob("limitcontainer", f"blob{i}.txt", f"Content {i}".encode())
        
        # List with limit of 5
        blobs = conn.list_blobs("limitcontainer", limit=5)
        assert len(blobs) <= 5
        
        # List with limit of 1
        blobs = conn.list_blobs("limitcontainer", limit=1)
        assert len(blobs) == 1
        
        # List with limit of 0 (should return all)
        blobs = conn.list_blobs("limitcontainer", limit=0)
        assert len(blobs) == 10
        
        # Clean up
        conn.delete_container("limitcontainer")
    
    def test_reset_method(self, conn, setup_test_container):
        """Test that the reset method clears all state."""
        # Verify container and blobs exist
        blobs = conn.list_blobs("testcontainer")
        assert len(blobs) == 2
        
        # Reset the connector
        conn.reset()
        
        # Verify state is reset
        assert not conn.is_connected
        assert not conn.error_mode
        assert conn.error_type is None
        
        # Connect again
        conn.connect()
        
        # Verify storage is reset
        containers = conn.list_containers()
        assert len(containers) == 0