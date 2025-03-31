"""
TenantService Controller

API routes for tenantservice operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Security
from sqlalchemy.orm import Session

from core.auth import get_current_active_user
from db.base import get_db
from db.models import User as DbUser

from .models import TenantServiceResponse, TenantServiceCreate, TenantServiceUpdate
from .service import TenantServiceService

# Create router for tenantservice endpoints
router = APIRouter(prefix="/api/tenantservices")

# Dependency to get tenantservice service
def get_tenantservice_service(db: Session = Depends(get_db)):
    """Get tenantservice service instance with DB session"""
    return TenantServiceService(db)

@router.get(
    "/", 
    response_model=List[TenantServiceResponse],
    summary="Get all tenantservices",
    description="Retrieve a list of all tenantservices with pagination and optional filtering",
    tags=["tenantservices"]
)
async def get_all_tenantservices(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    tenant_id: Optional[str] = Query(None, description="Optional tenant ID to filter by"),
    service: TenantServiceService = Depends(get_tenantservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get all tenantservices with optional filtering.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        tenant_id: Optional tenant ID to filter by
        service: TenantServiceService instance
        current_user: Authenticated user
        
    Returns:
        List of tenantservice objects
    """
    # Apply tenant filtering based on user's tenant unless they're an admin
    if not current_user.is_admin() and current_user.tenant_id:
        tenant_id = current_user.tenant_id
        
    return service.get_all(skip=skip, limit=limit, tenant_id=tenant_id)

@router.get(
    "/{tenantservice_id}", 
    response_model=TenantServiceResponse,
    summary="Get a specific tenantservice",
    description="Retrieve a tenantservice by its ID",
    tags=["tenantservices"]
)
async def get_tenantservice(
    tenantservice_id: int = Path(..., description="ID of the tenantservice to retrieve"),
    service: TenantServiceService = Depends(get_tenantservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get a tenantservice by ID.
    
    Args:
        tenantservice_id: ID of the tenantservice to retrieve
        service: TenantServiceService instance
        current_user: Authenticated user
        
    Returns:
        TenantService object if found
    """
    tenantservice = service.get_by_id(tenantservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != tenantservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this tenantservice")
        
    return tenantservice

@router.post(
    "/", 
    response_model=TenantServiceResponse,
    summary="Create a new tenantservice",
    description="Create a new tenantservice with the provided data",
    tags=["tenantservices"]
)
async def create_tenantservice(
    data: TenantServiceCreate,
    service: TenantServiceService = Depends(get_tenantservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Create a new tenantservice.
    
    Args:
        data: TenantService creation data
        service: TenantServiceService instance
        current_user: Authenticated user
        
    Returns:
        Newly created TenantService object
    """
    # Set tenant_id from current user if not provided and user has a tenant
    if not data.tenant_id and current_user.tenant_id:
        data.tenant_id = current_user.tenant_id
    
    # Only admins can create tenantservices for other tenants
    if not current_user.is_admin() and data.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot create tenantservice for another tenant")
        
    return service.create(data)

@router.put(
    "/{tenantservice_id}", 
    response_model=TenantServiceResponse,
    summary="Update a tenantservice",
    description="Update an existing tenantservice with the provided data",
    tags=["tenantservices"]
)
async def update_tenantservice(
    tenantservice_id: int,
    data: TenantServiceUpdate,
    service: TenantServiceService = Depends(get_tenantservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Update a tenantservice.
    
    Args:
        tenantservice_id: ID of the tenantservice to update
        data: TenantService update data
        service: TenantServiceService instance
        current_user: Authenticated user
        
    Returns:
        Updated TenantService object
    """
    # Get the existing tenantservice to check permissions
    existing_tenantservice = service.get_by_id(tenantservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_tenantservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this tenantservice")
        
    return service.update(tenantservice_id, data)

@router.delete(
    "/{tenantservice_id}",
    summary="Delete a tenantservice",
    description="Delete an existing tenantservice by its ID",
    tags=["tenantservices"]
)
async def delete_tenantservice(
    tenantservice_id: int,
    service: TenantServiceService = Depends(get_tenantservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Delete a tenantservice.
    
    Args:
        tenantservice_id: ID of the tenantservice to delete
        service: TenantServiceService instance
        current_user: Authenticated user
        
    Returns:
        Success message
    """
    # Get the existing tenantservice to check permissions
    existing_tenantservice = service.get_by_id(tenantservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_tenantservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this tenantservice")
        
    service.delete(tenantservice_id)
    return {"message": f"TenantService with ID {tenantservice_id} successfully deleted"}
