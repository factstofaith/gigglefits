"""
Unit tests for the SharePoint connector mock.

Tests both standard operations and error handling for the mock SharePoint connector.
"""

import pytest
from datetime import datetime, timezone
import uuid
import json

from test_adapters.sharepoint_connector import SharePointConnector
from test_adapters.entity_registry import EntityRegistry
from test_adapters.storage_test_framework import StorageTestBase, MockStorageProvider


class TestSharePointConnector:
    """Test class for the SharePoint connector mock."""
    
    def setup_method(self):
        """Set up test environment before each test."""
        self.registry = EntityRegistry()
        self.connector = SharePointConnector(registry=self.registry)
        
        # Ensure connector is connected
        self.connector.connect()
        
        # Create a test library
        self.test_library = "TestDocuments"
        self.connector.create_container(self.test_library)
    
    def teardown_method(self):
        """Clean up test environment after each test."""
        self.connector.reset()
    
    def test_connection(self):
        """Test the mock connection to SharePoint."""
        # Test with default credentials
        result = self.connector.test_connection()
        assert result["success"] is True
        assert "message" in result
        assert self.test_library in str(result["message"])
        
        # Test with custom credentials
        connector = SharePointConnector(
            registry=self.registry,
            site_url="https://custom.sharepoint.com/sites/project",
            username="custom.user@example.com",
            password="custom_password"
        )
        result = connector.test_connection()
        assert result["success"] is True
        
        # Test disconnection
        self.connector.disconnect()
        assert self.connector.is_connected is False
    
    def test_create_container(self):
        """Test creating a document library in mock SharePoint."""
        # Create a new library
        library_name = "ProjectFiles"
        result = self.connector.create_container(library_name)
        assert result["success"] is True
        assert result["name"] == library_name
        assert "relative_url" in result
        assert "created" in result
        
        # Verify library exists
        libraries = self.connector.list_containers()
        library_names = [lib["name"] for lib in libraries["libraries"]]
        assert library_name in library_names
        
        # Test with invalid name
        invalid_name = "Invalid*Name"
        result = self.connector.create_container(invalid_name)
        assert result["success"] is False
        assert "invalid" in result["error"].lower()
    
    def test_delete_container(self):
        """Test deleting a document library from mock SharePoint."""
        # Create a library to delete
        library_name = "ToDelete"
        self.connector.create_container(library_name)
        
        # Delete the library
        result = self.connector.delete_container(library_name)
        assert result["success"] is True
        assert "deleted" in result["message"].lower()
        
        # Verify library is deleted
        libraries = self.connector.list_containers()
        library_names = [lib["name"] for lib in libraries["libraries"]]
        assert library_name not in library_names
        
        # Test deleting non-existent library
        result = self.connector.delete_container("NonExistentLibrary")
        assert result["success"] is True  # SharePoint returns success even for non-existent libraries
    
    def test_list_containers(self):
        """Test listing document libraries in mock SharePoint."""
        # Create additional libraries
        self.connector.create_container("Library1")
        self.connector.create_container("Library2")
        
        # List libraries
        result = self.connector.list_containers()
        assert result["success"] is True
        assert "libraries" in result
        assert len(result["libraries"]) >= 3  # At least 3 libraries
        
        # Verify library properties
        for library in result["libraries"]:
            assert "name" in library
            assert "title" in library
            assert "created" in library
            assert "modified" in library
            assert "item_count" in library
            assert "relative_url" in library
            assert "template_type" in library
    
    def test_upload_file(self):
        """Test uploading a file to a document library in mock SharePoint."""
        # Upload a text file
        file_content = b"This is a test file content"
        file_path = "test_file.txt"
        result = self.connector.upload_file(
            container_name=self.test_library,
            file_path=file_path,
            content=file_content,
            content_type="text/plain"
        )
        
        assert result["success"] is True
        assert result["name"] == "test_file.txt"
        assert result["path"] == file_path
        assert "server_relative_url" in result
        assert result["library"] == self.test_library
        assert result["content_type"] == "text/plain"
        assert result["length"] == len(file_content)
        assert "created" in result
        assert "modified" in result
        assert "created_by" in result
        assert "modified_by" in result
        assert "unique_id" in result
        
        # Upload a file with metadata
        metadata = {"Author": "Test User", "Department": "Engineering"}
        result = self.connector.upload_file(
            container_name=self.test_library,
            file_path="document.docx",
            content=b"Document content",
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            metadata=metadata
        )
        
        assert result["success"] is True
        assert result["metadata"] == metadata
        
        # Test with invalid file path
        result = self.connector.upload_file(
            container_name=self.test_library,
            file_path="invalid*file.txt",
            content=b"Invalid file content"
        )
        assert result["success"] is False
        assert "invalid" in result["error"].lower()
    
    def test_download_file(self):
        """Test downloading a file from a document library in mock SharePoint."""
        # Upload a file to download
        file_content = b"File content for download test"
        file_path = "download_test.txt"
        self.connector.upload_file(
            container_name=self.test_library,
            file_path=file_path,
            content=file_content,
            content_type="text/plain"
        )
        
        # Download the file
        result = self.connector.download_file(
            container_name=self.test_library,
            file_path=file_path
        )
        
        assert result["success"] is True
        assert result["content"] == file_content
        assert result["name"] == "download_test.txt"
        assert result["path"] == file_path
        assert result["library"] == self.test_library
        assert result["content_type"] == "text/plain"
        assert result["length"] == len(file_content)
        assert "last_modified" in result
        
        # Test downloading non-existent file
        result = self.connector.download_file(
            container_name=self.test_library,
            file_path="non_existent.txt"
        )
        assert result["success"] is False
        assert "not found" in result["error"].lower()
    
    def test_delete_file(self):
        """Test deleting a file from a document library in mock SharePoint."""
        # Upload a file to delete
        file_path = "to_delete.txt"
        self.connector.upload_file(
            container_name=self.test_library,
            file_path=file_path,
            content=b"File to delete"
        )
        
        # Delete the file
        result = self.connector.delete_file(
            container_name=self.test_library,
            file_path=file_path
        )
        
        assert result["success"] is True
        assert "deleted" in result["message"].lower()
        assert result["path"] == file_path
        assert result["library"] == self.test_library
        
        # Verify file is deleted
        download_result = self.connector.download_file(
            container_name=self.test_library,
            file_path=file_path
        )
        assert download_result["success"] is False
        
        # Test deleting non-existent file
        result = self.connector.delete_file(
            container_name=self.test_library,
            file_path="non_existent.txt"
        )
        assert result["success"] is False
        assert "not found" in result["error"].lower()
    
    def test_list_files(self):
        """Test listing files in a document library in mock SharePoint."""
        # Upload multiple files
        self.connector.upload_file(
            container_name=self.test_library,
            file_path="file1.txt",
            content=b"File 1 content"
        )
        self.connector.upload_file(
            container_name=self.test_library,
            file_path="file2.txt",
            content=b"File 2 content"
        )
        self.connector.upload_file(
            container_name=self.test_library,
            file_path="folder/file3.txt",
            content=b"File 3 content"
        )
        
        # List all files
        result = self.connector.list_files(
            container_name=self.test_library
        )
        
        assert result["success"] is True
        assert "files" in result
        assert len(result["files"]) == 3
        assert result["library"] == self.test_library
        assert result["count"] == 3
        
        # Verify file properties
        for file_info in result["files"]:
            assert "name" in file_info
            assert "path" in file_info
            assert "server_relative_url" in file_info
            assert "length" in file_info
            assert "type" in file_info
            assert "time_created" in file_info
            assert "time_last_modified" in file_info
            assert "content_type" in file_info
        
        # List files with prefix
        result = self.connector.list_files(
            container_name=self.test_library,
            prefix="folder/"
        )
        
        assert result["success"] is True
        assert len(result["files"]) == 1
        assert result["files"][0]["path"] == "folder/file3.txt"
    
    def test_create_folder(self):
        """Test creating a folder in a document library in mock SharePoint."""
        # Create a folder
        folder_path = "test_folder"
        result = self.connector.create_folder(
            container_name=self.test_library,
            folder_path=folder_path
        )
        
        assert result["success"] is True
        assert result["name"] == "test_folder"
        assert result["path"] == folder_path
        assert result["library"] == self.test_library
        assert result["type"] == "Folder"
        assert "created" in result
        assert "modified" in result
        assert "created_by" in result
        assert "modified_by" in result
        
        # Test with invalid folder path
        result = self.connector.create_folder(
            container_name=self.test_library,
            folder_path="invalid*folder"
        )
        assert result["success"] is False
        assert "invalid" in result["error"].lower()
    
    def test_get_file_metadata(self):
        """Test getting metadata for a file in mock SharePoint."""
        # Upload a file with metadata
        file_path = "metadata_test.txt"
        metadata = {"Author": "Test User", "Category": "Test"}
        self.connector.upload_file(
            container_name=self.test_library,
            file_path=file_path,
            content=b"Metadata test content",
            metadata=metadata
        )
        
        # Get file metadata
        result = self.connector.get_file_metadata(
            container_name=self.test_library,
            file_path=file_path
        )
        
        assert result["success"] is True
        assert result["name"] == "metadata_test.txt"
        assert result["path"] == file_path
        assert result["library"] == self.test_library
        assert "content_type" in result
        assert "length" in result
        assert "time_created" in result
        assert "time_last_modified" in result
        assert result["metadata"] == metadata
        
        # Test with non-existent file
        result = self.connector.get_file_metadata(
            container_name=self.test_library,
            file_path="non_existent.txt"
        )
        assert result["success"] is False
        assert "not found" in result["error"].lower()
    
    def test_update_file_metadata(self):
        """Test updating metadata for a file in mock SharePoint."""
        # Upload a file with initial metadata
        file_path = "metadata_update.txt"
        initial_metadata = {"Author": "Initial Author"}
        self.connector.upload_file(
            container_name=self.test_library,
            file_path=file_path,
            content=b"Metadata update test content",
            metadata=initial_metadata
        )
        
        # Update file metadata
        updated_metadata = {"Author": "Updated Author", "Status": "Reviewed"}
        result = self.connector.update_file_metadata(
            container_name=self.test_library,
            file_path=file_path,
            metadata=updated_metadata
        )
        
        assert result["success"] is True
        assert result["path"] == file_path
        assert result["library"] == self.test_library
        assert result["metadata"] == updated_metadata
        
        # Verify metadata was updated
        get_result = self.connector.get_file_metadata(
            container_name=self.test_library,
            file_path=file_path
        )
        assert get_result["metadata"] == updated_metadata
        
        # Test with non-existent file
        result = self.connector.update_file_metadata(
            container_name=self.test_library,
            file_path="non_existent.txt",
            metadata={"Test": "Value"}
        )
        assert result["success"] is False
        assert "not found" in result["error"].lower()
    
    def test_get_file_versions(self):
        """Test getting version history for a file in mock SharePoint."""
        # Upload a file
        file_path = "version_test.txt"
        self.connector.upload_file(
            container_name=self.test_library,
            file_path=file_path,
            content=b"Version test content"
        )
        
        # Get file versions
        result = self.connector.get_file_versions(
            container_name=self.test_library,
            file_path=file_path
        )
        
        assert result["success"] is True
        assert result["path"] == file_path
        assert result["library"] == self.test_library
        assert "versions" in result
        assert len(result["versions"]) == 1  # One version in mock
        assert result["count"] == 1
        
        # Verify version properties
        version = result["versions"][0]
        assert version["id"] == 1
        assert version["version_label"] == "1.0"
        assert "created" in version
        assert "created_by" in version
        assert "size" in version
        assert version["is_current_version"] is True
        
        # Test with non-existent file
        result = self.connector.get_file_versions(
            container_name=self.test_library,
            file_path="non_existent.txt"
        )
        assert result["success"] is False
        assert "not found" in result["error"].lower()
    
    def test_copy_file(self):
        """Test copying a file within SharePoint."""
        # Upload a source file
        source_path = "source_file.txt"
        source_content = b"Source file content for copy test"
        self.connector.upload_file(
            container_name=self.test_library,
            file_path=source_path,
            content=source_content
        )
        
        # Create a target library
        target_library = "TargetLibrary"
        self.connector.create_container(target_library)
        
        # Copy the file
        target_path = "target_file.txt"
        result = self.connector.copy_file(
            source_container=self.test_library,
            source_path=source_path,
            target_container=target_library,
            target_path=target_path
        )
        
        assert result["success"] is True
        assert result["source_path"] == source_path
        assert result["target_path"] == target_path
        assert result["source_library"] == self.test_library
        assert result["target_library"] == target_library
        assert "message" in result
        
        # Verify the copy
        download_result = self.connector.download_file(
            container_name=target_library,
            file_path=target_path
        )
        assert download_result["success"] is True
        assert download_result["content"] == source_content
        
        # Test with invalid target path
        result = self.connector.copy_file(
            source_container=self.test_library,
            source_path=source_path,
            target_container=target_library,
            target_path="invalid*path.txt"
        )
        assert result["success"] is False
        assert "invalid" in result["error"].lower()
    
    def test_get_sharing_link(self):
        """Test generating a sharing link for a file in SharePoint."""
        # Upload a file
        file_path = "share_test.txt"
        self.connector.upload_file(
            container_name=self.test_library,
            file_path=file_path,
            content=b"Content for sharing test"
        )
        
        # Get a view link
        result = self.connector.get_sharing_link(
            container_name=self.test_library,
            file_path=file_path,
            link_type="view",
            expiry_days=7
        )
        
        assert result["success"] is True
        assert "url" in result
        assert result["path"] == file_path
        assert result["library"] == self.test_library
        assert result["type"] == "view"
        assert result["permission"] == "view"
        assert "expires" in result
        assert "created" in result
        
        # Get an edit link
        result = self.connector.get_sharing_link(
            container_name=self.test_library,
            file_path=file_path,
            link_type="edit",
            expiry_days=14
        )
        
        assert result["success"] is True
        assert result["type"] == "edit"
        assert result["permission"] == "edit"
        
        # Test with non-existent file
        result = self.connector.get_sharing_link(
            container_name=self.test_library,
            file_path="non_existent.txt"
        )
        assert result["success"] is False
        assert "not found" in result["error"].lower()


class TestSharePointConnectorErrors:
    """Test error handling in the SharePoint connector mock."""
    
    def setup_method(self):
        """Set up test environment before each test."""
        self.registry = EntityRegistry()
        self.connector = SharePointConnector(registry=self.registry)
        
        # Ensure connector is connected
        self.connector.connect()
        
        # Create a test library
        self.test_library = "TestDocuments"
        self.connector.create_container(self.test_library)
        
        # Upload a test file
        self.test_file = "test_file.txt"
        self.connector.upload_file(
            container_name=self.test_library,
            file_path=self.test_file,
            content=b"Test file content"
        )
    
    def teardown_method(self):
        """Clean up test environment after each test."""
        self.connector.reset()
    
    def test_connection_error(self):
        """Test connection error handling."""
        # Set error mode for connection
        self.connector.set_error_mode(True, "connection")
        
        # Test connection
        result = self.connector.test_connection()
        assert result["success"] is False
        assert "failed to connect" in result["message"].lower()
        
        # Test other operations that depend on connection
        result = self.connector.list_containers()
        assert result["success"] is False
        assert "not connected" in result["error"].lower()
    
    def test_list_containers_error(self):
        """Test error handling for listing containers."""
        # Set error mode for list_containers
        self.connector.set_error_mode(True, "list_containers")
        
        # Test list_containers
        result = self.connector.list_containers()
        assert result["success"] is False
        assert "failed to list" in result["error"].lower()
    
    def test_create_container_error(self):
        """Test error handling for creating containers."""
        # Set error mode for create_container
        self.connector.set_error_mode(True, "create_container")
        
        # Test create_container
        result = self.connector.create_container("NewLibrary")
        assert result["success"] is False
        assert "failed to create" in result["error"].lower()
    
    def test_delete_container_error(self):
        """Test error handling for deleting containers."""
        # Set error mode for delete_container
        self.connector.set_error_mode(True, "delete_container")
        
        # Test delete_container
        result = self.connector.delete_container(self.test_library)
        assert result["success"] is False
        assert "failed to delete" in result["error"].lower()
    
    def test_upload_file_error(self):
        """Test error handling for uploading files."""
        # Set error mode for upload_file
        self.connector.set_error_mode(True, "upload_file")
        
        # Test upload_file
        result = self.connector.upload_file(
            container_name=self.test_library,
            file_path="error_test.txt",
            content=b"Error test content"
        )
        assert result["success"] is False
        assert "failed to upload" in result["error"].lower()
    
    def test_download_file_error(self):
        """Test error handling for downloading files."""
        # Set error mode for download_file
        self.connector.set_error_mode(True, "download_file")
        
        # Test download_file
        result = self.connector.download_file(
            container_name=self.test_library,
            file_path=self.test_file
        )
        assert result["success"] is False
        assert "failed to download" in result["error"].lower()
    
    def test_delete_file_error(self):
        """Test error handling for deleting files."""
        # Set error mode for delete_file
        self.connector.set_error_mode(True, "delete_file")
        
        # Test delete_file
        result = self.connector.delete_file(
            container_name=self.test_library,
            file_path=self.test_file
        )
        assert result["success"] is False
        assert "failed to delete" in result["error"].lower()
    
    def test_list_files_error(self):
        """Test error handling for listing files."""
        # Set error mode for list_files
        self.connector.set_error_mode(True, "list_files")
        
        # Test list_files
        result = self.connector.list_files(
            container_name=self.test_library
        )
        assert result["success"] is False
        assert "failed to list" in result["error"].lower()
    
    def test_create_folder_error(self):
        """Test error handling for creating folders."""
        # Set error mode for create_folder
        self.connector.set_error_mode(True, "create_folder")
        
        # Test create_folder
        result = self.connector.create_folder(
            container_name=self.test_library,
            folder_path="error_folder"
        )
        assert result["success"] is False
        assert "failed to create" in result["error"].lower()
    
    def test_get_file_metadata_error(self):
        """Test error handling for getting file metadata."""
        # Set error mode for get_file_metadata
        self.connector.set_error_mode(True, "get_file_metadata")
        
        # Test get_file_metadata
        result = self.connector.get_file_metadata(
            container_name=self.test_library,
            file_path=self.test_file
        )
        assert result["success"] is False
        assert "failed to get file metadata" in result["error"].lower()
    
    def test_update_file_metadata_error(self):
        """Test error handling for updating file metadata."""
        # Set error mode for update_file_metadata
        self.connector.set_error_mode(True, "update_file_metadata")
        
        # Test update_file_metadata
        result = self.connector.update_file_metadata(
            container_name=self.test_library,
            file_path=self.test_file,
            metadata={"Test": "Value"}
        )
        assert result["success"] is False
        assert "failed to update file metadata" in result["error"].lower()
    
    def test_get_file_versions_error(self):
        """Test error handling for getting file versions."""
        # Set error mode for get_file_versions
        self.connector.set_error_mode(True, "get_file_versions")
        
        # Test get_file_versions
        result = self.connector.get_file_versions(
            container_name=self.test_library,
            file_path=self.test_file
        )
        assert result["success"] is False
        assert "failed to get file versions" in result["error"].lower()
    
    def test_copy_file_error(self):
        """Test error handling for copying files."""
        # Create a target library
        target_library = "TargetLibrary"
        self.connector.create_container(target_library)
        
        # Set error mode for copy_file
        self.connector.set_error_mode(True, "copy_file")
        
        # Test copy_file
        result = self.connector.copy_file(
            source_container=self.test_library,
            source_path=self.test_file,
            target_container=target_library,
            target_path="target_file.txt"
        )
        assert result["success"] is False
        assert "failed to copy" in result["error"].lower()
    
    def test_get_sharing_link_error(self):
        """Test error handling for generating sharing links."""
        # Set error mode for get_sharing_link
        self.connector.set_error_mode(True, "get_sharing_link")
        
        # Test get_sharing_link
        result = self.connector.get_sharing_link(
            container_name=self.test_library,
            file_path=self.test_file
        )
        assert result["success"] is False
        assert "failed to generate sharing link" in result["error"].lower()
    
    def test_reset_error_mode(self):
        """Test resetting error mode."""
        # Set error mode
        self.connector.set_error_mode(True, "upload_file")
        
        # Test upload_file
        result = self.connector.upload_file(
            container_name=self.test_library,
            file_path="error_test.txt",
            content=b"Error test content"
        )
        assert result["success"] is False
        
        # Reset error mode
        self.connector.set_error_mode(False)
        
        # Test upload_file again
        result = self.connector.upload_file(
            container_name=self.test_library,
            file_path="success_test.txt",
            content=b"Success test content"
        )
        assert result["success"] is True