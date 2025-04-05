"""
Integration Controllers

This module defines the API routes for integrations in the TAP platform.
"""

from typing import List, Optional, Dict, Any, Union
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Security, Body
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel

from core.auth import get_current_active_user, oauth2_scheme
from db.base import get_db_session as get_db
from db.models import User as DbUser

from .models import (
    Integration, 
    IntegrationCreate, 
    IntegrationUpdate,
    FieldMapping,
    FieldMappingCreate,
    FieldMappingUpdate,
    AzureBlobConfig,
    ScheduleConfig,
    UserResponseModel,
    EarningsCode,
    EarningsCodeCreate,
    EarningsCodeUpdate,
    EarningsMapping,
    EarningsMappingCreate,
    EarningsMappingUpdate,
    Dataset,
    DatasetCreate,
    DatasetUpdate,
    DatasetField
)
from .service import IntegrationService
from utils.transformation_registry import TransformationRegistry

# Create router for integration endpoints
router = APIRouter(prefix="/api/integrations")

# Dependency to get integration service
def get_integration_service(db: Session = Depends(get_db)):
    """Get integration service instance with DB session"""
    return IntegrationService(db)



def standardize_response(data, skip=0, limit=10, total=None):
    """Helper function to create standardized responses"""
    # For collections with pagination
    if isinstance(data, list) and total is not None:
        return create_paginated_response(items=data, total=total, skip=skip, limit=limit)
    # For single items or collections without pagination
    return create_response(data=data)



@router.get(
    "/", 
    response_model=List[Integration],
    summary="Get all integrations",
    description="Retrieve a list of all integrations with pagination and optional filtering",
    tags=["integrations"],
    responses={
        200: {
            "description": "List of integrations successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "name": "Daily Employee Data Import",
                            "description": "Imports employee data from HRIS to payroll system daily",
                            "type": "scheduled",
                            "source": "HRIS API",
                            "destination": "Payroll System",
                            "status": "active",
                            "health": "healthy",
                            "tenant_id": "tenant-1",
                            "created_at": "2025-02-10T14:30:00Z",
                            "updated_at": "2025-03-20T09:45:00Z",
                            "last_run_at": "2025-03-27T01:00:00Z",
                            "last_run_status": "success",
                            "schedule": {
                                "type": "daily",
                                "time": "01:00:00",
                                "timezone": "UTC"
                            },
                            "run_count": 46,
                            "success_count": 45,
                            "error_count": 1
                        },
                        {
                            "id": 2,
                            "name": "Monthly Financial Report Export",
                            "description": "Exports financial data to cloud storage on the last day of each month",
                            "type": "scheduled",
                            "source": "Financial Database",
                            "destination": "Azure Blob Storage",
                            "status": "active",
                            "health": "healthy",
                            "tenant_id": "tenant-1",
                            "created_at": "2025-01-15T11:20:00Z",
                            "updated_at": "2025-03-15T16:30:00Z",
                            "last_run_at": "2025-02-29T23:00:00Z",
                            "last_run_status": "success",
                            "schedule": {
                                "type": "monthly",
                                "day": "last",
                                "time": "23:00:00",
                                "timezone": "UTC"
                            },
                            "run_count": 2,
                            "success_count": 2,
                            "error_count": 0,
                            "azure_blob_config": {
                                "containerName": "financial-reports"
                            }
                        }
                    ]
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def get_integrations(
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    type: Optional[str] = Query(None, description="Filter by integration type (scheduled, event-triggered, etc.)"),
    health: Optional[str] = Query(None, description="Filter by health status (healthy, warning, error)")
):
    """
    Retrieve a list of all integrations with pagination and optional filtering.
    
    This endpoint allows users to:
    * List all integrations they have access to
    * Filter integrations by type or health status
    * Paginate through the results
    
    Integrations in the TAP platform represent automated data flows between
    systems. They define the source and destination of data, transformation rules,
    schedules, and other configuration needed to automate data movement.
    
    For regular users, this endpoint returns only integrations belonging to their
    tenant. Administrators can see integrations across all tenants.
    
    The response includes comprehensive information about each integration:
    * Basic details (name, description, type)
    * Source and destination systems
    * Status and health information
    * Execution history statistics
    * Schedule configuration
    * Additional configurations like Azure Blob Storage settings
    
    This data enables users to monitor their integration landscape, identify
    issues, and make informed decisions about data flow management.
    """
    # Filter by tenant ID for non-admin users
    tenant_id = None if current_user.role.value == "admin" else current_user.tenant_id
    return integration_service.get_integrations(skip, limit, type, health, tenant_id)


@router.post(
    "/", 
    response_model=Integration, 
    status_code=201,
    summary="Create a new integration",
    description="Create a new data integration flow between systems",
    tags=["integrations"],
    responses={
        201: {
            "description": "Integration successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": 3,
                        "name": "Weekly Customer Data Sync",
                        "description": "Synchronizes customer data between CRM and marketing platform every Sunday",
                        "type": "scheduled",
                        "source": "CRM System",
                        "destination": "Marketing Platform",
                        "status": "active",
                        "health": "healthy",
                        "tenant_id": "tenant-1",
                        "created_at": "2025-03-28T10:15:00Z",
                        "updated_at": "2025-03-28T10:15:00Z",
                        "last_run_at": None,
                        "last_run_status": None,
                        "schedule": {
                            "type": "weekly",
                            "day_of_week": "Sunday",
                            "time": "02:00:00",
                            "timezone": "UTC"
                        },
                        "run_count": 0,
                        "success_count": 0,
                        "error_count": 0
                    }
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration with this name already exists"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def create_integration(
    integration: IntegrationCreate = Body(
        ..., 
        description="Integration details to create",
        example={
            "name": "Weekly Customer Data Sync",
            "description": "Synchronizes customer data between CRM and marketing platform every Sunday",
            "type": "scheduled",
            "source": "CRM System",
            "destination": "Marketing Platform",
            "status": "active",
            "schedule": {
                "type": "weekly",
                "day_of_week": "Sunday",
                "time": "02:00:00",
                "timezone": "UTC"
            }
        }
    ),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Create a new data integration flow between systems.
    
    This endpoint allows users to create a new integration defining an automated
    data flow between a source and destination system. Integrations are the core
    building blocks of the TAP platform, enabling automated data movement and
    transformation.
    
    When creating an integration, users specify:
    * Basic details (name, description, type)
    * Source system (where data comes from)
    * Destination system (where data will be sent)
    * Integration type (scheduled, event-triggered, etc.)
    * Initial status (typically 'active' or 'draft')
    * Scheduling information (if applicable)
    
    The integration is automatically associated with the user's tenant, ensuring
    proper data isolation in multi-tenant environments.
    
    Once created, the integration can be further configured with:
    * Field mappings to transform data
    * Azure Blob Storage settings for file-based integrations
    * Schedule configuration for automated execution
    * Earnings code mappings for payroll integrations
    * Dataset associations for structured data
    
    The response includes the created integration with system-generated fields
    like ID, creation timestamp, and tenant association.
    """
    # Use tenant ID from current user
    return integration_service.create_integration(integration, current_user.tenant_id)


@router.get(
    "/{integration_id}", 
    response_model=Integration,
    summary="Get integration details",
    description="Retrieve detailed information about a specific integration by its ID",
    tags=["integrations"],
    responses={
        200: {
            "description": "Integration details successfully retrieved",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Daily Employee Data Import",
                        "description": "Imports employee data from HRIS to payroll system daily",
                        "type": "scheduled",
                        "source": "HRIS API",
                        "destination": "Payroll System",
                        "status": "active",
                        "health": "healthy",
                        "tenant_id": "tenant-1",
                        "created_at": "2025-02-10T14:30:00Z",
                        "updated_at": "2025-03-20T09:45:00Z",
                        "last_run_at": "2025-03-27T01:00:00Z",
                        "last_run_status": "success",
                        "schedule": {
                            "type": "daily",
                            "time": "01:00:00",
                            "timezone": "UTC"
                        },
                        "run_count": 46,
                        "success_count": 45,
                        "error_count": 1,
                        "field_mappings": [
                            {
                                "id": 1,
                                "source_field": "employee_id",
                                "destination_field": "emp_id",
                                "transformation": "direct",
                                "transformation_params": {}
                            },
                            {
                                "id": 2,
                                "source_field": "full_name",
                                "destination_field": "employee_name",
                                "transformation": "direct",
                                "transformation_params": {}
                            }
                        ],
                        "datasets": [
                            {
                                "id": 5,
                                "name": "Employee Records"
                            }
                        ]
                    }
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to access this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def get_integration(
    integration_id: int = Path(..., gt=0, description="The unique ID of the integration to retrieve"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Retrieve detailed information about a specific integration by its ID.
    
    This endpoint provides comprehensive details about a single integration,
    including its configuration, status, history, and related entities. It is
    useful for viewing the complete state of an integration, troubleshooting
    issues, or making informed decisions about modifications.
    
    The response includes:
    * Basic details (name, description, type)
    * Source and destination systems
    * Status and health information
    * Execution history statistics
    * Creation and update timestamps
    * Schedule configuration
    * Associated field mappings
    * Associated datasets
    * Special configurations (if applicable)
    
    Access control ensures that users can only retrieve integrations that belong
    to their tenant, while administrators can access any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to access the integration, a 403 Forbidden
    response is returned.
    """
    integration = integration_service.get_integration(integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and integration.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this integration")
        
    return integration


@router.put(
    "/{integration_id}", 
    response_model=Integration,
    summary="Update an integration",
    description="Update an existing integration with new configuration details",
    tags=["integrations"],
    responses={
        200: {
            "description": "Integration successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Daily Employee Data Import",
                        "description": "Imports employee data from HRIS to payroll system daily with enhanced validation",
                        "type": "scheduled",
                        "source": "HRIS API",
                        "destination": "Payroll System",
                        "status": "active",
                        "health": "healthy",
                        "tenant_id": "tenant-1",
                        "created_at": "2025-02-10T14:30:00Z",
                        "updated_at": "2025-03-28T11:20:00Z",
                        "last_run_at": "2025-03-27T01:00:00Z",
                        "last_run_status": "success",
                        "schedule": {
                            "type": "daily",
                            "time": "02:30:00",  # Updated time
                            "timezone": "UTC"
                        },
                        "run_count": 46,
                        "success_count": 45,
                        "error_count": 1
                    }
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to update this integration"}
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid schedule configuration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def update_integration(
    integration: IntegrationUpdate = Body(
        ..., 
        description="Integration data to update",
        example={
            "description": "Imports employee data from HRIS to payroll system daily with enhanced validation",
            "status": "active",
            "schedule": {
                "type": "daily",
                "time": "02:30:00",
                "timezone": "UTC"
            }
        }
    ),
    integration_id: int = Path(..., gt=0, description="The ID of the integration to update"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Update an existing integration with new configuration details.
    
    This endpoint allows users to modify the configuration of an existing
    integration. The update can be partial - only the provided fields will
    be updated, while others remain unchanged.
    
    Common update scenarios include:
    * Changing the integration description
    * Updating the schedule configuration
    * Modifying the status (active, inactive, draft)
    * Adjusting source or destination settings
    * Configuring special settings like Azure Blob Storage configuration
    
    Updates to field mappings, datasets, and other related entities should use
    their dedicated endpoints rather than this general-purpose update endpoint.
    
    Access control ensures that users can only update integrations that belong
    to their tenant, while administrators can update any integration.
    
    The response includes the complete updated integration with all current
    field values, including those that weren't modified in this request.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to update the integration, a 403 Forbidden
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to update this integration")
    
    updated = integration_service.update_integration(integration_id, integration)
    return updated


@router.delete(
    "/{integration_id}", 
    status_code=204,
    summary="Delete an integration",
    description="Permanently delete an integration and all related configurations",
    tags=["integrations"],
    responses={
        204: {
            "description": "Integration successfully deleted"
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to delete this integration"}
                }
            }
        },
        409: {
            "description": "Conflict - Integration cannot be deleted",
            "content": {
                "application/json": {
                    "example": {"detail": "Cannot delete integration with active dependencies"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def delete_integration(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to delete"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Permanently delete an integration and all related configurations.
    
    This endpoint allows users to completely remove an integration from the system.
    Deleting an integration also removes all associated data including:
    * Field mappings
    * Schedule configuration
    * Azure Blob Storage configuration
    * Earnings mappings
    * Dataset associations
    * Run history (may be preserved in audit logs)
    
    This operation should be used with caution as it permanently removes data
    and cannot be undone. Consider deactivating integrations instead of deleting
    them if you may need the configuration in the future.
    
    Access control ensures that users can only delete integrations that belong
    to their tenant, while administrators can delete any integration.
    
    A successful deletion returns a 204 No Content response.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to delete the integration, a 403 Forbidden
    response is returned.
    If the integration cannot be deleted due to dependencies, a 409 Conflict
    response may be returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to delete this integration")
    
    success = integration_service.delete_integration(integration_id)
    if not success:
        raise HTTPException(status_code=404, detail="Integration not found")


@router.post(
    "/{integration_id}/run", 
    status_code=202,
    summary="Run an integration",
    description="Manually trigger an integration to execute immediately",
    tags=["integrations"],
    responses={
        202: {
            "description": "Integration execution started successfully (asynchronous operation)",
            "content": {
                "application/json": {
                    "example": {
                        "status": "accepted",
                        "message": "Integration execution started",
                        "integration_id": 1,
                        "run_id": "run-12345",
                        "started_at": "2025-03-28T12:15:30Z",
                        "estimated_completion_time": "2025-03-28T12:20:00Z",
                        "status_url": "/api/integrations/1/runs/run-12345"
                    }
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to run this integration"}
                }
            }
        },
        409: {
            "description": "Conflict - Integration is already running",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration is currently running"}
                }
            }
        },
        400: {
            "description": "Bad request - Integration cannot be run",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration is not in a runnable state"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def run_integration(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to execute"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Manually trigger an integration to execute immediately.
    
    This endpoint allows users to manually start an integration execution,
    regardless of its schedule configuration. This is useful for:
    * Testing newly configured integrations
    * Running one-time data transfers
    * Triggering an immediate execution of a scheduled integration
    * Re-running a previously failed integration
    
    Integration execution happens asynchronously in the background. The response
    is immediate with a 202 Accepted status code and includes tracking information.
    Users can monitor the execution status using the provided status URL or
    through the integration history endpoints.
    
    When an integration is executed, it will:
    * Read data from the source system
    * Apply any configured transformations
    * Write data to the destination system
    * Record execution details in the integration history
    * Update the integration's last run statistics
    
    Access control ensures that users can only run integrations that belong
    to their tenant, while administrators can run any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to run the integration, a 403 Forbidden
    response is returned.
    If the integration is already running, a 409 Conflict response may be returned.
    If the integration cannot be run due to its state, a 400 Bad Request response
    may be returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to run this integration")
    
    # Start the integration execution
    result = integration_service.run_integration(integration_id)
    
    # Add more detailed tracking information if not already provided by the service
    if not result.get("run_id"):
        from datetime import datetime, timedelta
        
        # Generate a run ID if not provided
        run_id = f"run-{integration_id}-{int(datetime.now(timezone.utc).timestamp())}"
        started_at = datetime.now(timezone.utc).isoformat() + "Z"
        
        # Estimate 5 minutes for completion (should be based on history or complexity)
        estimated_completion = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat() + "Z"
        
        # Enhance the response with tracking information
        result.update({
            "integration_id": integration_id,
            "run_id": run_id,
            "started_at": started_at,
            "estimated_completion_time": estimated_completion,
            "status_url": f"/api/integrations/{integration_id}/runs/{run_id}"
        })
    
    return result


@router.get(
    "/{integration_id}/history", 
    response_model=List[dict],
    summary="Get integration history",
    description="Retrieve execution history for an integration with configurable result limit",
    tags=["integrations"],
    responses={
        200: {
            "description": "Integration history successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": "run-12345",
                            "integration_id": 1,
                            "status": "success",
                            "start_time": "2025-03-27T01:00:00Z",
                            "end_time": "2025-03-27T01:03:22Z",
                            "duration_seconds": 202,
                            "records_processed": 1250,
                            "records_succeeded": 1250,
                            "records_failed": 0,
                            "triggered_by": "schedule",
                            "trigger_details": {
                                "schedule_type": "daily",
                                "scheduled_time": "01:00:00"
                            }
                        },
                        {
                            "id": "run-12344",
                            "integration_id": 1,
                            "status": "success",
                            "start_time": "2025-03-26T01:00:00Z",
                            "end_time": "2025-03-26T01:03:18Z",
                            "duration_seconds": 198,
                            "records_processed": 1180,
                            "records_succeeded": 1180,
                            "records_failed": 0,
                            "triggered_by": "schedule",
                            "trigger_details": {
                                "schedule_type": "daily",
                                "scheduled_time": "01:00:00"
                            }
                        },
                        {
                            "id": "run-12343",
                            "integration_id": 1,
                            "status": "error",
                            "start_time": "2025-03-25T01:00:00Z",
                            "end_time": "2025-03-25T01:00:45Z",
                            "duration_seconds": 45,
                            "error": "Connection refused by source system",
                            "triggered_by": "schedule",
                            "trigger_details": {
                                "schedule_type": "daily",
                                "scheduled_time": "01:00:00"
                            }
                        }
                    ]
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration's history",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to access this integration's history"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def get_integration_history(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to get history for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of history records to return")
):
    """
    Retrieve execution history for an integration with configurable result limit.
    
    This endpoint provides a historical record of integration executions, showing
    when the integration ran, whether it succeeded or failed, and basic statistics
    about the execution. It's useful for monitoring integration health, auditing
    data transfers, and troubleshooting issues.
    
    The history is returned in reverse chronological order (newest first) and
    includes the following information for each run:
    * Run ID and status (success, error, warning)
    * Start time, end time, and duration
    * Record counts (processed, succeeded, failed)
    * Trigger information (schedule, manual, event)
    * Error details (for failed runs)
    
    This endpoint is identical in purpose to the "runs" endpoint but does not
    support pagination with skip/limit parameters. For paginated results,
    use the /integrations/{integration_id}/runs endpoint instead.
    
    Access control ensures that users can only view history for integrations
    that belong to their tenant, while administrators can view history for
    any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to access the integration, a 403 Forbidden
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this integration's history")
    
    history = integration_service.get_integration_history(integration_id, limit)
    return history


@router.get(
    "/{integration_id}/runs", 
    response_model=List[dict],
    summary="Get integration run logs",
    description="Retrieve detailed run logs for an integration with pagination",
    tags=["integrations"],
    responses={
        200: {
            "description": "Integration run logs successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": "run-12345",
                            "integration_id": 1,
                            "status": "success",
                            "start_time": "2025-03-27T01:00:00Z",
                            "end_time": "2025-03-27T01:03:22Z",
                            "duration_seconds": 202,
                            "records_processed": 1250,
                            "records_succeeded": 1250,
                            "records_failed": 0,
                            "triggered_by": "schedule",
                            "trigger_details": {
                                "schedule_type": "daily",
                                "scheduled_time": "01:00:00"
                            },
                            "logs": [
                                {"timestamp": "2025-03-27T01:00:00Z", "level": "info", "message": "Starting integration execution"},
                                {"timestamp": "2025-03-27T01:00:01Z", "level": "info", "message": "Connected to source system"},
                                {"timestamp": "2025-03-27T01:00:10Z", "level": "info", "message": "Retrieved 1250 records from source"},
                                {"timestamp": "2025-03-27T01:02:30Z", "level": "info", "message": "Applied transformations to 1250 records"},
                                {"timestamp": "2025-03-27T01:03:20Z", "level": "info", "message": "Successfully wrote 1250 records to destination"},
                                {"timestamp": "2025-03-27T01:03:22Z", "level": "info", "message": "Integration execution completed successfully"}
                            ]
                        },
                        {
                            "id": "run-12344",
                            "integration_id": 1,
                            "status": "success",
                            "start_time": "2025-03-26T01:00:00Z",
                            "end_time": "2025-03-26T01:03:18Z",
                            "duration_seconds": 198,
                            "records_processed": 1180,
                            "records_succeeded": 1180,
                            "records_failed": 0,
                            "triggered_by": "schedule",
                            "trigger_details": {
                                "schedule_type": "daily",
                                "scheduled_time": "01:00:00"
                            },
                            "logs": [
                                {"timestamp": "2025-03-26T01:00:00Z", "level": "info", "message": "Starting integration execution"},
                                {"timestamp": "2025-03-26T01:03:18Z", "level": "info", "message": "Integration execution completed successfully"}
                            ]
                        }
                    ]
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration's run logs",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to access this integration's run logs"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def get_integration_runs(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to get run logs for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of run logs to return")
):
    """
    Retrieve detailed run logs for an integration with pagination.
    
    This endpoint provides a detailed view of integration execution runs, similar
    to the history endpoint but with full pagination support and potentially more
    detailed log information for each run. It's useful for monitoring integration
    performance, troubleshooting issues, and auditing data transfers.
    
    The runs are returned in reverse chronological order (newest first) and include:
    * Run ID and status (success, error, warning)
    * Start time, end time, and duration
    * Record counts (processed, succeeded, failed)
    * Trigger information (schedule, manual, event)
    * Error details (for failed runs)
    * Detailed execution logs (if available)
    
    Pagination is supported through skip and limit parameters, allowing users to
    navigate through large numbers of runs. This differs from the history endpoint
    which only supports limiting the number of results.
    
    Access control ensures that users can only view run logs for integrations
    that belong to their tenant, while administrators can view run logs for
    any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to access the integration, a 403 Forbidden
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this integration's run logs")
    
    # This endpoint is the same as history but supports pagination
    runs = integration_service.get_integration_history(integration_id, limit, skip)
    return runs


# Field mapping endpoints
@router.get(
    "/{integration_id}/mappings", 
    response_model=List[FieldMapping],
    summary="Get field mappings for an integration",
    description="Retrieve all field mappings for a specific integration",
    tags=["integration-mappings"],
    responses={
        200: {
            "description": "Field mappings successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "integration_id": 1,
                            "source_field": "employee_id",
                            "destination_field": "emp_id",
                            "transformation": "direct",
                            "transformation_params": {},
                            "description": "Maps employee ID from source to destination",
                            "created_at": "2025-03-01T12:00:00Z",
                            "updated_at": "2025-03-01T12:00:00Z"
                        },
                        {
                            "id": 2,
                            "integration_id": 1,
                            "source_field": "first_name",
                            "destination_field": "fname",
                            "transformation": "direct",
                            "transformation_params": {},
                            "description": "Maps first name from source to destination",
                            "created_at": "2025-03-01T12:00:00Z",
                            "updated_at": "2025-03-01T12:00:00Z"
                        },
                        {
                            "id": 3,
                            "integration_id": 1,
                            "source_field": "last_name",
                            "destination_field": "lname",
                            "transformation": "direct",
                            "transformation_params": {},
                            "description": "Maps last name from source to destination",
                            "created_at": "2025-03-01T12:00:00Z",
                            "updated_at": "2025-03-01T12:00:00Z"
                        },
                        {
                            "id": 4,
                            "integration_id": 1,
                            "source_field": "birth_date",
                            "destination_field": "date_of_birth",
                            "transformation": "date_format",
                            "transformation_params": {
                                "source_format": "YYYY-MM-DD",
                                "destination_format": "MM/DD/YYYY"
                            },
                            "description": "Maps birth date from source to destination with date format transformation",
                            "created_at": "2025-03-01T12:00:00Z",
                            "updated_at": "2025-03-01T12:00:00Z"
                        }
                    ]
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to access this integration's mappings"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def get_field_mappings(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to get field mappings for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Retrieve all field mappings for a specific integration.
    
    Field mappings define how data fields are translated between the source and 
    destination systems in an integration. Each mapping specifies:
    
    * Source field - The field name in the source system
    * Destination field - The field name in the destination system
    * Transformation - Optional data transformation to apply (e.g., date format conversion)
    * Transformation parameters - Configuration for the transformation
    
    This endpoint returns all field mappings configured for a given integration,
    enabling users to understand and manage how data is transformed during the
    integration process.
    
    Field mappings are essential for:
    * Reconciling different field naming conventions between systems
    * Converting data formats (e.g., date formats, number formats)
    * Applying business rules to data during transfer
    * Managing complex data transformations
    
    Access control ensures that users can only retrieve field mappings for 
    integrations that belong to their tenant, while administrators can access
    any integration's field mappings.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to access the integration, a 403 Forbidden
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this integration's mappings")
    
    mappings = integration_service.get_field_mappings(integration_id)
    return mappings


@router.get("/sources", response_model=List[str])
async def get_available_sources(
    integration_type: str = Query(..., description="The type of integration (API-based, File-based, etc.)"),
    integrationType: Optional[str] = Query(None, description="Alias for integration_type (camelCase)"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Get available sources for an integration type
    Supports both snake_case and camelCase parameter names for compatibility
    """
    # Use camelCase parameter if provided, otherwise use snake_case
    type_to_use = integrationType if integrationType is not None else integration_type
    return integration_service.get_available_sources(type_to_use)


@router.get("/destinations", response_model=List[str])
async def get_available_destinations(
    integration_type: str = Query(..., description="The type of integration (API-based, File-based, etc.)"),
    integrationType: Optional[str] = Query(None, description="Alias for integration_type (camelCase)"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Get available destinations for an integration type
    Supports both snake_case and camelCase parameter names for compatibility
    """
    # Use camelCase parameter if provided, otherwise use snake_case
    type_to_use = integrationType if integrationType is not None else integration_type
    return integration_service.get_available_destinations(type_to_use)


@router.get("/transformations", response_model=List[Dict[str, Any]])
async def get_transformations(
    current_user: DbUser = Depends(get_current_active_user),
    data_type: Optional[str] = Query(None, description="Filter transformations by data type"),
    dataType: Optional[str] = Query(None, description="Alias for data_type (camelCase)")
):
    """
    Get available field transformations
    
    Optionally filter by data type (string, number, datetime, etc.)
    Supports both snake_case and camelCase parameter names for compatibility
    """
    # Use camelCase parameter if provided, otherwise use snake_case
    type_to_use = dataType if dataType is not None else data_type
    
    if type_to_use:
        return TransformationRegistry.get_transformations_for_type(type_to_use)
    else:
        return TransformationRegistry.get_all_transformations()


@router.get("/current-user", response_model=UserResponseModel)
async def get_current_user_info(
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get information about the currently authenticated user
    """
    return UserResponseModel(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role.value,
        tenant_id=current_user.tenant_id,
        provider=current_user.provider,
        created_at=current_user.created_at
    )


@router.get(
    "/{integration_id}/discover-fields",
    summary="Discover available fields",
    description="Discover available fields from a source or destination system",
    tags=["integration-datasets"],
    responses={
        200: {
            "description": "List of discovered fields",
            "content": {
                "application/json": {
                    "examples": {
                        "source_fields": {
                            "summary": "Source system fields",
                            "value": [
                                {
                                    "name": "employee_id",
                                    "type": "string",
                                    "description": "Unique employee identifier",
                                    "required": True,
                                    "example": "EMP12345"
                                },
                                {
                                    "name": "first_name",
                                    "type": "string",
                                    "description": "Employee first name",
                                    "required": True,
                                    "example": "John"
                                },
                                {
                                    "name": "last_name",
                                    "type": "string",
                                    "description": "Employee last name",
                                    "required": True,
                                    "example": "Smith"
                                },
                                {
                                    "name": "hire_date",
                                    "type": "date",
                                    "description": "Date employee was hired",
                                    "required": True,
                                    "example": "2023-05-15"
                                },
                                {
                                    "name": "department_id",
                                    "type": "string",
                                    "description": "Department identifier",
                                    "required": False,
                                    "example": "DEPT001"
                                }
                            ]
                        },
                        "destination_fields": {
                            "summary": "Destination system fields",
                            "value": [
                                {
                                    "name": "emp_id",
                                    "type": "string",
                                    "description": "Employee ID in destination system",
                                    "required": True,
                                    "example": "12345"
                                },
                                {
                                    "name": "name_first",
                                    "type": "string",
                                    "description": "First name",
                                    "required": True,
                                    "example": "John"
                                },
                                {
                                    "name": "name_last",
                                    "type": "string",
                                    "description": "Last name",
                                    "required": True,
                                    "example": "Smith"
                                },
                                {
                                    "name": "start_date",
                                    "type": "date",
                                    "description": "Employment start date",
                                    "required": True,
                                    "example": "05/15/2023"
                                },
                                {
                                    "name": "dept_code",
                                    "type": "string",
                                    "description": "Department code",
                                    "required": False,
                                    "example": "D001"
                                }
                            ]
                        }
                    }
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to access this integration"}
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid parameter value",
            "content": {
                "application/json": {
                    "example": {"detail": "source_or_dest must be either 'source' or 'destination'"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        },
        500: {
            "description": "Internal Server Error - Failed to connect to system",
            "content": {
                "application/json": {
                    "example": {"detail": "Failed to connect to source system: Connection refused"}
                }
            }
        }
    }
)
async def discover_fields(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to discover fields for"),
    source_or_dest: str = Query(
        "source", 
        description="Whether to discover fields from 'source' or 'destination'",
        enum=["source", "destination"]
    ),
    sourceOrDest: Optional[str] = Query(
        None, 
        description="Alias for source_or_dest (camelCase)",
        enum=["source", "destination"]
    ),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Discover available fields from a source or destination system.
    
    This endpoint dynamically retrieves the available fields from either the source or
    destination system configured in an integration. It uses the integration's
    connection details to connect to the system and analyze its data structure,
    returning a list of available fields with their metadata.
    
    Field discovery is useful for:
    * Creating field mappings without manually entering field names
    * Understanding the data structure of connected systems
    * Validating that systems have the expected fields
    * Auto-generating mappings between similar systems
    
    The discovered fields include:
    * Field name - The identifier used in the system
    * Field type - The data type (string, number, date, etc.)
    * Description - When available from the system's metadata
    * Required status - Whether the field is required
    * Example values - When available from the system's metadata
    
    The discovery process varies based on the system type:
    * For database systems: Reads table schemas and column definitions
    * For API systems: Retrieves sample data and analyzes response structure
    * For file systems: Examines file headers or sample content
    * For custom systems: Uses system-specific discovery mechanisms
    
    This endpoint supports both snake_case and camelCase parameter naming for
    compatibility with different frontend coding styles.
    
    Access control ensures that users can only discover fields for integrations
    that belong to their tenant, while administrators can discover fields for
    any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to access the integration, a 403 Forbidden
    response is returned.
    If the source_or_dest parameter is invalid, a 400 Bad Request response is returned.
    If the system cannot be connected to, a 500 Internal Server Error response may be returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this integration")
    
    # Use camelCase parameter if provided, otherwise use snake_case
    param_to_use = sourceOrDest if sourceOrDest is not None else source_or_dest
    
    # Validate parameter
    if param_to_use not in ["source", "destination"]:
        raise HTTPException(status_code=400, detail="source_or_dest must be either 'source' or 'destination'")
    
    fields = integration_service.discover_fields(integration_id, param_to_use)
    return fields


@router.post(
    "/{integration_id}/mappings", 
    response_model=FieldMapping, 
    status_code=201,
    summary="Create a field mapping",
    description="Create a new field mapping for a specific integration",
    tags=["integration-mappings"],
    responses={
        201: {
            "description": "Field mapping successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": 5,
                        "integration_id": 1,
                        "source_field": "salary",
                        "destination_field": "annual_salary",
                        "transformation": "multiply",
                        "transformation_params": {
                            "multiplier": 12
                        },
                        "description": "Convert monthly salary to annual salary",
                        "created_at": "2025-03-28T14:30:00Z",
                        "updated_at": "2025-03-28T14:30:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Field mapping with these source and destination fields already exists"}
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to modify this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def create_field_mapping(
    mapping: FieldMappingCreate = Body(
        ..., 
        description="Field mapping data to create",
        example={
            "source_field": "salary",
            "destination_field": "annual_salary",
            "transformation": "multiply",
            "transformation_params": {
                "multiplier": 12
            },
            "description": "Convert monthly salary to annual salary"
        }
    ),
    integration_id: int = Path(..., gt=0, description="The ID of the integration to create a field mapping for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Create a new field mapping for a specific integration.
    
    Field mappings define how data is transformed as it moves from the source system
    to the destination system in an integration. This endpoint allows users to create
    a new mapping that specifies:
    
    * Source field - The field name in the source system
    * Destination field - The field name in the destination system
    * Transformation - The transformation to apply (e.g., direct, format, concatenate)
    * Transformation parameters - Configuration options for the transformation
    * Description - Optional human-readable explanation of the mapping
    
    Common transformation types include:
    * direct - Pass the value through without changes
    * format - Change the format of dates, numbers, or strings
    * concatenate - Combine multiple source fields into one destination field
    * split - Separate a single source field into multiple destination fields
    * lookup - Replace source values with destination values using a lookup table
    * calculate - Perform mathematical operations on source values
    
    Each transformation type has its own set of required parameters specified in
    the transformation_params object.
    
    Access control ensures that users can only create field mappings for 
    integrations that belong to their tenant, while administrators can create
    mappings for any integration.
    
    The response includes the created field mapping with its assigned ID and
    system-generated timestamps.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to modify the integration, a 403 Forbidden
    response is returned.
    If the mapping data is invalid or a similar mapping already exists, a 400 Bad
    Request response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to modify this integration")
    
    created = integration_service.create_field_mapping(integration_id, mapping)
    return created


@router.put(
    "/{integration_id}/mappings/{mapping_id}", 
    response_model=FieldMapping,
    summary="Update a field mapping",
    description="Update an existing field mapping for a specific integration",
    tags=["integration-mappings"],
    responses={
        200: {
            "description": "Field mapping successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 5,
                        "integration_id": 1,
                        "source_field": "salary",
                        "destination_field": "annual_salary",
                        "transformation": "multiply_and_round",
                        "transformation_params": {
                            "multiplier": 12,
                            "decimal_places": 2
                        },
                        "description": "Convert monthly salary to annual salary and round to 2 decimal places",
                        "created_at": "2025-03-28T14:30:00Z",
                        "updated_at": "2025-03-28T15:45:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid transformation parameters for multiply_and_round transformation"}
                }
            }
        },
        404: {
            "description": "Integration or field mapping not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Field mapping not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to modify this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def update_field_mapping(
    mapping: FieldMappingUpdate = Body(
        ..., 
        description="Field mapping data to update",
        example={
            "transformation": "multiply_and_round",
            "transformation_params": {
                "multiplier": 12,
                "decimal_places": 2
            },
            "description": "Convert monthly salary to annual salary and round to 2 decimal places"
        }
    ),
    integration_id: int = Path(..., gt=0, description="The ID of the integration that contains the field mapping"),
    mapping_id: int = Path(..., gt=0, description="The ID of the field mapping to update"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Update an existing field mapping for a specific integration.
    
    This endpoint allows users to modify the configuration of an existing field
    mapping. The update can be partial - only the provided fields will be updated,
    while others remain unchanged.
    
    Common update scenarios include:
    * Changing the transformation type (e.g., from direct to format)
    * Adjusting transformation parameters
    * Updating the mapping description
    * Modifying destination field
    
    Updates to the source field are generally discouraged as they could fundamentally
    change the purpose of the mapping. In such cases, it's usually better to delete
    the existing mapping and create a new one.
    
    When updating transformation type, be sure to include the appropriate
    transformation_params object with all required parameters for the new
    transformation type.
    
    Access control ensures that users can only update field mappings for 
    integrations that belong to their tenant, while administrators can update
    mappings for any integration.
    
    The response includes the complete updated field mapping with all current
    field values, including those that weren't modified in this request.
    
    If the integration or field mapping doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to modify the integration, a 403 Forbidden
    response is returned.
    If the updated mapping data is invalid, a 400 Bad Request response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to modify this integration")
    
    updated = integration_service.update_field_mapping(integration_id, mapping_id, mapping)
    if updated is None:
        raise HTTPException(status_code=404, detail="Field mapping not found")
    return updated


@router.delete(
    "/{integration_id}/mappings/{mapping_id}", 
    status_code=204,
    summary="Delete a field mapping",
    description="Delete an existing field mapping from a specific integration",
    tags=["integration-mappings"],
    responses={
        204: {
            "description": "Field mapping successfully deleted"
        },
        404: {
            "description": "Integration or field mapping not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Field mapping not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to modify this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def delete_field_mapping(
    integration_id: int = Path(..., gt=0, description="The ID of the integration that contains the field mapping"),
    mapping_id: int = Path(..., gt=0, description="The ID of the field mapping to delete"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Delete an existing field mapping from a specific integration.
    
    This endpoint permanently removes a field mapping from an integration. Once
    deleted, the mapping cannot be recovered, and data transfers will no longer
    apply the transformation defined by this mapping.
    
    Deleting a field mapping is appropriate when:
    * The source field is no longer available in the source system
    * The destination field is no longer required in the destination system
    * The mapping has been replaced by a new, more appropriate mapping
    * The data transformation is no longer needed
    
    Before deleting a mapping, consider the impact on existing integration flows.
    Removing a mapping may cause data to be omitted from transfers or may result
    in null values in the destination system if the field is required.
    
    Access control ensures that users can only delete field mappings for 
    integrations that belong to their tenant, while administrators can delete
    mappings for any integration.
    
    A successful deletion returns a 204 No Content response with no body.
    
    If the integration or field mapping doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to modify the integration, a 403 Forbidden
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to modify this integration")
    
    success = integration_service.delete_field_mapping(integration_id, mapping_id)
    if not success:
        raise HTTPException(status_code=404, detail="Field mapping not found")


# Azure Blob Configuration Endpoints
@router.get(
    "/{integration_id}/azure-blob-config", 
    response_model=AzureBlobConfig,
    summary="Get Azure Blob Storage config",
    description="Retrieve Azure Blob Storage configuration for a specific integration",
    tags=["integration-storage"],
    responses={
        200: {
            "description": "Azure Blob Storage configuration successfully retrieved",
            "content": {
                "application/json": {
                    "example": {
                        "containerName": "employee-data",
                        "folderPath": "hr-exports",
                        "fileNamePattern": "employee-data-{date}.csv",
                        "connectionString": "DefaultEndpointsProtocol=https;AccountName=****;AccountKey=****;EndpointSuffix=core.windows.net"
                    }
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to access this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def get_azure_blob_config(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to get Azure Blob config for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Retrieve Azure Blob Storage configuration for a specific integration.
    
    This endpoint returns the Azure Blob Storage settings configured for an
    integration. Azure Blob Storage is one of the supported destination types
    for file-based integrations, allowing data to be exported to cloud storage.
    
    The configuration includes:
    * Container name - The Azure Blob Storage container where files will be stored
    * Folder path - Optional subfolder path within the container
    * File name pattern - Optional pattern for generated file names, supporting variables
      like {date}, {time}, and {run_id}
    * Connection details - Information used to connect to Azure (sensitive information
      is redacted in the response)
    
    This configuration is used when the integration runs to determine where and how
    to store data in Azure Blob Storage. It is applicable primarily for integrations
    that have "Azure Blob Storage" as their destination.
    
    If the integration has no Azure Blob configuration set, a default empty
    configuration is returned.
    
    Access control ensures that users can only access configurations for 
    integrations that belong to their tenant, while administrators can access
    configurations for any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to access the integration, a 403 Forbidden
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this integration")
    
    if not existing.azure_blob_config:
        return AzureBlobConfig(containerName="")
    
    return existing.azure_blob_config


@router.put(
    "/{integration_id}/azure-blob-config", 
    response_model=Integration,
    summary="Update Azure Blob Storage config",
    description="Update Azure Blob Storage configuration for a specific integration",
    tags=["integration-storage"],
    responses={
        200: {
            "description": "Azure Blob Storage configuration successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Monthly Financial Report Export",
                        "description": "Exports financial data to cloud storage on the last day of each month",
                        "type": "scheduled",
                        "source": "Financial Database",
                        "destination": "Azure Blob Storage",
                        "status": "active",
                        "health": "healthy",
                        "tenant_id": "tenant-1",
                        "created_at": "2025-01-15T11:20:00Z",
                        "updated_at": "2025-03-29T11:20:00Z",
                        "last_run_at": "2025-02-29T23:00:00Z",
                        "last_run_status": "success",
                        "schedule": {
                            "type": "monthly",
                            "day": "last",
                            "time": "23:00:00",
                            "timezone": "timezone"
                        },
                        "run_count": 2,
                        "success_count": 2,
                        "error_count": 0,
                        "azure_blob_config": {
                            "containerName": "financial-reports-2025",
                            "folderPath": "monthly/finance",
                            "fileNamePattern": "financial-report-{date}.xlsx",
                            "connectionString": "DefaultEndpointsProtocol=https;AccountName=****;AccountKey=****;EndpointSuffix=core.windows.net"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Container name cannot be empty"}
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to modify this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def update_azure_blob_config(
    config: AzureBlobConfig = Body(
        ..., 
        description="Azure Blob Storage configuration to update",
        example={
            "containerName": "financial-reports-2025",
            "folderPath": "monthly/finance",
            "fileNamePattern": "financial-report-{date}.xlsx"
        }
    ),
    integration_id: int = Path(..., gt=0, description="The ID of the integration to update Azure Blob config for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Update Azure Blob Storage configuration for a specific integration.
    
    This endpoint allows users to modify the Azure Blob Storage settings for
    an integration. The configuration specifies where and how files will be
    stored in Azure Blob Storage when the integration runs.
    
    The following configuration elements can be updated:
    * Container name - The Azure Blob Storage container where files will be stored
      (required; container must exist in the Azure account)
    * Folder path - Optional subfolder path within the container
      (supports nested paths like "reports/monthly/finance")
    * File name pattern - Optional pattern for generated file names
      (supports variables like {date}, {time}, and {run_id})
    * Connection string - Optional Azure connection string
      (if not provided, will use the system default from environment variables)
    
    When updating the configuration:
    * Container name must be provided and cannot be empty
    * Container names must be lowercase and follow Azure naming rules
    * Folder paths should not start with "/" but can include nested paths
    * Proper permissions to the Azure account are required separately
    * Connection strings should be managed through secure environment variables
      when possible, rather than stored in the configuration
    
    The response includes the complete updated integration with the new Azure
    Blob Storage configuration applied.
    
    Access control ensures that users can only update configurations for 
    integrations that belong to their tenant, while administrators can update
    configurations for any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to modify the integration, a 403 Forbidden
    response is returned.
    If the configuration data is invalid, a 400 Bad Request response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to modify this integration")
    
    # Validate required fields
    if not config.containerName or config.containerName.strip() == "":
        raise HTTPException(status_code=400, detail="Container name cannot be empty")
    
    update = IntegrationUpdate(azure_blob_config=config)
    return integration_service.update_integration(integration_id, update)


@router.post(
    "/{integration_id}/azure-blob-config/test", 
    status_code=200,
    summary="Test Azure Blob Storage connection",
    description="Test the connection to Azure Blob Storage using the integration's configuration",
    tags=["integration-storage"],
    responses={
        200: {
            "description": "Connection test results",
            "content": {
                "application/json": {
                    "examples": {
                        "success": {
                            "summary": "Successful connection",
                            "value": {
                                "status": "success",
                                "message": "Connection successful",
                                "container": "financial-reports-2025",
                                "blobs_found": 5
                            }
                        },
                        "error_connection": {
                            "summary": "Connection error",
                            "value": {
                                "status": "error",
                                "message": "Failed to initialize Azure Blob Storage connection",
                                "details": "BlobServiceClient connection error. AccountName or AccountKey is invalid or missing."
                            }
                        },
                        "error_access": {
                            "summary": "Access error",
                            "value": {
                                "status": "error",
                                "message": "Connection established but failed to list blobs",
                                "details": "AuthorizationPermissionMismatch: The client does not have permission to perform action 'read' on resource 'container'."
                            }
                        },
                        "error_container": {
                            "summary": "Container not found",
                            "value": {
                                "status": "error",
                                "message": "Connection established but failed to list blobs",
                                "details": "ContainerNotFound: The specified container does not exist."
                            }
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Azure Blob configuration not set",
            "content": {
                "application/json": {
                    "example": {"detail": "Azure Blob configuration not set"}
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to access this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def test_azure_blob_connection(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to test Azure Blob connection for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Test the connection to Azure Blob Storage using the integration's configuration.
    
    This endpoint tests whether the system can successfully connect to Azure Blob Storage
    using the configuration defined for the integration. It performs the following checks:
    
    1. Connection to Azure Blob Storage service
    2. Authentication with the provided or default credentials
    3. Access to the specified container
    4. Ability to list blobs within the container
    
    The test is useful for:
    * Validating Azure Blob Storage configuration before using it in production
    * Troubleshooting connection issues
    * Verifying permissions and access control
    * Confirming container existence and accessibility
    
    The response includes:
    * Status: success or error
    * Message: Description of the test result
    * Container: The container name that was tested
    * Blobs found: Number of blobs found in the container (for successful tests)
    * Details: Additional error information (when applicable)
    
    For security reasons, this endpoint does not attempt to create containers or
    blobs if they don't exist, it only tests the connection and access permissions.
    
    Common error scenarios include:
    * Invalid connection string or credentials
    * Non-existent container
    * Insufficient permissions to the container
    * Network or firewall issues preventing connection
    
    Access control ensures that users can only test connections for integrations
    that belong to their tenant, while administrators can test connections for
    any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to access the integration, a 403 Forbidden
    response is returned.
    If the integration doesn't have Azure Blob configuration set, a 400 Bad Request
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this integration")
    
    if not existing.azure_blob_config:
        raise HTTPException(status_code=400, detail="Azure Blob configuration not set")
    
    try:
        # Use blob storage adapter to test connection
        from adapters.adapter_factory import AdapterFactory
        from adapters.blob_storage_adapter import BlobStorageAdapter
        import logging
        
        logging.info(f"Testing Azure blob connection for integration {integration_id}")
        adapter = AdapterFactory.create_adapter("azure_blob", config=existing.azure_blob_config)
        result = adapter.test_connection()
        
        return {"status": "success", "details": result}
    except Exception as e:
        logging.error(f"Azure blob connection test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Connection test failed: {str(e)}")
        
# The following appears to be misplaced imports that should be at the top of the file
# from pydantic import BaseModel
# from typing import List, Dict, Any, Optional
# from datetime import timezone
# from pydantic import BaseModel
# from backend.utils.api.models import DataResponse, PaginatedResponse, ErrorResponse, create_response, create_paginated_response, create_error_response

# Standard API Response Models
class ResponseMetadata(BaseModel):
    timestamp: datetime
    request_id: str
    api_version: str = "1.0"

class StandardResponse(BaseModel):
    data: Any
    metadata: ResponseMetadata

class PaginationMetadata(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int

class PaginatedResponse(BaseModel):
    data: List[Any]
    pagination: PaginationMetadata
    metadata: ResponseMetadata

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    error: ErrorDetail
    metadata: ResponseMetadata


# Schedule Configuration Endpoints
@router.get(
    "/{integration_id}/schedule", 
    response_model=ScheduleConfig,
    summary="Get schedule configuration",
    description="Retrieve the schedule configuration for a specific integration",
    tags=["integration-scheduling"],
    responses={
        200: {
            "description": "Schedule configuration successfully retrieved",
            "content": {
                "application/json": {
                    "examples": {
                        "daily": {
                            "summary": "Daily schedule",
                            "value": {
                                "type": "daily",
                                "time": "03:30:00",
                                "timezone": "UTC"
                            }
                        },
                        "weekly": {
                            "summary": "Weekly schedule",
                            "value": {
                                "type": "weekly",
                                "day_of_week": "Monday",
                                "time": "09:00:00",
                                "timezone": "America/New_York"
                            }
                        },
                        "monthly": {
                            "summary": "Monthly schedule",
                            "value": {
                                "type": "monthly",
                                "day": "1",
                                "time": "00:15:00",
                                "timezone": "Europe/London"
                            }
                        },
                        "monthly_last_day": {
                            "summary": "Monthly last day schedule",
                            "value": {
                                "type": "monthly",
                                "day": "last",
                                "time": "23:45:00",
                                "timezone": "UTC"
                            }
                        },
                        "hourly": {
                            "summary": "Hourly schedule",
                            "value": {
                                "type": "hourly",
                                "minute": "15",
                                "timezone": "UTC"
                            }
                        },
                        "on_demand": {
                            "summary": "On-demand schedule (no automatic execution)",
                            "value": {
                                "type": "onDemand"
                            }
                        }
                    }
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to access this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def get_schedule_config(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to get schedule configuration for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Retrieve the schedule configuration for a specific integration.
    
    This endpoint returns the scheduling settings for an integration, which
    determine when and how frequently the integration will automatically execute.
    Scheduled integrations run at specified intervals without manual intervention,
    while on-demand integrations must be triggered manually.
    
    The schedule configuration varies based on the schedule type:
    
    * Daily schedule:
      - type: "daily"
      - time: Time of day to run (HH:MM:SS format)
      - timezone: Timezone for the scheduled time
    
    * Weekly schedule:
      - type: "weekly"
      - day_of_week: Day to run (Monday, Tuesday, etc.)
      - time: Time of day to run (HH:MM:SS format)
      - timezone: Timezone for the scheduled time
    
    * Monthly schedule:
      - type: "monthly"
      - day: Day of month to run (1-31 or "last" for last day of month)
      - time: Time of day to run (HH:MM:SS format)
      - timezone: Timezone for the scheduled time
    
    * Hourly schedule:
      - type: "hourly"
      - minute: Minute of the hour to run (0-59)
      - timezone: Timezone for the scheduled time
    
    * On-demand (no automatic scheduling):
      - type: "onDemand"
    
    If the integration has no schedule configuration set, a default on-demand
    configuration is returned. The system handles different data formats
    (string, dictionary, or ScheduleConfig object) to ensure consistent responses.
    
    Access control ensures that users can only retrieve schedule configurations for 
    integrations that belong to their tenant, while administrators can access
    configurations for any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to access the integration, a 403 Forbidden
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this integration")
    
    if not existing.schedule:
        return ScheduleConfig(type="onDemand")
    
    # Convert string schedule to ScheduleConfig if needed
    if isinstance(existing.schedule, str):
        try:
            return ScheduleConfig(type=existing.schedule)
        except:
            return ScheduleConfig(type="onDemand")
    
    # Handle dict object (from JSON in database)
    if isinstance(existing.schedule, dict):
        try:
            return ScheduleConfig(**existing.schedule)
        except:
            return ScheduleConfig(type="onDemand")
    
    return existing.schedule


@router.put(
    "/{integration_id}/schedule", 
    response_model=Integration,
    summary="Update schedule configuration",
    description="Update the schedule configuration for a specific integration",
    tags=["integration-scheduling"],
    responses={
        200: {
            "description": "Schedule configuration successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Daily Employee Data Import",
                        "description": "Imports employee data from HRIS to payroll system daily",
                        "type": "scheduled",
                        "source": "HRIS API",
                        "destination": "Payroll System",
                        "status": "active",
                        "health": "healthy",
                        "tenant_id": "tenant-1",
                        "created_at": "2025-02-10T14:30:00Z",
                        "updated_at": "2025-03-29T12:45:00Z",
                        "last_run_at": "2025-03-28T01:00:00Z",
                        "last_run_status": "success",
                        "schedule": {
                            "type": "daily",
                            "time": "02:30:00",
                            "timezone": "America/Chicago"
                        },
                        "run_count": 47,
                        "success_count": 46,
                        "error_count": 1
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid schedule configuration",
            "content": {
                "application/json": {
                    "examples": {
                        "invalid_schedule_type": {
                            "summary": "Invalid schedule type",
                            "value": {"detail": "Invalid schedule type 'biweekly'. Supported types are: daily, weekly, monthly, hourly, onDemand"}
                        },
                        "missing_parameters": {
                            "summary": "Missing required parameters",
                            "value": {"detail": "Weekly schedule requires day_of_week parameter"}
                        },
                        "invalid_time_format": {
                            "summary": "Invalid time format",
                            "value": {"detail": "Time must be in 'HH:MM:SS' format"}
                        },
                        "invalid_timezone": {
                            "summary": "Invalid timezone",
                            "value": {"detail": "Invalid timezone 'PST'. Use IANA timezone database name (e.g., 'America/Los_Angeles')"}
                        }
                    }
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to modify this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def update_schedule_config(
    schedule: ScheduleConfig = Body(
        ..., 
        description="Schedule configuration to update",
        examples={
            "daily": {
                "summary": "Daily schedule",
                "value": {
                    "type": "daily",
                    "time": "02:30:00",
                    "timezone": "America/Chicago"
                }
            },
            "weekly": {
                "summary": "Weekly schedule",
                "value": {
                    "type": "weekly",
                    "day_of_week": "Tuesday",
                    "time": "23:00:00", 
                    "timezone": "UTC"
                }
            },
            "monthly": {
                "summary": "Monthly schedule",
                "value": {
                    "type": "monthly",
                    "day": "15",
                    "time": "12:00:00",
                    "timezone": "Europe/London"
                }
            },
            "on_demand": {
                "summary": "On-demand (no automatic execution)",
                "value": {
                    "type": "onDemand"
                }
            }
        }
    ),
    integration_id: int = Path(..., gt=0, description="The ID of the integration to update schedule configuration for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Update the schedule configuration for a specific integration.
    
    This endpoint allows users to modify when and how frequently an integration
    will automatically execute. The schedule determines the timing of automated
    integration runs without manual intervention.
    
    Each schedule type requires different parameters:
    
    * Daily schedule:
      - type: "daily"
      - time: Time of day to run (HH:MM:SS format)
      - timezone: IANA timezone database name (e.g., "UTC", "America/New_York")
      
    * Weekly schedule:
      - type: "weekly"
      - day_of_week: Day to run (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
      - time: Time of day to run (HH:MM:SS format)
      - timezone: IANA timezone database name
      
    * Monthly schedule:
      - type: "monthly"
      - day: Day of month to run (1-31 or "last" for last day)
      - time: Time of day to run (HH:MM:SS format)
      - timezone: IANA timezone database name
      
    * Hourly schedule:
      - type: "hourly"
      - minute: Minute of the hour to run (0-59)
      - timezone: IANA timezone database name
      
    * On-demand (no automatic scheduling):
      - type: "onDemand"
    
    Validation rules:
    * For time values, use 24-hour format (HH:MM:SS)
    * For timezones, use IANA timezone database names (e.g., "UTC", "America/New_York")
    * Day of week must be a valid day name (Monday through Sunday)
    * Day of month must be 1-31 or "last" (will adjust for months with fewer days)
    * Minute must be 0-59 for hourly schedules
    
    The system will validate the schedule configuration and return appropriate
    error messages if the provided schedule does not meet the requirements.
    
    The response includes the complete updated integration with the new schedule
    configuration applied.
    
    Access control ensures that users can only update schedule configurations for 
    integrations that belong to their tenant, while administrators can update
    configurations for any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to modify the integration, a 403 Forbidden
    response is returned.
    If the schedule configuration is invalid, a 400 Bad Request response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to modify this integration")
    
    # Validate the schedule
    valid_types = ["daily", "weekly", "monthly", "hourly", "onDemand"]
    if schedule.type not in valid_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid schedule type '{schedule.type}'. Supported types are: {', '.join(valid_types)}"
        )
    
    # Validate schedule parameters based on type
    if schedule.type == "weekly" and not getattr(schedule, "day_of_week", None):
        raise HTTPException(status_code=400, detail="Weekly schedule requires day_of_week parameter")
    
    if schedule.type == "monthly" and not getattr(schedule, "day", None):
        raise HTTPException(status_code=400, detail="Monthly schedule requires day parameter")
    
    if schedule.type == "hourly" and not getattr(schedule, "minute", None):
        raise HTTPException(status_code=400, detail="Hourly schedule requires minute parameter")
    
    if schedule.type in ["daily", "weekly", "monthly"] and not getattr(schedule, "time", None):
        raise HTTPException(status_code=400, detail=f"{schedule.type.capitalize()} schedule requires time parameter")
    
    update = IntegrationUpdate(schedule=schedule)
    return integration_service.update_integration(integration_id, update)


# Earnings Mapping endpoints
@router.get(
    "/{integration_id}/earnings/mappings", 
    response_model=List[EarningsMapping],
    summary="Get earnings mappings",
    description="Retrieve all earnings mappings for a specific integration",
    tags=["integration-earnings"],
    responses={
        200: {
            "description": "List of earnings mappings for the integration",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "integration_id": 1,
                            "source_code": "REG",
                            "destination_code": "REGULAR",
                            "description": "Regular earnings (standard hours)",
                            "multiplier": 1.0,
                            "priority": 1,
                            "is_default": True,
                            "created_at": "2025-02-15T10:00:00Z",
                            "updated_at": "2025-03-10T15:30:00Z"
                        },
                        {
                            "id": 2,
                            "integration_id": 1,
                            "source_code": "OT",
                            "destination_code": "OVERTIME",
                            "description": "Overtime earnings (1.5x rate)",
                            "multiplier": 1.5,
                            "priority": 2,
                            "is_default": False,
                            "created_at": "2025-02-15T10:05:00Z",
                            "updated_at": "2025-03-10T15:35:00Z"
                        },
                        {
                            "id": 3,
                            "integration_id": 1,
                            "source_code": "DT",
                            "destination_code": "DOUBLETIME",
                            "description": "Double-time earnings (2x rate)",
                            "multiplier": 2.0,
                            "priority": 3,
                            "is_default": False,
                            "created_at": "2025-02-15T10:10:00Z",
                            "updated_at": "2025-03-10T15:40:00Z"
                        },
                        {
                            "id": 4,
                            "integration_id": 1,
                            "source_code": "HOL",
                            "destination_code": "HOLIDAY",
                            "description": "Holiday pay",
                            "multiplier": 1.0,
                            "priority": 4,
                            "is_default": False,
                            "created_at": "2025-02-15T10:15:00Z",
                            "updated_at": "2025-03-10T15:45:00Z"
                        }
                    ]
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to access this integration's earnings mappings"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def get_earnings_mappings(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to get earnings mappings for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Retrieve all earnings mappings for a specific integration.
    
    This endpoint returns a list of earnings code mappings configured for an
    integration. Earnings mappings define how earnings codes from a source system
    are translated to corresponding codes in a destination system, along with any
    necessary transformations such as rate multipliers.
    
    Earnings mappings are particularly important for payroll and time tracking
    integrations, where different systems may use different codes to represent the
    same types of earnings (regular time, overtime, etc.).
    
    Each earnings mapping includes:
    * Source code - The earnings code in the source system
    * Destination code - The corresponding code in the destination system
    * Description - Human-readable explanation of the mapping
    * Multiplier - Optional factor to apply to hours or amounts (e.g., 1.5 for overtime)
    * Priority - Order in which mappings should be applied when multiple could match
    * Default status - Whether this mapping is used for unmatched codes
    
    These mappings enable the integration to:
    * Translate earnings codes between different payroll systems
    * Apply appropriate rate multipliers during transfers
    * Ensure data consistency in payroll processing
    * Handle special earnings types appropriately
    
    Access control ensures that users can only view earnings mappings for 
    integrations that belong to their tenant, while administrators can view
    mappings for any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to access the integration, a 403 Forbidden
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this integration's earnings mappings")
    
    mappings = integration_service.get_earnings_mappings(integration_id)
    return mappings


@router.post(
    "/{integration_id}/earnings/mappings", 
    response_model=EarningsMapping, 
    status_code=201,
    summary="Create earnings mapping",
    description="Create a new earnings mapping for a specific integration",
    tags=["integration-earnings"],
    responses={
        201: {
            "description": "Earnings mapping successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": 5,
                        "integration_id": 1,
                        "source_code": "VAC",
                        "destination_code": "VACATION",
                        "description": "Vacation pay",
                        "multiplier": 1.0,
                        "priority": 5,
                        "is_default": False,
                        "created_at": "2025-03-30T15:20:00Z",
                        "updated_at": "2025-03-30T15:20:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid input data",
            "content": {
                "application/json": {
                    "examples": {
                        "duplicate_mapping": {
                            "summary": "Duplicate source code",
                            "value": {"detail": "Earnings mapping with source code 'VAC' already exists for this integration"}
                        },
                        "invalid_multiplier": {
                            "summary": "Invalid multiplier",
                            "value": {"detail": "Multiplier must be greater than zero"}
                        },
                        "multiple_default": {
                            "summary": "Multiple default mappings",
                            "value": {"detail": "Only one mapping can be marked as default"}
                        }
                    }
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to modify this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def create_earnings_mapping(
    mapping: EarningsMappingCreate = Body(
        ..., 
        description="Earnings mapping data to create",
        example={
            "source_code": "VAC",
            "destination_code": "VACATION",
            "description": "Vacation pay",
            "multiplier": 1.0,
            "priority": 5,
            "is_default": False
        }
    ),
    integration_id: int = Path(..., gt=0, description="The ID of the integration to create an earnings mapping for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Create a new earnings mapping for a specific integration.
    
    This endpoint allows users to define a new mapping between earnings codes
    in source and destination systems. Earnings mappings are crucial for payroll
    and time tracking integrations to ensure that different earnings types are
    appropriately translated between systems.
    
    When creating an earnings mapping, users specify:
    * Source code - The earnings code in the source system (e.g., "OT" for overtime)
    * Destination code - The corresponding code in the destination system (e.g., "OVERTIME")
    * Description - Human-readable explanation of the mapping
    * Multiplier - Factor to apply to hours or amounts (e.g., 1.5 for overtime)
    * Priority - Order in which mappings should be applied when multiple could match
    * Default status - Whether this mapping should be used for unmatched codes
    
    Validation rules:
    * Source codes must be unique within an integration
    * Multipliers must be greater than zero
    * Only one mapping can be designated as the default for an integration
    * Priority values should be unique, but this is not strictly enforced
    
    The response includes the created earnings mapping with system-generated
    fields like ID and timestamps.
    
    Access control ensures that users can only create earnings mappings for 
    integrations that belong to their tenant, while administrators can create
    mappings for any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to modify the integration, a 403 Forbidden
    response is returned.
    If the mapping data is invalid, a 400 Bad Request response is returned with
    an explanation of the issue.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to modify this integration")
    
    # Validate the mapping
    if mapping.multiplier <= 0:
        raise HTTPException(status_code=400, detail="Multiplier must be greater than zero")
    
    # Check if a mapping with this source code already exists
    existing_mappings = integration_service.get_earnings_mappings(integration_id)
    for existing_mapping in existing_mappings:
        if existing_mapping.source_code == mapping.source_code:
            raise HTTPException(
                status_code=400, 
                detail=f"Earnings mapping with source code '{mapping.source_code}' already exists for this integration"
            )
    
    # Check if we're trying to create a second default mapping
    if mapping.is_default:
        for existing_mapping in existing_mappings:
            if existing_mapping.is_default:
                raise HTTPException(status_code=400, detail="Only one mapping can be marked as default")
    
    created = integration_service.create_earnings_mapping(integration_id, mapping)
    return created


@router.put(
    "/{integration_id}/earnings/mappings/{mapping_id}", 
    response_model=EarningsMapping,
    summary="Update earnings mapping",
    description="Update an existing earnings mapping for a specific integration",
    tags=["integration-earnings"],
    responses={
        200: {
            "description": "Earnings mapping successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 3,
                        "integration_id": 1,
                        "source_code": "DT",
                        "destination_code": "DOUBLE_TIME",
                        "description": "Double-time earnings with revised description",
                        "multiplier": 2.0,
                        "priority": 2,
                        "is_default": False,
                        "created_at": "2025-02-15T10:10:00Z",
                        "updated_at": "2025-03-30T16:20:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid input data",
            "content": {
                "application/json": {
                    "examples": {
                        "duplicate_source": {
                            "summary": "Duplicate source code",
                            "value": {"detail": "Another mapping with source code 'VAC' already exists"}
                        },
                        "invalid_multiplier": {
                            "summary": "Invalid multiplier",
                            "value": {"detail": "Multiplier must be greater than zero"}
                        },
                        "multiple_default": {
                            "summary": "Multiple default mappings",
                            "value": {"detail": "Another mapping is already set as default"}
                        }
                    }
                }
            }
        },
        404: {
            "description": "Integration or earnings mapping not found",
            "content": {
                "application/json": {
                    "examples": {
                        "integration_not_found": {
                            "summary": "Integration not found",
                            "value": {"detail": "Integration not found"}
                        },
                        "mapping_not_found": {
                            "summary": "Earnings mapping not found",
                            "value": {"detail": "Earnings mapping not found"}
                        }
                    }
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to modify this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def update_earnings_mapping(
    mapping: EarningsMappingUpdate = Body(
        ..., 
        description="Earnings mapping data to update",
        example={
            "destination_code": "DOUBLE_TIME",
            "description": "Double-time earnings with revised description",
            "priority": 2
        }
    ),
    integration_id: int = Path(..., gt=0, description="The ID of the integration that contains the earnings mapping"),
    mapping_id: int = Path(..., gt=0, description="The ID of the earnings mapping to update"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Update an existing earnings mapping for a specific integration.
    
    This endpoint allows users to modify an existing earnings mapping configuration.
    The update can be partial - only the provided fields will be updated, while
    others remain unchanged.
    
    Users can update:
    * Destination code - Change the corresponding code in the destination system
    * Description - Update the human-readable explanation
    * Multiplier - Modify the factor applied to hours or amounts
    * Priority - Change the order in which mappings are applied
    * Default status - Set or unset this mapping as the default
    
    Source code updates are generally discouraged as they fundamentally change
    the mapping's purpose. In such cases, it's usually better to create a new
    mapping and delete the old one.
    
    Validation rules:
    * Multipliers must be greater than zero
    * Only one mapping can be designated as default
    * Source codes must remain unique within an integration
    * Priority values should be unique, but this is not strictly enforced
    
    The response includes the complete updated earnings mapping with all current
    field values, including those that weren't modified in this request.
    
    Access control ensures that users can only update earnings mappings for 
    integrations that belong to their tenant, while administrators can update
    mappings for any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the earnings mapping doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to modify the integration, a 403 Forbidden
    response is returned.
    If the update data is invalid, a 400 Bad Request response is returned with
    an explanation of the issue.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to modify this integration")
    
    # Validate the multiplier if provided
    if hasattr(mapping, "multiplier") and mapping.multiplier is not None and mapping.multiplier <= 0:
        raise HTTPException(status_code=400, detail="Multiplier must be greater than zero")
    
    # If updating the source code, check for duplicates
    if hasattr(mapping, "source_code") and mapping.source_code is not None:
        existing_mappings = integration_service.get_earnings_mappings(integration_id)
        for existing_mapping in existing_mappings:
            if (existing_mapping.source_code == mapping.source_code and 
                existing_mapping.id != mapping_id):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Another mapping with source code '{mapping.source_code}' already exists"
                )
    
    # Check for default setting conflicts
    if hasattr(mapping, "is_default") and mapping.is_default:
        existing_mappings = integration_service.get_earnings_mappings(integration_id)
        for existing_mapping in existing_mappings:
            if existing_mapping.is_default and existing_mapping.id != mapping_id:
                raise HTTPException(status_code=400, detail="Another mapping is already set as default")
    
    updated = integration_service.update_earnings_mapping(integration_id, mapping_id, mapping)
    if updated is None:
        raise HTTPException(status_code=404, detail="Earnings mapping not found")
    return updated


@router.delete(
    "/{integration_id}/earnings/mappings/{mapping_id}", 
    status_code=204,
    summary="Delete earnings mapping",
    description="Delete an existing earnings mapping from a specific integration",
    tags=["integration-earnings"],
    responses={
        204: {
            "description": "Earnings mapping successfully deleted"
        },
        404: {
            "description": "Integration or earnings mapping not found",
            "content": {
                "application/json": {
                    "examples": {
                        "integration_not_found": {
                            "summary": "Integration not found",
                            "value": {"detail": "Integration not found"}
                        },
                        "mapping_not_found": {
                            "summary": "Earnings mapping not found",
                            "value": {"detail": "Earnings mapping not found"}
                        }
                    }
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to modify this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        },
        409: {
            "description": "Conflict - Cannot delete the default mapping when others exist",
            "content": {
                "application/json": {
                    "example": {"detail": "Cannot delete the default mapping when other mappings exist"}
                }
            }
        }
    }
)
async def delete_earnings_mapping(
    integration_id: int = Path(..., gt=0, description="The ID of the integration that contains the earnings mapping"),
    mapping_id: int = Path(..., gt=0, description="The ID of the earnings mapping to delete"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Delete an existing earnings mapping from a specific integration.
    
    This endpoint removes an earnings mapping configuration from an integration.
    Deleting a mapping means that the corresponding source earnings code will no
    longer be transformed to the destination system during integration execution.
    
    Special considerations when deleting earnings mappings:
    * If the mapping is marked as default and other non-default mappings exist,
      deletion may be prevented to ensure proper fallback behavior
    * If the mapping is the only one for a given integration, there are no
      restrictions on its deletion
    * Deleting a mapping does not affect historical data that has already been
      transformed and transferred
    
    After deletion, any source earnings codes that previously matched the deleted
    mapping will either:
    * Match another mapping based on exact source code match
    * Use the default mapping if one exists
    * Be omitted from the transformation if no default exists
    
    A successful deletion returns a 204 No Content response with no body.
    
    Access control ensures that users can only delete earnings mappings for 
    integrations that belong to their tenant, while administrators can delete
    mappings for any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the earnings mapping doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to modify the integration, a 403 Forbidden
    response is returned.
    If the deletion would create an invalid state (e.g., removing the only default
    mapping when non-default mappings exist), a 409 Conflict response may be returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to modify this integration")
    
    # Check if we're trying to delete the default mapping when others exist
    existing_mappings = integration_service.get_earnings_mappings(integration_id)
    target_mapping = next((m for m in existing_mappings if m.id == mapping_id), None)
    
    if target_mapping and target_mapping.is_default and len(existing_mappings) > 1:
        # This validation would depend on business rules - uncomment if needed
        # raise HTTPException(
        #     status_code=409, 
        #     detail="Cannot delete the default mapping when other mappings exist"
        # )
        pass
    
    success = integration_service.delete_earnings_mapping(integration_id, mapping_id)
    if not success:
        raise HTTPException(status_code=404, detail="Earnings mapping not found")


@router.get(
    "/earnings/codes", 
    response_model=List[EarningsCode],
    summary="Get earnings codes",
    description="Retrieve all earnings codes, optionally filtered by destination system",
    tags=["integration-earnings"],
    responses={
        200: {
            "description": "List of earnings codes",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "code": "REG",
                            "name": "Regular",
                            "description": "Regular earnings (standard hours)",
                            "type": "hourly",
                            "destination_system": "PayrollSystem1",
                            "tenant_id": "tenant-1",
                            "is_active": True,
                            "created_at": "2025-02-01T10:00:00Z",
                            "updated_at": "2025-03-15T11:30:00Z"
                        },
                        {
                            "id": 2,
                            "code": "OT",
                            "name": "Overtime",
                            "description": "Overtime earnings (1.5x rate)",
                            "type": "hourly",
                            "destination_system": "PayrollSystem1",
                            "tenant_id": "tenant-1",
                            "is_active": True,
                            "created_at": "2025-02-01T10:05:00Z",
                            "updated_at": "2025-03-15T11:35:00Z"
                        },
                        {
                            "id": 3,
                            "code": "DT",
                            "name": "Double Time",
                            "description": "Double-time earnings (2x rate)",
                            "type": "hourly",
                            "destination_system": "PayrollSystem1",
                            "tenant_id": "tenant-1",
                            "is_active": True,
                            "created_at": "2025-02-01T10:10:00Z",
                            "updated_at": "2025-03-15T11:40:00Z"
                        },
                        {
                            "id": 4,
                            "code": "VAC",
                            "name": "Vacation",
                            "description": "Vacation time",
                            "type": "time_off",
                            "destination_system": "PayrollSystem2",
                            "tenant_id": "tenant-1",
                            "is_active": True,
                            "created_at": "2025-02-01T10:15:00Z",
                            "updated_at": "2025-03-15T11:45:00Z"
                        },
                        {
                            "id": 5,
                            "code": "SICK",
                            "name": "Sick Leave",
                            "description": "Sick leave time",
                            "type": "time_off",
                            "destination_system": "PayrollSystem2",
                            "tenant_id": "tenant-1",
                            "is_active": True,
                            "created_at": "2025-02-01T10:20:00Z",
                            "updated_at": "2025-03-15T11:50:00Z"
                        }
                    ]
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def get_earnings_codes(
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service),
    destination_system: Optional[str] = Query(
        None, 
        description="Filter by destination system (e.g., 'PayrollSystem1', 'PayrollSystem2')"
    )
):
    """
    Retrieve all earnings codes, optionally filtered by destination system.
    
    This endpoint returns a list of earnings codes that can be used in earnings
    mappings. Earnings codes represent different types of compensation or time off
    in payroll and HR systems. They serve as the basis for mapping source data to
    destination systems in payroll integrations.
    
    Earnings codes include:
    * Code - The unique identifier used in the system (e.g., "REG", "OT")
    * Name - Human-readable name (e.g., "Regular", "Overtime")
    * Description - Detailed explanation of the code's purpose
    * Type - Category of earnings (hourly, salary, time_off, etc.)
    * Destination system - The payroll or HR system this code belongs to
    * Active status - Whether the code is currently in use
    
    Users can optionally filter the list by destination system to see only the
    codes relevant to a specific system integration.
    
    For regular users, this endpoint returns only earnings codes belonging to their
    tenant. Administrators can see earnings codes across all tenants.
    
    Earnings codes are typically used in conjunction with earnings mappings to
    define how source system codes should be translated to destination system codes
    during integration execution.
    """
    tenant_id = None if current_user.role.value == "admin" else current_user.tenant_id
    codes = integration_service.get_earnings_codes(tenant_id, destination_system)
    return codes


@router.post(
    "/earnings/codes", 
    response_model=EarningsCode, 
    status_code=201,
    summary="Create earnings code",
    description="Create a new earnings code for use in integrations",
    tags=["integration-earnings"],
    responses={
        201: {
            "description": "Earnings code successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": 6,
                        "code": "BONUS",
                        "name": "Bonus Payment",
                        "description": "One-time bonus payment",
                        "type": "bonus",
                        "destination_system": "PayrollSystem1",
                        "tenant_id": "tenant-1",
                        "is_active": True,
                        "created_at": "2025-03-30T17:30:00Z",
                        "updated_at": "2025-03-30T17:30:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid input data",
            "content": {
                "application/json": {
                    "examples": {
                        "duplicate_code": {
                            "summary": "Duplicate code",
                            "value": {"detail": "Earnings code 'BONUS' already exists for the destination system 'PayrollSystem1'"}
                        },
                        "invalid_type": {
                            "summary": "Invalid type",
                            "value": {"detail": "Invalid earnings type. Must be one of: hourly, salary, bonus, commission, time_off"}
                        },
                        "invalid_code_format": {
                            "summary": "Invalid code format",
                            "value": {"detail": "Code must be uppercase and contain only letters, numbers, and underscores"}
                        }
                    }
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def create_earnings_code(
    code: EarningsCodeCreate = Body(
        ...,
        description="Earnings code data to create",
        example={
            "code": "BONUS",
            "name": "Bonus Payment",
            "description": "One-time bonus payment",
            "type": "bonus",
            "destination_system": "PayrollSystem1",
            "is_active": True
        }
    ),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Create a new earnings code for use in integrations.
    
    This endpoint allows users to define a new earnings code that represents a 
    specific type of compensation or time off in a destination payroll or HR system.
    Earnings codes serve as the foundation for earnings mappings, enabling source
    system data to be correctly categorized and processed in the destination system.
    
    When creating an earnings code, users specify:
    * Code - The unique identifier used in the system (e.g., "BONUS")
    * Name - Human-readable name (e.g., "Bonus Payment")
    * Description - Detailed explanation of the code's purpose
    * Type - Category of earnings (hourly, salary, bonus, commission, time_off)
    * Destination system - The payroll or HR system this code belongs to
    * Active status - Whether the code should be available for use
    
    Validation rules:
    * Codes must be unique within a tenant and destination system
    * Codes should follow the destination system's formatting requirements
      (typically uppercase with only letters, numbers, and underscores)
    * Type must be one of the supported categories
    * Destination system must be a valid system name
    
    The earnings code is automatically associated with the user's tenant, ensuring
    proper data isolation in multi-tenant environments.
    
    The response includes the created earnings code with system-generated
    fields like ID and timestamps.
    
    Earnings codes can then be used in earnings mappings to define how source
    system codes should be translated during integration execution.
    """
    # Additional validation could be added here
    created = integration_service.create_earnings_code(code, current_user.tenant_id)
    return created


@router.put(
    "/earnings/codes/{code_id}", 
    response_model=EarningsCode,
    summary="Update earnings code",
    description="Update an existing earnings code",
    tags=["integration-earnings"],
    responses={
        200: {
            "description": "Earnings code successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 2,
                        "code": "OT",
                        "name": "Overtime Pay",
                        "description": "Updated description for overtime earnings at 1.5x rate",
                        "type": "hourly",
                        "destination_system": "PayrollSystem1",
                        "tenant_id": "tenant-1",
                        "is_active": True,
                        "created_at": "2025-02-01T10:05:00Z",
                        "updated_at": "2025-03-30T18:15:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid input data",
            "content": {
                "application/json": {
                    "examples": {
                        "invalid_type": {
                            "summary": "Invalid type",
                            "value": {"detail": "Invalid earnings type. Must be one of: hourly, salary, bonus, commission, time_off"}
                        },
                        "invalid_code_format": {
                            "summary": "Invalid code format",
                            "value": {"detail": "Code must be uppercase and contain only letters, numbers, and underscores"}
                        }
                    }
                }
            }
        },
        404: {
            "description": "Earnings code not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Earnings code not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this earnings code",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to modify this earnings code"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def update_earnings_code(
    code: EarningsCodeUpdate = Body(
        ...,
        description="Earnings code data to update",
        example={
            "name": "Overtime Pay",
            "description": "Updated description for overtime earnings at 1.5x rate"
        }
    ),
    code_id: int = Path(..., gt=0, description="The ID of the earnings code to update"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Update an existing earnings code.
    
    This endpoint allows users to modify the properties of an existing earnings code.
    The update can be partial - only the provided fields will be updated, while
    others remain unchanged.
    
    Users can update:
    * Code - The unique identifier (though changing this is generally discouraged)
    * Name - Human-readable name
    * Description - Detailed explanation of the code's purpose
    * Type - Category of earnings
    * Destination system - The payroll or HR system this code belongs to
    * Active status - Whether the code is available for use
    
    Validation rules:
    * If changing the code, it must remain unique within the tenant and destination system
    * Codes should follow the destination system's formatting requirements
    * Type must be one of the supported categories
    * Destination system must be a valid system name
    
    Special considerations:
    * Code changes should be approached with caution as they may affect existing
      earnings mappings and integration configurations
    * Changing the destination system may invalidate existing mappings
    * Deactivating a code (setting is_active to false) will not automatically
      update or deactivate related mappings
    
    Access control ensures that users can only update earnings codes belonging
    to their tenant, while administrators can update codes for any tenant.
    
    The response includes the complete updated earnings code with all current
    field values, including those that weren't modified in this request.
    
    If the earnings code doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to access the code, a 403 Forbidden
    response is returned.
    If the update data is invalid, a 400 Bad Request response is returned.
    """
    # Tenant access is enforced within the service
    updated = integration_service.update_earnings_code(code_id, code, current_user.tenant_id, current_user.role.value)
    if updated is None:
        raise HTTPException(status_code=404, detail="Earnings code not found")
    return updated


# Dataset management endpoints
@router.get(
    "/{integration_id}/datasets", 
    response_model=List[Dataset],
    summary="Get integration datasets",
    description="Retrieve datasets associated with a specific integration",
    tags=["integration-datasets"],
    responses={
        200: {
            "description": "List of datasets associated with the integration",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "name": "Employee Records",
                            "description": "Core employee data including demographics and basic employment details",
                            "type": "structured",
                            "format": "json",
                            "source_system": "HRIS",
                            "created_at": "2025-02-15T10:30:00Z",
                            "updated_at": "2025-03-10T14:45:00Z",
                            "fields": [
                                {
                                    "name": "employee_id",
                                    "type": "string",
                                    "required": True,
                                    "description": "Unique employee identifier"
                                },
                                {
                                    "name": "first_name",
                                    "type": "string",
                                    "required": True,
                                    "description": "Employee first name"
                                },
                                {
                                    "name": "last_name",
                                    "type": "string",
                                    "required": True,
                                    "description": "Employee last name"
                                }
                            ]
                        },
                        {
                            "id": 2,
                            "name": "Salary Information",
                            "description": "Employee compensation data including salary, bonuses, and adjustments",
                            "type": "structured",
                            "format": "json",
                            "source_system": "Payroll",
                            "created_at": "2025-02-20T09:15:00Z",
                            "updated_at": "2025-03-15T11:20:00Z",
                            "fields": [
                                {
                                    "name": "employee_id",
                                    "type": "string",
                                    "required": True,
                                    "description": "Unique employee identifier"
                                },
                                {
                                    "name": "salary",
                                    "type": "number",
                                    "required": True,
                                    "description": "Annual base salary"
                                },
                                {
                                    "name": "currency",
                                    "type": "string",
                                    "required": True,
                                    "description": "Salary currency code"
                                }
                            ]
                        }
                    ]
                }
            }
        },
        404: {
            "description": "Integration not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Integration not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to access this integration's datasets"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def get_integration_datasets(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to get datasets for"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Retrieve datasets associated with a specific integration.
    
    This endpoint returns the list of datasets that are currently associated with
    an integration. Datasets define the structure and format of data that can be
    processed by the integration. They include metadata about the data fields,
    their types, and relationships.
    
    Datasets are used by integrations to:
    * Define field mapping sources and destinations
    * Validate data formats during transformation
    * Document the data structure for users
    * Enable schema discovery and auto-mapping
    
    Each dataset includes:
    * Basic identification (ID, name, description)
    * Format information (type, format, source system)
    * Creation and update timestamps
    * Field definitions (name, type, requirements, descriptions)
    
    This endpoint is useful for understanding what data an integration is configured
    to process and can be used before setting up field mappings to ensure proper
    data transformation.
    
    Access control ensures that users can only view datasets for integrations
    that belong to their tenant, while administrators can view datasets for
    any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the user doesn't have permission to access the integration, a 403 Forbidden
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this integration's datasets")
    
    datasets = integration_service.get_integration_datasets(integration_id)
    return datasets


@router.post(
    "/{integration_id}/datasets/{dataset_id}", 
    status_code=204,
    summary="Associate dataset with integration",
    description="Associate an existing dataset with a specific integration",
    tags=["integration-datasets"],
    responses={
        204: {
            "description": "Dataset successfully associated with the integration"
        },
        404: {
            "description": "Integration or dataset not found, or dataset already associated",
            "content": {
                "application/json": {
                    "examples": {
                        "integration_not_found": {
                            "summary": "Integration not found",
                            "value": {"detail": "Integration not found"}
                        },
                        "dataset_not_found": {
                            "summary": "Dataset not found or already associated",
                            "value": {"detail": "Dataset not found or already associated"}
                        }
                    }
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to modify this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def associate_dataset(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to associate the dataset with"),
    dataset_id: int = Path(..., gt=0, description="The ID of the dataset to associate with the integration"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Associate an existing dataset with a specific integration.
    
    This endpoint creates a relationship between an integration and a dataset,
    enabling the integration to use the dataset's schema for field mappings and
    data validation. A single integration can be associated with multiple datasets
    to support complex data transformations across different data structures.
    
    Common use cases for dataset association include:
    * Defining source data structures for field mappings
    * Setting up destination schemas for validation
    * Enabling automatic field discovery
    * Supporting multi-dataset transformations
    
    The association is bi-directional, allowing both:
    * Finding all datasets used by an integration (via GET /integrations/{id}/datasets)
    * Finding all integrations using a specific dataset (via admin endpoints)
    
    This endpoint only creates the association; it does not modify either the
    integration or the dataset. Both entities must exist prior to creating
    the association.
    
    A successful association returns a 204 No Content response with no body.
    
    Access control ensures that users can only associate datasets with 
    integrations that belong to their tenant, while administrators can create
    associations for any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the dataset doesn't exist or is already associated with the integration,
    a 404 Not Found response is returned with the appropriate error message.
    If the user doesn't have permission to modify the integration, a 403 Forbidden
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to modify this integration")
    
    success = integration_service.associate_dataset(integration_id, dataset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dataset not found or already associated")


@router.delete(
    "/{integration_id}/datasets/{dataset_id}", 
    status_code=204,
    summary="Disassociate dataset from integration",
    description="Remove dataset association from a specific integration",
    tags=["integration-datasets"],
    responses={
        204: {
            "description": "Dataset successfully disassociated from the integration"
        },
        404: {
            "description": "Integration not found or dataset not associated",
            "content": {
                "application/json": {
                    "examples": {
                        "integration_not_found": {
                            "summary": "Integration not found",
                            "value": {"detail": "Integration not found"}
                        },
                        "dataset_not_associated": {
                            "summary": "Dataset not associated",
                            "value": {"detail": "Dataset not associated with this integration"}
                        }
                    }
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have access to this integration",
            "content": {
                "application/json": {
                    "example": {"detail": "You don't have permission to modify this integration"}
                }
            }
        },
        401: {
            "description": "Unauthorized - JWT token is missing or invalid",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        },
        409: {
            "description": "Conflict - Dataset cannot be disassociated due to dependencies",
            "content": {
                "application/json": {
                    "example": {"detail": "Cannot disassociate dataset because it is used by active field mappings"}
                }
            }
        }
    }
)
async def disassociate_dataset(
    integration_id: int = Path(..., gt=0, description="The ID of the integration to disassociate the dataset from"),
    dataset_id: int = Path(..., gt=0, description="The ID of the dataset to disassociate from the integration"),
    current_user: DbUser = Depends(get_current_active_user),
    integration_service: IntegrationService = Depends(get_integration_service)
):
    """
    Remove dataset association from a specific integration.
    
    This endpoint removes the relationship between an integration and a dataset,
    preventing the integration from using the dataset's schema for field mappings
    and data validation. Disassociating a dataset does not delete the dataset itself;
    it only removes the link between the dataset and the integration.
    
    Disassociating a dataset from an integration may have implications for:
    * Field mappings that reference fields from the dataset
    * Data validation during integration execution
    * Automatic field discovery
    
    Important considerations before disassociating a dataset:
    * Verify that no active field mappings depend on the dataset
    * Ensure any transformation logic doesn't rely on the dataset's schema
    * Consider updating integration documentation to reflect the change
    
    A successful disassociation returns a 204 No Content response with no body.
    
    The system may prevent disassociation if the dataset is in use by active
    field mappings or other integration components. In such cases, a 409 Conflict
    response will be returned.
    
    Access control ensures that users can only disassociate datasets from 
    integrations that belong to their tenant, while administrators can remove
    associations for any integration.
    
    If the integration doesn't exist, a 404 Not Found response is returned.
    If the dataset is not associated with the integration, a 404 Not Found
    response is returned with the appropriate error message.
    If the user doesn't have permission to modify the integration, a 403 Forbidden
    response is returned.
    """
    # Check if integration exists and user has access
    existing = integration_service.get_integration(integration_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    # Check tenant access (admins can access all)
    if current_user.role.value != "admin" and existing.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="You don't have permission to modify this integration")
    
    success = integration_service.disassociate_dataset(integration_id, dataset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dataset not associated with this integration")