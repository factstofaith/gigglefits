"""
Pagination utilities for API standardization.

This module provides utilities for handling pagination in API endpoints.
"""

from typing import List, Tuple, TypeVar, Callable, Dict, Any, Optional, Union
from fastapi import Query, Depends
from sqlalchemy.orm import Query as SQLAlchemyQuery

from .models import create_paginated_response, PaginatedResponse

# Generic type for items
T = TypeVar('T')


async def get_pagination_params(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return")
) -> Dict[str, int]:
    """
    Get pagination parameters from query parameters.
    
    This dependency can be used in FastAPI endpoint definitions to extract
    pagination parameters in a standardized way.
    
    Args:
        skip: Number of items to skip (default: 0)
        limit: Maximum number of items to return (default: 100, max: 1000)
        
    Returns:
        Dictionary with skip and limit values
    """
    return {"skip": skip, "limit": limit}


def paginate(
    query: SQLAlchemyQuery, 
    skip: int = 0, 
    limit: int = 100
) -> Tuple[List[Any], int]:
    """
    Paginate a SQLAlchemy query.
    
    This function applies pagination to a SQLAlchemy query and returns
    both the paginated items and the total count.
    
    Args:
        query: SQLAlchemy query to paginate
        skip: Number of items to skip
        limit: Maximum number of items to return
        
    Returns:
        Tuple of (paginated_items, total_count)
    """
    # Get total count without pagination
    total = query.count()
    
    # Apply pagination
    items = query.offset(skip).limit(limit).all()
    
    return items, total


def paginated_response(
    query_func: Callable[[int, int], Tuple[List[T], int]]
) -> Callable:
    """
    Decorator for creating paginated responses.
    
    This decorator simplifies creating paginated endpoints by handling
    the pagination logic and response formatting.
    
    Args:
        query_func: Function that takes skip and limit parameters and returns
                   a tuple of (items, total_count)
    
    Returns:
        Decorated function that returns a PaginatedResponse
    """
    async def wrapper(
        pagination: Dict[str, int] = Depends(get_pagination_params)
    ) -> PaginatedResponse:
        skip = pagination["skip"]
        limit = pagination["limit"]
        
        items, total = query_func(skip, limit)
        
        return create_paginated_response(
            items=items,
            total=total,
            skip=skip,
            limit=limit
        )
        
    return wrapper