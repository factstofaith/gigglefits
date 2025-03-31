"""
IntegrationService Controller

API routes for integrationservice operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Security
from sqlalchemy.orm import Session

from core.auth import get_current_active_user
from db.base import get_db
from db.models import User as DbUser

from .models import IntegrationServiceResponse, IntegrationServiceCreate, IntegrationServiceUpdate
from .service import IntegrationServiceService

# Create router for integrationservice endpoints
router = APIRouter(prefix="/api/integrationservices")

# Dependency to get integrationservice service
def get_integrationservice_service(db: Session = Depends(get_db)):
    """Get integrationservice service instance with DB session"""
    return IntegrationServiceService(db)

@router.get(
    "/", 
    response_model=List[IntegrationServiceResponse],
    summary="Get all integrationservices",
    description="Retrieve a list of all integrationservices with pagination and optional filtering",
    tags=["integrationservices"]
)
async def get_all_integrationservices(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    tenant_id: Optional[str] = Query(None, description="Optional tenant ID to filter by"),
    service: IntegrationServiceService = Depends(get_integrationservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get all integrationservices with optional filtering.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        tenant_id: Optional tenant ID to filter by
        service: IntegrationServiceService instance
        current_user: Authenticated user
        
    Returns:
        List of integrationservice objects
    """
    # Apply tenant filtering based on user's tenant unless they're an admin
    if not current_user.is_admin() and current_user.tenant_id:
        tenant_id = current_user.tenant_id
        
    return service.get_all(skip=skip, limit=limit, tenant_id=tenant_id)

@router.get(
    "/{integrationservice_id}", 
    response_model=IntegrationServiceResponse,
    summary="Get a specific integrationservice",
    description="Retrieve a integrationservice by its ID",
    tags=["integrationservices"]
)
async def get_integrationservice(
    integrationservice_id: int = Path(..., description="ID of the integrationservice to retrieve"),
    service: IntegrationServiceService = Depends(get_integrationservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get a integrationservice by ID.
    
    Args:
        integrationservice_id: ID of the integrationservice to retrieve
        service: IntegrationServiceService instance
        current_user: Authenticated user
        
    Returns:
        IntegrationService object if found
    """
    integrationservice = service.get_by_id(integrationservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != integrationservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this integrationservice")
        
    return integrationservice

@router.post(
    "/", 
    response_model=IntegrationServiceResponse,
    summary="Create a new integrationservice",
    description="Create a new integrationservice with the provided data",
    tags=["integrationservices"]
)
async def create_integrationservice(
    data: IntegrationServiceCreate,
    service: IntegrationServiceService = Depends(get_integrationservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Create a new integrationservice.
    
    Args:
        data: IntegrationService creation data
        service: IntegrationServiceService instance
        current_user: Authenticated user
        
    Returns:
        Newly created IntegrationService object
    """
    # Set tenant_id from current user if not provided and user has a tenant
    if not data.tenant_id and current_user.tenant_id:
        data.tenant_id = current_user.tenant_id
    
    # Only admins can create integrationservices for other tenants
    if not current_user.is_admin() and data.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot create integrationservice for another tenant")
        
    return service.create(data)

@router.put(
    "/{integrationservice_id}", 
    response_model=IntegrationServiceResponse,
    summary="Update a integrationservice",
    description="Update an existing integrationservice with the provided data",
    tags=["integrationservices"]
)
async def update_integrationservice(
    integrationservice_id: int,
    data: IntegrationServiceUpdate,
    service: IntegrationServiceService = Depends(get_integrationservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Update a integrationservice.
    
    Args:
        integrationservice_id: ID of the integrationservice to update
        data: IntegrationService update data
        service: IntegrationServiceService instance
        current_user: Authenticated user
        
    Returns:
        Updated IntegrationService object
    """
    # Get the existing integrationservice to check permissions
    existing_integrationservice = service.get_by_id(integrationservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_integrationservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this integrationservice")
        
    return service.update(integrationservice_id, data)

@router.delete(
    "/{integrationservice_id}",
    summary="Delete a integrationservice",
    description="Delete an existing integrationservice by its ID",
    tags=["integrationservices"]
)
async def delete_integrationservice(
    integrationservice_id: int,
    service: IntegrationServiceService = Depends(get_integrationservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Delete a integrationservice.
    
    Args:
        integrationservice_id: ID of the integrationservice to delete
        service: IntegrationServiceService instance
        current_user: Authenticated user
        
    Returns:
        Success message
    """
    # Get the existing integrationservice to check permissions
    existing_integrationservice = service.get_by_id(integrationservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_integrationservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this integrationservice")
        
    service.delete(integrationservice_id)
    return {"message": f"IntegrationService with ID {integrationservice_id} successfully deleted"}
