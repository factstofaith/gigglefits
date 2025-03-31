"""
Simple test for API documentation endpoints.
This test avoids database dependencies.
"""
import unittest
import sys
import os
import requests
from unittest.mock import patch, MagicMock

# Add parent directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import modules to test
from main import app

class TestAPIDocumentation(unittest.TestCase):
    """Test the API documentation endpoints without database dependencies."""
    
    def setUp(self):
        """Setup test client."""
        # We'll use the FastAPI test client
        from fastapi.testclient import TestClient
        self.client = TestClient(app)
        
    @patch('main.get_db')
    def test_openapi_json_endpoint(self, mock_get_db):
        """Test that the OpenAPI JSON endpoint returns a valid schema."""
        # Mock database session to avoid database dependency
        mock_session = MagicMock()
        mock_get_db.return_value = mock_session
        
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
    
    @patch('main.get_db')
    def test_docs_endpoint(self, mock_get_db):
        """Test that the Swagger UI docs endpoint returns HTML."""
        # Mock database session to avoid database dependency
        mock_session = MagicMock()
        mock_get_db.return_value = mock_session
        
        # Call the docs endpoint
        response = self.client.get("/docs")
        
        # Assert response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "text/html; charset=utf-8")
        
        # Check for Swagger UI content
        content = response.content.decode('utf-8')
        self.assertIn("<title>Swagger UI</title>", content)
        self.assertIn("swagger-ui", content.lower())
    
    @patch('main.get_db')
    def test_redoc_endpoint(self, mock_get_db):
        """Test that the ReDoc endpoint returns HTML."""
        # Mock database session to avoid database dependency
        mock_session = MagicMock()
        mock_get_db.return_value = mock_session
        
        # Call the ReDoc endpoint
        response = self.client.get("/redoc")
        
        # Assert response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "text/html; charset=utf-8")
        
        # Check for ReDoc content
        content = response.content.decode('utf-8')
        self.assertIn("<title>ReDoc</title>", content)
        self.assertIn("redoc", content.lower())

if __name__ == "__main__":
    unittest.main()