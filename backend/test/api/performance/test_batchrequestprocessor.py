"""
Tests for the Batch Request Processor middleware.

This module contains tests for the BatchRequestProcessor middleware which
handles multiple operations in a single request, reducing network overhead
and improving performance.
"""

import json
import pytest
import asyncio
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Request, Response, Depends, HTTPException, status
from fastapi.testclient import TestClient
from starlette.middleware.base import BaseHTTPMiddleware

from utils.api.performance.batchrequestprocessor import (
    BatchRequestProcessor, 
    BatchRequest, 
    BatchOperation,
    BatchResponse,
    BatchOperationResult,
    add_batch_request_processor
)


# Setup test app with various endpoints for testing
def create_test_app():
    """Create a test FastAPI app with endpoints for batch processing tests"""
    app = FastAPI()
    
    # Test data store
    test_data = {
        "items": {
            "1": {"id": "1", "name": "Item 1"},
            "2": {"id": "2", "name": "Item 2"},
            "3": {"id": "3", "name": "Item 3"},
        },
        "users": {
            "1": {"id": "1", "username": "user1"},
            "2": {"id": "2", "username": "user2"},
        }
    }
    
    # Get items endpoint
    @app.get("/api/items")
    async def get_items():
        return list(test_data["items"].values())
    
    # Get item by ID
    @app.get("/api/items/{item_id}")
    async def get_item(item_id: str):
        if item_id not in test_data["items"]:
            raise HTTPException(status_code=404, detail="Item not found")
        return test_data["items"][item_id]
    
    # Create item
    @app.post("/api/items")
    async def create_item(item: Dict[str, Any]):
        if "id" not in item:
            item["id"] = str(len(test_data["items"]) + 1)
        test_data["items"][item["id"]] = item
        return item
    
    # Update item
    @app.put("/api/items/{item_id}")
    async def update_item(item_id: str, item: Dict[str, Any]):
        if item_id not in test_data["items"]:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Update item
        updated_item = {**test_data["items"][item_id], **item, "id": item_id}
        test_data["items"][item_id] = updated_item
        return updated_item
    
    # Delete item
    @app.delete("/api/items/{item_id}")
    async def delete_item(item_id: str):
        if item_id not in test_data["items"]:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Delete item
        deleted_item = test_data["items"].pop(item_id)
        return {"id": item_id, "deleted": True}
    
    # Get users endpoint
    @app.get("/api/users")
    async def get_users():
        return list(test_data["users"].values())
    
    # Get user by ID
    @app.get("/api/users/{user_id}")
    async def get_user(user_id: str):
        if user_id not in test_data["users"]:
            raise HTTPException(status_code=404, detail="User not found")
        return test_data["users"][user_id]
    
    # Slow endpoint to test timeouts
    @app.get("/api/slow")
    async def slow_endpoint():
        await asyncio.sleep(2)
        return {"result": "slow response"}
    
    # Error endpoint
    @app.get("/api/error")
    async def error_endpoint():
        raise HTTPException(status_code=500, detail="Simulated server error")
    
    # Add the batch request processor
    processor = add_batch_request_processor(
        app=app,
        api_prefix="/api",
        batch_endpoint="/batch",
        max_operations=10,
        default_timeout=5,
        collect_metrics=True
    )
    
    return app, processor


# Fixtures
@pytest.fixture
def app_and_processor():
    """Fixture for the test app and processor"""
    return create_test_app()


@pytest.fixture
def client(app_and_processor):
    """Fixture for the test client"""
    app, _ = app_and_processor
    return TestClient(app)


# Tests
def test_batch_request_simple(client):
    """Test a simple batch request with multiple GET operations"""
    # Create batch request with two GET operations
    request_data = {
        "operations": [
            {
                "method": "GET",
                "path": "/api/items/1"
            },
            {
                "method": "GET",
                "path": "/api/users/1"
            }
        ]
    }
    
    # Send batch request
    response = client.post("/api/batch", json=request_data)
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    
    # Verify batch response structure
    assert "results" in data
    assert "success_count" in data
    assert "error_count" in data
    assert "total_count" in data
    assert "execution_time" in data
    
    # Check counts
    assert data["success_count"] == 2
    assert data["error_count"] == 0
    assert data["total_count"] == 2
    
    # Check results
    results = data["results"]
    assert len(results) == 2
    
    # First result (items/1)
    assert results[0]["path"] == "/api/items/1"
    assert results[0]["method"] == "GET"
    assert results[0]["status"] == 200
    assert results[0]["success"] == True
    assert results[0]["data"]["id"] == "1"
    assert results[0]["data"]["name"] == "Item 1"
    
    # Second result (users/1)
    assert results[1]["path"] == "/api/users/1"
    assert results[1]["method"] == "GET"
    assert results[1]["status"] == 200
    assert results[1]["success"] == True
    assert results[1]["data"]["id"] == "1"
    assert results[1]["data"]["username"] == "user1"


def test_batch_request_with_errors(client):
    """Test a batch request with some operations that succeed and some that fail"""
    # Create batch request with mix of success and failure operations
    request_data = {
        "operations": [
            {
                "method": "GET",
                "path": "/api/items/1"
            },
            {
                "method": "GET",
                "path": "/api/items/999"  # This should 404
            },
            {
                "method": "GET",
                "path": "/api/error"  # This should 500
            }
        ]
    }
    
    # Send batch request
    response = client.post("/api/batch", json=request_data)
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    
    # Check counts
    assert data["success_count"] == 1
    assert data["error_count"] == 2
    assert data["total_count"] == 3
    
    # Check results
    results = data["results"]
    assert len(results) == 3
    
    # First result (items/1) - success
    assert results[0]["path"] == "/api/items/1"
    assert results[0]["success"] == True
    assert results[0]["status"] == 200
    
    # Second result (items/999) - 404
    assert results[1]["path"] == "/api/items/999"
    assert results[1]["success"] == False
    assert results[1]["status"] == 404
    
    # Third result (error) - 500
    assert results[2]["path"] == "/api/error"
    assert results[2]["success"] == False
    assert results[2]["status"] == 500


def test_batch_request_with_different_methods(client):
    """Test a batch request with different HTTP methods (GET, POST, PUT, DELETE)"""
    # Create batch request with different methods
    request_data = {
        "operations": [
            # Create a new item
            {
                "method": "POST",
                "path": "/api/items",
                "body": {"name": "New Test Item"}
            },
            # Get the item list (should include the new item)
            {
                "method": "GET",
                "path": "/api/items"
            },
            # Update an existing item
            {
                "method": "PUT",
                "path": "/api/items/1",
                "body": {"name": "Updated Item 1"}
            },
            # Delete an item
            {
                "method": "DELETE",
                "path": "/api/items/2"
            }
        ]
    }
    
    # Send batch request
    response = client.post("/api/batch", json=request_data)
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    
    # Check counts
    assert data["success_count"] == 4
    assert data["error_count"] == 0
    assert data["total_count"] == 4
    
    # Check results
    results = data["results"]
    assert len(results) == 4
    
    # POST result - should have created a new item
    assert results[0]["method"] == "POST"
    assert results[0]["path"] == "/api/items"
    assert results[0]["success"] == True
    assert results[0]["status"] == 200
    assert results[0]["data"]["name"] == "New Test Item"
    
    # GET result - should have list of items including the new one
    assert results[1]["method"] == "GET"
    assert results[1]["path"] == "/api/items"
    assert results[1]["success"] == True
    assert len(results[1]["data"]) >= 3  # Should have at least 3 items (2 original + 1 new)
    
    # PUT result - should have updated item 1
    assert results[2]["method"] == "PUT"
    assert results[2]["path"] == "/api/items/1"
    assert results[2]["success"] == True
    assert results[2]["data"]["name"] == "Updated Item 1"
    
    # DELETE result - should have deleted item 2
    assert results[3]["method"] == "DELETE"
    assert results[3]["path"] == "/api/items/2"
    assert results[3]["success"] == True
    assert results[3]["data"]["deleted"] == True


def test_batch_request_sequential_execution(client):
    """Test batch request with sequential execution"""
    # Create batch request with sequential execution
    request_data = {
        "operations": [
            {
                "method": "GET",
                "path": "/api/items/1"
            },
            {
                "method": "GET",
                "path": "/api/users/1"
            }
        ],
        "execute_sequential": True
    }
    
    # Send batch request
    response = client.post("/api/batch", json=request_data)
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    
    # Check counts
    assert data["success_count"] == 2
    assert data["error_count"] == 0
    assert data["total_count"] == 2
    
    # Sequential execution doesn't change results, just how they're processed
    results = data["results"]
    assert len(results) == 2
    assert results[0]["success"] == True
    assert results[1]["success"] == True


def test_batch_request_transaction(client):
    """Test batch request with transaction mode (all or nothing)"""
    # Create batch request with transaction and mix of success/failure
    request_data = {
        "operations": [
            # This will succeed
            {
                "method": "POST",
                "path": "/api/items",
                "body": {"name": "Transaction Item"}
            },
            # This will fail with 404
            {
                "method": "PUT",
                "path": "/api/items/999",
                "body": {"name": "This will fail"}
            }
        ],
        "transaction": True
    }
    
    # Send batch request
    response = client.post("/api/batch", json=request_data)
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    
    # Check transaction status
    assert data["transaction_status"] == "rolled_back"
    
    # First operation should succeed but get rolled back
    assert data["results"][0]["success"] == True
    assert data["results"][0]["data"].get("transaction_rolled_back") == True
    
    # Second operation should fail
    assert data["results"][1]["success"] == False
    assert data["results"][1]["status"] == 404
    
    # Check counts - first succeeds but gets rolled back due to second failing
    assert data["success_count"] == 1
    assert data["error_count"] == 1
    assert data["total_count"] == 2
    
    # Verify the transaction was truly rolled back by checking that the item wasn't created
    get_items_response = client.get("/api/items")
    items = get_items_response.json()
    
    # Check that no item with name "Transaction Item" exists
    transaction_items = [item for item in items if item.get("name") == "Transaction Item"]
    assert len(transaction_items) == 0


def test_batch_request_timeout(client):
    """Test batch request with timeout handling"""
    # Create batch request with an operation that will timeout
    request_data = {
        "operations": [
            {
                "method": "GET",
                "path": "/api/items/1"
            },
            {
                "method": "GET",
                "path": "/api/slow"  # This is a slow endpoint
            }
        ],
        "timeout": 1  # Set timeout to 1 second (less than the 2s the slow endpoint takes)
    }
    
    # Send batch request
    response = client.post("/api/batch", json=request_data)
    
    # Since we're using concurrent execution by default, the whole batch
    # will fail with a timeout error
    assert response.status_code == 408  # Request Timeout
    assert "timeout" in response.json()["detail"].lower()


def test_batch_request_max_operations(client):
    """Test batch request with too many operations"""
    # Create batch request with too many operations
    operations = [{"method": "GET", "path": "/api/items/1"}] * 20  # Create 20 operations
    
    request_data = {
        "operations": operations
    }
    
    # Send batch request
    response = client.post("/api/batch", json=request_data)
    
    # Check response - should reject due to too many operations
    assert response.status_code == 400
    assert "maximum operations limit" in response.json()["detail"].lower()


def test_batch_request_invalid_json(client):
    """Test batch request with invalid JSON"""
    # Send invalid JSON
    response = client.post(
        "/api/batch", 
        data="this is not valid json",
        headers={"Content-Type": "application/json"}
    )
    
    # Check response
    assert response.status_code == 400
    assert "invalid json" in response.json()["detail"].lower()


def test_batch_request_invalid_method(client):
    """Test batch request with invalid HTTP method"""
    # Create batch request with invalid method
    request_data = {
        "operations": [
            {
                "method": "INVALID",
                "path": "/api/items/1"
            }
        ]
    }
    
    # Send batch request
    response = client.post("/api/batch", json=request_data)
    
    # Check response
    assert response.status_code == 400
    assert "method" in response.json()["detail"].lower()


def test_batch_metrics_endpoint(client):
    """Test the batch metrics endpoint"""
    # First, send a batch request to generate some metrics
    request_data = {
        "operations": [
            {
                "method": "GET",
                "path": "/api/items/1"
            },
            {
                "method": "GET",
                "path": "/api/users/1"
            }
        ]
    }
    
    client.post("/api/batch", json=request_data)
    
    # Now check the metrics endpoint
    response = client.get("/api/batch/metrics")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    
    # Check metrics data
    assert "total_batch_requests" in data
    assert "total_operations" in data
    assert "failed_operations" in data
    assert "success_operations" in data
    assert "success_rate" in data
    assert "average_execution_time" in data
    
    # Verify metrics values
    assert data["total_batch_requests"] >= 1
    assert data["total_operations"] >= 2
    assert data["success_operations"] >= 2  # Both operations should succeed


def test_batch_docs_endpoint(client):
    """Test the batch documentation endpoint"""
    response = client.get("/api/batch/docs")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    
    # Check documentation data
    assert "name" in data
    assert "description" in data
    assert "endpoint" in data
    assert "methods" in data
    assert "request_schema" in data
    assert "response_schema" in data
    assert "examples" in data
    
    # Verify content
    assert data["name"] == "Batch Request Processor"
    assert "/batch" in data["endpoint"]
    assert "POST" in data["methods"]
    assert len(data["examples"]) > 0