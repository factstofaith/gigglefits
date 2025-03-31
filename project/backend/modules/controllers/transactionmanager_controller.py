"""
TransactionManager Controller

API routes for transactionmanager operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Security
from sqlalchemy.orm import Session

from core.auth import get_current_active_user
from db.base import get_db
from db.models import User as DbUser

from .models import TransactionManagerResponse, TransactionManagerCreate, TransactionManagerUpdate
from .service import TransactionManagerService

# Create router for transactionmanager endpoints
router = APIRouter(prefix="/api/transactionmanagers")

# Dependency to get transactionmanager service
def get_transactionmanager_service(db: Session = Depends(get_db)):
    """Get transactionmanager service instance with DB session"""
    return TransactionManagerService(db)

@router.get(
    "/", 
    response_model=List[TransactionManagerResponse],
    summary="Get all transactionmanagers",
    description="Retrieve a list of all transactionmanagers with pagination and optional filtering",
    tags=["transactionmanagers"]
)
async def get_all_transactionmanagers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    tenant_id: Optional[str] = Query(None, description="Optional tenant ID to filter by"),
    service: TransactionManagerService = Depends(get_transactionmanager_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get all transactionmanagers with optional filtering.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        tenant_id: Optional tenant ID to filter by
        service: TransactionManagerService instance
        current_user: Authenticated user
        
    Returns:
        List of transactionmanager objects
    """
    # Apply tenant filtering based on user's tenant unless they're an admin
    if not current_user.is_admin() and current_user.tenant_id:
        tenant_id = current_user.tenant_id
        
    return service.get_all(skip=skip, limit=limit, tenant_id=tenant_id)

@router.get(
    "/{transactionmanager_id}", 
    response_model=TransactionManagerResponse,
    summary="Get a specific transactionmanager",
    description="Retrieve a transactionmanager by its ID",
    tags=["transactionmanagers"]
)
async def get_transactionmanager(
    transactionmanager_id: int = Path(..., description="ID of the transactionmanager to retrieve"),
    service: TransactionManagerService = Depends(get_transactionmanager_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get a transactionmanager by ID.
    
    Args:
        transactionmanager_id: ID of the transactionmanager to retrieve
        service: TransactionManagerService instance
        current_user: Authenticated user
        
    Returns:
        TransactionManager object if found
    """
    transactionmanager = service.get_by_id(transactionmanager_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != transactionmanager.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this transactionmanager")
        
    return transactionmanager

@router.post(
    "/", 
    response_model=TransactionManagerResponse,
    summary="Create a new transactionmanager",
    description="Create a new transactionmanager with the provided data",
    tags=["transactionmanagers"]
)
async def create_transactionmanager(
    data: TransactionManagerCreate,
    service: TransactionManagerService = Depends(get_transactionmanager_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Create a new transactionmanager.
    
    Args:
        data: TransactionManager creation data
        service: TransactionManagerService instance
        current_user: Authenticated user
        
    Returns:
        Newly created TransactionManager object
    """
    # Set tenant_id from current user if not provided and user has a tenant
    if not data.tenant_id and current_user.tenant_id:
        data.tenant_id = current_user.tenant_id
    
    # Only admins can create transactionmanagers for other tenants
    if not current_user.is_admin() and data.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot create transactionmanager for another tenant")
        
    return service.create(data)

@router.put(
    "/{transactionmanager_id}", 
    response_model=TransactionManagerResponse,
    summary="Update a transactionmanager",
    description="Update an existing transactionmanager with the provided data",
    tags=["transactionmanagers"]
)
async def update_transactionmanager(
    transactionmanager_id: int,
    data: TransactionManagerUpdate,
    service: TransactionManagerService = Depends(get_transactionmanager_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Update a transactionmanager.
    
    Args:
        transactionmanager_id: ID of the transactionmanager to update
        data: TransactionManager update data
        service: TransactionManagerService instance
        current_user: Authenticated user
        
    Returns:
        Updated TransactionManager object
    """
    # Get the existing transactionmanager to check permissions
    existing_transactionmanager = service.get_by_id(transactionmanager_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_transactionmanager.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this transactionmanager")
        
    return service.update(transactionmanager_id, data)

@router.delete(
    "/{transactionmanager_id}",
    summary="Delete a transactionmanager",
    description="Delete an existing transactionmanager by its ID",
    tags=["transactionmanagers"]
)
async def delete_transactionmanager(
    transactionmanager_id: int,
    service: TransactionManagerService = Depends(get_transactionmanager_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Delete a transactionmanager.
    
    Args:
        transactionmanager_id: ID of the transactionmanager to delete
        service: TransactionManagerService instance
        current_user: Authenticated user
        
    Returns:
        Success message
    """
    # Get the existing transactionmanager to check permissions
    existing_transactionmanager = service.get_by_id(transactionmanager_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_transactionmanager.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this transactionmanager")
        
    service.delete(transactionmanager_id)
    return {"message": f"TransactionManager with ID {transactionmanager_id} successfully deleted"}
