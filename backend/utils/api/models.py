"""
Standard response models for API standardization.

This module provides standardized response models for API endpoints,
including pagination support and error handling.
"""

import datetime
from typing import Generic, List, Optional, TypeVar, Dict, Any, Union

from pydantic import BaseModel, Field

# Generic type for response data
T = TypeVar('T')


class ResponseBase(BaseModel):
    """Base class for all API responses."""
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class ErrorDetail(BaseModel):
    """
    Detailed error information.
    
    This model provides structured error details for debugging
    and client error handling.
    """
    code: str = Field(..., description="Error code for programmatic handling")
    message: str = Field(..., description="Human-readable error message")
    detail: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    path: Optional[str] = Field(None, description="API path that caused the error")
    timestamp: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow,
        description="UTC timestamp when the error occurred"
    )


class StandardResponse(ResponseBase):
    """
    Standard response format for simple operations.
    
    This model provides a consistent response structure for operations
    that don't return complex data objects.
    """
    status: str = Field("success", description="Status of the operation")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(None, description="Optional data payload")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "success",
                "message": "Operation completed successfully",
                "data": {"id": 123}
            }
        }
    }


class ErrorResponse(ResponseBase):
    """
    Standard error response format.
    
    This model provides a consistent error response structure across
    all API endpoints.
    """
    error: ErrorDetail


class PaginationMeta(BaseModel):
    """
    Pagination metadata.
    
    This model provides information about pagination for
    responses that return multiple items.
    """
    total: int = Field(..., description="Total number of items")
    limit: int = Field(..., description="Maximum number of items per page")
    skip: int = Field(..., description="Number of items skipped")
    page: int = Field(..., description="Current page number (1-indexed)")
    pages: int = Field(..., description="Total number of pages")


class Meta(BaseModel):
    """
    Response metadata.
    
    This model provides additional information about the response
    such as pagination details.
    """
    pagination: Optional[PaginationMeta] = Field(None, description="Pagination information")
    timestamp: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow,
        description="UTC timestamp when the response was generated"
    )
    # Add other metadata fields as needed


class DataResponse(ResponseBase, Generic[T]):
    """
    Standard data response format.
    
    This model provides a consistent data response structure across
    all API endpoints.
    """
    data: T
    meta: Optional[Meta] = Field(default_factory=Meta, description="Response metadata")


class PaginatedResponse(ResponseBase, Generic[T]):
    """
    Standard paginated response format.
    
    This model provides a consistent paginated response structure across
    all API endpoints that return multiple items.
    """
    data: List[T]
    meta: Meta = Field(..., description="Response metadata with pagination")


# Factory functions for creating standardized responses

def create_response(data: Any) -> DataResponse:
    """
    Create a standardized data response.
    
    Args:
        data: The response data
        
    Returns:
        A standardized DataResponse
    """
    return DataResponse(data=data, meta=Meta())


def create_paginated_response(
    items: List[Any], 
    total: int, 
    skip: int, 
    limit: int
) -> PaginatedResponse:
    """
    Create a standardized paginated response.
    
    Args:
        items: The list of items for the current page
        total: The total number of items
        skip: The number of items skipped
        limit: The maximum number of items per page
        
    Returns:
        A standardized PaginatedResponse
    """
    pages = (total + limit - 1) // limit if limit > 0 else 1
    page = (skip // limit) + 1 if limit > 0 else 1
    
    meta = Meta(
        pagination=PaginationMeta(
            total=total,
            limit=limit,
            skip=skip,
            page=page,
            pages=pages
        )
    )
    
    return PaginatedResponse(data=items, meta=meta)


def create_error_response(
    code: str,
    message: str,
    detail: Optional[Dict[str, Any]] = None,
    path: Optional[str] = None
) -> ErrorResponse:
    """
    Create a standardized error response.
    
    Args:
        code: Error code for programmatic handling
        message: Human-readable error message
        detail: Additional error details
        path: API path that caused the error
        
    Returns:
        A standardized ErrorResponse
    """
    error_detail = ErrorDetail(
        code=code,
        message=message,
        detail=detail,
        path=path,
        timestamp=datetime.datetime.utcnow()
    )
    
    return ErrorResponse(error=error_detail)


def create_standard_response(
    message: str,
    data: Optional[Dict[str, Any]] = None,
    status: str = "success"
) -> StandardResponse:
    """
    Create a standardized response for simple operations.
    
    Args:
        message: Response message
        data: Optional data payload
        status: Status of the operation (defaults to "success")
        
    Returns:
        A standardized StandardResponse
    """
    return StandardResponse(
        status=status,
        message=message,
        data=data
    )