"""
API for error monitoring and management.

This module provides FastAPI endpoints for monitoring and managing errors,
including error statistics, error details, and error management actions.
"""

import time
import logging
from typing import Dict, List, Any, Optional, Union
from enum import Enum
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from pydantic import BaseModel, Field

from .reporting import (
    ErrorRecord, ErrorSeverity, ErrorCategory,
    get_error, get_errors, get_error_counts, get_error_rate, get_stats,
    clear_errors, reset_stats
)

# Setup logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/errors",
    tags=["errors"],
    responses={
        404: {"description": "Not found"},
        403: {"description": "Forbidden"},
    }
)

# Response models
class ErrorRecordResponse(BaseModel):
    """Error record API response model."""
    error_id: str
    error_type: str
    message: str
    timestamp: float
    datetime: str
    severity: str
    category: str
    traceback: Optional[str] = None
    context: Dict[str, Any] = Field(default_factory=dict)
    request_id: Optional[str] = None
    container_id: Optional[str] = None
    user_id: Optional[str] = None
    source: Optional[str] = None
    processed: bool = False
    processed_at: Optional[float] = None
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "error_id": "e1234567-e89b-12d3-a456-426614174000",
                "error_type": "DatabaseError",
                "message": "Connection refused",
                "timestamp": 1633027200.123,
                "datetime": "2021-09-30T12:00:00.123000",
                "severity": "error",
                "category": "database",
                "traceback": "Traceback (most recent call last):\n...",
                "context": {"query": "SELECT * FROM users"},
                "request_id": "r1234567-e89b-12d3-a456-426614174000",
                "container_id": "abc123def456",
                "user_id": "user123",
                "source": "app.database.connection",
                "processed": True,
                "processed_at": 1633027200.456
            }
        }
    }


class ErrorCountResponse(BaseModel):
    """Error count API response model."""
    by_type: Optional[Dict[str, int]] = None
    by_severity: Optional[Dict[str, int]] = None
    by_category: Optional[Dict[str, int]] = None
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "by_type": {"DatabaseError": 10, "ValidationError": 5},
                "by_severity": {"error": 10, "warning": 5},
                "by_category": {"database": 10, "validation": 5}
            }
        }
    }

class ErrorRateResponse(BaseModel):
    """Error rate API response model."""
    errors_per_second: float
    window_seconds: int
    error_count: int
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "errors_per_second": 0.5,
                "window_seconds": 60,
                "error_count": 30
            }
        }
    }

class ErrorStatsResponse(BaseModel):
    """Error statistics API response model."""
    total_errors: int
    current_errors: int
    uptime_seconds: float
    errors_per_second: float
    error_rate_1m: float
    error_rate_5m: float
    error_rate_15m: float
    by_severity: Dict[str, int]
    by_category: Dict[str, int]
    top_error_types: Dict[str, int]
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "total_errors": 100,
                "current_errors": 50,
                "uptime_seconds": 3600,
                "errors_per_second": 0.028,
                "error_rate_1m": 0.5,
                "error_rate_5m": 0.4,
                "error_rate_15m": 0.3,
                "by_severity": {"error": 30, "warning": 20},
                "by_category": {"database": 30, "validation": 20},
                "top_error_types": {"DatabaseError": 30, "ValidationError": 20}
            }
        }
    }

class ErrorClearResponse(BaseModel):
    """Error clear API response model."""
    cleared: int
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "cleared": 50
            }
        }
    }


# Check if user has admin permissions (placeholder, replace with actual auth)
async def check_admin(request):
    return True  # Replace with actual auth check


# API endpoints
@router.get("/", response_model=List[ErrorRecordResponse])
async def list_errors(
    severity: Optional[str] = Query(None, description="Filter by severity"),
    category: Optional[str] = Query(None, description="Filter by category"),
    error_type: Optional[str] = Query(None, description="Filter by error type"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of errors to return"),
    since: Optional[float] = Query(None, description="Only return errors after this timestamp"),
    minutes: Optional[int] = Query(None, ge=1, description="Only return errors from the last X minutes"),
    # is_admin: bool = Depends(check_admin)
):
    """
    Get a list of errors with optional filtering.
    
    Args:
        severity: Filter by severity level (debug, info, warning, error, critical, fatal)
        category: Filter by category (system, database, network, etc.)
        error_type: Filter by error type (e.g., DatabaseError)
        limit: Maximum number of errors to return
        since: Only return errors after this timestamp
        minutes: Only return errors from the last X minutes
        
    Returns:
        List of error records
    """
    # Convert string severity to enum if provided
    severity_enum = None
    if severity:
        try:
            severity_enum = ErrorSeverity(severity.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid severity: {severity}. Valid values: {[s.value for s in ErrorSeverity]}"
            )
    
    # Convert string category to enum if provided
    category_enum = None
    if category:
        try:
            category_enum = ErrorCategory(category.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category: {category}. Valid values: {[c.value for c in ErrorCategory]}"
            )
    
    # Calculate 'since' from minutes if provided
    if minutes and not since:
        since = time.time() - (minutes * 60)
    
    # Get errors with filtering
    errors = get_errors(
        severity=severity_enum,
        category=category_enum,
        error_type=error_type,
        limit=limit,
        since=since
    )
    
    # Convert to response model
    return [
        ErrorRecordResponse(
            error_id=e.error_id,
            error_type=e.error_type,
            message=e.message,
            timestamp=e.timestamp,
            datetime=datetime.fromtimestamp(e.timestamp).isoformat(),
            severity=e.severity.value,
            category=e.category.value,
            traceback=e.traceback,
            context=e.context,
            request_id=e.request_id,
            container_id=e.container_id,
            user_id=e.user_id,
            source=e.source,
            processed=e.processed,
            processed_at=e.processed_at
        )
        for e in errors
    ]

@router.get("/{error_id}", response_model=ErrorRecordResponse)
async def get_error_details(
    error_id: str = Path(..., description="ID of the error to get"),
    # is_admin: bool = Depends(check_admin)
):
    """
    Get details of a specific error.
    
    Args:
        error_id: ID of the error to get
        
    Returns:
        Error record details
    """
    error = get_error(error_id)
    if not error:
        raise HTTPException(
            status_code=404,
            detail=f"Error not found: {error_id}"
        )
    
    # Convert to response model
    return ErrorRecordResponse(
        error_id=error.error_id,
        error_type=error.error_type,
        message=error.message,
        timestamp=error.timestamp,
        datetime=datetime.fromtimestamp(error.timestamp).isoformat(),
        severity=error.severity.value,
        category=error.category.value,
        traceback=error.traceback,
        context=error.context,
        request_id=error.request_id,
        container_id=error.container_id,
        user_id=error.user_id,
        source=error.source,
        processed=error.processed,
        processed_at=error.processed_at
    )

@router.get("/counts", response_model=ErrorCountResponse)
async def get_error_count_stats(
    by_severity: bool = Query(True, description="Group by severity level"),
    by_category: bool = Query(True, description="Group by category"),
    by_type: bool = Query(True, description="Group by error type"),
    since: Optional[float] = Query(None, description="Only count errors after this timestamp"),
    minutes: Optional[int] = Query(None, ge=1, description="Only count errors from the last X minutes"),
    # is_admin: bool = Depends(check_admin)
):
    """
    Get error counts by different groupings.
    
    Args:
        by_severity: Group by severity level
        by_category: Group by category
        by_type: Group by error type
        since: Only count errors after this timestamp
        minutes: Only count errors from the last X minutes
        
    Returns:
        Error counts by different groupings
    """
    # Calculate 'since' from minutes if provided
    if minutes and not since:
        since = time.time() - (minutes * 60)
    
    # Get error counts
    counts = get_error_counts(
        by_severity=by_severity,
        by_category=by_category,
        by_type=by_type,
        since=since
    )
    
    # Convert to response model
    return ErrorCountResponse(**counts)

@router.get("/rate", response_model=ErrorRateResponse)
async def get_error_rate_stats(
    window_seconds: int = Query(60, ge=1, le=86400, description="Time window in seconds"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    category: Optional[str] = Query(None, description="Filter by category"),
    # is_admin: bool = Depends(check_admin)
):
    """
    Get the error rate within a time window.
    
    Args:
        window_seconds: Time window in seconds
        severity: Filter by severity level
        category: Filter by category
        
    Returns:
        Error rate in errors per second
    """
    # Convert string severity to enum if provided
    severity_enum = None
    if severity:
        try:
            severity_enum = ErrorSeverity(severity.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid severity: {severity}. Valid values: {[s.value for s in ErrorSeverity]}"
            )
    
    # Convert string category to enum if provided
    category_enum = None
    if category:
        try:
            category_enum = ErrorCategory(category.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category: {category}. Valid values: {[c.value for c in ErrorCategory]}"
            )
    
    # Get error rate
    rate = get_error_rate(
        window_seconds=window_seconds,
        severity=severity_enum,
        category=category_enum
    )
    
    # Filter errors to count them
    filtered_errors = get_errors(
        severity=severity_enum,
        category=category_enum,
        since=time.time() - window_seconds
    )
    
    # Convert to response model
    return ErrorRateResponse(
        errors_per_second=rate,
        window_seconds=window_seconds,
        error_count=len(filtered_errors)
    )

@router.get("/stats", response_model=ErrorStatsResponse)
async def get_error_statistics(
    # is_admin: bool = Depends(check_admin)
):
    """
    Get error statistics.
    
    Returns:
        Error statistics
    """
    # Get error stats
    stats = get_stats()
    
    # Convert to response model
    return ErrorStatsResponse(**stats)

@router.post("/clear", response_model=ErrorClearResponse)
async def clear_all_errors(
    # is_admin: bool = Depends(check_admin)
):
    """
    Clear all errors from memory.
    
    Returns:
        Number of errors cleared
    """
    # Clear errors
    cleared = clear_errors()
    
    # Convert to response model
    return ErrorClearResponse(cleared=cleared)

@router.post("/reset")
async def reset_error_stats(
    # is_admin: bool = Depends(check_admin)
):
    """
    Reset error statistics.
    
    Returns:
        Success message
    """
    # Reset stats
    reset_stats()
    
    return {"status": "success", "message": "Error statistics reset"}

def setup_error_api(app):
    """
    Set up error API endpoints.
    
    Args:
        app: FastAPI application
    """
    app.include_router(router)
    logger.info("Error API endpoints registered")