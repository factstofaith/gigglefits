"""
Metrics collection for rate limiting.

This module provides utilities for collecting and reporting rate limiting metrics.
"""

import time
from typing import Dict, Any, List, Optional
from collections import defaultdict, deque
import threading


class RateLimitMetrics:
    """Metrics collector for rate limiting operations."""
    
    def __init__(self, window_size: int = 60, resolution: int = 1):
        """
        Initialize the metrics collector.
        
        Args:
            window_size: Size of the rolling window in seconds
            resolution: Resolution of the metrics in seconds
        """
        self.window_size = window_size
        self.resolution = resolution
        self.buckets = window_size // resolution
        
        # Initialize metrics with rolling window
        self.requests = deque([0] * self.buckets, maxlen=self.buckets)
        self.limited = deque([0] * self.buckets, maxlen=self.buckets)
        self.allowed = deque([0] * self.buckets, maxlen=self.buckets)
        
        # Track metrics by identifier, strategy, and route
        self.by_identifier = defaultdict(lambda: {
            'requests': 0,
            'limited': 0,
            'allowed': 0
        })
        self.by_strategy = defaultdict(lambda: {
            'requests': 0,
            'limited': 0,
            'allowed': 0
        })
        self.by_route = defaultdict(lambda: {
            'requests': 0,
            'limited': 0,
            'allowed': 0
        })
        
        # Current bucket index
        self.current_bucket = 0
        self.last_update = time.time()
        
        # Thread lock for thread safety
        self.lock = threading.RLock()
    
    def _rotate_buckets(self):
        """Rotate buckets based on elapsed time."""
        now = time.time()
        seconds_elapsed = int((now - self.last_update) / self.resolution)
        
        if seconds_elapsed <= 0:
            return
            
        with self.lock:
            # Rotate the appropriate number of buckets
            for _ in range(min(seconds_elapsed, self.buckets)):
                self.current_bucket = (self.current_bucket + 1) % self.buckets
                self.requests[self.current_bucket] = 0
                self.limited[self.current_bucket] = 0
                self.allowed[self.current_bucket] = 0
                
            self.last_update = now
    
    def record_request(
        self,
        allowed: bool,
        identifier: str,
        strategy: str,
        route: Optional[str] = None
    ):
        """
        Record a rate limit request.
        
        Args:
            allowed: Whether the request was allowed or limited
            identifier: The client identifier
            strategy: The rate limiting strategy used
            route: The route being accessed (optional)
        """
        self._rotate_buckets()
        
        with self.lock:
            # Update global metrics
            self.requests[self.current_bucket] += 1
            
            if allowed:
                self.allowed[self.current_bucket] += 1
            else:
                self.limited[self.current_bucket] += 1
                
            # Update by identifier metrics
            self.by_identifier[identifier]['requests'] += 1
            if allowed:
                self.by_identifier[identifier]['allowed'] += 1
            else:
                self.by_identifier[identifier]['limited'] += 1
                
            # Update by strategy metrics
            self.by_strategy[strategy]['requests'] += 1
            if allowed:
                self.by_strategy[strategy]['allowed'] += 1
            else:
                self.by_strategy[strategy]['limited'] += 1
                
            # Update by route metrics (if provided)
            if route:
                self.by_route[route]['requests'] += 1
                if allowed:
                    self.by_route[route]['allowed'] += 1
                else:
                    self.by_route[route]['limited'] += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get comprehensive metrics.
        
        Returns:
            Dictionary of metrics
        """
        self._rotate_buckets()
        
        with self.lock:
            # Calculate totals
            total_requests = sum(self.requests)
            total_limited = sum(self.limited)
            total_allowed = sum(self.allowed)
            
            # Calculate rate (requests per second)
            window_seconds = min(self.window_size, time.time() - self.last_update + self.window_size)
            rate = total_requests / window_seconds if window_seconds > 0 else 0
            
            # Get top limited identifiers
            top_limited = sorted(
                self.by_identifier.items(),
                key=lambda x: x[1]['limited'],
                reverse=True
            )[:10]
            
            # Get top accessed routes
            top_routes = sorted(
                self.by_route.items(),
                key=lambda x: x[1]['requests'],
                reverse=True
            )[:10]
            
            return {
                'total_requests': total_requests,
                'total_limited': total_limited,
                'total_allowed': total_allowed,
                'rate': rate,
                'limited_percent': (total_limited / total_requests * 100) if total_requests > 0 else 0,
                'by_strategy': dict(self.by_strategy),
                'top_limited': dict(top_limited),
                'top_routes': dict(top_routes),
                'window_size': self.window_size,
                'timestamp': time.time()
            }
    
    def reset(self):
        """Reset all metrics."""
        with self.lock:
            for i in range(self.buckets):
                self.requests[i] = 0
                self.limited[i] = 0
                self.allowed[i] = 0
                
            self.by_identifier.clear()
            self.by_strategy.clear()
            self.by_route.clear()
            self.last_update = time.time()


# Global metrics instance
global_metrics = RateLimitMetrics()


def record_request(
    allowed: bool,
    identifier: str,
    strategy: str,
    route: Optional[str] = None
):
    """
    Record a rate limit request in the global metrics.
    
    Args:
        allowed: Whether the request was allowed or limited
        identifier: The client identifier
        strategy: The rate limiting strategy used
        route: The route being accessed (optional)
    """
    global_metrics.record_request(allowed, identifier, strategy, route)


def get_metrics() -> Dict[str, Any]:
    """
    Get metrics from the global metrics collector.
    
    Returns:
        Dictionary of metrics
    """
    return global_metrics.get_metrics()


def reset_metrics():
    """Reset all global metrics."""
    global_metrics.reset()