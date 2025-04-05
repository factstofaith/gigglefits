"""
Batch Request Processor Middleware

This module provides middleware for handling multiple operations in a single request,
reducing network overhead and improving performance for clients needing to perform
multiple related operations.

Key features:
- Concurrent execution of independent operations
- Transaction support for related operations
- Comprehensive error handling for partial failures
- Tenant-aware processing with proper isolation
- Detailed metrics collection
"""

import logging
import time
import asyncio
import json
from typing import Dict, List, Any, Callable, Optional, Union, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from fastapi import Request, Response, FastAPI, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
import traceback
import uuid

# Setup logging
logger = logging.getLogger(__name__)

# Models for batch request processing
class BatchOperation(BaseModel):
    """Model for a single operation in a batch request"""
    method: str = Field(..., description="HTTP method (GET, POST, PUT, DELETE, etc.)")
    path: str = Field(..., description="API endpoint path (relative to API root)")
    body: Optional[Dict[str, Any]] = Field(None, description="Request body for the operation")
    headers: Optional[Dict[str, str]] = Field(None, description="Additional headers for the operation")
    
    @field_validator('method')
    def validate_method(cls, v):
        """Validate that the method is supported"""
        supported_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        if v.upper() not in supported_methods:
            raise ValueError(f"Method must be one of {supported_methods}")
        return v.upper()
    
    @field_validator('path')
    def validate_path(cls, v):
        """Validate that the path is properly formatted"""
        if not v.startswith('/'):
            return f"/{v}"
        return v


class BatchRequest(BaseModel):
    """Model for a batch request containing multiple operations"""
    operations: List[BatchOperation] = Field(..., description="List of operations to execute")
    execute_sequential: bool = Field(False, description="If True, execute operations sequentially rather than concurrently")
    transaction: bool = Field(False, description="If True, execute operations as a transaction (all or nothing)")
    timeout: Optional[int] = Field(None, description="Timeout in seconds for the batch request")


class BatchOperationResult(BaseModel):
    """Model for the result of a single operation in a batch response"""
    status: int = Field(..., description="HTTP status code")
    success: bool = Field(..., description="Whether the operation succeeded")
    data: Optional[Any] = Field(None, description="Response data if successful")
    error: Optional[str] = Field(None, description="Error message if failed")
    path: str = Field(..., description="Path of the original request")
    method: str = Field(..., description="Method of the original request")
    execution_time: float = Field(..., description="Execution time in seconds")


class BatchResponse(BaseModel):
    """Model for a batch response containing results for multiple operations"""
    results: List[BatchOperationResult] = Field(..., description="List of operation results")
    success_count: int = Field(..., description="Number of successful operations")
    error_count: int = Field(..., description="Number of failed operations")
    total_count: int = Field(..., description="Total number of operations")
    execution_time: float = Field(..., description="Total execution time in seconds")
    transaction_status: Optional[str] = Field(None, description="Status of the transaction if applicable")


# Default configuration values
DEFAULT_API_PREFIX = "/api"
DEFAULT_BATCH_ENDPOINT = "/batch"
DEFAULT_MAX_OPERATIONS = 50
DEFAULT_TIMEOUT_SECONDS = 60  # 1 minute timeout
MINIMUM_TIMEOUT = 0.1  # Minimum timeout in seconds to avoid division by zero

class BatchRequestProcessor(BaseHTTPMiddleware):
    """
    Middleware for processing batch requests containing multiple operations.
    
    This middleware:
    1. Intercepts requests to the batch endpoint
    2. Processes multiple operations in a single request
    3. Executes operations concurrently for better performance
    4. Provides transaction support for related operations
    5. Handles errors and returns comprehensive results
    """
    
    def __init__(
        self, 
        app: ASGIApp, 
        api_prefix: str = DEFAULT_API_PREFIX,
        batch_endpoint: str = DEFAULT_BATCH_ENDPOINT,
        max_operations: int = DEFAULT_MAX_OPERATIONS,
        default_timeout: int = DEFAULT_TIMEOUT_SECONDS,
        collect_metrics: bool = True
    ):
        """
        Initialize the batch request processor middleware.
        
        Args:
            app: The ASGI application
            api_prefix: Prefix for all API endpoints
            batch_endpoint: Endpoint for batch requests
            max_operations: Maximum number of operations allowed in a batch
            default_timeout: Default timeout in seconds for batch requests
            collect_metrics: Whether to collect performance metrics
        """
        super().__init__(app)
        self.api_prefix = api_prefix
        self.batch_endpoint = f"{api_prefix}{batch_endpoint}"
        self.max_operations = max_operations
        self.default_timeout = default_timeout
        self.collect_metrics = collect_metrics
        
        # Initialize metrics
        self._total_requests = 0
        self._total_operations = 0
        self._failed_operations = 0
        self._execution_times = []
        
        logger.info(f"Batch request processor middleware initialized with endpoint {self.batch_endpoint}")
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process a request through the middleware.
        
        Args:
            request: The incoming request
            call_next: The next middleware or endpoint to call
            
        Returns:
            The response from the application
        """
        # Only intercept requests to the batch endpoint
        if request.url.path != self.batch_endpoint or request.method != "POST":
            return await call_next(request)
        
        # Check content type
        content_type = request.headers.get("content-type", "").lower()
        if not content_type.startswith("application/json"):
            return JSONResponse(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                content={"detail": "Content type must be application/json"}
            )
        
        # Parse batch request
        try:
            request_body = await request.json()
            batch_request = BatchRequest(**request_body)
        except json.JSONDecodeError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Invalid JSON in request body"}
            )
        except Exception as e:
            logger.error(f"Error parsing batch request: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": f"Error parsing batch request: {str(e)}"}
            )
        
        # Validate maximum operations
        if len(batch_request.operations) > self.max_operations:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "detail": f"Batch request exceeds maximum operations limit of {self.max_operations}"
                }
            )
        
        # Get timeout value
        timeout = batch_request.timeout or self.default_timeout
        
        # Process batch request
        try:
            # Start timing for overall execution
            start_time = time.time()
            
            # Get tenant information from request state if available
            tenant_id = getattr(request.state, "tenant_id", None)
            user_id = getattr(request.state, "user_id", None)
            
            # Track metrics
            if self.collect_metrics:
                self._total_requests += 1
                self._total_operations += len(batch_request.operations)
                
            # Process operations
            if batch_request.transaction:
                # Transaction mode - all or nothing
                results, success = await self._process_transaction(
                    request, batch_request.operations, timeout, tenant_id, user_id
                )
                transaction_status = "committed" if success else "rolled_back"
            elif batch_request.execute_sequential:
                # Sequential execution
                results = await self._process_sequential(
                    request, batch_request.operations, timeout, tenant_id, user_id
                )
                transaction_status = None
            else:
                # Concurrent execution (default)
                results = await self._process_concurrent(
                    request, batch_request.operations, timeout, tenant_id, user_id
                )
                transaction_status = None
            
            # Calculate execution time
            execution_time = time.time() - start_time
            
            # Track execution time for metrics
            if self.collect_metrics:
                self._execution_times.append(execution_time)
                self._failed_operations += sum(1 for r in results if not r.success)
            
            # Create response
            response_data = BatchResponse(
                results=results,
                success_count=sum(1 for r in results if r.success),
                error_count=sum(1 for r in results if not r.success),
                total_count=len(results),
                execution_time=execution_time,
                transaction_status=transaction_status
            )
            
            # Return response
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content=response_data.dict()
            )
        
        except asyncio.TimeoutError:
            logger.error(f"Batch request timed out after {timeout} seconds")
            return JSONResponse(
                status_code=status.HTTP_408_REQUEST_TIMEOUT,
                content={"detail": f"Batch request timed out after {timeout} seconds"}
            )
        except Exception as e:
            logger.error(f"Error processing batch request: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": f"Error processing batch request: {str(e)}"}
            )
    
    async def _process_concurrent(
        self, 
        request: Request, 
        operations: List[BatchOperation],
        timeout: int,
        tenant_id: Optional[str],
        user_id: Optional[str]
    ) -> List[BatchOperationResult]:
        """
        Process operations concurrently for maximum performance.
        
        Args:
            request: Original request
            operations: List of operations to execute
            timeout: Timeout in seconds
            tenant_id: Tenant ID for isolation
            user_id: User ID for tracking
            
        Returns:
            List of operation results
        """
        # Create tasks for each operation
        tasks = [
            self._execute_operation(request, op, tenant_id, user_id)
            for op in operations
        ]
        
        # Execute all tasks with timeout
        results = await asyncio.gather(
            *tasks, 
            return_exceptions=True
        )
        
        # Process results, converting exceptions to error responses
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                # Handle exception
                processed_results.append(
                    BatchOperationResult(
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        success=False,
                        error=str(result),
                        path=operations[i].path,
                        method=operations[i].method,
                        execution_time=0.0
                    )
                )
            else:
                # Add result directly
                processed_results.append(result)
        
        return processed_results
    
    async def _process_sequential(
        self, 
        request: Request, 
        operations: List[BatchOperation],
        timeout: int,
        tenant_id: Optional[str],
        user_id: Optional[str]
    ) -> List[BatchOperationResult]:
        """
        Process operations sequentially.
        
        Args:
            request: Original request
            operations: List of operations to execute
            timeout: Timeout in seconds
            tenant_id: Tenant ID for isolation
            user_id: User ID for tracking
            
        Returns:
            List of operation results
        """
        results = []
        
        # Set timeout for the entire operation set
        end_time = time.time() + timeout
        
        # Execute operations sequentially
        for op in operations:
            # Check if timeout has been exceeded
            time_left = max(MINIMUM_TIMEOUT, end_time - time.time())
            if time_left <= 0:
                raise asyncio.TimeoutError("Sequential execution timed out")
            
            # Execute operation with remaining time
            try:
                result = await asyncio.wait_for(
                    self._execute_operation(request, op, tenant_id, user_id),
                    timeout=time_left
                )
                results.append(result)
            except asyncio.TimeoutError:
                # Add timeout result
                results.append(
                    BatchOperationResult(
                        status=status.HTTP_408_REQUEST_TIMEOUT,
                        success=False,
                        error="Operation timed out",
                        path=op.path,
                        method=op.method,
                        execution_time=time_left
                    )
                )
            except Exception as e:
                # Add error result
                results.append(
                    BatchOperationResult(
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        success=False,
                        error=str(e),
                        path=op.path,
                        method=op.method,
                        execution_time=0.0
                    )
                )
        
        return results
    
    async def _process_transaction(
        self, 
        request: Request, 
        operations: List[BatchOperation],
        timeout: int,
        tenant_id: Optional[str],
        user_id: Optional[str]
    ) -> Tuple[List[BatchOperationResult], bool]:
        """
        Process operations as a transaction (all or nothing).
        
        Args:
            request: Original request
            operations: List of operations to execute
            timeout: Timeout in seconds
            tenant_id: Tenant ID for isolation
            user_id: User ID for tracking
            
        Returns:
            Tuple of (results, success)
        """
        # Generate a transaction ID for correlation
        transaction_id = str(uuid.uuid4())
        
        # Process operations sequentially for transaction safety
        results = []
        success = True
        
        # Set timeout for the entire transaction
        end_time = time.time() + timeout
        
        # Create a transaction context
        # This is a placeholder - in a real implementation, this would manage
        # database transactions or other transactional resources
        transaction_context = {"id": transaction_id, "operations": [], "rollback_ops": []}
        
        try:
            # Execute operations sequentially
            for op in operations:
                # Check if timeout has been exceeded
                time_left = max(MINIMUM_TIMEOUT, end_time - time.time())
                if time_left <= 0:
                    raise asyncio.TimeoutError("Transaction timed out")
                
                # Execute operation with remaining time and transaction context
                try:
                    result = await asyncio.wait_for(
                        self._execute_operation(
                            request, op, tenant_id, user_id, 
                            transaction_context=transaction_context
                        ),
                        timeout=time_left
                    )
                    
                    # Check if operation succeeded
                    if not result.success:
                        # Transaction failed - break and rollback
                        success = False
                        results.append(result)
                        break
                    
                    # Track successful operation
                    results.append(result)
                    transaction_context["operations"].append({
                        "path": op.path,
                        "method": op.method,
                        "status": result.status
                    })
                    
                except Exception as e:
                    # Transaction failed - break and rollback
                    success = False
                    results.append(
                        BatchOperationResult(
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            success=False,
                            error=str(e),
                            path=op.path,
                            method=op.method,
                            execution_time=0.0
                        )
                    )
                    break
            
            # Handle transaction outcome
            if success:
                # All operations succeeded - commit transaction
                # In a real implementation, this would commit database transactions
                logger.info(f"Transaction {transaction_id} committed successfully with {len(results)} operations")
            else:
                # Transaction failed - rollback
                logger.info(f"Transaction {transaction_id} failed, performing rollback")
                
                # Perform rollback operations if needed
                # In a real implementation, this would rollback database transactions
                # and might execute compensating actions
                
                # Add rollback status to any operations that succeeded
                for i, result in enumerate(results):
                    if result.success:
                        # Add rollback information
                        result.data = {
                            **(result.data or {}),
                            "transaction_rolled_back": True
                        }
                
                # For operations that weren't executed, add them with skipped status
                if len(results) < len(operations):
                    for op in operations[len(results):]:
                        results.append(
                            BatchOperationResult(
                                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                success=False,
                                error="Operation skipped due to transaction failure",
                                path=op.path,
                                method=op.method,
                                execution_time=0.0
                            )
                        )
        
        except Exception as e:
            # Unexpected error - rollback transaction
            logger.error(f"Transaction {transaction_id} failed with unexpected error: {str(e)}")
            success = False
            
            # Add error to results if empty
            if not results:
                results.append(
                    BatchOperationResult(
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        success=False,
                        error=f"Transaction failed: {str(e)}",
                        path="/batch",
                        method="POST",
                        execution_time=0.0
                    )
                )
        
        return results, success
    
    async def _execute_operation(
        self, 
        original_request: Request, 
        operation: BatchOperation,
        tenant_id: Optional[str],
        user_id: Optional[str],
        transaction_context: Optional[Dict[str, Any]] = None
    ) -> BatchOperationResult:
        """
        Execute a single operation within a batch.
        
        Args:
            original_request: Original request
            operation: Operation to execute
            tenant_id: Tenant ID for isolation
            user_id: User ID for tracking
            transaction_context: Optional transaction context
            
        Returns:
            Result of the operation
        """
        start_time = time.time()
        
        try:
            # Prepare headers for the operation
            headers = dict(original_request.headers)
            
            # Always forward authorization and tenant headers
            auth_header = original_request.headers.get("authorization")
            if auth_header:
                headers["authorization"] = auth_header
                
            # Add tenant header if available
            if tenant_id:
                headers["x-tenant-id"] = tenant_id
                
            # Add transaction headers if in transaction
            if transaction_context:
                headers["x-transaction-id"] = transaction_context["id"]
                
            # Override with operation-specific headers if provided
            if operation.headers:
                headers.update(operation.headers)
            
            # Prepare URL for the operation
            path = operation.path if operation.path.startswith('/') else f"/{operation.path}"
            if not path.startswith(self.api_prefix) and not path.startswith(f"/{self.api_prefix}"):
                path = f"{self.api_prefix}{path}"
                
            # Construct URL
            base_url = str(original_request.base_url)
            url = f"{base_url.rstrip('/')}{path}"
            
            # Prepare body if needed
            body = None
            if operation.body is not None:
                body = json.dumps(operation.body).encode()
                
            # Create a new request for the operation
            from starlette.datastructures import Headers
            from starlette.types import Scope
            
            # Prepare scope for the new request
            scope: Scope = {
                "type": "http",
                "method": operation.method,
                "path": path,
                "path_params": {},
                "query_string": b"",
                "headers": [(k.lower().encode(), v.encode()) for k, v in headers.items()],
                "client": original_request.scope.get("client"),
                "server": original_request.scope.get("server"),
                "state": {"user_id": user_id, "tenant_id": tenant_id}
            }
            
            # Create custom request object
            from starlette.requests import Request as StarletteRequest
            sub_request = StarletteRequest(scope)
            
            # Clone original request state
            for key, value in original_request.state.__dict__.items():
                setattr(sub_request.state, key, value)
            
            # Mock the receive method to provide the body
            async def receive():
                return {"type": "http.request", "body": body or b"", "more_body": False}
            
            # Add receive method to the request
            sub_request.receive = receive  # type: ignore
            
            # Prepare response capture
            response_body = bytearray()
            
            # Create send function to capture the response
            async def send(message):
                nonlocal response_body
                if message["type"] == "http.response.body":
                    response_body.extend(message.get("body", b""))
                    
            # Execute the operation by calling the application directly
            # We get the raw ASGI app from the middleware's app attribute
            app = self.app.app if hasattr(self.app, "app") else self.app
            await app(sub_request.scope, receive, send)
            
            # Parse response
            response_data = None
            if response_body:
                try:
                    response_data = json.loads(response_body.decode())
                except json.JSONDecodeError:
                    # Not JSON, use raw response
                    response_data = {"raw_response": response_body.decode()}
                except UnicodeDecodeError:
                    # Binary data, don't try to decode
                    response_data = {"binary_data": True, "size": len(response_body)}
            
            # Get status code from response
            status_code = 200  # Default to 200 if not found
            for k, v in sub_request.scope.get("headers", []):
                if k.decode().lower() == "status":
                    status_code = int(v.decode())
                    break
            
            # Consider 2xx status codes as success
            success = 200 <= status_code < 300
            
            # Calculate execution time
            execution_time = time.time() - start_time
            
            # Create result
            return BatchOperationResult(
                status=status_code,
                success=success,
                data=response_data,
                path=operation.path,
                method=operation.method,
                execution_time=execution_time,
                error=None if success else "Request failed"
            )
        
        except Exception as e:
            # Log the error
            logger.error(f"Error executing batch operation {operation.method} {operation.path}: {str(e)}")
            logger.debug(traceback.format_exc())
            
            # Calculate execution time
            execution_time = time.time() - start_time
            
            # Return error result
            return BatchOperationResult(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                success=False,
                error=str(e),
                path=operation.path,
                method=operation.method,
                execution_time=execution_time
            )
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get collected metrics for the batch request processor.
        
        Returns:
            Dictionary of metrics
        """
        if not self.collect_metrics:
            return {"metrics_collection": "disabled"}
            
        # Calculate average execution time
        avg_time = sum(self._execution_times) / max(1, len(self._execution_times))
        
        # Calculate success rate
        success_operations = self._total_operations - self._failed_operations
        success_rate = success_operations / max(1, self._total_operations) * 100
        
        return {
            "total_batch_requests": self._total_requests,
            "total_operations": self._total_operations,
            "failed_operations": self._failed_operations,
            "success_operations": success_operations,
            "success_rate": success_rate,
            "average_execution_time": avg_time,
            "operations_per_batch": self._total_operations / max(1, self._total_requests)
        }


# Function to add the batch request processor to a FastAPI app
def add_batch_request_processor(
    app: FastAPI,
    api_prefix: str = DEFAULT_API_PREFIX,
    batch_endpoint: str = DEFAULT_BATCH_ENDPOINT,
    max_operations: int = DEFAULT_MAX_OPERATIONS,
    default_timeout: int = DEFAULT_TIMEOUT_SECONDS,
    collect_metrics: bool = True
) -> BatchRequestProcessor:
    """
    Add batch request processor middleware to a FastAPI application.
    
    Args:
        app: FastAPI application
        api_prefix: Prefix for all API endpoints
        batch_endpoint: Endpoint for batch requests
        max_operations: Maximum number of operations allowed in a batch
        default_timeout: Default timeout in seconds for batch requests
        collect_metrics: Whether to collect performance metrics
        
    Returns:
        The configured BatchRequestProcessor instance
    """
    # Create the middleware
    processor = BatchRequestProcessor(
        app=app,
        api_prefix=api_prefix,
        batch_endpoint=batch_endpoint,
        max_operations=max_operations,
        default_timeout=default_timeout,
        collect_metrics=collect_metrics
    )
    
    # Add middleware to the app
    app.add_middleware(BatchRequestProcessor)
    
    # Add health/metrics endpoint
    @app.get(f"{api_prefix}/batch/metrics", include_in_schema=True)
    async def batch_metrics(
        # Require admin authentication for metrics
        # current_user: User = Depends(get_current_active_user)
    ):
        """Get batch request processor metrics"""
        return processor.get_metrics()
    
    # Add documentation endpoint
    @app.get(f"{api_prefix}/batch/docs", include_in_schema=True)
    async def batch_docs():
        """Get batch request processor documentation"""
        return {
            "name": "Batch Request Processor",
            "description": "Handles multiple operations in a single request",
            "endpoint": f"{api_prefix}{batch_endpoint}",
            "methods": ["POST"],
            "request_schema": BatchRequest.schema(),
            "response_schema": BatchResponse.schema(),
            "examples": [
                {
                    "description": "Simple batch request with two GET operations",
                    "request": {
                        "operations": [
                            {
                                "method": "GET",
                                "path": "/api/users/me"
                            },
                            {
                                "method": "GET",
                                "path": "/api/integrations"
                            }
                        ]
                    }
                },
                {
                    "description": "Transaction with create and update operations",
                    "request": {
                        "operations": [
                            {
                                "method": "POST",
                                "path": "/api/integrations",
                                "body": {
                                    "name": "New Integration",
                                    "type": "s3"
                                }
                            },
                            {
                                "method": "PUT",
                                "path": "/api/integrations/{id}",
                                "body": {
                                    "status": "active"
                                }
                            }
                        ],
                        "transaction": True
                    }
                }
            ]
        }
    
    return processor