"""
BaseService Controller

API routes for baseservice operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Security
from sqlalchemy.orm import Session

from core.auth import get_current_active_user
from db.base import get_db
from db.models import User as DbUser

from .models import BaseServiceResponse, BaseServiceCreate, BaseServiceUpdate
from .service import BaseServiceService

# Create router for baseservice endpoints
router = APIRouter(prefix="/api/baseservices")

# Dependency to get baseservice service
def get_baseservice_service(db: Session = Depends(get_db)):
    """Get baseservice service instance with DB session"""
    return BaseServiceService(db)

@router.get(
    "/", 
    response_model=List[BaseServiceResponse],
    summary="Get all baseservices",
    description="Retrieve a list of all baseservices with pagination and optional filtering",
    tags=["baseservices"]
)
async def get_all_baseservices(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    tenant_id: Optional[str] = Query(None, description="Optional tenant ID to filter by"),
    service: BaseServiceService = Depends(get_baseservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get all baseservices with optional filtering.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        tenant_id: Optional tenant ID to filter by
        service: BaseServiceService instance
        current_user: Authenticated user
        
    Returns:
        List of baseservice objects
    """
    # Apply tenant filtering based on user's tenant unless they're an admin
    if not current_user.is_admin() and current_user.tenant_id:
        tenant_id = current_user.tenant_id
        
    return service.get_all(skip=skip, limit=limit, tenant_id=tenant_id)

@router.get(
    "/{baseservice_id}", 
    response_model=BaseServiceResponse,
    summary="Get a specific baseservice",
    description="Retrieve a baseservice by its ID",
    tags=["baseservices"]
)
async def get_baseservice(
    baseservice_id: int = Path(..., description="ID of the baseservice to retrieve"),
    service: BaseServiceService = Depends(get_baseservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get a baseservice by ID.
    
    Args:
        baseservice_id: ID of the baseservice to retrieve
        service: BaseServiceService instance
        current_user: Authenticated user
        
    Returns:
        BaseService object if found
    """
    baseservice = service.get_by_id(baseservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != baseservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this baseservice")
        
    return baseservice

@router.post(
    "/", 
    response_model=BaseServiceResponse,
    summary="Create a new baseservice",
    description="Create a new baseservice with the provided data",
    tags=["baseservices"]
)
async def create_baseservice(
    data: BaseServiceCreate,
    service: BaseServiceService = Depends(get_baseservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Create a new baseservice.
    
    Args:
        data: BaseService creation data
        service: BaseServiceService instance
        current_user: Authenticated user
        
    Returns:
        Newly created BaseService object
    """
    # Set tenant_id from current user if not provided and user has a tenant
    if not data.tenant_id and current_user.tenant_id:
        data.tenant_id = current_user.tenant_id
    
    # Only admins can create baseservices for other tenants
    if not current_user.is_admin() and data.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot create baseservice for another tenant")
        
    return service.create(data)

@router.put(
    "/{baseservice_id}", 
    response_model=BaseServiceResponse,
    summary="Update a baseservice",
    description="Update an existing baseservice with the provided data",
    tags=["baseservices"]
)
async def update_baseservice(
    baseservice_id: int,
    data: BaseServiceUpdate,
    service: BaseServiceService = Depends(get_baseservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Update a baseservice.
    
    Args:
        baseservice_id: ID of the baseservice to update
        data: BaseService update data
        service: BaseServiceService instance
        current_user: Authenticated user
        
    Returns:
        Updated BaseService object
    """
    # Get the existing baseservice to check permissions
    existing_baseservice = service.get_by_id(baseservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_baseservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this baseservice")
        
    return service.update(baseservice_id, data)

@router.delete(
    "/{baseservice_id}",
    summary="Delete a baseservice",
    description="Delete an existing baseservice by its ID",
    tags=["baseservices"]
)
async def delete_baseservice(
    baseservice_id: int,
    service: BaseServiceService = Depends(get_baseservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Delete a baseservice.
    
    Args:
        baseservice_id: ID of the baseservice to delete
        service: BaseServiceService instance
        current_user: Authenticated user
        
    Returns:
        Success message
    """
    # Get the existing baseservice to check permissions
    existing_baseservice = service.get_by_id(baseservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_baseservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this baseservice")
        
    service.delete(baseservice_id)
    return {"message": f"BaseService with ID {baseservice_id} successfully deleted"}
