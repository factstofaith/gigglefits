"""
Simple test for API documentation functionality.
This test creates a minimal FastAPI app to test API docs features.
"""
import unittest
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from pydantic import BaseModel
from enum import Enum
from typing import List, Optional

# Create a minimal FastAPI app for testing
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class UserBase(BaseModel):
    email: str
    first_name: str
    last_name: str
    role: UserRole = UserRole.USER

class UserResponse(UserBase):
    id: str
    tenant_id: str
    created_at: str

class ErrorResponse(BaseModel):
    detail: str

# Create a minimal FastAPI app for testing
app = FastAPI(
    title="TAP Integration Platform API",
    description="API for the TAP Integration Platform",
    version="1.0.0",
)

# Add some minimal routes
@app.get("/users/me", response_model=UserResponse, responses={401: {"model": ErrorResponse}})
def get_current_user():
    """Get the current user profile"""
    return {
        "id": "user-1",
        "email": "user@example.com",
        "first_name": "Test",
        "last_name": "User",
        "role": "USER",
        "tenant_id": "tenant-1",
        "created_at": "2025-03-20T00:00:00Z"
    }

@app.get("/users", response_model=List[UserResponse], responses={401: {"model": ErrorResponse}})
def get_users():
    """List all users (admin only)"""
    return [
        {
            "id": "user-1",
            "email": "user@example.com",
            "first_name": "Test",
            "last_name": "User",
            "role": "USER",
            "tenant_id": "tenant-1",
            "created_at": "2025-03-20T00:00:00Z"
        }
    ]

class TestAPIDocumentation(unittest.TestCase):
    """Test the API documentation endpoints"""
    
    def setUp(self):
        """Setup test client"""
        self.client = TestClient(app)
        
    def test_openapi_json_endpoint(self):
        """Test that the OpenAPI JSON endpoint returns a valid schema"""
        # Call the OpenAPI JSON endpoint
        response = self.client.get("/openapi.json")
        
        # Assert response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "application/json")
        
        # Validate that the response is JSON and has essential OpenAPI fields
        json_data = response.json()
        self.assertIn("openapi", json_data)
        self.assertIn("info", json_data)
        self.assertIn("paths", json_data)
        
        # Verify version format - should be 3.x.x for OpenAPI 3
        self.assertTrue(json_data["openapi"].startswith("3."))
        
        # Check for title and version in info
        self.assertIn("title", json_data["info"])
        self.assertIn("version", json_data["info"])
        self.assertEqual(json_data["info"]["title"], "TAP Integration Platform API")
        self.assertEqual(json_data["info"]["version"], "1.0.0")
        
        # Check for endpoints we defined
        self.assertIn("/users/me", json_data["paths"])
        self.assertIn("/users", json_data["paths"])
    
    def test_docs_endpoint(self):
        """Test that the Swagger UI docs endpoint returns HTML"""
        # Call the docs endpoint
        response = self.client.get("/docs")
        
        # Assert response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "text/html; charset=utf-8")
        
        # Check for Swagger UI content
        content = response.content.decode('utf-8')
        self.assertIn("<title>TAP Integration Platform API - Swagger UI</title>", content)
        self.assertIn("swagger-ui", content.lower())
    
    def test_redoc_endpoint(self):
        """Test that the ReDoc endpoint returns HTML"""
        # Call the ReDoc endpoint
        response = self.client.get("/redoc")
        
        # Assert response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "text/html; charset=utf-8")
        
        # Check for ReDoc content
        content = response.content.decode('utf-8')
        self.assertIn("<title>TAP Integration Platform API - ReDoc</title>", content)
        self.assertIn("redoc", content.lower())

if __name__ == "__main__":
    unittest.main()