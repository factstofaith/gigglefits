"""
API utilities for standardized API responses, pagination, and error handling.
"""

from .models import (
    ResponseBase, 
    DataResponse, 
    PaginatedResponse, 
    ErrorResponse, 
    ErrorDetail,
    PaginationMeta,
)
from .router import create_api_router
from .pagination import paginate, get_pagination_params
from .dependencies import get_current_tenant_user, require_permissions

__all__ = [
    'ResponseBase',
    'DataResponse',
    'PaginatedResponse',
    'ErrorResponse',
    'ErrorDetail',
    'PaginationMeta',
    'create_api_router',
    'paginate',
    'get_pagination_params',
    'get_current_tenant_user',
    'require_permissions'
]