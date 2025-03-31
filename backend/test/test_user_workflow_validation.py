"""
User Workflow Validation Tests

This module validates complete user workflows across the platform,
ensuring that users can complete critical business processes from
start to finish.
"""

import pytest
import uuid
import time
from datetime import datetime, timezone, timedelta
from test_adapters.auth.auth_adapter import User, AuthAdapter
from test_adapters.admin_adapter import AdminTestAdapter
from test_adapters.integration_adapter import IntegrationAdapter
from test_adapters.e2e_adapter import E2EAdapter


class TestUserWorkflowValidation:
    """Tests for validating complete user workflows."""
    
    def test_integration_creation_to_execution_workflow(self, entity_registry, 
                                                     auth_adapter, integration_adapter,
                                                     e2e_adapter, performance_benchmark_adapter):
        """
        Test complete workflow from integration creation to execution.
        
        This test validates the following business process:
        1. User creates a new integration
        2. User configures source and destination
        3. User creates datasets and mappings
        4. User configures transformation rules
        5. User schedules the integration
        6. User runs the integration
        7. User verifies results and logs
        
        This test also validates performance aspects of the workflow by measuring
        execution time of key operations.
        """
        # Register workflow with the E2E adapter for tracking
        workflow_id = e2e_adapter.start_workflow("integration_lifecycle")
        
        # Step 1: Create a test user
        e2e_adapter.log_step(workflow_id, "Creating test user")
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="workflow_test@example.com",
                name="Workflow Test User",
                role="INTEGRATION_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Step 2: Create an integration
        e2e_adapter.log_step(workflow_id, "Creating integration")
        integration = integration_adapter.create_integration({
            "name": "Workflow Test Integration",
            "description": "End-to-end workflow test integration",
            "status": "draft",
            "owner_id": user.id
        })
        
        assert integration["id"] is not None
        assert integration["name"] == "Workflow Test Integration"
        assert integration["status"] == "draft"
        
        # Step 3: Configure source connector
        e2e_adapter.log_step(workflow_id, "Configuring source connector")
        source_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "Workflow Test Source",
            "config": {
                "bucket": "workflow-test-bucket",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
            },
            "integration_id": integration["id"],
            "owner_id": user.id
        })
        
        # Step 4: Configure destination connector
        e2e_adapter.log_step(workflow_id, "Configuring destination connector")
        destination_connector = integration_adapter.create_test_connector({
            "type": "azure_blob",
            "name": "Workflow Test Destination",
            "config": {
                "container": "workflow-test-container",
                "account_name": "workflowaccount",
                "credentials_id": str(uuid.uuid4())
            },
            "integration_id": integration["id"],
            "owner_id": user.id
        })
        
        # Step 5: Create source dataset
        e2e_adapter.log_step(workflow_id, "Creating source dataset")
        source_dataset = integration_adapter.create_dataset({
            "name": "Employee Data",
            "description": "Employee information for workflow test",
            "connector_id": source_connector["id"],
            "integration_id": integration["id"]
        })
        
        # Step 6: Define source dataset fields
        e2e_adapter.log_step(workflow_id, "Defining dataset fields")
        fields = [
            integration_adapter.create_dataset_field({
                "dataset_id": source_dataset["id"],
                "name": "employee_id",
                "data_type": "string",
                "required": True
            }),
            integration_adapter.create_dataset_field({
                "dataset_id": source_dataset["id"],
                "name": "name",
                "data_type": "string",
                "required": True
            }),
            integration_adapter.create_dataset_field({
                "dataset_id": source_dataset["id"],
                "name": "department",
                "data_type": "string",
                "required": True
            }),
            integration_adapter.create_dataset_field({
                "dataset_id": source_dataset["id"],
                "name": "salary",
                "data_type": "number",
                "required": True
            })
        ]
        
        # Step 7: Create destination dataset
        e2e_adapter.log_step(workflow_id, "Creating destination dataset")
        destination_dataset = integration_adapter.create_dataset({
            "name": "Transformed Employee Data",
            "description": "Transformed employee data for workflow test",
            "connector_id": destination_connector["id"],
            "integration_id": integration["id"]
        })
        
        # Step 8: Define destination dataset fields
        destination_fields = [
            integration_adapter.create_dataset_field({
                "dataset_id": destination_dataset["id"],
                "name": "employee_id",
                "data_type": "string",
                "required": True
            }),
            integration_adapter.create_dataset_field({
                "dataset_id": destination_dataset["id"],
                "name": "full_name",  # Renamed from 'name'
                "data_type": "string",
                "required": True
            }),
            integration_adapter.create_dataset_field({
                "dataset_id": destination_dataset["id"],
                "name": "department",
                "data_type": "string",
                "required": True
            }),
            integration_adapter.create_dataset_field({
                "dataset_id": destination_dataset["id"],
                "name": "salary",
                "data_type": "number",
                "required": True
            }),
            integration_adapter.create_dataset_field({
                "dataset_id": destination_dataset["id"],
                "name": "tax_rate",  # New calculated field
                "data_type": "number",
                "required": True
            })
        ]
        
        # Step 9: Create field mappings
        e2e_adapter.log_step(workflow_id, "Creating field mappings")
        mappings = [
            integration_adapter.create_field_mapping({
                "integration_id": integration["id"],
                "source_field_id": fields[0]["id"],  # employee_id
                "destination_field_id": destination_fields[0]["id"],  # employee_id
                "transformation_type": "direct"
            }),
            integration_adapter.create_field_mapping({
                "integration_id": integration["id"],
                "source_field_id": fields[1]["id"],  # name
                "destination_field_id": destination_fields[1]["id"],  # full_name
                "transformation_type": "function",
                "transformation_config": {
                    "function": "uppercase"
                }
            }),
            integration_adapter.create_field_mapping({
                "integration_id": integration["id"],
                "source_field_id": fields[2]["id"],  # department
                "destination_field_id": destination_fields[2]["id"],  # department
                "transformation_type": "direct"
            }),
            integration_adapter.create_field_mapping({
                "integration_id": integration["id"],
                "source_field_id": fields[3]["id"],  # salary
                "destination_field_id": destination_fields[3]["id"],  # salary
                "transformation_type": "direct"
            }),
            integration_adapter.create_field_mapping({
                "integration_id": integration["id"],
                "source_field_id": fields[3]["id"],  # salary (used for calculating tax_rate)
                "destination_field_id": destination_fields[4]["id"],  # tax_rate
                "transformation_type": "function",
                "transformation_config": {
                    "function": "calculate",
                    "formula": "value >= 100000 ? 0.3 : 0.2"
                }
            })
        ]
        
        # Step 10: Create integration flow
        e2e_adapter.log_step(workflow_id, "Creating integration flow")
        flow = integration_adapter.create_flow({
            "integration_id": integration["id"],
            "nodes": [
                {
                    "id": "source",
                    "type": "source",
                    "config": {
                        "connector_id": source_connector["id"],
                        "dataset_id": source_dataset["id"],
                        "path": "employees.csv"
                    },
                    "position": {"x": 100, "y": 100}
                },
                {
                    "id": "transform",
                    "type": "transform",
                    "config": {
                        "mappings": [m["id"] for m in mappings]
                    },
                    "position": {"x": 300, "y": 100}
                },
                {
                    "id": "destination",
                    "type": "destination",
                    "config": {
                        "connector_id": destination_connector["id"],
                        "dataset_id": destination_dataset["id"],
                        "path": "transformed_employees.csv"
                    },
                    "position": {"x": 500, "y": 100}
                }
            ],
            "edges": [
                {
                    "source": "source",
                    "target": "transform"
                },
                {
                    "source": "transform",
                    "target": "destination"
                }
            ]
        })
        
        # Step 11: Validate the flow
        e2e_adapter.log_step(workflow_id, "Validating flow")
        validation_result = integration_adapter.validate_flow(flow["id"])
        
        assert validation_result["valid"] is True
        assert validation_result["errors"] == []
        
        # Step 12: Update integration status to active
        e2e_adapter.log_step(workflow_id, "Activating integration")
        updated_integration = integration_adapter.update_integration(
            integration["id"],
            {"status": "active"}
        )
        
        assert updated_integration["status"] == "active"
        
        # Step 13: Schedule the integration
        e2e_adapter.log_step(workflow_id, "Scheduling integration")
        schedule = integration_adapter.schedule_integration({
            "integration_id": integration["id"],
            "schedule_type": "cron",
            "cron_expression": "0 0 * * *",  # Daily at midnight
            "enabled": True,
            "start_date": datetime.now(timezone.utc).isoformat(),
            "time_zone": "UTC"
        })
        
        assert schedule["id"] is not None
        assert schedule["enabled"] is True
        
        # Step 14: Upload test data to source
        e2e_adapter.log_step(workflow_id, "Uploading test data")
        test_data = """employee_id,name,department,salary
E001,John Smith,Engineering,120000
E002,Jane Doe,Marketing,95000
E003,Bob Johnson,Engineering,110000
E004,Alice Brown,HR,85000
E005,Charlie Wilson,Finance,130000
"""
        
        upload_result = integration_adapter.upload_file_to_storage(
            connector_id=source_connector["id"],
            file_content=test_data,
            file_path="employees.csv",
            metadata={"content_type": "text/csv"}
        )
        
        assert upload_result["success"] is True
        
        # Step 15: Run the integration manually with performance benchmarking
        e2e_adapter.log_step(workflow_id, "Running integration with performance monitoring")
        
        # Start performance profiling for integration execution
        profile_id = performance_benchmark_adapter.start_profiling(
            "integration_execution", 
            track_memory=True
        )
        
        run_result = integration_adapter.run_integration(
            integration["id"],
            {"user_id": user.id}
        )
        
        # Stop performance profiling and analyze results
        perf_metrics = performance_benchmark_adapter.stop_profiling(profile_id)
        
        # Record the benchmark
        performance_benchmark_adapter.record_benchmark(
            "workflow_integration_execution",
            perf_metrics["duration"],
            {
                "integration_id": integration["id"],
                "user_id": user.id,
                "memory_increase": perf_metrics.get("memory_increase", 0),
                "flow_node_count": 3  # Source, transform, destination
            }
        )
        
        assert run_result["status"] in ["completed", "success"]
        assert run_result["errors"] == []
        
        # Verify performance is within acceptable threshold
        # Typical integration execution should be under 2 seconds for this simple case
        assert perf_metrics["duration"] < 2.0, "Integration execution took too long"
        
        # Step 16: Verify the results
        e2e_adapter.log_step(workflow_id, "Verifying results")
        result_file = integration_adapter.get_file_from_storage(
            connector_id=destination_connector["id"],
            file_path="transformed_employees.csv"
        )
        
        assert result_file["success"] is True
        
        # Check that transformations were applied correctly
        assert "JOHN SMITH" in result_file["content"]  # Name uppercase transformation
        assert "tax_rate" in result_file["content"]    # New calculated field
        
        # Step 17: Check integration history
        e2e_adapter.log_step(workflow_id, "Checking integration history")
        history = integration_adapter.get_integration_history(integration["id"])
        
        assert len(history) >= 1
        assert history[0]["status"] in ["completed", "success"]
        
        # Step 18: Complete workflow
        e2e_adapter.complete_workflow(workflow_id, "success")
        
        # Verify workflow completion
        workflow_status = e2e_adapter.get_workflow_status(workflow_id)
        assert workflow_status["status"] == "success"
        assert len(workflow_status["steps"]) >= 15  # At least 15 steps should be recorded
    
    def test_user_onboarding_to_first_integration_workflow(self, entity_registry,
                                                        auth_adapter, integration_adapter,
                                                        e2e_adapter, performance_benchmark_adapter):
        """
        Test complete workflow from user onboarding to creating first integration.
        
        This test validates the following business process:
        1. Admin creates invitation
        2. User receives and accepts invitation
        3. User completes registration
        4. User sets up MFA
        5. User logs in
        6. User creates first integration
        7. User configures basic integration
        
        This test also measures the performance of key operations during the workflow.
        """
        # Register workflow with the E2E adapter for tracking
        workflow_id = e2e_adapter.start_workflow("onboarding_to_first_integration")
        
        # Step 1: Create admin user
        e2e_adapter.log_step(workflow_id, "Creating admin user")
        admin = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="admin@example.com",
                name="Admin User",
                role="ADMIN",
                mfa_enabled=True
            )
        )
        
        # Step 2: Admin creates invitation
        e2e_adapter.log_step(workflow_id, "Creating invitation")
        invitation = auth_adapter.create_invitation({
            "email": "new_user@example.com",
            "role": "INTEGRATION_MANAGER",
            "expiration": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "invited_by": admin.id
        })
        
        assert invitation["id"] is not None
        assert invitation["email"] == "new_user@example.com"
        assert invitation["status"] == "pending"
        
        # Step 3: User accepts invitation
        e2e_adapter.log_step(workflow_id, "Accepting invitation")
        acceptance_result = auth_adapter.accept_invitation(
            invitation["id"],
            {"token": invitation["token"]}
        )
        
        assert acceptance_result["success"] is True
        
        # Step 4: User completes registration
        e2e_adapter.log_step(workflow_id, "Completing registration")
        user = auth_adapter.register_user({
            "invitation_id": invitation["id"],
            "name": "New User",
            "password": "SecurePassword123!",
            "email": "new_user@example.com"
        })
        
        assert user["id"] is not None
        assert user["email"] == "new_user@example.com"
        assert user["role"] == "INTEGRATION_MANAGER"
        
        # Step 5: User sets up MFA
        e2e_adapter.log_step(workflow_id, "Setting up MFA")
        # Begin MFA enrollment
        mfa_setup = auth_adapter.begin_mfa_enrollment(user["id"])
        
        assert mfa_setup["secret"] is not None
        assert mfa_setup["qr_code"] is not None
        
        # Generate test code using secret
        test_code = auth_adapter.generate_test_code(mfa_setup["secret"])
        
        # Complete MFA enrollment
        mfa_result = auth_adapter.complete_mfa_enrollment(
            user["id"],
            {"code": test_code}
        )
        
        assert mfa_result["success"] is True
        assert mfa_result["recovery_codes"] is not None
        assert len(mfa_result["recovery_codes"]) > 0
        
        # Step 6: User logs in (simulated)
        e2e_adapter.log_step(workflow_id, "User logs in")
        # Generate MFA code for authentication
        auth_code = auth_adapter.generate_test_code(mfa_setup["secret"])
        
        # Authenticate with MFA
        auth_result = auth_adapter.authenticate(
            "new_user@example.com",
            "SecurePassword123!",
            auth_code
        )
        
        assert auth_result["success"] is True
        assert auth_result["token"] is not None
        
        # Step 7: User creates first integration
        e2e_adapter.log_step(workflow_id, "Creating first integration")
        integration = integration_adapter.create_integration({
            "name": "First Integration",
            "description": "My first integration after onboarding",
            "status": "draft",
            "owner_id": user["id"]
        })
        
        assert integration["id"] is not None
        assert integration["name"] == "First Integration"
        
        # Step 8: User creates basic source connector
        e2e_adapter.log_step(workflow_id, "Creating source connector")
        source_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "First Source",
            "config": {
                "bucket": "first-bucket",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
            },
            "integration_id": integration["id"],
            "owner_id": user["id"]
        })
        
        # Step 9: User creates basic destination connector
        e2e_adapter.log_step(workflow_id, "Creating destination connector")
        destination_connector = integration_adapter.create_test_connector({
            "type": "s3",
            "name": "First Destination",
            "config": {
                "bucket": "first-destination-bucket",
                "region": "us-east-1",
                "credentials_id": str(uuid.uuid4())
            },
            "integration_id": integration["id"],
            "owner_id": user["id"]
        })
        
        # Step 10: User creates simple flow
        e2e_adapter.log_step(workflow_id, "Creating simple flow")
        flow = integration_adapter.create_flow({
            "integration_id": integration["id"],
            "nodes": [
                {
                    "id": "source",
                    "type": "source",
                    "config": {
                        "connector_id": source_connector["id"],
                        "path": "data.csv"
                    },
                    "position": {"x": 100, "y": 100}
                },
                {
                    "id": "destination",
                    "type": "destination",
                    "config": {
                        "connector_id": destination_connector["id"],
                        "path": "processed_data.csv"
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
        
        # Step 11: User saves integration (updating status)
        e2e_adapter.log_step(workflow_id, "Saving integration")
        updated_integration = integration_adapter.update_integration(
            integration["id"],
            {"status": "saved"}
        )
        
        assert updated_integration["status"] == "saved"
        
        # Complete workflow
        e2e_adapter.complete_workflow(workflow_id, "success")
        
        # Verify workflow completion
        workflow_status = e2e_adapter.get_workflow_status(workflow_id)
        assert workflow_status["status"] == "success"
        assert len(workflow_status["steps"]) >= 10  # At least 10 steps should be recorded
        
    def test_admin_tenant_management_workflow(self, entity_registry, auth_adapter, 
                                           admin_adapter, integration_adapter, e2e_adapter,
                                           performance_benchmark_adapter):
        """
        Test the admin workflow for tenant management.
        
        This test validates the following business process:
        1. Super admin creates a new tenant
        2. Super admin configures tenant settings
        3. Super admin creates admin user for the tenant
        4. Super admin assigns applications to the tenant
        5. Super admin views tenant analytics
        6. Tenant admin logs in and manages tenant users
        7. Tenant admin configures tenant-specific settings
        """
        # Register workflow with the E2E adapter for tracking
        workflow_id = e2e_adapter.start_workflow("admin_tenant_management")
        
        # Step 1: Create super admin user
        e2e_adapter.log_step(workflow_id, "Creating super admin user")
        super_admin = auth_adapter.add_user({
            "id": str(uuid.uuid4()),
            "email": "super_admin@example.com",
            "name": "Super Admin",
            "role": "SUPER_ADMIN",
            "mfa_enabled": False
        })
        
        # Step 2: Create a new tenant
        e2e_adapter.log_step(workflow_id, "Creating new tenant")
        profile_id = performance_benchmark_adapter.start_profiling("tenant_creation")
        
        tenant = admin_adapter.create_tenant({
            "id": f"tenant-{uuid.uuid4()}",
            "name": "Test Tenant",
            "tier": "enterprise",
            "status": "active"
        })
        
        perf_metrics = performance_benchmark_adapter.stop_profiling(profile_id)
        performance_benchmark_adapter.record_benchmark(
            "admin_tenant_creation",
            perf_metrics["duration"],
            {"tenant_tier": "enterprise"}
        )
        
        assert tenant["id"] is not None
        assert tenant["name"] == "Test Tenant"
        assert tenant["tier"] == "enterprise"
        
        # Step 3: Configure tenant settings
        e2e_adapter.log_step(workflow_id, "Configuring tenant settings")
        tenant_update = admin_adapter.update_tenant(
            tenant["id"],
            {
                "settings": {
                    "max_users": 50,
                    "max_storage_gb": 500,
                    "max_integrations": 100,
                    "enable_advanced_features": True
                }
            }
        )
        
        assert tenant_update["settings"]["max_users"] == 50
        
        # Step 4: Create tenant admin user
        e2e_adapter.log_step(workflow_id, "Creating tenant admin")
        tenant_admin = auth_adapter.add_user({
            "id": str(uuid.uuid4()),
            "email": "tenant_admin@example.com",
            "name": "Tenant Admin",
            "role": "ADMIN",
            "tenant_id": tenant["id"],
            "mfa_enabled": False
        })
        
        assert tenant_admin.id is not None
        assert tenant_admin.tenant_id == tenant["id"]
        
        # Step 5: Create applications for the tenant
        e2e_adapter.log_step(workflow_id, "Creating applications for tenant")
        applications = []
        for i in range(3):
            app = admin_adapter.create_application({
                "name": f"App {i+1} for {tenant['name']}",
                "description": f"Test application {i+1}",
                "status": "active"
            }, super_admin.id)
            
            # Associate application with tenant
            admin_adapter.associate_application_with_tenant(
                tenant["id"], app["id"], super_admin.id
            )
            
            applications.append(app)
        
        # Step 6: Verify tenant applications
        e2e_adapter.log_step(workflow_id, "Verifying tenant applications")
        tenant_apps = admin_adapter.get_tenant_applications(tenant["id"])
        
        assert len(tenant_apps) == 3
        assert all(app["id"] in [a["id"] for a in tenant_apps] for app in applications)
        
        # Step 7: Create datasets for tenant
        e2e_adapter.log_step(workflow_id, "Creating datasets for tenant")
        datasets = []
        for i in range(2):
            dataset = admin_adapter.create_dataset({
                "name": f"Dataset {i+1} for {tenant['name']}",
                "description": f"Test dataset {i+1}",
                "status": "active"
            }, super_admin.id)
            
            # Associate dataset with tenant
            admin_adapter.associate_dataset_with_tenant(
                tenant["id"], dataset["id"], super_admin.id
            )
            
            datasets.append(dataset)
        
        # Step 8: Switch to tenant admin context
        e2e_adapter.log_step(workflow_id, "Switching to tenant admin context")
        
        # Step 9: Create regular users for the tenant
        e2e_adapter.log_step(workflow_id, "Creating regular users for tenant")
        regular_users = []
        for i in range(3):
            user = auth_adapter.add_user({
                "id": str(uuid.uuid4()),
                "email": f"user{i+1}@{tenant['id']}.com",
                "name": f"User {i+1}",
                "role": "USER",
                "tenant_id": tenant["id"],
                "mfa_enabled": False
            })
            regular_users.append(user)
        
        # Step 10: Tenant admin creates an integration
        e2e_adapter.log_step(workflow_id, "Creating integration as tenant admin")
        integration = integration_adapter.create_integration({
            "name": "Admin Created Integration",
            "description": "Integration created by tenant admin",
            "status": "active",
            "tenant_id": tenant["id"],
            "owner_id": tenant_admin.id
        })
        
        assert integration["name"] == "Admin Created Integration"
        assert integration["tenant_id"] == tenant["id"]
        
        # Step 11: Super admin views tenant analytics
        e2e_adapter.log_step(workflow_id, "Viewing tenant analytics")
        tenant_analytics = admin_adapter.get_tenant_analytics(tenant["id"])
        
        assert tenant_analytics["user_count"] >= 4  # Super admin + tenant admin + 3 users
        assert tenant_analytics["integration_count"] >= 1
        assert tenant_analytics["application_count"] >= 3
        assert tenant_analytics["dataset_count"] >= 2
        
        # Complete workflow
        e2e_adapter.complete_workflow(workflow_id, "success")
        
        # Verify workflow completion
        workflow_status = e2e_adapter.get_workflow_status(workflow_id)
        assert workflow_status["status"] == "success"
        assert len(workflow_status["steps"]) >= 11  # At least 11 steps should be recorded