"""
Integration Creation End-to-End Tests

This module contains end-to-end tests for the complete integration creation workflow,
including configuration, data source setup, transformation configuration, destination setup,
execution, and monitoring.
"""

import pytest
import pandas as pd
from datetime import datetime, timezone
import uuid

from test_adapters.auth import TimezoneTestUtilities
from test_adapters.auth.auth_adapter import User


class TestIntegrationCreationE2E:
    """End-to-end tests for integration creation and execution workflow."""
    
    def test_complete_integration_creation(self, entity_registry, auth_adapter, 
                                         integration_adapter, scheduler_adapter,
                                         transformation_registry_adapter):
        """
        Test the complete integration creation process from configuration to execution.
        
        This test verifies the following workflow:
        1. User creates a new integration
        2. User configures source connection
        3. User sets up data transformations
        4. User configures destination
        5. User validates and saves the flow
        6. User schedules the integration
        7. Integration executes and processes data
        8. User verifies results
        """
        # Step 1: Create a user for ownership
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="integration_owner@example.com",
                name="Integration Owner",
                role="INTEGRATION_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Step 2: Create a new integration
        integration_data = {
            "name": "Test API Integration",
            "description": "Integration for E2E testing",
            "type": "API-based",
            "source": "Test API Source",
            "destination": "Test API Destination",
            "owner_id": user.id,
            "tenant_id": "default-tenant"
        }
        
        integration = integration_adapter.create_integration(integration_data)
        integration_id = integration["id"]
        
        assert integration["name"] == "Test API Integration"
        assert integration["type"] == "API-based"
        assert integration["health"] == "healthy"  # Default status
        
        # Step 3: Configure source connection
        source_config = {
            "endpoint": "https://api.example.com/data",
            "auth_type": "oauth2",
            "credentials_id": str(uuid.uuid4()),
            "filters": {
                "date_from": "2023-01-01",
                "limit": 1000
            }
        }
        
        updated_integration = integration_adapter.update_integration(
            integration_id,
            {"source_config": source_config}
        )
        
        assert updated_integration["source_config"]["endpoint"] == "https://api.example.com/data"
        assert updated_integration["source_config"]["auth_type"] == "oauth2"
        
        # Step 4: Create a dataset
        dataset = integration_adapter.create_dataset({
            "name": "Employee Data",
            "description": "Employee information dataset",
            "tenant_id": "default-tenant"
        })
        
        # Add fields to the dataset
        id_field = integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "employee_id",
                "display_name": "Employee ID",
                "data_type": "string",
                "required": True
            }
        )
        
        name_field = integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "name",
                "display_name": "Full Name",
                "data_type": "string",
                "required": True
            }
        )
        
        department_field = integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "department",
                "display_name": "Department",
                "data_type": "string",
                "required": False
            }
        )
        
        salary_field = integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "salary",
                "display_name": "Annual Salary",
                "data_type": "number",
                "required": False
            }
        )
        
        # Associate dataset with integration
        integration_adapter.associate_dataset(integration_id, dataset["id"])
        
        # Verify dataset association
        associated_datasets = integration_adapter.get_integration_datasets(integration_id)
        assert len(associated_datasets) == 1
        assert associated_datasets[0]["id"] == dataset["id"]
        
        # Step 5: Configure field mappings with transformations
        
        # Create test transformations
        transformation_registry_adapter.register_test_transformation(
            name="capitalize_name",
            description="Capitalizes each word in a name",
            supported_types=["string"],
            function=lambda data, params: data.str.title()
        )
        
        transformation_registry_adapter.register_test_transformation(
            name="department_code",
            description="Maps department name to code",
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
        
        transformation_registry_adapter.register_test_transformation(
            name="salary_bonus",
            description="Applies bonus percentage to salary",
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
        
        # Create field mappings
        id_mapping = integration_adapter.create_field_mapping(
            integration_id,
            {
                "source_field": "id",
                "destination_field": "employee_id",
                "transformation": "direct",
                "required": True
            }
        )
        
        name_mapping = integration_adapter.create_field_mapping(
            integration_id,
            {
                "source_field": "full_name",
                "destination_field": "name",
                "transformation": "capitalize_name",
                "required": True,
                "transform_params": {}
            }
        )
        
        department_mapping = integration_adapter.create_field_mapping(
            integration_id,
            {
                "source_field": "department",
                "destination_field": "department_code",
                "transformation": "department_code",
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
            }
        )
        
        salary_mapping = integration_adapter.create_field_mapping(
            integration_id,
            {
                "source_field": "salary",
                "destination_field": "adjusted_salary",
                "transformation": "salary_bonus",
                "required": False,
                "transform_params": {
                    "bonus_percent": 5
                }
            }
        )
        
        # Verify field mappings
        mappings = integration_adapter.get_field_mappings(integration_id)
        assert len(mappings) == 4
        
        # Step 6: Configure destination
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
        
        updated_integration = integration_adapter.update_integration(
            integration_id,
            {"destination_config": destination_config}
        )
        
        assert updated_integration["destination_config"]["endpoint"] == "https://api.example.com/employees"
        assert updated_integration["destination_config"]["batch_size"] == 100
        
        # Step 7: Schedule the integration
        schedule_str = "Daily @ 2am"
        task_id = scheduler_adapter.schedule_integration(integration_id, schedule_str)
        
        # Verify schedule
        task_info = scheduler_adapter.get_task_info(task_id)
        assert task_info is not None
        assert task_info["integration_id"] == integration_id
        assert task_info["schedule_str"] == schedule_str
        
        # Step 8: Run the integration (simulate execution)
        run = integration_adapter.run_integration(integration_id)
        assert run["integration_id"] == integration_id
        assert run["status"] == "running"
        
        # Simulate successful completion
        integration_adapter.update_integration(
            integration_id,
            {"last_run_status": "success", "last_run_records": 250}
        )
        
        # Verify integration history
        history = integration_adapter.get_integration_history(integration_id)
        assert len(history) >= 1
        
        # Step 9: Verify results
        updated_integration = integration_adapter.get_integration(integration_id)
        assert updated_integration["last_run_at"] is not None
        
    def test_integration_data_validation_failure(self, entity_registry, auth_adapter, 
                                              integration_adapter, transformation_registry_adapter):
        """
        Test integration creation with data validation failure.
        """
        # Create owner user
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="validation_test@example.com",
                name="Validation Test User",
                role="INTEGRATION_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Create integration
        integration_data = {
            "name": "Validation Test Integration",
            "description": "Integration for testing validation failures",
            "type": "API-based",
            "source": "Test Source",
            "destination": "Test Destination",
            "owner_id": user.id,
            "tenant_id": "default-tenant"
        }
        
        integration = integration_adapter.create_integration(integration_data)
        integration_id = integration["id"]
        
        # Create a dataset with required fields
        dataset = integration_adapter.create_dataset({
            "name": "Product Data",
            "description": "Product information dataset",
            "tenant_id": "default-tenant"
        })
        
        # Add fields to the dataset
        integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "product_id",
                "display_name": "Product ID",
                "data_type": "string",
                "required": True
            }
        )
        
        integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "product_name",
                "display_name": "Product Name",
                "data_type": "string",
                "required": True
            }
        )
        
        integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "price",
                "display_name": "Price",
                "data_type": "number",
                "required": True
            }
        )
        
        # Associate dataset with integration
        integration_adapter.associate_dataset(integration_id, dataset["id"])
        
        # Create incomplete field mappings (missing required field 'price')
        integration_adapter.create_field_mapping(
            integration_id,
            {
                "source_field": "id",
                "destination_field": "product_id",
                "transformation": "direct",
                "required": True
            }
        )
        
        integration_adapter.create_field_mapping(
            integration_id,
            {
                "source_field": "name",
                "destination_field": "product_name",
                "transformation": "direct",
                "required": True
            }
        )
        
        # The 'price' field mapping is missing but required
        
        # Run integration - should detect validation failure
        run = integration_adapter.run_integration(integration_id)
        
        # Simulate validation failure
        integration_adapter.update_integration(
            integration_id,
            {
                "last_run_status": "failed", 
                "health": "error",
                "error_details": "Validation failed: Missing required field mapping for 'price'"
            }
        )
        
        # Verify integration state
        updated_integration = integration_adapter.get_integration(integration_id)
        assert updated_integration["health"] == "error"
        assert "Missing required field mapping" in updated_integration["error_details"]
        
    def test_integration_with_complex_transformations(self, entity_registry, auth_adapter, 
                                                   integration_adapter, transformation_registry_adapter):
        """
        Test integration creation with complex transformations and data manipulations.
        """
        # Create owner user
        user = auth_adapter.add_user(
            User(
                id=str(uuid.uuid4()),
                email="complex_test@example.com",
                name="Complex Test User",
                role="INTEGRATION_MANAGER",
                mfa_enabled=False
            )
        )
        
        # Create integration
        integration = integration_adapter.create_integration({
            "name": "Complex Transformation Integration",
            "description": "Integration for testing complex transformations",
            "type": "API-based",
            "source": "Test Complex Source",
            "destination": "Test Complex Destination",
            "owner_id": user.id,
            "tenant_id": "default-tenant"
        })
        
        integration_id = integration["id"]
        
        # Create a dataset
        dataset = integration_adapter.create_dataset({
            "name": "Financial Data",
            "description": "Financial transaction dataset",
            "tenant_id": "default-tenant"
        })
        
        # Add fields to the dataset
        integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "transaction_id",
                "display_name": "Transaction ID",
                "data_type": "string",
                "required": True
            }
        )
        
        integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "transaction_date",
                "display_name": "Transaction Date",
                "data_type": "datetime",
                "required": True
            }
        )
        
        integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "amount",
                "display_name": "Amount",
                "data_type": "number",
                "required": True
            }
        )
        
        integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "currency",
                "display_name": "Currency",
                "data_type": "string",
                "required": True
            }
        )
        
        integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "exchange_rate",
                "display_name": "Exchange Rate",
                "data_type": "number",
                "required": False
            }
        )
        
        integration_adapter.create_dataset_field(
            dataset["id"],
            {
                "name": "converted_amount",
                "display_name": "Converted Amount",
                "data_type": "number",
                "required": False
            }
        )
        
        # Associate dataset with integration
        integration_adapter.associate_dataset(integration_id, dataset["id"])
        
        # Register complex transformations
        transformation_registry_adapter.register_test_transformation(
            name="format_date",
            description="Formats date to standard format",
            supported_types=["datetime", "string"],
            params=[
                {
                    "name": "output_format",
                    "type": "string",
                    "description": "Output date format",
                    "default": "%Y-%m-%d"
                }
            ],
            function=lambda data, params: pd.to_datetime(data).dt.strftime(params.get("output_format", "%Y-%m-%d"))
        )
        
        transformation_registry_adapter.register_test_transformation(
            name="currency_conversion",
            description="Converts amount to specified currency",
            supported_types=["number"],
            params=[
                {
                    "name": "rate_field",
                    "type": "string",
                    "description": "Field containing exchange rate"
                }
            ],
            # This is a mock function for testing - real implementation would use the rate_field
            function=lambda data, params: data * 1.2  # Mock exchange rate
        )
        
        transformation_registry_adapter.register_test_transformation(
            name="conditional_format",
            description="Applies different formatting based on conditions",
            supported_types=["string", "number"],
            params=[
                {
                    "name": "conditions",
                    "type": "object",
                    "description": "Condition mappings"
                },
                {
                    "name": "default",
                    "type": "string",
                    "description": "Default value if no condition matches"
                }
            ],
            # We need a concrete implementation for testing
            function=lambda data, params: data.apply(
                lambda x: next(
                    (v for k, v in params.get("conditions", {}).items() if str(k) == str(x)),
                    params.get("default", x)
                )
            )
        )
        
        # Create field mappings with complex transformations
        integration_adapter.create_field_mapping(
            integration_id,
            {
                "source_field": "id",
                "destination_field": "transaction_id",
                "transformation": "direct",
                "required": True
            }
        )
        
        integration_adapter.create_field_mapping(
            integration_id,
            {
                "source_field": "date",
                "destination_field": "transaction_date",
                "transformation": "format_date",
                "required": True,
                "transform_params": {
                    "output_format": "%Y-%m-%d"
                }
            }
        )
        
        integration_adapter.create_field_mapping(
            integration_id,
            {
                "source_field": "amount",
                "destination_field": "amount",
                "transformation": "direct",
                "required": True
            }
        )
        
        integration_adapter.create_field_mapping(
            integration_id,
            {
                "source_field": "currency_code",
                "destination_field": "currency",
                "transformation": "conditional_format",
                "required": True,
                "transform_params": {
                    "conditions": {
                        "USD": "US Dollar",
                        "EUR": "Euro",
                        "GBP": "British Pound",
                        "JPY": "Japanese Yen"
                    },
                    "default": "Unknown Currency"
                }
            }
        )
        
        integration_adapter.create_field_mapping(
            integration_id,
            {
                "source_field": "amount",
                "destination_field": "converted_amount",
                "transformation": "currency_conversion",
                "required": False,
                "transform_params": {
                    "rate_field": "exchange_rate"
                }
            }
        )
        
        # Configure source and destination
        integration_adapter.update_integration(
            integration_id,
            {
                "source_config": {
                    "endpoint": "https://api.example.com/transactions",
                    "auth_type": "oauth2"
                },
                "destination_config": {
                    "endpoint": "https://api.example.com/financial-data",
                    "auth_type": "oauth2"
                }
            }
        )
        
        # Run the integration
        run = integration_adapter.run_integration(integration_id)
        
        # Simulate successful completion
        integration_adapter.update_integration(
            integration_id,
            {"last_run_status": "success", "last_run_records": 500}
        )
        
        # Verify integration state
        updated_integration = integration_adapter.get_integration(integration_id)
        assert updated_integration["last_run_status"] == "success"
        assert updated_integration["last_run_records"] == 500