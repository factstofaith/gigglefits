"""
Advanced connection pool management with auto-scaling based on workload patterns.
The ConnectionPoolManager provides dynamic pool sizing, intelligent connection distribution,
comprehensive monitoring, and tenant isolation capabilities.
"""

import logging
import time
import threading
import math
from typing import Dict, List, Optional, Tuple, Any, Set
from datetime import datetime, timedelta
from sqlalchemy import create_engine, event, inspect
from sqlalchemy.engine import Engine, Connection
from sqlalchemy.pool import QueuePool
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError, OperationalError, DisconnectionError
from contextlib import contextmanager
import threading
from collections import deque, defaultdict

# Import settings from core config
from core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

class ConnectionMetricsCollector:
    """
    Collects and analyzes connection usage metrics to optimize pool sizing.
    
    This class monitors connection utilization, wait times, and execution patterns
    to provide insights for dynamic connection pool scaling.
    """
    
    def __init__(self, history_window: int = 60):
        """
        Initialize the metrics collector.
        
        Args:
            history_window: Number of seconds to keep in the sliding window for analysis
        """
        self.history_window = history_window
        self.lock = threading.RLock()
        
        # Metrics for connections
        self.checkout_times: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.execution_times: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.wait_times: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.queue_sizes: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        
        # Connection usage metrics
        self.connections_in_use: Dict[str, int] = defaultdict(int)
        self.peak_connections: Dict[str, int] = defaultdict(int)
        self.total_checkouts: Dict[str, int] = defaultdict(int)
        self.total_checkins: Dict[str, int] = defaultdict(int)
        self.connection_timeouts: Dict[str, int] = defaultdict(int)
        self.connection_errors: Dict[str, int] = defaultdict(int)
        
        # Query metrics
        self.query_counts: Dict[str, int] = defaultdict(int)
        self.query_durations: Dict[str, List[float]] = defaultdict(list)
        
        # Tenant-specific metrics
        self.tenant_request_counts: Dict[str, int] = defaultdict(int)
        self.tenant_avg_query_times: Dict[str, float] = defaultdict(float)
        
        # Start time for metrics
        self.start_time = datetime.now()
        
    def record_checkout(self, tenant_id: str, wait_time: float, queue_size: int) -> None:
        """
        Record a connection checkout event.
        
        Args:
            tenant_id: The tenant identifier (or 'default' if not multi-tenant)
            wait_time: Time spent waiting for a connection in seconds
            queue_size: Current size of the connection request queue
        """
        with self.lock:
            self.wait_times[tenant_id].append((datetime.now(), wait_time))
            self.queue_sizes[tenant_id].append((datetime.now(), queue_size))
            self.connections_in_use[tenant_id] += 1
            self.total_checkouts[tenant_id] += 1
            
            # Update peak connection count if needed
            if self.connections_in_use[tenant_id] > self.peak_connections[tenant_id]:
                self.peak_connections[tenant_id] = self.connections_in_use[tenant_id]
    
    def record_checkin(self, tenant_id: str, checkout_time: float) -> None:
        """
        Record a connection check-in event.
        
        Args:
            tenant_id: The tenant identifier (or 'default' if not multi-tenant)
            checkout_time: Total time the connection was checked out, in seconds
        """
        with self.lock:
            self.checkout_times[tenant_id].append((datetime.now(), checkout_time))
            self.connections_in_use[tenant_id] = max(0, self.connections_in_use[tenant_id] - 1)
            self.total_checkins[tenant_id] += 1
    
    def record_query(self, tenant_id: str, duration: float) -> None:
        """
        Record a query execution.
        
        Args:
            tenant_id: The tenant identifier (or 'default' if not multi-tenant)
            duration: Time taken to execute the query in seconds
        """
        with self.lock:
            self.query_counts[tenant_id] += 1
            self.query_durations[tenant_id].append(duration)
            
            # Update tenant-specific metrics
            self.tenant_request_counts[tenant_id] += 1
            
            # Calculate rolling average query time
            count = len(self.query_durations[tenant_id])
            if count > 0:
                self.tenant_avg_query_times[tenant_id] = sum(self.query_durations[tenant_id]) / count
    
    def record_execution_time(self, tenant_id: str, execution_time: float) -> None:
        """
        Record execution time for a database operation.
        
        Args:
            tenant_id: The tenant identifier (or 'default' if not multi-tenant)
            execution_time: Time taken to execute the operation in seconds
        """
        with self.lock:
            self.execution_times[tenant_id].append((datetime.now(), execution_time))
    
    def record_timeout(self, tenant_id: str) -> None:
        """
        Record a connection timeout event.
        
        Args:
            tenant_id: The tenant identifier (or 'default' if not multi-tenant)
        """
        with self.lock:
            self.connection_timeouts[tenant_id] += 1
    
    def record_error(self, tenant_id: str) -> None:
        """
        Record a connection error event.
        
        Args:
            tenant_id: The tenant identifier (or 'default' if not multi-tenant)
        """
        with self.lock:
            self.connection_errors[tenant_id] += 1
    
    def get_metrics(self, tenant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get metrics for analysis and reporting.
        
        Args:
            tenant_id: The tenant identifier to filter by (None for all tenants)
            
        Returns:
            Dictionary of connection pool metrics
        """
        with self.lock:
            if tenant_id:
                return self._get_tenant_metrics(tenant_id)
            
            # Collect metrics for all tenants
            all_metrics = {
                'global': {
                    'total_tenants': len(self.tenant_request_counts),
                    'total_connections_in_use': sum(self.connections_in_use.values()),
                    'total_peak_connections': sum(self.peak_connections.values()),
                    'total_checkouts': sum(self.total_checkouts.values()),
                    'total_checkins': sum(self.total_checkins.values()),
                    'total_timeouts': sum(self.connection_timeouts.values()),
                    'total_errors': sum(self.connection_errors.values()),
                    'total_queries': sum(self.query_counts.values()),
                    'uptime_seconds': (datetime.now() - self.start_time).total_seconds()
                },
                'tenants': {}
            }
            
            # Add per-tenant metrics
            for tenant in self.tenant_request_counts.keys():
                all_metrics['tenants'][tenant] = self._get_tenant_metrics(tenant)
                
            return all_metrics
    
    def _get_tenant_metrics(self, tenant_id: str) -> Dict[str, Any]:
        """Get metrics for a specific tenant."""
        now = datetime.now()
        cutoff_time = now - timedelta(seconds=self.history_window)
        
        # Filter metrics within the recent window
        recent_wait_times = [wt for dt, wt in self.wait_times.get(tenant_id, []) 
                            if dt >= cutoff_time]
        recent_checkout_times = [ct for dt, ct in self.checkout_times.get(tenant_id, []) 
                                if dt >= cutoff_time]
        recent_execution_times = [et for dt, et in self.execution_times.get(tenant_id, []) 
                                 if dt >= cutoff_time]
        recent_queue_sizes = [qs for dt, qs in self.queue_sizes.get(tenant_id, []) 
                             if dt >= cutoff_time]
        
        # Calculate averages
        avg_wait_time = sum(recent_wait_times) / max(1, len(recent_wait_times))
        avg_checkout_time = sum(recent_checkout_times) / max(1, len(recent_checkout_times))
        avg_execution_time = sum(recent_execution_times) / max(1, len(recent_execution_times))
        avg_queue_size = sum(recent_queue_sizes) / max(1, len(recent_queue_sizes))
        
        # Get p95 (95th percentile) metrics
        p95_wait_time = self._percentile(recent_wait_times, 95)
        p95_checkout_time = self._percentile(recent_checkout_times, 95)
        p95_execution_time = self._percentile(recent_execution_times, 95)
        
        return {
            'connections_in_use': self.connections_in_use.get(tenant_id, 0),
            'peak_connections': self.peak_connections.get(tenant_id, 0),
            'total_checkouts': self.total_checkouts.get(tenant_id, 0),
            'total_checkins': self.total_checkins.get(tenant_id, 0),
            'connection_timeouts': self.connection_timeouts.get(tenant_id, 0),
            'connection_errors': self.connection_errors.get(tenant_id, 0),
            'query_count': self.query_counts.get(tenant_id, 0),
            'avg_query_time': self.tenant_avg_query_times.get(tenant_id, 0),
            'avg_wait_time': avg_wait_time,
            'avg_checkout_time': avg_checkout_time,
            'avg_execution_time': avg_execution_time,
            'avg_queue_size': avg_queue_size,
            'p95_wait_time': p95_wait_time,
            'p95_checkout_time': p95_checkout_time,
            'p95_execution_time': p95_execution_time,
            'recent_metrics_window_seconds': self.history_window
        }
    
    def _percentile(self, data: List[float], percentile: int) -> float:
        """
        Calculate percentile value from a list of values.
        
        Args:
            data: List of values
            percentile: Percentile to calculate (0-100)
            
        Returns:
            Percentile value
        """
        if not data:
            return 0.0
            
        sorted_data = sorted(data)
        idx = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(idx, len(sorted_data) - 1)]
    
    def get_pool_sizing_recommendation(self, tenant_id: str) -> Dict[str, Any]:
        """
        Get recommendation for optimal pool size based on collected metrics.
        
        Args:
            tenant_id: The tenant identifier
            
        Returns:
            Dictionary with pool sizing recommendations
        """
        metrics = self._get_tenant_metrics(tenant_id)
        
        # Calculate recommended pool size based on usage patterns
        current_pool_size = metrics['peak_connections']
        avg_wait = metrics['avg_wait_time']
        avg_checkout = metrics['avg_checkout_time']
        p95_wait = metrics['p95_wait_time']
        
        # Initial recommendation based on current peak plus a buffer
        # with adjustments for wait times and checkout durations
        
        # More waiting indicates more connections needed
        wait_factor = 1.0
        if avg_wait > 0.1:  # If waiting more than 100ms on average
            wait_factor = 1.0 + min(2.0, avg_wait)  # Cap at 3x
            
        # Long checkout times mean connections are efficiently utilized
        # but might need more if the checkout time is very high
        checkout_factor = 1.0
        if avg_checkout > 1.0:  # If checkouts last more than 1 second
            checkout_factor = 1.0 + min(0.5, avg_checkout / 10)  # Cap at 1.5x
            
        # P95 wait time shows if there are occasional spikes that need handling
        spike_factor = 1.0
        if p95_wait > 0.5:  # If 5% of waits are over 500ms
            spike_factor = 1.0 + min(0.5, p95_wait / 5)  # Cap at 1.5x
        
        # Calculate recommendation with combined factors
        combined_factor = max(wait_factor, checkout_factor, spike_factor)
        recommended_min = max(5, int(current_pool_size * combined_factor))
        
        # Calculate optimal max_overflow based on observed spikes
        recommended_overflow = max(5, int(recommended_min * 0.5))
        
        return {
            'current_peak_connections': current_pool_size,
            'recommended_pool_size': recommended_min,
            'recommended_max_overflow': recommended_overflow,
            'recommendation_factors': {
                'wait_factor': wait_factor,
                'checkout_factor': checkout_factor,
                'spike_factor': spike_factor,
                'combined_factor': combined_factor
            },
            'metrics_used': {
                'avg_wait_time': avg_wait,
                'avg_checkout_time': avg_checkout,
                'p95_wait_time': p95_wait
            }
        }
    
    def clear_metrics(self) -> None:
        """Clear all collected metrics."""
        with self.lock:
            self.checkout_times.clear()
            self.execution_times.clear()
            self.wait_times.clear()
            self.queue_sizes.clear()
            self.connections_in_use.clear()
            self.peak_connections.clear()
            self.total_checkouts.clear()
            self.total_checkins.clear()
            self.connection_timeouts.clear()
            self.connection_errors.clear()
            self.query_counts.clear()
            self.query_durations.clear()
            self.tenant_request_counts.clear()
            self.tenant_avg_query_times.clear()
            self.start_time = datetime.now()


class ConnectionPoolManager:
    """
    Advanced connection pool manager with auto-scaling and tenant isolation.
    
    Features:
    - Dynamic pool sizing based on workload patterns
    - Per-tenant connection isolation
    - Automatic health checking and pruning of stale connections
    - Comprehensive metrics collection and monitoring
    - Connection lifecycle optimization
    """
    
    def __init__(
        self,
        db_url: str = None,
        min_pool_size: int = None,
        max_pool_size: int = None,
        max_overflow: int = None,
        pool_timeout: int = None,
        pool_recycle: int = None,
        pool_pre_ping: bool = True,
        enable_tenant_isolation: bool = True,
        enable_auto_scaling: bool = True,
        metrics_window: int = 60,
        scaling_check_interval: int = 300,
        echo: bool = False
    ):
        """
        Initialize the connection pool manager.
        
        Args:
            db_url: Database connection URL (defaults to settings.DATABASE_URL)
            min_pool_size: Minimum pool size (defaults to settings.DB_POOL_SIZE)
            max_pool_size: Maximum pool size for auto-scaling
            max_overflow: Maximum overflow connections (defaults to settings.DB_MAX_OVERFLOW)
            pool_timeout: Connection timeout in seconds (defaults to settings.DB_POOL_TIMEOUT)
            pool_recycle: Connection recycle time in seconds (defaults to 1800)
            pool_pre_ping: Whether to enable connection health checks
            enable_tenant_isolation: Whether to create separate pools for each tenant
            enable_auto_scaling: Whether to enable automatic pool size scaling
            metrics_window: Window size in seconds for metrics collection
            scaling_check_interval: Interval in seconds to check and adjust pool sizes
            echo: Whether to log SQL statements
        """
        # Use settings as defaults if not specified
        self.db_url = db_url or settings.DATABASE_URL
        self.min_pool_size = min_pool_size or settings.DB_POOL_SIZE
        self.max_pool_size = max_pool_size or min(settings.DB_POOL_SIZE * 3, 30)
        self.max_overflow = max_overflow or settings.DB_MAX_OVERFLOW
        self.pool_timeout = pool_timeout or settings.DB_POOL_TIMEOUT
        self.pool_recycle = pool_recycle or 1800
        self.pool_pre_ping = pool_pre_ping
        self.enable_tenant_isolation = enable_tenant_isolation
        self.enable_auto_scaling = enable_auto_scaling
        self.echo = echo or settings.ENABLE_SQL_LOGGING
        
        # Create metrics collector
        self.metrics = ConnectionMetricsCollector(history_window=metrics_window)
        
        # Lock for thread safety
        self.lock = threading.RLock()
        
        # Dictionary to store tenant-specific engines
        self.engines: Dict[str, Engine] = {}
        
        # Dictionary to store tenant-specific session factories
        self.session_factories: Dict[str, sessionmaker] = {}
        
        # Dictionary to track active connections per tenant
        self.active_connections: Dict[str, Set[Connection]] = defaultdict(set)
        
        # Track connection checkout times for usage metrics
        self.connection_checkout_times: Dict[Connection, float] = {}
        
        # Check active tenants and their pool health
        self.active_tenants: Set[str] = set()
        
        # Set up initial engine for default connections
        self._create_engine('default')
        
        # Start auto-scaling thread if enabled
        if self.enable_auto_scaling:
            self.scaling_thread = threading.Thread(
                target=self._auto_scaling_worker,
                args=(scaling_check_interval,),
                daemon=True
            )
            self.scaling_thread.start()
            logger.info(f"Started auto-scaling thread with {scaling_check_interval}s interval")
    
    def _create_engine(self, tenant_id: str) -> Engine:
        """
        Create a SQLAlchemy engine for a specific tenant.
        
        Args:
            tenant_id: The tenant identifier
            
        Returns:
            SQLAlchemy Engine instance
        """
        with self.lock:
            if tenant_id in self.engines:
                return self.engines[tenant_id]
            
            # Create engine with connection pooling
            engine_kwargs = {
                'pool_size': self.min_pool_size,
                'max_overflow': self.max_overflow,
                'pool_timeout': self.pool_timeout,
                'pool_recycle': self.pool_recycle,
                'pool_pre_ping': self.pool_pre_ping,
                'echo': self.echo,
                'poolclass': QueuePool
            }
            
            # Add SSL options if required
            if settings.DB_SSL_REQUIRED and 'postgresql' in self.db_url:
                db_url = self.db_url
                if '?' not in self.db_url:
                    db_url = f"{self.db_url}?sslmode=require"
                elif 'sslmode=' not in self.db_url.lower():
                    db_url = f"{self.db_url}&sslmode=require"
            else:
                db_url = self.db_url
            
            # Create engine
            engine = create_engine(db_url, **engine_kwargs)
            self.engines[tenant_id] = engine
            
            # Add event listeners for connection pool monitoring
            self._setup_engine_events(engine, tenant_id)
            
            # Create session factory
            self.session_factories[tenant_id] = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=engine
            )
            
            # Add tenant to active tenants
            self.active_tenants.add(tenant_id)
            
            logger.info(f"Created database engine for tenant: {tenant_id}")
            return engine
    
    def _setup_engine_events(self, engine: Engine, tenant_id: str) -> None:
        """
        Set up event listeners for engine to collect metrics.
        
        Args:
            engine: SQLAlchemy Engine instance
            tenant_id: The tenant identifier
        """
        # Track connection checkout time
        @event.listens_for(engine, "checkout")
        def on_checkout(dbapi_conn, conn_record, conn_proxy):
            # Record start time for connection usage tracking
            conn_proxy._connection_checkout_time = time.time()
            
            # Record metrics for this checkout
            wait_time = getattr(conn_proxy, "_checkout_wait_time", 0)
            queue_size = len(engine.pool._queue)
            self.metrics.record_checkout(tenant_id, wait_time, queue_size)
            
            # Add to active connections
            with self.lock:
                self.active_connections[tenant_id].add(conn_proxy)
        
        # Track connection checkin time and collect usage metrics
        @event.listens_for(engine, "checkin")
        def on_checkin(dbapi_conn, conn_record):
            # Find the proxy connection to get checkout time
            proxy = None
            with self.lock:
                for conn in self.active_connections[tenant_id].copy():
                    if getattr(conn, '_checkout_wait_time', None) is not None:
                        proxy = conn
                        self.active_connections[tenant_id].remove(conn)
                        break
            
            if proxy and hasattr(proxy, "_connection_checkout_time"):
                checkout_duration = time.time() - proxy._connection_checkout_time
                self.metrics.record_checkin(tenant_id, checkout_duration)
        
        # Track connection creation for pool sizing
        @event.listens_for(engine, "connect")
        def on_connect(dbapi_conn, conn_record):
            logger.debug(f"New database connection created for tenant: {tenant_id}")
        
        # Track connection disconnection
        @event.listens_for(engine, "close")
        def on_close(dbapi_conn, conn_record):
            logger.debug(f"Database connection closed for tenant: {tenant_id}")
        
        # Track connection invalidation (errors)
        @event.listens_for(engine, "invalidate")
        def on_invalidate(dbapi_conn, conn_record, exception):
            logger.warning(f"Database connection invalidated for tenant {tenant_id}: {exception}")
            self.metrics.record_error(tenant_id)
        
        # Track before_execute to measure query performance
        @event.listens_for(engine, "before_execute")
        def before_execute(conn, clauseelement, multiparams, params):
            conn.info.setdefault('query_start_time', time.time())
        
        # Track after_execute to measure query performance
        @event.listens_for(engine, "after_execute")
        def after_execute(conn, clauseelement, multiparams, params, result):
            if 'query_start_time' in conn.info:
                execution_time = time.time() - conn.info['query_start_time']
                self.metrics.record_query(tenant_id, execution_time)
                self.metrics.record_execution_time(tenant_id, execution_time)
                conn.info['query_start_time'] = None
        
        # Register pool events
        @event.listens_for(engine.pool, "checkout")
        def pool_checkout(dbapi_connection, connection_record, connection_proxy):
            # Calculate actual wait time in the queue
            wait_start = getattr(connection_proxy, "_wait_start_time", None)
            if wait_start:
                wait_time = time.time() - wait_start
                connection_proxy._checkout_wait_time = wait_time
        
        @event.listens_for(engine.pool, "first_connect")
        def pool_first_connect(dbapi_connection, connection_record):
            logger.info(f"First connection established for tenant: {tenant_id}")
        
        @event.listens_for(engine.pool, "connect")
        def pool_connect(dbapi_connection, connection_record):
            # Check if the connection is valid
            cursor = dbapi_connection.cursor()
            try:
                cursor.execute("SELECT 1")
                cursor.fetchall()
                logger.debug(f"Connection verified as valid for tenant: {tenant_id}")
            except Exception as e:
                logger.error(f"Connection validation failed for tenant {tenant_id}: {str(e)}")
                self.metrics.record_error(tenant_id)
                raise
            finally:
                cursor.close()
    
    def _auto_scaling_worker(self, check_interval: int) -> None:
        """
        Background worker to periodically check and adjust pool sizes.
        
        Args:
            check_interval: Time in seconds between checks
        """
        while True:
            try:
                # Sleep first to allow initial metrics collection
                time.sleep(check_interval)
                
                # Get recommendations for each tenant and adjust pool sizes
                for tenant_id in self.active_tenants:
                    if tenant_id not in self.engines:
                        continue
                        
                    engine = self.engines[tenant_id]
                    recommendation = self.metrics.get_pool_sizing_recommendation(tenant_id)
                    
                    # Check if we need to adjust the pool size
                    recommended_size = recommendation['recommended_pool_size']
                    current_size = engine.pool.size()
                    
                    # Only adjust if the recommendation is significantly different
                    if abs(recommended_size - current_size) >= max(3, int(current_size * 0.2)):
                        new_size = min(self.max_pool_size, recommended_size)
                        new_overflow = recommendation['recommended_max_overflow']
                        
                        logger.info(
                            f"Auto-scaling pool for tenant {tenant_id}: "
                            f"current={current_size}, recommended={recommended_size}, "
                            f"new_size={new_size}, new_overflow={new_overflow}"
                        )
                        
                        # Recreate engine with new pool size
                        # This is a soft adjustment that will take effect over time
                        with self.lock:
                            # Update engine configuration
                            engine.pool._pool.maxsize = new_size
                            engine.pool._max_overflow = new_overflow
                            
                            # No need to recreate the engine as we've adjusted the underlying pool
                            # The pool will adjust over time as connections are recycled
                    
                # Log current metrics summary
                metrics = self.metrics.get_metrics()
                logger.debug(f"Connection pool metrics: {metrics['global']}")
                
            except Exception as e:
                logger.error(f"Error in auto-scaling worker: {str(e)}")
    
    def get_engine(self, tenant_id: str = 'default') -> Engine:
        """
        Get a SQLAlchemy engine for a specific tenant.
        
        Args:
            tenant_id: The tenant identifier (default: 'default')
            
        Returns:
            SQLAlchemy Engine instance
        """
        # Use default tenant if tenant isolation is disabled
        if not self.enable_tenant_isolation:
            tenant_id = 'default'
            
        # Create engine if it doesn't exist
        if tenant_id not in self.engines:
            return self._create_engine(tenant_id)
            
        return self.engines[tenant_id]
    
    def get_session_maker(self, tenant_id: str = 'default') -> sessionmaker:
        """
        Get a SQLAlchemy sessionmaker for a specific tenant.
        
        Args:
            tenant_id: The tenant identifier (default: 'default')
            
        Returns:
            SQLAlchemy sessionmaker instance
        """
        # Use default tenant if tenant isolation is disabled
        if not self.enable_tenant_isolation:
            tenant_id = 'default'
            
        # Create engine and session factory if needed
        if tenant_id not in self.session_factories:
            self._create_engine(tenant_id)
            
        return self.session_factories[tenant_id]
    
    @contextmanager
    def session_scope(self, tenant_id: str = 'default') -> Generator[Session, None, None]:
        """
        Context manager for database sessions with automatic commit/rollback.
        
        Args:
            tenant_id: The tenant identifier (default: 'default')
            
        Yields:
            SQLAlchemy Session instance
        """
        # Get session maker for the tenant
        session_maker = self.get_session_maker(tenant_id)
        session = session_maker()
        
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error for tenant {tenant_id}: {str(e)}")
            self.metrics.record_error(tenant_id)
            raise
        finally:
            session.close()
    
    def health_check(self, tenant_id: str = 'default') -> Dict[str, Any]:
        """
        Perform a health check on the connection pool.
        
        Args:
            tenant_id: The tenant identifier (default: 'default')
            
        Returns:
            Dictionary with health check results
        """
        if not self.enable_tenant_isolation:
            tenant_id = 'default'
            
        if tenant_id not in self.engines:
            return {
                'status': 'unknown',
                'message': f"No engine found for tenant: {tenant_id}"
            }
            
        engine = self.engines[tenant_id]
        
        try:
            # Check pool status
            pool_status = {
                'pool_size': engine.pool.size(),
                'checkedin': engine.pool.checkedin(),
                'overflow': engine.pool.overflow(),
                'checkedout': engine.pool.checkedout(),
            }
            
            # Check connection by executing a simple query
            with engine.connect() as conn:
                conn.execute("SELECT 1").fetchall()
                
            # Get metrics
            metrics = self.metrics.get_metrics(tenant_id)
            
            return {
                'status': 'healthy',
                'message': 'Database connection pool is healthy',
                'pool_status': pool_status,
                'tenant_id': tenant_id,
                'metrics': {
                    'connections_in_use': metrics['connections_in_use'],
                    'peak_connections': metrics['peak_connections'],
                    'avg_wait_time': metrics['avg_wait_time'],
                    'p95_wait_time': metrics['p95_wait_time'],
                }
            }
        except Exception as e:
            logger.error(f"Health check failed for tenant {tenant_id}: {str(e)}")
            self.metrics.record_error(tenant_id)
            
            return {
                'status': 'unhealthy',
                'message': f"Database connection failed: {str(e)}",
                'tenant_id': tenant_id,
                'error': str(e)
            }
    
    def get_metrics(self, tenant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get metrics for the connection pool.
        
        Args:
            tenant_id: The tenant identifier (None for all tenants)
            
        Returns:
            Dictionary with connection pool metrics
        """
        return self.metrics.get_metrics(tenant_id)
    
    def reset_metrics(self) -> None:
        """Reset all collected metrics."""
        self.metrics.clear_metrics()
    
    def prune_stale_connections(self, tenant_id: Optional[str] = None) -> int:
        """
        Prune stale connections that have been idle for too long.
        
        Args:
            tenant_id: The tenant identifier (None for all tenants)
            
        Returns:
            Number of connections pruned
        """
        tenants_to_check = [tenant_id] if tenant_id else self.active_tenants
        total_pruned = 0
        
        for tid in tenants_to_check:
            if tid not in self.engines:
                continue
                
            engine = self.engines[tid]
            
            try:
                # Force connection cleanup by setting recycle time to 0 temporarily
                old_recycle = engine.pool._recycle
                engine.pool._recycle = 0
                
                # Prune idle connections
                pruned = engine.pool._do_return_conn(None)
                total_pruned += pruned
                
                # Restore original recycle time
                engine.pool._recycle = old_recycle
                
                if pruned > 0:
                    logger.info(f"Pruned {pruned} stale connections for tenant {tid}")
            except Exception as e:
                logger.error(f"Error pruning connections for tenant {tid}: {str(e)}")
        
        return total_pruned
    
    def dispose(self, tenant_id: Optional[str] = None) -> None:
        """
        Dispose of engines and connection pools.
        
        Args:
            tenant_id: The tenant identifier (None for all tenants)
        """
        with self.lock:
            if tenant_id:
                if tenant_id in self.engines:
                    self.engines[tenant_id].dispose()
                    del self.engines[tenant_id]
                    del self.session_factories[tenant_id]
                    self.active_tenants.discard(tenant_id)
                    logger.info(f"Disposed database engine for tenant: {tenant_id}")
            else:
                # Dispose all engines
                for tid, engine in self.engines.items():
                    engine.dispose()
                    logger.info(f"Disposed database engine for tenant: {tid}")
                self.engines.clear()
                self.session_factories.clear()
                self.active_tenants.clear()
    
    def __del__(self):
        """Dispose all engines when the manager is deleted."""
        try:
            self.dispose()
        except:
            pass