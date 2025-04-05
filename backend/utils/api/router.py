"""
Router utilities for API standardization.

This module provides utilities for creating standardized API routers.
"""

from typing import List, Optional, Callable
from fastapi import APIRouter, Depends

from core.auth import get_current_active_user


def create_api_router(
    prefix: str,
    module_name: str,
    version: str = "v1",
    tags: Optional[List[str]] = None,
    dependencies: Optional[List[Callable]] = None,
    include_auth: bool = True
) -> APIRouter:
    """
    Create a standardized API router.
    
    This function creates a FastAPI router with standardized configuration
    for consistent API structure across the application.
    
    Args:
        prefix: API prefix without version ("/admin", "/users", etc.)
        module_name: Module name for tagging
        version: API version (default: "v1")
        tags: Optional list of tags for OpenAPI docs
        dependencies: Optional list of dependencies to apply to all routes
        include_auth: Whether to include the authentication dependency (default: True)
    
    Returns:
        Configured FastAPI router
    """
    # Ensure prefix starts with /
    if not prefix.startswith('/'):
        prefix = f'/{prefix}'
    
    # Add version to prefix
    full_prefix = f'/api/{version}{prefix}'
    
    # Set default tags if not provided
    if tags is None:
        tags = [module_name]
    
    # Set default dependencies if not provided
    if dependencies is None:
        dependencies = []
    
    # Add authentication dependency if requested
    if include_auth:
        dependencies.append(Depends(get_current_active_user))
    
    # Create router with standardized configuration
    router = APIRouter(
        prefix=full_prefix,
        tags=tags,
        dependencies=dependencies
    )
    
    return router