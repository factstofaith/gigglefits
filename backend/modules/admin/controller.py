"""
Admin Controllers

This module defines the API routes for admin functionality in the TAP platform.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Security, BackgroundTasks, Body
from sqlalchemy.orm import Session
from datetime import datetime

from core.auth import get_current_active_user, oauth2_scheme
from db.base import get_db_session as get_db
from db.models import User as DbUser
from utils.api.models import create_response, create_paginated_response, create_error_response, StandardResponse, create_standard_response

from .models import (
    SuperUserRole,
    Application,
    ApplicationCreate,
    ApplicationUpdate,
    Dataset,
    DatasetCreate,
    DatasetUpdate,
    Release,
    ReleaseCreate,
    ReleaseUpdate,
    TenantApplicationAssociation,
    TenantDatasetAssociation,
    Webhook,
    WebhookCreate,
    WebhookUpdate,
    WebhookLog,
    WebhookTestRequest,
    WebhookTestResponse,
    WebhookEventType,
    SchemaDiscoveryMethod,
    DatasetField,
    Tenant,
    TenantCreate,
    TenantUpdate,
    TenantStatus,
    TenantTier
)
from .service import AdminService

# Create router for admin endpoints
router = APIRouter(prefix="/api/admin")

# Dependency to get admin service
def get_admin_service(db: Session = Depends(get_db)):
    """Get admin service instance with DB session"""
    return AdminService(db)

# Dependency to ensure super admin access
async def require_super_admin(current_user: DbUser = Depends(get_current_active_user)):
    """Verify that the current user is a super admin"""
    if current_user.role.value != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Only super admins can access this endpoint"
        )
    return current_user

# Helper function to create standardized responses
def standardize_response(data, skip=0, limit=10, total=None):
    """Helper function to create standardized responses"""
    # For collections with pagination
    if isinstance(data, list) and total is not None:
        return create_paginated_response(items=data, total=total, skip=skip, limit=limit)
    # For single items or collections without pagination
    return create_response(data=data)

# Application endpoints
@router.get("/applications", 
    response_model=List[Application],
    summary="Get all applications",
    description="Retrieve a list of all registered applications with pagination and optional status filtering",
    tags=["admin"],
    responses={
        200: {
            "description": "List of applications successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "name": "ERP System",
                            "api_key": "********",
                            "description": "Enterprise Resource Planning System",
                            "status": "active",
                            "created_at": "2025-01-15T10:30:00Z",
                            "updated_at": "2025-03-20T14:45:00Z",
                            "created_by": "user-uuid-1"
                        },
                        {
                            "id": 2,
                            "name": "HRIS Platform",
                            "api_key": "********",
                            "description": "Human Resources Information System",
                            "status": "active",
                            "created_at": "2025-02-10T09:15:00Z",
                            "updated_at": "2025-03-15T11:20:00Z",
                            "created_by": "user-uuid-1"
                        }
                    ]
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_applications(
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    status: Optional[str] = Query(None, description="Filter applications by status (active, inactive, etc.)")
):
    """
    Retrieve a list of all registered applications in the platform.
    
    This endpoint allows super administrators to:
    * List all registered applications
    * Filter applications by status
    * Paginate through the results
    
    The response includes basic application information including IDs, 
    names, statuses, and timestamps. API keys are always masked for security.
    
    This operation requires super admin privileges.
    """
    return admin_service.get_applications(skip, limit, status)

@router.post(
    "/applications", 
    response_model=Application, 
    status_code=201,
    summary="Create a new application",
    description="Register a new application in the system with the provided details",
    tags=["admin"],
    responses={
        201: {
            "description": "Application successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": 3,
                        "name": "CRM System",
                        "api_key": "api_3fab42e8fc73415d9b2e0a1234567890",
                        "description": "Customer Relationship Management System",
                        "status": "active",
                        "created_at": "2025-03-25T16:30:00Z",
                        "updated_at": "2025-03-25T16:30:00Z",
                        "created_by": "user-uuid-1"
                    }
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Application with this name already exists"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def create_application(
    application: ApplicationCreate = Body(..., description="Application details to create", 
        example={
            "name": "CRM System",
            "description": "Customer Relationship Management System",
            "status": "active"
        }),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Register a new application in the system.
    
    This endpoint allows super administrators to create new application 
    registrations in the platform. The system will:
    
    * Validate the application details
    * Generate a unique API key for the application
    * Record the creator's information
    * Set the application's initial status
    
    The created application will be available for tenant association
    and can be used for API access with the generated API key.
    
    This operation requires super admin privileges.
    """
    return admin_service.create_application(application, current_user.id)

@router.get(
    "/applications/{application_id}", 
    response_model=Application,
    summary="Get application details",
    description="Retrieve detailed information about a specific application by its ID",
    tags=["admin"],
    responses={
        200: {
            "description": "Application details successfully retrieved",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "ERP System",
                        "api_key": "********",
                        "description": "Enterprise Resource Planning System",
                        "status": "active",
                        "created_at": "2025-01-15T10:30:00Z",
                        "updated_at": "2025-03-20T14:45:00Z",
                        "created_by": "user-uuid-1"
                    }
                }
            }
        },
        404: {
            "description": "Application not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Application not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_application(
    application_id: int = Path(..., gt=0, description="The unique ID of the application to retrieve"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Retrieve detailed information about a specific application by its ID.
    
    This endpoint provides super administrators with access to the full
    details of an application, including:
    
    * Basic information (name, description, status)
    * API key (masked for security)
    * Creation and update timestamps
    * Creator information
    
    If the application ID does not exist, a 404 Not Found response is returned.
    
    This operation requires super admin privileges.
    """
    application = admin_service.get_application(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@router.put(
    "/applications/{application_id}", 
    response_model=Application,
    summary="Update an application",
    description="Update an existing application with the provided data",
    tags=["admin"],
    responses={
        200: {
            "description": "Application successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "ERP System Pro",
                        "type": "api",
                        "description": "Enhanced Enterprise Resource Planning System",
                        "logo_url": "https://example.com/logos/erp-logo.png",
                        "auth_type": "oauth2",
                        "connection_parameters": [
                            {
                                "name": "api_url",
                                "description": "Base API URL",
                                "required": True,
                                "type": "string",
                                "sensitive": False
                            }
                        ],
                        "documentation_url": "https://docs.example.com/erp-api",
                        "support_url": "https://support.example.com/erp-api",
                        "status": "active",
                        "is_public": False,
                        "created_at": "2025-01-15T10:30:00Z",
                        "updated_at": "2025-03-26T15:45:00Z",
                        "created_by": "user-uuid-1"
                    }
                }
            }
        },
        404: {
            "description": "Application not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Application not found"}
                }
            }
        },
        400: {
            "description": "Invalid input data",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "name"],
                                "msg": "ensure this value has at least 3 characters",
                                "type": "value_error.any_str.min_length",
                                "ctx": {"limit_value": 3}
                            }
                        ]
                    }
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
                }
            }
        }
    }
)
async def update_application(
    application: ApplicationUpdate = Body(..., description="Application data to update"),
    application_id: int = Path(..., gt=0, description="The ID of the application to update"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Update an existing application with the provided data.
    
    This endpoint allows super administrators to update the properties of an
    existing application. The update can be partial - only the provided fields
    will be updated.
    
    The updated application data will be validated according to the platform's
    constraints for application names, URLs, etc.
    
    If the application ID does not exist, a 404 Not Found response is returned.
    
    This operation requires super admin privileges.
    """
    updated = admin_service.update_application(application_id, application)
    if not updated:
        raise HTTPException(status_code=404, detail="Application not found")
    return updated

@router.delete("/applications/{application_id}", status_code=204)
async def delete_application(
    application_id: int = Path(..., gt=0),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Delete an application
    """
    success = admin_service.delete_application(application_id)
    if not success:
        raise HTTPException(status_code=404, detail="Application not found")

@router.post("/applications/{application_id}/discover-schema", response_model=List[DatasetField])
async def discover_application_schema(
    application_id: int = Path(..., gt=0),
    method: SchemaDiscoveryMethod = Query(..., description="Method to use for schema discovery"),
    discovery_config: Optional[Dict[str, Any]] = None,
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Discover the schema for an application using the specified method
    
    This endpoint will attempt to automatically discover the fields/schema
    for an application using one of several methods:
    
    - MANUAL: No automatic discovery, fields will be defined manually
    - API_ENDPOINT: Use an API endpoint to discover schema
    - SWAGGER: Use Swagger/OpenAPI specification
    - DATABASE: Use database introspection
    - FILE_SAMPLE: Use file sample
    - AI_INFERENCE: Use AI to infer schema from samples
    
    Different methods require different configuration parameters,
    which should be provided in the discovery_config.
    """
    # Check if application exists
    application = admin_service.get_application(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Discover schema
    fields = admin_service.discover_application_schema(
        application_id, 
        method, 
        discovery_config
    )
    
    # Return discovered fields
    return fields

@router.post("/applications/{application_id}/create-dataset-from-schema", response_model=Dataset)
async def create_dataset_from_schema(
    application_id: int = Path(..., gt=0),
    name: str = Query(..., description="Name for the new dataset"),
    description: str = Query("", description="Description for the new dataset"),
    fields: List[DatasetField] = Body(..., description="Fields discovered from schema"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Create a new dataset from a discovered schema
    
    This endpoint creates a new dataset using fields discovered via the
    discover-schema endpoint.
    """
    # Check if application exists
    application = admin_service.get_application(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Create dataset
    dataset = admin_service.create_dataset_from_schema(
        application_id,
        name,
        description,
        fields,
        current_user.id
    )
    
    # Return created dataset
    return dataset

# Dataset endpoints
@router.get(
    "/datasets", 
    response_model=List[Dataset],
    summary="Get all datasets",
    description="Retrieve a list of all datasets with pagination and optional filtering by status or application ID",
    tags=["admin"],
    responses={
        200: {
            "description": "List of datasets successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "name": "Customer Data",
                            "description": "Core customer data with personal and contact information",
                            "schema": [
                                {
                                    "name": "customer_id",
                                    "description": "Unique identifier for the customer",
                                    "type": "string",
                                    "required": True,
                                    "is_primary_key": True
                                },
                                {
                                    "name": "email",
                                    "description": "Customer's email address",
                                    "type": "string",
                                    "required": True,
                                    "format": "email"
                                }
                            ],
                            "status": "active",
                            "source_application_id": 1,
                            "created_at": "2025-01-20T14:30:00Z",
                            "updated_at": "2025-03-10T09:45:00Z",
                            "created_by": "user-uuid-12345"
                        },
                        {
                            "id": 2,
                            "name": "Order Data",
                            "description": "Customer order history and details",
                            "schema": [
                                {
                                    "name": "order_id",
                                    "description": "Unique identifier for the order",
                                    "type": "string",
                                    "required": True,
                                    "is_primary_key": True
                                }
                            ],
                            "status": "active",
                            "source_application_id": 1,
                            "created_at": "2025-02-05T11:20:00Z",
                            "updated_at": "2025-03-15T13:40:00Z",
                            "created_by": "user-uuid-12345"
                        }
                    ]
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_datasets(
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    status: Optional[str] = Query(None, description="Filter datasets by status (active, inactive, etc.)"),
    application_id: Optional[int] = Query(None, description="Filter datasets by source application ID")
):
    """
    Retrieve a list of all datasets in the platform.
    
    This endpoint allows super administrators to:
    * List all registered datasets
    * Filter datasets by status or source application
    * Paginate through the results
    
    The response includes the full dataset information including schema details.
    Datasets represent the data structures available for integration flows
    and are typically associated with a source application.
    
    This operation requires super admin privileges.
    """
    return admin_service.get_datasets(skip, limit, status, application_id)

@router.post(
    "/datasets", 
    response_model=Dataset, 
    status_code=201,
    summary="Create a new dataset",
    description="Register a new dataset in the system with the provided schema and details",
    tags=["admin"],
    responses={
        201: {
            "description": "Dataset successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": 3,
                        "name": "Product Catalog",
                        "description": "Complete product catalog with details and pricing",
                        "schema": [
                            {
                                "name": "product_id",
                                "description": "Unique identifier for the product",
                                "type": "string",
                                "required": True,
                                "is_primary_key": True,
                                "example_value": "PROD-12345",
                                "validation_pattern": "^PROD-[0-9]{5}$"
                            },
                            {
                                "name": "name",
                                "description": "Product name",
                                "type": "string",
                                "required": True
                            },
                            {
                                "name": "price",
                                "description": "Product price",
                                "type": "number",
                                "required": True
                            },
                            {
                                "name": "category",
                                "description": "Product category",
                                "type": "string",
                                "required": False
                            }
                        ],
                        "status": "active",
                        "discovery_method": "manual",
                        "source_application_id": 1,
                        "created_at": "2025-03-26T16:30:00Z",
                        "updated_at": "2025-03-26T16:30:00Z",
                        "created_by": "user-uuid-12345"
                    }
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Dataset with this name already exists"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def create_dataset(
    dataset: DatasetCreate = Body(
        ..., 
        description="Dataset details to create",
        example={
            "name": "Product Catalog",
            "description": "Complete product catalog with details and pricing",
            "schema": [
                {
                    "name": "product_id",
                    "description": "Unique identifier for the product",
                    "type": "string",
                    "required": True,
                    "is_primary_key": True
                },
                {
                    "name": "name",
                    "description": "Product name",
                    "type": "string",
                    "required": True
                }
            ],
            "status": "active",
            "discovery_method": "manual",
            "source_application_id": 1
        }
    ),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Register a new dataset in the system.
    
    This endpoint allows super administrators to create new dataset 
    registrations in the platform. Datasets define the data structure
    available for integration flows and transformations.
    
    The dataset must include:
    * A unique name within the platform
    * A schema that defines the fields and their data types
    * An association with a source application (optional)
    
    The schema defines the structure of the data, including field names,
    data types, constraints, and relationships. Each field can specify
    whether it's required, a primary key, and include validation patterns.
    
    This operation requires super admin privileges.
    """
    return admin_service.create_dataset(dataset, current_user.id)

@router.get(
    "/datasets/{dataset_id}", 
    response_model=Dataset,
    summary="Get dataset details",
    description="Retrieve detailed information about a specific dataset by its ID",
    tags=["admin"],
    responses={
        200: {
            "description": "Dataset details successfully retrieved",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Customer Data",
                        "description": "Core customer data with personal and contact information",
                        "schema": [
                            {
                                "name": "customer_id",
                                "description": "Unique identifier for the customer",
                                "type": "string",
                                "required": True,
                                "is_primary_key": True,
                                "example_value": "CUST-12345",
                                "validation_pattern": "^CUST-[0-9]{5}$"
                            },
                            {
                                "name": "first_name",
                                "description": "Customer's first name",
                                "type": "string",
                                "required": True
                            },
                            {
                                "name": "last_name",
                                "description": "Customer's last name",
                                "type": "string",
                                "required": True
                            },
                            {
                                "name": "email",
                                "description": "Customer's email address",
                                "type": "string",
                                "required": True,
                                "format": "email"
                            },
                            {
                                "name": "date_of_birth",
                                "description": "Customer's date of birth",
                                "type": "date",
                                "required": False
                            }
                        ],
                        "status": "active",
                        "discovery_method": "manual",
                        "source_application_id": 1,
                        "created_at": "2025-01-20T14:30:00Z",
                        "updated_at": "2025-03-10T09:45:00Z",
                        "created_by": "user-uuid-12345"
                    }
                }
            }
        },
        404: {
            "description": "Dataset not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Dataset not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_dataset(
    dataset_id: int = Path(..., gt=0, description="The unique ID of the dataset to retrieve"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Retrieve detailed information about a specific dataset by its ID.
    
    This endpoint provides super administrators with access to the full
    details of a dataset, including:
    
    * Basic information (name, description, status)
    * Complete schema definition with all fields
    * Source application association
    * Creation and update timestamps
    * Creator information
    
    The schema contains the detailed structure of the dataset, including
    field definitions with data types, constraints, and metadata.
    
    If the dataset ID does not exist, a 404 Not Found response is returned.
    
    This operation requires super admin privileges.
    """
    dataset = admin_service.get_dataset(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

@router.put("/datasets/{dataset_id}", response_model=Dataset)
async def update_dataset(
    dataset: DatasetUpdate,
    dataset_id: int = Path(..., gt=0),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Update an existing dataset
    """
    updated = admin_service.update_dataset(dataset_id, dataset)
    if not updated:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return updated

@router.delete("/datasets/{dataset_id}", status_code=204)
async def delete_dataset(
    dataset_id: int = Path(..., gt=0),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Delete a dataset
    """
    success = admin_service.delete_dataset(dataset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dataset not found")

# Release endpoints
@router.get(
    "/releases", 
    response_model=List[Release],
    summary="Get all releases",
    description="Retrieve a list of all releases with pagination and optional status filtering",
    tags=["admin", "releases"],
    responses={
        200: {
            "description": "List of releases successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "name": "March 2025 Feature Release",
                            "description": "Release of new integration templates and dataset schemas",
                            "version": "1.8.0",
                            "status": "completed",
                            "release_notes": "Added 5 new integration templates and 12 dataset schemas for financial services",
                            "applications": [
                                {"id": 3, "name": "Financial Analytics API"},
                                {"id": 5, "name": "Payment Processing Service"}
                            ],
                            "datasets": [
                                {"id": 8, "name": "Transaction Records"},
                                {"id": 9, "name": "Customer Financial Profiles"}
                            ],
                            "target_tenants": [
                                {"id": "tenant-1", "name": "Acme Corp"},
                                {"id": "tenant-3", "name": "Financial Services Inc"}
                            ],
                            "scheduled_at": "2025-03-15T02:00:00Z",
                            "executed_at": "2025-03-15T02:05:22Z",
                            "completed_at": "2025-03-15T02:18:45Z",
                            "created_by": "user-uuid-12345",
                            "created_at": "2025-03-10T14:30:00Z",
                            "updated_at": "2025-03-15T02:20:00Z"
                        },
                        {
                            "id": 2,
                            "name": "April 2025 Security Update",
                            "description": "Security enhancements and compliance updates",
                            "version": "1.8.1",
                            "status": "scheduled",
                            "release_notes": "Enhanced encryption for sensitive fields and updated compliance certifications",
                            "applications": [
                                {"id": 1, "name": "Core Integration Platform"},
                                {"id": 2, "name": "Identity Management System"}
                            ],
                            "datasets": [],
                            "target_tenants": [
                                {"id": "tenant-1", "name": "Acme Corp"},
                                {"id": "tenant-2", "name": "Beta Industries"},
                                {"id": "tenant-3", "name": "Financial Services Inc"}
                            ],
                            "scheduled_at": "2025-04-10T01:00:00Z",
                            "executed_at": None,
                            "completed_at": None,
                            "created_by": "user-uuid-12345",
                            "created_at": "2025-03-20T10:15:00Z",
                            "updated_at": "2025-03-25T16:30:00Z"
                        }
                    ]
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_releases(
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    status: Optional[str] = Query(None, description="Filter releases by status (draft, scheduled, in_progress, completed, failed, rolled_back)")
):
    """
    Retrieve a list of all releases with pagination and optional status filtering.
    
    This endpoint allows super administrators to:
    * List all platform releases
    * Filter releases by status (draft, scheduled, in_progress, completed, failed, rolled_back)
    * Paginate through the results
    
    Releases in the TAP platform represent planned deployments of applications, 
    datasets, and other resources to tenant environments. They provide a structured 
    way to manage and track changes to the platform.
    
    Each release includes:
    * Basic information (name, description, version)
    * Status tracking (draft, scheduled, in_progress, completed, failed, rolled_back)
    * Associated resources (applications, datasets)
    * Target tenants that will receive the release
    * Scheduling and execution timestamps
    * Release notes explaining changes
    
    Releases enable administrators to:
    * Plan and schedule platform updates
    * Target specific tenant environments
    * Track release history and status
    * Maintain version control of deployed resources
    * Roll back problematic releases when necessary
    
    This operation requires super admin privileges.
    """
    return admin_service.get_releases(skip, limit, status)

@router.post(
    "/releases", 
    response_model=Release, 
    status_code=201,
    summary="Create a new release",
    description="Register a new planned release of applications and datasets to tenant environments",
    tags=["admin", "releases"],
    responses={
        201: {
            "description": "Release successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": 3,
                        "name": "May 2025 Productivity Enhancement",
                        "description": "Release of new productivity tools and reporting dashboards",
                        "version": "1.9.0",
                        "status": "draft",
                        "release_notes": "Introducing advanced reporting capabilities and productivity tools",
                        "applications": [
                            {"id": 4, "name": "Reporting Dashboard"},
                            {"id": 7, "name": "Productivity Tools Suite"}
                        ],
                        "datasets": [
                            {"id": 12, "name": "Productivity Metrics"},
                            {"id": 15, "name": "Reporting Templates"}
                        ],
                        "target_tenants": [
                            {"id": "tenant-1", "name": "Acme Corp"},
                            {"id": "tenant-4", "name": "Enterprise Solutions"}
                        ],
                        "scheduled_at": "2025-05-12T01:00:00Z",
                        "executed_at": None,
                        "completed_at": None,
                        "created_by": "user-uuid-12345",
                        "created_at": "2025-03-27T16:30:00Z",
                        "updated_at": "2025-03-27T16:30:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Release with this version already exists"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def create_release(
    release: ReleaseCreate = Body(
        ..., 
        description="Release details to create",
        example={
            "name": "May 2025 Productivity Enhancement",
            "description": "Release of new productivity tools and reporting dashboards",
            "version": "1.9.0",
            "status": "draft",
            "release_notes": "Introducing advanced reporting capabilities and productivity tools",
            "application_ids": [4, 7],
            "dataset_ids": [12, 15],
            "target_tenant_ids": ["tenant-1", "tenant-4"],
            "scheduled_at": "2025-05-12T01:00:00Z"
        }
    ),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Register a new planned release of applications and datasets to tenant environments.
    
    This endpoint allows super administrators to create a new release plan for
    deploying applications, datasets, and other resources to tenant environments.
    
    A release serves as a container for:
    * A group of applications and datasets to be deployed together
    * A list of target tenant environments to receive the updates
    * Version information and release notes
    * Scheduling information for when the release should be executed
    
    The release creation process:
    * Validates that all specified applications and datasets exist
    * Verifies that target tenants are valid
    * Ensures the release version is unique
    * Creates a new release record with status 'draft'
    * Associates applications, datasets, and tenants with the release
    
    Once created, a release remains in draft status until explicitly scheduled
    or executed. Releases in draft status can be modified or deleted.
    
    This operation requires super admin privileges.
    """
    return admin_service.create_release(release, current_user.id)

@router.get(
    "/releases/{release_id}", 
    response_model=Release,
    summary="Get release details",
    description="Retrieve detailed information about a specific release by its ID",
    tags=["admin", "releases"],
    responses={
        200: {
            "description": "Release details successfully retrieved",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "March 2025 Feature Release",
                        "description": "Release of new integration templates and dataset schemas",
                        "version": "1.8.0",
                        "status": "completed",
                        "release_notes": "Added 5 new integration templates and 12 dataset schemas for financial services",
                        "applications": [
                            {"id": 3, "name": "Financial Analytics API"},
                            {"id": 5, "name": "Payment Processing Service"}
                        ],
                        "datasets": [
                            {"id": 8, "name": "Transaction Records"},
                            {"id": 9, "name": "Customer Financial Profiles"}
                        ],
                        "target_tenants": [
                            {"id": "tenant-1", "name": "Acme Corp"},
                            {"id": "tenant-3", "name": "Financial Services Inc"}
                        ],
                        "scheduled_at": "2025-03-15T02:00:00Z",
                        "executed_at": "2025-03-15T02:05:22Z",
                        "completed_at": "2025-03-15T02:18:45Z",
                        "execution_details": {
                            "duration_seconds": 810,
                            "success_count": 2,
                            "failure_count": 0,
                            "tenant_deployment_status": {
                                "tenant-1": "success",
                                "tenant-3": "success"
                            },
                            "logs": [
                                {"timestamp": "2025-03-15T02:05:22Z", "level": "info", "message": "Release execution started"},
                                {"timestamp": "2025-03-15T02:18:42Z", "level": "info", "message": "Release execution completed successfully"}
                            ]
                        },
                        "created_by": "user-uuid-12345",
                        "created_at": "2025-03-10T14:30:00Z",
                        "updated_at": "2025-03-15T02:20:00Z"
                    }
                }
            }
        },
        404: {
            "description": "Release not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Release not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_release(
    release_id: int = Path(..., gt=0, description="The unique ID of the release to retrieve"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Retrieve detailed information about a specific release by its ID.
    
    This endpoint provides super administrators with access to the full
    details of a release, including:
    
    * Basic information (name, description, version, status)
    * Associated resources (applications, datasets)
    * Target tenant environments
    * Scheduling and execution timestamps
    * Execution details (for completed releases)
    * Release notes and related documentation
    
    For releases that have been executed or completed, the response includes
    detailed execution information such as:
    * Execution duration
    * Success/failure counts
    * Tenant-specific deployment status
    * Execution logs and timestamps
    
    This detailed view allows administrators to:
    * Monitor release status
    * Review deployment results
    * Audit release history
    * Troubleshoot release failures
    * Plan future releases based on past performance
    
    If the release ID does not exist, a 404 Not Found response is returned.
    
    This operation requires super admin privileges.
    """
    release = admin_service.get_release(release_id)
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")
    return release

@router.put(
    "/releases/{release_id}", 
    response_model=Release,
    summary="Update a release",
    description="Update an existing release with the provided data",
    tags=["admin", "releases"],
    responses={
        200: {
            "description": "Release successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 2,
                        "name": "April 2025 Security & Performance Update",
                        "description": "Security enhancements, compliance updates, and performance improvements",
                        "version": "1.8.1",
                        "status": "scheduled",
                        "release_notes": "Enhanced encryption for sensitive fields, updated compliance certifications, and database performance optimizations",
                        "applications": [
                            {"id": 1, "name": "Core Integration Platform"},
                            {"id": 2, "name": "Identity Management System"},
                            {"id": 8, "name": "Database Optimization Module"}
                        ],
                        "datasets": [],
                        "target_tenants": [
                            {"id": "tenant-1", "name": "Acme Corp"},
                            {"id": "tenant-2", "name": "Beta Industries"},
                            {"id": "tenant-3", "name": "Financial Services Inc"}
                        ],
                        "scheduled_at": "2025-04-15T01:00:00Z", 
                        "executed_at": None,
                        "completed_at": None,
                        "created_by": "user-uuid-12345",
                        "created_at": "2025-03-20T10:15:00Z",
                        "updated_at": "2025-03-27T17:10:45Z"
                    }
                }
            }
        },
        404: {
            "description": "Release not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Release not found"}
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data or release state",
            "content": {
                "application/json": {
                    "example": {"detail": "Cannot update a release that has already been executed"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def update_release(
    release: ReleaseUpdate = Body(
        ..., 
        description="Release data to update",
        example={
            "name": "April 2025 Security & Performance Update",
            "description": "Security enhancements, compliance updates, and performance improvements",
            "release_notes": "Enhanced encryption for sensitive fields, updated compliance certifications, and database performance optimizations",
            "application_ids": [1, 2, 8],
            "target_tenant_ids": ["tenant-1", "tenant-2", "tenant-3"],
            "scheduled_at": "2025-04-15T01:00:00Z"
        }
    ),
    release_id: int = Path(..., gt=0, description="The ID of the release to update"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Update an existing release with the provided data.
    
    This endpoint allows super administrators to update the properties of an
    existing release. The update can be partial - only the provided fields
    will be updated.
    
    Release updates are subject to the following constraints:
    * Only releases in 'draft' or 'scheduled' status can be updated
    * Releases that have already been executed cannot be modified
    * The version number cannot be changed once set
    * Status transitions must follow the valid workflow (e.g., draft → scheduled)
    
    Updatable fields include:
    * Basic information (name, description, release notes)
    * Associated resources (applications, datasets)
    * Target tenant environments
    * Scheduling information
    * Status (within allowed transitions)
    
    When updating the list of applications, datasets, or target tenants,
    the provided IDs completely replace the existing associations.
    
    If the release ID does not exist, a 404 Not Found response is returned.
    If the release cannot be updated due to its current state, a 400 Bad Request
    response is returned with details about the constraint violation.
    
    This operation requires super admin privileges.
    """
    updated = admin_service.update_release(release_id, release)
    if not updated:
        raise HTTPException(status_code=404, detail="Release not found")
    return updated

@router.delete(
    "/releases/{release_id}", 
    status_code=204,
    summary="Delete a release",
    description="Permanently delete a release configuration",
    tags=["admin", "releases"],
    responses={
        204: {
            "description": "Release successfully deleted"
        },
        404: {
            "description": "Release not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Release not found"}
                }
            }
        },
        400: {
            "description": "Bad request - Release cannot be deleted",
            "content": {
                "application/json": {
                    "example": {"detail": "Cannot delete a release that has already been executed"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def delete_release(
    release_id: int = Path(..., gt=0, description="The ID of the release to delete"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Permanently delete a release configuration.
    
    This endpoint allows super administrators to remove a release from the platform.
    
    Release deletion is subject to the following constraints:
    * Only releases in 'draft' status can be deleted without restrictions
    * Scheduled releases can be deleted, which will cancel their scheduled execution
    * Releases that have already been executed cannot be deleted (they can only be rolled back)
    * Completed releases are preserved for audit and historical tracking purposes
    
    When a release is deleted:
    * The release record is permanently removed from the database
    * All associations with applications, datasets, and tenants are removed
    * Any scheduled execution is cancelled
    
    This operation is particularly useful for removing draft releases that are no longer
    needed or cancelling scheduled releases before they are executed.
    
    If the release ID does not exist, a 404 Not Found response is returned.
    If the release cannot be deleted due to its current state, a 400 Bad Request
    response is returned with details about the constraint violation.
    
    This operation requires super admin privileges.
    """
    # Check if release exists and is in a deletable state
    release = admin_service.get_release(release_id)
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")
    
    if release.status not in ["draft", "scheduled"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete a release in '{release.status}' status. Only draft or scheduled releases can be deleted."
        )
    
    # Proceed with deletion
    success = admin_service.delete_release(release_id)
    if not success:
        raise HTTPException(status_code=404, detail="Release not found")

@router.post(
    "/releases/{release_id}/execute", 
    status_code=202,
    summary="Execute a release",
    description="Execute a release to deploy applications and datasets to tenant environments",
    tags=["admin", "releases"],
    responses={
        202: {
            "description": "Release execution started successfully (asynchronous operation)",
            "content": {
                "application/json": {
                    "example": {
                        "status": "accepted",
                        "message": "Release execution started",
                        "release_id": 2,
                        "execution_id": "exec-98765",
                        "started_at": "2025-03-27T17:30:15Z",
                        "estimated_completion_time": "2025-03-27T17:45:00Z",
                        "execution_status_url": "/api/admin/releases/2/status"
                    }
                }
            }
        },
        404: {
            "description": "Release not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Release not found"}
                }
            }
        },
        400: {
            "description": "Bad request - Release cannot be executed",
            "content": {
                "application/json": {
                    "example": {"detail": "Release cannot be executed in 'completed' status"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def execute_release(
    release_id: int = Path(..., gt=0, description="The ID of the release to execute"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Execute a release to deploy applications and datasets to tenant environments.
    
    This endpoint allows super administrators to trigger the execution of a release,
    which deploys the associated applications and datasets to the target tenant
    environments.
    
    Release execution is an asynchronous operation that:
    * Updates the release status to 'in_progress'
    * Deploys applications and datasets to each target tenant
    * Tracks the deployment progress
    * Records execution logs and metrics
    * Updates the release status to 'completed' or 'failed' when finished
    
    Only releases in 'draft' or 'scheduled' status can be executed. Releases that
    have already been executed, are currently in progress, or have failed cannot
    be executed again without being reset or rolled back.
    
    Since execution happens asynchronously in the background, the response is
    immediate with a 202 Accepted status and includes tracking information.
    Administrators can check the status of the execution using the release
    status endpoint.
    
    If the release ID does not exist, a 404 Not Found response is returned.
    If the release cannot be executed due to its current state, a 400 Bad Request
    response is returned with details about the constraint violation.
    
    This operation requires super admin privileges.
    """
    release = admin_service.get_release(release_id)
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")
    
    # Check if release is in a valid state to execute
    if release.status not in ["draft", "scheduled"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Release cannot be executed in '{release.status}' status"
        )
    
    # Start the release process in the background
    background_tasks.add_task(
        admin_service.execute_release,
        release_id,
        current_user.id
    )
    
    # Return a more detailed response with tracking information
    execution_id = f"exec-{release_id}-{int(datetime.now(timezone.utc).timestamp())}"
    started_at = datetime.now(timezone.utc).isoformat() + "Z"
    
    # Estimate 15 minutes per tenant for completion
    tenant_count = len(release.target_tenants) if hasattr(release, 'target_tenants') and release.target_tenants else 1
    estimated_minutes = max(5, tenant_count * 15)  # Minimum 5 minutes, 15 minutes per tenant
    estimated_completion = (datetime.now(timezone.utc) + timedelta(minutes=estimated_minutes)).isoformat() + "Z"
    
    return {
        "status": "accepted", 
        "message": "Release execution started",
        "release_id": release_id,
        "execution_id": execution_id,
        "started_at": started_at,
        "estimated_completion_time": estimated_completion,
        "execution_status_url": f"/api/admin/releases/{release_id}/status"
    }

@router.post(
    "/releases/{release_id}/rollback", 
    status_code=202,
    summary="Rollback a release",
    description="Rollback a previously executed release to revert its changes",
    tags=["admin", "releases"],
    responses={
        202: {
            "description": "Release rollback started successfully (asynchronous operation)",
            "content": {
                "application/json": {
                    "example": {
                        "status": "accepted",
                        "message": "Release rollback started",
                        "release_id": 1,
                        "rollback_id": "rollback-12345",
                        "started_at": "2025-03-27T18:15:30Z",
                        "estimated_completion_time": "2025-03-27T18:30:00Z",
                        "rollback_status_url": "/api/admin/releases/1/rollback-status"
                    }
                }
            }
        },
        404: {
            "description": "Release not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Release not found"}
                }
            }
        },
        400: {
            "description": "Bad request - Release cannot be rolled back",
            "content": {
                "application/json": {
                    "example": {"detail": "Only completed releases can be rolled back. Current status: 'draft'"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def rollback_release(
    release_id: int = Path(..., gt=0, description="The ID of the release to rollback"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Rollback a previously executed release to revert its changes.
    
    This endpoint allows super administrators to rollback a completed release,
    which reverts the changes made during the release deployment. This is useful
    when a release has introduced problems or unintended consequences.
    
    Release rollback is an asynchronous operation that:
    * Updates the release status to 'rolling_back'
    * Removes deployed applications and datasets from the target tenants
    * Restores previous versions if available
    * Tracks the rollback progress
    * Records rollback logs and metrics
    * Updates the release status to 'rolled_back' when finished
    
    Only releases in 'completed' status can be rolled back. Releases in other
    states such as 'draft', 'scheduled', or already 'rolled_back' cannot be
    rolled back.
    
    The rollback process attempts to restore the tenant environments to their
    state before the release was executed. However, depending on the nature of
    the changes and the time elapsed since execution, a perfect rollback may not
    always be possible.
    
    Since rollback happens asynchronously in the background, the response is
    immediate with a 202 Accepted status and includes tracking information.
    Administrators can check the status of the rollback using the release
    rollback status endpoint.
    
    If the release ID does not exist, a 404 Not Found response is returned.
    If the release cannot be rolled back due to its current state, a 400 Bad Request
    response is returned with details about the constraint violation.
    
    This operation requires super admin privileges.
    """
    release = admin_service.get_release(release_id)
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")
    
    # Check if release is in a valid state to rollback
    if release.status != "completed":
        raise HTTPException(
            status_code=400, 
            detail=f"Only completed releases can be rolled back. Current status: '{release.status}'"
        )
    
    # Start the rollback process in the background
    background_tasks.add_task(
        admin_service.rollback_release,
        release_id,
        current_user.id
    )
    
    # Return a more detailed response with tracking information
    rollback_id = f"rollback-{release_id}-{int(datetime.now(timezone.utc).timestamp())}"
    started_at = datetime.now(timezone.utc).isoformat() + "Z"
    
    # Estimate 15 minutes per tenant for completion
    tenant_count = len(release.target_tenants) if hasattr(release, 'target_tenants') and release.target_tenants else 1
    estimated_minutes = max(5, tenant_count * 15)  # Minimum 5 minutes, 15 minutes per tenant
    estimated_completion = (datetime.now(timezone.utc) + timedelta(minutes=estimated_minutes)).isoformat() + "Z"
    
    return {
        "status": "accepted", 
        "message": "Release rollback started",
        "release_id": release_id,
        "rollback_id": rollback_id,
        "started_at": started_at,
        "estimated_completion_time": estimated_completion,
        "rollback_status_url": f"/api/admin/releases/{release_id}/rollback-status"
    }

# Tenant association endpoints
@router.get(
    "/tenants/{tenant_id}/applications", 
    response_model=List[Application],
    summary="Get tenant applications",
    description="Retrieve all applications associated with a specific tenant",
    tags=["admin"],
    responses={
        200: {
            "description": "List of tenant applications successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "name": "ERP System",
                            "type": "api",
                            "description": "Enterprise Resource Planning System",
                            "logo_url": "https://example.com/logos/erp-logo.png",
                            "auth_type": "oauth2",
                            "connection_parameters": [
                                {
                                    "name": "api_url",
                                    "description": "Base API URL",
                                    "required": True,
                                    "type": "string",
                                    "sensitive": False
                                }
                            ],
                            "documentation_url": "https://docs.example.com/erp-api",
                            "support_url": "https://support.example.com/erp-api",
                            "status": "active",
                            "is_public": False,
                            "created_at": "2025-01-15T10:30:00Z",
                            "updated_at": "2025-03-20T14:45:00Z",
                            "created_by": "user-uuid-12345"
                        },
                        {
                            "id": 3,
                            "name": "CRM System",
                            "type": "api",
                            "description": "Customer Relationship Management System",
                            "logo_url": "https://example.com/logos/crm-logo.png",
                            "auth_type": "api_key",
                            "status": "active",
                            "is_public": False,
                            "created_at": "2025-02-10T14:30:00Z",
                            "updated_at": "2025-03-15T11:25:00Z",
                            "created_by": "user-uuid-12345"
                        }
                    ]
                }
            }
        },
        404: {
            "description": "Tenant not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Tenant not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_tenant_applications(
    tenant_id: str = Path(..., description="The unique ID of the tenant"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Retrieve all applications associated with a specific tenant.
    
    This endpoint provides super administrators with a list of all applications
    that have been associated with a particular tenant. These are the applications
    that tenant users can access and integrate with.
    
    Applications can be associated with multiple tenants, and this endpoint
    returns only the applications associated with the specified tenant.
    
    The response includes full application details including:
    * Basic information (name, description, type)
    * Authentication method required (OAuth2, API key, etc.)
    * Connection parameters (if any)
    * Documentation and support URLs
    * Status and creation information
    
    This operation requires super admin privileges.
    """
    return admin_service.get_tenant_applications(tenant_id)

@router.post(
    "/tenants/{tenant_id}/applications/{application_id}", 
    status_code=201,
    summary="Associate application with tenant",
    description="Associate an application with a specific tenant to grant access",
    tags=["admin"],
    responses={
        201: {
            "description": "Application successfully associated with tenant",
            "content": {
                "application/json": {
                    "example": {
                        "tenant_id": "tenant-1",
                        "application_id": 2,
                        "association_id": "assoc-1234",
                        "created_at": "2025-03-26T20:15:00Z",
                        "created_by": "user-uuid-12345",
                        "status": "active"
                    }
                }
            }
        },
        404: {
            "description": "Tenant or application not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Tenant or application not found"}
                }
            }
        },
        409: {
            "description": "Association already exists",
            "content": {
                "application/json": {
                    "example": {"detail": "Association between tenant and application already exists"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def associate_application_with_tenant(
    tenant_id: str = Path(..., description="The unique ID of the tenant"),
    application_id: int = Path(..., gt=0, description="The ID of the application to associate with the tenant"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Associate an application with a specific tenant to grant access.
    
    This endpoint allows super administrators to associate an application with a tenant,
    making it available for that tenant's users to access and integrate with.
    
    When an application is associated with a tenant:
    * Tenant users can view and select the application for integrations
    * The application appears in the tenant's application list
    * Tenant users can create integrations with the application
    
    Applications can be associated with multiple tenants, each with their own
    configuration and usage. This multi-tenant model allows for efficient
    resource sharing while maintaining tenant isolation.
    
    This operation requires super admin privileges.
    """
    association = admin_service.associate_application_with_tenant(
        tenant_id, 
        application_id, 
        current_user.id
    )
    return association

@router.delete(
    "/tenants/{tenant_id}/applications/{application_id}", 
    status_code=204,
    summary="Disassociate application from tenant",
    description="Remove an application association from a specific tenant",
    tags=["admin"],
    responses={
        204: {
            "description": "Application successfully disassociated from tenant"
        },
        404: {
            "description": "Association between tenant and application not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Association between tenant and application not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def disassociate_application_from_tenant(
    tenant_id: str = Path(..., description="The unique ID of the tenant"),
    application_id: int = Path(..., gt=0, description="The ID of the application to disassociate from the tenant"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Remove an application association from a specific tenant.
    
    This endpoint allows super administrators to disassociate an application from a tenant,
    removing the tenant users' access to that application for integrations.
    
    When an application is disassociated from a tenant:
    * The application is removed from the tenant's available applications list
    * Tenant users can no longer select the application for new integrations
    * Existing integrations using the application may be affected
    
    This operation should be performed with caution as it may impact existing
    integration flows that depend on the application. It's recommended to
    audit the tenant's integrations before removing application access.
    
    A successful disassociation returns a 204 No Content response. If the
    association does not exist, a 404 Not Found response is returned.
    
    This operation requires super admin privileges.
    """
    success = admin_service.disassociate_application_from_tenant(tenant_id, application_id)
    if not success:
        raise HTTPException(
            status_code=404, 
            detail="Association between tenant and application not found"
        )

@router.get(
    "/tenants/{tenant_id}/datasets", 
    response_model=List[Dataset],
    summary="Get tenant datasets",
    description="Retrieve all datasets associated with a specific tenant",
    tags=["admin"],
    responses={
        200: {
            "description": "List of tenant datasets successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "name": "Customer Data",
                            "description": "Core customer data with personal and contact information",
                            "schema": [
                                {
                                    "name": "customer_id",
                                    "description": "Unique identifier for the customer",
                                    "type": "string",
                                    "required": True,
                                    "is_primary_key": True
                                },
                                {
                                    "name": "email",
                                    "description": "Customer's email address",
                                    "type": "string",
                                    "required": True,
                                    "format": "email"
                                }
                            ],
                            "status": "active",
                            "source_application_id": 1,
                            "created_at": "2025-01-20T14:30:00Z",
                            "updated_at": "2025-03-10T09:45:00Z",
                            "created_by": "user-uuid-12345"
                        },
                        {
                            "id": 3,
                            "name": "Product Catalog",
                            "description": "Complete product catalog with details and pricing",
                            "schema": [
                                {
                                    "name": "product_id",
                                    "description": "Unique identifier for the product",
                                    "type": "string",
                                    "required": True,
                                    "is_primary_key": True
                                }
                            ],
                            "status": "active",
                            "source_application_id": 2,
                            "created_at": "2025-03-01T09:20:00Z",
                            "updated_at": "2025-03-15T16:45:00Z",
                            "created_by": "user-uuid-12345"
                        }
                    ]
                }
            }
        },
        404: {
            "description": "Tenant not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Tenant not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_tenant_datasets(
    tenant_id: str = Path(..., description="The unique ID of the tenant"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Retrieve all datasets associated with a specific tenant.
    
    This endpoint provides super administrators with a list of all datasets
    that have been associated with a particular tenant. These are the datasets
    that tenant users can access and utilize in their integration flows.
    
    Datasets can be associated with multiple tenants, and this endpoint
    returns only the datasets associated with the specified tenant.
    
    The response includes full dataset details including:
    * Basic information (name, description, status)
    * Complete schema definition with all fields
    * Source application association
    * Creation and update timestamps
    
    The schema contains the detailed structure of each dataset, including
    field definitions with data types, constraints, and metadata.
    
    This operation requires super admin privileges.
    """
    tenant = admin_service.get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return admin_service.get_tenant_datasets(tenant_id)

@router.post(
    "/tenants/{tenant_id}/datasets/{dataset_id}", 
    status_code=201,
    summary="Associate dataset with tenant",
    description="Associate a dataset with a specific tenant to grant access",
    tags=["admin"],
    responses={
        201: {
            "description": "Dataset successfully associated with tenant",
            "content": {
                "application/json": {
                    "example": {
                        "tenant_id": "tenant-1",
                        "dataset_id": 2,
                        "association_id": "ds-assoc-1234",
                        "created_at": "2025-03-26T20:15:00Z",
                        "created_by": "user-uuid-12345",
                        "status": "active"
                    }
                }
            }
        },
        404: {
            "description": "Tenant or dataset not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Tenant or dataset not found"}
                }
            }
        },
        409: {
            "description": "Association already exists",
            "content": {
                "application/json": {
                    "example": {"detail": "Association between tenant and dataset already exists"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def associate_dataset_with_tenant(
    tenant_id: str = Path(..., description="The unique ID of the tenant"),
    dataset_id: int = Path(..., gt=0, description="The ID of the dataset to associate with the tenant"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Associate a dataset with a specific tenant to grant access.
    
    This endpoint allows super administrators to associate a dataset with a tenant,
    making it available for that tenant's users to access and utilize in their
    integration flows.
    
    When a dataset is associated with a tenant:
    * Tenant users can view and select the dataset for integrations
    * The dataset appears in the tenant's dataset list
    * Tenant users can create integration flows that use the dataset
    
    Datasets can be associated with multiple tenants, each with their own
    usage patterns and access controls. This multi-tenant model allows for
    efficient resource sharing while maintaining tenant isolation.
    
    Datasets typically contain schema information that defines the structure
    of data available for integration. By associating datasets with tenants,
    administrators control which data structures are available to each tenant.
    
    This operation requires super admin privileges.
    """
    # Verify tenant and dataset existence
    tenant = admin_service.get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    dataset = admin_service.get_dataset(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Create the association
    association = admin_service.associate_dataset_with_tenant(
        tenant_id, 
        dataset_id, 
        current_user.id
    )
    return association

@router.delete(
    "/tenants/{tenant_id}/datasets/{dataset_id}", 
    status_code=204,
    summary="Disassociate dataset from tenant",
    description="Remove a dataset association from a specific tenant",
    tags=["admin"],
    responses={
        204: {
            "description": "Dataset successfully disassociated from tenant"
        },
        404: {
            "description": "Association between tenant and dataset not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Association between tenant and dataset not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def disassociate_dataset_from_tenant(
    tenant_id: str = Path(..., description="The unique ID of the tenant"),
    dataset_id: int = Path(..., gt=0, description="The ID of the dataset to disassociate from the tenant"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Remove a dataset association from a specific tenant.
    
    This endpoint allows super administrators to disassociate a dataset from a tenant,
    removing the tenant users' access to that dataset for integration flows.
    
    When a dataset is disassociated from a tenant:
    * The dataset is removed from the tenant's available datasets list
    * Tenant users can no longer select the dataset for new integrations
    * Existing integrations using the dataset may be affected
    
    This operation should be performed with caution as it may impact existing
    integration flows that depend on the dataset. It's recommended to
    audit the tenant's integrations before removing dataset access.
    
    A successful disassociation returns a 204 No Content response. If the
    association does not exist, a 404 Not Found response is returned.
    
    This operation requires super admin privileges.
    """
    # First check if tenant exists
    tenant = admin_service.get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Check if dataset exists
    dataset = admin_service.get_dataset(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Remove the association
    success = admin_service.disassociate_dataset_from_tenant(tenant_id, dataset_id)
    if not success:
        raise HTTPException(
            status_code=404, 
            detail="Association between tenant and dataset not found"
        )
        

# Webhook endpoints
@router.get(
    "/webhooks", 
    response_model=List[Webhook],
    summary="Get all webhooks",
    description="Retrieve a list of all webhooks with pagination and optional filtering",
    tags=["admin", "webhooks"],
    responses={
        200: {
            "description": "List of webhooks successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "name": "Integration Status Notifier",
                            "url": "https://example.com/webhook/integration-status",
                            "events": ["integration_run_completed", "integration_run_failed"],
                            "headers": {
                                "X-API-Key": "********",
                                "Content-Type": "application/json"
                            },
                            "auth_type": "api_key",
                            "auth_credentials": {
                                "key_name": "X-API-Key",
                                "key_value": "********"
                            },
                            "status": "active",
                            "integration_id": 1,
                            "tenant_id": "tenant-1",
                            "created_at": "2025-02-15T10:30:00Z",
                            "updated_at": "2025-03-20T14:45:00Z",
                            "created_by": "user-uuid-12345"
                        },
                        {
                            "id": 2,
                            "name": "Data Processing Notification",
                            "url": "https://example.com/webhook/data-processing",
                            "events": ["dataset_updated"],
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "auth_type": "none",
                            "status": "active",
                            "tenant_id": "tenant-2",
                            "created_at": "2025-03-01T09:15:00Z",
                            "updated_at": "2025-03-15T11:20:00Z",
                            "created_by": "user-uuid-67890"
                        }
                    ]
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_webhooks(
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    integration_id: Optional[int] = Query(None, description="Filter by integration ID"),
    tenant_id: Optional[str] = Query(None, description="Filter by tenant ID"),
    status: Optional[str] = Query(None, description="Filter by webhook status (active, inactive, failed)")
):
    """
    Retrieve a list of all webhooks in the platform.
    
    This endpoint allows super administrators to:
    * List all registered webhooks
    * Filter webhooks by integration ID, tenant ID, or status
    * Paginate through the results
    
    Webhooks are HTTP callbacks that enable real-time notifications when specific 
    events occur within the platform. They allow external systems to be notified 
    about events such as integration runs, dataset updates, and other important 
    operational events.
    
    The response includes detailed webhook information including:
    * URL and authentication details (with sensitive values masked)
    * Event subscriptions
    * Associated integration and tenant
    * Status and creation information
    
    This operation requires super admin privileges.
    """
    return admin_service.get_webhooks(skip, limit, integration_id, tenant_id, status)


@router.post(
    "/webhooks", 
    response_model=Webhook, 
    status_code=201,
    summary="Create a new webhook",
    description="Register a new webhook notification endpoint for platform events",
    tags=["admin", "webhooks"],
    responses={
        201: {
            "description": "Webhook successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": 3,
                        "name": "Error Notification Endpoint",
                        "url": "https://example.com/webhook/errors",
                        "events": ["integration_run_failed", "system_error"],
                        "headers": {
                            "Content-Type": "application/json",
                            "X-Source": "TAP-Platform"
                        },
                        "auth_type": "basic",
                        "auth_credentials": {
                            "username": "webhook_user",
                            "password": "********"
                        },
                        "status": "active",
                        "integration_id": None,
                        "tenant_id": "tenant-1",
                        "created_at": "2025-03-27T11:30:00Z",
                        "updated_at": "2025-03-27T11:30:00Z",
                        "created_by": "user-uuid-12345"
                    }
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "URL is not a valid HTTPS endpoint"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def create_webhook(
    webhook: WebhookCreate = Body(
        ..., 
        description="Webhook details to create",
        example={
            "name": "Error Notification Endpoint",
            "url": "https://example.com/webhook/errors",
            "events": ["integration_run_failed", "system_error"],
            "headers": {
                "Content-Type": "application/json",
                "X-Source": "TAP-Platform"
            },
            "auth_type": "basic",
            "auth_credentials": {
                "username": "webhook_user",
                "password": "secure_password"
            },
            "status": "active",
            "integration_id": None
        }
    ),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Register a new webhook notification endpoint for platform events.
    
    This endpoint allows super administrators to create new webhook registrations
    to receive notifications when specific events occur within the platform.
    
    Webhooks provide a real-time notification mechanism that:
    * Enables external systems to respond to platform events 
    * Supports automation and integration with other applications
    * Allows custom notification workflows
    * Provides event-driven architecture capabilities
    
    The webhook configuration includes:
    * A name and target URL (HTTPS required)
    * Event types to subscribe to (e.g., integration_run_completed, dataset_updated)
    * Optional HTTP headers to include with requests
    * Authentication credentials if required by the target endpoint
    * Optional association with a specific integration
    
    The created webhook will immediately begin receiving events of the specified types.
    Sensitive authentication information is stored securely and masked in responses.
    
    This operation requires super admin privileges.
    """
    return admin_service.create_webhook(webhook, current_user.tenant_id, current_user.id)


@router.get(
    "/webhooks/{webhook_id}", 
    response_model=Webhook,
    summary="Get webhook details",
    description="Retrieve detailed information about a specific webhook by its ID",
    tags=["admin", "webhooks"],
    responses={
        200: {
            "description": "Webhook details successfully retrieved",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Integration Status Notifier",
                        "url": "https://example.com/webhook/integration-status",
                        "events": ["integration_run_completed", "integration_run_failed"],
                        "headers": {
                            "X-API-Key": "********",
                            "Content-Type": "application/json"
                        },
                        "auth_type": "api_key",
                        "auth_credentials": {
                            "key_name": "X-API-Key",
                            "key_value": "********"
                        },
                        "status": "active",
                        "integration_id": 1,
                        "tenant_id": "tenant-1",
                        "created_at": "2025-02-15T10:30:00Z",
                        "updated_at": "2025-03-20T14:45:00Z",
                        "created_by": "user-uuid-12345",
                        "last_triggered_at": "2025-03-26T18:22:15Z",
                        "success_count": 143,
                        "failure_count": 2
                    }
                }
            }
        },
        404: {
            "description": "Webhook not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Webhook not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_webhook(
    webhook_id: int = Path(..., gt=0, description="The unique ID of the webhook to retrieve"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Retrieve detailed information about a specific webhook by its ID.
    
    This endpoint provides super administrators with access to the full
    details of a webhook registration, including:
    
    * Basic information (name, URL, status)
    * Event subscriptions
    * HTTP headers and authentication details (with sensitive values masked)
    * Association with tenant and integration (if any)
    * Creation and update timestamps
    * Performance statistics (success/failure counts, last triggered time)
    
    The webhook details include all configuration necessary to understand
    the webhook's purpose, target, and usage patterns. Sensitive authentication
    values are masked for security.
    
    If the webhook ID does not exist, a 404 Not Found response is returned.
    
    This operation requires super admin privileges.
    """
    webhook = admin_service.get_webhook(webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return webhook


@router.put(
    "/webhooks/{webhook_id}", 
    response_model=Webhook,
    summary="Update a webhook",
    description="Update an existing webhook with the provided data",
    tags=["admin", "webhooks"],
    responses={
        200: {
            "description": "Webhook successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Enhanced Integration Status Notifier",
                        "url": "https://example.com/webhook/integration-status-v2",
                        "events": [
                            "integration_run_completed", 
                            "integration_run_failed", 
                            "integration_scheduled"
                        ],
                        "headers": {
                            "X-API-Key": "********",
                            "Content-Type": "application/json",
                            "X-Version": "2.0"
                        },
                        "auth_type": "api_key",
                        "auth_credentials": {
                            "key_name": "X-API-Key",
                            "key_value": "********"
                        },
                        "status": "active",
                        "integration_id": 1,
                        "tenant_id": "tenant-1",
                        "created_at": "2025-02-15T10:30:00Z",
                        "updated_at": "2025-03-27T12:15:00Z",
                        "created_by": "user-uuid-12345"
                    }
                }
            }
        },
        404: {
            "description": "Webhook not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Webhook not found"}
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "URL is not a valid HTTPS endpoint"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def update_webhook(
    webhook: WebhookUpdate = Body(
        ..., 
        description="Webhook data to update",
        example={
            "name": "Enhanced Integration Status Notifier",
            "url": "https://example.com/webhook/integration-status-v2",
            "events": [
                "integration_run_completed", 
                "integration_run_failed", 
                "integration_scheduled"
            ],
            "headers": {
                "Content-Type": "application/json",
                "X-Version": "2.0"
            },
            "status": "active"
        }
    ),
    webhook_id: int = Path(..., gt=0, description="The ID of the webhook to update"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Update an existing webhook with the provided data.
    
    This endpoint allows super administrators to update the properties of an
    existing webhook. The update can be partial - only the provided fields
    will be updated.
    
    Webhooks can be modified to:
    * Change the target URL
    * Add or remove subscribed events
    * Update HTTP headers or authentication details
    * Activate or deactivate the webhook
    * Associate with a different integration
    
    The updated webhook configuration will take effect immediately. Any events
    triggered after the update will use the new configuration.
    
    If sensitive information like authentication credentials are not included
    in the update request, the existing values will be preserved.
    
    If the webhook ID does not exist, a 404 Not Found response is returned.
    
    This operation requires super admin privileges.
    """
    updated = admin_service.update_webhook(webhook_id, webhook)
    if not updated:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return updated


@router.delete(
    "/webhooks/{webhook_id}", 
    status_code=204,
    summary="Delete a webhook",
    description="Permanently delete a webhook configuration",
    tags=["admin", "webhooks"],
    responses={
        204: {
            "description": "Webhook successfully deleted"
        },
        404: {
            "description": "Webhook not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Webhook not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def delete_webhook(
    webhook_id: int = Path(..., gt=0, description="The ID of the webhook to delete"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Permanently delete a webhook configuration.
    
    This endpoint allows super administrators to remove a webhook configuration
    from the platform. Once deleted, the webhook will no longer receive event
from pydantic import BaseModel

from typing import List, Dict, Any, Optional
from datetime import timezone
from pydantic import BaseModel
from backend.utils.api.models import DataResponse, PaginatedResponse, ErrorResponse, create_response, create_paginated_response, create_error_response

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

    notifications.
    
    Deleting a webhook:
    * Immediately stops any new events from being sent to the webhook URL
    * Removes all webhook configuration data from the platform
    * Preserves webhook logs for historical reference
    * Cannot be undone - a new webhook would need to be created if needed again
    
    This operation is useful for removing deprecated or unused webhook integrations
    or when reconfiguring notification flows.
    
    If the webhook ID does not exist, a 404 Not Found response is returned.
    
    This operation requires super admin privileges.
    """
    success = admin_service.delete_webhook(webhook_id)
    if not success:
        raise HTTPException(status_code=404, detail="Webhook not found")


@router.get(
    "/webhooks/{webhook_id}/logs", 
    response_model=List[WebhookLog],
    summary="Get webhook logs",
    description="Retrieve execution logs for a specific webhook with pagination and filtering",
    tags=["admin", "webhooks"],
    responses={
        200: {
            "description": "Webhook logs successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 123,
                            "webhook_id": 1,
                            "event_type": "integration_run_completed",
                            "timestamp": "2025-03-26T18:22:15Z",
                            "request_payload": {
                                "integration_id": 42,
                                "run_id": "run-abc123",
                                "status": "success",
                                "execution_time_ms": 1543,
                                "records_processed": 1250
                            },
                            "response_status_code": 200,
                            "response_body": "{\"received\":true}",
                            "success": True,
                            "error_message": None,
                            "execution_time_ms": 248
                        },
                        {
                            "id": 122,
                            "webhook_id": 1,
                            "event_type": "integration_run_completed",
                            "timestamp": "2025-03-26T17:15:32Z",
                            "request_payload": {
                                "integration_id": 42,
                                "run_id": "run-abc122",
                                "status": "success",
                                "execution_time_ms": 1352,
                                "records_processed": 980
                            },
                            "response_status_code": 200,
                            "response_body": "{\"received\":true}",
                            "success": True,
                            "error_message": None,
                            "execution_time_ms": 231
                        }
                    ]
                }
            }
        },
        404: {
            "description": "Webhook not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Webhook not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_webhook_logs(
    webhook_id: int = Path(..., gt=0, description="The ID of the webhook to retrieve logs for"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return"),
    success_only: Optional[bool] = Query(None, description="Filter by success status (true for successful calls only, false for failed calls only)")
):
    """
    Retrieve execution logs for a specific webhook with pagination and filtering.
    
    This endpoint provides super administrators with a detailed history of webhook
    execution attempts, including:
    
    * Event type that triggered the webhook
    * Request payload sent to the webhook endpoint
    * Response status code and body received
    * Execution time and success/failure status
    * Error messages for failed webhook calls
    * Timestamp of each attempt
    
    Webhook logs are essential for:
    * Debugging webhook integration issues
    * Verifying that webhooks are working correctly
    * Auditing event notifications
    * Troubleshooting failed webhook calls
    * Monitoring webhook performance
    
    The logs can be filtered to show only successful or failed webhook executions,
    and pagination is supported to retrieve large log histories.
    
    If the webhook ID does not exist, a 404 Not Found response is returned.
    
    This operation requires super admin privileges.
    """
    # First check if webhook exists
    webhook = admin_service.get_webhook(webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
        
    return admin_service.get_webhook_logs(webhook_id, skip, limit, success_only)


# Tenant endpoints
@router.get(
    "/tenants", 
    response_model=List[Tenant],
    summary="Get all tenants",
    description="Retrieve a list of all tenants with pagination and optional status filtering",
    tags=["admin"],
    responses={
        200: {
            "description": "List of tenants successfully retrieved",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": "tenant-1",
                            "name": "Acme Corporation",
                            "subdomain": "acme",
                            "status": "active",
                            "tier": "enterprise",
                            "settings": {
                                "max_integrations": 100,
                                "max_users": 50,
                                "features": {
                                    "advanced_transformations": True,
                                    "custom_connectors": True,
                                    "premium_support": True
                                },
                                "branding": {
                                    "logo_url": "https://acme.example.com/logo.png",
                                    "primary_color": "#336699"
                                }
                            },
                            "contact_info": {
                                "admin_email": "admin@acme.example.com",
                                "support_email": "support@acme.example.com",
                                "phone": "+1-555-123-4567"
                            },
                            "created_at": "2025-01-10T09:00:00Z",
                            "updated_at": "2025-03-15T14:30:00Z"
                        },
                        {
                            "id": "tenant-2",
                            "name": "Beta Innovations",
                            "subdomain": "beta",
                            "status": "active",
                            "tier": "professional",
                            "settings": {
                                "max_integrations": 25,
                                "max_users": 20,
                                "features": {
                                    "advanced_transformations": True,
                                    "custom_connectors": False,
                                    "premium_support": False
                                }
                            },
                            "contact_info": {
                                "admin_email": "admin@beta.example.com"
                            },
                            "created_at": "2025-02-15T10:30:00Z",
                            "updated_at": "2025-03-20T11:15:00Z"
                        }
                    ]
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_tenants(
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    status: Optional[TenantStatus] = Query(None, description="Filter tenants by status (active, inactive, etc.)")
):
    """
    Retrieve a list of all tenants in the platform.
    
    This endpoint allows super administrators to:
    * List all registered tenants
    * Filter tenants by status
    * Paginate through the results
    
    Tenants are isolated organizations within the platform, each with their own
    users, integrations, and data. The tenant configuration includes settings
    for feature access, branding, and resource limits.
    
    The response includes the full tenant information including settings and contact details.
    
    This operation requires super admin privileges.
    """
    return admin_service.get_tenants(skip, limit, status)


@router.post(
    "/tenants", 
    response_model=Tenant, 
    status_code=201,
    summary="Create a new tenant",
    description="Register a new tenant organization in the platform",
    tags=["admin"],
    responses={
        201: {
            "description": "Tenant successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": "tenant-3",
                        "name": "Gamma Technologies",
                        "subdomain": "gamma",
                        "status": "active",
                        "tier": "standard",
                        "settings": {
                            "max_integrations": 50,
                            "max_users": 30,
                            "features": {
                                "advanced_transformations": True,
                                "custom_connectors": False,
                                "premium_support": False
                            },
                            "branding": {
                                "logo_url": "https://gamma.example.com/logo.png",
                                "primary_color": "#339966"
                            }
                        },
                        "contact_info": {
                            "admin_email": "admin@gamma.example.com",
                            "support_email": "support@gamma.example.com"
                        },
                        "created_at": "2025-03-26T18:30:00Z",
                        "updated_at": "2025-03-26T18:30:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Tenant with this subdomain already exists"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def create_tenant(
    tenant: TenantCreate = Body(
        ..., 
        description="Tenant details to create",
        example={
            "name": "Gamma Technologies",
            "subdomain": "gamma",
            "status": "active",
            "tier": "standard",
            "settings": {
                "max_integrations": 50,
                "max_users": 30,
                "features": {
                    "advanced_transformations": True,
                    "custom_connectors": False
                },
                "branding": {
                    "logo_url": "https://gamma.example.com/logo.png",
                    "primary_color": "#339966"
                }
            },
            "contact_info": {
                "admin_email": "admin@gamma.example.com",
                "support_email": "support@gamma.example.com"
            }
        }
    ),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Register a new tenant organization in the platform.
    
    This endpoint allows super administrators to create new tenant organizations
    within the TAP platform. Tenants are isolated entities with their own users,
    integrations, and data.
    
    The tenant creation requires:
    * A unique name and subdomain
    * Service tier specification (standard, professional, enterprise)
    * Settings configuration including resource limits and feature flags
    * Contact information for tenant administrators
    
    Tenant settings define the capabilities and limitations:
    * Resource limits (max integrations, max users, etc.)
    * Feature access (advanced transformations, custom connectors, etc.)
    * Branding options (logo URL, primary color, etc.)
    
    This operation requires super admin privileges.
    """
    return admin_service.create_tenant(tenant)


@router.get(
    "/tenants/{tenant_id}", 
    response_model=Tenant,
    summary="Get tenant details",
    description="Retrieve detailed information about a specific tenant by its ID",
    tags=["admin"],
    responses={
        200: {
            "description": "Tenant details successfully retrieved",
            "content": {
                "application/json": {
                    "example": {
                        "id": "tenant-1",
                        "name": "Acme Corporation",
                        "subdomain": "acme",
                        "status": "active",
                        "tier": "enterprise",
                        "settings": {
                            "max_integrations": 100,
                            "max_users": 50,
                            "features": {
                                "advanced_transformations": True,
                                "custom_connectors": True,
                                "premium_support": True
                            },
                            "branding": {
                                "logo_url": "https://acme.example.com/logo.png",
                                "primary_color": "#336699"
                            }
                        },
                        "contact_info": {
                            "admin_email": "admin@acme.example.com",
                            "support_email": "support@acme.example.com",
                            "phone": "+1-555-123-4567"
                        },
                        "created_at": "2025-01-10T09:00:00Z",
                        "updated_at": "2025-03-15T14:30:00Z"
                    }
                }
            }
        },
        404: {
            "description": "Tenant not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Tenant not found"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def get_tenant(
    tenant_id: str = Path(..., description="The unique ID of the tenant to retrieve"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Retrieve detailed information about a specific tenant by its ID.
    
    This endpoint provides super administrators with access to the full
    details of a tenant organization, including:
    
    * Basic information (name, subdomain, status, tier)
    * Settings configuration with resource limits and feature flags
    * Contact information
    * Creation and update timestamps
    ", response_model=StandardResponse
    Tenant settings include resource allocation, feature access, and branding:
    * Resource limits control the maximum number of integrations, users, etc.
    * Feature flags determine which platform capabilities are available
    * Branding options allow for tenant-specific UI customization
    
    If the tenant ID does not exist, a 404 Not Found response is returned.
    
    This operation requires super admin privileges.
    """
    tenant = admin_service.get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/tenants/{tenant_id}", response_model=Tenant)
async def update_tenant(
    tenant: TenantUpdate,
    tenant_id: str = Path(...),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Update an existing tenant
    """
    updated = admin_service.update_tenant(tenant_id, tenant)
    if not updated:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return updated


@router.delete("/tenants/{tenant_id}", status_code=204)
async def delete_tenant(
    tenant_id: str = Path(...),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Delete a tenant
    """
    success = admin_service.delete_tenant(tenant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")


@router.post(
    "/webhooks/test", 
    response_model=WebhookTestResponse,
    summary="Test a webhook configuration",
    description="Send a test request to a webhook URL to validate its configuration before creation",
    tags=["admin", "webhooks"],
    responses={
        200: {
            "description": "Webhook test executed successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "status_code": 200,
                        "response_body": "{\"received\":true,\"event\":\"test\"}",
                        "execution_time_ms": 245,
                        "test_id": "test-xyz789",
                        "error_message": None,
                        "timestamp": "2025-03-27T13:45:22Z"
                    }
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "URL is not a valid HTTPS endpoint"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": {"detail": "Error occurred while testing webhook"}
                }
            }
        }
    }
)
async def test_webhook(
    test_request: WebhookTestRequest = Body(
        ...,
        description="Webhook configuration to test",
        example={
            "url": "https://example.com/webhook/test",
            "auth_type": "api_key",
            "auth_credentials": {
                "key_name": "X-API-Key",
                "key_value": "test_api_key_123"
            },
            "headers": {
                "Content-Type": "application/json",
                "X-Source": "TAP-Platform-Test"
            },
            "payload": {
                "event": "test",
                "timestamp": "2025-03-27T13:45:22Z",
                "test": True
            },
            "event_type": "integration_run_completed"
        }
    ),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service)
):
    """
    Test a webhook by sending a request to the specified URL.
    
    This endpoint allows administrators to validate a webhook configuration
    before creating it as a permanent webhook. It sends a test request to the
    specified URL with the configured authentication, headers, and payload.
    
    The test functionality:
    * Validates the webhook URL is reachable
    * Confirms the authentication configuration works correctly
    * Verifies that the webhook endpoint accepts the provided payload
    * Measures response time and captures the response for inspection
    * Includes a 'test' flag in the payload to identify it as a test request
    
    This is useful during webhook setup to ensure that the receiving system
    is properly configured to accept webhook calls from the TAP platform.
    
    The response includes the status code, response body, execution time, and
    any error messages, allowing administrators to diagnose configuration issues.
    
    This operation requires super admin privileges.
    """
    return admin_service.test_webhook(test_request)


@router.post(
    "/webhooks/{webhook_id}/test", 
    response_model=WebhookTestResponse,
    summary="Test an existing webhook",
    description="Send a test request to an existing webhook to validate its functionality",
    tags=["admin", "webhooks"],
    responses={
        200: {
            "description": "Webhook test executed successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "status_code": 200,
                        "response_body": "{\"received\":true,\"event\":\"integration_run_completed\"}",
                        "execution_time_ms": 278,
                        "test_id": "test-web123",
                        "error_message": None,
                        "timestamp": "2025-03-27T14:12:35Z"
                    }
                }
            }
        },
        404: {
            "description": "Webhook not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Webhook not found"}
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid event type specified"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": {"detail": "Error occurred while testing webhook"}
                }
            }
        }
    }
)
async def test_existing_webhook(
    webhook_id: int = Path(..., gt=0, description="The ID of the webhook to test"),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service),
    event_type: Optional[WebhookEventType] = Query(None, description="Event type to use for test (defaults to first event type configured on the webhook)"),
    payload: Optional[Dict[str, Any]] = Body(None, description="Custom payload to send with the test request")
):
    """
    Test an existing webhook by sending a request with test data.
    
    This endpoint allows administrators to test a previously configured webhook
    to ensure it is still functioning correctly. It sends a test request using
    the webhook's existing configuration for URL, authentication, and headers.
    
    The test uses either:
    * The specified event type (if provided)
    * The first event type from the webhook's configuration (if available)
    * A default event type (integration_run_completed)
    
    Administrators can optionally provide a custom payload for the test request.
    If no payload is provided, a default test payload is generated that includes:
    * The integration ID (if the webhook is associated with an integration)
    * A timestamp of the current time
    * The event type being tested
    * A 'test' flag set to true
    
    This test functionality is useful for:
    * Validating webhook configurations after updates to external systems
    * Troubleshooting webhook delivery issues
    * Verifying authentication changes
    * Testing payload handling with different event types
    
    The response includes the status code, response body, execution time, and
    any error messages from the webhook endpoint.
    
    This operation requires super admin privileges.
    """
    webhook = admin_service.get_webhook(webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    # Use the first event type from the webhook if none specified
    if event_type is None and webhook.events:
        event_type = webhook.events[0]
    elif event_type is None:
        event_type = WebhookEventType.INTEGRATION_RUN_COMPLETED
    
    # Create a test payload if none provided
    if payload is None:
        if webhook.integration_id:
            payload = {
                "integration_id": webhook.integration_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event": event_type.value,
                "test": True
            }
        else:
            payload = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event": event_type.value,
                "test": True
            }
    
    # Create a test request using the webhook's configuration
    test_request = WebhookTestRequest(
        url=webhook.url,
        auth_type=webhook.auth_type,
        auth_credentials=webhook.auth_credentials,
        headers=webhook.headers,
        payload=payload,
        event_type=event_type
    )
    
    return admin_service.test_webhook(test_request)


@router.post(
    "/events/trigger", 
    status_code=202,
    summary="Trigger webhook event",
    description="Manually trigger an event that will be sent to matching webhooks",
    tags=["admin", "webhooks"],
    responses={
        202: {
            "description": "Event successfully triggered and webhooks notified",
            "content": {
                "application/json": {
                    "example": {
                        "event_type": "integration_run_completed",
                        "webhooks_triggered": 3,
                        "message": "Triggered 3 webhooks"
                    }
                }
            }
        },
        400: {
            "description": "Bad request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid event type or payload"}
                }
            }
        },
        403: {
            "description": "Forbidden - User does not have super admin privileges",
            "content": {
                "application/json": {
                    "example": {"detail": "Only super admins can access this endpoint"}
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
async def trigger_event(
    event_type: WebhookEventType = Body(..., description="The type of event to trigger"),
    payload: Dict[str, Any] = Body(..., description="Custom payload to send with the event", 
        example={
            "integration_id": 42,
            "run_id": "run-abc123",
            "status": "success",
            "execution_time_ms": 1543,
            "records_processed": 1250,
            "timestamp": "2025-03-27T14:30:00Z"
        }
    ),
    current_user: DbUser = Depends(require_super_admin),
    admin_service: AdminService = Depends(get_admin_service),
    integration_id: Optional[int] = Query(None, description="Integration ID for filtering webhooks (only triggers webhooks associated with this integration)"),
    tenant_id: Optional[str] = Query(None, description="Tenant ID for filtering webhooks (only triggers webhooks belonging to this tenant)")
):
    """
    Manually trigger an event that will be sent to matching webhooks.
    
    This endpoint allows super administrators to simulate platform events and
    trigger notifications to all matching webhooks. This is useful for:
    
    * Testing webhook configurations at scale
    * Verifying that event filtering works correctly
    * Sending notifications about manual actions or state changes
    * Troubleshooting webhook delivery issues across multiple endpoints
    * Validating payload handling across different webhook receivers
    
    The event will be sent to all active webhooks that:
    * Are subscribed to the specified event type
    * Match any provided integration or tenant filters
    
    The provided payload will be sent as-is to all matching webhooks,
    allowing administrators to customize the event data completely.
    
    The response indicates how many webhooks were triggered by the event.
    Webhook delivery happens asynchronously, so the response is returned
    before all webhook calls are completed.
    
    This operation requires super admin privileges.
    """
    count = admin_service.trigger_webhooks(event_type, payload, integration_id, tenant_id)
    return {
        "event_type": event_type,
        "webhooks_triggered": count,
        "message": f"Triggered {count} webhooks"
    }