"""
Integration Services

This module provides services for working with integrations.
It's designed to be flexible and support dynamic creation of integrations
based on UI configuration.
"""

from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import random
import logging

from .models import (
    Integration,
    IntegrationCreate,
    IntegrationUpdate,
    IntegrationHealth,
    FieldMapping,
    FieldMappingCreate,
    FieldMappingUpdate
)

# Set up logging
logger = logging.getLogger(__name__)


class IntegrationService:
    """Service for managing integrations"""
    
    def __init__(self):
        """Initialize with mock data"""
        self.integrations = {
            1: Integration(
                id=1,
                name="Employee Demo",
                type="API-based",
                source="Workday (HR)",
                destination="Kronos (Time)",
                schedule="Daily @ 2am",
                health=IntegrationHealth.HEALTHY,
                created_at=datetime(2025, 3, 15, 8, 0, 0),
                updated_at=datetime(2025, 3, 20, 9, 30, 0)
            ),
            2: Integration(
                id=2,
                name="Time to Payroll",
                type="API-based",
                source="7Shifts (Time)",
                destination="Paylocity (Payroll)",
                schedule="Weekly on Fridays",
                health=IntegrationHealth.WARNING,
                created_at=datetime(2025, 3, 10, 14, 20, 0),
                updated_at=datetime(2025, 3, 18, 16, 45, 0)
            ),
            3: Integration(
                id=3,
                name="File-based Blob Demo",
                type="File-based",
                source="Azure Blob Container /employees",
                destination="Email: hr-dept@company.com",
                schedule="Once daily @ 6am",
                health=IntegrationHealth.HEALTHY,
                created_at=datetime(2025, 3, 5, 10, 15, 0),
                updated_at=datetime(2025, 3, 12, 11, 30, 0)
            )
        }
        
        self.field_mappings = {
            1: {
                1: FieldMapping(
                    id=1,
                    integration_id=1,
                    source_field="employee_id",
                    destination_field="emp_id",
                    transformation="direct",
                    required=True,
                    created_at=datetime(2025, 3, 15, 8, 0, 0),
                    updated_at=datetime(2025, 3, 15, 8, 0, 0)
                ),
                2: FieldMapping(
                    id=2,
                    integration_id=1,
                    source_field="first_name",
                    destination_field="fname",
                    transformation="direct",
                    required=True,
                    created_at=datetime(2025, 3, 15, 8, 0, 0),
                    updated_at=datetime(2025, 3, 15, 8, 0, 0)
                ),
                3: FieldMapping(
                    id=3,
                    integration_id=1,
                    source_field="last_name",
                    destination_field="lname",
                    transformation="direct",
                    required=True,
                    created_at=datetime(2025, 3, 15, 8, 0, 0),
                    updated_at=datetime(2025, 3, 15, 8, 0, 0)
                )
            },
            2: {
                4: FieldMapping(
                    id=4,
                    integration_id=2,
                    source_field="employee_id",
                    destination_field="employee_number",
                    transformation="direct",
                    required=True,
                    created_at=datetime(2025, 3, 10, 14, 20, 0),
                    updated_at=datetime(2025, 3, 10, 14, 20, 0)
                ),
                5: FieldMapping(
                    id=5,
                    integration_id=2,
                    source_field="hours_worked",
                    destination_field="hours",
                    transformation="direct",
                    required=True,
                    created_at=datetime(2025, 3, 10, 14, 20, 0),
                    updated_at=datetime(2025, 3, 10, 14, 20, 0)
                )
            },
            3: {
                6: FieldMapping(
                    id=6,
                    integration_id=3,
                    source_field="EmployeeID",
                    destination_field="employee_id",
                    transformation="direct",
                    required=True,
                    created_at=datetime(2025, 3, 5, 10, 15, 0),
                    updated_at=datetime(2025, 3, 5, 10, 15, 0)
                ),
                7: FieldMapping(
                    id=7,
                    integration_id=3,
                    source_field="FirstName",
                    destination_field="first_name",
                    transformation="direct",
                    required=True,
                    created_at=datetime(2025, 3, 5, 10, 15, 0),
                    updated_at=datetime(2025, 3, 5, 10, 15, 0)
                ),
                8: FieldMapping(
                    id=8,
                    integration_id=3,
                    source_field="LastName",
                    destination_field="last_name",
                    transformation="direct",
                    required=True,
                    created_at=datetime(2025, 3, 5, 10, 15, 0),
                    updated_at=datetime(2025, 3, 5, 10, 15, 0)
                )
            }
        }
        
        self.history = {
            1: [
                {
                    "id": 1,
                    "integration_id": 1,
                    "status": "success",
                    "start_time": "2025-03-20T02:00:00Z",
                    "end_time": "2025-03-20T02:05:32Z",
                    "records_processed": 150
                },
                {
                    "id": 2,
                    "integration_id": 1,
                    "status": "success",
                    "start_time": "2025-03-19T02:00:00Z",
                    "end_time": "2025-03-19T02:04:18Z",
                    "records_processed": 145
                }
            ],
            2: [
                {
                    "id": 3,
                    "integration_id": 2,
                    "status": "warning",
                    "start_time": "2025-03-18T02:00:00Z",
                    "end_time": "2025-03-18T02:01:05Z",
                    "records_processed": 120,
                    "warnings": ["5 records had missing fields"]
                }
            ],
            3: [
                {
                    "id": 4,
                    "integration_id": 3,
                    "status": "success",
                    "start_time": "2025-03-20T06:00:00Z",
                    "end_time": "2025-03-20T06:02:12Z",
                    "records_processed": 75
                }
            ]
        }
        
        self.next_integration_id = 4
        self.next_mapping_id = 9
        self.next_history_id = 5
        
        # Available integration types for dynamic creation
        self.available_sources = {
            "API-based": [
                "Workday (HR)",
                "Kronos (Time)",
                "Paylocity (Payroll)",
                "7Shifts (Time)",
                "BambooHR (HR)",
                "ADP (Payroll)",
                "Custom API"
            ],
            "File-based": [
                "Azure Blob Container",
                "AWS S3 Bucket",
                "Google Cloud Storage",
                "Local File System",
                "SFTP Server"
            ],
            "Database": [
                "MySQL",
                "PostgreSQL",
                "SQL Server",
                "MongoDB",
                "Oracle"
            ]
        }
        
        # Try to import the AdapterFactory to get available adapters
        try:
            from adapters.adapter_factory import AdapterFactory
            self.adapter_factory_available = True
        except ImportError:
            self.adapter_factory_available = False
    
    def get_available_sources(self, integration_type: str) -> List[str]:
        """Get available sources for a specific integration type"""
        # First check if we have hard-coded sources for this type
        sources = self.available_sources.get(integration_type, [])
        
        # If we have the adapter factory, try to get dynamic sources
        if hasattr(self, 'adapter_factory_available') and self.adapter_factory_available:
            try:
                from adapters.adapter_factory import AdapterFactory
                
                # If the type is API-based, add available adapters
                if integration_type == "API-based":
                    adapter_sources = list(AdapterFactory.get_available_adapters().keys())
                    sources = list(set(sources + adapter_sources))
            except Exception as e:
                logger.error(f"Error getting adapters from AdapterFactory: {e}")
        
        return sources
    
    def get_available_destinations(self, integration_type: str) -> List[str]:
        """Get available destinations for a specific integration type"""
        # We'll use the same implementation as get_available_sources for now
        # In a real app, you might have different sources and destinations
        return self.get_available_sources(integration_type)
    
    def get_integrations(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        type_filter: Optional[str] = None,
        health_filter: Optional[str] = None
    ) -> List[Integration]:
        """Get all integrations with optional filtering"""
        integrations = list(self.integrations.values())
        
        # Apply filters
        if type_filter:
            integrations = [i for i in integrations if i.type == type_filter]
        if health_filter:
            integrations = [i for i in integrations if i.health == health_filter]
        
        # Apply pagination
        return integrations[skip:skip+limit]
    
    def get_integration(self, integration_id: int) -> Optional[Integration]:
        """Get a specific integration by ID"""
        return self.integrations.get(integration_id)
    
    def create_integration(self, integration: IntegrationCreate) -> Integration:
        """Create a new integration"""
        integration_id = self.next_integration_id
        self.next_integration_id += 1
        
        now = datetime.now()
        new_integration = Integration(
            id=integration_id,
            name=integration.name,
            type=integration.type,
            source=integration.source,
            destination=integration.destination,
            schedule=integration.schedule,
            description=integration.description,
            health=IntegrationHealth.HEALTHY,
            created_at=now,
            updated_at=now
        )
        
        self.integrations[integration_id] = new_integration
        self.field_mappings[integration_id] = {}
        self.history[integration_id] = []
        
        logger.info(f"Created integration: {integration.name} ({integration_id})")
        return new_integration
    
    def update_integration(self, integration_id: int, update: IntegrationUpdate) -> Optional[Integration]:
        """Update an existing integration"""
        if integration_id not in self.integrations:
            return None
        
        integration = self.integrations[integration_id]
        
        # Update fields if provided
        update_dict = update.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(integration, field, value)
        
        # Update the updated_at timestamp
        integration.updated_at = datetime.now()
        
        logger.info(f"Updated integration: {integration.name} ({integration_id})")
        return integration
    
    def delete_integration(self, integration_id: int) -> bool:
        """Delete an integration"""
        if integration_id not in self.integrations:
            return False
        
        integration_name = self.integrations[integration_id].name
        del self.integrations[integration_id]
        
        # Also delete related resources
        if integration_id in self.field_mappings:
            del self.field_mappings[integration_id]
        if integration_id in self.history:
            del self.history[integration_id]
        
        logger.info(f"Deleted integration: {integration_name} ({integration_id})")
        return True
    
    def run_integration(self, integration_id: int) -> Optional[Dict[str, Any]]:
        """Run an integration"""
        if integration_id not in self.integrations:
            return None
        
        integration = self.integrations[integration_id]
        
        # Simulate running the integration
        history_id = self.next_history_id
        self.next_history_id += 1
        
        now = datetime.now()
        
        logger.info(f"Running integration: {integration.name} ({integration_id})")
        
        # Return a status that the integration is running
        return {
            "id": history_id,
            "integration_id": integration_id,
            "status": "running",
            "start_time": now.isoformat()
        }
    
    def get_integration_history(self, integration_id: int, limit: int = 10) -> Optional[List[Dict[str, Any]]]:
        """Get execution history for an integration"""
        if integration_id not in self.integrations:
            return None
        
        # Return the history for this integration, respecting the limit
        return self.history.get(integration_id, [])[:limit]
    
    def get_field_mappings(self, integration_id: int) -> Optional[List[FieldMapping]]:
        """Get field mappings for an integration"""
        if integration_id not in self.integrations:
            return None
        
        # Return all field mappings for this integration
        return list(self.field_mappings.get(integration_id, {}).values())
    
    def create_field_mapping(self, integration_id: int, mapping: FieldMappingCreate) -> Optional[FieldMapping]:
        """Create a new field mapping for an integration"""
        if integration_id not in self.integrations:
            return None
        
        mapping_id = self.next_mapping_id
        self.next_mapping_id += 1
        
        now = datetime.now()
        new_mapping = FieldMapping(
            id=mapping_id,
            integration_id=integration_id,
            source_field=mapping.source_field,
            destination_field=mapping.destination_field,
            transformation=mapping.transformation,
            required=mapping.required,
            description=mapping.description,
            created_at=now,
            updated_at=now
        )
        
        # Ensure the integration has a mappings dict
        if integration_id not in self.field_mappings:
            self.field_mappings[integration_id] = {}
        
        self.field_mappings[integration_id][mapping_id] = new_mapping
        
        logger.info(f"Created field mapping for integration {integration_id}: {mapping.source_field} -> {mapping.destination_field}")
        return new_mapping
    
    def update_field_mapping(
        self, 
        integration_id: int, 
        mapping_id: int, 
        update: FieldMappingUpdate
    ) -> Optional[FieldMapping]:
        """Update a field mapping"""
        if (integration_id not in self.field_mappings or 
            mapping_id not in self.field_mappings[integration_id]):
            return None
        
        mapping = self.field_mappings[integration_id][mapping_id]
        
        # Update fields if provided
        update_dict = update.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(mapping, field, value)
        
        # Update the updated_at timestamp
        mapping.updated_at = datetime.now()
        
        logger.info(f"Updated field mapping {mapping_id} for integration {integration_id}")
        return mapping
    
    def delete_field_mapping(self, integration_id: int, mapping_id: int) -> bool:
        """Delete a field mapping"""
        if (integration_id not in self.field_mappings or 
            mapping_id not in self.field_mappings[integration_id]):
            return False
        
        del self.field_mappings[integration_id][mapping_id]
        logger.info(f"Deleted field mapping {mapping_id} for integration {integration_id}")
        return True
        
    def discover_fields(self, integration_id: int, source_or_dest: str = "source") -> List[Dict[str, str]]:
        """
        Discover available fields from a source or destination
        
        This tries to use the adapter factory first if available, otherwise falls back
        to mock data.
        """
        if integration_id not in self.integrations:
            return []
            
        integration = self.integrations[integration_id]
        
        # Try to use adapter factory if available
        if hasattr(self, 'adapter_factory_available') and self.adapter_factory_available:
            try:
                from adapters.adapter_factory import AdapterFactory
                
                # Determine which adapter to use based on source or destination
                adapter_type = None
                if source_or_dest == "source":
                    adapter_type = integration.source
                else:
                    adapter_type = integration.destination
                    
                # For "generic_api" or other registered adapter types
                if adapter_type in AdapterFactory._adapter_registry:
                    # Set up a config for the adapter - in a real app, this would come from the integration config
                    config = {
                        "base_url": "https://api.example.com/v1",
                        "api_key": "mock-api-key-for-demo"
                    }
                    
                    # Create adapter instance
                    adapter = AdapterFactory.create_adapter(adapter_type, config)
                    
                    if adapter:
                        # Use the adapter's discover_fields method to get fields
                        logger.info(f"Created adapter for {adapter_type}, discovering fields")
                        return adapter.discover_fields()
            except Exception as e:
                logger.error(f"Error using adapter for field discovery: {e}")
        
        # Mock field discovery based on the source or destination type
        if source_or_dest == "source":
            source = integration.source
            if "HR" in source:
                return [
                    {"name": "employee_id", "type": "string", "description": "Employee ID"},
                    {"name": "first_name", "type": "string", "description": "First name"},
                    {"name": "last_name", "type": "string", "description": "Last name"},
                    {"name": "email", "type": "string", "description": "Email address"},
                    {"name": "hire_date", "type": "date", "description": "Hire date"},
                    {"name": "department", "type": "string", "description": "Department"},
                    {"name": "job_title", "type": "string", "description": "Job title"},
                    {"name": "manager_id", "type": "string", "description": "Manager ID"}
                ]
            elif "Time" in source:
                return [
                    {"name": "employee_id", "type": "string", "description": "Employee ID"},
                    {"name": "date", "type": "date", "description": "Date"},
                    {"name": "clock_in", "type": "datetime", "description": "Clock in time"},
                    {"name": "clock_out", "type": "datetime", "description": "Clock out time"},
                    {"name": "hours_worked", "type": "number", "description": "Hours worked"},
                    {"name": "break_time", "type": "number", "description": "Break time"},
                    {"name": "overtime", "type": "number", "description": "Overtime hours"}
                ]
            elif "Blob" in source or "S3" in source:
                return [
                    {"name": "EmployeeID", "type": "string", "description": "Employee ID"},
                    {"name": "FirstName", "type": "string", "description": "First name"},
                    {"name": "LastName", "type": "string", "description": "Last name"},
                    {"name": "Email", "type": "string", "description": "Email address"},
                    {"name": "Department", "type": "string", "description": "Department"},
                    {"name": "HireDate", "type": "date", "description": "Hire date"}
                ]
            elif "generic_api" in source.lower():
                # For generic API adapter
                return [
                    {"name": "id", "type": "string", "description": "Unique identifier"},
                    {"name": "name", "type": "string", "description": "Name field"},
                    {"name": "email", "type": "string", "description": "Email address"},
                    {"name": "status", "type": "string", "description": "Status field"},
                    {"name": "created_at", "type": "datetime", "description": "Created timestamp"},
                    {"name": "metadata", "type": "object", "description": "Metadata object"}
                ]
            else:
                return [
                    {"name": "id", "type": "string", "description": "ID field"},
                    {"name": "name", "type": "string", "description": "Name field"},
                    {"name": "description", "type": "string", "description": "Description field"},
                    {"name": "created_at", "type": "datetime", "description": "Created timestamp"},
                    {"name": "updated_at", "type": "datetime", "description": "Updated timestamp"}
                ]
        else:  # destination
            dest = integration.destination
            if "Time" in dest:
                return [
                    {"name": "emp_id", "type": "string", "description": "Employee ID"},
                    {"name": "fname", "type": "string", "description": "First name"},
                    {"name": "lname", "type": "string", "description": "Last name"},
                    {"name": "work_date", "type": "date", "description": "Work date"},
                    {"name": "time_in", "type": "datetime", "description": "Time in"},
                    {"name": "time_out", "type": "datetime", "description": "Time out"},
                    {"name": "hours", "type": "number", "description": "Hours worked"}
                ]
            elif "Payroll" in dest:
                return [
                    {"name": "employee_number", "type": "string", "description": "Employee number"},
                    {"name": "first_name", "type": "string", "description": "First name"},
                    {"name": "last_name", "type": "string", "description": "Last name"},
                    {"name": "pay_period_start", "type": "date", "description": "Pay period start date"},
                    {"name": "pay_period_end", "type": "date", "description": "Pay period end date"},
                    {"name": "regular_hours", "type": "number", "description": "Regular hours"},
                    {"name": "overtime_hours", "type": "number", "description": "Overtime hours"},
                    {"name": "pay_rate", "type": "number", "description": "Pay rate"}
                ]
            elif "Email" in dest:
                return [
                    {"name": "to", "type": "string", "description": "To email address"},
                    {"name": "cc", "type": "string", "description": "CC email address"},
                    {"name": "subject", "type": "string", "description": "Email subject"},
                    {"name": "body", "type": "string", "description": "Email body"},
                    {"name": "attachments", "type": "array", "description": "Email attachments"}
                ]
            elif "generic_api" in dest.lower():
                # For generic API adapter
                return [
                    {"name": "id", "type": "string", "description": "Unique identifier"},
                    {"name": "title", "type": "string", "description": "Title field"},
                    {"name": "body", "type": "string", "description": "Body content"},
                    {"name": "category", "type": "string", "description": "Category field"},
                    {"name": "tags", "type": "array", "description": "Tags array"},
                    {"name": "published", "type": "boolean", "description": "Published status"}
                ]
            else:
                return [
                    {"name": "id", "type": "string", "description": "ID field"},
                    {"name": "name", "type": "string", "description": "Name field"},
                    {"name": "value", "type": "string", "description": "Value field"},
                    {"name": "created_at", "type": "datetime", "description": "Created timestamp"}
                ]