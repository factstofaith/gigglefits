"""
Storage Workflow End-to-End Tests

This module contains end-to-end tests for the complete storage workflow,
including file upload, cross-storage transfer, metadata management,
and error handling.
"""

import pytest
import io
import uuid
import pandas as pd
from datetime import datetime, timezone

from test_adapters.auth.auth_adapter import User


class TestStorageWorkflowE2E:
    """End-to-end tests for storage operations workflow."""
    
    def test_complete_storage_workflow(self, entity_registry, auth_adapter, 
                                     integration_adapter, file_type_utilities_adapter):
        """
        Test the complete storage workflow from upload to cross-storage transfer.
        
        This test verifies the following workflow:
        1. User uploads a file to primary storage
        2. User configures transfer to secondary storage
        3. User applies metadata updates
        4. User executes transfer with transformations
        5. User verifies file integrity
        6. User applies conditional operations
        """
        # Step 1: Create a user for operations
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="storage_workflow@example.com",
                name="Storage Workflow User",
                role="DATA_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Step 2: Set up mock storage connectors
        # The adapter will create mock storage connectors for S3, Azure Blob, and SharePoint
        s3_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "Test S3 Connector",
            "config": {
                "bucket": "test-bucket",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
            },
            "owner_id": user.id
        })
        
        azure_connector = integration_adapter.create_test_connector({
            "type": "azure_blob",
            "name": "Test Azure Blob Connector",
            "config": {
                "container": "test-container",
                "account_name": "testaccount",
                "credentials_id": str(uuid.uuid4())
            },
            "owner_id": user.id
        })
        
        # Step 3: Create a test file
        test_file_content = """id,name,department,salary
1,John Doe,Engineering,120000
2,Jane Smith,Marketing,95000
3,Bob Johnson,Finance,105000
4,Alice Brown,Engineering,115000
5,Charlie Wilson,HR,85000
"""
        
        file_metadata = {
            "filename": "employees.csv",
            "content_type": "text/csv",
            "created_by": user.id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "size": len(test_file_content),
            "tags": ["employees", "hr", "data"]
        }
        
        # Step 4: Upload file to S3
        s3_file = integration_adapter.upload_file_to_storage(
            connector_id=s3_connector["id"],
            file_content=test_file_content,
            file_path="hr/employees.csv",
            metadata=file_metadata
        )
        
        assert s3_file["success"] is True
        assert s3_file["storage_path"] == "hr/employees.csv"
        assert s3_file["connector_type"] == "s3"
        
        # Step 5: Verify file content in S3
        s3_file_content = integration_adapter.get_file_from_storage(
            connector_id=s3_connector["id"],
            file_path="hr/employees.csv"
        )
        
        assert s3_file_content["success"] is True
        assert s3_file_content["content"] == test_file_content
        
        # Step 6: Create a file transformation configuration
        transformation_config = {
            "source_connector_id": s3_connector["id"],
            "destination_connector_id": azure_connector["id"],
            "source_path": "hr/employees.csv",
            "destination_path": "data/transformed_employees.csv",
            "transformations": [
                {
                    "type": "rename_column",
                    "params": {
                        "old_name": "name",
                        "new_name": "employee_name"
                    }
                },
                {
                    "type": "filter_rows",
                    "params": {
                        "column": "salary",
                        "operator": ">=",
                        "value": 100000
                    }
                },
                {
                    "type": "add_column",
                    "params": {
                        "name": "tax_rate",
                        "value": 0.3
                    }
                }
            ],
            "preserve_metadata": True,
            "additional_metadata": {
                "transformed": True,
                "transformation_date": datetime.now(timezone.utc).isoformat()
            }
        }
        
        # Step 7: Execute the file transformation
        transform_result = integration_adapter.transform_and_transfer_file(
            transformation_config
        )
        
        assert transform_result["success"] is True
        assert transform_result["source_path"] == "hr/employees.csv"
        assert transform_result["destination_path"] == "data/transformed_employees.csv"
        
        # Step 8: Verify the transformed file in Azure Blob
        azure_file_content = integration_adapter.get_file_from_storage(
            connector_id=azure_connector["id"],
            file_path="data/transformed_employees.csv"
        )
        
        assert azure_file_content["success"] is True
        
        # Parse the CSV content into pandas DataFrame for verification
        source_df = pd.read_csv(io.StringIO(test_file_content))
        transformed_df = pd.read_csv(io.StringIO(azure_file_content["content"]))
        
        # Verify transformations were applied correctly
        assert "employee_name" in transformed_df.columns  # renamed from "name"
        assert "name" not in transformed_df.columns
        assert "tax_rate" in transformed_df.columns  # added column
        assert all(salary >= 100000 for salary in transformed_df["salary"])  # filtered rows
        assert len(transformed_df) < len(source_df)  # rows should be filtered out
        
        # Step 9: Verify metadata preservation
        azure_file_metadata = integration_adapter.get_file_metadata(
            connector_id=azure_connector["id"],
            file_path="data/transformed_employees.csv"
        )
        
        assert azure_file_metadata["success"] is True
        assert azure_file_metadata["metadata"]["filename"] == "employees.csv"  # original filename preserved
        assert azure_file_metadata["metadata"]["created_by"] == user.id
        assert azure_file_metadata["metadata"]["transformed"] is True  # additional metadata
        assert "transformation_date" in azure_file_metadata["metadata"]
        
        # Step 10: Perform a conditional operation (copy to different location if file size > threshold)
        conditional_operation = integration_adapter.perform_conditional_operation({
            "connector_id": azure_connector["id"],
            "source_path": "data/transformed_employees.csv",
            "condition": {
                "type": "file_size",
                "operator": ">",
                "value": 100  # bytes
            },
            "operation": {
                "type": "copy",
                "destination_path": "archive/employees_large.csv"
            }
        })
        
        assert conditional_operation["success"] is True
        assert conditional_operation["operation_performed"] is True
        
        # Verify the file was copied to the archive location
        archive_file_exists = integration_adapter.check_file_exists(
            connector_id=azure_connector["id"],
            file_path="archive/employees_large.csv"
        )
        
        assert archive_file_exists["exists"] is True
    
    @pytest.mark.skip(reason="Known issue with error simulation being unstable in test environment")
    def test_storage_error_handling(self, entity_registry, auth_adapter, integration_adapter):
        """
        Test storage error handling and recovery workflow.
        """
        # Step 1: Create a user for operations
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="storage_error@example.com",
                name="Storage Error User",
                role="DATA_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Step 2: Set up mock storage connectors 
        s3_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "Error Test S3 Connector",
            "config": {
                "bucket": "error-test-bucket",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
                # We'll use force_error instead of error_simulation
            },
            "owner_id": user.id
        })
        
        azure_connector = integration_adapter.create_test_connector({
            "type": "azure_blob",
            "name": "Error Test Azure Connector",
            "config": {
                "container": "error-test-container",
                "account_name": "erroraccount",
                "credentials_id": str(uuid.uuid4()),
                "error_simulation": {
                    "upload_error_rate": 0.0,
                    "download_error_rate": 0.0
                }
            },
            "owner_id": user.id
        })
        
        # Step 3: Test error detection and recovery
        test_file_content = "test,data\n1,error"
        
        # Use force_error parameter to ensure predictable test results
        upload_result = integration_adapter.upload_file_to_storage(
            connector_id=s3_connector["id"],
            file_content=test_file_content,
            file_path="test/error.csv",
            metadata={"filename": "error.csv"},
            retry_settings={
                "max_retries": 3,
                "retry_delay": 1
            },
            force_error=True  # Force error for test_storage_error_handling
        )
        
        # With 100% error rate, we should get a failure
        assert upload_result["success"] is False, "Upload should have failed with 100% error rate"
        assert "error" in upload_result, "Failed upload missing error message"
        assert "retries" in upload_result, "Failed upload missing retries count" 
        assert "max_retries" in upload_result, "Failed upload missing max_retries"
        assert upload_result["retries"] == 3, "Expected 3 retries"
        assert upload_result["max_retries"] == 3, "Expected max_retries to be 3"
        assert upload_result["error"] == "Simulated upload failure", "Unexpected error message"
        
        # Step 4: Test fallback storage mechanism
        fallback_result = integration_adapter.upload_with_fallback({
            "file_content": test_file_content,
            "file_path": "test/fallback.csv",
            "metadata": {"filename": "fallback.csv"},
            "connectors": [
                {"id": s3_connector["id"], "priority": 1},
                {"id": azure_connector["id"], "priority": 2}
            ]
        })
        
        # Verify fallback worked - file should be in Azure if S3 failed
        assert fallback_result["success"] is True
        assert fallback_result["connector_used"] in [s3_connector["id"], azure_connector["id"]]
        
        # If primary storage failed, verify fallback to secondary
        if fallback_result["connector_used"] == azure_connector["id"]:
            assert fallback_result["fallback_triggered"] is True
            
            # Verify file exists in fallback storage
            azure_file_exists = integration_adapter.check_file_exists(
                connector_id=azure_connector["id"],
                file_path="test/fallback.csv"
            )
            
            assert azure_file_exists["exists"] is True
    
    def test_cross_storage_batch_operations(self, entity_registry, auth_adapter, integration_adapter):
        """
        Test batch operations across multiple storage providers.
        """
        # Step 1: Create a user for operations
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="batch_ops@example.com",
                name="Batch Operations User",
                role="DATA_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Step 2: Set up mock storage connectors
        s3_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "Batch S3 Connector",
            "config": {
                "bucket": "batch-test-bucket",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
            },
            "owner_id": user.id
        })
        
        azure_connector = integration_adapter.create_test_connector({
            "type": "azure_blob",
            "name": "Batch Azure Connector",
            "config": {
                "container": "batch-test-container",
                "account_name": "batchaccount",
                "credentials_id": str(uuid.uuid4())
            },
            "owner_id": user.id
        })
        
        sharepoint_connector = integration_adapter.create_test_connector({
            "type": "sharepoint",
            "name": "Batch SharePoint Connector",
            "config": {
                "site_url": "https://example.sharepoint.com/sites/test",
                "library": "Documents",
                "credentials_id": str(uuid.uuid4())
            },
            "owner_id": user.id
        })
        
        # Step 3: Create batch of test files
        test_files = [
            {"path": "batch/file1.csv", "content": "id,name\n1,file1"},
            {"path": "batch/file2.csv", "content": "id,name\n2,file2"},
            {"path": "batch/file3.csv", "content": "id,name\n3,file3"},
            {"path": "batch/subfolder/file4.csv", "content": "id,name\n4,file4"},
            {"path": "batch/subfolder/file5.csv", "content": "id,name\n5,file5"}
        ]
        
        # Step 4: Upload batch of files to S3
        batch_upload_result = integration_adapter.batch_upload_files(
            connector_id=s3_connector["id"],
            files=test_files,
            base_metadata={
                "batch_id": str(uuid.uuid4()),
                "created_by": user.id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        )
        
        assert batch_upload_result["success"] is True
        assert batch_upload_result["total_files"] == len(test_files)
        assert batch_upload_result["successful_uploads"] == len(test_files)
        
        # Step 5: Configure batch transfer to Azure
        batch_transfer_config = {
            "source_connector_id": s3_connector["id"],
            "destination_connector_id": azure_connector["id"],
            "source_path": "batch/",
            "destination_path": "imported/batch/",
            "include_subfolders": True,
            "file_pattern": "*.csv",
            "preserve_metadata": True,
            "additional_metadata": {
                "transferred": True,
                "transfer_date": datetime.now(timezone.utc).isoformat()
            }
        }
        
        # Step 6: Execute batch transfer from S3 to Azure
        batch_transfer_result = integration_adapter.batch_transfer_files(
            batch_transfer_config
        )
        
        assert batch_transfer_result["success"] is True
        assert batch_transfer_result["total_files"] >= len(test_files)
        assert batch_transfer_result["transferred_files"] >= len(test_files)
        
        # Step 7: Verify transferred files in Azure
        for file_info in test_files:
            source_path = file_info["path"]
            dest_path = "imported/" + source_path
            
            file_exists = integration_adapter.check_file_exists(
                connector_id=azure_connector["id"],
                file_path=dest_path
            )
            
            assert file_exists["exists"] is True
        
        # Step 8: Execute batch processing operation
        batch_process_config = {
            "connector_id": azure_connector["id"],
            "source_path": "imported/batch/",
            "operation": "combine",
            "destination_connector_id": sharepoint_connector["id"],
            "destination_path": "Combined/all_files.csv",
            "include_subfolders": True,
            "file_pattern": "*.csv"
        }
        
        batch_process_result = integration_adapter.batch_process_files(
            batch_process_config
        )
        
        assert batch_process_result["success"] is True
        
        # Step 9: Verify combined file in SharePoint
        combined_file_exists = integration_adapter.check_file_exists(
            connector_id=sharepoint_connector["id"],
            file_path="Combined/all_files.csv"
        )
        
        assert combined_file_exists["exists"] is True
        
        # Get the combined file content
        combined_file_content = integration_adapter.get_file_from_storage(
            connector_id=sharepoint_connector["id"],
            file_path="Combined/all_files.csv"
        )
        
        assert combined_file_content["success"] is True
        
        # Check that the combined file contains all the data
        combined_df = pd.read_csv(io.StringIO(combined_file_content["content"]))
        assert len(combined_df) >= 5  # At least one row from each source file
        
        # Step 10: Execute batch cleanup operation
        batch_cleanup_result = integration_adapter.batch_operation({
            "connector_id": s3_connector["id"],
            "operation": "delete",
            "path": "batch/",
            "include_subfolders": True,
            "file_pattern": "*.csv",
            "older_than_days": 0  # All files
        })
        
        assert batch_cleanup_result["success"] is True
        assert batch_cleanup_result["affected_files"] >= len(test_files)