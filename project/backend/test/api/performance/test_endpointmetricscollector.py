"""
Tests for EndpointMetricsCollector

Unit tests for the Endpoint performance metrics collection with historical tracking
"""
import pytest
import logging
import time
import json
from unittest.mock import MagicMock, patch, AsyncMock
from datetime import datetime


from api.performance.endpointmetricscollector import EndpointMetricsCollector

class TestEndpointMetricsCollector:
    """Test cases for EndpointMetricsCollector service"""
    
    @pytest.fixture
    def service(self):
        """Create a service instance"""
        config = {
            'enabled': True,
            'test_config': 'test_value'
        }
        return EndpointMetricsCollector(config)
    
    def test_initialization(self):
        """Test service initialization"""
        service = EndpointMetricsCollector()
        
        # Verify initial state
        assert service.enabled is True
        assert service.last_error is None
        
        # Verify initial metrics
        metrics = service.get_metrics()
        assert metrics['component'] == 'EndpointMetricsCollector'
        assert metrics['operations'] == 0
        assert metrics['errors'] == 0
    
    def test_performance_measurement(self, service):
        """Test performance measurement context manager"""
        # Use the measure_performance context manager
        with service.measure_performance('test_operation'):
            # Simulate some work
            time.sleep(0.01)
        
        # Verify metrics were updated
        metrics = service.get_metrics()
        assert metrics['operations'] == 1
        assert metrics['operations_per_second'] > 0
        
        # Verify operation-specific metrics
        assert 'operation_metrics' in metrics
        assert 'test_operation' in metrics['operation_metrics']
        assert metrics['operation_metrics']['test_operation']['count'] == 1
    
    def test_enable_disable(self, service):
        """Test enabling and disabling the service"""
        # Test disable
        service.disable()
        assert service.enabled is False
        
        # Test enable
        service.enable()
        assert service.enabled is True
    
    def test_reset_metrics(self, service):
        """Test resetting metrics"""
        # Perform some operations
        with service.measure_performance('test_operation'):
            time.sleep(0.01)
        
        # Verify metrics were recorded
        assert service.metrics['operations'] == 1
        
        # Reset metrics
        service.reset_metrics()
        
        # Verify metrics were reset
        assert service.metrics['operations'] == 0
        assert 'operation_metrics' not in service.metrics

"""

pytest.main(['-xvs', __file__])
