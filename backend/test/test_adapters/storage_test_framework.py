"""
Storage testing framework.

This module provides base classes and utilities for testing storage adapters.
"""

from typing import Dict, List, Any, Optional, Union, BinaryIO
from datetime import datetime, timezone
import os
import uuid
import logging
from abc import ABC, abstractmethod

# Import entity registry
from .entity_registry import BaseTestAdapter, EntityAction, global_registry

# Set up logging
logger = logging.getLogger("storage_test_framework")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)


class StorageTestFile:
    """Representation of a file in a storage system."""
    
    def __init__(self, path: str, content: bytes, content_type: str = "application/octet-stream",
                 metadata: Optional[Dict[str, str]] = None, last_modified: Optional[datetime] = None):
        """
        Initialize a test file.
        
        Args:
            path: Path to the file in the storage system
            content: File content as bytes
            content_type: MIME type of the file
            metadata: Additional file metadata
            last_modified: Last modified timestamp
        """
        self.path = path
        self.content = content
        self.content_type = content_type
        self.metadata = metadata or {}
        self.last_modified = last_modified or datetime.now(timezone.utc)
        self.size = len(content)
        self.id = str(uuid.uuid4())
    
    def __repr__(self):
        return f"StorageTestFile(path='{self.path}', size={self.size}, type='{self.content_type}')"


class MockStorageProvider:
    """Mock implementation of a storage provider for testing."""
    
    def __init__(self, provider_type: str = "generic"):
        """
        Initialize the mock storage provider.
        
        Args:
            provider_type: Type of provider (s3, azure_blob, sharepoint)
        """
        self.provider_type = provider_type
        self.containers: Dict[str, Dict[str, StorageTestFile]] = {}
        self.access_logs: List[Dict[str, Any]] = []
        self.error_simulation: Dict[str, Any] = {}
    
    def create_container(self, container_name: str) -> Dict[str, Any]:
        """
        Create a new container.
        
        Args:
            container_name: Name of the container to create
            
        Returns:
            Result dictionary with success status
        """
        # Check if container already exists
        if container_name in self.containers:
            return {"success": False, "error": "Container already exists"}
        
        # Check for simulated errors
        if "create_container" in self.error_simulation:
            error = self.error_simulation["create_container"]
            if callable(error):
                error_result = error(container_name)
                if error_result:
                    return error_result
            else:
                return {"success": False, "error": str(error)}
        
        # Create container
        self.containers[container_name] = {}
        
        # Log access
        self._log_access("create_container", container_name)
        
        return {"success": True, "container": container_name}
    
    def delete_container(self, container_name: str) -> Dict[str, Any]:
        """
        Delete a container.
        
        Args:
            container_name: Name of the container to delete
            
        Returns:
            Result dictionary with success status
        """
        # Check if container exists
        if container_name not in self.containers:
            return {"success": False, "error": "Container not found"}
        
        # Check for simulated errors
        if "delete_container" in self.error_simulation:
            error = self.error_simulation["delete_container"]
            if callable(error):
                error_result = error(container_name)
                if error_result:
                    return error_result
            else:
                return {"success": False, "error": str(error)}
        
        # Delete container
        del self.containers[container_name]
        
        # Log access
        self._log_access("delete_container", container_name)
        
        return {"success": True}
    
    def list_containers(self) -> Dict[str, Any]:
        """
        List all containers.
        
        Returns:
            Result dictionary with container list
        """
        # Check for simulated errors
        if "list_containers" in self.error_simulation:
            error = self.error_simulation["list_containers"]
            if callable(error):
                error_result = error()
                if error_result:
                    return error_result
            else:
                return {"success": False, "error": str(error)}
        
        # Get container list
        container_list = list(self.containers.keys())
        
        # Log access
        self._log_access("list_containers")
        
        return {"success": True, "containers": container_list}
    
    def upload_file(self, container_name: str, file_path: str, content: bytes,
                    content_type: str = "application/octet-stream",
                    metadata: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Upload a file to a container.
        
        Args:
            container_name: Name of the container
            file_path: Path to store the file at
            content: File content as bytes
            content_type: MIME type of the file
            metadata: Additional file metadata
            
        Returns:
            Result dictionary with success status
        """
        # Normalize file path
        file_path = self._normalize_path(file_path)
        
        # Check if container exists
        if container_name not in self.containers:
            return {"success": False, "error": "Container not found"}
        
        # Check for simulated errors
        if "upload_file" in self.error_simulation:
            error = self.error_simulation["upload_file"]
            if callable(error):
                error_result = error(container_name, file_path)
                if error_result:
                    return error_result
            else:
                return {"success": False, "error": str(error)}
        
        # Create file object
        file_obj = StorageTestFile(
            path=file_path,
            content=content,
            content_type=content_type,
            metadata=metadata,
            last_modified=datetime.now(timezone.utc)
        )
        
        # Store the file
        self.containers[container_name][file_path] = file_obj
        
        # Log access
        self._log_access("upload_file", container_name, file_path)
        
        # Provider-specific location format
        location = self._get_location_url(container_name, file_path)
        
        return {
            "success": True,
            "path": file_path,
            "location": location,
            "container": container_name,
            "content_type": content_type,
            "size": len(content),
            "metadata": metadata or {}
        }
    
    def download_file(self, container_name: str, file_path: str) -> Dict[str, Any]:
        """
        Download a file from a container.
        
        Args:
            container_name: Name of the container
            file_path: Path of the file to download
            
        Returns:
            Result dictionary with file content and metadata
        """
        # Normalize file path
        file_path = self._normalize_path(file_path)
        
        # Check if container exists
        if container_name not in self.containers:
            return {"success": False, "error": "Container not found"}
        
        # Check if file exists
        if file_path not in self.containers[container_name]:
            return {"success": False, "error": "File not found"}
        
        # Check for simulated errors
        if "download_file" in self.error_simulation:
            error = self.error_simulation["download_file"]
            if callable(error):
                error_result = error(container_name, file_path)
                if error_result:
                    return error_result
            else:
                return {"success": False, "error": str(error)}
        
        # Get file object
        file_obj = self.containers[container_name][file_path]
        
        # Log access
        self._log_access("download_file", container_name, file_path)
        
        return {
            "success": True,
            "content": file_obj.content,
            "path": file_path,
            "container": container_name,
            "content_type": file_obj.content_type,
            "size": file_obj.size,
            "metadata": file_obj.metadata,
            "last_modified": file_obj.last_modified
        }
    
    def delete_file(self, container_name: str, file_path: str) -> Dict[str, Any]:
        """
        Delete a file from a container.
        
        Args:
            container_name: Name of the container
            file_path: Path of the file to delete
            
        Returns:
            Result dictionary with success status
        """
        # Normalize file path
        file_path = self._normalize_path(file_path)
        
        # Check if container exists
        if container_name not in self.containers:
            return {"success": False, "error": "Container not found"}
        
        # Check if file exists
        if file_path not in self.containers[container_name]:
            return {"success": False, "error": "File not found"}
        
        # Check for simulated errors
        if "delete_file" in self.error_simulation:
            error = self.error_simulation["delete_file"]
            if callable(error):
                error_result = error(container_name, file_path)
                if error_result:
                    return error_result
            else:
                return {"success": False, "error": str(error)}
        
        # Delete file
        del self.containers[container_name][file_path]
        
        # Log access
        self._log_access("delete_file", container_name, file_path)
        
        return {"success": True}
    
    def list_files(self, container_name: str, prefix: str = "") -> Dict[str, Any]:
        """
        List files in a container with optional prefix.
        
        Args:
            container_name: Name of the container
            prefix: Optional prefix to filter files
            
        Returns:
            Result dictionary with file list
        """
        # Check if container exists
        if container_name not in self.containers:
            return {"success": False, "error": "Container not found"}
        
        # Check for simulated errors
        if "list_files" in self.error_simulation:
            error = self.error_simulation["list_files"]
            if callable(error):
                error_result = error(container_name, prefix)
                if error_result:
                    return error_result
            else:
                return {"success": False, "error": str(error)}
        
        # Filter files by prefix
        files = []
        for path, file_obj in self.containers[container_name].items():
            if not prefix or path.startswith(prefix):
                files.append({
                    "path": path,
                    "size": file_obj.size,
                    "content_type": file_obj.content_type,
                    "last_modified": file_obj.last_modified,
                    "metadata": file_obj.metadata
                })
        
        # Log access
        self._log_access("list_files", container_name, prefix)
        
        return {
            "success": True,
            "files": files,
            "container": container_name,
            "prefix": prefix
        }
    
    def get_file_metadata(self, container_name: str, file_path: str) -> Dict[str, Any]:
        """
        Get metadata for a file.
        
        Args:
            container_name: Name of the container
            file_path: Path of the file
            
        Returns:
            Result dictionary with file metadata
        """
        # Normalize file path
        file_path = self._normalize_path(file_path)
        
        # Check if container exists
        if container_name not in self.containers:
            return {"success": False, "error": "Container not found"}
        
        # Check if file exists
        if file_path not in self.containers[container_name]:
            return {"success": False, "error": "File not found"}
        
        # Check for simulated errors
        if "get_file_metadata" in self.error_simulation:
            error = self.error_simulation["get_file_metadata"]
            if callable(error):
                error_result = error(container_name, file_path)
                if error_result:
                    return error_result
            else:
                return {"success": False, "error": str(error)}
        
        # Get file object
        file_obj = self.containers[container_name][file_path]
        
        # Log access
        self._log_access("get_file_metadata", container_name, file_path)
        
        return {
            "success": True,
            "path": file_path,
            "container": container_name,
            "content_type": file_obj.content_type,
            "size": file_obj.size,
            "metadata": file_obj.metadata,
            "last_modified": file_obj.last_modified
        }
    
    def update_file_metadata(self, container_name: str, file_path: str,
                             metadata: Dict[str, str]) -> Dict[str, Any]:
        """
        Update metadata for a file.
        
        Args:
            container_name: Name of the container
            file_path: Path of the file
            metadata: New metadata dictionary
            
        Returns:
            Result dictionary with success status
        """
        # Normalize file path
        file_path = self._normalize_path(file_path)
        
        # Check if container exists
        if container_name not in self.containers:
            return {"success": False, "error": "Container not found"}
        
        # Check if file exists
        if file_path not in self.containers[container_name]:
            return {"success": False, "error": "File not found"}
        
        # Check for simulated errors
        if "update_file_metadata" in self.error_simulation:
            error = self.error_simulation["update_file_metadata"]
            if callable(error):
                error_result = error(container_name, file_path, metadata)
                if error_result:
                    return error_result
            else:
                return {"success": False, "error": str(error)}
        
        # Get file object
        file_obj = self.containers[container_name][file_path]
        
        # Update metadata
        file_obj.metadata = metadata
        
        # Log access
        self._log_access("update_file_metadata", container_name, file_path)
        
        return {
            "success": True,
            "metadata": metadata
        }
    
    def copy_file(self, source_container: str, source_path: str,
                 target_container: str, target_path: str) -> Dict[str, Any]:
        """
        Copy a file from one location to another.
        
        Args:
            source_container: Source container name
            source_path: Source file path
            target_container: Target container name
            target_path: Target file path
            
        Returns:
            Result dictionary with success status
        """
        # Normalize file paths
        source_path = self._normalize_path(source_path)
        target_path = self._normalize_path(target_path)
        
        # Check if source container exists
        if source_container not in self.containers:
            return {"success": False, "error": "Source container not found"}
        
        # Check if source file exists
        if source_path not in self.containers[source_container]:
            return {"success": False, "error": "Source file not found"}
        
        # Check if target container exists
        if target_container not in self.containers:
            return {"success": False, "error": "Target container not found"}
        
        # Check for simulated errors
        if "copy_file" in self.error_simulation:
            error = self.error_simulation["copy_file"]
            if callable(error):
                error_result = error(source_container, source_path, target_container, target_path)
                if error_result:
                    return error_result
            else:
                return {"success": False, "error": str(error)}
        
        # Get source file object
        source_file = self.containers[source_container][source_path]
        
        # Create copy of the file
        target_file = StorageTestFile(
            path=target_path,
            content=source_file.content,
            content_type=source_file.content_type,
            metadata=dict(source_file.metadata),
            last_modified=datetime.now(timezone.utc)
        )
        
        # Store the file
        self.containers[target_container][target_path] = target_file
        
        # Log access
        self._log_access("copy_file", source_container, source_path, target_container, target_path)
        
        return {
            "success": True,
            "source_path": source_path,
            "target_path": target_path,
            "source_container": source_container,
            "target_container": target_container
        }
    
    def simulate_error(self, operation: str, error: Any) -> None:
        """
        Configure error simulation for a specific operation.
        
        Args:
            operation: Operation name to simulate error for
            error: Error to simulate (string or callable)
        """
        self.error_simulation[operation] = error
    
    def clear_error_simulation(self, operation: Optional[str] = None) -> None:
        """
        Clear error simulation for a specific operation or all operations.
        
        Args:
            operation: Operation name to clear (None = all operations)
        """
        if operation is None:
            self.error_simulation.clear()
        elif operation in self.error_simulation:
            del self.error_simulation[operation]
    
    def reset(self) -> None:
        """Reset the mock storage provider to its initial state."""
        self.containers.clear()
        self.access_logs.clear()
        self.error_simulation.clear()
    
    def _log_access(self, operation: str, *args) -> None:
        """Log an access to the storage provider."""
        self.access_logs.append({
            "operation": operation,
            "timestamp": datetime.now(timezone.utc),
            "args": args
        })
    
    def _normalize_path(self, path: str) -> str:
        """Normalize a file path for consistent handling."""
        # Remove leading slash if present
        if path.startswith("/"):
            path = path[1:]
        
        # Replace backslashes with forward slashes
        path = path.replace("\\", "/")
        
        return path
    
    def _get_location_url(self, container_name: str, file_path: str) -> str:
        """Get a location URL for a file based on provider type."""
        if self.provider_type == "s3":
            return f"s3://{container_name}/{file_path}"
        elif self.provider_type == "azure_blob":
            return f"https://{container_name}.blob.core.windows.net/{file_path}"
        elif self.provider_type == "sharepoint":
            return f"https://sharepoint.com/sites/{container_name}/{file_path}"
        else:
            return f"{self.provider_type}://{container_name}/{file_path}"


class BaseStorageAdapter(BaseTestAdapter, ABC):
    """
    Base class for storage adapter testing.
    
    This class provides a common interface for testing storage adapters.
    """
    
    def __init__(self, registry=None, provider=None):
        """
        Initialize the storage adapter with a registry and provider.
        
        Args:
            registry: Entity registry to use
            provider: Mock storage provider to use
        """
        super().__init__(registry)
        self.provider = provider or MockStorageProvider()
        
        # Register with registry
        self.registry.register_listener("StorageFile", self._handle_entity_change)
    
    @abstractmethod
    def create_container(self, container_name: str) -> Dict[str, Any]:
        """
        Create a new container.
        
        Args:
            container_name: Name of the container to create
            
        Returns:
            Result dictionary with success status
        """
        pass
    
    @abstractmethod
    def delete_container(self, container_name: str) -> Dict[str, Any]:
        """
        Delete a container.
        
        Args:
            container_name: Name of the container to delete
            
        Returns:
            Result dictionary with success status
        """
        pass
    
    @abstractmethod
    def list_containers(self) -> Dict[str, Any]:
        """
        List all containers.
        
        Returns:
            Result dictionary with container list
        """
        pass
    
    @abstractmethod
    def upload_file(self, container_name: str, file_path: str, content: Union[bytes, BinaryIO],
                   content_type: str = "application/octet-stream",
                   metadata: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Upload a file to a container.
        
        Args:
            container_name: Name of the container
            file_path: Path to store the file at
            content: File content as bytes or file-like object
            content_type: MIME type of the file
            metadata: Additional file metadata
            
        Returns:
            Result dictionary with success status
        """
        pass
    
    @abstractmethod
    def download_file(self, container_name: str, file_path: str) -> Dict[str, Any]:
        """
        Download a file from a container.
        
        Args:
            container_name: Name of the container
            file_path: Path of the file to download
            
        Returns:
            Result dictionary with file content and metadata
        """
        pass
    
    @abstractmethod
    def delete_file(self, container_name: str, file_path: str) -> Dict[str, Any]:
        """
        Delete a file from a container.
        
        Args:
            container_name: Name of the container
            file_path: Path of the file to delete
            
        Returns:
            Result dictionary with success status
        """
        pass
    
    @abstractmethod
    def list_files(self, container_name: str, prefix: str = "") -> Dict[str, Any]:
        """
        List files in a container with optional prefix.
        
        Args:
            container_name: Name of the container
            prefix: Optional prefix to filter files
            
        Returns:
            Result dictionary with file list
        """
        pass
    
    def _handle_entity_change(self, entity_type: str, entity_id: str, entity: Any, action: str) -> None:
        """
        Handle entity change events from the registry.
        
        Args:
            entity_type: Type of entity that changed
            entity_id: ID of the entity
            entity: The entity object
            action: The action performed (create, update, delete)
        """
        # Handle file changes
        if entity_type == "StorageFile":
            logger.debug(f"Storage adapter handling {action} for file {entity_id}")


class StorageTestBase:
    """Base class for storage adapter tests."""
    
    def setup_method(self):
        """Set up test environment with mock storage."""
        self.mock_storage = MockStorageProvider()
        self.adapter = self.create_adapter(self.mock_storage)
        
        # Create test container
        self.test_container = "test-container"
        self.mock_storage.create_container(self.test_container)
    
    @abstractmethod
    def create_adapter(self, storage_provider):
        """Create the adapter under test."""
        pass
    
    def create_test_file(self, content=b"Test file content", path="test_file.txt", container=None):
        """Create a test file in the mock storage."""
        container = container or self.test_container
        return self.mock_storage.upload_file(
            container_name=container,
            file_path=path,
            content=content,
            content_type="text/plain"
        )
    
    def test_upload_file(self):
        """Test uploading a file."""
        result = self.adapter.upload_file(
            container_name=self.test_container,
            file_path="test_upload.txt",
            content=b"Uploaded content"
        )
        
        assert result["success"] is True
        assert "location" in result
        
        # Verify the file exists in mock storage
        download_result = self.mock_storage.download_file(
            container_name=self.test_container,
            file_path="test_upload.txt"
        )
        
        assert download_result["success"] is True
        assert download_result["content"] == b"Uploaded content"
    
    def test_download_file(self):
        """Test downloading a file."""
        # Create a file to download
        self.create_test_file(
            content=b"Download test content",
            path="test_download.txt"
        )
        
        # Download the file
        result = self.adapter.download_file(
            container_name=self.test_container,
            file_path="test_download.txt"
        )
        
        assert result["success"] is True
        assert result["content"] == b"Download test content"
    
    def test_list_files(self):
        """Test listing files."""
        # Create some test files
        self.create_test_file(path="test1.txt")
        self.create_test_file(path="test2.txt")
        self.create_test_file(path="prefix/test3.txt")
        
        # List all files
        result = self.adapter.list_files(
            container_name=self.test_container
        )
        
        assert result["success"] is True
        assert len(result["files"]) == 3
        
        # List files with prefix
        result = self.adapter.list_files(
            container_name=self.test_container,
            prefix="prefix/"
        )
        
        assert result["success"] is True
        assert len(result["files"]) == 1
        assert result["files"][0]["path"] == "prefix/test3.txt"
    
    def test_delete_file(self):
        """Test deleting a file."""
        # Create a file to delete
        self.create_test_file(path="test_delete.txt")
        
        # Delete the file
        result = self.adapter.delete_file(
            container_name=self.test_container,
            file_path="test_delete.txt"
        )
        
        assert result["success"] is True
        
        # Verify the file is deleted
        download_result = self.mock_storage.download_file(
            container_name=self.test_container,
            file_path="test_delete.txt"
        )
        
        assert download_result["success"] is False
    
    def test_file_not_found(self):
        """Test error handling for file not found."""
        result = self.adapter.download_file(
            container_name=self.test_container,
            file_path="nonexistent_file.txt"
        )
        
        assert result["success"] is False
        assert "not found" in result["error"].lower()
    
    def test_container_not_found(self):
        """Test error handling for container not found."""
        result = self.adapter.download_file(
            container_name="nonexistent_container",
            file_path="test_file.txt"
        )
        
        assert result["success"] is False
        assert "not found" in result["error"].lower()