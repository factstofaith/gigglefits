"""
Tests for RateLimiter

Unit tests for the Request throttling and rate limiting with tenant-specific quotas
"""
import pytest
import logging
import time
import json
from unittest.mock import MagicMock, patch, AsyncMock
from datetime import datetime
import asyncio

from fastapi import FastAPI, Request, Response, status
from fastapi.testclient import TestClient
from starlette.middleware.base import BaseHTTPMiddleware

from api.performance.ratelimiter import (
    RateLimiter, 
    FixedWindowStrategy,
    SlidingWindowStrategy,
    TokenBucketStrategy,
    create_rate_limiter
)


class TestRateLimitStrategies:
    """Tests for individual rate limiting strategies"""
    
    def test_fixed_window_strategy(self):
        """Test fixed window rate limiting strategy"""
        # Create strategy with 5 requests per 1 second window
        config = {
            'requests_per_window': 5,
            'window_seconds': 1
        }
        strategy = FixedWindowStrategy(config)
        
        # Run tests using event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Test initial state
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key"))
        assert not limited
        assert info['limit'] == 5
        assert info['remaining'] == 5
        
        # Record requests
        for i in range(5):
            info = loop.run_until_complete(strategy.record_request("test_key"))
            assert info['remaining'] == 5 - (i + 1)
        
        # Should be rate limited after 5 requests
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key"))
        assert limited
        assert info['remaining'] == 0
        
        # Metrics should be updated
        metrics = strategy.get_metrics()
        assert metrics['strategy'] == 'fixed_window'
        assert metrics['total_requests'] == 5
        assert metrics['limited_requests'] == 1
        
        # Clean up
        loop.close()
    
    def test_sliding_window_strategy(self):
        """Test sliding window rate limiting strategy"""
        # Create strategy with 5 requests per 1 second window
        config = {
            'requests_per_window': 5,
            'window_seconds': 1
        }
        strategy = SlidingWindowStrategy(config)
        
        # Run tests using event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Test initial state
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key"))
        assert not limited
        assert info['limit'] == 5
        assert info['remaining'] == 5
        
        # Record requests
        for i in range(5):
            info = loop.run_until_complete(strategy.record_request("test_key"))
            assert info['remaining'] == 5 - (i + 1)
        
        # Should be rate limited after 5 requests
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key"))
        assert limited
        assert info['remaining'] == 0
        
        # Metrics should be updated
        metrics = strategy.get_metrics()
        assert metrics['strategy'] == 'sliding_window'
        assert metrics['total_requests'] == 5
        assert metrics['limited_requests'] == 1
        
        # Clean up
        loop.close()
    
    def test_token_bucket_strategy(self):
        """Test token bucket rate limiting strategy"""
        # Create strategy with 5 token capacity and 1 token per second refill
        config = {
            'bucket_capacity': 5,
            'refill_rate': 1.0
        }
        strategy = TokenBucketStrategy(config)
        
        # Run tests using event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Test initial state
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key"))
        assert not limited
        assert info['limit'] == 5
        assert info['remaining'] == 5
        
        # Record requests
        for i in range(5):
            info = loop.run_until_complete(strategy.record_request("test_key"))
            assert info['remaining'] == 5 - (i + 1)
        
        # Should be rate limited after 5 requests
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key"))
        assert limited
        assert info['remaining'] == 0
        
        # Metrics should be updated
        metrics = strategy.get_metrics()
        assert metrics['strategy'] == 'token_bucket'
        assert metrics['total_requests'] == 5
        assert metrics['limited_requests'] == 1
        
        # Clean up
        loop.close()
    
    def test_tenant_specific_limits(self):
        """Test tenant-specific rate limiting"""
        # Create strategy with different limits for tenants
        config = {
            'requests_per_window': 5,  # Default
            'window_seconds': 1,
            'tenant_limits': {
                'tenant1': 10,  # Higher limit
                'tenant2': 2    # Lower limit
            }
        }
        strategy = FixedWindowStrategy(config)
        
        # Run tests using event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Test default limit
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key"))
        assert not limited
        assert info['limit'] == 5
        
        # Test tenant1 (higher limit)
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key", "tenant1"))
        assert not limited
        assert info['limit'] == 10
        
        # Test tenant2 (lower limit)
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key", "tenant2"))
        assert not limited
        assert info['limit'] == 2
        
        # Record requests for tenant2 (limit 2)
        loop.run_until_complete(strategy.record_request("test_key", "tenant2"))
        loop.run_until_complete(strategy.record_request("test_key", "tenant2"))
        
        # Should be rate limited for tenant2 after 2 requests
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key", "tenant2"))
        assert limited
        assert info['remaining'] == 0
        
        # But not for default or tenant1
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key"))
        assert not limited
        limited, info = loop.run_until_complete(strategy.is_rate_limited("test_key", "tenant1"))
        assert not limited
        
        # Clean up
        loop.close()


class TestRateLimiter:
    """Test cases for RateLimiter middleware"""
    
    @pytest.fixture
    def app(self):
        """Create a test FastAPI app"""
        app = FastAPI()
        
        @app.get("/test")
        def test_endpoint():
            return {"message": "test endpoint"}
            
        @app.get("/metrics")
        def metrics_endpoint():
            return {"message": "metrics endpoint"}
        
        return app
    
    @pytest.fixture
    def config(self):
        """Create a test configuration"""
        return {
            'enabled': True,
            'strategy': 'fixed_window',
            'strategy_config': {
                'requests_per_window': 5,
                'window_seconds': 1
            },
            'exempt_paths': ['/metrics'],
            'key_by_ip': True,
            'key_by_path': True
        }
    
    @pytest.fixture
    def middleware(self, app, config):
        """Create the middleware instance"""
        return RateLimiter(app, config)
    
    @pytest.fixture
    def test_client(self, app, middleware):
        """Create a test client with middleware"""
        return TestClient(app)
    
    def test_initialization(self, app, config):
        """Test middleware initialization"""
        middleware = RateLimiter(app, config)
        
        # Verify middleware was added to the app
        assert len(app.user_middleware) > 0
        assert any(m.cls == BaseHTTPMiddleware for m in app.user_middleware)
        
        # Verify initial metrics
        metrics = middleware.get_metrics()
        assert metrics['component'] == 'RateLimiter'
        assert metrics['requests_processed'] == 0
        assert metrics['rate_limited_requests'] == 0
        assert metrics['strategy'] == 'FixedWindowStrategy'
    
    def test_request_processing(self, test_client, middleware):
        """Test request processing"""
        # Make a test request
        response = test_client.get("/test")
        
        # Verify request was processed successfully
        assert response.status_code == 200
        assert response.json() == {"message": "test endpoint"}
        
        # Verify rate limit headers
        assert 'X-RateLimit-Limit' in response.headers
        assert 'X-RateLimit-Remaining' in response.headers
        assert 'X-RateLimit-Reset' in response.headers
        
        # Verify metrics were updated
        metrics = middleware.get_metrics()
        assert metrics['requests_processed'] == 1
        assert metrics['rate_limited_requests'] == 0
    
    def test_rate_limiting(self, test_client, middleware):
        """Test rate limiting after exceeding limits"""
        # Make requests up to the limit
        for _ in range(5):
            response = test_client.get("/test")
            assert response.status_code == 200
        
        # The next request should be rate limited
        response = test_client.get("/test")
        assert response.status_code == 429
        assert "Rate limit exceeded" in response.json()["detail"]
        
        # Verify rate limit headers in error response
        assert 'X-RateLimit-Limit' in response.headers
        assert 'X-RateLimit-Remaining' in response.headers
        assert int(response.headers['X-RateLimit-Remaining']) == 0
        assert 'X-RateLimit-Reset' in response.headers
        assert 'Retry-After' in response.headers
        
        # Verify metrics were updated
        metrics = middleware.get_metrics()
        assert metrics['requests_processed'] == 6
        assert metrics['rate_limited_requests'] == 1
    
    def test_exempt_paths(self, test_client, middleware):
        """Test exempt paths are not rate limited"""
        # Make many requests to an exempt path
        for _ in range(10):
            response = test_client.get("/metrics")
            assert response.status_code == 200
        
        # Verify metrics were updated correctly
        metrics = middleware.get_metrics()
        assert metrics['requests_processed'] == 10
        assert metrics['bypass_count'] == 10
        assert metrics['rate_limited_requests'] == 0
    
    def test_middleware_disabled(self, app, config):
        """Test middleware when disabled"""
        # Create disabled middleware
        config['enabled'] = False
        middleware = RateLimiter(app, config)
        
        # Create test client
        client = TestClient(app)
        
        # Make many requests - should not be limited even above threshold
        for _ in range(10):
            response = client.get("/test")
            assert response.status_code == 200
        
        # Verify metrics reflect disabled state
        metrics = middleware.get_metrics()
        assert metrics['enabled'] is False
        assert metrics['rate_limited_requests'] == 0
    
    def test_tenant_specific_limits(self, app):
        """Test tenant-specific rate limiting"""
        # Create middleware with tenant-specific limits
        config = {
            'strategy': 'fixed_window',
            'strategy_config': {
                'requests_per_window': 5,  # Default
                'tenant_limits': {
                    'tenant1': 2,  # Lower limit
                    'tenant2': 10  # Higher limit
                }
            }
        }
        middleware = RateLimiter(app, config)
        
        # Create test client
        client = TestClient(app)
        
        # Test tenant1 (lower limit)
        for i in range(2):
            response = client.get("/test", headers={"X-Tenant-ID": "tenant1"})
            assert response.status_code == 200
        
        # Third request should be rate limited
        response = client.get("/test", headers={"X-Tenant-ID": "tenant1"})
        assert response.status_code == 429
        
        # Test tenant2 (higher limit) - should not be rate limited
        for _ in range(5):
            response = client.get("/test", headers={"X-Tenant-ID": "tenant2"})
            assert response.status_code == 200
    
    def test_different_strategies(self, app):
        """Test different rate limiting strategies"""
        strategies = [
            ('fixed_window', {'requests_per_window': 3, 'window_seconds': 1}),
            ('sliding_window', {'requests_per_window': 3, 'window_seconds': 1}),
            ('token_bucket', {'bucket_capacity': 3, 'refill_rate': 1.0})
        ]
        
        for strategy_name, strategy_config in strategies:
            # Create middleware with strategy
            config = {
                'strategy': strategy_name,
                'strategy_config': strategy_config
            }
            middleware = RateLimiter(app, config)
            
            # Create test client
            client = TestClient(app)
            
            # Make requests up to the limit
            for _ in range(3):
                response = client.get("/test")
                assert response.status_code == 200
            
            # Next request should be rate limited
            response = client.get("/test")
            assert response.status_code == 429
            
            # Verify strategy in metrics
            metrics = middleware.get_metrics()
            assert strategy_name in metrics['strategy'].lower()
    
    def test_error_handling(self, app, config):
        """Test middleware error handling"""
        middleware = RateLimiter(app, config)
        
        # Mock strategy.is_rate_limited to raise an exception
        with patch.object(middleware.strategy, 'is_rate_limited', 
                         side_effect=Exception("Test error")):
            # Create test client
            client = TestClient(app)
            
            # Make a request, should return error response
            response = client.get("/test")
            
            # Verify error handling
            assert response.status_code == 500
            assert "Internal server error" in response.json()["detail"]
            
            # Verify metrics
            metrics = middleware.get_metrics()
            assert metrics['last_error'] == "Test error"
    
    def test_create_rate_limiter_factory(self, app):
        """Test the create_rate_limiter factory function"""
        # Create rate limiter with factory
        limiter = create_rate_limiter(
            app=app,
            strategy="token_bucket",
            bucket_capacity=10,
            refill_rate=2.0,
            key_by_method=True,
            exempt_paths=["/health", "/metrics"]
        )
        
        # Verify configuration
        assert isinstance(limiter, RateLimiter)
        assert isinstance(limiter.strategy, TokenBucketStrategy)
        assert limiter.key_by_method == True
        assert "/health" in limiter.exempt_paths
        assert "/metrics" in limiter.exempt_paths
        
        # Get metrics
        metrics = limiter.get_metrics()
        assert metrics['strategy'] == 'TokenBucketStrategy'
        
        # Create test client
        client = TestClient(app)
        
        # Test exempt path
        for _ in range(20):  # Should not be rate limited
            response = client.get("/metrics")
            assert response.status_code == 200
    
    def test_metrics_endpoint(self, app, config):
        """Test the metrics endpoint"""
        middleware = RateLimiter(app, config)
        
        # Create test client
        client = TestClient(app)
        
        # Make some requests
        for _ in range(3):
            client.get("/test")
        
        # Get metrics from endpoint
        response = client.get("/api/metrics/rate-limiter")
        assert response.status_code == 200
        
        # Verify metrics content
        metrics = response.json()
        assert metrics['component'] == 'RateLimiter'
        assert metrics['requests_processed'] == 3
        assert 'strategy_metrics' in metrics


if __name__ == "__main__":
    pytest.main(["-xvs", __file__])