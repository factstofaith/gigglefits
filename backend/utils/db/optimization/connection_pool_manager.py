"""
Advanced connection pool monitoring and optimization for Docker environments.

This module provides Docker-specific connection monitoring utilities:
1. Connection pool statistics collection
2. Monitoring and reporting for database connections
3. Query performance tracking
4. Health metrics for container orchestration
"""

import logging
import time
import threading
from typing import Dict, List, Optional, Any, Deque
from datetime import datetime, timedelta
from collections import defaultdict, deque
import statistics

# Import database module
from db.base import get_engine, close_all_connections, _connection_stats
from core.config_factory import ConfigFactory

# Setup module logger
logger = logging.getLogger(__name__)

class ConnectionMonitor:
    """
    Monitors database connection usage and provides metrics for
    Docker container health checks and diagnostics.
    """
    
    def __init__(self, history_window: int = 60):
        """
        Initialize the connection monitor.
        
        Args:
            history_window: Number of seconds of history to retain for metrics
        """
        self.history_window = history_window
        self.lock = threading.RLock()
        
        # Store query execution times with timestamps
        self.query_times: Deque[tuple] = deque(maxlen=1000)
        
        # Store connection wait times
        self.wait_times: Deque[tuple] = deque(maxlen=1000)
        
        # Track database errors
        self.error_count = 0
        self.last_error_time: Optional[datetime] = None
        self.last_error_message: Optional[str] = None
        
        # Store query types for analysis
        self.query_types_count: Dict[str, int] = defaultdict(int)
        
        # Track slow queries
        self.slow_queries: List[Dict[str, Any]] = []
        self.slow_query_threshold = 1.0  # seconds
        
        # Track peak connection usage
        self.peak_connections = 0
        self.peak_connections_time: Optional[datetime] = None
        
        # Start time for uptime calculation
        self.start_time = datetime.now()
    
    def record_query(self, duration: float, query_type: str = "unknown") -> None:
        """
        Record a query execution for metrics collection.
        
        Args:
            duration: Query execution time in seconds
            query_type: Type of query (select, insert, update, delete, etc.)
        """
        with self.lock:
            now = datetime.now()
            self.query_times.append((now, duration))
            self.query_types_count[query_type] += 1
            
            # Track slow queries
            if duration > self.slow_query_threshold:
                self.slow_queries.append({
                    "timestamp": now.isoformat(),
                    "duration": duration,
                    "type": query_type
                })
                
                # Limit slow query history size
                if len(self.slow_queries) > 100:
                    self.slow_queries.pop(0)
    
    def record_wait_time(self, wait_time: float) -> None:
        """
        Record connection wait time.
        
        Args:
            wait_time: Time spent waiting for a connection in seconds
        """
        with self.lock:
            self.wait_times.append((datetime.now(), wait_time))
    
    def record_error(self, error_message: str) -> None:
        """
        Record a database error.
        
        Args:
            error_message: Error message
        """
        with self.lock:
            self.error_count += 1
            self.last_error_time = datetime.now()
            self.last_error_message = error_message
    
    def update_peak_connections(self) -> None:
        """Update peak connection count if current count is higher."""
        with self.lock:
            # Get current active connections from global stats
            active_connections = _connection_stats["checked_out"] - _connection_stats["checked_in"]
            
            if active_connections > self.peak_connections:
                self.peak_connections = active_connections
                self.peak_connections_time = datetime.now()
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get comprehensive database connection metrics.
        
        Returns:
            Dictionary of metrics
        """
        with self.lock:
            now = datetime.now()
            cutoff_time = now - timedelta(seconds=self.history_window)
            
            # Filter recent query times
            recent_query_times = [qt for dt, qt in self.query_times if dt >= cutoff_time]
            
            # Filter recent wait times
            recent_wait_times = [wt for dt, wt in self.wait_times if dt >= cutoff_time]
            
            # Statistics calculations
            query_time_stats = self._calculate_statistics(recent_query_times)
            wait_time_stats = self._calculate_statistics(recent_wait_times)
            
            # Get engine and pool statistics
            engine = get_engine()
            active_connections = _connection_stats["checked_out"] - _connection_stats["checked_in"]
            
            # Connection pool statistics
            pool_stats = {
                "active_connections": active_connections,
                "peak_connections": self.peak_connections,
                "peak_connections_time": self.peak_connections_time.isoformat() if self.peak_connections_time else None,
                "total_created": _connection_stats["created"],
                "total_checked_out": _connection_stats["checked_out"],
                "total_checked_in": _connection_stats["checked_in"],
                "errors": _connection_stats["errors"],
                "pool_size": engine.pool.size(),
                "pool_checkedin": engine.pool.checkedin(),
                "pool_overflow": engine.pool.overflow(),
                "pool_checkedout": engine.pool.checkedout(),
            }
            
            # Query performance statistics
            query_stats = {
                "total_queries": len(self.query_times),
                "recent_queries": len(recent_query_times),
                "query_types": dict(self.query_types_count),
                "query_times": query_time_stats,
                "slow_queries_count": len(self.slow_queries),
                "slow_query_threshold": self.slow_query_threshold,
            }
            
            # Connection pool performance
            connection_stats = {
                "wait_times": wait_time_stats,
                "errors": {
                    "count": self.error_count,
                    "last_error_time": self.last_error_time.isoformat() if self.last_error_time else None,
                    "last_error_message": self.last_error_message,
                }
            }
            
            # Docker-specific metrics
            docker_metrics = {}
            if ConfigFactory.is_docker():
                docker_metrics = {
                    "container_name": ConfigFactory.get_config().docker.CONTAINER_NAME,
                    "container_id": ConfigFactory.get_config().docker.CONTAINER_ID,
                }
            
            return {
                "timestamp": now.isoformat(),
                "uptime_seconds": (now - self.start_time).total_seconds(),
                "metrics_window_seconds": self.history_window,
                "pool": pool_stats,
                "queries": query_stats,
                "connections": connection_stats,
                "docker": docker_metrics,
                "database_type": engine.dialect.name,
            }
    
    def _calculate_statistics(self, values: List[float]) -> Dict[str, float]:
        """
        Calculate statistical metrics for a list of values.
        
        Args:
            values: List of values to analyze
            
        Returns:
            Dictionary of statistics
        """
        if not values:
            return {
                "count": 0,
                "min": 0,
                "max": 0,
                "mean": 0,
                "median": 0,
                "p95": 0,
                "p99": 0,
            }
        
        # Sort values for percentile calculations
        sorted_values = sorted(values)
        
        # Calculate percentiles
        p95_idx = int(len(sorted_values) * 0.95)
        p99_idx = int(len(sorted_values) * 0.99)
        
        try:
            return {
                "count": len(values),
                "min": min(values),
                "max": max(values),
                "mean": statistics.mean(values),
                "median": statistics.median(values),
                "p95": sorted_values[p95_idx] if p95_idx < len(sorted_values) else sorted_values[-1],
                "p99": sorted_values[p99_idx] if p99_idx < len(sorted_values) else sorted_values[-1],
            }
        except statistics.StatisticsError:
            # Handle empty sequences or other statistics errors
            return {
                "count": len(values),
                "min": min(values) if values else 0,
                "max": max(values) if values else 0,
                "mean": sum(values) / len(values) if values else 0,
                "median": sorted_values[len(sorted_values) // 2] if values else 0,
                "p95": sorted_values[p95_idx] if values and p95_idx < len(sorted_values) else 0,
                "p99": sorted_values[p99_idx] if values and p99_idx < len(sorted_values) else 0,
            }
    
    def get_health_status(self) -> Dict[str, Any]:
        """
        Get database health status for container health checks.
        
        Returns:
            Dictionary with health status information
        """
        with self.lock:
            # Get metrics
            metrics = self.get_metrics()
            
            # Determine overall health status
            is_healthy = True
            status_messages = []
            
            # Check for recent errors
            if self.last_error_time:
                error_age = (datetime.now() - self.last_error_time).total_seconds()
                if error_age < 60:  # Error in the last minute
                    is_healthy = False
                    status_messages.append(f"Recent database error: {self.last_error_message}")
            
            # Check active connections vs pool size
            pool_size = metrics["pool"]["pool_size"]
            active_connections = metrics["pool"]["active_connections"]
            if active_connections >= pool_size:
                is_healthy = False
                status_messages.append(f"Connection pool exhausted: {active_connections}/{pool_size}")
            
            # Check query response times
            if metrics["queries"]["query_times"]["count"] > 0:
                p95_query_time = metrics["queries"]["query_times"]["p95"]
                if p95_query_time > 1.0:  # P95 over 1 second
                    is_healthy = is_healthy and True  # Don't fail health check for slow queries
                    status_messages.append(f"Slow queries detected: P95={p95_query_time:.2f}s")
            
            # Create health status response
            status = "healthy" if is_healthy else "unhealthy"
            message = "Database connection pool is healthy" if is_healthy else "; ".join(status_messages)
            
            return {
                "status": status,
                "message": message,
                "timestamp": datetime.now().isoformat(),
                "docker": metrics["docker"],
                "connections": {
                    "active": metrics["pool"]["active_connections"],
                    "pool_size": metrics["pool"]["pool_size"],
                    "errors": metrics["connections"]["errors"]["count"],
                },
                "query_performance": {
                    "p95_query_time": metrics["queries"]["query_times"]["p95"],
                    "slow_queries_count": metrics["queries"]["slow_queries_count"],
                }
            }
    
    def reset(self) -> None:
        """Reset all metrics."""
        with self.lock:
            self.query_times.clear()
            self.wait_times.clear()
            self.error_count = 0
            self.last_error_time = None
            self.last_error_message = None
            self.query_types_count.clear()
            self.slow_queries.clear()
            self.peak_connections = 0
            self.peak_connections_time = None
            self.start_time = datetime.now()

# Create a singleton instance of the connection monitor
connection_monitor = ConnectionMonitor()

# Function to get database metrics
def get_db_metrics() -> Dict[str, Any]:
    """
    Get database connection metrics.
    
    Returns:
        Dictionary of metrics
    """
    connection_monitor.update_peak_connections()
    return connection_monitor.get_metrics()

# Function to get database health status
def get_db_health_status() -> Dict[str, Any]:
    """
    Get database health status.
    
    Returns:
        Dictionary with health status
    """
    connection_monitor.update_peak_connections()
    return connection_monitor.get_health_status()

# Function to record a database query
def record_db_query(duration: float, query_type: str = "unknown") -> None:
    """
    Record a database query for metrics collection.
    
    Args:
        duration: Query execution time in seconds
        query_type: Type of query (select, insert, update, delete, etc.)
    """
    connection_monitor.record_query(duration, query_type)

# Function to record a database error
def record_db_error(error_message: str) -> None:
    """
    Record a database error.
    
    Args:
        error_message: Error message
    """
    connection_monitor.record_error(error_message)

# Register with signal handlers for container shutdown
def register_db_optimizations() -> None:
    """Register optimizations with signal handlers for container shutdown."""
    try:
        # Import here to avoid circular imports
        from utils.signal_handlers import register_shutdown_handler
        
        # Register metrics collection in shutdown handler
        def log_db_metrics_on_shutdown():
            """Log database metrics on shutdown."""
            metrics = get_db_metrics()
            logger.info(f"Database metrics at shutdown: active={metrics['pool']['active_connections']}, "
                      f"total={metrics['pool']['total_created']}, "
                      f"errors={metrics['connections']['errors']['count']}")
        
        register_shutdown_handler("db_metrics", log_db_metrics_on_shutdown)
        logger.info("Registered database metrics collection for shutdown")
        
        # Register the main connection closing function
        register_shutdown_handler("db_connections", close_all_connections)
        logger.info("Registered database connection cleanup for shutdown")
        
    except ImportError:
        logger.warning("Could not register database optimizations: signal_handlers module not found")
    except Exception as e:
        logger.error(f"Error registering database optimizations: {str(e)}")

# Initialize optimizations on module import
if ConfigFactory.is_docker():
    register_db_optimizations()