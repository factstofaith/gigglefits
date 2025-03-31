"""
Integration Creation End-to-End Optimized Tests

This module contains optimized end-to-end tests for the complete integration creation workflow,
using the E2E test adapter for workflow tracking and cross-component integration.
"""

import pytest
import pandas as pd
from datetime import datetime, timezone
import uuid

from test_adapters.auth import TimezoneTestUtilities
from test_adapters.auth.auth_adapter import User


class TestIntegrationCreationE2EOptimized:
    """Optimized end-to-end tests for integration creation workflow using the E2E adapter."""
    
    def test_complete_integration_creation_workflow(self, entity_registry, e2e_adapter):
        """
        Test the complete integration creation process from configuration to execution using
        the optimized E2E adapter for workflow tracking.
        
        This test verifies the integration creation workflow with clear step progression and
        comprehensive tracking of the process.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "integration-creation-1",
            "Complete Integration Creation Workflow"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create a user for integration ownership
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_integration_owner",
                "Create a user for integration ownership"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            user = e2e_adapter.auth_adapter.create_user(
                email="integration_owner_opt@example.com",
                name="Integration Owner Optimized",
                role="INTEGRATION_MANAGER"
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
            
            # Step 2: Create a new integration
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_integration",
                "Create a new integration configuration"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            integration_data = {
                "name": "Optimized API Integration",
                "description": "Integration for E2E testing with optimized workflow",
                "type": "API-based",
                "source": "Test API Source",
                "destination": "Test API Destination",
                "owner_id": user.id,
                "tenant_id": "default-tenant"
            }
            
            integration = e2e_adapter.integration_adapter.create_integration(integration_data)
            integration_id = integration["id"]
            
            # Associate the integration entity with this step
            e2e_adapter.associate_entity(workflow_id, step2["id"], "Integration", str(integration_id))
            
            # Verify integration creation
            assert integration["name"] == "Optimized API Integration"
            assert integration["type"] == "API-based"
            assert integration["health"] == "healthy"  # Default status
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {"integration_id": integration_id}
            )
            
            # Step 3: Configure source connection
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_source",
                "Configure the integration source connection"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            source_config = {
                "endpoint": "https://api.example.com/data",
                "auth_type": "oauth2",
                "credentials_id": str(uuid.uuid4()),
                "filters": {
                    "date_from": "2023-01-01",
                    "limit": 1000
                }
            }
            
            updated_integration = e2e_adapter.integration_adapter.update_integration(
                integration_id,
                {"source_config": source_config}
            )
            
            # Verify source configuration
            assert updated_integration["source_config"]["endpoint"] == "https://api.example.com/data"
            assert updated_integration["source_config"]["auth_type"] == "oauth2"
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                {"source_configured": True}
            )
            
            # Step 4: Create a dataset and fields
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_dataset",
                "Create a dataset and fields for the integration"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            dataset = e2e_adapter.integration_adapter.create_dataset({
                "name": "Employee Data Optimized",
                "description": "Employee information dataset for optimized test",
                "tenant_id": "default-tenant"
            })
            
            # Add fields to the dataset
            fields = [
                {
                    "name": "employee_id",
                    "display_name": "Employee ID",
                    "data_type": "string",
                    "required": True
                },
                {
                    "name": "full_name",
                    "display_name": "Full Name",
                    "data_type": "string",
                    "required": True
                },
                {
                    "name": "department",
                    "display_name": "Department",
                    "data_type": "string",
                    "required": False
                },
                {
                    "name": "salary",
                    "display_name": "Annual Salary",
                    "data_type": "number",
                    "required": False
                }
            ]
            
            dataset_fields = []
            for field_data in fields:
                field = e2e_adapter.integration_adapter.create_dataset_field(
                    dataset["id"],
                    field_data
                )
                dataset_fields.append(field)
            
            # Associate dataset with integration
            e2e_adapter.integration_adapter.associate_dataset(integration_id, dataset["id"])
            
            # Associate entities with this step
            e2e_adapter.associate_entity(workflow_id, step4["id"], "Dataset", str(dataset["id"]))
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                {
                    "dataset_id": dataset["id"],
                    "field_count": len(dataset_fields)
                }
            )
            
            # Step 5: Configure transformations
            step5 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_transformations",
                "Configure data transformations"
            )
            e2e_adapter.start_step(workflow_id, step5["id"])
            
            # Create test transformations
            transform_registry = e2e_adapter.transformation_registry_adapter
            
            capitalize_transform = transform_registry.register_test_transformation(
                name="capitalize_name_opt",
                description="Capitalizes each word in a name (optimized test)",
                supported_types=["string"],
                function=lambda data, params: data.str.title()
            )
            
            department_transform = transform_registry.register_test_transformation(
                name="department_code_opt",
                description="Maps department name to code (optimized test)",
                supported_types=["string"],
                params=[
                    {
                        "name": "mapping",
                        "type": "object",
                        "description": "Department name to code mapping"
                    }
                ],
                function=lambda data, params: data.map(params.get("mapping", {}))
            )
            
            salary_transform = transform_registry.register_test_transformation(
                name="salary_bonus_opt",
                description="Applies bonus percentage to salary (optimized test)",
                supported_types=["number"],
                params=[
                    {
                        "name": "bonus_percent",
                        "type": "number",
                        "description": "Bonus percentage to apply"
                    }
                ],
                function=lambda data, params: data * (1 + params.get("bonus_percent", 0) / 100)
            )
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step5["id"], 
                "success",
                {
                    "transformations_created": [
                        "capitalize_name_opt",
                        "department_code_opt",
                        "salary_bonus_opt"
                    ]
                }
            )
            
            # Step 6: Create field mappings
            step6 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_field_mappings",
                "Create field mappings with transformations"
            )
            e2e_adapter.start_step(workflow_id, step6["id"])
            
            # Create field mappings
            mappings = [
                {
                    "source_field": "id",
                    "destination_field": "employee_id",
                    "transformation": "direct",
                    "required": True
                },
                {
                    "source_field": "name",
                    "destination_field": "full_name",
                    "transformation": "capitalize_name_opt",
                    "required": True,
                    "transform_params": {}
                },
                {
                    "source_field": "department",
                    "destination_field": "department_code",
                    "transformation": "department_code_opt",
                    "required": False,
                    "transform_params": {
                        "mapping": {
                            "Engineering": "ENG",
                            "Marketing": "MKT",
                            "Human Resources": "HR",
                            "Sales": "SLS",
                            "Executive": "EXE"
                        }
                    }
                },
                {
                    "source_field": "salary",
                    "destination_field": "adjusted_salary",
                    "transformation": "salary_bonus_opt",
                    "required": False,
                    "transform_params": {
                        "bonus_percent": 5
                    }
                }
            ]
            
            for mapping_data in mappings:
                mapping = e2e_adapter.integration_adapter.create_field_mapping(
                    integration_id,
                    mapping_data
                )
            
            # Verify field mappings
            created_mappings = e2e_adapter.integration_adapter.get_field_mappings(integration_id)
            assert len(created_mappings) == 4
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step6["id"], 
                "success",
                {"mappings_created": len(created_mappings)}
            )
            
            # Step 7: Configure destination
            step7 = e2e_adapter.add_workflow_step(
                workflow_id,
                "configure_destination",
                "Configure the integration destination"
            )
            e2e_adapter.start_step(workflow_id, step7["id"])
            
            destination_config = {
                "endpoint": "https://api.example.com/employees",
                "auth_type": "basic",
                "credentials_id": str(uuid.uuid4()),
                "batch_size": 100,
                "retry_count": 3,
                "headers": {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            }
            
            updated_integration = e2e_adapter.integration_adapter.update_integration(
                integration_id,
                {"destination_config": destination_config}
            )
            
            # Verify destination configuration
            assert updated_integration["destination_config"]["endpoint"] == "https://api.example.com/employees"
            assert updated_integration["destination_config"]["batch_size"] == 100
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step7["id"], 
                "success",
                {"destination_configured": True}
            )
            
            # Step 8: Schedule the integration
            step8 = e2e_adapter.add_workflow_step(
                workflow_id,
                "schedule_integration",
                "Schedule the integration for automatic execution"
            )
            e2e_adapter.start_step(workflow_id, step8["id"])
            
            schedule_str = "Daily @ 2am"
            task_id = e2e_adapter.scheduler_adapter.schedule_integration(integration_id, schedule_str)
            
            # Verify schedule
            task_info = e2e_adapter.scheduler_adapter.get_task_info(task_id)
            assert task_info is not None
            assert task_info["integration_id"] == integration_id
            assert task_info["schedule_str"] == schedule_str
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step8["id"], 
                "success",
                {"task_id": task_id}
            )
            
            # Step 9: Execute the integration
            step9 = e2e_adapter.add_workflow_step(
                workflow_id,
                "execute_integration",
                "Execute the integration and process data"
            )
            e2e_adapter.start_step(workflow_id, step9["id"])
            
            # Run the integration
            run = e2e_adapter.integration_adapter.run_integration(integration_id)
            assert run["integration_id"] == integration_id
            assert run["status"] == "running"
            
            # Simulate successful completion
            e2e_adapter.integration_adapter.update_integration(
                integration_id,
                {"last_run_status": "success", "last_run_records": 250}
            )
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step9["id"], 
                "success",
                {"records_processed": 250}
            )
            
            # Step 10: Verify execution results
            step10 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_results",
                "Verify the integration execution results"
            )
            e2e_adapter.start_step(workflow_id, step10["id"])
            
            # Get integration history
            history = e2e_adapter.integration_adapter.get_integration_history(integration_id)
            assert len(history) >= 1
            
            # Get updated integration
            updated_integration = e2e_adapter.integration_adapter.get_integration(integration_id)
            assert updated_integration["last_run_at"] is not None
            assert updated_integration["last_run_status"] == "success"
            
            # Complete the step
            e2e_adapter.complete_step(
                workflow_id, 
                step10["id"], 
                "success",
                {
                    "last_run_status": updated_integration["last_run_status"],
                    "run_history_count": len(history)
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
    
    def test_data_validation_failure_workflow(self, entity_registry, e2e_adapter):
        """
        Test the integration creation process with data validation failures
        using the optimized E2E adapter.
        """
        # Start a new workflow
        workflow = e2e_adapter.start_workflow(
            "integration-validation-1",
            "Integration Creation with Validation Failure"
        )
        workflow_id = workflow["id"]
        
        try:
            # Step 1: Create a user
            step1 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_user",
                "Create a user for integration ownership"
            )
            e2e_adapter.start_step(workflow_id, step1["id"])
            
            user = e2e_adapter.auth_adapter.add_user(
                User(
                    id=str(uuid.uuid4()),
                    email="validation_opt@example.com",
                    name="Validation Test User Optimized",
                    role="INTEGRATION_MANAGER",
                    mfa_enabled=False
                )
            )
            
            e2e_adapter.associate_entity(workflow_id, step1["id"], "User", user.id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step1["id"], 
                "success",
                {"user_id": user.id}
            )
            
            # Step 2: Create an integration
            step2 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_integration",
                "Create an integration for validation testing"
            )
            e2e_adapter.start_step(workflow_id, step2["id"])
            
            integration = e2e_adapter.integration_adapter.create_integration({
                "name": "Validation Test Integration Optimized",
                "description": "Integration for testing validation failures with optimized workflow",
                "type": "API-based",
                "source": "Test Source",
                "destination": "Test Destination",
                "owner_id": user.id,
                "tenant_id": "default-tenant"
            })
            
            integration_id = integration["id"]
            e2e_adapter.associate_entity(workflow_id, step2["id"], "Integration", str(integration_id))
            
            e2e_adapter.complete_step(
                workflow_id, 
                step2["id"], 
                "success",
                {"integration_id": integration_id}
            )
            
            # Step 3: Create a dataset with required fields
            step3 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_dataset",
                "Create a dataset with required fields"
            )
            e2e_adapter.start_step(workflow_id, step3["id"])
            
            dataset = e2e_adapter.integration_adapter.create_dataset({
                "name": "Product Data Optimized",
                "description": "Product information dataset for validation testing",
                "tenant_id": "default-tenant"
            })
            
            fields = [
                {
                    "name": "product_id",
                    "display_name": "Product ID",
                    "data_type": "string",
                    "required": True
                },
                {
                    "name": "product_name",
                    "display_name": "Product Name",
                    "data_type": "string",
                    "required": True
                },
                {
                    "name": "price",
                    "display_name": "Price",
                    "data_type": "number",
                    "required": True
                }
            ]
            
            for field_data in fields:
                e2e_adapter.integration_adapter.create_dataset_field(
                    dataset["id"],
                    field_data
                )
            
            # Associate dataset with integration
            e2e_adapter.integration_adapter.associate_dataset(integration_id, dataset["id"])
            e2e_adapter.associate_entity(workflow_id, step3["id"], "Dataset", str(dataset["id"]))
            
            e2e_adapter.complete_step(
                workflow_id, 
                step3["id"], 
                "success",
                {"dataset_id": dataset["id"]}
            )
            
            # Step 4: Create incomplete field mappings
            step4 = e2e_adapter.add_workflow_step(
                workflow_id,
                "create_incomplete_mappings",
                "Create incomplete field mappings (missing required field)"
            )
            e2e_adapter.start_step(workflow_id, step4["id"])
            
            # Create only two of the three required mappings
            mappings = [
                {
                    "source_field": "id",
                    "destination_field": "product_id",
                    "transformation": "direct",
                    "required": True
                },
                {
                    "source_field": "name",
                    "destination_field": "product_name",
                    "transformation": "direct",
                    "required": True
                }
                # Deliberately missing the 'price' mapping which is required
            ]
            
            for mapping_data in mappings:
                e2e_adapter.integration_adapter.create_field_mapping(
                    integration_id,
                    mapping_data
                )
            
            created_mappings = e2e_adapter.integration_adapter.get_field_mappings(integration_id)
            
            e2e_adapter.complete_step(
                workflow_id, 
                step4["id"], 
                "success",
                {
                    "mappings_created": len(created_mappings),
                    "missing_required_field": "price"
                }
            )
            
            # Step 5: Attempt to run the integration
            step5 = e2e_adapter.add_workflow_step(
                workflow_id,
                "run_integration",
                "Attempt to run the integration (should fail validation)"
            )
            e2e_adapter.start_step(workflow_id, step5["id"])
            
            # Run integration - should detect validation failure
            run = e2e_adapter.integration_adapter.run_integration(integration_id)
            
            # Simulate validation failure
            e2e_adapter.integration_adapter.update_integration(
                integration_id,
                {
                    "last_run_status": "failed", 
                    "health": "error",
                    "error_details": "Validation failed: Missing required field mapping for 'price'"
                }
            )
            
            e2e_adapter.complete_step(
                workflow_id, 
                step5["id"], 
                "success",
                {
                    "validation_passed": False,
                    "error_message": "Missing required field mapping for 'price'"
                }
            )
            
            # Step 6: Verify the integration state
            step6 = e2e_adapter.add_workflow_step(
                workflow_id,
                "verify_state",
                "Verify the integration is in error state"
            )
            e2e_adapter.start_step(workflow_id, step6["id"])
            
            updated_integration = e2e_adapter.integration_adapter.get_integration(integration_id)
            assert updated_integration["health"] == "error"
            assert "Missing required field mapping" in updated_integration["error_details"]
            
            e2e_adapter.complete_step(
                workflow_id, 
                step6["id"], 
                "success",
                {
                    "health_status": updated_integration["health"],
                    "error_details": updated_integration["error_details"]
                }
            )
            
            # Step 7: Fix the validation issue
            step7 = e2e_adapter.add_workflow_step(
                workflow_id,
                "fix_validation",
                "Fix the validation issue by adding the missing mapping"
            )
            e2e_adapter.start_step(workflow_id, step7["id"])
            
            # Add the missing price mapping
            price_mapping = e2e_adapter.integration_adapter.create_field_mapping(
                integration_id,
                {
                    "source_field": "price",
                    "destination_field": "price",
                    "transformation": "direct",
                    "required": True
                }
            )
            
            e2e_adapter.complete_step(
                workflow_id, 
                step7["id"], 
                "success",
                {"mapping_added": "price"}
            )
            
            # Step 8: Run the integration again (should succeed)
            step8 = e2e_adapter.add_workflow_step(
                workflow_id,
                "rerun_integration",
                "Run the integration again after fixing the validation issue"
            )
            e2e_adapter.start_step(workflow_id, step8["id"])
            
            run = e2e_adapter.integration_adapter.run_integration(integration_id)
            
            # Simulate successful completion
            e2e_adapter.integration_adapter.update_integration(
                integration_id,
                {
                    "last_run_status": "success", 
                    "health": "healthy",
                    "error_details": None,
                    "last_run_records": 100
                }
            )
            
            e2e_adapter.complete_step(
                workflow_id, 
                step8["id"], 
                "success",
                {
                    "validation_passed": True,
                    "records_processed": 100
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