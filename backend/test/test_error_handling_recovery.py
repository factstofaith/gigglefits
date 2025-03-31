"""
Error Handling and Recovery Validation Tests

This module contains comprehensive tests for error handling and recovery
across the TAP Integration Platform, including error propagation, retry
mechanisms, and graceful degradation.
"""

import pytest
import uuid
import time
import random
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone, timedelta

from test_adapters.auth.auth_adapter import User, AuthAdapter
from test_adapters.integration_adapter import IntegrationAdapter
from test_adapters.error_handling_framework import ErrorSimulator, ErrorRecoveryTest
from test_adapters.performance_benchmark_framework import PerformanceBenchmarkAdapter


class TestErrorHandlingAndRecovery:
    """Tests for validating error handling and recovery capabilities."""
    
    def test_storage_error_retry_mechanism(self, entity_registry, auth_adapter, 
                                         integration_adapter, error_simulator):
        """
        Test retry mechanism for storage operations.
        
        This test verifies that the platform properly retries failed storage
        operations with exponential backoff.
        """
        # Step 1: Create a test user
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="error_test@example.com",
                name="Error Test User",
                role="DATA_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Step 2: Create a test connector with error simulation
        s3_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "Error Recovery Test Connector",
            "config": {
                "bucket": "error-recovery-test",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
            },
            "owner_id": user.id
        })
        
        # Step 3: Configure the error simulator for the storage operation
        error_simulator.configure_error({
            "operation": "upload_file",
            "connector_id": s3_connector["id"],
            "error_pattern": "intermittent",
            "failure_count": 2,  # Fail the first 2 attempts
            "error_message": "Simulated upload failure"
        })
        
        # Step 4: Attempt to upload a file with retry configuration
        test_file_content = "test,data\n1,retry"
        
        upload_result = integration_adapter.upload_file_to_storage(
            connector_id=s3_connector["id"],
            file_content=test_file_content,
            file_path="error/retry_test.csv",
            metadata={"filename": "retry_test.csv"},
            retry_settings={
                "max_retries": 5,
                "retry_delay": 1,
                "exponential_backoff": True
            }
        )
        
        # Step 5: Verify that the operation eventually succeeded after retries
        assert upload_result["success"] is True
        assert "retries" in upload_result
        assert upload_result["retries"] == 2  # Should have taken exactly 2 retries
        
        # Step 6: Verify that the retry delays followed exponential backoff
        assert "retry_delays" in upload_result
        assert len(upload_result["retry_delays"]) == 2
        assert upload_result["retry_delays"][1] > upload_result["retry_delays"][0]
        
        # Step 7: Verify the file exists after successful retry
        file_exists = integration_adapter.check_file_exists(
            connector_id=s3_connector["id"],
            file_path="error/retry_test.csv"
        )
        
        assert file_exists["exists"] is True
    
    def test_integration_failure_recovery(self, entity_registry, auth_adapter, 
                                       integration_adapter, error_simulator):
        """
        Test recovery from integration execution failures.
        
        This test verifies that the platform can recover from integration
        execution failures and automatically resume from the point of failure.
        """
        # Step 1: Create a test user
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="recovery_test@example.com",
                name="Recovery Test User",
                role="INTEGRATION_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Step 2: Create an integration
        integration = integration_adapter.create_integration({
            "name": "Recovery Test Integration",
            "description": "Test integration recovery capabilities",
            "status": "active",
            "owner_id": user.id
        })
        
        # Step 3: Set up source and destination connectors
        source_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "Recovery Source",
            "config": {
                "bucket": "recovery-source",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
            },
            "integration_id": integration["id"],
            "owner_id": user.id
        })
        
        destination_connector = integration_adapter.create_test_connector({
            "type": "azure_blob",
            "name": "Recovery Destination",
            "config": {
                "container": "recovery-destination",
                "account_name": "recoveryaccount",
                "credentials_id": str(uuid.uuid4())
            },
            "integration_id": integration["id"],
            "owner_id": user.id
        })
        
        # Step 4: Create a flow with multiple nodes
        flow = integration_adapter.create_flow({
            "integration_id": integration["id"],
            "nodes": [
                {
                    "id": "source",
                    "type": "source",
                    "config": {
                        "connector_id": source_connector["id"],
                        "path": "recovery/data.csv"
                    },
                    "position": {"x": 100, "y": 100}
                },
                {
                    "id": "transform1",
                    "type": "transform",
                    "config": {
                        "transformation_type": "map",
                        "transformation_config": {
                            "column_mapping": {
                                "id": "item_id",
                                "name": "item_name"
                            }
                        }
                    },
                    "position": {"x": 250, "y": 100}
                },
                {
                    "id": "transform2",
                    "type": "transform",
                    "config": {
                        "transformation_type": "filter",
                        "transformation_config": {
                            "condition": "value > 100"
                        }
                    },
                    "position": {"x": 400, "y": 100}
                },
                {
                    "id": "destination",
                    "type": "destination",
                    "config": {
                        "connector_id": destination_connector["id"],
                        "path": "recovery/result.csv"
                    },
                    "position": {"x": 550, "y": 100}
                }
            ],
            "edges": [
                {
                    "source": "source",
                    "target": "transform1"
                },
                {
                    "source": "transform1",
                    "target": "transform2"
                },
                {
                    "source": "transform2",
                    "target": "destination"
                }
            ]
        })
        
        # Step 5: Upload test data
        test_data = """id,name,value
1,Item 1,150
2,Item 2,90
3,Item 3,200
4,Item 4,75
5,Item 5,120
"""
        
        integration_adapter.upload_file_to_storage(
            connector_id=source_connector["id"],
            file_content=test_data,
            file_path="recovery/data.csv",
            metadata={"content_type": "text/csv"}
        )
        
        # Step 6: Configure error simulator to fail at the second transformation
        error_simulator.configure_error({
            "operation": "run_transformation",
            "node_id": "transform2",
            "error_pattern": "fail_once",
            "error_message": "Simulated transformation failure"
        })
        
        # Step 7: Run the integration
        run_result = integration_adapter.run_integration(
            integration["id"],
            {
                "user_id": user.id,
                "recovery_enabled": True,  # Enable recovery for this run
                "checkpoint_frequency": "node"  # Create checkpoint after each node
            }
        )
        
        # Step 8: Verify that the run failed but created a checkpoint
        assert run_result["status"] == "failed"
        assert "checkpoint" in run_result
        assert run_result["checkpoint"]["node_id"] == "transform1"
        assert run_result["checkpoint"]["completed"] is True
        
        # Step 9: Run the integration again with recovery
        recovery_result = integration_adapter.run_integration(
            integration["id"],
            {
                "user_id": user.id,
                "recover_from": run_result["checkpoint"]["id"]
            }
        )
        
        # Step 10: Verify recovery completed successfully
        assert recovery_result["status"] == "completed"
        assert recovery_result["resumed_from_checkpoint"] is True
        assert "skipped_nodes" in recovery_result
        assert "source" in recovery_result["skipped_nodes"]
        assert "transform1" in recovery_result["skipped_nodes"]
        
        # Step 11: Verify the result file was created correctly
        result_file = integration_adapter.get_file_from_storage(
            connector_id=destination_connector["id"],
            file_path="recovery/result.csv"
        )
        
        assert result_file["success"] is True
        assert "item_id,item_name,value" in result_file["content"]
        # Only items with value > 100 should be present
        assert "1,Item 1,150" in result_file["content"]
        assert "3,Item 3,200" in result_file["content"]
        assert "5,Item 5,120" in result_file["content"]
        assert "2,Item 2,90" not in result_file["content"]
        assert "4,Item 4,75" not in result_file["content"]
    
    def test_graceful_degradation(self, entity_registry, auth_adapter, 
                                integration_adapter, error_simulator):
        """
        Test graceful degradation when components fail.
        
        This test verifies that the platform gracefully degrades when
        non-critical components fail, allowing the system to continue
        functioning with reduced capabilities.
        """
        # Step 1: Create a test user
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="degradation_test@example.com",
                name="Degradation Test User",
                role="INTEGRATION_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Step 2: Configure the error simulator to simulate scheduler failure
        error_simulator.configure_error({
            "operation": "schedule_integration",
            "error_pattern": "persistent",
            "error_message": "Simulated scheduler failure"
        })
        
        # Step 3: Create an integration
        integration = integration_adapter.create_integration({
            "name": "Degradation Test Integration",
            "description": "Test graceful degradation",
            "status": "active",
            "owner_id": user.id
        })
        
        # Step 4: Set up source and destination connectors
        source_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "Degradation Source",
            "config": {
                "bucket": "degradation-source",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
            },
            "integration_id": integration["id"],
            "owner_id": user.id
        })
        
        destination_connector = integration_adapter.create_test_connector({
            "type": "azure_blob",
            "name": "Degradation Destination",
            "config": {
                "container": "degradation-destination",
                "account_name": "degradationaccount",
                "credentials_id": str(uuid.uuid4())
            },
            "integration_id": integration["id"],
            "owner_id": user.id
        })
        
        # Step 5: Create a simple flow
        flow = integration_adapter.create_flow({
            "integration_id": integration["id"],
            "nodes": [
                {
                    "id": "source",
                    "type": "source",
                    "config": {
                        "connector_id": source_connector["id"],
                        "path": "degradation/data.csv"
                    },
                    "position": {"x": 100, "y": 100}
                },
                {
                    "id": "destination",
                    "type": "destination",
                    "config": {
                        "connector_id": destination_connector["id"],
                        "path": "degradation/result.csv"
                    },
                    "position": {"x": 300, "y": 100}
                }
            ],
            "edges": [
                {
                    "source": "source",
                    "target": "destination"
                }
            ]
        })
        
        # Step 6: Upload test data
        test_data = """id,name,value
1,Item 1,100
2,Item 2,200
"""
        
        integration_adapter.upload_file_to_storage(
            connector_id=source_connector["id"],
            file_content=test_data,
            file_path="degradation/data.csv",
            metadata={"content_type": "text/csv"}
        )
        
        # Step 7: Attempt to schedule the integration (should fail)
        schedule_result = integration_adapter.schedule_integration({
            "integration_id": integration["id"],
            "schedule_type": "cron",
            "cron_expression": "0 0 * * *",  # Daily at midnight
            "enabled": True,
            "start_date": datetime.now(timezone.utc).isoformat(),
            "time_zone": "UTC"
        })
        
        # Step 8: Verify that scheduling failed
        assert schedule_result["success"] is False
        assert "error" in schedule_result
        assert schedule_result["error"] == "Simulated scheduler failure"
        
        # Step 9: Verify that manual execution still works (system degraded but functional)
        run_result = integration_adapter.run_integration(
            integration["id"],
            {"user_id": user.id}
        )
        
        # Step 10: Verify that manual execution completed successfully
        assert run_result["status"] == "completed"
        
        # Step 11: Verify the result file was created correctly
        result_file = integration_adapter.get_file_from_storage(
            connector_id=destination_connector["id"],
            file_path="degradation/result.csv"
        )
        
        assert result_file["success"] is True
        assert "id,name,value" in result_file["content"]
        assert "1,Item 1,100" in result_file["content"]
        assert "2,Item 2,200" in result_file["content"]
        
        # Step 12: Verify degradation is properly reported
        system_status = integration_adapter.get_system_status()
        assert system_status["scheduler"]["status"] == "degraded"
        assert system_status["scheduler"]["error"] == "Simulated scheduler failure"
        assert system_status["overall_status"] == "degraded"
        assert system_status["execution"]["status"] == "operational"
    
    def test_concurrent_failure_handling(self, entity_registry, auth_adapter, 
                                      integration_adapter, error_simulator,
                                      performance_benchmark_adapter):
        """
        Test handling of concurrent failures.
        
        This test verifies that the platform properly handles multiple
        concurrent failures across different components.
        """
        # Step 1: Create a test user
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="concurrent_test@example.com",
                name="Concurrent Failure Test User",
                role="INTEGRATION_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Step 2: Create multiple integrations
        integrations = []
        connectors = []
        
        for i in range(5):
            # Create integration
            integration = integration_adapter.create_integration({
                "name": f"Concurrent Test Integration {i}",
                "description": f"Test concurrent failure handling {i}",
                "status": "active",
                "owner_id": user.id
            })
            integrations.append(integration)
            
            # Create connectors
            source_connector = integration_adapter.create_test_connector({
                "type": "s3",
                "name": f"Concurrent Source {i}",
                "config": {
                    "bucket": f"concurrent-source-{i}",
                    "region": "us-east-1",
                    "credentials_id": str(uuid.uuid4())
                },
                "integration_id": integration["id"],
                "owner_id": user.id
            })
            
            destination_connector = integration_adapter.create_test_connector({
                "type": "azure_blob",
                "name": f"Concurrent Destination {i}",
                "config": {
                    "container": f"concurrent-destination-{i}",
                    "account_name": "concurrentaccount",
                    "credentials_id": str(uuid.uuid4())
                },
                "integration_id": integration["id"],
                "owner_id": user.id
            })
            
            connectors.append((source_connector, destination_connector))
            
            # Create a simple flow
            flow = integration_adapter.create_flow({
                "integration_id": integration["id"],
                "nodes": [
                    {
                        "id": "source",
                        "type": "source",
                        "config": {
                            "connector_id": source_connector["id"],
                            "path": f"concurrent/data_{i}.csv"
                        },
                        "position": {"x": 100, "y": 100}
                    },
                    {
                        "id": "destination",
                        "type": "destination",
                        "config": {
                            "connector_id": destination_connector["id"],
                            "path": f"concurrent/result_{i}.csv"
                        },
                        "position": {"x": 300, "y": 100}
                    }
                ],
                "edges": [
                    {
                        "source": "source",
                        "target": "destination"
                    }
                ]
            })
            
            # Upload test data
            test_data = f"""id,name,value
{i*10+1},Item {i*10+1},{i*100}
{i*10+2},Item {i*10+2},{i*100+50}
"""
            
            integration_adapter.upload_file_to_storage(
                connector_id=source_connector["id"],
                file_content=test_data,
                file_path=f"concurrent/data_{i}.csv",
                metadata={"content_type": "text/csv"}
            )
        
        # Step 3: Configure random failures for some of the integrations
        failing_indices = random.sample(range(5), 2)  # Randomly select 2 to fail
        
        for idx in failing_indices:
            # Configure different types of failures
            if idx % 2 == 0:
                # Source connector failure
                error_simulator.configure_error({
                    "operation": "read_file",
                    "connector_id": connectors[idx][0]["id"],
                    "error_pattern": "intermittent",
                    "failure_count": 1,
                    "error_message": f"Simulated source failure for integration {idx}"
                })
            else:
                # Destination connector failure
                error_simulator.configure_error({
                    "operation": "write_file",
                    "connector_id": connectors[idx][1]["id"],
                    "error_pattern": "intermittent",
                    "failure_count": 1,
                    "error_message": f"Simulated destination failure for integration {idx}"
                })
        
        # Step 4: Start performance benchmark for concurrent execution
        concurrent_profile = performance_benchmark_adapter.start_profiling(
            "concurrent_failures", 
            track_memory=True
        )
        
        # Step 5: Run all integrations concurrently
        run_results = []
        for integration in integrations:
            result = integration_adapter.run_integration(
                integration["id"],
                {
                    "user_id": user.id,
                    "recovery_enabled": True,
                    "max_retries": 3,
                    "retry_delay": 1
                }
            )
            run_results.append(result)
        
        # Step 6: Stop performance benchmark
        concurrent_metrics = performance_benchmark_adapter.stop_profiling(
            concurrent_profile
        )
        
        # Step 7: Verify that all integrations eventually completed
        for i, result in enumerate(run_results):
            # For failing integrations, we expect retries but eventual success
            if i in failing_indices:
                assert result["status"] == "completed"
                assert "retries" in result
                assert result["retries"] > 0
            else:
                assert result["status"] == "completed"
                assert result.get("retries", 0) == 0
        
        # Step 8: Verify result files for all integrations
        for i, (source_connector, destination_connector) in enumerate(connectors):
            result_file = integration_adapter.get_file_from_storage(
                connector_id=destination_connector["id"],
                file_path=f"concurrent/result_{i}.csv"
            )
            
            assert result_file["success"] is True
            assert f"id,name,value" in result_file["content"]
            assert f"{i*10+1},Item {i*10+1},{i*100}" in result_file["content"]
            assert f"{i*10+2},Item {i*10+2},{i*100+50}" in result_file["content"]
        
        # Step 9: Record performance benchmark for concurrent failure handling
        performance_benchmark_adapter.record_benchmark(
            "concurrent_failures",
            concurrent_metrics["duration"],
            {
                "integration_count": 5,
                "failure_count": 2,
                "memory_increase": concurrent_metrics["max_memory_increase"],
                "average_time_per_integration": concurrent_metrics["duration"] / 5
            }
        )
    
    def test_error_propagation_and_monitoring(self, entity_registry, auth_adapter,
                                           integration_adapter, error_simulator):
        """
        Test error propagation and monitoring capabilities.
        
        This test verifies that errors are properly propagated throughout
        the system and correctly reported in monitoring tools.
        """
        # Step 1: Create a test user
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="monitoring_test@example.com",
                name="Monitoring Test User",
                role="ADMIN",
                mfa_enabled=False
            )
        )
        
        # Step 2: Create an integration
        integration = integration_adapter.create_integration({
            "name": "Monitoring Test Integration",
            "description": "Test error monitoring capabilities",
            "status": "active",
            "owner_id": user.id
        })
        
        # Step 3: Set up source and destination connectors
        source_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "Monitoring Source",
            "config": {
                "bucket": "monitoring-source",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
            },
            "integration_id": integration["id"],
            "owner_id": user.id
        })
        
        destination_connector = integration_adapter.create_test_connector({
            "type": "azure_blob",
            "name": "Monitoring Destination",
            "config": {
                "container": "monitoring-destination",
                "account_name": "monitoringaccount",
                "credentials_id": str(uuid.uuid4())
            },
            "integration_id": integration["id"],
            "owner_id": user.id
        })
        
        # Step 4: Create a flow with error logging
        flow = integration_adapter.create_flow({
            "integration_id": integration["id"],
            "nodes": [
                {
                    "id": "source",
                    "type": "source",
                    "config": {
                        "connector_id": source_connector["id"],
                        "path": "monitoring/data.csv"
                    },
                    "position": {"x": 100, "y": 100}
                },
                {
                    "id": "error_logging",
                    "type": "transform",
                    "config": {
                        "transformation_type": "custom",
                        "transformation_config": {
                            "log_level": "debug"
                        }
                    },
                    "position": {"x": 250, "y": 100}
                },
                {
                    "id": "destination",
                    "type": "destination",
                    "config": {
                        "connector_id": destination_connector["id"],
                        "path": "monitoring/result.csv"
                    },
                    "position": {"x": 400, "y": 100}
                }
            ],
            "edges": [
                {
                    "source": "source",
                    "target": "error_logging"
                },
                {
                    "source": "error_logging",
                    "target": "destination"
                }
            ],
            "error_handling": {
                "mode": "continue_with_logging",
                "notification_level": "warning"
            }
        })
        
        # Step 5: Upload test data
        test_data = """id,name,value
1,Item 1,100
2,Item 2,invalid
3,Item 3,300
"""
        
        integration_adapter.upload_file_to_storage(
            connector_id=source_connector["id"],
            file_content=test_data,
            file_path="monitoring/data.csv",
            metadata={"content_type": "text/csv"}
        )
        
        # Step 6: Configure error simulator to produce a data validation error
        error_simulator.configure_error({
            "operation": "validate_data",
            "node_id": "error_logging",
            "error_pattern": "data_specific",
            "error_condition": "row.value === 'invalid'",
            "error_message": "Invalid data value detected",
            "error_level": "warning"  # Non-fatal error
        })
        
        # Step 7: Enable detailed monitoring
        monitoring_config = integration_adapter.configure_monitoring({
            "integration_id": integration["id"],
            "detailed_logging": True,
            "capture_data_samples": True,
            "notification_channels": ["admin_dashboard"]
        })
        
        # Step 8: Run the integration
        run_result = integration_adapter.run_integration(
            integration["id"],
            {"user_id": user.id}
        )
        
        # Step 9: Verify that the run completed with warnings
        assert run_result["status"] == "completed_with_warnings"
        assert "warnings" in run_result
        assert len(run_result["warnings"]) > 0
        assert "Invalid data value detected" in run_result["warnings"][0]["message"]
        
        # Step 10: Check error log records
        error_logs = integration_adapter.get_error_logs(integration["id"], run_result["run_id"])
        
        assert len(error_logs) > 0
        
        data_error = next((log for log in error_logs if "Invalid data value" in log["message"]), None)
        assert data_error is not None
        assert data_error["level"] == "warning"
        assert data_error["node_id"] == "error_logging"
        assert "row_index" in data_error["context"]
        assert data_error["context"]["row_index"] == 1  # Second row (0-indexed)
        
        # Step 11: Verify that notifications were generated
        notifications = integration_adapter.get_notifications({
            "integration_id": integration["id"],
            "run_id": run_result["run_id"]
        })
        
        assert len(notifications) > 0
        warning_notification = next((n for n in notifications if n["level"] == "warning"), None)
        assert warning_notification is not None
        assert "Invalid data value" in warning_notification["message"]
        
        # Step 12: Verify that result file was created (errors didn't stop the process)
        result_file = integration_adapter.get_file_from_storage(
            connector_id=destination_connector["id"],
            file_path="monitoring/result.csv"
        )
        
        assert result_file["success"] is True
        assert "id,name,value" in result_file["content"]
        assert "1,Item 1,100" in result_file["content"]
        assert "3,Item 3,300" in result_file["content"]
        # Row with invalid data should be skipped
        assert "2,Item 2,invalid" not in result_file["content"]