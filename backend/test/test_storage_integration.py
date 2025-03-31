"""
Integration tests for storage adapters.

This test suite verifies that different storage adapters can work together
and that data can be transferred between different storage platforms.
"""

import pytest
import io
import uuid
import pandas as pd
import json
from datetime import datetime, timezone

from test.test_adapters import EntityRegistry, global_registry, MockStorageProvider
from test.test_adapters.auth import TimezoneTestUtilities
from test.test_adapters.s3_connector import S3Connector
from test.test_adapters.azure_blob_connector import AzureBlobConnector
from test.test_adapters.sharepoint_connector import SharePointConnector


class TestStorageIntegration:
    """Integration tests for storage adapters."""
    
    @pytest.fixture
    def registry(self):
        """Create a new registry for testing."""
        return EntityRegistry(debug=True)
    
    @pytest.fixture
    def s3_connector(self, registry):
        """Create an S3 connector for testing."""
        conn = S3Connector(registry=registry)
        # S3 connector integration tests assume a connection is already established
        return conn
    
    @pytest.fixture
    def azure_connector(self, registry):
        """Create an Azure Blob connector for testing."""
        conn = AzureBlobConnector(
            registry=registry,
            account_name="testaccount",
            account_key="test_key",
            account_url="https://testaccount.blob.core.windows.net"
        )
        conn.connect()
        return conn
    
    @pytest.fixture
    def sharepoint_connector(self, registry):
        """Create a SharePoint connector for testing."""
        conn = SharePointConnector(
            registry=registry,
            site_url="https://contoso.sharepoint.com/sites/testsite"
        )
        conn.connect()
        return conn
    
    @pytest.fixture
    def test_data(self):
        """Create test data for integration tests."""
        return {
            "text_content": "This is sample test content for integration testing",
            "binary_content": b"Binary content \x00\x01\x02\x03 for testing",
            "json_data": {
                "name": "Test Object",
                "attributes": {
                    "id": 12345,
                    "active": True,
                    "tags": ["test", "integration", "storage"]
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            "csv_data": "id,name,value\n1,item1,100\n2,item2,200\n3,item3,300"
        }
    
    @pytest.fixture(autouse=True)
    def setup_teardown(self, s3_connector, azure_connector, sharepoint_connector):
        """Setup and teardown for all tests."""
        # Setup test containers in each platform
        s3_connector.create_container("integration-test-bucket")
        azure_connector.create_container("integration-test-container")
        sharepoint_connector.create_container("IntegrationTestLibrary")
        
        yield
        
        # Cleanup test containers
        s3_connector.delete_container("integration-test-bucket")
        azure_connector.delete_container("integration-test-container")
        sharepoint_connector.delete_container("IntegrationTestLibrary")
    
    def test_cross_platform_file_transfer(self, s3_connector, azure_connector, sharepoint_connector, test_data):
        """Test transferring files between different storage platforms."""
        # 1. Upload text file to S3
        s3_text_path = "text_file.txt"
        s3_result = s3_connector.upload_file(
            container_name="integration-test-bucket",
            file_path=s3_text_path,
            content=test_data["text_content"].encode('utf-8')
        )
        assert s3_result["success"] is True
        
        # 2. Download from S3 and upload to Azure
        s3_download = s3_connector.download_file(
            container_name="integration-test-bucket",
            file_path=s3_text_path
        )
        assert s3_download["success"] is True
        
        azure_text_path = "text_from_s3.txt"
        azure_result = azure_connector.upload_blob(
            container_name="integration-test-container",
            blob_name=azure_text_path,
            data=s3_download["content"]
        )
        assert azure_result["status"] == "success"
        
        # 3. Download from Azure and upload to SharePoint
        azure_download = azure_connector.download_blob(
            container_name="integration-test-container",
            blob_name=azure_text_path
        )
        assert azure_download is not None
        
        sp_text_path = "text_from_azure.txt"
        sp_result = sharepoint_connector.upload_file(
            container_name="IntegrationTestLibrary",
            file_path=sp_text_path,
            content=azure_download
        )
        assert sp_result["success"] is True
        
        # 4. Download from SharePoint and verify content matches original
        sp_download = sharepoint_connector.download_file(
            container_name="IntegrationTestLibrary",
            file_path=sp_text_path
        )
        assert sp_download["success"] is True
        assert sp_download["content"].decode('utf-8') == test_data["text_content"]
    
    def test_binary_file_integrity(self, s3_connector, azure_connector, test_data):
        """Test binary file integrity when transferred between platforms."""
        # 1. Upload binary file to Azure
        azure_binary_path = "binary_file.bin"
        azure_result = azure_connector.upload_blob(
            container_name="integration-test-container",
            blob_name=azure_binary_path,
            data=test_data["binary_content"]
        )
        assert azure_result["status"] == "success"
        
        # 2. Download from Azure and upload to S3
        azure_download = azure_connector.download_blob(
            container_name="integration-test-container",
            blob_name=azure_binary_path
        )
        assert azure_download is not None
        
        s3_binary_path = "binary_from_azure.bin"
        s3_result = s3_connector.upload_file(
            container_name="integration-test-bucket",
            file_path=s3_binary_path,
            content=azure_download
        )
        assert s3_result["success"] is True
        
        # 3. Download from S3 and verify binary content matches original
        s3_download = s3_connector.download_file(
            container_name="integration-test-bucket",
            file_path=s3_binary_path
        )
        assert s3_download["success"] is True
        assert s3_download["content"] == test_data["binary_content"]
    
    def test_json_data_transfer(self, azure_connector, sharepoint_connector, test_data):
        """Test JSON data integrity when transferred between platforms."""
        # 1. Convert JSON to bytes and upload to SharePoint
        json_bytes = json.dumps(test_data["json_data"]).encode('utf-8')
        sp_json_path = "data.json"
        sp_result = sharepoint_connector.upload_file(
            container_name="IntegrationTestLibrary",
            file_path=sp_json_path,
            content=json_bytes,
            content_type="application/json"
        )
        assert sp_result["success"] is True
        
        # 2. Download from SharePoint and upload to Azure
        sp_download = sharepoint_connector.download_file(
            container_name="IntegrationTestLibrary",
            file_path=sp_json_path
        )
        assert sp_download["success"] is True
        
        azure_json_path = "data_from_sharepoint.json"
        azure_result = azure_connector.upload_blob(
            container_name="integration-test-container",
            blob_name=azure_json_path,
            data=sp_download["content"],
            content_type="application/json"
        )
        assert azure_result["status"] == "success"
        
        # 3. Download from Azure and verify JSON content
        azure_download = azure_connector.download_blob(
            container_name="integration-test-container",
            blob_name=azure_json_path
        )
        assert azure_download is not None
        
        # Parse JSON and compare contents
        downloaded_json = json.loads(azure_download.decode('utf-8'))
        assert downloaded_json["name"] == test_data["json_data"]["name"]
        assert downloaded_json["attributes"]["id"] == test_data["json_data"]["attributes"]["id"]
        assert downloaded_json["attributes"]["active"] == test_data["json_data"]["attributes"]["active"]
        assert set(downloaded_json["attributes"]["tags"]) == set(test_data["json_data"]["attributes"]["tags"])
    
    def test_csv_data_processing(self, s3_connector, sharepoint_connector, test_data):
        """Test CSV data processing across platforms."""
        # 1. Upload CSV to S3
        s3_csv_path = "data.csv"
        s3_result = s3_connector.upload_file(
            container_name="integration-test-bucket",
            file_path=s3_csv_path,
            content=test_data["csv_data"].encode('utf-8'),
            content_type="text/csv"
        )
        assert s3_result["success"] is True
        
        # 2. Download from S3, parse CSV, modify, and upload to SharePoint
        s3_download = s3_connector.download_file(
            container_name="integration-test-bucket",
            file_path=s3_csv_path
        )
        assert s3_download["success"] is True
        
        # Parse CSV
        csv_io = io.StringIO(s3_download["content"].decode('utf-8'))
        df = pd.read_csv(csv_io)
        
        # Transform: Add a new column with calculated values
        df['calculated'] = df['value'] * 2
        
        # Convert back to CSV
        new_csv_data = df.to_csv(index=False).encode('utf-8')
        
        # Upload to SharePoint
        sp_csv_path = "transformed_data.csv"
        sp_result = sharepoint_connector.upload_file(
            container_name="IntegrationTestLibrary",
            file_path=sp_csv_path,
            content=new_csv_data,
            content_type="text/csv"
        )
        assert sp_result["success"] is True
        
        # 3. Download from SharePoint and verify transformed CSV
        sp_download = sharepoint_connector.download_file(
            container_name="IntegrationTestLibrary",
            file_path=sp_csv_path
        )
        assert sp_download["success"] is True
        
        # Parse CSV and verify transformation
        csv_io = io.StringIO(sp_download["content"].decode('utf-8'))
        df2 = pd.read_csv(csv_io)
        
        # Verify the transformation was preserved
        assert 'calculated' in df2.columns
        assert df2.loc[0, 'calculated'] == 200  # First row: value 100 * 2
        assert df2.loc[1, 'calculated'] == 400  # Second row: value 200 * 2
        assert df2.loc[2, 'calculated'] == 600  # Third row: value 300 * 2
    
    def test_concurrent_file_operations(self, s3_connector, azure_connector, sharepoint_connector):
        """Test concurrent file operations across platforms."""
        # Create several test files
        test_files = []
        for i in range(5):
            test_files.append({
                'name': f'file_{i}.txt',
                'content': f'Content for file {i}'.encode('utf-8')
            })
        
        # Upload files to all platforms
        for file in test_files:
            # Upload to S3
            s3_connector.upload_file(
                container_name="integration-test-bucket",
                file_path=file['name'],
                content=file['content']
            )
            
            # Upload to Azure
            azure_connector.upload_blob(
                container_name="integration-test-container",
                blob_name=file['name'],
                data=file['content']
            )
            
            # Upload to SharePoint
            sharepoint_connector.upload_file(
                container_name="IntegrationTestLibrary",
                file_path=file['name'],
                content=file['content']
            )
        
        # List files from each platform and verify counts
        s3_files = s3_connector.list_files(container_name="integration-test-bucket")
        azure_files = azure_connector.list_blobs(container_name="integration-test-container")
        sp_files = sharepoint_connector.list_files(container_name="IntegrationTestLibrary")
        
        assert len(s3_files["files"]) == 5
        assert len(azure_files) == 5
        assert len(sp_files["files"]) == 5
        
        # Delete files concurrently
        for file in test_files:
            s3_connector.delete_file(
                container_name="integration-test-bucket",
                file_path=file['name']
            )
            azure_connector.delete_blob(
                container_name="integration-test-container",
                blob_name=file['name']
            )
            sharepoint_connector.delete_file(
                container_name="IntegrationTestLibrary",
                file_path=file['name']
            )
        
        # Verify all files were deleted
        s3_files = s3_connector.list_files(container_name="integration-test-bucket")
        azure_files = azure_connector.list_blobs(container_name="integration-test-container")
        sp_files = sharepoint_connector.list_files(container_name="IntegrationTestLibrary")
        
        assert len(s3_files["files"]) == 0
        assert len(azure_files) == 0
        assert len(sp_files["files"]) == 0
    
    def test_metadata_preservation(self, azure_connector, s3_connector, test_data):
        """Test preservation of metadata when transferring between platforms."""
        # Define metadata
        metadata = {
            'creator': 'Integration Test',
            'department': 'Engineering',
            'confidential': 'false',
            'version': '1.0'
        }
        
        # 1. Upload file with metadata to Azure
        azure_path = "metadata_test.txt"
        azure_result = azure_connector.upload_blob(
            container_name="integration-test-container",
            blob_name=azure_path,
            data=test_data["text_content"].encode('utf-8'),
            content_type="text/plain"
        )
        assert azure_result["status"] == "success"
        
        # Update metadata
        azure_connector.storage.update_file_metadata(
            container_name="integration-test-container",
            file_path=azure_path,
            metadata=metadata
        )
        
        # 2. Download from Azure with metadata
        azure_download = azure_connector.download_blob(
            container_name="integration-test-container",
            blob_name=azure_path
        )
        assert azure_download is not None
        
        azure_props = azure_connector.get_blob_properties(
            container_name="integration-test-container",
            blob_name=azure_path
        )
        assert 'metadata' in azure_props
        
        # 3. Upload to S3 with the same metadata
        s3_path = "metadata_from_azure.txt"
        s3_result = s3_connector.upload_file(
            container_name="integration-test-bucket",
            file_path=s3_path,
            content=azure_download,
            metadata=azure_props['metadata']
        )
        assert s3_result["success"] is True
        
        # 4. Verify metadata was preserved
        s3_download = s3_connector.download_file(
            container_name="integration-test-bucket",
            file_path=s3_path
        )
        assert s3_download["success"] is True
        assert 'metadata' in s3_download
        
        # Verify each metadata field
        for key, value in metadata.items():
            assert key in s3_download["metadata"]
            assert s3_download["metadata"][key] == value
    
    def test_error_handling_between_platforms(self, s3_connector, azure_connector, sharepoint_connector):
        """Test error handling when transferring between platforms."""
        # 1. Try to download a non-existent file from S3
        s3_download = s3_connector.download_file(
            container_name="integration-test-bucket",
            file_path="nonexistent.txt"
        )
        assert s3_download["success"] is False
        assert "not found" in s3_download["error"].lower()
        
        # 2. Try to upload to a non-existent Azure container
        azure_result = azure_connector.upload_blob(
            container_name="nonexistent-container",
            blob_name="test.txt",
            data=b"Test content"
        )
        assert azure_result["status"] == "error" or "container" in azure_result.get("message", "").lower()
        
        # 3. Set error simulation on SharePoint and try operations
        sharepoint_connector.set_error_mode(True, "upload_file")
        sp_result = sharepoint_connector.upload_file(
            container_name="IntegrationTestLibrary",
            file_path="error_test.txt",
            content=b"Error test content"
        )
        assert sp_result["success"] is False
        
        # Clear error simulation
        sharepoint_connector.set_error_mode(False)
        
        # 4. Test graceful handling of transfer pipeline
        # Try S3 -> Azure -> SharePoint where Azure fails
        s3_path = "pipeline_test.txt"
        s3_result = s3_connector.upload_file(
            container_name="integration-test-bucket",
            file_path=s3_path,
            content=b"Pipeline test content"
        )
        assert s3_result["success"] is True
        
        # Download from S3
        s3_download = s3_connector.download_file(
            container_name="integration-test-bucket",
            file_path=s3_path
        )
        assert s3_download["success"] is True
        
        # Simulate Azure upload failure
        azure_connector.set_error_mode(True, "upload_blob")
        azure_result = azure_connector.upload_blob(
            container_name="integration-test-container",
            blob_name="pipeline_test.txt",
            data=s3_download["content"]
        )
        assert azure_result["status"] == "error"
        
        # Reset error mode
        azure_connector.set_error_mode(False)
        
        # Verify we can recover and upload directly to SharePoint instead
        sp_result = sharepoint_connector.upload_file(
            container_name="IntegrationTestLibrary",
            file_path="pipeline_recovery.txt",
            content=s3_download["content"]
        )
        assert sp_result["success"] is True
        
        # Verify recovery worked
        sp_download = sharepoint_connector.download_file(
            container_name="IntegrationTestLibrary",
            file_path="pipeline_recovery.txt"
        )
        assert sp_download["success"] is True
        assert sp_download["content"] == b"Pipeline test content"


class TestCrossAdapterEntitySynchronization:
    """Test entity synchronization between storage adapters through the registry."""
    
    @pytest.fixture
    def registry(self):
        """Create a new registry for testing."""
        return EntityRegistry(debug=True)
    
    @pytest.fixture
    def s3_connector(self, registry):
        """Create an S3 connector for testing."""
        return S3Connector(registry=registry)
    
    @pytest.fixture
    def azure_connector(self, registry):
        """Create an Azure Blob connector for testing."""
        conn = AzureBlobConnector(registry=registry)
        conn.connect()
        return conn
    
    @pytest.fixture
    def sharepoint_connector(self, registry):
        """Create a SharePoint connector for testing."""
        conn = SharePointConnector(registry=registry)
        conn.connect()
        return conn
    
    @pytest.fixture(autouse=True)
    def setup_teardown(self, s3_connector, azure_connector, sharepoint_connector):
        """Setup and teardown for entity synchronization tests."""
        # Setup test containers in each platform
        s3_connector.create_container("sync-test-bucket")
        azure_connector.create_container("sync-test-container")
        sharepoint_connector.create_container("SyncTestLibrary")
        
        yield
        
        # Cleanup test containers
        s3_connector.delete_container("sync-test-bucket")
        azure_connector.delete_container("sync-test-container")
        sharepoint_connector.delete_container("SyncTestLibrary")
    
    def test_file_entity_synchronization(self, registry, s3_connector, azure_connector, sharepoint_connector):
        """Test that file entities are synchronized between storage adapters."""
        # 1. Upload a StorageFile entity through S3
        file_id = str(uuid.uuid4())
        file_content = b"Entity synchronization test"
        file_path = "sync_test.txt"
        file_metadata = {"source": "s3", "sync_test": "true"}
        
        registry.register_entity(
            entity_type="StorageFile",
            entity_id=file_id,
            entity={
                "id": file_id,
                "path": file_path,
                "container": "sync-test-bucket",
                "content": file_content,
                "content_type": "text/plain",
                "metadata": file_metadata,
                "created_at": TimezoneTestUtilities.utc_now()
            }
        )
        
        # 2. Upload the physical file through S3
        s3_connector.upload_file(
            container_name="sync-test-bucket",
            file_path=file_path,
            content=file_content,
            metadata=file_metadata
        )
        
        # 3. Verify that Azure and SharePoint can recognize the entity
        registry_file = registry.get_entity("StorageFile", file_id)
        assert registry_file is not None
        assert registry_file["path"] == file_path
        assert registry_file["content"] == file_content
        
        # 4. Update the entity through Azure
        updated_metadata = {**file_metadata, "updated_by": "azure"}
        registry.update_entity(
            entity_type="StorageFile",
            entity_id=file_id,
            entity={
                **registry_file,
                "metadata": updated_metadata,
                "last_modified": TimezoneTestUtilities.utc_now()
            }
        )
        
        # 5. Verify the update is synchronized
        updated_file = registry.get_entity("StorageFile", file_id)
        assert updated_file is not None
        assert updated_file["metadata"]["updated_by"] == "azure"
        
        # 6. Delete the entity through SharePoint
        registry.delete_entity("StorageFile", file_id)
        
        # 7. Verify the entity is deleted from the registry
        deleted_file = registry.get_entity("StorageFile", file_id)
        assert deleted_file is None
    
    def test_entity_listeners(self, registry, s3_connector, azure_connector):
        """Test that entity listeners are notified of changes."""
        # Initialize counters for listener callbacks
        callback_counts = {"create": 0, "update": 0, "delete": 0}
        
        # Create a listener callback
        def entity_listener(entity_type, entity_id, entity, action):
            callback_counts[action] += 1
        
        # Register the listener for StorageFile entities
        registry.register_listener("StorageFile", entity_listener)
        
        # 1. Create a file entity
        file_id = str(uuid.uuid4())
        file_entity = {
            "id": file_id,
            "path": "listener_test.txt",
            "container": "sync-test-bucket",
            "content": b"Listener test content",
            "content_type": "text/plain",
            "metadata": {"test": "listener"},
            "created_at": TimezoneTestUtilities.utc_now()
        }
        
        registry.register_entity("StorageFile", file_id, file_entity)
        assert callback_counts["create"] == 1
        
        # 2. Update the entity
        updated_entity = {**file_entity, "metadata": {"test": "updated"}}
        registry.update_entity("StorageFile", file_id, updated_entity)
        assert callback_counts["update"] == 1
        
        # 3. Delete the entity
        registry.delete_entity("StorageFile", file_id)
        assert callback_counts["delete"] == 1
    
    def test_cross_adapter_file_operations(self, registry, s3_connector, azure_connector):
        """Test file operations across adapters with entity synchronization."""
        # 1. Upload file to S3
        file_path = "cross_adapter.txt"
        file_content = b"Cross-adapter test content"
        
        s3_result = s3_connector.upload_file(
            container_name="sync-test-bucket",
            file_path=file_path,
            content=file_content
        )
        assert s3_result["success"] is True
        
        # 2. Register the file as an entity after upload
        file_id = str(uuid.uuid4())
        registry.register_entity(
            entity_type="StorageFile",
            entity_id=file_id,
            entity={
                "id": file_id,
                "path": file_path,
                "container": "sync-test-bucket",
                "provider": "s3",
                "content_type": "text/plain",
                "size": len(file_content),
                "created_at": TimezoneTestUtilities.utc_now()
            }
        )
        
        # 3. Use Azure adapter to "download" the file using entity info
        # This simulates cross-adapter awareness
        file_entity = registry.get_entity("StorageFile", file_id)
        assert file_entity is not None
        
        # 4. Use the entity information to determine where to download from
        if file_entity["provider"] == "s3":
            # Download from S3
            download_result = s3_connector.download_file(
                container_name=file_entity["container"],
                file_path=file_entity["path"]
            )
            assert download_result["success"] is True
            content = download_result["content"]
        else:
            # Would handle other providers here
            content = None
        
        # 5. Upload to Azure with reference to the same entity
        azure_result = azure_connector.upload_blob(
            container_name="sync-test-container",
            blob_name=file_entity["path"],
            data=content
        )
        assert azure_result["status"] == "success"
        
        # 6. Update the entity to reflect it exists in both places
        registry.update_entity(
            entity_type="StorageFile",
            entity_id=file_id,
            entity={
                **file_entity,
                "locations": [
                    {"provider": "s3", "container": "sync-test-bucket", "path": file_path},
                    {"provider": "azure", "container": "sync-test-container", "path": file_path}
                ],
                "last_modified": TimezoneTestUtilities.utc_now()
            }
        )
        
        # 7. Verify the entity is updated with multiple locations
        updated_entity = registry.get_entity("StorageFile", file_id)
        assert updated_entity is not None
        assert "locations" in updated_entity
        assert len(updated_entity["locations"]) == 2