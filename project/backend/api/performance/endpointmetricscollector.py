"""
EndpointMetricsCollector

Endpoint performance metrics collection with historical tracking
"""
import logging
import time
import asyncio
import threading
from typing import Dict, List, Optional, Any, Union, Tuple, Callable, Set
from datetime import datetime, timedelta
from contextlib import contextmanager

# Configure logging
logger = logging.getLogger(__name__)

class EndpointMetricsCollector:
    """
    Endpoint performance metrics collection with historical tracking
    
    Features:
    - High-performance design with minimal overhead
    - Configurable for different application scenarios
    - Detailed metrics collection and performance tracking
    - Thread-safe implementation for concurrent access
    - Comprehensive error handling and monitoring
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the service.
        
        Args:
            config: Configuration dictionary
        """
        self.config = config or {}
        self.metrics = {
            'operations': 0,
            'errors': 0,
            'processing_time': 0,
            'started_at': datetime.utcnow().isoformat()
        }
        self.enabled = self.config.get('enabled', True)
        self.last_error = None
        self._lock = threading.RLock()
        
        # Initialize service
        self._initialize()
    
    def _initialize(self):
        """Initialize the service."""
        try:
            # Add implementation-specific initialization here
            logger.info(f"EndpointMetricsCollector service initialized")
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Failed to initialize EndpointMetricsCollector service: {str(e)}")
    
    @contextmanager
    def measure_performance(self, operation_name: str = "unnamed"):
        """
        Context manager to measure operation performance.
        
        Args:
            operation_name: Name of the operation
        """
        start_time = time.time()
        
        try:
            yield
        finally:
            duration = time.time() - start_time
            
            with self._lock:
                self.metrics['operations'] += 1
                self.metrics['processing_time'] += duration
                
                # Store operation-specific metrics
                if 'operation_metrics' not in self.metrics:
                    self.metrics['operation_metrics'] = {}
                
                if operation_name not in self.metrics['operation_metrics']:
                    self.metrics['operation_metrics'][operation_name] = {
                        'count': 0,
                        'total_time': 0,
                        'min_time': float('inf'),
                        'max_time': 0,
                        'last_execution_time': None
                    }
                
                op_metrics = self.metrics['operation_metrics'][operation_name]
                op_metrics['count'] += 1
                op_metrics['total_time'] += duration
                op_metrics['last_execution_time'] = duration
                
                if duration < op_metrics['min_time']:
                    op_metrics['min_time'] = duration
                
                if duration > op_metrics['max_time']:
                    op_metrics['max_time'] = duration
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get service metrics.
        
        Returns:
            Dict containing service metrics
        """
        with self._lock:
            # Calculate average processing time
            avg_time = 0
            if self.metrics['operations'] > 0:
                avg_time = self.metrics['processing_time'] / self.metrics['operations']
            
            # Calculate uptime
            uptime = (datetime.utcnow() - datetime.fromisoformat(self.metrics['started_at'])).total_seconds()
            
            metrics_copy = {
                'component': 'EndpointMetricsCollector',
                'enabled': self.enabled,
                'operations': self.metrics['operations'],
                'errors': self.metrics['errors'],
                'average_processing_time': avg_time,
                'total_processing_time': self.metrics['processing_time'],
                'uptime_seconds': uptime,
                'operations_per_second': self.metrics['operations'] / uptime if uptime > 0 else 0,
                'last_error': self.last_error,
                'last_updated': datetime.utcnow().isoformat()
            }
            
            # Add operation-specific metrics
            if 'operation_metrics' in self.metrics:
                metrics_copy['operation_metrics'] = {}
                
                for op_name, op_metrics in self.metrics['operation_metrics'].items():
                    op_avg_time = 0
                    if op_metrics['count'] > 0:
                        op_avg_time = op_metrics['total_time'] / op_metrics['count']
                    
                    metrics_copy['operation_metrics'][op_name] = {
                        'count': op_metrics['count'],
                        'average_time': op_avg_time,
                        'min_time': op_metrics['min_time'] if op_metrics['min_time'] != float('inf') else 0,
                        'max_time': op_metrics['max_time'],
                        'last_execution_time': op_metrics['last_execution_time']
                    }
            
            return metrics_copy
    
    def enable(self):
        """Enable the service."""
        with self._lock:
            self.enabled = True
        logger.info(f"EndpointMetricsCollector service enabled")
    
    def disable(self):
        """Disable the service."""
        with self._lock:
            self.enabled = False
        logger.info(f"EndpointMetricsCollector service disabled")
        
    def reset_metrics(self):
        """Reset all metrics."""
        with self._lock:
            self.metrics = {
                'operations': 0,
                'errors': 0,
                'processing_time': 0,
                'started_at': datetime.utcnow().isoformat()
            }
        logger.info(f"EndpointMetricsCollector metrics reset")
