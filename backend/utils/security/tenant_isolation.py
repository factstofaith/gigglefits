"""
Multi-tenant isolation utilities for the TAP Integration Platform.

This module provides a standardized implementation of multi-tenant isolation
for the TAP Integration Platform. It defines tenant identification, validation,
and isolation enforcement to ensure separation between tenant resources.

Features:
- Tenant context extraction and validation
- Tenant-based resource filtering
- Cross-tenant access prevention
- Detailed logging for tenant isolation events
- Performance monitoring
- Comprehensive error handling

All tenant isolation functionality is implemented with consistent patterns:
1. Operation ID tracking for correlated logging
2. Performance monitoring with threshold warnings
3. Thread safety for concurrent access
4. Detailed error handling with context
5. Comprehensive docstrings with examples
"""

import logging
import time
import traceback
from typing import Dict, Any, List, Optional, Set, Tuple, Union, Type
from datetime import datetime, timezone
from threading import Lock
import json
import uuid
from fastapi import Request, Response, HTTPException, status, Depends
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field, validator

# Import security monitoring
from .monitoring import (
    SecurityEventType,
    SecurityAlertLevel,
    log_security_event
)

# Setup logging
logger = logging.getLogger(__name__)

# Constants
SLOW_OPERATION_THRESHOLD_MS = 50  # Threshold for logging slow operations (milliseconds)


class TenantIdentifier:
    """
    Tenant identification utility.
    
    This class provides methods for extracting and validating tenant IDs from
    various sources, including HTTP headers, query parameters, path parameters,
    and request state.
    """
    
    # Common tenant ID header variations
    TENANT_HEADERS = [
        "X-Tenant-ID",
        "X-TenantID",
        "Tenant-ID",
        "TenantID",
        "X-Tenant",
        "Tenant"
    ]
    
    # Common tenant ID query param variations
    TENANT_QUERY_PARAMS = [
        "tenant_id",
        "tenantId",
        "tenant",
    ]
    
    # Common tenant ID path param variations
    TENANT_PATH_PARAMS = [
        "tenant_id",
        "tenantId",
        "tenant",
    ]
    
    def __init__(self):
        """Initialize the tenant identifier."""
        # Thread safety for caching
        self._lock = Lock()
        
        # Cache for tenant validation results
        self._validation_cache = {}
    
    def extract_tenant_id(
        self,
        request: Request,
        operation_id: Optional[str] = None,
        required: bool = True
    ) -> Optional[str]:
        """
        Extract the tenant ID from a request.
        
        This method attempts to extract the tenant ID from various sources in
        the following priority order:
        1. Request state (e.g., set by authentication middleware)
        2. HTTP headers (e.g., X-Tenant-ID)
        3. Path parameters (e.g., /api/tenants/{tenant_id}/...)
        4. Query parameters (e.g., ?tenant_id=...)
        
        Args:
            request (Request): The incoming request
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            required (bool, optional): Whether a tenant ID is required. Defaults to True.
            
        Returns:
            Optional[str]: The extracted tenant ID, or None if not found
            
        Raises:
            HTTPException: If tenant ID is required but not found
            
        Example:
            ```python
            from fastapi import Request, Depends
            from backend.utils.security.tenant_isolation import tenant_identifier
            
            @app.get("/api/resources")
            async def get_resources(
                request: Request,
                tenant_id: str = Depends(tenant_identifier.extract_tenant_id)
            ):
                # tenant_id will be automatically extracted from the request
                return {"resources": get_resources_for_tenant(tenant_id)}
            ```
        """
        op_id = operation_id or f"extract_tenant_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # 1. Check request state first (highest priority)
            # This is typically set by authentication middleware
            tenant_id = getattr(request.state, "tenant_id", None)
            if tenant_id:
                logger.debug(f"[{op_id}] Found tenant ID in request state: {tenant_id}")
                return tenant_id
            
            # 2. Check HTTP headers
            for header in self.TENANT_HEADERS:
                tenant_id = request.headers.get(header)
                if tenant_id:
                    logger.debug(f"[{op_id}] Found tenant ID in header '{header}': {tenant_id}")
                    return tenant_id
            
            # 3. Check path parameters
            path_params = request.path_params
            for param in self.TENANT_PATH_PARAMS:
                if param in path_params:
                    tenant_id = path_params[param]
                    logger.debug(f"[{op_id}] Found tenant ID in path parameter '{param}': {tenant_id}")
                    return tenant_id
            
            # 4. Check query parameters
            for param in self.TENANT_QUERY_PARAMS:
                tenant_id = request.query_params.get(param)
                if tenant_id:
                    logger.debug(f"[{op_id}] Found tenant ID in query parameter '{param}': {tenant_id}")
                    return tenant_id
            
            # No tenant ID found
            if required:
                logger.warning(f"[{op_id}] Tenant ID not found in request but was required")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tenant ID is required but was not provided"
                )
            
            logger.debug(f"[{op_id}] No tenant ID found in request (not required)")
            return None
            
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.error(f"[{op_id}] Error extracting tenant ID: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            
            if required:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error processing tenant information"
                )
            
            return None
        finally:
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow tenant extraction: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Tenant extraction completed in {elapsed_ms}ms")
    
    async def validate_tenant_id(
        self,
        tenant_id: str,
        db_session=None,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Validate that a tenant ID exists and is active.
        
        Args:
            tenant_id (str): The tenant ID to validate
            db_session (optional): Database session for validation. Defaults to None.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            bool: True if the tenant ID is valid, False otherwise
            
        Example:
            ```python
            from fastapi import Depends
            from backend.utils.security.tenant_isolation import tenant_identifier
            from backend.db.session import get_db
            
            @app.get("/api/resources")
            async def get_resources(
                tenant_id: str,
                db = Depends(get_db),
                is_valid: bool = Depends(lambda tid=tenant_id, db=db: 
                                        tenant_identifier.validate_tenant_id(tid, db))
            ):
                if not is_valid:
                    raise HTTPException(status_code=404, detail="Tenant not found")
                return {"resources": get_resources_for_tenant(tenant_id)}
            ```
        """
        op_id = operation_id or f"validate_tenant_{int(time.time() * 1000)}"
        start_time = time.time()
        
        # For simple validation without DB, check format
        if not tenant_id:
            logger.warning(f"[{op_id}] Empty tenant ID provided")
            return False
        
        try:
            # Check cache first
            with self._lock:
                if tenant_id in self._validation_cache:
                    cache_entry = self._validation_cache[tenant_id]
                    # Use cached result if it's recent (less than 5 minutes old)
                    if (datetime.now(timezone.utc) - cache_entry["timestamp"]).total_seconds() < 300:
                        logger.debug(f"[{op_id}] Using cached validation result for tenant ID: {tenant_id}")
                        return cache_entry["valid"]
            
            # No valid cache entry, validate from DB
            is_valid = False
            
            if db_session:
                # Lazy import to avoid circular import
                try:
                    # Check if tenant exists and is active
                    from backend.db.models import Tenant
                    
                    tenant = db_session.query(Tenant).filter(
                        Tenant.id == tenant_id,
                        Tenant.status == "active"
                    ).first()
                    
                    is_valid = tenant is not None
                    
                    logger.debug(f"[{op_id}] Validated tenant ID {tenant_id} from database: {'valid' if is_valid else 'invalid'}")
                except Exception as db_error:
                    logger.error(f"[{op_id}] Database error validating tenant ID: {str(db_error)}")
                    # Fall back to format validation only
            
            # If no DB session or DB validation failed, validate format only
            if not db_session or not is_valid:
                # Check if tenant_id follows expected format (implementation dependent)
                # Example: check if it's a valid UUID or has a valid prefix
                if tenant_id.startswith("tenant-") or (
                    len(tenant_id) >= 8 and any(c.isalpha() for c in tenant_id)
                ):
                    is_valid = True
                else:
                    # Try parsing as UUID as a fallback
                    try:
                        uuid_obj = uuid.UUID(tenant_id)
                        is_valid = True
                    except ValueError:
                        is_valid = False
            
            # Cache the result
            with self._lock:
                self._validation_cache[tenant_id] = {
                    "valid": is_valid,
                    "timestamp": datetime.now(timezone.utc)
                }
            
            return is_valid
        
        except Exception as e:
            logger.error(f"[{op_id}] Error validating tenant ID: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            return False
        
        finally:
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow tenant validation: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Tenant validation completed in {elapsed_ms}ms")


class TenantResourceFilter:
    """
    Tenant resource filtering utility.
    
    This class provides methods for filtering resources based on tenant ID,
    preventing cross-tenant access, and enforcing tenant isolation in database
    queries and API responses.
    """
    
    def __init__(self):
        """Initialize the tenant resource filter."""
        # Thread safety for cache
        self._lock = Lock()
    
    def filter_resources(
        self,
        resources: List[Dict[str, Any]],
        tenant_id: str,
        tenant_id_field: str = "tenant_id",
        operation_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Filter a list of resources to only include those belonging to a tenant.
        
        Args:
            resources (List[Dict[str, Any]]): List of resource dictionaries
            tenant_id (str): The tenant ID to filter by
            tenant_id_field (str, optional): The field containing tenant ID. Defaults to "tenant_id".
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            List[Dict[str, Any]]: Filtered list of resources
            
        Example:
            ```python
            from backend.utils.security.tenant_isolation import tenant_filter
            
            # Filter resources to only show those belonging to the tenant
            all_resources = get_all_resources_from_db()
            tenant_resources = tenant_filter.filter_resources(all_resources, "tenant-123")
            return {"resources": tenant_resources}
            ```
        """
        op_id = operation_id or f"filter_resources_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            if not resources:
                return []
                
            if not tenant_id:
                logger.warning(f"[{op_id}] Empty tenant ID provided for resource filtering")
                return []
            
            # Count resources before filtering for logging
            original_count = len(resources)
            
            # Filter resources to only include those matching the tenant ID
            filtered_resources = [
                resource for resource in resources
                if resource.get(tenant_id_field) == tenant_id
            ]
            
            # Log filtering results
            filtered_count = len(filtered_resources)
            if filtered_count < original_count:
                logger.debug(
                    f"[{op_id}] Filtered resources by tenant ID '{tenant_id}': "
                    f"{filtered_count}/{original_count} resources retained"
                )
                
                # If we filtered many resources, log at a higher level
                if filtered_count < original_count / 2:
                    logger.info(
                        f"[{op_id}] Significant tenant filtering: "
                        f"{filtered_count}/{original_count} resources retained for tenant '{tenant_id}'"
                    )
            
            return filtered_resources
            
        except Exception as e:
            logger.error(f"[{op_id}] Error filtering resources by tenant: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return empty list on error to be safe
            return []
            
        finally:
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow resource filtering: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Resource filtering completed in {elapsed_ms}ms")
    
    def add_tenant_filter(
        self, 
        query: Any, 
        tenant_id: str,
        model: Type[Any],
        tenant_id_field: str = "tenant_id",
        operation_id: Optional[str] = None
    ) -> Any:
        """
        Add a tenant filter to a database query.
        
        This method adds a WHERE clause to filter results by tenant ID.
        
        Args:
            query (Any): The database query object (e.g., SQLAlchemy query)
            tenant_id (str): The tenant ID to filter by
            model (Type[Any]): The model class being queried
            tenant_id_field (str, optional): The field containing tenant ID. Defaults to "tenant_id".
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            Any: The modified query object with tenant filter applied
            
        Example:
            ```python
            from backend.utils.security.tenant_isolation import tenant_filter
            from backend.db.models import Resource
            
            @app.get("/api/resources")
            async def get_resources(tenant_id: str, db = Depends(get_db)):
                # Start with a base query
                query = db.query(Resource)
                
                # Apply tenant filtering
                query = tenant_filter.add_tenant_filter(query, tenant_id, Resource)
                
                # Execute the query with tenant isolation
                resources = query.all()
                return {"resources": resources}
            ```
        """
        op_id = operation_id or f"add_tenant_filter_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            if not query:
                logger.warning(f"[{op_id}] Empty query provided for tenant filtering")
                return query
                
            if not tenant_id:
                logger.warning(f"[{op_id}] Empty tenant ID provided for query filtering")
                return query
            
            if not model:
                logger.warning(f"[{op_id}] No model provided for tenant filtering")
                return query
            
            # Add tenant filter to query
            # This assumes SQLAlchemy-style ORM, adjust if using a different ORM
            try:
                tenant_attr = getattr(model, tenant_id_field)
                query = query.filter(tenant_attr == tenant_id)
                
                logger.debug(f"[{op_id}] Added tenant filter to query: {model.__name__}.{tenant_id_field} = '{tenant_id}'")
            except AttributeError:
                logger.error(f"[{op_id}] Model {model.__name__} does not have attribute '{tenant_id_field}'")
            
            return query
            
        except Exception as e:
            logger.error(f"[{op_id}] Error adding tenant filter to query: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return original query on error
            return query
            
        finally:
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow query filtering: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Query filtering completed in {elapsed_ms}ms")
    
    def check_tenant_access(
        self,
        user_tenant_id: str,
        resource_tenant_id: str,
        allow_cross_tenant: bool = False,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Check if cross-tenant access is allowed.
        
        Args:
            user_tenant_id (str): The tenant ID of the user
            resource_tenant_id (str): The tenant ID of the resource
            allow_cross_tenant (bool, optional): Whether to allow cross-tenant access. Defaults to False.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            bool: True if access is allowed, False otherwise
            
        Example:
            ```python
            from backend.utils.security.tenant_isolation import tenant_filter
            
            @app.get("/api/resources/{resource_id}")
            async def get_resource(
                resource_id: str,
                request: Request,
                db = Depends(get_db)
            ):
                # Get the user's tenant ID from request state
                user_tenant_id = request.state.tenant_id
                
                # Get the resource from database
                resource = db.query(Resource).filter(Resource.id == resource_id).first()
                if not resource:
                    raise HTTPException(status_code=404, detail="Resource not found")
                
                # Check tenant access
                if not tenant_filter.check_tenant_access(
                    user_tenant_id, resource.tenant_id
                ):
                    raise HTTPException(status_code=403, detail="Access denied")
                
                return resource
            ```
        """
        op_id = operation_id or f"check_tenant_access_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Fast path: same tenant
            if user_tenant_id == resource_tenant_id:
                return True
            
            # Explicit cross-tenant allowance
            if allow_cross_tenant:
                logger.info(f"[{op_id}] Allowed cross-tenant access from '{user_tenant_id}' to '{resource_tenant_id}'")
                return True
            
            # Log attempted cross-tenant access
            logger.warning(
                f"[{op_id}] Denied cross-tenant access attempt: "
                f"User tenant '{user_tenant_id}' attempted to access resource in tenant '{resource_tenant_id}'"
            )
            
            # Log security event
            log_security_event(
                event_type=SecurityEventType.ACCESS_DENIED,
                user_id=None,  # Unknown user ID at this point
                tenant_id=user_tenant_id,
                resource_type="tenant",
                resource_id=resource_tenant_id,
                alert_level=SecurityAlertLevel.MEDIUM,
                details={
                    "operation_id": op_id,
                    "reason": "cross_tenant_access_attempt",
                    "user_tenant_id": user_tenant_id,
                    "resource_tenant_id": resource_tenant_id
                }
            )
            
            return False
            
        except Exception as e:
            logger.error(f"[{op_id}] Error checking tenant access: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Deny access on error to be safe
            return False
            
        finally:
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow tenant access check: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Tenant access check completed in {elapsed_ms}ms")


class TenantContext:
    """
    Tenant context management utility.
    
    This class provides methods for managing tenant context throughout a request,
    including extracting and validating tenant IDs, setting tenant context in
    request state, and ensuring tenant isolation in responses.
    """
    
    def __init__(self):
        """Initialize the tenant context manager."""
        self.identifier = TenantIdentifier()
        self.filter = TenantResourceFilter()
        
        # Thread safety
        self._lock = Lock()
    
    async def ensure_tenant_context(
        self,
        request: Request,
        db_session=None,
        operation_id: Optional[str] = None,
        required: bool = True
    ) -> Optional[str]:
        """
        Ensure tenant context is set for a request.
        
        This method extracts and validates the tenant ID from a request, and
        sets it in the request state for use by downstream handlers.
        
        Args:
            request (Request): The incoming request
            db_session (optional): Database session for validation. Defaults to None.
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            required (bool, optional): Whether a tenant ID is required. Defaults to True.
            
        Returns:
            Optional[str]: The validated tenant ID, or None if not found/invalid
            
        Raises:
            HTTPException: If tenant ID is required but not found or invalid
            
        Example:
            ```python
            from fastapi import Request, Depends
            from backend.utils.security.tenant_isolation import tenant_context
            from backend.db.session import get_db
            
            async def tenant_middleware(request: Request, call_next):
                # Get DB session for tenant validation
                db = next(get_db())
                
                # Ensure tenant context for the request
                try:
                    await tenant_context.ensure_tenant_context(request, db)
                except HTTPException:
                    # Let the error propagate
                    raise
                finally:
                    db.close()
                
                # Continue processing the request
                return await call_next(request)
            ```
        """
        op_id = operation_id or f"ensure_tenant_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # First, check if tenant ID is already set in request state
            tenant_id = getattr(request.state, "tenant_id", None)
            
            # If not set in request state, extract it from request
            if not tenant_id:
                tenant_id = self.identifier.extract_tenant_id(
                    request=request,
                    operation_id=op_id,
                    required=required
                )
                
                # If tenant_id is None at this point and required=True,
                # extract_tenant_id would have raised an HTTPException
            
            # If we have a tenant ID, validate it
            if tenant_id:
                is_valid = await self.identifier.validate_tenant_id(
                    tenant_id=tenant_id,
                    db_session=db_session,
                    operation_id=op_id
                )
                
                if not is_valid:
                    logger.warning(f"[{op_id}] Invalid tenant ID provided: {tenant_id}")
                    if required:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Tenant not found: {tenant_id}"
                        )
                    return None
                
                # Set in request state for downstream handlers
                request.state.tenant_id = tenant_id
                logger.debug(f"[{op_id}] Set tenant ID in request state: {tenant_id}")
            
            return tenant_id
            
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.error(f"[{op_id}] Error ensuring tenant context: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            
            if required:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error processing tenant information"
                )
            
            return None
        finally:
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow tenant context processing: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Tenant context processing completed in {elapsed_ms}ms")
    
    def filter_response(
        self,
        response_data: Union[Dict[str, Any], List[Dict[str, Any]]],
        tenant_id: str,
        tenant_id_field: str = "tenant_id",
        operation_id: Optional[str] = None
    ) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Filter response data to only include resources for a tenant.
        
        Args:
            response_data (Union[Dict[str, Any], List[Dict[str, Any]]]): Response data to filter
            tenant_id (str): The tenant ID to filter by
            tenant_id_field (str, optional): The field containing tenant ID. Defaults to "tenant_id".
            operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
            
        Returns:
            Union[Dict[str, Any], List[Dict[str, Any]]]: Filtered response data
            
        Example:
            ```python
            from fastapi import Request, Response
            from backend.utils.security.tenant_isolation import tenant_context
            
            @app.middleware("http")
            async def tenant_response_middleware(request: Request, call_next):
                # Process the request and get the response
                response = await call_next(request)
                
                # Only filter JSON responses
                if response.headers.get("content-type") == "application/json":
                    # Get tenant ID from request state
                    tenant_id = getattr(request.state, "tenant_id", None)
                    if tenant_id:
                        # Read response body
                        response_body = await response.body()
                        response_data = json.loads(response_body)
                        
                        # Filter response data
                        filtered_data = tenant_context.filter_response(response_data, tenant_id)
                        
                        # Create new response with filtered data
                        return Response(
                            content=json.dumps(filtered_data),
                            status_code=response.status_code,
                            headers=dict(response.headers),
                            media_type=response.media_type
                        )
                
                return response
            ```
        """
        op_id = operation_id or f"filter_response_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            if not response_data:
                return response_data
                
            if not tenant_id:
                logger.warning(f"[{op_id}] Empty tenant ID provided for response filtering")
                return response_data
            
            # Handle list of resources
            if isinstance(response_data, list):
                return self.filter.filter_resources(
                    resources=response_data,
                    tenant_id=tenant_id,
                    tenant_id_field=tenant_id_field,
                    operation_id=op_id
                )
            
            # Handle dictionary response (could be a single resource or a container)
            if isinstance(response_data, dict):
                # Check if this is a single resource with a tenant ID field
                if tenant_id_field in response_data:
                    # If it's a resource from another tenant, return empty dict or None
                    if response_data[tenant_id_field] != tenant_id:
                        logger.warning(
                            f"[{op_id}] Filtered out resource with tenant ID "
                            f"'{response_data[tenant_id_field]}' (user tenant: '{tenant_id}')"
                        )
                        return {}
                    
                    # Otherwise, return the resource as is
                    return response_data
                
                # Check for common container patterns
                for key, value in response_data.items():
                    if isinstance(value, list) and all(isinstance(item, dict) for item in value):
                        # Filter this list of resources
                        response_data[key] = self.filter.filter_resources(
                            resources=value,
                            tenant_id=tenant_id,
                            tenant_id_field=tenant_id_field,
                            operation_id=op_id
                        )
                
                return response_data
            
            # For other types, return as is
            return response_data
            
        except Exception as e:
            logger.error(f"[{op_id}] Error filtering response by tenant: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return original data on error
            return response_data
            
        finally:
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow response filtering: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Response filtering completed in {elapsed_ms}ms")


# Create global instances for app-wide use
tenant_identifier = TenantIdentifier()
tenant_filter = TenantResourceFilter()
tenant_context = TenantContext()


# FastAPI dependency for tenant ID extraction
async def get_tenant_id(
    request: Request,
    required: bool = True,
    operation_id: Optional[str] = None
) -> Optional[str]:
    """
    FastAPI dependency for extracting tenant ID from request.
    
    Args:
        request (Request): The incoming request
        required (bool, optional): Whether a tenant ID is required. Defaults to True.
        operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
        
    Returns:
        Optional[str]: The extracted tenant ID, or None if not found
        
    Raises:
        HTTPException: If tenant ID is required but not found
        
    Example:
        ```python
        from fastapi import APIRouter, Depends, Request
        from backend.utils.security.tenant_isolation import get_tenant_id
        
        router = APIRouter()
        
        @router.get("/resources")
        async def list_resources(tenant_id: str = Depends(get_tenant_id)):
            # tenant_id is automatically extracted from the request
            return {"resources": get_resources_for_tenant(tenant_id)}
        ```
    """
    op_id = operation_id or f"get_tenant_dep_{int(time.time() * 1000)}"
    
    return tenant_identifier.extract_tenant_id(
        request=request,
        operation_id=op_id,
        required=required
    )


# FastAPI dependency for ensuring tenant context with validation
async def ensure_tenant(
    request: Request,
    required: bool = True,
    operation_id: Optional[str] = None,
    db_session=None
) -> Optional[str]:
    """
    FastAPI dependency for ensuring tenant context with validation.
    
    Args:
        request (Request): The incoming request
        required (bool, optional): Whether a tenant ID is required. Defaults to True.
        operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
        db_session (optional): Database session for validation. Defaults to None.
        
    Returns:
        Optional[str]: The validated tenant ID, or None if not found/invalid
        
    Raises:
        HTTPException: If tenant ID is required but not found or invalid
        
    Example:
        ```python
        from fastapi import APIRouter, Depends, Request
        from backend.utils.security.tenant_isolation import ensure_tenant
        from backend.db.session import get_db
        
        router = APIRouter()
        
        @router.get("/resources")
        async def list_resources(
            db = Depends(get_db),
            tenant_id: str = Depends(lambda request: ensure_tenant(request, db_session=db))
        ):
            # tenant_id is automatically extracted and validated
            return {"resources": get_resources_for_tenant(tenant_id, db)}
        ```
    """
    op_id = operation_id or f"ensure_tenant_dep_{int(time.time() * 1000)}"
    
    return await tenant_context.ensure_tenant_context(
        request=request,
        db_session=db_session,
        operation_id=op_id,
        required=required
    )


# FastAPI dependency for checking cross-tenant access
async def require_same_tenant(
    request: Request,
    resource_tenant_id: str,
    operation_id: Optional[str] = None
) -> None:
    """
    FastAPI dependency for ensuring the user belongs to the same tenant as a resource.
    
    Args:
        request (Request): The incoming request
        resource_tenant_id (str): The tenant ID of the resource being accessed
        operation_id (Optional[str], optional): Correlation ID for logging. Defaults to None.
        
    Raises:
        HTTPException: If the user doesn't belong to the same tenant as the resource
        
    Example:
        ```python
        from fastapi import APIRouter, Depends, Request, Path
        from backend.utils.security.tenant_isolation import require_same_tenant
        from backend.db.session import get_db
        
        router = APIRouter()
        
        @router.get("/resources/{resource_id}")
        async def get_resource(
            resource_id: str = Path(...),
            db = Depends(get_db),
            _: None = Depends(lambda request, rid=resource_id, db=db: 
                             require_same_tenant(request, get_resource_tenant(rid, db)))
        ):
            # If we get here, the user belongs to the same tenant as the resource
            return {"resource": get_resource_by_id(resource_id, db)}
        ```
    """
    op_id = operation_id or f"require_same_tenant_{int(time.time() * 1000)}"
    start_time = time.time()
    
    try:
        # Get user's tenant ID from request state
        user_tenant_id = getattr(request.state, "tenant_id", None)
        
        # If tenant ID not in request state, try to extract it
        if not user_tenant_id:
            user_tenant_id = tenant_identifier.extract_tenant_id(
                request=request,
                operation_id=op_id,
                required=True
            )
        
        # Check tenant access
        has_access = tenant_filter.check_tenant_access(
            user_tenant_id=user_tenant_id,
            resource_tenant_id=resource_tenant_id,
            allow_cross_tenant=False,
            operation_id=op_id
        )
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "TENANT_ACCESS_DENIED",
                    "message": "You don't have permission to access resources in this tenant"
                }
            )
    finally:
        # Log performance metrics
        elapsed_ms = int((time.time() - start_time) * 1000)
        if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
            logger.warning(f"[{op_id}] Slow tenant access verification: {elapsed_ms}ms")
        else:
            logger.debug(f"[{op_id}] Tenant access verification completed in {elapsed_ms}ms")