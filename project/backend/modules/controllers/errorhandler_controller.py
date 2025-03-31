"""
ErrorHandler Controller

API routes for errorhandler operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Security
from sqlalchemy.orm import Session

from core.auth import get_current_active_user
from db.base import get_db
from db.models import User as DbUser

from .models import ErrorHandlerResponse, ErrorHandlerCreate, ErrorHandlerUpdate
from .service import ErrorHandlerService

# Create router for errorhandler endpoints
router = APIRouter(prefix="/api/errorhandlers")

# Dependency to get errorhandler service
def get_errorhandler_service(db: Session = Depends(get_db)):
    """Get errorhandler service instance with DB session"""
    return ErrorHandlerService(db)

@router.get(
    "/", 
    response_model=List[ErrorHandlerResponse],
    summary="Get all errorhandlers",
    description="Retrieve a list of all errorhandlers with pagination and optional filtering",
    tags=["errorhandlers"]
)
async def get_all_errorhandlers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    tenant_id: Optional[str] = Query(None, description="Optional tenant ID to filter by"),
    service: ErrorHandlerService = Depends(get_errorhandler_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get all errorhandlers with optional filtering.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        tenant_id: Optional tenant ID to filter by
        service: ErrorHandlerService instance
        current_user: Authenticated user
        
    Returns:
        List of errorhandler objects
    """
    # Apply tenant filtering based on user's tenant unless they're an admin
    if not current_user.is_admin() and current_user.tenant_id:
        tenant_id = current_user.tenant_id
        
    return service.get_all(skip=skip, limit=limit, tenant_id=tenant_id)

@router.get(
    "/{errorhandler_id}", 
    response_model=ErrorHandlerResponse,
    summary="Get a specific errorhandler",
    description="Retrieve a errorhandler by its ID",
    tags=["errorhandlers"]
)
async def get_errorhandler(
    errorhandler_id: int = Path(..., description="ID of the errorhandler to retrieve"),
    service: ErrorHandlerService = Depends(get_errorhandler_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get a errorhandler by ID.
    
    Args:
        errorhandler_id: ID of the errorhandler to retrieve
        service: ErrorHandlerService instance
        current_user: Authenticated user
        
    Returns:
        ErrorHandler object if found
    """
    errorhandler = service.get_by_id(errorhandler_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != errorhandler.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this errorhandler")
        
    return errorhandler

@router.post(
    "/", 
    response_model=ErrorHandlerResponse,
    summary="Create a new errorhandler",
    description="Create a new errorhandler with the provided data",
    tags=["errorhandlers"]
)
async def create_errorhandler(
    data: ErrorHandlerCreate,
    service: ErrorHandlerService = Depends(get_errorhandler_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Create a new errorhandler.
    
    Args:
        data: ErrorHandler creation data
        service: ErrorHandlerService instance
        current_user: Authenticated user
        
    Returns:
        Newly created ErrorHandler object
    """
    # Set tenant_id from current user if not provided and user has a tenant
    if not data.tenant_id and current_user.tenant_id:
        data.tenant_id = current_user.tenant_id
    
    # Only admins can create errorhandlers for other tenants
    if not current_user.is_admin() and data.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot create errorhandler for another tenant")
        
    return service.create(data)

@router.put(
    "/{errorhandler_id}", 
    response_model=ErrorHandlerResponse,
    summary="Update a errorhandler",
    description="Update an existing errorhandler with the provided data",
    tags=["errorhandlers"]
)
async def update_errorhandler(
    errorhandler_id: int,
    data: ErrorHandlerUpdate,
    service: ErrorHandlerService = Depends(get_errorhandler_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Update a errorhandler.
    
    Args:
        errorhandler_id: ID of the errorhandler to update
        data: ErrorHandler update data
        service: ErrorHandlerService instance
        current_user: Authenticated user
        
    Returns:
        Updated ErrorHandler object
    """
    # Get the existing errorhandler to check permissions
    existing_errorhandler = service.get_by_id(errorhandler_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_errorhandler.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this errorhandler")
        
    return service.update(errorhandler_id, data)

@router.delete(
    "/{errorhandler_id}",
    summary="Delete a errorhandler",
    description="Delete an existing errorhandler by its ID",
    tags=["errorhandlers"]
)
async def delete_errorhandler(
    errorhandler_id: int,
    service: ErrorHandlerService = Depends(get_errorhandler_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Delete a errorhandler.
    
    Args:
        errorhandler_id: ID of the errorhandler to delete
        service: ErrorHandlerService instance
        current_user: Authenticated user
        
    Returns:
        Success message
    """
    # Get the existing errorhandler to check permissions
    existing_errorhandler = service.get_by_id(errorhandler_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_errorhandler.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this errorhandler")
        
    service.delete(errorhandler_id)
    return {"message": f"ErrorHandler with ID {errorhandler_id} successfully deleted"}
