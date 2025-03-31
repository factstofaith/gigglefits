"""
Simple API documentation validation test.
"""

import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app

# Create test client
client = TestClient(app)

def test_openapi_schema():
    """Test that the OpenAPI schema is available."""
    print("Testing OpenAPI schema availability...")
    
    try:
        response = client.get("/api/openapi.json")
        assert response.status_code == 200
        schema = response.json()
        
        # Basic schema validation
        assert "openapi" in schema
        assert "info" in schema
        assert "paths" in schema
        
        print("✓ OpenAPI schema is available")
        return True
    except Exception as e:
        print(f"✗ OpenAPI schema test failed: {e}")
        return False

def test_security_schemes():
    """Test that security schemes are properly defined."""
    print("Testing security schemes definition...")
    
    try:
        response = client.get("/api/openapi.json")
        assert response.status_code == 200
        schema = response.json()
        
        # Check security schemes
        security_schemes = schema.get("components", {}).get("securitySchemes", {})
        assert "jwt" in security_schemes
        assert security_schemes["jwt"]["type"] == "http"
        assert security_schemes["jwt"]["scheme"] == "bearer"
        
        print("✓ Security schemes are properly defined")
        return True
    except Exception as e:
        print(f"✗ Security schemes test failed: {e}")
        return False

def test_docs_endpoints():
    """Test that documentation endpoints are available."""
    print("Testing documentation endpoints...")
    
    try:
        # Test Swagger UI
        swagger_response = client.get("/api/docs")
        assert swagger_response.status_code == 200
        
        # Test ReDoc
        redoc_response = client.get("/api/redoc")
        assert redoc_response.status_code == 200
        
        print("✓ Documentation endpoints are available")
        return True
    except Exception as e:
        print(f"✗ Documentation endpoints test failed: {e}")
        return False

if __name__ == "__main__":
    print("\n=== API Documentation Validation ===\n")
    
    # Run all tests and track success
    schema_test = test_openapi_schema()
    security_test = test_security_schemes()
    endpoints_test = test_docs_endpoints()
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"OpenAPI Schema: {'✓' if schema_test else '✗'}")
    print(f"Security Schemes: {'✓' if security_test else '✗'}")
    print(f"Documentation Endpoints: {'✓' if endpoints_test else '✗'}")
    
    # Return exit code based on test success
    all_passed = schema_test and security_test and endpoints_test
    print(f"\nOverall result: {'✓ PASSED' if all_passed else '✗ FAILED'}")
    
    sys.exit(0 if all_passed else 1)