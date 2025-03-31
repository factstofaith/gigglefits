"""
UserService Controller

API routes for userservice operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Security
from sqlalchemy.orm import Session

from core.auth import get_current_active_user
from db.base import get_db
from db.models import User as DbUser

from .models import UserServiceResponse, UserServiceCreate, UserServiceUpdate
from .service import UserServiceService

# Create router for userservice endpoints
router = APIRouter(prefix="/api/userservices")

# Dependency to get userservice service
def get_userservice_service(db: Session = Depends(get_db)):
    """Get userservice service instance with DB session"""
    return UserServiceService(db)

@router.get(
    "/", 
    response_model=List[UserServiceResponse],
    summary="Get all userservices",
    description="Retrieve a list of all userservices with pagination and optional filtering",
    tags=["userservices"]
)
async def get_all_userservices(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    tenant_id: Optional[str] = Query(None, description="Optional tenant ID to filter by"),
    service: UserServiceService = Depends(get_userservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get all userservices with optional filtering.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        tenant_id: Optional tenant ID to filter by
        service: UserServiceService instance
        current_user: Authenticated user
        
    Returns:
        List of userservice objects
    """
    # Apply tenant filtering based on user's tenant unless they're an admin
    if not current_user.is_admin() and current_user.tenant_id:
        tenant_id = current_user.tenant_id
        
    return service.get_all(skip=skip, limit=limit, tenant_id=tenant_id)

@router.get(
    "/{userservice_id}", 
    response_model=UserServiceResponse,
    summary="Get a specific userservice",
    description="Retrieve a userservice by its ID",
    tags=["userservices"]
)
async def get_userservice(
    userservice_id: int = Path(..., description="ID of the userservice to retrieve"),
    service: UserServiceService = Depends(get_userservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get a userservice by ID.
    
    Args:
        userservice_id: ID of the userservice to retrieve
        service: UserServiceService instance
        current_user: Authenticated user
        
    Returns:
        UserService object if found
    """
    userservice = service.get_by_id(userservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != userservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this userservice")
        
    return userservice

@router.post(
    "/", 
    response_model=UserServiceResponse,
    summary="Create a new userservice",
    description="Create a new userservice with the provided data",
    tags=["userservices"]
)
async def create_userservice(
    data: UserServiceCreate,
    service: UserServiceService = Depends(get_userservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Create a new userservice.
    
    Args:
        data: UserService creation data
        service: UserServiceService instance
        current_user: Authenticated user
        
    Returns:
        Newly created UserService object
    """
    # Set tenant_id from current user if not provided and user has a tenant
    if not data.tenant_id and current_user.tenant_id:
        data.tenant_id = current_user.tenant_id
    
    # Only admins can create userservices for other tenants
    if not current_user.is_admin() and data.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot create userservice for another tenant")
        
    return service.create(data)

@router.put(
    "/{userservice_id}", 
    response_model=UserServiceResponse,
    summary="Update a userservice",
    description="Update an existing userservice with the provided data",
    tags=["userservices"]
)
async def update_userservice(
    userservice_id: int,
    data: UserServiceUpdate,
    service: UserServiceService = Depends(get_userservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Update a userservice.
    
    Args:
        userservice_id: ID of the userservice to update
        data: UserService update data
        service: UserServiceService instance
        current_user: Authenticated user
        
    Returns:
        Updated UserService object
    """
    # Get the existing userservice to check permissions
    existing_userservice = service.get_by_id(userservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_userservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this userservice")
        
    return service.update(userservice_id, data)

@router.delete(
    "/{userservice_id}",
    summary="Delete a userservice",
    description="Delete an existing userservice by its ID",
    tags=["userservices"]
)
async def delete_userservice(
    userservice_id: int,
    service: UserServiceService = Depends(get_userservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Delete a userservice.
    
    Args:
        userservice_id: ID of the userservice to delete
        service: UserServiceService instance
        current_user: Authenticated user
        
    Returns:
        Success message
    """
    # Get the existing userservice to check permissions
    existing_userservice = service.get_by_id(userservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_userservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this userservice")
        
    service.delete(userservice_id)
    return {"message": f"UserService with ID {userservice_id} successfully deleted"}
