"""
ConnectionPoolManager

Advanced connection pool manager with adaptive sizing and health monitoring
"""
import logging
import time
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime
import threading
from contextlib import contextmanager
from sqlalchemy import create_engine, text, inspect, func, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import SQLAlchemyError, OperationalError, DisconnectionError

# Configure logging
logger = logging.getLogger(__name__)

class ConnectionPoolManager:
    """
    Advanced connection pool manager with adaptive sizing and health monitoring
    
    Features:
    - Adaptive connection pool sizing based on load
    - Connection health monitoring and pruning
    - Automatic connection recovery
    - Comprehensive metrics collection
    - Multi-tenant connection isolation
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the connection pool manager.
        
        Args:
            config: Configuration dictionary with connection parameters
        """
        self.config = config
        self.engines = {}  # Multiple engines for tenant isolation if needed
        self.pool_metrics = {}
        self.health_check_interval = config.get('health_check_interval', 30)  # seconds
        self.last_error = None
        self.health_check_thread = None
        self.running = False
        
        # Default pool settings
        self.default_pool_size = config.get('pool_size', 5)
        self.default_max_overflow = config.get('max_overflow', 10)
        self.default_pool_timeout = config.get('pool_timeout', 30)
        self.default_pool_recycle = config.get('pool_recycle', 1800)
        
        # Initialize the connection pool
        self.initialize()
        
    def initialize(self):
        """Initialize the connection pool and start monitoring"""
        try:
            # Create default engine
            self._create_engine('default', self.config.get('database_url'))
            
            # Set up connection events
            self._setup_engine_events('default')
            
            # Start health check thread
            self._start_health_check_thread()
            
            logger.info("Connection pool manager initialized successfully")
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Failed to initialize connection pool: {str(e)}")
    
    def _create_engine(self, key: str, url: str):
        """
        Create a SQLAlchemy engine with optimized settings.
        
        Args:
            key: Key to identify the engine
            url: Database URL
        """
        # Calculate optimal pool size based on environment
        pool_size = self._calculate_optimal_pool_size()
        
        # Create engine with connection pooling
        engine_kwargs = {
            'poolclass': QueuePool,
            'pool_size': pool_size,
            'max_overflow': self.default_max_overflow,
            'pool_timeout': self.default_pool_timeout,
            'pool_recycle': self.default_pool_recycle,
            'pool_pre_ping': True,  # Check connection health before using
            'echo': self.config.get('echo_sql', False)
        }
        
        # Add SSL options if needed
        if self.config.get('ssl_required', False) and 'postgresql' in url:
            if '?' not in url:
                url = f"{url}?sslmode=require"
            elif 'sslmode=' not in url.lower():
                url = f"{url}&sslmode=require"
        
        # Create engine
        self.engines[key] = create_engine(url, **engine_kwargs)
        
        # Initialize metrics
        self.pool_metrics[key] = {
            'created_at': datetime.utcnow().isoformat(),
            'pool_size': pool_size,
            'max_overflow': self.default_max_overflow,
            'checkins': 0,
            'checkouts': 0,
            'connections_created': 0,
            'connections_invalidated': 0,
            'current_usage': 0,
            'peak_usage': 0,
            'errors': 0
        }
    
    def _setup_engine_events(self, key: str):
        """
        Set up SQLAlchemy event listeners for monitoring.
        
        Args:
            key: Engine key
        """
        engine = self.engines[key]
        
        @event.listens_for(engine, 'checkout')
        def on_checkout(dbapi_conn, conn_record, conn_proxy):
            self.pool_metrics[key]['checkouts'] += 1
            self.pool_metrics[key]['current_usage'] += 1
            if self.pool_metrics[key]['current_usage'] > self.pool_metrics[key]['peak_usage']:
                self.pool_metrics[key]['peak_usage'] = self.pool_metrics[key]['current_usage']
        
        @event.listens_for(engine, 'checkin')
        def on_checkin(dbapi_conn, conn_record):
            self.pool_metrics[key]['checkins'] += 1
            if self.pool_metrics[key]['current_usage'] > 0:
                self.pool_metrics[key]['current_usage'] -= 1
        
        @event.listens_for(engine, 'connect')
        def on_connect(dbapi_conn, conn_record):
            self.pool_metrics[key]['connections_created'] += 1
        
        @event.listens_for(engine, 'invalidate')
        def on_invalidate(dbapi_conn, conn_record, exc):
            self.pool_metrics[key]['connections_invalidated'] += 1
            if exc:
                self.pool_metrics[key]['errors'] += 1
                logger.warning(f"Connection invalidated due to error: {str(exc)}")
    
    def _calculate_optimal_pool_size(self) -> int:
        """
        Calculate optimal connection pool size based on environment.
        
        Returns:
            Recommended pool size
        """
        # Get available cores for better default pool sizing
        try:
            import multiprocessing
            cores = multiprocessing.cpu_count()
            # Formula: cores * 2 + 1 is a common starting point
            return min(cores * 2 + 1, self.default_pool_size)
        except Exception:
            # Fall back to configured default
            return self.default_pool_size
    
    def _start_health_check_thread(self):
        """Start background thread to perform health checks"""
        if self.health_check_thread and self.health_check_thread.is_alive():
            return
            
        self.running = True
        self.health_check_thread = threading.Thread(
            target=self._health_check_worker,
            daemon=True,
            name='ConnectionHealthChecker'
        )
        self.health_check_thread.start()
    
    def _health_check_worker(self):
        """Worker thread for periodic health checks"""
        while self.running:
            try:
                for key, engine in self.engines.items():
                    self._check_engine_health(key)
                
                # Adjust pool size if needed
                self._adjust_pool_sizes()
                
            except Exception as e:
                logger.error(f"Error in health check thread: {str(e)}")
                
            # Sleep until next check
            time.sleep(self.health_check_interval)
    
    def _check_engine_health(self, key: str):
        """
        Check health of a specific engine.
        
        Args:
            key: Engine key
        """
        engine = self.engines[key]
        
        try:
            # Create a test connection and run a simple query
            with engine.connect() as conn:
                conn.execute(text('SELECT 1'))
                
            # Update last successful health check time
            self.pool_metrics[key]['last_health_check'] = datetime.utcnow().isoformat()
            self.pool_metrics[key]['health_status'] = 'healthy'
            
        except Exception as e:
            logger.error(f"Health check failed for engine {key}: {str(e)}")
            self.pool_metrics[key]['health_status'] = 'unhealthy'
            self.pool_metrics[key]['last_error'] = str(e)
            
            # Try to recover the pool by letting SQLAlchemy recreate connections
            try:
                self.engines[key].dispose()
                logger.info(f"Engine {key} disposed and will be recreated on next use")
            except Exception as e2:
                logger.error(f"Failed to dispose engine {key}: {str(e2)}")
    
    def _adjust_pool_sizes(self):
        """Dynamically adjust pool sizes based on usage metrics"""
        for key, metrics in self.pool_metrics.items():
            if key not in self.engines:
                continue
                
            current_pool_size = metrics['pool_size']
            peak_usage = metrics['peak_usage']
            
            # If peak usage is consistently high (>80% of pool size)
            if peak_usage > current_pool_size * 0.8:
                # Increase pool size by 25%, up to max_overflow
                new_size = min(
                    int(current_pool_size * 1.25),
                    current_pool_size + self.default_max_overflow
                )
                
                if new_size > current_pool_size:
                    logger.info(f"Increasing pool size for {key} from {current_pool_size} to {new_size}")
                    self._resize_pool(key, new_size)
            
            # If peak usage is consistently low (<30% of pool size) and pool size > default
            elif peak_usage < current_pool_size * 0.3 and current_pool_size > self.default_pool_size:
                # Decrease pool size by 20%, but not below default
                new_size = max(
                    int(current_pool_size * 0.8),
                    self.default_pool_size
                )
                
                if new_size < current_pool_size:
                    logger.info(f"Decreasing pool size for {key} from {current_pool_size} to {new_size}")
                    self._resize_pool(key, new_size)
    
    def _resize_pool(self, key: str, new_size: int):
        """
        Resize the connection pool.
        
        Args:
            key: Engine key
            new_size: New pool size
        """
        # This requires recreating the engine
        if key not in self.engines:
            return
            
        # Get current engine URL and config
        engine = self.engines[key]
        url = engine.url
        
        # Dispose of current engine
        engine.dispose()
        
        # Create new engine with updated pool size
        engine_kwargs = {
            'poolclass': QueuePool,
            'pool_size': new_size,
            'max_overflow': self.default_max_overflow,
            'pool_timeout': self.default_pool_timeout,
            'pool_recycle': self.default_pool_recycle,
            'pool_pre_ping': True,
            'echo': self.config.get('echo_sql', False)
        }
        
        self.engines[key] = create_engine(url, **engine_kwargs)
        self._setup_engine_events(key)
        
        # Update metrics
        self.pool_metrics[key]['pool_size'] = new_size
        logger.info(f"Pool size for {key} updated to {new_size}")
        
    def get_session(self, tenant_id: str = None) -> Session:
        """
        Get a database session with proper tenant isolation.
        
        Args:
            tenant_id: Optional tenant ID for multi-tenant isolation
            
        Returns:
            SQLAlchemy Session object
        """
        # Use tenant-specific engine if available, otherwise use default
        engine_key = tenant_id if tenant_id and tenant_id in self.engines else 'default'
        
        # Create session
        SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engines[engine_key]
        )
        
        return SessionLocal()
    
    @contextmanager
    def session_scope(self, tenant_id: str = None):
        """
        Context manager for database sessions with automatic cleanup.
        
        Args:
            tenant_id: Optional tenant ID for multi-tenant isolation
            
        Yields:
            SQLAlchemy Session
        """
        session = self.get_session(tenant_id)
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            self.last_error = str(e)
            logger.error(f"Error in database session: {str(e)}")
            raise
        finally:
            session.close()
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive statistics about connection pools.
        
        Returns:
            Dict containing pool statistics
        """
        stats = {
            'component': 'ConnectionPoolManager',
            'timestamp': datetime.utcnow().isoformat(),
            'pools': self.pool_metrics,
            'last_error': self.last_error
        }
        
        # Add current state of each engine
        for key, engine in self.engines.items():
            if key in stats['pools']:
                pool = engine.pool
                stats['pools'][key].update({
                    'current_size': pool.size(),
                    'checkedout': pool.checkedout(),
                    'overflow': pool.overflow(),
                    'checkedin': pool.checkedin()
                })
        
        return stats
    
    def shutdown(self):
        """Gracefully shut down all connection pools"""
        self.running = False
        
        # Wait for health check thread to exit
        if self.health_check_thread and self.health_check_thread.is_alive():
            self.health_check_thread.join(timeout=2.0)
        
        # Dispose all engines
        for key, engine in self.engines.items():
            try:
                engine.dispose()
                logger.info(f"Engine {key} disposed")
            except Exception as e:
                logger.error(f"Error disposing engine {key}: {str(e)}")
        
        logger.info("Connection pool manager shut down")
