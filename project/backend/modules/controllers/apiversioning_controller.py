"""
APIVersioning Controller

API routes for apiversioning operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Security
from sqlalchemy.orm import Session

from core.auth import get_current_active_user
from db.base import get_db
from db.models import User as DbUser

from .models import APIVersioningResponse, APIVersioningCreate, APIVersioningUpdate
from .service import APIVersioningService

# Create router for apiversioning endpoints
router = APIRouter(prefix="/api/apiversionings")

# Dependency to get apiversioning service
def get_apiversioning_service(db: Session = Depends(get_db)):
    """Get apiversioning service instance with DB session"""
    return APIVersioningService(db)

@router.get(
    "/", 
    response_model=List[APIVersioningResponse],
    summary="Get all apiversionings",
    description="Retrieve a list of all apiversionings with pagination and optional filtering",
    tags=["apiversionings"]
)
async def get_all_apiversionings(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    tenant_id: Optional[str] = Query(None, description="Optional tenant ID to filter by"),
    service: APIVersioningService = Depends(get_apiversioning_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get all apiversionings with optional filtering.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        tenant_id: Optional tenant ID to filter by
        service: APIVersioningService instance
        current_user: Authenticated user
        
    Returns:
        List of apiversioning objects
    """
    # Apply tenant filtering based on user's tenant unless they're an admin
    if not current_user.is_admin() and current_user.tenant_id:
        tenant_id = current_user.tenant_id
        
    return service.get_all(skip=skip, limit=limit, tenant_id=tenant_id)

@router.get(
    "/{apiversioning_id}", 
    response_model=APIVersioningResponse,
    summary="Get a specific apiversioning",
    description="Retrieve a apiversioning by its ID",
    tags=["apiversionings"]
)
async def get_apiversioning(
    apiversioning_id: int = Path(..., description="ID of the apiversioning to retrieve"),
    service: APIVersioningService = Depends(get_apiversioning_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get a apiversioning by ID.
    
    Args:
        apiversioning_id: ID of the apiversioning to retrieve
        service: APIVersioningService instance
        current_user: Authenticated user
        
    Returns:
        APIVersioning object if found
    """
    apiversioning = service.get_by_id(apiversioning_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != apiversioning.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this apiversioning")
        
    return apiversioning

@router.post(
    "/", 
    response_model=APIVersioningResponse,
    summary="Create a new apiversioning",
    description="Create a new apiversioning with the provided data",
    tags=["apiversionings"]
)
async def create_apiversioning(
    data: APIVersioningCreate,
    service: APIVersioningService = Depends(get_apiversioning_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Create a new apiversioning.
    
    Args:
        data: APIVersioning creation data
        service: APIVersioningService instance
        current_user: Authenticated user
        
    Returns:
        Newly created APIVersioning object
    """
    # Set tenant_id from current user if not provided and user has a tenant
    if not data.tenant_id and current_user.tenant_id:
        data.tenant_id = current_user.tenant_id
    
    # Only admins can create apiversionings for other tenants
    if not current_user.is_admin() and data.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot create apiversioning for another tenant")
        
    return service.create(data)

@router.put(
    "/{apiversioning_id}", 
    response_model=APIVersioningResponse,
    summary="Update a apiversioning",
    description="Update an existing apiversioning with the provided data",
    tags=["apiversionings"]
)
async def update_apiversioning(
    apiversioning_id: int,
    data: APIVersioningUpdate,
    service: APIVersioningService = Depends(get_apiversioning_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Update a apiversioning.
    
    Args:
        apiversioning_id: ID of the apiversioning to update
        data: APIVersioning update data
        service: APIVersioningService instance
        current_user: Authenticated user
        
    Returns:
        Updated APIVersioning object
    """
    # Get the existing apiversioning to check permissions
    existing_apiversioning = service.get_by_id(apiversioning_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_apiversioning.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this apiversioning")
        
    return service.update(apiversioning_id, data)

@router.delete(
    "/{apiversioning_id}",
    summary="Delete a apiversioning",
    description="Delete an existing apiversioning by its ID",
    tags=["apiversionings"]
)
async def delete_apiversioning(
    apiversioning_id: int,
    service: APIVersioningService = Depends(get_apiversioning_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Delete a apiversioning.
    
    Args:
        apiversioning_id: ID of the apiversioning to delete
        service: APIVersioningService instance
        current_user: Authenticated user
        
    Returns:
        Success message
    """
    # Get the existing apiversioning to check permissions
    existing_apiversioning = service.get_by_id(apiversioning_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_apiversioning.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this apiversioning")
        
    service.delete(apiversioning_id)
    return {"message": f"APIVersioning with ID {apiversioning_id} successfully deleted"}
