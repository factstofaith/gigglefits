"""
Storage Workflow End-to-End Optimized Tests

This module contains optimized end-to-end tests for the complete storage workflow,
using the E2E test adapter for workflow tracking and cross-component integration.
"""

import pytest
import io
import uuid
import pandas as pd
from datetime import datetime, timezone

from test_adapters.auth.auth_adapter import User


class TestStorageWorkflowE2EOptimized:
    """Optimized end-to-end tests for storage operations workflow using the E2E adapter."""
    
    def test_complete_storage_workflow(self, entity_registry, e2e_adapter):
        """
        Test the complete storage workflow from upload to cross-storage transfer using
        the optimized E2E adapter for workflow tracking.
        
        This test verifies the storage workflow with clear step progression and
        comprehensive tracking of the process.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "storage-workflow-1",
            "Complete Storage Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create a user for operations
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_user",
                "Create a user for storage operations"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            user = e2e_adapter.auth_adapter.create_user(
                email="storage_workflow_opt@example.com",
                name="Storage Workflow User Optimized",
                role="DATA_MANAGER"
            )
            
            # Associate the user entity with this step
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", user.id)
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success",
                {"user_id": user.id}
            )
            
            # Step 2: Set up mock storage connectors
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "setup_storage_connectors",
                "Set up mock storage connectors for testing"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            integration_adapter = e2e_adapter.integration_adapter
            
            s3_connector = integration_adapter.create_test_connector({
                "type": "s3",
                "name": "Test S3 Connector Optimized",
                "config": {
                    "bucket": "test-bucket-opt",
                    "region": "us-east-1",
                    "credentials_id": str(uuid.uuid4())
                },
                "owner_id": user.id
            })
            
            azure_connector = integration_adapter.create_test_connector({
                "type": "azure_blob",
                "name": "Test Azure Blob Connector Optimized",
                "config": {
                    "container": "test-container-opt",
                    "account_name": "testaccountopt",
                    "credentials_id": str(uuid.uuid4())
                },
                "owner_id": user.id
            })
            
            # Associate entities with this step
            e2e_adapter.associate_entity(workflow_id, step2["id"], "Connector", str(s3_connector["id"]))
            e2e_adapter.associate_entity(workflow_id, step2["id"], "Connector", str(azure_connector["id"]))
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {
                    "s3_connector_id": s3_connector["id"],
                    "azure_connector_id": azure_connector["id"]
                }
            )
            
            # Step 3: Create and prepare test file
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "prepare_test_file",
                "Prepare test file content and metadata"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            test_file_content = """id,name,department,salary
1,John Doe,Engineering,120000
2,Jane Smith,Marketing,95000
3,Bob Johnson,Finance,105000
4,Alice Brown,Engineering,115000
5,Charlie Wilson,HR,85000
"""
            
            file_metadata = {
                "filename": "employees_opt.csv",
                "content_type": "text/csv",
                "created_by": user.id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "size": len(test_file_content),
                "tags": ["employees", "hr", "data"]
            }
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                {
                    "file_size": len(test_file_content),
                    "metadata": file_metadata
                }
            )
            
            # Step 4: Upload file to S3
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "upload_to_s3",
                "Upload test file to S3 storage"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            s3_file = integration_adapter.upload_file_to_storage(
                connector_id=s3_connector["id"],
                file_content=test_file_content,
                file_path="hr/employees_opt.csv",
                metadata=file_metadata
            )
            
            assert s3_file["success"] is True
            assert s3_file["storage_path"] == "hr/employees_opt.csv"
            assert s3_file["connector_type"] == "s3"
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                {
                    "storage_path": s3_file["storage_path"],
                    "upload_success": s3_file["success"]
                }
            )
            
            # Step 5: Verify file in S3
            step5 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_s3_file",
                "Verify uploaded file content in S3"
            )
            e2e_adapter.start_step(workflow_id, step5["id"])
            
            s3_file_content = integration_adapter.get_file_from_storage(
                connector_id=s3_connector["id"],
                file_path="hr/employees_opt.csv"
            )
            
            assert s3_file_content["success"] is True
            assert s3_file_content["content"] == test_file_content
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step5["id"], 
                "success",
                {
                    "content_verified": True,
                    "content_size": len(s3_file_content["content"])
                }
            )
            
            # Step 6: Configure file transformation
            step6 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_transformation",
                "Configure file transformation settings"
            )
            e2e_adapter.start_step(workflow_id, step6["id"])
            
            transformation_config = {
                "source_connector_id": s3_connector["id"],
                "destination_connector_id": azure_connector["id"],
                "source_path": "hr/employees_opt.csv",
                "destination_path": "data/transformed_employees_opt.csv",
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
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step6["id"], 
                "success",
                {
                    "transformation_count": len(transformation_config["transformations"]),
                    "configured": True
                }
            )
            
            # Step 7: Execute file transformation
            step7 = e2e_adapter.add_workflow_step(
                workflow_id,
                "execute_transformation",
                "Execute file transformation and transfer"
            )
            e2e_adapter.start_step(workflow_id, step7["id"])
            
            transform_result = integration_adapter.transform_and_transfer_file(
                transformation_config
            )
            
            assert transform_result["success"] is True
            assert transform_result["source_path"] == "hr/employees_opt.csv"
            assert transform_result["destination_path"] == "data/transformed_employees_opt.csv"
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step7["id"], 
                "success",
                {
                    "transformation_success": transform_result["success"],
                    "destination_path": transform_result["destination_path"]
                }
            )
            
            # Step 8: Verify transformed file
            step8 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_transformed_file",
                "Verify transformed file in destination storage"
            )
            e2e_adapter.start_step(workflow_id, step8["id"])
            
            azure_file_content = integration_adapter.get_file_from_storage(
                connector_id=azure_connector["id"],
                file_path="data/transformed_employees_opt.csv"
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
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step8["id"], 
                "success",
                {
                    "verification_success": True,
                    "rows_before": len(source_df),
                    "rows_after": len(transformed_df),
                    "transformations_verified": [
                        "column_renamed", "column_added", "rows_filtered"
                    ]
                }
            )
            
            # Step 9: Verify metadata
            step9 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_metadata",
                "Verify metadata preservation and enhancements"
            )
            e2e_adapter.start_step(workflow_id, step9["id"])
            
            azure_file_metadata = integration_adapter.get_file_metadata(
                connector_id=azure_connector["id"],
                file_path="data/transformed_employees_opt.csv"
            )
            
            assert azure_file_metadata["success"] is True
            assert azure_file_metadata["metadata"]["filename"] == "employees_opt.csv"  # original filename preserved
            assert azure_file_metadata["metadata"]["created_by"] == user.id
            assert azure_file_metadata["metadata"]["transformed"] is True  # additional metadata
            assert "transformation_date" in azure_file_metadata["metadata"]
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step9["id"], 
                "success",
                {
                    "metadata_verified": True,
                    "preserved_fields": ["filename", "created_by"],
                    "added_fields": ["transformed", "transformation_date"]
                }
            )
            
            # Step 10: Perform conditional operation
            step10 = e2e_adapter.add_workflow_step(
                workflow_id,
                "conditional_operation",
                "Perform conditional file operation"
            )
            e2e_adapter.start_step(workflow_id, step10["id"])
            
            conditional_operation = integration_adapter.perform_conditional_operation({
                "connector_id": azure_connector["id"],
                "source_path": "data/transformed_employees_opt.csv",
                "condition": {
                    "type": "file_size",
                    "operator": ">",
                    "value": 100  # bytes
                },
                "operation": {
                    "type": "copy",
                    "destination_path": "archive/employees_opt_large.csv"
                }
            })
            
            assert conditional_operation["success"] is True
            assert conditional_operation["operation_performed"] is True
            
            # Verify the file was copied to the archive location
            archive_file_exists = integration_adapter.check_file_exists(
                connector_id=azure_connector["id"],
                file_path="archive/employees_opt_large.csv"
            )
            
            assert archive_file_exists["exists"] is True
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step10["id"], 
                "success",
                {
                    "condition_evaluated": True,
                    "condition_result": True,
                    "operation_performed": conditional_operation["operation_performed"],
                    "destination_path": "archive/employees_opt_large.csv"
                }
            )
            
            # Complete the workflow
            e2e_adapter.complete_workflow(workflow_id, "completed")
            
            # Verify workflow completion and success
            workflow_status = e2e_adapter.get_workflow_status(workflow_id)
            assert workflow_status == "completed"
            
            # Check all steps were completed successfully
            workflow = e2e_adapter.get_workflow(workflow_id)
            for step in workflow["steps"]:
                assert step["status"] == "success"
                
        except Exception as e:
            # In case of error, mark the current step and workflow as failed
            current_step = workflow.get("current_step", 0)
            if current_step < len(workflow["steps"]):
                e2e_adapter.complete_step(
                    workflow_id, 
                    current_step, 
                    "failure",
                    {"error": str(e)}
                )
            e2e_adapter.complete_workflow(workflow_id, "failed")
            raise
    
    def test_storage_error_recovery_workflow(self, entity_registry, e2e_adapter):
        """
        Test the storage error handling and recovery workflow using
        the optimized E2E adapter for workflow tracking.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "storage-error-recovery-1",
            "Storage Error Recovery Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create a user for operations
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_user",
                "Create a user for storage error testing"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            user = e2e_adapter.auth_adapter.create_user(
                email="storage_error_opt@example.com",
                name="Storage Error User Optimized",
                role="DATA_MANAGER"
            )
            
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", user.id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success",
                {"user_id": user.id}
            )
            
            # Step 2: Set up mock storage connectors with error simulation
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "setup_error_connectors",
                "Set up mock storage connectors with error simulation"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            integration_adapter = e2e_adapter.integration_adapter
            
            s3_connector = integration_adapter.create_test_connector({
                "type": "s3",
                "name": "Error Test S3 Connector Optimized",
                "config": {
                    "bucket": "error-test-bucket-opt",
                    "region": "us-east-1",
                    "credentials_id": str(uuid.uuid4()),
                    "error_simulation": {
                        "upload_error_rate": 0.5,  # 50% chance of upload failure
                        "download_error_rate": 0.0
                    }
                },
                "owner_id": user.id
            })
            
            azure_connector = integration_adapter.create_test_connector({
                "type": "azure_blob",
                "name": "Error Test Azure Connector Optimized",
                "config": {
                    "container": "error-test-container-opt",
                    "account_name": "erroraccountopt",
                    "credentials_id": str(uuid.uuid4()),
                    "error_simulation": {
                        "upload_error_rate": 0.0,
                        "download_error_rate": 0.0
                    }
                },
                "owner_id": user.id
            })
            
            e2e_adapter.associate_entity(workflow_id, step2["id"], "Connector", str(s3_connector["id"]))
            e2e_adapter.associate_entity(workflow_id, step2["id"], "Connector", str(azure_connector["id"]))
            
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {
                    "s3_connector_id": s3_connector["id"],
                    "azure_connector_id": azure_connector["id"],
                    "error_rates": {
                        "s3_upload": "50%",
                        "azure_upload": "0%"
                    }
                }
            )
            
            # Step 3: Test file upload with retry
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "test_upload_retry",
                "Test file upload with automatic retry mechanism"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            test_file_content = "test,data\n1,error"
            
            upload_result = integration_adapter.upload_file_to_storage(
                connector_id=s3_connector["id"],
                file_content=test_file_content,
                file_path="test/error_opt.csv",
                metadata={"filename": "error_opt.csv"},
                retry_settings={
                    "max_retries": 3,
                    "retry_delay": 1
                }
            )
            
            retry_status = {
                "attempted_retries": upload_result.get("retries", 0),
                "final_success": upload_result["success"]
            }
            
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                retry_status
            )
            
            # Step 4: Test fallback mechanism
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "test_fallback_mechanism",
                "Test storage fallback mechanism"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            fallback_result = integration_adapter.upload_with_fallback({
                "file_content": test_file_content,
                "file_path": "test/fallback_opt.csv",
                "metadata": {"filename": "fallback_opt.csv"},
                "connectors": [
                    {"id": s3_connector["id"], "priority": 1},
                    {"id": azure_connector["id"], "priority": 2}
                ]
            })
            
            assert fallback_result["success"] is True
            
            fallback_status = {
                "primary_connector": s3_connector["id"],
                "connector_used": fallback_result["connector_used"],
                "fallback_triggered": fallback_result.get("fallback_triggered", False),
                "success": fallback_result["success"]
            }
            
            # If fallback was used, verify file exists in fallback storage
            if fallback_result["connector_used"] == azure_connector["id"]:
                azure_file_exists = integration_adapter.check_file_exists(
                    connector_id=azure_connector["id"],
                    file_path="test/fallback_opt.csv"
                )
                
                fallback_status["file_in_fallback_storage"] = azure_file_exists["exists"]
            
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                fallback_status
            )
            
            # Complete the workflow
            e2e_adapter.complete_workflow(workflow_id, "completed")
            
            # Verify workflow completion
            workflow_status = e2e_adapter.get_workflow_status(workflow_id)
            assert workflow_status == "completed"
            
        except Exception as e:
            # In case of error, mark the current step and workflow as failed
            current_step = workflow.get("current_step", 0)
            if current_step < len(workflow["steps"]):
                e2e_adapter.complete_step(
                    workflow_id, 
                    current_step, 
                    "failure",
                    {"error": str(e)}
                )
            e2e_adapter.complete_workflow(workflow_id, "failed")
            raise
    
    def test_cross_storage_batch_operations_workflow(self, entity_registry, e2e_adapter):
        """
        Test batch operations across multiple storage providers using
        the optimized E2E adapter for workflow tracking.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "batch-operations-1",
            "Cross-Storage Batch Operations Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create a user for operations
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_user",
                "Create a user for batch operations testing"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            user = e2e_adapter.auth_adapter.create_user(
                email="batch_ops_opt@example.com",
                name="Batch Operations User Optimized",
                role="DATA_MANAGER"
            )
            
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", user.id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success",
                {"user_id": user.id}
            )
            
            # Step 2: Set up storage connectors
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "setup_storage_connectors",
                "Set up multiple storage connectors for batch operations"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            integration_adapter = e2e_adapter.integration_adapter
            
            s3_connector = integration_adapter.create_test_connector({
                "type": "s3",
                "name": "Batch S3 Connector Optimized",
                "config": {
                    "bucket": "batch-test-bucket-opt",
                    "region": "us-east-1",
                    "credentials_id": str(uuid.uuid4())
                },
                "owner_id": user.id
            })
            
            azure_connector = integration_adapter.create_test_connector({
                "type": "azure_blob",
                "name": "Batch Azure Connector Optimized",
                "config": {
                    "container": "batch-test-container-opt",
                    "account_name": "batchaccountopt",
                    "credentials_id": str(uuid.uuid4())
                },
                "owner_id": user.id
            })
            
            sharepoint_connector = integration_adapter.create_test_connector({
                "type": "sharepoint",
                "name": "Batch SharePoint Connector Optimized",
                "config": {
                    "site_url": "https://example.sharepoint.com/sites/testopt",
                    "library": "Documents",
                    "credentials_id": str(uuid.uuid4())
                },
                "owner_id": user.id
            })
            
            e2e_adapter.associate_entity(workflow_id, step2["id"], "Connector", str(s3_connector["id"]))
            e2e_adapter.associate_entity(workflow_id, step2["id"], "Connector", str(azure_connector["id"]))
            e2e_adapter.associate_entity(workflow_id, step2["id"], "Connector", str(sharepoint_connector["id"]))
            
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {
                    "s3_connector_id": s3_connector["id"],
                    "azure_connector_id": azure_connector["id"],
                    "sharepoint_connector_id": sharepoint_connector["id"]
                }
            )
            
            # Step 3: Prepare test files
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "prepare_test_files",
                "Prepare batch of test files"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            test_files = [
                {"path": "batch/file1_opt.csv", "content": "id,name\n1,file1_opt"},
                {"path": "batch/file2_opt.csv", "content": "id,name\n2,file2_opt"},
                {"path": "batch/file3_opt.csv", "content": "id,name\n3,file3_opt"},
                {"path": "batch/subfolder/file4_opt.csv", "content": "id,name\n4,file4_opt"},
                {"path": "batch/subfolder/file5_opt.csv", "content": "id,name\n5,file5_opt"}
            ]
            
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                {
                    "file_count": len(test_files),
                    "folder_structure": ["batch/", "batch/subfolder/"]
                }
            )
            
            # Step 4: Batch upload to S3
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "batch_upload",
                "Upload batch of files to S3"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
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
            
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                {
                    "total_files": batch_upload_result["total_files"],
                    "successful_uploads": batch_upload_result["successful_uploads"],
                    "failed_uploads": batch_upload_result.get("failed_uploads", 0)
                }
            )
            
            # Step 5: Configure batch transfer
            step5 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_batch_transfer",
                "Configure batch transfer from S3 to Azure"
            )
            e2e_adapter.start_step(workflow_id, step5["id"])
            
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
            
            e2e_adapter.complete_step(
                workflow_id, 
                step5["id"], 
                "success",
                {
                    "source_path": batch_transfer_config["source_path"],
                    "destination_path": batch_transfer_config["destination_path"],
                    "include_subfolders": batch_transfer_config["include_subfolders"]
                }
            )
            
            # Step 6: Execute batch transfer
            step6 = e2e_adapter.add_workflow_step(
                workflow_id,
                "execute_batch_transfer",
                "Execute batch transfer from S3 to Azure"
            )
            e2e_adapter.start_step(workflow_id, step6["id"])
            
            batch_transfer_result = integration_adapter.batch_transfer_files(
                batch_transfer_config
            )
            
            assert batch_transfer_result["success"] is True
            assert batch_transfer_result["total_files"] >= len(test_files)
            assert batch_transfer_result["transferred_files"] >= len(test_files)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step6["id"], 
                "success",
                {
                    "total_files": batch_transfer_result["total_files"],
                    "transferred_files": batch_transfer_result["transferred_files"],
                    "failed_transfers": batch_transfer_result.get("failed_transfers", 0)
                }
            )
            
            # Step 7: Verify transferred files
            step7 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_transferred_files",
                "Verify all files were transferred correctly"
            )
            e2e_adapter.start_step(workflow_id, step7["id"])
            
            verification_results = []
            
            for file_info in test_files:
                source_path = file_info["path"]
                dest_path = "imported/" + source_path
                
                file_exists = integration_adapter.check_file_exists(
                    connector_id=azure_connector["id"],
                    file_path=dest_path
                )
                
                verification_results.append({
                    "source_path": source_path,
                    "destination_path": dest_path,
                    "exists": file_exists["exists"]
                })
                
                assert file_exists["exists"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step7["id"], 
                "success",
                {
                    "files_verified": len(verification_results),
                    "all_files_present": all(v["exists"] for v in verification_results)
                }
            )
            
            # Step 8: Configure batch processing
            step8 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_batch_processing",
                "Configure batch processing operation"
            )
            e2e_adapter.start_step(workflow_id, step8["id"])
            
            batch_process_config = {
                "connector_id": azure_connector["id"],
                "source_path": "imported/batch/",
                "operation": "combine",
                "destination_connector_id": sharepoint_connector["id"],
                "destination_path": "Combined/all_files_opt.csv",
                "include_subfolders": True,
                "file_pattern": "*.csv"
            }
            
            e2e_adapter.complete_step(
                workflow_id, 
                step8["id"], 
                "success",
                {
                    "operation": batch_process_config["operation"],
                    "source_path": batch_process_config["source_path"],
                    "destination_path": batch_process_config["destination_path"]
                }
            )
            
            # Step 9: Execute batch processing
            step9 = e2e_adapter.add_workflow_step(
                workflow_id,
                "execute_batch_processing",
                "Execute batch processing operation"
            )
            e2e_adapter.start_step(workflow_id, step9["id"])
            
            batch_process_result = integration_adapter.batch_process_files(
                batch_process_config
            )
            
            assert batch_process_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step9["id"], 
                "success",
                {
                    "processing_success": batch_process_result["success"],
                    "processed_files": batch_process_result.get("processed_files", len(test_files))
                }
            )
            
            # Step 10: Verify combined file
            step10 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_combined_file",
                "Verify the combined file in SharePoint"
            )
            e2e_adapter.start_step(workflow_id, step10["id"])
            
            combined_file_exists = integration_adapter.check_file_exists(
                connector_id=sharepoint_connector["id"],
                file_path="Combined/all_files_opt.csv"
            )
            
            assert combined_file_exists["exists"] is True
            
            # Get the combined file content
            combined_file_content = integration_adapter.get_file_from_storage(
                connector_id=sharepoint_connector["id"],
                file_path="Combined/all_files_opt.csv"
            )
            
            assert combined_file_content["success"] is True
            
            # Check the combined file
            combined_df = pd.read_csv(io.StringIO(combined_file_content["content"]))
            
            e2e_adapter.complete_step(
                workflow_id, 
                step10["id"], 
                "success",
                {
                    "file_exists": combined_file_exists["exists"],
                    "content_size": len(combined_file_content["content"]),
                    "row_count": len(combined_df)
                }
            )
            
            # Step 11: Execute batch cleanup
            step11 = e2e_adapter.add_workflow_step(
                workflow_id,
                "execute_batch_cleanup",
                "Execute batch cleanup operation"
            )
            e2e_adapter.start_step(workflow_id, step11["id"])
            
            batch_cleanup_result = integration_adapter.batch_operation(
                {
                    "connector_id": s3_connector["id"],
                    "operation": "delete",
                    "path": "batch/",
                    "include_subfolders": True,
                    "file_pattern": "*.csv",
                    "older_than_days": 0  # All files
                }
            )
            
            assert batch_cleanup_result["success"] is True
            
            e2e_adapter.complete_step(
                workflow_id, 
                step11["id"], 
                "success",
                {
                    "cleanup_success": batch_cleanup_result["success"],
                    "affected_files": batch_cleanup_result["affected_files"]
                }
            )
            
            # Complete the workflow
            e2e_adapter.complete_workflow(workflow_id, "completed")
            
            # Verify workflow completion
            workflow_status = e2e_adapter.get_workflow_status(workflow_id)
            assert workflow_status == "completed"
            
        except Exception as e:
            # In case of error, mark the current step and workflow as failed
            current_step = workflow.get("current_step", 0)
            if current_step < len(workflow["steps"]):
                e2e_adapter.complete_step(
                    workflow_id, 
                    current_step, 
                    "failure",
                    {"error": str(e)}
                )
            e2e_adapter.complete_workflow(workflow_id, "failed")
            raise