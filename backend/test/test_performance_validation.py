"""
Performance Validation Tests

This module tests the performance characteristics of critical operations
in the TAP Integration Platform to ensure they meet performance targets.
"""

import pytest
import time
import uuid
import json
from test_adapters.auth.auth_adapter import User, AuthAdapter
from test_adapters.integration_adapter import IntegrationAdapter
from test_adapters.file_type_utilities_adapter import FileTypeUtilitiesAdapter
from test_adapters.performance_benchmark_framework import PerformanceBenchmarkAdapter


class TestPerformanceValidation:
    """Tests for validating performance of critical operations."""
    
    def test_integration_run_performance(self, entity_registry, auth_adapter, 
                                        integration_adapter, performance_benchmark_adapter):
        """
        Test the performance of integration run operations.
        
        This test measures:
        1. The execution time of different sized data transfers
        2. The memory usage during processing
        3. The overall throughput for data transformations
        """
        # Create a test user
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="perf_test@example.com",
                name="Performance Test User",
                role="DATA_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Create test connectors
        s3_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "Performance Test S3 Connector",
            "config": {
                "bucket": "perf-test-bucket",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
            },
            "owner_id": user.id
        })
        
        # Test small data transfer (10KB)
        small_data = "x" * 10240  # 10KB of data
        
        # Start performance tracking
        small_transfer_profile = performance_benchmark_adapter.start_profiling(
            "small_transfer", 
            track_memory=True
        )
        
        # Upload small file
        small_upload_result = integration_adapter.upload_file_to_storage(
            connector_id=s3_connector["id"],
            file_content=small_data,
            file_path="performance/small.txt",
            metadata={"size": "small"}
        )
        
        # Stop performance tracking
        small_transfer_metrics = performance_benchmark_adapter.stop_profiling(
            small_transfer_profile
        )
        
        # Check if small transfer meets performance targets
        assert small_transfer_metrics["duration"] < 0.5, "Small transfer too slow"
        assert small_transfer_metrics["max_memory_increase"] < 5_000_000, "Small transfer using too much memory"
        
        # Test medium data transfer (1MB)
        medium_data = "x" * 1_048_576  # 1MB of data
        
        # Start performance tracking
        medium_transfer_profile = performance_benchmark_adapter.start_profiling(
            "medium_transfer", 
            track_memory=True
        )
        
        # Upload medium file
        medium_upload_result = integration_adapter.upload_file_to_storage(
            connector_id=s3_connector["id"],
            file_content=medium_data,
            file_path="performance/medium.txt",
            metadata={"size": "medium"}
        )
        
        # Stop performance tracking
        medium_transfer_metrics = performance_benchmark_adapter.stop_profiling(
            medium_transfer_profile
        )
        
        # Check if medium transfer meets performance targets
        assert medium_transfer_metrics["duration"] < 2.0, "Medium transfer too slow"
        assert medium_transfer_metrics["max_memory_increase"] < 50_000_000, "Medium transfer using too much memory"
        
        # Test batch processing performance
        batch_size = 50
        batch_files = []
        
        for i in range(batch_size):
            batch_files.append({
                "path": f"batch/file{i}.txt",
                "content": f"Performance test file {i}"
            })
        
        # Start performance tracking
        batch_upload_profile = performance_benchmark_adapter.start_profiling(
            "batch_upload", 
            track_memory=True
        )
        
        # Upload batch of files
        batch_upload_result = integration_adapter.batch_upload_files(
            connector_id=s3_connector["id"],
            files=batch_files,
            base_metadata={"batch_id": str(uuid.uuid4())}
        )
        
        # Stop performance tracking
        batch_upload_metrics = performance_benchmark_adapter.stop_profiling(
            batch_upload_profile
        )
        
        # Check batch processing performance targets
        assert batch_upload_metrics["duration"] < batch_size * 0.1, "Batch upload too slow"
        assert batch_upload_result["successful_uploads"] == batch_size, "Batch upload incomplete"
        
        # Calculate and report performance metrics
        performance_benchmark_adapter.record_benchmark(
            "small_transfer",
            small_transfer_metrics["duration"],
            {
                "bytes": len(small_data),
                "memory_increase": small_transfer_metrics["max_memory_increase"]
            }
        )
        
        performance_benchmark_adapter.record_benchmark(
            "medium_transfer",
            medium_transfer_metrics["duration"],
            {
                "bytes": len(medium_data),
                "memory_increase": medium_transfer_metrics["max_memory_increase"]
            }
        )
        
        performance_benchmark_adapter.record_benchmark(
            "batch_upload",
            batch_upload_metrics["duration"],
            {
                "file_count": batch_size,
                "memory_increase": batch_upload_metrics["max_memory_increase"],
                "files_per_second": batch_size / batch_upload_metrics["duration"]
            }
        )
    
    def test_data_transformation_performance(self, entity_registry, auth_adapter, 
                                           integration_adapter, file_type_utilities_adapter,
                                           performance_benchmark_adapter):
        """
        Test the performance of data transformation operations.
        """
        # Create a test user
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="transform_perf@example.com",
                name="Transform Performance User",
                role="DATA_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Generate test data - CSV with 10,000 rows
        header = "id,name,value,date,category\n"
        rows = []
        for i in range(10000):
            rows.append(f"{i},Item {i},{i*1.5},2023-01-{i%30+1},Category {i%5}")
        
        test_csv = header + "\n".join(rows)
        
        # Create test connectors
        s3_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "Transform Test S3",
            "config": {
                "bucket": "transform-test-bucket",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
            },
            "owner_id": user.id
        })
        
        azure_connector = integration_adapter.create_test_connector({
            "type": "azure_blob",
            "name": "Transform Test Azure",
            "config": {
                "container": "transform-test-container",
                "account_name": "transformaccount",
                "credentials_id": str(uuid.uuid4())
            },
            "owner_id": user.id
        })
        
        # Upload test CSV
        upload_result = integration_adapter.upload_file_to_storage(
            connector_id=s3_connector["id"],
            file_content=test_csv,
            file_path="performance/large.csv",
            metadata={"rows": 10000}
        )
        
        # Define transformation config with multiple operations
        transformation_config = {
            "source_connector_id": s3_connector["id"],
            "destination_connector_id": azure_connector["id"],
            "source_path": "performance/large.csv",
            "destination_path": "transformed/result.csv",
            "transformations": [
                {
                    "type": "filter_rows",
                    "params": {
                        "column": "value",
                        "operator": ">",
                        "value": 5000
                    }
                },
                {
                    "type": "calculate_column",
                    "params": {
                        "name": "adjusted_value",
                        "formula": "value * 1.2"
                    }
                },
                {
                    "type": "rename_column",
                    "params": {
                        "old_name": "name",
                        "new_name": "item_name"
                    }
                },
                {
                    "type": "sort",
                    "params": {
                        "column": "adjusted_value",
                        "ascending": False
                    }
                }
            ],
            "preserve_metadata": True
        }
        
        # Start performance tracking
        transform_profile = performance_benchmark_adapter.start_profiling(
            "complex_transformation", 
            track_memory=True
        )
        
        # Execute transformation
        transform_result = integration_adapter.transform_and_transfer_file(
            transformation_config
        )
        
        # Stop performance tracking
        transform_metrics = performance_benchmark_adapter.stop_profiling(
            transform_profile
        )
        
        # Verify transformation completed successfully
        assert transform_result["success"] is True
        
        # Check transformation performance meets targets
        assert transform_metrics["duration"] < 5.0, "Complex transformation too slow"
        
        # Get transformed file to verify result
        result_content = integration_adapter.get_file_from_storage(
            connector_id=azure_connector["id"],
            file_path="transformed/result.csv"
        )
        
        assert result_content["success"] is True
        
        # Record benchmark
        performance_benchmark_adapter.record_benchmark(
            "complex_transformation",
            transform_metrics["duration"],
            {
                "input_rows": 10000,
                "transformation_count": len(transformation_config["transformations"]),
                "memory_increase": transform_metrics["max_memory_increase"],
                "rows_per_second": 10000 / transform_metrics["duration"]
            }
        )
    
    def test_api_response_time(self, entity_registry, auth_adapter, 
                              admin_adapter, performance_benchmark_adapter):
        """
        Test API response times for critical endpoints.
        """
        # Create test user
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="api_perf@example.com",
                name="API Performance User",
                role="ADMIN",
                mfa_enabled=False
            )
        )
        
        # Create test data - 100 applications
        app_ids = []
        
        # Bulk create applications
        bulk_create_profile = performance_benchmark_adapter.start_profiling(
            "bulk_create_apps"
        )
        
        for i in range(100):
            app = admin_adapter.create_application({
                "name": f"Test App {i}",
                "description": f"Performance test application {i}",
                "status": "active"
            }, user.id)
            app_ids.append(app["id"])
        
        bulk_create_metrics = performance_benchmark_adapter.stop_profiling(
            bulk_create_profile
        )
        
        # Test get all applications performance
        get_all_profile = performance_benchmark_adapter.start_profiling(
            "get_all_apps"
        )
        
        all_apps = admin_adapter.get_applications(user_id=user.id)
        
        get_all_metrics = performance_benchmark_adapter.stop_profiling(
            get_all_profile
        )
        
        # Test individual app retrieval performance
        get_single_times = []
        
        for app_id in app_ids[:10]:  # Test 10 random apps
            get_single_profile = performance_benchmark_adapter.start_profiling(
                f"get_app_{app_id}"
            )
            
            app = admin_adapter.get_application(app_id, user_id=user.id)
            
            get_single_metrics = performance_benchmark_adapter.stop_profiling(
                get_single_profile
            )
            
            get_single_times.append(get_single_metrics["duration"])
        
        # Calculate average time for single app retrieval
        avg_get_single = sum(get_single_times) / len(get_single_times)
        
        # Test bulk update performance
        bulk_update_profile = performance_benchmark_adapter.start_profiling(
            "bulk_update_apps"
        )
        
        for app_id in app_ids[:20]:  # Update 20 apps
            admin_adapter.update_application(app_id, {
                "description": f"Updated description for app {app_id}",
                "status": "inactive"
            }, user.id)
        
        bulk_update_metrics = performance_benchmark_adapter.stop_profiling(
            bulk_update_profile
        )
        
        # Record performance benchmarks
        performance_benchmark_adapter.record_benchmark(
            "api_bulk_create",
            bulk_create_metrics["duration"],
            {
                "item_count": 100,
                "items_per_second": 100 / bulk_create_metrics["duration"]
            }
        )
        
        performance_benchmark_adapter.record_benchmark(
            "api_get_all",
            get_all_metrics["duration"],
            {
                "item_count": len(all_apps),
                "items_per_second": len(all_apps) / get_all_metrics["duration"]
            }
        )
        
        performance_benchmark_adapter.record_benchmark(
            "api_get_single",
            avg_get_single,
            {
                "sample_size": 10
            }
        )
        
        performance_benchmark_adapter.record_benchmark(
            "api_bulk_update",
            bulk_update_metrics["duration"],
            {
                "item_count": 20,
                "items_per_second": 20 / bulk_update_metrics["duration"]
            }
        )
        
        # Performance assertions
        assert avg_get_single < 0.1, "Single item retrieval too slow"
        assert get_all_metrics["duration"] < 2.0, "Bulk retrieval too slow"
        assert bulk_update_metrics["duration"] / 20 < 0.2, "Updates too slow"