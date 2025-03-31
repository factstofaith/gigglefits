"""
Tests for PartialResponseHandler

Unit tests for the Support for partial responses with field filtering and pagination
"""
import pytest
import logging
import time
import json
from unittest.mock import MagicMock, patch, AsyncMock
from datetime import datetime


from fastapi import FastAPI, Request, Response
from fastapi.testclient import TestClient
from starlette.middleware.base import BaseHTTPMiddleware

from api.performance.partialresponsehandler import PartialResponseHandler

class TestPartialResponseHandler:
    """Test cases for PartialResponseHandler middleware"""
    
    @pytest.fixture
    def app(self):
        """Create a test FastAPI app"""
        app = FastAPI()
        
        @app.get("/test")
        def test_endpoint():
            return {"message": "test endpoint"}
        
        return app
    
    @pytest.fixture
    def test_client(self, app):
        """Create a test client"""
        return TestClient(app)
    
    @pytest.fixture
    def middleware(self, app):
        """Create the middleware instance"""
        config = {
            'enabled': True,
            'test_config': 'test_value'
        }
        return PartialResponseHandler(app, config)
    
    def test_initialization(self, app):
        """Test middleware initialization"""
        middleware = PartialResponseHandler(app)
        
        # Verify middleware was added to the app
        assert len(app.user_middleware) > 0
        assert any(m.cls == BaseHTTPMiddleware for m in app.user_middleware)
        
        # Verify initial metrics
        metrics = middleware.get_metrics()
        assert metrics['component'] == 'PartialResponseHandler'
        assert metrics['requests_processed'] == 0
        assert metrics['errors'] == 0
    
    def test_request_processing(self, test_client, middleware):
        """Test request processing"""
        # Make a test request
        response = test_client.get("/test")
        
        # Verify request was processed successfully
        assert response.status_code == 200
        assert response.json() == {"message": "test endpoint"}
        
        # Verify metrics were updated
        metrics = middleware.get_metrics()
        assert metrics['requests_processed'] == 1
        assert metrics['errors'] == 0
        
    def test_middleware_disabled(self, app):
        """Test middleware when disabled"""
        # Create disabled middleware
        middleware = PartialResponseHandler(app, {'enabled': False})
        
        with patch.object(middleware, '_pre_process') as mock_pre:
            with patch.object(middleware, '_post_process') as mock_post:
                # Create test client with middleware
                client = TestClient(app)
                
                # Make a test request
                response = client.get("/test")
                
                # Verify request was processed without calling middleware methods
                assert response.status_code == 200
                mock_pre.assert_not_called()
                mock_post.assert_not_called()
    
    def test_error_handling(self, app):
        """Test middleware error handling"""
        middleware = PartialResponseHandler(app, {'enabled': True})
        
        # Mock pre_process to raise an exception
        with patch.object(middleware, '_pre_process', side_effect=Exception("Test error")):
            # Create test client with middleware
            client = TestClient(app)
            
            # Make a test request, should return error response
            response = client.get("/test")
            
            # Verify error handling
            assert response.status_code == 500
            
            # Verify metrics
            metrics = middleware.get_metrics()
            assert metrics['errors'] == 1

"""

pytest.main(['-xvs', __file__])
