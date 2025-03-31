"""
DatasetService Controller

API routes for datasetservice operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Security
from sqlalchemy.orm import Session

from core.auth import get_current_active_user
from db.base import get_db
from db.models import User as DbUser

from .models import DatasetServiceResponse, DatasetServiceCreate, DatasetServiceUpdate
from .service import DatasetServiceService

# Create router for datasetservice endpoints
router = APIRouter(prefix="/api/datasetservices")

# Dependency to get datasetservice service
def get_datasetservice_service(db: Session = Depends(get_db)):
    """Get datasetservice service instance with DB session"""
    return DatasetServiceService(db)

@router.get(
    "/", 
    response_model=List[DatasetServiceResponse],
    summary="Get all datasetservices",
    description="Retrieve a list of all datasetservices with pagination and optional filtering",
    tags=["datasetservices"]
)
async def get_all_datasetservices(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    tenant_id: Optional[str] = Query(None, description="Optional tenant ID to filter by"),
    service: DatasetServiceService = Depends(get_datasetservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get all datasetservices with optional filtering.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        tenant_id: Optional tenant ID to filter by
        service: DatasetServiceService instance
        current_user: Authenticated user
        
    Returns:
        List of datasetservice objects
    """
    # Apply tenant filtering based on user's tenant unless they're an admin
    if not current_user.is_admin() and current_user.tenant_id:
        tenant_id = current_user.tenant_id
        
    return service.get_all(skip=skip, limit=limit, tenant_id=tenant_id)

@router.get(
    "/{datasetservice_id}", 
    response_model=DatasetServiceResponse,
    summary="Get a specific datasetservice",
    description="Retrieve a datasetservice by its ID",
    tags=["datasetservices"]
)
async def get_datasetservice(
    datasetservice_id: int = Path(..., description="ID of the datasetservice to retrieve"),
    service: DatasetServiceService = Depends(get_datasetservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Get a datasetservice by ID.
    
    Args:
        datasetservice_id: ID of the datasetservice to retrieve
        service: DatasetServiceService instance
        current_user: Authenticated user
        
    Returns:
        DatasetService object if found
    """
    datasetservice = service.get_by_id(datasetservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != datasetservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this datasetservice")
        
    return datasetservice

@router.post(
    "/", 
    response_model=DatasetServiceResponse,
    summary="Create a new datasetservice",
    description="Create a new datasetservice with the provided data",
    tags=["datasetservices"]
)
async def create_datasetservice(
    data: DatasetServiceCreate,
    service: DatasetServiceService = Depends(get_datasetservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Create a new datasetservice.
    
    Args:
        data: DatasetService creation data
        service: DatasetServiceService instance
        current_user: Authenticated user
        
    Returns:
        Newly created DatasetService object
    """
    # Set tenant_id from current user if not provided and user has a tenant
    if not data.tenant_id and current_user.tenant_id:
        data.tenant_id = current_user.tenant_id
    
    # Only admins can create datasetservices for other tenants
    if not current_user.is_admin() and data.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot create datasetservice for another tenant")
        
    return service.create(data)

@router.put(
    "/{datasetservice_id}", 
    response_model=DatasetServiceResponse,
    summary="Update a datasetservice",
    description="Update an existing datasetservice with the provided data",
    tags=["datasetservices"]
)
async def update_datasetservice(
    datasetservice_id: int,
    data: DatasetServiceUpdate,
    service: DatasetServiceService = Depends(get_datasetservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Update a datasetservice.
    
    Args:
        datasetservice_id: ID of the datasetservice to update
        data: DatasetService update data
        service: DatasetServiceService instance
        current_user: Authenticated user
        
    Returns:
        Updated DatasetService object
    """
    # Get the existing datasetservice to check permissions
    existing_datasetservice = service.get_by_id(datasetservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_datasetservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this datasetservice")
        
    return service.update(datasetservice_id, data)

@router.delete(
    "/{datasetservice_id}",
    summary="Delete a datasetservice",
    description="Delete an existing datasetservice by its ID",
    tags=["datasetservices"]
)
async def delete_datasetservice(
    datasetservice_id: int,
    service: DatasetServiceService = Depends(get_datasetservice_service),
    current_user: DbUser = Depends(get_current_active_user)
):
    """
    Delete a datasetservice.
    
    Args:
        datasetservice_id: ID of the datasetservice to delete
        service: DatasetServiceService instance
        current_user: Authenticated user
        
    Returns:
        Success message
    """
    # Get the existing datasetservice to check permissions
    existing_datasetservice = service.get_by_id(datasetservice_id)
    
    # Check tenant access permissions
    if not current_user.is_admin() and current_user.tenant_id != existing_datasetservice.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied to this datasetservice")
        
    service.delete(datasetservice_id)
    return {"message": f"DatasetService with ID {datasetservice_id} successfully deleted"}
