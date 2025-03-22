"""
Integration Controllers

This module defines the API routes for integrations in the TAP platform.
"""

from typing import List, Optional, Dict, Any, Union
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Security
from fastapi.security import OAuth2PasswordBearer

from .models import (
    Integration, 
    IntegrationCreate, 
    IntegrationUpdate,
    FieldMapping,
    FieldMappingCreate,
    FieldMappingUpdate,
    AzureBlobConfig,
    ScheduleConfig,
    IntegrationRun,
    User,
    UserRole
)
from .service import IntegrationService

# Create router for integration endpoints
router = APIRouter(prefix="/api/integrations")

# OAuth2 scheme for JWT authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Integration service instance
integration_service = IntegrationService()


@router.get("/", response_model=List[Integration])
async def get_integrations(
    token: str = Depends(oauth2_scheme),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    type: Optional[str] = None,
    health: Optional[str] = None
):
    """
    Get all integrations with optional filtering
    """
    return integration_service.get_integrations(skip, limit, type, health)


@router.post("/", response_model=Integration, status_code=201)
async def create_integration(
    integration: IntegrationCreate,
    token: str = Depends(oauth2_scheme)
):
    """
    Create a new integration
    """
    return integration_service.create_integration(integration)


@router.get("/{integration_id}", response_model=Integration)
async def get_integration(
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Get a specific integration by ID
    """
    integration = integration_service.get_integration(integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration


@router.put("/{integration_id}", response_model=Integration)
async def update_integration(
    integration: IntegrationUpdate,
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Update an existing integration
    """
    updated = integration_service.update_integration(integration_id, integration)
    if not updated:
        raise HTTPException(status_code=404, detail="Integration not found")
    return updated


@router.delete("/{integration_id}", status_code=204)
async def delete_integration(
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Delete an integration
    """
    success = integration_service.delete_integration(integration_id)
    if not success:
        raise HTTPException(status_code=404, detail="Integration not found")


@router.post("/{integration_id}/run", status_code=202)
async def run_integration(
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Run an integration
    """
    result = integration_service.run_integration(integration_id)
    if not result:
        raise HTTPException(status_code=404, detail="Integration not found")
    return result


@router.get("/{integration_id}/history", response_model=List[dict])
async def get_integration_history(
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get execution history for an integration
    """
    history = integration_service.get_integration_history(integration_id, limit)
    if history is None:
        raise HTTPException(status_code=404, detail="Integration not found")
    return history


# Field mapping endpoints
@router.get("/{integration_id}/mappings", response_model=List[FieldMapping])
async def get_field_mappings(
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Get field mappings for an integration
    """
    mappings = integration_service.get_field_mappings(integration_id)
    if mappings is None:
        raise HTTPException(status_code=404, detail="Integration not found")
    return mappings


@router.get("/sources", response_model=List[str])
async def get_available_sources(
    integration_type: str = Query(..., description="The type of integration (API-based, File-based, etc.)"),
    token: str = Depends(oauth2_scheme)
):
    """
    Get available sources for an integration type
    """
    return integration_service.get_available_sources(integration_type)


@router.get("/destinations", response_model=List[str])
async def get_available_destinations(
    integration_type: str = Query(..., description="The type of integration (API-based, File-based, etc.)"),
    token: str = Depends(oauth2_scheme)
):
    """
    Get available destinations for an integration type
    """
    return integration_service.get_available_destinations(integration_type)


@router.get("/{integration_id}/discover-fields")
async def discover_fields(
    integration_id: int = Path(..., gt=0),
    source_or_dest: str = Query("source", description="Whether to discover fields from 'source' or 'destination'"),
    token: str = Depends(oauth2_scheme)
):
    """
    Discover available fields from a source or destination
    """
    fields = integration_service.discover_fields(integration_id, source_or_dest)
    return fields


@router.post("/{integration_id}/mappings", response_model=FieldMapping, status_code=201)
async def create_field_mapping(
    mapping: FieldMappingCreate,
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Create a new field mapping for an integration
    """
    created = integration_service.create_field_mapping(integration_id, mapping)
    if created is None:
        raise HTTPException(status_code=404, detail="Integration not found")
    return created


@router.put("/{integration_id}/mappings/{mapping_id}", response_model=FieldMapping)
async def update_field_mapping(
    mapping: FieldMappingUpdate,
    integration_id: int = Path(..., gt=0),
    mapping_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Update a field mapping
    """
    updated = integration_service.update_field_mapping(integration_id, mapping_id, mapping)
    if updated is None:
        raise HTTPException(status_code=404, detail="Field mapping not found")
    return updated


@router.delete("/{integration_id}/mappings/{mapping_id}", status_code=204)
async def delete_field_mapping(
    integration_id: int = Path(..., gt=0),
    mapping_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Delete a field mapping
    """
    success = integration_service.delete_field_mapping(integration_id, mapping_id)
    if not success:
        raise HTTPException(status_code=404, detail="Field mapping not found")


# Azure Blob Storage configuration endpoints
@router.get("/{integration_id}/azure-blob-config", response_model=AzureBlobConfig)
async def get_azure_blob_config(
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Get Azure Blob Storage configuration for an integration
    """
    config = integration_service.get_azure_blob_config(integration_id)
    if not config:
        raise HTTPException(status_code=404, detail="Azure Blob configuration not found for this integration")
    return config


@router.put("/{integration_id}/azure-blob-config", response_model=AzureBlobConfig)
async def update_azure_blob_config(
    config: AzureBlobConfig,
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Update Azure Blob Storage configuration for an integration
    """
    # Check user role - only admins can update sensitive connection details
    user = integration_service.get_current_user(token)
    if user.role != UserRole.ADMIN:
        # For non-admin users, remove sensitive fields
        config.connection_string = None
        config.account_key = None
        config.sas_token = None
    
    updated = integration_service.update_azure_blob_config(integration_id, config)
    if not updated:
        raise HTTPException(status_code=404, detail="Integration not found")
    return updated


@router.post("/{integration_id}/azure-blob-config/test", response_model=Dict[str, Any])
async def test_azure_blob_connection(
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Test Azure Blob Storage connection for an integration
    """
    result = integration_service.test_azure_blob_connection(integration_id)
    if not result:
        raise HTTPException(status_code=404, detail="Integration not found or connection configuration is incomplete")
    return result


# Schedule configuration endpoints
@router.get("/{integration_id}/schedule", response_model=Union[ScheduleConfig, str])
async def get_schedule_config(
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Get schedule configuration for an integration
    """
    schedule = integration_service.get_schedule_config(integration_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule configuration not found for this integration")
    return schedule


@router.put("/{integration_id}/schedule", response_model=Union[ScheduleConfig, str])
async def update_schedule_config(
    schedule: ScheduleConfig,
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme)
):
    """
    Update schedule configuration for an integration
    """
    updated = integration_service.update_schedule_config(integration_id, schedule)
    if not updated:
        raise HTTPException(status_code=404, detail="Integration not found")
    return updated


# Integration run history endpoints
@router.get("/{integration_id}/runs", response_model=List[IntegrationRun])
async def get_integration_runs(
    integration_id: int = Path(..., gt=0),
    token: str = Depends(oauth2_scheme),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get detailed run history for an integration
    """
    runs = integration_service.get_integration_runs(integration_id, skip, limit)
    if runs is None:
        raise HTTPException(status_code=404, detail="Integration not found")
    return runs


# User and permission endpoints
@router.get("/current-user", response_model=User)
async def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    """
    Get current user information
    """
    user = integration_service.get_current_user(token)
    return user